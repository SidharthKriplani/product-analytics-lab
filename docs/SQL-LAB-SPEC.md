# SQL LAB — Full Specification

_Created 2026-06-24. Last updated 2026-06-25. The master spec for PAL's SQL Lab: what it is, how it works, its data model, formats, scaffolding ramp, beginner level, quality system, and how to extend it. Written so someone could understand — or re-implement — SQL Lab end to end._

**This doc is also the portable blueprint for PyLab (in the Programming Lab).** SQL Lab and PyLab are the shared **Layer-3 "Code" tooling** of BreakLabs (any single lab subscription unlocks both — see HQ/DECISIONS D-25). The intent is that PyLab mirrors SQL Lab's structure feature-for-feature, swapping the SQL engine for Python. §13 maps every SQL Lab piece to its Python equivalent._

---

## 1. What it is

SQL Lab is an in-browser SQL practice environment inside Product Analytics Lab. The user reads a business-framed prompt, writes SQL against a realistic multi-table schema, **runs it live** (real **Postgres** in the browser via `@electric-sql/pglite` — migrated off SQLite/sql.js in V7.0.0; no backend), and **checks** their result against the expected output. Every problem ends in a **debrief** that teaches a wrong-answer-that-runs, a sanity check, and an interviewer follow-up.

**Thesis:** practice *judgment*, not recall. The bank doesn't just grade whether your SELECT returns the right rows — its debriefs teach the queries that *run and return a plausible wrong answer*, which is what separates someone who can pass an autograder from someone who can be trusted with production data. This thesis shows up in three places: the standard problem debriefs, the dedicated **Forensic** (find-the-bug) format, and the **Judgment layer** (multi-method + scenario-dial + MCQ).

## 2. By the numbers (as of V5.x, 2026-06-24)

- **192 problems** — Easy 43 · Medium 62 · Hard 32 · Master 19 · Forensic 36.
- **3 formats** — Standard (~141, `format` absent/`'query'`), **Forensic** (36, `format: 'forensic'`), and the **Judgment layer** authored on 106 problems (additive, any tier).
- **13 datamarts** — ecomm, saas, fintech, consumer, health, gaming, logistics, marketplace, food_delivery, social_network, edtech, hr_analytics, swiggy. "Wider not longer": many schemas so users can't memorize one table layout.
- **18/18 benchmark categories covered** (see `SQL-COVERAGE-REPORT.md`).
- **Plus a separate beginner level** — ~18 sequential, isolated SQLBolt-style lessons on a simple movies datamart (§9B).
- **Plus tier-based scaffolding** — the schema breadth + how spelled-out the ask is fade as you climb tiers; schema capped at 4 tables (§9A).

## 2A. The difficulty gradient — the full ramp (Beginner → Master), and where Forensic sits

The ramp is the spine of the lab. **A learner must be able to start at zero and climb one rung at a time to Master, never hitting a step that needs a technique they haven't met.** Every cliff in that climb is a calibration bug (e.g. a rate problem mis-filed as Easy — see the V5.99 recalibration). Auditing the lab = walking the ramp rung by rung and checking each step adds *exactly one* new thing.

There are **two axes**, and conflating them is the classic mistake:

- **The construction ramp (the climb): Beginner → Easy → Medium → Hard → Master.** Increasing *constructive* difficulty — how much SQL you must build and how much you must decompose. **Master requires solving** (peak construction).
- **The comprehension layer: Forensic.** Orthogonal — **not** the top of the climb. **Forensic requires understanding**: read a query that runs but returns a plausible wrong answer, diagnose it, fix it. It is tiered by how subtle the *bug* is, and it spans the whole range. It's a different muscle (read/diagnose) from the construction ramp (build), and it's the lab's signature — the wrong-answer-that-runs is exactly what autograders never test.

### The construction ramp, rung by rung

**0 · Beginner Level (pre-ramp — learn the syntax).** SQLBolt-style sequential walkthroughs on the simple movies datamart (§9B). This is *learn*; everything after is *practice*. Exit competency: can write `SELECT / WHERE / ORDER BY` and a basic `GROUP BY`. The next rung must start exactly here — no cliff between "I just learned SQL" and the first real problem. **This hand-off is where beginners bounce if it's wrong.**

**1 · Easy on-ramp (the bridge — guided, ordered).** The first ~15–18 Easy problems, **hand-ordered one concept at a time**: single-table `SELECT` → `WHERE` → `ORDER BY`/`LIMIT` → `DISTINCT` → one aggregate (`COUNT`/`SUM`/`AVG`) → `GROUP BY` → basic `HAVING` → first 2-table `INNER JOIN` → join + `GROUP BY`. The scaffolding fades across 3 batches (§9A: bullets + only-needed-tables → all tables → none). Presented *in that order* with visible step progress, so the climb feels short and finishable. **Insertion order is not a gradient** — this sequence must be authored, not `filter(Easy).slice(0,15)`.

**2 · Easy (consolidation).** The rest of Easy: the same skills across *many* schemas ("wider not longer") to build recognition and fluency, no new machinery. Calibration rule: anything requiring a window, anti-join, self-join, 3+ join, correlated subquery, or a rate/ratio construction does **not** belong here — that's Medium.

**3 · Medium (one lever at a time).** Each Medium = an Easy foundation + **exactly one** non-trivial technique: a single window function, OR an anti-join, OR a self-join, OR a 3+ table join, OR a correlated/scalar subquery, OR conditional aggregation, OR a rate/ratio with safe division, OR a 1–2 CTE pipeline. The learner meets each lever in isolation before combining. The consistency rule (`SQL-DIFFICULTY-RUBRIC.md`) keeps the same pattern at the same tier.

**4 · Hard (compose / advance).** The jump is from "one lever" to **combining** levers or using an advanced one: explicit window frames (`ROWS/RANGE BETWEEN`), 2+ windows, gaps-and-islands, sessionization, a recursive CTE, a 3+ CTE pipeline. The skill is now *structuring* a multi-step query, not just knowing a technique.

**5 · Master (decompose a narrative).** Large multi-CTE analytics narratives: dedup → window → metric chains, retention *curves*, multi-signal scoring engines. Requires real query decomposition and business judgment to even structure. The peak of constructive difficulty — **Master requires solving.**

**Forensic (the understanding axis, alongside — not above Master).** A query that runs and returns a plausible wrong answer; the learner finds and fixes the bug. Tier it by how subtle the bug is, not by query construction. It complements the climb rather than topping it — **Forensic requires understanding.**

### Two more axes layered on the climb (not difficulty rungs)

- **Scaffolding fade** (§9A) — *how much help*, decreasing across the on-ramp. Independent of difficulty.
- **Judgment layer** (§5, methods/dial/mcqs) — on Medium+, "which correct approach is best, when" — choosing among right answers. The tradeoff muscle, layered on top of construction.

**The promise, stated once:** Beginner Level (learn) → Easy on-ramp (bridge) → Easy consolidation → Medium (one lever each) → Hard (combine) → Master (decompose), with Forensic running alongside as the catch-the-bug muscle. One rung, one new thing. Hold that and nobody bounces.

## 3. Architecture

- **React + Vite SPA**, hash-routed (`#/sql-lab/<id>`), deployed on Vercel. No server: the SQL engine runs in the browser.
- **SQL engine: `@electric-sql/pglite`** (real Postgres compiled to WASM, in-browser; V7.0.0 — was `sql.js`/SQLite). On opening a problem, the page builds an in-memory Postgres DB from the problem's datamart (CREATE TABLE + multi-row INSERT from the seed rows), holds it in a ref (`dbRef`), and runs the user's query against it. Async (`await db.exec/query`); `pgLit`/`pgResult` helpers in `SqlLabPage.jsx` map row literals + the `{rows,fields}` result shape. **Verify with `scripts/pg_verify_harness.mjs`** (runs every solution/method/brokenQuery against real Postgres) — this supersedes the old SQLite `scripts/audit_sql_lab.py` for SQL correctness. The **Beginner level + Full Loop also run pglite** (V7.0 final — sql.js fully removed across all 3 SQL runtimes).
- **Lazy-loaded route.** `SqlLabPage.jsx` is `React.lazy()`-imported, so SQL Lab's bundle (including CodeMirror) loads only on first visit and doesn't weigh down initial load.
- **No external data calls** for solving — everything (schema, seed rows, expected answers) ships in the JS bundle.

## 4. Data model

### 4.1 Problem (`src/data/sqlLabProblems.js`)

One array of objects. Core fields on every problem:

| Field | Purpose |
|---|---|
| `id` | unique slug, e.g. `sql-e01`, `sql-m13`, `sql-h02`, `sql-master27`, `sql-f04`, `sql-sw05` |
| `title` | short human title |
| `company`, `companyDomain` | framing company + domain (domain → favicon) |
| `difficulty` | `Easy` \| `Medium` \| `Hard` \| `Master` \| `Forensic` (see `SQL-DIFFICULTY-RUBRIC.md`) |
| `isFree` | gating flag (beta: gate is effectively open) |
| `tags`, `roles`, `priority`, `estimatedMin` | metadata / filters |
| `datamartId` | which datamart this problem runs against |
| `prompt` | the stakeholder-framed question (never names the SQL technique — see `SQL-CONTENT-STANDARD.md`) |
| `expectedColumns` | exact output column names + order |
| `expectedRowCount` | exact row count of the correct answer |
| `hintSteps` | progressive hints `[{ text, starterCode? }]` — scaffold, not solution |
| `hints` | legacy/short hint strings |
| `checkValues` | array of row objects (subset of expectedColumns) verified positionally against the solution's output |
| `solution` | the canonical correct query (the source of truth for the expected result) |
| `debrief` | the teaching payoff: wrong-answer-that-runs + sanity check + interviewer follow-up |
| `sqliteNote` | engine caveat, usually null |

**Format-specific fields:**
- **Forensic** adds `brokenQuery` (a query that runs and returns a plausible wrong answer) and `brokenOutputNote` (why it's wrong + how to catch + fix).
- **Judgment layer** adds `methods[]` (each with runnable SQL + detection signature + tradeoff + `isTrap`), `dial` (scenario→best-method decision table), `mcqs[]`, and `canonicalMethodId` — see `JUDGMENT-LAYER-SPIKE.md`. Authored on 106 problems (Hard/Master/Medium; Easy & Forensic excluded).

### 4.2 Datamart (`src/data/sqlLabDatamarts.js`)

`datamarts` is an object keyed by id. Each datamart = `{ id, tables: { <tableName>: { schema: 'CREATE TABLE …', columns: [{ name, type }], rows: [[…], …] } } }`. The `columns[].name` list also feeds the editor's autocomplete schema.

**Syntax rules (build-breaking if violated):** single quotes only; apostrophes escaped as `\'`; no backticks/template literals (Vite/Rolldown throws). Verified by the apostrophe/brace pre-commit checks.

## 5. The three formats

1. **Standard** — write the query the prompt asks for. Checked against expected output. Debrief teaches the wrong-answer-that-runs.
2. **Forensic** (`format: 'forensic'`) — the prompt shows a query that *runs but returns the wrong answer*; the user writes the corrected query. Tests the judgment skill no autograder platform tests. 36 problems.
3. **Judgment layer** (additive) — for a problem with several correct approaches, `methods[]` holds each (window vs correlated vs self-join vs aggregate), `dial` says which is best under which conditions (data size, index, engine, ties), and `mcqs[]` quiz the tradeoffs. Surfaced via a `JudgmentLayer` component in the runner.

## 6. Runtime: Check & Submit

Two actions (V6.0.0 — was Run/Check):
- **Build DB:** on open, `build` the datamart into an in-memory **pglite (Postgres)** database (schema + seed rows), stored in `dbRef`.
- **Check** (`▶`, Cmd/Ctrl+Enter): executes the query and shows the result table. **No verdict, nothing recorded, never marks solved.** This is the free "see what my query does" action.
- **Submit** (click only): runs the query AND validates — row count == `expectedRowCount`, columns == `expectedColumns`, every `checkValues` row matches (pglite-faithful stringification; numerics come back as strings, Date→ISO — `validateResults` uses `parseFloat` 0.01-tolerance). Correct → marks **solved** (green) + a success animation. **Every Submit is recorded to the Submissions history**, pass or fail. Solved = green = a correct Submit; Checking never marks solved.
- The expected answer is computed from the problem's `solution`, so checkValues and the solution are kept in lockstep by the mechanical gate.

## 7. The editor (CodeMirror 6)

`src/components/shared/SqlEditor.jsx` (behind `USE_CM_EDITOR` flag; plain-textarea fallback retained). Features: SQL syntax highlighting; **indentation keeper**; **schema-aware autocomplete, names-only** (the current problem's tables/columns, automatic on typing — cuts typos without writing the query); Tab/Shift-Tab indent; Cmd/Ctrl+/ comment; Cmd/Ctrl+Enter = Check. Browser Ctrl/Cmd+F is preserved (CodeMirror search keymap disabled). Keymaps use `Prec.highest` to beat defaults; extensions are memoized per-problem (stable `schema`/`onCheck` refs) to avoid per-keystroke reconfiguration. Full rationale: `CODEMIRROR-SWAP-SPEC.md`.

## 8. The quality system (what keeps the bank good)

Two automated gates run before any SQL Lab commit, plus frozen standards:

- **Mechanical gate — `scripts/pg_verify_harness.mjs`** (supersedes the old SQLite `audit_sql_lab.py` as of V7.0): every solution + method + brokenQuery runs against real Postgres (pglite); row counts / columns / checkValues verified.
- **Content gate — `scripts/sql_content_scan.mjs`**: deterministic checks the mechanical gate can't see — prompt must not name the technique, no filler, hints must scaffold (not hand the answer), debrief must teach a wrong-answer-that-runs. Exit 1 on any GATE failure. The bar is frozen in `SQL-CONTENT-STANDARD.md`.
- **Authoring helper — `scripts/run_sql.py`**: runs any solution or candidate wrong-query against the real datamart, so debriefs are authored from *executed* output and every wrong-answer is verified to run and diverge.
- **Difficulty** is governed by `SQL-DIFFICULTY-RUBRIC.md` (tier = MAX(mechanical, conceptual); single window = Medium; frames/multi-window/gaps/recursion/3+ CTE = Hard; multi-CTE narrative = Master; same pattern ⇒ same tier).

The bank currently passes both gates with **0 failures**.

## 9. Progress, routing, sharing

- **Deep links:** `#/sql-lab/<id>` opens that problem (the hash resolves after auth settles; the runner jumps to the problem when the id arrives — V5.50 fix).
- **Progress:** per-problem solve state in localStorage; `Progress.jsx` rolls SQL Lab into the readiness score + heatmap.
- **Filters:** difficulty chips, company filter (incl. `alsoAskedAt`), status, search.
- **Share** button produces a deep link to the current problem.

## 9A. Tier-based scaffolding (the fade)

_Replaces the old within-Easy "3-batch training wheels" (retired V6.x — the fade now happens across **tiers**, not across the first 15 Easy)._

The scaffolding fades as you climb the construction ramp (§2A). Two dimensions fade:

| Tier | Schema shown | Requirements (the deliverable) | Derived-column hints (e.g. "high-risk = `risk_tier`") |
|---|---|---|---|
| **Easy** | only the tables the solution uses (`tablesForProblem` → `solutionTables`) | **spelled out** — numbered "For each matching row, your result should return:" (`deriveRequirements`), force-shown | **given** (Phase-2 authored) |
| **Medium** | needed + a couple of distractors, **capped at 4 total** | withheld (you infer them) | **not given** — raw columns provided, you derive |
| **Hard / Master** | needed + distractors, capped at 4 | withheld | none |

**STANDING RULE (cognitive-load cap):** the schema panel never shows **more than 4 tables total, including distractors, unless the solution genuinely needs more.** Enforced by `tablesForProblem(problem, dm)` (Easy → exactly the needed tables; Medium+ → needed + distractors up to 4; never fewer than the solution requires).

Mechanics (`SqlLabPage.jsx`): `isEasy` gates the requirements block + the force-open schema; `tablesForProblem` picks the displayed tables by tier under the 4-cap; `deriveRequirements` builds the spelled-out returns from `expectedColumns` / `expectedRowCount` / the order phrase parsed from `prompt`. **The bullets-as-separate-lines was a deliberate fix** — a single comma-list ("Output 3 columns: a, b, c") is the exact line beginners misread.

**Phase 2 (authoring, in progress):** a per-problem structured `returns` (each column + optional qualifier + a derivation hint) and a scenario/return split, so the Easy statement reads as one merged instruction with the derivation handed over — and withheld at Medium+. Until authored, the render falls back to `deriveRequirements`.

## 9B. The beginner level (sequential, isolated)

A separate, **SQLBolt-style** on-ramp for people who don't know SQL yet — distinct from the judgment-first main bank.

- **Sequential + isolated:** ~18 lessons done in order; when the beginner level is on, the main bank's levels aren't shown (no choice paralysis). Gentle entry; a learner can self-rate as a beginner or unlock from a short diagnostic.
- **Single simple datamart (movies):** one easy-to-hold schema so attention is on the SQL concept, not the schema. Lessons ramp one concept at a time (SELECT → WHERE → ORDER BY → aggregates → GROUP BY → joins …), single-table first, gradually widening.
- **Same live engine** (pglite / Postgres) and run/check loop as the main lab.
- **Files:** `src/pages/SqlLabBeginnerPage.jsx` (the sequential runner + gating/isolation/entry) and `src/data/sqlBeginnerLessons.js` (the lesson content). The movies tables live in `sqlLabDatamarts.js`.

## 10. File map

```
src/data/sqlLabProblems.js          — the 192 problems (the bank)
src/data/sqlLabDatamarts.js         — 13 datamarts + the beginner movies datamart (schemas + seed rows)
src/data/sqlBeginnerLessons.js      — the ~18 sequential beginner lessons
src/pages/SqlLabPage.jsx            — the page: browser list + runner + DB build + run/check + Easy-tier ramp (§9A)
src/pages/SqlLabBeginnerPage.jsx    — the beginner level: sequential runner + gating/isolation/entry (§9B)
src/components/shared/SqlEditor.jsx — CodeMirror editor wrapper
public/sql-wasm.wasm                — OBSOLETE (old SQLite WASM; removed in V7.0, Trash manually)
scripts/audit_sql_lab.py            — mechanical gate (Tier-1)
scripts/sql_content_scan.mjs        — content gate (exits non-zero on GATE fail)
scripts/run_sql.py                  — author/verify helper (run any query on a datamart)
scripts/apply_patch.mjs             — bulk content patch integrator
```

## 11. How to add a problem (checklist)

1. Pick/extend a datamart in `sqlLabDatamarts.js` (single quotes, escaped apostrophes, no backticks).
2. Add the problem to `sqlLabProblems.js` with all required fields; write the `prompt` as a stakeholder ask that does **not** name the technique.
3. Author the `debrief` from executed data: `python3 scripts/run_sql.py --problem <id>` for the real output; `--diverge <id> "<wrongSQL>"` to confirm your wrong-answer runs and diverges.
4. Set `difficulty` per `SQL-DIFFICULTY-RUBRIC.md`.
5. Run both gates clean: `python3 scripts/audit_sql_lab.py` (0 T1) and `node scripts/sql_content_scan.mjs` (exit 0).
6. (Optional) add the Judgment layer (`methods`/`dial`/`mcqs`) per `JUDGMENT-LAYER-SPIKE.md`; verify with `scripts/verify_methods.py`.

## 12. Related docs (the deep dives)

| Doc | What it covers |
|---|---|
| `SQL-CONTENT-STANDARD.md` | the frozen content-quality bar (prompts, debriefs, hints) + gold exemplars |
| `EVAL_RUBRICS.md` | mechanical Tier-1/Tier-2 checks + the pre-commit gate scripts |
| `SQL-DIFFICULTY-RUBRIC.md` | how a problem's tier is decided (mechanical × conceptual + consistency rule) |
| `SQL-VARIETY-BENCHMARK.md` | the 18-category bar derived from DataLemur/StrataScratch/LeetCode/etc. |
| `SQL-COVERAGE-REPORT.md` | the bank audited against that benchmark (18/18 covered) |
| `JUDGMENT-LAYER-SPIKE.md` | the multi-method/dial/MCQ schema + worked instance |
| `CODEMIRROR-SWAP-SPEC.md` | the editor: CodeMirror 6, schema autocomplete, keymaps |
| `CONTENT_QUALITY_BAR.md` | the original 8-dimension scenario-quality standard (parent of the SQL content bar) |
| `SQL_LAB_PLAN.md` | build history: problem-count decisions, difficulty rubric origins, session log |

_This spec is the entry point; the table above is the rest of the map._

---

## 13. Cloning to PyLab — the portable blueprint

PyLab (in the Programming Lab) should be the same machine with Python swapped in for SQL. The thesis, the run/check loop, the debrief, the formats, the scaffolding ramp, the beginner level, and the two-gate quality system all port directly. What changes is the **engine** and the **answer-comparison**.

**What maps to what:**

| SQL Lab | PyLab equivalent |
|---|---|
| `sql.js` (SQLite WASM) in the browser | **Pyodide** (CPython WASM) in the browser — PL already runs it |
| Datamart = `CREATE TABLE` + seed rows | **Fixtures** — seed DataFrames / input objects defined per problem (or a shared module imported into the cell) |
| `solution` = canonical SQL | `solution` = canonical Python (the source of truth for expected output) |
| Check = row count + `expectedColumns` + `checkValues` positional match | Check = compare the function's **return value / printed output / resulting DataFrame** to the solution's, with type-aware equality (DataFrame equals, set/df tolerance, float epsilon) |
| **Forensic** = a query that runs but returns a plausible wrong answer; user fixes it | **Forensic** = Python that runs but is subtly wrong (off-by-one, mutation-in-loop, `SettingWithCopy`, wrong axis, dtype coercion) — PL's "Trap Museum" is exactly this |
| **Judgment layer** = `methods[]` / `dial` / `mcqs` (window vs correlated vs self-join…) | **Methods** = vectorized vs apply vs loop vs comprehension; `dial` = which under what data size / readability / memory; **PL already built this** (method dial + traps + follow-up chains) |
| **Easy-tier scaffolding ramp** (§9A): bullets fade, schema (=tables) fades | Same ramp: bullets fade; the **fixtures/columns shown** fade relevant→all→all. Derive "relevant inputs" from the solution the same way `solutionTables` does. |
| **Beginner level** (§9B): sequential movies datamart, single-table → wider | Sequential beginner Python track: one tiny fixture, one concept per lesson (variables → lists → dict → comprehension → pandas Series → DataFrame …) |
| CodeMirror SQL editor (schema-only autocomplete) | CodeMirror **Python** mode (symbol-only autocomplete from the fixture names) |
| Mechanical gate `audit_sql_lab.py` (every solution runs, output matches) | Run every `solution` under Pyodide/CPython in CI; assert it executes and the checker passes; assert each Forensic/trap actually runs + diverges |
| Content gate `sql_content_scan.mjs` (no technique-naming, no filler, hints scaffold, debrief teaches a wrong-answer-that-runs) | Same deterministic content gate over Python prompts/debriefs |
| `SQL-DIFFICULTY-RUBRIC.md` (tier = MAX(mechanical, conceptual)) | A parallel Python difficulty rubric (e.g. one transform = Easy; groupby+merge = Medium; multi-step pipeline / time-series / custom agg = Hard) |
| Data-file syntax rules (single quotes, escape `\'`, no backticks) | Same JS-data-file rules apply to the Python **problem metadata** files (the Python source itself lives in normal strings) |

**What ports unchanged:** the thesis (practice judgment, not recall — teach the wrong-answer-that-runs), the run-vs-check split, the executed-from-real-output debrief discipline, the "wider not longer" fixture philosophy (many small fixtures so users can't memorize one), deep-link routing, progress/heatmap rollup, and the two-gate "0 failures before commit" bar.

**Build order for PyLab to match SQL Lab:** (1) engine + run/check loop on one fixture; (2) the problem schema + a handful of Standard problems gated by both gates; (3) Forensic/trap format; (4) the judgment layer (PL has this); (5) the Easy-tier ramp; (6) the beginner level. Then it is "the same way."
