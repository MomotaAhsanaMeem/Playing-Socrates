/**
 * components/chat/ChatBubble.tsx
 * Chat message bubble.
 *
 * Student messages (role="student"):
 *   Right-aligned, bg-surface-container-high, border-outline-variant, rounded-2xl rounded-tr-sm
 *
 * AI messages — Direct (condition="direct"):
 *   Left-aligned, bg-surface-container-lowest, border-outline-variant, rounded-2xl rounded-tl-sm
 *   Includes a header strip: school icon + "Socrates (Direct Explanation)"
 *
 * AI messages — Socratic/Adaptive (condition="socratic"|"adaptive"):
 *   Left-aligned, bg-[#E3F2FD] border-l-4 border-primary (Socratic Feedback Block)
 *   Optional mode badge (Adaptive only: e.g. "Partial Understanding")
 */
import { Condition } from "@/config/study";

interface ChatBubbleProps {
  role: "student" | "ai";
  content: string;
  condition: Condition;
  /** Optional override label for the AI header (Adaptive shows assessment state) */
  aiLabel?: string;
  isPlantedError?: boolean; // not shown to participant; used for logging only
}

export default function ChatBubble({
  role,
  content,
  condition,
  aiLabel,
}: ChatBubbleProps) {
  if (role === "student") {
    return (
      <div className="flex justify-end w-full">
        <div className="bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] rounded-2xl rounded-tr-sm px-6 py-4 max-w-[85%] border border-[var(--color-outline-variant)] shadow-sm">
          <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)]">
            {content}
          </p>
        </div>
      </div>
    );
  }

  // AI message — Direct mode
  if (condition === "direct") {
    return (
      <div className="flex justify-start w-full">
        <div className="bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] rounded-2xl rounded-tl-sm px-6 py-5 max-w-[90%] border border-[var(--color-outline-variant)] shadow-sm">
          <div className="flex items-center gap-2 mb-3 border-b border-[var(--color-surface-variant)] pb-2">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-sm" aria-hidden="true">
              school
            </span>
            <span className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-primary)]">
              {aiLabel ?? "Socrates AI"}
            </span>
          </div>
          <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)]">
            {content}
          </p>
        </div>
      </div>
    );
  }

  // AI message — Socratic or Adaptive mode (Socratic Feedback Block)
  return (
    <div className="flex flex-col items-start gap-2 w-full">
      {/* AI avatar + label */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[var(--color-primary-container)] text-[var(--color-on-primary)] flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            psychology
          </span>
        </div>
        <span className="font-[var(--font-ui)] text-[length:var(--text-label-md)] font-semibold text-[var(--color-primary)]">
          {aiLabel ?? "Socrates AI"}
        </span>
      </div>
      {/* Socratic feedback block */}
      <div className="ai-block-socratic max-w-[90%] shadow-sm">
        <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] text-[var(--color-on-surface)]">
          {content}
        </p>
      </div>
    </div>
  );
}
