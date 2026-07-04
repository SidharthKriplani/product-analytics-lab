import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { spotTheFlawCases } from '../data/spotTheFlawCases.js';
import { getAllSTFProgress } from '../utils/spotTheFlawProgress.js';
import { RoomHeader } from '../components/shared/RoomHeader.jsx';
import { FilterBar } from '../components/shared/FilterBar.jsx';
import { CaseCard } from '../components/shared/CaseCard.jsx';
import { AddTrackBtn } from '../components/tracks/AddToTrackPopover.jsx';

const FLAW_TYPE_LABEL = {
  'srm':               'SRM',
  'peeking':           'Peeking',
  'simpsons-paradox':  'Simpson\'s Paradox',
  'novelty-effect':    'Novelty Effect',
  'multiple-testing':  'Multiple Testing',
  'bad-metric':        'Bad Metric',
  'selection-bias':    'Selection Bias',
  'sutva':             'SUTVA',
  'confounding':       'Confounding',
  'network-effects':   'Network Effects',
  'p-hacking':         'P-Hacking',
  'ratio-of-averages': 'Ratio of Averages',
  'regression-to-mean':'Regression to Mean',
  'survivorship-bias': 'Survivorship Bias',
  'python':            'Python',
};

const DIFF_ORDER = { analyst: 0, senior: 1, staff: 2 };

// Derive flaw types + difficulties from actual data.
const ALL_FLAW_TYPES = (() => {
  const set = new Set();
  spotTheFlawCases.forEach(c => { if (c.flawType) set.add(c.flawType); });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
})();

const ALL_DIFFICULTIES = (() => {
  const set = new Set();
  spotTheFlawCases.forEach(c => { if (c.difficulty) set.add(c.difficulty); });
  return Array.from(set).sort((a, b) => (DIFF_ORDER[a] ?? 9) - (DIFF_ORDER[b] ?? 9) || a.localeCompare(b));
})();

export function SpotTheFlawBrowser({ onSelectCase, unlocked, onNavigate }) {
  const allProgress = getAllSTFProgress();
  const [activeFlawType, setActiveFlawType] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');

  const completedIds = new Set(Object.keys(allProgress));
  const completedCount = completedIds.size;

  const filteredCases = spotTheFlawCases.filter(c => {
    const flawMatch = activeFlawType === 'All' || c.flawType === activeFlawType;
    const diffMatch = activeDifficulty === 'All' || c.difficulty === activeDifficulty;
    const isDone = completedIds.has(c.id);
    const statusMatch =
      activeStatus === 'All' ||
      (activeStatus === 'solved' && isDone) ||
      (activeStatus === 'unsolved' && !isDone);
    return flawMatch && diffMatch && statusMatch;
  }).sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 9) - (DIFF_ORDER[b.difficulty] ?? 9));

  const firstUnstartedId = spotTheFlawCases.find(c => !completedIds.has(c.id))?.id;

  const filters = [
    {
      id: 'difficulty',
      label: 'Difficulty',
      value: activeDifficulty,
      onChange: setActiveDifficulty,
      options: [
        { value: 'All', label: 'All' },
        ...ALL_DIFFICULTIES.map(d => ({
          value: d,
          label: d.charAt(0).toUpperCase() + d.slice(1),
          count: spotTheFlawCases.filter(c => c.difficulty === d).length,
        })),
      ],
    },
    {
      id: 'flawType',
      label: 'Flaw Type',
      value: activeFlawType,
      onChange: setActiveFlawType,
      options: [
        { value: 'All', label: 'All' },
        ...ALL_FLAW_TYPES.map(f => ({
          value: f,
          label: FLAW_TYPE_LABEL[f] || f,
          count: spotTheFlawCases.filter(c => c.flawType === f).length,
        })),
      ],
    },
    {
      id: 'status',
      label: 'Status',
      value: activeStatus,
      onChange: setActiveStatus,
      options: [
        { value: 'All', label: 'All' },
        { value: 'unsolved', label: 'Unsolved', count: spotTheFlawCases.length - completedCount },
        { value: 'solved', label: 'Solved', count: completedCount },
      ],
    },
  ];

  const clearAll = () => {
    setActiveFlawType('All');
    setActiveDifficulty('All');
    setActiveStatus('All');
  };

  return (
    <div className='pal-page-enter' style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <RoomHeader
        icon='bug'
        accent='red'
        eyebrow='Spot the Flaw Room'
        title='Spot the Flaw'
        blurb={'In a real role, you\'ll regularly see analyses that look right but aren\'t — an experiment with a hidden SRM, a metric moving for the wrong reason, a chart that proves the wrong thing. Interviewers test this directly: they hand you a flawed analysis and ask what\'s broken. Most candidates miss it entirely. This room trains the habit of looking for what\'s wrong before accepting what\'s shown.'}
        solved={completedCount}
        total={spotTheFlawCases.length}
      />

      {/* Theory hint */}
      {onNavigate && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.7rem 1rem',
          background: 'var(--teal-bg)',
          borderLeft: '3px solid var(--teal)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.25rem',
        }}>
          <Icon name='book-open' size={14} color='var(--teal)' style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', marginBottom: '0.15rem' }}>Recommended starting point</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <button onClick={() => onNavigate('stat-foundations')} style={{
                background: 'none', border: 'none', padding: 0,
                color: 'var(--teal)', fontWeight: 700, cursor: 'pointer',
                fontSize: '0.78rem',
              }}>Stat Foundations</button>
              {' '}builds the mental models these cases assume.
            </div>
          </div>
        </div>
      )}

      <FilterBar filters={filters} />

      {/* Case cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredCases.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No cases match those filters.{' '}
            <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}>
              Clear filters
            </button>
          </div>
        )}

        {filteredCases.map(c => {
          const prog = allProgress[c.id];
          const isLocked = !c.isFree && !unlocked;
          const isDone = completedIds.has(c.id);
          const isNextUnstarted = c.id === firstUnstartedId;

          // Lead with flaw label + company, then up to 3 problem tags.
          const tags = [
            c.flawLabel || FLAW_TYPE_LABEL[c.flawType] || c.flawType,
            c.company,
            ...(c.tags || []).slice(0, 3),
          ].filter(Boolean);

          let meta;
          if (prog) {
            meta = prog.rating === 'caught it' ? 'Caught it'
              : prog.rating === 'partial' ? 'Partial'
              : prog.rating === 'missed it' ? 'Missed it'
              : undefined;
          }

          const nextBadge = isNextUnstarted ? (
            <span style={{
              fontSize: '0.66rem', fontWeight: 700,
              color: 'var(--red)', background: 'var(--red-bg)',
              border: '1px solid var(--red-border)',
              borderRadius: 4, padding: '0.08rem 0.4rem',
            }}>
              Next
            </span>
          ) : null;

          return (
            <CaseCard
              key={c.id}
              id={c.id}
              title={c.title}
              tags={tags}
              difficulty={c.difficulty}
              accent='red'
              status={isDone ? 'solved' : undefined}
              locked={isLocked}
              meta={meta}
              badge={nextBadge}
              onClick={() => onSelectCase(c.id)}
              addBtn={<AddTrackBtn itemType='flaw' itemId={String(c.id)} label={c.title} itemMeta={{ difficulty: c.difficulty }} />}
            />
          );
        })}
      </div>
    </div>
  );
}
