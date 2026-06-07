# Brain Transfer — V5.19.0

**Version:** V5.19.0 | **Build:** ✓ (last clean build V5.16.1, 1.72s) | **Date:** 2026-06-07 | **PM Audit:** #149 complete

---

## Session open protocol

**Read this file only.** CLAUDE.md is already in your system prompt. Read NEXT.md only if the next action below is unclear. Never open a source file without grepping first.

```
1. Connect repo: /Users/ASUS/Documents/GitHub/product-analytics-lab
2. Run: rm -f .git/index.lock .git/HEAD.lock && git status && npm run build
3. Read this file → read NEXT.md item 1 → start coding
```

**Grep before Read. Always. No exceptions.**

---

## Active file reference

Read these only when specifically needed — never at session open:

| File | Read when |
|---|---|
| `NEXT.md` | Next action is unclear |
| `DECISIONS.md` | About to make an architectural or product-scope decision |
| `AUDITS.md` | Checking open audit items |
| `METRICS.md` | Wiring analytics events or touching localStorage keys |
| `SQL_LAB_PLAN.md` | SQL Lab rubric, trap taxonomy, or audit process |
| `SQL_QUALITY_AUDIT.md` | Checking current batch scores or starting a new batch |
| `IDEAS.md` | Choosing what to build next |
| `docs/CONTENT_QUALITY_BAR.md` | Authoring new cases or scenarios |
| `docs/SCENARIO_BANK_TAXONOMY.md` | Review Room coverage and scenario families |

**Never read at session open:** LINEAGE, CHANGELOG, CROSS_LAB, ROLLOUT, README, anything in docs/archive/

---

## Current state

**17 rooms, 821 modules, 69 articles, 40 MCQ questions, 140 SQL problems (50E/40M/25H/15Master/10Forensic Batch1/10Forensic Batch2), 12 datamarts.**

Auth: Email magic link ✅ · Google OAuth ✅ · GitHub OAuth ✅ · Cross-device sync ✅

SQL Audit: 120/130 problems audited (Batches 1–10 complete). Batch 11 scored but edits not committed (context limit hit previous session).

---

## What was just done

**V5.19.0** — Meesho Company Track fully expanded. companyTracks.js: 42 total directorCards (up from 10). Added cards covering: all remaining RCA families (orders down/sessions stable, checkout conversion down, seller high-GMV/poor-experience, tail-query drop, payment success drop, catalog complaints, category orders up/contribution down), Senior/HM families (first 30 days, leading vs lagging indicators, gaming prevention, buyer/seller/economics balance, healthy vs unhealthy growth), and 9 numeric experiment readout cases with full metrics (search CTR trap C1, prepaid nudge C2, checkout friction C3, head/tail search model C4, discount-driven growth, RTO-but-orders-down, recommendation engagement trap, catalog quality/supply tradeoff, seller quality/new seller fairness). Also added to Meesho mentalModel: `answerPattern` (Objective→Decomposition→Primary→Guardrails→Segments→Logic→Decision→Action), `seniorLens` quote, and `watchOuts` array (6 candidate weakness reminders). Full prep handoff saved to `docs/MEESHO_PREP_HANDOFF.md`. No new files, no routing changes — pure content.

**V5.18.0 / V5.18.1** — Meesho directorCards phase 1. Added 7 cards from 10-pillar framework (RTO tier 2/3 divergence, prepaid vanity metric, new user repeat gap, retention/CSAT trap, seller cancellations by category, not-as-described returns, PDP-ATC gap). Added 6 more from senior question families (contribution bridge, segment harm readout, low-quality growth detection, head/tail search ship decision, checkout+RTO readout, funnel localisation framework). answerPattern, seniorLens, watchOuts added to mentalModel.

**V5.16.2 / V5.16.3** — Gate messaging + sidebar cleanup. Unlock.jsx: removed "no account needed" (sign-in is mandatory for non-preview cases — the access code is an upgrade on top of sign-in, not a replacement). Plans.jsx: added bridging line above comparison table ("All paid plans include Full Lab access — same content, different billing periods"). Sidebar.jsx: Judgment Benchmark removed from nav — Home CTA only. Gate logic confirmed correct: `requireUser` always checks `!user && !guestPreview`; access code unlocks content tier but does not bypass sign-in.

**V5.16.1** — Plans page restructured. Pricing cards now lead (Monthly ₹799, Quarterly ₹1,999, Annual ₹5,999 with "Best value" badge, Interview Sprint ₹2,499). Each card has a "Get early access →" button linking to WhatsApp DM — functional placeholder, no Stripe yet. Below cards: quiet beta section — "Subscriptions activate at launch. Currently in beta." with sign-in button and access code input inline. Comparison table (Guest/Free/Full features) stays below as reference. Old 3-tier card hero removed. Build ✓ 1.72s.

**V5.14.0** — Homepage repositioned. Headline: "Practice product analytics / interviews beyond SQL." Primary CTA: "Take the Judgment Benchmark →" (routes to benchmark, no auth needed). Secondary CTA: "Sign in to explore free cases." Role chips: Product Analyst · Growth Analyst · DA → Product · Senior Analyst. Social proof: "37 beta sign-ins in the first 48 hours of informal testing." Footer note: "No account needed for the benchmark." Build ✓ 1.65s.

**V5.13.0** — Product Analytics Judgment Benchmark shipped. New file: `src/data/benchmarkCases.js` — 5 mini-cases (metric design, A/B test design, A/B readout/ship-no-ship, metrics-drop RCA, SQL reasoning), each with prompt, 4 options, correctIdx, rubric explanation, nextRoom, and RECOMMENDED_PATH + AREA_META exports. New file: `src/pages/BenchmarkPage.jsx` — 3-screen flow (IntroScreen → QuestionScreen → ResultScreen), no auth required, localStorage persistence at `pal-benchmark-v1`, 4 PostHog events (benchmark_start, benchmark_case_answered, benchmark_complete, benchmark_cta_click). Result screen shows score ring (X of 5), per-area correct/missed rows, recommended next room card (based on first wrong area), sign-in CTA for guests, explore CTA for signed-in users. App.jsx: lazy import + `{page === 'benchmark'}` routing block, `onSignIn={() => setShowAuth(true)}`. Sidebar.jsx: "Judgment Benchmark" added as first item in DRILLS group (icon: target). Build ✓ 1.81s.

**V5.11.1** — Universe View animation. index.css: added `palArmDraw` keyframe (stroke-dashoffset 160→0, 0.55s ease-out) and `palNodeAppear` keyframe (opacity 0→1, 0.3s); both covered under `prefers-reduced-motion`. UniverseView.jsx: progress lines get `strokeDasharray=160` + `palArmDraw` with `animationDelay = idx * 70ms`; inner + outer nodes get `palNodeAppear` delayed 300–400ms after their arm. Arms draw clockwise one by one, nodes fade in after lines reach them. Build ✓ 2.07s.

**V5.11.0** — Analyst Universe view built. New file: src/components/shared/UniverseView.jsx — SVG star map, 7 workflow arms (Monitor/Diagnose/Understand/Communicate/Design/Analyze/Build), illumination driven by allRoomProgress from Progress.jsx, arm progress bar list below SVG, workflow narrative card. Progress.jsx: added SHOW_UNIVERSE_TOGGLE constant (set false to soft-hide), universeView state, toggle button in header ("✦ Universe" / "← Progress"), UniverseView rendered when active, existing progress content wrapped in `{!universeView && <>...</>}`. Build ✓ 2.27s. Original concept + V2 deferred items logged to IDEAS.md.

**PM Audit #149 (2026-06-06)** — Full PM audit complete. Created PM_AUDIT.md (8-section diagnosis: core promise, user journey, IA, free/paid boundary, retention/conversion, P0/P1/P2 plan, 12 metrics, final recommendation). AUDITS.md: added #149 entry with open/resolved status per finding. METRICS.md: added PM Audit #149 metrics table (12 metrics across acquisition/activation/engagement/conversion/content health). IDEAS.md: added 5 new items — free tier value anchor (P0), guestPreview quality audit (P0), nav IA restructure (P1), ambient unlock signal (P1), Company Track progress on Progress page (P1). Biggest risk: activation — guest and day-1 user do not reach a case debrief in session 1. Highest-leverage fix: forced first-case experience for guests and new sign-ins.

**V5.10.1** — Reverted "Reference Cards" back to "Frameworks" in Sidebar.jsx and PlaybookBrowser.jsx. "Frameworks" is what practitioners actually say — matching a bad page header was the wrong call. Build ✓ 2.22s.

**V5.10.0** — IA audit P0+P1 fixes. Sidebar.jsx: "Frameworks" → "Reference Cards"; "Failure Patterns" → "Analytics Failures"; Take-Home removed from DRILLS nav (routing preserved); Stats Calc moved from TOOLS to Experiments sub-section (contextually relevant, lower nav weight). BlogBrowser.jsx: "deep dives" → "Deep Dives". PlaybookBrowser.jsx: "Reference cards" → "Reference Cards". ChallengesBrowser.jsx: h1 "Cross-Room Challenges" → "Challenges", sublabel changed to "Cross-Room" for context. Trainer.jsx + InterviewQABrowser.jsx: practice path nudge card added (step 1/2 of 3, green/purple left border, explains MCQ → Q&A → Mock sequence). P2 items logged to IDEAS.md: Take-Home format decision, Playbook/Deep Dives/Reference Cards naming conflict. Build ✓ 2.13s.

**V5.9.0** — MCQ Quiz browse-first redesign + Interview Q&A alignment. Trainer.jsx: added BrowseScreen (room header pattern — green 36×36 icon box + "Concept Bank" title + "Start Quiz →" CTA + category select + DifficultyChips + full question card grid + recent sessions); added MCQQuestionCard (category left-border, badge, difficulty chip, 2-line clamped question text); SetupScreen now accessed via "Start Quiz →" with back link; main Trainer starts at 'browse' not 'setup'; handlePracticeOne() starts a 1-question session from any card click; "New Session" returns to browse. InterviewQABrowser.jsx: room header matches MetricsBrowser pattern (36×36 purple icon box + room label + title); filter row replaced with DifficultyChips (with per-tier counts) + category select + live count; matches platform DifficultyChips convention. Build ✓ 2.32s.

**V5.8.0** — MCQ Quiz + Interview Q&A filter revamp. InterviewQABrowser.jsx: removed 9 category pills + 4 difficulty pills; replaced with two styled `<select>` dropdowns (Category / Level) in a single filter row + "Clear filters" button + live count ("N of 26 questions"). Trainer.jsx: removed three all-caps labeled pill sections; Session Length stays as prominent pills; Category + Difficulty moved into collapsible "Filters ↓" toggle — collapsed state shows active filter chips with × dismiss buttons + Clear all; expanded state shows compact pills in a surface panel. Build ✓ 2.10s.

**V5.7.0** — Company Tracks P0 audit fixes. caseIndex.js: added `caseTitleMap` export (flat id→title lookup built from all index arrays). companyTracks.js: added `articleTitleMap` export (17 slug→human-title entries for all playbook articles used across tracks). CompanyTracks.jsx: imported both maps; case rows now show `caseTitleMap[caseId] || caseId` instead of raw ID; article rows show `articleTitleMap[articleId] || articleId` instead of raw slug; "Navigate →" → "Practice →"; "Cases by Room" → "Practice Cases". Sidebar.jsx: "Companies" → "Company Tracks". P1/P2 items logged to IDEAS.md Tier 1. Build ✓ 2.23s.

**V5.6.0** — Three Meesho track bug fixes. (1) caseIndex.js: added RCA25/26/27/28, C23/24/25, s26-ctr-margin-trap/s27-cvr-return-trap/s28-srm-segment-harm — all isFree:false. Root cause: openRCACase/openBusinessCase/openScenario all silently returned on `if (!c) return` because new cases were never added to the index. (2) CompanyTracks.jsx: selectedTrack+view now persisted to sessionStorage on every change and restored on mount — navigating to a case and pressing back restores the track detail exactly. (3) MentalModelCard redesigned: collapsible (open by default), sectioned layout with dividers, numbered circle badges for MECE drivers, teal left-border quotes for non-negotiable lines. Build ✓ 1.79s.

**V5.5.0** — SQL concept tags moved from problem card header to hints panel. SqlLabPage.jsx: removed `problem.tags.slice(0,3)` render from card header (was giving away SQL concepts before user attempted the problem); added "Concepts:" row inside the hints section that appears only after the user has opened at least one hint — tags render as small neutral chips. Build ✓ 2.33s. Deferred items logged to IDEAS.md Tier 1: stepwise hints, multi-select + company filter, schema inline layout, Interview Q&A filter sidebar + company filter, MCQ filter cleanup, Metrics Foundations error (repro needed).

**V5.4.0** — Company Tracks visual revamp + Meesho SBA track. companyTracks.js: added `faviconDomain` to all 8 existing tracks; Meesho SBA entry with `mentalModel` (north star, lens, 3 MECE drivers, answer structure, non-negotiables), `caseRefs` (RCA27/26/28/25, C23/24/25, s26-ctr-margin-trap/s27-cvr-return-trap/s28-srm-segment-harm, stat04/stat03, M01/M03, code01/code02 — 16 cases across 6 rooms), `comingSoonRoles: [PM, PA]`, `directorCards` (10 Round 3 pressure cards with expected direction + closing line). CompanyTracks.jsx full rewrite: emoji avatars replaced with Google Favicon API images (44×44 rounded square, border); colored left border removed from all cards; CTA button changed to `var(--accent)` uniform; `faviconUrl()` helper; `CompanyAvatar` component; `MentalModelCard` (teal left border, sections: north star/lens/drivers/structure/non-negotiables); `DirectorPressureCards` (expandable — click prompt to reveal expected + closing line); `RoleTabs` (active pill + coming-soon pills); emoji removed from header/stats/articles; `cases`, `design`, `browser` added to ROOM_COLORS. Build ✓ 2.25s.

**V5.3.1** — Unified Lab Architecture locked. DECISIONS.md updated: "Sibling labs linked passively" (V4.33.0) superseded by the Judgment World one-app spec — one URL, lab-layer routing, `?lab=` param, per-lab access codes (DAI2026/MSL2026/GAL2026/WORLD2026), room-aware `isUnlocked(room)`, shared Supabase, target sidebar structure, 5-step build sequence. No code changes — MD-only. Build unchanged at ✓ 2.65s.

**V5.3.0** — PostHog instrumentation pass. 5 new events wired: `gate_shown` (useEffect on authGate — fires with room + source:'room_open'|'post_case'), `user_signed_in` (SIGNED_IN auth handler), `gate_cta_clicked` (GateOverlay both CTAs — action:'sign_in'|'see_plans'), `forward_pointer_clicked` (ForwardPointerCard all 3 buttons), `debrief_copied` (DebriefCopyButton clipboard success). Files: App.jsx, ForwardPointerCard.jsx, DebriefCopyButton.jsx. METRICS.md updated. Build ✓ 2.65s.

**V5.2.0** — 3-tier access model (Guest / Signed-in Free / Full Access). Added `guestPreview: true` to the first Analyst-difficulty case in all 17 practice rooms (M01, RCA01, C01, s01-checkout-trap, stat01-pvalue-decision, d01-checkout-test, GA01, BI01, STF01, BEH01, EST01, pri01, inst01, pd01, TH01, CHL01, code01-funnel-sql) via Python bulk-insert. Updated `requireUser(guestPreview, isFree, room)` — third param added; guests blocked if `!guestPreview` (falsy for all non-tagged cases), signed-in free pass on `isFree`. 17 open handler call sites updated from `requireUser(item.isFree, room)` to `requireUser(item.guestPreview, item.isFree, room)`. DEFAULT_GATE_COPY updated to "Sign in free to keep practicing" with benefit-specific body. Plans page "1 full practice case per room" copy already matched the model. SQL Lab remains sign-in required (no guestPreview for SQL). Build ✓ 2.50s.

**V5.1.0** — V5.1 sprint complete. (1) Backslash bug: all `\'` in JSX text content fixed across Plans.jsx, Progress.jsx, App.jsx — ctaLabel, secondaryLabel, and JSX text nodes now render clean apostrophes. (2) ForwardPointerCard (Audit #147 ✅): CodeRunner + TakehomeRunner were the only two missing it — both wired, onNavigate prop added to call sites in App.jsx. All 17 runners now have ForwardPointerCard at debrief. (3) Forensic SQL gate split (Audit #148 ✅): f01–f10 stay isFree: true; f11–f25 set to isFree: false. 15 problems now gated. (4) Progress next-suggestion card: returning users (totalCompleted > 0) see a "Continue where you left off" card using getNextSuggested() — room + case name + one-click Continue button. Shown above empty-state card, both conditional. (5) Sidebar TOOLS/LEARN cleanup: Interview Q&A and Failure Patterns moved from TOOLS to LEARN; Stats Calc moved from DRILLS to TOOLS and removed from DRILLS. LEARN = reference; TOOLS = active utilities; DRILLS = format drills. (6) Sign-in tier expansion: assessed — current binary isFree model has no guest vs. signed-in distinction. Model designed (guestPreview field + requireUser signature change), logged in IDEAS.md Tier 1. Not built — clean 1-session project. Build ✓ 2.14s.

**V5.0.2** — Sidebar vocabulary + contextual GateOverlay copy. Sidebar.jsx: "PRACTICE ROOMS" → "ROOMS", "PRACTICE" flat group → "DRILLS" — eliminates the two-sections-both-called-practice confusion for new users. App.jsx: `requireUser(isFree, room)` now accepts a room key; `gateRoomRef` tracks which room triggered the gate; `ROOM_GATE_COPY` map (17 rooms) + `DEFAULT_GATE_COPY` fallback added; GateOverlay render reads contextual `{ title, body }` per room — each with outcome-framed copy specific to what\'s behind that gate. Build ✓ 1.94s.

**V5.0.0** — PM audit sprint: guest demo path + empty state onboarding + Plans copy. (1) P0.1: `requireUser(isFree)` now accepts the case\'s isFree flag — guests can open and complete any isFree case in any room without signing in. Safety-net useEffect narrowed to only redirect `sql-lab` (not all runners). All 17 open handlers reordered: find item first, then `requireUser(item.isFree)`. (2) P0.2: Progress.jsx day-1 empty state — accent-bordered card shown when `totalCompleted === 0`, with "Start Metrics", "Start RCA", "Try SQL Lab" CTAs. Replaces the empty progress dashboard dead-end. (3) P0.3: Plans.jsx full copy pass — all tier descriptions and feature rows now outcome-framed: Guest "Try it, no account", Free Account "Build your practice habit", Full Lab "Prep like you\'re in the room." Feature rows rewritten from feature lists to outcome statements. MD spine updated: NEXT/IDEAS/DECISIONS/AUDITS/METRICS all reflect PM audit findings. Build ✓ 2.28s.

**V4.99.0** — Guest routing fix. `signed-out` CSS class (hides sidebar) now only applied when `!user && page === 'home'` — not on all non-signed-in pages. Previously guests were sidebar-less everywhere after clicking "Explore", trapping them in one room with no navigation. Now sidebar is visible on all non-home pages regardless of auth state. "Explore without signing in" now navigates to `'foundations'` (FoundationHub) instead of directly to `'stat-foundations'`. Build ✓ 2.16s.

**V4.98.0** — Metric Universe Atlas panel. MetricsBrowser.jsx: ATLAS_CATEGORIES const (6 categories: Growth, Conversion/Funnel, Revenue/Monetization, Marketplace Health, Quality/Trust/Returns, Engagement; 3 metrics each with formula/decomposition/guardrails/interview angles). MetricAtlasPanel component (sticky right panel, category tabs, expandable metric cards). Toggle button in MetricsBrowser header (book-open icon, green when active). Layout widens to 1160px when atlas open. Sign-in free — no paywall check. Build ✓ 1.98s.

**V4.97.0** — Free-tier polish. (1) All 25 Forensic SQL problems set isFree: true (data-only change). (2) progressSaved toast: signed-in users leaving any runner page see a 2.5s "Progress saved" toast (teal, bottom-center, auto-dismiss). (3) Sign-in nudge on runner exit: anonymous users leaving any runner page see GateOverlay "Sign in to save your progress" with "Sign in — it\'s free →" CTA. Page-transition effect in App.jsx using prevPageRef tracks runner→browser transitions. Build ✓ 2.63s.

**V4.96.0** — 8 new cases authored. RCA27 "Orders Down/Sessions Flat" (CVR funnel → price elasticity from seller fee restructuring). RCA28 "RTO Spike Tier 2/3" (carrier decomp → COD refusal at door). C23 "Push Prepaid Adoption" (unit economics, 2nd-order cohort targeting). C24 "Block High-RTO from COD" (false positive rate, tiered intervention). C25 "Search: CVR vs Contribution" (incentive alignment, guardrail floor). s26 "The Margin Blind Spot" (pre-declared margin guardrail breach). s27 "The Easy Checkout Trap" (return rate +31%, "returns are logistics" called out). s28 "The Two Problems" (SRM explanation ≠ resolution, iOS segment harm, staff difficulty). Build ✓ 1.82s.

**V4.95.0** — Plans.jsx unified tier page. New `src/pages/Plans.jsx`: 3-tier layout (Guest / Free Account / Full Lab) with feature comparison rows, access code input in Full Lab column, "Sign in — it\'s free →" CTA in Free Account column, success state on unlock. App.jsx: Plans lazy-imported, 'plans' page title added, all `setPage('unlock')` paywall hits changed to `setPage('plans')`, Plans routing block added, GateOverlay secondary CTA updated to 'plans'. Sidebar.jsx: Plans nav item id changed from 'pricing' to 'plans'. Pricing.jsx redirect updated to 'plans'. Build ✓ 2.13s.

**V4.94.0** — GateOverlay + guest routing fix. New `src/components/shared/GateOverlay.jsx`: portal-based frosted overlay (createPortal, zIndex 500, backdrop blur), props: title/body/ctaLabel/onCTA + optional secondary. App.jsx: `authGate` state + `requireUser()` helper added; 14 practice open handlers all gate with `if (requireUser()) return`; Foundations open handlers untouched; `navigate('sql-lab')` gated for anonymous; AUTH_REQUIRED_PAGES useEffect now shows authGate instead of redirecting + showing auth modal directly; GateOverlay rendered at bottom of App return ("Sign in to practice" copy, secondary "See what\'s free" → plans). CompanyTracks.jsx + InterviewSimulator.jsx: inline gates replaced with GateOverlay — guests now see the actual room blurred behind the overlay. Build ✓ 2.79s.

**V4.93.0** — Audits #145 + #146 closed. (1) Audit #146: renderDebrief() replaced with structured paragraph parser — 4 block types detected by leading `**Header:**` pattern: Wrong Answer (red), Forensic Trap (orange), Sanity Check (teal), Analyst Judgment (yellow). Each renders as colored left-border block with section label. (2) Audit #145: StudyPlanModal stacking context bug fixed — modal was inside .sql-lab-main-panel (z-index: 5 stacking context), scoping its z-index: 200 within that context; .sql-lab-problem-panel (z-index: 5, later DOM) rendered over it. Fix: moved modal outside both panels to root fragment. Build ✓ 2.07s.

**V4.92.0** — Full statefulness pass complete. All 9 remaining runners now persist mid-case state. (1) Behavioral/Estimation/Prioritization: response text drafts saved on every keystroke, restored on mount from draft if no prior rating, cleared on rate/retry. (2) SpotTheFlaw: answer text draft saved while in STEP_SETUP, cleared on rate/retry. (3) ScenarioRunner: selectedDecision + checkedFlags persisted inline (uses shared progress.js — draft helpers added inline), cleared on submit/replay. (4) TakehomeRunner: phase + writeup + checkedRubric persisted, restored on mount, cleared on rate. (5) ChallengesRunner: all 5 state vars (screen, qIndex, answers, revealed, checkedPoints) persisted — Sets serialized to arrays for JSON, restored as Sets on mount, cleared on rate. (6) BIRunner/InstrumentationRunner: WorkScreen text persisted per-case with dedicated text key; outer screen state restored from draft, cleared on reveal. Build ✓ 2.05s.

**V4.91.0** — Audit #79 complete. Room header icon consistency. 6 rooms upgraded to the 36×36 colored box + Icon pattern: RCABrowser (search/yellow), MetricsBrowser (bar-chart/green), BehavioralBrowser (mic/purple + Icon import added), CasesBrowser (clipboard/purple), ScenarioBrowser (flask/accent + Icon import added + "Review Room" label added), CodeBrowser (target/yellow + Icon import added). Build ✓ 2.04s.

**V4.90.0** — S-grade debrief pass COMPLETE. All 130 non-forensic SQL Lab problems (50E/40M/25H/15M) upgraded with FV (Forensic Value — wrong query + wrong output + why plausible) and FA (Falsifiability — sanity check cross-query) in Batches 4–13. SQL_UPGRADE_PASS.md complete, SQL_LAB_PLAN.md Section 11 marked ✅. Standout FV=5 problems: e54 (IS NOT NULL vs != NULL returns zero rows), e62 (COUNT vs SUM on binary flag → 100% conversion rate), m01 (missing PARTITION BY in LAG → cross-account contamination), m16 (missing PARTITION BY → global running total), m21 (DESC vs ASC in NTILE inverts quartiles silently), master07 (NOT IN with NULL subquery returns 0 rows — complete silent failure). Build ✓ 1.67s.

**V4.89.0** — Auth persistence fix + statefulness completion. (1) Auth: INITIAL_SESSION event now handled alongside SIGNED_IN — fixes sign-out-on-refresh bug caused by Supabase v2 firing INITIAL_SESSION (not SIGNED_IN) when a session already exists. TOKEN_REFRESHED also handled. (2) DesignRunner: currentPhaseIndex now restores from completedPhaseIds.length; view restores to 'debrief' if lastScore exists; result recomputed on restore. (3) MetricsRunner: fieldChoices draft saved to pal-metrics-draft-v1 on every selection change; restored on mount if no completed attempt; cleared on submit and retry. Build ✓ 1.64s.

**V4.88.0** — Forensic Batch 3 (f21–f25) shipped. Staff-level traps: (f21) compounding fee deductions — payment processing applied to gross vs post-commission; (f22) linear vs compound growth projection (POWER); (f23) SaaS churn rate — end-of-period denominator inflates rate; (f24) restaurant prep time includes delivery duration; (f25) seller activity survivorship bias — zero-sale sellers excluded from avg. Mid-case statefulness enforced: CaseRunner + RCARunner now save draft state (currentPhaseIndex/submittedChoices/stepChoices) to localStorage on every change, restore on reopen, clear on completion/retry. Build ✓ 1.77s.

**V4.87.0** — Meesho prep signal extracted + applied. (1) spokenSummary field: rendering infrastructure added to RCADebriefPanel.jsx and CaseRunner.jsx — teal collapsible "30-Second Answer" toggle, shown when field exists. RCA01–RCA04 populated. (2) RCA25 "Seller Active Rate Declined": supply-side marketplace RCA, 3 phases (vintage decomp → T&S context → residual economics), senior difficulty, spokenSummary. (3) RCA26 "Net Revenue Declined, Orders Stable": per-order P&L decomposition (Revenue/order = fee + ad − logistics − discount − RTO), 3 phases, discount burn + RTO compound analysis, spokenSummary. Build ✓ 1.50s.

**V4.86.0** — Full Jatin feedback sequence complete. (1) rcaCases.js L3145 distractor fixed (DAU-down option replaced with plausible demand-side conflation). (2) Stats Foundations persistence: `statsFoundationsState.js` utility created; M01/M21/M23/M24/M25 now save/restore exercise state — 16 slider/visual modules correctly skipped (no exercise state to lose); M27/M28/M32 are stubs, skipped. (3) rf15 Hypothesis Ranking module: 3 scenarios (DAU drop/AOV drop/checkout CVR), user ranks 4 hypotheses per scenario by Impact × Likelihood × Ease, reveal shows expert ranking + per-hypothesis rationale + rubric reference table. Persist/restore. (4) "Never say I would look at the data" injected into RCA case leadershipNotes for C01 (checkout CVR), C03 (marketplace cancellations), C07 (fraud spike) — each with a domain-specific query example. Build ✓ 1.48s.

**V4.85.0** — rf14 Dominant Lever + Pruning module shipped. 3 scenarios (Revenue = Users × CVR × AOV, DAU = New + Retained + Resurrected, Checkout CVR funnel). 2-phase exercise: identify dominant lever → apply pruning rule. Persist/restore state. Reference table on completion. Wired into MODULE_COMPONENTS. businessCases.js C01 Phase 4 option C distractor rewritten (was "segment by demographics" — obviously wrong; now a plausible delivery-time benchmark cut with targeted feedback). Build ✓ 1.31s.

**V4.84.0** — Cross-foundations quality pass. (1) rf13 Routing Gate new module: 6 scenario routing exercise, reference table, persistence, shuffle. (2) Exp Foundations (ef01–ef15): all 15 modules persist + restore state; EF02/EF04/EF11/EF14 item arrays shuffle on first visit; EF01 distractors rewritten with plausible wrong options; intro already had foundational context. (3) Metrics Foundations (mf01–mf13): all 13 modules persist; mf01/mf04/mf05/mf06 item arrays shuffle; mf02 option C and mf11 options A+C rewritten; mf01 intro anchored with "what is metrics analytics." (4) Stats Foundations: different architecture (separate module files — 32 files); Module01 intro anchored with "what is statistics" sentence; persistence not applied (separate-file architecture requires different approach — logged). Build ✓ 1.93s.

**V4.83.0** — Full Jatin feedback implementation. (1) Answer persistence: all 12 RCA Foundation modules (rf01–rf12) now save/restore state via localStorage (`pal-rca-{id}-v1`). On re-opening any module, assignments, selections, MCQ answers, and revealed states are all restored. (2) Item shuffling: ITEMS (rf01), DECOMPS (rf02), FACTORS (rf04), SYMPTOMS (rf10), EVENTS (rf11) all shuffle on first visit and persist the shuffled order. (3) BLUF exercise: rf06 now has a 5-field BLUF practice exercise after the walkthrough — user picks correct phrasing per field, explanation reveals on selection, Complete button gated behind all 5 answers. (4) Remaining items logged: adaptive re-testing (IDEAS.md Tier 1, 2-session project) and new rf13 Routing Gate module (NEXT.md item 1b) with full session-ready specs. Build ✓ 1.98s.

**V4.82.0** — RCA Foundations quality pass (Jatin feedback). (1) rf01 intro: prepended 2-sentence "what is RCA" definition anchor. (2) Distractor rewrite: rf03 Q1 options C+D, rf03 Q2 options A+D, rf05 MCQ options A+C, rf07 Q1 option A, rf08 MCQ option C — all replaced with plausible misconceptions rather than obviously wrong filler. Explanations updated to distinguish correct answer from new distractors. (3) IDEAS.md: logged three new Tier 1 RCA module concepts from Jatin's v4.1 framework doc — Routing Gate, Dominant Lever + Pruning Rule, BLUF Conclusion. Build ✓ 1.99s.

**V4.81.0** — Forensic Batch 2 (f11–f20) shipped. 10 new forensic problems covering: average of averages (AOV, ARPU), JOIN fanout, wrong JOIN type, strftime year missing, ROW_NUMBER wrong ORDER BY direction, NULL in AVG with COALESCE, COUNT vs COUNT(DISTINCT) granularity, UNION ALL duplicates, wrong denominator, WHERE-after-LEFT-JOIN anti-pattern. All 10 use verified checkValues. Build ✓ 2.37s.

**V4.80.2** — Foundations access fix committed + forensic checkValues audit closed. All 4 foundation open functions had paywall checks removed (App.jsx); all foundation modules across all 4 data files confirmed `isFree: true`. Anonymous users can now access all Foundations content freely. Forensic checkValues audit (AUDITS #144): f02–f10 all confirmed correct — no additional fixes needed. Audit item closed as ✅.

**V4.80.1** — Auth gate bug fixes. Foundations runners removed from AUTH_REQUIRED_PAGES (Foundations are open to all — top-of-funnel). Second useEffect added: signed-in users redirected from 'home' to 'progress' reactively (fixes back-button from SQL Lab showing landing page). Build ✓ 2.17s.

**V4.80.0** — 3-tier monetization gate implemented. Anonymous users intercepted from all runners + SQL Lab via AUTH_REQUIRED_PAGES useEffect in App.jsx. getAccessTier() added to unlock.js. 27 Easy SQL problems updated to isFree: true. MONETIZATION.md created (full business model, tier spec, pricing, B2B path). DECISIONS.md monetization standing rules locked. Build ✓ 2.19s.

**V4.79.0** — Full signed-out/signed-in UX split. Home.jsx rewritten as clean full-screen landing (no sidebar, ghost analytics snippets, staggered entrance, glow-pulse CTA "Sign in to analyze →"). Signed-in: Progress is home, Progress removed from sidebar nav, logo navigates to progress. signed-out CSS class hides sidebar + resets margin. Build ✓ 2.02s.

**V4.78.0** — Signed-in users land on Progress instead of landing page. One-line routing fix in App.jsx SIGNED_IN handler. All 8 session backlog items logged: AUDITS.md #144-146, IDEAS.md Tier 1/2/3 entries for FV/FA UI, RCA/Metrics content, Postgres migration, MCQ revamp, Interview Sim customization, Pandas (Tier 3/no for SQL Lab). Build ✓ 2.07s.

**V4.77.0** — Forensic format shipped. New `difficulty: 'Forensic'` tier in SQL Lab. 10 forensic problems (f01–f10): integer division, missing quantity, COUNT DISTINCT, = NULL × 2, missing HAVING, re-subscriber churn, COUNT vs COUNT(DISTINCT zip), wrong GROUP BY dimension, off-by-one formula. DIFF_COLOR + filter chip + broken query block UI added to SqlLabPage.jsx. Spec in SQL_LAB_PLAN.md Section 12. Build ✓ 2.16s.

**V4.76.0** — S-Grade Upgrade Pass Batch 3 (Easy e21–e30) complete. FV+FA additions to all 10 problems + MJ/assumption statement on e27+e29. Standouts: e27 integer division all-zero trap (FV=5), e30 COUNT(*) vs COUNT(DISTINCT) returning 187% activation rate (FV=5), e28 churn-with-active-sub business judgment check. Build ✓ 1.61s.

**V4.75.0** — renderDebrief() fix + S-Grade Upgrade Pass Batch 2 (Easy e11–e20) complete. renderDebrief() renders **bold** and paragraph breaks in all debriefs — without this, all FV/FA/MJ additions were invisible (literal asterisks, wall of text). e11–e20 all get FV+FA additions. SQL_UPGRADE_PASS.md Batch 2 scored. Build ✓ 1.96s.

**V4.74.0** — S-Grade Upgrade Pass infrastructure locked + Batch 1 (Easy e01–e10) complete. New 10-dimension rubric (adds MJ/FV/FA) in DECISIONS.md. Section 11 added to SQL_LAB_PLAN.md. SQL_UPGRADE_PASS.md created as tracking artifact. Layer 2 (forensic/impossible/cascade/code-review formats) logged in IDEAS.md Tier 1. No build needed (MD-only changes + debrief additions to sqlLabProblems.js).

**V4.73.0** — SQL Quality Audit COMPLETE. Batch 13 (final 7 Master problems): 6/7 flagged. 3 rewrites: master18→Seller Scorecard (Etsy, marketplace, conditional aggregation + RANK), master19→Driver On-Time (DHL, logistics, SLA analytics), master25→Post Engagement (Reddit, social_network, ROW_NUMBER PARTITION BY). 3 debrief upgrades: master12 (3-CTE coverage formula + tie-break), master14 (active-account filter caveat), master26 (recursive chain explanation). master27 clean. Build ✓ 2.21s. **THE 13-BATCH SQL QUALITY AUDIT IS COMPLETE.**

**V4.72.0** — SQL Audit Batch 12 (Master master01–master10). 4/8 flagged. Fixes: master02 company (Meta→Wayfair) + checkValue; master03 rewritten (channel LTV clone→category gross margin, 3-table JOIN + RANK); master05 expectedRowCount fixed (3→2), checkValues added, company (Chime→Revolut); master10 debrief cleaned (unfinished text removed) + TC upgraded. Build ✓ 2.41s.

**V4.71.0** — MD consolidation + SQL Audit Batch 11. MD: deleted 4 noise files (SESSION_KICKOFF, SESSION_STARTER, SPINE_PROTOCOL, GIT_COMMIT_TEMPLATE), created docs/archive/ with 6 archived files (AUDITS_ARCHIVE, CHANGELOG_ARCHIVE, PLATFORM_ARCHITECTURE_MEMO, PRD_V1, ROADMAP_V425, SETUP_AUTH), trimmed NEXT.md (183→35 lines), trimmed BRAIN_TRANSFER history, removed duplicate CSS/animation content from DECISIONS.md. SQL Batch 11: 3 reclassifications (master07 already Master, master13+master21 Hard→Master), 2 rewrites (master13→3-CTE cohort repurchase, h33→AVG OVER PARTITION BY category benchmark, h34→self-join prescription safety). Build ✓ 1.85s.

**V4.70.0** — SQL Quality Audit Batch 10 (Hard h01–h17). Best batch: 7/10 pass, 2 perfect scores (h01=35, h11=35). 3 rewrites: h07 (MoM clone→new/returning split), h10 (ROW_NUMBER clone→4-table JOIN P2P NULL trap), h13 (SUM(SUM) clone→PERCENT_RANK LTV). h17 checkValues fixed.

**V4.69.0** — SQL Quality Audit Batch 9 (Medium, file positions 31–40). 4/10 flagged. 4 rewrites: h14 (funnel temporal ordering), h22 (completion rate JOIN), h25 (MoM revenue LAG), h27 (activity bucketing LEFT JOIN+CASE WHEN). 3 new datamarts: hr_analytics, marketplace, food_delivery.

---

## Next action — V5.19.0 shipped. Session complete. Resuming Tuesday with fresh token limit.

Tuesday P0: Meesho track final two families — Experiment Design (12 questions, 3-part format: unit of randomisation + primary metric + guardrail) and Project Defense (13 questions — user will share project context at session open). SQL family: grep sqlLabProblems.js for 'meesho' tag to check coverage before adding.

Tuesday P1: V5.17.0 gate audit — grep every data file for `guestPreview: true` and verify each also has `isFree: true`. If any guestPreview case has `isFree: false`, a guest can bypass auth but still hit the unlock gate, creating the contradictory flow. Fix: set `isFree: true` on all guestPreview cases.

Confirm `VITE_POSTHOG_KEY` in Vercel before Tuesday — needed to capture benchmark and Meesho track funnel from day 1.

**Forensic format — Batch 2 (f11–f20) shipped.** 20 forensic problems total. Batch 3 (f21–f25, staff-level: compounding errors, metric definition mismatch, survivorship bias) completes the planned set. Spec in SQL_LAB_PLAN.md Section 12.

**3-tier monetization gate live + foundations fully open.** Anonymous → Foundations fully accessible (no paywall check, all isFree: true). Anonymous → practice runners → auth modal. Signed-in + DAI2026 → everything unlocked.

**Landing page shipped.** Signed-out = full-screen landing. Signed-in = Progress as home.

---

## Reusable shared components

| Component | Path | Props |
|---|---|---|
| ForwardPointerCard | src/components/shared/ForwardPointerCard.jsx | room, onNavigate, onNext |
| FoundationNudgeCard | src/components/shared/FoundationNudgeCard.jsx | foundationRoom, foundationLabel, onNavigate |
| BeginnerOnboardingTrack | src/components/shared/BeginnerOnboardingTrack.jsx | onNavigate |
| StaffLayer | src/components/shared/StaffLayer.jsx | leadershipNote |
| HowTo | src/components/shared/HowTo.jsx | steps[] |
| Breadcrumb | src/components/shared/Breadcrumb.jsx | items[] |
| DifficultyChips | src/components/shared/DifficultyChips.jsx | value, onChange |
| Icon | src/components/shared/Icon.jsx | name, size, color |

**failureMode field pattern:**
```js
failureMode: {
  weakAnswer: 'The candidate [specific wrong reasoning].',
  interviewerFollowUp: '"[The probe question]"',
},
```
Runners that render it: BIRunner, GrowthRunner, InstrumentationRunner, BehavioralRunner, EstimationRunner, DesignDebriefPanel.

---

## Before closing this session

- [ ] Update this file: version, what was done, next action
- [ ] Update NEXT.md: log what shipped, reorder queue
- [ ] Build: `npm run build` (0 errors)
- [ ] Git commit from Mac terminal (command below)

---

## Git commit

**Standard:**
```bash
cd "/Users/ASUS/Documents/GitHub/product-analytics-lab" && rm -f .git/index.lock .git/HEAD.lock && git add -A && git commit -m "V4.X.X: [description]" && git push origin main
```

**If git is stuck (lock files):**
```bash
cd "/Users/ASUS/Documents/GitHub/product-analytics-lab" && rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/main.lock && git add -A && git commit -m "V4.X.X: [description]" && git push origin main
```

**If push is rejected:**
```bash
git fetch origin main && git push origin main
```
