import { useState } from 'react';
import { designScenarios } from '../data/designScenarios.js';
import { getAllDesignProgress } from '../utils/designProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { FoundationNudgeCard } from '../components/shared/FoundationNudgeCard.jsx';
import { RoomHeader } from '../components/shared/RoomHeader.jsx';
import { FilterBar } from '../components/shared/FilterBar.jsx';
import { CaseCard } from '../components/shared/CaseCard.jsx';
import { AddTrackBtn } from '../components/tracks/AddToTrackPopover.jsx';

const DIFF_ORDER = { analyst: 0, senior: 1, staff: 2 };

export function DesignBrowser({ onSelectScenario, onOpenArticle, onNavigate }) {
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const allProgress = getAllDesignProgress();

  const completedIds = new Set(Object.keys(allProgress));
  const completedCount = completedIds.size;
  const firstUnstartedId = designScenarios.find(s => !completedIds.has(s.id))?.id;
  const industries = [...new Set(designScenarios.map(s => s.industry).filter(Boolean))];

  // ── Filtering (AND semantics) then stable difficulty sort ──
  const filtered = designScenarios.filter(s => {
    if (diffFilter !== 'all' && s.difficulty !== diffFilter) return false;
    if (industryFilter !== 'all' && s.industry !== industryFilter) return false;
    const isDone = completedIds.has(s.id);
    if (statusFilter === 'completed' && !isDone) return false;
    if (statusFilter === 'unstarted' && isDone) return false;
    return true;
  }).sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 9) - (DIFF_ORDER[b.difficulty] ?? 9));

  const filters = [
    {
      id: 'difficulty',
      label: 'Difficulty',
      value: diffFilter,
      onChange: setDiffFilter,
      options: [
        { value: 'all', label: 'All levels' },
        { value: 'analyst', label: 'Analyst', count: designScenarios.filter(s => s.difficulty === 'analyst').length },
        { value: 'senior', label: 'Senior', count: designScenarios.filter(s => s.difficulty === 'senior').length },
        { value: 'staff', label: 'Staff', count: designScenarios.filter(s => s.difficulty === 'staff').length },
      ],
    },
    {
      id: 'industry',
      label: 'Industry',
      value: industryFilter,
      onChange: setIndustryFilter,
      options: [
        { value: 'all', label: 'All industries' },
        ...industries.map(i => ({ value: i, label: i, count: designScenarios.filter(s => s.industry === i).length })),
      ],
    },
    {
      id: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'all', label: 'All' },
        { value: 'unstarted', label: 'Unstarted', count: designScenarios.length - completedCount },
        { value: 'completed', label: 'Done', count: completedCount },
      ],
    },
  ];

  return (
    <div className="pal-page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>

      <RoomHeader
        icon='target'
        accent='accent'
        eyebrow='Design Room'
        title='Experiment Design'
        blurb={'Most experiment mistakes are locked in before a single user is assigned — wrong randomization unit, primary metric that cannot move the business, no decision rule for the ambiguous outcome. Design forces you to make every call upfront, blind to the results, so you discover your reasoning gaps before they corrupt a live experiment. Pairs with the Review Room readouts.'}
        solved={completedCount}
        total={designScenarios.length}
      />

      {/* Foundation nudge */}
      {onNavigate && (
        <FoundationNudgeCard foundationRoom="exp-foundations" foundationLabel="Exp Foundations" onNavigate={onNavigate} />
      )}

      {/* Cases / Theory toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {['Cases', 'Theory'].map(tab => {
          const active = tab === 'Theory' ? theoryActive : !theoryActive;
          return (
            <button
              key={tab}
              onClick={() => setTheoryActive(tab === 'Theory')}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid ' + (active ? 'var(--accent-border)' : 'var(--border)'),
                background: active ? 'var(--accent-bg)' : 'none',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 400,
                fontSize: '0.82rem', cursor: 'pointer',
              }}
            >{tab}</button>
          );
        })}
      </div>

      {/* Filters */}
      {!theoryActive && <FilterBar filters={filters} />}

      {/* Scenario cards */}
      {!theoryActive && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map(scenario => {
          const progress = allProgress[scenario.id];
          const isDone = completedIds.has(scenario.id);
          const isNextUnstarted = scenario.id === firstUnstartedId;

          const tags = [
            scenario.industry,
            scenario.pairedReviewScenarioId ? 'Paired' : null,
            progress?.bestLevel ? progress.bestLevel.replace(/_/g, ' ') : null,
          ].filter(Boolean);

          const meta = progress?.attempts > 0
            ? `${progress.attempts} attempt${progress.attempts > 1 ? 's' : ''} · Best ${Math.round((progress.bestScore || 0) * 100)}%`
            : undefined;

          const nextBadge = isNextUnstarted ? (
            <span style={{
              fontSize: '0.66rem', fontWeight: 700,
              color: 'var(--accent)', background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
              borderRadius: 4, padding: '0.08rem 0.4rem',
            }}>
              Next
            </span>
          ) : null;

          return (
            <CaseCard
              key={scenario.id}
              id={scenario.id}
              title={scenario.title}
              subtitle={scenario.subtitle}
              tags={tags}
              difficulty={scenario.difficulty}
              accent='accent'
              status={isDone ? 'solved' : undefined}
              meta={meta}
              badge={nextBadge}
              onClick={() => onSelectScenario(scenario.id)}
              addBtn={<AddTrackBtn itemType='design' itemId={String(scenario.id)} label={scenario.title} itemMeta={{ difficulty: scenario.difficulty }} />}
            />
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No scenarios match this filter.
          </div>
        )}
      </div>
      )}

      {theoryActive && (
        <div>
          <div style={{ marginBottom: '1rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            Read the theory, then practice it in the cases above.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '0.75rem' }}>
            {FOUNDATION_DOMAINS['experimentation'].articles.map(a => (
              <button
                key={a.id}
                onClick={() => onOpenArticle && onOpenArticle(a.id)}
                style={{
                  textAlign: 'left', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: '10px',
                  padding: '0.9rem 1rem', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{a.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.35rem', fontWeight: 500 }}>Read article →</div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
