// SQL Content Scanner — objective gate checks from docs/SQL-CONTENT-STANDARD.md
// Deterministic (no LLM). Catches the e86-class defects the LLM judge is blind to.
// Usage: node scripts/sql_content_scan.mjs            (summary + flagged)
//        node scripts/sql_content_scan.mjs --csv      (per-problem CSV to stdout)
import fs from 'fs';

const SRC = new URL('../src/data/sqlLabProblems.js', import.meta.url);
const raw = fs.readFileSync(SRC, 'utf8');
const body = raw.slice(raw.indexOf('['), raw.lastIndexOf('];') + 1);
// eslint-disable-next-line no-eval
const problems = eval(body);

// --- detection rules ------------------------------------------------------
// GATE #2: NON-OBVIOUS technique named in prompt. Word-boundary matched (so
// "percentile" does NOT match "ntile"). Basic clauses (ORDER BY / GROUP BY /
// DISTINCT / HAVING) are NOT techniques — they're output-spec language, allowed.
// Case-insensitive function/pattern names:
const TECH_CI = /\b(percent_rank|row_number|dense_rank|ntile|cume_dist|coalesce|nullif|partition by|rows between|window function|recursive cte|self-join|anti-join|correlated subquery|common table expression)\b/i;
// Uppercase-only tokens (avoid English false positives: leads, ranking, except-the-word):
const TECH_UC = /\b(LAG|LEAD|RANK|CTE|UNION|INTERSECT|EXCEPT|PIVOT)\b/;
function namesTechnique(prompt) {
  const m1 = prompt.match(TECH_CI);
  if (m1) return m1[1].toLowerCase();
  const m2 = prompt.match(TECH_UC);
  return m2 ? m2[1] : null;
}

// GATE #5: filler
const FILLER = /write (a|an) (sql )?query|write an sql/i;

// GATE #7: debrief teaches judgment (wrong-answer-that-runs + catch + follow-up).
// Vocab is broad on purpose: PAL debriefs flag the wrong-answer under many headings
// ("Forensic trap", "Weak answer", "Common mistake", "junior analyst...", etc.).
const RX_WRONG = /wrong answer|forensic trap|weak answer|common (mistake|wrong)|junior analyst|naive|runs and|mistake that runs|looks (right|correct|plausible)|silently|runs but|passes (visual|inspection)|no error (fires|is raised)|\btrap\b/i;
const RX_CATCH = /sanity check|catch it|cross-check|how to catch|verify (that|your)|confirm (that|the|\d|exactly|your)/i;
const RX_FOLLOWUP = /follow-up|interviewer|they ask|would you (change|do|compute|handle)|next question/i;

function normSQL(s) { return (s || '').replace(/--[^\n]*/g, '').replace(/\s+/g, ' ').trim().toLowerCase(); }
function toks(s) { return new Set(normSQL(s).split(/[^a-z0-9_]+/).filter(Boolean)); }
function jac(a, b) { const A = toks(a), B = toks(b); if (!A.size || !B.size) return 0; let i = 0; for (const x of A) if (B.has(x)) i++; return i / (A.size + B.size - i); }

function scan(p) {
  const isForensic = p.difficulty === 'Forensic';
  const flags = [];
  // prompt gates (skip technique/ambiguity-style gates on Forensic — the bug is the point)
  if (!isForensic) {
    const t = namesTechnique(p.prompt || '');
    if (t) flags.push('GATE2_names_technique:' + t);
  }
  if (FILLER.test(p.prompt || '')) flags.push('GATE5_filler');
  // debrief structure (gate 7) — applied to non-Easy where judgment depth is expected
  const d = p.debrief || '';
  const hasWrong = RX_WRONG.test(d), hasCatch = RX_CATCH.test(d), hasFollow = RX_FOLLOWUP.test(d);
  if (!isForensic && p.difficulty !== 'Easy') {
    if (!(hasWrong && hasCatch)) flags.push('GATE7_debrief_no_wronganswer_or_catch');
    if (!hasFollow) flags.push('debrief_no_followup');
  }
  if (d.length < 250) flags.push('debrief_thin(<250)');
  // hint hands solution (gate 6): the FIRST/only hint already gives the whole query,
  // so there is no progression. Multi-step hints whose LAST step nears the answer are
  // by-design (Show Answer is gated behind them). Forensic hints legitimately show the
  // query-under-inspection, so they are exempt.
  const steps = (p.hintSteps || []).map(h => h.starterCode || '').filter(Boolean);
  if (!isForensic && steps.length) {
    if (jac(steps[0], p.solution) >= 0.85) flags.push('GATE6_hint_hands_solution');
  }
  return { id: p.id, difficulty: p.difficulty, forensic: isForensic, flags,
           wrong: hasWrong, catch_: hasCatch, follow: hasFollow };
}

const results = problems.map(scan);

if (process.argv.includes('--csv')) {
  console.log('id,difficulty,forensic,flags');
  results.forEach(r => console.log(`${r.id},${r.difficulty},${r.forensic},"${r.flags.join('; ')}"`));
} else {
  const tally = {};
  results.forEach(r => r.flags.forEach(f => { const k = f.split(':')[0]; tally[k] = (tally[k] || 0) + 1; }));
  const flagged = results.filter(r => r.flags.length);
  console.log(`Scanned ${problems.length} problems. ${flagged.length} have >=1 content flag.\n`);
  console.log('Flag tally:');
  Object.entries(tally).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(`  ${String(n).padStart(3)}  ${k}`));
  console.log('\nGATE failures (block) by problem:');
  flagged.filter(r => r.flags.some(f => f.startsWith('GATE')))
    .forEach(r => console.log(`  ${r.id} [${r.difficulty}] ${r.flags.filter(f => f.startsWith('GATE')).join(', ')}`));
}

// Regression lock: non-zero exit if any GATE failure remains, so this can gate commits.
const gateFails = results.filter(r => r.flags.some(f => f.startsWith('GATE'))).length;
if (gateFails > 0) { console.error(`\nCONTENT GATE FAIL: ${gateFails} problem(s) with a blocking flag.`); process.exit(1); }
