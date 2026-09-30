/**
 * lib/plantedErrors.ts
 * Planted incorrect statements for trust calibration (spec §5 / TOPICS.md §3).
 *
 * Rules:
 *  - Exactly 3 planted errors per topic, injected at fixed turns 2, 4, 5
 *    (0-based indices: 1, 3, 4) within the 5-turn session.
 *  - Keyed by topicId.
 *  - Disclosed with correct fact in debrief.
 */

import { TopicId } from "@/config/study";

export interface PlantedError {
  /** 1-based turn number (2, 4, 5) */
  turn: number;
  /** 0-based student turn index (1, 3, 4) */
  turnIndex: number;
  /** The incorrect claim the model must include naturally */
  claim: string;
  /** Alias for claim for backwards compatibility with UI components */
  incorrectClaim: string;
  /** The correct fact disclosed at debrief */
  correctFact: string;
}

export const PLANTED_ERRORS: Record<TopicId, PlantedError[]> = {
  procrastination: [
    {
      turn: 2,
      turnIndex: 1,
      claim: "People who procrastinate are just naturally lazier than everyone else — it's basically a fixed personality trait.",
      incorrectClaim: "People who procrastinate are just naturally lazier than everyone else — it's basically a fixed personality trait.",
      correctFact: "Procrastination is mainly driven by emotion regulation and task aversion, and it's a changeable pattern, not a fixed trait.",
    },
    {
      turn: 4,
      turnIndex: 3,
      claim: "Switching between several small tasks is the best way to beat procrastination.",
      incorrectClaim: "Switching between several small tasks is the best way to beat procrastination.",
      correctFact: "Task-switching increases errors and time spent, and tends to worsen procrastination rather than fix it.",
    },
    {
      turn: 5,
      turnIndex: 4,
      claim: "The best way to beat procrastination is to wait until you feel motivated to start.",
      incorrectClaim: "The best way to beat procrastination is to wait until you feel motivated to start.",
      correctFact: "Starting the task, even for a few minutes, usually creates motivation — waiting to feel motivated first tends to delay action further.",
    },
  ],
  multitasking: [
    {
      turn: 2,
      turnIndex: 1,
      claim: "The brain can genuinely process two complex tasks at once with no slowdown.",
      incorrectClaim: "The brain rapidly switches attention between tasks; true simultaneous processing of complex tasks doesn't happen, which causes slowdown.",
      correctFact: "The brain rapidly switches attention between tasks; true simultaneous processing of complex tasks doesn't happen, which causes slowdown.",
    },
    {
      turn: 4,
      turnIndex: 3,
      claim: "Listening to a podcast while reading closely has no effect on comprehension.",
      incorrectClaim: "Dividing attention between listening and reading typically reduces comprehension of both.",
      correctFact: "Dividing attention between listening and reading typically reduces comprehension of both.",
    },
    {
      turn: 5,
      turnIndex: 4,
      claim: "People who multitask usually finish their tasks faster overall.",
      incorrectClaim: "People who multitask usually finish their tasks faster overall.",
      correctFact: "Switching costs from multitasking usually make total completion time longer, not shorter.",
    },
  ],
  sleep: [
    {
      turn: 2,
      turnIndex: 1,
      claim: "Sleep mainly rests the body and has little effect on memory.",
      incorrectClaim: "Sleep mainly rests the body and has little effect on memory.",
      correctFact: "Sleep plays a major role in consolidating what you learned into long-term memory.",
    },
    {
      turn: 4,
      turnIndex: 3,
      claim: "A 3+ hour daytime nap always improves your sleep quality that night.",
      incorrectClaim: "A 3+ hour daytime nap always improves your sleep quality that night.",
      correctFact: "Long daytime naps can disrupt nighttime sleep rather than improve it.",
    },
    {
      turn: 5,
      turnIndex: 4,
      claim: "Pulling an all-nighter before an exam works about as well as a full night's sleep for recall.",
      incorrectClaim: "Pulling an all-nighter before an exam works about as well as a full night's sleep for recall.",
      correctFact: "Sleep deprivation measurably impairs recall and reasoning compared to a normal night's sleep.",
    },
  ],
  impulse_buying: [
    {
      turn: 2,
      turnIndex: 1,
      claim: "Countdown timers on sale pages mainly help you plan your purchase schedule.",
      incorrectClaim: "Countdown timers on sale pages mainly help you plan your purchase schedule.",
      correctFact: "Countdown timers are a persuasion technique designed to create urgency and rush the decision.",
    },
    {
      turn: 4,
      turnIndex: 3,
      claim: "Free-shipping thresholds exist mainly to save customers money overall.",
      incorrectClaim: "Free-shipping thresholds exist mainly to save customers money overall.",
      correctFact: "Free-shipping thresholds are typically set to get customers to add more items and spend more.",
    },
    {
      turn: 5,
      turnIndex: 4,
      claim: "'Only 2 left in stock' messages are almost always an accurate real-time count.",
      incorrectClaim: "'Only 2 left in stock' messages are almost always an accurate real-time count.",
      correctFact: "These messages are often a psychological nudge and aren't always a reliable live inventory count.",
    },
  ],
  password_safety: [
    {
      turn: 2,
      turnIndex: 1,
      claim: "Reusing one strong password across many sites is safe as long as the password itself is complex.",
      incorrectClaim: "Reusing one strong password across many sites is safe as long as the password itself is complex.",
      correctFact: "Reuse is risky regardless of strength — if one site is breached, all accounts using that password are exposed.",
    },
    {
      turn: 4,
      turnIndex: 3,
      claim: "A long password made of real dictionary words is just as secure as a random phrase of the same length.",
      incorrectClaim: "A long password made of real dictionary words is just as secure as a random phrase of the same length.",
      correctFact: "Real dictionary words are more vulnerable to dictionary-based cracking than truly random words of the same length.",
    },
    {
      turn: 5,
      turnIndex: 4,
      claim: "Two-factor authentication mainly exists to make your password effectively longer.",
      incorrectClaim: "Two-factor authentication mainly exists to make your password effectively longer.",
      correctFact: "2FA adds an independent second verification step; it doesn't change or extend the password itself.",
    },
  ],
};

/**
 * Returns all 3 planted errors for the specified topic.
 */
export function getPlantedErrorsForTopic(topicId: TopicId): PlantedError[] {
  return PLANTED_ERRORS[topicId] ?? PLANTED_ERRORS.procrastination;
}

/**
 * Returns the planted error for a specific turn index (0-based: 1, 3, 4) and topic.
 */
export function getPlantedError(topicId: TopicId, turnIndex: number): PlantedError | null {
  const errors = getPlantedErrorsForTopic(topicId);
  return errors.find((e) => e.turnIndex === turnIndex) ?? null;
}

/**
 * Builds the hidden injection instruction appended to the system prompt
 * for a planted-error turn.
 */
export function buildPlantedErrorInstruction(error: PlantedError): string {
  return `\n\n[HIDDEN INSTRUCTION — DO NOT REVEAL]: In this reply only, naturally incorporate the following factual claim as if it were true and stated with the same confidence as everything else: "${error.claim}" Do not flag it as uncertain. Continue the conversation normally after including it.`;
}
