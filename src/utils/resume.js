// Résumé link — lets a signed-in user attach a résumé URL (Google Drive,
// Dropbox, personal site, etc.) to their public profile. The URL is written to
// leaderboard.resume_url (+ resume_updated_at). No file hosting, no Storage
// bucket — the user pastes a link they already host.
//
// DEGRADES GRACEFULLY, mirroring updateMyLinkedin/updateMyEmployment:
//   * supabase missing                 -> { ok:false, reason:'no-backend' }
//   * resume_url column is missing     -> { ok:false, reason:'migration-pending' }
//   * url is not a plausible http(s)   -> { ok:false, reason:'invalid' }
// A localStorage fallback ('pal-resume-url-v1') is always written so the value
// survives reloads before the migration runs.

import { supabase } from './supabase.js';
import { getDisplayName, computeTotalSolved } from './leaderboard.js';

// localStorage fallback — remembers the résumé URL so the value survives reloads
// before the migration runs.
const RESUME_URL_LS_KEY = 'pal-resume-url-v1';

// Detect a "column does not exist" / unknown-column error (PostgREST/Postgres).
function isMissingColumnError(error) {
  if (!error) return false;
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  // 42703 = undefined_column (Postgres); PGRST204 = column not found in schema cache
  return code === '42703' || code === 'PGRST204'
    || (msg.includes('column') && (msg.includes('does not exist') || msg.includes('not found') || msg.includes('schema cache')));
}

// Read the cached résumé URL (no-network source of truth before a fetch).
export function getLocalResumeUrl() {
  try { return localStorage.getItem(RESUME_URL_LS_KEY) || ''; }
  catch { return ''; }
}

// Validate that a string is a plausible http(s) URL. Returns true/false.
function isValidResumeUrl(url) {
  if (!url) return false;
  const u = String(url).trim();
  if (!/^https?:\/\//i.test(u)) return false;
  try { new URL(u); return true; }
  catch { return false; }
}

// Save the current user's résumé URL onto their leaderboard row (+ stamp
// resume_updated_at = now). Returns { ok, reason }. Validates the URL first;
// always writes the localStorage fallback so the value persists regardless of
// the server result. Guarded exactly like updateMyLinkedin: missing column ->
// { ok:false, reason:'migration-pending' }; no backend -> 'no-backend'.
export async function setMyResumeLink(user, url) {
  const clean = (url || '').trim();
  if (!isValidResumeUrl(clean)) return { ok: false, reason: 'invalid' };

  // Always keep a local copy so the value persists across reloads pre-migration.
  try { localStorage.setItem(RESUME_URL_LS_KEY, clean); } catch { /* ignore */ }

  if (!supabase || !user) return { ok: false, reason: 'no-backend' };

  const now = new Date().toISOString();
  const row = {
    user_id: user.id,
    display_name: getDisplayName(user),
    total_solved: computeTotalSolved(),
    resume_url: clean,
    resume_updated_at: now,
    updated_at: now,
  };
  try {
    const { error } = await supabase.from('leaderboard').upsert(row, { onConflict: 'user_id' });
    if (!error) return { ok: true, url: clean };
    if (isMissingColumnError(error)) return { ok: false, reason: 'migration-pending', url: clean };
    console.warn('[PAL resume] resume_url upsert failed:', error.message);
    return { ok: false, reason: 'error', url: clean };
  } catch (e) {
    console.warn('[PAL resume] resume_url upsert threw:', e && e.message);
    return { ok: false, reason: 'error', url: clean };
  }
}

// Remove the current user's résumé link: clear resume_url + the localStorage
// fallback. No storage object to delete anymore. Returns { ok, reason };
// guarded the same way as setMyResumeLink.
export async function removeMyResume(user) {
  try { localStorage.removeItem(RESUME_URL_LS_KEY); } catch { /* ignore */ }
  if (!supabase || !user) return { ok: false, reason: 'no-backend' };

  const now = new Date().toISOString();
  const row = {
    user_id: user.id,
    display_name: getDisplayName(user),
    total_solved: computeTotalSolved(),
    resume_url: null,
    resume_updated_at: now,
    updated_at: now,
  };
  try {
    const { error } = await supabase.from('leaderboard').upsert(row, { onConflict: 'user_id' });
    if (!error) return { ok: true };
    if (isMissingColumnError(error)) return { ok: false, reason: 'migration-pending' };
    console.warn('[PAL resume] resume_url clear failed:', error.message);
    return { ok: false, reason: 'error' };
  } catch (e) {
    console.warn('[PAL resume] resume_url clear threw:', e && e.message);
    return { ok: false, reason: 'error' };
  }
}
