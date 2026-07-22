import { useState, useEffect } from 'react';
import { UniverseView } from '../components/shared/UniverseView.jsx';
import { ReadinessWidget } from '../components/shared/ReadinessWidget.jsx';
import DailyDrill from '../components/shared/DailyDrill.jsx';
import { Icon } from '../components/shared/Icon.jsx';
import { getDueReviews } from '../utils/srQueue.js';

// Set to false to soft-hide the Universe view toggle without removing code
const SHOW_UNIVERSE_TOGGLE = true;
import { clearProgress } from '../utils/progress.js';
import { deleteProgressKeys, PROGRESS_KEYS, DYNAMIC_PREFIXES } from '../utils/syncProgress.js';
import { fetchLeaderboardAgg, upsertLeaderboardRow } from '../utils/leaderboard.js';
import { getAllStatsProgress } from '../utils/statsProgress.js';
import { getAllMetricsProgress } from '../utils/metricsProgress.js';
import { getAllRCAProgress } from '../utils/rcaProgress.js';
import { getAllCaseProgress } from '../utils/caseProgress.js';
import { getDesignProgress } from '../utils/designProgress.js';
import { getAllFullLoopProgress } from '../utils/fullLoopProgress.js';
import { getProductDesignProgress } from '../utils/productDesignProgress.js';
import { getAllPrioritizationProgress } from '../utils/prioritizationProgress.js';
import { getAllBehavioralProgress } from '../utils/behavioralProgress.js';
import { getAllEstimationProgress } from '../utils/estimationProgress.js';
import { getAllStatFoundationsProgress } from '../utils/statsFoundationsProgress.js';
import { statsModules } from '../data/statsModules.js';
import { metricCases } from '../data/metricCases.js';
import { rcaCases } from '../data/rcaCases.js';
import { businessCases } from '../data/businessCases.js';
import { designScenarios } from '../data/designScenarios.js';
import { fullLoopCases } from '../data/fullLoopCases.js';
import { sqlLabProblems } from '../data/sqlLabProblems.js';
import { productDesignScenarios } from '../data/productDesignScenarios.js';
import { prioritizationScenarios } from '../data/prioritizationScenarios.js';
import { behavioralQuestions } from '../data/behavioralQuestions.js';
import { estimationProblems } from '../data/estimationProblems.js';
import { statsFoundationsModules } from '../data/statsFoundationsModules.js';
import { growthAnalyticsCases } from '../data/growthAnalyticsCases.js';
import { getAllGrowthAnalyticsProgress } from '../utils/growthAnalyticsProgress.js';
import { getAllChallengesProgress } from '../utils/challengesProgress.js';
import { getAllBIProgress } from '../utils/biProgress.js';
import { getAllSTFProgress } from '../utils/spotTheFlawProgress.js';
import { getAllTakehomeProgress } from '../utils/takehomeProgress.js';
import { challengesCases } from '../data/challengesCases.js';
import { biCases } from '../data/biCases.js';
import { spotTheFlawCases } from '../data/spotTheFlawCases.js';
import { takehomeCases } from '../data/takehomeCases.js';
import { getAllInstrumentationProgress } from '../utils/instrumentationProgress.js';
import { instrumentationCases } from '../data/instrumentationCases.js';
import { getAllMetricsFoundationProgress } from '../utils/metricsFoundationProgress.js';
import { metricsFoundationModules } from '../data/metricsFoundationModules.js';
import { getAllRCAFoundationProgress } from '../utils/rcaFoundationProgress.js';
import { rcaFoundationModules } from '../data/rcaFoundationModules.js';
import { getAllExpFoundationProgress } from '../utils/expFoundationProgress.js';
import { expFoundationModules } from '../data/expFoundationModules.js';
import { learningPaths } from '../data/learningPaths.js';
import { LEARNING_PATHS } from '../data/learningPathDefs.js';
import { GuidedPathCard } from '../components/paths/GuidedPathCard.jsx';
import { scenarios } from '../data/scenarios.js';

const LEVEL_ORDER = ['junior', 'analyst', 'senior', 'staff'];
const LEVEL_LABELS = {
  junior: { label: 'Junior-Ready', color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  analyst: { label: 'Analyst-Ready', color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
  senior: { label: 'Senior-Ready', color: 'var(--teal)', bg: 'var(--teal-bg)', border: 'var(--teal-border)' },
  staff: { label: 'Staff-Level', color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
  partial: { label: 'Analyst-Ready', color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
  strong: { label: 'Senior-Ready', color: 'var(--teal)', bg: 'var(--teal-bg)', border: 'var(--teal-border)' },
  wrong: { label: 'Junior-Ready', color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
};

function LevelBadge({ level }) {
  const cfg = LEVEL_LABELS[level] || LEVEL_LABELS.analyst;
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700,
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: '4px', padding: '0.15rem 0.4rem',
    }}>
      {cfg.label}
    </span>
  );
}

function RoomReadinessBar({ label, completed, total, bestLevel, onReset }) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div style={{ marginBottom: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{completed}/{total}</span>
          {bestLevel && <LevelBadge level={bestLevel} />}
          {completed > 0 && onReset && !confirmingReset && (
            <button
              onClick={() => setConfirmingReset(true)}
              style={{ fontSize: '0.68rem', color: 'var(--text-dim)', background: 'none', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.08rem 0.35rem', cursor: 'pointer' }}
            >Reset</button>
          )}
          {confirmingReset && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <button
                onClick={() => { onReset(); setConfirmingReset(false); }}
                style={{ fontSize: '0.68rem', color: 'var(--red)', background: 'none', border: '1px solid var(--red)', borderRadius: '4px', padding: '0.08rem 0.35rem', cursor: 'pointer', fontWeight: 700 }}
              >Yes, reset</button>
              <button
                onClick={() => setConfirmingReset(false)}
                style={{ fontSize: '0.68rem', color: 'var(--text-dim)', background: 'none', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.08rem 0.35rem', cursor: 'pointer' }}
              >Cancel</button>
            </span>
          )}
        </div>
      </div>
      <div style={{ height: '5px', background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

function getBestLevel(levelsArray) {
  if (!levelsArray || levelsArray.length === 0) return null;
  let best = null;
  for (const l of levelsArray) {
    if (!best || LEVEL_ORDER.indexOf(l) > LEVEL_ORDER.indexOf(best)) best = l;
  }
  return best;
}

// Reusable collapsible section card
function SectionCard({ icon, title, open, onToggle, badge, children }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      marginBottom: '1rem',
      overflow: 'hidden',
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: '0.875rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
        onMouseLeave={e => e.currentTarget.style.background = ''}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{title}</span>
          {badge != null && (
            <span style={{
              fontSize: '0.68rem', fontWeight: 700,
              background: 'var(--accent-bg)', color: 'var(--accent)',
              border: '1px solid var(--accent-border)',
              borderRadius: '10px', padding: '0.1rem 0.45rem',
            }}>{badge}</span>
          )}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', transition: 'transform 0.15s', display: 'inline-block', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
      </div>
      <div style={{ display: open ? 'block' : 'none', padding: '0 1.25rem 1.25rem' }}>
        {children}
      </div>
    </div>
  );
}

export function Progress({ allProgress, onSelect, onClear, onNavigate, unlocked, user }) {
  const [universeView, setUniverseView] = useState(false);
  const [lbAgg, setLbAgg] = useState(null);
  useEffect(function() {
    fetchLeaderboardAgg().then(function(agg) { if (agg) setLbAgg(agg); });
  }, []);
  const completed = scenarios.filter(s => allProgress[s.id]?.attempts?.length > 0);
  const notStarted = scenarios.filter(s => !allProgress[s.id]?.attempts?.length);
  const totalAttempts = Object.values(allProgress).reduce((sum, p) => sum + (p.attempts?.length || 0), 0);

  // Gather progress from all rooms
  const statsProgress = getAllStatsProgress();
  const metricsProgress = getAllMetricsProgress();
  const rcaProgress = getAllRCAProgress();
  const caseProgress = getAllCaseProgress();
  const fullLoopProgress = getAllFullLoopProgress();
  const priProgress = getAllPrioritizationProgress();
  const behavioralProgress = getAllBehavioralProgress();
  const estimationProg = getAllEstimationProgress();
  const sfProgress = getAllStatFoundationsProgress();
  const gaProgress = getAllGrowthAnalyticsProgress();
  const challengesProgress = getAllChallengesProgress();
  const biProgress = getAllBIProgress();
  const stfProgress = getAllSTFProgress();
  const takehomeProgress = getAllTakehomeProgress();
  const instrProgress = getAllInstrumentationProgress();
  const mfProgress = getAllMetricsFoundationProgress();
  const rfProgress = getAllRCAFoundationProgress();
  const efProgress = getAllExpFoundationProgress();

  const sqlSolved = (() => { try { return new Set(JSON.parse(localStorage.getItem('pal-sql-lab-solved-v1') || '[]')); } catch { return new Set(); } })();
  const sqlTimes  = (() => { try { return JSON.parse(localStorage.getItem('pal-sql-lab-times-v1') || '{}'); } catch { return {}; } })();

  const statsCompleted = statsModules.filter(m => statsProgress[m.id]?.attempts > 0);
  const metricsCompleted = metricCases.filter(c => metricsProgress[c.id]?.attempts > 0);
  const rcaCompleted = rcaCases.filter(c => rcaProgress[c.id]?.attempts > 0);
  const casesCompleted = businessCases.filter(c => caseProgress[c.id]?.attempts > 0);
  const designCompleted = designScenarios.filter(s => {
    const p = getDesignProgress(s.id);
    return p && p.submittedPhases && Object.keys(p.submittedPhases).length > 0;
  });
  const productDesignCompleted = productDesignScenarios.filter(s => {
    const p = getProductDesignProgress(s.id);
    return p && p.submittedPhases && Object.keys(p.submittedPhases).length > 0;
  });

  // Best levels per room
  const statsBest = getBestLevel(statsCompleted.map(m => statsProgress[m.id]?.level).filter(Boolean));
  const metricsBest = getBestLevel(metricsCompleted.map(c => metricsProgress[c.id]?.level).filter(Boolean));
  const rcaBest = getBestLevel(rcaCompleted.map(c => rcaProgress[c.id]?.level).filter(Boolean));
  const casesBest = getBestLevel(casesCompleted.map(c => caseProgress[c.id]?.level).filter(Boolean));
  const reviewBest = getBestLevel(completed.map(s => allProgress[s.id]?.attempts?.slice(-1)[0]).filter(Boolean));
  const designBest = null; // Design uses different scoring

  function makeRoomResetter(keys) {
    return () => {
      keys.forEach(k => { try { localStorage.removeItem(k); } catch {} });
      deleteProgressKeys(keys);   // clear the server copy too — else the next sync/reload restores it
      // A reset changes computeWeightedScore()'s inputs but nothing previously told the
      // leaderboard — the server row kept the pre-reset score until some unrelated trigger
      // (next sign-in, periodic sync, an SQL Lab solve) happened to fire an upsert. Recompute
      // and push immediately so the reset is reflected everywhere the score is shown.
      if (user) upsertLeaderboardRow(user);
      if (onClear) onClear();     // refresh the page in place — no reload
    };
  }

  const allRoomProgress = [
    { label: 'Stats', completed: statsCompleted.length, total: statsModules.length, best: statsBest,
      onReset: makeRoomResetter(['pal-stats-progress-v1']) },
    { label: 'Metrics', completed: metricsCompleted.length, total: metricCases.length, best: metricsBest,
      onReset: makeRoomResetter(['pal-metrics-progress-v2']) },
    { label: 'A/B Design', completed: designCompleted.length, total: designScenarios.length, best: designBest,
      onReset: makeRoomResetter(['pal-design-progress-v1']) },
    { label: 'A/B Judgment', completed: completed.length, total: scenarios.length, best: reviewBest,
      onReset: makeRoomResetter(['exp-lab-progress-v1']) },
    { label: 'RCA', completed: rcaCompleted.length, total: rcaCases.length, best: rcaBest,
      onReset: makeRoomResetter(['pal-rca-progress-v2']) },
    { label: 'Cases', completed: casesCompleted.length, total: businessCases.length, best: casesBest,
      onReset: makeRoomResetter(['pal-cases-progress-v2']) },
    { label: 'Growth Analytics', completed: growthAnalyticsCases.filter(c => gaProgress[c.id]?.rating).length, total: growthAnalyticsCases.length, color: 'var(--teal)',
      onReset: makeRoomResetter(['pal-growth-analytics-progress-v1']) },
    { label: 'Challenges', completed: challengesCases.filter(c => challengesProgress[c.id]?.completedAt).length, total: challengesCases.length, color: 'var(--yellow)',
      onReset: makeRoomResetter(['pal-challenges-progress-v1']) },
    { label: 'BI', completed: biCases.filter(c => biProgress[c.id]?.rating).length, total: biCases.length, color: 'var(--yellow)',
      onReset: makeRoomResetter(['pal-bi-progress-v1']) },
    { label: 'Spot the Flaw', completed: spotTheFlawCases.filter(c => stfProgress[c.id]?.completedAt).length, total: spotTheFlawCases.length, color: 'var(--red)',
      onReset: makeRoomResetter(['pal-stf-progress-v1']) },
    { label: 'Take-Home', completed: takehomeCases.filter(c => takehomeProgress[c.id]?.completedAt).length, total: takehomeCases.length, color: 'var(--green)',
      onReset: makeRoomResetter(['pal-takehome-progress-v1']) },
    { label: 'Instrumentation', completed: instrumentationCases.filter(c => instrProgress[c.id]?.completedAt).length, total: instrumentationCases.length, color: 'var(--teal)',
      onReset: makeRoomResetter(['pal-instrumentation-progress-v1']) },
    { label: 'Behavioral', completed: behavioralQuestions.filter(q => behavioralProgress[q.id]?.rating).length, total: behavioralQuestions.length, color: 'var(--purple)',
      onReset: makeRoomResetter(['pal-behavioral-progress-v1']) },
    { label: 'Full Loop', completed: fullLoopCases.filter(c => fullLoopProgress[c.id]?.lastCompletedAt).length, total: fullLoopCases.length, color: 'var(--accent)',
      onReset: makeRoomResetter(['pal-fullloop-progress-v1']) },
    { label: 'Estimation', completed: estimationProblems.filter(p => estimationProg[p.id]?.rating).length, total: estimationProblems.length, color: 'var(--teal)',
      onReset: makeRoomResetter(['pal-estimation-progress-v1']) },
    { label: 'Stat Foundations', completed: statsFoundationsModules.filter(m => sfProgress[m.id]?.completedAt).length, total: statsFoundationsModules.length, color: 'var(--teal)',
      onReset: makeRoomResetter(['pal-stat-foundations-progress-v1']) },
    { label: 'Metrics Foundations', completed: metricsFoundationModules.filter(m => mfProgress[m.id]?.completedAt).length, total: metricsFoundationModules.length, color: 'var(--green)',
      onReset: makeRoomResetter(['pal-metrics-foundation-progress-v1']) },
    { label: 'RCA Foundations', completed: rcaFoundationModules.filter(m => rfProgress[m.id]?.completedAt).length, total: rcaFoundationModules.length, color: 'var(--teal)',
      onReset: makeRoomResetter(['pal-rca-foundation-progress-v1']) },
    { label: 'Exp Foundations', completed: expFoundationModules.filter(m => efProgress[m.id]?.completedAt).length, total: expFoundationModules.length, color: 'var(--accent)',
      onReset: makeRoomResetter(['pal-exp-foundation-progress-v1']) },
    { label: 'Prioritization', completed: prioritizationScenarios.filter(s => priProgress[s.id]?.completedAt).length, total: prioritizationScenarios.length,
      onReset: makeRoomResetter(['pal-pri-progress-v1']) },
    { label: 'Product Design', completed: productDesignCompleted.length, total: productDesignScenarios.length,
      onReset: () => {
        const toRemove = [];
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('pd-progress-')) toRemove.push(k);
          }
          toRemove.forEach(k => localStorage.removeItem(k));
        } catch {}
        deleteProgressKeys(toRemove);   // clear the server copies too
        if (user) upsertLeaderboardRow(user); // keep the weighted score in sync with the reset
        if (onClear) onClear();         // refresh in place — no reload
      } },
    { label: 'SQL Lab', completed: sqlLabProblems.filter(p => sqlSolved.has(p.id)).length, total: sqlLabProblems.length,
      onReset: makeRoomResetter(['pal-sql-lab-solved-v1', 'pal-sql-lab-times-v1', 'pal-sql-lab-dates-v1']) },
  ];

  const gaCompleted = growthAnalyticsCases.filter(c => gaProgress[c.id]?.rating).length;
  const challengesCompleted = challengesCases.filter(c => challengesProgress[c.id]?.completedAt).length;
  const biCompleted = biCases.filter(c => biProgress[c.id]?.rating).length;
  const stfCompleted = spotTheFlawCases.filter(c => stfProgress[c.id]?.completedAt).length;
  const takehomeCompleted = takehomeCases.filter(c => takehomeProgress[c.id]?.completedAt).length;
  const instrCompleted = instrumentationCases.filter(c => instrProgress[c.id]?.completedAt).length;
  // Previously hand-maintained sums over only ~12 of the ~20 rooms (missing all 4
  // Foundations rooms, SQL Lab, Behavioral, Full Loop, Estimation, Prioritization,
  // Product Design) — drifted out of sync as rooms were added over time. That made
  // totalCompleted go to exactly 0 for a user with real progress concentrated in the
  // missing rooms, which in turn flipped the "Readiness by room" panel's grid `order`
  // (below) to the empty-state position — the layout jump reported after a reset.
  // Derive both from allRoomProgress, the single source of truth that already covers
  // every room, so this can't drift again when a new room is added.
  const totalCompleted = allRoomProgress.reduce((sum, r) => sum + r.completed, 0);
  const grandTotal = allRoomProgress.reduce((sum, r) => sum + r.total, 0);

  // Strongest/weakest room (by completion %)
  const roomsWithData = allRoomProgress.filter(r => r.completed > 0);
  const sortedByPct = [...roomsWithData].sort((a, b) => (b.completed / b.total) - (a.completed / a.total));
  const strongest = sortedByPct[0] || null;
  const weakest = allRoomProgress.find(r => r.completed === 0) || sortedByPct[sortedByPct.length - 1];

  // Next suggested item
  function getNextSuggested() {
    if (statsCompleted.length < statsModules.length) {
      const next = statsModules.find(m => !statsProgress[m.id]?.attempts);
      if (next) return { room: 'Stats', label: next.title, nav: 'stats' };
    }
    if (metricsCompleted.length < metricCases.length) {
      const next = metricCases.find(c => !metricsProgress[c.id]?.attempts);
      if (next) return { room: 'Metrics', label: next.title, nav: 'metrics' };
    }
    if (completed.length < scenarios.length) {
      const next = scenarios.find(s => !allProgress[s.id]?.attempts?.length);
      if (next) return { room: 'Review', label: next.title, nav: 'browser' };
    }
    if (rcaCompleted.length < rcaCases.length) {
      const next = rcaCases.find(c => !rcaProgress[c.id]?.attempts);
      if (next) return { room: 'RCA', label: next.title, nav: 'rca' };
    }
    if (casesCompleted.length < businessCases.length) {
      const next = businessCases.find(c => !caseProgress[c.id]?.attempts);
      if (next) return { room: 'Cases', label: next.title, nav: 'cases' };
    }
    if (biCompleted < biCases.length) {
      const next = biCases.find(c => !biProgress[c.id]?.rating);
      if (next) return { room: 'BI', label: next.title, nav: 'bi' };
    }
    if (stfCompleted < spotTheFlawCases.length) {
      const next = spotTheFlawCases.find(c => !stfProgress[c.id]?.completedAt);
      if (next) return { room: 'Spot the Flaw', label: next.title, nav: 'spot-the-flaw' };
    }
    if (challengesCompleted < challengesCases.length) {
      const next = challengesCases.find(c => !challengesProgress[c.id]?.completedAt);
      if (next) return { room: 'Challenges', label: next.title, nav: 'challenges' };
    }
    if (instrCompleted < instrumentationCases.length) {
      const next = instrumentationCases.find(c => !instrProgress[c.id]?.completedAt);
      if (next) return { room: 'Instrumentation', label: next.title, nav: 'instrumentation' };
    }
    return null;
  }
  const nextSuggested = getNextSuggested();

  // Completion map for guided paths
  const completionMap = {};
  statsModules.forEach(m => { if (statsProgress[m.id]?.attempts > 0) completionMap[`stats:${m.id}`] = true; });
  metricCases.forEach(c => { if (metricsProgress[c.id]?.attempts > 0) completionMap[`metrics:${c.id}`] = true; });
  designScenarios.forEach(s => { const p = getDesignProgress(s.id); if (p?.submittedPhases && Object.keys(p.submittedPhases).length > 0) completionMap[`design:${s.id}`] = true; });
  scenarios.forEach(s => { if (allProgress[s.id]?.attempts?.length > 0) completionMap[`review:${s.id}`] = true; });
  rcaCases.forEach(c => { if (rcaProgress[c.id]?.attempts > 0) completionMap[`rca:${c.id}`] = true; });
  businessCases.forEach(c => { if (caseProgress[c.id]?.attempts > 0) completionMap[`cases:${c.id}`] = true; });
  fullLoopCases.forEach(c => { if (fullLoopProgress[c.id]?.lastCompletedAt) completionMap[`full-loop:${c.id}`] = true; });
  productDesignScenarios.forEach(s => { const p = getProductDesignProgress(s.id); if (p?.submittedPhases && Object.keys(p.submittedPhases).length > 0) completionMap[`product-design:${s.id}`] = true; });
  prioritizationScenarios.forEach(s => { if (priProgress[s.id]?.completedAt) completionMap[`prioritization:${s.id}`] = true; });
  behavioralQuestions.forEach(q => { if (behavioralProgress[q.id]?.rating) completionMap[`behavioral:${q.id}`] = true; });
  estimationProblems.forEach(p => { if (estimationProg[p.id]?.rating) completionMap[`estimation:${p.id}`] = true; });
  statsFoundationsModules.forEach(m => { if (sfProgress[m.id]?.completedAt) completionMap[`stat-foundations:${m.id}`] = true; });
  growthAnalyticsCases.forEach(c => { if (gaProgress[c.id]?.rating) completionMap[`growth-analytics:${c.id}`] = true; });
  challengesCases.forEach(c => { if (challengesProgress[c.id]?.completedAt) completionMap[`challenges:${c.id}`] = true; });
  biCases.forEach(c => { if (biProgress[c.id]?.rating) completionMap[`bi:${c.id}`] = true; });
  spotTheFlawCases.forEach(c => { if (stfProgress[c.id]?.completedAt) completionMap[`spot-the-flaw:${c.id}`] = true; });
  takehomeCases.forEach(c => { if (takehomeProgress[c.id]?.completedAt) completionMap[`take-home:${c.id}`] = true; });
  instrumentationCases.forEach(c => { if (instrProgress[c.id]?.completedAt) completionMap[`instrumentation:${c.id}`] = true; });
  metricsFoundationModules.forEach(m => { if (mfProgress[m.id]?.completedAt) completionMap[`metrics-foundations:${m.id}`] = true; });
  rcaFoundationModules.forEach(m => { if (rfProgress[m.id]?.completedAt) completionMap[`rca-foundations:${m.id}`] = true; });
  expFoundationModules.forEach(m => { if (efProgress[m.id]?.completedAt) completionMap[`exp-foundations:${m.id}`] = true; });

  // Practice heatmap: collect all practice dates from all progress stores
  function getPracticeDates() {
    const dates = new Set();
    const stores = [
      'pal-stats-progress-v1', 'pal-metrics-progress-v2', 'pal-rca-progress-v2',
      'pal-cases-progress-v2', 'pal-fullloop-progress-v1', 'pal-behavioral-progress-v1',
      'pal-estimation-progress-v1', 'pal-stat-foundations-progress-v1',
      'pal-growth-analytics-progress-v1',
      'pal-challenges-progress-v1', 'pal-bi-progress-v1', 'pal-stf-progress-v1', 'pal-takehome-progress-v1',
      'pal-metrics-foundation-progress-v1',
      'pal-rca-foundation-progress-v1',
      'pal-exp-foundation-progress-v1',
      'pal-instrumentation-progress-v1', 'pal-pri-progress-v1'
    ];
    stores.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        Object.values(data).forEach(entry => {
          const ts = entry.completedAt || entry.lastCompletedAt;
          if (ts) dates.add(new Date(ts).toISOString().slice(0, 10));
        });
      } catch {}
    });
    // SQL Lab solve dates (keyed directly by date string)
    try {
      const sqlDates = JSON.parse(localStorage.getItem('pal-sql-lab-dates-v1') || '{}');
      Object.keys(sqlDates).forEach(d => dates.add(d));
    } catch {}
    return dates;
  }

  const practiceDates = getPracticeDates();

  // Build 52-week grid (364 days ending today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const heatmapDays = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    heatmapDays.push(d.toISOString().slice(0, 10));
  }

  // Streak: consecutive days ending today
  let streak = 0;
  for (let i = 0; i < 364; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (practiceDates.has(ds)) streak++;
    else break;
  }

  // Role Readiness Score
  let readinessLevel, readinessDesc, readinessColor;
  if (totalCompleted >= 60) {
    readinessLevel = 'Staff Level';
    readinessDesc = 'Consistently strong across stats, experimentation, growth, and communication.';
    readinessColor = 'var(--teal)';
  } else if (totalCompleted >= 30) {
    readinessLevel = 'Senior Ready';
    readinessDesc = 'Solid foundation. Focus on advanced causal inference and cross-functional cases.';
    readinessColor = 'var(--yellow)';
  } else if (totalCompleted >= 10) {
    readinessLevel = 'Analyst Ready';
    readinessDesc = 'Good core skills. Deepen RCA, growth analytics, and experiment design.';
    readinessColor = 'var(--green)';
  } else {
    readinessLevel = 'Getting Started';
    readinessDesc = 'Complete more cases to unlock your readiness assessment.';
    readinessColor = 'var(--text-muted)';
  }

  // Section open/closed state
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [reviewQueueOpen, setReviewQueueOpen] = useState(true);
  const [roomProgressOpen, setRoomProgressOpen] = useState(true);
  const [studyPlanOpen, setStudyPlanOpen] = useState(true);
  const [sqlLabOpen, setSqlLabOpen] = useState(true);
  const [challengeLogOpen, setChallengeLogOpen] = useState(true);
  const [learningPathsOpen, setLearningPathsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Learning path checkpoint progress
  function getLPProgress(pathId) {
    try { return JSON.parse(localStorage.getItem('pal-lp-' + pathId + '-v1') || '[]'); } catch { return []; }
  }
  function markLPStep(pathId, stepId) {
    const done = getLPProgress(pathId);
    if (!done.includes(stepId)) {
      const next = [...done, stepId];
      localStorage.setItem('pal-lp-' + pathId + '-v1', JSON.stringify(next));
    }
  }
  function unmarkLPStep(pathId, stepId) {
    const done = getLPProgress(pathId).filter(id => id !== stepId);
    localStorage.setItem('pal-lp-' + pathId + '-v1', JSON.stringify(done));
  }

  // Challenge Log — collect 10 most recent completions across all rooms
  const recentCompletions = (() => {
    const entries = [];
    const ROOM_STORES = [
      { key: 'pal-stats-progress-v1',            room: 'Stats',          page: 'stats' },
      { key: 'pal-metrics-progress-v2',           room: 'Metrics',        page: 'metrics' },
      { key: 'pal-rca-progress-v2',               room: 'RCA',            page: 'rca' },
      { key: 'pal-cases-progress-v2',             room: 'Cases',          page: 'cases' },
      { key: 'exp-lab-progress-v1',               room: 'Review',         page: 'browser' },
      { key: 'pal-behavioral-progress-v1',        room: 'Behavioral',     page: 'behavioral' },
      { key: 'pal-estimation-progress-v1',        room: 'Estimation',     page: 'estimation' },
      { key: 'pal-growth-analytics-progress-v1',  room: 'Growth',         page: 'growth-analytics' },
      { key: 'pal-bi-progress-v1',                room: 'BI',             page: 'bi' },
      { key: 'pal-stf-progress-v1',               room: 'Spot the Flaw',  page: 'spot-the-flaw' },
      { key: 'pal-instrumentation-progress-v1',   room: 'Instrumentation',page: 'instrumentation' },
      { key: 'pal-prioritization-progress-v1',    room: 'Prioritization', page: 'prioritization' },
      { key: 'pal-takehome-progress-v1',          room: 'Take-Home',      page: 'take-home' },
    ];
    ROOM_STORES.forEach(({ key, room, page }) => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        Object.entries(data).forEach(([id, val]) => {
          const ts = val.completedAt || val.lastCompletedAt;
          const rating = val.rating || val.level || null;
          if (ts) entries.push({ id, room, page, ts, rating });
        });
      } catch {}
    });
    return entries.sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 10);
  })();

  function handleClear() {
    if (window.confirm('Clear all progress across all rooms? This cannot be undone.')) {
      // Previously only cleared 6 hardcoded keys (Review/Design/Stats/Metrics/RCA/Cases) —
      // silently left every other room (Foundations, SQL Lab, Growth Analytics, Behavioral,
      // Estimation, Prioritization, Product Design, etc.) untouched despite the "all rooms"
      // label, never told the server so a later sync could restore the "cleared" rooms, and
      // never recomputed the leaderboard score. Use the same full key list syncProgress.js
      // already maintains so this button actually does what it says.
      const toRemove = [...PROGRESS_KEYS];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && DYNAMIC_PREFIXES.some(prefix => k.startsWith(prefix))) toRemove.push(k);
        }
      } catch {}
      toRemove.forEach(k => { try { localStorage.removeItem(k); } catch {} });
      deleteProgressKeys(toRemove);   // clear the server copies too — else the next sync restores them
      clearProgress();
      if (user) upsertLeaderboardRow(user); // keep the weighted score in sync with the reset
      onClear();
    }
  }

  // Empty state for brand-new users with zero completions
  // Spaced-repetition Review queue — due count (guarded; 0 if queue empty/absent)
  let srDueCount = 0;
  try { srDueCount = getDueReviews().length; } catch { srDueCount = 0; }

  const allRoomTotal = allRoomProgress.reduce((sum, r) => sum + r.completed, 0);
  if (allRoomTotal === 0) {
    return (
      <div className="pal-page-enter" style={{ maxWidth: '620px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
          Progress
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6, margin: '0 0 0.25rem 0' }}>
          PAL builds your product analytics judgment through practice.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
          Complete cases across rooms to track your progress here.
        </p>
        <div
          className="pal-card-enter pal-card-hover"
          onClick={() => onNavigate('metrics-foundations')}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '2rem 1.5rem',
            cursor: 'pointer',
            textAlign: 'left',
            maxWidth: '440px',
            margin: '0 auto',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            Start Here
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Metrics Foundations
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
            Learn how product teams define and track success — the foundation of every analytics conversation.
          </p>
          <span
            className="pal-glow-pulse"
            style={{
              display: 'inline-block',
              background: 'var(--accent)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
            }}
          >
            Start Learning &rarr;
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="pal-page-enter" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', marginBottom: '0.4rem' }}>
            {universeView ? 'Analyst Universe' : 'Progress'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            {universeView
              ? 'Your mastery across the analyst workflow — one interconnected loop.'
              : totalCompleted + ' of ' + grandTotal + ' items completed across all rooms'}
          </p>
        </div>
        {SHOW_UNIVERSE_TOGGLE && (
          <button
            onClick={() => setUniverseView(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: universeView ? 'var(--accent-bg)' : 'var(--surface)',
              border: '1px solid ' + (universeView ? 'var(--accent-border)' : 'var(--border)'),
              borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.875rem',
              fontSize: '0.78rem', fontWeight: 600,
              color: universeView ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap',
            }}
          >
            {universeView ? '← Progress' : <><Icon name='sparkle' size={13} color='currentColor' /> Universe</>}
          </button>
        )}
      </div>

      {/* Daily Drill — Progress is the signed-in landing page (home redirects
          here), so the daily loop must live HERE to be seen. Home keeps its
          copy for signed-out visitors; the card is idempotent (same storage key). */}
      {!universeView && (
        <div style={{ marginBottom: '1.25rem' }}>
          <DailyDrill onTrain={() => onNavigate && onNavigate('foundations')} />
        </div>
      )}

      {/* Universe view */}
      {universeView && (
        <UniverseView
          allRoomProgress={allRoomProgress}
          onArmClick={(roomId) => {
            setUniverseView(false);
            onNavigate(roomId);
          }}
        />
      )}

      {!universeView && <>

      {/* Readiness countdown — headline "are you ready for your interview" metric */}
      <ReadinessWidget allProgress={allRoomProgress} onNavigate={onNavigate} />

      {/* Spaced-repetition Review — surfaced only when cases are due */}
      {srDueCount > 0 && (
        <div className="pal-card-enter" style={{
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <Icon name='rotate-ccw' size={18} color='var(--accent)' />
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Review due
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>
                {srDueCount} case{srDueCount !== 1 ? 's' : ''} ready to review
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('review-queue')}
            style={{
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: '8px',
              padding: '0.5rem 1.1rem', fontSize: '0.875rem',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            Review now →
          </button>
        </div>
      )}

      {/* Returning user next-suggestion card — shown when user has prior activity */}
      {totalCompleted > 0 && nextSuggested && (
        <div className="pal-card-enter" style={{
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              Continue where you left off
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>
              {nextSuggested.room} — {nextSuggested.label}
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate(nextSuggested.nav)}
            style={{
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: '8px',
              padding: '0.5rem 1.1rem', fontSize: '0.875rem',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            Continue →
          </button>
        </div>
      )}

      {/* Day-1 empty state — shown when user has never completed anything */}
      {totalCompleted === 0 && (
        <div className="pal-card-enter" style={{
          border: '1px solid var(--accent-border)',
          background: 'var(--accent-bg)',
          borderRadius: '12px',
          padding: '1.5rem 1.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            You haven't practiced yet — pick a room and start.
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            PAL puts you in the decision, not a reading situation. Metrics and RCA are the two rooms that show up most in product analytics interviews — start with either.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <button
              onClick={() => onNavigate && onNavigate('metrics')}
              style={{
                background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: '8px',
                padding: '0.55rem 1.1rem', fontSize: '0.875rem',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Start Metrics →
            </button>
            <button
              onClick={() => onNavigate && onNavigate('rca')}
              style={{
                background: 'var(--surface-2)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: '8px',
                padding: '0.55rem 1.1rem', fontSize: '0.875rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Start RCA →
            </button>
            <button
              onClick={() => onNavigate && onNavigate('sql-lab')}
              style={{
                background: 'var(--surface-2)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: '8px',
                padding: '0.55rem 1.1rem', fontSize: '0.875rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Try SQL Lab →
            </button>
          </div>
        </div>
      )}

      {/* Sticky summary bar */}
      <div style={{
        background: 'var(--accent)',
        borderRadius: '10px',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        gap: '2rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{totalCompleted} completed</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>Role: {readinessLevel}</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{streak > 0 ? `${streak} day streak` : 'No streak yet'}</span>
      </div>

      {/* Overview Section */}
      <SectionCard
        icon="~"
        title="Overview"
        open={overviewOpen}
        onToggle={() => setOverviewOpen(o => !o)}
      >
        {/* Readiness Level Card */}
        <div style={{
          border: `1px solid var(--border)`,
          borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
        }}>
          <div style={{
            fontSize: '1.35rem', fontWeight: 800, color: readinessColor,
            letterSpacing: '-0.02em', lineHeight: 1,
          }}>{readinessLevel}</div>
          <div style={{ height: '28px', width: '1px', background: 'var(--border)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1, minWidth: '180px' }}>
            {readinessDesc}
          </div>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '20px', padding: '0.2rem 0.6rem', whiteSpace: 'nowrap',
          }}>{totalCompleted} completed</div>
        </div>

        {/* Activity Heatmap — canonical section 2 (after readiness, before completion by area) */}
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.9rem' }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.09em', color: 'var(--text-dim)',
            }}>Activity Heatmap</div>
            {streak > 0 && (
              <span style={{
                fontSize: '0.68rem', fontWeight: 700,
                background: 'var(--surface-2)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '10px', padding: '0.1rem 0.5rem',
              }}>{streak} day{streak !== 1 ? 's' : ''} streak</span>
            )}
            {streak === 0 && (
              <span style={{
                fontSize: '0.68rem', color: 'var(--text-dim)',
              }}>Practice today to start a streak</span>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(52, 10px)',
              gridTemplateRows: 'repeat(7, 10px)',
              gridAutoFlow: 'column',
              gap: '2px',
              width: 'max-content',
            }}>
              {heatmapDays.map(day => (
                <div
                  key={day}
                  title={day}
                  style={{
                    width: '10px', height: '10px', borderRadius: '2px',
                    background: practiceDates.has(day) ? 'var(--accent)' : 'var(--surface)',
                    border: practiceDates.has(day) ? 'none' : '1px solid var(--border)',
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
            Last year
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '1.25rem', alignItems: 'start' }}>

          {/* Completion by area — Readiness by room */}
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '1.5rem',
            order: totalCompleted === 0 ? 2 : 1,
          }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.09em', color: 'var(--text-dim)', marginBottom: '1.1rem',
            }}>Readiness by room</div>

            {allRoomProgress.map(r => (
              <RoomReadinessBar
                key={r.label}
                label={r.label}
                completed={r.completed}
                total={r.total}
                bestLevel={r.best}
                onReset={r.onReset}
              />
            ))}

            {totalCompleted > 0 && (
              <div style={{
                marginTop: '1rem', paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex', flexDirection: 'column', gap: '0.4rem',
              }}>
                {strongest && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>▲ </span>
                    Strongest area: <strong>{strongest.label}</strong>
                  </div>
                )}
                {weakest && weakest.completed === 0 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>◯ </span>
                    Not started: <strong>{weakest.label}</strong>
                  </div>
                )}
                {nextSuggested && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      onClick={() => onNavigate && onNavigate(nextSuggested.nav)}
                      style={{
                        width: '100%',
                        background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                        borderRadius: 'var(--radius)', padding: '0.5rem 0.75rem',
                        color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600,
                        cursor: 'pointer', textAlign: 'left',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                    >
                      <span>Next: {nextSuggested.room} — {nextSuggested.label}</span>
                      <span>→</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {totalCompleted === 0 && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center', paddingTop: '0.5rem' }}>
                Complete items in any room to see readiness here.
              </div>
            )}
          </div>

          {/* Guided Paths */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', order: totalCompleted === 0 ? 1 : 2 }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.09em', color: 'var(--text-dim)', marginBottom: '0.25rem',
            }}>Guided paths</div>
            {learningPaths.map(path => (
              <GuidedPathCard
                key={path.id}
                path={path}
                completionMap={completionMap}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Study Plan Section */}
      <SectionCard
        icon="--"
        title="Study Plan"
        open={studyPlanOpen}
        onToggle={() => setStudyPlanOpen(o => !o)}
      >
      {/* Study Plan — "What to Study Next" */}
      {(() => {
        // ── Collect per-room summaries ──────────────────────────────────────
        const sfCompleted   = statsFoundationsModules.filter(m => sfProgress[m.id]?.completedAt).length;
        const gaAttempted   = growthAnalyticsCases.filter(c => gaProgress[c.id]?.rating).length;
        const behAttempted  = behavioralQuestions.filter(q => behavioralProgress[q.id]?.rating).length;
        const estAttempted  = estimationProblems.filter(p => estimationProg[p.id]?.rating).length;
        const priAttempted  = prioritizationScenarios.filter(s => priProgress[s.id]?.completedAt).length;

        // Days-ago helper
        function daysAgo(isoTs) {
          if (!isoTs) return null;
          const diff = Date.now() - new Date(isoTs).getTime();
          return Math.floor(diff / 86400000);
        }

        const recommendations = [];

        // ── 1. REVISIT — GA/Behavioral/Estimation rated ≤ 2 (miss/weak) ───────
        // GA misses (rating 1–2)
        growthAnalyticsCases.forEach(c => {
          const p = gaProgress[c.id];
          if (p?.rating && p.rating <= 2) {
            const d = daysAgo(p.completedAt);
            recommendations.push({
              type: 'revisit',
              icon: '·',
              title: `Revisit — ${c.id}: ${c.title}`,
              reason: `You rated this ${p.rating === 1 ? '"miss"' : '"weak"'}${d !== null ? ` ${d === 0 ? 'today' : `${d} day${d !== 1 ? 's' : ''} ago`}` : ''}.`,
              nav: 'growth-analytics',
              priority: 10 - p.rating,
            });
          }
        });
        // Behavioral misses (rating ≤ 2)
        behavioralQuestions.forEach(q => {
          const p = behavioralProgress[q.id];
          if (p?.rating && p.rating <= 2) {
            const d = daysAgo(p.completedAt);
            recommendations.push({
              type: 'revisit',
              icon: '·',
              title: `Revisit — ${q.title}`,
              reason: `You rated this ${p.rating === 1 ? '"miss"' : '"weak"'}${d !== null ? ` ${d === 0 ? 'today' : `${d} day${d !== 1 ? 's' : ''} ago`}` : ''}. Behavioral answers need sharpening.`,
              nav: 'behavioral',
              priority: 10 - p.rating,
            });
          }
        });
        // Estimation misses (rating ≤ 2)
        estimationProblems.forEach(ep => {
          const p = estimationProg[ep.id];
          if (p?.rating && p.rating <= 2) {
            const d = daysAgo(p.completedAt);
            recommendations.push({
              type: 'revisit',
              icon: '·',
              title: `Revisit — ${ep.title}`,
              reason: `You rated this ${p.rating === 1 ? '"miss"' : '"weak"'}${d !== null ? ` ${d === 0 ? 'today' : `${d} day${d !== 1 ? 's' : ''} ago`}` : ''}. Estimation frameworks need more practice.`,
              nav: 'estimation',
              priority: 10 - p.rating,
            });
          }
        });
        // Stats stuck at wrong/partial level
        statsModules.forEach(m => {
          const p = statsProgress[m.id];
          if (p?.attempts > 0 && (p.level === 'wrong' || p.level === 'partial')) {
            recommendations.push({
              type: 'revisit',
              icon: '·',
              title: `Revisit Stats — ${m.title}`,
              reason: `You scored "${p.level}" after ${p.attempts} attempt${p.attempts !== 1 ? 's' : ''}. One more pass should lock this in.`,
              nav: 'stats',
              priority: p.level === 'wrong' ? 9 : 7,
            });
          }
        });

        // ── 2. CROSS-ROOM BRIDGE — GA done but no SF, or SF done but no GA ────
        if (gaAttempted >= 2 && sfCompleted === 0) {
          recommendations.push({
            type: 'bridge',
            icon: '·',
            title: 'Start Stat Foundations',
            reason: `You've done ${gaAttempted} Growth Analytics case${gaAttempted !== 1 ? 's' : ''} but haven't touched Stat Foundations — the theory will make GA problems much clearer.`,
            nav: 'stat-foundations',
            priority: 8,
          });
        }
        if (sfCompleted >= 5 && gaAttempted === 0) {
          recommendations.push({
            type: 'bridge',
            icon: '·',
            title: 'Apply your stats in Growth Analytics',
            reason: `You've completed ${sfCompleted} Stat Foundations modules. Growth Analytics is the next step to apply that knowledge to real business cases.`,
            nav: 'growth-analytics',
            priority: 8,
          });
        }
        // Behavioral bridge: done lots of cases but no behavioral
        if ((casesCompleted.length >= 3 || gaAttempted >= 3) && behAttempted === 0) {
          recommendations.push({
            type: 'bridge',
            icon: '·',
            title: 'Add Behavioral practice',
            reason: `You've been grinding analytical rooms but haven't practiced behavioral questions — interviewers always ask both.`,
            nav: 'behavioral',
            priority: 6,
          });
        }

        // ── 3. UNTOUCHED ROOMS — completedCount === 0 ────────────────────────
        const untouchedCandidates = [
          { label: 'Growth Analytics', nav: 'growth-analytics', done: gaAttempted, total: growthAnalyticsCases.length, note: 'Cohort retention, DAU decomposition, funnels — the bread-and-butter of PM/DS interviews.' },
          { label: 'Stat Foundations', nav: 'stat-foundations', done: sfCompleted, total: statsFoundationsModules.length, note: 'Build the statistical intuition behind every experiment you\'ll ever run.' },
          { label: 'Estimation', nav: 'estimation', done: estAttempted, total: estimationProblems.length, note: 'Fermi estimation shows up in every PM interview — start here if you haven\'t.' },
          { label: 'Behavioral', nav: 'behavioral', done: behAttempted, total: behavioralQuestions.length, note: 'STAR-format practice for leadership and influence questions.' },
          { label: 'Prioritization', nav: 'prioritization', done: priAttempted, total: prioritizationScenarios.length, note: 'PM-critical skill — practice frameworks like RICE and cost-of-delay.' },
          { label: 'Stats', nav: 'stats', done: statsCompleted.length, total: statsModules.length, note: 'Core statistical inference questions every DS interview includes.' },
          { label: 'RCA', nav: 'rca', done: rcaCompleted.length, total: rcaCases.length, note: 'Root cause analysis — diagnosis is half the interview.' },
          { label: 'Metrics', nav: 'metrics', done: metricsCompleted.length, total: metricCases.length, note: 'Define metrics, catch traps, handle proxy metrics.' },
        ];
        untouchedCandidates.forEach(r => {
          if (r.done === 0) {
            recommendations.push({
              type: 'new',
              icon: '·',
              title: `Start ${r.label}`,
              reason: r.note,
              nav: r.nav,
              priority: 5,
            });
          }
        });

        // ── 4. LEVEL-UP — room ≥ 50% but all done items at junior/analyst level ─
        const roomsToLevelUp = [
          { label: 'Stats', items: statsModules, prog: statsProgress, nav: 'stats', levelField: 'level' },
          { label: 'Metrics', items: metricCases, prog: metricsProgress, nav: 'metrics', levelField: 'level' },
          { label: 'RCA', items: rcaCases, prog: rcaProgress, nav: 'rca', levelField: 'level' },
        ];
        roomsToLevelUp.forEach(room => {
          const attempted = room.items.filter(i => room.prog[i.id]?.attempts > 0);
          const pct = room.items.length > 0 ? attempted.length / room.items.length : 0;
          if (pct >= 0.5 && attempted.length >= 3) {
            const allLow = attempted.every(i => {
              const lvl = room.prog[i.id]?.level;
              return lvl === 'wrong' || lvl === 'partial' || lvl === 'junior' || lvl === 'analyst';
            });
            if (allLow) {
              recommendations.push({
                type: 'levelup',
                icon: '·',
                title: `Level up in ${room.label}`,
                reason: `You've attempted ${attempted.length}/${room.items.length} ${room.label} problems but are still scoring at junior/analyst level. Try harder problems with a tighter framework.`,
                nav: room.nav,
                priority: 4,
              });
            }
          }
        });

        // ── Sort, dedup by nav target, cap at 5 ──────────────────────────────
        const seen = new Set();
        const topRecs = recommendations
          .sort((a, b) => b.priority - a.priority)
          .filter(r => {
            // For revisit type, allow multiple (different titles). For others, deduplicate by nav.
            if (r.type === 'revisit') return true;
            if (seen.has(r.nav)) return false;
            seen.add(r.nav);
            return true;
          })
          .slice(0, 5);

        // ── Type → color mapping ──────────────────────────────────────────────
        const typeStyle = {
          revisit: { color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)',   btnBg: 'var(--teal-bg)',   btnBorder: 'var(--teal-border)',   btnColor: 'var(--teal)'   },
          new:     { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)',  btnBg: 'var(--green-bg)',  btnBorder: 'var(--green-border)',  btnColor: 'var(--green)'  },
          levelup: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)', btnBg: 'var(--yellow-bg)', btnBorder: 'var(--yellow-border)', btnColor: 'var(--yellow)' },
          bridge:  { color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)', btnBg: 'var(--purple-bg)', btnBorder: 'var(--purple-border)', btnColor: 'var(--purple)' },
        };

        const everythingStrong =
          totalCompleted > 0 &&
          recommendations.filter(r => r.type === 'revisit' || r.type === 'levelup').length === 0 &&
          topRecs.length === 0;

        return (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)', marginTop: '1.25rem',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.09em', color: 'var(--text-dim)', marginBottom: '0.2rem',
                }}>Study Plan</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Personalized based on your history
                </div>
              </div>
              {topRecs.length > 0 && (
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700,
                  background: 'var(--accent-bg)', color: 'var(--accent)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: '10px', padding: '0.1rem 0.5rem',
                }}>{topRecs.length} suggestion{topRecs.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            {/* "Crushing it" / new user state */}
            {(everythingStrong || (totalCompleted === 0 && topRecs.length === 0)) && (
              <div style={{
                background: totalCompleted === 0 ? 'var(--surface)' : 'var(--green-bg)',
                border: totalCompleted === 0 ? '1px solid var(--border)' : '1px solid var(--green-border)',
                borderRadius: '8px', padding: '1.1rem 1.25rem',
              }}>
                {totalCompleted === 0 ? (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)', marginBottom: '0.35rem' }}>
                      You haven't completed any cases yet
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.55 }}>
                      Start with Stat Foundations — it's the floor that every other room builds on. Your progress across all rooms will appear here once you begin.
                    </div>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('stat-foundations')}
                        style={{
                          background: 'var(--teal)', border: 'none',
                          borderRadius: '6px', padding: '0.45rem 0.9rem',
                          color: '#fff', fontSize: '0.82rem', fontWeight: 700,
                          cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                      >Start Stat Foundations →</button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--green)', fontWeight: 600 }}>
                      You're crushing it! Keep the streak going.
                    </div>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('growth-analytics')}
                        style={{
                          background: 'var(--green-bg)', border: '1px solid var(--green-border)',
                          borderRadius: '6px', padding: '0.4rem 0.75rem',
                          color: 'var(--green)', fontSize: '0.78rem', fontWeight: 700,
                          cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                      >Take Today's Drill →</button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Recommendation list */}
            {topRecs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {topRecs.map((rec, idx) => {
                  const ts = typeStyle[rec.type] || typeStyle.new;
                  return (
                    <div
                      key={`${rec.type}-${rec.nav}-${idx}`}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderLeft: `4px solid ${ts.color}`,
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        display: 'flex', alignItems: 'flex-start',
                        justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap',
                      }}
                    >
                      {/* Rank + content */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 800,
                          color: ts.color, background: ts.bg,
                          border: `1px solid ${ts.border}`,
                          borderRadius: '4px', padding: '0.1rem 0.35rem',
                          flexShrink: 0, marginTop: '0.1rem',
                        }}>{idx + 1}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '0.95rem' }}>{rec.icon}</span>
                            <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.87rem' }}>{rec.title}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{rec.reason}</div>
                        </div>
                      </div>
                      {/* Action button */}
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate(rec.nav)}
                          style={{
                            background: ts.btnBg, border: `1px solid ${ts.btnBorder}`,
                            borderRadius: '6px', padding: '0.35rem 0.7rem',
                            color: ts.btnColor, fontSize: '0.75rem', fontWeight: 700,
                            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                          }}
                        >Open →</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
      </SectionCard>

      {/* Review Queue Section */}
      {(() => {
        const queueMap = new Map(); // key → item, for dedup

        function addOrMerge(key, item) {
          if (queueMap.has(key)) {
            const existing = queueMap.get(key);
            // Keep lower rating if both have ratings; keep more attempts signal
            if (item.rating !== null && (existing.rating === null || item.rating < existing.rating)) existing.rating = item.rating;
            if (item.attempts > (existing.attempts || 0)) existing.attempts = item.attempts;
          } else {
            queueMap.set(key, { ...item, attempts: item.attempts || 0 });
          }
        }

        // Low-rated behavioral
        behavioralQuestions.forEach(q => {
          const p = behavioralProgress[q.id];
          if (p?.rating && p.rating <= 2) {
            addOrMerge(`behavioral-${q.id}`, { room: 'behavioral', id: q.id, title: q.title, subtitle: q.subtitle, rating: p.rating, color: 'var(--purple)' });
          }
        });

        // Low-rated estimation
        estimationProblems.forEach(ep => {
          const p = estimationProg[ep.id];
          if (p?.rating && p.rating <= 2) {
            addOrMerge(`estimation-${ep.id}`, { room: 'estimation', id: ep.id, title: ep.title, subtitle: ep.subtitle, rating: p.rating, color: 'var(--teal)' });
          }
        });

        // Multi-attempt stats (attempts > 2 signals difficulty)
        statsModules.forEach(m => {
          const p = statsProgress[m.id];
          if (p?.attempts > 2) {
            addOrMerge(`stats-${m.id}`, { room: 'stats', id: m.id, title: m.title, subtitle: m.subtitle || '', rating: null, attempts: p.attempts, color: 'var(--accent)' });
          }
        });

        // Multi-attempt RCA (attempts > 1)
        rcaCases.forEach(c => {
          const p = rcaProgress[c.id];
          if (p?.attempts > 1) {
            addOrMerge(`rca-${c.id}`, { room: 'rca', id: c.id, title: c.title, subtitle: c.subtitle || '', rating: null, attempts: p.attempts, color: 'var(--yellow)' });
          }
        });

        // Stats cases never scored above 'analyst' level (attempted but stuck at junior/analyst)
        statsModules.forEach(m => {
          const p = statsProgress[m.id];
          if (p?.attempts > 0 && p?.level && (p.level === 'junior' || p.level === 'analyst' || p.level === 'wrong' || p.level === 'partial')) {
            addOrMerge(`stats-${m.id}`, { room: 'stats', id: m.id, title: m.title, subtitle: m.subtitle || '', rating: null, attempts: p.attempts || 1, color: 'var(--accent)' });
          }
        });

        // Metrics cases never scored above 'analyst'
        metricCases.forEach(c => {
          const p = metricsProgress[c.id];
          if (p?.attempts > 0 && p?.level && (p.level === 'junior' || p.level === 'analyst' || p.level === 'wrong' || p.level === 'partial')) {
            addOrMerge(`metrics-${c.id}`, { room: 'metrics', id: c.id, title: c.title, subtitle: c.subtitle || '', rating: null, attempts: p.attempts || 1, color: 'var(--green)' });
          }
        });

        // RCA cases never scored above 'analyst'
        rcaCases.forEach(c => {
          const p = rcaProgress[c.id];
          if (p?.attempts > 0 && p?.level && (p.level === 'junior' || p.level === 'analyst' || p.level === 'wrong' || p.level === 'partial')) {
            addOrMerge(`rca-${c.id}`, { room: 'rca', id: c.id, title: c.title, subtitle: c.subtitle || '', rating: null, attempts: p.attempts || 1, color: 'var(--yellow)' });
          }
        });

        // Cases room never scored above 'analyst'
        businessCases.forEach(c => {
          const p = caseProgress[c.id];
          if (p?.attempts > 0 && p?.level && (p.level === 'junior' || p.level === 'analyst' || p.level === 'wrong' || p.level === 'partial')) {
            addOrMerge(`cases-${c.id}`, { room: 'cases', id: c.id, title: c.title, subtitle: c.subtitle || '', rating: null, attempts: p.attempts || 1, color: 'var(--purple)' });
          }
        });

        // Sort: low rating first (nulls last), then many attempts first. Cap at 10.
        const reviewQueue = [...queueMap.values()]
          .sort((a, b) => {
            const aRating = a.rating ?? 99;
            const bRating = b.rating ?? 99;
            if (aRating !== bRating) return aRating - bRating;
            return (b.attempts || 0) - (a.attempts || 0);
          })
          .slice(0, 10);

        if (reviewQueue.length === 0) return null;

        return (
          <SectionCard
            icon=">"
            title="Review Queue"
            open={reviewQueueOpen}
            onToggle={() => setReviewQueueOpen(o => !o)}
            badge={reviewQueue.length}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {reviewQueue.map(item => (
                <div
                  key={`${item.room}-${item.id}`}
                  style={{
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: '8px', overflow: 'hidden',
                    display: 'flex', alignItems: 'stretch',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {/* Left color bar */}
                  <div style={{ width: '4px', flexShrink: 0, background: item.color }} />
                  {/* Content */}
                  <div style={{
                    flex: 1, padding: '0.75rem 1rem',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.87rem' }}>{item.title}</div>
                      {item.subtitle && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>{item.subtitle}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      {/* Room label chip */}
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 600,
                        color: 'var(--text-dim)', background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px', padding: '0.1rem 0.4rem',
                        textTransform: 'capitalize',
                      }}>{item.room}</span>
                      {/* Rating or retried badge */}
                      {item.rating !== null ? (
                        <span style={{ fontSize: '0.85rem', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Icon key={'f' + i} name='star-filled' size={13} color='var(--yellow)' />
                          ))}
                          {Array.from({ length: 5 - item.rating }).map((_, i) => (
                            <Icon key={'e' + i} name='star' size={13} color='var(--border)' />
                          ))}
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700,
                          color: 'var(--yellow)', background: 'var(--yellow-bg)',
                          border: '1px solid var(--yellow-border)',
                          borderRadius: '4px', padding: '0.1rem 0.4rem',
                        }}>Retried</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        );
      })()}

      {/* Room Progress Section */}
      <SectionCard
        icon="#"
        title="Room Progress"
        open={roomProgressOpen}
        onToggle={() => setRoomProgressOpen(o => !o)}
        badge={completed.length > 0 ? completed.length : undefined}
      >
        {completed.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.09em', color: 'var(--text-dim)', marginBottom: '0.5rem',
            }}>Review Room — completed scenarios</div>
            {completed.map((scenario, index) => {
              const progress = allProgress[scenario.id];
              const lastLevel = progress.attempts?.slice(-1)[0];
              const levelCfg = LEVEL_LABELS[lastLevel] || LEVEL_LABELS.analyst;
              return (
                <div
                  key={scenario.id}
                  className="pal-card-enter pal-card-hover"
                  onClick={() => onSelect(scenario.id)}
                  style={{
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: '8px', padding: '0.75rem 1rem',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '0.75rem',
                    transition: 'border-color 0.15s',
                    boxShadow: 'var(--shadow-sm)',
                    animationDelay: (Math.min(index * 28, 400)) + 'ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: 'var(--green)', fontSize: '0.8rem' }}><Icon name='check' size={13} color='var(--green)' /></span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.87rem' }}>{scenario.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>
                        {progress.attempts.length} attempt{progress.attempts.length !== 1 ? 's' : ''} ·
                        Last: {new Date(progress.lastAttemptAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <LevelBadge level={lastLevel} />
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center', padding: '0.5rem 0' }}>
            No Review Room scenarios completed yet.
          </div>
        )}
      </SectionCard>

      {/* SQL Lab Section */}
      {(() => {
        const diffs = ['Easy', 'Medium', 'Hard', 'Master', 'Forensic'];
        const totals = { Easy: 47, Medium: 73, Hard: 17, Master: 19, Forensic: 36 };
        const diffColors = { Easy: 'var(--green)', Medium: 'var(--yellow)', Hard: 'var(--red)', Master: 'var(--purple)', Forensic: 'var(--teal)' };
        const byDiff = {};
        diffs.forEach(d => {
          byDiff[d] = sqlLabProblems.filter(p => p.difficulty === d && sqlSolved.has(p.id)).length;
        });
        const totalSqlSolved = sqlLabProblems.filter(p => sqlSolved.has(p.id)).length;
        const totalTimeSec = Object.values(sqlTimes).reduce((s, t) => s + (t || 0), 0);
        const totalTimeMin = Math.round(totalTimeSec / 60);
        return (
          <SectionCard
            icon="<>"
            title="SQL Lab"
            open={sqlLabOpen}
            onToggle={() => setSqlLabOpen(o => !o)}
            badge={totalSqlSolved > 0 ? totalSqlSolved : undefined}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Summary row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--teal)' }}>{totalSqlSolved}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>/ {sqlLabProblems.length} solved</span>
                </div>
                {totalTimeMin > 0 && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Icon name='timer' size={13} color='currentColor' /> {totalTimeMin} min total practice time
                  </div>
                )}
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('sql-lab')}
                    style={{
                      marginLeft: 'auto', padding: '0.35rem 0.8rem', borderRadius: '6px',
                      background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.25)',
                      color: 'var(--teal)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                    }}
                  >Open SQL Lab →</button>
                )}
              </div>
              {/* Continue-strip (T3, brainstorm §7): resume last-touched problem + next
                  unstarted, deep-linked via the existing #/sql-lab/<id> hash format. */}
              {(() => {
                let lastTouched = null;
                try { lastTouched = JSON.parse(localStorage.getItem('pal-sql-last-v1') || 'null'); } catch {}
                const continueProblem = lastTouched && lastTouched.id ? sqlLabProblems.find(p => p.id === lastTouched.id) : null;
                const nextUpId = sqlLabProblems.find(p => !sqlSolved.has(p.id))?.id;
                const nextUpProblem = nextUpId ? sqlLabProblems.find(p => p.id === nextUpId) : null;
                if (!continueProblem && !nextUpProblem) return null;
                return (
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {continueProblem && (
                      <a
                        href={`#/sql-lab/${continueProblem.id}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.45rem 0.75rem', borderRadius: '8px',
                          background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.25)',
                          color: 'var(--teal)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none',
                        }}
                      >
                        Continue: {continueProblem.title} · {continueProblem.difficulty} · {totalSqlSolved}/{sqlLabProblems.length}
                      </a>
                    )}
                    {nextUpProblem && nextUpProblem.id !== continueProblem?.id && (
                      <a
                        href={`#/sql-lab/${nextUpProblem.id}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.45rem 0.75rem', borderRadius: '8px',
                          background: 'var(--surface-2)', border: '1px solid var(--border)',
                          color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none',
                        }}
                      >
                        Next up: {nextUpProblem.title}
                      </a>
                    )}
                  </div>
                );
              })()}
              {/* Progress bar */}
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalSqlSolved / sqlLabProblems.length * 100}%`, background: 'var(--teal)', borderRadius: 99, transition: 'width 0.4s' }} />
              </div>
              {/* By difficulty */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))', gap: '0.6rem' }}>
                {diffs.map(d => {
                  const done = byDiff[d];
                  const tot = totals[d];
                  const col = diffColors[d];
                  return (
                    <div key={d} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '0.65rem 0.875rem' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: col, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>{d}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)' }}>{done}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {tot}</span>
                      </div>
                      <div style={{ marginTop: '0.35rem', height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${done / tot * 100}%`, background: col, borderRadius: 99 }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interview Readiness Score */}
              {totalSqlSolved >= 1 && (() => {
                var diffWeights = { Easy: 1, Medium: 2, Hard: 3, Master: 4, Forensic: 5 };
                var maxPts = sqlLabProblems.reduce(function(sum, p) { return sum + (diffWeights[p.difficulty] || 1); }, 0);
                var rawPts = sqlLabProblems.reduce(function(sum, p) { return sqlSolved.has(p.id) ? sum + (diffWeights[p.difficulty] || 1) : sum; }, 0);
                var recencyFactor = 1;
                var daysSince = null;
                try {
                  var dDiary = JSON.parse(localStorage.getItem('pal-sql-lab-dates-v1') || '{}');
                  var latestD = Object.keys(dDiary).sort().pop();
                  if (latestD) {
                    daysSince = Math.floor((Date.now() - new Date(latestD).getTime()) / 86400000);
                    if (daysSince > 60) recencyFactor = 0.7;
                  }
                } catch {}
                var irs = Math.round((rawPts / maxPts) * 100 * recencyFactor);
                var irsLabel = irs < 25 ? 'Not Ready' : irs < 50 ? 'Building' : irs < 75 ? 'Nearly Ready' : 'Interview Ready';
                var irsColor = irs < 25 ? 'var(--red)' : irs < 50 ? 'var(--yellow)' : irs < 75 ? 'var(--teal)' : 'var(--green)';
                var circR = 28;
                var circC = 2 * Math.PI * circR;
                return (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.9rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>Interview Readiness</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ position: 'relative', flexShrink: 0, width: 72, height: 72 }}>
                        <svg width="72" height="72" viewBox="0 0 72 72">
                          <circle cx="36" cy="36" r={circR} fill="none" stroke="var(--border)" strokeWidth="6" />
                          <circle cx="36" cy="36" r={circR} fill="none" stroke={irsColor} strokeWidth="6"
                            strokeDasharray={circC}
                            strokeDashoffset={circC * (1 - irs / 100)}
                            strokeLinecap="round"
                            transform="rotate(-90 36 36)" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: irsColor, lineHeight: 1 }}>{irs}</span>
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: irsColor, marginBottom: '0.2rem' }}>{irsLabel}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          {rawPts} / {maxPts} weighted pts
                          {recencyFactor < 1 && daysSince !== null && (
                            <span style={{ display: 'block', color: 'var(--yellow)' }}>Score reduced — last practice {daysSince}d ago</span>
                          )}
                          {recencyFactor === 1 && daysSince !== null && daysSince <= 60 && (
                            <span style={{ display: 'block', color: 'var(--teal)' }}>Active in last 60 days</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Peer Benchmark — shown once leaderboard data loads */}
              {lbAgg && lbAgg.count > 1 && (() => {
                var userSql = totalSqlSolved;
                var ahead = lbAgg.sqlCounts.filter(function(n) { return n < userSql; }).length;
                var pct = Math.round((ahead / lbAgg.count) * 100);
                var userBarW = Math.min(100, lbAgg.avgSql > 0 ? (userSql / Math.max(userSql, lbAgg.avgSql, 1)) * 100 : 100);
                var avgBarW = Math.min(100, userSql > 0 ? (lbAgg.avgSql / Math.max(userSql, lbAgg.avgSql, 1)) * 100 : 50);
                var pctColor = pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--teal)' : pct >= 25 ? 'var(--yellow)' : 'var(--text-muted)';
                return (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Peer Benchmark</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lbAgg.count} users</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>You</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--teal)', fontWeight: 700 }}>{userSql} solved</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: userBarW + '%', background: 'var(--teal)', borderRadius: 99, transition: 'width 0.4s' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Leaderboard avg</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lbAgg.avgSql} solved</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: avgBarW + '%', background: 'var(--border-strong, #4b5563)', borderRadius: 99 }} />
                        </div>
                      </div>
                    </div>
                    {userSql > 0 && (
                      <div style={{ marginTop: '0.65rem', fontSize: '0.75rem' }}>
                        <span style={{ color: pctColor, fontWeight: 700 }}>Top {100 - pct}%</span>
                        <span style={{ color: 'var(--text-muted)' }}> — ahead of {pct}% of users on SQL</span>
                      </div>
                    )}
                    {userSql === 0 && (
                      <div style={{ marginTop: '0.65rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Solve your first problem to see where you stand.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Weak Topics — only when user has enough solves to show meaningful gaps */}
              {totalSqlSolved >= 5 && (() => {
                const tagStats = {};
                sqlLabProblems.forEach(function(p) {
                  (p.tags || []).forEach(function(tag) {
                    if (!tagStats[tag]) tagStats[tag] = { total: 0, solved: 0 };
                    tagStats[tag].total++;
                    if (sqlSolved.has(p.id)) tagStats[tag].solved++;
                  });
                });
                const weakTopics = Object.entries(tagStats)
                  .filter(function(entry) { return entry[1].total >= 3 && entry[1].solved < entry[1].total; })
                  .map(function(entry) { return { tag: entry[0], total: entry[1].total, solved: entry[1].solved, rate: entry[1].solved / entry[1].total }; })
                  .sort(function(a, b) { return a.rate - b.rate; })
                  .slice(0, 6);
                if (weakTopics.length === 0) return null;
                function fmtTag(t) {
                  return t.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
                }
                return (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.9rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.65rem' }}>
                      Weak Topics
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {weakTopics.map(function(item) {
                        var barColor = item.rate < 0.3 ? 'var(--red)' : item.rate < 0.6 ? 'var(--yellow)' : 'var(--teal)';
                        return (
                          <div key={item.tag} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fmtTag(item.tag)}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '0.5rem' }}>{item.solved}/{item.total}</span>
                              </div>
                              <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: (item.rate * 100) + '%', background: barColor, borderRadius: 99 }} />
                              </div>
                            </div>
                            {onNavigate && (
                              <button
                                onClick={function() { onNavigate('sql-lab'); }}
                                style={{
                                  flexShrink: 0, padding: '0.25rem 0.6rem', borderRadius: '5px',
                                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                                  color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                                }}
                              >Practice →</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </SectionCard>
        );
      })()}

      {/* Learning Paths */}
      <SectionCard
        icon={<Icon name='map' size={16} color='currentColor' />}
        title="Learning Paths"
        open={learningPathsOpen}
        onToggle={() => setLearningPathsOpen(o => !o)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {LEARNING_PATHS.map(path => {
            const done = getLPProgress(path.id);
            const pct = path.steps.length > 0 ? Math.round((done.length / path.steps.length) * 100) : 0;
            return (
              <div key={path.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderLeft: '3px solid ' + path.color, borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{path.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{path.estimatedWeeks} weeks · {path.steps.length} steps</div>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: path.color }}>{pct}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--surface)', borderRadius: 99, overflow: 'hidden', marginBottom: '0.85rem' }}>
                  <div style={{ height: '100%', width: pct + '%', background: path.color, borderRadius: 99, transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {path.steps.map(step => {
                    const isDone = done.includes(step.id);
                    return (
                      <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <button
                          onClick={() => { isDone ? unmarkLPStep(path.id, step.id) : markLPStep(path.id, step.id); window.location.reload(); }}
                          style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid ' + (isDone ? path.color : 'var(--border)'), background: isDone ? path.color : 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {isDone && <span style={{ color: '#fff', fontSize: '10px', lineHeight: 1 }}><Icon name='check' size={11} color='#fff' /></span>}
                        </button>
                        <button
                          onClick={() => onNavigate && onNavigate(step.nav)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, flex: 1 }}
                        >
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isDone ? 'var(--text-muted)' : 'var(--text)', textDecoration: isDone ? 'line-through' : 'none' }}>{step.label}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginLeft: '0.5rem' }}>{step.detail}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Challenge Log */}
      {recentCompletions.length > 0 && (
        <SectionCard
          icon={<Icon name='clipboard' size={16} color='currentColor' />}
          title="Challenge Log"
          open={challengeLogOpen}
          onToggle={() => setChallengeLogOpen(o => !o)}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Your 10 most recent completions across all rooms.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {recentCompletions.map((c, i) => {
              const date = new Date(c.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const ratingColor = c.rating === 'strong' || c.rating === 'senior' || c.rating === 'staff' ? 'var(--green)'
                : c.rating === 'partial' || c.rating === 'analyst' ? 'var(--yellow)'
                : c.rating ? 'var(--text-muted)' : 'var(--text-dim)';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', minWidth: 48, flexShrink: 0 }}>{date}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', flexShrink: 0 }}>{c.room}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.id}</span>
                  {c.rating && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: ratingColor, textTransform: 'capitalize', flexShrink: 0 }}>{c.rating}</span>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Settings Section */}
      <SectionCard
        icon="*"
        title="Settings"
        open={settingsOpen}
        onToggle={() => setSettingsOpen(o => !o)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Reset progress for individual rooms from the Overview section, or clear everything below.
          </div>
          {totalAttempts > 0 ? (
            <button onClick={handleClear} style={{
              background: 'transparent', border: '1px solid var(--red)',
              borderRadius: '6px', padding: '0.45rem 1rem',
              color: 'var(--red)', fontSize: '0.82rem', cursor: 'pointer',
              fontWeight: 600, alignSelf: 'flex-start',
            }}>Clear All Progress</button>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>No progress to clear yet.</div>
          )}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Export your progress as JSON for backup or device handoff.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  const ALL_PROGRESS_KEYS = [
                    'pal-stats-progress-v1', 'pal-metrics-progress-v2', 'pal-rca-progress-v2',
                    'pal-cases-progress-v2', 'pal-fullloop-progress-v1', 'pal-behavioral-progress-v1',
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
                  ALL_PROGRESS_KEYS.forEach(k => {
                    const v = localStorage.getItem(k);
                    if (v) snapshot[k] = v;
                  });
                  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'pal-progress.json'; a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}
              >
                Export progress
              </button>
              <label style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}>
                Import progress
                <input type="file" accept=".json" style={{ display: 'none' }} onChange={e => {
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
                }} />
              </label>
            </div>
          </div>
        </div>
      </SectionCard>

      </> }

    </div>
  );
}
