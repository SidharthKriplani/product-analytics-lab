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

## Batch 2 — Easy e11–e20
**Status:** Pending

---

## Batch 3 — Easy e21–e30
**Status:** Pending

---

## Batch 4 — Easy e31–e40
**Status:** Pending

---

## Batch 5 — Easy e41–e50
**Status:** Pending

---

## Batch 6 — Medium m01–m10
**Status:** Pending

---

## Batch 7 — Medium m11–m20
**Status:** Pending

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
