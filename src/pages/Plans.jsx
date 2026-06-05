import { useState } from 'react';
import { tryUnlock, isUnlocked } from '../utils/unlock.js';

function Check({ color = 'var(--green)' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 2 }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Lock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--border)"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 2, opacity: 0.5 }}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function Row({ text, available, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
      fontSize: '0.875rem',
      color: available ? 'var(--text)' : 'var(--text-muted)',
      opacity: available ? 1 : 0.55,
    }}>
      {available ? <Check color={accent || 'var(--green)'} /> : <Lock />}
      <span>{text}</span>
    </div>
  );
}

export function Plans({ onBack, onShowAuth, onNavigate, user, unlocked: unlockedProp }) {
  const alreadyUnlocked = unlockedProp || isUnlocked();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(alreadyUnlocked);

  function handleUnlock(e) {
    e.preventDefault();
    if (tryUnlock(code)) {
      setSuccess(true);
      setError('');
      setTimeout(() => onNavigate && onNavigate('progress'), 1400);
    } else {
      setError('Invalid code. Check the community link or ask for an invite.');
    }
  }

  const cardStyle = {
    flex: '1 1 260px',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.75rem',
    background: 'var(--surface)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  };

  const featuredCard = {
    ...cardStyle,
    border: '2px solid var(--accent)',
    background: 'var(--accent-bg, rgba(99,102,241,0.04))',
  };

  return (
    <div className="pal-page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '0.85rem', cursor: 'pointer', padding: 0, marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '0.35rem',
        }}
      >
        ← Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.5rem', letterSpacing: '-0.03em' }}>
          How you want to practice
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>
          PAL is free to explore. Sign in to track progress. Unlock for the full case bank.
        </p>
      </div>

      {/* Tier cards */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '3rem' }}>

        {/* ── Tier 1: Guest ── */}
        <div style={cardStyle}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            Guest
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Explore free
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.75rem', lineHeight: 1.55 }}>
            No account needed to browse or try Foundations.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: 'auto' }}>
            <Row text="All 4 Foundation rooms (100+ modules)" available />
            <Row text="Browse all 17 practice rooms" available />
            <Row text="1 demo case per room (no save)" available />
            <Row text="Blog &amp; Playbook articles" available />
            <Row text="Progress tracking" available={false} />
            <Row text="Case saves &amp; streak" available={false} />
            <Row text="Easy SQL &amp; Forensic SQL" available={false} />
          </div>
          <button
            onClick={() => onNavigate && onNavigate('stat-foundations')}
            style={{
              marginTop: '1.25rem', width: '100%',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.6rem 1rem',
              fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Explore Foundations →
          </button>
        </div>

        {/* ── Tier 2: Free Account ── */}
        <div style={featuredCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)' }}>
              Free Account
            </div>
            <span style={{
              fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              background: 'var(--accent)', color: '#fff', borderRadius: '4px', padding: '0.1rem 0.4rem',
            }}>
              Start here
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Track your progress
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.75rem', lineHeight: 1.55 }}>
            Sign in to save progress across devices and build a streak.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: 'auto' }}>
            <Row text="Everything in Guest" available accent="var(--accent)" />
            <Row text="~3 cases per room (saved)" available accent="var(--accent)" />
            <Row text="All 50 Easy SQL problems" available accent="var(--accent)" />
            <Row text="All 25 Forensic SQL problems" available accent="var(--accent)" />
            <Row text="Progress tracker + daily streak" available accent="var(--accent)" />
            <Row text="Cross-device sync" available accent="var(--accent)" />
            <Row text="Full case banks (300+ cases)" available={false} />
            <Row text="Company Tracks" available={false} />
            <Row text="Medium / Hard / Master SQL" available={false} />
          </div>
          {user ? (
            <div style={{
              marginTop: '1.25rem', width: '100%', textAlign: 'center',
              padding: '0.6rem 1rem', fontSize: '0.875rem', fontWeight: 600,
              color: 'var(--accent)', background: 'var(--accent-bg)', borderRadius: '8px',
              border: '1px solid var(--accent-border)',
            }}>
              ✓ You're signed in
            </div>
          ) : (
            <button
              onClick={() => onShowAuth && onShowAuth()}
              style={{
                marginTop: '1.25rem', width: '100%',
                background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '0.65rem 1rem',
                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Sign in — it\'s free →
            </button>
          )}
        </div>

        {/* ── Tier 3: Full Lab ── */}
        <div style={cardStyle}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            Full Lab
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Everything, unlocked
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.75rem', lineHeight: 1.55 }}>
            Access code required. One code covers the entire lab — no per-room pricing.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: 'auto' }}>
            <Row text="Everything in Free Account" available accent="var(--teal)" />
            <Row text="300+ cases across 17 rooms" available accent="var(--teal)" />
            <Row text="Company Tracks (employer-specific paths)" available accent="var(--teal)" />
            <Row text="Staff Layer debriefs (L5+ reasoning)" available accent="var(--teal)" />
            <Row text="Medium / Hard / Master SQL (90+ problems)" available accent="var(--teal)" />
            <Row text="Interview Simulator" available accent="var(--teal)" />
          </div>

          {/* Code input */}
          <div style={{ marginTop: '1.25rem' }}>
            {success ? (
              <div style={{
                textAlign: 'center', padding: '0.75rem 1rem',
                background: 'rgba(20,184,166,0.08)', border: '1px solid var(--teal-border)',
                borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--teal)',
              }}>
                ✓ Full lab unlocked
              </div>
            ) : (
              <form onSubmit={handleUnlock}>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Enter access code"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '0.6rem 0.85rem', fontSize: '0.875rem',
                    color: 'var(--text)', background: 'var(--surface)',
                    marginBottom: '0.5rem', outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--teal)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
                <button
                  type="submit"
                  disabled={!code.trim()}
                  style={{
                    width: '100%', background: code.trim() ? 'var(--teal)' : 'var(--surface-2)',
                    color: code.trim() ? '#fff' : 'var(--text-muted)',
                    border: '1px solid var(--teal-border)',
                    borderRadius: '8px', padding: '0.6rem 1rem',
                    fontSize: '0.875rem', fontWeight: 700,
                    cursor: code.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit', transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  Unlock the full lab →
                </button>
                {error && (
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--red)', textAlign: 'center' }}>
                    {error}
                  </p>
                )}
              </form>
            )}
            <p style={{ margin: '0.65rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              No code? Get one via the{' '}
              <a
                href="https://www.linkedin.com/in/sidkrpl/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', textDecoration: 'none' }}
              >
                community
              </a>
              {' '}or ask the founder directly.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div style={{
        textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)', paddingTop: '1.5rem',
      }}>
        Foundations are always free — no account required.
        Stripe payments coming soon. One access code covers everything.
      </div>

    </div>
  );
}
