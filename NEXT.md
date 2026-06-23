# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

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
