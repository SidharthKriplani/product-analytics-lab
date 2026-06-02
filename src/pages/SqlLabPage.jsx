import { useState, useEffect, useRef, useCallback } from 'react';
import { sqlLabProblems } from '../data/sqlLabProblems.js';
import { datamarts } from '../data/sqlLabDatamarts.js';
import { track } from '../utils/analytics.js';

const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2, Master: 3, Forensic: 5 };

function renderDebrief(text) {
  if (!text) return null;
  return text.split('\n\n').map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} style={{ margin: i === 0 ? 0 : '0.6rem 0 0 0' }}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part
        )}
      </p>
    );
  });
}

const SORTED_PROBLEMS = [...sqlLabProblems].sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);

const DIFF_COLOR = {
  Easy:     { bg: 'var(--green-bg,  rgba(16,185,129,0.08))',  text: 'var(--green)',  border: 'var(--green-border,  rgba(16,185,129,0.25))' },
  Medium:   { bg: 'var(--yellow-bg, rgba(245,158,11,0.08))',  text: 'var(--yellow)', border: 'var(--yellow-border, rgba(245,158,11,0.25))' },
  Hard:     { bg: 'var(--red-bg,    rgba(239,68,68,0.08))',   text: 'var(--red)',    border: 'var(--red-border,    rgba(239,68,68,0.25))' },
  Master:   { bg: 'var(--purple-bg, rgba(139,92,246,0.08))',  text: 'var(--purple)', border: 'var(--purple-border, rgba(139,92,246,0.25))' },
  Forensic: { bg: 'rgba(234,88,12,0.10)',                     text: '#ea580c',       border: 'rgba(234,88,12,0.35)' },
};

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
        <div style={{ padding: '0.6rem 0.75rem', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
          {Object.entries(dm.tables).map(([tableName, table]) => (
            <div key={tableName}>
              <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', marginBottom: '4px' }}>
                {tableName}
              </div>
              {table.columns.map(col => (
                <div key={col.name} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', padding: '1px 0', fontSize: '0.72rem' }}>
                  <span style={{ color: 'var(--text)', fontFamily: 'monospace', minWidth: 140 }}>{col.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.67rem' }}>{col.type}</span>
                </div>
              ))}
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

function SidebarProblemBtn({ p, globalIdx, isCurrent, isSolved, onSelect }) {
  const ds = DIFF_COLOR[p.difficulty] || DIFF_COLOR.Easy;
  return (
    <button
      onClick={() => onSelect(globalIdx)}
      style={{
        width: '100%', display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
        padding: '0.6rem 0.875rem', border: 'none', borderBottom: '1px solid var(--border)',
        background: isCurrent ? 'rgba(20,184,166,0.08)' : 'transparent',
        cursor: 'pointer', textAlign: 'left',
        borderLeft: isCurrent ? '3px solid var(--teal)' : '3px solid transparent',
        transition: 'background 0.15s',
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 2,
        background: isSolved ? 'var(--green)' : 'transparent',
        border: isSolved ? 'none' : '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.55rem', color: '#fff', fontWeight: 700,
      }}>
        {isSolved ? '✓' : ''}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.78rem', fontWeight: isCurrent ? 600 : 400, lineHeight: 1.4, marginBottom: '2px',
          color: isCurrent ? 'var(--teal)' : 'var(--text-muted)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {globalIdx + 1}. {p.title}
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: ds.text }}>{p.difficulty}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--border)' }}>·</span>
          {p.companyDomain ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${p.companyDomain}&sz=32`}
              alt={p.company}
              style={{ width: 12, height: 12, borderRadius: 2, objectFit: 'contain', verticalAlign: 'middle' }}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          ) : null}
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{p.company}</span>
        </div>
      </div>
    </button>
  );
}

const DATAMARTS = ['all', ...new Set(sqlLabProblems.map(p => p.datamartId))];

function ProblemSidebar({ problems, currentIdx, solved, filterDiff, onFilterDiff, filterDatamart, onFilterDatamart, onSelect }) {
  const nonMaster = problems.filter(p => p.difficulty !== 'Master');
  const masterProblems = problems.filter(p => p.difficulty === 'Master');
  const filtered = (filterDiff === 'Master'
    ? masterProblems
    : nonMaster.filter(p => !filterDiff || p.difficulty === filterDiff)
  ).filter(p => filterDatamart === 'all' || p.datamartId === filterDatamart);
  const solvedCount = problems.filter(p => solved.has(p.id)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Progress */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.875rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Progress</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--teal)' }}>{solvedCount}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/ {problems.length} solved</span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${solvedCount / problems.length * 100}%`, background: 'var(--teal)', borderRadius: 99, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Difficulty filter */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.875rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Difficulty</div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {[null, 'Easy', 'Medium', 'Hard', 'Master', 'Forensic'].map(d => {
            const label = d || 'All';
            const active = filterDiff === d;
            const ds = d ? DIFF_COLOR[d] : null;
            return (
              <button
                key={label}
                onClick={() => onFilterDiff(active ? null : d)}
                style={{
                  padding: '3px 10px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600,
                  cursor: 'pointer', border: '1px solid',
                  background: active ? (ds ? ds.bg : 'rgba(20,184,166,0.1)') : 'var(--surface-2)',
                  color: active ? (ds ? ds.text : 'var(--teal)') : 'var(--text-muted)',
                  borderColor: active ? (ds ? ds.border : 'rgba(20,184,166,0.3)') : 'var(--border)',
                }}
              >{label}</button>
            );
          })}
        </div>
      </div>

      {/* Datamart filter */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.875rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Company</div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {DATAMARTS.map(dm => {
            const active = filterDatamart === dm;
            const count = dm === 'all' ? problems.length : problems.filter(p => p.datamartId === dm).length;
            const label = dm === 'all' ? ('All (' + count + ')') : (dm + ' (' + count + ')');
            return (
              <button
                key={dm}
                onClick={() => onFilterDatamart(active && dm !== 'all' ? 'all' : dm)}
                style={{
                  padding: '3px 9px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600,
                  cursor: 'pointer', border: '1px solid',
                  background: active ? 'rgba(20,184,166,0.1)' : 'var(--surface-2)',
                  color: active ? 'var(--teal)' : 'var(--text-muted)',
                  borderColor: active ? 'rgba(20,184,166,0.3)' : 'var(--border)',
                }}
              >{label}</button>
            );
          })}
        </div>
      </div>

      {/* Problem list */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '0.5rem 0.875rem', borderBottom: '1px solid var(--border)', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {filtered.length} problem{filtered.length !== 1 ? 's' : ''}
        </div>
        {filtered.map(p => {
          const globalIdx = problems.findIndex(x => x.id === p.id);
          return (
            <SidebarProblemBtn
              key={p.id} p={p} globalIdx={globalIdx}
              isCurrent={globalIdx === currentIdx}
              isSolved={solved.has(p.id)}
              onSelect={onSelect}
            />
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>No problems match</div>
        )}
      </div>

      {/* Challenge Vault — Master problems (hidden when Master filter is active, they show in main list) */}
      {masterProblems.filter(p => filterDatamart === 'all' || p.datamartId === filterDatamart).length > 0 && filterDiff !== 'Master' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--purple-border, rgba(139,92,246,0.25))', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '0.5rem 0.875rem', borderBottom: '1px solid var(--border)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--purple, #8b5cf6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Challenge Vault
          </div>
          {masterProblems.filter(p => filterDatamart === 'all' || p.datamartId === filterDatamart).map(p => {
            const globalIdx = problems.findIndex(x => x.id === p.id);
            return (
              <SidebarProblemBtn
                key={p.id} p={p} globalIdx={globalIdx}
                isCurrent={globalIdx === currentIdx}
                isSolved={solved.has(p.id)}
                onSelect={onSelect}
              />
            );
          })}
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

export function SqlLabPage({ onBack }) {
  const [problemIdx, setProblemIdx] = useState(0);
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
  const [filterDiff, setFilterDiff] = useState(null);
  const [filterDatamart, setFilterDatamart] = useState('all');
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
    // Record solve date for heatmap
    try {
      const today = new Date().toISOString().slice(0, 10);
      const dateDiary = JSON.parse(localStorage.getItem('pal-sql-lab-dates-v1') || '{}');
      dateDiary[today] = (dateDiary[today] || 0) + 1;
      localStorage.setItem('pal-sql-lab-dates-v1', JSON.stringify(dateDiary));
    } catch {}
    // Analytics
    track('sql_problem_solved', { problemId: problem.id, difficulty: problem.difficulty, datamartId: problem.datamartId, elapsedSec: elapsed });
    setSolved(prev => {
      const next = new Set(prev);
      next.add(problem.id);
      try { localStorage.setItem('pal-sql-lab-solved-v1', JSON.stringify([...next])); } catch {}
      return next;
    });
  }, [correct]);

  // Re-init DB on problem change
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
    setQuery('');
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

        // Create tables and insert seed data via prepared statements
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

        // Silently run solution to populate expected output sample
        let sample = null;
        try {
          const solRes = database.exec(problem.solution);
          if (solRes.length > 0) {
            sample = { columns: solRes[0].columns, rows: solRes[0].values.slice(0, 3) };
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
      setCorrect(validateResults(resultData, problem));
    } catch (e) {
      setRunError(e.message);
      setResults(null);
      setHasRun(true);
      setCorrect(false);
    }
  }

  function validateResults(res, prob) {
    if (!res || res.rows.length !== prob.expectedRowCount) return false;
    for (const expected of prob.expectedColumns) {
      if (!res.columns.includes(expected)) return false;
    }
    const colIdx = {};
    res.columns.forEach((col, i) => { colIdx[col] = i; });
    for (const check of prob.checkValues) {
      const match = res.rows.find(row =>
        Object.entries(check).every(([col, val]) => {
          const i = colIdx[col];
          return i !== undefined && String(row[i]) === String(val);
        })
      );
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
      setQuery(el.value.substring(0, start) + '  ' + el.value.substring(end));
      requestAnimationFrame(() => {
        el.selectionStart = start + 2;
        el.selectionEnd = start + 2;
      });
    }
  }

  if (!problem) return null;

  return (
    <>
    <div className="sql-lab-main-panel">

      {/* Header — never scrolls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 28, height: 28, background: 'var(--teal)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>{'<>'}</div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--teal)', letterSpacing: '-0.02em' }}>SQL Lab</span>
        </div>
        <button
          onClick={() => setShowPlanModal(true)}
          style={{ marginLeft: 'auto', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--teal)', cursor: 'pointer' }}
        >
          Study Plan
        </button>
      </div>
      {showPlanModal && <StudyPlanModal solved={solved} onClose={() => setShowPlanModal(false)} onApply={() => setShowPlanModal(false)} />}

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1.5rem' }}>

          {/* Problem card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', borderLeft: '3px solid ' + diffStyle.text }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <Badge label={problem.difficulty} style={{ background: diffStyle.bg, color: diffStyle.text, borderColor: diffStyle.border }} />
              {problem.tags.slice(0, 3).map(t => (
                <Badge key={t} label={t} style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', borderColor: 'var(--border)' }} />
              ))}
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
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {problem.roles.map(r => (
                  <span key={r} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '1px 6px', borderRadius: '4px' }}>{r}</span>
                ))}
              </div>
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.6rem', color: 'var(--text)' }}>{problem.title}</h2>
            <p style={{ fontSize: '0.83rem', lineHeight: 1.65, color: 'var(--text-muted)', margin: 0 }}>{problem.prompt}</p>

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

            <SchemaAccordion dm={dm} open={schemaOpen} onToggle={() => setSchemaOpen(o => !o)} />

            {/* Expected output */}
            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--surface-2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected output</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--border)' }}>·</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{problem.expectedRowCount} row{problem.expectedRowCount !== 1 ? 's' : ''}</span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginLeft: '0.25rem' }}>
                  {problem.expectedColumns.map(col => (
                    <span key={col} style={{ fontSize: '0.65rem', fontFamily: 'monospace', padding: '1px 6px', borderRadius: '3px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--teal)' }}>{col}</span>
                  ))}
                </div>
              </div>
              {expectedSample && (
                <div style={{ overflowX: 'auto', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface)' }}>
                        {expectedSample.columns.map(col => (
                          <th key={col} style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600, fontSize: '0.65rem', color: 'var(--teal)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{col}</th>
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
                  {problem.expectedRowCount > 3 && (
                    <div style={{ padding: '2px 8px', fontSize: '0.62rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                      +{problem.expectedRowCount - 3} more row{problem.expectedRowCount - 3 !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
            </div>

            {problem.sqliteNote && (
              <div style={{ marginTop: '0.6rem', padding: '0.4rem 0.6rem', borderRadius: '4px', background: 'var(--surface-2)', fontSize: '0.7rem', color: 'var(--text-muted)', borderLeft: '2px solid var(--teal)' }}>
                {problem.sqliteNote}
              </div>
            )}
            <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {elapsedSec > 0
                ? `⏱ ${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, '0')} elapsed`
                : `⏱ ~${problem.estimatedMin} min`
              } &nbsp;·&nbsp; Ctrl+Enter to run
            </div>
          </div>

          {/* Editor + results */}
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
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                value={query}
                onChange={e => { startTimer(); setQuery(e.target.value); }}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                placeholder={problem.format === 'forensic' ? '-- Write the corrected query here\n-- Ctrl+Enter to run' : '-- Write your SQL here\n-- Ctrl+Enter to run'}
                style={{
                  width: '100%', minHeight: 280, resize: 'vertical', fontFamily: 'monospace',
                  fontSize: '0.82rem', lineHeight: 1.6, padding: '0.75rem',
                  background: 'var(--surface-2)', border: '1px solid rgba(20,184,166,0.3)',
                  borderRadius: '6px', color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  onClick={runQuery}
                  disabled={!query.trim()}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem',
                    background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer',
                    opacity: query.trim() ? 1 : 0.4,
                  }}
                >
                  ▶ Run
                </button>
                {!revealed && (() => {
                  const maxH = { Easy: 1, Medium: 2, Hard: 5, Master: 5 }[problem.difficulty] || 1;
                  const availableHints = (problem.hints || []).length;
                  const hintCap = Math.min(maxH, availableHints);
                  const allExhausted = hintsShown >= hintCap;
                  return (
                    <>
                      {!allExhausted && (
                        <button
                          onClick={() => { track('sql_hint_used', { problemId: problem.id, hintIndex: hintsShown + 1, difficulty: problem.difficulty }); setHintsShown(n => Math.min(n + 1, hintCap)); }}
                          style={{
                            padding: '0.45rem 0.9rem', borderRadius: '6px', fontWeight: 500, fontSize: '0.78rem',
                            background: 'rgba(20,184,166,0.08)', color: 'var(--teal)',
                            border: '1px solid rgba(20,184,166,0.25)', cursor: 'pointer',
                          }}
                        >
                          Hint {hintsShown + 1} of {hintCap}
                        </button>
                      )}
                      {allExhausted && (
                        <button
                          onClick={() => { if (query.trim().length >= 50) { track('sql_answer_revealed', { problemId: problem.id, difficulty: problem.difficulty }); setRevealed(true); } }}
                          disabled={query.trim().length < 50}
                          title={query.trim().length < 50 ? ('Write ' + (50 - query.trim().length) + ' more char' + (50 - query.trim().length !== 1 ? 's' : '') + ' to unlock') : 'Show answer'}
                          style={{
                            padding: '0.45rem 0.9rem', borderRadius: '6px', fontWeight: 500, fontSize: '0.78rem',
                            background: 'none', color: 'var(--text-muted)', border: '1px solid var(--border)',
                            cursor: query.trim().length >= 50 ? 'pointer' : 'not-allowed',
                            opacity: query.trim().length >= 50 ? 1 : 0.35,
                          }}
                        >
                          Show answer
                        </button>
                      )}
                    </>
                  );
                })()}
                {hasRun && correct === true && (
                  <span className="pal-success-ring" style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>✓ Correct — well done</span>
                )}
                {hasRun && correct === false && !runError && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Output does not match — check row count or column names</span>
                )}
              </div>
              {hintsShown > 0 && problem.hints && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {problem.hints.slice(0, hintsShown).map((h, i) => (
                    <div key={i} style={{
                      padding: '0.55rem 0.75rem', background: 'rgba(20,184,166,0.06)',
                      border: '1px solid rgba(20,184,166,0.2)', borderRadius: '6px',
                      borderLeft: '3px solid var(--teal)',
                      fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55,
                    }}>
                      <span style={{ fontWeight: 700, color: 'var(--teal)', marginRight: '0.4rem' }}>Hint {i + 1}:</span>
                      {h}
                    </div>
                  ))}
                </div>
              )}
              {runError && (
                <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--red)', fontFamily: 'monospace' }}>
                  {runError}
                </div>
              )}
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

          {/* Debrief */}
          {revealed && (
            <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                borderLeft: '3px solid var(--discovery, #E8A033)',
                background: 'rgba(232,160,51,0.07)',
                borderRadius: '0 8px 8px 0',
                padding: '0.85rem 1rem',
                fontSize: '0.83rem', lineHeight: 1.65, color: 'var(--text)',
              }}>
                {renderDebrief(problem.debrief)}
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Model solution</div>
                <pre style={{
                  margin: 0, padding: '0.75rem', background: 'var(--surface-2)', borderRadius: '6px',
                  fontSize: '0.8rem', fontFamily: 'monospace', lineHeight: 1.6, color: 'var(--text)',
                  overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>{problem.solution}</pre>
                {correct === true && (
                  <button
                    className="pal-glow-pulse"
                    onClick={() => {
                      const next = SORTED_PROBLEMS.findIndex((p, i) => i > problemIdx && !solved.has(p.id));
                      if (next !== -1) setProblemIdx(next);
                    }}
                    style={{
                      marginTop: '0.75rem', padding: '0.5rem 1.25rem', borderRadius: '6px',
                      fontWeight: 600, fontSize: '0.82rem', background: 'var(--teal)',
                      color: '#fff', border: 'none', cursor: 'pointer',
                    }}
                  >
                    Next unsolved →
                  </button>
                )}
              </div>
            </div>
          )}
      </div>
    </div>

    {/* Problem list — independent fixed panel, scrolls on its own */}
    <div className="sql-lab-problem-panel">
      <ProblemSidebar
        problems={SORTED_PROBLEMS}
        currentIdx={problemIdx}
        solved={solved}
        filterDiff={filterDiff}
        onFilterDiff={setFilterDiff}
        filterDatamart={filterDatamart}
        onFilterDatamart={setFilterDatamart}
        onSelect={idx => setProblemIdx(idx)}
      />
    </div>
    </>
  );
}
