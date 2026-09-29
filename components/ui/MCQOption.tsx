/**
 * components/ui/MCQOption.tsx
 * Multiple-choice question option.
 * Matches design: border border-outline-variant rounded-xl p-4 flex items-center gap-4,
 * with radio_button_unchecked / radio_button_checked Material icons.
 * Selected state: bg-surface-container-low + border-primary.
 */
"use client";

interface MCQOptionProps {
  id: string;
  name: string;
  value: string | number;
  label: string;
  checked?: boolean;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
}

export default function MCQOption({
  id,
  name,
  value,
  label,
  checked = false,
  onChange,
  disabled = false,
}: MCQOptionProps) {
  return (
    <label
      htmlFor={id}
      className={[
        "flex items-center gap-4 p-4 rounded-xl border cursor-pointer",
        "transition-colors duration-150",
        checked
          ? "border-[var(--color-primary)] bg-[var(--color-surface-container-low)]"
          : "border-[var(--color-outline-variant)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]",
        disabled && "opacity-50 cursor-not-allowed",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        id={id}
        name={name}
        type="radio"
        value={String(value)}
        checked={checked}
        onChange={() => !disabled && onChange?.(value)}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className="material-symbols-outlined text-2xl transition-colors flex-shrink-0"
        style={{
          color: checked
            ? "var(--color-primary)"
            : "var(--color-outline-variant)",
          fontVariationSettings: checked ? "'FILL' 1" : "'FILL' 0",
        }}
        aria-hidden="true"
      >
        {checked ? "radio_button_checked" : "radio_button_unchecked"}
      </span>
      <span
        className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] text-[var(--color-on-surface)]"
      >
        {label}
      </span>
    </label>
  );
}
