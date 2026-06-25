# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

---

## 🔴🔴 UNPUSHED — V7.0 + V7.1 ARE COMPLETE & VERIFIED IN THE WORKSPACE BUT NOT YET PUSHED (2026-06-25)

**If this is a fresh session: the work below is DONE on disk and build-verified (905 modules ✓, harness pass) but was never pushed to GitHub.** The user paused right before the push. Do NOT rebuild or re-port — just push. (Reason for the pause: pushing to the public repo needs the user's explicit go-ahead; they asked me to checkpoint the MD files first.)

**What's done (all in `src/` etc., verified):**
- **V7.0 — Postgres everywhere, sql.js fully removed.** Engine swapped to pglite in ALL 3 runtimes; sql.js dropped from npm. Harness-verified 192/192 solutions + 336/336 methods + 18/18 beginner + 10/10 full-loop. 22 `sqliteNote` fields rewritten to match the ported Postgres SQL.
- **V7.1 — public last-active** ("Active Xh ago") on profiles; timestamp only.

**Files changed for V7.0 + V7.1 (the push must include all of these):**
- SQL engine + data: `src/data/sqlLabProblems.js`, `src/pages/SqlLabPage.jsx`, `src/pages/SqlLabBeginnerPage.jsx`, `src/components/fullLoop/FullLoopRunner.jsx`, `src/data/fullLoopSeedData.js`, `src/data/sqlLabDatamarts.js` (comments)
- Copy/docs: `src/pages/CheatSheet.jsx`, `src/pages/About.jsx`, `docs/POSTGRES-MIGRATION.md`, `docs/SQL-LAB-SPEC.md`
- Deps: `package.json`, `package-lock.json` (pglite in, sql.js out — **lockfile MUST ship or Vercel won't install pglite**)
- New: `scripts/pg_verify_harness.mjs`, `docs/migrations/2026-06_last_active.sql`
- Last-active: `src/utils/leaderboard.js`, `src/App.jsx`, `src/pages/PublicProfile.jsx`
- Spine: `CHANGELOG.md`, `NEXT.md`
- ⚠ Earlier this session (V6.8–V6.10: crash-plan tabs, Easy-prompt re-audit, inline SQL quick-ref) may ALSO be unpushed — they live in `SqlLabPage.jsx` / `sqlLabProblems.js` / `CheatSheet.jsx`, so copying the current files captures them. `git diff` from the repo path is UNRELIABLE (iCloud mmap) — do NOT trust it; copy the working files and run the `comm -23` check in CLAUDE.md to catch anything missed.

**Push (per CLAUDE.md /tmp-clone workflow — direct git from repo path fails):**
```bash
git clone https://github.com/SidharthKriplani/product-analytics-lab /tmp/pal-push
SRC="/Users/ASUS/Documents/Professional/BreakLabs/labs/product-analytics-lab"
# copy each file listed above into /tmp/pal-push/<same path>, then:
cd /tmp/pal-push && git add -A && git commit -m "V7.1.0: Postgres everywhere (sql.js removed, 3 runtimes) + 22 note rewrites + public last-active" && git push origin main
```

**Then (server-side, on Sidharth):** run the 3 Supabase migrations (incl. `2026-06_last_active.sql`), Trash `public/sql-wasm.wasm`, rotate the GitHub PAT.

---

## ⭐ CURRENT STATE — 2026-06-25 (V7.1.0)

PAL is live on Vercel (productanalyticslab.com). Build clean at **905 modules**. **BUILD FREEZE in effect — no further builds for ~5 days after this push.**
- **V7.0** — SQL Lab → **Postgres everywhere (pglite)**, sql.js fully removed from all 3 runtimes (main + Beginner + Full Loop) and from npm. Harness-verified: 192/192 solutions + 336/336 methods + 18/18 beginner + 10/10 full-loop. 22 stale `sqliteNote` fields rewritten to match the ported Postgres solutions.
- **V7.1** — public **last-active** ("Active Xh ago") on profiles; last-active timestamp only, no dwell tracking.
- **V7.2** — **Phase 3 polish + finding: the difficulty ramp already exists in every room** (all banks difficulty-tagged, 17 browsers already sort by it). No 12-room build existed. Added the one real gap — intra-tier concept ordering (SQL ramp analog) — to **Stats** (`STATS_RAMP_ORDER`) + **Instrumentation** (`INSTRUMENTATION_RAMP_ORDER`). **Phase 3 = DONE.** Any further per-room intra-tier ordering is optional polish, not a project. ⚠ V7.2 files (`StatsBrowser.jsx`, `InstrumentationBrowser.jsx`, `CHANGELOG.md`, `NEXT.md`) are a separate push from the V7.1 commit.

Earlier sessions:
- **V5.94** — design-system foundation (`RoomHeader`/`FilterBar`/`CaseCard`), global rails killed, Community feed v1.
- **V5.95** — design system rolled to every room browser, Simulator → mock-onsite gold, About/Profile/Progress/Plans/Pricing refreshed.
- **V5.96** — SQL Easy-tier ramp fixed to spec (bullets in batches 1&2 / schema fade relevant→all→all; batch-3 = normal), Community feed hidden from nav.
- **V5.97** — Résumé + Defense Strategy archived (this session).

**Archived (parked, code kept, trivially reversible):**
- **Résumé** — `profileCompletion.js` resume-add/resume-stale nudges commented; `ProfilePage.jsx` résumé block gated behind `{false &&}`; `PublicProfile.jsx` résumé link removed. `resume.js` + migration columns left in place.
- **Defense Strategy** — nav item commented in `Sidebar.jsx`; route `#/defense-doc` + `DefenseDocGenerator.jsx` preserved.
- **Community feed** — nav item commented (V5.96); route + `Community.jsx` + `feed.js` preserved.

**Pending on Sidharth (server-side — I can't do these):**
- Run `docs/migrations/2026-06_public_profiles.sql` + `docs/migrations/2026-06_feed.sql` + **`docs/migrations/2026-06_last_active.sql`** in Supabase. (Until last_active runs, profiles fall back to the member-since date — no breakage.)
- **Trash `public/sql-wasm.wasm`** — leftover from the Postgres migration; un-deletable over the iCloud mount, no longer referenced or bundled.
- ⚠ **Rotate the exposed GitHub PAT** in `.git/config` (open since 2026-06-22 — see the git block below). Critical BEFORE any cross-lab Supabase wiring.

---

## 🧭 STRATEGIC DIRECTION — BreakLabs 3-layer (UNDER DISCUSSION — not decided)

Next week: start wiring all 4 labs (GAL GenAI-Systems, MSL ML-Systems, PL Programming Lab, PAL). **Ungate from access code, KEEP the signup gate.** Former pay-gated content → reframed as **exclusive community content**. Proposed three layers:

- **L1 — shared shell** (account / social / meta): profile, progress\*, plans, feed, leaderboard, community, a BreakLabs about. *(pushback: progress + leaderboard are really per-lab — L1 should be a thin roll-up; detail lives at L2.)*
- **L2 — the labs** — each a "door" with its own **universe** + about + lab-specific content; later gated per subscription. PAL's `UniverseView.jsx` (Analyst Universe) is the prototype → recommend relocating it OUT of Progress to be PAL's L2 front door, and fixing its label collisions.
- **L3 — shared tooling**: SQL Lab (in PAL) + PyLab (in PL). Any single lab subscription unlocks BOTH.

**Open decisions to lock before wiring (eventual home: HQ/DECISIONS.md):**
- **D1** Progress + leaderboard — L1 aggregate vs L2 per-lab? (rec: thin L1 roll-up, real data at L2)
- **D2** one cross-lab feed vs per-lab feeds? (rec: one cross-lab feed — per-lab feeds will be ghost towns)
- **D3** entitlement matrix — is content free-with-signup, with a subscription buying community + L3 + cross-lab access? what does community cost? (rec: content free-with-signup; sub = community + L3 + lab access)
- **D4** shared-Supabase backbone + shared shell package vs monorepo on one root domain? (rec: ONE shared Supabase + a `@breaklabs/shell` package first; keep labs as separate deploys)

**Foundational blockers (from cross-lab recon):** each lab is a separate Vercel deploy + (likely) its own Supabase; React 18 (GAL/MSL) vs 19 (PL/PAL). A shared L1 needs ONE shared Supabase (single identity / feed / leaderboard) consumed by a shared component package. Rotate the exposed PAL secret first.

---

## ✅ DONE (2026-06-23) — BreakLabs logo (D-19) + four-frame nav + navy theme [V5.46.0, deployed]
D-19 logo rollout COMPLETE in PAL (canonical owner): `BrandMark` built + all 7 slots wired + favicon/OG rebranded + old assets archived to `_legacy/`. **Descriptor = PAL's own blue `#5A7FE8`, not the spec's indigo** (Sidharth's override). Four-frame sidebar reframe also shipped (KNOW/DO/BUILD/JUDGE + LIVE + EXTRAS; PAL declines the mobile BottomNav; spec `docs/NAV-REFRAME-SPEC.md`). Dark theme reverted warm→navy `#070A12`. All logged: CHANGELOG V5.46.0, LINEAGE, HQ/LEDGER (PAL ✓; MSL still pending). Built on macOS + deployed to Vercel.

**⚠ Carry-forward / open:**
- **HQ naming decision** still owed: PAL ships LIVE+EXTRAS where MSL/GSL ship PREP&ASSESS, and label sets diverge (see HQ/LEDGER) — HQ to rule canonical zone labels before more labs restructure.
- **Two-working-copies + git** (below) still blocks clean version reconciliation; V5.43–5.45 from the sibling copy vs the brand/nav/theme pushed from this copy need merging.
- NAV-REFRAME-SPEC §7 minor opens: surface Take-Home/Theory-Hub/Consult (held), sequencing.

*Last updated: 2026-06-23 (V5.46.0 brand+nav+theme deployed. Prior: V5.42.0 pushed; V5.43–5.45 pending on the sibling copy.)*

---

## Status — V5.42.0 PUSHED ✅ · V5.43.0 pending tag_companies.py run

> ⛔ **GIT BLOCKED (flagged 2026-06-22, must resolve before ANY push):** (1) **Live GitHub PAT exposed** in plaintext inside `.git/config` `origin` URL (`https://SidharthKriplani:ghp_…@github.com/…`) — rotate the token now, then re-set remote to a clean URL + credential helper/SSH. (2) **Two working copies** — mounted `BreakLabs/labs/product-analytics-lab` vs CLAUDE.md's `GitHub/upskill platforms (4)/product-analytics-lab`, and CLAUDE.md still names the remote `experimentation-systems-lab` (actual: `product-analytics-lab`). Confirm canonical copy + fix the name before pushing. Awaiting this unblock (V5.44.0 + V5.45.0): 4 docs (SQL-COVERAGE-REPORT, JUDGMENT-LAYER-SPIKE, FOUR-FRAME-AUDIT, SQL-CONTENT-STANDARD) + SQL Lab content rebuild (sqlLabProblems.js, ~45 problems) + SqlLabPage.jsx editor half-height + 4 scripts + EVAL_RUBRICS/CHANGELOG/LINEAGE/AUDITS updates. All on the mounted copy, gates green + build verified, nothing pushed.

V5.42.0 is live on Vercel. Contains: hintSteps migration (182 problems, Qwen3-8B), SqlLabPage.jsx company filter fix (was datamartId, now company names) + alsoAskedAt UI (badge + runner chips), migrate_content.py regex hardened, eval_content_quality.py fixed, forensic brokenQuery/brokenOutputNote restored. AUDITS.md #171 closed.

**V5.43.0 pre-flight — run this first:**
```bash
cd ~/Documents/Professional/GitHub/"upskill platforms (4)"/product-analytics-lab
python3 scripts/tag_companies.py --id sql-e01 --dry-run   # sanity check
python3 scripts/tag_companies.py                           # full run (~10-15 min)
python3 scripts/audit_sql_lab.py 2>&1 | grep "T1 FAIL"   # must print nothing
```

**Then commit V5.43.0:**
```bash
git clone https://github.com/SidharthKriplani/product-analytics-lab /tmp/pal-push-pal-v543
SRC="/Users/ASUS/Documents/Professional/GitHub/upskill platforms (4)/product-analytics-lab"
cp "$SRC/src/data/sqlLabProblems.js" /tmp/pal-push-pal-v543/src/data/sqlLabProblems.js
cp "$SRC/scripts/tag_companies.py" /tmp/pal-push-pal-v543/scripts/tag_companies.py
cp "$SRC/NEXT.md" /tmp/pal-push-pal-v543/NEXT.md
cp "$SRC/CHANGELOG.md" /tmp/pal-push-pal-v543/CHANGELOG.md
cp "$SRC/LINEAGE.md" /tmp/pal-push-pal-v543/LINEAGE.md
cp "$SRC/AUDITS.md" /tmp/pal-push-pal-v543/AUDITS.md
cd /tmp/pal-push-pal-v543
git config user.email "claudesubscription12@gmail.com"
git config user.name "Avinash"
git add -A
git commit -m "V5.43.0: alsoAskedAt multi-company tagging (182 problems via tag_companies.py) + spine file updates"
git push origin main
```

---

## Active build queue

**1. Run eval_content_quality.py** — scores all 182 problems on prompt_clarity / hints_quality / debrief_quality (+ broken_note_acc for Forensic). ~30-40 min with Qwen3-8B. Outputs `scripts/content_quality_report.csv` + `scripts/content_quality_flagged.md`. Run after V5.43.0 committed. No commit needed for the outputs (analysis artefacts only).

**2. Delete 3 orphaned files** — `src/data/pathsData.js`, `src/utils/pathsProgress.js`, `src/pages/PathsBrowser.jsx` — unwired but on disk. Manual delete + commit.

**3. SQL coverage gaps — ✅ BUILT 2026-06-23 (V5.47.0), propose-only/unpushed.** All 10 specs from `docs/SQL-COVERAGE-REPORT.md` built (sess1/sess2, med1/med2, gaps2/gaps3, set1, rec1, str1, dedup1) → 182→192, 18/18 benchmark categories now covered. 5 new seed tables (clickstream/service_status/employees/signups/contacts). Gates green. **Remaining:** push it (needs the /tmp-overlay push, same as V5.46.0), and a cheap follow-up — ~1100 T2 tag-vocabulary warnings across the bank could be normalised in a batch pass.

**4. India SQL series expansion** — Swiggy only so far. Razorpay (fintech/UPI) is highest-value next add given audience. Target: 15-20 India problems across 3-4 companies. AUDITS.md #168. Run audit script clean before pushing.

**5. Email capture / newsletter** — Must exist before LinkedIn audience compounds. Minimum: Beehiiv or Substack signup. PAL linkback in first comment only (Style Bible rule). Target: live by week 2-3 of LinkedIn launch (before Jun 30 2026).

---

## Recently shipped

- ✅ 2026-06-25 — **V6.10.0 Easy prompt re-audit (7 fixes) + inline SQL cheatsheet.** Fixed e12/e52/e54/e57/e40/e58/e36 (undersold-deliverable, same class as e55). Crash-course review day now sources the SQL cheat sheet inline (`CHEAT_SECTIONS` exported, `SQL_CHEATS` filter, `SqlQuickRef`) instead of linking the all-rooms page. Also fixed e55 + e67 (magic-date→date() modifier) earlier today.
- ✅ 2026-06-25 — **V7.0.0 SQL Lab → Postgres (pglite) EVERYWHERE. DONE + verified (UNPUSHED — see top block).** 192/192 solutions (rows+cols+checkValues) + 336/336 methods + broken-queries correct under real Postgres + 18/18 beginner + 10/10 full-loop; engine swapped in ALL 3 runtimes (main + Beginner + Full Loop); `@electric-sql/pglite` in package.json, **sql.js removed**; build 905. Cheatsheet/About/f34 de-SQLited; 22 `sqliteNote` fields rewritten. Details: `docs/POSTGRES-MIGRATION.md`, CHANGELOG 7.0.0 + 7.1.0.
- ✅ **QUEUED — dwell tracking: LAST-ACTIVE ONLY** (drop total time). Supabase `last_active_at`, client tracker, show on PublicProfile + leaderboard.

## ⛔ FREEZE NOTE
Builds freeze ~5 days after this session. Do NOT push a partial Postgres migration — the SQL Lab would break (Postgres syntax on SQLite engine, or vice-versa). The migration is all-or-nothing; verify 192/192 on the harness before the single atomic push.
- ✅ 2026-06-25 — **V6.9.0 Crash plans: difficulty-per-day + cheatsheet + row fix.** Intermediate E/E/M/review+cheatsheet; Advanced 2E/3M/1H/review+cheatsheet; last day links `#/cheatsheet`; rows reuse `ProblemListRow` (match All list). Build 895.
- ✅ 2026-06-25 — **V6.8.0 Crash plans reworked (researched + assumes basics known).** Both plans open at aggregates/GROUP BY (not SELECT/WHERE), ~5 problems/day, windows late, forensic capstone; curated ids verified. **NEXT BUILD (requested): public dwell tracking** — track each user's last-active timestamp + total time-on-app, visible to everyone (Supabase cols `last_active_at` + `total_dwell_seconds`, client tracker, show on PublicProfile + leaderboard; degrade gracefully). Then Phase 3 (rooms).
- ✅ 2026-06-25 — **V6.7.0 SQL Lab plan tabs filled.** `SqlPlanView` + `SQL_PLANS`: Intermediate (4 days) + Advanced (7 days), each day a slice off the gradient orders (auto-synced), problems clickable to open. Build 895. **Remaining: (i)** optional per-column derivation hints; **(ii)** Phase 3 — roll the ramp into every room (Stats/Instrumentation first).
- ✅ 2026-06-25 — **V6.6.0 SQL Easy prompt/deliverable redundancy fixed (Phase 2b).** All 47 Easy prompts rewritten to end at the problem (conditions folded into scenario); column enumeration + order-by removed; new `orderBy` field per Easy problem; `deriveRequirements` prefers it. Build 895. **Remaining: (i)** optional per-column derivation hint enrichment (name `risk_tier` etc.); **(ii)** fill plan-tab content (day-by-day off the gradient); **(iii)** Phase 3 rooms.
- ✅ 2026-06-25 — **V6.5.0 SQL Lab 3 plan tabs (skeletons) + tab-switch animation.** `SqlPlanTabs` (All / 3–4d Intermediate / 7d Advanced); plan tabs swap the whole body to `SqlPlanSkeleton` (day cards, content TBD); `pal-tab-fade`. **Open: (i)** redundancy fix — strip the "Return X,Y,Z ordered by" tail off Easy prompts so the statement ends at the scenario and the "your result should" box owns the deliverable (confirmed w/ user; part of Phase 2b). **(ii)** fill the plan tabs with real day-by-day content. **(iii)** Phase 2b derivation hints. **(iv)** Phase 3 rooms.
- ✅ 2026-06-25 — **V6.4.0 SQL ramp: Medium ordered + Medium/Hard calibrated.** 19 re-tiers (Hard was ~47% over-tiered — single-window/single-join demoted). New counts: Easy 47/Medium 73/Hard 17. `SQL_MEDIUM_RAMP_ORDER` (73) gradient-sorts Medium by technique; SORTED_PROBLEMS now orders Easy+Medium. Hard+ intentionally not strict-ordered. **Remaining SQL: Phase 2b** (author per-problem derivation hints / merged Easy statement). **Then Phase 3:** roll ramp into every room (Stats/Instrumentation first).
- ✅ 2026-06-25 — **V6.3.0 SQL ramp Phase 2a: Easy on-ramp ordered into a gradient.** `SQL_EASY_RAMP_ORDER` (40 ids) sorts Easy by one-concept-per-step (filters→aggregates→GROUP BY→HAVING→joins); first join at pos 25. Drives browse + prev/next. **Phase 2 remaining:** (b) author per-problem returns/derivation hints; (c) Medium/Hard calibration audit. **Phase 3:** roll into every room.
- ✅ 2026-06-25 — **V6.2.0 SQL ramp Phase 1: tier-based scaffolding + 4-table cap.** `tablesForProblem`: Easy = only needed tables; Medium+ = needed + distractors capped at 4 (standing rule: ≤4 tables unless solution needs more). Requirements block shows at Easy only. Retired the 3-batch wheels. Docs updated (SQL-LAB-SPEC §9A/§6, GRADIENT-STANDARD §4.7). **NEXT: Phase 2** (per-problem authored `returns`/derivation hints — merged Easy statement; withheld Medium+) then **Phase 3** (roll ramp into every room — Stats/Instrumentation first). Both staged content work, run via subagents + review.
- ✅ 2026-06-25 — **V6.1.0 Vocab normalization (gradient-standard rollout step 1).** All Axis-B rooms → `analyst/senior/staff` (junior→analyst, advanced→staff, foundational→analyst, intermediate→senior). UI filters fixed (Instrumentation, JudgmentBank, InterviewSimulator). Left alone: `level` performance grade, Foundations' Beginner/Intermediate/Advanced, SQL seed rows. **Next rollout steps:** per-room *ordering into gradients* + on-ramps (Stats & Instrumentation first), and continue difficulty calibration into Medium/Hard per room.
- ✅ 2026-06-25 — **V6.0.0 Check/Submit model + solve animation + Gradient Standard (HQ).** SQL runner: Check (Cmd/Enter = see output, no record/solve) vs Submit (click = evaluate + record + green). "Past attempts"→"Submissions". Bigger correct-Submit success banner (`pal-solve-burst`/`pal-solve-seal`, reduced-motion safe). New `HQ/GRADIENT-STANDARD.md` (cross-room ramp standard + vocab-normalization map + rollout order); SQL-LAB-SPEC §2A is the reference. Files: `SqlLabPage.jsx`, `index.css`, `HQ/GRADIENT-STANDARD.md`.
- ✅ 2026-06-25 — **V5.99.0 Easy-tier recalibration.** Full audit of the 43-Easy pool vs `SQL-DIFFICULTY-RUBRIC.md`; 3 rate problems (e02, e09, e44; `ROUND(100*SUM(flag)/COUNT(*))`) → Medium. Beginner ramp window auto-cleaned (verified: first-15 Easy now have no rate/window/anti-join/3-join). Kept e08 Easy (over-fire) but fixed its prompt (bogus "last 30 days" clause the solution didn't apply). Gates clean, build 895. **Open:** ramp opens with 2 simple joins (e04/e05) before the first single-table — reorder Easy front-of-array to lead with single-table fundamentals if desired (true beginners have the separate Beginner Level).
- ✅ 2026-06-25 — **V5.98.0 Analyst Universe rebuilt as a loop + SQL-Lab spec → PyLab clone blueprint.** `UniverseView.jsx` (ring of 7 stages, progress-lit, chevrons, clean labels); `docs/SQL-LAB-SPEC.md` §13 SQL→Python mapping. Company→logo map shared to `HQ/shared/` (companyDomains.js + CompanyLogo.jsx + `HQ/COMPANY-LOGOS.md`).
- ✅ 2026-06-25 — **V5.97.0 Résumé + Defense Strategy archived.** Both parked (code kept, reversible): résumé nudges/input/public-link gated off; Defense Strategy nav item commented. Files: `profileCompletion.js`, `ProfilePage.jsx`, `PublicProfile.jsx`, `Sidebar.jsx`. Build 895 ✓.
- ✅ 2026-06-25 — **V5.96.0 SQL Easy-ramp fixed to spec + feed hidden.** Ramp: bullets ride batches 1&2 (one bullet per output column), schema fades relevant-tables→all→all-normal; batch 3 = identical to the other ~180. Relevant tables derived from each problem's `solution` SQL. Feed removed from nav (route kept). Files: `SqlLabPage.jsx`, `Sidebar.jsx`.
- ✅ 2026-06-25 — **V5.95.0 Design-system rollout + Simulator gold + page refresh.** Unified `RoomHeader`/`FilterBar`/`CaseCard` across every room browser (chip-walls → dropdowns, no rails); Simulator → staged mock-onsite (per-round timer, interviewer framing, report card); About/Profile/Progress/Plans/Pricing refreshed.
- ✅ 2026-06-25 — **V5.94.0 Design-system foundation + rails killed + Community feed v1.** Shared components; global "Set a target" rail + colored card/nav rails removed; Company Tracks + Library reskinned; feed (`Community.jsx` + `feed.js`, needs `2026-06_feed.sql`).
- ✅ (earlier June) — SQL beginner level (movies datamart + ~18 sequential lessons), full SVG/emoji sweep (`Icon.jsx` 84 icons + `HQ/shared/Icon.jsx`), nav flatten (3→2 levels), Options/Describe toggle, readiness countdown, spaced-repetition review queue, capture-at-sign-in, employment fields + monthly reminder + company logos, depth content (A/B Design, Instrumentation, Growth, Spot-the-Flaw). Full detail in CHANGELOG.md.
- ✅ 2026-06-24 — **V5.60.0 Difficulty chips → uniform fixed-width blocks.** Chips now fill their 66px grid cell (display:block, width:100%, centered) so they form a clean aligned column. Build verified. File: `SqlLabPage.jsx`.
- ✅ 2026-06-24 — **V5.59.0 Populated alsoAskedAt (no-LLM) → stacked company logos light up.** New `scripts/tag_companies_domain.py` (deterministic same-datamart peers, seeded shuffle); 183/192 tagged. LLM `tag_companies.py` couldn't run here (needs LM Studio); available for richer re-pass. Gates green. Files: `tag_companies_domain.py`, `sqlLabProblems.js`.
- ✅ 2026-06-24 — **V5.58.0 Results-table dup-column fix + browser row grid/logos + SQL-LAB-SPEC.md.** (1) `SELECT *`-on-joins garbled output fixed (header keyed by index, not column name). (2) List row → CSS grid (status·difficulty·company·title·tags) so titles align + difficulty is its own block; company name text → fixed favicon + `CompanyLogos` stacked "+N" (name→domain map from bank). (3) Wrote `docs/SQL-LAB-SPEC.md` (master spec, cross-links all SQL docs). **Open:** run `tag_companies.py` to populate `alsoAskedAt` so "+N more" logos show. Build verified. File: `SqlLabPage.jsx`.
- ✅ 2026-06-24 — **V5.57.0 Fix: Ctrl/Cmd+F hijacked by CodeMirror search.** Set `searchKeymap: false` in basicSetup so browser find works in the editor. Build verified. File: `SqlEditor.jsx`.
- ✅ 2026-06-24 — **V5.56.0 Fix: CodeMirror typing lag / dropped keys.** Inline `schema`/`onCheck` props rebuilt the editor's whole extension set every keystroke. Parent now memoizes `cmSchema` per problem; `SqlEditor` reads onCheck via ref, memoizes extensions on `[schema]`, hoists basicSetup/style. Configures once per problem, not per char. Build verified. Files: `SqlEditor.jsx`, `SqlLabPage.jsx`.
- ✅ 2026-06-24 — **V5.55.0 Fix: Cmd/Ctrl+Enter (Check) in CodeMirror.** Default keymap's Mod-Enter ("insert blank line") outranked the Check binding; wrapped editor keymap in `Prec.highest`. Build verified. File: `src/components/shared/SqlEditor.jsx`.
- ✅ 2026-06-24 — **V5.54.0 Fix: global single-key shortcuts (s/m/r/…) fired while typing in CodeMirror.** `useKeyboardShortcuts` only skipped input/textarea/select; CodeMirror is a contenteditable div. Added `activeElement.isContentEditable` to the guard. Build verified. File: `src/hooks/useKeyboardShortcuts.js`.
- ✅ 2026-06-24 — **V5.53.0 SQL editor → CodeMirror 6.** New `src/components/shared/SqlEditor.jsx` (@uiw/react-codemirror + @codemirror/lang-sql), wired into SqlLabPage behind `USE_CM_EDITOR` flag (textarea fallback kept ~few days). Syntax highlighting + indentation keeper + **schema-only autocomplete** (current problem's tables/columns, automatic) + Tab/Shift-Tab + native Cmd+/ + Cmd+Enter. No full-query completion (interview philosophy). New deps in package.json/lock — **push must include both so Vercel installs them.** Build verified (870 modules). Spec: `docs/CODEMIRROR-SWAP-SPEC.md`. **Open:** theme the editor to navy (currently generic CM dark); remove textarea + handleKeyDown Tab/Cmd+/ once flag confirmed.
- ✅ 2026-06-24 — **V5.52.0 SQL editor Cmd+/ comment toggle.** Editor is a plain textarea — Cmd+/ never existed (not a setting). Added Cmd+/ ÷ Ctrl+/ to `handleKeyDown` to toggle `-- ` line comments on the selection (comment/uncomment auto-detected, selection preserved). Build verified. File: `src/pages/SqlLabPage.jsx`. Not pushed.
- ✅ 2026-06-24 — **V5.51.0 SQL difficulty rubric + Easy-tier recalibration.** New `docs/SQL-DIFFICULTY-RUBRIC.md` (tier = MAX(mechanical, conceptual); single window = Medium; frames/multi-window/gaps/recursion/3+CTE = Hard; consistency rule). 7 mis-tiered Easy → Medium (e01/e11/e72 anti-joins, dedup1 correlated subq, e03/e10/e42 3-table joins). Easy 50→43, Medium→62. Fixes the e01 anti-join on-ramp. Medium audited — largely correct; flagged m47/h52 consistency mismatch + med1 (propose-only, no Medium flips). Gates green. AUDITS #178✅/#179. **Open follow-up:** decide m47/h52 tier + run the consistency rule bank-wide.
- ✅ 2026-06-24 — **V5.50.0 Fixed SQL Lab deep-link routing.** `#/sql-lab/<id>` always opened sql-e01 because `problemIdx` was only set by a mount-time lazy initializer that ran before the hash (auth-gated) resolved. Added `useEffect([initialProblemId])` to jump to the problem when the id arrives. Build verified. File: `src/pages/SqlLabPage.jsx`. Propose-only — NOT pushed.
- ✅ 2026-06-24 — **V5.49.0 Removed pricing-feedback widget + Anjali testimonial.** "Would you pay for this?" widget removed from `Plans.jsx` (handed to PL). Anjali Yemmanur added to all 3 testimonial lists (wall + ticker + Home strip); image at `public/testimonials/anjali.jpg` (present). Files: `Plans.jsx`, `Home.jsx`, `public/testimonials/anjali.jpg`. Propose-only.
- ✅ 2026-06-23/24 — **PL mentorship: 2 handoff docs written** (in the PL repo `production-systems-lab/docs/`, logged in `HQ/LEDGER.md`): `SQL-LAB-HANDOFF.md` (DO frame — content model, judgment layer, verification gates, SQL→pandas mapping) + `FOUNDATIONS-HANDOFF.md` (KNOW frame — interactive teaching anatomy + a push for PL to build an interactive Python/CS Foundations lab). Cross-lab, not a PAL code change.
- ✅ 2026-06-23 — **V5.48.0 Judgment layer — harness + 6-problem pilot.** Implements `docs/JUDGMENT-LAYER-SPIKE.md`: new `scripts/verify_methods.py` (non-trap methods must == solution, trap methods must run+diverge, MCQ ids must resolve — new pre-commit gate), + `methods[]`/`dial`/`mcqs`/`canonicalMethodId` authored on 6 problems (sql-m13/m14/med1/med2/rec1/sess1, 22 methods, all executed-verified). Additive/back-compatible; count unchanged (192). **✅ SCALE-OUT COMPLETE (2026-06-23): the FULL Hard/Master tier is layered — 54 problems, 169 methods**, all harness-verified, across 6 subagent batches (each independently gate-verified). 4 honest empty dials on genuine single-method composite scorers (master01/04/10, h10). **Side-benefit: ~13 stale debriefs fixed** (h02/h07/h17/h24/h10/h32/master01/05/12/13/19/21/25) — legacy "wrong answer" claims that no longer diverged on the live seed, rewritten with verified numbers. **✅ Runner UI built** (`SqlLabPage.jsx` `JudgmentLayer` component). **✅ SCALE-OUT COMPLETE — the whole eligible bank is layered: 106 problems / 336 methods** (all Hard + Master + Medium; Easy & Forensic intentionally excluded), 7 honest empty dials, all harness-verified, 13 subagent batches. **~25 stale debriefs fixed** across the effort (live-seed accuracy cleanup). **REMAINING (both optional): (1)** the `detectionSignature` "you wrote this" badge in the runner (data ready, small wire-up); (2) the ~1,100 cosmetic T2 tag-vocabulary warnings (normalization pass). Files: `scripts/verify_methods.py`, `src/data/sqlLabProblems.js`, `src/pages/SqlLabPage.jsx`. **Propose-only — NOT pushed** (stacks with V5.47 coverage problems). Files: `scripts/verify_methods.py`, `src/data/sqlLabProblems.js`, `src/pages/SqlLabPage.jsx`. **Propose-only — NOT pushed** (stacks with V5.47 coverage problems).
- ✅ 2026-06-23 — **V5.47.0 SQL coverage gaps closed (182 → 192, 18/18 benchmark categories).** 10 new problems built executed-and-verified against the gaps in `docs/SQL-COVERAGE-REPORT.md`: sessionization (sess1/sess2 + new `clickstream` table), true median (med1/med2), gaps-and-islands (gaps2/gaps3 + new `service_status` table), set ops (set1), recursive (rec1 + new `employees` table), string (str1 + new `signups` table), dedup (dedup1 + new `contacts` table). 5 new seed tables, no existing table touched. All gates green (0 T1, 0 content flags, brace 0). Files: `src/data/sqlLabProblems.js`, `src/data/sqlLabDatamarts.js`. **Propose-only — NOT pushed.**
- ✅ 2026-06-23 — **V5.46.0 BreakLabs brand (D-19) + four-frame nav + navy dark theme.** (1) `BrandMark` component + all 7 brand slots + monogram favicon + rebranded OG; old assets → `public/_legacy/`; descriptor in PAL blue `#5A7FE8` (override of spec indigo). (2) `Sidebar.jsx` rebuilt to KNOW/DO/BUILD/JUDGE + LIVE + EXTRAS accordion — one-open-per-level, measured-height collapse, derived active-state (killed the 40-line `getIsActive` chain), 4 new icons, aria; PAL declines the mobile BottomNav. (3) Dark theme warm `#15120D` → navy `#070A12`. Files: `BrandMark.jsx`, `Sidebar.jsx`, `Icon.jsx`, `Home.jsx`, `AuthModal.jsx`, `GateOverlay.jsx`, `Footer.jsx`, `App.jsx`, `index.css`, `public/favicon.svg`, `public/og-image.png`. Specs: `docs/BRANDMARK-ROLLOUT.md`, `docs/NAV-REFRAME-SPEC.md`, `docs/DESIGN-STANDARD-PAL.md`. Built on macOS + **deployed to Vercel**.
- ✅ 2026-06-23 — **V5.45.0 SQL Lab editor half-height.** `SqlLabPage.jsx` textarea `minHeight: calc(100vh-180px)` → `height: 46vh` so query output shows in the lower half without scrolling. Bundles with the V5.44.0 push.
- ✅ 2026-06-23 — **SQL Lab full content rebuild (182 problems → 0 content-gate failures).** Against the frozen `docs/SQL-CONTENT-STANDARD.md`: 8 prompts de-jargoned (technique no longer named), 96 filler sentences removed, 16 debriefs rebuilt from EXECUTED data (each wrong-answer run via new `scripts/run_sql.py` to confirm it diverges), 13 hints converted to scaffolds, 26 problem-specific interviewer follow-ups added. **1 real solution bug fixed** (`meesho-04` 4× GMV review fan-out; checkValues strengthened). **4 false debrief claims corrected** (sw01, h53, h51, meesho-06). New tooling: `sql_content_scan.mjs` (content gate, exits non-zero — wire into pre-commit), `run_sql.py`, `apply_patch.mjs`. Both gates (mechanical + content) pass clean on all 182. **NOT pushed** — git still blocked. Transient `_patch_*.json` + `.bak-*` now gitignored.
- ✅ 2026-06-22 — **Four-Frame Competence Model audit** (`docs/FOUR-FRAME-AUDIT.md`). Read-only map of PAL's surface to the recall+depth→fluency→ownership→judgment ladder (DEC-15). Finding: PAL is bimodal — **deep recall+depth base** (72 foundation modules + 69 articles) and **deep/broad judgment** (the identity; 48-item bug-hunt vein in Spot the Flaw + SQL Forensic), but **fluency is one-room-deep (SQL only)** and **ownership is scaffold-only (no capture+evaluation beyond 5 Take-Homes)**. Two ladder gaps: fluency cliff (judgment sits on a fluency layer that, outside SQL, isn't there) + ownership lacks capture. Proposed IA restructure into LEARN/DRILL/DECIDE/OWN rungs (propose-only). Build order per DEC-15: fluency engines beyond SQL → ownership capture → then resume judgment. HQ model files weren't mounted; worked from brief spec. **Propose-only, not pushed** (git still blocked).
- ✅ 2026-06-22 — **Judgment-layer schema spike** (`docs/JUDGMENT-LAYER-SPIKE.md`). Schema-discovery on ONE problem (latest-order-per-customer). Proposes additive per-problem fields `methods[] / dial / mcqs / canonicalMethodId / isTrap` for the future multi-method + scenario-dial + MCQ layer. 4 methods (window/correlated/self-join/aggregate) authored + run against ecomm seed → byte-identical 12-row output verified; ties fork reproduced (ROW_NUMBER=1 drops a tied row, RANK/aggregate keep both). Implication for coverage rewrite: bake methods[]+dial+mcqs in per problem, gate depth by difficulty, add a per-method verify harness to audit_sql_lab.py. **Propose-only, not pushed** — blocked on git situation (see below).
- ✅ 2026-06-22 — **SQL coverage audit** (`docs/SQL-COVERAGE-REPORT.md`). 182 problems classified vs the 18-category SQL-VARIETY-BENCHMARK. Verdict: 11/18 covered, 5 thin, 2 missing (sessionization, string). Must-have 11 all covered. PAL beats benchmark on Forensic tier (36), multi-CTE cohort/retention narratives, window depth. Gaps prioritized P1–P6; 11 propose-only problem specs queued (not built — approval-gated). Audit/content only, no code changed.
- ✅ V5.41.0 — Expected output "Loading sample rows…" placeholder shown while sql-wasm loads; header `borderBottom` always rendered. AUDITS.md #166 closed. File: `src/pages/SqlLabPage.jsx`.
- ✅ V5.40.1 — checkValues `.0` format bug fixed in sql-f29, sql-f31, sql-f34 (whole-number SUM/AVG values stripped of `.0` suffix to match sql.js integer serialization). AUDITS.md #165 closed.
- ✅ V5.40.0 — Swiggy datamart (5 tables: restaurants 12, customers 10, delivery_partners 8, orders 25, order_items 42 rows). 6 India SQL problems: sql-sw01 avg delivery time by city, sql-sw02 Swiggy One GMV segmentation, sql-sw03 loyal diners HAVING, sql-sw04 slow delivery partners, sql-sw05 restaurant revenue leaderboard, sql-sw06 Forensic COUNT vs SUM + missing status filter.
- ✅ V5.39.0 — 10 new Forensic problems (sql-f26 through sql-f35): 10 new bug types — subscription JOIN without status filter, SUM OVER missing ORDER BY, GROUP BY missing column, AVG vs SUM, COUNT(*) vs COUNT(DISTINCT), wrong JOIN key, INNER vs LEFT JOIN, strftime year vs month, scalar subquery with = vs IN, HAVING vs WHERE. Plus beforeWriting judgment prompts on 5 Hard problems (sql-h01, h02, h04, h07, h11). Forensic batch now at 35 problems.
- ✅ V5.38.1 — Run vs Check button split; Cmd+Enter → checkQuery; DEBRIEF_BLOCKS + Interviewer Follow-Up + Approach sections; PAL Exclusive badge on Forensic problems; beforeWriting rendering in problem card.
- ✅ V5.38.0 — Race condition fix (expectedSampleRef useRef); failure diagnostic UI (specific reason strings); 4 empty checkValues fixed; expectedRowCount bug fixed on Transactions at Non-US Merchants.
- ✅ V5.37.0 — PostHog: gate_converted, plans_page_viewed, sql_query_run. SQL_LAB_AUDIT_2026.md written.
- ✅ V5.36.0 — Stats Foundations sf26-sf32 fix; SQL Q.9 checkValues; column alias hint.

---

## Deferred — do not build until after private test feedback

**Foundation Path UX** — knowledge graph + Simplify pattern. Gate: dimensional modeling cases + PostHog wiring shipped first.

**spokenSummary backfill** — RCA05–RCA26 + C01–C25. Non-blocking.

**Stripe / payment** — Post-private test.

**Sign-in tier value expansion** — Increase isFree case count from ~3 to ~8 per room.

**Progress next-suggestion card** — "Continue where you left off" widget.

**Mobile-first drill IA** — V6 territory.

**Interview Simulator expansion** — Gate: PostHog WAU data first.

**Study Room v2** — Weak-topic tracker export, notes, RCA scenario drills.

**GenAI/ML Lab** — deep mastery track. User to decide first project.
