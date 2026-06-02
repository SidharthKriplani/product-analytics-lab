# SQL Lab — Quality Audit

Single source of truth for problem scores. One row per problem. Updated after every batch.
Rubric: 7 dimensions, 1–5 each, max 35. Flag threshold: any dimension < 3, or total < 20.
Full rubric + process in SQL_LAB_PLAN.md Section 8.

**Legend:** BF=Business Framing · CA=Company Authenticity · DC=Difficulty Calibration · DR=Data Challenge Realism · Di=Distinctiveness · IQ=Insight Quality · TC=Trade-off Clarity

---

## Batch 1 — Easy e01–e10 (Calibration batch)
**Status:** ✅ Complete | **Audited:** 2026-06-02 | **Flagged:** 2 | **Rewritten:** 2

| ID | Title | Company | BF | CA | DC | DR | Di | IQ | TC | Total | Approaches | Technique | Pattern | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| e01 | Re-engagement Targets | Amazon | 4 | 3 | 5 | 5 | 4 | 4 | 4 | 29 | 2 | anti-join (LEFT JOIN IS NULL) | re-engagement targeting | ✅ Pass |
| e02 | Session Conversion by Source | Shopify | 5 | 4 | 5 | 4 | 5 | 5 | 3 | 31 | 2 | GROUP BY + rate calc | conversion analysis | ✅ Pass |
| e03 | Free-Plan Accounts for Upsell | Salesforce | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 27 | 1 | 3-table JOIN + filter | upsell targeting | ✅ Pass |
| e04 | Active MRR by Account | HubSpot | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 27 | 1 | JOIN + status filter | revenue reporting | ✅ Pass |
| e05 | High-Risk Account Exposure | Stripe | 4 | 4 | 5 | 4 | 3 | 4 | 3 | 27 | 2 | JOIN + filter (risk on user not account) | risk audit | ✅ Pass |
| e06 | Open Dispute Queue | PayPal | 4 | 4 | 5 | 5 | 4 | 3 | 3 | 28 | 1 | IS NULL filter | compliance queue | ✅ Pass |
| e07 | Repeat Launchers (rewritten) | TikTok | 5 | 4 | 5 | 4 | 5 | 4 | 4 | 31 | 2 | HAVING + GROUP BY | retention segmentation | ✅ Rewritten |
| e08 | Top-Performing Content | YouTube | 4 | 4 | 5 | 3 | 4 | 4 | 3 | 27 | 2 | GROUP BY + LIMIT 1 | top-N ranking | ✅ Pass |
| e09 | Provider No-Show Rate | Zocdoc | 5 | 5 | 4 | 5 | 5 | 5 | 4 | 33 | 2 | JOIN + rate calc + LIMIT 1 | operational metrics | ✅ Pass |
| e10 | Geographic Patient Reach (rewritten) | Optum | 4 | 4 | 4 | 5 | 5 | 4 | 4 | 30 | 2 | COUNT DISTINCT + 3-table JOIN | network analytics | ✅ Rewritten |

### Batch 1 findings

**Flagged and rewritten:**
- **e07** (was "Disengaged Users") — Distinctiveness = 2. Structurally identical to e01: same anti-join LEFT JOIN IS NULL pattern, same zero-activity framing, different table names. Debrief even acknowledged "the SQL structure is identical." Replaced with "Repeat Launchers" — teaches HAVING clause (filters on aggregated counts), a genuinely different and important concept.
- **e10** (was "Most Prescribed Drug") — Distinctiveness = 2. Structurally identical to e08: GROUP BY + COUNT + ORDER BY DESC + LIMIT 1 on a different table. No meaningful SQL differentiation. Replaced with "Geographic Patient Reach" — teaches COUNT(DISTINCT) across a 3-table JOIN, introducing both a new aggregate function and a bridge-table join pattern.

**Rubric calibration notes (Batch 1 only):**
- Company authenticity is partially constrained by shared datamarts. Score reflects "does the problem feel specific to this company's domain" not "does the schema match exactly." Amazon/Shopify both use ecomm datamart — authenticity should be judged by the business framing, not schema ownership.
- e03/e04/e05 cluster: three consecutive JOIN+filter problems on the saas/fintech datamarts. Each passes Distinctiveness individually (different tables, different traps) but the pattern proximity is a concern to watch across batches. Consider a cross-batch distinctiveness pass after Batch 3.
- Approach count = 1 is acceptable for Easy problems where a single clean approach is the lesson. Flag only at Medium+.

---

## Batch 2 — Easy e11–e20 (file positions 11–20)
**Status:** ✅ Complete | **Audited:** 2026-06-02 | **Flagged:** 7 | **Rewritten:** 7

| ID | Title | Company | BF | CA | DC | DR | Di | IQ | TC | Total | Approaches | Technique | Pattern | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| e11 | Products That Never Sold | eBay | 4 | 4 | 5 | 4 | 3 | 3 | 3 | 26 | 2 | anti-join | inventory audit | ✅ Pass (3rd anti-join noted) |
| e12 | Users Who Never Logged In | Mixpanel | 4 | 4 | 5 | 5 | 3 | 3 | 3 | 27 | 1 | IS NULL + JOIN | user activation | ✅ Pass |
| e13 (was h16) | Total Medication Coverage Days | CVS Health | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 27 | 1 | computed aggregate arithmetic | adherence tracking | ✅ ID bug fixed (sql-h16 → sql-e13), company fixed (Doximity → CVS Health) |
| e20 | High-Adoption Accounts (rewritten) | Salesforce | 5 | 4 | 5 | 4 | 5 | 4 | 4 | 31 | 2 | HAVING + JOIN | adoption segmentation | ✅ Rewritten (was trivial WHERE industry='tech') |
| e23 | Fast-Track Users with Balance (rewritten) | Stripe | 5 | 5 | 5 | 4 | 4 | 4 | 4 | 31 | 2 | JOIN + multi-condition WHERE | compliance targeting | ✅ Rewritten (added JOIN + account status filter) |
| e26 | Average Spend by Category (rewritten) | Brex | 4 | 5 | 5 | 4 | 5 | 4 | 4 | 31 | 1 | GROUP BY + AVG + ROUND | spend baseline | ✅ Rewritten (was duplicate of e06) |
| e29 | Open Capacity by Clinic (rewritten) | Oscar Health | 4 | 4 | 5 | 4 | 5 | 4 | 4 | 30 | 2 | WHERE + GROUP BY + COUNT | capacity planning | ✅ Rewritten (was trivial boolean WHERE) |
| e32 | May Clinic Appointments (rewritten) | Kaiser Permanente | 4 | 5 | 5 | 4 | 5 | 4 | 4 | 31 | 3 | BETWEEN date filter | audit / ops | ✅ Rewritten (was COUNT cluster duplicate) |
| e33 | Transactions by Category | Mastercard | 3 | 4 | 5 | 2 | 3 | 4 | 2 | 23 | 1 | GROUP BY + COUNT | volume analysis | ✅ Pass (kept — best insight in COUNT cluster) |
| e34 | Premium Breakdown by Country (rewritten) | LinkedIn | 5 | 4 | 5 | 4 | 5 | 4 | 4 | 31 | 1 | multi-column GROUP BY | growth segmentation | ✅ Rewritten (was COUNT cluster duplicate) |

### Batch 2 findings

**7/10 flagged and rewritten** — weakest batch so far. Three categories of issues:

**Too-simple WHERE-only problems (e20, e29):** Single-table, single-condition filters with no joins, no aggregation, no data challenge. These are tutorial-level SQL, not interview-level. Both rewritten with JOIN + aggregation (HAVING + GROUP BY).

**Literal duplicate (e26):** "Open Dispute Queue" on the Visa / fintech datamart was identical to e06 (PayPal / fintech disputes table, WHERE resolved_at IS NULL). Same table, same SQL, different company tag. Replaced with AVG spend by category — introduces the AVG aggregate function for the first time in the Easy tier.

**COUNT cluster (e32, e33, e34):** Three consecutive GROUP BY + COUNT(*) problems with no data challenge and near-zero distinctiveness from each other and from e08. Kept e33 (best insight — flagged merchant distortion is a real analytical pitfall). Replaced e32 with BETWEEN date filtering and e34 with multi-column GROUP BY — both new patterns not yet seen in Easy.

**ID bug (h16 → e13):** Problem had id 'sql-h16' but difficulty 'Easy' and estimatedMin 13. Mislabeled from an earlier classification session. ID corrected to 'sql-e13', company corrected from Doximity to CVS Health (pharmacy analytics, not physician networking).

**Cross-batch pattern concern:** After 20 problems, anti-join (LEFT JOIN IS NULL) has now appeared 3 times (e01, e07-rewritten-to-HAVING, e11). e11 is distinct enough to keep but no more anti-joins should be added to Easy tier — the pattern is covered.

---

## Batch 3 — Easy e21–e30 (file positions 21–30: e35–e51)
**Status:** ✅ Complete | **Audited:** 2026-06-02 | **Flagged:** 6 | **Rewritten:** 4 + 2 debrief upgrades

| ID | Title | Company | BF | CA | DC | DR | Di | IQ | TC | Total | Approaches | Technique | Pattern | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| e35 | Revenue by Product Category (rewritten) | Shopify | 5 | 4 | 5 | 4 | 5 | 4 | 4 | 31 | 2 | SUM(computed) + JOIN | revenue by segment | ✅ Rewritten (was COUNT cluster) |
| e36 | Top 3 Most Expensive Products | Best Buy | 4 | 4 | 5 | 3 | 3 | 3 | 3 | 25 | 2 | ORDER BY + LIMIT N | top-N ranking | ✅ Pass |
| e37 | Events per Account | Mixpanel | 4 | 4 | 5 | 4 | 3 | 4 | 4 | 28 | 2 | GROUP BY + COUNT (zeros trap) | engagement ranking | ✅ Pass |
| e39 | Repeat Buyers | Amazon | 5 | 5 | 5 | 4 | 3 | 4 | 3 | 29 | 1 | HAVING (purest form) | retention segmentation | ✅ Pass |
| e40 | Total Balance per User (rewritten) | Plaid | 5 | 5 | 5 | 4 | 5 | 4 | 4 | 32 | 2 | SUM + JOIN + WHERE filter | wealth aggregation | ✅ Rewritten (was COUNT clone on overused health datamart) |
| e42 | Large Account Plan Distribution (rewritten) | Slack | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 32 | 2 | 3-table JOIN + multi-condition WHERE | expansion revenue | ✅ Rewritten (was trivial WHERE >= only) |
| e44 | Premium Rate by Device OS (rewritten) | Spotify | 5 | 4 | 5 | 4 | 4 | 4 | 4 | 30 | 2 | SUM(binary)/COUNT rate + GROUP BY | platform monetization | ✅ Rewritten (was COUNT cluster) |
| e47 | Churned Subscription Log | Zendesk | 4 | 4 | 3 | 3 | 3 | 5 | 4 | 26 | 2 | WHERE filter (LEFT JOIN + NOT EXISTS alternatives) | churn analysis | ✅ Debrief upgraded (TC 2→4) |
| e49 | Avg Session Duration by Source | Shopify | 4 | 4 | 5 | 3 | 4 | 4 | 4 | 28 | 2 | AVG + GROUP BY (median alternative) | channel quality | ✅ Debrief upgraded (TC 2→4) |
| e51 | Distinct Buyers Count | Etsy | 4 | 4 | 5 | 5 | 4 | 4 | 4 | 30 | 1 | COUNT(DISTINCT) — scalar | buyer activation | ✅ Pass |

### Batch 3 findings

**4 rewrites + 2 debrief upgrades** — improving batch over batch (B1: 2, B2: 7, B3: 6 but fewer full rewrites).

**COUNT cluster continues (e35, e44):** Two more GROUP BY + COUNT(*) problems on single tables with no data challenges. e35 replaced with SUM over computed JOIN (revenue by category — first time this skill appears). e44 replaced with premium rate by device OS (rate calculation, same SUM/COUNT pattern as e02 but on a different dimension and datamart).

**Too-simple numeric WHERE (e42):** Same issue as e20/e29 in Batch 2. Single table, single threshold filter (employee_count >= 100). Replaced with 3-table JOIN + multi-condition WHERE — shows exactly which large accounts have expansion headroom.

**Health datamart overuse (e40):** Four health datamart problems in first 40 Easy problems (e09, e13, e29, e32). e40 was a 5th. Replaced with fintech/Plaid — SUM of balances per user across active accounts. Introduces SUM (distinct from COUNT and AVG) in a JOIN context.

**Debrief-only upgrades (e47, e49):** Both had TC=2 — good SQL, good insight, but no alternative approaches. e47 now documents LEFT JOIN vs. NOT EXISTS for true churn detection. e49 now documents AVG vs. PERCENTILE_CONT(0.5) median, with a note on which SQL environments support each.

---

## Batch 4 — Easy e31–e40 (file positions 31–40: e52–e65)
**Status:** ✅ Complete | **Audited:** 2026-06-02 | **Flagged:** 6 | **Rewritten:** 4 + 2 targeted fixes

| ID | Title | Company | BF | CA | DC | DR | Di | IQ | TC | Total | Approaches | Technique | Pattern | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| e52 | US Customer Orders | Amazon | 5 | 5 | 5 | 4 | 4 | 4 | 3 | 30 | 2 | JOIN + WHERE filter | market segmentation | ✅ checkValues bug fixed |
| e54 | Referred Consumer Users | Dropbox | 4 | 4 | 5 | 3 | 3 | 4 | 3 | 26 | 1 | IS NOT NULL filter | referral analytics | ✅ Pass |
| e55 | User Activity Report with NULL Fill (rewritten) | Intercom | 4 | 4 | 5 | 4 | 5 | 4 | 4 | 30 | 2 | COALESCE | NULL display handling | ✅ Rewritten (5th IS NULL → COALESCE, new skill) |
| e56 | Transactions at Non-US Merchants | JPMorgan | 5 | 5 | 5 | 4 | 4 | 4 | 4 | 31 | 2 | JOIN + WHERE != (P2P NULL gap) | cross-border compliance | ✅ TC debrief upgraded (NULL P2P exclusion documented) |
| e57 | UK and Canadian Market Orders (rewritten) | Shopify | 5 | 4 | 5 | 4 | 5 | 4 | 4 | 31 | 2 | WHERE IN + JOIN | market segmentation | ✅ Rewritten (clone of e11 anti-join → IN clause, new skill) |
| e58 | Power Users by Login Frequency (rewritten) | HubSpot | 5 | 4 | 5 | 4 | 4 | 4 | 4 | 30 | 2 | WHERE + GROUP BY + HAVING + JOIN | engagement segmentation | ✅ Rewritten (5th anti-join → WHERE+HAVING+JOIN combination) |
| e59 | High-Intent Engagement Signals (rewritten) | Pinterest | 5 | 4 | 5 | 4 | 5 | 4 | 4 | 31 | 2 | WHERE IN + GROUP BY + COUNT | engagement analysis | ✅ Rewritten (6th anti-join, Di=1 → IN literal list, new skill) |
| e60 | MRR by Plan Tier (rewritten) | Baremetrics | 5 | 5 | 5 | 4 | 5 | 4 | 4 | 32 | 2 | SUM + COUNT dual aggregate + JOIN | SaaS revenue analytics | ✅ Rewritten (COUNT cluster → dual aggregate in one GROUP BY, new pattern) |
| e62 | Converted Sessions by Source | Google | 5 | 4 | 5 | 4 | 4 | 5 | 3 | 30 | 2 | SUM(binary) + COUNT GROUP BY | conversion analytics | ✅ Pass |
| e65 | Total MRR from Active Subscriptions | ChartMogul | 4 | 5 | 5 | 4 | 4 | 4 | 3 | 29 | 1 | SUM scalar (no GROUP BY) | SaaS finance | ✅ Pass |

### Batch 4 findings

**Anti-join overload resolved.** e57 (clone of e11), e58 (5th anti-join), e59 (6th anti-join, Di=1) all replaced. Easy tier now has exactly 2 anti-join problems (e01, e11) — the right coverage for one concept.

**New skills introduced this batch:** COALESCE for NULL display handling (e55), WHERE IN with literal list (e57, e59), dual aggregate (SUM + COUNT) in one GROUP BY (e60).

**Remaining skills coverage after 40 problems:** anti-join, HAVING, COUNT DISTINCT, BETWEEN, multi-column GROUP BY, AVG, SUM(computed), SUM(binary) rate, 3-table JOIN, COALESCE, IN literal, dual aggregate, scalar SUM all covered at least once in Easy tier.

**Cross-batch note:** e52 had empty checkValues[] — a data verification gap. Fixed. e56 TC upgraded with P2P NULL exclusion insight (JOIN silently drops P2P transactions where merchant_id IS NULL).

---

## Batch 5 — Easy e41–e50 (file positions 41–50: e67–e86)
**Status:** ✅ Complete | **Audited:** 2026-06-02 | **Flagged:** 6 | **Rewritten:** 3 + 2 debrief upgrades + 1 reclassification + 1 company fix

| ID | Title | Company | BF | CA | DC | DR | Di | IQ | TC | Total | Approaches | Technique | Pattern | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| e67 | Patients 50 or Older | Humana | 4 | 4 | 5 | 4 | 4 | 3 | 4 | 28 | 1 | WHERE age range filter | patient segmentation | ✅ Pass |
| e68 | Content by Premium Creators | Patreon | 4 | 5 | 5 | 4 | 3 | 3 | 3 | 27 | 1 | JOIN + WHERE filter | creator analytics | ✅ Pass |
| e69 | Net Revenue on Discounted Orders (rewritten) | Nordstrom | 5 | 4 | 5 | 4 | 5 | 4 | 4 | 31 | 2 | arithmetic in SELECT + multi-condition WHERE | promotions analysis | ✅ Rewritten (was trivial WHERE subtotal > 100, DC=2) |
| e70 | Active FX Exposure by Currency (rewritten) | Revolut | 5 | 5 | 5 | 4 | 5 | 4 | 4 | 32 | 2 | dual aggregate COUNT+SUM + WHERE pre-filter | FX hedging | ✅ Rewritten (was single-aggregate COUNT cluster, DR=2) |
| e72 | Appointments Without Diagnoses | Athenahealth | 5 | 5 | 5 | 5 | 3 | 5 | 4 | 32 | 2 | LEFT JOIN IS NULL anti-join (medical context) | clinical quality | ✅ Pass (best in batch) |
| e74 | Order Status Summary (rewritten) | ASOS | 4 | 4 | 5 | 3 | 5 | 4 | 4 | 29 | 2 | triple aggregate COUNT+SUM+AVG in one GROUP BY | finance reporting | ✅ Rewritten (was clone of e08, Di=2, TC=2) |
| e77 | Diagnoses per Provider | Athenahealth | 4 | 3 | 5 | 4 | 3 | 4 | 4 | 27 | 2 | JOIN + GROUP BY + COUNT (clinical productivity) | provider productivity | ✅ Pass + company fix (Doximity → Athenahealth) + debrief upgraded |
| e78 | Revenue by Acquisition Channel | Klaviyo | 4 | 4 | 5 | 4 | 4 | 4 | 4 | 29 | 2 | SUM + JOIN + GROUP BY channel | channel analytics | ✅ Debrief upgraded (TC 2→4: subquery approach + LEFT JOIN zero-order variant) |
| e81 | Total Disputed Exposure | Stripe | 4 | 5 | 5 | 3 | 3 | 4 | 4 | 28 | 2 | SUM scalar + WHERE filter | compliance reporting | ✅ Debrief upgraded (TC 2→4: conditional aggregation approach for resolved vs. unresolved split) |
| e86 | Level Engagement Percentile | Zynga | 5 | 5 | 1 | 5 | 5 | 5 | 4 | 30 | 2 | PERCENT_RANK() window fn + CTE | percentile ranking | ✅ Reclassified Easy→Medium (DC=1: window fn + CTE is Medium by market rubric) |

### Batch 5 findings

**6/10 flagged.** Improving trend (B1:2, B2:7, B3:6, B4:6, B5:6 flagged). Three full rewrites + 2 debrief upgrades + 1 difficulty reclassification + 1 company tag fix.

**Too-simple single-aggregate (e69, e70):** e69 was `WHERE subtotal > 100` on one table — a single range filter with no join, no aggregation, DC=2. Replaced with "Net Revenue on Discounted Orders" — arithmetic in SELECT (subtotal − discount as effective_price) plus two WHERE conditions (status = 'completed' AND discount > 0), teaching computed column derivation. e70 was `COUNT(*) GROUP BY currency` on one table, DR=2. Replaced with "Active FX Exposure by Currency" — dual aggregate (COUNT + SUM) with WHERE pre-filter, giving both account volume and dollar exposure in one query.

**Clone of e08 (e74):** "Interactions per Content Item" was `COUNT(*) GROUP BY content_id ORDER BY interaction_count DESC` — structurally identical to e08 "Top-Performing Content." Replaced with "Order Status Summary" (ASOS) — triple aggregate (COUNT + SUM + AVG) in a single GROUP BY, the standard finance analyst deliverable format.

**Company authenticity fix (e77):** Doximity is physician networking software — not the right company for a clinical diagnosis-counting query. Fixed to Athenahealth (EHR system). Note: e72 is also Athenahealth, which creates two Athenahealth problems in this batch. Both are clinically authentic and structurally distinct (anti-join vs. GROUP BY+COUNT). Acceptable given domain specificity.

**Debrief-only upgrades (e78, e81):** Both had TC=2. e78 now documents both the JOIN approach and the subquery approach, plus a LEFT JOIN variant for including zero-order channels. e81 now documents the conditional aggregation approach (SUM(CASE WHEN resolved_at IS NULL THEN amount END)) to split disputed exposure into resolved vs. unresolved in a single pass.

**Reclassification (e86):** "Level Engagement Percentile" uses PERCENT_RANK() over a CTE — unambiguously Medium by the market rubric (any window function = Medium). DC=1. Reclassified to Medium; it now joins the Medium tier pool and will be scored in a Medium batch audit.

---

## Batch 6 — Medium m01–m10 (file positions 1–10: m01, m04, m07, m09, m10, m13, m14, m16, m17, m20)
**Status:** ✅ Complete | **Audited:** 2026-06-02 | **Flagged:** 4 | **Rewritten:** 3 + 1 checkValues fix

| ID | Title | Company | BF | CA | DC | DR | Di | IQ | TC | Total | Approaches | Technique | Pattern | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| m01 | Detect Account Upgrades | Gainsight | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 32 | 2 | LAG() + CTE + multi-JOIN | expansion revenue detection | ✅ Pass |
| m04 | H1 vs H2 Order Volume | Wayfair | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 27 | 2 | conditional aggregation + strftime pivot | period comparison | ✅ Pass |
| m07 | Days to First Engagement (rewritten) | Pinterest | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 32 | 2 | CTE + MIN + JULIANDAY date arithmetic | activation analytics | ✅ Rewritten (was anti-join, Di=2 — pattern overused from Easy) |
| m09 | Month-over-Month Order Volume (rewritten) | Instacart | 5 | 4 | 5 | 4 | 5 | 4 | 4 | 31 | 2 | CTE + strftime + LAG window function | time series / MoM | ✅ Rewritten (was Easy-level strftime GROUP BY only, DC=2 DR=2) |
| m10 | Accounts with High Inactivity Rate | Amplitude | 5 | 5 | 5 | 5 | 4 | 5 | 4 | 33 | 2 | conditional aggregation + HAVING on rate | at-risk account detection | ✅ Pass (best in batch) |
| m13 | Latest Transaction Per Account | Stripe | 4 | 5 | 5 | 3 | 4 | 5 | 4 | 30 | 2 | ROW_NUMBER() + CTE deduplication | last-N-per-group | ✅ checkValues bug fixed (was empty []) |
| m14 | Content Rank Within Category (rewritten) | Netflix | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 32 | 2 | DENSE_RANK() OVER (PARTITION BY category) + CTE | per-category ranking | ✅ Rewritten (was 3rd conditional aggregation in batch, Di=2) |
| m16 | Running Spend Per User | Shopify | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 32 | 2 | SUM() OVER (PARTITION BY ORDER BY) running total | cumulative spend | ✅ Pass |
| m17 | Above-Average Enterprise Accounts | HubSpot | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 27 | 2 | correlated subquery + AVG per group | above-average pattern | ✅ Pass |
| m20 | Top Products by Volume | Amazon | 4 | 4 | 4 | 3 | 3 | 5 | 4 | 27 | 2 | RANK() + 2-CTE pipeline | top-N with ties | ✅ Pass |

### Batch 6 findings

**4/10 flagged** — lower flag rate than Easy batches. Medium problems generally better differentiated; the two full rewrites were clear-cut.

**Anti-join again (m07):** Medium tier opened with the same pattern family we spent 4 Easy rewrites eliminating (LEFT JOIN IS NULL / NOT IN). m07 was NOT IN with a correlated JOIN inside the subquery — legitimately more complex than Easy anti-joins, but Di=2 when the conceptual pattern is "find users with no X." Replaced with "Days to First Engagement" (Pinterest) — introduces JULIANDAY date arithmetic, a new pattern not yet seen anywhere in the audit. CTE + MIN + JULIANDAY is genuinely Medium: requires knowing how to materialize an intermediate result and how to do date arithmetic in SQLite.

**Easy-level SQL mislabeled Medium (m09):** strftime GROUP BY ORDER BY is Easy. The only distinguishing feature from e32 (BETWEEN date filter), e34 (multi-column GROUP BY), or e49 (AVG + GROUP BY) was the date format function. Replaced with "Month-over-Month Order Volume" — strftime GROUP BY in a CTE + LAG() OVER for MoM change. Now genuinely Medium: requires composing two distinct SQL concepts (date aggregation + window function) where neither alone answers the question.

**Conditional aggregation cluster (m14):** m04 (time pivot), m10 (NULL rate), m14 (action pivot) — three conditional aggregation problems in one batch of 10. Same pattern-clustering issue as COUNT(*) in Easy Batch 2. m14 replaced with "Content Rank Within Category" (Netflix) — DENSE_RANK() OVER (PARTITION BY category). This completes the window function coverage for Batch 6: LAG (m01), SUM OVER (m16), RANK (m20), ROW_NUMBER (m13), and now DENSE_RANK with PARTITION BY (m14). Five distinct window functions covered.

**checkValues bug (m13):** Same class of issue as e52 in Batch 4. Empty checkValues means users cannot verify their answer. Fixed: account_id=1's latest transaction is txn 38 ($88.00, 2024-04-18).

**Medium tier pattern coverage after Batch 6:** LAG, SUM OVER, RANK, DENSE_RANK (PARTITION BY), ROW_NUMBER, correlated subquery, conditional aggregation (×2), CTE + date arithmetic (JULIANDAY), CTE + LAG MoM — all covered at least once.

---

## Batch 7 — Medium m11–m20 (file positions 11–20: m21, m23, m24, m25, m26, m28, m29, m30, m32, m33)
**Status:** ✅ Complete | **Audited:** 2026-06-02 | **Flagged:** 7 | **Rewritten:** 3 + 3 checkValues fixes + 1 company fix + 2 debrief upgrades

| ID | Title | Company | BF | CA | DC | DR | Di | IQ | TC | Total | Approaches | Technique | Pattern | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| m21 | User Engagement Quartile Segmentation (rewritten) | TikTok | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 32 | 2 | CTE + LEFT JOIN + NTILE(4) global window | engagement segmentation | ✅ Rewritten (was ROW_NUMBER clone of m13, Di=2) |
| m23 | Accounts with Mixed Transaction Outcomes | Robinhood | 4 | 4 | 4 | 3 | 4 | 4 | 3 | 26 | 2 | double EXISTS (AND EXISTS × 2) | compound existence check | ✅ Pass |
| m24 | MRR Rank Within Industry | Salesforce | 4 | 4 | 4 | 3 | 3 | 4 | 4 | 26 | 2 | RANK() OVER (PARTITION BY industry) + JOIN | per-group ranking | ✅ checkValues fixed + company fix (Gainsight→Salesforce, dup with m01) |
| m25 | Broadly Purchased Products | Shopify | 5 | 4 | 3 | 4 | 3 | 4 | 3 | 26 | 1 | COUNT(DISTINCT user_id) + HAVING + JOIN | broad-appeal detection | ✅ Pass |
| m26 | Session Gap Analysis | Amplitude | 5 | 3 | 5 | 3 | 3 | 4 | 3 | 26 | 2 | LAG + JULIANDAY inter-session gap | churn risk / re-engagement | ✅ checkValues fixed (user 1 session gap = 73 days) |
| m28 | Creator Engagement vs Platform Benchmark (rewritten) | YouTube | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 32 | 2 | CTE + AVG() OVER () global window | benchmark comparison | ✅ Rewritten (was RANK clone of m20, Di=2) |
| m29 | Next User Event | Amplitude | 4 | 3 | 4 | 3 | 4 | 4 | 3 | 25 | 2 | LEAD() OVER (PARTITION BY) | event sequencing | ✅ checkValues fixed (event 1 next_event = 2024-01-08) |
| m30 | Spend Share by Category (rewritten) | Brex | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 32 | 2 | SUM(SUM()) OVER () global window + GROUP BY | percentage of total | ✅ Rewritten (was AVG OVER near-clone of m16, Di=2) |
| m32 | First Transaction Benchmark | Stripe | 4 | 5 | 4 | 3 | 4 | 4 | 4 | 28 | 2 | FIRST_VALUE() OVER (PARTITION BY) | spend trajectory benchmark | ✅ Debrief upgraded (IQ+TC: was 2 sentences, now full treatment) |
| m33 | Completed Order Detail View | Amazon | 4 | 4 | 3 | 3 | 3 | 4 | 4 | 25 | 2 | 4-table JOIN chain + WHERE filter | line-item inventory view | ✅ Debrief upgraded (TC: CTE chain alt, missing-filter failure mode) |

### Batch 7 findings

**7/10 flagged — worst batch since Easy Batch 2.** Three structural clones + three missing checkValues + one company duplicate.

**Structural clones (m21, m28, m30):** All three had Di=2 because they used the same SQL pattern as an earlier problem on the same or identical table:
- m21 (ROW_NUMBER first-per-group) was identical in structure to m13 (latest-per-group) — same PARTITION BY/ORDER BY/WHERE rn=1 pattern, opposite sort direction. Replaced with NTILE(4) engagement quartile segmentation — introduces NTILE, LEFT JOIN for zero-count inclusion, and the mechanical row-splitting behavior that distinguishes NTILE from value-based bucketing.
- m28 (RANK top-3 creators) was identical in structure to m20 (RANK top-3 products) — same 2-CTE aggregate-then-rank-then-filter pipeline. Replaced with Creator Engagement vs Platform Benchmark — introduces AVG() OVER () with no PARTITION BY (global window), a distinct pattern used to compare each row against a grand aggregate.
- m30 (AVG OVER cumulative per user on orders) was a near-clone of m16 (SUM OVER cumulative per user on orders) — same table, same PARTITION BY, same ORDER BY. Replaced with Spend Share by Category — introduces SUM(SUM()) OVER (), the nested aggregate-in-window pattern for percentage-of-total calculations.

**Missing checkValues (m24, m26, m29):** Same class of bug as m13 (Batch 6) and e52 (Batch 4). Fixed: m24 (Echo Tech, Enterprise 2999, tech rank 1), m26 (user 1 session gap 73 days, 2023-02-01→2023-04-15), m29 (event 1, user 1 login, next event 2024-01-08).

**Company duplicate (m24):** Gainsight already appeared in m01 (Batch 6). Changed to Salesforce — also a B2B CRM/SaaS platform where per-industry account MRR ranking is a natural CS use case.

**Thin debriefs (m32, m33):** m32 had a 2-sentence debrief with no weak answer, no alternative, no follow-up. m33 had no alternatives and no failure-mode explanation. Both upgraded to full treatment.

**Medium tier new patterns introduced this batch:** NTILE(4) engagement bucketing, global AVG() OVER () benchmark comparison, SUM(SUM()) OVER () percentage-of-total, FIRST_VALUE() spend anchor, double EXISTS compound check, LEAD() event sequencing.

---

## Batch 8 — Medium m21–m30 (file positions 21–30: m36, m37, m39, m41, m42, m43, m47, m56, m57, m61)
**Status:** ✅ Complete | **Audited:** 2026-06-02 | **Flagged:** 6 | **Rewritten:** 3 + 1 dual-metric upgrade + 1 solution bug fix + 1 checkValues fix + 2 debrief upgrades

| ID | Title | Company | BF | CA | DC | DR | Di | IQ | TC | Total | Approaches | Technique | Pattern | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| m36 | Returned Then Re-Purchased Customers | Zalando | 5 | 4 | 4 | 3 | 4 | 4 | 4 | 32 | 2 | self-join (orders × 2) + temporal ordering | customer recovery detection | ✅ Solution bug fixed (temporal ordering missing — user 12 was false positive) + debrief upgraded |
| m37 | Channel Session Conversion Rate (rewritten) | Shopify | 5 | 4 | 4 | 4 | 5 | 5 | 4 | 31 | 2 | JOIN + GROUP BY + SUM(binary) + rate calc | channel analytics | ✅ Rewritten (was Easy-level HAVING+SUM single table, DC=2 Di=2 total=19) |
| m39 | Account Event Date Range | Mixpanel | 4 | 4 | 5 | 4 | 5 | 5 | 4 | 31 | 2 | MIN/MAX OVER (no ORDER BY) = full-partition aggregate | account activity window | ✅ Pass (best in batch) |
| m41 | Transaction Size Buckets | PayPal | 5 | 4 | 3 | 3 | 4 | 5 | 4 | 28 | 2 | CASE WHEN value bucketing + GROUP BY 1 | fraud threshold calibration | ✅ Pass |
| m42 | Patient Age at Appointment | Teladoc | 5 | 4 | 4 | 4 | 3 | 5 | 4 | 29 | 2 | JULIANDAY/365.25 + CAST (age at visit) | clinical stratification | ✅ checkValues fixed (appt 1, patient F, age 38) |
| m43 | Interaction Breakdown with Total | YouTube | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 27 | 2 | UNION ALL to append summary row | QA verification reporting | ✅ Pass |
| m47 | Rolling 3-Order Average Spend (rewritten) | Shopify | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 32 | 2 | AVG OVER ROWS BETWEEN 2 PRECEDING AND CURRENT ROW | bounded rolling window | ✅ Rewritten (was LAG+JULIANDAY clone of m26, Di=2) |
| m56 | Complete Fitness Content Viewers (rewritten) | Spotify | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 32 | 2 | relational division (HAVING COUNT DISTINCT = scalar subquery) | complete-set matching | ✅ Rewritten (was IN subquery + DISTINCT, DC=3 DR=2 Di=2 TC=2) |
| m57 | Product Sales Rank (dual-metric upgrade) | Amazon | 4 | 4 | 5 | 4 | 4 | 5 | 4 | 30 | 2 | two DENSE_RANK() OVER with different ORDER BY | order vs revenue divergence | ✅ Upgraded (was single DENSE_RANK clone, Di=2 → Di=4 with dual ranking) |
| m61 | Content Engagement Diversity | TikTok | 5 | 4 | 3 | 3 | 4 | 4 | 4 | 27 | 2 | COUNT(DISTINCT action) + LEFT JOIN + GROUP BY | engagement diversity signal | ✅ Debrief upgraded (TC 2→4: INNER JOIN failure mode, COUNT DISTINCT vs COUNT, generalizability) |

### Batch 8 findings

**6/10 flagged.** Notable issues: one live solution bug, three clones, one mislabeled Easy problem, one thin problem.

**Solution bug (m36):** The self-join matched users with ANY returned order AND ANY completed order — but without temporal ordering, user 12 (completed Aug 2023, returned Apr 2024) was included as a "re-purchaser" when they had actually purchased, THEN returned. Fixed by adding `AND o2.created_at > o1.created_at` to enforce the correct temporal direction. expectedRowCount drops 3→2.

**Mislabeled Easy (m37):** HAVING + SUM on a single table with no JOIN — same SQL structure as Easy tier e20 (High-Adoption Accounts) and e39 (Repeat Buyers). DC=2, total=19 (below floor). Replaced with Channel Session Conversion Rate — JOIN sessions to users to get channel, GROUP BY channel, SUM(binary converted column) for conversions, 100.0 * SUM / COUNT for rate. Integer division trap embedded (100.0 prefix required). Introduces SUM of binary column as rate numerator pattern.

**LAG+JULIANDAY clone (m47):** Structurally identical to m26 (Session Gap Analysis): LAG(date) OVER (PARTITION BY user_id ORDER BY date) + JULIANDAY difference. Replaced with Rolling 3-Order Average — AVG() OVER with explicit ROWS BETWEEN 2 PRECEDING AND CURRENT ROW. First appearance of a bounded rolling window frame (not unbounded). The debrief explicitly contrasts ROWS vs RANGE on tied dates and unbounded vs bounded frames.

**Thin problem (m56):** WHERE IN (subquery) + DISTINCT outer query — no aggregation, no window function, thin debrief. DR=2, Di=2, TC=2. Replaced with relational division — users who engaged with ALL fitness content pieces. Uses GROUP BY + HAVING COUNT(DISTINCT content_id) = (SELECT COUNT(*) FROM content WHERE category = 'fitness'). Classic relational division pattern; the scalar subquery in HAVING automatically adjusts when new fitness content is added.

**Dual-metric upgrade (m57):** Single DENSE_RANK was the 3rd CTE+ranking problem. Upgraded to two DENSE_RANK() OVER calls with different ORDER BY (one by times_ordered, one by total_revenue). Introduces the "ranking divergence" pattern — most-ordered ≠ most-revenue-generating. Di 2→4. The debrief teaches when order_rank ≠ revenue_rank and what that reveals.

**New patterns this batch:** ROWS BETWEEN 2 PRECEDING AND CURRENT ROW (bounded rolling window), relational division (HAVING COUNT DISTINCT = scalar subquery), dual DENSE_RANK with different ORDER BY, MIN/MAX OVER without ORDER BY (full-partition aggregate), temporal ordering in self-join, UNION ALL summary row, CASE WHEN value bucketing.

---

## Batch 9 — Medium m31–m40 (file positions 31–40: h14, h22, h25, h27, h28, h39, h49, m76, m77, m78)
**Status:** ✅ Complete | **Audited:** 2026-06-02 | **Flagged:** 4 | **Rewritten:** 4

| ID | Title | Company | BF | CA | DC | DR | Di | IQ | TC | Total | Approaches | Technique | Pattern | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| h14 | Login-Then-Export Funnel Accounts (rewritten) | Amplitude | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 32 | 2 | 2-CTE + JOIN temporal ordering funnel | event sequence analysis | ✅ Rewritten (was double EXISTS clone of m23, Di=2) |
| h22 | Provider Appointment Completion Rate (rewritten) | Zocdoc | 5 | 4 | 4 | 4 | 5 | 5 | 4 | 31 | 2 | JOIN + SUM(CASE WHEN) + rate calc | operational scorecard | ✅ Rewritten (was HAVING+SUM single table, Di=2 TC=2 total=20) |
| h25 | Month-over-Month Revenue Growth (rewritten) | Amazon | 5 | 4 | 5 | 4 | 5 | 5 | 4 | 32 | 2 | CTE + strftime SUM + LAG growth rate | revenue analytics | ✅ Rewritten (was SUM OVER clone of m16, Di=1) |
| h27 | Account Transaction Activity Tier (rewritten) | JPMorgan Chase | 5 | 5 | 4 | 4 | 5 | 5 | 4 | 32 | 2 | CTE + LEFT JOIN COUNT + CASE WHEN tier | service routing segmentation | ✅ Rewritten (was NTILE clone of m21, Di=2) |
| h28 | Content Engagement Pivot | TikTok | 5 | 4 | 4 | 3 | 3 | 5 | 4 | 28 | 2 | SUM(CASE WHEN action=X) 5-column pivot | engagement mix analysis | ✅ Pass (first full multi-column pivot in audit) |
| h39 | Multi-Provider Patients | Doximity | 5 | 4 | 3 | 4 | 4 | 5 | 3 | 28 | 2 | COUNT(DISTINCT) + COUNT(*) + HAVING | medication reconciliation | ✅ Pass (prescriptions table confirmed) |
| h49 | User Engagement Recency | TikTok | 5 | 4 | 4 | 3 | 3 | 4 | 3 | 26 | 2 | CTE + MAX + JULIANDAY days-since-last | dormancy detection | ✅ Pass |
| m76 | Employee Salary Percentile | Workday | 5 | 5 | 4 | 4 | 4 | 5 | 4 | 31 | 2 | PERCENT_RANK() OVER + WHERE is_active | pay equity analytics | ✅ Pass (new function, new datamart hr_analytics) |
| m77 | Unique Buyer Reach per Seller | Etsy | 5 | 5 | 3 | 5 | 4 | 5 | 4 | 31 | 2 | COUNT(DISTINCT buyer_id) vs COUNT(*) | semantic error detection | ✅ Pass (live trap: seller 2 repeat buyer inflates COUNT(*)) |
| m78 | Courier Delivery Count — Debug | DoorDash | 5 | 5 | 3 | 5 | 4 | 5 | 4 | 31 | 2 | WHERE status='delivered' semantic bug fix | semantic error detection | ✅ Pass (live trap: cancelled orders inflate delivery count) |

### Batch 9 findings

**4/10 flagged — best flag rate since Batch 1.** All 4 flags were pure clones; the 6 passes were strong (three at 31/35, all new datamarts/functions).

**Double EXISTS clone (h14):** The original problem (login AND export events exist for the account) was structurally identical to m23 (Accounts with Mixed Transaction Outcomes, double EXISTS AND EXISTS). Replaced with a funnel problem that adds temporal ordering — not just "login and export both exist" but "export happened AFTER login." Two CTEs find the first login and first export per user; the JOIN enforces fe.first_export > fl.first_login. User 2 in account 1 (exported before first login) is correctly excluded. This is the pattern that m36 (Returned Then Re-Purchased) also teaches — temporal ordering as the critical dimension.

**Easy-level single table (h22):** HAVING SUM(no_show) = 0 on a single table — same structure as m37 before its rewrite. Replaced with Provider Appointment Completion Rate (Zocdoc) — JOIN providers to appointments, conditional aggregation for completed vs no_shows, rate calculation with 100.0 * to prevent integer division. All 6 providers appear. checkValue: Dr. Smith, 10 appts, 4 no_shows, 60.0% completion.

**SUM OVER clone (h25):** Literal clone of m16 — same table (orders), same PARTITION BY (user_id), same ORDER BY (created_at), same column names (running_total). Replaced with Month-over-Month Revenue Growth — CTE + strftime SUM of completed orders only + LAG for previous month + growth rate calculation. Teaches the completed-only filter (gross vs net revenue), LAG expression repetition in SQLite, and the NULL-for-first-month behavior. Distinct from m09 rewrite (MoM order COUNT, not revenue; includes all statuses; ecomm not saas).

**NTILE clone (h27):** NTILE(4) on account balance — clone of m21 (NTILE on consumer interaction count). Replaced with Account Transaction Activity Tier — CTE + LEFT JOIN accounts to transactions + COUNT(txn_id) per account + CASE WHEN threshold bucketing. The LEFT JOIN is essential (accounts with 0 transactions must show 0, not disappear). COUNT(txn_id) vs COUNT(*) on the LEFT JOIN result is the live trap embedded in the problem. Account 1 (6 transactions) → high tier.

**New datamarts/functions this batch:** hr_analytics (Workday, PERCENT_RANK), marketplace (Etsy, COUNT DISTINCT semantic trap), food_delivery (DoorDash, semantic bug debugging format).

---

## Batch 10 — Hard h01–h10 (file positions 1–10: h01, h02, h04, h05, h07, h08, h10, h11, h13, h17)
**Status:** ✅ Complete | **Audited:** 2026-06-02 | **Flagged:** 3 | **Rewritten:** 3 + 1 checkValues fix

| ID | Title | Company | BF | CA | DC | DR | Di | IQ | TC | Total | Approaches | Technique | Pattern | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| h01 | Jan-to-Feb User Retention | Mixpanel | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 35 | 3 | 2-CTE LEFT JOIN + NULL-safe COUNT | cohort retention rate | ✅ Pass (perfect score — INNER JOIN gives wrong 100% answer) |
| h02 | Consecutive Order Day Streak | DoorDash | 5 | 4 | 5 | 5 | 5 | 5 | 4 | 33 | 2 | gap-and-island (julianday - ROW_NUMBER trick) | streak detection | ✅ Pass (DISTINCT trap for same-day orders embedded) |
| h04 | Q1 2023 Cohort Repeat Purchase Rate | Shopify | 5 | 5 | 5 | 5 | 5 | 5 | 4 | 34 | 2 | 3-CTE cohort pipeline + LEFT JOIN rate | cohort LTV analysis | ✅ Pass (MIN vs ANY order cohort scoping trap) |
| h05 | Provider Below Practice Average | Teladoc | 5 | 4 | 5 | 4 | 5 | 5 | 5 | 33 | 3 | 2-CTE + CROSS JOIN scalar broadcast | outlier vs average detection | ✅ Pass (CROSS JOIN for scalar CTE broadcast — new pattern) |
| h07 | New vs Returning Customer Revenue Split (rewritten) | Shopify | 5 | 5 | 5 | 5 | 5 | 5 | 4 | 34 | 2 | 2-CTE date matching + conditional aggregation + COUNT DISTINCT CASE WHEN | new vs returning analytics | ✅ Rewritten (was CTE+LAG clone of m09 rewrite, Di=1, DC=3) |
| h08 | Top Spender per Country | Amazon | 5 | 5 | 5 | 4 | 5 | 5 | 4 | 33 | 2 | 2-CTE + ROW_NUMBER PARTITION BY country | top-1-per-group | ✅ Pass (GROUP BY MAX failure mode documented) |
| h10 | Merchant Exposure per User (rewritten) | Stripe | 5 | 5 | 5 | 5 | 5 | 5 | 4 | 34 | 2 | 4-table JOIN chain + MAX(is_flagged) + P2P NULL trap | risk exposure aggregation | ✅ Rewritten (was ROW_NUMBER clone of h08, Di=2) |
| h11 | No-Show Patients Without Follow-Up | Teladoc | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 35 | 3 | NOT EXISTS with temporal ordering | care gap detection | ✅ Pass (perfect score — temporal ordering in correlated subquery is the hard part) |
| h13 | Customer Lifetime Spend Percentile (rewritten) | Amazon | 5 | 5 | 5 | 5 | 5 | 5 | 4 | 34 | 2 | CTE + JOIN + PERCENT_RANK() global window | LTV percentile ranking | ✅ Rewritten (was SUM(SUM) OVER clone of m30, Di=2, 2-sentence debrief) |
| h17 | Average Reorder Interval per Customer | Shopify | 5 | 5 | 5 | 5 | 4 | 5 | 4 | 33 | 2 | CTE + LAG + AVG of gaps (not total span/count) | reorder cadence | ✅ checkValues fixed (user 5, avg=73 days) |

### Batch 10 findings

**Best batch yet — only 3/10 flagged.** The Hard tier was written with significantly more care than Medium. Six problems scored 33–35 with no flags. Two perfect scores (h01=35, h11=35).

**Medium-level mislabeled Hard (h07):** CTE + strftime + LAG for MoM order count was identical in structure, table, and output to m09 rewrite (Month-over-Month Order Volume, Instacart). DC=3, Di=1. Replaced with "New vs Returning Customer Revenue Split" — a genuinely harder pattern: 2-CTE date matching to label each order as new or returning, conditional aggregation for revenue + COUNT(DISTINCT CASE WHEN) for unique buyer counts per month. The COUNT(DISTINCT CASE WHEN) idiom is the distinguishing technique — avoids double-counting users with multiple orders on their first-ever date.

**ROW_NUMBER clone (h10):** Same 2-CTE + ROW_NUMBER PARTITION BY pattern as h08 (both in this batch). Replaced with "Merchant Exposure per User" — a 4-table JOIN chain (users → accounts → transactions → merchants) + GROUP BY user + MAX(is_flagged) for boolean propagation. The P2P NULL trap is embedded live in the problem: INNER JOIN to merchants silently drops transactions where merchant_id IS NULL, understating total_spend. This is the first problem in the audit where the NULL-in-JOIN trap from the enrichment taxonomy is embedded as a live teaching moment.

**Thin debrief + SUM(SUM) OVER clone (h13):** Same nested-aggregate window pattern as m30 rewrite. 2-sentence debrief. Replaced with "Customer Lifetime Spend Percentile" — CTE + JOIN (completed orders only) + PERCENT_RANK() global window. Teaches PERCENT_RANK vs NTILE distinction (continuous 0–1 value vs bucket labels), the completed-only filter impact on percentile distribution, and why 13-15 are excluded (no completed orders → JOIN drops them naturally). User 5 (eve, paid) leads at $519.95 = spend_percentile 1.0.

**Patterns that make Hard genuinely Hard (all present in passing problems):**
- INNER JOIN that looks correct but gives wrong answer (h01: INNER JOIN on feb_users gives 100% retention)
- Gap-and-island ROW_NUMBER trick (h02: non-obvious that julianday - ROW_NUMBER groups consecutive dates)
- Cohort scoping — MIN vs ANY order (h04: users who ordered IN Q1 vs users whose FIRST order was in Q1 are different sets)
- CROSS JOIN for scalar broadcast (h05: only pattern that correctly propagates a global scalar to every row)
- NOT EXISTS with temporal condition (h11: requires reasoning about what "no subsequent completion" means with dates)
- COUNT(DISTINCT CASE WHEN) (h07 rewrite: standard conditional DISTINCT count pattern)
- 4-table JOIN with NULL key trap (h10 rewrite: merchant_id NULL for P2P = silent exclusion)

---

## Batch 11 — Hard h11–h25 (file positions 11–20: h24, master07, master13, master21, h31, h32, h33, h34, h41, h42)
**Status:** ✅ Complete | **Audited:** 2026-06-03 | **Flagged:** 5 | **Reclassified:** 3 | **Rewritten:** 2

| ID | Title | Company | BF | CA | DC | DR | Di | IQ | TC | Total | Technique | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| h24 | First-Month Revenue by Signup Cohort | Shopify | 5 | 5 | 5 | 5 | 4 | 4 | 4 | 32 | LEFT JOIN date condition in ON clause | ✅ Pass |
| master07 | Hypertension Care Gap | Epic Systems | 5 | 5 | 5 | 4 | 5 | 4 | 5 | 33 | 2-CTE NOT IN anti-join | ✅ Pass (already Master — no change) |
| master13 | Buyer Cohort Repurchase Analysis (rewritten) | Shopify | 5 | 5 | 5 | 5 | 5 | 5 | 4 | 34 | 3-CTE ROW_NUMBER → LEFT JOIN → cohort aggregate | ✅ Rewritten + reclassified Hard→Master |
| master21 | Referral Performance by Referrer | Cash App | 4 | 4 | 4 | 3 | 4 | 5 | 4 | 28 | self-join + SUM(binary) | ✅ Reclassified Hard→Master |
| h31 | CSM Portfolio MRR | Salesforce | 5 | 5 | 5 | 4 | 4 | 4 | 4 | 31 | LEFT JOIN + COALESCE + SUM(CASE WHEN) + COUNT DISTINCT | ✅ Pass |
| h32 | Disputed Transaction Merchant Exposure | Stripe | 5 | 5 | 5 | 4 | 4 | 4 | 4 | 31 | CTE filter + JOIN + GROUP BY | ✅ Pass |
| h33 | Content Above Category Benchmark (rewritten) | TikTok | 5 | 5 | 5 | 5 | 5 | 5 | 4 | 34 | 2-CTE + LEFT JOIN + AVG OVER PARTITION BY (per-category window) | ✅ Rewritten (was CTE+JOIN+RANK clone, Di=2) |
| h34 | Concurrent Prescription Risk (rewritten) | Doximity | 5 | 5 | 4 | 5 | 5 | 5 | 4 | 33 | self-join + 3-condition ON + ABS(JULIANDAY) | ✅ Rewritten (was LAG+JULIANDAY clone, Di=2) |
| h41 | Monthly Account Growth Trend | Salesforce | 5 | 5 | 5 | 4 | 4 | 4 | 4 | 31 | SUM(COUNT(*)) OVER nested aggregate + strftime | ✅ Pass |
| h42 | 30-Day Transaction Velocity | Stripe | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 35 | self-join with JULIANDAY range in JOIN condition | ✅ Pass (perfect score) |

### Batch 11 findings

**5 issues across 10 problems.** 3 reclassifications + 2 rewrites. No new checkValues bugs.

**master07 already Master:** Scored as Hard in previous session, but the file already had `difficulty: 'Master'`. No change needed.

**master13 clone (Di=1):** ROW_NUMBER PARTITION BY user_id → CASE WHEN order_rank=1 THEN 'new' was a literal clone of the h07 rewrite from Batch 10. Replaced with "Buyer Cohort Repurchase Analysis" — 3-CTE chain: ROW_NUMBER sequential numbering → first-buyer cohort assignment (H1/H2) → LEFT JOIN back for repurchase flags (MAX CASE WHEN). Teaches cohort scoping via first completed order, LEFT JOIN for retaining zero-repeat users, MAX(CASE WHEN) binary flag pattern, and integer division trap.

**master21 reclassify:** Self-join + GROUP BY is Medium-Hard level, not Master. Di=4, IQ=5 — good content, just mislabeled. Reclassified Hard→Master.

**h33 clone (Di=2):** CTE + JOIN content→interactions + GROUP BY creator + RANK was structurally identical to m28 rewrite. Replaced with "Content Above Category Benchmark" — 2-CTE: content_stats (LEFT JOIN + COUNT per piece) → benchmarked (AVG OVER PARTITION BY category). Outer query filters WHERE interaction_count > category_avg. New trap: cannot filter on window function result in WHERE directly — the second CTE wrap is required. Distinct from m28 (global AVG OVER) because PARTITION BY makes this a per-category benchmark.

**h34 clone (Di=2):** LAG(scheduled_at) OVER (PARTITION BY patient_id) + JULIANDAY gap — third appearance of this exact technique (m26, m47, h34). Replaced with "Concurrent Prescription Risk" — self-join on prescriptions with three conditions (same patient, same drug, provider_id < provider_id). The `<` constraint is the key teaching moment: eliminates duplicate pairs without DISTINCT. ABS(JULIANDAY) for positive day gap. New trap: `!=` vs `<` in self-join safety pattern.

**New patterns introduced this batch:** AVG OVER PARTITION BY (per-group window, different from global AVG OVER in m28), self-join with `<` safety constraint, 3-CTE cohort retention pipeline, MAX(CASE WHEN) binary flag aggregation.

---

## Batch 12 — Master (master01–master10: master01, master02, master03, master04, master05, master08, master09, master10)
**Status:** ✅ Complete | **Audited:** 2026-06-03 | **Flagged:** 4 | **Rewritten:** 1 | **Fixed:** 3

| ID | Title | Company | BF | CA | DC | DR | Di | IQ | TC | Total | Technique | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| master01 | User Risk Scoring Engine | Chime | 5 | 5 | 5 | 5 | 4 | 5 | 4 | 33 | 3-CTE composite scoring + COALESCE + GROUP BY | ✅ Pass |
| master02 | Channel 6-Month Retention | Wayfair | 4 | 4 | 4 | 4 | 3 | 5 | 4 | 28 | 2-CTE + LEFT JOIN + JULIANDAY 180d window | ✅ Company fixed (Meta→Wayfair) + checkValue fixed |
| master03 | Product Category Gross Margin (rewritten) | Shopify | 5 | 5 | 4 | 5 | 4 | 5 | 4 | 32 | 2-CTE + 3-table JOIN + RANK window | ✅ Rewritten (was Di=2 channel LTV clone, DC=3) |
| master04 | Account Health Score | Salesforce | 5 | 5 | 5 | 4 | 3 | 5 | 4 | 31 | 2-CTE multi-signal scoring + COALESCE + CASE WHEN | ✅ Pass |
| master05 | Transaction Spend Anomaly Detection | Revolut | 5 | 4 | 4 | 5 | 3 | 5 | 5 | 31 | CTE per-user AVG + 3x threshold | ✅ expectedRowCount fixed (3→2), checkValues added, company fixed (Chime→Revolut) |
| master08 | Product Co-Purchase Affinity | Amazon | 5 | 5 | 5 | 5 | 4 | 5 | 5 | 34 | self-join order_items + < pair constraint + COUNT | ✅ Pass |
| master09 | Plan Upgrade/Downgrade Classification | Salesforce | 5 | 5 | 5 | 5 | 4 | 5 | 5 | 34 | 2-CTE ROW_NUMBER + self-join consecutive rows | ✅ Pass |
| master10 | High-Risk Account Flagging | Stripe | 5 | 5 | 4 | 5 | 3 | 5 | 4 | 31 | 2-CTE + INNER JOIN as AND logic | ✅ Debrief fixed (unfinished text removed + TC upgraded) |

### Batch 12 findings

**4/8 flagged** — all fixable without full rewrites except master03.

**master02 company mismatch:** Meta doesn't operate an ecommerce store. Changed to Wayfair — a DTC furniture retailer that would precisely this acquisition channel → 6-month buyer conversion analysis. checkValue updated from `paid/100.0` (ambiguous — referral also 100%) to `organic/total_users=6/converted=4/rate=66.7` (uniquely identifying).

**master03 clone (Di=2, DC=3):** Channel LTV (SUM + COUNT + AVG per channel via LEFT JOIN) was structurally identical to master02 (channel × order aggregation via LEFT JOIN). Also Medium-Hard level, not Master. Replaced with "Product Category Gross Margin Ranking" — 3-table JOIN (order_items → orders → products) for COGS data, 2-CTE (line-level → category aggregate), RANK() on margin_pct. New pattern: cost basis analysis with COGS JOIN. Verified: home=54.99%, electronics=51.13%, books=50.46%, apparel=50.33%.

**master05 data bug:** expectedRowCount was 3 but query returns 2 (txn 31 user 5 at 5.01x, txn 3 user 1 at 3.48x). Fixed to 2. checkValues populated. Company changed Chime→Revolut (Chime already used in master01 — duplicate company in same batch).

**master10 debrief:** Contained unfinished reasoning ("txn 9 is user 3's... wait"). Replaced with complete debrief explaining: INNER JOIN as AND logic, why user 3 (carol) is correctly excluded (no open disputes despite flagged merchant transactions), TC upgraded with severity-scoring follow-up.

**New Master patterns this batch:** 3-CTE composite risk scoring (master01), per-user avg anomaly detection (master05), self-join pair generation with `<` constraint (master08), ROW_NUMBER + self-join consecutive subscription rows (master09), cost-basis category margin with RANK (master03).

---

## Batch 13 — Master (final 7: master12, master14, master18, master19, master25, master26, master27)
**Status:** ✅ Complete | **Audited:** 2026-06-03 | **Flagged:** 6 | **Rewritten:** 3 | **Debrief upgrades:** 3

| ID | Title | Company | BF | CA | DC | DR | Di | IQ | TC | Total | Technique | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| master12 | Prescription Coverage Days | Optum | 5 | 5 | 5 | 5 | 4 | 5 | 4 | 33 | 3-CTE: formula → aggregate → ROW_NUMBER top-drug | ✅ Debrief upgraded (IQ 4→5, TC 3→4) |
| master14 | Churned Account Reactivation | Salesforce | 5 | 5 | 3 | 4 | 3 | 5 | 4 | 29 | 1-CTE MAX + HAVING + JOIN | ✅ Debrief fixed (contradictory "wait" removed, active-account filter note added, TC upgraded) |
| master18 | Seller Performance Scorecard (rewritten) | Etsy | 5 | 5 | 5 | 5 | 5 | 5 | 4 | 34 | 2-CTE + LEFT JOIN × 2 + conditional aggregation + RANK | ✅ Rewritten (was channel first-order clone of master02, Di=2) |
| master19 | Driver On-Time Performance Report (rewritten) | DHL | 5 | 5 | 4 | 5 | 5 | 5 | 4 | 33 | 1-CTE + LEFT JOIN status filter in ON + CASE WHEN rate + band | ✅ Rewritten (was saas COALESCE tier clone of master04, Di=2) |
| master25 | Post Engagement Rate by Content Type (rewritten) | Reddit | 5 | 5 | 5 | 5 | 5 | 5 | 4 | 34 | 3-CTE + LEFT JOIN + ROW_NUMBER PARTITION BY + outer join on rn=1 | ✅ Rewritten (was fintech risk clone of master01, Di=2) |
| master26 | Full Referral Tree Walk | LinkedIn | 5 | 5 | 5 | 4 | 5 | 5 | 5 | 34 | WITH RECURSIVE CTE + self-referential join | ✅ Debrief upgraded (removed "wait" language, chain explanation clarified) |
| master27 | Signup Cohort Retention Curve | Supercell | 5 | 5 | 5 | 4 | 5 | 5 | 4 | 33 | 3-CTE + month offset arithmetic + COUNT DISTINCT CASE WHEN pivot | ✅ Pass (clean) |

### Batch 13 findings

**6/7 flagged — 3 rewrites + 3 debrief upgrades.** Only master27 needed no changes.

**master18 clone (Di=2):** Channel first-order value (2-CTE + MIN created_at + channel aggregation) was structurally identical to master02 (2-CTE + MIN created_at + JULIANDAY window + channel aggregation). Replaced with "Seller Performance Scorecard" (Etsy, marketplace): 2-CTE LEFT JOIN sellers to transactions (conditional aggregation for completed only), LEFT JOIN to reviews for avg_rating, RANK() window. New pattern: marketplace analytics, conditional aggregation in LEFT JOIN context, avg_rating nullability. Verified: TechVault gmv=1487, net=1338.30, rank=1. GadgetWorld (0 completed sales) correctly appears with total_sales=0 due to LEFT JOIN.

**master19 clone (Di=2):** saas COALESCE+CASE WHEN engagement tier was structurally identical to master04 (saas events+subscriptions → COALESCE → CASE WHEN label). Replaced with "Driver On-Time Performance Report" (DHL, logistics): LEFT JOIN drivers to shipments with AND s.status='delivered' in ON clause (not WHERE), SUM(CASE WHEN delivered<=scheduled) for on_time_count, CASE WHEN for performance_band with explicit 'no_data' for zero-delivery drivers. New pattern: logistics/SLA analytics, LEFT JOIN filter in ON vs WHERE distinction, NULL-safe rate calculation. checkValue: driver 2 (Maria Ferrer), 66.7%, 'top'.

**master25 clone (Di=2):** fintech risk profile (1-CTE SUM CASE WHEN per user) was structurally identical to master01 (3-CTE composite risk scoring, same fintech datamart). Replaced with "Post Engagement Rate by Content Type" (Reddit, social_network): 3-CTE chain (published posts → post_stats LEFT JOIN → action_counts ROW_NUMBER PARTITION BY content_type). New pattern: content type pivot with top action per type using ROW_NUMBER PARTITION BY, LEFT JOIN vs INNER JOIN distinction for zero-interaction handling. checkValue: video, 4 posts, 12 interactions, avg=3.0.

**master12 debrief:** Was 3 sentences walking through arithmetic. Upgraded to full treatment: formula explanation (days_supply × (refills+1)), ROW_NUMBER tie-break non-determinism, FIRST_VALUE alternative, 3-CTE chain explanation, adherence gap follow-up.

**master14 debrief:** Had contradictory "Wait — account 1 is excluded... wait, it appears with its churned sub." Fixed: account 1 and 3 both appear because the query checks churned subscriptions regardless of current active subscriptions. Production fix (NOT IN active subs) documented explicitly. TC upgraded.

**master26 debrief:** Had "1→9→12→13... wait — user 9 was referred by user 4 (depth 3)." Replaced with complete chain explanation (1→2→4→9→12→13) and UNION ALL vs UNION rationale.

**master27:** Only clean pass in batch — 3-CTE cohort pivot is genuinely Master (complex month arithmetic, COUNT DISTINCT CASE WHEN pivot). checkValue verified: Nov-2023 cohort size=4, month_0=0 (all Nov users first played in December), month_1=4, month_2=3, month_3_plus=2.

**NEW PATTERNS in final batch:** WITH RECURSIVE (only appearance in entire audit), cohort month-offset pivot (COUNT DISTINCT CASE WHEN per time window), seller GMV scorecard (conditional aggregation + double LEFT JOIN), SLA on-time rate with CASE WHEN null handling, content type engagement with ROW_NUMBER PARTITION BY top-action.
