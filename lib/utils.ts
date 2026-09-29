/**
 * lib/utils.ts
 * Shared utilities. Currently only cn() for class merging.
 */

/** Merge class names (lightweight alternative to clsx/tailwind-merge). */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
