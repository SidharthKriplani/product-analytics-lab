import { useState, useEffect, lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/shared/ErrorBoundary.jsx';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { track } from './utils/analytics.js';
import { onAuthStateChange } from './utils/auth.js';
import { pushProgressToSupabase, pullProgressFromSupabase } from './utils/syncProgress.js';
// Slim index — id, isFree, title only (for routing and paywall checks)
import {
  scenarioIndex, designScenarioIndex, statsModuleIndex, metricCaseIndex,
  rcaCaseIndex, businessCaseIndex, productDesignIndex, codeModuleIndex,
  prioritizationIndex, behavioralIndex, estimationIndex, statsFoundationsIndex,
  growthAnalyticsIndex, challengesIndex, biCaseIndex, stfCaseIndex,
  takehomeCaseIndex, instrumentationIndex, metricsFoundationIndex,
  rcaFoundationIndex, expFoundationIndex
} from './data/caseIndex.js';
import { getAllInstrumentationProgress } from './utils/instrumentationProgress.js';
// Layout (always needed — not lazy)
import { Sidebar } from './components/layout/Sidebar.jsx';
// Utils
import { getAllProgress } from './utils/progress.js';
import { getDesignProgress } from './utils/designProgress.js';
import { getStatsProgress } from './utils/statsProgress.js';
import { getMetricsProgress } from './utils/metricsProgress.js';
import { getRCAProgress } from './utils/rcaProgress.js';
import { getCaseProgress } from './utils/caseProgress.js';
import { getProductDesignProgress } from './utils/productDesignProgress.js';
import { getCodeProgress } from './utils/codeProgress.js';
import { getPrioritizationProgress } from './utils/prioritizationProgress.js';
import { getBehavioralProgress } from './utils/behavioralProgress.js';
import { getEstimationProgress } from './utils/estimationProgress.js';
import { getStatFoundationsProgress } from './utils/statsFoundationsProgress.js';
import { getGrowthAnalyticsProgress } from './utils/growthAnalyticsProgress.js';
import { getAllChallengesProgress } from './utils/challengesProgress.js';
import { getAllBIProgress } from './utils/biProgress.js';
import { getAllSTFProgress } from './utils/spotTheFlawProgress.js';
import { getAllTakehomeProgress } from './utils/takehomeProgress.js';
import { isUnlocked } from './utils/unlock.js';

// Pages — lazy-loaded for code splitting
const Home                  = lazy(() => import('./pages/Home.jsx').then(m => ({ default: m.Home })));
const ScenarioBrowser       = lazy(() => import('./pages/ScenarioBrowser.jsx').then(m => ({ default: m.ScenarioBrowser })));
const DesignBrowser         = lazy(() => import('./pages/DesignBrowser.jsx').then(m => ({ default: m.DesignBrowser })));
const StatsBrowser          = lazy(() => import('./pages/StatsBrowser.jsx').then(m => ({ default: m.StatsBrowser })));
const MetricsBrowser        = lazy(() => import('./pages/MetricsBrowser.jsx').then(m => ({ default: m.MetricsBrowser })));
const RCABrowser            = lazy(() => import('./pages/RCABrowser.jsx').then(m => ({ default: m.RCABrowser })));
const CasesBrowser          = lazy(() => import('./pages/CasesBrowser.jsx').then(m => ({ default: m.CasesBrowser })));
const ProductDesignBrowser  = lazy(() => import('./pages/ProductDesignBrowser.jsx').then(m => ({ default: m.ProductDesignBrowser })));
const CodeBrowser           = lazy(() => import('./pages/CodeBrowser.jsx').then(m => ({ default: m.CodeBrowser })));
const PrioritizationBrowser = lazy(() => import('./pages/PrioritizationBrowser.jsx').then(m => ({ default: m.PrioritizationBrowser })));
const PlaybookBrowser       = lazy(() => import('./pages/PlaybookBrowser.jsx').then(m => ({ default: m.PlaybookBrowser })));
const BlogBrowser           = lazy(() => import('./pages/BlogBrowser.jsx').then(m => ({ default: m.BlogBrowser })));
const Progress              = lazy(() => import('./pages/Progress.jsx').then(m => ({ default: m.Progress })));
const ProfilePage           = lazy(() => import('./pages/ProfilePage.jsx').then(m => ({ default: m.ProfilePage })));
const Unlock                = lazy(() => import('./pages/Unlock.jsx').then(m => ({ default: m.Unlock })));
const About                 = lazy(() => import('./pages/About.jsx').then(m => ({ default: m.About })));
const RoomMap               = lazy(() => import('./pages/RoomMap.jsx').then(m => ({ default: m.RoomMap })));
const FailuresCatalog       = lazy(() => import('./pages/FailuresCatalog.jsx').then(m => ({ default: m.FailuresCatalog })));
const JudgmentBank          = lazy(() => import('./pages/JudgmentBank.jsx').then(m => ({ default: m.JudgmentBank })));
const QADashboard           = lazy(() => import('./pages/QADashboard.jsx').then(m => ({ default: m.QADashboard })));
const Pricing               = lazy(() => import('./pages/Pricing.jsx').then(m => ({ default: m.Pricing })));

// Runners — lazy-loaded
const ScenarioRunner        = lazy(() => import('./components/scenario/ScenarioRunner.jsx').then(m => ({ default: m.ScenarioRunner })));
const DesignRunner          = lazy(() => import('./components/design/DesignRunner.jsx').then(m => ({ default: m.DesignRunner })));
const StatsRunner           = lazy(() => import('./components/stats/StatsRunner.jsx').then(m => ({ default: m.StatsRunner })));
const MetricsRunner         = lazy(() => import('./components/metrics/MetricsRunner.jsx').then(m => ({ default: m.MetricsRunner })));
const RCARunner             = lazy(() => import('./components/rca/RCARunner.jsx').then(m => ({ default: m.RCARunner })));
const CaseRunner            = lazy(() => import('./components/cases/CaseRunner.jsx').then(m => ({ default: m.CaseRunner })));
const ProductDesignRunner   = lazy(() => import('./components/productDesign/ProductDesignRunner.jsx').then(m => ({ default: m.ProductDesignRunner })));
const CodeRunner            = lazy(() => import('./components/code/CodeRunner.jsx').then(m => ({ default: m.CodeRunner })));
const PrioritizationRunner  = lazy(() => import('./components/prioritization/PrioritizationRunner.jsx').then(m => ({ default: m.PrioritizationRunner })));
const BehavioralBrowser     = lazy(() => import('./pages/BehavioralBrowser.jsx').then(m => ({ default: m.BehavioralBrowser })));
const BehavioralRunner      = lazy(() => import('./components/behavioral/BehavioralRunner.jsx').then(m => ({ default: m.BehavioralRunner })));
const EstimationBrowser     = lazy(() => import('./pages/EstimationBrowser.jsx').then(m => ({ default: m.EstimationBrowser })));
const EstimationRunner      = lazy(() => import('./components/estimation/EstimationRunner.jsx').then(m => ({ default: m.EstimationRunner })));
const StatsFoundationsBrowser = lazy(() => import('./pages/StatsFoundationsBrowser.jsx').then(m => ({ default: m.StatsFoundationsBrowser })));
const StatsFoundationsRunner  = lazy(() => import('./components/statsFoundations/StatsFoundationsRunner.jsx').then(m => ({ default: m.StatsFoundationsRunner })));
const GrowthAnalyticsBrowser  = lazy(() => import('./pages/GrowthAnalyticsBrowser.jsx').then(m => ({ default: m.GrowthAnalyticsBrowser })));
const GrowthAnalyticsRunner   = lazy(() => import('./components/growthAnalytics/GrowthAnalyticsRunner.jsx').then(m => ({ default: m.GrowthAnalyticsRunner })));
const InterviewSimulator      = lazy(() => import('./pages/InterviewSimulator.jsx').then(m => ({ default: m.InterviewSimulator })));
const ABTestInterpreter       = lazy(() => import('./pages/ABTestInterpreter.jsx').then(m => ({ default: m.ABTestInterpreter })));
const SearchPage              = lazy(() => import('./pages/SearchPage.jsx').then(m => ({ default: m.SearchPage })));
const BookmarksBrowser        = lazy(() => import('./pages/BookmarksBrowser.jsx').then(m => ({ default: m.BookmarksBrowser })));
const ConsultationSpace = lazy(() => import('./pages/ConsultationSpace.jsx').then(m => ({ default: m.ConsultationSpace })));
const Trainer           = lazy(() => import('./pages/Trainer.jsx').then(m => ({ default: m.Trainer })));
const CompanyTracks     = lazy(() => import('./pages/CompanyTracks.jsx').then(m => ({ default: m.CompanyTracks })));
const InterviewQABrowser = lazy(() => import('./pages/InterviewQABrowser.jsx').then(m => ({ default: m.InterviewQABrowser })));
const ChallengesBrowser = lazy(() => import('./pages/ChallengesBrowser.jsx').then(m => ({ default: m.ChallengesBrowser })));
const ChallengesRunner  = lazy(() => import('./components/challenges/ChallengesRunner.jsx').then(m => ({ default: m.ChallengesRunner })));
const BIBrowser        = lazy(() => import('./pages/BIBrowser.jsx').then(m => ({ default: m.BIBrowser })));
const BIRunner         = lazy(() => import('./components/bi/BIRunner.jsx').then(m => ({ default: m.BIRunner })));
const SpotTheFlawBrowser = lazy(() => import('./pages/SpotTheFlawBrowser.jsx').then(m => ({ default: m.SpotTheFlawBrowser })));
const SpotTheFlawRunner  = lazy(() => import('./components/spotTheFlaw/SpotTheFlawRunner.jsx').then(m => ({ default: m.SpotTheFlawRunner })));
const TakehomeBrowser  = lazy(() => import('./pages/TakehomeBrowser.jsx').then(m => ({ default: m.TakehomeBrowser })));
const TakehomeRunner   = lazy(() => import('./components/takehome/TakehomeRunner.jsx').then(m => ({ default: m.TakehomeRunner })));
const DefenseDocGenerator = lazy(() => import('./pages/DefenseDocGenerator.jsx').then(m => ({ default: m.DefenseDocGenerator })));
const InstrumentationBrowser = lazy(() => import('./pages/InstrumentationBrowser.jsx').then(m => ({ default: m.InstrumentationBrowser })));
const InstrumentationRunner   = lazy(() => import('./components/instrumentation/InstrumentationRunner.jsx').then(m => ({ default: m.InstrumentationRunner })));
const FoundationHub           = lazy(() => import('./pages/FoundationHub.jsx').then(m => ({ default: m.FoundationHub })));
const MetricsFoundationsBrowser = lazy(() => import('./pages/MetricsFoundationsBrowser.jsx').then(m => ({ default: m.MetricsFoundationsBrowser })));
const MetricsFoundationsRunner  = lazy(() => import('./components/metricsFoundations/MetricsFoundationsRunner.jsx').then(m => ({ default: m.MetricsFoundationsRunner })));
const RCAFoundationsBrowser     = lazy(() => import('./pages/RCAFoundationsBrowser.jsx').then(m => ({ default: m.RCAFoundationsBrowser })));
const RCAFoundationsRunner      = lazy(() => import('./components/rcaFoundations/RCAFoundationsRunner.jsx').then(m => ({ default: m.RCAFoundationsRunner })));
const ExpFoundationsBrowser     = lazy(() => import('./pages/ExpFoundationsBrowser.jsx').then(m => ({ default: m.ExpFoundationsBrowser })));
const ExpFoundationsRunner      = lazy(() => import('./components/expFoundations/ExpFoundationsRunner.jsx').then(m => ({ default: m.ExpFoundationsRunner })));
const AuthModal                 = lazy(() => import('./components/auth/AuthModal.jsx').then(m => ({ default: m.AuthModal })));
const SqlLabPage                = lazy(() => import('./pages/SqlLabPage.jsx').then(m => ({ default: m.SqlLabPage })));

function getInitialTheme() {
  try {
    return localStorage.getItem('exp-lab-theme') === 'dark' ? 'dark' : 'light';
  } catch (e) {
    return 'light';
  }
}

export default function App() {
  const [page, setPage] = useState('home');
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [activeDesignScenarioId, setActiveDesignScenarioId] = useState(null);
  const [activeStatsModuleId, setActiveStatsModuleId] = useState(null);
  const [activeMetricsCaseId, setActiveMetricsCaseId] = useState(null);
  const [activeRCACaseId, setActiveRCACaseId] = useState(null);
  const [activeBusinessCaseId, setActiveBusinessCaseId] = useState(null);
  const [activePDScenarioId, setActivePDScenarioId] = useState(null);
  const [activeCodeModuleId, setActiveCodeModuleId] = useState(null);
  const [activePrioritizationId, setActivePrioritizationId] = useState(null);
  const [activeBehavioralId, setActiveBehavioralId] = useState(null);
  const [activeEstimationId, setActiveEstimationId] = useState(null);
  const [activeStatFoundationsId, setActiveStatFoundationsId] = useState(null);
  const [activeGrowthAnalyticsId, setActiveGrowthAnalyticsId] = useState(null);
  const [activeChallengeId, setActiveChallengeId] = useState(null);
  const [activeBICaseId, setActiveBICaseId] = useState(null);
  const [activeSTFCaseId, setActiveSTFCaseId] = useState(null);
  const [activeTakehomeCaseId, setActiveTakehomeCaseId] = useState(null);
  const [activeInstrumentationCaseId, setActiveInstrumentationCaseId] = useState(null);
  const [activeMetricsFoundationId, setActiveMetricsFoundationId] = useState(null);
  const [activeRCAFoundationId, setActiveRCAFoundationId] = useState(null);
  const [activeExpFoundationId, setActiveExpFoundationId] = useState(null);
  const [playbookInitialArticle, setPlaybookInitialArticle] = useState(null);
  const [unlocked, setUnlocked] = useState(() => isUnlocked());
  const [progressSnapshot, setProgressSnapshot] = useState(() => ({ ...getAllProgress(), challengesProgress: getAllChallengesProgress(), biProgress: getAllBIProgress(), stfProgress: getAllSTFProgress(), takehomeProgress: getAllTakehomeProgress(), instrumentationProgress: getAllInstrumentationProgress() }));
  const [theme, setTheme] = useState(getInitialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  // Auth gate — anonymous users cannot access practice runners or SQL Lab.
  // Foundations (stat/metrics/rca/exp) are open to ALL users — they are top-of-funnel.
  // Room browsers (browsing case lists) are open to all.
  // Sign-in unlocks the free tier (isFree cases + Foundations + Easy SQL).
  // Access code (DAI2026) + future Stripe = premium tier.
  const AUTH_REQUIRED_PAGES = new Set([
    'sql-lab',
    'stats-runner', 'design-runner', 'runner', 'metrics-runner', 'rca-runner',
    'cases-runner', 'code-runner', 'prioritization-runner', 'behavioral-runner',
    'estimation-runner', 'growth-runner', 'bi-runner', 'stf-runner',
    'instrumentation-runner', 'sql-runner',
  ]);

  // Block anonymous users from practice runners — show sign-in prompt
  useEffect(() => {
    if (!user && AUTH_REQUIRED_PAGES.has(page)) {
      setPage('home');
      setShowAuth(true);
    }
  }, [page, user]);

  // Redirect signed-in users away from landing page → Progress
  // Handles both: initial auth fire AND back-navigation to 'home'
  useEffect(() => {
    if (user && page === 'home') {
      setPage('progress');
    }
  }, [page, user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
    try { localStorage.setItem('exp-lab-theme', theme); } catch (e) {}
  }, [theme]);

  useEffect(() => {
    const { data } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        pushProgressToSupabase(session.user);
        pullProgressFromSupabase(session.user).then(() => {
          setUser(session.user);
          refreshProgress();
          setPage(p => p === 'home' ? 'progress' : p);
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        setUser(currentUser => {
          if (currentUser) pushProgressToSupabase(currentUser);
          return currentUser;
        });
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      data?.subscription?.unsubscribe?.();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const titles = {
      home: 'Product Analytics Lab — Practice the Calls',
      stats: 'Stats Room — Product Analytics Lab',
      experimentation: 'Experimentation Room — Product Analytics Lab',
      rca: 'RCA Room — Product Analytics Lab',
      code: 'Code Room — Product Analytics Lab',
      'product-design': 'Product Design Room — Product Analytics Lab',
      prioritization: 'Prioritization Room — Product Analytics Lab',
      behavioral: 'Behavioral Room — Product Analytics Lab',
      estimation: 'Estimation Room — Product Analytics Lab',
      'stat-foundations': 'Stat Foundations — Product Analytics Lab',
      'growth-analytics': 'Growth Analytics Room — Product Analytics Lab',
      blog: 'Learn — Product Analytics Lab',
      playbook: 'Playbook — Product Analytics Lab',
      pricing: 'Pricing — Product Analytics Lab',
      progress: 'My Progress — Product Analytics Lab',
      unlock: 'Unlock Access — Product Analytics Lab',
      'simulator':      'Interview Simulator — Product Analytics Lab',
      'ab-interpreter': 'A/B Test Interpreter — Product Analytics Lab',
      'search':    'Search — Analytics Lab',
      'bookmarks': 'Bookmarks — Product Analytics Lab',
      'consult':        'Consultation Space — Product Analytics Lab',
      'trainer':        'Trainer — Product Analytics Lab',
      'company-tracks': 'Company Tracks — Product Analytics Lab',
      'challenges': 'Challenges — Product Analytics Lab',
      'challenges-runner': 'Challenges — Product Analytics Lab',
      'bi': 'BI & Reporting — Product Analytics Lab',
      'bi-runner': 'BI & Reporting — Product Analytics Lab',
      'spot-the-flaw': 'Spot the Flaw — Product Analytics Lab',
      'stf-runner': 'Spot the Flaw — Product Analytics Lab',
      'take-home': 'Take-Home Challenges — Product Analytics Lab',
      'takehome-runner': 'Take-Home Challenges — Product Analytics Lab',
      'defense-doc': 'Defense Strategy — Product Analytics Lab',
      'instrumentation': 'Analytics Instrumentation — Product Analytics Lab',
      'instrumentation-runner': 'Case — Analytics Instrumentation — Product Analytics Lab',
      'foundations': 'Foundations — Product Analytics Lab',
      'metrics-foundations': 'Metrics Foundations — Product Analytics Lab',
      'metrics-foundations-runner': 'Metrics Foundations — Product Analytics Lab',
      'rca-foundations': 'RCA Foundations — Product Analytics Lab',
      'rca-foundations-runner': 'RCA Foundations — Product Analytics Lab',
      'exp-foundations': 'Experimentation Foundations — Product Analytics Lab',
      'exp-foundations-runner': 'Experimentation Foundations — Product Analytics Lab',
      'sql-lab': 'SQL Lab — Product Analytics Lab',
    };
    document.title = titles[page] || 'Product Analytics Lab';
  }, [page]);

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  function refreshProgress() {
    setProgressSnapshot({ ...getAllProgress(), challengesProgress: getAllChallengesProgress(), biProgress: getAllBIProgress(), stfProgress: getAllSTFProgress(), takehomeProgress: getAllTakehomeProgress(), instrumentationProgress: getAllInstrumentationProgress() });
  }

  function navigate(target) {
    track('page_viewed', { page: target });
    setPage(target);
    setSidebarOpen(false);
    setActiveScenarioId(null);
    setActiveDesignScenarioId(null);
    setActiveStatsModuleId(null);
    setActiveMetricsCaseId(null);
    setActiveRCACaseId(null);
    setActiveBusinessCaseId(null);
    setActivePDScenarioId(null);
    setActiveCodeModuleId(null);
    setActiveBehavioralId(null);
    setActiveEstimationId(null);
    setActiveStatFoundationsId(null);
    setActiveGrowthAnalyticsId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openStatsModule(id) {
    const module = statsModuleIndex.find(m => m.id === id);
    if (!module) return;
    if (!module.isFree && !unlocked) { track('paywall_hit', { room: 'stats', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'stats', id, title: module.title });
    setActiveStatsModuleId(id);
    setPage('stats-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openDesignScenario(id) {
    const scenario = designScenarioIndex.find(s => s.id === id);
    if (!scenario) return;
    if (!scenario.isFree && !unlocked) { track('paywall_hit', { room: 'design', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'design', id, title: scenario.title });
    setActiveDesignScenarioId(id);
    setPage('design-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openScenario(id) {
    const scenario = scenarioIndex.find(s => s.id === id);
    if (!scenario) return;
    if (!scenario.isFree && !unlocked) { track('paywall_hit', { room: 'review', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'review', id, title: scenario.title });
    setActiveScenarioId(id);
    setPage('runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openMetricsCase(id) {
    const c = metricCaseIndex.find(m => m.id === id);
    if (!c) return;
    if (!c.isFree && !unlocked) { track('paywall_hit', { room: 'metrics', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'metrics', id, title: c.title });
    setActiveMetricsCaseId(id);
    setPage('metrics-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openRCACase(id) {
    const c = rcaCaseIndex.find(r => r.id === id);
    if (!c) return;
    if (!c.isFree && !unlocked) { track('paywall_hit', { room: 'rca', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'rca', id, title: c.title });
    setActiveRCACaseId(id);
    setPage('rca-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openBusinessCase(id) {
    const c = businessCaseIndex.find(b => b.id === id);
    if (!c) return;
    if (!c.isFree && !unlocked) { track('paywall_hit', { room: 'cases', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'cases', id, title: c.title });
    setActiveBusinessCaseId(id);
    setPage('cases-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openCodeModule(id) {
    const m = codeModuleIndex.find(m => m.id === id);
    if (!m) return;
    if (!m.isFree && !unlocked) { track('paywall_hit', { room: 'code', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'code', id, title: m.title });
    setActiveCodeModuleId(id);
    setPage('code-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openPrioritizationScenario(id) {
    const s = prioritizationIndex.find(s => s.id === id);
    if (!s) return;
    if (!s.isFree && !unlocked) { track('paywall_hit', { room: 'prioritization', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'prioritization', id, title: s.title });
    setActivePrioritizationId(id);
    setPage('prioritization-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openBehavioralQuestion(id) {
    const q = behavioralIndex.find(q => q.id === id);
    if (!q) return;
    if (!q.isFree && !unlocked) { track('paywall_hit', { room: 'behavioral', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'behavioral', id, title: q.title });
    setActiveBehavioralId(id);
    setPage('behavioral-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEstimationProblem(id) {
    const p = estimationIndex.find(p => p.id === id);
    if (!p) return;
    if (!p.isFree && !unlocked) { track('paywall_hit', { room: 'estimation', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'estimation', id, title: p.title });
    setActiveEstimationId(id);
    setPage('estimation-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openStatFoundationsModule(id) {
    const m = statsFoundationsIndex.find(m => m.id === id);
    if (!m) return;
    if (!m.isFree && !unlocked) { track('paywall_hit', { room: 'stat-foundations', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'stat-foundations', id, title: m.title });
    setActiveStatFoundationsId(id);
    setPage('stat-foundations-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openGrowthAnalyticsCase(id) {
    const c = growthAnalyticsIndex.find(c => c.id === id);
    if (!c) return;
    if (!c.isFree && !unlocked) { track('paywall_hit', { room: 'growth-analytics', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'growth-analytics', id, title: c.title });
    setActiveGrowthAnalyticsId(id);
    setPage('growth-analytics-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openChallenge(id) {
    const c = challengesIndex.find(c => c.id === id);
    if (!c) return;
    if (!c.isFree && !unlocked) { track('paywall_hit', { room: 'challenges', id }); setPage('unlock'); return; }
    setActiveChallengeId(id);
    track('open_challenge', { id, title: c.title });
    setPage('challenges-runner');
  }

  function getNextChallengeId(currentId) {
    const idx = challengesIndex.findIndex(c => c.id === currentId);
    return idx >= 0 && idx < challengesIndex.length - 1 ? challengesIndex[idx + 1].id : null;
  }

  function openBICase(id) {
    const c = biCaseIndex.find(c => c.id === id);
    if (!c) return;
    if (!c.isFree && !unlocked) { track('paywall_hit', { room: 'bi', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'bi', id, title: c.title });
    setActiveBICaseId(id);
    setPage('bi-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function getNextBICaseId(currentId) {
    const idx = biCaseIndex.findIndex(c => c.id === currentId);
    return idx >= 0 && idx < biCaseIndex.length - 1 ? biCaseIndex[idx + 1].id : null;
  }

  function openSTFCase(id) {
    const c = stfCaseIndex.find(c => c.id === id);
    if (!c) return;
    if (!c.isFree && !unlocked) { track('paywall_hit', { room: 'spot-the-flaw', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'spot-the-flaw', id, title: c.title });
    setActiveSTFCaseId(id);
    setPage('stf-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function getNextSTFCaseId(currentId) {
    const idx = stfCaseIndex.findIndex(c => c.id === currentId);
    return idx >= 0 && idx < stfCaseIndex.length - 1 ? stfCaseIndex[idx + 1].id : null;
  }

  function openTakehomeCase(id) {
    const c = takehomeCaseIndex.find(c => c.id === id);
    if (!c) return;
    if (!c.isFree && !unlocked) { track('paywall_hit', { room: 'take-home', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'take-home', id, title: c.title });
    setActiveTakehomeCaseId(id);
    setPage('takehome-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function getNextTakehomeCaseId(currentId) {
    const idx = takehomeCaseIndex.findIndex(c => c.id === currentId);
    return idx >= 0 && idx < takehomeCaseIndex.length - 1 ? takehomeCaseIndex[idx + 1].id : null;
  }

  function openPlaybookArticle(id) {
    setPlaybookInitialArticle(id);
    setPage('playbook');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openInstrumentationCase(id) {
    const c = instrumentationIndex.find(c => c.id === id);
    if (!c) return;
    if (!unlocked && !c.isFree) { navigate('unlock'); return; }
    track('case_opened', { room: 'instrumentation', id, title: c.title });
    setActiveInstrumentationCaseId(id);
    navigate('instrumentation-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openRCAFoundationModule(id) {
    const m = rcaFoundationIndex.find(m => m.id === id);
    if (!m) return;
    if (!m.isFree && !unlocked) { track('paywall_hit', { room: 'rca-foundations', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'rca-foundations', id, title: m.title });
    setActiveRCAFoundationId(id);
    setPage('rca-foundations-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openMetricsFoundationModule(id) {
    const m = metricsFoundationIndex.find(m => m.id === id);
    if (!m) return;
    if (!m.isFree && !unlocked) { track('paywall_hit', { room: 'metrics-foundations', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'metrics-foundations', id, title: m.title });
    setActiveMetricsFoundationId(id);
    setPage('metrics-foundations-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openPDScenario(id) {
    const s = productDesignIndex.find(s => s.id === id);
    if (!s) return;
    if (!s.isFree && !unlocked) { track('paywall_hit', { room: 'product-design', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'product-design', id, title: s.title });
    setActivePDScenarioId(id);
    setPage('product-design-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleUnlocked() {
    track('unlocked');
    setUnlocked(true);
    navigate('browser');
  }

  useKeyboardShortcuts([
    { key: '/', action: () => setPage('search') },
    { key: 'k', ctrlKey: true, action: () => setPage('search') },
    { key: 'Escape', action: () => { if (page !== 'home') setPage('home'); } },
    // Room browsers
    { key: 's', action: () => navigate('stats') },
    { key: 'm', action: () => navigate('metrics') },
    { key: 'r', action: () => navigate('rca') },
    { key: 'e', action: () => navigate('estimation') },
    { key: 'o', action: () => navigate('code') },
    { key: 'f', action: () => navigate('spot-the-flaw') },
    { key: 'g', action: () => navigate('growth-analytics') },
    // Tools & utilities
    { key: 'p', action: () => navigate('progress') },
    { key: 'h', action: () => setPage('home') },
    { key: 't', action: () => navigate('trainer') },
    { key: 'i', action: () => navigate('interview-qa') },
    { key: 'c', action: () => navigate('consult') },
    { key: 'x', action: () => navigate('challenges') },
    { key: 'b', action: () => navigate('bi') },
    { key: 'd', action: () => navigate('defense-doc') },
    { key: 'q', action: () => navigate('sql-lab') },
  ]);

  function getNextScenarioId(currentId) {
    const accessible = scenarioIndex.filter(s => s.isFree || unlocked);
    const idx = accessible.findIndex(s => s.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextMetricsCaseId(currentId) {
    const accessible = metricCaseIndex.filter(c => c.isFree || unlocked);
    const idx = accessible.findIndex(c => c.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextRCACaseId(currentId) {
    const accessible = rcaCaseIndex.filter(c => c.isFree || unlocked);
    const idx = accessible.findIndex(c => c.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextBusinessCaseId(currentId) {
    const accessible = businessCaseIndex.filter(c => c.isFree || unlocked);
    const idx = accessible.findIndex(c => c.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextDesignScenarioId(currentId) {
    const accessible = designScenarioIndex.filter(s => s.isFree || unlocked);
    const idx = accessible.findIndex(s => s.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextPDScenarioId(currentId) {
    const accessible = productDesignIndex.filter(s => s.isFree || unlocked);
    const idx = accessible.findIndex(s => s.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextCodeModuleId(currentId) {
    const accessible = codeModuleIndex.filter(m => m.isFree || unlocked);
    const idx = accessible.findIndex(m => m.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextBehavioralId(currentId) {
    const accessible = behavioralIndex.filter(q => q.isFree || unlocked);
    const idx = accessible.findIndex(q => q.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextEstimationId(currentId) {
    const accessible = estimationIndex.filter(p => p.isFree || unlocked);
    const idx = accessible.findIndex(p => p.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextPrioritizationId(currentId) {
    const accessible = prioritizationIndex.filter(s => s.isFree || unlocked);
    const idx = accessible.findIndex(s => s.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextStatFoundationsId(currentId) {
    const accessible = statsFoundationsIndex.filter(m => m.isFree || unlocked);
    const idx = accessible.findIndex(m => m.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextGrowthAnalyticsId(currentId) {
    const accessible = growthAnalyticsIndex.filter(c => c.isFree || unlocked);
    const idx = accessible.findIndex(c => c.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextRCAFoundationId(currentId) {
    const accessible = rcaFoundationIndex.filter(m => m.isFree || unlocked);
    const idx = accessible.findIndex(m => m.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function openExpFoundationModule(id) {
    const m = expFoundationIndex.find(m => m.id === id);
    if (!m) return;
    if (!m.isFree && !unlocked) { track('paywall_hit', { room: 'exp-foundations', id }); setPage('unlock'); return; }
    track('case_opened', { room: 'exp-foundations', id, title: m.title });
    setActiveExpFoundationId(id);
    setPage('exp-foundations-runner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getNextExpFoundationId(currentId) {
    const accessible = expFoundationIndex.filter(m => m.isFree || unlocked);
    const idx = accessible.findIndex(m => m.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextMetricsFoundationId(currentId) {
    const accessible = metricsFoundationIndex.filter(m => m.isFree || unlocked);
    const idx = accessible.findIndex(m => m.id === currentId);
    if (idx < 0 || idx >= accessible.length - 1) return null;
    return accessible[idx + 1].id;
  }

  function getNextStatsId(currentId) {
    const accessible = statsModuleIndex.filter(m => m.isFree || unlocked);
    const idx = accessible.findIndex(m => m.id === currentId);
    return idx >= 0 && idx < accessible.length - 1 ? accessible[idx + 1].id : null;
  }

  // Runners need the active ID passed as caseId — they import full data internally.
  // For rooms that pass full data objects (scenario, metricCase etc.), the runners
  // still receive those via their browser pages which import the full data.
  // Runners that previously received caseData from App.jsx now look up data themselves.

  const nextScenarioId = activeScenarioId ? getNextScenarioId(activeScenarioId) : null;
  const nextDesignScenarioId = activeDesignScenarioId ? getNextDesignScenarioId(activeDesignScenarioId) : null;
  const nextStatsModuleId = activeStatsModuleId ? getNextStatsId(activeStatsModuleId) : null;
  const nextMetricsCaseId = activeMetricsCaseId ? getNextMetricsCaseId(activeMetricsCaseId) : null;
  const nextRCACaseId = activeRCACaseId ? getNextRCACaseId(activeRCACaseId) : null;
  const nextBusinessCaseId = activeBusinessCaseId ? getNextBusinessCaseId(activeBusinessCaseId) : null;
  const nextPDScenarioId = activePDScenarioId ? getNextPDScenarioId(activePDScenarioId) : null;
  const nextCodeModuleId = activeCodeModuleId ? getNextCodeModuleId(activeCodeModuleId) : null;
  const nextPrioritizationId = activePrioritizationId ? getNextPrioritizationId(activePrioritizationId) : null;
  const nextBehavioralId = activeBehavioralId ? getNextBehavioralId(activeBehavioralId) : null;
  const nextEstimationId = activeEstimationId ? getNextEstimationId(activeEstimationId) : null;
  const nextStatFoundationsId = activeStatFoundationsId ? getNextStatFoundationsId(activeStatFoundationsId) : null;
  const nextGrowthAnalyticsId = activeGrowthAnalyticsId ? getNextGrowthAnalyticsId(activeGrowthAnalyticsId) : null;

  const instrIdx = activeInstrumentationCaseId ? instrumentationIndex.findIndex(c => c.id === activeInstrumentationCaseId) : -1;
  const nextInstrumentationCaseId = instrIdx >= 0 && instrIdx < instrumentationIndex.length - 1 ? instrumentationIndex[instrIdx + 1].id : null;

  const isFocusMode = page === 'runner' || page.endsWith('-runner');

  return (
    <div className={`app-layout${isFocusMode ? ' focus-mode' : ''}${page === 'sql-lab' ? ' sql-lab-mode' : ''}${!user ? ' signed-out' : ''}`} style={{ color: 'var(--text)' }}>
      <Sidebar
        currentPage={page}
        onNavigate={navigate}
        unlockedStatus={unlocked}
        theme={theme}
        onToggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onShowAuth={() => setShowAuth(true)}
      />
      <div className="app-main-wrapper">
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button
            onClick={() => setSidebarOpen(s => !s)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '1.1rem', padding: '0.3rem', lineHeight: 1, display: 'flex', alignItems: 'center' }}
            aria-label="Open menu"
          >☰</button>
          <button
            onClick={() => navigate(user ? 'progress' : 'home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0' }}
          >
            <div style={{ width: 20, height: 20, background: 'linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <g stroke="#ffffff" strokeLinecap="round" strokeWidth="1.8">
                    <line x1="3" y1="10" x2="17" y2="10"/>
                    <line x1="3" y1="6"  x2="3"  y2="14"/>
                    <line x1="17" y1="6" x2="17" y2="14"/>
                  </g>
                  <circle cx="10" cy="10" r="1.8" fill="#ffffff"/>
                </svg>
              </div>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>Analytics Lab</span>
          </button>
          {!user && (
            <button
              onClick={() => setShowAuth(true)}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '5px', padding: '0.25rem 0.55rem', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              Sign in
            </button>
          )}
          {user && (
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: 'var(--accent-bg, var(--surface-2))',
              border: '1px solid var(--border)',
              color: 'var(--accent)',
              fontSize: '0.75rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textTransform: 'uppercase', flexShrink: 0,
            }}>
              {user.email ? user.email[0] : '?'}
            </div>
          )}
        </div>

        <main style={{ flex: 1, ...(page === 'sql-lab' ? { display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 } : {}) }}>
          <ErrorBoundary>
          <Suspense fallback={
            <div style={{ padding: '2rem 2rem 0' }}>
              {[1,2,3].map(i => (
                <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
              ))}
            </div>
          }>
        <div key={page} className={page === 'sql-lab' ? 'sql-lab-page-wrap' : 'pal-page-enter'}>
        {page === 'home' && (
          <Home onNavigate={navigate} onShowAuth={() => setShowAuth(true)} />
        )}

        {/* ── Stats Room ── */}
        {page === 'stats' && (
          <StatsBrowser onSelectModule={openStatsModule} unlocked={unlocked} onUnlock={() => navigate('unlock')} onOpenArticle={openPlaybookArticle} onNavigate={navigate} />
        )}
        {page === 'stats-runner' && activeStatsModuleId && (
          <StatsRunner
            key={activeStatsModuleId}
            caseId={activeStatsModuleId}
            savedProgress={getStatsProgress(activeStatsModuleId)}
            onBack={() => navigate('stats')}
            onGoToReview={id => openScenario(id)}
            onGoToDesign={id => openDesignScenario(id)}
            onNext={nextStatsModuleId ? () => { setActiveStatsModuleId(nextStatsModuleId); } : null}
            onNavigate={navigate}
          />
        )}

        {/* ── Metrics Room ── */}
        {page === 'metrics' && (
          <MetricsBrowser onSelectCase={openMetricsCase} unlocked={unlocked} onUnlock={() => navigate('unlock')} onOpenArticle={openPlaybookArticle} onNavigate={navigate} />
        )}
        {page === 'metrics-runner' && activeMetricsCaseId && (
          <MetricsRunner
            key={activeMetricsCaseId}
            caseId={activeMetricsCaseId}
            savedProgress={getMetricsProgress(activeMetricsCaseId)}
            unlocked={unlocked}
            onBack={() => navigate('metrics')}
            onGoToDesign={id => openDesignScenario(id)}
            onGoToReview={id => openScenario(id)}
            onNext={nextMetricsCaseId ? () => openMetricsCase(nextMetricsCaseId) : undefined}
            onNavigate={navigate}
          />
        )}

        {/* ── Design Room ── */}
        {page === 'design' && (
          <DesignBrowser onSelectScenario={openDesignScenario} unlocked={unlocked} onUnlock={() => navigate('unlock')} onOpenArticle={openPlaybookArticle} onNavigate={navigate} />
        )}
        {page === 'design-runner' && activeDesignScenarioId && (
          <DesignRunner
            key={activeDesignScenarioId}
            caseId={activeDesignScenarioId}
            savedProgress={getDesignProgress(activeDesignScenarioId)}
            onBack={() => navigate('design')}
            onGoToReview={id => openScenario(id)}
            onNext={nextDesignScenarioId ? () => openDesignScenario(nextDesignScenarioId) : undefined}
            onNavigate={navigate}
          />
        )}

        {/* ── Review Room ── */}
        {page === 'browser' && (
          <ScenarioBrowser
            allProgress={progressSnapshot}
            onSelect={id => { openScenario(id); refreshProgress(); }}
            unlocked={unlocked}
            onUnlock={() => navigate('unlock')}
            onOpenArticle={openPlaybookArticle}
            onNavigate={navigate}
          />
        )}
        {page === 'runner' && activeScenarioId && (
          <ScenarioRunner
            key={activeScenarioId}
            caseId={activeScenarioId}
            onBack={() => { navigate('browser'); refreshProgress(); }}
            onNext={nextScenarioId ? () => { openScenario(nextScenarioId); refreshProgress(); } : null}
            hasNext={!!nextScenarioId}
            onGoToDesign={openDesignScenario}
            onNavigate={navigate}
          />
        )}

        {/* ── RCA Room ── */}
        {page === 'rca' && (
          <RCABrowser onSelectCase={openRCACase} unlocked={unlocked} onUnlock={() => navigate('unlock')} onOpenArticle={openPlaybookArticle} onNavigate={navigate} />
        )}
        {page === 'rca-runner' && activeRCACaseId && (
          <RCARunner
            key={activeRCACaseId}
            caseId={activeRCACaseId}
            savedProgress={getRCAProgress(activeRCACaseId)}
            unlocked={unlocked}
            onBack={() => navigate('rca')}
            onNext={nextRCACaseId ? () => openRCACase(nextRCACaseId) : undefined}
            onNavigate={navigate}
          />
        )}

        {/* ── Cases Room ── */}
        {page === 'cases' && (
          <CasesBrowser onSelectCase={openBusinessCase} unlocked={unlocked} onUnlock={() => navigate('unlock')} onNavigate={navigate} />
        )}
        {page === 'cases-runner' && activeBusinessCaseId && (
          <CaseRunner
            key={activeBusinessCaseId}
            caseId={activeBusinessCaseId}
            savedProgress={getCaseProgress(activeBusinessCaseId)}
            unlocked={unlocked}
            onBack={() => navigate('cases')}
            onNext={nextBusinessCaseId ? () => openBusinessCase(nextBusinessCaseId) : undefined}
            onNavigate={navigate}
          />
        )}

        {/* ── Product Design Room ── */}
        {page === 'product-design' && (
          <ProductDesignBrowser
            onSelectScenario={openPDScenario}
            unlocked={unlocked}
            onUnlock={() => navigate('unlock')}
            onOpenArticle={openPlaybookArticle}
          />
        )}
        {page === 'product-design-runner' && activePDScenarioId && (
          <ProductDesignRunner
            key={activePDScenarioId}
            caseId={activePDScenarioId}
            savedProgress={getProductDesignProgress(activePDScenarioId)}
            onBack={() => navigate('product-design')}
            onNext={nextPDScenarioId ? () => openPDScenario(nextPDScenarioId) : undefined}
            onNavigate={navigate}
          />
        )}

        {/* ── Code Room ── */}
        {page === 'code' && (
          <CodeBrowser
            onSelectModule={openCodeModule}
            unlocked={unlocked}
            onUnlock={() => navigate('unlock')}
            onOpenArticle={openPlaybookArticle}
          />
        )}
        {page === 'code-runner' && activeCodeModuleId && (
          <CodeRunner
            key={activeCodeModuleId}
            caseId={activeCodeModuleId}
            savedProgress={getCodeProgress(activeCodeModuleId)}
            onBack={() => navigate('code')}
            onNext={nextCodeModuleId ? () => openCodeModule(nextCodeModuleId) : undefined}
          />
        )}

        {/* ── Prioritization Room ── */}
        {page === 'prioritization' && (
          <PrioritizationBrowser
            onStart={openPrioritizationScenario}
            unlocked={unlocked}
            onOpenArticle={openPlaybookArticle}
          />
        )}
        {page === 'prioritization-runner' && activePrioritizationId && (
          <PrioritizationRunner
            key={activePrioritizationId}
            caseId={activePrioritizationId}
            onBack={() => navigate('prioritization')}
            onNext={nextPrioritizationId ? () => openPrioritizationScenario(nextPrioritizationId) : undefined}
            onNavigate={navigate}
          />
        )}

        {/* ── Behavioral Room ── */}
        {page === 'behavioral' && (
          <BehavioralBrowser onStart={openBehavioralQuestion} unlocked={unlocked} />
        )}
        {page === 'behavioral-runner' && activeBehavioralId && (
          <BehavioralRunner
            key={activeBehavioralId}
            caseId={activeBehavioralId}
            onBack={() => navigate('behavioral')}
            onNext={nextBehavioralId ? () => openBehavioralQuestion(nextBehavioralId) : undefined}
            onNavigate={navigate}
          />
        )}

        {/* ── Estimation Room ── */}
        {page === 'estimation' && (
          <EstimationBrowser onStart={openEstimationProblem} unlocked={unlocked} />
        )}
        {page === 'estimation-runner' && activeEstimationId && (
          <EstimationRunner
            key={activeEstimationId}
            caseId={activeEstimationId}
            onBack={() => navigate('estimation')}
            onNext={nextEstimationId ? () => openEstimationProblem(nextEstimationId) : undefined}
            onNavigate={navigate}
          />
        )}

        {/* ── Stat Foundations Room ── */}
        {page === 'stat-foundations' && (
          <StatsFoundationsBrowser
            onStart={openStatFoundationsModule}
            unlocked={unlocked}
            onNavigate={navigate}
          />
        )}
        {page === 'stat-foundations-runner' && activeStatFoundationsId && (
          <StatsFoundationsRunner
            key={activeStatFoundationsId}
            moduleId={activeStatFoundationsId}
            onBack={() => setPage('stat-foundations')}
            onNext={nextStatFoundationsId
              ? () => openStatFoundationsModule(nextStatFoundationsId)
              : () => setPage('stat-foundations')}
            onSelectModule={openStatFoundationsModule}
            unlocked={unlocked}
            onNavigate={navigate}
          />
        )}

        {/* ── Growth Analytics Room ── */}
        {page === 'growth-analytics' && (
          <GrowthAnalyticsBrowser
            onSelectCase={openGrowthAnalyticsCase}
            unlocked={unlocked}
            onOpenArticle={openPlaybookArticle}
            onNavigate={navigate}
          />
        )}
        {page === 'growth-analytics-runner' && activeGrowthAnalyticsId && (
          <GrowthAnalyticsRunner
            key={activeGrowthAnalyticsId}
            caseId={activeGrowthAnalyticsId}
            unlocked={unlocked}
            onBack={() => navigate('growth-analytics')}
            onNext={nextGrowthAnalyticsId ? () => openGrowthAnalyticsCase(nextGrowthAnalyticsId) : undefined}
            onNavigate={navigate}
          />
        )}

        {/* ── Search Page ── */}
        {page === 'search' && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <SearchPage
              onNavigate={(targetPage, itemId) => {
                if (itemId) {
                  switch (targetPage) {
                    case 'browser':              openScenario(itemId); break;
                    case 'stats':                openStatsModule(itemId); break;
                    case 'metrics':              openMetricsCase(itemId); break;
                    case 'design':               openDesignScenario(itemId); break;
                    case 'rca':                  openRCACase(itemId); break;
                    case 'cases':                openBusinessCase(itemId); break;
                    case 'product-design':       openPDScenario(itemId); break;
                    case 'code':                 openCodeModule(itemId); break;
                    case 'prioritization':       openPrioritizationScenario(itemId); break;
                    case 'behavioral':           openBehavioralQuestion(itemId); break;
                    case 'estimation':           openEstimationProblem(itemId); break;
                    case 'stat-foundations':     openStatFoundationsModule(itemId); break;
                    case 'growth-analytics':     openGrowthAnalyticsCase(itemId); break;
                    default:                     setPage(targetPage);
                  }
                } else {
                  setPage(targetPage);
                }
              }}
            />
          </Suspense>
        )}

        {/* ── BI Room ── */}
        {page === 'bi' && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <BIBrowser onSelectCase={openBICase} unlocked={unlocked} onOpenArticle={openPlaybookArticle} />
          </Suspense>
        )}
        {page === 'bi-runner' && activeBICaseId && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <BIRunner
              caseId={activeBICaseId}
              onBack={() => setPage('bi')}
              onNext={() => { const n = getNextBICaseId(activeBICaseId); if (n) openBICase(n); else setPage('bi'); }}
              unlocked={unlocked}
              onNavigate={navigate}
            />
          </Suspense>
        )}

        {/* ── Spot the Flaw Room ── */}
        {page === 'spot-the-flaw' && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <SpotTheFlawBrowser onSelectCase={openSTFCase} unlocked={unlocked} onNavigate={navigate} />
          </Suspense>
        )}
        {page === 'stf-runner' && activeSTFCaseId && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <SpotTheFlawRunner
              caseId={activeSTFCaseId}
              onBack={() => setPage('spot-the-flaw')}
              onNext={() => { const n = getNextSTFCaseId(activeSTFCaseId); if (n) openSTFCase(n); else setPage('spot-the-flaw'); }}
              unlocked={unlocked}
              onNavigate={navigate}
            />
          </Suspense>
        )}

        {/* ── Take-Home Room ── */}
        {page === 'take-home' && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <TakehomeBrowser onSelectCase={openTakehomeCase} unlocked={unlocked} onOpenArticle={openPlaybookArticle} />
          </Suspense>
        )}
        {page === 'takehome-runner' && activeTakehomeCaseId && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <TakehomeRunner
              caseId={activeTakehomeCaseId}
              onBack={() => setPage('take-home')}
              onNext={() => { const n = getNextTakehomeCaseId(activeTakehomeCaseId); if (n) openTakehomeCase(n); else setPage('take-home'); }}
              unlocked={unlocked}
            />
          </Suspense>
        )}

        {/* ── Analytics Instrumentation Room ── */}
        {page === 'instrumentation' && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <InstrumentationBrowser onSelectCase={openInstrumentationCase} unlocked={unlocked} onOpenArticle={openPlaybookArticle} />
          </Suspense>
        )}
        {page === 'instrumentation-runner' && activeInstrumentationCaseId && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <InstrumentationRunner
              caseId={activeInstrumentationCaseId}
              onBack={() => navigate('instrumentation')}
              onNext={nextInstrumentationCaseId ? () => openInstrumentationCase(nextInstrumentationCaseId) : null}
              unlocked={unlocked}
              onNavigate={navigate}
            />
          </Suspense>
        )}

        {/* ── Defense Doc Generator ── */}
        {page === 'defense-doc' && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <DefenseDocGenerator
              unlocked={unlocked}
              onBack={() => setPage('home')}
              onOpenArticle={openPlaybookArticle}
              onNavigate={(targetPage, itemId) => {
                if (itemId) {
                  switch (targetPage) {
                    case 'browser':          openScenario(itemId); break;
                    case 'design':           openDesignScenario(itemId); break;
                    case 'cases':            openBusinessCase(itemId); break;
                    case 'product-design':   openPDScenario(itemId); break;
                    case 'stats':            openStatsModule(itemId); break;
                    case 'metrics':          openMetricsCase(itemId); break;
                    case 'rca':              openRCACase(itemId); break;
                    case 'code':             openCodeModule(itemId); break;
                    case 'prioritization':   openPrioritizationScenario(itemId); break;
                    case 'behavioral':       openBehavioralQuestion(itemId); break;
                    case 'estimation':       openEstimationProblem(itemId); break;
                    case 'stat-foundations': openStatFoundationsModule(itemId); break;
                    case 'growth-analytics': openGrowthAnalyticsCase(itemId); break;
                    case 'spot-the-flaw':    openSTFCase(itemId); break;
                    case 'bi':               openBICase(itemId); break;
                    case 'instrumentation':  openInstrumentationCase(itemId); break;
                    default:                 setPage(targetPage);
                  }
                } else {
                  setPage(targetPage);
                }
              }}
            />
          </Suspense>
        )}

        {/* ── Support pages ── */}
        {page === 'pricing' && <Pricing onShowUnlock={() => setPage('unlock')} onBack={() => setPage('home')} />}
        {page === 'profile' && (
          <ProfilePage
            user={user}
            onNavigate={navigate}
            onShowAuth={() => setShowAuth(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
        {page === 'progress' && (
          <Progress
            allProgress={progressSnapshot}
            onSelect={openScenario}
            onClear={refreshProgress}
            onNavigate={navigate}
            unlocked={unlocked}
          />
        )}
        {page === 'unlock' && (
          <Unlock onUnlocked={handleUnlocked} alreadyUnlocked={unlocked} onNavigate={navigate} />
        )}
        {page === 'about' && <About />}
        {page === 'interview-qa' && (
          <InterviewQABrowser unlocked={unlocked} onBack={() => navigate('home')} />
        )}
        {page === 'map' && <RoomMap onNavigate={navigate} />}
        {page === 'failures' && <FailuresCatalog onNavigate={navigate} />}
        {page === 'bank' && <JudgmentBank onNavigate={navigate} />}
        {page === 'blog' && (
          <BlogBrowser onNavigate={navigate} />
        )}
        {page === 'playbook' && (
          <PlaybookBrowser key={playbookInitialArticle || 'playbook'} initialArticleId={playbookInitialArticle} onOpenItem={(room, id) => {
            if (room === 'stats') openStatsModule(id);
            else if (room === 'metrics') openMetricsCase(id);
            else if (room === 'design') openDesignScenario(id);
            else if (room === 'review') openScenario(id);
            else if (room === 'rca') openRCACase(id);
            else if (room === 'cases') openBusinessCase(id);
            else if (room === 'product-design') openPDScenario(id);
            else if (room === 'prioritization') openPrioritizationScenario(id);
            else if (room === 'bi') openBICase(id);
            else if (room === 'instrumentation') openInstrumentationCase(id);
            else if (room === 'take-home') openTakehomeCase(id);
          }} />
        )}
        {page === 'foundations' && (
          <FoundationHub
            onOpenArticle={openPlaybookArticle}
            onNavigate={navigate}
          />
        )}
        {/* ── RCA Foundations ── */}
        {page === 'rca-foundations' && (
          <RCAFoundationsBrowser onStart={openRCAFoundationModule} unlocked={unlocked} onNavigate={navigate} />
        )}
        {page === 'rca-foundations-runner' && activeRCAFoundationId && (
          <RCAFoundationsRunner
            key={activeRCAFoundationId}
            moduleId={activeRCAFoundationId}
            onBack={() => setPage('rca-foundations')}
            onNext={(() => { const n = getNextRCAFoundationId(activeRCAFoundationId); return n ? () => openRCAFoundationModule(n) : () => setPage('rca-foundations'); })()}
            onSelectModule={openRCAFoundationModule}
            unlocked={unlocked}
          />
        )}

        {/* ── Experimentation Foundations ── */}
        {page === 'exp-foundations' && (
          <ExpFoundationsBrowser onStart={openExpFoundationModule} unlocked={unlocked} onNavigate={navigate} />
        )}
        {page === 'exp-foundations-runner' && activeExpFoundationId && (
          <ExpFoundationsRunner
            key={activeExpFoundationId}
            moduleId={activeExpFoundationId}
            onBack={() => setPage('exp-foundations')}
            onNext={(() => { const n = getNextExpFoundationId(activeExpFoundationId); return n ? () => openExpFoundationModule(n) : () => setPage('exp-foundations'); })()}
            onSelectModule={openExpFoundationModule}
            unlocked={unlocked}
          />
        )}

        {/* ── Metrics Foundations ── */}
        {page === 'metrics-foundations' && (
          <MetricsFoundationsBrowser onStart={openMetricsFoundationModule} unlocked={unlocked} onNavigate={navigate} />
        )}
        {page === 'metrics-foundations-runner' && activeMetricsFoundationId && (
          <MetricsFoundationsRunner
            key={activeMetricsFoundationId}
            moduleId={activeMetricsFoundationId}
            onBack={() => setPage('metrics-foundations')}
            onNext={(() => { const n = getNextMetricsFoundationId(activeMetricsFoundationId); return n ? () => openMetricsFoundationModule(n) : () => setPage('metrics-foundations'); })()}
            onSelectModule={openMetricsFoundationModule}
            unlocked={unlocked}
          />
        )}

        {page === 'simulator' && <InterviewSimulator unlocked={unlocked} onBack={() => setPage('home')} onNavigate={navigate} />}
        {page === 'ab-interpreter' && <ABTestInterpreter onBack={() => setPage('home')} />}
        {page === 'consult' && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <ConsultationSpace
              onBack={() => setPage('home')}
              onNavigate={(targetPage, itemId) => {
                if (itemId) {
                  switch (targetPage) {
                    case 'playbook': setPage('playbook'); break; // playbook handles article ID via its own state
                    case 'stat-foundations': openStatFoundationsModule(itemId); break;
                    case 'growth-analytics': openGrowthAnalyticsCase(itemId); break;
                    case 'trainer': setPage('trainer'); break;
                    default: setPage(targetPage);
                  }
                } else {
                  setPage(targetPage);
                }
              }}
            />
          </Suspense>
        )}
        {page === 'trainer' && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <Trainer onBack={() => setPage('home')} />
          </Suspense>
        )}
        {page === 'company-tracks' && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <CompanyTracks
              unlocked={unlocked}
              onBack={() => setPage('home')}
              onNavigate={(targetPage, itemId) => {
                if (itemId) {
                  switch (targetPage) {
                    case 'stat-foundations': openStatFoundationsModule(itemId); break;
                    case 'growth-analytics': openGrowthAnalyticsCase(itemId); break;
                    case 'stats':            openStatsModule(itemId); break;
                    case 'metrics':          openMetricsCase(itemId); break;
                    case 'rca':              openRCACase(itemId); break;
                    case 'cases':            openBusinessCase(itemId); break;
                    case 'behavioral':       openBehavioralQuestion(itemId); break;
                    case 'estimation':       openEstimationProblem(itemId); break;
                    case 'product-design':   openPDScenario(itemId); break;
                    case 'prioritization':   openPrioritizationScenario(itemId); break;
                    case 'code':             openCodeModule(itemId); break;
                    case 'browser':          openScenario(itemId); break;
                    case 'playbook':         setPage('playbook'); break;
                    default:                 setPage(targetPage);
                  }
                } else {
                  setPage(targetPage);
                }
              }}
            />
          </Suspense>
        )}
        {page === 'challenges' && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <ChallengesBrowser
              onSelectChallenge={openChallenge}
              unlocked={unlocked}
            />
          </Suspense>
        )}
        {page === 'challenges-runner' && activeChallengeId && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <ChallengesRunner
              caseId={activeChallengeId}
              onBack={() => setPage('challenges')}
              onNext={() => {
                const nextId = getNextChallengeId(activeChallengeId);
                if (nextId) openChallenge(nextId);
                else setPage('challenges');
              }}
              unlocked={unlocked}
              onNavigate={navigate}
            />
          </Suspense>
        )}

        {page === 'bookmarks' && (
          <Suspense fallback={
              <div style={{ padding: '2rem 2rem 0' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="pal-shimmer-box" style={{ height: '88px', marginBottom: '1rem', opacity: 1 - i * 0.15 }} />
                ))}
              </div>
            }>
            <BookmarksBrowser
              onBack={() => setPage('home')}
              onNavigate={(targetPage, itemId) => {
                if (itemId) {
                  switch (targetPage) {
                    case 'stat-foundations':  openStatFoundationsModule(itemId); break;
                    case 'growth-analytics':  openGrowthAnalyticsCase(itemId); break;
                    case 'stats':             openStatsModule(itemId); break;
                    case 'metrics':           openMetricsCase(itemId); break;
                    case 'rca':               openRCACase(itemId); break;
                    case 'cases':             openBusinessCase(itemId); break;
                    case 'behavioral':        openBehavioralQuestion(itemId); break;
                    case 'estimation':        openEstimationProblem(itemId); break;
                    case 'product-design':    openPDScenario(itemId); break;
                    case 'prioritization':    openPrioritizationScenario(itemId); break;
                    case 'browser':           openScenario(itemId); break;
                    default:                  setPage(targetPage);
                  }
                } else {
                  setPage(targetPage);
                }
              }}
            />
          </Suspense>
        )}

        {/* ── SQL Lab (internal preview — hidden from nav) ── */}
        {page === 'sql-lab' && (
          <SqlLabPage onBack={() => navigate('home')} />
        )}

        {page === 'qa' && (
          <QADashboard
            onNavigate={navigate}
            unlocked={unlocked}
            onOpenItem={(room, id) => {
              if (room === 'stats') openStatsModule(id);
              else if (room === 'metrics') openMetricsCase(id);
              else if (room === 'design') openDesignScenario(id);
              else if (room === 'review') openScenario(id);
              else if (room === 'rca') openRCACase(id);
              else if (room === 'cases') openBusinessCase(id);
              else if (room === 'product-design') openPDScenario(id);
              else if (room === 'prioritization') openPrioritizationScenario(id);
            }}
            onUnlock={() => setUnlocked(true)}
            onLock={() => setUnlocked(false)}
            onResetAllProgress={() => {
              ['exp-lab-progress-v1', 'pal-design-progress-v1', 'pal-stats-progress-v1',
               'pal-metrics-progress-v2', 'pal-rca-progress-v2', 'pal-cases-progress-v2',
               'pal-code-progress-v1', 'pal-pri-progress-v1',
               'pal-behavioral-progress-v1', 'pal-estimation-progress-v1',
               'pal-stat-foundations-progress-v1',
               'pal-bi-progress-v1', 'pal-stf-progress-v1', 'pal-takehome-progress-v1',
               'pal-instrumentation-progress-v1', 'pal-growth-analytics-progress-v1',
               'pal-challenges-progress-v1', 'pal-bookmarks-v1', 'pal-notes-v1',
               'pal-metrics-foundation-progress-v1',
               'pal-rca-foundation-progress-v1',
               'pal-exp-foundation-progress-v1'
              ].forEach(k => { try { localStorage.removeItem(k); } catch {} });
              // Clear per-scenario product-design progress (prefix: pd-progress-)
              try {
                Object.keys(localStorage)
                  .filter(k => k.startsWith('pd-progress-'))
                  .forEach(k => localStorage.removeItem(k));
              } catch {}
              refreshProgress();
            }}
          />
        )}
        </div>
        </Suspense>
          </ErrorBoundary>
      </main>
    </div>
    {showAuth && (
      <Suspense fallback={null}>
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => setShowAuth(false)}
        />
      </Suspense>
    )}
  </div>
  );
}
