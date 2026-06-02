import { Icon } from '../components/shared/Icon.jsx';
import { useState } from 'react';
import { statsModules } from '../data/statsModules.js';
import { getAllStatsProgress } from '../utils/statsProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { getRoomConfig } from '../data/roomConfig.js';

const DIFF_CFG = {
  foundational: { label: 'Foundational', color: 'var(--blue-text)', bg: 'var(--blue-bg)',    border: 'var(--blue-border)' },
  analyst:      { label: 'Analyst',      color: 'var(--accent)',    bg: 'var(--accent-bg)',  border: 'var(--accent-border)' },
  intermediate: { label: 'Intermediate', color: 'var(--yellow)',    bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
  senior:       { label: 'Senior',       color: 'var(--teal)',      bg: 'var(--teal-bg)',    border: 'var(--teal-border)' },
  advanced:     { label: 'Advanced',     color: 'var(--purple)',    bg: 'var(--purple-bg)',  border: 'var(--purple-border)' },
  staff:        { label: 'Staff',        color: 'var(--red)',       bg: 'var(--red-bg)',     border: 'var(--red-border)' },
};

const LEVEL_CFG = {
  staff:   { label: 'Staff-Level',   color: 'var(--teal)',   bg: 'var(--teal-bg)',    border: 'var(--teal-border)' },
  strong:  { label: 'Senior-Ready',  color: 'var(--accent)', bg: 'var(--accent-bg)',  border: 'var(--accent-border)' },
  partial: { label: 'Analyst-Ready', color: 'var(--yellow)', bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
  wrong:   { label: 'Needs Work',    color: 'var(--red)',    bg: 'var(--red-bg)',     border: 'var(--red-border)' },
};

const DIFF_ORDER = { analyst: 0, foundational: 0, intermediate: 1, senior: 1, advanced: 2, staff: 2 };
const DIFF_GROUP_LABELS = { 0: 'Foundational · Analyst', 1: 'Intermediate · Senior', 2: 'Advanced · Staff' };

const moduleOriginalIndex = new Map(statsModules.map((m, i) => [m.id, i + 1]));

export function StatsBrowser({ onSelectModule, onOpenArticle, onNavigate }) {
  const [sortBy, setSortBy] = useState('default');
  const [theoryActive, setTheoryActive] = useState(false);
  const allProgress = getAllStatsProgress();
  const completedCount = Object.keys(allProgress).length;

  const completedIds = new Set(Object.keys(allProgress));

  const displayModules = sortBy === 'difficulty'
    ? [...statsModules].sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 1) - (DIFF_ORDER[b.difficulty] ?? 1))
    : statsModules;

  // Build grouped structure when sorted by difficulty
  const diffGroups = sortBy === 'difficulty'
    ? [0, 1, 2].map(tier => ({
        tier,
        label: DIFF_GROUP_LABELS[tier],
        modules: displayModules.filter(m => (DIFF_ORDER[m.difficulty] ?? 1) === tier),
      })).filter(g => g.modules.length > 0)
    : null;

  const firstUnstartedId = statsModules.find(m => !completedIds.has(m.id))?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', width: '100%', boxSizing: 'border-box' }}>

      {/* Header */}
      {(() => {
        const cfg = getRoomConfig('stats');
        return (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px',
              background: cfg.bg, borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon name={cfg.icon} size={20} color={cfg.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: cfg.color, marginBottom: '0.25rem',
              }}>
                {cfg.label}
              </div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', margin: '0', letterSpacing: '-0.02em' }}>
                Statistical Concepts
              </h1>
            </div>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.6, maxWidth: '540px' }}>
            Stats questions in interviews are never pure math — they are always attached to a decision. Should we ship? Is this result real or noise? Can we trust the sample? Knowing the formula is not the bar; knowing which concept applies, what it means for this specific decision, and where the common misread is — that is what gets tested.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{statsModules.length} modules</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 96, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, Math.round(completedCount / statsModules.length * 100))}%`, background: cfg.color, borderRadius: 2, transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{completedCount}/{statsModules.length}</span>
            </div>
          </div>
        </div>
        );
      })()}

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
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, justifyContent: 'flex-end' }}>
        {['default', 'difficulty'].map(opt => (
          <button key={opt} onClick={() => setSortBy(opt)} className={`pal-sort-btn${sortBy === opt ? ' active' : ''}`}>{opt === 'default' ? 'Default' : 'By Difficulty'}</button>
        ))}
      </div>
      )}

      {/* Module cards */}
      {!theoryActive && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: diffGroups ? '1.5rem' : '0.75rem' }}>
        {diffGroups
          ? diffGroups.map(group => (
              <div key={group.tier}>
                {/* Group header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  marginBottom: '0.75rem',
                }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: group.tier === 0 ? 'var(--accent)' : group.tier === 1 ? 'var(--teal)' : 'var(--purple)',
                    background: group.tier === 0 ? 'var(--accent-bg)' : group.tier === 1 ? 'var(--teal-bg)' : 'var(--purple-bg)',
                    border: `1px solid ${group.tier === 0 ? 'var(--accent-border)' : group.tier === 1 ? 'var(--teal-border)' : 'var(--purple-border)'}`,
                    borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.6rem',
                  }}>{group.label}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{group.modules.length} module{group.modules.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {group.modules.map((module, index) => <ModuleCard key={module.id} module={module} index={index} allProgress={allProgress} firstUnstartedId={firstUnstartedId} onSelectModule={onSelectModule} />)}
                </div>
              </div>
            ))
          : displayModules.map((module, index) => <ModuleCard key={module.id} module={module} index={index} allProgress={allProgress} firstUnstartedId={firstUnstartedId} onSelectModule={onSelectModule} />)
        }
      </div>
      )}

      {theoryActive && (
        <div>
          <div style={{ marginBottom: '1rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            Read the theory, then practice it in the cases above.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '0.75rem' }}>
            {FOUNDATION_DOMAINS['statistics'].articles.map(a => (
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

function ModuleCard({ module, index, allProgress, firstUnstartedId, onSelectModule }) {
  const progress = allProgress[module.id];
  const levelCfg = progress?.bestLevel ? LEVEL_CFG[progress.bestLevel] : null;
  const diffCfg = DIFF_CFG[module.difficulty] || DIFF_CFG.foundational;
  const isNextUnstarted = module.id === firstUnstartedId;
  const origNum = moduleOriginalIndex.get(module.id) || 0;

  return (
    <div
      className="pal-card-enter pal-card-hover"
      role="button"
      tabIndex={0}
      onClick={() => onSelectModule(module.id)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectModule(module.id); } }}
      style={{
        animationDelay: (Math.min(index * 28, 400)) + 'ms',
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderLeft: isNextUnstarted ? '3px solid var(--accent)' : `3px solid ${diffCfg.color}`,
        borderRadius: 'var(--radius)',
        padding: '1.1rem 1.25rem',
        cursor: 'pointer',
        transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
        display: 'flex', alignItems: 'flex-start', gap: '1rem',
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
      {/* Module number — always reflects original position */}
      <div style={{
        width: '2rem', height: '2rem', flexShrink: 0,
        background: levelCfg ? levelCfg.bg : 'var(--surface-2)',
        border: `1px solid ${levelCfg ? levelCfg.border : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.72rem', fontWeight: 800,
        color: levelCfg ? levelCfg.color : 'var(--text-dim)',
      }}>
        {levelCfg ? '✓' : String(origNum).padStart(2, '0')}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
            borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem',
          }}>{diffCfg.label}</span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 600,
            color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{module.concept}</span>
          {levelCfg && (
            <span style={{
              fontSize: '0.68rem', fontWeight: 700,
              color: levelCfg.color, background: levelCfg.bg, border: `1px solid ${levelCfg.border}`,
              borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>{levelCfg.label}</span>
          )}
        </div>
        <h3 style={{ fontSize: '0.97rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.25rem', letterSpacing: '-0.01em' }}>
          {module.title}
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {module.subtitle}
        </p>
      </div>

      {/* Arrow */}
      <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem', flexShrink: 0, paddingTop: '0.2rem' }}>→</span>
    </div>
  );
}

function Stat({ n, label, color }) {
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.7rem',
      display: 'flex', alignItems: 'baseline', gap: '0.3rem',
    }}>
      <span style={{ fontSize: '1rem', fontWeight: 800, color: color || 'var(--accent)', lineHeight: 1 }}>{n}</span>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{label}</span>
    </div>
  );
}
