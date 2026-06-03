const KEY = 'pal-pri-progress-v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function getPrioritizationProgress(scenarioId) {
  return load()[scenarioId] || null;
}

export function getAllPrioritizationProgress() {
  return load();
}

export function savePrioritizationAttempt(scenarioId, response, rating) {
  const data = load();
  data[scenarioId] = { response, rating, completedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearPrioritizationProgress(scenarioId) {
  const data = load();
  delete data[scenarioId];
  localStorage.setItem(KEY, JSON.stringify(data));
}

// ── Mid-case draft ──
var PDRAFT_KEY = 'pal-prioritization-draft-v1';
function readPDrafts() { try { return JSON.parse(localStorage.getItem(PDRAFT_KEY) || '{}'); } catch { return {}; } }
export function savePrioritizationDraft(id, state) { try { var d = readPDrafts(); d[id] = state; localStorage.setItem(PDRAFT_KEY, JSON.stringify(d)); } catch {} }
export function loadPrioritizationDraft(id) { return readPDrafts()[id] || null; }
export function clearPrioritizationDraft(id) { try { var d = readPDrafts(); delete d[id]; localStorage.setItem(PDRAFT_KEY, JSON.stringify(d)); } catch {} }
