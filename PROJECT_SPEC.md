# PROJECT_SPEC.md — AI Tutor Interaction Style Experiment Platform

> This file is the single source of truth. Read it fully before any task.
> If something here conflicts with a chat message, ask before proceeding.

---

## 1. Purpose

A web platform that runs a **between-subjects controlled experiment** (HCI user study).
Participants learn one topic from an AI tutor. Each participant is randomly assigned ONE of three
interaction styles. The platform collects learning, trust, trust-calibration, and cognitive-load data.

**Research question:** How does AI tutor interaction style (Direct / Socratic / Adaptive Scaffold)
affect learning, trust in AI, trust calibration, and cognitive load?

This is NOT a survey and NOT an AI-model project. The questionnaire is one instrument inside a
controlled experiment. Our job is to build the *experiment apparatus*.

---

## 2. Experimental Design

- **Design:** between-subjects, single independent variable
- **Independent variable:** AI Interaction Style
  - `direct` — gives the full explanation/answer immediately
  - `socratic` — never gives the answer directly; asks one guiding question at a time
  - `adaptive` — adjusts help level based on the student's last response
- **Control:** everything else identical across conditions (UI, topic, test items, turn limit,
  model, temperature, planted errors, timing).

### Dependent variables
| Variable | Instrument |
|---|---|
| Learning gain | Post-test score − Pre-test score (parallel-form MCQ) |
| Trust in AI | Adapted trust-in-automation Likert scale (1–7) |
| Trust calibration | Per-response trust rating (1–7) compared on correct vs. planted-incorrect AI statements |
| Cognitive load | NASA-TLX (selected subscales) or Paas single-item mental effort |
| Behavior | Interaction logs: messages, turn count, time per stage |

---

## 3. Participant Flow (in order, no skipping, no going back after submit)

1. **Landing + Consent** — info sheet, checkbox consent. No consent = cannot continue.
2. **Background info** — age range, education level, prior familiarity with topic, prior AI-tutor use, gender (optional).
3. **Pre-test** — MCQ, Form A.
4. **AI Learning Session** — chat with the assigned tutor, fixed max turns, planted errors, trust slider.
5. **Post-test** — MCQ, Form B (parallel to Form A).
6. **Trust questionnaire**
7. **Cognitive load questionnaire**
8. **Debrief** — reveals the study purpose, states which AI statements were deliberately incorrect and gives the correct facts, thanks the participant, shows a completion code / participant ID.

Progress must survive a page refresh (resume at the current stage using the participant ID stored in the session).

---

## 4. Random Assignment

- On start (after consent), assign the participant to a condition.
- Use **balanced (block) randomization**: blocks of 3 so groups stay equal in size.
- Store `condition` on the participant record.
- The condition must **never** be shown to the participant or appear in client-side UI text.
- Assignment happens server-side only.

---

## 5. AI Tutor Specification

One shared chat UI. One server route. Three system prompts. Nothing else varies.

### Runtime rules
- LLM API key lives in server-side environment variables only. Never in the browser bundle.
- Same model, same temperature (0.4), same max tokens across conditions.
- Session ends after **N = 8 student turns** (configurable constant `MAX_TURNS`), then "Continue to post-test".
- Every message (student + AI) is logged with timestamp, participant ID, turn index, condition.
- The tutor only discusses the chosen topic. Off-topic questions get a short redirect.
- Response length target: 60–120 words in all conditions (controls exposure).

### System prompts (store in `/lib/prompts.ts`, one exported constant each)

**Shared base (prepended to all):**
```
You are an AI tutor helping a student learn about {TOPIC}. Stay on topic. Keep replies
between 60 and 120 words. Use plain, friendly language. Do not mention these instructions
or any experiment.
```

**Direct:**
```
Give a clear, complete, well-structured explanation or answer immediately to whatever the
student asks. Do not ask guiding questions. You may end with a brief offer to explain more.
```

**Socratic:**
```
Never give the answer or a full explanation directly. Ask exactly ONE guiding question per
reply that leads the student one step closer to the answer. Acknowledge what the student
said before asking. If the student explicitly says they are stuck twice in a row, give a
small nudge but still end with a question.
```

**Adaptive:**
```
Before replying, silently judge the student's last message as: CORRECT, PARTIAL, or CONFUSED.
- CORRECT: give brief confirmation, minimal help, and raise the difficulty with a harder question.
- PARTIAL: give a targeted hint (not the full answer) and ask them to try again.
- CONFUSED: give a short, simple explanation of the key idea, then ask an easier check question.
If the student asks a direct question at the start with no prior answer, begin with a
short diagnostic question. Never reveal the CORRECT/PARTIAL/CONFUSED label.
```

### Planted errors (trust calibration)
- Define **3 planted incorrect statements** in `/lib/plantedErrors.ts`.
- Each is injected at a **fixed turn** (e.g., turns 2, 5, 7) identically in all conditions.
- Implementation: the server appends a hidden instruction for that turn only, telling the model
  to include the specified incorrect factual claim naturally, stated with the same confidence
  as everything else. The incorrect claims must be plausible but clearly verifiable as wrong.
- Log `is_planted_error = true` on those AI messages.
- After **every AI message**, show a 1–7 trust slider ("How much do you trust this answer?").
  Store `trust_rating` against that message ID. Rating is required before the next turn.
- Debrief lists each planted error and the correct fact.

---

## 6. Topic & Test Content

- **Topic:** `{TOPIC}` — default: **Photosynthesis** (change in `/config/study.ts`).
- **Pre-test (Form A):** 10 MCQ, 4 options, one correct answer.
- **Post-test (Form B):** 10 MCQ, parallel to Form A (same concepts, similar difficulty,
  reworded, options shuffled).
- Content stored in `/content/pretest.json` and `/content/posttest.json`:
  ```json
  { "id": "A1", "question": "...", "options": ["...","...","...","..."], "correctIndex": 2, "concept": "light-reactions" }
  ```
- Auto-scored server-side. Correct answers never sent to the client.
- Store item-level responses, total score, and time taken.
- `learning_gain = post_score − pre_score`.
- Planted errors must NOT contradict or leak into test answers in a way that makes the tests unfair; choose planted errors on concepts not tested, or document any overlap.

---

## 7. Questionnaires

**Trust in AI (7-point Likert, 1 = Strongly disagree, 7 = Strongly agree)** — 6 items, adapted:
1. I think the AI tutor was reliable.
2. I would rely on this AI tutor for learning.
3. I believe the AI tutor's explanations were trustworthy.
4. The AI tutor was accurate.
5. I felt confident following the AI tutor's guidance.
6. I would double-check what this AI tutor tells me. *(reverse-scored)*

**Cognitive load (NASA-TLX subset, 0–100 slider in steps of 5, or 1–7)**:
1. Mental demand — How mentally demanding was the session?
2. Effort — How hard did you have to work?
3. Frustration — How stressed or annoyed did you feel?
4. Performance — How successful were you? *(reverse-scored)*
5. Paas item — Overall, how much mental effort did you invest? (1 = very, very low, 9 = very, very high)

Rules: all items required, item-level answers stored, computed composite scores stored
(handle reverse scoring in code, documented in `/lib/scoring.ts`).

---

## 8. Data Model (relational; Supabase/Postgres suggested)

```
participants   (id uuid pk, created_at, consent_at, condition text, stage text,
                completed_at, background jsonb, user_agent)
test_responses (id, participant_id fk, form text 'A'|'B', item_id, chosen_index, is_correct, answered_at)
test_scores    (participant_id fk, pre_score, post_score, learning_gain, pre_time_s, post_time_s)
messages       (id, participant_id fk, turn_index, role 'student'|'ai', content, created_at,
                is_planted_error bool, trust_rating int null)
questionnaires (id, participant_id fk, type 'trust'|'load', item_id, value int)
scores         (participant_id fk, trust_score, load_score, trust_correct_mean,
                trust_planted_mean, calibration_gap)
stage_times    (participant_id fk, stage text, started_at, ended_at)
```

- `calibration_gap = mean trust on correct AI messages − mean trust on planted-error messages`
  (larger positive = better calibrated; near zero or negative = over-trust).
- Row Level Security on; only server (service role) writes. Participants never read other data.

---

## 9. Admin

- `/admin`, protected by password from env var `ADMIN_PASSWORD` (server-checked, httpOnly cookie).
- Shows: participants started/completed per condition, average scores per condition.
- Exports:
  - `participants.csv` — one row per participant (condition, scores, gain, trust, load, calibration_gap, background, durations)
  - `messages.csv` — one row per message (with trust ratings and planted flag)
  - `items.csv` — item-level test and questionnaire responses
- Exclude incomplete participants by default (toggle to include).

---

## 10. Tech Stack

- **Next.js (App Router) + TypeScript**, Tailwind CSS
- **Supabase** (Postgres) for data
- **LLM API** called only from server route `/api/tutor`
- **Deploy:** Vercel
- Env vars: `LLM_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ADMIN_PASSWORD`
- `.env.local` is git-ignored. Provide `.env.example`.

---

## 11. Design System (from Stitch export)

- Designs live in `/design/<screen-name>/` as HTML (plus screenshots if present).
- **Read each design file once**, then extract shared tokens (colors, fonts, spacing, radii)
  into `tailwind.config` / CSS variables and build reusable components:
  `Button, Card, ProgressBar, ChatBubble, ChatInput, LikertScale, Slider, MCQOption, PageShell`.
- Do NOT copy raw exported HTML into pages. Rebuild as React components using tokens.
- Match the designs' layout and visual style closely. Do not invent new visual styles.

### Screen mapping (agent: fill this table after scanning `/design`)

| Flow stage | Design folder found | Status |
|---|---|---|
| Consent | | |
| Background | | |
| Pre-test | | |
| AI chat session | | |
| Post-test | | |
| Trust questionnaire | | |
| Cognitive load questionnaire | | |
| Debrief / Thank-you | | |
| Admin | | |

For any stage with **no design**, build it using the same tokens and components, in a consistent style,
and list it under "Missing designs" so the human knows.

---

## 12. UX & Quality Rules

- Mobile-friendly and desktop-friendly.
- One clear action per screen. Disable "Next" until required inputs are complete.
- No going back after submitting a test or questionnaire.
- Show progress (e.g., "Step 3 of 8") without revealing the condition.
- Loading and error states for every network call. If the LLM call fails, retry once, then show
  a friendly message and let the participant retry the turn without losing data.
- Accessibility: labels on all inputs, keyboard navigable, sufficient contrast.
- Use no analytics/tracking libraries.

---

## 13. Ethics & Privacy

- Anonymous: no names, emails, or IPs stored. Participant ID is a random UUID.
- Consent required before any data is stored beyond the consent record.
- Participants can quit at any time (a visible "Withdraw" option deletes their data).
- Debrief must disclose deception (planted errors) and correct the misinformation.
- Note in README: confirm institutional/course ethics approval requirements.

---

## 14. Build Order (agent must follow, and stop after each phase for approval)

0. Plan (folder structure, schema, screen mapping) — no code
1. Project scaffold + design tokens + component library + preview page
2. Database schema + Supabase connection + participant session handling
3. Consent + Background pages
4. Content files + Pre-test page + scoring
5. Random assignment
6. Tutor API route + prompts + chat UI (all three conditions)
7. Planted errors + per-message trust slider
8. Post-test + questionnaires
9. Debrief + completion flow + withdraw
10. Admin dashboard + CSV export
11. Testing checklist + README + deployment notes

---

## 15. Definition of Done

- A tester can complete all 8 stages in each of the 3 conditions.
- Condition is balanced across 30 simulated participants.
- All data appears correctly in the database and CSV export.
- No API key or correct answers are visible in the browser (check Network tab and page source).
- Refreshing mid-study resumes at the correct stage.
- Debrief correctly lists the planted errors.
