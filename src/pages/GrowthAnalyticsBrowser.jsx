import { Icon } from '../components/shared/Icon.jsx';
import { useState } from 'react';
import { growthAnalyticsCases } from '../data/growthAnalyticsCases.js';
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';
import { getAllGrowthAnalyticsProgress } from '../utils/growthAnalyticsProgress.js';
import { isBookmarked } from '../utils/bookmarks.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';

const DIFF_CFG = {
  analyst: { label: 'Analyst', color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
  senior:  { label: 'Senior',  color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  staff:   { label: 'Staff',   color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
};

const DOMAIN_LABEL = {
  'growth-accounting': 'Growth Accounting',
  'retention':         'Retention',
  'funnel':            'Funnel',
  'ltv':               'LTV',
  'engagement':        'Engagement',
  'acquisition':       'Acquisition',
};

const RATING_COLOR = {
  strong:  'var(--green)',
  partial: 'var(--yellow)',
  miss:    'var(--red)',
};

// Collect unique domains from cases in order of first appearance
const ALL_DOMAINS = ['All', ...Array.from(new Set(growthAnalyticsCases.map(c => c.domain)))];

export function GrowthAnalyticsBrowser({ onSelectCase, unlocked, onOpenArticle, onNavigate }) {
  const allProgress = getAllGrowthAnalyticsProgress();
  const completedCount = Object.keys(allProgress).length;
  const [activeDomain, setActiveDomain] = useState('All');
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');

  const diffCounts = {
    all: growthAnalyticsCases.length,
    analyst: growthAnalyticsCases.filter(c => c.difficulty === 'analyst').length,
    senior: growthAnalyticsCases.filter(c => c.difficulty === 'senior').length,
    staff: growthAnalyticsCases.filter(c => c.difficulty === 'staff').length,
  };

  const domainFiltered = activeDomain === 'All'
    ? growthAnalyticsCases
    : growthAnalyticsCases.filter(c => c.domain === activeDomain);

  const filteredCases = domainFiltered.filter(c => diffFilter === 'all' || c.difficulty === diffFilter);

  const completedIds = new Set(Object.keys(allProgress));
  const firstUnstartedId = growthAnalyticsCases.find(c => !completedIds.has(c.id))?.id;

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
            ↗
          </span>
          <div>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '0.15rem',
            }}>
              Growth Analytics Room
            </div>
            <h1 style={{
              fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)',
              margin: 0, letterSpacing: '-0.02em',
            }}>
              Growth Analytics
            </h1>
          </div>
        </div>

        <p style={{
          color: 'var(--text-muted)', fontSize: '0.95rem',
          margin: '0 0 0.75rem', maxWidth: '640px', lineHeight: 1.6,
        }}>
          Growth analytics is where "the metric is up" most often hides a real problem — acquisition gaming, retention hollowed out by churned power users, LTV inflated by one segment. The interview test is diagnostic instinct: can you decompose before you celebrate, segment before you conclude, and spot what the top-line number is obscuring? This room builds that through real practitioner scenarios.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            {growthAnalyticsCases.length} cases
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 96, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round(completedCount / growthAnalyticsCases.length * 100))}%`, background: 'var(--teal)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{completedCount}/{growthAnalyticsCases.length}</span>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            {growthAnalyticsCases.filter(c => c.isFree).length} free to try
          </span>
        </div>
      </div>

      {/* Theory hint */}
              {onNavigate && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.7rem 1rem',
            background: 'var(--green-bg)',
            borderLeft: '3px solid var(--green)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
          }}>
            <Icon name="book-open" size={14} color="var(--green)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--green)', marginBottom: '0.15rem' }}>Recommended starting point</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <button onClick={() => onNavigate('metrics-foundations')} style={{
                  background: 'none', border: 'none', padding: 0,
                  color: 'var(--green)', fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.78rem',
                }}>Metrics Foundations</button>
                {' '}builds the mental models these cases assume.
              </div>
            </div>
          </div>
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

      {/* Domain filter chips */}
      {!theoryActive && (
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {ALL_DOMAINS.map(domain => {
          const isActive = activeDomain === domain;
          return (
            <button
              key={domain}
              onClick={() => setActiveDomain(domain)}
              style={{
                background: isActive ? 'var(--teal-bg)' : 'var(--surface)',
                border: `1px solid ${isActive ? 'var(--teal-border)' : 'var(--border)'}`,
                borderRadius: '20px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--teal)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
              }}
            >
              {domain === 'All' ? 'All' : (DOMAIN_LABEL[domain] || domain)}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredCases.map((c, index) => {
          const prog = allProgress[c.id];
          const isLocked = !c.isFree && !unlocked;
          const diffCfg = DIFF_CFG[c.difficulty] || DIFF_CFG.analyst;
          const bookmarked = isBookmarked('growth-analytics', c.id);
          const isNextUnstarted = c.id === firstUnstartedId;

          return (
            <div
              key={c.id}
              className="pal-card-enter pal-card-hover"
              role="button"
              tabIndex={0}
              onClick={() => onSelectCase(c.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectCase(c.id); } }}
              style={{
                animationDelay: (Math.min(index * 28, 400)) + 'ms',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: isNextUnstarted ? '3px solid var(--green)' : '3px solid ' + diffCfg.color,
                borderRadius: '10px',
                padding: '1.1rem 1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                opacity: isLocked ? 0.7 : 1,
                position: 'relative',
              }}
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
                  position: 'absolute', top: '0.6rem', right: bookmarked ? '2.5rem' : '0.7rem',
                  fontSize: '0.68rem', fontWeight: 700,
                  color: 'var(--green)', background: 'var(--green-bg)',
                  border: '1px solid var(--green-border)',
                  borderRadius: 4, padding: '0.1rem 0.4rem',
                }}>
                  Next →
                </span>
              )}
              {/* Bookmark indicator (top-right corner, non-interactive) */}
              {bookmarked && (
                <span
                  title="Bookmarked"
                  style={{
                    position: 'absolute', top: '0.6rem', right: '0.75rem',
                    fontSize: '0.85rem', pointerEvents: 'none',
                    lineHeight: 1,
                  }}
                >
                  🔖
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
                      color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                    }}>
                      {diffCfg.label}
                    </span>

                    <span style={{
                      fontSize: '0.7rem', fontWeight: 500,
                      color: 'var(--teal)', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                    }}>
                      {DOMAIN_LABEL[c.domain] || c.domain}
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

                    {prog && (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600,
                        color: RATING_COLOR[prog.rating] || 'var(--teal)',
                      }}>
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div style={{
                    fontWeight: 600, fontSize: '0.97rem', color: 'var(--text)', marginBottom: '0.2rem',
                    paddingRight: bookmarked ? '1.5rem' : 0,
                  }}>
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
                {prog && (
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: RATING_COLOR[prog.rating] || 'var(--teal)',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '0.3rem 0.6rem',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {prog.rating === 'strong'
                      ? '✓ Nailed it'
                      : prog.rating === 'partial'
                      ? '~ Close'
                      : '✗ Revisit'}
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
            {FOUNDATION_DOMAINS['growth'].articles.map(a => (
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
