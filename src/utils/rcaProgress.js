// Product Analytics Lab — RCA Room Progress Persistence
const STORAGE_KEY = 'pal-rca-progress-v2';

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; }
}
function writeStore(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

export function saveRCAAttempt(caseId, stepChoices, score, level) {
  const store = readStore();
  const prev = store[caseId] || {};
  const attempts = (prev.attempts || 0) + 1;
  store[caseId] = {
    stepChoices,
    score,
    level,
    attempts,
    lastCompletedAt: Date.now(),
  };
  writeStore(store);
}

export function getRCAProgress(caseId) {
  return readStore()[caseId] || null;
}

export function getAllRCAProgress() {
  return readStore();
}

export function clearRCAProgress(caseId) {
  const store = readStore();
  delete store[caseId];
  writeStore(store);
}

// ── Mid-case draft ──
var DRAFT_KEY = 'pal-rca-draft-v1';
function readDrafts() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); } catch { return {}; } }

export function saveRCADraft(caseId, state) {
  try { var d = readDrafts(); d[caseId] = state; localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {}
}
export function loadRCADraft(caseId) { return readDrafts()[caseId] || null; }
export function clearRCADraft(caseId) {
  try { var d = readDrafts(); delete d[caseId]; localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {}
}
