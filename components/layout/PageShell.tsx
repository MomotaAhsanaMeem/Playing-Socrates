/**
 * components/layout/PageShell.tsx
 * Main page layout: sidebar nav (desktop) + mobile top bar + content area.
 * Matches all 13 design screens that use the standard nav shell.
 *
 * Nav items show 9 stages. Active item gets the primary accent style.
 * Future stages are greyed/disabled; past stages show a check icon.
 * Condition is NEVER shown in any label.
 */
import { Stage } from "@/config/study";
import { STUDY_CONFIG } from "@/config/study";
import StepIndicator from "@/components/layout/StepIndicator";

import WithdrawButton from "@/components/layout/WithdrawButton";

const NAV_ICONS: Record<Stage, string> = {
  consent:    "assignment",
  background: "person",
  pretest:    "quiz",
  session:    "smart_toy",
  posttest:   "fact_check",
  trust:      "psychology",
  cogload:    "monitor_heart",
  debrief:    "info",
  complete:   "check_circle",
};

interface PageShellProps {
  currentStage: Stage;
  participantId?: string;
  children: React.ReactNode;
  /** Set true on transactional screens that suppress the sidebar (trust_calibration, post_test_completion) */
  suppressNav?: boolean;
}

export default function PageShell({
  currentStage,
  participantId,
  children,
  suppressNav = false,
}: PageShellProps) {
  const stages = STUDY_CONFIG.STAGES as unknown as Stage[];
  const currentIndex = stages.indexOf(currentStage);

  const shortId = participantId
    ? participantId.substring(0, 8).toUpperCase()
    : "—";

  return (
    <div className="min-h-screen flex bg-[var(--color-background)]">
      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      {!suppressNav && (
        <nav
          aria-label="Study progress"
          className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[var(--color-surface-container-low)] border-r border-[var(--color-outline-variant)] py-8 z-40"
        >
          {/* Brand + step indicator */}
          <div className="px-[var(--spacing-gutter)] mb-8">
            <span className="font-[var(--font-display)] text-[length:var(--text-headline-lg)] font-bold text-[var(--color-primary)] tracking-tight block">
              Playing Socrates
            </span>
            <p className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)] mt-2">
              ID: {shortId}
            </p>
          </div>

          {/* Stage list */}
          <ul className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
            {stages.map((stage, idx) => {
              const isActive  = stage === currentStage;
              const isPast    = idx < currentIndex;
              const isFuture  = idx > currentIndex;
              const label = STUDY_CONFIG.STAGE_LABELS[stage];
              const icon  = NAV_ICONS[stage];

              return (
                <li key={stage}>
                  <div
                    role="listitem"
                    aria-current={isActive ? "step" : undefined}
                    className={[
                      "flex items-center gap-3 px-3 py-3 rounded-lg font-[var(--font-ui)] text-[length:var(--text-label-md)]",
                      isActive  && "nav-item-active pointer-events-none",
                      isPast    && "text-[var(--color-on-surface-variant)] opacity-70 cursor-default",
                      isFuture  && "text-[var(--color-on-surface-variant)] opacity-40 cursor-not-allowed",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className="material-symbols-outlined flex-shrink-0" aria-hidden="true"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      {isPast ? "check_circle" : icon}
                    </span>
                    <span>{label}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Sidebar bottom withdrawal option */}
          <div className="px-3 pt-3 mt-auto border-t border-[var(--color-outline-variant)]/60">
            <WithdrawButton variant="sidebar" />
          </div>
        </nav>
      )}

      {/* ── Mobile Top Bar ────────────────────────────────────────────────── */}
      {!suppressNav && (
        <header className="md:hidden fixed top-0 w-full bg-[var(--color-surface)] border-b border-[var(--color-outline-variant)] z-30 flex justify-between items-center px-[var(--spacing-gutter)] py-3 shadow-sm">
          <span className="font-[var(--font-display)] text-[length:var(--text-headline-lg-mobile)] font-bold text-[var(--color-primary)]">
            Playing Socrates
          </span>
          <div className="flex items-center gap-2">
            <div className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">account_circle</span>
              {shortId}
            </div>
            <WithdrawButton variant="header" />
          </div>
        </header>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main
        className={[
          "flex-1 min-h-screen",
          !suppressNav && "md:ml-64",
          !suppressNav && "pt-[72px] md:pt-0",  /* push below mobile header */
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Desktop top context bar */}
        {!suppressNav && (
          <div className="hidden md:flex justify-between items-center px-[var(--spacing-gutter)] py-4 w-full border-b border-[var(--color-outline-variant)]/30 sticky top-0 bg-[var(--color-background)]/80 backdrop-blur-md z-20">
            <StepIndicator currentStage={currentStage} />
            <div className="flex items-center gap-4">
              <div className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">account_circle</span>
                ID: {shortId}
              </div>
              <WithdrawButton variant="header" />
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
