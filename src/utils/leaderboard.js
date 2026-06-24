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

// Upsert the signed-in user's row. Safe no-op if Supabase/auth unavailable.
export async function upsertLeaderboardRow(user) {
  if (!supabase || !user) return;
  const row = {
    user_id: user.id,
    display_name: getDisplayName(user),
    total_solved: computeTotalSolved(),
    updated_at: new Date().toISOString(),
  };
  try {
    const { error } = await supabase.from('leaderboard').upsert(row, { onConflict: 'user_id' });
    if (error) console.warn('[PAL leaderboard] upsert failed:', error.message);
  } catch (e) {
    console.warn('[PAL leaderboard] upsert threw:', e && e.message);
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
