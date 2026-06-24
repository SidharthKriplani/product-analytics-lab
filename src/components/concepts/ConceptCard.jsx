import { conceptsById } from '../../data/concepts.js';
import { Icon } from '../shared/Icon.jsx';

export function ConceptCard({ conceptId, onClose }) {
  const concept = conceptsById[conceptId];
  if (!concept) return null;

  const categoryLabel = {
    statistics: 'Statistics',
    experiment_design: 'Experiment Design',
    metrics: 'Metrics',
    validity: 'Validity',
  }[concept.category] || concept.category;

  const categoryColor = {
    statistics: { color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
    experiment_design: { color: 'var(--teal)', bg: 'var(--teal-bg)', border: 'var(--teal-border)' },
    metrics: { color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
    validity: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  }[concept.category] || { color: 'var(--text-dim)', bg: 'var(--surface-2)', border: 'var(--border)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
              {concept.title}
              {concept.abbreviation && (
                <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}> ({concept.abbreviation})</span>
              )}
            </h3>
          </div>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: categoryColor.color, background: categoryColor.bg, border: `1px solid ${categoryColor.border}`,
            borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
          }}>{categoryLabel}</span>
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1rem',
            cursor: 'pointer', padding: '0.1rem 0.3rem', flexShrink: 0, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name='x' size={16} color='currentColor' /></button>
        )}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Section label="Plain English" value={concept.plainEnglish} />
        <Section label="Why it matters" value={concept.whyItMatters} />
        <Section label="Common mistake" value={concept.commonMistake} highlight="warning" />
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderLeft: '3px solid var(--teal)',
          borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', marginBottom: '0.3rem' }}>
            Interview phrasing
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
            {concept.interviewPhrase}
          </p>
        </div>
      </div>

      {/* Linked scenarios */}
      {concept.linkedScenarioIds?.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
            Appears in
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {concept.linkedScenarioIds.map(sid => (
              <span key={sid} style={{
                fontSize: '0.68rem', color: 'var(--accent)', background: 'var(--accent-bg)',
                border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)',
                padding: '0.1rem 0.4rem',
              }}>{sid.replace(/^s\d+-/, '').replace(/-/g, ' ')}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <p style={{
        fontSize: '0.84rem', color: highlight === 'warning' ? 'var(--text-secondary)' : 'var(--text-secondary)',
        lineHeight: 1.65, margin: 0,
        background: highlight === 'warning' ? 'var(--yellow-bg)' : 'transparent',
        borderRadius: highlight === 'warning' ? 'var(--radius-sm)' : 0,
        padding: highlight === 'warning' ? '0.4rem 0.55rem' : 0,
        border: highlight === 'warning' ? '1px solid var(--yellow-border)' : 'none',
      }}>
        {value}
      </p>
    </div>
  );
}
