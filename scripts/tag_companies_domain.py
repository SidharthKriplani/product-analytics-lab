#!/usr/bin/env python3
"""
Deterministic (no-LLM) company tagging for SQL Lab.

For each problem, sets alsoAskedAt to up to 3 OTHER companies that use the SAME
datamart — i.e. companies in the same industry (datamarts are industry-themed:
fintech, ecomm, health, gaming, …). No LM Studio needed; deterministic and
verifiable. A seeded shuffle per problem id varies which peers surface, so the
same datamart doesn't show identical "+N" on every row.

Run from product-analytics-lab/:  python3 scripts/tag_companies_domain.py [--dry-run]
"""
import json, re, subprocess, sys, os, tempfile, random

JS_PATH = "src/data/sqlLabProblems.js"
DRY_RUN = '--dry-run' in sys.argv
MAX_PEERS = 3


def load_problems():
    src = f"import {{ sqlLabProblems }} from '{os.path.abspath(JS_PATH)}';\nprocess.stdout.write(JSON.stringify(sqlLabProblems));\n"
    with tempfile.NamedTemporaryFile(suffix='.mjs', mode='w', delete=False) as f:
        f.write(src); tmp = f.name
    try:
        r = subprocess.run(['node', tmp], capture_output=True, text=True, timeout=30)
        if r.returncode != 0:
            print("node extract failed:\n" + r.stderr); sys.exit(1)
        return json.loads(r.stdout)
    finally:
        os.unlink(tmp)


def patch(content, pid, companies):
    """Insert/replace alsoAskedAt after the companyDomain line within this problem's scope."""
    m = re.search(r"id:\s*'" + re.escape(pid) + r"'", content)
    if not m:
        raise ValueError(f"{pid} not found")
    nxt = re.search(r"\n    id:\s*'sql-", content[m.end():])
    end = m.end() + nxt.start() if nxt else len(content)
    scope = content[m.start():end]
    scope = re.sub(r"    alsoAskedAt:.*?\n", '', scope)  # remove existing
    esc = [c.replace("\\", "\\\\").replace("'", "\\'") for c in companies]
    joined = ', '.join("'" + c + "'" for c in esc)
    field = "    alsoAskedAt: [" + joined + "],\n"
    anchor = re.search(r"    companyDomain:.*?\n", scope) or re.search(r"    company:.*?\n", scope)
    if not anchor:
        raise ValueError(f"no company anchor in {pid}")
    scope = scope[:anchor.end()] + field + scope[anchor.end():]
    return content[:m.start()] + scope + content[end:]


def main():
    problems = load_problems()
    # datamart -> sorted list of companies that use it
    pools = {}
    for p in problems:
        if p.get('company') and p.get('datamartId'):
            pools.setdefault(p['datamartId'], set()).add(p['company'])
    pools = {k: sorted(v) for k, v in pools.items()}

    content = open(JS_PATH).read()
    counts = {}
    for p in problems:
        pid, comp, dm = p['id'], p.get('company'), p.get('datamartId')
        peers = [c for c in pools.get(dm, []) if c != comp]
        rnd = random.Random(pid)                 # deterministic per problem
        rnd.shuffle(peers)
        chosen = peers[:MAX_PEERS]
        counts[len(chosen)] = counts.get(len(chosen), 0) + 1
        if not DRY_RUN:
            content = patch(content, pid, chosen)

    print("alsoAskedAt count distribution:", dict(sorted(counts.items())))
    if DRY_RUN:
        print("DRY RUN — no write"); return
    o, c = content.count('{'), content.count('}')
    if o != c:
        print(f"ABORT: brace mismatch {o} vs {c}"); sys.exit(1)
    open(JS_PATH, 'w').write(content)
    print(f"Wrote {JS_PATH}")


if __name__ == '__main__':
    main()
