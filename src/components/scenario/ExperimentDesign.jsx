import { Icon } from '../shared/Icon.jsx';

function Row({ label, value }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '140px 1fr',
      gap: '0.5rem', padding: '0.5rem 0',
      borderBottom: '1px solid var(--border-subtle)', alignItems: 'start',
    }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, paddingTop: '1px' }}>{label}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}

export function ExperimentDesign({ design }) {
  return (
    <div>
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <Row label="Type" value={<span style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{design.type?.toUpperCase()}</span>} />
        <Row label="Allocation" value={<span className="mono">{design.allocation}</span>} />
        <Row label="Runtime" value={design.runtime} />
        <Row label="Population" value={design.targetPopulation} />
        <Row label="Primary Metric" value={
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{design.primaryMetric}</span>
        } />
        {design.guardrailMetrics && design.guardrailMetrics.length > 0 && (
          <Row label="Guardrails" value={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {design.guardrailMetrics.map((g, i) => (
                <span key={i} style={{ color: 'var(--red)', fontSize: '0.8rem' }}><Icon name='flag' size={13} color='var(--red)' /> {g}</span>
              ))}
            </div>
          } />
        )}
      </div>
      {design.sampleSizeContext && (
        <div style={{
          marginTop: '0.75rem', padding: '0.6rem 0.75rem',
          background: 'var(--blue-bg)', border: '1px solid var(--blue-border)',
          borderRadius: '4px', fontSize: '0.8rem', color: 'var(--blue-text)', lineHeight: 1.6,
        }}>
          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Power / Sample: </span>
          {design.sampleSizeContext}
        </div>
      )}
    </div>
  );
}
