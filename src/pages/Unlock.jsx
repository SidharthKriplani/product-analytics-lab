import { useState } from 'react';
import { tryUnlock } from '../utils/unlock.js';

const KEYFRAMES = `
  @keyframes pal-unlock-in {
    from { opacity: 0; transform: scale(0.96) translateY(8px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);   }
  }
  @keyframes pal-mark-pop {
    from { opacity: 0; transform: scale(0.84); }
    to   { opacity: 1; transform: scale(1);    }
  }
  @keyframes pal-text-rise {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
`;

function CIMark({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <rect width="96" height="96" rx="20" fill="#6055C8"/>
      <g stroke="#ffffff" strokeLinecap="round" strokeWidth="2.5">
        <line x1="18" y1="48" x2="78" y2="48"/>
        <line x1="18" y1="37" x2="18" y2="59"/>
        <line x1="78" y1="37" x2="78" y2="59"/>
      </g>
      <circle cx="48" cy="48" r="4.5" fill="#ffffff"/>
    </svg>
  );
}

export function Unlock({ onUnlocked, alreadyUnlocked, onNavigate }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (tryUnlock(code)) {
      setSuccess(true);
      setError('');
      setTimeout(() => onUnlocked(), 1600);
    } else {
      setError('Invalid code. Check the community link or ask the founder for an invite.');
    }
  }

  if (alreadyUnlocked) {
    return (
      <>
        <style>{KEYFRAMES}</style>
        <div className="pal-page-enter" style={{
          maxWidth: '360px', margin: '5rem auto', padding: '2rem 1.5rem',
          textAlign: 'center',
          animation: 'pal-unlock-in 0.3s ease-out both',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: '1.5rem',
            animation: 'pal-mark-pop 0.3s ease-out 0.05s both',
          }}>
            <CIMark size={56} />
          </div>
          <h1 style={{
            fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)',
            margin: '0 0 0.5rem', letterSpacing: '-0.03em',
            animation: 'pal-text-rise 0.3s ease-out 0.1s both',
          }}>
            Full access active.
          </h1>
          <p style={{
            color: 'var(--text-muted)', fontSize: '0.88rem',
            margin: '0 0 1.75rem', lineHeight: 1.6,
            animation: 'pal-text-rise 0.3s ease-out 0.15s both',
          }}>
            All 150+ cases across 17 rooms are unlocked. Progress saves locally.
          </p>
          <button
            onClick={() => onNavigate('progress')}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: '7px', padding: '0.65rem 1.75rem',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              animation: 'pal-text-rise 0.3s ease-out 0.2s both',
            }}
          >
            View my progress →
          </button>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <style>{KEYFRAMES}</style>
        <div className="pal-page-enter" style={{
          maxWidth: '360px', margin: '5rem auto', padding: '2rem 1.5rem',
          textAlign: 'center',
          animation: 'pal-unlock-in 0.25s ease-out both',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: '1.5rem',
            animation: 'pal-mark-pop 0.3s ease-out 0.08s both',
          }}>
            <CIMark size={64} />
          </div>
          <h1 style={{
            fontSize: '2.2rem', fontWeight: 800, color: 'var(--text)',
            margin: '0 0 0.5rem', letterSpacing: '-0.04em',
            animation: 'pal-text-rise 0.3s ease-out 0.15s both',
          }}>
            You're in.
          </h1>
          <p style={{
            color: 'var(--text-muted)', fontSize: '0.9rem',
            margin: 0, lineHeight: 1.6,
            animation: 'pal-text-rise 0.3s ease-out 0.2s both',
          }}>
            Full access — all cases unlocked.
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="pal-page-enter" style={{ maxWidth: '480px', margin: '4rem auto', padding: '2rem 1.5rem' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '2rem',
        boxShadow: 'var(--shadow)',
      }}>
        {/* What you get — free vs premium */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <CIMark size={40} />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.4rem 0' }}>
              Unlock Full Access
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.55, margin: 0 }}>
              Enter a community access code to unlock all content.
            </p>
          </div>

        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Access Code
            </label>
            <input
              type="password"
              value={code}
              onChange={e => { setCode(e.target.value); setError(''); }}
              placeholder="Enter your access code"
              autoComplete="off"
              autoCapitalize="characters"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--input-bg)', border: `1px solid ${error ? 'var(--red-border)' : 'var(--border)'}`,
                borderRadius: '6px', padding: '0.6rem 0.875rem',
                color: 'var(--text)', fontSize: '0.95rem',
                fontFamily: 'monospace', letterSpacing: '0.05em',
                outline: 'none',
              }}
            />
            {error && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--red)' }}>{error}</div>
            )}
          </div>
          <button
            type="submit"
            disabled={!code.trim()}
            style={{
              width: '100%',
              background: code.trim() ? 'var(--accent)' : 'var(--surface-2)',
              color: code.trim() ? '#fff' : 'var(--text-dim)',
              border: `1px solid ${code.trim() ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '6px', padding: '0.65rem',
              fontWeight: 700, fontSize: '0.9rem', cursor: code.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}
          >
            Unlock Full Access
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.73rem', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.5 }}>
          Access code from the PAL community or a direct invite. Sign in separately to access free cases and save progress.
        </div>
      </div>
    </div>
  );
}
