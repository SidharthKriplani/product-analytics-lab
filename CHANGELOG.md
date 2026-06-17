# Product Analytics Lab — Changelog

Full build lineage. Covers what changed, why, what was added, what was fixed, and which files were touched in each release. Intended to make the project understandable to any future contributor, collaborator, or reviewer without needing to read the git log.

---

## [5.34.4] — 2026-06-18 [MISSING FILE FIX]

### PythonLabBrowser.jsx added to git

File existed on disk from V5.33.0 but was never committed due to repeated git mmap failures on the iCloud-synced repo path. Vercel build failed with "Module not found" on `./pages/PythonLabBrowser.jsx`. Committed via fresh clone from GitHub to /tmp to bypass filesystem mmap restriction.

Also: `pal-code-progress-v1` added to `onResetAllProgress` in App.jsx (was missing — Python Lab progress would not clear on full reset). `#/python-lab` and `#/dimensional-modeling` added to sitemap.xml.

**Files changed:** `src/pages/PythonLabBrowser.jsx` (added), `src/App.jsx`, `public/sitemap.xml`

---

## [5.34.3] — 2026-06-18 [BUILD FIX + PYTHON LAB SIDEBAR + STF DOUBLE-COMMA]

### codeModules.js build fix, STF double-comma, Python Lab wired in sidebar

Root cause of all Vercel build failures since V5.33.0: unescaped `'` in `modelAnswer` field of code32 module in `src/data/codeModules.js` (line 1330). `print(f\'\\n=== Validation Report ===')` — the closing `'` before `)` terminated the JS string. Fixed to `===\')`.

**STF double-comma fix:** `src/data/spotTheFlawCases.js` line 414 had `},,` (two commas after object close), creating a sparse undefined slot. `Progress.jsx` maps over STF cases and crashed on the undefined slot. Fixed to `},`.

**Python Lab sidebar:** `{ id: 'python-lab', label: 'Python Lab', icon: 'code-2' }` added to Sidebar TOOLS section. `code-2` and `layers` icons were both missing from `Icon.jsx` (returned null silently). Both added.

**Files changed:** `src/data/codeModules.js`, `src/data/spotTheFlawCases.js`, `src/components/layout/Sidebar.jsx`, `src/components/shared/Icon.jsx`, `src/App.jsx`, `src/pages/DimensionalModelBrowser.jsx`, `CHANGELOG.md`, `NEXT.md`, `IDEAS.md`

---

## [5.34.0] — 2026-06-18 [STUDYROOM FIX + DIMENSIONAL MODELING SKELETON]

### StudyRoom auth gate removed + Dimensional Modeling coming-soon page

**StudyRoom fix:**
Route in App.jsx was gated on `user &&` — `user` is always null in beta (no Supabase auth). Removed the guard and the `user={user}` prop (StudyRoom takes no props). `#/study` now loads for all users.

**Dimensional Modeling skeleton:**
- `src/pages/DimensionalModelBrowser.jsx` (new) — coming-soon page with 6-area planned curriculum: Star Schema Design, Schema Critique, Flipkart/e-commerce models, Swiggy/delivery models, BI Patterns, Interview Patterns. Why-it-matters banner (Bangalore context). CTAs to RCA Room and SQL Lab.
- Wired into `src/App.jsx` (lazy import + route `page === 'dimensional-modeling'`)
- Added to `src/components/layout/Sidebar.jsx` TOOLS section (icon: layers)
- `IDEAS.md` — dimensional modeling Tier 2 entry marked in progress

**Files changed:** `src/App.jsx`, `src/components/layout/Sidebar.jsx`, `src/pages/DimensionalModelBrowser.jsx` (new), `IDEAS.md`

---

## [5.33.0] — 2026-06-18 [PYTHON MODULES + PYTHON LAB SKELETON]

### 10 Python/pandas modules in Code Lab + Python Lab coming-soon page

**Code Lab — 10 new Python modules (code23–code32):**
All tagged `track: 'python'`, single-quoted JS, Bangalore company contexts (Swiggy, Flipkart, Zepto, Meesho, Razorpay).

- code23 — pandas groupby + named agg (Swiggy delivery metrics, analyst)
- code24 — merge safety + dedup (Meesho SKU data, analyst)
- code25 — pivot_table cohort retention, div(axis=0) (Zepto, senior)
- code26 — rolling(7).mean() + anomaly flag >20% (Flipkart, analyst)
- code27 — np.percentile, mean vs median, P90 revenue share (Razorpay, analyst)
- code28 — resample('W').sum(), sort before pct_change (Swiggy WoW, senior)
- code29 — collections.Counter, most_common(), Pareto coverage (Flipkart, analyst)
- code30 — np.select() for Champion/Loyal/At-Risk/Dormant (Zepto, senior)
- code31 — LTV30/LTV60/LTV90 per acquisition cohort (Meesho, senior)
- code32 — drop_duplicates, dropna(subset), pd.to_numeric(errors='coerce') (generic, analyst)

**Python Lab skeleton (new page):**
- `src/pages/PythonLabBrowser.jsx` — coming-soon page with planned curriculum grid (6 areas: Core pandas, Time Series, NumPy & Stats, Python stdlib, End-to-End Tasks, Interview Patterns), status banner, CTA to Code Lab
- Wired into `src/App.jsx` (lazy import + route `page === 'python-lab'`)
- Added to `src/components/layout/Sidebar.jsx` TOOLS section

**Files changed:** `src/data/codeModules.js`, `src/pages/PythonLabBrowser.jsx` (new), `src/App.jsx`, `src/components/layout/Sidebar.jsx`

---

## [5.32.3] — 2026-06-18 [HOTFIX: V5.32.2 REGRESSION]

### V5.32.2 regression fix — source files restored from V5.32.1

V5.32.2 accidentally staged the diff between old corrupted source files and V5.32.1 HEAD, deleting STF Python cases, Bangalore tracks, and StudyRoom from live site. Fixed by copying all V5.32.1 source files from clean clone back into repo before committing.

**Files restored:** `src/data/companyTracks.js`, `src/data/spotTheFlawCases.js`, `src/pages/SpotTheFlawBrowser.jsx`, `src/components/shared/ErrorBoundary.jsx`, `src/App.jsx`, `src/study/sm2.js`, `src/study/studyCards.js`, `src/pages/StudyRoom.jsx`

---

## [5.32.2] — 2026-06-18 [BROKEN — see 5.32.3]

Git regression: `.git` copied from fresh clone into corrupted repo caused `git add -A` to stage deletions of V5.32.1 additions. Do not reference this version.

---

## [5.32.1] — 2026-06-18 [DOUBLE-COMMA BUG FIX]

### Two JS syntax crashes fixed (Company Tracks + Spot the Flaw)

Root cause: apply_v532.py injected new array entries with `array_body + ',\n' + new_content` where `array_body` already ended with `},` — producing `},,` double-comma syntax, creating sparse undefined slots in JS arrays, crashing React on map().

**Fixes applied:**
- `src/data/companyTracks.js` — `},,\n` replaced with `},\n` (Bangalore tracks: swiggy-da, zepto-pa, flipkart-da)
- `src/data/spotTheFlawCases.js` — same fix (STF13–17 Python cases)

---

## [5.32.0] — 2026-06-18 [BANGALORE TRACKS + STF PYTHON + STUDYROOM + ERRORBOUNDARY]

### Four additions shipped in one session

**1. Bangalore Company Tracks (swiggy-da, zepto-pa, flipkart-da)**
Added to `src/data/companyTracks.js`. Each track: mentalModel (northStar, lens, drivers, structure, nonNegotiables, answerPattern, seniorLens, watchOuts), interviewStructure[], caseRefs[], playbookArticles, estimatedHours.

**2. STF Python cases (STF13–STF17)**
Five Spot the Flaw cases covering pandas interview mistakes: many-to-many merge inflation (STF13), fillna(0) on string column (STF14), filter after aggregation (STF15), mean hides tail in skewed data (STF16), pct_change on unsorted DataFrame (STF17). Added \'python\' filter to SpotTheFlawBrowser.jsx.

**3. StudyRoom — localStorage SM-2 spaced repetition**
`src/study/sm2.js` (SM-2 algorithm), `src/study/studyCards.js` (346 cards), `src/pages/StudyRoom.jsx` (3 views: queue/review/topics). No Supabase — pure localStorage.

**4. ErrorBoundary nav-reset fix**
Added `getDerivedStateFromProps` to reset on `resetKey` prop change. "Go home" changed to `window.location.reload()`. App.jsx passes `<ErrorBoundary resetKey={page}>`.

**Files changed:** `src/data/companyTracks.js`, `src/data/spotTheFlawCases.js`, `src/pages/SpotTheFlawBrowser.jsx`, `src/study/sm2.js` (new), `src/study/studyCards.js` (new), `src/pages/StudyRoom.jsx` (new), `src/components/shared/ErrorBoundary.jsx`, `src/App.jsx`

---

## [5.29.0] — 2026-06-10 [UX + NAV]

### 21-room audit pass — nav labels + missing descriptions

Three fixes from full-platform audit of all 21 rooms:

1. **Sidebar nav "Stats Calc" → "A/B Interpreter"** — "Stats Calc" undersells the tool; it's a full A/B test interpreter (p-value, SRM, CI, plain-language verdict), not just a calculator. Label now matches the component's own h1.

2. **Sidebar nav "Cases" → "Analytics Cases"** — "Cases" was the vaguest label in the nav. Every other analytics room names what you do (Metrics, RCA, Growth Analytics); "Cases" just said "things exist here." Renamed to "Analytics Cases" for parity.

3. **Full Loop browser — description paragraph added** — FullLoopBrowser.jsx had no description paragraph, just h1 "End-to-end analyst simulations". First-time users had no context for what "end-to-end" means in practice. Added: "Most interview practice drills one skill at a time. Real analyst work does not. You get a real scenario — a metric drop, a broken experiment, a suspicious dashboard. You work it end-to-end: decompose the problem, propose a data schema, write SQL queries against live in-browser data, and synthesize a recommendation."

Rooms 05–08, 10–15, 17–21 were audited and required no changes — descriptions, navigation, and UX are already well-built.

**Files:** `src/components/layout/Sidebar.jsx`, `src/pages/FullLoopBrowser.jsx`

---

## [5.28.0] — 2026-06-10 [CONTENT]

### RCA Foundations + A/B Foundations — content audit pass (Rooms 03 + 04)

**RCA Foundations (rf01–rf15):**
- Header comment said "12 modules" — corrected to 15
- rf03 and rf10 both titled "Data Quality First" — identical titles despite distinct sub-skills (rf03: quick 4-question triage; rf10: deeper platform/pipeline checklist). rf10 renamed to "Instrumentation Failure Patterns" / "Recognizing iOS-only, event-level, and pipeline failures before they waste engineering time"
- All difficulty values verified correct; no devNote fields

**A/B Foundations (ef01–ef15):**
- No fixes needed. Header comment correct (15 modules). Difficulty values correct. Content quality strong throughout. Cleanest foundation room.

**Files:** `src/data/rcaFoundationModules.js`

---

## [5.27.0] — 2026-06-10 [CONTENT]

### Metrics Foundations — content audit pass (Room 02)

Two fixes from content audit:
- Header comment in `metricsFoundationModules.js` said "13 modules" — updated to 17 (stale from before modules mf09–mf17 were added)
- mf08 and mf13 had near-identical titles ("Metric Sensitivity and Trade-offs" / "Metric Sensitivity") despite teaching distinct lessons. Renamed mf13 to "False Negatives and Metric Choice" with subtitle "How a high-variance primary metric silently discards real improvements" to surface the diagnostic/retrospective framing that distinguishes it from mf08's prospective/selection framing.

All 17 modules verified: difficulty values correct, no devNote fields, keyInsights scenario-grounded.

**Files:** `src/data/metricsFoundationModules.js`

---

## [5.26.0] — 2026-06-09 [UX + CONTENT]

### All 4 Foundation rooms — entry UX + room descriptions (Audit #151)

**FoundationBrowser.jsx** (shared component — affects all 4 rooms):
- Added `description` prop: displays a one-sentence room purpose below the header. Answers "what will I be able to do after this room?" for every first-time visitor.
- Fixed Start/Continue CTA: previously only showed when `completedCount > 0`. Now also shows for zero-progress users with "Start here →" copy. New users no longer face a grid of 32 cards with zero guidance.

**Room descriptions added:**
- Stats Foundations: "Build the statistical intuition behind every experiment and metric decision. Covers distributions, hypothesis testing, confidence intervals, power, and causal inference — the math that explains why A/B tests work and when they fail."
- Metrics Foundations: "Learn to define metrics that actually measure what you care about. Covers north star metrics, guardrail and diagnostic decomposition, and the traps that make metrics misleading — so you can design measurement before you run the experiment."
- RCA Foundations: "Develop a systematic approach to diagnosing metric drops. Covers funnel decomposition, segment isolation, external cause identification, and data quality checks — the mental models that turn a confusing dashboard into a clear root cause."
- A/B Foundations: "Understand how controlled experiments work — from randomization and power to SRM, novelty effects, and network interference. Build the judgment to design clean tests and read results without being misled by the data."

**Files:** `src/components/shared/FoundationBrowser.jsx`, `src/pages/StatsFoundationsBrowser.jsx`, `src/pages/MetricsFoundationsBrowser.jsx`, `src/pages/RCAFoundationsBrowser.jsx`, `src/pages/ExpFoundationsBrowser.jsx` | Build ✓ 2.65s

---

## [5.25.0] — 2026-06-09 [BUG FIX]

### Stats Foundations — difficulty filter bug (Audit #150)

sf26–sf32 had wrong `difficulty` values ('intermediate', 'analyst', 'senior') that don't exist in `FoundationBrowser.jsx`'s `DIFF_CFG` map. All 7 modules silently fell back to Beginner styling and were excluded from Intermediate/Advanced filter results. Fixed all 7 to correct PAL tier values. Also removed `devNote` design-note fields from those 7 modules (never rendered, just clutter).

- sf26 Bayesian Thinking: 'intermediate' → 'Advanced'
- sf27 Effect Size: 'analyst' → 'Intermediate'
- sf28 Bootstrap: 'senior' → 'Advanced'
- sf29 Chi-Square: 'analyst' → 'Intermediate'
- sf30 SUTVA: 'senior' → 'Advanced'
- sf31 ANOVA: 'senior' → 'Advanced'
- sf32 Non-Parametric: 'senior' → 'Advanced'

All 32 module JSX files confirmed fully built. Content passes quality bar.

**File:** `src/data/statsFoundationsModules.js` | Build ✓ 3.21s

---

## [5.24.0] — 2026-06-09 [BUG FIX]

### Full Loop fl01 QA pass — 3 bugs fixed

**Bug 1 — Q1 date split (fullLoopCases.js)**
The `correctQuerySqlite` for Q1 used `date('2026-06-02')` as the migration cutoff. This put the entire May 26–Jun 1 window (post-migration, all UPI failures) into "last week", making last_week_cvr=0% instead of the expected 62.5% baseline. Fixed: cutoff moved to `date('2026-05-26')` across Q1, Q2, and Q3. Q1 now correctly shows UPI: this_week 28.6% vs last_week 62.5%.

**Bug 2 — duplicate android payment (fullLoopSeedData.js)**
Payment 23 was a duplicate retry for order 15 (android, user 1) — an extra `upi failed 2026-05-28` that inflated android attempt count without adding any cross-platform signal. Removed. Downstream payments renumbered to stay contiguous (old 24→23, 25→24, …, 31→30).

**Bug 3 — Q3 returned only android (fullLoopSeedData.js)**
All post-migration UPI orders (15, 17, 19, 21, 23, 25, 26) linked to users 1/3/5/7/9 — all android. Q3 therefore returned a single row `['android', ...]` while the insight claimed "consistent across all platforms". Fixed: added orders 27 (user 2, ios), 28 (user 4, web), 29 (user 6, ios) and payments 31-36 for those orders. Result: android 25%, ios 25%, web 50% — all far below 62.5% baseline, confirming provider-level failure across platforms.

**Verification:** all three `correctQuerySqlite` queries run against updated seed in Node (sql.js) — no errors, outputs match insight text.

**Files:** `src/data/fullLoopCases.js`, `src/data/fullLoopSeedData.js`
**Build:** ✓ 2.73s, 0 errors

---

## [5.23.0] — 2026-06-09 [REBUILD + BUG FIX]

### Full Loop 5-phase rebuild

Rewrote Full Loop from 7 discrete phases (alert → data → rca → sql → communicate → experiment → readout) to 5 connected investigation phases that mirror a real analytics interview:

1. **Problem** — metric alert + clarifying MCQ
2. **Decomposition** — free-form MECE breakdown with key-element matching
3. **Schema Design** — user proposes tables/columns needed for investigation
4. **Query Chain** — 3 sequential SQL queries (sql.js), each building on prior results
5. **Synthesis** — stakeholder summary with rubric self-assessment

All 10 cases (fl01-fl10) rewritten in new format. Seed data expanded with 5 new tables (feature_usage, support_tickets, search_results, server_metrics, module_progress) to support 3-query chains. FullLoopBrowser.jsx updated for new data contract (phaseCount=5, description from problem.context).

### Deep link auth race fix

Root cause: `onAuthStateChange` callback fires `setPage('progress')` before deep-link handler can consume the URL hash. Fixed by adding `authSettled` state — deep link consumption waits for auth to settle instead of using a fragile 150ms timer. Added `pendingDeepLinkRef` guard to the `home→progress` redirect effect. 2-second fallback timer if Supabase never fires.

Files: `src/App.jsx`, `src/components/fullLoop/FullLoopRunner.jsx`, `src/data/fullLoopCases.js`, `src/data/fullLoopSeedData.js`, `src/pages/FullLoopBrowser.jsx`

---

## [4.93.0] — 2026-06-03 [BUG FIX + VISUAL]

### Audits #145 + #146 closed

**Audit #146 — FV/FA structured rendering:** `renderDebrief()` in SqlLabPage.jsx replaced with a structured paragraph parser. `DEBRIEF_BLOCKS` config detects 4 section types by leading `**Header:**` pattern: Wrong Answer (red), Forensic Trap (orange), Sanity Check (teal), Analyst Judgment (yellow). Each renders as a colored left-border block with a section label badge. `renderInline()` extracted for shared bold rendering. Hits: 30 WA + 94 FT + 124 SC + 10 AJ blocks across 155 problems.

**Audit #145 — Study Plan modal not working:** Root cause: `StudyPlanModal` rendered inside `.sql-lab-main-panel` (`position: fixed; z-index: 5`), scoping its `z-index: 200` within that stacking context. `.sql-lab-problem-panel` (also `z-index: 5`, later in DOM) painted over it. Fix: moved modal render outside both panels to the root JSX fragment.

Files: `src/pages/SqlLabPage.jsx`, `AUDITS.md`

---

## [4.92.0] — 2026-06-03 [FEATURE]

### Full statefulness pass — all remaining runners

Mid-case draft persistence wired to 9 remaining runners. Pattern: save on every state change, restore on mount if no prior completion, clear on submit/retry. Draft functions added to 8 util files.

- **Behavioral/Estimation/Prioritization:** `response` text draft, cleared on `handleRate` + `handleRetry`.
- **SpotTheFlawRunner:** `answer` text draft saved while in `STEP_SETUP`.
- **ScenarioRunner:** Inline draft helpers (uses shared `progress.js`). `selectedDecision` + `checkedFlags` persisted.
- **TakehomeRunner:** `phase` + `writeup` + `checkedRubric` persisted.
- **ChallengesRunner:** All 5 state vars (`screen`, `qIndex`, `answers`, `revealed`, `checkedPoints`). Sets serialized to arrays for JSON, restored as Sets on mount.
- **BIRunner/InstrumentationRunner:** `WorkScreen` text per-case key + outer `screen` state. Both cleared on reveal.
- GrowthAnalyticsRunner, StatsRunner, CodeRunner confirmed already stateful — no changes needed.

Files: 8 progress utils, `BehavioralRunner.jsx`, `EstimationRunner.jsx`, `PrioritizationRunner.jsx`, `SpotTheFlawRunner.jsx`, `ScenarioRunner.jsx`, `TakehomeRunner.jsx`, `ChallengesRunner.jsx`, `BIRunner.jsx`, `InstrumentationRunner.jsx`

---

## [4.91.0] — 2026-06-03 [VISUAL]

### Audit #79 — Room header icon consistency

6 room browsers upgraded to the standard 36×36 colored box + Icon pattern: RCABrowser (`search`/yellow), MetricsBrowser (`bar-chart`/green), BehavioralBrowser (`mic`/purple), CasesBrowser (`clipboard`/purple), ScenarioBrowser (`flask`/accent), CodeBrowser (`target`/yellow). Icon import added to Behavioral, Scenario, Code browsers. Room labels added where missing.

Files: `src/pages/RCABrowser.jsx`, `MetricsBrowser.jsx`, `BehavioralBrowser.jsx`, `CasesBrowser.jsx`, `ScenarioBrowser.jsx`, `CodeBrowser.jsx`, `AUDITS.md`

---

## [4.90.0] — 2026-06-03 [CONTENT QUALITY]

### S-grade debrief pass complete (Batches 4–13)

All 130 non-forensic SQL Lab problems upgraded with FV (wrong query + wrong output + why plausible) and FA (sanity check cross-query) in Batches 4–13. Completes the full 13-batch pass started in V4.74.0. `SQL_UPGRADE_PASS.md` complete. Standout FV=5: e54 (IS NOT NULL vs != NULL), e62 (COUNT vs SUM → 100% CVR), m01 (missing PARTITION BY in LAG), m16 (global running total), m21 (DESC vs ASC in NTILE), master07 (NOT IN with NULL → 0 rows).

Files: `src/data/sqlLabProblems.js`, `SQL_UPGRADE_PASS.md`, `SQL_LAB_PLAN.md`

---

## [4.89.0] — 2026-06-03 [BUG FIX + FEATURE]

### Auth persistence fix + DesignRunner + MetricsRunner statefulness

**Auth fix:** `INITIAL_SESSION` and `TOKEN_REFRESHED` events now handled in `onAuthStateChange`. Fixes sign-out-on-refresh — Supabase v2 fires `INITIAL_SESSION` on load when session exists, not `SIGNED_IN`. Both redirect `page === 'home'` → `'progress'`.

**DesignRunner:** `currentPhaseIndex` restores from `completedPhaseIds.length`; `view` restores to `'debrief'` if `lastScore` exists; `result` recomputed on restore.

**MetricsRunner:** `fieldChoices` draft saved to `pal-metrics-draft-v1` on every selection. Restored on mount if no prior attempt. Cleared on submit and retry.

Files: `src/App.jsx`, `src/components/design/DesignRunner.jsx`, `src/components/metrics/MetricsRunner.jsx`, `src/utils/metricsProgress.js`

---

## [4.88.0] — 2026-06-03 [FEATURE + CONTENT]

### Mid-case statefulness (CaseRunner + RCARunner) + Forensic Batch 3

**Statefulness:** CaseRunner + RCARunner save draft state (`currentPhaseIndex`, `submittedChoices`, `stepChoices`) on every change. Restored on reopen. Cleared on completion/retry. Draft functions added to `caseProgress.js` and `rcaProgress.js`.

**Forensic Batch 3 (f21–f25):** f21 compounding fee deductions, f22 linear vs compound growth (missing POWER), f23 SaaS churn denominator (end-of-period inflates rate), f24 prep time includes delivery, f25 seller survivorship bias (zero-sale sellers excluded).

Files: `src/components/cases/CaseRunner.jsx`, `src/components/rca/RCARunner.jsx`, `src/utils/caseProgress.js`, `src/utils/rcaProgress.js`, `src/data/sqlLabProblems.js`, `SQL_LAB_PLAN.md`

---

## [4.87.0] — 2026-06-03 [FEATURE + CONTENT]

### spokenSummary infrastructure + RCA25 + RCA26

**spokenSummary field:** Teal collapsible "30-Second Answer" toggle added to `RCADebriefPanel.jsx` and `CaseRunner.jsx`. Shown when field exists. RCA01–RCA04 populated.

**RCA25 — Seller Active Rate Declined:** Supply-side marketplace RCA. 3 phases: vintage decomp → T&S context → mid-tier economics. Senior difficulty.

**RCA26 — Net Revenue Declined, Orders Stable:** Per-order P&L decomposition (fee + ad − logistics − discount − RTO). Discount burn + RTO compound analysis. 3 phases.

Files: `src/components/rca/RCADebriefPanel.jsx`, `src/components/cases/CaseRunner.jsx`, `src/data/rcaCases.js`

---

## [4.86.0] — 2026-06-03 [FEATURE + CONTENT]

### Full Jatin feedback sequence

Stats Foundations persistence (M01/M21/M23/M24/M25 + `statsFoundationsState.js`). rf15 Hypothesis Ranking module (3 scenarios, Impact × Likelihood × Ease ranking, persist/restore). rcaCases.js distractor fix (C01 ad-revenue option). "Never say I would look at the data" rule injected into leadershipNotes for C01/C03/C07 with domain-specific example queries.

Files: `src/data/rcaCases.js`, `src/utils/statsFoundationsState.js`, `src/data/rcaFoundationModules.js`, `src/components/rcaFoundations/RCAFoundationsRunner.jsx`

---

## [4.85.0] — 2026-06-03 [FEATURE + CONTENT]

### rf14 Dominant Lever + Pruning module + C01 distractor fix

rf14: 3 scenarios, 2-phase exercise (identify dominant lever → apply pruning rule), persist/restore, reference table. C01 Phase 4 option C distractor rewritten from "segment by demographics" to plausible delivery-time benchmark cut.

Files: `src/data/rcaFoundationModules.js`, `src/components/rcaFoundations/RCAFoundationsRunner.jsx`, `src/data/businessCases.js`

---

## [4.84.0] — 2026-06-03 [FEATURE + CONTENT QUALITY]

### Cross-foundations quality pass + rf13 Routing Gate

**rf13 — The Routing Gate (new module):** 6-scenario routing exercise. Given a metric drop with a time signature, route the investigation to the correct starting branch (sanity/data pipeline, external/market, internal tech, product erosion/behaviour, segment isolation). Shuffled scenarios, persistence, reference table revealed post-answer. Added to rcaFoundationModules.js + RCAFoundationsRunner.jsx. RCA Foundations now 13 modules.

**Exp Foundations — full persistence + shuffle + distractor fixes:** All 15 modules (ef01–ef15) now save/restore state. EF02/EF04/EF11/EF14 item arrays shuffle on first visit. EF01 distractors rewritten — "sample size too small" and "not statistically significant" replaced with "seasonal effects could explain the gap" and "may not be practically significant" (require analytical reasoning to dismiss). EF01 explanation updated.

**Metrics Foundations — full persistence + shuffle + distractor fixes + intro anchor:** All 13 modules (mf01–mf13) now save/restore state. mf01/mf04/mf05/mf06 item arrays shuffle. mf02 option C rewritten — "not movable" replaced with "not sensitive — noisy due to external factors" (requires knowledge of measurement tradeoffs). mf11 options A and C rewritten — "moves too slowly" → "introduces double-counting when components correlated"; "never use composites" → "teams optimize the highest-weight component, gaming the OEC without real improvement." mf01 intro anchored with "what is metrics analytics" sentence.

**Stats Foundations — intro anchor:** Module01 intro anchored with 2-sentence "what is statistics" definition. Persistence deferred — Stats Foundations uses a separate 32-file module architecture; applying persistence requires a different approach than the single-runner-file pattern used in RCA/Exp/Metrics. Logged in NEXT.md.

Files: `src/data/rcaFoundationModules.js`, `src/components/rcaFoundations/RCAFoundationsRunner.jsx`, `src/components/expFoundations/ExpFoundationsRunner.jsx`, `src/components/metricsFoundations/MetricsFoundationsRunner.jsx`, `src/components/statsFoundations/modules/Module01_WhatIsData.jsx`

---

## [4.83.0] — 2026-06-03 [FEATURE + CONTENT]

### RCA Foundations — Full Jatin feedback implementation (V4.83.0)

Complete implementation of all actionable feedback from Jatin's user test (June 2026).

**Answer persistence (all 12 modules):** Every RCA Foundation module now saves and restores its interactive state via localStorage under `pal-rca-{id}-v1`. Navigating to another module and returning restores MCQ selections, assignment choices, slider values, query step progress, and reveal state exactly as left. Agent-implemented using `saveRCAState()` / `loadRCAState()` / `shuffleArr()` utility functions added to the runner. All `useState` initializers updated with saved fallbacks; `useEffect` added per module to save on any state change.

**Item shuffling (5 modules):** The item arrays in rf01 (6 items), rf02 (6 items), rf04 (6 items), rf10 (3 items), rf11 (5 items) shuffle on first visit using Fisher-Yates. The shuffled order is persisted so the same order is restored on re-visit — preventing a reshuffle that would orphan saved answers. This breaks the "answer order mirrors concept order" issue Jatin identified.

**BLUF exercise in rf06:** After the 5-step walkthrough, a new "BLUF Practice" section appears with 5 fields (cause, confidence, impact, action, open risk). Each field has 3 options — one correct, two representing common framing mistakes (vague language, wrong confidence calibration, unquantified impact, non-specific actions, "no risk" overconfidence). Auto-reveals on selection with explanation. Complete module button gated behind all 5 fields answered.

**Remaining items logged:** Adaptive re-testing (IDEAS.md Tier 1 — needs ~20 new questions + adaptive logic, 2 sessions minimum) and Routing Gate new module rf13 (NEXT.md item 1b — session-ready spec).

Files: `src/components/rcaFoundations/RCAFoundationsRunner.jsx`, `IDEAS.md`, `NEXT.md`, `BRAIN_TRANSFER.md`

---

## [4.82.0] — 2026-06-03 [CONTENT QUALITY]

### RCA Foundations — Distractor quality pass + intro fix + IDEAS logging

**Trigger:** Jatin user feedback (June 2026) — MCQ distractors too obviously wrong, Module 1 intro assumes RCA knowledge.

Three changes:

1. **rf01 intro anchor** — Prepended "RCA — Root Cause Analysis — is how analysts answer the question: 'Our key metric dropped. Why?'" + context sentence before the four-layer explanation. Addresses new users who haven't encountered the term before.

2. **Distractor rewrites** — 6 sets of options replaced across 5 modules. Previous wrong options were either directly contradicted by the question premise (AOV is flat but option says "users spending less"), or too obviously wrong by common sense (competitor launch for a platform-specific SDK drop). New distractors represent plausible misconceptions that require actual analytical reasoning to dismiss:
   - rf03 Q1: "OS permission change" and "pipeline partition filter" replace "competitor launch" and "engagement patterns"
   - rf03 Q2: "user count inflation from campaign" and "refund volume" replace premise-contradicted options
   - rf05: "retained users churning faster" and "new geography with lower retention" replace "product degraded" (contradicted by slider) and "wrong geography"
   - rf07 Q1: "new users compound over time" replaces weak "top-of-funnel" framing
   - rf08: "segment by new vs returning" replaces "compare experiment variants" (assumed an experiment)
   - rf03 Q1+Q2 explanations updated to explain why new distractors are wrong

3. **IDEAS.md** — Three new Tier 1 RCA module concepts logged from Jatin's Universal RCA Framework v4.1: Routing Gate (sudden vs gradual routing), Dominant Lever + Pruning Rule, BLUF Conclusion format.

Files: `src/components/rcaFoundations/RCAFoundationsRunner.jsx`, `IDEAS.md`, `BRAIN_TRANSFER.md`, `NEXT.md`

---

## [4.81.0] — 2026-06-03 [CONTENT]

### Forensic Batch 2 (f11–f20)

10 new forensic SQL problems covering the second batch of trap types. All verified against datamart data with correct checkValues.

| ID | Title | Datamart | Trap |
|---|---|---|---|
| f11 | Average Order Value | food_delivery | Average of averages — per-customer avg vs true AOV |
| f12 | Total Revenue | ecomm | JOIN fanout — order_items duplication inflates SUM |
| f13 | Seller GMV Report | marketplace | Wrong JOIN type — INNER drops zero-transaction seller |
| f14 | Monthly Order Trends | food_delivery | strftime missing year — two Marches merged |
| f15 | First Session Duration | gaming | ROW_NUMBER ORDER BY DESC returns last not first |
| f16 | ARPU | gaming | NULL in AVG — COALESCE missing, denominator shrinks |
| f17 | Level Engagement | gaming | COUNT(*) counts attempts, not unique players |
| f18 | Campaign Reach | ecomm | UNION ALL duplicates multi-channel users |
| f19 | On-Time Delivery Rate | food_delivery | Wrong denominator — cancelled orders in base |
| f20 | User Activity 2024 | ecomm | WHERE after LEFT JOIN converts to INNER JOIN |

SQL problem total: 140 (50E/40M/25H/15Master/20Forensic). Forensic Batch 3 (f21–f25, staff-level) is next.

Files: `src/data/sqlLabProblems.js`, `BRAIN_TRANSFER.md`, `NEXT.md`

---

## [4.80.2] — 2026-06-03 [BUG FIX + AUDIT]

### Foundations Access Fix (Committed) + Forensic checkValues Audit Closed

**Foundations fix (uncommitted from previous session, now committed):** All 4 foundation open functions in `App.jsx` had residual paywall checks (`if (!m.isFree && !unlocked) → setPage('unlock')`) that were blocking anonymous users from running any foundation module even after the AUTH_REQUIRED_PAGES fix in V4.80.1. Removed. Also confirmed all foundation modules across all 4 data files have `isFree: true` — any that had `isFree: false` were updated.

**Forensic checkValues audit (AUDITS #144) closed:** Audited f02, f03, f05–f08, f10 for whole-number REAL formatting issues (the bug where `ROUND()` returns `40.0` → JS `40` → String `'40'`, not `'40.0'`). All confirmed correct: f02 uses a genuine 2-decimal value (1719.87), f03/f06/f07/f08/f10 check integer columns, f05 checks string columns. No additional fixes required. Audit item marked ✅.

Files: `src/App.jsx`, `src/data/expFoundationModules.js`, `src/data/metricsFoundationModules.js`, `src/data/rcaFoundationModules.js`, `src/data/statsFoundationsModules.js`, `AUDITS.md`, `BRAIN_TRANSFER.md`, `NEXT.md`

---

## [4.80.1] — 2026-06-03 [BUG FIX]

### Auth Gate Corrections

Two bugs in the V4.80.0 auth gate implementation:

1. **Foundations incorrectly gated for anonymous users.** `stat-foundations-runner`, `metrics-foundations-runner`, `rca-foundations-runner`, `exp-foundations-runner` were in `AUTH_REQUIRED_PAGES`, blocking anonymous users from accessing Foundations content. Per the business model (MONETIZATION.md), Foundations are top-of-funnel and must be open to everyone. Removed from gate.

2. **Signed-in users saw landing page on back-navigation.** The `setPage('home' → 'progress')` redirect only fired on the SIGNED_IN auth event (once per session). If a signed-in user pressed back from SQL Lab (which calls `navigate('home')`), they'd briefly see the landing page. Fixed by adding a second useEffect: `if (user && page === 'home') setPage('progress')` — fires reactively whenever page becomes 'home' for a signed-in user.

Files: `src/App.jsx`, `BRAIN_TRANSFER.md`, `NEXT.md`

---

## [4.80.0] — 2026-06-03 [PRODUCT + CONTENT + UX]

### 3-Tier Monetization Gate + Business Model

**Vision locked:** PAL is a professional development platform for analytics careers, not an interview prep tool. Full strategy in new `MONETIZATION.md`. Pricing target $29-39/month or $249-299/year. B2B path documented. Standing rules added to DECISIONS.md.

**Three tiers implemented:**
- **Anonymous:** can browse room browsers, cannot run any content. `AUTH_REQUIRED_PAGES` useEffect in App.jsx intercepts all runners + SQL Lab and shows auth modal.
- **Free (signed in):** all Foundations + `isFree: true` cases (3/room) + Easy SQL + progress sync.
- **Premium (signed in + DAI2026 or future Stripe):** everything. `isUnlocked()` in unlock.js checks access code.

**`getAccessTier(user)`** added to unlock.js — returns `'anonymous'` | `'free'` | `'premium'`. Canonical tier check for all future tier-aware UI.

**27 Easy SQL problems** updated to `isFree: true` (mass update via Python script). Medium/Hard/Master/Forensic stay `isFree: false`.

Files: `src/App.jsx`, `src/utils/unlock.js`, `src/data/sqlLabProblems.js`, `MONETIZATION.md`, `DECISIONS.md`, `BRAIN_TRANSFER.md`, `NEXT.md`

---

## [4.79.0] — 2026-06-03 [UX]

### Signed-out / Signed-in UX Split

**Home.jsx completely rewritten** as a full-screen signed-out landing page. No sidebar for signed-out users (`signed-out` CSS class hides sidebar and resets margin-left). Background animated gradient orbs. Ghost analytics snippets (`p = 0.04`, `DAU ↓ 31%`, `SRM detected`, `retention: 67%`...) float at edges suggesting data waiting to be unlocked. Staggered entrance animations with `palLandingIn` keyframe. Primary CTA: "Sign in to analyze →" with continuous indigo glow pulse (`palLandingGlow`). Secondary: "Explore without signing in" → stat-foundations.

**Sidebar changes:** Logo navigates to `progress` for signed-in users, `home` for signed-out. `Progress` nav item removed — Progress is now home for signed-in users.

**App.jsx changes:** `signed-out` CSS class on layout root when `!user`. Home renders with `onShowAuth` prop. Mobile topbar logo navigates to `progress` when signed in.

Files: `src/pages/Home.jsx`, `src/components/layout/Sidebar.jsx`, `src/App.jsx`, `src/index.css`

---

## [4.78.1] — 2026-06-03 [BUG FIX]

### Onboarding Modal Portal Fix

Modal was scrolling with the page instead of staying viewport-fixed. Root cause: `pal-page-enter` animation uses `both` fill mode which retains `transform: translateY(0)` after animation completes — even a zero transform creates a CSS stacking context, making `position: fixed` descendants relative to that element rather than the viewport. Fix: `createPortal(modal, document.body)` in Home.jsx renders the modal outside the transformed element entirely.

Files: `src/pages/Home.jsx`

---

## [4.78.0] — 2026-06-03 [UX]

### Signed-in Users Land on Progress

Returning signed-in users now land on the Progress page instead of the marketing landing page. One-line change in the SIGNED_IN auth handler: `setPage(p => p === 'home' ? 'progress' : p)`. Also logged 8 backlog items across AUDITS.md (#144-146) and IDEAS.md (FV/FA UI, RCA/Metrics content, Postgres migration, MCQ revamp, Simulator customization, Pandas).

Files: `src/App.jsx`, `AUDITS.md`, `IDEAS.md`, `NEXT.md`, `BRAIN_TRANSFER.md`

---

## [4.77.1] — 2026-06-03 [BUG FIX]

### Forensic checkValues Float Formatting

SQLite REAL values that are whole numbers return as JS integers (40.0 → 40). The validator does `String(row[i]) === String(val)`, so checkValues using `'40.0'` never matched. Fixed: f01 `no_show_pct: '40.0' → '40'`, f04 `amount: '3500.0' → '3500'`, f09 `premium_pct: '50.0' → '50'`. Also fixed f01 `expectedRowCount: 3 → 6` (health datamart has 6 providers, not 3). Logged as AUDITS.md #144 for remaining forensic problems to audit.

Files: `src/data/sqlLabProblems.js`

---

## [4.77.0] — 2026-06-03 [PRODUCT]

### Forensic Format — Batch 1 (f01–f10)

New `difficulty: 'Forensic'` tier in SQL Lab. Broken query shown upfront in an orange-bordered block labelled "⚠ Broken query — in production" with `brokenOutputNote` explaining what it returns and why it looks plausible. User identifies the bug and writes the corrected query. SQL engine, schema, and validation all unchanged — the challenge is reading broken code, not writing from scratch.

**UI changes (SqlLabPage.jsx):** `DIFF_ORDER.Forensic = 5`, `DIFF_COLOR.Forensic` (orange), `'Forensic'` added to difficulty filter chips, forensic block rendered between prompt and schema accordion when `problem.format === 'forensic'`, editor placeholder changes to "Write the corrected query here".

**10 forensic problems (f01–f10):**
- f01: Integer division — no-show rate (all providers 0.0%)
- f02: Missing quantity in revenue formula (electronics $569 vs $1,719)
- f03: COUNT(*) vs COUNT(DISTINCT) for buyer count (28 vs 12)
- f04: `= NULL` returns 0 rows — open dispute queue invisible to compliance
- f05: `= NULL` on never-logged-in users — CS team misses churn signal
- f06: Missing HAVING — all buyers labeled power buyers
- f07: Churn win-back list includes re-subscribers (emailing your best customer)
- f08: COUNT(*) vs COUNT(DISTINCT zip) for geographic coverage
- f09: GROUP BY wrong dimension (country vs device_os)
- f10: Off-by-one in medication coverage formula (days_supply × refills vs × (1+refills))

Also logged: AUDITS.md #144 (remaining checkValue audit), SQL_LAB_PLAN.md Section 12 (forensic format spec), IDEAS.md Layer 2 updated (forensic IN PROGRESS, remaining formats deferred).

Files: `src/pages/SqlLabPage.jsx`, `src/data/sqlLabProblems.js`, `src/index.css`, `SQL_LAB_PLAN.md`, `DECISIONS.md`, `IDEAS.md`, `SQL_UPGRADE_PASS.md`, `BRAIN_TRANSFER.md`, `NEXT.md`

---

## [4.76.0] — 2026-06-03 [CONTENT]

### S-Grade Upgrade Pass — Batch 3 (Easy e21–e30)

FV + FA additions to all 10 problems. MJ assumption statements on e27 (integer division denominator) and e29 (AVG vs median for skewed distributions). Standouts: e27 integer division produces all-zero rates (FV=5), e30 COUNT(*) vs COUNT(DISTINCT) returns 187% activation rate (FV=5), e28 churn-with-active-subscription business judgment check. SQL_UPGRADE_PASS.md Batch 3 scored.

Files: `src/data/sqlLabProblems.js`, `SQL_UPGRADE_PASS.md`, `BRAIN_TRANSFER.md`, `NEXT.md`

---

## [4.75.0] — 2026-06-03 [CONTENT + BUG FIX]

### renderDebrief() Fix + S-Grade Upgrade Pass Batch 2 (Easy e11–e20)

**Critical product bug fixed:** `{problem.debrief}` was rendering as plain text — all FV/FA/MJ additions from Batch 1 (committed in V4.74.0) were displaying as one wall of text with literal `**asterisks**`. Fixed: `renderDebrief(text)` function added to SqlLabPage.jsx — splits on `\n\n` into paragraphs, renders `**text**` as `<strong>`. All existing debriefs also benefit.

**Batch 2 — Easy e11–e20:** FV + FA additions to all 10 problems. e13 earns FA=5 (medication coverage +1 formula — off-by-one compounds per prescription). e16 raises MJ=3 via baseline definition question (should disputed transactions be in a fraud baseline?). SQL_UPGRADE_PASS.md Batch 2 scored.

Files: `src/pages/SqlLabPage.jsx`, `src/data/sqlLabProblems.js`, `SQL_UPGRADE_PASS.md`, `BRAIN_TRANSFER.md`, `NEXT.md`

---

## [4.74.0] — 2026-06-03 [CONTENT]

### S-Grade Upgrade Pass — Infrastructure + Batch 1 (Easy e01–e10)

**Infrastructure locked:**
- 10-dimension rubric (MJ + FV + FA added, max 50, flag < 30) added to DECISIONS.md
- SQL_LAB_PLAN.md Section 11: S-grade pass execution plan, batch map, addition format spec
- SQL_UPGRADE_PASS.md created: tracking artifact for all 13 batches
- IDEAS.md: Layer 2 (forensic/impossible/cascade/code-review formats) logged as new Tier 1 product sprint requiring UI work
- BRAIN_TRANSFER.md + NEXT.md updated to reflect active pass

**Batch 1 — Easy e01–e10 — debrief additions (MJ + FV + FA):**
Every problem received:
- **FV (Forensic Value):** specific wrong query that runs cleanly and measures the wrong thing, what it actually returns, and how to catch it before submitting
- **FA (Falsifiability):** sanity check query + conditions under which the answer would be wrong
- **MJ (Measurement Judgment):** for e02 (conversion rate denominator), e07 (2+ events vs 2+ days), e09 (no-show rate denominator) — assumption statements a senior analyst would make before writing SQL

Key FV additions: e01 NOT IN NULL footgun (returns 0 rows silently), e02 integer division (100.0 missing → every rate is 0.0), e04 ended_at IS NULL vs status='active', e06 WHERE resolved_at = NULL (silent empty queue), e09 integer division in rate calculation (the most common silent rate bug). Build: ✓ 2.23s.

Files: `src/data/sqlLabProblems.js`, `SQL_UPGRADE_PASS.md`, `SQL_LAB_PLAN.md`, `DECISIONS.md`, `IDEAS.md`, `BRAIN_TRANSFER.md`, `NEXT.md`, `CHANGELOG.md`

---

## [4.73.0] — 2026-06-03 [CONTENT]

### SQL Quality Audit COMPLETE — Batch 13 (Master: master12, master14, master18, master19, master25, master26, master27)

**THE 13-BATCH SQL QUALITY AUDIT IS COMPLETE. All 130 problems at B-grade floor.**

**Results:** 6/7 flagged. 3 rewrites + 3 debrief upgrades. master27 clean pass.

- **master18 rewritten** — channel first-order value (Di=2 clone of master02). Replaced with "Seller Performance Scorecard" (Etsy, marketplace): 2-CTE conditional aggregation (COUNT/SUM CASE WHEN for completed only), LEFT JOIN to reviews for avg_rating (NULL for no reviews), RANK() window on net_revenue. GadgetWorld (0 completed sales) correctly appears with LEFT JOIN. checkValue: TechVault, rank=1.
- **master19 rewritten** — saas COALESCE tier clone of master04 (Di=2). Replaced with "Driver On-Time Performance Report" (DHL, logistics): LEFT JOIN drivers→shipments with AND status='delivered' in ON clause, SUM(CASE WHEN) for on_time_count, CASE WHEN for NULL-safe rate and performance_band including 'no_data' for zero-delivery drivers. checkValue: Maria Ferrer, 66.7%, 'top'.
- **master25 rewritten** — fintech risk profile clone of master01 (Di=2). Replaced with "Post Engagement Rate by Content Type" (Reddit, social_network): 3-CTE (published → post_stats LEFT JOIN → action_counts ROW_NUMBER PARTITION BY content_type → outer join on rn=1). Introduces top-action-per-group pattern using ROW_NUMBER PARTITION BY distinct from any prior problem. checkValue: video/4 posts/12 interactions/avg=3.0.
- **master12** — debrief upgraded: formula walkthrough + ROW_NUMBER tie-break caveat + FIRST_VALUE alternative + adherence-gap follow-up.
- **master14** — debrief fixed: removed contradictory "wait" language, clarified that accounts 1 and 3 DO appear (both have churned $999 subs), documented the production filter for excluding still-active accounts. TC upgraded.
- **master26** — debrief upgraded: full chain explanation (1→2→4→9→12→13 = depth 5 for user 13), UNION ALL rationale, recursive CTE mechanics explained clearly.
- **master27** — clean pass (3-CTE cohort pivot, unique pattern, all checkValues verified). month_0=0 for Nov cohort correctly reflects no sessions in November for any of the 4 users — all first played in December.
- Build: ✓ 2.21s.

**Audit totals (all 13 batches):** 130 problems scored. Flag rate: Easy avg 5.8/10 → Medium avg 5.2/10 → Hard avg 3.1/10 → Master avg 4.1/10 (higher due to Di=2 pattern clustering). Total rewrites: ~35. Total checkValues fixed: ~8. Total debriefs upgraded: ~12. Patterns introduced: anti-join, HAVING, COUNT DISTINCT, date arithmetic (JULIANDAY), window functions (ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD, FIRST_VALUE, PERCENT_RANK, AVG OVER, SUM OVER, MIN/MAX OVER), gap-and-island, self-join, NOT EXISTS temporal, CROSS JOIN scalar, 4-table JOIN, cohort retention, relational division, WITH RECURSIVE. SQL Lab is now a genuinely differentiated product asset.

Files: `src/data/sqlLabProblems.js`, `SQL_QUALITY_AUDIT.md`, `BRAIN_TRANSFER.md`, `NEXT.md`, `CHANGELOG.md`

---

## [4.72.0] — 2026-06-03 [CONTENT]

### SQL Audit Batch 12 (Master master01–master10)

**Results:** 4/8 flagged. 1 rewrite + 3 targeted fixes.

- **master02** — company fixed Meta→Wayfair (Meta doesn't run ecomm). checkValue updated to organic channel (paid/referral both 100% so paid was ambiguous).
- **master03 rewritten** — channel LTV (Di=2 clone of master02, DC=3 Medium-level). Replaced with "Product Category Gross Margin Ranking" — 3-table JOIN (order_items→orders→products for COGS), 2-CTE, RANK() on margin_pct. Verified: home=54.99%, electronics=51.13%, books=50.46%, apparel=50.33%. checkValue: home/54.99/rank=1.
- **master05** — expectedRowCount fixed 3→2 (actual query returns 2 rows). checkValues populated: txn_id=31, user_id=5, spend_ratio=5.01. Company Chime→Revolut (Chime already in master01 — duplicate company in batch).
- **master10** — debrief fixed: removed unfinished "...wait" reasoning mid-sentence. Full debrief now explains INNER JOIN as AND logic, why carol is correctly excluded, and adds severity-scoring TC follow-up.
- **master01, master04, master08, master09** — all pass. master08 (co-purchase affinity self-join) and master09 (ROW_NUMBER + self-join consecutive subscriptions) are best in batch.
- Build: ✓ 2.41s.

Files: `src/data/sqlLabProblems.js`, `SQL_QUALITY_AUDIT.md`, `BRAIN_TRANSFER.md`, `NEXT.md`, `CHANGELOG.md`

---

## [4.71.0] — 2026-06-03 [MAINTENANCE + CONTENT]

### MD Consolidation + SQL Audit Batch 11

**MD consolidation (lossless, token-conserving):**
- Deleted 4 noise files with zero unique content: SESSION_KICKOFF.md, SESSION_STARTER.md, SPINE_PROTOCOL.md, GIT_COMMIT_TEMPLATE.md (git troubleshooting snippet migrated to BRAIN_TRANSFER.md first)
- Created docs/archive/ — moved 6 stale/one-time files: AUDITS_ARCHIVE.md, CHANGELOG_ARCHIVE.md, PLATFORM_ARCHITECTURE_MEMO.md, PRD_V1.md (was PRODUCT_ANALYTICS_SYSTEMS_LAB_PRD.md), ROADMAP_V425.md (was ROADMAP.md), SETUP_AUTH.md
- BRAIN_TRANSFER.md: added active file reference hub, trimmed history to 3 versions, fixed stale open/deferred items, migrated git troubleshooting
- NEXT.md: trimmed 183→35 lines — removed entire carry-forward log (already in CHANGELOG), kept queue + pre-beta gates only
- DECISIONS.md: replaced duplicate CSS variable color table and animation class list with one-line cross-references to CLAUDE.md (authoritative)
- Net: 26 files → 18 root active + 2 docs/ active + 6 docs/archive/. ~200 lines / ~3,000 tokens saved every session open.

**SQL Audit Batch 11 (h24, master07/13/21, h31–h34, h41, h42):**
- **master07** — already `difficulty: 'Master'`, no change needed. Score 33/35.
- **master13 rewritten** — ROW_NUMBER clone of h07 rewrite (Di=1, 25/35). Replaced with "Buyer Cohort Repurchase Analysis" (Shopify): 3-CTE chain (ROW_NUMBER → first-buyer cohort H1/H2 → LEFT JOIN repurchase flags). Teaches cohort scoping, LEFT JOIN to retain zero-repeat users, MAX(CASE WHEN) binary flag, integer division trap. checkValue: H1 cohort_size=7, repeat_buyers=4, repeat_rate_pct=57.1.
- **master21** — reclassified Hard→Master only. Self-join content is good (Di=4, IQ=5), just mislabeled.
- **h33 rewritten** — CTE+JOIN+RANK clone of m28 (Di=2, 26/35). Replaced with "Content Above Category Benchmark" (TikTok): 2-CTE LEFT JOIN + AVG OVER PARTITION BY category (per-category window, distinct from m28's global AVG OVER). New trap: cannot filter on window function in WHERE — second CTE wrap required. checkValue: content_id=1, fitness, interaction_count=8.
- **h34 rewritten** — LAG+JULIANDAY gap (Di=2, 26/35), third appearance. Replaced with "Concurrent Prescription Risk" (Doximity): self-join on prescriptions with 3-condition ON (same patient, same drug, provider_id < provider_id). Teaching moment: `<` vs `!=` in self-join pair de-duplication. ABS(JULIANDAY) for positive gap. checkValue: patient_id=1, Lisinopril, days_between_rx=2.
- **h24, h31, h32, h41, h42** — all pass. h42 perfect score (35/35).
- Build: ✓ 1.85s, 0 errors.

Files: `src/data/sqlLabProblems.js`, `SQL_QUALITY_AUDIT.md`, `BRAIN_TRANSFER.md`, `NEXT.md`, `DECISIONS.md`, `CHANGELOG.md`, `docs/archive/` (6 files moved), deleted: SESSION_KICKOFF.md, SESSION_STARTER.md, SPINE_PROTOCOL.md, GIT_COMMIT_TEMPLATE.md

---

## [4.69.0] — 2026-06-02 [CONTENT]

### SQL Quality Audit — Batch 10 (Hard h01–h10: h01, h02, h04, h05, h07, h08, h10, h11, h13, h17)

**Results:** 7/10 pass — best batch ever. Two perfect scores (h01=35, h11=35). 3 rewrites + 1 checkValues fix.

- **h07 rewritten** — CTE+LAG MoM order count (Di=1, identical to m09 rewrite, DC=3 Medium-level). Replaced with "New vs Returning Customer Revenue Split" (Shopify) — 2-CTE date matching + conditional aggregation + COUNT(DISTINCT CASE WHEN). Labels each order as new (created_at = first-ever order date) or returning. checkValue: Feb 2023 all-new revenue ($169.98, returning=$0).
- **h10 rewritten** — 2-CTE ROW_NUMBER PARTITION BY (Di=2, same pattern as h08 in same batch). Replaced with "Merchant Exposure per User" (Stripe, fintech) — 4-table JOIN (users→accounts→transactions→merchants) + GROUP BY user + MAX(is_flagged). First problem in audit with P2P NULL trap live in the problem: INNER JOIN to merchants drops P2P transactions (merchant_id IS NULL), understating spend. checkValue: user 3 has_flagged_merchant=1 (FastCash Ltd).
- **h13 rewritten** — SUM(SUM) OVER clone of m30 (Di=2), 2-sentence debrief. Replaced with "Customer Lifetime Spend Percentile" (Amazon, ecomm) — CTE + JOIN completed orders + PERCENT_RANK() global window. Teaches PERCENT_RANK vs NTILE distinction, completed-only filter impact, natural exclusion of no-purchase users. checkValue: user 5 (eve), total_spend=519.95, spend_percentile=1.0.
- **h17 checkValues fixed** — user 5, avg_days_between=73 (gaps: 260+31+1+1=293 days / 4 gaps).

Files: `src/data/sqlLabProblems.js`, `SQL_QUALITY_AUDIT.md`, `SQL_LAB_PLAN.md`

---

## [4.68.0] — 2026-06-02 [CONTENT]

### SQL Quality Audit — Batch 9 (Medium m31–m40: h14, h22, h25, h27, h28, h39, h49, m76, m77, m78)

**Results:** 6/10 pass — best pass rate since Batch 1. 4 full rewrites.

- **h14 rewritten** — double EXISTS clone of m23. Replaced with "Login-Then-Export Funnel Accounts" — 2-CTE temporal ordering funnel (first_login per user vs first_export per user, joined with fe.first_export > fl.first_login). User 2 in account 1 correctly excluded (exported before first login).
- **h22 rewritten** — HAVING SUM single table (Di=2, TC=2, total=20, Easy-level). Replaced with "Provider Appointment Completion Rate" (Zocdoc) — JOIN providers to appointments + SUM(CASE WHEN no_show=0) + rate calc with 100.0. checkValue: Dr. Smith, 10 appts, 60.0% completion.
- **h25 rewritten** — SUM OVER clone of m16 (Di=1, same table/PARTITION BY/ORDER BY, checkValues empty). Replaced with "Month-over-Month Revenue Growth" (Amazon) — CTE + strftime SUM completed orders + LAG growth rate. Teaches completed-only filter, LAG expression repetition in SQLite, NULL-for-first-month. checkValue: 2024-01 revenue=229.96, prev=169.98.
- **h27 rewritten** — NTILE(4) clone of m21 (Di=2). Replaced with "Account Transaction Activity Tier" (JPMorgan) — CTE + LEFT JOIN + COUNT(txn_id) + CASE WHEN threshold bucketing. LEFT JOIN for zero-transaction accounts; COUNT(txn_id) vs COUNT(*) trap on LEFT JOIN result. checkValue: account 1, 6 txns, high tier.
- **m76, m77, m78** — three new datamarts introduced: hr_analytics (PERCENT_RANK salary, Workday), marketplace (COUNT DISTINCT semantic trap, Etsy), food_delivery (semantic bug debugging format, DoorDash). All scored 31/35.

Files: `src/data/sqlLabProblems.js`, `SQL_QUALITY_AUDIT.md`, `SQL_LAB_PLAN.md`

---

## [4.67.0] — 2026-06-02 [CONTENT]

### SQL Quality Audit — Batch 8 (Medium m21–m30: m36, m37, m39, m41, m42, m43, m47, m56, m57, m61)

**Results:** 4/10 pass. 3 full rewrites + 1 dual-metric upgrade + 1 live solution bug fix + 1 checkValues fix + 2 debrief upgrades.

- **m36 solution bug fixed** — self-join without temporal ordering included user 12 (completed Aug 2023, returned Apr 2024) as a "re-purchaser" — incorrectly, since their completion preceded their return. Added `AND o2.created_at > o1.created_at`. expectedRowCount corrected 3→2. Debrief upgraded with the failure mode explanation.
- **m37 rewritten** — HAVING+SUM on single table (DC=2, total=19, Easy-level). Replaced with "Channel Session Conversion Rate" (Shopify) — JOIN sessions to users, GROUP BY channel, SUM(binary converted) for conversions, 100.0*SUM/COUNT rate. Integer division trap embedded.
- **m42 checkValues** — fixed (appt 1, patient 1, F, age 38).
- **m47 rewritten** — LAG+JULIANDAY clone of m26. Replaced with "Rolling 3-Order Average Spend" (Shopify) — AVG() OVER (ROWS BETWEEN 2 PRECEDING AND CURRENT ROW). First bounded rolling window frame in the audit. checkValue: user 5 order 11 → rolling_3_avg=129.99.
- **m56 rewritten** — IN subquery+DISTINCT (DR=2 Di=2 TC=2, thin). Replaced with "Complete Fitness Content Viewers" (Spotify) — relational division via HAVING COUNT(DISTINCT content_id) = (SELECT COUNT(*) FROM content WHERE category='fitness'). Classic relational division pattern: generalizes automatically when new content is added. checkValue: user 2 (one of 2 users engaging with all fitness content).
- **m57 upgraded** — single DENSE_RANK (3rd CTE+ranking clone, Di=2). Upgraded to dual DENSE_RANK: order_rank (by times_ordered) + revenue_rank (by total_revenue). Teaches ranking divergence — most-ordered ≠ most-revenue-generating. Di 2→4.
- **m61 debrief upgraded** — TC=2→4: INNER JOIN failure mode, COUNT DISTINCT vs COUNT distinction, EXISTS alternative and its brittleness, normalization follow-up.

Files: `src/data/sqlLabProblems.js`, `SQL_QUALITY_AUDIT.md`, `SQL_LAB_PLAN.md`

---

## [4.66.0] — 2026-06-02 [CONTENT]

### SQL Quality Audit — Batch 7 (Medium m11–m20: m21, m23, m24, m25, m26, m28, m29, m30, m32, m33)

**Results:** 3/10 pass. 3 full rewrites + 3 checkValues fixes + 1 company fix + 2 debrief upgrades.

- **m21 rewritten** — ROW_NUMBER first-per-group (Di=2, clone of m13 latest-per-group). Replaced with "User Engagement Quartile Segmentation" (TikTok) — CTE + LEFT JOIN + NTILE(4). Introduces NTILE, the LEFT JOIN for zero-count users, and the mechanical row-splitting behavior vs value-based bucketing.
- **m24 company + checkValues** — Gainsight appeared in m01 (Batch 6); changed to Salesforce. checkValues was empty; added Echo Tech (tech, mrr=2999, industry_rank=1).
- **m26 checkValues** — was empty; added user 1's session gap: 2023-02-01→2023-04-15 = 73 days.
- **m28 rewritten** — 2-CTE aggregate+RANK top-3 (Di=2, identical structure to m20). Replaced with "Creator Engagement vs Platform Benchmark" (YouTube) — CTE + AVG() OVER () global window (no PARTITION BY). First appearance of global window for benchmark comparison.
- **m29 checkValues** — was empty; added event 1 (user 1, login, next_event_date=2024-01-08).
- **m30 rewritten** — AVG() OVER cumulative (Di=2, near-clone of m16 SUM() OVER on same table). Replaced with "Spend Share by Category" (Brex, fintech) — SUM(SUM(amount)) OVER () for percentage-of-total. First appearance of nested aggregate-in-window pattern.
- **m32 debrief upgraded** — 2-sentence debrief → full treatment. Spend trajectory interpretation, MIN vs FIRST_VALUE distinction, ROW_NUMBER alternative, weak answer failure mode, follow-up question.
- **m33 debrief upgraded** — TC=2 → TC=4. CTE chain alternative, missing status-filter failure mode, line_item_total follow-up.

Files: `src/data/sqlLabProblems.js`, `SQL_QUALITY_AUDIT.md`, `SQL_LAB_PLAN.md`

---

## [4.65.0] — 2026-06-02 [CONTENT]

### SQL Quality Audit — Batch 6 (Medium m01–m10: m01, m04, m07, m09, m10, m13, m14, m16, m17, m20)

**Results:** 6/10 pass. 3 full rewrites + 1 checkValues bug fix.

- **m07 rewritten** — NOT IN anti-join (Di=2, pattern overused from Easy tier). Replaced with "Days to First Engagement" (Pinterest) — CTE + MIN(occurred_at) + JULIANDAY date arithmetic to compute days between join date and first interaction. First appearance of JULIANDAY date arithmetic in the audit. expectedRowCount: 13 (users 14/15 excluded by INNER JOIN). Fastest activating user: mike at 114 days.
- **m09 rewritten** — strftime + GROUP BY + ORDER BY only (DC=2, DR=2 — Easy-level SQL). Replaced with "Month-over-Month Order Volume" (Instacart) — CTE + strftime GROUP BY + LAG() OVER (ORDER BY order_month) for MoM change. Genuinely Medium: two concepts composed (date aggregation + window function). First month returns NULL for prev/change (LAG with no prior row). checkValue: 2024-01 (order_count=4, prev=2, mom_change=+2).
- **m13 checkValues fixed** — Empty checkValues[]. Added: account_id=1's latest transaction is txn 38 ($88.00, 2024-04-18).
- **m14 rewritten** — 3rd conditional aggregation in batch (Di=2). Replaced with "Content Rank Within Category" (Netflix) — CTE + DENSE_RANK() OVER (PARTITION BY category ORDER BY interaction_count DESC). Introduces DENSE_RANK with explicit PARTITION BY — distinct from m20's RANK() (no partition) and m13's ROW_NUMBER(). Content 1 (fitness) leads at 8 interactions.

**Medium tier window function coverage after Batch 6:** LAG (m01), SUM OVER (m16), RANK (m20), ROW_NUMBER (m13), DENSE_RANK+PARTITION BY (m14), MoM LAG (m09) — five distinct window functions covered in 10 problems.

Files: `src/data/sqlLabProblems.js`, `SQL_QUALITY_AUDIT.md`, `SQL_LAB_PLAN.md`

---

## [4.64.0] — 2026-06-02 [CONTENT]

### SQL Quality Audit — Batch 5 (file positions 41–50: e67–e86)

**Results:** 4/10 pass. 3 full rewrites + 2 debrief upgrades + 1 difficulty reclassification + 1 company tag fix.

- **e69 rewritten** — "Large-Value Orders" was `WHERE subtotal > 100` on a single table (DC=2, estimatedMin 3). Replaced with "Net Revenue on Discounted Orders" — arithmetic in SELECT (effective_price = subtotal − discount) + two-condition WHERE (status = 'completed' AND discount > 0). First appearance of computed column derivation as the primary technique.
- **e70 rewritten** — "Accounts by Currency" was single-aggregate `COUNT(*) GROUP BY currency` with no WHERE, DR=2. Replaced with "Active FX Exposure by Currency" (Revolut) — dual aggregate (COUNT + SUM) with WHERE status = 'active' pre-filter. Answers both capacity and dollar-exposure questions in one query.
- **e74 rewritten** — "Interactions per Content Item" was structurally identical to e08 (GROUP BY + COUNT + ORDER BY + LIMIT). Replaced with "Order Status Summary" (ASOS) — triple aggregate (COUNT + SUM + AVG with ROUND) in one GROUP BY. Standard finance analyst deliverable format, new pattern in Easy tier.
- **e77 company fix** — Doximity → Athenahealth (physician networking is wrong domain for clinical diagnosis query). Debrief also upgraded: subquery approach and LEFT JOIN zero-case variant documented.
- **e78 debrief upgraded** — TC 2→4. Added subquery alternative approach + LEFT JOIN variant for including zero-order channels.
- **e81 debrief upgraded** — TC 2→4. Added conditional aggregation approach (SUM(CASE WHEN resolved_at IS NULL THEN amount END)) for split reporting of resolved vs. unresolved disputed exposure.
- **e86 reclassified** — PERCENT_RANK() + CTE on Easy tier. DC=1. Reclassified to Medium (market rubric: any window function = Medium). Will be scored in a Medium batch audit.

**Easy tier skill coverage after 50 problems:** All core Easy patterns covered — anti-join (×2), HAVING, COUNT DISTINCT, BETWEEN, multi-column GROUP BY, AVG, SUM(computed), SUM(binary) rate, 3-table JOIN, COALESCE, IN literal, dual aggregate, scalar SUM, arithmetic in SELECT (derived column), triple aggregate, date range WHERE.

Files: `src/data/sqlLabProblems.js`, `SQL_QUALITY_AUDIT.md`, `SQL_LAB_PLAN.md`

---

## [4.63.0] — 2026-06-02 [CONTENT]

### SQL Quality Audit — Batch 4 (file positions 31–40: e52–e65)

**Results:** 4/10 pass. 4 full rewrites + 2 targeted fixes. Anti-join overload in Easy tier fully resolved.

- **e52 fix** — Empty checkValues[] bug corrected. First US order (order 1, alice@example.com) added as check value.
- **e55 rewritten** — 5th IS NULL filter problem. Replaced with "User Activity Report with NULL Fill" — introduces COALESCE for NULL display handling, first appearance in Easy tier.
- **e56 TC upgraded** — Good problem but TC=2. Debrief now documents the P2P NULL exclusion gap: INNER JOIN silently drops transactions where merchant_id IS NULL (P2P transfers), a real compliance blind spot. Two-CTE UNION ALL approach noted for production.
- **e57 rewritten** — Near-clone of e11 (both: products never ordered, LEFT JOIN IS NULL on ecomm). Replaced with "UK and Canadian Market Orders" — teaches WHERE IN with literal list, a new skill. IN vs. OR comparison documented.
- **e58 rewritten** — 5th anti-join problem. Replaced with "Power Users by Login Frequency" (HubSpot) — WHERE + GROUP BY + HAVING + JOIN in combination, teaches the full pre/post-aggregation filter pipeline.
- **e59 rewritten** — 6th anti-join, Di=1. Replaced with "High-Intent Engagement Signals" (Pinterest) — WHERE IN ('like', 'share') + GROUP BY + COUNT. Teaches IN literal list in a different context from e57.
- **e60 rewritten** — COUNT cluster. Replaced with "MRR by Plan Tier" (Baremetrics) — dual aggregate (SUM + COUNT) in one GROUP BY, first time this pattern appears.

**New skills introduced (Batch 4):** COALESCE, WHERE IN literal list, dual aggregate (SUM+COUNT in one GROUP BY).

**Easy tier anti-join count after Batch 4:** 2 (e01, e11) — down from 6 before this audit.

Files: `src/data/sqlLabProblems.js`, `SQL_QUALITY_AUDIT.md`, `SQL_LAB_PLAN.md`

---

## [4.62.0] — 2026-06-02 [CONTENT]

### SQL Quality Audit — Batch 3 (file positions 21–30: e35–e51)

**Results:** 4/10 pass. 4 full rewrites + 2 debrief upgrades.

- **e35 rewritten** — "Session Source Mix" (GROUP BY + COUNT, 5th such problem). Replaced with "Revenue by Product Category" (Shopify) — SUM(quantity × unit_price) across a JOIN, first time computed-column aggregation appears in Easy tier.
- **e40 rewritten** — "Appointments per Provider" (5th health datamart problem, GROUP BY COUNT clone). Replaced with "Total Balance per User" (Plaid, fintech) — SUM of account balances per user with active-status filter + JOIN.
- **e42 rewritten** — "Enterprise-Eligible Accounts" (single-table WHERE >= filter, estimatedMin 4). Replaced with "Large Account Plan Distribution" (Slack) — 3-table JOIN (accounts + subscriptions + plans) + multi-condition WHERE. Identifies which large accounts have expansion headroom.
- **e44 rewritten** — "Consumer Users by Country" (GROUP BY COUNT, vague framing). Replaced with "Premium Rate by Device OS" (Spotify) — SUM(binary)/COUNT rate calculation per device platform.
- **e47 debrief upgraded** — TC 2→4. Added LEFT JOIN vs. NOT EXISTS approaches for true churn detection (accounts with no subsequent active subscription).
- **e49 debrief upgraded** — TC 2→4. Added AVG vs. PERCENTILE_CONT(0.5) median note with SQL environment coverage (Postgres/BigQuery/Redshift support, SQLite workaround).

Files: `src/data/sqlLabProblems.js`, `SQL_QUALITY_AUDIT.md`, `SQL_LAB_PLAN.md`

---

## [4.61.0] — 2026-06-02 [CONTENT]

### SQL Quality Audit — Batch 2 (e11–e20, file positions 11–20)

**Results:** 3/10 pass. 7 rewritten (heaviest batch so far).

- **e13 (was sql-h16)** — ID mislabeled as Hard ('sql-h16') but filed with difficulty Easy. Fixed to 'sql-e13'. Company corrected from Doximity (physician networking) to CVS Health (pharmacy analytics — correct fit for prescription coverage days problem).
- **e20 rewritten** — "Tech Industry Accounts" was `WHERE industry = 'tech'` on a single table. Replaced with "High-Adoption Accounts" — teaches HAVING with JOIN (accounts with 3+ active users).
- **e23 upgraded** — "Verified Low-Risk Users" was `WHERE col1 = x AND col2 = y` with no JOIN. Upgraded with JOIN to accounts table + account status filter. New expectedRowCount: 8.
- **e26 rewritten** — Literal duplicate of e06 (same disputes table, same IS NULL filter, different company tag). Replaced with "Average Spend by Category" (Brex) — introduces AVG aggregate for the first time in Easy tier.
- **e29 rewritten** — "Providers Accepting New Patients" was a single boolean WHERE filter (estimatedMin: 3). Replaced with "Open Capacity by Clinic" — WHERE + GROUP BY + COUNT per clinic, teaches pre-filter-then-aggregate pattern.
- **e32 rewritten** — Part of 3-problem COUNT cluster. Replaced with "May Clinic Appointments" (Kaiser Permanente) — teaches BETWEEN date filtering with ISO format date strings, 3 approaches documented.
- **e34 rewritten** — Part of COUNT cluster. Replaced with "Premium Breakdown by Country" (LinkedIn) — teaches multi-column GROUP BY, a pattern used constantly in growth analytics.
- **e33 kept** — "Transactions by Category" (Mastercard). Kept despite being in the COUNT cluster because its insight quality is highest: shopping average distorted by flagged merchant transactions is a real analytical pitfall.

Files: `src/data/sqlLabProblems.js` (7 problems rewritten, 1 ID fixed), `SQL_QUALITY_AUDIT.md` (Batch 2 section added), `SQL_LAB_PLAN.md` (batch map updated)

---

## [4.60.0] — 2026-06-02 [CONTENT]

### SQL Quality Audit — Batch 1 (e01–e10, calibration batch)

First pass of the 13-batch SQL quality audit. Scored all 10 Easy problems on 7 rubric dimensions (Business Framing, Company Authenticity, Difficulty Calibration, Data Challenge Realism, Distinctiveness, Insight Quality, Trade-off Clarity). Created `SQL_QUALITY_AUDIT.md` as the cumulative audit artifact.

**Results:** 8/10 pass. 2 problems rewritten.

- **e07 rewritten** — "Disengaged Users" was structurally identical to e01 (anti-join LEFT JOIN IS NULL, different table names, same pattern). Replaced with "Repeat Launchers" (TikTok): HAVING clause, GROUP BY, retention segmentation. Teaches a distinct and commonly-tested concept. Distinctiveness: 2 → 5.
- **e10 rewritten** — "Most Prescribed Drug" was structurally identical to e08 (GROUP BY + COUNT + ORDER BY + LIMIT 1, different table). Replaced with "Geographic Patient Reach" (Optum): COUNT(DISTINCT) across a 3-table bridge join. Distinctiveness: 2 → 5.

**Calibration findings logged in SQL_QUALITY_AUDIT.md:** company authenticity scored on business framing fit (not schema ownership); e03/e04/e05 structural proximity flagged for cross-batch review after Batch 3.

Files: `src/data/sqlLabProblems.js` (e07, e10 replaced), `SQL_QUALITY_AUDIT.md` (created)

---

## [4.59.0] — 2026-06-02 [FEATURE]

### Profile page

New `/profile` page accessible by clicking the avatar chip in the sidebar.

**Identity card:** OAuth avatar image (Google/GitHub) or initials fallback. Display name from OAuth metadata. Email. Provider badge (Google / GitHub / Email). Member since date.

**Practice stats:** Cases completed (computed live from all room localStorage keys), rooms active, bookmark count, per-room breakdown chips.

**Cross-device sync:** Manual "Sync now" button that calls `pushProgressToSupabase` + `pullProgressFromSupabase`. Visual feedback: idle → syncing → synced / error, auto-resets after 3s.

**Study plans:** Defense Strategy plan (step count + "Open plan" link) and SQL Study Plan (goal label + daily target + "Open SQL Lab" link). Empty states with "Build one" / "Set one up" prompts.

**Saved cases:** Last 4 bookmarks (most recent first) with room label and difficulty badge. "View all" link to `/bookmarks`.

**Settings:** Theme toggle (light/dark). Export progress (JSON download of all 26 localStorage keys). Import progress (JSON upload + reload).

**Not-signed-in state:** Clean prompt with sign-in CTA, no broken sections.

**Sidebar:** Avatar chip redesigned — shows OAuth avatar image when available (Google/GitHub), display name from metadata when present, navigates to `/profile` on click.

Files: `src/pages/ProfilePage.jsx` (new, 280 lines), `src/App.jsx` (lazy import + route), `src/components/layout/Sidebar.jsx` (avatar chip)

---

## [4.58.0] — 2026-06-02 [CONTENT + FIX]

### Review Room expansion (S19–S25) + Statefulness fix

**Review Room — 7 new scenarios (18 → 25):**
- S19 (srm): "Compliance Window" — Vanta B2B SaaS. Corporate accounts silently excluded by spam filters. Trap: ships on p=0.02 without running SRM check.
- S20 (novelty_peeking): "The Decaying Summary" — Loom. +18.4pp Week 1 → +4.3pp Week 3. Trap: ships on 3-week blended average without plotting weekly decay.
- S21 (hte_subgroups): "The Empty Suggestion Panel" — Figma. Enterprise +19.2pp, Starter -2.1pp. Trap: ships to all on overall p=0.03 without segmenting by design system presence.
- S22 (guardrail_breach): "The Habit Erosion" — Duolingo. D30 retention +4.2pp but lesson completion -8.2pp, breaching guardrail. D60 retention only +0.9pp.
- S23 (multiple_testing): "The Eight-Metric Dashboard" — Airbnb. 8 metrics, 3 hit p<0.05. Expected false positives: 0.4. None survive Bonferroni. Primary metric (first booking) never passed.
- S24 (multiple_testing): "The Pre-Spec Drift" — Pinterest. Primary passes; 2 of 3 pre-specified secondaries don't. Team pivots to post-hoc segments.
- S25 (hte_subgroups): "The Long-Form Trap" — Spotify. Podcast discovery feature shows strong positive effect in free tier, negative in premium. Trap: ships on blended average.

**Coverage after this version:** SRM×2, novelty_peeking×2, hte_subgroups×3, guardrail_breach×2, multiple_testing×3. All 5 thin families closed.

**Statefulness fix:** `exp-lab-progress-v1` (Review Room's localStorage key, defined in `src/utils/progress.js`) was missing from `PROGRESS_KEYS` in `syncProgress.js`. Review Room completions were never syncing to Supabase. Added. All rooms now sync.

Files touched: `src/data/scenarios.js`, `src/utils/syncProgress.js`, `BRAIN_TRANSFER.md`, `NEXT.md`, `CHANGELOG.md`

---

## [4.57.0] — 2026-06-02 [AUTH]

### Google OAuth + GitHub OAuth live

- `AuthModal.jsx` redesigned: replaced fake "G" circle with real Google multicolor SVG, added GitHub button with real SVG icon. Both use `var(--surface-2)` / `var(--text)` — correct in light and dark mode.
- `signInWithGitHub()` added to `auth.js`. Both OAuth providers pass `redirectTo: window.location.origin` so post-auth redirect lands on correct URL.
- E2E tested on production: email magic link ✅, Google ✅, GitHub ✅.
- Google consent screen published (app name propagating from Supabase URL → "Product Analytics Lab").

Files touched: `src/components/auth/AuthModal.jsx`, `src/utils/auth.js`

---

## [4.56.0] — 2026-06-02 [AUTH + ARCHITECTURE]

### Supabase auth complete — Audit #104 resolved

- Fixed PROGRESS_KEYS drift: 6 wrong key names corrected, 9 missing keys added, dynamic `pd-progress-*` prefix handling for Product Design added via `DYNAMIC_PREFIXES` scan.
- Sign-in button added to Sidebar bottom (`src/components/layout/Sidebar.jsx`).
- `emailRedirectTo: window.location.origin` added to magic link flow so auth redirects land on the correct URL in production.
- `.env.local` created with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.
- E2E tested: sign-in works, user appears in Supabase Users table, progress push/pull confirmed.
- Audit #104 resolved.

Files touched: `src/utils/syncProgress.js`, `src/utils/auth.js`, `src/components/layout/Sidebar.jsx`, `.env.local`

---

## [4.55.0] — 2026-06-02 [CONTENT + BUILD]

### Debrief Failure Mode Pass — All Remaining Rooms + 3 Audits Resolved

**Debrief failure mode pass — 5 rooms completed:**
- Instrumentation (12 cases): `failureMode: { weakAnswer, interviewerFollowUp }` added to all inst01–inst12. InstrumentationRunner updated to render after leadershipNote.
- Behavioral (30 questions): `failureMode` added to all BEH01–BEH30. BehavioralRunner updated to render after antiPatterns.
- Estimation (30 problems): `failureMode` added to all EST01–EST30. EstimationRunner updated to render after commonMistakes.
- Design (8 scenarios): `seniorDesign.failureMode` added to D01–D08. DesignDebriefPanel updated to render after commonMistakes.
- Spot the Flaw (12 cases): Failure mode embedded inline at end of each `flaw` field. No runner change needed.
- Total: 184 cases across all 10 practice rooms now have failure mode content (previously 0 rooms outside RCA/Metrics/Stats).

**Audit #100 resolved — Imperative DOM mutations replaced:**
BIRunner.jsx: `beginHovered`, `revealHovered`, `nextHovered` useState replacing `e.currentTarget.style` opacity mutations.
GrowthAnalyticsRunner.jsx: `revealHovered`, `exportHovered` useState replacing border/color mutations.
MetricDebriefPanel, RCADebriefPanel, CaseDebriefPanel: already used useState — confirmed clean.

**Audit #99 resolved — key props verified:**
Swept MetricChoicePanel, MetricDebriefPanel, RCAFoundationsRunner, ChallengesRunner. All `.map()` calls already had correct key props. No changes needed.

**Audit #91 resolved — empty state quality pass:**
- MCQ Trainer (Trainer.jsx): Past sessions panel added. Empty state: "No practice sessions yet. Run a drill to see your skill breakdown by category." With data: shows last 3 sessions (score, category filter, relative timestamp).
- Progress.jsx: Zero-state fixed — CTA now routes to `stat-foundations` with correct copy. Previously routed to `growth-analytics`.
- BookmarksBrowser + LockOverlay: confirmed already had correct empty states.

**Build:** ✓ 821 modules transformed, 0 errors.
**Files:** 5 data files, 5 runner components, DesignDebriefPanel.jsx, Trainer.jsx, Progress.jsx.

---

## [4.54.0] — 2026-06-02 [CONTENT]

### Debrief Failure Mode Pass + Review Room Expansion + Session Protocol Rewrite

**Debrief failure mode pass — 3 rooms:**
- Cases (20 cases, C01–C22): Weak answer + interviewer follow-up embedded inline at end of `seniorAnswer.interviewPhrase`. No runner change needed.
- BI (16 cases, BI01–BI16): `failureMode: { weakAnswer, interviewerFollowUp }` added. BIRunner updated to render red-bordered "Failure Mode" section after Leadership Lens. Chart cases BI17–BI23 skipped (different format).
- Growth Analytics (8 cases, GA01–GA08): Same `failureMode` pattern. GrowthAnalyticsRunner updated.

**Review Room expansion — 6 new scenarios (12 → 18 total):**
- S13: cuped_variance — CUPED at r=0.21 gives 4.4% variance reduction; p-value shift from 0.08→0.02 is a technicality, not signal.
- S14: right_censored — 7-day window captures ~15% of eventual annual conversions; cannot distinguish acceleration from net-new.
- S15: multi_touch — 71% of treatment purchasers also received lifecycle emails; last-click overstates retargeting contribution by ~2.5x.
- S16: b2b_constraints — 35% statistical power at n=65 accounts; p=0.09 is not evidence of no effect — standard A/B is wrong design for B2B.
- S17: geo_holdout — Control driver earnings fell 6.2% vs baseline — SUTVA signature; user-level randomization invalid.
- S18: switchback — No washout between weekly alternations; day-1–2 lift (+6.8%) vs day-5–7 lift (+18.1%) confirms carryover.

**Session protocol rewrite:**
BRAIN_TRANSFER.md, SESSION_KICKOFF.md, SPINE_PROTOCOL.md rewritten for token efficiency. SESSION_STARTER.md created as paste-ready session template. Key change: "read BRAIN_TRANSFER.md only at session open" replaces "read all MDs" instruction.

**Build:** ✓ 821 modules transformed, 0 errors.
**Files:** businessCases.js, biCases.js, growthAnalyticsCases.js, scenarios.js, BIRunner.jsx, GrowthAnalyticsRunner.jsx, 4 spine MD files.

---

## [4.49.0] — 2026-06-02 [FEATURE + ARCHITECTURE]

### Shareable Score Summary Card + Tier 5-6 Restructuring

**Shareable score summary card — `src/pages/InterviewSimulator.jsx`:**
Added gradient card in debrief showing session score with "Copy Score" button. Card displays:
- Total score (MCQ mode) or "Complete" (open-ended)
- Session config (length, role, time)
- One-click clipboard copy for LinkedIn/resume sharing
- Format: "PAL: 18/20 · 90% · Product Analyst (Senior) · 45:32"

**Tier 5-6 Architecture restructuring — `IDEAS.md`:**
Reorganized Tier 2-4 into new strategic clusters (Tier 5A-5F) based on ROI (impact ÷ effort × dependencies):
- **5A** — Interview Prep Acceleration (Defense layers, Quiz articles, verbal practice)
- **5B** — Code Execution + Timing (SQL playground, hybrid Lab, timed exams)
- **5C** — Feedback Loops (learning paths, weak heatmaps, forward pointers)
- **5D** — Content Organization (Deep Dives IA, Interview Experiences tab)
- **5E** — UX Polish (room map, difficulty badges, keyboard shortcuts, export/import)
- **5F** — Sharing (share buttons + routing, clipboard score share)
- **Tier 6** — Long-term strategic (India tracks, SVG illustrations, PWA, interview Q&A bank, failure catalog)

**Hard prerequisites tracked in Tier 6** for gates requiring PostHog data, user signal, or strategic decisions (Supabase auth, paywall flip).

**Build:** ✓ 0 errors. Gradient card responsive, clipboard API fallback present.
**Files:** InterviewSimulator.jsx modified (~40 lines), IDEAS.md restructured (120 lines added).

---

## [4.48.0] — 2026-06-02 [FEATURE]

### Interview Simulator Per-Room Breakdown Chart (Tier 2)

**Per-room skill breakdown in debrief — `src/pages/InterviewSimulator.jsx`:**
Added recharts BarChart showing % correct by skill/room in MCQ and mixed-mode sessions. Chart appears in debrief header (after session config summary, before individual case cards) only when session includes MCQ questions. Calculation: for each room in the session, count total questions and correct answers, compute percentage, display in vertical bar chart with room name on X-axis, % on Y-axis.

**Example breakdown for Product Analyst (MCQ mode):**
- Metrics: 95% (2/2 correct)
- Statistics: 67% (2/3 correct)
- RCA: 100% (1/1 correct)
- Estimation: 50% (1/2 correct)

**Benefits:** Shows clearer skill-level signal than summary score alone. Users identify weak rooms immediately, actionable for next session prep. Works for all 4 roles (Product Analyst, Business Analyst, Data Analyst, PM).

**Build:** ✓ 0 errors. recharts already in dependencies. Responsive container scales on mobile.
**Files:** 1 modified file (InterviewSimulator.jsx, ~60 lines added).

---

## [4.47.0] — 2026-06-02 [FEATURE]

### BI Chart Interpretation Scenarios

**New chart-format cases (7 scenarios, BI17–BI23) — `src/data/biCases.js`:**
Added visual chart interpretation scenarios to the BI room. Each scenario displays an interactive recharts visualization with a deceptive or misleading pattern, asks the user to identify the issue, and reveals the model answer + key insights. Cases cover common BI pitfalls:
- BI17: Misleading y-axis scaling (data is flat, chart zooms in to exaggerate noise)
- BI18: Simpson's Paradox (aggregate declines while every segment improves due to mix shift)
- BI19: Dual-axis deception (independent y-axis scaling creates false correlation)
- BI20: Cherry-picked time window (3-month recovery masks year-long decline)
- BI21: Aggregation hiding divergence (power users churn masked by new user acquisition)
- BI22: Missing seasonal baseline (15% growth is 98% seasonality)
- BI23: Omitted zero baseline (bar chart amplifies small differences)

**New ChartScenario component — `src/components/bi/ChartScenario.jsx`:**
Renders chart visualization (LineChart, BarChart, AreaChart, ComposedChart via recharts), displays multiple-choice question, reveals model answer + key insights, tracks confidence rating. Integrates with existing BIRunner and saves progress via `saveBIProgress`.

**Modified BIRunner — `src/components/bi/BIRunner.jsx`:**
Added format detection: cases with `format: 'chart'` route directly to ChartScenario (skips work/textarea screen). Chart cases flow: situation → chart interaction → complete. Text cases flow unchanged: situation → work/textarea → reveal.

**Build:** ✓ 0 errors. biCases.js PASS. Chart rendering tested with recharts (already in dependencies).
**Files:** 1 new component, 1 modified runner, 1 extended data file. Total new content: 7 chart scenarios + 100 lines of component code.

---

## [4.46.0] — 2026-06-02 [FEATURE + CONTENT]

### SQL Lab Phase 3 + Foundation Rewrites + Emoji Pass + Debrief Failure Modes

**SQL Lab Phase 3 (`src/pages/SqlLabPage.jsx`, `src/pages/Progress.jsx`):**
- Company/datamart filter chip added to ProblemSidebar — chips per datamartId, active in teal, with counts
- PostHog events wired: `sql_problem_solved` (payload: problemId, difficulty, datamartId, elapsedSec), `sql_hint_used` (hintIndex), `sql_answer_revealed`
- New localStorage key `pal-sql-lab-dates-v1` (date→solve count) written on each correct solve
- Progress.jsx heatmap now includes SQL Lab solve dates — SQL Lab practice appears in the heatmap and streak counter
- Hints quality spot-check: all 130 problems reviewed, no misleading hints found

**Foundation rewrites — situation-first keyInsight (4 files, 65 modules total):**
All `keyInsight` fields rewritten to open with a concrete human business situation before any framework language. "Your PM pings you: DAU dropped 18% overnight. You have two hours..." not "RCA follows a four-layer hypothesis tree."
- `src/data/rcaFoundationModules.js` — 12 modules (rf01–rf12) rewritten
- `src/data/metricsFoundationModules.js` — 13 modules (mf01–mf13) rewritten
- `src/data/expFoundationModules.js` — 15 modules (ef01–ef15) rewritten
- `src/data/statsFoundationsModules.js` — 32 modules (sf01–sf32) rewritten. All validate-data.js checks: PASS.

**Emoji removal + Simulator layout (audit #80, #82):**
Removed UI-chrome emojis from: BIBrowser, ChallengesBrowser, Trainer, SqlLabPage (Challenge Vault label), ConsultationSpace, Progress, DefenseDocGenerator, CodeBrowser, ExpFoundationsBrowser, SearchPage, CompanyTracks. InterviewSimulator config screen redesigned: role cards tighter grid, compact chip selectors, no bouncy hover, reduced max-width.

**Case debrief failure mode pass (audit #86, 60 cases):**
Every debrief in rcaCases.js (24 cases), metricCases.js (16 cases), statsModules.js (20 modules) now ends with: **Weak answer pattern** (case-specific, not generic) + **Interviewer follow-up that exposes it** (exact probe question tied to the case data).

**Build:** ✓ 0 errors in ~1s. validate-data.js: all target files PASS.
**Audits resolved:** #80 (emoji removal), #82 (Simulator layout), #86 (debrief failure modes), #141 (foundations vetting — completed via rewrites)

---

## [4.45.0] — 2026-06-02 [FEATURE]

### Difficulty Filter Chips + About Page Rewrite + Beginner Onboarding + Foundation Nudges

**Difficulty taxonomy normalization (`src/data/`):**
All room data files now use a consistent difficulty taxonomy: `analyst / senior / staff`. Previously inconsistent values normalized across 6 files: `takehomeCases.js` (Any level→analyst, Mid-level→senior), `prioritizationScenarios.js` (capitalized→lowercase), `productDesignScenarios.js` (hard→staff, medium→senior), `businessCases.js` (advanced→staff), `behavioralQuestions.js` (mid→analyst, Mid-level→analyst, Senior→senior), `estimationProblems.js` (Analyst/Senior/Staff→lowercase), `challengesCases.js` (capitalized→lowercase).

**DifficultyChips shared component (`src/components/shared/DifficultyChips.jsx`):**
New reusable filter chip bar. Accepts `value`, `onChange`, `counts` props. Auto-hides tiers with 0 cases. Handles `junior` as alias for `analyst`. Used across all room browsers.

**Difficulty filter chips added to all room browsers:**
Agent-assisted: MetricsBrowser, GrowthAnalyticsBrowser, BIBrowser, InstrumentationBrowser, SpotTheFlawBrowser, CasesBrowser, DesignBrowser, ProductDesignBrowser, TakehomeBrowser, CodeBrowser, RCABrowser. Manual: PrioritizationBrowser (added DifficultyChips + diffFilter state). Config updated: BehavioralBrowser (DIFFICULTY_COLOR aligned to new taxonomy), EstimationBrowser (DIFFICULTY_COLOR + ORDER aligned).

**About.jsx — full rewrite:**
Previous page was V2-era (referenced "six rooms", "data scientists", stale build history). Rewritten to reflect current state: 17 rooms, 130 SQL problems, Foundation modules, difficulty levels, how to use PAL by experience level, how it differs from DataLemur/StrataScratch/Exponent, technical details.

**Home.jsx — beginner onboarding track:**
New teal card shown only on first visit (visitedRooms.length === 0): "New to product analytics? Start here →" with 4-step path: Stat Foundations → RCA Foundations → Stats Room → Defense Strategy.

**Foundation nudges added:**
DesignBrowser and ScenarioBrowser (Review Room) now show "Recommended starting point: Exp Foundations" nudge, consistent with existing nudges in Stats/RCA/Metrics/Cases/Growth/STF browsers. Both received `onNavigate` prop wired from App.jsx.

**Build:** ✓ 0 errors in 1.30s.
**Files:** `src/components/shared/DifficultyChips.jsx` (new), `src/pages/About.jsx`, `src/pages/Home.jsx`, `src/App.jsx`, all room browser pages, all room data files listed above.

---

## [4.44.0] — 2026-05-31 [DATA]

### Foundation Module Data Canonicalization (Audit #96)

Canonicalized all stub entries across the three foundation room data files. No new modules added — existing stubs brought up to full spec.

**`src/data/rcaFoundationModules.js`** — rf07–rf12 (6 stubs):
- `difficulty` casing fixed: `'intermediate'` → `'Intermediate'`, `'advanced'` → `'Advanced'`
- `devNote` field removed from all 6 entries
- `playbookLinks` added to all 6 entries (2 links each, pointing to relevant playbook topics)
- `connection` text refined for rf07, rf08, rf09, rf11, rf12 to be sharper and more specific to experiment analysis context
- Header comment updated from "6 modules" to "12 modules"

**`src/data/metricsFoundationModules.js`** — mf09–mf13 (5 stubs):
- `difficulty` casing fixed: `'intermediate'` → `'Intermediate'`, `'advanced'` → `'Advanced'`
- `devNote` field removed from all 5 entries
- `playbookLinks` added to all 5 entries (2 links each)
- Header comment updated from "8 modules" to "13 modules"

**`src/data/expFoundationModules.js`** — ef08–ef15 (8 stubs):
- `difficulty` casing fixed: `'intermediate'` → `'Intermediate'`, `'advanced'` → `'Advanced'`
- `devNote` field removed from all 8 entries
- `playbookLinks` added to all 8 entries (2 links each)

**Build:** ✓ 0 errors. `devNote` grep: clean across all 3 files.
**Audit:** #96 marked ✅ resolved.
**Files:** `src/data/rcaFoundationModules.js`, `src/data/metricsFoundationModules.js`, `src/data/expFoundationModules.js`, `AUDITS.md`, `CHANGELOG.md`, `NEXT.md`

---

## [4.43.0] — 2026-05-31 [FEATURE]

### SQL Lab — Session 6: Nav Integration + UX Fixes + Hints System + Timer + Progress Section

**Nav integration:**
SQL Lab added to `Sidebar.jsx` analytics subgroup (after Code Lab). `getIsActive()` extended with `sql-lab` mapping. `q` keyboard shortcut unchanged. The "internal preview" badge removed from the page header.

**UX fixes (`SqlLabPage.jsx`):**
- Company logos switched from Clearbit to Google Favicon API (`https://www.google.com/s2/favicons?domain=...&sz=32`) — both the sidebar list and the problem card
- Schema accordion `maxHeight` raised from `90px` to `200px` — visible for large datamarts (hr_analytics has 5 tables)
- Difficulty filter chips extended to include Master tier (previously only All/Easy/Medium/Hard)
- When Master filter is active, Challenge Vault section is hidden (Master problems already shown in main list)
- Sort enforcement: `SORTED_PROBLEMS` constant sorts all 130 problems by `DIFF_ORDER` ({Easy:0, Medium:1, Hard:2, Master:3}) at module load time; component uses this instead of raw `sqlLabProblems`
- Progress bar and solved count now track all 130 problems including Master (previously excluded Master from denominator)

**Hints system (`sqlLabProblems.js` + `SqlLabPage.jsx`):**
- `add_hints.py` script authored and ran: adds `hints: [...]` array to all 130 problems
- Difficulty-scaled hint count: Easy → 1 hint, Medium → 2 hints, Hard → 5 hints, Master → 5 hints
- Hints generated from solution analysis: shape hint (output row count + columns), pattern hint (window function / CTE / date / exclusion / etc.), decomposition hint, edge-case hint, validate hint
- Show Answer button replaced with progressive hint flow: "Hint N of M" button reveals one hint at a time
- After all hints exhausted, Show Answer unlocks (still requires ≥50 chars in textarea)
- Hints rendered as teal-bordered cards below the editor buttons

**Per-problem timer (`SqlLabPage.jsx`):**
- Timer starts on first keystroke in textarea (zero-overhead until user types)
- Live display in problem card footer: `⏱ 0:42 elapsed` replaces the `~X min` estimate while active
- On correct solve, elapsed seconds saved to `pal-sql-lab-times-v1` localStorage (keyed by problem ID)
- Timer resets on problem navigation
- State: `timerRef` (setInterval handle), `timerStartRef` (start timestamp), `elapsedSec` (displayed)

**Progress.jsx SQL section:**
- `sqlLabProblems` imported; `sqlSolved` and `sqlTimes` read from localStorage at render
- SQL Lab added to `allRoomProgress` array (appears in Overview readiness bars + reset button)
- New SQL Lab SectionCard between Room Progress and Settings: shows total solved / 130, total practice time in minutes, per-difficulty breakdown (Easy/Medium/Hard/Master with individual progress bars), "Open SQL Lab →" nav button

**Files changed:** `src/components/layout/Sidebar.jsx`, `src/pages/SqlLabPage.jsx`, `src/data/sqlLabProblems.js`, `src/pages/Progress.jsx`

**Validate:** sqlLabProblems.js PASS. Vite build: ✓ 0 errors. 5/5 spot checks passed.

---

## [4.42.0] — 2026-05-31 [CONTENT]

### SQL Lab — Sessions 4 + 5: 7 New Datamarts + 130-Problem Target

**Session 4 — Schema Design (7 new datamarts):**
Added gaming, logistics, marketplace, food_delivery, social_network, edtech, hr_analytics to `sqlLabDatamarts.js`. Each datamart has 3–5 tables with deliberate seed data engineered to support the 8 gap SQL patterns (date spine, ROWS BETWEEN, PERCENT_RANK/CUME_DIST, two valid queries, ambiguous definition, syntactically valid but wrong, recursive CTE, full cohort retention). social_network.users.referred_by_user_id and hr_analytics.employees.manager_emp_id both support recursive CTE hierarchy traversal.

**Session 5 — Problem Authoring (reach 130 target):**
Culled 91 problems (33E/45M/13H) from 211 → 120. Added 10 new gap-pattern problems (1E/3M/4H/2Master). Final count: 50E/40M/25H/15Master = 130.

New problems:
- sql-e86: PERCENT_RANK (gaming) — level engagement percentile
- sql-m76: PERCENT_RANK (hr_analytics) — salary pay-equity ranking
- sql-m77: COUNT DISTINCT trap (marketplace) — unique buyer reach per seller
- sql-m78: Syntactically valid but wrong (food_delivery) — courier delivery count debug
- sql-h51: Date spine (logistics) — February 2024 daily shipment calendar with recursive CTE
- sql-h52: ROWS BETWEEN (gaming) — rolling 3-attempt average score
- sql-h53: Two valid queries (food_delivery) — courier workload vs delivery output
- sql-h54: Ambiguous definition (hr_analytics) — headcount with total vs active split
- sql-master26: Recursive CTE (social_network) — full referral tree walk from user 1
- sql-master27: Full cohort retention (gaming) — signup cohort retention curve

Also fixed: double-comma syntax error at health/gaming boundary in sqlLabDatamarts.js introduced by session4 append script.

**Files changed:** `src/data/sqlLabDatamarts.js`, `src/data/sqlLabProblems.js`

**Validate:** sqlLabProblems.js PASS. Vite build: ✓ 0 errors.

---

## [4.41.0] — 2026-05-31 [CONTENT]

### SQL Lab — Session 3: Stakeholder-Request Prompt + Debrief Rewrites

Rewrote prompts and debriefs for all 74 conversion candidates identified in Session 2. No structural changes — `expectedColumns`, `expectedRowCount`, `checkValues`, and `solution` fields untouched.

**Scope:**
- 16 Easy prompts: natural stakeholder voice, removed explicit column specs
- 33 Medium prompts + debriefs: removed technique names and prescribed output formulas; 5-section debrief structure applied
- 17 Hard prompts + debriefs: pure business question framing, zero SQL scaffolding; 5-section debrief
- 8 Master prompts + debriefs: 2–3 sentence business question only; debrief covers CTE architecture, scoring rule derivation, threshold decisions

**5-section debrief format applied to all 57 Medium/Hard/Master rewrites:**
1. What the stakeholder wants
2. Ambiguities resolved
3. SQL approach
4. What weak SQL looks like
5. Interviewer follow-up

**Bug found and fixed:** Python regex replacement interprets `\n` in replacement strings as literal newlines — single-quoted JS strings cannot span lines. Fixed by post-processing all debrief fields with a character-by-character scanner that converts actual newlines to `\n` escape sequences. 58 fields corrected total.

validate-data.js: PASS (sqlLabProblems.js). Vite build: ✓ 0 errors.
6/6 spot checks passed (m39, m57, h01, h32, master01, master08 — prompts correct in file).

**Files:** `src/data/sqlLabProblems.js`, `NEXT.md`, `AUDITS.md`, `CHANGELOG.md`, `SQL_LAB_PLAN.md`

---

## [4.40.0] — 2026-05-31 [CONTENT / FIX]

### SQL Lab — Session 1: Cull 39 duplicates, reclassify 27 problems, fix master10 bug

Executed all three steps from the Session 1 investigative findings (SQL_LAB_PLAN.md).

**Step A — Cull (39 problems removed):**
- Easy (20): e27, e38, e41, e63, e75, e76, e79, e86–e96, e98, e99 — duplicate GROUP BY COUNT / WHERE / top-N skeletons
- Medium (11): m27, m38, m44, m50, m55, m59, m63, m65, m67, m68, m69 — Easy-level problems mislabeled Medium, or duplicate CTEs
- Hard (3): h36 (dup of h28), h43 (Easy mislabeled Hard), h46 (dup of h29)
- Master (5): master15, master17, master20, master22, master24 — Medium-level problems mislabeled Master

**Step B — Reclassify (27 problems, difficulty field only — no prompt/debrief edits):**
- Hard → Easy (2): h16 (SUM arithmetic GROUP BY), h23 (NOT IN anti-join)
- Hard → Medium (18): h14, h19, h20, h22, h25–h30, h35, h37, h39, h40, h44, h47, h49, h50 (single window functions, basic CTEs, multi-column GROUP BY)
- Master → Hard (7): master06, master07, master11, master13, master16, master21, master23 (Medium-complexity multi-step, not Master caliber)

**Step C — Bug fix:**
- master10 solution: `GROUP BY a.user_id\)` → `GROUP BY a.user_id\n)` (CTE closing paren syntax)

**Post-execution counts:**
| Tier | Before | After |
|---|---|---|
| Easy | 100 | 82 |
| Medium | 75 | 82 |
| Hard | 50 | 34 |
| Master | 25 | 13 |
| **Total** | **250** | **211** |

validate-data.js: PASS (sqlLabProblems.js). Vite build: ✓ 0 errors.
15/15 spot checks passed (survivors intact, culled absent, reclassified correct, bug fixed).

**Files:** `src/data/sqlLabProblems.js`, `NEXT.md`, `AUDITS.md`, `CHANGELOG.md`, `SQL_LAB_PLAN.md`

---

## [4.39.11-analysis] — 2026-05-31 [AUDIT / PLANNING — no code changes]

### SQL Lab full investigative audit + overhaul plan finalized

**What happened:**
Full read-through of all 250 SQL Lab problems (h01–h50, all 25 Master, e13–e100, m01–m75). No code changes — findings only. Market research conducted on LeetCode, DataLemur, StrataScratch to anchor the difficulty rubric to real-world standards.

**Critical finding — difficulty rubric was self-invented:**
The original bank classified basic window functions (RANK, NTILE, SUM OVER) as Hard and anti-joins (NOT IN, LEFT JOIN IS NULL) as Medium. Market benchmark contradicts this: window functions = Medium on DataLemur/StrataScratch; anti-joins = Easy on LeetCode (183 is explicitly Easy). This error propagated through the entire Hard tier.

**Cull list — 39 duplicate-skeleton problems:**
- Easy (20): e27, e38, e41, e63, e75, e76, e79, e86–e96, e98, e99
- Medium (11): m27, m38, m44, m50, m55, m59, m63, m65, m67, m68, m69
- Hard (3): h36, h43, h46
- Master (5): master15, master17, master20, master22, master24

**Reclassification — 27 problems:**
- h16, h23 → Easy (from Hard)
- h14, h19, h20, h22, h25–h30, h35, h37, h39, h40, h44, h47, h49, h50 → Medium (from Hard)
- master06, master07, master11, master13, master16, master21, master23 → Hard (from Master)

**Gap list — 8 missing SQL patterns:**
Date spine, ROWS BETWEEN, PERCENT_RANK/CUME_DIST, two-query-different-results, ambiguous-definition, semantically-wrong-SQL, recursive CTE, full cohort retention.

**Architecture decisions finalized:**
- Target problem count: 130 (50E/40M/25H/15Master) — down from 250
- Target datamart count: 12 (5 existing + 7 new: gaming, logistics, marketplace, food_delivery, social_network, edtech, hr_analytics)
- Master schemas: standalone, never shared
- Session order: Sessions 2–3 (prompt rewrites) → Session 4 (schema design) → Session 5 (new problems) → Session 6 (phase 2 features)

**Outputs:**
- `SQL_LAB_PLAN.md` created — comprehensive single source of truth
- `NEXT.md` updated — 6-session sequence with full detail
- `DECISIONS.md` updated — rubric, target counts, sequencing rules added
- `AUDITS.md` updated — audits #130–134 added

**Files:** `SQL_LAB_PLAN.md` (created), `NEXT.md`, `DECISIONS.md`, `AUDITS.md`, `CHANGELOG.md`

---

## [4.39.11] — 2026-05-31 [FEATURE / VISUAL]

### SQL Lab expected output sample rows + Progress 52-week heatmap

**SQL Lab — Expected output sample rows (`SqlLabPage.jsx`)**

After `initDb()` finishes inserting all seed rows, the solution query now runs silently before `setDb()` fires. First 3 rows are stored in `expectedSample` state; the Expected Output panel renders them as a compact read-only table (teal column headers, muted cell values, "+N more rows" footer if `expectedRowCount > 3`). While the engine loads, the panel shows column chips + row count only, then the table appears once `expectedSample` is set. If the solution throws (malformed SQL), `expectedSample` stays null and the panel degrades gracefully to chip-only view.

State lifecycle: `expectedSample` resets to `null` at the top of each problem-change useEffect alongside all other state resets, ensuring stale rows from a previous problem never flash.

**Progress page — 52-week heatmap**

Replaced the 13-week (91-day, 7×7px cell) heatmap with a GitHub-style full-year grid:
- Loop: `i = 363 → 0` (364 days)
- Grid: `repeat(52, 10px)` columns × `repeat(7, 10px)` rows, `gridAutoFlow: column`, `gap: 2px`, `width: max-content` inside an `overflowX: auto` wrapper
- Cell: `10×10px`, `borderRadius: 2px` — larger than before, more readable at full year
- Streak window: extended to 364 days (was 91)
- Label: "Last 13 weeks" → "Last year"

**Files:** `src/pages/SqlLabPage.jsx`, `src/pages/Progress.jsx`, `NEXT.md`, `CHANGELOG.md`, `AUDITS.md`

---

## [4.39.10] — 2026-05-31 [FEATURE / VISUAL]

### SQL Lab visual vibrancy pass + schema space reduction + expected output (partial)

Full visual audit and upgrade of SQL Lab to match Stat Foundations vibrancy level:
- Teal `<>` icon box (28×28, solid var(--teal) background, white bold text) in header
- `SQL Lab` title in `var(--teal)` fontWeight 700
- Active problem button: teal title text, teal left border (3px solid), teal-tinted background
- Solved count in `var(--teal)`, progress bar height increased to 6px
- Difficulty-colored left border on problem card (3px, matches difficulty color)
- Editor border: `rgba(20,184,166,0.3)` teal tint
- Problem sidebar panel: `var(--surface)` background, `1px solid var(--border)` left edge
- Schema accordion: `maxHeight` reduced from `45vh` → `160px` (compact scrollable)
- Expected output panel added: shows column names as teal monospace chips + row count. Sample rows pending (delivered in V4.39.11).

**Files:** `src/pages/SqlLabPage.jsx`, `src/index.css`

---

## [4.39.8] — 2026-05-31 [FIX]

### SQL Lab independent scroll — definitive fix via two `position: fixed` panels

After 7 failed attempts using flex-height chains, the scroll was fixed by treating the two panels as completely independent viewport-anchored elements:

- `.sql-lab-main-panel` — `position: fixed; top: 0; bottom: 0; left: var(--sidebar-w); right: 272px` — contains header (flexShrink 0) + inner scrollable div (flex 1, overflowY auto)
- `.sql-lab-problem-panel` — `position: fixed; top: 0; bottom: 0; right: 0; width: 272px; overflow-y: auto`
- `document.body.style.overflow = 'hidden'` via useEffect (cleanup restores `''`) — prevents body from intercepting scroll events
- `sql-lab-mode` class on `.app-layout` — sets `height: 100vh; overflow: hidden` on `.app-main-wrapper`

These panels have no shared flex ancestor, so scroll works unconditionally regardless of what any parent does. Mobile: main panel expands to full width, problem panel hidden.

**Files:** `src/pages/SqlLabPage.jsx`, `src/index.css`, `src/App.jsx`

---

## [4.39.0] — 2026-05-31 [FEATURE]

### SQL Lab scaled to 250 problems — 100 Easy / 75 Medium / 50 Hard / 25 Master

Scaled `sqlLabProblems.js` from 30 problems (V4.38.0 baseline) to the full 250-problem target across two sessions. All problems use the shared datamart architecture (5 datamarts, no per-problem schema/seed). All strings single-quoted, apostrophes escaped as `\'`, 0 backticks. Vite build: ✓ 807 modules, 0 errors.

**Problem count by difficulty:**

| Tier | Count | IDs |
|---|---|---|
| Easy | 100 | sql-e01 – sql-e100 |
| Medium | 75 | sql-m01 – sql-m75 |
| Hard | 50 | sql-h01 – sql-h50 |
| Master | 25 | sql-master01 – sql-master25 |

**Techniques covered (full 250-problem spread):**

Easy: SELECT/WHERE/ORDER BY, COUNT/SUM/AVG/MAX/MIN, GROUP BY/HAVING, DISTINCT, NULL handling (IS NULL/IS NOT NULL), basic JOIN, LIKE, BETWEEN, IN, simple CASE WHEN, string/date functions, subqueries, multi-table aggregation.

Medium: Multi-table JOIN chains, anti-join (NOT IN / LEFT JOIN + IS NULL), conditional aggregation (CASE WHEN pivot), COALESCE, date arithmetic (julianday, strftime), HAVING filters on aggregates, self-join, derived tables, ROUND, correlated subqueries, set operations.

Hard: Window functions (SUM OVER, RANK, ROW_NUMBER, NTILE, LAG), single-CTE patterns, gap-and-island detection, running totals, quartile analysis, CASE WHEN multi-column pivot, co-purchase affinity (self-join on order_items), referral chain lookup, complex multi-table joins, HAVING + GROUP BY on derived metrics.

Master: Multi-CTE chains (2–3 CTEs), composite scoring models, plan upgrade/downgrade classification, reactivation candidate detection, care gap analysis (double anti-join), co-purchase affinity (self-join), monthly time-series by tier/category, discount mix analysis, first-order cohort value, account health scoring, user risk profiling (dual-signal CTE), creator portfolio analytics, referral performance.

**Companies covered (sample):** Amazon, Google, Stripe, Shopify, Airbnb, Netflix, Uber, Meta, TikTok, PayPal, Robinhood, DoorDash, Discord, Calm, Oscar Health, Teladoc, Salesforce, Gainsight, Zuora, Plaid, Marqeta, YouTube, Epic Systems, Doximity, Wayfair, Cash App.

**V4.39.0 additions specifically (master15–master25):**
- master15 (fintech): Monthly spend by category — strftime + GROUP BY, 20 rows
- master16 (consumer): Creator portfolio performance — CASE WHEN pivot + ROUND, 6 rows
- master17 (health): Prescribing volume by specialty — COUNT DISTINCT dual, 5 rows
- master18 (ecomm): Channel first-order value — 2-CTE MIN + AVG pattern, 4 rows
- master19 (saas): Account event activity tier — 2-CTE + COALESCE + CASE WHEN, 12 rows
- master20 (fintech): Active account portfolio by user — WHERE filter + GROUP BY, 10 rows
- master21 (consumer): Referral performance by referrer — self-join, 6 rows
- master22 (health): Monthly appointment no-show rate — strftime + CASE WHEN, 3 rows
- master23 (ecomm): Discount mix by acquisition channel — CASE WHEN dual pivot, 4 rows
- master24 (saas): Monthly subscription acquisition by tier — strftime + JOIN, 13 rows
- master25 (fintech): User transaction risk profile — 2-CTE + LEFT JOIN merchants + composite CASE WHEN, 12 rows

All master15–master25 solutions verified against datamart seed data before writing. checkValues confirmed against manual row counts. Float columns excluded from checkValues; integer columns verified.

**Known issue to vet:** sql-master10 (High-Risk Account Flagging) — solution string may contain `\)` instead of `\n)` at CTE boundary. If the problem fails to run, fix the solution field in sqlLabProblems.js at the closing parenthesis of the first CTE.

**Files:** `src/data/sqlLabProblems.js`, `NEXT.md`, `CHANGELOG.md`, `AUDITS.md`

---


---

*Versions V4.1–V4.38 archived in CHANGELOG_ARCHIVE.md.*
