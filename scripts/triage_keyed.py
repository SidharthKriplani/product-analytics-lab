#!/usr/bin/env python3
"""
Tier-3 CONSISTENCY triage for the KEYED rooms — MCQ Trainer + Spot the Flaw — on your
LOCAL LM Studio model (zero cloud tokens).

Unlike Foundations (pure taste, which local models can't judge), this is a VERIFICATION
task against a definite keyed answer — the model's strength. It checks: is the keyed
answer actually right? is a distractor secretly also correct (ambiguity)? does the
explanation support the answer? For Spot-the-Flaw: does the keyed flaw really exist in
the setup, is it THE primary flaw, is the fix right? Over-flags; you adjudicate.

Run from repo root (LM Studio loaded, 14B recommended):
    python3 scripts/triage_keyed.py --room mcq --limit 5 --model qwen/qwen3-14b
    python3 scripts/triage_keyed.py --room stf --model qwen/qwen3-14b
    python3 scripts/triage_keyed.py --room all --model qwen/qwen3-14b
Output: scripts/keyed_triage.csv + printed shortlist.
"""
import json, re, subprocess, sys, os, tempfile, csv, requests

BASE_URL = "http://127.0.0.1:1234"
MODEL    = "qwen/qwen3-14b"
TIMEOUT  = 120

ROOMS = {
    'mcq': ('src/data/trainerMCQ.js',      'trainerMCQ'),
    'stf': ('src/data/spotTheFlawCases.js', 'spotTheFlawCases'),
}

SYSTEM = """You are a precise QA reviewer for an interview-prep platform. You VERIFY keyed answers
against the question text — you do not rewrite. You read carefully and only flag a problem you can
justify from the text. Output VALID JSON ONLY, no markdown, no prose outside the JSON."""

MCQ_RUBRIC = """Task: verify this multiple-choice item. You are given the question, the options, which
option is keyed CORRECT, and the explanation.

Flag the item if ANY of these is true (cite evidence, no quote marks):
- key-wrong: the keyed-correct option is not actually the best/correct answer.
- ambiguous: an option marked incorrect is also defensibly correct, so two answers work.
- explanation-mismatch: the explanation does not actually support the keyed answer (or contradicts it).
- unsound-distractor: a distractor is so obviously wrong it makes the question trivial, OR a distractor is factually true and misleading.

Score 1-5: 5 = clean, unambiguous, one correct answer well explained; 3 = minor nit; 1 = keyed answer wrong or two answers correct.
Return JSON exactly: {"score":1-5,"flags":["..."],"evidence":"specific reason, no quote marks","why":"one short sentence"}
Use [] flags for a clean item."""

STF_RUBRIC = """Task: verify this "spot the flaw" case. You are given the setup (an analysis that looks
correct), the question, the keyed flaw label, the flaw explanation, and the fix.

Flag the case if ANY of these is true (cite evidence, no quote marks):
- flaw-absent: the keyed flaw is not actually present in the setup as written.
- not-primary: a DIFFERENT, bigger flaw dominates the keyed one (the keyed flaw is secondary).
- fix-wrong: the stated fix would not actually correct the flaw.
- gives-it-away: the setup telegraphs the flaw so obviously there is no judgment to exercise.

Score 1-5: 5 = the keyed flaw is real, primary, plausibly hidden, fix is right; 3 = minor nit; 1 = flaw absent/wrong or fix wrong.
Return JSON exactly: {"score":1-5,"flags":["..."],"evidence":"specific reason, no quote marks","why":"one short sentence"}
Use [] flags for a clean case."""


def load_items(file, export_name):
    src = (f"import {{ {export_name} }} from '{os.path.abspath(file)}';\n"
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
        json={"model": MODEL,
              "messages": [{"role": "system", "content": SYSTEM},
                           {"role": "user", "content": "/no_think\n\n" + user_msg}],
              "temperature": 0.1, "max_tokens": 600},
        timeout=TIMEOUT)
    resp.raise_for_status()
    text = resp.json()["choices"][0]["message"]["content"].strip()
    text = re.sub(r'<think>[\s\S]*?</think>', '', text).strip()
    m = re.search(r'\{[\s\S]*\}', text)
    if not m:
        return {"score": 3, "flags": ["parse-error"], "evidence": "no JSON", "why": text[:120]}
    try:
        return json.loads(m.group())
    except Exception:
        return {"score": 3, "flags": ["parse-error"], "evidence": "unparseable JSON", "why": m.group()[:120]}


def mcq_msg(m):
    opts = '\n'.join(f"  ({o.get('id')}) [{'CORRECT' if o.get('correct') else 'incorrect'}] {o.get('text','')}"
                     for o in m.get('options', []))
    return (f"{MCQ_RUBRIC}\n\n---\nQUESTION: {m.get('question','')}\nOPTIONS:\n{opts}\n"
            f"EXPLANATION: {m.get('explanation','')}")


def stf_msg(c):
    return (f"{STF_RUBRIC}\n\n---\nSETUP: {c.get('setup','')}\nQUESTION: {c.get('question','')}\n"
            f"KEYED FLAW: {c.get('flawLabel','')}\nFLAW EXPLANATION: {c.get('flaw','')}\nFIX: {c.get('fix','')}")


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
        print(f"ERROR: LM Studio not reachable at {BASE_URL} ({e}). Load a model + start the server.")
        sys.exit(1)
    if ids and MODEL not in ids:
        short = MODEL.split('/')[-1].lower()
        match = next((i for i in ids if short in i.lower() or i.lower() in MODEL.lower()), None)
        if match:
            print(f"Note: using loaded id '{match}'."); MODEL = match
        elif forced:
            print(f"ERROR: --model '{MODEL}' not loaded. Loaded: {', '.join(ids)}"); sys.exit(1)
        else:
            MODEL = ids[0]
    print(f"Model: {MODEL}")

    targets = ROOMS.keys() if room == 'all' else [room]
    rows = []
    for rk in targets:
        if rk not in ROOMS:
            print(f"unknown room '{rk}' (mcq, stf, or all)"); sys.exit(1)
        file, exp = ROOMS[rk]
        items = load_items(file, exp)
        if limit: items = items[:limit]
        print(f"\n[{rk}] verifying {len(items)} items…")
        for it in items:
            msg = mcq_msg(it) if rk == 'mcq' else stf_msg(it)
            try:
                res = call_lm(msg)
            except Exception as e:
                res = {"score": 3, "flags": ["call-error"], "evidence": str(e)[:120], "why": ""}
            try: score = int(res.get('score', 3))
            except Exception: score = 3
            flags = res.get('flags', []) or []
            evidence = (res.get('evidence', '') or '').replace('\n', ' ')
            why = (res.get('why', '') or '').replace('\n', ' ')
            review = score <= 3 or any(f in flags for f in ('key-wrong', 'ambiguous', 'flaw-absent', 'not-primary', 'fix-wrong'))
            sev = 3 if score <= 1 else 2 if score <= 2 else 1
            label = it.get('id', '?')
            title = it.get('question', it.get('title', ''))[:46]
            mark = f"REVIEW s{sev}" if review else "  ok  "
            print(f"  {mark} score{score} [{rk}] {label} {title}" + (f"  — {','.join(flags)}" if review else ''))
            if review:
                rows.append({'room': rk, 'id': label, 'item': title, 'score': score,
                             'severity': sev, 'flags': ','.join(flags), 'evidence': evidence, 'why': why})

    rows.sort(key=lambda r: (r['score'], -int(r['severity'])))
    out = 'scripts/keyed_triage.csv'
    with open(out, 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['room', 'id', 'item', 'score', 'severity', 'flags', 'evidence', 'why'])
        w.writeheader(); w.writerows(rows)
    print(f"\n── Shortlist: {len(rows)} flagged (worst first) ──")
    for r in rows:
        print(f"  score{r['score']} [{r['room']}] {r['id']} — {r['flags']}: {r['evidence']}")
    print(f"\nLedger: {out}. This is a consistency net — verify the flagged items yourself.")


if __name__ == '__main__':
    main()
