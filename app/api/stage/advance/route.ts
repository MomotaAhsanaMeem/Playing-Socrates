/**
 * app/api/stage/advance/route.ts
 * POST — Advances the participant to the next stage.
 * Updates both the participant's stage and stage_times table,
 * and sets the ps_stage HttpOnly cookie.
 */

import { NextRequest } from "next/server";
import { getParticipantId, advanceStage } from "@/lib/session";
import { STUDY_CONFIG, Stage } from "@/config/study";

const VALID_STAGES = new Set(STUDY_CONFIG.STAGES);

export async function POST(request: NextRequest) {
  try {
    const pid = await getParticipantId();
    if (!pid) {
      return Response.json({ error: "No active session" }, { status: 401 });
    }

    const body = await request.json();
    const { fromStage, toStage } = body;

    if (!fromStage || !toStage || !VALID_STAGES.has(fromStage as Stage) || !VALID_STAGES.has(toStage as Stage)) {
      return Response.json({ error: "Invalid stage transition" }, { status: 400 });
    }

    await advanceStage(pid, fromStage, toStage);

    return Response.json({ success: true, stage: toStage });
  } catch (err: unknown) {
    console.error("POST /api/stage/advance error:", err);
    return Response.json({ error: "Failed to advance stage" }, { status: 500 });
  }
}
