export function VerdictStrip({ value, onChange }) {
  const options = [
    {
      id: 'ship',
      label: 'Ship',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M8 2v8M5 7l3 3 3-3"/>
          <path d="M2 12h12"/>
        </svg>
      ),
    },
    {
      id: 'noship',
      label: 'No ship',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="8" cy="8" r="6"/>
          <line x1="4" y1="4" x2="12" y2="12"/>
        </svg>
      ),
    },
    {
      id: 'dig',
      label: 'Dig deeper',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5"/>
          <line x1="10.5" y1="10.5" x2="14" y2="14"/>
          <line x1="7" y1="5" x2="7" y2="9"/>
          <line x1="7" y1="5" x2="7" y2="9"/>
          <circle cx="7" cy="10" r="0.6" fill="currentColor" stroke="none"/>
        </svg>
      ),
    },
    {
      id: 'invalid',
      label: 'Invalid test',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M8 2L14 13H2L8 2z"/>
          <line x1="8" y1="6" x2="8" y2="9.5"/>
          <circle cx="8" cy="11.5" r="0.6" fill="currentColor" stroke="none"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="verdict-strip" role="group" aria-label="Verdict">
      {options.map(opt => (
        <button
          key={opt.id}
          className={`verdict-option ${opt.id}${value === opt.id ? ' selected' : ''}`}
          onClick={() => onChange(opt.id === value ? null : opt.id)}
          aria-pressed={value === opt.id}
          type="button"
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
