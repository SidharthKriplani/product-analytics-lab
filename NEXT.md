# NEXT.md — Session Queue

Read this at the start of every build session. Do only this. Update before closing.

**Rule:** Max 5 items, ordered by priority. Never a dump — if it grows past 5, something doesn't belong here. When done, cross off, reorder, add what carries forward.

*Last updated: V4.64.0 (2026-06-02) — SQL Audit Batch 5 complete. 50 Easy problems audited. e69/e70/e74 rewritten, e78/e81 debriefs upgraded, e86 reclassified Medium, e77 company fixed.*

---

## Pre-beta gates (do before Batch 1 invites)

1. **Git push V4.58.0** — run from Mac terminal (command in BRAIN_TRANSFER.md)
2. **Confirm `VITE_POSTHOG_KEY` is live in Vercel** — check env vars in Vercel dashboard

---

## Next session

**1. SQL Quality Audit — Batch 10 (Hard h01–h10)**
Score full batch, fix flagged, build+verify, ship. Hard rubric: chaining 2+ advanced concepts, naive approach gives wrong answer. See SQL_QUALITY_AUDIT.md for running scores.

**2. Confirm VITE_POSTHOG_KEY live in Vercel** — check env vars dashboard, establish WAU baseline before Batch 1 outreach.

---

## Deferred (own sessions, not blocking)

**Room header icon consistency (audit #79)**
Standardize all room browser headers to the 36×36 colored box pattern with Icon component. Same pass as emoji removal but for icon layout.

**Interview Simulator expansion (Batch 0 feedback)**
Split DS/PM modes into specific roles (Product Analyst, Business Analyst, Data Analyst, PM) with Senior/Staff tiers. Question bank needs depth first. Gate: PostHog confirms Simulator usage worth investing in.

**Supabase auth — finish or cut (audit #104)**
See Next session item 1.

---

## Carry-forward log

**Done this session (V4.68.0):**
- SQL Audit Batch 9 complete (h14,h22,h25,h27,h28,h39,h49,m76,m77,m78 — Medium positions 31–40). Best pass rate yet: 4/10 flagged. 4 rewrites: h14 (funnel temporal ordering), h22 (completion rate JOIN), h25 (MoM revenue LAG), h27 (activity bucketing LEFT JOIN+CASE WHEN). 3 new datamarts introduced. Build: ✓ 2.09s.

**Done this session (V4.67.0):**
- SQL Audit Batch 8 complete (m36–m61, file positions 21–30). 6/10 flagged. Live bug fixed (m36 temporal ordering — user 12 was false positive). 3 rewrites: m37 (channel conversion rate), m47 (ROWS BETWEEN bounded rolling avg), m56 (relational division). m57 dual DENSE_RANK upgrade. m42 checkValues. m61 debrief. Trap enrichment taxonomy logged in SQL_LAB_PLAN Section 10, IDEAS Tier 1, DECISIONS. Build: ✓ 2.27s.

**Done this session (V4.66.0):**
- SQL Audit Batch 7 complete (m21–m33, file positions 11–20). 7/10 flagged — worst batch since Easy B2. 3 rewrites: m21 (NTILE quartile), m28 (global AVG OVER benchmark), m30 (SUM(SUM) OVER pct-of-total, fintech). 3 checkValues bugs fixed (m24,m26,m29). m24 company dup (Gainsight→Salesforce). m32+m33 debriefs upgraded. Build: ✓ 2.09s.

**Done this session (V4.65.0):**
- SQL Audit Batch 6 complete (Medium m01–m20, file positions 1–10). 4 flagged. 3 rewrites: m07 (anti-join → JULIANDAY date arithmetic, CTE+MIN), m09 (Easy-level strftime → CTE+LAG MoM), m14 (3rd conditional aggregation → DENSE_RANK PARTITION BY). m13 checkValues bug fixed. 5 distinct window functions covered.
- Build: ✓ 1.76s, 0 errors.

**Done this session (V4.64.0):**
- SQL Audit Batch 5 complete (e67–e86, file positions 41–50). 6/10 flagged. 3 rewrites: e69 (arithmetic in SELECT + multi-condition WHERE), e70 (dual COUNT+SUM with WHERE pre-filter), e74 (triple aggregate COUNT+SUM+AVG). 2 debrief upgrades: e78 (subquery alt + zero-order LEFT JOIN), e81 (conditional aggregation split). e86 reclassified Easy→Medium (PERCENT_RANK + CTE). e77 company fixed Doximity→Athenahealth. 50 Easy problems fully audited.
- Build: ✓ 1.78s, 0 errors.

**Done this session (V4.55.0):**
- Debrief failure mode pass — Instrumentation (12), Behavioral (30), Estimation (30), Design (8), STF (12). All 5 runners updated to render `failureMode` field. DesignDebriefPanel updated separately.
- Audit #99 — key props verified across MetricChoicePanel, MetricDebriefPanel, RCAFoundationsRunner, ChallengesRunner. All .map() calls already had correct keys.
- Audit #100 — BIRunner + GrowthRunner imperative hover mutations replaced with useState. MetricDebriefPanel, RCADebriefPanel, CaseDebriefPanel already correct.
- Audit #91 — MCQ Trainer: past sessions panel added (empty state + last 3 sessions). Progress page: zero-state now routes to stat-foundations with correct copy. BookmarksBrowser + LockOverlay confirmed.
- Build: ✓ 821 modules, 0 errors.

**Done this session (V4.59.0):**
- Profile page at `/profile`. Sections: identity card (OAuth avatar, name, email, provider badge, member since), practice stats (cases done + rooms active + bookmarks count + per-room breakdown), cross-device sync button (manual push+pull), study plans (Defense Strategy + SQL Lab plan status with nav links), recent saved cases (last 4 bookmarks), settings (theme toggle, export/import progress).
- Sidebar: avatar chip now navigates to `/profile` and shows OAuth avatar image if available. Shows display name from OAuth metadata when present.
- Files: `src/pages/ProfilePage.jsx` (new), `src/App.jsx` (lazy import + route), `src/components/layout/Sidebar.jsx` (avatar chip redesign).
- Build: ✓ 1.88s, 0 errors.

**Done this session (V4.58.0):**
- Review Room S19–S25: 7 new scenarios added (18 → 25). Thin families closed: SRM×2, novelty_peeking×2, hte_subgroups×3, guardrail_breach×2, multiple_testing×3.
- Statefulness fix: `exp-lab-progress-v1` (Review Room localStorage key) was missing from PROGRESS_KEYS in syncProgress.js. All rooms now sync cross-device.
- CHANGELOG updated with V4.56.0, V4.57.0, V4.58.0 entries. BRAIN_TRANSFER.md and NEXT.md fully current.
- Build: ✓ 1.79s, 0 errors.

**Done this session (V4.57.0):**
- Google OAuth + GitHub OAuth added to AuthModal. Real SVG icons (proper Google multicolor, GitHub). Dark-mode correct button styling using CSS variables. `signInWithGitHub()` added to auth.js. `redirectTo: window.location.origin` on both OAuth providers. E2E tested: Google sign-in works on production URL. GitHub enabled in Supabase. Google consent screen published (name propagating).

**Done this session (V4.56.0):**
- Supabase auth complete (audit #104 resolved). Fixed all PROGRESS_KEYS drift — 6 wrong key names corrected, 9 missing keys added, dynamic `pd-progress-*` prefix handling for Product Design. Sign-in button added to sidebar bottom. `emailRedirectTo: window.location.origin` added so magic links land on correct URL. `.env.local` created. E2E tested — sign in works, user appears in Supabase Users table.

**Done this session (V4.54.0):**
- Debrief failure mode pass — Cases room: 20 cases (C01–C22) now have `\n\n**Weak answer:** ... **Interviewer follow-up:** ...` appended to `seniorAnswer.interviewPhrase`
- Debrief failure mode pass — BI room: BI01–BI16 have `failureMode: { weakAnswer, interviewerFollowUp }` field. BIRunner renders it after leadershipNote.
- Debrief failure mode pass — Growth room: GA01–GA08 have `failureMode` field. GrowthAnalyticsRunner renders it after leadershipNote.
- Review Room — 6 new scenarios: S13 (cuped_variance), S14 (right_censored), S15 (multi_touch), S16 (b2b_constraints), S17 (geo_holdout), S18 (switchback). scenarios.js: 12 → 18 scenarios.
- Session protocol files rewritten (BRAIN_TRANSFER.md, SESSION_KICKOFF.md, SPINE_PROTOCOL.md, SESSION_STARTER.md) for token efficiency.
- Build: ✓ 0 errors.

**Done this session (V4.53.0 — 6 high-value features):**
- **Interview Q&A Bank** — new room at `/interview-qa` (shortcut `i`). 26 analytical PA/PM questions across 7 categories (Experimentation, Metrics, RCA, Product Sense, Statistics, SQL, Growth, BI, Instrumentation) with Analyst/Senior/Staff model answers. QuestionViewer with tier selector, think-first prompt, explanation of what separates each tier.
- **Defense Strategy auto-detection** — resume-plan banner on input screen: shows "X% complete, Y cases done, Z days ago" with progress bar and "Resume plan →" / "Start fresh" actions.
- **Learning Paths with checkpoint tracking** — 4 paths (Analytics Ready 6-week, Metrics Mastery, SQL Track, PM Track) as SectionCard on Progress page. Each step has a checkbox, "mark complete" interaction, and direct nav link. Progress tracked in localStorage per path.
- **Breadcrumb nav** — PAL → Room → CaseID breadcrumb added to RCARunner, StatsRunner, MetricsRunner, CaseRunner.
- **Leadership notes for all 12 RCA cases** — all RCA01–RCA12 now have Staff-level leadershipNote. GA cases were already complete.
- **Analytics Failures catalog** — 25 named failure patterns at `/failures` (Failure Patterns in sidebar). Each failure has: symptom, root cause, detection method, fix, and a "Practice this in PAL" link to the relevant room. Categories: Instrumentation, SQL, Experimentation, Analysis, Metrics, Measurement.
- Build: ✓ 821 modules, 0 errors.

**Done this session (V4.52.0 — 15 high-ROI features from sibling repo analysis + PAL backlog):**
- ForwardPointerCard wired into ALL 13 runners (Stats, Metrics, Design, Review, Behavioral, Estimation, Growth, BI, STF, Instrumentation, Prioritization, ProductDesign, Challenges) + App.jsx onNavigate wired to all
- StaffLayer / LeadershipLens shared component built + wired into Stats, Metrics, Cases runners + 9 leadership notes written (3 per room: STAT01-03, M01-03, C01-03)
- Audit #79 complete: 8 browsers standardized to 36×36 icon box pattern (Growth, Challenges, Prioritization, ProductDesign, Estimation, Playbook, Blog, others)
- Audit #80 complete: emoji removal finished across all remaining browsers
- Defense Strategy micro-sequence Layer 4A fully complete: Foundation module link + MCQ Trainer category link added alongside Playbook link
- Defense Strategy Layer 6: verbal articulation prompt at end of every day card (skill-specific, 90-second format)
- Quiz Me on Playbook articles: QuizMe component in PostDetail with 3 MCQs drawn from trainerMCQ by category
- What's New card + daily streak badge on Home.jsx
- Room relationship map: new /map route + RoomMap.jsx showing all 3 tracks + tools layer
- Verbal Practice (Web Speech API) in BehavioralRunner: mic toggle, continuous transcription, degrades gracefully
- Audit #99 + #100: key props fixed, imperative DOM mutations replaced with React hover state in 4 debrief panels
- HowTo shared component built + wired into all 4 foundation runners
- Challenge Log on Progress page: 10 most recent completions across all rooms with date, room, id, rating
- Audit #90: related[] arrays on first 10 Deep Dives posts + Keep reading strip in PostReader
- ForwardPointerCard on StatsFoundationsRunner + HowTo block added
- Build: ✓ 816 modules, 0 errors.

**Done this session (V4.51.0 — 15 product features):**
- FoundationNudgeCard integrated into RCABrowser, MetricsBrowser, CasesBrowser, DesignBrowser, ScenarioBrowser (replaces inline non-dismissable nudges with proper dismissable + foundation-completion-aware component)
- BeginnerOnboardingTrack integrated into Home.jsx (replaces inline block)
- Interview Simulator config redesign (audit #82): CSS variables for border-radius, stronger selected-state borders, higher visual gravity on role cards
- Defense Strategy Layer 4A: SKILL_ARTICLE_MAP added, onOpenArticle wired through App.jsx, "Read first" Playbook link renders above room chips in each day card
- SQL Lab study plan modal: 4-step flow (goal/days/intensity/confirm), plan generation + localStorage persistence to pal-sql-lab-plan-v1, "Study Plan" button in header
- MCQ Trainer: skill heatmap grid in debrief (colored cells per category + "Study next" hint) alongside existing progress bars
- ForwardPointerCard: new shared component, wired into RCARunner + CaseRunner debrief endings (Next case / Build interview plan / Company Tracks)
- Progress export/import: "Export progress" (JSON download) + "Import progress" (file upload + reload) in Settings section
- Behavioral runner: keyboard shortcuts (1=Strong, 2=Partial, 3=Miss after reveal; Enter=next)
- 6 tasks confirmed already complete: plan persistence, keyboard shortcuts in Trainer, keyboard shortcut badges, Playbook→practice links, BI17-23 difficulty tags, shortcut badges on Home cards
- Build: ✓ 0 errors.

**Done this session (V4.50.0 — Audit completion + Tier 1 component build):**
- Audit #91 (empty states): Verified BookmarksBrowser + LockOverlay already well-implemented per quality standard
- Audit #87 (MCQ distractor quality): Verified all 40 trainerMCQ.js questions have subtly-wrong distractors, not obviously-eliminable
- Audit #79+#80 (emoji removal + icon consistency): Replaced 3 key browser header emojis with Icon components — TakehomeBrowser (📝→file-text), BookmarksBrowser (🔖→bookmark), InstrumentationBrowser (📡→newspaper). Added Icon import to each.
- Built **FoundationNudgeCard.jsx** (80 lines) — reusable dismissable card for "Haven't done [X] Foundations yet?" — ready to wire into any practice room runner
- Built **BeginnerOnboardingTrack.jsx** (145 lines) — reusable 4-step visual path component for Home.jsx (Stat Foundations → RCA Foundations → 3 Easy cases → Defense Strategy)
- Build: ✓ 0 errors. All files validated.

**Done this session (V4.46.0):**
- SQL Lab Phase 3: company/datamart filter chip in ProblemSidebar, PostHog events (sql_problem_solved/sql_hint_used/sql_answer_revealed), SQL Lab dates written to pal-sql-lab-dates-v1, Progress.jsx heatmap includes SQL Lab practice
- Foundation rewrites (65 modules total): all 4 foundation data files rewritten situation-first — rcaFoundationModules.js (12), metricsFoundationModules.js (13), expFoundationModules.js (15), statsFoundationsModules.js (32 modules). Every keyInsight now opens with a concrete work moment before any framework language.
- Emoji removal (audit #80): UI-chrome emojis removed from 11 files across pages/
- Simulator layout cleanup (audit #82): role cards tighter, chip selectors compact, reduced padding
- Case debrief failure mode pass (audit #86): 60 cases across rcaCases.js (24), metricCases.js (16), statsModules.js (20) — each debrief now ends with Weak answer pattern + Interviewer follow-up
- Build: ✓ 0 errors. validate-data.js: all target files PASS.

**Done (V4.45.0):**
- Difficulty taxonomy normalized to analyst/senior/staff across all data files
- DifficultyChips shared component + filter chips added to all room browsers
- About.jsx fully rewritten (17 rooms, difficulty levels, how it differs from DataLemur/StrataScratch/Exponent)
- Home.jsx beginner onboarding track (first-visit only, 4-step path)
- Foundation nudges added to DesignBrowser + ScenarioBrowser

**Done (V4.44.0):**
- Audit #96 resolved: rf07–rf12, mf09–mf13, ef08–ef15 canonicalized (isFree, playbookLinks, difficulty casing, devNote removed)

**Done (V4.43.0 — SQL Lab Session 6):**
- SQL Lab nav, UX fixes (Google favicon, schema accordion, Master filter, sort enforcement), hints system (130 problems × 1–5 hints), per-problem timer, Progress.jsx SQL section

**Done (V4.41.0–V4.42.0 — SQL Lab Sessions 3–5):**
- 74 prompts rewritten (business-stakeholder framing), 7 new datamarts, 130 final problems (50E/40M/25H/15Master)

**Still open:**
- Git push — user must run from Mac terminal (`git add -A && git commit -m "V4.50.0: audits complete, foundation nudge + beginner track components built" && git push origin main`)
- PostHog key confirm in Vercel (check if VITE_POSTHOG_KEY live in production)
- Supabase auth finish-or-cut decision (audit #104)
- Audit #82: Interview Simulator layout redesign (remove emojis from role cards, tighten spacing, increase visual gravity) — deferred to next session
- Tier 1: Keyboard shortcuts badge system on room cards — deferred
- Tier 1/2: Learning paths, weak topic heatmap, forward-pointer card — deferred

---

## Do not touch next session (unless explicitly decided)

- Defense Strategy V2 — gate: Batch 1 usage confirmed
- Deep Dives IA overhaul — gate: content taxonomy + ≥6 full posts per category
- New rooms / new cases — wrong session type
- Stripe activation — own sprint
- Learning paths — Tier 2, not yet
