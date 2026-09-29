/**
 * app/api/admin/stats/route.ts
 * GET — Participant counts and means per condition.
 * Spec §9: participants started/completed per condition, average scores per condition.
 *
 * Protected: requires valid admin_token cookie.
 * Query param: ?includeIncomplete=true to include incomplete participants.
 */

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

function isAdminAuthenticated(token: string | undefined): boolean {
  return typeof token === "string" && token.startsWith("authenticated:");
}

export async function GET(request: NextRequest) {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  if (!isAdminAuthenticated(token)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includeIncomplete = searchParams.get("includeIncomplete") === "true";

  try {
    // Fetch all participants with their scores
    let query = supabase
      .from("participants")
      .select(`
        id,
        condition,
        stage,
        created_at,
        completed_at,
        background,
        test_scores (
          pre_score,
          post_score,
          learning_gain
        ),
        scores (
          trust_score,
          load_score,
          trust_correct_mean,
          trust_planted_mean,
          calibration_gap
        )
      `);

    if (!includeIncomplete) {
      query = query.eq("stage", "complete");
    }

    const { data: participants, error } = await query;
    if (error) throw error;

    const conditions = ["direct", "socratic", "adaptive"];

    // Helper: safe mean of defined numbers
    function safeMean(vals: (number | null | undefined)[]): number | null {
      const nums = vals.filter((v) => v !== null && v !== undefined && typeof v === "number" && !isNaN(v)) as number[];
      return nums.length > 0
        ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100
        : null;
    }

    const stats = conditions.map((cond) => {
      const group = (participants ?? []).filter((p) => p.condition === cond);
      const completed = group.filter((p) => p.stage === "complete");
      const targetParticipants = includeIncomplete ? group : completed;

      const participantMetrics = targetParticipants.map((p) => {
        const ts = Array.isArray(p.test_scores) ? p.test_scores[0] : p.test_scores;
        const s = Array.isArray(p.scores) ? p.scores[0] : p.scores;
        return {
          pre_score:       ts?.pre_score,
          post_score:      ts?.post_score,
          learning_gain:   ts?.learning_gain,
          trust_score:     s?.trust_score,
          load_score:      s?.load_score,
          calibration_gap: s?.calibration_gap,
        };
      });

      return {
        condition:       cond,
        started:         group.length,
        completed:       completed.length,
        preMean:         safeMean(participantMetrics.map((m) => m.pre_score)),
        postMean:        safeMean(participantMetrics.map((m) => m.post_score)),
        gainMean:        safeMean(participantMetrics.map((m) => m.learning_gain)),
        trustMean:       safeMean(participantMetrics.map((m) => m.trust_score)),
        loadMean:        safeMean(participantMetrics.map((m) => m.load_score)),
        calibrationMean: safeMean(participantMetrics.map((m) => m.calibration_gap)),
      };
    });

    const totals = {
      started:   (participants ?? []).length,
      completed: (participants ?? []).filter((p) => p.stage === "complete").length,
    };

    return Response.json({ stats, totals, includeIncomplete });
  } catch (err) {
    console.error("[admin/stats] error:", err);
    return Response.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
