import { useState, useCallback, useEffect } from 'react';
import {
  getTracks, createTrack, deleteTrack, renameTrack,
  removeItem, reorderItems, createNote, updateHighlightNote, moveItem, seedTierTracks,
} from '../utils/tracks.js';
import { shareTrack } from '../utils/sharedTracks.js';
import { Icon } from '../components/shared/Icon.jsx';
import { NoteEditor } from '../components/tracks/NoteEditor.jsx';

// ── Rich-note preview helpers (block shapes live in components/tracks/NoteEditor.jsx) ─
const NOTE_TEXTISH = ['text', 'h1', 'h2', 'h3', 'bullet', 'numbered', 'todo', 'quote', 'callout'];

function notePreview(note) {
  const b = (note.blocks || []).find(x => NOTE_TEXTISH.includes(x.type) && x.content?.trim());
  return b ? b.content.replace(/[*~=`#>]/g, '').slice(0, 90) : '';
}

function noteBlockSummary(note) {
  const blocks = note.blocks || [];
  const videos = blocks.filter(b => b.type === 'video').length;
  const links = blocks.filter(b => b.type === 'link').length;
  const todos = blocks.filter(b => b.type === 'todo').length;
  const todosDone = blocks.filter(b => b.type === 'todo' && b.checked).length;
  const texts = blocks.filter(b => NOTE_TEXTISH.includes(b.type) && b.type !== 'todo' && b.content?.trim()).length
    + blocks.filter(b => ['code', 'toggle'].includes(b.type) && (b.content?.trim() || b.body?.trim())).length;
  const parts = [];
  if (texts) parts.push(`${texts} block${texts > 1 ? 's' : ''}`);
  if (todos) parts.push(`${todosDone}/${todos} todos`);
  if (videos) parts.push(`${videos} video${videos > 1 ? 's' : ''}`);
  if (links) parts.push(`${links} link${links > 1 ? 's' : ''}`);
  return parts.join(' · ') || 'empty';
}

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
  blog:          'Deep Dive',
  interview_qa:  'Interview Q&A',
  failure:       'Failure',
  note:          'Note',
  highlight:     'Highlight',
};

// Highlight color key -> CSS var. Matches the 4 swatches in HighlightPopover
// (which deliberately reuses each Foundations family's own accent color).
const HIGHLIGHT_COLOR_VAR = {
  yellow: 'var(--yellow)',
  green:  'var(--green)',
  accent: 'var(--accent)',
  teal:   'var(--teal)',
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
  blog:           'blog',
  interview_qa:   'interview-qa',
  failure:        'failures',
};

// ── Item grouping helper ────────────────────────────────────────────────────
// Groups a track's items by their natural source, preserving first-appearance
// order in the detail pane.
function itemGroup(item) {
  if (item.type === 'note') return { key: 'note', label: 'Notes' };
  if (item.type === 'sql')  return { key: 'sql', label: 'SQL' };
  // Foundation-module types + all generic types group by their type via TYPE_LABEL.
  return { key: item.type, label: TYPE_LABEL[item.type] || item.type };
}

// ── Track item row ──────────────────────────────────────────────────────────
function TrackItemRow({
  item, idx, trackId, onOpenSqlProblem, onNavigate, onRemove, onOpenNote, onUpdateHighlightNote,
  dragIdx, overIdx, onDragStart, onDragOver, onDrop, onDragEnd,
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  return (
    <div
      key={idx}
      draggable={!editingNote}
      onDragStart={e => {
        // Additive: carry source track + index so a drop on a different
        // sidebar track can MOVE the item cross-track. Intra-track reorder
        // still runs off the local dragIdx state below.
        try {
          e.dataTransfer.setData('application/x-track-item', JSON.stringify({ fromTrackId: trackId, index: idx }));
          e.dataTransfer.effectAllowed = 'move';
        } catch (err) {}
        onDragStart(idx);
      }}
      onDragOver={e => onDragOver(e, idx)}
      onDrop={() => onDrop(idx)}
      onDragEnd={onDragEnd}
      style={{
        display: 'flex', alignItems: (item.type === 'note' || item.type === 'highlight') ? 'flex-start' : 'center',
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

      {/* Rich note — opens the full block editor */}
      {item.type === 'note' && (
        <>
          <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onOpenNote(item)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📝 Note</span>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', opacity: 0.8 }}>{noteBlockSummary(item)}</span>
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.35 }}>
              {item.title || 'Untitled note'}
            </div>
            {notePreview(item) && (
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {notePreview(item)}
              </div>
            )}
          </div>
          <button
            onClick={() => onOpenNote(item)}
            title="Open note editor"
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '5px', padding: '3px 8px', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            Open →
          </button>
        </>
      )}

      {/* Saved highlight (text selection captured from a Foundations module) —
          v1 snapshot only: excerpt + color + editable note + jump-to-source.
          Does NOT repaint on the original module page. */}
      {item.type === 'highlight' && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            borderLeft: `3px solid ${HIGHLIGHT_COLOR_VAR[item.meta?.color] || 'var(--border)'}`,
            paddingLeft: '0.65rem', marginBottom: '0.5rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.55, fontStyle: 'italic', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              “{item.meta?.text || item.label}”
            </p>
            {item.meta?.sourceLabel && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                from {item.meta.sourceLabel}
              </div>
            )}
          </div>

          {/* Editable note — mirrors the plain-note editing pattern above */}
          {editingNote ? (
            <div>
              <textarea
                value={noteDraft}
                onChange={e => setNoteDraft(e.target.value)}
                rows={3}
                autoFocus
                placeholder="Add a note about this highlight…"
                onKeyDown={e => { if (e.key === 'Escape') setEditingNote(false); }}
                style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.5, padding: '0.4rem 0.5rem', borderRadius: '6px', border: '1px solid var(--accent)', background: 'var(--surface)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                <button onClick={() => { onUpdateHighlightNote(idx, noteDraft.trim()); setEditingNote(false); }}
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '5px', padding: '3px 10px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>Save</button>
                <button onClick={() => setEditingNote(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.3rem' }}>
              {item.meta?.note ? (
                <p style={{ flex: 1, margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {item.meta.note}
                </p>
              ) : (
                <span style={{ flex: 1, fontSize: '0.76rem', color: 'var(--text-muted)', opacity: 0.7 }}>No note</span>
              )}
              <button onClick={() => { setNoteDraft(item.meta?.note || ''); setEditingNote(true); }}
                title="Edit note"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem', flexShrink: 0 }}>✎</button>
            </div>
          )}

          {/* Jump to source — resolves the family room from meta.itemType via
              the same TYPE_ROOM map every other generic item uses, so it goes
              through PAL's existing item-level deep-linking (openXModule). */}
          {item.meta?.itemType && item.meta?.moduleId && TYPE_ROOM[item.meta.itemType] && (
            <button
              onClick={() => onNavigate(TYPE_ROOM[item.meta.itemType], item.meta.moduleId)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}
            >
              Jump to source →
            </button>
          )}
        </div>
      )}

      {/* Generic PAL items (all other types) */}
      {item.type !== 'sql' && item.type !== 'note' && item.type !== 'highlight' && (
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
          {/* Navigate button — company_case items carry their true room in meta.room
              (the case id in itemId resolves against that room's opener), everything
              else uses the type→room map. */}
          {(item.type === 'company_case' ? item.meta?.room : TYPE_ROOM[item.type]) && (
            <button
              onClick={() => onNavigate(
                item.type === 'company_case' ? item.meta.room : TYPE_ROOM[item.type],
                item.itemId || item.moduleId || item.caseId,
              )}
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
        onClick={() => onRemove(idx)}
        title="Remove"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '2px 4px', borderRadius: 3, flexShrink: 0, lineHeight: 1 }}
      >✕</button>
    </div>
  );
}

// ── Track list (left pane) ──────────────────────────────────────────────────
function TrackList({ tracks, selectedId, onSelect, onNew, onDelete, onMoved, onBuildTiers }) {
  const [hovered, setHovered] = useState(null);
  const [dropTarget, setDropTarget] = useState(null); // track id currently drag-hovered

  function handleTrackDrop(e, thisTrackId) {
    e.preventDefault();
    setDropTarget(null);
    try {
      const d = JSON.parse(e.dataTransfer.getData('application/x-track-item'));
      if (d && d.fromTrackId && d.fromTrackId !== thisTrackId && Number.isInteger(d.index)) {
        moveItem(d.fromTrackId, thisTrackId, d.index);
        onMoved && onMoved();
      }
    } catch (err) {}
  }

  return (
    // Desktop: fixed 240px rail. Mobile: full-width; the .mt-twopane parent
    // hides this pane when a track is selected (master–detail).
    <div className="mt-list" style={{ flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1rem 1rem 0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>My Tracks</span>
        <button
          onClick={onNew}
          title="New track"
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '5px', width: 24, height: 24, cursor: 'pointer', fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >+</button>
      </div>

      {onBuildTiers && (
        <button
          onClick={onBuildTiers}
          title="Create the S / A / B tier tracks from every Foundation module, ranked by interview frequency"
          style={{
            margin: '0 1rem 0.6rem', padding: '0.4rem 0.6rem',
            background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
            borderRadius: '6px', color: 'var(--teal)', fontSize: '0.74rem',
            fontWeight: 700, cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap',
          }}
        >
          Build S / A / B tier tracks
        </button>
      )}

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
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTarget(t.id); }}
            onDragLeave={() => setDropTarget(d => (d === t.id ? null : d))}
            onDrop={e => handleTrackDrop(e, t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.55rem 0.75rem 0.55rem 1rem',
              cursor: 'pointer',
              background: dropTarget === t.id ? 'var(--accent-bg, rgba(99,102,241,0.14))' : selectedId === t.id ? 'var(--accent-bg, rgba(99,102,241,0.08))' : hovered === t.id ? 'var(--surface-2)' : 'transparent',
              borderLeft: (dropTarget === t.id || selectedId === t.id) ? '3px solid var(--accent)' : '3px solid transparent',
              boxShadow: dropTarget === t.id ? 'inset 0 0 0 1px var(--accent)' : 'none',
              transition: 'background 0.1s, box-shadow 0.1s',
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
function TrackDetail({ track, onChanged, onOpenSqlProblem, onNavigate, onNewNote, onOpenNote, user, sharedUrl, onShare, onMobileBack }) {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(track.name);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  function saveName() {
    renameTrack(track.id, nameVal.trim() || track.name);
    setEditingName(false);
    onChanged();
  }

  function handleRemove(idx) {
    if (track.items[idx]?.type === 'note' && !window.confirm('Delete this note? This cannot be undone.')) return;
    removeItem(track.id, idx);
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
    <div className="mt-detail" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minWidth: 0 }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem 0.6rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {/* Mobile-only back-to-list (master–detail). Hidden ≥769px via CSS. */}
        <button
          className="mt-back"
          onClick={onMobileBack}
          aria-label="Back to tracks"
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1, flexShrink: 0, marginTop: '0.1rem' }}
        >←</button>
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
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={onNewNote}
            title="Create a rich note (headings, to-dos, code, embeds) in this track"
            style={{ background: 'var(--accent)', border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}
          >+ New Note</button>
          <button
            disabled={sharing || !user}
            title={user ? 'Share this track (anyone with the link can view)' : 'Sign in to share tracks'}
            onClick={async () => {
              if (!user || sharing) return;
              setSharing(true);
              try { await onShare(track); } finally { setSharing(false); }
            }}
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', cursor: user ? 'pointer' : 'not-allowed', color: user ? 'var(--text-muted)' : 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', opacity: user ? 1 : 0.5 }}
          >{sharing ? '…' : sharedUrl ? 'Update link' : 'Share'}</button>
        </div>
      </div>

      {/* Share URL banner */}
      {sharedUrl && (
        <div style={{ margin: '0 1.25rem 0.5rem', padding: '0.5rem 0.75rem', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: '7px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ flex: 1, fontSize: '0.74rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{sharedUrl}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(sharedUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ flexShrink: 0, fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '5px', border: '1px solid var(--accent-border)', background: copied ? 'var(--accent)' : 'none', color: copied ? '#fff' : 'var(--accent)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' }}
          >{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      )}

      {/* Items */}
      <div style={{ padding: '0.75rem 1.25rem', flex: 1 }}>
        {track.items.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', padding: '1.5rem 0', textAlign: 'center', lineHeight: 1.6 }}>
            This track is empty.<br/>
            Use the + button on any problem, module, or cheat sheet section to add it here.
          </div>
        )}

        {(() => {
          // Group items by natural source, preserving first-appearance order.
          const order = [];
          const groups = {};
          track.items.forEach((item, idx) => {
            const { key, label } = itemGroup(item);
            if (!groups[key]) { groups[key] = { label, entries: [] }; order.push(key); }
            groups[key].entries.push({ item, idx });
          });
          return order.map(key => {
            const g = groups[key];
            return (
              <div key={key} style={{ marginBottom: '1rem' }}>
                {/* Group header — muted uppercase eyebrow */}
                <div style={{
                  fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  margin: '0 0 0.4rem 0.15rem',
                }}>
                  {g.label} · {g.entries.length}
                </div>
                {g.entries.map(({ item, idx }) => (
                  <TrackItemRow
                    key={idx}
                    item={item}
                    idx={idx}
                    trackId={track.id}
                    onOpenSqlProblem={onOpenSqlProblem}
                    onNavigate={onNavigate}
                    onRemove={handleRemove}
                    onOpenNote={onOpenNote}
                    onUpdateHighlightNote={(i, content) => { updateHighlightNote(track.id, i, content); onChanged(); }}
                    dragIdx={dragIdx}
                    overIdx={overIdx}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                  />
                ))}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

// ── Page root ───────────────────────────────────────────────────────────────
export function MyTracksPage({ onNavigate, onOpenSqlProblem, user }) {
  const [tracks, setTracks] = useState(() => getTracks());
  const [selectedId, setSelectedId] = useState(() => getTracks()[0]?.id || null);
  const [sharedUrls, setSharedUrls] = useState({});
  const [openNote, setOpenNote] = useState(null); // { trackId, noteId }
  // Mobile master–detail: which pane is visible on phones (desktop shows both).
  const [mobileDetail, setMobileDetail] = useState(false);

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
    // Cross-tab reconciliation: the 'pal_tracks' CustomEvent is same-tab only.
    // localStorage 'storage' events fire in OTHER tabs when any tab writes the
    // tracks key, so a second tab won't hold stale state (or clobber the first
    // tab's writes on its next save). Fires on key match, or key === null (clear()).
    const onStorage = (e) => { if (e.key === 'pal-tracks-v1' || e.key === null) refresh(); };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('pal_tracks', refresh);
      window.removeEventListener('storage', onStorage);
    };
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
    if (selectedId === trackId) {
      setSelectedId(updated[0]?.id || null);
      setMobileDetail(false); // fall back to the list pane on mobile
    }
  }

  async function handleShare(track) {
    const { shareUrl } = await shareTrack(track, user.id);
    setSharedUrls(prev => ({ ...prev, [track.id]: shareUrl }));
  }

  const selectedTrack = tracks.find(t => t.id === selectedId) || null;

  // If a note is open, resolve it from the latest track state.
  const liveNote = openNote
    ? (tracks.find(t => t.id === openNote.trackId)?.items.find(i => i.type === 'note' && i.id === openNote.noteId) || null)
    : null;

  function handleNewNote() {
    if (!selectedTrack) return;
    const note = createNote(selectedTrack.id, '');
    refresh();
    if (note) setOpenNote({ trackId: selectedTrack.id, noteId: note.id });
  }

  return (
    <div style={{ padding: '1.5rem 2rem 0', maxWidth: openNote && liveNote ? '1100px' : '900px', margin: '0 auto' }} className="mt-page">
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

      {/* Two-pane layout — master–detail collapse on mobile via .mt-twopane.
          `mt-showing-detail` (mobile only) hides the list and shows the detail. */}
      <div className={`mt-twopane${mobileDetail ? ' mt-showing-detail' : ''}`} style={{
        display: 'flex', height: 'calc(100vh - 140px)',
        border: '1px solid var(--border)', borderRadius: '10px',
        overflow: 'hidden', background: 'var(--surface)',
      }}>
        <TrackList
          tracks={tracks}
          selectedId={selectedId}
          onSelect={id => { setOpenNote(null); setSelectedId(id); setMobileDetail(true); }}
          onNew={handleNew}
          onDelete={handleDelete}
          onMoved={refresh}
          onBuildTiers={() => {
            if (!window.confirm('Build the S / A / B tier tracks? This creates (or rebuilds) three tracks — S Tier, A Tier, B Tier — from every Foundation module, ranked by interview frequency.')) return;
            const res = seedTierTracks();
            const updated = getTracks();
            setTracks(updated);
            const sTrack = updated.find(t => t.name === 'S Tier');
            if (sTrack) setSelectedId(sTrack.id);
            const total = res.reduce((n, r) => n + r.count, 0);
            window.alert(`Done: S (${res.find(r => r.name === 'S Tier')?.count}), A (${res.find(r => r.name === 'A Tier')?.count}), B (${res.find(r => r.name === 'B Tier')?.count}) — ${total} modules across 3 tracks.`);
          }}
        />

        {openNote && liveNote ? (
          <div className="mt-detail" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <NoteEditor
              key={liveNote.id}
              trackId={openNote.trackId}
              note={liveNote}
              onBack={() => { refresh(); setOpenNote(null); }}
            />
          </div>
        ) : selectedTrack ? (
          <TrackDetail
            key={selectedTrack.id}
            track={selectedTrack}
            onChanged={refresh}
            onOpenSqlProblem={onOpenSqlProblem}
            onNavigate={onNavigate}
            onNewNote={handleNewNote}
            onOpenNote={note => { setOpenNote({ trackId: selectedTrack.id, noteId: note.id }); setMobileDetail(true); }}
            user={user}
            sharedUrl={sharedUrls[selectedTrack.id] || null}
            onShare={handleShare}
            onMobileBack={() => setMobileDetail(false)}
          />
        ) : (
          <div className="mt-detail" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {tracks.length === 0
              ? 'Create a track to get started.'
              : 'Select a track from the left.'}
          </div>
        )}
      </div>
    </div>
  );
}
