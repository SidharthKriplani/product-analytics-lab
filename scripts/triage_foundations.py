#!/usr/bin/env python3
"""
Tier-3 SEMANTIC triage for Foundation modules — runs on your LOCAL LM Studio model
(zero cloud tokens). It does NOT grade authoritatively; it scores + flags suspects so
you only adjudicate a short pile instead of re-reading 79 modules.

Calibration (learned V5.72.0): a weak local model over-flags and mis-reads (claims an
example is missing when it's in the text). Two guards: every flag must cite EVIDENCE
(forces it to read) and it must SCORE 1-5 (forces discrimination). "review" = score <= 2
or any factual-doubt. Still a net, not a judge — final call is yours (EVAL_RUBRICS.md Tier 3).

Prereqs: LM Studio running with a model loaded; pip install requests.
Run from repo root:
    python3 scripts/triage_foundations.py --room exp --limit 5   # smoke test
    python3 scripts/triage_foundations.py --room all
Output: scripts/foundations_triage.csv (worst-first) + a printed shortlist.
"""
import json, re, subprocess, sys, os, tempfile, csv, requests

BASE_URL = "http://127.0.0.1:1234"
MODEL    = "qwen2.5-7b-instruct"   # instruct model holds strict JSON + literal reading better than a reasoner; auto-detect overrides if not loaded
TIMEOUT  = 120

ROOMS = {
    'stats':   ('src/data/statsFoundationsModules.js',  'statsFoundationsModules'),
    'exp':     ('src/data/expFoundationModules.js',     'expFoundationModules'),
    'metrics': ('src/data/metricsFoundationModules.js', 'metricsFoundationModules'),
    'rca':     ('src/data/rcaFoundationModules.js',     'rcaFoundationModules'),
}

SYSTEM = """You are a sharp content reviewer for a product-analytics interview-prep platform.
You review TEACHING modules and only FLAG suspects for a human expert — you never rewrite.
You read carefully and NEVER claim something is missing that is actually present in the text.
Every flag must cite specific evidence. Output VALID JSON ONLY — no markdown, no prose outside the JSON."""

RUBRIC = """How these modules work: each teaches ONE concept through a realistic NARRATIVE SCENARIO
written in `keyInsight` (usually with concrete numbers), plus a `connection` line on where it is used.
A concrete scenario or numbers in keyInsight COUNT as both intuition and a worked example —
do NOT flag "no-intuition" or "no-example" if keyInsight contains a scenario or any numbers.

Score the module 1-5:
5 = sharp, builds real judgment, would hold a strong candidate
4 = solid
3 = fine but unremarkable
2 = a real weakness (must be backed by a flag + evidence)
1 = wrong, misleading, or near-useless

Flag ONLY genuine problems, each with evidence:
- recall-not-judgment: states facts with no scenario or decision to reason about
- no-intuition: asserts a claim/formula with zero "why it works" (ONLY if truly absent)
- no-example: no concrete instance or number anywhere (ONLY if truly absent)
- jargon: a term used with no definition a learner here would need
- weak-connection: the connection line is generic/boilerplate
- factual-doubt: a claim/threshold/number that seems wrong (flag for the human to verify; you are NOT the authority)
- boring: technically fine but flat and forgettable

Most modules here are well-built. Reserve scores of 2 or below for genuine issues; if you are flagging
the majority, re-read — you are being too harsh. For every flag, put the exact offending or missing
thing in `evidence` as a short reason WITHOUT quotation marks.

Return JSON exactly:
{"score": 1-5, "flags": ["..."], "evidence": "specific reason, no quote marks", "why": "one short sentence"}
Use [] for flags on a clean module."""


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
        return {"score": 2, "flags": ["parse-error"], "evidence": "no JSON returned", "why": text[:120]}
    try:
        return json.loads(m.group())
    except Exception:
        return {"score": 2, "flags": ["parse-error"], "evidence": "unparseable JSON", "why": m.group()[:120]}


def module_msg(room, m):
    return (f"{RUBRIC}\n\n---\nMODULE (room: {room})\n"
            f"title: {m.get('title','')}\n"
            f"subtitle: {m.get('subtitle','')}\n"
            f"difficulty: {m.get('difficulty','')}\n"
            f"keyInsight: {m.get('keyInsight','')}\n"
            f"connection: {m.get('connection','')}")


def main():
    global MODEL
    args = sys.argv[1:]
    room, limit, forced = 'all', None, None
    for i, a in enumerate(args):
        if a == '--room' and i + 1 < len(args): room = args[i + 1]
        if a == '--limit' and i + 1 < len(args): limit = int(args[i + 1])
        if a == '--model' and i + 1 < len(args): forced = args[i + 1]
    if forced: MODEL = forced

    try:
        r = requests.get(f"{BASE_URL}/v1/models", timeout=5); r.raise_for_status()
        ids = [m.get('id') for m in r.json().get('data', []) if m.get('id')]
    except Exception as e:
        print(f"ERROR: LM Studio not reachable at {BASE_URL} ({e}).")
        print("Open LM Studio -> load a model -> Developer (Local Server) -> Start Server, then re-run.")
        sys.exit(1)
    if ids and MODEL not in ids:
        short = MODEL.split('/')[-1].lower()
        match = next((i for i in ids if short in i.lower() or i.lower() in MODEL.lower()), None)
        if match:
            print(f"Note: '{MODEL}' not an exact loaded id; using '{match}'.")
            MODEL = match
        elif forced:
            print(f"ERROR: requested --model '{MODEL}' is not loaded.")
            print(f"Loaded models: {', '.join(ids) if ids else '(none)'}")
            print("Load it in LM Studio (Loaded Models must show it READY), or pass one of the above ids.")
            sys.exit(1)
        else:
            print(f"Note: '{MODEL}' not loaded; using served model '{ids[0]}'.")
            MODEL = ids[0]
    print(f"Model: {MODEL}")

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
                res = {"score": 2, "flags": ["call-error"], "evidence": str(e)[:120], "why": ""}
            try:
                score = int(res.get('score', 3))
            except Exception:
                score = 2
            flags = res.get('flags', []) or []
            evidence = (res.get('evidence', '') or '').replace('\n', ' ')
            why = (res.get('why', '') or '').replace('\n', ' ')
            review = score <= 2 or 'factual-doubt' in flags
            sev = 3 if 'factual-doubt' in flags else (3 if score <= 1 else 2 if score <= 2 else 1)
            mark = f"REVIEW s{sev}" if review else "  ok  "
            print(f"  {mark} score{score} [{rk}] {m.get('id','?')} {m.get('title','')[:40]}"
                  + (f"  — {','.join(flags)}" if review else ''))
            if review:
                rows.append({'room': rk, 'id': m.get('id', ''), 'title': m.get('title', ''),
                             'score': score, 'severity': sev, 'flags': ','.join(flags),
                             'evidence': evidence, 'why': why})

    rows.sort(key=lambda r: (r['score'], -int(r['severity'])))
    out = 'scripts/foundations_triage.csv'
    with open(out, 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['room', 'id', 'title', 'score', 'severity', 'flags', 'evidence', 'why'])
        w.writeheader(); w.writerows(rows)

    print(f"\n── Shortlist: {len(rows)} flagged for human review (worst first) ──")
    for r in rows:
        print(f"  score{r['score']} [{r['room']}] {r['id']} {r['title'][:38]} — {r['flags']}: {r['evidence']}")
    print(f"\nFull ledger: {out}. 'review' = look; 'ok' = not a clearance. You adjudicate.")


if __name__ == '__main__':
    main()
