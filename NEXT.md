# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: V4.69.0 (2026-06-02)*

---

## Pre-beta gates (user actions, not code)

1. **Git push from Mac terminal** — see BRAIN_TRANSFER.md git commit section
2. **Confirm `VITE_POSTHOG_KEY` live in Vercel** — check env vars dashboard, establish WAU baseline

---

## Next session

**0. Verify tier gates work in production**
Sign out → try opening any case → should see auth modal. Sign in without code → try Medium SQL → should see unlock page. Sign in with DAI2026 → everything should work. Verify before next session.

**1. Forensic checkValues bug audit (f01–f10)**
Audit all 10 forensic problems for whole-number REAL checkValues that need '.0' stripped. Pattern: ROUND() returning 40.0 → JS 40 → String '40', not '40.0'. Fixed f01/f04/f09. Check f02, f03, f05–f08, f10. See AUDITS.md #144.

**2. Forensic Format — Batch 2 (f11–f20)**
Batch 1 shipped. Next: average of averages, JOIN fanout, wrong JOIN type, temporal ordering, ambiguous metric definition.

**2. Forensic Format — Batch 2 (f11–f20)**
Average of averages, fanout, HAVING missing, wrong JOIN, temporal ordering.

**3. S-grade debrief pass (Batches 4–13) — paused**
Resume after forensic Batches 1–3 ship. Structural improvement takes priority over documentation additions.

**3. S-Grade Upgrade Pass — Medium through Master (Batches 6–13)**
Medium+ gets full MJ/FV/FA treatment + live trap embedding in seed data for top 30 problems.

**3. Confirm VITE_POSTHOG_KEY live in Vercel**
Establish WAU baseline before Batch 1 outreach.

---

## Deferred (own sessions, not blocking)

**Room header icon consistency (audit #79)**
Standardize remaining room browser headers to the 36×36 colored box pattern with Icon component.

**Interview Simulator expansion**
Split DS/PM modes into specific roles (Product Analyst, Business Analyst, Data Analyst, PM) with Senior/Staff tiers. Gate: PostHog confirms Simulator usage worth investing in.
