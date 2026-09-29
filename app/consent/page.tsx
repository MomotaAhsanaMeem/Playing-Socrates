/**
 * app/consent/page.tsx
 * Stage 1 — Informed Consent.
 * Design: /design/consent/code.html
 *
 * Features:
 * - Scrollable consent text inside a fixed-height card.
 * - Checkbox required before the CTA button becomes active.
 * - On submit → POST /api/participant → redirect to /background.
 * - Scroll-gate: CTA button only un-disables after user scrolls past 80% of
 *   the consent text (enforced client-side via scroll event).
 */
import type { Metadata } from "next";
import ConsentClient from "./ConsentClient";

export const metadata: Metadata = { title: "Informed Consent" };

export default function ConsentPage() {
  return <ConsentClient />;
}
