/**
 * components/chat/TrustSlider.tsx
 * Per-message trust rating widget (spec §5).
 * Rendered after each AI message; blocks next input until submitted.
 * Uses the LikertScale component (1–7 circular buttons).
 * Matches trust_calibration design exactly.
 */
"use client";

import { useState } from "react";
import LikertScale from "@/components/ui/LikertScale";
import Button from "@/components/ui/Button";

interface TrustSliderProps {
  messageId: string;
  onSubmit: (messageId: string, rating: number) => Promise<void>;
}

export default function TrustSlider({ messageId, onSubmit }: TrustSliderProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === null || submitting) return;
    setSubmitting(true);
    await onSubmit(messageId, rating);
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) return null;

  return (
    <div className="w-full max-w-[var(--spacing-content-max)] mx-auto mt-4">
      <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 text-[var(--color-on-surface-variant)] mb-6">
          <span className="material-symbols-outlined" aria-hidden="true">psychology</span>
          <span className="font-[var(--font-ui)] text-[length:var(--text-label-md)]">
            Trust Calibration
          </span>
        </div>

        <h2 className="font-[var(--font-headline)] text-[length:var(--text-headline-lg-mobile)] md:text-[length:var(--text-headline-lg)] font-semibold text-[var(--color-primary)] mb-6 leading-[var(--text-headline-lg--line-height)]">
          How much do you trust this answer?
        </h2>

        <LikertScale
          name={`trust-${messageId}`}
          value={rating}
          onChange={setRating}
          leftLabel="Not at all"
          rightLabel="Completely"
        />

        <div className="flex justify-end pt-6 border-t border-[var(--color-outline-variant)] mt-6">
          <Button
            onClick={handleSubmit}
            disabled={rating === null}
            isLoading={submitting}
            size="md"
          >
            Continue
            <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
