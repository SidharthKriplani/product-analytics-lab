import { useState, useEffect } from 'react';
import { fetchPublicProfile } from '../utils/leaderboard.js';
import { supabase } from '../utils/supabase.js';

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

export function PublicProfile({ userId, onNavigate }) {
  const [profile, setProfile] = useState(undefined); // undefined = loading, null = not found
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProfile(undefined);
    setError(false);
    if (!userId) { setProfile(null); return; }
    fetchPublicProfile(userId).then(data => {
      if (cancelled) return;
      if (data === null && !supabase) setError(true);
      setProfile(data);
    });
    return () => { cancelled = true; };
  }, [userId]);

  const back = () => { if (onNavigate) onNavigate('leaderboard'); };

  return (
    <div className="pal-page-enter" style={{ maxWidth: '640px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
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
        <Profile profile={profile} />
      )}
    </div>
  );
}

function Profile({ profile }) {
  const since = memberSince(profile.updated_at);
  const breakdown = profile.room_breakdown && typeof profile.room_breakdown === 'object'
    ? Object.entries(profile.room_breakdown).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])
    : [];
  const maxCount = breakdown.length ? Math.max(...breakdown.map(([, n]) => n)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Identity card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.4rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
            background: 'var(--accent-bg, var(--surface-2))', border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent)',
          }}>
            {initialsFromName(profile.display_name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.display_name}
            </div>
            {since && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Active as of {since}
              </div>
            )}
          </div>
        </div>

        {/* LinkedIn link (only if present) */}
        {profile.linkedin_url && (
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.1rem',
              background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '7px',
              padding: '0.45rem 0.9rem', fontSize: '0.82rem', fontWeight: 700,
              color: 'var(--accent)', textDecoration: 'none',
            }}
          >
            View LinkedIn &rarr;
          </a>
        )}
      </div>

      {/* Total solved */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem 1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
            {profile.total_solved}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            problems and modules solved
          </div>
        </div>
      </div>

      {/* Room breakdown (only if present) */}
      {breakdown.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem 1.4rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.9rem' }}>
            Where they practice
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {breakdown.map(([id, n]) => (
              <div key={id} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 40%) 1fr auto', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {roomLabel(id)}
                </span>
                <span style={{ height: '8px', borderRadius: '4px', background: 'var(--surface-2)', overflow: 'hidden', display: 'block' }}>
                  <span style={{
                    display: 'block', height: '100%',
                    width: maxCount ? Math.round((n / maxCount) * 100) + '%' : '0%',
                    background: 'var(--accent)', borderRadius: '4px',
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
