import { useState } from 'react';
import { scenarios } from '../data/scenarios.js';
import { designScenarios } from '../data/designScenarios.js';
import { statsModules } from '../data/statsModules.js';
import { metricCases } from '../data/metricCases.js';
import { rcaCases } from '../data/rcaCases.js';
import { businessCases } from '../data/businessCases.js';
import { productDesignScenarios } from '../data/productDesignScenarios.js';
import { codeModules } from '../data/codeModules.js';
import { prioritizationScenarios } from '../data/prioritizationScenarios.js';
import { behavioralQuestions } from '../data/behavioralQuestions.js';
import { estimationProblems } from '../data/estimationProblems.js';
import { statsFoundationsModules } from '../data/statsFoundationsModules.js';
import { growthAnalyticsCases } from '../data/growthAnalyticsCases.js';
import { Icon } from '../components/shared/Icon.jsx';
import { computeReadiness } from '../components/shared/ReadinessWidget.jsx';

// ─── Keyword → Room mapping ───────────────────────────────────────────────────
const KEYWORD_MAP = [
  { keywords: ['experiment', 'a/b test', 'ab test', 'hypothesis', 'randomiz', 'control group', 'treatment', 'statistical significance', 'p-value', 'power', 'mde', 'causal'], rooms: ['exp-foundations', 'design', 'browser', 'spot-the-flaw'] },
  { keywords: ['metric', 'kpi', 'north star', 'success metric', 'counter metric', 'guardrail', 'okr'], rooms: ['metrics-foundations', 'metrics', 'growth-analytics'] },
  { keywords: ['root cause', 'rca', 'diagnos', 'debug', 'drop', 'decline', 'anomaly', 'investigate'], rooms: ['rca-foundations', 'rca', 'cases'] },
  { keywords: ['sql', 'query', 'python', 'pandas', 'data analysis', 'data manipulation', 'analytics engineering', 'dbt', 'pipeline'], rooms: ['code'] },
  { keywords: ['product sense', 'product design', 'feature', 'launch', 'tradeoff', 'user research', 'pm', 'product manager', 'product analyst'], rooms: ['product-design', 'prioritization'] },
  { keywords: ['growth', 'funnel', 'retention', 'activation', 'acquisition', 'ltv', 'churn', 'conversion', 'engagement'], rooms: ['growth-analytics', 'metrics'] },
  { keywords: ['dashboard', 'reporting', 'bi', 'tableau', 'looker', 'visualization', 'stakeholder'], rooms: ['bi'] },
  { keywords: ['tracking', 'instrumentation', 'event', 'logging', 'schema', 'data quality', 'pipeline integrity'], rooms: ['instrumentation'] },
  { keywords: ['behavioral', 'leadership', 'influence', 'conflict', 'communication', 'cross-functional'], rooms: ['behavioral'] },
  { keywords: ['estimation', 'market size', 'fermi', 'back-of-envelope', 'sizing'], rooms: ['estimation'] },
  { keywords: ['statistics', 'variance', 'distribution', 'regression', 'bias', 'sampling', 'confidence interval'], rooms: ['stat-foundations', 'stats'] },
];

// ─── Room metadata ────────────────────────────────────────────────────────────
const ROOM_META = {
  'exp-foundations':     { label: 'A/B Foundations',       color: 'var(--accent)',  page: 'exp-foundations' },
  'design':              { label: 'A/B Design',             color: 'var(--accent)',  page: 'design' },
  'browser':             { label: 'A/B Review',             color: 'var(--accent)',  page: 'browser' },
  'spot-the-flaw':       { label: 'Spot the Flaw',          color: 'var(--red)',     page: 'spot-the-flaw' },
  'metrics-foundations': { label: 'Metrics Foundations',    color: 'var(--green)',   page: 'metrics-foundations' },
  'metrics':             { label: 'Metrics',                color: 'var(--green)',   page: 'metrics' },
  'growth-analytics':    { label: 'Growth Analytics',       color: 'var(--green)',   page: 'growth-analytics' },
  'rca-foundations':     { label: 'RCA Foundations',        color: 'var(--teal)',    page: 'rca-foundations' },
  'rca':                 { label: 'RCA',                    color: 'var(--teal)',    page: 'rca' },
  'cases':               { label: 'Cases',                  color: 'var(--teal)',    page: 'cases' },
  'code':                { label: 'Programming Lab',        color: 'var(--purple)',  page: 'code' },
  'product-design':      { label: 'Product Design',         color: 'var(--purple)',  page: 'product-design' },
  'prioritization':      { label: 'Prioritization',         color: 'var(--purple)',  page: 'prioritization' },
  'bi':                  { label: 'BI & Reporting',         color: 'var(--yellow)',  page: 'bi' },
  'instrumentation':     { label: 'Instrumentation',        color: 'var(--teal)',    page: 'instrumentation' },
  'behavioral':          { label: 'Behavioral',             color: 'var(--purple)',  page: 'behavioral' },
  'estimation':          { label: 'Estimation',             color: 'var(--yellow)',  page: 'estimation' },
  'stat-foundations':    { label: 'Stat Foundations',       color: 'var(--teal)',    page: 'stat-foundations' },
  'stats':               { label: 'Stats',                  color: 'var(--teal)',    page: 'stats' },
};

const FOUNDATION_ROOMS = new Set(['exp-foundations', 'metrics-foundations', 'rca-foundations', 'stat-foundations']);

const CATEGORY_LABELS = [
  { id: 'exp',           label: 'Experimentation',    keywords: ['experiment', 'a/b test', 'ab test', 'hypothesis', 'randomiz', 'control group', 'treatment', 'statistical significance', 'p-value', 'power', 'mde', 'causal'] },
  { id: 'metrics',       label: 'Metrics / KPIs',     keywords: ['metric', 'kpi', 'north star', 'success metric', 'counter metric', 'guardrail', 'okr'] },
  { id: 'rca',           label: 'RCA / Diagnosis',    keywords: ['root cause', 'rca', 'diagnos', 'debug', 'drop', 'decline', 'anomaly', 'investigate'] },
  { id: 'sql',           label: 'SQL / Python',       keywords: ['sql', 'query', 'python', 'pandas', 'data analysis', 'data manipulation', 'analytics engineering', 'dbt', 'pipeline'] },
  { id: 'product',       label: 'Product Sense',      keywords: ['product sense', 'product design', 'feature', 'launch', 'tradeoff', 'user research', 'pm', 'product manager', 'product analyst'] },
  { id: 'growth',        label: 'Growth / Funnels',   keywords: ['growth', 'funnel', 'retention', 'activation', 'acquisition', 'ltv', 'churn', 'conversion', 'engagement'] },
  { id: 'bi',            label: 'BI / Dashboards',    keywords: ['dashboard', 'reporting', 'bi', 'tableau', 'looker', 'visualization', 'stakeholder'] },
  { id: 'instrumentation', label: 'Instrumentation',  keywords: ['tracking', 'instrumentation', 'event', 'logging', 'schema', 'data quality', 'pipeline integrity'] },
  { id: 'behavioral',    label: 'Behavioral',         keywords: ['behavioral', 'leadership', 'influence', 'conflict', 'communication', 'cross-functional'] },
  { id: 'estimation',    label: 'Estimation',         keywords: ['estimation', 'market size', 'fermi', 'back-of-envelope', 'sizing'] },
  { id: 'stats',         label: 'Statistics',         keywords: ['statistics', 'variance', 'distribution', 'regression', 'bias', 'sampling', 'confidence interval'] },
];

var ROOM_DATA_MAP = {
  'browser':          { key: 'scenarios',               titleField: 'title', idField: 'id' },
  'stats':            { key: 'statsModules',             titleField: 'title', idField: 'id' },
  'metrics':          { key: 'metricCases',              titleField: 'title', idField: 'id' },
  'design':           { key: 'designScenarios',          titleField: 'title', idField: 'id' },
  'rca':              { key: 'rcaCases',                 titleField: 'title', idField: 'id' },
  'cases':            { key: 'businessCases',            titleField: 'title', idField: 'id' },
  'product-design':   { key: 'productDesignScenarios',   titleField: 'title', idField: 'id' },
  'code':             { key: 'codeModules',              titleField: 'title', idField: 'id' },
  'prioritization':   { key: 'prioritizationScenarios',  titleField: 'title', idField: 'id' },
  'behavioral':       { key: 'behavioralQuestions',      titleField: 'title', idField: 'id' },
  'estimation':       { key: 'estimationProblems',       titleField: 'title', idField: 'id' },
  'stat-foundations': { key: 'statsFoundationsModules',  titleField: 'title', idField: 'id' },
  'growth-analytics': { key: 'growthAnalyticsCases',     titleField: 'title', idField: 'id' },
};

// ─── Skill → Verbal prompt (Layer 6) ─────────────────────────────────────────
const SKILL_VERBAL_MAP = {
  exp:             'Explain in 90 seconds: your PM asks you to design an experiment for a new checkout flow. Walk them through your approach.',
  metrics:         'Explain in 90 seconds: how would you define the north star metric for a B2B SaaS product, and what guardrails would you set?',
  rca:             'Explain in 90 seconds: DAU dropped 18% overnight. Walk me through your first 30 minutes of investigation.',
  stats:           'Explain in 90 seconds: your experiment shows p=0.04 but the CI lower bound is near zero. What do you tell the PM?',
  growth:          'Explain in 90 seconds: retention fell from 38% to 31% over a quarter. What\'s your first diagnostic cut?',
  product:         'Explain in 90 seconds: you have 10 feature requests and 3 engineers for one sprint. How do you prioritize?',
  sql:             'Explain in 90 seconds: a stakeholder asks for a report on 30-day retention by acquisition channel. What SQL approach do you use?',
  bi:              'Explain in 90 seconds: your dashboard shows a 15% revenue spike yesterday. How do you determine if it\'s real?',
  instrumentation: 'Explain in 90 seconds: a new feature is shipping next week. What tracking plan do you put in place before launch?',
  behavioral:      'Explain in 90 seconds: tell me about a time you used data to change a PM\'s mind about a product decision.',
  estimation:      'Explain in 90 seconds: estimate the number of daily active users Uber has in Mumbai.',
};

// ─── Skill → Foundation room map (Layer 4A step 2) ───────────────────────────
const SKILL_FOUNDATION_MAP = {
  exp:             { page: 'exp-foundations',     label: 'Exp Foundations' },
  metrics:         { page: 'metrics-foundations', label: 'Metrics Foundations' },
  rca:             { page: 'rca-foundations',      label: 'RCA Foundations' },
  stats:           { page: 'stat-foundations',     label: 'Stat Foundations' },
  growth:          { page: 'metrics-foundations',  label: 'Metrics Foundations' },
};

// ─── Skill → MCQ Trainer category map (Layer 4A step 4) ──────────────────────
const SKILL_TRAINER_MAP = {
  exp:             'Experimentation',
  metrics:         'Metrics & Growth',
  rca:             'Statistics',
  stats:           'Statistics',
  growth:          'Metrics & Growth',
  product:         'Product & Prioritization',
  bi:              'Metrics & Growth',
  behavioral:      'Product & Prioritization',
};

// ─── Skill → Playbook article map (Layer 4A step 1) ──────────────────────────
const SKILL_ARTICLE_MAP = {
  exp:             { id: 'end-to-end-experiment',  label: 'End-to-End A/B Testing' },
  metrics:         { id: 'north-star-metric',       label: 'North Star Metrics' },
  rca:             { id: 'rca-framework',            label: 'The RCA Framework' },
  sql:             { id: 'sql-window-functions',     label: 'SQL Window Functions' },
  product:         { id: 'prioritization-frameworks',label: 'Prioritization Frameworks' },
  growth:          { id: 'growth-accounting',        label: 'Growth Accounting' },
  bi:              { id: 'dashboard-design',          label: 'Dashboard Design' },
  instrumentation: { id: 'event-taxonomy',            label: 'Event Taxonomy' },
  behavioral:      { id: 'star-method',               label: 'The STAR Method' },
  estimation:      { id: 'fermi-estimation',          label: 'Fermi Estimation' },
  stats:           { id: 'statistical-significance',  label: 'Statistical Significance' },
};

// ─── Skill definitions (id matches CATEGORY_LABELS ids) ──────────────────────
const SKILL_DEFS = [
  { id: 'exp',             label: 'Experimentation / A/B',  rooms: ['exp-foundations', 'design', 'browser', 'spot-the-flaw'] },
  { id: 'metrics',         label: 'Metrics & KPIs',         rooms: ['metrics-foundations', 'metrics', 'growth-analytics'] },
  { id: 'rca',             label: 'RCA & Root Cause',        rooms: ['rca-foundations', 'rca', 'cases'] },
  { id: 'sql',             label: 'SQL & Python',            rooms: ['code'] },
  { id: 'product',         label: 'Product Sense',           rooms: ['product-design', 'prioritization'] },
  { id: 'growth',          label: 'Growth & Funnels',        rooms: ['growth-analytics', 'metrics'] },
  { id: 'bi',              label: 'BI & Reporting',          rooms: ['bi'] },
  { id: 'instrumentation', label: 'Instrumentation',         rooms: ['instrumentation'] },
  { id: 'behavioral',      label: 'Behavioral',              rooms: ['behavioral'] },
  { id: 'estimation',      label: 'Estimation',              rooms: ['estimation'] },
  { id: 'stats',           label: 'Statistics',              rooms: ['stat-foundations', 'stats'] },
];

// ─── Skills PAL does NOT cover ────────────────────────────────────────────────
const OUTSIDE_PAL_SIGNALS = [
  {
    keywords: ['excel', 'spreadsheet', 'pivot table', 'vlookup', 'macro', 'vba', 'google sheets'],
    label: 'Excel & Spreadsheets',
    action: 'PAL does not cover Excel. Practice 2 pivot table exercises on a public dataset. One VLOOKUP, one INDEX-MATCH. That covers 80% of what gets tested.',
  },
  {
    keywords: ['financial model', 'p&l', 'profit and loss', 'unit economics', 'balance sheet', 'income statement', 'revenue model', 'gmv', 'take rate'],
    label: 'Financial / Business Modeling',
    action: 'Outside PAL scope. Study the company\'s revenue model specifically (GMV, take rate, unit economics). CFI free course covers the mechanics.',
  },
  {
    keywords: ['presentation', 'slide deck', 'powerpoint', 'storytell', 'communicate findings', 'executive communication', 'narrative'],
    label: 'Presentation & Storytelling',
    action: 'Outside PAL scope. Practice: structure a 5-minute data to insight to recommendation walkthrough out loud, twice. Record it once.',
  },
];

// ─── Interview round templates ────────────────────────────────────────────────
const ROUND_TEMPLATES = [
  { id: 'screening', label: 'Screening / HR',        focus: 'Background, motivation, basic metrics vocabulary. Low technical depth.', skillIds: ['behavioral', 'metrics'] },
  { id: 'technical', label: 'Technical Round',        focus: 'SQL, data analysis, product analytics, KPIs in context. Your hardest prep surface.', skillIds: ['sql', 'metrics', 'growth', 'instrumentation', 'stats'] },
  { id: 'case',      label: 'Case / Problem Solving', focus: 'RCA, business cases, product design decisions. Structure matters more than the answer.', skillIds: ['rca', 'product', 'estimation', 'growth'] },
  { id: 'final',     label: 'Bar Raiser / Final',     focus: 'Experimentation design, business judgment, prioritization under constraints.', skillIds: ['exp', 'product', 'bi'] },
];

// ─── Helpers: original ────────────────────────────────────────────────────────
function scoreRooms(jdText) {
  const text = jdText.toLowerCase();
  const scores = {};
  KEYWORD_MAP.forEach(entry => {
    const hits = entry.keywords.filter(k => text.includes(k)).length;
    if (hits === 0) return;
    entry.rooms.forEach(roomId => { scores[roomId] = (scores[roomId] || 0) + hits; });
  });
  return scores;
}

function getMatchedCategories(jdText) {
  const text = jdText.toLowerCase();
  const matched = [];
  CATEGORY_LABELS.forEach(cat => {
    const hits = cat.keywords.filter(k => text.includes(k)).length;
    if (hits > 0) matched.push({ id: cat.id, label: cat.label, hits });
  });
  return matched.sort((a, b) => b.hits - a.hits);
}

function getTopCases(roomId, allData, jdText, limit) {
  if (!allData) return [];
  var mapping = ROOM_DATA_MAP[roomId];
  if (!mapping) return [];
  var arr = allData[mapping.key];
  if (!arr || arr.length === 0) return [];
  var text = jdText.toLowerCase();
  var scored = arr.map(function(item, idx) {
    var score = 0;
    var title = (item[mapping.titleField] || '').toLowerCase();
    var tags = item.tags || [];
    tags.forEach(function(tag) { if (text.includes(tag.toLowerCase())) score += 2; });
    title.split(/\s+/).forEach(function(word) { if (word.length > 3 && text.includes(word)) score += 1; });
    return { item: item, score: score, idx: idx };
  });
  scored.sort(function(a, b) { return b.score !== a.score ? b.score - a.score : a.idx - b.idx; });
  return scored.slice(0, limit).map(function(s) { return s.item; });
}

function truncateTitle(title) {
  return title.length > 45 ? title.slice(0, 42) + '...' : title;
}

// ─── Helpers: new ────────────────────────────────────────────────────────────
function getWeight(hits) {
  if (hits >= 4) return 3;
  if (hits >= 2) return 2;
  return 1;
}

function computeGapScore(weight, rating) {
  const inv = { weak: 3, okay: 2, strong: 1 };
  return weight * (inv[rating] || 2);
}

function buildGapRoomOrder(gaps) {
  const seen = new Set();
  const order = [];
  gaps.forEach(g => {
    const def = SKILL_DEFS.find(s => s.id === g.id);
    if (!def) return;
    def.rooms.forEach(r => { if (!seen.has(r) && ROOM_META[r]) { seen.add(r); order.push(r); } });
  });
  return order;
}

function detectOutsidePAL(jdText) {
  const text = jdText.toLowerCase();
  return OUTSIDE_PAL_SIGNALS.filter(sig => sig.keywords.some(k => text.includes(k)));
}

function buildDayPlan(roomOrder, gaps, dayCount, intensity) {
  const rpp = intensity === 'fullblitz' ? 3 : 2;
  const days = [];
  let roomIdx = 0;

  const NOTES = [
    'Your biggest gap. Attempt cases cold — read every debrief carefully.',
    'Verbal practice: explain your approach out loud before committing your answer.',
    'Write one sentence connecting each topic to a real past project.',
    'Do at least 3 cases. Note which sub-type you keep getting wrong.',
    'Breadth day. One case per room. Flag anything you cannot explain clearly.',
    'Return to your weak-rated areas. Can you answer without reading the debrief?',
    'Simulate one 30-min round out loud: no hints, timed.',
    'Re-attempt your hardest cases cold. Measure your improvement.',
    'Round simulation — Screening: behavioral + one metric question, 15 min.',
    'Round simulation — Technical: 3 SQL cases back-to-back.',
    'Round simulation — Case: one full RCA walkthrough out loud.',
    'Stretch coverage. Surface areas you have not touched yet.',
    'Full 60-min mock: behavioral, then technical, then case. No hints.',
    'Light review only. Your 5 strongest cases. Sleep. You are ready.',
  ];

  for (let d = 1; d <= dayCount; d++) {
    const isLast = d === dayCount;
    const isMid = d === Math.ceil(dayCount / 2) && dayCount >= 7;

    if (isLast) {
      days.push({
        day: d, label: 'Day ' + d,
        theme: dayCount >= 14 ? 'Final Polish' : 'Review + Simulate',
        rooms: roomOrder.slice(0, Math.min(rpp, roomOrder.length)),
        note: dayCount >= 14 ? NOTES[13] : NOTES[6],
        tier: 'review',
      });
    } else if (isMid) {
      const weakRooms = gaps
        .filter(g => g.rating === 'weak')
        .flatMap(g => (SKILL_DEFS.find(s => s.id === g.id) || {}).rooms || [])
        .filter(r => ROOM_META[r])
        .slice(0, rpp);
      days.push({
        day: d, label: 'Day ' + d, theme: 'Weak Spot Focus',
        rooms: weakRooms.length > 0 ? weakRooms : roomOrder.slice(roomIdx, roomIdx + rpp),
        note: NOTES[5],
        tier: 'weak',
      });
      if (weakRooms.length === 0) roomIdx += rpp;
    } else {
      const dayRooms = roomOrder.slice(roomIdx, roomIdx + rpp).filter(r => ROOM_META[r]);
      const progress = (d - 1) / (dayCount - 1);
      const tier = progress < 0.35 ? 'gap' : progress < 0.7 ? 'practice' : 'breadth';
      const theme = d === 1 ? 'Biggest Gap' : d === 2 ? 'Second Priority' : progress < 0.5 ? 'Core Practice' : 'Breadth Coverage';
      const noteIdx = Math.min(d - 1, NOTES.length - 1);
      days.push({ day: d, label: 'Day ' + d, theme, rooms: dayRooms, note: NOTES[noteIdx], tier });
      roomIdx += rpp;
    }
  }

  return days.filter(d => d.rooms && d.rooms.length > 0);
}

// ─── Plan persistence + auto-detection ───────────────────────────────────────
const PLAN_KEY = 'pal-defense-plan-v1';

const ROOM_PROGRESS_KEY = {
  'rca':                'pal-rca-progress-v2',
  'metrics':            'pal-metrics-progress-v2',
  'cases':              'pal-cases-progress-v2',
  'stats':              'pal-stats-progress-v1',
  'code':               'pal-code-progress-v1',
  'behavioral':         'pal-behavioral-progress-v1',
  'estimation':         'pal-estimation-progress-v1',
  'growth-analytics':   'pal-growth-analytics-progress-v1',
  'bi':                 'pal-bi-progress-v1',
  'instrumentation':    'pal-instrumentation-progress-v1',
  'product-design':     'pal-design-progress-v1',
  'prioritization':     'pal-pri-progress-v1',
  'spot-the-flaw':      'pal-stf-progress-v1',
  'browser':            'exp-lab-progress-v1',
  'design':             'pal-design-progress-v1',
  'exp-foundations':    'pal-exp-foundation-progress-v1',
  'rca-foundations':    'pal-rca-foundation-progress-v1',
  'stat-foundations':   'pal-stat-foundations-progress-v1',
  'metrics-foundations':'pal-metrics-foundation-progress-v1',
};

function isCaseDone(roomId, caseId) {
  const key = ROOM_PROGRESS_KEY[roomId];
  if (!key) return false;
  try {
    const store = JSON.parse(localStorage.getItem(key) || '{}');
    return !!store[caseId];
  } catch { return false; }
}

function extractPlanSteps(plan, allData, jdText) {
  const steps = [];
  if (plan.type === 'cram') {
    plan.topRooms.forEach(function(roomId) {
      var meta = ROOM_META[roomId];
      if (!meta) return;
      getTopCases(roomId, allData, jdText, 2).forEach(function(c) {
        steps.push({ roomId: roomId, page: meta.page, caseId: c.id, title: c.title || '' });
      });
    });
  } else {
    plan.days.forEach(function(dayObj) {
      (dayObj.rooms || []).forEach(function(roomId) {
        var meta = ROOM_META[roomId];
        if (!meta) return;
        getTopCases(roomId, allData, jdText, 2).forEach(function(c) {
          steps.push({ roomId: roomId, page: meta.page, caseId: c.id, title: c.title || '', day: dayObj.day });
        });
      });
    });
  }
  return steps;
}

function savePlan(steps, type) {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify({ generatedAt: Date.now(), type: type, steps: steps }));
  } catch {}
}

function loadSavedPlanSteps() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAN_KEY) || '{}');
    return saved.steps || [];
  } catch { return []; }
}

// Compact readiness for the Defense page: build a {label, completed} array keyed
// by the SAME labels ReadinessWidget.computeReadiness expects, sourced from the
// localStorage progress stores. We pass no `total`, so computeReadiness uses its
// ROOM_CAP as the per-room target — an honest "solved enough to be credible" cut.
const READINESS_STORE_BY_LABEL = {
  'Metrics':              'pal-metrics-progress-v2',
  'RCA':                  'pal-rca-progress-v2',
  'Cases':                'pal-cases-progress-v2',
  'Stats':                'pal-stats-progress-v1',
  'Growth Analytics':     'pal-growth-analytics-progress-v1',
  'BI':                   'pal-bi-progress-v1',
  'Spot the Flaw':        'pal-stf-progress-v1',
  'Instrumentation':      'pal-instrumentation-progress-v1',
  'Behavioral':           'pal-behavioral-progress-v1',
  'Estimation':           'pal-estimation-progress-v1',
  'Metrics Foundations':  'pal-metrics-foundation-progress-v1',
  'RCA Foundations':      'pal-rca-foundation-progress-v1',
  'Exp Foundations':      'pal-exp-foundation-progress-v1',
  'Stat Foundations':     'pal-stat-foundations-progress-v1',
};

function buildReadinessRooms() {
  const rooms = [];
  Object.keys(READINESS_STORE_BY_LABEL).forEach(function(label) {
    let completed = 0;
    try {
      const store = JSON.parse(localStorage.getItem(READINESS_STORE_BY_LABEL[label]) || '{}');
      completed = Object.keys(store).length;
    } catch {}
    rooms.push({ label: label, completed: completed });
  });
  // SQL Lab solved set is stored as an array, not an object map.
  try {
    const solved = JSON.parse(localStorage.getItem('pal-sql-lab-solved-v1') || '[]');
    rooms.push({ label: 'SQL Lab', completed: Array.isArray(solved) ? solved.length : 0 });
  } catch { rooms.push({ label: 'SQL Lab', completed: 0 }); }
  return rooms;
}

function daysUntilTarget() {
  try {
    const iso = localStorage.getItem('pal-target-date-v1');
    if (!iso) return null;
    const target = new Date(iso + 'T00:00:00');
    if (isNaN(target.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  } catch { return null; }
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DefenseDocGenerator({ onBack, onNavigate, onOpenArticle, unlocked }) {
  const allData = { scenarios, designScenarios, statsModules, metricCases, rcaCases, businessCases, productDesignScenarios, codeModules, prioritizationScenarios, behavioralQuestions, estimationProblems, statsFoundationsModules, growthAnalyticsCases };

  const [step, setStep]                   = useState('input');
  const [jdText, setJdText]               = useState('');
  const [extractedSkills, setExtracted]   = useState([]);
  const [ratings, setRatings]             = useState({});
  const [timeHorizon, setTimeHorizon]     = useState('7');
  const [intensity, setIntensity]         = useState('balanced');
  const [stratPlan, setStratPlan]         = useState(null);
  const [planSteps, setPlanSteps]         = useState(() => loadSavedPlanSteps());

  function handleAnalyze() {
    if (!jdText.trim()) return;
    const cats = getMatchedCategories(jdText);
    let skills = cats.slice(0, 7).map(c => ({ id: c.id, label: c.label, hits: c.hits, weight: getWeight(c.hits) }));
    if (skills.length < 3) {
      SKILL_DEFS.filter(s => !skills.find(sk => sk.id === s.id)).slice(0, 5 - skills.length)
        .forEach(f => skills.push({ id: f.id, label: f.label, hits: 0, weight: 1 }));
    }
    setExtracted(skills);
    const defaults = {};
    skills.forEach(s => { defaults[s.id] = 'okay'; });
    setRatings(defaults);
    setStep('configure');
  }

  function handleBuild() {
    const gaps = extractedSkills.map(s => ({
      ...s,
      rating: ratings[s.id] || 'okay',
      gapScore: computeGapScore(s.weight, ratings[s.id] || 'okay'),
    })).sort((a, b) => b.gapScore - a.gapScore);

    const roomOrder = buildGapRoomOrder(gaps);
    const outside   = detectOutsidePAL(jdText);
    const isCram    = timeHorizon === 'cram';

    let plan;
    if (isCram) {
      plan = { type: 'cram', gaps, topRooms: roomOrder.slice(0, intensity === 'fullblitz' ? 5 : 3), outside };
    } else {
      const dayCount = timeHorizon === '3' ? 3 : timeHorizon === '14' ? 14 : 7;
      const days = buildDayPlan(roomOrder, gaps, dayCount, intensity);
      plan = { type: 'plan', gaps, days, roomOrder, outside };
    }
    setStratPlan(plan);
    const steps = extractPlanSteps(plan, allData, jdText);
    setPlanSteps(steps);
    savePlan(steps, plan.type);
    setStep('plan');
  }

  const STEPS = [
    { key: 'input',     label: 'Paste JD' },
    { key: 'configure', label: 'Rate Skills' },
    { key: 'plan',      label: 'Your Strategy' },
  ];
  const stepIdx = STEPS.findIndex(s => s.key === step);

  const ratingColor = { weak: 'var(--red)', okay: 'var(--yellow)', strong: 'var(--teal)' };
  const ratingBg    = { weak: 'var(--red-bg)', okay: 'var(--yellow-bg)', strong: 'var(--teal-bg)' };
  const ratingBorder = { weak: 'var(--red-border)', okay: 'var(--yellow-border)', strong: 'var(--teal-border)' };
  const ratingLabel = { weak: 'Weak', okay: 'Okay', strong: 'Strong' };

  return (
    <div className="pal-page-enter" style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.25rem 6rem' }}>

      {/* Back */}
      {onBack && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          ← Back
        </button>
      )}

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--purple-bg)', border: '1px solid var(--purple-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}><Icon name='shield' size={18} color='currentColor' /></span>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--purple)', marginBottom: 2 }}>Prep Tools</div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Defense Strategy</h1>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.4rem 0 0', maxWidth: 560, lineHeight: 1.6 }}>
          Most candidates prep in the wrong order — practicing what feels comfortable instead of closing the gaps the job description is actually testing. Defense Strategy reads the JD, maps its skill demands against your self-rated gaps, and builds a prioritized prep plan so your final week is spent on what matters for this specific role.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => {
          const isDone   = i < stepIdx;
          const isActive = i === stepIdx;
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: isDone ? 'var(--purple)' : isActive ? 'var(--purple-bg)' : 'var(--surface-2)', border: '2px solid ' + (isDone || isActive ? 'var(--purple)' : 'var(--border)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: isDone ? 'white' : isActive ? 'var(--purple)' : 'var(--text-dim)', flexShrink: 0 }}>
                  {isDone ? <Icon name='check' size={11} color='currentColor' /> : i + 1}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 400, color: isActive ? 'var(--text)' : isDone ? 'var(--text-muted)' : 'var(--text-dim)' }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div style={{ width: 20, height: 1, background: 'var(--border)', flexShrink: 0, margin: '0 0.1rem' }} />}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: JD Input ── */}
      {step === 'input' && (
        <div style={{ maxWidth: 640 }}>
          {/* Resume saved plan banner */}
          {planSteps.length > 0 && (() => {
            const done = planSteps.filter(s => isCaseDone(s.roomId, s.caseId)).length;
            const pct = Math.round((done / planSteps.length) * 100);
            const savedMeta = (() => { try { const s = JSON.parse(localStorage.getItem(PLAN_KEY) || '{}'); return s; } catch { return {}; } })();
            const daysAgo = savedMeta.generatedAt ? Math.floor((Date.now() - savedMeta.generatedAt) / (1000 * 60 * 60 * 24)) : null;
            return (
              <div style={{ background: 'var(--purple-bg)', border: '1px solid var(--purple-border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--purple)', marginBottom: '0.3rem' }}>
                  Previous plan active — {pct}% complete
                </div>
                <p style={{ margin: '0 0 0.65rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {done} of {planSteps.length} cases done{daysAgo !== null ? ` · generated ${daysAgo === 0 ? 'today' : daysAgo + (daysAgo === 1 ? ' day ago' : ' days ago')}` : ''}.
                </p>
                {(() => {
                  const td = daysUntilTarget();
                  if (td == null) return null;
                  const ready = computeReadiness(buildReadinessRooms()).score;
                  const dayLabel = td < 0 ? 'date passed' : td === 0 ? 'today' : td + ' day' + (td === 1 ? '' : 's') + ' out';
                  return (
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--purple)', marginBottom: '0.65rem' }}>
                      {dayLabel} · {ready}% ready
                    </div>
                  );
                })()}
                <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden', marginBottom: '0.65rem' }}>
                  <div style={{ height: '100%', width: pct + '%', background: 'var(--purple)', borderRadius: 99, transition: 'width 0.3s' }} />
                </div>
                <button
                  onClick={() => setStep('plan')}
                  style={{ background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Resume plan →
                </button>
                <button
                  onClick={() => { localStorage.removeItem(PLAN_KEY); setPlanSteps([]); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', marginLeft: '0.75rem' }}
                >
                  Start fresh
                </button>
              </div>
            );
          })()}
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '0.6rem' }}>
            Job description
          </label>
          <textarea
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            placeholder={'Paste the full job description here.\n\nInclude responsibilities and qualifications for best results.'}
            style={{ width: '100%', minHeight: 240, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem', fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.65, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s' }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--purple)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.35rem', marginBottom: '1rem' }}>
            Tip: the fuller the JD, the more accurate your skill gap map.
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!jdText.trim()}
            style={{ background: jdText.trim() ? 'var(--purple)' : 'var(--surface-2)', color: jdText.trim() ? 'white' : 'var(--text-dim)', border: 'none', borderRadius: 'var(--radius)', padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 700, cursor: jdText.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
          >
            Analyze JD →
          </button>
        </div>
      )}

      {/* ── STEP 2: Configure ── */}
      {step === 'configure' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(480px, 100%), 1fr))', gap: '2rem', alignItems: 'start' }}>

          {/* Left: skill ratings */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.3rem' }}>Rate yourself on each skill</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Be honest — this shapes your plan. The dots show how much the JD weights each skill.
            </div>
            {extractedSkills.some(s => s.hits === 0) && (
              <div style={{ padding: '0.65rem 0.85rem', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--yellow-text)', marginBottom: '0.9rem', lineHeight: 1.5 }}>
                Few signals matched this JD — showing defaults. Rate each skill to personalize.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {extractedSkills.map(skill => {
                const r = ratings[skill.id] || 'okay';
                return (
                  <div key={skill.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{skill.label}</span>
                      <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                        {[1, 2, 3].map(w => (
                          <div key={w} style={{ width: 7, height: 7, borderRadius: '50%', background: w <= skill.weight ? 'var(--purple)' : 'var(--border)', opacity: w <= skill.weight ? 1 : 0.35 }} />
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                      {['weak', 'okay', 'strong'].map(val => (
                        <button
                          key={val}
                          onClick={() => setRatings(prev => ({ ...prev, [skill.id]: val }))}
                          style={{ padding: '0.26rem 0.55rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid ' + (r === val ? ratingBorder[val] : 'var(--border)'), background: r === val ? ratingBg[val] : 'none', color: r === val ? ratingColor[val] : 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.1s', textTransform: 'capitalize' }}
                        >
                          {ratingLabel[val]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setStep('input')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '1rem', padding: 0 }}>
              ← Change JD
            </button>
          </div>

          {/* Right: time horizon + intensity + build */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.3rem' }}>How much time do you have?</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.9rem' }}>Pick the mode that matches your runway.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[
                { key: 'cram', label: 'Cram Up',  sub: 'Interview today or tomorrow' },
                { key: '3',    label: '3 Days',    sub: 'Short but focused prep window' },
                { key: '7',    label: '7 Days',    sub: 'Standard structured prep' },
                { key: '14',   label: '14 Days',   sub: 'Thorough gap-first coverage' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTimeHorizon(t.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left', padding: '0.8rem 1rem', background: timeHorizon === t.key ? 'var(--purple-bg)' : 'var(--surface)', border: '1.5px solid ' + (timeHorizon === t.key ? 'var(--purple-border)' : 'var(--border)'), borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.1s' }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: timeHorizon === t.key ? 'var(--purple)' : 'var(--text)' }}>{t.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.sub}</div>
                  </div>
                  {timeHorizon === t.key && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', flexShrink: 0 }} />}
                </button>
              ))}
            </div>

            {timeHorizon !== 'cram' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.3rem' }}>Intensity</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>How hard do you want to push per day?</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { key: 'balanced',  label: 'Balanced',   sub: '2 rooms/day — deeper work' },
                    { key: 'fullblitz', label: 'Full Blitz', sub: '3 rooms/day — full coverage' },
                  ].map(m => (
                    <button
                      key={m.key}
                      onClick={() => setIntensity(m.key)}
                      style={{ flex: 1, textAlign: 'left', padding: '0.75rem 0.9rem', background: intensity === m.key ? 'var(--purple-bg)' : 'var(--surface)', border: '1.5px solid ' + (intensity === m.key ? 'var(--purple-border)' : 'var(--border)'), borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.1s' }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: intensity === m.key ? 'var(--purple)' : 'var(--text)' }}>{m.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleBuild}
              style={{ width: '100%', background: 'var(--purple)', color: 'white', border: 'none', borderRadius: 'var(--radius)', padding: '0.8rem 1.25rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              Build my strategy →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Plan Output ── */}
      {step === 'plan' && stratPlan && (function() {
        const { gaps, outside } = stratPlan;
        const maxGap = Math.max(...gaps.map(g => g.gapScore), 1);

        const tierColors = {
          gap:      { color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)',    label: 'Gap Focus' },
          practice: { color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)', label: 'Practice' },
          breadth:  { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)', label: 'Breadth' },
          weak:     { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)', label: 'Weak Spot' },
          review:   { color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)',   label: 'Review' },
        };

        return (
          <div>
            {/* Skill-gap heatmap — sorted by gapScore desc, severity-graded by share of max gap */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem 1.4rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Skill gap heatmap</div>
                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'High', color: 'var(--red)' },
                    { label: 'Medium', color: 'var(--yellow)' },
                    { label: 'Low', color: 'var(--green)' },
                  ].map(l => (
                    <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.66rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      <span style={{ width: 9, height: 9, borderRadius: 2, background: l.color, flexShrink: 0 }} />
                      {l.label} priority
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {gaps.map(g => {
                  // Severity by share of the largest gap — high >= 0.66, medium >= 0.33, else low
                  const share = g.gapScore / maxGap;
                  const sevColor = share >= 0.66 ? 'var(--red)' : share >= 0.33 ? 'var(--yellow)' : 'var(--green)';
                  return (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <div style={{ width: 150, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.label}</div>
                      {/* Weight dots — reuse the configure-step indicator */}
                      <div style={{ display: 'flex', gap: 3, flexShrink: 0, width: 27 }}>
                        {[1, 2, 3].map(w => (
                          <div key={w} style={{ width: 7, height: 7, borderRadius: '50%', background: w <= g.weight ? 'var(--purple)' : 'var(--border)', opacity: w <= g.weight ? 1 : 0.35 }} />
                        ))}
                      </div>
                      {/* Self-rating chip */}
                      <span style={{ fontSize: '0.64rem', fontWeight: 700, color: ratingColor[g.rating], background: ratingBg[g.rating], border: '1px solid ' + ratingBorder[g.rating], borderRadius: 4, padding: '0.1rem 0.4rem', flexShrink: 0, width: 52, textAlign: 'center', boxSizing: 'border-box' }}>{ratingLabel[g.rating]}</span>
                      {/* Severity-graded bar — width proportional to gapScore / maxGap */}
                      <div style={{ flex: 1, height: 9, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden', minWidth: 40 }}>
                        <div style={{ height: '100%', width: Math.max(share * 100, 6) + '%', background: sevColor, borderRadius: 99, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Round-by-round breakdown */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Round-by-round exposure</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '0.6rem' }}>
                {ROUND_TEMPLATES.map(round => {
                  const roundGaps = gaps.filter(g => round.skillIds.includes(g.id));
                  const maxScore  = roundGaps.length > 0 ? Math.max(...roundGaps.map(g => g.gapScore)) : 0;
                  const roundAccent = maxScore >= 6 ? 'var(--red)' : maxScore >= 3 ? 'var(--yellow)' : 'var(--teal)';
                  return (
                    <div key={round.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1rem', borderLeft: '3px solid ' + roundAccent }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>{round.label}</span>
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.6rem' }}>{round.focus}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {roundGaps.length > 0 ? roundGaps.map(g => (
                          <span key={g.id} style={{ fontSize: '0.65rem', fontWeight: 700, color: ratingColor[g.rating], background: ratingBg[g.rating], border: '1px solid ' + ratingBorder[g.rating], borderRadius: 4, padding: '0.1rem 0.38rem' }}>
                            {g.label} · {ratingLabel[g.rating]}
                          </span>
                        )) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>Not in JD</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cram Up output */}
            {stratPlan.type === 'cram' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Cram Up — top priorities right now
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1rem' }}>
                  {stratPlan.topRooms.map((roomId, i) => {
                    const meta = ROOM_META[roomId];
                    if (!meta) return null;
                    const topCases = getTopCases(roomId, allData, jdText, 2);
                    const accent = i === 0 ? 'var(--red)' : i === 1 ? 'var(--yellow)' : meta.color;
                    return (
                      <div key={roomId} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', borderLeft: '3px solid ' + accent }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: topCases.length > 0 ? '0.5rem' : 0 }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)' }}>#{i + 1}</span>
                          <button onClick={() => onNavigate && onNavigate(meta.page)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', color: meta.color, padding: 0 }}>
                            {meta.label} →
                          </button>
                        </div>
                        {topCases.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                            {topCases.map(c => (
                              <button key={c.id} onClick={() => onNavigate && onNavigate(meta.page, c.id)} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 5, padding: '0.2rem 0.55rem', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                                {'▸ ' + truncateTitle(c.title || '')}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: '0.9rem 1rem', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
                  <strong>The hour before:</strong> Review your top 2 gap areas cold. Have one clear structure for RCA ready in your head: clarify the metric, decompose into drivers, prioritize hypotheses, state next steps. Do not start anything new.
                </div>
              </div>
            )}

            {/* Day plan output */}
            {stratPlan.type === 'plan' && (() => {
              // 'Today' = first day with any incomplete step; null if every day is fully done.
              const dayHasIncomplete = dayNum => planSteps.some(s => s.day === dayNum && !isCaseDone(s.roomId, s.caseId));
              const todayDay = (() => {
                const found = stratPlan.days.find(d => dayHasIncomplete(d.day));
                return found ? found.day : null;
              })();
              return (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Your {stratPlan.days.length}-day plan
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {stratPlan.days.map(dayObj => {
                    const tc = tierColors[dayObj.tier] || tierColors.practice;
                    const isToday = dayObj.day === todayDay;
                    return (
                      <div key={dayObj.day} style={{ background: 'var(--surface)', border: isToday ? '1.5px solid var(--purple-border)' : '1px solid var(--border)', boxShadow: isToday ? '0 0 0 2px var(--purple-bg)' : 'none', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', borderLeft: '3px solid ' + tc.color }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>{dayObj.label}</span>
                            <span style={{ fontWeight: 500, fontSize: '0.78rem', color: 'var(--text-muted)' }}>— {dayObj.theme}</span>
                            {isToday && (
                              <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff', background: 'var(--purple)', borderRadius: 4, padding: '0.12rem 0.45rem' }}>
                                Today · Resume here
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: tc.color, background: tc.bg, border: '1px solid ' + tc.border, borderRadius: 4, padding: '0.12rem 0.45rem' }}>
                            {tc.label}
                          </span>
                        </div>
                        {/* Layer 4A: micro-sequence — Read first / Review foundations / Drill */}
                        {(() => {
                          const primaryRoom = (dayObj.rooms || [])[0];
                          const matchedSkill = SKILL_DEFS.find(s => s.rooms.includes(primaryRoom));
                          if (!matchedSkill) return null;
                          const skillId = matchedSkill.id;
                          const article = SKILL_ARTICLE_MAP[skillId];
                          const foundation = SKILL_FOUNDATION_MAP[skillId];
                          const trainerCat = SKILL_TRAINER_MAP[skillId];
                          const hasAny = (article && onOpenArticle) || foundation || trainerCat;
                          if (!hasAny) return null;
                          return (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.55rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', flexShrink: 0 }}>Session sequence</span>
                              {article && onOpenArticle && (
                                <button onClick={() => onOpenArticle(article.id)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}>
                                  1. Read: {article.label}
                                </button>
                              )}
                              {foundation && onNavigate && (
                                <button onClick={() => onNavigate(foundation.page)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--teal)', cursor: 'pointer' }}>
                                  2. Review: {foundation.label}
                                </button>
                              )}
                              {trainerCat && onNavigate && (
                                <button onClick={() => onNavigate('trainer')} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--purple)', cursor: 'pointer' }}>
                                  4. Drill: MCQ Trainer ({trainerCat})
                                </button>
                              )}
                            </div>
                          );
                        })()}
                        {/* Room chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.45rem' }}>
                          {(dayObj.rooms || []).map(roomId => {
                            const meta = ROOM_META[roomId];
                            if (!meta) return null;
                            return (
                              <button key={roomId} onClick={() => onNavigate && onNavigate(meta.page)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.7rem', fontSize: '0.78rem', fontWeight: 600, color: meta.color, cursor: 'pointer', transition: 'border-color 0.12s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = meta.color; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                                {meta.label} →
                              </button>
                            );
                          })}
                        </div>
                        {/* Suggested cases */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: dayObj.note ? '0.5rem' : 0 }}>
                          {(dayObj.rooms || []).flatMap(roomId => {
                            const meta = ROOM_META[roomId];
                            if (!meta) return [];
                            return getTopCases(roomId, allData, jdText, 2).map(c => (
                              <button key={roomId + '-' + c.id} onClick={() => onNavigate && onNavigate(meta.page, c.id)} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 5, padding: '0.2rem 0.55rem', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                                {'▸ ' + truncateTitle(c.title || '')}
                              </button>
                            ));
                          })}
                        </div>
                        {dayObj.note && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>{dayObj.note}</p>}
                        {/* Layer 6: verbal simulation prompt */}
                        {(() => {
                          const primaryRoom = (dayObj.rooms || [])[0];
                          const matchedSkill = SKILL_DEFS.find(s => s.rooms.includes(primaryRoom));
                          const prompt = matchedSkill ? SKILL_VERBAL_MAP[matchedSkill.id] : null;
                          if (!prompt) return null;
                          return (
                            <div style={{ marginTop: '0.65rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--purple)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', padding: '0.6rem 0.9rem' }}>
                              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--purple)', marginBottom: '0.3rem' }}>End-of-day verbal drill</div>
                              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.55 }}>{prompt}</p>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>
              );
            })()}

            {/* Plan progress + nudge */}
            {planSteps.length > 0 && (() => {
              const doneCount = planSteps.filter(s => isCaseDone(s.roomId, s.caseId)).length;
              const pct = doneCount / planSteps.length;
              const pctRound = Math.round(pct * 100);
              const showNudge = !unlocked && pct >= 0.35;
              // Progress ring geometry
              const R = 26, C = 2 * Math.PI * R;
              return (
                <div style={{ marginBottom: '1.25rem' }}>
                  {/* Progress ring + bar */}
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
                    {/* Ring */}
                    <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                      <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="32" cy="32" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="6" />
                        <circle cx="32" cy="32" r={R} fill="none" stroke="var(--purple)" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, color: pct >= 0.35 ? 'var(--purple)' : 'var(--text)' }}>
                        {pctRound}%
                      </div>
                    </div>
                    {/* Bar + counts */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Plan progress
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: pct >= 0.35 ? 'var(--purple)' : 'var(--text-muted)' }}>
                          {doneCount} / {planSteps.length} done
                        </span>
                      </div>
                      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pctRound}%`, background: 'var(--purple)', borderRadius: 99, transition: 'width 0.4s ease' }} />
                      </div>
                      {doneCount === 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                          Complete plan cases and this updates automatically.
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Soft nudge at 35% — only for locked users */}
                  {showNudge && (
                    <div style={{ marginTop: '0.65rem', background: 'var(--purple-bg)', border: '1.5px solid var(--purple-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--purple)', marginBottom: '0.25rem' }}>
                          You have real momentum — {Math.round(pct * 100)}% of your plan done
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          Unlock full access to keep going — all remaining cases, full behavioral bank, and company tracks.
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate && onNavigate('unlock')}
                        style={{ background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.1rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        Enter Access Code →
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Outside PAL */}
            {outside && outside.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--red)', marginBottom: '0.75rem' }}>
                  Outside PAL — honest gaps
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {outside.map(sig => (
                    <div key={sig.label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', marginTop: '0.45rem', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>{sig.label}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{sig.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => setStep('configure')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', padding: 0 }}>
                ← Reconfigure
              </button>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                As you complete rooms, your{' '}
                <button onClick={() => onNavigate && onNavigate('progress')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--purple)', fontWeight: 600, fontSize: '0.78rem', padding: 0 }}>
                  Progress page
                </button>
                {' '}will show which rooms still need attention.
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

// Alias export so both names resolve
export { DefenseDocGenerator as DefenseDoc };
