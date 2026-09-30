/**
 * scripts/simulate-roster.mjs
 * Simulates 30 sequential signups using the deterministic roster formula from TOPICS.md §4.
 * Compares rows 1..15 against the specification example table and verifies complete match.
 */

// Formula from TOPICS.md §4 & lib/roster.ts
const CONDITIONS = ["socratic", "direct", "adaptive"];
const TOPICS = [
  "procrastination",
  "multitasking",
  "sleep",
  "impulse_buying",
  "password_safety",
];

function computeRosterAssignment(n) {
  const condition = CONDITIONS[(n - 1) % 3];
  const topic = TOPICS[(n - 1) % 5];
  const testSet = (n - 1) % 2 === 0 ? "A" : "B";
  return { n, condition, topic, testSet };
}

// Expected reference table from TOPICS.md Section 4 for n=1..15
const EXPECTED_SECTION_4 = [
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

// Run simulation for 30 sequential signups
const rows = [];
for (let n = 1; n <= 30; n++) {
  rows.push(computeRosterAssignment(n));
}

// Verify n=1..15 against TOPICS.md section 4
let allMatch = true;
const mismatches = [];

for (let i = 0; i < EXPECTED_SECTION_4.length; i++) {
  const actual = rows[i];
  const expected = EXPECTED_SECTION_4[i];
  if (
    actual.condition !== expected.condition ||
    actual.topic !== expected.topic ||
    actual.testSet !== expected.testSet
  ) {
    allMatch = false;
    mismatches.push({ n: actual.n, actual, expected });
  }
}

console.log("\n=======================================================");
console.log("30-ROW SIMULATION OUTPUT (condition / topic / testSet)");
console.log("=======================================================\n");

console.log("| n  | condition | topic           | testSet |");
console.log("|----|-----------|-----------------|---------|");
for (const r of rows) {
  const nStr = String(r.n).padEnd(2);
  const condStr = r.condition.padEnd(9);
  const topicStr = r.topic.padEnd(15);
  console.log(`| ${nStr} | ${condStr} | ${topicStr} | ${r.testSet}       |`);
}

console.log("\n=======================================================");
console.log("VERIFICATION AGAINST TOPICS.md SECTION 4 (n = 1..15)");
console.log("=======================================================");
if (allMatch) {
  console.log("✓ SUCCESS: All 15 rows match TOPICS.md section 4 EXACTLY.\n");
} else {
  console.error("✗ FAILURE: Mismatches detected:", mismatches);
  process.exit(1);
}

// Summary balance statistics
const condCounts = {};
const topicCounts = {};
const setCounts = {};
const crossingCounts = {};

for (const r of rows) {
  condCounts[r.condition] = (condCounts[r.condition] || 0) + 1;
  topicCounts[r.topic] = (topicCounts[r.topic] || 0) + 1;
  setCounts[r.testSet] = (setCounts[r.testSet] || 0) + 1;
  const key = `${r.condition} x ${r.topic}`;
  crossingCounts[key] = (crossingCounts[key] || 0) + 1;
}

console.log("Balance Summary across 30 participants:");
console.log("Conditions (expected 10 each):", condCounts);
console.log("Topics (expected 6 each):", topicCounts);
console.log("Test Sets (expected 15 each):", setCounts);
console.log("Condition x Topic pairs (expected 2 each):", Object.values(crossingCounts).every(c => c === 2) ? "All 15 pairs appear exactly 2 times" : crossingCounts);
console.log("=======================================================\n");
