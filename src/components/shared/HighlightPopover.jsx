// ─── Highlight-to-Track popover (v1) ──────────────────────────────────────
// Floating "select text → save as a highlight" toolbar, scoped to a content
// container via `containerRef`. Mounted ONCE by FoundationRunnerShell so it
// applies automatically to every Foundations module across all 4 families.
//
// v1 scope: captures the highlighted passage as a snapshot Tracks item
// (text + color + optional note + a link back to the source module). It
// does NOT repaint highlights back onto the page on revisit — anchoring an
// arbitrary text selection across re-renders is a much harder problem and
// is intentionally out of scope for this pass.
//
// Reuses PAL's existing track-save primitives exactly (no parallel save
// mechanism): getQuickAdd/quickAddItem for the quick-add path, and the
// existing AddToTrackPopover picker (same component used by every other
// AddTrackBtn in the app) for the non-quick-add path.

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { quickAddItem, getQuickAdd } from '../../utils/tracks.js';
import { AddToTrackPopover } from '../tracks/AddToTrackPopover.jsx';
import { addHighlight, occurrenceOfSelection, applyAll, removeHighlight, unpaint } from '../../utils/localHighlights.js';

const HIGHLIGHT_COLORS = [
  { key: 'yellow', css: 'var(--yellow)' },
  { key: 'green',  css: 'var(--green)' },
  { key: 'accent', css: 'var(--accent)' },
  { key: 'teal',   css: 'var(--teal)' },
];

function truncateLabel(text, max) {
  var t = text.trim().replace(/\s+/g, ' ');
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}

export function HighlightPopover({ containerRef, sourceLabel, itemType, moduleId }) {
  const paintKey = `fnd::${itemType || ''}::${moduleId || ''}`;
  const [removePop, setRemovePop] = useState(null); // { id, top, left }
  useEffect(() => {
    const el = containerRef?.current; if (!el) return;
    const t1 = setTimeout(() => applyAll(el, paintKey), 0);
    const t2 = setTimeout(() => applyAll(el, paintKey), 450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [containerRef, paintKey]);
  useEffect(() => {
    const el = containerRef?.current; if (!el) return;
    const onClick = (e) => {
      const m = e.target instanceof Element ? e.target.closest('mark[data-hl-id]') : null;
      if (!m || !el.contains(m)) { setRemovePop(null); return; }
      const r = m.getBoundingClientRect();
      setRemovePop({ id: m.getAttribute('data-hl-id'), top: r.bottom + 8, left: r.left + r.width / 2 });
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [containerRef, paintKey]);
  function paintGenId() { return `hl_${Date.now()}_${Math.random().toString(36).slice(2)}`; }
  var [sel, setSel] = useState(null);         // { text, rect }
  var [color, setColor] = useState(null);
  var [pickerOpen, setPickerOpen] = useState(false);
  var [pending, setPending] = useState(null);  // { id, label, meta } — set once Save is clicked in picker mode
  var [flash, setFlash] = useState(null);      // track name shown briefly after a quick-add
  var toolbarRef = useRef(null);
  var flashTimer = useRef(null);

  useEffect(function () {
    return function () { if (flashTimer.current) clearTimeout(flashTimer.current); };
  }, []);

  var readSelection = useCallback(function () {
    var container = containerRef.current;
    var s = window.getSelection();
    if (!s || s.isCollapsed || s.rangeCount === 0 || !s.toString().trim()) {
      setSel(null);
      return;
    }
    var range = s.getRangeAt(0);
    if (!container || !container.contains(range.commonAncestorContainer)) {
      // Selection lives outside the module content area (nav/sidebar/etc.) —
      // leave whatever toolbar state we had alone rather than reacting to it.
      return;
    }
    var rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return;
    setSel({ text: s.toString(), rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height } });
    setColor(null);
  }, [containerRef]);

  useEffect(function () {
    var selChangeTimer = null;
    function onMouseUp(e) {
      if (pickerOpen) return; // the picker manages its own interactions/close
      if (toolbarRef.current && toolbarRef.current.contains(e.target)) return;
      setTimeout(readSelection, 0);
    }
    function onMouseDown(e) {
      if (pickerOpen) return;
      if (toolbarRef.current && toolbarRef.current.contains(e.target)) return;
      var container = containerRef.current;
      var insideContent = container && container.contains(e.target);
      if (!insideContent) setSel(null);
    }
    function onTouchStart(e) {
      // Touch equivalent of onMouseDown: dismiss the toolbar when tapping
      // outside the content area (tapping the toolbar itself is exempt).
      if (pickerOpen) return;
      if (toolbarRef.current && toolbarRef.current.contains(e.target)) return;
      var container = containerRef.current;
      var insideContent = container && container.contains(e.target);
      if (!insideContent) setSel(null);
    }
    function onSelectionChange() {
      // Primary mobile path: iOS/Android text selection (long-press + drag
      // handles) does not reliably fire `mouseup`, so `mouseup` alone misses
      // touch-based selection entirely. `selectionchange` fires on every
      // input method, but fires many times while handles are being dragged —
      // debounce so we measure once the selection has settled.
      if (pickerOpen) return;
      if (selChangeTimer) clearTimeout(selChangeTimer);
      selChangeTimer = setTimeout(readSelection, 300);
    }
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('selectionchange', onSelectionChange);
    return function () {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('selectionchange', onSelectionChange);
      if (selChangeTimer) clearTimeout(selChangeTimer);
    };
  }, [readSelection, containerRef, pickerOpen]);

  // Reset entirely whenever the module changes.
  useEffect(function () {
    setSel(null); setColor(null); setPickerOpen(false); setPending(null); setFlash(null);
  }, [moduleId]);

  function showFlash(name) {
    setFlash(name);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(function () { setFlash(null); }, 1400);
  }

  function clearAll() {
    setSel(null); setColor(null); setPickerOpen(false); setPending(null);
    try { window.getSelection().removeAllRanges(); } catch (e) {}
  }

  function handleSave() {
    if (!sel) return; // color optional (MSL parity)
    var id = 'hl_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    var label = truncateLabel(sel.text, 80);
    var meta = {
      text: sel.text.trim(),
      color: color,
      note: '',
      sourceLabel: sourceLabel || '',
      itemType: itemType || '',
      moduleId: moduleId || '',
    };
    if (getQuickAdd()) {
      var t = quickAddItem('highlight', id, label, meta);
      if (t) { showFlash(t.name); clearAll(); return; }
      // no valid last track — fall through to the picker
    }
    setPending({ id: id, label: label, meta: meta });
    setPickerOpen(true);
  }

  const removePill = removePop ? createPortal(
    <button
      onClick={() => { const el = containerRef?.current; if (el && removePop.id) { removeHighlight(paintKey, removePop.id); unpaint(el, removePop.id); } setRemovePop(null); }}
      style={{ position: 'fixed', top: removePop.top, left: removePop.left, transform: 'translateX(-50%)', zIndex: 260,
        background: '#1f1f24', color: '#e8e8e8', border: '1px solid #3f3f46', borderRadius: '10px',
        padding: '0.55rem 1.1rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
        boxShadow: '0 10px 28px rgba(0,0,0,0.55)' }}
    >Remove highlight</button>, document.body) : null;

  if (!sel) return removePill;

  var rect = sel.rect;
  var toolbarW = 250; // approximate width (incl. 40px touch targets), used only for centering/clamping
  var left = Math.min(Math.max(rect.left + rect.width / 2, toolbarW / 2 + 8), window.innerWidth - toolbarW / 2 - 8);
  var top = Math.max(rect.top - 60, 8);

  if (pickerOpen && pending) {
    return createPortal(
      <AddToTrackPopover
        itemType='highlight'
        itemId={pending.id}
        label={pending.label}
        itemMeta={pending.meta}
        onClose={clearAll}
        fixedPos={{ top: top + 42, right: Math.max(window.innerWidth - left - toolbarW / 2, 8) }}
      />,
      document.body
    );
  }

  return createPortal(
    <>
      <div
        ref={toolbarRef}
        onMouseDown={function (e) { e.stopPropagation(); }} // interacting with the toolbar shouldn't drop the selection
        style={{
          position: 'fixed', top: top, left: left, transform: 'translateX(-50%)',
          zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '9px', boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
          padding: '0.4rem 0.5rem',
        }}
      >
        {HIGHLIGHT_COLORS.map(function (c) {
          var active = color === c.key;
          return (
            <button
              key={c.key}
              onClick={function () {
                setColor(c.key);
                const el = containerRef?.current;
                if (el && sel?.text && (el.textContent || '').includes(sel.text)) {
                  const n = occurrenceOfSelection(el, sel.text);
                  addHighlight(paintKey, { id: paintGenId(), text: sel.text, n, color: c.key });
                  applyAll(el, paintKey);
                }
              }}
              title={'Highlight in ' + c.key}
              style={{
                width: 40, height: 40, minWidth: 40, minHeight: 40, borderRadius: '50%',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{
                width: 20, height: 20, borderRadius: '50%', background: c.css,
                border: active ? '2px solid var(--text)' : '2px solid transparent',
                boxShadow: active ? '0 0 0 2px var(--surface)' : 'none', display: 'block',
              }} />
            </button>
          );
        })}
        <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)', margin: '0 0.15rem' }} />
        <button
          onClick={handleSave}
          title={color ? 'Save this highlight to a track' : 'Pick a color first'}
          style={{
            background: color ? 'var(--accent)' : 'var(--surface-2)',
            color: color ? '#fff' : 'var(--text-muted)',
            border: 'none', borderRadius: '6px', padding: '0.3rem 0.8rem',
            minHeight: 40, fontSize: '0.8rem', fontWeight: 700, cursor: color ? 'pointer' : 'not-allowed',
            opacity: color ? 1 : 0.6, whiteSpace: 'nowrap',
          }}
        >
          Save
        </button>
      </div>

      {flash && (
        <div style={{
          position: 'fixed', top: top, left: left, transform: 'translateX(-50%)', zIndex: 9999,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.18)', padding: '0.4rem 0.7rem',
          fontSize: '0.75rem', color: 'var(--text)', whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          ✓ Saved to <strong>{flash}</strong>
        </div>
      )}
    {removePill}
    </>,
    document.body
  );
}
