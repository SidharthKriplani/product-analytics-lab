// ─── Shared Foundation Browser ────────────────────────────────────────────────
// Single grid-card browser for all 4 foundation rooms (Monochrome Instrument).
// Each room page is a thin wrapper that passes config. Uses the shared
// RoomHeader + FilterBar + CaseCard so all four foundation rooms match every
// other room browser. One accent per room (derived from the `color` prop).

import { useState } from 'react';
import { RoomHeader } from './RoomHeader.jsx';
import { FilterBar } from './FilterBar.jsx';
import { CaseCard } from './CaseCard.jsx';

// Difficulty ordering for the dropdown.
var DIFF_ORDER = { Beginner: 0, Intermediate: 1, Advanced: 2 };

// Strip a full CSS var() wrapper down to the bare accent name CaseCard/RoomHeader
// expect, e.g. 'var(--green)' -> 'green'. Falls back to 'accent'.
function accentName(color) {
  if (typeof color !== 'string') return 'accent';
  var m = color.match(/var\(--([a-z0-9-]+)\)/i);
  return m ? m[1] : 'accent';
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

  var accent = accentName(color);
  var completedCount = Object.keys(progress || {}).length;
  var totalCount = modules.length;

  // Difficulty counts (Beginner / Intermediate / Advanced)
  var counts = {};
  modules.forEach(function (m) { counts[m.difficulty] = (counts[m.difficulty] || 0) + 1; });

  var filtered = (diffFilter === 'all'
    ? modules
    : modules.filter(function (m) { return m.difficulty === diffFilter; })
  ).slice().sort(function (a, b) {
    return (DIFF_ORDER[a.difficulty] != null ? DIFF_ORDER[a.difficulty] : 9)
         - (DIFF_ORDER[b.difficulty] != null ? DIFF_ORDER[b.difficulty] : 9);
  });

  // Next incomplete module — for the "Next" badge.
  var nextModule = modules.find(function (m) { return !progress[m.id]; });
  var nextId = nextModule ? nextModule.id : null;

  // Filter dropdown config — only show difficulty tiers that exist.
  var diffOptions = [{ value: 'all', label: 'All levels' }];
  ['Beginner', 'Intermediate', 'Advanced'].forEach(function (tier) {
    if ((counts[tier] || 0) > 0) diffOptions.push({ value: tier, label: tier, count: counts[tier] });
  });

  var filters = [
    { id: 'difficulty', label: 'Difficulty', value: diffFilter, onChange: setDiffFilter, options: diffOptions },
  ];

  return (
    <div className='pal-page-enter' style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      <RoomHeader
        icon={iconName}
        accent={accent}
        eyebrow={roomLabel}
        title={roomLabel}
        blurb={description}
        solved={completedCount}
        total={totalCount}
      />

      {/* Completion banner */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className='pal-reveal-in' style={{
          padding: '0.9rem 1.1rem', borderRadius: 'var(--radius)',
          background: 'var(--surface)', border: '1px solid var(--green-border)',
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
          background: 'var(--surface)', border: '1px solid ' + color,
          borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left',
        }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: color }}>
            {completedCount === 0
              ? 'Start here → ' + nextModule.index + '. ' + nextModule.title
              : 'Continue: ' + nextModule.index + '. ' + nextModule.title}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>→</span>
        </button>
      )}

      {/* Filters */}
      <FilterBar filters={filters} />

      {/* Module cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map(function (mod) {
          var done = !!progress[mod.id];
          var locked = !mod.isFree && !unlocked;
          var isNext = mod.id === nextId;

          var tags = [mod.difficulty];
          if (mod.estimatedMin) tags.push(mod.estimatedMin + ' min');

          var nextBadge = isNext ? (
            <span style={{
              fontSize: '0.66rem', fontWeight: 700,
              color: color, background: 'var(--' + accent + '-bg)',
              border: '1px solid var(--' + accent + '-border)',
              borderRadius: 4, padding: '0.08rem 0.4rem',
            }}>
              Next
            </span>
          ) : null;

          return (
            <CaseCard
              key={mod.id}
              id={String(mod.index)}
              title={mod.title}
              subtitle={mod.subtitle}
              tags={tags}
              accent={accent}
              status={done ? 'solved' : undefined}
              locked={locked}
              badge={nextBadge}
              onClick={function () { if (!locked) onStart(mod.id); }}
            />
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
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '2rem' }}>
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
