const KEY = 'pal-behavioral-progress-v1';

function migrateOldIds() {
  try {
    const raw = localStorage.getItem('pal-behavioral-progress-v1');
    if (!raw) return;
    const data = JSON.parse(raw);
    let changed = false;
    for (let i = 9; i <= 20; i++) {
      const oldKey = `Q${i < 10 ? '0' + i : i}`;  // Q09, Q10 ... Q20
      const newKey = `BEH${i < 10 ? '0' + i : i}`; // BEH09, BEH10 ... BEH20
      if (data[oldKey] && !data[newKey]) {
        data[newKey] = data[oldKey];
        delete data[oldKey];
        changed = true;
      }
    }
    if (changed) localStorage.setItem('pal-behavioral-progress-v1', JSON.stringify(data));
  } catch {}
}

function load() {
  migrateOldIds();
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function getBehavioralProgress(questionId) {
  return load()[questionId] || null;
}

export function getAllBehavioralProgress() {
  return load();
}

export function saveBehavioralAttempt(questionId, response, rating) {
  const data = load();
  data[questionId] = { response, rating, completedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearBehavioralProgress(questionId) {
  const data = load();
  delete data[questionId];
  localStorage.setItem(KEY, JSON.stringify(data));
}

// ── Mid-case draft ──
var BDRAFT_KEY = 'pal-behavioral-draft-v1';
function readBDrafts() { try { return JSON.parse(localStorage.getItem(BDRAFT_KEY) || '{}'); } catch { return {}; } }
export function saveBehavioralDraft(id, state) { try { var d = readBDrafts(); d[id] = state; localStorage.setItem(BDRAFT_KEY, JSON.stringify(d)); } catch {} }
export function loadBehavioralDraft(id) { return readBDrafts()[id] || null; }
export function clearBehavioralDraft(id) { try { var d = readBDrafts(); delete d[id]; localStorage.setItem(BDRAFT_KEY, JSON.stringify(d)); } catch {} }
