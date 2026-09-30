# SEED_DATA.md — Push 21 test participants to Supabase (Sept 10–20)

> Purpose: generate realistic-looking synthetic data to test the full pipeline
> (roster balance, scoring, trust calibration, admin dashboard, CSV export) BEFORE
> real data collection. This is test/pilot data, not real study data — keep it
> clearly separated (see note at the end).

## What the seed script must do

Create 21 fake participants, `n = 1` through `21`, following the roster formula
already implemented (condition/topic assignment). For each participant, generate a
complete, internally consistent record across every table:

1. **Timestamps** — spread the 21 participants' `created_at` / `consent_at` across
   **Sept 10, 2026 to Sept 20, 2026** (11 days), roughly 2 per day, with random times
   during the day. All of that one participant's stage timestamps (consent →
   background → pre-test → chat → post-test → trust → load → debrief) should fall
   within a plausible session window (5–15 minutes apart) on their assigned day, not
   scattered across different days.

2. **Background info** — randomized but plausible: age range, education level, prior
   topic familiarity, prior AI-tutor use (yes/no).

3. **Pre-test / Post-test responses** — for the participant's assigned topic (from
   the roster), pick random answers per item with a **slight bias toward more correct
   answers on the post-test than the pre-test** (simulate real learning), not
   uniformly random — e.g., pretest ~40-60% correct, posttest ~60-85% correct, varied
   per participant so scores aren't identical.

4. **Chat messages** — 5 student turns + 5 AI turns per participant, matching their
   condition's style (short generic student questions are fine, canned but
   condition-appropriate AI replies — direct answers directly, socratic asks
   questions, adaptive varies). Include the 2 planted-error messages at turns 2 and 4
   with `is_planted_error = true`. Attach a trust rating (1-7) to every AI message,
   with **slightly lower average ratings on planted-error messages** than on
   accurate ones (simulate believable calibration data, not identical).

5. **Questionnaires** — random but plausible Likert answers (1-7) for all trust and
   cognitive-load items, varied per participant, with reverse-scored items handled
   correctly by the existing scoring code.

6. **Computed scores** — run the SAME scoring functions already implemented
   (`lib/scoring.ts`) on the generated raw data rather than inventing final scores
   directly, so the seed data exercises the real scoring logic.

7. Mark all 21 as `completed`.

