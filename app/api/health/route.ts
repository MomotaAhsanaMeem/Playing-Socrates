/**
 * app/api/health/route.ts
 * GET — Integration health check: inserts a test participant, reads it back, then deletes it.
 * Tests: Supabase connection, RLS (service-role bypass), write + read + delete.
 * Returns 200 OK with timing on success, 500 with error on failure.
 */

import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  let testId: string | null = null;

  try {
    // 1. Insert
    const { data: inserted, error: insertError } = await supabase
      .from("participants")
      .insert({
        condition:  "direct",
        stage:      "consent",
        consent_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      throw new Error(`Insert failed: ${insertError?.message}`);
    }
    testId = inserted.id;

    // 2. Read back
    const { data: readBack, error: readError } = await supabase
      .from("participants")
      .select("id, condition, stage")
      .eq("id", testId)
      .single();

    if (readError || !readBack) {
      throw new Error(`Read failed: ${readError?.message}`);
    }

    if (readBack.condition !== "direct" || readBack.stage !== "consent") {
      throw new Error(`Data mismatch: ${JSON.stringify(readBack)}`);
    }

    // 3. Delete
    const { error: deleteError } = await supabase
      .from("participants")
      .delete()
      .eq("id", testId);

    if (deleteError) {
      throw new Error(`Delete failed: ${deleteError?.message}`);
    }

    const elapsed = Date.now() - start;
    return Response.json({
      status: "ok",
      checks: { insert: true, read: true, delete: true },
      elapsed_ms: elapsed,
    });

  } catch (err: unknown) {
    // Clean up on error
    if (testId) {
      await supabase.from("participants").delete().eq("id", testId);
    }
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { status: "error", error: message },
      { status: 500 }
    );
  }
}
