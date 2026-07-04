import { useState } from 'react';
import { productDesignScenarios } from '../data/productDesignScenarios.js';
import { getAllProductDesignProgress } from '../utils/productDesignProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { RoomHeader } from '../components/shared/RoomHeader.jsx';
import { FilterBar } from '../components/shared/FilterBar.jsx';
import { CaseCard } from '../components/shared/CaseCard.jsx';
import { AddTrackBtn } from '../components/tracks/AddToTrackPopover.jsx';

const DIFF_ORDER = { medium: 0, analyst: 0, senior: 1, hard: 1, staff: 2 };

const LEVEL_LABEL = {
  excellent: 'Excellent', strong: 'Strong', developing: 'Developing', needs_practice: 'Try Again',
};

// Derive unique difficulties + categories from data.
const ALL_DIFFICULTIES = (() => {
  const set = new Set();
  productDesignScenarios.forEach(s => { if (s.difficulty) set.add(s.difficulty); });
  return Array.from(set).sort((a, b) => (DIFF_ORDER[a] ?? 9) - (DIFF_ORDER[b] ?? 9) || a.localeCompare(b));
})();

const ALL_CATEGORIES = (() => {
  const set = new Set();
  productDesignScenarios.forEach(s => { if (s.category) set.add(s.category); });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
})();

export function ProductDesignBrowser({ onSelectScenario, unlocked, onUnlock, onOpenArticle }) {
  const [theoryActive, setTheoryActive] = useState(false);
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const allProgress = getAllProductDesignProgress();

  const completedIds = new Set(
    Object.keys(allProgress).filter(id => allProgress[id]?.completedPhaseIds?.length > 0)
  );
  const completedCount = completedIds.size;
  const firstUnstartedId = productDesignScenarios.find(s => !completedIds.has(s.id))?.id;

  const displayScenarios = productDesignScenarios.filter(s => {
    const diffMatch = activeDifficulty === 'All' || s.difficulty === activeDifficulty;
    const catMatch = activeCategory === 'All' || s.category === activeCategory;
    const isDone = completedIds.has(s.id);
    const statusMatch =
      activeStatus === 'All' ||
      (activeStatus === 'solved' && isDone) ||
      (activeStatus === 'unsolved' && !isDone);
    return diffMatch && catMatch && statusMatch;
  }).sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 9) - (DIFF_ORDER[b.difficulty] ?? 9));

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
          count: productDesignScenarios.filter(s => s.difficulty === d).length,
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
          label: c,
          count: productDesignScenarios.filter(s => s.category === c).length,
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
        { value: 'unsolved', label: 'Unsolved', count: productDesignScenarios.length - completedCount },
        { value: 'solved', label: 'Solved', count: completedCount },
      ],
    },
  ];

  const clearAll = () => {
    setActiveDifficulty('All');
    setActiveCategory('All');
    setActiveStatus('All');
  };

  return (
    <div className='pal-page-enter' style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <RoomHeader
        icon='layout'
        accent='purple'
        eyebrow='Product Design Room'
        title='Product Design Practice'
        blurb={'Product design questions fail not because candidates lack ideas but because they skip the hard part — defining who the user is before proposing solutions, or prioritizing without a defensible rationale. This room trains the full arc: from scoping the problem correctly through to defending your prioritization when the interviewer pushes back.'}
        solved={completedCount}
        total={productDesignScenarios.length}
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
          {displayScenarios.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No scenarios match those filters.{' '}
              <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--purple)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}>
                Clear filters
              </button>
            </div>
          )}

          {displayScenarios.map(scenario => {
            const progress = allProgress[scenario.id];
            const result = progress?.result;
            const isLocked = !scenario.isFree && !unlocked;
            const phasesComplete = progress?.completedPhaseIds?.length || 0;
            const totalPhases = scenario.phases.length;
            const isDone = completedIds.has(scenario.id);
            const isNextUnstarted = scenario.id === firstUnstartedId;

            const tags = [scenario.company, scenario.category].filter(Boolean);

            let meta;
            if (result) {
              meta = LEVEL_LABEL[result.level] || result.level;
            } else if (phasesComplete > 0 && phasesComplete < totalPhases) {
              meta = `${phasesComplete}/${totalPhases} phases`;
            } else if (!isLocked) {
              meta = `${totalPhases} phases`;
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
                key={scenario.id}
                id={scenario.id}
                title={scenario.title}
                subtitle={scenario.prompt ? scenario.prompt.split('\n\n')[0] : undefined}
                tags={tags}
                difficulty={scenario.difficulty}
                accent='purple'
                status={isDone ? 'solved' : undefined}
                locked={isLocked}
                meta={meta}
                badge={nextBadge}
                onClick={() => (isLocked ? onUnlock?.() : onSelectScenario(scenario.id))}
                addBtn={<AddTrackBtn itemType='product_design' itemId={String(scenario.id)} label={scenario.title} itemMeta={{ difficulty: scenario.difficulty }} />}
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
            {FOUNDATION_DOMAINS['product-design'].articles.map(a => (
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

      {/* Footer note */}
      <div style={{
        marginTop: '2rem', padding: '0.9rem 1.1rem',
        background: 'var(--purple-bg)', border: '1px solid var(--purple-border)',
        borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--text-secondary)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--purple)' }}>How it works:</strong> Each scenario presents a real product design challenge. Write your answer for each phase, then reveal the model answer. Self-rate your response (Strong / Partial / Missed), and move to the next phase. No wrong answers — the goal is to build a mental model of how senior PMs structure product thinking.
      </div>
    </div>
  );
}
