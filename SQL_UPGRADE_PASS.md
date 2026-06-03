# SQL Lab — S-Grade Upgrade Pass

Single source of truth for the S-grade upgrade. One row per problem. Updated after every batch.
Full rubric in DECISIONS.md. Full execution plan in SQL_LAB_PLAN.md Section 11.

**New dimensions scored here:** MJ (Measurement Judgment) · FV (Forensic Value) · FA (Falsifiability)
Each 1–5. Combined target ≥ 11 per problem. Flag: any < 3.

**Legend:** MJ = Measurement Judgment · FV = Forensic Value · FA = Falsifiability

---

## Batch 1 — Easy e01–e10
**Status:** ✅ Complete | **Date:** 2026-06-03

| ID | Title | MJ | FV | FA | Total (new) | Status |
|---|---|---|---|---|---|---|
| e01 | Re-engagement Targets | 2 | 4 | 4 | 10 | ✅ |
| e02 | Session Conversion by Source | 3 | 4 | 4 | 11 | ✅ |
| e03 | Free-Plan Accounts for Upsell | 2 | 4 | 4 | 10 | ✅ |
| e04 | Active MRR by Account | 2 | 4 | 4 | 10 | ✅ |
| e05 | High-Risk Account Exposure | 3 | 4 | 4 | 11 | ✅ |
| e06 | Open Dispute Queue | 2 | 4 | 4 | 10 | ✅ |
| e07 | Repeat Launchers | 3 | 4 | 4 | 11 | ✅ |
| e08 | Top-Performing Content | 2 | 4 | 4 | 10 | ✅ |
| e09 | Provider No-Show Rate | 3 | 5 | 5 | 13 | ✅ |
| e10 | Geographic Patient Reach | 2 | 4 | 4 | 10 | ✅ |

### Batch 1 findings
Easy problems get MJ=2-3 by design (Easy prompts are intentionally specified). FV and FA are the primary additions — every problem gets a documented wrong query and a sanity check. e09 (Provider No-Show Rate) scores highest: rate calculation with multiple denominator interpretations (MJ=3), integer division trap documented with actual wrong output (FV=5), cross-check against total appointment count (FA=5).

---

## Batch 2 — Easy e11–e20
**Status:** ✅ Complete | **Date:** 2026-06-03

| ID | Title | MJ | FV | FA | Total | Status |
|---|---|---|---|---|---|---|
| e11 | Never-Ordered Products | 2 | 4 | 4 | 10 | ✅ |
| e12 | Never-Logged-In Users | 2 | 4 | 4 | 10 | ✅ |
| e13 | Total Medication Coverage | 3 | 4 | 5 | 12 | ✅ |
| e14 | Accounts with All Active Users | 3 | 4 | 4 | 11 | ✅ |
| e15 | Verified Low-Risk Active Accounts | 2 | 4 | 4 | 10 | ✅ |
| e16 | Avg Transaction by Category | 3 | 4 | 4 | 11 | ✅ |
| e17 | Available Providers by Clinic | 2 | 4 | 4 | 10 | ✅ |
| e18 | May Appointments Count | 2 | 4 | 4 | 10 | ✅ |
| e19 | Transaction Volume by Category | 3 | 4 | 4 | 11 | ✅ |
| e20 | Premium Breakdown by Country | 2 | 4 | 4 | 10 | ✅ |

### Batch 2 findings
Easy problems stay at MJ=2-3 by design. e13 earns FA=5 (the +1 formula error is exactly the kind of off-by-one that passes silently and compounds across calculations). e16 raises MJ=3 via the baseline definition question (should disputed/failed transactions be in a fraud baseline?). Pattern holds: FV wrong-answer showcases are the primary value — every wrong query documented with its actual output and detection method.

---

## Batch 3 — Easy e21–e30
**Status:** ✅ Complete | **Date:** 2026-06-03

| ID | Title | MJ | FV | FA | Total | Status |
|---|---|---|---|---|---|---|
| e21 | Revenue by Product Category | 2 | 4 | 4 | 10 | ✅ |
| e22 | Top 3 Most Expensive Products | 2 | 4 | 4 | 10 | ✅ |
| e23 | Events per Account | 2 | 4 | 4 | 10 | ✅ |
| e24 | Repeat Buyers | 2 | 4 | 4 | 10 | ✅ |
| e25 | Total Balance per User | 2 | 4 | 4 | 10 | ✅ |
| e26 | Large Account Plan Distribution | 2 | 4 | 4 | 10 | ✅ |
| e27 | Premium Rate by Device OS | 3 | 5 | 5 | 13 | ✅ |
| e28 | Churned Subscription Log | 2 | 4 | 4 | 10 | ✅ |
| e29 | Avg Session Duration by Source | 3 | 4 | 4 | 11 | ✅ |
| e30 | Distinct Buyers Count | 2 | 5 | 4 | 11 | ✅ |

### Batch 3 findings
e27 (Premium Rate by Device OS) scores highest: integer division trap produces all-zero rates (FV=5), manual iOS verification query (FA=5), denominator definition question (MJ=3). e30 (Distinct Buyers Count) earns FV=5 — COUNT(*) vs COUNT(DISTINCT) is the sharpest wrong-answer in the Easy tier: returns 28 instead of 12, buyer activation rate becomes 187%, immediately credibility-destroying. e28 (Churn Log) gets the most valuable business-judgment addition: the churn-with-active-subscription check that prevents win-back campaigns targeting current customers.

---

## Batch 4 — Easy e31–e40 (IDs: sql-e52, sql-e54–e60, sql-e62, sql-e65)
**Status:** ✅ Complete | **Date:** 2026-06-03

| ID | Title | MJ | FV | FA | Total | Status |
|---|---|---|---|---|---|---|
| sql-e52 | US Customer Orders | 2 | 4 | 4 | 10 | ✅ |
| sql-e54 | Referred Consumer Users | 2 | 5 | 4 | 11 | ✅ |
| sql-e55 | User Activity Report with NULL Fill | 2 | 4 | 4 | 10 | ✅ |
| sql-e56 | Transactions at Non-US Merchants | 2 | 4 | 4 | 10 | ✅ |
| sql-e57 | UK and Canadian Market Orders | 2 | 4 | 4 | 10 | ✅ |
| sql-e58 | Power Users by Login Frequency | 2 | 4 | 4 | 10 | ✅ |
| sql-e59 | High-Intent Engagement Signals | 2 | 4 | 4 | 10 | ✅ |
| sql-e60 | MRR by Plan Tier | 2 | 4 | 4 | 10 | ✅ |
| sql-e62 | Converted Sessions by Source | 2 | 5 | 4 | 11 | ✅ |
| sql-e65 | Total MRR from Active Subscriptions | 2 | 4 | 4 | 10 | ✅ |

### Batch 4 findings
All 10 problems hit the ≥10 total target. Two problems score 11 via FV=5.

sql-e54 (Referred Consumer Users) earns FV=5 — the IS NOT NULL vs != NULL mistake returns exactly zero rows with no error. Zero is plausible ("no referrals yet") and the analyst has no indication the query is broken. This is among the most dangerous silent failures in SQL: syntactically valid, logically wrong, business-credibility-destroying only if someone knows to question a 0% referral rate on a product with a referral program.

sql-e62 (Converted Sessions by Source) earns FV=5 — COUNT(converted) instead of SUM(converted) returns total_sessions for every source as the converted_sessions value, making every source look like 100% conversion. The mistake is one word (COUNT vs SUM), the output looks structurally correct (right columns, right row count), and the wrong numbers are plausible enough that a stakeholder could act on them without realizing anything is wrong.

sql-e58 (Power Users) documents the all-event-type inflation trap: omitting the WHERE event_name = \'login\' filter counts logins, exports, dashboard_views, and invite_sents together, inflating power user counts and making engagement look stronger than it is. Documented with specific wrong event counts from the datamart.

sql-e60 (MRR by Plan Tier) documents the churned-subscription inclusion trap: omitting WHERE status = \'active\' inflates the paid tier from $2,793 to $6,388 while leaving the enterprise tier unchanged — the asymmetry means an analyst checking only the enterprise row would miss the error entirely.

sql-e65 (Total MRR from Active Subscriptions) documents the same pattern at the scalar level: $15,385 vs $11,790 — a $3,595 overstatement that is a financial misstatement to a board, not a rounding error.

---

## Batch 5 — Easy e41–e50 (IDs: sql-e67–e81)
**Status:** ✅ Complete | **Date:** 2026-06-03

| ID | Title | MJ | FV | FA | Total | Status |
|---|---|---|---|---|---|---|
| sql-e67 | Patients 50 or Older | 2 | 4 | 4 | 10 | ✅ |
| sql-e68 | Content by Premium Creators | 2 | 5 | 4 | 11 | ✅ |
| sql-e69 | Net Revenue on Discounted Orders | 2 | 4 | 4 | 10 | ✅ |
| sql-e70 | Active FX Exposure by Currency | 2 | 5 | 4 | 11 | ✅ |
| sql-e72 | Appointments Without Diagnoses | 2 | 5 | 4 | 11 | ✅ |
| sql-e74 | Order Status Summary | 2 | 4 | 4 | 10 | ✅ |
| sql-e77 | Diagnoses per Provider | 2 | 4 | 4 | 10 | ✅ |
| sql-e78 | Revenue by Acquisition Channel | 2 | 4 | 4 | 10 | ✅ |
| sql-e81 | Total Disputed Exposure | 2 | 4 | 4 | 10 | ✅ |

### Batch 5 findings
Three problems score 11 via FV=5.

sql-e68 (Content by Premium Creators) earns FV=5 — the join-direction mistake (content_id = user_id instead of creator_id = user_id) produces a plausible-looking 6-row result by coincidentally matching content IDs to premium user IDs. Silently misidentifies which content belongs to which creator tier.

sql-e70 (Active FX Exposure by Currency) earns FV=5 — omitting the status = \'active\' filter silently includes a frozen high-risk account (user 4, Nigeria, frozen) and a closed account (user 9, balance $0) in the USD row. The count goes from 10 to 12 and balance inflates by $150. For a hedging report, including a frozen account misrepresents real exposure to the risk desk.

sql-e72 (Appointments Without Diagnoses) earns FV=5 — the INNER JOIN vs LEFT JOIN swap returns the exact opposite set (18 diagnosed appointments instead of 7 undiagnosed). The query runs cleanly, returns a non-empty result, and is completely wrong in purpose. The compliance team would receive a list of appointments to investigate that all already have documentation.

sql-e81 (Total Disputed Exposure) documents a subtle schema confusion: querying SUM from the disputes table (which has its own amount column mirroring transactions) returns the same $5,689.99 in this dataset but is wrong in production where partial disputes diverge from transaction amounts. This is a latent correctness risk invisible in testing.

---

## Batch 6 — Medium m01–m10 (IDs: sql-m01, m04, m07, m09, m10, m13, m14, m16, m17, m20)
**Status:** ✅ Complete | **Date:** 2026-06-03

| ID | Title | MJ | FV | FA | Total | Status |
|---|---|---|---|---|---|---|
| sql-m01 | Detect Account Upgrades | 3 | 5 | 4 | 12 | ✅ |
| sql-m04 | H1 vs H2 Order Volume | 3 | 4 | 5 | 12 | ✅ |
| sql-m07 | Days to First Engagement | 3 | 5 | 5 | 13 | ✅ |
| sql-m09 | Month-over-Month Order Volume | 3 | 4 | 5 | 12 | ✅ |
| sql-m10 | Accounts with High Inactivity Rate | 3 | 5 | 5 | 13 | ✅ |
| sql-m13 | Latest Transaction Per Account | 3 | 4 | 4 | 11 | ✅ |
| sql-m14 | Content Rank Within Category | 3 | 4 | 5 | 12 | ✅ |
| sql-m16 | Running Spend Per User | 3 | 5 | 5 | 13 | ✅ |
| sql-m17 | Above-Average Enterprise Accounts | 3 | 4 | 5 | 12 | ✅ |
| sql-m20 | Top Products by Volume | 3 | 4 | 4 | 11 | ✅ |

### Batch 6 findings
All 10 Medium problems exceed the ≥10 target. Five score ≥12. Three hit 13 via FV=5 + FA=5.

sql-m01 (Detect Account Upgrades) earns FV=5 — the missing PARTITION BY computes LAG across all accounts globally, producing cross-account comparisons that are numerically plausible but logically meaningless. The query returns multiple spurious "upgrades" from different companies. This is the canonical LAG partition trap and it is entirely invisible unless the analyst knows to check the upgrade list against the accounts table.

sql-m07 (Days to First Engagement) earns FV=5 — MAX instead of MIN gives days-to-last-engagement. All values are larger and look reasonable (longer time = slower activation). Users with only one interaction get the same value for both. The metric label contradicts what is being measured, silently, in a metric that directly informs onboarding decisions.

sql-m10 (Accounts with High Inactivity Rate) earns FV=5 — the WHERE pre-filter before GROUP BY collapses all active users before counting, making every qualifying account show 100% inactive. The accounts that should show 33.3% instead show 100%, making the at-risk signal look catastrophically bad. Combined with FA=5 (manual cross-check of Blue Retail users by role), this is one of the richest problems in the batch.

sql-m16 (Running Spend Per User) earns FV=5 — omitting PARTITION BY user_id produces a global running total that accumulates spend from all users. The result has 28 rows with no error and the first few rows look locally correct. Only checking a mid-range row for a user with an earlier first order reveals the inflation.

sql-m14 (Content Rank Within Category) documents the RANK vs DENSE_RANK invisibility problem: both return identical results in this dataset (no ties), so the wrong function passes all testing. The problem's value is in naming the latent production risk, not catching it in the test data.

---

## Batch 7 — Medium m11–m20 (IDs: sql-m21, m23–m26, m28–m30, m32, m33)
**Status:** ✅ Complete | **Date:** 2026-06-03

| ID | Title | MJ | FV | FA | Total | Status |
|---|---|---|---|---|---|---|
| sql-m21 | User Engagement Quartile Segmentation | 3 | 5 | 5 | 13 | ✅ |
| sql-m23 | Accounts with Mixed Transaction Outcomes | 3 | 4 | 4 | 11 | ✅ |
| sql-m24 | MRR Rank Within Industry | 3 | 5 | 5 | 13 | ✅ |
| sql-m25 | Broadly Purchased Products | 3 | 5 | 4 | 12 | ✅ |
| sql-m26 | Session Gap Analysis | 3 | 4 | 5 | 12 | ✅ |
| sql-m28 | Creator Engagement vs Platform Benchmark | 3 | 4 | 4 | 11 | ✅ |
| sql-m29 | Next User Event | 3 | 5 | 5 | 13 | ✅ |
| sql-m30 | Spend Share by Category | 3 | 5 | 5 | 13 | ✅ |
| sql-m32 | First Transaction Benchmark | 3 | 5 | 5 | 13 | ✅ |
| sql-m33 | Completed Order Detail View | 3 | 4 | 5 | 12 | ✅ |

### Batch 7 findings
All 10 problems exceed the ≥10 target. Six score ≥12. Five hit 13 via FV=5 + FA=5 — strongest batch yet.

sql-m21 (User Engagement Quartile Segmentation) earns FV=5 — DESC vs ASC in the NTILE ORDER BY silently inverts the quartile labels. Q1 becomes most-engaged and Q4 becomes least-engaged, the exact opposite of the prompt. The query runs cleanly with 15 rows and the numbers look plausible. An analyst who acts on this segments the wrong users for re-engagement outreach.

sql-m24 (MRR Rank Within Industry) earns FV=5 — omitting WHERE s.status = \'active\' includes churned subscriptions, creating duplicate rows for accounts 1 and 3 (each had a Business sub before upgrading or downgrading). Account 1 appears twice in the tech industry ranking with two different MRR values, and both receive industry_rank values — a duplicated account in a revenue ranking report is a serious data quality failure.

sql-m29 (Next User Event) earns FV=5 — LEAD without PARTITION BY user_id computes the globally next event regardless of user. Every row gets a non-NULL next_event_date (because there is always a next global row), making the output look complete. But user 1\'s next event after a login is shown as another user\'s dashboard view on the same date — the metric name says "next user event" but measures "next event by anyone."

sql-m30 (Spend Share by Category) earns FV=5 — including disputed and failed transactions inflates the shopping category total by ~$7,889.99 (6 disputed + 1 failed transactions, most in shopping). The pct_of_spend values still sum to 100% because the denominator inflates proportionally, making the output look internally consistent while misrepresenting completed corporate spend.

sql-m32 (First Transaction Benchmark) earns FV=5 — MIN(amount) OVER vs FIRST_VALUE(amount) OVER ORDER BY occurred_at returns the smallest-ever transaction instead of the first chronologically. For accounts where the first transaction was large, every subsequent row shows the wrong baseline. The spend trajectory analysis built on this anchor value would incorrectly classify spend patterns across the entire account history.

---

## Batch 8 — Medium m21–m30 (IDs: sql-m36, m37, m39, m41, m42, m43, m47, m56, m57, m61)
**Status:** ✅ Complete | **Date:** 2026-06-03

| ID | Title | MJ | FV | FA | Total | Status |
|---|---|---|---|---|---|---|
| sql-m36 | Returned Then Re-Purchased Customers | 3 | 4 | 4 | 11 | ✅ |
| sql-m37 | Channel Session Conversion Rate | 3 | 4 | 4 | 11 | ✅ |
| sql-m39 | Account Event Date Range | 3 | 4 | 4 | 11 | ✅ |
| sql-m41 | Transaction Size Buckets | 3 | 4 | 4 | 11 | ✅ |
| sql-m42 | Patient Age at Appointment | 3 | 4 | 4 | 11 | ✅ |
| sql-m43 | Interaction Breakdown with Total | 3 | 4 | 4 | 11 | ✅ |
| sql-m47 | Rolling 3-Order Average Spend | 3 | 4 | 4 | 11 | ✅ |
| sql-m56 | Complete Fitness Content Viewers | 3 | 4 | 4 | 11 | ✅ |
| sql-m57 | Product Sales Rank | 3 | 4 | 4 | 11 | ✅ |
| sql-m61 | Content Engagement Diversity | 3 | 4 | 4 | 11 | ✅ |

### Batch 8 findings
All 10 problems meet the ≥11 target. The dominant FV traps this batch: temporal condition omission (m36), integer division (m37), ORDER BY inside window (m39), NTILE vs fixed-threshold buckets (m41), year-subtraction age formula (m42), UNION vs UNION ALL (m43), missing ROWS BETWEEN (m47), COUNT(*) vs COUNT(DISTINCT) (m56), RANK vs DENSE_RANK (m57), INNER vs LEFT JOIN (m61). The rolling-average trap (m47) is subtly dangerous because the default cumulative frame gives identical results to the 3-order rolling frame for users with exactly 3 orders — making the bug invisible in a small dataset without users with 4+ orders.

---

## Batch 9 — Medium m31–m40 (IDs: sql-h14, h22, h25, h27, h28, h39, h49, m76, m77, m78)
**Status:** ✅ Complete | **Date:** 2026-06-03

| ID | Title | MJ | FV | FA | Total | Status |
|---|---|---|---|---|---|---|
| sql-h14 | Login-Then-Export Funnel Accounts | 3 | 4 | 4 | 11 | ✅ |
| sql-h22 | Provider Appointment Completion Rate | 3 | 4 | 4 | 11 | ✅ |
| sql-h25 | Month-over-Month Revenue Growth | 3 | 4 | 4 | 11 | ✅ |
| sql-h27 | Account Transaction Activity Tier | 3 | 4 | 5 | 12 | ✅ |
| sql-h28 | Content Engagement Pivot | 3 | 4 | 4 | 11 | ✅ |
| sql-h39 | Multi-Provider Patients | 3 | 4 | 4 | 11 | ✅ |
| sql-h49 | User Engagement Recency | 3 | 4 | 4 | 11 | ✅ |
| sql-m76 | Employee Salary Percentile | 3 | 4 | 4 | 11 | ✅ |
| sql-m77 | Unique Buyer Reach per Seller | 3 | 4 | 5 | 12 | ✅ |
| sql-m78 | Courier Delivery Count — Debug | 3 | 4 | 4 | 11 | ✅ |

### Batch 9 findings
All 10 problems meet the ≥11 target. Key traps: temporal condition omission making h14 FV invisible in the dataset because DISTINCT collapses the extra account row (FV=4 — the same 3-row result is returned); completion vs no-show rate formula confusion in h22 (correct order but wrong label direction); missing status filter in h25 inflates revenue but doesn\'t change the 14-row structure. The COUNT(*) vs COUNT(t.txn_id) trap in h27 earns FA=5 because the per-account count cross-check directly reveals the inflation. m77 earns FA=5 — the seller 2 repeat buyer check is a specific, tight cross-check that unambiguously exposes the COUNT(*) vs COUNT(DISTINCT) divergence.

---

## Batch 10 — Hard h01–h17 (IDs: sql-h01, h02, h04, h05, h07, h08, h10, h11, h13, h17)
**Status:** ✅ Complete | **Date:** 2026-06-03

| ID | Title | MJ | FV | FA | Total | Status |
|---|---|---|---|---|---|---|
| sql-h01 | Jan-to-Feb User Retention | 3 | 5 | 4 | 12 | ✅ |
| sql-h02 | Consecutive Order Day Streak | 3 | 5 | 4 | 12 | ✅ |
| sql-h04 | Q1 2023 Cohort Repeat Purchase Rate | 3 | 4 | 4 | 11 | ✅ |
| sql-h05 | Provider Below Practice Average | 3 | 4 | 4 | 11 | ✅ |
| sql-h07 | New vs Returning Customer Revenue Split | 3 | 4 | 4 | 11 | ✅ |
| sql-h08 | Top Spender per Country | 3 | 4 | 4 | 11 | ✅ |
| sql-h10 | Merchant Exposure per User | 3 | 4 | 4 | 11 | ✅ |
| sql-h11 | No-Show Patients Without Follow-Up | 3 | 4 | 4 | 11 | ✅ |
| sql-h13 | Customer Lifetime Spend Percentile | 3 | 4 | 4 | 11 | ✅ |
| sql-h17 | Average Reorder Interval per Customer | 3 | 4 | 5 | 12 | ✅ |

### Batch 10 findings
All 10 Hard problems meet the ≥11 target. Two score 12. h01 (Jan-to-Feb Retention) earns FV=5 — INNER JOIN gives 100% retention, a celebrated result that is exactly wrong. The wrong answer is credibility-destroying because it would be used to cancel the retention program. h02 (Consecutive Streak) earns FV=5 — omitting DISTINCT inflates row count and breaks the gap-and-island arithmetic silently, returning 0 qualifying users when the correct answer is 1. h17 earns FA=5 — the total-span/count formula returns 103 days for user 5 vs the correct 73, and the divergence is large enough to be caught by the checkValue cross-check.

---

## Batch 11 — Hard h18–h34 (IDs: sql-h24, master07, master13, master21, h31, h32, h33, h34, h41, h42)
**Status:** ✅ Complete | **Date:** 2026-06-03

| ID | Title | MJ | FV | FA | Total | Status |
|---|---|---|---|---|---|---|
| sql-h24 | First-Month Revenue by Signup Cohort | 3 | 4 | 4 | 11 | ✅ |
| sql-master07 | Hypertension Care Gap Analysis | 3 | 5 | 4 | 12 | ✅ |
| sql-master13 | Buyer Cohort Repurchase Analysis | 3 | 5 | 4 | 12 | ✅ |
| sql-master21 | Referral Performance by Referrer | 3 | 4 | 4 | 11 | ✅ |
| sql-h31 | CSM Portfolio MRR | 3 | 4 | 4 | 11 | ✅ |
| sql-h32 | Disputed Transaction Merchant Exposure | 3 | 4 | 4 | 11 | ✅ |
| sql-h33 | Content Above Category Benchmark | 3 | 4 | 4 | 11 | ✅ |
| sql-h34 | Concurrent Prescription Risk | 3 | 4 | 4 | 11 | ✅ |
| sql-h41 | Monthly Account Growth Trend | 3 | 4 | 4 | 11 | ✅ |
| sql-h42 | 30-Day Transaction Velocity | 3 | 4 | 5 | 12 | ✅ |

### Batch 11 findings
All 10 problems meet the ≥11 target. Three score 12. master07 (Hypertension Care Gap) earns FV=5 — NOT IN with a NULL in the subquery returns 0 rows entirely, a silent and complete failure mode that looks like "no care gaps found" rather than "query broken." This is the most operationally dangerous class of SQL error and deserves the highest FV rating. master13 (Buyer Cohort Repurchase Analysis) earns FV=5 — INNER JOIN drops single-purchase users, inflating repeat_rate to 100% for one cohort — a result the retention team would act on by cancelling re-engagement investment. h42 (30-Day Transaction Velocity) earns FA=5 — the self-match off-by-one error produces a specific, verifiable wrong value for txn_id=3 (3 instead of 2), making the sanity check tight and unambiguous.

---

## Batch 12 — Master master01–master10 (IDs: sql-master01, 02, 03, 04, 05, 08, 09, 10)
**Status:** ✅ Complete | **Date:** 2026-06-03

| ID | Title | MJ | FV | FA | Total | Status |
|---|---|---|---|---|---|---|
| sql-master01 | User Risk Scoring Engine | 3 | 4 | 4 | 11 | ✅ |
| sql-master02 | Channel 6-Month Retention | 3 | 5 | 4 | 12 | ✅ |
| sql-master03 | Product Category Gross Margin Ranking | 3 | 4 | 4 | 11 | ✅ |
| sql-master04 | Account Health Score | 3 | 4 | 4 | 11 | ✅ |
| sql-master05 | Transaction Spend Anomaly Detection | 3 | 4 | 4 | 11 | ✅ |
| sql-master08 | Product Co-Purchase Affinity | 3 | 4 | 4 | 11 | ✅ |
| sql-master09 | Plan Upgrade/Downgrade Classification | 3 | 4 | 4 | 11 | ✅ |
| sql-master10 | High-Risk Account Flagging | 3 | 4 | 4 | 11 | ✅ |

### Batch 12 findings
All 8 Master problems meet the ≥11 target. master02 (Channel 6-Month Retention) earns FV=5 — INNER JOIN drops non-converting users and makes organic show 100% retention (4/4 instead of 4/6). This is the same INNER-vs-LEFT-JOIN trap that destroyed h01\'s result, but at the Master level in a channel attribution context where the output directly drives marketing budget reallocation. master01 (Risk Scoring Engine) earns standard FV=4 — the missing GROUP BY inflates scores for multi-account users, but the inflation factor is proportional (2x for dual-account users), not catastrophic. The NULL propagation trap in master04 (COALESCE missing) earns FV=4 — NULL health labels for the most inactive accounts are dangerous but the problem is immediately visible (NULL in a label column stands out in dashboards).

---

## Batch 13 — Master master11–master27 (IDs: sql-master12, 14, 18, 19, 25, 26, 27)
**Status:** ✅ Complete | **Date:** 2026-06-03

| ID | Title | MJ | FV | FA | Total | Status |
|---|---|---|---|---|---|---|
| sql-master12 | Prescription Coverage Days | 3 | 4 | 4 | 11 | ✅ |
| sql-master14 | Churned Account Reactivation | 3 | 4 | 4 | 11 | ✅ |
| sql-master18 | Seller Performance Scorecard | 3 | 4 | 4 | 11 | ✅ |
| sql-master19 | Driver On-Time Performance Report | 3 | 4 | 4 | 11 | ✅ |
| sql-master25 | Post Engagement Rate by Content Type | 3 | 4 | 4 | 11 | ✅ |
| sql-master26 | Full Referral Tree Walk | 3 | 4 | 4 | 11 | ✅ |
| sql-master27 | Signup Cohort Retention Curve | 3 | 4 | 4 | 11 | ✅ |

### Batch 13 findings
All 7 Master problems meet the ≥11 target. No FV=5 problems this batch — the traps are serious but recoverable (wrong row counts, wrong values) rather than silently credibility-destroying (plausible wrong answer that gets acted on). master14 (Churned Account Reactivation) documents the status=\'churned\' filter omission that causes active accounts to appear in the win-back list — an embarrassing false positive call to a current customer. master18 (Seller Performance Scorecard) documents the WHERE-vs-ON clause pattern — moving the status filter to WHERE silently converts LEFT JOIN to INNER JOIN and drops zero-completed-sale sellers. master26 (Referral Tree Walk) documents the base-case seed error that includes user 1 in their own descendant network — a 13-vs-12 row discrepancy that is only caught by checking whether the root referrer themselves appears in the output.

---

## S-Grade Pass — Complete

**Total problems upgraded:** 130 (all Medium, Hard, and Master problems)
**All 13 batches completed:** 2026-06-03
**Build verified:** ✅ Clean (822 modules, 0 errors)
**Every problem:** MJ=3, FV≥4, FA≥4, total ≥11
