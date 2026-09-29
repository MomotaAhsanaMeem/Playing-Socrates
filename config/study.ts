/**
 * config/study.ts
 * Central study configuration. Change TOPIC here and all prompts update automatically.
 */

export const STUDY_CONFIG = {
  /** The topic the AI tutor teaches. Injected into all system prompts. */
  TOPIC: "Photosynthesis",

  /**
   * Maximum number of student turns in the AI session.
   * After this many student messages the chat gate opens.
   */
  MAX_TURNS: 8,

  /**
   * Block randomisation size.
   * Every BLOCK_SIZE participants get exactly one of each condition.
   */
  BLOCK_SIZE: 3,

  /** Conditions must match the DB check constraint */
  CONDITIONS: ["direct", "socratic", "adaptive"] as const,

  /** Stage names (must match DB check constraint) */
  STAGES: [
    "consent",
    "background",
    "pretest",
    "session",
    "posttest",
    "trust",
    "cogload",
    "debrief",
    "complete",
  ] as const,

  /** Human-readable stage labels shown in the sidebar nav */
  STAGE_LABELS: {
    consent:    "Consent",
    background: "Background",
    pretest:    "Pre-Test",
    session:    "AI Session",
    posttest:   "Post-Test",
    trust:      "Trust Survey",
    cogload:    "Effort Survey",
    debrief:    "Debrief",
    complete:   "Complete",
  } as const,
} as const;

export type Condition = typeof STUDY_CONFIG.CONDITIONS[number];
export type Stage = typeof STUDY_CONFIG.STAGES[number];
