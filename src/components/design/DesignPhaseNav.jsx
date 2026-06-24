// Phase progress nav for the Design Runner
// Shows all 5 phases as tabs; completed phases get a checkmark; current is highlighted
import { Icon } from '../shared/Icon.jsx';

export function DesignPhaseNav({ phases, currentPhaseIndex, completedPhaseIds, onGoToPhase }) {
  return (
    <div style={{
      display: 'flex', gap: '0', borderBottom: '1px solid var(--border)',
      background: 'var(--surface)', overflowX: 'auto',
    }}>
      {phases.map((phase, i) => {
        const isCompleted = completedPhaseIds.includes(phase.id);
        const isCurrent = i === currentPhaseIndex;
        const isAccessible = i === 0 || completedPhaseIds.includes(phases[i - 1].id) || isCompleted;

        return (
          <button
            key={phase.id}
            onClick={() => isAccessible && onGoToPhase(i)}
            disabled={!isAccessible}
            style={{
              padding: '0.65rem 1.1rem',
              background: isCurrent ? 'var(--surface-2)' : 'transparent',
              border: 'none',
              borderBottom: isCurrent ? '2px solid var(--accent)' : '2px solid transparent',
              color: isCurrent
                ? 'var(--accent)'
                : isCompleted
                  ? 'var(--teal)'
                  : isAccessible
                    ? 'var(--text-secondary)'
                    : 'var(--text-dim)',
              fontSize: '0.78rem',
              fontWeight: isCurrent ? 700 : 500,
              cursor: isAccessible ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
              transition: 'all 0.1s',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              flexShrink: 0,
            }}
          >
            {isCompleted && !isCurrent && (
              <span style={{ fontSize: '0.68rem', color: 'var(--teal)', display: 'inline-flex', alignItems: 'center' }}><Icon name='check' size={11} color='var(--teal)' /></span>
            )}
            <span>{i + 1}. {phase.label}</span>
          </button>
        );
      })}
    </div>
  );
}
