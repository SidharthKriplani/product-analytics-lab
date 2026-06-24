// Résumé upload — lets a signed-in user attach a PDF résumé to their public
// profile. Stored in the Supabase Storage bucket 'resumes' at `${uid}/resume.pdf`;
// the public URL is written to leaderboard.resume_url (+ resume_updated_at).
//
// DEGRADES GRACEFULLY, mirroring updateMyLinkedin/updateMyEmployment:
//   * supabase missing                 -> { ok:false, reason:'no-backend' }
//   * bucket 'resumes' does not exist  -> { ok:false, reason:'storage-pending' }
//   * resume_url column is missing     -> { ok:false, reason:'migration-pending' }
//                                         (the file uploaded, only the column write failed)
//   * file is not a PDF / too large    -> { ok:false, reason:'invalid-file' }
// A localStorage fallback flag is written on any successful upload so the UI can
// reflect "you have a résumé" even before the column exists.
//
// Setup the bucket + policies once: see docs/RESUME-UPLOAD-SETUP.md.

import { supabase } from './supabase.js';
import { getDisplayName, computeTotalSolved } from './leaderboard.js';

export const RESUME_BUCKET = 'resumes';
export const RESUME_MAX_BYTES = 5 * 1024 * 1024; // 5MB

// localStorage fallback — remembers that a résumé was uploaded and its URL, so
// the value survives reloads before the migration runs.
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

// Detect a "bucket not found" Storage error so we can return 'storage-pending'
// instead of throwing when the bucket has not been created yet.
function isMissingBucketError(error) {
  if (!error) return false;
  const status = error.status || error.statusCode || '';
  const msg = (error.message || '').toLowerCase();
  return String(status) === '404'
    || msg.includes('bucket not found')
    || msg.includes('not found')
    || msg.includes('does not exist');
}

// Read the cached résumé URL (no-network source of truth before a fetch).
export function getLocalResumeUrl() {
  try { return localStorage.getItem(RESUME_URL_LS_KEY) || ''; }
  catch { return ''; }
}

// Validate that a File is a PDF and within the size limit. Returns true/false.
function isValidResumeFile(file) {
  if (!file) return false;
  const name = (file.name || '').toLowerCase();
  const type = (file.type || '').toLowerCase();
  const looksPdf = type === 'application/pdf' || name.endsWith('.pdf');
  if (!looksPdf) return false;
  if (typeof file.size === 'number' && file.size > RESUME_MAX_BYTES) return false;
  return true;
}

// Upload a résumé PDF and attach its URL to the user's leaderboard row.
// Returns { ok:true, url } on success, else { ok:false, reason }.
export async function uploadResume(user, file) {
  if (!isValidResumeFile(file)) return { ok: false, reason: 'invalid-file' };
  if (!supabase || !user) return { ok: false, reason: 'no-backend' };

  const path = user.id + '/resume.pdf';

  // 1. Upload (upsert) into the 'resumes' bucket.
  try {
    const { error: upErr } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(path, file, { upsert: true, contentType: 'application/pdf' });
    if (upErr) {
      if (isMissingBucketError(upErr)) return { ok: false, reason: 'storage-pending' };
      console.warn('[PAL resume] upload failed:', upErr.message);
      return { ok: false, reason: 'error' };
    }
  } catch (e) {
    console.warn('[PAL resume] upload threw:', e && e.message);
    return { ok: false, reason: 'error' };
  }

  // 2. Resolve a URL. Prefer the public URL (bucket public); fall back to a
  //    long-lived signed URL if the bucket is private.
  let url = null;
  try {
    const { data: pub } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(path);
    url = pub && pub.publicUrl ? pub.publicUrl : null;
  } catch { /* ignore */ }
  if (!url) {
    try {
      const { data: signed } = await supabase.storage
        .from(RESUME_BUCKET)
        .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year
      url = signed && signed.signedUrl ? signed.signedUrl : null;
    } catch { /* ignore */ }
  }

  // Always keep a local copy so the value persists pre-migration.
  if (url) { try { localStorage.setItem(RESUME_URL_LS_KEY, url); } catch { /* ignore */ } }

  // 3. Write resume_url (+ resume_updated_at) onto the leaderboard row.
  const now = new Date().toISOString();
  const row = {
    user_id: user.id,
    display_name: getDisplayName(user),
    total_solved: computeTotalSolved(),
    resume_url: url,
    resume_updated_at: now,
    updated_at: now,
  };
  try {
    const { error } = await supabase.from('leaderboard').upsert(row, { onConflict: 'user_id' });
    if (!error) return { ok: true, url };
    // File is uploaded; only the column write failed. Surface as migration-pending
    // so the UI shows "saved locally — syncing soon" rather than an error.
    if (isMissingColumnError(error)) return { ok: false, reason: 'migration-pending', url };
    console.warn('[PAL resume] resume_url upsert failed:', error.message);
    return { ok: false, reason: 'error', url };
  } catch (e) {
    console.warn('[PAL resume] resume_url upsert threw:', e && e.message);
    return { ok: false, reason: 'error', url };
  }
}

// Remove the current user's résumé: clear resume_url and best-effort delete the
// storage object. Returns { ok, reason }. Guarded the same way as upload.
export async function removeMyResume(user) {
  try { localStorage.removeItem(RESUME_URL_LS_KEY); } catch { /* ignore */ }
  if (!supabase || !user) return { ok: false, reason: 'no-backend' };

  // Best-effort delete of the storage object (ignore failures — clearing the
  // URL is what matters for the profile).
  try {
    await supabase.storage.from(RESUME_BUCKET).remove([user.id + '/resume.pdf']);
  } catch { /* ignore */ }

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
