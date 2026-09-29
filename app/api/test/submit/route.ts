/**
 * app/api/test/submit/route.ts
 * POST — Server-side MCQ scoring.
 *
 * Accepts item-level answers, scores them against the answer key (loaded from
 * the content JSON files server-side), and writes:
 *   - test_responses  (one row per item)
 *   - test_scores     (upserted; pre_score or post_score filled)
 *
 * ⚠ correctIndex is NEVER sent to the client. This route is the only place
 *   where the answer key is read.
 */

import { NextRequest } from "next/server";
import { getParticipantId, advanceStage } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import pretestItems from "@/content/pretest.json";
import posttestItems from "@/content/posttest.json";

type Form = "A" | "B";

interface ItemAnswer {
  itemId: string;
  chosenIndex: number;
}

interface SubmitBody {
  form: Form;
  answers: ItemAnswer[];
  timeTakenSeconds: number;
}

/** Map item id → correct index, built once at module load time (server-only). */
const ANSWER_KEY: Record<string, number> = {};
for (const item of pretestItems)  ANSWER_KEY[item.id] = item.correctIndex;
for (const item of posttestItems) ANSWER_KEY[item.id] = item.correctIndex;

export async function POST(request: NextRequest) {
  try {
    const pid = await getParticipantId();
    if (!pid) {
      return Response.json({ error: "No active session" }, { status: 401 });
    }

    const body: SubmitBody = await request.json();
    const { form, answers, timeTakenSeconds } = body;

    if (!form || !["A", "B"].includes(form)) {
      return Response.json({ error: "Invalid form" }, { status: 400 });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return Response.json({ error: "No answers provided" }, { status: 400 });
    }

    // ── Score answers ────────────────────────────────────────────────────────
    let score = 0;
    const responseRows = answers.map(({ itemId, chosenIndex }) => {
      const correct = ANSWER_KEY[itemId];
      if (correct === undefined) {
        throw new Error(`Unknown item id: ${itemId}`);
      }
      const isCorrect = chosenIndex === correct;
      if (isCorrect) score++;
      return {
        participant_id: pid,
        form,
        item_id:        itemId,
        chosen_index:   chosenIndex,
        is_correct:     isCorrect,
        answered_at:    new Date().toISOString(),
      };
    });

    // ── Persist item-level responses ─────────────────────────────────────────
    const { error: respErr } = await supabase
      .from("test_responses")
      .insert(responseRows);

    if (respErr) {
      console.error("test_responses insert error:", respErr);
      return Response.json({ error: "Failed to save responses" }, { status: 500 });
    }

    // ── Upsert test_scores (pre_score or post_score) ─────────────────────────
    const timeField   = form === "A" ? "pre_time_s"  : "post_time_s";
    const scoreField  = form === "A" ? "pre_score"   : "post_score";

    const { error: scoreErr } = await supabase
      .from("test_scores")
      .upsert(
        {
          participant_id: pid,
          [scoreField]:   score,
          [timeField]:    timeTakenSeconds,
        },
        { onConflict: "participant_id" }
      );

    if (scoreErr) {
      console.error("test_scores upsert error:", scoreErr);
      return Response.json({ error: "Failed to save score" }, { status: 500 });
    }

    // ── Advance stage ────────────────────────────────────────────────────────
    const fromStage = form === "A" ? "pretest"  : "posttest";
    const toStage   = form === "A" ? "session"  : "trust";

    await advanceStage(pid, fromStage, toStage);

    // ── Return only the score (not the answer key) ───────────────────────────
    return Response.json({ success: true, score, total: answers.length });
  } catch (err: unknown) {
    console.error("POST /api/test/submit error:", err);
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
