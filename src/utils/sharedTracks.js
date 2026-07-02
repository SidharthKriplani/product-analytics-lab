// sharedTracks.js — Supabase-backed track sharing for PAL.
// share_id = the local track id (short alphanumeric string).
// RLS: owner can manage; public can SELECT (anyone with link can view).

import { supabase } from './supabase.js';

/**
 * Publish (or re-sync) a local track to the shared_tracks table.
 * Safe to call multiple times — upserts on share_id.
 * Returns { shareId, shareUrl }.
 */
export async function shareTrack(track, userId) {
  if (!supabase) throw new Error('Supabase not configured');

  const shareId = track.id;

  const { error } = await supabase
    .from('shared_tracks')
    .upsert(
      {
        user_id:    userId,
        name:       track.name,
        items:      track.items,
        share_id:   shareId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'share_id' }
    );

  if (error) throw error;

  const shareUrl =
    window.location.origin +
    window.location.pathname.replace(/\/$/, '') +
    '#/shared/' + shareId;

  return { shareId, shareUrl };
}

/**
 * Fetch a shared track by share_id.
 * Requires no auth — public RLS policy allows SELECT.
 * Returns { name, items, created_at } or throws.
 */
export async function fetchSharedTrack(shareId) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('shared_tracks')
    .select('name, items, created_at')
    .eq('share_id', shareId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove a shared track. Supabase RLS ensures only the owner can delete.
 */
export async function unshareTrack(shareId) {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('shared_tracks')
    .delete()
    .eq('share_id', shareId);

  if (error) throw error;
}
