# Brain Transfer — V5.30.x

**Version:** V5.30.x (Casefile OS shipped — check CHANGELOG for exact tag) | **Build:** ✓ | **Date:** 2026-06-17 | **PM Audit:** #149 complete

---

## Session open protocol

**Read this file only.** CLAUDE.md is already in your system prompt. Read NEXT.md only if the next action below is unclear. Never open a source file without grepping first.

```
1. Connect repo: /Users/ASUS/Documents/GitHub/product-analytics-lab
2. Run: rm -f .git/index.lock .git/HEAD.lock && git status && npm run build
3. Read this file → read NEXT.md item 1 → start coding
```

**Grep before Read. Always. No exceptions.**

---

## Active file reference

Read these only when specifically needed — never at session open:

| File | Read when |
|---|---|
| `NEXT.md` | Next action is unclear |
| `DECISIONS.md` | About to make an architectural or product-scope decision |
| `AUDITS.md` | Checking open audit items |
| `METRICS.md` | Wiring analytics events or touching localStorage keys |
| `SQL_LAB_PLAN.md` | SQL Lab rubric, trap taxonomy, or audit process |
| `SQL_QUALITY_AUDIT.md` | Checking current batch scores or starting a new batch |
| `IDEAS.md` | Choosing what to build next |
| `docs/CONTENT_QUALITY_BAR.md` | Authoring new cases or scenarios |
| `docs/SCENARIO_BANK_TAXONOMY.md` | Review Room coverage and scenario families |

**Never read at session open:** LINEAGE, CHANGELOG, CROSS_LAB, ROLLOUT, README, anything in docs/archive/

---

## Current state

**17 rooms, 821 modules, 69 articles, 40 MCQ questions, 140 SQL problems (50E/40M/25H/15Master/10Forensic Batch1/10Forensic Batch2), 12 datamarts.**

Auth: Email magic link ✅ · Google OAuth ✅ · GitHub OAuth ✅ · Cross-device sync ✅

SQL Audit: 120/130 problems audited (Batches 1–10 complete). Batch 11 scored but edits not committed (context limit hit previous session).

---

## What was just done

**2026-06-19 — Paths feature built and reverted (nothing net-shipped)**
- Built PathsBrowser.jsx (2-panel UI), pathsData.js (4 paths), pathsProgress.js (localStorage helpers)
- Wired into App.jsx (lazy import + routing) and Sidebar.jsx (PATHS section + getIsActive)
- Reverted all wiring after user confirmed Paths belongs on Progress.jsx, not as standalone nav
- 3 files still on disk but orphaned: `src/data/pathsData.js`, `src/utils/pathsProgress.js`, `src/pages/PathsBrowser.jsx` — need manual `git rm` before next commit
- Foundation Path UX plan (6-phase) logged in IDEAS.md Tier 1
- USP home page feature listing (advisor WhatsApp feedback) logged in IDEAS.md Tier 1 — high priority before private test

**V5.30.x — Casefile OS + Terminal Lab visual identity** (shipped in prior session, exact version in CHANGELOG)
Two-axis CSS architecture replacing the old single dark-mode system:
- Axis 1 — route mode: `mode-casefile` | `mode-terminal` class on `app-layout`
- Axis 2 — user theme: `theme-light` | `theme-dark` class on `app-layout`
- `mode-terminal` = always dark (SQL Lab, all runner pages). Fixed dark indicator replaces theme toggle.
- `mode-casefile` = warm analyst workbook. Responds to user theme toggle (light ↔ warm dark).
- Casefile dark = warm brown-charcoal (#15120D bg, #F5EFE4 text) — NOT navy/purple SaaS dark.
- `TERMINAL_PAGES` Set in App.jsx: sql-lab, stats-runner, design-runner, runner, metrics-runner, rca-runner, cases-runner, full-loop-runner, prioritization-runner, behavioral-runner, estimation-runner, growth-analytics-runner, bi-runner, stf-runner, takehome-runner, instrumentation-runner, product-design-runner, leadership-lens-runner, challenges-runner. Foundation runners (stat-foundations-runner etc.) are CASEFILE, not terminal.
- `data-theme` on `document.documentElement` kept for portal/modal compatibility, set to casefile warm dark values.
- Fonts: IBM Plex Sans (UI) + IBM Plex Mono (SQL/code/tables) from Google Fonts.
- No purple in primary CTAs, nav states, progress bars. No glow/neon box-shadows.
- Files: `src/index.css` (full theme rewrite), `src/App.jsx` (TERMINAL_PAGES, class string), `src/components/layout/Sidebar.jsx` (isTerminal prop, conditional toggle button).

**2026-06-17 — Study Room architecture + files built (NOT yet committed to repo)**
Private study room for personal interview prep using Anki APKG content. Auth-gated. Never visible to unauthenticated users.
- 346 PAL-relevant cards extracted + deduplicated from lane8_experimentation + Viltrumite Deck APKGs.
- Breakdown: 160 experimentation, 70 statistics, 62 SQL, 23 causal inference, 20 metrics, 11 product.
- SM-2 spaced repetition algorithm (~60 lines, no library).
- Cards stored in Supabase `study_cards` table (RLS: readable by authenticated users). Reviews in `study_reviews` (user-scoped RLS). Content never in frontend bundle.
- Sidebar link visible only to `claudesubscription12@gmail.com`. Route `#/study` redirects to home if `!user`.
- **Files ready in batch 1 folder — need manual integration. See STUDY_ROOM_STATUS.md.**
- **Critical: StudyRoom.jsx imports from `../utils/supabase` (not ../lib/supabase). File is correct.**

**V5.29.0** — 21-room audit complete. Nav: "Stats Calc" → "A/B Interpreter"; "Cases" → "Analytics Cases". Full Loop browser: description paragraph added (was missing entirely). Rooms 05-08, 10-15, 17-21 audited — no content fixes needed. Files: Sidebar.jsx, FullLoopBrowser.jsx.

**V5.28.0** — RCA Foundations + A/B Foundations content audit (Rooms 03 + 04). RCA: header comment fixed (12→15); rf10 renamed from "Data Quality First" (duplicate of rf03) to "Instrumentation Failure Patterns". AB Foundations: clean pass, no fixes. File: rcaFoundationModules.js.

**V5.27.0** — Metrics Foundations content audit (Room 02). Fixed header comment (13→17 modules). Renamed mf13 from "Metric Sensitivity" to "False Negatives and Metric Choice". All 17 modules verified clean. File: metricsFoundationModules.js.

**V5.26.0** — All 4 Foundation rooms: added room descriptions + fixed first-time user entry. FoundationBrowser.jsx shared component — one fix, four rooms. Build ✓.

**V5.25.0** — Stats Foundations audit (Audit #150). sf26–sf32 had wrong difficulty values. Fixed to 'Intermediate'/'Advanced'. Removed devNote fields. Build ✓. File: statsFoundationsModules.js.

**V5.24.0** — Full Loop fl01 QA pass. Three bugs fixed: date split, duplicate android retry, missing ios/web UPI orders. Build ✓. Files: fullLoopCases.js, fullLoopSeedData.js.

**V5.23.0** — Full Loop 5-phase rebuild + deep link auth fix. Files: App.jsx, FullLoopRunner.jsx, fullLoopCases.js, fullLoopSeedData.js, FullLoopBrowser.jsx.

---

## Next action — 2026-06-19

1. **Manual cleanup:** Delete `src/data/pathsData.js`, `src/utils/pathsProgress.js`, `src/pages/PathsBrowser.jsx` from terminal, then `git rm` them in the /tmp clone commit.
2. **USP home page copy** — write 3–4 feature bullets per room, then wire into home page cards. See IDEAS.md Tier 1.
3. **Dimensional modeling cases** — 3–5 schema-critique cases tagged `data-modeling`. Active queue item 1.

---

## Reusable shared components

| Component | Path | Props |
|---|---|---|
| ForwardPointerCard | src/components/shared/ForwardPointerCard.jsx | room, onNavigate, onNext |
| FoundationNudgeCard | src/components/shared/FoundationNudgeCard.jsx | foundationRoom, foundationLabel, onNavigate |
| BeginnerOnboardingTrack | src/components/shared/BeginnerOnboardingTrack.jsx | onNavigate |
| StaffLayer | src/components/shared/StaffLayer.jsx | leadershipNote |
| HowTo | src/components/shared/HowTo.jsx | steps[] |
| Breadcrumb | src/components/shared/Breadcrumb.jsx | items[] |
| DifficultyChips | src/components/shared/DifficultyChips.jsx | value, onChange |
| Icon | src/components/shared/Icon.jsx | name, size, color |

**failureMode field pattern:**
```js
failureMode: {
  weakAnswer: 'The candidate [specific wrong reasoning].',
  interviewerFollowUp: '"[The probe question]"',
},
```
Runners that render it: BIRunner, GrowthRunner, InstrumentationRunner, BehavioralRunner, EstimationRunner, DesignDebriefPanel.

---

## Before closing this session

- [ ] Update this file: version, what was done, next action
- [ ] Update NEXT.md: log what shipped, reorder queue
- [ ] Build: `npm run build` (0 errors)
- [ ] Git commit from Mac terminal (command below)

---

## Git commit

**Standard:**
```bash
cd "/Users/ASUS/Documents/GitHub/product-analytics-lab" && rm -f .git/index.lock .git/HEAD.lock && git add -A && git commit -m "V5.X.X: [description]" && git push origin main
```

**If git is stuck (lock files):**
```bash
cd "/Users/ASUS/Documents/GitHub/product-analytics-lab" && rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/main.lock && git add -A && git commit -m "V5.X.X: [description]" && git push origin main
```

**If push is rejected:**
```bash
git fetch origin main && git push origin main
```
