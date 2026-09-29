/**
 * app/trust/page.tsx
 * Trust in AI Questionnaire — 6-item Likert (1–7).
 * Spec §7. Item trust_6 is reverse-scored server-side (documented in lib/scoring.ts).
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import LikertScale from "@/components/ui/LikertScale";
import Button from "@/components/ui/Button";
import { TRUST_ITEMS } from "@/lib/scoring";

interface TrustItem {
  id: typeof TRUST_ITEMS[number];
  label: string;
  isReverse?: boolean;
}

const TRUST_QUESTIONS: TrustItem[] = [
  { id: "trust_1", label: "I think the AI tutor was reliable." },
  { id: "trust_2", label: "I would rely on this AI tutor for learning." },
  { id: "trust_3", label: "I believe the AI tutor's explanations were trustworthy." },
  { id: "trust_4", label: "The AI tutor was accurate." },
  { id: "trust_5", label: "I felt confident following the AI tutor's guidance." },
  { id: "trust_6", label: "I would double-check what this AI tutor tells me.", isReverse: true },
];

type Responses = Partial<Record<typeof TRUST_ITEMS[number], number>>;

export default function TrustPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<Responses>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(responses).length;
  const totalItems    = TRUST_QUESTIONS.length;
  const allAnswered   = answeredCount === totalItems;

  function handleChange(itemId: typeof TRUST_ITEMS[number], value: number) {
    if (submitted) return;
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  }

  async function handleSubmit() {
    if (!allAnswered || isSubmitting || submitted) return;
    setIsSubmitting(true);
    setError(null);

    const payload = {
      type: "trust",
      responses: TRUST_QUESTIONS.map((q) => ({
        itemId: q.id,
        value:  responses[q.id]!,
      })),
    };

    try {
      const res = await fetch("/api/questionnaire/submit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      setSubmitted(true);
      router.push("/cogload");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell currentStage="trust">
      <div className="max-w-2xl mx-auto px-[var(--spacing-gutter)] py-10">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <p className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-primary)] uppercase tracking-[0.08em] mb-2">
            Step 6 of 8
          </p>
          <h1 className="font-[var(--font-display)] text-[length:var(--text-headline-lg)] font-bold text-[var(--color-on-surface)] mb-3">
            Trust in AI Questionnaire
          </h1>
          <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] leading-relaxed">
            Please reflect on your experience with the AI tutor. For each statement below, indicate how strongly you agree or disagree on a scale from <strong>1 (Strongly disagree)</strong> to <strong>7 (Strongly agree)</strong>.
          </p>
        </div>

        {/* ── Progress ────────────────────────────────────────────────────── */}
        <div className="mb-8" role="status" aria-label={`${answeredCount} of ${totalItems} answered`}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)]">Progress</span>
            <span className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-primary)] font-semibold">
              {answeredCount}/{totalItems}
            </span>
          </div>
          <div className="h-2 bg-[var(--color-surface-container)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
              style={{ width: `${Math.round((answeredCount / totalItems) * 100)}%` }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* ── Items ───────────────────────────────────────────────────────── */}
        <div className="space-y-8">
          {TRUST_QUESTIONS.map((q, idx) => (
            <div
              key={q.id}
              className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]"
            >
              <p className="font-[var(--font-body)] text-[length:var(--text-body-lg)] font-semibold text-[var(--color-on-surface)] mb-6 leading-snug">
                <span className="text-[var(--color-primary)] mr-2">{idx + 1}.</span>
                {q.label}
                {q.isReverse && (
                  <span className="sr-only"> (reverse-scored)</span>
                )}
              </p>
              <LikertScale
                name={q.id}
                value={responses[q.id] ?? null}
                onChange={(val) => handleChange(q.id, val)}
                leftLabel="Strongly disagree"
                rightLabel="Strongly agree"
                min={1}
                max={7}
                disabled={submitted}
              />
            </div>
          ))}
        </div>

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
              {totalItems - answeredCount} item{totalItems - answeredCount !== 1 ? "s" : ""} remaining
            </p>
          )}
          <Button
            id="trust-submit-btn"
            onClick={handleSubmit}
            disabled={!allAnswered || submitted}
            isLoading={isSubmitting}
            size="lg"
            className="ml-auto"
          >
            {isSubmitting ? "Submitting…" : "Continue"}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
