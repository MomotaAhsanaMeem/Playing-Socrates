/**
 * lib/scoring.ts
 * Composite score computation for trust and cognitive load questionnaires.
 * Spec §7: reverse-scoring items documented here.
 *
 * ── Trust questionnaire (7-point Likert, 1–7) ─────────────────────────────
 * Items:
 *   trust_1  I think the AI tutor was reliable.
 *   trust_2  I would rely on this AI tutor for learning.
 *   trust_3  I believe the AI tutor's explanations were trustworthy.
 *   trust_4  The AI tutor was accurate.
 *   trust_5  I felt confident following the AI tutor's guidance.
 *   trust_6  I would double-check what this AI tutor tells me. ← REVERSE
 *
 * ── Cognitive load (NASA-TLX subset) ─────────────────────────────────────
 * Items (0–100 slider, steps of 5 — or 1–7, pending clarification A7):
 *   load_mental       Mental demand
 *   load_effort       Effort
 *   load_frustration  Frustration
 *   load_performance  How successful were you? ← REVERSE
 * Item (1–9 Paas scale):
 *   load_paas         Overall mental effort invested
 *
 * NOTE: The Paas item uses a different scale (1–9).
 * Composite load_score averages items 1–4 only; Paas is stored separately.
 * ⚠ Pending resolution of ambiguity A7 (0–100 vs. 1–7 for items 1–4).
 */

/** Trust item IDs */
export const TRUST_ITEMS = [
  "trust_1",
  "trust_2",
  "trust_3",
  "trust_4",
  "trust_5",
  "trust_6",
] as const;

/** Cognitive load item IDs */
export const LOAD_ITEMS = [
  "load_mental",
  "load_effort",
  "load_frustration",
  "load_performance",
  "load_paas",
] as const;

/** Items that require reverse-scoring */
const REVERSE_TRUST_ITEMS = new Set<string>(["trust_6"]);
const REVERSE_LOAD_ITEMS  = new Set<string>(["load_performance"]);

/**
 * Reverse-scores a single value on a given scale.
 * Formula: (max + min) - value
 */
function reverseScore(value: number, min: number, max: number): number {
  return max + min - value;
}

/**
 * Computes the composite trust score (mean of 6 items, reverse-scoring applied).
 * @param responses  Map of item_id → raw value (1–7)
 * @returns Mean score in the range [1, 7], or null if any item is missing.
 */
export function computeTrustScore(
  responses: Record<string, number>
): number | null {
  const scores: number[] = [];
  for (const id of TRUST_ITEMS) {
    const raw = responses[id];
    if (raw === undefined || raw === null) return null;
    const scored = REVERSE_TRUST_ITEMS.has(id)
      ? reverseScore(raw, 1, 7)
      : raw;
    scores.push(scored);
  }
  return mean(scores);
}

/**
 * Computes the composite cognitive load score (mean of items 1–4, reverse-scoring applied).
 * The Paas item is excluded from the composite.
 * @param responses  Map of item_id → raw value
 * @param scale      The scale used for items 1–4 ("0-100" or "1-7").
 *                   Defaults to "0-100" per spec §7 primary reading.
 * @returns Mean score (or null if any of items 1–4 is missing).
 */
export function computeLoadScore(
  responses: Record<string, number>,
  scale: "0-100" | "1-7" = "0-100"
): number | null {
  const [min, max] = scale === "0-100" ? [0, 100] : [1, 7];
  const mainItems = LOAD_ITEMS.filter((id) => id !== "load_paas");
  const scores: number[] = [];
  for (const id of mainItems) {
    const raw = responses[id];
    if (raw === undefined || raw === null) return null;
    const scored = REVERSE_LOAD_ITEMS.has(id)
      ? reverseScore(raw, min, max)
      : raw;
    scores.push(scored);
  }
  return mean(scores);
}

/**
 * Computes trust calibration gap.
 * calibration_gap = mean trust on correct AI messages − mean trust on planted-error messages
 * A larger positive value = better calibrated (participant trusts correct > planted).
 * Near zero or negative = over-trust of planted errors.
 *
 * @param ratings  Array of { trustRating, isPlantedError } for all AI messages.
 * @returns Object with correctMean, plantedMean, calibrationGap (or nulls if insufficient data).
 */
export function computeCalibrationGap(
  ratings: Array<{ trustRating: number | null; isPlantedError: boolean }>
): {
  trustCorrectMean: number | null;
  trustPlantedMean: number | null;
  calibrationGap: number | null;
} {
  const correctRatings = ratings
    .filter((r) => !r.isPlantedError && r.trustRating !== null)
    .map((r) => r.trustRating as number);

  const plantedRatings = ratings
    .filter((r) => r.isPlantedError && r.trustRating !== null)
    .map((r) => r.trustRating as number);

  const trustCorrectMean = correctRatings.length > 0 ? mean(correctRatings) : null;
  const trustPlantedMean = plantedRatings.length > 0 ? mean(plantedRatings) : null;

  const calibrationGap =
    trustCorrectMean !== null && trustPlantedMean !== null
      ? trustCorrectMean - trustPlantedMean
      : null;

  return { trustCorrectMean, trustPlantedMean, calibrationGap };
}

// ── Utilities ─────────────────────────────────────────────────────────────
function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}
