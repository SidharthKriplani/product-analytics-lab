import { useState } from 'react';
import { ScenarioCard } from '../components/scenario/ScenarioCard.jsx';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { scenarios } from '../data/scenarios.js';
import { FoundationNudgeCard } from '../components/shared/FoundationNudgeCard.jsx';

export function ScenarioBrowser({ allProgress, onSelect, unlocked, onUnlock, onOpenArticle, onNavigate }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  const completedCount = scenarios.filter(s => allProgress[s.id]?.attempts?.length > 0).length;
  const industries = [...new Set(scenarios.map(s => s.industry))];
  const firstUnstartedId = scenarios.find(s => !(allProgress[s.id]?.attempts?.length > 0))?.id;

  const filteredScenarios = scenarios.filter(s => {
    if (statusFilter === 'free') return s.isFree;
    if (statusFilter === 'locked') return !s.isFree && !unlocked;
    if (statusFilter === 'completed') return allProgress[s.id]?.attempts?.length > 0;
    if (diffFilter !== 'all' && s.difficulty !== diffFilter) return false;
    if (industryFilter !== 'all' && s.industry !== industryFilter) return false;
    return true;
  });

  const FilterBtn = ({ id, label, active, onClick }) => (
    <button onClick={onClick} style={{
      background: active ? 'var(--accent)' : 'var(--surface)',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.8rem',
      color: active ? '#fff' : 'var(--text-muted)',
      fontWeight: active ? 700 : 400, fontSize: '0.8rem', cursor: 'pointer',
      transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
    }}>{label}</button>
  );

  return (
    <div className="pal-page-enter" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
          Experiment Review Room
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 0.5rem' }}>
          {completedCount} of {scenarios.length} completed
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, maxWidth: '600px', lineHeight: 1.6 }}>
          Every experiment ends in a decision meeting — ship, kill, or dig deeper. This room puts you in that seat. You read a realistic readout, spot what the numbers are actually saying (and what's being glossed over), and make the call. It's one of the most tested formats in senior analyst interviews and the one most candidates are least prepared for.
        </p>
      </div>

      {/* Foundation nudge */}
      {onNavigate && (
        <FoundationNudgeCard foundationRoom="exp-foundations" foundationLabel="Exp Foundations" onNavigate={onNavigate} />
      )}

      {/* Theory / Cases tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
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
      {!theoryActive && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <FilterBtn active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} label={`All (${scenarios.length})`} />
          <FilterBtn active={statusFilter === 'completed'} onClick={() => setStatusFilter('completed')} label={`Done (${completedCount})`} />
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {['all', 'analyst', 'senior', 'staff'].map(d => (
            <FilterBtn key={d} active={diffFilter === d} onClick={() => setDiffFilter(d)} label={d === 'all' ? 'All levels' : d.charAt(0).toUpperCase() + d.slice(1)} />
          ))}
        </div>

        <select
          value={industryFilter}
          onChange={e => setIndustryFilter(e.target.value)}
          style={{
            background: 'var(--input-bg)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.65rem',
            color: industryFilter !== 'all' ? 'var(--text)' : 'var(--text-muted)',
            fontSize: '0.8rem', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="all">All industries</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      )}

      {/* Grid */}
      {!theoryActive && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(310px, 100%), 1fr))',
        gap: '0.875rem',
      }}>
        {filteredScenarios.map((scenario, index) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            progress={allProgress[scenario.id]}
            onClick={onSelect}
            unlocked={unlocked}
            isNextUnstarted={scenario.id === firstUnstartedId}
            cardClassName="pal-card-enter pal-card-hover"
            cardStyle={{ animationDelay: (Math.min(index * 28, 400)) + 'ms' }}
          />
        ))}
        {filteredScenarios.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
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
