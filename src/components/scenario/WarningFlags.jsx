import { Icon } from '../shared/Icon.jsx';

function SeverityIcon({ severity }) {
  if (severity === 'critical') return <span style={{ color: 'var(--red)', fontSize: '1rem' }}><Icon name='alert-triangle' size={16} color='var(--red)' /></span>;
  if (severity === 'warning') return <span style={{ color: 'var(--yellow)', fontSize: '1rem' }}>◉</span>;
  return <span style={{ color: 'var(--accent)', fontSize: '1rem' }}>ℹ</span>;
}

function severityColor(severity) {
  if (severity === 'critical') return 'var(--red)';
  if (severity === 'warning') return 'var(--yellow)';
  return 'var(--accent)';
}

function severityBg(severity) {
  if (severity === 'critical') return 'var(--red-bg)';
  if (severity === 'warning') return 'var(--yellow-bg)';
  return 'var(--accent-bg)';
}

export function WarningFlags({ flags, checked, onToggle, interactive }) {
  if (!flags || flags.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {flags.map((flag) => {
        const isChecked = checked?.includes(flag.id);
        const sc = severityColor(flag.severity);
        return (
          <div
            key={flag.id}
            onClick={interactive ? () => onToggle?.(flag.id) : undefined}
            style={{
              background: isChecked ? severityBg(flag.severity) : 'var(--surface-2)',
              border: `1px solid ${isChecked ? sc : 'var(--border)'}`,
              borderLeft: `3px solid ${sc}`,
              borderRadius: '4px', padding: '0.65rem 0.75rem',
              cursor: interactive ? 'pointer' : 'default',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              {interactive && (
                <div style={{
                  width: '16px', height: '16px',
                  border: `2px solid ${isChecked ? sc : 'var(--border)'}`,
                  borderRadius: '3px',
                  background: isChecked ? sc : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.15s',
                }}>
                  {isChecked && <span style={{ color: '#fff', fontSize: '10px', fontWeight: 900 }}><Icon name='check' size={10} color='#fff' /></span>}
                </div>
              )}
              <SeverityIcon severity={flag.severity} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>{flag.label}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: interactive ? '1.5rem' : '1.25rem' }}>
              {flag.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}
