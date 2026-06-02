# Brain Transfer — V4.69.0

**Version:** V4.79.0 | **Build:** ✓ (2.02s, 0 errors) | **Date:** 2026-06-03

---

## Session open protocol

**Read this file only.** CLAUDE.md is already in your system prompt. Read NEXT.md only if the next action below is unclear. Never open a source file without grepping first.

```
1. Connect repo: /Users/ASUS/Documents/GitHub/experimentation-systems-lab
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

**17 rooms, 821 modules, 69 articles, 40 MCQ questions, 130 SQL problems (50E/40M/25H/15Master), 12 datamarts.**

Auth: Email magic link ✅ · Google OAuth ✅ · GitHub OAuth ✅ · Cross-device sync ✅

SQL Audit: 120/130 problems audited (Batches 1–10 complete). Batch 11 scored but edits not committed (context limit hit previous session).

---

## What was just done

**V4.79.0** — Full signed-out/signed-in UX split. Home.jsx rewritten as clean full-screen landing (no sidebar, ghost analytics snippets, staggered entrance, glow-pulse CTA "Sign in to analyze →"). Signed-in: Progress is home, Progress removed from sidebar nav, logo navigates to progress. signed-out CSS class hides sidebar + resets margin. Build ✓ 2.02s.

**V4.78.0** — Signed-in users land on Progress instead of landing page. One-line routing fix in App.jsx SIGNED_IN handler. All 8 session backlog items logged: AUDITS.md #144-146, IDEAS.md Tier 1/2/3 entries for FV/FA UI, RCA/Metrics content, Postgres migration, MCQ revamp, Interview Sim customization, Pandas (Tier 3/no for SQL Lab). Build ✓ 2.07s.

**V4.77.0** — Forensic format shipped. New `difficulty: 'Forensic'` tier in SQL Lab. 10 forensic problems (f01–f10): integer division, missing quantity, COUNT DISTINCT, = NULL × 2, missing HAVING, re-subscriber churn, COUNT vs COUNT(DISTINCT zip), wrong GROUP BY dimension, off-by-one formula. DIFF_COLOR + filter chip + broken query block UI added to SqlLabPage.jsx. Spec in SQL_LAB_PLAN.md Section 12. Build ✓ 2.16s.

**V4.76.0** — S-Grade Upgrade Pass Batch 3 (Easy e21–e30) complete. FV+FA additions to all 10 problems + MJ/assumption statement on e27+e29. Standouts: e27 integer division all-zero trap (FV=5), e30 COUNT(*) vs COUNT(DISTINCT) returning 187% activation rate (FV=5), e28 churn-with-active-sub business judgment check. Build ✓ 1.61s.

**V4.75.0** — renderDebrief() fix + S-Grade Upgrade Pass Batch 2 (Easy e11–e20) complete. renderDebrief() renders **bold** and paragraph breaks in all debriefs — without this, all FV/FA/MJ additions were invisible (literal asterisks, wall of text). e11–e20 all get FV+FA additions. SQL_UPGRADE_PASS.md Batch 2 scored. Build ✓ 1.96s.

**V4.74.0** — S-Grade Upgrade Pass infrastructure locked + Batch 1 (Easy e01–e10) complete. New 10-dimension rubric (adds MJ/FV/FA) in DECISIONS.md. Section 11 added to SQL_LAB_PLAN.md. SQL_UPGRADE_PASS.md created as tracking artifact. Layer 2 (forensic/impossible/cascade/code-review formats) logged in IDEAS.md Tier 1. No build needed (MD-only changes + debrief additions to sqlLabProblems.js).

**V4.73.0** — SQL Quality Audit COMPLETE. Batch 13 (final 7 Master problems): 6/7 flagged. 3 rewrites: master18→Seller Scorecard (Etsy, marketplace, conditional aggregation + RANK), master19→Driver On-Time (DHL, logistics, SLA analytics), master25→Post Engagement (Reddit, social_network, ROW_NUMBER PARTITION BY). 3 debrief upgrades: master12 (3-CTE coverage formula + tie-break), master14 (active-account filter caveat), master26 (recursive chain explanation). master27 clean. Build ✓ 2.21s. **THE 13-BATCH SQL QUALITY AUDIT IS COMPLETE.**

**V4.72.0** — SQL Audit Batch 12 (Master master01–master10). 4/8 flagged. Fixes: master02 company (Meta→Wayfair) + checkValue; master03 rewritten (channel LTV clone→category gross margin, 3-table JOIN + RANK); master05 expectedRowCount fixed (3→2), checkValues added, company (Chime→Revolut); master10 debrief cleaned (unfinished text removed) + TC upgraded. Build ✓ 2.41s.

**V4.71.0** — MD consolidation + SQL Audit Batch 11. MD: deleted 4 noise files (SESSION_KICKOFF, SESSION_STARTER, SPINE_PROTOCOL, GIT_COMMIT_TEMPLATE), created docs/archive/ with 6 archived files (AUDITS_ARCHIVE, CHANGELOG_ARCHIVE, PLATFORM_ARCHITECTURE_MEMO, PRD_V1, ROADMAP_V425, SETUP_AUTH), trimmed NEXT.md (183→35 lines), trimmed BRAIN_TRANSFER history, removed duplicate CSS/animation content from DECISIONS.md. SQL Batch 11: 3 reclassifications (master07 already Master, master13+master21 Hard→Master), 2 rewrites (master13→3-CTE cohort repurchase, h33→AVG OVER PARTITION BY category benchmark, h34→self-join prescription safety). Build ✓ 1.85s.

**V4.70.0** — SQL Quality Audit Batch 10 (Hard h01–h17). Best batch: 7/10 pass, 2 perfect scores (h01=35, h11=35). 3 rewrites: h07 (MoM clone→new/returning split), h10 (ROW_NUMBER clone→4-table JOIN P2P NULL trap), h13 (SUM(SUM) clone→PERCENT_RANK LTV). h17 checkValues fixed.

**V4.69.0** — SQL Quality Audit Batch 9 (Medium, file positions 31–40). 4/10 flagged. 4 rewrites: h14 (funnel temporal ordering), h22 (completion rate JOIN), h25 (MoM revenue LAG), h27 (activity bucketing LEFT JOIN+CASE WHEN). 3 new datamarts: hr_analytics, marketplace, food_delivery.

---

## Next action — Forensic Format Batch 2 (f11–f20)

**Forensic format — in progress.** New `difficulty: 'Forensic'` tier in SQL Lab. Broken query shown upfront, user finds bug + writes fix. Target ~25 problems. Batch 1 (f01–f10) building now. Spec in SQL_LAB_PLAN.md Section 12. S-grade debrief pass (Batches 4–13) paused — forensic is the structural improvement, debrief pass was documentation.

New rubric: 10 dimensions (MJ + FV + FA added), max 50, flag < 30 or any dim < 3. Rubric in DECISIONS.md. Batch map in SQL_LAB_PLAN.md Section 11. Scores in SQL_UPGRADE_PASS.md.

Active reference for this pass: `SQL_UPGRADE_PASS.md` → current batch + scores. Read it, not this file, for batch state.

Layer 2 (forensic/impossible/cascade formats) logged in IDEAS.md — own product sprint, do not start yet.

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
cd "/Users/ASUS/Documents/GitHub/experimentation-systems-lab" && rm -f .git/index.lock .git/HEAD.lock && git add -A && git commit -m "V4.X.X: [description]" && git push origin main
```

**If git is stuck (lock files):**
```bash
cd "/Users/ASUS/Documents/GitHub/experimentation-systems-lab" && rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/main.lock && git add -A && git commit -m "V4.X.X: [description]" && git push origin main
```

**If push is rejected:**
```bash
git fetch origin main && git push origin main
```
