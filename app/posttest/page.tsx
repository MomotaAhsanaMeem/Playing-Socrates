/**
 * app/posttest/page.tsx
 * Post-Test (Form B) — 10 MCQs on Photosynthesis.
 *
 * Server component strips correctIndex before sending to client.
 * Submission scores server-side via /api/test/submit and advances to "trust".
 */

import type { Metadata } from "next";
// Re-use the client component from pretest (form="B")
import PosttestClient from "./PosttestClient";
import rawItems from "@/content/posttest.json";
import type { SafeQuestion } from "@/app/pretest/page";

export const metadata: Metadata = {
  title: "Post-Test Assessment | Playing Socrates",
  description: "Knowledge assessment after the AI learning session.",
};

export default function PosttestPage() {
  // Strip correctIndex server-side
  const questions: SafeQuestion[] = rawItems.map(({ id, question, options }) => ({
    id,
    question,
    options,
  }));

  return <PosttestClient questions={questions} form="B" />;
}
