// ─── Shared Foundation Browser ────────────────────────────────────────────────
// Single grid-card browser for all 4 foundation rooms.
// Each room page is a thin wrapper that passes config.

import { useState } from 'react';
import { Icon } from './Icon.jsx';

// Foundation difficulty chips (Beginner / Intermediate / Advanced)
var DIFF_CFG = {
  all:          { label: 'All',          color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border)' },
  Beginner:     { label: 'Beginner',     color: 'var(--accent)',     bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  Intermediate: { label: 'Intermediate', color: 'var(--teal)',       bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  Advanced:     { label: 'Advanced',     color: 'var(--yellow)',     bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
};

function DiffChips({ value, onChange, counts }) {
  var tiers = ['all', 'Beginner', 'Intermediate', 'Advanced'].filter(function (t) {
    return t === 'all' || (counts[t] || 0) > 0;
  });
  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
      {tiers.map(function (tier) {
        var cfg = DIFF_CFG[tier];
        var active = value === tier;
        var count = tier === 'all' ? counts.all : counts[tier];
        return (
          <button key={tier} onClick={function () { onChange(tier); }} style={{
            fontSize: '0.75rem', fontWeight: active ? 700 : 500,
            padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid ' + (active ? cfg.border : 'var(--border)'),
            background: active ? cfg.bg : 'transparent',
            color: active ? cfg.color : 'var(--text-muted)',
            cursor: 'pointer', transition: 'all 0.12s',
          }}>
            {cfg.label}{count !== undefined ? ' (' + count + ')' : ''}
          </button>
        );
      })}
    </div>
  );
}

export function FoundationBrowser({
  modules,        // array of module objects
  progress,       // object — keys are completed module ids
  color,          // CSS var string, e.g. 'var(--green)'
  roomLabel,      // e.g. 'Metrics Foundations'
  iconName,       // Icon name — null to skip
  onStart,        // (moduleId) => void
  unlocked,       // boolean
  practiceLinks,  // array of { label, onClick } for bottom CTA
  description,    // one-sentence room purpose shown below header
}) {
  var [diffFilter, setDiffFilter] = useState('all');
  var [hovered, setHovered] = useState(null);

  var completedCount = Object.keys(progress || {}).length;
  var totalCount = modules.length;
  var pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Difficulty counts
  var counts = { all: totalCount };
  modules.forEach(function (m) { counts[m.difficulty] = (counts[m.difficulty] || 0) + 1; });

  var filtered = diffFilter === 'all' ? modules : modules.filter(function (m) { return m.difficulty === diffFilter; });

  // Find next incomplete for continue CTA
  var nextModule = modules.find(function (m) { return !progress[m.id]; });

  return (
    <div className='pal-page-enter' style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          {iconName && <Icon name={iconName} size={20} color={color} />}
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
            {roomLabel}
          </h1>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {completedCount}/{totalCount} complete
          </span>
        </div>

        {/* Room description — shown always, tells user what this room is for */}
        {description && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 0.75rem 0' }}>
            {description}
          </p>
        )}

        {/* Progress bar */}
        <div style={{ height: '4px', borderRadius: '2px', background: 'var(--border)', marginBottom: '1rem' }}>
          <div style={{ height: '100%', borderRadius: '2px', background: color, width: pct + '%', transition: 'width 0.3s' }} />
        </div>

        {/* Filters */}
        <DiffChips value={diffFilter} onChange={setDiffFilter} counts={counts} />
      </div>

      {/* Completion banner */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className='pal-reveal-in' style={{
          padding: '0.9rem 1.1rem', borderRadius: 'var(--radius)',
          background: 'var(--green-bg)', border: '1px solid var(--green-border)',
          marginBottom: '1.25rem', textAlign: 'center',
        }}>
          <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.9rem' }}>
            All {totalCount} modules complete — nice work!
          </span>
        </div>
      )}

      {/* Start / Continue CTA */}
      {nextModule && diffFilter === 'all' && completedCount < totalCount && (
        <button onClick={function () { onStart(nextModule.id); }} style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          width: '100%', padding: '0.75rem 1rem', marginBottom: '1.25rem',
          background: color, border: 'none', borderRadius: 'var(--radius)',
          cursor: 'pointer', textAlign: 'left',
        }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
            {completedCount === 0
              ? 'Start here → ' + nextModule.index + '. ' + nextModule.title
              : 'Continue: ' + nextModule.index + '. ' + nextModule.title}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>→</span>
        </button>
      )}

      {/* Module grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
        gap: '0.75rem',
        marginBottom: '2rem',
      }}>
        {filtered.map(function (mod, i) {
          var done = !!progress[mod.id];
          var locked = !mod.isFree && !unlocked;
          var isHovered = hovered === mod.id;
          return (
            <button
              key={mod.id}
              className='pal-card-enter'
              onClick={function () { if (!locked) onStart(mod.id); }}
              onMouseEnter={function () { setHovered(mod.id); }}
              onMouseLeave={function () { setHovered(null); }}
              style={{
                animationDelay: (i * 30) + 'ms',
                display: 'flex', flexDirection: 'column', gap: '0.35rem',
                padding: '0.9rem 1rem', borderRadius: 'var(--radius)',
                border: '1px solid ' + (done ? 'var(--green-border)' : isHovered ? color : 'var(--border)'),
                background: done ? 'var(--green-bg)' : 'var(--surface)',
                cursor: locked ? 'default' : 'pointer',
                textAlign: 'left', width: '100%',
                opacity: locked ? 0.55 : 1,
                transform: isHovered && !locked ? 'translateY(-2px)' : 'none',
                boxShadow: isHovered && !locked ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {/* Top row: index + title + done badge */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: done ? 'var(--green)' : color, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                  {mod.index}.
                </span>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {locked ? <Icon name='lock' size={13} color='currentColor' /> : null}{locked ? ' ' : ''}{mod.title}
                </span>
                {done && <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}><Icon name='check' size={11} color='var(--green)' /></span>}
              </div>

              {/* Subtitle */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {mod.subtitle}
              </div>

              {/* Bottom row: difficulty + time */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.15rem' }}>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 600,
                  padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)',
                  background: (DIFF_CFG[mod.difficulty] || DIFF_CFG.Beginner).bg,
                  color: (DIFF_CFG[mod.difficulty] || DIFF_CFG.Beginner).color,
                  border: '1px solid ' + (DIFF_CFG[mod.difficulty] || DIFF_CFG.Beginner).border,
                }}>
                  {mod.difficulty}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{mod.estimatedMin} min</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          No modules match this filter.
          <br />
          <button onClick={function () { setDiffFilter('all'); }} style={{
            marginTop: '0.5rem', background: 'none', border: 'none', color: color,
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
          }}>
            Clear filter
          </button>
        </div>
      )}

      {/* Practice links */}
      {practiceLinks && practiceLinks.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
            Ready to practice?
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {practiceLinks.map(function (link) {
              return (
                <button key={link.label} onClick={link.onClick} style={{
                  padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  color: color, fontSize: '0.82rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.12s',
                }}>
                  {link.label} →
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
