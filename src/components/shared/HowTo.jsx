/**
 * HowTo — standardized "what skill you're building + steps" opener for Foundation modules
 * Usage: <HowTo skill="what skill" steps={['Step 1', 'Step 2', 'Step 3']} color="var(--teal)" />
 * Never more than 3 steps. Sets cognitive frame before any interaction.
 */
export function HowTo({ skill, steps, color = 'var(--teal)' }) {
  if (!skill && (!steps || steps.length === 0)) return null;

  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderLeft: '3px solid ' + color,
      borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
      padding: '0.75rem 1rem',
      marginBottom: '1.25rem',
    }}>
      {skill && (
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color, marginBottom: steps && steps.length > 0 ? '0.4rem' : 0 }}>
          Skill: {skill}
        </div>
      )}
      {steps && steps.length > 0 && (
        <ol style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {steps.slice(0, 3).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
