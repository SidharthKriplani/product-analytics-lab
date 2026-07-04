// Product Analytics Lab — Spaced-Repetition Review Queue (rich SRS surface).
//
// Level-up of the thin review page to match GSL's Review.jsx / MSL's ReviewTab.jsx:
// a real due-today section with counts, spaced-repetition interval buckets
// (due now / soon / later), per-item review cards carrying the item's room +
// title, a review action that ADVANCES the item's SRS interval, a readiness/
// summary header, and a proper empty state.
//
// Data model: this reuses PAL's OWN Leitner-box SR store (utils/srQueue.js) with
// no changes to the store shape. PAL's model is actually richer than GSL/MSL's
// SM-2-lite: items live in boxes 1-4 with intervals 1 / 3 / 7 / 21 days and are
// retired at box 5. "Mark reviewed" here calls recordSrOutcome({correct:true}),
// which promotes the item one box (pushing its next review further out) exactly
// as a correct grade would from inside a room — so the button truly advances the
// SRS interval rather than faking it.
//
// Gap vs GSL/MSL: PAL's SR items enter the queue only when a learner gets one
// WRONG (the remediation model). There is no "everything you mastered comes back"
// firstSeen clock — so the queue is a weak-spots queue, not a full mastery
// rotation. The layout mirrors the references as closely as that model allows.

import { useState, useCallback, useEffect } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { getDueReviews, getAllReviews, getSrStats, recordSrOutcome } from '../utils/srQueue.js';

// Box → interval label, mirrors BOX_INTERVAL_DAYS in srQueue.js.
const BOX_INTERVAL_DAYS = { 1: 1, 2: 3, 3: 7, 4: 21 };
const DAY_MS = 24 * 60 * 60 * 1000;

// Maps an SR item's room id → the navigate target page + a friendly label + color.
// The deep-link is room-level by default; App.jsx resolves the case id when it can.
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

// ── Formatting ───────────────────────────────────────────────────────────────
function dueLabel(iso) {
  if (!iso) return '';
  const diffMs = new Date(iso).getTime() - Date.now();
  if (diffMs <= 0) return 'due now';
  const days = Math.ceil(diffMs / DAY_MS);
  if (days === 1) return 'due tomorrow';
  if (days < 7) return 'due in ' + days + ' days';
  return 'due ' + new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function agoLabel(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / DAY_MS);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return days + ' days ago';
  if (days < 14) return 'a week ago';
  if (days < 30) return Math.floor(days / 7) + ' weeks ago';
  if (days < 60) return 'a month ago';
  return Math.floor(days / 30) + ' months ago';
}

// Box → a short "strength" descriptor + the interval it currently sits on.
function boxDescriptor(box) {
  const b = box || 1;
  const days = BOX_INTERVAL_DAYS[b] || 1;
  const strength = b <= 1 ? 'New / missed' : b === 2 ? 'Getting it' : b === 3 ? 'Familiar' : 'Nearly mastered';
  return { strength, days, box: b };
}

// ── Due review card (has the interval-advancing action) ──────────────────────
function ReviewCard({ item, onOpen, onReviewed }) {
  const meta = metaFor(item.room);
  const desc = boxDescriptor(item.box);
  return (
    <div
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderLeft: '3px solid ' + meta.color, borderRadius: 'var(--radius)',
        padding: '0.875rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}
    >
      <button
        onClick={() => onOpen(meta.page, item.caseId)}
        className="pal-card-hover"
        style={{
          flex: 1, minWidth: 0, textAlign: 'left', background: 'none',
          border: 'none', padding: 0, cursor: 'pointer',
        }}
      >
        <div style={{
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: meta.color, marginBottom: '0.25rem',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
          {meta.label}
          <span style={{
            marginLeft: 'auto', fontWeight: 600, color: 'var(--text-muted)',
            letterSpacing: '0.03em', textTransform: 'none',
          }}>
            {desc.strength} · {desc.days}d interval
          </span>
        </div>
        <div style={{
          fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.45,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {item.title || item.caseId}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
          missed {agoLabel(item.addedAt ? new Date(item.addedAt).toISOString() : null) || 'recently'}
        </div>
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
        <button
          onClick={() => onOpen(meta.page, item.caseId)}
          style={{
            background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: '6px',
            padding: '0.35rem 0.85rem', fontSize: '0.78rem', fontWeight: 700,
            cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex',
            alignItems: 'center', gap: '0.3rem',
          }}
        >
          Review <Icon name="arrow-right" size={13} color="#fff" />
        </button>
        <button
          onClick={() => onReviewed(item)}
          title="Recalled it from memory — advance its schedule"
          style={{
            background: 'none', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', borderRadius: '6px',
            padding: '0.35rem 0.85rem', fontSize: '0.74rem', fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex',
            alignItems: 'center', gap: '0.3rem', justifyContent: 'center',
          }}
        >
          <Icon name="check-circle" size={13} color="currentColor" /> Got it
        </button>
      </div>
    </div>
  );
}

// ── Scheduled-later row (compact) ────────────────────────────────────────────
function ScheduledRow({ item }) {
  const meta = metaFor(item.room);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.55rem 0.9rem', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
      <span style={{
        flex: 1, minWidth: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {item.title || item.caseId}
      </span>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', flexShrink: 0 }}>{meta.label}</span>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {dueLabel(item.nextReview)}
      </span>
    </div>
  );
}

// ── Interval-bucket summary chips ────────────────────────────────────────────
function BucketBar({ buckets }) {
  const cells = [
    { key: 'now',  label: 'Due now', n: buckets.now,  color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
    { key: 'soon', label: 'Soon (≤3d)', n: buckets.soon, color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
    { key: 'later', label: 'Later', n: buckets.later, color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.6rem', marginTop: '1rem' }}>
      {cells.map(c => (
        <div key={c.key} style={{
          background: c.n > 0 ? c.bg : 'var(--surface-2)',
          border: '1px solid ' + (c.n > 0 ? c.border : 'var(--border)'),
          borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.8rem',
        }}>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: c.n > 0 ? c.color : 'var(--text-muted)', lineHeight: 1 }}>
            {c.n}
          </div>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewQueue({ onNavigate }) {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  // Re-render if the SR store changes in another tab/room.
  useEffect(() => {
    const onStorage = (e) => { if (!e || e.key === 'pal-sr-queue-v1') refresh(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  // Recomputed each render; `tick` forces it after a "Got it" write.
  void tick;
  const due = getDueReviews();
  const all = getAllReviews();
  const stats = getSrStats();
  const later = all.filter(i => !due.some(d => d.room === i.room && d.caseId === i.caseId));

  // Interval buckets over the whole queue: due now / soon (≤3d) / later.
  const now = Date.now();
  const buckets = { now: 0, soon: 0, later: 0 };
  for (const i of all) {
    const t = i.nextReview ? new Date(i.nextReview).getTime() : now;
    if (t <= now) buckets.now++;
    else if (t - now <= 3 * DAY_MS) buckets.soon++;
    else buckets.later++;
  }

  const hasQueue = all.length > 0;

  function handleOpen(page, caseId) {
    if (onNavigate) onNavigate(page, caseId);
  }

  // "Got it" advances the item's SRS interval — promotes one Leitner box (or
  // retires it at box 5). Reuses PAL's own recordSrOutcome, no new store logic.
  function handleReviewed(item) {
    recordSrOutcome({ room: item.room, caseId: item.caseId, title: item.title, correct: true });
    refresh();
  }

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
          The items you got wrong come back on a schedule. Clear what is due, and each item pushes further out every time you nail it — 1 day, then 3, then a week, then longer — until it sticks.
        </p>
        {hasQueue && (
          <>
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
            <BucketBar buckets={buckets} />
          </>
        )}
      </div>

      {/* Due-today section */}
      {due.length > 0 ? (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.09em', color: 'var(--text-muted)', marginBottom: '0.6rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            <Icon name="layers" size={13} color="var(--teal)" /> Due today ({due.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {due.map(item => (
              <ReviewCard
                key={item.room + ':' + item.caseId}
                item={item}
                onOpen={handleOpen}
                onReviewed={handleReviewed}
              />
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '2.5rem 1.5rem', textAlign: 'center',
          marginBottom: '1.75rem',
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
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 auto', lineHeight: 1.6, maxWidth: '400px' }}>
                Practice a few cases. Anything you miss will show up here on a spaced schedule, so the weak spots come back until they stick.
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
                Nothing due — you're caught up.
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                {stats.nextDue ? 'Next review ' + dueLabel(stats.nextDue) + '.' : 'Everything is reviewed.'}
              </p>
            </>
          )}
        </div>
      )}

      {/* Scheduled later */}
      {later.length > 0 && (
        <div>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.09em', color: 'var(--text-muted)', marginBottom: '0.6rem',
          }}>
            Scheduled later
          </div>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', overflow: 'hidden',
          }}>
            {later.slice(0, 12).map(item => (
              <ScheduledRow key={item.room + ':' + item.caseId} item={item} />
            ))}
          </div>
          {later.length > 12 && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.5rem', textAlign: 'center' }}>
              + {later.length - 12} more scheduled
            </div>
          )}
        </div>
      )}
    </div>
  );
}
