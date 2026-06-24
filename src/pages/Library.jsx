// src/pages/Library.jsx
// One front door for PAL's reference content. Collapses the old five-item
// "Learn" shelf (Deep Dives, Frameworks, Interview Q&A, Prep Cheatsheet,
// Analytics Failures) into a single Library landing page. Each card routes to
// its existing page — content is unchanged, only the nav is consolidated.
//
// Counts: Interview Q&A is live (imported). The others are curated/honest — in
// particular Deep Dives reflects the count of *written* essays, not stubbed
// placeholders. Update DEEP_DIVE_COUNT / FAILURE_COUNT if that content grows.

import { Icon } from '../components/shared/Icon.jsx';
import { interviewQA } from '../data/interviewQA.js';

const DEEP_DIVE_COUNT = 12;   // written long-form essays (stubs excluded)
const FAILURE_COUNT = 25;     // dissected real-world failures

const LIBRARY_CARDS = [
  {
    id: 'blog',
    label: 'Deep Dives',
    icon: 'book-open',
    meta: DEEP_DIVE_COUNT + ' essays',
    description: 'Long-form essays unpacking the concepts behind the cases — the why under the what.',
    color: 'var(--accent)',
  },
  {
    id: 'playbook',
    label: 'Frameworks',
    icon: 'layers',
    meta: 'Every room',
    description: 'Reusable structures for metrics, RCA, experiments, and product sense — grab one mid-case.',
    color: 'var(--teal)',
  },
  {
    id: 'interview-qa',
    label: 'Interview Q&A',
    icon: 'file-text',
    meta: interviewQA.length + ' questions',
    description: 'Common interview questions with model answers and the reasoning behind them.',
    color: 'var(--purple)',
  },
  {
    id: 'cheatsheet',
    label: 'Prep Cheatsheet',
    icon: 'calculator',
    meta: 'Quick reference',
    description: 'Time-boxed prep plans plus last-minute SQL, stats, and metrics references.',
    color: 'var(--yellow)',
  },
  {
    id: 'failures',
    label: 'Analytics Failures',
    icon: 'alert-triangle',
    meta: FAILURE_COUNT + ' cases',
    description: 'Real-world analytics mistakes, dissected — the cause, the fix, and what they teach.',
    color: 'var(--red)',
  },
];

export function Library({ onNavigate }) {
  return (
    <div className="pal-page-enter" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '2.25rem 1.5rem 3rem' }}>

        {/* Hero */}
        <div style={{ marginBottom: '2.25rem' }}>
          <div style={{
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'var(--text-muted)', marginBottom: '0.55rem',
          }}>
            Learn · Reference
          </div>
          <h1 style={{
            fontSize: '1.9rem', fontWeight: 800, color: 'var(--text)',
            margin: '0 0 0.55rem', letterSpacing: '-0.025em',
          }}>
            Library
          </h1>
          <p style={{
            fontSize: '0.96rem', color: 'var(--text-muted)', margin: 0,
            lineHeight: 1.6, maxWidth: '600px',
          }}>
            Everything to read between reps — deep dives, frameworks, interview Q&amp;A, prep
            cheatsheets, and analytics failures, all in one place.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))',
          gap: '1.1rem',
        }}>
          {LIBRARY_CARDS.map((card, index) => (
            <button
              key={card.id}
              className="pal-card-enter pal-card-hover"
              onClick={() => onNavigate(card.id)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderTop: '3px solid ' + card.color,
                borderRadius: '14px',
                padding: '1.4rem 1.5rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                animationDelay: (index * 30) + 'ms',
              }}
            >
              {/* Top row: icon tile + meta chip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <span style={{
                  width: '42px', height: '42px', borderRadius: '11px', flexShrink: 0,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={card.icon} size={20} color={card.color} />
                </span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, color: card.color,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: '999px', padding: '0.2rem 0.6rem', whiteSpace: 'nowrap',
                }}>
                  {card.meta}
                </span>
              </div>

              {/* Title */}
              <div style={{ fontSize: '1.12rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {card.label}
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, flex: 1 }}>
                {card.description}
              </p>

              {/* Footer */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                fontSize: '0.82rem', fontWeight: 700, color: card.color, marginTop: '0.1rem',
              }}>
                Explore <span aria-hidden="true">&rarr;</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Library;
