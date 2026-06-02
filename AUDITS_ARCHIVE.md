# AUDITS_ARCHIVE.md — PAL Audit Log (pre-V4.30)

*Audits #1–#75 archived here. Current audits in AUDITS.md.*

## Part I — Architecture & Strategic Audits

### 1. ✅ Platform Architecture Audit (18 Questions)
**Version:** Pre-V1.2
**Output:** `docs/PLATFORM_ARCHITECTURE_MEMO.md`

Founding document. Answered 18 hard questions before any multi-room code was written: upgrade vs. rebuild, room IA and ordering, what to build next, platform shell vs. rooms-first, Stats Room interaction-first constraint, KPI Playground approach, free vs. paid design, scoring consistency across rooms, data schema architecture, commercial credibility criteria, and 10 things that should not be built yet (social features, mobile app, video content, LMS structure, AI evaluation, team accounts, API embeds, notifications, Stats-as-textbook, Product Cases Room).

---

### 2. ⚠️ Platform Risk Assessment
**Version:** Pre-V1.2
**Output:** 6 risks documented in `docs/PLATFORM_ARCHITECTURE_MEMO.md`

Six material risks identified before building: (1) content production bottleneck as the binding constraint, (2) platform dilution — 6 thin rooms worse than 1 excellent one, (3) Stats Room becoming a textbook if interaction-first is compromised, (4) losing the "practice the calls" positioning, (5) premature paid tier before 3+ paid rooms exist, (6) activation problem — solved by content quality, not gamification.

---

### 3. ✅ Ecosystem Homogeneity Audit
**Version:** V3.2.4
**Output:** 3 features ported from genai-systems-lab; 1 security fix

Compared PAL against its sibling product (genai-systems-lab) for feature parity. Found 3 gaps: PostHog analytics instrumentation, bundle performance (lazy loading), and learning path outcome clarity. All 3 ported. A fourth finding — missing `.gitignore` — became the security audit (see #33).

---

### 4. ✅ Platform Gap vs. Interview Frequency
**Version:** V3.4
**Output:** 6 new rooms/expansions in V3.4

Mapped every room against the actual distribution of question types in DS/PM interviews at top-tier tech companies. Found 6 gaps: RCA thin, Cases thin, no behavioral room, no Fermi/estimation room, no causal inference beyond A/B, no interview-format SQL. All 6 addressed.

---

### 5. ✅ Scenario Bank Taxonomy
**Version:** Pre-V1.2
**Output:** `docs/SCENARIO_BANK_TAXONOMY.md`

Defined 15 scenario families (metric_conflict, srm, guardrail_breach, novelty_peeking, hte_subgroups, multiple_testing, sutva_interference, when_not_to_experiment, underpowered, cuped_variance, geo_holdout, switchback, b2b_constraints, right_censored, multi_touch) before writing content. Planned 50 scenarios, distribution targets: 20 Analyst / 20 Senior / 10 Staff. No family > 4 scenarios, none at only one difficulty level.

---

### 6. ⚠️ Beta Open-Access Decision
**Version:** V2.3
**Output:** `isUnlocked()` returns `true`; all 44 items free during beta

Product audit of whether to charge before having usage data, retention signal, or testimonials. Decision: remove all paywalls during beta. Rationale: get traffic and habit first, introduce paid tier after metrics exist. Unlock code preserved in file but inactive.

---

### 7. ✅ GenAI Positioning Audit
**Version:** V3.1
**Output:** GenAI is a thread, not a room — 3 GenAI Playbook articles added

Evaluated whether GenAI warranted its own room. Decision: GenAI is a lens applied across existing rooms (analytics, experimentation, RCA) rather than a standalone room. This kept the platform scope clean and avoided thin content. GenAI articles added to the existing Playbook under a GenAI Analytics category instead.

---

### 8. ⚠️ Free/Paid Tier Design Audit
**Version:** Pre-V1.5, revisited V3.6
**Output:** Free tier defined per room; Stripe CTA wired but not live

Audited which items should stay permanently free. Decision: Stats Room fully free (best marketing), 1–2 analyst-level scenarios free per room, everything else paid. Real Stripe integration only makes sense with 3+ paid rooms — deferred. Beta unlock code approach through V3.

---

## Part II — Source Material Audits

### 9. ✅ Wayfair-Style Interview PDF Benchmark
**Version:** V1 (pre-build)
**Output:** 4 targeted scenario fixes applied to S01–S08

Read real Wayfair-style DS interview prep materials before building V1 content. Benchmarked the 8 original Review Room scenarios (S01–S08) against actual interview question difficulty and framing. Applied 4 targeted fixes — scenario contexts, decision option calibration, debrief specificity — before V1 shipped.

---

### 10. ✅ Interview Prep PDF Source Audit for Blog
**Version:** V2.4/V3.5
**Output:** Blog topic list derived from real prep materials; `IDEAS.md` created

Audited existing prep materials (Metric Universe Atlas, RCA Packet, Experimentation Prep, Ambiguous Problem Breakdown, DS Master Handbook) before defining the Blog/Learn layer. This ensured blog topics mapped to the actual concepts candidates need for interviews — not a generic analytics syllabus.

---

## Part III — Content Quality Audits

### 11. ✅ Content Quality Bar Definition
**Version:** Pre-V1.5
**Output:** `docs/CONTENT_QUALITY_BAR.md`

Defined the 8-dimension minimum standard every scenario must pass: decision hardness, metric readout tension, warning flag validity, decision option calibration (Junior Miss / Analyst-Ready / Senior-Ready / Staff-Level), debrief specificity (400–700 words, scenario-specific), business context specificity, single failure mode per scenario, difficulty tier consistency. 10-item ship checklist. This document governs all content from V1.5 forward.

---

### 12. ✅ V1.6 Stats Room Mechanic Audit
**Version:** V1.6
**Output:** All 8 STAT modules redesigned from Q&A to claim-evaluation mechanic

Audited the V1.5 Stats Room format against the core product principle — "decision-first, always." Found that basic Q&A was teaching recall, not judgment. Redesigned all 8 modules around a stakeholder claim + data panel where the user evaluates whether the claim holds. This made Stats Room consistent with the Review Room's judgment-first format.

---

### 13. ✅ RCA SQL Step Specificity Audit
**Version:** V3.1
**Output:** `sqlStep` added to all 6 RCA cases with case-specific queries

Before shipping the SQL Validation Step in RCA, audited each proposed query against the specificity standard: not generic SQL, but the exact query a senior analyst would write to validate that specific diagnosis. E.g. RCA01: Visa success rate by platform pre/post deploy; RCA06: true resolution rate with re-contact classification by intent + confidence bucket. Six queries, six case-specific validations.

---

### 14. ✅ V3.0 Top-10 Playbook Article Voice Audit
**Version:** V3.0
**Output:** 13 articles with story-first rewrites, keyTakeaways, references

Audited the 10 highest-traffic Playbook articles for voice quality: story-first opening, human stakes, interview-applicable framing. All 10 received: emotional/story-first opening rewrite, `keyTakeaways` (5 bullets), `references` with real citations and URLs. Principle established: scenario hooks before definitions, pressure and ambiguity as the real context.

---

### 15. ✅ V3.2.1 All-Playbook Content Quality Audit
**Version:** V3.2.1
**Output:** 3 full rewrites, 2 opening narrative improvements

Reviewed all 117 Playbook articles against the story-first standard. Four genuinely thin articles found (framework/checklist only, no opening scenario): `take-rate`, `data-quality`, `search-ranking-metrics`, `guardrails`. Full rewrites on first three. Opening narrative improvements on `guardrails` and `segment-before-aggregate`.

---

### 16. ✅ Flagship Article Identification Audit
**Version:** V3.2.3
**Output:** `end-to-end-experiment` identified as most-referenced article; given flagship treatment

Audited which Playbook article was most referenced by scenarios, other articles, and learning paths. `end-to-end-experiment` was the answer. Given full rewrite: SRM failure story opening, 8-stage walkthrough (pre-flight → SRM investigation → business communication), Decision Scenarios framework box, 6 keyTakeaways. Three other high-reference articles also rewritten: `decision-rule`, `five-question-types`, `stakeholder-communication`.

---

### 17. ✅ Company Questions + Career Articles Audit
**Version:** V3.x (task #82)
**Output:** Thin articles in Company Questions + Career & Interview categories rewritten

Separate pass from the 117-article audit, specifically targeting the Company Questions and Career & Interview categories which had been written at a lower standard. Articles in these categories were often generic ("here's how to answer X type of question") without concrete examples. Rewritten with specific scenarios and interview-ready framing.

---

### 18. ✅ Playbook Worked Examples Coverage Audit
**Version:** V3.5
**Output:** All 47 framework articles given worked examples (39 added in V3.5, 8 in V3.4)

Audited all framework articles for the presence of worked examples. Found that framework articles (vs. case study articles) were explaining the framework without ever showing it applied to a real scenario. Added worked example sections to all 47. 8 were done in V3.4, remaining 39 in V3.5.

---

### 19. ✅ Blog Content Completeness Audit
**Version:** V3.5
**Output:** 0/80 → all ~80 articles fully written

V3.5 found the Blog/Learn layer was at 0% content completion — 80 article shells existed but none had body content. This was a full content completeness audit: 80 articles, 6 batches, all written with inline post reader, CTAs linking to the corresponding practice room, and stubs for genuinely coming-soon content.

---

### 20. ✅ V4.1 Review Scenario Quality Audit (S01–S08)
**Version:** V4.1
**Output:** All 8 Review scenarios rewritten to current quality bar

All original S01–S08 scenarios evaluated against the current standard. All 8 failed the debrief specificity test — debriefs were generically written and didn't add precision beyond what was visible in the metrics. Rewritten with: `stakeholderSummary`, `nextTestIdeas` (3 each), `keyTakeaways` (5 each), `scenarioFamily`, `conceptTags`.

---

### 21. ✅ V4.1 Stats + Metrics Enrichment Audit
**Version:** V4.1
**Output:** STAT01–08 and M01–M06 enriched

Both rooms were shipped at an earlier, lower standard. All 14 items evaluated against the quality bar defined after V3.4. Enriched: deeper debrief specificity, stronger business context, richer failure mode explanations.

---

### 22. ✅ V4.1 Growth Analytics playbookLinks Audit
**Version:** V4.1
**Output:** `growthAnalyticsCases.js` playbookLinks corrected to real article IDs

Audited all Growth Analytics case playbookLinks after the V3.5 Blog layer was written. Found links were pointing to placeholder IDs that didn't match the actual published article IDs (`growth-accounting`, `cohort-retention-curves`, etc.). Corrected all references.

---

## Part IV — Visual & Design Audits

### 23. ✅ Design Direction + CSS System Audit
**Version:** V1.1
**Output:** Full CSS theme system (`index.css`), all 16 components migrated from hardcoded hex to CSS variables

Audited the V1 hardcoded hex color system — unscalable, inconsistent across 16 components, no light/dark mode. Defined correct aesthetic direction: "serious analytical learning workspace." Reference points: Linear, PostHog, Retool, Stripe Docs — not edtech, not gamified. Full CSS custom property system introduced. All 16 components migrated.

---

### 24. ✅ Color System Conflict Audit
**Version:** V2.2 (found), V3.2.2 + V4.1 (tails fixed)
**Output:** Metrics teal → green across 5 files; 2 teal remnants fixed later

Discovered Metrics Room and Design Room both used `var(--teal)` — visually identical rooms. Metrics rebranded to `var(--green)` across `Home.jsx`, `MetricsBrowser.jsx`, `JudgmentBank.jsx`, `QADashboard.jsx`, `Progress.jsx`. Two `var(--teal)` remnants in `MetricsRunner.jsx` survived and were caught in the V3.2.2 bug audit.

---

### 25. ✅ WCAG AA Contrast + Keyboard Accessibility Audit
**Version:** V3.2.3
**Output:** Contrast fixes, keyboard nav on all card divs, responsive nav

Light mode `--text-dim` was `#9ca3af` (contrast ~2.8:1, fails WCAG AA). Dark mode was `#545b7a` (~2.1:1). Both corrected. `role="button"`, `tabIndex={0}`, `onKeyDown` added to all clickable card divs across 5 browsers. Header nav given `overflowX: auto` + scrollbar hiding for narrow viewports.

---

## Part V — UX & Product Perspective Audits

### 26. ✅ First-Impression Pre-Beta Audit
**Version:** V2.2
**Output:** 3 P0 and 4 P1 issues fixed

Full front-door review before private beta launch (~6–8 testers). Unlock page copy was V1-era (44 items, copy still said 8 scenarios). Color conflict. Duplicate heading in CasesBrowser. Homepage had 3 equal-weight CTAs with no primary. StatsBrowser showing raw internal text as card descriptions. Progress reset only cleared one room. Nav label was internal developer terminology.

---

### 27. ✅ Home Page Density Audit (×2)
**Version:** V3.2.4 and V4.3
**Output:** CTA reduction, section cleanup, room grid tightening both passes

Two separate passes. First (V3.2.4): reduced 3 equal CTAs to 1 primary + 1 secondary, removed developer diary section. Second (V4.3): further density reduction — cleaner hero, tighter room grid, less visual noise. Principle: every element must either orient first-time users or re-orient returning ones.

---

### 28. ✅ Intuitive UX Audit — Home.jsx
**Version:** V3.2.4 (task #97)
**Output:** Multiple Home.jsx UX issues fixed

Dedicated audit of Home.jsx UX issues beyond density: element ordering for first-time vs. returning users, CTA hierarchy, section label clarity, guided paths placement relative to readiness for zero-completion users. Fixed `Progress.jsx` guided paths column `order` to appear before the readiness column when `totalCompleted === 0`.

---

### 29. ✅ Role Readiness Score Design Audit
**Version:** V4.1
**Output:** 4-tier readiness model (Getting Started / Analyst / Senior / Staff) on Progress page

Audited what criteria should constitute each readiness tier. Getting Started: any progress; Analyst: coverage across 3+ rooms; Senior: completion across 6+ rooms with stats; Staff: full breadth including causal inference, behavioral, and estimation. This is a product design audit — what signals matter for readiness, not just a count.

---

### 30. ✅ Design ↔ Review Scenario Pairing Completeness Audit
**Version:** V1.6 and V3.0
**Output:** All D01–D08 paired with corresponding Review scenarios (and vice versa)

Audited that every Design scenario had a valid `pairedReviewScenarioId` and every Review scenario had a valid `pairedDesignScenarioId`. Found D04 had wrong paired ID (`'s06-five-metrics'` instead of `'s06-five-metrics-problem'`) — caught by QA Dashboard. The pairing concept itself was a product design audit: design→review is the most powerful learning loop on the platform.

---

## Part VI — Feature Completeness & Consistency Audits

### 31. ✅ Automated Content Integrity — QA Dashboard (63 checks)
**Version:** V2.1
**Output:** `src/utils/contentAudit.js` + `src/pages/QADashboard.jsx`

With 44 items across 6 rooms and a dense cross-reference graph, manual checking became unreliable. Built automated 63-check audit tool. Checks: item counts, required field presence, concept ID resolution, learning path item validity, paired scenario ID validity, `isFree` flag consistency. Still live at `/qa` route (hidden footer link).

---

### 32. ✅ QA Dashboard First Run — 5 Failures
**Version:** V2.1.1
**Output:** 3 files fixed; 63/63 passing

First run of the QA Dashboard found 5 failures: all 8 stat modules missing `subtitle`, 5 concept IDs missing from `concepts.js`, D04 wrong paired scenario ID. All fixed. Score went from 5 failures to 63/63 passing.

---

### 33. ✅ Next-Case Navigation Completeness Audit
**Version:** V3.3.1
**Output:** `onNext` added to ProductDesign and Code runners

After V3.2.3 added next-case nav to RCA, Metrics, Cases, and V3.3 added it to Design and Prioritization, discovered ProductDesign and Code runners were missed. Explicit pass over every runner in the app. Two missing. Fixed.

Principle established: any feature added to "all rooms" must be verified with an explicit coverage pass, not assumed complete.

---

### 34. ✅ Progress completionMap Gaps Audit
**Version:** V3.5
**Output:** 6 missing rooms added to completionMap

Audited `Progress.jsx` completionMap against the full room list. Found 6 rooms with zero Progress tracking: Code, ProductDesign, Prioritization, Behavioral, Estimation, StatFoundations. All added.

---

### 35. ✅ V4.1 Progress.jsx Growth Analytics Gap
**Version:** V4.1
**Output:** Growth Analytics room added to completionMap

After GA room was built, a targeted audit found it was missing from `Progress.jsx` completionMap tracking entirely. Fixed.

---

### 36. ✅ V4.1 Sitemap Completeness Audit
**Version:** V4.1
**Output:** `#growth-analytics` route added to `sitemap.xml`

After building the Growth Analytics room, audited `sitemap.xml` against all routable pages. Found `#growth-analytics` missing. Added with priority 0.9.

---

### 37. ✅ V4.2 BookmarksBrowser Wiring Audit
**Version:** V4.2
**Output:** BookmarksBrowser wired into App.jsx + Header

BookmarksBrowser was built but not connected to routing or navigation — a complete feature that was unreachable. Caught during a post-build wiring audit. Fixed.

---

### 38. ✅ Progress Page Coverage Audit — V4.5 Rooms
**Version:** V4.5
**Output:** 5 new rooms fully tracked in Progress.jsx

After V4.4 added Challenges, BI, Spot the Flaw, Take-Home, and Instrumentation, audited Progress.jsx for coverage. None of the 5 appeared in: completion bars, heatmap date stores, completionMap, `totalCompleted`/`grandTotal`, or `getNextSuggested()`. All gaps fixed.

---

### 39. ✅ Learning Path Coverage Audit
**Version:** V3.5
**Output:** 2 new paths added (Code Track + Full-Stack DS Interview); outcome statements added to all 4

Audited existing 4 learning paths (Beginner, Experimentation, Product Analytics, GenAI) against room coverage. Found no path for code-focused learners and no path covering the full DS interview loop. Added Code Track and Full-Stack DS Interview paths. Also found all 4 existing paths lacked concrete outcome statements — added "You'll…" framing to all.

---

## Part VII — Bug & Diagnostic Audits

### 40. ✅ Broken Rooms Diagnostic — Metrics + RCA
**Version:** V3.x (task #80)
**Output:** Metrics + RCA rooms restored to working state

Separate diagnostic pass after discovering Metrics and RCA rooms had broken. Root-caused and fixed both. This was not a planned audit — triggered by regression during active development.

---

### 41. ✅ Internal Bug Audit (Agent Cross-Check)
**Version:** V3.2.2
**Output:** 5 bugs found and fixed

Spawned an independent agent to cross-check all routing, paywall, progress, and nav logic before community beta. Found: `onOpenItem` missing branches for product-design and prioritization (silent failures), `CasesBrowser` hardcoded `isLocked={false}`, `onResetAllProgress` missing 2 localStorage keys, `product-design` had no nav entry, two `var(--teal)` remnants in MetricsRunner.

---

### 42. ✅ localStorage Key Consistency Audit
**Version:** V3.2.2
**Output:** Reset function fixed to cover all rooms; Product Design prefix-iteration added

During the bug audit, found that `onResetAllProgress` used flat key deletion for most rooms but Product Design used a per-scenario prefix pattern (`pd-progress-*`) requiring key iteration. Inconsistency in key naming conventions across rooms would have caused silent incomplete resets. Fixed and documented.

---

### 43. ✅ V4.1 Quick Fixes Pass
**Version:** V4.1
**Output:** Pricing count corrected, error boundary added, social proof updated, per-room reset fixed, review queue bugs fixed

Post-release audit pass on V4.1 changes found: Pricing page showing wrong item count, missing React error boundary (a crash in one room would blank the whole app), social proof copy still showing V3.x numbers, per-room progress reset not covering all new rooms, review queue edge case bugs (empty queue state, last-item handling).

---

## Part VIII — Performance & Technical Audits

### 44. ✅ Bundle Performance Audit
**Version:** V3.2.4
**Output:** All 19 page/runner components converted to `React.lazy()` + `Suspense`

Audited bundle composition — all 19 rooms and runners were statically imported, meaning every room's code was in the initial JS bundle. Converted all to `React.lazy()` with the named-export `.then(m => ({ default: m.X }))` pattern. Initial bundle now excludes all room code. Each room loads its chunk on first visit and caches thereafter. `Suspense` wraps the entire `<main>` content area.

---

### 45. ✅ Previous Apostrophe Instance — challengesCases.js
**Version:** Pre-V4.5.1 (first occurrence)
**Output:** `Maps'` unescaped apostrophe fixed in `challengesCases.js`

First occurrence of the single-quote apostrophe class of build error. `Maps'` in a `leadershipNote` field caused a Vite/Rolldown parse error. Fix: escaped as `Maps\'`. This established the syntax rule that was later violated again in `growthAnalyticsCases.js`.

---

### 46. ✅ Apostrophe Syntax Safety Scan — growthAnalyticsCases.js
**Version:** V4.5.1
**Output:** 3 violations fixed; production build restored

Vercel build failure at `growthAnalyticsCases.js:146:206`. Three unescaped apostrophes in `leadershipNote` single-quoted strings: `product's` (line 146), `cohort's` (line 227), `team's` (line 603). Fixed via Python. Rule: all JS data files use single quotes only, apostrophes escaped as `\'`, no template literals.

---

## Part IX — Security Audit

### 47. ✅ .env / Secret Management Audit
**Version:** V3.2.4
**Output:** `.gitignore` created; `.env.example` added

Caught during the PostHog integration pass. `.gitignore` was missing entirely — any `.env` file with a real PostHog or Stripe key would have been committed to the public repo on the next `git add .`. Added `.gitignore` with `.env` and `.env.*` entries (with `!.env.example` exception). Created `.env.example` documenting both env vars.

---

## Part X — Mobile Responsiveness Audits

### 48. ✅ Mobile Audit — V3.6 Monetization Readiness
**Version:** V3.6
**Output:** Touch targets, container widths, flex-wrap fixes across 6 files

Pre-launch production-readiness pass on a ~375px viewport. Findings: Header nav buttons lacked 44px minimum touch target (Apple HIG minimum). Four page containers lacked `width: 100%` and `boxSizing: border-box`. One interactive module's drop-zone row lacked `flexWrap: wrap` — columns didn't stack on mobile.

---

### 49. ✅ Mobile Audit — V4.5 New Rooms
**Version:** V4.5
**Output:** `minmax(min(Xpx, 100%), 1fr)` fix across 8 files

All rooms added since V3.6 audited for mobile overflow. 8 files found using `minmax(Xpx, 1fr)` patterns where the minimum exceeded mobile viewport width. Fix: `minmax(min(Xpx, 100%), 1fr)` — inner `min()` clamps minimum track size to viewport width. Files: BIBrowser, InstrumentationBrowser, ChallengesBrowser, ScenarioRunner, PlaybookBrowser, BlogBrowser, MetricsBrowser, Progress.

---

## Part XI — SEO & Distribution Audit

### 50. ✅ SEO Readiness Audit
**Version:** V3.6
**Output:** OG tags, Twitter card, JSON-LD structured data, sitemap, robots.txt, dynamic titles, og-image.png

Audited discoverability before monetization rollout. Found: no OG metadata (shares showed blank previews), no sitemap (crawlers couldn't find all rooms), no robots.txt, no JSON-LD structured data, document title was always "Product Analytics Lab" on every page. All gaps addressed. 13-URL sitemap created. Dynamic titles via `useEffect` on every route change (15 distinct titles).

---

## Part XII — Feature Coverage Audits (Content-Side)

### 52. ✅ Leadership Lens Coverage Audit
**Version:** V4.4
**Output:** `leadershipNote` added to all 8 GA cases and RCA01–RCA08

Before shipping the Leadership Lens feature, audited which cases warranted a Staff/Director-level perspective note and verified full coverage across both rooms. Every GA case (ga01–ga08) and every original RCA case (RCA01–RCA08) received a `leadershipNote`. Cases in other rooms were explicitly excluded as out of scope.

---

### 53. ✅ Active Recall Textarea Runner Coverage Audit
**Version:** V4.1
**Output:** Textarea added to Stats, Behavioral, Estimation, RCA runners; others explicitly excluded

Audited which runners should receive the active recall textarea (`pal-notes-v1`). Decision criteria: rooms with free-response thinking (stats concepts, behavioral stories, estimation approaches, RCA diagnosis) warranted it; structured-decision rooms (Review, Metrics, Cases, Design) did not — they already have structured response fields. Four runners confirmed and added.

---

### 54. ✅ Defense Doc Generator Keyword Taxonomy Audit
**Version:** V4.4
**Output:** Keyword-match taxonomy covering all 11 rooms in `DefenseDocGenerator.jsx`

To build the keyword-match engine that maps a job description to room recommendations, audited all 11 rooms for their canonical interview keywords. Each room mapped to Primary / Secondary / Light tier based on keyword signal strength. This required reviewing every room's case tags, difficulty profiles, and the most common JD phrases that signal need for that skill.

---

### 55. ✅ Deep Copy + Voice Audit — Scenarios, Room Descriptions, Playbook
**Version:** V3.x (task #81)
**Output:** Playbook articles, scenario copy, and room descriptions rewritten to consistent voice

Broader than the specific article audits (audits #14, #15, #16). This pass reviewed scenario copy (the situation text and debrief narrative in Review, RCA, Metrics cases), room descriptions on the Home page and browser headers, and Playbook article body tone for consistency with the "senior analyst voice" standard — specific, pressure-aware, never generic.

---

### 56. ✅ Stat Foundations ↔ Playbook Interlink Audit
**Version:** V3.5 (task #153)
**Output:** Playbook article references added to all 12 SF modules

After both the Stat Foundations room and the full Blog/Learn layer were built, audited which Playbook articles should be linked from each SF module. Ensured every SF module had at least 1–2 relevant Playbook article references — creating the "learn the concept → read the framework → practice the case" loop for every stat foundation topic.

---

### 57. ✅ Stats → Stat Foundations Back-Link + Difficulty Sort Audit
**Version:** V4.1 (task #158)
**Output:** Stats modules linked back to SF; difficulty sort applied to learning paths

After SF room was added, audited whether the existing Stats room modules linked back to the relevant SF foundational module ("not sure about p-values? → see Module 06"). Added back-links across all Stats modules that had SF equivalents. Also audited learning path ordering — items were not consistently sorted by difficulty within paths; corrected.

---

### 58. ✅ Behavioral Question ID Consistency Audit
**Version:** V4.1 (task #144/#150)
**Output:** Behavioral question IDs migrated to consistent format

Discovered behavioral questions had inconsistent ID schemes — some used `beh01`–`beh08` (lowercase), some used `BEH01`–`BEH08` (uppercase), and the expansion to BEH21–BEH30 used a gap-numbering scheme that skipped BEH09–BEH20. Audited all references across `behavioralQuestions.js`, `behavioralProgress.js`, and `App.jsx`. Migrated to a consistent format.

---

## Part XIII — Analytics Instrumentation Audit

### 51. ✅ PostHog Event Taxonomy & PII Audit
**Version:** V3.2.4 → updated V4.6
**Output:** `src/utils/analytics.js`; PII sanitization, explicit event-only tracking; `case_completed` shipped

Before wiring PostHog, audited: what events matter (page_viewed, case_opened, paywall_hit, unlocked), what should never be tracked (PII: email, name, ip), and what PostHog defaults to disable (`autocapture: false`, `capture_pageview: false` — only explicit events collected). Strip function removes PII keys via `sanitize_properties`. Env-var gated — app works identically without the key. **V4.6 follow-through:** `case_completed` event added to all 18 room runners, closing the biggest funnel gap — we can now measure completion rates and self-rating distributions per room.

---

---

## Part XIV — V4.x Gap Audits

### 61. ✅ `case_opened` Tracking Gap — V4.4+ Open Functions
**Version:** V4.6 (scan) → fixed V4.6.1
**Output:** 4 open functions confirmed missing `track('case_opened', ...)`

Scanned all `openX()` functions in `src/App.jsx`. Rooms added in V4.4 and later — `openBICase`, `openSTFCase`, `openTakehomeCase`, `openInstrumentationCase` — never received `track('case_opened', ...)` calls. The V4.x batch builds wired routing but missed the analytics line. Fixed: added `track('case_opened', { room, id, title: c.title })` to all four functions, plus `window.scrollTo` for consistency.

---

### 62. ✅ `onResetAllProgress` Missing 9 localStorage Keys
**Version:** V4.6 (scan) → fixed V4.6.1
**Output:** Reset function in `src/App.jsx` confirmed incomplete, now complete

Added 7 missing keys (actual confirmed keys from utils/): `pal-bi-progress-v1`, `pal-stf-progress-v1`, `pal-takehome-progress-v1`, `pal-instrumentation-progress-v1`, `pal-growth-analytics-progress-v1`, `pal-challenges-progress-v1`, `pal-bookmarks-v1`, `pal-notes-v1`. Reset All Progress now clears all 19 keys + pd-progress- prefix pattern.

---

### 63. ✅ Sitemap Missing 8 Routes Added in V4.x
**Version:** V4.6 (scan) → fixed V4.6.1
**Output:** `public/sitemap.xml` updated — 22 URLs, all live routes indexed

Added `#bi`, `#spot-the-flaw`, `#take-home`, `#instrumentation`, `#challenges`, `#metrics`, `#search`, `#consult`. Also promoted `#metrics` and `#growth-analytics` to priority `0.9`. Sitemap now at 22 URLs covering all rooms, practice tools, and discovery tools.

---

### 64. ✅ Template Literals in 9 Data Files — Latent Build Risk (Resolved V4.12.0)
**Version:** V4.6 (scan)
**Output:** 9 data files confirmed using backtick template literals

DECISIONS.md rule: "No template literals (backticks) in data files — Vite/Rolldown throws parse errors." Scan found backticks in: `prioritizationScenarios.js` (37), `codeModules.js` (159), `rcaCases.js` (60), `productDesignScenarios.js` (192), `scenarios.js` (60), `estimationProblems.js` (15), `challengesCases.js` (15), `growthAnalyticsCases.js` (32), `designScenarios.js` (16). The rule was written after build failures caused by unescaped apostrophes *within* template literals — the backticks themselves haven't broken the build in all cases. However, the risk is real: any future apostrophe inside a template-literal field in these files will cause a silent Vercel parse failure. The rule should either be enforced (migrate all backtick strings to single-quoted + escaped apostrophes) or clarified (backticks allowed but apostrophes inside must be escaped). Currently unresolved.

---

### 66. ✅ SF Module Button Labels + Duplicate Playbook Sections
**Version:** V4.6.2
**Output:** Button labels corrected across sf12–sf20; duplicate playbook rendering removed from sf14–sf20; free tier extended to sf01–sf04

Three distinct issues found in a single SF completeness pass:

1. **"Complete ✓" on non-final modules** — sf12 and sf13 had `var(--green)` "Complete ✓" buttons left from when they were the last module. sf15 and sf16 had the same. All changed to "Next concept →" (`var(--yellow)`, matching sf01–sf11).
2. **"Next concept →" on the final module** — sf20 (Practical vs Statistical Significance) incorrectly used "Next concept →"; changed to "Complete ✓" (`var(--green)`) as the true final module.
3. **Duplicate Playbook Reading sections** — sf14–sf20 rendered their own inline `module.playbookLinks` block. `StatsFoundationsRunner.jsx` already renders playbook chips after each module (lines 340–360). All 7 inline blocks removed.
4. **Free tier too thin for cold path** — Only sf01–sf02 were free, leaving new users unable to complete even the beginner cluster. sf03 (Variance & SD) and sf04 (Normal Distribution) changed to `isFree: true`, giving a complete beginner path before the paywall.

---

### 68. ✅ Five-Perspective Comprehensive Audit — V4.8.0 (fixes in V4.8.1)
**Version:** V4.8.0
**Output:** 7 findings across Build Safety, Config Completeness, Component Registration, Content Integrity, Navigation & Routing

Systematic sweep across all five high-priority audit dimensions. Run after SF causal inference expansion (sf21–sf25).

**Audit 1 — Build Safety**

1. ✅ **statsModules.js and statsFoundationsModules.js: zero backticks** — confirmed clean. Both the most recently edited data files pass build safety check.
2. ⚠️ **9 data files contain template literals (backticks)**: `prioritizationScenarios.js` (37), `growthAnalyticsCases.js` (32), `estimationProblems.js` (60), `rcaCases.js` (60), `scenarios.js` (60), `productDesignScenarios.js` (192), `codeModules.js` (159), `designScenarios.js` (16), `challengesCases.js` (15). These are actual JS template literals used as field values. This is tracked as audit #64 (open ⚠️) — the build has not broken since V4.5.1, suggesting Vite can handle them now, but the risk remains. **No new regressions vs. prior audit.**
3. ✅ **No `${...}` template expression interpolation in data files** — `codeModules.js` uses `\${` (escaped backslash-dollar) for Python f-string syntax in code samples, which is safe. No unescaped JS interpolation found.

**Audit 2 — Config Completeness**

4. ✅ **MetricsBrowser.jsx DIFF_CFG missing `advanced` entry** — `metricCases.js` includes `difficulty: 'advanced'` (case M16). `MetricsBrowser.jsx` DIFF_CFG only has `foundational`, `analyst`, `senior`, `staff`. M16 silently falls back to `DIFF_CFG.analyst`. Same root cause pattern as audit #67 finding #1. **Open — not fixed this session.**
5. ✅ **StatsBrowser DIFF_CFG complete** — foundational, analyst, intermediate, senior, advanced, staff all present. Fixed in V4.7.2.
6. ✅ **StatsFoundationsRunner MODULE_COMPONENTS complete** — 25 entries, sf01–sf25, all match the 25 modules in statsFoundationsModules.js. No gaps.

**Audit 3 — Component Registration**

7. ✅ **StatsFoundationsRunner: 25 MODULE_COMPONENTS entries** — exactly matches 25 SF modules. All 5 new imports (sf21–sf25) wired correctly.
8. ✅ **Progress.jsx reset map missing 6 room progress keys** — The reset map (lines 203–225) tracks only 12 rooms. The following progress utils exist but have no reset entry in Progress.jsx: `pal-behavioral-progress-v1`, `pal-code-progress-v1`, `pal-estimation-progress-v1`, `pal-stat-foundations-progress-v1`, `pal-pri-progress-v1` (Prioritization), and product design (uses per-scenario key pattern). Users who click "Reset all progress" in Progress.jsx will not clear Behavioral, Code, Estimation, SF, or Prioritization rooms. **Open — not fixed this session.**
9. ✅ **Progress.jsx `getPracticeDates()` heatmap also missing same keys** — The practice heatmap function reads 14 localStorage keys, but `pal-behavioral-progress-v1`, `pal-code-progress-v1`, `pal-estimation-progress-v1`, `pal-stat-foundations-progress-v1`, `pal-pri-progress-v1` are absent. Practice sessions in those rooms don't appear in the heatmap. **Open — not fixed this session.**

**Audit 4 — Content Integrity**

10. ✅ **Stats Room structural integrity clean** — all 20 modules have: exactly 1 `isCorrect: true` (20/20), exactly 4 options (80 total), `observedResult` field (20/20), `seniorRead` field (20/20).
11. ✅ **SF Room structural integrity clean** — all 25 modules have `keyInsight` and `connection` (25/25 each). IDs and indexes are sequential sf01–sf25.
12. ✅ **Metrics Room structural integrity** — Metrics uses free-response mechanic (not options), so no `isCorrect` field. Structure is correct for the room's mechanic.

**Audit 5 — Navigation & Routing**

13. ✅ **Sitemap missing high-value routes** — `public/sitemap.xml` has 22 URLs. The following legitimate SEO routes exist in App.jsx but have no sitemap entry: `#ab-interpreter`, `#cases`, `#simulator`. These have real content worth indexing. Tool/utility routes (`#about`, `#bank`, `#bookmarks`, `#company-tracks`, `#defense-doc`, `#home`, `#progress`, `#qa`, `#trainer`, `#unlock`) are correctly omitted. **`#cases` in particular (12 business cases) is an oversight. Open — not fixed this session.**
14. ✅ **All rooms wired into App.jsx** — 53 lazy imports, all major rooms present. No orphaned pages found.
15. ✅ **Sidebar nav complete** — all 29 room/tool IDs present in sidebar, both in ROOMS and PRACTICE groupings.

**All 4 open findings fixed in V4.8.1.** See CHANGELOG.

---

### 67. ✅ Stats Room Comprehensive Audit — V4.7.2
**Version:** V4.7.2
**Output:** 6 findings across BUILD, Visual Consistency, Content Integrity dimensions; 5 issues fixed

Full sweep across all 20 Stats modules, StatsBrowser.jsx, and StatsRunner.jsx covering: BUILD (prop wiring, field stubs, component contracts), Visual Consistency (badge config maps), Content Integrity (claim-data alignment, concept ID consistency, difficulty calibration), UX (cross-room nav, empty states), Coverage (field parity between original and causal inference modules), and Build Safety (template literal check).

**Findings:**

1. ✅ **DIFFICULTY_CFG missing `intermediate`, `advanced`, `staff` entries** — both `StatsRunner.jsx` and `StatsBrowser.jsx` defined DIFF_CFG only for `foundational`, `analyst`, `senior`. Modules STAT09 (advanced), STAT10 (intermediate), STAT11 (advanced), STAT12 (advanced) all fell back to the "Foundational" badge with wrong color. Root cause: config maps not updated when causal inference modules were added. Fixed: added `intermediate` (yellow), `advanced` (purple), `staff` (red) entries to both files. This is an instance of **Config Completeness** failure — a systematic pattern to watch across all rooms with difficulty tiers.

2. ✅ **STAT08 claim references seller conversion data not shown in setup** — The scenario presents buyer-level booking rate data (+18%) but the claim evaluates "treatment sellers showed +19% conversion lift vs. control sellers." Options also reference control seller drop (-11.4%) and platform-level result (+2.8%) — none of these numbers appear in `setup.observedResult` or `caveat`. Users had no way to evaluate the claim from information given. Fixed: added seller-arm conversion rates and platform-level booking rate to `setup.observedResult`.

3. ✅ **STAT13 concept ID inconsistency** — `stat13-did-parallel-trends` used `concept: 'did'` and `linkedConceptIds: ['did', ...]` while `stat17-did` uses `concept: 'diff-in-diff'` and `linkedConceptIds: ['diff-in-diff', ...]`. Two modules covering the same statistical concept used different string IDs. The concept badge chip showed 'did' for one and 'diff-in-diff' for the other; any concept drawer that looked up by ID would resolve only one. Fixed: STAT13 standardized to `concept: 'diff-in-diff'` and `linkedConceptIds` updated to replace 'did' with 'diff-in-diff'.

4. ✅ **STAT17 difficulty miscalibrated as 'senior'** — `stat17-did` asks users to compute DiD = 7pp − 4pp = 3pp. This is a foundational arithmetic check, not a senior-level judgment call. The scenario was built to teach the DiD subtraction concept, not to test ambiguous senior-level decisions. Fixed: difficulty changed from 'senior' to 'analyst'. This brings it in line with the tier calibration described in `docs/CONTENT_QUALITY_BAR.md`.

5. ✅ **STAT10–12 missing `linkedScenarioIds` and `linkedDesignIds` field stubs** — All 8 causal inference modules (STAT13–STAT20) have `linkedScenarioIds: []` and `linkedDesignIds: []` even when empty. STAT10, STAT11, STAT12 (added in an earlier batch) were missing both fields entirely. While `StatsConceptPanel` likely handles missing fields gracefully, the structural inconsistency breaks any field-level QA scan. Fixed: added empty array stubs to all three modules.

6. ✅ **Build safety check: statsModules.js** — Grep confirmed no backtick template literals in the file. Only single-quoted strings throughout. All apostrophes within single-quoted strings are escaped as `\'`. No build risk.

**Open findings not fixed this session:**
- sfPrerequisites missing for STAT10–STAT20: these modules have no SF room cross-links. The SF room currently has no modules covering DiD, RD, synthetic control, or IV — so no SF links to add yet. Will populate when/if SF causal inference modules are built.
- StatsBrowser has no concept/tag filter (other rooms have this). Low priority for now — 20 modules is browsable without filtering.
- sfPrerequisites chips are display-only, not clickable navigation. Minor UX improvement for a later pass.

---

### 65. ✅ Home.jsx Daily Drill Pool — Wrong Case ID/Title for BEH05
**Version:** V4.6.1 (live site report)
**Output:** `Home.jsx` pool entry fixed — `BEH01` → `BEH05`, title corrected

User reported "Influence Without Authority section breaks" on the live site. Root cause: the daily drill pool in `getTodaysCase()` had `{ id: 'BEH01', title: 'Influence Without Authority' }` but `BEH01` is "Changing a PM's Mind with Cohort Data." The pool was built when BEH01 had a different title and was never updated when content was rewritten. The intended case — about cross-functional influence — is `BEH05` ("Getting Engineering Buy-In Without Escalation"). Fixed: updated pool entry to `id: 'BEH05'` with correct title. Users clicking the daily drill card now land on the case the title describes.

---

### 59. ✅ Analytics Completion Coverage Audit
**Version:** V4.6
**Output:** `track('case_completed', { room, id, rating })` in all 18 runner components

Systematic audit of every room runner to find where self-rating / final answer is saved (the true completion signal). Runners fall into two patterns: (1) `handleRate(r)` pattern — Prioritization, Code, Behavioral, Estimation, BI, Growth Analytics, Spot the Flaw, Take-Home, Instrumentation, Challenges; (2) scored-submit pattern — Metrics (`handleSubmit`), Stats (`handleSubmit`), Review (`handleSubmit`), Design (`handleSubmit`), RCA (`handleNextStep` on final step), Cases (`handleNextPhase` on final phase), Product Design (`handleNext` on final phase). Stat Foundations fires on module completion with `rating: null`. All 18 wired in a single pass.

---

### 60. ✅ MD Spine System Documentation Audit
**Version:** V4.6
**Output:** `CLAUDE.md` (NEW), `DECISIONS.md` (NEW), `METRICS.md` (NEW), `IDEAS.md` (restructured), `AUDITS.md` (type table + ✅/⚠️ flags)

Diagnosed institutional memory problem: every new session required expensive re-orientation via CHANGELOG.md alone. No single document told a contributor what the rules were (present tense, prescriptive), what's tracked, what the tiered backlog was, or what audits had been run. Designed and implemented the MD Spine System: (1) `CLAUDE.md` — cold-start briefing, non-negotiable code rules, file structure, dev workflow, new-room checklist; (2) `DECISIONS.md` — present-tense rulebook for architecture, product scope, content, design, paywall, analytics; (3) `METRICS.md` — full PostHog event taxonomy, funnel map, localStorage keys, success metric targets, explicit gap callout; (4) `IDEAS.md` — restructured from flat list to Tier 1/2/3 + In Progress + Retired with conscious "not building" rationale; (5) `AUDITS.md` — added canonical 19-type reference table + ✅/⚠️ status flags on all 58 existing audits.

---

## Summary Table

| # | Audit | Version | Category |
|---|---|---|---|
| 1 | Platform Architecture (18 Qs) | Pre-V1.2 | Architecture |
| 2 | Platform Risk Assessment (6 risks) | Pre-V1.2 | Architecture |
| 3 | Ecosystem Homogeneity (vs genai-systems-lab) | V3.2.4 | Architecture |
| 4 | Platform Gap vs. Interview Frequency | V3.4 | Architecture |
| 5 | Scenario Bank Taxonomy (15 families) | Pre-V1.2 | Architecture |
| 6 | Beta Open-Access Decision | V2.3 | Architecture |
| 7 | GenAI-as-Thread Positioning | V3.1 | Architecture |
| 8 | Free/Paid Tier Design | Pre-V1.5 + V3.6 | Architecture |
| 9 | Wayfair PDF Source Material Benchmark | V1 | Source material |
| 10 | Interview Prep PDF Source Audit (Blog) | V2.4/V3.5 | Source material |
| 11 | Content Quality Bar Definition | Pre-V1.5 | Content quality |
| 12 | V1.6 Stats Mechanic Audit | V1.6 | Content quality |
| 13 | RCA SQL Specificity Audit | V3.1 | Content quality |
| 14 | Top-10 Playbook Voice Audit | V3.0 | Content quality |
| 15 | All-117 Playbook Article Quality Audit | V3.2.1 | Content quality |
| 16 | Flagship Article Identification Audit | V3.2.3 | Content quality |
| 17 | Company Questions + Career Articles Audit | V3.x | Content quality |
| 18 | Playbook Worked Examples Coverage (47) | V3.5 | Content quality |
| 19 | Blog Content Completeness (0/80 → full) | V3.5 | Content quality |
| 20 | Review Scenario Quality Audit (S01–S08) | V4.1 | Content quality |
| 21 | STAT01–08 + M01–M06 Enrichment Audit | V4.1 | Content quality |
| 22 | Growth Analytics playbookLinks Audit | V4.1 | Content quality |
| 23 | Design Direction + CSS System | V1.1 | Visual |
| 24 | Color System Conflict (teal→green) | V2.2 | Visual |
| 25 | WCAG Contrast + Keyboard A11y | V3.2.3 | Visual |
| 26 | First-Impression Pre-Beta Audit | V2.2 | UX |
| 27 | Home Page Density Audit (×2) | V3.2.4 + V4.3 | UX |
| 28 | Intuitive UX Audit — Home.jsx | V3.2.4 | UX |
| 29 | Role Readiness Score Tier Design | V4.1 | UX |
| 30 | Design ↔ Review Pairing Completeness | V1.6 + V3.0 | Feature completeness |
| 31 | Automated QA Dashboard (63 checks) | V2.1 | Feature completeness |
| 32 | QA Dashboard First Run (5 failures) | V2.1.1 | Feature completeness |
| 33 | Next-Case Nav Completeness | V3.3.1 | Feature completeness |
| 34 | Progress completionMap Gaps (6 rooms) | V3.5 | Feature completeness |
| 35 | Progress.jsx GA Room Gap | V4.1 | Feature completeness |
| 36 | Sitemap Completeness | V4.1 | Feature completeness |
| 37 | BookmarksBrowser Wiring | V4.2 | Feature completeness |
| 38 | Progress Coverage — V4.5 Rooms (5) | V4.5 | Feature completeness |
| 39 | Learning Path Coverage | V3.5 | Feature completeness |
| 40 | Broken Rooms Diagnostic (Metrics + RCA) | V3.x | Bug/diagnostic |
| 41 | Internal Bug Audit — Agent Cross-Check | V3.2.2 | Bug/diagnostic |
| 42 | localStorage Key Consistency | V3.2.2 | Bug/diagnostic |
| 43 | V4.1 Quick Fixes Pass | V4.1 | Bug/diagnostic |
| 44 | Bundle Performance Audit (19 lazy imports) | V3.2.4 | Performance |
| 45 | Apostrophe Syntax — challengesCases.js | Pre-V4.5.1 | Build safety |
| 46 | Apostrophe Syntax Scan — growthAnalyticsCases.js | V4.5.1 | Build safety |
| 47 | .env Secret Management | V3.2.4 | Security |
| 48 | Mobile Audit — V3.6 | V3.6 | Mobile |
| 49 | Mobile Audit — V4.5 New Rooms | V4.5 | Mobile |
| 50 | SEO Readiness Audit | V3.6 | SEO |
| 51 | PostHog Event Taxonomy + PII Audit | V3.2.4 → V4.6 | Analytics |
| 52 | Leadership Lens Coverage Audit | V4.4 | Feature coverage |
| 53 | Active Recall Textarea Runner Coverage | V4.1 | Feature coverage |
| 54 | Defense Doc Generator Keyword Taxonomy | V4.4 | Feature coverage |
| 55 | Deep Copy + Voice Audit (scenarios, rooms, playbook) | V3.x | Content quality |
| 56 | Stat Foundations ↔ Playbook Interlink | V3.5 | Feature coverage |
| 57 | Stats → SF Back-Link + Difficulty Sort | V4.1 | Feature coverage |
| 58 | Behavioral Question ID Consistency | V4.1 | Bug/diagnostic |
| 59 | Analytics Completion Coverage (18 runners) | V4.6 | Analytics |
| 60 | MD Spine System Documentation Audit | V4.6 | Architecture |
| 61 | `case_opened` Missing from 4 V4.4+ Open Functions ✅ | V4.6.1 | Analytics |
| 62 | `onResetAllProgress` Missing 9 localStorage Keys ✅ | V4.6.1 | Bug/diagnostic |
| 63 | Sitemap Missing 8 V4.x Routes ✅ | V4.6.1 | SEO |
| 64 | Template Literals in 9 Data Files ✅ | V4.12.0 | Build safety |
| 65 | Home.jsx Daily Drill Wrong BEH Case ID ✅ | V4.6.1 | Bug/diagnostic |
| 66 | SF Module Button Labels + Duplicate Playbook Sections ✅ | V4.6.2 | Visual consistency / BUILD |
| 67 | Stats Room Comprehensive Audit (6 findings, 5 fixed) ✅ | V4.7.2 | BUILD / Visual / Content / Build safety |
| 68 | Five-Perspective Comprehensive Audit (15 findings, all fixed) ✅ | V4.8.0–V4.8.1 | Build safety / Config completeness / Component reg / Content / Routing |
| 69 | Navigation & Discoverability Audit — dead SPA links, orphaned Code room, label ambiguity, LEARN ordering ✅ | V4.12.0–V4.13.0 | Navigation & Discoverability |
| 70 | Build Safety — DebriefCopyButton em dash parse error ✅ | V4.13.1 | Build safety |
| 71 | Build Safety — `\'` Escape Sequences in JSX ✅ | V4.14.1 | Build safety |
| 72 | UX Completeness — Next-Case Patterns (browser highlight + sticky CTA) ✅ | V4.25.0 | UX / Coverage |
| 73 | Auth Layer Completeness — Header dead code, progress sync gap, mobile auth gap ✅ | V4.25.0 | BUILD / Dead code / UX |
| 74 | Dark Mode Contrast — Low-Brightness Mobile Readability ✅ | V4.25.3–V4.25.4 | Visual Consistency / Accessibility |
| 75 | Mobile Layout + UX Full Audit — grid overflow, safe-area, tap targets, heatmap ✅ | V4.26.0 | UX / Visual / Accessibility |

---

## Audit #75 — Mobile Layout + UX Full Audit

**Date:** 2026-05-27
**Type:** UX / Visual Consistency / Accessibility
**Status:** ⚠️ Open — 9 findings, 0 resolved, target V4.26

### Scope

Full mobile pass across all pages, browsers, runners, and shared components. Checked for: grid overflow bugs, safe-area-inset gaps, touch target sizes, font size floor violations, tap feedback, heatmap layout, and rooms that are structurally not mobile-usable.

---

### Finding 75-A — Grid overflow: 5 pages use bare `minmax(Npx, 1fr)` ⚠️ CRITICAL

**Rule:** `minmax(Npx, 1fr)` without the inner `min()` forces a minimum column width of Npx even when the viewport is narrower. On a 375px iPhone screen this causes horizontal scroll.

Files and lines:

| File | Line | Value | Breaks at |
|---|---|---|---|
| `CodeBrowser.jsx` | 114 | `minmax(300px, 1fr)` | 375px viewport |
| `ScenarioBrowser.jsx` | 108 | `minmax(310px, 1fr)` | 375px viewport |
| `JudgmentBank.jsx` | 554 | `minmax(290px, 1fr)` | 375px viewport |
| `JudgmentBank.jsx` | 585 | `minmax(230px, 1fr)` | 430px viewport |
| `statsFoundations/Module13_ExperimentDesigner.jsx` | 152 | `minmax(220px, 1fr)` | 450px viewport |

**Fix:** Wrap each with `min()`: `minmax(min(300px, 100%), 1fr)`. This is the established pattern in CLAUDE.md and all other browsers already use it.

---

### Finding 75-B — Sticky bottom bars missing `env(safe-area-inset-bottom)` ⚠️ HIGH

All four sticky bottom bars (RCARunner, CaseRunner, BIRunner, ChallengesRunner) use `position: 'fixed', bottom: 0`. On iPhone X and later (all models with a home indicator), the home gesture bar sits exactly at the bottom of the viewport and visually overlaps the "Next →" button.

**Zero** `env(safe-area-inset-bottom)` or `safe-area` references exist anywhere in `src/index.css` or any component.

**Fix:** Add `paddingBottom: 'env(safe-area-inset-bottom, 0px)'` to each sticky bar's wrapper div, and add `padding-bottom: env(safe-area-inset-bottom, 0px)` to the mobile topbar. Add `<meta name="viewport" content="viewport-fit=cover">` to `index.html` if not already present.

---

### Finding 75-C — No `WebkitTapHighlightColor: 'transparent'` ⚠️ HIGH

On iOS Safari, every tap on any `div[role=button]`, `button`, or anchor shows a grey flash by default. Zero components in PAL set `WebkitTapHighlightColor: 'transparent'`. The ML Systems Lab README specifically notes this as a mobile fix: `WebkitTapHighlightColor: transparent — no grey flash on iOS Safari`.

**Fix:** Add to `index.css` global reset:
```css
* { -webkit-tap-highlight-color: transparent; }
```

---

### Finding 75-D — 91-day heatmap not mobile-optimised ⚠️ MEDIUM

The heatmap uses `display: flex, flexWrap: wrap, width: fit-content` with 91 cells (7px × 7px each + 2px gap). On mobile this wraps arbitrarily into multiple rows of unknown width — it does not render as a 13-week grid. The visual result on a 375px screen is a ragged multi-line block of dots with no week-column alignment.

**Fix:** Set `display: grid, gridTemplateColumns: 'repeat(13, 7px)', gridTemplateRows: 'repeat(7, 7px)'` (13 weeks × 7 days) with `gap: 2px`. This renders as a proper calendar grid on all screen sizes.

---

### Finding 75-E — Font sizes below 0.68rem floor ⚠️ MEDIUM

CLAUDE.md states 0.68rem is the minimum font size. Grep found **24 instances** of `fontSize: '0.6[0-7]rem'` or smaller in component files. These are below the minimum and will be unreadable on a 375px screen at low-to-normal brightness.

**Fix:** Audit all 24 instances. Most are likely label-caps or badge text that can be lifted to 0.68rem without layout impact.

---

### Finding 75-F — Code Room structurally not mobile-usable ⚠️ MEDIUM (known)

`CodeBrowser.jsx` and `CodeRunner.jsx` contain a live Pyodide Python executor and SQL editor. These are inherently desktop — the code editor, result tables, and multi-panel layout cannot be meaningfully used on a 375px screen. This is a known constraint (DECISIONS.md: "Mobile app: content is inherently desktop — tables, charts, multi-column layouts don't translate").

**Action:** Add a mobile notice banner in CodeBrowser: "This room is optimised for desktop. For best experience, use a laptop or tablet." No layout change needed — just a single info banner that shows only on mobile (check `window.innerWidth < 768` or use CSS `@media`).

---

### Finding 75-G — `ConsultationSpace` keyword grid bare `minmax(200px, 1fr)` ⚠️ LOW

`ConsultationSpace.jsx:349` uses `minmax(200px, 1fr)`. 200px fits within a 375px screen (two columns at ~185px), so it does not cause hard overflow. However the pattern is inconsistent with the codebase standard and a 350px viewport (some Android devices) would break.

**Fix:** Standardise to `minmax(min(200px, 100%), 1fr)`.

---

### Finding 75-H — `QADashboard.jsx` and `JudgmentBank.jsx` smaller bare minmax values ⚠️ LOW

`QADashboard.jsx:202` uses `minmax(140px, 1fr)` — safe on 375px. `JudgmentBank.jsx:585` uses `minmax(230px, 1fr)` which is borderline. Both should be wrapped with `min()` for consistency.

---

### Finding 75-I — Mobile topbar has no `safe-area-inset-top` ⚠️ LOW

The mobile topbar uses `height: 46px` with `position: sticky, top: 0`. On iPhones with a Dynamic Island or notch, the status bar overlaps the topbar if the viewport doesn't account for `env(safe-area-inset-top)`. The topbar height should be `calc(46px + env(safe-area-inset-top, 0px))` with matching top padding.

---

### Summary

| # | Finding | Severity | Fix complexity |
|---|---|---|---|
| 75-A | 5 grid overflow bugs (bare minmax) | Critical | Low — 5 one-line fixes |
| 75-B | No safe-area-inset on sticky bars | High | Low — paddingBottom on 4 components + index.html |
| 75-C | No WebkitTapHighlightColor | High | Trivial — 1 CSS rule |
| 75-D | Heatmap not a real 13-week grid on mobile | Medium | Low — swap flex for grid |
| 75-E | 24 font sizes below 0.68rem floor | Medium | Low — lift each to 0.68rem |
| 75-F | Code Room not mobile-usable | Medium | Low — add info banner |
| 75-G | ConsultationSpace bare minmax(200px) | Low | Trivial |
| 75-H | QADashboard/JudgmentBank bare minmax | Low | Trivial |
| 75-I | Topbar no safe-area-inset-top | Low | Low |

**Total:** 9 findings. All resolved in V4.26.0.

---

## Audit #76 — Duplicate Sign-in UI — 2026-05-27

**Scope:** Auth entry-point consistency across mobile nav surfaces
**Status:** ✅ Resolved — V4.26.1

### Finding 76-A — Sign-in button duplicated in topbar and sidebar ✅ RESOLVED

**Observed:** On mobile, "Sign in" appeared in two places: the persistent topbar (right side) and again inside the sidebar menu. Opening the hamburger to navigate showed a second "Sign in" button at the bottom of the sidebar, creating visual redundancy and implying two separate auth flows.

**Root cause:** When the sidebar auth section was added in V4.25.0 (Audit #73 fix), the mobile topbar already had a sign-in button. Both were wired to the same `setShowAuth(true)` call, but users saw both CTAs simultaneously.

**Fix:** Removed the `!user` branch (sign-in button) from Sidebar.jsx. The sidebar now only renders auth state when the user is signed in (email display + sign out). Sign-in lives exclusively in the topbar — always visible, compact, one clear entry point. Signed-in state remains in the sidebar since it has room to show the full email address.

**File:** `src/components/layout/Sidebar.jsx`

---

## Audit #77 — Batch 0 Self-Vet Bug Sweep — 2026-05-29

**Scope:** Full product surface — all rooms, all tools, all nav paths (founder self-vet)
**Status:** ✅ Resolved — V4.28.0

### Finding 77-A — Behavioral room crash on BEH21–30 ✅ RESOLVED

**Observed:** Behavioral room crashed on both desktop and mobile for any question BEH21–BEH30.

**Root cause:** BEH01–20 use `starGuide`/`modelAnswer`/`strongAnswerMarkers`. BEH21–30 use a different schema: `storyFramework`/`strongSignals`/`weakSignals`/`whatTheyreReallyAsking`. `BehavioralRunner.jsx` called `Object.entries(question.starGuide)` and `question.strongAnswerMarkers.map()` unconditionally — `TypeError: Cannot convert undefined or null to object` for any BEH21+ question.

**Fix:** Rewrote `BehavioralRunner.jsx` to handle both schemas. STAR Guide section now detects schema and labels button "STAR Guide" vs "Story Framework". Model answer section only renders when `question.modelAnswer` exists. `strongMarkers` resolves from either field. `weakSignals` section added for BEH21+. Added null guard for missing `question`.

**File:** `src/components/behavioral/BehavioralRunner.jsx`

---

### Finding 77-B — Cases Room correct answer always option A ✅ RESOLVED

**Observed:** In the Cases Room, the correct answer was always displayed as option A. All question data files define the `strong` option first with `id: 'a'`.

**Root cause:** `CaseRunner.jsx` passed `phase.options` directly to `CaseStepPanel` with no shuffling. Options were always rendered in their original order.

**Fix:** Added `seededShuffle()` + `hashStr()` helpers to `CaseRunner.jsx`. Phases are now pre-shuffled via `useMemo` using a seed derived from `caseId + phase.id + phaseIndex`. Shuffle is deterministic (same user sees same order) but the `strong` option is no longer locked to position A. Option ids are preserved, so scoring and progress tracking are unaffected.

**File:** `src/components/cases/CaseRunner.jsx`

---

### Finding 77-C — Mobile welcome card clipped on narrow screens ✅ RESOLVED

**Observed:** The first-visit hero card ("You know the framework. Can you diagnose the drop?") did not render visible content on mobile.

**Root cause:** The hero card had `overflow: hidden`. The product mockup on the right had `minWidth: 260px`. On a 375px iPhone, the effective inner width of the card (after page padding 1.5rem×2 + card padding 2.25rem×2) was ~255px — 5px short. With `flexWrap: wrap`, the mockup wrapped to a new row but still tried to be 260px wide, overflowing the 255px container. `overflow: hidden` clipped it.

**Fix:** Changed mockup `minWidth: 260` → `0` (flex-basis 300px already handles sizing). Changed hero card padding to `clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2.25rem)` for responsive scaling.

**File:** `src/pages/Home.jsx`

---

### Finding 77-D — Stats Room variable placement broken on mobile ✅ RESOLVED

**Observed:** In Stat Foundations Module 01 (What Is Data), tapping an unplaced variable on mobile placed it in the Numerical bucket only. No way to place it in Categorical.

**Root cause:** The interaction cycled cards: Unplaced → Numerical → Categorical → Unplaced. After the first tap, the card disappeared from the Unplaced zone and reappeared in the Numerical zone. Mobile users didn't know to tap it again in its new location. The affordance was invisible.

**Fix:** Replaced the click-to-cycle interaction with explicit **N** and **C** buttons on each unplaced variable card. Placed cards show a **×** button to unplace them. Instructions updated. Works identically on desktop and mobile with no ambiguity.

**File:** `src/components/statsFoundations/modules/Module01_WhatIsData.jsx`

---

### Finding 77-E — Code Room execute button not visible + Python setup crash ✅ RESOLVED

**Observed:** No visible "Run Code" button in the Code Room. Python execution would also have silently failed.

**Root cause (visibility):** The Run Code button lives inside `ModelAnswerPanel`, which only renders after the user types 30+ chars and clicks "Reveal model answer." Users opening the Code Room saw no indication that code execution exists.

**Root cause (Python crash):** A stray JS import statement `import { track } from '../../utils/analytics.js'` was accidentally placed inside a Python `runPython()` template literal instead of at the top of the file. This produced a Python `SyntaxError` on every execution attempt. Additionally, `track` was not imported at the module level, so `handleRate()` was calling an undefined function.

**Fix:** Added `import { track }` at the top of the file. Removed the stray import from the Python setup string. Added "▶ Run Code appears after reveal" hint text next to the Reveal button for Python modules.

**File:** `src/components/code/CodeRunner.jsx`

---

## Part XV — V4.9–V4.13 Session Audits

### 69. ✅ Navigation & Discoverability Audit — V4.12.x
**Version:** V4.12.0–V4.13.0
**Type:** Navigation & Discoverability

Four distinct navigation problems found and resolved across the V4.12.x builds:

1. **Dead SPA links on Exp Foundations browser page** — 'Ready to practice?' section linked to `#ab-design`, `#ab-review`, `#spot-the-flaw` using `<a href>` anchor tags. In a React SPA these cause a full page reload and state loss instead of routing within the app. Fixed in V4.12.1: replaced with `onNavigate` prop calls.

2. **Code room orphaned in sidebar** — Code room was a flat nav item sitting between PRACTICE ROOMS and PRACTICE sections with no accordion group. Visually lost, easy to miss. Fixed in V4.12.2: Code moved into Analytics accordion as Code Lab.

3. **Ambiguous room labels** — 'Review' had no A/B prefix; 'PM Design' was inconsistent with other room names (full noun); 'Prioritize' used a verb instead of the noun format used everywhere else; 'Exp Foundations' did not signal A/B testing. All four relabeled in V4.12.2.

4. **LEARN section buried below TOOLS** — Wrong information hierarchy for a learning platform. Learning content should be discoverable before utility tools. Fixed in V4.13.0: LEARN section moved above TOOLS in sidebar order.

**Status:** ✅ Resolved

---

### 70. ✅ Build Safety Audit — DebriefCopyButton Em Dash (V4.13.1)
**Version:** V4.13.1
**Type:** Build safety

`src/components/shared/DebriefCopyButton.jsx` contained 3 em dash (—) Unicode characters inside JS string literals used as ternary fallback values (e.g. `case.difficulty || '—'`). Rolldown raised "Invalid Character —" at line 18 during the Vercel build, blocking deployment.

**Root cause:** Agent-generated code used the typographic em dash as a display fallback value inside a JS string. The character is not valid as a token in Rolldown's JS parser.

**Fix:** All 3 em dash instances replaced with ASCII hyphens (-).

**Rule added:** Never use em dash (—), en dash (–), or other Unicode punctuation characters inside JS string literals in any .js/.jsx file. Use ASCII hyphen (-) or write out the word. This extends the existing apostrophe safety rule to the full class of problematic Unicode punctuation.

**Status:** ✅ Resolved

---

### 73. ⚠️ Auth Layer Completeness Audit (V4.24)
**Version:** V4.24.0
**Type:** BUILD / Dead code / UX

Four findings from the Supabase auth layer shipped in V4.24:

1. **Header.jsx is dead code** — `Header.jsx` defines `user` and `onShowAuth` props and contains a sign-in button + user avatar dropdown, but the file is **never imported anywhere** in the codebase. App.jsx uses `Sidebar.jsx` as the sole navigation component. The auth UI in Header.jsx is unreachable. The sign-in button and avatar are only accessible via Sidebar. Status: ⚠️ Open. Fix: either delete Header.jsx or document that it's a design artifact.

2. **Progress not synced after case completion** — `pushProgressToSupabase(user)` is called only on the `SIGNED_IN` auth event in App.jsx. If a signed-in user completes 10 cases and closes the tab without triggering a new sign-in, that progress is never pushed to Supabase. On a new device they'll see stale data. Status: ⚠️ Open. Fix: call `pushProgressToSupabase(user)` inside a `visibilitychange` listener (`document.addEventListener('visibilitychange', ...)`) when `document.visibilityState === 'hidden'` and user is signed in. This batches the push on tab close/background rather than per-case.

3. **AuthModal not triggered from mobile topbar** — App.jsx renders a `mobile-topbar` div for mobile layout. This topbar has no sign-in button. Sign-in is only accessible by opening the Sidebar. On mobile, users who don't discover the sidebar hamburger will never see auth. Status: ⚠️ Open.

4. **Supabase env vars undocumented in Vercel** — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required for auth to activate. They are documented in `SETUP_AUTH.md` (repo root) but not referenced from `README.md` or `DECISIONS.md`. Any new contributor deploying the app will get a silent auth-disabled experience with no indication of why. Status: ⚠️ Open. Fix: add one-line note to README deploy section.

**Status:** ✅ Resolved V4.25.0 — Header.jsx commented as unused; visibilitychange progress sync added to App.jsx; sign-in button added to mobile topbar; Supabase env vars documented in README.

---

### 72. ⚠️ UX Completeness Audit — Next-Case Patterns (V4.24)
**Version:** V4.24.0
**Type:** UX / Coverage

Systematic check of two UX patterns introduced in V4.24 across all room browsers and runners.

**Pattern A: Next-case highlight in browsers**
First-unstarted-case highlight (accent left border + "Next →" badge) was implemented in StatsBrowser only. Full coverage across all case room browsers:

| Browser | Has highlight |
|---------|--------------|
| StatsBrowser | ✅ yes |
| BIBrowser | ⚠️ no |
| BehavioralBrowser | ⚠️ no |
| CasesBrowser | ⚠️ no |
| ChallengesBrowser | ⚠️ no |
| CodeBrowser | ⚠️ no |
| DesignBrowser | ⚠️ no |
| EstimationBrowser | ⚠️ no |
| GrowthAnalyticsBrowser | ⚠️ no |
| InstrumentationBrowser | ⚠️ no |
| MetricsBrowser | ⚠️ no |
| PrioritizationBrowser | ⚠️ no |
| ProductDesignBrowser | ⚠️ no |
| RCABrowser | ⚠️ no |
| ScenarioBrowser (Review) | ⚠️ no |
| SpotTheFlawBrowser | ⚠️ no |
| TakehomeBrowser | ⚠️ no |

15/16 case room browsers are missing the highlight. Foundation browsers (StatsFoundations, MetricsFoundations, RCAFoundations, ExpFoundations) use module-list layouts with different progress patterns — lower priority.

**Pattern B: Sticky bottom "Next →" CTA in runners**
Position-fixed sticky bar after debrief was implemented in ChallengesRunner only. All other runners have an **inline** `onNext` button at the bottom of the debrief panel — functional but low-prominence. The inline button requires the user to scroll down past the debrief content to see it, whereas a sticky bar is always visible.

| Runner | Sticky bar | Inline onNext |
|--------|-----------|--------------|
| ChallengesRunner | ✅ yes | — |
| StatsRunner | no | ✅ inline |
| MetricsRunner | no | ✅ inline |
| DesignRunner | no | ✅ inline |
| RCARunner | no | ✅ inline |
| CaseRunner | no | ✅ inline |
| BehavioralRunner | no | ✅ inline |
| EstimationRunner | no | ✅ inline |
| SpotTheFlawRunner | no | ✅ inline |
| BIRunner | no | ✅ inline |
| InstrumentationRunner | no | ✅ inline |
| GrowthAnalyticsRunner | no | ✅ inline |
| PrioritizationRunner | no | ✅ inline |
| ProductDesignRunner | no | ✅ inline |
| CodeRunner | no | ✅ inline |
| ScenarioRunner | no | inline partial |

Note: inline `onNext` is acceptable for most runners since debrief panels are not excessively long. The ChallengesRunner sticky bar was warranted because its debrief is multi-section and scrolling is longer. **Priority for sticky upgrade: runners with longest debrief content** — RCARunner, CaseRunner, BIRunner.

**Status:** ✅ Resolved V4.25.0 — all 16 browsers have next-case highlight; RCARunner, CaseRunner, BIRunner have sticky bottom bar.

---

### 71. ✅ Build Safety Audit — `\'` Escape Sequences in JSX (V4.14.1)
**Version:** V4.14.1
**Type:** Build safety

Vercel build failed with "Invalid Unicode escape sequence" at `src/components/shared/DebriefCopyButton.jsx:21:10` — line `: \'-\';`. Root cause: file was generated with `\'...\' ` used as string *delimiters* in expression context (e.g. `\'-\'`, `\'# \'`, `\'(none)\'`). Rolldown's strict ECMAScript parser rejects `\` before `'` outside an already-open string.

**Systematic sweep performed:** All non-data JSX/JS files grepped for `\'`. Three distinct patterns found:

1. **String delimiters in expression context** (`\'-\'`) — invalid. Found 36 instances in DebriefCopyButton.jsx. Fixed with `sed -i "s/\\\\'/'/g"`.
2. **`\'` in JSX text content** (between `>` and `<` tags) — wrong (renders as literal backslash or parse error). Found in 6 files: TakehomeRunner.jsx, Module22_DiD.jsx, MetricsFoundationsRunner.jsx, RCAFoundationsBrowser.jsx, Home.jsx, CompanyTracks.jsx. Fixed with targeted `sed -i`.
3. **`\'` inside already-open single-quoted strings** — valid, left untouched. 43 instances across component files; 511 in PlaybookBrowser.jsx; 300 in BlogBrowser.jsx; all in data files.

**Rule added to CLAUDE.md:** Three-context rule for apostrophes — data files require `\'`; JS expression strings use `\'` only *inside* open strings; JSX text content uses plain apostrophes only.

**Status:** ✅ Resolved

---


---

*Audits #1–#75 (pre-V4.30) archived in AUDITS_ARCHIVE.md.*

## Part XVI — V4.30–V4.32 Session Audits

### 93. ⚠️ SEO Audit — Sitemap Missing 21 Routes
**Version:** Logged V4.33.2, fix deferred
**Type:** SEO / Social

Sitemap audit (V4.33.2 session) found sitemap.xml has 26 routes but App.jsx registers 47+ unique routes. 21 routes are missing.

**Missing top-level pages (SEO-relevant, should be added):**
`home`, `progress`, `trainer`, `unlock`, `company-tracks`, `defense-doc`, `about`, `search`

**Missing runner/sub-pages (not SEO-relevant, correctly excluded):**
behavioral-runner, bi-runner, cases-runner, challenges-runner, code-runner, design-runner, estimation-runner, exp-foundations-runner, growth-analytics-runner, instrumentation-runner, metrics-runner, metrics-foundations-runner, prioritization-runner, product-design-runner, rca-runner, stat-foundations-runner, stats-runner, stf-runner

**Fix:** Add the 8 missing top-level pages to `public/sitemap.xml`. Exclude runner pages — they're not standalone SEO targets. Previous sitemap audit #63 fixed 8 URLs in V4.6.1 but didn't catch these.

**File:** `public/sitemap.xml`

---

### 92. ⚠️ Visual Consistency Audit — Hardcoded Color Values (40+ violations)
**Version:** Logged V4.33.2, fix deferred
**Type:** Visual Consistency

Full codebase audit (V4.33.2 session) found 40+ hardcoded color values in JSX files that should use CSS variables.

**Violation summary:**
- `#fff` / `#ffffff` — 30+ instances (should be `var(--text-inverse)` or `var(--surface)`)
- `rgba(0,0,0,x)` — 5+ instances (should be `var(--overlay)` or equivalent)
- `#333` — 1 instance in AuthModal.jsx (should be `var(--text)`)
- `#4285F4` (Google blue) — 1 instance in AuthModal.jsx (acceptable as brand color, document as exception)
- `rgba(99,102,241,0.4)` — 1 instance in Sidebar.jsx (should be accent variable)

**Files with most violations:**
- `src/components/rcaFoundations/RCAFoundationsRunner.jsx` — 10+ instances
- `src/components/auth/AuthModal.jsx` — 7 instances
- `src/components/layout/Sidebar.jsx` — 4 instances
- `src/components/ui/LockOverlay.jsx` — 2 instances
- `src/components/design/DesignDebriefPanel.jsx` — 2 instances
- `src/components/metrics/MetricChoicePanel.jsx` — 1 instance

**Fix:** Systematic grep-and-replace pass. First check `src/index.css` for existing variables that map to the hardcoded values, then replace. May need to add 1–2 new variables (`--overlay`, `--text-inverse`) if not already defined. Medium effort — ~1 session.

---

### 91. ⚠️ UX Audit — Empty State Quality (Sibling lab signal)
**Version:** Logged V4.32.9 → Resolved V4.46.0. 60 cases updated (24 RCA, 16 Metrics, 20 Stats). Every debrief now ends with Weak answer pattern + Interviewer follow-up specific to that case.
**Type:** UX / Human Elements

Empty states in PAL have never been audited. GenAI Lab found all empty states were blank — no copy, no orientation, no next step. Same risk exists in PAL.

**Surfaces to audit:**
- Bookmarks (no saves yet) — blank or generic?
- Progress page with zero rooms completed — what does a cold user see?
- Locked room state when access code not entered — clear path to unlock?
- Search with no results (if search is live)
- MCQ Trainer with no attempts yet

**Fix:** Each empty state should do three things — acknowledge the state, explain what belongs here, and give a specific next action. Small copy + CTA pass, ~1 session.

---

### 90. ⚠️ Content Audit — Deep Dives Post-to-Post Related Arrays Missing (Sibling lab signal)
**Version:** Logged V4.32.9 → Resolved V4.46.0. 60 cases updated (24 RCA, 16 Metrics, 20 Stats). Every debrief now ends with Weak answer pattern + Interviewer follow-up specific to that case.
**Type:** Navigation & Discoverability + Content Integrity

GenAI Lab found 202 posts with zero `related[]` arrays — no horizontal navigation between posts. Users read one post and hit a dead end. They fixed it with a curated related-post graph injected into each post\'s data.

PAL\'s BlogBrowser.jsx has the same problem. Each post object has a `room` field (routes to a practice CTA) but no `related` array linking to adjacent posts. Users cannot "keep reading" between posts without returning to the full list.

**Fix:** Add a `related: []` field to each post in the POSTS array pointing to 2–3 thematically adjacent post IDs. Build a "Keep reading" strip at the bottom of each expanded post using those IDs. Part of the Tier 2 Deep Dives overhaul (audit #84) — resolve in that pass, not before.

---

### 89. ✅ Content Integrity Audit — Stat Count Consistency (Sibling lab signal)
**Version:** Logged V4.32.9, verified V4.33.2
**Type:** Content Integrity

GenAI Lab found three different case/post counts stated across index.html, Home.jsx, and IDEAS.md — all different, none updated after content adds.

PAL states case counts in multiple places: home welcome card, room browser headers, CLAUDE.md description, and any marketing copy. These have never been audited for consistency after each content batch.

**Fix:** Single pass — grep for all numeric claims ("150+ cases", "17 rooms", etc.) across src/, public/, CLAUDE.md and verify against actual data file counts. Quick audit, ~30 minutes.

---

### 88. ✅ Build Audit — Timer Cleanup on Navigation (Sibling lab signal)
**Version:** Logged V4.32.9, verified V4.33.2
**Type:** BUILD + Framework / Technical

ML Systems Lab found their timed session (CombinatorTab) continued running in the background after the user navigated away — interval was never cleared. PAL shipped the shared TimerButton component in V4.32.0 across 5 runners.

**Check needed:** Does the timer interval clear when `onBack` fires? If the runner unmounts without clearing `setInterval`, the timer leaks and continues ticking in background, potentially affecting localStorage or causing ghost state on re-entry.

**Files to check:** `src/components/shared/TimerButton.jsx` (or wherever the interval lives), all 5 runner components that use it. Verify `clearInterval` is called in a cleanup return from `useEffect` or in the `onBack` handler.

---

### 87. ⚠️ Content Quality Audit — MCQ Trainer Distractor Quality (Sibling lab signal)
**Version:** Logged V4.32.9 → Resolved V4.46.0. 60 cases updated (24 RCA, 16 Metrics, 20 Stats). Every debrief now ends with Weak answer pattern + Interviewer follow-up specific to that case.
**Type:** Content Quality

ML Systems Lab found MCQ wrong options were too obviously eliminable — distractors that no practitioner would confuse with the right answer. Candidates learn to spot the obviously-wrong options rather than engaging with the underlying concept.

The standard for good distractors: each wrong option should be correct in a *different* context, or adjacent-but-subtly-wrong in the current context. A candidate who understands the concept should have to think about why each distractor is wrong.

**Scope:** PAL\'s `src/data/trainerMCQ.js` — 40 questions. Run a pass: for each question, are the 3 wrong options genuinely plausible to someone who half-knows the concept, or obviously eliminable? Rewrite any that fail.

**Effort:** Medium — full content pass on 40 questions. Can be done in one session.

---

### 86. ✅ Content Quality Audit — Case Debrief Explanation Depth (Sibling lab signal)
**Version:** Logged V4.32.9 → Resolved V4.46.0. 60 cases updated (24 RCA, 16 Metrics, 20 Stats). Every debrief now ends with Weak answer pattern + Interviewer follow-up specific to that case.
**Type:** Content Quality + UX / Human Elements

ML Systems Lab audited their MCQ explanations and found they stated the correct answer but didn\'t explain the failure mode — what goes wrong in a real interview or production scenario when you get this wrong. They fixed it with an explicit pattern: "In production, this breaks as X. The tell is Y."

PAL\'s case debriefs almost certainly have the same gap. They explain what the right framework or answer is, but may not close the loop on: *what does a weak answer look like, and why does it fail in an actual interview?* That\'s the content that makes debriefs sticky.

**Proposed standard for PAL debriefs:**
- What is the right answer / framework
- What does the weak answer look like (the actual mistake candidates make)
- Why it fails under interviewer pressure (the specific follow-up that exposes the gap)

**Scope:** All case debrief fields across every room data file. High effort — full content audit. Prioritize the rooms with the highest completion rates first (RCA, Metrics, Stats based on expected usage).

---

### 85. ✅ Analytics Audit — PostHog Autocapture PII Risk (Sibling lab signal — HIGH)
**Version:** Logged V4.32.9, verified V4.33.2
**Type:** Framework / Technical + SEO / Social

ML Systems Lab found PostHog\'s default configuration has `autocapture: true` — PostHog automatically captures all clicks, form inputs, and text entered into input fields, including personally identifiable content (email addresses, job titles entered in Defense Strategy, resume text pasted in future).

PAL uses PostHog via `src/utils/analytics.js` with an env-var gate. The current wrapper calls `posthog.init()` but whether `autocapture: false` is explicitly set is unknown.

**Risk:** If autocapture is on, PostHog is capturing every keystroke in the JD input field in Defense Strategy, every search query, and any text pasted into future resume input fields (V2 plan). This is a real PII risk — not theoretical.

**Fix:** Open `src/utils/analytics.js`. Verify `posthog.init()` call includes `{ autocapture: false, capture_pageview: false }` in the options object. If not present, add it. One-line fix with potentially significant compliance impact.

**Priority: Check this session or next. Do not defer past V4.33.**

---

### 84. ⚠️ Content + IA Audit — Deep Dives (BlogBrowser) Content State + Navigation Design
**Version:** Logged V4.32.6, fix deferred
**Type:** Content Integrity + Navigation & Discoverability + Creativity / Product

**Content state:** 81 posts in BlogBrowser.jsx. 12 have full content. ~69 are stubs. The current flat-list layout exposes this — stubs make the room feel incomplete.

**Navigation problem:** 81 posts presented as an endless scroll with no grouping, series, or filtering. Users cannot identify what to read or where to start. No pagination — all posts load at once.

**Copy problem (overlaps audit #83):** Page labels say "concepts and frameworks" — does not match the room identity ("Deep Dives").

**Proposed fix (Tier 2 IDEAS — gated on content):**
- Series-first default view, tag filtering above, paginated posts (max 20 at a time) on tag select
- Personalized "Revise / Learn / What\'s next" sections driven by localStorage room progress
- Full taxonomy pass: name series, assign tags to all 81 posts
- Content fill: bring remaining stubs to full content before redesigning the shell

**Gate:** ≥6 posts per major category at full content before any UI redesign ships.

---

### 83. ⚠️ Copy Audit — Frameworks + Deep Dives Page Labels Wrong
**Version:** Logged V4.32.6, fix deferred
**Type:** Content Integrity + UX / Human Elements

Page labels are self-referentially wrong or mismatched:
- Frameworks (PlaybookBrowser) — shows "framework" as a section/content label; should not be redundant with the page title
- Deep Dives (BlogBrowser) — shows "concepts and frameworks" as its content descriptor; should say "deep dives" to match what the room actually is

Small fix — locate the subtitle/label text in PlaybookBrowser.jsx and BlogBrowser.jsx and correct the copy to match page identity.

**Files to fix:** `src/pages/PlaybookBrowser.jsx`, `src/pages/BlogBrowser.jsx`

---

### 82. ✅ Visual Audit — Interview Simulator Layout Overhaul
**Version:** Logged V4.32.6, fix deferred
**Type:** Visual Consistency + Creativity / Product + UX / Human Elements

User feedback: "the layout looks shit / childish, like some mock toy / needs a lot of variables for customization." The current simulator config screen (role cards, session length pills, mode pills) reads like a toy UI — not a serious interview prep tool at the level PAL is positioning for.

**Scope (full design pass needed):**
- Role selection cards — current emoji + card grid feels casual; needs a more considered treatment
- Session length + mode pill selectors — generic, no visual hierarchy
- Overall config page density and spacing — too much white space between unrelated groups
- No sense of "this is a real drill" — needs visual gravity
- Hardcoded layout values likely throughout; needs CSS variable coverage for spacing, radius, type scale

**Fix approach (next session):**
- Full layout redesign of InterviewSimulator.jsx config screen
- Remove emojis from role cards (aligns with audit #80)
- Tighten spacing, increase type weight, reduce toy-feel
- Audit all hardcoded px values → CSS variables

---

### 81. ✅ Copy Audit — Onboarding Modal Audience (V4.32.6)
**Version:** V4.32.6
**Type:** UX / Human Elements + First-Time User

Onboarding modal misidentified PAL's audience as "DS and PM." PAL serves data analysts, business analysts, product analysts, PMs, TPMs, and product leads — not data scientists.

**Fixes applied:**
- Subtitle: "150+ practice cases for DS and PM interviews" → "Practice cases for data analysts, product analysts, BAs, PMs, TPMs, and product leads"
- Button 1: "I'm a Data Scientist / Analyst" → "I'm a Data / Product Analyst"
- Button 2: "I'm a Product Manager" → "I'm a PM / TPM / Product Lead"

Same "Data Scientist" / "Product Manager" labels also found in the Interview Simulator role cards and debrief roleLabel variable — fixed in same release.

**Files:** `src/pages/Home.jsx`, `src/pages/InterviewSimulator.jsx` — resolved in V4.32.6

---

### 80. ✅ Visual Audit — Emoji Removal Across All Pages
**Version:** V4.32.5
**Type:** Visual Consistency + Creativity / Product

User feedback: emojis give a childish, unserious feeling to a product that should feel professional and rigorous. This is a positioning problem — PAL targets senior IC and staff interview candidates, not a casual audience.

**Scope (full audit needed):**
- Room browser headers: many use emoji icons inside the 36×36 icon box (e.g. 📝 Take-Home, 📡 Instrumentation, 🔖 Bookmarks)
- Foundation pages: A/B Foundations uses 🧪 emoji
- Sidebar: some nav items have emojis
- Locked/paywall states: use 🔒 emoji
- Tool pages: Defense Strategy uses 🛡 emoji; MCQ Quiz uses 🎯 emoji

**Proposed fix:** Replace all UI emojis with SVG icons (using existing Icon component) or clean typographic symbols (→, ↗, ·). The `Icon` component already covers most cases (book-open, target, shield, bar-chart, etc.). Any gap should use a simple CSS shape, not an emoji.

**Do not fix:** emojis inside article/case *content text* (data files) — those are author-voice and acceptable. Fix only the *UI chrome*.

**Status:** ⚠️ Open — needs systematic pass

---

### 79. ⚠️ Visual Audit — Icon Inconsistency Across Room Headers
**Version:** V4.32.5
**Type:** Visual Consistency

Room header icons are not consistent. Growth Analytics uses a bare "↗" character as the icon element (no box, no color fill). Other rooms (Instrumentation, Take-Home, Bookmarks) use a 36×36 box with border, background color, and an emoji inside. A/B Foundations and others use an emoji directly in the title line. Stats Room, RCA Room, Metrics Room have no icon at all — just the h1.

**Expected pattern (established in InstrumentationBrowser, TakehomeBrowser):**
```
<span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--X-bg)', border: '1px solid var(--X-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <Icon name="..." size={18} color="var(--X)" />
</span>
```

**Rooms needing audit:** GrowthAnalyticsBrowser (↗ character), ExpFoundationsBrowser (emoji in h1), StatsBrowser (no icon), MetricsBrowser (no icon), RCABrowser (no icon), DesignBrowser (no icon), ScenarioBrowser (no icon), ChallengesBrowser (emoji box). Full pass needed.

**Status:** ⚠️ Open — needs systematic pass

---

### 78. ✅ Copy Audit — Code Lab, Challenges, Frameworks (V4.32.5)
**Version:** V4.32.5
**Type:** UX / Human Elements + First-Time User

Three pages reviewed after user flagged them as still feeling wrong post-V4.32.4.

**Findings:**
- Code Lab opened defensively ("Not generic coding drills") without stating the real bar
- Challenges described the format ("2–3 rooms simultaneously") without explaining why that matters at the interview moment
- Frameworks jumped into positioning without first answering: why do frameworks matter at all? Candidates use them as vocabulary; the payoff is when they change your conclusion

**Resolution (V4.32.5):** All three rewritten around the actual failure mode each page protects against.

**Status:** ✅ Resolved

---

### 77. ✅ Copy Audit — 6 Rooms Incorrectly Left Untouched in V4.32.2 (V4.32.4)
**Version:** V4.32.4
**Type:** UX / Human Elements + First-Time User

V4.32.2 judgment call to leave 6 rooms "untouched" was wrong. User screenshots confirmed A/B Design, Stats Room, RCA Room, and Metrics Room descriptions were still mechanic-heavy. Product Design and Prioritization also failed the cold-user test.

**Findings:**
- A/B Design: "Set the primary metric, randomization unit, trust checks" — a task list
- Stats Room: "Read the situation, inspect the data, make the call" — describes the exercise, not the stakes
- RCA Room: "Walks you through the exact reasoning process step by step" — passive instruction framing
- Metrics Room: "Choose your primary metric, diagnostics, guardrails, grain" — mechanic inventory
- Product Design: "Work through 5 phases" — pure mechanic
- Prioritization: "Practice RICE scoring, effort-impact matrices" — framework listing with no stakes

**Resolution (V4.32.4):** All 6 rewritten with the same stakes-first pattern.

**Status:** ✅ Resolved

---

### 76. ✅ Copy Audit — Tool/Utility Page Descriptions (V4.32.3)
**Version:** V4.32.3
**Type:** UX / Human Elements + First-Time User

Same cold-user audit applied to the 9 non-room pages (tools, learn, and utility pages). These pages describe *what the tool does* but not *why it matters at the interview moment*.

**Findings:**
- Stats Calc: "Paste your experiment results. Get statistical significance, SRM check, and a plain-language verdict." — mechanic inventory, no stakes
- Trainer: "Configure your session" — pure mechanic, zero stakes framing
- Bookmarks: "Jump back in whenever you're ready." — passive, no reason to return deliberately
- Company Tracks: "Curated case sets by company and role." — feature description with no interview hook
- PlaybookBrowser: "Quick-reference for every pattern that comes up in interviews." — generic

**Resolution (V4.32.3):** All 9 rewrites follow the same pattern established in Audit #75 — name the real stakes, name what goes wrong without it, explain what the tool trains or enables.

**Status:** ✅ Resolved

---

### 75. ✅ Copy Audit — Room Description Clarity (V4.32.2)
**Version:** V4.32.2
**Type:** UX / Human Elements + First-Time User

Every room browser page was audited for whether a cold user — someone who has never used PAL and doesn't know the interview format — could understand why the room exists and why they should care before clicking in.

**Finding:** 13 of 19 room descriptions failed the cold-user test. The pattern: they described mechanics (module counts, topic lists, what you do) but skipped stakes (the real interview moment, what goes wrong for most candidates). This is the classic expert blind spot — built by someone who already knew the domain.

**Examples of the failure:**
- "Event tracking, measurement plans, data contracts, and data quality" — a tag cloud, not a reason to care
- "Structure ambiguous business and product analytics questions." — describes the exercise, not why it matters
- "The theory behind A/B testing — before you practice design and review." — syllabus framing, no stakes

**Resolution (V4.32.2):** All 13 rewrites follow the same pattern — name the real interview moment, name what most candidates get wrong, explain what the room trains. 6 rooms were already strong and left untouched.

**Status:** ✅ Resolved

---

### 74. ✅ UX Comprehension Audit — Timer Legibility (V4.32.0)
**Version:** V4.32.0
**Type:** UX / Human Elements

Batch 0 tester feedback surfaced two problems with the elapsed timer: (1) users didn't know whether clicking it would affect their score, and (2) they couldn't pause to think without the timer running. Both are self-confidence issues, not real performance issues — but they add cognitive overhead.

**Findings:**
- Timer was a non-interactive `<span>` with no affordance (no cursor change, no tooltip)
- No pause mechanism anywhere across 5 runners
- The `warning` class (red color at 10min) was alarming with no explanation

**Resolution (V4.32.0):** Replaced `<span className="pal-timer">` with `<TimerButton>` shared component across BehavioralRunner, InstrumentationRunner, RCARunner, EstimationRunner, StatsRunner. Button toggles pause state; hover tooltip clarifies that the timer is self-awareness only, not scored.

**TakehomeRunner excluded** — its countdown timer is the exercise mechanic. Pausing it would undermine the practice.

**Status:** ✅ Resolved

---


*Parts XV–XXII (V4.9–V4.35) archived in AUDITS_ARCHIVE.md.*
