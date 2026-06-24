import { useState, useEffect } from 'react';
import { GateOverlay } from '../components/shared/GateOverlay.jsx';
import { companyTracks, articleTitleMap } from '../data/companyTracks.js';
import { caseTitleMap } from '../data/caseIndex.js';

const ROOM_LABELS = {
  'stat-foundations': 'Foundations',
  'stats': 'Stats',
  'metrics': 'Metrics',
  'design': 'Review',
  'browser': 'Review',
  'rca': 'RCA',
  'cases': 'Cases',
  'code': 'Programming Lab',
  'product-design': 'PM Design',
  'prioritization': 'Prioritize',
  'behavioral': 'Behavioral',
  'estimation': 'Estimation',
  'growth-analytics': 'Growth',
  'instrumentation': 'Instrum.',
};

const ROOM_COLORS = {
  'stat-foundations': 'var(--accent)',
  'stats': 'var(--accent)',
  'growth-analytics': 'var(--teal)',
  'rca': 'var(--purple)',
  'metrics': 'var(--green)',
  'cases': 'var(--purple)',
  'code': 'var(--accent)',
  'behavioral': 'var(--yellow)',
  'estimation': 'var(--yellow)',
  'product-design': 'var(--purple)',
  'prioritization': 'var(--green)',
  'design': 'var(--accent)',
  'browser': 'var(--accent)',
  'instrumentation': 'var(--teal)',
};

function faviconUrl(domain) {
  return 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=64';
}

function isCaseCompleted(room, id) {
  try {
    const KEY_MAP = {
      'stat-foundations': 'pal-sf-progress-v1',
      'growth-analytics': 'pal-growth-analytics-progress-v1',
      'stats': 'pal-stats-progress-v1',
      'rca': 'pal-rca-progress-v1',
      'metrics': 'pal-metrics-progress-v1',
      'behavioral': 'pal-behavioral-progress-v1',
      'estimation': 'pal-estimation-progress-v1',
      'cases': 'pal-cases-progress-v1',
      'code': 'pal-code-progress-v1',
      'product-design': 'pal-pd-progress-v1',
      'prioritization': 'pal-prioritization-progress-v1',
      'design': 'pal-design-progress-v1',
      'browser': 'pal-scenarios-progress-v1',
    };
    const key = KEY_MAP[room];
    if (!key) return false;
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    return !!data[id];
  } catch { return false; }
}

function getTotalCases(track) {
  return track.caseRefs.reduce((sum, ref) => sum + ref.ids.length, 0);
}

function getCompletedCount(track) {
  return track.caseRefs.reduce((sum, ref) =>
    sum + ref.ids.filter(id => isCaseCompleted(ref.room, id)).length, 0);
}

function getUniqueRooms(track) {
  return [...new Set(track.caseRefs.map(r => r.room))];
}

function RoomBadge({ room }) {
  const label = ROOM_LABELS[room] || room;
  const color = ROOM_COLORS[room] || 'var(--text-muted)';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '999px',
      fontSize: '0.7rem',
      fontWeight: 600,
      color,
      background: 'color-mix(in srgb, ' + color + ' 12%, transparent)',
      border: '1px solid color-mix(in srgb, ' + color + ' 30%, transparent)',
      letterSpacing: '0.02em',
    }}>
      {label}
    </span>
  );
}

function ProgressRing({ done, total, color }) {
  const radius = 17;
  const stroke = 3.5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const pct = total > 0 ? done / total : 0;
  const complete = total > 0 && done === total;
  const ringColor = complete ? 'var(--green)' : (color || 'var(--accent)');
  const offset = circumference * (1 - pct);
  const size = radius * 2;
  // Center label: percentage when partial, check when complete, dash when none started
  const centerLabel = complete ? '✓' : (done === 0 ? '0%' : Math.round(pct * 100) + '%');

  return (
    <div
      style={{ position: 'relative', width: size + 'px', height: size + 'px', flexShrink: 0 }}
      title={done + ' / ' + total + ' cases completed'}
      aria-label={done + ' of ' + total + ' cases completed'}
    >
      <svg width={size} height={size} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        {/* Track background circle */}
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        {pct > 0 && (
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        )}
      </svg>
      <span style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: complete ? '0.72rem' : '0.58rem',
        fontWeight: 700,
        color: complete ? 'var(--green)' : (done === 0 ? 'var(--text-dim)' : ringColor),
        lineHeight: 1,
      }}>
        {centerLabel}
      </span>
    </div>
  );
}

function CompanyAvatar({ track, size }) {
  const sz = size || 44;
  return (
    <div style={{
      width: sz + 'px',
      height: sz + 'px',
      borderRadius: '10px',
      border: '1px solid var(--border)',
      background: 'var(--surface-2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      <img
        src={faviconUrl(track.faviconDomain)}
        alt={track.company}
        style={{ width: Math.round(sz * 0.55) + 'px', height: Math.round(sz * 0.55) + 'px', objectFit: 'contain' }}
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />
    </div>
  );
}

function CompanyCard({ track, onSelect, index }) {
  const rooms = getUniqueRooms(track);
  const totalCases = getTotalCases(track);
  const completedCount = getCompletedCount(track);
  const accent = track.color || 'var(--accent)';
  const progressPct = totalCases > 0 ? Math.round((completedCount / totalCases) * 100) : 0;
  const isComplete = totalCases > 0 && completedCount === totalCases;
  const isStarted = completedCount > 0;
  const barColor = isComplete ? 'var(--green)' : accent;

  return (
    <div
      className="pal-card-enter pal-card-hover"
      onClick={() => onSelect(track)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(track); } }}
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        overflow: 'hidden',
        animationDelay: (Math.min((index || 0) * 28, 400)) + 'ms',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'color-mix(in srgb, ' + accent + ' 45%, var(--border))';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Accent top bar — track color */}
      <div style={{
        height: '4px',
        width: '100%',
        background: 'linear-gradient(90deg, ' + accent + ', color-mix(in srgb, ' + accent + ' 35%, transparent))',
        flexShrink: 0,
      }} />

      <div style={{ padding: '1.4rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem', flex: 1 }}>
        {/* Header: logo + name/role + progress ring */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <CompanyAvatar track={track} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
              {track.company}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.45rem' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 9px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: accent,
                background: 'color-mix(in srgb, ' + accent + ' 13%, transparent)',
                border: '1px solid color-mix(in srgb, ' + accent + ' 28%, transparent)',
                letterSpacing: '0.01em',
                lineHeight: 1.3,
              }}>
                {track.roleLabel || track.role}
              </span>
              {track.comingSoonRoles && track.comingSoonRoles.length > 0 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                  +{track.comingSoonRoles.length} more soon
                </span>
              )}
            </div>
          </div>
          <ProgressRing done={completedCount} total={totalCases} color={accent} />
        </div>

        {/* Description */}
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          {track.description}
        </p>

        {/* Room badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {rooms.map(room => <RoomBadge key={room} room={room} />)}
        </div>

        {/* Progress bar — completion at a glance */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {isComplete ? 'Completed' : (isStarted ? 'In progress' : 'Not started')}
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isComplete ? 'var(--green)' : (isStarted ? 'var(--text)' : 'var(--text-dim)') }}>
              {completedCount} / {totalCases} cases
            </span>
          </div>
          <div style={{ height: '7px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: progressPct + '%',
              background: barColor,
              borderRadius: '999px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Meta row: cases · hours · articles */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.55rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
          <span style={{ fontWeight: 600 }}>{totalCases} cases</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span style={{ fontWeight: 600 }}>{track.estimatedHours}h</span>
          {track.playbookArticles?.length > 0 && (
            <>
              <span style={{ opacity: 0.5 }}>·</span>
              <span style={{ fontWeight: 600 }}>{track.playbookArticles.length} articles</span>
            </>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={e => { e.stopPropagation(); onSelect(track); }}
          style={{
            background: isComplete ? 'var(--green)' : accent,
            color: '#ffffff',
            border: 'none',
            borderRadius: '9px',
            padding: '0.7rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'opacity 0.15s ease, filter 0.15s ease',
            marginTop: 'auto',
          }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.07)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
        >
          {isComplete ? 'Review Track →' : (isStarted ? 'Continue Prep →' : 'Start Prep Track →')}
        </button>
      </div>
    </div>
  );
}

function MentalModelSection({ label, children }) {
  return (
    <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function MentalModelCard({ model }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderLeft: '3px solid var(--teal)',
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '1.5rem',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border-subtle)' : 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
      >
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Meesho Mental Model
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{open ? '↑ collapse' : '↓ expand'}</span>
      </button>

      {open && (
        <>
          <MentalModelSection label="North Star">
            <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.65, margin: 0 }}>
              {model.northStar}
            </p>
          </MentalModelSection>

          <MentalModelSection label="Reading metrics">
            <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.65, margin: 0 }}>
              {model.lens}
            </p>
          </MentalModelSection>

          <MentalModelSection label="3 MECE drivers">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {model.drivers.map((d, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                    background: 'color-mix(in srgb, var(--teal) 15%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--teal) 30%, transparent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700, color: 'var(--teal)',
                  }}>{i + 1}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6 }}>{d}</span>
                </div>
              ))}
            </div>
          </MentalModelSection>

          <MentalModelSection label="Answer structure">
            <div style={{
              fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.7,
              fontFamily: 'monospace', background: 'var(--surface-2)',
              padding: '0.6rem 0.875rem', borderRadius: '6px',
              border: '1px solid var(--border)',
            }}>
              {model.structure}
            </div>
          </MentalModelSection>

          <div style={{ padding: '0.875rem 1.25rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              Non-negotiable lines
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {model.nonNegotiables.map((line, i) => (
                <div key={i} style={{
                  fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.55,
                  paddingLeft: '0.875rem', borderLeft: '2px solid color-mix(in srgb, var(--teal) 35%, transparent)',
                }}>
                  "{line}"
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DirectorPressureCards({ cards }) {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
        Director / VP Pressure Cards
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
        Round 3 pressure scenarios. Click to reveal the expected direction and closing line.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {cards.map((card, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', flex: 1 }}>
                  {card.prompt}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', flexShrink: 0 }}>
                  {isOpen ? '↑' : '↓'}
                </span>
              </button>
              {isOpen && (
                <div style={{
                  padding: '0 1rem 0.875rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}>
                  <div style={{ paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Expected direction
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}>
                      {card.expected}
                    </div>
                  </div>
                  <div style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: '3px solid var(--accent)',
                    borderRadius: '6px',
                    padding: '0.6rem 0.875rem',
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Closing line
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic' }}>
                      "{card.line}"
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExperimentDesignCards({ cards }) {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
        Experiment Design Cards
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
        Practice the 3-part format: hypothesis, primary metric, guardrails. Click to reveal the expected answer.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {cards.map((card, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', flex: 1 }}>
                  {card.question}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', flexShrink: 0 }}>
                  {isOpen ? '↑' : '↓'}
                </span>
              </button>
              {isOpen && (
                <div style={{
                  padding: '0 1rem 0.875rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}>
                  <div style={{ paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Hypothesis
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}>
                      {card.answerPattern.hypothesis}
                    </div>
                  </div>
                  <div style={{ paddingTop: '0.25rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Primary Metric
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6, fontWeight: 600 }}>
                      {card.answerPattern.primaryMetric}
                    </div>
                  </div>
                  <div style={{ paddingTop: '0.25rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--red)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Guardrails
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                      {card.answerPattern.guardrails.map((g, gi) => (
                        <li key={gi} style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}>
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: '3px solid var(--purple)',
                    borderRadius: '6px',
                    padding: '0.6rem 0.875rem',
                    marginTop: '0.25rem',
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--purple)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Senior Lens
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic' }}>
                      {card.seniorLens}
                    </div>
                  </div>
                  {card.watchOuts && card.watchOuts.length > 0 && (
                    <div style={{ paddingTop: '0.25rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Watch Outs
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        {card.watchOuts.map((w, wi) => (
                          <li key={wi} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SQLPrepCards({ cards, onNavigate }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
        SQL Practice Areas
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
        Meesho-tagged SQL problems across 11 analytics areas. Click to practice in SQL Lab.
      </div>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        {cards.map((card, idx) => {
          const isLast = idx === cards.length - 1;
          return (
            <button
              key={card.sqlId}
              onClick={() => onNavigate('code', card.sqlId)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.7rem 1rem', background: 'none', border: 'none',
                borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '22px', height: '22px', borderRadius: '4px',
                background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0,
              }}>
                {idx + 1}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', flex: 1, lineHeight: 1.4 }}>
                {card.area}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', flexShrink: 0 }}>
                Practice →
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RoleTabs({ activeRole, comingSoonRoles }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '0.78rem',
        fontWeight: 600,
        background: 'var(--accent)',
        color: '#fff',
        border: '1px solid var(--accent)',
      }}>
        {activeRole}
      </div>
      {comingSoonRoles.map(role => (
        <div key={role} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '4px 12px',
          borderRadius: '999px',
          fontSize: '0.78rem',
          fontWeight: 500,
          background: 'transparent',
          color: 'var(--text-dim)',
          border: '1px solid var(--border)',
        }}>
          {role}
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            color: 'var(--text-dim)',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '1px 4px',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}>
            Soon
          </span>
        </div>
      ))}
    </div>
  );
}

function TrackDetail({ track, onBack, onNavigate }) {
  const totalCases = getTotalCases(track);
  const completedCount = getCompletedCount(track);
  const progressPct = totalCases > 0 ? Math.round((completedCount / totalCases) * 100) : 0;
  const defaultLevel = track.availableLevels ? track.availableLevels[0] : null;
  const [selectedLevel, setSelectedLevel] = useState(defaultLevel);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '0.875rem', cursor: 'pointer', padding: '0.5rem 0',
          marginBottom: '1.5rem', fontWeight: 500,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        ← Back to Tracks
      </button>

      {/* Company header card */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.75rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <CompanyAvatar track={track} size={52} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
              {track.company}
            </h1>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {selectedLevel ? selectedLevel + ' ' + track.roleLabel : track.role}
            </div>
          </div>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 1.25rem', lineHeight: 1.7 }}>
          {track.description}
        </p>

        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Progress</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: completedCount > 0 ? 'var(--green)' : 'var(--text-dim)' }}>
              {completedCount} / {totalCases} cases completed
            </span>
          </div>
          <div style={{ height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: progressPct + '%',
              background: progressPct === 100 ? 'var(--green)' : track.color,
              borderRadius: '999px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Role + Level filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {/* Role row */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '0.25rem' }}>Role</span>
          <div style={{
            display: 'inline-flex', alignItems: 'center', padding: '3px 11px',
            borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
            background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)',
          }}>
            {track.roleLabel || track.role}
          </div>
          {(track.comingSoonRoles || []).map(role => (
            <div key={role} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '3px 11px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 500,
              background: 'transparent', color: 'var(--text-dim)', border: '1px solid var(--border)',
            }}>
              {role}
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-dim)', background: 'var(--surface-2)', borderRadius: '3px', padding: '1px 4px' }}>soon</span>
            </div>
          ))}
        </div>
        {/* Level row */}
        {track.availableLevels && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '0.25rem' }}>Level</span>
            {track.availableLevels.map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                style={{
                  display: 'inline-flex', alignItems: 'center', padding: '3px 11px',
                  borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
                  background: selectedLevel === level ? 'var(--teal)' : 'transparent',
                  color: selectedLevel === level ? '#fff' : 'var(--text-muted)',
                  border: selectedLevel === level ? '1px solid var(--teal)' : '1px solid var(--border)',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
              >
                {level}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Completion */}
      {progressPct === 100 && (
        <div style={{
          background: 'var(--green-bg)', border: '1.5px solid var(--green-border)',
          borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.95rem' }}>Track Complete</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              All {totalCases} cases in the {track.company} {track.role} track finished.
            </div>
          </div>
        </div>
      )}

      {/* Mental model */}
      {track.mentalModel && <MentalModelCard model={track.mentalModel} />}

      {/* Practice Cases */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>
        Practice Cases
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {track.caseRefs.map(ref => (
          <div key={ref.room} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', overflow: 'hidden',
          }}>
            <div style={{
              padding: '0.65rem 1rem', background: 'var(--surface-2)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <RoomBadge room={ref.room} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                {ref.ids.filter(id => isCaseCompleted(ref.room, id)).length} / {ref.ids.length} done
              </span>
            </div>
            <div>
              {ref.ids.map((caseId, idx) => {
                const done = isCaseCompleted(ref.room, caseId);
                const isLast = idx === ref.ids.length - 1;
                return (
                  <button
                    key={caseId}
                    onClick={() => onNavigate(ref.room, caseId)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.7rem 1rem', background: 'none', border: 'none',
                      borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <span style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: done ? 'var(--green-bg)' : 'var(--border-subtle)',
                      border: '1.5px solid ' + (done ? 'var(--green)' : 'var(--border)'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.68rem', color: 'var(--green)', flexShrink: 0,
                    }}>
                      {done ? '✓' : ''}
                    </span>
                    <span style={{
                      fontSize: '0.85rem', fontWeight: 500,
                      color: done ? 'var(--text-muted)' : 'var(--text)',
                      flex: 1, lineHeight: 1.4,
                    }}>
                      {caseTitleMap[caseId] || caseId}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', flexShrink: 0 }}>
                      Practice →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Experiment design cards */}
      {track.experimentDesignCards && track.experimentDesignCards.length > 0 && (
        <ExperimentDesignCards cards={track.experimentDesignCards} />
      )}

      {/* SQL prep cards */}
      {track.sqlCards && track.sqlCards.length > 0 && (
        <SQLPrepCards cards={track.sqlCards} onNavigate={onNavigate} />
      )}

      {/* Director pressure cards */}
      {track.directorCards && track.directorCards.length > 0 && (
        <DirectorPressureCards cards={track.directorCards.filter(c => !c.level || c.level === selectedLevel)} />
      )}

      {/* Playbook articles */}
      {track.playbookArticles?.length > 0 && (
        <>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>
            Playbook Articles
          </h2>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', overflow: 'hidden',
          }}>
            {track.playbookArticles.map((articleId, idx) => {
              const isLast = idx === track.playbookArticles.length - 1;
              const articleTitle = articleTitleMap[articleId] || articleId;
              return (
                <button
                  key={articleId}
                  onClick={() => onNavigate('playbook', articleId)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', background: 'none', border: 'none',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', flex: 1, lineHeight: 1.4 }}>
                    {articleTitle}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', flexShrink: 0 }}>
                    Read →
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function CompanyTracks({ onNavigate, onBack, unlocked }) {
  const [view, setView] = useState(() => {
    try { return sessionStorage.getItem('ct-view') || 'grid'; } catch { return 'grid'; }
  });
  const [selectedTrack, setSelectedTrack] = useState(() => {
    try {
      const id = sessionStorage.getItem('ct-track-id');
      return id ? (companyTracks.find(t => t.id === id) || null) : null;
    } catch { return null; }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('ct-view', view);
      sessionStorage.setItem('ct-track-id', selectedTrack?.id || '');
    } catch {}
  }, [view, selectedTrack]);

  function handleSelectTrack(track) {
    setSelectedTrack(track);
    setView('detail');
  }

  function handleBackToGrid() {
    setView('grid');
    setSelectedTrack(null);
  }

  return (
    <div className="pal-page-enter" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {!unlocked && (
        <GateOverlay
          title="Company Tracks"
          body="Curated prep paths calibrated to what specific employers actually test — case selection, question weighting, and difficulty sequencing by company and role."
          ctaLabel="Unlock the full lab →"
          onCTA={() => onNavigate('unlock')}
        />
      )}

      <div style={{
        maxWidth: view === 'detail' ? '800px' : '960px',
        margin: '0 auto',
        padding: '2rem 1.5rem 1.5rem',
      }}>
        {view === 'grid' && (
          <>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  fontSize: '0.875rem', cursor: 'pointer', padding: '0.5rem 0',
                  marginBottom: '1.25rem', fontWeight: 500,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                ← Back
              </button>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)',
                margin: '0 0 0.5rem', letterSpacing: '-0.025em',
              }}>
                Company Tracks
              </h1>
              <p style={{
                fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0,
                lineHeight: 1.6, maxWidth: '580px',
              }}>
                Every company weights the loop differently. Meta DS screens lean heavily on
                experimentation; Airbnb PM loops are dense on product sense and estimation;
                Stripe analyst bars are SQL-first. Company Tracks curates the specific cases
                that matter for your target — by role and company — so your prep time goes
                toward what the actual interviewers are testing.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
                gap: '1.25rem',
              }}
              className="company-tracks-grid"
            >
              {companyTracks.map((track, index) => (
                <CompanyCard
                  key={track.id}
                  track={track}
                  onSelect={handleSelectTrack}
                  index={index}
                />
              ))}
            </div>
          </>
        )}

        {view === 'detail' && selectedTrack && (
          <TrackDetail
            track={selectedTrack}
            onBack={handleBackToGrid}
            onNavigate={onNavigate}
          />
        )}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .company-tracks-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
