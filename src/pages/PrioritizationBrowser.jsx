import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { prioritizationScenarios } from '../data/prioritizationScenarios.js';
import { getAllPrioritizationProgress } from '../utils/prioritizationProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';

const TAGS = ['All', 'RICE', 'effort-impact', 'technical debt', 'stakeholder conflict', 'OKRs', 'platform vs. feature'];

const DIFFICULTY_COLOR = {
  analyst: { color: 'var(--accent)',  bg: 'var(--accent-bg)',  border: 'var(--accent-border)' },
  senior:  { color: 'var(--teal)',    bg: 'var(--teal-bg)',    border: 'var(--teal-border)'   },
  staff:   { color: 'var(--yellow)',  bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
};

const RATING_COLOR = {
  strong:  'var(--green)',
  partial: 'var(--yellow)',
  miss:    'var(--red)',
};

export function PrioritizationBrowser({ onStart, unlocked, onOpenArticle }) {
  const [activeTag, setActiveTag] = useState('All');
  const [diffFilter, setDiffFilter] = useState('all');
  const [theoryActive, setTheoryActive] = useState(false);
  const progress = getAllPrioritizationProgress();

  const diffCounts = {
    all: prioritizationScenarios.length,
    analyst: prioritizationScenarios.filter(s => s.difficulty === 'analyst').length,
    senior: prioritizationScenarios.filter(s => s.difficulty === 'senior').length,
    staff: prioritizationScenarios.filter(s => s.difficulty === 'staff').length,
  };

  const filtered = prioritizationScenarios
    .filter(s => activeTag === 'All' || s.tags.includes(activeTag))
    .filter(s => diffFilter === 'all' || s.difficulty === diffFilter);

  const completedCount = Object.keys(progress).length;
  const completedIds = new Set(Object.keys(progress));
  const firstUnstartedId = prioritizationScenarios.find(s => !completedIds.has(s.id))?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--purple-bg)', border: '1px solid var(--purple-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name='list' size={18} color='var(--purple)' />
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Prioritization Room</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '600px' }}>
          The bar in prioritization interviews is not picking the right project — it is defending the tradeoff when the interviewer introduces constraints you did not plan for. This room puts you in real resource and stakeholder conflicts, then shows you how senior PMs reason through them without falling back on a framework as a shield.
        </p>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            {prioritizationScenarios.length} scenarios
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 96, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round(completedCount / prioritizationScenarios.length * 100))}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{completedCount}/{prioritizationScenarios.length}</span>
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

      {/* Tag filter */}
      {!theoryActive && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              border: activeTag === tag ? '1px solid var(--purple-border)' : '1px solid var(--border)',
              background: activeTag === tag ? 'var(--purple-bg)' : 'var(--surface)',
              color: activeTag === tag ? 'var(--purple)' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: activeTag === tag ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {tag}
          </button>
        ))}
      </div>
      )}

      {/* Scenario cards */}
      {!theoryActive && (
      <>
        <DifficultyChips value={diffFilter} onChange={setDiffFilter} counts={diffCounts} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filtered.map((scenario, index) => {
          const prog = progress[scenario.id];
          const isLocked = !scenario.isFree && !unlocked;
          const dc = DIFFICULTY_COLOR[scenario.difficulty] || {};
          const isNextUnstarted = scenario.id === firstUnstartedId;

          return (
            <div
              key={scenario.id}
              className="pal-card-enter pal-card-hover"
              onClick={() => onStart(scenario.id)}
              style={{
                background: 'var(--surface)',
                animationDelay: (Math.min(index * 28, 400)) + 'ms',
                border: '1px solid var(--border)',
                borderLeft: isNextUnstarted ? '3px solid var(--accent)' : ('3px solid ' + (dc.color || 'var(--border)')),
                borderRadius: '10px',
                padding: '1.1rem 1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                position: 'relative',
                opacity: isLocked ? 0.7 : 1,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--purple-border)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
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
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    {/* Company */}
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {scenario.company}
                    </span>
                    {/* Difficulty */}
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600,
                      color: dc.color, background: dc.bg, border: '1px solid ' + dc.border,
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                    }}>
                      {scenario.difficulty}
                    </span>
                    {/* Free badge */}
                    {scenario.isFree && (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600,
                        color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)',
                        borderRadius: '4px', padding: '0.1rem 0.4rem',
                      }}>Free</span>
                    )}
                    {isLocked && <span style={{ fontSize: '0.75rem' }}>🔒</span>}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.97rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                    {scenario.title}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                    {scenario.subtitle}
                  </div>
                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {scenario.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: '0.72rem', color: 'var(--text-dim)',
                        background: 'var(--surface-2)', borderRadius: '4px',
                        padding: '0.1rem 0.45rem', border: '1px solid var(--border-subtle)',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Completion indicator */}
                {prog && (
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: RATING_COLOR[prog.rating] || 'var(--text-muted)',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '0.3rem 0.6rem',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {prog.rating === 'strong' ? '✓ Nailed it' : prog.rating === 'partial' ? '~ Partial' : '✗ Revisit'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}

      {theoryActive && (
        <div>
          <div style={{ marginBottom: '1rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            Read the theory, then practice it in the cases above.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '0.75rem' }}>
            {FOUNDATION_DOMAINS['prioritization'].articles.map(a => (
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
