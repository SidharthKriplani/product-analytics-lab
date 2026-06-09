// Stats Foundations Browser — thin wrapper around FoundationBrowser
import { FoundationBrowser } from '../components/shared/FoundationBrowser.jsx';
import { statsFoundationsModules } from '../data/statsFoundationsModules.js';
import { getAllStatFoundationsProgress } from '../utils/statsFoundationsProgress.js';

export function StatsFoundationsBrowser({ onStart, unlocked, onNavigate }) {
  var progress = getAllStatFoundationsProgress();

  return (
    <FoundationBrowser
      modules={statsFoundationsModules}
      progress={progress}
      color='var(--yellow)'
      roomLabel='Stat Foundations'
      iconName='bar-chart'
      onStart={onStart}
      unlocked={unlocked}
      description='Build the statistical intuition behind every experiment and metric decision. Covers distributions, hypothesis testing, confidence intervals, power, and causal inference — the math that explains why A/B tests work and when they fail.'
      practiceLinks={[
        { label: 'Stats Room', onClick: function () { onNavigate('stats'); } },
        { label: 'Spot the Flaw', onClick: function () { onNavigate('spot-the-flaw'); } },
      ]}
    />
  );
}
