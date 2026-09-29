/**
 * app/api/questionnaire/submit/route.ts
 * POST — Server-side questionnaire scoring.
 *
 * Accepts item-level responses for trust or cognitive-load questionnaires,
 * computes composite scores (with reverse-scoring via lib/scoring.ts),
 * and writes:
 *   - questionnaires  (one row per item)
 *   - scores          (upserted; trust_score or load_score filled)
 *
 * Then advances the participant's stage.
 */

import { NextRequest } from "next/server";
import { getParticipantId, advanceStage } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import {
  computeTrustScore,
  computeLoadScore,
  TRUST_ITEMS,
  LOAD_ITEMS,
} from "@/lib/scoring";

type QType = "trust" | "load";

interface ItemResponse {
  itemId: string;
  value:  number;
}

interface SubmitBody {
  type:      QType;
  responses: ItemResponse[];
}

export async function POST(request: NextRequest) {
  try {
    const pid = await getParticipantId();
    if (!pid) {
      return Response.json({ error: "No active session" }, { status: 401 });
    }

    const body: SubmitBody = await request.json();
    const { type, responses } = body;

    if (!type || !["trust", "load"].includes(type)) {
      return Response.json({ error: "Invalid questionnaire type" }, { status: 400 });
    }
    if (!Array.isArray(responses) || responses.length === 0) {
      return Response.json({ error: "No responses provided" }, { status: 400 });
    }

    // ── Validate item IDs ────────────────────────────────────────────────────
    const allowedItems = new Set<string>(
      type === "trust" ? TRUST_ITEMS : LOAD_ITEMS
    );
    for (const { itemId } of responses) {
      if (!allowedItems.has(itemId)) {
        return Response.json(
          { error: `Unknown item id: ${itemId}` },
          { status: 400 }
        );
      }
    }

    // ── Build response map for scoring ───────────────────────────────────────
    const responseMap: Record<string, number> = {};
    for (const { itemId, value } of responses) {
      responseMap[itemId] = value;
    }

    // ── Persist item-level responses ─────────────────────────────────────────
    const rows = responses.map(({ itemId, value }) => ({
      participant_id: pid,
      type,
      item_id:        itemId,
      value,
    }));

    const { error: insertErr } = await supabase
      .from("questionnaires")
      .insert(rows);

    if (insertErr) {
      console.error("questionnaires insert error:", insertErr);
      return Response.json({ error: "Failed to save responses" }, { status: 500 });
    }

    // ── Compute and upsert composite score ───────────────────────────────────
    type ScoreUpdate = {
      participant_id: string;
      trust_score?: number | null;
      load_score?: number | null;
    };
    const scoreUpdate: ScoreUpdate = { participant_id: pid };

    if (type === "trust") {
      const trustScore = computeTrustScore(responseMap);
      scoreUpdate.trust_score = trustScore;
    } else {
      const loadScore = computeLoadScore(responseMap, "0-100");
      scoreUpdate.load_score = loadScore;
      // Store Paas item raw value separately in the map (already in questionnaires table)
    }

    const { error: scoreErr } = await supabase
      .from("scores")
      .upsert(scoreUpdate, { onConflict: "participant_id" });

    if (scoreErr) {
      console.error("scores upsert error:", scoreErr);
      return Response.json({ error: "Failed to save score" }, { status: 500 });
    }

    // ── Advance stage ────────────────────────────────────────────────────────
    const fromStage = type === "trust" ? "trust"   : "cogload";
    const toStage   = type === "trust" ? "cogload"  : "debrief";

    await advanceStage(pid, fromStage, toStage);

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error("POST /api/questionnaire/submit error:", err);
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
