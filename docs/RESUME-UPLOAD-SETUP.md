# Résumé setup — OBSOLETE

Résumé is now a pasted link (written to `leaderboard.resume_url`), not a file upload. No Storage bucket or bucket policies are needed — just run `docs/migrations/2026-06_public_profiles.sql` for the `resume_url` / `resume_updated_at` columns.
