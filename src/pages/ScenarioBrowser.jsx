import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { scenarios } from '../data/scenarios.js';
import { statsModules } from '../data/statsModules.js';
import { getStatsProgress } from '../utils/statsProgress.js';
import { FoundationNudgeCard } from '../components/shared/FoundationNudgeCard.jsx';
import { SegmentedTabs } from '../components/shared/SegmentedTabs.jsx';
import { RoomHeader } from '../components/shared/RoomHeader.jsx';
import { FilterBar } from '../components/shared/FilterBar.jsx';
import { CaseCard } from '../components/shared/CaseCard.jsx';

// Stats "claim check" cases — judge a stakeholder's claim about an experiment
// result. Folded into the Review room as a tagged section because both formats
// put you in the decision seat reading an experiment readout.
const STATS_DIFF_ORDER = { foundational: 0, analyst: 0, intermediate: 1, senior: 1, advanced: 2, staff: 2 };
const sortedStats = [...statsModules].sort((a, b) =>
  (STATS_DIFF_ORDER[a.difficulty] ?? 1) - (STATS_DIFF_ORDER[b.difficulty] ?? 1)
);

export function ScenarioBrowser({ allProgress, onSelect, onSelectStats, unlocked, onUnlock, onOpenArticle, onNavigate }) {
  const [section, setSection] = useState('readouts');
  const [statusFilter, setStatusFilter] = useState('all');
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  const completedCount = scenarios.filter(s => allProgress[s.id]?.attempts?.length > 0).length;
  const industries = [...new Set(scenarios.map(s => s.industry))];
  const firstUnstartedId = scenarios.find(s => !(allProgress[s.id]?.attempts?.length > 0))?.id;

  // ── Filtering (semantics preserved) ──
  const filteredScenarios = scenarios.filter(s => {
    if (statusFilter === 'free') return s.isFree;
    if (statusFilter === 'locked') return !s.isFree && !unlocked;
    if (statusFilter === 'completed') return allProgress[s.id]?.attempts?.length > 0;
    if (diffFilter !== 'all' && s.difficulty !== diffFilter) return false;
    if (industryFilter !== 'all' && s.industry !== industryFilter) return false;
    return true;
  });

  // ── Readout filter dropdowns ──
  const readoutFilters = [
    {
      id: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'all', label: 'All', count: scenarios.length },
        { value: 'completed', label: 'Done', count: completedCount },
      ],
    },
    {
      id: 'difficulty',
      label: 'Difficulty',
      value: diffFilter,
      onChange: setDiffFilter,
      options: [
        { value: 'all', label: 'All levels' },
        { value: 'analyst', label: 'Analyst', count: scenarios.filter(s => s.difficulty === 'analyst').length },
        { value: 'senior', label: 'Senior', count: scenarios.filter(s => s.difficulty === 'senior').length },
        { value: 'staff', label: 'Staff', count: scenarios.filter(s => s.difficulty === 'staff').length },
      ],
    },
    {
      id: 'industry',
      label: 'Industry',
      value: industryFilter,
      onChange: setIndustryFilter,
      options: [
        { value: 'all', label: 'All industries' },
        ...industries.map(i => ({ value: i, label: i, count: scenarios.filter(s => s.industry === i).length })),
      ],
    },
  ];

  return (
    <div className="pal-page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      <RoomHeader
        icon='flask'
        accent='accent'
        eyebrow='Review Room'
        title='A/B Judgment Room'
        blurb={'Every experiment ends in a decision meeting — ship, kill, or dig deeper. This room puts you in that seat. You read a realistic readout, spot what the numbers are actually saying (and what\'s being glossed over), and make the call. It\'s one of the most tested formats in senior analyst interviews and the one most candidates are least prepared for. The Claim Checks tab drills the same judgment on a stakeholder\'s one-line claim.'}
        solved={completedCount}
        total={scenarios.length}
      />

      {/* Foundation nudge */}
      {onNavigate && (
        <FoundationNudgeCard foundationRoom="exp-foundations" foundationLabel="Exp Foundations" onNavigate={onNavigate} />
      )}

      {/* Section tabs — Readouts vs Claim Checks (mutually exclusive) */}
      <SegmentedTabs
        accent='accent'
        value={section}
        onChange={setSection}
        tabs={[
          { id: 'readouts', label: 'Readouts', count: scenarios.length },
          { id: 'claims', label: 'Claim Checks', count: statsModules.length },
        ]}
      />

      {section === 'readouts' && (
      <>

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
      {!theoryActive && <FilterBar filters={readoutFilters} />}

      {/* Cards */}
      {!theoryActive && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredScenarios.map(scenario => {
          const prog = allProgress[scenario.id];
          const isDone = prog?.attempts?.length > 0;
          const isLocked = !scenario.isFree && !unlocked;
          const isNextUnstarted = scenario.id === firstUnstartedId;

          const tags = [scenario.industry, ...(scenario.tags || [])].filter(Boolean).slice(0, 4);

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
              locked={isLocked}
              meta={scenario.isFree ? 'Free' : undefined}
              badge={nextBadge}
              onClick={() => onSelect(scenario.id)}
            />
          );
        })}
        {filteredScenarios.length === 0 && (
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

      </>
      )}

      {/* ── Claim Checks — judge a stakeholder's claim about an experiment result (folded-in Stats Room) ── */}
      {section === 'claims' && (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name='scale' size={15} color='var(--accent)' />
          </span>
          <div>
            <div style={{
              fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.1rem',
            }}>
              Stats · Judge the Claim
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Claim Checks
            </h2>
          </div>
        </div>

        <p style={{
          color: 'var(--text-muted)', fontSize: '0.9rem',
          margin: '0 0 1.1rem', maxWidth: '640px', lineHeight: 1.6,
        }}>
          Same decision seat, tighter frame: a stakeholder hands you a one-line claim about an experiment result — "p &lt; 0.05, ship it?" — and you judge whether it holds. These cases drill the statistical reasoning behind the ship/kill call: p-values, confidence intervals, power, SRM, guardrails, novelty effects, and quasi-experimental design.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sortedStats.map(m => {
            const prog = getStatsProgress(m.id);
            const isLocked = !m.isFree && !unlocked;
            const isDone = !!prog?.bestLevel;

            const tags = ['Claim Check', m.concept].filter(Boolean);
            const meta = prog
              ? `${prog.attempts} attempt${prog.attempts !== 1 ? 's' : ''} · Resume`
              : (m.isFree ? 'Free' : undefined);

            return (
              <CaseCard
                key={m.id}
                id={m.id}
                title={m.title}
                subtitle={m.subtitle}
                tags={tags}
                difficulty={m.difficulty}
                accent='accent'
                status={isDone ? 'solved' : undefined}
                locked={isLocked}
                meta={meta}
                onClick={() => isLocked ? (onUnlock && onUnlock()) : onSelectStats?.(m.id)}
              />
            );
          })}
        </div>
      </div>
      )}

    </div>
  );
}
