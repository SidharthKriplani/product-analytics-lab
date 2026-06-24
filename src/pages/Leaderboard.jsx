import { useState, useEffect } from 'react';
import { fetchLeaderboard, computeTotalSolved, getDisplayName } from '../utils/leaderboard.js';
import { supabase } from '../utils/supabase.js';

function rankColor(rank) {
  if (rank === 1) return '#f5c518'; // gold
  if (rank === 2) return '#c0c5ce'; // silver
  if (rank === 3) return '#cd7f32'; // bronze
  return 'var(--text-muted)';
}

export function Leaderboard({ user, onOpenProfile }) {
  const [rows, setRows] = useState(null); // null = loading
  const [error, setError] = useState(false);

  // Navigate to a user's public profile. Prefer the app helper (keeps history
  // + tracking consistent); fall back to a hash change so the link still works
  // if the prop is not passed.
  function openProfile(userId) {
    if (!userId) return;
    if (onOpenProfile) onOpenProfile(userId);
    else window.location.hash = '#/u/' + userId;
  }

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard(100).then(data => {
      if (cancelled) return;
      if (data === null) setError(true);
      setRows(data || []);
    });
    return () => { cancelled = true; };
  }, []);

  const myIndex = (rows && user) ? rows.findIndex(r => r.user_id === user.id) : -1;
  const myRank = myIndex >= 0 ? myIndex + 1 : null;
  const myTotal = myIndex >= 0 ? rows[myIndex].total_solved : (user ? computeTotalSolved() : 0);

  return (
    <div className="pal-page-enter" style={{ maxWidth: '720px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
          Leaderboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
          Ranked by total problems and modules solved across every room. Sign in to appear here.
        </p>
      </div>

      {/* Your standing */}
      {user && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '0.9rem 1.1rem', marginBottom: '1.25rem',
          background: 'var(--teal-bg, rgba(20,184,166,0.08))',
          border: '1px solid var(--teal-border, rgba(20,184,166,0.3))',
          borderRadius: '12px',
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Your standing</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal)' }}>{myRank ? '#' + myRank : '—'}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rank</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{myTotal}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Solved</div>
            </div>
          </div>
        </div>
      )}

      {/* Board */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {rows === null ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Loading the board…
          </div>
        ) : error || !supabase ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            The leaderboard isn't available right now.
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No one's on the board yet. Solve a problem to claim the top spot.
          </div>
        ) : (
          rows.map((r, i) => {
            const rank = i + 1;
            const isMe = user && r.user_id === user.id;
            return (
              <div
                key={r.user_id}
                className="pal-card-enter"
                style={{
                  animationDelay: Math.min(i * 14, 320) + 'ms',
                  display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr) auto',
                  alignItems: 'center', gap: '0.75rem',
                  padding: '0.7rem 1.1rem',
                  borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                  background: isMe ? 'var(--teal-bg, rgba(20,184,166,0.08))' : 'transparent',
                }}
              >
                <span style={{ fontSize: rank <= 3 ? '1rem' : '0.85rem', fontWeight: 800, color: rankColor(rank), textAlign: 'center' }}>
                  {rank}
                </span>
                <button
                  type="button"
                  onClick={() => openProfile(r.user_id)}
                  title={'View ' + r.display_name + '\'s profile'}
                  style={{
                    fontSize: '0.9rem', fontWeight: isMe ? 700 : 500, color: 'var(--text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    background: 'none', border: 'none', padding: 0, margin: 0,
                    textAlign: 'left', cursor: 'pointer', font: 'inherit', minWidth: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.textDecoration = 'none'; }}
                >
                  {r.display_name}{isMe ? ' (you)' : ''}
                </button>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                  {r.total_solved}
                </span>
              </div>
            );
          })
        )}
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.9rem', textAlign: 'center' }}>
        Your score updates when you sign in and as you practice. Names come from your Google or GitHub sign-in.
      </p>
    </div>
  );
}
