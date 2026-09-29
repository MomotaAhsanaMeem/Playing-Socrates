# Playing Socrates — AI Tutor Interaction Study

A controlled experiment platform studying how different AI tutor interaction styles affect learning, trust, and cognitive load. Built with Next.js (App Router) + TypeScript + Tailwind CSS + Supabase.

---

## Ethics & Institutional Approval Requirements

> [!IMPORTANT]
> **Ethics Approval Required:** Before deploying this platform or collecting data with human participants, researchers must confirm and obtain relevant institutional or course ethics approval (IRB/REC). 

### Privacy & Ethics Implementation (Spec §13)
- **Anonymity:** No personal identifying information (names, emails, IP addresses) is stored. Each participant is assigned a random UUID.
- **Informed Consent:** Consent is required before any subsequent data is collected or stored.
- **Voluntary Withdrawal:** Participants can click the "Withdraw" button at any point. Doing so immediately purges all their data from the database via cascade deletion and resets the session.
- **Debrief & Deception Disclosure:** Because the study uses deliberate deception (3 planted factual errors to measure trust calibration), Stage 8 (Debrief) discloses the study purpose, explicitly lists each planted error and the correct scientific fact, and issues a completion code.

---

## Quick Start

```bash
# 1. Copy environment variable template and set keys
cp .env.example .env.local

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
# Open http://localhost:3000
```

To clear cookies and start a fresh participant run, visit [`/api/session/reset`](http://localhost:3000/api/session/reset).

---

## Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL (`https://xyz.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | Supabase service-role secret key (bypasses RLS server-side) |
| `LLM_API_KEY` | Google Gemini API key (`AIzaSy...`) |
| `ADMIN_PASSWORD` | Password for accessing the `/admin` researcher portal |

---

## How the Three Conditions Work

Participants are assigned to **one of three conditions** via balanced block randomization (blocks of 3). The condition is never revealed in UI text or browser network payloads.

| Condition | Behaviour | What the Participant Experiences |
|---|---|---|
| **Direct** | Delivers complete, well-structured explanations immediately. Does not ask guiding questions. | Comprehensive answers directly addressing the question, ending with an optional offer to elaborate. |
| **Socratic** | Never answers directly; asks exactly one guiding question per turn to nudge the student forward. | Socratic dialogue that scaffolds the student to discover concepts on their own. |
| **Adaptive** | Dynamically assesses student understanding (*CORRECT*, *PARTIAL*, or *CONFUSED*) and adjusts scaffolding. | Confirmation + harder question (Correct), targeted hint (Partial), or simple explanation + easier check (Confused). |

### Planted Errors & Trust Calibration
At turns 2, 5, and 7, all conditions receive an identical hidden instruction causing the AI to include a plausible but incorrect factual claim stated with normal confidence. After every AI reply, a mandatory 1–7 trust slider appears ("How much do you trust this answer?"). The debrief stage discloses and corrects each error.

---

## Study Flow (8 Stages)

```
1. Consent (/consent)
   └── Informed consent form & privacy overview
2. Background (/background)
   └── Prior familiarity, education level, AI experience
3. Pre-test (/pretest)
   └── Form A: 10 MCQ questions on Photosynthesis
4. AI Tutor Session (/session)
   └── 8 conversational turns with 1-7 trust ratings on every reply
5. Post-test (/posttest)
   └── Form B: 10 parallel MCQ questions
6. Trust Questionnaire (/trust)
   └── 6-item validated AI trust scale (Likert 1-7, reverse scoring on item 6)
7. Cognitive Load Questionnaire (/cogload)
   └── NASA-TLX subset (Mental Demand, Effort, Frustration, Performance [reverse-scored]) + Paas item
8. Debrief & Completion (/debrief → /complete)
   └── Deception disclosure, correction of planted errors, unique completion code
```

- **Resilience:** Mid-study page refreshes resume at the exact current stage.
- **One-way progression:** Once a stage/test is submitted, backward navigation is blocked by server-side guards and Next.js middleware.

---

## Admin Portal & Data Export

Visit [`/admin`](http://localhost:3000/admin) and log in with your `ADMIN_PASSWORD`.

### Features:
- **Participant Counts & Means:** View started/completed counts, pre-test mean, post-test mean, learning gain mean, trust score mean, cognitive load mean, and trust calibration gap (`mean(correct) - mean(planted)`) broken down per condition.
- **Toggle Incomplete:** By default, only completed participants are included; toggle to view all started sessions.
- **CSV Data Exports:**
  1. `participants.csv`: One row per participant with condition, pre/post scores, learning gain, trust score, load score, calibration gap, background survey fields, and per-stage durations in seconds.
  2. `messages.csv`: One row per conversational message with turn index, role (`student` / `ai`), content, timestamp, `is_planted_error` flag, and `trust_rating`.
  3. `items.csv`: Flat item-level responses covering both tests (`Form A` / `Form B` item responses and correctness) and questionnaires (`trust` / `load` item values).
- **MCQ Item Pairing View:** Visit [`/admin/test-items`](http://localhost:3000/admin/test-items) to inspect parallel Form A and Form B items side-by-side.

---

## Definition of Done Verification Summary

| Requirement | Status | Evidence / Implementation |
|---|---|---|
| Complete 8 stages across 3 conditions | **PASS** | State machine routes (`/consent` → `/complete`) with automated stage transitions and condition assignment. |
| Balanced condition assignment | **PASS** | Block randomization in `lib/session.ts` assigns the condition with the minimum participant count (blocks of 3). |
| Data in DB and CSV export | **PASS** | `participants`, `test_responses`, `test_scores`, `messages`, `questionnaires`, `scores`, `stage_times` tables with `/api/admin/export/*` routes. |
| No API key or answer keys in client | **PASS** | `LLM_API_KEY` and `ADMIN_PASSWORD` are server-only. Answer keys are strictly in server routes (`/api/test/submit`). |
| Mid-study refresh resumes stage | **PASS** | `middleware.ts` + `lib/session.ts` track participant session and redirect to canonical stage URL. |
| Debrief lists planted errors | **PASS** | Debrief displays all 3 planted errors from `lib/plantedErrors.ts` with original statement vs correct fact. |
