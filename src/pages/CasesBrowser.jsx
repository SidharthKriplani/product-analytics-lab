import { useState } from 'react';
import { businessCases } from '../data/businessCases.js';
import { getCaseProgress } from '../utils/caseProgress.js';
import { FoundationNudgeCard } from '../components/shared/FoundationNudgeCard.jsx';
import { RoomHeader } from '../components/shared/RoomHeader.jsx';
import { FilterBar } from '../components/shared/FilterBar.jsx';
import { CaseCard } from '../components/shared/CaseCard.jsx';

const DIFF_ORDER = { analyst: 0, senior: 1, staff: 2 };

const LEVEL_LABEL = { staff: 'Staff', senior: 'Senior', analyst: 'Analyst', junior: 'Junior miss' };

// Derive unique difficulties + domains from data (preserves all real values).
const ALL_DIFFICULTIES = (() => {
  const diffs = new Set();
  businessCases.forEach(c => { if (c.difficulty) diffs.add(c.difficulty); });
  const ORDER = ['analyst', 'senior', 'staff'];
  return Array.from(diffs).sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.localeCompare(b);
  });
})();

const ALL_DOMAINS = (() => {
  const set = new Set();
  businessCases.forEach(c => { if (c.domain) set.add(c.domain); });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
})();

export function CasesBrowser({ onSelectCase, unlocked, onUnlock, onNavigate }) {
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [activeDomain, setActiveDomain] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  const completedIds = new Set(businessCases.map(bc => bc.id).filter(id => getCaseProgress(id)));
  const completedCount = completedIds.size;
  const firstUnstartedId = businessCases.find(bc => !completedIds.has(bc.id))?.id;

  // AND logic across all active filters (preserves prior difficulty-filter semantics).
  let displayCases = businessCases.filter(c => {
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
    displayCases = [...displayCases].sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 9) - (DIFF_ORDER[b.difficulty] ?? 9));
  }

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
          count: businessCases.filter(c => c.difficulty === d).length,
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
          label: d,
          count: businessCases.filter(c => c.domain === d).length,
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
        { value: 'unsolved', label: 'Unsolved', count: businessCases.length - completedCount },
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
        icon='clipboard'
        accent='purple'
        eyebrow='Business Cases'
        title='Cases Room'
        blurb={'The most common interview opener is deceptively simple: "How would you measure success for X?" Most candidates jump straight to metrics. Strong candidates pause, clarify the question, and build a structured answer. This room trains that habit — constraint, clarity, then answer — across the ambiguous business and product scenarios that show up most in interviews.'}
        solved={completedCount}
        total={businessCases.length}
      />

      {/* Theory hint */}
      {onNavigate && (
        <FoundationNudgeCard foundationRoom='rca-foundations' foundationLabel='RCA Foundations' onNavigate={onNavigate} />
      )}

      <FilterBar filters={filters} sort={sort} />

      {/* Case cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {displayCases.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No cases match those filters.{' '}
            <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--purple)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}>
              Clear filters
            </button>
          </div>
        )}

        {displayCases.map(bc => {
          const progress = getCaseProgress(bc.id);
          const isLocked = !bc.isFree && !unlocked;
          const isDone = completedIds.has(bc.id);
          const isNextUnstarted = bc.id === firstUnstartedId;

          const tags = [bc.domain].filter(Boolean);

          let meta;
          if (progress?.attempts > 0) {
            meta = `Score ${progress.score?.score ?? '—'}/${progress.score?.maxScore ?? '—'}`;
          } else if (!isLocked) {
            meta = `${bc.phases.length} phases`;
          }

          const nextBadge = isNextUnstarted ? (
            <span style={{
              fontSize: '0.66rem', fontWeight: 700,
              color: 'var(--purple)', background: 'var(--purple-bg)',
              border: '1px solid var(--purple-border)',
              borderRadius: 4, padding: '0.08rem 0.4rem',
            }}>
              Next
            </span>
          ) : null;

          return (
            <CaseCard
              key={bc.id}
              id={bc.id}
              title={bc.title}
              subtitle={bc.subtitle || bc.context?.executiveAsk}
              tags={tags}
              difficulty={bc.difficulty}
              accent='purple'
              status={isDone ? 'solved' : undefined}
              locked={isLocked}
              meta={meta}
              badge={nextBadge}
              onClick={() => (isLocked ? onUnlock && onUnlock() : onSelectCase(bc.id))}
            />
          );
        })}
      </div>
    </div>
  );
}
