import { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from './shared/Icon.jsx';
import { SEARCH_INDEX } from '../data/searchIndex.js';

// ─── Global search modal (Cmd/Ctrl+K) ───────────────────────────────────────
// Dark, PAL-themed. Substring filter over label + sub + kind. Keyboard nav
// (up/down + Enter), Esc to close, click to select. On select, calls
// onSelect(entry) with the entry's { route } for App.jsx to dispatch.

const MAX_RESULTS = 40;

// Colour a kind tag by its family so the result list scans quickly.
function kindColor(kind) {
  switch (kind) {
    case 'Module': return 'var(--purple, var(--accent))';
    case 'Stats':
    case 'A/B Design':
    case 'A/B Judgment':
    case 'Spot the Flaw': return 'var(--blue, var(--accent))';
    case 'Metrics':
    case 'Growth':
    case 'BI': return 'var(--green, var(--accent))';
    case 'RCA':
    case 'Case':
    case 'Full Loop': return 'var(--teal, var(--accent))';
    case 'SQL': return 'var(--amber, var(--accent))';
    case 'Deep Dive':
    case 'Interview Q': return 'var(--accent)';
    case 'Failure': return 'var(--red, var(--accent))';
    default: return 'var(--text-muted)';
  }
}

function scoreEntry(entry, q) {
  // Cheap relevance: earlier substring position ranks higher; label beats sub.
  const label = (entry.label || '').toLowerCase();
  const sub = (entry.sub || '').toLowerCase();
  const kind = (entry.kind || '').toLowerCase();
  const li = label.indexOf(q);
  if (li === 0) return 0;
  if (li > 0) return 1 + li / 100;
  const si = sub.indexOf(q);
  if (si >= 0) return 50 + si / 100;
  const ki = kind.indexOf(q);
  if (ki >= 0) return 80 + ki / 100;
  return Infinity; // no match
}

export function SearchModal({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    // Autofocus the input on open.
    const t = setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 0);
    return () => clearTimeout(t);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Empty query — show a shallow sample so the panel isn't blank.
      return SEARCH_INDEX.slice(0, MAX_RESULTS);
    }
    const scored = [];
    for (const entry of SEARCH_INDEX) {
      const s = scoreEntry(entry, q);
      if (s !== Infinity) scored.push({ entry, s });
    }
    scored.sort((a, b) => a.s - b.s);
    return scored.slice(0, MAX_RESULTS).map(x => x.entry);
  }, [query]);

  // Reset highlight when the result set changes.
  useEffect(() => { setActive(0); }, [query]);

  // Keep the active row scrolled into view.
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector('[data-active="true"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [active, results]);

  function choose(entry) {
    if (!entry) return;
    try {
      onSelect && onSelect(entry);
    } catch (e) {
      // Never let a routing error blow up the app — just close.
      if (onClose) onClose();
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') { e.preventDefault(); onClose && onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(results[active]);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'var(--overlay, rgba(0,0,0,0.55))',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '10vh 1rem 1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        onKeyDown={onKeyDown}
        role="dialog"
        aria-label="Search"
        style={{
          width: '100%', maxWidth: 620,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius, 12px)',
          boxShadow: 'var(--shadow-lg, 0 24px 60px rgba(0,0,0,0.45))',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: '70vh',
        }}
      >
        {/* Input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.85rem 1rem',
          borderBottom: '1px solid var(--border-subtle, var(--border))',
        }}>
          <Icon name="search" size={17} color="currentColor" style={{ opacity: 0.55, flexShrink: 0, color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search cases, modules, SQL, deep dives..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: '1rem', fontFamily: 'inherit',
              letterSpacing: '-0.01em',
            }}
          />
          <kbd style={{
            fontSize: '0.68rem', padding: '0.14rem 0.4rem',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontFamily: 'inherit',
            flexShrink: 0,
          }}>Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ overflowY: 'auto', padding: '0.35rem', flex: 1 }}>
          {results.length === 0 ? (
            <div style={{
              padding: '2rem 1rem', textAlign: 'center',
              color: 'var(--text-muted)', fontSize: '0.9rem',
            }}>
              No matches for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((entry, i) => {
              const isActive = i === active;
              return (
                <button
                  key={entry.id}
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => choose(entry)}
                  onMouseEnter={() => setActive(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.7rem',
                    width: '100%', textAlign: 'left', boxSizing: 'border-box',
                    padding: '0.55rem 0.7rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isActive ? 'var(--surface-2)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                  }}
                >
                  <span style={{
                    flexShrink: 0, minWidth: 78,
                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: kindColor(entry.kind),
                    opacity: 0.9,
                  }}>
                    {entry.kind}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      display: 'block', color: 'var(--text)', fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500, letterSpacing: '-0.005em',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {entry.label}
                    </span>
                    {entry.sub && (
                      <span style={{
                        display: 'block', color: 'var(--text-muted)', fontSize: '0.72rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {entry.sub}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <Icon name="arrow-right" size={14} color="currentColor" style={{ opacity: 0.5, flexShrink: 0, color: 'var(--text-muted)' }} />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '0.55rem 1rem',
          borderTop: '1px solid var(--border-subtle, var(--border))',
          fontSize: '0.7rem', color: 'var(--text-muted)',
        }}>
          <span><kbd style={kbdStyle}>&uarr;</kbd><kbd style={kbdStyle}>&darr;</kbd> navigate</span>
          <span><kbd style={kbdStyle}>&crarr;</kbd> open</span>
          <span style={{ marginLeft: 'auto', opacity: 0.7 }}>{results.length} result{results.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
}

const kbdStyle = {
  fontSize: '0.66rem', padding: '0.05rem 0.3rem', marginRight: 3,
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontFamily: 'inherit',
};

export default SearchModal;
