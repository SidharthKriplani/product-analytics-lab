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
| 5 | e41–e50 | Easy | Pending | — | — |
| 6 | m01–m10 | Medium | Pending | — | — |
| 7 | m11–m20 | Medium | Pending | — | — |
| 8 | m21–m30 | Medium | Pending | — | — |
| 9 | m31–m40 | Medium | Pending | — | — |
| 10 | h01–h10 | Hard | Pending | — | — |
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
