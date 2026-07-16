import { tierOf } from '../data/moduleTiers.js';
import { statsFoundationsModules } from '../data/statsFoundationsModules.js';
import { metricsFoundationModules } from '../data/metricsFoundationModules.js';
import { expFoundationModules } from '../data/expFoundationModules.js';
import { rcaFoundationModules } from '../data/rcaFoundationModules.js';

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
//     { type: 'note', id, title, blocks: [...], addedAt, updatedAt }
//   ]
// }
// Note block shapes (see components/tracks/NoteEditor.jsx):
//   { id, type: 'text'|'h1'|'h2'|'h3'|'bullet'|'numbered'|'todo'|'quote'|'callout', content, checked? }
//   { id, type: 'code', content, lang }
//   { id, type: 'toggle', content, body }
//   { id, type: 'divider' }
//   { id, type: 'video', url, videoId, platform, title }
//   { id, type: 'link',  url, domain, title, summary }
// Legacy plain notes ({ type: 'note', content }) are silently migrated to the
// block shape on first read — see load().

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function load() {
  let tracks;
  try {
    tracks = JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
  if (!Array.isArray(tracks)) return [];
  // One-time silent migration: legacy plain-text notes ({ content }) become
  // rich block notes the NoteEditor can open. Idempotent — notes that already
  // carry blocks are left untouched.
  let changed = false;
  for (const t of tracks) {
    for (const it of (t.items || [])) {
      if (it.type === 'note' && !Array.isArray(it.blocks)) {
        const content = typeof it.content === 'string' ? it.content : '';
        it.id = it.id || uid();
        it.title = it.title || (content.split('\n')[0] || '').replace(/[*~=`#>]/g, '').slice(0, 60);
        it.blocks = [{ id: uid(), type: 'text', content }];
        it.updatedAt = it.updatedAt || it.addedAt || new Date().toISOString();
        changed = true;
      }
    }
  }
  if (changed) {
    try { localStorage.setItem(KEY, JSON.stringify(tracks)); } catch { /* ignore */ }
  }
  return tracks;
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

// Every foundation module across the 4 families, tagged with the track item
// type PAL's foundation "+" buttons produce (sf_module / mf_module / ef_module /
// rca_module) so seeded items render + navigate identically to hand-added ones.
const TIER_FOUNDATION_MODULES = [
  { type: 'sf_module', category: 'Stats Foundation',   mods: statsFoundationsModules },
  { type: 'mf_module', category: 'Metrics Foundation', mods: metricsFoundationModules },
  { type: 'ef_module', category: 'A/B Foundation',     mods: expFoundationModules },
  { type: 'rca_module', category: 'RCA Foundation',    mods: rcaFoundationModules },
];

// One-click: (re)build the S / A / B tier tracks from every Foundation module,
// tagged by interview frequency (moduleTiers.js). Rebuilds cleanly on re-run
// (drops any prior S/A/B Tier tracks first). Returns [{ name, count }].
export function seedTierTracks() {
  const names = { S: 'S Tier', A: 'A Tier', B: 'B Tier' };
  const now = new Date().toISOString();
  const buckets = { S: [], A: [], B: [] };
  TIER_FOUNDATION_MODULES.forEach(({ type, category, mods }) => {
    (mods || []).forEach(m => {
      const t = tierOf(m.id);
      buckets[t].push({
        type,
        itemId: String(m.id),
        label: m.title,
        meta: { difficulty: m.difficulty, tier: t, category },
        addedAt: now,
      });
    });
  });
  const kept = load().filter(t => !['S Tier', 'A Tier', 'B Tier'].includes(t.name));
  const tierTracks = ['S', 'A', 'B'].map(t => ({
    id: uid(), name: names[t], createdAt: now, items: buckets[t],
  }));
  save([...kept, ...tierTracks]);
  return tierTracks.map(t => ({ name: t.name, count: t.items.length }));
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

// ── Note CRUD (rich, block-based) ─────────────────────────────────────────────

// Create a new rich note. `seedText` (optional) becomes the first text block.
export function createNote(trackId, title = '', seedText = '') {
  const tracks = load();
  const t = tracks.find(t => t.id === trackId);
  if (!t) return null;
  const note = {
    type: 'note',
    id: uid(),
    title,
    blocks: [{ id: uid(), type: 'text', content: seedText }],
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  t.items.push(note);
  save(tracks);
  setLastTrackId(trackId);
  return note;
}

// Patch a rich note by its note id — patch can be { title } or { blocks } or both.
export function updateNoteById(trackId, noteId, patch) {
  const tracks = load();
  const t = tracks.find(t => t.id === trackId);
  if (!t) return;
  t.items = t.items.map(i =>
    i.type === 'note' && i.id === noteId
      ? { ...i, ...patch, updatedAt: new Date().toISOString() }
      : i
  );
  save(tracks);
}

export function deleteNoteById(trackId, noteId) {
  const tracks = load();
  const t = tracks.find(t => t.id === trackId);
  if (!t) return;
  t.items = t.items.filter(i => !(i.type === 'note' && i.id === noteId));
  save(tracks);
}

// Legacy: add a free-text note to a track (now creates a rich note).
export function addNote(trackId, content) {
  return createNote(trackId, '', content);
}

// Legacy alias — index-based plain-text edit; writes into the first block
// (load() migration guarantees blocks exist).
export function updateNote(trackId, index, content) {
  const tracks = load();
  const t = tracks.find(t => t.id === trackId);
  if (!t || !t.items[index] || t.items[index].type !== 'note') return;
  const it = t.items[index];
  const blocks = Array.isArray(it.blocks) && it.blocks.length
    ? [{ ...it.blocks[0], content }, ...it.blocks.slice(1)]
    : [{ id: uid(), type: 'text', content }];
  t.items[index] = { ...it, content, blocks, updatedAt: new Date().toISOString() };
  save(tracks);
}

// Edit the note attached to a saved highlight (by item index) — mirrors
// updateNote() above but writes into item.meta.note since a highlight item
// carries its own note field alongside the captured text/color/source.
export function updateHighlightNote(trackId, index, note) {
  const tracks = load();
  const t = tracks.find(t => t.id === trackId);
  if (!t || !t.items[index] || t.items[index].type !== 'highlight') return;
  t.items[index] = { ...t.items[index], meta: { ...(t.items[index].meta || {}), note }, updatedAt: new Date().toISOString() };
  save(tracks);
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

// Move an item from one track to another (drag-and-drop across tracks).
export function moveItem(fromTrackId, toTrackId, index) {
  if (fromTrackId === toTrackId) return;
  const tracks = load();
  const from = tracks.find(t => t.id === fromTrackId);
  const to = tracks.find(t => t.id === toTrackId);
  if (!from || !to || index < 0 || index >= from.items.length) return;
  const [item] = from.items.splice(index, 1);
  to.items.push(item);
  save(tracks);
}

// Remove the first item matching `pred` (untick/remove from the popover).
export function removeItemRef(trackId, pred) {
  const t = load().find(x => x.id === trackId);
  if (!t) return;
  const idx = t.items.findIndex(pred);
  if (idx >= 0) removeItem(trackId, idx);
}
export function removeGenericFromTrack(trackId, type, itemId) {
  removeItemRef(trackId, i => i.type === type && String(i.itemId) === String(itemId));
}
export function removeSqlFromTrack(trackId, problemId) {
  removeItemRef(trackId, i => i.type === 'sql' && String(i.problemId) === String(problemId));
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
