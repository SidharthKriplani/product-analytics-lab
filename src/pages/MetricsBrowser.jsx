import { Icon } from '../components/shared/Icon.jsx';
import { useState } from 'react';
import { metricCases } from '../data/metricCases.js';
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';
import { getMetricsProgress } from '../utils/metricsProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { FoundationNudgeCard } from '../components/shared/FoundationNudgeCard.jsx';

const DIFF_CFG = {
  foundational: { label: 'Foundational', color: 'var(--blue-text)', bg: 'var(--blue-bg)',   border: 'var(--blue-border)' },
  analyst:      { label: 'Analyst',      color: 'var(--blue-text)', bg: 'var(--blue-bg)',   border: 'var(--blue-border)' },
  intermediate: { label: 'Intermediate', color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  senior:       { label: 'Senior',       color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  advanced:     { label: 'Advanced',     color: 'var(--purple)',    bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
  staff:        { label: 'Staff',        color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
};

const LEVEL_CFG = {
  staff:   { label: 'Staff-level',   color: 'var(--purple)',    bg: 'var(--purple-bg)',  border: 'var(--purple-border)' },
  senior:  { label: 'Senior-ready',  color: 'var(--teal)',      bg: 'var(--teal-bg)',    border: 'var(--teal-border)' },
  analyst: { label: 'Analyst-ready', color: 'var(--blue-text)', bg: 'var(--blue-bg)',    border: 'var(--blue-border)' },
  junior:  { label: 'Junior miss',   color: 'var(--yellow)',    bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
};

const DIFF_ORDER = { analyst: 0, foundational: 0, intermediate: 1, senior: 1, advanced: 2, staff: 2 };

export function MetricsBrowser({ onSelectCase, unlocked, onUnlock, onOpenArticle, onNavigate }) {
  const [sortBy, setSortBy] = useState('default');
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');
  const completedCount = metricCases.filter(c => getMetricsProgress(c.id)).length;

  const diffCounts = {
    all: metricCases.length,
    analyst: metricCases.filter(c => c.difficulty === 'analyst').length,
    senior: metricCases.filter(c => c.difficulty === 'senior').length,
    staff: metricCases.filter(c => c.difficulty === 'staff').length,
  };

  const baseCases = sortBy === 'difficulty'
    ? [...metricCases].sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 1) - (DIFF_ORDER[b.difficulty] ?? 1))
    : metricCases;

  const displayCases = baseCases.filter(c => diffFilter === 'all' || c.difficulty === diffFilter);

  const firstUnstartedId = metricCases.find(mc => !getMetricsProgress(mc.id))?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--green-bg)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name='bar-chart' size={18} color='var(--green)' />
          </span>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green)', marginBottom: '0.15rem' }}>
              Metrics Room
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Metric Design
            </h1>
          </div>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.6, maxWidth: '540px' }}>
          The most common interview failure is picking the obvious metric and defending it under pressure — but interviewers want to see you spot the metric that games, the denominator that shifts, the guardrail you forgot. This room trains the full decision: not just what to measure, but why that specific metric and what breaks if you get it wrong.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          <RoomBadge />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 96, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round(completedCount / metricCases.length * 100))}%`, background: 'var(--green)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{completedCount}/{metricCases.length}</span>
          </div>
        </div>
      </div>

      {/* Foundation nudge */}
      {onNavigate && (
        <FoundationNudgeCard foundationRoom="metrics-foundations" foundationLabel="Metrics Foundations" onNavigate={onNavigate} />
      )}

      {/* Theory / Cases tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['Cases', 'Theory'].map(tab => {
          const active = tab === 'Theory' ? theoryActive : !theoryActive;
          return (
            <button
              key={tab}
              onClick={() => setTheoryActive(tab === 'Theory')}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid ' + (active ? 'var(--accent-border)' : 'var(--border)'),
                background: active ? 'var(--accent-bg)' : 'none',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 400,
                fontSize: '0.82rem', cursor: 'pointer',
              }}
            >{tab}</button>
          );
        })}
      </div>

      {/* Sort controls */}
      {!theoryActive && (
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, justifyContent: 'flex-end' }}>
        {['default', 'difficulty'].map(opt => (
          <button key={opt} onClick={() => setSortBy(opt)} className={`pal-sort-btn${sortBy === opt ? ' active' : ''}`}>{opt === 'default' ? 'Default' : 'By Difficulty'}</button>
        ))}
      </div>
      )}

      {/* Difficulty filter chips */}
      {!theoryActive && (
        <DifficultyChips value={diffFilter} onChange={setDiffFilter} counts={diffCounts} />
      )}

      {/* Case cards grid */}
      {!theoryActive && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
        gap: '0.85rem',
      }}>
        {displayCases.map((mc, index) => {
          const progress = getMetricsProgress(mc.id);
          const levelCfg = progress?.bestLevel ? LEVEL_CFG[progress.bestLevel] : null;
          const diffCfg = DIFF_CFG[mc.difficulty] || DIFF_CFG.analyst;
          const isLocked = !mc.isFree && !unlocked;
          const isNextUnstarted = mc.id === firstUnstartedId;

          return (
            <div
              key={mc.id}
              className="pal-card-enter pal-card-hover"
              role="button"
              tabIndex={0}
              onClick={() => isLocked ? (onUnlock && onUnlock()) : onSelectCase(mc.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); isLocked ? (onUnlock && onUnlock()) : onSelectCase(mc.id); } }}
              style={{
                animationDelay: (Math.min(index * 28, 400)) + 'ms',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                borderLeft: isNextUnstarted ? '3px solid var(--green)' : '1.5px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
                display: 'flex', flexDirection: 'column', gap: '0.6rem',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--green-border)';
                e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isNextUnstarted && (
                <span style={{
                  position: 'absolute', top: '0.6rem', right: '0.7rem',
                  fontSize: '0.68rem', fontWeight: 700,
                  color: 'var(--green)', background: 'var(--green-bg)',
                  border: '1px solid var(--green-border)',
                  borderRadius: 4, padding: '0.1rem 0.4rem',
                }}>
                  Next →
                </span>
              )}
              {/* Badges row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
                  borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem',
                }}>{diffCfg.label}</span>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem',
                }}>{mc.domain}</span>
                {levelCfg && (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: levelCfg.color, background: levelCfg.bg, border: `1px solid ${levelCfg.border}`,
                    borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem',
                  }}>✓ {levelCfg.label}</span>
                )}
              </div>

              {/* Title + subtitle */}
              <div>
                <h3 style={{ fontSize: '0.97rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.2rem', letterSpacing: '-0.01em', lineHeight: 1.35 }}>
                  {mc.title}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  {mc.subtitle}
                </p>
              </div>

              {/* Context trap hint */}
              <p style={{
                fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5,
                borderLeft: '2px solid var(--border-subtle)', paddingLeft: '0.6rem',
              }}>
                {mc.context.trap}
              </p>

              {/* Bottom row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                {progress ? (
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                    {progress.attempts} attempt{progress.attempts !== 1 ? 's' : ''} · Resume →
                  </span>
                ) : (
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>Not started</span>
                )}
                {!isLocked && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>→</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {theoryActive && (
        <div>
          <div style={{ marginBottom: '1rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            Read the theory, then practice it in the cases above.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '0.75rem' }}>
            {FOUNDATION_DOMAINS['metrics'].articles.map(a => (
              <button
                key={a.id}
                onClick={() => onOpenArticle && onOpenArticle(a.id)}
                style={{
                  textAlign: 'left', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: '10px',
                  padding: '0.9rem 1rem', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{a.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.35rem', fontWeight: 500 }}>Read article →</div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function RoomBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      background: 'var(--green-bg)', border: '1px solid var(--green-border)',
      borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem',
      fontSize: '0.75rem', color: 'var(--green)', fontWeight: 700,
    }}>
      Metrics · {metricCases.length} Cases
    </div>
  );
}

function StatPill({ n, label, color }) {
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.7rem',
      display: 'flex', alignItems: 'baseline', gap: '0.3rem',
    }}>
      <span style={{ fontSize: '1rem', fontWeight: 800, color: color || 'var(--green)', lineHeight: 1 }}>{n}</span>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{label}</span>
    </div>
  );
}
