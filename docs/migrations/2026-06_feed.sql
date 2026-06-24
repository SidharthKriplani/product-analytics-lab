-- ============================================================================
-- Migration: Community feed (2026-06)
-- ----------------------------------------------------------------------------
-- Creates the two tables behind the Community feed (Referrals / Questions / Wins):
--   * feed_posts   — one row per post, with author_* fields DENORMALIZED at
--                    write time so the feed renders without a join.
--   * feed_upvotes — one (post_id, user_id) row per upvote; the running count is
--                    mirrored onto feed_posts.upvotes for cheap reads.
--
-- The application DEGRADES GRACEFULLY before this runs (see src/utils/feed.js):
--   * fetchFeed() / getMyPoints() return [] / 0 if the table is absent.
--   * createPost() / toggleUpvote() return { ok:false, reason:'migration-pending' }
--     (caught from the PostgREST "relation does not exist" error) instead of
--     throwing, and the Community page shows an honest "coming soon" state.
-- Running this migration simply lets posts + upvotes persist server-side.
--
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent).
-- ============================================================================

-- 1. feed_posts -------------------------------------------------------------
-- id:             post primary key.
-- user_id:        the author (FK to auth.users; their row is deleted with them).
-- author_name:    denormalized display name at post time (from OAuth metadata).
-- author_avatar:  denormalized OAuth avatar URL at post time (nullable).
-- author_company: denormalized current company at post time (nullable) — a
--                 canonical value from src/data/companyList.js COMPANIES.
-- author_role:    denormalized current role at post time (nullable).
-- type:           one of 'referral' | 'question' | 'win' (the three streams).
-- body:           the post text (1..2000 chars; length enforced app-side and here).
-- target_company: optional company the post is ABOUT (e.g. a referral target),
--                 again a canonical COMPANIES value (nullable).
-- upvotes:        cached count, kept in sync with feed_upvotes by the app (best
--                 effort in v1; a future phase may move this to a DB trigger).
-- created_at:     post time; the feed is ordered by this, newest first.
create table if not exists feed_posts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  author_name    text,
  author_avatar  text,
  author_company text,
  author_role    text,
  type           text not null check (type in ('referral', 'question', 'win')),
  body           text not null check (char_length(body) between 1 and 2000),
  target_company text,
  upvotes        int  not null default 0,
  created_at     timestamptz default now()
);

-- Index the two columns the feed orders / filters on.
create index if not exists feed_posts_created_at_idx on feed_posts (created_at desc);
create index if not exists feed_posts_type_idx       on feed_posts (type);
create index if not exists feed_posts_user_id_idx     on feed_posts (user_id);

-- 2. feed_upvotes -----------------------------------------------------------
-- One row per (post, user). The composite primary key makes an upvote naturally
-- idempotent — a user can upvote a post at most once. Deleting a post or a user
-- cascades the corresponding upvote rows away.
create table if not exists feed_upvotes (
  post_id uuid references feed_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

create index if not exists feed_upvotes_user_id_idx on feed_upvotes (user_id);

-- 3. Row Level Security -----------------------------------------------------
-- feed_posts:   public read (anyone can browse the feed); a signed-in user may
--               INSERT only their own post (auth.uid() = user_id). Updates to the
--               cached `upvotes` count are also limited to... see note below.
-- feed_upvotes: a signed-in user may INSERT / DELETE only their own upvote rows
--               (auth.uid() = user_id); public read so counts/own-state resolve.
--
-- NOTE on the upvotes count column: in v1 the author is NOT the one who bumps
-- the count (any voter does), so a strict "update own row only" policy would
-- block the count nudge. We therefore allow authenticated users to UPDATE the
-- feed_posts.upvotes mirror. This is acceptable for v1 (the feed_upvotes rows
-- are the source of truth); a future phase should replace the app-side nudge
-- with a SECURITY DEFINER trigger/rpc and drop this broad update policy.
alter table feed_posts   enable row level security;
alter table feed_upvotes enable row level security;

-- feed_posts: public read.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feed_posts'
      and policyname = 'Public read feed_posts'
  ) then
    create policy "Public read feed_posts" on feed_posts
      for select using (true);
  end if;

  -- feed_posts: a user inserts only their own post.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feed_posts'
      and policyname = 'Users insert own post'
  ) then
    create policy "Users insert own post" on feed_posts
      for insert with check (auth.uid() = user_id);
  end if;

  -- feed_posts: any authenticated user may bump the cached upvote count (see note).
  -- A future phase replaces this with a trigger and removes the policy.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feed_posts'
      and policyname = 'Authed update upvote count'
  ) then
    create policy "Authed update upvote count" on feed_posts
      for update using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;

  -- feed_upvotes: public read (resolve counts + the viewer's own upvote state).
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feed_upvotes'
      and policyname = 'Public read feed_upvotes'
  ) then
    create policy "Public read feed_upvotes" on feed_upvotes
      for select using (true);
  end if;

  -- feed_upvotes: a user inserts only their own upvote.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feed_upvotes'
      and policyname = 'Users insert own upvote'
  ) then
    create policy "Users insert own upvote" on feed_upvotes
      for insert with check (auth.uid() = user_id);
  end if;

  -- feed_upvotes: a user deletes only their own upvote.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feed_upvotes'
      and policyname = 'Users delete own upvote'
  ) then
    create policy "Users delete own upvote" on feed_upvotes
      for delete using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================================
-- FUTURE PHASES (not in this migration):
--   * Points → discount: points = posts*5 + upvotes_received*1 (computed in
--     src/utils/feed.js getMyPoints). A later migration may materialize a
--     points column / view and a redemption ledger to convert points to a
--     Stripe discount once paid plans go live.
--   * Moderation: a feed_reports table + admin review queue (reportPost() is a
--     stub in v1 that only records intent client-side).
--   * Atomic upvote counts: replace the app-side count nudge + broad update
--     policy with a SECURITY DEFINER trigger on feed_upvotes.
-- ============================================================================
-- End migration.
-- ============================================================================
