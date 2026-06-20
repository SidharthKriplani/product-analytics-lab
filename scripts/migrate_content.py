#!/usr/bin/env python3
"""
LLM-assisted content migration for PAL SQL Lab problems.

Rewrites prompt (DataLemur style) and generates hintSteps [{text, starterCode?}]
for every problem that still has a flat hints[] array.

Run from product-analytics-lab/ directory:
    python3 scripts/migrate_content.py

Requires: pip install requests
Resumes: skips problems already migrated (hintSteps present) unless --force passed
Output:  writes directly to src/data/sqlLabProblems.js

Flags:
  --dry-run     print changes without writing
  --id sql-m01  process only one problem (for testing)
  --force       reprocess even if hintSteps already present
"""

import json, re, subprocess, sys, time, requests, copy

BASE_URL = "http://127.0.0.1:1234"
MODEL    = "qwen/qwen3-8b"
TIMEOUT  = 120
JS_PATH  = "src/data/sqlLabProblems.js"

DRY_RUN  = '--dry-run' in sys.argv
FORCE    = '--force'   in sys.argv
ONLY_ID  = None
for i, arg in enumerate(sys.argv):
    if arg == '--id' and i + 1 < len(sys.argv):
        ONLY_ID = sys.argv[i + 1]

# ─── Prompts ──────────────────────────────────────────────────────────────────

SYSTEM = """You are a content writer for a SQL interview prep platform targeting product analysts.
You output valid JSON only. No markdown, no explanation outside the JSON.
Write in a professional but direct tone. No fluff."""

def prompt_rewrite_msg(p, dm_schema):
    tables_summary = ', '.join(dm_schema.keys())
    col_summary = '; '.join(
        f"{t}: ({', '.join(dm_schema[t])})" for t in list(dm_schema.keys())[:4]
    )
    return f"""Rewrite this SQL problem prompt in DataLemur style.

DataLemur style means:
- 2-4 sentences of business context (who needs this, why they need it)
- Clear statement of what columns the query should return
- Mention any important filter or ordering requirement
- End with: "Write a SQL query to [action]."
- NOT a single-liner. NOT step-by-step instructions. Just enough context for a smart analyst.

Problem id: {p['id']}  company: {p.get('company','')}  difficulty: {p['difficulty']}
Available tables: {tables_summary}
Key columns: {col_summary}
Current prompt: {p.get('prompt','')}
Tags: {', '.join(p.get('tags',[]))}

Return ONLY this JSON:
{{"prompt": "<rewritten prompt, 2-4 sentences>"}}"""


def hints_rewrite_msg(p, dm_schema):
    tables_summary = ', '.join(dm_schema.keys())
    col_summary = '; '.join(
        f"{t}: ({', '.join(dm_schema[t])})" for t in list(dm_schema.keys())[:4]
    )
    solution = p.get('solution', '').replace("\\'", "'").replace("\\n", "\n")
    n_hints = min(len(p.get('hints', [])), {'Easy': 1, 'Medium': 2, 'Hard': 5, 'Master': 5, 'Forensic': 3}.get(p['difficulty'], 2))

    return f"""Generate {n_hints} hint step(s) for this SQL problem.

Each hint step has:
- "text": a conceptual nudge (1-2 sentences). NO answer, NO SQL. Just what to think about.
- "starterCode": partial SQL scaffold that gives structural shape WITHOUT the key SQL construct being tested.
  Rules for starterCode:
  - Use placeholder comments like "-- your window function here", "-- add filter condition", "-- complete the JOIN"
  - NEVER write out the actual key function, operator, or clause that makes this problem non-trivial
    (e.g. if the problem tests LAG(), do not show LAG(); if it tests HAVING, do not write HAVING)
  - Show table names, column names, and overall query structure — just not the logic that IS the answer
  - Hint 1 starterCode: bare skeleton (SELECT, FROM, maybe one CTE stub)
  - Later hints: add more structural context, more placeholder comments, getting user closer to the shape
  - Last hint: near-complete structure with ONE key placeholder still missing

Problem id: {p['id']}  difficulty: {p['difficulty']}
Tables: {tables_summary}
Columns: {col_summary}
Current prompt: {p.get('prompt','')}
Solution (for your reference only — do NOT reveal in hints): {solution[:600]}
Tags: {', '.join(p.get('tags',[]))}

Return ONLY this JSON (array of exactly {n_hints} steps):
{{"hintSteps": [{{"text": "...", "starterCode": "..."}}{', {"text": "...", "starterCode": "..."}' * (n_hints - 1)}]}}"""


# ─── LM Studio call ───────────────────────────────────────────────────────────

def call_lm(user_msg):
    # /no_think prefix on user message disables Qwen3 chain-of-thought mode
    resp = requests.post(
        f"{BASE_URL}/v1/chat/completions",
        json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM},
                {"role": "user",   "content": "/no_think\n\n" + user_msg},
            ],
            "temperature": 0.15,
            "max_tokens": 2000,
        },
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    text = resp.json()["choices"][0]["message"]["content"].strip()
    # Strip Qwen3 thinking block if present
    text = re.sub(r'<think>[\s\S]*?</think>', '', text).strip()
    # Try to extract JSON object
    m = re.search(r'\{[\s\S]*\}', text)
    if not m:
        raise ValueError(f"No JSON in: {text[:300]}")
    raw = m.group()
    # Fix literal newlines inside JSON string values (model sometimes emits them)
    def fix_newlines(s):
        result, in_str, i = [], False, 0
        while i < len(s):
            c = s[i]
            if c == '\\' and in_str:
                result.append(c)
                i += 1
                if i < len(s): result.append(s[i])
                i += 1
                continue
            if c == '"':
                in_str = not in_str
            if in_str and c == '\n':
                result.append('\\n')
            elif in_str and c == '\r':
                result.append('\\r')
            else:
                result.append(c)
            i += 1
        return ''.join(result)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return json.loads(fix_newlines(raw))


# ─── JS file patch ────────────────────────────────────────────────────────────

def js_escape(s):
    """Escape a Python string for insertion into a single-quoted JS string."""
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '')


def patch_problem(content, pid, new_prompt, new_hint_steps):
    """
    Patch one problem's prompt and add hintSteps in the JS source.
    Returns updated content string.
    """
    m = re.search(r"id:\s*'" + re.escape(pid) + r"'", content)
    if not m:
        raise ValueError(f"Problem {pid} not found in JS")
    nxt = re.search(r"\n    id:\s*'sql-", content[m.end():])
    end = m.end() + nxt.start() if nxt else len(content)
    scope = content[m.start():end]

    # 1. Replace prompt
    # Use a quote-aware regex to match only the prompt's own value (handles \' escapes).
    # Previously used `.*?expectedColumns` as anchor — that consumed brokenQuery/brokenOutputNote
    # in Forensic problems where those fields sit between prompt and expectedColumns.
    prompt_m = re.search(r"(prompt:\s*')((?:[^'\\]|\\.)*?)(')", scope)
    if not prompt_m:
        raise ValueError(f"Cannot find prompt field in {pid}")
    escaped_prompt = js_escape(new_prompt)
    scope = scope[:prompt_m.start()] + f"prompt: '{escaped_prompt}'" + scope[prompt_m.end():]

    # 2. Insert hintSteps before hints (or replace existing hintSteps)
    # Build JS array literal
    steps_parts = []
    for step in new_hint_steps:
        text_esc = js_escape(step.get('text', ''))
        code_esc = js_escape(step.get('starterCode', ''))
        if code_esc:
            steps_parts.append(f"{{ text: '{text_esc}', starterCode: '{code_esc}' }}")
        else:
            steps_parts.append(f"{{ text: '{text_esc}' }}")
    steps_js = "[\n      " + ",\n      ".join(steps_parts) + "\n    ]"
    hint_steps_field = f"hintSteps: {steps_js},\n    "

    # Remove existing hintSteps if present
    scope = re.sub(r"hintSteps:\s*\[[\s\S]*?\],\s*\n\s*", '', scope)

    # Insert before hints:
    hints_pos = re.search(r"(\n    hints:\s*\[)", scope)
    if hints_pos:
        scope = scope[:hints_pos.start()] + '\n    ' + hint_steps_field.rstrip('\n    ') + scope[hints_pos.start():]
    else:
        raise ValueError(f"Cannot find hints field in {pid}")

    return content[:m.start()] + scope + content[end:]


# ─── Datamart schema helper ───────────────────────────────────────────────────

def get_dm_schema(dm_id, dm_data):
    tables = dm_data.get(dm_id, {}).get('tables', {})
    return {t: tables[t].get('columns', []) for t in tables}


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    try:
        requests.get(f"{BASE_URL}/v1/models", timeout=5).raise_for_status()
    except Exception as e:
        print(f"ERROR: LM Studio not reachable at {BASE_URL}: {e}")
        sys.exit(1)

    # Load problems + datamarts via temp .mjs (ES module compatible)
    import os, tempfile
    problems_abs = os.path.abspath("src/data/sqlLabProblems.js")
    datamarts_abs = os.path.abspath("src/data/sqlLabDatamarts.js")
    mjs_src = f"""
import {{ sqlLabProblems }} from '{problems_abs}';
import {{ datamarts }} from '{datamarts_abs}';
const dm_out = {{}};
for (const [id, d] of Object.entries(datamarts)) {{
  dm_out[id] = {{ tables: {{}} }};
  for (const [t, td] of Object.entries(d.tables)) {{
    dm_out[id].tables[t] = {{ columns: td.columns.map(c => typeof c === 'string' ? c.split(' ')[0] : c.name) }};
  }}
}}
process.stdout.write(JSON.stringify({{ problems: sqlLabProblems, datamarts: dm_out }}));
"""
    with tempfile.NamedTemporaryFile(suffix='.mjs', mode='w', delete=False) as f:
        f.write(mjs_src)
        tmp_path = f.name
    try:
        result = subprocess.run(['node', tmp_path], capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            print(f"ERROR: node extraction failed:\n{result.stderr}")
            sys.exit(1)
        data = json.loads(result.stdout)
    finally:
        os.unlink(tmp_path)

    problems = data['problems']
    dm_data   = data['datamarts']

    # Read JS file
    with open(JS_PATH) as f:
        content = f.read()

    if ONLY_ID:
        problems = [p for p in problems if p['id'] == ONLY_ID]
        if not problems:
            print(f"Problem {ONLY_ID} not found"); sys.exit(1)

    to_migrate = [p for p in problems if FORCE or not p.get('hintSteps')]
    skip_count = len(problems) - len(to_migrate)
    print(f"Total: {len(problems)}  Already migrated: {skip_count}  To process: {len(to_migrate)}")
    if DRY_RUN:
        print("DRY RUN — no writes\n")

    errors = []
    for i, p in enumerate(to_migrate):
        pid = p['id']
        dm_schema = get_dm_schema(p.get('datamartId', ''), dm_data)

        try:
            # Step 1: rewrite prompt
            prompt_result = call_lm(prompt_rewrite_msg(p, dm_schema))
            new_prompt = prompt_result.get('prompt', '').strip()
            if not new_prompt:
                raise ValueError("Empty prompt returned")

            # Step 2: generate hintSteps
            hints_result = call_lm(hints_rewrite_msg(p, dm_schema))
            new_steps = hints_result.get('hintSteps', [])
            if not new_steps:
                raise ValueError("Empty hintSteps returned")

            print(f"\n[{i+1:3}/{len(to_migrate)}] {pid}")
            print(f"  PROMPT:\n    {new_prompt}")
            for si, step in enumerate(new_steps):
                print(f"  HINT {si+1}: {step.get('text','')}")
                if step.get('starterCode'):
                    code_lines = step['starterCode'].replace('\\n','\n').split('\n')
                    for cl in code_lines:
                        print(f"    | {cl}")
            print()

            if not DRY_RUN:
                content = patch_problem(content, pid, new_prompt, new_steps)

        except Exception as e:
            errors.append(pid)
            print(f"[{i+1:3}/{len(to_migrate)}] {pid}  ERROR: {e}")

        time.sleep(0.1)

    if not DRY_RUN and to_migrate:
        # Verify brace balance before writing
        opens  = content.count('{')
        closes = content.count('}')
        if opens != closes:
            print(f"\nERROR: Brace mismatch ({opens} vs {closes}) — NOT writing file")
            sys.exit(1)
        with open(JS_PATH, 'w') as f:
            f.write(content)
        print(f"\nWrote {JS_PATH}")

    print(f"\nDone. Processed: {len(to_migrate) - len(errors)}  Errors: {len(errors)}")
    if errors:
        print(f"Failed: {', '.join(errors)}")
        print("Re-run to retry failed problems (they have no hintSteps so won't be skipped).")


if __name__ == "__main__":
    main()
