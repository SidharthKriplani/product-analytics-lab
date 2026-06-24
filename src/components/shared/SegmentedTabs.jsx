// SegmentedTabs — reusable sub-navigation for rooms that hold more than one
// content section (e.g. Metrics | Growth Analytics). One tab active at a time;
// switching swaps the visible case grid instead of stacking sections.
//
// Props:
//   tabs:    [{ id, label, count? }]
//   value:   active tab id
//   onChange: (id) => void
//   accent:  CSS color var name without var() wrapper, e.g. 'green' | 'teal' | 'accent'
//            (defaults to 'accent'). Drives the active pill color.

export function SegmentedTabs({ tabs = [], value, onChange, accent = 'accent' }) {
  if (tabs.length < 2) return null;

  const accentColor = `var(--${accent})`;
  const accentBg = `var(--${accent}-bg)`;
  const accentBorder = `var(--${accent}-border)`;

  return (
    <div
      role='tablist'
      style={{
        display: 'inline-flex',
        gap: '0.25rem',
        padding: '0.25rem',
        marginBottom: '1.5rem',
        borderRadius: 'var(--radius-md, 10px)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        maxWidth: '100%',
        flexWrap: 'wrap',
      }}
    >
      {tabs.map(tab => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            role='tab'
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.95rem',
              borderRadius: 'var(--radius-sm, 7px)',
              border: `1px solid ${active ? accentBorder : 'transparent'}`,
              background: active ? accentBg : 'transparent',
              color: active ? accentColor : 'var(--text-muted)',
              fontWeight: active ? 700 : 500,
              fontSize: '0.85rem',
              letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'all 0.14s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.05rem 0.4rem',
                  borderRadius: '999px',
                  background: active ? accentColor : 'var(--border)',
                  color: active ? 'var(--surface)' : 'var(--text-muted)',
                  lineHeight: 1.4,
                  transition: 'all 0.14s ease',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedTabs;
