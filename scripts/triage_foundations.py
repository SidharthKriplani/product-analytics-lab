#!/usr/bin/env python3
"""
Tier-3 SEMANTIC triage for Foundation modules — runs on your LOCAL LM Studio model
(zero cloud tokens). It does NOT grade; it OVER-FLAGS suspects so you only adjudicate
a short pile instead of re-reading 79 modules.

Treat output as a recall-biased net: 'review' = look at this; 'ok' = NOT a clearance,
just "the small model didn't catch anything." Final judgment is yours (see
docs/EVAL_RUBRICS.md → Tier 3).

Prereqs: LM Studio running with a model loaded (Settings mirror tag_companies.py).
    pip install requests
Run from repo root:
    python3 scripts/triage_foundations.py --room all          # all 79 modules
    python3 scripts/triage_foundations.py --room exp --limit 5 # smoke test
Output: scripts/foundations_triage.csv (sorted worst-first) + a printed shortlist.
"""
import json, re, subprocess, sys, os, tempfile, csv, requests

BASE_URL = "http://127.0.0.1:1234"
MODEL    = "qwen/qwen3-8b"
TIMEOUT  = 120

ROOMS = {
    'stats':   ('src/data/statsFoundationsModules.js',  'statsFoundationsModules'),
    'exp':     ('src/data/expFoundationModules.js',     'expFoundationModules'),
    'metrics': ('src/data/metricsFoundationModules.js', 'metricsFoundationModules'),
    'rca':     ('src/data/rcaFoundationModules.js',     'rcaFoundationModules'),
}

SYSTEM = """You are a ruthless content reviewer for a product-analytics interview-prep platform.
You review TEACHING modules. You do NOT rewrite — you only flag suspects for a human expert.
Bias toward flagging: when in doubt, mark "review". A clean pass means you found nothing, not that it is great.
Output VALID JSON ONLY, no markdown, no prose outside the JSON."""

RUBRIC = """Flag a module for human review if ANY of these apply:
- recall-not-judgment: it just states facts/definitions instead of building intuition or a judgment reflex.
- no-intuition: jumps to a formula/claim without the "why it works" intuition first.
- no-example: a quantitative concept with no concrete worked/numeric example.
- jargon: uses a term without defining it (assumes knowledge a learner here may not have).
- weak-connection: the "why this matters / where it's used" link is generic or missing.
- factual-doubt: any claim, threshold, or example that seems wrong or oversimplified (flag for the human to verify; you are not the authority).
- boring: technically fine but unlikely to hold a strong candidate's attention or to come up in a real interview.

Return JSON exactly:
{"verdict": "ok" | "review", "severity": 1|2|3, "flags": ["..."], "why": "one short sentence"}
severity: 3 = likely wrong/misleading, 2 = weak pedagogy, 1 = minor. Use [] flags and verdict "ok" only if nothing applies."""


def load_modules(file, export_name):
    src = (f"import {{ {export_name} }} from "
           f"'{os.path.abspath(file)}';\n"
           f"process.stdout.write(JSON.stringify({export_name}));\n")
    with tempfile.NamedTemporaryFile(suffix='.mjs', mode='w', delete=False) as f:
        f.write(src); tmp = f.name
    try:
        r = subprocess.run(['node', tmp], capture_output=True, text=True, timeout=30)
        if r.returncode != 0:
            print("node extract failed:\n" + r.stderr); sys.exit(1)
        return json.loads(r.stdout)
    finally:
        os.unlink(tmp)


def call_lm(user_msg):
    resp = requests.post(
        f"{BASE_URL}/v1/chat/completions",
        json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM},
                {"role": "user",   "content": "/no_think\n\n" + user_msg},
            ],
            "temperature": 0.1,
            "max_tokens": 600,
        },
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    text = resp.json()["choices"][0]["message"]["content"].strip()
    text = re.sub(r'<think>[\s\S]*?</think>', '', text).strip()
    m = re.search(r'\{[\s\S]*\}', text)
    if not m:
        return {"verdict": "review", "severity": 1, "flags": ["parse-error"],
                "why": "model returned no JSON: " + text[:120]}
    try:
        return json.loads(m.group())
    except Exception:
        return {"verdict": "review", "severity": 1, "flags": ["parse-error"],
                "why": "unparseable JSON: " + m.group()[:120]}


def module_msg(room, m):
    return (f"{RUBRIC}\n\n---\nMODULE (room: {room})\n"
            f"title: {m.get('title','')}\n"
            f"subtitle: {m.get('subtitle','')}\n"
            f"difficulty: {m.get('difficulty','')}\n"
            f"keyInsight: {m.get('keyInsight','')}\n"
            f"connection: {m.get('connection','')}")


def main():
    args = sys.argv[1:]
    room = 'all'
    limit = None
    for i, a in enumerate(args):
        if a == '--room' and i + 1 < len(args): room = args[i + 1]
        if a == '--limit' and i + 1 < len(args): limit = int(args[i + 1])

    global MODEL
    try:
        r = requests.get(f"{BASE_URL}/v1/models", timeout=5); r.raise_for_status()
        ids = [m.get('id') for m in r.json().get('data', []) if m.get('id')]
    except Exception as e:
        print(f"ERROR: LM Studio not reachable at {BASE_URL} ({e}).")
        print("Open LM Studio → load a model → Developer (Local Server) → Start Server, then re-run.")
        sys.exit(1)
    if ids and MODEL not in ids:
        print(f"Note: '{MODEL}' not loaded; using served model '{ids[0]}'.")
        MODEL = ids[0]
    elif not ids:
        print("Warning: server returned no model list; trying the configured MODEL anyway.")

    targets = ROOMS.keys() if room == 'all' else [room]
    rows = []
    for rk in targets:
        if rk not in ROOMS:
            print(f"unknown room '{rk}' (use: {', '.join(ROOMS)} or all)"); sys.exit(1)
        file, exp = ROOMS[rk]
        mods = load_modules(file, exp)
        if limit: mods = mods[:limit]
        print(f"\n[{rk}] triaging {len(mods)} modules…")
        for m in mods:
            try:
                res = call_lm(module_msg(rk, m))
            except Exception as e:
                res = {"verdict": "review", "severity": 1, "flags": ["call-error"], "why": str(e)[:120]}
            verdict = res.get('verdict', 'review')
            sev = res.get('severity', 1)
            flags = ','.join(res.get('flags', []) or [])
            why = res.get('why', '')
            mark = '  ok' if verdict == 'ok' else f"REVIEW s{sev}"
            print(f"  {mark}  [{rk}] {m.get('id','?')} {m.get('title','')[:42]}"
                  + (f"  — {flags}" if verdict != 'ok' else ''))
            if verdict != 'ok':
                rows.append({'room': rk, 'id': m.get('id', ''), 'title': m.get('title', ''),
                             'severity': sev, 'flags': flags, 'why': why})

    rows.sort(key=lambda r: (-int(r.get('severity', 1)), r['room']))
    out = 'scripts/foundations_triage.csv'
    with open(out, 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['room', 'id', 'title', 'severity', 'flags', 'why'])
        w.writeheader(); w.writerows(rows)

    print(f"\n── Shortlist: {len(rows)} modules flagged for human review (worst first) ──")
    for r in rows:
        print(f"  s{r['severity']} [{r['room']}] {r['id']} {r['title'][:40]} — {r['flags']}: {r['why']}")
    print(f"\nFull ledger: {out}. Remember: 'review' = look; 'ok' = not a clearance. You adjudicate.")


if __name__ == '__main__':
    main()
