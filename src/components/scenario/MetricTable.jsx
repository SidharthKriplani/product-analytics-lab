import { Icon } from '../shared/Icon.jsx';

function getDirectionStyle(metric) {
  const { direction, type, significant } = metric;
  if (type === 'diagnostic') return { color: 'var(--text-muted)' };
  if (!significant) return { color: 'var(--text-dim)' };
  if (type === 'guardrail') return { color: 'var(--red)' };
  if (direction === 'up' || direction === 'down') return { color: 'var(--green)' };
  return { color: 'var(--text-muted)' };
}

function getTypeLabel(type) {
  const map = {
    primary: { label: 'PRIMARY', color: 'var(--accent)', bg: 'var(--accent-bg)' },
    secondary: { label: 'SECONDARY', color: 'var(--text-dim)', bg: 'var(--surface-2)' },
    guardrail: { label: 'GUARDRAIL', color: 'var(--red)', bg: 'var(--red-bg)' },
    diagnostic: { label: 'DIAGNOSTIC', color: 'var(--text-muted)', bg: 'var(--surface-2)' },
  };
  return map[type] || map.secondary;
}

function DirectionArrow({ direction, significant }) {
  if (!significant || direction === 'flat') return <span style={{ color: 'var(--text-dim)' }}>—</span>;
  if (direction === 'up') return <span>↑</span>;
  if (direction === 'down') return <span>↓</span>;
  return <span>—</span>;
}

export function MetricTable({ metrics }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            {['Type', 'Metric', 'Δ', 'p-value', '95% CI', 'Sig'].map(col => (
              <th key={col} style={{
                padding: '0.5rem 0.6rem', textAlign: 'left',
                fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: 'var(--text-dim)', whiteSpace: 'nowrap',
              }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, i) => {
            const typeInfo = getTypeLabel(metric.type);
            const dirStyle = getDirectionStyle(metric);
            const isGuardrail = metric.type === 'guardrail' && metric.significant;
            const rowBg = isGuardrail ? 'var(--red-bg)' : (i % 2 === 0 ? 'transparent' : 'var(--surface-2)');

            return (
              <tr key={i} style={{ background: rowBg, borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '0.5rem 0.6rem', whiteSpace: 'nowrap' }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.4rem',
                    borderRadius: '3px', color: typeInfo.color, background: typeInfo.bg, letterSpacing: '0.04em',
                  }}>{typeInfo.label}</span>
                </td>
                <td style={{ padding: '0.5rem 0.6rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                  <div style={{ fontWeight: metric.type === 'primary' ? 600 : 400 }}>{metric.metric}</div>
                  {metric.note && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                      {metric.note}
                    </div>
                  )}
                </td>
                <td style={{ padding: '0.5rem 0.6rem', ...dirStyle, fontFamily: 'monospace', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <DirectionArrow direction={metric.direction} significant={metric.significant} />
                  {' '}{metric.delta}
                </td>
                <td style={{ padding: '0.5rem 0.6rem', fontFamily: 'monospace', color: metric.pValue != null && metric.pValue < 0.05 ? 'var(--text)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {metric.pValue != null ? metric.pValue.toFixed(3) : '—'}
                </td>
                <td style={{ padding: '0.5rem 0.6rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {metric.confidenceInterval || '—'}
                </td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'center', fontSize: '1rem' }}>
                  {metric.significant === true ? (
                    <span style={{ color: isGuardrail ? 'var(--red)' : 'var(--green)' }}>
                      {isGuardrail ? <Icon name='alert-triangle' size={16} color='var(--red)' /> : <Icon name='check' size={16} color='var(--green)' />}
                    </span>
                  ) : metric.significant === false ? (
                    <span style={{ color: 'var(--text-dim)' }}><Icon name='x' size={16} color='var(--text-dim)' /></span>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
