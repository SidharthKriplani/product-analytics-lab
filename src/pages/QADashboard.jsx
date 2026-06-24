// Product Analytics Lab — QA Dashboard
// V2.1 — Internal content audit + launch checklist tool
// Access: click "QA" in footer dev link, or navigate to page key 'qa'

import { useState, useMemo } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { statsModules } from '../data/statsModules.js';
import { metricCases } from '../data/metricCases.js';
import { designScenarios } from '../data/designScenarios.js';
import { scenarios } from '../data/scenarios.js';
import { rcaCases } from '../data/rcaCases.js';
import { businessCases } from '../data/businessCases.js';
import { learningPaths } from '../data/learningPaths.js';
import { concepts } from '../data/concepts.js';
import { runContentAudit, LS_KEYS } from '../utils/contentAudit.js';
import { lock, tryUnlock } from '../utils/unlock.js';

const ROOM_COLORS = {
  stats:   { color: 'var(--blue-text)',  bg: 'var(--blue-bg)',   border: 'var(--blue-border)' },
  metrics: { color: 'var(--green)',      bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  design:  { color: 'var(--teal)',       bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  review:  { color: 'var(--accent)',     bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  rca:     { color: 'var(--yellow)',     bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  cases:   { color: 'var(--purple)',     bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
};

const STATUS_COLORS = {
  pass:    { color: 'var(--green)',       bg: 'var(--green-bg)',   border: 'var(--green-border)' },
  warning: { color: 'var(--yellow)',      bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  fail:    { color: 'var(--red, #e53e3e)', bg: '#fff5f5',         border: '#fed7d7' },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.warning;
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-sm)', padding: '0.12rem 0.4rem',
    }}>{status}</span>
  );
}

function RoomBadge({ room }) {
  const c = ROOM_COLORS[room] || {};
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.35rem',
    }}>{room}</span>
  );
}

function Tick({ val }) {
  return <span style={{ fontSize: '0.8rem', color: val ? 'var(--green)' : 'var(--red, #e53e3e)' }}>{val ? <Icon name='check' size={13} color='currentColor' /> : <Icon name='x' size={13} color='currentColor' />}</span>;
}

function SectionHeader({ title, count, countColor }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.6rem 0', marginBottom: '0.75rem',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{title}</span>
      {count !== undefined && (
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: countColor || 'var(--text-dim)' }}>
          ({count})
        </span>
      )}
    </div>
  );
}

// ── Launch checklist items ───────────────────────────────────────────────────
const LAUNCH_ITEMS = [
  'Home page loads without errors',
  'Stats Room loads + all 8 modules reachable',
  'Metrics Room loads + all 6 cases reachable',
  'Design Room loads + all 8 scenarios reachable',
  'Review Room loads + all 12 scenarios reachable',
  'RCA Room loads + all 6 cases reachable',
  'Cases Room loads + all 4 cases reachable',
  'Beta unlock flow works (code: EXP-LAB-DEV-2026)',
  'Progress page loads with guided paths',
  'Judgment Bank shows 44 items with room filters',
  'Methodology page loads',
  'Light/dark theme toggle works',
  'Progress persists across page navigations',
  'Reset progress clears all rooms',
  'Mobile layout acceptable (narrow viewport)',
  'No console errors on initial load',
  'No console errors during gameplay',
  'README updated for V2.0',
  'Vercel deployment / build passes',
  'Git pushed to main',
];

export function QADashboard({ onNavigate, onOpenItem, unlocked, onUnlock, onLock, onResetAllProgress }) {
  const audit = useMemo(() => runContentAudit({
    statsModules, metricCases, designScenarios, scenarios,
    rcaCases, businessCases, learningPaths, concepts,
  }), []);

  const [activeTab, setActiveTab] = useState('summary');
  const [checkFilter, setCheckFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [launchChecks, setLaunchChecks] = useState(() => {
    try {
      const saved = localStorage.getItem('pal-qa-launch-checks');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [lsDisplay, setLsDisplay] = useState(null);

  function toggleLaunch(idx) {
    const updated = { ...launchChecks, [idx]: !launchChecks[idx] };
    setLaunchChecks(updated);
    try { localStorage.setItem('pal-qa-launch-checks', JSON.stringify(updated)); } catch {}
  }

  function exportLS() {
    const data = {};
    LS_KEYS.forEach(k => {
      try { data[k] = localStorage.getItem(k); } catch {}
    });
    setLsDisplay(JSON.stringify(data, null, 2));
    try { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); } catch {}
  }

  function handleResetAll() {
    if (window.confirm('Reset ALL progress across all 6 rooms? This cannot be undone.')) {
      onResetAllProgress();
    }
  }

  function handleUnlock() {
    tryUnlock('DAI2026');
    onUnlock();
  }

  function handleLock() {
    lock();
    onLock();
  }

  const filteredChecks = audit.checks.filter(c => checkFilter === 'all' || c.status === checkFilter);
  const filteredItems = audit.items.filter(i => roomFilter === 'all' || i.room === roomFilter);

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'checks', label: `Checks (${audit.summary.fail}F ${audit.summary.warning}W)` },
    { id: 'items', label: `Item Table (${audit.items.length})` },
    { id: 'paths', label: 'Guided Paths' },
    { id: 'tools', label: 'Dev Tools' },
    { id: 'launch', label: 'Launch Checklist' },
  ];

  return (
    <div className="pal-page-enter" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', margin: 0 }}>
            QA Dashboard
          </h1>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--yellow)', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
            borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.5rem',
          }}>Internal · V2.1</span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: 0 }}>
          Content audit, item review, guided path validation, and launch checklist.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'var(--surface-2)' : 'none',
              border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              padding: '0.5rem 0.9rem', marginBottom: '-1px',
              color: activeTab === tab.id ? 'var(--text)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 700 : 400,
              fontSize: '0.82rem', cursor: 'pointer', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* ── SUMMARY TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'summary' && (
        <div>
          {/* Count grid */}
          <SectionHeader title="Content Counts" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: '0.55rem', marginBottom: '1.75rem' }}>
            {[
              { label: 'Stats',   actual: audit.counts.stats,   expected: 8 },
              { label: 'Metrics', actual: audit.counts.metrics, expected: 6 },
              { label: 'Design',  actual: audit.counts.design,  expected: 8 },
              { label: 'Review',  actual: audit.counts.review,  expected: 12 },
              { label: 'RCA',     actual: audit.counts.rca,     expected: 6 },
              { label: 'Cases',   actual: audit.counts.cases,   expected: 4 },
              { label: 'Total',   actual: audit.counts.total,   expected: 44 },
              { label: 'Free',    actual: audit.counts.free,    expected: null },
              { label: 'Beta',    actual: audit.counts.beta,    expected: null },
            ].map(({ label, actual, expected }) => {
              const ok = expected === null || actual === expected;
              return (
                <div key={label} style={{
                  background: ok ? 'var(--surface)' : '#fff5f5',
                  border: `1px solid ${ok ? 'var(--border)' : '#fed7d7'}`,
                  borderRadius: 'var(--radius)', padding: '0.75rem 1rem',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: ok ? 'var(--text)' : 'var(--red, #e53e3e)', lineHeight: 1 }}>{actual}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</div>
                  {expected !== null && (
                    <div style={{ fontSize: '0.68rem', color: ok ? 'var(--green)' : 'var(--red, #e53e3e)', marginTop: '0.2rem' }}>
                      {ok
                        ? <><Icon name='check' size={11} color='currentColor' /> expected {expected}</>
                        : <><Icon name='x' size={11} color='currentColor' /> expected {expected}</>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Audit summary */}
          <SectionHeader title="Audit Summary" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(120px, 100%), 1fr))', gap: '0.55rem', marginBottom: '1.75rem', maxWidth: '420px' }}>
            {[
              { label: 'Pass',    val: audit.summary.pass,    color: 'var(--green)' },
              { label: 'Warning', val: audit.summary.warning, color: 'var(--yellow)' },
              { label: 'Fail',    val: audit.summary.fail,    color: 'var(--red, #e53e3e)' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Failing checks preview */}
          {audit.summary.fail > 0 && (
            <>
              <SectionHeader title="Failing Checks" count={audit.summary.fail} countColor="var(--red, #e53e3e)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                {audit.checks.filter(c => c.status === 'fail').map(c => (
                  <div key={c.id} style={{
                    background: '#fff5f5', border: '1px solid #fed7d7',
                    borderRadius: 'var(--radius)', padding: '0.65rem 0.9rem',
                    fontSize: '0.82rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: c.affected.length ? '0.35rem' : 0 }}>
                      <StatusBadge status="fail" />
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{c.name}</span>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>— {c.explanation}</span>
                    </div>
                    {c.affected.length > 0 && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace', paddingLeft: '0.2rem' }}>
                        {c.affected.join(' · ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {audit.summary.warning > 0 && (
            <>
              <SectionHeader title="Warnings" count={audit.summary.warning} countColor="var(--yellow)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {audit.checks.filter(c => c.status === 'warning').map(c => (
                  <div key={c.id} style={{
                    background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
                    borderRadius: 'var(--radius)', padding: '0.65rem 0.9rem', fontSize: '0.82rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: c.affected.length ? '0.35rem' : 0 }}>
                      <StatusBadge status="warning" />
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{c.name}</span>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>— {c.explanation}</span>
                    </div>
                    {c.affected.length > 0 && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace', paddingLeft: '0.2rem' }}>
                        {c.affected.join(' · ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CHECKS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'checks' && (
        <div>
          <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['all', 'fail', 'warning', 'pass'].map(f => (
              <button key={f} onClick={() => setCheckFilter(f)} style={{
                background: checkFilter === f ? 'var(--accent)' : 'var(--surface)',
                border: `1px solid ${checkFilter === f ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.6rem',
                color: checkFilter === f ? '#fff' : 'var(--text-muted)',
                fontSize: '0.78rem', fontWeight: checkFilter === f ? 700 : 400, cursor: 'pointer',
              }}>{f === 'all' ? `All (${audit.checks.length})` : `${f} (${audit.checks.filter(c => c.status === f).length})`}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {filteredChecks.map(c => (
              <div key={c.id} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '0.65rem 0.9rem',
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              }}>
                <StatusBadge status={c.status} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)', marginBottom: c.affected.length ? '0.2rem' : 0 }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{c.explanation}</div>
                  {c.affected.length > 0 && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                      {c.affected.slice(0, 8).join(' · ')}{c.affected.length > 8 ? ` +${c.affected.length - 8} more` : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ITEM TABLE TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'items' && (
        <div>
          <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['all', 'stats', 'metrics', 'design', 'review', 'rca', 'cases'].map(r => (
              <button key={r} onClick={() => setRoomFilter(r)} style={{
                background: roomFilter === r ? 'var(--accent)' : 'var(--surface)',
                border: `1px solid ${roomFilter === r ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.6rem',
                color: roomFilter === r ? '#fff' : 'var(--text-muted)',
                fontSize: '0.78rem', fontWeight: roomFilter === r ? 700 : 400, cursor: 'pointer',
              }}>{r === 'all' ? `All (${audit.items.length})` : r}</button>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['Room', 'ID', 'Title', 'Diff', 'Free', 'Concepts', 'Paired', 'Debrief', 'Mistakes', 'Phrase', 'Open'].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.65rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, i) => (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'transparent', borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.45rem 0.65rem' }}><RoomBadge room={item.room} /></td>
                    <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{item.id}</td>
                    <td style={{ padding: '0.45rem 0.65rem', color: 'var(--text)', fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</td>
                    <td style={{ padding: '0.45rem 0.65rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{item.difficulty}</td>
                    <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: item.isFree ? 'var(--accent)' : 'var(--teal)' }}>{item.isFree ? 'Free' : 'Beta'}</span>
                    </td>
                    <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center', color: item.linkedConceptsCount ? 'var(--text)' : 'var(--text-dim)' }}>{item.linkedConceptsCount}</td>
                    <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{item.pairedItem || '—'}</td>
                    <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center' }}><Tick val={item.hasSeniorDebrief} /></td>
                    <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center' }}><Tick val={item.hasCommonMistakes} /></td>
                    <td style={{ padding: '0.45rem 0.65rem', textAlign: 'center' }}><Tick val={item.hasInterviewPhrase} /></td>
                    <td style={{ padding: '0.45rem 0.65rem' }}>
                      <button
                        onClick={() => onOpenItem(item.room, item.id)}
                        style={{
                          background: 'var(--surface-2)', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.5rem',
                          fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >Open →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── GUIDED PATHS TAB ──────────────────────────────────────────────── */}
      {activeTab === 'paths' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {audit.paths.map(path => {
            const brokenItems = path.sequence.filter(i => !i.exists);
            return (
              <div key={path.id} style={{
                background: 'var(--surface)', border: `1px solid ${path.border || 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)', padding: '1.1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{path.title}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{path.sequence.length} items</span>
                  {brokenItems.length > 0
                    ? <StatusBadge status="fail" />
                    : <StatusBadge status="pass" />
                  }
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {path.sequence.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.3rem 0.5rem',
                      background: item.exists ? 'transparent' : '#fff5f5',
                      border: `1px solid ${item.exists ? 'transparent' : '#fed7d7'}`,
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', width: '1.2rem', flexShrink: 0 }}>{i + 1}.</span>
                      <RoomBadge room={item.room} />
                      <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: item.exists ? 'var(--text-dim)' : 'var(--red, #e53e3e)' }}>{item.itemId}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>{item.label}</span>
                      {item.isFree !== null && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: item.isFree ? 'var(--accent)' : 'var(--teal)', flexShrink: 0 }}>
                          {item.isFree ? 'Free' : 'Beta'}
                        </span>
                      )}
                      <Tick val={item.exists} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DEV TOOLS TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'tools' && (
        <div>
          <SectionHeader title="Progress Controls" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button onClick={handleResetAll} style={{
              background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontWeight: 600,
              color: 'var(--red, #c53030)', cursor: 'pointer',
            }}><Icon name='trash' size={13} color='currentColor' /> Reset all progress</button>
            <button onClick={handleUnlock} style={{
              background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontWeight: 600,
              color: 'var(--green)', cursor: 'pointer',
            }}><Icon name='unlock' size={13} color='currentColor' /> Force unlock beta</button>
            <button onClick={handleLock} style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontWeight: 600,
              color: 'var(--text-muted)', cursor: 'pointer',
            }}><Icon name='lock' size={13} color='currentColor' /> Lock / clear unlock</button>
            <button onClick={exportLS} style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontWeight: 600,
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}><Icon name='clipboard' size={13} color='currentColor' /> Export localStorage JSON</button>
          </div>

          <SectionHeader title="localStorage Keys" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1.5rem' }}>
            {LS_KEYS.map(key => {
              let val;
              try { val = localStorage.getItem(key); } catch {}
              return (
                <div key={key} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  padding: '0.4rem 0.65rem',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{key}</span>
                  <span style={{ fontSize: '0.72rem', color: val ? 'var(--green)' : 'var(--text-dim)', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {val ? val.slice(0, 80) + (val.length > 80 ? '…' : '') : '(not set)'}
                  </span>
                </div>
              );
            })}
          </div>

          {lsDisplay && (
            <>
              <SectionHeader title="Exported localStorage (copied to clipboard)" />
              <pre style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '0.75rem 1rem',
                fontSize: '0.72rem', fontFamily: 'monospace',
                overflowX: 'auto', color: 'var(--text-secondary)',
                maxHeight: '300px', overflow: 'auto',
              }}>{lsDisplay}</pre>
            </>
          )}

          <SectionHeader title="Current Status" />
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ padding: '0.5rem 0.9rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
              Beta unlocked: <strong style={{ color: unlocked ? 'var(--green)' : 'var(--text-dim)' }}>{unlocked ? 'yes' : 'no'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* ── LAUNCH CHECKLIST TAB ──────────────────────────────────────────── */}
      {activeTab === 'launch' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {Object.values(launchChecks).filter(Boolean).length} / {LAUNCH_ITEMS.length} checked
            </span>
            <div style={{
              flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden', maxWidth: '200px',
            }}>
              <div style={{
                height: '100%',
                width: `${(Object.values(launchChecks).filter(Boolean).length / LAUNCH_ITEMS.length) * 100}%`,
                background: 'var(--green)', borderRadius: '2px', transition: 'width 0.2s',
              }} />
            </div>
            <button
              onClick={() => { setLaunchChecks({}); try { localStorage.removeItem('pal-qa-launch-checks'); } catch {} }}
              style={{ fontSize: '0.72rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
            >Reset</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {LAUNCH_ITEMS.map((item, i) => (
              <label key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.55rem 0.75rem',
                background: launchChecks[i] ? 'var(--green-bg)' : 'var(--surface)',
                border: `1px solid ${launchChecks[i] ? 'var(--green-border)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                transition: 'background 0.1s, border-color 0.1s',
              }}>
                <input
                  type="checkbox"
                  checked={!!launchChecks[i]}
                  onChange={() => toggleLaunch(i)}
                  style={{ width: '14px', height: '14px', accentColor: 'var(--green)', flexShrink: 0 }}
                />
                <span style={{
                  fontSize: '0.82rem',
                  color: launchChecks[i] ? 'var(--green)' : 'var(--text-secondary)',
                  textDecoration: launchChecks[i] ? 'line-through' : 'none',
                }}>{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
