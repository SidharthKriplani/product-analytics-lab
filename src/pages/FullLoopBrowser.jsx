import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';
import { fullLoopCases } from '../data/fullLoopCases.js';
import { getFullLoopProgress, getFullLoopCompletionCount } from '../utils/fullLoopProgress.js';

const DIFF_CFG = {
  analyst: { label: 'Analyst', color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  senior:  { label: 'Senior',  color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  staff:   { label: 'Staff',   color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
};

const DOMAIN_COLORS = {
  'E-commerce':    { color: 'var(--accent)',  bg: 'var(--accent-bg)' },
  'SaaS':          { color: 'var(--teal)',    bg: 'var(--teal-bg)' },
  'Marketplace':   { color: 'var(--purple)',  bg: 'var(--purple-bg)' },
  'Social':        { color: 'var(--red)',     bg: 'var(--red-bg)' },
  'Fintech':       { color: 'var(--green)',   bg: 'var(--green-bg)' },
  'Media':         { color: 'var(--yellow)',  bg: 'var(--yellow-bg)' },
  'Gaming':        { color: 'var(--purple)',  bg: 'var(--purple-bg)' },
  'Health':        { color: 'var(--teal)',    bg: 'var(--teal-bg)' },
};

function getDomainStyle(domain) {
  return DOMAIN_COLORS[domain] || { color: 'var(--accent)', bg: 'var(--accent-bg)' };
}

function Tag({ label, color, bg, border }) {
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
      color, background: bg, border: '1px solid ' + (border || color),
      borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.45rem',
    }}>
      {label}
    </span>
  );
}

export function FullLoopBrowser({ onOpen, onBack }) {
  const [diffFilter, setDiffFilter] = useState('all');
  const completedCount = getFullLoopCompletionCount();

  const diffCounts = {
    all: fullLoopCases.length,
    analyst: fullLoopCases.filter(c => c.difficulty === 'analyst').length,
    senior: fullLoopCases.filter(c => c.difficulty === 'senior').length,
    staff: fullLoopCases.filter(c => c.difficulty === 'staff').length,
  };

  const displayCases = fullLoopCases.filter(c => diffFilter === 'all' || c.difficulty === diffFilter);

  return (
    <div className="pal-page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: '0.82rem', cursor: 'pointer', padding: 0, marginBottom: '1rem',
          }}
        >
          <Icon name="arrow-left" size={14} color="var(--text-muted)" />
          Back
        </button>
      )}

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name="layers" size={18} color="var(--accent)" />
          </span>
          <div>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '0.15rem',
            }}>
              Full Loop
            </div>
            <h1 style={{
              fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)',
              margin: 0, letterSpacing: '-0.02em',
            }}>
              End-to-end analyst simulations
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.55rem',
          }}>
            Full Loop · {fullLoopCases.length} Cases
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 96, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: fullLoopCases.length > 0 ? Math.min(100, Math.round(completedCount / fullLoopCases.length * 100)) + '%' : '0%',
                background: 'var(--accent)', borderRadius: 2, transition: 'width 0.4s',
              }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{completedCount}/{fullLoopCases.length}</span>
          </div>
        </div>
      </div>

      {/* Difficulty filter */}
      <DifficultyChips value={diffFilter} onChange={setDiffFilter} counts={diffCounts} />

      {/* Card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))',
        gap: '0.85rem',
      }}>
        {displayCases.map((c, index) => {
          const progress = getFullLoopProgress(c.id);
          const diffCfg = DIFF_CFG[c.difficulty] || DIFF_CFG.analyst;
          const domainStyle = getDomainStyle(c.domain);
          const phaseCount = c.phases ? c.phases.length : 7;
          const description = c.alertPrompt
            ? (c.alertPrompt.length > 100 ? c.alertPrompt.slice(0, 100) + '...' : c.alertPrompt)
            : c.title;

          return (
            <div
              key={c.id}
              className="pal-card-enter pal-card-hover"
              role="button"
              tabIndex={0}
              onClick={() => onOpen(c.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(c.id); } }}
              style={{
                animationDelay: Math.min(index * 28, 400) + 'ms',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid ' + diffCfg.color,
                borderRadius: 'var(--radius)',
                padding: '1.1rem 1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.12s, box-shadow 0.12s',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent-border)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Completion checkmark */}
              {progress && (
                <span style={{
                  position: 'absolute', top: '0.6rem', right: '0.7rem',
                  fontSize: '0.82rem', color: 'var(--green)',
                }}>
                  &#10003;
                </span>
              )}

              {/* Tags row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.55rem', flexWrap: 'wrap' }}>
                <Tag label={c.domain || 'General'} color={domainStyle.color} bg={domainStyle.bg} />
                <Tag label={diffCfg.label} color={diffCfg.color} bg={diffCfg.bg} border={diffCfg.border} />
                <span style={{
                  fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)',
                  marginLeft: 'auto',
                }}>
                  {phaseCount} phases
                </span>
              </div>

              {/* Title */}
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: '0.35rem' }}>
                {c.title}
              </div>

              {/* Description */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {description}
              </div>

              {/* Completion detail */}
              {progress && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Completed {progress.attempts} time{progress.attempts !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
