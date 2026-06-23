-- ─────────────────────────────────────────────────────────────────────────
-- PAL Study Room — Supabase Migration
-- Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────

-- ── 1. study_cards ────────────────────────────────────────────────────────
-- Static card content. Readable by any authenticated user.
-- Never ships in the frontend bundle — fetched at runtime after auth.

create table if not exists public.study_cards (
  id          uuid primary key default gen_random_uuid(),
  topic       text not null,     -- 'experimentation' | 'statistics' | 'metrics' | 'sql' | 'causal_inference' | 'product'
  subtopic    text not null,     -- e.g. 'ab_basics' | 'sample_size_power' | 'multiple_testing'
  front       text not null,     -- question / prompt
  back        text not null,     -- answer (may contain markdown)
  card_type   text not null default 'fact',    -- 'fact' | 'formula' | 'trap' | 'pattern'
  source      text not null default 'manual',  -- 'viltrumite' | 'lane8_experimentation' | 'manual'
  priority    int  not null default 1,         -- 0=core, 1=important, 2=supplementary
  created_at  timestamptz not null default now()
);

create index if not exists study_cards_topic_idx on public.study_cards (topic);

alter table public.study_cards enable row level security;

create policy "Authenticated users can read study cards"
  on public.study_cards for select
  to authenticated
  using (true);

-- Only service role can insert/update/delete (via seed script or dashboard)


-- ── 2. study_reviews ──────────────────────────────────────────────────────
-- Per-user SRS scheduling state. One row per (user, card).

create table if not exists public.study_reviews (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  card_id       uuid not null references public.study_cards(id) on delete cascade,
  due_date      date not null default current_date,
  interval_days int  not null default 1,
  ease_factor   float not null default 2.5,
  reps          int  not null default 0,
  lapses        int  not null default 0,
  state         text not null default 'new',   -- 'new' | 'learning' | 'review'
  last_reviewed timestamptz,

  unique (user_id, card_id)
);

create index if not exists study_reviews_user_due_idx
  on public.study_reviews (user_id, due_date);

alter table public.study_reviews enable row level security;

create policy "Users can read own reviews"
  on public.study_reviews for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own reviews"
  on public.study_reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.study_reviews for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.study_reviews for delete
  to authenticated
  using (auth.uid() = user_id);


-- ── 3. study_notes ────────────────────────────────────────────────────────

create table if not exists public.study_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  card_id    uuid not null references public.study_cards(id) on delete cascade,
  content    text not null default '',
  updated_at timestamptz not null default now(),

  unique (user_id, card_id)
);

alter table public.study_notes enable row level security;

create policy "Users can read own notes"
  on public.study_notes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on public.study_notes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.study_notes for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on public.study_notes for delete
  to authenticated
  using (auth.uid() = user_id);

-- After running: execute seed_study_cards.py to populate study_cards.
