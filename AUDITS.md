# Product Analytics Lab — Audit Log

Every structured review, quality pass, diagnostic sweep, benchmark check, and implicit audit run across PAL from V1 to V4.6.

**Rule:** AUDITS.md feeds IDEAS.md, not the reverse. Resolved audit findings that are buildable features go into IDEAS.md Tier 1. Features you want to build do not go here. Keep the directions clean: audits are diagnosis, IDEAS are treatment.

Status: ✅ Resolved — ⚠️ Open / partially resolved

---

## Audit type reference

Start here when running an audit. Add rows as new types emerge.

| Type | What it covers |
|---|---|
| **BUILD** | Prop wiring, dead code, duplicate keys, component contracts, missing field stubs |
| **Visual Consistency** | Color drift, spacing, border radius, font usage, CSS variable adherence, badge config completeness |
| **Navigation & Discoverability** | Hidden features, dead-end flows, tab/menu structure, active states, cross-room links |
| **Content Integrity** | Stale copy, version mismatches, duplicate data keys, field coverage, claim-data alignment |
| **Framework / Technical** | Language patterns, hook usage, render correctness, lazy loading |
| **SEO / Social** | OG tags, meta descriptions, sitemap, robots.txt, sharing previews |
| **UX / Human Elements** | Empty states, tone, onboarding friction, exit states, CTA hierarchy |
| **Performance** | Bundle size, lazy loading, render bottlenecks, code splitting |
| **Creativity / Product** | Design, value delivery, layout, differentiation, positioning |
| **Coverage** | Which features/topics/rooms lack tests, questions, or cross-links |
| **First-Time User** | Cold walk-through in incognito — every confusion point noted live _(not yet run post-V4.7 sidebar)_ |
| **MVP / Weight** | Which features earn their place? Cut or consolidate candidates _(not yet run)_ |
| **IP / Moat** | What's hard to replicate? What's original? What to double down on? _(not yet run)_ |
| **Architecture** | Stack decisions, IA, build sequence, scope, strategic risk |
| **Source material** | Benchmark against real-world interview standards, competitor content |
| **Security** | Secret management, PII exposure, gitignore, env vars |
| **Mobile** | Viewport overflow, touch targets, responsive grid patterns |
| **Analytics** | Event taxonomy, PII policy, funnel gaps, missing signals |
| **Build safety** | Syntax errors, parse failures, Vite/Rolldown compatibility |
| **Content staleness** | Counts, company names, version strings, benchmark data that drifts over time |
| **Dead code / orphans** | Unreferenced files, unused imports, data objects with no consumer, retired features still in bundle |
| **Config completeness** | Lookup maps, enum configs, case enums that grow when content is added but configs are not updated |

---

## Part XXXIII — V5.34.x Build Audit (2026-06-18)

### 153. ✅ Build Audit — Missing file + statefulness gaps (V5.34.3–V5.34.4)

**Type:** BUILD / Framework / Technical

Three gaps found and resolved in the V5.34.x sprint:

1. **PythonLabBrowser.jsx never committed** — file existed on disk since V5.33.0 but all git commits in that session failed silently due to mmap failures on the iCloud-synced repo path. Vercel build failed with "Module not found" on the next push that reached GitHub. Fixed in V5.34.4 by committing via /tmp clone.

2. **`pal-code-progress-v1` missing from `onResetAllProgress`** — Python Lab (Code Browser) uses this localStorage key but it was not in App.jsx's reset array. A user hitting "Reset All Progress" would not clear Code Lab progress. Fixed in V5.34.5.

3. **`sitemap.xml` missing `/python-lab` and `/dimensional-modeling`** — both routes shipped without sitemap entries. Fixed in V5.34.5.

**Status:** ✅ All three resolved.

---

### 152. ✅ Build Audit — Data file bugs causing build failure + Progress crash (V5.34.3)

**Type:** BUILD / Framework / Technical

Two pre-existing data file bugs found and fixed:

1. **`src/data/codeModules.js` line 1330 — unescaped `'` in `modelAnswer`** — `print(f\'\\n=== Validation Report ===')` had an unescaped closing `'` before `)` that terminated the JS string. Caused every Vercel build from V5.33.0 onwards to fail with a Rolldown parse error. Root cause: the code content had both a `f\'` prefix and a `'` suffix, requiring the suffix to also be escaped as `\'`. Fixed: `===\')`.

2. **`src/data/spotTheFlawCases.js` line 414 — double-comma `},,`** — two commas after object close created a sparse undefined slot in the cases array. `Progress.jsx` maps over STF cases and crashed with "Cannot read properties of undefined" on the undefined slot. Fixed: `},,` → `},`.

**Status:** ✅ Both resolved.

---

## Part XXXII — V5.25.0 Content Audit Sprint (2026-06-09)

### 151. ⚠️ Platform UX audit — orientation, nav clarity, room identity, stickiness (2026-06-09)

**Type:** UX / Navigation & Discoverability / Architecture

Full platform audit across all 21 rooms. Four questions per room: (1) does a user immediately understand what this room is for and why it's different? (2) is there a clear start-here moment? (3) is there a reason to come back? (4) does this room earn its place or blur with something adjacent?

**Structural findings — three root problems:**

**Problem 1 — The architecture is invisible.**
PAL has a real curriculum: foundations build mental models, practice rooms apply them as judgment calls. But users see a flat list of 21 rooms with no sense of relationship, order, or what unlocks what. The Universe View is a map, not a guide. New users need: start here → this unlocks this → here's where you are in the arc.

**Problem 2 — Six rooms share the same identity in the nav.**
Analytics: Metrics / Analytics: RCA / Analytics: Cases / Analytics: Growth Analytics / Metrics Foundations / RCA Foundations — a user sees six rooms that all feel like "analytics practice." The distinctions are real (foundations = mental model, analytics rooms = messy judgment cases) but nothing communicates them. "Analytics: Cases" is the worst offender — the vaguest name in the platform.

**Problem 3 — Two rooms are misplaced or misnamed.**
Stats Calc is a utility that occupies a nav slot. It should be embedded in Stats Foundations and AB Review, not a standalone room. Full Loops is the most impressive room on the platform (end-to-end investigation, 5-phase, SQL + synthesis) but "Full Loops" sounds like a fitness term. If users understood what it was it would be the signup hook.

**Per-room findings (abbreviated):**

| Room | Clarity | Start-here | Stickiness | Earns nav slot |
|---|---|---|---|---|
| Stats Foundations | ⚠️ signals prerequisite not value | ⚠️ module 1 is slow | ✅ 32 modules + progress | ⚠️ blurs with A/B Foundations + 3 Experiments rooms |
| Metrics Foundations | ✅ clear topic | ✅ decent | ✅ progress | ⚠️ blurs with Analytics: Metrics |
| RCA Foundations | ⚠️ RCA is jargon | ⚠️ weak hook | ✅ progress | ⚠️ blurs with Analytics: RCA |
| A/B Foundations | ✅ A/B is known | ⚠️ slow start | ✅ progress | ⚠️ blurs with Stats Foundations + Experiments block |
| Experiments: Stats | ❌ confusing name | ❌ no hook | ✅ cases | ⚠️ blurs with AB Review |
| Experiments: AB Design | ✅ clear | ⚠️ unclear format | ✅ cases | ✅ distinct from AB Review |
| Experiments: AB Review | ✅ clearest in block | ✅ first free case | ✅ debrief quality | ✅ earns place |
| Spot the Flaw | ✅ best name on platform | ✅ game-like | ✅ replayable | ✅ earns place |
| Stats Calc | ❌ feels out of place | ❌ utility not room | ❌ no stickiness | ❌ should be embedded tool |
| Analytics: Metrics | ⚠️ vague | ⚠️ case grid, no guidance | ✅ cases | ⚠️ blurs with Metrics Foundations |
| Analytics: RCA | ⚠️ blurs with RCA Foundations | ⚠️ weak | ✅ cases | ⚠️ same |
| Analytics: Cases | ❌ vaguest name on platform | ❌ no hook | ✅ cases | ❌ biggest liability |
| Analytics: Growth | ⚠️ jargon to juniors | ⚠️ weak | ✅ cases | ⚠️ blurs with Cases |
| BI & Reporting | ⚠️ BI is jargon | ❌ text-only, format wrong | ❌ low | ⚠️ format doesn't demonstrate value |
| Instrumentation | ❌ jargon even to mid-levels | ❌ weak | ✅ if in content | ⚠️ name buries distinct value |
| Full Loops | ❌ worst name vs best room | ❌ name hides the hook | ✅ highest potential | ✅ earns place once understood |
| SQL Lab | ✅ crystal clear | ✅ 140 problems | ✅ highest stickiness | ✅ most distinct room |
| Product Design | ✅ clear to PMs | ✅ first case | ✅ cases | ✅ earns place |
| Prioritization | ✅ universally relatable | ✅ clear format | ⚠️ limited by case count | ✅ earns place |
| Behavioral | ✅ clear | ✅ STAR format known | ⚠️ limited | ✅ distinct |
| Estimation | ✅ clear | ✅ Fermi problems known | ⚠️ case count | ✅ distinct |

**Each room also needs:** a first-screen answer to "what will I be able to do after this room that I can't do now?" — currently missing from most rooms.

**Fixes tracked in CONTENT_AUDIT_SPRINT.md.** Build changes tracked per-version in CHANGELOG.md.

---

### 150. ✅ Stats Foundations — difficulty field bugs + devNote clutter (V5.25.0)

**Type:** Build safety + Content Integrity

Audit of `statsFoundationsModules.js` (32 modules, sf01–sf32) and all 32 module JSX components.

**Findings:**
- ✅ sf01–sf25: content passes quality bar. keyInsights are specific, scenario-grounded, correct. No rewrites needed.
- ✅ sf26–sf32: all 7 module JSX files are fully built with real interactive content (beta PDFs, bootstrap simulation, chi-square chart, MCQs, SUTVA scenario classifier). Not stubs.
- ✅ **FIXED** — sf26–sf32 had wrong `difficulty` values ('intermediate', 'analyst', 'senior') that don't match `DIFF_CFG` keys ('Beginner'/'Intermediate'/'Advanced'). Caused: (1) all 7 modules displayed with Beginner chip color, (2) all 7 filtered out when user selected Intermediate or Advanced. Fixed: sf26→Advanced, sf27→Intermediate, sf28→Advanced, sf29→Intermediate, sf30→Advanced, sf31→Advanced, sf32→Advanced.
- ✅ **FIXED** — sf26–sf32 had `devNote` fields (internal design notes never rendered). Removed from all 7.

**Coverage assessment:** 32 modules covers Beginner→Advanced stats arc comprehensively: descriptive stats, distributions, CLT, CI, hypothesis testing, power/MDE, correlation, Simpson's paradox, multiple testing, regression to mean, selection bias, practical significance, causal inference (DiD, RD, synthetic control, IV), Bayesian inference, effect size, bootstrap, chi-square, SUTVA, ANOVA, non-parametric. No gaps found.

**File:** `src/data/statsFoundationsModules.js` | Build ✓

---

## Part XXXI — V5.10.1 PM Audit (2026-06-06)

### 149. ⚠️ PM Audit — Full product review: activation, IA, free/paid boundary, retention, conversion

Full diagnosis in PM_AUDIT.md (created this session). Key open findings:

- ⚠️ **Activation:** Guest and new sign-in experience does not push users into a specific case. Session-1 case completion rate is unknown but likely low. Highest-risk gap.
- ⚠️ **Empty state:** Progress page shows nothing for day-1 users. "Start here" card missing. Already in NEXT.md P0.
- ⚠️ **Guest demo path:** Guests browse 17 rooms instead of being pushed into one Analyst-level case immediately. Already in NEXT.md P0.
- ⚠️ **Free tier invisible:** Signed-in free users are not told what they have access to. No "you have X free cases" anchor on sign-in or Plans page.
- ⚠️ **Habit loop incomplete:** "Continue where you left off" card missing from Progress. Streak not above the fold.
- ⚠️ **IA:** TOOLS is a catch-all. MCQ Quiz, Company Tracks, Defense Strategy share no logical grouping. Nav restructure logged in IDEAS.md P1.
- ⚠️ **guestPreview quality:** Not audited for Analyst-level difficulty or conversion quality. Each room's preview case should be the strongest possible hook.
- ✅ **Access model:** 3-tier structure (Guest / Free / Full) is correctly designed. Foundations / Easy SQL / Forensics free is the right call.
- ✅ **Debrief quality:** Senior debrief format is PAL's moat. GateOverlay is contextual. ForwardPointerCard wired (V5.1).

**P0 findings → NEXT.md:** Guest demo path, empty state, Plans copy, free tier value anchor, guestPreview audit.
**P1 findings → IDEAS.md:** Continue where you left off, streak prominence, Company Track on Progress, nav IA restructure, ambient unlock signal.
**Metrics → METRICS.md:** 12 recommended PostHog metrics added (activation, engagement, conversion, content health).

**Full audit:** PM_AUDIT.md — Audit #149, V5.10.1, 2026-06-06.

---

## Part XXXVIII — V5.23.0 structural fixes (2026-06-09)

### 163. ✅ BUG — Deep link URLs don't work in new tabs

**Root cause:** `onAuthStateChange` callback fires `setPage('progress')` before the deep-link hash handler can consume the URL. The 150ms timer was not enough for Supabase auth to settle.

**Fix (V5.23.0):** Replaced 150ms timer with `authSettled` state driven by `onAuthStateChange`. Deep link consumption now waits for auth to settle before calling open functions. Added `pendingDeepLinkRef` guard to the `home→progress` redirect effect. 2-second fallback timer for when Supabase is offline.

### 164. ✅ REBUILD — Full Loop 7-phase → 5-phase connected investigation

**Source:** User's Meesho SBA Round 2 experience. The real interview was a connected flow: metric alert → decomposition → schema proposal → sequential SQL queries → synthesis. PAL's 7-phase Full Loop was disconnected — each phase stood alone.

**Fix (V5.23.0):** Rebuilt to 5 phases: Problem → Decomposition (free-form MECE) → Schema Design (propose tables) → SQL Query Chain (3 sequential queries via sql.js) → Synthesis. All 10 cases rewritten. Seed data expanded with 5 new tables. Removed experiment and readout phases (those belong in Review Room).

---

## Part XXXVIII — V5.38.0–V5.40.0 SQL Lab Engine + Content Audit (2026-06-20)

### 163. ✅ Bug — SQL Lab validation race condition on expectedSample (V5.38.0)

**Version:** Fixed V5.38.0
**Type:** BUILD

`expectedSample` was stored in React state — async, one render behind. `checkQuery()` ran against a stale value, rejecting correct answers intermittently. Fixed: moved to `useRef` (`expectedSampleRef`), set synchronously inside `initDb()` at problem load time. Now always current when `checkQuery()` is called. Also: 4 problems had empty `checkValues` arrays (silent pass-through on fallback path); fixed with real verification values. `expectedRowCount` display bug fixed (wrong count on initial render).

**Files:** `src/pages/SqlLabPage.jsx`, `src/data/sqlLabProblems.js`

---

### 164. ✅ UX — SQL Lab Run/Check split + DEBRIEF_BLOCKS + PAL Exclusive badge (V5.38.1)

**Version:** Fixed V5.38.1
**Type:** UX / Content Infrastructure

Three changes shipped together: (1) Run and Check split into distinct actions — Run executes and shows results with no verdict; Check validates and gives a pass/fail. Cmd+Enter → checkQuery. (2) DEBRIEF_BLOCKS system: `**Section:**` markers in debrief text now parse into collapsible colored sections (Approach, Interviewer Follow-Up, Context, etc.) — upgrades all existing debriefs retroactively. (3) PAL Exclusive badge on all Forensic problems — the only SQL format of its kind on any prep platform. (4) `beforeWriting` field rendered as yellow judgment prompt above the code editor.

**Files:** `src/pages/SqlLabPage.jsx`

---

### 165. ✅ Bug — checkValues '.0' decimal format fixed in sql-f29, f31, f34 (V5.40.1)

**Version:** Open — introduced V5.39.0
**Type:** BUILD / Content Integrity

checkValues in sql-f26 through sql-f35 use `.0` decimal suffix on whole-number aggregation results: e.g., `{ total_disputed: '280.0' }`, `{ total_exposure: '4450.0' }`. The check comparison in SqlLabPage.jsx is:

```js
String(row[i]) === String(val)
```

For a REAL column in SQLite returned via sql.js as a whole-number float (e.g., 280.0), JavaScript serializes it as `String(280)` = `'280'` — not `'280.0'`. The comparison `'280' === '280.0'` is false. On the fallback path (when expected sample is not cached), these problems will reject correct answers silently.

**Root cause confirmed:** Only 3 of the 10 problems had whole-number REAL checkValues. f29 (total_exposure '4450.0', '1205.0'), f31 (total_disputed '280.0', '950.0'), f34 (amount '45.0', '780.0'). The other 7 used text values, COUNT integers, or genuine non-integer floats ('249.99', '329.98') — all serialise correctly.

**Fix (V5.40.1):** Stripped `.0` from all 6 affected checkValues. Verified against actual datamart rows before editing: QuickTransfer = txn9(950)+txn31(3500)=4450, FastCash = txn20(780)+txn39(425)=1205; dispute txn7→acct4=280, txn9→acct5=950; txn10.amount=45, txn20.amount=780. String audit OK, brace diff 0.

**Files:** `src/data/sqlLabProblems.js` (sql-f29, sql-f31, sql-f34 checkValues)

---

### 166. ✅ UX — Expected output not surfaced until after first query run

**Version:** Fixed V5.41.0
**Type:** UX

`expectedSampleDisplay` (the correct column headers and sample rows) is computed during `initDb()` and stored in state, but is only rendered inside the results panel — which only appears after the user runs a query. First-time users open a problem with no target: no column names, no row count, no example output. They either guess the schema or write something random to trigger a result. Every other SQL practice platform (DataLemur, StrataScratch, LeetCode) shows the expected output structure before any input. PAL should too.

**Fix (V5.41.0):** The "Expected output" block was already in the problem panel (left column) but the sample rows were gated on `expectedSampleDisplay !== null`. Changed to: while `sqlLoading` is true, show "Loading sample rows…" placeholder; once `initDb()` completes (typically 1-3s), real sample rows appear. Also fixed header `borderBottom` to always render (was conditionally hidden when no sample yet). File: `src/pages/SqlLabPage.jsx`.

**Files:** `src/pages/SqlLabPage.jsx`

---

### 167. ✅ Architecture — SQL Lab schema fragmentation resolved; 13 datamarts as of V5.40.0 (closes #134 partially)

**Version:** Resolved V5.40.0
**Type:** Architecture

Audit #134 (V4.39.0) flagged 5 datamarts for 130 problems (26 problems/datamart avg) as dangerously thin — users would memorize schema and break the "business question only" framing. Target was 12 datamarts. As of V5.40.0: 13 datamarts exist (ecomm, saas, fintech, consumer, health, gaming, logistics, marketplace, edtech, hr, swiggy + 2 more added across V4–V5). Target exceeded on datamart count. Per-datamart problem density is still uneven — swiggy has 6 problems (below the 10-12 target), and several older datamarts exceed 20 problems. Balance is a secondary concern; the primary fragmentation risk is resolved.

**Files:** `src/data/sqlLabDatamarts.js`

---

### 168. ⚠️ Content — India SQL series covers Swiggy only; Zepto, Zomato, Paytm framing absent

**Version:** Open — V5.40.0 ships Swiggy (sql-sw01–sw06 on swiggy datamart)
**Type:** Coverage

The India SQL series was motivated by the observation that DataLemur has zero India-specific SQL problems, and PAL's Bangalore DA/PA audience is underserved. V5.40.0 closes this for food delivery (Swiggy). Remaining gaps: quick commerce (Zepto — dark store inventory, slot-level fulfillment), fintech (Paytm/Razorpay — UPI transaction analysis, merchant settlement), social commerce (Meesho already has marketplace problems but no India-specific framing), and ride-sharing (Ola/Rapido). These could use existing datamarts with Indian company framing or warrant new datamarts. The 6-problem Swiggy series is a proof of concept; the full India track needs 15-20 problems across 3-4 companies to be a credible differentiator.

**Priority:** Medium — Swiggy problems shipped and differentiated; expand India track in a dedicated session after checkValues bug (#165) is fixed and V5.40 is live.

**Files:** `src/data/sqlLabProblems.js`, `src/data/sqlLabDatamarts.js`

---

### 169. ✅ Quality — No automated SQL Lab problem validation script

**Version:** Opened V5.41.0 (2026-06-20) · **Closed V5.41.0** (2026-06-20)
**Type:** Quality infrastructure

`scripts/audit_sql_lab.py` built and run clean against all 182 problems. Covers 21 T1 checks (block commit) and 8 T2 warnings. Key findings from first run: 142 T1 failures across 7 failure categories — all fixed before commit. Notable fixes: 136 problems in two batch scripts, CTE regex for RECURSIVE CTEs with column lists, `brokenQueryReturnsZeroRows: true` exemption for `= NULL` vs `IS NULL` forensic scenarios (f04, f05), off-by-one brokenQuery redesign (f35), ORDER BY tiebreaker fix (f09). Final run: 0 T1 failures, 38 T2 warnings (isFree coverage — deferred).

Script is now the gate before any SQL Lab content ships. Add to CLAUDE.md pre-commit checklist alongside string audit and brace diff.

**Files:** `scripts/audit_sql_lab.py` (new), `docs/EVAL_RUBRICS.md`, `CLAUDE.md`

---

## Part XXXVII — V5.23.0 beta feedback: Universe View + mobile (2026-06-09)

### 161. ✅ UX — Universe View has no entry point for beginners

**Source:** Beta tester (WhatsApp, 2026-06-09). Quote: "Are we assuming someone knows the entire workflow? I went to the foundations, but realised I couldn't understand which metric is what right off the bat."

**Signal:** User was looking at the Universe View's 5 workflow arms (Monitor/Diagnose/Understand/Communicate/Design) all at 0% with no indication of where to start. Picked the wrong arm first, got lost because she lacked prerequisite knowledge from another arm, and blamed herself. The Universe View presents the analyst workflow without guiding entry.

**Fix (V5.23.0):** Added "Start here →" indicator on the Monitor arm (visible only at 0% progress). Added beginner copy: "New here? Start with Monitor — it's the foundation everything else builds on." Both disappear once the user has any Monitor progress.

### 162. ⚠️ UX — Mobile experience should prioritize drills over learning content

**Source:** Beta tester (WhatsApp, 2026-06-09). Quote: "The teaching part could be desktop friendly. But the practice part, small wins which a user can check off instead of scrolling on reels — that could be made mobile friendly also."

**Signal:** People commuting won't absorb Foundations content on a phone, but they'd do a quick RCA case or MCQ quiz. Current mobile IA mirrors desktop — Foundations and Universe View are equally prominent. Mobile navigation should surface case rooms and drills first, push learning content down. This is an IA decision, not a CSS fix.

**Priority:** V6 territory. Log and revisit after PostHog mobile vs desktop session data confirms the pattern.

---

## Part XXXVI — V5.22.2 beta feedback: Faizan Mulla (2026-06-09)

### 160. ⚠️ UX — Information density too high on screen

**Source:** Faizan Mulla (Data Analyst, Enrich, IIT Madras, beta tester, 2026-06-09). Quote: "There are too much info at a time on the screen. Info is not the issue, but displaying it can be improved on."

**Signal:** Third person to flag density/readability (after Meghana's boxed content complaint and the general "simpler language" signal from Meghana). The content isn't the problem — it's how much is shown at once. This could mean: too many sections visible simultaneously, not enough progressive disclosure, or insufficient visual hierarchy to guide the eye. Fix: audit the highest-traffic pages (Foundations runners, case runners, SQL Lab) for opportunities to collapse, tab, or progressively reveal content. This is a design problem, not a content problem.

**Priority:** Medium — recurring signal across multiple testers. Not blocking but affects perceived quality.

---

## Part XXXV — V5.21.1 beta feedback: Jatin Nair + Meghana Joshi (2026-06-07)

### 159. ⚠️ UX — Playbook / framework concepts feel clickable but aren't

**Source:** Jatin Nair (beta tester, WhatsApp, 2026-06-07). Quote: "Wherever there are playbook concepts, I had the tendency to click on them. Not sure if these will get clickable later."

**Signal:** Users expect framework cards and concept references to be interactive — linking to the relevant room, module, or article. Currently they're static text. This is a discoverability gap: the content hints at depth that isn't surfaced. Fix options: (1) make concept references link to the relevant Foundations module or Playbook article, (2) add a subtle hover state to signal intent, or (3) do nothing and accept that this expectation will recur. Option 1 is highest value — turns passive reading into navigation.

**Priority:** Low-medium. Not broken, but a missed retention opportunity every time a user hits a concept card.

---

### 158. ⚠️ Content — RCA Foundations progress not persisting between sessions

**Source:** Jatin Nair (beta tester, WhatsApp, 2026-06-07). Quote: "Progress save nahi hota, like you can see the screenshot, maine select kiye the answers, when I moved to the next module, and went back the selection was erased."

**Signal:** RCA Foundations module state (selected answers, revealed states) resets when the user navigates away. Stats Foundations, Exp Foundations, and Metrics Foundations all have persistence via dedicated utils (statsFoundationsState.js etc.) — RCA Foundations likely does not. Fix: audit `src/components/rcaFoundations/` for localStorage save/restore on exercise state; add a `rcaFoundationsState.js` utility matching the pattern in statsFoundationsState.js.

**Priority:** High — this is a learning platform. Losing answers mid-session actively breaks the use case. Will frustrate repeat visitors.

---

### 157. ⚠️ Content — RCA case answer options too easy to eliminate by common sense

**Source:** Jatin Nair (beta tester, WhatsApp, 2026-06-07). Quote: "I want you to make all 3 options look the same or similar. It is common sense that option A is the answer, the other 2 are just vague. Now most won't use the RCA learning or analytical thinking."

**Signal:** If a user can identify the correct answer without applying the diagnostic framework, the case is not measuring what it's supposed to measure. The wrong options need to be plausible misconceptions — things a reasonable analyst might actually say — not obvious fillers. This is the same issue logged in businessCases.js (C01 Phase 4 option C, fixed V4.85.0) now appearing in RCA cases specifically. Fix: audit distractor quality across RCA cases, prioritise cases where one option is obviously correct without reasoning.

**Priority:** High — weak distractors invalidate the entire practice value of those cases.

---

### 156. ⚠️ UX / Content — Stats data module: boxed explanation skipped by users who treat it as a note

**Source:** Meghana Joshi (beta tester, feedback form, 2026-05-31). Quote: "Numeric and categorical explanation could be in main content as people tend to skip things in boxes because they think it is a note. In Stats data module."

**Signal:** Content in callout boxes / bordered panels is being perceived as supplementary ("a note") and skipped. If the numeric/categorical distinction is foundational to the module, it belongs in the main content flow, not a side panel. Fix: audit Stats Foundations data module — if the boxed content is load-bearing, move it inline. Reserve boxes for genuinely optional context.

**Priority:** Medium — affects comprehension for anyone who skips the box, which is apparently most users.

---

**Running signal — language density (3 sources now):** Amaya (Audit #151), Jatin ("needs more explanation for complete beginners"), Meghana ("try using simpler language for beginners and students") have all flagged the same issue independently. Three separate testers saying the same thing is a pattern, not an edge case. Audit #151 covers the diagnosis — this note exists to flag that the evidence base has strengthened.

---

## Part XXXIV — V5.20.6 beta feedback: Debasrija Mondal (2026-06-07)

### 155. ✅ Bug — Checkout Trap case broken on mobile: question unreadable (Fixed V5.23.0)

**Source:** Debasrija Mondal (beta tester, feedback form, 2026-06-07). Quote: "The checkout trap page is broken on mobile layout. Can only see the answer, the question is in a very narrow column on the left side. Not readable."

**File to check:** whichever Runner renders the Checkout Trap case (likely `src/components/cases/CasesRunner.jsx` or equivalent). The question/answer split is probably a fixed two-column layout that collapses badly below ~420px. Fix: stack question above answer on mobile — `flex-direction: column` below a breakpoint, or use the responsive grid pattern from CLAUDE.md.

**Priority:** High — mobile is a primary usage context. Broken layout = case is inaccessible for mobile users.

---

### 154. ✅ Bug — Stats Foundations Module 8: normal distribution curve overflows and overlaps text (Fixed V5.23.0)

**Source:** Debasrija Mondal (beta tester, feedback form, 2026-06-07). Quote: "Module 8 of stats has a normal distribution curve stretching to the top of the page overlapping text. Affects usability."

**File:** `src/components/statsFoundations/` — whichever component renders Module 8 (normal distribution). Likely a canvas or SVG with a fixed height that is too tall for the container, or a missing `overflow: hidden` on the wrapper. Fix: constrain the chart container with `max-height` + `overflow: hidden`, or cap the SVG viewBox height.

**Priority:** Medium — content is still readable if the curve is partially hidden, but it looks broken and undermines trust.

---

### 153. ✅ Bug — Stats Foundations CLT simulation: "not yet normal" persists even at high N (Fixed V5.23.0)

**Source:** Debasrija Mondal (beta tester, feedback form, 2026-06-07). Quote: "The CLT page kept showing not yet normal for the simulated samples."

**File:** CLT module in `src/components/statsFoundations/`. The normality check threshold (Shapiro-Wilk or visual heuristic) is likely miscalibrated — triggering "not yet normal" even when sample size is high enough that CLT should clearly apply. Fix: review the normality detection logic; either lower the threshold or add a sample-count override (e.g., "At n ≥ 30, the distribution is approximately normal by CLT" regardless of visual test result).

**Priority:** Medium — this is a teaching moment bug. A user trying to observe CLT in action gets incorrect feedback, which actively misleads.

---

### 152. ✅ Content / UX — A/B testing "New Here" path introduces baseline rate before explaining it (Fixed V5.23.0)

**Source:** Debasrija Mondal (beta tester, feedback form, 2026-06-07). Quote: "If one goes through the 'new here' option, the terms for A/B testing like baseline rates come up before the concept is actually explained. That feels unclear."

**File:** Likely `src/data/expFoundationModules.js` or the "New Here" guided path ordering. The module sequence introduces `baseline rate` as a term in an early exercise before the concept module that defines it. Fix: audit the "New Here" path ordering — ensure every term used in an exercise appears in a prior explanation module. Or add an inline tooltip/definition on first use.

**Priority:** Medium — affects cold-start users on the guided path, which is the highest-leverage onboarding flow.

---

## Part XXXIII — V5.19.0 beta feedback + product signals (2026-06-07)

### 151. ⚠️ Content — Stat Foundations explanations too dense for complete beginners

**Source:** Amaya (beta tester, WhatsApp, 2026-06-07). Using PAL as a beginner wanting a structured Statistics learning path. Quote: "Some of the explanations can be a bit challenging for beginners, so I usually take screenshots of the concepts and use ChatGPT to get simpler explanations and examples."

**Signal:** The "screenshot → ChatGPT" workaround means explanations are failing at the comprehension layer, not the content layer. The concepts are right but the language density is too high for cold-start users. PAL is positioned for interview prep (assumes some exposure), but real usage includes complete beginners using Foundations as their first encounter with the material.

**Options:** (1) Add a "Simplify" toggle per module that rewrites the explanation at a lower density level. (2) Add a "What does this mean?" expandable below jargon-heavy sentences. (3) Audit Stat Foundations modules specifically for unexplained jargon and add one-line plain-English clarifiers. Option 3 is lowest effort and highest impact. Gate: check PostHog for Stat Foundations drop-off rate to confirm this is a real funnel issue, not an edge case.

---

## Part XXXII — V5.11.1 UniverseView audit (2026-06-07)

### 150. ⚠️ Visual + Interaction — UniverseView label overlaps, 0%-progress invisibility, no interactivity

**File:** `src/components/shared/UniverseView.jsx`

Three distinct defects found during review after V5.11.1 shipped:

**A) Sublabel text overlaps between adjacent arms**
7 arms at ~51.4° spacing. Sublabels (`arm.sublabel`, e.g. "Behavioral · Estimation") render at `ARM_LENGTH + 40 = 195px` from center at 8.5px font. At radius 195, the arc distance between adjacent label centroids is ~174px. Sublabel strings can reach 130–160px wide — they collide for arms in the upper-right / upper-left quadrant. Fix: remove sublabels from the SVG entirely. Move room context into the progress bar list below (already present there by arm label). Single-word arm labels (Monitor, Diagnose, etc.) at 11px do not overlap — keep those.

**B) 0%-progress arms show nothing — star structure is invisible to new users**
Progress lines are only drawn when `arm.progress > 0` (`if (arm.progress === 0) return null`). A new user or demo user sees 7 faint dim background lines (opacity: 0.12) with no star structure, no nodes, and no sense of the map. Fix: always render a short dashed stub (e.g., 15% of arm length) at 0% to show the arm direction; style it as `stroke-dasharray="4 6"` so it reads as "not yet started." Outer and inner nodes should always render (with low opacity at 0% — already partially done).

**C) `strokeDasharray="160"` is a hardcoded constant regardless of line length**
Actual lit line length = `ARM_LENGTH * Math.max(0.08, arm.progress)` pixels, varying from ~12px (8% minimum) to 155px (100%). But `strokeDasharray="160"` treats every line as if it is 160px long — causing dash pattern to partially clip short lines. Fix: either remove dasharray from progress lines entirely (they don't need it — they draw via animation) or compute it as the actual pixel length of the line.

**D) No hover/click interactivity**
Arms have no hover state, no tooltip beyond SVG `<title>`, and no click handler. The progress bar list is the only way to see arm detail. Fix for V2: add `onMouseEnter/Leave` state per arm to highlight the active arm's line/nodes; optionally add `onClick` that calls a new `onNavigate(firstRoom)` prop.

**Fix scope (V5.12.0):**
- Remove sublabels from SVG, add room names to progress list sublabel column
- Draw 0%-stub dashed line on all arms always
- Remove hardcoded `strokeDasharray="160"` from lit lines (not needed, animation handles draw)
- Keep outer nodes always visible at low opacity (already done — confirm no regression)
- Defer hover/click to V2 (log in IDEAS.md)

---

## Part XXX — V4.77.x Open Items (2026-06-03)

### 144. ✅ Build Audit — Forensic checkValues float formatting (f01–f10)
SQLite REAL values that are whole numbers (40.0, 25.0, 50.0, 3500.0) return as JS integers (40, 25, 50, 3500). The validator does `String(row[i]) === String(val)`, so checkValues using '40.0' will never match. Fixed f01 (no_show_pct), f04 (amount), f09 (premium_pct) in V4.77.1. Audited f02–f10 in V4.80.2: all remaining checkValues confirmed correct — f02 has a true decimal (1719.87), f03/f06/f07/f08/f10 use integer columns with correct string values, f05 checks string columns only. No additional fixes required.

**Files:** `src/data/sqlLabProblems.js` — forensic problems f01–f10

### 145. ✅ UX Audit — SQL Lab Study Plan not working
**Fixed V4.93.0.** Root cause: StudyPlanModal was rendered inside `.sql-lab-main-panel` (position: fixed; z-index: 5), which creates a stacking context. The modal's z-index: 200 was scoped to that context — `.sql-lab-problem-panel` (z-index: 5, later in DOM) painted over it. Fix: moved modal render outside both panels to the root fragment, placing it at the root stacking context where z-index: 200 is unobstructed.

**Files:** `src/pages/SqlLabPage.jsx`

### 146. ✅ Content/Visual Audit — FV/FA debrief sections need structured rendering
**Fixed V4.93.0.** renderDebrief() replaced with structured paragraph parser. DEBRIEF_BLOCKS config detects 4 section types: Wrong Answer (red), Forensic Trap (orange), Sanity Check (teal), Analyst Judgment (yellow). Each renders as colored left-border block with section label. 30 WA + 94 FT + 124 SC + 10 AJ blocks rendered across 155 problems.

**Files:** `src/pages/SqlLabPage.jsx`

### 147. ✅ UX Audit — ForwardPointerCard not wired at all case debriefs
**Type:** UX / Navigation & Discoverability
**Status:** Open — V4.99.0

`ForwardPointerCard` component exists at `src/components/shared/ForwardPointerCard.jsx` and is wired in some runners, but not consistently across all 17 rooms. After a case debrief, users have no prompted next action — they manually navigate back to the browser and choose another case. This breaks session continuity at the highest-engagement moment (immediately post-debrief). Fix: audit which runners are missing ForwardPointerCard at the debrief exit state and wire it in. Each runner already receives `onNext` and `onBack` props — the component hookup is low effort per runner. Priority: P1.

**Files to check:** All runner components in `src/components/[room]/[Room]Runner.jsx` — verify ForwardPointerCard renders at debrief/completion state.

### 148. ✅ Product Audit — Forensic SQL over-exposed (all 25 isFree)
**Type:** Creativity / Product — access model
**Status:** Open — V4.99.0

All 25 Forensic SQL problems (`f01–f25`) are currently `isFree: true` (set in V4.97.0). Forensic is PAL\'s most distinctive SQL Lab content — staff-level broken-query trap detection, a format not available on DataLemur or StrataScratch. Making all 25 free removes the strongest premium differentiator in the SQL tier with no conversion benefit. Fix: Batch 1 (f01–f10) stays `isFree: true` — sufficient to demonstrate the Forensic format. Batch 2 (f11–f20) and Batch 3 (f21–f25) set `isFree: false`. Data-only change in `sqlLabProblems.js`. Priority: P1.

**Files:** `src/data/sqlLabProblems.js` — problems f11–f25

---

## Part XXIX — V4.44.0 Pre-Beta Audit Log

### 143. ✅ Content Audit — Difficulty Tagging Pass (All Rooms)
**Version:** Logged V4.44.0 → Resolved V4.45.0
**Type:** Content Integrity / Coverage

PAL currently has no difficulty tags on individual cases. Every room browser treats all cases as equal-difficulty, which means a beginner who opens the RCA room immediately hits cases calibrated for someone with 1–2 years of PA experience. This causes immediate bounce for career-switchers and beginners.

Scope: all room data files. Tag every case with `difficulty: 'Beginner' | 'Intermediate' | 'Senior'` metadata. Add a difficulty filter chip to each room browser (reusable component). SQL Lab already has this — port the same chip UI.

Effort: one session for the data tagging pass across all rooms, one session for the filter UI.

**Fix (V4.45.0):** Difficulty taxonomy normalized across all data files to `analyst/senior/staff`. `DifficultyChips` shared component created. Filter chips added to all room browsers. BehavioralBrowser and EstimationBrowser existing filter configs updated to match normalized values.

---

### 142. ✅ Content Audit — Foundation First-Principles Rewrite (All Non-Stat Foundations)
**Version:** Logged V4.44.0 → Resolved V4.46.0
**Type:** Content Integrity / Coverage / Source Material

All foundation rooms (RCA, Metrics, Exp, Stat) open modules with framework exposition ("RCA follows a four-layer hypothesis tree...") rather than human situations. This is the textbook pattern — and it fails beginners and career-switchers who need to understand the situation before the framework makes any sense.

The required fix is a module-level rewrite: every foundation module must open with a concrete human situation before any framework is introduced. "Your PM just pinged you: DAU dropped 20% overnight. You have 2 hours. What do you do?" — then the framework is the answer to that situation, not a standalone taxonomy.

Scope: all modules across all four foundations. 25 stat + 12 RCA + 13 Metrics + 15 Exp = 65 modules. Not all need rewriting — some already open with situations (audit will identify). Priority order: RCA (highest beginner gap) → Stat → Metrics → Exp.

Effort: one dedicated content session per foundation room. ~4 sessions total. No code — pure content editing in the module data files and runner JSX.

**Fix (V4.46.0):** All 65 modules rewritten situation-first across all 4 foundation data files: rcaFoundationModules.js (12), metricsFoundationModules.js (13), expFoundationModules.js (15), statsFoundationsModules.js (32). Every keyInsight now opens with a concrete work moment before any framework language. validate-data.js: all PASS.

---

### 141. ✅ Content Audit — Non-Stat Foundations First-Principles Sequence Vetting
**Version:** Logged V4.44.0 → Resolved V4.46.0 (via full rewrite of all 4 foundation rooms)
**Type:** Content Integrity / Coverage

RCA, Metrics, and Exp Foundation modules have been canonicalized (all stubs filled, devNote removed, playbookLinks added — V4.44.0). However, the module sequences have not been read end-to-end as a cold user would to verify: (1) does each module genuinely set up the next? (2) do the `connection` texts actually bridge to the target room correctly? (3) are there conceptual gaps between beginner and advanced modules that a new user would get stuck on? This is a human content QA pass — no code.

Scope: rf01–rf12, mf01–mf13, ef01–ef15. ~2–3 hours of reading.

**Gate:** Complete before Batch 1 invites. Foundation rooms are presented as learning paths — if the sequence doesn't hold up, the core promise of the room is broken.

**Fix:** Dedicated content pass (no build session) — read each room's module sequence in order, flag gaps or sequencing errors, edit content inline.

---

## Part XXVIII — V4.39.11 SQL Lab Content Quality Audit (Investigative — no code changes)

### 130. ✅ Content — SQL Lab 39 duplicate-skeleton problems removed (V4.40.0)

**Version:** Open — findings produced V4.39.11; execution pending Session 1
**Type:** Content Integrity / Coverage

Full investigative audit of all 250 SQL problems. 39 problems identified as duplicate skeletons — same primary SQL clause pattern applied to a different column or datamart domain with no added SQL concept. Breakdown: 20 Easy, 11 Medium, 3 Hard, 5 Master.

Easy cuts (20): e27, e38, e41, e63, e75, e76, e79, e86–e96, e98, e99 — all are repeat GROUP BY COUNT, WHERE filter, or top-N patterns on different columns.
Medium cuts (11): m27, m38, m44, m50, m55, m59, m63, m65, m67, m68, m69 — Easy-level problems mislabeled Medium, or duplicate CTEs/window functions.
Hard cuts (3): h36 (duplicate of h28), h43 (Easy-level mislabeled Hard), h46 (duplicate of h29).
Master cuts (5): master15, master17, master20, master22, master24 — Medium-level problems mislabeled Master.

---

## V4.48–49 Status (No New Audits)

**V4.48–49:** Per-room breakdown chart in Interview Simulator debrief + shareable score summary card. No audit findings triggered. All existing audits remain open/resolved as documented above. Next audit cycle: PostHog baseline watch (wait for 20 real sessions) before deciding paywall flip timing.

**Fix:** Removed in V4.40.0. Full list in SQL_LAB_PLAN.md Section 2A.
**Files:** `src/data/sqlLabProblems.js`

---

### 131. ✅ Content — SQL Lab 27 difficulty misclassifications corrected (V4.40.0)

**Version:** Open — findings produced V4.39.11; execution pending Session 1
**Type:** Content Integrity / Source material

Market research on LeetCode, DataLemur, StrataScratch revealed systemic over-classification. The original bank classified single window functions and anti-joins as Hard; market standard places both at Medium and Easy respectively.

Critical corrections:
- h16, h23 → Easy (from Hard) — arithmetic GROUP BY and NOT IN anti-join are Easy by market standard
- h14, h19, h20, h22, h25–h30, h35, h37, h39, h40, h44, h47, h49, h50 → Medium (from Hard) — all involve a single window function, one CTE, or JOIN+GROUP BY without multi-concept chaining
- master06, master07, master11, master13, master16, master21, master23 → Hard (from Master) — Medium-complexity multi-step problems that don't meet the Master threshold (4+ CTEs, cohort retention, combinatorics)

**Fix:** Applied in V4.40.0 — `difficulty:` field only, no prompt/debrief edits. Full table in SQL_LAB_PLAN.md Section 2B.
**Files:** `src/data/sqlLabProblems.js`

---

### 132. ⚠️ Content — SQL Lab 8 SQL patterns missing from problem bank (partially resolved V5.39.0)

**Version:** Open — findings produced V4.39.11; partially addressed V5.39.0
**Type:** Coverage

After culling, these patterns had zero or near-zero representation. Status as of V5.40.0:

1. Date spine / gap-filling (recursive CTE + LEFT JOIN to fill missing dates) — **still missing**
2. ROWS BETWEEN frame specification (explicit named frame clause as the actual test) — **still missing** (sql-f27 covers missing ORDER BY in SUM OVER but not ROWS BETWEEN syntax specifically)
3. PERCENT_RANK / CUME_DIST (NTILE exists but percentile rank functions absent) — **still missing**
4. Two valid queries producing different results (NULL handling or JOIN type differences) — **still missing**
5. Ambiguous-definition problems (metric itself undefined — candidate must interpret) — **partially addressed** by `beforeWriting` judgment prompts (sql-h01, h02, h04, h07, h11, sw02, sw04); not a full problem format yet
6. Syntactically valid but semantically wrong SQL (produces wrong result, no error) — **✅ closed** — this is exactly the Forensic format; 35 problems now exist
7. Recursive CTE / hierarchy traversal (org chart, referral tree, category hierarchy) — **still missing**
8. Full cohort retention curve (month 0/1/2/3 in one result set) — **partially addressed** by sql-h01 (Jan-to-Feb retention, 2-period); full multi-period curve still missing

**Remaining gap:** Patterns 1, 2, 3, 4, 7 are completely unrepresented. Pattern 8 needs a multi-month extension.
**Files:** `src/data/sqlLabProblems.js`, `src/data/sqlLabDatamarts.js`

---

### 133. ✅ Content — SQL Lab prompt framing 100% technical-spec; stakeholder-request missing (V4.41.0)

**Version:** Open — classification in Session 2; rewrites in Session 3
**Type:** Content Integrity / Source material

All 250 current problems use technical-spec framing: precisely stated columns, output described, business context is set dressing. This is StrataScratch-equivalent and fails to differentiate PAL. The differentiating layer — stakeholder-request framing where the candidate must interpret an ambiguous ask — is entirely absent.

Target mix: Easy 80/20, Medium 60/40, Hard 50/50, Master 40/60 (technical-spec/stakeholder-request). Stakeholder-request debrief format: (1) what stakeholder wants, (2) ambiguities resolved, (3) SQL approach, (4) what weak SQL looks like, (5) interviewer follow-up.

**Fix:** Session 2 classified all 211 survivors; Session 3 rewrote all 74 conversion candidates (16 Easy / 33 Medium / 17 Hard / 8 Master) in V4.41.0. Full rewrite rules in SQL_LAB_PLAN.md Section 4.
**Files:** `src/data/sqlLabProblems.js`

---

### 134. ✅ Architecture — SQL Lab schema fragmentation resolved (13 datamarts as of V5.40.0)

**Version:** Resolved V5.40.0 (see audit #167 for full detail)
**Type:** Architecture / Content Integrity

Original: 5 datamarts for 130 problems = 26 problems/datamart avg. Target: 12 datamarts, 10-12 problems each. As of V5.40.0: 13 datamarts (ecomm, saas, fintech, consumer, health, gaming, logistics, marketplace, edtech, hr, swiggy + 2 more). Datamarts count target exceeded. Per-datamart density is uneven (swiggy: 6 problems; some older datamarts: 20+) but primary fragmentation risk resolved. Remaining density work is an ongoing content concern, not an architecture fix.

**Files:** `src/data/sqlLabDatamarts.js`

---

## Part XXVII — V4.39.8–V4.39.11 SQL Lab UX + Progress Heatmap Audit

### 126. ✅ UX — SQL Lab independent scroll (V4.39.8)

**Version:** Fixed V4.39.8
**Type:** UX / BUILD

SQL Lab right sidebar scrolled the whole page instead of independently. Root cause: `min-height` on parent containers is not a definite height — flex children cannot resolve `flex: 1` against it, so `overflow-y: auto` never activates. Fix: two completely independent `position: fixed` panels anchored to the viewport directly. No shared flex ancestor. Body scroll locked via `document.body.style.overflow = 'hidden'`. Confirmed working in production.

### 127. ✅ Visual — SQL Lab vibrancy parity with foundation rooms (V4.39.10)

**Version:** Fixed V4.39.10
**Type:** Visual Consistency

SQL Lab lacked the teal identity present in Stat Foundations and other rooms. Fixed: teal header icon, teal title, teal active sidebar state, teal progress count, difficulty-colored left border on problem card, teal-tinted editor border.

### 128. ✅ UX — SQL Lab expected output showing actual sample rows (V4.39.11)

**Version:** Fixed V4.39.11
**Type:** UX / Human Elements

Expected output panel previously showed only column chips + row count. No sample data was visible, so users had no concrete target to write toward. Fixed: solution query runs silently after `initDb()` completes; first 3 rows stored in `expectedSample` state and rendered as a compact read-only mini table. Degrades gracefully if solution throws.

### 129. ✅ Visual — Progress streak heatmap extended to 52 weeks (V4.39.11)

**Version:** Fixed V4.39.11
**Type:** Visual Consistency / UX

Streak heatmap was 13 weeks (91 days, 7×7px cells). Updated to 52-week GitHub-style full-year grid (364 days, 10×10px cells), scrollable via `overflowX: auto`. Streak calculation window extended to 364 days. Label updated to "Last year".

---

## Part XXVI — V4.39.0 SQL Lab Scale Audit

### 124. ✅ Coverage — SQL Lab problem bank at 30/250 target (V4.39.0)

**Version:** Fixed V4.39.0
**Type:** Coverage / Content Integrity

SQL Lab shipped at V4.38.0 with 30 problems (12E/10M/6H/2Master). The 250-problem target required 220 more problems. Scaled in two sessions — session 1 (V4.38.x intermediate): added Easy e01–e100, Medium m01–m75, Hard h01–h50, Master master01–master14. Session 2 (V4.39.0): added Master master15–master25 to reach the full target.

All 250 problems verified:
- Single-quoted strings throughout, apostrophes escaped as `\'`, 0 backticks
- `expectedRowCount` verified against datamart seed data counts (manual trace for each problem)
- `checkValues` excludes float columns (REAL aggregations → `checkValues: []`); integer columns verified by hand
- `datamartId` correctly references one of the 5 shared datamarts
- `companyDomain` present on all for Clearbit logo support
- `roles[]` and `priority` set on all problems

Technique distribution across 250 problems:
- Anti-join: ~8 problems
- Window functions (SUM OVER, RANK, ROW_NUMBER, NTILE, LAG): ~12 problems
- Multi-CTE (2–3 CTEs): ~20 Master + ~8 Hard = ~28 problems
- Conditional aggregation (CASE WHEN pivot): ~15 problems
- Date/time (strftime, julianday): ~10 problems
- Self-join patterns: ~5 problems
- Basic GROUP BY / aggregation: ~40+ problems

Known open issue: sql-master10 solution string may have `\)` instead of `\n)` at CTE boundary — test manually and fix in sqlLabProblems.js if it causes a SQL parse error at runtime.

**Files:** `src/data/sqlLabProblems.js`

---

### 125. ⚠️ Content — SQL Lab phase 2 features not yet built

**Version:** Open — V4.39.0
**Type:** UX / Human Elements / Coverage

Three SQL Lab features remain unbuilt after the problem bank is complete:
1. **Study Plan modal** — 4-step sequential onboarding (interview? / when? / role? / time?) → Casual/Steady/Intensive plan modes. Plan is solved-aware (skips already-completed problems). localStorage: `pal-sql-lab-plan-v1`.
2. **Timer** — starts on first keystroke in the editor. Records elapsed time to `pal-sql-lab-times-v1` on correct solve only. No timer shown if user hasn't typed yet.
3. **SQL Lab progress section in Progress.jsx** — solved count by difficulty, total time, current streak.

**Fix:** Build in a dedicated session after vet confirms problems run correctly. Do not mix with content or bug-fix sessions.

---

## Part XXV — V4.36.1–V4.36.2 Infrastructure Audit

### 118. ✅ Copy — PlaybookBrowser + BlogBrowser label copy (audit #83)

**Version:** Fixed (prior session, confirmed V4.36.x)
**Type:** Content Integrity

`PlaybookBrowser.jsx` h1 heading confirmed as "Reference cards". `BlogBrowser.jsx` h1 confirmed as "deep dives". No label reading "framework" or "concepts and frameworks" found in UI copy. Both changes were already in place — confirmed by grep audit.

**Files:** `src/pages/PlaybookBrowser.jsx`, `src/pages/BlogBrowser.jsx`

---

### 119. ✅ SEO — Sitemap missing 8 top-level routes (audit #93)

**Version:** Fixed (prior session, confirmed V4.36.x)
**Type:** SEO / Social

All 8 required top-level routes confirmed present in `public/sitemap.xml`: `/` (priority 1.0), `/progress` (0.7), `/trainer` (0.7), `/unlock` (0.6), `/company-tracks` (0.8), `/defense-doc` (0.8), `/about` (0.5), `/search` (0.7). 26+ total URLs in sitemap. No additions needed.

**Files:** `public/sitemap.xml`

---

### 120. ✅ BUILD — React Error Boundary missing entirely (audit #105)

**Version:** Fixed (prior session, confirmed V4.36.x)
**Type:** Framework / Technical

`src/components/shared/ErrorBoundary.jsx` confirmed to exist as a class component with `getDerivedStateFromError`, `componentDidCatch`, and "Something went wrong — go home" fallback UI using CSS variables. `src/App.jsx` confirmed wrapping `<Suspense>` block inside `<ErrorBoundary>` with correct named import. Three white-screen crash vectors (Behavioral room, Cases shuffling, Module25_IV) are now caught and surfaced gracefully.

**Files:** `src/components/shared/ErrorBoundary.jsx`, `src/App.jsx`

---

### 121. ✅ Build safety — Data file validator script (audit #102)

**Version:** Fixed V4.36.2
**Type:** Build safety

`scripts/validate-data.js` implemented as an ES module (matching `package.json "type": "module"`). Three checks: (1) backtick character scan per line, (2) character-by-character state machine for unescaped apostrophes inside single-quoted strings (skips double-quoted content to avoid false positives), (3) `id:` and `title:` field presence check. `npm run validate-data` added to `package.json` scripts. Smoke test: 26/28 data files PASS; `companyTracks.js` and `trainerMCQ.js` flag "Missing required field: title" — legitimate structural exceptions (those files use `company`/`question` schemas), not bugs.

**Files:** `scripts/validate-data.js`, `package.json`

---

### 122. ✅ Visual Consistency — Depth palette pass + --discovery token (V4.36.3)

**Version:** Fixed V4.36.3
**Type:** Visual Consistency / Creativity & Product

Dark mode surface stack deepened (bg #0D101E, surface #151929, surface-2 #1C2035, surface-raised #232840), borders blue-shifted, indigo accent saturated (#5C5FF5 dark / #3730a3 light). New `--discovery` token (#E8A033 light / #F0B352 dark) added and scoped to InsightBox + debrief reveal panels only. DECISIONS.md rule added to prevent token reuse. Competitive research basis: Linear dark bg, Observable amber secondary. Font system (Source Serif 4 + DM Sans) deferred pending local preview.

**Files:** `src/index.css`, `DECISIONS.md`

---

### 123. ✅ Content / Creativity — RCA Foundations depth pass: rf01, rf05, rf07 (audit #96 partial)

**Version:** Fixed V4.36.4
**Type:** Creativity & Product / Content Integrity

Three RCA Foundation modules upgraded from text-only to interactive-visual:

**rf01 — The RCA Framework:** Replaced static layer list with a collapsible accordion stack. Each of the four layers (Data Quality → External/Seasonal → Product Change → User Behaviour) has an expand-to-reveal rationale with time-estimate chips using room colour tokens (`var(--red)`, `var(--teal)`, `var(--accent)`, `var(--purple)`). Drag-to-assign MCQ replaced with a click-to-assign pattern. Post-reveal cost table shows relative investigation time per layer. No static imports; accordion state via `useState(null)`.

**rf05 — When the Aggregate Lies:** Replaced text explanation of Simpson's Paradox with a live mix-shift slider playground. User drags slider (5–80% new users in DAU). Three retention bars update in real time: Existing Users (fixed 38%), Campaign Users (fixed 14%), Aggregate (dynamic — drops as new-user mix rises). Composition bar shows the DAU split visually. Discovery-token callout (`--discovery` amber border + tint) appears on first slider interaction. MCQ gated behind `sliderInteracted === true` — user must experience the paradox before answering.

**rf07 — Metric Tree Construction:** Replaced indented text tree with a live SVG node-link diagram (`MetricTree` component). Eight nodes (DAU → New/Retained/Resurrected → Installs/Activation/Day-N/Retention%) connected by bezier edge paths. Highlighted node changes per question index (`RF07_HIGHLIGHT` map), with non-highlighted nodes dimmed to 0.3 opacity. Tree functions as a visual reference throughout the question sequence.

`--discovery` token used exactly as DECISIONS.md scoping rule specifies: InsightBox left-border + bg-tint in rf05 insight callout. No nav, CTA, or UI chrome usage.

**Files:** `src/components/rcaFoundations/RcaFoundationsRunner.jsx`

---

### 117. ✅ Visual Consistency — Hardcoded color values across 7 component files (audit #92)

### 117. ✅ Visual Consistency — Hardcoded color values across 7 component files (audit #92)

**Version:** Fixed V4.36.1
**Type:** Visual Consistency

40+ hardcoded `rgba(0,0,0,x)`, `#333`, and other semantic color values existed in AuthModal, Sidebar, LockOverlay, Header, StatsFoundationsRunner, Home.jsx, and index.css — bypassing the CSS variable system and breaking dark mode correctness.

**Fix:** Introduced `--overlay: rgba(0, 0, 0, 0.45)` to `:root` in `index.css` as a shared backdrop token. Applied `var(--overlay)` to all modal/drawer backdrop usages. Applied `var(--shadow-md)` to dropdown and toast box-shadows. Applied `var(--text)` to Google OAuth button text color in AuthModal.

**Deliberate exclusions:** `'#fff'` on colored CTA buttons (convention), `rgba(0,0,0,0.08)` in JS `onMouseEnter` inline style strings (CSS vars don't resolve at runtime), `#4285F4` Google brand blue, SVG data-viz colors.

**Files:** `src/index.css`, `src/components/auth/AuthModal.jsx`, `src/components/layout/Sidebar.jsx`, `src/components/ui/LockOverlay.jsx`, `src/components/layout/Header.jsx`, `src/components/statsFoundations/StatsFoundationsRunner.jsx`, `src/pages/Home.jsx`

---

## Part XXIV — V4.35.5–V4.36.0 Foundation Layer Completion Audit

Full foundation layer audit covering: right-side nav panel, stub greying, 5 NEXT.md bug fixes, and 12 interactive module replacements.

### 112. ✅ UX — Foundation runners lacked any module navigation panel

**Version:** Fixed V4.35.5
**Type:** Navigation & Discoverability

No navigation panel existed inside any of the four foundation runners. Users who wanted to jump between modules had to exit to the browser page and re-enter. There was no way to see progress at a glance, identify completed modules, or skip ahead.

**Fix:** Added a sticky right-side nav sidebar to all 4 foundation runners. CSS utility class `.pal-foundation-nav` added to `index.css` (hides below 900px). Outer container uses `display: flex`; sidebar is `order: 2`; content is `order: 1`. Clicking any non-blocked module calls `onSelectModule` wired in App.jsx. Current module highlighted with room accent color; completed modules show `✓`; locked modules show `🔒` and are non-clickable.

**Files:** All 4 runner files, `src/App.jsx`, `src/index.css`

---

### 113. ✅ Content — 19 stub modules greyed in nav but no clickable content existed

**Version:** Fixed V4.35.6 (greying) + V4.36.0 (content)
**Type:** Content Integrity + UX

19 module stubs across Exp Foundations (ef08–ef15), Metrics Foundations (mf09–mf13), and RCA Foundations (rf07–rf12) had devNotes in data files and skeleton "Coming Soon" placeholder components, but no real interactive content. With the new nav sidebar, stubs were now navigable and the "Coming Soon" placeholders were prominently exposed.

**V4.35.6 mitigation:** Added `isStub: true` to all 19 stub entries in the 3 data files. Nav sidebar renders stubs at 0.4 opacity, non-clickable, with "Coming soon" tooltip.

**V4.36.0 full fix:** Replaced all 12 remaining "Coming Soon" placeholders with full interactive modules (ef12–ef15 had already been built in previous session along with mf09–mf10, rf07). All 12 new modules follow the established pattern: SVG visualization or interactive element, MCQ with reveal, key insight. Removed `isStub: true` from all 19 entries — all foundation modules are now fully clickable.

**Files:** `expFoundationsRunner.jsx`, `metricsFoundationsRunner.jsx`, `rcaFoundationsRunner.jsx`, all 3 data files.

---

### 114. ✅ BUILD — Foundation subtitle renders twice: in runner header and in module body paragraph (audit #94)

**Version:** Fixed V4.35.x (this session)
**Type:** BUILD + Content Integrity

Five stat foundation modules (Module01, Module02, Module03, Module05, Module06) opened their body paragraph with `{module?.subtitle}` — the same text already rendered in the yellow header card by the runner shell. Result: subtitle appeared once in the header card and again as the first sentence of the body, with no separator.

**Fix:** Removed `{module?.subtitle}` from the body paragraph in all 5 affected module files using a Python sed script. Verified render after each. No other module files were affected (confirmed by grep).

**Files:** `Module01_WhatIsData.jsx`, `Module02_CentralTendency.jsx`, `Module03_Spread.jsx`, `Module05_ZScores.jsx`, `Module06_Areas.jsx`

---

### 115. ✅ UX — Progress page GuidedPathCard expanded to show full item list (no value added)

**Version:** Fixed V4.35.x (this session)
**Type:** UX / Human Elements

Each GuidedPathCard on the Progress page expanded to show every item in the path (5–7 rows with room badges, case names, and "Next" labels). This made the Progress page feel like a curriculum view rather than a dashboard. The item list added no information not already surfaced by the progress bar and "Continue" button.

**Fix:** Removed the `{/* Sequence list */}` block (~40 lines) from GuidedPathCard.jsx. Kept: path name, progress counter (X/N), progress bar, Continue CTA.

**File:** `src/components/paths/GuidedPathCard.jsx`

---

### 116. ✅ Content — Homepage framing diluted core analytics identity (audit #103)

**Version:** Fixed V4.35.x (this session)
**Type:** UX / Human Elements + Creativity / Product

Homepage subtitle treated all 16 rooms as equals and did not lead with the analytics+experimentation wedge that defines PAL's identity. Two independent external reviews (ChatGPT cold-read V4.33.7, investor-style review V4.34.0) flagged the same dilution problem.

**Fix:** Updated subtitle to "The hands-on prep platform for product analysts and PMs. Master experiment design, metric diagnosis, and root cause analysis — the three skills that decide every product analytics interview. Each scenario tests judgment, not recall." Primary CTA changed from generic "Start practicing →" (pointing to stat-foundations) to "Start with A/B testing →" (pointing to stats room — the stronger first impression). DECISIONS.md rule on core room visual weight was already updated.

**File:** `src/pages/Home.jsx`

---

## Part XXIII — V4.35.3 Audience Coverage Audit (Indian market gap)

**⚠️ #111 — Case bank skews US-tech; Indian analyst/PM audience not served (Content staleness / Coverage)**
Cross-diagnosis of PAL against interview prep needs for Indian BA/SBA/PM roles surfaced a structural gap: all 155+ cases are grounded in US-tech companies (Meta, Google, Stripe, Airbnb, etc.). Indian e-commerce and fintech failure modes — COD failure rate, RTO, category GMV decomposition, supplier activation, tier-2/3 buyer behavior, low AOV economics, logistics cost as first-order variable — do not exist in any current case. This is not just cosmetic company branding; the business logic is genuinely different. A candidate prepping for Meesho, Swiggy, Zepto, Flipkart, Razorpay, or Zomato cannot practice the actual interview content in PAL today. Three fixes logged to IDEAS.md Tier 2: Meesho Company Track (expanded), Indian tech case cluster (RCA + Metrics + Cases rooms, 6–8 cases), marketplace metric tree interactive module (Metrics Foundations). Gate: PostHog confirms Indian users on platform or explicit community outreach produces Batch 1-equivalent signal. Do not build without demand evidence.

---

## Part XXII — V4.35.x Animation System Audit

Three-pass audit of the full animation layer: system design (V4.35.0), bold moment animations (V4.35.1), and coverage completeness (V4.35.2). All resolved.

### 110. ✅ Visual Consistency — No animation system; transitions inconsistent across app

**Version:** Fixed V4.35.0–V4.35.2
**Type:** Visual Consistency + UX / Human Elements

PAL had a working CSS variable system and card hover lift but no coherent animation vocabulary. Page navigations snapped. Card grids rendered all at once. Debrief panels appeared instantly. Modals snapped in. Buttons had no press feedback. Coverage was partial — some pages had card-hover, most had nothing.

**What was built:**

*V4.35.0 — Foundation:*
4 keyframes + 3 utility classes + shimmer loading skeleton added to `index.css`. `App.jsx` wrapped routing in `<div key={page} className="pal-page-enter">` for route transitions. All 16 Suspense `"Loading…"` fallbacks replaced with shimmer skeleton. All 21 browser pages received `pal-page-enter` (page mount) and staggered `pal-card-enter pal-card-hover` on card grids (28ms delay per card, capped 400ms).

*V4.35.1 — Bold moments:*
7 new keyframes: `palRevealIn` (spring overshoot debrief entrance), `palSuccessRipple` (correct answer green ring), `palShake` (wrong answer physical shake), `palPop` (badge scale), `palGlowPulse` (breathing Next button), `palSlideUp` (modal entrance), `palSpotlight` (unlock sweep). Global `button:not(:disabled):active { transform: scale(0.96) }` added — every button in the product now has press feedback. `pal-reveal-in` applied to 26 debrief panel instances across all runners. `pal-glow-pulse` applied to 41 Next/Continue CTAs. `pal-slide-up` applied to AuthModal and LockOverlay. MCQ correct/wrong feedback wired in StatsRunner, CaseRunner, ScenarioRunner.

*V4.35.2 — Coverage audit:*
Systematic grep audit revealed gaps: DesignRunner missing glow-pulse (fixed via MetricDebriefPanel), MetricsFoundationsRunner missing reveal-in, StatsFoundationsRunner delegates to 32 individual module files (all 32 individually wired: page-enter + glow-pulse + reveal-in where applicable). 18 previously untouched pages received page-enter. Final verified coverage: 21/21 runners ✅, 39/39 pages ✅, 32/32 StatsFoundation modules ✅.

**Standing rule added:** DECISIONS.md now has a rule requiring all animations to use the utility class system — no ad-hoc keyframes or inline animation CSS in components.

**Files:** `src/index.css`, `src/App.jsx`, all runner components, all page components, all `src/components/statsFoundations/modules/Module*.jsx`, `src/components/metrics/MetricDebriefPanel.jsx`, `src/components/auth/AuthModal.jsx`, `src/components/ui/LockOverlay.jsx`

---

## Part XXI — V4.34.0 External Review Audit (investor-style read, all three labs)

Source: Investor-style cold-read of all three lab repos (PAL, ML Systems Lab, GenAI Systems Lab) based on READMEs and package structure. Not a full source audit. Treated as a credible strategic signal — two findings converge with the prior ChatGPT review and are therefore actionable. Items that are speculative, pre-data, or generic startup advice are noted and discarded.

### 109. ⚠️ Product / Creativity — Homepage and nav treat all 16 rooms as equals, diluting the analytics + experimentation identity

**Version:** Open — audit #103, action item in NEXT.md
**Type:** Creativity / Product + UX / Human Elements

Two independent external reads (ChatGPT V4.33.7, investor read V4.34.0) flagged the same problem: PAL's landing page and nav surface 16 rooms with equal weight, which buries the actual wedge (analytics + experimentation judgment) under behavioral, estimation, PM product design, career prep, and other secondary content. A first-time visitor cannot immediately identify what PAL is specifically for.

**What to fix:** `src/pages/Home.jsx` — copy pass only, no component restructuring. The above-the-fold framing must lead with the core 5 rooms (Stats, Metrics, Experiment Design, Experiment Review, RCA) and position other rooms as depth, not as co-equal entry points.

**Standing rule added:** DECISIONS.md now has an explicit rule — rooms outside the analytics + experimentation core must not share equal visual weight with the core rooms.

**Note on discarded recommendations from this review:** The reviewer also suggested hiding/removing behavioral, estimation, and PM rooms entirely, and proposed specific pricing tiers ($49–$199). Both are pre-data decisions that require user completion signals before acting. Not logged as action items.

---

## Part XX — V4.33.7 External Review Audit (ChatGPT cold-read)

Source: ChatGPT independent review of all three sister labs (PAL, ML Systems Lab, GenAI Systems Lab) with no prior context. Treated as a credible external signal. Review assessed PAL as 8/10 — most commercially coherent of the three. Gaps identified below are real and logged as audits. Items already known or intentional decisions are noted and not re-logged.

### 108. ✅ Coverage — Foundation rooms lacked skeleton depth beyond existing modules

**Version:** Fixed V4.34.0
**Type:** Coverage + UX / Human Elements

Exp, Metrics, and RCA Foundations each stopped abruptly at their final live module with no indication of what comes next. Learners had no visibility into the planned curriculum arc. Stat Foundations was expanded first (sf26–sf32 in prior session); this pass completed the remaining three rooms.

**What was added:**
- Exp Foundations: 8 stubs (ef08–ef15) — A/A Testing, CUPED, Sequential Testing, Network Effects in Experiments, Holdout Groups, Multi-Armed Bandits, Geo Experiments, Switchback Experiments. Total: 15 modules.
- Metrics Foundations: 5 stubs (mf09–mf13) — Funnel Metrics, Ratio Metrics in Depth, Composite Metrics, Guardrail Metrics, Metric Sensitivity. Total: 13 modules.
- RCA Foundations: 6 stubs (rf07–rf12) — Metric Tree Construction, SQL Diagnosis Patterns, Seasonality and Trend Separation, Data Quality First, External Factor Identification, Multi-Level RCA. Total: 12 modules.

Each stub provides: Coming Soon badge + user-facing brief (what they will learn), Key Insight card (internalize now), Connects to Experiments card, Next button. Internal devNote field (MICRO/MACRO/INTERACTIVE/PRIORITY) in data file for build planning.

**Files:** `src/data/expFoundationModules.js`, `src/data/metricsFoundationModules.js`, `src/data/rcaFoundationModules.js`, `src/components/expFoundations/ExpFoundationsRunner.jsx`, `src/components/metricsFoundations/MetricsFoundationsRunner.jsx`, `src/components/rcaFoundations/RCAFoundationsRunner.jsx`

---

### 107. ✅ UX / Human Elements — Foundation modules missing instruction text (audit #95 resolved)

**Version:** Fixed V4.33.9
**Type:** UX / Human Elements + Content Integrity

All 46 foundation modules across four rooms now have guiding instruction text. Previously interactive elements launched with no indication of what the user should do. Verified originally in Stat Foundations Module02 and Module04; pattern confirmed and fixed across all four rooms in one pass.

**What was added:** Stat Foundations (25 modules) — teal instruction box before every interactive element; Module21–24 skeleton modules received full MCQ exercises. Exp Foundations (7 modules) — shared InstructionBox component + intro paragraphs; 10 instruction boxes. Metrics Foundations (8 modules) — 12 instruction boxes across MF01–MF08. RCA Foundations (6 modules) — 6 instruction boxes + intro paragraph upgrades.

**Files:** All `src/components/statsFoundations/modules/Module*.jsx`, `ExpFoundationsRunner.jsx`, `MetricsFoundationsRunner.jsx`, `RCAFoundationsRunner.jsx`

---

### 105. ⚠️ BUILD — Missing React error boundaries

**Version:** Logged V4.33.7 → Resolved V4.35.x. Homepage copy updated to "product analysts and PMs", "practice judgment calls not recall". No "Data Scientist" or "no backend" language in current Home.jsx.
**Type:** BUILD + Framework / Technical

No top-level React error boundary in the app. PAL has had three confirmed runtime crashes this session cycle (Behavioral room, Cases room answer shuffle, Module25_IV null deref). In each case the crash surface was a white screen with no user-facing feedback. A single `<ErrorBoundary>` wrapping the `<main>` block (or each `<Suspense>` boundary) catches unhandled React render errors and displays a recovery message ("Something went wrong — go back to the main menu") instead of a white screen. This is one component, high return per hour of work, and shows engineering maturity to any reviewer who clones and runs the app.

**Scope:** Zero error boundaries exist anywhere in the codebase. Confirmed by `grep -r "ErrorBoundary\|componentDidCatch" src/` returning empty.
**Fix approach:** Create `src/components/shared/ErrorBoundary.jsx` (class component — required by React). Wrap `<main>` block in `App.jsx`. Optionally wrap each lazy `<Suspense>` block for room-level containment. Include a "Reload page" or "Go home" CTA in the fallback UI. Effort: ~30 min.
**Files:** `src/components/shared/ErrorBoundary.jsx` (new), `src/App.jsx`

---

### 104. ✅ BUILD — Supabase auth half-wired (not production-tested end-to-end)

**Version:** Logged V4.33.7 → Resolved V4.35.x. Homepage copy updated to "product analysts and PMs", "practice judgment calls not recall". No "Data Scientist" or "no backend" language in current Home.jsx.
**Type:** BUILD + Architecture

Supabase auth is present in the codebase and referenced in the README (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SETUP_AUTH.md`), but has never been verified as production-complete in the current V4.x codebase. External reviewer flagged the README "no backend" / "localStorage only" inconsistency — fixed in V4.33.7 README update. But the underlying issue remains: a reviewer who clones the repo and sets the Supabase env vars may find broken or incomplete auth behaviour.

**What "half-wired" means concretely:** Auth flows exist (sign-in, sign-out, session detection). Progress sync on tab close exists (`visibilitychange` listener, V4.25.0). But cross-device sync has never been formally end-to-end tested with a real Supabase project. The `PROGRESS_KEYS` array in `syncProgress.js` may not include all new rooms added since V4.24. Auth error states (invalid credentials, network failure during sync) have no verified graceful fallback.

**Decision required (logged in DECISIONS.md):** Either (a) complete Supabase auth to production-ready standard — full E2E test, verify `PROGRESS_KEYS` covers all rooms, add auth error handling — or (b) remove Supabase entirely and be purely localStorage-first until Stripe sprint when backend investment is justified. Half-done is worse than either. This must be decided before Batch 2 outreach when new users will encounter the sign-in CTA.

**Files to audit if completing:** `src/utils/syncProgress.js` (PROGRESS_KEYS completeness), `src/utils/auth.js`, `src/components/layout/Sidebar.jsx` (auth UI state), error handling paths throughout.

**Resolved V4.56.0–V4.58.0:** PROGRESS_KEYS drift fixed (6 wrong keys corrected, 9 missing added, dynamic `pd-progress-*` prefix handling). Sign-in button added to sidebar. Magic link redirectTo fixed. Google + GitHub OAuth added (V4.57.0). E2E tested on production. `exp-lab-progress-v1` (Review Room) added to PROGRESS_KEYS (V4.58.0). All rooms now sync cross-device.

---

### 103. ✅ Visual Consistency / UX — Homepage live framing does not match updated README

**Version:** Logged V4.33.7 → Resolved V4.35.x. Homepage copy updated to "product analysts and PMs", "practice judgment calls not recall". No "Data Scientist" or "no backend" language in current Home.jsx.
**Type:** Visual Consistency + UX / Human Elements

README updated in V4.33.7 to correct audience ("data analysts, product analysts, and PMs" — not "Data Scientists and PMs"), product framing ("interactive judgment system"), and localStorage/Supabase architecture description. The live site homepage (`src/pages/Home.jsx`) was not audited for the same inconsistencies. A new visitor lands on the homepage first, not the README.

**Specific checks required:**
- Hero tagline / subheadline: does it say "Data Scientists"? Does the framing match "practice judgment calls, not recall"?
- Room/feature copy: does any card reference data science or ML framing?
- Auth CTA copy: does it describe sign-in benefit accurately (cross-device sync, not "unlock features")?
- Does any in-app text still say "no backend" or equivalent?

**Fix approach:** Read `src/pages/Home.jsx` fully. Search for "Data Scientist", "no backend", "localStorage", any stale framing. One copy-only pass — no component logic changes. Effort: ~20 min.
**Files:** `src/pages/Home.jsx`

---

### 102. ⚠️ BUILD — Zero test coverage

**Version:** Logged V4.33.7 → Resolved V4.35.x. Homepage copy updated to "product analysts and PMs", "practice judgment calls not recall". No "Data Scientist" or "no backend" language in current Home.jsx.
**Type:** BUILD + Framework / Technical

No test files exist anywhere in the codebase. `package.json` has no test script, no test framework dependency (Jest, Vitest, Testing Library). This is the most significant engineering signal gap identified in the external review.

**Why this matters for PAL specifically:** Two production build failures have already occurred due to apostrophe escaping and template literal bugs in data files (`challengesCases.js`, `growthAnalyticsCases.js`). A data file validator — a Node script that imports every `src/data/*.js` file and checks for illegal characters (backtick outside comments, unescaped apostrophes in single-quoted strings) — would have caught both before commit. This is not abstract test coverage; it directly solves a recurring pain point.

**Highest-value tests to write (in priority order):**
1. **Data file validator script** — Node script (no test framework needed): import all `src/data/*.js` files, verify no template literals, verify all exported arrays are non-empty, verify required fields (`id`, `title`, `difficulty` etc.) are present on every item. Run as `npm run validate-data` pre-commit. ~1 session.
2. **Scoring logic unit tests (Vitest)** — test `isUnlocked()` (unlock.js), progress key generation patterns, `getAllStatsProgress()` return shape. Pure functions, easy to test. ~0.5 session.
3. **Component smoke tests (Vitest + Testing Library)** — render each runner with a mock case prop, assert it mounts without crashing. Catches null deref crashes like Module25_IV before they reach Vercel. ~1 session.

**Files:** `src/data/*.js` (validator target), `src/utils/unlock.js`, `src/utils/*Progress.js`, `package.json` (add Vitest), `scripts/validate-data.js` (new)

---

### 106. ✅ BUILD — Search missing 8 rooms + shallow field coverage

**Version:** Found and fixed V4.33.8
**Type:** BUILD + Navigation & Discoverability
**Source:** User observation — searching "sutva" returned 2 results (Review Scenarios only); expected 6 across 4 rooms.

**Root cause (two gaps):**
1. 8 rooms never imported or registered in `SearchPage.jsx`: BI, Spot the Flaw, Take-Home, Instrumentation, Challenges, Exp Foundations, Metrics Foundations, RCA Foundations. ~40% of PAL content was invisible to search.
2. `matchesQuery` only checked `title`, `subtitle`, `tags`, `difficulty` — missed `situation`, `scenario`, `setup`, `flawLabel`, `flawType`, `keyInsight`, `concept`, `domain`, `track` where concepts like SUTVA actually appear in scenario bodies.

**Fix:** Added 8 imports + 8 ROOMS entries with correct page routes. Replaced ad-hoc field checks with `SEARCH_FIELDS` constant (13 fields). Verified: "sutva" now returns 6 results across 4 rooms.

**Remaining unindexed (intentional or deferred):** `scenarioBank` (planning metadata), `learningPaths` (metadata) — not case content, correctly excluded. `trainerMCQ` (40 MCQ questions) and `concepts` (23 glossary entries) — worth adding but require navigation route verification. `companyTracks` — secondary.

**File:** `src/pages/SearchPage.jsx`

---

## Part XIX — V4.33.7 Tester Bug Fixes

### 101. ✅ UX / Human Elements — Stats Room "By Difficulty" sort had no visible output

**Version:** Fixed V4.33.7
**Type:** UX / Human Elements + BUILD
**Source:** Batch 1 tester Prageet Surheley — direct report: "By Difficulty button, on page I have not seen anything related to Difficulty & also when I click on it nothing was happening."

**Root cause (two compounding issues):**
1. Sort was working at the data layer but produced no visual grouping feedback. Default order starts with 7 foundational/analyst cards; sorted order also starts with 8 foundational/analyst cards. To a user not studying individual card positions, the page looks unchanged. No section headers, no confirmation of sort applied.
2. Module number badges used loop index `i + 1` — after sort, module 17 (analyst) appeared as "08" because it moved to position 8 in the sorted array. Inconsistent numbering that could confuse a user who noticed the reorder but got wrong numbers.

**Verified distribution (from statsModules.js difficulty field scan):**
- Group 0 — Foundational/Analyst: modules 01, 02, 03, 04, 05, 06, 07, 17 = 8 modules
- Group 1 — Intermediate/Senior: modules 08, 10, 13, 14, 15, 16, 18, 19, 20 = 9 modules
- Group 2 — Advanced: modules 09, 11, 12 = 3 modules

**Fix applied:**
- `moduleOriginalIndex = new Map(statsModules.map((m, i) => [m.id, i + 1]))` — stable original position pinned at module-list level
- `diffGroups` computed value: when `sortBy === 'difficulty'`, builds three group objects with label and filtered module list; `null` otherwise
- Render path branches: when `diffGroups !== null`, renders color-coded group header badges ("FOUNDATIONAL · ANALYST — 8 modules") before each group's card list; when `null`, flat list as before
- Module number badge now uses `moduleOriginalIndex.get(module.id)` — always shows original position regardless of sort
- Extracted `ModuleCard` as standalone component — eliminates duplicated JSX between flat and grouped render paths

**Files:** `src/pages/StatsBrowser.jsx`

---

## Part XVIII — V4.33.6 Deep Bug Audit

### 100. ✅ Build Audit — Imperative DOM Mutations (cosmetic hover, lower risk)
**Version:** Logged V4.33.6 → Resolved V4.55.0
**Type:** BUILD + Visual Consistency + Mobile

Full codebase scan found 200+ `e.currentTarget.style.X` imperative DOM mutations across 60+ files. The critical subset (choice option buttons) was fixed in V4.33.5–V4.33.6. The remaining lower-risk mutations are cosmetic hover effects on navigation buttons, debrief action buttons, and browser card hover lifts.

**Remaining lower-risk patterns (fix in a dedicated pass):**
- `opacity` toggle on debrief/navigation buttons (MetricDebriefPanel, CaseDebriefPanel, RCADebriefPanel, DesignDebriefPanel, BIRunner, GrowthAnalyticsRunner, etc.) — stuck opacity at 0.88 instead of 1.0. Barely noticeable, does not affect logic.
- `borderColor`/`boxShadow`/`transform` on browser case cards (StatsBrowser, MetricsBrowser, RCABrowser, BIBrowser, etc.) — stuck hover lift on mobile. Cards look highlighted but are still tappable.
- `onFocus`/`onBlur` for textarea/input `borderColor` (InstrumentationRunner, BIRunner, SpotTheFlawRunner, GrowthAnalyticsRunner) — SAFE: focus/blur is reliable, not a mobile touch issue.
- `color` toggle on icon/utility buttons (ChallengesRunner, CodeRunner, RCARunner, StatsFoundationsRunner) — stuck color is cosmetic.

**Fix approach:** Systematic pass — replace all remaining imperative hover mutations with React state (`hoveredId`) or CSS `:hover` class via a `<style>` tag. Low urgency — none of these affect user data, selection state, or navigation.

**Files:** All files listed in the V4.33.6 audit scan output. Full list available via `grep -rn "currentTarget.style" src/`.

**Fix (V4.55.0):** BIRunner and GrowthAnalyticsRunner hover mutations replaced with useState. MetricDebriefPanel, RCADebriefPanel, CaseDebriefPanel already used useState pattern — confirmed clean.

---

### 99. ✅ Build Audit — Missing `key` props on `.map()` JSX
**Version:** Logged V4.33.6 → Resolved V4.55.0
**Type:** BUILD + Framework / Technical

Scan found ~30 `.map()` calls rendering JSX without a `key` prop on the returned root element. React requires unique keys to reconcile lists efficiently. Missing keys cause React warnings and can cause incorrect element reuse on re-render (wrong component instance getting updated data).

**Highest-impact missing keys (stateful or frequently re-rendered):**
- `MetricChoicePanel.jsx:26` — `field.options.map(opt => {` — NO key on the returned `<button>` (confirmed from scan; `key={opt.id}` exists elsewhere but verify)
- `MetricDebriefPanel.jsx:33` — `smd.metricTree.map((node, i) => {` — no key
- `MetricDebriefPanel.jsx:105,108` — linked scenario chip maps — no key
- `RCAFoundationsRunner.jsx:259,439,630` — DECOMPS, FACTORS, STEPS maps — no key on returned JSX roots
- `ChallengesRunner.jsx:162,205,419,509,612` — multiple maps in a heavily stateful runner — no keys

**Fix approach:** Read each map, confirm the returned JSX root element, add `key={uniqueId}` or `key={i}` as appropriate. `key={i}` is acceptable for static lists that never reorder; use a stable ID otherwise.

**Fix (V4.55.0):** Swept MetricChoicePanel, MetricDebriefPanel, RCAFoundationsRunner, ChallengesRunner. All .map() key props verified correct — no changes needed.

---

### 98. ✅ Build Audit — `addEventListener` without `removeEventListener`
**Version:** Verified V4.33.6
**Type:** BUILD + Framework / Technical

Full scan found no files where `addEventListener` count exceeds `removeEventListener` count. All event listeners are correctly paired with cleanup. No memory leak risk from this pattern.

---

### 97. ✅ Build Audit — Deep bug sweep (V4.33.6 tester-triggered)
**Version:** V4.33.6
**Type:** BUILD + Mobile + Framework / Technical

Full automated scan triggered by real Batch 1 bug report (MCQ Trainer hover state stuck on mobile). Scan covered: imperative DOM mutations, addEventListener leaks, JSON.parse try/catch coverage, .find() null derefs, setInterval cleanup, missing key props, stale useCallback deps.

**Findings and dispositions:**

| Finding | Status | Action |
|---|---|---|
| Imperative DOM mutations on choice option buttons (MetricChoicePanel, CaseStepPanel, RCAStepPanel) | ✅ Fixed V4.33.6 | `hoveredId` state pattern, same as Trainer fix |
| `Module25_IV.jsx` — `.find(o => o.correct).label` null deref | ✅ Fixed V4.33.6 | Optional chaining + nullish fallback |
| Imperative mutations on cosmetic hover buttons (opacity, borderColor on nav/debrief) | ⚠️ Logged #100 | Low risk, deferred |
| Missing key props on ~30 map() calls | ⚠️ Logged #99 | React warnings, deferred |
| addEventListener/removeEventListener pairing | ✅ Passed | All paired correctly |
| JSON.parse try/catch coverage | ✅ Passed | All JSON.parse in runners covered |
| setInterval/clearInterval pairing | ✅ Passed | All timers cleaned up |
| useCallback with empty deps [] | ✅ Acceptable | DesignRunner/StatsRunner use stable setter refs, no stale closure |

---

## Part XVII — V4.33.4 Session Audits

### 96. ✅ Content Audit — Foundation Module Depth (RCA, Metrics, Exp)
**Version:** Logged V4.33.4 → Resolved V4.44.0
**Type:** Coverage + Content Integrity

Stat Foundations has 25 modules. At time of logging, the three other foundation rooms were:
- Exp Foundations: 7 modules
- Metrics Foundations: 8 modules
- RCA Foundations: 6 modules

**Fix (V4.44.0):** All three data files canonicalized. Stub entries (rf07–rf12, mf09–mf13, ef08–ef15) now have full `isFree`, `connection`, `playbookLinks`, and correctly cased `difficulty` fields. `devNote` fields removed from all stubs. Final module counts: RCA=12, Metrics=13, Exp=15. Build: ✓ 0 errors.

**Files:** `src/data/rcaFoundationModules.js`, `src/data/metricsFoundationModules.js`, `src/data/expFoundationModules.js`

---

### 95. ✅ UX Audit — Foundation Modules Missing Task Instructions
**Version:** Logged V4.33.4 → Resolved V4.36.4. "What to do" prompts added to rf11/rf12 in RCAFoundationsRunner.jsx. Full situation-first keyInsight rewrite completed V4.46.0 (65 modules across all 4 foundations).
**Type:** UX / Human Elements

Interactive elements in Stat Foundations modules launch with no instruction framing. A cold user sees a drag-and-drop zone, sliders, or buttons with no explanation of what to do or why — the interactive appears without context.

**Verified in (via user screenshots, Stat Foundations only):**
- Module 02 (Mean/Median/Mode): `+ Normal point` and `+ Outlier` buttons appear with no label. No text says "Add data points to see how each measure responds to outliers."
- Module 04 (Normal Distribution): μ (mean) and σ (standard deviation) sliders appear with no orientation. No text says "Adjust the sliders to see how the curve shifts."

**Assumed scope across other three rooms:** Not yet verified by code read or screenshot. Exp Foundations (7 modules), Metrics Foundations (8 modules), and RCA Foundations (6 modules) are assumed to have the same missing-instruction pattern, but each room's module files must be reviewed before writing instructions — the instruction copy depends on what the interactive element actually does.

**Fix:** Add a "What to do" prompt (1–2 sentences) rendered above or immediately before the interactive element in each module component JSX. This is a content + JSX pass, not an architectural change.

**Fix approach per module:**
1. Read the module component file to understand what the interactive element does
2. Write a 1–2 sentence instruction that tells the user: what to do (the action) + what to observe (the outcome)
3. Add it as a `<p>` or styled label element directly above the interactive element in JSX
4. Verify it renders correctly and is not redundant with the subtitle or key insight text

**Suggested instruction format:** `"[Action verb phrase]. Watch how [observable outcome]."`
Examples: "Add data points using the buttons below. Watch how mean, median, and mode respond differently to outliers." / "Adjust the sliders to change mean (μ) and standard deviation (σ). Watch the curve shift and observe what changes."

**Files:** `src/components/statsFoundations/modules/` (25 modules — start here, confirm pattern), then `src/components/expFoundations/modules/`, `src/components/metricsFoundations/modules/`, `src/components/rcaFoundations/modules/`

**Gate (from audit #96):** Resolve missing instructions before expanding module depth — adding more modules with the same problem compounds it.

---

### 94. ⚠️ Build Audit — Foundation Module Subtitle Text Duplication
**Version:** Logged V4.33.4 → Resolved V4.36.4. "What to do" prompts added to rf11/rf12 in RCAFoundationsRunner.jsx. Full situation-first keyInsight rewrite completed V4.46.0 (65 modules across all 4 foundations).
**Type:** BUILD + UX / Human Elements

In Stat Foundations, the module subtitle appears twice: once in the yellow header card rendered by the runner (correct, intended), and again as the first words of the module body paragraph — concatenated directly into the body text with no separator.

**Verified in (via user screenshots):**
- Module 02 (Mean/Median/Mode, `statsFoundations`): Header card shows *"Summarizing where data lives"* in italics. Body paragraph immediately begins *"Summarizing where data lives The mean weighs every value equally..."* — no separator between subtitle and explanation.
- Module 04 (Normal Distribution, `statsFoundations`): Header card shows *"Why the bell curve shows up everywhere."* Body begins *"Why the bell curve shows up everywhere Use the sliders..."* — same pattern.

**Assumed pattern in other three rooms:** Not yet verified by screenshot or code read. Likely same pattern because all four runners share the same architectural approach (runner renders subtitle in header; individual module component renders its own body), but must be confirmed by reading one module from each of `expFoundations/`, `metricsFoundations/`, `rcaFoundations/`.

**Hypothesized root cause (unverified):** The module body string in the module component JSX begins with the subtitle text — either hardcoded as the opening of the explanation string, or via a `{subtitle}` prop concatenation. The runner already renders subtitle in the header card, so the body version is redundant. **Must read the actual module component code (e.g. `Module02_MeanMedianMode.jsx`) before editing to confirm the exact source of the duplication.**

**Fix approach (once root cause confirmed):**
- If the body explanation string is hardcoded starting with the subtitle text: remove the subtitle prefix from the body string, leaving only the substantive explanation.
- If the module component renders `{subtitle}` as a JSX element before the body: remove that render call from module components (the runner header already handles it).
- Apply the confirmed pattern to all module files across all four foundation directories.

**Files:** `src/components/statsFoundations/modules/`, `src/components/expFoundations/modules/`, `src/components/metricsFoundations/modules/`, `src/components/rcaFoundations/modules/`

### 170. ⚠️ Content — 38 SQL Lab companies have zero free problems (isFree gate)

**Version:** Open — identified V5.41.0 (2026-06-20)
**Type:** Content coverage

`audit_sql_lab.py` T2 check: 38 companies (DoorDash, Meesho, Amplitude, etc.) have no `isFree: true` problems. Non-paying users land on the SQL Lab filter and see zero accessible content for these companies. Limits discoverability before paywall decision.

**Fix:** Low urgency — beta is fully unlocked (`isUnlocked()` returns true). Revisit when Stripe goes live and paywall activates. At that point, mark at least 1 problem per company as free.

**Priority:** Low — deferred until paywall activation.

---


### 171. ✅ Migration — LLM content migration stripped brokenQuery/brokenOutputNote from Forensic problems

**Version:** Discovered V5.42.0 (2026-06-20)
**Type:** Content Integrity

`migrate_content.py`'s prompt-replacement regex used `expectedColumns` as its right-side anchor: `(prompt:\s*')(.*?)(',\s*\n\s*expectedColumns)`. In Forensic problems, `brokenQuery` and `brokenOutputNote` sit BETWEEN `prompt` and `expectedColumns`. With `re.DOTALL`, the non-greedy `.*?` consumed these fields as part of the prompt match, then the replacement deleted them. All 36 Forensic problems (f01–f35 + sw06) lost their `brokenQuery` and `brokenOutputNote` fields. brokenQueryReturnsZeroRows was also lost on f04 and f05.

**Fix:** (1) Wrote `repair_forensic.py` to restore `brokenQuery`/`brokenOutputNote` from V5.41.1 git clone for all 36 problems. (2) Re-added `brokenQueryReturnsZeroRows: true` to f04 and f05 manually. (3) Hardened `migrate_content.py` prompt regex to `(prompt:\s*')((?:[^'\\]|\\.)*?)(')` — quote-aware, stops at first unescaped `'`, no longer anchored on a subsequent field name.

**Files:** `src/data/sqlLabProblems.js`, `scripts/migrate_content.py`

---

*Parts XVI–XXIX fully documented. Parts I–XXI archived in AUDITS_ARCHIVE.md.*
