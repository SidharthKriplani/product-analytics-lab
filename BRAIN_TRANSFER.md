# Brain Transfer — V4.69.0

**Version:** V4.69.0 | **Build:** ✓ (2.20s, 0 errors) | **Date:** 2026-06-02

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

**V4.69.0** — SQL Quality Audit Batch 10 (Hard h01–h17, file positions 1–10). Best batch: 7/10 pass, 2 perfect scores (h01=35, h11=35). 3 rewrites: h07 (MoM clone→new/returning split), h10 (ROW_NUMBER clone→4-table JOIN P2P NULL trap), h13 (SUM(SUM) clone→PERCENT_RANK LTV). h17 checkValues fixed.

**V4.68.0** — SQL Quality Audit Batch 9 (Medium, file positions 31–40). 4/10 flagged. 4 rewrites: h14 (funnel temporal ordering), h22 (completion rate JOIN), h25 (MoM revenue LAG), h27 (activity bucketing LEFT JOIN+CASE WHEN). 3 new datamarts: hr_analytics, marketplace, food_delivery.

**V4.67.0** — SQL Quality Audit Batch 8 (Medium m36–m61). Live bug fixed (m36 temporal ordering). 3 rewrites: m37 (channel conversion rate), m47 (ROWS BETWEEN rolling avg), m56 (relational division). m57 dual DENSE_RANK upgrade. Trap enrichment taxonomy documented in SQL_LAB_PLAN Section 10.

---

## Next action — Batch 11 (resume)

Batch 11 was scored last session (h24, master07/13/21, h31–h34, h41, h42) but edits were not executed. Scores:

| ID | Score | Action |
|---|---|---|
| h24 | 32 | ✅ clean |
| master07 | 29 | reclassify difficulty Hard→Master only |
| master13 | 25 | rewrite + reclassify Hard→Master |
| master21 | 26 | reclassify difficulty Hard→Master only |
| h31 | 29 | ✅ clean |
| h32 | 28 | ✅ clean |
| h33 | 26 | rewrite (Di=2, CTE+JOIN clone) |
| h34 | 26 | rewrite (Di=2, LAG+JULIANDAY clone) |
| h41 | 32 | ✅ clean |
| h42 | 35 | ✅ perfect |

**Execute:** 3 reclassifications (master07/13/21 difficulty field) + 2 rewrites (h33, h34) + MD updates + build + git.

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
