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
      practiceLinks={[
        { label: 'Stats Room', onClick: function () { onNavigate('stats'); } },
        { label: 'Spot the Flaw', onClick: function () { onNavigate('spot-the-flaw'); } },
      ]}
    />
  );
}
