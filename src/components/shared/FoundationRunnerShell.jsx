// ─── Shared Foundation Runner Shell ───────────────────────────────────────────
// Header chrome for all 4 foundation runners.
// Provides: back button, progress counter, module header, content slot,
// and a right-side module index for quick navigation.

import { useState } from 'react';
import { Icon } from './Icon.jsx';

export function FoundationRunnerShell({
  module,           // current module object
  totalModules,     // total module count
  completed,        // boolean — is this module done
  color,            // CSS var string, e.g. 'var(--green)'
  roomLabel,        // e.g. 'Metrics Foundations'
  onBack,           // () => void — back to browser
  children,         // module content
  playbookLinks,    // optional array of { id, label }
  modules,          // full modules array for the index
  currentModuleId,  // current module id for highlighting
  onSelectModule,   // (moduleId) => void — navigate to a module
  progress,         // object { [moduleId]: truthy } for completion dots
}) {
  var [indexOpen, setIndexOpen] = useState(false);

  if (!module) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Module not found.</div>
    );
  }

  var hasIndex = modules && modules.length > 0 && onSelectModule;

  return (
    <div style={{
      display: 'flex', gap: '1.5rem', maxWidth: hasIndex ? '1100px' : '780px',
      margin: '0 auto', padding: '1.5rem 1rem', width: '100%', boxSizing: 'border-box',
      alignItems: 'flex-start',
    }}>

      {/* ── Left: main content column ── */}
      <div style={{ flex: '1 1 0', minWidth: 0 }}>

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
              <Icon name='check' size={12} color='var(--green)' /> Complete
            </span>
          )}

          {/* Mobile toggle for module index */}
          {hasIndex && (
            <button onClick={function () { setIndexOpen(!indexOpen); }} style={{
              marginLeft: 'auto', background: 'none', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.6rem',
              fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer',
              display: 'none',
            }} className='pal-module-index-toggle'>
              {indexOpen
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name='x' size={12} color='currentColor' /> Close</span>
                : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name='menu' size={12} color='currentColor' /> Modules</span>}
            </button>
          )}
        </div>

        {/* Mobile: module index dropdown */}
        {hasIndex && indexOpen && (
          <div className='pal-module-index-mobile' style={{
            marginBottom: '1.25rem', padding: '0.6rem 0.75rem',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', maxHeight: '50vh', overflowY: 'auto',
          }}>
            <ModuleIndexList
              modules={modules}
              currentModuleId={currentModuleId}
              progress={progress}
              color={color}
              onSelectModule={function (id) { onSelectModule(id); setIndexOpen(false); }}
            />
          </div>
        )}

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

      {/* ── Right: module index (desktop only, hidden on mobile via CSS) ── */}
      {hasIndex && (
        <aside className='pal-module-index-desktop' style={{
          width: '240px', flexShrink: 0,
          position: 'sticky', top: '1.5rem',
          maxHeight: 'calc(100vh - 3rem)', overflowY: 'auto',
          padding: '0.75rem 0.85rem',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}>
          <div style={{
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: '0.6rem', paddingBottom: '0.4rem',
            borderBottom: '1px solid var(--border)',
          }}>
            {roomLabel}
          </div>
          <ModuleIndexList
            modules={modules}
            currentModuleId={currentModuleId}
            progress={progress}
            color={color}
            onSelectModule={onSelectModule}
          />
        </aside>
      )}
    </div>
  );
}

// ── Shared module list component ──
function ModuleIndexList({ modules, currentModuleId, progress, color, onSelectModule }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
      {modules.map(function (mod) {
        var isCurrent = mod.id === currentModuleId;
        var isDone = progress && !!progress[mod.id];
        return (
          <button
            key={mod.id}
            onClick={function () { if (!isCurrent) onSelectModule(mod.id); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)',
              border: 'none', background: isCurrent ? 'var(--surface-2)' : 'transparent',
              cursor: isCurrent ? 'default' : 'pointer',
              textAlign: 'left', width: '100%',
              transition: 'background 0.12s',
            }}
            onMouseEnter={function (e) { if (!isCurrent) e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={function (e) { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Completion dot */}
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
              background: isDone ? 'var(--green)' : isCurrent ? color : 'var(--border)',
            }} />
            {/* Module title */}
            <span style={{
              fontSize: '0.73rem', lineHeight: 1.3,
              color: isCurrent ? 'var(--text)' : 'var(--text-muted)',
              fontWeight: isCurrent ? 700 : 400,
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {mod.index}. {mod.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
