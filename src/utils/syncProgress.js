import { supabase } from './supabase.js';

// ─── Static keys ─────────────────────────────────────────────────────────────
// Every pal-* key that should sync across devices.
// Keep this list in sync with the KEY / STORAGE_KEY constants in src/utils/*.js.
// When a new room is added, add its localStorage key here.

export const PROGRESS_KEYS = [
  // Core room progress
  'pal-stat-foundations-progress-v1',
  'pal-stats-progress-v1',
  'pal-exp-foundation-progress-v1',
  'pal-rca-foundation-progress-v1',
  'pal-metrics-foundation-progress-v1',
  'pal-metrics-progress-v2',
  'pal-rca-progress-v2',
  'pal-cases-progress-v2',
  'pal-design-progress-v1',
  'pal-growth-analytics-progress-v1',
  'pal-bi-progress-v1',
  'pal-instrumentation-progress-v1',
  'pal-behavioral-progress-v1',
  'pal-estimation-progress-v1',
  'pal-challenges-progress-v1',
  'pal-stf-progress-v1',
  'pal-takehome-progress-v1',
  'pal-code-progress-v1',
  'pal-pri-progress-v1',

  // SQL Lab
  'pal-sql-lab-solved-v1',
  'pal-sql-lab-times-v1',
  'pal-sql-lab-dates-v1',
  'pal-sql-lab-plan-v1',

  // Learning paths (4 fixed paths)
  'pal-lp-analytics-ready-v1',
  'pal-lp-metrics-mastery-v1',
  'pal-lp-sql-track-v1',
  'pal-lp-pm-track-v1',

  // Bookmarks + notes
  'pal-bookmarks-v1',
  'pal-notes-v1',

  // Tools
  'pal-sim-history-v1',
  'pal-trainer-scores-v1',
  'pal-defense-plan-v1',

  // Access
  'pal-access-code-v1',
];

// ─── Dynamic key prefixes ─────────────────────────────────────────────────────
// Product Design uses one key per scenario: pd-progress-{scenarioId}
// We scan localStorage at push time rather than maintaining a static list.
const DYNAMIC_PREFIXES = ['pd-progress-'];

// ─── Push: localStorage → Supabase ───────────────────────────────────────────

export async function pushProgressToSupabase(user) {
  if (!supabase || !user) return;

  const rows = [];

  // Static keys
  for (const key of PROGRESS_KEYS) {
    const row = buildRow(user.id, key);
    if (row) rows.push(row);
  }

  // Dynamic prefix keys (Product Design scenarios)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (DYNAMIC_PREFIXES.some(prefix => key.startsWith(prefix))) {
      const row = buildRow(user.id, key);
      if (row) rows.push(row);
    }
  }

  if (rows.length === 0) return;

  const { error } = await supabase
    .from('user_progress')
    .upsert(rows, { onConflict: 'user_id,key' });

  if (error) {
    console.warn('[PAL sync] push failed:', error.message);
  }
}

// ─── Pull: Supabase → localStorage ───────────────────────────────────────────

export async function pullProgressFromSupabase(user) {
  if (!supabase || !user) return;

  const { data, error } = await supabase
    .from('user_progress')
    .select('key, value')
    .eq('user_id', user.id);

  if (error) {
    console.warn('[PAL sync] pull failed:', error.message);
    return;
  }

  if (!data || data.length === 0) return;

  for (const row of data) {
    try {
      localStorage.setItem(row.key, JSON.stringify(row.value));
    } catch (e) {
      // Ignore storage quota errors — localStorage is best-effort
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildRow(userId, key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const value = JSON.parse(raw);
    return { user_id: userId, key, value, updated_at: new Date().toISOString() };
  } catch {
    return null; // Skip non-JSON values
  }
}
