/**
 * app/admin/AdminDashboard.tsx
 * Admin dashboard — client component.
 * Spec §9: participants started/completed per condition, average scores per condition.
 * CSV exports for participants, messages, items.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ConditionStats {
  condition:       string;
  started:         number;
  completed:       number;
  preMean:         number | null;
  postMean:        number | null;
  gainMean:        number | null;
  trustMean:       number | null;
  loadMean:        number | null;
  calibrationMean: number | null;
}

interface StatsResponse {
  stats:             ConditionStats[];
  totals:            { started: number; completed: number };
  includeIncomplete: boolean;
}

const CONDITION_COLORS: Record<string, string> = {
  direct:   "text-blue-400",
  socratic: "text-violet-400",
  adaptive: "text-emerald-400",
};

const CONDITION_BG: Record<string, string> = {
  direct:   "bg-blue-400/10 border-blue-400/30",
  socratic: "bg-violet-400/10 border-violet-400/30",
  adaptive: "bg-emerald-400/10 border-emerald-400/30",
};

function fmt(v: number | null): string {
  if (v === null || v === undefined) return "—";
  return v.toFixed(2);
}

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats]                       = useState<ConditionStats[] | null>(null);
  const [totals, setTotals]                     = useState<{ started: number; completed: number } | null>(null);
  const [includeIncomplete, setIncludeIncomplete] = useState(false);
  const [isLoading, setIsLoading]               = useState(true);
  const [error, setError]                       = useState<string | null>(null);
  const [downloadingId, setDownloadingId]       = useState<string | null>(null);

  const fetchStats = useCallback(async (inc: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stats?includeIncomplete=${inc}`);
      if (res.status === 401) {
        router.refresh(); // re-render; server will show login
        return;
      }
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: StatsResponse = await res.json();
      setStats(data.stats);
      setTotals(data.totals);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStats(includeIncomplete);
  }, [includeIncomplete, fetchStats]);

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  async function downloadCsv(name: "participants" | "messages" | "items") {
    setDownloadingId(name);
    try {
      const res = await fetch(
        `/api/admin/export/${name}?includeIncomplete=${includeIncomplete}`
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Download failed");
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      const ts   = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-");
      a.href     = url;
      a.download = `${name}_${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-[var(--color-primary)] text-[24px]"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            admin_panel_settings
          </span>
          <span className="font-[var(--font-display)] text-[length:var(--text-title-lg)] font-bold text-[var(--color-on-surface)]">
            Playing Socrates — Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/test-items"
            className="flex items-center gap-1.5 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] font-[var(--font-ui)] text-[length:var(--text-label-md)] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">quiz</span>
            Test Items
          </Link>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[var(--color-on-surface-variant)] hover:text-red-400 font-[var(--font-ui)] text-[length:var(--text-label-md)] transition-colors px-3 py-2 rounded-lg hover:bg-red-400/10"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Controls ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="font-[var(--font-display)] text-[length:var(--text-headline-md)] font-bold text-[var(--color-on-surface)]">
            Study Overview
          </h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)]">
              <input
                id="include-incomplete-toggle"
                type="checkbox"
                checked={includeIncomplete}
                onChange={(e) => setIncludeIncomplete(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
              />
              Include incomplete participants
            </label>
            <button
              onClick={() => fetchStats(includeIncomplete)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] font-[var(--font-ui)] text-[length:var(--text-label-md)] transition-colors disabled:opacity-50"
              aria-label="Refresh statistics"
            >
              <span className={`material-symbols-outlined text-[18px] ${isLoading ? "animate-spin" : ""}`}>
                refresh
              </span>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Totals ─────────────────────────────────────────────────────── */}
        {totals && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Started",   value: totals.started,   icon: "group" },
              { label: "Total Completed", value: totals.completed, icon: "task_alt" },
              {
                label: "Completion Rate",
                value: totals.started > 0
                  ? `${Math.round((totals.completed / totals.started) * 100)}%`
                  : "—",
                icon: "percent",
              },
              {
                label: "Conditions",
                value: 3,
                icon: "category",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[var(--color-primary)] text-[20px]" aria-hidden="true">
                    {kpi.icon}
                  </span>
                  <span className="font-[var(--font-ui)] text-[length:var(--text-label-sm)] text-[var(--color-on-surface-variant)] uppercase tracking-wider">
                    {kpi.label}
                  </span>
                </div>
                <p className="font-[var(--font-display)] text-[length:var(--text-headline-md)] font-bold text-[var(--color-on-surface)]">
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────────────────── */}
        {error && (
          <div role="alert" className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-[var(--font-body)] text-[length:var(--text-body-sm)]">
            <span className="material-symbols-outlined align-middle mr-2 text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* ── Loading skeleton ───────────────────────────────────────────── */}
        {isLoading && !stats && (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-[var(--color-surface-container)]" />
            ))}
          </div>
        )}

        {/* ── Per-condition stats ─────────────────────────────────────────── */}
        {stats && (
          <div className="space-y-4 mb-10">
            {stats.map((s) => (
              <div
                key={s.condition}
                className={`rounded-2xl border p-5 ${CONDITION_BG[s.condition] ?? "bg-[var(--color-surface)] border-[var(--color-outline-variant)]"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h2 className={`font-[var(--font-display)] text-[length:var(--text-title-md)] font-bold capitalize ${CONDITION_COLORS[s.condition] ?? "text-[var(--color-on-surface)]"}`}>
                    {s.condition}
                  </h2>
                  <div className="flex items-center gap-4 font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface-variant)]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">group</span>
                      {s.started} started
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">task_alt</span>
                      {s.completed} completed
                    </span>
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { label: "Pre-score",      value: fmt(s.preMean),         unit: "/10" },
                    { label: "Post-score",     value: fmt(s.postMean),        unit: "/10" },
                    { label: "Learning gain",  value: fmt(s.gainMean),        unit: ""    },
                    { label: "Trust",          value: fmt(s.trustMean),       unit: "/7"  },
                    { label: "Cog load",       value: fmt(s.loadMean),        unit: "/100"},
                    { label: "Calibration",    value: fmt(s.calibrationMean), unit: ""    },
                  ].map((m) => (
                    <div key={m.label} className="text-center p-3 rounded-xl bg-[var(--color-background)]/40">
                      <p className="font-[var(--font-ui)] text-[length:var(--text-label-sm)] text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-1">
                        {m.label}
                      </p>
                      <p className="font-[var(--font-display)] text-[length:var(--text-title-md)] font-bold text-[var(--color-on-surface)]">
                        {m.value}
                        {m.value !== "—" && (
                          <span className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] ml-0.5">
                            {m.unit}
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CSV Exports ────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] p-6">
          <h2 className="font-[var(--font-display)] text-[length:var(--text-title-md)] font-bold text-[var(--color-on-surface)] mb-1">
            Data Export
          </h2>
          <p className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] mb-5">
            {includeIncomplete
              ? "Includes all participants (incomplete + complete)."
              : "Completed participants only. Check 'Include incomplete' above to change."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(
              [
                {
                  id:    "participants" as const,
                  label: "Participants CSV",
                  desc:  "One row per participant — scores, background, durations",
                  icon:  "group",
                },
                {
                  id:    "messages" as const,
                  label: "Messages CSV",
                  desc:  "Every chat message with trust ratings & planted flag",
                  icon:  "chat",
                },
                {
                  id:    "items" as const,
                  label: "Items CSV",
                  desc:  "Item-level test responses and questionnaire answers",
                  icon:  "quiz",
                },
              ] as const
            ).map((exp) => (
              <button
                key={exp.id}
                id={`export-${exp.id}-btn`}
                onClick={() => downloadCsv(exp.id)}
                disabled={downloadingId === exp.id}
                className="flex flex-col items-start gap-2 p-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-container)]/20 text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)] text-[22px]" aria-hidden="true">
                    {downloadingId === exp.id ? "hourglass_empty" : exp.icon}
                  </span>
                  <span className="font-[var(--font-ui)] font-semibold text-[length:var(--text-label-lg)] text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
                    {downloadingId === exp.id ? "Exporting…" : exp.label}
                  </span>
                </div>
                <p className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)]">
                  {exp.desc}
                </p>
                <span className="flex items-center gap-1 font-[var(--font-ui)] text-[length:var(--text-label-sm)] text-[var(--color-primary)] mt-auto">
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download CSV
                </span>
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
