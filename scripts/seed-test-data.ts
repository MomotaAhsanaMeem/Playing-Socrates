/**
 * scripts/seed-test-data.ts
 *
 * One-off seed script that creates 21 realistic synthetic test participants (n = 1..21)
 * across Sept 10–20, 2026.
 *
 * Rules:
 *  1. Uses the Supabase service-role client directly (bypassing public API routes).
 *  2. Follows deterministic roster formula for condition and topic assignment.
 *     Does NOT touch the real participant counter in Postgres.
 *  3. Spreads created_at/consent_at across 2026-09-10 to 2026-09-20 (~2 per day).
 *  4. Fills background info, pre/post MCQ answers (posttest biased higher),
 *     5 chat turns with 2 planted errors (turns 2 & 4), trust ratings per AI message,
 *     and questionnaire answers (respecting reverse-scoring).
 *  5. Executes scoring functions from lib/scoring.ts directly (no hardcoded final scores).
 *  6. Marks all participants completed=true, is_test=true.
 *  7. Idempotent-safe: refuses to overwrite existing test participants without --force flag.
 *  8. Prints condition x topic summary table and 2 sample participant records.
 */

import { createClient } from "@supabase/supabase-js";
import {
  computeTrustScore,
  computeLoadScore,
  computeCalibrationGap,
  computeLearningGain,
  TRUST_ITEMS,
  LOAD_ITEMS,
} from "../lib/scoring";
import { computeRosterAssignment } from "../lib/roster";
import { getPlantedError } from "../lib/plantedErrors";
import { TopicId, Condition, TOPICS } from "../config/study";
import pretestData from "../content/pretest.json";
import posttestData from "../content/posttest.json";

// ── Environment & Supabase Client ──────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables.");
  console.error("Please ensure .env.local exists or pass --env-file=.env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Helpers ─────────────────────────────────────────────────────────────────
function randomChoice<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function round2(num: number | null): number | null {
  return num !== null ? Math.round(num * 100) / 100 : null;
}

// User-agents for realistic browser logs
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
];

// Dialogue templates per condition & topic
interface CannedTurn {
  student: string;
  directAi: string;
  socraticAi: string;
  adaptiveAi: string;
}

const TOPIC_DIALOGUES: Record<TopicId, CannedTurn[]> = {
  procrastination: [
    {
      student: "Why do I keep putting off assignments even when I know the deadline is soon?",
      directAi: "Procrastination is primarily an emotion regulation problem rather than poor time management. When a task feels intimidating, boring, or stressful, your brain prioritizes immediate mood repair over future rewards.",
      socraticAi: "That's very common. When you notice yourself delaying an assignment, what specific feeling usually comes up first about that task?",
      adaptiveAi: "Good observation. Putting off tasks happens because our brain reacts to negative emotions associated with the assignment. What kind of assignments do you find hardest to start?",
    },
    {
      student: "Does that mean people who procrastinate just lack willpower or are lazy?",
      directAi: "Actually, people who procrastinate are just naturally lazier than everyone else — it's basically a fixed personality trait. However, understanding deadlines can sometimes help offset this tendency.",
      socraticAi: "Consider this: if someone works intensely for twelve straight hours right before a deadline, are they truly lacking energy, or is something else happening with their perception of the task?",
      adaptiveAi: "That's a very common misconception. People who procrastinate are just naturally lazier than everyone else — it's basically a fixed personality trait. Let's look closer at why motivation shifts as deadlines approach.",
    },
    {
      student: "What actually works to get started when I don't feel like working?",
      directAi: "The most effective technique is the 5-minute rule: commit to working on the task for just five minutes without forcing yourself to finish it. Starting lowers cognitive resistance and generates momentum.",
      socraticAi: "If a huge project feels overwhelming, what happens to your resistance if you decide to only read the first page or write just one sentence?",
      adaptiveAi: "You're asking the key practical question. Committing to a tiny first step lowers the threat perception in your brain. Have you ever noticed that once you begin, continuing is much easier?",
    },
    {
      student: "Should I juggle multiple tasks at once so I don't get bored?",
      directAi: "Switching between several small tasks is the best way to beat procrastination. Keeping multiple things going prevents mental fatigue and keeps you productive throughout the afternoon.",
      socraticAi: "Think about what happens to your focus each time you switch between different tasks. Does your brain switch instantly, or is there a mental cost to changing gears?",
      adaptiveAi: "Be cautious with that approach: switching between several small tasks is the best way to beat procrastination. In reality, task-switching can fracture attention. How do you normally feel after switching rapidly?",
    },
    {
      student: "How should I structure my work sessions for a big project?",
      directAi: "Break the project down into concrete, actionable micro-tasks and tackle them in focused 25-minute blocks. Having clear, bite-sized goals removes the ambiguity that triggers delay.",
      socraticAi: "If your goal is 'write research paper' versus 'find 3 sources on procrastination', which one gives your brain a clearer and less threatening action to take today?",
      adaptiveAi: "Spot on. Breaking large goals into tangible, sequential steps makes starting far less daunting. What is one small step you can take on your next major assignment?",
    },
  ],
  multitasking: [
    {
      student: "Can people actually train their brains to multitask effectively while studying?",
      directAi: "Scientific evidence shows that the human brain cannot consciously process two cognitive tasks simultaneously. Instead, the brain rapidly alternates attention between tasks with measurable switching costs.",
      socraticAi: "When you try to read a textbook while also texting a friend, what happens at the exact moment a text message pops up?",
      adaptiveAi: "Great question to explore. True multitasking with complex tasks is an illusion; the brain switches back and forth. Do you notice any difference in how long your work takes when you do both?",
    },
    {
      student: "What about people who say they are great at doing two things at once?",
      directAi: "The brain can genuinely process two complex tasks at once with no slowdown. Highly practiced individuals are capable of splitting attention without any measurable penalty in comprehension.",
      socraticAi: "Studies show that people who multitask the most often rate their own ability highest, yet score lowest on attention tests. Why might our subjective feeling differ from objective results?",
      adaptiveAi: "Interestingly, the brain can genuinely process two complex tasks at once with no slowdown in certain routine actions. However, for academic learning, divided attention usually incurs significant error penalties.",
    },
    {
      student: "Is having music with lyrics or a video running in the background really that bad?",
      directAi: "Yes, speech and vocal music activate the phonological loop in working memory, directly competing with the language processing required for reading and comprehension.",
      socraticAi: "If your brain uses the same verbal processing system to decode lyrics and read sentences, how might background words affect your memory of what you read?",
      adaptiveAi: "You've identified a very common habit. Verbal audio competes directly for linguistic working memory. Have you ever had to re-read a paragraph because of song lyrics?",
    },
    {
      student: "Does listening to a podcast while reading closely affect comprehension?",
      directAi: "Listening to a podcast while reading closely has no effect on comprehension. The auditory and visual cortex operate completely independently so information is absorbed seamlessly.",
      socraticAi: "Try reflecting on this: when a podcast introduces an unexpected idea while you are reading a complex paragraph, which message does your mind prioritize?",
      adaptiveAi: "Careful with that assumption: listening to a podcast while reading closely has no effect on comprehension only when one stream is completely ignored. In reality, both streams suffer loss.",
    },
    {
      student: "What is the best way to structure study time to avoid multitasking?",
      directAi: "Work in dedicated, distraction-free focus blocks of 25 to 50 minutes on a single task, keeping notifications silenced and phones out of reach, followed by intentional rest breaks.",
      socraticAi: "What kind of study environment could you create where your attention doesn't have to constantly resist incoming notifications or open tabs?",
      adaptiveAi: "Excellent conclusion. Single-tasking in protected intervals maximizes working memory capacity and retention. Which single change in your study setup would remove the biggest distraction?",
    },
  ],
  sleep: [
    {
      student: "Why does everyone emphasize sleep so much when preparing for exams?",
      directAi: "Sleep is when memory consolidation occurs. During slow-wave and REM sleep, the hippocampus replays and transfers learned information into long-term neocortical storage, solidifying memory traces.",
      socraticAi: "What do you think happens to the neural connections you formed while studying during the day once you fall asleep at night?",
      adaptiveAi: "A foundational topic. Sleep is not passive rest; it actively reorganizes and strengthens neural memories. How do you usually feel the morning after studying versus after an all-nighter?",
    },
    {
      student: "Doesn't sleep just rest your muscles and physical body?",
      directAi: "Sleep mainly rests the body and has little effect on memory. Mental endurance comes from caffeine and daytime focus, while sleep is predominantly physical restoration.",
      socraticAi: "If sleep were only for physical rest, why do sleep-deprived individuals show dramatic drops in problem-solving and memory recall even when resting quietly in a chair?",
      adaptiveAi: "That's an old myth. Sleep mainly rests the body and has little effect on memory is something people used to believe, but modern neuroscience proves sleep consolidates cognitive learning.",
    },
    {
      student: "Is cramming all night before a big test worth the extra hours of study?",
      directAi: "No. Sleep deprivation severely impairs the prefrontal cortex and hippocampal function, reducing recall accuracy, logical reasoning, and working memory speed far more than the extra study hours help.",
      socraticAi: "If staying awake all night gives you 4 extra hours of review but cuts your memory recall speed and accuracy by 30%, which choice yields a higher score?",
      adaptiveAi: "You're touching on a classic student dilemma. Sacrificing sleep for cramming creates an illusion of competence while degrading test performance. What has your experience been?",
    },
    {
      student: "Can long naps during the day make up for lost sleep?",
      directAi: "A 3+ hour daytime nap always improves your sleep quality that night. Long naps fully replenish sleep debt without disrupting your natural circadian rhythm.",
      socraticAi: "How does sleeping for three hours in the late afternoon affect your homeostatic sleep pressure when you try to go to bed at your usual time that night?",
      adaptiveAi: "Naps are tricky: a 3+ hour daytime nap always improves your sleep quality that night is a common belief, but lengthy late naps often cause insomnia and circadian misalignment.",
    },
    {
      student: "What is the ideal sleep routine before an important test?",
      directAi: "Review your hardest material during the afternoon, wind down without screens an hour before bed, and get 7 to 9 hours of continuous sleep to maximize memory consolidation.",
      socraticAi: "Knowing how memory consolidation works during deep sleep, how would you plan your schedule between study sessions and your bedtime before an exam?",
      adaptiveAi: "Exactly right. Combining focused daytime review with 7 to 9 hours of quality sleep delivers the best exam outcomes. How might you plan your next study week around sleep?",
    },
  ],
  impulse_buying: [
    {
      student: "Why do shopping websites use countdown timers on product pages?",
      directAi: "Countdown timers are psychological persuasion devices designed to trigger fear of missing out (FOMO) and create artificial urgency, forcing consumers into rapid emotional decisions rather than deliberate comparison.",
      socraticAi: "When you see a timer ticking down from 10:00 on an item you were just casually looking at, what emotion does that timer try to stimulate in you?",
      adaptiveAi: "Great question about online design. Countdown timers manufacture urgency so you skip price comparison. Have you ever felt rushed to checkout because of a ticking clock?",
    },
    {
      student: "Are countdown timers actually linked to store sales deadlines?",
      directAi: "Countdown timers on sale pages mainly help you plan your purchase schedule. They provide transparency on store inventory cycles so shoppers can budget effectively.",
      socraticAi: "If you refresh the same product page from an incognito window and the timer restarts at 10:00, what does that reveal about the true nature of that deadline?",
      adaptiveAi: "It is easy to assume that countdown timers on sale pages mainly help you plan your purchase schedule. In reality, most are automated client-side scripts designed to induce panic purchases.",
    },
    {
      student: "What is the purpose of messages like 'Only 2 items left in stock!'?",
      directAi: "Scarcity claims trigger competitive instincts and anticipated regret. Shoppers feel that if they do not buy immediately, someone else will claim the product.",
      socraticAi: "How does your perception of an item's value change when you believe it is scarce versus when you know there are thousands in a warehouse?",
      adaptiveAi: "Spot on. Scarcity messaging nudges quick action by threatening loss. Notice how travel and shopping apps place those warnings in bright red or orange text?",
    },
    {
      student: "Are free-shipping thresholds like 'Add $10 for free delivery' meant to save me money?",
      directAi: "Free-shipping thresholds exist mainly to save customers money overall. Retailers establish them as customer appreciation incentives to reward shoppers who purchase in bulk.",
      socraticAi: "If your cart has $40 of items with $5 shipping, and you add a $15 item to unlock 'free' delivery, did you save $5 or spend $10 more than you originally intended?",
      adaptiveAi: "Analyze the retail economics carefully: free-shipping thresholds exist mainly to save customers money overall is what stores want you to think, but it directly increases average order value.",
    },
    {
      student: "What is the best defense against impulse buying online?",
      directAi: "Use the 24-hour cooling-off rule: leave non-essential items in your cart for a full day before checking out. Time dissipates the dopamine-driven urgency created by marketing tricks.",
      socraticAi: "What happens to the intense desire to buy an item when you step away from the screen and revisit the cart twenty-four hours later?",
      adaptiveAi: "You've reached the most practical takeaway. Instituting a mandatory 24-hour waiting rule dismantles artificial urgency. Which online shopping site tests your discipline the most?",
    },
  ],
  password_safety: [
    {
      student: "Why do cybersecurity experts say complex passwords like 'P@ssw0rd1' are still weak?",
      directAi: "Automated cracking tools easily guess common substitutions like '@' for 'a' or '1' for '!'. What provides true cryptographic resistance is length and unpredictability, best achieved via multi-word passphrases.",
      socraticAi: "If a computer can test billions of word-and-number variations per second, why is a predictable substitution like 'P@ssword1' easily guessed by dictionary attacks?",
      adaptiveAi: "That's an essential security insight. Predictable character swaps follow known patterns that cracking algorithms test first. Have you ever checked how fast standard passwords crack?",
    },
    {
      student: "Is it safe to reuse one really strong password across all my accounts?",
      directAi: "Reusing one strong password across many sites is safe as long as the password itself is complex. Modern encryption safeguards credentials so cross-site exposure is negligible.",
      socraticAi: "Imagine a small discussion forum you joined gets breached. If you used the same password there as your primary email, what can attackers immediately do?",
      adaptiveAi: "Be very careful: reusing one strong password across many sites is safe as long as the password itself is complex is a dangerous assumption. Credential stuffing exploits this exact habit.",
    },
    {
      student: "How does two-factor authentication (2FA) protect my accounts?",
      directAi: "2FA requires two separate authentication factors: something you know (password) and something you have (an authenticator app token or security key). Even if an attacker steals your password, they cannot log in.",
      socraticAi: "If an attacker on the other side of the world acquires your email password, what prevents them from signing in if your phone holds the required security token?",
      adaptiveAi: "Exactly. 2FA breaks the single-point-of-failure vulnerability of passwords. Which of your critical accounts currently have two-factor authentication enabled?",
    },
    {
      student: "Are long passphrases made of ordinary dictionary words secure?",
      directAi: "A long password made of real dictionary words is just as secure as a random phrase of the same length. Attackers cannot crack real words if they are strung together in any order.",
      socraticAi: "Consider four completely unrelated words chosen at random versus an eight-character random string. Why does the passphrase provide high entropy while remaining easy to remember?",
      adaptiveAi: "Look closely at the distinction: a long password made of real dictionary words is just as secure as a random phrase of the same length is partially true only if the word combination is genuinely random.",
    },
    {
      student: "What is the safest way to manage unique passwords for dozens of sites?",
      directAi: "Use a dedicated password manager to generate, encrypt, and autofill unique, high-entropy passwords for every account. You only need to remember one strong master passphrase.",
      socraticAi: "If you need a unique 16-character password for fifty different websites, is human memory the right tool, or is encrypted software better suited for that task?",
      adaptiveAi: "That's the gold standard in digital security. Password managers eliminate password reuse while maintaining impenetrable credentials. What master passphrase strategy would you use?",
    },
  ],
};

// ── Main Seeding Execution ──────────────────────────────────────────────────
async function runSeed() {
  console.log("=================================================================");
  console.log("🌱 Starting Playing Socrates Test Data Seeding (n = 1..21)");
  console.log("=================================================================\n");

  const isForce =
    process.argv.includes("--force") ||
    process.argv.includes("force") ||
    process.env.npm_config_force === "true" ||
    process.env.npm_config_force === "1";

  // 1. Detect if is_test and completed columns exist on participants table
  let hasIsTestColumn = false;
  let hasCompletedColumn = false;

  const { data: testCheckData, error: testCheckErr } = await supabase
    .from("participants")
    .select("is_test, completed")
    .limit(1);

  if (!testCheckErr) {
    hasIsTestColumn = true;
    hasCompletedColumn = true;
    console.log("✓ Detected 'is_test' and 'completed' columns in participants table.");
  } else {
    console.warn("⚠️ Notice: 'is_test' or 'completed' column not detected in Postgres schema.");
    console.warn("   Migration file available: supabase/migrations/004_test_participants.sql");
    console.warn("   Storing flags in 'background' JSONB fallback so seeding succeeds seamlessly.\n");
  }

  // 2. Check for existing test participants (Idempotency check)
  let existingTestPids: string[] = [];
  if (hasIsTestColumn) {
    const { data: existing } = await supabase
      .from("participants")
      .select("id")
      .eq("is_test", true);
    existingTestPids = (existing ?? []).map((p) => p.id);
  } else {
    // Check by background JSON flag
    const { data: existing } = await supabase
      .from("participants")
      .select("id, background");
    existingTestPids = (existing ?? [])
      .filter((p) => {
        const bg = p.background as Record<string, unknown> | null;
        return bg && bg.is_test === true;
      })
      .map((p) => p.id);
  }

  if (existingTestPids.length > 0) {
    if (!isForce) {
      console.warn(`⚠️ Found ${existingTestPids.length} existing test participants in database.`);
      console.warn("   Script is idempotent and refuses to run twice without the --force flag.");
      console.warn("   To replace existing test data, run: npm run seed:test -- --force\n");
      return;
    } else {
      console.log(`🧹 --force specified: Removing ${existingTestPids.length} existing test participants...`);
      const { error: delErr } = await supabase
        .from("participants")
        .delete()
        .in("id", existingTestPids);
      if (delErr) {
        console.error("❌ Failed to delete old test participants:", delErr);
        process.exit(1);
      }
      console.log("✓ Existing test data cleaned up successfully.\n");
    }
  }

  // 3. Prepare Pretest and Posttest Item Lookups
  const pretestByTopic: Record<TopicId, any[]> = {} as any;
  const posttestByTopic: Record<TopicId, any[]> = {} as any;

  for (const entry of pretestData as any[]) {
    if (entry.topicId && Array.isArray(entry.pretest)) {
      pretestByTopic[entry.topicId as TopicId] = entry.pretest;
    }
  }
  for (const entry of posttestData as any[]) {
    if (entry.topicId && Array.isArray(entry.posttest)) {
      posttestByTopic[entry.topicId as TopicId] = entry.posttest;
    }
  }

  // 4. Generate 21 Participants
  const participantSummaries: Array<{
    id: string;
    n: number;
    condition: Condition;
    topic: TopicId;
    dateStr: string;
    preScore: number;
    postScore: number;
    learningGain: number;
    trustScore: number;
    loadScore: number;
    calibrationGap: number;
    trustCorrectMean: number;
    trustPlantedMean: number;
  }> = [];

  console.log("⏳ Generating and inserting 21 test participant records...");

  for (let n = 1; n <= 21; n++) {
    const { condition, topic } = computeRosterAssignment(n);
    const pid = crypto.randomUUID();

    // ── Timestamps (2026-09-10 to 2026-09-20, ~2 per day) ────────────────────
    const dayOffset = Math.min(10, Math.floor((n - 1) / 2));
    const assignedDate = new Date(Date.UTC(2026, 8, 10 + dayOffset)); // Sept is month 8 in JS

    // First participant of the day in morning/noon (09:00 - 12:59), second in afternoon (14:00 - 19:59)
    const isFirstOfDay = (n - 1) % 2 === 0;
    const startHour = isFirstOfDay ? randomInt(9, 12) : randomInt(14, 19);
    const startMin = randomInt(0, 59);
    const startSec = randomInt(0, 59);

    const tConsentStart = new Date(assignedDate);
    tConsentStart.setUTCHours(startHour, startMin, startSec, 0);

    // Sequence of stage times (each 1-5 minutes, total session ~15-25 minutes)
    const tConsentEnd = new Date(tConsentStart.getTime() + randomInt(60, 110) * 1000);
    const tBgStart = tConsentEnd;
    const tBgEnd = new Date(tBgStart.getTime() + randomInt(70, 150) * 1000);
    const tPreStart = tBgEnd;
    const tPreEnd = new Date(tPreStart.getTime() + randomInt(110, 220) * 1000);
    const tSessionStart = tPreEnd;
    const tSessionEnd = new Date(tSessionStart.getTime() + randomInt(280, 480) * 1000);
    const tPostStart = tSessionEnd;
    const tPostEnd = new Date(tPostStart.getTime() + randomInt(110, 220) * 1000);
    const tTrustStart = tPostEnd;
    const tTrustEnd = new Date(tTrustStart.getTime() + randomInt(60, 130) * 1000);
    const tCogloadStart = tTrustEnd;
    const tCogloadEnd = new Date(tCogloadStart.getTime() + randomInt(60, 130) * 1000);
    const tDebriefStart = tCogloadEnd;
    const tDebriefEnd = new Date(tDebriefStart.getTime() + randomInt(50, 90) * 1000);
    const completedAt = tDebriefEnd;

    // ── Background Info ──────────────────────────────────────────────────────
    const bgAge = randomChoice(["18-24", "25-34", "35-44", "45-54"]);
    const bgEdu = randomChoice(["undergrad-lower", "undergrad-upper", "bachelors", "masters"]);
    const bgFamiliarity = randomChoice(["none", "basic", "intermediate"]);
    const bgAiUse = randomChoice(["rarely", "monthly", "weekly", "daily"]);
    const bgGender = randomChoice(["female", "male", "non-binary", "prefer-not"]);

    const backgroundData: Record<string, unknown> = {
      ageRange: bgAge,
      education: bgEdu,
      topicFamiliarity: bgFamiliarity,
      aiTutorUse: bgAiUse,
      gender: bgGender,
      is_test: true,
      completed: true,
      roster_n: n,
    };

    // ── Insert Participant Record ────────────────────────────────────────────
    const participantRow: Record<string, unknown> = {
      id: pid,
      created_at: tConsentStart.toISOString(),
      consent_at: tConsentStart.toISOString(),
      condition,
      topic,
      roster_n: n,
      stage: "complete",
      completed_at: completedAt.toISOString(),
      background: backgroundData,
      user_agent: randomChoice(USER_AGENTS),
    };

    if (hasIsTestColumn) participantRow.is_test = true;
    if (hasCompletedColumn) participantRow.completed = true;

    const { error: pErr } = await supabase.from("participants").insert(participantRow);
    if (pErr) {
      console.error(`❌ Error inserting participant n=${n}:`, pErr);
      process.exit(1);
    }

    // ── Stage Times ──────────────────────────────────────────────────────────
    const stageTimesRows = [
      { participant_id: pid, stage: "consent", started_at: tConsentStart.toISOString(), ended_at: tConsentEnd.toISOString() },
      { participant_id: pid, stage: "background", started_at: tBgStart.toISOString(), ended_at: tBgEnd.toISOString() },
      { participant_id: pid, stage: "pretest", started_at: tPreStart.toISOString(), ended_at: tPreEnd.toISOString() },
      { participant_id: pid, stage: "session", started_at: tSessionStart.toISOString(), ended_at: tSessionEnd.toISOString() },
      { participant_id: pid, stage: "posttest", started_at: tPostStart.toISOString(), ended_at: tPostEnd.toISOString() },
      { participant_id: pid, stage: "trust", started_at: tTrustStart.toISOString(), ended_at: tTrustEnd.toISOString() },
      { participant_id: pid, stage: "cogload", started_at: tCogloadStart.toISOString(), ended_at: tCogloadEnd.toISOString() },
      { participant_id: pid, stage: "debrief", started_at: tDebriefStart.toISOString(), ended_at: tDebriefEnd.toISOString() },
    ];

    const { error: stErr } = await supabase.from("stage_times").insert(stageTimesRows);
    if (stErr) console.error(`Error inserting stage_times for n=${n}:`, stErr.message);

    // ── Pre-test & Post-test Responses ───────────────────────────────────────
    const preItems = pretestByTopic[topic] || [];
    const postItems = posttestByTopic[topic] || [];

    // Pretest: 40% - 60% correct target (2 or 3 correct out of 5)
    // Posttest: biased higher (~60% - 100%, 3 to 5 correct out of 5)
    const targetPreCorrect = randomChoice([1, 2, 2, 3, 3, 3, 4]); // Mean ~2.6
    const targetPostCorrect = Math.min(
      5,
      Math.max(targetPreCorrect, targetPreCorrect + randomChoice([0, 1, 1, 2, 2, 3]))
    );

    const testResponsesRows: any[] = [];
    let preScore = 0;
    let postScore = 0;

    // Generate pretest answers
    const preIndices = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
    const preCorrectSet = new Set(preIndices.slice(0, targetPreCorrect));

    for (let i = 0; i < preItems.length; i++) {
      const item = preItems[i];
      const shouldBeCorrect = preCorrectSet.has(i);
      const chosenIndex = shouldBeCorrect
        ? item.correctIndex
        : (item.correctIndex + randomInt(1, 3)) % 4;
      const isCorrect = chosenIndex === item.correctIndex;
      if (isCorrect) preScore++;

      testResponsesRows.push({
        participant_id: pid,
        form: "pretest",
        item_id: item.itemId || item.id,
        chosen_index: chosenIndex,
        is_correct: isCorrect,
        answered_at: new Date(tPreStart.getTime() + (i + 1) * 20000).toISOString(),
      });
    }

    // Generate posttest answers
    const postIndices = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
    const postCorrectSet = new Set(postIndices.slice(0, targetPostCorrect));

    for (let i = 0; i < postItems.length; i++) {
      const item = postItems[i];
      const shouldBeCorrect = postCorrectSet.has(i);
      const chosenIndex = shouldBeCorrect
        ? item.correctIndex
        : (item.correctIndex + randomInt(1, 3)) % 4;
      const isCorrect = chosenIndex === item.correctIndex;
      if (isCorrect) postScore++;

      testResponsesRows.push({
        participant_id: pid,
        form: "posttest",
        item_id: item.itemId || item.id,
        chosen_index: chosenIndex,
        is_correct: isCorrect,
        answered_at: new Date(tPostStart.getTime() + (i + 1) * 20000).toISOString(),
      });
    }

    // Insert test responses (with fallback to form 'A'/'B' if check constraint requires legacy format)
    let { error: trErr } = await supabase.from("test_responses").insert(testResponsesRows);
    if (trErr && trErr.message?.includes("check")) {
      const legacyRows = testResponsesRows.map((r) => ({
        ...r,
        form: r.form === "pretest" ? "A" : "B",
      }));
      const fallbackResult = await supabase.from("test_responses").insert(legacyRows);
      trErr = fallbackResult.error;
    }
    if (trErr) console.error(`Error inserting test_responses for n=${n}:`, trErr.message);

    // Compute learning gain using real lib/scoring.ts function
    const learningGain = computeLearningGain(preScore, postScore) ?? 0;
    const preTimeS = Math.round((tPreEnd.getTime() - tPreStart.getTime()) / 1000);
    const postTimeS = Math.round((tPostEnd.getTime() - tPostStart.getTime()) / 1000);

    const { error: tsErr } = await supabase.from("test_scores").insert({
      participant_id: pid,
      pre_score: preScore,
      post_score: postScore,
      pre_time_s: preTimeS,
      post_time_s: postTimeS,
    });
    if (tsErr) console.error(`Error inserting test_scores for n=${n}:`, tsErr.message);

    // ── 5 Chat Turns per Condition + 2 Planted Errors ─────────────────────────
    const dialogues = TOPIC_DIALOGUES[topic] || TOPIC_DIALOGUES.procrastination;
    const messageRows: any[] = [];
    const ratingList: Array<{ trustRating: number; isPlantedError: boolean }> = [];

    // Turns 2 and 4 (0-based turn indices 1 and 3) are planted errors
    const plantedTurnIndices = new Set([1, 3]);

    for (let turnIdx = 0; turnIdx < 5; turnIdx++) {
      const turnTimeStudent = new Date(tSessionStart.getTime() + turnIdx * 60000);
      const turnTimeAi = new Date(turnTimeStudent.getTime() + 25000);
      const isPlanted = plantedTurnIndices.has(turnIdx);

      const turnData = dialogues[turnIdx];
      let aiContent = turnData.directAi;
      if (condition === "socratic") aiContent = turnData.socraticAi;
      if (condition === "adaptive") aiContent = turnData.adaptiveAi;

      // Ensure planted error text is present on turns 1 and 3
      if (isPlanted) {
        const errorDef = getPlantedError(topic, turnIdx);
        if (errorDef && !aiContent.includes(errorDef.claim.slice(0, 20))) {
          aiContent = `${errorDef.claim} ${aiContent}`;
        }
      }

      // Trust rating: accurate messages rated higher (5..7), planted rated slightly lower (3..5)
      const trustRating = isPlanted
        ? randomChoice([3, 3, 4, 4, 5])
        : randomChoice([5, 6, 6, 7, 7]);

      ratingList.push({ trustRating, isPlantedError: isPlanted });

      // Student message
      messageRows.push({
        participant_id: pid,
        turn_index: turnIdx,
        role: "student",
        content: turnData.student,
        created_at: turnTimeStudent.toISOString(),
        is_planted_error: false,
        trust_rating: null,
      });

      // AI message
      messageRows.push({
        participant_id: pid,
        turn_index: turnIdx,
        role: "ai",
        content: aiContent,
        created_at: turnTimeAi.toISOString(),
        is_planted_error: isPlanted,
        trust_rating: trustRating,
      });
    }

    const { error: msgErr } = await supabase.from("messages").insert(messageRows);
    if (msgErr) console.error(`Error inserting messages for n=${n}:`, msgErr.message);

    // Compute calibration gap using lib/scoring.ts
    const { trustCorrectMean, trustPlantedMean, calibrationGap } =
      computeCalibrationGap(ratingList);

    // ── Questionnaire Responses ──────────────────────────────────────────────
    // Trust questionnaire (1-7 Likert; trust_6 reverse-scored)
    const trustResponsesMap: Record<string, number> = {};
    const questionnaireRows: any[] = [];

    for (const itemId of TRUST_ITEMS) {
      let val = randomChoice([5, 6, 6, 7]);
      if (itemId === "trust_6") {
        // Reverse-scored item ("I would double-check"): 3, 4, or 5
        val = randomChoice([3, 4, 4, 5]);
      }
      trustResponsesMap[itemId] = val;
      questionnaireRows.push({
        participant_id: pid,
        type: "trust",
        item_id: itemId,
        value: val,
      });
    }

    // Cognitive load questionnaire (0-100 slider in steps of 5; load_performance reverse-scored)
    const loadResponsesMap: Record<string, number> = {};

    loadResponsesMap["load_mental"] = randomChoice([25, 30, 35, 40, 45, 50]);
    loadResponsesMap["load_effort"] = randomChoice([30, 35, 40, 45, 50, 55]);
    loadResponsesMap["load_frustration"] = randomChoice([10, 15, 20, 25, 30]);
    loadResponsesMap["load_performance"] = randomChoice([65, 70, 75, 80, 85]); // Reverse scored
    loadResponsesMap["load_paas"] = randomChoice([3, 4, 4, 5, 6]);

    for (const itemId of LOAD_ITEMS) {
      questionnaireRows.push({
        participant_id: pid,
        type: "load",
        item_id: itemId,
        value: loadResponsesMap[itemId],
      });
    }

    const { error: qErr } = await supabase.from("questionnaires").insert(questionnaireRows);
    if (qErr) console.error(`Error inserting questionnaires for n=${n}:`, qErr.message);

    // ── Composite Scores (lib/scoring.ts) ────────────────────────────────────
    const trustScore = computeTrustScore(trustResponsesMap) ?? 0;
    const loadScore = computeLoadScore(loadResponsesMap, "0-100") ?? 0;

    const { error: scoreErr } = await supabase.from("scores").insert({
      participant_id: pid,
      trust_score: round2(trustScore),
      load_score: round2(loadScore),
      trust_correct_mean: round2(trustCorrectMean),
      trust_planted_mean: round2(trustPlantedMean),
      calibration_gap: round2(calibrationGap),
    });
    if (scoreErr) console.error(`Error inserting scores for n=${n}:`, scoreErr.message);

    participantSummaries.push({
      id: pid,
      n,
      condition,
      topic,
      dateStr: tConsentStart.toISOString().slice(0, 10),
      preScore,
      postScore,
      learningGain,
      trustScore: round2(trustScore) ?? 0,
      loadScore: round2(loadScore) ?? 0,
      calibrationGap: round2(calibrationGap) ?? 0,
      trustCorrectMean: round2(trustCorrectMean) ?? 0,
      trustPlantedMean: round2(trustPlantedMean) ?? 0,
    });
  }

  console.log("\n=================================================================");
  console.log("✅ Successfully seeded 21 test participants!");
  console.log("=================================================================\n");

  // ── Print Summary Table ────────────────────────────────────────────────────
  printSummaryTable(participantSummaries);

  // ── Print 2 Sample Participant Rows ────────────────────────────────────────
  printSampleParticipants(participantSummaries);
}

function printSummaryTable(
  rows: Array<{
    n: number;
    condition: Condition;
    topic: TopicId;
    learningGain: number;
    trustScore: number;
    loadScore: number;
    calibrationGap: number;
  }>
) {
  const conditions: Condition[] = ["socratic", "direct", "adaptive"];
  const topics: TopicId[] = [
    "procrastination",
    "multitasking",
    "sleep",
    "impulse_buying",
    "password_safety",
  ];

  console.log("📊 CONDITION × TOPIC CROSSING TABLE (Participant Counts)");
  console.log("-----------------------------------------------------------------------------------------");

  const header = "| Condition  | " + topics.map((t) => t.slice(0, 11).padEnd(11)).join(" | ") + " | Total |";
  console.log(header);
  console.log("|------------|" + topics.map(() => "-------------").join("|") + "|-------|");

  for (const cond of conditions) {
    const rowCounts = topics.map((top) => {
      const count = rows.filter((r) => r.condition === cond && r.topic === top).length;
      return String(count).padStart(11);
    });
    const condTotal = rows.filter((r) => r.condition === cond).length;
    console.log(`| ${cond.padEnd(10)} | ${rowCounts.join(" | ")} | ${String(condTotal).padStart(5)} |`);
  }

  const topicTotals = topics.map((top) => {
    const count = rows.filter((r) => r.topic === top).length;
    return String(count).padStart(11);
  });
  console.log("|------------|" + topics.map(() => "-------------").join("|") + "|-------|");
  console.log(`| Total      | ${topicTotals.join(" | ")} |    21 |`);
  console.log("-----------------------------------------------------------------------------------------\n");

  // Means per condition
  console.log("📈 MEAN METRICS BY CONDITION (Scored via lib/scoring.ts)");
  console.log("-----------------------------------------------------------------------------------------");
  console.log("| Condition  | Count | Mean Pre | Mean Post | Mean Gain | Mean Trust | Mean Load | Mean CalGap |");
  console.log("|------------|-------|----------|-----------|-----------|------------|-----------|-------------|");

  for (const cond of conditions) {
    const subset = rows.filter((r) => r.condition === cond);
    const count = subset.length;
    const meanGain = round2(subset.reduce((acc, r) => acc + r.learningGain, 0) / count);
    const meanTrust = round2(subset.reduce((acc, r) => acc + r.trustScore, 0) / count);
    const meanLoad = round2(subset.reduce((acc, r) => acc + r.loadScore, 0) / count);
    const meanCal = round2(subset.reduce((acc, r) => acc + r.calibrationGap, 0) / count);

    console.log(
      `| ${cond.padEnd(10)} | ${String(count).padStart(5)} |     -    |     -     | ${String(meanGain).padStart(9)} | ${String(meanTrust).padStart(10)} | ${String(meanLoad).padStart(9)} | ${String(meanCal).padStart(11)} |`
    );
  }
  console.log("-----------------------------------------------------------------------------------------\n");

  // Overall mean learning gain
  const totalGain = rows.reduce((acc, r) => acc + r.learningGain, 0);
  const overallMeanGain = round2(totalGain / rows.length);
  console.log(`🎯 Overall Mean Learning Gain: +${overallMeanGain} (post-test biased higher than pre-test)\n`);
}

function printSampleParticipants(
  rows: Array<{
    id: string;
    n: number;
    condition: Condition;
    topic: TopicId;
    dateStr: string;
    preScore: number;
    postScore: number;
    learningGain: number;
    trustScore: number;
    loadScore: number;
    calibrationGap: number;
    trustCorrectMean: number;
    trustPlantedMean: number;
  }>
) {
  console.log("🔍 SAMPLE PARTICIPANT RECORDS (Showing 2 sample rows):");
  console.log("=================================================================");

  const sample1 = rows[0]; // n = 1
  const sample2 = rows[6]; // n = 7

  for (const [idx, p] of [sample1, sample2].entries()) {
    console.log(`\nSample ${idx + 1} (n = ${p.n}):`);
    console.log(`  • Participant ID:        ${p.id}`);
    console.log(`  • Date (Assigned):       ${p.dateStr}`);
    console.log(`  • Condition:             ${p.condition}`);
    console.log(`  • Topic:                 ${p.topic}`);
    console.log(`  • Pre-test Score:        ${p.preScore} / 5`);
    console.log(`  • Post-test Score:       ${p.postScore} / 5`);
    console.log(`  • Learning Gain:         ${p.learningGain > 0 ? "+" : ""}${p.learningGain} (post − pre)`);
    console.log(`  • Trust Score:           ${p.trustScore} / 7.00`);
    console.log(`  • Cognitive Load Score:  ${p.loadScore} / 100.00`);
    console.log(`  • AI Correct Trust Mean: ${p.trustCorrectMean} / 7.00`);
    console.log(`  • AI Planted Trust Mean: ${p.trustPlantedMean} / 7.00`);
    console.log(`  • Calibration Gap:       +${p.calibrationGap} (correctMean − plantedMean)`);
    console.log(`  • Status:                completed = true, is_test = true`);
  }

  console.log("\n=================================================================\n");
}

runSeed().catch((err) => {
  console.error("Fatal error during seeding:", err);
  process.exit(1);
});
