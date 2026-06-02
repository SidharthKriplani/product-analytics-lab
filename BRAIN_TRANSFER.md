# BRAIN TRANSFER — PAL Session Context & Protocols

**Date:** 2026-06-02 (V4.43.0–V4.49.0 build cycle)  
**Current State:** All 10 MD files audited + updated. Zero stale state. Ready for next execution phase.

---

## Session Summary (What Just Shipped)

### V4.49.0 — Shareable Score Summary + Tier 5-6 Architecture
- **Feature:** Gradient score card in Interview Simulator debrief with "Copy Score" button
- **Audience:** LinkedIn/resume sharing (format: "PAL: 18/20 · 90% · Product Analyst (Senior) · 45:32")
- **Tracking:** New PostHog event `score_summary_copied` added to METRICS.md
- **Architecture:** Tier 2-4 reorganized into Tier 5A-5F by ROI clusters + Tier 6 long-term strategic work

### V4.48.0 — Per-Room Breakdown Chart
- **Feature:** Recharts BarChart in Interview Simulator debrief showing % correct by skill/room
- **Scope:** MCQ + mixed-mode sessions only; open-ended sessions skip the chart
- **Value:** Clearer skill-gap signal than summary score alone

### Earlier in Cycle (V4.43–V4.47)
- V4.47: BI chart interpretation scenarios (7 visual cases, ChartScenario component)
- V4.46: SQL Lab Phase 3 (company/datamart filters, PostHog events, heatmap) + Foundation rewrites (65 modules situation-first)
- V4.45: Difficulty taxonomy standardization + DifficultyChips filter component
- V4.44: Audit #96 canonicalization
- V4.43: SQL Lab nav/UX, 130 problems target, hints system (130 hints across all problems)

---

## Critical Pattern: MD File Staleness ("Breaking the Spine")

### The Problem You Caught

I have a recurring pattern:
1. Update the "main" 4 files (NEXT, CHANGELOG, IDEAS, ROLLOUT) ✅
2. Skip or half-update the secondary 6 files (METRICS, AUDITS, DECISIONS, LINEAGE, SQL_LAB_PLAN, CROSS_LAB) with lazy assumptions
3. Leave them stale → next session wastes tokens fixing the mess
4. This compounds documentation debt

**This breaks the project's informational spine** — stale docs → wrong assumptions → cascading bugs in future work.

### The Fix: Non-Negotiable MD Update Protocol

**Every session that touches features/architecture MUST:**

```
For each of 10 files (in order):
  1. Read 10-line header + status/version line
  2. Assess: change needed?
     YES → Read full file, update thoroughly, note in commit
     NO → Add one-line verification note ("No changes in V4.X, reason: ...")
  3. Output: ✅ [Filename] — [action taken]

Before git push:
  4. Verify all 10 files have explicit notes or updates (no silent skips)
  5. Check version consistency across files
```

**Files and their purposes:**

| File | Type | Must Update When | Minimum Note |
|---|---|---|---|
| NEXT.md | Operational | Every session | Version bump + one-line summary |
| CHANGELOG.md | Build log | Every version | New entry with what changed |
| IDEAS.md | Backlog | Features shipped/restructured | Mark shipped, move tiers, update clusters |
| ROLLOUT.md | Gate status | Status changes | Current version, gate progress |
| METRICS.md | Tracking | New PostHog events added | Event row + property names |
| AUDITS.md | Diagnosis | Audits resolved/opened | Status update, no silent skips |
| DECISIONS.md | Rulebook | Standing rules changed | Note which rules still apply |
| LINEAGE.md | Narrative | Structural pivots only | Skip intentionally (narrative, not version log) |
| SQL_LAB_PLAN.md | SQL-specific | SQL Lab work done | Detailed update OR version ref only |
| CROSS_LAB.md | Cross-lab | Cross-lab patterns found | Update findings OR version ref only |

**Why this matters:** Next chat will inherit a clean spine and save 2-3k tokens that would otherwise be spent fixing stale docs.

---

## Tier 5-6 Architecture (Ready for Execution)

### Tier 5 — Strategic Work Clusters (by ROI)

**5A — Interview Prep Acceleration**
- Defense Strategy Layer 4A (micro-sequence per skill, Playbook linking)
- Quiz Me on Playbook articles (auto-MCQs from article content)
- Verbal practice with speech-to-text (Web Speech API + self-score)
- Effort: M-H | Impact: H | Gates: None

**5B — Code Execution + Timing**
- Code Room — SQL playground (in-browser sql.js + sample datasets)
- Code Lab SQL + Python hybrid (Pyodide + sql.js in one session)
- Timed exam lock mechanic (30/45/60-min answer lock until timer ends)
- Effort: M | Impact: H | Gates: None

**5C — Feedback Loops + Guidance**
- Learning paths with checkpoint tracking ("6-week Interview Ready," "Metrics Mastery")
- Weak topic heatmap in Trainer debrief (colored grid: Metrics/Stats/RCA/etc. % correct)
- Forward-pointer card at case endings (one related case + one Defense angle + one Company track)
- Effort: M-H | Impact: H | Gates: None

**5D — Content Organization**
- Deep Dives IA overhaul (series view → tag filtering → personalized sections)
- Interview Experiences tab (skill frequency graph from 20–30 curated experiences)
- Effort: M-H | Impact: M | Gates: Content gate (need 6+ full posts per category)

**5E — UX Polish + Navigation**
- Room relationship map (visual learning arc: Analytics → SQL → PM/judgment tracks)
- Difficulty badges on room entry cards (Junior/Mid/Senior + estimated time)
- Keyboard shortcuts in Trainer/Challenges (1/2/3/4 for options, Enter for submit)
- Progress export/import (JSON device handoff without Supabase)
- Effort: M | Impact: M-H | Gates: None

**5F — Sharing + Social**
- Share buttons + deep-link routing (per-problem/per-case URLs)
- Share score clipboard button (already shipped V4.49.0 as part of score summary)
- Effort: M-H | Impact: M | Gates: Routing infrastructure needed first (5E prerequisite)

### Tier 6 — Long-Term Strategic (User Research Gates)

**User Research Gates (wait for signal before investing)**
- **India PM Company Tracks** (Meesho, Swiggy, Zepto, Blinkit, etc.) — Gate: PostHog confirms Indian user cohort
- **Concept drawer inline SVG illustrations** — Gate: Batch 1 feedback confirms comprehension gap
- **Country-curated content filter** — Gate: India user signal + enough case variants

**Platform Investments (no user gate, but significant effort)**
- Learning path completion certificates (downloadable PDF, LinkedIn shareable)
- Breadcrumb nav on case runners ("PAL > RCA > Case Bank > RCA07")
- Skill category tagging across rooms (8 core skills, cross-room filtering)
- ELI5 mode toggle on Playbook articles (simplified register per article)
- PWA + offline support (service worker, installable, mobile commute)
- Marketplace metric tree interactive module (GMV decomposition, category/cohort drill-down)
- Multi-part escalating case dossiers (3–5 part company scenarios)
- Interview Q&A bank with 4-tier model answers (Junior/Mid/Senior/Principal)
- Analytics Failures catalog (25 named patterns: bad event taxonomy, selection bias, Simpson's Paradox, etc.)

**Hard Prerequisites (gates)**
- ⏳ **Supabase auth decision** (NEXT.md item 1 — finish or cut before Batch 2)
- ⏳ **PostHog baseline** (20 real sessions watched, room drop-off identified)
- ⏳ **Paywall strategy decision** (when to flip `isUnlocked()` to false)

---

## Token Optimization for Next Chat

### What Costs Tokens (Avoid in New Chat)

1. **Re-reading old CLAUDE.md context** — Already in this file, don't re-read the project context doc
2. **Re-auditing MD file staleness** — This session did it; just verify version refs match before commit
3. **Re-explaining project history** — LINEAGE.md + CHANGELOG.md exist for that
4. **Re-validating architecture decisions** — DECISIONS.md is standing rules; don't re-debate them

### What Saves Tokens (Maximize in New Chat)

1. **Start with one task, not five** — Focus → depth → correctness beats breadth
2. **Read all prerequisites before building** — A 5-minute read of DECISIONS.md + relevant data file prevents 30 mins of rework
3. **Use the MD file update protocol** — Systematic updates cost fewer tokens than debugging stale docs later
4. **Batch similar changes** — If modifying multiple room browsers, do them all in one pass, not spread across sessions
5. **Defer content sourcing** — Large content writes (India tracks, failure catalog) are token-heavy; prioritize code features first

### Estimates for Tier 5 Items

| Cluster | Item | Effort (tokens/time) | Best Session Type |
|---|---|---|---|
| 5A | Defense Strategy Layer 4A | M (4-6k) | Focused feature sprint |
| 5A | Quiz Me on Playbook | M (4-6k) | Focused feature sprint |
| 5B | SQL playground | M-H (6-8k) | Code-heavy session |
| 5B | Code Lab hybrid | M (4-6k) | Code-heavy session |
| 5C | Learning paths | M (4-6k) | Data + component build |
| 5C | Weak heatmap | M (4-6k) | Chart integration |
| 5E | Room map visualization | M (4-6k) | Design decision first |
| 5E | Keyboard shortcuts (Trainer) | L (2-3k) | Quick win |

**General rule:** A focused session on 1-2 Tier 5 items + thorough MD update + testing beats trying to do 4 items half-assed.

---

## Current Blockers & Gates

### Blocking Item 1: Supabase Auth Finish-or-Cut (NEXT.md Item 1)

**Status:** Auth code exists, not verified as production-complete.

**Decision needed before Batch 2:** 
- **(A) Complete it:** E2E test with real Supabase project, verify `PROGRESS_KEYS` in `syncProgress.js` covers all current rooms (17 now, was 18 before), add auth error handling
- **(B) Remove it:** Ship localStorage-first, defer Supabase until Stripe sprint makes backend investment justified

**Why it matters:** Half-done auth is worse than no auth. The README says "optional sign-in for cross-device sync" — this claim must be true.

### Blocking Item 2: PostHog Key Confirmation

**Status:** Key set in Vercel config, activation status unknown.

**Next action:** User must verify in Vercel dashboard that `VITE_POSTHOG_KEY` is live in production.

### Blocking Item 3: PostHog Baseline Watch

**Status:** No baseline established yet.

**Next action:** Watch 20 real user sessions, identify:
- Which room first (onboarding pattern)
- Where users drop off
- Do they reach debrief
- Return visit rate signal

**Why it matters:** No paywall flip decision until we observe real behavior, not assumptions.

---

## What's in the Repo (State as of V4.49.0)

### Build State
- ✅ Zero build errors
- ✅ All 10 MD files current (no stale state)
- ✅ Git ready to push V4.43.0–V4.49.0
- ✅ Vercel deployment: V4.47.0 live (V4.48-49 ready but awaiting push)

### Code State
- ✅ InterviewSimulator.jsx — per-room breakdown chart + shareable score summary
- ✅ roomConfig.js — standardized room metadata (icons, colors, shortcuts)
- ✅ App.jsx — keyboard shortcuts for all rooms + utilities
- ✅ Home.jsx — keyboard shortcut badges on room cards
- ✅ All data files validate via validate-data.js

### Data State
- ✅ 17 rooms + 13 practice tools
- ✅ 150+ playable cases
- ✅ 65 foundation modules (situation-first)
- ✅ 130 SQL Lab problems (cleaned, no duplicates)
- ✅ 81 Playbook articles (mostly stubs, 12 full content)
- ✅ Difficulty taxonomy normalized (analyst/senior/staff)
- ✅ Access code gate live (`DAI2026` community tier)
- ✅ Paywall gate scaffolded but not activated (`isUnlocked()` returns true)

---

## Critical Files to Know

### Architecture
- `src/App.jsx` — routing, keyboard shortcuts, track() calls
- `src/data/roomConfig.js` — room metadata (icons, colors, shortcuts) — **created V4.49**
- `src/utils/analytics.js` — PostHog wrapper
- `src/utils/unlock.js` — paywall gate (currently always true, marked TODO)
- `src/utils/syncProgress.js` — Supabase sync + localStorage keys

### Styling
- `src/index.css` — full CSS variable theme system + animation utility classes
- Pattern: `var(--accent)`, `var(--surface)`, `.pal-page-enter`, `.pal-card-hover`, etc.
- Never hardcode colors or animations

### Data
- `src/data/[room]Cases.js` or `[room]Modules.js` — all single quotes, escaped apostrophes
- All have `difficulty: 'analyst' | 'senior' | 'staff'` field
- SQL Lab split: `sqlLabDatamarts.js` (schema + seed) + `sqlLabProblems.js` (problems only) — never merge

### Components
- Lazy loading: `React.lazy(() => import('./pages/X.jsx').then(m => ({ default: m.X })))`
- Every room page exports named (e.g., `export const StatsBrowser`)
- Every runner has `onBack`, `onNext`, `unlocked` props
- Shared components in `src/components/shared/` (DifficultyChips, Icon, etc.)

---

## Handoff Checklist for Next Chat

Before starting work:
- [ ] Read this file (you're reading it)
- [ ] Read CLAUDE.md (project identity + non-negotiable code rules)
- [ ] Skim DECISIONS.md (standing rules — check before architectural choices)
- [ ] Check NEXT.md (current session queue)
- [ ] Verify all 10 MD files have V4.49.0 references (staleness check)

Before committing:
- [ ] Update all 10 MD files using the protocol above
- [ ] Verify version refs consistent across all files
- [ ] Run validate-data.js on any data file changes
- [ ] Check zero build errors (`npm run dev`)

---

## What Success Looks Like

**For Tier 5 Execution:**
- 1-2 items shipped per session (focused depth)
- All 10 MD files updated before each git push
- Zero stale state carried forward
- Token efficiency: <8k per focused feature, <12k per heavy feature + testing + docs

**For the Project:**
- V4.49.0 ships cleanly (when user confirms PostHog key live)
- Batch 1 testers see solid feature parity (17 rooms, judgment-focused, no gaps)
- PostHog baseline collected (wait, don't guess)
- Paywall decision data-driven (observed behavior, not assumptions)

---

## Questions to Resolve in Next Sessions

1. **Supabase auth:** Finish or cut? (Blocks Batch 2, must decide soon)
2. **India tracks:** When do we have user signal to justify content investment?
3. **Deep Dives IA:** How many posts need full content before we relaunch? (Current: 12/81)
4. **Interview Experiences tab:** How to source 20-30 real experiences without building ingestion UI?
5. **Room map:** SVG diagram vs. CSS grid + connecting lines? (Design decision pending)

---

## Sign-Off

**Current Owner:** You (Avinash)  
**Last Coherent State:** V4.49.0 (2026-06-02)  
**All Code Changes:** In repo  
**All Decisions:** In DECISIONS.md + IDEAS.md  
**Next Step:** Git push V4.43.0–V4.49.0, confirm PostHog key live, begin Tier 5 execution

**Zero Context Lost. Spine Unbroken. Ready to Build.**
