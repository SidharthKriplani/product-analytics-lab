// Community feed — referrals / questions / wins, posted by signed-in users.
//
// Two tables back this (see docs/migrations/2026-06_feed.sql):
//   feed_posts   — one row per post, with author_* fields DENORMALIZED at write
//                  time so the feed renders without a join to the leaderboard.
//   feed_upvotes — one (post_id, user_id) row per upvote; the running count is
//                  mirrored onto feed_posts.upvotes for cheap reads.
//
// Everything here DEGRADES GRACEFULLY, mirroring src/utils/leaderboard.js:
//   * If Supabase is not configured (no env vars) → supabase is null → reads
//     return [] / 0 and writes return { ok:false, reason:'no-backend' }.
//   * If the migration has not run yet (tables/columns absent) → the PostgREST
//     "relation/column does not exist" error is detected and surfaced as
//     { ok:false, reason:'migration-pending' } (writes) or [] (reads). Never throws.
//
// Points (used for the profile tally) = posts*5 + upvotes_received*1. Simple by
// design; points → discount is a FUTURE phase (see migration footer).

import { supabase } from './supabase.js';
import { getDisplayName } from './leaderboard.js';

const POST_TYPES = ['referral', 'question', 'win'];
const BODY_MAX = 2000;

// Points weights — kept here so the migration's documentation and the profile
// tally agree on one source of truth.
const POINTS_PER_POST = 5;
const POINTS_PER_UPVOTE_RECEIVED = 1;

// ── Error classification ──────────────────────────────────────────────────────
// Detect a "table/relation does not exist" or "column not found" error from
// PostgREST/Postgres so callers can fall back to the pre-migration experience
// (an honest "coming soon" state) instead of crashing.
function isMissingRelationError(error) {
  if (!error) return false;
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  // 42P01 = undefined_table; 42703 = undefined_column;
  // PGRST205 = table not found in schema cache; PGRST204 = column not found.
  return code === '42P01' || code === '42703'
    || code === 'PGRST205' || code === 'PGRST204'
    || (msg.includes('does not exist') && (msg.includes('relation') || msg.includes('table') || msg.includes('column')))
    || msg.includes('not found in') && msg.includes('schema cache');
}

// ── Author denormalization ────────────────────────────────────────────────────
// Build the author_* payload stamped onto each post. Pulls company/role from the
// caller (passed in) or, failing that, from the user's localStorage employment
// fallback (the same keys ProfilePage / leaderboard.js write). Avatar + name come
// from OAuth metadata.
const COMPANY_LS_KEY = 'pal-company-v1';
const ROLE_LS_KEY    = 'pal-role-v1';

function localEmployment() {
  let company = '';
  let role = '';
  try { company = localStorage.getItem(COMPANY_LS_KEY) || ''; } catch { /* ignore */ }
  try { role = localStorage.getItem(ROLE_LS_KEY) || ''; } catch { /* ignore */ }
  return { company, role };
}

function authorFields(user, overrides = {}) {
  const local = localEmployment();
  return {
    author_name:    getDisplayName(user),
    author_avatar:  user?.user_metadata?.avatar_url || null,
    author_company: (overrides.company ?? local.company) || null,
    author_role:    (overrides.role ?? local.role) || null,
  };
}

// ── Reads ─────────────────────────────────────────────────────────────────────

// Fetch the feed, newest first. Optionally filter by post type. Returns [] when
// there is no backend or the table is absent — never throws.
export async function fetchFeed({ type, limit = 50 } = {}) {
  if (!supabase) return [];
  try {
    let query = supabase
      .from('feed_posts')
      .select('id, user_id, author_name, author_avatar, author_company, author_role, type, body, target_company, upvotes, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (type && POST_TYPES.includes(type)) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) {
      if (!isMissingRelationError(error)) console.warn('[PAL feed] fetch failed:', error.message);
      return [];
    }
    return data || [];
  } catch (e) {
    console.warn('[PAL feed] fetch threw:', e && e.message);
    return [];
  }
}

// Which posts has THIS user already upvoted (so the UI can render the toggle in
// its active state)? Returns a Set of post ids. [] / empty Set on any failure.
export async function fetchMyUpvotes(user, postIds = []) {
  const empty = new Set();
  if (!supabase || !user || postIds.length === 0) return empty;
  try {
    const { data, error } = await supabase
      .from('feed_upvotes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds);
    if (error) {
      if (!isMissingRelationError(error)) console.warn('[PAL feed] upvotes fetch failed:', error.message);
      return empty;
    }
    return new Set((data || []).map(r => r.post_id));
  } catch (e) {
    console.warn('[PAL feed] upvotes fetch threw:', e && e.message);
    return empty;
  }
}

// ── Writes ────────────────────────────────────────────────────────────────────

// Create a post. Validates body (1..2000 chars) and type. Denormalizes author_*
// from the user (company/role pulled from overrides or the localStorage fallback).
// Returns { ok:true, post } on success, or a guarded
// { ok:false, reason:'invalid'|'no-backend'|'migration-pending'|'error' }.
export async function createPost(user, { type, body, targetCompany, company, role } = {}) {
  const text = String(body || '').trim();
  if (!POST_TYPES.includes(type)) return { ok: false, reason: 'invalid' };
  if (text.length < 1 || text.length > BODY_MAX) return { ok: false, reason: 'invalid' };
  if (!supabase || !user) return { ok: false, reason: 'no-backend' };

  const row = {
    user_id: user.id,
    ...authorFields(user, { company, role }),
    type,
    body: text,
    target_company: (targetCompany || '').trim() || null,
    upvotes: 0,
  };

  try {
    const { data, error } = await supabase
      .from('feed_posts')
      .insert(row)
      .select('id, user_id, author_name, author_avatar, author_company, author_role, type, body, target_company, upvotes, created_at')
      .single();
    if (error) {
      if (isMissingRelationError(error)) return { ok: false, reason: 'migration-pending' };
      console.warn('[PAL feed] createPost failed:', error.message);
      return { ok: false, reason: 'error' };
    }
    return { ok: true, post: data };
  } catch (e) {
    console.warn('[PAL feed] createPost threw:', e && e.message);
    return { ok: false, reason: 'error' };
  }
}

// Toggle the current user's upvote on a post. Best-effort: inserts/deletes the
// feed_upvotes row, then nudges feed_posts.upvotes so reads stay cheap. Returns
// { ok:true, upvoted, delta } so the caller can update its local count, or a
// guarded { ok:false, reason } on any failure. Never throws.
export async function toggleUpvote(user, postId) {
  if (!supabase || !user) return { ok: false, reason: 'no-backend' };
  if (!postId) return { ok: false, reason: 'invalid' };

  try {
    // Is it already upvoted by this user?
    const { data: existing, error: selErr } = await supabase
      .from('feed_upvotes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (selErr) {
      if (isMissingRelationError(selErr)) return { ok: false, reason: 'migration-pending' };
      console.warn('[PAL feed] upvote select failed:', selErr.message);
      return { ok: false, reason: 'error' };
    }

    if (existing) {
      // Remove the upvote.
      const { error: delErr } = await supabase
        .from('feed_upvotes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      if (delErr) {
        if (isMissingRelationError(delErr)) return { ok: false, reason: 'migration-pending' };
        console.warn('[PAL feed] upvote delete failed:', delErr.message);
        return { ok: false, reason: 'error' };
      }
      await adjustUpvoteCount(postId, -1);
      return { ok: true, upvoted: false, delta: -1 };
    }

    // Add the upvote.
    const { error: insErr } = await supabase
      .from('feed_upvotes')
      .insert({ post_id: postId, user_id: user.id });
    if (insErr) {
      if (isMissingRelationError(insErr)) return { ok: false, reason: 'migration-pending' };
      console.warn('[PAL feed] upvote insert failed:', insErr.message);
      return { ok: false, reason: 'error' };
    }
    await adjustUpvoteCount(postId, 1);
    return { ok: true, upvoted: true, delta: 1 };
  } catch (e) {
    console.warn('[PAL feed] toggleUpvote threw:', e && e.message);
    return { ok: false, reason: 'error' };
  }
}

// Best-effort, non-atomic count nudge on feed_posts.upvotes. Reads then writes;
// good enough for v1 (a future phase can move this to a DB trigger / rpc for
// true atomicity). Swallows all errors — the upvote row is the source of truth.
async function adjustUpvoteCount(postId, delta) {
  try {
    const { data, error } = await supabase
      .from('feed_posts')
      .select('upvotes')
      .eq('id', postId)
      .maybeSingle();
    if (error || !data) return;
    const next = Math.max(0, (data.upvotes || 0) + delta);
    await supabase.from('feed_posts').update({ upvotes: next }).eq('id', postId);
  } catch { /* best-effort */ }
}

// Report a post. v1 STUB — records intent only (console marker). Full moderation
// (a feed_reports table + admin review queue) is a future phase. Never throws;
// always returns { ok:true } so the UI can show a calm "thanks, we'll review it".
// TODO(moderation): persist to a feed_reports table and wire an admin review queue.
export async function reportPost(postId, reason) {
  try {
    console.warn('[PAL feed] report intent recorded (stub):', { postId, reason: reason || null });
  } catch { /* ignore */ }
  return { ok: true };
}

// ── Points ────────────────────────────────────────────────────────────────────

// Pure helper — points formula in one place. posts*5 + upvotes_received*1.
export function computePoints({ postCount = 0, upvotesReceived = 0 } = {}) {
  return (postCount * POINTS_PER_POST) + (upvotesReceived * POINTS_PER_UPVOTE_RECEIVED);
}

// The signed-in user's points tally for their profile. Counts their posts and
// sums the upvotes their posts have received. Guarded → returns
// { points:0, postCount:0, upvotesReceived:0 } on no-backend / migration-pending /
// any error. Never throws.
export async function getMyPoints(user) {
  const zero = { points: 0, postCount: 0, upvotesReceived: 0 };
  if (!supabase || !user) return zero;
  try {
    const { data, error } = await supabase
      .from('feed_posts')
      .select('upvotes')
      .eq('user_id', user.id);
    if (error) {
      if (!isMissingRelationError(error)) console.warn('[PAL feed] getMyPoints failed:', error.message);
      return zero;
    }
    const rows = data || [];
    const postCount = rows.length;
    const upvotesReceived = rows.reduce((sum, r) => sum + (r.upvotes || 0), 0);
    return { points: computePoints({ postCount, upvotesReceived }), postCount, upvotesReceived };
  } catch (e) {
    console.warn('[PAL feed] getMyPoints threw:', e && e.message);
    return zero;
  }
}

// Exported for the page (tab config) and any future caller.
export const FEED_TYPES = POST_TYPES;
export const FEED_BODY_MAX = BODY_MAX;
