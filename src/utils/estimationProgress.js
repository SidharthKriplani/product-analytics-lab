const KEY = 'pal-estimation-progress-v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function getEstimationProgress(problemId) {
  return load()[problemId] || null;
}

export function getAllEstimationProgress() {
  return load();
}

export function saveEstimationAttempt(problemId, response, rating) {
  const data = load();
  data[problemId] = { response, rating, completedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearEstimationProgress(problemId) {
  const data = load();
  delete data[problemId];
  localStorage.setItem(KEY, JSON.stringify(data));
}

// ── Mid-case draft ──
var EDRAFT_KEY = 'pal-estimation-draft-v1';
function readEDrafts() { try { return JSON.parse(localStorage.getItem(EDRAFT_KEY) || '{}'); } catch { return {}; } }
export function saveEstimationDraft(id, state) { try { var d = readEDrafts(); d[id] = state; localStorage.setItem(EDRAFT_KEY, JSON.stringify(d)); } catch {} }
export function loadEstimationDraft(id) { return readEDrafts()[id] || null; }
export function clearEstimationDraft(id) { try { var d = readEDrafts(); delete d[id]; localStorage.setItem(EDRAFT_KEY, JSON.stringify(d)); } catch {} }
