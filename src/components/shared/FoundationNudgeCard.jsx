import { useState } from 'react';
import { Icon } from './Icon.jsx';

/**
 * FoundationNudgeCard — dismissable nudge suggesting foundation completion
 * Usage: <FoundationNudgeCard foundationRoom="stat-foundations" foundationLabel="Stat Foundations" onNavigate={onNavigate} />
 * Checks localStorage for foundation completion. If not completed, shows card. Dismissable per session (uses state, not localStorage).
 */
export function FoundationNudgeCard({ foundationRoom, foundationLabel, onNavigate }) {
  const [dismissed, setDismissed] = useState(false);

  // Check if foundation is completed
  const foundationProgressKey = `pal-${foundationRoom}-progress-v1`;
  const foundationProgress = localStorage.getItem(foundationProgressKey);
  const foundationCompleted = foundationProgress ? Object.values(JSON.parse(foundationProgress)).some(m => m.completedAt) : false;

  if (dismissed || foundationCompleted) return null;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
      className="pal-card-enter"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <Icon name="alert-triangle" size={18} color="var(--yellow)" />
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Haven't done <strong>{foundationLabel}</strong> yet? It's the best starting point.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button
          onClick={() => onNavigate(foundationRoom)}
          style={{
            background: 'var(--teal)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.target.style.opacity = '0.85'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          Go to {foundationLabel}
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0.25rem 0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
