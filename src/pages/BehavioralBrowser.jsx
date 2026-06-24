import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { behavioralQuestions } from '../data/behavioralQuestions.js';
import { getAllBehavioralProgress } from '../utils/behavioralProgress.js';

const DIFFICULTY_COLOR = {
  'analyst': { color: 'var(--accent)',  bg: 'var(--accent-bg)',  border: 'var(--accent-border)' },
  'senior':  { color: 'var(--teal)',   bg: 'var(--teal-bg)',    border: 'var(--teal-border)'   },
  'staff':   { color: 'var(--yellow)', bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
};

const CATEGORY_COLOR = {
  influence:     { color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
  failure:       { color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)'    },
  leadership:    { color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)'   },
  'data-impact': { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)'  },
  conflict:      { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  communication: { color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
};

const RATING_COLOR = {
  strong:  'var(--green)',
  partial: 'var(--yellow)',
  miss:    'var(--red)',
};

// Derive unique categories and tags from actual data
const ALL_CATEGORIES = (() => {
  const cats = new Set();
  behavioralQuestions.forEach(q => { if (q.category) cats.add(q.category); });
  return Array.from(cats).sort((a, b) => a.localeCompare(b));
})();

const ALL_TAGS = (() => {
  const tagSet = new Set();
  behavioralQuestions.forEach(q => (q.tags || []).forEach(t => tagSet.add(t)));
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b)).slice(0, 14);
})();

const ALL_DIFFICULTIES = (() => {
  const diffs = new Set();
  behavioralQuestions.forEach(q => { if (q.difficulty) diffs.add(q.difficulty); });
  // Preserve a sensible order if possible
  const ORDER = ['analyst', 'senior', 'staff'];
  const sorted = Array.from(diffs).sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.localeCompare(b);
  });
  return sorted;
})();

function FilterChip({ label, active, onClick, activeColor, activeBg, activeBorder }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.28rem 0.72rem',
        borderRadius: '20px',
        border: active
          ? `1px solid ${activeBorder || 'var(--accent-border)'}`
          : '1px solid var(--border)',
        background: active
          ? (activeBg || 'var(--accent-bg)')
          : 'var(--surface)',
        color: active
          ? (activeColor || 'var(--accent)')
          : 'var(--text-muted)',
        fontSize: '0.78rem',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
        transition: 'all 0.12s',
      }}
    >
      {label}
    </button>
  );
}

export function BehavioralBrowser({ onStart, unlocked }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTag, setActiveTag] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const progress = getAllBehavioralProgress();

  // AND logic: all active filters must match
  const filtered = behavioralQuestions.filter(q => {
    const catMatch = activeCategory === 'All' || q.category === activeCategory;
    const tagMatch = activeTag === 'All' || (q.tags || []).includes(activeTag);
    const diffMatch = activeDifficulty === 'All' || q.difficulty === activeDifficulty;
    return catMatch && tagMatch && diffMatch;
  });

  const completedCount = Object.keys(progress).length;
  const completedIds = new Set(Object.keys(progress));
  const firstUnstartedId = behavioralQuestions.find(q => !completedIds.has(q.id))?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--purple-bg)', border: '1px solid var(--purple-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name='mic' size={18} color='var(--purple)' />
          </span>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--purple)', marginBottom: '0.15rem' }}>
              Behavioral Room
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Behavioral & Leadership
            </h1>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '640px' }}>
          Behavioral questions are the ones most candidates underestimate. A weak STAR answer gets marked down even if your technical thinking is strong — interviewers are assessing ownership, judgment, and communication, not just what happened. This room covers 30 real questions across influence, conflict, prioritization, and failure, with model answers that show what strong actually looks like.
        </p>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            {behavioralQuestions.length} questions
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 96, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round(completedCount / behavioralQuestions.length * 100))}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{completedCount}/{behavioralQuestions.length}</span>
          </div>
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
            activeColor="var(--accent)"
            activeBg="var(--accent-bg)"
            activeBorder="var(--accent-border)"
          />
          {ALL_CATEGORIES.map(cat => {
            const cc = CATEGORY_COLOR[cat] || {};
            return (
              <FilterChip
                key={cat}
                label={cat.replace(/-/g, ' ')}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                activeColor={cc.color || 'var(--accent)'}
                activeBg={cc.bg || 'var(--accent-bg)'}
                activeBorder={cc.border || 'var(--accent-border)'}
              />
            );
          })}
        </div>
      </div>

      {/* ── Difficulty filter ── */}
      <div style={{ marginBottom: '0.6rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
          Level
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          <FilterChip
            label="All"
            active={activeDifficulty === 'All'}
            onClick={() => setActiveDifficulty('All')}
            activeColor="var(--accent)"
            activeBg="var(--accent-bg)"
            activeBorder="var(--accent-border)"
          />
          {ALL_DIFFICULTIES.map(d => {
            const dc = DIFFICULTY_COLOR[d] || {};
            return (
              <FilterChip
                key={d}
                label={d}
                active={activeDifficulty === d}
                onClick={() => setActiveDifficulty(d)}
                activeColor={dc.color || 'var(--accent)'}
                activeBg={dc.bg || 'var(--accent-bg)'}
                activeBorder={dc.border || 'var(--accent-border)'}
              />
            );
          })}
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
            activeColor="var(--accent)"
            activeBg="var(--accent-bg)"
            activeBorder="var(--accent-border)"
          />
          {ALL_TAGS.map(tag => (
            <FilterChip
              key={tag}
              label={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag)}
              activeColor="var(--green)"
              activeBg="var(--green-bg)"
              activeBorder="var(--green-border)"
            />
          ))}
        </div>
      </div>

      {/* Result count when filtered */}
      {(activeCategory !== 'All' || activeTag !== 'All' || activeDifficulty !== 'All') && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span>{filtered.length} question{filtered.length !== 1 ? 's' : ''} match</span>
          {activeCategory !== 'All' && <span style={{ color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: '4px', padding: '0.05rem 0.4rem', fontSize: '0.74rem' }}>{activeCategory}</span>}
          {activeDifficulty !== 'All' && <span style={{ color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: '4px', padding: '0.05rem 0.4rem', fontSize: '0.74rem' }}>{activeDifficulty}</span>}
          {activeTag !== 'All' && <span style={{ color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: '4px', padding: '0.05rem 0.4rem', fontSize: '0.74rem' }}>{activeTag}</span>}
          <button
            onClick={() => { setActiveCategory('All'); setActiveTag('All'); setActiveDifficulty('All'); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.74rem', textDecoration: 'underline', padding: 0 }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Question cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No questions match those filters.{' '}
            <button
              onClick={() => { setActiveCategory('All'); setActiveTag('All'); setActiveDifficulty('All'); }}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}
            >
              Clear filters
            </button>
          </div>
        )}
        {filtered.map((question, index) => {
          const prog = progress[question.id];
          const isLocked = !question.isFree && !unlocked;
          const dc = DIFFICULTY_COLOR[question.difficulty] || {};
          const cc = CATEGORY_COLOR[question.category] || {};
          const isNextUnstarted = question.id === firstUnstartedId;

          return (
            <div
              key={question.id}
              className="pal-card-enter pal-card-hover"
              onClick={() => onStart(question.id)}
              style={{
                animationDelay: (Math.min(index * 28, 400)) + 'ms',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: isNextUnstarted ? '3px solid var(--purple)' : '3px solid ' + (dc.color || 'var(--border)'),
                borderRadius: '10px',
                padding: '1.1rem 1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                position: 'relative',
                opacity: isLocked ? 0.7 : 1,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent-border)';
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
                  color: 'var(--purple)', background: 'var(--purple-bg)',
                  border: '1px solid var(--purple-border)',
                  borderRadius: 4, padding: '0.1rem 0.4rem',
                }}>
                  Next →
                </span>
              )}
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  {/* Badges row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    {/* ID */}
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {question.id}
                    </span>
                    {/* Difficulty */}
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600,
                      color: dc.color, background: dc.bg, border: `1px solid ${dc.border}`,
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                    }}>
                      {question.difficulty}
                    </span>
                    {/* Category */}
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600,
                      color: cc.color, background: cc.bg, border: `1px solid ${cc.border}`,
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                      textTransform: 'capitalize',
                    }}>
                      {question.category}
                    </span>
                    {/* Free badge */}
                    {question.isFree && (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600,
                        color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)',
                        borderRadius: '4px', padding: '0.1rem 0.4rem',
                      }}>Free</span>
                    )}
                    {isLocked && <span style={{ fontSize: '0.75rem' }}><Icon name='lock' size={12} color='currentColor' /></span>}
                  </div>

                  {/* Title */}
                  <div style={{ fontWeight: 600, fontSize: '0.97rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                    {question.title}
                  </div>

                  {/* Subtitle */}
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                    {question.subtitle}
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {(question.tags || []).map(tag => (
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
                    {prog.rating === 'strong' ? (<><Icon name='check' size={12} color='currentColor' /> Nailed it</>) : prog.rating === 'partial' ? '~ Partial' : (<><Icon name='x' size={12} color='currentColor' /> Revisit</>)}
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
