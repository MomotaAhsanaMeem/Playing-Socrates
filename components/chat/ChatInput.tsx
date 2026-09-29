/**
 * components/chat/ChatInput.tsx
 * Textarea + send button at the bottom of the AI chat.
 * Matches direct mode design: rounded-xl textarea + w-14 h-14 rounded-xl send button.
 * Auto-resizes to content.
 */
"use client";

import { useRef, useEffect, KeyboardEvent } from "react";
import Button from "@/components/ui/Button";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  /** If true, shows a turn counter (e.g. "3 / 8 turns used") */
  turnInfo?: { used: number; max: number };
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Type your response...",
  turnInfo,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (not Shift+Enter)
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      if (value.trim()) onSubmit();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full bg-[var(--color-surface-container-lowest)] border-t border-[var(--color-outline-variant)] p-4 md:px-[var(--spacing-margin-desktop)] md:py-6 z-30">
      <div className="max-w-[var(--spacing-content-max)] mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim() && !disabled) onSubmit();
          }}
          className="flex items-end gap-3"
        >
          {/* Textarea */}
          <div className="flex-1 relative bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)] transition-all shadow-sm overflow-hidden min-h-[56px] flex items-center">
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full bg-transparent border-none focus:ring-0 font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] text-[var(--color-on-surface)] resize-none py-3 px-4 placeholder:text-[var(--color-outline)] outline-none min-h-[56px]"
              style={{ overflowY: "hidden" }}
              aria-label="Chat message"
            />
          </div>
          {/* Send button */}
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            aria-label="Send message"
            className="bg-[var(--color-primary-container)] text-[var(--color-on-primary)] w-14 h-14 rounded-xl flex items-center justify-center hover:bg-[var(--color-primary)] transition-colors flex-shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined" aria-hidden="true">send</span>
          </button>
        </form>

        {/* Turn counter hint */}
        {turnInfo && (
          <p className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] text-[var(--color-outline)] text-center mt-3">
            {turnInfo.used} of {turnInfo.max} turns used
            {turnInfo.used >= turnInfo.max && " — session complete"}
          </p>
        )}
      </div>
    </div>
  );
}
