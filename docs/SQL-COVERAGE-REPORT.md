# SQL COVERAGE REPORT — PAL bank vs the SQL Variety Benchmark

_Created 2026-06-22. Audits the 182-problem SQL Lab bank against `docs/SQL-VARIETY-BENCHMARK.md` (the 18-category bar derived from DataLemur / StrataScratch / LeetCode SQL 50 + Advanced 50 / HackerRank / Mode / InterviewQuery / SQLZoo). Audit/content only — no problems built this pass. Method and proposals below._

> **✅ UPDATE 2026-06-23 (V5.47.0): gaps closed.** All 10 proposed specs were built and shipped (propose-only/unpushed) — sess1/sess2, med1/med2, gaps2/gaps3, set1, rec1, str1, dedup1 — taking the bank 182 → 192. The two previously-MISSING categories (sessionization, string) and the thin tier (true median, gaps-and-islands, set ops, recursive, dedup) are now covered. New headline: **18/18 benchmark categories have ≥1 problem.** Five new seed tables added: `clickstream` (consumer), `service_status` + `employees` (saas), `signups` (ecomm), `contacts` (fintech). The original audit below is preserved as the pre-build snapshot.

---

## Method

Every problem in `src/data/sqlLabProblems.js` was parsed and classified two ways:

- **Primary category** — the single most distinctive benchmark type each problem exercises, assigned by walking a differentiating-first priority order (a problem that does both a window function and a GROUP BY is counted as a window problem, since that is the harder skill it demonstrates). This prevents the 51 problems that happen to use GROUP BY from drowning out the categories that matter.
- **Touches (any)** — how many problems exercise the category *at all*, including as machinery. CTEs, joins, and NULL handling show up as supporting machinery across the bank even when they aren't the point of the problem.

Both numbers matter. A category with low primary but high touches is *practised but never the focus* — fine for joins, a real gap for sessionization. The **Forensic tier (36 problems)** is reported separately: it is a bug-hunt format, not a benchmark category, and is one of the places PAL beats the field.

Bank size: **182 problems** — 49 Easy, 52 Medium, 27 Hard, 18 Master, 36 Forensic (146 non-Forensic + 36 Forensic).

---

## Coverage table

Primary counts below are **non-Forensic**; the Forensic column counts Forensic problems whose underlying bug lives in that category. Difficulty spread is E / M / H / Master.

| # | Category | Primary | E/M/H/Ma | Forensic | Touches | Verdict |
|---|---|---|---|---|---|---|
| 1 | Basic SELECT & filtering | 2 | 2/0/0/0 | 5 | 47 | **Covered** (as machinery; few pure-filter problems — fine, it's table stakes) |
| 2 | Aggregation + GROUP BY / HAVING | 17 | 13/4/0/0 | 4 | 123 | **Covered — strong** |
| 3 | Joins (inner/left/self/cross/anti/semi) | 43 | 21/9/6/7 | 9 | 106 | **Covered — very strong** (anti-join null-safety, self-join, EXISTS all present) |
| 4 | Subqueries & CTEs (non-recursive) | 1 | 0/1/0/0 | 1 | 50 | **Covered** (CTEs are machinery in 50 problems; correlated/scalar subqueries present) |
| 5 | Window functions | 23 | 0/16/5/2 | 1 | 40 | **Covered — beats benchmark** (ROW_NUMBER, RANK, LAG/LEAD, SUM OVER, NTILE, ROWS BETWEEN, PERCENT_RANK) |
| 6 | Date/time logic | 5 | 1/3/1/0 | 3 | 30 | **Covered** (julianday intervals, strftime period buckets, MoM) |
| 7 | Pivoting / conditional aggregation | 12 | 0/6/4/2 | 1 | 16 | **Covered — strong** (SUM(CASE WHEN) cross-tabs, retention-curve pivots) |
| 8 | Set operations | 1 | 0/1/0/0 | 1 | 4 | **Thin** — only UNION ALL meaningfully; no INTERSECT / EXCEPT problem as the point |
| 9 | Gaps-and-islands | 1 | 0/0/1/0 | 0 | 1 | **Thin** — single problem (sql-h02, classic julianday − ROW_NUMBER island grouping) |
| 10 | Top-N-per-group | 6 | 1/2/1/2 | 1 | 7 | **Covered** (DENSE_RANK / ROW_NUMBER ≤ N partitions) |
| 11 | Deduplication | 1 | 0/0/1/0 | 2 | 10 | **Thin-to-covered** — keep-latest-per-key via ROW_NUMBER=1 present (m13, h08); no "delete dupes keep min id" classic |
| 12 | Recursive / hierarchical | 2 | 0/0/1/1 | 0 | 2 | **Thin — but present, beats most banks** (h51 date-spine recursion, master26 referral-tree walk) |
| 13 | String / text ops | 0 | 0/0/0/0 | 0 | 0 | **Missing** (lowest analytics value of the holes, but benchmark lists it) |
| 14 | NULL handling | 4 | 3/1/0/0 | 1 | 24 | **Covered** (COALESCE, IS NULL, NOT IN pitfalls — taught explicitly in debriefs) |
| 15 | Ratio / rate & metrics | 12 | 5/5/2/0 | 3 | 29 | **Covered — strong** (safe division via NULLIF, CTR/conversion, integer-division trap taught) |
| 16 | Cohort / retention | 13 | 3/2/4/4 | 4 | 17 | **Covered — beats benchmark** (the multi-CTE narrative tier — see below) |
| 17 | Sessionization | 0 | 0/0/0/0 | 0 | 0 | **Missing** — highest-priority differentiating hole |
| 18 | Median / percentiles | 3 | 0/2/1/0 | 0 | 3 | **Thin** — all three use PERCENT_RANK (percentile-rank); no true median-without-a-builtin |

**Headline:** 11 of 18 categories are solidly covered, 5 are thin, 2 are missing. The must-have 11 are all covered. The damage is concentrated exactly where the benchmark predicted for an analytics-first bank — the differentiating tier: sessionization (0), gaps-and-islands (1), true median (0), set ops (1), recursive (2).

---

## Where we beat the benchmark

These are categories and formats where PAL's depth or variety exceeds what DataLemur / StrataScratch / LeetCode / SQLZoo offer — not just parity.

**1. The Forensic tier (36 problems) — no major platform has this format.** Every Forensic problem ships a query that *runs and returns a plausible-looking wrong answer*, and the user has to find the bug. Bug types span JOIN-without-status-filter, SUM OVER missing ORDER BY, COUNT(*) vs COUNT(DISTINCT), INNER vs LEFT, strftime year-vs-month, scalar `=` vs `IN`, HAVING vs WHERE, UNION ALL double-counting. This is the single biggest differentiator — it tests the judgment skill ("the query ran, is it *right*?") that every benchmark platform ignores because they only grade output-matching.

**2. Cohort / retention as large multi-CTE "analytics narrative" queries.** This is the exact differentiating type the benchmark flags as where banks win or lose. PAL's Master tier delivers it: `master02` (channel 6-month retention, MIN-anchor + 180-day window + rate), `master13` (buyer cohort repurchase, dedup → window → metric in one query), `master27` (signup cohort retention *curve* — cohort sizing + month-offset pivot, the StrataScratch-grade query). 13 cohort/retention problems primary, spread across all four difficulties — deeper than the 2–3 retention problems a typical platform carries.

**3. Window-function depth.** 23 primary / 40 touches, spanning ROW_NUMBER, RANK/DENSE_RANK, LAG/LEAD, SUM OVER running totals, NTILE, ROWS BETWEEN frame specs, AVG OVER rolling averages, and PERCENT_RANK. That covers the benchmark's "advanced window frames" differentiator (ROWS BETWEEN, NTILE, FIRST/LAST_VALUE) that only LeetCode Advanced 50 systematically hits.

**4. Conditional aggregation / pivot.** 12 primary, up through Master. SUM(CASE WHEN) cross-tabs and long→wide retention pivots — deeper than SQLZoo/HackerRank's basic must-have coverage.

**5. The judgment layer in every debrief.** Each problem teaches a *wrong answer that runs* plus a sanity check (the integer-division trap, NOT IN with NULLs, missing status filter). No benchmark platform ships this — they grade the final SELECT and stop. This is PAL's core thesis (judgment, not recall) showing up in the SQL bank.

**6. Joins variety with production framing.** 43 primary including null-safe anti-joins, self-joins (co-purchase affinity, referral pairs), and EXISTS/NOT EXISTS — framed around real business decisions (re-engagement targets, churn candidates) rather than abstract `employees`/`departments` tables.

---

## Prioritized gap list

Ordered by interview exposure × differentiating value. The first three are the ones that get a candidate caught in a StrataScratch/DataLemur-style screen.

**P1 — Sessionization (category 17, currently 0).** The flagship differentiating hole. Event-stream sessionization (new session when inter-event gap > 30 min, via LAG + cumulative-sum flag) is a standard analytics-interview question and PAL has zero. The datamarts already carry event/session tables to support it. **Target: 2–3 problems, Hard/Master.**

**P2 — Median / percentiles, true median (category 18, currently 3 but all PERCENT_RANK).** PAL teaches percentile-*rank* but never "compute the median without a built-in" — the engine-dependent window-midpoint or PERCENTILE_CONT problem that's a known SQLite/interview trap. **Target: 1–2 problems (median order value per segment; p90 latency), Medium/Hard.**

**P3 — Gaps-and-islands (category 9, currently 1).** One classic problem (sql-h02) is good but a single problem is fragile coverage for a Hard differentiator. **Target: +2 problems — longest consecutive active-day streak per user (variant), and contiguous downtime/outage windows from a status log.**

**P4 — Set operations (category 8, currently 1).** No meaningful INTERSECT (users active in *both* periods) or EXCEPT (churned = last-period − this-period) problem. **Target: +2, Medium.**

**P5 — Recursive / hierarchical (category 12, currently 2).** Present and already beats most banks, but thin for a Hard differentiator. **Target: +1–2 — manager reporting-chain depth, or running balance via recursive CTE.**

**P6 — String / text ops (category 13, currently 0) and Deduplication classic (category 11).** Lowest priority — string ops are low-value for analytics interviews, and dedup is already covered as keep-latest machinery. **Target: 1 string problem (parse UTM/domain from a URL) and 1 canonical "delete duplicate emails, keep min id" if cheap.**

**Note on NEXT.md item #3 (partly stale):** that item lists 5 "missing" patterns — date spine, ROWS BETWEEN, PERCENT_RANK, two-valid-queries, recursive CTE. Three of these now exist (ROWS BETWEEN in 2 problems, PERCENT_RANK in 3, recursive CTE in h51/master26). The genuinely-still-missing items from that list are **date-spine/gap-filling** (overlaps P3) and **two-valid-queries-different-results** (a judgment format, not a category). Recommend updating NEXT.md #3 to reflect this.

---

## Proposed new problems (propose-only — not built this pass)

See `docs/SQL-COVERAGE-REPORT.md` companion section below. Building is gated on Sidharth's approval per the no-auto-build rule; these are specs, not committed problems. All would use existing datamarts, single-quote/escaped-apostrophe syntax, and need `expectedRowCount` + `checkValues` verified against seed data before commit.

### Differentiating tier (P1–P3)

**SESS-1 · Sessionize the clickstream (Hard, sessionization).** _Datamart: ecomm/events._ Assign a session_id to each event where a gap > 30 min from the same user's previous event starts a new session; return events per session. Solution shape: `LAG(ts) OVER (PARTITION BY user_id ORDER BY ts)` → flag gap > 30 min → `SUM(flag) OVER (...)` cumulative session number. Debrief trap: forgetting to partition by user, so one user's last event chains into the next user's first.

**SESS-2 · Sessions per user + avg session length (Master, sessionization → metric).** Build on SESS-1 as a CTE, then aggregate to sessions/user and median session duration. Multi-CTE narrative. Trap: counting events as sessions; off-by-one on the gap boundary (`>` vs `>=` 30 min).

**MED-1 · Median order value per segment (Medium, median).** True median without a built-in — window-midpoint method: `ROW_NUMBER` ascending and descending per segment, the median is where the two ranks meet (or their average for even counts). Debrief: why `AVG` ≠ median on skewed revenue; SQLite has no PERCENTILE_CONT, so the midpoint trick is the portable answer.

**MED-2 · p90 delivery time per city (Hard, percentile).** PERCENT_RANK or NTILE(10)-based p90 on the Swiggy delivery datamart. Ties to a real ops decision (SLA breach). Trap: confusing p90 "90% are faster than this" with "top 10% slowest."

**GAPS-2 · Longest active-day streak per user (Hard, gaps-and-islands).** Variant of h02 returning the *length* of the longest run, not just users with ≥3. Reinforces the island-grouping pattern at a different output grain.

**GAPS-3 · Contiguous outage windows from a status log (Hard, gaps-and-islands).** Collapse consecutive 'down' rows into outage intervals with start/end and duration. The "merge adjacent rows into ranges" flavor — distinct from streak counting.

### Coverage-completion tier (P4–P6)

**SET-1 · Users active in both Q1 and Q2 (Medium, INTERSECT).** Plus the EXCEPT variant ("active in Q1, gone in Q2" = churn). Teaches when INTERSECT/EXCEPT is cleaner than a self-join. Trap: UNION vs UNION ALL double-counting (already a Forensic bug — cross-reference).

**REC-1 · Manager reporting-chain depth (Hard, recursive).** Recursive CTE walking employee → manager to compute org depth per person. The canonical hierarchical problem the benchmark names; complements master26's referral tree.

**STR-1 · Parse domain / UTM source from a URL (Medium, string).** SUBSTR/INSTR/REPLACE to extract a domain from a referrer URL, then group. Covers the string hole with an analytics-relevant framing rather than toy capitalization.

**DEDUP-1 · Delete duplicate emails, keep min id (Easy–Medium, dedup).** The textbook dedup problem, for canonical-coverage completeness. Cheap to add; low novelty.

**Suggested build order if approved:** SESS-1 → SESS-2 → MED-1 → GAPS-2 → SET-1, then the rest. That clears the two missing categories and the thinnest differentiator first. Each must pass `scripts/audit_sql_lab.py` (0 T1 failures) and the apostrophe/brace checks before commit.
