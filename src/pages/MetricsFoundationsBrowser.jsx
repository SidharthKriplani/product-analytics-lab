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
      practiceLinks={[
        { label: 'Metrics Room', onClick: function () { onNavigate('metrics'); } },
        { label: 'Growth Analytics', onClick: function () { onNavigate('growth-analytics'); } },
      ]}
    />
  );
}
