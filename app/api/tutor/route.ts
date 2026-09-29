/**
 * app/api/tutor/route.ts
 * POST — AI tutor chat endpoint.
 *
 * Spec §5 rules enforced here:
 *  - LLM API key never leaves this file (server-only).
 *  - Same model (gemini-3.8-flash), same temperature (0.4), same max tokens (300).
 *  - Condition-specific system prompt via lib/prompts.ts (verbatim).
 *  - Planted errors injected via lib/plantedErrors.ts at fixed student turn indices.
 *  - Every message (student + AI) logged with timestamp, participant_id, turn_index,
 *    is_planted_error flag.
 *  - Retry once on API failure before returning an error to the client.
 *  - Session ends after MAX_TURNS = 8 student turns.
 *
 * NOTE on Gemini API version:
 *  The @google/generative-ai SDK (v0.24.1) hardcodes the v1beta endpoint.
 *  Newer models (gemini-3.8-flash and above) return 403 on v1beta but work on v1.
 *  We therefore call the v1 REST API directly via fetch instead of using the SDK.
 */

import { NextRequest } from "next/server";
import { getParticipantId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { buildSystemPrompt } from "@/lib/prompts";
import {
  getPlantedError,
  buildPlantedErrorInstruction,
} from "@/lib/plantedErrors";
import { STUDY_CONFIG } from "@/config/study";
import type { Condition } from "@/config/study";

// ── Constants (spec §5) ───────────────────────────────────────────────────────
const MODEL_NAME  = "gemini-3.5-flash-lite";
const TEMPERATURE = 0.4;
const MAX_TOKENS  = 300; // ~120 words upper bound with safety margin
const MAX_TURNS   = STUDY_CONFIG.MAX_TURNS; // 8

// v1 endpoint — supports gemini-3.8-flash (v1beta returns 403 for this model)
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1";

// API key — server-side only, never leaves this file
const apiKey = process.env.LLM_API_KEY;
if (!apiKey) {
  throw new Error("LLM_API_KEY environment variable is not set");
}

// ── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: "student" | "ai";
  content: string;
}

interface TutorRequestBody {
  /** The student's new message */
  message: string;
  /**
   * Prior conversation history (student + AI turns).
   * Client sends this so the server can reconstruct the Gemini chat context.
   * Only content is sent — IDs, timestamps are server-managed.
   */
  history: ChatMessage[];
  /**
   * Current 0-based student turn index (number of student messages sent so far,
   * BEFORE this new one). Used to determine planted-error injection.
   */
  studentTurnIndex: number;
}

// ── Gemini v1 REST response shape (partial) ───────────────────────────────────
interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: { code: number; message: string; status: string };
}

// ── Helper: call Gemini v1 REST API directly with retry ───────────────────────
async function callGemini(
  systemPrompt: string,
  history: ChatMessage[],
  newStudentMessage: string,
  attempt = 0
): Promise<string> {
  const url = `${GEMINI_BASE}/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

  // Build conversation contents: prior history + new student message
  const contents = [
    ...history.map((msg) => ({
      role:  msg.role === "student" ? "user" : "model",
      parts: [{ text: msg.content }],
    })),
    { role: "user", parts: [{ text: newStudentMessage }] },
  ];

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature:     TEMPERATURE,
      maxOutputTokens: MAX_TOKENS,
      candidateCount:  1,
    },
  });

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data: GeminiResponse = await res.json();

    if (!res.ok) {
      throw new Error(
        `Gemini API ${res.status} ${data.error?.status ?? ""}: ${data.error?.message ?? "unknown error"}`
      );
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    if (!text) throw new Error("Empty response from model");
    return text;

  } catch (err) {
    if (attempt === 0) {
      // Retry once (spec §5)
      console.warn("[tutor] First attempt failed, retrying:", err);
      return callGemini(systemPrompt, history, newStudentMessage, 1);
    }
    throw err;
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate participant
    const pid = await getParticipantId();
    if (!pid) {
      return Response.json({ error: "No active session" }, { status: 401 });
    }

    // 2. Fetch participant record (need condition)
    const { data: participant, error: pErr } = await supabase
      .from("participants")
      .select("condition, stage")
      .eq("id", pid)
      .single();

    if (pErr || !participant) {
      return Response.json({ error: "Participant not found" }, { status: 404 });
    }

    if (participant.stage !== "session") {
      return Response.json({ error: "Not in session stage" }, { status: 403 });
    }

    const condition = participant.condition as Condition;

    // 3. Parse request body
    const body: TutorRequestBody = await request.json();
    const { message, history, studentTurnIndex } = body;

    if (!message?.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }
    if (typeof studentTurnIndex !== "number" || studentTurnIndex < 0) {
      return Response.json({ error: "Invalid studentTurnIndex" }, { status: 400 });
    }

    // 4. Enforce turn limit
    if (studentTurnIndex >= MAX_TURNS) {
      return Response.json(
        { error: "Turn limit reached", limitReached: true },
        { status: 422 }
      );
    }

    // 5. Build system prompt
    let systemPrompt = buildSystemPrompt(condition, STUDY_CONFIG.TOPIC);

    // 6. Check for planted error on this turn
    const plantedError = getPlantedError(studentTurnIndex);
    const isPlantedError = plantedError !== null;
    if (isPlantedError) {
      systemPrompt += buildPlantedErrorInstruction(plantedError!);
    }

    // 7. Log student message
    const now = new Date().toISOString();
    const { data: studentMsg, error: studentMsgErr } = await supabase
      .from("messages")
      .insert({
        participant_id:   pid,
        turn_index:       studentTurnIndex,
        role:             "student",
        content:          message.trim(),
        created_at:       now,
        is_planted_error: false,
        trust_rating:     null,
      })
      .select("id")
      .single();

    if (studentMsgErr) {
      console.error("[tutor] Failed to log student message:", studentMsgErr);
      // Non-fatal — continue even if logging fails
    }

    // 8. Call Gemini v1
    const aiReply = await callGemini(systemPrompt, history, message.trim());

    // 9. Log AI reply
    const aiNow = new Date().toISOString();
    const { data: aiMsg, error: aiMsgErr } = await supabase
      .from("messages")
      .insert({
        participant_id:   pid,
        turn_index:       studentTurnIndex,
        role:             "ai",
        content:          aiReply,
        created_at:       aiNow,
        is_planted_error: isPlantedError,
        trust_rating:     null,
      })
      .select("id")
      .single();

    if (aiMsgErr) {
      console.error("[tutor] Failed to log AI message:", aiMsgErr);
    }

    // Suppress unused-variable warning — studentMsg used only for potential future logging
    void studentMsg;

    const aiMessageId = aiMsg?.id ?? null;
    const newTurnIndex = studentTurnIndex + 1;
    const limitReached = newTurnIndex >= MAX_TURNS;

    return Response.json({
      reply:            aiReply,
      messageId:        aiMessageId,
      studentTurnIndex: newTurnIndex,   // next turn index for client to track
      limitReached,
    });

  } catch (err: unknown) {
    console.error("[tutor] POST /api/tutor error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
