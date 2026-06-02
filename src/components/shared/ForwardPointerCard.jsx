import { Icon } from './Icon.jsx';

/**
 * ForwardPointerCard — shows after case/debrief completion
 * Surfaces one suggested next action so users don't hit a dead end.
 * Usage: <ForwardPointerCard room="rca" onNavigate={onNavigate} onNext={onNext} />
 */
export function ForwardPointerCard({ room, onNavigate, onNext }) {
  const ROOM_NEXT = {
    rca:     { label: 'More RCA cases', nav: 'rca' },
    cases:   { label: 'More Cases', nav: 'cases' },
    metrics: { label: 'More Metrics cases', nav: 'metrics' },
    stats:   { label: 'More Stats modules', nav: 'stats' },
    bi:      { label: 'More BI cases', nav: 'bi' },
    growth:  { label: 'More Growth cases', nav: 'growth-analytics' },
  };

  const next = ROOM_NEXT[room] || ROOM_NEXT.rca;

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1rem 1.25rem',
      marginTop: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}
    className="pal-reveal-in"
    >
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
        What to do next
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {onNext && (
          <button
            onClick={onNext}
            style={{
              background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.85rem',
              fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)', cursor: 'pointer',
            }}
          >
            Next case →
          </button>
        )}
        {onNavigate && (
          <>
            <button
              onClick={() => onNavigate('defense-doc')}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.85rem',
                fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer',
              }}
            >
              Build interview plan
            </button>
            <button
              onClick={() => onNavigate('company-tracks')}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.85rem',
                fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer',
              }}
            >
              Company Tracks
            </button>
          </>
        )}
      </div>
    </div>
  );
}
