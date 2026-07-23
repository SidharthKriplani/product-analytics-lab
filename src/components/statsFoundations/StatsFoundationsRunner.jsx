import React, { useState, useEffect } from 'react';
import { Icon } from '../shared/Icon.jsx';
import { FoundationRunnerShell } from '../shared/FoundationRunnerShell.jsx';
import { statsFoundationsModules } from '../../data/statsFoundationsModules.js';

class ModuleErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error) {
    // 2026-07-23 auto-heal (GSL pattern): highlight-mark DOM corruption family
    // auto-retries once — see components/shared/ErrorBoundary.jsx for rationale.
    const msg = String(error && error.message || '');
    if (/insertBefore|removeChild|not a child of this node|NotFoundError/i.test(msg) && (this._heals || 0) < 2) {
      this._heals = (this._heals || 0) + 1;
      try {
        document.querySelectorAll('mark[data-hl-id]').forEach(m => {
          const parent = m.parentNode; if (!parent) return;
          while (m.firstChild) parent.insertBefore(m.firstChild, m);
          parent.removeChild(m);
          parent.normalize();
        });
      } catch { /* best-effort */ }
      try { window.dispatchEvent(new PopStateEvent('popstate')); } catch { /* non-browser */ }
      setTimeout(() => this.setState({ hasError: false, error: null }), 0);
      setTimeout(() => { this._heals = 0; }, 15000);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}><Icon name='alert-triangle' size={32} color='currentColor' /></div>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Module failed to load</div>
          <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>{String(this.state.error)}</div>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: '8px 20px', background: 'var(--yellow)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { saveStatFoundationsProgress, getStatFoundationsProgress, getAllStatFoundationsProgress } from '../../utils/statsFoundationsProgress.js';
import { Module01_WhatIsData } from './modules/Module01_WhatIsData.jsx';
import { Module02_CentralTendency } from './modules/Module02_CentralTendency.jsx';
import { Module03_Spread } from './modules/Module03_Spread.jsx';
import { Module04_NormalDist } from './modules/Module04_NormalDist.jsx';
import { Module05_ZScores } from './modules/Module05_ZScores.jsx';
import { Module06_Areas } from './modules/Module06_Areas.jsx';
import { Module07_Sampling } from './modules/Module07_Sampling.jsx';
import { Module08_StandardError } from './modules/Module08_StandardError.jsx';
import { Module09_CLT } from './modules/Module09_CLT.jsx';
import { Module10_CI } from './modules/Module10_CI.jsx';
import { Module11_HypothesisTesting } from './modules/Module11_HypothesisTesting.jsx';
import { Module12_Power } from './modules/Module12_Power.jsx';
import { Module13_ExperimentDesigner } from './modules/Module13_ExperimentDesigner.jsx';
import { Module14_Correlation } from './modules/Module14_Correlation.jsx';
import { Module15_SimpsonsParadox } from './modules/Module15_SimpsonsParadox.jsx';
import { Module16_Skewness } from './modules/Module16_Skewness.jsx';
import { Module17_MultipleTesting } from './modules/Module17_MultipleTesting.jsx';
import { Module18_RegressionToMean } from './modules/Module18_RegressionToMean.jsx';
import { Module19_SelectionBias } from './modules/Module19_SelectionBias.jsx';
import { Module20_PracticalSignificance } from './modules/Module20_PracticalSignificance.jsx';
import { Module21_Counterfactuals } from './modules/Module21_Counterfactuals.jsx';
import { Module22_DiD } from './modules/Module22_DiD.jsx';
import { Module23_RD } from './modules/Module23_RD.jsx';
import { Module24_SyntheticControl } from './modules/Module24_SyntheticControl.jsx';
import { Module25_IV } from './modules/Module25_IV.jsx';
import { Module26_BayesianThinking } from './modules/Module26_BayesianThinking.jsx';
import { Module27_EffectSize } from './modules/Module27_EffectSize.jsx';
import { Module28_Bootstrap } from './modules/Module28_Bootstrap.jsx';
import { Module29_ChiSquare } from './modules/Module29_ChiSquare.jsx';
import { Module30_SUTVA } from './modules/Module30_SUTVA.jsx';
import { Module31_ANOVA } from './modules/Module31_ANOVA.jsx';
import { Module32_NonParametric } from './modules/Module32_NonParametric.jsx';
import { track } from '../../utils/analytics.js';

const MODULE_COMPONENTS = {
  sf01: Module01_WhatIsData,
  sf02: Module02_CentralTendency,
  sf03: Module03_Spread,
  sf04: Module04_NormalDist,
  sf05: Module05_ZScores,
  sf06: Module06_Areas,
  sf07: Module07_Sampling,
  sf08: Module08_StandardError,
  sf09: Module09_CLT,
  sf10: Module10_CI,
  sf11: Module11_HypothesisTesting,
  sf12: Module12_Power,
  sf13: Module13_ExperimentDesigner,
  sf14: Module14_Correlation,
  sf15: Module15_SimpsonsParadox,
  sf16: Module16_Skewness,
  sf17: Module17_MultipleTesting,
  sf18: Module18_RegressionToMean,
  sf19: Module19_SelectionBias,
  sf20: Module20_PracticalSignificance,
  sf21: Module21_Counterfactuals,
  sf22: Module22_DiD,
  sf23: Module23_RD,
  sf24: Module24_SyntheticControl,
  sf25: Module25_IV,
  sf26: Module26_BayesianThinking,
  sf27: Module27_EffectSize,
  sf28: Module28_Bootstrap,
  sf29: Module29_ChiSquare,
  sf30: Module30_SUTVA,
  sf31: Module31_ANOVA,
  sf32: Module32_NonParametric,
};

export function StatsFoundationsRunner({ moduleId, onBack, onNext, unlocked, onNavigate, onSelectModule }) {
  const module = statsFoundationsModules.find(m => m.id === moduleId);
  const ModuleComponent = MODULE_COMPONENTS[moduleId];

  const completedMap = getAllStatFoundationsProgress();
  const completed = !!completedMap[moduleId];

  if (!module || !ModuleComponent) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', width: '100%', boxSizing: 'border-box', color: 'var(--text-muted)' }}>
        Module not found.
      </div>
    );
  }

  function handleNext() {
    saveStatFoundationsProgress(moduleId);
    track('case_completed', { room: 'stat-foundations', id: moduleId, rating: null });
    onNext();
  }

  return (
    <FoundationRunnerShell
      module={module}
      totalModules={statsFoundationsModules.length}
      completed={completed}
      color='var(--yellow)'
      roomLabel='Stat Foundations'
      itemType='sf_module'
      onBack={onBack}
      playbookLinks={module.playbookLinks}
      modules={statsFoundationsModules}
      currentModuleId={moduleId}
      onSelectModule={onSelectModule}
      progress={completedMap}
    >
      <ModuleErrorBoundary>
        {ModuleComponent ? (
          <ModuleComponent module={module} onNext={handleNext} />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Module content coming soon.</div>
        )}
      </ModuleErrorBoundary>
    </FoundationRunnerShell>
  );
}
