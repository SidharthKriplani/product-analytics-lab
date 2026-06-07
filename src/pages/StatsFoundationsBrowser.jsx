import { useState } from 'react';
import { statsFoundationsModules } from '../data/statsFoundationsModules.js';
import { getAllStatFoundationsProgress } from '../utils/statsFoundationsProgress.js';
import { isBookmarked } from '../utils/bookmarks.js';

const DIFFICULTY_CONFIG = {
  Beginner:     { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  Intermediate: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  Advanced:     { color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
};

function DifficultyBadge({ difficulty }) {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Beginner;
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.45rem',
    }}>
      {difficulty}
    </span>
  );
}

function StepCircle({ index, completed, isCurrent }) {
  const bg = completed
    ? 'var(--yellow)'
    : isCurrent
      ? 'var(--yellow-bg)'
      : 'var(--surface-2)';
  const border = completed
    ? 'var(--yellow)'
    : isCurrent
      ? 'var(--yellow-border)'
      : 'var(--border)';
  const color = completed
    ? '#fff'
    : isCurrent
      ? 'var(--yellow)'
      : 'var(--text-muted)';

  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
      background: bg, border: `2px solid ${border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.75rem', fontWeight: 800, color,
      transition: 'all 0.15s',
    }}>
      {completed ? '✓' : index}
    </div>
  );
}

// Collect all unique tags from the modules, sorted alphabetically, max 12
const ALL_TAGS = (() => {
  const tagSet = new Set();
  statsFoundationsModules.forEach(m => (m.tags || []).forEach(t => tagSet.add(t)));
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b)).slice(0, 12);
})();

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

function FilterChip({ label, active, onClick, activeStyle }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.28rem 0.7rem',
        borderRadius: '20px',
        border: active
          ? `1px solid ${activeStyle?.border || 'var(--purple-border)'}`
          : '1px solid var(--border)',
        background: active
          ? (activeStyle?.bg || 'var(--purple-bg)')
          : 'var(--surface)',
        color: active
          ? (activeStyle?.color || 'var(--purple)')
          : 'var(--text-muted)',
        fontSize: '0.78rem',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
      }}
    >
      {label}
    </button>
  );
}

export function StatsFoundationsBrowser({ onStart, unlocked, onNavigate }) {
  const [allProgress] = useState(() => getAllStatFoundationsProgress());
  const [activeTag, setActiveTag] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');

  const completedIds = new Set(Object.keys(allProgress));
  const completedCount = completedIds.size;

  // Determine the current module: first non-completed, or last if all done
  const currentModuleIndex = statsFoundationsModules.findIndex(m => !completedIds.has(m.id));
  const currentModuleId = currentModuleIndex === -1
    ? null
    : statsFoundationsModules[currentModuleIndex].id;

  const progressPercent = Math.round((completedCount / statsFoundationsModules.length) * 100);

  // Apply both filters simultaneously (AND logic)
  const filteredModules = statsFoundationsModules.filter(m => {
    const tagMatch = activeTag === 'All' || (m.tags || []).includes(activeTag);
    const diffMatch = activeDifficulty === 'All' || m.difficulty === activeDifficulty;
    return tagMatch && diffMatch;
  });

  return (
    <div className="pal-page-enter" style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem', width: '100%', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--yellow)', marginBottom: '0.4rem',
        }}>
          Stat Foundations
        </div>
        <h1 style={{
          fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)',
          margin: '0 0 0.5rem', letterSpacing: '-0.02em',
        }}>
          Stat Foundations
        </h1>
        <p style={{
          fontSize: '0.88rem', color: 'var(--text-secondary)',
          margin: '0 0 1.25rem', lineHeight: 1.6, maxWidth: '540px',
        }}>
          Statistical fluency is what separates analysts who can have an opinion from those who just run queries. In interviews, you'll need to explain what a p-value actually means, catch a false positive before it ships, or design a valid experiment under time pressure. These 25 modules build that foundation from scratch — not by memorising formulas, but by building the reasoning that makes the numbers make sense.
        </p>
        <p style={{
          fontSize: '0.8rem', color: 'var(--text-muted)',
          margin: '0 0 1.25rem', lineHeight: 1.6, maxWidth: '540px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '0.6rem 0.875rem',
        }}>
          <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Before you start:</strong> Comfortable with basic math. No prior statistics background needed — these modules are written to be understood on first read, even if you've never taken a stats class.
        </p>

        {/* Progress bar */}
        <div style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {completedCount} / {statsFoundationsModules.length} complete
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--yellow)', fontWeight: 700 }}>
            {progressPercent}%
          </span>
        </div>
        <div style={{
          width: '100%', height: '6px', background: 'var(--yellow-bg)',
          borderRadius: '999px', overflow: 'hidden',
          border: '1px solid var(--yellow-border)',
        }}>
          <div style={{
            height: '100%', width: `${progressPercent}%`,
            background: 'var(--yellow)', borderRadius: '999px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* ── Difficulty filter ── */}
      <div style={{ marginBottom: '0.6rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
          Difficulty
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {DIFFICULTIES.map(d => {
            const cfg = d === 'All' ? null : DIFFICULTY_CONFIG[d];
            return (
              <FilterChip
                key={d}
                label={d}
                active={activeDifficulty === d}
                onClick={() => setActiveDifficulty(d)}
                activeStyle={cfg ? { bg: cfg.bg, border: cfg.border, color: cfg.color } : {
                  bg: 'var(--purple-bg)', border: 'var(--purple-border)', color: 'var(--purple)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Tag filter ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
          Topic
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          <FilterChip
            label="All"
            active={activeTag === 'All'}
            onClick={() => setActiveTag('All')}
            activeStyle={{ bg: 'var(--purple-bg)', border: 'var(--purple-border)', color: 'var(--purple)' }}
          />
          {ALL_TAGS.map(tag => (
            <FilterChip
              key={tag}
              label={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag)}
              activeStyle={{ bg: 'var(--purple-bg)', border: 'var(--purple-border)', color: 'var(--purple)' }}
            />
          ))}
        </div>
      </div>

      {/* Result count when filtered */}
      {(activeTag !== 'All' || activeDifficulty !== 'All') && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''} match
          {activeTag !== 'All' && <> · <span style={{ color: 'var(--purple)' }}>{activeTag}</span></>}
          {activeDifficulty !== 'All' && <> · <span style={{ color: 'var(--purple)' }}>{activeDifficulty}</span></>}
        </div>
      )}

      {/* Module list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {filteredModules.map((module, idx) => {
          const isCompleted = completedIds.has(module.id);
          const isCurrent = module.id === currentModuleId;
          const isLocked = !module.isFree && !unlocked;
          const isFirst = idx === 0;
          const isLast = idx === filteredModules.length - 1;
          const bookmarked = isBookmarked('stat-foundations', module.id);

          const cardBorder = isCurrent
            ? '2px solid var(--yellow-border)'
            : '1.5px solid var(--border)';
          const cardBg = isCurrent
            ? 'var(--yellow-bg)'
            : 'var(--surface)';

          return (
            <div key={module.id} style={{ display: 'flex', alignItems: 'stretch', gap: '0' }}>
              {/* Left connector column */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                width: '48px', flexShrink: 0,
              }}>
                {/* Top connector line */}
                <div style={{
                  width: '2px', flex: isFirst ? '0 0 16px' : '0 0 12px',
                  background: isFirst ? 'transparent' : (isCompleted ? 'var(--yellow)' : 'var(--border)'),
                }} />
                <StepCircle index={module.index} completed={isCompleted} isCurrent={isCurrent} />
                {/* Bottom connector line */}
                <div style={{
                  width: '2px', flex: '1 1 0',
                  background: isLast ? 'transparent' : (isCompleted ? 'var(--yellow)' : 'var(--border)'),
                  minHeight: '12px',
                }} />
              </div>

              {/* Card */}
              <div
                className="pal-card-enter pal-card-hover"
                style={{
                animationDelay: String(Math.min(idx * 28, 400)) + 'ms',
                flex: 1,
                margin: `${isFirst ? '0' : '4px'} 0 4px 0`,
                border: cardBorder,
                borderRadius: 'var(--radius)',
                background: cardBg,
                padding: '0.9rem 1.1rem',
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked && !isCompleted ? 0.72 : 1,
                transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
              }}
                onClick={() => {
                  if (!isLocked) onStart?.(module.id);
                }}
                onMouseEnter={e => {
                  if (!isLocked) {
                    e.currentTarget.style.borderColor = 'var(--yellow)';
                    e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = isCurrent ? 'var(--yellow-border)' : 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Badges row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                  <DifficultyBadge difficulty={module.difficulty} />
                  {module.isFree && (
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                      color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)',
                      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
                    }}>
                      Free
                    </span>
                  )}
                  {bookmarked && (
                    <span style={{ fontSize: '0.72rem', title: 'Bookmarked' }}>🔖</span>
                  )}
                  {isLocked && (
                    <span style={{
                      fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto',
                    }}>
                      🔒 Unlock to access
                    </span>
                  )}
                  {isCompleted && (
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700,
                      color: 'var(--yellow)', marginLeft: 'auto',
                    }}>
                      Completed
                    </span>
                  )}
                </div>

                {/* Title + subtitle */}
                <div style={{
                  fontSize: '0.97rem', fontWeight: 700, color: 'var(--text)',
                  lineHeight: 1.3, marginBottom: '0.2rem',
                }}>
                  {module.title}
                </div>
                <div style={{
                  fontSize: '0.8rem', color: 'var(--text-muted)',
                  lineHeight: 1.5, marginBottom: '0.65rem',
                }}>
                  {module.subtitle}
                </div>

                {/* Key insight */}
                <div style={{
                  fontSize: '0.76rem', color: 'var(--text-secondary)',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '0.45rem 0.7rem',
                  lineHeight: 1.55, marginBottom: '0.65rem',
                  fontStyle: 'italic',
                }}>
                  {module.keyInsight}
                </div>

                {/* Footer row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    ~{module.estimatedMin} min
                  </span>
                  {!isLocked && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onStart?.(module.id);
                      }}
                      style={{
                        background: isCurrent ? 'var(--yellow)' : 'var(--surface-2)',
                        border: `1px solid ${isCurrent ? 'var(--yellow)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        color: isCurrent ? '#fff' : 'var(--text-muted)',
                        fontSize: '0.75rem', fontWeight: 700,
                        padding: '0.25rem 0.75rem',
                        cursor: 'pointer',
                        transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
                      }}
                    >
                      {isCompleted ? 'Review' : isCurrent ? 'Start →' : 'Start'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredModules.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '2.5rem 1rem',
            color: 'var(--text-muted)', fontSize: '0.875rem',
          }}>
            No modules match those filters.{' '}
            <button
              onClick={() => { setActiveTag('All'); setActiveDifficulty('All'); }}
              style={{
                background: 'none', border: 'none', color: 'var(--purple)',
                cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline',
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: '2rem', padding: '0.9rem 1.1rem',
        background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
        borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--text-secondary)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--yellow)' }}>How it works:</strong> Each module builds on the previous. Work through them in order — every concept connects to a specific experiment design or interpretation decision you will face in product analytics.
      </div>

      {/* Ready to practice CTA */}
      {onNavigate && (
        <div style={{
          marginTop: '2.5rem',
          padding: '1.25rem 1.5rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem' }}>
              Ready to practice?
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Apply what you learned in the practice rooms.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('stats')} style={{
              padding: '0.45rem 1rem', borderRadius: '6px',
              background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
              color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            }}>Stats Room →</button>
            <button onClick={() => onNavigate('spot-the-flaw')} style={{
              padding: '0.45rem 1rem', borderRadius: '6px',
              background: 'var(--red-bg)', border: '1px solid var(--red-border)',
              color: 'var(--red)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            }}>Spot the Flaw →</button>
          </div>
        </div>
      )}
    </div>
  );
}
