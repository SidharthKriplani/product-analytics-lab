import { useState } from 'react';
import { biCases } from '../data/biCases.js';
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';
import { getAllBIProgress } from '../utils/biProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';

const DIFF_CFG = {
  analyst: { label: 'Analyst', color: 'var(--blue-text)', bg: 'var(--blue-bg)',    border: 'var(--blue-border)' },
  senior:  { label: 'Senior',  color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  staff:   { label: 'Staff',   color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
};

const DOMAIN_LABEL = {
  'data-storytelling':  'Data Storytelling',
  'kpi-framework':      'KPI Framework',
  'attribution':        'Attribution',
  'dashboard-audit':    'Dashboard Audit',
  'data-quality':       'Data Quality',
  'executive-reporting': 'Executive Reporting',
};

const DOMAIN_FILTER_LABELS = {
  'data-storytelling':  'Dashboard',
  'kpi-framework':      'KPI Framework',
  'attribution':        'Attribution',
  'dashboard-audit':    'Dashboard',
  'data-quality':       'Data Quality',
  'executive-reporting': 'Executive',
};

// Deduplicated filter chips in a fixed order
const FILTER_CHIPS = [
  { key: 'All',                 label: 'All' },
  { key: 'dashboard',           label: 'Dashboard' },
  { key: 'kpi-framework',       label: 'KPI Framework' },
  { key: 'attribution',         label: 'Attribution' },
  { key: 'data-quality',        label: 'Data Quality' },
  { key: 'executive-reporting', label: 'Executive' },
];

function matchesFilter(domain, filter) {
  if (filter === 'All') return true;
  if (filter === 'dashboard') return domain === 'data-storytelling' || domain === 'dashboard-audit';
  return domain === filter;
}

const DIFF_ORDER = { analyst: 0, senior: 1, staff: 2 };

const RATING_COLOR = {
  strong:  'var(--green)',
  partial: 'var(--yellow)',
  miss:    'var(--red)',
};

export function BIBrowser({ onSelectCase, unlocked, onOpenArticle }) {
  const allProgress = getAllBIProgress();
  const completedCount = Object.keys(allProgress).length;
  const [activeFilter, setActiveFilter] = useState('All');
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');

  const diffCounts = {
    all: biCases.length,
    analyst: biCases.filter(c => c.difficulty === 'analyst').length,
    senior: biCases.filter(c => c.difficulty === 'senior').length,
    staff: biCases.filter(c => c.difficulty === 'staff').length,
  };

  const filtered = biCases
    .filter(c => matchesFilter(c.domain, activeFilter))
    .filter(c => diffFilter === 'all' || c.difficulty === diffFilter)
    .slice()
    .sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);

  const completedIds = new Set(Object.keys(allProgress));
  const firstUnstartedId = biCases.find(c => !completedIds.has(c.id))?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{
            width: '36px', height: '36px', borderRadius: '9px',
            background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 700, color: 'var(--yellow)', flexShrink: 0,
          }}>
            BI
          </span>
          <div>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--yellow)', marginBottom: '0.15rem',
            }}>
              BI &amp; Reporting Room
            </div>
            <h1 style={{
              fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)',
              margin: 0, letterSpacing: '-0.02em',
            }}>
              Business Intelligence
            </h1>
          </div>
        </div>

        <p style={{
          color: 'var(--text-muted)', fontSize: '0.95rem',
          margin: '0 0 0.75rem', maxWidth: '640px', lineHeight: 1.6,
        }}>
          BI work is where analytics meets executive decisions — dashboards, attribution models, KPI frameworks, and data storytelling. The interview test isn't whether you can build a dashboard; it's whether you know which metric belongs on it, why, and what story it's actually telling. This room trains that judgment across real BI scenarios.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            8 cases · Analyst–Staff · 15–20 min each
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 96, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round(completedCount / biCases.length * 100))}%`, background: 'var(--yellow)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{completedCount}/{biCases.length}</span>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            {biCases.filter(c => c.isFree).length} free to try
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
                background: isActive ? 'var(--yellow-bg)' : 'var(--surface)',
                border: `1px solid ${isActive ? 'var(--yellow-border)' : 'var(--border)'}`,
                borderRadius: '20px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--yellow)' : 'var(--text-muted)',
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

      {/* Case cards — 2-col grid on desktop, 1-col on mobile */}
      {!theoryActive && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))',
        gap: '0.85rem',
      }}>
        {filtered.map((c, index) => {
          const prog = allProgress[c.id];
          const isLocked = !c.isFree && !unlocked;
          const diffCfg = DIFF_CFG[c.difficulty] || DIFF_CFG.analyst;
          const isNextUnstarted = c.id === firstUnstartedId;

          return (
            <div
              key={c.id}
              className="pal-card-enter pal-card-hover"
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
                e.currentTarget.style.borderColor = 'var(--yellow-border)';
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
                  color: 'var(--yellow)', background: 'var(--yellow-bg)',
                  border: '1px solid var(--yellow-border)',
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
                  border: `1px solid ${diffCfg.border}`,
                  borderRadius: '4px', padding: '0.1rem 0.4rem',
                }}>
                  {diffCfg.label}
                </span>

                <span style={{
                  fontSize: '0.7rem', fontWeight: 500,
                  color: 'var(--yellow)', background: 'var(--yellow-bg)',
                  border: '1px solid var(--yellow-border)',
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
                    color: RATING_COLOR[prog.rating] || 'var(--yellow)',
                    marginLeft: 'auto',
                  }}>
                    {prog.rating === 'strong' ? '✓ Nailed it' : prog.rating === 'partial' ? '~ Close' : '✗ Revisit'}
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
                  background: 'var(--yellow-bg)',
                  border: '1px solid var(--yellow-border)',
                  borderRadius: '7px',
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--yellow)',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--yellow)'; e.currentTarget.style.color = '#1a1400'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--yellow-bg)'; e.currentTarget.style.color = 'var(--yellow)'; }}
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
            {FOUNDATION_DOMAINS['bi'].articles.map(a => (
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
