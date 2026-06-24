import { useState, useEffect } from 'react';
import { fetchPublicProfile, confirmMyEmployment } from '../../utils/leaderboard.js';
import { getNextProfileAsk } from '../../utils/profileCompletion.js';

// Progressive-profiling nudge for signed-in users. Surfaces the SINGLE highest-
// priority outstanding profile item at a time (one ask, never a pile-up), each
// benefit-framed and linking to the relevant Profile section / readiness widget.
//
// The priority logic lives in utils/profileCompletion.js (getNextProfileAsk):
//   1. employment not set   -> ask employment        (Profile)
//   2. no LinkedIn          -> ask LinkedIn          (Profile)
//   3. no target company    -> ask target            (Progress / readiness)
//   4. no résumé            -> ask résumé            (Profile)
//   5. employment stale 90d -> re-confirm employment (Profile)  [quarterly]
//   6. résumé stale 180d    -> refresh résumé        (Profile)
//
// Cadence: employment freshness is QUARTERLY (90 days, not monthly) and résumé
// freshness is ~half-yearly (180 days) — résumés go stale slower than jobs.
//
// Degrades gracefully before the DB migration runs: getNextProfileAsk reads the
// server profile when present and otherwise falls back entirely to localStorage.
// Absent fields are treated as "not set", which is fine for prompting.
//
// Dismiss [x] hides the current ask for this browser session only (sessionStorage),
// keyed by ask id so dismissing one ask doesn't suppress a different, higher-value
// one later. It reappears next session until the user resolves it.

const SESSION_DISMISS_PREFIX = 'pal-profile-ask-dismissed-v1:';

function isDismissed(askId) {
  try { return !!sessionStorage.getItem(SESSION_DISMISS_PREFIX + askId); }
  catch { return false; }
}

export function EmploymentReminder({ user, onNavigate }) {
  // ask is null until we know what (if anything) to show.
  const [ask, setAsk] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!user) { setAsk(null); return; }

    function decide(profile) {
      const next = getNextProfileAsk(profile);
      if (!next || isDismissed(next.id)) { setAsk(null); return; }
      setAsk(next);
    }

    // Decide from local-only first (no network flash), then refine from server.
    decide(null);

    fetchPublicProfile(user.id).then(p => {
      if (cancelled) return;
      decide(p); // p may be null — getNextProfileAsk falls back to localStorage
    }).catch(() => { /* keep the local-derived decision */ });

    return () => { cancelled = true; };
  }, [user]);

  if (!ask) return null;

  function dismiss() {
    try { sessionStorage.setItem(SESSION_DISMISS_PREFIX + ask.id, '1'); } catch { /* ignore */ }
    setAsk(null);
  }

  // 'Still accurate' — lightweight confirm that bumps company_updated_at.
  async function stillAccurate() {
    if (busy) return;
    setBusy(true);
    await confirmMyEmployment(user);
    setBusy(false);
    setAsk(null);
  }

  function goTo(nav) {
    if (onNavigate) onNavigate(nav || 'profile');
    setAsk(null);
  }

  const isConfirm = ask.kind === 'confirm';

  return (
    <div
      className="pal-slide-up"
      role="status"
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
        margin: '0.75rem 1rem 0',
        padding: '0.65rem 0.9rem',
        background: 'var(--accent-bg, var(--surface-2))',
        border: '1px solid var(--accent-border, var(--border))',
        borderRadius: '10px',
      }}
    >
      <div style={{ flex: 1, minWidth: '180px', fontSize: '0.83rem', color: 'var(--text)', fontWeight: 600 }}>
        {ask.message}
      </div>

      <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexShrink: 0 }}>
        {isConfirm ? (
          <>
            <button
              onClick={stillAccurate}
              disabled={busy}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: '6px', padding: '0.38rem 0.85rem',
                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? 'Saving...' : 'Still accurate'}
            </button>
            <button
              onClick={() => goTo(ask.nav)}
              style={{
                background: 'var(--surface)', color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '6px', padding: '0.38rem 0.85rem',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Update
            </button>
          </>
        ) : (
          <button
            onClick={() => goTo(ask.nav)}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: '6px', padding: '0.38rem 0.85rem',
              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            {ask.ctaLabel || 'Add'}
          </button>
        )}

        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1,
            padding: '0.1rem 0.3rem',
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
