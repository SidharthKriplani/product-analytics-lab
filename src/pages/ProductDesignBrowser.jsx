import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { productDesignScenarios } from '../data/productDesignScenarios.js';
import { getAllProductDesignProgress } from '../utils/productDesignProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';

const DIFFICULTY_CONFIG = {
  medium: { label: 'Mid-Level', color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  hard:   { label: 'Senior',    color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
};

const LEVEL_CONFIG = {
  excellent:     { label: 'Excellent',   color: 'var(--teal)' },
  strong:        { label: 'Strong',      color: 'var(--green)' },
  developing:    { label: 'Developing',  color: 'var(--yellow)' },
  needs_practice:{ label: 'Try Again',   color: 'var(--text-muted)' },
};

function DifficultyBadge({ difficulty }) {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.45rem',
    }}>
      {cfg.label}
    </span>
  );
}

function CategoryBadge({ category }) {
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
      color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.45rem',
    }}>
      {category}
    </span>
  );
}

export function ProductDesignBrowser({ onSelectScenario, unlocked, onUnlock, onOpenArticle }) {
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');
  const allProgress = getAllProductDesignProgress();

  const diffCounts = {
    all: productDesignScenarios.length,
    analyst: productDesignScenarios.filter(s => s.difficulty === 'analyst').length,
    senior: productDesignScenarios.filter(s => s.difficulty === 'senior').length,
    staff: productDesignScenarios.filter(s => s.difficulty === 'staff').length,
  };

  const completedIds = new Set(
    Object.keys(allProgress).filter(id => allProgress[id]?.completedPhaseIds?.length > 0)
  );
  const firstUnstartedId = productDesignScenarios.find(s => !completedIds.has(s.id))?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--purple-bg)', border: '1px solid var(--purple-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name='layout' size={18} color='var(--purple)' />
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Product Design Practice</h1>
        </div>
        <p style={{
          fontSize: '0.88rem', color: 'var(--text-secondary)',
          margin: '0 0 1rem', lineHeight: 1.6, maxWidth: '580px',
        }}>
          Product design questions fail not because candidates lack ideas but because they skip the hard part — defining who the user is before proposing solutions, or prioritizing without a defensible rationale. This room trains the full arc: from scoping the problem correctly through to defending your prioritization when the interviewer pushes back.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: 'var(--purple-bg)', border: '1px solid var(--purple-border)',
            borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem',
            fontSize: '0.72rem', color: 'var(--purple)',
          }}>
            ◆ 5 phases per scenario
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem',
            fontSize: '0.72rem', color: 'var(--text-muted)',
          }}>
            Self-scored with model answers
          </div>
        </div>
      </div>

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
        <DifficultyChips value={diffFilter} onChange={setDiffFilter} counts={diffCounts} />
        {productDesignScenarios.filter(s => diffFilter === 'all' || s.difficulty === diffFilter).map((scenario, idx) => {
          const progress = allProgress[scenario.id];
          const result = progress?.result;
          const levelCfg = result ? LEVEL_CONFIG[result.level] : null;
          const isLocked = !scenario.isFree && !unlocked;
          const phasesComplete = progress?.completedPhaseIds?.length || 0;
          const diffCfg = DIFFICULTY_CONFIG[scenario.difficulty] || DIFFICULTY_CONFIG.medium;
          const isNextUnstarted = scenario.id === firstUnstartedId;

          return (
            <div
              key={scenario.id}
              className="pal-card-enter pal-card-hover"
              style={{
                animationDelay: (Math.min(idx * 28, 400)) + 'ms',
                border: '1.5px solid var(--border)',
                borderLeft: isNextUnstarted ? '3px solid var(--purple)' : '3px solid ' + diffCfg.color,
                borderRadius: 'var(--radius)',
                background: 'var(--surface)',
                padding: '1.1rem 1.25rem',
                cursor: 'pointer',
                transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
                opacity: isLocked ? 0.7 : 1,
                position: 'relative',
              }}
              onClick={() => isLocked ? onUnlock?.() : onSelectScenario(scenario.id)}
              onMouseEnter={e => {
                if (!isLocked) {
                  e.currentTarget.style.borderColor = 'var(--purple-border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
                }
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
                  color: 'var(--purple)', background: 'var(--purple-bg)',
                  border: '1px solid var(--purple-border)',
                  borderRadius: 4, padding: '0.1rem 0.4rem',
                }}>
                  Next →
                </span>
              )}
              {/* Badges row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                {/* Company dot */}
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700,
                  color: scenario.companyColor || 'var(--accent)',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.45rem',
                }}>
                  {scenario.company}
                </span>
                <DifficultyBadge difficulty={scenario.difficulty} />
                <CategoryBadge category={scenario.category} />
                {scenario.isFree && idx === 0 && (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)',
                    borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
                  }}>
                    Free
                  </span>
                )}
                {isLocked && (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)',
                    marginLeft: 'auto',
                  }}>
                    <Icon name='lock' size={11} color='currentColor' /> Unlock
                  </span>
                )}
              </div>

              {/* Title */}
              <div style={{
                fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)',
                lineHeight: 1.35, marginBottom: '0.35rem',
              }}>
                {scenario.title}
              </div>

              {/* Prompt preview */}
              <div style={{
                fontSize: '0.8rem', color: 'var(--text-muted)',
                lineHeight: 1.55, marginBottom: '0.6rem',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {scenario.prompt.split('\n\n')[0]}
              </div>

              {/* Footer row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {/* Phase progress pips */}
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {scenario.phases.map((p, i) => (
                      <div key={p.id} style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: i < phasesComplete ? 'var(--purple)' : 'var(--border)',
                        transition: 'background 0.15s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {phasesComplete === 0
                      ? '5 phases'
                      : phasesComplete === scenario.phases.length
                        ? 'Completed'
                        : `${phasesComplete}/${scenario.phases.length} phases`}
                  </span>
                </div>

                {levelCfg && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    color: levelCfg.color,
                  }}>
                    {levelCfg.label}
                  </span>
                )}

                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  ~25 min →
                </span>
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
            {FOUNDATION_DOMAINS['product-design'].articles.map(a => (
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

      {/* Footer note */}
      <div style={{
        marginTop: '2rem', padding: '0.9rem 1.1rem',
        background: 'var(--purple-bg)', border: '1px solid var(--purple-border)',
        borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--text-secondary)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--purple)' }}>How it works:</strong> Each scenario presents a real product design challenge. Write your answer for each phase, then reveal the model answer. Self-rate your response (Strong / Partial / Missed), and move to the next phase. No wrong answers — the goal is to build a mental model of how senior PMs structure product thinking.
      </div>
    </div>
  );
}
