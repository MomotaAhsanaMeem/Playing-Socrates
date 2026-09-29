/**
 * app/api/background/route.ts
 * POST — Save background questionnaire answers and advance to 'pretest'.
 * Body: { ageRange, education, topicFamiliarity, aiTutorUse, gender? }
 */

import { getParticipantId, advanceStage } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const pid = await getParticipantId();
    if (!pid) return Response.json({ error: "No session" }, { status: 401 });

    const body = await request.json();
    const { ageRange, education, topicFamiliarity, aiTutorUse, gender } = body;

    // Validate required fields
    if (!ageRange || !education || !topicFamiliarity || !aiTutorUse) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Store background as JSONB on participant row
    const background = { ageRange, education, topicFamiliarity, aiTutorUse, gender: gender ?? null };
    const { error } = await supabase
      .from("participants")
      .update({ background })
      .eq("id", pid);

    if (error) {
      console.error("Failed to save background:", error);
      return Response.json({ error: "Failed to save" }, { status: 500 });
    }

    // Advance to pretest
    await advanceStage(pid, "background", "pretest");
    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/background error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
