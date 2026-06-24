import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { getDueReviews, getSrStats, getAllReviews } from '../utils/srQueue.js';

// Maps an SR item's room id → the navigate target page + a friendly label.
// The deep-link is room-level by default; App.jsx resolves the case id when
// it can (the open functions take an id). Rooms without a clean runner fall
// back to their browser page.
const ROOM_META = {
  'stats':           { page: 'stats',          label: 'Stats Room',       color: 'var(--teal)' },
  'spot-the-flaw':   { page: 'spot-the-flaw',  label: 'Spot the Flaw',    color: 'var(--red)' },
  'trainer':         { page: 'trainer',        label: 'MCQ Quiz',         color: 'var(--green)' },
  'metrics':         { page: 'metrics',        label: 'Metrics',          color: 'var(--green)' },
  'rca':             { page: 'rca',            label: 'RCA',              color: 'var(--teal)' },
  'cases':           { page: 'cases',          label: 'Analytics Cases',  color: 'var(--yellow)' },
  'design':          { page: 'design',         label: 'A/B Design',       color: 'var(--accent)' },
  'browser':         { page: 'browser',        label: 'A/B Judgment',     color: 'var(--accent)' },
  'product-design':  { page: 'product-design', label: 'Product Design',   color: 'var(--purple)' },
  'prioritization':  { page: 'prioritization', label: 'Prioritization',   color: 'var(--purple)' },
  'estimation':      { page: 'estimation',     label: 'Estimation',       color: 'var(--yellow)' },
  'instrumentation': { page: 'instrumentation',label: 'Instrumentation',  color: 'var(--teal)' },
  'challenges':      { page: 'challenges',     label: 'Challenges',       color: 'var(--yellow)' },
  'bi':              { page: 'bi',             label: 'BI',               color: 'var(--yellow)' },
  'stat-foundations':    { page: 'stat-foundations',    label: 'Stat Foundations',    color: 'var(--teal)' },
  'metrics-foundations': { page: 'metrics-foundations', label: 'Metrics Foundations', color: 'var(--green)' },
  'rca-foundations':     { page: 'rca-foundations',     label: 'RCA Foundations',     color: 'var(--teal)' },
  'exp-foundations':     { page: 'exp-foundations',     label: 'A/B Foundations',     color: 'var(--accent)' },
};

function metaFor(room) {
  return ROOM_META[room] || { page: room, label: room, color: 'var(--text-muted)' };
}

function formatDueDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays < 7) return 'in ' + diffDays + ' days';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ReviewCard({ item, onClick }) {
  const meta = metaFor(item.room);
  return (
    <button
      onClick={() => onClick(meta.page, item.caseId)}
      className="pal-card-hover"
      style={{
        width: '100%', textAlign: 'left', background: 'var(--surface)',
        border: '1px solid var(--border)', borderLeft: '3px solid ' + meta.color,
        borderRadius: 'var(--radius)', padding: '0.875rem 1.1rem',
        cursor: 'pointer', transition: 'all 0.12s',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: meta.color, marginBottom: '0.25rem',
        }}>
          {meta.label}
        </div>
        <div style={{
          fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.45,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {item.title || item.caseId}
        </div>
      </div>
      <Icon name="chevron-right" size={16} color="var(--text-dim)" />
    </button>
  );
}

export function ReviewQueue({ onNavigate }) {
  // Snapshot once on mount; clicking through navigates away anyway.
  const [due] = useState(() => getDueReviews());
  const [stats] = useState(() => getSrStats());

  function handleOpen(page, caseId) {
    // App.jsx's navigate handler resolves (page, caseId) → the room's open fn.
    if (onNavigate) onNavigate(page, caseId);
  }

  const hasQueue = stats.total > 0;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{
            width: 36, height: 36, borderRadius: 9, background: 'var(--teal-bg)',
            border: '1px solid var(--teal-border)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name="rotate-ccw" size={18} color="var(--teal)" />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '0.15rem',
            }}>
              Spaced Repetition
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Review Queue
            </h1>
          </div>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.6, maxWidth: '540px' }}>
          The items you got wrong come back on a schedule. Clear what is due today, and they push further out each time you nail them — until they stick.
        </p>
        {hasQueue && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: due.length > 0 ? 'var(--teal)' : 'var(--text-muted)',
              background: due.length > 0 ? 'var(--teal-bg)' : 'var(--surface-2)',
              border: '1px solid ' + (due.length > 0 ? 'var(--teal-border)' : 'var(--border)'),
              borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.55rem',
            }}>
              {due.length} due now
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {stats.scheduled} scheduled · {stats.total} in queue
            </span>
          </div>
        )}
      </div>

      {/* Due list */}
      {due.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {due.map(item => (
            <ReviewCard key={item.room + ':' + item.caseId} item={item} onClick={handleOpen} />
          ))}
        </div>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '2.5rem 1.5rem', textAlign: 'center',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: 'var(--green-bg)',
            border: '1px solid var(--green-border)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '0.9rem',
          }}>
            <Icon name="check-circle" size={22} color="var(--green)" />
          </div>
          {!hasQueue ? (
            <>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
                Nothing due — you're caught up.
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
                Practice a few cases. Anything you miss will show up here on a spaced schedule, so the weak spots come back until they stick.
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
                Nothing due — you're caught up.
              </div>
              <p style={{
                fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6,
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}>
                <Icon name="clock" size={13} color="currentColor" />
                Next review {formatDueDate(stats.nextDue)}.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
