import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { estimationProblems } from '../data/estimationProblems.js';
import { getAllEstimationProgress } from '../utils/estimationProgress.js';

const DIFFICULTY_COLOR = {
  analyst: { color: 'var(--accent)',  bg: 'var(--accent-bg)',  border: 'var(--accent-border)' },
  senior:  { color: 'var(--teal)',    bg: 'var(--teal-bg)',    border: 'var(--teal-border)'   },
  staff:   { color: 'var(--yellow)',  bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
};

const APPROACH_COLOR = {
  'bottom-up': { color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  'top-down':  { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  'hybrid':    { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)' },
};

const RATING_COLOR = {
  strong:  'var(--green)',
  partial: 'var(--yellow)',
  miss:    'var(--red)',
};

const CATEGORY_LABEL = {
  'market-sizing':   'Market Sizing',
  'product-metrics': 'Product Metrics',
  'cost-estimation': 'Cost Estimation',
  'capacity':        'Capacity',
};

// Derive unique categories, difficulties, and tags from actual data
const ALL_CATEGORIES = (() => {
  const cats = new Set();
  estimationProblems.forEach(p => { if (p.category) cats.add(p.category); });
  return Array.from(cats).sort((a, b) => a.localeCompare(b));
})();

const ALL_DIFFICULTIES = (() => {
  const diffs = new Set();
  estimationProblems.forEach(p => { if (p.difficulty) diffs.add(p.difficulty); });
  // Preserve a sensible order
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

function FilterChip({ label, active, onClick, activeColor, activeBg, activeBorder }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.28rem 0.72rem',
        borderRadius: '20px',
        border: active
          ? `1px solid ${activeBorder || 'var(--yellow-border)'}`
          : '1px solid var(--border)',
        background: active
          ? (activeBg || 'var(--yellow-bg)')
          : 'var(--surface)',
        color: active
          ? (activeColor || 'var(--yellow)')
          : 'var(--text-muted)',
        fontSize: '0.78rem',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.12s',
      }}
    >
      {label}
    </button>
  );
}

export function EstimationBrowser({ onStart, unlocked }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [activeTag, setActiveTag] = useState('All');
  const progress = getAllEstimationProgress();

  // AND logic: all active filters must match
  const filtered = estimationProblems.filter(p => {
    const catMatch = activeCategory === 'All' || p.category === activeCategory;
    const diffMatch = activeDifficulty === 'All' || p.difficulty === activeDifficulty;
    const tagMatch = activeTag === 'All' || (p.tags || []).includes(activeTag);
    return catMatch && diffMatch && tagMatch;
  });

  const completedCount = Object.keys(progress).length;
  const completedIds = new Set(Object.keys(progress));
  const firstUnstartedId = estimationProblems.find(p => !completedIds.has(p.id))?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name='calculator' size={18} color='var(--teal)' />
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            Estimation Room
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 0.75rem', maxWidth: '640px', lineHeight: 1.6 }}>
          Estimation questions catch candidates who can't reason without data. When an interviewer asks "How many Uber rides happen in London per day?", they're not testing your knowledge of Uber — they're testing whether you can decompose a problem, make reasonable assumptions, and arrive at a credible answer out loud. This room builds that muscle across market sizing, cost estimation, and product metric estimation.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            {estimationProblems.length} problems
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 96, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round(completedCount / estimationProblems.length * 100))}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{completedCount}/{estimationProblems.length}</span>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            {estimationProblems.filter(p => p.isFree).length} free to try
          </span>
        </div>
      </div>

      {/* ── Difficulty filter ── */}
      <div style={{ marginBottom: '0.6rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
          Difficulty
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          <FilterChip
            label="All"
            active={activeDifficulty === 'All'}
            onClick={() => setActiveDifficulty('All')}
            activeColor="var(--yellow)"
            activeBg="var(--yellow-bg)"
            activeBorder="var(--yellow-border)"
          />
          {ALL_DIFFICULTIES.map(d => {
            const dc = DIFFICULTY_COLOR[d] || {};
            return (
              <FilterChip
                key={d}
                label={d}
                active={activeDifficulty === d}
                onClick={() => setActiveDifficulty(d)}
                activeColor={dc.color || 'var(--yellow)'}
                activeBg={dc.bg || 'var(--yellow-bg)'}
                activeBorder={dc.border || 'var(--yellow-border)'}
              />
            );
          })}
        </div>
      </div>

      {/* ── Category filter ── */}
      <div style={{ marginBottom: '0.6rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
          Category
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          <FilterChip
            label="All"
            active={activeCategory === 'All'}
            onClick={() => setActiveCategory('All')}
            activeColor="var(--teal)"
            activeBg="var(--teal-bg)"
            activeBorder="var(--teal-border)"
          />
          {ALL_CATEGORIES.map(cat => (
            <FilterChip
              key={cat}
              label={CATEGORY_LABEL[cat] || cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              activeColor="var(--teal)"
              activeBg="var(--teal-bg)"
              activeBorder="var(--teal-border)"
            />
          ))}
        </div>
      </div>

      {/* ── Tag filter ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
          Topic tag
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          <FilterChip
            label="All"
            active={activeTag === 'All'}
            onClick={() => setActiveTag('All')}
            activeColor="var(--teal)"
            activeBg="var(--teal-bg)"
            activeBorder="var(--teal-border)"
          />
          {ALL_TAGS.map(tag => (
            <FilterChip
              key={tag}
              label={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag)}
              activeColor="var(--teal)"
              activeBg="var(--teal-bg)"
              activeBorder="var(--teal-border)"
            />
          ))}
        </div>
      </div>

      {/* Result count when filtered */}
      {(activeCategory !== 'All' || activeDifficulty !== 'All' || activeTag !== 'All') && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span>{filtered.length} problem{filtered.length !== 1 ? 's' : ''} match</span>
          {activeDifficulty !== 'All' && (
            <span style={{ color: 'var(--yellow)', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: '4px', padding: '0.05rem 0.4rem', fontSize: '0.74rem' }}>
              {activeDifficulty}
            </span>
          )}
          {activeCategory !== 'All' && (
            <span style={{ color: 'var(--teal)', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: '4px', padding: '0.05rem 0.4rem', fontSize: '0.74rem' }}>
              {CATEGORY_LABEL[activeCategory] || activeCategory}
            </span>
          )}
          {activeTag !== 'All' && (
            <span style={{ color: 'var(--teal)', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: '4px', padding: '0.05rem 0.4rem', fontSize: '0.74rem' }}>
              {activeTag}
            </span>
          )}
          <button
            onClick={() => { setActiveCategory('All'); setActiveDifficulty('All'); setActiveTag('All'); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.74rem', textDecoration: 'underline', padding: 0 }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Problem cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No problems match those filters.{' '}
            <button
              onClick={() => { setActiveCategory('All'); setActiveDifficulty('All'); setActiveTag('All'); }}
              style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}
            >
              Clear filters
            </button>
          </div>
        )}
        {filtered.map((problem, index) => {
          const prog = progress[problem.id];
          const isLocked = !problem.isFree && !unlocked;
          const dc = DIFFICULTY_COLOR[problem.difficulty] || {};
          const ac = APPROACH_COLOR[problem.approach] || {};
          const isNextUnstarted = problem.id === firstUnstartedId;

          return (
            <div
              key={problem.id}
              className="pal-card-enter pal-card-hover"
              onClick={() => onStart(problem.id)}
              style={{
                animationDelay: (Math.min(index * 28, 400)) + 'ms',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: isNextUnstarted ? '3px solid var(--accent)' : ('3px solid ' + (dc.color || 'var(--border)')),
                borderRadius: '10px',
                padding: '1.1rem 1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                position: 'relative',
                opacity: isLocked ? 0.7 : 1,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--teal-border)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isNextUnstarted && (
                <span style={{
                  position: 'absolute', top: '0.6rem', right: '0.7rem',
                  fontSize: '0.68rem', fontWeight: 700,
                  color: 'var(--accent)', background: 'var(--accent-bg)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: 4, padding: '0.1rem 0.4rem',
                }}>
                  Next →
                </span>
              )}
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  {/* Badge row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    {/* Problem ID */}
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {problem.id}
                    </span>

                    {/* Difficulty */}
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600,
                      color: dc.color, background: dc.bg, border: `1px solid ${dc.border}`,
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                    }}>
                      {problem.difficulty}
                    </span>

                    {/* Approach */}
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 500,
                      color: ac.color, background: ac.bg, border: `1px solid ${ac.border}`,
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                    }}>
                      {problem.approach}
                    </span>

                    {/* Category */}
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 500,
                      color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                    }}>
                      {CATEGORY_LABEL[problem.category] || problem.category}
                    </span>

                    {/* Free badge */}
                    {problem.isFree && (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600,
                        color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)',
                        borderRadius: '4px', padding: '0.1rem 0.4rem',
                      }}>
                        Free
                      </span>
                    )}

                    {isLocked && <span style={{ fontSize: '0.75rem' }}><Icon name='lock' size={12} color='currentColor' /></span>}
                  </div>

                  {/* Title */}
                  <div style={{ fontWeight: 600, fontSize: '0.97rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                    {problem.title}
                  </div>

                  {/* Subtitle */}
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                    {problem.subtitle}
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {problem.tags.map(tag => (
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
                    color: RATING_COLOR[prog.rating] || 'var(--text-muted)',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '0.3rem 0.6rem',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {prog.rating === 'strong'
                      ? (<><Icon name='check' size={12} color='currentColor' /> Nailed it</>)
                      : prog.rating === 'partial'
                      ? '~ Close'
                      : (<><Icon name='x' size={12} color='currentColor' /> Revisit</>)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
