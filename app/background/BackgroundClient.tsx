"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function BackgroundClient() {
  const router = useRouter();

  const [ageRange, setAgeRange] = useState("");
  const [education, setEducation] = useState("");
  const [topicFamiliarity, setTopicFamiliarity] = useState("");
  const [aiTutorUse, setAiTutorUse] = useState("");
  const [gender, setGender] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = Boolean(ageRange && education && topicFamiliarity && aiTutorUse);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageRange,
          education,
          topicFamiliarity,
          aiTutorUse,
          gender: gender || null,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to save questionnaire responses.");
      }

      router.push("/pretest");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while saving your responses.");
      setSubmitting(false);
    }
  };

  return (
    <PageShell currentStage="background">
      <div className="w-full max-w-[720px] mx-auto px-4 md:px-0 pt-20 md:pt-12 pb-24">
        {/* Header */}
        <div className="mb-8">
          <span className="font-[var(--font-ui)] text-[length:var(--text-label-caps)] font-semibold uppercase tracking-[0.05em] text-[var(--color-outline)] block mb-2">
            Step 2 of 9: Background Information
          </span>
          <h1 className="font-[var(--font-display)] text-[length:var(--text-headline-lg-mobile)] md:text-[length:var(--text-headline-lg)] font-bold text-[var(--color-on-surface)] mb-2 leading-[var(--text-headline-lg--line-height)]">
            Participant Background
          </h1>
          <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] leading-[var(--text-body-md--line-height)]">
            Please provide a few details about your background and familiarity with the subject matter. All answers are anonymous.
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field 1: Age Range */}
            <div>
              <label
                htmlFor="age-range"
                className="block font-[var(--font-ui)] text-[length:var(--text-label-md)] font-medium text-[var(--color-on-surface)] mb-2"
              >
                1. What is your age range? <span className="text-[var(--color-error)]">*</span>
              </label>
              <div className="relative">
                <select
                  id="age-range"
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  required
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg px-4 py-3 font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                >
                  <option value="" disabled>Select your age group</option>
                  <option value="18-24">18–24</option>
                  <option value="25-34">25–34</option>
                  <option value="35-44">35–44</option>
                  <option value="45-54">45–54</option>
                  <option value="55+">55 or older</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--color-on-surface-variant)]">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">expand_more</span>
                </div>
              </div>
            </div>

            {/* Field 2: Education Level */}
            <div>
              <label
                htmlFor="education-level"
                className="block font-[var(--font-ui)] text-[length:var(--text-label-md)] font-medium text-[var(--color-on-surface)] mb-2"
              >
                2. Highest level of education completed or currently enrolled in <span className="text-[var(--color-error)]">*</span>
              </label>
              <div className="relative">
                <select
                  id="education-level"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  required
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg px-4 py-3 font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                >
                  <option value="" disabled>Select education level</option>
                  <option value="secondary">High School / Secondary Education</option>
                  <option value="undergrad-lower">Undergraduate Student (Year 1–2)</option>
                  <option value="undergrad-upper">Undergraduate Student (Year 3–4)</option>
                  <option value="bachelors">Bachelor&apos;s Degree</option>
                  <option value="masters">Master&apos;s Degree</option>
                  <option value="doctoral">Doctoral / Professional Degree (PhD, MD, JD)</option>
                  <option value="other">Other / Professional Certification</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--color-on-surface-variant)]">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">expand_more</span>
                </div>
              </div>
            </div>

            {/* Field 3: Topic Familiarity */}
            <div>
              <label
                htmlFor="topic-familiarity"
                className="block font-[var(--font-ui)] text-[length:var(--text-label-md)] font-medium text-[var(--color-on-surface)] mb-2"
              >
                3. Prior familiarity with photosynthesis / plant biology <span className="text-[var(--color-error)]">*</span>
              </label>
              <div className="relative">
                <select
                  id="topic-familiarity"
                  value={topicFamiliarity}
                  onChange={(e) => setTopicFamiliarity(e.target.value)}
                  required
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg px-4 py-3 font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                >
                  <option value="" disabled>Select your familiarity level</option>
                  <option value="none">None — I have never studied this topic or have no recollection</option>
                  <option value="basic">Basic — I remember basic high school biology concepts</option>
                  <option value="intermediate">Moderate — I understand light reactions and the Calvin cycle</option>
                  <option value="advanced">Advanced — I have studied university-level biology or biochemistry</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--color-on-surface-variant)]">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">expand_more</span>
                </div>
              </div>
            </div>

            {/* Field 4: AI Tutor / ChatGPT Usage */}
            <div>
              <label
                htmlFor="ai-usage"
                className="block font-[var(--font-ui)] text-[length:var(--text-label-md)] font-medium text-[var(--color-on-surface)] mb-2"
              >
                4. How often do you use AI tools (ChatGPT, Claude, etc.) for learning or study? <span className="text-[var(--color-error)]">*</span>
              </label>
              <div className="relative">
                <select
                  id="ai-usage"
                  value={aiTutorUse}
                  onChange={(e) => setAiTutorUse(e.target.value)}
                  required
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg px-4 py-3 font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                >
                  <option value="" disabled>Select frequency of use</option>
                  <option value="never">Never used AI for learning</option>
                  <option value="rarely">Rarely (a few times a year)</option>
                  <option value="monthly">Occasionally (a few times a month)</option>
                  <option value="weekly">Frequently (1–3 times a week)</option>
                  <option value="daily">Daily or near-daily</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--color-on-surface-variant)]">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">expand_more</span>
                </div>
              </div>
            </div>

            {/* Field 5: Gender (Optional) */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label
                  htmlFor="gender"
                  className="block font-[var(--font-ui)] text-[length:var(--text-label-md)] font-medium text-[var(--color-on-surface)]"
                >
                  5. Gender Identity
                </label>
                <span className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] italic">
                  Optional
                </span>
              </div>
              <div className="relative">
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg px-4 py-3 font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                >
                  <option value="">Select (optional)</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="nonbinary">Non-binary</option>
                  <option value="self-describe">Prefer to self-describe</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--color-on-surface-variant)]">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">expand_more</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="p-4 rounded-lg bg-[var(--color-error-container)]/30 border border-[var(--color-error)]/30 text-[var(--color-error)] text-sm font-[var(--font-ui)] flex items-center gap-2"
                role="alert"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-4 border-t border-[var(--color-outline-variant)]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)] italic">
                * All four required fields must be filled to continue.
              </span>
              <Button
                type="submit"
                id="background-submit-btn"
                disabled={!isValid || submitting}
                isLoading={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <span>Save and Continue to Pre-Test</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
