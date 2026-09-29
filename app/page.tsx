/**
 * app/page.tsx — Landing / Welcome page (Stage 1 of 9)
 * Matches /design/welcome/code.html exactly.
 * Hero card, study description, "Get Started" → /consent.
 */
import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Welcome",
};

export default function WelcomePage() {
  return (
    <PageShell currentStage="consent">
      {/* Content canvas: max-width 720px, centred */}
      <div className="w-full max-w-[var(--spacing-content-max)] mx-auto px-[var(--spacing-margin-mobile)] md:px-0 pt-24 md:pt-16 pb-24">

        {/* Hero Header */}
        <div className="mb-12 text-center mt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary)] mb-6 shadow-sm">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
              waving_hand
            </span>
          </div>
          <h1 className="font-[var(--font-display)] text-[length:var(--text-headline-lg-mobile)] md:text-[length:var(--text-display-lg)] font-bold text-[var(--color-on-background)] mb-4 leading-[var(--text-display-lg--line-height)] tracking-[var(--text-display-lg--letter-spacing)]">
            Welcome to the Playing Socrates Study
          </h1>
          <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] text-[var(--color-on-surface-variant)] max-w-lg mx-auto">
            An exploration of AI-assisted learning and how different tutoring approaches affect understanding.
          </p>
        </div>

        {/* Intro Card */}
        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-xl p-8 mb-[var(--spacing-section-gap)] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[var(--color-outline)] transition-colors duration-300">
          <div className="space-y-6 font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] text-[var(--color-on-surface)]">
            <p>
              Thank you for participating in this research study. We are investigating how different styles
              of AI tutoring affect how well people learn, how much they trust AI explanations,
              and how much mental effort the session requires.
            </p>

            {/* Socratic Feedback Block style callout */}
            <div className="bg-[var(--color-tertiary-fixed)] border-l-4 border-[var(--color-primary)] p-6 rounded-r-lg">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[var(--color-primary)] mt-1" aria-hidden="true">
                  psychology
                </span>
                <div>
                  <h3 className="font-[var(--font-ui)] text-[length:var(--text-label-md)] font-bold text-[var(--color-on-surface)] mb-1 uppercase tracking-[0.05em]">
                    What to expect
                  </h3>
                  <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] text-[var(--color-on-surface-variant)]">
                    You will complete a short pre-test, engage in an AI-assisted learning session
                    on a science topic, then complete a post-test and two brief questionnaires.
                  </p>
                </div>
              </div>
            </div>

            <p>
              The entire session takes approximately 45–60 minutes. Your participation is anonymous
              — all data is stored against a random participant ID, never your name or contact information.
            </p>

            <p className="font-[var(--font-body)] text-[length:var(--text-body-sm)] leading-[var(--text-body-sm--line-height)] text-[var(--color-on-surface-variant)] italic">
              Estimated time to complete: 45–60 minutes.
            </p>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[var(--color-outline-variant)]/50 pt-8">
          {/* Mini step dots */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 items-center" aria-hidden="true">
              <div className="w-4 h-2 bg-[var(--color-primary)] rounded-full" />
              <div className="w-2 h-2 rounded-full bg-[var(--color-outline-variant)]" />
              <div className="w-2 h-2 rounded-full bg-[var(--color-outline-variant)]" />
            </div>
            <span className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)] ml-2">
              Step 1 of 9
            </span>
          </div>

          <Link
            href="/consent"
            id="welcome-get-started"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--color-primary-container)] text-[var(--color-on-primary)] font-[var(--font-ui)] font-bold text-[length:var(--text-label-md)] py-4 px-8 rounded hover:bg-[var(--color-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          >
            Get Started
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
