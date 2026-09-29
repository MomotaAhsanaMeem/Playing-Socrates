"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";

export default function ConsentClient() {
  const router = useRouter();
  const [checked, setChecked]       = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll-gate: enable checkbox once user has scrolled ≥ 75%
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      const scrollable = el.scrollHeight - el.clientHeight;
      if (scrollable <= 30) {
        setScrolled(true);
        return;
      }
      const pct = el.scrollTop / scrollable;
      if (pct >= 0.75) setScrolled(true);
    };
    check();
    el.addEventListener("scroll", check);
    return () => el.removeEventListener("scroll", check);
  }, []);

  const canProceed = checked && scrolled;

  const handleSubmit = async () => {
    if (!canProceed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/participant", { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Server error");
      }
      router.push("/background");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <PageShell currentStage="consent">
      <div className="w-full max-w-[720px] mx-auto px-4 md:px-0 pt-24 md:pt-12 pb-24">

        {/* Mobile step indicator */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <span className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)]">
            Step 1 of 9: Consent
          </span>
        </div>

        {/* Main card */}
        <article className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-xl shadow-sm w-full overflow-hidden flex flex-col"
                 style={{ maxHeight: "calc(100vh - 140px)", minHeight: "520px" }}>

          {/* Header */}
          <header className="px-6 py-8 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shrink-0">
            <h1 className="font-[var(--font-display)] text-[length:var(--text-headline-lg-mobile)] md:text-[length:var(--text-headline-lg)] font-semibold text-[var(--color-on-surface)] mb-2 leading-[var(--text-headline-lg--line-height)]">
              Informed Consent
            </h1>
            <p className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)]">
              Please read the following information carefully before proceeding.
            </p>
          </header>

          {/* Scrollable body */}
          <div
            ref={scrollRef}
            className="px-6 py-6 overflow-y-auto custom-scrollbar flex-1 space-y-6"
          >
            <section>
              <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-md)] font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                1. Study Purpose
              </h2>
              <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] text-[var(--color-on-surface-variant)]">
                This study investigates how different AI tutoring interaction styles affect
                learning outcomes, trust in AI, and cognitive load. You will interact with an
                AI tutor on a science topic. The entire session takes approximately 45–60 minutes.
              </p>
            </section>

            <section>
              <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-md)] font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                2. Procedures
              </h2>
              <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] text-[var(--color-on-surface-variant)] mb-3">
                If you agree to participate, you will:
              </p>
              <ul className="list-disc pl-5 font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] text-[var(--color-on-surface-variant)] space-y-2">
                <li>Complete a short background questionnaire.</li>
                <li>Take a pre-test to assess your baseline knowledge.</li>
                <li>Engage in an AI-assisted learning session (8 turns).</li>
                <li>Take a post-test to measure knowledge gain.</li>
                <li>Complete two brief questionnaires on trust and mental effort.</li>
                <li>Read a debrief explaining the study&apos;s purpose and methods.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-md)] font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                3. Risks and Discomforts
              </h2>
              <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] text-[var(--color-on-surface-variant)]">
                There are no anticipated physical risks. You may experience mild mental fatigue.
                You are free to take breaks or withdraw at any time without penalty.
              </p>
            </section>

            <section>
              <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-md)] font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                4. Important Notice: Planted Information
              </h2>
              <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] text-[var(--color-on-surface-variant)]">
                As part of measuring trust calibration, the AI tutor will intentionally include
                a small number of incorrect statements. These will be clearly identified and
                corrected in the debrief at the end of the study.
              </p>
            </section>

            <section>
              <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-md)] font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                5. Confidentiality and Privacy
              </h2>
              <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] text-[var(--color-on-surface-variant)]">
                All data is anonymous. You will be assigned a random participant ID — no names,
                emails, or IP addresses are stored. Data is retained on encrypted servers and
                accessible only to the research team. You may request deletion of your data at
                any time using the Withdraw option.
              </p>
            </section>

            <section>
              <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-md)] font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
                6. Voluntary Participation
              </h2>
              <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] text-[var(--color-on-surface-variant)]">
                Participation is entirely voluntary. You may withdraw at any time by clicking
                &ldquo;Withdraw&rdquo; in the navigation menu, which will immediately and permanently
                delete all data associated with your session.
              </p>
            </section>

            {/* Spacer so user must scroll to reach the checkbox */}
            <div className="h-8" aria-hidden="true" />
          </div>

          {/* Footer */}
          <footer className="px-6 py-6 border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shrink-0">

            {/* Scroll hint */}
            {!scrolled && (
              <p className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] text-[var(--color-outline)] text-center mb-4 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">keyboard_arrow_down</span>
                Please scroll to the bottom to continue
              </p>
            )}

            {/* Consent checkbox */}
            <label className="flex items-start gap-3 cursor-pointer mb-6 group">
              <div className="relative flex items-center mt-1 flex-shrink-0">
                <input
                  id="consent-checkbox"
                  type="checkbox"
                  checked={checked}
                  disabled={!scrolled}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[var(--color-outline)] bg-[var(--color-surface)] checked:border-[var(--color-primary)] checked:bg-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                />
                <span
                  className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none opacity-0 peer-checked:opacity-100"
                  style={{ fontSize: "16px", fontWeight: "700" }}
                  aria-hidden="true"
                >
                  check
                </span>
              </div>
              <span className="font-[var(--font-body)] text-[length:var(--text-body-sm)] leading-[var(--text-body-sm--line-height)] text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
                I have read and understood the informed consent information above, and I
                voluntarily agree to participate in this study. I understand I can withdraw at
                any time.
              </span>
            </label>

            {/* Error message */}
            {error && (
              <p className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-error)] mb-4" role="alert">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <button
                id="consent-continue-btn"
                onClick={handleSubmit}
                disabled={!canProceed || submitting}
                className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-[var(--font-ui)] font-semibold text-[length:var(--text-label-md)] px-6 py-3 rounded transition-colors hover:bg-[var(--color-surface-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm" aria-hidden="true">progress_activity</span>
                    Starting…
                  </>
                ) : (
                  <>
                    Agree and Continue
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </footer>
        </article>
      </div>
    </PageShell>
  );
}
