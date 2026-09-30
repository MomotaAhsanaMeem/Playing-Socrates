/**
 * app/session/SessionClient.tsx
 * Full chat UI for the AI Learning Session (spec §5).
 *
 * Behaviour:
 *  - One textarea + send button. Sends message to /api/tutor.
 *  - After each AI reply, shows TrustSlider (1–7). Next input blocked until rated.
 *  - Turn counter shows "X / 8 turns used".
 *  - After MAX_TURNS student messages, input locks and "Continue to Post-Test" appears.
 *  - Resumes from server-provided message history after a page refresh.
 *  - Loading/error states on every network call.
 *  - Retry once on API failure (handled inside /api/tutor; client sees 500 → shows error).
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import TrustSlider from "@/components/chat/TrustSlider";
import Button from "@/components/ui/Button";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ResumedMessage {
  id: string;
  role: "student" | "ai";
  content: string;
  trustRating: number | null;
}

interface LocalMessage {
  /** Temp client ID before server assigns DB id (prefixed "tmp-") */
  id: string;
  role: "student" | "ai";
  content: string;
  /** DB message id — null until server confirms */
  dbId: string | null;
  /** Whether this AI message needs a trust rating before next turn */
  needsTrustRating: boolean;
  trustRated: boolean;
}

interface SessionClientProps {
  participantId: string;
  resumedMessages: ResumedMessage[];
  initialStudentTurnIndex: number;
  maxTurns: number;
  topic: string;
  limitAlreadyReached: boolean;
}

// We don't know the condition client-side (spec §4 — never reveal to participant).
// ChatBubble accepts "direct" | "socratic" | "adaptive", so we use a stable
// neutral visual that works for all: we pass "socratic" (which gives the left-
// aligned blue block) — the label just says "AI Tutor".
// The actual condition is only used in the system prompt on the server.
const DISPLAY_CONDITION = "socratic" as const;

let tmpCounter = 0;
function tmpId() {
  return `tmp-${++tmpCounter}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SessionClient({
  participantId,
  resumedMessages,
  initialStudentTurnIndex,
  maxTurns,
  topic,
  limitAlreadyReached,
}: SessionClientProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // ── State ──────────────────────────────────────────────────────────────────

  // Convert resumed messages to local format
  const initMessages: LocalMessage[] = resumedMessages.map((m) => ({
    id:              m.id,
    role:            m.role,
    content:         m.content,
    dbId:            m.id,
    // If an AI message already has a rating, it doesn't need one again
    needsTrustRating: m.role === "ai" && m.trustRating === null,
    trustRated:       m.role === "ai" ? m.trustRating !== null : true,
  }));

  const [messages, setMessages]           = useState<LocalMessage[]>(initMessages);
  const [inputValue, setInputValue]       = useState("");
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [studentTurnIndex, setStudentTurnIndex] = useState(initialStudentTurnIndex);
  const [limitReached, setLimitReached]   = useState(limitAlreadyReached);
  const [isAdvancing, setIsAdvancing]     = useState(false);

  // Whether the last AI message still needs a trust rating
  const lastAiNeedsRating = messages.some(
    (m) => m.role === "ai" && m.needsTrustRating && !m.trustRated
  );

  // canSend = the full condition for the SEND BUTTON (all guards + non-empty input)
  const canSend =
    !isLoading &&
    !limitReached &&
    !lastAiNeedsRating &&
    inputValue.trim().length > 0;

  // inputBlocked = only blocking states that prevent TYPING (not the empty-input check)
  // This lets the textarea receive focus even when the box is empty.
  const inputBlocked = isLoading || limitReached || lastAiNeedsRating;

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!canSend) return;

    const text = inputValue.trim();
    setInputValue("");
    setError(null);

    // Optimistic: add student bubble immediately
    const studentTmpId = tmpId();
    setMessages((prev) => [
      ...prev,
      {
        id:               studentTmpId,
        role:             "student",
        content:          text,
        dbId:             null,
        needsTrustRating: false,
        trustRated:       true,
      },
    ]);
    setIsLoading(true);

    // Build history from current confirmed messages (exclude the optimistic one)
    const history = messages
      .filter((m) => m.dbId !== null) // only DB-confirmed messages
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/tutor", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          message:          text,
          history,
          studentTurnIndex,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      const {
        reply,
        messageId,
        studentTurnIndex: nextTurnIndex,
        limitReached:     newLimitReached,
      } = data;

      const aiTmpId = tmpId();

      setMessages((prev) => [
        ...prev.map((m) =>
          // Confirm the optimistic student bubble with real DB id
          m.id === studentTmpId ? { ...m, dbId: messageId ?? studentTmpId } : m
        ),
        {
          id:               aiTmpId,
          role:             "ai",
          content:          reply,
          dbId:             messageId,
          needsTrustRating: true,
          trustRated:       false,
        },
      ]);

      setStudentTurnIndex(nextTurnIndex);
      setLimitReached(newLimitReached ?? false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      // Remove the optimistic student bubble on failure
      setMessages((prev) => prev.filter((m) => m.id !== studentTmpId));
      setInputValue(text); // restore input
    } finally {
      setIsLoading(false);
    }
  }, [canSend, inputValue, messages, studentTurnIndex]);

  // ── Trust rating ───────────────────────────────────────────────────────────
  const handleTrustRating = useCallback(
    async (localMessageId: string, rating: number) => {
      // Find the message to get its DB id
      const msg = messages.find((m) => m.id === localMessageId);
      if (!msg?.dbId) {
        // If no DB id yet, just mark as rated locally (edge case)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === localMessageId ? { ...m, trustRated: true, needsTrustRating: false } : m
          )
        );
        return;
      }

      try {
        await fetch("/api/tutor/trust", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ messageId: msg.dbId, rating }),
        });
      } catch (e) {
        console.error("Trust rating save failed:", e);
        // Non-blocking — allow participant to continue even if save fails
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === localMessageId
            ? { ...m, trustRated: true, needsTrustRating: false }
            : m
        )
      );
    },
    [messages]
  );

  // ── Advance to post-test ───────────────────────────────────────────────────
  const handleContinue = useCallback(async () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    try {
      await fetch("/api/stage/advance", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ fromStage: "session", toStage: "posttest" }),
      });
      router.push("/posttest");
    } catch {
      setIsAdvancing(false);
    }
  }, [isAdvancing, router]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageShell currentStage="session" participantId={participantId}>
      {/*
        Layout: relative outer shell so ChatInput's `absolute bottom-0` anchors
        to this container, not to a zero-height flex child.
        h-screen fills the viewport; flex-col stacks top-bar + messages + (implicit
        space consumed by the absolute input bar via pb-28 on the messages div).
      */}
      <div className="relative flex flex-col" style={{ height: '100dvh' }}>
        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div className="flex-none px-4 md:px-[var(--spacing-gutter)] py-3 md:py-4 border-b border-[var(--color-outline-variant)]/40 bg-[var(--color-background)]/80 backdrop-blur-md">
          <div className="max-w-[var(--spacing-content-max)] mx-auto flex items-center justify-between gap-4">
            <div>
              <h1 className="font-[var(--font-display)] text-base md:text-[length:var(--text-headline-lg-mobile)] font-bold text-[var(--color-on-surface)] leading-tight">
                AI Learning Session
              </h1>
              <p className="font-[var(--font-ui)] text-xs md:text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)] mt-0.5">
                Topic: <span className="font-semibold">{topic}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
              {/* Early advance button when user has completed at least 1 set and not waiting for rating */}
              {studentTurnIndex > 0 && !limitReached && !lastAiNeedsRating && (
                <Button
                  id="top-bar-continue-btn"
                  variant="secondary"
                  size="sm"
                  onClick={handleContinue}
                  isLoading={isAdvancing}
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Finish &amp; </span>Continue
                  <span className="material-symbols-outlined text-xs md:text-sm" aria-hidden="true">
                    arrow_forward
                  </span>
                </Button>
              )}

              {/* Turn counter */}
              <div className="flex flex-col items-end gap-1">
                <span className="font-[var(--font-ui)] text-[10px] md:text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)]">
                  Sets used
                </span>
                <span className="font-[var(--font-ui)] text-sm md:text-[length:var(--text-headline-lg-mobile)] font-bold text-[var(--color-primary)]">
                  {Math.min(studentTurnIndex, maxTurns)}
                  <span className="text-[var(--color-outline)] font-normal text-xs md:text-sm"> / {maxTurns}</span>
                </span>
                {/* Mini progress bar */}
                <div className="w-20 md:w-32 h-1.5 bg-[var(--color-surface-container)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((studentTurnIndex / maxTurns) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Message list ─────────────────────────────────────────────────── */}
        {/* pb-28 md:pb-32 reserves space so the absolute ChatInput bar never covers messages */}
        <div className="flex-1 overflow-y-auto min-h-0 px-[var(--spacing-gutter)] py-6 pb-28 md:pb-32">
          <div className="max-w-[var(--spacing-content-max)] mx-auto space-y-6">
            {/* Empty state — first message */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[var(--color-on-primary-container)] text-3xl" aria-hidden="true">
                    school
                  </span>
                </div>
                <h2 className="font-[var(--font-display)] text-[length:var(--text-headline-lg-mobile)] font-bold text-[var(--color-on-surface)] mb-2">
                  Ready to learn?
                </h2>
                <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] max-w-sm">
                  Ask your AI tutor anything about <strong>{topic}</strong>. You have up to {maxTurns} sets, or you can finish earlier whenever you&apos;re ready.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <div key={msg.id}>
                <ChatBubble
                  role={msg.role}
                  content={msg.content}
                  condition={DISPLAY_CONDITION}
                  aiLabel="AI Tutor"
                />
                {/* Trust slider after AI messages that haven't been rated */}
                {msg.role === "ai" && msg.needsTrustRating && !msg.trustRated && (
                  <div className="mt-4">
                    <TrustSlider
                      messageId={msg.id}
                      onSubmit={handleTrustRating}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Loading bubble */}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[var(--color-on-primary)] text-[16px]" aria-hidden="true">
                    psychology
                  </span>
                </div>
                <div className="bg-[var(--color-socratic-bg)] border-l-4 border-[var(--color-primary)] rounded-r-xl px-5 py-3 flex items-center gap-2">
                  <span className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)]">
                    AI Tutor is thinking
                  </span>
                  <span className="flex gap-1" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-[var(--font-body)] text-[length:var(--text-body-sm)]"
              >
                <span className="material-symbols-outlined align-middle mr-2 text-[18px]">error</span>
                {error} — please try sending your message again.
              </div>
            )}

            {/* Session complete banner */}
            {limitReached && !lastAiNeedsRating && (
              <div className="rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-[var(--color-primary)] mb-3 block" aria-hidden="true">
                  check_circle
                </span>
                <h2 className="font-[var(--font-display)] text-[length:var(--text-headline-lg-mobile)] font-bold text-[var(--color-on-surface)] mb-2">
                  Session complete!
                </h2>
                <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] mb-6">
                  You&apos;ve completed your study session. When you&apos;re ready, continue to the post-test.
                </p>
                <Button
                  id="continue-to-posttest-btn"
                  onClick={handleContinue}
                  isLoading={isAdvancing}
                  size="lg"
                >
                  Continue to Post-Test
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">
                    arrow_forward
                  </span>
                </Button>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Input bar — absolute bottom-0 of the outer relative container ── */}
        {!limitReached && (
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSend}
            disabled={inputBlocked}
            placeholder={
              lastAiNeedsRating
                ? "Please rate the AI\u2019s last response before continuing\u2026"
                : `Ask the AI tutor anything about ${topic}\u2026`
            }
            turnInfo={{ used: studentTurnIndex, max: maxTurns }}
            onFinishEarly={studentTurnIndex > 0 && !lastAiNeedsRating ? handleContinue : undefined}
            isFinishing={isAdvancing}
          />
        )}
      </div>
    </PageShell>
  );
}
