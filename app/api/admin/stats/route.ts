/**
 * app/api/admin/stats/route.ts
 * GET — Participant counts, means per condition, and condition × topic crossing table.
 * Spec §9 / TOPICS.md §5: visually confirm the roster is balancing as expected.
 *
 * Protected: requires valid admin_token cookie.
 * Query param: ?includeIncomplete=true to include incomplete participants.
 */

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { TOPICS, TopicId, Condition } from "@/config/study";

function isAdminAuthenticated(token: string | undefined): boolean {
  return typeof token === "string" && token.startsWith("authenticated:");
}

export interface CrossingCell {
  condition: Condition;
  topicId: TopicId;
  topicName: string;
  started: number;
  completed: number;
}

export interface TopicStats {
  topicId: TopicId;
  topicName: string;
  started: number;
  completed: number;
  preMean: number | null;
  postMean: number | null;
  gainMean: number | null;
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
    // Fetch all participants with scores, topics
    const { data: allParticipants, error } = await supabase
      .from("participants")
      .select(`
        id,
        condition,
        topic,
        roster_n,
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
      `)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const participants = allParticipants ?? [];
    const conditions: Condition[] = ["socratic", "direct", "adaptive"];

    // Helper: safe mean of defined numbers
    function safeMean(vals: (number | null | undefined)[]): number | null {
      const nums = vals.filter(
        (v) => v !== null && v !== undefined && typeof v === "number" && !isNaN(v)
      ) as number[];
      return nums.length > 0
        ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100
        : null;
    }

    const stats = conditions.map((cond) => {
      const group = participants.filter((p) => p.condition === cond);
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

    // Condition × Topic crossing table (TOPICS.md §5 / TOPIC_SETS.md)
    const crossingTable: CrossingCell[] = [];
    for (const cond of conditions) {
      for (const t of TOPICS) {
        const cellParticipants = participants.filter(
          (p) => p.condition === cond && p.topic === t.topicId
        );
        const cellCompleted = cellParticipants.filter((p) => p.stage === "complete");

        crossingTable.push({
          condition: cond,
          topicId: t.topicId,
          topicName: t.displayName,
          started: cellParticipants.length,
          completed: cellCompleted.length,
        });
      }
    }

    // Mean learning gain per topic (TOPIC_SETS.md §5)
    const topicStats: TopicStats[] = TOPICS.map((t) => {
      const group = participants.filter((p) => p.topic === t.topicId);
      const completed = group.filter((p) => p.stage === "complete");
      const target = includeIncomplete ? group : completed;

      const metrics = target.map((p) => {
        const ts = Array.isArray(p.test_scores) ? p.test_scores[0] : p.test_scores;
        return {
          pre_score:     ts?.pre_score,
          post_score:    ts?.post_score,
          learning_gain: ts?.learning_gain,
        };
      });

      return {
        topicId:   t.topicId,
        topicName: t.displayName,
        started:   group.length,
        completed: completed.length,
        preMean:   safeMean(metrics.map((m) => m.pre_score)),
        postMean:  safeMean(metrics.map((m) => m.post_score)),
        gainMean:  safeMean(metrics.map((m) => m.learning_gain)),
      };
    });

    const totals = {
      started:   participants.length,
      completed: participants.filter((p) => p.stage === "complete").length,
    };

    return Response.json({ stats, totals, crossingTable, topicStats, includeIncomplete });
  } catch (err) {
    console.error("[admin/stats] error:", err);
    return Response.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
