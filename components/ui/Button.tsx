/**
 * components/ui/Button.tsx
 * Primary and secondary button variants.
 * Matches design: bg-primary text-on-primary font-label-md, rounded (4px),
 * hover→bg-surface-tint, disabled→opacity-50 cursor-not-allowed.
 */
"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize   = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-on-primary)] " +
    "hover:bg-[var(--color-surface-tint)] " +
    "focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
  secondary:
    "border border-[var(--color-secondary)] text-[var(--color-secondary)] bg-transparent " +
    "hover:bg-[var(--color-surface-container-low)] " +
    "focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2",
  ghost:
    "text-[var(--color-on-surface-variant)] bg-transparent " +
    "hover:bg-[var(--color-surface-container)] " +
    "focus-visible:ring-2 focus-visible:ring-[var(--color-outline)] focus-visible:ring-offset-2",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[length:var(--text-label-md)] leading-[var(--text-label-md--line-height)]",
  md: "px-6 py-3 text-[length:var(--text-label-md)] leading-[var(--text-label-md--line-height)]",
  lg: "px-8 py-4 text-[length:var(--text-label-md)] leading-[var(--text-label-md--line-height)]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          "inline-flex items-center justify-center gap-2 rounded font-[var(--font-ui)] font-semibold",
          "transition-colors duration-150 outline-none select-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              className="material-symbols-outlined animate-spin text-[18px]"
              aria-hidden="true"
            >
              progress_activity
            </span>
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
