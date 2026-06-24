import { useState, useEffect, useCallback } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { STUDY_CARDS } from '../study/studyCards.js';
import { loadReviews, saveReviews, defaultReview, gradeCard, isDue, maturityPct } from '../study/sm2.js';

const MAX_NEW_PER_SESSION = 15;
const TOPICS = ['experimentation', 'statistics', 'sql', 'causal_inference', 'metrics', 'product'];

export function StudyRoom() {
  const [reviews, setReviews]   = useState({});
  const [view, setView]         = useState('queue'); // 'queue' | 'review' | 'topics'
  const [queue, setQueue]       = useState([]);
  const [queueIdx, setQueueIdx] = useState(0);
  const [flipped, setFlipped]   = useState(false);
  const [sessionDone, setSessionDone] = useState(0);
  const [topicFilter, setTopicFilter] = useState('all');

  // Load reviews from localStorage on mount
  useEffect(() => {
    const saved = loadReviews();
    setReviews(saved);
  }, []);

  // Build today's queue whenever reviews or filter changes
  useEffect(() => {
    buildQueue(reviews, topicFilter);
  }, [reviews, topicFilter]);

  function buildQueue(revMap, filter) {
    const cards = filter === 'all' ? STUDY_CARDS : STUDY_CARDS.filter(c => c.topic === filter);
    const due = cards.filter(c => {
      const r = revMap[c.id];
      return r ? isDue(r) : true; // new cards are always due
    });

    // Limit new cards per session
    let newCount = 0;
    const filtered = due.filter(c => {
      const r = revMap[c.id];
      const isNew = !r || r.reps === 0;
      if (isNew) {
        if (newCount >= MAX_NEW_PER_SESSION) return false;
        newCount++;
      }
      return true;
    });

    // Shuffle
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setQueueIdx(0);
    setFlipped(false);
  }

  function handleGrade(grade) {
    const card = queue[queueIdx];
    if (!card) return;

    const existing = reviews[card.id] || defaultReview(card.id);
    const updated = gradeCard(existing, grade);

    const newReviews = { ...reviews, [card.id]: updated };
    setReviews(newReviews);
    saveReviews(newReviews);
    setSessionDone(n => n + 1);

    const next = queueIdx + 1;
    if (next >= queue.length) {
      setView('queue');
      setQueueIdx(0);
    } else {
      setQueueIdx(next);
      setFlipped(false);
    }
  }

  function startReview() {
    setView('review');
    setFlipped(false);
  }

  const card = queue[queueIdx];
  const totalDue = queue.length;

  // ── Styles ──
  const s = {
    wrap: { padding: '2rem 2.5rem', maxWidth: 800, margin: '0 auto', fontFamily: 'var(--font-sans)' },
    header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
    title: { fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', margin: 0 },
    tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
    tab: (active) => ({
      padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      background: active ? 'var(--accent)' : 'transparent',
      color: active ? '#fff' : 'var(--text-muted)',
      cursor: 'pointer', fontSize: '0.85rem', fontWeight: active ? 600 : 400,
    }),
    card: {
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '2rem',
      minHeight: 200, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', textAlign: 'center',
      cursor: 'pointer', userSelect: 'none',
      transition: 'box-shadow 0.15s',
    },
    front: { fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.6 },
    back: { fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '1rem', whiteSpace: 'pre-wrap', textAlign: 'left' },
    tag: {
      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem',
    },
    grades: { display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'center' },
    gradeBtn: (color) => ({
      padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-sm)',
      border: `1px solid ${color}`, background: 'transparent',
      color: color, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
      transition: 'background 0.15s',
    }),
    flipHint: { fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '1rem' },
    stat: { textAlign: 'center', padding: '0.75rem 1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' },
    statNum: { fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)' },
    statLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' },
    topicRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' },
    bar: (pct) => ({ height: 6, borderRadius: 3, background: 'var(--accent)', width: `${pct}%`, transition: 'width 0.4s' }),
    barBg: { flex: 1, height: 6, borderRadius: 3, background: 'var(--border)' },
    filterRow: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
    chip: (active) => ({
      padding: '0.3rem 0.8rem', borderRadius: 20,
      border: '1px solid var(--border)',
      background: active ? 'var(--accent-bg)' : 'transparent',
      color: active ? 'var(--accent)' : 'var(--text-muted)',
      cursor: 'pointer', fontSize: '0.78rem',
    }),
  };

  // ── Queue view ──
  if (view === 'queue') {
    const totalCards = STUDY_CARDS.length;
    const reviewed = Object.keys(reviews).length;
    const mature = STUDY_CARDS.filter(c => reviews[c.id]?.interval_days >= 21).length;

    return (
      <div style={s.wrap}>
        <div style={s.header}>
          <h1 style={s.title}>Study Room</h1>
        </div>

        <div style={s.tabs}>
          <button style={s.tab(view === 'queue')} onClick={() => setView('queue')}>Queue</button>
          <button style={s.tab(view === 'topics')} onClick={() => setView('topics')}>Topics</button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={s.stat}>
            <div style={s.statNum}>{totalDue}</div>
            <div style={s.statLabel}>Due today</div>
          </div>
          <div style={s.stat}>
            <div style={s.statNum}>{reviewed}</div>
            <div style={s.statLabel}>Ever reviewed</div>
          </div>
          <div style={s.stat}>
            <div style={s.statNum}>{mature}</div>
            <div style={s.statLabel}>Mature (21d+)</div>
          </div>
          <div style={s.stat}>
            <div style={s.statNum}>{sessionDone}</div>
            <div style={s.statLabel}>This session</div>
          </div>
        </div>

        {/* Topic filter */}
        <div style={s.filterRow}>
          {['all', ...TOPICS].map(t => (
            <button key={t} style={s.chip(topicFilter === t)} onClick={() => setTopicFilter(t)}>
              {t === 'causal_inference' ? 'causal' : t}
            </button>
          ))}
        </div>

        {totalDue === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ marginBottom: '0.5rem' }}><Icon name='check' size={32} color='var(--green)' /></div>
            <div>Nothing due. Come back tomorrow.</div>
          </div>
        ) : (
          <button
            onClick={startReview}
            style={{
              padding: '0.85rem 2.5rem', borderRadius: 'var(--radius-sm)',
              background: 'var(--accent)', border: 'none',
              color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            }}
          >
            Study {totalDue} card{totalDue !== 1 ? 's' : ''} →
          </button>
        )}
      </div>
    );
  }

  // ── Topics view ──
  if (view === 'topics') {
    return (
      <div style={s.wrap}>
        <div style={s.header}>
          <h1 style={s.title}>Study Room</h1>
        </div>
        <div style={s.tabs}>
          <button style={s.tab(false)} onClick={() => setView('queue')}>Queue</button>
          <button style={s.tab(true)}>Topics</button>
        </div>
        {TOPICS.map(topic => {
          const topicCards = STUDY_CARDS.filter(c => c.topic === topic);
          const pct = maturityPct(reviews, topicCards);
          const due = topicCards.filter(c => {
            const r = reviews[c.id];
            return r ? isDue(r) : true;
          }).length;
          const weak = topicCards.some(c => {
            const r = reviews[c.id];
            return r && (r.interval_days < 7 || (r.lapses / Math.max(r.reps, 1)) > 0.3);
          });
          return (
            <div key={topic} style={s.topicRow}>
              <div style={{ width: 130, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>
                {topic === 'causal_inference' ? 'Causal Inference' : topic.charAt(0).toUpperCase() + topic.slice(1)}
                {weak && <span style={{ marginLeft: '0.4rem', color: 'var(--red)', fontSize: '0.7rem', fontWeight: 700 }}>WEAK</span>}
              </div>
              <div style={s.barBg}><div style={s.bar(pct)} /></div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', width: 50, textAlign: 'right' }}>{pct}% mature</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent)', width: 40, textAlign: 'right' }}>{due} due</div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Review view ──
  if (!card) {
    setView('queue');
    return null;
  }

  return (
    <div style={s.wrap}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {queueIdx + 1} / {queue.length}
        </span>
        <button
          onClick={() => setView('queue')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          ← Back
        </button>
      </div>

      <div
        style={s.card}
        onClick={() => !flipped && setFlipped(true)}
      >
        <div style={s.tag}>{card.topic.replace('_', ' ')} · {card.subtopic}</div>
        <div style={s.front}>{card.front}</div>
        {flipped && (
          <div style={s.back}>{card.back}</div>
        )}
        {!flipped && <div style={s.flipHint}>Click to reveal · Space</div>}
      </div>

      {flipped && (
        <div style={s.grades}>
          {[
            { label: 'Again', grade: 0, color: 'var(--red)' },
            { label: 'Hard',  grade: 1, color: 'var(--yellow)' },
            { label: 'Good',  grade: 2, color: 'var(--accent)' },
            { label: 'Easy',  grade: 3, color: 'var(--green)' },
          ].map(({ label, grade, color }) => (
            <button key={grade} style={s.gradeBtn(color)} onClick={() => handleGrade(grade)}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
