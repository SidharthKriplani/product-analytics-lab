// Product Analytics Lab — Full Loop Room Progress Persistence
const STORAGE_KEY = 'pal-fullloop-progress-v1';

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; }
}
function writeStore(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

export function saveFullLoopProgress(caseId, progress) {
  const store = readStore();
  const prev = store[caseId] || {};
  store[caseId] = {
    ...prev,
    ...progress,
    attempts: (prev.attempts || 0) + 1,
    lastCompletedAt: Date.now(),
  };
  writeStore(store);
}

export function getFullLoopProgress(caseId) {
  return readStore()[caseId] || null;
}

export function getAllFullLoopProgress() {
  return readStore();
}

export function clearFullLoopProgress(caseId) {
  const store = readStore();
  delete store[caseId];
  writeStore(store);
}

export function getFullLoopCompletionCount() {
  const store = readStore();
  return Object.keys(store).length;
}
