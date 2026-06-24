-- ============================================================================
-- Migration: Public profiles (2026-06)
-- ----------------------------------------------------------------------------
-- Adds OPTIONAL columns to the existing `leaderboard` table so that clickable
-- public profiles (reached via #/u/<userId>) can show a LinkedIn link, a
-- per-room solved breakdown, and the user's current employment (company + role)
-- which doubles as the referral payload + the monthly "is this still current?"
-- reminder.
--
-- The application is written to DEGRADE GRACEFULLY before this runs:
--   * fetchPublicProfile() selects the rich columns first (incl. current_company,
--     current_role, company_updated_at) and retries with the base columns if any
--     are absent.
--   * updateMyLinkedin() / updateMyEmployment() / confirmMyEmployment() return
--     { ok:false, reason:'migration-pending' } (and the UI falls back to
--     localStorage) if their columns are missing.
--   * upsertLeaderboardRow() retries without room_breakdown / linkedin_url if
--     those columns do not exist.
-- Running this migration simply lets those values persist server-side.
--
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent).
-- ============================================================================

-- 1. New columns ------------------------------------------------------------
-- linkedin_url:       the user's LinkedIn profile URL (nullable, optional).
-- room_breakdown:     a small JSON map of { roomId: solvedCount }, e.g.
--                     { "stats": 8, "sql-lab": 23, "rca": 4 }.
-- current_company:    the user's current employer, a canonical value from
--                     src/data/companyList.js COMPANIES (nullable, optional).
-- current_role:       the user's current role, from PROFILE_ROLES (nullable).
-- company_updated_at: when the employment was last set/confirmed. The monthly
--                     in-app reminder shows when this is null or older than 30
--                     days; the "Still accurate" button bumps it to now().
-- email_reminded_at:  when the monthly EMAIL reminder edge function last emailed
--                     this user (throttle so it never double-sends in a cycle).
--                     Used only by supabase/functions/employment-reminder.
alter table leaderboard
  add column if not exists linkedin_url       text,
  add column if not exists room_breakdown     jsonb,
  add column if not exists current_company    text,
  add column if not exists current_role       text,
  add column if not exists company_updated_at timestamptz,
  add column if not exists email_reminded_at  timestamptz;

-- 2. Row Level Security -----------------------------------------------------
-- The leaderboard is ALREADY publicly readable. The original schema created:
--   create policy "Public read leaderboard" on leaderboard for select using (true);
--   create policy "Users upsert own row" on leaderboard
--     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
--
-- Those policies operate at the ROW level and automatically cover any new
-- columns (Postgres RLS is not column-scoped here). The public profile page
-- reads the same rows the leaderboard already exposes, and each user still
-- only writes their own row — including the new linkedin_url / room_breakdown.
--
-- => NO NEW RLS POLICY IS REQUIRED for public profile reads or for users
--    updating their own LinkedIn / breakdown. The existing policies suffice.
--
-- The block below is a DEFENSIVE no-op that (re)asserts those two policies in
-- case this is run against an environment where they were never created.
-- It is safe to leave commented out if your policies already exist.

-- alter table leaderboard enable row level security;
--
-- do $$
-- begin
--   if not exists (
--     select 1 from pg_policies
--     where schemaname = 'public' and tablename = 'leaderboard'
--       and policyname = 'Public read leaderboard'
--   ) then
--     create policy "Public read leaderboard" on leaderboard
--       for select using (true);
--   end if;
--
--   if not exists (
--     select 1 from pg_policies
--     where schemaname = 'public' and tablename = 'leaderboard'
--       and policyname = 'Users upsert own row'
--   ) then
--     create policy "Users upsert own row" on leaderboard
--       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
--   end if;
-- end $$;

-- ============================================================================
-- End migration.
-- ============================================================================
