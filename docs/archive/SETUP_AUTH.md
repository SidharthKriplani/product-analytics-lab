# Auth Setup Guide — PAL Supabase Integration

PAL uses Supabase for optional authentication and cross-device progress sync.
The app works identically without these env vars set — auth features are simply hidden.

---

## Step 1: Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.
Note your **Project URL** and **anon public key** from Settings → API.

---

## Step 2: Run the database schema

In the Supabase SQL editor, run:

```sql
create table user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null,
  value jsonb not null,
  updated_at timestamptz default now(),
  unique(user_id, key)
);

alter table user_progress enable row level security;

create policy "Users can manage own progress" on user_progress
  for all using (auth.uid() = user_id);
```

---

## Step 3: Enable Google OAuth (optional)

1. Go to Supabase → Authentication → Providers → Google
2. Enable Google and follow the prompts to set up a Google Cloud OAuth client
3. Add `https://<your-supabase-project>.supabase.co/auth/v1/callback` as an authorized redirect URI in Google Cloud Console
4. Paste your Google Client ID and Secret back into Supabase

Magic link (email) auth works out of the box with no extra configuration.

---

## Step 4: Add env vars for local development

Create `.env.local` in the repo root (this file is gitignored):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Then run `npm run dev` as usual.

---

## Step 5: Add env vars in Vercel

In your Vercel project → Settings → Environment Variables, add:

| Name                   | Value                                          |
|------------------------|------------------------------------------------|
| VITE_SUPABASE_URL      | https://your-project-ref.supabase.co          |
| VITE_SUPABASE_ANON_KEY | your-anon-key-here                             |

Redeploy after adding the vars.

---

## How it works

- On sign-in, PAL pulls the user's progress from Supabase and merges it into localStorage.
- On sign-in, progress is also pushed from localStorage to Supabase so the two are in sync.
- If the env vars are not set, the supabase client is null and all auth calls return early — no errors, no broken UI.
- The sign-in button appears in the sidebar. After sign-in, the user's email initial is shown as an avatar with a sign-out option.
