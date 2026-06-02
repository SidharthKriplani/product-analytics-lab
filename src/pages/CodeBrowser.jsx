import { useState } from 'react';
import { getAllCodeProgress } from '../utils/codeProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { codeModules } from '../data/codeModules.js';
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';

const TRACK_CONFIG = {
  sql:    { label: 'SQL',    color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  python: { label: 'Python', color: 'var(--purple)',  bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
};

const DIFF_CONFIG = {
  analyst: { label: 'Analyst',  color: 'var(--teal)',   bg: 'var(--teal-bg)',    border: 'var(--teal-border)' },
  senior:  { label: 'Senior',   color: 'var(--purple)', bg: 'var(--purple-bg)',  border: 'var(--purple-border)' },
};

const RATING_COLORS = {
  strong:  'var(--teal)',
  partial: 'var(--yellow)',
  miss:    'var(--text-muted)',
};

export function CodeBrowser({ onSelectModule, unlocked, onUnlock, onOpenArticle }) {
  const modules = codeModules;
  const [trackFilter, setTrackFilter] = useState('all');
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');
  const allProgress = getAllCodeProgress();

  const diffCounts = {
    all: modules.length,
    analyst: modules.filter(m => m.difficulty === 'analyst').length,
    senior: modules.filter(m => m.difficulty === 'senior').length,
    staff: modules.filter(m => m.difficulty === 'staff').length,
  };

  const filtered = modules
    .filter(m => trackFilter === 'all' || m.track === trackFilter)
    .filter(m => diffFilter === 'all' || m.difficulty === diffFilter);

  const sqlCount    = modules.filter(m => m.track === 'sql').length;
  const pythonCount = modules.filter(m => m.track === 'python').length;
  const doneCount   = Object.keys(allProgress).length;

  const completedIds = new Set(Object.keys(allProgress));
  const firstUnstartedId = modules.find(m => !completedIds.has(m.id))?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Mobile notice — Code Room requires desktop */}
      <div style={{
        display: typeof window !== 'undefined' && window.innerWidth < 768 ? 'flex' : 'none',
        alignItems: 'center', gap: '0.6rem',
        background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
        borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', marginBottom: '1.25rem',
        fontSize: '0.78rem', color: 'var(--yellow-text)', lineHeight: 1.5,
      }}>
        <span>This room runs live code and is optimised for desktop. For the best experience, open on a laptop or tablet.</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--yellow)', marginBottom: '0.4rem' }}>
          Code Room
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.6rem', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          Analytics code in product context.
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '560px', margin: '0 0 1.25rem' }}>
          SQL and Python are not the bar in product analytics interviews — the bar is whether you can translate a business question into the right query without being told what to look for. Most candidates can write syntactically correct SQL; what trips them is the analytical reasoning underneath: which table, which grain, which join, and what does the output actually mean for the decision. Every module here starts with the product situation, not the schema.
        </p>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: `${sqlCount} SQL modules`, color: 'var(--teal)' },
            { label: `${pythonCount} Python modules`, color: 'var(--purple)' },
            { label: `${doneCount} completed`, color: 'var(--text-muted)' },
          ].map(s => (
            <div key={s.label} style={{ fontSize: '0.78rem', fontWeight: 700, color: s.color }}>{s.label}</div>
          ))}
        </div>
      </div>

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

      {/* Difficulty filter chips */}
      {!theoryActive && (
        <DifficultyChips value={diffFilter} onChange={setDiffFilter} counts={diffCounts} />
      )}

      {/* Track filter */}
      {!theoryActive && (
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[['all', 'All modules'], ['sql', 'SQL'], ['python', 'Python']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTrackFilter(key)}
            style={{
              background: trackFilter === key ? 'var(--yellow-bg)' : 'var(--surface-2)',
              border: `1.5px solid ${trackFilter === key ? 'var(--yellow-border)' : 'var(--border)'}`,
              color: trackFilter === key ? 'var(--yellow)' : 'var(--text-muted)',
              borderRadius: 'var(--radius)',
              padding: '0.35rem 0.9rem',
              fontSize: '0.78rem', fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.1s',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      )}

      {/* Module cards */}
      {!theoryActive && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '1rem' }}>
        {filtered.map((module, index) => {
          const progress    = allProgress[module.id];
          const isLocked    = !module.isFree && !unlocked;
          const trackCfg    = TRACK_CONFIG[module.track] || TRACK_CONFIG.sql;
          const diffCfg     = DIFF_CONFIG[module.difficulty] || DIFF_CONFIG.analyst;
          const ratingColor = progress ? (RATING_COLORS[progress.rating] || 'var(--text-muted)') : null;
          const ratingLabel = progress?.rating === 'strong' ? 'Nailed it' : progress?.rating === 'partial' ? 'Close enough' : progress?.rating === 'miss' ? 'Needs review' : null;
          const isNextUnstarted = module.id === firstUnstartedId;

          return (
            <div
              key={module.id}
              className="pal-card-enter pal-card-hover"
              onClick={() => isLocked ? onUnlock() : onSelectModule(module.id)}
              style={{
                animationDelay: (Math.min(index * 28, 400)) + 'ms',
                background: 'var(--surface)',
                border: '1.5px solid ' + (progress ? 'var(--border)' : 'var(--border-subtle)'),
                borderLeft: isNextUnstarted ? '3px solid var(--teal)' : ('1.5px solid ' + (progress ? 'var(--border)' : 'var(--border-subtle)')),
                borderRadius: 'var(--radius)',
                padding: '1.1rem 1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.12s, transform 0.1s',
                display: 'flex', flexDirection: 'column', gap: '0.6rem',
                opacity: isLocked ? 0.6 : 1,
                position: 'relative',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = isLocked ? 'var(--border)' : 'var(--yellow-border)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = progress ? 'var(--border)' : 'var(--border-subtle)'; }}
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
              {/* Track + difficulty badges */}
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: trackCfg.color, background: trackCfg.bg, border: `1px solid ${trackCfg.border}`,
                  borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.45rem',
                }}>
                  {trackCfg.label}
                </span>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
                  borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.45rem',
                }}>
                  {diffCfg.label}
                </span>
                {module.isFree && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--yellow)', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.45rem' }}>
                    Free
                  </span>
                )}
                {isLocked && (
                  <span style={{ fontSize: '0.75rem', marginLeft: 'auto' }}>🔒</span>
                )}
              </div>

              {/* Title + subtitle */}
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: '0.2rem' }}>
                  {module.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{module.subtitle}</div>
              </div>

              {/* Scenario context snippet */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {module.scenario.context.length > 110
                  ? module.scenario.context.slice(0, 110) + '…'
                  : module.scenario.context}
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {(module.tags || []).slice(0, 3).map(tag => (
                  <span key={tag} style={{
                    fontSize: '0.68rem', fontWeight: 600,
                    color: 'var(--text-muted)', background: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Progress indicator */}
              {progress && ratingLabel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', paddingTop: '0.2rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ratingColor, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: ratingColor }}>
                    {ratingLabel}
                  </span>
                </div>
              )}
            </div>
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
            {FOUNDATION_DOMAINS['code'].articles.map(a => (
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
