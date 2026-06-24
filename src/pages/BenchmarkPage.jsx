// BenchmarkPage.jsx
// Product Analytics Judgment Benchmark — 5 mini-cases, no auth required.
// Screens: intro → question (0–4) → result
// PostHog events: benchmark_start, benchmark_case_answered, benchmark_complete, benchmark_cta_click
// localStorage key: pal-benchmark-v1

import { useState, useEffect } from 'react';
import { BENCHMARK_CASES, AREA_META, RECOMMENDED_PATH } from '../data/benchmarkCases.js';
import { Icon } from '../components/shared/Icon.jsx';
import { track } from '../utils/analytics.js';

const STORAGE_KEY = 'pal-benchmark-v1';

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}

function saveBenchmark(answers, completed) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, completed })); } catch {}
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '1.25rem 1.5rem',
};

const pill = (color) => ({
  display: 'inline-flex', alignItems: 'center',
  background: color + '18', border: '1px solid ' + color + '40',
  borderRadius: '999px', padding: '0.2rem 0.65rem',
  fontSize: '0.72rem', fontWeight: 700, color: color,
  letterSpacing: '0.04em',
});

// ── Intro screen ───────────────────────────────────────────────────────────────
function IntroScreen({ onStart }) {
  const areas = [
    { label: 'Metric Design',    color: 'var(--green)'  },
    { label: 'A/B Test Design',  color: 'var(--accent)' },
    { label: 'A/B Readout',      color: 'var(--teal)'   },
    { label: 'Metrics-Drop RCA', color: 'var(--purple)' },
    { label: 'SQL Reasoning',    color: 'var(--yellow)'  },
  ];
  return (
    <div className="pal-page-enter" style={{ maxWidth: '580px', margin: '0 auto', padding: '2rem 1.25rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '10px',
            background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}><Icon name='zap' size={18} color='currentColor' /></div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Free Benchmark
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Judgment Benchmark
            </h1>
          </div>
        </div>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
          5 questions across the areas that matter most in product analytics interviews.
          No account needed. Rubric-based feedback on every answer.
        </p>
      </div>

      {/* Area list */}
      <div style={{ ...card, marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
          What this tests
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {areas.map((a, i) => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 500 }}>
                {'0' + (i + 1) + '  ' + a.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['5 questions', '~5 minutes', 'No sign-in required', 'Rubric feedback'].map(m => (
          <span key={m} style={{ fontSize: '0.76rem', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '999px', padding: '0.2rem 0.7rem' }}>
            {m}
          </span>
        ))}
      </div>

      <button
        onClick={onStart}
        className="pal-glow-pulse"
        style={{
          width: '100%', padding: '0.875rem',
          background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)',
          color: '#fff', fontSize: '0.95rem', fontWeight: 700,
          cursor: 'pointer', letterSpacing: '-0.01em',
        }}
      >
        Start Benchmark →
      </button>
    </div>
  );
}

// ── Question screen ────────────────────────────────────────────────────────────
function QuestionScreen({ c, idx, total, selectedIdx, revealed, onSelect, onReveal, onNext }) {
  const meta = AREA_META[c.areaId];
  const isLast = idx === total - 1;
  const progress = ((idx) / total) * 100;

  return (
    <div className="pal-page-enter" style={{ maxWidth: '620px', margin: '0 auto', padding: '2rem 1.25rem' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {'Question ' + (idx + 1) + ' of ' + total}
          </span>
          <span style={pill(meta.color)}>{meta.label}</span>
        </div>
        <div style={{ height: 4, background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: progress + '%', background: meta.color, borderRadius: '999px', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Skill tag */}
      <div style={{ marginBottom: '0.875rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {c.skillTag}
        </span>
      </div>

      {/* Prompt */}
      <div style={{ ...card, borderLeft: '3px solid ' + meta.color, marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.925rem', color: 'var(--text)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
          {c.prompt}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
        {c.options.map((opt, i) => {
          let bg = 'var(--surface)';
          let border = 'var(--border)';
          let color = 'var(--text)';
          if (!revealed && selectedIdx === i) {
            bg = 'var(--accent-bg)'; border = 'var(--accent-border)'; color = 'var(--accent)';
          }
          if (revealed && i === c.correctIdx) {
            bg = '#16a34a18'; border = '#16a34a60'; color = '#16a34a';
          }
          if (revealed && i === selectedIdx && i !== c.correctIdx) {
            bg = '#dc262618'; border = '#dc262660'; color = '#dc2626';
          }

          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              disabled={revealed}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                background: bg, border: '1px solid ' + border, borderRadius: 'var(--radius)',
                padding: '0.875rem 1rem', cursor: revealed ? 'default' : 'pointer',
                textAlign: 'left', transition: 'all 0.12s', color,
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                background: i === selectedIdx || (revealed && i === c.correctIdx) ? border : 'transparent',
                border: '1.5px solid ' + border,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700,
              }}>
                {revealed && i === c.correctIdx ? <Icon name='check' size={11} color='currentColor' /> : revealed && i === selectedIdx ? <Icon name='x' size={11} color='currentColor' /> : String.fromCharCode(65 + i)}
              </span>
              <span style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation (revealed) */}
      {revealed && (
        <div className="pal-reveal-in" style={{
          ...card,
          borderLeft: '3px solid ' + (selectedIdx === c.correctIdx ? '#16a34a' : '#dc2626'),
          marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', color: selectedIdx === c.correctIdx ? '#16a34a' : '#dc2626' }}>
            {selectedIdx === c.correctIdx ? 'Correct — here is why' : 'Not quite — here is the reasoning'}
          </div>
          <p style={{ fontSize: '0.865rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            {c.explanation}
          </p>
        </div>
      )}

      {/* Action buttons */}
      {!revealed ? (
        <button
          onClick={onReveal}
          disabled={selectedIdx === null}
          style={{
            width: '100%', padding: '0.8rem',
            background: selectedIdx !== null ? 'var(--accent)' : 'var(--surface)',
            border: '1px solid ' + (selectedIdx !== null ? 'var(--accent)' : 'var(--border)'),
            borderRadius: 'var(--radius)',
            color: selectedIdx !== null ? '#fff' : 'var(--text-dim)',
            fontSize: '0.875rem', fontWeight: 700,
            cursor: selectedIdx !== null ? 'pointer' : 'not-allowed',
            transition: 'all 0.12s',
          }}
        >
          Submit Answer
        </button>
      ) : (
        <button
          onClick={onNext}
          className="pal-glow-pulse"
          style={{
            width: '100%', padding: '0.8rem',
            background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)',
            color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
          }}
        >
          {isLast ? 'See My Results →' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}

// ── Result screen ──────────────────────────────────────────────────────────────
function ResultScreen({ answers, user, onNavigate, onSignIn, onRetake }) {
  const score = answers.filter(a => a.correct).length;
  const total = BENCHMARK_CASES.length;
  const pct = Math.round((score / total) * 100);

  const wrongAreas = answers.filter(a => !a.correct).map(a => a.areaId);
  const weakestId = wrongAreas[0] || null;
  const recommended = weakestId ? RECOMMENDED_PATH[weakestId] : null;

  const verdict = score === 5
    ? 'Analyst-level judgment across all 5 areas.'
    : score >= 3
      ? 'Solid foundation — sharpen the areas you missed.'
      : 'Good starting point — structured practice will move this fast.';

  useEffect(() => {
    track('benchmark_complete', {
      score,
      total,
      pct,
      weakest_area: weakestId,
      strongest_area: answers.find(a => a.correct)?.areaId || null,
    });
  }, []); // eslint-disable-line

  function handleCTA(action, room) {
    track('benchmark_cta_click', { action });
    if (action === 'sign_in') { onSignIn(); }
    else if (action === 'room' && room) { onNavigate(room); }
    else if (action === 'explore') { onNavigate('metrics'); }
  }

  return (
    <div className="pal-page-enter" style={{ maxWidth: '580px', margin: '0 auto', padding: '2rem 1.25rem' }}>
      {/* Score */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: 90, height: 90, borderRadius: '50%', margin: '0 auto 1rem',
          border: '4px solid ' + (score >= 4 ? '#16a34a' : score >= 3 ? 'var(--accent)' : 'var(--yellow)'),
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'var(--surface)',
        }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{'of ' + total}</span>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>
          Benchmark Complete
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>{verdict}</p>
      </div>

      {/* Per-area results */}
      <div style={{ ...card, marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
          Results by area
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {answers.map(a => {
            const meta = AREA_META[a.areaId];
            return (
              <div key={a.areaId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: a.correct ? '#16a34a' : '#dc2626', fontWeight: 700, width: 18 }}>
                  {a.correct ? <Icon name='check' size={13} color='currentColor' /> : <Icon name='x' size={13} color='currentColor' />}
                </span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 500, flex: 1 }}>{meta.label}</span>
                <span style={{ fontSize: '0.75rem', color: a.correct ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                  {a.correct ? 'Correct' : 'Missed'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended path */}
      {recommended && (
        <div style={{ ...card, borderLeft: '3px solid var(--accent)', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' }}>
            Recommended next
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
            {recommended.label}
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0 0 0.875rem', lineHeight: 1.6 }}>
            {recommended.why}
          </p>
          <button
            onClick={() => handleCTA('room', recommended.room)}
            style={{
              padding: '0.55rem 1.1rem',
              background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--accent)',
              fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            {'Go to ' + recommended.label + ' →'}
          </button>
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
        {!user && (
          <button
            onClick={() => handleCTA('sign_in')}
            className="pal-glow-pulse"
            style={{
              padding: '0.875rem', background: 'var(--accent)', border: 'none',
              borderRadius: 'var(--radius)', color: '#fff',
              fontSize: '0.925rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Sign in free to keep practicing →
          </button>
        )}
        {user && (
          <button
            onClick={() => handleCTA('explore')}
            className="pal-glow-pulse"
            style={{
              padding: '0.875rem', background: 'var(--accent)', border: 'none',
              borderRadius: 'var(--radius)', color: '#fff',
              fontSize: '0.925rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Explore free practice cases →
          </button>
        )}
        <button
          onClick={() => handleCTA('explore')}
          style={{
            padding: '0.8rem', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Browse free cases
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onRetake}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Retake benchmark
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export function BenchmarkPage({ user, onNavigate, onSignIn }) {
  const saved = loadSaved();

  const [screen, setScreen]       = useState(saved && saved.completed ? 'result' : 'intro');
  const [currentIdx, setCurrentIdx] = useState(saved && !saved.completed ? (saved.answers?.length || 0) : 0);
  const [answers, setAnswers]     = useState(saved?.answers || []);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [revealed, setRevealed]   = useState(false);

  useEffect(() => {
    saveBenchmark(answers, screen === 'result');
  }, [answers, screen]);

  function handleStart() {
    track('benchmark_start', {});
    setScreen('question');
  }

  function handleSelect(idx) {
    if (revealed) return;
    setSelectedIdx(idx);
  }

  function handleReveal() {
    if (selectedIdx === null) return;
    const c = BENCHMARK_CASES[currentIdx];
    const correct = selectedIdx === c.correctIdx;
    const newAnswers = [...answers, { caseId: c.id, areaId: c.areaId, selectedIdx, correct }];
    setAnswers(newAnswers);
    setRevealed(true);
    track('benchmark_case_answered', { case_id: c.id, area: c.areaId, correct, question_num: currentIdx + 1 });
  }

  function handleNext() {
    if (currentIdx >= BENCHMARK_CASES.length - 1) {
      setScreen('result');
    } else {
      setCurrentIdx(i => i + 1);
      setSelectedIdx(null);
      setRevealed(false);
    }
  }

  function handleRetake() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setScreen('intro');
    setCurrentIdx(0);
    setAnswers([]);
    setSelectedIdx(null);
    setRevealed(false);
  }

  if (screen === 'intro') {
    return <IntroScreen onStart={handleStart} />;
  }
  if (screen === 'question') {
    return (
      <QuestionScreen
        c={BENCHMARK_CASES[currentIdx]}
        idx={currentIdx}
        total={BENCHMARK_CASES.length}
        selectedIdx={selectedIdx}
        revealed={revealed}
        onSelect={handleSelect}
        onReveal={handleReveal}
        onNext={handleNext}
      />
    );
  }
  return (
    <ResultScreen
      answers={answers}
      user={user}
      onNavigate={onNavigate}
      onSignIn={onSignIn}
      onRetake={handleRetake}
    />
  );
}
