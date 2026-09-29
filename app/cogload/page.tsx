/**
 * app/cogload/page.tsx
 * Cognitive Load Questionnaire (NASA-TLX subset + Paas item).
 * Spec §7:
 *   load_mental      — 0–100 slider, steps of 5
 *   load_effort      — 0–100 slider, steps of 5
 *   load_frustration — 0–100 slider, steps of 5
 *   load_performance — 0–100 slider, steps of 5  ← REVERSE-SCORED server-side
 *   load_paas        — 1–9 Likert
 *
 * All items required. Scoring via lib/scoring.ts (server-side only).
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import Button from "@/components/ui/Button";
import { LOAD_ITEMS } from "@/lib/scoring";

// ── Item definitions ──────────────────────────────────────────────────────────

interface SliderItem {
  id: "load_mental" | "load_effort" | "load_frustration" | "load_performance";
  label: string;
  leftLabel: string;
  rightLabel: string;
  isReverse?: boolean;
}

const SLIDER_ITEMS: SliderItem[] = [
  {
    id: "load_mental",
    label: "Mental demand",
    leftLabel: "Very low",
    rightLabel: "Very high",
  },
  {
    id: "load_effort",
    label: "Effort",
    leftLabel: "Very low",
    rightLabel: "Very high",
  },
  {
    id: "load_frustration",
    label: "Frustration",
    leftLabel: "Very low",
    rightLabel: "Very high",
  },
  {
    id: "load_performance",
    label: "Performance — How successful were you?",
    leftLabel: "Very poor",
    rightLabel: "Very good",
    isReverse: true,
  },
];

const PAAS_LABELS: Record<number, string> = {
  1: "Very, very low",
  2: "Very low",
  3: "Low",
  4: "Rather low",
  5: "Neither low nor high",
  6: "Rather high",
  7: "High",
  8: "Very high",
  9: "Very, very high",
};

type LoadResponses = Partial<Record<typeof LOAD_ITEMS[number], number>>;

// ── Component ─────────────────────────────────────────────────────────────────

export default function CogloadPage() {
  const router = useRouter();

  const [responses, setResponses]       = useState<LoadResponses>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [submitted, setSubmitted]       = useState(false);

  const totalItems    = LOAD_ITEMS.length; // 5
  const answeredCount = Object.keys(responses).length;
  const allAnswered   = answeredCount === totalItems;

  function setSlider(itemId: SliderItem["id"], value: number) {
    if (submitted) return;
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  }

  function setPaas(value: number) {
    if (submitted) return;
    setResponses((prev) => ({ ...prev, load_paas: value }));
  }

  async function handleSubmit() {
    if (!allAnswered || isSubmitting || submitted) return;
    setIsSubmitting(true);
    setError(null);

    const payload = {
      type: "load",
      responses: LOAD_ITEMS.map((id) => ({
        itemId: id,
        value:  responses[id]!,
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
      router.push("/debrief");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell currentStage="cogload">
      <div className="max-w-2xl mx-auto px-[var(--spacing-gutter)] py-10">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <p className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-primary)] uppercase tracking-[0.08em] mb-2">
            Step 7 of 8
          </p>
          <h1 className="font-[var(--font-display)] text-[length:var(--text-headline-lg)] font-bold text-[var(--color-on-surface)] mb-3">
            Cognitive Effort Questionnaire
          </h1>
          <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] leading-relaxed">
            Please reflect on the mental demands of the learning session. Move each slider to indicate your experience.
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

        {/* ── NASA-TLX Sliders (items 1–4) ────────────────────────────────── */}
        <div className="space-y-8">
          {SLIDER_ITEMS.map((item, idx) => {
            const val = responses[item.id];
            const hasValue = val !== undefined;

            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]"
              >
                <div className="flex items-start justify-between mb-5 gap-4">
                  <p className="font-[var(--font-body)] text-[length:var(--text-body-lg)] font-semibold text-[var(--color-on-surface)] leading-snug">
                    <span className="text-[var(--color-primary)] mr-2">{idx + 1}.</span>
                    {item.label}
                    {item.isReverse && <span className="sr-only"> (reverse-scored)</span>}
                  </p>
                  <span
                    className="font-[var(--font-ui)] text-[length:var(--text-headline-md)] font-bold text-[var(--color-primary)] shrink-0 min-w-[3ch] text-right"
                    aria-live="polite"
                    aria-label={`Current value: ${hasValue ? val : "not set"}`}
                  >
                    {hasValue ? val : "–"}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] shrink-0 w-16 text-right">
                    {item.leftLabel}
                  </span>
                  <input
                    id={`slider-${item.id}`}
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={val ?? 50}
                    onChange={(e) => setSlider(item.id, Number(e.target.value))}
                    onInput={(e) => {
                      // Ensure first touch registers as answered
                      if (val === undefined) setSlider(item.id, Number((e.target as HTMLInputElement).value));
                    }}
                    onClick={(e) => {
                      if (val === undefined) setSlider(item.id, Number((e.target as HTMLInputElement).value));
                    }}
                    disabled={submitted}
                    aria-label={item.label}
                    className="flex-1 h-2 accent-[var(--color-primary)] cursor-pointer"
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] shrink-0 w-16">
                    {item.rightLabel}
                  </span>
                </div>

                {/* Tick marks at 0, 25, 50, 75, 100 */}
                <div className="flex justify-between mt-1 px-[5rem]">
                  {[0, 25, 50, 75, 100].map((t) => (
                    <span
                      key={t}
                      className="font-[var(--font-ui)] text-[10px] text-[var(--color-on-surface-variant)] opacity-60"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Prompt to interact if untouched */}
                {!hasValue && (
                  <p className="mt-3 text-center font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] opacity-70">
                    Move the slider to record your rating
                  </p>
                )}
              </div>
            );
          })}

          {/* ── Paas item (1–9) ──────────────────────────────────────────── */}
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]">
            <p className="font-[var(--font-body)] text-[length:var(--text-body-lg)] font-semibold text-[var(--color-on-surface)] mb-2 leading-snug">
              <span className="text-[var(--color-primary)] mr-2">5.</span>
              Overall, how much mental effort did you invest in this learning session?
            </p>
            <p className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] mb-6">
              (Paas Mental Effort Scale, 1–9)
            </p>

            <fieldset disabled={submitted}>
              <legend className="sr-only">Paas mental effort scale 1 to 9</legend>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                {Array.from({ length: 9 }, (_, i) => i + 1).map((pt) => {
                  const checked = responses.load_paas === pt;
                  return (
                    <label
                      key={pt}
                      htmlFor={`paas-${pt}`}
                      className={[
                        "flex flex-col items-center gap-1 cursor-pointer group",
                        submitted && "cursor-not-allowed",
                      ].filter(Boolean).join(" ")}
                    >
                      <input
                        id={`paas-${pt}`}
                        type="radio"
                        name="load_paas"
                        value={pt}
                        checked={checked}
                        onChange={() => setPaas(pt)}
                        disabled={submitted}
                        className="sr-only"
                      />
                      <div
                        className={[
                          "w-10 h-10 rounded-full flex items-center justify-center font-[var(--font-ui)] font-semibold text-[length:var(--text-label-md)] border-2 transition-all duration-150",
                          checked
                            ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-on-primary)]"
                            : "bg-[var(--color-surface-container)] border-[var(--color-outline-variant)] text-[var(--color-on-surface)] group-hover:border-[var(--color-primary)]",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        {pt}
                      </div>
                      <span className="text-[9px] text-center font-[var(--font-body)] text-[var(--color-on-surface-variant)] leading-tight max-w-[4rem] hidden sm:block">
                        {PAAS_LABELS[pt]}
                      </span>
                    </label>
                  );
                })}
              </div>
              {/* Mobile: show selected label */}
              {responses.load_paas !== undefined && (
                <p className="sm:hidden mt-3 text-center font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-primary)] font-semibold">
                  {PAAS_LABELS[responses.load_paas]}
                </p>
              )}
              {responses.load_paas === undefined && (
                <p className="mt-3 text-center font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] opacity-70">
                  Select a number to record your rating
                </p>
              )}
            </fieldset>
          </div>
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
            id="cogload-submit-btn"
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
