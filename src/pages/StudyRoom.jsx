// src/pages/StudyRoom.jsx
// Private study room — auth-gated, never shown in public nav.
// Casefile mode (warm light/dark). Mobile-first.
//
// Assumes:
//   import { supabase } from '../lib/supabase'   ← already in your project
//   SM-2 module at src/study/sm2.js              ← provided

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { gradeCard, defaultReview, maturityPct } from '../study/sm2';

// ─── Constants ────────────────────────────────────────────────────────────

const TOPIC_LABELS = {
  experimentation:  'Experimentation',
  statistics:       'Statistics',
  metrics:          'Metrics & Framing',
  sql:              'Analytics SQL',
  causal_inference: 'Causal Inference',
  product:          'Product Design',
};

const TOPIC_ORDER = [
  'experimentation', 'statistics', 'metrics',
  'sql', 'causal_inference', 'product',
];

const MAX_NEW_PER_SESSION = 15;

// ─── Styles (inline, Casefile CSS vars) ───────────────────────────────────

const S = {
  page: {
    padding: '1.5rem 1rem 4rem',
    maxWidth: 640,
    margin: '0 auto',
    fontFamily: 'var(--font-ui)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.01em',
  },
  tabBar: {
    display: 'flex',
    gap: '0.25rem',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '0.2rem',
    marginBottom: '1.5rem',
  },
  tab: (active) => ({
    flex: 1,
    padding: '0.45rem 0.5rem',
    border: 'none',
    borderRadius: 'calc(var(--radius-md) - 2px)',
    fontSize: '0.8rem',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)',
    transition: 'all 0.15s',
  }),
  statRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '0.85rem 0.75rem',
    textAlign: 'center',
  },
  statNum: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: 'var(--text)',
    lineHeight: 1,
    marginBottom: '0.2rem',
  },
  statLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  startBtn: {
    width: '100%',
    padding: '0.9rem',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '1.5rem',
    letterSpacing: '-0.01em',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg, 12px)',
    padding: '1.5rem',
    marginBottom: '1rem',
    minHeight: 180,
  },
  cardMeta: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
  },
  tag: (color) => ({
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '0.2rem 0.5rem',
    borderRadius: 4,
    background: color + '18',
    color: color,
  }),
  front: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text)',
    lineHeight: 1.5,
    marginBottom: '0.5rem',
  },
  flipHint: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginTop: '1rem',
  },
  divider: {
    border: 'none',
    borderTop: '1px dashed var(--border)',
    margin: '1rem 0',
  },
  back: {
    fontSize: '0.9rem',
    color: 'var(--text)',
    lineHeight: 1.65,
    whiteSpace: 'pre-wrap',
  },
  ratingRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  ratingBtn: (color) => ({
    padding: '0.7rem 0.25rem',
    border: `1px solid ${color}40`,
    borderRadius: 'var(--radius-md)',
    background: color + '12',
    color: color,
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    lineHeight: 1.3,
  }),
  progress: {
    height: 4,
    background: 'var(--border)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  progressBar: (pct, color) => ({
    height: '100%',
    width: `${pct}%`,
    background: color || 'var(--accent)',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  }),
  topicRow: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '0.85rem 1rem',
    marginBottom: '0.5rem',
  },
  topicName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: '0.35rem',
    display: 'flex',
    justifyContent: 'space-between',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem 1rem',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  loadingState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
};

const TOPIC_COLORS = {
  experimentation:  '#2457D6',
  statistics:       '#007C89',
  metrics:          '#C97706',
  sql:              '#5B4CF6',
  causal_inference: '#D63860',
  product:          '#2D9C6A',
};

// ─── Main component ────────────────────────────────────────────────────────

export function StudyRoom({ user }) {
  const [view, setView] = useState('queue');        // 'queue' | 'review' | 'topics'
  const [allCards, setAllCards] = useState([]);
  const [reviewMap, setReviewMap] = useState({});   // card_id -> review row
  const [queue, setQueue] = useState([]);            // cards for today's session
  const [queueIdx, setQueueIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionDone, setSessionDone] = useState(0);// cards rated this session
  const [error, setError] = useState(null);

  // ── Fetch all cards + user reviews on mount ──────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: cards, error: cardsErr }, { data: reviews, error: revErr }] =
        await Promise.all([
          supabase.from('study_cards').select('*').order('priority').order('topic'),
          supabase.from('study_reviews').select('*').eq('user_id', user.id),
        ]);

      if (cardsErr) throw cardsErr;
      if (revErr)   throw revErr;

      setAllCards(cards || []);

      const rmap = {};
      (reviews || []).forEach(r => { rmap[r.card_id] = r; });
      setReviewMap(rmap);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Compute today's queue ─────────────────────────────────────────────────
  useEffect(() => {
    if (!allCards.length) return;
    const today = new Date().toISOString().split('T')[0];

    const due = allCards.filter(card => {
      const rev = reviewMap[card.id];
      if (!rev) return false;            // new (unseen) — handled separately
      return rev.due_date <= today;
    });

    const unseen = allCards
      .filter(card => !reviewMap[card.id])
      .slice(0, Math.max(0, MAX_NEW_PER_SESSION - due.length));

    setQueue([...due, ...unseen]);
    setQueueIdx(0);
    setShowBack(false);
    setSessionDone(0);
  }, [allCards, reviewMap]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const dueCount    = allCards.filter(c => { const r = reviewMap[c.id]; return r && r.due_date <= today; }).length;
  const unseenCount = allCards.filter(c => !reviewMap[c.id]).length;
  const totalSeen   = Object.keys(reviewMap).length;

  // ── Handle rating a card ──────────────────────────────────────────────────
  const handleRate = useCallback(async (grade) => {
    const card = queue[queueIdx];
    if (!card) return;

    const existing = reviewMap[card.id];
    const base = existing || defaultReview(card.id, user.id);
    const updated = gradeCard(base, grade);

    const upsertRow = {
      ...base,
      ...updated,
      user_id: user.id,
      card_id: card.id,
    };
    delete upsertRow.id; // let Supabase handle id on insert

    const { error: upsertErr } = await supabase
      .from('study_reviews')
      .upsert(upsertRow, { onConflict: 'user_id,card_id' });

    if (!upsertErr) {
      // Optimistically update local reviewMap
      setReviewMap(prev => ({ ...prev, [card.id]: { ...upsertRow, id: existing?.id } }));
      setSessionDone(n => n + 1);
    }

    // Advance
    const next = queueIdx + 1;
    if (next >= queue.length) {
      setView('queue'); // session complete, back to queue summary
    } else {
      setQueueIdx(next);
      setShowBack(false);
    }
  }, [queue, queueIdx, reviewMap, user.id]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'review') return;
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!showBack) setShowBack(true);
      }
      if (showBack) {
        if (e.key === '1') handleRate(0);
        if (e.key === '2') handleRate(1);
        if (e.key === '3') handleRate(2);
        if (e.key === '4') handleRate(3);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view, showBack, handleRate]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <div style={S.loadingState}>Loading study room…</div>;
  if (error)   return <div style={S.loadingState}>Error: {error}</div>;

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <span style={S.title}>Study Room</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {totalSeen}/{allCards.length} cards seen
        </span>
      </div>

      {/* Tab bar */}
      <div style={S.tabBar}>
        {[
          { key: 'queue',  label: 'Today' },
          { key: 'review', label: 'Review', disabled: queue.length === 0 },
          { key: 'topics', label: 'Topics' },
        ].map(t => (
          <button
            key={t.key}
            style={S.tab(view === t.key)}
            onClick={() => {
              if (t.disabled) return;
              setView(t.key);
              if (t.key === 'review') { setQueueIdx(0); setShowBack(false); }
            }}
            disabled={t.disabled}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Views */}
      {view === 'queue'  && <QueueView  dueCount={dueCount} unseenCount={unseenCount} sessionDone={sessionDone} queue={queue} onStart={() => { setView('review'); setQueueIdx(0); setShowBack(false); }} />}
      {view === 'review' && <ReviewView card={queue[queueIdx]} queueIdx={queueIdx} queueLen={queue.length} showBack={showBack} onFlip={() => setShowBack(true)} onRate={handleRate} />}
      {view === 'topics' && <TopicsView allCards={allCards} reviewMap={reviewMap} />}
    </div>
  );
}

// ─── QueueView ─────────────────────────────────────────────────────────────

function QueueView({ dueCount, unseenCount, sessionDone, queue, onStart }) {
  const total = queue.length;

  return (
    <>
      <div style={S.statRow}>
        <div style={S.statCard}>
          <div style={S.statNum}>{dueCount}</div>
          <div style={S.statLabel}>Due</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum}>{unseenCount}</div>
          <div style={S.statLabel}>New</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statNum}>{sessionDone}</div>
          <div style={S.statLabel}>Done today</div>
        </div>
      </div>

      {total > 0 ? (
        <button style={S.startBtn} onClick={onStart}>
          Start review · {total} card{total !== 1 ? 's' : ''}
        </button>
      ) : (
        <div style={S.emptyState}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
          <div>Nothing due. Come back tomorrow.</div>
        </div>
      )}

      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text)' }}>Keyboard shortcuts:</strong>{' '}
        Space/Enter to flip · 1 Again · 2 Hard · 3 Good · 4 Easy
      </div>
    </>
  );
}

// ─── ReviewView ────────────────────────────────────────────────────────────

function ReviewView({ card, queueIdx, queueLen, showBack, onFlip, onRate }) {
  if (!card) return <div style={S.emptyState}>Queue empty.</div>;

  const topic  = card.topic;
  const color  = TOPIC_COLORS[topic] || 'var(--accent)';
  const pct    = Math.round(((queueIdx) / queueLen) * 100);

  return (
    <>
      {/* Progress bar */}
      <div style={S.progress}>
        <div style={S.progressBar(pct, color)} />
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'right' }}>
        {queueIdx + 1} / {queueLen}
      </div>

      {/* Card */}
      <div style={{ ...S.card, cursor: showBack ? 'default' : 'pointer' }} onClick={!showBack ? onFlip : undefined}>
        <div style={S.cardMeta}>
          <span style={S.tag(color)}>{TOPIC_LABELS[topic] || topic}</span>
          {card.subtopic && card.subtopic !== topic && (
            <span style={S.tag('var(--text-muted)')}>{card.subtopic.replace(/_/g, ' ')}</span>
          )}
        </div>

        <div style={S.front}>{card.front}</div>

        {!showBack && (
          <div style={S.flipHint}>Tap to reveal · Space</div>
        )}

        {showBack && (
          <>
            <hr style={S.divider} />
            <div style={S.back}>{card.back}</div>
          </>
        )}
      </div>

      {/* Rating buttons — only after flip */}
      {showBack && (
        <>
          <div style={S.ratingRow}>
            {[
              { grade: 0, label: 'Again',  sub: '< 1d', color: '#E53E3E', key: '1' },
              { grade: 1, label: 'Hard',   sub: 'slow',  color: '#C97706', key: '2' },
              { grade: 2, label: 'Good',   sub: 'ok',    color: '#2D9C6A', key: '3' },
              { grade: 3, label: 'Easy',   sub: 'fast',  color: '#2457D6', key: '4' },
            ].map(({ grade, label, sub, color, key }) => (
              <button
                key={grade}
                style={S.ratingBtn(color)}
                onClick={() => onRate(grade)}
              >
                <div>{label}</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>[{key}] {sub}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}

// ─── TopicsView ────────────────────────────────────────────────────────────

function TopicsView({ allCards, reviewMap }) {
  const today = new Date().toISOString().split('T')[0];

  const byTopic = {};
  TOPIC_ORDER.forEach(t => {
    byTopic[t] = { total: 0, seen: 0, mature: 0, due: 0, reviews: [] };
  });

  allCards.forEach(card => {
    const t = card.topic;
    if (!byTopic[t]) byTopic[t] = { total: 0, seen: 0, mature: 0, due: 0, reviews: [] };
    byTopic[t].total++;
    const rev = reviewMap[card.id];
    if (rev) {
      byTopic[t].seen++;
      byTopic[t].reviews.push(rev);
      if (rev.interval_days > 21) byTopic[t].mature++;
      if (rev.due_date <= today)  byTopic[t].due++;
    }
  });

  return (
    <>
      {TOPIC_ORDER.map(topic => {
        const stats = byTopic[topic];
        if (!stats || stats.total === 0) return null;
        const color    = TOPIC_COLORS[topic] || 'var(--accent)';
        const seenPct  = Math.round((stats.seen / stats.total) * 100);
        const maturPct = stats.seen > 0 ? Math.round((stats.mature / stats.seen) * 100) : 0;
        const isWeak   = stats.seen > 5 && maturPct < 25;

        return (
          <div key={topic} style={{ ...S.topicRow, borderLeft: `3px solid ${color}` }}>
            <div style={S.topicName}>
              <span>
                {TOPIC_LABELS[topic] || topic}
                {isWeak && (
                  <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', color: '#E53E3E', fontWeight: 600 }}>
                    WEAK
                  </span>
                )}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                {stats.mature}/{stats.seen} mature · {stats.due} due
              </span>
            </div>

            {/* Seen progress */}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              {stats.seen}/{stats.total} seen
            </div>
            <div style={{ ...S.progress, marginBottom: '0.5rem' }}>
              <div style={S.progressBar(seenPct, color + '60')} />
            </div>

            {/* Maturity progress */}
            {stats.seen > 0 && (
              <>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  {maturPct}% mature (interval {'>'} 21d)
                </div>
                <div style={{ ...S.progress, marginBottom: 0 }}>
                  <div style={S.progressBar(maturPct, color)} />
                </div>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}

export default StudyRoom;
