/**
 * app/api/tutor/trust/route.ts
 * POST — Save per-message trust rating (spec §5).
 *
 * Called after the participant rates each AI reply on the 1–7 slider.
 * Updates the trust_rating column on the messages row identified by messageId.
 * This is a non-blocking operation; the client shows the next input immediately
 * after the rating is saved.
 */

import { NextRequest } from "next/server";
import { getParticipantId } from "@/lib/session";
import { supabase } from "@/lib/supabase";

interface TrustRatingBody {
  messageId: string;
  rating:    number; // 1–7
}

export async function POST(request: NextRequest) {
  try {
    const pid = await getParticipantId();
    if (!pid) {
      return Response.json({ error: "No active session" }, { status: 401 });
    }

    const body: TrustRatingBody = await request.json();
    const { messageId, rating } = body;

    if (!messageId) {
      return Response.json({ error: "messageId is required" }, { status: 400 });
    }
    if (typeof rating !== "number" || rating < 1 || rating > 7) {
      return Response.json({ error: "Rating must be 1–7" }, { status: 400 });
    }

    // Update only rows that belong to this participant (safety check)
    const { error } = await supabase
      .from("messages")
      .update({ trust_rating: rating })
      .eq("id", messageId)
      .eq("participant_id", pid)   // ownership check
      .eq("role", "ai");           // only AI messages get rated

    if (error) {
      console.error("[trust] Failed to save trust rating:", error);
      return Response.json({ error: "Failed to save rating" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error("[trust] POST /api/tutor/trust error:", err);
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
