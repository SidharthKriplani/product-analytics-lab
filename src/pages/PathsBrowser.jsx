import { useState, useEffect } from 'react';
import { PATHS } from '../data/pathsData';
import { getPathProgress, togglePathStep } from '../utils/pathsProgress';

const TYPE_META = {
  FOUNDATION: { label: 'Foundation', color: 'var(--green)'  },
  PRACTICE:   { label: 'Practice',   color: 'var(--accent)' },
  SQL:        { label: 'SQL Lab',    color: 'var(--yellow)'  },
  FORENSIC:   { label: 'Forensic',   color: 'var(--red)'    },
  FRAMEWORK:  { label: 'Framework',  color: 'var(--purple)' },
  TOOL:       { label: 'Tool',       color: 'var(--teal)'   },
  DRILL:      { label: 'Drill',      color: 'var(--teal)'   },
};

export function PathsBrowser({ onNavigate }) {
  const [selectedId, setSelectedId] = useState(PATHS[0].id);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const snap = {};
    PATHS.forEach(p => { snap[p.id] = getPathProgress(p.id); });
    setProgress(snap);
  }, []);

  const selectedPath = PATHS.find(p => p.id === selectedId);
  const selectedProgress = progress[selectedId] || new Set();

  function handleToggleStep(stepIndex) {
    const updated = togglePathStep(selectedId, stepIndex);
    setProgress(prev => ({ ...prev, [selectedId]: updated }));
  }

  return (
    <div
      className="pal-page-enter"
      style={{ display: 'flex', minHeight: '100vh' }}
    >
      {/* ── Left panel ── */}
      <div style={{
        width: '272px',
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        padding: '1.75rem 0',
        overflowY: 'auto',
      }}>
        <div style={{
          padding: '0 1rem 0.75rem',
          fontSize: '0.6rem',
          fontWeight: 800,
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}>
          PATHS
        </div>

        {PATHS.map(path => {
          const pp = progress[path.id] || new Set();
          const pct = Math.round((pp.size / path.steps.length) * 100);
          const isSelected = path.id === selectedId;

          return (
            <button
              key={path.id}
              onClick={() => setSelectedId(path.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.8rem 1rem',
                border: 'none',
                borderLeft: isSelected
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
                background: isSelected ? 'var(--surface-2)' : 'none',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
                <span style={{
                  fontSize: '0.58rem', fontWeight: 800,
                  padding: '0.15rem 0.4rem', borderRadius: '3px',
                  background: path.tagColor, color: '#fff',
                  letterSpacing: '0.04em', flexShrink: 0,
                }}>
                  {path.tag}
                </span>
                <span style={{
                  fontSize: '0.8rem', fontWeight: 600,
                  color: 'var(--text)', lineHeight: 1.25,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {path.title}
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                {pp.size}/{path.steps.length} steps · {pct}%
              </div>
              <div style={{
                height: '3px', borderRadius: '2px',
                background: 'var(--border)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: pct + '%',
                  background: path.tagColor,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
        {selectedPath && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span style={{
                fontSize: '0.62rem', fontWeight: 800,
                padding: '0.2rem 0.5rem', borderRadius: '4px',
                background: selectedPath.tagColor, color: '#fff',
                letterSpacing: '0.05em',
              }}>
                {selectedPath.tag}
              </span>
              <h1 style={{
                fontSize: '1.4rem', fontWeight: 700,
                color: 'var(--text)', margin: 0, lineHeight: 1.2,
              }}>
                {selectedPath.title}
              </h1>
            </div>
            <p style={{
              fontSize: '0.88rem', color: 'var(--text-muted)',
              lineHeight: 1.65, maxWidth: '600px',
              marginBottom: '2rem', marginTop: 0,
            }}>
              {selectedPath.description}
            </p>

            {/* Step list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {selectedPath.steps.map((step, idx) => {
                const meta = TYPE_META[step.type] || TYPE_META.PRACTICE;
                const done = selectedProgress.has(idx);

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.9rem 1rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      background: done ? 'var(--surface-2)' : 'var(--surface)',
                      opacity: done ? 0.72 : 1,
                      transition: 'background var(--transition-fast), opacity var(--transition-fast)',
                    }}
                  >
                    {/* Number circle */}
                    <div style={{
                      width: '28px', height: '28px',
                      borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: done ? 'var(--green)' : 'var(--border)',
                      color: done ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.72rem', fontWeight: 700,
                      transition: 'background var(--transition-fast)',
                    }}>
                      {done ? '✓' : idx + 1}
                    </div>

                    {/* Type badge */}
                    <span style={{
                      fontSize: '0.57rem', fontWeight: 800,
                      padding: '0.15rem 0.4rem', borderRadius: '3px',
                      background: meta.color, color: '#fff',
                      letterSpacing: '0.05em', flexShrink: 0,
                      textTransform: 'uppercase',
                    }}>
                      {meta.label}
                    </span>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.88rem', fontWeight: 600,
                        color: 'var(--text)', marginBottom: '0.15rem',
                      }}>
                        {step.title}
                      </div>
                      <div style={{
                        fontSize: '0.77rem', color: 'var(--text-muted)',
                        lineHeight: 1.45,
                      }}>
                        {step.description}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.45rem', flexShrink: 0, alignItems: 'center' }}>
                      <button
                        onClick={() => handleToggleStep(idx)}
                        style={{
                          padding: '0.3rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          background: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          transition: 'background var(--transition-fast)',
                        }}
                      >
                        {done ? 'Undo' : 'Done'}
                      </button>
                      <button
                        onClick={() => onNavigate(step.route)}
                        style={{
                          padding: '0.32rem 0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          background: 'var(--accent)',
                          color: '#fff',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Go →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer count */}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {selectedProgress.size}/{selectedPath.steps.length} complete
            </div>
          </>
        )}
      </div>
    </div>
  );
}
