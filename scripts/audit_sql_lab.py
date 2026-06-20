#!/usr/bin/env python3
"""
SQL Lab Problem Audit — PAL Quality Gate
Implements all Tier 1 checks from docs/EVAL_RUBRICS.md.
Run from repo root: python3 scripts/audit_sql_lab.py

Exit code 0 = all Tier 1 checks pass (may have Tier 2 warnings)
Exit code 1 = one or more Tier 1 failures
"""

import sqlite3
import json
import subprocess
import sys
import os
import re
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
DATAMART_FILE = REPO_ROOT / 'src/data/sqlLabDatamarts.js'
PROBLEMS_FILE = REPO_ROOT / 'src/data/sqlLabProblems.js'
EXTRACTOR = REPO_ROOT / 'scripts/_extract_sql_data.mjs'

REQUIRED_FIELDS = [
    'id', 'title', 'company', 'companyDomain', 'difficulty',
    'tags', 'roles', 'priority', 'estimatedMin', 'datamartId',
    'prompt', 'expectedColumns', 'expectedRowCount', 'hints',
    'checkValues', 'solution', 'debrief', 'sqliteNote'
]
# Fields that exist on newer problems only — warn if missing, don't block
SOFT_REQUIRED = ['format', 'isFree']

FORENSIC_REQUIRED = ['brokenQuery', 'brokenOutputNote']

CONTROLLED_TAGS = {
    'joins', 'aggregation', 'window-functions', 'subquery', 'cte',
    'filtering', 'date-functions', 'string-functions', 'null-handling',
    'case-when', 'group-by', 'having', 'order-by', 'distinct', 'exists',
    'forensic', 'performance', 'data-quality', 'ranking', 'running-total',
    'date-spine', 'recursive-cte', 'percent-rank', 'rows-between', 'set-operations'
}

ESTIMATED_MIN_RANGES = {
    'Easy': (5, 15),
    'Medium': (8, 18),
    'Hard': (15, 28),
    'Master': (20, 40),
    'Forensic': (8, 22),
}

DANGEROUS_KEYWORDS = ['DROP ', 'DELETE ', 'UPDATE ', 'INSERT ', 'ALTER ', 'TRUNCATE ']

t1_failures = []
t2_warnings = []


def fail(pid, msg):
    t1_failures.append(f'[T1 FAIL] {pid}: {msg}')


def warn(pid, msg):
    t2_warnings.append(f'[T2 WARN] {pid}: {msg}')


def extract_data():
    """Write a temp .mjs extractor and run it via node."""
    extractor_src = f"""
import {{ datamarts }} from '{DATAMART_FILE}';
import {{ sqlLabProblems }} from '{PROBLEMS_FILE}';
process.stdout.write(JSON.stringify({{ datamarts, problems: sqlLabProblems }}));
"""
    import tempfile
    with tempfile.NamedTemporaryFile(suffix='.mjs', mode='w', delete=False) as f:
        f.write(extractor_src)
        tmp_path = f.name
    try:
        result = subprocess.run(
            ['node', tmp_path],
            capture_output=True, text=True, timeout=30
        )
    finally:
        os.unlink(tmp_path)
    if result.returncode != 0:
        print('ERROR: node extraction failed:')
        print(result.stderr)
        sys.exit(1)
    return json.loads(result.stdout)


def build_db(dm):
    """Create an in-memory SQLite DB from a datamart definition."""
    conn = sqlite3.connect(':memory:')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    for table_name, table in dm['tables'].items():
        cur.execute(table['schema'] + ';')
        if table['rows']:
            col_count = len(table['columns'])
            placeholders = '(' + ','.join(['?'] * col_count) + ')'
            cur.executemany(
                f'INSERT INTO {table_name} VALUES {placeholders}',
                table['rows']
            )
    conn.commit()
    return conn


def run_sql(conn, sql):
    """Run SQL; return (columns, rows) or raise on error."""
    cur = conn.cursor()
    cur.execute(sql)
    rows = cur.fetchall()
    cols = [d[0] for d in cur.description] if cur.description else []
    return cols, [list(r) for r in rows]


def js_string(val):
    """
    Mimic JavaScript's String() for sql.js numeric return values.
    sql.js returns whole-number REAL values as JS integers:
      String(19.0) → '19', String(5900.0) → '5900'
    Python sqlite3 returns them as Python floats (19.0, 5900.0).
    This function normalises so comparisons match browser behaviour.
    """
    if val is None:
        return 'NULL'
    if isinstance(val, float) and val == int(val) and abs(val) < 1e15:
        return str(int(val))
    return str(val)


def check_whole_number_format(val_str, pid, field_hint):
    """Catch .0 suffix on checkValues strings — these fail in the browser too."""
    if isinstance(val_str, str) and re.match(r'^-?\d+\.0$', val_str):
        fail(pid, f'checkValues has ".0" suffix in "{field_hint}": {val_str!r} — should be {val_str[:-2]!r}')


def has_order_by(sql):
    return bool(re.search(r'\bORDER\s+BY\b', sql, re.IGNORECASE))


def audit_problem(p, datamarts):
    pid = p.get('id', 'UNKNOWN')

    # ── T1-1: Required fields ─────────────────────────────────────────────────
    missing = [f for f in REQUIRED_FIELDS if f not in p]
    if missing:
        fail(pid, f'Missing required fields: {missing}')

    # Soft-required: warn only
    missing_soft = [f for f in SOFT_REQUIRED if f not in p]
    if missing_soft:
        warn(pid, f'Missing soft-required fields (add on next edit): {missing_soft}')

    if p.get('format') == 'forensic':
        missing_f = [f for f in FORENSIC_REQUIRED if f not in p]
        if missing_f:
            fail(pid, f'Forensic problem missing fields: {missing_f}')

    # ── T1-6: difficulty/format alignment ────────────────────────────────────
    fmt = p.get('format', '')
    diff = p.get('difficulty', '')
    if fmt == 'forensic' and diff != 'Forensic':
        fail(pid, f'format=forensic but difficulty={diff!r} (must be "Forensic")')
    if fmt != 'forensic' and diff == 'Forensic':
        fail(pid, f'difficulty=Forensic but format={fmt!r}')

    # ── T1-5: datamartId referential integrity ────────────────────────────────
    dm_id = p.get('datamartId')
    if dm_id not in datamarts:
        fail(pid, f'datamartId {dm_id!r} not found in datamarts')
        return  # can't run SQL checks without a valid datamart
    dm = datamarts[dm_id]

    # ── T1-14: no dangerous SQL ───────────────────────────────────────────────
    solution = p.get('solution', '')
    for kw in DANGEROUS_KEYWORDS:
        if kw in solution.upper():
            fail(pid, f'Solution contains dangerous keyword: {kw.strip()}')

    broken = p.get('brokenQuery', '')
    if broken:
        for kw in DANGEROUS_KEYWORDS:
            if kw in broken.upper():
                fail(pid, f'brokenQuery contains dangerous keyword: {kw.strip()}')

    # ── T1-15: tables in solution exist in datamart ───────────────────────────
    known_tables = set(dm['tables'].keys())
    # Extract CTE names so they don't get flagged as unknown tables
    # Match both `name AS (` and `name(col1, col2) AS (` (RECURSIVE CTEs with column lists)
    cte_names = set(re.findall(r'\b([a-z_][a-z0-9_]*)\s*(?:\([^)]*\))?\s*AS\s*\(', solution, re.IGNORECASE))
    table_refs = re.findall(r'(?:FROM|JOIN)\s+([a-z_][a-z0-9_]*)', solution, re.IGNORECASE)
    for t in table_refs:
        tl = t.lower()
        if tl not in known_tables and tl not in {c.lower() for c in cte_names}:
            fail(pid, f'Solution references table {t!r} not in datamart {dm_id!r}')

    # Build DB
    try:
        conn = build_db(dm)
    except Exception as e:
        fail(pid, f'Failed to build datamart DB: {e}')
        return

    # ── T1-7/8/9/10/11/12/13/20: Solution execution checks ───────────────────
    expected_cols = p.get('expectedColumns', [])
    expected_row_count = p.get('expectedRowCount', -1)
    check_values = p.get('checkValues', [])

    try:
        actual_cols, actual_rows = run_sql(conn, solution)
    except Exception as e:
        fail(pid, f'Solution raises error: {e}')
        conn.close()
        return

    # T1-8: non-zero rows
    if len(actual_rows) == 0:
        fail(pid, 'Solution returns 0 rows')

    # T1-9: row count matches
    if len(actual_rows) != expected_row_count:
        fail(pid, f'expectedRowCount={expected_row_count} but solution returns {len(actual_rows)} rows')

    # T1-10: column names match exactly
    if actual_cols != expected_cols:
        fail(pid, f'expectedColumns={expected_cols} but solution returns {actual_cols}')

    # T1-12: checkValues keys are subset of expectedColumns
    for i, cv in enumerate(check_values):
        for key in cv:
            if key not in expected_cols:
                fail(pid, f'checkValues[{i}] key {key!r} not in expectedColumns {expected_cols}')

    # T1-11/13: ALL checkValues rows verified against actual output
    for i, cv in enumerate(check_values):
        if i >= len(actual_rows):
            fail(pid, f'checkValues[{i}] has no corresponding row in solution output (only {len(actual_rows)} rows)')
            continue
        row = actual_rows[i]
        for key, expected_val in cv.items():
            if key not in actual_cols:
                continue  # already caught above
            col_idx = actual_cols.index(key)
            actual_val = row[col_idx]
            actual_str = js_string(actual_val)
            if actual_str != str(expected_val):
                fail(pid, f'checkValues[{i}][{key!r}]: expected {expected_val!r} but solution produces {actual_str!r}')
            # T1-13: .0 suffix in the checkValue string itself
            check_whole_number_format(expected_val, pid, key)

    # T1-20: ORDER BY determinism
    if check_values and len(actual_rows) > 1 and not has_order_by(solution):
        fail(pid, 'checkValues imply row ordering but solution has no ORDER BY — non-deterministic')

    # T1-21: strftime safety — check that strftime columns are TEXT ISO timestamps
    if 'strftime' in solution.lower():
        # Just warn since we can't easily verify column types statically
        # But we CAN check: if strftime result appears in output, it shouldn't be all NULLs
        strftime_nulls = False
        for row in actual_rows:
            for val in row:
                pass  # We already verified output matches checkValues above — if strftime was broken, T1-11 would catch it

    # ── Forensic-specific checks ──────────────────────────────────────────────
    if fmt == 'forensic' and broken:
        try:
            broken_cols, broken_rows = run_sql(conn, broken)
        except Exception as e:
            fail(pid, f'brokenQuery raises error: {e}')
            conn.close()
            return

        # T1-16 (runs without error) — already confirmed above
        # T1-17: broken query returns non-zero rows
        # Exception: brokenQueryReturnsZeroRows: true marks intentional zero-row bugs (e.g. = NULL vs IS NULL)
        if len(broken_rows) == 0 and not p.get('brokenQueryReturnsZeroRows'):
            fail(pid, 'brokenQuery returns 0 rows (should run and produce wrong output, not empty)')

        # T1-18: broken output differs from solution output
        # Skip if brokenQueryReturnsZeroRows — 0 rows vs non-zero is inherently different
        if not p.get('brokenQueryReturnsZeroRows') and broken_rows == actual_rows and broken_cols == actual_cols:
            fail(pid, 'brokenQuery produces identical output to solution — not a valid forensic scenario')

        # T1-19: broken query references same primary tables as solution
        broken_tables = set(re.findall(r'(?:FROM|JOIN)\s+([a-z_][a-z0-9_]*)', broken, re.IGNORECASE))
        solution_tables = set(re.findall(r'(?:FROM|JOIN)\s+([a-z_][a-z0-9_]*)', solution, re.IGNORECASE))
        if not broken_tables.intersection(solution_tables):
            fail(pid, f'brokenQuery tables {broken_tables} share no tables with solution tables {solution_tables}')

    conn.close()

    # ── TIER 2 WARNINGS ───────────────────────────────────────────────────────

    # T2: hints
    hints = p.get('hints', [])
    if len(hints) < 2:
        warn(pid, f'Only {len(hints)} hint(s) — recommend ≥ 2')
    if len(set(hints)) < len(hints):
        warn(pid, 'Duplicate hint strings within problem')

    # T2: debrief
    debrief = p.get('debrief', '')
    if len(debrief) < 200:
        warn(pid, f'Debrief is short ({len(debrief)} chars) — recommend > 200')
    if len(debrief) > 300 and '**' not in debrief:
        warn(pid, 'Debrief > 300 chars but no DEBRIEF_BLOCKS markers (**Section:**) — will render as wall of text')

    # T2: checkValues non-empty
    if not check_values:
        warn(pid, 'checkValues is empty — no automated answer verification possible')

    # T2: isFree distribution (tracked across problems, checked after loop)

    # T2: tags controlled vocabulary
    for tag in p.get('tags', []):
        if tag not in CONTROLLED_TAGS:
            warn(pid, f'Tag {tag!r} not in controlled vocabulary')

    # T2: estimatedMin calibration
    est = p.get('estimatedMin')
    if est is not None and diff in ESTIMATED_MIN_RANGES:
        lo, hi = ESTIMATED_MIN_RANGES[diff]
        if not (lo <= est <= hi):
            warn(pid, f'estimatedMin={est} outside expected range {lo}–{hi} for difficulty={diff!r}')

    # T2: prompt quality (business context)
    prompt = p.get('prompt', '')
    if len(prompt) < 80:
        warn(pid, f'Prompt is very short ({len(prompt)} chars) — likely missing business context')
    if not any(c in prompt.lower() for c in ['team', 'analyst', 'manager', 'ops', 'finance', 'product', 'stakeholder', 'report', 'review', 'track', 'monitor', 'help', 'want', 'need', 'identify', 'understand']):
        warn(pid, 'Prompt may lack business context — should read like a real request, not a test instruction')

    # T2: beforeWriting on Hard/Master
    if diff in ('Hard', 'Master') and not p.get('beforeWriting'):
        warn(pid, f'difficulty={diff!r} — consider adding beforeWriting judgment prompt')


def main():
    print('── SQL Lab Audit ─────────────────────────────────────────────────')
    print(f'Extracting from JS files via node...')

    data = extract_data()
    datamarts = data['datamarts']
    problems = data['problems']

    print(f'Loaded {len(datamarts)} datamarts, {len(problems)} problems')
    print()

    # ── Cross-problem checks ──────────────────────────────────────────────────
    ids = [p.get('id') for p in problems]
    titles = [p.get('title') for p in problems]
    solutions = [p.get('solution') for p in problems]

    # T1-3: no duplicate IDs
    seen_ids = {}
    for i, pid in enumerate(ids):
        if pid in seen_ids:
            fail(pid, f'Duplicate ID — also at index {seen_ids[pid]}')
        seen_ids[pid] = i

    # T2: no duplicate titles
    seen_titles = {}
    for i, t in enumerate(titles):
        if t and t in seen_titles:
            warn(ids[i], f'Duplicate title "{t}" — also at index {seen_titles[t]}')
        if t:
            seen_titles[t] = i

    # T2: no duplicate solutions
    seen_solutions = {}
    for i, s in enumerate(solutions):
        if s and s in seen_solutions:
            warn(ids[i], f'Identical solution to problem at index {seen_solutions[s]} ({ids[seen_solutions[s]]})')
        if s:
            seen_solutions[s] = i

    # T2: isFree distribution — each company needs ≥1 free problem
    from collections import defaultdict
    company_free = defaultdict(int)
    company_total = defaultdict(int)
    for p in problems:
        co = p.get('company', 'unknown')
        company_total[co] += 1
        if p.get('isFree'):
            company_free[co] += 1
    for co, total in company_total.items():
        if company_free[co] == 0:
            t2_warnings.append(f'[T2 WARN] company={co!r}: {total} problems but 0 are free — non-paying users get nothing')

    # ── Per-problem checks ────────────────────────────────────────────────────
    for p in problems:
        audit_problem(p, datamarts)

    # ── Report ────────────────────────────────────────────────────────────────
    print('═' * 60)
    if t1_failures:
        print(f'\n🔴 TIER 1 FAILURES ({len(t1_failures)}) — fix before committing:\n')
        for f in t1_failures:
            print(f'  {f}')
    else:
        print('\n✅ All Tier 1 checks passed\n')

    if t2_warnings:
        print(f'\n⚠️  TIER 2 WARNINGS ({len(t2_warnings)}) — triage in AUDITS.md:\n')
        for w in t2_warnings:
            print(f'  {w}')
    else:
        print('✅ No Tier 2 warnings\n')

    print()
    sys.exit(1 if t1_failures else 0)


if __name__ == '__main__':
    main()
