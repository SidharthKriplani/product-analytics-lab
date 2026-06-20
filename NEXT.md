# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: 2026-06-20 (V5.39.0: 10 new Forensic problems sql-f26–f35 covering 10 new bug types; beforeWriting judgment prompts on 5 Hard problems. V5.38.x: race condition fix, Run/Check split, DEBRIEF_BLOCKS, PAL Exclusive badge all shipped.)*

---

## Status — V5.39.0 committed in /tmp/pal-push-v539 (948c533). Push pending.

**ACTION REQUIRED:** Run `cd /tmp/pal-push-v539 && git push origin main` from Mac terminal to deploy.

---

## Active build queue

**1. India company problems** — Swiggy / Zepto / Flipkart SQL problems using existing marketplace + ecomm datamarts, or create a new `india` datamart. 5-6 problems. Blue ocean — DataLemur has zero India-specific SQL content. These are the problems that make PAL resonate with Bangalore DA/PA candidates.

**2. SQL Lab P2: show expected output before first run** — Move expectedSampleDisplay into the problem panel so users see it on load (before writing anything). Already computed — just needs to be surfaced earlier in the UI. SQL_LAB_AUDIT_2026.md §5, Priority 2.

**3. Dimensional modeling cases** — skeleton shipped (V5.34.0). Author 3-5 schema-critique cases tagged `data-modeling`. Flipkart DA track references these once live.

**4. Delete 3 orphaned files** — `src/data/pathsData.js`, `src/utils/pathsProgress.js`, `src/pages/PathsBrowser.jsx` — unwired but on disk. Manual delete + commit.

**5. Debrief section parser** — Parse existing debrief text into collapsible colored blocks using DEBRIEF_BLOCKS system already built. Just needs content audit to confirm all debriefs use ** markers. SQL_LAB_AUDIT_2026.md §5, Priority 4.

---

## Recently shipped

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
