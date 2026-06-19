const KEY = 'pal-paths-progress-v1';

export function getPathProgress(pathId) {
  try {
    const raw = localStorage.getItem(KEY);
    const all = raw ? JSON.parse(raw) : {};
    return new Set(all[pathId] || []);
  } catch {
    return new Set();
  }
}

export function togglePathStep(pathId, stepIndex) {
  try {
    const raw = localStorage.getItem(KEY);
    const all = raw ? JSON.parse(raw) : {};
    const current = new Set(all[pathId] || []);
    if (current.has(stepIndex)) {
      current.delete(stepIndex);
    } else {
      current.add(stepIndex);
    }
    all[pathId] = Array.from(current);
    localStorage.setItem(KEY, JSON.stringify(all));
    return new Set(all[pathId]);
  } catch {
    return new Set();
  }
}

export function resetAllPathsProgress() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
