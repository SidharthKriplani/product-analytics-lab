// Product Analytics Lab — Metrics Room Progress Persistence
const STORAGE_KEY = 'pal-metrics-progress-v2';

const LEVEL_ORDER = ['junior', 'analyst', 'senior', 'staff'];

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; }
}
function writeStore(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

export function saveMetricsAttempt(caseId, fieldChoices, score, level) {
  const store = readStore();
  const prev = store[caseId] || {};
  const attempts = (prev.attempts || 0) + 1;
  const isImprovement = !prev.bestLevel || LEVEL_ORDER.indexOf(level) > LEVEL_ORDER.indexOf(prev.bestLevel);
  store[caseId] = {
    fieldChoices,
    score,
    level,
    attempts,
    lastCompletedAt: Date.now(),
    bestLevel: isImprovement ? level : prev.bestLevel,
    bestScore: isImprovement ? score : (prev.bestScore ?? score),
  };
  writeStore(store);
}

export function getMetricsProgress(caseId) {
  return readStore()[caseId] || null;
}

export function getAllMetricsProgress() {
  return readStore();
}

export function clearMetricsProgress(caseId) {
  const store = readStore();
  delete store[caseId];
  writeStore(store);
}

// ── Mid-case draft (partial field selections, cleared on submit/retry) ──
var DRAFT_KEY = 'pal-metrics-draft-v1';
function readDrafts() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); } catch { return {}; } }

export function saveMetricsDraft(caseId, fieldChoices) {
  try { var d = readDrafts(); d[caseId] = fieldChoices; localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {}
}
export function loadMetricsDraft(caseId) { return readDrafts()[caseId] || null; }
export function clearMetricsDraft(caseId) {
  try { var d = readDrafts(); delete d[caseId]; localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {}
}
