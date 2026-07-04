// Leaderboard — ranks signed-in users by a DIFFICULTY-WEIGHTED score across ALL rooms.
//
// The ranking value stored in the `total_solved` column is now computeWeightedScore()
// (not a raw count): each solved item is weighted by its difficulty (foundational ×1,
// intermediate ×3, senior ×5, staff ×8) so harder work ranks higher. The raw count is
// still available via computeTotalSolved() for the Progress page's "N items completed".
// The DB column name is unchanged (total_solved) — fetch/upsert plumbing is untouched.
// Each user only ever writes their own row (RLS); the board is publicly readable.
//
// SQL schema — run once in the Supabase SQL editor:
//   create table if not exists leaderboard (
//     user_id uuid primary key references auth.users(id) on delete cascade,
//     display_name text not null,
//     total_solved int not null default 0,  -- now holds the weighted score
//     updated_at timestamptz default now()
//   );
//   alter table leaderboard enable row level security;
//   create policy "Public read leaderboard" on leaderboard for select using (true);
//   create policy "Users upsert own row" on leaderboard
//     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

import { supabase } from './supabase.js';

// ── Difficulty-weighted scoring ──────────────────────────────────────────────
// PAL's leaderboard ranks by a WEIGHTED score, not a raw solved count: harder
// items are worth more, so grinding easy rooms can't out-rank someone clearing
// senior/staff work. Weight tiers (cross-lab-uniform):
//   foundational (junior/beginner/easy) × 1
//   intermediate (analyst/intermediate/medium) × 3
//   senior (senior/advanced/hard) × 5
//   staff (staff/master/forensic) × 8
// A solved item with no/unknown difficulty falls back to the intermediate weight.
//
// The weight for a given solved item is looked up by joining the solved id back to
// its room's data record. Data arrays carry a per-item `difficulty` string; PAL's
// difficulty vocabulary is heterogeneous per room, so DIFF_WEIGHT normalizes all
// known values. If an id isn't found in its data array (or has no difficulty), the
// item still counts at the intermediate weight so the score never silently drops.
const WEIGHT_FALLBACK = 3;
const DIFF_WEIGHT = {
  // × 1 — foundational
  junior: 1, beginner: 1, easy: 1, foundational: 1,
  // × 3 — intermediate
  analyst: 3, intermediate: 3, medium: 3,
  // × 5 — senior
  senior: 5, advanced: 5, hard: 5,
  // × 8 — staff / expert
  staff: 8, master: 8, forensic: 8, expert: 8,
};

function weightOf(difficulty) {
  if (!difficulty) return WEIGHT_FALLBACK;
  return DIFF_WEIGHT[String(difficulty).toLowerCase()] || WEIGHT_FALLBACK;
}

// Build an id -> weight map from a data array of { id, difficulty } records.
function weightMap(arr) {
  const m = {};
  if (Array.isArray(arr)) for (const it of arr) { if (it && it.id != null) m[it.id] = weightOf(it.difficulty); }
  return m;
}

// Room data arrays — the per-item difficulty source for weighting. Imported here
// so a solved id can be joined back to its difficulty. Each array is { id, difficulty }.
import { metricCases } from '../data/metricCases.js';
import { rcaCases } from '../data/rcaCases.js';
import { businessCases } from '../data/businessCases.js';
import { growthAnalyticsCases } from '../data/growthAnalyticsCases.js';
import { biCases } from '../data/biCases.js';
import { spotTheFlawCases } from '../data/spotTheFlawCases.js';
import { instrumentationCases } from '../data/instrumentationCases.js';
import { challengesCases } from '../data/challengesCases.js';
import { estimationProblems } from '../data/estimationProblems.js';
import { behavioralQuestions } from '../data/behavioralQuestions.js';
import { prioritizationScenarios } from '../data/prioritizationScenarios.js';
import { designScenarios } from '../data/designScenarios.js';
import { productDesignScenarios } from '../data/productDesignScenarios.js';
import { fullLoopCases } from '../data/fullLoopCases.js';
import { statsModules } from '../data/statsModules.js';
import { statsFoundationsModules } from '../data/statsFoundationsModules.js';
import { metricsFoundationModules } from '../data/metricsFoundationModules.js';
import { rcaFoundationModules } from '../data/rcaFoundationModules.js';
import { expFoundationModules } from '../data/expFoundationModules.js';
import { sqlLabProblems } from '../data/sqlLabProblems.js';
import { scenarios } from '../data/scenarios.js';

// Weighted per-room descriptor: progress key, the "done" predicate, and the id->weight
// map for that room's items. Mirrors ROOM_COUNTERS exactly (same keys/predicates) but
// adds the weight lookup so each solved item scores by difficulty instead of 1.
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

// Sum difficulty-weighted score for one store: iterate solved ids, add each id's weight.
function scoreKey(key, ok, weights) {
  let raw;
  try { raw = localStorage.getItem(key); } catch { return 0; }
  if (!raw) return 0;
  let val;
  try { val = JSON.parse(raw); } catch { return 0; }
  let sum = 0;
  if (Array.isArray(val)) {
    // Array of solved ids (e.g. sql-lab).
    for (const id of val) sum += (weights[id] || WEIGHT_FALLBACK);
  } else if (val && typeof val === 'object') {
    for (const [id, v] of Object.entries(val)) {
      if (ok && !ok(v)) continue;
      sum += (weights[id] || WEIGHT_FALLBACK);
    }
  }
  return sum;
}

// Difficulty-weighted total across all rooms. This is the value PAL ranks on:
// harder items (senior/staff) are worth more than foundational ones. Product
// Design (dynamic pd-progress-{id} keys) is weighted per its scenario difficulty.
export function computeWeightedScore() {
  let total = 0;
  for (const { key, ok, weights } of WEIGHTED_ROOMS) total += scoreKey(key, ok, weights);
  // Product Design — one key per scenario: pd-progress-{id}
  const pdWeights = weightMap(productDesignScenarios);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PD_PREFIX)) continue;
      let v;
      try { v = JSON.parse(localStorage.getItem(k)); } catch { continue; }
      if (v && v.submittedPhases && Object.keys(v.submittedPhases).length > 0) {
        const id = k.slice(PD_PREFIX.length);
        total += (pdWeights[id] || WEIGHT_FALLBACK);
      }
    }
  } catch {}
  return total;
}

// Per-room progress keys + the predicate that marks one item "done".
// Value in localStorage is either an array of solved ids, or an object keyed by id.
const ROOM_COUNTERS = [
  { key: 'pal-stats-progress-v1',             ok: v => v && v.attempts > 0 },
  { key: 'pal-metrics-progress-v2',           ok: v => v && v.attempts > 0 },
  { key: 'pal-rca-progress-v2',               ok: v => v && v.attempts > 0 },
  { key: 'pal-cases-progress-v2',             ok: v => v && v.attempts > 0 },
  { key: 'exp-lab-progress-v1',               ok: v => v && v.attempts && v.attempts.length > 0 },
  { key: 'pal-design-progress-v1',            ok: v => v && v.submittedPhases && Object.keys(v.submittedPhases).length > 0 },
  { key: 'pal-growth-analytics-progress-v1',  ok: v => v && v.rating },
  { key: 'pal-challenges-progress-v1',        ok: v => v && v.completedAt },
  { key: 'pal-bi-progress-v1',                ok: v => v && v.rating },
  { key: 'pal-stf-progress-v1',               ok: v => v && v.completedAt },
  { key: 'pal-takehome-progress-v1',          ok: v => v && v.completedAt },
  { key: 'pal-instrumentation-progress-v1',   ok: v => v && v.completedAt },
  { key: 'pal-behavioral-progress-v1',        ok: v => v && v.rating },
  { key: 'pal-fullloop-progress-v1',          ok: v => v && v.lastCompletedAt },
  { key: 'pal-estimation-progress-v1',        ok: v => v && v.rating },
  { key: 'pal-stat-foundations-progress-v1',  ok: v => v && v.completedAt },
  { key: 'pal-metrics-foundation-progress-v1',ok: v => v && v.completedAt },
  { key: 'pal-rca-foundation-progress-v1',    ok: v => v && v.completedAt },
  { key: 'pal-exp-foundation-progress-v1',    ok: v => v && v.completedAt },
  { key: 'pal-pri-progress-v1',               ok: v => v && v.completedAt },
  { key: 'pal-sql-lab-solved-v1',             ok: null }, // value is an array of solved ids
];

// Product Design stores one key per scenario: pd-progress-{id}
const PD_PREFIX = 'pd-progress-';

function countKey(key, ok) {
  let raw;
  try { raw = localStorage.getItem(key); } catch { return 0; }
  if (!raw) return 0;
  let val;
  try { val = JSON.parse(raw); } catch { return 0; }
  if (Array.isArray(val)) return val.length;
  if (val && typeof val === 'object') {
    const vals = Object.values(val);
    return ok ? vals.filter(ok).length : vals.length;
  }
  return 0;
}

export function computeTotalSolved() {
  let total = 0;
  for (const { key, ok } of ROOM_COUNTERS) total += countKey(key, ok);
  // Product Design dynamic keys
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PD_PREFIX)) continue;
      let v;
      try { v = JSON.parse(localStorage.getItem(k)); } catch { continue; }
      if (v && v.submittedPhases && Object.keys(v.submittedPhases).length > 0) total += 1;
    }
  } catch {}
  return total;
}

// Display name from OAuth metadata (Google/GitHub); anonymous handle for email-only sign-ins.
export function getDisplayName(user) {
  if (!user) return 'Anonymous';
  const m = user.user_metadata || {};
  const name = m.full_name || m.name || m.user_name || m.preferred_username;
  if (name && String(name).trim()) return String(name).trim().slice(0, 40);
  const tail = (user.id || '').replace(/-/g, '').slice(0, 4).toUpperCase() || 'XXXX';
  return 'Analyst-' + tail;
}

// Per-room solved counts, keyed by a short room id. Mirrors computeTotalSolved()
// but keeps the breakdown so it can be shown on a public profile. Optional — only
// written if the room_breakdown column exists; absence is tolerated.
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

export function computeRoomBreakdown() {
  const breakdown = {};
  for (const { id, key, ok } of ROOM_BREAKDOWN) {
    const n = countKey(key, ok);
    if (n > 0) breakdown[id] = n;
  }
  // Product Design dynamic keys collapse into one bucket.
  let pd = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PD_PREFIX)) continue;
      let v;
      try { v = JSON.parse(localStorage.getItem(k)); } catch { continue; }
      if (v && v.submittedPhases && Object.keys(v.submittedPhases).length > 0) pd += 1;
    }
  } catch {}
  if (pd > 0) breakdown['product-design'] = pd;
  return breakdown;
}

// Upsert the signed-in user's row. Safe no-op if Supabase/auth unavailable.
// Tries to write the optional room_breakdown / linkedin_url columns; if those
// columns are absent (migration not yet run), retries with the base columns only.
export async function upsertLeaderboardRow(user, extra = {}) {
  if (!supabase || !user) return;
  const base = {
    user_id: user.id,
    display_name: getDisplayName(user),
    total_solved: computeWeightedScore(),
    updated_at: new Date().toISOString(),
  };
  const full = {
    ...base,
    room_breakdown: computeRoomBreakdown(),
    avatar_url: user.user_metadata?.avatar_url || null,
    ...extra,
  };
  try {
    const { error } = await supabase.from('leaderboard').upsert(full, { onConflict: 'user_id' });
    if (!error) return;
    // Likely an unknown-column error — retry with base columns only so the
    // leaderboard still updates before the migration runs.
    if (isMissingColumnError(error)) {
      const { error: e2 } = await supabase.from('leaderboard').upsert(base, { onConflict: 'user_id' });
      if (e2) console.warn('[PAL leaderboard] upsert (base) failed:', e2.message);
    } else {
      console.warn('[PAL leaderboard] upsert failed:', error.message);
    }
  } catch (e) {
    console.warn('[PAL leaderboard] upsert threw:', e && e.message);
  }
}

// Bump the signed-in user's last_active_at = now. Public "last seen" signal — call
// it on app activity (the caller throttles). Guarded + graceful: no-op without a
// backend, and silently skips if the column is absent (pre-migration).
export async function touchLastActive(user) {
  if (!supabase || !user) return;
  const now = new Date().toISOString();
  const row = {
    user_id: user.id,
    display_name: getDisplayName(user),
    total_solved: computeWeightedScore(),
    last_active_at: now,
    updated_at: now,
  };
  try {
    const { error } = await supabase.from('leaderboard').upsert(row, { onConflict: 'user_id' });
    if (error && !isMissingColumnError(error)) console.warn('[PAL last-active] upsert failed:', error.message);
  } catch (e) { /* ignore */ }
}

// Heuristic: detect a "column does not exist" / unknown-column error from PostgREST
// so callers can gracefully fall back to the pre-migration schema.
function isMissingColumnError(error) {
  if (!error) return false;
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  // 42703 = undefined_column (Postgres); PGRST204 = column not found in schema cache
  return code === '42703' || code === 'PGRST204'
    || msg.includes('column') && (msg.includes('does not exist') || msg.includes('not found') || msg.includes('schema cache'));
}

// Upsert just the current user's linkedin_url. Returns { ok, reason }.
// If the column doesn't exist yet, returns { ok:false, reason:'migration-pending' }
// instead of throwing, so the caller can fall back to local storage / metadata.
export async function updateMyLinkedin(user, url) {
  if (!supabase || !user) return { ok: false, reason: 'no-backend' };
  const row = {
    user_id: user.id,
    display_name: getDisplayName(user),
    total_solved: computeWeightedScore(),
    linkedin_url: url || null,
    updated_at: new Date().toISOString(),
  };
  try {
    const { error } = await supabase.from('leaderboard').upsert(row, { onConflict: 'user_id' });
    if (!error) return { ok: true };
    if (isMissingColumnError(error)) return { ok: false, reason: 'migration-pending' };
    console.warn('[PAL leaderboard] linkedin upsert failed:', error.message);
    return { ok: false, reason: 'error' };
  } catch (e) {
    console.warn('[PAL leaderboard] linkedin upsert threw:', e && e.message);
    return { ok: false, reason: 'error' };
  }
}

// localStorage fallback keys for employment fields — written alongside any
// server upsert so the value persists across reloads before the migration runs.
const COMPANY_LS_KEY        = 'pal-company-v1';
const ROLE_LS_KEY           = 'pal-role-v1';
const COMPANY_CONFIRMED_KEY = 'pal-company-confirmed-v1';

// Upsert just the current user's employment (current_company, current_role) and
// stamp company_updated_at = now. Returns { ok, reason }. If the columns don't
// exist yet, returns { ok:false, reason:'migration-pending' } instead of throwing,
// so the caller can fall back to local storage. Always writes a localStorage
// fallback regardless of the server result.
export async function updateMyEmployment(user, { company, role } = {}) {
  const now = new Date().toISOString();
  // Always keep a local copy so the value persists across reloads pre-migration.
  try {
    localStorage.setItem(COMPANY_LS_KEY, company || '');
    localStorage.setItem(ROLE_LS_KEY, role || '');
    localStorage.setItem(COMPANY_CONFIRMED_KEY, now);
  } catch { /* ignore */ }

  if (!supabase || !user) return { ok: false, reason: 'no-backend' };
  const row = {
    user_id: user.id,
    display_name: getDisplayName(user),
    total_solved: computeWeightedScore(),
    current_company: company || null,
    current_role: role || null,
    company_updated_at: now,
    updated_at: now,
  };
  try {
    const { error } = await supabase.from('leaderboard').upsert(row, { onConflict: 'user_id' });
    if (!error) return { ok: true };
    if (isMissingColumnError(error)) return { ok: false, reason: 'migration-pending' };
    console.warn('[PAL leaderboard] employment upsert failed:', error.message);
    return { ok: false, reason: 'error' };
  } catch (e) {
    console.warn('[PAL leaderboard] employment upsert threw:', e && e.message);
    return { ok: false, reason: 'error' };
  }
}

// Lightweight confirm — used by the monthly reminder's "Still accurate" button.
// Just bumps company_updated_at = now (and the localStorage confirmed timestamp)
// without touching the company/role values. Returns { ok, reason }; guarded the
// same way as updateMyEmployment.
export async function confirmMyEmployment(user) {
  const now = new Date().toISOString();
  try { localStorage.setItem(COMPANY_CONFIRMED_KEY, now); } catch { /* ignore */ }

  if (!supabase || !user) return { ok: false, reason: 'no-backend' };
  const row = {
    user_id: user.id,
    display_name: getDisplayName(user),
    total_solved: computeWeightedScore(),
    company_updated_at: now,
    updated_at: now,
  };
  try {
    const { error } = await supabase.from('leaderboard').upsert(row, { onConflict: 'user_id' });
    if (!error) return { ok: true };
    if (isMissingColumnError(error)) return { ok: false, reason: 'migration-pending' };
    console.warn('[PAL leaderboard] employment confirm failed:', error.message);
    return { ok: false, reason: 'error' };
  } catch (e) {
    console.warn('[PAL leaderboard] employment confirm threw:', e && e.message);
    return { ok: false, reason: 'error' };
  }
}

// Fetch a single user's public profile row. Tries the richer column set first
// (linkedin_url, room_breakdown, employment); if those columns are absent,
// retries with the base columns. Returns a normalized object, or null on
// miss / no backend.
export async function fetchPublicProfile(userId) {
  if (!supabase || !userId) return null;
  const RICH = 'user_id, display_name, total_solved, updated_at, linkedin_url, room_breakdown, current_company, current_role, company_updated_at, resume_url, avatar_url, last_active_at';
  const BASE = 'user_id, display_name, total_solved, updated_at';

  async function run(cols) {
    return supabase.from('leaderboard').select(cols).eq('user_id', userId).maybeSingle();
  }

  try {
    let { data, error } = await run(RICH);
    if (error && isMissingColumnError(error)) {
      ({ data, error } = await run(BASE));
    }
    if (error) { console.warn('[PAL profile] fetch failed:', error.message); return null; }
    if (!data) return null;
    return normalizeProfile(data);
  } catch (e) {
    console.warn('[PAL profile] fetch threw:', e && e.message);
    return null;
  }
}

function normalizeProfile(row) {
  let breakdown = null;
  const rb = row.room_breakdown;
  if (rb && typeof rb === 'object') {
    breakdown = rb;
  } else if (typeof rb === 'string') {
    try { breakdown = JSON.parse(rb); } catch { breakdown = null; }
  }
  return {
    user_id: row.user_id,
    display_name: row.display_name || 'Analyst',
    total_solved: row.total_solved || 0,
    updated_at: row.updated_at || null,
    linkedin_url: row.linkedin_url || null,
    room_breakdown: breakdown,
    current_company: row.current_company || null,
    current_role: row.current_role || null,
    company_updated_at: row.company_updated_at || null,
    resume_url: row.resume_url || null,
    avatar_url: row.avatar_url || null,
    last_active_at: row.last_active_at || null,
  };
}

// Fetch aggregate stats across all leaderboard users for peer benchmarking.
// Returns { count, avgTotal, avgSql, sqlCounts, totalCounts } or null on failure.
export async function fetchLeaderboardAgg() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('total_solved, room_breakdown');
    if (error || !data || data.length === 0) return null;
    const sqlCounts = data.map(function(r) {
      var rb = r.room_breakdown;
      if (!rb) return 0;
      var parsed = typeof rb === 'string' ? JSON.parse(rb) : rb;
      return parsed['sql-lab'] || 0;
    });
    const totalCounts = data.map(function(r) { return r.total_solved || 0; });
    const count = data.length;
    const avgTotal = Math.round(totalCounts.reduce(function(a, b) { return a + b; }, 0) / count);
    const avgSql = Math.round(sqlCounts.reduce(function(a, b) { return a + b; }, 0) / count);
    return { count, avgTotal, avgSql, sqlCounts, totalCounts };
  } catch (e) {
    console.warn('[PAL leaderboard] agg fetch threw:', e && e.message);
    return null;
  }
}

// Fetch the top N rows, ranked by total_solved desc.
export async function fetchLeaderboard(limit = 100) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('user_id, display_name, total_solved')
      .order('total_solved', { ascending: false })
      .order('updated_at', { ascending: true })
      .limit(limit);
    if (error) { console.warn('[PAL leaderboard] fetch failed:', error.message); return null; }
    return data || [];
  } catch (e) {
    console.warn('[PAL leaderboard] fetch threw:', e && e.message);
    return null;
  }
}
