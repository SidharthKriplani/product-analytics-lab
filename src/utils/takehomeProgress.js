const KEY = 'pal-takehome-progress-v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function getTakehomeProgress(caseId) {
  return load()[caseId] || null;
}

export function getAllTakehomeProgress() {
  return load();
}

export function saveTakehomeProgress(caseId, data) {
  const d = load();
  d[caseId] = {
    startedAt: data.startedAt || null,
    completedAt: data.completedAt || new Date().toISOString(),
    wordCount: data.wordCount || 0,
    rating: data.rating || null,
  };
  localStorage.setItem(KEY, JSON.stringify(d));
}

export function clearTakehomeProgress(caseId) {
  const d = load();
  delete d[caseId];
  localStorage.setItem(KEY, JSON.stringify(d));
}

// ── Mid-case draft ──
var THDRAFT_KEY = 'pal-takehome-draft-v1';
function readTHDrafts() { try { return JSON.parse(localStorage.getItem(THDRAFT_KEY) || '{}'); } catch { return {}; } }
export function saveTakehomeDraft(id, state) { try { var d = readTHDrafts(); d[id] = state; localStorage.setItem(THDRAFT_KEY, JSON.stringify(d)); } catch {} }
export function loadTakehomeDraft(id) { return readTHDrafts()[id] || null; }
export function clearTakehomeDraft(id) { try { var d = readTHDrafts(); delete d[id]; localStorage.setItem(THDRAFT_KEY, JSON.stringify(d)); } catch {} }
