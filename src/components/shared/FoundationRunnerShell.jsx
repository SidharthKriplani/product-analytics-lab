// ─── Shared Foundation Runner Shell ───────────────────────────────────────────
// Header chrome for all 4 foundation runners.
// Provides: back button, progress counter, module header, content slot.
// No sidebar. No bookmarks. No notes. Clean single-column layout.

export function FoundationRunnerShell({
  module,         // current module object
  totalModules,   // total module count
  completed,      // boolean — is this module done
  color,          // CSS var string, e.g. 'var(--green)'
  roomLabel,      // e.g. 'Metrics Foundations'
  onBack,         // () => void — back to browser
  children,       // module content
  playbookLinks,  // optional array of { id, label }
}) {
  if (!module) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Module not found.</div>
    );
  }

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '1.5rem 1rem', width: '100%', boxSizing: 'border-box' }}>

      {/* Nav bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0',
          display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}>
          ← All modules
        </button>
        <span style={{ color: 'var(--border)', fontSize: '0.8rem' }}>|</span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Module {module.index} of {totalModules}
        </span>
        {completed && (
          <span style={{
            fontSize: '0.72rem', fontWeight: 700,
            padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)',
            background: 'var(--green-bg)', color: 'var(--green)',
            border: '1px solid var(--green-border)',
          }}>
            ✓ Complete
          </span>
        )}
      </div>

      {/* Module header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{
          fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)',
          letterSpacing: '-0.025em', margin: '0 0 0.3rem',
        }}>
          {module.index}. {module.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 0.75rem' }}>
          {module.subtitle}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{module.estimatedMin} min</span>
          {module.tags && module.tags.slice(0, 4).map(function (tag) {
            return (
              <span key={tag} style={{
                fontSize: '0.68rem', padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)',
                color: 'var(--text-muted)', border: '1px solid var(--border)',
              }}>
                {tag}
              </span>
            );
          })}
        </div>
      </div>

      {/* Module content (slot) */}
      {children}

      {/* Playbook links */}
      {playbookLinks && playbookLinks.length > 0 && (
        <div style={{
          marginTop: '1.5rem', padding: '0.9rem 1.1rem',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}>
          <div style={{
            fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem',
          }}>
            Further reading
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {playbookLinks.map(function (link) {
              return (
                <span key={link.id} style={{
                  fontSize: '0.78rem', padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-sm)', background: 'var(--surface)',
                  border: '1px solid var(--border)', color: 'var(--text-muted)',
                  cursor: 'default',
                }}>
                  {link.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
