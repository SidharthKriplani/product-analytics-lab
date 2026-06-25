-- ============================================================================
-- Migration: Last active (2026-06)
-- ----------------------------------------------------------------------------
-- Adds ONE optional column to the existing `leaderboard` table so that public
-- profiles (reached via #/u/<userId>) can show when a user was last active —
-- a public "Active 3h ago" signal. Last-active ONLY; no dwell/total-time
-- tracking is collected.
--
-- last_active_at: bumped to now() whenever the signed-in user opens the app or
--                 backgrounds the tab (App.jsx auth + visibilitychange paths,
--                 via leaderboard.js touchLastActive()). Distinct from
--                 updated_at, which moves on any leaderboard write (e.g. solves).
--
-- The application DEGRADES GRACEFULLY before this runs:
--   * touchLastActive() silently no-ops if the column is absent (the upsert
--     fails with an unknown-column error, which is swallowed).
--   * fetchPublicProfile() selects last_active_at in its rich column set and
--     retries with the base columns if it (or any rich column) is absent.
--   * PublicProfile falls back to the member-since date when last_active_at is
--     null, so the badge always renders something sensible.
-- Running this migration simply lets the value persist + display server-side.
--
-- RLS: the leaderboard is already publicly readable and each user writes only
-- their own row. Postgres RLS here is row-scoped, so it automatically covers
-- the new column — NO new policy is required.
--
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent).
-- ============================================================================

alter table leaderboard
  add column if not exists last_active_at timestamptz;

-- Optional: index for any future "recently active" sort. Cheap, idempotent.
create index if not exists leaderboard_last_active_idx
  on leaderboard (last_active_at desc);

-- ============================================================================
-- End migration.
-- ============================================================================
