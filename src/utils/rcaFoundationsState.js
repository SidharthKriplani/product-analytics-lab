var RF_STATE_KEY = 'pal-rf-state-v1';

export function loadRFState(id) {
  try {
    var all = JSON.parse(localStorage.getItem(RF_STATE_KEY) || '{}');
    return all[id] || null;
  } catch { return null; }
}

export function saveRFState(id, state) {
  try {
    var all = JSON.parse(localStorage.getItem(RF_STATE_KEY) || '{}');
    all[id] = state;
    localStorage.setItem(RF_STATE_KEY, JSON.stringify(all));
  } catch {}
}
