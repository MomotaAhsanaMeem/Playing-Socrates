/**
 * app/api/admin/export/messages/route.ts
 * GET — Export messages.csv
 * Spec §9: one row per message (with trust ratings and planted flag).
 *
 * Joins messages with participants to include condition.
 * Query param: ?includeIncomplete=true to include messages from incomplete participants.
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
    // First get participant IDs that qualify
    let pQuery = supabase
      .from("participants")
      .select("id, condition");
    if (!includeIncomplete) {
      pQuery = pQuery.eq("stage", "complete");
    }
    const { data: participants, error: pErr } = await pQuery;
    if (pErr) throw pErr;

    const pidSet = new Set((participants ?? []).map((p) => p.id));
    const condMap = Object.fromEntries(
      (participants ?? []).map((p) => [p.id, p.condition])
    );

    if (pidSet.size === 0) {
      const csv = row([
        "message_id",
        "participant_id",
        "condition",
        "turn_index",
        "role",
        "content",
        "created_at",
        "is_planted_error",
        "trust_rating",
      ]);
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      return new Response(csv + "\r\n", {
        headers: {
          "Content-Type":        "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="messages_${ts}.csv"`,
          "Cache-Control":       "no-store",
        },
      });
    }

    // Fetch messages in batches (Supabase "in" supports up to 1000)
    const ids = [...pidSet];
    const { data: messages, error: mErr } = await supabase
      .from("messages")
      .select("id, participant_id, turn_index, role, content, created_at, is_planted_error, trust_rating")
      .in("participant_id", ids)
      .order("participant_id", { ascending: true })
      .order("created_at", { ascending: true });

    if (mErr) throw mErr;

    const headers = [
      "message_id",
      "participant_id",
      "condition",
      "turn_index",
      "role",
      "content",
      "created_at",
      "is_planted_error",
      "trust_rating",
    ];

    const lines: string[] = [row(headers)];
    for (const m of messages ?? []) {
      lines.push(
        row([
          m.id,
          m.participant_id,
          condMap[m.participant_id] ?? "",
          m.turn_index,
          m.role,
          m.content,
          m.created_at,
          m.is_planted_error ? "1" : "0",
          m.trust_rating ?? "",
        ])
      );
    }

    const csv = lines.join("\r\n");
    const ts  = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    return new Response(csv, {
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="messages_${ts}.csv"`,
        "Cache-Control":       "no-store",
      },
    });
  } catch (err) {
    console.error("[admin/export/messages] error:", err);
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
