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

## Batch 12 — Master master01–master10
**Status:** Pending

---

## Batch 13 — Master master11–master27
**Status:** Pending
