import { useState } from 'react';
import { growthAnalyticsCases } from '../data/growthAnalyticsCases.js';
import { getAllGrowthAnalyticsProgress } from '../utils/growthAnalyticsProgress.js';
import { isBookmarked } from '../utils/bookmarks.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { Icon } from '../components/shared/Icon.jsx';
import { RoomHeader } from '../components/shared/RoomHeader.jsx';
import { FilterBar } from '../components/shared/FilterBar.jsx';
import { CaseCard } from '../components/shared/CaseCard.jsx';
import { AddTrackBtn } from '../components/tracks/AddToTrackPopover.jsx';

const DOMAIN_LABEL = {
  'growth-accounting': 'Growth Accounting',
  'retention':         'Retention',
  'funnel':            'Funnel',
  'ltv':               'LTV',
  'engagement':        'Engagement',
  'acquisition':       'Acquisition',
};

const RATING_LABEL = { strong: 'Nailed it', partial: 'Close', miss: 'Revisit' };

const DIFF_ORDER = { analyst: 0, senior: 1, staff: 2 };

// Collect unique domains from cases in order of first appearance
const ALL_DOMAINS = Array.from(new Set(growthAnalyticsCases.map(c => c.domain)));

export function GrowthAnalyticsBrowser({ onSelectCase, unlocked, onOpenArticle, onNavigate }) {
  const allProgress = getAllGrowthAnalyticsProgress();
  const completedCount = Object.keys(allProgress).length;
  const [activeDomain, setActiveDomain] = useState('All');
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');

  // ── Filtering (semantics preserved) ──
  const filteredCases = growthAnalyticsCases
    .filter(c => activeDomain === 'All' || c.domain === activeDomain)
    .filter(c => diffFilter === 'all' || c.difficulty === diffFilter)
    .slice()
    .sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 9) - (DIFF_ORDER[b.difficulty] ?? 9));

  const completedIds = new Set(Object.keys(allProgress));
  const firstUnstartedId = growthAnalyticsCases.find(c => !completedIds.has(c.id))?.id;

  const filters = [
    {
      id: 'difficulty',
      label: 'Difficulty',
      value: diffFilter,
      onChange: setDiffFilter,
      options: [
        { value: 'all', label: 'All levels' },
        { value: 'analyst', label: 'Analyst', count: growthAnalyticsCases.filter(c => c.difficulty === 'analyst').length },
        { value: 'senior', label: 'Senior', count: growthAnalyticsCases.filter(c => c.difficulty === 'senior').length },
        { value: 'staff', label: 'Staff', count: growthAnalyticsCases.filter(c => c.difficulty === 'staff').length },
      ],
    },
    {
      id: 'domain',
      label: 'Domain',
      value: activeDomain,
      onChange: setActiveDomain,
      options: [
        { value: 'All', label: 'All' },
        ...ALL_DOMAINS.map(d => ({
          value: d,
          label: DOMAIN_LABEL[d] || d,
          count: growthAnalyticsCases.filter(c => c.domain === d).length,
        })),
      ],
    },
  ];

  return (
    <div className="pal-page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      <RoomHeader
        icon='trending-up'
        accent='green'
        eyebrow='Growth Analytics Room'
        title='Growth Analytics'
        blurb={'Growth analytics is where "the metric is up" most often hides a real problem — acquisition gaming, retention hollowed out by churned power users, LTV inflated by one segment. The interview test is diagnostic instinct: can you decompose before you celebrate, segment before you conclude, and spot what the top-line number is obscuring? This room builds that through real practitioner scenarios.'}
        solved={completedCount}
        total={growthAnalyticsCases.length}
      />

      {/* Theory hint */}
      {onNavigate && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.7rem 1rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.25rem',
        }}>
          <Icon name="book-open" size={14} color="var(--green)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Recommended starting point</div>
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

      {/* Cases / Theory toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {['Cases', 'Theory'].map(tab => {
          const active = tab === 'Theory' ? theoryActive : !theoryActive;
          return (
            <button
              key={tab}
              onClick={() => setTheoryActive(tab === 'Theory')}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid ' + (active ? 'var(--green-border)' : 'var(--border)'),
                background: active ? 'var(--green-bg)' : 'none',
                color: active ? 'var(--green)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 400,
                fontSize: '0.82rem', cursor: 'pointer',
              }}
            >{tab}</button>
          );
        })}
      </div>

      {/* Filters */}
      {!theoryActive && <FilterBar filters={filters} />}

      {/* Case cards */}
      {!theoryActive && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredCases.map(c => {
          const prog = allProgress[c.id];
          const isLocked = !c.isFree && !unlocked;
          const isDone = !!prog;
          const bookmarked = isBookmarked('growth-analytics', c.id);
          const isNextUnstarted = c.id === firstUnstartedId;

          const tags = [
            DOMAIN_LABEL[c.domain] || c.domain,
            c.company,
            ...(c.tags || []),
          ].filter(Boolean);

          const meta = prog
            ? (RATING_LABEL[prog.rating] || 'Completed')
            : (c.isFree ? 'Free' : undefined);

          // Right-aligned badge area: Next pill or bookmark glyph.
          const badge = isNextUnstarted ? (
            <span style={{
              fontSize: '0.66rem', fontWeight: 700,
              color: 'var(--green)', background: 'var(--green-bg)',
              border: '1px solid var(--green-border)',
              borderRadius: 4, padding: '0.08rem 0.4rem',
            }}>
              Next
            </span>
          ) : (bookmarked ? (
            <Icon name='bookmark' size={13} color='var(--text-muted)' />
          ) : null);

          return (
            <CaseCard
              key={c.id}
              id={c.id}
              title={c.title}
              subtitle={c.subtitle}
              tags={tags}
              difficulty={c.difficulty}
              accent='green'
              status={isDone ? 'solved' : undefined}
              locked={isLocked}
              meta={meta}
              badge={badge}
              onClick={() => onSelectCase(c.id)}
              addBtn={<AddTrackBtn itemType='growth' itemId={String(c.id)} label={c.title} itemMeta={{ difficulty: c.difficulty }} />}
            />
          );
        })}
        {filteredCases.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No cases match this filter.
          </div>
        )}
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
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{a.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--green)', marginTop: '0.35rem', fontWeight: 500 }}>Read article →</div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
