/**
 * app/session/page.tsx
 * AI Learning Session — Server Component.
 *
 * Loads the participant's existing messages from DB so the session
 * can resume after a refresh (spec §3: progress survives page refresh).
 * Passes only safe data to SessionClient — condition is NOT passed.
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getParticipantId } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import SessionClient from "./SessionClient";
import type { ResumedMessage } from "./SessionClient";
import { STUDY_CONFIG, getTopicDisplayName } from "@/config/study";

export const metadata: Metadata = {
  title: "AI Learning Session | Playing Socrates",
  description: "Interactive learning session with your AI tutor.",
};

export default async function SessionPage() {
  const pid = await getParticipantId();
  if (!pid) redirect("/consent");

  // Fetch participant topic
  const { data: participant } = await supabase
    .from("participants")
    .select("topic")
    .eq("id", pid)
    .single();

  const topicDisplayName = getTopicDisplayName(participant?.topic || "procrastination");

  // Fetch existing messages for session resume
  const { data: messages } = await supabase
    .from("messages")
    .select("id, turn_index, role, content, trust_rating, created_at")
    .eq("participant_id", pid)
    .order("created_at", { ascending: true });

  // Compute how many student turns have already been completed
  const studentMessages = (messages ?? []).filter((m) => m.role === "student");
  const completedStudentTurns = studentMessages.length;

  // Build resumed message list for the client (safe — no condition, no planted flag)
  const resumedMessages: ResumedMessage[] = (messages ?? []).map((m) => ({
    id:          m.id,
    role:        m.role as "student" | "ai",
    content:     m.content,
    trustRating: m.trust_rating ?? null,
  }));

  const limitAlreadyReached = completedStudentTurns >= STUDY_CONFIG.MAX_TURNS;

  return (
    <SessionClient
      participantId={pid}
      resumedMessages={resumedMessages}
      initialStudentTurnIndex={completedStudentTurns}
      maxTurns={STUDY_CONFIG.MAX_TURNS}
      topic={topicDisplayName}
      limitAlreadyReached={limitAlreadyReached}
    />
  );
}
