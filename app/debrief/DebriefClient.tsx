/**
 * app/debrief/DebriefClient.tsx
 * Debrief client component — Spec §3 §13
 *
 * Discloses:
 *  1. Study purpose and deception (planted errors)
 *  2. Each planted error: the incorrect claim + the correct fact
 *  3. Participant's completion code
 *
 * On "Finish Study" calls /api/debrief/complete which advances stage to "complete".
 * No navigation back is possible after submit.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlantedError } from "@/lib/plantedErrors";
import PageShell from "@/components/layout/PageShell";
import Button from "@/components/ui/Button";

interface DebriefClientProps {
  completionCode: string;
  plantedErrors: PlantedError[];
}

const TURN_LABELS: Record<number, string> = {
  1: "Turn 2",
  3: "Turn 4",
  4: "Turn 5",
  6: "Turn 7",
};

function getTurnLabel(turnIndex: number): string {
  return TURN_LABELS[turnIndex] ?? `Turn ${turnIndex + 1}`;
}

export default function DebriefClient({
  completionCode,
  plantedErrors,
}: DebriefClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [done, setDone]                 = useState(false);
  const [copied, setCopied]             = useState(false);

  async function handleFinish() {
    if (isSubmitting || done) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/debrief/complete", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }
      setDone(true);
      router.push("/complete");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      setIsSubmitting(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(completionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the text manually
    }
  }

  return (
    <PageShell currentStage="debrief" suppressNav={false}>
      <div className="max-w-2xl mx-auto px-[var(--spacing-gutter)] py-10">

        {/* ── Step label ────────────────────────────────────────────────── */}
        <p className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-primary)] uppercase tracking-[0.08em] mb-2">
          Step 8 of 8
        </p>

        {/* ── Headline ──────────────────────────────────────────────────── */}
        <h1 className="font-[var(--font-display)] text-[length:var(--text-headline-lg)] font-bold text-[var(--color-on-surface)] mb-3">
          Study Debrief
        </h1>
        <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] leading-relaxed mb-8">
          Thank you for completing the study. Please read the information below carefully.
        </p>

        {/* ── Purpose disclosure ────────────────────────────────────────── */}
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="material-symbols-outlined text-[var(--color-primary)] text-[28px]"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              info
            </span>
            <h2 className="font-[var(--font-display)] text-[length:var(--text-title-lg)] font-bold text-[var(--color-on-surface)]">
              About This Study
            </h2>
          </div>
          <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] leading-relaxed mb-3">
            This study investigated how different <strong className="text-[var(--color-on-surface)]">AI tutor interaction styles</strong> — direct answers, Socratic questioning, and adaptive scaffolding — affect learning outcomes, trust in AI, and cognitive load.
          </p>
          <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] leading-relaxed">
            You were randomly assigned to <strong className="text-[var(--color-on-surface)]">one of three conditions</strong>. The condition you experienced was never shown to you, as this was necessary to prevent bias. All participants saw the same topic, questions, and test items — only the tutor's communication style varied.
          </p>
        </div>

        {/* ── Deception disclosure (planted errors) ─────────────────────── */}
        <div className="p-6 rounded-2xl bg-amber-500/[0.08] border border-amber-500/30 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <span
              className="material-symbols-outlined text-amber-400 text-[28px] mt-0.5 shrink-0"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              warning
            </span>
            <div>
              <h2 className="font-[var(--font-display)] text-[length:var(--text-title-lg)] font-bold text-[var(--color-on-surface)] mb-1">
                Important: Deliberate Errors in the AI Session
              </h2>
              <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] leading-relaxed">
                To measure <strong className="text-[var(--color-on-surface)]">trust calibration</strong>, the AI tutor was instructed to include <strong className="text-[var(--color-on-surface)]">three deliberately incorrect facts</strong> at fixed points during the conversation — stated with the same confidence as correct information. This is a standard methodology for studying critical evaluation of AI-generated content.
              </p>
            </div>
          </div>

          <p className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-amber-300/80 mb-4">
            The incorrect claims are listed below alongside the correct facts. Please update your understanding accordingly.
          </p>

          {/* ── Planted error cards ──────────────────────────────────────── */}
          <div className="space-y-4">
            {plantedErrors.map((pe, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-[var(--color-outline-variant)]/60 flex items-center gap-2">
                  <span className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)] uppercase tracking-widest">
                    Error {idx + 1}
                  </span>
                  <span className="text-[var(--color-on-surface-variant)] opacity-40">·</span>
                  <span className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)]">
                    {getTurnLabel(pe.turnIndex)}
                  </span>
                </div>

                {/* Incorrect claim */}
                <div className="px-5 py-4 border-b border-[var(--color-outline-variant)]/40">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="material-symbols-outlined text-red-400 text-[18px]"
                      aria-hidden="true"
                    >
                      cancel
                    </span>
                    <span className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-red-400 uppercase tracking-wider">
                      What the AI said (incorrect)
                    </span>
                  </div>
                  <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface)] italic leading-relaxed">
                    &ldquo;{pe.incorrectClaim}&rdquo;
                  </p>
                </div>

                {/* Correct fact */}
                <div className="px-5 py-4 bg-emerald-500/[0.05]">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="material-symbols-outlined text-emerald-400 text-[18px]"
                      aria-hidden="true"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-emerald-400 uppercase tracking-wider">
                      The correct fact
                    </span>
                  </div>
                  <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface)] leading-relaxed">
                    {pe.correctFact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Ethics note ───────────────────────────────────────────────── */}
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="material-symbols-outlined text-[var(--color-primary)] text-[24px]"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
            <h2 className="font-[var(--font-display)] text-[length:var(--text-title-md)] font-bold text-[var(--color-on-surface)]">
              Your Rights &amp; Privacy
            </h2>
          </div>
          <ul className="space-y-2 font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] mt-1 shrink-0 text-[var(--color-primary)]">check</span>
              Your data is stored anonymously using a random ID — no name, email, or IP address is linked to your responses.
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] mt-1 shrink-0 text-[var(--color-primary)]">check</span>
              You may withdraw your data at any time by clicking the &ldquo;Withdraw&rdquo; option in the sidebar.
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] mt-1 shrink-0 text-[var(--color-primary)]">check</span>
              Results will be reported in aggregate form only; no individual will be identified.
            </li>
          </ul>
        </div>

        {/* ── Completion code ───────────────────────────────────────────── */}
        <div className="p-6 rounded-2xl bg-[var(--color-primary-container)] border border-[var(--color-primary)]/20 mb-8 text-center">
          <p className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-primary-container)] uppercase tracking-widest mb-2">
            Your Completion Code
          </p>
          <button
            type="button"
            onClick={copyCode}
            aria-label={`Completion code ${completionCode}. Click to copy.`}
            className="font-[var(--font-display)] text-[length:var(--text-headline-lg)] font-bold text-[var(--color-primary)] tracking-[0.15em] select-all cursor-pointer hover:opacity-80 transition-opacity"
          >
            {completionCode}
          </button>
          <p className="font-[var(--font-ui)] text-[length:var(--text-label-sm)] text-[var(--color-on-primary-container)]/70 mt-2">
            {copied ? "✓ Copied to clipboard!" : "Click the code to copy · Record it for your study credit"}
          </p>
        </div>

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-[var(--font-body)] text-[length:var(--text-body-sm)]"
          >
            <span className="material-symbols-outlined align-middle mr-2 text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* ── Finish button ─────────────────────────────────────────────── */}
        <div className="flex justify-end">
          <Button
            id="debrief-finish-btn"
            onClick={handleFinish}
            disabled={done}
            isLoading={isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Finishing…" : done ? "Done" : "Finish Study"}
          </Button>
        </div>

        <p className="mt-4 font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] text-center">
          If you have questions about this study, please contact the research team.
        </p>

      </div>
    </PageShell>
  );
}
