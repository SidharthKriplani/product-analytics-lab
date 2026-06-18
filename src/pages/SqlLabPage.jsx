import { useState, useEffect, useRef } from 'react';
import { sqlLabProblems } from '../data/sqlLabProblems.js';
import { datamarts } from '../data/sqlLabDatamarts.js';
import { track } from '../utils/analytics.js';
import { ShareLinkButton } from '../components/shared/ShareLinkButton.jsx';

const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2, Master: 3, Forensic: 5 };

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={j}>{part.slice(2, -2)}</strong>
      : part
  );
}

const DEBRIEF_BLOCKS = [
  {
    pattern: /^\*\*(Wrong answer[^*]*)\*\*:?/,
    label: 'Wrong Answer',
    color: 'var(--red)',
    bg: 'var(--red-bg)',
    border: 'var(--red-border)',
  },
  {
    pattern: /^\*\*(Forensic trap[^*]*)\*\*:?/,
    label: 'Forensic Trap',
    color: '#ea580c',
    bg: 'rgba(234,88,12,0.07)',
    border: 'rgba(234,88,12,0.3)',
  },
  {
    pattern: /^\*\*(Sanity check[^*]*)\*\*:?/,
    label: 'Sanity Check',
    color: 'var(--teal)',
    bg: 'var(--teal-bg)',
    border: 'var(--teal-border)',
  },
  {
    pattern: /^\*\*(Before writing[^*]*)\*\*:?/,
    label: 'Analyst Judgment',
    color: 'var(--yellow)',
    bg: 'var(--yellow-bg)',
    border: 'var(--yellow-border)',
  },
];

function DebriefBlock({ block, body }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderLeft: '3px solid ' + block.border,
      background: block.bg,
      borderRadius: '0 6px 6px 0',
      overflow: 'hidden',
      margin: '0.8rem 0 0',
    }}>
      <button
        onClick={() => setOpen(function(o) { return !o; })}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.45rem 0.85rem', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.09em', color: block.color,
        }}>{block.label}</span>
        <span style={{
          fontSize: '0.62rem', color: block.color, opacity: 0.7,
          display: 'inline-block', transition: 'transform 0.15s',
          transform: open ? 'rotate(180deg)' : 'none',
        }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: '0 0.85rem 0.6rem', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.65 }}>
          {renderInline(body)}
        </div>
      )}
    </div>
  );
}

function DebriefPanel({ text }) {
  if (!text) return null;
  return (
    <div>
      {text.split('\n\n').map(function(para, i) {
        var trimmed = para.trim();
        for (var bi = 0; bi < DEBRIEF_BLOCKS.length; bi++) {
          var block = DEBRIEF_BLOCKS[bi];
          if (block.pattern.test(trimmed)) {
            var body = trimmed.replace(block.pattern, '').replace(/^:\s*/, '').trim();
            return <DebriefBlock key={i} block={block} body={body} />;
          }
        }
        return (
          <p key={i} style={{ margin: i === 0 ? 0 : '0.6rem 0 0 0', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.65 }}>
            {renderInline(para)}
          </p>
        );
      })}
    </div>
  );
}

const SORTED_PROBLEMS = [...sqlLabProblems].sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);

const DIFF_COLOR = {
  Easy:     { bg: 'var(--green-bg,  rgba(16,185,129,0.08))',  text: 'var(--green)',  border: 'var(--green-border,  rgba(16,185,129,0.25))' },
  Medium:   { bg: 'var(--yellow-bg, rgba(245,158,11,0.08))',  text: 'var(--yellow)', border: 'var(--yellow-border, rgba(245,158,11,0.25))' },
  Hard:     { bg: 'var(--red-bg,    rgba(239,68,68,0.08))',   text: 'var(--red)',    border: 'var(--red-border,    rgba(239,68,68,0.25))' },
  Master:   { bg: 'var(--purple-bg, rgba(139,92,246,0.08))',  text: 'var(--purple)', border: 'var(--purple-border, rgba(139,92,246,0.25))' },
  Forensic: { bg: 'rgba(234,88,12,0.10)',                     text: '#ea580c',       border: 'rgba(234,88,12,0.35)' },
};

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Master', 'Forensic'];
const ALL_COMPANIES = [...new Set(SORTED_PROBLEMS.map(p => p.datamartId))].sort();

// ─── localStorage helpers ─────────────────────────────────────────────────────

function getStoredQuery(id) {
  try { return localStorage.getItem('pal-sql-query-' + id) || ''; } catch { return ''; }
}
function saveQueryLS(id, q) {
  try { localStorage.setItem('pal-sql-query-' + id, q); } catch {}
}
function getStoredSubs(id) {
  try { return JSON.parse(localStorage.getItem('pal-sql-subs-' + id) || '[]'); } catch { return []; }
}
function addStoredSub(id, query, passed) {
  try {
    const subs = getStoredSubs(id);
    subs.unshift({ query: query, passed: passed, ts: Date.now() });
    if (subs.length > 15) subs.length = 15;
    localStorage.setItem('pal-sql-subs-' + id, JSON.stringify(subs));
  } catch {}
}

// ─── Shared components ────────────────────────────────────────────────────────

function Badge({ label, style }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: '0.7rem', fontWeight: 600,
      padding: '2px 8px', borderRadius: '99px',
      border: '1px solid', letterSpacing: '0.02em',
      ...style,
    }}>{label}</span>
  );
}

function SchemaAccordion({ dm, open, onToggle }) {
  if (!dm) return null;
  const tableNames = Object.keys(dm.tables);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', marginTop: '0.75rem' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.5rem 0.75rem', background: 'var(--surface-2)', border: 'none',
          cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500,
        }}
      >
        <span>Schema — {dm.name} ({tableNames.length} tables)</span>
        <span style={{ fontSize: '0.65rem', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: '0.6rem 0.75rem', background: 'var(--surface)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '0.6rem' }}>
          {Object.entries(dm.tables).map(([tableName, table]) => (
            <div key={tableName} style={{ padding: '0.4rem 0.5rem', background: 'var(--surface-2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', marginBottom: '4px' }}>
                {tableName}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {table.columns.map(col => (
                  <span key={col.name} style={{ fontSize: '0.65rem', fontFamily: 'monospace', padding: '1px 5px', borderRadius: '3px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{col.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultsTable({ results }) {
  if (!results || results.columns.length === 0) {
    return <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Query returned no rows.</div>;
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: 'monospace' }}>
        <thead>
          <tr style={{ background: 'var(--surface-2)' }}>
            {results.columns.map(col => (
              <th key={col} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid var(--border)' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '5px 10px', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                  {cell === null ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL</span> : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Browse mode ──────────────────────────────────────────────────────────────

function ProblemListRow({ p, isSolved, onSelect }) {
  const ds = DIFF_COLOR[p.difficulty] || DIFF_COLOR.Easy;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        padding: '0.55rem 0.85rem',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer', transition: 'background 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Status dot */}
      <span style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: isSolved ? 'var(--green)' : 'var(--border)',
        border: isSolved ? 'none' : '1.5px solid var(--border)',
      }} />
      {/* Difficulty */}
      <span style={{
        fontSize: '0.62rem', fontWeight: 700, padding: '1px 7px', borderRadius: '99px',
        background: ds.bg, color: ds.text, border: '1px solid ' + ds.border,
        flexShrink: 0, minWidth: 48, textAlign: 'center',
      }}>{p.difficulty}</span>
      {/* Company */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, minWidth: 80 }}>
        {p.companyDomain && (
          <img
            src={'https://www.google.com/s2/favicons?domain=' + p.companyDomain + '&sz=32'}
            alt={p.company}
            style={{ width: 11, height: 11, borderRadius: 2, objectFit: 'contain' }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{p.company}</span>
      </div>
      {/* Title */}
      <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', lineHeight: 1.3, minWidth: 0 }}>
        {p.title}
      </span>
      {/* Tags */}
      {p.tags && p.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
          {p.tags.slice(0, 2).map(t => (
            <span key={t} style={{
              fontSize: '0.58rem', padding: '1px 5px', borderRadius: '3px',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', whiteSpace: 'nowrap',
            }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function SqlLabBrowserView({ onBack, onSelect, solved, onShowPlan }) {
  const [filterDiffs, setFilterDiffs] = useState(new Set());
  const [filterCompany, setFilterCompany] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const solvedCount = SORTED_PROBLEMS.filter(p => solved.has(p.id)).length;

  const filtered = SORTED_PROBLEMS.filter(p => {
    if (filterDiffs.size > 0 && !filterDiffs.has(p.difficulty)) return false;
    if (filterCompany && p.datamartId !== filterCompany) return false;
    if (filterStatus === 'solved' && !solved.has(p.id)) return false;
    if (filterStatus === 'unsolved' && solved.has(p.id)) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function toggleDiff(d) {
    setFilterDiffs(prev => { const n = new Set(prev); if (n.has(d)) n.delete(d); else n.add(d); return n; });
  }

  return (
    <div className="sql-lab-browse-panel">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}
        >← Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 28, height: 28, background: 'var(--teal)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>{'<>'}</div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--teal)', letterSpacing: '-0.02em' }}>SQL Lab</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.25rem' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--teal)' }}>{solvedCount}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/ {SORTED_PROBLEMS.length} solved</span>
          <div style={{ width: 72, height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginLeft: '0.2rem' }}>
            <div style={{ height: '100%', width: (solvedCount / SORTED_PROBLEMS.length * 100) + '%', background: 'var(--teal)', borderRadius: 99 }} />
          </div>
        </div>
        <button
          onClick={onShowPlan}
          style={{ marginLeft: 'auto', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--teal)', cursor: 'pointer' }}
        >Study Plan</button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '0.35rem 0.65rem', width: 180,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text)',
            outline: 'none', boxSizing: 'border-box',
          }}
        />

        {/* Difficulty chips */}
        {DIFFICULTIES.map(d => {
          const active = filterDiffs.has(d);
          const ds = DIFF_COLOR[d];
          return (
            <button
              key={d}
              onClick={() => toggleDiff(d)}
              style={{
                padding: '2px 9px', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 600,
                cursor: 'pointer', border: '1px solid',
                background: active ? ds.bg : 'var(--surface-2)',
                color: active ? ds.text : 'var(--text-muted)',
                borderColor: active ? ds.border : 'var(--border)',
              }}
            >{active ? '✓ ' : ''}{d}</button>
          );
        })}

        {/* Company dropdown */}
        <select
          value={filterCompany}
          onChange={e => setFilterCompany(e.target.value)}
          style={{
            padding: '3px 0.6rem', borderRadius: '6px', fontSize: '0.72rem',
            background: filterCompany ? 'rgba(20,184,166,0.08)' : 'var(--surface-2)',
            color: filterCompany ? 'var(--teal)' : 'var(--text-muted)',
            border: filterCompany ? '1px solid rgba(20,184,166,0.35)' : '1px solid var(--border)',
            cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="">All companies</option>
          {ALL_COMPANIES.map(c => (
            <option key={c} value={c}>{c} ({SORTED_PROBLEMS.filter(p => p.datamartId === c).length})</option>
          ))}
        </select>

        {/* Status filter */}
        {['all', 'unsolved', 'solved'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '2px 9px', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 600,
              cursor: 'pointer', border: '1px solid',
              background: filterStatus === s ? 'rgba(20,184,166,0.1)' : 'var(--surface-2)',
              color: filterStatus === s ? 'var(--teal)' : 'var(--text-muted)',
              borderColor: filterStatus === s ? 'rgba(20,184,166,0.35)' : 'var(--border)',
            }}
          >{s === 'all' ? 'All' : s === 'solved' ? '✓ Solved' : '○ Unsolved'}</button>
        ))}

        {/* Count */}
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length}{filtered.length !== SORTED_PROBLEMS.length ? ' / ' + SORTED_PROBLEMS.length : ''} problems
        </span>
      </div>

      {/* List */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '2rem',
      }}>
        {/* List header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.4rem 0.85rem',
          background: 'var(--surface-2)', borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ width: 7, flexShrink: 0 }} />
          <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', minWidth: 48 }}>Level</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', minWidth: 80 }}>Company</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', flex: 1 }}>Problem</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>Topics</span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            No problems match these filters.
          </div>
        ) : (
          filtered.map(p => (
            <ProblemListRow key={p.id} p={p} isSolved={solved.has(p.id)} onSelect={() => onSelect(p.id)} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Submissions history ──────────────────────────────────────────────────────

function SubmissionsHistory({ problemId, onRestore }) {
  const [open, setOpen] = useState(false);
  const subs = getStoredSubs(problemId);
  if (subs.length === 0) return null;

  function fmtTime(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={{ marginTop: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.45rem 0.75rem', background: 'var(--surface-2)', border: 'none',
          cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 500,
        }}
      >
        <span>Past attempts ({subs.length})</span>
        <span style={{ fontSize: '0.62rem', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: 220, overflowY: 'auto' }}>
          {subs.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.45rem',
              padding: '0.4rem 0.5rem', background: 'var(--surface)', borderRadius: '4px',
              border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: s.passed ? 'var(--green)' : 'var(--red)', flexShrink: 0, marginTop: '1px' }}>
                {s.passed ? '✓' : '✗'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{fmtTime(s.ts)}</div>
                <pre style={{ margin: 0, fontSize: '0.67rem', fontFamily: 'monospace', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflow: 'hidden', maxHeight: 56, lineHeight: 1.4 }}>
                  {s.query.length > 200 ? s.query.slice(0, 200) + '…' : s.query}
                </pre>
              </div>
              <button
                onClick={() => onRestore(s.query)}
                style={{
                  flexShrink: 0, padding: '2px 7px', borderRadius: '4px', fontSize: '0.62rem',
                  fontWeight: 600, background: 'var(--surface-2)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >Restore</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Study Plan Modal ─────────────────────────────────────────────────────────
const PLAN_KEY_SQL = 'pal-sql-lab-plan-v1';

const PLAN_TOTALS = {
  '3':  { casual: 4,  steady: 9,  intensive: 15 },
  '7':  { casual: 10, steady: 21, intensive: 35 },
  '14': { casual: 18, steady: 35, intensive: 56 },
  '30': { casual: 30, steady: 70, intensive: 120 },
};

function StudyPlanModal({ solved, onClose, onApply }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('interview');
  const [days, setDays] = useState('7');
  const [intensity, setIntensity] = useState('steady');
  const [plan, setPlan] = useState(null);

  function generatePlan() {
    const total = (PLAN_TOTALS[days] || PLAN_TOTALS['7'])[intensity] || 21;
    const unsolved = SORTED_PROBLEMS.filter(p => !solved.has(p.id) && p.difficulty !== 'Master');
    const selected = unsolved.slice(0, total);
    const daysNum = parseInt(days, 10);
    const perDay = Math.ceil(total / daysNum);
    const dailyPlan = [];
    for (let d = 0; d < daysNum; d++) {
      const chunk = selected.slice(d * perDay, (d + 1) * perDay);
      if (chunk.length > 0) dailyPlan.push({ day: d + 1, problems: chunk });
    }
    const result = { goal, days, intensity, generatedAt: Date.now(), dailyPlan };
    try { localStorage.setItem(PLAN_KEY_SQL, JSON.stringify(result)); } catch {}
    setPlan(result);
    setStep(4);
    if (onApply) onApply(result);
  }

  const overlayStyle = { position: 'fixed', inset: 0, background: 'var(--overlay)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' };
  const modalStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', width: '100%', maxWidth: 480, padding: '1.75rem', boxShadow: 'var(--shadow-lg)' };
  const labelStyle = { fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' };
  const chipBase = { border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.75rem', fontSize: '0.82rem', cursor: 'pointer', background: 'var(--surface-2)', color: 'var(--text-muted)', fontWeight: 500, transition: 'all 0.1s' };
  const chipActive = { ...chipBase, border: '2px solid var(--teal)', background: 'var(--teal-bg)', color: 'var(--teal)', fontWeight: 700 };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        {step < 4 ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' }}>Build your SQL study plan</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Step {step + 1} of 4</div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem' }}>✕</button>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: '1.5rem', overflow: 'hidden' }}>
              <div style={{ width: `${((step + 1) / 4) * 100}%`, height: '100%', background: 'var(--teal)', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>

            {step === 0 && (
              <div>
                <label style={labelStyle}>Why are you practicing SQL?</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {[['interview', 'I have an interview coming up'], ['upskill', 'I want to get better at SQL'], ['practice', 'Just keeping my skills sharp']].map(([val, lbl]) => (
                    <button key={val} onClick={() => setGoal(val)} style={goal === val ? chipActive : chipBase}>{lbl}</button>
                  ))}
                </div>
              </div>
            )}
            {step === 1 && (
              <div>
                <label style={labelStyle}>How many days do you have?</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[['3', '3 days'], ['7', '1 week'], ['14', '2 weeks'], ['30', '1 month']].map(([val, lbl]) => (
                    <button key={val} onClick={() => setDays(val)} style={days === val ? chipActive : chipBase}>{lbl}</button>
                  ))}
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <label style={labelStyle}>How much time per day?</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {[['casual', 'Casual — ~30 min/day'], ['steady', 'Steady — ~60 min/day'], ['intensive', 'Intensive — ~2 hrs/day']].map(([val, lbl]) => (
                    <button key={val} onClick={() => setIntensity(val)} style={intensity === val ? chipActive : chipBase}>{lbl}</button>
                  ))}
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
                <label style={labelStyle}>Confirm your plan</label>
                <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}>
                  <strong>{(PLAN_TOTALS[days] || PLAN_TOTALS['7'])[intensity]}</strong> problems over <strong>{days === '30' ? '1 month' : days + ' days'}</strong> at <strong>{intensity}</strong> pace.
                  Skipping <strong>{[...solved].length}</strong> already-solved problems.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button onClick={step === 0 ? onClose : () => setStep(s => s - 1)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.45rem 0.9rem', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {step === 0 ? 'Cancel' : '← Back'}
              </button>
              <button onClick={step === 3 ? generatePlan : () => setStep(s => s + 1)} style={{ background: 'var(--teal)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.45rem 1.1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                {step === 3 ? 'Generate Plan →' : 'Next →'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--teal)' }}>Your plan is ready</div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {(plan?.dailyPlan || []).map(d => (
                <div key={d.day} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.9rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--teal)', marginBottom: '0.3rem' }}>Day {d.day}</div>
                  {d.problems.map(p => (
                    <div key={p.id} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '0.1rem 0' }}>
                      ▸ {p.title} <span style={{ color: DIFF_COLOR[p.difficulty]?.text, fontSize: '0.68rem', fontWeight: 600 }}>{p.difficulty}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button onClick={onClose} style={{ width: '100%', background: 'var(--teal)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.55rem', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}>
              Start practicing →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function SqlLabPage({ onBack, initialProblemId, onProblemChange }) {
  const [mode, setMode] = useState(initialProblemId ? 'solve' : 'browse');
  const [problemIdx, setProblemIdx] = useState(function () {
    if (initialProblemId) {
      var idx = SORTED_PROBLEMS.findIndex(function (p) { return p.id === initialProblemId; });
      if (idx >= 0) return idx;
    }
    return 0;
  });
  const [db, setDb] = useState(null);
  const [sqlLoading, setSqlLoading] = useState(true);
  const [sqlError, setSqlError] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [runError, setRunError] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(true);
  const [hasRun, setHasRun] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [hintsShown, setHintsShown] = useState(0);
  const timerRef = useRef(null);
  const timerStartRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [solved, setSolved] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('pal-sql-lab-solved-v1') || '[]');
      return new Set(stored);
    } catch { return new Set(); }
  });
  const [expectedSample, setExpectedSample] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const dbRef = useRef(null);

  // Lock body scroll while SQL Lab is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const problem = SORTED_PROBLEMS[problemIdx];
  const dm = problem ? datamarts[problem.datamartId] : null;
  const diffStyle = problem ? (DIFF_COLOR[problem.difficulty] || DIFF_COLOR.Easy) : DIFF_COLOR.Easy;

  // Notify parent of problem changes for hash routing
  useEffect(() => {
    if (onProblemChange && problem) onProblemChange(problem.id);
  }, [problemIdx]);

  // Mark solved on correct answer + save elapsed time + fire analytics + record streak date
  useEffect(() => {
    if (correct !== true || !problem) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const elapsed = timerStartRef.current ? Math.round((Date.now() - timerStartRef.current) / 1000) : 0;
    if (timerStartRef.current) {
      try {
        const stored = JSON.parse(localStorage.getItem('pal-sql-lab-times-v1') || '{}');
        stored[problem.id] = elapsed;
        localStorage.setItem('pal-sql-lab-times-v1', JSON.stringify(stored));
      } catch {}
    }
    try {
      const today = new Date().toISOString().slice(0, 10);
      const dateDiary = JSON.parse(localStorage.getItem('pal-sql-lab-dates-v1') || '{}');
      dateDiary[today] = (dateDiary[today] || 0) + 1;
      localStorage.setItem('pal-sql-lab-dates-v1', JSON.stringify(dateDiary));
    } catch {}
    track('sql_problem_solved', { problemId: problem.id, difficulty: problem.difficulty, datamartId: problem.datamartId, elapsedSec: elapsed });
    setSolved(prev => {
      const next = new Set(prev);
      next.add(problem.id);
      try { localStorage.setItem('pal-sql-lab-solved-v1', JSON.stringify([...next])); } catch {}
      return next;
    });
  }, [correct]);

  // Re-init DB on problem change + restore saved query
  useEffect(() => {
    if (!problem || !dm) return;
    let cancelled = false;
    setSqlLoading(true);
    setSqlError(null);
    setResults(null);
    setRunError(null);
    setRevealed(false);
    setHasRun(false);
    setCorrect(null);
    setQuery(getStoredQuery(problem.id));
    setExpectedSample(null);
    setHintsShown(0);
    setElapsedSec(0);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    timerStartRef.current = null;

    if (dbRef.current) {
      try { dbRef.current.close(); } catch {}
      dbRef.current = null;
      setDb(null);
    }

    async function initDb() {
      try {
        const sqlJsModule = await import('sql.js');
        const initSqlJs = sqlJsModule.default || sqlJsModule;
        if (cancelled) return;
        const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' });
        if (cancelled) return;
        const database = new SQL.Database();

        Object.entries(dm.tables).forEach(([tableName, table]) => {
          database.run(table.schema + ';');
          if (table.rows.length > 0) {
            const colCount = table.columns.length;
            const placeholders = '(' + Array(colCount).fill('?').join(',') + ')';
            const stmt = database.prepare(`INSERT INTO ${tableName} VALUES ${placeholders}`);
            table.rows.forEach(row => stmt.run(row));
            stmt.free();
          }
        });

        let sample = null;
        try {
          const solRes = database.exec(problem.solution);
          if (solRes.length > 0) {
            sample = { columns: solRes[0].columns, rows: solRes[0].values };
          }
        } catch {}

        if (cancelled) return;
        dbRef.current = database;
        setDb(database);
        setExpectedSample(sample);
        setSqlLoading(false);
      } catch (e) {
        if (!cancelled) {
          setSqlError('Failed to load SQL engine: ' + e.message);
          setSqlLoading(false);
        }
      }
    }

    initDb();
    return () => { cancelled = true; };
  }, [problemIdx]);

  function runQuery() {
    if (!dbRef.current || !query.trim() || !problem) return;
    try {
      const res = dbRef.current.exec(query);
      const resultData = res.length === 0
        ? { columns: [], rows: [] }
        : { columns: res[0].columns, rows: res[0].values };
      setResults(resultData);
      setRunError(null);
      setHasRun(true);
      const isCorrect = validateResults(resultData, problem, expectedSample);
      setCorrect(isCorrect);
      addStoredSub(problem.id, query, isCorrect);
    } catch (e) {
      setRunError(e.message);
      setResults(null);
      setHasRun(true);
      setCorrect(false);
      addStoredSub(problem.id, query, false);
    }
  }

  function sqlValuesMatch(expected, actual) {
    if (expected === null && actual === null) return true;
    if (expected === null || actual === null) return false;
    const eStr = String(expected);
    const aStr = String(actual);
    if (eStr === aStr) return true;
    const eNum = parseFloat(eStr);
    const aNum = parseFloat(aStr);
    if (!isNaN(eNum) && !isNaN(aNum)) return Math.abs(eNum - aNum) < 0.01;
    return false;
  }

  // Sort rows by a stable string key for order-insensitive comparison
  function sortRowsStable(rows) {
    return [...rows].sort(function(a, b) {
      var aKey = a.map(function(v) { return v === null ? '\x00' : String(v); }).join('\x01');
      var bKey = b.map(function(v) { return v === null ? '\x00' : String(v); }).join('\x01');
      return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
    });
  }

  // Compare two aligned row arrays (same length, same column mapping already applied)
  function rowArraysMatch(expRows, userRows, expCols, colIdx) {
    for (var ri = 0; ri < expRows.length; ri++) {
      for (var ci = 0; ci < expCols.length; ci++) {
        var col = expCols[ci];
        var userIdx = colIdx[col];
        if (userIdx === undefined) return false;
        if (!sqlValuesMatch(expRows[ri][ci], userRows[ri][userIdx])) return false;
      }
    }
    return true;
  }

  function validateResults(res, prob, expected) {
    if (!res || res.rows.length !== prob.expectedRowCount) return false;
    for (var col of prob.expectedColumns) {
      if (!res.columns.includes(col)) return false;
    }
    // Primary: compare against computed expected output (catches integer division, rounding bugs)
    if (expected && expected.columns && expected.rows && expected.rows.length === res.rows.length) {
      var colIdx = {};
      res.columns.forEach(function(c, i) { colIdx[c] = i; });
      // 1. Ordered comparison (respects ORDER BY)
      if (rowArraysMatch(expected.rows, res.rows, expected.columns, colIdx)) return true;
      // 2. Sort-tolerant comparison (correct data, different order is also accepted)
      var sortedExp = sortRowsStable(expected.rows);
      // Build user rows aligned to expected column order for sorting
      var alignedUserRows = res.rows.map(function(row) {
        return expected.columns.map(function(c) {
          var idx = colIdx[c];
          return idx !== undefined ? row[idx] : null;
        });
      });
      var sortedUser = sortRowsStable(alignedUserRows);
      if (rowArraysMatch(sortedExp, sortedUser, expected.columns, expected.columns.reduce(function(acc, c, i) { acc[c] = i; return acc; }, {}))) return true;
      return false;
    }
    // Fallback to checkValues if expected sample not yet loaded
    var colIdx2 = {};
    res.columns.forEach(function(c, i) { colIdx2[c] = i; });
    for (var check of prob.checkValues) {
      var match = res.rows.find(function(row) {
        return Object.entries(check).every(function(entry) {
          var c = entry[0]; var val = entry[1];
          var i = colIdx2[c];
          return i !== undefined && String(row[i]) === String(val);
        });
      });
      if (!match) return false;
    }
    return true;
  }

  function startTimer() {
    if (timerStartRef.current) return;
    timerStartRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSec(Math.round((Date.now() - timerStartRef.current) / 1000));
    }, 1000);
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runQuery();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.target;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newQ = el.value.substring(0, start) + '  ' + el.value.substring(end);
      setQuery(newQ);
      if (problem) saveQueryLS(problem.id, newQ);
      requestAnimationFrame(() => {
        el.selectionStart = start + 2;
        el.selectionEnd = start + 2;
      });
    }
  }

  if (!problem) return null;

  // ── Browse mode ──────────────────────────────────────────────────────────────
  if (mode === 'browse') {
    return (
      <>
        <SqlLabBrowserView
          onBack={onBack}
          onSelect={id => {
            const idx = SORTED_PROBLEMS.findIndex(p => p.id === id);
            if (idx >= 0) setProblemIdx(idx);
            setMode('solve');
          }}
          solved={solved}
          onShowPlan={() => setShowPlanModal(true)}
        />
        {showPlanModal && <StudyPlanModal solved={solved} onClose={() => setShowPlanModal(false)} onApply={() => setShowPlanModal(false)} />}
      </>
    );
  }

  // ── Solve mode ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* LEFT: problem info */}
      <div className="sql-lab-solve-left">

        {/* Nav bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem', flexShrink: 0 }}>
          <button
            onClick={() => setMode('browse')}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}
          >← Browse</button>
          <button
            onClick={() => setMode('browse')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ width: 24, height: 24, background: 'var(--teal)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: '#fff', fontWeight: 700 }}>{'<>'}</div>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--teal)' }}>SQL Lab</span>
          </button>
          <ShareLinkButton room="sql-lab" />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => { if (problemIdx > 0) setProblemIdx(problemIdx - 1); }}
              disabled={problemIdx === 0}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '4px', width: 26, height: 26, cursor: problemIdx > 0 ? 'pointer' : 'not-allowed', color: 'var(--text-muted)', opacity: problemIdx > 0 ? 1 : 0.35, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >‹</button>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', minWidth: 38, textAlign: 'center' }}>{problemIdx + 1}/{SORTED_PROBLEMS.length}</span>
            <button
              onClick={() => { if (problemIdx < SORTED_PROBLEMS.length - 1) setProblemIdx(problemIdx + 1); }}
              disabled={problemIdx === SORTED_PROBLEMS.length - 1}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '4px', width: 26, height: 26, cursor: problemIdx < SORTED_PROBLEMS.length - 1 ? 'pointer' : 'not-allowed', color: 'var(--text-muted)', opacity: problemIdx < SORTED_PROBLEMS.length - 1 ? 1 : 0.35, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >›</button>
          </div>
        </div>

        {/* Problem card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.15rem', borderLeft: '3px solid ' + diffStyle.text, marginBottom: '0.65rem' }}>
          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
            <Badge label={problem.difficulty} style={{ background: diffStyle.bg, color: diffStyle.text, borderColor: diffStyle.border }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {problem.companyDomain && (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${problem.companyDomain}&sz=32`}
                  alt={problem.company}
                  style={{ width: 14, height: 14, borderRadius: 2, objectFit: 'contain' }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <Badge label={problem.company} style={{ background: 'rgba(67,56,202,0.08)', color: 'var(--accent)', borderColor: 'rgba(67,56,202,0.2)' }} />
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {problem.roles.map(r => (
                <span key={r} style={{ fontSize: '0.62rem', color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '1px 6px', borderRadius: '4px' }}>{r}</span>
              ))}
            </div>
          </div>
          {/* Title */}
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.55rem', color: 'var(--text)', lineHeight: 1.3 }}>{problem.title}</h2>
          {/* Prompt */}
          <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-muted)', margin: 0 }}>{problem.prompt}</p>

          {/* Forensic broken query */}
          {problem.format === 'forensic' && (
            <div style={{ marginTop: '0.75rem', border: '1.5px solid rgba(234,88,12,0.45)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '0.35rem 0.75rem', background: 'rgba(234,88,12,0.12)', fontSize: '0.68rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(234,88,12,0.2)' }}>
                ⚠ Broken query — in production
              </div>
              <pre style={{ margin: 0, padding: '0.75rem', background: 'var(--surface-2)', fontSize: '0.8rem', fontFamily: 'monospace', lineHeight: 1.6, color: 'var(--text)', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{problem.brokenQuery}</pre>
              {problem.brokenOutputNote && (
                <div style={{ padding: '0.4rem 0.75rem', background: 'rgba(234,88,12,0.06)', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(234,88,12,0.15)', fontStyle: 'italic' }}>
                  {problem.brokenOutputNote}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Schema accordion */}
        <SchemaAccordion dm={dm} open={schemaOpen} onToggle={() => setSchemaOpen(o => !o)} />

        {/* Expected output */}
        <div style={{ marginTop: '0.65rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '0.4rem 0.75rem', background: 'var(--surface-2)', borderBottom: expectedSample ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected output</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--border)' }}>·</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{problem.expectedRowCount} row{problem.expectedRowCount !== 1 ? 's' : ''}</span>
            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginLeft: '0.2rem' }}>
              {problem.expectedColumns.map(col => (
                <span key={col} style={{ fontSize: '0.6rem', fontFamily: 'monospace', padding: '1px 5px', borderRadius: '3px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--teal)' }}>{col}</span>
              ))}
            </div>
          </div>
          {expectedSample && (
            <div style={{ overflowX: 'auto', maxHeight: 180, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr style={{ background: 'var(--surface)' }}>
                    {expectedSample.columns.map(col => (
                      <th key={col} style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600, fontSize: '0.63rem', color: 'var(--teal)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expectedSample.rows.map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: ri < expectedSample.rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{ padding: '3px 8px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {cell === null ? <span style={{ color: 'var(--border)', fontStyle: 'italic' }}>NULL</span> : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SQLite note */}
        {problem.sqliteNote && (
          <div style={{ marginTop: '0.55rem', padding: '0.4rem 0.6rem', borderRadius: '4px', background: 'var(--surface-2)', fontSize: '0.7rem', color: 'var(--text-muted)', borderLeft: '2px solid var(--teal)' }}>
            {problem.sqliteNote}
          </div>
        )}

        {/* Submissions history */}
        <SubmissionsHistory
          problemId={problem.id}
          onRestore={q => { setQuery(q); saveQueryLS(problem.id, q); }}
        />

        {/* Hints + Show Solution (pre-reveal) OR Solution + Debrief (post-reveal) */}
        {!revealed ? (() => {
          var maxH = ({ Easy: 1, Medium: 2, Hard: 5, Master: 5 })[problem.difficulty] || 1;
          var availableHints = (problem.hints || []).length;
          var hintCap = Math.min(maxH, availableHints);
          var allExhausted = hintsShown >= hintCap;
          return (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {availableHints > 0 && !allExhausted && (
                <button
                  onClick={function() { track('sql_hint_used', { problemId: problem.id, hintIndex: hintsShown + 1, difficulty: problem.difficulty }); setHintsShown(function(n) { return Math.min(n + 1, hintCap); }); }}
                  style={{
                    alignSelf: 'flex-start', padding: '0.4rem 0.85rem', borderRadius: '6px',
                    fontWeight: 500, fontSize: '0.78rem',
                    background: 'rgba(20,184,166,0.08)', color: 'var(--teal)',
                    border: '1px solid rgba(20,184,166,0.25)', cursor: 'pointer',
                  }}
                >Hint {hintsShown + 1} of {hintCap}</button>
              )}
              {hintsShown > 0 && problem.hints && (
                <>
                  {problem.hints.slice(0, hintsShown).map(function(h, i) {
                    return (
                      <div key={i} style={{
                        padding: '0.55rem 0.75rem', background: 'rgba(20,184,166,0.06)',
                        border: '1px solid rgba(20,184,166,0.2)', borderRadius: '6px',
                        borderLeft: '3px solid var(--teal)',
                        fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55,
                      }}>
                        <span style={{ fontWeight: 700, color: 'var(--teal)', marginRight: '0.4rem' }}>Hint {i + 1}:</span>
                        {h}
                      </div>
                    );
                  })}
                  {problem.tags && problem.tags.length > 0 && (
                    <div style={{
                      padding: '0.45rem 0.75rem', background: 'var(--surface-2)',
                      border: '1px solid var(--border)', borderRadius: '6px',
                      fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex',
                      alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>Concepts:</span>
                      {problem.tags.map(function(t) {
                        return (
                          <span key={t} style={{
                            padding: '1px 7px', borderRadius: '4px', fontSize: '0.72rem',
                            background: 'var(--surface)', border: '1px solid var(--border)',
                            color: 'var(--text-muted)',
                          }}>{t}</span>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
              {hintsShown >= 1 && (
                <button
                  onClick={function() { track('sql_answer_revealed', { problemId: problem.id, difficulty: problem.difficulty }); setRevealed(true); }}
                  style={{
                    alignSelf: 'flex-start', marginTop: '0.2rem', padding: '0.4rem 0.85rem',
                    borderRadius: '6px', fontWeight: 500, fontSize: '0.78rem',
                    background: 'none', color: 'var(--text-muted)',
                    border: '1px solid var(--border)', cursor: 'pointer',
                  }}
                >Show Solution</button>
              )}
            </div>
          );
        })() : (
          /* Solution + debrief shown after reveal */
          <div className="pal-reveal-in" style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {/* Solution code */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '0.4rem 0.75rem', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Solution</div>
              <pre style={{
                margin: 0, padding: '0.75rem', background: 'var(--surface-2)', fontSize: '0.8rem',
                fontFamily: 'monospace', lineHeight: 1.6, color: 'var(--text)',
                overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>{problem.solution}</pre>
            </div>
            {/* Debrief blocks */}
            {problem.debrief && (
              <div style={{
                borderLeft: '3px solid rgba(232,160,51,0.6)',
                background: 'rgba(232,160,51,0.05)',
                borderRadius: '0 8px 8px 0',
                padding: '0.85rem 1rem',
                fontSize: '0.83rem', lineHeight: 1.65, color: 'var(--text)',
              }}>
                <DebriefPanel text={problem.debrief} />
              </div>
            )}
            {/* Next problem button */}
            <button
              className={correct === true ? 'pal-glow-pulse' : ''}
              onClick={function() {
                var next = SORTED_PROBLEMS.findIndex(function(p, i) { return i > problemIdx && !solved.has(p.id); });
                if (next !== -1) setProblemIdx(next);
              }}
              style={{
                alignSelf: 'flex-start', padding: '0.5rem 1.1rem', borderRadius: '6px',
                fontWeight: 600, fontSize: '0.82rem',
                background: correct === true ? 'var(--teal)' : 'var(--surface)',
                color: correct === true ? '#fff' : 'var(--text-muted)',
                border: correct === true ? 'none' : '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >Next Problem →</button>
          </div>
        )}

        <div style={{ height: '1.5rem' }} />
      </div>

      {/* RIGHT: editor */}
      <div className="sql-lab-solve-right">

        {/* Timer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexShrink: 0 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {elapsedSec > 0
              ? `⏱ ${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, '0')} elapsed`
              : `⏱ ~${problem.estimatedMin} min`
            }{' · Ctrl+Enter to run'}
          </div>
          <button
            onClick={() => setShowPlanModal(true)}
            style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--teal)', cursor: 'pointer' }}
          >Study Plan</button>
        </div>

        {/* SQL engine loading/error */}
        {sqlLoading && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Loading SQL engine…
          </div>
        )}
        {sqlError && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', fontSize: '0.8rem', color: 'var(--red)' }}>
            {sqlError}
          </div>
        )}

        {!sqlLoading && !sqlError && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <textarea
              value={query}
              onChange={e => {
                startTimer();
                setQuery(e.target.value);
                if (problem) saveQueryLS(problem.id, e.target.value);
              }}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              placeholder={problem.format === 'forensic' ? '-- Write the corrected query here\n-- Ctrl+Enter to run' : '-- Write your SQL here\n-- Ctrl+Enter to run'}
              style={{
                width: '100%', minHeight: 'calc(100vh - 180px)', resize: 'vertical', fontFamily: 'monospace',
                fontSize: '0.82rem', lineHeight: 1.6, padding: '0.75rem',
                background: 'var(--surface-2)', border: '1px solid rgba(20,184,166,0.3)',
                borderRadius: '6px', color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
              }}
            />

            {/* Buttons row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={runQuery}
                disabled={!query.trim()}
                style={{
                  padding: '0.45rem 1rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem',
                  background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer',
                  opacity: query.trim() ? 1 : 0.4,
                }}
              >▶ Run</button>
              {hasRun && correct === true && (
                <span className="pal-success-ring" style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>✓ Correct — well done</span>
              )}
              {hasRun && correct === false && !runError && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Output does not match — check row count or column names</span>
              )}
            </div>

            {/* Run error */}
            {runError && (
              <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--red)', fontFamily: 'monospace' }}>
                {runError}
              </div>
            )}

            {/* Results */}
            {results && !runError && (
              <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '4px 10px', background: 'var(--surface-2)', fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  {results.rows.length} row{results.rows.length !== 1 ? 's' : ''}
                </div>
                <ResultsTable results={results} />
              </div>
            )}
          </div>
        )}

        <div style={{ height: '1.5rem' }} />
      </div>

      {showPlanModal && <StudyPlanModal solved={solved} onClose={() => setShowPlanModal(false)} onApply={() => setShowPlanModal(false)} />}
    </>
  );
}
