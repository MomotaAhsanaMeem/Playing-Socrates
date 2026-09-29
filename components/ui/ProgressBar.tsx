/**
 * components/ui/ProgressBar.tsx
 * Linear progress bar used in test questions ("10% Completed").
 * Matches design: h-1 bg-surface-variant rounded-full with primary fill.
 */
interface ProgressBarProps {
  /** Value 0–100 */
  value: number;
  /** Optional label shown above the bar (e.g. "Question 1 of 10") */
  label?: string;
  /** Optional right-side label (e.g. "10% Completed") */
  rightLabel?: string;
  className?: string;
}

export default function ProgressBar({
  value,
  label,
  rightLabel,
  className = "",
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full ${className}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      {(label || rightLabel) && (
        <div className="flex justify-between items-end mb-2">
          {label && (
            <span className="font-[var(--font-ui)] text-[length:var(--text-headline-lg-mobile)] font-semibold text-[var(--color-on-surface)] leading-[var(--text-headline-lg-mobile--line-height)] md:text-[length:var(--text-headline-lg)] md:leading-[var(--text-headline-lg--line-height)]">
              {label}
            </span>
          )}
          {rightLabel && (
            <span className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)]">
              {rightLabel}
            </span>
          )}
        </div>
      )}
      <div className="w-full h-1 bg-[var(--color-surface-variant)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
