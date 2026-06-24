// src/pages/Library.jsx
// One front door for PAL's reference content. Collapses the old five-item
// "Learn" shelf (Deep Dives, Frameworks, Interview Q&A, Prep Cheatsheet,
// Analytics Failures) into a single Library landing page. Each card routes to
// its existing page — content is unchanged, only the nav is consolidated.

const LIBRARY_CARDS = [
  {
    id: 'blog',
    label: 'Deep Dives',
    description: 'Long-form essays unpacking the concepts behind the cases.',
    color: 'var(--accent)',
  },
  {
    id: 'playbook',
    label: 'Frameworks',
    description: 'Reusable structures for metrics, RCA, experiments, and product sense.',
    color: 'var(--teal)',
  },
  {
    id: 'interview-qa',
    label: 'Interview Q&A',
    description: 'Common interview questions with model answers and reasoning.',
    color: 'var(--purple)',
  },
  {
    id: 'cheatsheet',
    label: 'Prep Cheatsheet',
    description: 'Time-boxed prep plans plus last-minute SQL, stats, and metrics references.',
    color: 'var(--yellow)',
  },
  {
    id: 'failures',
    label: 'Analytics Failures',
    description: 'Real-world analytics mistakes and what they teach.',
    color: 'var(--red)',
  },
];

export function Library({ onNavigate }) {
  return (
    <div className="pal-page-enter" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem 2.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)',
            margin: '0 0 0.5rem', letterSpacing: '-0.025em',
          }}>
            Library
          </h1>
          <p style={{
            fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0,
            lineHeight: 1.6, maxWidth: '580px',
          }}>
            Everything to read between reps — deep dives, frameworks, interview Q&A, prep
            cheatsheets, and analytics failures, all in one place.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
          gap: '1.25rem',
        }}>
          {LIBRARY_CARDS.map((card, index) => (
            <button
              key={card.id}
              className="pal-card-enter pal-card-hover"
              onClick={() => onNavigate(card.id)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid ' + card.color,
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                animationDelay: (index * 28) + 'ms',
              }}
            >
              <div style={{
                fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
              }}>
                <span>{card.label}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', flexShrink: 0 }}>→</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                {card.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Library;
