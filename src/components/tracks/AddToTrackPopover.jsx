import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  getTracks, createTrack,
  addSqlProblem, getTracksForProblem,
  addItem, getTracksForItem,
} from '../../utils/tracks.js';

/**
 * Popover for adding content to a track.
 *
 * SQL mode (existing):   pass problemId, title, difficulty
 * Generic mode (new):    pass itemType, itemId, label, itemMeta
 *
 * fixedPos: { top, right } — uses position:fixed (portal mode)
 * Without fixedPos: position:absolute relative to nearest positioned ancestor.
 */
export function AddToTrackPopover({
  // sql props
  problemId, title, difficulty,
  // generic props
  itemType, itemId, label, itemMeta,
  // shared
  onClose, anchorRef, fixedPos,
}) {
  var isGeneric = !!itemType;

  var [tracks, setTracks] = useState(function() { return getTracks(); });
  var [inTracks, setInTracks] = useState(function() {
    return isGeneric ? getTracksForItem(itemType, itemId) : getTracksForProblem(problemId);
  });
  var [newName, setNewName] = useState('');
  var [creating, setCreating] = useState(false);
  var popoverRef = useRef(null);
  var inputRef = useRef(null);

  var posStyle = fixedPos
    ? { position: 'fixed', top: fixedPos.top, right: fixedPos.right, marginTop: 0 }
    : { position: 'absolute', top: '100%', right: 0, marginTop: '6px' };

  useEffect(function() {
    function handle(e) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        (!anchorRef?.current || !anchorRef.current.contains(e.target))
      ) { onClose(); }
    }
    document.addEventListener('mousedown', handle);
    return function() { document.removeEventListener('mousedown', handle); };
  }, [onClose, anchorRef]);

  useEffect(function() {
    if (creating && inputRef.current) inputRef.current.focus();
  }, [creating]);

  function refresh() {
    setTracks(getTracks());
    setInTracks(isGeneric ? getTracksForItem(itemType, itemId) : getTracksForProblem(problemId));
  }

  function handleToggle(trackId) {
    var already = inTracks.includes(trackId);
    if (!already) {
      if (isGeneric) {
        addItem(trackId, itemType, itemId, label || '', itemMeta || {});
      } else {
        addSqlProblem(trackId, problemId, title, difficulty);
      }
    }
    refresh();
  }

  function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    var t = createTrack(newName.trim());
    if (isGeneric) {
      addItem(t.id, itemType, itemId, label || '', itemMeta || {});
    } else {
      addSqlProblem(t.id, problemId, title, difficulty);
    }
    setNewName('');
    setCreating(false);
    refresh();
  }

  return (
    <div
      ref={popoverRef}
      style={{
        ...posStyle,
        zIndex: 9999,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        minWidth: '220px',
        maxWidth: '270px',
        padding: '0.6rem 0',
        fontSize: '0.82rem',
      }}
      onClick={function(e) { e.stopPropagation(); }}
    >
      <div style={{ padding: '0.25rem 0.85rem 0.5rem', fontWeight: 700, fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Add to Track
      </div>

      {tracks.length === 0 && !creating && (
        <div style={{ padding: '0.3rem 0.85rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          No tracks yet.
        </div>
      )}

      {tracks.map(function(t) {
        var added = inTracks.includes(t.id);
        return (
          <button
            key={t.id}
            onClick={function() { handleToggle(t.id); }}
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
            onMouseEnter={function(e) { if (!added) e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={function(e) { e.currentTarget.style.background = 'none'; }}
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
            onClick={function() { setCreating(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              width: '100%', textAlign: 'left', background: 'none',
              border: 'none', cursor: 'pointer', padding: '0.45rem 0.85rem',
              color: 'var(--accent)', fontSize: '0.83rem', fontWeight: 600,
            }}
            onMouseEnter={function(e) { e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={function(e) { e.currentTarget.style.background = 'none'; }}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> New track
          </button>
        ) : (
          <form onSubmit={handleCreate} style={{ padding: '0.35rem 0.65rem', display: 'flex', gap: '0.4rem' }}>
            <input
              ref={inputRef}
              value={newName}
              onChange={function(e) { setNewName(e.target.value); }}
              placeholder="Track name…"
              style={{
                flex: 1, fontSize: '0.8rem', padding: '0.3rem 0.5rem',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '5px', color: 'var(--text)', outline: 'none',
              }}
              onKeyDown={function(e) { if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
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

/**
 * Self-contained + button that opens a portal-based AddToTrackPopover.
 * Escapes overflow:hidden containers via createPortal + getBoundingClientRect.
 */
export function AddTrackBtn({ itemType, itemId, label, itemMeta }) {
  var [open, setOpen] = useState(false);
  var btnRef = useRef(null);
  var [pos, setPos] = useState({ top: 0, right: 0 });

  function toggle(e) {
    e.stopPropagation();
    if (!open && btnRef.current) {
      var r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setOpen(function(o) { return !o; });
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        title="Add to track"
        style={{
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: '5px',
          cursor: 'pointer',
          padding: '2px 7px',
          fontSize: '13px',
          color: 'var(--accent)',
          flexShrink: 0,
          lineHeight: 1,
          fontWeight: 700,
        }}
      >+</button>
      {open && createPortal(
        <AddToTrackPopover
          itemType={itemType}
          itemId={itemId}
          label={label}
          itemMeta={itemMeta || {}}
          onClose={function() { setOpen(false); }}
          anchorRef={btnRef}
          fixedPos={pos}
        />,
        document.body
      )}
    </>
  );
}
