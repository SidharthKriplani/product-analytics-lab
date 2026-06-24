// Deterministic Foundations gate — Tier 1 (block) + Tier 2 (warn).
// No LLM, no tokens, fully reliable. Mirrors docs/EVAL_RUBRICS.md → Foundation rooms.
//
// Run from repo root:  node scripts/audit_foundations.mjs
// Exit 1 if any Tier 1 check fails (block commit). Tier 2 warnings print but don't block.
//
// Note: Foundations checks-for-understanding live in the runner components, not the
// module data — so this gate covers schema, calibration, and content substance only.
// The semantic Tier 3 (is the teaching actually good?) is scripts/triage_foundations.py
// (local LLM) + human review.

import { pathToFileURL } from 'url';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const ROOMS = [
  { key: 'stats',   file: 'src/data/statsFoundationsModules.js',   exp: 'statsFoundationsModules',   progressKey: 'pal-stat-foundations-progress-v1' },
  { key: 'exp',     file: 'src/data/expFoundationModules.js',      exp: 'expFoundationModules',      progressKey: 'pal-exp-foundation-progress-v1' },
  { key: 'metrics', file: 'src/data/metricsFoundationModules.js',  exp: 'metricsFoundationModules',  progressKey: 'pal-metrics-foundation-progress-v1' },
  { key: 'rca',     file: 'src/data/rcaFoundationModules.js',      exp: 'rcaFoundationModules',      progressKey: 'pal-rca-foundation-progress-v1' },
];

const REQUIRED = ['id', 'index', 'title', 'subtitle', 'difficulty', 'isFree', 'estimatedMin', 'tags', 'keyInsight', 'connection'];
const DIFFICULTIES = new Set(['Beginner', 'Intermediate', 'Advanced']);

// Tier 2 thresholds
const EST_MIN = 4, EST_MAX = 12;   // 11-12 min is legitimate for Advanced modules
const KEYINSIGHT_MIN = 240;   // substance
const CONNECTION_MIN = 80;
const SUBTITLE_MIN = 15;
const TAGS_MIN = 2;

const t1 = [];   // blocking failures
const t2 = [];   // warnings

let syncText = '';
try { syncText = readFileSync(resolve('src/utils/syncProgress.js'), 'utf8'); }
catch { t1.push('syncProgress.js not readable — cannot verify progress-key registration'); }

for (const room of ROOMS) {
  let arr;
  try {
    const mod = await import(pathToFileURL(resolve(room.file)).href);
    arr = mod[room.exp];
  } catch (e) {
    t1.push(`[${room.key}] failed to import ${room.file}: ${e.message}`);
    continue;
  }
  if (!Array.isArray(arr)) { t1.push(`[${room.key}] export ${room.exp} is not an array`); continue; }

  // Tier 1 — progress key registered (completion won't sync/leaderboard otherwise)
  if (syncText && !syncText.includes(`'${room.progressKey}'`)) {
    t1.push(`[${room.key}] progress key ${room.progressKey} not registered in syncProgress.js PROGRESS_KEYS`);
  }

  const ids = [], indices = [];
  arr.forEach((m, i) => {
    const tag = `[${room.key}] ${m.id || '(no id, pos ' + i + ')'}`;
    // T1 required fields
    for (const f of REQUIRED) {
      if (m[f] === undefined || m[f] === null || m[f] === '') t1.push(`${tag}: missing required field "${f}"`);
    }
    // T1 typed checks
    if (m.difficulty !== undefined && !DIFFICULTIES.has(m.difficulty)) t1.push(`${tag}: difficulty "${m.difficulty}" not in {Beginner, Intermediate, Advanced}`);
    if (m.estimatedMin !== undefined && (typeof m.estimatedMin !== 'number' || m.estimatedMin <= 0)) t1.push(`${tag}: estimatedMin not a positive number`);
    if (m.isFree !== undefined && typeof m.isFree !== 'boolean') t1.push(`${tag}: isFree not a boolean`);
    if (m.tags !== undefined && (!Array.isArray(m.tags) || m.tags.length === 0)) t1.push(`${tag}: tags must be a non-empty array`);
    if (m.id !== undefined) ids.push(m.id);
    if (typeof m.index === 'number') indices.push(m.index);

    // T2 substance / calibration
    if (typeof m.estimatedMin === 'number' && (m.estimatedMin < EST_MIN || m.estimatedMin > EST_MAX)) t2.push(`${tag}: estimatedMin ${m.estimatedMin} outside ${EST_MIN}-${EST_MAX}`);
    if (typeof m.keyInsight === 'string' && m.keyInsight.length < KEYINSIGHT_MIN) t2.push(`${tag}: keyInsight thin (${m.keyInsight.length} < ${KEYINSIGHT_MIN} chars)`);
    if (typeof m.connection === 'string' && m.connection.length < CONNECTION_MIN) t2.push(`${tag}: connection thin (${m.connection.length} < ${CONNECTION_MIN} chars)`);
    if (typeof m.subtitle === 'string' && m.subtitle.length < SUBTITLE_MIN) t2.push(`${tag}: subtitle very short`);
    if (Array.isArray(m.tags) && m.tags.length < TAGS_MIN) t2.push(`${tag}: < ${TAGS_MIN} tags`);
    if (m.playbookLinks === undefined) t2.push(`${tag}: no playbookLinks (recommended cross-link)`);
  });

  // T1 unique ids
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) t1.push(`[${room.key}] duplicate ids: ${[...new Set(dup)].join(', ')}`);

  // T1 contiguous index 1..n
  const sorted = [...indices].sort((a, b) => a - b);
  const contiguous = sorted.length === arr.length && sorted[0] === 1 && sorted.every((v, i) => v === i + 1);
  if (!contiguous) t1.push(`[${room.key}] index not contiguous 1..${arr.length}: [${indices.join(', ')}]`);

  console.log(`[${room.key}] ${arr.length} modules · difficulties OK · index ${contiguous ? 'contiguous' : 'BROKEN'}`);
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
