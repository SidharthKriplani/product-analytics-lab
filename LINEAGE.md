# LINEAGE.md — Product Analytics Lab Origin and Evolution

This is the narrative history of PAL. Not a version list (that's CHANGELOG.md) — a record of what the product was, what forced it to become something else, and what decisions have defined its character along the way. Written from the CHANGELOG, which has the full technical record of every release.

---

### v5.38.0–v5.40.0 — SQL Lab overhaul: validation engine, Forensic batch, India series (2026-06-20)

Three sessions of SQL Lab work with a single thread: make the practice loop honest and differentiated.

**V5.38.0 — Validation engine repair.** The SQL Lab had a race condition that caused correct answers to be rejected intermittently. `expectedSample` was stored in React state — async, stale by the time `checkQuery()` ran. Fixed by moving it to `useRef` (`expectedSampleRef`), set synchronously inside `initDb()` at problem load. Four problems had empty `checkValues` arrays; fixed with real verification values. `expectedRowCount` display bug fixed (showed wrong count on initial render). Failure messages now return specific diagnostic strings ("Output does not match expected values") instead of a generic error — so users know whether they got columns wrong, row count wrong, or values wrong.

**V5.38.1 — UX split and content infrastructure.** Run and Check split into two distinct actions: Run executes the query and shows results with no verdict; Check validates against expected output. Cmd+Enter triggers Check. `DEBRIEF_BLOCKS` system introduced: `**Section:**` markers in debrief text parse into collapsible colored sections (Approach, Interviewer Follow-Up, etc.) — upgrades every existing debrief automatically. PAL Exclusive badge added to all Forensic problems. `beforeWriting` field introduced — a yellow judgment prompt rendered before the code editor, asking the candidate to state an assumption before writing SQL. This is the only SQL practice tool that does this.

**V5.39.0 — Forensic batch to 35 problems.** 10 new Forensic problems (sql-f26–f35) covering 10 distinct bug classes not previously represented: unfiltered JOIN on multi-status table (Salesforce), SUM OVER window function missing ORDER BY (Shopify), GROUP BY missing a dimension (One Medical), AVG vs SUM on exposed amounts (Revolut), COUNT(*) vs COUNT(DISTINCT) (Intercom), wrong JOIN key (JPMorgan), INNER vs LEFT JOIN drops zero-count rows (Amazon), strftime year grouping instead of month (HubSpot), scalar subquery with = instead of IN (Stripe), second WHERE after GROUP BY should be HAVING (Flipkart). `beforeWriting` prompts added to 5 Hard problems (sql-h01, h02, h04, h07, h11) — the problems where candidates most often skip the definition question and write wrong SQL. Forensic batch now at 35 problems; DataLemur has zero equivalent format.

**V5.40.0 — India SQL series, Swiggy datamart.** Swiggy is the first PAL datamart built around an Indian company. 5 tables: restaurants (12 rows, 5 cities), customers (10, with is_swiggy_one tier), delivery_partners (8, one suspended), orders (25 — 21 delivered, 4 cancelled with NULL delivered_at), order_items (42, price×quantity verified against order totals). Delivery times engineered to produce clean city-level averages: Chennai 19.0 min, Bangalore 25.8, Mumbai 28.0, Hyderabad 37.25, Delhi 40.0. Six problems: sw01 (avg delivery time by city via strftime date math, Medium), sw02 (Swiggy One GMV segmentation with beforeWriting, Hard), sw03 (loyal diners HAVING on (customer, restaurant) pairs, Medium), sw04 (slow delivery partners HAVING on AVG with beforeWriting, Hard), sw05 (restaurant revenue leaderboard LIMIT 5, Hard), sw06 (Forensic — COUNT vs SUM + missing status filter, two independent bugs). This closes the India SQL coverage gap that audit #123 flagged — DataLemur has zero India-specific SQL problems.

**Open risk carried forward:** sql-f26–f35 checkValues were written with '.0' decimal suffix on whole-number SUM results (e.g., `{ total_disputed: '280.0' }`). The check comparison is `String(db_value) === String(checkValue)`. For a whole-number REAL column, sql.js returns a JS integer: `String(280)` = `'280'`, not `'280.0'`. These checkValues will silently reject correct answers on the fallback path. Flagged in AUDITS.md #165. Fix before shipping these problems to testers.

---

### v5.36.0–v5.37.0 — SQL Lab bug fixes + PostHog funnel closed (2026-06-20)

Three high-severity bugs fixed. Stats Foundations modules 26–32 silently refused to open: they existed in `statsFoundationsModules.js` but were missing from `statsFoundationsIndex` in `caseIndex.js` — `openStatFoundationsModule()` hit an early return on `find()` returning undefined. Fixed by adding sf26–sf32 to the index. SQL Lab Q.9 false positive fixed: checkValues had only `{ name: 'Dr. Smith' }` — strengthened to include all 4 expected columns. Column alias confusion now surfaced in the error UI.

PostHog conversion funnel closed: `gate_shown → gate_cta_clicked → [gap] → user_signed_in` had an unmeasured middle step. Fixed with `pendingGateConversionRef` — a ref set true when user clicks sign-in from the gate, cleared when `SIGNED_IN` fires, which triggers `gate_converted` with the originating room. `plans_page_viewed` wired via useEffect on page='plans'. `sql_query_run` wired in SqlLabPage.jsx per attempt.

Deep SQL Lab audit produced `SQL_LAB_AUDIT_2026.md` — full diagnostic covering validation race condition (expectedSample is async React state, should be a ref), checkValues quality breakdown (4 empty, 39 single-key, 57 two-key, 66 three-plus), DataLemur comparison, content gaps, and a prioritized fix plan. The Forensic batch (25 problems, no competitor equivalent) identified as PAL's sharpest SQL differentiator. Strategic docs also produced: `EXPOSURE_MAP.md` (GREEN/YELLOW/RED surface classification), `BETA_FEEDBACK.md` (permanent feedback log, two sessions), `COMPETITIVE_RESEARCH.md` (Dataford/Practicai), `LINKEDIN_STRATEGY.md`. Push pending: V5.36.0 + V5.37.0 committed in /tmp/pal-push, user must `git push` from Mac terminal.

---

### v5.35.0 — ShareLinkButton on all 18 runners + SQL Lab (2026-06-18)

ShareLinkButton component wired into all 18 scenario runners and SQL Lab page. hashRouting.js complete with URL write-back for all rooms. Deployed via HTTPS+PAT push after auth issues. Pushed: ✅

---

## Origin: One Room, One Question (V1 — 2025)

PAL started as "Experimentation Systems Lab" — a single-room practice tool for product analysts who understood A/B testing theory but struggled applying judgment to real, messy results. The problem it was solving: every existing resource teaches the formulas. None of them put you in the decision meeting.

The first release had 8 experiment review scenarios. Each one gave you a fictional company, a completed A/B test with real-looking data, stakeholder pressure, and a 3-way call: Ship / Rollback / Investigate. After you decided, you got a senior analyst debrief — what trap was set, what the correct read was, how to explain it. The mechanic was simple and the content was high quality: SRM, novelty effects, metric conflict, guardrail breach, SUTVA, multiple testing, peeking. Concepts that trip candidates in actual interviews.

Stack was React + Vite, no backend, localStorage only. That choice was made once and has held through every release since. No API routes, no server, no database by default. Vercel serves a static SPA. Everything the user does is local.

S01–S04 were free. S05–S08 were behind an unlock code. Access code gate has been a pattern since day one.

---

## First Pivot: The Name and the Loop (V1.2 and V1.6 — 2025)

Two months in, two structural decisions were made back-to-back.

First: the Review Room alone was a one-sided product. Users could evaluate experiment results but had never designed a test. The Design Room added the upstream judgment: given a product scenario, design the test before data exists. This created the Design → Review loop that is still the core of the experimentation track.

With the Design Room came a rebrand. "Experimentation Systems Lab" was too narrow for what the product was becoming. The new name: **Product Analytics Lab**. The rename was not cosmetic — it reflected a real scope decision: this product would cover the full analytics judgment surface (metrics, RCA, business cases, experimentation, stats), not just experiment review. That scope has held.

Second major structural move: the claim evaluation mechanic. The original Stats Room used basic Q&A. The V1.6 redesign built every stats module around a "Claim to Evaluate" panel — a stakeholder makes a specific claim about an experiment result, the user evaluates whether it holds. More realistic. Forces judgment, not recall. That mechanic — decision-first, always — became the product's defining design principle.

Paired scenarios (Design ↔ Review) were also introduced in V1.6. Each Design scenario had a matching Review scenario: design the checkout test, then see how it actually played out. The paired structure is still present in the data schema.

---

## Building the Full Analytics Loop (V2.0 — 2025)

V1.6 had 3 rooms. The product vision called for 6, covering the complete analytics judgment loop: metric design → experiment design → statistical evaluation → result review → root cause analysis → business case framing.

V2.0 shipped all three missing rooms simultaneously:

**Metrics Room** — 6 cases on the single hardest judgment in analytics: what actually defines success? M01 tested proxy traps (search success rate). M06 tested GenAI-specific deflection metrics. The format: 6-dimension rubric across primary metric, diagnostics, guardrails, grain, proxy risk, decision rule.

**RCA Room** — 6 cases on structured root cause diagnosis. The format was 5-stage (system check → decompose → segment → hypothesize → validate). The cases were fictional companies (Crafted, Threadline, Prism, Spark) with internally consistent worlds — not generic "company A" placeholders.

**Cases Room** — 4 business case scenarios. The format: 6-phase analysis ending in a recommendation. This is the PM/business judgment layer, not pure analytics.

Total: 44 playable items. The loop was complete.

V2.0 also introduced Guided Learning Paths — curated sequences through the rooms for different starting profiles. These have evolved but the concept (curation over unlimited choice) has persisted.

---

## The PM Expansion (V3.0–V3.4 — Early 2026)

By V3.0, the product faced a choice: deepen the analytics track or expand into PM preparation. The honest answer was that the target audience — product analysts, business analysts, data analysts — increasingly overlapped with PM roles. The same people. The same interviews. PAL extended.

**V3.0 — Product Design Room.** The "how would you build X?" question. This room was the first departure from the quantitative analytics core: free-text responses, self-rating against model answers, no pre-computed scoring. That format was a deliberate architectural decision — PM design questions are too open-ended for multiple-choice. The tradeoff was accepted.

**V3.1 — Code Room.** SQL and Python in product analytics context — not syntax drills. Each module gave a company scenario, a schema, and a task (mix shift decomposition, CUPED in SQL, retention heatmap in Python). Also added a SQL validation step to the RCA Room: after diagnosing a root cause, write the query that validates it. No other prep resource does this.

**V3.2 — Prioritization Room.** Six scenarios covering RICE, effort-impact, OKR conflicts, stakeholder alignment. Plus 15 PM Playbook articles across four new categories (Product Design, Prioritization, PM Strategy, PM Career). The Learn layer was expanding alongside the practice layer.

**V3.3/V3.4 — Gap fill.** An honest platform audit identified 6 material gaps: RCA and Cases were thin, no behavioral/leadership layer, no Fermi/estimation room, no causal inference beyond A/B, no interview-format SQL. All 6 addressed: Behavioral Room (BEH01–08, STAR format), Estimation Room (8 Fermi problems), causal inference stats modules (DiD, RD, Synthetic Control, IV), interview-format SQL in the Code Room, RCA expanded to 12 cases, Cases expanded to 12.

By V3.4, PAL had 10 rooms and 80+ playable items. It was no longer a single-loop tool.

---

## The Foundations Layer (V3.5 — Early 2026)

A major structural addition: the learn-before-you-practice layer.

V3.5 shipped **Stat Foundations** — 12 sequential interactive modules with live visualizations (sliders, SVG charts, real-time calculations). Each module: a concept, an interactive element, a visualization. Starting from What is Data and ending at Power & Effect Size. This was not a room in the practice sense — it was a prerequisite curriculum.

The Blog layer was also fully populated in V3.5 — ~80 articles with real narrative content (previously all stubs). Articles ending with "Practice this now →" CTAs to the relevant room. The learn → practice loop was intentional from the start (V2.4 added the blog stub in 2025); V3.5 made it real.

Learning paths were sharpened: "Code Track," "Full-Stack DS Interview," and others were added to the home page.

---

## Production Readiness (V3.6 and V4.x — 2026)

**V3.6 — Monetization layer.** Pricing page ($49 one-time at the time), Unlock flow, `isUnlocked()` in `src/utils/unlock.js` (still returns `true` during beta, marked with a TODO). SEO layer: OG tags, sitemap, robots.txt, structured JSON-LD. Mobile responsive audit: 44px touch targets, responsive container widths, viewport fixes. This was the transition from "feature building" to "can ship."

**V4.0–V4.5** — Heavy expansion phase. New rooms: BI, Spot the Flaw, Take-Home Challenges, Analytics Instrumentation, Cross-Room Challenges. Growth Analytics expanded. Experimentation Foundations room added (7 modules on the statistical concepts behind A/B testing). Defense Doc Generator (paste a JD, get a study plan). Take-home model answers. Per-case notes across all runners. Global Search. Bookmarks. Company Tracks. MCQ Trainer. Interview Simulator. PostHog analytics. Lazy loading (code splitting, initial bundle excludes all room code). Supabase auth layer (optional, env-var gated).

By V4.5, PAL had 17 rooms and 150+ playable items. The rate of room additions slowed — deliberately.

**V4.47.0** — BI chart interpretation scenarios shipped. Visual judgment-practice added to the BI room: 7 scenarios covering deceptive charting patterns (axis zoom, Simpson's Paradox, dual-axis manipulation, cherry-picked windows, aggregation hiding divergence, missing seasonality, omitted zero baseline). ChartScenario component renders recharts visualizations, poses multiple-choice interpretation questions, reveals model answers + key insights. Integrates seamlessly with existing BIRunner routing (format detection). BI room now covers both text-based business case analysis and visual chart interpretation — the full scope of BI interview work.

**V4.6–V4.19** — Infrastructure hardening and polish. Bug sweep across all runners (mobile hover mutation pattern, null deref, broken paywall displays). Full dark mode rebuild (luminance gap verification at real device brightness). Mobile audit: safe-area-inset, proper grid layout, webkit tap highlight, Code Room mobile notice. Icon system (SVG Icon.jsx, 24 Lucide-compatible icons). CSS utility class system (`.pal-timer`, `.pal-cta`, `.pal-back-btn`, `.pal-progress-track`). Typography overhaul (Inter font, 0.68rem global font floor). Visual hierarchy pass across all 17 room browsers (difficulty borders, progress bars, sort button active states). Copy rewrites: every room description rewritten from mechanics-first to stakes-first. A/B Test Interpreter tool. Role readiness score. 91-day practice heatmap. Daily drill. Onboarding modal.

**V4.22** — Price raised from $49 to $69. Nav emoji removal. Nav labels standardized.

**V4.24** — Supabase auth wired: sign-in, cross-device progress sync, `visibilitychange` listener for background push. Optional — app runs identically without env vars.

**V4.25** — Feature pause decision recorded. The product was "technically complete enough to charge for." The next risk was not features — it was unknown usage. PostHog baseline first, then observe, then decide.

---

## Key Identity Decisions (All Versions)

Several decisions have been made once and never revisited. They define what PAL is.

**No backend (V1 → present).** Supabase auth is optional and env-var gated. No API routes. No custom servers. The product runs entirely client-side. This was not a cost decision — it was a complexity budget decision. A static SPA on Vercel can scale to any audience size without operational overhead.

**Decision-first, always (V1.6 → present).** Every module opens with a situation, not a definition. The Stats Room module on p-values starts with a stakeholder claim to evaluate. This principle was codified in DECISIONS.md and has shaped every case, module, and article written since. "Decision-first" is the clearest differentiator between PAL and any textbook or course.

**One failure mode per case (V2.0 → present).** If a scenario straddles two failure modes, simplify it or split it. Teaching one thing well beats teaching two things messily.

**GenAI as a thread, not a room (V3.0 → present).** GenAI content lives inside existing rooms (Playbook, RCA cases, Metrics cases). No standalone GenAI room. Keeps scope clean, avoids thin content.

**Audience: analysts and PMs, not data scientists (V4.32.6 → present).** The product targets data analysts, product analysts, business analysts, PMs, TPMs, and product leads. "Data Scientist" was removed from all audience copy in V4.32.6. This distinction shapes the interview framing, content difficulty calibration, and room selection.

**PAL's canonical description (V4.33.7 → present).** "An interactive judgment system for product analysts, data analysts, and PMs." "Judgment system" is accurate and differentiating — users practice the calls, not the definitions.

---

## Access and Monetization Arc

| Period | Access model |
|---|---|
| V1 | Unlock code `EXP-LAB-DEV-2026` — S05–S08 locked |
| V2.3 | Beta: `isUnlocked()` returns `true`, all 44 items free |
| V3.6 | Pricing page scaffolded, Stripe not wired |
| V4.29.0 | Freemium gate live: code `DAI2026`, first 3 cases/room free, full Foundations free |
| V4.29+ | Price $69 one-time. Access code is permanent community tier. Stripe scaffolded, not live |

---

## What PAL Is at V4.36.0

17 rooms. 155+ cases. 72 interactive foundation modules across 4 rooms (32 Stat + 15 Exp + 13 Metrics + 12 RCA — all stubs fully populated as of V4.36.0). Cross-room Challenges. Defense Strategy (JD → personalized study plan). Interview Simulator. MCQ Trainer. Company Tracks. Global Search. Bookmarks. PostHog analytics. Supabase optional auth. CI mark brand identity. Full premium animation system (11 utility classes, 9 keyframes). Access code gate. Pricing page.

The stack is still React + Vite, no backend, localStorage primary store. The product is a static SPA on Vercel. Nothing from V1 has been broken.

The scope boundary remains: product analytics and PM. ML systems, data engineering, MLOps — those belong in the sibling ML Systems Lab. That constraint has prevented the product from becoming generic.

The product was never a course, never a textbook, never a leaderboard. It is a practice space for judgment calls. That's what it was in V1, and it's still what it is.

---

## V4.35.x–V4.36.0 — Foundation Layer Completion

The most significant structural change this period was completing the foundation layer across all four rooms.

**V4.35.4** — Seven visual bugs fixed in Stat Foundations modules (bell curve spike, SE overflow, power slider, correlation layout shift, Bonferroni n=1, regression overlap, selection bias clip). These were not cosmetic — they broke the interactive learning mechanic that makes Stat Foundations different from a textbook.

**V4.35.5** — Right-side sticky nav panel added to all four foundation runners. Users can now see every module in the room, jump to any unlocked module, and track progress without exiting to the browser page. The decision: right-side sidebar for foundations only (case practice rooms have their own browser pages as navigation). Responsive — hides below 900px.

**V4.35.6** — Stub greying. 19 stub modules in Exp, Metrics, and RCA Foundations were marked `isStub: true` in their data files, rendering them at 0.4 opacity in the nav with a "Coming soon" tooltip. This was a deliberate interim state — the nav panel made stubs visible, so their emptiness needed to be communicated clearly.

**V4.36.0** — All 12 remaining "Coming Soon" placeholders replaced with full interactive modules. Each module includes: an SVG visualization or interactive exercise, a multi-choice question with reveal, and a key insight. The modules removed from stub status: ef12 (Holdout Groups — trajectory chart + sum-of-parts paradox), ef13 (Multi-Armed Bandits — epsilon-greedy simulator), ef14 (Geo Experiments — 4-scenario classifier), ef15 (Switchback — C/T timeline + 3-question drill), mf11 (Composite Metrics — OEC slider builder), mf12 (Guardrail Metrics — ship/no-ship decisions), mf13 (Metric Sensitivity — CV slider + sample size calc), rf08 (SQL Patterns — 3-step query walkthrough), rf09 (Seasonality — YoY toggle chart), rf10 (Data Quality — symptom-to-cause diagnose), rf11 (External Factors — 5-event classify), rf12 (Multi-Level RCA — toggleable cause bars).

Also in V4.35.x: five NEXT.md bugs resolved — subtitle duplication across 5 foundation modules, GuidedPathCard item list removed from Progress page, homepage framing aligned to analytics+experimentation core identity.

The foundation layer is now complete and internally consistent. Every module in every foundation room is interactive, navigable, and substantive.

---

*Reconstructed from CHANGELOG.md (V1 through V4.36.0). If this file is out of date, read the CHANGELOG and update the narrative — do not delete this file.*

## V4.37.x–V4.39.0 — SQL Lab: From POC to 250 Problems

SQL Lab had existed as a 5-problem POC (V4.37.2) — a hidden room at `/sql-lab` with a basic editor and a single sidebar. The architecture was a single file with per-problem schema definitions and seed data embedded alongside the problem metadata. This made scaling impractical.

**V4.38.0** — Complete architectural rebuild. The critical decision was separating data from problems: `sqlLabDatamarts.js` became the single source of truth for all 5 industry schemas and seed data; `sqlLabProblems.js` carries only problem metadata with a `datamartId` reference. The DB init layer in `SqlLabPage.jsx` uses SQLite prepared statements (`db.prepare(...).run(row)`) rather than SQL INSERT strings — eliminating the apostrophe-escaping problem that had broken the Vercel build twice in other data files.

Five shared datamarts (ecomm, saas, fintech, consumer, health) launched with 5 tables each and seed data chosen to make specific problem types possible: user 5's three consecutive order dates enable gap-and-island problems, user 9 in fintech has the exact signals needed for the risk engine target, users 13–15 in ecomm have no orders (enabling anti-join problems). The seed data is architecture, not filler.

30 problems (12E/10M/6H/2Master) shipped with the rebuild. UI additions: Challenge Vault section in sidebar for Master problems, Clearbit company logos, schema accordion showing all datamart tables.

**V4.39.0** — Scaled from 30 to 250 problems: 100 Easy / 75 Medium / 50 Hard / 25 Master. The scaling process required extensive data verification — every `expectedRowCount` and `checkValues` was manually traced against the seed data before writing. Float columns were excluded from `checkValues` entirely (SQL float precision is unreliable for equality checks). The Hard and Master tiers cover window functions, multi-CTE chains, self-joins, gap-and-island patterns, composite scoring models, referral chain analysis, and monthly time-series aggregation.

The 25 Master problems form the Challenge Vault — always visible in the sidebar, excluded from study plans, estimated at 20–30 minutes each. They are the hardest SQL problems a senior PA or DA would encounter in a real interview loop at a top-tier tech company.

SQL Lab is still internal-first — hidden at `/sql-lab`, accessible via keyboard shortcut `q`. Phase 2 features (Study Plan modal, per-problem timer, Progress page integration) are queued but unbuilt.

*V4.38.0–V4.39.0 reconstructed from CHANGELOG.md.*

## V4.40.0–V4.44.0 — SQL Lab Quality Arc + Foundation Canonicalization

The 250-problem bank turned out to be the wrong asset. A market benchmark audit (2026-05-31) against DataLemur, StrataScratch, and LeetCode revealed that 39 problems were duplicate skeletons — the same SQL pattern applied to a different column, with no added conceptual difficulty. Another 21 were misclassified (Easy-level problems labeled Medium or Hard). The culled, reclassified target was 130 problems: 50E/40M/25H/15Master.

**V4.40.0** — Cull + reclassify: 39 duplicates removed, 27 reclassified. Master tier fixed from 10 to 15 (the 10-problem vault was too thin to be useful). Validate-data.js pass confirmed clean.

**V4.41.0** — All 74 remaining conversion candidates (prompts that read like textbook exercises rather than business stakeholder requests) rewritten: 16 Easy + 33 Medium + 17 Hard + 8 Master. Every rewrite follows a four-part business framing: who you are, what happened, what they're asking, what to return. Technique is never named — it must be derived from the business question. The 5-section debrief format applied to all Medium/Hard/Master rewrites.

**V4.42.0** — Schema expansion: 7 new datamarts added (gaming, logistics, marketplace, food_delivery, social_network, edtech, hr_analytics), bringing the total to 12. The principle was "wider not longer" — more schemas prevent the problem where users memorize a datamart's layout by problem 10, turning what should be SQL practice into schema lookup. Each datamart has 10–12 problems assigned.

**V4.43.0** — SQL Lab shipped as a full product feature: added to Sidebar.jsx nav, UX fixes (Google Favicon API, schema accordion raised, Master filter, sort enforcement), hints system (progressive reveal by difficulty: 1/2/5/5 hints, Show Answer only after all hints exhausted), per-problem timer (saves elapsed to localStorage on correct solve), Progress.jsx SQL Lab section.

**V4.44.0** — Foundation module data canonicalization (audit #96): all stub entries in RCA/Metrics/Exp Foundation data files (rf07–rf12, mf09–mf13, ef08–ef15) brought to full spec — correct difficulty casing, `playbookLinks` arrays added, `devNote` fields removed. This closes the gap between the six fully-built foundation rooms (canonical entries) and their extended module sets (which had been authored but not canonicalized).

The SQL Lab arc from V4.39–V4.43 is the most instructive build sequence in PAL's history: starting with volume (250 problems), discovering that volume without quality produces a worse product than 130 excellent ones, and systematically raising quality before shipping rather than shipping and hoping users wouldn't notice. The decision to not ship SQL Lab publicly until Sessions 1–6 were complete was correct.

## V4.45.0–V4.46.0 — Beginner Access Layer + Foundation Rewrites + Content Quality Pass

The realization that PAL was inaccessible to beginners drove a focused two-version sprint that changed both the product surface and the content quality.

**The accessibility problem:** PAL's content was calibrated for someone with 1–2 years of product analytics experience. A career-switcher opening the RCA room saw "walk me through your diagnostic framework for a 20% DAU drop" with no anchoring in what DAU is or why analysts investigate metric drops. The content was not wrong — it was excellent — but it assumed knowledge instead of building it.

**V4.45.0** addressed the surface: difficulty filter chips added to all 17 room browsers (canonical taxonomy: analyst/senior/staff across all data files), a rewritten About.jsx that actually explains what PAL is and how it differs from DataLemur/StrataScratch/Exponent, a beginner onboarding track on Home.jsx (first-visit only, 4-step path to foundations), and foundation nudge cards on all practice room browsers linking to the relevant foundation room.

**V4.46.0** addressed the content: all 65 foundation modules (RCA ×12, Metrics ×13, Exp ×15, Stat ×32) rewritten so every `keyInsight` opens with a concrete human work situation before any framework language — "Your PM pings you: DAU dropped 18% overnight. You have two hours before the leadership standup..." instead of "RCA follows a four-layer hypothesis tree." SQL Lab Phase 3 shipped (company filter, PostHog events, streak). Emoji pass across 11 files. 60 case debriefs gained case-specific failure mode patterns and probe questions.

The content rewrite is the most important long-term investment: it turns the foundation rooms from framework references into genuine entry points for people new to the domain.
