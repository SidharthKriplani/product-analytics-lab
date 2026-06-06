import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { challengesCases } from '../data/challengesCases.js';
import { getAllChallengesProgress } from '../utils/challengesProgress.js';

const DIFF_CFG = {
  senior: { label: 'Senior', color: 'var(--yellow)',  bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
  staff:  { label: 'Staff',  color: 'var(--red)',     bg: 'var(--red-bg)',     border: 'var(--red-border)' },
};

const RATING_COLOR = {
  strong:  'var(--green)',
  partial: 'var(--yellow)',
  miss:    'var(--red)',
};

const ROOM_LABEL = {
  'stats':           'Statistics',
  'rca':             'RCA',
  'metrics':         'Metrics',
  'growth-analytics':'Growth',
  'product-design':  'Product Design',
  'estimation':      'Estimation',
  'code':            'SQL / Code',
};

const ROOM_COLOR = {
  'stats':            { color: 'var(--accent)',    bg: 'var(--accent-bg)',    border: 'var(--accent-border)' },
  'rca':              { color: 'var(--purple)',    bg: 'var(--purple-bg)',    border: 'var(--purple-border)' },
  'metrics':          { color: 'var(--green)',     bg: 'var(--green-bg)',     border: 'var(--green-border)' },
  'growth-analytics': { color: 'var(--teal)',      bg: 'var(--teal-bg)',      border: 'var(--teal-border)' },
  'product-design':   { color: 'var(--purple)',    bg: 'var(--purple-bg)',    border: 'var(--purple-border)' },
  'estimation':       { color: 'var(--yellow)',    bg: 'var(--yellow-bg)',    border: 'var(--yellow-border)' },
  'code':             { color: 'var(--blue-text)', bg: 'var(--blue-bg)',      border: 'var(--blue-border)' },
};

// Sort: senior first, then staff
const sortedCases = [...challengesCases].sort((a, b) => {
  const order = { senior: 0, staff: 1 };
  return (order[a.difficulty] ?? 9) - (order[b.difficulty] ?? 9);
});

export function ChallengesBrowser({ onSelectChallenge, unlocked }) {
  const allProgress = getAllChallengesProgress();
  const completedCount = Object.keys(allProgress).length;
  const [hoveredId, setHoveredId] = useState(null);
  const [filterDiff, setFilterDiff] = useState('all');

  const seniorCount = sortedCases.filter(c => c.difficulty === 'senior').length;
  const staffCount = sortedCases.filter(c => c.difficulty === 'staff').length;

  const filteredCases = filterDiff === 'all'
    ? sortedCases
    : sortedCases.filter(c => c.difficulty === filterDiff);

  const completedIds = new Set(Object.keys(allProgress));
  const firstUnstartedId = sortedCases.find(c => !completedIds.has(c.id))?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name='zap' size={18} color='var(--yellow)' />
          </span>
          <div>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--yellow)', marginBottom: '0.15rem',
            }}>
              Cross-Room
            </div>
            <h1 style={{
              fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)',
              margin: 0, letterSpacing: '-0.02em',
            }}>
              Challenges
            </h1>
          </div>
        </div>

        <p style={{
          color: 'var(--text-muted)', fontSize: '0.95rem',
          margin: '0 0 0.75rem', maxWidth: '640px', lineHeight: 1.6,
        }}>
          The hardest interview questions are not harder versions of a single-room question — they are moments where two problems are happening at once and you have to hold both. An SRM during a live experiment that is also showing a metric drop. A product decision that requires sizing, metric design, and an RCA on why the current metric is misleading. Staff+ loops are built around exactly these scenarios because they reveal whether you have been practicing domains in isolation or can actually operate across them.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            6 challenges
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            Senior–Staff difficulty
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            20–30 min each
          </span>
          {completedCount > 0 && (
            <span style={{ fontSize: '0.82rem', color: 'var(--red)' }}>
              {completedCount} completed
            </span>
          )}
        </div>
      </div>

      {/* Difficulty filter bar */}
      <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all',    label: 'All (' + (seniorCount + staffCount) + ')',  activeColor: 'var(--text)',   activeBg: 'var(--surface-2)',  activeBorder: 'var(--border-strong)' },
          { key: 'senior', label: 'Senior (' + seniorCount + ')',              activeColor: 'var(--yellow)', activeBg: 'var(--yellow-bg)',  activeBorder: 'var(--yellow-border)' },
          { key: 'staff',  label: 'Staff (' + staffCount + ')',                activeColor: 'var(--red)',    activeBg: 'var(--red-bg)',     activeBorder: 'var(--red-border)' },
        ].map(f => {
          const active = filterDiff === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilterDiff(f.key)}
              style={{
                padding: '0.32rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid ' + (active ? f.activeBorder : 'var(--border)'),
                background: active ? f.activeBg : 'none',
                color: active ? f.activeColor : 'var(--text-muted)',
                fontWeight: active ? 700 : 400,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'background 0.12s, border-color 0.12s, color 0.12s',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Challenge grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(400px, 100%), 1fr))',
        gap: '1rem',
      }}>
        {filteredCases.map((c, index) => {
          const prog = allProgress[c.id];
          const isLocked = !c.isFree && !unlocked;
          const diffCfg = DIFF_CFG[c.difficulty] || DIFF_CFG.senior;
          const isHovered = hoveredId === c.id;
          const isNextUnstarted = c.id === firstUnstartedId;

          return (
            <div
              key={c.id}
              className="pal-card-enter pal-card-hover"
              role="button"
              tabIndex={0}
              onClick={() => onSelectChallenge(c.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectChallenge(c.id);
                }
              }}
              onMouseEnter={() => setHoveredId(c.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                animationDelay: String(Math.min(index * 28, 400)) + 'ms',
                background: 'var(--surface)',
                border: '1px solid ' + (isHovered ? 'var(--red-border)' : 'var(--border)'),
                borderLeft: isNextUnstarted ? '3px solid var(--red)' : ('1px solid ' + (isHovered ? 'var(--red-border)' : 'var(--border)')),
                borderRadius: '10px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                opacity: isLocked ? 0.7 : 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: isHovered ? '0 2px 12px rgba(220,38,38,0.08)' : 'none',
                position: 'relative',
              }}
            >
              {isNextUnstarted && (
                <span style={{
                  position: 'absolute', top: '0.6rem', right: '0.7rem',
                  fontSize: '0.68rem', fontWeight: 700,
                  color: 'var(--red)', background: 'var(--red-bg)',
                  border: '1px solid var(--red-border)',
                  borderRadius: 4, padding: '0.1rem 0.4rem',
                }}>
                  Next →
                </span>
              )}
              {/* Top row: ID + badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {c.id}
                </span>

                <span style={{
                  fontSize: '0.7rem', fontWeight: 600,
                  color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
                  borderRadius: '4px', padding: '0.1rem 0.4rem',
                }}>
                  {diffCfg.label}
                </span>

                <span style={{
                  fontSize: '0.7rem', fontWeight: 500,
                  color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
                  borderRadius: '4px', padding: '0.1rem 0.4rem',
                }}>
                  {c.company}
                </span>

                <span style={{
                  fontSize: '0.7rem', color: 'var(--text-dim)',
                  marginLeft: 'auto', flexShrink: 0,
                }}>
                  ~{c.estimatedMin} min
                </span>

                {c.isFree && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)',
                    borderRadius: '4px', padding: '0.1rem 0.4rem',
                  }}>
                    Free
                  </span>
                )}

                {isLocked && <span style={{ fontSize: '0.8rem' }}>🔒</span>}

                {prog && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    color: RATING_COLOR[prog.rating] || 'var(--red)',
                  }}>
                    ✓
                  </span>
                )}
              </div>

              {/* Title + subtitle */}
              <div>
                <div style={{
                  fontWeight: 700, fontSize: '1rem', color: 'var(--text)',
                  marginBottom: '0.2rem', lineHeight: 1.3,
                }}>
                  {c.title}
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {c.subtitle}
                </div>
              </div>

              {/* Room badges */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {c.rooms.map(room => {
                  const rc = ROOM_COLOR[room] || { color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border)' };
                  return (
                    <span key={room} style={{
                      fontSize: '0.68rem', fontWeight: 600,
                      color: rc.color, background: rc.bg, border: `1px solid ${rc.border}`,
                      borderRadius: '4px', padding: '0.15rem 0.45rem',
                    }}>
                      {ROOM_LABEL[room] || room}
                    </span>
                  );
                })}
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {c.tags.slice(0, 4).map(tag => (
                  <span key={tag} style={{
                    fontSize: '0.68rem', color: 'var(--text-dim)',
                    background: 'var(--surface-2)', borderRadius: '4px',
                    padding: '0.1rem 0.4rem', border: '1px solid var(--border-subtle)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.25rem' }}>
                {prog ? (
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: RATING_COLOR[prog.rating] || 'var(--teal)',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '0.3rem 0.7rem',
                  }}>
                    {prog.rating === 'strong' ? '✓ Nailed it' : prog.rating === 'partial' ? '~ Close' : '✗ Revisit'}
                  </span>
                ) : (
                  <span />
                )}

                <button
                  onClick={e => { e.stopPropagation(); onSelectChallenge(c.id); }}
                  style={{
                    background: isHovered ? 'var(--red-bg)' : 'transparent',
                    border: `1px solid ${isHovered ? 'var(--red-border)' : 'var(--border)'}`,
                    color: isHovered ? 'var(--red)' : 'var(--text-muted)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.78rem', fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
                  }}
                >
                  Start Challenge →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
