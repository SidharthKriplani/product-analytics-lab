// ─── Shared Foundation Runner Shell ───────────────────────────────────────────
// Header chrome for all 4 foundation runners.
// Provides: back button, progress counter, module header, content slot,
// and a right-side module index for quick navigation.

import { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon.jsx';
import { HighlightPopover } from './HighlightPopover.jsx';
import { GlossaryHighlighter } from './GlossaryHighlighter.jsx';

// Recap toggle button style (MSL-style) — active = coloured text + border on surface-2.
function recapBtnStyle(active, color) {
  return {
    fontSize: '0.78rem', fontWeight: active ? 800 : 600, padding: '0.4rem 0.9rem',
    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
    background: active ? 'var(--surface-2)' : 'var(--surface)',
    color: active ? color : 'var(--text-muted)',
    border: '1px solid ' + (active ? color : 'var(--border)'),
  };
}

// Minimal **bold** rendering for recap bullets (no markdown dependency).
function renderRecapLine(s) {
  var parts = String(s).split(/(\*\*[^*]+\*\*)/g);
  return parts.map(function (p, i) {
    if (p.length > 4 && p.slice(0, 2) === '**' && p.slice(-2) === '**') {
      return <strong key={i} style={{ color: 'var(--text)' }}>{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}

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
  itemType,         // track item type for this family, e.g. 'sf_module' — powers highlight-to-track
}) {
  var [indexOpen, setIndexOpen] = useState(false);
  var [recapMode, setRecapMode] = useState(false);
  var [deeperOpen, setDeeperOpen] = useState(false);
  var contentRef = useRef(null);
  // Reset to full-module view whenever the module changes (MSL behaviour).
  useEffect(function () { setRecapMode(false); }, [module ? module.id : null]);
  // Go Deeper — Academic panel always starts collapsed on a fresh module.
  useEffect(function () { setDeeperOpen(false); }, [module ? module.id : null]);

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

        {/* Recap toggle (MSL-style) — only when the module provides a recap */}
        {module.recap && module.recap.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
            <button onClick={function () { setRecapMode(false); }} style={recapBtnStyle(!recapMode, color)}>Full module</button>
            <button onClick={function () { setRecapMode(true); }} style={recapBtnStyle(recapMode, color)}>⚡ Quick recap</button>
          </div>
        )}

        {/* Module content (slot) — or the quick recap when toggled.
            Wrapped in a ref'd div so the highlight-to-track toolbar can scope
            its selection listener to just this content area (not the whole
            page — selecting text in the sidebar/nav/module index is exempt). */}
        <div ref={contentRef}>
          {recapMode && module.recap && module.recap.length > 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid ' + color, borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.9rem' }}>
                Quick recap · {module.title}
              </div>
              {module.recap.map(function (pt, i) {
                return (
                  <div key={i} style={{ display: 'flex', gap: '0.55rem', marginBottom: '0.7rem', alignItems: 'flex-start' }}>
                    <span style={{ color: color, fontWeight: 800, flexShrink: 0, lineHeight: 1.5 }}>›</span>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{renderRecapLine(pt)}</div>
                  </div>
                );
              })}
            </div>
          ) : children}
        </div>

        {/* Highlight-to-track toolbar — appears on any text selection inside
            the content area above. v1: saves a snapshot (text/color/note/
            source link) to Tracks; does NOT repaint the highlight on revisit. */}
        <HighlightPopover
          containerRef={contentRef}
          sourceLabel={module.title}
          itemType={itemType}
          moduleId={module.id}
        />

        {/* Hover/tap glossary — scans the rendered module content (same
            contentRef surface as HighlightPopover above) for defined terms
            and pops a short definition + a link to the module that teaches
            it in full. See GlossaryHighlighter.jsx for the full mechanism
            writeup. Mounted once here so it covers all 4 families/79
            modules automatically — no per-module wiring needed. */}
        <GlossaryHighlighter containerRef={contentRef} moduleId={module.id} />

        {/* Go Deeper — Academic (skeleton). Renders nothing until a module
            provides `deeperMath` (an array of strings / illustration blocks
            / scene markers) — no content has been authored for any of the
            79 modules yet, this is the mechanism only, mirroring GSL's
            FoundationsRunner.jsx pattern adapted to PAL's inline-style
            convention. Placed after the main module content (and the
            highlight/glossary tools that scope to it) and before
            "Further reading", matching GSL's "between Explanation and Key
            Points" placement as closely as this shell's structure allows. */}
        {module.deeperMath && module.deeperMath.length > 0 && (
          <section style={{ marginTop: '1.5rem' }}>
            <button
              type='button'
              onClick={function () { setDeeperOpen(function (v) { return !v; }); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: deeperOpen ? 'var(--surface-2)' : 'var(--surface)',
                border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)',
                padding: '0.4rem 0.9rem', fontSize: '0.78rem', fontWeight: 700,
                color: 'var(--yellow)', cursor: 'pointer',
              }}
            >
              <span>{deeperOpen ? '▾' : '▸'}</span>
              <span>Go Deeper — Academic</span>
            </button>
            {deeperOpen && (
              <div style={{
                marginTop: '0.6rem', padding: '1rem 1.1rem',
                background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
                borderRadius: 'var(--radius)',
              }}>
                {module.deeperMath.map(function (item, i) {
                  var topGap = i === 0 ? 0 : '0.75rem';
                  if (typeof item === 'string') {
                    return (
                      <p key={i} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: topGap + ' 0 0' }}>
                        {renderRecapLine(item)}
                      </p>
                    );
                  }
                  if (item && item.type === 'illustration') {
                    return (
                      <div key={i} style={{ marginTop: topGap }}>
                        {item.label && (
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                            {item.label}
                          </div>
                        )}
                        <pre style={{
                          margin: 0, padding: '0.75rem 0.9rem', background: 'var(--surface)',
                          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem', color: 'var(--text)', overflowX: 'auto',
                        }}>
                          {item.code}
                        </pre>
                      </div>
                    );
                  }
                  // PAL has no scene registry yet — skip silently, this tier is a skeleton.
                  if (item && item.type === 'scene') return null;
                  return null;
                })}
              </div>
            )}
          </section>
        )}

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
