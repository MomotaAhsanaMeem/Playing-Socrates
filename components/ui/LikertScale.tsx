/**
 * components/ui/LikertScale.tsx
 * 7-point Likert scale using circular radio buttons.
 * Matches trust_calibration design: w-10 h-10 rounded-full, numbered 1–7.
 * Used for: trust questionnaire items + per-message trust slider in chat.
 */
"use client";

interface LikertScaleProps {
  name: string;
  label?: string;
  value: number | null;
  onChange: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function LikertScale({
  name,
  label,
  value,
  onChange,
  leftLabel = "Strongly disagree",
  rightLabel = "Strongly agree",
  min = 1,
  max = 7,
  disabled = false,
}: LikertScaleProps) {
  const points = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <fieldset className="w-full" disabled={disabled}>
      {label && (
        <legend className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)] mb-4 uppercase tracking-[0.05em]">
          {label}
        </legend>
      )}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {leftLabel && (
          <span className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] w-full md:w-auto text-center md:text-left shrink-0">
            {leftLabel}
          </span>
        )}
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between md:justify-center">
          {points.map((pt) => {
            const checked = value === pt;
            const inputId = `${name}-${pt}`;
            return (
              <label key={pt} htmlFor={inputId} className="cursor-pointer group flex flex-col items-center">
                <input
                  id={inputId}
                  name={name}
                  type="radio"
                  value={pt}
                  checked={checked}
                  onChange={() => onChange(pt)}
                  className="sr-only"
                  disabled={disabled}
                />
                <div
                  className={[
                    "trust-radio-btn select-none",
                    checked ? "[data-checked=true]" : "",
                  ].join(" ")}
                  data-checked={checked}
                  aria-hidden="true"
                >
                  {pt}
                </div>
              </label>
            );
          })}
        </div>
        {rightLabel && (
          <span className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] w-full md:w-auto text-center md:text-right shrink-0">
            {rightLabel}
          </span>
        )}
      </div>
    </fieldset>
  );
}
