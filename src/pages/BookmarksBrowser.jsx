import { useState } from 'react';
import { getBookmarks, removeBookmark, clearBookmarks } from '../utils/bookmarks.js';
import { Icon } from '../components/shared/Icon.jsx';

// Room order and display labels
const ROOM_ORDER = [
  'stats-foundations',
  'stats',
  'growth-analytics',
  'metrics',
  'rca',
  'cases',
  'design',
  'product-design',
  'prioritization',
  'behavioral',
  'estimation',
  'code',
];

const ROOM_LABEL = {
  'stats-foundations': 'Stats Foundations',
  'stats':             'Stats Review',
  'growth-analytics':  'Growth Analytics',
  'metrics':           'Metrics',
  'rca':               'Root Cause Analysis',
  'cases':             'Business Cases',
  'design':            'Experiment Design',
  'product-design':    'Product Design',
  'prioritization':    'Prioritization',
  'behavioral':        'Behavioral',
  'estimation':        'Estimation',
  'code':              'Programming Lab',
};

const DIFF_CFG = {
  analyst:  { label: 'Analyst',  color: 'var(--blue-text)',  bg: 'var(--blue-bg)',    border: 'var(--blue-border)' },
  senior:   { label: 'Senior',   color: 'var(--yellow)',     bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
  staff:    { label: 'Staff',    color: 'var(--teal)',       bg: 'var(--teal-bg)',    border: 'var(--teal-border)' },
  easy:     { label: 'Easy',     color: 'var(--green)',      bg: 'var(--green-bg)',   border: 'var(--green-border)' },
  medium:   { label: 'Medium',   color: 'var(--yellow)',     bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
  hard:     { label: 'Hard',     color: 'var(--red)',        bg: 'var(--red-bg)',     border: 'var(--red-border)' },
};

function timeAgo(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const saved = new Date(isoString);
  const diffMs = now - saved;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWk  = Math.floor(diffDay / 7);
  const diffMo  = Math.floor(diffDay / 30);

  if (diffSec < 60)  return 'just now';
  if (diffMin < 60)  return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHr < 24)   return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDay < 7)   return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  if (diffWk < 5)    return `${diffWk} week${diffWk !== 1 ? 's' : ''} ago`;
  return `${diffMo} month${diffMo !== 1 ? 's' : ''} ago`;
}

export function BookmarksBrowser({ onNavigate, onBack }) {
  const [bookmarks, setBookmarks] = useState(() => getBookmarks());

  function handleRemove(room, id) {
    removeBookmark(room, id);
    setBookmarks(getBookmarks());
  }

  function handleClearAll() {
    if (window.confirm('Clear all bookmarks? This cannot be undone.')) {
      clearBookmarks();
      setBookmarks([]);
    }
  }

  // Group bookmarks by room in canonical order
  const grouped = {};
  for (const b of bookmarks) {
    if (!grouped[b.room]) grouped[b.room] = [];
    grouped[b.room].push(b);
  }

  const orderedRooms = ROOM_ORDER.filter(r => grouped[r]);
  // Append any rooms not in ROOM_ORDER
  for (const r of Object.keys(grouped)) {
    if (!orderedRooms.includes(r)) orderedRooms.push(r);
  }

  return (
    <div className="pal-page-enter" style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Back nav */}
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.5rem',
          padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}
      >
        ← Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{
            width: '36px', height: '36px', borderRadius: '9px',
            background: 'var(--purple-bg)', border: '1px solid var(--purple-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
          }}>
            <Icon name="bookmark" size={18} color="var(--purple)" />
          </span>
          <div>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--purple)', marginBottom: '0.15rem',
            }}>
              Saved for Later
            </div>
            <h1 style={{
              fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)',
              margin: 0, letterSpacing: '-0.02em',
            }}>
              Bookmarks
            </h1>
          </div>
        </div>
        <p style={{
          color: 'var(--text-muted)', fontSize: '0.95rem',
          margin: 0, maxWidth: '560px', lineHeight: 1.6,
        }}>
          The hardest cases reveal the most — and are the easiest to skip and forget. Bookmarks is where you save the ones that exposed a gap, so you can return with better preparation instead of moving on and hoping the topic does not come up. The pattern across your saved cases is a more honest map of your weak spots than any single session.
        </p>
      </div>

      {/* Empty state */}
      {bookmarks.length === 0 && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center',
        }}>
          <div style={{ marginBottom: '0.75rem' }}><Icon name='bookmark' size={32} color='currentColor' /></div>
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem' }}>
            No bookmarks yet
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto' }}>
            Use the <Icon name='bookmark' size={14} color='currentColor' /> button in any case runner to save for later.
          </div>
        </div>
      )}

      {/* Grouped bookmark list */}
      {orderedRooms.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orderedRooms.map(room => (
            <div key={room}>
              {/* Room heading */}
              <div style={{
                fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--purple)',
                marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{
                  display: 'inline-block', width: '8px', height: '8px',
                  borderRadius: '50%', background: 'var(--purple)',
                }} />
                {ROOM_LABEL[room] || room}
                <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>
                  ({grouped[room].length})
                </span>
              </div>

              {/* Items in this room */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {grouped[room].map((b, bIndex) => {
                  const diffCfg = DIFF_CFG[b.difficulty];
                  return (
                    <div
                      key={`${b.room}:${b.id}`}
                      className="pal-card-enter pal-card-hover"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '0.9rem 1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        animationDelay: (Math.min(bIndex * 28, 400)) + 'ms',
                      }}
                    >
                      {/* Main info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 600,
                            color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase',
                          }}>
                            {b.id}
                          </span>
                          {diffCfg && (
                            <span style={{
                              fontSize: '0.68rem', fontWeight: 600,
                              color: diffCfg.color, background: diffCfg.bg,
                              border: `1px solid ${diffCfg.border}`,
                              borderRadius: '4px', padding: '0.08rem 0.38rem',
                            }}>
                              {diffCfg.label}
                            </span>
                          )}
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                            {timeAgo(b.savedAt)}
                          </span>
                        </div>

                        <div style={{
                          fontWeight: 600, fontSize: '0.93rem',
                          color: 'var(--text)', marginBottom: '0.3rem',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {b.title}
                        </div>

                        {b.tags && b.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {b.tags.slice(0, 4).map(tag => (
                              <span key={tag} style={{
                                fontSize: '0.68rem', color: 'var(--text-dim)',
                                background: 'var(--surface-2)', borderRadius: '4px',
                                padding: '0.08rem 0.38rem', border: '1px solid var(--border-subtle)',
                              }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <button
                          onClick={() => onNavigate(b.room, b.id)}
                          style={{
                            background: 'var(--purple-bg)', border: '1px solid var(--purple-border)',
                            borderRadius: '7px', padding: '0.4rem 0.85rem',
                            color: 'var(--purple)', fontSize: '0.82rem', fontWeight: 600,
                            cursor: 'pointer', whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        >
                          Go →
                        </button>
                        <button
                          onClick={() => handleRemove(b.room, b.id)}
                          title="Remove bookmark"
                          style={{
                            background: 'none', border: '1px solid var(--border)',
                            borderRadius: '7px', padding: '0.4rem 0.6rem',
                            color: 'var(--text-dim)', fontSize: '0.85rem',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
                        >
                          <Icon name='trash' size={14} color='currentColor' />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear all */}
      {bookmarks.length > 0 && (
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleClearAll}
            style={{
              background: 'none', border: '1px solid var(--border)',
              borderRadius: '7px', padding: '0.45rem 1rem',
              color: 'var(--text-muted)', fontSize: '0.82rem',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            Clear all bookmarks
          </button>
        </div>
      )}
    </div>
  );
}
