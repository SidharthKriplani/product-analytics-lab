# Brain Transfer — V4.64.0

**Version:** V4.64.0 | **Build:** ✓ (1.78s, 0 errors) | **Git:** uncommitted (push from Mac terminal) | **Date:** 2026-06-02

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

**V4.64.0** — SQL Quality Audit Batch 5 complete. 3 rewrites (e69→arithmetic in SELECT + multi-condition WHERE, e70→dual COUNT+SUM FX exposure, e74→triple aggregate COUNT+SUM+AVG) + 2 debrief upgrades (e78 channel analytics subquery alt, e81 conditional aggregation split) + 1 reclassification (e86 Easy→Medium, window fn + CTE) + 1 company tag fix (e77 Doximity→Athenahealth). Easy tier: 50 problems audited. All core Easy SQL patterns now covered at least once.

**V4.63.0** — SQL Quality Audit Batch 4 complete. 4 rewrites (e55→COALESCE, e57→IN clause, e58→HAVING+JOIN, e59→IN literal+GROUP BY, e60→dual SUM+COUNT) + 2 targeted fixes (e52 checkValues, e56 TC upgrade P2P NULL gap). Anti-join overload in Easy tier resolved — exactly 2 remain (e01, e11). 12 distinct Easy skills now covered across 40 problems.

**V4.62.0** — SQL Quality Audit Batch 3 complete. 4 rewrites (e35→SUM computed JOIN, e40→SUM+JOIN fintech, e42→3-table JOIN expansion, e44→rate calc device OS) + 2 debrief upgrades (e47 NOT EXISTS pattern, e49 median alternative). SQL_QUALITY_AUDIT.md Batch 3 section complete.

**V4.61.0** — SQL Quality Audit Batch 2 complete. 7/10 flagged and rewritten (weakest batch — too-simple WHERE filters, a literal e06 duplicate, and a COUNT cluster). Fixed: e20 (HAVING+JOIN), e23 (JOIN+multi-condition), e26 (AVG), e29 (WHERE+GROUP BY per clinic), e32 (BETWEEN), e34 (multi-column GROUP BY). e33 kept. h16 ID bug fixed to e13, company fixed Doximity→CVS Health. SQL_QUALITY_AUDIT.md Batch 2 section filled.

**V4.60.0** — SQL Quality Audit Batch 1 complete. e07 rewritten (Disengaged Users → Repeat Launchers, teaches HAVING). e10 rewritten (Most Prescribed Drug → Geographic Patient Reach, teaches COUNT DISTINCT + 3-table JOIN). SQL_QUALITY_AUDIT.md created (cumulative audit artifact, all 13 batch slots). 8/10 pass, 2 rewritten.

**V4.59.0** — Profile page (`/profile`). Identity card (OAuth avatar, name, email, provider badge, member since). Practice stats strip (cases done, rooms active, bookmarks). Cross-device sync button. Study plans (Defense + SQL). Recent saved cases. Settings (theme toggle, export/import). Sidebar avatar chip now navigates to profile instead of doing nothing.

**V4.58.0** — Review Room S19–S25 (7 new scenarios). Statefulness fix: `exp-lab-progress-v1` added to PROGRESS_KEYS — Review Room completions now sync cross-device. CHANGELOG updated with V4.56/57/58 entries. All spine MD files current.

**Review Room coverage now:** SRM×2, novelty_peeking×2, hte_subgroups×3, guardrail_breach×2, multiple_testing×3. All thin families closed.

**V4.57.0** — Google OAuth + GitHub OAuth. AuthModal redesigned (real SVG icons, dark-mode correct). All 3 sign-in methods live and E2E tested on production.

**V4.56.0** — Supabase auth complete (audit #104). PROGRESS_KEYS drift fixed. Sign-in button in sidebar. Magic link redirectTo fixed.

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

## Next action — SQL Quality Audit Batch 6 (Medium m01–m10) → PostHog confirm → Batch 1 outreach

**Auth fully live (V4.58.0):** Email magic link ✅, Google OAuth ✅, GitHub OAuth ✅. Sign-in button in sidebar. Progress syncs cross-device (all rooms including Review Room). E2E tested on production URL.

**Remaining pre-Batch 1 user actions:**
1. Git push V4.58.0 from Mac terminal (command in git commit block below)
2. Confirm `VITE_POSTHOG_KEY` is set in Vercel env vars (Settings → Environment Variables)
3. Google consent screen name still propagating — auto-resolves, no action needed

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
cd "/Users/ASUS/Documents/GitHub/experimentation-systems-lab" && rm -f .git/index.lock .git/HEAD.lock && git add -A && git commit -m "V4.64.0: SQL Audit Batch 5. 3 rewrites (arithmetic in SELECT, dual aggregate FX, triple aggregate). 2 debrief upgrades (e78, e81). e86 reclassified Easy→Medium. e77 company fix Doximity→Athenahealth." && git push origin main
```

---

## Open / deferred

- **Supabase audit #104** — finish or cut, decide before Batch 2 (NEXT.md item 1)
- **VITE_POSTHOG_KEY confirm in Vercel** — user action, unblocks all data-driven decisions
- **Git push V4.55.0** — user action (Mac terminal)
- Room header icon consistency (audit #79) — remaining browsers
- Interview Simulator expansion — gated on PostHog usage data
