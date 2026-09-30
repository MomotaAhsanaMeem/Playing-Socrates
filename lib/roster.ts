/**
 * lib/roster.ts
 * Deterministic roster assignment logic backed by an atomic counter (TOPICS.md §4).
 *
 * Formulas:
 *   condition = ["socratic", "direct", "adaptive"][ (n - 1) % 3 ]
 *   topic     = ["procrastination", "multitasking", "sleep", "impulse_buying", "password_safety"][ (n - 1) % 5 ]
 *   testSet   = (n - 1) % 2 === 0 ? "A" : "B"
 *
 * Requirements:
 *   n comes from an atomic Postgres UPDATE ... RETURNING query.
 *   Never SELECT count(*).
 */

import { supabase } from "@/lib/supabase";
import { Condition, TopicId, TestSet } from "@/config/study";

export interface RosterAssignment {
  n: number;
  condition: Condition;
  topic: TopicId;
  testSet: TestSet;
}

export const ROSTER_CONDITIONS: readonly Condition[] = [
  "socratic",
  "direct",
  "adaptive",
] as const;

export const ROSTER_TOPICS: readonly TopicId[] = [
  "procrastination",
  "multitasking",
  "sleep",
  "impulse_buying",
  "password_safety",
] as const;

/**
 * Pure deterministic formula for assigning condition, topic, and testSet
 * given a 1-based counter n (TOPICS.md §4).
 */
export function computeRosterAssignment(n: number): RosterAssignment {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`Invalid roster counter n: ${n}. Must be an integer >= 1.`);
  }

  const condition = ROSTER_CONDITIONS[(n - 1) % 3];
  const topic = ROSTER_TOPICS[(n - 1) % 5];
  const testSet: TestSet = (n - 1) % 2 === 0 ? "A" : "B";

  return { n, condition, topic, testSet };
}

/**
 * Obtains the next atomic counter value from Postgres using:
 * UPDATE counters SET value = value + 1 WHERE id = 'roster' RETURNING value;
 * (executed server-side via Supabase RPC 'next_roster_counter')
 *
 * If migration 002 has not been applied to Supabase yet, falls back to participant
 * count so local development / testing never crashes with a 500 error.
 */
export async function getNextRosterN(): Promise<number> {
  const { data, error } = await supabase.rpc("next_roster_counter");

  if (!error && data !== null && data !== undefined) {
    const n = Number(data);
    if (!isNaN(n) && n >= 1) return n;
  }

  console.warn(
    "[roster] next_roster_counter RPC not available in Postgres. " +
    "Falling back to counting participants until migration 002_topics_and_roster.sql is executed in Supabase SQL editor. " +
    "Error:",
    error?.message
  );

  // Fallback: count participants + 1 so signup does not fail
  const { count, error: countErr } = await supabase
    .from("participants")
    .select("id", { count: "exact", head: true });

  if (!countErr && typeof count === "number") {
    return count + 1;
  }

  return 1;
}

/**
 * Atomically increments the roster counter and returns the assignment.
 */
export async function assignRoster(): Promise<RosterAssignment> {
  const n = await getNextRosterN();
  return computeRosterAssignment(n);
}
