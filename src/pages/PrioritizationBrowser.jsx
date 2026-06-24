import { useState } from 'react';
import { prioritizationScenarios } from '../data/prioritizationScenarios.js';
import { getAllPrioritizationProgress } from '../utils/prioritizationProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { RoomHeader } from '../components/shared/RoomHeader.jsx';
import { FilterBar } from '../components/shared/FilterBar.jsx';
import { CaseCard } from '../components/shared/CaseCard.jsx';

const TAGS = ['All', 'RICE', 'effort-impact', 'technical debt', 'stakeholder conflict', 'OKRs', 'platform vs. feature'];

const DIFF_ORDER = { analyst: 0, senior: 1, staff: 2 };

const RATING_LABEL = { strong: 'Nailed it', partial: 'Partial', miss: 'Revisit' };

const ALL_DIFFICULTIES = (() => {
  const set = new Set();
  prioritizationScenarios.forEach(s => { if (s.difficulty) set.add(s.difficulty); });
  return Array.from(set).sort((a, b) => (DIFF_ORDER[a] ?? 9) - (DIFF_ORDER[b] ?? 9) || a.localeCompare(b));
})();

export function PrioritizationBrowser({ onStart, unlocked, onUnlock, onOpenArticle }) {
  const [activeTag, setActiveTag] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [theoryActive, setTheoryActive] = useState(false);
  const progress = getAllPrioritizationProgress();

  const completedIds = new Set(Object.keys(progress));
  const completedCount = completedIds.size;
  const firstUnstartedId = prioritizationScenarios.find(s => !completedIds.has(s.id))?.id;

  // Preserve exact prior filter semantics: tag via s.tags.includes, difficulty via equality.
  const filtered = prioritizationScenarios.filter(s => {
    const tagMatch = activeTag === 'All' || s.tags.includes(activeTag);
    const diffMatch = activeDifficulty === 'All' || s.difficulty === activeDifficulty;
    const isDone = completedIds.has(s.id);
    const statusMatch =
      activeStatus === 'All' ||
      (activeStatus === 'solved' && isDone) ||
      (activeStatus === 'unsolved' && !isDone);
    return tagMatch && diffMatch && statusMatch;
  });

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
          count: prioritizationScenarios.filter(s => s.difficulty === d).length,
        })),
      ],
    },
    {
      id: 'topic',
      label: 'Topic',
      value: activeTag,
      onChange: setActiveTag,
      options: TAGS.map(t => ({
        value: t,
        label: t === 'All' ? 'All' : t,
        count: t === 'All' ? undefined : prioritizationScenarios.filter(s => s.tags.includes(t)).length,
      })),
    },
    {
      id: 'status',
      label: 'Status',
      value: activeStatus,
      onChange: setActiveStatus,
      options: [
        { value: 'All', label: 'All' },
        { value: 'unsolved', label: 'Unsolved', count: prioritizationScenarios.length - completedCount },
        { value: 'solved', label: 'Solved', count: completedCount },
      ],
    },
  ];

  const clearAll = () => {
    setActiveTag('All');
    setActiveDifficulty('All');
    setActiveStatus('All');
  };

  return (
    <div className='pal-page-enter' style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <RoomHeader
        icon='scale'
        accent='purple'
        eyebrow='Prioritization Room'
        title='Prioritization'
        blurb={'The bar in prioritization interviews is not picking the right project — it is defending the tradeoff when the interviewer introduces constraints you did not plan for. This room puts you in real resource and stakeholder conflicts, then shows you how senior PMs reason through them without falling back on a framework as a shield.'}
        solved={completedCount}
        total={prioritizationScenarios.length}
      />

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

      {/* Scenario cards */}
      {!theoryActive && (
      <>
        <FilterBar filters={filters} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No scenarios match those filters.{' '}
              <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--purple)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}>
                Clear filters
              </button>
            </div>
          )}

          {filtered.map(scenario => {
            const prog = progress[scenario.id];
            const isLocked = !scenario.isFree && !unlocked;
            const isDone = completedIds.has(scenario.id);
            const isNextUnstarted = scenario.id === firstUnstartedId;

            const tags = [scenario.company, ...(scenario.tags || [])].filter(Boolean);

            const meta = prog ? (RATING_LABEL[prog.rating] || undefined) : undefined;

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
                key={scenario.id}
                id={scenario.id}
                title={scenario.title}
                subtitle={scenario.subtitle}
                tags={tags}
                difficulty={scenario.difficulty}
                accent='purple'
                status={isDone ? 'solved' : undefined}
                locked={isLocked}
                meta={meta}
                badge={nextBadge}
                onClick={() => onStart(scenario.id)}
              />
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
