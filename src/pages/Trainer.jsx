import { useState, useEffect, useCallback } from 'react';
import { trainerMCQ, trainerMCQByCategory } from '../data/trainerMCQ.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSession(selectedCategories, difficulty, length) {
  let pool = trainerMCQ;
  if (!selectedCategories.includes('all')) {
    pool = pool.filter((q) => selectedCategories.includes(q.category));
  }
  if (difficulty !== 'all') {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }
  const shuffled = shuffleArray(pool);
  return length === 'all' ? shuffled : shuffled.slice(0, Number(length));
}

function saveScore({ score, total, categories }) {
  try {
    const prev = JSON.parse(localStorage.getItem('pal-trainer-scores-v1') || '[]');
    prev.push({ timestamp: Date.now(), score, total, categories });
    localStorage.setItem('pal-trainer-scores-v1', JSON.stringify(prev));
  } catch (_) {}
}

const CATEGORIES = ['statistics', 'experimentation', 'metrics', 'growth', 'product', 'behavioral', 'estimation'];
const DIFFICULTIES = ['all', 'analyst', 'senior', 'staff'];
const LENGTHS = [5, 10, 20, 'all'];

const difficultyLabel = { all: 'All', analyst: 'Analyst', senior: 'Senior', staff: 'Staff' };
const categoryLabel = {
  all: 'All',
  statistics: 'Statistics',
  experimentation: 'Experimentation',
  metrics: 'Metrics',
  growth: 'Growth',
  product: 'Product',
  behavioral: 'Behavioral',
  estimation: 'Estimation',
};

function scoreColor(pct) {
  if (pct >= 0.7) return 'var(--green)';
  if (pct >= 0.4) return 'var(--yellow)';
  return 'var(--red)';
}
function scoreLabel(pct) {
  if (pct >= 0.7) return 'Excellent!';
  if (pct >= 0.4) return 'Getting there';
  return 'Keep practicing';
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen({ onStart }) {
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [difficulty, setDifficulty] = useState('all');
  const [length, setLength] = useState(10);

  function toggleCategory(cat) {
    if (cat === 'all') {
      setSelectedCategories(['all']);
      return;
    }
    setSelectedCategories((prev) => {
      const withoutAll = prev.filter((c) => c !== 'all');
      if (withoutAll.includes(cat)) {
        const next = withoutAll.filter((c) => c !== cat);
        return next.length === 0 ? ['all'] : next;
      } else {
        return [...withoutAll, cat];
      }
    });
  }

  const previewPool = buildSession(selectedCategories, difficulty, length);

  const pillBase = {
    padding: '6px 14px',
    borderRadius: 20,
    border: '1.5px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 500,
    transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
    userSelect: 'none',
  };
  const pillActive = {
    ...pillBase,
    background: 'var(--green-bg)',
    border: '1.5px solid var(--green-border)',
    color: 'var(--green)',
  };

  return (
    <div className="pal-page-enter" style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{
        background: 'var(--green-bg)',
        border: '1.5px solid var(--green-border)',
        borderRadius: 12,
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>MCQ Quiz</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.55 }}>
          Concept fluency is the floor — you cannot build judgment on shaky definitions. This surfaces the distinctions that trip candidates at the wrong moment: p-value vs significance, precision vs recall, SRM vs power. Run it under timed conditions until the answers are automatic.
        </p>
      </div>

      {/* Category filter */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Category
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['all', ...CATEGORIES].map((cat) => {
            const active = cat === 'all'
              ? selectedCategories.includes('all')
              : selectedCategories.includes(cat) && !selectedCategories.includes('all') || (!selectedCategories.includes('all') && selectedCategories.includes(cat));
            const isActive = selectedCategories.includes(cat);
            return (
              <button key={cat} style={isActive ? pillActive : pillBase} onClick={() => toggleCategory(cat)}>
                {categoryLabel[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty filter */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Difficulty
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              style={difficulty === d ? pillActive : pillBase}
              onClick={() => setDifficulty(d)}
            >
              {difficultyLabel[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Session length */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Session Length
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {LENGTHS.map((l) => (
            <button
              key={l}
              style={length === l ? pillActive : pillBase}
              onClick={() => setLength(l)}
            >
              {l === 'all' ? 'All' : `${l} Qs`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '0.75rem 1rem',
        marginBottom: '1.25rem',
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
      }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{previewPool.length}</span> question{previewPool.length !== 1 ? 's' : ''} across{' '}
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{trainerMCQ.length}</span> total · 7 categories
      </div>

      {/* Start button */}
      <button
        disabled={previewPool.length === 0}
        onClick={() => onStart(selectedCategories, difficulty, length)}
        style={{
          width: '100%',
          padding: '0.875rem',
          borderRadius: 'var(--radius)',
          border: 'none',
          background: previewPool.length === 0 ? 'var(--border)' : 'var(--green)',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: previewPool.length === 0 ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.15s',
        }}
      >
        {previewPool.length === 0 ? 'No questions match' : 'Start Training →'}
      </button>
    </div>
  );
}

// ─── Question Screen ───────────────────────────────────────────────────────────

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function QuestionScreen({ questions, currentIndex, onAnswer, onNext, answers, score }) {
  const q = questions[currentIndex];
  const answered = answers[currentIndex] !== undefined;
  const selectedId = answers[currentIndex];
  const total = questions.length;
  const [hoveredId, setHoveredId] = useState(null);

  const handleKey = useCallback((e) => {
    if (['1', '2', '3', '4'].includes(e.key) && !answered) {
      const idx = parseInt(e.key, 10) - 1;
      if (q.options[idx]) onAnswer(q.options[idx].id);
    }
    if ((e.key === ' ' || e.key === 'Enter') && answered) {
      e.preventDefault();
      onNext();
    }
  }, [answered, onAnswer, onNext, q]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  function optionStyle(opt) {
    const base = {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      width: '100%',
      minHeight: 48,
      padding: '0.75rem 1rem',
      borderRadius: 'var(--radius)',
      border: '1.5px solid var(--border)',
      background: !answered && hoveredId === opt.id ? 'var(--surface-2)' : 'var(--surface)',
      color: 'var(--text)',
      fontSize: '0.9rem',
      textAlign: 'left',
      cursor: answered ? 'default' : 'pointer',
      transition: 'background var(--transition), border-color var(--transition)',
      marginBottom: 8,
    };
    if (!answered) return base;

    if (opt.correct) {
      return { ...base, background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', color: 'var(--green)' };
    }
    if (opt.id === selectedId && !opt.correct) {
      return { ...base, background: 'var(--red-bg)', border: '1.5px solid var(--red-border)', color: 'var(--red)' };
    }
    return { ...base, background: 'var(--surface-2)', color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' };
  }

  const pct = total > 0 ? (currentIndex / total) * 100 : 0;

  return (
    <div className="pal-page-enter" style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Progress bar + score chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: 'var(--radius-sm)', transition: 'width 0.3s' }} />
        </div>
        <div style={{
          background: 'var(--green-bg)',
          border: '1px solid var(--green-border)',
          borderRadius: 20,
          padding: '3px 12px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--green)',
          whiteSpace: 'nowrap',
        }}>
          ✓ {score} correct / {Object.keys(answers).length} answered
        </div>
      </div>

      {/* Question number */}
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem', fontWeight: 500 }}>
        Question {currentIndex + 1} of {total}
      </p>

      {/* Question card */}
      <div style={{
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 12,
        padding: '1.5rem',
        boxShadow: 'var(--shadow)',
      }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
          <span style={{
            background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-sm)', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
          }}>
            {q.category}
          </span>
          <span style={{
            background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
          }}>
            {q.difficulty}
          </span>
        </div>

        {/* Question text */}
        <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
          {q.question}
        </p>

        {/* Options */}
        <div>
          {q.options.map((opt, i) => (
            <button
              key={opt.id}
              disabled={answered}
              onClick={() => !answered && onAnswer(opt.id)}
              style={optionStyle(opt)}
              onMouseEnter={() => { if (!answered) setHoveredId(opt.id); }}
              onMouseLeave={() => { if (!answered) setHoveredId(null); }}
            >
              <span style={{
                minWidth: 26,
                height: 26,
                borderRadius: '50%',
                background: answered && opt.correct
                  ? 'var(--green)'
                  : answered && opt.id === selectedId && !opt.correct
                    ? 'var(--red)'
                    : 'var(--border)',
                color: answered && (opt.correct || opt.id === selectedId) ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0,
                transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
              }}>
                {OPTION_LETTERS[i]}
              </span>
              <span style={{ flex: 1 }}>{opt.text}</span>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {answered && (
          <div style={{
            marginTop: '1rem',
            background: 'var(--yellow-bg)',
            border: '1.5px solid var(--yellow-border)',
            borderRadius: 'var(--radius)',
            padding: '0.875rem 1rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            animation: 'fadeIn 0.15s ease',
          }}>
            <span style={{ fontWeight: 700, color: 'var(--yellow)', marginRight: 6 }}>Explanation</span>
            {q.explanation}
          </div>
        )}
      </div>

      {/* Next button */}
      {answered && (
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onNext}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius)',
              border: 'none',
              background: 'var(--green)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            {currentIndex + 1 === total ? 'See Results →' : 'Next →'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// ─── Debrief Screen ────────────────────────────────────────────────────────────

function DebriefScreen({ questions, answers, onRetry, onNewSession, onBack }) {
  const [expandedMissed, setExpandedMissed] = useState(false);
  const score = Object.entries(answers).filter(([idx, id]) => {
    const q = questions[parseInt(idx)];
    return q && q.options.find((o) => o.id === id)?.correct;
  }).length;
  const total = questions.length;
  const pct = total > 0 ? score / total : 0;

  // Category breakdown
  const catStats = {};
  questions.forEach((q, i) => {
    if (!catStats[q.category]) catStats[q.category] = { correct: 0, total: 0 };
    catStats[q.category].total += 1;
    if (q.options.find((o) => o.id === answers[i])?.correct) {
      catStats[q.category].correct += 1;
    }
  });

  // Missed questions
  const missed = questions.filter((q, i) => {
    const selected = answers[i];
    return !q.options.find((o) => o.id === selected)?.correct;
  });

  return (
    <div className="pal-page-enter" style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Score header */}
      <div style={{
        textAlign: 'center',
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 14,
        padding: '2rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 900, color: scoreColor(pct), lineHeight: 1 }}>
          {score} / {total}
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: scoreColor(pct), marginTop: 8 }}>
          {scoreLabel(pct)}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 6 }}>
          {Math.round(pct * 100)}% correct
        </div>
      </div>

      {/* Weak topic heatmap grid */}
      <div style={{
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 12,
        padding: '1.25rem 1.5rem',
        marginBottom: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Skill Heatmap
        </h3>
        {/* Colored grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {Object.entries(catStats).map(([cat, { correct, total: catTotal }]) => {
            const catPct = catTotal > 0 ? correct / catTotal : 0;
            const color = scoreColor(catPct);
            return (
              <div key={cat} style={{
                background: catPct >= 0.8 ? 'var(--green-bg)' : catPct >= 0.5 ? 'var(--yellow-bg)' : 'var(--red-bg)',
                border: `1px solid ${catPct >= 0.8 ? 'var(--green-border)' : catPct >= 0.5 ? 'var(--yellow-border)' : 'var(--red-border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.65rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color, textTransform: 'capitalize', marginBottom: '0.2rem', letterSpacing: '0.03em' }}>{cat}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color }}>{Math.round(catPct * 100)}%</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{correct}/{catTotal}</div>
              </div>
            );
          })}
        </div>
        {/* Study next hint */}
        {(() => {
          const weakCat = Object.entries(catStats)
            .map(([cat, { correct, total: catTotal }]) => ({ cat, pct: catTotal > 0 ? correct / catTotal : 0 }))
            .sort((a, b) => a.pct - b.pct)[0];
          if (!weakCat || weakCat.pct >= 0.8) return null;
          return (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
              Study next: <strong style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{weakCat.cat}</strong> — {Math.round(weakCat.pct * 100)}% correct this session.
            </div>
          );
        })()}
        {/* Progress bars */}
        <div style={{ marginTop: '1rem' }}>
          {Object.entries(catStats).map(([cat, { correct, total: catTotal }]) => {
            const catPct = catTotal > 0 ? correct / catTotal : 0;
            return (
              <div key={cat} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{cat}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{correct}/{catTotal}</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <div style={{ width: `${catPct * 100}%`, height: '100%', background: scoreColor(catPct), borderRadius: 'var(--radius-sm)', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missed questions */}
      {missed.length > 0 && (
        <div style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 12,
          marginBottom: '1.25rem',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <button
            onClick={() => setExpandedMissed((v) => !v)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text)',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            <span>Review Missed Questions ({missed.length})</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{expandedMissed ? '▲' : '▼'}</span>
          </button>
          {expandedMissed && (
            <div style={{ borderTop: '1px solid var(--border)', padding: '0 1.5rem 1rem' }}>
              {missed.map((q, i) => {
                const correctOpt = q.options.find((o) => o.correct);
                return (
                  <div key={q.id} style={{
                    borderBottom: i < missed.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    paddingBottom: '1rem',
                    marginBottom: '1rem',
                    paddingTop: '1rem',
                  }}>
                    <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>
                      {q.question}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      background: 'var(--green-bg)',
                      border: '1px solid var(--green-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem 0.75rem',
                      marginBottom: '0.5rem',
                    }}>
                      <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.75rem', marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--green)' }}>{correctOpt?.text}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{q.explanation}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onRetry} style={{
          flex: 1,
          padding: '0.75rem',
          borderRadius: 'var(--radius)',
          border: '1.5px solid var(--green-border)',
          background: 'var(--green-bg)',
          color: 'var(--green)',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}>
          Try Again
        </button>
        <button onClick={onNewSession} style={{
          flex: 1,
          padding: '0.75rem',
          borderRadius: 'var(--radius)',
          border: '1.5px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-secondary)',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}>
          New Session
        </button>
        <button onClick={onBack} style={{
          flex: 1,
          padding: '0.75rem',
          borderRadius: 'var(--radius)',
          border: 'none',
          background: 'var(--accent)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ─── Main Trainer Page ─────────────────────────────────────────────────────────

export function Trainer({ onBack }) {
  const [screen, setScreen] = useState('setup'); // 'setup' | 'question' | 'debrief'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sessionConfig, setSessionConfig] = useState(null);

  const score = Object.entries(answers).filter(([idx, id]) => {
    const q = questions[parseInt(idx)];
    return q && q.options.find((o) => o.id === id)?.correct;
  }).length;

  function handleStart(selectedCategories, difficulty, length) {
    const qs = buildSession(selectedCategories, difficulty, length);
    if (qs.length === 0) return;
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswers({});
    setSessionConfig({ selectedCategories, difficulty, length });
    setScreen('question');
  }

  function handleAnswer(optionId) {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionId }));
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      // Save score
      const cats = sessionConfig?.selectedCategories || ['all'];
      const finalScore = Object.entries({ ...answers }).filter(([idx, id]) => {
        const q = questions[parseInt(idx)];
        return q && q.options.find((o) => o.id === id)?.correct;
      }).length;
      saveScore({ score: finalScore, total: questions.length, categories: cats });
      setScreen('debrief');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleRetry() {
    setQuestions((prev) => shuffleArray(prev));
    setCurrentIndex(0);
    setAnswers({});
    setScreen('question');
  }

  function handleNewSession() {
    setScreen('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setSessionConfig(null);
  }

  if (screen === 'setup') {
    return <SetupScreen onStart={handleStart} />;
  }

  if (screen === 'question') {
    return (
      <QuestionScreen
        key={currentIndex}
        questions={questions}
        currentIndex={currentIndex}
        onAnswer={handleAnswer}
        onNext={handleNext}
        answers={answers}
        score={score}
      />
    );
  }

  if (screen === 'debrief') {
    return (
      <DebriefScreen
        questions={questions}
        answers={answers}
        onRetry={handleRetry}
        onNewSession={handleNewSession}
        onBack={onBack}
      />
    );
  }

  return null;
}
