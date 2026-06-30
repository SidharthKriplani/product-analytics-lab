// AnswerModeToggle — per-run segmented toggle between the scaffolded
// multiple-choice flow ("Guided") and free-text "Interview" mode.
//
// The choice is persisted in localStorage under 'pal-answer-mode-v1' so it
// sticks across cases and sessions.
//
// Props:
//   value     'options' | 'describe'
//   onChange  (mode) => void
//   accent    CSS color var name without var() wrapper (e.g. 'green' | 'yellow'
//             | 'purple' | 'teal'). Drives the active pill color per room.
//   locked    boolean — when true, hide the toggle and show a hint to unlock.
//             The caller is responsible for forcing value='options' when locked.

const MODE_KEY = 'pal-answer-mode-v1';

// defaultMode: 'options' for most rooms; pass 'describe' once a user
// has unlocked Interview mode in a room (completion-gated).
export function loadAnswerMode(defaultMode = 'options') {
  try {
    const m = localStorage.getItem(MODE_KEY);
    if (m === 'describe') return 'describe';
    if (m === 'options') return 'options';
    return defaultMode; // no saved preference yet
  } catch { return defaultMode; }
}

export function saveAnswerMode(mode) {
  try { localStorage.setItem(MODE_KEY, mode === 'describe' ? 'describe' : 'options'); } catch {}
}

const MODES = [
  { id: 'options', label: 'Guided', hint: 'Scaffolded multiple-choice — learn the framework' },
  { id: 'describe', label: 'Interview', hint: 'Blank slate — write your answer as in a real interview' },
];

export function AnswerModeToggle({ value, onChange, accent = 'accent', locked = false }) {
  const accentColor = `var(--${accent})`;
  const accentBg = `var(--${accent}-bg)`;
  const accentBorder = `var(--${accent}-border)`;

  if (locked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--text-dim)',
        }}>
          Answer mode
        </span>
        <span style={{
          fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)',
          padding: '0.25rem 0.7rem',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm, 7px)',
        }}>
          Guided
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
          · Complete 3 cases to unlock Interview mode
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <span style={{
        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: 'var(--text-dim)',
      }}>
        Answer mode
      </span>
      <div
        role="tablist"
        style={{
          display: 'inline-flex', gap: '0.2rem', padding: '0.2rem',
          borderRadius: 'var(--radius-md, 10px)',
          background: 'var(--surface)', border: '1px solid var(--border)',
        }}
      >
        {MODES.map(mode => {
          const active = value === mode.id;
          return (
            <button
              key={mode.id}
              role="tab"
              aria-selected={active}
              title={mode.hint}
              onClick={() => onChange(mode.id)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-sm, 7px)',
                border: `1px solid ${active ? accentBorder : 'transparent'}`,
                background: active ? accentBg : 'transparent',
                color: active ? accentColor : 'var(--text-muted)',
                fontWeight: active ? 700 : 500,
                fontSize: '0.82rem', letterSpacing: '-0.01em',
                cursor: 'pointer', transition: 'all 0.14s ease', whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AnswerModeToggle;
