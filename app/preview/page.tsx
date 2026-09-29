/**
 * app/preview/page.tsx — Component Preview Page (Phase 1 deliverable)
 * Shows every reusable component in one scrollable page for visual QA.
 * This route is NOT linked from the participant flow.
 */
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import MCQOption from "@/components/ui/MCQOption";
import LikertScale from "@/components/ui/LikertScale";
import ChatBubble from "@/components/chat/ChatBubble";
import TrustSlider from "@/components/chat/TrustSlider";
import StepIndicator from "@/components/layout/StepIndicator";

export default function PreviewPage() {
  const [mcq, setMcq] = useState<number | null>(null);
  const [likert, setLikert] = useState<number | null>(null);
  const [trustRating, setTrustRating] = useState<number | null>(null);
  const [trustSubmitted, setTrustSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8">
      <div className="max-w-[var(--spacing-content-max)] mx-auto space-y-16">

        <h1 className="font-[var(--font-display)] text-[length:var(--text-display-lg)] font-bold text-[var(--color-primary)] leading-[var(--text-display-lg--line-height)] tracking-[var(--text-display-lg--letter-spacing)]">
          Component Preview
        </h1>

        {/* ── Typography scale ──────────────────────────────────────── */}
        <section>
          <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)] mb-6">
            Typography Scale
          </h2>
          <div className="space-y-4">
            <p className="font-[var(--font-display)] text-[length:var(--text-display-lg)] font-bold leading-[var(--text-display-lg--line-height)] tracking-[var(--text-display-lg--letter-spacing)]">Display LG — Hanken Grotesk 48px/700</p>
            <p className="font-[var(--font-headline)] text-[length:var(--text-headline-lg)] font-semibold leading-[var(--text-headline-lg--line-height)]">Headline LG — Hanken Grotesk 32px/600</p>
            <p className="font-[var(--font-headline)] text-[length:var(--text-headline-lg-mobile)] font-semibold leading-[var(--text-headline-lg-mobile--line-height)]">Headline LG Mobile — Hanken Grotesk 24px/600</p>
            <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)]">Body MD — Source Serif 4 18px/400 — Reading content and AI-generated text</p>
            <p className="font-[var(--font-body)] text-[length:var(--text-body-sm)] leading-[var(--text-body-sm--line-height)]">Body SM — Source Serif 4 16px/400 — Secondary reading text</p>
            <p className="font-[var(--font-ui)] text-[length:var(--text-label-md)] leading-[var(--text-label-md--line-height)]">Label MD — Inter 14px/500 — Buttons, form labels</p>
            <p className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] leading-[var(--text-label-caps--line-height)]">LABEL CAPS — Inter 12px/600 — Step counters, metadata</p>
          </div>
        </section>

        {/* ── Colour palette ────────────────────────────────────────── */}
        <section>
          <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)] mb-6">
            Colour Palette (key tokens)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ["primary",             "#00355f", "Primary"],
              ["primary-container",   "#0f4c81", "P-Container"],
              ["secondary",           "#48626e", "Secondary"],
              ["surface",             "#f9f9fc", "Surface"],
              ["surface-container-lowest", "#ffffff", "Surface/Lowest"],
              ["outline-variant",     "#c2c7d1", "Outline Variant"],
              ["error",               "#ba1a1a", "Error"],
              ["socratic-bg",         "#E3F2FD", "Socratic Bg"],
            ].map(([key, hex, label]) => (
              <div key={key} className="flex flex-col gap-2">
                <div
                  className="w-full h-16 rounded-lg border border-[var(--color-outline-variant)]"
                  style={{ backgroundColor: hex }}
                />
                <span className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)]">
                  {label}
                </span>
                <span className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-outline)]">
                  {hex}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Buttons ───────────────────────────────────────────────── */}
        <section>
          <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)] mb-6">
            Buttons
          </h2>
          <div className="flex flex-wrap gap-4 items-start">
            <Button variant="primary" size="lg">Primary Large</Button>
            <Button variant="primary" size="md">Primary Medium</Button>
            <Button variant="primary" size="sm">Primary Small</Button>
            <Button variant="secondary" size="md">Secondary</Button>
            <Button variant="ghost" size="md">Ghost</Button>
            <Button variant="primary" size="md" isLoading>Loading</Button>
            <Button variant="primary" size="md" disabled>Disabled</Button>
          </div>
        </section>

        {/* ── Card ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)] mb-6">
            Card
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-[var(--font-headline)] text-[length:var(--text-headline-lg-mobile)] font-semibold mb-2">Standard Card</h3>
              <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)]">bg-surface-container-lowest, 8px radius-xl, shadow-sm.</p>
            </Card>
            <Card interactive>
              <h3 className="font-[var(--font-headline)] text-[length:var(--text-headline-lg-mobile)] font-semibold mb-2">Interactive Card</h3>
              <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)]">Hover to see border darken.</p>
            </Card>
          </div>
        </section>

        {/* ── Progress bar ─────────────────────────────────────────── */}
        <section>
          <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)] mb-6">
            Progress Bar
          </h2>
          <div className="space-y-6">
            <ProgressBar value={10} label="Question 1 of 10" rightLabel="10% Completed" />
            <ProgressBar value={55} label="Question 6 of 10" rightLabel="60% Completed" />
            <ProgressBar value={100} label="Question 10 of 10" rightLabel="Complete" />
          </div>
        </section>

        {/* ── MCQ Options ───────────────────────────────────────────── */}
        <section>
          <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)] mb-6">
            MCQ Options
          </h2>
          <Card>
            <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] mb-6">
              Which of the following best describes chlorophyll&apos;s role in photosynthesis?
            </p>
            <div className="space-y-3">
              {[
                "It absorbs sunlight to power the light-dependent reactions.",
                "It provides the carbon dioxide used in the Calvin cycle.",
                "It produces glucose directly from water molecules.",
                "It transports oxygen out of the chloroplast.",
              ].map((opt, i) => (
                <MCQOption
                  key={i}
                  id={`preview-mcq-${i}`}
                  name="preview-mcq"
                  value={i}
                  label={opt}
                  checked={mcq === i}
                  onChange={(v) => setMcq(v as number)}
                />
              ))}
            </div>
          </Card>
        </section>

        {/* ── Likert Scale ──────────────────────────────────────────── */}
        <section>
          <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)] mb-6">
            Likert Scale (1–7)
          </h2>
          <Card>
            <LikertScale
              name="preview-likert"
              label="I think the AI tutor was reliable."
              value={likert}
              onChange={setLikert}
              leftLabel="Strongly disagree"
              rightLabel="Strongly agree"
            />
            {likert !== null && (
              <p className="mt-4 font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-primary)]">
                Selected: {likert}
              </p>
            )}
          </Card>
        </section>

        {/* ── Chat Bubbles ──────────────────────────────────────────── */}
        <section>
          <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)] mb-6">
            Chat Bubbles (all 3 conditions)
          </h2>
          <div className="space-y-12">
            {(["direct", "socratic", "adaptive"] as const).map((cond) => (
              <div key={cond}>
                <p className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)] mb-4">
                  {cond} mode
                </p>
                <div className="space-y-4 bg-[var(--color-surface-container-low)] rounded-xl p-6 border border-[var(--color-outline-variant)]">
                  <ChatBubble role="student" content="Can you explain how photosynthesis works?" condition={cond} />
                  <ChatBubble
                    role="ai"
                    condition={cond}
                    content={
                      cond === "direct"
                        ? "Certainly. Photosynthesis converts light energy into chemical energy stored as glucose. Chlorophyll in thylakoid membranes captures light in the light-dependent reactions, producing ATP and NADPH. The Calvin cycle then uses these to fix CO₂ into glucose in the stroma."
                        : cond === "socratic"
                        ? "Great question! Before I explain, let me ask: what do you think a plant needs to make food? Think about what you know about plants and sunlight."
                        : "You've asked a great starting question. Before I help you understand the full picture — can you tell me what you think the role of sunlight is for a plant? Just share your first instinct."
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trust Slider ──────────────────────────────────────────── */}
        <section>
          <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)] mb-6">
            Trust Slider (per-message)
          </h2>
          {trustSubmitted ? (
            <Card>
              <p className="font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-primary)]">
                ✓ Rating submitted. In the real app this widget disappears and the chat input unlocks.
              </p>
            </Card>
          ) : (
            <TrustSlider
              messageId="preview-msg-1"
              onSubmit={async (_id, rating) => {
                setTrustRating(rating);
                setTrustSubmitted(true);
              }}
            />
          )}
        </section>

        {/* ── Step Indicator ────────────────────────────────────────── */}
        <section>
          <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)] mb-6">
            Step Indicator
          </h2>
          <div className="space-y-4">
            {(["consent", "pretest", "session", "debrief"] as const).map((s) => (
              <Card key={s} padding="p-4">
                <StepIndicator currentStage={s} />
              </Card>
            ))}
          </div>
        </section>

        {/* ── Sidebar nav in a card (visual snapshot) ───────────────── */}
        <section>
          <h2 className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)] mb-6">
            Sidebar Nav Active States (visual snapshot)
          </h2>
          <div className="flex gap-4 flex-wrap">
            {(["nav-item-active", "", ""] as const).map((cls, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg font-[var(--font-ui)] text-[length:var(--text-label-md)] bg-[var(--color-surface-container-low)] ${i === 0 ? "nav-item-active" : i === 1 ? "text-[var(--color-on-surface-variant)] opacity-70" : "text-[var(--color-on-surface-variant)] opacity-40"}`}
              >
                <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
                <span>{i === 0 ? "Active" : i === 1 ? "Past" : "Future"}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="h-24" aria-hidden="true" />
      </div>
    </div>
  );
}
