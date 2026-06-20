# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: 2026-06-20 (V5.41.0: expected output loading state in problem panel. V5.40.1: checkValues '.0' bug fixed. V5.40.0: Swiggy datamart + 6 India SQL problems.)*

---

## Status — V5.41.0 ready to commit + push

**ACTION REQUIRED:** From Mac terminal:
```bash
git clone https://github.com/SidharthKriplani/product-analytics-lab /tmp/pal-push-pal-v541
cp "/Users/ASUS/Documents/Professional/GitHub/upskill platforms (4)/product-analytics-lab/src/data/sqlLabDatamarts.js" /tmp/pal-push-pal-v541/src/data/sqlLabDatamarts.js
cp "/Users/ASUS/Documents/Professional/GitHub/upskill platforms (4)/product-analytics-lab/src/data/sqlLabProblems.js" /tmp/pal-push-pal-v541/src/data/sqlLabProblems.js
cp "/Users/ASUS/Documents/Professional/GitHub/upskill platforms (4)/product-analytics-lab/src/pages/SqlLabPage.jsx" /tmp/pal-push-pal-v541/src/pages/SqlLabPage.jsx
cp "/Users/ASUS/Documents/Professional/GitHub/upskill platforms (4)/product-analytics-lab/LINEAGE.md" /tmp/pal-push-pal-v541/LINEAGE.md
cp "/Users/ASUS/Documents/Professional/GitHub/upskill platforms (4)/product-analytics-lab/AUDITS.md" /tmp/pal-push-pal-v541/AUDITS.md
cp "/Users/ASUS/Documents/Professional/GitHub/upskill platforms (4)/product-analytics-lab/NEXT.md" /tmp/pal-push-pal-v541/NEXT.md
cd /tmp/pal-push-pal-v541
git config user.email "claudesubscription12@gmail.com"
git config user.name "Avinash"
git add -A
git commit -m "V5.41.0: Swiggy datamart + 6 India SQL + checkValues fix + expected output loading state"
git push origin main
```

---

## Active build queue

**1. Delete 3 orphaned files** — `src/data/pathsData.js`, `src/utils/pathsProgress.js`, `src/pages/PathsBrowser.jsx` — unwired but on disk. Manual delete + commit.

**2. Dimensional modeling cases** — skeleton shipped (V5.34.0). Author 3-5 schema-critique cases tagged `data-modeling`. Flipkart DA track references these once live.

**3. SQL patterns still missing from bank** — 5 unrepresented patterns from AUDITS.md #132: date spine/gap-filling, ROWS BETWEEN frame specification, PERCENT_RANK/CUME_DIST, two-valid-queries-different-results, recursive CTE. At least 1 problem per pattern needed for comprehensive coverage.

**4. India SQL series expansion** — Swiggy only so far. Add Zepto (quick-commerce), Razorpay/Paytm (fintech), Ola/Rapido (ride-sharing) datamarts + problems. Target: 15-20 India problems across 3-4 companies. AUDITS.md #168.

**5. SqlLabPage.jsx UX pass** — (a) keyboard shortcut hint visible next to Check button (currently hidden until first run); (b) problem-level attempt counter in the problem header; (c) check whether `sqlLoading` spinner blocks the schema accordion or just the editor.

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
