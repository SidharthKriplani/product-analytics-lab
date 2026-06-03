# Brain Transfer — V4.69.0

**Version:** V4.87.0 | **Build:** ✓ (1.50s, 0 errors) | **Date:** 2026-06-03

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

**17 rooms, 821 modules, 69 articles, 40 MCQ questions, 140 SQL problems (50E/40M/25H/15Master/10Forensic Batch1/10Forensic Batch2), 12 datamarts.**

Auth: Email magic link ✅ · Google OAuth ✅ · GitHub OAuth ✅ · Cross-device sync ✅

SQL Audit: 120/130 problems audited (Batches 1–10 complete). Batch 11 scored but edits not committed (context limit hit previous session).

---

## What was just done

**V4.87.0** — Meesho prep signal extracted + applied. (1) spokenSummary field: rendering infrastructure added to RCADebriefPanel.jsx and CaseRunner.jsx — teal collapsible "30-Second Answer" toggle, shown when field exists. RCA01–RCA04 populated. (2) RCA25 "Seller Active Rate Declined": supply-side marketplace RCA, 3 phases (vintage decomp → T&S context → residual economics), senior difficulty, spokenSummary. (3) RCA26 "Net Revenue Declined, Orders Stable": per-order P&L decomposition (Revenue/order = fee + ad − logistics − discount − RTO), 3 phases, discount burn + RTO compound analysis, spokenSummary. Build ✓ 1.50s.

**V4.86.0** — Full Jatin feedback sequence complete. (1) rcaCases.js L3145 distractor fixed (DAU-down option replaced with plausible demand-side conflation). (2) Stats Foundations persistence: `statsFoundationsState.js` utility created; M01/M21/M23/M24/M25 now save/restore exercise state — 16 slider/visual modules correctly skipped (no exercise state to lose); M27/M28/M32 are stubs, skipped. (3) rf15 Hypothesis Ranking module: 3 scenarios (DAU drop/AOV drop/checkout CVR), user ranks 4 hypotheses per scenario by Impact × Likelihood × Ease, reveal shows expert ranking + per-hypothesis rationale + rubric reference table. Persist/restore. (4) "Never say I would look at the data" injected into RCA case leadershipNotes for C01 (checkout CVR), C03 (marketplace cancellations), C07 (fraud spike) — each with a domain-specific query example. Build ✓ 1.48s.

**V4.85.0** — rf14 Dominant Lever + Pruning module shipped. 3 scenarios (Revenue = Users × CVR × AOV, DAU = New + Retained + Resurrected, Checkout CVR funnel). 2-phase exercise: identify dominant lever → apply pruning rule. Persist/restore state. Reference table on completion. Wired into MODULE_COMPONENTS. businessCases.js C01 Phase 4 option C distractor rewritten (was "segment by demographics" — obviously wrong; now a plausible delivery-time benchmark cut with targeted feedback). Build ✓ 1.31s.

**V4.84.0** — Cross-foundations quality pass. (1) rf13 Routing Gate new module: 6 scenario routing exercise, reference table, persistence, shuffle. (2) Exp Foundations (ef01–ef15): all 15 modules persist + restore state; EF02/EF04/EF11/EF14 item arrays shuffle on first visit; EF01 distractors rewritten with plausible wrong options; intro already had foundational context. (3) Metrics Foundations (mf01–mf13): all 13 modules persist; mf01/mf04/mf05/mf06 item arrays shuffle; mf02 option C and mf11 options A+C rewritten; mf01 intro anchored with "what is metrics analytics." (4) Stats Foundations: different architecture (separate module files — 32 files); Module01 intro anchored with "what is statistics" sentence; persistence not applied (separate-file architecture requires different approach — logged). Build ✓ 1.93s.

**V4.83.0** — Full Jatin feedback implementation. (1) Answer persistence: all 12 RCA Foundation modules (rf01–rf12) now save/restore state via localStorage (`pal-rca-{id}-v1`). On re-opening any module, assignments, selections, MCQ answers, and revealed states are all restored. (2) Item shuffling: ITEMS (rf01), DECOMPS (rf02), FACTORS (rf04), SYMPTOMS (rf10), EVENTS (rf11) all shuffle on first visit and persist the shuffled order. (3) BLUF exercise: rf06 now has a 5-field BLUF practice exercise after the walkthrough — user picks correct phrasing per field, explanation reveals on selection, Complete button gated behind all 5 answers. (4) Remaining items logged: adaptive re-testing (IDEAS.md Tier 1, 2-session project) and new rf13 Routing Gate module (NEXT.md item 1b) with full session-ready specs. Build ✓ 1.98s.

**V4.82.0** — RCA Foundations quality pass (Jatin feedback). (1) rf01 intro: prepended 2-sentence "what is RCA" definition anchor. (2) Distractor rewrite: rf03 Q1 options C+D, rf03 Q2 options A+D, rf05 MCQ options A+C, rf07 Q1 option A, rf08 MCQ option C — all replaced with plausible misconceptions rather than obviously wrong filler. Explanations updated to distinguish correct answer from new distractors. (3) IDEAS.md: logged three new Tier 1 RCA module concepts from Jatin's v4.1 framework doc — Routing Gate, Dominant Lever + Pruning Rule, BLUF Conclusion. Build ✓ 1.99s.

**V4.81.0** — Forensic Batch 2 (f11–f20) shipped. 10 new forensic problems covering: average of averages (AOV, ARPU), JOIN fanout, wrong JOIN type, strftime year missing, ROW_NUMBER wrong ORDER BY direction, NULL in AVG with COALESCE, COUNT vs COUNT(DISTINCT) granularity, UNION ALL duplicates, wrong denominator, WHERE-after-LEFT-JOIN anti-pattern. All 10 use verified checkValues. Build ✓ 2.37s.

**V4.80.2** — Foundations access fix committed + forensic checkValues audit closed. All 4 foundation open functions had paywall checks removed (App.jsx); all foundation modules across all 4 data files confirmed `isFree: true`. Anonymous users can now access all Foundations content freely. Forensic checkValues audit (AUDITS #144): f02–f10 all confirmed correct — no additional fixes needed. Audit item closed as ✅.

**V4.80.1** — Auth gate bug fixes. Foundations runners removed from AUTH_REQUIRED_PAGES (Foundations are open to all — top-of-funnel). Second useEffect added: signed-in users redirected from 'home' to 'progress' reactively (fixes back-button from SQL Lab showing landing page). Build ✓ 2.17s.

**V4.80.0** — 3-tier monetization gate implemented. Anonymous users intercepted from all runners + SQL Lab via AUTH_REQUIRED_PAGES useEffect in App.jsx. getAccessTier() added to unlock.js. 27 Easy SQL problems updated to isFree: true. MONETIZATION.md created (full business model, tier spec, pricing, B2B path). DECISIONS.md monetization standing rules locked. Build ✓ 2.19s.

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

## Next action — Forensic Batch 3 (f21–f25), then S-grade debrief pass Batches 4–13, then room header icon consistency (audit #79)

**Forensic format — Batch 2 (f11–f20) shipped.** 20 forensic problems total. Batch 3 (f21–f25, staff-level: compounding errors, metric definition mismatch, survivorship bias) completes the planned set. Spec in SQL_LAB_PLAN.md Section 12.

**3-tier monetization gate live + foundations fully open.** Anonymous → Foundations fully accessible (no paywall check, all isFree: true). Anonymous → practice runners → auth modal. Signed-in + DAI2026 → everything unlocked.

**Landing page shipped.** Signed-out = full-screen landing. Signed-in = Progress as home.

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
