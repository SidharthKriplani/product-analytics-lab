import { useState } from 'react';
import { signOut } from '../utils/auth.js';
import { getBookmarks } from '../utils/bookmarks.js';
import { pushProgressToSupabase, pullProgressFromSupabase } from '../utils/syncProgress.js';

// ── Stats helpers ─────────────────────────────────────────────────────────────

const ROOM_CONFIGS = [
  { key: 'exp-lab-progress-v1',              name: 'Review',          type: 'attempts_array' },
  { key: 'pal-stats-progress-v1',            name: 'Stats',           type: 'attempts_num' },
  { key: 'pal-metrics-progress-v2',          name: 'Metrics',         type: 'attempts_num' },
  { key: 'pal-rca-progress-v2',              name: 'RCA',             type: 'attempts_num' },
  { key: 'pal-cases-progress-v2',            name: 'Cases',           type: 'attempts_num' },
  { key: 'pal-behavioral-progress-v1',       name: 'Behavioral',      type: 'rating' },
  { key: 'pal-estimation-progress-v1',       name: 'Estimation',      type: 'rating' },
  { key: 'pal-growth-analytics-progress-v1', name: 'Growth',          type: 'rating' },
  { key: 'pal-bi-progress-v1',               name: 'BI',              type: 'rating' },
  { key: 'pal-challenges-progress-v1',       name: 'Challenges',      type: 'completedAt' },
  { key: 'pal-stf-progress-v1',              name: 'Spot the Flaw',   type: 'completedAt' },
  { key: 'pal-takehome-progress-v1',         name: 'Take-Home',       type: 'completedAt' },
  { key: 'pal-instrumentation-progress-v1',  name: 'Instrumentation', type: 'completedAt' },
  { key: 'pal-code-progress-v1',             name: 'Code',            type: 'completedAt' },
  { key: 'pal-pri-progress-v1',              name: 'Prioritization',  type: 'completedAt' },
];

function countDone(data, type) {
  const vals = Object.values(data);
  if (type === 'attempts_array') return vals.filter(v => v.attempts && v.attempts.length > 0).length;
  if (type === 'attempts_num')   return vals.filter(v => v.attempts > 0).length;
  if (type === 'rating')         return vals.filter(v => v.rating).length;
  if (type === 'completedAt')    return vals.filter(v => v.completedAt).length;
  return 0;
}

function computeStats() {
  let totalCases = 0;
  let roomsActive = 0;
  const breakdown = [];

  for (const cfg of ROOM_CONFIGS) {
    try {
      const raw = localStorage.getItem(cfg.key);
      if (!raw) continue;
      const data = JSON.parse(raw);
      const done = countDone(data, cfg.type);
      if (done > 0) { totalCases += done; roomsActive++; breakdown.push({ name: cfg.name, done }); }
    } catch { /* skip */ }
  }

  // SQL Lab — stored as a plain object of { problemId: { solvedAt, ... } }
  try {
    const raw = localStorage.getItem('pal-sql-lab-solved-v1');
    if (raw) {
      const data = JSON.parse(raw);
      const done = Array.isArray(data) ? data.length : Object.keys(data).length;
      if (done > 0) { totalCases += done; roomsActive++; breakdown.push({ name: 'SQL Lab', done }); }
    }
  } catch { /* skip */ }

  return { totalCases, roomsActive, breakdown };
}

// ── User helpers ──────────────────────────────────────────────────────────────

function getProviderLabel(user) {
  const p = user?.app_metadata?.provider;
  if (p === 'google') return 'Google';
  if (p === 'github') return 'GitHub';
  return 'Email';
}

function getDisplayName(user) {
  return user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.user_metadata?.user_name
    || null;
}

function getMemberSince(user) {
  if (!user?.created_at) return null;
  try { return new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); }
  catch { return null; }
}

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
}

// ── Primitive subcomponents ───────────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '1.2rem 1.4rem',
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.85rem',
    }}>
      {children}
    </div>
  );
}

const btnBase = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: '6px', padding: '0.38rem 0.85rem',
  fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', cursor: 'pointer',
};

// ── Main export ───────────────────────────────────────────────────────────────

export function ProfilePage({ user, onNavigate, onShowAuth, theme, onToggleTheme }) {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | done | error

  // ── Not signed in ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="pal-page-enter" style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.2rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1.5rem' }}>Profile</h1>
        <Card>
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '0.4rem' }}>Sign in to see your profile</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.4rem' }}>
              Progress syncs across devices when you are signed in.
            </div>
            <button
              onClick={onShowAuth}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '7px', padding: '0.55rem 1.5rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              Sign in
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Derived data (only when signed in) ───────────────────────────────────────
  const stats       = computeStats();
  const bookmarks   = getBookmarks().slice(-4).reverse();
  const defensePlan = readJson('pal-defense-plan-v1');
  const sqlPlan     = readJson('pal-sql-lab-plan-v1');
  const displayName = getDisplayName(user);
  const avatarUrl   = user?.user_metadata?.avatar_url || null;
  const initials    = user?.email ? user.email[0].toUpperCase() : '?';
  const provider    = getProviderLabel(user);
  const memberSince = getMemberSince(user);

  async function handleSync() {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    try {
      await pushProgressToSupabase(user);
      await pullProgressFromSupabase(user);
      setSyncStatus('done');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }

  // ── Signed-in view ───────────────────────────────────────────────────────────
  return (
    <div className="pal-page-enter" style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.2rem' }}>
      <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1.5rem' }}>Profile</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* ── Identity ── */}
        <Card>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                />
              ) : (
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'var(--accent-bg, var(--surface-2))',
                  border: '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)',
                }}>
                  {initials}
                </div>
              )}
            </div>

            {/* Name + email + badges */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {displayName && (
                <div style={{
                  fontWeight: 800, fontSize: '1rem', color: 'var(--text)',
                  marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {displayName}
                </div>
              )}
              <div style={{
                fontSize: '0.83rem', color: 'var(--text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.45rem',
              }}>
                {user.email}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: '4px', padding: '0.15rem 0.45rem', color: 'var(--text-muted)',
                }}>
                  {provider}
                </span>
                {memberSince && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Member since {memberSince}
                  </span>
                )}
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={async () => { await signOut(); }}
              style={{ ...btnBase, flexShrink: 0, padding: '0.32rem 0.65rem', fontSize: '0.74rem' }}
            >
              Sign out
            </button>
          </div>
        </Card>

        {/* ── Practice stats ── */}
        <Card>
          <SectionLabel>Practice stats</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.65rem', marginBottom: '0.75rem' }}>
            {[
              { label: 'Cases done',    value: stats.totalCases },
              { label: 'Rooms active',  value: stats.roomsActive },
              { label: 'Bookmarks',     value: getBookmarks().length },
            ].map(s => (
              <div key={s.label} style={{
                textAlign: 'center', padding: '0.7rem 0.4rem',
                background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.28rem' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {stats.breakdown.length > 0 && (
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
              {stats.breakdown.map(r => (
                <span key={r.name} style={{
                  fontSize: '0.68rem', background: 'var(--surface-2)',
                  border: '1px solid var(--border)', borderRadius: '4px',
                  padding: '0.18rem 0.45rem', color: 'var(--text-muted)',
                }}>
                  {r.name} {r.done}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => onNavigate('progress')}
            style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
          >
            View full progress &rarr;
          </button>
        </Card>

        {/* ── Cross-device sync ── */}
        <Card>
          <SectionLabel>Cross-device sync</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-muted)', minWidth: '160px' }}>
              Syncs automatically on sign-in and when you leave the app.
              Manual sync pulls the latest from all your devices.
            </div>
            <button
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
              style={{
                ...btnBase,
                flexShrink: 0,
                background: syncStatus === 'done'  ? 'var(--green-bg, #d1fae5)'
                          : syncStatus === 'error' ? 'var(--red-bg, #fee2e2)'
                          : 'var(--surface-2)',
                color:      syncStatus === 'done'  ? 'var(--green, #059669)'
                          : syncStatus === 'error' ? 'var(--red, #dc2626)'
                          : 'var(--text)',
                opacity: syncStatus === 'syncing' ? 0.6 : 1,
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {syncStatus === 'syncing' ? 'Syncing...'
               : syncStatus === 'done'  ? 'Synced'
               : syncStatus === 'error' ? 'Error — retry'
               : 'Sync now'}
            </button>
          </div>
        </Card>

        {/* ── Study plans ── */}
        <Card>
          <SectionLabel>Study plans</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '0.7rem' }}>

            {/* Defense plan */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.9rem 1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.3rem' }}>Defense Strategy</div>
              {defensePlan && defensePlan.length > 0 ? (
                <>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.55rem' }}>
                    {defensePlan.length} step{defensePlan.length !== 1 ? 's' : ''} in your plan
                  </div>
                  <button
                    onClick={() => onNavigate('defense-doc')}
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Open plan &rarr;
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.55rem' }}>No plan yet</div>
                  <button
                    onClick={() => onNavigate('defense-doc')}
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Build one &rarr;
                  </button>
                </>
              )}
            </div>

            {/* SQL study plan */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.9rem 1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.3rem' }}>SQL Study Plan</div>
              {sqlPlan ? (
                <>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.55rem' }}>
                    {sqlPlan.goalLabel || 'Plan active'}{sqlPlan.dailyTarget ? ` · ${sqlPlan.dailyTarget} problems/day` : ''}
                  </div>
                  <button
                    onClick={() => onNavigate('sql-lab')}
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.76rem', color: 'var(--teal)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Open SQL Lab &rarr;
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.55rem' }}>No plan yet</div>
                  <button
                    onClick={() => onNavigate('sql-lab')}
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.76rem', color: 'var(--teal)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Set one up &rarr;
                  </button>
                </>
              )}
            </div>

          </div>
        </Card>

        {/* ── Saved cases ── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>
              Saved cases
            </div>
            <button
              onClick={() => onNavigate('bookmarks')}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
            >
              View all &rarr;
            </button>
          </div>

          {bookmarks.length === 0 ? (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              No saved cases yet. Bookmark cases while practicing to see them here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {bookmarks.map(b => (
                <div
                  key={b.room + b.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--surface-2)', borderRadius: '7px', border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.title || b.id}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{b.room}</div>
                  </div>
                  {b.difficulty && (
                    <span style={{
                      fontSize: '0.63rem', fontWeight: 600, flexShrink: 0, textTransform: 'capitalize',
                      padding: '0.14rem 0.4rem', borderRadius: '4px',
                      background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)',
                    }}>
                      {b.difficulty}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Settings ── */}
        <Card>
          <SectionLabel>Settings</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

            {/* Theme toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text)' }}>Theme</span>
              <button onClick={onToggleTheme} style={btnBase}>
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
            </div>

            {/* Export / Import */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.55rem' }}>
                Export your progress as JSON for backup or device handoff.
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const ALL_KEYS = [
                      'pal-stats-progress-v1', 'pal-metrics-progress-v2', 'pal-rca-progress-v2',
                      'pal-cases-progress-v2', 'pal-code-progress-v1', 'pal-behavioral-progress-v1',
                      'pal-estimation-progress-v1', 'pal-stat-foundations-progress-v1',
                      'pal-growth-analytics-progress-v1', 'pal-challenges-progress-v1',
                      'pal-bi-progress-v1', 'pal-stf-progress-v1', 'pal-takehome-progress-v1',
                      'pal-instrumentation-progress-v1', 'pal-pri-progress-v1',
                      'pal-metrics-foundation-progress-v1', 'pal-rca-foundation-progress-v1',
                      'pal-exp-foundation-progress-v1', 'pal-sql-lab-solved-v1',
                      'pal-sql-lab-times-v1', 'pal-sql-lab-dates-v1', 'pal-bookmarks-v1',
                      'pal-notes-v1', 'pal-access-code-v1', 'exp-lab-progress-v1',
                      'pal-design-progress-v1',
                    ];
                    const snapshot = {};
                    ALL_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v) snapshot[k] = v; });
                    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'pal-progress.json'; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={btnBase}
                >
                  Export progress
                </button>
                <label style={{ ...btnBase, display: 'inline-block' }}>
                  Import progress
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = evt => {
                        try {
                          const data = JSON.parse(evt.target.result);
                          Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
                          window.location.reload();
                        } catch { alert('Invalid progress file.'); }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>
            </div>

          </div>
        </Card>

      </div>
    </div>
  );
}
