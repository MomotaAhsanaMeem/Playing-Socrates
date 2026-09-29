/**
 * app/complete/page.tsx
 * Study complete — thank you screen.
 *
 * Shows the participant's completion code and a "Start new session" link
 * that clears the session cookies (via /api/session/reset) so the next
 * participant (or tester) can begin fresh at /consent.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getParticipantId } from "@/lib/session";

export const metadata: Metadata = {
  title: "Study Completed | Playing Socrates",
  description: "Thank you for participating in the study.",
};

export default async function CompletePage() {
  const pid = await getParticipantId();
  const shortCode = pid ? pid.substring(0, 8).toUpperCase() : "N/A";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="max-w-lg w-full text-center">

        {/* Success icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-primary-container)] mb-8 shadow-lg">
          <span
            className="material-symbols-outlined text-[var(--color-on-primary-container)] text-5xl"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            task_alt
          </span>
        </div>

        <h1 className="font-[var(--font-display)] text-[length:var(--text-headline-lg)] font-bold text-[var(--color-on-surface)] mb-4">
          Study Complete!
        </h1>

        <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] leading-relaxed mb-8">
          Thank you for participating. Your responses have been securely recorded.
          Please note your completion code below and submit it to receive your credit.
        </p>

        {/* Completion code */}
        <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl p-6 mb-8">
          <p className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">
            Your Completion Code
          </p>
          <p
            className="font-[var(--font-display)] text-[length:var(--text-headline-lg)] font-bold text-[var(--color-primary)] tracking-wider select-all"
            aria-label={`Completion code: ${shortCode}`}
          >
            {shortCode}
          </p>
          <p className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] text-[var(--color-on-surface-variant)] mt-2">
            Click the code to select it, then copy.
          </p>
        </div>

        <p className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] mb-10">
          You may now close this browser window. If you have questions about this
          study, please contact the research team.
        </p>

        {/* Divider */}
        <div className="border-t border-[var(--color-outline-variant)] pt-8">
          <p className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)] mb-4">
            Running another test or a new participant?
          </p>
          {/* Link to /api/session/reset — clears cookies and redirects to /consent */}
          <Link
            href="/api/session/reset"
            className="inline-flex items-center gap-2 border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] font-[var(--font-ui)] text-[length:var(--text-label-md)] font-semibold px-5 py-2.5 rounded-lg hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              refresh
            </span>
            Start a new session
          </Link>
        </div>

      </div>
    </div>
  );
}
