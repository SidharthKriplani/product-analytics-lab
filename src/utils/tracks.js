const KEY = 'pal-tracks-v1';

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
}

// Add a free-text note to a track
export function addNote(trackId, content) {
  const tracks = load();
  const t = tracks.find(t => t.id === trackId);
  if (!t) return;
  t.items.push({ type: 'note', content, addedAt: new Date().toISOString() });
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

// Returns array of track ids that contain a given SQL problem
export function getTracksForProblem(problemId) {
  return load()
    .filter(t => t.items.some(i => i.type === 'sql' && i.problemId === problemId))
    .map(t => t.id);
}
