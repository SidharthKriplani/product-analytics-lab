import { useState } from 'react';
import { signInWithEmail, signInWithGoogle, signInWithGitHub } from '../../utils/auth.js';
import { BrandMark } from '../shared/BrandMark.jsx';

export function AuthModal({ onClose, onSuccess }) {
  const [step, setStep] = useState('main'); // 'main' | 'sent'
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGoogle() {
    setLoading(true);
    setError('');
    const { error: err } = await signInWithGoogle();
    setLoading(false);
    if (err) setError('Google sign-in failed. Please try again.');
    else onSuccess();
  }

  async function handleGitHub() {
    setLoading(true);
    setError('');
    const { error: err } = await signInWithGitHub();
    setLoading(false);
    if (err) setError('GitHub sign-in failed. Please try again.');
    else onSuccess();
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    const { error: err } = await signInWithEmail(email.trim());
    setLoading(false);
    if (err) setError('Could not send link. Please check the email and try again.');
    else setStep('sent');
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'var(--overlay)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="pal-slide-up"
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg, 12px)', boxShadow: 'var(--shadow-md)',
          width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: '0.85rem', right: '0.85rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1, padding: '0.25rem',
          }}
        >×</button>

        {/* Slot 5 — brand at the sign-in moment (BrandMark wordmark, D-19) */}
        <div style={{ marginBottom: '1.25rem' }}>
          <BrandMark variant='wordmark' size={20} />
        </div>

        {step === 'main' && (
          <>
            <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
              Sign in to PAL
            </h2>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Sync your progress across devices.
            </p>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.6rem', background: 'var(--surface-2)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius, 6px)',
                padding: '0.65rem 1rem', fontSize: '0.88rem', fontWeight: 600,
                color: 'var(--text)', cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '0.6rem', opacity: loading ? 0.7 : 1, transition: 'opacity 0.1s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* GitHub */}
            <button
              onClick={handleGitHub}
              disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.6rem', background: 'var(--surface-2)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius, 6px)',
                padding: '0.65rem 1rem', fontSize: '0.88rem', fontWeight: 600,
                color: 'var(--text)', cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '1.25rem', opacity: loading ? 0.7 : 1, transition: 'opacity 0.1s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              Continue with GitHub
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            {/* Email */}
            <form onSubmit={handleEmailSubmit}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius, 6px)',
                  padding: '0.6rem 0.85rem', fontSize: '0.88rem',
                  color: 'var(--text)', background: 'var(--surface)',
                  marginBottom: '0.75rem', outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  width: '100%', background: 'var(--accent)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius, 6px)',
                  padding: '0.65rem 1rem', fontSize: '0.88rem', fontWeight: 600,
                  cursor: (loading || !email.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (loading || !email.trim()) ? 0.65 : 1,
                }}
              >
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
            </form>

            {error && (
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: 'var(--red)', textAlign: 'center' }}>
                {error}
              </p>
            )}
          </>
        )}

        {step === 'sent' && (
          <>
            <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📬</div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
                Check your inbox
              </h2>
              <p style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                We sent a magic link to
              </p>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
                {email}
              </p>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Click the link in your email to sign in. You can close this window.
              </p>
            </div>
            <button
              onClick={() => setStep('main')}
              style={{
                width: '100%', background: 'none', border: '1px solid var(--border)',
                borderRadius: 'var(--radius, 6px)', padding: '0.6rem 1rem',
                fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer',
              }}
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
