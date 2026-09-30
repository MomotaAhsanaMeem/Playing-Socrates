/**
 * app/pretest/page.tsx
 * Pre-Test Assessment — single matched item for the participant's assigned topic and set (A or B).
 *
 * • Correct answers are NEVER sent to the client.
 * • Questions filtered server-side by assigned topic and test set.
 * • Submission POSTs to /api/test/submit which scores server-side and advances to "session".
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getParticipantId, getCurrentParticipant } from "@/lib/session";
import PretestClient from "./PretestClient";
import rawPretest from "@/content/pretest.json";
import { TopicId } from "@/config/study";

export const metadata: Metadata = {
  title: "Pre-Test Assessment | Playing Socrates",
  description: "Baseline knowledge assessment before the AI learning session.",
};

/** Safe question shape — no correctIndex */
export interface SafeQuestion {
  id: string;
  question: string;
  options: string[];
}

export default async function PretestPage() {
  const pid = await getParticipantId();
  if (!pid) redirect("/consent");

  const participant = await getCurrentParticipant();
  const topicId = (participant?.topic as TopicId) || "procrastination";

  const topicEntry = rawPretest.find((t) => t.topicId === topicId);
  const assignedItems = topicEntry?.pretest || topicEntry?.items || [];

  // Strip correctIndex server-side so it never reaches the browser
  const questions: SafeQuestion[] = assignedItems.map((item) => ({
    id: item.itemId || item.id,
    question: item.question,
    options: item.options,
  }));

  return <PretestClient questions={questions} />;
}
