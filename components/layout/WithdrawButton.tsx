"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface WithdrawButtonProps {
  className?: string;
  variant?: "sidebar" | "header" | "inline";
}

export default function WithdrawButton({
  className = "",
  variant = "sidebar",
}: WithdrawButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/participant", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to withdraw");
      }
      setIsOpen(false);
      // Hard redirect to clear any client-side state and cookies
      window.location.href = "/consent";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while withdrawing.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      {variant === "sidebar" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-[var(--font-ui)] text-[var(--color-outline)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-container)]/20 rounded transition-colors w-full text-left ${className}`}
          title="Withdraw from the study and delete all your data"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            logout
          </span>
          <span>Withdraw from Study</span>
        </button>
      )}

      {variant === "header" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-[var(--font-ui)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-container)]/20 rounded transition-colors ${className}`}
          title="Withdraw from the study"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            logout
          </span>
          <span>Withdraw</span>
        </button>
      )}

      {variant === "inline" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`text-xs font-[var(--font-ui)] text-[var(--color-outline)] hover:text-[var(--color-error)] underline transition-colors ${className}`}
        >
          Withdraw and delete my data
        </button>
      )}

      {/* Confirmation Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="withdraw-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 text-[var(--color-error)] mb-3">
              <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                warning
              </span>
              <h2
                id="withdraw-dialog-title"
                className="font-[var(--font-display)] text-[length:var(--text-headline-lg-mobile)] font-bold text-[var(--color-on-surface)]"
              >
                Withdraw from Study?
              </h2>
            </div>

            <p className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] leading-relaxed mb-4">
              Participation is completely voluntary. If you choose to withdraw, <strong>all of your responses and recorded data will be permanently deleted immediately</strong> from our servers.
            </p>

            <p className="font-[var(--font-ui)] text-xs text-[var(--color-outline)] mb-6">
              This action cannot be undone. You will be redirected to the study home page.
            </p>

            {error && (
              <div className="p-3 mb-4 rounded bg-[var(--color-error-container)]/30 text-[var(--color-error)] text-xs font-[var(--font-ui)]">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded text-xs font-[var(--font-ui)] font-semibold text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleWithdraw}
                className="px-4 py-2 rounded text-xs font-[var(--font-ui)] font-semibold bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                    Deleting data…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">delete_forever</span>
                    Confirm Withdrawal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
