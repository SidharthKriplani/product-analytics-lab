# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: V4.69.0 (2026-06-02)*

---

## Pre-beta gates (user actions, not code)

1. **Git push from Mac terminal** — see BRAIN_TRANSFER.md git commit section
2. **Confirm `VITE_POSTHOG_KEY` live in Vercel** — check env vars dashboard, establish WAU baseline

---

## Next session

**1. SQL Quality Audit — Batch 11 (resume)**
Scores already done last session. Execute: 3 reclassifications (master07/13/21 difficulty Hard→Master) + 2 rewrites (h33 CTE+JOIN clone, h34 LAG+JULIANDAY clone) + MD updates + build + ship. Full score table in BRAIN_TRANSFER.md.

**2. SQL Quality Audit — Batch 12 (Master master01–master08)**
After Batch 11 ships. Score full batch → fix flagged → build → ship.

**3. Confirm VITE_POSTHOG_KEY live in Vercel**
Establish WAU baseline before Batch 1 outreach.

---

## Deferred (own sessions, not blocking)

**Room header icon consistency (audit #79)**
Standardize remaining room browser headers to the 36×36 colored box pattern with Icon component.

**Interview Simulator expansion**
Split DS/PM modes into specific roles (Product Analyst, Business Analyst, Data Analyst, PM) with Senior/Staff tiers. Gate: PostHog confirms Simulator usage worth investing in.
