# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: V4.84.0 (2026-06-03)*

---

## Pre-beta gates (user actions, not code)

1. **Git push from Mac terminal** — see BRAIN_TRANSFER.md git commit section
2. **Confirm `VITE_POSTHOG_KEY` live in Vercel** — check env vars dashboard, establish WAU baseline

---

## Next session

**1. Forensic Format — Batch 3 (f21–f25)**
Batch 2 (f11–f20) shipped. Staff-level problems: compounding errors, metric definition mismatch, survivorship bias. Read SQL_LAB_PLAN.md Section 12 Batch 3 spec before building.

**1b. RCA Foundations — Routing Gate module (new, rf13)**
Sudden vs gradual → completely different investigation paths. Not covered anywhere in current modules. See IDEAS.md for full spec. Interactive format: given a metric drop scenario + time signature, route the investigation to the correct starting layer. Estimated 1 module, Intermediate, 6–7 min.

**1c. RCA Foundations — Adaptive re-testing (Jatin feedback)**
If user scores <50% on a module, surface 2-3 supplemental questions. Requires writing ~20 questions across 8 modules FIRST (separate content session), THEN implementing the adaptive logic. Do NOT combine into one session. See IDEAS.md Tier 1 for full spec.

**Note (V4.83.0–V4.84.0):** Answer persistence is now LIVE across RCA, Exp, and Metrics Foundations. Item arrays shuffle on first visit in all three rooms. rf13 Routing Gate shipped. Stats Foundations Module01 intro anchored. Stats persistence deferred — separate 32-file architecture needs its own approach (see IDEAS.md).

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
