import { useState } from 'react';
import { tryUnlock, isUnlocked } from '../utils/unlock.js';

const TIERS = [
  { id: 'guest',  label: 'Guest',        color: 'var(--text-muted)' },
  { id: 'free',   label: 'Free Account', color: 'var(--accent)'     },
  { id: 'full',   label: 'Full Lab',     color: 'var(--teal)'       },
];

const FEATURES = [
  { label: 'Practice cases',       guest: '1 per room',   free: '3 per room',    full: 'All 300+'            },
  { label: 'Difficulty access',    guest: 'Analyst only', free: 'Analyst–Senior', full: 'Analyst → Staff'    },
  { label: 'Progress saved',       guest: false,          free: true,            full: true                  },
  { label: 'Daily streak',         guest: false,          free: true,            full: true                  },
  { label: 'Cross-device sync',    guest: false,          free: true,            full: true                  },
  { label: 'Foundations (4 rooms)', guest: true,          free: true,            full: true                  },
  { label: 'Frameworks & articles', guest: true,          free: true,            full: true                  },
  { label: 'Easy SQL (50 problems)', guest: false,        free: true,            full: true                  },
  { label: 'Forensic SQL',         guest: false,          free: '10 problems',   full: '25 problems'         },
  { label: 'Medium / Hard / Master SQL', guest: false,    free: false,           full: '90+ problems'        },
  { label: 'Staff Layer debriefs', guest: false,          free: false,           full: true                  },
  { label: 'Company Tracks',       guest: false,          free: false,           full: true                  },
  { label: 'Mock Interview',       guest: false,          free: false,           full: true                  },
];

function Cell({ value, accent }) {
  if (value === true)  return <span style={{ color: accent || 'var(--green)', fontWeight: 700, fontSize: '1rem' }}>✓</span>;
  if (value === false) return <span style={{ color: 'var(--border)', fontSize: '1rem' }}>—</span>;
  return <span style={{ fontSize: '0.8rem', fontWeight: 600, color: accent ? accent : 'var(--text-muted)' }}>{value}</span>;
}

export function Plans({ onBack, onShowAuth, onNavigate, user, unlocked: unlockedProp }) {
  const alreadyUnlocked = unlockedProp || isUnlocked();
  const [code, setCode]     = useState('');
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(alreadyUnlocked);

  function handleUnlock(e) {
    e.preventDefault();
    if (tryUnlock(code)) {
      setSuccess(true);
      setError('');
      setTimeout(() => onNavigate && onNavigate('progress'), 1400);
    } else {
      setError('Invalid code. Ask via the community or DM the founder.');
    }
  }

  return (
    <div className="pal-page-enter" style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

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
          Try a real case for free. Sign in to build a practice habit. Unlock to prep like you're already in the room.
        </p>
      </div>

      {/* ── Tier cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>

        {/* Guest */}
        <div style={{
          border: '1px solid var(--border)', borderRadius: '14px',
          padding: '1.75rem', background: 'var(--surface)',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            Guest
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Try it, no account
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, flexGrow: 1 }}>
            One full practice case per room — including the debrief — before deciding if PAL is worth your time.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('metrics')}
            style={{
              width: '100%', marginTop: '0.5rem',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.65rem 1rem',
              fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Try a free case →
          </button>
        </div>

        {/* Free Account */}
        <div style={{
          border: '2px solid var(--accent)', borderRadius: '14px',
          padding: '1.75rem', background: 'var(--accent-bg, rgba(99,102,241,0.04))',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Build your practice habit
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, flexGrow: 1 }}>
            Every case you complete gets saved. Return any day and pick up where you left off — the streak tells you if you're actually being consistent.
          </p>
          {user ? (
            <div style={{
              marginTop: '0.5rem', width: '100%', textAlign: 'center',
              padding: '0.65rem 1rem', fontSize: '0.875rem', fontWeight: 600,
              color: 'var(--accent)', background: 'var(--accent-bg)', borderRadius: '8px',
              border: '1px solid var(--accent-border)',
            }}>
              ✓ You're signed in
            </div>
          ) : (
            <button
              onClick={() => onShowAuth && onShowAuth()}
              style={{
                marginTop: '0.5rem', width: '100%',
                background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '0.7rem 1rem',
                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Sign in — it's free →
            </button>
          )}
        </div>

        {/* Full Lab */}
        <div style={{
          border: '1px solid var(--border)', borderRadius: '14px',
          padding: '1.75rem', background: 'var(--surface)',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)' }}>
            Full Lab
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Prep like you're in the room
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, flexGrow: 1 }}>
            One code unlocks everything — the full case depth, difficulty progression, Staff-level debriefs, and company-specific patterns from real L4–L6 interviews.
          </p>
          <div style={{ marginTop: '0.5rem' }}>
            {success ? (
              <div style={{
                textAlign: 'center', padding: '0.7rem 1rem',
                background: 'rgba(20,184,166,0.08)', border: '1px solid var(--teal-border)',
                borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--teal)',
              }}>
                ✓ Full lab unlocked
              </div>
            ) : (
              <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="password"
                  autoComplete="off"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Enter access code"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    padding: '0.6rem 0.85rem', fontSize: '0.875rem',
                    color: 'var(--text)', background: 'var(--surface)',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--teal)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
                <button
                  type="submit"
                  disabled={!code.trim()}
                  style={{
                    width: '100%',
                    background: code.trim() ? 'var(--teal)' : 'var(--surface-2)',
                    color: code.trim() ? '#fff' : 'var(--text-muted)',
                    border: '1px solid var(--teal-border)',
                    borderRadius: '8px', padding: '0.65rem 1rem',
                    fontSize: '0.875rem', fontWeight: 700,
                    cursor: code.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                  }}
                >
                  Unlock the full lab →
                </button>
                {error && (
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--red)', textAlign: 'center' }}>{error}</p>
                )}
              </form>
            )}
            <p style={{ margin: '0.6rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              No code?{' '}
              <a href="https://chat.whatsapp.com/KqFoGxAW0XMF9hNllGyAo9" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Join the beta group
              </a>{' '}or{' '}
              <a href="https://wa.me/917838438784" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                DM the founder
              </a>.
            </p>
          </div>
        </div>
      </div>

      {/* ── Comparison table ── */}
      <div style={{
        border: '1px solid var(--border)', borderRadius: '14px',
        overflow: 'hidden', marginBottom: '2rem',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            Feature
          </div>
          {TIERS.map((t, i) => (
            <div key={t.id} style={{
              padding: '0.85rem 0.75rem',
              textAlign: 'center',
              fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: t.color,
              background: i === 1 ? 'var(--accent-bg, rgba(99,102,241,0.06))' : 'transparent',
              borderLeft: i === 1 ? '1px solid var(--accent-border)' : '1px solid var(--border)',
              borderRight: i === 1 ? '1px solid var(--accent-border)' : 'none',
            }}>
              {t.label}
            </div>
          ))}
        </div>

        {/* Feature rows */}
        {FEATURES.map((f, idx) => (
          <div key={f.label} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
            borderBottom: idx < FEATURES.length - 1 ? '1px solid var(--border)' : 'none',
            background: idx % 2 === 0 ? 'transparent' : 'var(--surface-2, rgba(255,255,255,0.015))',
          }}>
            <div style={{
              padding: '0.7rem 1.25rem',
              fontSize: '0.83rem', color: 'var(--text)', fontWeight: 500,
              display: 'flex', alignItems: 'center',
            }}>
              {f.label}
            </div>
            {[f.guest, f.free, f.full].map((val, i) => (
              <div key={i} style={{
                padding: '0.7rem 0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === 1 ? 'var(--accent-bg, rgba(99,102,241,0.04))' : 'transparent',
                borderLeft: i === 1 ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                borderRight: i === 1 ? '1px solid var(--accent-border)' : 'none',
              }}>
                <Cell value={val} accent={i === 1 ? 'var(--accent)' : i === 2 ? 'var(--teal)' : undefined} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)', paddingTop: '1.5rem',
      }}>
        Foundations are always free — no account required. · Stripe payments coming soon. One code covers everything.
      </div>

    </div>
  );
}
