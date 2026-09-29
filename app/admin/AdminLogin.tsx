/**
 * app/admin/AdminLogin.tsx
 * Admin login form — client component.
 * Calls POST /api/admin/login and refreshes the page on success.
 */
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword]     = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Login failed");
      }

      // Reload to let the server component render the dashboard
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-sm">

        {/* Logo / branding */}
        <div className="text-center mb-8">
          <span
            className="material-symbols-outlined text-[var(--color-primary)] text-[48px] mb-3 block"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            admin_panel_settings
          </span>
          <h1 className="font-[var(--font-display)] text-[length:var(--text-headline-lg)] font-bold text-[var(--color-on-surface)]">
            Admin Login
          </h1>
          <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] mt-1">
            Playing Socrates Research Dashboard
          </p>
        </div>

        {/* Login card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} id="admin-login-form">
            <label
              htmlFor="admin-password"
              className="block font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)] mb-2"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              disabled={isLoading}
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] font-[var(--font-body)] text-[length:var(--text-body-md)] placeholder:text-[var(--color-on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent mb-4 transition"
            />

            {error && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-[var(--font-body)] text-[length:var(--text-body-sm)] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}

            <button
              id="admin-login-btn"
              type="submit"
              disabled={!password.trim() || isLoading}
              className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-[var(--font-ui)] font-semibold text-[length:var(--text-label-lg)] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Signing in…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] mt-4">
          Set via <code className="bg-[var(--color-surface-container)] px-1 rounded text-xs">ADMIN_PASSWORD</code> env variable
        </p>
      </div>
    </div>
  );
}
