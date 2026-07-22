import { useState, useEffect } from 'react';
import { Icon } from './Icon.jsx';

// NotesBox — shared "Your notes (saved locally)" textarea used across all room runners.
// Visual/markup canonical: MetricsRunner.jsx's debrief-view notes box.
//
// Props:
//   storageKey (string, required) — the fully-resolved key used to address this note inside
//                                    the shared 'pal-notes-v1' localStorage blob. Callers must
//                                    compute this exactly as the original per-file loadNote/saveNote
//                                    helpers did (typically `${ROOM_KEY}:${itemId}`). NotesBox does
//                                    NOT namespace or transform this key — it's used as-is.
//   label      (string, optional) — heading text before the "(saved locally)" suffix. Default 'Your notes'.
//   onChange   (function, optional) — called with the current (live, possibly-unsaved) note text
//                                    whenever it changes, including once after load/storageKey change.
//                                    Lets callers mirror the note text for other UI (e.g. a debrief
//                                    copy button or a read-only preview) without NotesBox exposing state.
//   right      (node, optional) — extra content rendered at the right edge of the header row
//                                    (e.g. MetricsRunner's DebriefCopyButton), matching the canonical
//                                    space-between header layout.

const NOTES_KEY = 'pal-notes-v1';

function loadNote(key) {
  try {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    return notes[key] || '';
  } catch { return ''; }
}

function saveNote(key, text) {
  try {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    notes[key] = text;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {}
}

export function NotesBox({ storageKey, label = 'Your notes', onChange, right = null }) {
  const [userNote, setUserNote] = useState(() => loadNote(storageKey));
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    const next = loadNote(storageKey);
    setUserNote(next);
    setNoteSaved(false);
    if (onChange) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return (
    <div className="pal-textarea-wrap" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Icon name="pen-line" size={12} color="currentColor" />{label} <span style={{ fontWeight: 400, opacity: 0.6 }}>(saved locally)</span>
        </div>
        {right}
      </div>
      <textarea
        value={userNote}
        onChange={e => {
          const next = e.target.value;
          setUserNote(next);
          setNoteSaved(false);
          if (onChange) onChange(next);
        }}
        placeholder="Jot your thinking — what stood out, what you missed, what to remember..."
        style={{
          width: '100%', minHeight: 72, padding: '10px 12px', background: 'var(--bg)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)',
          fontSize: '0.88rem', lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
      <button
        onClick={() => { saveNote(storageKey, userNote); setNoteSaved(true); }}
        style={{
          marginTop: 8, padding: '5px 14px', background: noteSaved ? 'var(--green-bg)' : 'var(--surface)',
          border: '1px solid ' + (noteSaved ? 'var(--green-border)' : 'var(--border)'),
          borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem',
          color: noteSaved ? 'var(--green)' : 'var(--text-muted)',
        }}
      >{noteSaved ? <><Icon name="check" size={12} color="var(--green)" /> Saved</> : 'Save note'}</button>
    </div>
  );
}
