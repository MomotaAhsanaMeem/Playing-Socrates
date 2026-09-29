/**
 * app/pretest/PretestClient.tsx
 * Shared client component for Pre-Test (Form A) and Post-Test (Form B).
 * Receives safe questions (no correctIndex) from the server component.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import MCQOption from "@/components/ui/MCQOption";
import Button from "@/components/ui/Button";
import type { SafeQuestion } from "./page";
import type { Stage } from "@/config/study";

interface PretestClientProps {
  questions: SafeQuestion[];
  form: "A" | "B";
}

type Answers = Record<string, number>; // itemId → chosenIndex

export default function PretestClient({ questions, form }: PretestClientProps) {
  const router = useRouter();
  const startTimeRef = useRef<number>(Date.now());

  const [answers, setAnswers]     = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isPretest  = form === "A";
  const stage: Stage = isPretest ? "pretest" : "posttest";
  const title  = isPretest ? "Pre-Test Assessment" : "Post-Test Assessment";
  const stageNum = isPretest ? 3 : 5;
  const totalItems = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalItems;

  function handleSelect(itemId: string, index: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [itemId]: index }));
  }

  async function handleSubmit() {
    if (!allAnswered || isSubmitting || submitted) return;
    setIsSubmitting(true);
    setError(null);

    const timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const payload = {
      form,
      answers: questions.map((q) => ({
        itemId:       q.id,
        chosenIndex:  answers[q.id],
      })),
      timeTakenSeconds,
    };

    try {
      const res = await fetch("/api/test/submit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      setSubmitted(true);
      // Middleware will redirect to the next stage; router.push is a fallback
      router.push(isPretest ? "/session" : "/trust");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      setIsSubmitting(false);
    }
  }

  // Track scroll position for progress on mobile
  const progressPct = Math.round((answeredCount / totalItems) * 100);

  return (
    <PageShell currentStage={stage}>
      <div className="max-w-2xl mx-auto px-[var(--spacing-gutter)] py-10">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <p className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-primary)] uppercase tracking-[0.08em] mb-2">
            Step {stageNum} of 8
          </p>
          <h1 className="font-[var(--font-display)] text-[length:var(--text-headline-lg)] font-bold text-[var(--color-on-surface)] mb-3">
            {title}
          </h1>
          <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)]">
            Select the best answer for each question. All {totalItems} questions must be answered before you can continue.
          </p>
        </div>

        {/* ── Progress bar ────────────────────────────────────────────────── */}
        <div className="mb-8" role="status" aria-label={`${answeredCount} of ${totalItems} answered`}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)]">
              Progress
            </span>
            <span className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-primary)] font-semibold">
              {answeredCount}/{totalItems}
            </span>
          </div>
          <div className="h-2 bg-[var(--color-surface-container)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* ── Questions ───────────────────────────────────────────────────── */}
        <ol className="space-y-10 list-none p-0 m-0">
          {questions.map((q, qIdx) => (
            <li key={q.id}>
              <fieldset>
                <legend className="font-[var(--font-body)] text-[length:var(--text-body-lg)] font-semibold text-[var(--color-on-surface)] mb-4 leading-snug">
                  <span className="text-[var(--color-primary)] mr-2">{qIdx + 1}.</span>
                  {q.question}
                </legend>
                <div className="space-y-3" role="radiogroup">
                  {q.options.map((opt, optIdx) => (
                    <MCQOption
                      key={`${q.id}-${optIdx}`}
                      id={`${q.id}-opt-${optIdx}`}
                      name={q.id}
                      value={optIdx}
                      label={opt}
                      checked={answers[q.id] === optIdx}
                      onChange={() => handleSelect(q.id, optIdx)}
                      disabled={submitted}
                    />
                  ))}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {error && (
          <div
            role="alert"
            className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-[var(--font-body)] text-[length:var(--text-body-sm)]"
          >
            <span className="material-symbols-outlined align-middle mr-2 text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* ── Submit ──────────────────────────────────────────────────────── */}
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {!allAnswered && (
            <p
              aria-live="polite"
              className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)]"
            >
              {totalItems - answeredCount} question{totalItems - answeredCount !== 1 ? "s" : ""} remaining
            </p>
          )}
          <Button
            id="pretest-submit-btn"
            onClick={handleSubmit}
            disabled={!allAnswered || submitted}
            isLoading={isSubmitting}
            size="lg"
            className="ml-auto"
            aria-describedby={!allAnswered ? "remaining-hint" : undefined}
          >
            {isSubmitting ? "Submitting…" : "Submit Answers"}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
