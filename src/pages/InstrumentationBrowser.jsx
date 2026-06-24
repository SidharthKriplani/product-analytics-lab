import { useState } from 'react';
import { instrumentationCases } from '../data/instrumentationCases.js';
import { getAllInstrumentationProgress } from '../utils/instrumentationProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { RoomHeader } from '../components/shared/RoomHeader.jsx';
import { FilterBar } from '../components/shared/FilterBar.jsx';
import { CaseCard } from '../components/shared/CaseCard.jsx';

const DOMAIN_LABEL = {
  'measurement-plan':        'Measurement Plan',
  'event-taxonomy':          'Event Taxonomy',
  'data-quality':            'Data Quality',
  'ab-test-instrumentation': 'A/B Instrumentation',
  'privacy-consent':         'Privacy & Consent',
  'data-contracts':          'Data Contracts',
};

const DIFF_ORDER = { junior: 0, analyst: 0, senior: 1, staff: 2 };

// Unique domains present in the data, in declared order.
const ALL_DOMAINS = (() => {
  const seen = new Set();
  instrumentationCases.forEach(c => { if (c.domain) seen.add(c.domain); });
  return Array.from(seen);
})();

export function InstrumentationBrowser({ onSelectCase, unlocked, onOpenArticle }) {
  const allProgress = getAllInstrumentationProgress();
  const completedCount = Object.keys(allProgress).length;
  const [activeFilter, setActiveFilter] = useState('All');
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');

  // ── Filtering (semantics preserved; analyst alias for junior kept) ──
  const filtered = instrumentationCases
    .filter(c => activeFilter === 'All' || c.domain === activeFilter)
    .filter(c => diffFilter === 'all' || c.difficulty === diffFilter || (diffFilter === 'analyst' && c.difficulty === 'junior'))
    .slice()
    .sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 9) - (DIFF_ORDER[b.difficulty] ?? 9));

  const completedIds = new Set(Object.keys(allProgress));
  const firstUnstartedId = instrumentationCases.find(c => !completedIds.has(c.id))?.id;

  const filters = [
    {
      id: 'difficulty',
      label: 'Difficulty',
      value: diffFilter,
      onChange: setDiffFilter,
      options: [
        { value: 'all', label: 'All levels' },
        { value: 'analyst', label: 'Junior', count: instrumentationCases.filter(c => c.difficulty === 'analyst' || c.difficulty === 'junior').length },
        { value: 'senior', label: 'Senior', count: instrumentationCases.filter(c => c.difficulty === 'senior').length },
        { value: 'staff', label: 'Staff', count: instrumentationCases.filter(c => c.difficulty === 'staff').length },
      ],
    },
    {
      id: 'domain',
      label: 'Domain',
      value: activeFilter,
      onChange: setActiveFilter,
      options: [
        { value: 'All', label: 'All' },
        ...ALL_DOMAINS.map(d => ({
          value: d,
          label: DOMAIN_LABEL[d] || d,
          count: instrumentationCases.filter(c => c.domain === d).length,
        })),
      ],
    },
  ];

  return (
    <div className="pal-page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      <RoomHeader
        icon='newspaper'
        accent='teal'
        eyebrow='Analytics Instrumentation Room'
        title='Analytics Instrumentation'
        blurb={'Bad tracking is invisible until it\'s too late — you\'ve run a six-week experiment on data you can\'t trust, or shipped a feature with no way to measure it. Instrumentation is tested in senior interviews because it separates analysts who can design measurement systems from those who can only query them. This room covers event tracking, measurement plans, data contracts, and how to catch quality issues before they corrupt your analysis.'}
        solved={completedCount}
        total={instrumentationCases.length}
      />

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
                border: '1px solid ' + (active ? 'var(--teal-border)' : 'var(--border)'),
                background: active ? 'var(--teal-bg)' : 'none',
                color: active ? 'var(--teal)' : 'var(--text-muted)',
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
        {filtered.map(c => {
          const prog = allProgress[c.id];
          const isLocked = !c.isFree && !unlocked;
          const isDone = !!prog;
          const isNextUnstarted = c.id === firstUnstartedId;

          const tags = [
            DOMAIN_LABEL[c.domain] || c.domain,
            c.company,
            ...(c.tags || []).slice(0, 3),
          ].filter(Boolean);

          const meta = c.estimatedMin ? `~${c.estimatedMin} min` : (c.isFree ? 'Free' : undefined);

          const nextBadge = isNextUnstarted ? (
            <span style={{
              fontSize: '0.66rem', fontWeight: 700,
              color: 'var(--teal)', background: 'var(--teal-bg)',
              border: '1px solid var(--teal-border)',
              borderRadius: 4, padding: '0.08rem 0.4rem',
            }}>
              Next
            </span>
          ) : null;

          return (
            <CaseCard
              key={c.id}
              id={c.id}
              title={c.title}
              subtitle={c.subtitle}
              tags={tags}
              difficulty={c.difficulty}
              accent='teal'
              status={isDone ? 'solved' : undefined}
              locked={isLocked}
              meta={meta}
              badge={nextBadge}
              onClick={() => onSelectCase(c.id)}
            />
          );
        })}
        {filtered.length === 0 && (
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
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--teal)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{a.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--teal)', marginTop: '0.35rem', fontWeight: 500 }}>Read article →</div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
