# SQL DIFFICULTY RUBRIC — how a problem's tier is decided

_Created 2026-06-24. The standard for assigning `difficulty` to a SQL Lab problem. Use it when authoring a new problem and when auditing tiers. Tiers are Easy / Medium / Hard / Master (Forensic is a format, not a difficulty — a Forensic problem is tiered by the difficulty of spotting + fixing its bug)._

## The core principle

**A problem's difficulty is the MAX of two axes, not just one:**

1. **Mechanical load** — what SQL machinery the correct answer requires (joins, windows, CTEs, recursion).
2. **Conceptual load** — how much analytical reasoning it takes to know *what* to compute (a cohort-retention question is conceptually Medium even if the SQL is "just a join + GROUP BY").

A problem that is mechanically trivial but conceptually demanding is **not** Easy. A problem that is mechanically heavy is **not** Easy even if the concept is obvious. Tier by whichever axis is higher.

## Tier definitions (mechanical axis)

| Tier | The query requires… | Must NOT require |
|---|---|---|
| **Easy** | single table, OR one basic 2-table INNER join. SELECT / WHERE / ORDER BY / LIMIT / DISTINCT, GROUP BY with simple aggregates (COUNT/SUM/AVG/MIN/MAX), basic HAVING. | any window function, anti-join, self-join, 3+ table join, correlated subquery, CASE-pivot, set op, CTE pipeline |
| **Medium** | **one** non-trivial technique: a single window function (ROW_NUMBER / RANK / DENSE_RANK / LAG / LEAD / NTILE / PERCENT_RANK / SUM OVER), OR an anti-join (LEFT JOIN + IS NULL), OR a self-join, OR a 3+ table join, OR a correlated/scalar subquery as the point, OR conditional aggregation (SUM(CASE WHEN)), OR a set operation, OR a 1–2 CTE pipeline, OR date arithmetic + safe division. | combining 2+ advanced techniques; explicit window frames; gaps-and-islands; recursion |
| **Hard** | composing **multiple** techniques, OR an advanced one: an explicit window frame (`ROWS/RANGE BETWEEN`), OR 2+ window functions, OR gaps-and-islands, OR sessionization, OR a recursive CTE, OR a 3+ CTE pipeline, OR window + multi-CTE + a derived metric. | — |
| **Master** | a large multi-CTE **analytics narrative** — chaining dedup → window → metric, the hardest cohort/retention *curves*, multi-signal scoring engines, or anything needing real query decomposition and business judgment to even structure. | — |

## Conceptual-load overrides (bump up one tier)

Apply on top of the mechanical tier:

- **Metric ambiguity that must be resolved** ("define headcount: active or on-record?") → at least Medium.
- **Cohort / retention / funnel framing** → at least Medium even if the SQL is simple; Hard if it's a curve or multi-period.
- **A correctness trap that's the whole point** (the wrong-but-runs answer is subtle) → at least Medium.
- **Fan-out / grain hazard** (joins that silently multiply rows) → at least Medium.

## The consistency rule (the one that catches real bugs)

**Two problems that exercise the same primary pattern must sit in the same tier.** A rolling-window average is the same skill whether it's over orders or attempts — both Medium (single window with a frame is borderline; pick one tier and apply it to all). Cross-tier mismatches for the same pattern are the highest-signal tiering defect, more objective than any single absolute call. When auditing, group by primary pattern first and check the tier is constant.

## How to audit tiers against this rubric

1. For each problem, derive the mechanical tier from the table above and the solution SQL.
2. Apply conceptual overrides.
3. The assigned `difficulty` should equal the result. Flag disagreements.
4. **Then** group all problems by primary pattern and flag any pattern whose problems span >1 tier (consistency rule).
5. Caution: a pure-regex classifier over-fires (a single window function is Medium, not Hard; a basic 2-table join is Easy, not Medium). Treat the classifier as a candidate-finder; the tier is a human call. Auto-flip only mechanically-unambiguous cases (e.g. anti-join in Easy); flag the rest.

## Ripple when changing a difficulty

`difficulty` is read by: the difficulty-filter chips on the browser, the sort order (Easy→Master), and `Progress.jsx` role-readiness scoring. It is **not** validated by the mechanical or content gates, so a re-tier won't break a build — but re-tiering shifts the readiness score and the browse order, so batch re-tiers deliberately.

---

_Companion: `docs/SQL-CONTENT-STANDARD.md` (content quality) and `docs/SQL-VARIETY-BENCHMARK.md` (category coverage). This doc governs the tier label only._
