import { supabase } from './supabase.js';

// ─── Static keys ─────────────────────────────────────────────────────────────
// Every pal-* key that should sync across devices.
// Keep this list in sync with the KEY / STORAGE_KEY constants in src/utils/*.js.
// When a new room is added, add its localStorage key here.

import { applyAnnotationMerge } from './annotationsSync.js';

export const PROGRESS_KEYS = [
  // Annotations (2026-07-22): stickies + highlights + delete-tombstones.
  // Pull special-cases these into a per-item merge (annotationsSync.js).
  'lab-stickies-v1',
  'lab-stickies-tomb-v1',
  'pal_page_highlights_v1',
  'pal_page_highlights_v1-tomb-v1',
  // Core room progress
  'exp-lab-progress-v1',          // Review Room (ScenarioRunner/progress.js)
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
  'pal-sql-last-open-v1',  // T3: {id, ts} of last-opened problem
  'pal-sql-last-typed-v1', // T3 v2: {id, ts} of last-typed-in problem, debounced; Continue-strip prefers this when a draft is present

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
export const DYNAMIC_PREFIXES = ['pd-progress-'];

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

// Annotation stores + tombstones — module scope, shared definitions.
const ANNOT_PAIRS = {
  'lab-stickies-v1': 'lab-stickies-tomb-v1',
  'pal_page_highlights_v1': 'pal_page_highlights_v1-tomb-v1',
};
const TOMB_TO_STORE = Object.fromEntries(Object.entries(ANNOT_PAIRS).map(([st, t]) => [t, st]));

// Annotations-only pull: per-item merge, idempotent, safe on every tab-visible.
export async function pullAnnotationsOnly(user) {
  if (!supabase || !user) return;
  try {
    const keys = [...Object.keys(ANNOT_PAIRS), ...Object.keys(TOMB_TO_STORE)];
    const { data, error } = await supabase
      .from('user_progress')
      .select('key, value')
      .eq('user_id', user.id)
      .in('key', keys);
    if (error || !data) return;
    for (const row of data) {
      if (ANNOT_PAIRS[row.key]) applyAnnotationMerge(row.key, ANNOT_PAIRS[row.key], row.value, null);
      else if (TOMB_TO_STORE[row.key]) applyAnnotationMerge(TOMB_TO_STORE[row.key], row.key, null, row.value);
    }
  } catch { /* best effort */ }
}

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
      if (ANNOT_PAIRS[row.key]) { applyAnnotationMerge(row.key, ANNOT_PAIRS[row.key], row.value, null); continue; }
      if (TOMB_TO_STORE[row.key]) { applyAnnotationMerge(TOMB_TO_STORE[row.key], row.key, null, row.value); continue; }
      const merged = mergeProgressValue(localStorage.getItem(row.key), row.value);
      localStorage.setItem(row.key, JSON.stringify(merged));
    } catch (e) {
      // Ignore storage quota errors — localStorage is best-effort
    }
  }
}

// Merge a pulled Supabase value into the existing local value WITHOUT ever losing
// local progress. Previously this blind-overwrote localStorage on every sign-in /
// token-refresh, so a solve that hadn't been pushed yet (push only fires on
// visibilitychange→hidden or explicit sign-in/sync — not on every solve) would get
// silently reverted by the next pull, e.g. a just-solved SQL Lab problem id
// disappearing from `pal-sql-lab-solved-v1` on the next visit. Rule, by shape:
//   - both arrays        -> union (dedupe), so solved-id lists only ever grow here
//   - both plain objects -> { ...remote, ...local } — local wins per key (so a
//                            local edit newer than the last push survives), remote
//                            fills in anything this device hasn't seen yet
//   - anything else       -> keep local if it already has a value; otherwise adopt
//                            remote (first sync on a fresh device)
function mergeProgressValue(rawLocal, remoteValue) {
  let local;
  try { local = rawLocal === null ? undefined : JSON.parse(rawLocal); } catch { local = undefined; }
  if (local === undefined) return remoteValue;
  if (Array.isArray(local) && Array.isArray(remoteValue)) {
    return [...new Set([...local, ...remoteValue])];
  }
  if (local && remoteValue && typeof local === 'object' && typeof remoteValue === 'object'
      && !Array.isArray(local) && !Array.isArray(remoteValue)) {
    return { ...remoteValue, ...local };
  }
  return local;
}

// ─── Delete: clear specific keys server-side ─────────────────────────────────
// Used by per-room "Reset" on the Progress page. Without this, a reset only clears
// localStorage — then the next sign-in/reload pull restores the row from the server,
// making the reset look like it did nothing. Fire-and-forget; resolves the current
// user from the cached session so callers don't need to thread `user` through props.

export async function deleteProgressKeys(keys) {
  if (!supabase || !keys || keys.length === 0) return;
  try {
    const { data: { session } = {} } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;
    const { error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', user.id)
      .in('key', keys);
    if (error) console.warn('[PAL sync] delete failed:', error.message);
  } catch (e) {
    console.warn('[PAL sync] delete threw:', e && e.message);
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
