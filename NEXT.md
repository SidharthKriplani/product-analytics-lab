# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: V4.69.0 (2026-06-02)*

---

## Pre-beta gates (user actions, not code)

1. **Git push from Mac terminal** — see BRAIN_TRANSFER.md git commit section
2. **Confirm `VITE_POSTHOG_KEY` live in Vercel** — check env vars dashboard, establish WAU baseline

---

## Next session

**1. SQL Lab — Trap Enrichment Pass [HIGHEST PRIORITY]**
All 13 audit batches complete as of V4.73.0. Full taxonomy + execution plan in SQL_LAB_PLAN.md Section 10. Start with 6 highest-ROI traps (effort 2, impact 3): NULL in NOT IN subquery, integer division CAST, many-to-many fanout, COALESCE on LEFT JOIN aggregate, RANGE vs ROWS on tied dates, denominator confusion on rate problems.

**2. SQL Lab — Prompt-Clarity Pass**
30-min sweep of all 130 prompts after enrichment pass. Verify each prompt clearly signals expected output shape. Not a re-audit — no rubric changes.

**3. Confirm VITE_POSTHOG_KEY live in Vercel**
Establish WAU baseline before Batch 1 outreach.

---

## Deferred (own sessions, not blocking)

**Room header icon consistency (audit #79)**
Standardize remaining room browser headers to the 36×36 colored box pattern with Icon component.

**Interview Simulator expansion**
Split DS/PM modes into specific roles (Product Analyst, Business Analyst, Data Analyst, PM) with Senior/Staff tiers. Gate: PostHog confirms Simulator usage worth investing in.
