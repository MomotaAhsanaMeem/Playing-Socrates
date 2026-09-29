/**
 * app/api/participant/route.ts
 * POST — Create a new participant record (called on consent submit).
 *   - Assigns condition via balanced block randomisation (blocks of 3).
 *   - Sets ps_pid and ps_stage HttpOnly cookies.
 *   - Records consent_at and opens the 'consent' stage_time row.
 *   - Returns { participantId } — client only receives the ID, never the condition.
 *
 * DELETE — Withdraw: deletes all participant data (cascade) and clears cookies.
 */

import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { setSession, clearSession, getParticipantId } from "@/lib/session";
import { STUDY_CONFIG } from "@/config/study";

const CONDITIONS = STUDY_CONFIG.CONDITIONS as unknown as string[];

/** Block-balanced condition assignment. */
async function assignCondition(): Promise<string> {
  // Count participants per condition (only those who have a condition assigned)
  const { data } = await supabase
    .from("participants")
    .select("condition")
    .not("condition", "is", null);

  const counts: Record<string, number> = {};
  for (const cond of CONDITIONS) counts[cond] = 0;
  for (const row of data ?? []) {
    if (row.condition && row.condition in counts) counts[row.condition]++;
  }

  // Within a block of BLOCK_SIZE, assign the condition with the fewest assignments.
  // Tie-break: deterministic order (direct → socratic → adaptive).
  const minCount = Math.min(...CONDITIONS.map((c) => counts[c]));
  const eligible = CONDITIONS.filter((c) => counts[c] === minCount);
  // Randomize selection among conditions tied for least assigned
  return eligible[Math.floor(Math.random() * eligible.length)];
}

export async function POST() {
  try {
    const condition = await assignCondition();
    const now = new Date().toISOString();

    // Create participant record
    const { data: participant, error } = await supabase
      .from("participants")
      .insert({
        condition,
        consent_at: now,
        stage: "background",
        user_agent: null, // we don't store IPs; UA is optional
      })
      .select("id")
      .single();

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
