// ─── Shared Foundation Primitives ─────────────────────────────────────────────
// Single source of truth for InsightBox, NextBtn, MCQOption, CheckBtn,
// InstructionBox. All 4 foundation runners import from here.
// Color-parameterized — each runner passes its room color.

export function InsightBox({ label, color, bg, border, children }) {
  return (
    <div style={{
      background: bg || 'var(--teal-bg)',
      border: '1.5px solid ' + (border || 'var(--teal-border)'),
      borderRadius: 'var(--radius)',
      padding: '1rem 1.25rem',
    }}>
      <div style={{
        fontSize: '0.7rem', fontWeight: 700,
        color: color || 'var(--teal)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: '0.4rem',
      }}>
        {label || 'Key Insight'}
      </div>
      <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
        {children}
      </div>
    </div>
  );
}

export function NextBtn({ onClick, label, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
      <button onClick={onClick} className='pal-glow-pulse' style={{
        padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none',
        background: color || 'var(--teal)', color: '#fff', fontWeight: 700,
        fontSize: '0.9rem', cursor: 'pointer',
      }}>
        {label || 'Next concept →'}
      </button>
    </div>
  );
}

export function MCQOption({ label, selected, correct, revealed, onClick, accentColor }) {
  var accent = accentColor || 'var(--accent)';
  var bg = 'var(--surface)';
  var border = 'var(--border)';
  var color = 'var(--text)';
  if (revealed) {
    if (correct) { bg = 'var(--green-bg)'; border = 'var(--green-border)'; color = 'var(--green)'; }
    else if (selected) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
  } else if (selected) { bg = 'var(--accent-bg)'; border = accent; color = accent; }
  return (
    <button onClick={onClick} disabled={revealed} style={{
      display: 'block', width: '100%', textAlign: 'left',
      padding: '0.7rem 1rem', borderRadius: 'var(--radius-sm)',
      border: '1.5px solid ' + border,
      background: bg, color: color, fontSize: '0.88rem',
      cursor: revealed ? 'default' : 'pointer',
      fontWeight: selected || (revealed && correct) ? 600 : 400,
      transition: 'all 0.15s',
    }}>
      {label}
    </button>
  );
}

export function CheckBtn({ onClick, color }) {
  return (
    <button onClick={onClick} style={{
      padding: '0.5rem 1.3rem', borderRadius: 'var(--radius-sm)', border: 'none',
      background: color || 'var(--accent)', color: '#fff', fontWeight: 700,
      fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem',
    }}>
      Check
    </button>
  );
}

export function InstructionBox({ color, bg, border, children }) {
  return (
    <div style={{
      background: bg || 'var(--teal-bg)',
      border: '1px solid ' + (border || 'var(--teal-border)'),
      borderRadius: 'var(--radius)',
      padding: '0.75rem 1rem',
      fontSize: '0.85rem',
      color: color || 'var(--teal)',
      lineHeight: 1.6,
      marginBottom: '0.75rem',
    }}>
      {children}
    </div>
  );
}
