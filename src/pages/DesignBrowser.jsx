import { useState } from 'react';
import { designScenarios } from '../data/designScenarios.js';
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';
import { getAllDesignProgress } from '../utils/designProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { FoundationNudgeCard } from '../components/shared/FoundationNudgeCard.jsx';

const LEVEL_COLORS = {
  staff_level:   { color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  senior_ready:  { color: 'var(--accent)',    bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  analyst_ready: { color: 'var(--blue-text)', bg: 'var(--blue-bg)',   border: 'var(--blue-border)' },
};

const DESIGN_DIFF_CFG = {
  analyst: { color: 'var(--blue-text)' },
  senior:  { color: 'var(--accent)' },
  staff:   { color: 'var(--teal)' },
};

export function DesignBrowser({ onSelectScenario, onOpenArticle, onNavigate }) {
  const [theoryActive, setTheoryActive] = useState(false);
  const allProgress = getAllDesignProgress();

  const completedIds = new Set(Object.keys(allProgress));
  const firstUnstartedId = designScenarios.find(s => !completedIds.has(s.id))?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--teal)', marginBottom: '0.4rem',
        }}>
          Design Room
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
          Experiment Design
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.6, maxWidth: '540px' }}>
          Most experiment mistakes are locked in before a single user is assigned — wrong randomization unit, primary metric that cannot move the business, no decision rule for the ambiguous outcome. Design forces you to make every call upfront, blind to the results, so you discover your reasoning gaps before they corrupt a live experiment.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem',
          fontSize: '0.75rem', color: 'var(--accent)',
        }}>
          <span>◆</span>
          <span>Pairs with Review Room scenarios</span>
        </div>
      </div>

      {/* Foundation nudge */}
      {onNavigate && (
        <FoundationNudgeCard foundationRoom="exp-foundations" foundationLabel="Exp Foundations" onNavigate={onNavigate} />
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

      {/* Scenario cards */}
      {!theoryActive && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {designScenarios.map((scenario, index) => {
          const progress = allProgress[scenario.id];
          const bestLevel = progress?.bestLevel;
          const levelCfg = bestLevel ? LEVEL_COLORS[bestLevel] : null;
          const diffCfg = DESIGN_DIFF_CFG[scenario.difficulty] || { color: 'var(--accent)' };
          const isNextUnstarted = scenario.id === firstUnstartedId;

          return (
            <div
              key={scenario.id}
              className="pal-card-enter pal-card-hover"
              style={{
                animationDelay: (Math.min(index * 28, 400)) + 'ms',
                border: '1.5px solid var(--border)',
                borderLeft: isNextUnstarted ? '3px solid var(--accent)' : '3px solid ' + diffCfg.color,
                borderRadius: 'var(--radius)',
                background: 'var(--surface)',
                padding: '1.1rem 1.25rem',
                cursor: 'pointer',
                transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
                position: 'relative',
              }}
              role="button"
              tabIndex={0}
              onClick={() => onSelectScenario(scenario.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectScenario(scenario.id); } }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent-border)';
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
                  color: 'var(--accent)', background: 'var(--accent-bg)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: 4, padding: '0.1rem 0.4rem',
                }}>
                  Next →
                </span>
              )}
              {/* Badges row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                <DifficultyBadge difficulty={scenario.difficulty} />
                <IndustryBadge industry={scenario.industry} />
                {scenario.pairedReviewScenarioId && (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                    borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
                  }}>◆ Paired</span>
                )}
                {levelCfg && (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: levelCfg.color, background: levelCfg.bg, border: `1px solid ${levelCfg.border}`,
                    borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
                  }}>{progress.bestLevel.replace(/_/g, ' ')}</span>
                )}
              </div>

              {/* Title + subtitle */}
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.2rem', letterSpacing: '-0.01em' }}>
                {scenario.title}
              </h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {scenario.subtitle}
              </p>

              {/* Progress */}
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                {progress?.attempts > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {progress.attempts} attempt{progress.attempts > 1 ? 's' : ''} ·{' '}
                      Best: {Math.round((progress.bestScore || 0) * 100)}%
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600 }}>
                      Resume →
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Not started
                  </span>
                )}

                {scenario.pairedReviewScenarioId && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Pairs with {scenario.pairedReviewScenarioId.replace(/^s\d+-/, '').replace(/-/g, ' ')} ↔
                  </span>
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
            {FOUNDATION_DOMAINS['experimentation'].articles.map(a => (
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

function DifficultyBadge({ difficulty }) {
  const cfg = {
    analyst: { label: 'Analyst', color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
    senior:  { label: 'Senior',  color: 'var(--accent)',    bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
    staff:   { label: 'Staff',   color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  }[difficulty] || { label: difficulty, color: 'var(--text-dim)', bg: 'var(--surface-2)', border: 'var(--border)' };

  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
    }}>{cfg.label}</span>
  );
}

function IndustryBadge({ industry }) {
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
    }}>{industry}</span>
  );
}
