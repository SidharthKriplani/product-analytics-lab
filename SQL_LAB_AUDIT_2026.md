# SQL Lab — Deep Audit 2026
*Written: 2026-06-20 | Based on full code read, DataLemur research, beta feedback, checkValues analysis*

This is an honest assessment of where SQL Lab stands, what's broken, what DataLemur does better, and what to build next. Not a feature roadmap — a diagnostic with a proposed fix plan.

---

## The one-line verdict

The content is good. The validation is broken. The UX gives no feedback on failure. Together, these make the lab feel unreliable even when the problems themselves are well-crafted.

---

## 1. What's actually broken — Validation

### 1A. The race condition (SYSTEMIC)

**Root cause:** `expectedSample` — the computed correct output used for primary validation — is stored in React state via `setExpectedSample()`. React state updates are asynchronous. `dbRef.current` (the in-browser SQL database) is set synchronously. If a user runs their query before the React state propagates, `validateResults()` receives `expectedSample = null`, falls through to the `checkValues` fallback, and produces an unreliable verdict.

**How often this happens in practice:** Any time the user types a query quickly after loading a problem. SQL.js initialization takes 200-500ms. The DB is ready (dbRef.current is set). The expectedSample is not yet in state. The run button is already active. The window for a race is real.

**The fix is one line:** Replace `const [expectedSample, setExpectedSample] = useState(null)` with a ref:
```js
const expectedSampleRef = useRef(null);
```
Set it synchronously in `initDb()` right next to `dbRef.current = database`. Pass `expectedSampleRef.current` into `validateResults()`. No race, no fallback.

### 1B. checkValues fallback quality

When `expectedSample` is null (race condition), validation falls to `checkValues`. Here's the distribution across all 166 problems:

| Strength | Count | Problem |
|---|---|---|
| Empty `[]` | 4 | Will pass **any result at all** — anything the user returns is "Correct" |
| 1 key-value | 39 | Too loose — only checks one field in one row |
| 2 key-values | 57 | Borderline — may pass wrong answers |
| 3+ key-values | 66 | Reasonable — hard to accidentally satisfy |

**The 4 empty checkValues problems:**
- Easy: Transactions at Non-US Merchants
- Medium: Running Spend Per User
- Medium: Above-Average Enterprise Accounts
- Medium: First Transaction Benchmark

These 4 problems will pass *any non-empty query result* when the race condition hits. The user gets a green checkmark for garbage SQL.

The 1-key examples are also dangerous:
- `[{ source: 'referral' }]` — passes if any row has source='referral', regardless of all other values
- `[{ company_name: 'India Foods' }]` — passes if that company name appears anywhere
- `[{ dispute_id: '3' }]` — passes if dispute_id 3 is in results

**The fix:** Eliminate the fallback entirely by fixing the race condition. If `expectedSampleRef.current` is always set synchronously, `checkValues` is only ever used as a belt-and-suspenders check, not as the primary validator. Secondary fix: audit and strengthen all 43 weak checkValues for correctness even if they're never hit.

### 1C. No failure diagnosis

When validation fails, the user sees:
> "Output does not match — check row count or column names and values. Column aliases must match the expected schema exactly..."

This is marginally better than before (added the alias hint this session), but it's still generic. The user doesn't know:
- Whether their row count is wrong ("You returned 3 rows, expected 1")
- Whether a specific value is wrong ("Your no_show_rate is 0.0, expected 40.0 — integer division bug")
- Whether a column is named wrong ("Column 'rate' not found — expected 'no_show_rate'")

DataLemur shows nothing either (they just say "Wrong Answer") — but DataLemur also shows example input and expected output inline, so the user can visually diff their output against the target.

PAL already has `expectedSample` computed. The data is there. It's just not shown in the failure state.

---

## 2. What DataLemur does better

After reading their format, these are the 4 things that actually explain why it feels trustworthy:

### 2A. Example input + expected output shown inline

Every DataLemur problem shows a small example dataset (3-5 rows) and the exact expected output for that dataset, inline in the problem statement — before the user runs anything. The user knows exactly what format to target.

PAL shows the `expectedSample` (full expected output) in a header above the results table — but only after the DB loads, and only if the user has already tried running something. This is too late. Move it earlier.

### 2B. "Run" vs "Submit" separation

DataLemur has two buttons: **Run Code** (test on the shown example data) and **Submit** (validate against the real hidden dataset). This matters because:
- Users can test partial queries without triggering a fail/pass verdict
- It removes anxiety from intermediate runs
- It mirrors how real SQL environments work (dev environment vs production)

PAL has one "Run Query" button that both executes and validates. Every run is a verdict run. This creates friction when users want to debug.

### 2C. Discussion tab with community solutions

Every DataLemur problem has a Discussion tab where users post their SQL solutions. This does three things: (1) creates trust — other practitioners have verified the problem, (2) teaches multiple valid approaches, (3) builds retention through community.

PAL has zero community layer. The debrief covers alternative approaches in text, but it's authored content, not community-sourced.

### 2D. Clean, focused problem UI

DataLemur's problem page is: title, problem statement, table schema, example input, example output. That's it. No clutter.

PAL's problem UI is good but the schema accordion + expected output + hint section + timer + progress bar compete visually with the problem statement itself. On a new problem, the user's attention is split.

---

## 3. Where PAL is actually better

These are real advantages. The task is to make them visible, not to hide them by having broken validation steal focus.

### 3A. Forensic batch — unique in the market

No other SQL practice platform has a "find the bug in someone else's query" problem type. DataLemur doesn't have it. StrataScratch doesn't have it. LeetCode doesn't have it.

PAL has 25 Forensic problems. The premise: the query runs without error and returns a result, but the result is wrong. Find why. This is exactly what senior analysts do daily — audit someone else's SQL before it goes into a dashboard.

This is the sharpest differentiation PAL has in SQL Lab and it's currently not positioned as such. It should be the flagship PAL-only feature.

### 3B. Debrief quality

PAL's debriefs cover: what the correct answer is, the most common wrong approach (and why it looks right), alternative SQL, sanity checks, and interviewer follow-up questions. This is substantially deeper than DataLemur's solution explanations, which show correct SQL with minimal commentary.

The problem is the format — it's a long raw text block. DataLemur's solutions are formatted with headers and code blocks. PAL's debriefs need structural parsing, not content improvement.

### 3C. Stakeholder business framing

PAL prompts are written as business requests ("Revenue ops wants to track expansion revenue. Identify any account that has ever upgraded..."). DataLemur prompts are more clinical ("Given a table of posts, find the number of days between...").

The stakeholder framing is better interview preparation — real interviewers give you a business context, not a data schema and a pure SQL task. This is the right call and should be preserved.

### 3D. 12 industry datamarts

DataLemur uses real company schemas (Facebook posts, Twitter tweets, etc.). PAL uses 12 synthetic but realistic industry datamarts. The advantage: PAL can create more problems per domain without schema fatigue, and can build India-specific company problems that DataLemur won't ever write.

---

## 4. Content assessment

The content quality after 11 batches of auditing is actually good. The problems have been rewritten, reclassified, and debugged. The weaknesses that remain are structural, not about individual problem quality.

**What's still weak content-wise:**

**No judgment layer in the problem statement.** PAL's stated differentiation is "judgment not recall." But SQL Lab problems all end with "Return X, Y, Z ordered by Z" — a pure SQL task. The judgment is in the debrief, not in the problem. DataLemur is the same. But PAL could go further: add one judgment prompt before the SQL task. Example:

> *Before writing: "total_appts" — what does that denominator include? Scheduled appointments only, or also cancellations and no-shows? State your assumption, then write the query.*

This turns a SQL exercise into an analyst judgment exercise. The SQL is the same. The interviewer signal is completely different.

**Forensic batch is underexplored.** 25 problems is a good start but the pattern is underutilised. Types that exist:
- Integer division (ROUND(4/10, 1) = 0)
- Wrong JOIN type returns wrong count
- Wrong ORDER BY direction

Types that should exist but don't:
- NULL exclusion bug (JOIN silently drops nulls)
- Window function frame specification (SUM OVER without ORDER BY = full partition sum, not running total)
- Metric denominator bug (counting scheduled vs. completed appointments)
- GROUP BY missing a column (aggregation on wrong granularity)

**No India company problems.** DataLemur has zero. This is a blue ocean. 10 problems with Swiggy, Zepto, Flipkart, PhonePe schemas, framed as actual interview scenarios, would be the only India-specific SQL practice in the market.

---

## 5. Proposed fix plan

### Priority 1 — Fix validation (1-2 days, must ship before any amplification)

**P1a: expectedSample ref (eliminates race condition)**

In `SqlLabPage.jsx`:
```js
// Change:
const [expectedSample, setExpectedSample] = useState(null);
// To:
const expectedSampleRef = useRef(null);
const [expectedSampleDisplay, setExpectedSampleDisplay] = useState(null); // for UI only
```

In `initDb()`:
```js
expectedSampleRef.current = sample; // sync — no race
setExpectedSampleDisplay(sample);   // async — for rendering only
dbRef.current = database;
```

In `runQuery()`:
```js
const isCorrect = validateResults(resultData, problem, expectedSampleRef.current);
```

In `validateResults()`: use `expectedSampleRef.current` which is always set when the DB is ready.

The `checkValues` fallback stays in the code as a last resort but will realistically never be hit.

**P1b: Fix the 4 empty checkValues**

Running Spend Per User, Above-Average Enterprise Accounts, First Transaction Benchmark, Transactions at Non-US Merchants — add proper checkValues so even if the fallback is needed, it doesn't pass anything.

**P1c: Failure diagnostic in the UI**

When `validateResults` returns false, compute a specific reason and display it:
```
Row count wrong → "Got 3 rows, expected 1"
Column missing  → "Column 'rate' not found — expected 'no_show_rate'"
Value mismatch  → "Your no_show_rate shows 0.0, expected 40.0 — check integer division"
```

The data for all three checks is already available in `validateResults`. It's a matter of returning a reason string instead of just `false`.

### Priority 2 — Show expected output before first run (half a day)

The `expectedSampleDisplay` (from the fix above) should be visible in the problem panel — not just in the results area after a run. Show it as "Expected output" in a small collapsible section below the prompt, visible on problem load. Users know what to target before writing a single line.

This is the DataLemur "Example Output" feature. PAL's expected output is computed from the real dataset (not a toy example), which is actually better.

### Priority 3 — "Test run" vs "Check answer" (half a day)

Split the "Run Query" button into two:
- **Run** — executes the SQL, shows results, no validation. Free to press any time.
- **Check** — executes + validates. Triggers the pass/fail verdict.

This removes anxiety from intermediate debugging runs. Users can check partial queries without polluting their pass/fail history.

### Priority 4 — Debrief formatting (1 day)

The debrief content is already good. Parse it into scannable sections:

```
📋 What you're solving
⚠️ Common wrong answer — and why it looks right
🔀 Alternative approaches
✅ Sanity check
🎯 Interviewer follow-up
```

Currently the debrief is rendered as raw text. Add a simple parser that splits on `**Before writing:**`, `**Wrong answer:**`, `**Sanity check:**`, `**Alternative:**` markers that already exist in the debrief text — and renders each as a distinct collapsible section.

### Priority 5 — Forensic batch as flagship feature (1-2 weeks of content)

Rename and reposition the Forensic batch. Current label is buried. New positioning:

**"Debug the Analyst's Query"** — A PAL-exclusive problem type. No other platform has it. 

Write 15 additional Forensic problems covering the missing trap types:
- NULL exclusion silent bug (JOIN drops null merchant_id rows — looks like right count)
- Window frame bug (SUM OVER without ORDER BY = total sum on every row, not running total)
- Metric denominator mismatch (total appointments vs. completed appointments)
- Missing GROUP BY column (wrong granularity — correct SQL, wrong result)
- Off-by-one date range (BETWEEN inclusive on both ends in some SQL dialects)

These are the bugs senior analysts actually fix. This is the LinkedIn hook: "I built 40 SQL problems where the query is syntactically correct but returns the wrong answer. Can you find the bug?" No one else in the market is doing this.

### Priority 6 — Judgment layer in problem statements (ongoing)

Add one judgment prompt before the SQL task on all Hard and Master problems. Format:
> *Before writing: [one ambiguity or assumption to state]*

This adds zero code complexity — it's just a new optional field in the problem data schema. The user sees it, states their assumption in the hint/notes area, then writes the SQL. The debrief reveals whether their assumption was the intended one.

---

## 6. What NOT to build

- **AI grading of free-text answers in SQL Lab** — not now. The judgment prompt above is enough. AI grading is a V3 feature.
- **Community discussion tab** — not now. Requires auth, moderation, real user base. Revisit at 500 paying users.
- **Multiple SQL dialect support (PostgreSQL, MySQL)** — PAL uses SQLite (sql.js, in-browser). Supporting multiple dialects would require a backend. Not worth the infrastructure cost yet.
- **More datamarts** — 12 is enough. Problem quality per datamart matters more than datamart count now.
- **More problems** — 166 problems is more than enough. Fix the ones that exist before adding new ones.

---

## 7. What confidence in SQL Lab actually looks like

PAL's SQL Lab should be something Avinash can say: *"I used this to prep for SQL screens, and every problem I practiced showed up in real interviews in some form."*

That requires:
1. **Reliable validation** — if it says Correct, it means Correct. No race condition.
2. **Clear failure feedback** — when wrong, you know exactly why and can fix it.
3. **Problem realism** — the problems match what real interviewers ask. The stakeholder framing already does this.
4. **Debrief you actually read** — formatted, scannable, actionable.
5. **A unique angle nobody else has** — the Forensic batch. Positioned correctly.

Right now: 1 is broken, 2 is missing, 3 is good, 4 is unformatted, 5 exists but is invisible. Fix 1 and 2 first — they are both one-day fixes that change the trust signal entirely.

---

## 8. Implementation order

| Priority | Fix | Effort | Impact |
|---|---|---|---|
| P0 | expectedSample ref (race condition) | 2 hrs | Eliminates false positives permanently |
| P0 | Fix 4 empty checkValues | 30 min | Closes "pass anything" hole |
| P1 | Failure diagnostic UI | 4 hrs | Users know exactly why they failed |
| P1 | Show expected output before first run | 2 hrs | Reduces cold-start confusion |
| P2 | Run vs Check button split | 3 hrs | Removes validation anxiety |
| P2 | Debrief section parser + formatting | 1 day | Makes best content actually readable |
| P3 | 15 new Forensic problems | 1-2 weeks | Builds PAL's flagship differentiator |
| P3 | Judgment prompt field in Hard/Master | 3 hrs code + content time | Adds judgment layer to SQL |
| P4 | India company problems (Swiggy/Zepto/Flipkart) | 2-3 weeks content | Blue ocean content |

---

## 9. The LinkedIn angle SQL Lab unlocks

Once validation is reliable and the Forensic batch is positioned:

**Hook post:** "I found 25 ways to write SQL that runs without error and returns the wrong number. Here's one." → thread walks through one forensic problem → links to Forensic batch in PAL.

**Repeat as series:** Each Forensic problem is a LinkedIn post. 25 problems = 25 posts. Each is a genuine analytical trap that practicing PAs and DAs will recognize and share.

This is the SQL Lab content strategy that Dataford's certificate flywheel can't compete with — because their content is generic, and these traps are specific.
