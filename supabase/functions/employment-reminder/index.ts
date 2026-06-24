// Supabase Edge Function — monthly "update your company" email reminder.
//
// Companion to the in-app nudge. Finds users whose `company_updated_at` is null
// or older than 30 days and emails them a gentle reminder to keep their company
// + role current (referrals in the community depend on it).
//
// DEPLOY: see docs/EMAIL-REMINDER-SETUP.md. Requires secrets:
//   RESEND_API_KEY   — your Resend (or other provider) API key
//   FROM_EMAIL       — verified sender, e.g. 'PAL <hello@yourdomain.com>'
//   APP_URL          — e.g. 'https://product-analytics-lab.vercel.app'
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
//
// Schedule it monthly (pg_cron or the dashboard Scheduler). It only emails
// stale users and stamps `email_reminded_at` so it never double-sends within a
// cycle. Safe to run more often than monthly because of that throttle.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  // Guard: only allow POST (cron/manual). Reject stray GETs.
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'PAL <onboarding@resend.dev>';
  const APP_URL = Deno.env.get('APP_URL') || 'https://product-analytics-lab.vercel.app';

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), { status: 500 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const cutoffISO = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();

  // Stale = company_updated_at is null OR older than 30 days, AND we haven't
  // already emailed them within this cycle (email_reminded_at null or stale too).
  const { data: rows, error } = await admin
    .from('leaderboard')
    .select('user_id, display_name, current_company, current_role, company_updated_at, email_reminded_at')
    .or(`company_updated_at.is.null,company_updated_at.lt.${cutoffISO}`)
    .or(`email_reminded_at.is.null,email_reminded_at.lt.${cutoffISO}`)
    .limit(2000);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let sent = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const row of rows ?? []) {
    // Email lives in auth, not in leaderboard — look it up by id.
    const { data: userRes } = await admin.auth.admin.getUserById(row.user_id);
    const email = userRes?.user?.email;
    if (!email) { skipped++; continue; }

    const name = row.display_name || 'there';
    const hasCompany = !!row.current_company;
    const line = hasCompany
      ? `We've got you at <strong>${escapeHtml(row.current_company)}</strong>${row.current_role ? ` as <strong>${escapeHtml(row.current_role)}</strong>` : ''}. Still accurate?`
      : `You haven't added your current company and role yet.`;

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
        <p>Hi ${escapeHtml(name)},</p>
        <p>${line}</p>
        <p>Keeping your company and role current is how the community refers each other — an out-of-date profile means missed intros.</p>
        <p><a href="${APP_URL}/#/profile" style="display:inline-block;background:#2457D6;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">Update your profile</a></p>
        <p style="color:#777;font-size:13px">If it's still correct, just open your profile and hit "Still accurate" — takes a second.</p>
      </div>`;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: 'Keep your company current on PAL',
          html,
        }),
      });
      if (!res.ok) { failures.push(`${email}: ${res.status}`); continue; }
      // Throttle: stamp so we don't re-email within the cycle.
      await admin.from('leaderboard').update({ email_reminded_at: new Date().toISOString() }).eq('user_id', row.user_id);
      sent++;
    } catch (e) {
      failures.push(`${email}: ${e instanceof Error ? e.message : 'send failed'}`);
    }
  }

  return new Response(JSON.stringify({ candidates: rows?.length ?? 0, sent, skipped, failures }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}
