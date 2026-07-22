import { getSqlLabContinueInfo } from '../../utils/sqlLabContinue.js';

// Shared "Continue" strip for SQL Lab -- rendered on both the Progress dashboard
// (SQL Lab section) and the SQL Lab browse grid itself (top, near the crash-plan
// cards), so the markup and read rule live in exactly one place (T3 follow-up v2).
// `onOpen(id)` is the only thing callers customize: Progress navigates via the
// #/sql-lab/<id> hash, the browse grid calls its own onSelect callback directly.
// "Next up" was removed per Sidharth's feedback (T3 follow-up v3) -- it added a
// second number next to the Continue chip's own X/204 that read as confusing rather
// than useful. Continue-only now.
export function SqlLabContinueStrip({ solved, problems, totalCount, onOpen }) {
  const { continueProblem, isDraft } = getSqlLabContinueInfo(solved, problems);
  if (!continueProblem) return null;

  const total = typeof totalCount === 'number' ? totalCount : problems.length;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
    </div>
  );
}
