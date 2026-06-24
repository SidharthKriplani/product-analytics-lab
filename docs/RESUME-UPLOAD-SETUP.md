# Résumé upload — Supabase setup

The résumé feature lets a signed-in user attach a PDF résumé to their public
profile (`#/u/<id>`). It **degrades gracefully**: the feature ships safe and does
nothing harmful until the bucket and columns below exist. This doc is the one-time
setup to turn it on.

## What the feature does

- ProfilePage shows a **Résumé** section: a PDF picker + Upload button, a
  "View résumé" link when set, and a Remove option.
- On upload, the file goes to the Storage bucket **`resumes`** at path
  `${userId}/resume.pdf` (upsert), and the resulting URL is written to
  `leaderboard.resume_url` (+ `resume_updated_at`).
- PublicProfile renders a **"View résumé →"** button in the hero (next to
  LinkedIn) whenever `resume_url` is present. Résumé visibility is opt-in by
  virtue of the user choosing to upload — no separate visibility flag.

## Graceful degradation (before setup)

`src/utils/resume.js` never throws. It returns a reason instead:

| Condition | Returned reason | UI shows |
|---|---|---|
| Supabase not configured | `no-backend` | "Saved locally — syncing soon." |
| Bucket `resumes` missing | `storage-pending` | "Saved locally — syncing soon." |
| `resume_url` column missing | `migration-pending` | "Saved locally — syncing soon." |
| Not a PDF / over 5MB | `invalid-file` | "Please choose a PDF under 5MB." |
| Success | `ok` | "Saved. Recruiters … can now download your résumé." |

A localStorage flag (`pal-resume-url-v1`) remembers the URL so the value persists
across reloads pre-migration.

## Setup steps

### 1. Add the DB columns

Run `docs/migrations/2026-06_public_profiles.sql` in the Supabase SQL editor
(idempotent — safe to re-run). It adds, among others:

```sql
alter table leaderboard
  add column if not exists resume_url        text,
  add column if not exists resume_updated_at timestamptz;
```

### 2. Create the Storage bucket

Dashboard → **Storage** → **New bucket**

- **Name:** `resumes`
- **Public:** **ON** (simplest — résumés are reachable via a public URL on the
  public profile). If you prefer a private bucket, leave Public **OFF**;
  `uploadResume()` automatically falls back to a 1-year signed URL.

### 3. Add the Storage RLS policies

Run in the SQL editor (these operate on `storage.objects`). Each user may
upload/update/delete only objects under their own `${uid}/...` prefix; résumés
are readable for the public profile:

```sql
-- Read (skip if bucket is Public ON and you use public URLs)
create policy "Public read resumes"
  on storage.objects for select
  using ( bucket_id = 'resumes' );

-- Upload only into own folder
create policy "Users upload own resume"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Overwrite (upsert) own résumé
create policy "Users update own resume"
  on storage.objects for update
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete own résumé
create policy "Users delete own resume"
  on storage.objects for delete
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

### 4. Verify

1. Sign in, go to Profile → Résumé, upload a PDF. Status should read
   **"Saved. Recruiters viewing your profile can now download your résumé."**
2. Open your public profile (`#/u/<your-id>`). A **"View résumé →"** button
   should appear in the hero.

Until steps 1–3 are done, uploads simply fall back to "Saved locally — syncing
soon" and nothing breaks.
