// A/B Foundations Browser — thin wrapper around FoundationBrowser
import { FoundationBrowser } from '../components/shared/FoundationBrowser.jsx';
import { expFoundationModules } from '../data/expFoundationModules.js';
import { getAllExpFoundationProgress } from '../utils/expFoundationProgress.js';

export function ExpFoundationsBrowser({ onStart, unlocked, onNavigate }) {
  var raw = getAllExpFoundationProgress();
  // ExpFoundation progress entries store { completedAt }, filter for valid ones
  var progress = {};
  Object.keys(raw).forEach(function (k) { if (raw[k] && raw[k].completedAt) progress[k] = raw[k]; });

  return (
    <FoundationBrowser
      modules={expFoundationModules}
      progress={progress}
      color='var(--accent)'
      roomLabel='A/B Foundations'
      iconName='flask'
      onStart={onStart}
      unlocked={unlocked}
      description='Understand how controlled experiments work — from randomization and power to SRM, novelty effects, and network interference. Build the judgment to design clean tests and read results without being misled by the data.'
      practiceLinks={[
        { label: 'A/B Design', onClick: function () { onNavigate('design'); } },
        { label: 'Review Room', onClick: function () { onNavigate('browser'); } },
        { label: 'Spot the Flaw', onClick: function () { onNavigate('spot-the-flaw'); } },
      ]}
    />
  );
}
