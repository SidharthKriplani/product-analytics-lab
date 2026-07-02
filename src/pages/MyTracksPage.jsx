import { useState, useCallback, useEffect } from 'react';
import {
  getTracks, createTrack, deleteTrack, renameTrack,
  removeItem, reorderItems, addNote,
} from '../utils/tracks.js';
import { Icon } from '../components/shared/Icon.jsx';

// ── Difficulty badge ────────────────────────────────────────────────────────
// Covers both SQL Lab difficulties and PAL room difficulties.
const DIFF_COLORS = {
  // SQL Lab
  Easy:         { bg: 'rgba(34,197,94,0.1)',  color: '#16a34a', border: 'rgba(34,197,94,0.25)' },
  Medium:       { bg: 'rgba(245,158,11,0.1)', color: '#d97706', border: 'rgba(245,158,11,0.25)' },
  Hard:         { bg: 'rgba(239,68,68,0.1)',  color: '#dc2626', border: 'rgba(239,68,68,0.25)' },
  Master:       { bg: 'rgba(139,92,246,0.1)', color: '#7c3aed', border: 'rgba(139,92,246,0.25)' },
  Forensic:     { bg: 'rgba(234,88,12,0.1)',  color: '#ea580c', border: 'rgba(234,88,12,0.25)' },
  // PAL room difficulties
  foundational: { bg: 'var(--accent-bg)',  color: 'var(--accent)',  border: 'var(--accent-border)' },
  analyst:      { bg: 'var(--accent-bg)',  color: 'var(--accent)',  border: 'var(--accent-border)' },
  Beginner:     { bg: 'var(--accent-bg)',  color: 'var(--accent)',  border: 'var(--accent-border)' },
  intermediate: { bg: 'var(--teal-bg)',    color: 'var(--teal)',    border: 'var(--teal-border)' },
  Intermediate: { bg: 'var(--teal-bg)',    color: 'var(--teal)',    border: 'var(--teal-border)' },
  senior:       { bg: 'var(--teal-bg)',    color: 'var(--teal)',    border: 'var(--teal-border)' },
  advanced:     { bg: 'var(--yellow-bg)',  color: 'var(--yellow)',  border: 'var(--yellow-border)' },
  Advanced:     { bg: 'var(--yellow-bg)',  color: 'var(--yellow)',  border: 'var(--yellow-border)' },
  staff:        { bg: 'var(--yellow-bg)',  color: 'var(--yellow)',  border: 'var(--yellow-border)' },
};

function DiffBadge({ diff }) {
  if (!diff) return null;
  const s = DIFF_COLORS[diff] || { bg: 'var(--surface-2)', color: 'var(--text-muted)', border: 'var(--border)' };
  return (
    <span style={{
      fontSize: '0.64rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>{diff}</span>
  );
}

// ── Type label + navigate-to room mapping ───────────────────────────────────
const TYPE_LABEL = {
  sql:           'SQL Problem',
  sf_module:     'Stats Foundation',
  mf_module:     'Metrics Foundation',
  ef_module:     'A/B Foundation',
  rca_module:    'RCA Foundation',
  cases:         'Cases Room',
  rca:           'RCA Room',
  estimation:    'Estimation',
  metrics:       'Metrics Room',
  growth:        'Growth Analytics',
  prioritization:'Prioritization',
  scenario:      'A/B Review',
  flaw:          'Spot the Flaw',
  design:        'A/B Design',
  instrumentation:'Instrumentation',
  product_design:'PM Design',
  stats:         'Stats Room',
  behavioral:    'Behavioral',
  company_case:  'Company Track',
  cheatsheet:    'Cheat Sheet',
  note:          'Note',
};

// Maps item type to the PAL onNavigate room key
const TYPE_ROOM = {
  sf_module:      'stat-foundations',
  mf_module:      'metrics-foundations',
  ef_module:      'exp-foundations',
  rca_module:     'rca-foundations',
  cases:          'cases',
  rca:            'rca',
  estimation:     'estimation',
  metrics:        'metrics',
  growth:         'growth-analytics',
  prioritization: 'prioritization',
  scenario:       'browser',
  flaw:           'spot-the-flaw',
  design:         'design',
  instrumentation:'instrumentation',
  product_design: 'product-design',
  stats:          'stats',
  behavioral:     'behavioral',
  company_case:   'cases',
  cheatsheet:     'cheatsheet',
};

// ── Track list (left pane) ──────────────────────────────────────────────────
function TrackList({ tracks, selectedId, onSelect, onNew, onDelete }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ width: '240px', flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1rem 1rem 0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>My Tracks</span>
        <button
          onClick={onNew}
          title="New track"
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '5px', width: 24, height: 24, cursor: 'pointer', fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >+</button>
      </div>

      {tracks.length === 0 && (
        <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
          No tracks yet. Hit + to create your first one, then use the + buttons across the app to add content.
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tracks.map(t => (
          <div
            key={t.id}
            onMouseEnter={() => setHovered(t.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 0.75rem 0.55rem 1rem',
              cursor: 'pointer',
              background: selectedId === t.id ? 'var(--accent-bg, rgba(99,102,241,0.08))' : hovered === t.id ? 'var(--surface-2)' : 'transparent',
              borderLeft: selectedId === t.id ? '3px solid var(--accent)' : '3px solid transparent',
              transition: 'background 0.1s',
            }}
            onClick={() => onSelect(t.id)}
          >
            <span style={{ flex: 1, fontSize: '0.83rem', fontWeight: selectedId === t.id ? 600 : 400, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.name}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
              {t.items.length}
            </span>
            {hovered === t.id && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(t.id); }}
                title="Delete track"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0 2px', fontSize: '0.75rem', lineHeight: 1, flexShrink: 0 }}
              >✕</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Track detail (right pane) ───────────────────────────────────────────────
function TrackDetail({ track, onChanged, onOpenSqlProblem, onNavigate }) {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(track.name);
  const [addingNote, setAddingNote] = useState(false);
  const [noteVal, setNoteVal] = useState('');
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  function saveName() {
    renameTrack(track.id, nameVal.trim() || track.name);
    setEditingName(false);
    onChanged();
  }

  function handleRemove(idx) {
    removeItem(track.id, idx);
    onChanged();
  }

  function handleAddNote(e) {
    e.preventDefault();
    if (!noteVal.trim()) return;
    addNote(track.id, noteVal.trim());
    setNoteVal('');
    setAddingNote(false);
    onChanged();
  }

  function handleDragStart(idx) { setDragIdx(idx); }
  function handleDragOver(e, idx) { e.preventDefault(); setOverIdx(idx); }
  function handleDrop(idx) {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setOverIdx(null); return; }
    reorderItems(track.id, dragIdx, idx);
    setDragIdx(null);
    setOverIdx(null);
    onChanged();
  }

  const totalItems = track.items.length;
  const noteCount  = track.items.filter(i => i.type === 'note').length;
  const otherCount = totalItems - noteCount;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minWidth: 0 }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem 0.6rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          {editingName ? (
            <form onSubmit={e => { e.preventDefault(); saveName(); }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                autoFocus
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => { if (e.key === 'Escape') { setNameVal(track.name); setEditingName(false); } }}
                style={{ fontSize: '1.1rem', fontWeight: 700, background: 'var(--surface-2)', border: '1px solid var(--accent)', borderRadius: '5px', padding: '0.2rem 0.5rem', color: 'var(--text)', outline: 'none', width: '100%', maxWidth: '340px' }}
              />
            </form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{track.name}</h1>
              <button onClick={() => setEditingName(true)} title="Rename" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '2px 4px', borderRadius: 4, lineHeight: 1 }}>✎</button>
            </div>
          )}
          <div style={{ marginTop: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {otherCount} item{otherCount !== 1 ? 's' : ''}{noteCount > 0 ? ` · ${noteCount} note${noteCount !== 1 ? 's' : ''}` : ''}
            {' · '}Created {new Date(track.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <button
          onClick={() => setAddingNote(a => !a)}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          + Note
        </button>
      </div>

      {/* Add note form */}
      {addingNote && (
        <form onSubmit={handleAddNote} style={{ margin: '0.75rem 1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <textarea
            autoFocus
            value={noteVal}
            onChange={e => setNoteVal(e.target.value)}
            placeholder="Add a note to this track…"
            rows={2}
            style={{ flex: 1, fontSize: '0.82rem', padding: '0.4rem 0.6rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', resize: 'vertical', outline: 'none', lineHeight: 1.5 }}
            onKeyDown={e => { if (e.key === 'Escape') { setAddingNote(false); setNoteVal(''); } }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <button type="submit" disabled={!noteVal.trim()} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '5px', padding: '0.35rem 0.65rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, opacity: noteVal.trim() ? 1 : 0.4 }}>Save</button>
            <button type="button" onClick={() => { setAddingNote(false); setNoteVal(''); }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '5px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Items */}
      <div style={{ padding: '0.75rem 1.25rem', flex: 1 }}>
        {track.items.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', padding: '1.5rem 0', textAlign: 'center', lineHeight: 1.6 }}>
            This track is empty.<br/>
            Use the + button on any problem, module, or cheat sheet section to add it here.
          </div>
        )}

        {track.items.map((item, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
            style={{
              display: 'flex', alignItems: item.type === 'note' ? 'flex-start' : 'center',
              gap: '0.65rem', padding: '0.55rem 0.65rem', borderRadius: '8px',
              marginBottom: '0.4rem', cursor: 'grab',
              background: overIdx === idx ? 'var(--accent-bg, rgba(99,102,241,0.08))' : 'var(--surface-2)',
              border: overIdx === idx ? '1px solid var(--accent)' : '1px solid var(--border)',
              transition: 'border 0.1s, background 0.1s',
              opacity: dragIdx === idx ? 0.4 : 1,
            }}
          >
            {/* Drag handle */}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'grab', flexShrink: 0, lineHeight: 1, paddingTop: item.type === 'note' ? '2px' : 0 }}>⠿</span>

            {/* SQL problem */}
            {item.type === 'sql' && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <DiffBadge diff={item.difficulty} />
                    <button
                      onClick={() => onOpenSqlProblem(item.problemId)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', textAlign: 'left' }}
                      title="Open in SQL Lab"
                    >
                      {item.title}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.problemId}</div>
                </div>
                <button
                  onClick={() => onOpenSqlProblem(item.problemId)}
                  title="Open problem"
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '5px', padding: '3px 8px', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  Open →
                </button>
              </>
            )}

            {/* Inline note */}
            {item.type === 'note' && (
              <p style={{ flex: 1, margin: 0, fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {item.content}
              </p>
            )}

            {/* Generic PAL items (all other types) */}
            {item.type !== 'sql' && item.type !== 'note' && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    {/* Type label chip */}
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 700,
                      color: 'var(--accent)', background: 'var(--accent-bg)',
                      border: '1px solid var(--accent-border)',
                      borderRadius: '4px', padding: '0.05rem 0.35rem',
                      textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                    }}>
                      {TYPE_LABEL[item.type] || item.type}
                    </span>
                    {/* Difficulty badge */}
                    {item.meta?.difficulty && <DiffBadge diff={item.meta.difficulty} />}
                    {/* Room tag for company_case */}
                    {item.meta?.room && item.type === 'company_case' && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {item.meta.room}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label || item.itemId}
                  </div>
                </div>
                {/* Navigate button */}
                {TYPE_ROOM[item.type] && (
                  <button
                    onClick={() => onNavigate(TYPE_ROOM[item.type])}
                    title={`Go to ${TYPE_LABEL[item.type] || item.type}`}
                    style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '5px', padding: '3px 8px', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    Go →
                  </button>
                )}
              </>
            )}

            {/* Remove button */}
            <button
              onClick={() => handleRemove(idx)}
              title="Remove"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '2px 4px', borderRadius: 3, flexShrink: 0, lineHeight: 1 }}
            >✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page root ───────────────────────────────────────────────────────────────
export function MyTracksPage({ onNavigate, onOpenSqlProblem }) {
  const [tracks, setTracks] = useState(() => getTracks());
  const [selectedId, setSelectedId] = useState(() => getTracks()[0]?.id || null);

  const refresh = useCallback(() => {
    const updated = getTracks();
    setTracks(updated);
    if (selectedId && !updated.find(t => t.id === selectedId)) {
      setSelectedId(updated[0]?.id || null);
    }
  }, [selectedId]);

  // Listen for cross-component track changes
  useEffect(() => {
    window.addEventListener('pal_tracks', refresh);
    return () => window.removeEventListener('pal_tracks', refresh);
  }, [refresh]);

  function handleNew() {
    const t = createTrack('New Track');
    refresh();
    setSelectedId(t.id);
  }

  function handleDelete(trackId) {
    if (!window.confirm('Delete this track?')) return;
    deleteTrack(trackId);
    const updated = getTracks();
    setTracks(updated);
    if (selectedId === trackId) setSelectedId(updated[0]?.id || null);
  }

  const selectedTrack = tracks.find(t => t.id === selectedId) || null;

  return (
    <div style={{ padding: '1.5rem 2rem 0', maxWidth: '900px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => onNavigate('sql-lab')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem', padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          ← SQL Lab
        </button>
        <span style={{ color: 'var(--border)' }}>·</span>
        <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>My Tracks</h1>
      </div>

      {/* Two-pane layout */}
      <div style={{
        display: 'flex', height: 'calc(100vh - 140px)',
        border: '1px solid var(--border)', borderRadius: '10px',
        overflow: 'hidden', background: 'var(--surface)',
      }}>
        <TrackList
          tracks={tracks}
          selectedId={selectedId}
          onSelect={id => setSelectedId(id)}
          onNew={handleNew}
          onDelete={handleDelete}
        />

        {selectedTrack ? (
          <TrackDetail
            key={selectedTrack.id}
            track={selectedTrack}
            onChanged={refresh}
            onOpenSqlProblem={onOpenSqlProblem}
            onNavigate={onNavigate}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {tracks.length === 0
              ? 'Create a track to get started.'
              : 'Select a track from the left.'}
          </div>
        )}
      </div>
    </div>
  );
}
