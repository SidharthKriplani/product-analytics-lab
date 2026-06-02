import { useState } from 'react';

export function RCADebriefPanel({ rcaCase, onRetry, onBack, onNext }) {
  const { seniorDiagnosis, leadershipNote } = rcaCase;
  const [leadershipOpen, setLeadershipOpen] = useState(false);
  const [nextHovered, setNextHovered] = useState(false);
  const [retryHovered, setRetryHovered] = useState(false);
  const [backHovered, setBackHovered] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{
        background: 'var(--yellow-bg)',
        border: '1.5px solid var(--yellow-border)',
        borderRadius: 'var(--radius)',
        padding: '1.1rem 1.25rem',
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--yellow)', marginBottom: '0.35rem' }}>
          Senior Diagnosis
        </div>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 }}>
          {seniorDiagnosis.likelyCause}
        </div>
      </div>

      {/* Reasoning */}
      <Section title="Reasoning">
        <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          {seniorDiagnosis.reasoning}
        </p>
      </Section>

      {/* Validation plan */}
      <Section title="Validation Plan">
        <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {seniorDiagnosis.validationPlan.map((step, i) => (
            <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {step}
            </li>
          ))}
        </ul>
      </Section>

      {/* Recommendation */}
      <Section title="Recommendation">
        <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          {seniorDiagnosis.recommendation}
        </p>
      </Section>

      {/* Common mistakes */}
      <Section title="Common Mistakes">
        <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {seniorDiagnosis.commonMistakes.map((mistake, i) => (
            <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {mistake}
            </li>
          ))}
        </ul>
      </Section>

      {/* Interview phrase */}
      <div style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
        borderLeft: '4px solid var(--yellow)',
        borderRadius: 'var(--radius)',
        padding: '1rem 1.25rem',
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--yellow)', marginBottom: '0.5rem' }}>
          Interview Phrase
        </div>
        <blockquote style={{
          margin: 0,
          fontSize: '0.9rem', fontStyle: 'italic', fontWeight: 500,
          color: 'var(--text)', lineHeight: 1.6,
        }}>
          "{seniorDiagnosis.interviewPhrase}"
        </blockquote>
      </div>

      {/* Leadership Lens toggle */}
      {leadershipNote && (
        <div>
          <button
            onClick={() => setLeadershipOpen(o => !o)}
            style={{
              width: '100%', textAlign: 'left',
              background: leadershipOpen ? 'var(--purple-bg)' : 'var(--surface)',
              border: leadershipOpen ? '1px solid var(--purple-border)' : '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '0.65rem 1rem',
              cursor: 'pointer',
              color: leadershipOpen ? 'var(--purple)' : 'var(--text-muted)',
              fontSize: '0.84rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.12s',
            }}
          >
            <span>{leadershipOpen ? '▾' : '▸'}</span>
            <span>💼 Leadership Lens</span>
          </button>
          {leadershipOpen && (
            <div style={{
              borderLeft: '3px solid var(--purple)',
              background: 'var(--purple-bg)',
              borderRadius: '0 var(--radius) var(--radius) 0',
              padding: '0.9rem 1.1rem',
              marginTop: '0.25rem',
            }}>
              <div style={{
                fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--purple)', marginBottom: '0.45rem',
              }}>
                💼 How a Staff DS thinks about this
              </div>
              <p style={{
                margin: 0, fontSize: '0.9rem', color: 'var(--text)',
                lineHeight: 1.7,
              }}>
                {leadershipNote}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
        {onNext && (
          <button
            onClick={onNext}
            style={{
              background: 'var(--yellow)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius)',
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem', fontWeight: 700,
              cursor: 'pointer', transition: 'opacity 0.12s',
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
            background: retryHovered ? 'var(--yellow)' : 'var(--yellow-bg)',
            border: '1.5px solid var(--yellow-border)',
            color: retryHovered ? '#fff' : 'var(--yellow)',
            borderRadius: 'var(--radius)',
            padding: '0.6rem 1.25rem',
            fontSize: '0.85rem', fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.12s, color 0.12s',
          }}
          onMouseEnter={() => setRetryHovered(true)}
          onMouseLeave={() => setRetryHovered(false)}
        >
          Try again
        </button>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: '1.5px solid ' + (backHovered ? 'var(--yellow-border)' : 'var(--border)'),
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius)',
            padding: '0.6rem 1.25rem',
            fontSize: '0.85rem', fontWeight: 600,
            cursor: 'pointer',
            transition: 'border-color 0.12s',
          }}
          onMouseEnter={() => setBackHovered(true)}
          onMouseLeave={() => setBackHovered(false)}
        >
          ← Back to RCA Room
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1rem 1.25rem',
    }}>
      <div style={{
        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em',
        color: 'var(--text-muted)', marginBottom: '0.6rem',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}
