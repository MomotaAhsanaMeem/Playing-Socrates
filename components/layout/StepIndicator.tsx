/**
 * components/layout/StepIndicator.tsx
 * "Step N of 9" label + pill progress shown in the desktop top context bar.
 * Deliberately shows stage index only (no stage name that could reveal condition).
 */
import { Stage, STUDY_CONFIG } from "@/config/study";

interface StepIndicatorProps {
  currentStage: Stage;
}

export default function StepIndicator({ currentStage }: StepIndicatorProps) {
  const stages = STUDY_CONFIG.STAGES as unknown as Stage[];
  const currentIndex = stages.indexOf(currentStage);
  const total = stages.length;
  const stepNumber = currentIndex + 1;

  return (
    <div className="flex items-center gap-3">
      <span className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-primary)]">
        Step {stepNumber} of {total}
      </span>
      {/* Mini stepper dots */}
      <div className="flex gap-1 items-center">
        {stages.map((_, idx) => (
          <div
            key={idx}
            className={[
              "rounded-full transition-all",
              idx < currentIndex  && "w-2 h-2 bg-[var(--color-primary)]",
              idx === currentIndex && "w-4 h-2 bg-[var(--color-primary)] rounded-full",
              idx > currentIndex  && "w-2 h-2 bg-[var(--color-outline-variant)]",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
