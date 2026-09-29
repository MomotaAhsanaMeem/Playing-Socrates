/**
 * app/pretest/page.tsx
 * Pre-Test (Form A) — 10 MCQs on Photosynthesis.
 *
 * • Correct answers are NEVER sent to the client.
 * • Questions loaded from /content/pretest.json (options only, no correctIndex).
 * • Submission POSTs to /api/test/submit which scores server-side and
 *   advances the stage to "session".
 */

import type { Metadata } from "next";
import PretestClient from "./PretestClient";
// Load questions server-side and strip correctIndex before sending to client
import rawItems from "@/content/pretest.json";

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

export default function PretestPage() {
  // Strip correctIndex server-side so it never reaches the browser
  const questions: SafeQuestion[] = rawItems.map(({ id, question, options }) => ({
    id,
    question,
    options,
  }));

  return <PretestClient questions={questions} form="A" />;
}
