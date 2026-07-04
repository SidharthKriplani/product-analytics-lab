import { useState, useEffect } from 'react';
import { signOut } from '../utils/auth.js';
import { getBookmarks } from '../utils/bookmarks.js';
import { pushProgressToSupabase, pullProgressFromSupabase } from '../utils/syncProgress.js';
import { updateMyLinkedin, updateMyEmployment, fetchPublicProfile, computeWeightedScore, fetchLeaderboard, fetchLeaderboardAgg } from '../utils/leaderboard.js';
import { getMyPoints } from '../utils/feed.js';
import { setMyResumeLink, removeMyResume, getLocalResumeUrl } from '../utils/resume.js';
import { COMPANIES, PROFILE_ROLES } from '../data/companyList.js';
import { CompanyLogo } from '../components/shared/CompanyLogo.jsx';
import { computeReadiness } from '../components/shared/ReadinessWidget.jsx';
import { supabase } from '../utils/supabase.js';

const LINKEDIN_LS_KEY = 'pal-linkedin-url-v1';
const COMPANY_LS_KEY  = 'pal-company-v1';
const ROLE_LS_KEY     = 'pal-role-v1';

// Read the user's current LinkedIn URL — prefer auth metadata, then the local
// fallback written when the DB column does not exist yet.
function getInitialLinkedin(user) {
  const fromMeta = user?.user_metadata?.linkedin_url;
  if (fromMeta) return fromMeta;
  try { return localStorage.getItem(LINKEDIN_LS_KEY) || ''; }
  catch { return ''; }
}

// Read the locally-cached employment value (the immediate, no-network source of
// truth; the fetched profile, when present, overrides it).
function getLocal(key) {
  try { return localStorage.getItem(key) || ''; }
  catch { return ''; }
}

// ── Stats helpers ─────────────────────────────────────────────────────────────

const ROOM_CONFIGS = [
  { key: 'exp-lab-progress-v1',              name: 'Review',          type: 'attempts_array' },
  { key: 'pal-stats-progress-v1',            name: 'Stats',           type: 'attempts_num' },
  { key: 'pal-metrics-progress-v2',          name: 'Metrics',         type: 'attempts_num' },
  { key: 'pal-rca-progress-v2',              name: 'RCA',             type: 'attempts_num' },
  { key: 'pal-cases-progress-v2',            name: 'Cases',           type: 'attempts_num' },
  { key: 'pal-design-progress-v1',           name: 'A/B Design',      type: 'attempts_num' },
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

// ── Readiness (Card 1) ──────────────────────────────────────────────────────────
// computeReadiness (shared ReadinessWidget) expects a per-room array of
// { label, completed, total }. We build it from the same ROOM_CONFIGS scan used
// above; totals come from the same predicate over every stored id. Rooms with
// many items surface `total: 999` so the readiness cap (min(8, total)) applies —
// this matches the widget's formula without importing every case dataset.
const READINESS_ROOMS = [
  { key: 'pal-stats-progress-v1',            label: 'Stats',           type: 'attempts_num' },
  { key: 'pal-metrics-progress-v2',          label: 'Metrics',         type: 'attempts_num' },
  { key: 'pal-rca-progress-v2',              label: 'RCA',             type: 'attempts_num' },
  { key: 'pal-cases-progress-v2',            label: 'Cases',           type: 'attempts_num' },
  { key: 'pal-growth-analytics-progress-v1', label: 'Growth Analytics',type: 'rating' },
  { key: 'pal-bi-progress-v1',               label: 'BI',              type: 'rating' },
  { key: 'pal-stf-progress-v1',              label: 'Spot the Flaw',   type: 'completedAt' },
  { key: 'pal-instrumentation-progress-v1',  label: 'Instrumentation', type: 'completedAt' },
  { key: 'pal-behavioral-progress-v1',       label: 'Behavioral',      type: 'rating' },
  { key: 'pal-estimation-progress-v1',       label: 'Estimation',      type: 'rating' },
  { key: 'pal-metrics-foundation-progress-v1', label: 'Metrics Foundations', type: 'completedAt' },
  { key: 'pal-rca-foundation-progress-v1',     label: 'RCA Foundations',     type: 'completedAt' },
  { key: 'pal-exp-foundation-progress-v1',     label: 'Exp Foundations',     type: 'completedAt' },
  { key: 'pal-stat-foundations-progress-v1',   label: 'Stat Foundations',    type: 'completedAt' },
];

function buildRoomProgress() {
  const rooms = READINESS_ROOMS.map(cfg => {
    let done = 0;
    try {
      const raw = localStorage.getItem(cfg.key);
      if (raw) done = countDone(JSON.parse(raw), cfg.type);
    } catch { /* skip */ }
    return { label: cfg.label, completed: done, total: 999 };
  });
  // SQL Lab — solved is an array of problem ids.
  let sqlDone = 0;
  try {
    const raw = localStorage.getItem('pal-sql-lab-solved-v1');
    if (raw) { const d = JSON.parse(raw); sqlDone = Array.isArray(d) ? d.length : Object.keys(d).length; }
  } catch { /* skip */ }
  rooms.push({ label: 'SQL Lab', completed: sqlDone, total: 999 });
  return rooms;
}

function readinessBand(score) {
  if (score >= 90) return { label: 'Sharp', color: 'var(--green)' };
  if (score >= 70) return { label: 'Interview-ready soon', color: 'var(--teal)' };
  if (score >= 40) return { label: 'Building', color: 'var(--yellow)' };
  return { label: 'Just starting', color: 'var(--text-muted)' };
}

// ── Company target + countdown (Card 2) ─────────────────────────────────────────
const TARGET_DATE_KEY = 'pal-target-date-v1';
const TARGET_COMPANY_KEY = 'pal-target-company-v1';
function daysUntil(isoDate) {
  if (!isoDate) return null;
  const target = new Date(isoDate + 'T00:00:00');
  if (isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

// ── Streak + recent activity (Card 3) ───────────────────────────────────────────
const STREAK_STORES = [
  'pal-stats-progress-v1', 'pal-metrics-progress-v2', 'pal-rca-progress-v2',
  'pal-cases-progress-v2', 'pal-fullloop-progress-v1', 'pal-behavioral-progress-v1',
  'pal-estimation-progress-v1', 'pal-stat-foundations-progress-v1',
  'pal-growth-analytics-progress-v1', 'pal-challenges-progress-v1', 'pal-bi-progress-v1',
  'pal-stf-progress-v1', 'pal-takehome-progress-v1', 'pal-metrics-foundation-progress-v1',
  'pal-rca-foundation-progress-v1', 'pal-exp-foundation-progress-v1',
  'pal-instrumentation-progress-v1', 'pal-pri-progress-v1',
];

function getPracticeDates() {
  const dates = new Set();
  STREAK_STORES.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      Object.values(data).forEach(entry => {
        const ts = entry.completedAt || entry.lastCompletedAt;
        if (ts) dates.add(new Date(ts).toISOString().slice(0, 10));
      });
    } catch { /* skip */ }
  });
  try {
    const sqlDates = JSON.parse(localStorage.getItem('pal-sql-lab-dates-v1') || '{}');
    Object.keys(sqlDates).forEach(d => dates.add(d));
  } catch { /* skip */ }
  return dates;
}

function computeStreak() {
  const dates = getPracticeDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0, activeDays = 0;
  for (let i = 0; i < 364; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (dates.has(ds)) { streak++; } else break;
  }
  for (let i = 0; i < 28; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (dates.has(d.toISOString().slice(0, 10))) activeDays++;
  }
  return { streak, activeDays, totalActive: dates.size };
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
  const [linkedin, setLinkedin] = useState(() => getInitialLinkedin(user));
  // idle | saving | saved | local | invalid | error
  const [linkedinStatus, setLinkedinStatus] = useState('idle');

  // ── Employment (current role + company) ──
  const [empRole, setEmpRole]       = useState(() => getLocal(ROLE_LS_KEY));
  const [empCompany, setEmpCompany] = useState(() => getLocal(COMPANY_LS_KEY));
  const [companyQuery, setCompanyQuery] = useState(''); // text filter for the dropdown
  const [companyOpen, setCompanyOpen]   = useState(false);
  // idle | saving | saved | local | invalid | error
  const [empStatus, setEmpStatus] = useState('idle');

  // ── Résumé (optional pasted link) ──
  const [resumeUrl, setResumeUrl] = useState(() => getLocalResumeUrl()); // saved/displayed URL
  const [resumeInput, setResumeInput] = useState(() => getLocalResumeUrl()); // editable input
  // idle | saving | saved | local | invalid | error
  const [resumeStatus, setResumeStatus] = useState('idle');

  // ── Community feed points (guarded — 0 if no backend / migration pending) ──
  const [feedPoints, setFeedPoints] = useState(0);

  // ── Card 2 — company target state ──
  const [targetDate, setTargetDate] = useState(() => { try { return localStorage.getItem(TARGET_DATE_KEY) || ''; } catch { return ''; } });
  const [targetCompany, setTargetCompany] = useState(() => { try { return localStorage.getItem(TARGET_COMPANY_KEY) || ''; } catch { return ''; } });
  function saveTargetDate(v) {
    setTargetDate(v);
    try { if (v) localStorage.setItem(TARGET_DATE_KEY, v); else localStorage.removeItem(TARGET_DATE_KEY); } catch {}
  }
  function saveTargetCompany(v) {
    setTargetCompany(v);
    try { if (v) localStorage.setItem(TARGET_COMPANY_KEY, v); else localStorage.removeItem(TARGET_COMPANY_KEY); } catch {}
  }

  // ── Card 4 — leaderboard rank + vs-average ──
  const [board, setBoard] = useState(null); // { rows, agg, myScore } | null
  useEffect(() => {
    let cancelled = false;
    if (!supabase || !user) return;
    (async () => {
      const [rows, agg] = await Promise.all([fetchLeaderboard(200), fetchLeaderboardAgg()]);
      if (cancelled) return;
      setBoard({ rows: rows || [], agg: agg || null, myScore: computeWeightedScore() });
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Hydrate from the server profile when signed in — this is the source of truth
  // once the migration has run; falls back silently to the local values otherwise.
  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    fetchPublicProfile(user.id).then(p => {
      if (cancelled || !p) return;
      if (p.current_role) setEmpRole(p.current_role);
      if (p.current_company) setEmpCompany(p.current_company);
      if (p.resume_url) { setResumeUrl(p.resume_url); setResumeInput(p.resume_url); }
    });
    return () => { cancelled = true; };
  }, [user]);

  // Community feed points tally — guarded; silently stays 0 if the feed backend /
  // migration isn't there yet.
  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    getMyPoints(user).then(res => {
      if (cancelled) return;
      setFeedPoints((res && res.points) || 0);
    });
    return () => { cancelled = true; };
  }, [user]);

  // STRICT dropdown: filter COMPANIES by the typed query, but the user must pick
  // a value from the list (incl. 'Other / Not listed') — no free-text submit.
  const filteredCompanies = companyQuery.trim()
    ? COMPANIES.filter(c => c.toLowerCase().includes(companyQuery.trim().toLowerCase()))
    : COMPANIES;

  async function handleSaveEmployment() {
    // Strict: company must be a canonical value from the list.
    if (empCompany && !COMPANIES.includes(empCompany)) {
      setEmpStatus('invalid');
      setTimeout(() => setEmpStatus('idle'), 3500);
      return;
    }
    setEmpStatus('saving');
    const res = await updateMyEmployment(user, { company: empCompany, role: empRole });
    if (res.ok) {
      setEmpStatus('saved');
    } else if (res.reason === 'migration-pending' || res.reason === 'no-backend') {
      setEmpStatus('local');
    } else {
      setEmpStatus('error');
    }
    setTimeout(() => setEmpStatus('idle'), 4000);
  }

  async function handleSaveLinkedin() {
    const url = linkedin.trim();
    if (url && !url.toLowerCase().includes('linkedin.com')) {
      setLinkedinStatus('invalid');
      setTimeout(() => setLinkedinStatus('idle'), 3500);
      return;
    }
    setLinkedinStatus('saving');
    // Always keep a local copy so the value persists across reloads pre-migration.
    try { localStorage.setItem(LINKEDIN_LS_KEY, url); } catch { /* ignore */ }
    const res = await updateMyLinkedin(user, url);
    if (res.ok) {
      setLinkedinStatus('saved');
    } else if (res.reason === 'migration-pending' || res.reason === 'no-backend') {
      setLinkedinStatus('local');
    } else {
      setLinkedinStatus('error');
    }
    setTimeout(() => setLinkedinStatus('idle'), 4000);
  }

  async function handleSaveResume() {
    const url = resumeInput.trim();
    if (url && !url.toLowerCase().startsWith('http')) {
      setResumeStatus('invalid');
      setTimeout(() => setResumeStatus('idle'), 3500);
      return;
    }
    setResumeStatus('saving');
    const res = await setMyResumeLink(user, url);
    if (res.url) setResumeUrl(res.url);
    if (res.ok) {
      setResumeStatus('saved');
    } else if (res.reason === 'invalid') {
      setResumeStatus('invalid');
    } else if (res.reason === 'migration-pending' || res.reason === 'no-backend') {
      setResumeStatus('local');
    } else {
      setResumeStatus('error');
    }
    setTimeout(() => setResumeStatus('idle'), 4000);
  }

  async function handleRemoveResume() {
    setResumeUrl('');
    setResumeInput('');
    setResumeStatus('idle');
    await removeMyResume(user);
  }

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

  // ── Card 1 — readiness ──
  const roomProgress = buildRoomProgress();
  const readiness    = computeReadiness(roomProgress);
  const rBand        = readinessBand(readiness.score);

  // ── Card 2 — company target derived ──
  const days = daysUntil(targetDate);
  const companyLabel = targetCompany && targetCompany !== 'Other / Not listed' ? targetCompany : null;
  let countdownText;
  if (days == null)      countdownText = 'No target set';
  else if (days < 0)     countdownText = 'Interview date passed';
  else if (days === 0)   countdownText = 'Interview is today';
  else                   countdownText = days + ' day' + (days === 1 ? '' : 's') + ' to go';

  // ── Card 3 — streak derived ──
  const { streak, activeDays } = computeStreak();

  // ── Card 4 — rank + vs-average derived ──
  let rank = null, cohortSize = 0, avgScore = 0, myScore = 0;
  if (board) {
    myScore = board.myScore;
    const rows = board.rows;
    cohortSize = board.agg?.count || rows.length;
    avgScore = board.agg?.avgTotal != null
      ? board.agg.avgTotal
      : (rows.length ? Math.round(rows.reduce((s, r) => s + (r.total_solved || 0), 0) / rows.length) : 0);
    if (rows.length) {
      const mine = rows.filter(r => r.user_id === user.id);
      if (mine.length) rank = rows.findIndex(r => r.user_id === user.id) + 1;
      else rank = rows.filter(r => (r.total_solved || 0) > myScore).length + 1; // provisional if not yet synced
    }
  }

  // ── Card 5 — completion by area (rooms with progress, by %) ──
  const areaRows = stats.breakdown
    .map(r => ({ ...r }))
    .sort((a, b) => b.done - a.done);
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

          {/* ── LinkedIn (optional, prompted) ── */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.1rem', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
              LinkedIn
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="url"
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/your-handle"
                style={{
                  flex: 1, minWidth: '180px',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: '6px', padding: '0.4rem 0.6rem',
                  fontSize: '0.82rem', color: 'var(--text)',
                }}
              />
              <button
                onClick={handleSaveLinkedin}
                disabled={linkedinStatus === 'saving'}
                style={{ ...btnBase, flexShrink: 0, opacity: linkedinStatus === 'saving' ? 0.6 : 1 }}
              >
                {linkedinStatus === 'saving' ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Status / nudge line */}
            {linkedinStatus === 'saved' ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--green, #059669)', marginTop: '0.45rem' }}>
                Saved. Recruiters viewing the leaderboard can now find you.
              </div>
            ) : linkedinStatus === 'local' ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                Saved locally — syncing soon.
              </div>
            ) : linkedinStatus === 'invalid' ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--red, #dc2626)', marginTop: '0.45rem' }}>
                That does not look like a LinkedIn URL. It should contain linkedin.com.
              </div>
            ) : linkedinStatus === 'error' ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--red, #dc2626)', marginTop: '0.45rem' }}>
                Could not save right now — saved locally for now.
              </div>
            ) : !linkedin.trim() ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                Add your LinkedIn so recruiters viewing the leaderboard can find you.
              </div>
            ) : null}
          </div>

          {/* ── Résumé (optional pasted link) ── ARCHIVED: résumé feature parked. Flip false→true to restore. */}
          {false && (
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.1rem', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
              Résumé
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="url"
                value={resumeInput}
                onChange={e => setResumeInput(e.target.value)}
                placeholder="Link to your résumé (Google Drive, Dropbox, personal site)…"
                style={{
                  flex: 1, minWidth: '180px',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: '6px', padding: '0.4rem 0.6rem',
                  fontSize: '0.82rem', color: 'var(--text)',
                }}
              />
              <button
                onClick={handleSaveResume}
                disabled={resumeStatus === 'saving'}
                style={{ ...btnBase, flexShrink: 0, opacity: resumeStatus === 'saving' ? 0.6 : 1 }}
              >
                {resumeStatus === 'saving' ? 'Saving...' : 'Save'}
              </button>
            </div>

            {resumeUrl && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
                >
                  View résumé &rarr;
                </a>
                <button
                  onClick={handleRemoveResume}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.78rem', color: 'var(--red, #dc2626)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            )}

            {/* Status / nudge line */}
            {resumeStatus === 'saved' ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--green, #059669)', marginTop: '0.45rem' }}>
                Saved. Recruiters viewing your profile can now open your résumé.
              </div>
            ) : resumeStatus === 'local' ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                Saved locally — syncing soon.
              </div>
            ) : resumeStatus === 'invalid' ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--red, #dc2626)', marginTop: '0.45rem' }}>
                That does not look like a link. It should start with http.
              </div>
            ) : resumeStatus === 'error' ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--red, #dc2626)', marginTop: '0.45rem' }}>
                Could not save right now — saved locally for now.
              </div>
            ) : !resumeUrl ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                Paste a link to your résumé. Shown on your public profile so recruiters can reach you.
              </div>
            ) : null}
          </div>
          )}

          {/* ── Current role & company ── */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.1rem', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
              Current role &amp; company
            </div>

            {(empRole || empCompany) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.55rem', minWidth: 0 }}>
                {empCompany && <CompanyLogo company={empCompany} size={18} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {empRole || 'Analyst'}{empCompany ? ' at ' + empCompany : ''}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Role select */}
              <select
                value={empRole}
                onChange={e => setEmpRole(e.target.value)}
                style={{
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: '6px', padding: '0.4rem 0.6rem',
                  fontSize: '0.82rem', color: 'var(--text)',
                }}
              >
                <option value="">Select your role…</option>
                {PROFILE_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {/* Company — strict searchable dropdown */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={companyOpen ? companyQuery : empCompany}
                  onFocus={() => { setCompanyOpen(true); setCompanyQuery(''); }}
                  onBlur={() => setTimeout(() => setCompanyOpen(false), 150)}
                  onChange={e => { setCompanyQuery(e.target.value); setCompanyOpen(true); }}
                  placeholder="Search your company…"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '0.4rem 0.6rem',
                    fontSize: '0.82rem', color: 'var(--text)',
                  }}
                />
                {companyOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20,
                    maxHeight: '220px', overflowY: 'auto',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  }}>
                    {filteredCompanies.length === 0 ? (
                      <div style={{ padding: '0.55rem 0.7rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        No match. Pick &lsquo;Other / Not listed&rsquo;.
                      </div>
                    ) : (
                      filteredCompanies.map(c => (
                        <button
                          key={c}
                          type="button"
                          onMouseDown={() => {
                            setEmpCompany(c);
                            setCompanyQuery('');
                            setCompanyOpen(false);
                          }}
                          style={{
                            display: 'block', width: '100%', textAlign: 'left',
                            background: c === empCompany ? 'var(--surface-2)' : 'none',
                            border: 'none', borderBottom: '1px solid var(--border)',
                            padding: '0.5rem 0.7rem', fontSize: '0.82rem',
                            color: 'var(--text)', cursor: 'pointer',
                          }}
                        >
                          {c}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={handleSaveEmployment}
                  disabled={empStatus === 'saving'}
                  style={{ ...btnBase, opacity: empStatus === 'saving' ? 0.6 : 1 }}
                >
                  {empStatus === 'saving' ? 'Saving...' : 'Save role & company'}
                </button>
              </div>
            </div>

            {/* Status / nudge line */}
            {empStatus === 'saved' ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--green, #059669)', marginTop: '0.45rem' }}>
                Saved. The community can now see where you work.
              </div>
            ) : empStatus === 'local' ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                Saved locally — syncing soon.
              </div>
            ) : empStatus === 'invalid' ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--red, #dc2626)', marginTop: '0.45rem' }}>
                Please pick a company from the list.
              </div>
            ) : empStatus === 'error' ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--red, #dc2626)', marginTop: '0.45rem' }}>
                Could not save right now — saved locally for now.
              </div>
            ) : (!empCompany && !empRole) ? (
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                Add your company &amp; role so the community can refer you.
              </div>
            ) : null}
          </div>
        </Card>

        {/* ── Card 1 — Readiness score ── */}
        <Card>
          <SectionLabel>Readiness score</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: rBand.color, lineHeight: 1 }}>{readiness.score}%</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: rBand.color }}>{rBand.label}</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.7rem' }}>
            <div style={{ width: `${readiness.score}%`, height: '100%', background: rBand.color, transition: 'width 0.5s' }} />
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            Capped-mean coverage across your core judgment and foundation rooms, so breadth — not grinding one room — moves the score.
          </p>
          {readiness.weakest && (
            <button
              onClick={() => onNavigate(readiness.weakest.nav)}
              style={{ marginTop: '0.7rem', background: 'none', border: 'none', padding: 0, fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }}
            >
              Work next: {readiness.weakest.label} &rarr;
            </button>
          )}
        </Card>

        {/* ── Card 2 — Company target + countdown ── */}
        <Card>
          <SectionLabel>Company target</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            {companyLabel && <CompanyLogo company={companyLabel} size={30} />}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {companyLabel || 'Set a target company'}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: days != null && days >= 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                {countdownText}{days != null && days >= 0 && companyLabel ? ' · ' + companyLabel : ''}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Target interview date</span>
              <input
                type="date" value={targetDate} onChange={e => saveTargetDate(e.target.value)}
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.6rem', fontSize: '0.82rem', color: 'var(--text)' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Target company</span>
              <select
                value={targetCompany} onChange={e => saveTargetCompany(e.target.value)}
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.6rem', fontSize: '0.82rem', color: 'var(--text)' }}
              >
                <option value="">No company set</option>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          {(targetDate || targetCompany) ? (
            <button
              onClick={() => { saveTargetDate(''); saveTargetCompany(''); }}
              style={{ marginTop: '0.7rem', background: 'none', border: 'none', padding: 0, fontSize: '0.74rem', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              Clear target
            </button>
          ) : (
            <p style={{ marginTop: '0.7rem', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0.7rem 0 0' }}>
              Set a target company and interview date to turn prep into a countdown. PAL works best as a cram-to-a-date plan.
            </p>
          )}
        </Card>

        {/* ── Card 3 — Streak + activity ── */}
        <Card>
          <SectionLabel>Streak &amp; activity</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: '0.65rem', marginBottom: '0.75rem' }}>
            {[
              { label: 'Day streak', value: streak },
              { label: 'Active days / 28', value: activeDays },
              { label: 'Cases done', value: stats.totalCases },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '0.7rem 0.4rem', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.28rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            {streak > 0
              ? `You are on a ${streak}-day streak across ${stats.roomsActive} active room${stats.roomsActive === 1 ? '' : 's'}. Keep it going.`
              : 'Practice a case today to start a streak.'}
          </p>
        </Card>

        {/* ── Card 4 — Leaderboard / vs-average ── */}
        <Card>
          <SectionLabel>Leaderboard</SectionLabel>
          {!supabase ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Leaderboard needs a backend connection. Not configured in this build.</p>
          ) : board == null ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading your rank…</p>
          ) : cohortSize === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>No ranked players yet. Practice cases and sync to appear on the board.</p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: '0.65rem', marginBottom: '0.75rem' }}>
                {[
                  { label: 'Your rank', value: rank ? '#' + rank : '—' },
                  { label: 'Your score', value: myScore },
                  { label: 'Cohort', value: cohortSize },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', padding: '0.7rem 0.4rem', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.28rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.8rem', marginBottom: '0.7rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>vs cohort average </span>
                <span style={{ fontWeight: 800, color: 'var(--text)' }}>{avgScore}</span>
                <span style={{ fontWeight: 700, marginLeft: '0.5rem', color: myScore >= avgScore ? 'var(--green)' : 'var(--yellow)' }}>
                  {myScore >= avgScore ? '+' : ''}{myScore - avgScore} pts {myScore >= avgScore ? 'above' : 'below'} average
                </span>
              </div>
              <button
                onClick={() => onNavigate('leaderboard')}
                style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }}
              >
                View full leaderboard &rarr;
              </button>
            </>
          )}
        </Card>

        {/* ── Card 5 — Completion by area ── */}
        <Card>
          <SectionLabel>Completion by area</SectionLabel>
          {areaRows.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              No rooms started yet. Practice cases and your coverage by area will appear here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {areaRows.map(a => (
                <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '120px' }}>{a.name}</span>
                  <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, a.done * 12)}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.4s' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: '28px', textAlign: 'right' }}>{a.done}</span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => onNavigate('progress')}
            style={{ marginTop: '0.85rem', background: 'none', border: 'none', padding: 0, fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }}
          >
            View full progress &rarr;
          </button>
        </Card>

        {/* ── Practice stats ── */}
        <Card>
          <SectionLabel>Practice stats</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.65rem', marginBottom: '0.75rem' }}>
            {[
              { label: 'Cases done',    value: stats.totalCases },
              { label: 'Rooms active',  value: stats.roomsActive },
              { label: 'Bookmarks',     value: getBookmarks().length },
              // Feed points — only surfaced once the user has any (keeps a missing
              // backend from showing a misleading 0).
              ...(feedPoints > 0 ? [{ label: 'Feed points', value: feedPoints }] : []),
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
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Open SQL Lab &rarr;
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.55rem' }}>No plan yet</div>
                  <button
                    onClick={() => onNavigate('sql-lab')}
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
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
