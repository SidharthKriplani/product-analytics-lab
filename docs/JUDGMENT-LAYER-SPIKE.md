# JUDGMENT-LAYER SPIKE — schema discovery on one problem

_Created 2026-06-22. A **schema-discovery spike**, not a build. One problem ("latest order per customer", top-N-per-group with N=1) is worked end-to-end to discover the **per-problem data structure** the future judgment layer (multi-method + scenario-dial + MCQ) requires — so the coming coverage rewrite of all 182 SQL problems can author each problem B-ready in one pass instead of two. No app wiring, no problems built, no auto-push._

> **Where this sits in the stack.** Judgment is the top layer, not a replacement for the ones under it. A problem still has to teach **recall** (which clause does what), **depth** (why, with the cost shown), and **fluency** (write it correctly). The judgment layer adds the fourth skill: *given a situation, which correct method is the right one, and why* — the thing that separates someone who can pass LeetCode from someone who can be handed a 50M-row table in production. Every method note and MCQ below clears the depth standard: **show the cost, don't assert it.**

---

## Why this problem first

"Return the most recent order per customer" is the ideal first subject because it is **method-rich and the tradeoffs flip hard**. Four genuinely different correct SQL strategies solve it — window function, correlated subquery, self-join, aggregate+join-back — and which one is *best* changes completely with data size, indexing, engine, and whether ties exist. A problem where all methods are equivalent teaches nothing about judgment. This one has a real decision in it, including a **correctness fork** (not just a performance fork): on tied timestamps, the methods return *different rows*.

---

## 1. Proposed per-problem schema

This is the field set every problem must carry to support the judgment layer. It is additive — existing fields (`id`, `prompt`, `solution`, `debrief`, `hintSteps`, `checkValues`, difficulty, solved/mastered progress tiers) stay as-is. `solution` remains the single canonical answer for the runner's correctness check; `methods[]` is the new judgment surface.

```js
// additive fields on an existing sqlLabProblems[] entry
{
  // ... existing id, title, company, difficulty, prompt, expectedColumns,
  //     expectedRowCount, hintSteps, hints, checkValues, solution, debrief ...

  canonicalMethodId: 'window',          // which methods[] entry `solution` corresponds to

  methods: [
    {
      id: 'window',                      // stable slug, referenced by dial + mcqs
      name: 'Window — ROW_NUMBER',
      sql: '...full runnable solution...',// must return the canonical correct output
      detectionSignature: {              // how to recognise this method in a user's query
        mustMatch: ['/\\bover\\s*\\(/i'],         // regex(es) that must be present
        mustNotMatch: [],                          // regex(es) that must be absent
        note: 'has an OVER() window clause',
      },
      tradeoff: 'Single ordered pass; reads as intent. Needs a tiebreak in ORDER BY or the pick is arbitrary.',
      breaksWhen: 'No secondary sort key on tied timestamps -> arbitrary row chosen.',
      isTrap: false,                      // true = a method that *runs* but is wrong/dangerous in common cases
    },
    // ... correlated, selfjoin, aggregate ...
  ],

  dial: {
    axes: ['dataSize','index','engine','ties','nullableSortKey'],  // the decision variables
    rules: [
      // each rule: a condition subset -> ranked methods + one-line reason each
      { when: { dataSize: '1K' },
        ranking: ['window','aggregate','correlated','selfjoin'],
        reason: 'At 1K rows all four finish instantly; pick for readability, not speed. Lesson: do not over-optimize.' },
      // ... more rules, most-specific-wins ...
    ],
  },

  mcqs: [
    {
      id: 'mcq-scale-noindex',
      stem: '50M orders, no index on (customer_id, order_date), Postgres. Which method, and why?',
      options: ['window','correlated','selfjoin','aggregate'],   // option ids = method ids
      answerId: 'window',
      explanation: 'Correlated subquery = nested loop, ~50M inner re-scans (O(n*m)). Self-join fans out then filters. Window = one sort + one pass. ...show the cost...',
    },
    // ... 1-2 more, each a different dial cell ...
  ],
}
```

**Design notes that fell out of working the instance:**

- **`methods[].sql` must be independently runnable and verified equal** to the canonical output on the seed — otherwise the dial recommends an answer the user can't trust. The spike ran all four and confirmed byte-identical output (below). The rewrite needs a script that runs every method per problem and diffs against `solution`.
- **`detectionSignature` is regex-over-normalized-SQL, not a parser.** Cheap, good enough to classify which of *these four* a user wrote. It must be authored per-method (the signatures are method-specific, not global) — a global classifier can't tell a correlated subquery from a join-back subquery without the per-problem option set to disambiguate against.
- **`dial.rules` is sparse + most-specific-wins**, not a full cross-product. Five axes with 2–3 values each is up to ~108 cells; only ~8–12 are *meaningfully different*. Author the cells where the answer changes; everything else falls through to a default rule.
- **`isTrap`** is the bridge to the existing Forensic format. A trap method is exactly a "query that runs and returns a plausible wrong answer" — the judgment layer and the Forensic tier share this concept and should share the flag.

---

## 2. Fully-worked instance — "latest order per customer"

**Grounding:** ecomm datamart, `orders` table (`order_id, user_id, created_at, status, subtotal, discount, shipping`), 28 rows, users 1–12 (13–15 have no orders). "Customer" = `user_id`; "latest" = max `created_at`. (The shipped analog today is `sql-m13` "Latest Transaction Per Account" on `transactions`/`account_id`/`occurred_at` — same shape.) All four methods were executed in SQLite 3.37.2 against the real seed.

### 2a. The four methods (all verified identical)

Canonical output — **12 rows, one per customer** (`user_id, order_id, created_at`):
`(1,27,2024-03-05) (2,4,2023-09-05) (3,28,2024-04-20) (4,8,2023-11-20) (5,13,2024-01-12) (6,14,2023-04-30) (7,16,2024-02-25) (8,18,2023-12-20) (9,20,2024-03-20) (10,22,2024-01-30) (11,24,2024-04-15) (12,26,2024-04-30)`

All four below returned exactly this (verified — see §2c).

**(a) Window — `ROW_NUMBER`** — `canonicalMethodId`
```sql
WITH ranked AS (
  SELECT order_id, user_id, created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, order_id DESC) AS rn
  FROM orders
)
SELECT user_id, order_id, created_at FROM ranked WHERE rn = 1 ORDER BY user_id;
```
- **Detection:** has `OVER(`. **Tradeoff:** one ordered pass, reads as intent, trivially extends to "2nd latest" (`rn = 2`) or "top 3" (`rn <= 3`). **Breaks when:** no tiebreak in `ORDER BY` → the row chosen among ties is arbitrary and engine-dependent (the `, order_id DESC` is the fix).

**(b) Correlated subquery on `MAX`**
```sql
SELECT o.user_id, o.order_id, o.created_at
FROM orders o
WHERE o.created_at = (SELECT MAX(o2.created_at) FROM orders o2 WHERE o2.user_id = o.user_id)
ORDER BY o.user_id;
```
- **Detection:** inner query references the outer table (`o2.user_id = o.user_id`). **Tradeoff:** reads naturally, no window needed (works on pre-8.0 MySQL / ancient engines). **Breaks when:** the table is large and the optimizer runs it as a nested loop — one inner scan per outer row; and on ties it returns **both** tied rows (no single-row guarantee).

**(c) Self-join anti ("no later order exists")**
```sql
SELECT o1.user_id, o1.order_id, o1.created_at
FROM orders o1
LEFT JOIN orders o2 ON o2.user_id = o1.user_id AND o2.created_at > o1.created_at
WHERE o2.order_id IS NULL
ORDER BY o1.user_id;
```
- **Detection:** the same table aliased twice (`orders o1 … orders o2`). **Tradeoff:** the "find rows with nothing greater" idiom; portable, no window. **Breaks when:** ties exist (`>` lets two rows with equal max date each survive, and they also pair with each other → fan-out), and at scale the self-join is a large intermediate before the filter.

**(d) Aggregate `GROUP BY` + join-back**
```sql
SELECT o.user_id, o.order_id, o.created_at
FROM orders o
JOIN (SELECT user_id, MAX(created_at) AS mx FROM orders GROUP BY user_id) m
  ON o.user_id = m.user_id AND o.created_at = m.mx
ORDER BY o.user_id;
```
- **Detection:** a derived table with `GROUP BY` and no window, joined back to the base table. **Tradeoff:** one cheap aggregate pass + a join; vectorizes well in columnar engines. **Breaks when:** ties exist → returns **all** tied rows per customer (often what you want for "all latest orders", wrong for "exactly one row per customer" — a definition fork, not a bug).

### 2b. Detection-signature summary

| Method | Present | Absent | One-line tell |
|---|---|---|---|
| window | `OVER(` | — | a window clause |
| correlated | inner SELECT references outer alias | `OVER(` | subquery mentions the outer table |
| selfjoin | base table aliased twice | `OVER(`, `GROUP BY` | `orders o1 … orders o2` |
| aggregate | derived table w/ `GROUP BY` joined back | `OVER(` | `MAX(...) … GROUP BY` then JOIN |

### 2c. The scenario dial

Axes: **data size** (1K / 50M / 10B) · **index on `(customer_id, order_date)`** (yes/no) · **engine** (Postgres row-store / Snowflake columnar / Spark) · **ties present** (yes/no) · **`order_date` nullable** (yes/no). Only the cells where the answer actually changes are listed (most-specific-wins).

| Scenario | Best method | Why (the cost, not an assertion) |
|---|---|---|
| **1K rows, any engine** | any — pick `window` | All four finish in <1ms; the table fits in a page or two. **Lesson: don't over-optimize — readability wins.** |
| **50M, Postgres, index on (customer_id, order_date)** | `window` | The index supplies rows already ordered within each customer; `ROW_NUMBER` is a single ordered pass and PG15+ can early-stop per partition. ~1 index-ordered scan. |
| **50M, Postgres, NO index** | `window` (then `aggregate`) | Window = one sort (~50M, spills to disk but linearithmic) + one pass. `aggregate` = one hash-aggregate + one join, similar class. Both beat the alternatives by orders of magnitude. |
| **50M, Postgres, correlated subquery** | ✗ avoid `correlated` | Planner runs it as a nested loop: for each of 50M outer rows, re-scan that customer's orders. O(n·m), ~50M inner executions without the index — quadratic-ish death. |
| **50M, Postgres, ties present, need ONE row/customer** | `window` (ROW_NUMBER + tiebreak) | Only `ROW_NUMBER` with a secondary sort guarantees exactly one row. `aggregate`/`selfjoin`/`correlated` all return *both* tied rows. |
| **50M, ties present, need ALL latest orders** | `aggregate` (or `RANK()=1`) | Here returning both tied rows is *correct*. `ROW_NUMBER=1` would wrongly drop one. **Same data, opposite right answer — this is the fork.** |
| **10B, Snowflake (columnar)** | `window` or `aggregate` | Both vectorize over compressed columnar storage and parallelize across micro-partitions. `correlated` is an anti-pattern — columnar engines can't run per-row nested loops efficiently. |
| **10B, Spark** | `aggregate` (often) over `window` | A `window` partitioned by customer forces a full **shuffle + sort** by customer. A `GROUP BY MAX` can pre-aggregate map-side before the shuffle, moving far less data. `correlated`/`selfjoin` don't translate to a clean single Spark stage. |
| **`order_date` NULLABLE, any** | any — but handle NULLs explicitly | `MAX` ignores NULLs (a NULL-dated order silently can't be "latest"); `ORDER BY … DESC` puts NULLs first or last by engine, which can corrupt `ROW_NUMBER`. Decide the rule (usually NULL date = not a candidate) and encode it, don't inherit engine default. |

**Grounded facts behind the dial** (mark illustrative numbers as illustrative): at 1K rows all methods are instant — over-optimizing is the mistake. The index `(customer_id, order_date)` is what makes `window` a single ordered pass with possible early-stop. A correlated `MAX` subquery is an O(n·m) nested-loop at scale. Self-joins fan out on ties. In columnar (Snowflake) `window`/`GROUP BY` vectorize while correlated per-row logic is an anti-pattern. In Spark a `window` is a shuffle+sort, so a pre-aggregating `GROUP BY` often moves less data. And the ties case is a genuine **correctness fork**: `ROW_NUMBER` picks one arbitrarily, while aggregate+join / `RANK()=1` return both — which is right depends on the question, not the SQL.

### 2d. MCQs (each a different dial cell, cost reasoning shown)

**MCQ 1 — scale + no index.**
_50M orders, no index on `(customer_id, order_date)`, Postgres. The team's query times out. Which rewrite fixes it?_
(a) window ROW_NUMBER · (b) correlated MAX subquery · (c) self-join · (d) it can't be fixed in SQL
→ **Answer: (a).** The timing-out query is almost certainly the **correlated subquery**: the planner runs it as a nested loop — for each of ~50M outer rows it re-scans that customer's orders, ≈ tens of millions of inner executions (O(n·m)). `ROW_NUMBER` replaces that with **one sort + one linear pass** (linearithmic, ~50M·log). Self-join (c) avoids the nested loop but builds a large `o2.created_at > o1.created_at` intermediate before the anti-filter — better than correlated, worse than window. _Illustrative magnitudes; exact plan depends on the optimizer._

**MCQ 2 — the ties correctness fork.**
_Some customers have two orders with the **same** latest `created_at`. The spec says "return **every** order placed on each customer's most recent day." Which is correct?_
(a) `ROW_NUMBER() … rn = 1` · (b) `GROUP BY user_id` MAX + join-back · (c) both · (d) neither
→ **Answer: (b).** Verified on injected tie data: for a customer with two orders on the tied latest date, `ROW_NUMBER … = 1` returns **1 row** (order 27 — the other tied order silently dropped), while MAX+join-back returns **both** (orders 27 and 29). For "every order on the latest day," dropping one is wrong, so (a) fails the spec. `RANK() = 1` is an equally-correct window alternative — it keeps both. The lesson: `ROW_NUMBER` answers "one row per customer," `RANK`/aggregate answer "all tied winners" — pick by the question.

**MCQ 3 — engine shift, Spark.**
_The same logic moves from Postgres to Spark over 10B rows. The Postgres answer used `ROW_NUMBER() OVER (PARTITION BY customer_id …)`. What's the main cost to anticipate?_
(a) Spark can't do window functions · (b) the PARTITION BY forces a full shuffle+sort by customer · (c) correlated subqueries get faster · (d) nothing changes
→ **Answer: (b).** The window partitioned by `customer_id` makes Spark **shuffle every row to a partition-owning executor and sort within it** — the dominant cost at 10B rows. A `GROUP BY customer_id` taking `MAX` can **pre-aggregate map-side** before the shuffle, moving far less data across the network, so the aggregate+join-back is often the better Spark shape even though `window` won on indexed Postgres. (a) is false — Spark has window functions; the issue is their shuffle cost, not their existence.

### 2e. Verification log

Ran in SQLite 3.37.2 against the 28-row seed: all four methods returned the identical 12-row result above. Injected a same-day tie for one customer: `ROW_NUMBER … =1` → 1 row (arbitrary pick), `RANK … =1` → both rows, aggregate MAX+join → both rows. The correctness fork is real and reproduced, not asserted.

---

## 3. What the schema implies for the coverage rewrite

So coverage can write each problem **B-ready in one pass**, every problem entry should carry:

1. **`methods[]` with verified-equal SQL.** The expensive, easy-to-skip part is *running every method against the seed and diffing*. The rewrite needs a small harness (extend `scripts/audit_sql_lab.py`) that, per problem, executes each `methods[].sql` and asserts identical output to `solution` — a method that silently diverges is worse than no method. Budget this as a required pre-commit check, same tier as the apostrophe/brace audits.
2. **Per-method `detectionSignature` (regex over normalized SQL), authored against that problem's option set.** Signatures are local, not global — they only need to separate *that problem's* 2–4 methods. Don't build a universal SQL classifier; it's unnecessary and brittle.
3. **A sparse `dial`, not a full matrix.** Author only the cells where the recommended method changes (≈8–12 for a method-rich problem, far fewer for a single-method one). Single-method problems (most Easy) carry an empty/degenerate dial — and that's a signal in itself: **if a problem has only one reasonable method, it has no judgment layer and shouldn't fake one.** The dial's emptiness tells coverage which problems are recall/fluency-only.
4. **`mcqs[]` that cite cost, not verdicts** — each pinned to a specific dial cell so the MCQ and the dial can't drift apart. Reuse the existing debrief's "wrong answer that runs" material as MCQ distractors.
5. **`isTrap` shared with the Forensic tier.** A trap method *is* a Forensic bug. Tagging it once lets a single authored method feed both the judgment dial and a Forensic problem — the rewrite should treat them as one concept, not duplicate the work.
6. **Difficulty gates how much of this is required.** Easy = `solution` + maybe one alt method, empty dial. Medium = 2–3 methods + a small dial. Hard/Master = full methods + dial + MCQs. This keeps the rewrite tractable: the heavy judgment authoring concentrates on the ~45 Hard/Master problems, not all 182.

**Net:** the schema is additive and back-compatible, the costly new artifact is *verified multi-method SQL*, and the dial's sparsity doubles as a classifier for which problems even have a judgment layer. Coverage should adopt `methods[] / dial / mcqs / canonicalMethodId / isTrap` as the standard B-ready shape and gate the depth of authoring by difficulty.

---

## PROPOSED PUSH — prepared, NOT executed (blocked, see git flag)

One doc to add: `docs/JUDGMENT-LAYER-SPIKE.md` (+ spine updates `NEXT.md`, `LINEAGE.md`). The commit is docs-only — no `src/` change, so no build/audit scripts needed. **Not pushed — blocked on the git situation below; Sidharth resolves first.**

```bash
# After the git situation is resolved (token rotated, single working copy confirmed):
rm -f .git/index.lock .git/HEAD.lock
git clone https://github.com/SidharthKriplani/product-analytics-lab /tmp/pal-push-spike
SRC="<the canonical working copy>"   # MUST be confirmed first — see flag
cp "$SRC/docs/JUDGMENT-LAYER-SPIKE.md" /tmp/pal-push-spike/docs/JUDGMENT-LAYER-SPIKE.md
cp "$SRC/NEXT.md"    /tmp/pal-push-spike/NEXT.md
cp "$SRC/LINEAGE.md" /tmp/pal-push-spike/LINEAGE.md
cd /tmp/pal-push-spike
git config user.email "claudesubscription12@gmail.com"
git config user.name "Avinash"
git add -A
git commit -m "docs: judgment-layer schema spike (latest-order-per-customer), propose-only"
git push origin main
```

### ⛔ Git situation — flagged, stopped (do not push until resolved)

Two unresolved problems make an automated push unsafe right now:

1. **Exposed credential.** `origin`'s URL in `.git/config` has a **live GitHub Personal Access Token embedded in plaintext** (`https://SidharthKriplani:ghp_…@github.com/…`). Any clone, log, or screen-share of this repo leaks a working push credential. **Action: rotate that PAT now** (GitHub → Settings → Developer settings → revoke the `ghp_…` token), then set the remote back to a clean `https://github.com/SidharthKriplani/product-analytics-lab.git` and authenticate via a credential helper or SSH — never an inline token.
2. **Two working copies / inconsistent identity.** The repo exists at (at least) two on-disk paths — the mounted `Professional/BreakLabs/labs/product-analytics-lab` and the `SRC` referenced in CLAUDE.md, `Professional/GitHub/upskill platforms (4)/product-analytics-lab` — and CLAUDE.md's 5-line summary still names the remote `experimentation-systems-lab` while the actual push remote is `product-analytics-lab`. Pushing from the wrong copy risks committing stale files or clobbering newer work. **Action: confirm which copy is canonical, reconcile or delete the other, and fix the repo name in CLAUDE.md** before any push.

Per the approve-first / never-auto-push rule, this session **stops here**. Nothing was pushed. The doc is written to the mounted working copy only.
