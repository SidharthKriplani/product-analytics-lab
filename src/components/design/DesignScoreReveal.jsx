// Score reveal after submitting a Design Room scenario
// Shows: level badge, dimension breakdown bars, strongest/weakest, next-level gap

import { Icon } from '../shared/Icon.jsx';

const LEVEL_CONFIG = {
  staff_level:   { color: 'var(--teal)',      bg: 'var(--teal-bg)',     border: 'var(--teal-border)',   emoji: 'star-filled' },
  senior_ready:  { color: 'var(--accent)',    bg: 'var(--accent-bg)',   border: 'var(--accent-border)', emoji: 'diamond' },
  analyst_ready: { color: 'var(--blue-text)', bg: 'var(--blue-bg)',     border: 'var(--blue-border)',   emoji: 'circle-dot' },
  incomplete:    { color: 'var(--text-dim)',  bg: 'var(--surface-2)',   border: 'var(--border)',        emoji: 'circle' },
};

export function DesignScoreReveal({ result, onContinue, continueLabel = 'View full debrief' }) {
  const { dimensionScores, totalScore, level, strongest, weakest, nextLevelGap } = result;
  const cfg = LEVEL_CONFIG[level.id] || LEVEL_CONFIG.incomplete;
  const pct = Math.round(totalScore * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Level badge */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '1.75rem 1.5rem',
        background: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
        borderRadius: 'var(--radius)',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '0.4rem' }}><Icon name={cfg.emoji} size={28} color={cfg.color} /></div>
        <div style={{
          fontSize: '1.4rem', fontWeight: 900, color: cfg.color, letterSpacing: '-0.01em',
          marginBottom: '0.2rem',
        }}>
          {level.label}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 500 }}>
          Overall score: {pct}%
        </div>
      </div>

      {/* Dimension bars */}
      <div>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--text-dim)', marginBottom: '0.75rem',
        }}>
          Dimension breakdown
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {dimensionScores.map(dim => {
            const dimPct = Math.round(dim.ratio * 100);
            const isStrongest = dim.id === strongest.id;
            const isWeakest = dim.id === weakest.id;
            const barColor = dimPct >= 85
              ? 'var(--teal)'
              : dimPct >= 65
                ? 'var(--accent)'
                : dimPct >= 45
                  ? 'var(--blue-text)'
                  : 'var(--yellow)';
            return (
              <div key={dim.id}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: '0.3rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {dim.label}
                    </span>
                    {isStrongest && (
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                        color: 'var(--teal)', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
                        borderRadius: 'var(--radius-sm)', padding: '0.05rem 0.35rem',
                      }}>strongest</span>
                    )}
                    {isWeakest && !isStrongest && (
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                        color: 'var(--yellow)', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
                        borderRadius: 'var(--radius-sm)', padding: '0.05rem 0.35rem',
                      }}>focus area</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {dimPct}%
                  </span>
                </div>
                {/* Bar */}
                <div style={{
                  height: '6px', background: 'var(--surface-2)',
                  borderRadius: '3px', overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{
                    height: '100%', width: `${dimPct}%`,
                    background: barColor,
                    borderRadius: '3px',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  {dim.weight * 100}% of score
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next level gap */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
        borderLeft: '3px solid var(--accent-border)',
        borderRadius: 'var(--radius-sm)', padding: '0.75rem 0.9rem',
      }}>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--text-dim)', marginBottom: '0.35rem',
        }}>
          What separates you from the next level
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {nextLevelGap}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        className="pal-glow-pulse"
        style={{
          padding: '0.75rem 1.25rem',
          background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 'var(--radius)',
          fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
          transition: 'opacity 0.1s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        {continueLabel} →
      </button>
    </div>
  );
}
