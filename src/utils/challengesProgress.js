const KEY = 'pal-challenges-progress-v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function getChallengesProgress(id) {
  return load()[id] || null;
}

export function getAllChallengesProgress() {
  return load();
}

export function saveChallengesProgress(id, rating) {
  const d = load();
  d[id] = {
    rating,
    completedAt: new Date().toISOString(),
    attempts: (d[id]?.attempts || 0) + 1,
  };
  localStorage.setItem(KEY, JSON.stringify(d));
}

export function clearChallengesProgress() {
  localStorage.removeItem(KEY);
}

// ── Mid-case draft ──
var CHDRAFT_KEY = 'pal-challenges-draft-v1';
function readCHDrafts() { try { return JSON.parse(localStorage.getItem(CHDRAFT_KEY) || '{}'); } catch { return {}; } }
export function saveChallengesDraft(id, state) { try { var d = readCHDrafts(); d[id] = state; localStorage.setItem(CHDRAFT_KEY, JSON.stringify(d)); } catch {} }
export function loadChallengesDraft(id) { return readCHDrafts()[id] || null; }
export function clearChallengesDraft(id) { try { var d = readCHDrafts(); delete d[id]; localStorage.setItem(CHDRAFT_KEY, JSON.stringify(d)); } catch {} }
