#!/usr/bin/env python3
"""
Judgment-Layer Method Verifier — PAL Quality Gate (Tier 1)

For every problem that carries a `methods[]` array, build its datamart DB once
and execute each method's `sql`, then assert:

  * non-trap methods (isTrap == false): output is BYTE-IDENTICAL to the
    problem's canonical `solution` output — same columns, same rows, same order.
  * trap methods (isTrap == true): the SQL must RUN without error AND DIVERGE
    from `solution`. A trap that matches the solution is a bug; a trap that
    errors is not a "runs-but-wrong" trap and is rejected too.
  * `canonicalMethodId` must exist in methods[], and the method whose id ==
    canonicalMethodId must be non-trap AND match the solution exactly.

Reuses audit_sql_lab's extract_data / build_db / run_sql / js_string so the
comparison is identical to the main SQL Lab audit (sql.js numeric mimic etc.).

Run from repo root:
  python3 scripts/verify_methods.py

Exit code 0 = every method on every problem verified.
Exit code 1 = one or more assertions failed (blocks commit).
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
import audit_sql_lab as A

failures = []
checked_problems = 0
checked_methods = 0


def fail(pid, msg):
    failures.append(f'[VERIFY FAIL] {pid}: {msg}')


def run(conn, sql):
    """Run SQL through the same path audit_sql_lab uses; return (cols, rows)
    with js_string-normalised cell values so the comparison matches the browser."""
    cols, rows = A.run_sql(conn, sql)
    norm = [tuple(A.js_string(v) for v in r) for r in rows]
    return cols, norm


def verify_problem(p, datamarts):
    global checked_problems, checked_methods
    pid = p.get('id', 'UNKNOWN')
    methods = p.get('methods')
    if not methods:
        return  # no judgment layer on this problem — nothing to verify

    checked_problems += 1

    dm_id = p.get('datamartId')
    if dm_id not in datamarts:
        fail(pid, f'datamartId {dm_id!r} not found in datamarts')
        return
    dm = datamarts[dm_id]

    # Build DB once for this problem.
    try:
        conn = A.build_db(dm)
    except Exception as e:
        fail(pid, f'failed to build datamart DB: {e}')
        return

    try:
        # Canonical solution output — the ground truth every non-trap must match.
        solution = p.get('solution', '')
        try:
            sol_cols, sol_rows = run(conn, solution)
        except Exception as e:
            fail(pid, f'solution itself raises error (cannot verify methods): {e}')
            return

        method_ids = [m.get('id') for m in methods]

        # ── canonicalMethodId integrity ──────────────────────────────────────
        canonical_id = p.get('canonicalMethodId')
        if canonical_id is None:
            fail(pid, 'has methods[] but no canonicalMethodId')
        elif canonical_id not in method_ids:
            fail(pid, f'canonicalMethodId {canonical_id!r} not found in methods[] ids {method_ids}')
        else:
            canon = next(m for m in methods if m.get('id') == canonical_id)
            if canon.get('isTrap'):
                fail(pid, f'canonicalMethodId {canonical_id!r} is marked isTrap:true — the canonical method cannot be a trap')

        # ── duplicate method ids ─────────────────────────────────────────────
        if len(method_ids) != len(set(method_ids)):
            fail(pid, f'duplicate method ids in methods[]: {method_ids}')

        id_set = set(method_ids)

        # ── MCQ option / answer integrity ────────────────────────────────────
        # Every MCQ option and answerId must reference a real method id, and the
        # answerId must be one of that MCQ's own options. Keeps the dial/MCQ
        # surface from drifting away from the verified methods.
        for q in p.get('mcqs', []):
            qid = q.get('id', '?')
            opts = q.get('options', [])
            for o in opts:
                if o not in id_set:
                    fail(pid, f'mcq {qid!r} option {o!r} is not a methods[] id {sorted(id_set)}')
            ans = q.get('answerId')
            if ans not in id_set:
                fail(pid, f'mcq {qid!r} answerId {ans!r} is not a methods[] id {sorted(id_set)}')
            elif ans not in opts:
                fail(pid, f'mcq {qid!r} answerId {ans!r} is not among its own options {opts}')

        # ── per-method execution + divergence assertions ─────────────────────
        for m in methods:
            mid = m.get('id', '?')
            msql = m.get('sql', '')
            is_trap = bool(m.get('isTrap'))
            checked_methods += 1

            if not msql.strip():
                fail(pid, f'method {mid!r} has empty sql')
                continue

            try:
                mcols, mrows = run(conn, msql)
            except Exception as e:
                if is_trap:
                    fail(pid, f'trap method {mid!r} ERRORS ({e}) — a trap must RUN and produce wrong output, not error')
                else:
                    fail(pid, f'method {mid!r} raises error: {e}')
                continue

            matches = (mcols == sol_cols and mrows == sol_rows)

            if is_trap:
                if matches:
                    fail(pid, f'trap method {mid!r} produces output IDENTICAL to solution — a trap must diverge')
                # else: runs + diverges — correct trap behaviour
            else:
                if not matches:
                    if mcols != sol_cols:
                        fail(pid, f'non-trap method {mid!r} columns {mcols} != solution columns {sol_cols}')
                    else:
                        # find first divergent row for a useful message
                        diff_idx = next((i for i in range(min(len(mrows), len(sol_rows)))
                                         if mrows[i] != sol_rows[i]), None)
                        detail = f'{len(mrows)} rows vs solution {len(sol_rows)} rows'
                        if diff_idx is not None:
                            detail += f'; first diff at row {diff_idx}: {mrows[diff_idx]} != {sol_rows[diff_idx]}'
                        fail(pid, f'non-trap method {mid!r} diverges from solution ({detail})')
    finally:
        conn.close()


def main():
    print('── Judgment-Layer Method Verifier ────────────────────────────────')
    print('Extracting from JS files via node...')
    data = A.extract_data()
    datamarts = data['datamarts']
    problems = data['problems']
    print(f'Loaded {len(datamarts)} datamarts, {len(problems)} problems')
    print()

    with_methods = [p for p in problems if p.get('methods')]
    print(f'{len(with_methods)} problem(s) carry a methods[] judgment layer.')
    print()

    for p in problems:
        before = len(failures)
        verify_problem(p, datamarts)
        if p.get('methods'):
            pid = p.get('id', 'UNKNOWN')
            status = 'PASS' if len(failures) == before else 'FAIL'
            n_methods = len(p.get('methods'))
            n_traps = sum(1 for m in p.get('methods') if m.get('isTrap'))
            print(f'  [{status}] {pid:14s} {n_methods} methods ({n_traps} trap) '
                  f'canonical={p.get("canonicalMethodId")!r}')

    print()
    print('═' * 60)
    print(f'Verified {checked_methods} methods across {checked_problems} problems.')
    if failures:
        print(f'\n🔴 {len(failures)} VERIFICATION FAILURE(S):\n')
        for f in failures:
            print(f'  {f}')
        print()
        sys.exit(1)
    else:
        print('\n✅ All methods verified — non-traps match solution, traps run + diverge.\n')
        sys.exit(0)


if __name__ == '__main__':
    main()
