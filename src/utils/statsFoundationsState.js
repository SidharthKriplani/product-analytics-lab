var SF_STATE_KEY = 'pal-sf-state-v1';

export function loadSFState(id) {
  try {
    var all = JSON.parse(localStorage.getItem(SF_STATE_KEY) || '{}');
    return all[id] || null;
  } catch { return null; }
}

export function saveSFState(id, state) {
  try {
    var all = JSON.parse(localStorage.getItem(SF_STATE_KEY) || '{}');
    all[id] = state;
    localStorage.setItem(SF_STATE_KEY, JSON.stringify(all));
  } catch {}
}
