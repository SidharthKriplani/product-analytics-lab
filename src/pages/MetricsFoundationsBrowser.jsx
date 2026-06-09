// Metrics Foundations Browser — thin wrapper around FoundationBrowser
import { FoundationBrowser } from '../components/shared/FoundationBrowser.jsx';
import { metricsFoundationModules } from '../data/metricsFoundationModules.js';
import { getAllMetricsFoundationProgress } from '../utils/metricsFoundationProgress.js';

export function MetricsFoundationsBrowser({ onStart, unlocked, onNavigate }) {
  var progress = getAllMetricsFoundationProgress();

  return (
    <FoundationBrowser
      modules={metricsFoundationModules}
      progress={progress}
      color='var(--green)'
      roomLabel='Metrics Foundations'
      iconName='bar-chart'
      onStart={onStart}
      unlocked={unlocked}
      description='Learn to define metrics that actually measure what you care about. Covers north star metrics, guardrail and diagnostic decomposition, and the traps that make metrics misleading — so you can design measurement before you run the experiment.'
      practiceLinks={[
        { label: 'Metrics Room', onClick: function () { onNavigate('metrics'); } },
        { label: 'Growth Analytics', onClick: function () { onNavigate('growth-analytics'); } },
      ]}
    />
  );
}
