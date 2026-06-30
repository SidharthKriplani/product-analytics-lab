import { useState } from 'react';

// ─── Investigation Progress Map ────────────────────────────────────────────────
// Horizontal step-node bar. Color = outcome: teal (strong), yellow (partial),
// red (wrong), pulsing yellow outline (active), dim gray (pending).
// Active step label shown below. Hovering any node shows its label in a tooltip.

const NODE_SIZE = 22;
const LINE_W    = 2;

function outcomeColor(level) {
  if (level === 'strong')  return { fill: 'var(--teal)',   text: '#fff', border: 'var(--teal)'   };
  if (level === 'partial') return { fill: 'var(--yellow)', text: '#fff', border: 'var(--yellow)' };
  if (level === 'wrong')   return { fill: 'var(--red)',    text: '#fff', border: 'var(--red)'    };
  return null;
}

export function RCAProgressMap({ steps, currentStepIndex, stepChoices, submittedSteps }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!steps || steps.length < 2) return null;

  // Determine state for each step
  const nodeStates = steps.map((step, i) => {
    const chosenId   = stepChoices[step.id];
    const submitted  = submittedSteps[step.id];
    if (submitted && chosenId) {
      const opt = step.options.find(o => o.id === chosenId);
      const level = opt?.level || 'wrong';
      return { status: 'done', level };
    }
    if (i === currentStepIndex) return { status: 'active', level: null };
    return { status: 'pending', level: null };
  });

  return (
    <div style={{ marginBottom: '1rem', position: 'relative' }}>
      {/* Label above */}
      <div style={{
        fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.09em', color: 'var(--text-muted)',
        marginBottom: '0.45rem',
      }}>
        Investigation Map
      </div>

      {/* Node row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        position: 'relative',
      }}>
        {steps.map((step, i) => {
          const state   = nodeStates[i];
          const isLast  = i === steps.length - 1;
          const colors  = state.status === 'done' ? outcomeColor(state.level) : null;
          const isActive   = state.status === 'active';
          const isDone     = state.status === 'done';
          const isHovered  = hoveredIndex === i;

          return (
            <div
              key={step.id}
              style={{ display: 'flex', alignItems: 'center', flex: isLast ? '0 0 auto' : '1 1 0' }}
            >
              {/* Node */}
              <div
                style={{ position: 'relative', flexShrink: 0 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Pulse ring for active node */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    inset: '-5px',
                    borderRadius: '50%',
                    border: '2px solid var(--yellow)',
                    opacity: 0.4,
                    animation: 'pal-pulse 1.8s ease-in-out infinite',
                    pointerEvents: 'none',
                  }} />
                )}

                {/* The circle */}
                <div style={{
                  width:  NODE_SIZE,
                  height: NODE_SIZE,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  cursor: 'default',
                  transition: 'transform 0.1s',
                  transform: isHovered ? 'scale(1.12)' : 'scale(1)',
                  userSelect: 'none',
                  // colors
                  background: isDone
                    ? colors.fill
                    : isActive
                      ? 'var(--yellow-bg)'
                      : 'var(--surface-2)',
                  border: isDone
                    ? `2px solid ${colors.border}`
                    : isActive
                      ? '2px solid var(--yellow)'
                      : `${LINE_W}px solid var(--border)`,
                  color: isDone
                    ? colors.text
                    : isActive
                      ? 'var(--yellow)'
                      : 'var(--text-muted)',
                }}>
                  {/* Icon for done states, number for active/pending */}
                  {isDone && state.level === 'strong'  && '✓'}
                  {isDone && state.level === 'partial'  && '~'}
                  {isDone && state.level === 'wrong'    && '✗'}
                  {!isDone && (i + 1)}
                </div>

                {/* Tooltip on hover */}
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    bottom: NODE_SIZE + 6,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '0.3rem 0.55rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 50,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  }}>
                    {step.label}
                    {isDone && (
                      <span style={{
                        marginLeft: '0.4rem',
                        fontSize: '0.65rem',
                        color: isDone ? (outcomeColor(state.level)?.fill || 'var(--text-muted)') : 'var(--text-muted)',
                      }}>
                        {state.level === 'strong'  ? '· Strong'  : ''}
                        {state.level === 'partial'  ? '· Partial' : ''}
                        {state.level === 'wrong'    ? '· Missed'  : ''}
                      </span>
                    )}
                    {/* Tooltip caret */}
                    <div style={{
                      position: 'absolute',
                      top: '100%', left: '50%', transform: 'translateX(-50%)',
                      width: 0, height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: '5px solid var(--border)',
                    }} />
                  </div>
                )}
              </div>

              {/* Connector line to next node */}
              {!isLast && (
                <div style={{
                  flex: 1,
                  height: LINE_W,
                  background: isDone
                    ? (state.level === 'strong' ? 'var(--teal-border)' : state.level === 'partial' ? 'var(--yellow-border)' : 'var(--red-border)')
                    : 'var(--border)',
                  transition: 'background 0.2s',
                  minWidth: 4,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Active step label below */}
      <div style={{
        marginTop: '0.45rem',
        height: '14px', // fixed height so layout doesn't shift
        fontSize: '0.72rem',
        fontWeight: 600,
        color: 'var(--yellow)',
        textAlign: 'center',
        letterSpacing: '0.01em',
      }}>
        {hoveredIndex !== null
          ? steps[hoveredIndex]?.label
          : steps[currentStepIndex]?.label
        }
      </div>
    </div>
  );
}
