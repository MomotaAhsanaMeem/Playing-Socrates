/**
 * app/api/admin/export/participants/route.ts
 * GET — Export participants.csv
 * Spec §9: one row per participant (condition, scores, gain, trust, load, calibration_gap, background, durations)
 *
 * Query param: ?includeIncomplete=true to include incomplete participants.
 */

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

function isAdminAuthenticated(token: string | undefined): boolean {
  return typeof token === "string" && token.startsWith("authenticated:");
}

function esc(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  // Wrap in quotes if the value contains comma, quote, or newline
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(cells: unknown[]): string {
  return cells.map(esc).join(",");
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
    let query = supabase
      .from("participants")
      .select(`
        id,
        condition,
        topic,
        roster_n,
        stage,
        created_at,
        completed_at,
        consent_at,
        background,
        user_agent,
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
        ),
        stage_times (
          stage,
          started_at,
          ended_at
        )
      `)
      .order("created_at", { ascending: true });

    if (!includeIncomplete) {
      query = query.eq("stage", "complete");
    }

    const { data: participants, error } = await query;
    if (error) throw error;

    // Duration helper (seconds)
    function stageDuration(
      stageTimes: { stage: string; started_at: string; ended_at: string | null }[],
      stageName: string
    ): number | "" {
      const st = stageTimes?.find((t) => t.stage === stageName);
      if (!st || !st.ended_at) return "";
      return Math.round(
        (new Date(st.ended_at).getTime() - new Date(st.started_at).getTime()) / 1000
      );
    }

    const headers = [
      "participant_id",
      "condition",
      "topic",
      "roster_n",
      "stage",
      "consent_at",
      "created_at",
      "completed_at",
      "pre_score",
      "post_score",
      "learning_gain",
      "trust_score",
      "load_score",
      "trust_correct_mean",
      "trust_planted_mean",
      "calibration_gap",
      "bg_age_range",
      "bg_education",
      "bg_prior_familiarity",
      "bg_prior_ai_tutor",
      "bg_gender",
      "dur_background_s",
      "dur_pretest_s",
      "dur_session_s",
      "dur_posttest_s",
      "dur_trust_s",
      "dur_cogload_s",
      "dur_debrief_s",
    ];

    const lines: string[] = [row(headers)];

    for (const p of participants ?? []) {
      const ts = Array.isArray(p.test_scores) ? p.test_scores[0] : p.test_scores ?? {};
      const s = Array.isArray(p.scores) ? p.scores[0] : p.scores ?? {};
      const st: { stage: string; started_at: string; ended_at: string | null }[] =
        (p.stage_times as typeof st) ?? [];
      const bg = (p.background as Record<string, unknown>) ?? {};

      lines.push(
        row([
          p.id,
          p.condition,
          p.topic ?? "",
          p.roster_n ?? "",
          p.stage,
          p.consent_at,
          p.created_at,
          p.completed_at,
          ts.pre_score ?? "",
          ts.post_score ?? "",
          ts.learning_gain ?? "",
          s.trust_score ?? "",
          s.load_score ?? "",
          s.trust_correct_mean ?? "",
          s.trust_planted_mean ?? "",
          s.calibration_gap ?? "",
          bg.age_range ?? "",
          bg.education ?? "",
          bg.prior_familiarity ?? "",
          bg.prior_ai_tutor ?? "",
          bg.gender ?? "",
          stageDuration(st, "background"),
          stageDuration(st, "pretest"),
          stageDuration(st, "session"),
          stageDuration(st, "posttest"),
          stageDuration(st, "trust"),
          stageDuration(st, "cogload"),
          stageDuration(st, "debrief"),
        ])
      );
    }

    const csv = lines.join("\r\n");
    const ts  = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    return new Response(csv, {
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="participants_${ts}.csv"`,
        "Cache-Control":       "no-store",
      },
    });
  } catch (err) {
    console.error("[admin/export/participants] error:", err);
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
