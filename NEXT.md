# NEXT.md — Session Queue

Read this at the start of every build session. Do only this. Update before closing.

**Rule:** Max 5 items, ordered by priority. Never a dump — if it grows past 5, something doesn't belong here. When done, cross off, reorder, add what carries forward.

*Last updated: V4.44.0 (2026-05-31) — Audit #96 resolved: canonicalized rf07–rf12, mf09–mf13, ef08–ef15 (difficulty casing, playbookLinks, devNote removed). Build clean.*

---

## Pre-beta gates (do before Batch 1 invites — not a build session)

1. **Git push V4.43.0 + V4.44.0** — run from Mac terminal (sandbox cannot push)
2. **Confirm `VITE_POSTHOG_KEY` is live in Vercel** — check env vars in Vercel dashboard
3. **Foundations vetting pass (audit #141)** — read rf01–rf12, mf01–mf13, ef01–ef15 in order as a cold user. Flag any gaps in the module-to-module sequence. ~2–3 hrs, no code.

---

## Next session

**1. SQL Lab — Phase 3 (company filter chip + streak + PostHog events)** `M` `CODE`

Gate: Session 6 done ✅ (V4.43.0)

- Company filter chip in ProblemSidebar (filter by datamartId/company)
- Hints quality review: spot-check 20 problems for hint accuracy, rewrite any that are too generic
- PostHog events: `sql_problem_solved`, `sql_hint_used`, `sql_answer_revealed` (check VITE_POSTHOG_KEY is live in Vercel)
- SQL Lab streak tracking (integrate into Progress.jsx heatmap)

---

## Deferred (own sessions, not blocking)

**Visual pass — Simulator layout + emoji removal + icon consistency (audits #82, #80, #79)**
Dedicated session: redesign Simulator config screen, remove UI-chrome emojis, standardize room header icon boxes.

**Case debrief failure mode pass (audit #86)**
Debriefs need: (1) what weak answer looks like, (2) follow-up that exposes the gap. Prioritize RCA, Metrics, Stats.

**Supabase auth — finish or cut decision (audit #104)**
DECISION DUE before Batch 2 outreach. Do not leave half-done.

---

## Carry-forward log

**Done this session (V4.44.0 — Audit #96):**
- rcaFoundationModules.js: rf07–rf12 canonicalized — difficulty casing, playbookLinks added, devNote removed. Header comment updated 6→12 modules.
- metricsFoundationModules.js: mf09–mf13 canonicalized — same fixes. Header updated 8→13 modules.
- expFoundationModules.js: ef08–ef15 canonicalized — same fixes (8 stubs).
- AUDITS.md: audit #96 marked ✅ resolved.
- Vite build: ✓ 0 errors. devNote grep: clean.

**Done this session (V4.43.0 — Session 6):**
- SQL Lab nav: added to Sidebar.jsx analytics subgroup (after Code Lab). getIsActive() extended. "internal preview" badge removed.
- UX fixes: Google favicon API (replaced Clearbit), schema accordion 90px→200px, Master added to difficulty filter, sort enforcement via SORTED_PROBLEMS constant, progress bar denominator fixed to 130.
- Hints system: add_hints.py added hints to all 130 problems (1/2/5/5 by difficulty). Progressive reveal UI replaces Show Answer. Show Answer unlocks only after all hints exhausted.
- Per-problem timer: starts on first keystroke, live display in problem footer, saves elapsed to pal-sql-lab-times-v1 on correct solve.
- Progress.jsx: SQL Lab SectionCard added (total solved, per-difficulty breakdown, total time, nav button). SQL Lab added to allRoomProgress for readiness bars.
- validate-data.js: sqlLabProblems.js PASS. Vite build: ✓ 0 errors.

**Done this session (V4.42.0 — Sessions 4+5):**
- Session 4: 7 new datamarts appended to sqlLabDatamarts.js (gaming, logistics, marketplace, food_delivery, social_network, edtech, hr_analytics). Seed data engineered for all 8 gap patterns. Double-comma syntax bug fixed at health/gaming boundary.
- Session 5: Culled 91 problems (33E/45M/13H). Added 10 new gap-pattern problems (1E/3M/4H/2Master). Final: 50E/40M/25H/15Master = 130.
- Also completed: Foundation task instructions audit #95 (4 "What to do:" prompts added to RCAFoundationsRunner.jsx for rf11/rf12)
- validate-data.js: sqlLabProblems.js PASS. Vite build: ✓ 0 errors. 6/6 spot checks passed.

**Done this session (V4.41.0 — Session 3):**
- 74 prompts and debriefs rewritten: 16 Easy (prompt only) + 33 Medium + 17 Hard + 8 Master
- 5-section debrief format applied to all 57 Medium/Hard/Master rewrites
- Bug caught + fixed: literal newlines in JS single-quoted strings (58 fields corrected via scanner)
- validate-data.js: PASS. Vite build: ✓ 0 errors. 6/6 spot checks passed
- AUDITS.md: #133 marked resolved. SQL_LAB_PLAN.md and CHANGELOG.md updated

**Done this session (Session 2 — no code changes):**
- All 211 surviving problems read and classified: 211/211 technical-spec
- 74 conversion candidates identified with direction notes: 16 Easy, 33 Medium, 17 Hard, 8 Master
- Full classification table + direction notes written to SQL_LAB_PLAN.md Section 7

**Done this session (V4.40.0):**
- Session 1 executed: 39 culled, 27 reclassified, master10 bug fixed
- validate-data.js: PASS. Vite build: ✓ 0 errors. 15/15 spot checks passed

**Done this session (V4.39.8–V4.39.11 — code changes):**
- SQL Lab scroll — fixed with two independent `position: fixed` panels, body scroll lock
- SQL Lab visual vibrancy — teal header, teal active state, difficulty-colored borders
- Schema accordion reduced to `maxHeight: 160px`
- Expected output — column chips + actual sample rows (first 3 rows from running solution silently)
- Progress streak heatmap extended to 52 weeks (364 days, GitHub-style)

**Done in prior session (V4.39.0):**
- SQL Lab scaled from 30 → 250 problems: 100 Easy / 75 Medium / 50 Hard / 25 Master
- All MD files updated

**Still open:**
- SQL Lab Phase 3 (company filter, hints quality review, PostHog events, streak) — gate: Session 6 done ✅
- PostHog live in Vercel prod — confirm `VITE_POSTHOG_KEY` is set
- Font system (Source Serif 4 + DM Sans) — research done, not shipped

---

## Do not touch next session (unless explicitly decided)

- Defense Strategy V2 — gate: Batch 1 usage confirmed
- Deep Dives IA overhaul — gate: content taxonomy + ≥6 full posts per category
- New rooms / new cases — wrong session type
- Stripe activation — own sprint
- Learning paths — Tier 2, not yet
- Audit #96 — ✅ done (V4.44.0)
- Session 6 — ✅ done (V4.43.0)
- Sessions 4+5 — ✅ done
- Session 3 — ✅ done
- Sessions 1–2 — ✅ done
