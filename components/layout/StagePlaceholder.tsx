"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Stage, STUDY_CONFIG } from "@/config/study";

interface StagePlaceholderProps {
  stage: Stage;
  nextStage?: Stage;
  title: string;
  description: string;
  stageNumber: number;
}

export default function StagePlaceholder({
  stage,
  nextStage,
  title,
  description,
  stageNumber,
}: StagePlaceholderProps) {
  const router = useRouter();
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    if (!nextStage || advancing) return;
    setAdvancing(true);
    setError(null);

    try {
      const res = await fetch("/api/stage/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromStage: stage, toStage: nextStage }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to advance stage");
      }

      router.push(`/${nextStage}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error advancing stage");
      setAdvancing(false);
    }
  };

  return (
    <PageShell currentStage={stage}>
      <div className="w-full max-w-[720px] mx-auto px-4 md:px-0 pt-20 md:pt-16 pb-24">
        <div className="mb-8">
          <span className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)] block mb-2">
            Step {stageNumber} of 9: {STUDY_CONFIG.STAGE_LABELS[stage]}
          </span>
          <h1 className="font-[var(--font-display)] text-[length:var(--text-headline-lg-mobile)] md:text-[length:var(--text-headline-lg)] font-bold text-[var(--color-on-surface)] mb-2 leading-[var(--text-headline-lg--line-height)]">
            {title}
          </h1>
          <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] leading-[var(--text-body-md--line-height)]">
            {description}
          </p>
        </div>

        <Card className="p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary)] shadow-sm">
            <span className="material-symbols-outlined text-[32px]">
              pending_actions
            </span>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-on-surface)]">
              Stage Placeholder
            </h3>
            <p className="font-[var(--font-body)] text-sm text-[var(--color-on-surface-variant)]">
              This stage is active in the study sequence. The stage guard and session state are active.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded bg-[var(--color-error-container)]/30 text-[var(--color-error)] text-xs font-[var(--font-ui)]">
              {error}
            </div>
          )}

          {nextStage && (
            <div className="pt-4 border-t border-[var(--color-outline-variant)]/40 flex justify-center">
              <Button
                onClick={handleNext}
                isLoading={advancing}
                className="inline-flex items-center justify-center gap-2"
              >
                <span>Proceed to Next Stage ({STUDY_CONFIG.STAGE_LABELS[nextStage]})</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
