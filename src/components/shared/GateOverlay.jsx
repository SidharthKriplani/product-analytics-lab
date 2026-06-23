import { createPortal } from 'react-dom';
import { Icon } from './Icon.jsx';
import { BrandMark } from './BrandMark.jsx';

/**
 * GateOverlay — reusable locked-state overlay.
 * Renders via portal so it always clears stacking contexts.
 * Use for both anonymous-user gates (sign-in) and premium gates (unlock).
 *
 * Props:
 *   title        — headline (e.g. "Sign in to practice")
 *   body         — 1–2 sentence explanation (contextual to the locked surface)
 *   ctaLabel     — primary button label
 *   onCTA        — primary button handler
 *   secondaryLabel (optional) — secondary button label
 *   onSecondary  (optional) — secondary button handler
 */
export function GateOverlay({ title, body, ctaLabel, onCTA, secondaryLabel, onSecondary }) {
  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.52)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="pal-slide-up"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
          width: '100%', maxWidth: '380px',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        {/* Slot 5 — brand at the pay/gate moment (BrandMark wordmark, D-19) */}
        <div style={{ marginBottom: '1rem' }}>
          <BrandMark variant='wordmark' size={19} />
        </div>

        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <Icon name='shield' size={20} color='var(--text-muted)' />
        </div>

        {/* Copy */}
        <h2 style={{
          margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 700,
          color: 'var(--text)', letterSpacing: '-0.01em',
        }}>
          {title}
        </h2>
        <p style={{
          margin: '0 0 1.5rem', fontSize: '0.855rem',
          color: 'var(--text-muted)', lineHeight: 1.65,
        }}>
          {body}
        </p>

        {/* Primary CTA */}
        <button
          onClick={onCTA}
          style={{
            width: '100%', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '0.65rem 1rem', fontSize: '0.9rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            marginBottom: secondaryLabel ? '0.6rem' : 0,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          {ctaLabel}
        </button>

        {/* Secondary CTA */}
        {secondaryLabel && onSecondary && (
          <button
            onClick={onSecondary}
            style={{
              width: '100%', background: 'none', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.55rem 1rem',
              fontSize: '0.845rem', color: 'var(--text-muted)', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
