// Deterministic gate for the KEYED rooms — MCQ Trainer + Spot the Flaw.
// No LLM. Tier 1 (block) + Tier 2 (warn). Mirrors EVAL_RUBRICS.md → Archetype B.
//
// Run from repo root:  node scripts/audit_keyed.mjs
// Exit 1 on any Tier 1 failure.

import { pathToFileURL } from 'url';
import { resolve } from 'path';

const base = f => pathToFileURL(resolve(f)).href;
const t1 = [], t2 = [];

// ── MCQ Trainer ──────────────────────────────────────────────────────────────
{
  const { trainerMCQ: arr } = await import(base('src/data/trainerMCQ.js'));
  const ids = [], questions = [];
  for (const m of arr) {
    const tag = `[mcq] ${m.id || '(no id)'}`;
    for (const f of ['id', 'question', 'options', 'explanation']) {
      if (m[f] === undefined || m[f] === null || m[f] === '') t1.push(`${tag}: missing "${f}"`);
    }
    if (!Array.isArray(m.options) || m.options.length < 2) { t1.push(`${tag}: needs >= 2 options`); }
    else {
      const correct = m.options.filter(o => o.correct === true);
      if (correct.length !== 1) t1.push(`${tag}: must have exactly ONE correct option (has ${correct.length})`);
      const oids = m.options.map(o => o.id), otexts = m.options.map(o => (o.text || '').trim());
      if (new Set(oids).size !== oids.length) t1.push(`${tag}: duplicate option ids`);
      if (new Set(otexts).size !== otexts.length) t1.push(`${tag}: duplicate option text`);
      if (m.options.length < 4) t2.push(`${tag}: < 4 options (guess rate high)`);
      // length+position bias: is the correct option the longest?
      const longest = m.options.reduce((a, b) => (b.text || '').length > (a.text || '').length ? b : a);
      if (longest.correct === true) t2.push(`${tag}: correct answer is the longest option (length-bias tell)`);
    }
    if (typeof m.explanation === 'string' && m.explanation.length < 80) t2.push(`${tag}: thin explanation (${m.explanation.length} chars)`);
    if (m.id) ids.push(m.id);
    if (m.question) questions.push(m.question.trim());
  }
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) t1.push(`[mcq] duplicate ids: ${[...new Set(dup)].join(', ')}`);
  const dupQ = questions.filter((x, i) => questions.indexOf(x) !== i);
  if (dupQ.length) t2.push(`[mcq] ${dupQ.length} duplicate question(s)`);
  console.log(`[mcq] ${arr.length} questions checked`);
}

// ── Spot the Flaw ────────────────────────────────────────────────────────────
{
  const { spotTheFlawCases: arr } = await import(base('src/data/spotTheFlawCases.js'));
  const ids = [];
  for (const c of arr) {
    const tag = `[stf] ${c.id || '(no id)'}`;
    for (const f of ['id', 'title', 'flawLabel', 'flaw', 'fix', 'setup', 'question']) {
      if (c[f] === undefined || c[f] === null || c[f] === '') t1.push(`${tag}: missing "${f}"`);
    }
    if (typeof c.setup === 'string' && c.setup.length < 150) t2.push(`${tag}: setup thin (${c.setup.length} chars) — flaw may not be embedded plausibly`);
    if (typeof c.flaw === 'string' && c.flaw.length < 80) t2.push(`${tag}: flaw explanation thin`);
    if (!Array.isArray(c.keyTakeaways) || c.keyTakeaways.length === 0) t2.push(`${tag}: no keyTakeaways`);
    if (c.impact === undefined || c.impact === '') t2.push(`${tag}: no impact stated`);
    if (c.id) ids.push(c.id);
  }
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) t1.push(`[stf] duplicate ids: ${[...new Set(dup)].join(', ')}`);
  console.log(`[stf] ${arr.length} cases checked`);
}

console.log('');
if (t2.length) {
  console.log(`── Tier 2 warnings (${t2.length}) ──`);
  for (const w of t2) console.log('  ⚠ ' + w);
  console.log('');
}
if (t1.length) {
  console.log(`── Tier 1 FAILURES (${t1.length}) — BLOCK COMMIT ──`);
  for (const f of t1) console.log('  ✗ ' + f);
  process.exit(1);
} else {
  console.log('✅ All Tier 1 checks passed' + (t2.length ? ` (${t2.length} Tier 2 warnings above)` : ''));
}
