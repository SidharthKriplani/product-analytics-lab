// Progressive profiling — decides the SINGLE next profile field worth asking a
// signed-in user about, in a fixed priority order. The reminder banner
// (components/shared/EmploymentReminder.jsx) surfaces only the highest-priority
// outstanding ask at a time, benefit-framed, so we never double-nag.
//
// Priority order:
//   1. employment-add   — role/company not set        -> Profile
//   2. linkedin-add     — no LinkedIn                  -> Profile
//   3. target-add       — no target company set        -> Progress (readiness widget)
//   4. resume-add       — no resume uploaded           -> Profile
//   5. employment-stale — employment older than 90d    -> Profile (re-confirm)
//   6. resume-stale     — resume older than 180d       -> Profile (refresh)
//
// Everything is guarded: works pre-migration and when fields are absent. Absent
// is treated as "not set" — which is fine, it just means we prompt for it.
//
// Sources (server profile wins; localStorage is the no-network fallback):
//   employment  -> profile.current_company/current_role + pal-company-v1/pal-role-v1
//   employment confirmed ts -> profile.company_updated_at + pal-company-confirmed-v1
//   linkedin    -> profile.linkedin_url + pal-linkedin-url-v1
//   resume      -> profile.resume_url + pal-resume-url-v1
//   resume ts   -> profile.resume_updated_at (no local ts kept; absent = not stale-checked)
//   target co   -> localStorage pal-target-company-v1 (set by ReadinessWidget)

// Cadence thresholds.
export const EMPLOYMENT_STALE_MS = 90 * 24 * 60 * 60 * 1000;  // quarterly
export const RESUME_STALE_MS     = 180 * 24 * 60 * 60 * 1000; // ~half-yearly

// localStorage keys (must match the writers elsewhere in the app).
const COMPANY_LS_KEY        = 'pal-company-v1';
const ROLE_LS_KEY           = 'pal-role-v1';
const COMPANY_CONFIRMED_KEY = 'pal-company-confirmed-v1';
const LINKEDIN_LS_KEY       = 'pal-linkedin-url-v1';
const RESUME_URL_LS_KEY     = 'pal-resume-url-v1';
const TARGET_COMPANY_KEY    = 'pal-target-company-v1';

function readLocal(key) {
  try { return localStorage.getItem(key) || ''; }
  catch { return ''; }
}

// True when an ISO timestamp is missing, unparseable, or older than maxAgeMs.
// A null/absent timestamp counts as "not stale" for refresh prompts — we only
// nudge a refresh once we have a real (and old enough) timestamp to compare.
function isOlderThan(iso, maxAgeMs) {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  return Date.now() - t > maxAgeMs;
}

// Decide the single next ask. `profile` is the normalized server row from
// fetchPublicProfile (may be null pre-fetch / no backend). Returns an ask object
// { id, kind, nav, message, ctaLabel } or null when nothing is outstanding.
//
// kind: 'add' (one primary CTA) | 'confirm' (Still accurate + Update).
export function getNextProfileAsk(profile) {
  const p = profile || {};

  // Resolve each field: server value first, then local fallback.
  const company   = p.current_company || readLocal(COMPANY_LS_KEY);
  const role      = p.current_role    || readLocal(ROLE_LS_KEY);
  const linkedin  = p.linkedin_url    || readLocal(LINKEDIN_LS_KEY);
  const resume    = p.resume_url      || readLocal(RESUME_URL_LS_KEY);
  const target    = readLocal(TARGET_COMPANY_KEY);

  const empConfirmedAt = p.company_updated_at || readLocal(COMPANY_CONFIRMED_KEY);
  const resumeUpdatedAt = p.resume_updated_at || null;

  // 1. Employment not set at all.
  if (!company && !role) {
    return {
      id: 'employment-add',
      kind: 'add',
      nav: 'profile',
      message: 'Add your company & role so the community can refer you.',
      ctaLabel: 'Add',
    };
  }

  // 2. No LinkedIn.
  if (!linkedin) {
    return {
      id: 'linkedin-add',
      kind: 'add',
      nav: 'profile',
      message: 'Add your LinkedIn so recruiters viewing the leaderboard can find you.',
      ctaLabel: 'Add',
    };
  }

  // 3. No target company set (drives the readiness countdown).
  if (!target) {
    return {
      id: 'target-add',
      kind: 'add',
      nav: 'progress',
      message: 'Set a target company to focus your prep and track readiness toward it.',
      ctaLabel: 'Set target',
    };
  }

  // 4. No résumé uploaded.
  if (!resume) {
    return {
      id: 'resume-add',
      kind: 'add',
      nav: 'profile',
      message: 'Upload your résumé so recruiters viewing your profile can reach you.',
      ctaLabel: 'Add',
    };
  }

  // 5. Employment present but stale (quarterly re-confirm).
  if (isOlderThan(empConfirmedAt, EMPLOYMENT_STALE_MS)) {
    const where = role ? (company ? role + ' at ' + company : role) : company;
    return {
      id: 'employment-stale',
      kind: 'confirm',
      nav: 'profile',
      message: 'Still ' + (role ? '' : 'at ') + where + '? Keep it current so the community can refer you.',
      ctaLabel: 'Still accurate',
    };
  }

  // 6. Résumé present but stale (refresh ~every 6 months).
  if (isOlderThan(resumeUpdatedAt, RESUME_STALE_MS)) {
    return {
      id: 'resume-stale',
      kind: 'add',
      nav: 'profile',
      message: 'Time to refresh your résumé? A current one helps recruiters take you seriously.',
      ctaLabel: 'Refresh',
    };
  }

  return null;
}
