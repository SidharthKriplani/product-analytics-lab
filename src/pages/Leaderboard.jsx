import { useState, useEffect } from 'react';
import { fetchLeaderboard, computeWeightedScore, getDisplayName } from '../utils/leaderboard.js';
import { supabase } from '../utils/supabase.js';

function rankColor(rank) {
  if (rank === 1) return '#f5c518'; // gold
  if (rank === 2) return '#c0c5ce'; // silver
  if (rank === 3) return '#cd7f32'; // bronze
  return 'var(--text-muted)';
}

// Field benchmark from the already-fetched board rows. Returns null when the board
// is empty (be-the-first state). p90 = the 90th-percentile score (Top 10% threshold).
function computeBenchmark(rows, myScore) {
  if (!rows || rows.length === 0) return null;
  const scores = rows.map(r => r.total_solved || 0).sort((a, b) => a - b);
  const n = scores.length;
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / n);
  // 90th percentile (nearest-rank): the score at the 90% position.
  const p90 = scores[Math.min(n - 1, Math.ceil(0.9 * n) - 1)] || 0;
  // Share of participants strictly below me (how many you're ahead of).
  const below = scores.filter(s => s < myScore).length;
  const aheadPct = n > 0 ? Math.round((below / n) * 100) : 0;
  const max = scores[n - 1] || 0;
  return { avg, p90, aheadPct, max, n };
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
  // Weighted score (harder items worth more) — this is the ranking value.
  const myScore = myIndex >= 0 ? (rows[myIndex].total_solved || 0) : (user ? computeWeightedScore() : 0);
  const bench = (user && rows) ? computeBenchmark(rows, myScore) : null;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '720px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
          Leaderboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
          Ranked by a difficulty-weighted score across every room — harder cases (senior, staff) are worth more than foundational ones. Sign in to appear here.
        </p>
      </div>

      {/* Your standing + field benchmark */}
      {user && (
        <div style={{
          padding: '0.9rem 1.1rem', marginBottom: '1.25rem',
          background: 'var(--teal-bg, rgba(20,184,166,0.08))',
          border: '1px solid var(--teal-border, rgba(20,184,166,0.3))',
          borderRadius: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Your standing</div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal)' }}>{myRank ? '#' + myRank : '—'}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rank</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{myScore}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score</div>
              </div>
            </div>
          </div>

          {/* Field benchmark — computed from the fetched board rows */}
          {bench && (
            <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--teal-border, rgba(20,184,166,0.25))' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, var(--text-muted))', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--text)' }}>You: {myScore}</strong>
                {' · '}Field avg: <strong style={{ color: 'var(--text)' }}>{bench.avg}</strong>
                {' · '}Top 10%: <strong style={{ color: 'var(--text)' }}>{bench.p90}</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 600, marginBottom: '0.6rem' }}>
                Ahead of {bench.aheadPct}% of participants
              </div>
              {/* Marker bar — You vs Avg vs Top-10% along the field's 0..max range */}
              {bench.max > 0 && (() => {
                const clamp = v => Math.max(0, Math.min(100, (v / bench.max) * 100));
                const youPct = clamp(myScore), avgPct = clamp(bench.avg), p90Pct = clamp(bench.p90);
                return (
                  <div style={{ position: 'relative', height: '30px' }}>
                    <div style={{ position: 'absolute', top: '13px', left: 0, right: 0, height: '4px', background: 'var(--surface-2, rgba(0,0,0,0.08))', borderRadius: '2px' }} />
                    {/* Avg marker */}
                    <div title={'Field avg: ' + bench.avg} style={{ position: 'absolute', top: '9px', left: 'calc(' + avgPct + '% - 1px)', width: '2px', height: '12px', background: 'var(--text-muted)' }} />
                    {/* Top-10% marker */}
                    <div title={'Top 10%: ' + bench.p90} style={{ position: 'absolute', top: '9px', left: 'calc(' + p90Pct + '% - 1px)', width: '2px', height: '12px', background: 'var(--text-secondary, var(--text-muted))' }} />
                    {/* You marker */}
                    <div title={'You: ' + myScore} style={{ position: 'absolute', top: '7px', left: 'calc(' + youPct + '% - 6px)', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--teal)', border: '2px solid var(--surface)', boxShadow: '0 0 0 1px var(--teal)' }} />
                    <span style={{ position: 'absolute', bottom: 0, left: 0, fontSize: '0.58rem', color: 'var(--text-dim, var(--text-muted))' }}>0</span>
                    <span style={{ position: 'absolute', bottom: 0, right: 0, fontSize: '0.58rem', color: 'var(--text-dim, var(--text-muted))' }}>{bench.max}</span>
                  </div>
                );
              })()}
            </div>
          )}
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
