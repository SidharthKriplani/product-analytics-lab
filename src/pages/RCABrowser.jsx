import { Icon } from '../components/shared/Icon.jsx';
import { useState } from 'react';
import { rcaCases } from '../data/rcaCases.js';
import { getRCAProgress } from '../utils/rcaProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';
import { FoundationNudgeCard } from '../components/shared/FoundationNudgeCard.jsx';

const DIFF_CFG = {
  analyst: { label: 'Analyst', color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  senior:  { label: 'Senior',  color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  staff:   { label: 'Staff',   color: 'var(--yellow)',  bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
};

const DOMAIN_CFG = {
  growth:   { label: 'Growth',   color: 'var(--blue-text)', bg: 'var(--blue-bg)' },
  search:   { label: 'Search',   color: 'var(--teal)',      bg: 'var(--teal-bg)' },
  engagement: { label: 'Engagement', color: 'var(--accent)', bg: 'var(--accent-bg)' },
  marketplace: { label: 'Marketplace', color: 'var(--purple)', bg: 'var(--purple-bg)' },
  retention: { label: 'Retention', color: 'var(--green)',  bg: 'var(--green-bg)' },
  monetization: { label: 'Monetization', color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
};

const LEVEL_LABEL = {
  staff:   'Staff-Level',
  senior:  'Senior',
  analyst: 'Analyst',
  junior:  'Junior',
};

const LEVEL_COLOR = {
  staff:   'var(--teal)',
  senior:  'var(--accent)',
  analyst: 'var(--yellow)',
  junior:  'var(--red)',
};

const LEVEL_BG = {
  staff:   'var(--teal-bg)',
  senior:  'var(--accent-bg)',
  analyst: 'var(--yellow-bg)',
  junior:  'var(--red-bg)',
};

function Tag({ label, color, bg, border }) {
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
      color, background: bg, border: `1px solid ${border || color}`,
      borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.45rem',
    }}>
      {label}
    </span>
  );
}

const DIFF_ORDER = { analyst: 0, foundational: 0, intermediate: 1, senior: 1, advanced: 2, staff: 2 };

export function RCABrowser({ onSelectCase, unlocked, onUnlock, onOpenArticle, onNavigate }) {
  const [sortBy, setSortBy] = useState('default');
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');
  const completedCount = rcaCases.filter(c => getRCAProgress(c.id)).length;

  const diffCounts = {
    all: rcaCases.length,
    analyst: rcaCases.filter(c => c.difficulty === 'analyst').length,
    senior: rcaCases.filter(c => c.difficulty === 'senior').length,
    staff: rcaCases.filter(c => c.difficulty === 'staff').length,
  };

  const displayCases = (sortBy === 'difficulty'
    ? [...rcaCases].sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 1) - (DIFF_ORDER[b.difficulty] ?? 1))
    : rcaCases
  ).filter(c => diffFilter === 'all' || c.difficulty === diffFilter);

  const firstUnstartedId = rcaCases.find(c => !getRCAProgress(c.id))?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--yellow)', marginBottom: '0.4rem',
        }}>
          RCA Room
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
          Root Cause Analysis
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.6, maxWidth: '540px' }}>
          The most common RCA failure is jumping to an explanation before ruling out data issues, external factors, or mix shift — then defending it when the interviewer pushes back. This room builds the diagnostic instinct: given a metric movement and raw context, what do you check first, in what order, and why does each cut either confirm or eliminate a hypothesis?
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--yellow)', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
            borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.55rem',
          }}>
            RCA · {rcaCases.length} Cases
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 96, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round(completedCount / rcaCases.length * 100))}%`, background: 'var(--yellow)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{completedCount}/{rcaCases.length}</span>
          </div>
        </div>
      </div>

      {/* Foundation nudge */}
      {onNavigate && (
        <FoundationNudgeCard foundationRoom="rca-foundations" foundationLabel="RCA Foundations" onNavigate={onNavigate} />
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

      {!theoryActive && (
        <DifficultyChips value={diffFilter} onChange={setDiffFilter} counts={diffCounts} />
      )}

      {!theoryActive && (
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, justifyContent: 'flex-end' }}>
        {['default', 'difficulty'].map(opt => (
          <button key={opt} onClick={() => setSortBy(opt)} className={`pal-sort-btn${sortBy === opt ? ' active' : ''}`}>{opt === 'default' ? 'Default' : 'By Difficulty'}</button>
        ))}
      </div>
      )}

      {/* Case cards */}
      {!theoryActive && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {displayCases.map((c, index) => {
          const progress = getRCAProgress(c.id);
          const diffCfg = DIFF_CFG[c.difficulty] || DIFF_CFG.analyst;
          const domainCfg = DOMAIN_CFG[c.domain] || DOMAIN_CFG.growth;

          return (
            <CaseCard
              key={c.id}
              index={index}
              rcaCase={c}
              progress={progress}
              isLocked={!c.isFree && !unlocked}
              diffCfg={diffCfg}
              domainCfg={domainCfg}
              onSelectCase={onSelectCase}
              onUnlock={onUnlock}
              isNextUnstarted={c.id === firstUnstartedId}
            />
          );
        })}
      </div>
      )}

      {theoryActive && (
        <div>
          <div style={{ marginBottom: '1rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            Read the theory, then practice it in the cases above.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '0.75rem' }}>
            {FOUNDATION_DOMAINS['rca'].articles.map(a => (
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

function CaseCard({ rcaCase, index, progress, isLocked, diffCfg, domainCfg, onSelectCase, onUnlock, isNextUnstarted }) {
  const levelColor = progress ? LEVEL_COLOR[progress.level] : null;
  const levelBg = progress ? LEVEL_BG[progress.level] : null;

  function handleClick() {
    if (isLocked) {
      onUnlock && onUnlock();
    } else {
      onSelectCase(rcaCase.id);
    }
  }

  return (
    <div
      className="pal-card-enter pal-card-hover"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      style={{
        animationDelay: (Math.min(index * 28, 400)) + 'ms',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: isNextUnstarted ? '3px solid var(--teal)' : '3px solid ' + diffCfg.color,
        borderRadius: 'var(--radius)',
        padding: '1.1rem 1.25rem',
        cursor: 'pointer',
        opacity: isLocked ? 0.65 : 1,
        transition: 'border-color 0.12s, box-shadow 0.12s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--yellow-border)';
        e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
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
          color: 'var(--teal)', background: 'var(--teal-bg)',
          border: '1px solid var(--teal-border)',
          borderRadius: 4, padding: '0.1rem 0.4rem',
        }}>
          Next →
        </span>
      )}
      {/* Top row: tags + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.55rem', flexWrap: 'wrap' }}>
        <Tag label={domainCfg.label} color={domainCfg.color} bg={domainCfg.bg} />
        <Tag label={diffCfg.label} color={diffCfg.color} bg={diffCfg.bg} border={diffCfg.border} />
        {progress && !isLocked && (
          <span style={{
            marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: levelColor, background: levelBg, border: `1px solid ${levelColor}`,
            borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.45rem',
          }}>
            {LEVEL_LABEL[progress.level]} · {progress.score}/{progress.maxScore ?? 10}
          </span>
        )}
      </div>

      {/* Title + subtitle */}
      <div style={{ marginBottom: '0.6rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
          {rcaCase.title}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
          {rcaCase.subtitle}
        </div>
      </div>

      {/* Metric movement callout */}
      <div style={{
        background: 'var(--yellow-bg)',
        border: '1px solid var(--yellow-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.5rem 0.75rem',
        fontSize: '0.8rem',
        color: 'var(--text)',
        lineHeight: 1.5,
      }}>
        <span style={{ fontWeight: 700, color: 'var(--yellow)', marginRight: '0.4rem', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Movement
        </span>
        {rcaCase.context.metricMovement}
      </div>

      {/* Completion indicator */}
      {progress && (
        <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Completed {progress.attempts} time{progress.attempts !== 1 ? 's' : ''} · Click to review
        </div>
      )}
    </div>
  );
}
