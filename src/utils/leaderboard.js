// Leaderboard — ranks signed-in users by total problems/modules solved across ALL rooms.
//
// Total is computed directly from saved progress (localStorage), using the SAME per-room
// completion predicate the Progress page uses, so the number matches the Progress total.
// Each user only ever writes their own row (RLS); the board is publicly readable.
//
// SQL schema — run once in the Supabase SQL editor:
//   create table if not exists leaderboard (
//     user_id uuid primary key references auth.users(id) on delete cascade,
//     display_name text not null,
//     total_solved int not null default 0,
//     updated_at timestamptz default now()
//   );
//   alter table leaderboard enable row level security;
//   create policy "Public read leaderboard" on leaderboard for select using (true);
//   create policy "Users upsert own row" on leaderboard
//     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

import { supabase } from './supabase.js';

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
    total_solved: computeTotalSolved(),
    updated_at: new Date().toISOString(),
  };
  const full = { ...base, room_breakdown: computeRoomBreakdown(), ...extra };
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
    total_solved: computeTotalSolved(),
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

// Fetch a single user's public profile row. Tries the richer column set first
// (linkedin_url, room_breakdown); if those columns are absent, retries with the
// base columns. Returns a normalized object, or null on miss / no backend.
export async function fetchPublicProfile(userId) {
  if (!supabase || !userId) return null;
  const RICH = 'user_id, display_name, total_solved, updated_at, linkedin_url, room_breakdown';
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
  };
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
