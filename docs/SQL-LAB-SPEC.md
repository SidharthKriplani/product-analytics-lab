# SQL LAB — Full Specification

_Created 2026-06-24. Last updated 2026-06-25. The master spec for PAL's SQL Lab: what it is, how it works, its data model, formats, scaffolding ramp, beginner level, quality system, and how to extend it. Written so someone could understand — or re-implement — SQL Lab end to end._

**This doc is also the portable blueprint for PyLab (in the Programming Lab).** SQL Lab and PyLab are the shared **Layer-3 "Code" tooling** of BreakLabs (any single lab subscription unlocks both — see HQ/DECISIONS D-25). The intent is that PyLab mirrors SQL Lab's structure feature-for-feature, swapping the SQL engine for Python. §13 maps every SQL Lab piece to its Python equivalent._

---

## 1. What it is

SQL Lab is an in-browser SQL practice environment inside Product Analytics Lab. The user reads a business-framed prompt, writes SQL against a realistic multi-table schema, **runs it live** (real SQLite in the browser, no backend), and **checks** their result against the expected output. Every problem ends in a **debrief** that teaches a wrong-answer-that-runs, a sanity check, and an interviewer follow-up.

**Thesis:** practice *judgment*, not recall. The bank doesn't just grade whether your SELECT returns the right rows — its debriefs teach the queries that *run and return a plausible wrong answer*, which is what separates someone who can pass an autograder from someone who can be trusted with production data. This thesis shows up in three places: the standard problem debriefs, the dedicated **Forensic** (find-the-bug) format, and the **Judgment layer** (multi-method + scenario-dial + MCQ).

## 2. By the numbers (as of V5.x, 2026-06-24)

- **192 problems** — Easy 43 · Medium 62 · Hard 32 · Master 19 · Forensic 36.
- **3 formats** — Standard (~141, `format` absent/`'query'`), **Forensic** (36, `format: 'forensic'`), and the **Judgment layer** authored on 106 problems (additive, any tier).
- **13 datamarts** — ecomm, saas, fintech, consumer, health, gaming, logistics, marketplace, food_delivery, social_network, edtech, hr_analytics, swiggy. "Wider not longer": many schemas so users can't memorize one table layout.
- **18/18 benchmark categories covered** (see `SQL-COVERAGE-REPORT.md`).
- **Plus a separate beginner level** — ~18 sequential, isolated SQLBolt-style lessons on a simple movies datamart (§9B).
- **Plus an Easy-tier scaffolding ramp** — the first 15 Easy problems fade their training wheels over 3 batches (§9A).

## 3. Architecture

- **React + Vite SPA**, hash-routed (`#/sql-lab/<id>`), deployed on Vercel. No server: the SQL engine runs in the browser.
- **SQL engine: `sql.js`** (SQLite compiled to WASM). The WASM binary is served from `public/sql-wasm.wasm`. On opening a problem, the page builds an in-memory SQLite DB from the problem's datamart (CREATE TABLE + INSERT from the seed rows), holds it in a ref, and runs the user's query against it.
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

## 6. Runtime: run & check

- **Build DB:** on open, `build` the datamart into an in-memory `sql.js` Database (schema + seed rows), stored in `dbRef`.
- **Run** (`▶`): executes the user's query, shows the result table. No verdict.
- **Check** (`✓`, Cmd/Ctrl+Enter): runs the user's query AND validates: row count == `expectedRowCount`, columns == `expectedColumns`, and every `checkValues` row matches the corresponding output row. Numbers are compared with a sql.js-faithful stringification (whole-number REALs serialize as integers — the `.0` trap).
- The expected answer is computed from the problem's `solution`, so checkValues and the solution are kept in lockstep by the mechanical gate.

## 7. The editor (CodeMirror 6)

`src/components/shared/SqlEditor.jsx` (behind `USE_CM_EDITOR` flag; plain-textarea fallback retained). Features: SQL syntax highlighting; **indentation keeper**; **schema-aware autocomplete, names-only** (the current problem's tables/columns, automatic on typing — cuts typos without writing the query); Tab/Shift-Tab indent; Cmd/Ctrl+/ comment; Cmd/Ctrl+Enter = Check. Browser Ctrl/Cmd+F is preserved (CodeMirror search keymap disabled). Keymaps use `Prec.highest` to beat defaults; extensions are memoized per-problem (stable `schema`/`onCheck` refs) to avoid per-keystroke reconfiguration. Full rationale: `CODEMIRROR-SWAP-SPEC.md`.

## 8. The quality system (what keeps the bank good)

Two automated gates run before any SQL Lab commit, plus frozen standards:

- **Mechanical gate — `scripts/audit_sql_lab.py`** (Tier-1 in `EVAL_RUBRICS.md`): every solution + brokenQuery runs in SQLite; row counts / columns / checkValues / determinism / schema integrity verified. Exit 1 blocks commit.
- **Content gate — `scripts/sql_content_scan.mjs`**: deterministic checks the mechanical gate can't see — prompt must not name the technique, no filler, hints must scaffold (not hand the answer), debrief must teach a wrong-answer-that-runs. Exit 1 on any GATE failure. The bar is frozen in `SQL-CONTENT-STANDARD.md`.
- **Authoring helper — `scripts/run_sql.py`**: runs any solution or candidate wrong-query against the real datamart, so debriefs are authored from *executed* output and every wrong-answer is verified to run and diverge.
- **Difficulty** is governed by `SQL-DIFFICULTY-RUBRIC.md` (tier = MAX(mechanical, conceptual); single window = Medium; frames/multi-window/gaps/recursion/3+ CTE = Hard; multi-CTE narrative = Master; same pattern ⇒ same tier).

The bank currently passes both gates with **0 failures**.

## 9. Progress, routing, sharing

- **Deep links:** `#/sql-lab/<id>` opens that problem (the hash resolves after auth settles; the runner jumps to the problem when the id arrives — V5.50 fix).
- **Progress:** per-problem solve state in localStorage; `Progress.jsx` rolls SQL Lab into the readiness score + heatmap.
- **Filters:** difficulty chips, company filter (incl. `alsoAskedAt`), status, search.
- **Share** button produces a deep link to the current problem.

## 9A. The Easy-tier scaffolding ramp (training wheels)

The first **15 Easy problems** (by `difficulty === 'Easy'`, in source order — NOT by id prefix) fade their scaffolding over **3 batches of 5**. The thing that fades is **how much schema help** you're handed; the deliverable bullets ride along through batches 1 and 2. All of it is **pure presentation, derived at render time** — nothing is stored on the problem.

| Batch | Problems | Bullets (deliverable) | Schema shown |
|---|---|---|---|
| **1/3 — Full scaffolding** | Easy #1–5 | ✅ one bullet per output column ("For each matching row, return: …") + order + row count | **Only the tables the solution uses** |
| **2/3 — Find the tables** | Easy #6–10 | ✅ same bullets | **All tables** (learner figures out which are needed) |
| **3/3 — On your own** | Easy #11–15 | ❌ none | All tables, normal collapsible accordion — identical to the other ~180 problems |

Mechanics (`SqlLabPage.jsx`): `easyRampStage(problem)` returns 1/2/3/0; `deriveRequirements(problem)` builds the bullets from `expectedColumns` / `expectedRowCount` / the sort phrase parsed out of `prompt`; `solutionTables(problem, dm)` derives batch-1's relevant tables by whole-word-matching each datamart table name against the problem's stored `solution` SQL (so it stays correct even if a solution changes — no per-problem table list to maintain). A small "Training wheels N/3" marker signals the rung. **The bullets-as-separate-lines was a deliberate fix** — a single comma-list ("Output 3 columns: a, b, c") is the exact line beginners misread.

## 9B. The beginner level (sequential, isolated)

A separate, **SQLBolt-style** on-ramp for people who don't know SQL yet — distinct from the judgment-first main bank.

- **Sequential + isolated:** ~18 lessons done in order; when the beginner level is on, the main bank's levels aren't shown (no choice paralysis). Gentle entry; a learner can self-rate as a beginner or unlock from a short diagnostic.
- **Single simple datamart (movies):** one easy-to-hold schema so attention is on the SQL concept, not the schema. Lessons ramp one concept at a time (SELECT → WHERE → ORDER BY → aggregates → GROUP BY → joins …), single-table first, gradually widening.
- **Same live engine** (sql.js) and run/check loop as the main lab.
- **Files:** `src/pages/SqlLabBeginnerPage.jsx` (the sequential runner + gating/isolation/entry) and `src/data/sqlBeginnerLessons.js` (the lesson content). The movies tables live in `sqlLabDatamarts.js`.

## 10. File map

```
src/data/sqlLabProblems.js          — the 192 problems (the bank)
src/data/sqlLabDatamarts.js         — 13 datamarts + the beginner movies datamart (schemas + seed rows)
src/data/sqlBeginnerLessons.js      — the ~18 sequential beginner lessons
src/pages/SqlLabPage.jsx            — the page: browser list + runner + DB build + run/check + Easy-tier ramp (§9A)
src/pages/SqlLabBeginnerPage.jsx    — the beginner level: sequential runner + gating/isolation/entry (§9B)
src/components/shared/SqlEditor.jsx — CodeMirror editor wrapper
public/sql-wasm.wasm                — the SQLite WASM engine
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
