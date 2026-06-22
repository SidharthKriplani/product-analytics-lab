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

## Other components — rubrics pending

The following components ship content and need rubrics. Add them here as they're authored.

| Component | File(s) | Priority | Notes |
|---|---|---|---|
| RCA Cases | `src/data/rcaCases.js` | High | 26 cases; need solution accuracy + debrief quality checks |
| Business Cases | `src/data/businessCases.js` | High | checkValues-style verification not in place |
| Metrics Cases | `src/data/metricCases.js` | Medium | Answer keys are free-text; rubric is qualitative |
| Stats Foundations | `src/data/statsFoundationsModules.js` | Medium | MCQ answer keys, explanation quality |
| Exp Foundations | `src/data/expFoundationModules.js` | Medium | Same as Stats |
| Design Scenarios | `src/data/designScenarios.js` | Low | Judgment-heavy; automated checks limited |
| Playbook Cases | `src/pages/PlaybookBrowser.jsx` | Low | Framework-based; less automatable |

---

*This file is owned by the engineering+content quality process. Update when rubric criteria change, new components ship, or the pre-commit script evolves.*
