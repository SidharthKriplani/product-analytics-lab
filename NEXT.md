# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: 2026-06-21 (V5.42.0 pushed ✅. V5.43.0 pending: run tag_companies.py first, then commit. Ecosystem ledger strategy decided — ECOSYSTEM_LEDGER.md to be created at Professional/ root. LinkedIn launch Mon Jun 23 2026.)*

---

## Status — V5.42.0 PUSHED ✅ · V5.43.0 pending tag_companies.py run

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

**3. SQL patterns still missing from bank** — 5 unrepresented patterns from AUDITS.md #132: date spine/gap-filling, ROWS BETWEEN frame specification, PERCENT_RANK/CUME_DIST, two-valid-queries-different-results, recursive CTE. Run audit script clean before pushing. At least 1 problem per pattern.

**4. India SQL series expansion** — Swiggy only so far. Razorpay (fintech/UPI) is highest-value next add given audience. Target: 15-20 India problems across 3-4 companies. AUDITS.md #168. Run audit script clean before pushing.

**5. Email capture / newsletter** — Must exist before LinkedIn audience compounds. Minimum: Beehiiv or Substack signup. PAL linkback in first comment only (Style Bible rule). Target: live by week 2-3 of LinkedIn launch (before Jun 30 2026).

---

## Recently shipped

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
