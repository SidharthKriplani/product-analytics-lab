import { useState, useEffect, useRef } from 'react';
import { GateOverlay } from '../components/shared/GateOverlay.jsx';
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

// Tier-aware pick: prefers cases whose `difficulty` matches the selected tier.
// Case data exposes a top-level `difficulty` ('analyst' | 'senior' | 'staff',
// plus a few 'advanced'/'intermediate'/'foundational'). Senior tier prefers
// senior+analyst; staff tier prefers senior+staff+advanced. Falls back to the
// full array when no case matches (keeps seeding robust + deterministic).
const TIER_PREFERRED_DIFFICULTIES = {
  senior: ['senior', 'analyst', 'intermediate'],
  staff: ['senior', 'staff', 'advanced'],
};

function pickRandomByTier(arr, seed, tier) {
  if (!arr || arr.length === 0) return null;
  const prefs = TIER_PREFERRED_DIFFICULTIES[tier];
  if (prefs) {
    const filtered = arr.filter(c => c && prefs.includes(c.difficulty));
    if (filtered.length > 0) return filtered[seed % filtered.length];
  }
  return arr[seed % arr.length];
}

function buildSession(role, tier, seed, count = 5) {
  // ─────────────────────────────────────────
  // Data-focused roles (Product Analyst, Business Analyst, Data Analyst)
  // ─────────────────────────────────────────
  const productAnalystQuestions = [
    { room: 'metrics', label: 'Metrics', case: pickRandomByTier(metricCases, seed, tier) },
    { room: 'stats', label: 'Statistics', case: pickRandomByTier(statsModules, seed + 1, tier) },
    { room: 'rca', label: 'RCA', case: pickRandomByTier(rcaCases, seed + 2, tier) },
    { room: 'metrics', label: 'Metrics', case: pickRandomByTier(metricCases, seed + 3, tier) },
    { room: 'estimation', label: 'Estimation', case: pickRandomByTier(estimationProblems, seed + 4, tier) },
    { room: 'stats', label: 'Statistics', case: pickRandomByTier(statsModules, seed + 5, tier) },
    { room: 'rca', label: 'RCA', case: pickRandomByTier(rcaCases, seed + 6, tier) },
    { room: 'behavioral', label: 'Behavioral', case: pickRandomByTier(behavioralQuestions, seed + 7, tier) },
    { room: 'metrics', label: 'Metrics', case: pickRandomByTier(metricCases, seed + 8, tier) },
    { room: 'stats', label: 'Statistics', case: pickRandomByTier(statsModules, seed + 9, tier) },
    { room: 'rca', label: 'RCA', case: pickRandomByTier(rcaCases, seed + 10, tier) },
    { room: 'estimation', label: 'Estimation', case: pickRandomByTier(estimationProblems, seed + 11, tier) },
  ];

  const businessAnalystQuestions = [
    { room: 'cases', label: 'Business Case', case: pickRandomByTier(businessCases, seed, tier) },
    { room: 'metrics', label: 'Metrics', case: pickRandomByTier(metricCases, seed + 1, tier) },
    { room: 'rca', label: 'RCA', case: pickRandomByTier(rcaCases, seed + 2, tier) },
    { room: 'cases', label: 'Business Case', case: pickRandomByTier(businessCases, seed + 3, tier) },
    { room: 'prioritization', label: 'Prioritization', case: pickRandomByTier(prioritizationScenarios, seed + 4, tier) },
    { room: 'estimation', label: 'Estimation', case: pickRandomByTier(estimationProblems, seed + 5, tier) },
    { room: 'behavioral', label: 'Behavioral', case: pickRandomByTier(behavioralQuestions, seed + 6, tier) },
    { room: 'metrics', label: 'Metrics', case: pickRandomByTier(metricCases, seed + 7, tier) },
    { room: 'cases', label: 'Business Case', case: pickRandomByTier(businessCases, seed + 8, tier) },
    { room: 'rca', label: 'RCA', case: pickRandomByTier(rcaCases, seed + 9, tier) },
    { room: 'prioritization', label: 'Prioritization', case: pickRandomByTier(prioritizationScenarios, seed + 10, tier) },
    { room: 'estimation', label: 'Estimation', case: pickRandomByTier(estimationProblems, seed + 11, tier) },
  ];

  const dataAnalystQuestions = [
    { room: 'stats', label: 'Statistics', case: pickRandomByTier(statsModules, seed, tier) },
    { room: 'metrics', label: 'Metrics', case: pickRandomByTier(metricCases, seed + 1, tier) },
    { room: 'rca', label: 'RCA', case: pickRandomByTier(rcaCases, seed + 2, tier) },
    { room: 'stats', label: 'Statistics', case: pickRandomByTier(statsModules, seed + 3, tier) },
    { room: 'metrics', label: 'Metrics', case: pickRandomByTier(metricCases, seed + 4, tier) },
    { room: 'rca', label: 'RCA', case: pickRandomByTier(rcaCases, seed + 5, tier) },
    { room: 'estimation', label: 'Estimation', case: pickRandomByTier(estimationProblems, seed + 6, tier) },
    { room: 'behavioral', label: 'Behavioral', case: pickRandomByTier(behavioralQuestions, seed + 7, tier) },
    { room: 'stats', label: 'Statistics', case: pickRandomByTier(statsModules, seed + 8, tier) },
    { room: 'metrics', label: 'Metrics', case: pickRandomByTier(metricCases, seed + 9, tier) },
    { room: 'rca', label: 'RCA', case: pickRandomByTier(rcaCases, seed + 10, tier) },
    { room: 'estimation', label: 'Estimation', case: pickRandomByTier(estimationProblems, seed + 11, tier) },
  ];

  const pmQuestions = [
    { room: 'product-design', label: 'Product Design', case: pickRandomByTier(productDesignScenarios, seed, tier) },
    { room: 'prioritization', label: 'Prioritization', case: pickRandomByTier(prioritizationScenarios, seed + 1, tier) },
    { room: 'estimation', label: 'Estimation', case: pickRandomByTier(estimationProblems, seed + 2, tier) },
    { room: 'behavioral', label: 'Behavioral', case: pickRandomByTier(behavioralQuestions, seed + 3, tier) },
    { room: 'cases', label: 'Business Case', case: pickRandomByTier(businessCases, seed + 4, tier) },
    { room: 'product-design', label: 'Product Design', case: pickRandomByTier(productDesignScenarios, seed + 5, tier) },
    { room: 'prioritization', label: 'Prioritization', case: pickRandomByTier(prioritizationScenarios, seed + 6, tier) },
    { room: 'estimation', label: 'Estimation', case: pickRandomByTier(estimationProblems, seed + 7, tier) },
    { room: 'behavioral', label: 'Behavioral', case: pickRandomByTier(behavioralQuestions, seed + 8, tier) },
    { room: 'cases', label: 'Business Case', case: pickRandomByTier(businessCases, seed + 9, tier) },
    { room: 'product-design', label: 'Product Design', case: pickRandomByTier(productDesignScenarios, seed + 10, tier) },
    { room: 'prioritization', label: 'Prioritization', case: pickRandomByTier(prioritizationScenarios, seed + 11, tier) },
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

// Room key → hash route for the room's landing page.
// Keys match the `room` field set in buildSession; routes confirmed against
// src/utils/hashRouting.js PAGE_TO_HASH (the room key IS the hash segment for these).
const ROOM_ROUTES = {
  metrics: 'metrics',
  rca: 'rca',
  stats: 'stats',
  estimation: 'estimation',
  'product-design': 'product-design',
  prioritization: 'prioritization',
  cases: 'cases',
  behavioral: 'behavioral',
};

// Room key → interview pillar label (subtle categorization, not a score).
const ROOM_PILLARS = {
  mcq: 'Recall',
  trainer: 'Recall',
  estimation: 'Fluency',
  behavioral: 'Behavioral',
  metrics: 'Judgment',
  rca: 'Judgment',
  stats: 'Judgment',
  cases: 'Judgment',
  'product-design': 'Judgment',
  prioritization: 'Judgment',
};

const PILLAR_COLORS = {
  Recall: 'var(--yellow)',
  Fluency: 'var(--blue, #3b82f6)',
  Behavioral: 'var(--accent)',
  Judgment: 'var(--green)',
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
      <>
        <InterviewSimulatorInner onBack={onBack} onNavigate={onNavigate} />
        <GateOverlay
          title="Interview Simulator"
          body="Timed end-to-end mock with a randomized case set — designed to replicate the actual interview clock pressure. Part of the full lab."
          ctaLabel="Unlock the full lab →"
          onCTA={() => onNavigate('unlock')}
        />
      </>
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
          {/* Progress rail — one segment per case, colored by self-rating */}
          <div
            className="pal-card-enter"
            style={{ display: 'flex', gap: '0.3rem', flex: 1, minWidth: 0, flexWrap: 'wrap' }}
            aria-label={`Case ${currentCaseIndex + 1} of ${sessionLength}`}
          >
            {session.map((s, i) => {
              const isCurrent = i === currentCaseIndex;
              const wasRevealed = revealedCases.has(i);
              const wasMcqAnswered = mcqAnswers[i] !== undefined;
              const rating = ratings[i];
              const ratingColor =
                rating === 'strong' ? 'var(--green)'
                : rating === 'ok' ? 'var(--yellow)'
                : rating === 'miss' ? 'var(--red)'
                : null;
              const answered = rating || wasRevealed || wasMcqAnswered;
              const segBg = isCurrent
                ? 'var(--accent)'
                : ratingColor
                  ? ratingColor
                  : answered
                    ? 'var(--text-muted)'
                    : 'var(--border)';
              return (
                <div
                  key={i}
                  title={`Case ${i + 1}${rating ? ' · ' + rating : ''}`}
                  style={{
                    height: '6px',
                    flex: '1 1 0',
                    minWidth: '14px',
                    borderRadius: '20px',
                    background: segBg,
                    opacity: isCurrent ? 1 : answered ? 0.95 : 0.55,
                    transform: isCurrent ? 'scaleY(1.5)' : 'scaleY(1)',
                    transition: 'background 0.18s, transform 0.18s, opacity 0.18s',
                  }}
                />
              );
            })}
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

    // ── Scorecard computation ──────────────────────────────────────
    // Per-room breakdown reusing existing session/mcq/ratings data.
    const roomStats = {};
    session.forEach((s, i) => {
      const key = s.room;
      if (!roomStats[key]) {
        roomStats[key] = {
          room: key,
          label: s.label,
          total: 0,
          mcqTotal: 0,
          mcqCorrect: 0,
          strong: 0,
          ok: 0,
          miss: 0,
        };
      }
      const r = roomStats[key];
      r.total += 1;
      if (isQuestionMCQ(i) && mcqAnswers[i] !== undefined) {
        r.mcqTotal += 1;
        const q = mcqQuestions[i];
        const chosen = q?.options.find(o => o.id === mcqAnswers[i]);
        if (chosen?.correct) r.mcqCorrect += 1;
      } else {
        if (ratings[i] === 'strong') r.strong += 1;
        else if (ratings[i] === 'ok') r.ok += 1;
        else if (ratings[i] === 'miss') r.miss += 1;
      }
    });
    const roomBreakdown = Object.values(roomStats);

    // Self-rating tally across the whole session.
    const ratingTally = { strong: 0, ok: 0, miss: 0 };
    Object.values(ratings).forEach(v => {
      if (ratingTally[v] !== undefined) ratingTally[v] += 1;
    });
    const totalRated = ratingTally.strong + ratingTally.ok + ratingTally.miss;

    // Overall verdict — combine MCQ accuracy (if any) and self-ratings.
    const mcqPct = mcqScores.total > 0 ? mcqScores.correct / mcqScores.total : null;
    // Self-rating score: Strong=1, OK=0.5, Miss=0.
    const ratingPct = totalRated > 0
      ? (ratingTally.strong + ratingTally.ok * 0.5) / totalRated
      : null;
    let overallPct;
    if (mcqPct !== null && ratingPct !== null) overallPct = (mcqPct + ratingPct) / 2;
    else if (mcqPct !== null) overallPct = mcqPct;
    else if (ratingPct !== null) overallPct = ratingPct;
    else overallPct = null;

    let verdictLabel, verdictColor, verdictBg;
    if (overallPct === null) {
      verdictLabel = 'Session complete';
      verdictColor = 'var(--text)';
      verdictBg = 'var(--surface-2)';
    } else if (overallPct >= 0.8) {
      verdictLabel = 'Strong showing';
      verdictColor = 'var(--green)';
      verdictBg = 'var(--green-bg, rgba(34,197,94,0.1))';
    } else if (overallPct >= 0.55) {
      verdictLabel = 'Solid, with gaps';
      verdictColor = 'var(--yellow)';
      verdictBg = 'var(--yellow-bg, rgba(234,179,8,0.1))';
    } else {
      verdictLabel = 'Needs work';
      verdictColor = 'var(--red)';
      verdictBg = 'var(--red-bg, rgba(239,68,68,0.1))';
    }

    // Weakest rooms for "Practice this" deep-links: rank by lowest MCQ % then
    // most Misses. Only rooms with a known route get a button.
    const weakestRooms = roomBreakdown
      .map(r => {
        const score = r.mcqTotal > 0
          ? r.mcqCorrect / r.mcqTotal
          : (r.strong + r.ok * 0.5) / Math.max(1, r.strong + r.ok + r.miss);
        const signal = r.mcqTotal > 0 || (r.strong + r.ok + r.miss) > 0;
        return { ...r, score, signal };
      })
      .filter(r => r.signal && r.score < 0.75 && ROOM_ROUTES[r.room])
      .sort((a, b) => a.score - b.score || b.miss - a.miss)
      .slice(0, 3);

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

        {/* ── Verdict band ── */}
        <div
          className="pal-reveal-in"
          style={{
            background: verdictBg,
            border: `1px solid ${verdictColor}`,
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                Overall
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: verdictColor, letterSpacing: '-0.01em' }}>
                {verdictLabel}
                {overallPct !== null && (
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    {Math.round(overallPct * 100)}%
                  </span>
                )}
              </div>
            </div>
            {/* Headline numbers */}
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>{formatTime(elapsed)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cases</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{session.length}</div>
              </div>
              {hasMCQResults && mcqScores.total > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MCQ</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{Math.round(mcqPct * 100)}%</div>
                </div>
              )}
              {totalRated > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Self-rated</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)' }}>
                    <span style={{ color: 'var(--green)' }}>{ratingTally.strong}S</span>
                    {' · '}
                    <span style={{ color: 'var(--yellow)' }}>{ratingTally.ok}OK</span>
                    {' · '}
                    <span style={{ color: 'var(--red)' }}>{ratingTally.miss}M</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Per-room breakdown ── */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.25rem',
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
            By Room
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {roomBreakdown.map(r => {
              const pillar = ROOM_PILLARS[r.room] || 'Judgment';
              const pillarColor = PILLAR_COLORS[pillar] || 'var(--text-muted)';
              const roomColor = ROOM_COLORS[r.room] || 'var(--accent)';
              const hasMcq = r.mcqTotal > 0;
              const pct = hasMcq ? Math.round((r.mcqCorrect / r.mcqTotal) * 100) : null;
              return (
                <div
                  key={r.room}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    flexWrap: 'wrap',
                    padding: '0.6rem 0.75rem',
                    background: 'var(--surface-2)',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${roomColor}`,
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.88rem' }}>
                    {r.label}
                  </span>
                  <span style={{
                    fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '0.12rem 0.45rem', borderRadius: '20px',
                    color: pillarColor,
                    background: 'var(--surface)',
                    border: `1px solid ${pillarColor}`,
                  }}>
                    {pillar}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {r.total} {r.total === 1 ? 'case' : 'cases'}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.82rem', fontWeight: 700 }}>
                    {hasMcq ? (
                      <span style={{ color: pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)' }}>
                        {pct}% correct
                      </span>
                    ) : (r.strong + r.ok + r.miss) > 0 ? (
                      <span style={{ color: 'var(--text-muted)' }}>
                        {r.strong > 0 && <span style={{ color: 'var(--green)' }}>{r.strong}S </span>}
                        {r.ok > 0 && <span style={{ color: 'var(--yellow)' }}>{r.ok}OK </span>}
                        {r.miss > 0 && <span style={{ color: 'var(--red)' }}>{r.miss}M</span>}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontStyle: 'italic' }}>not rated</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Practice this → deep-links for weakest rooms */}
          {weakestRooms.length > 0 && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                Practice your weak spots
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {weakestRooms.map(r => {
                  const route = ROOM_ROUTES[r.room];
                  return (
                    <button
                      key={r.room}
                      className="pal-card-hover"
                      onClick={() => { window.location.hash = '#/' + route; }}
                      style={{
                        background: 'var(--surface-2)',
                        border: `1px solid ${ROOM_COLORS[r.room] || 'var(--accent)'}`,
                        borderRadius: '8px',
                        padding: '0.5rem 0.9rem',
                        color: 'var(--text)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Practice {r.label} →
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
