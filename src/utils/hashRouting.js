// Hash-based URL routing for PAL
// Maps internal page state <-> URL hash segments
// Format: #/page-slug for browsers, #/page-slug/caseId for runners

// Internal page value → hash segment
const PAGE_TO_HASH = {
  'home': '',
  'progress': 'progress',
  'plans': 'plans',
  'pricing': 'pricing',
  'profile': 'profile',
  'unlock': 'unlock',
  'about': 'about',
  'search': 'search',
  'bookmarks': 'bookmarks',
  'public-profile': 'u', // public profile — userId appended (e.g. #/u/<userId>)

  // Foundations (learn)
  'foundations': 'foundations',
  'stat-foundations': 'stats-foundations',
  'stat-foundations-runner': 'stats-foundations',
  'metrics-foundations': 'metrics-foundations',
  'metrics-foundations-runner': 'metrics-foundations',
  'rca-foundations': 'rca-foundations',
  'rca-foundations-runner': 'rca-foundations',
  'exp-foundations': 'exp-foundations',
  'exp-foundations-runner': 'exp-foundations',

  // Practice rooms — browsers
  'browser': 'review',
  'design': 'design',
  'stats': 'stats',
  'metrics': 'metrics',
  'rca': 'rca',
  'cases': 'cases',
  'product-design': 'product-design',
  'full-loop': 'full-loop',
  'prioritization': 'prioritization',
  'behavioral': 'behavioral',
  'estimation': 'estimation',
  'growth-analytics': 'growth-analytics',
  'challenges': 'challenges',
  'bi': 'bi',
  'spot-the-flaw': 'spot-the-flaw',
  'take-home': 'take-home',
  'instrumentation': 'instrumentation',

  // Practice rooms — runners (hash same as browser, case ID appended)
  'runner': 'review',
  'design-runner': 'design',
  'stats-runner': 'stats',
  'metrics-runner': 'metrics',
  'rca-runner': 'rca',
  'cases-runner': 'cases',
  'product-design-runner': 'product-design',
  'full-loop-runner': 'full-loop',
  'prioritization-runner': 'prioritization',
  'behavioral-runner': 'behavioral',
  'estimation-runner': 'estimation',
  'growth-analytics-runner': 'growth-analytics',
  'challenges-runner': 'challenges',
  'bi-runner': 'bi',
  'stf-runner': 'spot-the-flaw',
  'takehome-runner': 'take-home',
  'instrumentation-runner': 'instrumentation',

  // Code Lab
  'code': 'code-lab',
  'code-runner': 'code-lab',

  // Tools
  'sql-lab': 'sql-lab',
  'playbook': 'playbook',
  'simulator': 'simulator',
  'ab-interpreter': 'ab-interpreter',
  'benchmark': 'benchmark',
  'consult': 'consult',
  'trainer': 'trainer',
  'review-queue': 'review-queue',

  // Learn / standalone pages
  'python-lab': 'python-lab',
  'dimensional-modeling': 'dimensional-modeling',
  'study': 'study',
  'cheatsheet': 'cheatsheet',

  // Shared track (read-only public view)
  'shared-track': 'shared',

  // Track / misc
  'company-tracks': 'company-tracks',
  'defense-doc': 'defense-doc',
  'interview-qa': 'interview-qa',
  'map': 'map',
  'failures': 'failures',
  'bank': 'bank',
  'blog': 'blog',
  'qa': 'qa',
  'shared': 'shared-track',
};

// Runner pages → which activeId state they use
const RUNNER_ACTIVE_ID_KEY = {
  'public-profile': 'publicProfileUserId',
  'sql-lab': 'activeSqlProblemId',
  'runner': 'activeScenarioId',
  'design-runner': 'activeDesignScenarioId',
  'stats-runner': 'activeStatsModuleId',
  'metrics-runner': 'activeMetricsCaseId',
  'rca-runner': 'activeRCACaseId',
  'cases-runner': 'activeBusinessCaseId',
  'product-design-runner': 'activePDScenarioId',
  'full-loop-runner': 'activeFullLoopId',
  'prioritization-runner': 'activePrioritizationId',
  'behavioral-runner': 'activeBehavioralId',
  'estimation-runner': 'activeEstimationId',
  'stat-foundations-runner': 'activeStatFoundationsId',
  'growth-analytics-runner': 'activeGrowthAnalyticsId',
  'challenges-runner': 'activeChallengeId',
  'bi-runner': 'activeBICaseId',
  'stf-runner': 'activeSTFCaseId',
  'takehome-runner': 'activeTakehomeCaseId',
  'instrumentation-runner': 'activeInstrumentationCaseId',
  'metrics-foundations-runner': 'activeMetricsFoundationId',
  'rca-foundations-runner': 'activeRCAFoundationId',
  'exp-foundations-runner': 'activeExpFoundationId',
  'code-runner': 'activeCodeModuleId',
  'shared-track': 'activeSharedTrackId',
  // Content-reading surfaces — item-level deep links
  'blog': 'activeBlogPostId',
  'interview-qa': 'activeInterviewQAId',
  'failures': 'activeFailureId',
  'cheatsheet': 'activeCheatSection',
  'company-tracks': 'activeCompanyTrackId',
};

// Hash segment → browser page value (no runner suffix)
const HASH_TO_BROWSER_PAGE = {
  '': 'home',
  'progress': 'progress',
  'plans': 'plans',
  'pricing': 'pricing',
  'profile': 'profile',
  'unlock': 'unlock',
  'about': 'about',
  'search': 'search',
  'bookmarks': 'bookmarks',
  'u': 'public-profile',
  'foundations': 'foundations',
  'stats-foundations': 'stat-foundations',
  'metrics-foundations': 'metrics-foundations',
  'rca-foundations': 'rca-foundations',
  'exp-foundations': 'exp-foundations',
  'shared': 'shared-track',
  'review': 'browser',
  'design': 'design',
  'stats': 'stats',
  'metrics': 'metrics',
  'rca': 'rca',
  'cases': 'cases',
  'product-design': 'product-design',
  'full-loop': 'full-loop',
  'prioritization': 'prioritization',
  'behavioral': 'behavioral',
  'estimation': 'estimation',
  'growth-analytics': 'growth-analytics',
  'challenges': 'challenges',
  'bi': 'bi',
  'spot-the-flaw': 'spot-the-flaw',
  'take-home': 'take-home',
  'instrumentation': 'instrumentation',
  'sql-lab': 'sql-lab',
  'playbook': 'playbook',
  'simulator': 'simulator',
  'ab-interpreter': 'ab-interpreter',
  'benchmark': 'benchmark',
  'consult': 'consult',
  'trainer': 'trainer',
  'review-queue': 'review-queue',
  'code-lab': 'code',
  'python-lab': 'python-lab',
  'dimensional-modeling': 'dimensional-modeling',
  'study': 'study',
  'cheatsheet': 'cheatsheet',
  'company-tracks': 'company-tracks',
  'defense-doc': 'defense-doc',
  'interview-qa': 'interview-qa',
  'map': 'map',
  'failures': 'failures',
  'bank': 'bank',
  'blog': 'blog',
  'qa': 'qa',
};

// Hash segment → runner page value (when a case ID is present)
const HASH_TO_RUNNER_PAGE = {
  'u': 'public-profile', // userId acts as the "case ID"
  'sql-lab': 'sql-lab',
  'review': 'runner',
  'design': 'design-runner',
  'stats': 'stats-runner',
  'metrics': 'metrics-runner',
  'rca': 'rca-runner',
  'cases': 'cases-runner',
  'product-design': 'product-design-runner',
  'full-loop': 'full-loop-runner',
  'prioritization': 'prioritization-runner',
  'behavioral': 'behavioral-runner',
  'estimation': 'estimation-runner',
  'growth-analytics': 'growth-analytics-runner',
  'challenges': 'challenges-runner',
  'bi': 'bi-runner',
  'spot-the-flaw': 'stf-runner',
  'take-home': 'takehome-runner',
  'instrumentation': 'instrumentation-runner',
  'stats-foundations': 'stat-foundations-runner',
  'metrics-foundations': 'metrics-foundations-runner',
  'rca-foundations': 'rca-foundations-runner',
  'exp-foundations': 'exp-foundations-runner',
  'code-lab': 'code-runner',
  'shared': 'shared-track',
  // Content-reading surfaces — the "runner page" is the same page value; item id is appended
  'blog': 'blog',
  'interview-qa': 'interview-qa',
  'failures': 'failures',
  'cheatsheet': 'cheatsheet',
  'company-tracks': 'company-tracks',
};

// Runner page → the open function name to call (used by hashchange handler)
const RUNNER_OPEN_FN = {
  'public-profile': 'openPublicProfile',
  'sql-lab': 'openSqlProblem',
  'runner': 'openScenario',
  'design-runner': 'openDesignScenario',
  'stats-runner': 'openStatsModule',
  'metrics-runner': 'openMetricsCase',
  'rca-runner': 'openRCACase',
  'cases-runner': 'openBusinessCase',
  'product-design-runner': 'openPDScenario',
  'full-loop-runner': 'openFullLoopCase',
  'prioritization-runner': 'openPrioritizationScenario',
  'behavioral-runner': 'openBehavioralQuestion',
  'estimation-runner': 'openEstimationProblem',
  'stat-foundations-runner': 'openStatFoundationsModule',
  'growth-analytics-runner': 'openGrowthAnalyticsCase',
  'challenges-runner': 'openChallenge',
  'bi-runner': 'openBICase',
  'stf-runner': 'openSTFCase',
  'takehome-runner': 'openTakehomeCase',
  'instrumentation-runner': 'openInstrumentationCase',
  'metrics-foundations-runner': 'openMetricsFoundationModule',
  'rca-foundations-runner': 'openRCAFoundationModule',
  'exp-foundations-runner': 'openExpFoundationModule',
  'code-runner': 'openCodeModule',
  'shared-track': 'openSharedTrack',
  // Content-reading surfaces
  'blog': 'openBlogPost',
  'interview-qa': 'openInterviewQA',
  'failures': 'openFailure',
  'cheatsheet': 'openCheatSection',
  'company-tracks': 'openCompanyTrack',
};

/**
 * Convert current page state + active ID to a hash string.
 * Returns the hash WITHOUT the leading '#'.
 */
export function stateToHash(page, activeIds) {
  const hashSegment = PAGE_TO_HASH[page];
  if (hashSegment === undefined) return '/';

  // For runner pages, append the case ID
  const activeIdKey = RUNNER_ACTIVE_ID_KEY[page];
  if (activeIdKey) {
    const id = activeIds[activeIdKey];
    if (id) return '/' + hashSegment + '/' + id;
  }

  return hashSegment === '' ? '/' : '/' + hashSegment;
}

/**
 * Parse a hash string into { page, caseId, runnerPage, openFnName }.
 * Returns null if hash is not recognized.
 */
export function parseHash(hash) {
  // Strip leading '#' and '/'
  let clean = hash.replace(/^#?\/?/, '');
  // Remove trailing slash
  clean = clean.replace(/\/$/, '');

  if (clean === '') {
    return { page: 'home', caseId: null, runnerPage: null, openFnName: null };
  }

  // Split into segments: e.g. 'review/s01-checkout-trap' → ['review', 's01-checkout-trap']
  const parts = clean.split('/');
  const roomSlug = parts[0];
  const caseId = parts.length > 1 ? parts.slice(1).join('/') : null;

  const browserPage = HASH_TO_BROWSER_PAGE[roomSlug];
  if (!browserPage) return null; // unrecognized hash

  if (caseId) {
    const runnerPage = HASH_TO_RUNNER_PAGE[roomSlug];
    if (runnerPage) {
      return {
        page: runnerPage,
        caseId: caseId,
        runnerPage: runnerPage,
        openFnName: RUNNER_OPEN_FN[runnerPage] || null,
      };
    }
    // Room exists but has no runner — just go to browser
    return { page: browserPage, caseId: null, runnerPage: null, openFnName: null };
  }

  return { page: browserPage, caseId: null, runnerPage: null, openFnName: null };
}
