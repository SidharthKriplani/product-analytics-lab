# SQL_LAB_PLAN.md — SQL Lab Content Overhaul Master Plan

Single source of truth for all SQL Lab decisions, findings, architecture choices, and session sequencing. Created after the Session 1 investigative audit (2026-05-31). Update this file at the end of every SQL Lab session.

**Current version:** V4.49.0 (Sessions 1–6 + Phase 3 complete; V4.48–49 = BI charts + Interview Simulator features, no SQL Lab changes)
**Last updated:** 2026-06-02

---

## Status at a glance

| Item | Status |
|---|---|
| Session 1 investigative findings | ✅ Complete — results in this file |
| NEXT.md updated | ✅ Done |
| DECISIONS.md updated | ✅ Done |
| AUDITS.md updated | ✅ Done |
| CHANGELOG.md updated | ✅ Done |
| Session 1 execution (cull + reclassify + bug fix) | ✅ Done — V4.40.0 |
| Session 2 classification (all 211 prompts) | ✅ Done — results in Section 7 |
| Session 3 rewrites (74 prompts + debriefs) | ✅ Done — V4.41.0 |
| Session 4 (7 new datamarts) | ✅ Done — V4.42.0 |
| Session 5 (130-problem target) | ✅ Done — V4.42.0 |
| Session 6 (UX + hints + phase 2) | ✅ Done — V4.43.0 |
| Phase 3 (company filter + PostHog events + streak) | ✅ Done — V4.46.0 |

---

## Section 1 — Market-Anchored Difficulty Rubric

Derived from systematic benchmarking of LeetCode, DataLemur, and StrataScratch (May 2026). This rubric replaces all prior difficulty classifications in sqlLabProblems.js.

**The critical prior error:** The original 250-problem bank classified single window functions (RANK, NTILE, SUM OVER), anti-joins (NOT IN, LEFT JOIN IS NULL), and multi-join GROUP BY as Hard. The market benchmark contradicts this. LeetCode 183 ("Customers Who Never Order" — NOT IN anti-join) is explicitly Easy. Any window function = Medium by DataLemur/StrataScratch standard.

### Easy
One SQL concept, direct mapping from question to SQL clause. The candidate's only job is knowing the construct.

Patterns:
- SELECT + WHERE (any condition)
- GROUP BY + COUNT/SUM/AVG/MAX (single table or one JOIN)
- HAVING (filter on aggregated result)
- Simple 2-table JOIN (INNER or LEFT)
- IS NULL / IS NOT NULL
- LEFT JOIN + IS NULL anti-join (LeetCode 183 = Easy)
- NOT IN / NOT EXISTS single-table
- CASE WHEN in SELECT (non-aggregated)
- COALESCE, NULLIF
- ORDER BY + LIMIT (top-N)
- DISTINCT
- Arithmetic in SELECT or WHERE (computed column like `SUM(days_supply * (1 + refills))`)
- Date range WHERE filter

### Medium
Requires a window function OR multi-step reasoning where the composition of two concepts is the hard part. The candidate must know *when* to use the technique and *how* to compose it with something else.

Patterns:
- Any basic window function with PARTITION BY: RANK, DENSE_RANK, ROW_NUMBER, LAG, LEAD, SUM OVER, AVG OVER, NTILE
- Simple CTE (1–2 CTEs, straightforward logic)
- 3-table JOIN (all JOINs necessary, non-obvious key)
- Conditional aggregation / pivot (SUM CASE WHEN across multiple categories)
- Date arithmetic composed with aggregation (strftime + GROUP BY month)
- Correlated subqueries (above-average patterns, N-per-group)
- Percentage calculations across groups
- HAVING with non-obvious aggregate filter
- EXISTS / NOT EXISTS subquery

### Hard
Chaining 2+ advanced concepts where the *combination* is the difficulty. Naive approach gives wrong or incomplete answer. Candidate must both know the pattern AND recognize that the naive query fails.

Patterns:
- Gaps-and-islands (ROW_NUMBER subtraction trick for consecutive sequence detection)
- Recursive CTEs (date spine, number series, hierarchy traversal)
- Window function + date arithmetic chained (LAG + julianday to compute day-level deltas)
- Multi-CTE pipelines (3+ CTEs each feeding the next with distinct signal)
- Self-join with rolling date window in ON clause (julianday difference in JOIN condition)
- State machine logic via CASE WHEN + UNION
- Aggregate over aggregate (SUM(COUNT(*)) OVER)
- 4-table JOIN chain with non-obvious business logic at each step
- Complex window frames (ROWS BETWEEN with explicit frame spec as the test, not incidental)
- Full funnel analysis (multiple conversion rate steps in one result set)

### Master
Beyond standard interview complexity. Candidates at this tier must decompose an ambiguous business question, choose the approach, and write a multi-concept solution without scaffolding.

Patterns:
- 4+ CTEs where each feeds the next with distinct signal sources
- Gaps-and-islands + window function + date arithmetic (all three combined)
- Full cohort retention matrix (month 0/1/2/3 in single result set)
- CROSS JOIN for affinity / combinatorics
- Composite scoring across 3+ signals
- Anomaly detection with per-entity statistical baseline
- Recursive hierarchy traversal + aggregation

---

## Section 2 — Session 1 Investigative Findings

All 250 problems read and audited (h01–h50, all 25 Master, e13–e100, m01–m75). No code changes made — findings only.

### 2A — Cull List (39 problems to remove)

Remove these problems. Reason in each case: duplicate SQL skeleton applied to a different datamart column/domain with no added SQL concept.

**Easy — 20 cuts:**

| ID | Reason |
|---|---|
| e27 | Duplicate GROUP BY COUNT pattern — same skeleton as e04/e14 |
| e38 | Duplicate WHERE filter pattern — same as e11 |
| e41 | Duplicate ORDER BY + LIMIT top-N — same skeleton as e05 |
| e63 | Duplicate DISTINCT COUNT — same concept as e22 |
| e75 | Duplicate COALESCE / IS NULL — same as e19 |
| e76 | Duplicate GROUP BY + AVG — same as e09 |
| e79 | Duplicate WHERE date range — same as e17 |
| e86 | Duplicate skeleton — GROUP BY COUNT on different column, no new concept |
| e87 | Duplicate skeleton — GROUP BY COUNT on different column |
| e88 | Duplicate skeleton — GROUP BY COUNT on different column |
| e89 | Duplicate skeleton — GROUP BY COUNT on different column |
| e90 | Duplicate skeleton — GROUP BY COUNT on different column |
| e91 | Duplicate skeleton — GROUP BY COUNT on different column |
| e92 | Duplicate skeleton — GROUP BY COUNT on different column |
| e93 | Duplicate skeleton — GROUP BY COUNT on different column |
| e94 | Duplicate skeleton — GROUP BY COUNT on different column |
| e95 | Duplicate skeleton — GROUP BY COUNT on different column |
| e96 | Duplicate skeleton — GROUP BY COUNT on different column |
| e98 | Duplicate skeleton — same anti-join skeleton as e01/e12 |
| e99 | Duplicate skeleton — same top-N skeleton as e05/e41 |

**Medium — 11 cuts:**

| ID | Reason |
|---|---|
| m27 | Above-average subquery — duplicate of m17/m49 |
| m38 | Easy-level GROUP BY COUNT mislabeled Medium |
| m44 | Monthly time-series — duplicate of m09/m15 |
| m50 | Easy-level GROUP BY COUNT mislabeled Medium |
| m55 | Easy-level GROUP BY COUNT mislabeled Medium |
| m59 | RANK — duplicate of m24 |
| m63 | Easy-level GROUP BY COUNT mislabeled Medium |
| m65 | Easy-level GROUP BY COUNT mislabeled Medium |
| m67 | Easy-level GROUP BY COUNT mislabeled Medium |
| m68 | Easy-level GROUP BY COUNT mislabeled Medium |
| m69 | Anti-join — duplicate skeleton of e01/m12 |

**Hard — 3 cuts:**

| ID | Reason |
|---|---|
| h36 | CASE WHEN 5-column pivot — duplicate of h28 |
| h43 | Single-table GROUP BY COUNT = Easy level, duplicates e32/e60 |
| h46 | Completion rate by visit type — duplicate skeleton of h29 |

**Master — 5 cuts:**

| ID | Reason |
|---|---|
| master15 | strftime + GROUP BY — Medium-level, mislabeled Master |
| master17 | JOIN + GROUP BY + COUNT DISTINCT — Medium-level, mislabeled Master |
| master20 | strftime + GROUP BY aggregate — Medium-level, mislabeled Master |
| master22 | JOIN + GROUP BY — Medium-level, mislabeled Master |
| master24 | JOIN + GROUP BY + COUNT DISTINCT — Medium-level, mislabeled Master |

**Post-cull survivor count:** 211 problems (before reclassification)

---

### 2B — Reclassification Table

All reclassifications anchored to the market rubric in Section 1. Direction: Hard → Easy, Hard → Medium, or Master → Hard.

**Hard → Easy:**

| ID | Title (approx) | Old | New | Reason |
|---|---|---|---|---|
| h16 | Total Medication Coverage Days | Hard | Easy | SUM(arithmetic) GROUP BY single table — confirmed Easy by user + market research |
| h23 | Anti-join (NOT IN pattern) | Hard | Easy | NOT IN anti-join = LeetCode 183 = explicit Easy |

**Hard → Medium (basic window function or single-concept problem):**

| ID | Old | New | Reason |
|---|---|---|---|
| h14 | Hard | Medium | EXISTS × 2 — EXISTS subquery = Medium |
| h19 | Hard | Medium | strftime + HAVING + COUNT DISTINCT — two concepts, no window function |
| h20 | Hard | Medium | NTILE + CTE — one window function = Medium by market standard |
| h22 | Hard | Medium | HAVING SUM = 0 — aggregate filter only |
| h25 | Hard | Medium | SUM OVER PARTITION BY ORDER BY running total — basic window function = Medium |
| h26 | Hard | Medium | JOIN + GROUP BY multi-column — no window, no CTE chain |
| h27 | Hard | Medium | NTILE quartiles — one window function |
| h28 | Hard | Medium | CASE WHEN 5-column pivot — conditional aggregation |
| h29 | Hard | Medium | GROUP BY + rate calculation |
| h30 | Hard | Medium | CASE WHEN GROUP BY classification |
| h35 | Hard | Medium | SUM/COUNT conversion rate |
| h37 | Hard | Medium | JOIN + GROUP BY + SUM |
| h39 | Hard | Medium | GROUP BY + HAVING + COUNT DISTINCT |
| h40 | Hard | Medium | NTILE value bands + CTE — one window function |
| h44 | Hard | Medium | 3-table JOIN + GROUP BY |
| h47 | Hard | Medium | JOIN + GROUP BY + HAVING |
| h49 | Hard | Medium | CTE + MAX + date |
| h50 | Hard | Medium | JOIN + GROUP BY multi-aggregate |

**Master → Hard (medium-complexity multi-step, not Master caliber):**

| ID | Old | New | Reason |
|---|---|---|---|
| master06 | Master | Hard | Content Engagement Funnel: 1 CTE + pivot + rates |
| master07 | Master | Hard | Hypertension Care Gap: 2 CTEs + NOT IN |
| master11 | Master | Hard | Referred User Engagement: 2 CTEs + GROUP BY |
| master13 | Master | Hard | Returning vs New Customer: single CTE + ROW_NUMBER + CASE WHEN |
| master16 | Master | Hard | Creator Portfolio: JOIN + GROUP BY + CASE WHEN pivot |
| master21 | Master | Hard | Referral Performance: self-join + GROUP BY |
| master23 | Master | Hard | Discount Mix by Channel: JOIN + CASE WHEN SUM |

---

### 2C — Known Bug: master10 Solution String

The solution field for master10 has `GROUP BY a.user_id\)` — the `\)` should be `\n)` (line break before closing paren). Fix in Session 1 execution alongside cull and reclassify.

---

### 2D — Gap List (8 missing patterns)

After culling, these SQL patterns have zero or near-zero representation:

| # | Pattern | Target difficulty | Notes |
|---|---|---|---|
| 1 | Date spine / gap-filling | Hard | Recursive CTE or series generator + LEFT JOIN to fill missing dates with zeroes |
| 2 | ROWS BETWEEN frame specification | Hard/Master | ROWS vs RANGE distinction, explicit named frame clause as the *test* |
| 3 | PERCENT_RANK / CUME_DIST | Medium | NTILE exists but percentile rank functions missing |
| 4 | Two valid queries, different results | Medium/Hard | NULL handling or JOIN type produces different counts — candidate explains why |
| 5 | Ambiguous-definition problems | Hard/Master | Metric itself is undefined — candidate must interpret and document assumption |
| 6 | Syntactically valid but semantically wrong SQL | Medium/Hard | Produces a result but the wrong one — no error thrown |
| 7 | Recursive CTE / hierarchy traversal | Hard/Master | Org chart, referral tree, or product category hierarchy |
| 8 | Full cohort retention curve | Master | Month 0/1/2/3+ retention in single result set |

---

## Section 3 — Architecture Decisions

All open items resolved. These are standing decisions.

### Problem count target: 130 (down from 250)

| Tier | Count | Rationale |
|---|---|---|
| Easy | 50 | Sufficient breadth across all Easy patterns without redundancy |
| Medium | 40 | Covers window functions, CTEs, conditional agg, date composition |
| Hard | 25 | Real Hard patterns (gaps-and-islands, recursive, multi-CTE chains) |
| Master | 15 | Not 10 (too thin for a Challenge Vault) / not 18 (overextends authoring scope) |
| **Total** | **130** | |

User proposed 50/40/30/10. Decision: 25H instead of 30H (not enough distinct Hard patterns post-cull), 15 Master instead of 10 (Vault needs depth). Same 130 total.

### Datamart count target: 12 (up from 5)

| Datamart | Status | Notes |
|---|---|---|
| ecomm | ✅ Existing | |
| saas | ✅ Existing | |
| fintech | ✅ Existing | |
| consumer | ✅ Existing | |
| health | ✅ Existing | |
| gaming | ✅ Done — V4.42.0 | DAU/WAU/retention, session length, level completion, in-app purchase |
| logistics | ✅ Done — V4.42.0 | Delivery SLA, driver utilization, route efficiency, damage rate |
| marketplace | ✅ Done — V4.42.0 | GMV, take rate, seller/buyer cohorts, category mix |
| food_delivery | ✅ Done — V4.42.0 | Order funnel, delivery time, cancellation, restaurant churn |
| social_network | ✅ Done — V4.42.0 | Feed engagement, follower graph, content virality, referral tree |
| edtech | ✅ Done — V4.42.0 | Course completion, quiz score, study streak, refund rate |
| hr_analytics | ✅ Done — V4.42.0 | Headcount, attrition, time-to-hire, org hierarchy recursive CTE |

"Wider not longer" — more schemas, not more rows in existing schemas. Schema memorization is the risk when 250 problems share 5 datamarts.

### Master problem schema rule

Master problems get **standalone schemas** — one schema per Master problem, never shared across problems. This preserves the "business question only" framing without candidates memorizing the data layout.

### Sequencing decision

Sessions 2–3 (prompt rewrites / stakeholder-request framing) come BEFORE schema architecture design and new problem authoring. Reason: Sessions 2–3 close 55–65% of the MVP gap because prompt framing is the actual differentiation from StrataScratch. Schema/authoring work builds on the correct framing.

---

## Section 4 — Session Sequence

Six sessions total. Each is a complete unit of work. Order is fixed — dependencies are real.

### Session 1 — Execute Cull + Reclassify + Bug Fix
**Gate:** User approval of these findings
**Scope:**
- Remove 39 problems from sqlLabProblems.js (cull list in Section 2A)
- Apply 27 reclassifications (Section 2B) — change difficulty field only, no other edits
- Fix master10 bug: `GROUP BY a.user_id\)` → `GROUP BY a.user_id\n)`
- Post-execution: run validate-data.js, verify Vite build passes, spot-check 5 problems in browser
- Version bump: V4.40.0

**Output:** Cleaned 211-problem bank with correct difficulty labels. DO NOT rewrite any prompts or debriefs — that is Sessions 2–3.

### Session 2 — Prompt Type Classification
**Gate:** Session 1 complete
**Scope:**
- Read every surviving prompt
- Tag each: `technical-spec` or `stakeholder-request`
- Identify conversion candidates (technical-spec → stakeholder-request) at Medium/Hard/Master
- Target mix: Easy 80/20, Medium 60/40, Hard 50/50, Master 40/60
- Document: conversion list with draft direction notes per problem (NOT full rewrites — that is Session 3)
- No code changes to sqlLabProblems.js in this session

**Output:** Classification table (ID → prompt_type), conversion candidates list with direction notes.

### Session 3 — Stakeholder-Request Rewrites + Debrief Restructure
**Gate:** Session 2 classification done
**Scope:**
- Rewrite prompts for all conversion candidates in natural stakeholder voice
- Rewrite debriefs in order: (1) what stakeholder actually wants, (2) ambiguities resolved, (3) SQL approach, (4) what weak SQL looks like, (5) interviewer follow-up
- Do NOT change expectedColumns, expectedRowCount, checkValues, solution — prompt and debrief fields ONLY
- Estimated 50–80 rewrites; split by datamart if scope is too large for one session
- Single-quote rules apply; no backticks; escape apostrophes as `\'`
- Version bump: V4.41.0

**Output:** Updated sqlLabProblems.js with rewritten prompts and debriefs.

### Session 4 — Schema Architecture Design (7 new datamarts)
**Gate:** Sessions 2–3 done (final problem set locked before schema design)
**Scope:**
- Design spec for 7 new datamarts: gaming, logistics, marketplace, food_delivery, social_network, edtech, hr_analytics
- Per datamart: table names, column names, column types, 20–30 seed rows (as JS arrays of arrays)
- Ensure each datamart enables 8–12 problems covering the right SQL patterns
- Master schemas: design standalone schema per Master problem (15 schemas total)
- No implementation yet — spec only, reviewed before writing code

**Output:** Schema spec document or direct additions to sqlLabDatamarts.js.

### Session 5 — New Problem Authoring (fill gap list + reach 130 target)
**Gate:** Session 4 schemas done and reviewed
**Scope:**
- Write new problems against new datamarts to fill the 8-pattern gap list (Section 2D)
- Reach 130 total (50E/40M/25H/15Master) from current post-cull count
- All new problems: single quotes, no backticks, stakeholder-request framing where appropriate
- Validate: expectedRowCount verified against seed data, checkValues hand-traced
- Version bump: V4.42.0

**Output:** Updated sqlLabProblems.js + sqlLabDatamarts.js at 130-problem target.

### Session 6 — UX Fixes + Hints System + Phase 2 Features ✅ DONE V4.43.0
**Gate:** Session 5 complete; all 130 problems verified correct
**Scope:**

**UX fixes (prerequisite — do first, they share the layout zone):**
- Sort fix: problem list sorted by difficulty tier (Easy → Medium → Hard → Master), then by ID within tier
- Scroll/layout: left panel capped to 100vh; problem description scrolls internally; Run + hints button both visible without scroll
- Company logos: Google favicon API (`https://www.google.com/s2/favicons?domain=&sz=32`) in sidebar list items
- Filter chips: difficulty, company, estimated time (quick ≤15min / medium 15-30min / long 30min+) across top of sidebar

**Hints system (replaces Show Answer button):**
- Step-by-step first-principles hints — NOT CTE-flavored (no technique leakage)
- Hint count by difficulty: Easy = 1, Medium = 1–2, Hard = 3–5, Master = 3–5
- Hint style: structural reasoning questions ("What is one row in your output?" → "Which tables give you that?" → "What filter applies?")
- Show Answer unlocks only after all hints exhausted
- Hint content must be authored per problem — this is a content pass, not just UI
- Study Plan modal: deprioritized (not learning-critical vs hints); move to Tier 2 IDEAS.md

**Phase 2 features:**
- Per-problem timer: starts on first keystroke, records to `pal-sql-lab-times-v1` on correct solve only
- SQL Lab section in Progress.jsx: solved count by difficulty, total time, current streak
- Version bump: V4.43.0

**Note:** Session 6 is large. Split into 6a (UX fixes + layout) and 6b (hints authoring + phase 2) if needed.

**Output:** SqlLabPage.jsx + Progress.jsx updated; hint content added to sqlLabProblems.js.

**Execution notes (V4.43.0):**
- Sidebar.jsx: SQL Lab added to analytics subgroup after Code Lab. getIsActive() extended.
- SqlLabPage.jsx: Clearbit → Google favicon API (both locations). Schema accordion 90px→200px. Master filter chip added. SORTED_PROBLEMS constant enforces difficulty order. "internal preview" badge removed. Hints UI: IIFE inline renders progressive hint button → Show Answer flow. Timer: timerRef+timerStartRef, starts on first keystroke, saves to pal-sql-lab-times-v1 on correct. Progress bar denominator fixed to 130.
- sqlLabProblems.js: add_hints.py ran; 130 problems × 1–5 hints added. Breakdown: 50×1, 40×2, 25×5, 15×5.
- Progress.jsx: sqlLabProblems imported, sqlSolved+sqlTimes from localStorage, SQL Lab SectionCard (total/per-diff/time/nav), SQL Lab in allRoomProgress.

---

## Section 5 — Why This Sequence (rationale)

**Why Sessions 2–3 before Sessions 4–5:**
Prompt framing is where PAL differentiates from StrataScratch. StrataScratch already has correct SQL problems — what it lacks is the stakeholder-translation layer. If Sessions 4–5 author new problems against new datamarts before the prompt style is locked, those new problems will be written in the wrong register and need rewriting again. Lock the framing style first, then author.

**Why Session 1 is pure execution, no rewrites:**
Session 1 is structural cleanup — removing noise (duplicates) and correcting signal (difficulty labels). Mixing in prompt rewrites risks double-touching the same problem twice. Clean the structure first, then improve the content.

**Why 130 and not 250:**
250 problems with 20% being duplicate skeletons teaches the same SQL concept 3x. 130 problems with zero duplicates, correct difficulty labels, and stakeholder-framed prompts teaches 130 distinct judgment calls. Volume is not differentiation. Fidelity is.

**Why 12 datamarts:**
At 250 problems over 5 datamarts = 50 problems per datamart. Candidates will memorize the schema by problem 10. 12 datamarts with 10–12 problems each keeps the schema fresh. Master problems get standalone schemas to preserve "business question only" framing.

---

## Section 7 — Session 2: Prompt Classification + Conversion Candidates

**Finding:** All 211 surviving problems are currently `technical-spec`. Zero are `stakeholder-request`. Session 3 rewrites the conversion candidates below.

**Target mix (from SQL_LAB_PLAN Section 4):**
- Easy: 80% tech-spec / 20% stakeholder-request → 16 conversions from 82
- Medium: 60% / 40% → 33 conversions from 82
- Hard: 50% / 50% → 17 conversions from 34
- Master: 40% / 60% → 8 conversions from 13
- **Total: 74 conversions**

**Debrief restructure rule for stakeholder-request problems:**
Debrief must cover in this order: (1) what the stakeholder actually wants, (2) the ambiguities and how they were resolved, (3) the SQL approach, (4) what the weak SQL looks like, (5) the interviewer follow-up question. If the current debrief only discusses SQL traps and not interpretation, it needs restructuring.

---

### 7A — Easy Conversions (16 of 82)

Keep as technical-spec: all other 66 Easy problems. Easy stakeholder-request = natural business voice, output implied by context, no explicit column list. No technique ambiguity for Easy — the SQL is still deterministic; only the framing becomes more human.

| ID | Title | Conversion direction |
|---|---|---|
| e09 | Provider No-Show Rate | Remove "Return provider name, total_appts, no_shows, and no_show_rate as a percentage rounded to 1 decimal. Return only the top provider." Frame as ops lead asking "who's our worst no-show provider?" |
| e16 | Orders by Status | Remove explicit column spec. Frame as "give me a quick status breakdown of our orders." |
| e19 | Sessions by Device | Remove "Return device and session_count." Frame as "what does our device mix look like across sessions?" |
| e22 | Free Plan Accounts | Remove column list. Frame as "pull a list of our Starter-plan accounts for the upgrade campaign." |
| e32 | Most Prescribed Drugs | Remove "Return drug_name and rx_count (number of prescriptions) for each drug." Frame as "what are we prescribing the most?" |
| e33 | Transactions by Category | Remove column spec. Frame as "break down our transaction volume by merchant category." |
| e34 | Content Interaction Types | Remove column spec. Frame as "what interaction types are most common — I need to calibrate the recommender." |
| e35 | Session Source Mix | Remove column spec. Frame as "which sources are driving the most sessions right now?" |
| e44 | Consumer Users by Country | Remove column spec. Frame as "give me a country breakdown of our user base." |
| e49 | Avg Session Duration by Source | Remove column spec. Frame as "do users from different channels engage differently in a session?" |
| e51 | Distinct Buyers Count | Remove technical framing. Frame as "how many unique users have actually bought something?" |
| e65 | Total MRR from Active Subscriptions | Frame as "what\'s our total MRR right now — need it for the board update." |
| e66 | Patient Gender Distribution | Frame as "I need the gender breakdown of our patient panel for HEDIS." |
| e70 | Accounts by Currency | Frame as "how many accounts do we have per currency?" |
| e78 | Revenue by Acquisition Channel | Frame as "which channel is driving the most revenue?" |
| e81 | Total Disputed Exposure | Frame as "what\'s our total dollar exposure from disputed transactions — compliance is asking." |

---

### 7B — Medium Conversions (33 of 82)

Medium stakeholder-request = remove technique name OR remove over-specified output formula. The business question becomes the framing; the candidate must derive the SQL approach.

| ID | Title | Technique/prescription to remove | Ambiguity to exploit | Debrief must add |
|---|---|---|---|---|
| m04 | H1 vs H2 Order Volume | "in a single row. Output columns: h1_2023, h2_2023" | How to define H1/H2 (by calendar? fiscal?) | Why pivot vs two separate queries |
| m12 | Zero-Activity Accounts | "Using a CTE that collects distinct account_ids from the events table" | What "activity" means | Why CTE chosen over subquery |
| m13 | Latest Transaction Per Account | "Using ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY occurred_at DESC)" | Whether "latest" means occurred_at or created_at | Why ROW_NUMBER over MAX + JOIN |
| m14 | Engagement Quality by Content | "using conditional aggregation" | Whether views/likes/saves are all equal signals | Why CASE WHEN SUM vs separate subqueries |
| m15 | Monthly Event Volume | "formatted as YYYY-MM using strftime" | Whether to include months with zero events | Why strftime vs substring |
| m16 | Running Spend Per User | "running_total — the running sum of subtotal partitioned by user_id and ordered by created_at" | Whether to include all statuses or completed only | Why window vs self-join |
| m20 | Top Products by Volume | "Using a CTE and RANK()" | How to handle ties (RANK vs DENSE_RANK vs ROW_NUMBER) | Trade-offs between rank functions |
| m21 | First Interaction Per User | "Using ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY occurred_at)" | What "first" means if timestamps are equal | Why ROW_NUMBER not MIN + JOIN |
| m22 | MRR by Industry | "Using a CTE that joins active subscriptions to accounts" | Whether to include accounts with no active sub | Why CTE over inline subquery |
| m24 | MRR Rank Within Industry | "the RANK() of mrr within each industry" | Whether to rank by MRR or by revenue contribution | Why RANK vs DENSE_RANK in business context |
| m26 | Session Gap Analysis | "prev_session (the previous session date per user using LAG)" | Whether to include first sessions (NULL gap) | LAG vs self-join cost-benefit |
| m28 | Top Creators by Engagement | "Using two CTEs — one to sum interactions... another to rank" | Whether to count only published content or all | Why two CTEs, not one |
| m29 | Next User Event | "next event" implies LEAD | Whether to include the final event (no next) | LEAD vs self-join |
| m30 | Running Average Order Value | "running average subtotal for that user up to and including that order" | All statuses or completed only | Why window AVG over re-aggregation |
| m31 | Balance Quartile Ranking | "using NTILE" named explicitly | How to handle ties at quartile boundaries | NTILE vs PERCENT_RANK for bucket sizing |
| m35 | Conversion Rate by Device Type | "calculate the total session count and conversion rate (rounded to 1 decimal)" | What "conversion" means (purchase? checkout?) | How rounding affects rate comparison |
| m39 | Account Event Date Range | "displayed alongside every event row" implies window function | Whether inactive accounts should appear | FIRST_VALUE/MIN OVER vs self-join |
| m41 | Transaction Size Buckets | "Classify each transaction as small (under $100), medium ($100 to $999), or large" | Whether thresholds are given or candidate defines | Why CASE WHEN over NTILE for business buckets |
| m42 | Patient Age at Appointment | "using date arithmetic" named | What "age" means (floor years vs decimal) | julianday calculation pitfalls |
| m43 | Interaction Breakdown with Total | "Use UNION ALL to combine" named explicitly | Whether a TOTAL row is needed or just breakdown | UNION ALL vs GROUP BY ROLLUP |
| m46 | Account Activity Tier | "Use a CTE and LEFT JOIN" named explicitly | How to define tier thresholds | LEFT JOIN to include zero-event accounts |
| m47 | Days Since Previous Order | "Use all orders regardless of status" — hidden assumption | Whether returns count as orders | LAG vs self-join, NULL first-row handling |
| m48 | Event Sequence Number per Account | "sequential position within an account\'s event history" | Whether to sequence by account or by user | ROW_NUMBER tie-breaking when timestamps equal |
| m51 | Cumulative Interactions per User | "cumulative interaction count up to and including that row" | Whether to count by date or by row order | SUM OVER ROWS BETWEEN pattern |
| m52 | Dispute Status Dashboard | "Resolved disputes show their outcome; open disputes should display \'open\'" | Whether won/lost/open is the right taxonomy | COALESCE vs CASE WHEN for NULL replacement |
| m57 | Product Sales Rank | "Use DENSE_RANK" named explicitly | How to handle tied products fairly | DENSE_RANK vs RANK vs ROW_NUMBER business difference |
| m64 | Most Recent Transaction per Account | "Using ROW_NUMBER" named | Whether "most recent" is by occurred_at or amount | ROW_NUMBER vs MAX + JOIN |
| m74 | Session Duration in Minutes | "Using the started_at and ended_at timestamps, calculate session duration in minutes rounded to the nearest whole number" | Whether sessions with null ended_at are included | Integer division pitfall |
| h25 | Running Revenue Per User | "running_total (cumulative subtotal for that user through that order)" | All statuses or completed only | Window SUM vs self-join |
| h27 | Account Balance Quartiles | "NTILE(4) ordered by balance descending" named | 1=highest vs 1=lowest is a business decision | NTILE boundary behavior with uneven row counts |
| h28 | Content Engagement Pivot | "in a single pivoted row" | Whether to include content with zero interactions | CASE WHEN SUM pivot vs multiple JOINs |
| h30 | Discount Impact on Order Value | "Classify each order as \'discounted\' (discount > 0) or \'full_price\' (discount = 0)" | Whether partially discounted items are "discounted" | Why classification matters for avg vs median |
| h40 | Completed Order Value Bands | "Use NTILE(3) ordered by subtotal ascending" named | Whether band 1 = cheapest or most expensive | NTILE vs manual CASE WHEN thresholds |

---

### 7C — Hard Conversions (17 of 34)

Hard stakeholder-request = business question only, no technique signal, no prescribed output columns. The candidate must recognize the pattern, choose the approach, and produce the right output.

| ID | Title | Why convert | Key ambiguity to exploit | Debrief must cover |
|---|---|---|---|---|
| h01 | Jan-to-Feb User Retention | Retention metric — naturally ambiguous | What counts as "retained" (any order? completed only?) | Day-based vs month-based retention definition |
| h04 | Q1 2023 Cohort Repeat Purchase Rate | Cohort metric — natural stakeholder ask | Does "repeat" mean 2+ orders or 2+ in Q2+? | Cohort window choice affects result dramatically |
| h05 | Provider Below Practice Average | Comparison analysis — natural | Which specialty to scope to, or all? | Correlated subquery vs window AVG approach |
| h07 | Month-over-Month Order Volume | Trend — natural ask | Whether to include all statuses or completed only | LAG vs lead for MoM delta direction |
| h08 | Top Spender per Country | Localization — natural | Whether "top" means one per country or top N | ROW_NUMBER partition vs MAX + GROUP BY |
| h10 | Top Spending Category per Account | Personalization — natural | Whether "top" by count or by revenue | RANK within partition vs MAX subquery |
| h11 | No-Show Patients Without Follow-Up | Clinical quality — natural | Definition of "follow-up" (any appt vs completed) | NOT EXISTS vs LEFT JOIN IS NULL pattern |
| h12 | Multi-Action Engaged Users | Engagement — natural | Whether 3 action types or 3 interactions | COUNT DISTINCT on action vs interaction |
| h17 | Average Reorder Interval | Retention — natural | Whether to include all orders or completed only | LAG pattern, NULL first-row exclusion |
| h21 | Cross-Category Shoppers | Cross-sell — natural | Whether category count threshold is 3 (given) or candidate decides | HAVING COUNT DISTINCT vs EXISTS subquery |
| h32 | Disputed Transaction Merchant Exposure | Fraud — natural | Whether to include all merchants or flagged only | Multi-table JOIN strategy |
| h33 | Creator Interaction Leaderboard | Monetization — natural | Whether to include creators with zero interactions | LEFT JOIN vs INNER JOIN affects ranking |
| h41 | Monthly Account Growth Trend | Growth — natural | Whether to include months with zero new accounts | Running total window vs cumulative subquery |
| h42 | 30-Day Transaction Velocity | Fraud — natural | What "prior 30 days" means (calendar? rolling?) | Self-join rolling window vs window frame |
| h45 | Premium vs Non-Premium Engagement | A/B-style comparison — natural | Whether to include users with zero interactions | LEFT JOIN for zero-count users |
| master11 | Referred User Engagement vs Organic | Growth A/B — natural | How to classify users without referrer_id | CTE classification then aggregate |
| master21 | Referral Performance by Referrer | Growth — natural | Whether to include referrers with zero premium referrals | CASE WHEN SUM vs conditional COUNT |

---

### 7D — Master Conversions (8 of 13)

Master stakeholder-request = pure business question, zero SQL scaffolding. The prompt is 2–3 sentences max. The candidate must decompose, choose architecture, handle edge cases, and produce the correct multi-step query.

| ID | Title | Frame as | Key ambiguities | Debrief must cover |
|---|---|---|---|---|
| master01 | User Risk Scoring Engine | "Build me a composite risk score for every user so we can prioritize our review queue." | What signals to include, how to weight them, what to do with users with no accounts | CTE architecture, scoring rule documentation |
| master02 | Channel 6-Month Retention | "Which acquisition channel produces customers most likely to actually buy?" | What "buy" means (any order? completed?), what retention window (6 months given?) | Cohort definition, retention window choice |
| master03 | Channel LTV Analysis | "I need a channel-level LTV report for the board." | What LTV means (total revenue? per user?), which order statuses count | Metric definition choices and their downstream effect |
| master04 | Account Health Score | "Customer success needs a health score for every active account — something they can act on." | What makes an account healthy, what weight to assign each signal | Scoring rule derivation, "active account" definition |
| master05 | Transaction Spend Anomaly Detection | "Flag transactions that look unusual compared to that user\'s normal spend." | What "unusual" means (3x? 2 std devs?), whether new users with 1 transaction qualify | Threshold choice rationale, per-user baseline |
| master08 | Product Co-Purchase Affinity | "Which products tend to get bought together? I want to power a recommendation widget." | Whether to include all order statuses, minimum co-purchase count, pair deduplication | CROSS JOIN pattern, pair deduplication with a.id < b.id |
| master09 | Plan Upgrade/Downgrade Classification | "Finance wants every subscription plan change classified — upgrade, downgrade, or lateral." | Whether lateral moves (same MRR) should be a category, first subscriptions | LAG for prior plan, CASE WHEN MRR delta |
| master25 | User Transaction Risk Profile | "Build me a risk profile for every user who has transacted — something the review team can triage from." | Which signals to include, what counts as "high" flagged exposure | Multi-signal CTE architecture, NULL handling for new users |

---

### 7E — Problems staying technical-spec

All 211 problems are currently technical-spec. The 137 not in the conversion lists above stay as-is. These include:
- All Easy problems not listed in 7A (the 66 keeping technical-spec framing)
- All Medium problems not listed in 7B (the 49 keeping technical-spec framing)
- All Hard problems not listed in 7C: h02, h03, h06, h09, h13, h15, h18, h24, h31, h34, h38, h48, master06, master07, master13, master16, master23
- All Master problems not listed in 7D: master10, master12, master14, master18, master19

**Why keep these as technical-spec:** Either they teach a concept most clearly with precise framing (gap-and-island, recursive CTE, cohort join pattern), or the business question is specific enough that there is genuinely little ambiguity to exploit.

---

## Section 8 — SQL Quality Audit Plan (2026-06-02)

### Motivation

LLMs have commoditized SQL writing. The new interview premium is thinking in multiple paradigms simultaneously — knowing when to use a window function vs. a CTE vs. a subquery, and being able to articulate trade-offs. PAL's SQL Lab needs to teach that, not just test syntax recall. This audit upgrades all 130 problems to that standard.

---

### Evaluation Rubric

Every problem is scored on 7 dimensions (1–5 each, max 35) plus 4 metadata fields.

**Scored dimensions:**

| # | Dimension | What it measures |
|---|---|---|
| 1 | Business framing | Reads like a real stakeholder ask, not a textbook prompt |
| 2 | Company authenticity | Data model, metric, and context fit the tagged company |
| 3 | Difficulty calibration | SQL complexity matches the Easy/Medium/Hard/Master tag |
| 4 | Data challenge realism | Involves a realistic trap (NULLs, duplicates, date arithmetic, aggregation pitfalls) |
| 5 | Distinctiveness | Meaningfully different from other problems at the same difficulty tier |
| 6 | Insight quality | The correct query reveals a specific non-obvious business insight |
| 7 | Trade-off clarity | Solution content explains when to use this approach and why vs. alternatives |

**Flag thresholds:** Score below 3 on any single dimension, or below 20 total → rewrite required.

**Metadata fields (documented, not scored):**

| Field | What to record |
|---|---|
| SQL technique(s) | Named SQL constructs taught (ROW_NUMBER, DATE_TRUNC, LAG/LEAD, COALESCE, etc.) |
| Analyst pattern | Business pattern it represents (funnel drop-off, cohort retention, sessionization, top-N, attribution, etc.) |
| Approach count | How many distinct valid approaches exist (1 / 2 / 3+) |
| Approaches list | Brief name of each approach (e.g., subquery / window function / CTE) |

**Approach count flag:** Problems with approach count = 1 at Medium/Hard/Master tier are candidates for replacement. Thin problems with only one valid path don't build the multi-paradigm thinking that is the current interview premium.

---

### Multi-Approach Standard

For every problem that supports 2+ approaches, the solution section should include:
- **Approach A / B / C** — technique name, solution sketch
- **When to reach for it** — one sentence on the real-world context where this approach wins
- **Trade-off** — one line (readability, performance, portability)

In the product, after submitting a solution: "You found 1 of 3 approaches. Can you find the others?" — with a retry textarea before the full approach map is revealed. This is the feature that separates PAL from every other SQL platform.

---

### Tiered Solutions Standard

Every problem should have:
- **Junior solution** — correct but suboptimal (subquery instead of window function, multiple passes instead of one)
- **Senior solution** — clean, production-grade, explains *why* it's better
- **Pro tip** — one-line callout of the technique or trap ("COUNT(col) excludes NULLs; COUNT(*) does not")
- **Common mistake** — what gets people wrong on this specific problem

---

### Audit Process

**Batch size: 10.** sqlLabProblems.js is 2,800 lines; 10 problems = ~200–300 lines, stays within context. 13 batches total.

**Order:**
- **Batch 1 (calibration):** Score each problem individually, fix it, move to the next. Purpose: calibrate the rubric itself. If the rubric has a gap, catch it on problem 3, not after scoring all 130.
- **Batches 2–13:** Score the full batch of 10 first, then fix all flagged problems, then build+verify, then ship. Seeing all 10 before deciding what needs a full rewrite vs. minor tweak allows prioritization within the batch.

**Per-batch output:**
1. Scoring table (all 10 problems × 7 dimensions + metadata)
2. Rewrite list (problems below threshold, with specific dimension flagged)
3. Build + verify (0 errors)
4. Commit + push

**Audit artifact:** `SQL_QUALITY_AUDIT.md` — one row per problem, cumulative across all 13 batches. Single source of truth for problem health. Updated after every batch.

---

### Batch Map

| Batch | Problems | Difficulty | Status | Flagged | Rewritten |
|---|---|---|---|---|---|
| 1 | e01–e10 | Easy | ✅ V4.60.0 | e07, e10 | e07 (HAVING), e10 (COUNT DISTINCT) |
| 2 | e11–e20 | Easy | ✅ V4.61.0 | e20,e23,e26,e29,e32,e34 + h16 ID bug | HAVING, AVG, BETWEEN, multi-col GROUP BY |
| 3 | e35–e51 | Easy | ✅ V4.62.0 | e35,e40,e42,e44 + e47,e49 TC | SUM(computed), SUM+JOIN, 3-table JOIN, rate calc |
| 4 | e52–e65 | Easy | ✅ V4.63.0 | e55,e57,e58,e59,e60 + e52 checkValues,e56 TC | COALESCE, IN literal, dual aggregate |
| 5 | e67–e86 | Easy | ✅ V4.64.0 | e69,e70,e74 + e78,e81 TC + e86 reclassified + e77 company | arithmetic in SELECT, triple aggregate, FX dual aggregate |
| 6 | m01–m20 | Medium | ✅ V4.65.0 | m07,m09,m14 + m13 checkValues | JULIANDAY date arith, MoM LAG, DENSE_RANK PARTITION BY |
| 7 | m21–m33 | Medium | ✅ V4.66.0 | m21,m28,m30 + m24,m26,m29 checkValues + m24 company + m32,m33 debriefs | NTILE, global AVG OVER, SUM(SUM) OVER pct-of-total |
| 8 | m36–m61 | Medium | ✅ V4.67.0 | m36 bug+m37+m47+m56 rewrites, m57 upgrade, m42 checkValues, m61 debrief | ROWS BETWEEN bounded window, relational division, dual DENSE_RANK |
| 9 | h14,h22,h25,h27,h28,h39,h49,m76,m77,m78 | Medium | ✅ V4.68.0 | h14,h22,h25,h27 rewrites | Funnel temporal ordering, completion rate, MoM revenue LAG, activity bucketing |
| 10 | h01–h17 | Hard | ✅ V4.69.0 | h07,h10,h13 rewrites + h17 checkValues | New vs returning split, 4-table JOIN P2P trap, PERCENT_RANK LTV |
| 11 | h11–h25 | Hard | Pending | — | — |
| 12 | master01–master08 | Master | Pending | — | — |
| 13 | master09–master15 | Master | Pending | — | — |

---

## Section 9 — Competitive Benchmark (2026-06-02)

### What the top platforms look like at Easy

Researched DataLemur, StrataScratch, and LeetCode Easy SQL problems during the audit to establish an external quality bar.

**DataLemur** — highest quality of the three. Company-tagged, in-browser editor, hints + solutions. Best problems show a sample input table and expected output before writing. Good business framing on strong examples. Weakness: most are still textbook in structure (generic salary/department/employee tables with company names bolted on). Data traps minimal. Debriefs thin — one paragraph, "here's the query, here's why."

**StrataScratch** — mixed. Some genuine company-specific framing. Many reduce to "write a query to find X" with no narrative or trap.

**LeetCode** — most textbook. Correct SQL concepts, zero business context, no data challenges, no debriefs.

### Where PAL already leads

1. **Business narrative** — "The growth team wants to understand which acquisition sources retain users longest" vs. "write a query to calculate average session duration by source." Not close.
2. **Data traps** — No platform embeds traps in seed data the way PAL does (`ended_at IS NULL` vs `status='active'`, `COUNT(*)` vs `COUNT(DISTINCT)`, `NOT IN` NULL footgun). PAL's differentiator at Easy level.
3. **Debriefs** — DataLemur: one paragraph. PAL: business implication, weak answer, interviewer follow-up, alternative approaches.
4. **Company authenticity** — DataLemur labels generic tables with company names. PAL ties the data model to what the company actually does.

### Two benchmark insights applied to this audit

**1. Layered Easy problems** — The best DataLemur Easy problems combine 2–3 naturally related concepts (date filter + HAVING + multiple aggregates in one problem). PAL's rewrites in Batches 1–4 already moved in this direction (e58: WHERE + GROUP BY + HAVING + JOIN; e60: SUM + COUNT dual aggregate). This is the right bar — richer single problems over thin single-skill ones. Continue applying in Batches 5–13.

**2. Concrete expected output in prompt** — DataLemur shows a sample input and expected output before you start. PAL addresses this via expectedColumns, expectedRowCount, and checkValues — but the prompt text itself could be more explicit about what the output looks like. This does NOT require a re-audit of Batches 1–4. Schedule a standalone prompt-clarity pass after all 13 batches are complete.

### Rubric verdict

Benchmark confirmed the 7-dimension rubric is correctly calibrated. No new dimensions added. Adding dimensions mid-audit creates inconsistent scoring. The two benchmark insights are being applied naturally through existing DR, Di, and IQ scoring. Rubric stays as-is through Batch 13.

### Post-audit prompt-clarity pass (schedule after Batch 13)

A single 30-minute sweep across all 130 problems after the full audit is done. For each problem, verify the prompt text clearly signals the expected output shape (what columns, approximate count, what the key insight is). Not a re-audit — just a prose polish pass. Logged in IDEAS.md.

---

## Section 6 — What Doesn't Change (standing rules from DECISIONS.md)

- File split: sqlLabDatamarts.js (schemas + seed) + sqlLabProblems.js (problems only) — never merge
- DB init: prepared statements only (`db.prepare(...).run(row)`) — never raw SQL INSERT strings
- Master problems: never in study plan queues — Challenge Vault only
- SQL Lab token limit: never write more than ~400 lines per tool call
- All strings single-quoted; apostrophes escaped as `\'`; no template literals in data files
- `isUnlocked()` stays true (beta) — do not change

---

## Section 10 — Trap Enrichment Pass (after Batch 13 audit)

**What this is:** A second, targeted pass over all 130 problems after the quality floor audit (Batches 1–13) is complete. The audit fixes structural problems — clones, mislabels, thin debriefs, empty checkValues. The enrichment pass raises the ceiling: it embeds data traps that break naive SQL, adds business logic ambiguity that reveals judgment gaps, and introduces the kinds of "wrong but plausible" failure modes that separate interview pass from fail.

**Why it matters:** The audit gets every problem to a B-grade floor. The enrichment pass gets the best Medium/Hard/Master problems to A+. No competitor does this. DataLemur has thin debriefs. LeetCode has no business context. StrataScratch has no data traps. This pass is PAL's differentiator — problems where the naive solution compiles, runs, and returns *something*, but returns the *wrong* thing.

**Gate:** Do not start until all 13 audit batches are complete. Enrichment while the audit is in flight adds scope creep and burns context. Finish the floor, then raise the ceiling.

**Execution format:** Scan each problem against the trap checklist below. For each problem, classify: (A) trap already embedded, (B) trap addable via debrief-only, (C) trap requires seed data change + prompt change. Prioritize C-level changes for the 30 highest-impact problems (Medium + Hard). Easy problems get B-level enrichment only (debrief callouts, no seed changes).

---

### Trap Taxonomy — Complete Reference

#### Category 1: NULL Traps

The single most common source of silent wrong answers in real SQL.

**1.1 NOT IN with NULL in subquery.**
`WHERE id NOT IN (SELECT user_id FROM t WHERE col IS NULL)` returns zero rows — SQL logic: `x NOT IN (NULL, 1, 2)` evaluates as `x <> NULL AND x <> 1 AND x <> 2`, and `x <> NULL` is always UNKNOWN (not TRUE), so the whole expression is UNKNOWN. Classic interview trap. Highest priority. Every NOT IN problem should document this in the debrief and the seed data should contain at least one NULL value in the subquery column to make the failure live.

**1.2 COUNT(*) vs COUNT(col) on nullable columns.**
`COUNT(*)` counts all rows. `COUNT(col_name)` counts non-NULL values. If the column has NULLs, the two return different numbers. Problems involving COUNT should embed NULLable columns in the seed data and ask a question where the distinction matters (e.g. "count how many users have a referral code" — COUNT(*) overcounts if referral_code can be NULL).

**1.3 AVG ignoring NULLs.**
`AVG(amount)` ignores NULL rows in the denominator. `SUM(amount) / COUNT(*)` does not. If 3 of 10 rows have NULL amounts, `AVG(amount)` divides by 7, not 10. Problems where users compute averages should note this discrepancy and the seed data should contain NULLs in the averaged column.

**1.4 SUM(NULL) = NULL, not 0.**
`SUM()` on a column where all values are NULL returns NULL, not 0. Left JOIN + SUM is the common trigger: joining to a table with no matching rows makes the aggregated column NULL in the result. Requires `COALESCE(SUM(col), 0)` to return 0. Seed data should include accounts with zero orders/transactions/interactions so that `SUM(amount)` returns NULL without COALESCE.

**1.5 NULL in arithmetic.**
`5 + NULL = NULL`. Any arithmetic expression containing a NULL produces NULL. Problems with computed columns (subtotal - discount, or amount * rate) should contain at least one row where a component is NULL, so the naive formula returns NULL where 0 or the original value is correct.

**1.6 IS NULL vs = NULL.**
`WHERE col = NULL` always returns no rows. `WHERE col IS NULL` works. Every problem that filters on NULL should document this in the debrief; problems at Medium tier should embed the trap in the hint ("Note: `= NULL` does not work in SQL — use `IS NULL`").

**1.7 NULL in ORDER BY.**
NULLs sort last in ascending (SQLite/PostgreSQL) but behavior varies. Problems with ORDER BY on NULLable columns should document the dialect-specific behavior.

**1.8 LEFT JOIN + IS NULL anti-join NULL propagation.**
The anti-join `LEFT JOIN t ON ... WHERE t.id IS NULL` breaks if t.id is NULLable in the original data (non-join NULLs contaminate the filter). Seed data should have no NULLable join keys to keep anti-join problems clean, OR one problem should deliberately use a NULLable join key to teach the NOT EXISTS alternative.

---

#### Category 2: JOIN Fanout Traps

Silent row multiplication is the #2 source of wrong answers.

**2.1 Many-to-many JOIN inflation.**
Joining two tables where both sides have multiple matching rows multiplies the result. Example: user has 3 orders, each order has 2 items → user appears 6 times in a JOIN. If you then SUM(order.subtotal), you get 3× the real total. Every problem that joins orders to order_items to users and aggregates should note the fanout risk and use the correct aggregation scope (SUM on order_items, not on orders).

**2.2 LEFT JOIN + aggregate inflating zeroes.**
`LEFT JOIN` + `SUM(right_col)` returns NULL when there is no match (not 0). `COALESCE(SUM(col), 0)` is needed. Similarly, `COUNT(*)` on a LEFT JOIN counts the left-side rows even when there is no match (the right side is NULL) — which may be wrong if you want "count of actual matches." Seed data with users who have no orders exposes this immediately.

**2.3 Duplicate rows from non-unique JOINs.**
Joining on a column that is not a primary key can produce duplicate rows when multiple right-side rows match. Example: joining subscriptions to accounts on account_id when an account has 2 subscriptions — each account row appears twice. Every problem involving subscriptions or multi-valued relationships should note this and use the correct deduplication (DISTINCT, GROUP BY, or ROW_NUMBER WHERE rn=1).

**2.4 Self-join correctness.**
Self-joins on the same table require alias clarity and correct join condition. A common mistake: `JOIN t t2 ON t1.id = t2.id` joins each row to itself, giving 0 useful signal. The join condition must reference the relationship, not equality.

**2.5 Cross-join from missing JOIN condition.**
Forgetting `ON` in a JOIN (or writing `JOIN t WHERE` instead of `JOIN t ON`) in some dialects produces a cross-product. Should be documented in the 4-table JOIN problems (m33 already touches this).

---

#### Category 3: Aggregation Traps

**3.1 Integer division.**
In SQLite (and many SQL dialects): `5 / 2 = 2`, not `2.5`. Any rate or percentage calculation using integer columns needs `CAST(col AS REAL)` or multiplication by `1.0` before division. Every rate problem should document this. Seed data should contain values where integer division gives a different (wrong) result (e.g. 3/5 = 0, not 0.6).

**3.2 ROUND() precision issues.**
`ROUND(2.675, 2)` may return `2.67` in some implementations due to floating-point representation. Problems requiring financial precision should note this and recommend formatting at the application layer.

**3.3 GROUP BY with non-aggregated columns (SQL strict mode).**
Standard SQL requires every non-aggregated SELECT column to appear in GROUP BY. SQLite is lenient (picks an arbitrary value for the non-grouped column). Postgres is strict. Problems selecting `company_name` alongside `SUM(mrr)` without grouping by `company_name` should explicitly require both in the GROUP BY and explain why.

**3.4 HAVING on non-aggregated columns.**
`HAVING col = 'value'` is valid SQL but semantically the same as `WHERE col = 'value'` in most cases — just less efficient. The real distinction: HAVING is for conditions on aggregated results; WHERE is for pre-aggregation filtering. Using HAVING where WHERE is correct is a style red flag that interviewers notice.

**3.5 Aggregate order of operations.**
`WHERE` filters rows before aggregation. `HAVING` filters after. Putting a non-aggregated filter in HAVING instead of WHERE scans more rows than necessary. Medium/Hard problems should include one problem where swapping WHERE and HAVING gives different results (not just inefficiency) — e.g. filtering on a joined column that has NULLs post-aggregation.

**3.6 Distinct count vs count.**
`COUNT(DISTINCT user_id)` vs `COUNT(user_id)` vs `COUNT(*)` — three different numbers on a table with repeated user_ids and NULLs. Problems that ask for "unique buyers" or "distinct users" should embed duplicate user rows (multiple orders from the same user) to make COUNT(*) wrong and COUNT(DISTINCT) correct.

**3.7 SUM(CASE WHEN) vs COUNT(CASE WHEN).**
`SUM(CASE WHEN is_premium = 1 THEN 1 ELSE 0 END)` is correct for counting matching rows. `COUNT(CASE WHEN is_premium = 1 THEN 1 END)` also works — COUNT ignores NULLs, and CASE WHEN with no ELSE returns NULL for non-matching rows. Both approaches give the same result here, but understanding why is Medium-level knowledge. At least one problem should show both patterns in the debrief.

---

#### Category 4: Window Function Traps

**4.1 RANGE vs ROWS frame on tied values.**
Default window frame is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. On tied ORDER BY values, RANGE includes all tied rows in the current frame, which can produce unexpected running totals. `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` processes row-by-row regardless of ties. Every running total/average problem must specify `ROWS BETWEEN` and explain why. At least 2 seed datasets should contain tied dates to make this failure live.

**4.2 NULL handling in LAG/LEAD.**
`LAG(col)` returns NULL for the first row (no prior row). `LAG(col, 1, default_value)` accepts a third argument to substitute a default. Problems using LAG for gap analysis should document the default parameter and when to use it vs COALESCE.

**4.3 RANK gaps vs DENSE_RANK no gaps.**
`RANK()` skips ranks after ties (1, 1, 3). `DENSE_RANK()` does not (1, 1, 2). `ROW_NUMBER()` assigns unique ranks arbitrarily on ties. Every ranking problem must state which behavior is required by the business question and explain the difference. The phrase "handle ties fairly" always means RANK or DENSE_RANK, never ROW_NUMBER.

**4.4 Window function in WHERE clause.**
You cannot use a window function alias in a WHERE clause directly — it must be wrapped in a subquery or CTE. `SELECT *, RANK() OVER ... AS rnk FROM t WHERE rnk <= 3` fails. Must be: `WITH cte AS (SELECT *, RANK() OVER ...) SELECT * FROM cte WHERE rnk <= 3`. This is the most common window function syntax error in interviews.

**4.5 ORDER BY without PARTITION BY.**
`RANK() OVER (ORDER BY col)` ranks globally. `RANK() OVER (PARTITION BY group ORDER BY col)` ranks within groups. Confusing the two gives silently wrong results (global rank vs per-group rank). Every PARTITION BY problem should document what happens if PARTITION BY is omitted.

**4.6 FIRST_VALUE frame spec.**
`FIRST_VALUE(col) OVER (PARTITION BY ... ORDER BY ...)` uses the default frame (`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`), which returns the correct first value only if the frame includes the first row. If the frame is restricted (e.g. a rolling window), FIRST_VALUE returns the first row *within the frame*, not of the partition. Should be documented in FIRST_VALUE problems.

---

#### Category 5: Date and Time Traps

**5.1 String comparison vs date comparison.**
ISO date strings (`YYYY-MM-DD`) compare correctly lexicographically for date ordering — `'2024-01-15' > '2023-12-31'` is TRUE. But mixing formats (e.g. `MM/DD/YYYY`) breaks this. All seed data uses ISO format, so this trap is more of a "real world" note. At least one problem should mention the format dependency in the debrief.

**5.2 BETWEEN is inclusive on both ends.**
`BETWEEN '2023-01-01' AND '2023-06-30'` includes June 30 at midnight — which is the start of the day, not the end. For datetime columns, `< '2023-07-01'` is safer than `<= '2023-06-30'`. Problems using BETWEEN on date ranges should note this in the debrief, especially for problems involving H1/H2 splits.

**5.3 strftime vs DATE_TRUNC dialect mismatch.**
SQLite uses `strftime('%Y-%m', col)` for month truncation. PostgreSQL uses `DATE_TRUNC('month', col)`. BigQuery uses `DATE_TRUNC(col, MONTH)`. The argument order even differs between dialects. Every time-series problem must include a sqliteNote documenting the dialect-specific function and its Postgres/BigQuery equivalents.

**5.4 JULIANDAY precision.**
`JULIANDAY(datetime)` returns a float. Subtracting two JULIANDAYs gives fractional days if one or both have time components (`HH:MM`). `CAST(... AS INTEGER)` truncates (not rounds). Problems using JULIANDAY should specify whether truncation or rounding is correct for the business question (days since last login: truncate. Age in years: floor).

**5.5 Month-end vs month-start for period splits.**
"H1 of 2023" — does it include June 30 or not? "This month" — does it mean the calendar month or a rolling 30 days? Business questions involving time periods are almost always ambiguous. Problems should state the resolved ambiguity explicitly in the prompt, not leave it to interpretation.

**5.6 Timezone complications.**
All seed data is stored as naive dates (no timezone). In production, `occurred_at` in UTC converts to a different day in PST, making day-level aggregations wrong without CONVERT_TZ or AT TIME ZONE. At least one Hard problem should note this in the debrief as a production-vs-interview distinction.

---

#### Category 6: Subquery and CTE Traps

**6.1 Correlated subquery O(n) per row.**
A correlated subquery re-executes for every row in the outer query. For a 1M-row table, this is 1M subquery executions. The window function or JOIN alternative runs once. Every correlated subquery problem (m17 style) must document this performance trap and the window function rewrite.

**6.2 CTE materialization vs inlining.**
In SQLite, CTEs are always materialized (computed once, stored). In PostgreSQL, CTEs are materialized by default but can be inlined with `NOT MATERIALIZED`. In some cases, a CTE is computed even if the final query never references all its rows — wasting work. This is advanced knowledge worth a debrief note on any multi-CTE Hard/Master problem.

**6.3 Non-deterministic results without ORDER BY.**
`SELECT ... LIMIT 1` without ORDER BY returns an arbitrary row — not the first, not the largest, just whichever the engine picks. Every top-N or first-N problem must have an ORDER BY that produces a deterministic result and explain what happens without it.

**6.4 Recursive CTE termination.**
Recursive CTEs without a correct termination condition loop indefinitely. The UNION ALL base case must produce at least one row; the recursive case must eventually produce zero rows. This is Hard/Master territory but should be explicitly documented in every recursive CTE problem.

**6.5 WITH clause scope.**
A CTE defined in a WITH clause is only visible to the query that follows it — it cannot be referenced by a later WITH clause in a different statement. Multiple CTEs in the same WITH block can reference earlier ones: `WITH a AS (...), b AS (SELECT * FROM a WHERE ...)`.

---

#### Category 7: Business Logic Traps

These require judgment, not just SQL syntax knowledge. They are the highest-value traps for interview differentiation.

**7.1 Denominator confusion.**
"What percentage of users are premium?" — percentage of WHAT? Total users including churned? Total active users? Total users who have ever logged in? The denominator changes the number, and the wrong denominator produces a plausible-looking but wrong metric. Every rate/percentage problem must state the denominator explicitly in the prompt and explain why alternative denominators are wrong in the debrief.

**7.2 Cohort vs calendar measurement.**
"How many users retained after 30 days?" — 30 days from signup date (cohort) or 30 days from January 1 (calendar)? Cohort analysis is almost always correct for retention; calendar analysis is correct for revenue. Confusing the two is a fundamental product analytics error. At least 2 Medium/Hard problems should require cohort-based measurement and explicitly contrast it with the calendar alternative.

**7.3 First-touch vs last-touch attribution.**
Which marketing channel gets credit for a conversion — the first session source or the most recent? Both are wrong in isolation; multi-touch is correct in production. Problems involving channel attribution (e.g. e78 Revenue by Acquisition Channel) should discuss this in the debrief: the JOIN approach attributes all revenue to a single channel per user, which ignores multi-channel paths.

**7.4 Current state vs historical state.**
The subscriptions table contains both active and churned rows. "What is each account's current MRR?" requires filtering `WHERE status = 'active'`. "What was each account's MRR in Q3 2023?" requires filtering on date ranges and status at that point in time. Using the full subscriptions table without status filtering produces double-counting. Every subscriptions problem should state which state interpretation is required.

**7.5 Gross vs net metrics.**
Revenue can mean: total order subtotal (gross), subtotal minus discounts (net), subtotal minus discounts minus returns (net realized). Each is a different number. Problems using SUM(subtotal) should state whether gross or net is intended and note that cancelled/returned orders inflate gross figures. This is a standing issue across all ecomm revenue problems.

**7.6 Status at point-in-time vs current status.**
Is a user "active" if they logged in at any point, or only if they are currently active? Is an account "churned" if it ever had a churned subscription, or only if its most recent subscription is churned? Point-in-time vs current-state queries require different SQL (date range filters vs status = 'active' on max subscription).

**7.7 Event deduplication.**
If a user fires the same event multiple times in a session (e.g. multiple `content_view` events on the same content), should they be counted once or multiple times for "users who viewed content X"? COUNT(DISTINCT user_id) vs COUNT(user_id) gives different answers. Problems involving engagement metrics should specify the deduplication rule.

**7.8 Zero vs NULL as a business signal.**
A user with 0 interactions is meaningfully different from a user who doesn't exist in the interactions table. A product with 0 sales is different from a product with no entry in order_items. Problems should distinguish between these cases and use LEFT JOIN + COALESCE(COUNT, 0) when zero is a meaningful business result, not just omit users/products with no activity.

**7.9 Population base for percentages.**
"Premium rate by device OS" — is the base all users, or all users on that device, or all users who have made at least one interaction? The correct base depends on the business question. Problems computing rates should state the population base explicitly and document the implication of using the wrong base.

---

#### Category 8: Type and Casting Traps

**8.1 Integer division producing 0.**
Most critical and most common. `3 / 5 = 0` in SQLite and most SQL dialects. Use `3.0 / 5` or `CAST(3 AS REAL) / 5` or `100.0 * 3 / 5`. Every division in a problem solution should use one of these patterns and the debrief should explain why.

**8.2 String-numeric comparison.**
`'10' > '9'` is FALSE lexicographically (string comparison: '1' < '9'). If a numeric ID is stored as TEXT, comparisons and sorts may produce wrong results. All seed data in PAL uses correct types (INTEGER for IDs, REAL for amounts), so this is a debrief note rather than a live data trap.

**8.3 CAST truncates, not rounds.**
`CAST(2.9 AS INTEGER) = 2`, not 3. For rounding, use `ROUND()`. Problems using CAST for day calculations (JULIANDAY subtraction) should note that CAST truncates toward zero.

**8.4 Implicit type coercion in JOIN.**
Joining a TEXT column to an INTEGER column may work in SQLite (type affinity rules) but produces wrong results or errors in PostgreSQL. Production note: join keys must be the same type. Debrief callout only — no seed data change needed.

---

#### Category 9: Data Distribution Traps

**9.1 Averages on skewed distributions.**
When data is highly skewed (e.g. one user has 1000 orders, everyone else has 1), the average is not a useful measure of typical behavior. Problems computing AVG should note when median (PERCENTILE_CONT or approximation) is more appropriate and what the skew looks like in the seed data.

**9.2 Single-entry groups making aggregations meaningless.**
"Rank accounts within their industry" when 8 of 12 industries have only one account — those accounts are automatically rank 1, which reveals nothing. Problems should call out which groups have only one member and what that means for interpretation.

**9.3 Sparse data extrapolation.**
15 months of order data, most months having 1–2 orders, is too sparse for staffing projections. Problems involving time-series data should note the sample size limitation in the debrief and what data volume is needed before trend analysis is reliable.

**9.4 Small-number instability.**
A 100% conversion rate from a source with 3 sessions is not a meaningful conversion rate. Problems computing rates on small-n subgroups should note minimum sample size requirements and how to filter for statistical stability (HAVING COUNT(*) >= threshold before computing rates).

---

### Enrichment Priority Matrix

Run this scoring on every problem after the audit. Problems scoring 3+ on impact AND 1-2 on effort get enriched first.

**Impact (1–3):**
- 1 = cosmetic (debrief note only, no behavior change)
- 2 = meaningful (changes what a wrong answer looks like)
- 3 = live trap (naive SQL gives wrong output, not just inefficient output)

**Effort (1–3):**
- 1 = debrief-only (no code change)
- 2 = seed data change in sqlLabDatamarts.js (add NULL row, add duplicate row)
- 3 = seed data change + prompt change + solution change + checkValues update

**Priority targets:** Easy problems → effort 1 only (debrief callouts). Medium → effort 1–2. Hard/Master → effort 1–3, full live traps where possible.

**Highest-ROI traps to embed first (effort 2, impact 3):**
1. NULL in NOT IN subquery — embed one NULL value in the subquery column of every NOT IN problem
2. Integer division — add CAST to every division in Easy solutions that doesn't have it
3. Many-to-many fanout — one Hard problem should require grouping before joining to avoid inflation
4. COALESCE on LEFT JOIN aggregate — one Medium problem should have users with zero activity to make SUM return NULL
5. RANGE vs ROWS on tied dates — add two same-date orders to ecomm seed for the running total problem

---

### Problems Flagged for Enrichment (populate after Batch 13)

This table will be filled after the audit is complete. Format: problem ID, current weakest trap category, recommended enrichment, effort level.

| ID | Weakest gap | Recommended trap | Effort |
|---|---|---|---|
| (populate after Batch 13) | | | |

---

### Execution Plan for Enrichment Pass

**Session 1:** Easy problems (50) — debrief-only pass. Add NULL trap callouts, integer division warnings, denominator clarity. No seed data changes. Estimated: 1 session, 50 problems × 2-min review.

**Session 2:** Medium problems (40) — effort 1–2. Add debrief callouts + targeted seed data changes (add NULL rows, duplicate rows, tied timestamps) for 10 highest-priority problems. Estimated: 1–2 sessions.

**Session 3:** Hard problems (25) — effort 1–3. Full live trap embedding where possible. Window frame traps, fanout traps, business logic traps. Estimated: 2 sessions.

**Session 4:** Master problems (15) — effort 1–2. Debrief enrichment + one or two live traps. These are already complex; traps should compound the complexity, not replace it.

**Total estimated:** 5–6 sessions after Batch 13 completes.
