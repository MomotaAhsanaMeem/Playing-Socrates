/**
 * app/api/admin/export/items/route.ts
 * GET — Export items.csv
 * Spec §9: item-level test and questionnaire responses.
 *
 * Combines:
 *  - test_responses (form, item_id, chosen_index, is_correct)
 *  - questionnaires (type, item_id, value)
 *
 * Query param: ?includeIncomplete=true
 */

import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

function isAdminAuthenticated(token: string | undefined): boolean {
  return typeof token === "string" && token.startsWith("authenticated:");
}

function esc(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
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
    // Qualifying participant IDs + participant details map
    let pQuery = supabase
      .from("participants")
      .select("id, condition, topic");
    if (!includeIncomplete) {
      pQuery = pQuery.eq("stage", "complete");
    }
    const { data: participants, error: pErr } = await pQuery;
    if (pErr) throw pErr;

    const ids = (participants ?? []).map((p) => p.id);
    const pMap = Object.fromEntries(
      (participants ?? []).map((p) => [
        p.id,
        {
          condition: p.condition,
          topic: p.topic ?? "",
        },
      ])
    );

    const headers = [
      "participant_id",
      "condition",
      "topic",
      "source",       // "test" | "questionnaire"
      "form_or_type", // "pretest" | "posttest" | "trust" | "load"
      "item_id",
      "chosen_index_or_value",
      "is_correct",   // 1 | 0 | "" (for questionnaires)
      "answered_at",
    ];

    const lines: string[] = [row(headers)];

    if (ids.length > 0) {
      // Test responses
      const { data: testRows, error: tErr } = await supabase
        .from("test_responses")
        .select("participant_id, form, item_id, chosen_index, is_correct, answered_at")
        .in("participant_id", ids)
        .order("participant_id", { ascending: true })
        .order("answered_at", { ascending: true });

      if (tErr) throw tErr;

      for (const r of testRows ?? []) {
        const pInfo = pMap[r.participant_id] ?? { condition: "", topic: "" };
        lines.push(
          row([
            r.participant_id,
            pInfo.condition,
            pInfo.topic,
            "test",
            r.form,
            r.item_id,
            r.chosen_index,
            r.is_correct ? "1" : "0",
            r.answered_at,
          ])
        );
      }

      // Questionnaire responses
      const { data: qRows, error: qErr } = await supabase
        .from("questionnaires")
        .select("participant_id, type, item_id, value")
        .in("participant_id", ids)
        .order("participant_id", { ascending: true });

      if (qErr) throw qErr;

      for (const r of qRows ?? []) {
        const pInfo = pMap[r.participant_id] ?? { condition: "", topic: "" };
        lines.push(
          row([
            r.participant_id,
            pInfo.condition,
            pInfo.topic,
            "questionnaire",
            r.type,
            r.item_id,
            r.value,
            "",   // no is_correct for questionnaires
            "",   // no answered_at for questionnaires (not stored at item level)
          ])
        );
      }
    }

    const csv = lines.join("\r\n");
    const ts  = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    return new Response(csv, {
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="items_${ts}.csv"`,
        "Cache-Control":       "no-store",
      },
    });
  } catch (err) {
    console.error("[admin/export/items] error:", err);
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
