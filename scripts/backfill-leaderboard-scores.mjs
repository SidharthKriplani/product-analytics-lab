// backfill-leaderboard-scores.mjs
//
// One-time (or occasional) server-side recompute of every user's leaderboard
// row using the CURRENT difficulty-weighted formula in src/utils/leaderboard.js.
//
// WHY THIS EXISTS
// ----------------
// utils/leaderboard.js's upsertLeaderboardRow() recomputes and writes a user's
// score only when THEIR OWN browser calls it (sign-in, periodic sync, an SQL
// Lab solve, or — after this session's fix — a Progress-page reset). Row-level
// security means the browser can only ever write its own row. So a user who
// hasn't opened the app since the scoring formula last changed (or since the
// sync-race bugs fixed this session) is stuck showing a stale score — visible
// in the field as e.g. Saswat Panigrahi's "Score" exactly equalling his raw
// "Solved" count, which is only possible if his row predates weighting.
//
// This script bypasses RLS with the Supabase SERVICE ROLE key (server-only —
// never expose this key to a browser) and recomputes every user's score from
// their already-synced `user_progress` rows (the same data pushProgressToSupabase
// pushes from their browser's localStorage), using logic mirrored line-for-line
// from utils/leaderboard.js. Keep the WEIGHTED_ROOMS / ROOM_BREAKDOWN / DIFF_WEIGHT
// blocks below in sync with that file if the formula changes again.
//
// USAGE
// -----
//   cd labs/product-analytics-lab
//   SUPABASE_URL=https://xxxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
//   node scripts/backfill-leaderboard-scores.mjs --dry-run   # preview only
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-leaderboard-scores.mjs
//                                                             # actually writes
//
// Get SUPABASE_SERVICE_ROLE_KEY from Supabase dashboard → Project Settings →
// API → service_role (NOT the anon key — that one is RLS-restricted and can't
// write other users' rows). Never commit this key or put it in a client bundle.
//
// LIMITATION: a user only gets recomputed if they have at least one row in
// `user_progress` (i.e. they've synced at least once from a signed-in browser).
// A leaderboard row with no matching user_progress data is left untouched and
// logged as skipped — there's no server-side copy of their raw progress to
// recompute from.

import { createClient } from '@supabase/supabase-js';

// ── Room data (id -> difficulty), mirrored from utils/leaderboard.js imports ──
import { metricCases } from '../src/data/metricCases.js';
import { rcaCases } from '../src/data/rcaCases.js';
import { businessCases } from '../src/data/businessCases.js';
import { growthAnalyticsCases } from '../src/data/growthAnalyticsCases.js';
import { biCases } from '../src/data/biCases.js';
import { spotTheFlawCases } from '../src/data/spotTheFlawCases.js';
import { instrumentationCases } from '../src/data/instrumentationCases.js';
import { challengesCases } from '../src/data/challengesCases.js';
import { estimationProblems } from '../src/data/estimationProblems.js';
import { behavioralQuestions } from '../src/data/behavioralQuestions.js';
import { prioritizationScenarios } from '../src/data/prioritizationScenarios.js';
import { designScenarios } from '../src/data/designScenarios.js';
import { productDesignScenarios } from '../src/data/productDesignScenarios.js';
import { fullLoopCases } from '../src/data/fullLoopCases.js';
import { statsModules } from '../src/data/statsModules.js';
import { statsFoundationsModules } from '../src/data/statsFoundationsModules.js';
import { metricsFoundationModules } from '../src/data/metricsFoundationModules.js';
import { rcaFoundationModules } from '../src/data/rcaFoundationModules.js';
import { expFoundationModules } from '../src/data/expFoundationModules.js';
import { sqlLabProblems } from '../src/data/sqlLabProblems.js';
import { scenarios } from '../src/data/scenarios.js';

// ── Difficulty weights (mirror utils/leaderboard.js — keep in sync) ──────────
const WEIGHT_FALLBACK = 3;
const DIFF_WEIGHT = {
  junior: 1, beginner: 1, easy: 1, foundational: 1,
  analyst: 3, intermediate: 3, medium: 3,
  senior: 5, advanced: 5, hard: 5,
  staff: 8, master: 8, forensic: 8, expert: 8,
};
function weightOf(difficulty) {
  if (!difficulty) return WEIGHT_FALLBACK;
  return DIFF_WEIGHT[String(difficulty).toLowerCase()] || WEIGHT_FALLBACK;
}
function weightMap(arr) {
  const m = {};
  if (Array.isArray(arr)) for (const it of arr) { if (it && it.id != null) m[it.id] = weightOf(it.difficulty); }
  return m;
}

const WEIGHTED_ROOMS = [
  { key: 'pal-stats-progress-v1',              ok: v => v && v.attempts > 0,                                         weights: weightMap(statsModules) },
  { key: 'pal-metrics-progress-v2',            ok: v => v && v.attempts > 0,                                         weights: weightMap(metricCases) },
  { key: 'pal-rca-progress-v2',                ok: v => v && v.attempts > 0,                                         weights: weightMap(rcaCases) },
  { key: 'pal-cases-progress-v2',              ok: v => v && v.attempts > 0,                                         weights: weightMap(businessCases) },
  { key: 'exp-lab-progress-v1',                ok: v => v && v.attempts && v.attempts.length > 0,                    weights: weightMap(scenarios) },
  { key: 'pal-design-progress-v1',             ok: v => v && v.submittedPhases && Object.keys(v.submittedPhases).length > 0, weights: weightMap(designScenarios) },
  { key: 'pal-growth-analytics-progress-v1',   ok: v => v && v.rating,                                               weights: weightMap(growthAnalyticsCases) },
  { key: 'pal-challenges-progress-v1',         ok: v => v && v.completedAt,                                          weights: weightMap(challengesCases) },
  { key: 'pal-bi-progress-v1',                 ok: v => v && v.rating,                                               weights: weightMap(biCases) },
  { key: 'pal-stf-progress-v1',                ok: v => v && v.completedAt,                                          weights: weightMap(spotTheFlawCases) },
  { key: 'pal-instrumentation-progress-v1',    ok: v => v && v.completedAt,                                          weights: weightMap(instrumentationCases) },
  { key: 'pal-behavioral-progress-v1',         ok: v => v && v.rating,                                               weights: weightMap(behavioralQuestions) },
  { key: 'pal-fullloop-progress-v1',           ok: v => v && v.lastCompletedAt,                                      weights: weightMap(fullLoopCases) },
  { key: 'pal-estimation-progress-v1',         ok: v => v && v.rating,                                               weights: weightMap(estimationProblems) },
  { key: 'pal-stat-foundations-progress-v1',   ok: v => v && v.completedAt,                                          weights: weightMap(statsFoundationsModules) },
  { key: 'pal-metrics-foundation-progress-v1', ok: v => v && v.completedAt,                                          weights: weightMap(metricsFoundationModules) },
  { key: 'pal-rca-foundation-progress-v1',     ok: v => v && v.completedAt,                                          weights: weightMap(rcaFoundationModules) },
  { key: 'pal-exp-foundation-progress-v1',     ok: v => v && v.completedAt,                                          weights: weightMap(expFoundationModules) },
  { key: 'pal-pri-progress-v1',                ok: v => v && v.completedAt,                                          weights: weightMap(prioritizationScenarios) },
  { key: 'pal-sql-lab-solved-v1',              ok: null,                                                             weights: weightMap(sqlLabProblems) },
];

const ROOM_BREAKDOWN = [
  { id: 'stats',           key: 'pal-stats-progress-v1',             ok: v => v && v.attempts > 0 },
  { id: 'metrics',         key: 'pal-metrics-progress-v2',           ok: v => v && v.attempts > 0 },
  { id: 'rca',             key: 'pal-rca-progress-v2',               ok: v => v && v.attempts > 0 },
  { id: 'cases',           key: 'pal-cases-progress-v2',             ok: v => v && v.attempts > 0 },
  { id: 'review',          key: 'exp-lab-progress-v1',               ok: v => v && v.attempts && v.attempts.length > 0 },
  { id: 'growth',          key: 'pal-growth-analytics-progress-v1',  ok: v => v && v.rating },
  { id: 'challenges',      key: 'pal-challenges-progress-v1',        ok: v => v && v.completedAt },
  { id: 'bi',              key: 'pal-bi-progress-v1',                ok: v => v && v.rating },
  { id: 'spot-the-flaw',   key: 'pal-stf-progress-v1',               ok: v => v && v.completedAt },
  { id: 'take-home',       key: 'pal-takehome-progress-v1',          ok: v => v && v.completedAt },
  { id: 'instrumentation', key: 'pal-instrumentation-progress-v1',   ok: v => v && v.completedAt },
  { id: 'behavioral',      key: 'pal-behavioral-progress-v1',        ok: v => v && v.rating },
  { id: 'full-loop',       key: 'pal-fullloop-progress-v1',          ok: v => v && v.lastCompletedAt },
  { id: 'estimation',      key: 'pal-estimation-progress-v1',        ok: v => v && v.rating },
  { id: 'stats-foundations',   key: 'pal-stat-foundations-progress-v1',  ok: v => v && v.completedAt },
  { id: 'metrics-foundations', key: 'pal-metrics-foundation-progress-v1',ok: v => v && v.completedAt },
  { id: 'rca-foundations',     key: 'pal-rca-foundation-progress-v1',    ok: v => v && v.completedAt },
  { id: 'exp-foundations',     key: 'pal-exp-foundation-progress-v1',    ok: v => v && v.completedAt },
  { id: 'prioritization',  key: 'pal-pri-progress-v1',               ok: v => v && v.completedAt },
  { id: 'sql-lab',         key: 'pal-sql-lab-solved-v1',             ok: null },
];

const PD_PREFIX = 'pd-progress-';
const pdWeights = weightMap(productDesignScenarios);

// ── Server-side mirrors of scoreKey/countKey/computeWeightedScore/computeRoomBreakdown,
//    reading from a plain { key: value } object (this user's user_progress rows)
//    instead of the browser's localStorage. ──────────────────────────────────
function scoreKey(store, key, ok, weights) {
  const val = store[key];
  if (val == null) return 0;
  let sum = 0;
  if (Array.isArray(val)) {
    for (const id of val) sum += (weights[id] || WEIGHT_FALLBACK);
  } else if (typeof val === 'object') {
    for (const [id, v] of Object.entries(val)) {
      if (ok && !ok(v)) continue;
      sum += (weights[id] || WEIGHT_FALLBACK);
    }
  }
  return sum;
}

function countKey(store, key, ok) {
  const val = store[key];
  if (val == null) return 0;
  if (Array.isArray(val)) return val.length;
  if (typeof val === 'object') {
    const vals = Object.values(val);
    return ok ? vals.filter(ok).length : vals.length;
  }
  return 0;
}

function computeWeightedScore(store) {
  let total = 0;
  for (const { key, ok, weights } of WEIGHTED_ROOMS) total += scoreKey(store, key, ok, weights);
  for (const k of Object.keys(store)) {
    if (!k.startsWith(PD_PREFIX)) continue;
    const v = store[k];
    if (v && v.submittedPhases && Object.keys(v.submittedPhases).length > 0) {
      const id = k.slice(PD_PREFIX.length);
      total += (pdWeights[id] || WEIGHT_FALLBACK);
    }
  }
  return total;
}

function computeRoomBreakdown(store) {
  const breakdown = {};
  for (const { id, key, ok } of ROOM_BREAKDOWN) {
    const n = countKey(store, key, ok);
    if (n > 0) breakdown[id] = n;
  }
  let pd = 0;
  for (const k of Object.keys(store)) {
    if (!k.startsWith(PD_PREFIX)) continue;
    const v = store[k];
    if (v && v.submittedPhases && Object.keys(v.submittedPhases).length > 0) pd += 1;
  }
  if (pd > 0) breakdown['product-design'] = pd;
  return breakdown;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars (service_role key, from Supabase dashboard > Project Settings > API). Aborting.');
    process.exit(1);
  }
  const supabase = createClient(url, key);

  console.log(dryRun ? 'DRY RUN — no writes will be made.\n' : 'LIVE RUN — leaderboard rows will be updated.\n');

  // Pull every synced progress row, grouped by user_id.
  const { data: progressRows, error: progErr } = await supabase
    .from('user_progress')
    .select('user_id, key, value');
  if (progErr) { console.error('Failed to fetch user_progress:', progErr.message); process.exit(1); }

  const byUser = new Map();
  for (const row of progressRows || []) {
    if (!byUser.has(row.user_id)) byUser.set(row.user_id, {});
    byUser.get(row.user_id)[row.key] = row.value;
  }

  // Existing leaderboard rows, so we only overwrite total_solved/room_breakdown/
  // updated_at and leave display_name/avatar_url/employment/etc. untouched.
  const { data: existingRows, error: lbErr } = await supabase
    .from('leaderboard')
    .select('user_id, display_name, total_solved');
  if (lbErr) { console.error('Failed to fetch leaderboard:', lbErr.message); process.exit(1); }
  const existingByUser = new Map((existingRows || []).map(r => [r.user_id, r]));

  console.log(`${byUser.size} user(s) have synced progress. ${existingByUser.size} existing leaderboard row(s).\n`);

  const results = [];
  for (const [userId, store] of byUser.entries()) {
    const newScore = computeWeightedScore(store);
    const newBreakdown = computeRoomBreakdown(store);
    const existing = existingByUser.get(userId);
    const oldScore = existing ? existing.total_solved : null;
    results.push({ userId, name: existing?.display_name || '(no leaderboard row yet)', oldScore, newScore, changed: oldScore !== newScore });

    if (!dryRun) {
      const { error } = await supabase.from('leaderboard').upsert({
        user_id: userId,
        display_name: existing?.display_name || 'Analyst-' + userId.replace(/-/g, '').slice(0, 4).toUpperCase(),
        total_solved: newScore,
        room_breakdown: newBreakdown,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (error) console.warn(`  ! upsert failed for ${userId}:`, error.message);
    }
  }

  // Report
  results.sort((a, b) => b.newScore - a.newScore);
  console.log('user_id'.padEnd(38), 'name'.padEnd(24), 'old'.padStart(6), 'new'.padStart(6), 'delta');
  for (const r of results) {
    const delta = r.oldScore == null ? 'NEW' : (r.newScore - r.oldScore >= 0 ? '+' : '') + (r.newScore - r.oldScore);
    console.log(r.userId.padEnd(38), (r.name || '').slice(0, 24).padEnd(24), String(r.oldScore ?? '-').padStart(6), String(r.newScore).padStart(6), delta);
  }

  const skipped = [...existingByUser.keys()].filter(id => !byUser.has(id));
  if (skipped.length > 0) {
    console.log(`\nSkipped ${skipped.length} leaderboard row(s) with no user_progress data (never synced from a signed-in browser) — left untouched:`);
    for (const id of skipped) console.log('  ', id, existingByUser.get(id)?.display_name);
  }

  console.log(dryRun ? '\nDry run complete — nothing written. Re-run without --dry-run to apply.' : '\nDone — leaderboard rows updated.');
}

main().catch(e => { console.error(e); process.exit(1); });
