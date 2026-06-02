import { useState } from 'react';
import { Icon } from './Icon.jsx';

/**
 * LeadershipLens — collapsible Staff-level perspective toggle
 * Usage: <LeadershipLens note={caseData.leadershipNote} />
 * Renders nothing when note is empty/undefined.
 */
export function LeadershipLens({ note }) {
  const [open, setOpen] = useState(false);
  if (!note) return null;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left',
          background: open ? 'var(--purple-bg)' : 'var(--surface)',
          border: open ? '1px solid var(--purple-border)' : '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '0.65rem 1rem',
          cursor: 'pointer',
          color: open ? 'var(--purple)' : 'var(--text-muted)',
          fontSize: '0.84rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          transition: 'all 0.12s',
        }}
      >
        <span style={{ fontSize: '0.7rem' }}>{open ? '▾' : '▸'}</span>
        <Icon name="briefcase" size={14} color={open ? 'var(--purple)' : 'var(--text-muted)'} />
        <span>Leadership Lens</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Staff read</span>
      </button>
      {open && (
        <div style={{
          borderLeft: '3px solid var(--purple)',
          background: 'var(--purple-bg)',
          borderRadius: '0 var(--radius) var(--radius) 0',
          padding: '0.9rem 1.1rem',
          marginTop: '0.2rem',
        }}
        className="pal-reveal-in"
        >
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--purple)', marginBottom: '0.45rem' }}>
            How a Staff analyst thinks about this
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.75 }}>
            {note}
          </p>
        </div>
      )}
    </div>
  );
}
