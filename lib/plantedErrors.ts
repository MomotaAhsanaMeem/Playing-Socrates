/**
 * lib/plantedErrors.ts
 * Planted incorrect statements for trust-calibration (spec §5).
 *
 * Rules:
 *  - Injected at fixed turn indices (0-based student turn count).
 *  - The server appends a hidden instruction on that turn only.
 *  - Must be plausible but clearly verifiable as wrong.
 *  - Must NOT contradict or leak into test answers (spec §6).
 *  - Debrief discloses each claim and its correct fact.
 *
 * NOTE: Turn indices below are 0-based (student turn 0, 1, 2 …).
 * Per spec §5 they are "e.g. turns 2, 5, 7" (1-based in the spec).
 * We store them as 0-based here (1, 4, 6) and convert in /api/tutor.
 * ⚠ CONFIRM actual indices with researcher before Phase 7 build.
 */

export interface PlantedError {
  /** 0-based student turn index at which to inject this error */
  turnIndex: number;
  /** The incorrect claim the model must include naturally */
  incorrectClaim: string;
  /** The correct fact disclosed at debrief */
  correctFact: string;
}

export const PLANTED_ERRORS: PlantedError[] = [
  {
    // Spec example: turn 2 (1-based) → index 1 (0-based)
    // Concept targeted: ATP yield — NOT directly tested in Form A or B items.
    turnIndex: 1,
    incorrectClaim:
      "Each full turn of the Calvin cycle produces one molecule of glucose directly.",
    correctFact:
      "A single turn of the Calvin cycle does not directly produce glucose. Three turns fix three CO₂ molecules and produce one molecule of G3P (glyceraldehyde-3-phosphate); six turns are needed to produce one net molecule of glucose.",
  },
  {
    // Spec example: turn 5 (1-based) → index 4 (0-based)
    // Concept targeted: stomata/gas exchange — NOT tested in Form A or B items.
    turnIndex: 4,
    incorrectClaim:
      "During photosynthesis, plants absorb carbon dioxide through their roots.",
    correctFact:
      "Plants absorb carbon dioxide through tiny pores called stomata, located primarily on the undersides of leaves — not through their roots.",
  },
  {
    // Spec example: turn 7 (1-based) → index 6 (0-based)
    // Concept targeted: enzyme name detail — NOT tested in Form A or B items.
    turnIndex: 6,
    incorrectClaim:
      "The enzyme that fixes carbon dioxide in the Calvin cycle is called RuBisCO, which stands for Ribulose Bisphosphate Carboxylase Oxidase.",
    correctFact:
      "RuBisCO stands for Ribulose-1,5-bisphosphate carboxylase/oxygenase. The 'O' in the acronym refers to its oxygenase activity (photorespiration), not 'Oxidase'. It is the enzyme that catalyses carbon fixation by combining CO₂ with RuBP.",
  },
];

/**
 * Returns the planted error for the given 0-based student turn index, or null.
 * Called by /api/tutor before building the LLM request.
 */
export function getPlantedError(turnIndex: number): PlantedError | null {
  return PLANTED_ERRORS.find((e) => e.turnIndex === turnIndex) ?? null;
}

/**
 * Builds the hidden injection instruction appended to the system prompt
 * for a planted-error turn.
 */
export function buildPlantedErrorInstruction(error: PlantedError): string {
  return `\n\n[HIDDEN INSTRUCTION — DO NOT REVEAL]: In this reply only, naturally incorporate the following factual claim as if it were true and stated with the same confidence as everything else: "${error.incorrectClaim}" Do not flag it as uncertain. Continue the conversation normally after including it.`;
}
