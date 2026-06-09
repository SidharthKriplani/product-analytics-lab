// RCA Foundations Browser — thin wrapper around FoundationBrowser
import { FoundationBrowser } from '../components/shared/FoundationBrowser.jsx';
import { rcaFoundationModules } from '../data/rcaFoundationModules.js';
import { getAllRCAFoundationProgress } from '../utils/rcaFoundationProgress.js';

export function RCAFoundationsBrowser({ onStart, unlocked, onNavigate }) {
  var progress = getAllRCAFoundationProgress();

  return (
    <FoundationBrowser
      modules={rcaFoundationModules}
      progress={progress}
      color='var(--teal)'
      roomLabel='RCA Foundations'
      iconName='search'
      onStart={onStart}
      unlocked={unlocked}
      practiceLinks={[
        { label: 'RCA Room', onClick: function () { onNavigate('rca'); } },
        { label: 'Cases Room', onClick: function () { onNavigate('cases'); } },
      ]}
    />
  );
}
