# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: V4.86.0 (2026-06-03)*

---

## Pre-beta gates (user actions, not code)

1. **Git push from Mac terminal** — see BRAIN_TRANSFER.md git commit section
2. **Confirm `VITE_POSTHOG_KEY` live in Vercel** — check env vars dashboard, establish WAU baseline

---

## Next session

**1. spokenSummary backfill**
RCA05–RCA24 + all Business cases need spokenSummary populated. Infrastructure already live (V4.87.0). Delegate as subagent writing pass — ~40 cases, 30-second spoken answers per case.

**2. Interview Simulator expansion**
Gate: confirm PostHog WAU data first. If live, check Simulator usage. If usage warrants it, split DS/PM modes into specific roles (Product Analyst, Business Analyst, Data Analyst, PM) with Senior/Staff tiers.

**Note (V4.90.0):** S-grade debrief pass COMPLETE — all 130 SQL problems now have FV + FA additions. SQL_UPGRADE_PASS.md + SQL_LAB_PLAN.md Section 11 marked complete.

**Note (V4.85.0–V4.87.0):** Full Jatin feedback + Meesho signal sequence complete. rf14/rf15 shipped. Stats Foundations persistence live. spokenSummary field live in RCA + Business runners — RCA01–04 populated, RCA25 + RCA26 built with spokenSummary. Remaining RCA/Business cases can be backfilled gradually.

**2. S-grade debrief pass (Batches 4–13) — paused**
Resume after forensic Batches 1–3 ship.

**3. Confirm VITE_POSTHOG_KEY live in Vercel**
Establish WAU baseline before Batch 1 outreach.

---

## Deferred (own sessions, not blocking)

**Room header icon consistency (audit #79)**
Standardize remaining room browser headers to the 36×36 colored box pattern with Icon component.

**Interview Simulator expansion**
Split DS/PM modes into specific roles (Product Analyst, Business Analyst, Data Analyst, PM) with Senior/Staff tiers. Gate: PostHog confirms Simulator usage worth investing in.
