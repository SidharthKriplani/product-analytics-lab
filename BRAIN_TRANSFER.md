# Brain Transfer — V4.55.0

**Version:** V4.55.0 | **Build:** ✓ (1.70s, 0 errors) | **Git:** uncommitted | **Date:** 2026-06-02

---

## ⚡ SESSION OPEN PROTOCOL — read this, nothing else

**Read this file only.** CLAUDE.md is already in your system prompt. Read NEXT.md only if the next action below is unclear. Never open a source file without grepping first. Reading all MDs at session open burns 80–120k tokens before any work begins — do not do it.

```
1. Connect repo: /Users/ASUS/Documents/GitHub/experimentation-systems-lab
2. Run: rm -f .git/index.lock .git/HEAD.lock && git status && npm run build
3. Read this file → read NEXT.md item 1 → start coding
```

**Grep before Read. Always. No exceptions.**

---

## Current state

**17 rooms, 821 modules, 69 articles, 40 MCQ questions, 130 SQL problems (50E/40M/25H/15Master), 12 datamarts.**

Routes: Stats · Metrics · Design · Review · RCA · Cases · Code · Product Design · Prioritization · Behavioral · Estimation · Growth · BI · Instrumentation · STF · Take-Home · Challenges · SQL Lab · Interview Q&A (/interview-qa, shortcut `i`) · Failures (/failures) · Room Map (/map)

**Debrief failure mode pass — COMPLETE across all 10 rooms (184 cases total):**

| Room | Cases | Method |
|---|---|---|
| RCA | 24 | `interviewPhrase` append (V4.46.0) |
| Metrics | 16 | `interviewPhrase` append (V4.46.0) |
| Stats | 20 | `interviewPhrase` append (V4.46.0) |
| Cases | 20 | `seniorAnswer.interviewPhrase` append (V4.54.0) |
| BI | 16 | `failureMode` object, BIRunner renders (V4.54.0) |
| Growth | 8 | `failureMode` object, GrowthRunner renders (V4.54.0) |
| Instrumentation | 12 | `failureMode` object, InstrumentationRunner renders (V4.55.0) |
| Behavioral | 30 | `failureMode` object, BehavioralRunner renders (V4.55.0) |
| Estimation | 30 | `failureMode` object, EstimationRunner renders (V4.55.0) |
| Design | 8 | `seniorDesign.failureMode`, DesignDebriefPanel renders (V4.55.0) |
| STF | 12 | Embedded in `flaw` field (V4.55.0) |

---

## What was just done

**V4.55.0** — Debrief failure mode pass (5 remaining rooms) + 3 audits resolved.
- Instrumentation/Behavioral/Estimation/Design/STF: failureMode content added. 5 runners updated.
- Audit #100: BIRunner + GrowthRunner imperative hover mutations → useState. Others already clean.
- Audit #99: All .map() key props verified correct across 5 files. No changes needed.
- Audit #91: MCQ Trainer past sessions panel + empty state. Progress zero-state → stat-foundations.

**V4.54.0** — Debrief pass (Cases/BI/Growth) + Review Room expansion + session protocol rewrite.
- Cases (20), BI (16), Growth (8) failureMode content. BIRunner + GrowthRunner updated.
- 6 new Review Room scenarios: cuped_variance, right_censored, multi_touch, b2b_constraints, geo_holdout, switchback. scenarios.js: 12 → 18.
- BRAIN_TRANSFER.md, SESSION_KICKOFF.md, SPINE_PROTOCOL.md, SESSION_STARTER.md rewritten.

**V4.53.1** — Maintenance: CHANGELOG archived pre-V4.38. AUDITS archived Parts I–XXI. Context rules added to CLAUDE.md.

**V4.53.0** — Interview Q&A Bank (26 questions, /interview-qa). Defense auto-detection. Learning Paths. Breadcrumb nav (4 runners). RCA leadership notes (all 12). Analytics Failures catalog (25 patterns, /failures).

**V4.52.0** — 30 features: ForwardPointerCard all 13 runners. StaffLayer/LeadershipLens. Audits #79/#80. Defense Layer 4A+6. Quiz Me on Playbook. What's New + streak. Room map. Verbal Practice. HowTo. Challenge Log. Deep Dives related[].

---

## Next action — Supabase audit #104: finish or cut

**Decision required before Batch 2 outreach.** DECISIONS.md: half-done is worse than either.

**Option A (finish):** Fix PROGRESS_KEYS drift first (see below), then E2E test with real Supabase project, add auth error handling.
**Option B (cut):** Remove `src/utils/supabase.js`, `src/utils/auth.js`, `src/utils/syncProgress.js`, `src/components/shared/AuthModal.jsx`. Strip auth state from App.jsx. Update README.

**PROGRESS_KEYS drift in src/utils/syncProgress.js — fix required before Option A:**

| Room | Actual key | Status in sync |
|---|---|---|
| Code | `pal-code-progress-v1` | missing |
| Prioritization | `pal-pri-progress-v1` | missing |
| Spot the Flaw | `pal-stf-progress-v1` | missing |
| SQL Lab | `pal-sql-lab-solved-v1` + 3 more | missing |
| Product Design | `pd-progress-*` prefix | missing |
| Learning Paths | `pal-lp-{pathId}-v1` (4 paths) | missing |
| Cases | `pal-cases-progress-v1` in sync | actual: `v2` |
| RCA | `pal-rca-progress-v1` in sync | actual: `v2` |
| Take-Home | `pal-take-home-progress-v1` in sync | actual: `pal-takehome-progress-v1` |
| Exp Foundations | `pal-exp-foundations-progress-v1` in sync | actual: `pal-exp-foundation-progress-v1` |
| Metrics Foundations | `pal-metrics-foundations-progress-v1` in sync | actual: `pal-metrics-foundation-progress-v1` |
| RCA Foundations | `pal-rca-foundations-progress-v1` in sync | actual: `pal-rca-foundation-progress-v1` |

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

**failureMode field pattern** (add to any room data file, runner renders it conditionally):
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
- [ ] Git commit from Mac terminal

## Git commit

```bash
cd "/Users/ASUS/Documents/GitHub/experimentation-systems-lab" && rm -f .git/index.lock .git/HEAD.lock && git add -A && git commit -m "V4.55.0: Debrief failure mode pass complete (all 10 rooms, 184 cases). Audits #99+#100+#91 resolved. MCQ Trainer past sessions. Progress zero-state fixed." && git push origin main
```

---

## Open / deferred

- **Supabase audit #104** — finish or cut, decide before Batch 2 (NEXT.md item 1)
- **VITE_POSTHOG_KEY confirm in Vercel** — user action, unblocks all data-driven decisions
- **Git push V4.55.0** — user action (Mac terminal)
- Room header icon consistency (audit #79) — remaining browsers
- Interview Simulator expansion — gated on PostHog usage data
