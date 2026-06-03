# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: V4.85.0 (2026-06-03)*

---

## Pre-beta gates (user actions, not code)

1. **Git push from Mac terminal** — see BRAIN_TRANSFER.md git commit section
2. **Confirm `VITE_POSTHOG_KEY` live in Vercel** — check env vars dashboard, establish WAU baseline

---

## Next session

**1. Practice room MCQ audit — remaining rooms**
C01 (businessCases.js Phase 4 option C) fixed in V4.85.0. Continue audit across Metrics, Stats, RCA, Growth, BI, Instrumentation, Design case runners. Same pattern: `level: 'wrong'` options that are obviously wrong by common sense rather than requiring reasoning.

**1b. RCA Foundations — rf14 Dominant Lever shipped (V4.85.0)**
3 scenarios, persist/restore, pruning reference table. Done.

**1c. Hypothesis ranking module**
Impact × Likelihood × Ease scoring for RCA hypotheses. Not tested anywhere in PAL. Needs design before build — sketch the exercise format first.

**1d. "Never say I would look at the data" — inject into RCA case debriefs**
Rule from Jatin's PDF. Weave into existing RCA case debrief fields — no new module. Targeted edits to leadershipNote or debrief fields where candidates typically say "I'd look at the data."

**1e. Stats Foundations persistence**
32 separate module files — different architecture. Own session, own approach.

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
