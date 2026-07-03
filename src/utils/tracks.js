const KEY = 'pal-tracks-v1';
const LAST_KEY = 'pal-tracks-last-v1';   // id of the most-recently-added-to track
const QUICK_KEY = 'pal-tracks-quickadd-v1'; // '1' = skip the picker, add straight to last track

// Track shape:
// {
//   id: string (uuid-ish),
//   name: string,
//   createdAt: ISO string,
//   items: [
//     { type: 'sql', problemId, title, difficulty, addedAt },
//     { type: 'note', content, addedAt }
//   ]
// }

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('pal_tracks'));
  } catch {
    // silently fail if storage unavailable
  }
}

export function getTracks() {
  return load();
}

export function getTrack(trackId) {
  return load().find(t => t.id === trackId) || null;
}

export function createTrack(name) {
  const tracks = load();
  const track = {
    id: uid(),
    name: name.trim() || 'Untitled Track',
    createdAt: new Date().toISOString(),
    items: [],
  };
  tracks.push(track);
  save(tracks);
  return track;
}

export function renameTrack(trackId, name) {
  const tracks = load();
  const t = tracks.find(t => t.id === trackId);
  if (t) { t.name = name.trim() || t.name; save(tracks); }
}

export function deleteTrack(trackId) {
  save(load().filter(t => t.id !== trackId));
}

// Add a SQL problem to a track (idempotent — won't duplicate)
export function addSqlProblem(trackId, problemId, title, difficulty) {
  const tracks = load();
  const t = tracks.find(t => t.id === trackId);
  if (!t) return;
  const already = t.items.some(i => i.type === 'sql' && i.problemId === problemId);
  if (already) return;
  t.items.push({ type: 'sql', problemId, title, difficulty, addedAt: new Date().toISOString() });
  save(tracks);
  setLastTrackId(trackId);
}

// Add a free-text note to a track
export function addNote(trackId, content) {
  const tracks = load();
  const t = tracks.find(t => t.id === trackId);
  if (!t) return;
  t.items.push({ type: 'note', content, addedAt: new Date().toISOString() });
  save(tracks);
  setLastTrackId(trackId);
}

export function removeItem(trackId, index) {
  const tracks = load();
  const t = tracks.find(t => t.id === trackId);
  if (!t) return;
  t.items.splice(index, 1);
  save(tracks);
}

export function reorderItems(trackId, fromIndex, toIndex) {
  const tracks = load();
  const t = tracks.find(t => t.id === trackId);
  if (!t) return;
  const [item] = t.items.splice(fromIndex, 1);
  t.items.splice(toIndex, 0, item);
  save(tracks);
}

// Returns array of track ids that contain a given SQL problem
export function getTracksForProblem(problemId) {
  return load()
    .filter(t => t.items.some(i => i.type === 'sql' && i.problemId === problemId))
    .map(t => t.id);
}

// Generic item — { type, itemId, label, meta, addedAt }
export function addItem(trackId, type, itemId, label, meta) {
  var tracks = load();
  var t = tracks.find(function(t) { return t.id === trackId; });
  if (!t) return;
  var already = t.items.some(function(i) { return i.type === type && i.itemId === String(itemId); });
  if (already) return;
  t.items.push({ type: type, itemId: String(itemId), label: label || '', meta: meta || {}, addedAt: new Date().toISOString() });
  save(tracks);
  setLastTrackId(trackId);
}

// Returns array of track IDs containing a generic item
export function getTracksForItem(type, itemId) {
  return load()
    .filter(function(t) { return t.items.some(function(i) { return i.type === type && i.itemId === String(itemId); }); })
    .map(function(t) { return t.id; });
}

// ── Quick-add: skip the picker and drop into the most-recently-used track ─────

export function getLastTrackId() {
  try { return localStorage.getItem(LAST_KEY) || null; } catch { return null; }
}

function setLastTrackId(id) {
  try { if (id) localStorage.setItem(LAST_KEY, id); } catch { /* ignore */ }
}

// The track object the quick-add would target right now (null if none/deleted).
export function getLastTrack() {
  var id = getLastTrackId();
  return id ? getTrack(id) : null;
}

export function getQuickAdd() {
  try { return localStorage.getItem(QUICK_KEY) === '1'; } catch { return false; }
}

export function setQuickAdd(on) {
  try {
    localStorage.setItem(QUICK_KEY, on ? '1' : '0');
    window.dispatchEvent(new CustomEvent('pal_tracks'));
  } catch { /* ignore */ }
}

// Add a generic item straight to the last-used track. Returns the track (for a
// confirmation toast) or null if there's no valid last track (caller opens the picker).
export function quickAddItem(type, itemId, label, meta) {
  var t = getLastTrack();
  if (!t) return null;
  addItem(t.id, type, itemId, label, meta);
  return t;
}

// SQL variant of quickAddItem.
export function quickAddSqlProblem(problemId, title, difficulty) {
  var t = getLastTrack();
  if (!t) return null;
  addSqlProblem(t.id, problemId, title, difficulty);
  return t;
}
