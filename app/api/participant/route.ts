/**
 * app/api/participant/route.ts
 * POST — Create a new participant record (called on consent submit).
 *   - Assigns condition, topic, testSet via deterministic roster formula (TOPICS.md §4).
 *   - Backed by an atomic Postgres UPDATE ... RETURNING counter.
 *   - Sets ps_pid and ps_stage HttpOnly cookies.
 *   - Records consent_at and opens the 'consent' stage_time row.
 *   - Returns { participantId } — client only receives the ID, never condition/topic/set.
 *
 * DELETE — Withdraw: deletes all participant data (cascade) and clears cookies.
 */

import { supabase } from "@/lib/supabase";
import { setSession, clearSession, getParticipantId } from "@/lib/session";
import { assignRoster } from "@/lib/roster";

export async function POST() {
  try {
    const { n, condition, topic, testSet } = await assignRoster();
    const now = new Date().toISOString();

    // Try creating participant record with dedicated columns
    let { data: participant, error } = await supabase
      .from("participants")
      .insert({
        condition,
        topic,
        roster_n: n,
        consent_at: now,
        stage: "background",
        user_agent: null, // we don't store IPs; UA is optional
      })
      .select("id")
      .single();

    // If migration 002 has not been applied to Supabase yet, save topic/roster_n in background jsonb
    if (error && (error.code === "42703" || error.message?.includes("column"))) {
      console.warn(
        "[participant] 'topic' column not found on participants table. " +
        "Saving in background jsonb until migration 002_topics_and_roster.sql is executed."
      );
      const fallback = await supabase
        .from("participants")
        .insert({
          condition,
          consent_at: now,
          stage: "background",
          user_agent: null,
          background: { topic, roster_n: n },
        })
        .select("id")
        .single();

      participant = fallback.data;
      error = fallback.error;
    }

    if (error || !participant) {
      console.error("Failed to create participant:", error);
      return Response.json({ error: "Failed to create participant" }, { status: 500 });
    }

    // Open stage_times for 'consent' (already past) and 'background' (current)
    await supabase.from("stage_times").insert([
      { participant_id: participant.id, stage: "consent",    started_at: now, ended_at: now },
      { participant_id: participant.id, stage: "background", started_at: now },
    ]);

    // Set both cookies
    await setSession(participant.id, "background");

    return Response.json({ participantId: participant.id.substring(0, 8).toUpperCase() });
  } catch (err) {
    console.error("POST /api/participant error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const pid = await getParticipantId();
    if (!pid) {
      return Response.json({ error: "No session" }, { status: 400 });
    }

    // Delete participant record — cascades to all child tables
    const { error } = await supabase
      .from("participants")
      .delete()
      .eq("id", pid);

    if (error) {
      console.error("Failed to delete participant:", error);
      return Response.json({ error: "Failed to withdraw" }, { status: 500 });
    }

    await clearSession();
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/participant error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
