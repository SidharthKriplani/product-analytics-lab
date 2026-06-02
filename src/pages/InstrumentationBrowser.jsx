import { useState } from 'react';
import { instrumentationCases } from '../data/instrumentationCases.js';
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';
import { getAllInstrumentationProgress } from '../utils/instrumentationProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';

const DIFF_CFG = {
  junior: { label: 'Junior', color: 'var(--blue-text)', bg: 'var(--blue-bg)',    border: 'var(--blue-border)' },
  senior: { label: 'Senior', color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  staff:  { label: 'Staff',  color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
};

const DOMAIN_LABEL = {
  'measurement-plan':       'Measurement Plan',
  'event-taxonomy':         'Event Taxonomy',
  'data-quality':           'Data Quality',
  'ab-test-instrumentation': 'A/B Instrumentation',
  'privacy-consent':        'Privacy & Consent',
  'data-contracts':         'Data Contracts',
};

const FILTER_CHIPS = [
  { key: 'All',                    label: 'All' },
  { key: 'measurement-plan',       label: 'Measurement Plan' },
  { key: 'event-taxonomy',         label: 'Event Taxonomy' },
  { key: 'data-quality',           label: 'Data Quality' },
  { key: 'ab-test-instrumentation', label: 'A/B Instrumentation' },
  { key: 'privacy-consent',        label: 'Privacy' },
  { key: 'data-contracts',         label: 'Data Contracts' },
];

function matchesFilter(domain, filter) {
  if (filter === 'All') return true;
  return domain === filter;
}

const DIFF_ORDER = { junior: 0, senior: 1, staff: 2 };

export function InstrumentationBrowser({ onSelectCase, unlocked, onOpenArticle }) {
  const allProgress = getAllInstrumentationProgress();
  const completedCount = Object.keys(allProgress).length;
  const [activeFilter, setActiveFilter] = useState('All');
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');

  const diffCounts = {
    all: instrumentationCases.length,
    analyst: instrumentationCases.filter(c => c.difficulty === 'analyst' || c.difficulty === 'junior').length,
    senior: instrumentationCases.filter(c => c.difficulty === 'senior').length,
    staff: instrumentationCases.filter(c => c.difficulty === 'staff').length,
  };

  const filtered = instrumentationCases
    .filter(c => matchesFilter(c.domain, activeFilter))
    .filter(c => diffFilter === 'all' || c.difficulty === diffFilter || (diffFilter === 'analyst' && c.difficulty === 'junior'))
    .slice()
    .sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);

  const completedIds = new Set(Object.keys(allProgress));
  const firstUnstartedId = instrumentationCases.find(c => !completedIds.has(c.id))?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{
            width: '36px', height: '36px', borderRadius: '9px',
            background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
          }}>
            📡
          </span>
          <div>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '0.15rem',
            }}>
              Analytics Instrumentation Room
            </div>
            <h1 style={{
              fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)',
              margin: 0, letterSpacing: '-0.02em',
            }}>
              Analytics Instrumentation
            </h1>
          </div>
        </div>

        <p style={{
          color: 'var(--text-muted)', fontSize: '0.95rem',
          margin: '0 0 0.75rem', maxWidth: '640px', lineHeight: 1.6,
        }}>
          Bad tracking is invisible until it's too late — you've run a six-week experiment on data you can't trust, or shipped a feature with no way to measure it. Instrumentation is tested in senior interviews because it separates analysts who can design measurement systems from those who can only query them. This room covers event tracking, measurement plans, data contracts, and how to catch quality issues before they corrupt your analysis.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            12 cases · Junior–Staff · 18–35 min each
          </span>
          {completedCount > 0 && (
            <span style={{ fontSize: '0.82rem', color: 'var(--teal)' }}>
              ✓ {completedCount} completed
            </span>
          )}
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            {instrumentationCases.filter(c => c.isFree).length} free to try
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

      {/* Domain filter chips */}
      {!theoryActive && (
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {FILTER_CHIPS.map(chip => {
          const isActive = activeFilter === chip.key;
          return (
            <button
              key={chip.key}
              onClick={() => setActiveFilter(chip.key)}
              style={{
                background: isActive ? 'var(--teal-bg)' : 'var(--surface)',
                border: '1px solid ' + (isActive ? 'var(--teal-border)' : 'var(--border)'),
                borderRadius: '20px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--teal)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
      )}

      {/* Difficulty filter chips */}
      {!theoryActive && (
        <DifficultyChips value={diffFilter} onChange={setDiffFilter} counts={diffCounts} />
      )}

      {/* Case cards */}
      {!theoryActive && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))',
        gap: '0.85rem',
      }}>
        {filtered.map((c, index) => {
          const prog = allProgress[c.id];
          const isLocked = !c.isFree && !unlocked;
          const diffCfg = DIFF_CFG[c.difficulty] || DIFF_CFG.junior;
          const isNextUnstarted = c.id === firstUnstartedId;

          return (
            <div
              key={c.id}
              className="pal-card-enter pal-card-hover"
              style={{
                animationDelay: String(Math.min(index * 28, 400)) + 'ms',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: isNextUnstarted ? '3px solid var(--teal)' : '3px solid ' + diffCfg.color,
                borderRadius: '10px',
                padding: '1.1rem 1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                opacity: isLocked ? 0.7 : 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                position: 'relative',
              }}
              role="button"
              tabIndex={0}
              onClick={() => onSelectCase(c.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectCase(c.id); } }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--teal-border)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
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
                  color: 'var(--teal)', background: 'var(--teal-bg)',
                  border: '1px solid var(--teal-border)',
                  borderRadius: 4, padding: '0.1rem 0.4rem',
                }}>
                  Next →
                </span>
              )}
              {/* Badge row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dim)',
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  {c.id}
                </span>

                <span style={{
                  fontSize: '0.7rem', fontWeight: 600,
                  color: diffCfg.color, background: diffCfg.bg,
                  border: '1px solid ' + diffCfg.border,
                  borderRadius: '4px', padding: '0.1rem 0.4rem',
                }}>
                  {diffCfg.label}
                </span>

                <span style={{
                  fontSize: '0.7rem', fontWeight: 500,
                  color: 'var(--teal)', background: 'var(--teal-bg)',
                  border: '1px solid var(--teal-border)',
                  borderRadius: '4px', padding: '0.1rem 0.4rem',
                }}>
                  {DOMAIN_LABEL[c.domain] || c.domain}
                </span>

                <span style={{
                  fontSize: '0.7rem', fontWeight: 500,
                  color: 'var(--text-dim)', background: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px', padding: '0.1rem 0.4rem',
                }}>
                  {c.company}
                </span>

                {c.isFree && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    color: 'var(--green)', background: 'var(--green-bg)',
                    border: '1px solid var(--green-border)',
                    borderRadius: '4px', padding: '0.1rem 0.4rem',
                  }}>
                    Free
                  </span>
                )}

                {isLocked && <span style={{ fontSize: '0.75rem' }}>🔒</span>}

                {prog && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    color: 'var(--teal)',
                    marginLeft: 'auto',
                  }}>
                    ✓ Done
                  </span>
                )}
              </div>

              {/* Title + subtitle */}
              <div>
                <div style={{
                  fontWeight: 600, fontSize: '0.97rem', color: 'var(--text)', marginBottom: '0.15rem',
                }}>
                  {c.title}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {c.subtitle}
                </div>
              </div>

              {/* Tags + time row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.15rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', flex: 1 }}>
                  {c.tags.slice(0, 3).map(tag => (
                    <span key={tag} style={{
                      fontSize: '0.7rem', color: 'var(--text-dim)',
                      background: 'var(--surface-2)', borderRadius: '4px',
                      padding: '0.1rem 0.4rem', border: '1px solid var(--border-subtle)',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  ~{c.estimatedMin} min
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={e => { e.stopPropagation(); onSelectCase(c.id); }}
                style={{
                  marginTop: '0.25rem',
                  background: 'var(--teal-bg)',
                  border: '1px solid var(--teal-border)',
                  borderRadius: '7px',
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--teal)',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal)'; e.currentTarget.style.color = '#001a1a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--teal-bg)'; e.currentTarget.style.color = 'var(--teal)'; }}
              >
                Start Case →
              </button>
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
            {FOUNDATION_DOMAINS['instrumentation'].articles.map(a => (
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
