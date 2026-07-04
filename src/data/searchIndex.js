// src/data/searchIndex.js
// DYNAMIC global-search index for PAL.
// Built at import time by flattening PAL's content registries. Adding new
// content to any registry (a new case, module, SQL problem, deep-dive post,
// etc.) makes it searchable automatically — nothing here is hand-curated.
//
// Each entry: { id, label, sub, kind, route }
//   label  — the title shown as the primary line
//   sub    — a short descriptor (room / difficulty / category)
//   kind   — a category tag ("Module", "SQL", "Case", "Deep Dive", ...)
//   route  — how App.jsx opens it:
//              { openFn: '<name>', id: '<id>' }  → openFnsRef.current[openFn](id)
//                (item-level openers already handle auth / paywall / tracking)
//              { navigate: '<page>' }             → navigate(page)
//
// Single quotes, no template literals — matches caseIndex.js style.

import {
  scenarioIndex, designScenarioIndex, statsModuleIndex, metricCaseIndex,
  rcaCaseIndex, businessCaseIndex, productDesignIndex, fullLoopIndex,
  prioritizationIndex, behavioralIndex, estimationIndex, challengesIndex,
  biCaseIndex, stfCaseIndex, takehomeCaseIndex, instrumentationIndex,
  growthAnalyticsIndex, statsFoundationsIndex, metricsFoundationIndex,
  rcaFoundationIndex, expFoundationIndex,
} from './caseIndex.js';

// Registries with richer shapes (title/prompt/category live on the object).
import { sqlLabProblems } from './sqlLabProblems.js';
import { interviewQA } from './interviewQA.js';
import { companyTracks } from './companyTracks.js';

// Content-reading surfaces — POSTS / FAILURES now exported from their pages.
import { POSTS as blogPosts } from '../pages/BlogBrowser.jsx';
import { FAILURES as failures } from '../pages/FailuresCatalog.jsx';

// ── Registry → { kind, openFn, sub } wiring ──────────────────────────────
// One row per caseIndex array. `sub` is the short descriptor shown under the
// title (mirrors the room the item lives in). `openFn` is the name registered
// in App.jsx's openFnsRef — item-level openers that already gate auth/paywall.
const CASE_GROUPS = [
  { arr: statsFoundationsIndex,  kind: 'Module',      openFn: 'openStatFoundationsModule',   sub: 'Stat Foundations' },
  { arr: metricsFoundationIndex, kind: 'Module',      openFn: 'openMetricsFoundationModule', sub: 'Metrics Foundations' },
  { arr: rcaFoundationIndex,     kind: 'Module',      openFn: 'openRCAFoundationModule',     sub: 'RCA Foundations' },
  { arr: expFoundationIndex,     kind: 'Module',      openFn: 'openExpFoundationModule',     sub: 'A/B Foundations' },
  { arr: statsModuleIndex,       kind: 'Stats',       openFn: 'openStatsModule',             sub: 'Stats' },
  { arr: designScenarioIndex,    kind: 'A/B Design',  openFn: 'openDesignScenario',          sub: 'A/B Design' },
  { arr: scenarioIndex,          kind: 'A/B Judgment', openFn: 'openScenario',               sub: 'A/B Judgment' },
  { arr: stfCaseIndex,           kind: 'Spot the Flaw', openFn: 'openSTFCase',               sub: 'Spot the Flaw' },
  { arr: metricCaseIndex,        kind: 'Metrics',     openFn: 'openMetricsCase',             sub: 'Metrics' },
  { arr: rcaCaseIndex,           kind: 'RCA',         openFn: 'openRCACase',                 sub: 'RCA' },
  { arr: businessCaseIndex,      kind: 'Case',        openFn: 'openBusinessCase',            sub: 'Analytics Cases' },
  { arr: instrumentationIndex,   kind: 'Instrumentation', openFn: 'openInstrumentationCase', sub: 'Instrumentation' },
  { arr: productDesignIndex,     kind: 'Product Design', openFn: 'openPDScenario',           sub: 'Product Design' },
  { arr: prioritizationIndex,    kind: 'Prioritization', openFn: 'openPrioritizationScenario', sub: 'Prioritization' },
  { arr: estimationIndex,        kind: 'Estimation',  openFn: 'openEstimationProblem',       sub: 'Estimation' },
  { arr: fullLoopIndex,          kind: 'Full Loop',   openFn: 'openFullLoopCase',            sub: 'Full Loop' },
  { arr: growthAnalyticsIndex,   kind: 'Growth',      openFn: 'openGrowthAnalyticsCase',     sub: 'Growth Analytics' },
  { arr: challengesIndex,        kind: 'Challenge',   openFn: 'openChallenge',               sub: 'Challenges' },
  { arr: biCaseIndex,            kind: 'BI',          openFn: 'openBICase',                  sub: 'BI' },
  { arr: takehomeCaseIndex,      kind: 'Take-Home',   openFn: 'openTakehomeCase',            sub: 'Take-Home' },
  { arr: behavioralIndex,        kind: 'Behavioral',  openFn: 'openBehavioralQuestion',      sub: 'Behavioral' },
];

function safePush(out, entry) {
  if (entry && entry.id && entry.label) out.push(entry);
}

/**
 * Build the flat search index. Guarded end-to-end so a malformed registry
 * can never break the whole search surface — bad rows are simply skipped.
 */
export function buildSearchIndex() {
  const out = [];

  // 1) Practice registries (slim id/title index arrays).
  for (const group of CASE_GROUPS) {
    if (!Array.isArray(group.arr)) continue;
    for (const c of group.arr) {
      if (!c || !c.id || !c.title) continue;
      safePush(out, {
        id: group.openFn + ':' + c.id,
        label: c.title,
        sub: group.sub,
        kind: group.kind,
        route: { openFn: group.openFn, id: c.id },
      });
    }
  }

  // 2) SQL Lab problems — { id, title, company, difficulty }.
  if (Array.isArray(sqlLabProblems)) {
    for (const p of sqlLabProblems) {
      if (!p || !p.id || !p.title) continue;
      const bits = [p.company, p.difficulty].filter(Boolean).join(' · ');
      safePush(out, {
        id: 'sql:' + p.id,
        label: p.title,
        sub: bits ? 'SQL Lab — ' + bits : 'SQL Lab',
        kind: 'SQL',
        route: { openFn: 'openSqlProblem', id: p.id },
      });
    }
  }

  // 3) Interview Q&A — { id, question, category, difficulty }.
  if (Array.isArray(interviewQA)) {
    for (const q of interviewQA) {
      if (!q || !q.id || !q.question) continue;
      safePush(out, {
        id: 'qa:' + q.id,
        label: q.question,
        sub: (q.category || 'Interview') + (q.difficulty ? ' · ' + q.difficulty : ''),
        kind: 'Interview Q',
        route: { openFn: 'openInterviewQA', id: q.id },
      });
    }
  }

  // 4) Deep-Dive posts — { id, title, category, room }.
  if (Array.isArray(blogPosts)) {
    for (const post of blogPosts) {
      if (!post || !post.id || !post.title) continue;
      safePush(out, {
        id: 'blog:' + post.id,
        label: post.title,
        sub: post.category ? 'Deep Dive · ' + post.category : 'Deep Dive',
        kind: 'Deep Dive',
        route: { openFn: 'openBlogPost', id: post.id },
      });
    }
  }

  // 5) Failure catalog — { id, name, category }.
  if (Array.isArray(failures)) {
    for (const f of failures) {
      if (!f || !f.id || !f.name) continue;
      safePush(out, {
        id: 'fail:' + f.id,
        label: f.name,
        sub: f.category ? 'Failure · ' + f.category : 'Failure',
        kind: 'Failure',
        route: { openFn: 'openFailure', id: f.id },
      });
    }
  }

  // 6) Company tracks — { id, company, role }.
  if (Array.isArray(companyTracks)) {
    for (const t of companyTracks) {
      if (!t || !t.id) continue;
      const label = [t.company, t.role].filter(Boolean).join(' — ') || t.id;
      safePush(out, {
        id: 'track:' + t.id,
        label: label,
        sub: 'Company Track',
        kind: 'Company Track',
        route: { openFn: 'openCompanyTrack', id: t.id },
      });
    }
  }

  return out;
}

// Precomputed once at module load. New content in the registries is picked up
// automatically because this maps over the live arrays at import time.
export const SEARCH_INDEX = buildSearchIndex();
