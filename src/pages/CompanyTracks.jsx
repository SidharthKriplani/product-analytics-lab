import { useState } from 'react';
import { companyTracks } from '../data/companyTracks.js';

const ROOM_LABELS = {
  'stat-foundations': 'Foundations',
  'stats': 'Stats',
  'metrics': 'Metrics',
  'design': 'Design',
  'browser': 'Review',
  'rca': 'RCA',
  'cases': 'Cases',
  'code': 'Code',
  'product-design': 'PM Design',
  'prioritization': 'Prioritize',
  'behavioral': 'Behavioral',
  'estimation': 'Estimation',
  'growth-analytics': 'Growth',
};

const ROOM_COLORS = {
  'stat-foundations': 'var(--accent)',
  'stats': 'var(--accent)',
  'growth-analytics': 'var(--teal)',
  'rca': 'var(--purple)',
  'metrics': 'var(--green)',
  'code': 'var(--blue-text)',
  'behavioral': 'var(--yellow)',
  'estimation': 'var(--orange, #f5a623)',
  'product-design': 'var(--purple)',
  'prioritization': 'var(--green)',
};

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
    };
    const key = KEY_MAP[room];
    if (!key) return false;
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    return !!data[id];
  } catch { return false; }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
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
      background: `color-mix(in srgb, ${color} 12%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      letterSpacing: '0.02em',
    }}>
      {label}
    </span>
  );
}

function getUniqueRooms(track) {
  return [...new Set(track.caseRefs.map(r => r.room))];
}

function getTotalCases(track) {
  return track.caseRefs.reduce((sum, ref) => sum + ref.ids.length, 0);
}

function getCompletedCount(track) {
  return track.caseRefs.reduce((sum, ref) =>
    sum + ref.ids.filter(id => isCaseCompleted(ref.room, id)).length, 0);
}

function CompanyCard({ track, onSelect, index }) {
  const rooms = getUniqueRooms(track);
  const totalCases = getTotalCases(track);
  const completedCount = getCompletedCount(track);
  const isColorDark = track.color === '#000000';

  return (
    <div
      className="pal-card-enter pal-card-hover"
      style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderLeft: `4px solid ${track.color}`,
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      transition: 'box-shadow 0.15s ease, transform 0.15s ease',
      cursor: 'default',
      animationDelay: (Math.min((index || 0) * 28, 400)) + 'ms',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Company header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: `rgba(${hexToRgb(track.color)}, 0.15)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          flexShrink: 0,
        }}>
          {track.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
            {track.company}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Role: {track.role}
          </div>
        </div>
        {completedCount > 0 && completedCount < totalCases && (
          <div style={{
            fontSize: '0.72rem', fontWeight: 600, color: 'var(--green)',
            background: 'var(--green-bg)', border: '1px solid var(--green-border)',
            borderRadius: '999px', padding: '2px 8px', whiteSpace: 'nowrap',
          }}>
            {completedCount}/{totalCases} done
          </div>
        )}
        {completedCount > 0 && completedCount === totalCases && (
          <div style={{
            fontSize: '0.72rem', fontWeight: 700, color: '#fff',
            background: 'var(--green)', border: '1px solid var(--green)',
            borderRadius: '999px', padding: '2px 10px', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
          }}>
            <span>✓</span> Complete
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

      {/* Description */}
      <p style={{
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        margin: 0,
        lineHeight: 1.6,
      }}>
        {track.description}
      </p>

      {/* Room badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {rooms.map(room => (
          <RoomBadge key={room} room={room} />
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {totalCases} cases
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          ⏱ {track.estimatedHours} hours
        </span>
        {track.playbookArticles?.length > 0 && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            📖 {track.playbookArticles.length} articles
          </span>
        )}
      </div>

      {/* CTA button */}
      <button
        onClick={() => onSelect(track)}
        style={{
          background: track.color,
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          padding: '0.6rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          transition: 'opacity 0.15s ease',
          marginTop: 'auto',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        Start Prep Track →
      </button>
    </div>
  );
}

function TrackDetail({ track, onBack, onNavigate }) {
  const totalCases = getTotalCases(track);
  const completedCount = getCompletedCount(track);
  const progressPct = totalCases > 0 ? Math.round((completedCount / totalCases) * 100) : 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          cursor: 'pointer',
          padding: '0.5rem 0',
          marginBottom: '1.5rem',
          fontWeight: 500,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        ← Back to Tracks
      </button>

      {/* Company header */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${track.color}`,
        borderRadius: '12px',
        padding: '1.75rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: `rgba(${hexToRgb(track.color)}, 0.15)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.7rem',
            flexShrink: 0,
          }}>
            {track.emoji}
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
              {track.company}
            </h1>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {track.role}
            </div>
          </div>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 1.25rem', lineHeight: 1.7 }}>
          {track.description}
        </p>

        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Progress
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: completedCount > 0 ? 'var(--green)' : 'var(--text-dim)' }}>
              {completedCount} / {totalCases} cases completed
            </span>
          </div>
          <div style={{
            height: '6px',
            background: 'var(--border)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: progressPct === 100 ? 'var(--green)' : track.color,
              borderRadius: '999px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Completion celebration */}
      {progressPct === 100 && (
        <div style={{
          background: 'var(--green-bg)', border: '1.5px solid var(--green-border)',
          borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.5rem' }}>🎉</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.95rem' }}>
              Track Complete!
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              You've finished all {totalCases} cases in the {track.company} prep track.
            </div>
          </div>
        </div>
      )}

      {/* Cases grouped by room */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>
        Cases by Room
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {track.caseRefs.map(ref => (
          <div key={ref.room} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            {/* Room header */}
            <div style={{
              padding: '0.65rem 1rem',
              background: 'var(--surface-2)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <RoomBadge room={ref.room} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                {ref.ids.filter(id => isCaseCompleted(ref.room, id)).length} / {ref.ids.length} done
              </span>
            </div>
            {/* Case rows */}
            <div>
              {ref.ids.map((caseId, idx) => {
                const done = isCaseCompleted(ref.room, caseId);
                const isLast = idx === ref.ids.length - 1;
                return (
                  <button
                    key={caseId}
                    onClick={() => onNavigate(ref.room, caseId)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.7rem 1rem',
                      background: 'none',
                      border: 'none',
                      borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    {/* Completion indicator */}
                    <span style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: done ? 'var(--green-bg)' : 'var(--border-subtle)',
                      border: `1.5px solid ${done ? 'var(--green)' : 'var(--border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.68rem',
                      color: 'var(--green)',
                      flexShrink: 0,
                    }}>
                      {done ? '✓' : ''}
                    </span>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: done ? 'var(--text-muted)' : 'var(--text)',
                      flex: 1,
                      textDecoration: done ? 'none' : 'none',
                    }}>
                      {caseId}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', flexShrink: 0 }}>
                      Navigate →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Playbook articles */}
      {track.playbookArticles?.length > 0 && (
        <>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>
            📖 Playbook Articles
          </h2>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            {track.playbookArticles.map((articleId, idx) => {
              const isLast = idx === track.playbookArticles.length - 1;
              return (
                <button
                  key={articleId}
                  onClick={() => onNavigate('playbook', articleId)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                >
                  <span style={{ fontSize: '0.9rem' }}>📄</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', flex: 1 }}>
                    {articleId}
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
  const [view, setView] = useState('grid');
  const [selectedTrack, setSelectedTrack] = useState(null);

  function handleSelectTrack(track) {
    setSelectedTrack(track);
    setView('detail');
  }

  function handleBackToGrid() {
    setView('grid');
    setSelectedTrack(null);
  }

  // Company Tracks are fully premium — no free tier
  if (!unlocked) {
    return (
      <div style={{ maxWidth: '480px', margin: '4rem auto', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
          Company Tracks — Full Access Only
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Company-specific prep tracks are part of full access. Enter your access code to unlock them alongside all other premium content.
        </p>
        <button
          onClick={() => onNavigate('unlock')}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '0.6rem 1.5rem',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
          }}
        >
          Enter Access Code →
        </button>
      </div>
    );
  }

  return (
    <div className="pal-page-enter" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Page header */}
      <div style={{
        maxWidth: view === 'detail' ? '800px' : '960px',
        margin: '0 auto',
        padding: '2rem 1.5rem 1.5rem',
      }}>
        {view === 'grid' && (
          <>
            {/* Back button */}
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: '0.5rem 0',
                  marginBottom: '1.25rem',
                  fontWeight: 500,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                ← Back
              </button>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text)',
                margin: '0 0 0.5rem',
                letterSpacing: '-0.025em',
              }}>
                🏢 Company Tracks
              </h1>
              <p style={{
                fontSize: '0.95rem',
                color: 'var(--text-muted)',
                margin: 0,
                lineHeight: 1.6,
                maxWidth: '580px',
              }}>
                Every company weights the loop differently. Meta DS screens lean heavily on experimentation; Airbnb PM loops are dense on product sense and estimation; Stripe analyst bars are SQL-first. Company Tracks curates the specific cases that matter for your target — by role and company — so your prep time goes toward what the actual interviewers are testing, not just whatever is easiest to find.
              </p>
            </div>

            {/* Company grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
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

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 600px) {
          .company-tracks-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
