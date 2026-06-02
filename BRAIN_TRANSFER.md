# Brain Transfer — V4.53.1

**Version:** V4.54.0 | **Build:** ✓ (2.85s, 0 errors) | **Git:** uncommitted | **Date:** 2026-06-02

---

## ⚡ SESSION OPEN PROTOCOL — read this, nothing else

**Read this file only to start.** CLAUDE.md is already in the system prompt. Read NEXT.md only if the next action below is unclear. Never open a source file without grepping first. Reading all MDs at session open burns 80–120k tokens before any work begins — do not do it.

```
1. Connect repo: /Users/ASUS/Documents/GitHub/experimentation-systems-lab
2. Run: rm -f .git/index.lock .git/HEAD.lock && git status && npm run build
3. Read this file → read NEXT.md item 1 → start coding
```

**Grep before Read. Always. No exceptions.**

---

## Current state

**17 rooms, 821 modules, 69 articles, 40 MCQ questions, 130 SQL problems (50E/40M/25H/15Master), 12 datamarts.**

Routes in nav: Stats · Metrics · Design · Review · RCA · Cases · Code · Product Design · Prioritization · Behavioral · Estimation · Growth · BI · Instrumentation · Spot the Flaw · Take-Home · Challenges · SQL Lab · Interview Q&A (/interview-qa, shortcut `i`) · Failures (/failures) · Room Map (/map)

---

## What was just done

**V4.54.0** — 3 content builds, 0 new routes: (1) Debrief failure mode pass — all 20 Cases room cases (C01–C22) now have weak answer + interviewer follow-up embedded in `seniorAnswer.interviewPhrase`. (2) Debrief failure mode pass — BI01–BI16 and GA01–GA08 have new `failureMode: { weakAnswer, interviewerFollowUp }` field; BIRunner + GrowthAnalyticsRunner updated to render it. Chart cases BI17–BI23 skipped (different format). (3) Review Room — 6 new scenarios appended to scenarios.js (S13–S18): cuped_variance, right_censored, multi_touch, b2b_constraints, geo_holdout, switchback. File grew from 12 to 18 scenarios. Build: ✓ 0 errors.

**V4.53.1** — Maintenance only. Archived CHANGELOG pre-V4.38 → CHANGELOG_ARCHIVE.md. Archived AUDITS Parts I–XXI → AUDITS_ARCHIVE.md. Context limit rules added to CLAUDE.md.

**V4.53.0** — 6 features: Interview Q&A Bank (26 questions, 7 categories, 3-tier Analyst/Senior/Staff answers, /interview-qa). Defense Strategy auto-detection (resume-plan banner with % complete + Resume/Start-fresh actions). Learning Paths (4 paths with checkbox tracking on Progress page, `pal-lp-{pathId}-v1`). Breadcrumb nav (RCARunner, StatsRunner, MetricsRunner, CaseRunner). Leadership notes on all 12 RCA cases. Analytics Failures Catalog (25 patterns, /failures, sidebar label "Failure Patterns").

**V4.52.0** — 30 features: ForwardPointerCard on all 13 runners. StaffLayer/LeadershipLens (Stats/Metrics/Cases + 9 leadership notes). Audit #79 + #80 complete (icon consistency + emoji removal). Defense Layer 4A + 6 (verbal prompt). Quiz Me on Playbook. What's New card + streak. Room map. Verbal Practice (Web Speech API in BehavioralRunner). HowTo shared component (all 4 foundation runners). Challenge Log on Progress. Deep Dives related[].

---

## Next action — audit #104: Supabase finish or cut (still pending)

**Also done this session but IDEAS/AUDITS not yet updated:**
- SQL Lab Study Plan modal — already shipped V4.51.0 (StudyPlanModal at line 274 SqlLabPage.jsx) — mark done in IDEAS.md
- Defense Strategy Layer 4A — already shipped V4.51.0 (SKILL_ARTICLE_MAP at line 123 DefenseDocGenerator.jsx) — mark done in IDEAS.md

## Next action — audit #104: Supabase finish or cut

**Decision required before Batch 2 outreach.** DECISIONS.md is explicit: half-done is worse than either option.

**Option A (finish):** Fix PROGRESS_KEYS drift first (critical — see below), then E2E test with real Supabase project, add auth error handling for invalid credentials + sync failures.

**Option B (cut):** Remove `src/utils/supabase.js`, `src/utils/auth.js`, `src/utils/syncProgress.js`, `src/components/shared/AuthModal.jsx`. Strip auth state from App.jsx. Update README to remove "optional sign-in" claim.

**Why Option B may be faster:** PROGRESS_KEYS has 12+ drifted entries that would silently cause sync to skip most rooms. Fixing all of them is a session on its own before E2E testing even starts.

### PROGRESS_KEYS drift — src/utils/syncProgress.js

Keys in codebase **missing** from PROGRESS_KEYS (sync silently skips these rooms):

| Room | Actual key | Status in sync |
|---|---|---|
| Code | `pal-code-progress-v1` | missing |
| Prioritization | `pal-pri-progress-v1` | missing |
| Spot the Flaw | `pal-stf-progress-v1` | missing |
| SQL Lab | `pal-sql-lab-solved-v1` + 3 more | missing |
| Product Design | `pd-progress-*` prefix pattern | missing |
| Learning Paths | `pal-lp-{pathId}-v1` (4 paths) | missing |

Version/name mismatches (sync writes to wrong key):

| Room | Key in sync | Actual key |
|---|---|---|
| Cases | `pal-cases-progress-v1` | `pal-cases-progress-v2` |
| RCA | `pal-rca-progress-v1` | `pal-rca-progress-v2` |
| Take-Home | `pal-take-home-progress-v1` | `pal-takehome-progress-v1` |
| Exp Foundations | `pal-exp-foundations-progress-v1` | `pal-exp-foundation-progress-v1` |
| Metrics Foundations | `pal-metrics-foundations-progress-v1` | `pal-metrics-foundation-progress-v1` |
| RCA Foundations | `pal-rca-foundations-progress-v1` | `pal-rca-foundation-progress-v1` |

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

---

## Before closing this session

- [ ] Update this file: version, what was done, next action
- [ ] Update NEXT.md: log what shipped, reorder queue
- [ ] Build: `npm run build` (0 errors)
- [ ] Git commit from Mac terminal (sandbox cannot push)

## Git commit template

```bash
cd "/Users/ASUS/Documents/GitHub/experimentation-systems-lab" && rm -f .git/index.lock .git/HEAD.lock && git add -A && git commit -m "V4.X.X: [description]" && git push origin main
```

---

## Open / deferred

- Supabase auth (audit #104) — finish or cut, decide before Batch 2
- Room header icon consistency (audit #79) — remaining browsers not standardized
- Interview Simulator expansion — gated on PostHog showing Simulator usage
- VITE_POSTHOG_KEY confirm in Vercel — user action
