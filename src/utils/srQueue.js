// Product Analytics Lab — Spaced-Repetition Review Queue
//
// Leitner-style spaced repetition. Items a learner gets WRONG/weak are
// re-surfaced on an expanding schedule (the "return trigger" — the efficacy
// moat). Correct reviews promote an item up the boxes (longer intervals);
// a miss drops it back to box 1 (due ~1 day). Box 5 promotion retires the item.
//
// Pure functions, guarded JSON parse, no external deps.
//
// Store shape (localStorage key 'pal-sr-queue-v1'):
//   { [itemKey]: { room, caseId, title, box, nextReview, lastResult, addedAt } }
//   where itemKey = room + ':' + caseId

const STORAGE_KEY = 'pal-sr-queue-v1';

// Box → interval in days. Box 5 is the terminal "retire" box.
const BOX_INTERVAL_DAYS = { 1: 1, 2: 3, 3: 7, 4: 21 };
const MAX_BOX = 5; // promoting past box 4 → box 5 = mastered / retired
const DAY_MS = 24 * 60 * 60 * 1000;

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

function writeStore(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

function makeKey(room, caseId) {
  return String(room) + ':' + String(caseId);
}

// Given a box number, return the ISO timestamp it is next due.
function nextReviewISO(box, fromMs) {
  const base = typeof fromMs === 'number' ? fromMs : Date.now();
  const days = BOX_INTERVAL_DAYS[box] != null ? BOX_INTERVAL_DAYS[box] : BOX_INTERVAL_DAYS[1];
  return new Date(base + days * DAY_MS).toISOString();
}

/**
 * Record the outcome of a graded item.
 *  - Wrong / weak  → add the item, or reset an existing one, to box 1 (due ~1 day).
 *  - Correct       → promote one box, pushing the next review further out.
 *                    Promotion past box 4 retires the item (box 5, no longer due).
 *
 * @param {object} p
 * @param {string} p.room    room id (e.g. 'stats', 'spot-the-flaw', 'trainer')
 * @param {string} p.caseId  case / module / question id
 * @param {string} [p.title] human-readable title for the review list
 * @param {boolean} p.correct  whether the learner got it right
 */
export function recordSrOutcome({ room, caseId, title, correct }) {
  if (!room || !caseId) return;
  const store = readStore();
  const key = makeKey(room, caseId);
  const now = Date.now();
  const existing = store[key];

  if (!correct) {
    // Miss → (re)schedule to box 1, due soon. New misses enter the queue here.
    store[key] = {
      room,
      caseId,
      title: title || existing?.title || caseId,
      box: 1,
      nextReview: nextReviewISO(1, now),
      lastResult: 'wrong',
      addedAt: existing?.addedAt || now,
    };
    writeStore(store);
    return;
  }

  // Correct.
  if (!existing) {
    // First-ever encounter and it was correct → nothing to remediate.
    // Don't pollute the queue with items the learner already knows.
    return;
  }

  const nextBox = Math.min((existing.box || 1) + 1, MAX_BOX);
  if (nextBox >= MAX_BOX) {
    // Mastered — retire from the active queue.
    delete store[key];
    writeStore(store);
    return;
  }

  store[key] = {
    ...existing,
    room,
    caseId,
    title: title || existing.title || caseId,
    box: nextBox,
    nextReview: nextReviewISO(nextBox, now),
    lastResult: 'correct',
  };
  writeStore(store);
}

/**
 * Items whose nextReview is now or in the past, soonest-first.
 * @param {number} [limit] optional max number of items to return
 */
export function getDueReviews(limit) {
  const store = readStore();
  const now = Date.now();
  const due = Object.keys(store)
    .map(k => store[k])
    .filter(item => item && item.nextReview && new Date(item.nextReview).getTime() <= now)
    .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
  if (typeof limit === 'number' && limit > 0) return due.slice(0, limit);
  return due;
}

/**
 * All items in the queue, regardless of due status (soonest-first).
 */
export function getAllReviews() {
  const store = readStore();
  return Object.keys(store)
    .map(k => store[k])
    .filter(Boolean)
    .sort((a, b) => new Date(a.nextReview || 0).getTime() - new Date(b.nextReview || 0).getTime());
}

/**
 * Summary stats for badges / dashboards.
 * @returns {{ due: number, total: number, scheduled: number, nextDue: string|null }}
 */
export function getSrStats() {
  const store = readStore();
  const now = Date.now();
  const items = Object.keys(store).map(k => store[k]).filter(Boolean);
  let due = 0;
  let nextDueMs = null;
  for (const item of items) {
    if (!item.nextReview) continue;
    const t = new Date(item.nextReview).getTime();
    if (t <= now) {
      due++;
    } else if (nextDueMs === null || t < nextDueMs) {
      nextDueMs = t;
    }
  }
  return {
    due,
    total: items.length,
    scheduled: items.length - due,
    nextDue: nextDueMs !== null ? new Date(nextDueMs).toISOString() : null,
  };
}

/** Remove a single item from the queue (e.g. manual dismiss). */
export function removeSrItem(room, caseId) {
  const store = readStore();
  delete store[makeKey(room, caseId)];
  writeStore(store);
}

/** Clear the entire queue (used by reset-all-progress). */
export function clearSrQueue() {
  writeStore({});
}
