// src/utils/tracksSync.js — cross-device merge sync for PAL My Tracks.
//
// Mirrors the MSL/GSL siblings. Unlike the whole-value keys in syncProgress.js
// (which overwrite), Tracks are a hand-curated, growing artifact edited from
// multiple devices, so a blind overwrite would silently drop items added on
// whichever device didn't sync last. This does a real item-level UNION merge,
// using tombstones (see getTombstones()/itemIdentity() in tracks.js) so deletes
// propagate instead of being resurrected by a stale device's copy. The merge is
// non-destructive: it can only remove an item that carries an explicit tombstone,
// and any parse/shape error falls back to keeping local.
//
// Reuses the existing generic `user_progress` table (no schema change) under its
// own dedicated key ('pal-tracks-v1'), which is NOT in syncProgress.PROGRESS_KEYS,
// so it never collides with that overwrite path.

import { supabase } from './supabase.js';
import { getTracks, getTombstones, applyMergedState, itemIdentity } from './tracks.js';

const KEY = 'pal-tracks-v1';
const TOMBSTONE_TTL_DAYS = 180;

// PAL timestamps are ISO strings (createdAt/addedAt/updatedAt); coerce to ms.
function ts(v) { return typeof v === 'number' ? v : (Date.parse(v) || 0); }

function pruneTombstones(t) {
  const cutoff = Date.now() - TOMBSTONE_TTL_DAYS * 86400000;
  return {
    trackDeletes: (t.trackDeletes || []).filter(x => x.deletedAt > cutoff),
    itemDeletes: (t.itemDeletes || []).filter(x => x.deletedAt > cutoff),
  };
}

function trackLastTouched(t) {
  let max = ts(t.updatedAt) || ts(t.createdAt) || 0;
  for (const it of t.items || []) max = Math.max(max, ts(it.updatedAt) || ts(it.addedAt) || 0);
  return max;
}

function dedupeTombstones(list, keyFn) {
  const seen = new Map();
  for (const t of list) {
    const k = keyFn(t);
    const prev = seen.get(k);
    if (!prev || t.deletedAt > prev.deletedAt) seen.set(k, t);
  }
  return [...seen.values()];
}

// Exported for standalone testing — pure function, no localStorage/network.
export function mergeTracks(local, remote) {
  const lt = pruneTombstones(local.tombstones || {});
  const rt = pruneTombstones(remote.tombstones || {});

  const deletedTrackIds = new Set([
    ...lt.trackDeletes.map(t => t.id),
    ...rt.trackDeletes.map(t => t.id),
  ]);
  const deletedItemKeys = new Set([
    ...lt.itemDeletes.map(t => `${t.trackId}::${t.itemKey}`),
    ...rt.itemDeletes.map(t => `${t.trackId}::${t.itemKey}`),
  ]);

  const byId = new Map();
  for (const t of [...(local.tracks || []), ...(remote.tracks || [])]) {
    if (deletedTrackIds.has(t.id)) continue;
    const existing = byId.get(t.id);
    if (!existing) { byId.set(t.id, { ...t, items: [...(t.items || [])] }); continue; }
    const merged = trackLastTouched(t) > trackLastTouched(existing) ? { ...t } : { ...existing };
    const itemMap = new Map();
    for (const it of [...(existing.items || []), ...(t.items || [])]) {
      const key = itemIdentity(it);
      if (deletedItemKeys.has(`${merged.id}::${key}`)) continue;
      const prev = itemMap.get(key);
      if (!prev || (ts(it.updatedAt) || ts(it.addedAt)) > (ts(prev.updatedAt) || ts(prev.addedAt))) itemMap.set(key, it);
    }
    merged.items = [...itemMap.values()].sort((a, b) => ts(a.addedAt) - ts(b.addedAt));
    byId.set(t.id, merged);
  }
  for (const [id, t] of byId) {
    t.items = (t.items || []).filter(it => !deletedItemKeys.has(`${id}::${itemIdentity(it)}`));
  }

  const tracks = [...byId.values()].sort((a, b) => ts(a.createdAt) - ts(b.createdAt));
  const tombstones = {
    trackDeletes: dedupeTombstones([...lt.trackDeletes, ...rt.trackDeletes], t => t.id),
    itemDeletes: dedupeTombstones([...lt.itemDeletes, ...rt.itemDeletes], t => `${t.trackId}::${t.itemKey}`),
  };
  return { tracks, tombstones };
}

let pushTimer = null;

// Debounced auto-push, called after every local track mutation (wired in App.jsx
// via a listener on the 'pal_tracks' event tracks.js already dispatches).
export function scheduleTracksPush(user) {
  if (!user || !supabase) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { pushTracksNow(user); }, 1500);
}

export async function pushTracksNow(user) {
  if (!user || !supabase) return { error: null };
  // PAL's user_progress.value is jsonb (syncProgress.js upserts parsed objects),
  // so push the object directly — no stringify (that's the MSL text-column path).
  const value = { tracks: getTracks(), tombstones: getTombstones() };
  return supabase.from('user_progress').upsert(
    [{ user_id: user.id, key: KEY, value, updated_at: new Date().toISOString() }],
    { onConflict: 'user_id,key' }
  );
}

// Pull remote, merge with local, write merged result back locally, then push the
// merged result so both sides converge. Call on sign-in / initial session.
export async function pullAndMergeTracks(user) {
  if (!user || !supabase) return { error: null };
  const { data, error } = await supabase
    .from('user_progress').select('value').eq('user_id', user.id).eq('key', KEY).maybeSingle();
  if (error) return { error };
  let remote = data?.value || { tracks: [], tombstones: {} };
  if (typeof remote === 'string') {
    try { remote = JSON.parse(remote); } catch { remote = { tracks: [], tombstones: {} }; }
  }
  // Shape guard: a bare array (older/other writer) is treated as tracks-only.
  if (Array.isArray(remote)) remote = { tracks: remote, tombstones: {} };
  if (!remote || typeof remote !== 'object') remote = { tracks: [], tombstones: {} };
  const local = { tracks: getTracks(), tombstones: getTombstones() };
  const merged = mergeTracks(local, remote);
  applyMergedState(merged);
  await pushTracksNow(user);
  return { error: null };
}
