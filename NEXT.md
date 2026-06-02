# NEXT.md — Session Queue

Read this at the start of every build session. Do only this. Update before closing.

**Rule:** Max 5 items, ordered by priority. Never a dump — if it grows past 5, something doesn't belong here. When done, cross off, reorder, add what carries forward.

*Last updated: V4.46.0 (2026-06-02) — SQL Lab Phase 3 + all 4 foundations rewritten situation-first (65 modules) + emoji pass + debrief failure modes (60 cases). Build clean.*

---

## Pre-beta gates (do before Batch 1 invites)

1. **Git push V4.43.0–V4.46.0** — run from Mac terminal (sandbox cannot push)
2. **Confirm `VITE_POSTHOG_KEY` is live in Vercel** — check env vars in Vercel dashboard

---

## Next session

**1. Supabase auth — finish or cut (audit #104)** `DECISION + CODE`
Decision due before Batch 2 outreach. Option A: complete to production-ready — E2E test with real Supabase project, verify `PROGRESS_KEYS` in syncProgress.js covers all current rooms (SQL Lab, all new rooms added since V4.24), add auth error handling. Option B: remove entirely, ship as localStorage-first. Half-done is worse than either.

**2. BI chart interpretation scenarios** `CONTENT + CODE`
Highest new feature ROI. Add a visual chart sub-format to the BI room — Chart.js renders inline, user answers "what's wrong / what do you conclude?" No backend needed. ~10 scenarios, one new component. Own session.

---

## Deferred (own sessions, not blocking)

**Room header icon consistency (audit #79)**
Standardize all room browser headers to the 36×36 colored box pattern with Icon component. Same pass as emoji removal but for icon layout.

**Interview Simulator expansion (Batch 0 feedback)**
Split DS/PM modes into specific roles (Product Analyst, Business Analyst, Data Analyst, PM) with Senior/Staff tiers. Question bank needs depth first. Gate: PostHog confirms Simulator usage worth investing in.

**Supabase auth — finish or cut (audit #104)**
See Next session item 1.

---

## Carry-forward log

**Done this session (V4.46.0):**
- SQL Lab Phase 3: company/datamart filter chip in ProblemSidebar, PostHog events (sql_problem_solved/sql_hint_used/sql_answer_revealed), SQL Lab dates written to pal-sql-lab-dates-v1, Progress.jsx heatmap includes SQL Lab practice
- Foundation rewrites (65 modules total): all 4 foundation data files rewritten situation-first — rcaFoundationModules.js (12), metricsFoundationModules.js (13), expFoundationModules.js (15), statsFoundationsModules.js (32 modules). Every keyInsight now opens with a concrete work moment before any framework language.
- Emoji removal (audit #80): UI-chrome emojis removed from 11 files across pages/
- Simulator layout cleanup (audit #82): role cards tighter, chip selectors compact, reduced padding
- Case debrief failure mode pass (audit #86): 60 cases across rcaCases.js (24), metricCases.js (16), statsModules.js (20) — each debrief now ends with Weak answer pattern + Interviewer follow-up
- Build: ✓ 0 errors. validate-data.js: all target files PASS.

**Done (V4.45.0):**
- Difficulty taxonomy normalized to analyst/senior/staff across all data files
- DifficultyChips shared component + filter chips added to all room browsers
- About.jsx fully rewritten (17 rooms, difficulty levels, how it differs from DataLemur/StrataScratch/Exponent)
- Home.jsx beginner onboarding track (first-visit only, 4-step path)
- Foundation nudges added to DesignBrowser + ScenarioBrowser

**Done (V4.44.0):**
- Audit #96 resolved: rf07–rf12, mf09–mf13, ef08–ef15 canonicalized (isFree, playbookLinks, difficulty casing, devNote removed)

**Done (V4.43.0 — SQL Lab Session 6):**
- SQL Lab nav, UX fixes (Google favicon, schema accordion, Master filter, sort enforcement), hints system (130 problems × 1–5 hints), per-problem timer, Progress.jsx SQL section

**Done (V4.41.0–V4.42.0 — SQL Lab Sessions 3–5):**
- 74 prompts rewritten (business-stakeholder framing), 7 new datamarts, 130 final problems (50E/40M/25H/15Master)

**Still open:**
- Git push — user must run from Mac terminal
- PostHog key confirm in Vercel
- Supabase auth finish-or-cut decision
- Room header icon consistency (audit #79)

---

## Do not touch next session (unless explicitly decided)

- Defense Strategy V2 — gate: Batch 1 usage confirmed
- Deep Dives IA overhaul — gate: content taxonomy + ≥6 full posts per category
- New rooms / new cases — wrong session type
- Stripe activation — own sprint
- Learning paths — Tier 2, not yet
