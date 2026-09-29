/**
 * components/ui/Card.tsx
 * Base content card. Matches design: bg-surface-container-lowest border border-outline-variant
 * rounded-xl shadow-sm, 24–32px padding, hover:border-outline transition.
 */
import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** If true, the card border turns primary on hover (from design) */
  interactive?: boolean;
  /** Custom padding class override */
  padding?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ interactive = false, padding = "p-6 md:p-8", className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-xl shadow-sm",
        "transition-colors duration-200",
        interactive && "hover:border-[var(--color-outline)] cursor-pointer",
        padding,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = "Card";
export default Card;
