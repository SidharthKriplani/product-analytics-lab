// Shared "Continue" resolution for SQL Lab — used by both render sites (Progress
// dashboard section + the SQL Lab browse grid itself) so the read rule lives in one
// place. T3 follow-up v2: typed-wins semantics from the start (v1 only tracked opens).
//
// Read rule: prefer the last-TYPED problem if it still has a non-empty draft in
// pal-sql-query-<id> (i.e. there's real unsaved-in-spirit work sitting there); otherwise
// fall back to the last-OPENED problem. If neither key resolves to a real problem, there
// is nothing to continue.

export function getSqlLabContinueInfo(solvedSet, problems) {
  let lastTyped = null;
  let lastOpened = null;
  try { lastTyped = JSON.parse(localStorage.getItem('pal-sql-last-typed-v1') || 'null'); } catch {}
  try { lastOpened = JSON.parse(localStorage.getItem('pal-sql-last-open-v1') || 'null'); } catch {}

  let continueProblem = null;
  let isDraft = false;

  if (lastTyped && lastTyped.id) {
    let draft = null;
    try { draft = localStorage.getItem('pal-sql-query-' + lastTyped.id); } catch {}
    if (draft && draft.trim()) {
      const p = problems.find(p => p.id === lastTyped.id);
      if (p) { continueProblem = p; isDraft = true; }
    }
  }
  if (!continueProblem && lastOpened && lastOpened.id) {
    const p = problems.find(p => p.id === lastOpened.id);
    if (p) continueProblem = p;
  }

  const nextUpProblem = problems.find(p => !solvedSet.has(p.id)) || null;

  return { continueProblem, isDraft, nextUpProblem };
}
