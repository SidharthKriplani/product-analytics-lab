# SQL VARIETY BENCHMARK — the bar the SQL bank must clear

_Created 2026-06-22 (HQ spec). The standard against which PAL's SQL problem bank is audited for **coverage and variety**. Derived from a survey of DataLemur, StrataScratch, LeetCode (Top SQL 50 + Advanced SQL 50), HackerRank, Mode, InterviewQuery, SQLZoo. Use this to answer: does our bank cover the field — and where does it beat it?_

> The bank's job isn't volume — it's **variety with depth**. A bank that drills 200 GROUP BY problems and zero gaps-and-islands is shallow. This doc defines the full surface area, splits it into must-have vs differentiating, and is the checklist a coverage audit scores against.

## The 18 core problem types

| # | Category | What it tests | Representative problem | Difficulty |
|---|---|---|---|---|
| 1 | Basic SELECT & filtering | projection, WHERE, DISTINCT, LIKE, IN, BETWEEN, ORDER/LIMIT | products both low-fat and recyclable | Easy |
| 2 | Aggregation + GROUP BY/HAVING | grain discipline; COUNT/SUM/AVG; post-aggregate filter | bucket users by tweet count, count per bucket | Easy–Med |
| 3 | Joins (inner/left/self/cross/anti/semi) | LEFT keeps unmatched; self-join; NOT EXISTS/EXISTS | bus routes sharing a stop (self-join); customers who never ordered (anti) | Easy–Med |
| 4 | Subqueries & CTEs (incl. recursive) | scalar/correlated subqueries, WITH, recursion | countries bigger than every European country | Med |
| 5 | Window functions | OVER(PARTITION/ORDER); ROW_NUMBER/RANK/DENSE_RANK; running totals; LAG/LEAD; NTILE | 3-day rolling avg of tweets per user | Med–Hard |
| 6 | Date/time logic | DATE_TRUNC/DATEDIFF/intervals; **half-open [start,end)**; period buckets | days warmer than the preceding day | Easy–Med |
| 7 | Pivoting / conditional aggregation | SUM(CASE WHEN…) cross-tabs; long→wide | order value by service type per month, pivoted | Med |
| 8 | Set operations | UNION/INTERSECT/EXCEPT; UNION vs UNION ALL | users active in both periods (INTERSECT) | Med |
| 9 | Gaps-and-islands | contiguous runs via ROW_NUMBER date-offset or LAG+running sum | longest consecutive login streak per user | Hard |
| 10 | Top-N-per-group | DENSE_RANK/ROW_NUMBER over partition, rank ≤ N | department top-three salaries | Hard |
| 11 | Deduplication | detect/remove dupes; keep-min-id | delete duplicate emails, keep smallest id | Easy–Med |
| 12 | Hierarchical / recursive | recursive CTE over parent-child / graph | employee→manager reporting-chain depth | Hard |
| 13 | String / text ops | SUBSTRING/CONCAT/REPLACE/TRIM/REGEXP | capitalize first letter, lowercase rest | Easy–Med |
| 14 | NULL handling | IS NULL, COALESCE, NULLIF, NOT IN/join pitfalls | teachers incl. those with no department | Easy–Med |
| 15 | Ratio / rate & metrics | safe division (NULLIF); conditional numerators (CTR, conversion) | click-through rate per app, rounded | Med |
| 16 | Cohort / retention | first-event anchor (MIN OVER), period offsets, returners ÷ cohort | retention per monthly cohort per plan | Hard |
| 17 | Sessionization | bucket events when inter-event gap > threshold (LAG + cumulative flag) | assign session ids when gap > 30 min | Hard |
| 18 | Median / percentiles | PERCENTILE_CONT/DISC or window midpoint; engine-dependent | median salary per department without a built-in | Hard |

**Also seen (worth a few each):** row-comparison (consecutive rows via LAG); existence/anti-join ("who didn't do X"); self-referential combinatorics (pairs/triples — mutual friends, seat swaps); fixed-shape report formatting; Nth-value selection (2nd/Nth highest).

## Must-have vs differentiating

**MUST-HAVE (11) — a gap here gets exposed in a normal interview:**
1 SELECT/filter · 2 GROUP BY/HAVING · 3 joins (incl. self + anti) · 4 subqueries & non-recursive CTEs · 5 window funcs (ROW_NUMBER/RANK, running totals, LAG/LEAD) · 6 date/time · 14 NULL handling · 10 top-N-per-group · 11 dedup · 15 ratio/rate · 7 conditional aggregation/pivot.

**DIFFERENTIATING (10) — what separates a great bank (concentrated on StrataScratch/DataLemur/InterviewQuery + LeetCode Advanced SQL 50):**
9 gaps-and-islands · 17 sessionization · 16 cohort/retention · 18 median/percentiles · 12 recursive/hierarchical · advanced window frames (ROWS BETWEEN, NTILE, FIRST/LAST_VALUE) · 8 meaningful set ops · rolling metrics with correct half-open ranges · self-referential puzzles · **multi-CTE "analytics narrative" problems** (dedup → window → metric in one query — the large cohort/segmentation queries that mirror real analytics work).

**Litmus test:** SQLZoo/HackerRank cover must-have 1–7; LeetCode SQL 50 adds 8–11; only StrataScratch/DataLemur/InterviewQuery + LeetCode Advanced SQL 50 systematically cover the differentiating list. **That tier is where our bank wins or loses.**

## How to audit the bank against this

For each of the 18 + the differentiating extras: count how many bank problems primarily exercise it, note the difficulty spread, and flag any category with **0** (a hole) or only-easy coverage (shallow). Output a coverage table (category × count × difficulty range × verdict: covered / thin / missing), then a "where we beat the benchmark" section (categories where our depth/variety exceeds the platforms) and a prioritized gap list. The likely holes for an analytics-first bank: gaps-and-islands, sessionization, cohort/retention, median/percentiles, recursive — and the multi-CTE large-query "analytics narrative" type Sidharth flagged.

_Sources: DataLemur, StrataScratch top-30, LeetCode Top SQL 50 + Advanced SQL 50, HackerRank SQL, Mode window-functions, InterviewQuery, SQLZoo._
