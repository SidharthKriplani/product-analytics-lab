/**
 * Breadcrumb — "PAL → Room → Case" nav trail in runner headers
 * Usage: <Breadcrumb crumbs={[{ label: 'RCA Room', onClick: onBack }, { label: 'RCA07' }]} />
 */
export function Breadcrumb({ crumbs }) {
  if (!crumbs || crumbs.length === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
      {crumbs.map((crumb, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {i > 0 && <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>›</span>}
          {crumb.onClick ? (
            <button
              onClick={crumb.onClick}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em', transition: 'color 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              {crumb.label}
            </button>
          ) : (
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)' }}>
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
