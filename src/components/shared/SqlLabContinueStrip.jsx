import { getSqlLabContinueInfo } from '../../utils/sqlLabContinue.js';

// Shared "Continue" strip for SQL Lab -- rendered on both the Progress dashboard
// (SQL Lab section) and the SQL Lab browse grid itself (top, near the crash-plan
// cards), so the markup and read rule live in exactly one place (T3 follow-up v2).
// `onOpen(id)` is the only thing callers customize: Progress navigates via the
// #/sql-lab/<id> hash, the browse grid calls its own onSelect callback directly.
export function SqlLabContinueStrip({ solved, problems, totalCount, onOpen }) {
  const { continueProblem, isDraft, nextUpProblem } = getSqlLabContinueInfo(solved, problems);
  if (!continueProblem && !nextUpProblem) return null;

  const total = typeof totalCount === 'number' ? totalCount : problems.length;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {continueProblem && (
        <button
          onClick={() => onOpen(continueProblem.id)}
          style={{
            textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
            padding: '0.4rem 0.75rem', borderRadius: '8px',
            background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.25)',
            color: 'var(--teal)', fontSize: '0.78rem', fontWeight: 600,
          }}
        >
          {isDraft
            ? `Continue: ${continueProblem.title} · draft in progress`
            : `Continue: ${continueProblem.title} · ${continueProblem.difficulty} · ${solved.size}/${total}`}
        </button>
      )}
      {nextUpProblem && nextUpProblem.id !== continueProblem?.id && (
        <button
          onClick={() => onOpen(nextUpProblem.id)}
          style={{
            textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
            padding: '0.4rem 0.75rem', borderRadius: '8px',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600,
          }}
        >
          Next up: {nextUpProblem.title}
        </button>
      )}
    </div>
  );
}
