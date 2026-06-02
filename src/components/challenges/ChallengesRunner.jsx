import { useState, useEffect } from 'react';
import { saveChallengesProgress } from '../../utils/challengesProgress.js';
import { track } from '../../utils/analytics.js';
import { challengesCases } from '../../data/challengesCases.js';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';

const NOTES_KEY = 'pal-notes-v1';

function getNotes(room, caseId) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    return all[room + ':' + caseId] || '';
  } catch { return ''; }
}

function saveNote(room, caseId, text) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    all[room + ':' + caseId] = text;
    localStorage.setItem(NOTES_KEY, JSON.stringify(all));
  } catch {}
}

const ROOM_COLORS = {
  'stats':            { color: 'var(--accent)',    bg: 'var(--accent-bg)',    border: 'var(--accent-border)' },
  'rca':              { color: 'var(--purple)',    bg: 'var(--purple-bg)',    border: 'var(--purple-border)' },
  'metrics':          { color: 'var(--green)',     bg: 'var(--green-bg)',     border: 'var(--green-border)' },
  'growth-analytics': { color: 'var(--teal)',      bg: 'var(--teal-bg)',      border: 'var(--teal-border)' },
  'product-design':   { color: 'var(--purple)',    bg: 'var(--purple-bg)',    border: 'var(--purple-border)' },
  'estimation':       { color: 'var(--yellow)',    bg: 'var(--yellow-bg)',    border: 'var(--yellow-border)' },
  'code':             { color: 'var(--blue-text)', bg: 'var(--blue-bg)',      border: 'var(--blue-border)' },
};

const ROOM_LABEL = {
  'stats':            'Statistics',
  'rca':              'RCA',
  'metrics':          'Metrics',
  'growth-analytics': 'Growth Analytics',
  'product-design':   'Product Design',
  'estimation':       'Estimation',
  'code':             'SQL / Code',
};

const RATING_OPTIONS = [
  {
    id: 'strong',
    label: 'Strong',
    sub: 'Hit all key points across every sub-question',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    border: 'var(--green-border)',
  },
  {
    id: 'partial',
    label: 'Partial',
    sub: 'Got the main ideas but missed some details',
    color: 'var(--yellow)',
    bg: 'var(--yellow-bg)',
    border: 'var(--yellow-border)',
  },
  {
    id: 'miss',
    label: 'Miss',
    sub: 'Missed a room or key concept — revisit',
    color: 'var(--red)',
    bg: 'var(--red-bg)',
    border: 'var(--red-border)',
  },
];

// ─── Main Runner ─────────────────────────────────────────────────────────────
export function ChallengesRunner({ caseId, onBack, onNext, unlocked, onNavigate }) {
  const caseData = challengesCases.find(c => c.id === caseId);
  const [screen, setScreen] = useState('scenario'); // 'scenario' | 'question' | 'synthesis' | 'debrief'
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: string }
  const [revealed, setRevealed] = useState({}); // { [qId]: bool }
  const [checkedPoints, setCheckedPoints] = useState({}); // { [qId]: Set<number> }
  const [rating, setRating] = useState(null);
  const [hintOpen, setHintOpen] = useState({});
  const [note, setNote] = useState(() => getNotes('challenges', caseData.id));
  useEffect(() => { setNote(getNotes('challenges', caseData.id)); }, [caseData.id]);

  const subQs = caseData.subQuestions;
  const totalQs = subQs.length;
  const currentQ = subQs[qIndex];
  const answeredCount = Object.keys(revealed).length;

  const rc = ROOM_COLORS[currentQ?.room] || { color: 'var(--red)', bg: 'var(--red-bg)', border: 'var(--red-border)' };

  function handleReveal() {
    setRevealed(r => ({ ...r, [currentQ.id]: true }));
  }

  function handleAnswerChange(qId, val) {
    setAnswers(a => ({ ...a, [qId]: val }));
  }

  function togglePoint(qId, idx) {
    setCheckedPoints(cp => {
      const prev = cp[qId] ? new Set(cp[qId]) : new Set();
      if (prev.has(idx)) prev.delete(idx); else prev.add(idx);
      return { ...cp, [qId]: prev };
    });
  }

  function toggleHint(qId) {
    setHintOpen(h => ({ ...h, [qId]: !h[qId] }));
  }

  function handleNextQuestion() {
    if (qIndex < totalQs - 1) {
      setQIndex(i => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setScreen('synthesis');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleRate(r) {
    setRating(r);
    saveChallengesProgress(caseData.id, r);
    track('case_completed', { room: 'challenges', id: caseData.id, rating: r });
  }

  // ── Scenario Screen ───────────────────────────────────────────────────────
  if (screen === 'scenario') {
    return (
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <BackButton onBack={onBack} />

        {/* Challenge header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {caseData.id}
            </span>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600,
              color: 'var(--red)', background: 'var(--red-bg)', border: '1px solid var(--red-border)',
              borderRadius: '4px', padding: '0.1rem 0.4rem',
            }}>
              {caseData.difficulty === 'staff' ? 'Staff' : 'Senior'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>
              {caseData.company}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
              ~{caseData.estimatedMin} min · {totalQs} sub-questions
            </span>
          </div>

          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>
            {caseData.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.75rem' }}>
            {caseData.subtitle}
          </p>

          {/* Room badges */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {caseData.rooms.map(room => {
              const rColor = ROOM_COLORS[room] || {};
              return (
                <span key={room} style={{
                  fontSize: '0.7rem', fontWeight: 600,
                  color: rColor.color, background: rColor.bg, border: `1px solid ${rColor.border}`,
                  borderRadius: '4px', padding: '0.15rem 0.5rem',
                }}>
                  {ROOM_LABEL[room] || room}
                </span>
              );
            })}
          </div>
        </div>

        {/* Scenario */}
        <div style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--red)', marginBottom: '0.75rem' }}>
            Scenario
          </div>
          <div style={{ color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {caseData.scenario}
          </div>
        </div>

        {/* Sub-question previews */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            You will be asked about
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {subQs.map((q, i) => {
              const qrc = ROOM_COLORS[q.room] || {};
              return (
                <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)',
                    minWidth: '20px', paddingTop: '0.05rem',
                  }}>
                    {i + 1}.
                  </span>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    color: qrc.color, background: qrc.bg, border: `1px solid ${qrc.border}`,
                    borderRadius: '4px', padding: '0.15rem 0.45rem', flexShrink: 0,
                  }}>
                    {q.label}
                  </span>
                  <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {q.question.length > 100 ? q.question.slice(0, 100) + '…' : q.question}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => { setScreen('question'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{
              background: 'var(--red)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.65rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Begin Challenge →
          </button>
        </div>
      </div>
    );
  }

  // ── Question Screen ───────────────────────────────────────────────────────
  if (screen === 'question') {
    const qAnswer = answers[currentQ.id] || '';
    const isRevealed = !!revealed[currentQ.id];
    const canReveal = qAnswer.trim().length >= 30;
    const isLastQ = qIndex === totalQs - 1;
    const qrc = ROOM_COLORS[currentQ.room] || {};
    const checked = checkedPoints[currentQ.id] || new Set();

    return (
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <BackButton onBack={() => {
          if (qIndex === 0) setScreen('scenario');
          else setQIndex(i => i - 1);
        }} label="← Back" />

        {/* Progress bar */}
        <ProgressBar current={answeredCount} total={totalQs} />

        {/* Challenge title */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            {caseData.id} · {caseData.title}
          </div>
        </div>

        {/* Question card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '1.25rem',
          marginBottom: '1rem',
        }}>
          {/* Room badge + question number */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600,
              color: qrc.color, background: qrc.bg, border: `1px solid ${qrc.border}`,
              borderRadius: '4px', padding: '0.15rem 0.5rem',
            }}>
              {currentQ.label}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Question {qIndex + 1} of {totalQs}
            </span>
          </div>

          <p style={{ color: 'var(--text)', fontSize: '0.93rem', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
            {currentQ.question}
          </p>
        </div>

        {/* Hint toggle */}
        <button
          onClick={() => toggleHint(currentQ.id)}
          style={{
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: '6px', padding: '0.35rem 0.8rem',
            fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)',
            cursor: 'pointer', marginBottom: '0.6rem',
          }}
        >
          {hintOpen[currentQ.id] ? '▲ Hide hint' : '▼ Show hint'}
        </button>
        {hintOpen[currentQ.id] && (
          <div style={{
            background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
            borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '0.75rem',
            fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6,
          }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--yellow)', marginRight: '0.5rem' }}>Hint</span>
            {currentQ.hint}
          </div>
        )}

        {/* Answer textarea */}
        {!isRevealed && (
          <>
            <textarea
              value={qAnswer}
              onChange={e => handleAnswerChange(currentQ.id, e.target.value)}
              placeholder="Write your answer here. Be specific — reference frameworks, metrics, and statistical concepts by name."
              style={{
                width: '100%',
                minHeight: '160px',
                padding: '0.85rem 1rem',
                background: 'var(--surface)',
                border: `1.5px solid ${canReveal ? 'var(--border)' : 'var(--border)'}`,
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '0.88rem',
                lineHeight: 1.65,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                marginBottom: '0.6rem',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--red-border)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '1rem',
            }}>
              <span style={{ fontSize: '0.78rem', color: canReveal ? 'var(--green)' : 'var(--text-dim)' }}>
                {canReveal ? '✓ Ready to reveal' : `${qAnswer.trim().length}/30 characters to unlock`}
              </span>
              <button
                onClick={handleReveal}
                disabled={!canReveal}
                style={{
                  background: canReveal ? 'var(--red)' : 'var(--surface-2)',
                  color: canReveal ? '#fff' : 'var(--text-dim)',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: canReveal ? 'pointer' : 'not-allowed',
                }}
              >
                Reveal Answer →
              </button>
            </div>
          </>
        )}

        {/* Revealed answer */}
        {isRevealed && (
          <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* User's answer recap */}
            {qAnswer.trim() && (
              <div style={{
                background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
                borderRadius: '8px', padding: '0.9rem 1rem',
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Your Answer
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {qAnswer}
                </p>
              </div>
            )}

            {/* Model answer */}
            <div style={{
              background: 'var(--surface)',
              border: `1.5px solid ${qrc.border || 'var(--border)'}`,
              borderRadius: '10px',
              padding: '1.25rem',
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: qrc.color || 'var(--red)', marginBottom: '0.65rem' }}>
                Model Answer — {currentQ.label}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.75, margin: '0 0 1rem', whiteSpace: 'pre-wrap' }}>
                {currentQ.modelAnswer}
              </p>

              {/* Key points self-check */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.55rem' }}>
                  Did your answer cover these?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {currentQ.keyPoints.map((pt, idx) => {
                    const isChecked = checked.has(idx);
                    return (
                      <label
                        key={idx}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                          cursor: 'pointer', padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          background: isChecked ? 'var(--green-bg)' : 'transparent',
                          border: `1px solid ${isChecked ? 'var(--green-border)' : 'transparent'}`,
                          transition: 'all 0.12s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePoint(currentQ.id, idx)}
                          style={{ marginTop: '0.15rem', accentColor: 'var(--green)', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: '0.83rem', color: isChecked ? 'var(--green-text)' : 'var(--text-secondary)', lineHeight: 1.55 }}>
                          {pt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Next button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleNextQuestion}
                className="pal-glow-pulse"
                style={{
                  background: 'var(--red)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '0.6rem 1.4rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isLastQ ? 'See Synthesis →' : 'Next Question →'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Synthesis Screen ──────────────────────────────────────────────────────
  if (screen === 'synthesis') {
    return (
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <BackButton onBack={() => { setQIndex(totalQs - 1); setScreen('question'); }} label="← Back to Last Question" />

        <ProgressBar current={totalQs} total={totalQs} />

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--red)', marginBottom: '0.3rem' }}>
            Synthesis
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            How It All Connects
          </h2>
        </div>

        {/* Synthesis text */}
        <div style={{
          background: 'var(--red-bg)',
          border: '1px solid var(--red-border)',
          borderRadius: '10px',
          padding: '1.25rem 1.4rem',
          marginBottom: '1.5rem',
        }}>
          <p style={{ color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.75, margin: 0 }}>
            {caseData.synthesis}
          </p>
        </div>

        {/* Your answers recap */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Your Answers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {subQs.map((q, i) => {
              const ans = answers[q.id] || '';
              const qrc = ROOM_COLORS[q.room] || {};
              return (
                <div key={q.id} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.9rem 1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)' }}>Q{i + 1}</span>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 600,
                      color: qrc.color, background: qrc.bg, border: `1px solid ${qrc.border}`,
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                    }}>
                      {q.label}
                    </span>
                  </div>
                  {ans.trim() ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {ans}
                    </p>
                  ) : (
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.83rem', fontStyle: 'italic', margin: 0 }}>
                      No answer written
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => { setScreen('debrief'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{
              background: 'var(--red)',
              color: '#fff',
              border: 'none',
              borderRadius: '7px',
              padding: '0.65rem 1.4rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Debrief →
          </button>
        </div>
      </div>
    );
  }

  // ── Debrief Screen ────────────────────────────────────────────────────────
  if (screen === 'debrief') {
    return (
      <div className="pal-reveal-in" style={{ maxWidth: '820px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <BackButton onBack={() => setScreen('synthesis')} label="← Back to Synthesis" />

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--red)', marginBottom: '0.3rem' }}>
            Debrief
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            {caseData.title}
          </h2>
        </div>

        {/* Key Takeaways */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '1.25rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--red)', marginBottom: '0.75rem' }}>
            Key Takeaways
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {caseData.keyTakeaways.map((t, i) => (
              <li key={i} style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Self-rating */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '1.25rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Overall — How did you do?
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {RATING_OPTIONS.map(r => {
              const selected = rating === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRate(r.id)}
                  style={{
                    background: selected ? r.bg : 'var(--surface-2)',
                    border: `1.5px solid ${selected ? r.border : 'var(--border)'}`,
                    borderRadius: '8px',
                    padding: '0.55rem 1rem',
                    color: selected ? r.color : 'var(--text-muted)',
                    fontWeight: selected ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    minWidth: '120px',
                    transition: 'all 0.1s',
                  }}
                >
                  {r.label}
                  <div style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.8, marginTop: '0.15rem', lineHeight: 1.4 }}>
                    {r.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            My Notes
          </div>
          <textarea
            value={note}
            onChange={e => { setNote(e.target.value); saveNote('challenges', caseData.id, e.target.value); }}
            placeholder="Add your own notes, reminders, or follow-up questions..."
            rows={4}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.65rem 0.85rem',
              color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.55,
              resize: 'vertical', outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Playbook links */}
        {caseData.playbookLinks && caseData.playbookLinks.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Related Playbook Articles
            </div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {caseData.playbookLinks.map((link, i) => (
                <span key={link || i} style={{
                  fontSize: '0.78rem', fontWeight: 500,
                  color: 'var(--red)', background: 'var(--red-bg)', border: '1px solid var(--red-border)',
                  borderRadius: '20px', padding: '0.25rem 0.75rem',
                }}>
                  {link}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: rating ? '4rem' : 0 }}>
          <button
            onClick={onBack}
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              padding: '0.5rem 1rem',
              color: 'var(--text-muted)',
              fontSize: '0.83rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← Back to Challenges
          </button>
          {onNext && (
            <button
              onClick={onNext}
              className="pal-glow-pulse"
              style={{
                background: 'var(--red)',
                color: '#fff',
                border: 'none',
                borderRadius: '7px',
                padding: '0.5rem 1.25rem',
                fontSize: '0.83rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginLeft: 'auto',
              }}
            >
              Next Challenge →
            </button>
          )}
        </div>
        <ForwardPointerCard room='challenges' onNavigate={onNavigate} onNext={onNext} />

        {/* Sticky bottom bar — shown after rating is selected */}
        {rating && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
            background: 'var(--surface)', borderTop: '1px solid var(--border)',
            padding: '0.75rem 1.5rem',
            paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Case complete
            </span>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={onBack}
                style={{
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: '7px', padding: '0.45rem 1rem',
                  color: 'var(--text-muted)', fontSize: '0.83rem', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ← Back to list
              </button>
              {onNext && (
                <button
                  onClick={onNext}
                  className="pal-glow-pulse"
                  style={{
                    background: 'var(--red)', color: '#fff',
                    border: 'none', borderRadius: '7px',
                    padding: '0.45rem 1.1rem',
                    fontSize: '0.83rem', fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Next challenge →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function BackButton({ onBack, label = '← Challenges' }) {
  return (
    <button
      onClick={onBack}
      style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600,
        padding: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      {label}
    </button>
  );
}

function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Progress
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--red)', fontWeight: 600 }}>
          {current}/{total} sub-questions answered
        </span>
      </div>
      <div style={{
        width: '100%', height: '4px',
        background: 'var(--border)', borderRadius: '99px', overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: 'var(--red)',
          borderRadius: '99px',
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}
