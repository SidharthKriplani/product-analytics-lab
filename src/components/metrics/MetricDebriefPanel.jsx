// Senior debrief panel — shows the authoritative metric design after submission

import { useState } from 'react';

const ROLE_CFG = {
  primary:    { label: 'Primary',    color: 'var(--green-text)', bg: 'var(--green-bg)',   border: 'var(--green-border)' },
  diagnostic: { label: 'Diagnostic', color: 'var(--blue-text)', bg: 'var(--blue-bg)',    border: 'var(--blue-border)' },
  guardrail:  { label: 'Guardrail',  color: 'var(--yellow)',    bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
};

export function MetricDebriefPanel({ metricCase, onRetry, onBack, onNext, onGoToDesign, onGoToReview }) {
  const { seniorMetricDesign: smd, linkedDesignScenarioIds = [], linkedReviewScenarioIds = [] } = metricCase;
  const [nextHovered, setNextHovered] = useState(false);
  const [retryHovered, setRetryHovered] = useState(false);
  const [backHovered, setBackHovered] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{
        background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
        borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem',
      }}>
        <SectionLabel color="var(--teal)">Senior Metric Design</SectionLabel>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>
          {smd.summary}
        </p>
      </div>

      {/* Metric tree */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem',
      }}>
        <SectionLabel>Metric tree</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {smd.metricTree.map((node, i) => {
            const roleCfg = ROLE_CFG[node.role] || ROLE_CFG.diagnostic;
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.7rem 0.85rem',
                  background: roleCfg.bg,
                  border: `1px solid ${roleCfg.border}`,
                  borderRadius: 'var(--radius)',
                }}
              >
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: roleCfg.color, background: 'transparent',
                  border: `1px solid ${roleCfg.border}`,
                  borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
                  flexShrink: 0, marginTop: '0.1rem',
                }}>{roleCfg.label}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>
                    {node.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {node.rationale}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Common mistakes */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem',
      }}>
        <SectionLabel>Common mistakes</SectionLabel>
        <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {smd.commonMistakes.map((m, i) => (
            <li key={i} style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {m}
            </li>
          ))}
        </ul>
      </div>

      {/* Interview phrase */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
        borderLeft: '3px solid var(--teal-border)',
        borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
      }}>
        <SectionLabel>How to say it in an interview</SectionLabel>
        <p style={{
          fontSize: '0.86rem', color: 'var(--text-secondary)',
          lineHeight: 1.65, margin: 0, fontStyle: 'italic',
        }}>
          "{smd.interviewPhrase}"
        </p>
      </div>

      {/* Linked scenarios */}
      {(linkedDesignScenarioIds.length > 0 || linkedReviewScenarioIds.length > 0) && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
        }}>
          <SectionLabel>Linked scenarios</SectionLabel>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {linkedDesignScenarioIds.map(id => (
              <Chip key={id} label={id} type="design" onClick={onGoToDesign ? () => onGoToDesign(id) : null} />
            ))}
            {linkedReviewScenarioIds.map(id => (
              <Chip key={id} label={id} type="review" onClick={onGoToReview ? () => onGoToReview(id) : null} />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
        {onNext && (
          <button
            onClick={onNext}
            className="pal-glow-pulse"
            style={{
              background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius)', padding: '0.65rem 1.25rem',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.1s',
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
            background: retryHovered ? 'var(--teal)' : 'var(--teal-bg)',
            border: '1.5px solid var(--teal-border)',
            borderRadius: 'var(--radius)', padding: '0.65rem 1.25rem',
            fontSize: '0.85rem', fontWeight: 700, color: retryHovered ? '#fff' : 'var(--teal)',
            cursor: 'pointer', transition: 'all 0.1s',
          }}
          onMouseEnter={() => setRetryHovered(true)}
          onMouseLeave={() => setRetryHovered(false)}
        >
          Try again
        </button>
        <button
          onClick={onBack}
          style={{
            background: 'var(--surface-2)',
            border: '1px solid ' + (backHovered ? 'var(--teal-border)' : 'var(--border)'),
            borderRadius: 'var(--radius)', padding: '0.65rem 1.25rem',
            fontSize: '0.85rem', fontWeight: 600,
            color: backHovered ? 'var(--text)' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.1s',
          }}
          onMouseEnter={() => setBackHovered(true)}
          onMouseLeave={() => setBackHovered(false)}
        >
          ← Back to Metrics
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children, color }) {
  return (
    <div style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.09em', color: color || 'var(--text-dim)',
      marginBottom: '0.65rem',
    }}>{children}</div>
  );
}

function Chip({ label, type, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isDesign = type === 'design';
  const baseStyle = {
    fontSize: '0.72rem', fontWeight: 600,
    color: isDesign ? 'var(--accent)' : 'var(--text-secondary)',
    background: isDesign ? 'var(--accent-bg)' : 'var(--surface-2)',
    border: `1px solid ${isDesign ? 'var(--accent-border)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.55rem',
  };
  if (onClick) {
    return (
      <button
        onClick={onClick}
        style={{ ...baseStyle, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.1s', opacity: hovered ? 0.75 : 1 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isDesign ? 'Design: ' : 'Review: '}{label} →
      </button>
    );
  }
  return (
    <span style={baseStyle}>
      {isDesign ? 'Design: ' : 'Review: '}{label}
    </span>
  );
}
