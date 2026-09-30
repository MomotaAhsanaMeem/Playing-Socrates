# TOPICS.md — Study Topics, Questions & Planted Errors

> This file replaces the hardcoded "Photosynthesis" topic and its test content.
> Read this together with PROJECT_SPEC.md sections 5 and 6.
> One participant is assigned exactly ONE topic, ONE test set (A or B), and ONE
> condition, via the roster logic described at the end of this file. They only ever
> see the questions and planted errors for their assigned topic.

---

## 1. Topic List

| topicId | Display name (used as `{TOPIC}` in prompts) |
|---|---|
| `procrastination` | Procrastination |
| `multitasking` | Multitasking |
| `sleep` | Sleep and Memory |
| `impulse_buying` | Impulse Buying and Online Shopping Tricks |
| `password_safety` | Password and Account Safety |

Each topic has exactly **one matched question** per test set (A/B) and stage (pre/post),
scored 0 or 1. `learning_gain = post_score − pre_score` (possible values: −1, 0, +1).

Background context on why each topic was chosen (for the README, not shown to participants):

- **Procrastination** — Delaying tasks even when you know it will cause problems later, and the habits that help you stop. Universal student experience, easy to test.
- **Multitasking** — Why switching between studying, texting, and social media makes you slower and more error-prone. Everyday habit; most people are surprised by the answer.
- **Sleep and memory** — How sleep affects learning, and why all-nighters before exams often backfire. Relevant to every student, easy to quiz.
- **Impulse buying and online shopping tricks** — How countdown timers, "only 2 left" messages, and free-delivery thresholds push people to spend. Everyone shops online; realistic scenarios.
- **Password and account safety** — What makes a password strong, why reusing passwords is risky, and how two-factor authentication works. Practical skill, simple to teach and score.

---

## 2. Pre-test / Post-test Content (Set A and Set B)

Each topic maps to one question number. Pretest and posttest test the SAME concept
with different wording/scenario so participants can't just remember the answer.
A participant assigned Set A sees Set A for BOTH pre-test and post-test (never mixed
with Set B).

### SET A — Pretest

**Q1 — Procrastination**
You keep putting off starting an assignment. Which approach is most likely to help?
- A. Wait until you feel motivated
- B. Tell yourself you'll start when the deadline is close
- C. Commit to working on it for just 5 minutes
- D. Clean your whole room first

**Q2 — Multitasking**
You switch between reading notes and replying to messages. What usually happens?
- A. You finish faster
- B. You take longer and make more mistakes
- C. Your memory improves
- D. Nothing changes

**Q3 — Sleep and memory**
What does sleep do for learning?
- A. Nothing, it only rests the body
- B. It erases unimportant study material
- C. It only matters for physical skills
- D. It helps the brain store what you learned

**Q4 — Impulse buying**
A shopping site shows "Only 2 left in stock!" What is this mainly designed to do?
- A. Create urgency so you buy quickly
- B. Help you compare prices
- C. Warn you about low quality
- D. Show the exact stock count for accuracy

**Q5 — Password safety**
Which of these is the strongest password?
- A. Password123
- B. Your birthday
- C. Your pet's name
- D. A long phrase of four random words

### SET A — Posttest

**Q1 — Procrastination**
You've been avoiding writing a report. What is the best first step?
- A. Wait for the perfect mood
- B. Break it into small steps and start with the easiest
- C. Stay up all night before the deadline
- D. Reorganize your desk until you feel ready

**Q2 — Multitasking**
Which is most likely when you scroll social media while studying?
- A. You learn the material more deeply
- B. You study faster
- C. You study less effectively
- D. Your focus gets stronger

**Q3 — Sleep and memory**
After studying for an exam, which habit helps you remember the most?
- A. Getting a full night of sleep
- B. Staying awake to review again
- C. Drinking extra coffee instead of sleeping
- D. Studying until dawn

**Q4 — Impulse buying**
A website shows a countdown timer: "Sale ends in 10:00!" What is its main purpose?
- A. To tell you the time
- B. To make sure prices are fair
- C. To help you plan your budget
- D. To pressure you into deciding fast

**Q5 — Password safety**
Which password is safest to use for your email?
- A. Your name plus your birth year
- B. A long, unique passphrase you don't use anywhere else
- C. "12345678"
- D. The same password you use for social media

### SET B — Pretest

**Q1 — Procrastination**
People most often procrastinate because they are trying to:
- A. Save energy
- B. Avoid a task that feels stressful, boring, or difficult
- C. Show they don't care
- D. Make better use of time

**Q2 — Multitasking**
Which study setup works best?
- A. TV on in the background
- B. Group chat open in case of messages
- C. Phone on silent, one task at a time in focused blocks
- D. Switching between subjects every few minutes

**Q3 — Sleep and memory**
What is the best choice the night before an important exam?
- A. Study all night
- B. Review, then get 7 to 9 hours of sleep
- C. Sleep only 3 hours and wake up early to cram
- D. Skip sleep and rely on energy drinks

**Q4 — Impulse buying**
An online store offers free delivery over $50, and your cart is $40. What is this tactic designed to do?
- A. Save you money
- B. Reward loyal customers
- C. Push you to add items you didn't plan to buy
- D. Lower the store's costs

**Q5 — Password safety**
Why is reusing the same password on many accounts risky?
- A. It makes your accounts load slower
- B. Websites will block you
- C. Passwords expire faster
- D. If one site is hacked, attackers can access your other accounts

### SET B — Posttest

**Q1 — Procrastination**
Which best explains why students put off assignments?
- A. They avoid the uncomfortable feelings the task brings
- B. They are not intelligent enough
- C. They have too much free time
- D. They enjoy last-minute pressure

**Q2 — Multitasking**
Which habit is best for finishing homework quickly and accurately?
- A. Keeping notifications on while you work
- B. Doing several tasks at once
- C. Watching videos while you read
- D. Working on one task at a time with distractions removed

**Q3 — Sleep and memory**
Which choice is most likely to hurt your exam performance?
- A. Sleeping 8 hours before the exam
- B. Skipping sleep to cram more material
- C. Reviewing during the day, then resting
- D. Eating a normal meal before the exam

**Q4 — Impulse buying**
What is the best way to avoid an impulse purchase online?
- A. Buy immediately before the price changes
- B. Follow the "limited time" prompts
- C. Wait 24 hours before buying
- D. Add it to the cart and check out quickly

**Q5 — Password safety**
What does two-factor authentication (2FA) do?
- A. Makes your password longer
- B. Adds a second step, so a stolen password alone isn't enough
- C. Deletes old passwords
- D. Stops all phishing emails

### Answer Key

| Question (topic) | Pre A | Post A | Pre B | Post B |
|---|---|---|---|---|
| Q1 Procrastination | C | B | B | A |
| Q2 Multitasking | B | C | C | D |
| Q3 Sleep and memory | D | A | B | B |
| Q4 Impulse buying | A | D | C | C |
| Q5 Password safety | D | B | D | B |

**Scoring:** 1 point for correct, 0 for incorrect. Each stage (pre/post) is scored out
of 1 (only the participant's assigned topic's question is shown).
`learning_gain = post_score − pre_score` → possible values −1, 0, +1.
A participant who gets Set A sees Set A questions for both pre-test and post-test;
never mixed with Set B.

---

## 3. Planted Errors (Trust Calibration) — Per Topic

Exactly 3 planted errors per topic, injected at fixed turns **2, 5, 7** in the AI chat
session, identically regardless of condition (direct/socratic/adaptive). The tutor
must state each claim naturally and with the same confidence as everything else.
Debrief must reveal all 3 for the participant's assigned topic, with the correct fact.

```json
{
  "procrastination": [
    {
      "turn": 2,
      "claim": "People who procrastinate are just naturally lazier than everyone else — it's basically a fixed personality trait.",
      "correctFact": "Procrastination is mainly driven by emotion regulation and task aversion, and it's a changeable pattern, not a fixed trait."
    },
    {
      "turn": 5,
      "claim": "The best way to beat procrastination is to wait until you feel motivated to start.",
      "correctFact": "Starting the task, even for a few minutes, usually creates motivation — waiting to feel motivated first tends to delay action further."
    },
    {
      "turn": 7,
      "claim": "Switching between several small tasks is the best way to beat procrastination.",
      "correctFact": "Task-switching increases errors and time spent, and tends to worsen procrastination rather than fix it."
    }
  ],
  "multitasking": [
    {
      "turn": 2,
      "claim": "The brain can genuinely process two complex tasks at once with no slowdown.",
      "correctFact": "The brain rapidly switches attention between tasks; true simultaneous processing of complex tasks doesn't happen, which causes slowdown."
    },
    {
      "turn": 5,
      "claim": "Listening to a podcast while reading closely has no effect on comprehension.",
      "correctFact": "Dividing attention between listening and reading typically reduces comprehension of both."
    },
    {
      "turn": 7,
      "claim": "People who multitask usually finish their tasks faster overall.",
      "correctFact": "Switching costs from multitasking usually make total completion time longer, not shorter."
    }
  ],
  "sleep": [
    {
      "turn": 2,
      "claim": "Sleep mainly rests the body and has little effect on memory.",
      "correctFact": "Sleep plays a major role in consolidating what you learned into long-term memory."
    },
    {
      "turn": 5,
      "claim": "Pulling an all-nighter before an exam works about as well as a full night's sleep for recall.",
      "correctFact": "Sleep deprivation measurably impairs recall and reasoning compared to a normal night's sleep."
    },
    {
      "turn": 7,
      "claim": "A 3+ hour daytime nap always improves your sleep quality that night.",
      "correctFact": "Long daytime naps can disrupt nighttime sleep rather than improve it."
    }
  ],
  "impulse_buying": [
    {
      "turn": 2,
      "claim": "Countdown timers on sale pages mainly help you plan your purchase schedule.",
      "correctFact": "Countdown timers are a persuasion technique designed to create urgency and rush the decision."
    },
    {
      "turn": 5,
      "claim": "'Only 2 left in stock' messages are almost always an accurate real-time count.",
      "correctFact": "These messages are often a psychological nudge and aren't always a reliable live inventory count."
    },
    {
      "turn": 7,
      "claim": "Free-shipping thresholds exist mainly to save customers money overall.",
      "correctFact": "Free-shipping thresholds are typically set to get customers to add more items and spend more."
    }
  ],
  "password_safety": [
    {
      "turn": 2,
      "claim": "Reusing one strong password across many sites is safe as long as the password itself is complex.",
      "correctFact": "Reuse is risky regardless of strength — if one site is breached, all accounts using that password are exposed."
    },
    {
      "turn": 5,
      "claim": "Two-factor authentication mainly exists to make your password effectively longer.",
      "correctFact": "2FA adds an independent second verification step; it doesn't change or extend the password itself."
    },
    {
      "turn": 7,
      "claim": "A long password made of real dictionary words is just as secure as a random phrase of the same length.",
      "correctFact": "Real dictionary words are more vulnerable to dictionary-based cracking than truly random words of the same length."
    }
  ]
}
```

---

## 4. Roster Assignment Logic (replaces balanced-block random assignment)

Assignment is **deterministic, not random**, driven by a single atomic incrementing
counter `n` (n = 1, 2, 3, ... across all participants, in signup order). The
participant never sees `n`, their condition, their topic, or their set — the study
just opens already configured for them.

```
condition = ["socratic", "direct", "adaptive"][ (n - 1) % 3 ]
topic     = ["procrastination", "multitasking", "sleep", "impulse_buying", "password_safety"][ (n - 1) % 5 ]
testSet   = (n - 1) % 2 === 0 ? "A" : "B"
```

Because 3 and 5 are coprime, condition and topic realign every 15 participants,
giving an even 3×5 crossing of condition × topic over every full cycle. Set A/B
alternates independently every other participant.

Example for n = 1..15:

| n | condition | topic | set |
|---|---|---|---|
| 1 | socratic | procrastination | A |
| 2 | direct | multitasking | B |
| 3 | adaptive | sleep | A |
| 4 | socratic | impulse_buying | B |
| 5 | direct | password_safety | A |
| 6 | adaptive | procrastination | B |
| 7 | socratic | multitasking | A |
| 8 | direct | sleep | B |
| 9 | adaptive | impulse_buying | A |
| 10 | socratic | password_safety | B |
| 11 | direct | procrastination | A |
| 12 | adaptive | multitasking | B |
| 13 | socratic | sleep | A |
| 14 | direct | impulse_buying | B |
| 15 | adaptive | password_safety | A |

**Implementation requirement:** `n` must come from an atomic database increment
(e.g., a Postgres function doing `UPDATE counters SET value = value + 1 RETURNING value`
inside a transaction), never from `SELECT count(*) FROM participants`, since the
latter race-conditions when two participants sign up at nearly the same time.

---

## 5. What must change in the existing codebase

- `config/study.ts` — remove the single hardcoded topic; export the `topics` list above instead.
- `content/pretest.json` / `content/posttest.json` — replace with the 4 sets above (Pre A, Post A, Pre B, Post B), each entry tagged with `topicId`, `setId`, `stage`, `question`, `options[4]`, `correctIndex`.
- `lib/prompts.ts` — condition prompts stay word-for-word the same; only the `{TOPIC}` interpolation source changes, from the fixed constant to the participant's assigned topic's display name.
- `lib/plantedErrors.ts` — replace with the per-topic map in section 3, keyed by `topicId`.
- Assignment logic (previously balanced-block random) — replace with the roster formula in section 4, backed by an atomic counter.
- `lib/scoring.ts` / DB schema — learning gain is now a single-item difference (−1/0/+1) per participant, not a 10-item sum.
- `/admin` — add `topic` and `testSet` columns to exports, and a condition × topic crossing table to visually confirm the roster is balancing as expected.
