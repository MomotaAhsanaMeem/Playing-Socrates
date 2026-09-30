/**
 * app/posttest/page.tsx
 * Post-Test Assessment — single matched item for the participant's assigned topic and set (A or B).
 *
 * Server component strips correctIndex before sending to client.
 * Submission scores server-side via /api/test/submit and advances to "trust".
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getParticipantId, getCurrentParticipant } from "@/lib/session";
import PosttestClient from "./PosttestClient";
import rawPosttest from "@/content/posttest.json";
import type { SafeQuestion } from "@/app/pretest/page";
import { TopicId } from "@/config/study";

export const metadata: Metadata = {
  title: "Post-Test Assessment | Playing Socrates",
  description: "Knowledge assessment after the AI learning session.",
};

export default async function PosttestPage() {
  const pid = await getParticipantId();
  if (!pid) redirect("/consent");

  const participant = await getCurrentParticipant();
  const topicId = (participant?.topic as TopicId) || "procrastination";

  const topicEntry = rawPosttest.find((t) => t.topicId === topicId);
  const assignedItems = topicEntry?.posttest || topicEntry?.items || [];

  // Strip correctIndex server-side
  const questions: SafeQuestion[] = assignedItems.map((item) => ({
    id: item.itemId || item.id,
    question: item.question,
    options: item.options,
  }));

  return <PosttestClient questions={questions} />;
}
