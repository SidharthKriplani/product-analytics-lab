import { useState, useEffect } from 'react';
import { metricsFoundationModules } from '../../data/metricsFoundationModules.js';
import { saveMetricsFoundationProgress, getMetricsFoundationProgress, getAllMetricsFoundationProgress } from '../../utils/metricsFoundationProgress.js';
import { track } from '../../utils/analytics.js';
import { FoundationRunnerShell } from '../shared/FoundationRunnerShell.jsx';

import { Module_MF01 } from './modules/Module01_MetricsHierarchy.jsx';
import { Module_MF02 } from './modules/Module02_WhatMakesAGoodMetric.jsx';
import { Module_MF03 } from './modules/Module03_RatioMetrics.jsx';
import { Module_MF04 } from './modules/Module04_MetricDecomposition.jsx';
import { Module_MF05 } from './modules/Module05_CounterMetrics.jsx';
import { Module_MF06 } from './modules/Module06_LeadingLaggingIndicators.jsx';
import { Module_MF07 } from './modules/Module07_NorthStar.jsx';
import { Module_MF08 } from './modules/Module08_MetricSensitivity.jsx';
import { Module_MF09 } from './modules/Module09_FunnelMetrics.jsx';
import { Module_MF10 } from './modules/Module10_FlatRateLie.jsx';
import { Module_MF11 } from './modules/Module11_CompositeMetrics.jsx';
import { Module_MF12 } from './modules/Module12_GuardrailMetrics.jsx';
import { Module_MF13 } from './modules/Module13_NullResult.jsx';
import { Module_MF14 } from './modules/Module14_CohortMetrics.jsx';
import { Module_MF15 } from './modules/Module15_EngagementDepth.jsx';
import { Module_MF16 } from './modules/Module16_UnitEconomics.jsx';
import { Module_MF17 } from './modules/Module17_GrowthAccounting.jsx';

// ── Module registry ──────────────────────────────────────────────────────────
const MODULE_COMPONENTS = {
  mf01: Module_MF01,
  mf02: Module_MF02,
  mf03: Module_MF03,
  mf04: Module_MF04,
  mf05: Module_MF05,
  mf06: Module_MF06,
  mf07: Module_MF07,
  mf08: Module_MF08,
  mf09: Module_MF09,
  mf10: Module_MF10,
  mf11: Module_MF11,
  mf12: Module_MF12,
  mf13: Module_MF13,
  mf14: Module_MF14,
  mf15: Module_MF15,
  mf16: Module_MF16,
  mf17: Module_MF17,
};

// ── Runner shell ─────────────────────────────────────────────────────────────
export function MetricsFoundationsRunner({ moduleId, onBack, onNext, unlocked, onSelectModule }) {
  var module = metricsFoundationModules.find(function(m) { return m.id === moduleId; });
  var [completed, setCompleted] = useState(function() { return !!getMetricsFoundationProgress(moduleId); });
  var allProgress = getAllMetricsFoundationProgress();

  useEffect(function() {
    setCompleted(!!getMetricsFoundationProgress(moduleId));
  }, [moduleId]);

  if (!module) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Module not found.</div>
  );

  var ModuleComponent = MODULE_COMPONENTS[moduleId];

  function handleNext() {
    saveMetricsFoundationProgress(moduleId);
    setCompleted(true);
    track('case_completed', { room: 'metrics-foundations', id: moduleId, title: module.title });
    if (onNext) onNext();
    else onBack();
  }

  return (
    <FoundationRunnerShell
      module={module}
      totalModules={metricsFoundationModules.length}
      completed={completed}
      color='var(--green)'
      roomLabel='Metrics Foundations'
      onBack={onBack}
      playbookLinks={module.playbookLinks}
      modules={metricsFoundationModules}
      currentModuleId={moduleId}
      onSelectModule={onSelectModule}
      progress={allProgress}
    >
      {ModuleComponent ? (
        <ModuleComponent module={module} onNext={handleNext} />
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Module content coming soon.</div>
      )}
    </FoundationRunnerShell>
  );
}
