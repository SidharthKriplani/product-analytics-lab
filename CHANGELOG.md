# Product Analytics Lab — Changelog

Full build lineage. Covers what changed, why, what was added, what was fixed, and which files were touched in each release. Intended to make the project understandable to any future contributor, collaborator, or reviewer without needing to read the git log.

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
