# SQL CONTENT STANDARD — the frozen bar for the 182-problem rewrite

_Created 2026-06-23. This is the **frozen** content-quality standard for the SQL Lab rewrite. Locked before any rewriting so quality cannot drift between problem #1 and #182. Mechanical correctness is governed by `EVAL_RUBRICS.md` (Tier 1) — this doc governs whether a problem is **pedagogically good**, the layer the mechanical gate cannot see. A problem ships only when it passes both._

> Why this is separate: the existing LLM judge rated 181/182 prompts "clear (3/3)" — including `sql-e86`, which named the technique *and* was ambiguous to a learner. "Clear to a strong solver" ≠ "good problem." This standard encodes what the judge is blind to.

---

## The checklist (binary — every item must pass)

Scored pass/fail, not graded. Three are **hard gates**: fail one and the problem goes to rewrite regardless of the rest.

**Prompt**
1. **Stakeholder framing** — reads as a real work request (who you are · what happened · what they need · what to return), not "write a query that…".
2. **(GATE) Technique not named** — the prompt never names the SQL function or pattern (no "PERCENT_RANK", "window function", "self-join", "CTE"). The method must be derived from the business question. *Column names the checker requires (e.g. `pct_rank`) are allowed — that's an output spec, not the technique.*
3. **Metric motivated** — the business goal makes the requested output the obvious thing to compute.
4. **(GATE) Unambiguous** — exactly one defensible reading. Output grain, row ordering, tie handling, and filters are all pinned. The window/ranking key cannot be confused with the row-order key.
5. **No filler** — no redundant restatement ("Write a SQL query to…").

**Hints / starterCode**
6. **Scaffold, not solution** — hints nudge toward the approach; starterCode stops short of the answer. Hints/starterCode also obey gate #2 (no naming the technique outright).

**Debrief**
7. **(GATE) Teaches judgment, not the answer** — must contain: the **wrong-answer-that-runs** (a plausible query that executes but is wrong), how to **catch it** (a sanity check), and an **interviewer follow-up**. Restating the solution fails this gate.
8. **Data claims are correct** — every number/row-count/value the debrief asserts is verified against actual query output (Phase 1 verifier).

**Whole problem**
9. **Difficulty honest** — the label matches the judgment/fluency actually demanded.
10. **Scenario realism** — company, datamart, and numbers cohere; a practitioner recognizes it. Real company names are clearly illustrative, not implying real proprietary data.

**Bank-level (checked in Phase 7, not per-problem)**
11. **No template monotony** — prompts don't all collapse into an identical 4-part cadence; voice varies.
12. **No trap repetition** — the same lesson/trap isn't taught redundantly across many problems.

**Forensic problems** use a separate checklist (see below); items 2 and 4 do not apply (the bug *is* the point).

---

## Immutability rules (what the rewrite may NOT touch)

- `solution`, `checkValues`, `expectedColumns`, `expectedRowCount`, `datamartId`, datamarts — **immutable for style**. A rewrite changes prompt/hints/debrief only.
- **Exception:** if a verified *correctness* bug is found (wrong solution, wrong checkValue), it is fixed and re-verified through the mechanical gate — never left, never changed silently.
- A prompt may not change the output shape (column names, grain) unless solution + checkValues are re-verified together in the same change.
- Problems already passing the bar are **left untouched** — touching good content is pure downside risk.

---

## Forensic checklist (36 problems)

1. The bug is **subtle** — the broken query runs and returns plausible-looking output (not a syntax error, not obviously empty unless `brokenQueryReturnsZeroRows`).
2. The bug is **instructive** — it maps to a real mistake an analyst makes (missing status filter, COUNT(*) vs COUNT(DISTINCT), INNER vs LEFT, etc.).
3. The `brokenOutputNote` / debrief explains **why it's wrong, how to catch it, and the correct fix** — verified by executing both queries.
4. The broken query references the same primary tables as the solution.

---

## Gold exemplars (the reference every rewrite copies)

One per tier — locked here so authoring has a concrete target.

| Tier | Problem | Status |
|---|---|---|
| Easy | `sql-e01` Re-engagement Targets | **Gold** — derives the anti-join, debrief has wrong-answer + sanity check |
| Medium | `sql-e86` Level Engagement Percentile | **Gold** — rewritten 2026-06-23 to this bar |
| Hard | `sql-sw05` Top Restaurants by Delivered Revenue | **Gold** — wrong-answer (omit status filter) reshuffles the leaderboard, verified via run_sql; sanity + follow-up |
| Master | `sql-master27` Signup Cohort Retention Curve | **Gold** — multi-CTE narrative; debrief has wrong-answer + catch + follow-up |
| Forensic | `sql-sw06` Swiggy COUNT vs SUM | **Gold** — broken query runs and returns a plausible wrong number; brokenOutputNote explains catch + fix |

_All five locked 2026-06-23 after the full-bank rewrite. Every non-Easy debrief now carries a wrong-answer-that-runs authored from executed data._

---

## Definition of done (the stop rule)

The rewrite is complete — and not revisited — when:
- mechanical Tier-1: **0 failures** on all 182, AND
- content checklist: **0 gate failures** on all 182 (scanner + verifier green), AND
- bank-level checks (11–12) pass, AND
- a ~15-problem human sample read confirms taste/flow, AND
- a baseline→after scorecard is produced.

No further polishing passes once green. Subjective dimensions are advisory (judge flags, never gates); the human sample read is the final arbiter on taste.

_This file is frozen for the duration of the rewrite. Changing the bar mid-run is the thing it exists to prevent._
