/**
 * app/api/debrief/complete/route.ts
 * POST — Advances participant stage from "debrief" → "complete".
 * Called by DebriefClient when the participant clicks "Finish Study".
 * Also marks participant as completed_at.
 */

import { NextRequest } from "next/server";
import { getParticipantId, advanceStage } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { computeCalibrationGap } from "@/lib/scoring";

export async function POST(_request: NextRequest) {
  try {
    const pid = await getParticipantId();
    if (!pid) {
      return Response.json({ error: "No active session" }, { status: 401 });
    }

    // Verify stage
    const { data: participant, error: pErr } = await supabase
      .from("participants")
      .select("stage")
      .eq("id", pid)
      .single();

    if (pErr || !participant) {
      return Response.json({ error: "Participant not found" }, { status: 404 });
    }

    if (participant.stage !== "debrief") {
      return Response.json({ error: "Not in debrief stage" }, { status: 403 });
    }

    // Compute calibration metrics from messages and store in scores
    const { data: messages } = await supabase
      .from("messages")
      .select("trust_rating, is_planted_error")
      .eq("participant_id", pid)
      .eq("role", "ai");

    if (messages && messages.length > 0) {
      const { trustCorrectMean, trustPlantedMean, calibrationGap } = computeCalibrationGap(
        messages.map((m) => ({
          trustRating: m.trust_rating,
          isPlantedError: m.is_planted_error,
        }))
      );

      await supabase
        .from("scores")
        .upsert(
          {
            participant_id: pid,
            trust_correct_mean: trustCorrectMean,
            trust_planted_mean: trustPlantedMean,
            calibration_gap: calibrationGap,
          },
          { onConflict: "participant_id" }
        );
    }

    // Mark completed_at
    await supabase
      .from("participants")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", pid);

    // Advance stage
    await advanceStage(pid, "debrief", "complete");

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error("POST /api/debrief/complete error:", err);
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
