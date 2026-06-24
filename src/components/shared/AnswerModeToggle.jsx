// AnswerModeToggle — per-run segmented toggle between the scaffolded
// multiple-choice flow ("Options") and free-text "Describe" mode.
//
// The choice is persisted in localStorage under 'pal-answer-mode-v1' so it
// sticks across cases and sessions. Default is 'options' (existing behavior),
// so nothing changes unless the user opts in.
//
// Props:
//   value     'options' | 'describe'
//   onChange  (mode) => void
//   accent    CSS color var name without var() wrapper (e.g. 'green' | 'yellow'
//             | 'purple' | 'teal'). Drives the active pill color per room.

const MODE_KEY = 'pal-answer-mode-v1';

export function loadAnswerMode() {
  try {
    const m = localStorage.getItem(MODE_KEY);
    return m === 'describe' ? 'describe' : 'options';
  } catch { return 'options'; }
}

export function saveAnswerMode(mode) {
  try { localStorage.setItem(MODE_KEY, mode === 'describe' ? 'describe' : 'options'); } catch {}
}

const MODES = [
  { id: 'options', label: 'Options', hint: 'Multiple choice' },
  { id: 'describe', label: 'Describe', hint: 'Type your own answer' },
];

export function AnswerModeToggle({ value, onChange, accent = 'accent' }) {
  const accentColor = `var(--${accent})`;
  const accentBg = `var(--${accent}-bg)`;
  const accentBorder = `var(--${accent}-border)`;

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
