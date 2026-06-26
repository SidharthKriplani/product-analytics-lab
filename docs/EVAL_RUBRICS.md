# EVAL_RUBRICS.md — PAL Component Quality Rubrics

Each component that ships content (problems, cases, modules) gets a rubric here. Rubrics define what "production-ready" means for that component, expressed as automated checks (Tier 1 = block commit, Tier 2 = warn) and manual review criteria.

The goal: no content ships without passing Tier 1. Tier 2 failures get logged in AUDITS.md and triaged.

---

## SQL Lab

**Component:** `src/pages/SqlLabPage.jsx` · `src/data/sqlLabProblems.js` · `src/data/sqlLabDatamarts.js`
**Last reviewed:** 2026-06-20 (V5.41.0)

### Tier 1 — Block commit if any fail

#### Schema integrity
1. All required fields present on every problem: `id`, `title`, `company`, `companyDomain`, `format`, `difficulty`, `isFree`, `tags`, `roles`, `priority`, `estimatedMin`, `datamartId`, `prompt`, `expectedColumns`, `expectedRowCount`, `hints`, `checkValues`, `solution`, `debrief`, `sqliteNote`
2. Forensic problems additionally require: `brokenQuery`, `brokenOutputNote`
3. No duplicate problem IDs
4. No duplicate problem titles
5. `datamartId` references a key that exists in the `datamarts` export (referential integrity — orphaned reference causes silent runtime failure)
6. `difficulty` matches `format`: Forensic problems must have `difficulty: 'Forensic'`; all other formats must not

#### SQL execution — solution
7. Solution runs without error in SQLite (sql.js compatible)
8. Solution returns non-zero rows
9. Actual solution row count == `expectedRowCount` (exact, not approximate)
10. Actual solution column names == `expectedColumns` (exact match, same order)
11. ALL `checkValues` rows verified against actual solution output — not just row[0] and row[1]; every entry in the array must match
12. `checkValues` key names are a strict subset of `expectedColumns` (key/column mismatch causes silent check failure)
13. No `.0` suffix on whole-number `checkValues` values — sql.js returns whole-number REAL as JS integers; `String(280) = '280'`, not `'280.0'`
14. Solution does not contain `DROP`, `DELETE`, `UPDATE`, or `INSERT`
15. All tables referenced in solution exist in the specified datamart's `tables` object

#### SQL execution — Forensic-specific
16. `brokenQuery` runs without error in SQLite (it must execute; the bug is wrong output, not a syntax error)
17. `brokenQuery` returns non-zero rows (a query that returns 0 rows is a different and less instructive failure mode). **Exception:** set `brokenQueryReturnsZeroRows: true` on the problem to explicitly mark zero-row bugs as intentional (e.g. `= NULL` vs `IS NULL` scenarios where returning 0 rows IS the bug). The audit script skips T1-17 and T1-18 for these problems.
18. `brokenQuery` output differs from solution output (if they match, the scenario is invalid). Skipped when `brokenQueryReturnsZeroRows: true`.
19. `brokenQuery` references the same primary tables as the solution (cross-table forensic scenarios are valid; completely unrelated tables are not)

#### Determinism
20. If `checkValues` depend on row ordering (i.e., the problem checks a specific first or second row), the solution must contain an `ORDER BY` clause. Solutions without `ORDER BY` on multi-row results are non-deterministic across SQLite versions.

#### strftime safety
21. Any solution using `strftime('%s', col)` must reference a column whose values are TEXT timestamps in ISO 8601 format (`YYYY-MM-DD HH:MM:SS`). Mismatched formats cause strftime to return NULL silently, producing wrong-but-non-erroring output.

#### Prompt solvability (added 2026-06-25 — the "m41 class")
22. **Solvable from the prompt alone.** A solver reading ONLY the `prompt` (not the solution or debrief) must be able to derive the EXACT expected output. Every parameter the solution depends on must be stated in the prompt: numeric thresholds / bands / bucket cutoffs (e.g. small/medium/large $ boundaries), definitions of vague terms ("high-value", "active", "recent", "churned", "power user", "underperforming"), top-N / ranking N, date or time windows, rounding precision, and any tie-break that changes which rows return. If a constant or rule lives only in the solution, it is a **BLOCKER** — the problem is unsolvable as written (the solver can only reverse-engineer the parameter from the expected output, i.e. guess), and it must not ship. Also covers prompt↔grader mismatch: `expectedColumns` (names/order) must match what the prompt asks the solver to return. **Heuristic flag** (partial automation): any prompt naming a band/tier/segment/bucket/"high|low|top|recent|active" whose concrete cutoff does not appear in the prompt text. **Final check is the Tier-3 blind solve-through** (below). This class was missed across ≥11 problems before it was added here — origin was bulk authoring/porting that polished prose without re-verifying derivability.

---

### Tier 2 — Warn, triage in AUDITS.md

#### Content quality
- `hints` array has ≥ 2 entries
- No duplicate hint strings within a single problem's `hints` array
- `debrief` length > 200 chars
- `debrief` contains at least one `**Section:**` marker if debrief length > 300 chars (absence means DEBRIEF_BLOCKS doesn't fire; content renders as a wall of text)
- `checkValues` has ≥ 1 entry
- `beforeWriting` present on Hard and Master problems (recommended, not required)
- `estimatedMin` is calibrated: Medium = 8–18 min, Hard = 15–28 min, Forensic = 10–20 min; flag outliers

#### Coverage
- At least 1 problem per company with `isFree: true` (non-paying users need a taste)
- `tags` values are from the controlled vocabulary (see below); typos create dead filter tags

#### Floating point risk
- Any `checkValues` entry derived from `AVG(...)` should be verified for float round-trip safety: `String(actual_float) === checkValue`. AVGs producing > 2 decimal places are risk candidates. Flag and verify manually.

#### Uniqueness
- No two problems share an identical `solution` string (signal of duplicate content)

---

### Tags controlled vocabulary (SQL Lab)

```
joins, aggregation, window-functions, subquery, cte, filtering,
date-functions, string-functions, null-handling, case-when,
group-by, having, order-by, distinct, exists, forensic,
performance, data-quality, ranking, running-total, date-spine,
recursive-cte, percent-rank, rows-between
```

Any tag not in this list should be flagged in Tier 2 review.

---

### Pre-commit scripts (BUILT — run both clean before any SQL Lab commit)

**1. Mechanical gate — `scripts/audit_sql_lab.py`** (Tier 1 + Tier 2 above)
- Extracts problems + datamarts via node, runs every solution and brokenQuery through Python `sqlite3` (with a sql.js numeric-format mimic), checks row counts / columns / checkValues / determinism.
- Exit 1 on any Tier 1 failure (block commit); Tier 2 warnings to stdout.

**2. Content-quality gate (layer 2) — `scripts/sql_content_scan.mjs`** (added 2026-06-23)
- Deterministic checks the mechanical gate is blind to (the `e86` class). Blocking GATEs: prompt names the technique (GATE2), filler sentence (GATE5), hint hands the solution on the first/only step (GATE6), debrief lacks the wrong-answer-that-runs + catch (GATE7). Non-blocking: missing interviewer follow-up, thin debrief.
- Exit 1 if any GATE flag remains. `--csv` emits the per-problem ledger (`scripts/sql_content_scan.csv`).
- Forensic problems are exempt from GATE2/GATE6 (the bug/query is the point).

**3. Authoring/verification helper — `scripts/run_sql.py`**
- Runs any solution or candidate wrong-query against a datamart (`--problem`, `--diverge`). Used to author debriefs from REAL output and confirm each cited wrong-answer actually runs and diverges. Not a gate, but the reason debrief data-claims are trustworthy.

**Content-quality bar:** see `docs/SQL-CONTENT-STANDARD.md` (frozen standard + gold exemplars). As of 2026-06-23 the full 182-problem bank passes both gates with 0 failures.

---

## Universal room rubric — the backbone

Every room rubric specializes this skeleton. A room is production-ready when it clears Tier 1 (auto, blocks commit), has no open Tier 2 (auto, warns), and passes the manual review checklist. Dimensions:

1. **Schema integrity** (auto/T1) — required fields on every item; unique ids; referential integrity to any datamart/asset it points at.
2. **Build safety** (auto/T1) — data files: single quotes, apostrophes escaped `\'`, no backticks; file parses.
3. **Correctness** (auto where the answer executes, else manual) — the keyed answer is actually right.
4. **Prompt/stimulus quality** (T2/manual) — clear, realistic, does not leak the answer or name the technique.
5. **Answer + debrief quality** (T2/manual) — explains *why*, names the tempting wrong path, ends with an interviewer-style follow-up.
6. **Difficulty calibration** (T2/manual) — the label matches the difficulty rubric for that room.
7. **Scaffolding** (T2) — hints/steps are progressive and never hand over the answer on step one.
8. **Coverage** (T2) — the bank spans the room's topic space; no duplicate or near-duplicate items.
9. **Interactivity & UX** (manual/auto) — interactive widgets work, are load-bearing not decorative, respect reduced-motion, survive mobile widths.

The split that matters: **a room is only as auto-gradable as its answers are executable.** SQL Lab is the gold case — solutions run, so Tier 1 is deep and trustworthy. Teaching modules and judgment cases can't be "executed," so their Tier 1 is necessarily thin (schema + build-safety + answer-key validity) and the real quality lives in a disciplined manual checklist. Don't pretend a qualitative room is auto-verified when it isn't.

### Tier 3 — human review (every room; the semantic gate)

The automated gates catch broken or malformed content. They are blind to the failures that actually sink a prep product: an item that is boring, pointless, ambiguous, or that tests recall while pretending to test judgment. That pass is human. The protocol — designed to be runnable by one person, not a team:

1. **Blind solve-through.** Solve a sample cold, answer hidden. If you can't tell what's being asked, or the "judgment" has one obvious answer, it fails. **And — the "solvable from the prompt alone" rule —** if you *can* tell what's being asked but cannot derive the EXACT expected output because a threshold, window, top-N, definition, or tie-break lives only in the answer, it fails. You should never have to reverse-engineer a parameter from the expected output.
2. **Three questions per item:** (a) Would this actually come up in a real interview or on the job? (b) Does it test judgment, not recall/lookup? (c) Is it interesting — worth a strong candidate's time? Any "no" → fix or cut.
3. **Red-team the answer.** Try to defend the most tempting *wrong* answer. If you can defend it, the item is ambiguous or the key isn't clearly right.
4. **Sample, don't boil the ocean.** You cannot re-read the whole bank each release. Review: every newly added item, a random N per room per cycle, and — once usage exists — every item with low completion or a high give-up rate. Let the data point your human attention.
5. **Cut ruthlessly.** Boring-but-correct still fails. The machines pass it; you should not.
6. Log outcomes as Tier 3 entries in AUDITS.md.

This is the gate that makes the difference between "rigorously built" and "actually good." It does not automate, and trying to fake it with a script produces false confidence.

---

## Foundation rooms (Stat / RCA / Metrics / Exp Foundations)

**Component:** `src/data/statsFoundationsModules.js`, `rcaFoundationModules.js`, `metricsFoundationModules.js`, `expFoundationModules.js` · runners in `src/components/*Foundations/`
**Nature:** interactive teaching modules (concept → intuition → interactive widget → check). ~65 modules total.
**Reality:** correctness here is a factual/statistical *claim*, not an executable result — so most substance is manual review. Automate schema, build-safety, and any MCQ answer-key; do not fake the rest.

### Tier 1 — block commit (automatable)
1. Required fields on every module: `id`, `title`, an `order`/position, `estimatedMin`, and the room's content field(s) (sections/blocks). Confirm exact field names against the actual schema when building the audit.
2. Unique module `id`s within a room; `order` is contiguous (no gaps/dupes) so progression renders correctly.
3. Build-safe: single quotes, apostrophes escaped, no backticks in data files; file parses in the build.
4. Every interactive component/widget a module references actually exists and is exported — an orphaned reference renders as a blank/broken module at runtime.
5. Any in-module MCQ/check: the correct-answer key is one of the offered options, and a non-empty `explanation` is present.
6. Any progress/`localStorage` key the room writes is registered in `syncProgress.js` `PROGRESS_KEYS` — else completion won't sync or count toward the leaderboard.

### Tier 2 — warn, triage in AUDITS.md
- Every module ends with a **check for understanding** (MCQ, prediction, or interactive task) — a module that only renders prose is a slide, not practice.
- The module has at least one **interactive element**, and it is load-bearing (teaches the concept), not decorative.
- `estimatedMin` calibrated (Foundations module = 4–10 min); flag outliers.
- Progression: a module introduces ≤ 2 new concepts and never depends on a concept first defined in a *later* module.
- A worked numeric example is present for any quantitative concept.
- Animations use the `.pal-*` utility classes (reduced-motion covered); no ad-hoc keyframes in module files.

### Manual review — the substance (cannot be automated)
- **Factual + statistical correctness** of every claim, formula, threshold, and worked example. This is the gate that matters and needs a second qualified reader. A p-value module that misstates what a p-value is fails outright regardless of polish.
- **Pedagogy:** concept → intuition → example → check, in that order; intuition before formalism; one idea per module.
- **No undefined jargon:** every term is defined at first use within the room's arc.
- **The interactive earns its place:** manipulating it changes understanding, not just pixels.
- **Scope:** stays within product-analytics stats / experimentation / metrics / RCA — no ML-systems or data-engineering drift (CLAUDE.md scope rule).

### Automation (BUILT)
**1. Deterministic gate — `scripts/audit_foundations.mjs`** (run: `node scripts/audit_foundations.mjs`). Imports all four module arrays via node; asserts Tier 1 (required fields, unique ids, contiguous `index` 1..n, `difficulty` ∈ {Beginner, Intermediate, Advanced}, typed `estimatedMin`/`isFree`/`tags`, and that each room's progress key is registered in `syncProgress.js`); warns on Tier 2 (thin `keyInsight`/`connection`, est-time outside 4–12, < 2 tags, missing `playbookLinks`). Exit 1 on any Tier 1. As of V5.71.0: **0 Tier 1, 8 Tier 2** (sf06 thin connection; ef01–ef07 missing playbookLinks). Note: the check-for-understanding lives in the runners, not the data, so it isn't gated here.

**2. Local-LLM Tier-3 triage — `scripts/triage_foundations.py`** (run: `python3 scripts/triage_foundations.py --room all`). Sends each module to your **LM Studio** model (zero cloud tokens), over-flags suspects (recall-not-judgment, no-intuition, no-example, jargon, weak-connection, factual-doubt, boring) → ranked `foundations_triage.csv` shortlist. It is a recall-biased net, not a judge: "review" means look; "ok" is not a clearance. Correctness/quality adjudication stays human.

---

## Room archetypes — rubrics for every remaining room

Rather than 15 near-duplicate rubrics, every room maps to one of four rubric *shapes*, set by how its answer is graded. A room inherits its archetype's Tier 1/2 + the universal Tier 3, plus the room-specific delta in the map below.

- **A — Executable answer.** The answer is code that runs; output checked exactly. Deepest auto-gate. **SQL Lab** (and Dimensional Modeling, partially) — see the SQL Lab rubric above.
- **B — Discrete keyed answer.** One correct choice/verdict/flaw. The gate validates the key; quality is in the distractors and the "why."
- **C — Rubric-scored judgment.** Open response graded against model criteria — no single right string. Gate is schema + presence-of-model-answer only; substance is the manual checklist.
- **D — Teaching module.** Foundations — see the Foundation rooms rubric above.

### Archetype B — discrete keyed answer
*(Stats Room verdicts, Spot the Flaw, A/B Interpreter, MCQ Trainer, the call in Experiment Review)*

**Tier 1 (block):** schema + build-safety (universal); the `correct` key is exactly one offered option (or a valid verdict from the room's fixed set); a non-empty explanation exists for the correct answer and for why the most tempting distractor is wrong; no duplicate or non-mutually-exclusive options.

**Tier 2 (warn):** ≥ 3 options (guess rate < 33%); correct answer isn't reliably the longest/most-hedged option (length+position bias); distractors represent real mistakes, not throwaways; difficulty calibrated.

**Tier 3 (manual):** is *exactly one* option actually correct — red-team the best distractor; judgment vs lookup; explanation teaches the reasoning, not just asserts.

**Automation (BUILT):** `scripts/audit_keyed.mjs` (deterministic, MCQ + Spot-the-Flaw: key validity, exactly-one-correct, dup ids/options, explanation present, length-bias tell) and `scripts/triage_keyed.py` (local LLM *consistency check* — verifies the keyed answer holds, distractors aren't secretly correct, the flaw is real & primary, the fix works). Unlike Foundations, this is a verification task, so the local 14B is fit for purpose here. First run (V5.73.0) caught a Tier-1 dup-id bug in Spot-the-Flaw (STF13–17 pasted twice → fixed, 22→17) and flagged 29/40 MCQ items with a length-bias tell (correct answer is the longest option — gameable).

### Archetype C — rubric-scored judgment
*(Metrics, Experiment Design, RCA, Cases/Business, Product Design, Prioritization, Estimation, Instrumentation, Growth Analytics, BI, Take-Home, Full Loop, Behavioral, Challenges)*

**Tier 1 (block):** schema + build-safety (universal); a **model answer / scoring rubric is present for every item** (an item with nothing to grade against is ungradeable and must not ship); any phases/steps the runner renders exist on the item; `difficulty` present and from the allowed set.

**Tier 2 (warn):** the model answer names the key moves a strong response makes AND the common weak approaches (so the debrief can contrast); prompt gives enough to answer without leaking it; has an interviewer-style follow-up; scope calibrated to `estimatedMin`.

**Tier 3 (manual) — where these rooms live or die:** is the model answer actually what a strong PA/PM would say (not a framework dump)? Is there real ambiguity to navigate, or one obvious answer (recall in disguise)? Would it come up for real? Is it interesting — cut boring-but-correct. Scope check.

### Room → archetype map

| Room | Archetype | Room-specific delta |
|---|---|---|
| SQL Lab | A | full executable gate (above) |
| Dimensional Modeling | A/C | valid model auto-checkable; design quality manual |
| Stats Room | B | fixed verdict set (valid / directionally reasonable / not supported / inconclusive); verdict must match the data |
| Spot the Flaw | B | keyed flaw must be THE primary flaw, not a nitpick; the "looks correct" surface must be genuinely plausible |
| A/B Interpreter | B | ship/iterate/stop keyed to the readout; guardrail conflicts must be real |
| Experiment Review | B + C | the call (B) + the reasoning rubric (C) |
| MCQ Trainer | B | ≥ 4 options; one concept per question; no trick wording |
| Metrics Room | C | model answer = primary + diagnostics + guardrails for the context |
| Experiment Design | C | model covers metric, unit, guardrails, trust checks |
| RCA Room / RCA Cases | C | model diagnosis path + the dead-ends; the movement has a real root cause in the data |
| Cases / Business Cases | C | exec-ask → recommendation chain; the numbers reconcile |
| Product Design | C | per-phase rubric; every submitted phase has model criteria |
| Prioritization | C | a defensible ranking + the tradeoff that decides it |
| Estimation | C | a sensible band + the assumptions that drive it; no single "right" number |
| Instrumentation | C | correct event schema / the tracking bug is real and findable |
| Growth Analytics | C | cohort/funnel reasoning; model reads the curve correctly |
| BI & Reporting | C | the insight + recommended action, not chart description |
| Take-Home / Full Loop | C | multi-step; each step has its own model answer; steps chain |
| Behavioral | C | STAR-style rating criteria, not a "correct" story |
| Challenges | C | multi-room; inherits each constituent room's rubric per step |
| Playbook / Deep Dives | D-like | reference content, not graded; review for correctness + currency only |

Tools without their own content (Defense Strategy, Company Tracks, Interview Simulator) inherit the rubric of whatever they aggregate — no separate content gate.

**Status:** every room is now mapped to a rubric. Automation built for A (SQL Lab) only; B and C have auto-able Tier 1 (answer-key validity, model-answer presence) worth scripting next, but their value is gated by Tier 3 human review.

---

*This file is owned by the engineering+content quality process. Update when rubric criteria change, new components ship, or the pre-commit script evolves.*
