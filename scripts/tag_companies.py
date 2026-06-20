#!/usr/bin/env python3
"""
LLM-assisted company tagging for PAL SQL Lab problems.

For each problem, asks Qwen3 which other companies from our 69-company bank
would plausibly ask this type of SQL question. Writes alsoAskedAt: [...] to
every problem (empty array if no good matches).

Run from product-analytics-lab/ directory:
    python3 scripts/tag_companies.py

Flags:
  --dry-run     print changes without writing
  --id sql-e01  process only one problem (for testing)
  --force       reprocess even if alsoAskedAt already present
"""

import json, re, subprocess, sys, time, requests, os, tempfile

BASE_URL = "http://127.0.0.1:1234"
MODEL    = "qwen/qwen3-8b"
TIMEOUT  = 90
JS_PATH  = "src/data/sqlLabProblems.js"

DRY_RUN = '--dry-run' in sys.argv
FORCE   = '--force'   in sys.argv
ONLY_ID = None
for i, arg in enumerate(sys.argv):
    if arg == '--id' and i + 1 < len(sys.argv):
        ONLY_ID = sys.argv[i + 1]

SYSTEM = """You are a content tagger for a SQL interview prep platform.
You output valid JSON only. No markdown, no explanation outside the JSON.
Be conservative — only tag a company if the problem domain and SQL pattern genuinely fit their business model."""


def tagging_msg(p, all_companies):
    primary = p.get('company', '')
    candidates = [c for c in all_companies if c != primary]
    return f"""This SQL problem is from {primary}.

Title: {p.get('title', '')}
Difficulty: {p.get('difficulty', '')}
Tags: {', '.join(p.get('tags', []))}
Prompt (first 300 chars): {p.get('prompt', '')[:300]}

From the list below, choose 0-3 companies (besides {primary}) that would PLAUSIBLY ask this exact type of SQL question in their data analytics interviews.

Rules:
- Only include a company if this problem domain genuinely fits their business (e.g. don't tag a healthcare query to a gaming company)
- Be conservative — 0 or 1 company is fine; don't force 3
- Do NOT include {primary}

Companies: {', '.join(candidates)}

Return ONLY this JSON:
{{"alsoAskedAt": ["Company A", "Company B"]}}
If no other companies fit, return: {{"alsoAskedAt": []}}"""


# ─── LM Studio call ───────────────────────────────────────────────────────────

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
            "max_tokens": 200,
        },
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    text = resp.json()["choices"][0]["message"]["content"].strip()
    text = re.sub(r'<think>[\s\S]*?</think>', '', text).strip()
    m = re.search(r'\{[\s\S]*\}', text)
    if not m:
        raise ValueError(f"No JSON in: {text[:200]}")
    return json.loads(m.group())


# ─── JS file patch ────────────────────────────────────────────────────────────

def patch_alsoskedat(content, pid, companies):
    """Insert/replace alsoAskedAt field after companyDomain in the problem scope."""
    m = re.search(r"id:\s*'" + re.escape(pid) + r"'", content)
    if not m:
        raise ValueError(f"Problem {pid} not found in JS")
    nxt = re.search(r"\n    id:\s*'sql-", content[m.end():])
    end = m.end() + nxt.start() if nxt else len(content)
    scope = content[m.start():end]

    # Build JS value
    companies_js = ', '.join(f"'{c}'" for c in companies)
    field_line = f"    alsoAskedAt: [{companies_js}],\n"

    # Remove existing alsoAskedAt if present
    scope = re.sub(r"    alsoAskedAt:.*?\n", '', scope)

    # Insert after companyDomain line (or after company line if no companyDomain)
    anchor = re.search(r"    companyDomain:.*?\n", scope)
    if not anchor:
        anchor = re.search(r"    company:.*?\n", scope)
    if not anchor:
        raise ValueError(f"Cannot find company/companyDomain in {pid}")

    scope = scope[:anchor.end()] + field_line + scope[anchor.end():]
    return content[:m.start()] + scope + content[end:]


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    try:
        requests.get(f"{BASE_URL}/v1/models", timeout=5).raise_for_status()
    except Exception as e:
        print(f"ERROR: LM Studio not reachable at {BASE_URL}: {e}")
        sys.exit(1)

    # Load problems via temp .mjs
    problems_abs = os.path.abspath(JS_PATH)
    mjs_src = f"""
import {{ sqlLabProblems }} from '{problems_abs}';
process.stdout.write(JSON.stringify(sqlLabProblems));
"""
    with tempfile.NamedTemporaryFile(suffix='.mjs', mode='w', delete=False) as f:
        f.write(mjs_src)
        tmp_path = f.name
    try:
        result = subprocess.run(['node', tmp_path], capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            print(f"ERROR: node extraction failed:\n{result.stderr}")
            sys.exit(1)
        problems = json.loads(result.stdout)
    finally:
        os.unlink(tmp_path)

    # Build company list from all primary companies
    all_companies = sorted(set(p['company'] for p in problems if p.get('company')))
    print(f"Company pool: {len(all_companies)} companies")

    with open(JS_PATH) as f:
        content = f.read()

    if ONLY_ID:
        problems = [p for p in problems if p['id'] == ONLY_ID]
        if not problems:
            print(f"Problem {ONLY_ID} not found"); sys.exit(1)

    to_tag = [p for p in problems if FORCE or 'alsoAskedAt' not in p]
    skip_count = len(problems) - len(to_tag)
    print(f"Total: {len(problems)}  Already tagged: {skip_count}  To process: {len(to_tag)}")
    if DRY_RUN:
        print("DRY RUN — no writes\n")

    errors = []
    for i, p in enumerate(to_tag):
        pid = p['id']
        try:
            result = call_lm(tagging_msg(p, all_companies))
            also = result.get('alsoAskedAt', [])
            # Validate — only keep companies in our pool and not the primary
            also = [c for c in also if c in all_companies and c != p.get('company')]
            also = also[:3]  # cap at 3

            print(f"[{i+1:3}/{len(to_tag)}] {pid:20s}  {p.get('company',''):25s}  → {also}")

            if not DRY_RUN:
                content = patch_alsoskedat(content, pid, also)

        except Exception as e:
            errors.append(pid)
            print(f"[{i+1:3}/{len(to_tag)}] {pid}  ERROR: {e}")

        time.sleep(0.05)

    if not DRY_RUN and to_tag:
        opens  = content.count('{')
        closes = content.count('}')
        if opens != closes:
            print(f"\nERROR: Brace mismatch ({opens} vs {closes}) — NOT writing file")
            sys.exit(1)
        with open(JS_PATH, 'w') as f:
            f.write(content)
        print(f"\nWrote {JS_PATH}")

    print(f"\nDone. Processed: {len(to_tag) - len(errors)}  Errors: {len(errors)}")
    if errors:
        print(f"Failed: {', '.join(errors)}")
        print("Re-run to retry (failed problems have no alsoAskedAt so won't be skipped).")


if __name__ == "__main__":
    main()
