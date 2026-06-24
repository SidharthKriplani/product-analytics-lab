import { useState } from 'react';
import { estimationProblems } from '../data/estimationProblems.js';
import { getAllEstimationProgress } from '../utils/estimationProgress.js';
import { RoomHeader } from '../components/shared/RoomHeader.jsx';
import { FilterBar } from '../components/shared/FilterBar.jsx';
import { CaseCard } from '../components/shared/CaseCard.jsx';

const CATEGORY_LABEL = {
  'market-sizing':   'Market Sizing',
  'product-metrics': 'Product Metrics',
  'cost-estimation': 'Cost Estimation',
  'capacity':        'Capacity',
};

// Difficulty ordering for the "By Difficulty" sort.
const DIFF_ORDER = { analyst: 0, senior: 1, staff: 2 };

// Derive unique categories, difficulties, and tags from actual data.
const ALL_CATEGORIES = (() => {
  const cats = new Set();
  estimationProblems.forEach(p => { if (p.category) cats.add(p.category); });
  return Array.from(cats).sort((a, b) => a.localeCompare(b));
})();

const ALL_DIFFICULTIES = (() => {
  const diffs = new Set();
  estimationProblems.forEach(p => { if (p.difficulty) diffs.add(p.difficulty); });
  const ORDER = ['analyst', 'senior', 'staff'];
  return Array.from(diffs).sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.localeCompare(b);
  });
})();

const ALL_TAGS = (() => {
  const tagSet = new Set();
  estimationProblems.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b)).slice(0, 14);
})();

export function EstimationBrowser({ onStart, unlocked }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [activeTag, setActiveTag] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const progress = getAllEstimationProgress();

  const completedIds = new Set(Object.keys(progress));
  const completedCount = completedIds.size;
  const firstUnstartedId = estimationProblems.find(p => !completedIds.has(p.id))?.id;

  // AND logic: all active filters must match (unchanged semantics).
  let filtered = estimationProblems.filter(p => {
    const catMatch = activeCategory === 'All' || p.category === activeCategory;
    const diffMatch = activeDifficulty === 'All' || p.difficulty === activeDifficulty;
    const tagMatch = activeTag === 'All' || (p.tags || []).includes(activeTag);
    const isDone = completedIds.has(p.id);
    const statusMatch =
      activeStatus === 'All' ||
      (activeStatus === 'solved' && isDone) ||
      (activeStatus === 'unsolved' && !isDone);
    return catMatch && diffMatch && tagMatch && statusMatch;
  });

  if (sortBy === 'difficulty') {
    filtered = [...filtered].sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 9) - (DIFF_ORDER[b.difficulty] ?? 9));
  }

  // ── Filter dropdown configs ──
  const counts = key => estimationProblems.filter(p => p[key]).length;

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
          count: estimationProblems.filter(p => p.difficulty === d).length,
        })),
      ],
    },
    {
      id: 'category',
      label: 'Category',
      value: activeCategory,
      onChange: setActiveCategory,
      options: [
        { value: 'All', label: 'All' },
        ...ALL_CATEGORIES.map(c => ({
          value: c,
          label: CATEGORY_LABEL[c] || c,
          count: estimationProblems.filter(p => p.category === c).length,
        })),
      ],
    },
    {
      id: 'topic',
      label: 'Topic',
      value: activeTag,
      onChange: setActiveTag,
      options: [
        { value: 'All', label: 'All' },
        ...ALL_TAGS.map(t => ({
          value: t,
          label: t,
          count: estimationProblems.filter(p => (p.tags || []).includes(t)).length,
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
        { value: 'unsolved', label: 'Unsolved', count: estimationProblems.length - completedCount },
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
    setActiveCategory('All');
    setActiveDifficulty('All');
    setActiveTag('All');
    setActiveStatus('All');
  };

  return (
    <div className='pal-page-enter' style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <RoomHeader
        icon='calculator'
        accent='teal'
        eyebrow='Estimation Room'
        title='Estimation'
        blurb={'Estimation questions catch candidates who can\'t reason without data. When an interviewer asks "How many Uber rides happen in London per day?", they want to see you decompose the problem, make reasonable assumptions, and arrive at a credible answer out loud. This room builds that muscle across market sizing, cost estimation, and product metric estimation.'}
        solved={completedCount}
        total={estimationProblems.length}
      />

      {/* Dropdown filter row (replaces the three chip walls) */}
      <FilterBar filters={filters} sort={sort} />

      {/* Problem cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No problems match those filters.{' '}
            <button
              onClick={clearAll}
              style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}
            >
              Clear filters
            </button>
          </div>
        )}

        {filtered.map(problem => {
          const isLocked = !problem.isFree && !unlocked;
          const isDone = completedIds.has(problem.id);
          const isNextUnstarted = problem.id === firstUnstartedId;

          // Tags: lead with approach + category context, then problem tags.
          const tags = [
            problem.approach,
            CATEGORY_LABEL[problem.category] || problem.category,
            ...(problem.tags || []),
          ].filter(Boolean);

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
              key={problem.id}
              id={problem.id}
              title={problem.title}
              subtitle={problem.subtitle}
              tags={tags}
              difficulty={problem.difficulty}
              accent='teal'
              status={isDone ? 'solved' : undefined}
              locked={isLocked}
              meta={problem.isFree ? 'Free' : undefined}
              badge={nextBadge}
              onClick={() => onStart(problem.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
