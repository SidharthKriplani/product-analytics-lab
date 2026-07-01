import { useState, useEffect, useRef } from 'react';
import { getTracks, createTrack, addSqlProblem, getTracksForProblem } from '../../utils/tracks.js';

/**
 * Small popover for adding a SQL problem to a track.
 *
 * Props:
 *   problemId   string
 *   title       string
 *   difficulty  string
 *   onClose     fn
 *   anchorRef   ref to the trigger element (for positioning)
 */
export function AddToTrackPopover({ problemId, title, difficulty, onClose, anchorRef }) {
  const [tracks, setTracks] = useState(() => getTracks());
  const [inTracks, setInTracks] = useState(() => getTracksForProblem(problemId));
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const popoverRef = useRef(null);
  const inputRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    function handle(e) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) { onClose(); }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose, anchorRef]);

  // Focus input when creating
  useEffect(() => {
    if (creating && inputRef.current) inputRef.current.focus();
  }, [creating]);

  function refresh() {
    setTracks(getTracks());
    setInTracks(getTracksForProblem(problemId));
  }

  function handleToggle(trackId) {
    const already = inTracks.includes(trackId);
    if (!already) {
      addSqlProblem(trackId, problemId, title, difficulty);
    }
    // We intentionally don't support remove-from-here — user can remove from My Tracks page
    refresh();
  }

  function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const t = createTrack(newName.trim());
    addSqlProblem(t.id, problemId, title, difficulty);
    setNewName('');
    setCreating(false);
    refresh();
  }

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        zIndex: 9999,
        top: '100%',
        right: 0,
        marginTop: '6px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        minWidth: '220px',
        maxWidth: '270px',
        padding: '0.6rem 0',
        fontSize: '0.82rem',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ padding: '0.25rem 0.85rem 0.5rem', fontWeight: 700, fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Add to Track
      </div>

      {tracks.length === 0 && !creating && (
        <div style={{ padding: '0.3rem 0.85rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          No tracks yet.
        </div>
      )}

      {tracks.map(t => {
        const added = inTracks.includes(t.id);
        return (
          <button
            key={t.id}
            onClick={() => handleToggle(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.55rem',
              width: '100%', textAlign: 'left', background: 'none',
              border: 'none', cursor: added ? 'default' : 'pointer',
              padding: '0.45rem 0.85rem',
              color: added ? 'var(--accent)' : 'var(--text)',
              fontWeight: added ? 600 : 400,
              fontSize: '0.83rem',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => { if (!added) e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            <span style={{
              width: 16, height: 16, borderRadius: 4,
              border: added ? '2px solid var(--accent)' : '2px solid var(--border)',
              background: added ? 'var(--accent)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontSize: '0.65rem', color: '#fff', transition: 'all 0.12s',
            }}>
              {added ? '✓' : ''}
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{t.name}</span>
          </button>
        );
      })}

      <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              width: '100%', textAlign: 'left', background: 'none',
              border: 'none', cursor: 'pointer', padding: '0.45rem 0.85rem',
              color: 'var(--accent)', fontSize: '0.83rem', fontWeight: 600,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> New track
          </button>
        ) : (
          <form onSubmit={handleCreate} style={{ padding: '0.35rem 0.65rem', display: 'flex', gap: '0.4rem' }}>
            <input
              ref={inputRef}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Track name…"
              style={{
                flex: 1, fontSize: '0.8rem', padding: '0.3rem 0.5rem',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '5px', color: 'var(--text)', outline: 'none',
              }}
              onKeyDown={e => { if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: '5px', padding: '0.3rem 0.6rem', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 600, opacity: newName.trim() ? 1 : 0.4,
              }}
            >
              Add
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
