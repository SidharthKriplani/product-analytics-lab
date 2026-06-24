// Immediate feedback after option selection + submit

import { Icon } from '../shared/Icon.jsx';

const LEVEL_CONFIG = {
  staff:   { label: 'Staff-Level',    color: 'var(--teal)',      bg: 'var(--teal-bg)',    border: 'var(--teal-border)',   icon: 'star-filled' },
  strong:  { label: 'Senior-Ready',   color: 'var(--accent)',    bg: 'var(--accent-bg)',  border: 'var(--accent-border)', icon: 'diamond' },
  partial: { label: 'Analyst-Ready',  color: 'var(--yellow)',    bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)', icon: 'minus' },
  wrong:   { label: 'Needs Work',     color: 'var(--red)',       bg: 'var(--red-bg)',     border: 'var(--red-border)',    icon: 'x' },
};

export function StatsScoreReveal({ option, onContinue }) {
  const cfg = LEVEL_CONFIG[option.level] || LEVEL_CONFIG.wrong;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Level badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.9rem 1rem',
        background: cfg.bg, border: `1.5px solid ${cfg.border}`,
        borderRadius: 'var(--radius)',
      }}>
        <span><Icon name={cfg.icon} size={18} color={cfg.color} /></span>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: cfg.color, letterSpacing: '-0.01em' }}>
            {cfg.label}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>
            {option.label.length > 80 ? option.label.slice(0, 80) + '…' : option.label}
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
        borderLeft: `3px solid ${cfg.border}`,
        borderRadius: 'var(--radius-sm)', padding: '0.75rem 0.9rem',
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
          Why
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
          {option.feedback}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        style={{
          padding: '0.65rem 1.1rem',
          background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 'var(--radius)',
          fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
          transition: 'opacity 0.1s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Read the senior analyst take →
      </button>
    </div>
  );
}
