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

interface ItemAnswer {
  itemId: string;
  chosenIndex: number;
}

interface SubmitBody {
  form?: string;
  answers: ItemAnswer[];
  timeTakenSeconds: number;
}

/** Map item id → correct index, built once at module load time (server-only). */
const ANSWER_KEY: Record<string, number> = {};

function registerItems(list: unknown[]) {
  for (const entry of list as Array<Record<string, unknown>>) {
    const items =
      entry.pretest || entry.posttest || entry.items || (Array.isArray(entry) ? entry : null);
    if (Array.isArray(items)) {
      for (const item of items as Array<Record<string, unknown>>) {
        const id = (item.itemId || item.id) as string;
        if (id && typeof item.correctIndex === "number") {
          ANSWER_KEY[id] = item.correctIndex;
        }
      }
    } else if (entry.itemId || entry.id) {
      const id = (entry.itemId || entry.id) as string;
      if (id && typeof entry.correctIndex === "number") {
        ANSWER_KEY[id] = entry.correctIndex;
      }
    }
  }
}

registerItems(pretestItems);
registerItems(posttestItems);

export async function POST(request: NextRequest) {
  try {
    const pid = await getParticipantId();
    if (!pid) {
      return Response.json({ error: "No active session" }, { status: 401 });
    }

    const body: SubmitBody = await request.json();
    const { answers, timeTakenSeconds } = body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return Response.json({ error: "No answers provided" }, { status: 400 });
    }

    // Determine whether this is pretest or posttest based on current stage in DB
    const { data: participant, error: pErr } = await supabase
      .from("participants")
      .select("stage")
      .eq("id", pid)
      .single();

    if (pErr || !participant) {
      return Response.json({ error: "Participant not found" }, { status: 404 });
    }

    const isPretest = participant.stage === "pretest";
    const fromStage = isPretest ? "pretest" : "posttest";
    const toStage   = isPretest ? "session" : "trust";
    const timeField = isPretest ? "pre_time_s" : "post_time_s";
    const scoreField = isPretest ? "pre_score" : "post_score";
    const stageForm = isPretest ? "pretest" : "posttest";

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
        form:           body.form ?? stageForm,
        item_id:        itemId,
        chosen_index:   chosenIndex,
        is_correct:     isCorrect,
        answered_at:    new Date().toISOString(),
      };
    });

    // ── Persist item-level responses ─────────────────────────────────────────
    let { error: respErr } = await supabase
      .from("test_responses")
      .insert(responseRows);

    // Fallback if migration 003 hasn't run yet in Supabase and check constraint requires 'A' or 'B'
    if (respErr && (respErr.message?.includes("check") || respErr.code === "23514")) {
      const fallbackRows = responseRows.map((r) => ({
        ...r,
        form: isPretest ? "A" : "B",
      }));
      const fallbackResult = await supabase
        .from("test_responses")
        .insert(fallbackRows);
      respErr = fallbackResult.error;
    }

    if (respErr) {
      console.error("test_responses insert error:", respErr);
      return Response.json({ error: "Failed to save responses" }, { status: 500 });
    }

    // ── Upsert test_scores (pre_score or post_score) ─────────────────────────
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
    await advanceStage(pid, fromStage, toStage);

    // ── Return only the score (not the answer key) ───────────────────────────
    return Response.json({ success: true, score, total: answers.length });
  } catch (err: unknown) {
    console.error("POST /api/test/submit error:", err);
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
