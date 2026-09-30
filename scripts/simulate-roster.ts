/**
 * scripts/simulate-roster.ts
 * Simulates 30 sequential signups using the deterministic roster formula from lib/roster.ts.
 * Compares rows 1..15 against TOPICS.md §4 example table.
 */

import { computeRosterAssignment, RosterAssignment } from "../lib/roster";

const EXPECTED_SECTION_4: RosterAssignment[] = [
  { n: 1,  condition: "socratic", topic: "procrastination", testSet: "A" },
  { n: 2,  condition: "direct",   topic: "multitasking",    testSet: "B" },
  { n: 3,  condition: "adaptive", topic: "sleep",           testSet: "A" },
  { n: 4,  condition: "socratic", topic: "impulse_buying",  testSet: "B" },
  { n: 5,  condition: "direct",   topic: "password_safety", testSet: "A" },
  { n: 6,  condition: "adaptive", topic: "procrastination", testSet: "B" },
  { n: 7,  condition: "socratic", topic: "multitasking",    testSet: "A" },
  { n: 8,  condition: "direct",   topic: "sleep",           testSet: "B" },
  { n: 9,  condition: "adaptive", topic: "impulse_buying",  testSet: "A" },
  { n: 10, condition: "socratic", topic: "password_safety", testSet: "B" },
  { n: 11, condition: "direct",   topic: "procrastination", testSet: "A" },
  { n: 12, condition: "adaptive", topic: "multitasking",    testSet: "B" },
  { n: 13, condition: "socratic", topic: "sleep",           testSet: "A" },
  { n: 14, condition: "direct",   topic: "impulse_buying",  testSet: "B" },
  { n: 15, condition: "adaptive", topic: "password_safety", testSet: "A" },
];

export function runSimulation(): {
  rows: RosterAssignment[];
  matchesSection4: boolean;
} {
  const rows: RosterAssignment[] = [];
  for (let n = 1; n <= 30; n++) {
    rows.push(computeRosterAssignment(n));
  }

  const matchesSection4 = EXPECTED_SECTION_4.every((expected, i) => {
    const actual = rows[i];
    return (
      actual.condition === expected.condition &&
      actual.topic === expected.topic &&
      actual.testSet === expected.testSet
    );
  });

  return { rows, matchesSection4 };
}
