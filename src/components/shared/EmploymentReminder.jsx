import { useState, useEffect } from 'react';
import { fetchPublicProfile, confirmMyEmployment } from '../../utils/leaderboard.js';

// Monthly in-app nudge: prompts a signed-in user to confirm or update their
// current company + role so the community can refer them. Degrades gracefully
// before the DB migration runs — it reads company_updated_at from the server
// profile when present, and otherwise falls back entirely to localStorage.
//
// State source of truth for "when did they last confirm?":
//   * server: profile.company_updated_at (once the migration has run)
//   * local fallback: localStorage 'pal-company-confirmed-v1' (always written by
//     updateMyEmployment / confirmMyEmployment in utils/leaderboard.js)
// If that timestamp is null/missing OR older than 30 days, the banner shows.
//
// Dismiss [x] hides it for this browser session only (sessionStorage); it
// reappears next session until the user confirms or updates.

const COMPANY_LS_KEY        = 'pal-company-v1';
const ROLE_LS_KEY           = 'pal-role-v1';
const COMPANY_CONFIRMED_KEY = 'pal-company-confirmed-v1';
const SESSION_DISMISS_KEY   = 'pal-emp-reminder-dismissed-v1';
const THIRTY_DAYS_MS        = 30 * 24 * 60 * 60 * 1000;

function readLocal(key) {
  try { return localStorage.getItem(key) || ''; }
  catch { return ''; }
}

function isStale(iso) {
  if (!iso) return true;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return true;
  return Date.now() - t > THIRTY_DAYS_MS;
}

export function EmploymentReminder({ user, onNavigate }) {
  // 'hidden' until we know whether to show; then 'confirm' (has company) or 'add' (none).
  const [mode, setMode] = useState('hidden');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!user) { setMode('hidden'); return; }

    // Session dismiss wins for this browser session.
    try {
      if (sessionStorage.getItem(SESSION_DISMISS_KEY)) { setMode('hidden'); return; }
    } catch { /* ignore */ }

    // Seed from local immediately so the banner can render without a network round-trip.
    const localCompany   = readLocal(COMPANY_LS_KEY);
    const localRole       = readLocal(ROLE_LS_KEY);
    const localConfirmed = readLocal(COMPANY_CONFIRMED_KEY);

    function decide(serverCompany, serverRole, confirmedAt) {
      const co = serverCompany || localCompany;
      const ro = serverRole || localRole;
      setCompany(co);
      setRole(ro);
      if (!co) { setMode('add'); return; }
      if (isStale(confirmedAt)) { setMode('confirm'); return; }
      setMode('hidden');
    }

    // Decide from local first (no flash), then refine from the server profile.
    decide('', '', localConfirmed);

    fetchPublicProfile(user.id).then(p => {
      if (cancelled) return;
      if (!p) { decide('', '', localConfirmed); return; }
      // Prefer the server's company_updated_at; fall back to local confirmed ts.
      decide(p.current_company, p.current_role, p.company_updated_at || localConfirmed);
    }).catch(() => { /* keep the local-derived decision */ });

    return () => { cancelled = true; };
  }, [user]);

  if (mode === 'hidden') return null;

  function dismiss() {
    try { sessionStorage.setItem(SESSION_DISMISS_KEY, '1'); } catch { /* ignore */ }
    setMode('hidden');
  }

  async function stillAccurate() {
    if (busy) return;
    setBusy(true);
    await confirmMyEmployment(user); // bumps company_updated_at + local confirmed ts
    setBusy(false);
    setMode('hidden');
  }

  function goToProfile() {
    if (onNavigate) onNavigate('profile');
    setMode('hidden');
  }

  const isAdd = mode === 'add';
  const message = isAdd
    ? 'Add your company & role so the community can refer you.'
    : 'Still at ' + company + (role ? ' as ' + role : '') + '? Keep it current so the community can refer you.';

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
        {message}
      </div>

      <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexShrink: 0 }}>
        {isAdd ? (
          <button
            onClick={goToProfile}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: '6px', padding: '0.38rem 0.85rem',
              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Add
          </button>
        ) : (
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
              onClick={goToProfile}
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
