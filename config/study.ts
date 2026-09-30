/**
 * config/study.ts
 * Central study configuration.
 * Spec §5 / TOPICS.md §1 & §5: Multi-topic roster assignment.
 */

export interface TopicDefinition {
  topicId: TopicId;
  displayName: string;
}

export const TOPICS = [
  { topicId: "procrastination", displayName: "Procrastination" },
  { topicId: "multitasking", displayName: "Multitasking" },
  { topicId: "sleep", displayName: "Sleep and Memory" },
  { topicId: "impulse_buying", displayName: "Impulse Buying and Online Shopping Tricks" },
  { topicId: "password_safety", displayName: "Password and Account Safety" },
] as const;

export const topics = TOPICS;

export type TopicId =
  | "procrastination"
  | "multitasking"
  | "sleep"
  | "impulse_buying"
  | "password_safety";

export type TestSet = "A" | "B";

export function getTopicDisplayName(topicId: string): string {
  const found = TOPICS.find((t) => t.topicId === topicId);
  return found ? found.displayName : topicId;
}

export const STUDY_CONFIG = {
  /** The 5 study topics */
  TOPICS,

  /**
   * Maximum number of student turns in the AI session.
   * After this many student messages the chat gate opens.
   */
  MAX_TURNS: 5,

  /** Conditions must match the DB check constraint */
  CONDITIONS: ["socratic", "direct", "adaptive"] as const,

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
