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

## Batch 8 — Medium m21–m30
**Status:** Pending

---

## Batch 9 — Medium m31–m40
**Status:** Pending

---

## Batch 10 — Hard h01–h10
**Status:** Pending

---

## Batch 11 — Hard h11–h25
**Status:** Pending

---

## Batch 12 — Master master01–master08
**Status:** Pending

---

## Batch 13 — Master master09–master15
**Status:** Pending
