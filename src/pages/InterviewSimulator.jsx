import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { statsModules } from '../data/statsModules.js';
import { rcaCases } from '../data/rcaCases.js';
import { metricCases } from '../data/metricCases.js';
import { estimationProblems } from '../data/estimationProblems.js';
import { behavioralQuestions } from '../data/behavioralQuestions.js';
import { productDesignScenarios } from '../data/productDesignScenarios.js';
import { prioritizationScenarios } from '../data/prioritizationScenarios.js';
import { businessCases } from '../data/businessCases.js';
import { trainerMCQ } from '../data/trainerMCQ.js';

function pickRandom(arr, seed) {
  if (!arr || arr.length === 0) return null;
  const idx = seed % arr.length;
  return arr[idx];
}

function buildSession(role, tier, seed, count = 5) {
  // ─────────────────────────────────────────
  // Data-focused roles (Product Analyst, Business Analyst, Data Analyst)
  // ─────────────────────────────────────────
  const productAnalystQuestions = [
    { room: 'metrics', label: 'Metrics', case: pickRandom(metricCases, seed) },
    { room: 'stats', label: 'Statistics', case: pickRandom(statsModules, seed + 1) },
    { room: 'rca', label: 'RCA', case: pickRandom(rcaCases, seed + 2) },
    { room: 'metrics', label: 'Metrics', case: pickRandom(metricCases, seed + 3) },
    { room: 'estimation', label: 'Estimation', case: pickRandom(estimationProblems, seed + 4) },
    { room: 'stats', label: 'Statistics', case: pickRandom(statsModules, seed + 5) },
    { room: 'rca', label: 'RCA', case: pickRandom(rcaCases, seed + 6) },
    { room: 'behavioral', label: 'Behavioral', case: pickRandom(behavioralQuestions, seed + 7) },
    { room: 'metrics', label: 'Metrics', case: pickRandom(metricCases, seed + 8) },
    { room: 'stats', label: 'Statistics', case: pickRandom(statsModules, seed + 9) },
    { room: 'rca', label: 'RCA', case: pickRandom(rcaCases, seed + 10) },
    { room: 'estimation', label: 'Estimation', case: pickRandom(estimationProblems, seed + 11) },
  ];

  const businessAnalystQuestions = [
    { room: 'cases', label: 'Business Case', case: pickRandom(businessCases, seed) },
    { room: 'metrics', label: 'Metrics', case: pickRandom(metricCases, seed + 1) },
    { room: 'rca', label: 'RCA', case: pickRandom(rcaCases, seed + 2) },
    { room: 'cases', label: 'Business Case', case: pickRandom(businessCases, seed + 3) },
    { room: 'prioritization', label: 'Prioritization', case: pickRandom(prioritizationScenarios, seed + 4) },
    { room: 'estimation', label: 'Estimation', case: pickRandom(estimationProblems, seed + 5) },
    { room: 'behavioral', label: 'Behavioral', case: pickRandom(behavioralQuestions, seed + 6) },
    { room: 'metrics', label: 'Metrics', case: pickRandom(metricCases, seed + 7) },
    { room: 'cases', label: 'Business Case', case: pickRandom(businessCases, seed + 8) },
    { room: 'rca', label: 'RCA', case: pickRandom(rcaCases, seed + 9) },
    { room: 'prioritization', label: 'Prioritization', case: pickRandom(prioritizationScenarios, seed + 10) },
    { room: 'estimation', label: 'Estimation', case: pickRandom(estimationProblems, seed + 11) },
  ];

  const dataAnalystQuestions = [
    { room: 'stats', label: 'Statistics', case: pickRandom(statsModules, seed) },
    { room: 'metrics', label: 'Metrics', case: pickRandom(metricCases, seed + 1) },
    { room: 'rca', label: 'RCA', case: pickRandom(rcaCases, seed + 2) },
    { room: 'stats', label: 'Statistics', case: pickRandom(statsModules, seed + 3) },
    { room: 'metrics', label: 'Metrics', case: pickRandom(metricCases, seed + 4) },
    { room: 'rca', label: 'RCA', case: pickRandom(rcaCases, seed + 5) },
    { room: 'estimation', label: 'Estimation', case: pickRandom(estimationProblems, seed + 6) },
    { room: 'behavioral', label: 'Behavioral', case: pickRandom(behavioralQuestions, seed + 7) },
    { room: 'stats', label: 'Statistics', case: pickRandom(statsModules, seed + 8) },
    { room: 'metrics', label: 'Metrics', case: pickRandom(metricCases, seed + 9) },
    { room: 'rca', label: 'RCA', case: pickRandom(rcaCases, seed + 10) },
    { room: 'estimation', label: 'Estimation', case: pickRandom(estimationProblems, seed + 11) },
  ];

  const pmQuestions = [
    { room: 'product-design', label: 'Product Design', case: pickRandom(productDesignScenarios, seed) },
    { room: 'prioritization', label: 'Prioritization', case: pickRandom(prioritizationScenarios, seed + 1) },
    { room: 'estimation', label: 'Estimation', case: pickRandom(estimationProblems, seed + 2) },
    { room: 'behavioral', label: 'Behavioral', case: pickRandom(behavioralQuestions, seed + 3) },
    { room: 'cases', label: 'Business Case', case: pickRandom(businessCases, seed + 4) },
    { room: 'product-design', label: 'Product Design', case: pickRandom(productDesignScenarios, seed + 5) },
    { room: 'prioritization', label: 'Prioritization', case: pickRandom(prioritizationScenarios, seed + 6) },
    { room: 'estimation', label: 'Estimation', case: pickRandom(estimationProblems, seed + 7) },
    { room: 'behavioral', label: 'Behavioral', case: pickRandom(behavioralQuestions, seed + 8) },
    { room: 'cases', label: 'Business Case', case: pickRandom(businessCases, seed + 9) },
    { room: 'product-design', label: 'Product Design', case: pickRandom(productDesignScenarios, seed + 10) },
    { room: 'prioritization', label: 'Prioritization', case: pickRandom(prioritizationScenarios, seed + 11) },
  ];

  // Select question pool by role
  let questionPool;
  if (role === 'product-analyst') questionPool = productAnalystQuestions;
  else if (role === 'business-analyst') questionPool = businessAnalystQuestions;
  else if (role === 'data-analyst') questionPool = dataAnalystQuestions;
  else questionPool = pmQuestions;

  return questionPool.slice(0, count);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getCasePrompt(roomCase) {
  if (!roomCase) return '';
  return (
    roomCase.situation?.context ||
    roomCase.context?.metricMovement ||
    roomCase.context?.executiveAsk ||
    roomCase.context ||
    roomCase.prompt ||
    roomCase.setup?.metric ||
    ''
  );
}

function getCaseModelAnswer(roomCase) {
  if (!roomCase) return '';
  if (roomCase.modelAnswer) {
    if (typeof roomCase.modelAnswer === 'string') return roomCase.modelAnswer;
    return (
      roomCase.modelAnswer.walkthrough ||
      roomCase.modelAnswer.situation ||
      roomCase.modelAnswer.fullAnswer ||
      JSON.stringify(roomCase.modelAnswer, null, 2)
    );
  }
  if (roomCase.fullAnalysis) return roomCase.fullAnalysis;
  if (roomCase.keyInsight) return roomCase.keyInsight;
  return 'Model answer not available for this case type. Review the framework steps and grading criteria.';
}

const ROOM_COLORS = {
  stats: 'var(--purple)',
  rca: 'var(--orange, #f97316)',
  metrics: 'var(--green)',
  estimation: 'var(--blue, #3b82f6)',
  behavioral: 'var(--accent)',
  'product-design': 'var(--purple)',
  prioritization: 'var(--green)',
  cases: 'var(--orange, #f97316)',
};

const SESSION_LENGTH_OPTIONS = [
  { label: 'Quick', count: 3 },
  { label: 'Standard', count: 5 },
  { label: 'Full Loop', count: 8 },
  { label: 'Marathon', count: 12 },
];

const SESSION_MODE_OPTIONS = [
  { label: 'Open-ended', value: 'open' },
  { label: 'MCQ', value: 'mcq' },
  { label: 'Mixed', value: 'mixed' },
];

// Speech Recognition support check (module scope, evaluated once)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const hasSpeech = !!SpeechRecognition;

export function InterviewSimulator({ onBack, onNavigate, unlocked }) {
  if (!unlocked) {
    return (
      <div className="pal-page-enter" style={{ maxWidth: '480px', margin: '4rem auto', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
          Interview Simulator — Full Access Only
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          The Interview Simulator is part of full access. Enter your access code to run mock sessions across all roles and formats.
        </p>
        <button
          onClick={() => onNavigate('unlock')}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '0.6rem 1.5rem',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
          }}
        >
          Enter Access Code →
        </button>
      </div>
    );
  }
  return <InterviewSimulatorInner onBack={onBack} onNavigate={onNavigate} />;
}

function InterviewSimulatorInner({ onBack, onNavigate }) {
  const [screen, setScreen] = useState('setup'); // 'setup' | 'active' | 'debrief'
  const [role, setRole] = useState(null);
  const [tier, setTier] = useState(null); // 'senior' | 'staff'
  const [sessionLength, setSessionLength] = useState(5); // default Standard
  const [sessionMode, setSessionMode] = useState('open'); // 'open' | 'mcq' | 'mixed'
  const [session, setSession] = useState(null);
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [revealedCases, setRevealedCases] = useState(new Set());
  const [notes, setNotes] = useState({});
  const [ratings, setRatings] = useState({});
  // MCQ state
  const [mcqQuestions, setMcqQuestions] = useState([]); // MCQ picked per question index
  const [mcqAnswers, setMcqAnswers] = useState({}); // { [questionIndex]: optionId }
  const [mcqScores, setMcqScores] = useState({ correct: 0, total: 0 });
  // Speech state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const intervalRef = useRef(null);

  // Timer
  useEffect(() => {
    if (screen === 'active') {
      intervalRef.current = setInterval(() => {
        setElapsed(e => e + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [screen]);

  // Stop speech recognition when navigating away from active screen
  useEffect(() => {
    if (screen !== 'active') {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  }, [screen]);

  function isQuestionMCQ(index) {
    if (sessionMode === 'mcq') return true;
    if (sessionMode === 'mixed') return index % 2 === 0; // even-indexed = MCQ
    return false;
  }

  function startSimulation() {
    const seed = Math.floor(Date.now() / 86400000);
    const built = buildSession(role, tier, seed, sessionLength);
    setSession(built);
    setCurrentCaseIndex(0);
    setElapsed(0);
    setRevealedCases(new Set());
    setNotes({});
    setRatings({});
    setMcqAnswers({});
    setMcqScores({ correct: 0, total: 0 });
    // Pre-pick MCQ questions for each index
    const picked = built.map((_, i) => pickRandom(trainerMCQ, seed + i * 7));
    setMcqQuestions(picked);
    setScreen('active');
  }

  function toggleReveal(idx) {
    setRevealedCases(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function handleMcqAnswer(questionIndex, optionId) {
    if (mcqAnswers[questionIndex] !== undefined) return; // already answered
    const mcqQ = mcqQuestions[questionIndex];
    const chosen = mcqQ?.options.find(o => o.id === optionId);
    const isCorrect = chosen?.correct === true;
    setMcqAnswers(prev => ({ ...prev, [questionIndex]: optionId }));
    setMcqScores(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  }

  function handleNext() {
    // Stop speech if listening
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    if (currentCaseIndex < sessionLength - 1) {
      setCurrentCaseIndex(i => i + 1);
    } else {
      finishSimulation();
    }
  }

  function finishSimulation() {
    clearInterval(intervalRef.current);
    recognitionRef.current?.stop();
    setIsListening(false);
    // Save to localStorage
    try {
      const history = JSON.parse(localStorage.getItem('pal-sim-history-v1') || '[]');
      history.unshift({
        date: new Date().toISOString(),
        role,
        tier,
        sessionLength,
        sessionMode,
        elapsedSeconds: elapsed,
        mcqScores,
        cases: session.map((s, i) => ({
          id: s.case?.id || `case-${i}`,
          room: s.room,
          rating: ratings[i] || null,
        })),
      });
      localStorage.setItem('pal-sim-history-v1', JSON.stringify(history.slice(0, 20)));
    } catch {}
    setScreen('debrief');
  }

  function toggleSpeech() {
    if (!hasSpeech) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript).join(' ');
      // Append to current notes
      setNotes(prev => ({
        ...prev,
        [currentCaseIndex]: (prev[currentCaseIndex] ? prev[currentCaseIndex] + ' ' : '') + transcript,
      }));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  // ── Screen 1: Setup ──────────────────────────────────────────────
  if (screen === 'setup') {
    return (
      <div className="pal-page-enter" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0 0 1.5rem 0',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}
        >
          ← Back
        </button>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
          Interview Simulator
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          Strings real cases into a timed loop — no hints mid-session, no feedback until it is over. Debriefs the full session afterward so you see patterns, not just individual answers.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.55rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            ~ Scripted — not live model inference
          </span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.55rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            Cases drawn from real PAL case bank
          </span>
        </div>
        <p style={{ display: 'none' }}>
        </p>

        {/* Role selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Role
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.5rem' }}>
            {[
              { key: 'product-analyst', label: 'Product Analyst', sub: 'Metrics · Stats · RCA · Estimation' },
              { key: 'business-analyst', label: 'Business Analyst', sub: 'Cases · Metrics · RCA · Prioritization' },
              { key: 'data-analyst', label: 'Data Analyst', sub: 'Stats · Metrics · RCA focus' },
              { key: 'pm', label: 'PM / TPM', sub: 'Product Design · Prioritization · Cases' },
            ].map(r => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                style={{
                  background: role === r.key ? 'var(--accent-bg)' : 'var(--surface)',
                  border: role === r.key ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '0.7rem 0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.12s, background 0.12s',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: role === r.key ? 'var(--accent)' : 'var(--text)', marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>
                  {r.label}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', lineHeight: 1.4 }}>
                  {r.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tier selector */}
        {role && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Level
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { key: 'senior', label: 'Senior', sub: 'Challenging cases' },
                { key: 'staff', label: 'Staff', sub: 'Most difficult cases' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTier(t.key)}
                  style={{
                    background: tier === t.key ? 'var(--accent-bg)' : 'var(--surface)',
                    border: tier === t.key ? '2px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '0.55rem 0.9rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.12s, background 0.12s',
                    flex: 1,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: tier === t.key ? 'var(--accent)' : 'var(--text)', marginBottom: '0.1rem' }}>
                    {t.label}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    {t.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Session Length selector */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Session Length
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {SESSION_LENGTH_OPTIONS.map(opt => (
              <button
                key={opt.count}
                onClick={() => setSessionLength(opt.count)}
                style={{
                  background: sessionLength === opt.count ? 'var(--accent-bg)' : 'var(--surface)',
                  border: sessionLength === opt.count ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.3rem 0.8rem',
                  color: sessionLength === opt.count ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: sessionLength === opt.count ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {opt.label} ({opt.count}Q)
              </button>
            ))}
          </div>
        </div>

        {/* Mode selector */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Mode
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {SESSION_MODE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSessionMode(opt.value)}
                style={{
                  background: sessionMode === opt.value ? 'var(--accent-bg)' : 'var(--surface)',
                  border: sessionMode === opt.value ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.3rem 0.8rem',
                  color: sessionMode === opt.value ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: sessionMode === opt.value ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.4rem 0 0' }}>
            {sessionMode === 'open' && 'Write your answers to case prompts.'}
            {sessionMode === 'mcq' && 'Choose from 4 options — immediate feedback after each.'}
            {sessionMode === 'mixed' && 'Alternates: even questions = MCQ, odd questions = open-ended.'}
          </p>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Cases are drawn randomly from your selected role. Timer starts when you begin.
        </p>

        <button
          onClick={startSimulation}
          disabled={!role || !tier}
          style={{
            background: (role && tier) ? 'var(--accent)' : 'var(--surface-2)',
            color: (role && tier) ? '#000' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: (role && tier) ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
          }}
        >
          Start Simulation →
        </button>
      </div>
    );
  }

  // ── Screen 2: Active Simulation ──────────────────────────────────
  if (screen === 'active' && session) {
    const current = session[currentCaseIndex];
    const roomCase = current?.case;
    const isLast = currentCaseIndex === sessionLength - 1;
    const isRevealed = revealedCases.has(currentCaseIndex);
    const roomColor = ROOM_COLORS[current?.room] || 'var(--accent)';
    const isMCQQuestion = isQuestionMCQ(currentCaseIndex);
    const mcqQ = isMCQQuestion ? mcqQuestions[currentCaseIndex] : null;
    const mcqAnswered = mcqAnswers[currentCaseIndex] !== undefined;
    const selectedOptionId = mcqAnswers[currentCaseIndex];

    const casePromptText =
      (typeof getCasePrompt(roomCase) === 'string'
        ? getCasePrompt(roomCase)
        : JSON.stringify(getCasePrompt(roomCase))) || 'No prompt text available.';

    function mcqOptionStyle(opt) {
      const base = {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        width: '100%',
        padding: '0.75rem 1rem',
        marginBottom: '0.5rem',
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: '8px',
        color: 'var(--text)',
        fontSize: '0.88rem',
        textAlign: 'left',
        cursor: mcqAnswered ? 'default' : 'pointer',
        transition: 'all 0.12s',
        lineHeight: 1.5,
      };
      if (!mcqAnswered) return base;
      if (opt.correct) {
        return { ...base, background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', color: 'var(--green)' };
      }
      if (opt.id === selectedOptionId && !opt.correct) {
        return { ...base, background: 'var(--red-bg)', border: '1.5px solid var(--red-border)', color: 'var(--red)' };
      }
      return { ...base, background: 'var(--surface-2)', color: 'var(--text-muted)', borderColor: 'var(--border-subtle, var(--border))' };
    }

    return (
      <div className="pal-page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Progress + Timer bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {session.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: i === currentCaseIndex ? 700 : 400,
                  background: i < currentCaseIndex
                    ? 'var(--green-bg, rgba(34,197,94,0.1))'
                    : i === currentCaseIndex
                      ? 'var(--surface-2)'
                      : 'var(--surface)',
                  color: i < currentCaseIndex
                    ? 'var(--green)'
                    : i === currentCaseIndex
                      ? 'var(--text)'
                      : 'var(--text-muted)',
                  border: i === currentCaseIndex
                    ? '1px solid var(--border)'
                    : '1px solid transparent',
                  cursor: 'default',
                }}
              >
                {i + 1}/{sessionLength}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Mode badge */}
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.18rem 0.55rem',
              borderRadius: '20px',
              background: 'var(--surface-2)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>
              {sessionMode === 'open' ? 'Open-ended' : sessionMode === 'mcq' ? 'MCQ' : 'Mixed'}
            </span>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '1rem',
              color: elapsed > 2700 ? 'var(--orange, #f97316)' : 'var(--text-muted)',
              fontWeight: 600,
            }}>
              ⏱ {formatTime(elapsed)}
            </div>
          </div>
        </div>

        {/* Case card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.75rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              background: roomColor,
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}>
              {current?.label}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Case {currentCaseIndex + 1} of {sessionLength}
            </span>
            {isMCQQuestion && (
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                background: 'var(--surface-2)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}>
                MCQ
              </span>
            )}
          </div>

          {isMCQQuestion && mcqQ ? (
            /* MCQ question view */
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                {mcqQ.question}
              </h2>
              <div>
                {mcqQ.options.map((opt, i) => (
                  <button
                    key={opt.id}
                    disabled={mcqAnswered}
                    onClick={() => handleMcqAnswer(currentCaseIndex, opt.id)}
                    style={mcqOptionStyle(opt)}
                  >
                    <span style={{
                      minWidth: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: mcqAnswered && opt.correct
                        ? 'var(--green)'
                        : mcqAnswered && opt.id === selectedOptionId && !opt.correct
                          ? 'var(--red)'
                          : 'var(--border)',
                      color: mcqAnswered && (opt.correct || opt.id === selectedOptionId) ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
              {mcqAnswered && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.85rem 1rem',
                  background: 'var(--surface-2)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  lineHeight: 1.65,
                  color: 'var(--text)',
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--yellow, #eab308)', marginRight: 6 }}>Explanation</span>
                  {mcqQ.explanation}
                </div>
              )}
            </div>
          ) : (
            /* Open-ended question view */
            <>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
                {roomCase?.title || 'Case'}
              </h2>

              <p style={{ color: 'var(--text-secondary, var(--text-muted))', fontSize: '0.9rem', lineHeight: 1.7 }}>
                {casePromptText}
              </p>

              {/* Reveal toggle */}
              {isRevealed && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  background: 'var(--surface-2)',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${roomColor}`,
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Model Answer
                  </div>
                  <p style={{ color: 'var(--text)', fontSize: '0.87rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {getCaseModelAnswer(roomCase)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Notes (open-ended only) */}
        {!isMCQQuestion && (
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <textarea
              value={notes[currentCaseIndex] || ''}
              onChange={e => setNotes(n => ({ ...n, [currentCaseIndex]: e.target.value }))}
              placeholder="Write your thinking here..."
              style={{
                width: '100%',
                minHeight: '160px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1rem',
                paddingBottom: hasSpeech ? '2.75rem' : '1rem',
                color: 'var(--text)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {hasSpeech && (
              <button
                onClick={toggleSpeech}
                style={{
                  position: 'absolute', right: '8px', bottom: '8px',
                  background: isListening ? 'var(--red-bg)' : 'var(--surface)',
                  border: `1px solid ${isListening ? 'var(--red-border)' : 'var(--border)'}`,
                  borderRadius: '6px', padding: '0.35rem 0.5rem',
                  cursor: 'pointer', fontSize: '0.8rem',
                  color: isListening ? 'var(--red)' : 'var(--text-muted)',
                }}
                title={isListening ? 'Stop recording' : 'Speak your answer'}
              >
                {isListening ? '🔴 Stop' : '🎤 Speak'}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {!isMCQQuestion && (
            <button
              onClick={() => toggleReveal(currentCaseIndex)}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.6rem 1.25rem',
                color: 'var(--text-muted)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isRevealed ? 'Hide Answer' : 'Reveal Answer'}
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={isMCQQuestion && !mcqAnswered}
            style={{
              background: isMCQQuestion && !mcqAnswered ? 'var(--surface-2)' : 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.5rem',
              color: isMCQQuestion && !mcqAnswered ? 'var(--text-muted)' : '#000',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: isMCQQuestion && !mcqAnswered ? 'not-allowed' : 'pointer',
              marginLeft: 'auto',
            }}
          >
            {isLast ? 'Finish →' : 'Next Case →'}
          </button>
        </div>
      </div>
    );
  }

  // ── Screen 3: Debrief ────────────────────────────────────────────
  if (screen === 'debrief' && session) {
    const RATING_OPTIONS = [
      { value: 'strong', label: 'Strong', color: 'var(--green)' },
      { value: 'ok', label: 'OK', color: 'var(--accent)' },
      { value: 'miss', label: 'Miss', color: 'var(--orange, #f97316)' },
    ];

    const sessionLengthLabel = SESSION_LENGTH_OPTIONS.find(o => o.count === sessionLength)?.label || 'Standard';
    const sessionModeLabel = SESSION_MODE_OPTIONS.find(o => o.value === sessionMode)?.label || 'Open-ended';
    const roleLabel = role === 'ds' ? 'Data / Product Analyst' : 'PM / TPM / Product Lead';
    const hasMCQResults = sessionMode === 'mcq' || sessionMode === 'mixed';

    return (
      <div className="pal-page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
            Debrief
          </h1>
          {/* Session config summary */}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '0.2rem 0.65rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text)',
            }}>
              {sessionLengthLabel} {sessionLength}Q · {roleLabel} · {sessionModeLabel}
            </span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Total time: <strong style={{ color: 'var(--text)' }}>{formatTime(elapsed)}</strong>
            {hasMCQResults && (
              <>
                {' · '}
                MCQ score:{' '}
                <strong style={{ color: mcqScores.correct === mcqScores.total ? 'var(--green)' : mcqScores.correct / mcqScores.total >= 0.6 ? 'var(--accent)' : 'var(--orange, #f97316)' }}>
                  {mcqScores.correct} / {mcqScores.total} correct
                </strong>
              </>
            )}
          </p>
        </div>

        {/* Per-room breakdown chart */}
        {hasMCQResults && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
              Skill Breakdown
            </h3>
            {(() => {
              const breakdown = {};
              session.forEach((s, i) => {
                const room = s.label;
                if (!breakdown[room]) breakdown[room] = { total: 0, correct: 0 };
                breakdown[room].total += 1;
                if (isQuestionMCQ(i) && mcqAnswers[i] !== undefined) {
                  const mcqQ = mcqQuestions[i];
                  const chosenOpt = mcqQ?.options.find(o => o.id === mcqAnswers[i]);
                  if (chosenOpt?.correct) breakdown[room].correct += 1;
                }
              });
              const chartData = Object.entries(breakdown).map(([room, stats]) => ({
                room,
                pct: Math.round((stats.correct / stats.total) * 100),
              }));
              return (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="room" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} label={{ value: '% Correct', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--text)',
                      }} />
                      <Bar dataKey="pct" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {session.map((s, i) => {
            const roomCase = s?.case;
            const roomColor = ROOM_COLORS[s?.room] || 'var(--accent)';
            const wasQuestionMCQ = isQuestionMCQ(i);
            const mcqQ = wasQuestionMCQ ? mcqQuestions[i] : null;
            const answeredId = mcqAnswers[i];
            const chosenOption = mcqQ?.options.find(o => o.id === answeredId);
            const wasCorrect = chosenOption?.correct === true;

            return (
              <div
                key={i}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    background: roomColor,
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.18rem 0.55rem',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}>
                    {s.label}
                  </span>
                  {wasQuestionMCQ && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.18rem 0.55rem',
                      borderRadius: '20px',
                      background: 'var(--surface-2)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}>
                      MCQ
                    </span>
                  )}
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>
                    {wasQuestionMCQ ? `Q${i + 1}` : (roomCase?.title || `Case ${i + 1}`)}
                  </span>
                  {wasQuestionMCQ && answeredId !== undefined && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.18rem 0.55rem',
                      borderRadius: '20px',
                      background: wasCorrect ? 'var(--green-bg)' : 'var(--red-bg)',
                      color: wasCorrect ? 'var(--green)' : 'var(--red)',
                      border: `1px solid ${wasCorrect ? 'var(--green-border)' : 'var(--red-border)'}`,
                    }}>
                      {wasCorrect ? '✓ Correct' : '✗ Wrong'}
                    </span>
                  )}
                </div>

                {wasQuestionMCQ && mcqQ ? (
                  /* MCQ debrief */
                  <div>
                    <p style={{ color: 'var(--text)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                      {mcqQ.question}
                    </p>
                    {answeredId !== undefined ? (
                      <div style={{ fontSize: '0.85rem', lineHeight: 1.65, padding: '0.75rem', background: 'var(--surface-2)', borderRadius: '6px', borderLeft: `3px solid ${wasCorrect ? 'var(--green)' : 'var(--red)'}` }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)', marginRight: 4 }}>You chose:</span>
                        <span style={{ color: wasCorrect ? 'var(--green)' : 'var(--red)' }}>{chosenOption?.text}</span>
                        {!wasCorrect && (
                          <div style={{ marginTop: '0.4rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-muted)', marginRight: 4 }}>Correct:</span>
                            <span style={{ color: 'var(--green)' }}>{mcqQ.options.find(o => o.correct)?.text}</span>
                          </div>
                        )}
                        <div style={{ marginTop: '0.6rem', color: 'var(--text)', fontSize: '0.83rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--yellow, #eab308)', marginRight: 4 }}>Explanation</span>
                          {mcqQ.explanation}
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>Not answered.</p>
                    )}
                  </div>
                ) : (
                  /* Open-ended debrief */
                  <>
                    {/* Notes */}
                    {notes[i] ? (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Your Notes
                        </div>
                        <p style={{ color: 'var(--text)', fontSize: '0.87rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: '6px' }}>
                          {notes[i]}
                        </p>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                        No notes written.
                      </p>
                    )}

                    {/* Model answer */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Model Answer
                      </div>
                      <p style={{ color: 'var(--text-secondary, var(--text-muted))', fontSize: '0.87rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: '6px', borderLeft: `3px solid ${roomColor}` }}>
                        {getCaseModelAnswer(roomCase)}
                      </p>
                    </div>

                    {/* Self-rating */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Self-Rate
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {RATING_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setRatings(r => ({ ...r, [i]: opt.value }))}
                            style={{
                              background: ratings[i] === opt.value ? opt.color : 'var(--surface-2)',
                              border: ratings[i] === opt.value ? `2px solid ${opt.color}` : '2px solid var(--border)',
                              borderRadius: '6px',
                              padding: '0.35rem 0.9rem',
                              color: ratings[i] === opt.value ? '#fff' : 'var(--text-muted)',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.12s',
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Shareable score summary card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent-bg))',
          border: '2px solid var(--accent)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '2rem',
          marginBottom: '1.5rem',
          color: '#000',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(0,0,0,0.7)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                Session Score
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {hasMCQResults ? `${mcqScores.correct}/${mcqScores.total}` : 'Complete'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(0,0,0,0.65)', marginTop: '0.2rem' }}>
                {sessionLengthLabel} · {roleLabel} · {formatTime(elapsed)}
              </div>
            </div>
            <button
              onClick={() => {
                const summary = hasMCQResults
                  ? `PAL: ${mcqScores.correct}/${mcqScores.total} · ${Math.round((mcqScores.correct / mcqScores.total) * 100)}% · ${roleLabel} · ${formatTime(elapsed)}`
                  : `PAL: ${sessionLengthLabel} complete · ${roleLabel} · ${formatTime(elapsed)}`;
                navigator.clipboard.writeText(summary);
                alert('Score copied to clipboard!');
              }}
              style={{
                background: 'rgba(0,0,0,0.15)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                color: '#000',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.25)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.15)'}
            >
              📋 Copy Score
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setScreen('setup')}
            style={{
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.7rem 1.5rem',
              color: '#000',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Run Another Sim
          </button>
          <button
            onClick={onBack}
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.7rem 1.5rem',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
