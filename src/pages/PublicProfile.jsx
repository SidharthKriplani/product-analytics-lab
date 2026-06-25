import { useState, useEffect } from 'react';
import { fetchPublicProfile, fetchLeaderboard } from '../utils/leaderboard.js';
import { supabase } from '../utils/supabase.js';
import { CompanyLogo } from '../components/shared/CompanyLogo.jsx';

// Friendly labels for the room_breakdown chips (keyed by the short ids written
// by computeRoomBreakdown() in utils/leaderboard.js). Unknown ids fall back to
// the raw id, so adding a room never breaks rendering.
const ROOM_LABELS = {
  stats: 'Stats',
  metrics: 'Metrics',
  rca: 'RCA',
  cases: 'Cases',
  review: 'Review',
  growth: 'Growth',
  challenges: 'Challenges',
  bi: 'BI',
  'spot-the-flaw': 'Spot the Flaw',
  'take-home': 'Take-Home',
  instrumentation: 'Instrumentation',
  behavioral: 'Behavioral',
  'full-loop': 'Full Loop',
  estimation: 'Estimation',
  'stats-foundations': 'Stats Foundations',
  'metrics-foundations': 'Metrics Foundations',
  'rca-foundations': 'RCA Foundations',
  'exp-foundations': 'Exp Foundations',
  prioritization: 'Prioritization',
  'sql-lab': 'SQL Lab',
  'product-design': 'Product Design',
};

const MEDAL = {
  1: { color: '#E0B341', label: 'Gold' },
  2: { color: '#AEB6BF', label: 'Silver' },
  3: { color: '#C77B3B', label: 'Bronze' },
};

function roomLabel(id) {
  return ROOM_LABELS[id] || id;
}

function initialsFromName(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]).join('').toUpperCase() || '?';
}

function memberSince(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
}

// Compact relative "last active" label, e.g. "just now", "5m ago", "3h ago",
// "2d ago", "3w ago". Falls back to a month/year date past ~5 weeks.
function timeAgo(iso) {
  if (!iso) return null;
  let then;
  try { then = new Date(iso).getTime(); } catch { return null; }
  if (!then || Number.isNaN(then)) return null;
  const secs = Math.floor((Date.now() - then) / 1000);
  if (secs < 0) return 'just now';
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  const wks = Math.floor(days / 7);
  if (wks < 5) return wks + 'w ago';
  return memberSince(iso);
}

export function PublicProfile({ userId, onNavigate }) {
  const [profile, setProfile] = useState(undefined); // undefined = loading, null = not found
  const [standing, setStanding] = useState(null); // { rank, total, board } | null
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProfile(undefined);
    setStanding(null);
    setError(false);
    if (!userId) { setProfile(null); return; }

    // Fetch the profile row and the board in parallel; the board gives us rank
    // + gap context without needing any new columns (works pre-migration).
    Promise.all([fetchPublicProfile(userId), fetchLeaderboard(200)]).then(([data, board]) => {
      if (cancelled) return;
      if (data === null && !supabase) setError(true);
      setProfile(data);
      if (data && Array.isArray(board) && board.length) {
        const idx = board.findIndex(r => r.user_id === userId);
        if (idx !== -1) setStanding({ rank: idx + 1, total: board.length, board });
      }
    });
    return () => { cancelled = true; };
  }, [userId]);

  const back = () => { if (onNavigate) onNavigate('leaderboard'); };

  return (
    <div className="pal-page-enter" style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <button
        onClick={back}
        style={{ background: 'none', border: 'none', padding: 0, marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
      >
        &larr; Back to leaderboard
      </button>

      {profile === undefined ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Loading profile…
        </div>
      ) : profile === null ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {error
            ? 'Profiles are not available right now.'
            : 'This profile is not on the leaderboard yet.'}
        </div>
      ) : (
        <Profile profile={profile} standing={standing} />
      )}
    </div>
  );
}

function StatTile({ value, label, sub, color }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.1rem 1.2rem', flex: '1 1 150px', minWidth: 0 }}>
      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: color || 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  );
}

function Profile({ profile, standing }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const since = memberSince(profile.updated_at);
  const lastActive = timeAgo(profile.last_active_at) || (since ? since : null);
  const breakdown = profile.room_breakdown && typeof profile.room_breakdown === 'object'
    ? Object.entries(profile.room_breakdown).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])
    : [];
  const maxCount = breakdown.length ? Math.max(...breakdown.map(([, n]) => n)) : 0;

  const rank = standing?.rank;
  const total = standing?.total;
  const medal = rank ? MEDAL[rank] : null;
  const accentRing = medal ? medal.color : 'var(--accent)';

  // Gap-to-next (or lead, if #1) — engaging context that needs no migration.
  let gapValue = null, gapLabel = null;
  if (standing && standing.board && rank) {
    const b = standing.board;
    if (rank > 1) {
      const ahead = b[rank - 2];
      const diff = (ahead?.total_solved ?? 0) - (profile.total_solved ?? 0);
      gapValue = diff > 0 ? '+' + diff : '0';
      gapLabel = 'to catch #' + (rank - 1);
    } else {
      const next = b[1];
      const lead = (profile.total_solved ?? 0) - (next?.total_solved ?? 0);
      gapValue = '+' + Math.max(lead, 0);
      gapLabel = b.length > 1 ? 'ahead of #2' : 'on the board';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Hero identity card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {profile.avatar_url && !avatarFailed ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || 'avatar'}
                onError={() => setAvatarFailed(true)}
                style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  objectFit: 'cover', border: '2.5px solid ' + accentRing,
                }}
              />
            ) : (
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--accent-bg, var(--surface-2))', border: '2.5px solid ' + accentRing,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)',
              }}>
                {initialsFromName(profile.display_name)}
              </div>
            )}
            {medal && (
              <div title={medal.label} style={{
                position: 'absolute', bottom: '-4px', right: '-4px',
                width: '24px', height: '24px', borderRadius: '50%',
                background: medal.color, color: '#1a1a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 900, border: '2px solid var(--surface)',
              }}>
                {rank}
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.display_name}
            </div>
            {(profile.current_role || profile.current_company) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.2rem', minWidth: 0 }}>
                {profile.current_company && (
                  <CompanyLogo company={profile.current_company} size={18} />
                )}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile.current_role || 'Analyst'}
                  {profile.current_company ? ' at ' + profile.current_company : ''}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
              {rank && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.78rem', fontWeight: 700, color: medal ? medal.color : 'var(--accent)',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: '999px', padding: '0.15rem 0.6rem',
                }}>
                  Rank #{rank}{total ? ' of ' + total : ''}
                </span>
              )}
              {lastActive && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active {lastActive}</span>
              )}
            </div>
          </div>
        </div>

        {profile.linkedin_url && (
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.2rem' }}>
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: 'var(--accent-bg, var(--surface-2))', border: '1px solid var(--accent-border, var(--border))', borderRadius: '8px',
                  padding: '0.5rem 0.95rem', fontSize: '0.82rem', fontWeight: 700,
                  color: 'var(--accent)', textDecoration: 'none',
                }}
              >
                View LinkedIn &rarr;
              </a>
            )}
            {/* Résumé link ARCHIVED (résumé feature parked). */}
          </div>
        )}
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <StatTile value={profile.total_solved ?? 0} label="Solved" sub="problems + modules" color="var(--accent)" />
        {rank && <StatTile value={'#' + rank} label="Rank" sub={total ? 'of ' + total + ' analysts' : null} color={medal ? medal.color : 'var(--text)'} />}
        {gapValue !== null && <StatTile value={gapValue} label="Standing" sub={gapLabel} />}
      </div>

      {/* Room breakdown (only if present — populated once the migration runs) */}
      {breakdown.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.3rem 1.4rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Where they practice
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {breakdown.map(([id, n]) => (
              <div key={id} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 38%) 1fr auto', alignItems: 'center', gap: '0.7rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {roomLabel(id)}
                </span>
                <span style={{ height: '9px', borderRadius: '5px', background: 'var(--surface-2)', overflow: 'hidden', display: 'block' }}>
                  <span style={{
                    display: 'block', height: '100%',
                    width: maxCount ? Math.round((n / maxCount) * 100) + '%' : '0%',
                    background: 'var(--accent)', borderRadius: '5px', transition: 'width 0.5s ease',
                  }} />
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', textAlign: 'right', minWidth: '1.5rem' }}>
                  {n}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
