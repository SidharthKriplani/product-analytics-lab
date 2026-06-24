import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { SegmentedTabs } from '../components/shared/SegmentedTabs.jsx';
import { challengesCases } from '../data/challengesCases.js';
import { fullLoopCases } from '../data/fullLoopCases.js';
import { getAllChallengesProgress } from '../utils/challengesProgress.js';
import { getAllFullLoopProgress } from '../utils/fullLoopProgress.js';
import { RoomHeader } from '../components/shared/RoomHeader.jsx';
import { FilterBar } from '../components/shared/FilterBar.jsx';
import { CaseCard } from '../components/shared/CaseCard.jsx';

const RATING_LABEL = { strong: 'Nailed it', partial: 'Close', miss: 'Revisit' };

const ROOM_LABEL = {
  'stats':            'Statistics',
  'rca':              'RCA',
  'metrics':          'Metrics',
  'growth-analytics': 'Growth',
  'product-design':   'Product Design',
  'estimation':       'Estimation',
  'code':             'SQL / Code',
};

// Sort: senior first, then staff
const sortedCases = [...challengesCases].sort((a, b) => {
  const order = { senior: 0, staff: 1 };
  return (order[a.difficulty] ?? 9) - (order[b.difficulty] ?? 9);
});

// Full Loop — end-to-end cases, sorted analyst -> senior -> staff
const sortedFullLoop = [...fullLoopCases].sort((a, b) => {
  const order = { analyst: 0, senior: 1, staff: 2 };
  return (order[a.difficulty] ?? 9) - (order[b.difficulty] ?? 9);
});

export function ChallengesBrowser({ onSelectChallenge, onSelectFullLoop, unlocked }) {
  const allProgress = getAllChallengesProgress();
  const flProgress = getAllFullLoopProgress();
  const completedCount = Object.keys(allProgress).length;
  const [filterDiff, setFilterDiff] = useState('all');
  const [section, setSection] = useState('challenges');

  const seniorCount = sortedCases.filter(c => c.difficulty === 'senior').length;
  const staffCount = sortedCases.filter(c => c.difficulty === 'staff').length;

  const filteredCases = filterDiff === 'all'
    ? sortedCases
    : sortedCases.filter(c => c.difficulty === filterDiff);

  const completedIds = new Set(Object.keys(allProgress));
  const firstUnstartedId = sortedCases.find(c => !completedIds.has(c.id))?.id;

  const challengeFilters = [
    {
      id: 'difficulty',
      label: 'Difficulty',
      value: filterDiff,
      onChange: setFilterDiff,
      options: [
        { value: 'all', label: 'All', count: seniorCount + staffCount },
        { value: 'senior', label: 'Senior', count: seniorCount },
        { value: 'staff', label: 'Staff', count: staffCount },
      ],
    },
  ];

  return (
    <div className="pal-page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      <RoomHeader
        icon='zap'
        accent='yellow'
        eyebrow='Cross-Room'
        title='Challenges'
        blurb={'The hardest interview questions are not harder versions of a single-room question — they are moments where two problems are happening at once and you have to hold both. An SRM during a live experiment that is also showing a metric drop. A product decision that requires sizing, metric design, and an RCA on why the current metric is misleading. Staff+ loops are built around exactly these scenarios. The Full Loop tab carries one investigation from alert to answer.'}
        solved={completedCount}
        total={sortedCases.length}
      />

      {/* Section tabs */}
      <SegmentedTabs
        accent='yellow'
        value={section}
        onChange={setSection}
        tabs={[
          { id: 'challenges', label: 'Challenges', count: sortedCases.length },
          { id: 'fullloop', label: 'Full Loop', count: sortedFullLoop.length },
        ]}
      />

      {section === 'challenges' && (
        <>
        {/* Filters */}
        <FilterBar filters={challengeFilters} />

        {/* Challenge cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredCases.map(c => {
            const prog = allProgress[c.id];
            const isLocked = !c.isFree && !unlocked;
            const isDone = !!prog;
            const isNextUnstarted = c.id === firstUnstartedId;

            const tags = [
              c.company,
              ...(c.rooms || []).map(r => ROOM_LABEL[r] || r),
              ...(c.tags || []).slice(0, 3),
            ].filter(Boolean);

            const meta = prog
              ? (RATING_LABEL[prog.rating] || 'Completed')
              : (c.estimatedMin ? `~${c.estimatedMin} min` : (c.isFree ? 'Free' : undefined));

            const nextBadge = isNextUnstarted ? (
              <span style={{
                fontSize: '0.66rem', fontWeight: 700,
                color: 'var(--yellow)', background: 'var(--yellow-bg)',
                border: '1px solid var(--yellow-border)',
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
                subtitle={c.subtitle}
                tags={tags}
                difficulty={c.difficulty}
                accent='yellow'
                status={isDone ? 'solved' : undefined}
                locked={isLocked}
                meta={meta}
                badge={nextBadge}
                onClick={() => onSelectChallenge(c.id)}
              />
            );
          })}
          {filteredCases.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No challenges match this filter.
            </div>
          )}
        </div>
        </>
      )}

      {/* ── Full Loop — end-to-end cases ── */}
      {section === 'fullloop' && (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name='layers' size={15} color='var(--yellow)' />
          </span>
          <div>
            <div style={{
              fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.1rem',
            }}>
              End-to-End
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Full Loop
            </h2>
          </div>
        </div>

        <p style={{
          color: 'var(--text-muted)', fontSize: '0.9rem',
          margin: '0 0 1.1rem', maxWidth: '640px', lineHeight: 1.6,
        }}>
          A single ambiguous symptom, taken all the way through: frame the problem, decompose it MECE, design the schema, write the query chain, and synthesize a recommendation. These are not multi-room collisions — they are one investigation carried from alert to answer.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sortedFullLoop.map(m => {
            const prog = flProgress[m.id];
            const isLocked = !m.isFree && !unlocked;
            const isDone = !!prog;

            const tags = ['Full Loop', m.domain].filter(Boolean);
            const meta = prog ? 'Completed' : (m.isFree ? 'Free' : undefined);

            return (
              <CaseCard
                key={m.id}
                id={m.id}
                title={m.title}
                subtitle={'5-phase investigation — frame, decompose, schema, query chain, synthesis.'}
                tags={tags}
                difficulty={m.difficulty}
                accent='yellow'
                status={isDone ? 'solved' : undefined}
                locked={isLocked}
                meta={meta}
                onClick={() => onSelectFullLoop?.(m.id)}
              />
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
