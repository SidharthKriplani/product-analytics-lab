import { useState } from 'react';
import { rcaCases } from '../data/rcaCases.js';
import { getRCAProgress } from '../utils/rcaProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { FoundationNudgeCard } from '../components/shared/FoundationNudgeCard.jsx';
import { RoomHeader } from '../components/shared/RoomHeader.jsx';
import { FilterBar } from '../components/shared/FilterBar.jsx';
import { CaseCard } from '../components/shared/CaseCard.jsx';

const DOMAIN_LABEL = {
  growth: 'Growth', search: 'Search', engagement: 'Engagement',
  marketplace: 'Marketplace', retention: 'Retention', monetization: 'Monetization',
};

const LEVEL_LABEL = { staff: 'Staff-Level', senior: 'Senior', analyst: 'Analyst', junior: 'Junior' };

const DIFF_ORDER = { analyst: 0, foundational: 0, intermediate: 1, senior: 1, advanced: 2, staff: 2 };

// Derive unique difficulties + domains from data (so 'advanced' etc. surface).
const ALL_DIFFICULTIES = (() => {
  const diffs = new Set();
  rcaCases.forEach(c => { if (c.difficulty) diffs.add(c.difficulty); });
  return Array.from(diffs).sort((a, b) => (DIFF_ORDER[a] ?? 9) - (DIFF_ORDER[b] ?? 9) || a.localeCompare(b));
})();

const ALL_DOMAINS = (() => {
  const set = new Set();
  rcaCases.forEach(c => { if (c.domain) set.add(c.domain); });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
})();

export function RCABrowser({ onSelectCase, unlocked, onUnlock, onOpenArticle, onNavigate }) {
  const [sortBy, setSortBy] = useState('default');
  const [theoryActive, setTheoryActive] = useState(false);
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [activeDomain, setActiveDomain] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');

  const completedIds = new Set(rcaCases.filter(c => getRCAProgress(c.id)).map(c => c.id));
  const completedCount = completedIds.size;

  let displayCases = rcaCases.filter(c => {
    const diffMatch = activeDifficulty === 'All' || c.difficulty === activeDifficulty;
    const domainMatch = activeDomain === 'All' || c.domain === activeDomain;
    const isDone = completedIds.has(c.id);
    const statusMatch =
      activeStatus === 'All' ||
      (activeStatus === 'solved' && isDone) ||
      (activeStatus === 'unsolved' && !isDone);
    return diffMatch && domainMatch && statusMatch;
  });

  if (sortBy === 'difficulty') {
    displayCases = [...displayCases].sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 1) - (DIFF_ORDER[b.difficulty] ?? 1));
  }

  const firstUnstartedId = rcaCases.find(c => !getRCAProgress(c.id))?.id;

  const filters = [
    {
      id: 'difficulty',
      label: 'Difficulty',
      value: activeDifficulty,
      onChange: setActiveDifficulty,
      options: [
        { value: 'All', label: 'All' },
        ...ALL_DIFFICULTIES.map(d => ({
          value: d,
          label: d.charAt(0).toUpperCase() + d.slice(1),
          count: rcaCases.filter(c => c.difficulty === d).length,
        })),
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
          count: rcaCases.filter(c => c.domain === d).length,
        })),
      ],
    },
    {
      id: 'status',
      label: 'Status',
      value: activeStatus,
      onChange: setActiveStatus,
      options: [
        { value: 'All', label: 'All' },
        { value: 'unsolved', label: 'Unsolved', count: rcaCases.length - completedCount },
        { value: 'solved', label: 'Solved', count: completedCount },
      ],
    },
  ];

  const sort = {
    id: 'sort',
    label: 'Sort',
    value: sortBy,
    onChange: setSortBy,
    options: [
      { value: 'default', label: 'Default' },
      { value: 'difficulty', label: 'By Difficulty' },
    ],
  };

  const clearAll = () => {
    setActiveDifficulty('All');
    setActiveDomain('All');
    setActiveStatus('All');
  };

  return (
    <div className='pal-page-enter' style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <RoomHeader
        icon='search'
        accent='yellow'
        eyebrow='RCA Room'
        title='Root Cause Analysis'
        blurb={'The most common RCA failure is jumping to an explanation before ruling out data issues, external factors, or mix shift — then defending it when the interviewer pushes back. This room builds the diagnostic instinct: given a metric movement and raw context, what do you check first, in what order, and why does each cut either confirm or eliminate a hypothesis?'}
        solved={completedCount}
        total={rcaCases.length}
      />

      {/* Foundation nudge */}
      {onNavigate && (
        <FoundationNudgeCard foundationRoom='rca-foundations' foundationLabel='RCA Foundations' onNavigate={onNavigate} />
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

      {!theoryActive && <FilterBar filters={filters} sort={sort} />}

      {/* Case cards */}
      {!theoryActive && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {displayCases.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No cases match those filters.{' '}
            <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--yellow)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}>
              Clear filters
            </button>
          </div>
        )}

        {displayCases.map(c => {
          const progress = getRCAProgress(c.id);
          const isLocked = !c.isFree && !unlocked;
          const isDone = completedIds.has(c.id);
          const isNextUnstarted = c.id === firstUnstartedId;

          const tags = [DOMAIN_LABEL[c.domain] || c.domain].filter(Boolean);

          let meta;
          if (progress && !isLocked) {
            meta = `${LEVEL_LABEL[progress.level] || progress.level} · ${progress.score}/${progress.maxScore ?? 10}`;
          }

          const nextBadge = isNextUnstarted ? (
            <span style={{
              fontSize: '0.66rem', fontWeight: 700,
              color: 'var(--yellow)', background: 'var(--yellow-bg)',
              border: '1px solid var(--yellow-border)',
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
              subtitle={c.subtitle || c.context?.metricMovement}
              tags={tags}
              difficulty={c.difficulty}
              accent='yellow'
              status={isDone ? 'solved' : undefined}
              locked={isLocked}
              meta={meta}
              badge={nextBadge}
              onClick={() => (isLocked ? onUnlock && onUnlock() : onSelectCase(c.id))}
            />
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
            {FOUNDATION_DOMAINS['rca'].articles.map(a => (
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
