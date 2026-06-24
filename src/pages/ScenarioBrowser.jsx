import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { ScenarioCard } from '../components/scenario/ScenarioCard.jsx';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { scenarios } from '../data/scenarios.js';
import { statsModules } from '../data/statsModules.js';
import { getStatsProgress } from '../utils/statsProgress.js';
import { FoundationNudgeCard } from '../components/shared/FoundationNudgeCard.jsx';

// Stats "claim check" cases — judge a stakeholder's claim about an experiment
// result. Folded into the Review room as a tagged section because both formats
// put you in the decision seat reading an experiment readout.
const STATS_DIFF_CFG = {
  foundational: { label: 'Foundational', color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  analyst:      { label: 'Analyst',      color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  intermediate: { label: 'Intermediate', color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  senior:       { label: 'Senior',       color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  advanced:     { label: 'Advanced',     color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
  staff:        { label: 'Staff',        color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)' },
};

const STATS_DIFF_ORDER = { foundational: 0, analyst: 0, intermediate: 1, senior: 1, advanced: 2, staff: 2 };
const sortedStats = [...statsModules].sort((a, b) =>
  (STATS_DIFF_ORDER[a.difficulty] ?? 1) - (STATS_DIFF_ORDER[b.difficulty] ?? 1)
);

export function ScenarioBrowser({ allProgress, onSelect, onSelectStats, unlocked, onUnlock, onOpenArticle, onNavigate }) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name='flask' size={18} color='var(--accent)' />
          </span>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '0.15rem' }}>
              Review Room
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.025em' }}>
              A/B Judgment Room
            </h1>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 0.5rem' }}>
          {completedCount} of {scenarios.length} completed
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, maxWidth: '600px', lineHeight: 1.6 }}>
          Every experiment ends in a decision meeting — ship, kill, or dig deeper. This room puts you in that seat. You read a realistic readout, spot what the numbers are actually saying (and what's being glossed over), and make the call. It's one of the most tested formats in senior analyst interviews and the one most candidates are least prepared for. Below the readout cases, the <strong style={{ color: 'var(--teal)' }}>Claim Checks</strong> section drills the same judgment on a stakeholder's one-line claim about a result.
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

      {/* ── Claim Checks — judge a stakeholder's claim about an experiment result (folded-in Stats Room) ── */}
      {!theoryActive && (
      <div style={{ marginTop: '2.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name='scale' size={15} color='var(--teal)' />
          </span>
          <div>
            <div style={{
              fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '0.1rem',
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
          gap: '0.85rem',
        }}>
          {sortedStats.map((m, index) => {
            const prog = getStatsProgress(m.id);
            const isLocked = !m.isFree && !unlocked;
            const diffCfg = STATS_DIFF_CFG[m.difficulty] || STATS_DIFF_CFG.foundational;

            return (
              <div
                key={m.id}
                className="pal-card-enter pal-card-hover"
                role="button"
                tabIndex={0}
                onClick={() => isLocked ? (onUnlock && onUnlock()) : onSelectStats?.(m.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    isLocked ? (onUnlock && onUnlock()) : onSelectStats?.(m.id);
                  }
                }}
                style={{
                  animationDelay: String(Math.min(index * 28, 400)) + 'ms',
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderLeft: '3px solid var(--teal)',
                  borderRadius: 'var(--radius)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
                  opacity: isLocked ? 0.7 : 1,
                  display: 'flex', flexDirection: 'column', gap: '0.6rem',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--teal-border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Badges row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--teal)', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
                    borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem',
                  }}>Claim Check</span>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
                    borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem',
                  }}>{diffCfg.label}</span>
                  {m.concept && (
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                      color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem',
                    }}>{m.concept}</span>
                  )}
                  {isLocked && <span style={{ fontSize: '0.8rem', marginLeft: 'auto' }}>🔒</span>}
                  {prog?.bestLevel && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', marginLeft: 'auto' }}>✓</span>
                  )}
                </div>

                {/* Title + subtitle */}
                <div>
                  <h3 style={{ fontSize: '0.97rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.2rem', letterSpacing: '-0.01em', lineHeight: 1.35 }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {m.subtitle}
                  </p>
                </div>

                {/* Bottom row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  {prog ? (
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                      {prog.attempts} attempt{prog.attempts !== 1 ? 's' : ''} · Resume →
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>Not started</span>
                  )}
                  {!isLocked && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 600 }}>→</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
