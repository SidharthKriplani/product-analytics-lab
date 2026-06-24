// FilterBar — compact row of dropdown filters for the "Monochrome Instrument"
// design system. Replaces chip walls: each filter becomes a single labeled
// dropdown (a styled native <select> — robust, accessible, keyboard-friendly).
//
// Design rules:
//   - Hairline neutral borders, surface background, monochrome. No accent rails.
//   - The only color is the active-filter count pill + Clear link (subtle).
//   - Mobile-safe: the row wraps; each control has a sensible min-width.
//
// A filter is considered "active" when its value !== the first option's value
// (the first option is treated as the default / "All"). The active count and
// the Clear affordance are driven by that convention.
//
// Props:
//   filters — array of:
//     { id, label, value, onChange, options: [{ value, label, count? }] }
//   sort    — optional, same shape as a single filter object. Rendered at the
//             right of the row, labeled "Sort". Not counted as an active filter.

import { Icon } from './Icon.jsx';

function Dropdown({ label, value, onChange, options = [], active }) {
  return (
    <label style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
      <span style={{
        fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--text-muted)',
      }}>
        {label}
      </span>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
            background: active ? 'var(--surface-2)' : 'var(--surface)',
            border: `1px solid ${active ? 'var(--text-dim)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text)',
            fontSize: '0.8rem',
            fontWeight: active ? 600 : 500,
            padding: '0.4rem 1.7rem 0.4rem 0.65rem',
            cursor: 'pointer',
            minWidth: 130,
            maxWidth: '100%',
            lineHeight: 1.3,
            transition: 'border-color 0.14s, background 0.14s',
          }}
        >
          {options.map(opt => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}{opt.count !== undefined ? ` (${opt.count})` : ''}
            </option>
          ))}
        </select>
        <span style={{
          position: 'absolute', right: '0.5rem', pointerEvents: 'none',
          display: 'inline-flex', color: 'var(--text-muted)',
        }}>
          <Icon name='chevron-down' size={13} color='currentColor' />
        </span>
      </div>
    </label>
  );
}

export function FilterBar({ filters = [], sort }) {
  const isActive = f => f.options.length > 0 && f.value !== f.options[0].value;
  const activeFilters = filters.filter(isActive);
  const activeCount = activeFilters.length;

  const clearAll = () => {
    filters.forEach(f => {
      if (isActive(f) && f.options.length > 0) f.onChange(f.options[0].value);
    });
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: '0.7rem', flexWrap: 'wrap',
      marginBottom: '1.5rem',
    }}>
      {filters.map(f => (
        <Dropdown
          key={f.id}
          label={f.label}
          value={f.value}
          onChange={f.onChange}
          options={f.options}
          active={isActive(f)}
        />
      ))}

      {sort && (
        <Dropdown
          key={sort.id || 'sort'}
          label={sort.label || 'Sort'}
          value={sort.value}
          onChange={sort.onChange}
          options={sort.options}
          active={false}
        />
      )}

      {/* Active count + Clear — pushed to the right, only when any filter is set */}
      {activeCount > 0 && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          marginLeft: 'auto', paddingBottom: '0.4rem',
        }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '999px', padding: '0.12rem 0.55rem', whiteSpace: 'nowrap',
          }}>
            {activeCount} active
          </span>
          <button
            onClick={clearAll}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 500,
              padding: 0, textDecoration: 'underline', whiteSpace: 'nowrap',
            }}
          >
            <Icon name='x' size={11} color='currentColor' />
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

export default FilterBar;
