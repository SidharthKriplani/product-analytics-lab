# DECISIONS.md — PAL Rulebook

Prescriptive, present-tense standing rules. This is not build history (that's CHANGELOG.md). These are the rules that govern every future decision. When you're about to make a choice that affects the whole system, read this first.

---

## Architecture

**No custom backend. Supabase is the only allowed external service (V4.24+).**
The platform is a static SPA on Vercel. Core state lives in localStorage. Supabase auth and cross-device progress sync were added in V4.24 and are fully env-var gated — the app runs in localStorage-only mode when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are absent. No API routes, no custom servers. Do not introduce any other backend dependency through V4.x.

**Supabase auth must be either production-complete or removed. Half-done is not acceptable.**
As of V4.33.7, Supabase auth exists in the codebase but has not been verified as production-complete (audit #104). Before Batch 2 outreach, a decision must be made: (a) complete it — E2E test with a real Supabase project, verify `PROGRESS_KEYS` in `syncProgress.js` covers all current rooms, add auth error handling for invalid credentials and sync failures — or (b) remove it entirely and ship as localStorage-first until the Stripe sprint. The README now correctly says "optional sign-in for cross-device sync" — this claim must be true. A broken sign-in flow is worse than no sign-in.

**React + Vite only. No framework migrations.**
The stack is React 18 + Vite 8. Do not introduce Next.js, Remix, or any SSR framework. The platform is intentionally static — SEO is handled via static OG tags and sitemap, not server rendering.

**All room components use React.lazy() + Suspense.**
Named-export pattern: `.then(m => ({ default: m.X }))`. Never static-import a room page or runner. The initial bundle must not contain room code.

**All progress uses localStorage as the primary store.**
Key naming convention: `pal-[room]-progress-v1`. New rooms must follow this pattern. `onResetAllProgress` in App.jsx must include every key. The 18 `pal-*` progress keys in `src/utils/syncProgress.js` (`PROGRESS_KEYS`) are also synced to Supabase when the user is signed in — add any new `pal-*` keys to that array. Product Design uses a prefix pattern (`pd-progress-*`) requiring key iteration — document any similar exceptions.

**One file per component. No separate CSS files.**
All styling uses inline style objects with CSS variables. No CSS modules, no Tailwind, no styled-components.

**SQL Lab data is split across two files. Never merge them back.**
`src/data/sqlLabDatamarts.js` — shared datamart definitions (schemas + seed data). `src/data/sqlLabProblems.js` — problems array only, each referencing `datamartId`. This split keeps each file under ~600 lines and prevents single-write token limit errors during development. The page imports both files.

**SQL Lab DB init uses prepared statements, not INSERT strings.**
Seed data in `sqlLabDatamarts.js` is stored as JS arrays of arrays (`rows: [[1,'alice',...]...]`). The page runs `db.prepare('INSERT INTO t VALUES (?,?,?)').run(row)` per row. This avoids the apostrophe-escaping nightmare that would occur if seed data were stored as raw SQL INSERT strings. Never convert seed data back to SQL string format.

**SQL Lab study plans never include Master problems.**
Master problems live in a separate Challenge Vault section in the sidebar. They are visible always but excluded from all Casual/Steady/Intensive study plan queues. This is a permanent product decision — Master is aspirational, not structured prep.

**SQL Lab token limit rule: never write more than ~400 lines per tool call.**
The 32k output token error is triggered when a single response generates and streams large code blocks. Always write to file immediately via Write/Edit tools. Never output large file contents in response text. If a file section exceeds ~400 lines, use Write (skeleton) + Edit (fill sections) pattern.

**SQL Lab target problem count: 130 (50 Easy / 40 Medium / 25 Hard / 15 Master).**
The original 250-problem bank contains ~39 duplicate skeletons and ~21 difficulty misclassifications. The cleaned target is 130 problems with zero duplicate SQL patterns. 15 Master (not 10 — too thin for a vault; not 18 — overextends authoring). This decision was made post-market-research audit (2026-05-31). Full rationale in SQL_LAB_PLAN.md.

**SQL Lab difficulty rubric is market-anchored (LeetCode/DataLemur/StrataScratch benchmark).**
Easy = one SQL concept, direct mapping. Medium = any basic window function (RANK, NTILE, LAG, SUM OVER) OR multi-step composition (CTE, conditional agg, 3-table JOIN). Hard = chaining 2+ advanced concepts where the combination is the difficulty (gaps-and-islands, recursive CTE, window+date arithmetic, multi-CTE pipelines). Master = beyond standard interview complexity (4+ CTE chains, retention curves, combinatorics). Single window functions are Medium, NOT Hard. Anti-joins (NOT IN, LEFT JOIN IS NULL) are Easy, NOT Medium. Full rubric in SQL_LAB_PLAN.md Section 1.

**SQL Lab datamart count target: 12 (5 existing + 7 new).**
Existing: ecomm, saas, fintech, consumer, health. New: gaming, logistics, marketplace, food_delivery, social_network, edtech, hr_analytics. Principle: "wider not longer" — more schemas prevent schema memorization across 130 problems. 250 problems over 5 datamarts = 50 problems/datamart; candidates memorize the layout by problem 10. Target: 10–12 problems per datamart. Master problems get standalone schemas (one per problem, never shared).

**SQL Lab sessions 2–3 (prompt rewrites) come before sessions 4–5 (schema design + new authoring).**
Lock the stakeholder-request framing style before writing new problems against new datamarts. If new problems are authored before the prompt style is locked, they will need rewriting again. Order is non-negotiable.

---

## Product scope

**PAL covers product analytics and PM only.**
Rooms in scope: stats, experimentation, RCA, metrics, SQL/Python analytics, product design, prioritization, behavioral/leadership, estimation/Fermi, growth analytics, BI, analytics instrumentation, spot-the-flaw, take-home challenges.
Out of scope: ML model training, data engineering pipelines, MLOps, anything that belongs in the sibling ML Systems Lab.

**The canonical product description is: "an interactive judgment system for product analysts, data analysts, and PMs."**
This is the framing that best survives external scrutiny (confirmed by ChatGPT cold-read, V4.33.7). "Judgment system" is accurate and differentiating — PAL puts users in decisions, not reading situations. "Product analytics and PM" is the correct audience frame. Do not use: "interview prep platform," "learning platform," "no backend," "Data Scientists." README updated to reflect this in V4.33.7. Homepage (`Home.jsx`) updated to match — audit #103 resolved V4.35.x.

**PAL's audience is data analysts, product analysts, business analysts, PMs, TPMs, and product leads.**
Not data scientists. This distinction matters for copy, onboarding framing, and interview prep positioning. The onboarding modal and Interview Simulator role labels were corrected in V4.32.6 to reflect this. Do not reintroduce "Data Scientist" as a primary audience label. Analyst-track and PM-track are the two correct audience frames.

**Sibling labs (ML Systems Lab, GenAI Systems Lab) are linked passively from Home.jsx only.**
A "sister labs" footer strip linking to `https://ml-systems-lab-v9xe.vercel.app/` and `https://genai-systems-lab-ivory.vercel.app/` lives at the bottom of `src/pages/Home.jsx` only — muted style, no visual emphasis. No global footer link. No structural coupling between labs (shared auth, shared progress, unified nav). Labs are separate products that acknowledge each other's existence — not a platform. A future hub page is the right interlinking model if cross-lab navigation is ever needed. This was decided in V4.33.0. Do not add sister lab links anywhere outside Home.jsx without an explicit session decision.

**Rooms outside the analytics + experimentation core must not share equal visual weight with the core rooms.**
The core rooms — Stats, Metrics, Experiment Design, Experiment Review, RCA — are PAL's product identity. Behavioral, Estimation, PM Product Design, and generic career prep are in scope for the product but must not crowd out the core above the fold or in the nav hierarchy. If the landing page or nav treats 16 rooms as equals, the product loses its identity. Homepage and nav framing must reinforce the analytics + experimentation wedge first. Other rooms exist for depth, not for positioning. This rule came from two convergent external reads (ChatGPT cold-read V4.33.7, investor-style review V4.34.0) flagging the same dilution problem. Audit #103 (homepage framing) is the open action item.

**GenAI is a thread, not a room.**
GenAI content lives inside existing rooms (Playbook articles, RCA cases, Metrics cases). There is no standalone GenAI room. This keeps scope clean and avoids thin content.

**Every room is a judgment exercise, not a knowledge transfer.**
The positioning is "practice the calls." Every room must put the user in a decision-making situation, not a reading situation. No room should feel like a course or textbook chapter.

**Practice rooms use soft gates, never hard gates.**
PAL is a practice space users return to, not a course they complete in sequence. Practice rooms are never hard-locked behind foundation completion, quiz walls, or questionnaires. The correct beginner mechanism is: (1) a dismissable "foundation recommended" nudge card at room entry when the linked foundation has not been completed, and (2) difficulty-tagged cases (Beginner/Intermediate/Senior) with filter chips so users self-calibrate. The nudge recommends — it never blocks. A user who ignores the nudge and jumps straight into Hard cases has made an informed choice. This decision is standing through V4.x. Do not reopen.

**Foundation modules must open with a human situation, not a framework.**
Every foundation module (RCA, Metrics, Exp, Stat) should open with a concrete scenario — "your PM pinged you: DAU dropped 20% overnight" — before introducing any framework or taxonomy. Framework-first is the textbook pattern. Situation-first is PAL's pattern. This applies to every module rewrite going forward, not just new modules.

---

## Content

**LinkedIn practitioners are a primary content signal source.**
See `CLAUDE.md → When a screenshot is dropped` for the full workflow. Short version: assess credibility, gap-map to rooms, add named cluster to IDEAS.md, log the source.

**Decision-first, always. Never definition-first.**
Every room, module, and article opens with a situation — not a definition. The Stats Room module on p-values starts with a stakeholder claim to evaluate, not "A p-value is the probability of...".

**Every case teaches exactly one failure mode.**
If a scenario straddles two failure modes, simplify it or split it. Teaching one thing well beats teaching two things messily. See `docs/SCENARIO_BANK_TAXONOMY.md`.

**The senior debrief must be scenario-specific, not generic.**
A debrief that could apply to any experiment with the same failure mode has failed the quality bar. It must name the failure mode in this specific context, explain why it matters here, and address the most common wrong answer. 400–700 words. See `docs/CONTENT_QUALITY_BAR.md`.

**All JS data files use single quotes. Apostrophes are escaped as `\'`.**
No template literals in data files. This has caused two production build failures. There are no exceptions to this rule.

**Playbook articles are story-first.**
Every article opens with a concrete scenario — a Slack message, a PM ask, a live experiment moment — before any framework or definition. "Here's a situation" before "here's the concept."

---

## Design

**CSS variables only. No hardcoded hex values.**
Every color reference uses a CSS variable from `src/index.css`. Full color-to-room assignment table and variable list are in CLAUDE.md (authoritative — do not duplicate here).

**Light mode is the default.**
The product targets desktop analytical workspaces. Dark mode is available via toggle but light is default. Do not invert this.

**Aesthetic reference: serious analytical workspace.**
Linear, PostHog, Retool, Stripe Docs. Not edtech, not gamified, not neon. No excessive animation. No completion certificates as primary motivation.

**All animations use the utility class system in `src/index.css`. Never write ad-hoc keyframes or inline animation CSS.**
Full animation class list (`.pal-page-enter`, `.pal-card-enter`, `.pal-reveal-in`, etc.) is in CLAUDE.md (authoritative). New animations → add utility class to index.css, update CLAUDE.md, cover with `prefers-reduced-motion`. Never ship a component with a one-off animation.

**Mobile grids use `minmax(min(Xpx, 100%), 1fr)`.**
Never use `minmax(Xpx, 1fr)` bare — the minimum will overflow on narrow viewports.

**Touch targets minimum 44px height on interactive nav elements.**
Matches Apple HIG minimum.

**Dark mode palette must maintain visible surface elevation at low screen brightness.**
The bg→surface luminance gap must be large enough to distinguish layers at 30% screen brightness. A gap of <10 luminance units collapses to identical black on dimmed mobile screens. Minimum values (V4.25.4): `--bg: #111520`, `--surface: #191e30`, `--surface-2: #1f2538`. Semantic bg colors (accent-bg, teal-bg, red-bg, etc.) must be visibly tinted, not the same shade as `--bg`. Do not "safely" nudge these values — the V4.25.3 incremental pass was invisible on real devices. Go far enough.

**`--discovery` is a reserved token for insight reveal moments only. Never reuse it.**
`--discovery` (`#E8A033` light / `#F0B352` dark) may only appear as: (1) InsightBox left-border + bg-tint, (2) debrief reveal panel left-border accent. It must never appear in nav, CTA buttons, room color assignments, or any UI chrome. If it appears in more than two contexts, it is no longer a signal — it is just another color. Treat this like a brand constraint: the moment it gets reused "just this once," the insight-reveal meaning is gone permanently. Added V4.36.3.

**Sign-in has one canonical entry point per layout mode.**
Desktop: Header.jsx right slot. Mobile: mobile topbar right slot. Do not add a second sign-in CTA to the sidebar or any overlay — it creates duplicate auth affordances. The sidebar shows auth state only when signed in (email + sign out). This was fixed in V4.26.1 (Audit #76).

---

## Paywall + monetization

**Access code gate is live as of V4.29.0. `isUnlocked()` reads localStorage.**
Located in `src/utils/unlock.js`. Valid code: `DAI2026` (single community code — LinkedIn, word of mouth, direct invite). Stored under key `pal-access-code-v1`. The access code tier is permanent — it remains as the community tier even after Stripe goes live.

**Free tier: first 3 cases per room + all Foundations + full Defense Strategy.**
Every room has exactly `isFree: true` on its first 3 items (Stats has 4). All Foundations modules are fully free. Defense Strategy is fully free. This split is intentional — enough value to hook, enough gate to motivate unlocking.

**Premium tier (access code required): full case banks, Company Tracks, full Behavioral (BEH04+), Interview Simulator.**
Company Tracks and Interview Simulator have no `isFree` partial access — they are entirely behind the gate.

**Stripe is scaffolded but not live.**
`VITE_STRIPE_PAYMENT_LINK` env var exists but the Stripe flow is not wired. When Stripe goes live, `isUnlocked()` should also accept a valid Stripe session token. The access code community tier coexists with Stripe — it does not go away.

---

## What is deliberately not built

These decisions are final through V4.x. Do not revisit without strong evidence:

| Not built | Reason |
|---|---|
| Social features (leaderboards, sharing scores) | Distorts motivation toward proxy metrics |
| Mobile app | Content is inherently desktop (tables, charts, sliders) |
| Video content | Passive, expensive, doesn't differentiate |
| LMS / forced curriculum | Implies a course, not a practice space |
| AI evaluation of free-text | Expensive, inconsistent; defer to V5+ |
| Team accounts / org dashboards | Requires backend; V5 territory |
| API / embed for third parties | Premature platform thinking |
| Email / notification system | Engagement mechanics distract from content quality |
| Stats Room as text-heavy fallback | Better to not ship than to ship a textbook |
| Product Cases as free-text room | Format breaks pre-computed scoring model |

---

## Current priority (V4.55)

**Pre-Batch 1 gates (both user actions, not code):**
1. Git push V4.55.0 to Vercel (run from Mac terminal)
2. Confirm `VITE_POSTHOG_KEY` is live in Vercel prod

**Pre-Batch 2 gate:**
Supabase audit #104 — decide finish or cut before Batch 2 outreach. Half-done is worse than either. See DECISIONS.md Supabase rule above and BRAIN_TRANSFER.md for PROGRESS_KEYS drift analysis.

**Feature gate that still applies:** Do not build interview experiences tab, share/routing, or Simulator expansion until PostHog confirms real usage patterns from Batch 1. Build against observed behavior, not assumptions.

---

## Analytics

**PostHog is env-var gated. App works identically without it.**
`VITE_POSTHOG_KEY` must be set in Vercel dashboard. Never make analytics required for app function.

**`autocapture: false`. `capture_pageview: false`. Explicit events only.**
No implicit data collection. Every tracked event is a deliberate `track()` call in App.jsx.

**No PII. Ever.**
`sanitize_properties` strips `email`, `name`, `ip` from every event. Do not add user-identifiable properties to any event.

**Event naming convention: `snake_case`.**
Current events: `page_viewed`, `case_opened`, `case_completed`, `paywall_hit`, `unlocked`, `open_challenge`. New events follow the same pattern. Document in `METRICS.md`.

---

## Monetization

**Price: $69 one-time. No subscription.**
Rationale: $49 underprices 150+ cases + 25 interactive foundation modules + lifetime access. $69 is still sub-$100 (low friction), signals quality over a prep course, and is below any meaningful competitor. A subscription would require backend infrastructure (usage tracking, billing webhooks) — not viable until V5.

**No subscription tier until V5.**
Recurring billing requires usage metering, cancellation flows, and dunning — backend-only problems. Everything through V4.x is a one-time purchase or free. Do not introduce subscription logic.

**30-day money-back guarantee. No questions asked.**
Stated on Pricing page. Reduces purchase friction more than any discount. Non-negotiable — do not remove this from Pricing copy.

**Free tier gate (as of V4.29.0): first 3 cases per room + all Foundation modules + full Defense Strategy + full Playbook.**
Stats Room has 4 free cases (exception). All Foundation rooms (Stat, Exp, Metrics, RCA) are entirely free. Defense Strategy is entirely free. This is the implemented gate — see `src/utils/unlock.js` and `isFree` flags on each room data file. Do not change the free gate without re-evaluating conversion impact. The Paywall section of this file is the authoritative source — this Monetization entry must stay consistent with it.

---

## Navigation

**No emojis in nav labels.**
Emojis in nav items are inconsistent (some rooms have them, most don't) and add visual noise to an analytical tool. Icon components (Icon.jsx) are the correct approach for nav decoration. Do not add emojis to nav item labels.

**Consult is not in the nav.**
Consult (ConsultationSpace) was cut from nav in V4.12 — it overlaps with Search and adds nav clutter. It remains accessible via Search Room but is not surfaced in the header.

**Nav label conventions:**
- Room labels: short, noun-form, no emoji (Stats, Metrics, RCA, Cases, Growth, BI)
- Tools group: Search, Trainer, Companies, Defense, Saved
- Learn group: Learn, Playbook
- Track group: Plans, Progress, Profile (signed-in only)
- "Instrumentation" not "Instrum." — never truncate labels with a period

**Sidebar auth pattern (V4.59.0+):**
Not signed in: TRACK shows Sign In + Plans only. No bottom auth chip.
Signed in: TRACK shows Profile (with OAuth avatar thumbnail) + Progress + Plans. Profile is the hub for identity, sync, settings, study plans, saved cases.

---

## SQL Lab Content Standard (V4.59.0+)

**SQL Lab problems must meet the multi-approach standard.**
The new interview premium is thinking in multiple paradigms, not writing SQL. LLMs commoditized SQL writing. Every Medium/Hard/Master problem must support at least 2 distinct valid approaches. Problems with approach count = 1 at Medium tier or above are candidates for replacement.

**Tiered solutions are the content standard going forward.**
Every problem ships with: junior solution (works, suboptimal), senior solution (production-grade, explains why it's better), pro tip (one-line technique or trap callout), common mistake (what people get wrong on this specific problem).

**Audit process: score batch → fix batch → ship batch.**
Batch size = 10. Full rubric in SQL_LAB_PLAN.md Section 8. Audit artifact = SQL_QUALITY_AUDIT.md (cumulative, one row per problem). Batch 1 is calibration (score-per-problem, fix-per-problem). Batches 2–13 score full batch first, then fix.

**Flag thresholds:** Score below 3 on any single rubric dimension, or below 20/35 total → rewrite required.

**Layered Easy standard (from DataLemur benchmark, 2026-06-02).**
The best Easy SQL problems combine 2–3 naturally related concepts rather than testing a single clause in isolation. A problem that only tests one skill (e.g. WHERE filter on one column) is a tutorial, not an interview problem. Rewrites should target richer combinations: WHERE + GROUP BY + HAVING, JOIN + rate calculation, 3-table JOIN + multi-condition filter. This applies to all rewrites in Batches 5–13 and to any new Easy problems written in future.

**Post-audit prompt-clarity pass is scheduled after Batch 13.**
After all 13 batches complete, run a single 30-minute prose pass across all 130 problems to verify each prompt clearly signals the expected output shape. This is a cosmetic improvement, not a re-audit. No rubric changes. No re-scoring.

**S-Grade Upgrade Pass — the definitive quality standard (V4.74.0+).**
The B-grade audit (Batches 1–13) established the floor. The S-grade pass raises the ceiling. Every problem in the final bank must achieve S-grade. Full rubric, execution plan, and batch tracking in SQL_LAB_PLAN.md Section 11 and SQL_UPGRADE_PASS.md.

**The 10-dimension rubric (max 50). Flag: any dimension < 3 or total < 30.**

| Dim | Name | What it scores |
|---|---|---|
| BF | Business Framing | Stakes-first, real business pressure, not a textbook exercise |
| CA | Company Authenticity | Company + datamart + business context aligned |
| DC | Difficulty Calibration | SQL complexity matches tier benchmark |
| DR | Data Challenge Realism | Seed data forces real analytical choices |
| Di | Distinctiveness | No structural clone in bank |
| IQ | Insight Quality | Debrief changes how the reader thinks about analytics |
| TC | Trade-off Clarity | Alternatives documented + when to use each |
| MJ | Measurement Judgment | Problem requires defining the metric before writing SQL. Score 1: fully specified, one correct interpretation. Score 5: intentionally ambiguous prompt, debrief shows 3+ valid interpretations and teaches which a senior analyst would choose and why |
| FV | Forensic Value | A specific wrong query is documented — what it runs to, what it actually measures, and how to detect the error. Score 1: none. Score 5: complete wrong solution with plausible output, systematic detection method, and what process would have caught it in production |
| FA | Falsifiability | A sanity check query is present, and the conditions under which the answer would be wrong are specified. Score 1: none. Score 5: 2+ diagnostic checks, suspicious-output description, and a production monitoring note |

**Grade thresholds:**
- B-grade: total ≥ 20, no dimension < 3. All 130 problems at this level after the audit.
- A-grade: total ≥ 35, MJ+FV+FA combined ≥ 6. Trap enrichment taxonomy applied.
- S-grade: total ≥ 42, MJ+FV+FA combined ≥ 12 (avg 4+ per new dimension). Every problem teaches measurement judgment, has a documented forensic wrong answer, and has a specified falsifiability check.

**The trap enrichment taxonomy (9 categories) remains the reference for FV additions.** See SQL_LAB_PLAN.md Section 10 for all 43 named traps. The six highest-ROI traps to embed live in seed data: NULL in NOT IN, integer division, many-to-many fanout, COALESCE on LEFT JOIN aggregate, RANGE vs ROWS on tied dates, denominator confusion.

**Forensic format is now a standing product decision (V4.77.0+).** Forensic problems live in SQL Lab as `difficulty: 'Forensic'` — a new tier alongside Easy/Medium/Hard/Master. Schema: `format: 'forensic'`, `brokenQuery` (the broken SQL shown upfront), `brokenOutputNote` (what it returns and why it looks plausible). Target ~25 problems total — only problems where the wrong query produces output plausible enough to fool a real analyst. Not a shadow copy of every standard problem. Full spec in SQL_LAB_PLAN.md Section 12.

**Remaining Layer 2 formats (Impossible, Cascade, Code Review) are deferred** — own sprint after forensic ships. Logged in IDEAS.md.

**Standing rule: integer division is always wrong in SQL rate problems.**
Every solution that computes a rate, percentage, or average using division must include CAST(...AS REAL) or multiply by 1.0 to avoid integer truncation. This applies retroactively to all existing solutions. Check during the enrichment pass.

---

## V4.59.0 Standing Rules Audit

All standing rules above remain in effect. V4.59.0 (Profile page, sidebar auth toggle, SQL audit planning) required two rule updates: Track group nav labels updated (Plans replaces Pricing, Profile added), SQL Lab content standard added. All other architectural, design, content, and monetization principles unchanged.
