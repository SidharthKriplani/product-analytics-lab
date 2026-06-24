import { useState, useEffect } from 'react';
import { computeTotalSolved } from '../../utils/leaderboard.js';
import { Icon } from './Icon.jsx';

// Capture-at-investment sign-in nudge (PRODUCT-DESIGN.md Part 3).
//
// PAL is value-first: no signup wall, all progress lives in localStorage. The
// fix for the "ghost user" problem is ONE optional, benefit-framed capture
// moment at the point of investment — once a logged-out user has invested
// (solved a few across any room), gently offer to sign in and SAVE that
// progress + streak. Email is implicit via OAuth, so there is no separate ask.
//
// This is NEVER a wall and is always dismissible.
//   * Only renders for LOGGED-OUT users (if `user`, render nothing).
//   * Only appears once the user has invested: total solved >= THRESHOLD.
//   * Dismiss is per-session (sessionStorage) — we never nag twice in one
//     session. It politely re-shows next session until they sign in, with a
//     softer line after they've dismissed it before (escalates gently, not
//     louder). A localStorage counter remembers how many sessions they have
//     dismissed so the copy can soften rather than repeat.
//
// Total solved is computed from localStorage via computeTotalSolved() — the
// SAME predicate the Progress page and leaderboard use, so the count matches
// what the user sees elsewhere.

const THRESHOLD            = 3;
const SESSION_DISMISS_KEY  = 'pal-capture-dismissed-v1';   // per-session: don't nag twice this session
const DISMISS_COUNT_KEY    = 'pal-capture-dismiss-count-v1'; // across sessions: soften copy after first dismiss

function readDismissCount() {
  try {
    const n = parseInt(localStorage.getItem(DISMISS_COUNT_KEY) || '0', 10);
    return Number.isFinite(n) ? n : 0;
  } catch { return 0; }
}

export function CaptureNudge({ user, onShowAuth }) {
  const [show, setShow] = useState(false);
  const [solved, setSolved] = useState(0);
  const [seenBefore, setSeenBefore] = useState(false);

  useEffect(() => {
    // Logged-in users never see this — they have already converted.
    if (user) { setShow(false); return; }

    // Per-session dismiss wins for this browser session — no nagging within a session.
    try {
      if (sessionStorage.getItem(SESSION_DISMISS_KEY)) { setShow(false); return; }
    } catch { /* ignore */ }

    let total = 0;
    try { total = computeTotalSolved(); } catch { total = 0; }

    if (total >= THRESHOLD) {
      setSolved(total);
      setSeenBefore(readDismissCount() > 0);
      setShow(true);
    } else {
      setShow(false);
    }
  }, [user]);

  if (!show) return null;

  function dismiss() {
    // Hide for this session only; bump the across-session counter so the copy
    // softens next time. It will re-show next session until they sign in.
    try { sessionStorage.setItem(SESSION_DISMISS_KEY, '1'); } catch { /* ignore */ }
    try { localStorage.setItem(DISMISS_COUNT_KEY, String(readDismissCount() + 1)); } catch { /* ignore */ }
    setShow(false);
  }

  function save() {
    if (onShowAuth) onShowAuth();
    // Don't mark dismissed — if they cancel the auth modal we still want the
    // nudge available this session. Hide locally so it isn't covering the modal.
    setShow(false);
  }

  const message = seenBefore
    ? 'Your ' + solved + ' solved live only on this device. Sign in to keep them safe.'
    : 'You\'re on a roll — ' + solved + ' solved. Sign in to save your progress and streak (free, one tap).';

  return (
    <div
      className="pal-slide-up"
      role="status"
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
        margin: '0.75rem 1rem 0',
        padding: '0.65rem 0.9rem',
        background: 'var(--accent-bg, var(--surface-2))',
        border: '1px solid var(--accent-border, var(--border))',
        borderRadius: '10px',
      }}
    >
      <Icon name="bookmark" size={18} color="var(--accent)" />

      <div style={{ flex: 1, minWidth: '180px', fontSize: '0.83rem', color: 'var(--text)', fontWeight: 600 }}>
        {message}
      </div>

      <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={save}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '0.38rem 0.85rem',
            fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Icon name="check" size={14} color="#fff" strokeWidth={2.25} />
          Save my progress
        </button>

        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', lineHeight: 1,
            padding: '0.2rem',
          }}
        >
          <Icon name="x" size={16} color="var(--text-muted)" />
        </button>
      </div>
    </div>
  );
}
