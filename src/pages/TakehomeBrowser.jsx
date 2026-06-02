import { useState } from 'react';
import { takehomeCases } from '../data/takehomeCases.js';
import { getAllTakehomeProgress } from '../utils/takehomeProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';
import { Icon } from '../components/shared/Icon.jsx';

const TRACK_LABEL = {
  ds: 'Data Science',
  pm: 'Product Management',
  both: 'DS + PM',
};

const TRACK_COLOR = {
  ds: { color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
  pm: { color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
  both: { color: 'var(--teal)', bg: 'var(--teal-bg)', border: 'var(--teal-border)' },
};

const DIFF_CFG = {
  senior: { label: 'Senior', color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  staff:  { label: 'Staff',  color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
};

const RATING_COLOR = {
  strong:       'var(--green)',
  partial:      'var(--yellow)',
  'needs-work': 'var(--red)',
};

const FILTERS = [
  { id: 'all',    label: 'All' },
  { id: 'ds',     label: 'DS Track' },
  { id: 'pm',     label: 'PM Track' },
  { id: '45',     label: '45 min' },
  { id: '60',     label: '60 min' },
  { id: '90',     label: '90 min' },
];

export function TakehomeBrowser({ onSelectCase, unlocked, onOpenArticle }) {
  const allProgress = getAllTakehomeProgress();
  const completedCount = Object.keys(allProgress).length;
  const [activeFilter, setActiveFilter] = useState('all');
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');

  const diffCounts = {
    all: takehomeCases.length,
    analyst: takehomeCases.filter(c => c.difficulty === 'analyst').length,
    senior: takehomeCases.filter(c => c.difficulty === 'senior').length,
    staff: takehomeCases.filter(c => c.difficulty === 'staff').length,
  };

  const filteredCases = takehomeCases.filter(c => {
    if (diffFilter !== 'all' && c.difficulty !== diffFilter) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'ds') return c.track === 'ds' || c.track === 'both';
    if (activeFilter === 'pm') return c.track === 'pm' || c.track === 'both';
    if (activeFilter === '45') return c.durationMin === 45;
    if (activeFilter === '60') return c.durationMin === 60;
    if (activeFilter === '90') return c.durationMin === 90;
    return true;
  });

  function getProgressStatus(caseId) {
    const prog = allProgress[caseId];
    if (!prog) return 'not-started';
    if (prog.completedAt) return 'completed';
    return 'in-progress';
  }

  const firstUnstartedId = takehomeCases.find(c => !allProgress[c.id]?.completedAt)?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{
            width: '36px', height: '36px', borderRadius: '9px',
            background: 'var(--green-bg)', border: '1px solid var(--green-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
          }}>
            <Icon name="file-text" size={18} color="var(--green)" />
          </span>
          <div>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--green)', marginBottom: '0.15rem',
            }}>
              Take-Home Challenges
            </div>
            <h1 style={{
              fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)',
              margin: 0, letterSpacing: '-0.02em',
            }}>
              Take-Home Challenges
            </h1>
          </div>
        </div>

        <p style={{
          color: 'var(--text-muted)', fontSize: '0.95rem',
          margin: '0 0 0.75rem', maxWidth: '640px', lineHeight: 1.6,
        }}>
          Take-home assignments are where the bar is highest — no interviewer to course-correct you, no time pressure as an excuse, and the expectation that your thinking is fully structured end-to-end. This room simulates that format: timed, open-ended, self-graded against a detailed rubric. Each challenge mirrors a real take-home from top companies, and the rubric shows exactly where strong candidates separate from the rest.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            {takehomeCases.length} challenges
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 96, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round(completedCount / takehomeCases.length * 100))}%`, background: 'var(--green)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{completedCount}/{takehomeCases.length}</span>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            {takehomeCases.filter(c => c.isFree).length} free to try
          </span>
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

      {/* Difficulty filter chips */}
      {!theoryActive && (
        <DifficultyChips value={diffFilter} onChange={setDiffFilter} counts={diffCounts} />
      )}

      {/* Filter chips */}
      {!theoryActive && (
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {FILTERS.map(f => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                background: isActive ? 'var(--green-bg)' : 'var(--surface)',
                border: '1px solid ' + (isActive ? 'var(--green-border)' : 'var(--border)'),
                borderRadius: '20px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--green)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      )}

      {/* Case cards */}
      {!theoryActive && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredCases.map((c, index) => {
          const prog = allProgress[c.id];
          const status = getProgressStatus(c.id);
          const isLocked = !c.isFree && !unlocked;
          const trackCfg = TRACK_COLOR[c.track] || TRACK_COLOR.both;
          const diffCfg = DIFF_CFG[c.difficulty] || DIFF_CFG.senior;
          const isNextUnstarted = c.id === firstUnstartedId;

          return (
            <div
              key={c.id}
              className="pal-card-enter pal-card-hover"
              role='button'
              tabIndex={0}
              onClick={() => onSelectCase(c.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectCase(c.id); } }}
              style={{
                animationDelay: String(Math.min(index * 28, 400)) + 'ms',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: isNextUnstarted ? '3px solid var(--yellow)' : '3px solid ' + diffCfg.color,
                borderRadius: '10px',
                padding: '1.1rem 1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                opacity: isLocked ? 0.7 : 1,
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--green-border)';
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
                  color: 'var(--yellow)', background: 'var(--yellow-bg)',
                  border: '1px solid var(--yellow-border)',
                  borderRadius: 4, padding: '0.1rem 0.4rem',
                }}>
                  Next →
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  {/* Badge row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)',
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}>
                      {c.id}
                    </span>

                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600,
                      color: diffCfg.color, background: diffCfg.bg, border: '1px solid ' + diffCfg.border,
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                    }}>
                      {diffCfg.label}
                    </span>

                    <span style={{
                      fontSize: '0.7rem', fontWeight: 500,
                      color: trackCfg.color, background: trackCfg.bg, border: '1px solid ' + trackCfg.border,
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                    }}>
                      {TRACK_LABEL[c.track] || c.track}
                    </span>

                    <span style={{
                      fontSize: '0.7rem', fontWeight: 500,
                      color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)',
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                    }}>
                      {c.durationMin} min
                    </span>

                    <span style={{
                      fontSize: '0.7rem', fontWeight: 500,
                      color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                    }}>
                      {c.company}
                    </span>

                    {c.isFree && (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600,
                        color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)',
                        borderRadius: '4px', padding: '0.1rem 0.4rem',
                      }}>
                        Free
                      </span>
                    )}

                    {isLocked && <span style={{ fontSize: '0.75rem' }}>🔒</span>}

                    {status === 'completed' && (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600,
                        color: RATING_COLOR[prog.rating] || 'var(--green)',
                      }}>
                        ✓
                      </span>
                    )}

                    {status === 'in-progress' && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--yellow)', fontWeight: 600 }}>
                        ● In Progress
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div style={{ fontWeight: 600, fontSize: '0.97rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                    {c.title}
                  </div>

                  {/* Subtitle */}
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.55rem' }}>
                    {c.subtitle}
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {c.tags.map(tag => (
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
                {status === 'completed' && prog && (
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: RATING_COLOR[prog.rating] || 'var(--green)',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '0.3rem 0.6rem',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {prog.rating === 'strong'
                      ? '✓ Strong'
                      : prog.rating === 'partial'
                      ? '~ Partial'
                      : '✗ Needs Work'}
                  </div>
                )}

                {/* Not started: show duration hint */}
                {status === 'not-started' && (
                  <div style={{
                    fontSize: '0.75rem', color: 'var(--text-dim)',
                    background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
                    borderRadius: '6px', padding: '0.3rem 0.6rem',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {c.durationMin} min challenge
                  </div>
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
            {FOUNDATION_DOMAINS['takehome'].articles.map(a => (
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
