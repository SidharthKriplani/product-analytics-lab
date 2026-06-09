# Content Audit Sprint — 21 Rooms

**Started:** 2026-06-09 | **Framework:** V5.25.0+

Each room is audited on four axes:
1. **Clarity** — does a user immediately understand what this room is for vs adjacent rooms?
2. **Entry** — is there one clear start-here moment?
3. **Stickiness** — is there a reason to come back?
4. **Content** — do cases/modules pass the quality bar (specific insights, judgment over recall, real decisions)?

Plus for each room: does the first screen answer "what will I be able to do after this that I can't do now?"

---

## Status

| # | Room | Status | Version | Key fixes |
|---|---|---|---|---|
| 01 | Stats Foundations | ✅ Done | V5.25–26 | Difficulty bug fixed (sf26–sf32). Room description added. Start-here CTA added. |
| 02 | Metrics Foundations | ✅ Done | V5.27.0 | Room description + Start-here CTA (V5.26). Header comment fixed (13→17). mf13 renamed to surface false-negative framing. |
| 03 | RCA Foundations | ✅ Done | V5.28.0 | Header comment fixed (12→15). rf10 renamed to "Instrumentation Failure Patterns" (was duplicate title "Data Quality First" with rf03). |
| 04 | A/B Foundations | ✅ Done | V5.28.0 | Clean — no fixes needed. 15 modules, correct difficulty values, strong arc. |
| 05 | Experiments: Stats | ✅ Done | — | No fixes needed. 20 modules (foundational→staff). Description + Next→ badge already present. |
| 06 | Experiments: AB Design | ✅ Done | — | No fixes needed. 8 scenarios. Description, foundation nudge, pairs-with badge, Next→ already present. |
| 07 | Experiments: AB Review | ✅ Done | — | No fixes needed. 32 scenarios. Best room description on the platform. ID number gap (s13-s16 missing) is cosmetic. |
| 08 | Spot the Flaw | ✅ Done | — | No fixes needed. 12 cases, flaw-type filter, strong description. Content quality is high. |
| 09 | Stats Calc | ✅ Done | V5.29.0 | Nav label renamed "Stats Calc" → "A/B Interpreter". Tool already has description + SRM detection. |
| 10 | Analytics: Metrics | ✅ Done | — | No fixes needed. Strong description, Metric Atlas, Metrics Foundations nudge, Next→. |
| 11 | Analytics: RCA | ✅ Done | — | No fixes needed. Strong description, RCA Foundations nudge, Next→. |
| 12 | Analytics: Cases | ✅ Done | V5.29.0 | Nav label "Cases" → "Analytics Cases" (was vaguest label on platform). Description is strong. |
| 13 | Analytics: Growth Analytics | ✅ Done | — | No fixes needed. Strong description, filter system. |
| 14 | BI & Reporting | ✅ Done | — | No fixes needed. Strong description. Chart interaction is future work, not audit-sprint scope. |
| 15 | Analytics: Instrumentation | ✅ Done | — | No fixes needed. Strong description, category filter, 12 cases. |
| 16 | Analytics: Full Loops | ✅ Done | V5.29.0 | Description paragraph added — was missing entirely (only had h1 "End-to-end analyst simulations"). |
| 17 | SQL Lab | ✅ Done | — | Interactive editor format — no browser description needed. SQL Lab label is clear in context. |
| 18 | Product Design | ✅ Done | — | No fixes needed. Strong description, Cases/Theory tabs. |
| 19 | Prioritization | ✅ Done | — | No fixes needed. Strong description, progress tracking. |
| 20 | Behavioral | ✅ Done | — | No fixes needed. Strong description, 30 questions. |
| 21 | Estimation | ✅ Done | — | No fixes needed. Strong description, progress tracking. |

---

## Room-by-Room Findings

### 01 — Stats Foundations ✅

**Clarity:** ⚠️ "Foundations" signals prerequisite homework, not immediate value. The room is actually where you build the mental models that make experiment readouts make sense — that framing isn't communicated.

**Entry:** ⚠️ Module 1 ("What is Data?") is the slowest possible hook. The real hook is somewhere around module 3–4 where the stats-to-product connection first clicks. No guidance for returning practitioners who don't need the basics.

**Stickiness:** ✅ 32 modules, progress tracking, sequential arc. Strong once you're in.

**Content:** ✅ sf01–sf25 keyInsights are specific, scenario-grounded, correct. sf26–sf32 fully built with interactive components. Passes quality bar.

**Fixes applied:**
- Difficulty enum bug fixed on sf26–sf32 (broken filter + wrong chip color)
- devNote fields removed

**Still open:**
- Room description / first-screen copy doesn't answer "what will I be able to do after this?"
- No guidance for practitioners who want to skip basics — no "I know the fundamentals, start me at intermediate"
- Relationship to A/B Foundations and Experiments rooms not communicated anywhere

---

### 02 — Metrics Foundations ✅

**Clarity:** ✅ Room description (added V5.26) answers "what is this for" clearly.

**Entry:** ✅ Start-here CTA works for first-time users. Module 1 (Metrics Hierarchy) is the right hook — it immediately addresses the "40 metrics, no idea which belong where" problem.

**Stickiness:** ✅ 17 modules, good sequential arc from fundamentals through advanced. Coverage is strong: hierarchy → quality → decomposition → ratio traps → guardrails → sensitivity → cohort → unit economics → growth accounting.

**Content:** ✅ All keyInsights are scenario-grounded (not textbook definitions). Specific numbers, real failure modes, memorable stories (leaky bucket, CV=3 checkout experiment, composite score masking a collapse).

**Issues found and fixed:**
- File header comment said "13 modules" — updated to 17
- mf08 ("Metric Sensitivity and Trade-offs") and mf13 ("Metric Sensitivity") had near-identical titles despite teaching distinct lessons. mf08 is prospective (pick low-variance metric before running), mf13 is retrospective (null result may be a false negative). Renamed mf13 to "False Negatives and Metric Choice" with subtitle "How a high-variance primary metric silently discards real improvements"

**Difficulty values:** All correct — Beginner (mf01-02), Intermediate (mf03-06, mf09-11, mf14-15), Advanced (mf07-08, mf12-13, mf16-17).

**No devNote fields.**

**Still open:**
- No guidance for users who've already done analytics work and want to skip basics — no skip-to-advanced path
- Connection between Metrics Foundations and the practice rooms (Analytics: Metrics, Metrics cases) could be more explicit in the room description

---

### 03 — RCA Foundations ✅

**Clarity:** ✅ Room description (V5.26) answers "what is this for." 15-module arc is systematic.

**Entry:** ✅ rf01 (The RCA Framework) is the right hook — immediately addresses the "DAU dropped 18%, what do I do?" panic scenario that every analyst has lived.

**Stickiness:** ✅ 15 modules with strong arc: framework → decompose → data quality → external → segments → recommendation → SQL patterns → multi-level → routing gate → dominant lever → hypothesis ranking. Ends with genuinely advanced material.

**Content:** ✅ keyInsights are scenario-grounded. Specific numbers and memorable framing throughout.

**Issues found and fixed:**
- Header comment said "12 modules" — updated to 15
- rf03 and rf10 had identical title "Data Quality First" — impossible to distinguish on the module grid. rf10 renamed to "Instrumentation Failure Patterns" with subtitle "Recognizing iOS-only, event-level, and pipeline failures before they waste engineering time"

**Difficulty values:** All correct — Beginner (rf01-02), Intermediate (rf03-09, rf13), Advanced (rf10-12, rf14-15).

---

### 04 — A/B Foundations ✅

**Clarity:** ✅ Room description (V5.26) is clear. The 15-module arc from basics to advanced designs is the most sophisticated arc of any foundation room.

**Entry:** ✅ ef01 (Why We Experiment) is the right hook — causality vs correlation is the right starting conflict.

**Stickiness:** ✅ 15 modules spanning 5 tiers: why we experiment → randomization → stats machinery → advanced designs (geo, switchback, bandits). Strong reason to keep going.

**Content:** ✅ Cleanest room in the foundations. Specific scenarios (p=0.03, 14M users per arm, 40 metrics readout), correct statistics, genuinely advanced material in ef11–ef15.

**Issues found and fixed:** None. Header comment is correct (15 modules). All difficulty values correct. No devNote fields. No duplication.

**Still open:** ef01–ef06 don't have `playbookLinks` — minor inconsistency with ef07+. Not a UX problem since the field is optional and not rendered if absent.

---

### 05 — Experiments: Stats

_Pending_

---

### 06 — Experiments: AB Design

_Pending_

---

### 07 — Experiments: AB Review

_Pending_

---

### 08 — Spot the Flaw

_Pending_

---

### 09 — Stats Calc

_Pending — design decision: embed in Stats Foundations + AB Review rather than standalone nav item. Write explainer panel._

---

### 10 — Analytics: Metrics

_Pending_

---

### 11 — Analytics: RCA

_Pending_

---

### 12 — Analytics: Cases

_Pending — rename required. "Cases" is the vaguest nav label on the platform._

---

### 13 — Analytics: Growth Analytics

_Pending_

---

### 14 — BI & Reporting

_Pending — format redesign required before content audit. Currently text-only; room needs chart/graph interaction to demonstrate its own value._

---

### 15 — Analytics: Instrumentation

_Pending_

---

### 16 — Analytics: Full Loops

_Pending — rename required. "Full Loops" actively hides the best room on the platform._

---

### 17 — SQL Lab

_Pending — Batch 11+ correctness verification; hint quality audit._

---

### 18 — Product Design

_Pending_

---

### 19 — Prioritization

_Pending_

---

### 20 — Behavioral

_Pending_

---

### 21 — Estimation

_Pending_
