import { ConceptChip } from '../concepts/ConceptChip.jsx';
import { Icon } from '../shared/Icon.jsx';

// Renders all fields for a single design phase
// Handles single_select and multi_select field types

export function DesignFieldGroup({ fields, answers, onChange, onOpenConcept }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {fields.map(field => (
        <FieldItem
          key={field.id}
          field={field}
          value={answers[field.id]}
          onChange={val => onChange(field.id, val)}
          onOpenConcept={onOpenConcept}
        />
      ))}
    </div>
  );
}

function FieldItem({ field, value, onChange, onOpenConcept }) {
  const isMulti = field.type === 'multi_select';

  function handleSelect(optId) {
    if (isMulti) {
      const current = Array.isArray(value) ? value : [];
      if (current.includes(optId)) {
        onChange(current.filter(id => id !== optId));
      } else {
        onChange([...current, optId]);
      }
    } else {
      onChange(optId);
    }
  }

  function isSelected(optId) {
    if (isMulti) return Array.isArray(value) && value.includes(optId);
    return value === optId;
  }

  return (
    <div>
      {/* Field label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)',
          lineHeight: 1.4,
        }}>
          {field.label}
        </span>
        {field.conceptLinks?.map(id => (
          <ConceptChip key={id} id={id} onOpen={onOpenConcept} variant="inline" />
        ))}
        {isMulti && (
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
          }}>Select all that apply</span>
        )}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {field.options.map(opt => {
          const selected = isSelected(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.75rem 0.9rem',
                background: selected ? 'var(--accent-bg)' : 'var(--surface-2)',
                border: `1.5px solid ${selected ? 'var(--accent-border)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.1s',
                width: '100%',
              }}
              onMouseEnter={e => {
                if (!selected) {
                  e.currentTarget.style.borderColor = 'var(--accent-border)';
                  e.currentTarget.style.background = 'var(--accent-bg)';
                }
              }}
              onMouseLeave={e => {
                if (!selected) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--surface-2)';
                }
              }}
            >
              {/* Indicator */}
              <div style={{
                width: '1rem', height: '1rem',
                borderRadius: isMulti ? '3px' : '50%',
                border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                background: selected ? 'var(--accent)' : 'transparent',
                flexShrink: 0, marginTop: '0.15rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selected && (
                  <span style={{ color: '#fff', fontSize: '0.68rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isMulti ? <Icon name='check' size={10} color='currentColor' /> : '●'}
                  </span>
                )}
              </div>

              {/* Label */}
              <span style={{
                fontSize: '0.86rem', color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                lineHeight: 1.5, fontWeight: selected ? 600 : 400,
              }}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
