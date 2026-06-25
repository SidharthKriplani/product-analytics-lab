# SQL Lab — SQLite → Postgres migration ✅ DONE (V7.0.0, 2026-06-25)

**COMPLETE + verified + shipped.** 192/192 solutions (rows+cols+checkValues), 336/336 methods, broken-queries all correct under real Postgres (pglite). Engine swapped in `SqlLabPage.jsx`; `@electric-sql/pglite` in package.json; build 906 modules. Harness: `scripts/pg_verify_harness.mjs` (+ harness2/3 variants used checkValues + methods/brokenQuery). **Not migrated:** Beginner page (still sql.js — intro SQL, intentional). The notes below are the historical plan/scope.

---

# SQL Lab — SQLite → Postgres migration (historical plan)

_Started 2026-06-25. Goal: run SQL Lab on real Postgres (via **pglite** — Postgres compiled to WASM, in-browser) instead of SQLite (sql.js). Real interview screens are Postgres/MySQL-flavored; the cheat sheet is already written in Postgres syntax; SQLite-isms like `strftime`/`date(x,'-N years')` are a teaching liability. Must be done thoroughly — builds freeze 5 days after this._

## The rule (protects the freeze)
**Porting and the engine swap ship as ONE atomic commit.** Porting a solution to Postgres syntax (e.g. `ROUND(x::numeric, 2)`) breaks it on the *current* SQLite engine, so we never push porting and the engine swap separately. Push only when the harness shows **192/192 green on Postgres** AND the engine is pglite.

## Verification harness
`scripts/pg_verify_harness.mjs` — runs every problem's `solution` against pglite (builds each datamart, compares row count + columns). Requires `@electric-sql/pglite` (devDep; `npm i -D @electric-sql/pglite`). Run from a dir where pglite resolves. **This is the gate** — extend it to also check `brokenQuery` and `methods[].sql`.

## Scope (from the harness, 2026-06-25)
- **128 / 192 solutions pass unchanged.** **All 13 datamarts build with ZERO changes** (DDL + types port directly). **Zero semantic/row/col mismatches** in the passing set.
- **64 solutions fail — all mechanical SQLite-isms:**

| Pattern | Postgres port | ~count | ids (solution-level) |
|---|---|---|---|
| `ROUND(<float expr>, n)` | `ROUND((<expr>)::numeric, n)` | ~30 | e26, e35, e69, e74, e86, m28, m30, m47, m57, m76, h08, h10, h13, h32, h48, master03, master05, master18, f02, f11, f12, f13, f16, f21, f27, meesho-03, meesho-09, med1 |
| `strftime('%Y-%m', x)` etc. | `to_char(x::timestamp,'YYYY-MM')`; `strftime('%Y',x)`→`EXTRACT(YEAR FROM x::date)::int`; `'%w'`→`EXTRACT(DOW FROM x::date)::int`; `'%Y-%m-%d'`→`x::date` | ~18 | m04, m09, h04, h07, h25, h41, master13, master27, f14, f33, meesho-11, sw01, sw04, sess1, sess2, med2, set1, gaps3 |
| `julianday(a) - julianday(b)` | dates → `(a::date - b::date)` (int days); sub-day → `EXTRACT(EPOCH FROM a::timestamp - b::timestamp)/86400.0` | ~14 | m07, m26, m42, h49, h02, h17, h24, h34, h42, master02, f19, f24, meesho-02, gaps2 |
| `date(x, '-50 years')` | `(x::date - interval '50 years')` | 2 | e67, h51 |
| `instr(str, sub)` | `strpos(str, sub)` (or `position(sub in str)`) | 1 | str1 |
| alias reused in HAVING/WHERE | repeat the expression or use a subquery (PG can't reference a SELECT alias there) | 1 | m10 (`inactive_pct`) |

**Also port (same patterns, not yet in the harness):** every forensic `brokenQuery`, and every judgment-layer `methods[].sql`. Extend the harness to cover them before declaring done.

## Remaining steps
1. Add `@electric-sql/pglite` to package.json (dep, not just dev — the app uses it).
2. Port the 64 solutions + all `brokenQuery` + all `methods[].sql` per the table. Re-run the harness after each batch until 192/192 (+ broken/methods) green.
3. Update debriefs that describe SQLite behavior (e.g. e67 already mentions the Postgres form; check others).
4. **Engine swap** in `SqlLabPage.jsx`: replace `new SQL.Database()` + sync `.run/.exec/.prepare` with `new PGlite()` + `await db.exec(schema)` / `await db.exec(INSERT…)` / `await db.query(sql)` (returns `{rows: object[], fields:[{name}]}`). Update `validateResults` + results rendering for the object-row shape (was array rows). Build is now async — handle the await/loading.
5. Remove `public/sql-wasm.wasm` + the sql.js dep; remove the cheat sheet's "SQLite (strftime)" note.
6. Update `SQL-LAB-SPEC.md` (engine = Postgres/pglite), `SQL-DIFFICULTY-RUBRIC.md` if it cites SQLite, and root `CLAUDE.md` (engine line).
7. Final harness run 192/192 → push as ONE commit.

## Risks / notes
- pglite bundle is ~3 MB WASM (vs sql.js ~1 MB) — acceptable; lazy-loaded with SQL Lab.
- `ROUND` wrap is mechanical but parens are nested — use a balanced-paren rewrite, not a naive regex.
- Some `julianday` diffs may be sub-day (sessions) — check whether integer-day or epoch-seconds is intended per problem.
- Booleans: datamarts store 0/1 INTEGER for flags; Postgres keeps them as int (fine). Don't convert to BOOLEAN unless a solution needs it.
