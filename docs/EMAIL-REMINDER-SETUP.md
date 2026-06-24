# Monthly company-reminder EMAIL — setup

The in-app nudge ships automatically. This is the optional EMAIL half (so people who don't visit still get reminded). It's a Supabase Edge Function you deploy + schedule. I can't deploy it or enter your keys for you — follow these steps.

## What it does
`supabase/functions/employment-reminder/index.ts` finds users whose `company_updated_at` is null or older than 30 days (and who haven't been emailed this cycle), looks up their email from Supabase auth, and sends a short "keep your company current" email via Resend. It stamps `email_reminded_at` so it never double-sends.

## Prerequisites
1. Run the migration `docs/migrations/2026-06_public_profiles.sql` (adds `company_updated_at`, `email_reminded_at`, etc.). The function needs those columns.
2. A transactional email provider. This function uses **Resend** (resend.com) — free tier is fine. Verify a sending domain (or use the `onboarding@resend.dev` test sender for a trial).
3. The Supabase CLI installed and logged in (`supabase login`), linked to your project (`supabase link`).

## Deploy
```bash
# from the repo root
supabase functions deploy employment-reminder

# set secrets (the function reads these; SUPABASE_URL + SERVICE_ROLE are auto-injected)
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set FROM_EMAIL="PAL <hello@yourdomain.com>"
supabase secrets set APP_URL="https://product-analytics-lab.vercel.app"
```

## Test once (manual)
```bash
curl -X POST "https://<your-project-ref>.functions.supabase.co/employment-reminder" \
  -H "Authorization: Bearer <YOUR_SERVICE_ROLE_KEY>"
# returns { candidates, sent, skipped, failures }
```
Tip: temporarily set your own `company_updated_at` to null to make yourself a candidate, then confirm you receive the email.

## Schedule it monthly
Supabase Dashboard → Edge Functions → your function → **Schedules** (or **Integrations → Cron**). Add a schedule:
- Cron: `0 9 1 * *`  (09:00 UTC on the 1st of each month)
- Method: POST

Or via pg_cron + pg_net in SQL:
```sql
select cron.schedule(
  'employment-reminder-monthly',
  '0 9 1 * *',
  $$ select net.http_post(
       url := 'https://<your-project-ref>.functions.supabase.co/employment-reminder',
       headers := jsonb_build_object('Authorization', 'Bearer <YOUR_SERVICE_ROLE_KEY>')
     ); $$
);
```

## Notes
- **Cost/safety:** the `email_reminded_at` throttle means re-running within 30 days won't re-email anyone, so a stray extra run is harmless.
- **Deliverability:** verify your domain in Resend (SPF/DKIM) before sending to real users, or the test sender will land in spam.
- **Privacy:** the function reads emails server-side via the service role only; emails are never exposed to the client. Do not commit your service-role key — it stays in Supabase secrets.
- Until you deploy this, the in-app nudge alone is live and fully functional.
