# Product Analytics Lab — Ideas Backlog

Tiered build backlog. **In Progress** = actively being built this session. **Tier 1** = high impact, buildable now. **Tier 2** = high impact, more effort or dependencies. **Tier 3** = interesting, lower priority. **Retired** = consciously not building, with reasons.

---

## In Progress

**PAUSED — feature building suspended as of V4.25.1.**
Next actions before any new feature work:
1. Confirm `VITE_POSTHOG_KEY` is live in Vercel prod and establish WAU baseline
2. Watch 20 real sessions — which room first, where do they drop off, do they reach debrief?
3. Decide on paywall flip based on observed usage, not assumptions

_No new features until PostHog baseline is established._

**Exception shipped V4.27.0:** Defense Strategy rebuild — triggered by real interview prep use case (Meesho SBA). Qualifies as a quality improvement to an existing tool, not a net-new feature.

**Exception shipped V4.29.0:** Access code freemium gate — activated `isUnlocked()` to check localStorage for valid code (`PAL-BETA-2026` / `PAL-FOUNDER-1`). Free tier = first 3 cases per room + all Foundations + Defense Strategy. Premium = full case banks + Company Tracks + Simulator. Access code is the permanent community tier; Stripe will layer on top.

**Defense Strategy future layers (not yet built):**
- Layer 4: Company track cross-referencing — if prepping for Meesho, weight RCA 40% heavier, surface supply-demand framing. Needs company track data to be trustworthy.
- Layer 5: Live plan that updates as you practice — as rooms are completed, Defense Strategy re-scores gaps and updates priorities. Requires tying room completion events back to Defense Strategy state. V5 territory.

---

## Tier 1 — High impact, buildable now

### Content
- ~~Playbook articles for BI, Instrumentation, and Take-Home rooms~~ — ✅ shipped V4.8.2
- ~~More BI cases (BI13+): real-time dashboards, Looker/Tableau case studies~~ — ✅ shipped V4.10.0 (bi13–bi16)
- ~~More Instrumentation cases: dbt data models, data lineage, schema migration~~ — ✅ shipped V4.10.0 (inst09–inst12)

### Features
- ~~`case_completed` PostHog event~~ — ✅ shipped V4.6 (all 18 runners instrumented)
- ~~Interview debrief export (PDF of session answers + model answers)~~ — ✅ shipped V4.13.0 (DebriefCopyButton — markdown copy to clipboard, wired into 4 runners)
- ~~Per-case notes that persist across sessions (currently one global textarea)~~ — ✅ shipped V4.11.0 (all runners now have pal-notes-v1 notes)
- ~~Search within a single room (room-level filter on global search)~~ — ✅ shipped V4.11.0 (room filter chips in SearchPage)
- ~~Frameworks (Playbook) page redesign~~ — ✅ shipped V4.14.0 (reference-card layout, 3-col grid, category filter tabs, distinct from Deep Dives)
- ~~Consult page — overlaps with Search~~ — ✅ cut V4.14.0
- ~~Stripe paywall activation — flip isUnlocked() → false~~ — ✅ access code gate live V4.29.0; Stripe layer is next step
- ~~**Mobile audit #75 — fix 75-A through 75-C (critical/high)**~~ — ✅ shipped V4.26.0
- ~~**`gated: true` per-case paywall flag**~~ — ✅ shipped V4.29.0 (`isFree` flags deliberate on all data files; first 3 per room free, all Foundations free, Defense Strategy free)
- **Interview Simulator expansion (Batch 0 feedback — large scope)** — current DS/PM modes are too broad. Feedback: split into specific roles (Product Analyst, Business Analyst, Data Analyst, PM) each with a Senior / Staff tier. Remove the generic DS mode. Target question counts per session: Quick = 5–10, Standard = 10–15, Full Loop = 20–30, Marathon = 30–40. Question bank needs depth to support these tiers before shipping. Do not build until PostHog shows Simulator usage worth investing in.
- Confirm `VITE_POSTHOG_KEY` is live in Vercel prod and establish WAU baseline
- ~~**Next-case highlight for all 15 remaining case room browsers** (audit #72)~~ — ✅ shipped V4.25.0 (all 16 browsers now have firstUnstartedId + accent border + "Next →" badge, each using room color var)
- ~~**Sticky next CTA for RCARunner, CaseRunner, BIRunner** (audit #72)~~ — ✅ shipped V4.25.0 (position-fixed bottom bar with back + next buttons)
- ~~**Progress sync on tab close for signed-in users** (audit #73)~~ — ✅ shipped V4.25.0 (visibilitychange listener in App.jsx)
- ~~**Delete Header.jsx or document it as unused** (audit #73)~~ — ✅ shipped V4.25.0 (comment added noting Sidebar.jsx is the real nav)
- ~~**Sign-in button in mobile topbar** (audit #73)~~ — ✅ shipped V4.25.0 (sign-in button + avatar added to mobile-topbar right slot)

### Visual Polish
- ~~**Animation system — full app pass (audit #110)**~~ — ✅ shipped V4.35.0–V4.35.2. Full animation vocabulary in index.css (11 utility classes, 8 keyframes). Route transitions, staggered card entry, spring debrief reveals, Next button glow pulse, modal slide-up, press feedback, MCQ correct/wrong feedback. 100% coverage verified by grep audit: 21/21 runners, 39/39 pages, 32/32 StatsFoundations modules.
- **Interview Simulator layout overhaul (audit #82)** — current config screen (role cards, session length/mode pills) reads like a toy UI, not a serious drill tool. Needs full redesign: remove emojis from role cards, tighten spacing, increase visual gravity, replace hardcoded px values with CSS variables throughout. Do in same pass as audit #80 emoji removal.
- **Emoji removal — full UI pass (audit #80)** — emojis in room headers, icon boxes, locked states, and nav give a childish, unserious feeling inconsistent with the senior-IC positioning. Replace all UI-chrome emojis with Icon component SVGs or typographic symbols. Scope: all browser header icon boxes, foundation page headers, paywall lock states, tool page headers. Do not touch emojis inside case/article content text (author-voice). Medium effort — systematic search-and-replace across ~20 files.
- **Room header icon consistency — full pass (audit #79)** — icon treatment is inconsistent across room browsers. Growth Analytics uses bare "↗" character; A/B Foundations uses 🧪 in the h1; Stats/Metrics/RCA/Design rooms have no icon at all; others have the 36×36 colored box pattern. Standardize to the box pattern (36×36, var(--X-bg) fill, var(--X-border) border, Icon component inside) across all room browsers and foundation pages. Should be done in the same pass as audit #80.

### Content — BI / Reporting
- **BI chart interpretation scenarios** — BI is inherently visual; text-only scenarios miss the point. Add a sub-format to the BI room: "here's a dashboard/chart — what do you conclude, what's wrong, what do you recommend?" Chart.js or Vega-Lite renders inline without a backend. Scenario types: declining trend with seasonal overlay, pie chart with misleading denominator, dual-axis chart where axes manipulate perception, dashboard with inconsistent date filters. This is directly what BI interviews test and no other prep tool does it visually. Effort: medium (one new component, ~10 new scenarios). Tier 1 — highest ROI among the new ideas.

### Pre-beta gate items (do before sending Batch 1 invites)
- ~~**About section**~~ — ✅ shipped V4.45.0. About.jsx fully rewritten: what PAL is, who it's for, how it differs from DataLemur/StrataScratch/Exponent, all 17 rooms listed, difficulty levels explained, how to use by experience level.
- ~~**Difficulty calibration + filter (audit #143)**~~ — ✅ shipped V4.45.0. All data files normalized to analyst/senior/staff taxonomy. DifficultyChips component created. Filter chips added to all room browsers.
- ~~**Foundations first-principles vetting pass (audit #141)**~~ — ✅ resolved V4.46.0. All 65 modules across all 4 foundation rooms rewritten situation-first.
- **Git push V4.43.0–V4.46.0** — run from Mac terminal (pending on user)
- **Confirm `VITE_POSTHOG_KEY` live in Vercel** — check env vars dashboard (pending on user)

### Foundation + Practice Room Content Revision (large multi-session effort)

This is the highest-ROI content investment PAL can make. Current state: all rooms and foundations are calibrated for someone with 1–2 years of product analytics experience who already knows what RCA, cohort analysis, and A/B testing are and is practicing judgment on top of that knowledge. A career-switcher from technical operations, consulting, or any non-PA background hits the RCA room, sees "walk me through your framework for a 20% DAU drop" with no anchoring in what DAU is, why it matters, or what a framework even means in this context, and bounces. The content is not wrong — it is excellent — but it is written for the wrong entry point.

**The fix is at the foundation level, not the practice room level.** Practice rooms are correctly designed for judgment practice; the issue is that foundations do not actually build the knowledge needed to enter those rooms. Every foundation module currently opens with a framework ("RCA follows a four-layer hypothesis tree...") when it should open with a human situation ("Your PM just pinged you: DAU dropped 20% overnight. You have 2 hours before the leadership review. What do you do?"). First the situation, then the concept, then the framework.

**Approach: one room at a time, smallest concentration unit.**

- **RCA Foundations rewrite** — highest beginner gap. rf01 must establish: what a metric drop is, why analysts investigate rather than PMs, what the stakes of a wrong diagnosis are. Every subsequent module builds on that. Logged as audit #142.
- **Stat Foundations rewrite** — second priority. sf01 must establish: what statistical claims in business actually mean, why a "significant result" can still be wrong, what an analyst is actually deciding when they look at p-values. The interactive modules are excellent once you understand what they're for — the problem is newcomers don't know what they're for.
- **Metrics Foundations rewrite** — third. mf01 must establish: what a metric is and isn't in a product context, why the difference between a vanity metric and an actionable one costs companies millions. Framing before taxonomy.
- **Exp Foundations rewrite** — fourth. ef01 is already the best-framed ("Why We Experiment") but the path from ef01 to ef07 is steep for someone who has never designed an experiment.
- **Practice rooms — beginner difficulty layer** — after foundations are fixed, add 3–5 explicitly Beginner-tagged cases per room with heavy scaffolding: cleaner setups, more constrained decision space, explicit hint on what framework applies. These are not dumbed-down versions — they are entry points that assume no prior PA experience.

**What is NOT being built:** Hard gates, quiz walls before room entry, required sequence locks. These make PAL a gated course, not a practice space — and that conflicts with PAL's product identity. See DECISIONS.md.

**Soft gate that IS being built:** When a user enters a practice room without having completed the linked foundation, show a dismissable card: "Haven't done [Room] Foundations yet? That's the best starting point → [Go to Foundations]." Recommended, not required.

**Beginner pathway on Home.jsx:** One clearly labeled entry track for career-switchers — "New to product analytics? Start here: Stat Foundations → RCA Foundations → 3 beginner cases → Defense Strategy." Does not change the existing nav or room structure. Just a visible onboarding path.

**Effort:** Large. Each foundation rewrite = 1 dedicated session. Each practice room beginner layer = 1 session. Total: ~8–10 sessions across all rooms. Execute one room at a time.

### Beginner UX (soft gates, not hard gates)
- **Soft "foundation recommended" nudge on practice room entry** — when a user enters a practice room without the linked foundation completed, show a single dismissable card at the top of the browser: "Haven't done [X] Foundations yet? It's the best starting point. → [Go to Foundations]". One sentence, one CTA, dismiss-able. Does not block entry. Does not lock the room. Effort: low (~30 lines per room, reusable component). Needs `isFree` + foundation-completion localStorage check. This is the correct mechanism — not a quiz wall or hard gate.
- **Beginner onboarding track on Home.jsx** — one clearly labeled section for career-switchers and complete beginners: "New to product analytics? Start here →" with a 4-step path: Stat Foundations → RCA Foundations → 3 Easy cases in Stats Room → Defense Strategy. Static UI component, no new routes needed. Effort: very low.

### Content Quality
- **Case debrief explanation depth — failure mode pass (audit #86)** — debriefs state the right answer but don\'t explain what a weak answer looks like or why it fails under interviewer follow-up. Run a pass across all room data files adding: (1) what the weak answer looks like, (2) the specific follow-up that exposes the gap. Prioritize RCA, Metrics, Stats first. High effort — full content pass.
- **MCQ Trainer distractor quality (audit #87)** — some wrong options in `trainerMCQ.js` are too obviously eliminable. Each distractor should be correct in a different context, or adjacent-but-subtly-wrong. Full 40-question pass to rewrite weak distractors. One session.
- ~~**Foundation modules missing task instructions (audit #95)**~~ — ✅ resolved V4.36.4. "What to do" prompts added to rf11/rf12 in RCAFoundationsRunner.jsx.
- ~~**Foundation module depth audit — RCA, Metrics, Exp (audit #96)**~~ — ✅ resolved V4.44.0. All stub entries (rf07–rf12, mf09–mf13, ef08–ef15) canonicalized: isFree, playbookLinks, difficulty casing, devNote removed. Module counts: RCA=12, Metrics=13, Exp=15. All keyInsights rewritten situation-first in V4.46.0.

### SQL Lab — phase 3 features (problem bank + hints + timer + nav complete as of V4.43.0)

**✅ V4.43.0 SHIPPED:** 130 problems (50E/40M/25H/15Master), hints system (1/2/5/5 by difficulty), per-problem timer, Progress.jsx SQL section, SQL Lab in Sidebar.jsx nav. Datamarts: 12 total (ecomm, saas, fintech, consumer, health, gaming, logistics, marketplace, food_delivery, social_network, edtech, hr_analytics).

**Problem bank target:** ✅ COMPLETE — 130 problems (50E/40M/25H/15Master, culled + reclassified from original 250 in V4.40.0). All original, not copied from DataLemur/StrataScratch. Same SQL concept coverage, different business context, different data.

**Difficulty tiers (qualitative distinctions, not just complexity):**
- Easy: prompt implies the technique, 1–2 tables, clean data, tests whether you know the construct
- Medium: 2–3 concepts chained, at least 1 data trap, tests whether you can combine correctly
- Hard: technique not implied, naive query gives wrong answer, edge case is in the data
- Master: business question only (no technique signal), multi-concept, judgment-required, open interpretation. Challenge Vault — never in study plans.

**Business-first framing rule:** Every prompt follows: (1) who you are, (2) what happened, (3) what they\'re asking, (4) what to return — framed as stakeholder need, not "write a query that...". Technique must be derived from the question, never named in the prompt.

**Datamart architecture:**
- 5 datamarts: ecomm / saas / fintech / consumer / health
- Each datamart: 4–5 tables, 15–25 rows per table, seed data stored as JS arrays of arrays (not SQL strings)
- DB init: prepared statements (`db.prepare(...).run(row)`) — avoids apostrophe escaping
- File split: `sqlLabDatamarts.js` (schemas + seed) + `sqlLabProblems.js` (problems only, reference datamartId)

**Problem metadata per problem:** id, title, company, companyDomain, difficulty, isFree, tags[], roles[], priority (1/2/3), estimatedMin, datamartId, prompt, expectedColumns[], expectedRowCount, checkValues[], solution, debrief, sqliteNote

**Features shipped / to ship:**
- ✅ SQL editor (textarea, Tab=2-space indent, Ctrl+Enter=run)
- ✅ sql.js WASM runtime (browser-side SQLite)
- ✅ Results table + validation (column names + row count + spot-check values)
- ✅ Debrief reveal with --discovery amber border
- ✅ Right sidebar: progress bar, difficulty/company filters, problem list with solved indicators
- ✅ localStorage solved tracking (`pal-sql-lab-solved-v1`)
- ✅ Company logos via Google Favicon API (`https://www.google.com/s2/favicons?domain=...&sz=32`)
- ✅ Challenge Vault: Master problems in separate sidebar section, never in plans
- ✅ Master difficulty color: purple (`var(--purple)`)
- ✅ Role tags per problem + priority for plan generation
- ✅ 130 problems: 50E / 40M / 25H / 15Master (V4.40.0+)
- ✅ Hints system: progressive reveal (1/2/5/5 by difficulty), Show Answer only after all hints exhausted (V4.43.0)
- ✅ Per-problem timer: starts on first keystroke, saves to `pal-sql-lab-times-v1` on solve (V4.43.0)
- ✅ SQL Lab progress section in Progress.jsx (solved count by difficulty, total time, nav button) (V4.43.0)
- ✅ SQL Lab in Sidebar.jsx analytics subgroup nav (V4.43.0)
- ✅ Company filter chip in ProblemSidebar (V4.46.0)
- ✅ Hints quality review: spot-checked 130 problems, no misleading hints found (V4.46.0)
- ✅ PostHog events: `sql_problem_solved`, `sql_hint_used`, `sql_answer_revealed` (V4.46.0)
- ✅ SQL Lab streak in Progress.jsx heatmap via `pal-sql-lab-dates-v1` (V4.46.0)
- 🔲 Submit button + edge test cases (Hard/Master only — NULL, empty table, boundary)
- 🔲 Study plan onboarding: 4-step modal (interview?/when?/role?/time-per-day?) → payoff screen with daily queue
- 🔲 Plan modes: Casual / Steady / Intensive (30/60/120 min per day)
- 🔲 Solved-aware plan: skips already-completed problems
- 🔲 SQL Lab — framing quality pass (LeetCode/DataLemur/StrataScratch benchmarking): tighter business context, clearer input/output spec, company-realistic numbers. Session 3 did one rewrite pass; a second targeted pass would lift quality further.

**Study plan numbers:**

| | Casual | Steady | Intensive |
|---|---|---|---|
| 3-day | 4 | 9 | 15 |
| 7-day | 10 | 21 | 35 |
| 14-day | 18 | 35 | 56 |
| 1-month | 30 | 70 | 120 |

**SQL concept coverage (concept matrix drives problem ordering):**
Family 1 — Aggregation & Filtering (Easy-heavy): GROUP BY, HAVING, CASE WHEN agg, DISTINCT COUNT, NULL handling, COALESCE/NULLIF, BETWEEN/IN, string/date functions
Family 2 — Joins (Easy→Medium): INNER, LEFT, 3–5 table, non-obvious key, anti-join, self-join, cross join, range join
Family 3 — Subqueries & CTEs (Medium): correlated subquery, EXISTS/NOT EXISTS, scalar in SELECT, derived table, 2–3 CTE chains, recursive CTE
Family 4 — Window Functions (Medium→Hard): ROW_NUMBER, RANK/DENSE_RANK, LAG/LEAD, FIRST_VALUE, NTILE, SUM OVER, ROWS BETWEEN N PRECEDING, 7-day rolling, session gap detection
Family 5 — Advanced Patterns (Hard): gap-and-island, funnel analysis, cohort retention, Simpson\'s Paradox, median (SQLite hack), mode, de-duplication, SCD Type 2, first/last touch attribution
Family 6 — Data Traps (across all): divide-by-zero, integer division, duplicate join inflation, NULL in aggregates, off-by-one dates, LEFT→INNER conversion via WHERE

**Build sequence (from NEXT.md):** 12 steps, one per message. See NEXT.md #1 for full ordered list.

**v2 deferred:** SQL Lab-specific progress page, Pandas/R/PySpark layers, role-specific debrief variants.

**Scope boundary:** Product analytics SQL only — funnel, cohort, DAU, A/B, metric decomposition, mix-shift. No generic LeetCode algorithmic puzzles.

### Bugs
- ~~**React error boundary — missing entirely (audit #105)**~~ — ✅ resolved V4.36.x. `src/components/shared/ErrorBoundary.jsx` created (class component), wrapping `<main>` in App.jsx. Fallback: "Something went wrong — go home" CTA.
- ~~**Data file validator script (audit #102)**~~ — ✅ resolved V4.36.2. `scripts/validate-data.js` implemented (ES module, backtick check, single-quoted apostrophe state machine, id/title field check). Wired as `npm run validate-data`. Note: `companyTracks.js` and `trainerMCQ.js` legitimately lack `title:` field — structural exceptions, not bugs.
- ~~**Foundation module subtitle duplication bug (audit #94)**~~ — ✅ resolved V4.35.x. Removed `{module?.subtitle}` from body paragraph in 5 affected stat modules (Module01, Module02, Module03, Module05, Module06). Only Stat Foundations was affected — confirmed by grep across all 4 rooms.
- ~~**Hardcoded color values — CSS variable pass (audit #92)**~~ — ✅ resolved V4.36.1. Replaced hardcoded `rgba(0,0,0,x)` and `#333` across 7 files; added `--overlay` token to `:root`.
- ~~**Sitemap missing 8 top-level routes (audit #93)**~~ — ✅ resolved V4.36.x. All 8 routes present in sitemap.xml: home, progress, trainer, unlock, company-tracks, defense-doc, about, search.
- **Empty state quality pass (audit #91)** — Bookmarks, Progress (zero rooms), locked-room state, MCQ Trainer (no attempts). Each should acknowledge state, explain what belongs here, give a specific next action.
- ~~**Metrics Room — linked scenarios not clickable (Batch 0 feedback)**~~ — ✅ resolved V4.31.x (task #35). onGoToDesign + onGoToReview wired in App.jsx and MetricDebriefPanel.
- ~~**PostHog autocapture PII risk (audit #85)**~~ — ✅ verified V4.33.2. `analytics.js` already has `autocapture: false` + `capture_pageview: false` + PII sanitization. No fix needed.
- ~~**Timer cleanup on navigation (audit #88)**~~ — ✅ verified V4.33.2. `clearInterval` correctly called in useEffect cleanup across all runners.
- ~~**Stat count consistency audit (audit #89)**~~ — ✅ verified V4.33.2. All numeric claims consistent across src/, public/, CLAUDE.md. — after revealing the senior metric design answer, linked scenario cards appear in the debrief but tapping them does nothing. Users expect to navigate directly. Small fix, high friction when it fails.
- ~~**`onResetAllProgress` missing 9 keys** (audit #62)~~ — ✅ fixed V4.6.1 (8 keys added, reset now covers all rooms)
- ~~**`case_opened` missing from 4 open functions** (audit #61)~~ — ✅ fixed V4.6.1 (BI, STF, Take-Home, Instrumentation now tracked)
- ~~**Sitemap missing 8 V4.x routes** (audit #63)~~ — ✅ fixed V4.6.1 (22 URLs, all rooms indexed)
- ~~**Home.jsx daily drill — wrong BEH case** (audit #65)~~ — ✅ fixed V4.6.1 (BEH01→BEH05, title corrected)
- ~~**Stats Room DIFFICULTY_CFG missing intermediate/advanced/staff entries** (audit #67)~~ — ✅ fixed V4.7.2 (STAT09/STAT10-12 showed "Foundational" badge incorrectly)
- ~~**STAT08 claim references seller data not shown in setup** (audit #67)~~ — ✅ fixed V4.7.2 (seller conversion data added to observedResult)
- ~~**Template literals in 9 data files** (audit #64)~~ — ✅ resolved V4.12.0 (all 26 data files audited, all clean, no changes needed)
- ~~**Dark mode palette low-brightness readability** (audit #74)~~ — ✅ shipped V4.25.3/V4.25.4 (full palette rebuild: bg #111520, surface #191e30, lifted semantic bg colors; incremental V4.25.3 pass was not visible on real devices, required full rebuild in V4.25.4)
- ~~**Duplicate sign-in CTA in sidebar and topbar** (audit #76)~~ — ✅ fixed V4.26.1 (removed sign-in button from Sidebar.jsx; topbar is canonical mobile sign-in location)

### Distribution / Go-to-Market

*Source signal: practitioner post (May 2026) — quiz platform builder earned £1k+ via automated video pipeline + Etsy PDF. Validated model: free content → paid conversion, bypass SEO via automation.*

- **Etsy summary PDFs** — low-effort, real monetisation signal. PAL has the content to produce "A/B Testing Interview Cheat Sheet", "SQL for Product Analysts Quick Reference", "Metrics Framework 1-pager". Each is a 2-hour build. List at £4–9. Tests willingness to pay before Stripe goes live. No code required.
- **TikTok / YouTube Shorts video pipeline** — automated shorts from PAL\'s question bank. Stack: Amazon Polly (TTS) → HTML Canvas (question image frame) → stitch into 30–60s video → auto-upload. One video per SQL problem or RCA case. "Can you answer this product analytics interview question?" Distribution without SEO competition. 250 SQL problems alone = 250 pieces of content. Do after Stripe is live so free → paid funnel exists.
- **Free value → paid conversion pattern** — validated by post: 10k TikTok followers giving away answers, then converted to course sales. PAL\'s beta-free access follows same logic. Don\'t rush the paywall flip — build audience on free first, then convert.

*Note: "Video content" in Retired refers to PAL housing passive video lessons as a product feature. TikTok/Shorts pipeline is a distribution channel, not a product feature — no conflict.*

---

## Tier 2 — High impact, more effort

### Defense Strategy — pending upgrades

*Do not build until PostHog confirms real usage of the V4.27.0 flow AND Batch 1 feedback is collected.*

**Gate model (decided, not yet built):**
Two-gate architecture. Room gate = hard lock, already live V4.29.0 — fires whenever a locked case is opened, no bypass. Plan nudge = soft upsell card at ~35% plan completion, NOT a hard wall. The plan nudge has a bypass problem if hard-gated (user just copies the plan and navigates directly to rooms, hitting the room gate anyway). So the plan nudge is a warmer, contextual conversion surface for motivated users mid-goal — not a second paywall.

Auto-detection (not manual checkboxes): plan step completion is auto-detected by cross-referencing the plan\'s recommended case IDs against existing room progress keys (`pal-rca-progress-v1`, `pal-cases-progress-v1`, etc.). No self-reported progress.

**Prerequisite audit completed (V4.29.0):** Defense Strategy already computes and uses specific case IDs — `getTopCases()` returns full case objects with `.id` fields (e.g. RCA01, M01, C01), used directly in `onNavigate(meta.page, c.id)` chips. The IDs are there. BUT they are computed at render time and never persisted — so there is no stored record of "this was your plan." Auto-detection requires one additional step: when the plan is generated, serialize the plan (room + case ID pairs per day) to `pal-defense-plan-v1` in localStorage. Then detection logic cross-references stored IDs against progress keys on load. This is ~40 lines of code, not a schema change. No other prerequisite outstanding.

**Layer 4A — Three-layer micro-sequence per skill (lowest effort, highest impact)**
Currently the plan outputs room chips + 2 matched cases. Upgrade: for each skill in the day plan, show a structured micro-sequence — (1) "Read first" linking one Playbook article matched to that skill, (2) the relevant Foundation module if self-rated Weak/Okay, (3) 2–3 JD-matched cases as now, (4) "Drill" linking to the MCQ Trainer filtered to that category. PAL already has all four content layers; the Defense Strategy just needs to route through them in sequence rather than dumping room chips. The Playbook article link per skill is the single lowest-effort step here and closes the most visible gap.

**Layer 4B — Company track cross-referencing (medium effort)**
If the JD or company name signals a known company (Meesho, Amazon, Google etc.), adjust skill weights against PAL\'s company track data. Meesho = RCA weighted heavier, supply-demand framing surfaced. Amazon = behavioral appears in every round regardless of JD language. Requires enough company track data to be trustworthy before shipping.

**Layer 5 — Live plan that updates as you practice (high effort)**
As the user completes PAL rooms, gap scores re-compute from actual progress. Plan re-orders to surface the next highest gap. Requires a persistent `pal-defense-plan-v1` localStorage key storing which plan was generated (room + case IDs) and tying room completion events back into Defense Strategy state. Turns a one-time plan into a living prep tracker. Auto-detection prerequisite (above) must be resolved first. Previously called V5 territory — still significant scope but the data infrastructure already exists.

**Layer 6 — Verbal simulation prompt at day end (low effort)**
At the end of each day card, surface one articulation prompt per top-gap skill ("Explain in 90 seconds how you would diagnose a 15% GMV drop"). Self-score checkbox: Couldn\'t do it / Got the structure / Nailed it. Score feeds back into gap weight for the next session. Closes the read-practice-articulate loop.

---

### Defense Strategy V2 — Resume-Aware, Round-Typed, Cost-Weighted Prep Plan

*Gate: do not build until Batch 1 confirms real Defense Strategy usage from V4.27.0 flow. This is a ground-up rethink of the input layer, not a layer on top of current flow.*

**The core problem with current flow:** Asking users to self-rate every skill the JD mentions is noisy. People self-rate inaccurately, and you\'re wasting their attention on skills their resume already evidences. The result is a plan padded with non-gaps.

**The insight:** Cross-reference resume against JD first. What the resume covers = already proven, skip the self-rating. What the JD requires but the resume doesn\'t cover = genuine gaps. Rate only those. Sharper signal, less user friction, better plan.

**Proposed 5-step input flow:**

**Step 1 — JD input (already exists)**
User pastes the job description. System extracts required skills, weighted by frequency and emphasis in the JD (existing logic).

**Step 2 — Resume input (new)**
User pastes resume text or LinkedIn summary (text paste only — MVP; no PDF upload until backend exists, mammoth.js DOCX is option B). System cross-references resume against JD-extracted skills. Skills the resume credibly covers are removed from the gap list. Only genuine gaps surface for Step 3.
*Implementation note: text paste framing = "paste your resume or LinkedIn summary" — low friction. PDF parsing in-browser is unreliable without a backend. Do not promise file upload.*

**Step 3 — Self-rate gaps only (upgrade from current)**
Instead of rating all JD skills, user rates only the skills identified as gaps in Step 2. Fewer questions, higher accuracy. Self-rating options remain: Strong / Okay / Weak.

**Step 4 — Round context (new)**
Three inputs on one screen:
- Days available: Quick (1 day) / Short (3 days) / Standard (7 days) / Full (14 days)
- Round type: Technical (routes to Stats/RCA/Metrics/Code) / Product Sense (routes to Design/Prioritization/Estimation) / Behavioral (routes to Behavioral room + articulation prompts) / General / Final (covers all)
- Difficulty: Junior / Mid / Senior (weights depth and case selection within each room)

*Round type must map to PAL\'s actual content, not generic labels. Technical = Stats+RCA+Metrics+Code. Product Sense = Design+Prioritization+Estimation. Behavioral = Behavioral room. Final = weighted mix of all based on gap severity.*

**Step 5 — Previous round feedback (new, optional)**
If the user has already completed earlier rounds in this interview loop: free-text field per completed round type + optional structured tag (Passed / Struggled / Did not go well). This input re-weights the plan — e.g. "I already passed the HM screen but the technical is next" tells the system to deprioritize behavioral entirely and tighten the plan around the technical gap. High personalization signal, low implementation cost (it\'s just an additional weight modifier on the existing scoring logic).

**Output — cost-weighted day plan:**
Same card-per-day format as current, but now the plan:
- Skips skills the resume already covers (no padding)
- Weights days by gap severity × round type × days available
- If behavioral round: includes one articulation prompt per day (Layer 6, pull forward)
- If previous round feedback signals a specific failure area: that area gets a dedicated recovery day at the start of the plan

**What this is NOT:** A backend product. All logic runs client-side on the JD text, resume text, and user inputs. No API calls, no storage beyond localStorage. The resume is never sent anywhere — it\'s parsed in-browser for gap analysis only.

**Effort:** High. This is a full rebuild of the Defense Strategy input flow — new components for resume paste + gap-detection logic, round type routing, previous round feedback field, and updated plan generation scoring. Estimate 2–3 sessions.

**Gate check before building:**
- PostHog confirms Defense Strategy has real Batch 1 usage (not just opens)
- Current Layer 4A (micro-sequence per skill) is already shipped — V2 builds on that output format, not a separate plan format

---

### Interview Experiences tab
Curated catalog of real analyst/PM interview experiences with a skill frequency graph ("what topics come up most, across which companies"). Submission flow: user pastes free text → you assess quality/completeness → approve and add manually. The curation bottleneck is real — this is ongoing work for the product's life. **Do not build the in-app submission flow first.** Manually source 20–30 experiences from LinkedIn/Reddit/r/dataengineering, validate the skill frequency pattern is interesting, then decide if the infrastructure is worth building. The graph itself (Chart.js, topics × frequency) is the high-value deliverable; the ingestion pipeline is the expensive part. Tier 2 — gate on having a real corpus first.

### Share buttons + deep-link routing
Share buttons without actual per-problem URLs are useless (they'd just link to home). Real work: add URL routing for individual problems and cases (SQL Lab problem IDs, Case IDs, Foundation module IDs). PAL is currently a pure SPA with no per-item routes. Adding `?problem=sql-e01` or `/sql-lab/sql-e01` routing requires changes to App.jsx + all runners. Once routing exists, share buttons are trivial. Do not build share buttons until routing exists. Effort: medium per room × 17 rooms. Start with SQL Lab (most benefit from sharing individual problems).

### Room relationship map — learning arc visualization

**Gate: PostHog shows users getting lost — low room diversity per user, or high Home.jsx bounce.**

The discoverability problem is real: a new user doesn't know what the difference is between Stats Room and Stat Foundations, how SQL Lab relates to Code Room, or what the learning arc looks like from beginner to staff. Home.jsx already shows all rooms as a list — a map that is also just a list adds nothing.

What actually solves it: a visual overview that shows *how rooms connect and progress*. Not navigation (sidebar + Search handle that), but learning arc legibility. Proposed structure — two tracks shown visually:

- **Analytics track:** Stat Foundations → Stats Room → Experiment Review → RCA Foundations → RCA Room → Metrics Foundations → Metrics Room → Growth Analytics
- **SQL track:** SQL Lab (standalone, beginner-to-master self-contained)
- **PM/judgment track:** Product Design → Prioritization → Behavioral → Estimation
- **Tools layer (cross-track):** Defense Strategy, Company Tracks, Interview Simulator, MCQ Trainer

Each node in the arc shows: room name, what it tests (foundations vs. practice vs. simulation), estimated time commitment. The arc is the thing Home.jsx doesn't show — Home.jsx shows rooms as peers, not as a progression.

The keyboard shortcut badges (Tier 1 item above) can live on these nodes too, making this a unified entry point for both discoverability and speed.

**Effort:** Medium. Needs a visual layout decision (SVG diagram? CSS grid with connecting lines?), new route (`/map`), and a data structure mapping rooms to track membership. ~1 dedicated session.

**Do not build:** A "map" that is just a prettier Home.jsx with shortcut badges. That's Home.jsx with extra steps. The value is specifically the track relationships + progression signal that Home.jsx lacks.

---

### Deep Dives (BlogBrowser) — IA + UX overhaul

**Gate: do not build until ≥6 posts per major category have full content.** Currently 81 posts exist, 12 with full content, ~69 stubs. Any UI redesign that exposes posts before content is real will surface empty stubs — worse experience than the current flat list.

**Problem:** 81 posts as an endless scroll is a content graveyard. Users open it, see the wall, close it. Most content is stubs. The current layout does not communicate what Deep Dives is or how to navigate it.

**Proposed IA (once content is real):**

*Default state — Series view:* Posts are grouped into named series (e.g. "Metric Foundations," "Experimentation Essentials," "RCA Masterclass"). User lands on series cards, not individual posts. Tags sit above the series grid for filtering.

*Tag-selected state:* Selecting a tag collapses the series view and surfaces individual posts matching that tag, with filter/sort options (newest, most relevant, room-matched). A "Clear filter" returns to series view.

*Personalized state (requires localStorage activity data):* If the user has meaningful room progress, the default view shifts from series to three labelled sections — "Revise" (concepts from rooms they\'ve attempted but scored low), "Learn" (concepts adjacent to rooms they haven\'t started), "What\'s next" (natural progression from current progress). Tags still show above and override the personalized view when selected. This is achievable because PAL already stores per-room completion in localStorage — no new data infrastructure needed.

*Pagination:* Never show more than 20 posts at once in any view. "Show more" button below, not infinite scroll.

**Effort:** Medium-high. Content taxonomy work (naming series, tagging posts) is the prerequisite and is non-trivial — probably a full session of data work before any UI is built. The personalized sections are the highest-value piece and are achievable in ~60–80 lines once content taxonomy is solid.

---

### Content
- STAT17–20+: more causal inference (IV estimation, synthetic control, geo holdout) — partially done in V3.4, extend further
- Cases Room expansion: pricing strategy, international expansion (C13+)
- **Indian tech case cluster — RCA + Metrics + Cases rooms** — PAL\'s current case bank skews heavily US-tech (Meta, Stripe, Airbnb, Google). A dedicated cluster of 6–8 cases grounded in Indian tech companies (Meesho, Swiggy, Zepto, Flipkart, Razorpay, Zomato) would serve a real audience gap. These are structurally different problems from US-tech: low AOV, COD payment friction, logistics cost as a first-order variable, supplier quality as a demand lever, tier-2/3 behavioral differences. Cases to build: Meesho return rate spike (RCA), Swiggy delivery SLA degradation (RCA), Zepto dark store expansion metrics (Metrics), Razorpay payment success rate drop (RCA), Flipkart seller activation decline (Cases), Zomato restaurant partner churn (RCA/Cases). Each case uses the existing room format — no new infrastructure. Gate: same as India Company Tracks — needs audience signal first.
- **Marketplace metric tree — interactive decomposition module** — PAL\'s Metrics room teaches metric design but not metric *hierarchy* for specific business models. A marketplace-specific interactive module (in Metrics Foundations or as a standalone advanced module) that lets users decompose: GMV → NMV → orders × AOV → conversion rate × sessions → by category, by cohort, by seller tier. Then: cancellations → pre-ship vs. post-ship, RTO rate → by logistics partner vs. by category. Users drag/click to build the tree, then a scenario drops in ("GMV is flat — start decomposing") and they must navigate to the causal branch. Teaches a skill that no existing Metrics module addresses. Effort: medium — new interactive component, but follows the existing Metrics Foundations module pattern.
- ~~Growth Analytics Room expansion: GA09+ — supply-side metrics, marketplace health~~ — ✅ shipped V4.8.4 (GA09–GA12)
- **Multi-part escalating case dossiers** (from ML Systems Lab pattern) — 3–5 part company scenarios where each part builds on previous answer. E.g. "Google retention case: (1) define churn metric; (2) design experiment; (3) handle confound in results; (4) make trade-off decision." Deeper than current Cases Room format.
- **Interview Q&A bank with 4-tier model answers** (from ML Systems Lab InterviewQATab) — 50+ curated questions ("Walk me through an A/B test," "How would you debug a retention drop?") with model answers at Junior/Mid/Senior/Principal tiers. Directly plugs into Behavioral + Stats + Metrics rooms.
- **"Analytics Failures" catalog** (from GenAI Lab Debug pattern) — 25 named failure patterns: bad event taxonomy, selection bias in A/B, cohort leakage, Simpson's Paradox in segmentation, metric definition drift, silent imputation, etc. Failure modes catalog for RCA, Metrics, Growth rooms.

### Features
- **Keyboard shortcuts for all rooms** — extend the existing shortcut system (`q` → SQL Lab, `/` → Search) to cover every room with a 1–2 char code (e.g. `s` → Stats, `m` → Metrics, `r` → RCA, `e` → Experiment Review, `x` → Stat Foundations, etc.). Display the shortcut as a small muted badge on each room card in Home.jsx so users discover them passively. The shortcut hook already exists — this is ~50 lines in the keyboard handler + badge copy on cards. Low effort, real power-user value for returning users who want zero-click navigation. Do not add to a "map" page — the sidebar and Search already handle navigation. Shortcuts are for speed, not discovery.

- **Code Room — SQL playground (Batch 0 feedback)** — the Run Code button only works for Python. SQL modules display code with no execution path. Ideal end state: lightweight in-browser SQL execution (e.g. sql.js / DuckDB-WASM) with a sample dataset pre-loaded per module so users can run and validate queries. Adds significant value for the SQL-strong/experimentation-weak Batch 1 profile.
- ~~**Timer — play/pause + tooltip (Batch 0 feedback)**~~ — ✅ shipped V4.32.0. Shared `TimerButton` component; pause/resume toggle across 5 runners; tooltip on hover.
- Stripe payment flow activation (link already scaffolded in `VITE_STRIPE_PAYMENT_LINK`) — requires flipping paywall gate + end-to-end test
- ~~Company track completion badges~~ — ✅ shipped V4.14.0 (green Complete badge on card + 🎉 banner in TrackDetail)
- ~~Dark/light mode persistence fix~~ — ✅ already in place via index.html inline script (was pre-existing)
- Difficulty progression lock (must complete junior before senior unlocks) — opt-in mode only
- **Learning paths with checkpoint tracking** (from ML Systems Lab, directly portable) — "6-week Analytics Interview Ready," "Metrics Mastery Track," "PM Onboarding Path." Each path is a guided sequence across rooms, with step completion checkmarks + progress counter (X/N steps). localStorage pattern identical to existing rooms.
- ~~**JD-to-skill-gap mapper** (from ML Systems Lab JDPrepTab + GenAI Lab PrepLab)~~ — ✅ shipped V4.27.0 as Defense Strategy (3-step flow: JD parse → self-rating gap score → personalized plan with round breakdown + outside-PAL flagging)
- **Per-room breakdown in mock exam debrief** (from ML Systems Lab CombinatorTab) — after Interview Simulator session, show visual bar chart: Metrics 90% / Growth 65% / Behavioral 78% / Stats 80%. Gives clearer skill gap signal than current pass/fail format.
- **Verbal practice with speech-to-text** (from ML Systems Lab VerbatimTab) — Web Speech API, user speaks 2-min answer to interview question, transcript shown, self-score on 4 criteria (clarity, depth, speed, recovery). Already have the interview question bank.

### Features
- ~~**Mobile audit #75 — fix 75-D through 75-I (medium/low)**~~ — ✅ shipped V4.26.0
- **Quiz Me on Playbook articles** (from GenAI Lab — auto-generated MCQs from article content) — every Playbook article gets a "Quiz Me" button that generates 3–5 MCQs from the article body. Transforms passive reading into active recall. Extends the MCQ Trainer without new manual content.
- **Playbook → practice direct linking** (from ML Systems Lab ∇ Gradient pattern) — every Playbook/Gradient article has a "Practice this" link at the bottom that navigates directly to the most relevant case in the relevant room. Currently articles and cases are disconnected. This closes the read-to-practice loop in one tap.
- **Timed exam lock mechanic** (from ML Systems Lab Combinator) — 30/45/60-min option where answers are locked until the timer ends. Current Interview Simulator has no time pressure. The lock mechanic makes it feel like a real screen.
- **Production bug debugging room** (from ML Systems Lab Code Bugs tab — 20 Python/SQL production bugs) — dedicated room for debugging broken analytics code: wrong aggregation, off-by-one in window functions, silent NULL handling, metric definition bugs. Different from Code Room (which is execution-focused). Scenario: "this query is running but giving the wrong answer — find it."
- **PM Practitioner tab** (from GenAI Lab AI Product tab analog) — dedicated tab/section for PM-specific tools: PRD critique simulator, stakeholder explainer, metric trade-off evaluator. PAL skews analyst-heavy; this anchors the PM audience.
- **Single forward pointer after case debrief** (from GenAI Lab principle) — upgrade "Forward-pointer card" (Tier 3) to enforce ONE next step, not 3–5 options. Genai lab implemented this as a single "What to do next" card with no menu. Prevents decision paralysis at debrief end.
- **Concept drawer — inline visual illustrations** — add an optional `illustration` field to concept data; render a small inline SVG diagram inside the Concept Reference drawer (right panel). Only populate where a diagram genuinely compresses understanding: distributions (p-value, CI), thresholds (guardrail metric), time-series patterns (novelty effect, peeking), decision trees. Estimate ~40–50% of concepts are good candidates; definitional/taxonomy concepts are not. Build approach: hand-authored SVG per concept (high quality, higher effort) vs. template-based (lower effort, risk of looking cheap). Batch 1 comprehension feedback should confirm whether this gap is real before committing build time.

### Platform
- ~~**Access code for moat content (Batch 0 feedback)**~~ — ✅ shipped V4.29.0 (`DAI2026` single community code; permanent community tier; Stripe layers on top)
- ~~**Homepage framing pass (audit #103)**~~ — ✅ resolved V4.35.x. Subtitle aligned to analytics+experimentation core identity. Primary CTA changed to "Start with A/B testing →" pointing to stats room. Audit #116 logged.
- **Supabase auth — finish or cut (audit #104)** — Supabase auth is in the codebase and referenced in the README but has not been verified as production-complete. `PROGRESS_KEYS` in `syncProgress.js` may be stale (rooms added since V4.24 not included). Auth error states (invalid credentials, sync failure) have no verified graceful fallback. Decision required before Batch 2 outreach: (a) complete to production-ready — E2E test with real Supabase project, verify PROGRESS_KEYS covers all current rooms, add error handling — or (b) remove Supabase entirely and ship as pure localStorage-first until the Stripe sprint makes backend investment justified. Half-done is the worst option. See DECISIONS.md for the ruling.
- **Three front doors IA audit** (from GenAI Lab — Build/Prove/Navigate structure) — audit PAL's home and nav for whether users can identify their entry mode in <5 sec. GenAI lab organizes around Build/Prove/Navigate. PAL equivalent: Practice (rooms) / Assess (Simulator+Trainer) / Navigate (Defense Strategy+Company Tracks). Check if this framing improves cold-start clarity.
- **Create PARKED.md** (from GenAI Lab pattern) — separate file for consciously cut or deferred features with reasons. Currently IDEAS.md "Retired" section handles this, but a dedicated PARKED.md with more context per item is cleaner. Move Retired section → PARKED.md with migration notes.
- First-Time User cold walk-through audit with sidebar nav (incognito, every confusion point noted) — sidebar is new in V4.7, cold path not yet audited
- IP/Moat audit — what's genuinely hard to replicate? What to double down on?
- MVP/Weight audit — which features earn their place? Consolidation candidates?
- **India PM Company Tracks** — Blinkit, CRED, Meesho, Zepto, Myntra, Swiggy, Razorpay, Flipkart, PhonePe, Paytm etc. Round-by-round maps exist (Malay Krishna source). Infrastructure is `companyTracks.js`. Blocked on: no data that Indian users are on PAL yet; content needs to be specific enough to actually prep against, not just round-name lists. **Meesho specifically:** the most directly buildable track given existing signal. Cases should cover COD failure rate spikes, RTO (return-to-origin) anomalies, category-level GMV drop, supplier activation funnel, seller churn, logistics SLA degradation, buyer retention in tier-2/3, and discovery/search conversion. The business context that must be baked in: low AOV, price-sensitive buyer behavior, COD as primary payment, tier-2/3 city logistics, supplier quality as a demand-side lever, return rate as a trust signal rather than just a cost metric. Gate: PostHog confirms Indian users on platform, or explicit outreach to Indian analyst community produces Batch 1-equivalent signal.

---

## Tier 3 — Interesting, lower priority

### Branding reserve
- **Logo mark I (bar chart P)** — bar chart that forms a P shape, inverted (light bg, purple bars). Warmest mark in the set — the one users might smile at first sight. Reserve for: swag, social card variant, email footer, or a secondary mark once brand is more established. Do not ship as primary — it reads clever before it reads premium. Primary mark is E (CI) shipped in V4.31.0. SVG files live in `/branding/`.


### Content
- More Take-Home prompts (TH06+): marketplace, fintech, health domains
- Behavioral Room expansion: BEH31+ for Staff/Director-level leadership scenarios
- Estimation Room: industry-specific tracks (fintech, healthtech, marketplace)
- **Guesstimates sub-format in Estimation Room** — guesstimates are a subset of estimation (Fermi problems with business framing). PAL already has EST01–30; add 5–10 guesstimate-style problems with explicit "no data given, derive from first principles" framing. Low effort, directly interview-relevant.
- **"Spot the flaw" adversarial format for RCA + Metrics** (from ML Systems Lab, adaptable) — show a plausible-looking analysis with a buried methodological error, no MCQ, user must identify and explain the flaw. Flaw types: selection bias, confounding variable, Simpson's Paradox, wrong metric, incorrect cohort definition, feature flag misconfiguration. PAL already has Spot the Flaw room (STF) — extend this mechanic into RCA and Metrics rooms as a sub-format.
- **"Senior engineer reasoning" reveal layer** (from ML Systems Lab StaffLayerTab) — after each case, show "How a Staff analytics engineer reads this" with nuanced multi-step reasoning. Currently debriefs are authoritative but don't model the thought process explicitly.

### Features
- **Code Lab SQL + Python hybrid** — Code Lab currently runs Python only (Pyodide). Adding sql.js (already in codebase from SQL Lab) would make Code Lab a genuine analyst IDE: write Python + SQL in the same session, referencing the same datamarts. This mirrors real analyst work. The positioning distinction from SQL Lab: Code Lab = free-form notebook environment (Python + SQL, open-ended exploration); SQL Lab = structured problem bank with graded checking. That's a clean separation. Effort: medium (sql.js already imported, datamarts reusable). Do after SQL Lab Phase 3 is complete.
- **Mobile autocomplete for SQL/Python editor** — QoL feature for users trying to practice on phone. Monaco has known mobile issues; a lighter textarea with a keyword toolbar (SELECT / FROM / WHERE / GROUP BY chips) is more realistic. Low priority — mobile isn't the primary use case for SQL/Python practice. Tier 3.
- **Country-curated content** — filter or tag cases by geography so users prepping for Indian companies see Meesho/Swiggy/Zepto framing, US users see Stripe/Airbnb framing. Infrastructure: add a `region` or `market` tag to case metadata. UI: filter chip on room browsers. Builds naturally from the Indian Company Tracks item already in Tier 2. Gate: confirm Indian user signal first.
- `Escape` key closes hint accordions (currently only navigates home)
- Mobile bottom nav rail for most-used rooms
- "Shuffle" button in MCQ Trainer (randomise across all 40 questions)
- Per-session score summary after Interview Simulator (shareable card)
- Consultation Space expansion: show heatmap of which concepts are most queried
- **Weak topic heatmap in Trainer debrief** (from ML Systems Lab TrainerTab, directly portable) — after MCQ drill session, show colored grid: Stats/Metrics/RCA/Design/etc. with % correct per room. "Study these next" surface specific weak-room cases.
- **Forward-pointer card at case/challenge endings** (from GenAI Lab sprint pattern, directly portable) — every case completion shows a "Master this concept" card: one related case to try next + one Defense Strategy angle + one Company Track suggestion. Removes the dead-end after debrief.
- **"Share score" clipboard button** (from ML Systems Lab, directly portable) — one-click copy of score summary. "PAL: 18/20 · 90% · Strong: Metrics · Weak: Growth Analytics" → paste to LinkedIn or resume.
- **Difficulty badges on room entry cards** (from GenAI Lab pattern, directly portable) — label each card with difficulty tier (Junior/Mid/Senior) and estimated time. Makes progression legible at a glance.
- **91-day practice heatmap** (already on Progress page) — already shipped. Confirm it's visible on the main Progress dashboard.
- **Keyboard shortcuts in Trainer/Challenges** (from ML Systems Lab, directly portable) — press 1/2/3/4 to select MCQ options, Enter to submit, N for next. Currently requires mouse clicks.
- **Skill category tagging across rooms** (from ML Systems Lab/GenAI Lab pattern, adaptable) — define 8 core skills (Metrics Design, Statistical Thinking, RCA, Storytelling, Technical Depth, Product Sense, Systems Thinking, Business Acumen) and tag every case/question. Enables cross-room skill-based filtering in Search.
- **Progress export/import** (from ML Systems Lab, directly portable) — "Export my progress" button (JSON snapshot of all localStorage keys), "Import progress" for device handoff without Supabase auth.
- **"Product-first" framing audit** (from GenAI Lab copy pattern) — reframe room descriptions from "Practice X questions" to "Do X like a staff analyst." Not a feature — a copy pass on all room cards, Home hero, and Pricing page.
- **ELI5 mode toggle on Playbook articles** (from GenAI Lab) — toggle that rewrites article body at a simpler register: shorter sentences, no jargon, plain analogies. Useful for users early in their learning curve without requiring separate content.
- **PWA + offline support** (from GenAI Lab — service worker, installable PWA) — add manifest.json + service worker to cache static assets. PAL is entirely static; offline support is achievable without backend changes. Useful for mobile commute prep.

### Platform
- Review Queue smarter scheduling (weight by room difficulty + time since last attempt)
- Learning path completion certificates (downloadable, shareable on LinkedIn)
- "What changed" digest for returning users (new cases since last visit)
- **Fidelity badges on Simulator scenarios** (from ML Systems Lab pattern) — label each interactive scenario: `~` Simulated (scripted), `◌` Illustrative (conceptual). Builds user trust about what is realistic vs. simplified.
- **Breadcrumb nav on case runners** (from ML Systems Lab, adaptable) — "PAL > RCA > Case Bank > Case #47" breadcrumb in runner header. Makes navigation feel less like a dead end.

---

## Retired — Consciously not building

| Idea | Reason |
|---|---|
| Social features (leaderboards, score sharing, community) | Distorts motivation toward proxy metrics; users optimise for score not learning |
| Mobile app | Content is inherently desktop — tables, charts, multi-column layouts don't translate |
| Video content | Passive, expensive to produce, doesn't differentiate from every other prep course |
| LMS structure (required curriculum, forced sequence, completion gates) | Implies a course; PAL is a practice space you return to, not a course you complete |
| AI evaluation of free-text answers | Expensive per-call, consistency problems, latency; defer to V5+ when revenue supports it |
| Team accounts / org dashboards | Requires backend; V5 territory |
| API / embed for third parties | Premature platform thinking; not enough users yet to justify |
| Email / notification system | Engagement mechanics distract from content quality |
| Product Cases Room as free-text only | Format breaks pre-computed scoring model; needs AI eval which is retired above |
| Stats Room as text-heavy MVP | Better to not ship than to ship another textbook |
| Cross-device sync | Requires backend; not a V4 problem |
| Standalone GenAI room | GenAI is a thread across rooms, not a room itself; would produce thin content |

---

## ✅ Shipped through V4.5 (full record)

### Rooms (16 total)
- Stats Foundations (sf01–sf20): 20 interactive modules
- Stats Room (STAT01–16): claim-evaluation mechanic
- Metrics Room (M01–M08)
- Design Room (D01–D16)
- Review Room (S01–S16)
- RCA Room (RCA01–12) with SQL validation step
- Cases Room (C01–C12)
- Code Room (code01–22): SQL + Python + Pyodide live runner
- Product Design Room (pd01–pd16)
- Prioritization Room (pri01–pri12)
- Behavioral Room (BEH01–30)
- Estimation Room (EST01–30)
- Growth Analytics Room (GA01–08) with Recharts visualizations
- BI Room (BI01–12)
- Spot the Flaw (STF01–12)
- Analytics Instrumentation Room (inst01–08)

### Practice tools
- Cross-Room Challenges (CHL01–06)
- Take-Home Challenges (TH01–05)
- Interview Simulator (DS/PM mode, MCQ mode, speech practice)
- A/B Test Interpreter (z-test, CI, SRM, multiple testing)
- MCQ Trainer (40 questions, 4 categories)

### Discovery + navigation tools
- Global Search (all rooms, keyboard shortcut `/` or `Ctrl+K`)
- Consultation Space (keyword → cases + articles + MCQs)
- Defense Strategy (JD + self-rating gap score → personalized plan, Cram Up/3/7/14 days, round breakdown, outside-PAL flagging)
- Bookmarks (cross-room, persistent)
- Company Tracks (FAANG prep packs)
- Grouped header nav (ROOMS / PRACTICE / TOOLS / LEARN / TRACK)
- Keyboard shortcuts hook

### Infrastructure
- React.lazy + Suspense code splitting (30+ chunks)
- Pyodide in-browser Python execution
- PostHog analytics (env-var gated, PII-stripped)
- 91-day practice heatmap
- Role readiness score (Getting Started / Analyst / Senior / Staff)
- Spaced repetition review queue
- Leadership Lens toggle (GA + RCA runners)
- Per-room progress reset
- Bookmark buttons across debrief panels
- Active recall textarea (Stats, Behavioral, Estimation, RCA)
- First-run onboarding modal
- Daily Drill (epoch-seeded random case)
- Last Visited labels on room cards

### Content
- 80 long-form Playbook + Blog articles
- 40 MCQ questions with explanations
- leadershipNote on all GA and RCA01–08 cases
- Worked examples on all 47 framework articles
- keyTakeaways + references on 13 top Playbook articles
