const KEY = 'pal-instrumentation-progress-v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function getInstrumentationProgress(id) {
  return load()[id] || null;
}

export function getAllInstrumentationProgress() {
  return load();
}

export function saveInstrumentationProgress(id, data) {
  const d = load();
  d[id] = { ...data, completedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(d));
}

export function clearInstrumentationProgress() {
  localStorage.removeItem(KEY);
}

// ── Mid-case draft ──
var INDRAFT_KEY = 'pal-instrumentation-draft-v1';
function readINDrafts() { try { return JSON.parse(localStorage.getItem(INDRAFT_KEY) || '{}'); } catch { return {}; } }
export function saveInstrumentationDraft(id, state) { try { var d = readINDrafts(); d[id] = state; localStorage.setItem(INDRAFT_KEY, JSON.stringify(d)); } catch {} }
export function loadInstrumentationDraft(id) { return readINDrafts()[id] || null; }
export function clearInstrumentationDraft(id) { try { var d = readINDrafts(); delete d[id]; localStorage.setItem(INDRAFT_KEY, JSON.stringify(d)); } catch {} }
