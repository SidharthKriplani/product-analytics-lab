import { Icon } from '../components/shared/Icon.jsx';
import { useState } from 'react';
import { businessCases } from '../data/businessCases.js';
import { getCaseProgress } from '../utils/caseProgress.js';
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';

export function CasesBrowser({ onSelectCase, unlocked, onUnlock, onNavigate }) {
  const [diffFilter, setDiffFilter] = useState('all');
  const completedIds = new Set(businessCases.map(bc => bc.id).filter(id => getCaseProgress(id)));
  const firstUnstartedId = businessCases.find(bc => !completedIds.has(bc.id))?.id;

  const diffCounts = {
    all: businessCases.length,
    analyst: businessCases.filter(c => c.difficulty === 'analyst').length,
    senior: businessCases.filter(c => c.difficulty === 'senior').length,
    staff: businessCases.filter(c => c.difficulty === 'staff').length,
  };

  const displayCases = businessCases.filter(c => diffFilter === 'all' || c.difficulty === diffFilter);

  return (
    <div className="pal-page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--purple)', marginBottom: '0.4rem',
        }}>
          Business Cases
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
          Cases Room
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.6, maxWidth: '540px' }}>
          The most common interview opener is deceptively simple: "How would you measure success for X?" Most candidates jump straight to metrics. Strong candidates pause, clarify the question, and build a structured answer. This room trains that habit — constraint, clarity, then answer — across the ambiguous business and product scenarios that show up most in interviews.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'var(--purple-bg)', border: '1px solid var(--purple-border)',
          borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem',
          fontSize: '0.75rem', color: 'var(--purple)',
        }}>
          <span>◈</span>
          <span>Cases · {businessCases.length} Cases</span>
        </div>
      </div>

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
            <Icon name="book-open" size={14} color="var(--teal)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', marginBottom: '0.15rem' }}>Recommended starting point</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <button onClick={() => onNavigate('rca-foundations')} style={{
                  background: 'none', border: 'none', padding: 0,
                  color: 'var(--teal)', fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.78rem',
                }}>RCA Foundations</button>
                {' '}builds the diagnostic framework these cases use.
              </div>
            </div>
          </div>
        )}

      {/* Difficulty filter chips */}
      <DifficultyChips value={diffFilter} onChange={setDiffFilter} counts={diffCounts} />

      {/* Case cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {displayCases.map((bc, index) => {
          const progress = getCaseProgress(bc.id);

          return (
            <CaseCard
              key={bc.id}
              index={index}
              businessCase={bc}
              progress={progress}
              isLocked={!bc.isFree && !unlocked}
              onSelect={() => onSelectCase(bc.id)}
              onUnlock={onUnlock}
              isNextUnstarted={bc.id === firstUnstartedId}
            />
          );
        })}
      </div>

    </div>
  );
}

function CaseCard({ businessCase: bc, index, progress, isLocked, onSelect, onUnlock, isNextUnstarted }) {
  const levelCfg = progress ? getLevelConfig(progress.level) : null;

  return (
    <div
      className="pal-card-enter pal-card-hover"
      style={{
        animationDelay: (Math.min(index * 28, 400)) + 'ms',
        border: '1.5px solid var(--border)',
        borderLeft: isNextUnstarted ? '3px solid var(--accent)' : '1.5px solid var(--border)',
        borderRadius: 'var(--radius)',
        background: 'var(--surface)',
        padding: '1.1rem 1.25rem',
        cursor: isLocked ? 'default' : 'pointer',
        opacity: isLocked ? 0.7 : 1,
        transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
        position: 'relative',
      }}
      role="button"
      tabIndex={isLocked ? -1 : 0}
      onClick={onSelect}
      onKeyDown={e => { if (!isLocked && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(); } }}
      onMouseEnter={e => {
        if (!isLocked) {
          e.currentTarget.style.borderColor = 'var(--purple-border)';
          e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {isNextUnstarted && (
        <span style={{
          position: 'absolute', top: '0.6rem', right: '0.7rem',
          fontSize: '0.68rem', fontWeight: 700,
          color: 'var(--accent)', background: 'var(--accent-bg)',
          border: '1px solid var(--accent-border)',
          borderRadius: 4, padding: '0.1rem 0.4rem',
        }}>
          Next →
        </span>
      )}
      {/* Badges row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
        <DomainBadge domain={bc.domain} />
        <DifficultyBadge difficulty={bc.difficulty} />
        {levelCfg && (
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: levelCfg.color, background: levelCfg.bg, border: `1px solid ${levelCfg.border}`,
            borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
          }}>{levelCfg.label}</span>
        )}
      </div>

      {/* Title + subtitle */}
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.15rem', letterSpacing: '-0.01em' }}>
        {bc.title}
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
        {bc.subtitle}
      </p>

      {/* Executive ask callout */}
      <div style={{
        borderLeft: '3px solid var(--purple-border)',
        background: 'var(--purple-bg)',
        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
        padding: '0.6rem 0.8rem',
        marginBottom: '0.5rem',
      }}>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--purple)', marginBottom: '0.25rem',
        }}>
          The Question
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text)', margin: 0, lineHeight: 1.55, fontStyle: 'italic' }}>
          {bc.context.executiveAsk}
        </p>
      </div>

      {/* Ambiguity hint */}
      <p style={{ fontSize: '0.77rem', color: 'var(--text-muted)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
        {bc.context.ambiguity}
      </p>

      {/* Progress / lock row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        {isLocked ? (
          <button
            onClick={e => { e.stopPropagation(); onUnlock(); }}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.65rem',
              fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            Unlock beta
          </button>
        ) : progress?.attempts > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {progress.attempts} attempt{progress.attempts > 1 ? 's' : ''} · Score: {progress.score?.score ?? '—'}/{progress.score?.maxScore ?? '—'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--purple)', fontWeight: 600 }}>
              View debrief →
            </span>
          </div>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Not started · {bc.phases.length} phases
          </span>
        )}
      </div>
    </div>
  );
}

function getLevelConfig(level) {
  return {
    staff:   { color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)',   label: 'Staff' },
    senior:  { color: 'var(--accent)',    bg: 'var(--accent-bg)', border: 'var(--accent-border)', label: 'Senior' },
    analyst: { color: 'var(--blue-text)', bg: 'var(--blue-bg)',   border: 'var(--blue-border)',   label: 'Analyst' },
    junior:  { color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)', label: 'Junior miss' },
  }[level] || null;
}

function DifficultyBadge({ difficulty }) {
  const cfg = {
    analyst: { label: 'Analyst', color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
    senior:  { label: 'Senior',  color: 'var(--accent)',    bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
    staff:   { label: 'Staff',   color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  }[difficulty] || { label: difficulty, color: 'var(--text-dim)', bg: 'var(--surface-2)', border: 'var(--border)' };

  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
    }}>{cfg.label}</span>
  );
}

function DomainBadge({ domain }) {
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
    }}>{domain}</span>
  );
}
