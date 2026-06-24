// Product Analytics Lab — Guided Path Card
// Renders a single learning path with sequence, completion status, and next item CTA

import { Icon } from '../shared/Icon.jsx';

export function GuidedPathCard({ path, completionMap, onNavigate }) {
  // completionMap: { 'stats:stat01-pvalue-decision': true, 'review:s01-checkout-trap': true, ... }
  const completed = path.sequence.filter(item => completionMap[`${item.room}:${item.itemId}`]);
  const nextItem = path.sequence.find(item => !completionMap[`${item.room}:${item.itemId}`]);

  const roomNav = {
    stats: 'stats',
    metrics: 'metrics',
    design: 'design',
    review: 'browser',
    rca: 'rca',
    cases: 'cases',
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${path.border}`,
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.4rem',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em',
            color: path.color, marginBottom: '0.3rem',
          }}>Guided path</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{path.title}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{path.subtitle}</div>
        </div>
        <div style={{
          fontSize: '0.75rem', fontWeight: 600,
          color: path.color, background: path.bg, border: `1px solid ${path.border}`,
          borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.55rem', whiteSpace: 'nowrap',
        }}>
          {completed.length} / {path.sequence.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '4px', background: 'var(--border)',
        borderRadius: '2px', marginBottom: '0.85rem', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${path.sequence.length > 0 ? (completed.length / path.sequence.length) * 100 : 0}%`,
          background: path.color,
          borderRadius: '2px',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* CTA */}
      {nextItem && (
        <button
          onClick={() => onNavigate(roomNav[nextItem.room] || nextItem.room)}
          style={{
            width: '100%',
            background: path.bg,
            border: `1px solid ${path.border}`,
            borderRadius: 'var(--radius)',
            padding: '0.5rem 0.9rem',
            color: path.color,
            fontSize: '0.82rem', fontWeight: 700,
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <span>Continue: {nextItem.label}</span>
          <span>→</span>
        </button>
      )}
      {!nextItem && (
        <div style={{
          textAlign: 'center',
          fontSize: '0.78rem', fontWeight: 600,
          color: path.color, padding: '0.4rem',
        }}>
          <Icon name="check" size={13} color="currentColor" /> Path complete
        </div>
      )}
    </div>
  );
}
