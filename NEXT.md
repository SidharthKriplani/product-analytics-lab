# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: 2026-06-20 (V5.40.0: Swiggy datamart + 6 India SQL problems sql-sw01–sw06. V5.39.0: 10 Forensic problems sql-f26–f35 + beforeWriting on 5 Hard problems.)*

---

## Status — V5.40.0 ready to commit + push

**ACTION REQUIRED:** From Mac terminal:
```bash
git clone https://github.com/SidharthKriplani/product-analytics-lab /tmp/pal-push-pal-v540
cp "/Users/ASUS/Documents/Professional/GitHub/upskill platforms (4)/product-analytics-lab/src/data/sqlLabDatamarts.js" /tmp/pal-push-pal-v540/src/data/sqlLabDatamarts.js
cp "/Users/ASUS/Documents/Professional/GitHub/upskill platforms (4)/product-analytics-lab/src/data/sqlLabProblems.js" /tmp/pal-push-pal-v540/src/data/sqlLabProblems.js
cp "/Users/ASUS/Documents/Professional/GitHub/upskill platforms (4)/product-analytics-lab/LINEAGE.md" /tmp/pal-push-pal-v540/LINEAGE.md
cp "/Users/ASUS/Documents/Professional/GitHub/upskill platforms (4)/product-analytics-lab/AUDITS.md" /tmp/pal-push-pal-v540/AUDITS.md
cp "/Users/ASUS/Documents/Professional/GitHub/upskill platforms (4)/product-analytics-lab/NEXT.md" /tmp/pal-push-pal-v540/NEXT.md
cd /tmp/pal-push-pal-v540
git config user.email "claudesubscription12@gmail.com"
git config user.name "Avinash"
git add -A
git commit -m "V5.40.0: Swiggy datamart + 6 India SQL problems (sql-sw01–sw06)"
git push origin main
```

---

## Active build queue

**1. P0 — Fix checkValues '.0' format bug in sql-f26–f35** — 10 Forensic problems have whole-number SUM/AVG results written as `'280.0'`, `'4450.0'`, etc. The check is `String(db_value) === String(checkValue)`. sql.js returns whole-number floats as JS integers: `String(280) = '280'`, not `'280.0'`. Correct answers silently rejected on the fallback path. Audit every checkValue in sql-f26–f35, strip `.0` from whole numbers, leave true decimals (`'249.99'`, `'5689.99'`) unchanged. Fix before any tester runs these. AUDITS.md #165. File: `src/data/sqlLabProblems.js`.

**2. Show expected output before first run** — Move `expectedSampleDisplay` (already computed in `initDb()`) into the problem panel so users see target columns and sample rows on load before writing anything. Purely a JSX placement change. AUDITS.md #166. File: `src/pages/SqlLabPage.jsx`.

**3. Delete 3 orphaned files** — `src/data/pathsData.js`, `src/utils/pathsProgress.js`, `src/pages/PathsBrowser.jsx` — unwired but on disk. Manual delete + commit.

**4. Dimensional modeling cases** — skeleton shipped (V5.34.0). Author 3-5 schema-critique cases tagged `data-modeling`. Flipkart DA track references these once live.

**5. SQL patterns still missing from bank** — 5 unrepresented patterns from AUDITS.md #132: date spine/gap-filling, ROWS BETWEEN frame specification, PERCENT_RANK/CUME_DIST, two-valid-queries-different-results, recursive CTE. At least 1 problem per pattern needed for comprehensive coverage.

---

## Recently shipped

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
