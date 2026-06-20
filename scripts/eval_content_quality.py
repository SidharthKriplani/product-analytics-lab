#!/usr/bin/env python3
"""
LLM-assisted content quality evaluation for PAL SQL Lab problems.

Run from the product-analytics-lab/ directory:
    python3 scripts/eval_content_quality.py

Requires:  pip install requests
Output:    scripts/content_quality_report.csv
           scripts/content_quality_flagged.md  (score=1 problems only)

Scores each problem on 1-3:
  prompt_clarity  — 1=vague/confusing  2=mostly clear  3=anyone knows exactly what to write
  hints_quality   — 1=step-by-step giveaway  2=partial nudges  3=progressive without revealing answer
  debrief_quality — 1=restates solution only  2=some why  3=clear conceptual takeaway
  broken_note_acc — (Forensic only) 1=inaccurate  2=partial  3=precisely describes wrong output + why it misleads
"""

import csv, json, re, subprocess, sys, time
import requests

BASE_URL = "http://127.0.0.1:1234"
MODEL    = "qwen2.5-7b-instruct"
TIMEOUT  = 45  # seconds per call

SYSTEM_PROMPT = """You are a strict content quality reviewer for a SQL interview prep platform.
Users are product analysts and data scientists preparing for interviews. They need:
- Prompts (questions) that are unambiguous — clear business context, obvious output shape required
- Hints that nudge thinking without giving away the answer or the steps
- Debriefs that teach the underlying concept, not just describe the correct query

You return JSON only. No markdown, no explanation outside the JSON."""

def build_user_prompt(p):
    is_forensic = p.get('format') == 'Forensic'
    hints_text  = json.dumps(p.get('hints', []), indent=2)
    debrief     = (p.get('debrief', '') or '')[:700]
    broken_note = p.get('brokenOutputNote', '') if is_forensic else None

    scores_block = '''\
  "prompt_clarity":  <1|2|3>,
  "prompt_reason":   "<max 12 words why>",
  "hints_quality":   <1|2|3>,
  "hints_reason":    "<max 12 words why>",
  "debrief_quality": <1|2|3>,
  "debrief_reason":  "<max 12 words why>"'''

    if is_forensic:
        scores_block += ''',
  "broken_note_acc":    <1|2|3>,
  "broken_note_reason": "<max 12 words why>"'''

    scoring_guide = """
Scoring guide:
prompt_clarity  — 3: business context clear, output shape obvious; 2: mostly clear, minor ambiguity; 1: vague, confusing, or missing context
hints_quality   — 3: each hint nudges thinking without revealing approach; 2: some hints are useful, others too direct; 1: reads like step-by-step solution or gives away the answer
debrief_quality — 3: explains WHY this SQL pattern matters, not just what the query does; 2: some conceptual value; 1: only describes the solution, no insight
broken_note_acc — (Forensic) 3: precisely says what wrong output looks like AND why it misleads; 2: partial; 1: vague or inaccurate"""

    return f"""Problem id: {p['id']}  difficulty: {p['difficulty']}  format: {p.get('format','Standard')}

PROMPT (question shown to user):
{p.get('prompt', '')}

HINTS (shown one at a time):
{hints_text}

DEBRIEF (shown after solving):
{debrief}
{f'BROKEN_OUTPUT_NOTE: {broken_note}' if broken_note else ''}
{scoring_guide}

Return ONLY this JSON (no other text):
{{
{scores_block}
}}"""


def call_lm(p):
    resp = requests.post(
        f"{BASE_URL}/v1/chat/completions",
        json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": build_user_prompt(p)},
            ],
            "temperature": 0,
            "max_tokens":  250,
        },
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    text = resp.json()["choices"][0]["message"]["content"].strip()
    m = re.search(r'\{[\s\S]*\}', text)
    if not m:
        raise ValueError(f"No JSON in response: {text[:200]}")
    return json.loads(m.group())


def load_problems():
    out = subprocess.check_output(
        ["node", "-e", "const p=require('./src/data/sqlLabProblems.js'); process.stdout.write(JSON.stringify(p.problems))"],
        text=True,
    )
    return json.loads(out)


def main():
    # Quick connectivity check
    try:
        r = requests.get(f"{BASE_URL}/v1/models", timeout=5)
        r.raise_for_status()
    except Exception as e:
        print(f"ERROR: Cannot reach LM Studio at {BASE_URL}  ({e})")
        print("Make sure the server is running and the model is loaded.")
        sys.exit(1)

    problems = load_problems()
    print(f"Loaded {len(problems)} problems. Starting evaluation...\n")

    results  = []
    flagged  = []
    errors   = []

    for i, p in enumerate(problems):
        pid = p["id"]
        try:
            scores = call_lm(p)
            row = {
                "id":              pid,
                "company":         p.get("company", ""),
                "difficulty":      p.get("difficulty", ""),
                "format":          p.get("format", "Standard"),
                "prompt_clarity":  scores.get("prompt_clarity",  ""),
                "prompt_reason":   scores.get("prompt_reason",   ""),
                "hints_quality":   scores.get("hints_quality",   ""),
                "hints_reason":    scores.get("hints_reason",    ""),
                "debrief_quality": scores.get("debrief_quality", ""),
                "debrief_reason":  scores.get("debrief_reason",  ""),
                "broken_note_acc": scores.get("broken_note_acc", ""),
                "broken_note_reason": scores.get("broken_note_reason", ""),
                "error":           "",
            }
            results.append(row)

            pc = scores.get("prompt_clarity",  "?")
            hq = scores.get("hints_quality",   "?")
            dq = scores.get("debrief_quality", "?")
            any_one = any(scores.get(k) == 1 for k in
                          ["prompt_clarity", "hints_quality", "debrief_quality", "broken_note_acc"])
            flag = "  ⚠️" if any_one else ""
            print(f"[{i+1:3}/{len(problems)}] {pid:<22}  P={pc}  H={hq}  D={dq}{flag}")
            if any_one:
                flagged.append((pid, scores))

        except Exception as e:
            err_row = {"id": pid, "company": p.get("company",""), "difficulty": p.get("difficulty",""),
                       "format": p.get("format",""), "error": str(e)}
            results.append(err_row)
            errors.append(pid)
            print(f"[{i+1:3}/{len(problems)}] {pid:<22}  ERROR: {e}")

        time.sleep(0.05)

    # Write CSV
    fieldnames = ["id","company","difficulty","format",
                  "prompt_clarity","prompt_reason",
                  "hints_quality","hints_reason",
                  "debrief_quality","debrief_reason",
                  "broken_note_acc","broken_note_reason","error"]
    with open("scripts/content_quality_report.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(results)

    # Write flagged markdown
    with open("scripts/content_quality_flagged.md", "w") as f:
        f.write(f"# Content Quality Flagged Problems\n\n")
        f.write(f"Generated: {time.strftime('%Y-%m-%d')}  |  Model: {MODEL}\n\n")
        f.write(f"Flagged: {len(flagged)} of {len(problems)} problems (any dimension scored 1)\n\n---\n\n")
        for pid, scores in flagged:
            f.write(f"## {pid}\n\n")
            for dim, key, reason_key in [
                ("Prompt clarity",   "prompt_clarity",  "prompt_reason"),
                ("Hints quality",    "hints_quality",   "hints_reason"),
                ("Debrief quality",  "debrief_quality", "debrief_reason"),
                ("Broken note acc",  "broken_note_acc", "broken_note_reason"),
            ]:
                score = scores.get(key)
                if score == 1:
                    f.write(f"- **{dim}: {score}/3** — {scores.get(reason_key,'')}\n")
            f.write("\n")

    print(f"\n{'='*60}")
    print(f"Done. {len(problems)} problems evaluated.")
    print(f"  Flagged (any score=1): {len(flagged)}")
    print(f"  Errors:                {len(errors)}")
    print(f"  CSV:     scripts/content_quality_report.csv")
    print(f"  Flagged: scripts/content_quality_flagged.md")
    if errors:
        print(f"\n  Failed IDs: {', '.join(errors)}")

if __name__ == "__main__":
    main()
