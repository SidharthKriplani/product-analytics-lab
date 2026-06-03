const KEY = 'pal-stf-progress-v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function getSTFProgress(caseId) {
  return load()[caseId] || null;
}

export function getAllSTFProgress() {
  return load();
}

export function saveSTFProgress(caseId, rating) {
  const d = load();
  d[caseId] = {
    rating,
    completedAt: new Date().toISOString(),
    attempts: (d[caseId]?.attempts || 0) + 1,
  };
  localStorage.setItem(KEY, JSON.stringify(d));
}

export function clearSTFProgress(caseId) {
  const d = load();
  delete d[caseId];
  localStorage.setItem(KEY, JSON.stringify(d));
}

// ── Mid-case draft ──
var STFDRAFT_KEY = 'pal-stf-draft-v1';
function readSTFDrafts() { try { return JSON.parse(localStorage.getItem(STFDRAFT_KEY) || '{}'); } catch { return {}; } }
export function saveSTFDraft(id, state) { try { var d = readSTFDrafts(); d[id] = state; localStorage.setItem(STFDRAFT_KEY, JSON.stringify(d)); } catch {} }
export function loadSTFDraft(id) { return readSTFDrafts()[id] || null; }
export function clearSTFDraft(id) { try { var d = readSTFDrafts(); delete d[id]; localStorage.setItem(STFDRAFT_KEY, JSON.stringify(d)); } catch {} }
