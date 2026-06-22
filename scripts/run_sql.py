#!/usr/bin/env python3
"""Run arbitrary SQL against a datamart (reuses audit_sql_lab's builder + sql.js
numeric mimic). Used to author debriefs from REAL output and to verify that a
candidate wrong-query runs and diverges from the solution.

Usage:
  python3 scripts/run_sql.py <datamartId> "<SQL>"
  python3 scripts/run_sql.py --problem <id>            # runs that problem's solution
  python3 scripts/run_sql.py --diverge <id> "<wrongSQL>"  # solution vs wrong-query
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import audit_sql_lab as A

def get_dm_and_problems():
    data = A.extract_data()
    dms = data['datamarts']                      # dict: id -> datamart
    probs = {p['id']: p for p in data['problems']}
    return dms, probs

def run(dm, sql):
    conn = A.build_db(dm)
    try:
        cols, rows = A.run_sql(conn, sql)
        return cols, [tuple(A.js_string(v) for v in r) for r in rows]
    finally:
        conn.close()

def main():
    dms, probs = get_dm_and_problems()
    if sys.argv[1] == '--problem':
        p = probs[sys.argv[2]]
        cols, rows = run(dms[p['datamartId']], p['solution'])
        print(f"{p['id']} solution -> {len(rows)} rows; cols={cols}")
        for r in rows[:30]: print('  ', r)
    elif sys.argv[1] == '--diverge':
        p = probs[sys.argv[2]]; wrong = sys.argv[3]
        _, good = run(dms[p['datamartId']], p['solution'])
        try:
            _, bad = run(dms[p['datamartId']], wrong)
        except Exception as e:
            print('WRONG QUERY ERRORED (not a runs-but-wrong bug):', e); return
        print(f"solution: {len(good)} rows | wrong: {len(bad)} rows | diverge: {good != bad}")
        print('solution[:6]:', good[:6])
        print('wrong[:6]   :', bad[:6])
    else:
        dmid, sql = sys.argv[1], sys.argv[2]
        cols, rows = run(dms[dmid], sql)
        print(cols)
        for r in rows: print(r)

if __name__ == '__main__':
    main()
