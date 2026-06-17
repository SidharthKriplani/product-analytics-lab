// SM-2 spaced repetition — localStorage version, no Supabase

const STORAGE_KEY = 'pal-study-reviews';

export function loadReviews() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveReviews(reviews) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {}
}

export function defaultReview(cardId) {
  return {
    cardId,
    interval_days: 0,
    ease_factor: 2.5,
    reps: 0,
    lapses: 0,
    due_date: today(),
    last_reviewed: null,
  };
}

export function gradeCard(review, grade) {
  // grade: 0=again, 1=hard, 2=good, 3=easy
  let { interval_days, ease_factor, reps, lapses } = review;

  if (grade === 0) {
    interval_days = 1;
    ease_factor = Math.max(1.3, ease_factor - 0.2);
    lapses++;
    reps = 0;
  } else {
    if (grade === 1) ease_factor = Math.max(1.3, ease_factor - 0.15);
    if (grade === 3) ease_factor = Math.min(2.5, ease_factor + 0.15);
    if (reps === 0)      interval_days = 1;
    else if (reps === 1) interval_days = 6;
    else                 interval_days = Math.round(interval_days * ease_factor);
    reps++;
  }

  const due = new Date();
  due.setDate(due.getDate() + interval_days);

  return {
    ...review,
    interval_days,
    ease_factor,
    reps,
    lapses,
    due_date: due.toISOString().split('T')[0],
    last_reviewed: new Date().toISOString(),
  };
}

export function isDue(review) {
  return review.due_date <= today();
}

export function maturityPct(reviewsMap, cards) {
  if (!cards.length) return 0;
  const mature = cards.filter(c => {
    const r = reviewsMap[c.id];
    return r && r.interval_days >= 21;
  }).length;
  return Math.round((mature / cards.length) * 100);
}

function today() {
  return new Date().toISOString().split('T')[0];
}
