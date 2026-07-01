import { useState, useEffect } from 'react';
import { rcaFoundationModules } from '../../data/rcaFoundationModules.js';
import { saveRCAFoundationProgress, getRCAFoundationProgress, getAllRCAFoundationProgress } from '../../utils/rcaFoundationProgress.js';
import { track } from '../../utils/analytics.js';
import { FoundationRunnerShell } from '../shared/FoundationRunnerShell.jsx';

import { Module_RF01 } from './modules/Module01_RCAFramework.jsx';
import { Module_RF02 } from './modules/Module02_DecomposeFirst.jsx';
import { Module_RF03 } from './modules/Module03_DataQuality.jsx';
import { Module_RF04 } from './modules/Module04_SeasonalityExternal.jsx';
import { Module_RF05 } from './modules/Module05_AggregateDeceit.jsx';
import { Module_RF06 } from './modules/Module06_DiagnosisToRec.jsx';
import { Module_RF07 } from './modules/Module07_MetricTree.jsx';
import { Module_RF08 } from './modules/Module08_SQLDiagnosis.jsx';
import { Module_RF09 } from './modules/Module09_SeasonalityTrend.jsx';
import { Module_RF10 } from './modules/Module10_InstrumentationFailure.jsx';
import { Module_RF11 } from './modules/Module11_ExternalFactors.jsx';
import { Module_RF12 } from './modules/Module12_MultiLevelRCA.jsx';
import { Module_RF13 } from './modules/Module13_RoutingGate.jsx';
import { Module_RF14 } from './modules/Module14_DominantLever.jsx';
import { Module_RF15 } from './modules/Module15_HypothesisRanking.jsx';

// ── Module registry ──────────────────────────────────────────────────────────
const MODULE_COMPONENTS = {
  rf01: Module_RF01,
  rf02: Module_RF02,
  rf03: Module_RF03,
  rf04: Module_RF04,
  rf05: Module_RF05,
  rf06: Module_RF06,
  rf07: Module_RF07,
  rf08: Module_RF08,
  rf09: Module_RF09,
  rf10: Module_RF10,
  rf11: Module_RF11,
  rf12: Module_RF12,
  rf13: Module_RF13,
  rf14: Module_RF14,
  rf15: Module_RF15,
};

// ── Runner shell ─────────────────────────────────────────────────────────────
export function RCAFoundationsRunner({ moduleId, onBack, onNext, unlocked, onSelectModule }) {
  var module = rcaFoundationModules.find(function(m) { return m.id === moduleId; });
  var [completed, setCompleted] = useState(function() { return !!getRCAFoundationProgress(moduleId); });
  var allProgress = getAllRCAFoundationProgress();

  useEffect(function() {
    setCompleted(!!getRCAFoundationProgress(moduleId));
  }, [moduleId]);

  if (!module) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Module not found.</div>
  );

  var ModuleComponent = MODULE_COMPONENTS[moduleId];

  function handleNext() {
    saveRCAFoundationProgress(moduleId);
    setCompleted(true);
    track('case_completed', { room: 'rca-foundations', id: moduleId, title: module.title });
    if (onNext) onNext();
    else onBack();
  }

  return (
    <FoundationRunnerShell
      module={module}
      totalModules={rcaFoundationModules.length}
      completed={completed}
      color='var(--teal)'
      roomLabel='RCA Foundations'
      onBack={onBack}
      playbookLinks={module.playbookLinks}
      modules={rcaFoundationModules}
      currentModuleId={moduleId}
      onSelectModule={onSelectModule}
      progress={allProgress}
    >
      {ModuleComponent ? (
        <ModuleComponent onComplete={handleNext} />
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Module content coming soon.</div>
      )}
    </FoundationRunnerShell>
  );
}
