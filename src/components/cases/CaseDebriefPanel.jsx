// CaseDebriefPanel — senior answer debrief view
// Props: { businessCase, onRetry, onBack }

import { useState } from 'react';

export function CaseDebriefPanel({ businessCase, onRetry, onBack, onNext }) {
  const sa = businessCase.seniorAnswer;
  const [nextHovered, setNextHovered] = useState(false);
  const [retryHovered, setRetryHovered] = useState(false);
  const [backHovered, setBackHovered] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Section label */}
      <div>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--purple)', marginBottom: '0.5rem',
        }}>
          Senior Answer
        </div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.01em' }}>
          {businessCase.title}
        </h2>
      </div>

      {/* Recommendation — prominent */}
      <section>
        <SectionLabel>Recommendation</SectionLabel>
        <p style={{
          fontSize: '1rem', fontWeight: 600, color: 'var(--text)',
          lineHeight: 1.65, margin: 0,
          padding: '0.9rem 1.1rem',
          background: 'var(--purple-bg)',
          border: '1px solid var(--purple-border)',
          borderLeft: '4px solid var(--purple)',
          borderRadius: 'var(--radius-sm)',
        }}>
          {sa.recommendation}
        </p>
      </section>

      {/* Full reasoning */}
      <section>
        <SectionLabel>Full reasoning</SectionLabel>
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)', padding: '0.9rem 1rem',
        }}>
          <p style={{
            fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0,
          }}>
            {sa.reasoning}
          </p>
        </div>
      </section>

      {/* Key framing insight */}
      <section>
        <SectionLabel>Key framing insight</SectionLabel>
        <div style={{
          borderLeft: '3px solid var(--purple)',
          background: 'var(--purple-bg)',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          padding: '0.75rem 1rem',
        }}>
          <p style={{ fontSize: '0.87rem', color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>
            {sa.keyFraming}
          </p>
        </div>
      </section>

      {/* Common mistakes */}
      <section>
        <SectionLabel>Common mistakes</SectionLabel>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {sa.commonMistakes.map((mistake, i) => (
            <li key={i} style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {mistake}
            </li>
          ))}
        </ul>
      </section>

      {/* Interview phrase */}
      <section>
        <SectionLabel>Interview phrase</SectionLabel>
        <div style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--teal)',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          padding: '0.75rem 1rem',
        }}>
          <p style={{
            fontSize: '0.87rem', color: 'var(--text)', margin: 0, lineHeight: 1.65,
            fontStyle: 'italic',
          }}>
            {sa.interviewPhrase}
          </p>
        </div>
      </section>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
        {onNext && (
          <button
            onClick={onNext}
            style={{
              background: 'var(--purple)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '0.55rem 1.1rem',
              fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer',
              transition: 'opacity 0.1s',
              opacity: nextHovered ? 0.88 : 1,
            }}
            onMouseEnter={() => setNextHovered(true)}
            onMouseLeave={() => setNextHovered(false)}
          >
            Next case →
          </button>
        )}
        <button
          onClick={onRetry}
          style={{
            background: onNext ? 'none' : 'var(--purple)', color: onNext ? 'var(--text-muted)' : '#fff',
            border: onNext ? '1px solid var(--border)' : 'none', borderRadius: 'var(--radius-sm)',
            padding: '0.55rem 1.1rem',
            fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer',
            transition: 'opacity 0.1s',
            opacity: retryHovered ? 0.88 : 1,
          }}
          onMouseEnter={() => setRetryHovered(true)}
          onMouseLeave={() => setRetryHovered(false)}
        >
          ↺ Try again
        </button>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: '1px solid ' + (backHovered ? 'var(--purple-border)' : 'var(--border)'),
            borderRadius: 'var(--radius-sm)', padding: '0.55rem 1.1rem',
            color: backHovered ? 'var(--purple)' : 'var(--text-muted)',
            fontSize: '0.86rem', cursor: 'pointer',
            transition: 'all 0.12s',
          }}
          onMouseEnter={() => setBackHovered(true)}
          onMouseLeave={() => setBackHovered(false)}
        >
          ← Back to Cases
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
      color: 'var(--text-dim)', marginBottom: '0.55rem',
    }}>
      {children}
    </div>
  );
}
