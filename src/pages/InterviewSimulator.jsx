import { useState, useEffect, useRef } from 'react';
import { GateOverlay } from '../components/shared/GateOverlay.jsx';
import { statsModules } from '../data/statsModules.js';
import { rcaCases } from '../data/rcaCases.js';
import { metricCases } from '../data/metricCases.js';
import { estimationProblems } from '../data/estimationProblems.js';
import { Icon } from '../components/shared/Icon.jsx';
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
// Case data exposes a top-level `difficulty` — normalized to 'analyst' | 'senior'
// | 'staff' (V6.0.0). Senior tier prefers senior+analyst; staff tier prefers
// staff+senior. Falls back to the full array when no case matches (keeps seeding
// robust + deterministic).
const TIER_PREFERRED_DIFFICULTIES = {
  senior: ['senior', 'analyst'],
  staff: ['staff', 'senior'],
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

// ─────────────────────────────────────────────────────────────────────────
// Room registry — every room the simulator can draw from. Each entry knows
// its pool, its display label, and its hash route. ROLE_ROUNDS below reference
// these keys; buildSession resolves a key → { room, label, case } at draw time.
// ─────────────────────────────────────────────────────────────────────────
const ROOM_REGISTRY = {
  metrics: { pool: metricCases, label: 'Metrics' },
  stats: { pool: statsModules, label: 'Statistics' },
  rca: { pool: rcaCases, label: 'RCA' },
  estimation: { pool: estimationProblems, label: 'Estimation' },
  behavioral: { pool: behavioralQuestions, label: 'Behavioral' },
  'product-design': { pool: productDesignScenarios, label: 'Product Design' },
  prioritization: { pool: prioritizationScenarios, label: 'Prioritization' },
  cases: { pool: businessCases, label: 'Business Case' },
};

// ─────────────────────────────────────────────────────────────────────────
// ROLE_ROUNDS — per role, an ORDERED interview loop that mirrors a real onsite.
// buildSession walks this template IN ORDER to fill `sessionLength` questions,
// cycling the template if the requested length exceeds its length. Each step
// draws one case from that room's pool via the tier-aware pick.
// ─────────────────────────────────────────────────────────────────────────
const ROLE_ROUNDS = {
  'product-analyst': ['metrics', 'stats', 'rca', 'estimation', 'product-design'],
  'business-analyst': ['cases', 'metrics', 'rca', 'prioritization'],
  'data-analyst': ['stats', 'metrics', 'rca', 'cases'],
  pm: ['product-design', 'prioritization', 'cases', 'behavioral'],
};

function buildSession(role, tier, seed, count = 5) {
  const template = ROLE_ROUNDS[role] || ROLE_ROUNDS.pm;
  const session = [];
  for (let i = 0; i < count; i++) {
    const roomKey = template[i % template.length];
    const room = ROOM_REGISTRY[roomKey] || ROOM_REGISTRY.metrics;
    const roundIndex = i + 1;
    session.push({
      room: roomKey,
      label: room.label,
      roundIndex,
      // Round label like 'Round 2 · RCA' — surfaced in the active + debrief views.
      roundLabel: `Round ${roundIndex} · ${room.label}`,
      // seed + i keeps draws distinct per step and deterministic per day.
      case: pickRandomByTier(room.pool, seed + i, tier),
    });
  }
  return session;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Soft per-round target window — the "real conditions" pacing cue. Rounds aren't
// hard-capped (no auto-advance), but the timer shows green inside the window,
// amber past it, so the candidate feels the clock the way a real loop does.
const ROUND_TARGET_SECONDS = 12 * 60; // ~12 min/round soft target
const ROUND_WARN_SECONDS = 8 * 60;    // under 8 min reads as "moving fast"

// Interviewer framing line per room — opens each round like a staged loop, not a
// quiz. One-question focus per screen; this is the human voice at the top.
const ROOM_INTERVIEWER_PROMPT = {
  metrics: 'your metrics interviewer asks',
  stats: 'your stats interviewer asks',
  rca: 'your RCA interviewer asks',
  estimation: 'your estimation interviewer asks',
  behavioral: 'your hiring manager asks',
  'product-design': 'your product-design interviewer asks',
  prioritization: 'your prioritization interviewer asks',
  cases: 'your case interviewer asks',
};

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

// Extract a flat checklist of model-answer key points for an open question.
// Different rooms store this differently, so probe a priority order of known
// array fields and return the first non-empty string[]:
//   - strongAnswerMarkers  (estimationProblems, behavioralQuestions)
//   - keyTakeaways         (prioritizationScenarios)
//   - keyPrinciples        (behavioralQuestions, alt)
//   - phases[].criteria    (productDesignScenarios — flattened across phases)
// MCQ-structured rooms (metrics / stats / rca / cases) expose no flat rubric,
// so this returns [] and those cases fall back to Strong/OK/Miss self-rating.
function getCaseRubric(roomCase) {
  if (!roomCase) return [];
  const isStrArray = (v) => Array.isArray(v) && v.length > 0 && v.every(x => typeof x === 'string');
  if (isStrArray(roomCase.strongAnswerMarkers)) return roomCase.strongAnswerMarkers;
  if (isStrArray(roomCase.keyTakeaways)) return roomCase.keyTakeaways;
  if (isStrArray(roomCase.keyPrinciples)) return roomCase.keyPrinciples;
  if (Array.isArray(roomCase.phases)) {
    const flat = roomCase.phases
      .flatMap(p => (Array.isArray(p?.criteria) ? p.criteria : []))
      .filter(x => typeof x === 'string');
    if (flat.length > 0) return flat;
  }
  return [];
}

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

const ROLE_OPTIONS = [
  { key: 'product-analyst', label: 'Product Analyst' },
  { key: 'business-analyst', label: 'Business Analyst' },
  { key: 'data-analyst', label: 'Data Analyst' },
  { key: 'pm', label: 'PM / TPM' },
];

// Build the human-readable round order for a role (used on the setup card).
function roleLoopLabels(roleKey) {
  const template = ROLE_ROUNDS[roleKey] || [];
  return template.map(k => ROOM_REGISTRY[k]?.label || k);
}

function roleDisplayLabel(roleKey) {
  return ROLE_OPTIONS.find(r => r.key === roleKey)?.label || 'Candidate';
}

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
          body="A timed, staged mock loop — role-specific rounds, model-answer self-grading, and a full debrief. Designed to replicate the actual interview clock pressure. Part of the full lab."
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
  // Per-round elapsed (resets each round) — the prominent "real conditions" clock.
  const [roundElapsed, setRoundElapsed] = useState(0);
  // Time spent per round, captured on advance — surfaced in the scorecard.
  const [roundTimes, setRoundTimes] = useState({});
  const [revealedCases, setRevealedCases] = useState(new Set());
  const [notes, setNotes] = useState({});
  const [ratings, setRatings] = useState({});
  // Model-answer self-grade coverage: { [questionIndex]: Set(checkedPointIndex) }
  const [coverage, setCoverage] = useState({});
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
        setRoundElapsed(e => e + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [screen]);

  // Reset the per-round clock whenever the active round changes.
  useEffect(() => {
    if (screen === 'active') setRoundElapsed(0);
  }, [currentCaseIndex, screen]);

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
    setRoundElapsed(0);
    setRoundTimes({});
    setRevealedCases(new Set());
    setNotes({});
    setRatings({});
    setCoverage({});
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

  // Toggle a single rubric point as "covered" for an open question.
  function toggleCoveragePoint(questionIndex, pointIndex) {
    setCoverage(prev => {
      const current = new Set(prev[questionIndex] || []);
      if (current.has(pointIndex)) current.delete(pointIndex);
      else current.add(pointIndex);
      return { ...prev, [questionIndex]: current };
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
    // Capture the time spent on this round before moving on.
    const spent = roundElapsed;
    setRoundTimes(prev => ({ ...prev, [currentCaseIndex]: spent }));
    if (currentCaseIndex < sessionLength - 1) {
      setCurrentCaseIndex(i => i + 1);
    } else {
      finishSimulation(spent);
    }
  }

  function finishSimulation(lastRoundSpent) {
    clearInterval(intervalRef.current);
    recognitionRef.current?.stop();
    setIsListening(false);
    // Final round's time may arrive via handleNext before state has flushed.
    const finalRoundTimes = lastRoundSpent !== undefined
      ? { ...roundTimes, [currentCaseIndex]: lastRoundSpent }
      : roundTimes;
    // Persist into state so the debrief scorecard can list every round's time.
    setRoundTimes(finalRoundTimes);
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
        cases: session.map((s, i) => {
          const rubric = getCaseRubric(s.case);
          const checked = coverage[i] ? coverage[i].size : 0;
          return {
            id: s.case?.id || `case-${i}`,
            room: s.room,
            roundIndex: s.roundIndex,
            rating: ratings[i] || null,
            seconds: finalRoundTimes[i] ?? null,
            coverage: rubric.length > 0 ? { checked, total: rubric.length } : null,
          };
        }),
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

  // ── Screen 1: Setup (control room) ───────────────────────────────
  if (screen === 'setup') {
    const ready = role && tier;
    const previewLoop = role ? roleLoopLabels(role) : [];
    return (
      <div className="pal-page-enter" style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0 0 1.5rem 0',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}
        >
          <Icon name='arrow-left' size={14} color='currentColor' /> Back
        </button>

        <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '0.5rem' }}>
          Mock Onsite
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Interview Simulator
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: 1.65, maxWidth: '52ch' }}>
          A staged mock onsite — {sessionLength} timed rounds, ordered for your role, no feedback until the debrief. You walk in cold, work the clock, then read your report card.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, background: 'transparent', border: '1px solid var(--border)', borderRadius: '20px', padding: '0.22rem 0.7rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
            Scripted loop — not live model inference
          </span>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, background: 'transparent', border: '1px solid var(--border)', borderRadius: '20px', padding: '0.22rem 0.7rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
            Cases drawn from the real PAL bank
          </span>
        </div>

        {/* Control room card — every control lives in one focused panel */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '1.5rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            Control Room
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Role
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.5rem' }}>
              {ROLE_OPTIONS.map(r => {
                const loop = roleLoopLabels(r.key).join(' · ');
                return (
                  <button
                    key={r.key}
                    onClick={() => setRole(r.key)}
                    style={{
                      background: role === r.key ? 'var(--accent-bg)' : 'var(--surface-2)',
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
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', lineHeight: 1.4 }}>
                      {loop}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Round order preview — reinforces the staged loop */}
          {role && (
            <div className="pal-reveal-in" style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Loop order
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                {previewLoop.map((label, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '0.24rem 0.65rem',
                      borderRadius: '20px',
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}>
                      <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', fontSize: '0.7rem' }}>{i + 1}</span>
                      {label}
                    </span>
                    {i < previewLoop.length - 1 && (
                      <Icon name='chevron-right' size={12} color='var(--text-muted)' />
                    )}
                  </span>
                ))}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: '0.55rem 0 0', lineHeight: 1.5 }}>
                {previewLoop.length >= sessionLength
                  ? `Your ${sessionLength}-round loop runs the first ${sessionLength} of these in order.`
                  : `Rounds cycle this order until all ${sessionLength} are filled.`}
              </p>
            </div>
          )}

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
                      background: tier === t.key ? 'var(--accent-bg)' : 'var(--surface-2)',
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
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Session Length
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {SESSION_LENGTH_OPTIONS.map(opt => (
                <button
                  key={opt.count}
                  onClick={() => setSessionLength(opt.count)}
                  style={{
                    background: sessionLength === opt.count ? 'var(--accent-bg)' : 'var(--surface-2)',
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
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Mode
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {SESSION_MODE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSessionMode(opt.value)}
                  style={{
                    background: sessionMode === opt.value ? 'var(--accent-bg)' : 'var(--surface-2)',
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
              {sessionMode === 'open' && 'Write your answer, then self-grade against the model-answer checklist.'}
              {sessionMode === 'mcq' && 'Choose from 4 options — immediate feedback after each.'}
              {sessionMode === 'mixed' && 'Alternates: even rounds = MCQ, odd rounds = open-ended.'}
            </p>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '1.25rem 0', lineHeight: 1.55, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Icon name='timer' size={14} color='var(--text-muted)' />
          The clock starts the moment you begin — there is no pausing a round.
        </p>

        <button
          onClick={startSimulation}
          disabled={!ready}
          className={ready ? 'pal-glow-pulse' : undefined}
          style={{
            background: ready ? 'var(--accent)' : 'var(--surface-2)',
            color: ready ? '#000' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.8rem 2rem',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: ready ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
            width: '100%',
          }}
        >
          Begin Interview →
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
    const isMCQQuestion = isQuestionMCQ(currentCaseIndex);
    const mcqQ = isMCQQuestion ? mcqQuestions[currentCaseIndex] : null;
    const mcqAnswered = mcqAnswers[currentCaseIndex] !== undefined;
    const selectedOptionId = mcqAnswers[currentCaseIndex];
    const rubric = isMCQQuestion ? [] : getCaseRubric(roomCase);
    const checkedSet = coverage[currentCaseIndex] || new Set();

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
        {/* Round framing + prominent per-round timer */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: '0.85rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.14em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                Round {currentCaseIndex + 1} of {sessionLength}
              </span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.015em' }}>
                {current?.label}
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                padding: '0.14rem 0.5rem',
                borderRadius: '20px',
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>
                {isMCQQuestion ? 'MCQ' : 'Open-ended'}
              </span>
            </div>
          </div>
          {/* Prominent per-round timer; overall elapsed sits quietly beneath it */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '1.5rem',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: roundElapsed >= ROUND_TARGET_SECONDS
                ? 'var(--accent)'
                : 'var(--text)',
              lineHeight: 1,
            }}>
              <Icon name='timer' size={17} color='currentColor' />
              {formatTime(roundElapsed)}
            </div>
            <div style={{
              fontSize: '0.66rem', fontWeight: 600, color: 'var(--text-muted)',
              letterSpacing: '0.04em', marginTop: '0.3rem',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {roundElapsed >= ROUND_TARGET_SECONDS
                ? 'OVER TARGET'
                : roundElapsed < ROUND_WARN_SECONDS
                  ? `TARGET ~${Math.round(ROUND_TARGET_SECONDS / 60)} MIN`
                  : 'WRAP IT UP'}
              {'  ·  '}
              TOTAL {formatTime(elapsed)}
            </div>
          </div>
        </div>

        {/* Interviewer framing line — opens the round like a staged loop */}
        {!isMCQQuestion && (
          <p style={{
            color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.55,
            margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <Icon name='user' size={14} color='var(--text-muted)' />
            <span>
              Round {currentCaseIndex + 1} — {ROOM_INTERVIEWER_PROMPT[current?.room] || 'your interviewer asks'}:
            </span>
          </p>
        )}

        {/* Round rail — one dot per round. Monochrome by design: no pass/fail
            colour leaks before the debrief. Past rounds fill, current glows
            accent, future rounds stay hairline. */}
        <div
          className="pal-card-enter"
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}
          aria-label={`Round ${currentCaseIndex + 1} of ${sessionLength}`}
        >
          {session.map((s, i) => {
            const isCurrent = i === currentCaseIndex;
            const isPast = i < currentCaseIndex;
            return (
              <div
                key={i}
                title={`Round ${i + 1} · ${s.label}${isPast ? ' (done)' : isCurrent ? ' (now)' : ''}`}
                style={{
                  width: isCurrent ? '26px' : '8px',
                  height: '8px',
                  borderRadius: '20px',
                  background: isCurrent
                    ? 'var(--accent)'
                    : isPast
                      ? 'var(--text-muted)'
                      : 'transparent',
                  border: isPast || isCurrent ? 'none' : '1px solid var(--border)',
                  opacity: isCurrent ? 1 : isPast ? 0.85 : 1,
                  transition: 'width 0.2s, background 0.2s, opacity 0.2s',
                }}
              />
            );
          })}
        </div>

        {/* Case card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.75rem',
          marginBottom: '1.25rem',
        }}>
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
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem', marginRight: 6 }}>Why</span>
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

              {/* Reveal: model answer + self-grade checklist */}
              {isRevealed && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  background: 'var(--surface-2)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Model Answer
                  </div>
                  <p style={{ color: 'var(--text)', fontSize: '0.87rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {getCaseModelAnswer(roomCase)}
                  </p>

                  {/* Self-grade checklist — tick each key point you covered */}
                  {rubric.length > 0 && (
                    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Self-grade — tick what you covered
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
                          {checkedSet.size} / {rubric.length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {rubric.map((point, pi) => {
                          const checked = checkedSet.has(pi);
                          return (
                            <button
                              key={pi}
                              onClick={() => toggleCoveragePoint(currentCaseIndex, pi)}
                              style={{
                                display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                                width: '100%', textAlign: 'left',
                                background: checked ? 'var(--green-bg, rgba(34,197,94,0.1))' : 'var(--surface)',
                                border: `1px solid ${checked ? 'var(--green-border, var(--green))' : 'var(--border)'}`,
                                borderRadius: '8px',
                                padding: '0.6rem 0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.12s',
                              }}
                            >
                              <span style={{
                                minWidth: 20, height: 20, marginTop: '1px',
                                borderRadius: '5px',
                                background: checked ? 'var(--green)' : 'transparent',
                                border: `1.5px solid ${checked ? 'var(--green)' : 'var(--border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                              }}>
                                {checked ? <Icon name='check' size={11} color='currentColor' /> : ''}
                              </span>
                              <span style={{ fontSize: '0.85rem', lineHeight: 1.55, color: checked ? 'var(--text)' : 'var(--text-muted)' }}>
                                {point}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
                {isListening ? (<><Icon name='record' size={13} color='currentColor' /> Stop</>) : (<><Icon name='mic' size={13} color='currentColor' /> Speak</>)}
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
              {isRevealed ? 'Hide Answer' : 'Reveal Answer & Self-Grade'}
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={isMCQQuestion && !mcqAnswered}
            className={!(isMCQQuestion && !mcqAnswered) && (isRevealed || mcqAnswered) ? 'pal-glow-pulse' : undefined}
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
            {isLast ? 'Finish →' : 'Next Round →'}
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
    const roleLabel = roleDisplayLabel(role);
    const hasMCQResults = sessionMode === 'mcq' || sessionMode === 'mixed';

    // ── Scorecard computation ──────────────────────────────────────
    // Per-room breakdown reusing existing session/mcq/ratings data, now with
    // open-answer coverage folded in.
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
          covChecked: 0,
          covTotal: 0,
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
        // Coverage from the model-answer self-grade (open questions with a rubric).
        const rubric = getCaseRubric(s.case);
        if (rubric.length > 0) {
          r.covChecked += coverage[i] ? coverage[i].size : 0;
          r.covTotal += rubric.length;
        }
      }
    });
    const roomBreakdown = Object.values(roomStats);

    // Self-rating tally across the whole session.
    const ratingTally = { strong: 0, ok: 0, miss: 0 };
    Object.values(ratings).forEach(v => {
      if (ratingTally[v] !== undefined) ratingTally[v] += 1;
    });
    const totalRated = ratingTally.strong + ratingTally.ok + ratingTally.miss;

    // Open-answer coverage tally across the whole session.
    let covCheckedTotal = 0;
    let covPointsTotal = 0;
    session.forEach((s, i) => {
      if (isQuestionMCQ(i)) return;
      const rubric = getCaseRubric(s.case);
      if (rubric.length > 0) {
        covCheckedTotal += coverage[i] ? coverage[i].size : 0;
        covPointsTotal += rubric.length;
      }
    });

    // Overall verdict — blend MCQ accuracy, self-ratings, AND open-answer coverage.
    const mcqPct = mcqScores.total > 0 ? mcqScores.correct / mcqScores.total : null;
    // Self-rating score: Strong=1, OK=0.5, Miss=0.
    const ratingPct = totalRated > 0
      ? (ratingTally.strong + ratingTally.ok * 0.5) / totalRated
      : null;
    // Coverage score: checked points / total rubric points across open questions.
    const coveragePct = covPointsTotal > 0 ? covCheckedTotal / covPointsTotal : null;
    const components = [mcqPct, ratingPct, coveragePct].filter(v => v !== null);
    const overallPct = components.length > 0
      ? components.reduce((a, b) => a + b, 0) / components.length
      : null;

    let verdictLabel, verdictColor;
    if (overallPct === null) {
      verdictLabel = 'Session complete';
      verdictColor = 'var(--text)';
    } else if (overallPct >= 0.8) {
      verdictLabel = 'Strong showing';
      verdictColor = 'var(--green)';
    } else if (overallPct >= 0.55) {
      verdictLabel = 'Solid, with gaps';
      verdictColor = 'var(--yellow)';
    } else {
      verdictLabel = 'Needs work';
      verdictColor = 'var(--red)';
    }

    // Weakest rooms for "Practice this" deep-links: rank by lowest combined
    // signal (MCQ %, self-rating, coverage), then most Misses. Only rooms with
    // a known route get a button.
    const weakestRooms = roomBreakdown
      .map(r => {
        const parts = [];
        if (r.mcqTotal > 0) parts.push(r.mcqCorrect / r.mcqTotal);
        const ratedN = r.strong + r.ok + r.miss;
        if (ratedN > 0) parts.push((r.strong + r.ok * 0.5) / ratedN);
        if (r.covTotal > 0) parts.push(r.covChecked / r.covTotal);
        const score = parts.length > 0 ? parts.reduce((a, b) => a + b, 0) / parts.length : 1;
        const signal = parts.length > 0;
        return { ...r, score, signal };
      })
      .filter(r => r.signal && r.score < 0.75 && ROOM_ROUTES[r.room])
      .sort((a, b) => a.score - b.score || b.miss - a.miss)
      .slice(0, 3);

    return (
      <div className="pal-page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '0.5rem' }}>
            Scorecard
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Your mock onsite report
          </h1>
          {/* Session config summary */}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
            <span style={{
              display: 'inline-block',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '0.2rem 0.7rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}>
              {sessionLengthLabel} {sessionLength}Q · {roleLabel} · {sessionModeLabel}
            </span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Total time: <strong style={{ color: 'var(--text)' }}>{formatTime(elapsed)}</strong>
            {hasMCQResults && mcqScores.total > 0 && (
              <>
                {' · '}
                MCQ score:{' '}
                <strong style={{ color: mcqScores.correct === mcqScores.total ? 'var(--green)' : mcqScores.correct / mcqScores.total >= 0.6 ? 'var(--accent)' : 'var(--orange, #f97316)' }}>
                  {mcqScores.correct} / {mcqScores.total} correct
                </strong>
              </>
            )}
            {coveragePct !== null && (
              <>
                {' · '}
                Coverage:{' '}
                <strong style={{ color: coveragePct >= 0.75 ? 'var(--green)' : coveragePct >= 0.4 ? 'var(--yellow)' : 'var(--orange, #f97316)' }}>
                  {covCheckedTotal} / {covPointsTotal} points
                </strong>
              </>
            )}
          </p>
        </div>

        {/* ── Verdict band — monochrome card; the verdict colour is the single
            semantic accent (a thin top hairline + the headline text). ── */}
        <div
          className="pal-reveal-in"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderTop: `2px solid ${verdictColor}`,
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
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                Overall verdict
              </div>
              <div style={{ fontSize: '1.55rem', fontWeight: 700, color: verdictColor, letterSpacing: '-0.015em' }}>
                {verdictLabel}
                {overallPct !== null && (
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '0.5rem', fontVariantNumeric: 'tabular-nums' }}>
                    {Math.round(overallPct * 100)}%
                  </span>
                )}
              </div>
            </div>
            {/* Headline numbers */}
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontVariantNumeric: 'tabular-nums' }}>{formatTime(elapsed)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rounds</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{session.length}</div>
              </div>
              {hasMCQResults && mcqScores.total > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MCQ</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{Math.round(mcqPct * 100)}%</div>
                </div>
              )}
              {coveragePct !== null && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coverage</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{Math.round(coveragePct * 100)}%</div>
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

        {/* ── Rounds timeline — every round listed with its time + result, the
            way a real loop debrief walks each interviewer in order. ── */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              The loop, round by round
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {session.length} rounds · {formatTime(elapsed)} total
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {session.map((s, i) => {
              const wasMCQ = isQuestionMCQ(i);
              const secs = roundTimes[i];
              const overTarget = secs != null && secs >= ROUND_TARGET_SECONDS;
              // Compact per-round result chip.
              let resultLabel = 'Not rated';
              let resultColor = 'var(--text-muted)';
              if (wasMCQ && mcqAnswers[i] !== undefined) {
                const q = mcqQuestions[i];
                const correct = q?.options.find(o => o.id === mcqAnswers[i])?.correct === true;
                resultLabel = correct ? 'Correct' : 'Wrong';
                resultColor = correct ? 'var(--green)' : 'var(--red)';
              } else if (!wasMCQ) {
                const iRubric = getCaseRubric(s.case);
                if (iRubric.length > 0) {
                  const checked = coverage[i] ? coverage[i].size : 0;
                  resultLabel = `${checked}/${iRubric.length} covered`;
                  const ratio = checked / iRubric.length;
                  resultColor = ratio >= 0.75 ? 'var(--green)' : ratio >= 0.4 ? 'var(--yellow)' : 'var(--text-muted)';
                } else if (ratings[i]) {
                  const map = { strong: ['Strong', 'var(--green)'], ok: ['OK', 'var(--yellow)'], miss: ['Miss', 'var(--red)'] };
                  [resultLabel, resultColor] = map[ratings[i]] || [resultLabel, resultColor];
                }
              }
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.7rem 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{
                    minWidth: 22, height: 22, borderRadius: '50%',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
                    fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.88rem' }}>
                    {s.label}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {wasMCQ ? 'MCQ' : 'Open'}
                  </span>
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
                    {secs != null && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: '0.78rem', fontWeight: 700,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontVariantNumeric: 'tabular-nums',
                        color: overTarget ? 'var(--accent)' : 'var(--text)',
                      }}>
                        <Icon name='timer' size={13} color='currentColor' />
                        {formatTime(secs)}
                      </span>
                    )}
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: resultColor }}>
                      {resultLabel}
                    </span>
                  </span>
                </div>
              );
            })}
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
            By room
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {roomBreakdown.map(r => {
              const pillar = ROOM_PILLARS[r.room] || 'Judgment';
              const hasMcq = r.mcqTotal > 0;
              const pct = hasMcq ? Math.round((r.mcqCorrect / r.mcqTotal) * 100) : null;
              const hasCov = r.covTotal > 0;
              const covPct = hasCov ? Math.round((r.covChecked / r.covTotal) * 100) : null;
              return (
                <div
                  key={r.room}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    flexWrap: 'wrap',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--surface-2)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.88rem' }}>
                    {r.label}
                  </span>
                  <span style={{
                    fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '0.12rem 0.5rem', borderRadius: '20px',
                    color: 'var(--text-muted)',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                  }}>
                    {pillar}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {r.total} {r.total === 1 ? 'round' : 'rounds'}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.82rem', fontWeight: 700, display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {hasMcq && (
                      <span style={{ color: pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)' }}>
                        {pct}% correct
                      </span>
                    )}
                    {hasCov && (
                      <span style={{ color: covPct >= 75 ? 'var(--green)' : covPct >= 40 ? 'var(--yellow)' : 'var(--red)' }}>
                        {r.covChecked}/{r.covTotal} covered
                      </span>
                    )}
                    {!hasMcq && !hasCov && (r.strong + r.ok + r.miss) > 0 && (
                      <span style={{ color: 'var(--text-muted)' }}>
                        {r.strong > 0 && <span style={{ color: 'var(--green)' }}>{r.strong}S </span>}
                        {r.ok > 0 && <span style={{ color: 'var(--yellow)' }}>{r.ok}OK </span>}
                        {r.miss > 0 && <span style={{ color: 'var(--red)' }}>{r.miss}M</span>}
                      </span>
                    )}
                    {!hasMcq && !hasCov && (r.strong + r.ok + r.miss) === 0 && (
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontStyle: 'italic' }}>not rated</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Weakest areas → "Practice this" deep-links */}
          {weakestRooms.length > 0 && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
                Weakest areas — drill these next
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
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '0.5rem 0.9rem',
                        color: 'var(--text)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Practice {r.label}
                      <Icon name='arrow-right' size={13} color='var(--accent)' />
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
            const wasQuestionMCQ = isQuestionMCQ(i);
            const mcqQ = wasQuestionMCQ ? mcqQuestions[i] : null;
            const answeredId = mcqAnswers[i];
            const chosenOption = mcqQ?.options.find(o => o.id === answeredId);
            const wasCorrect = chosenOption?.correct === true;
            const rubric = wasQuestionMCQ ? [] : getCaseRubric(roomCase);
            const checkedSet = coverage[i] || new Set();

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
                    background: 'var(--surface-2)',
                    color: 'var(--text-muted)',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.18rem 0.55rem',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                  }}>
                    Round {i + 1}
                  </span>
                  <span style={{
                    background: 'transparent',
                    color: 'var(--text)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.18rem 0.55rem',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {s.label}
                  </span>
                  {roundTimes[i] != null && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      fontSize: '0.7rem', fontWeight: 700,
                      color: 'var(--text-muted)',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      <Icon name='timer' size={12} color='currentColor' />
                      {formatTime(roundTimes[i])}
                    </span>
                  )}
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
                      {wasCorrect ? (<><Icon name='check' size={12} color='currentColor' /> Correct</>) : (<><Icon name='x' size={12} color='currentColor' /> Wrong</>)}
                    </span>
                  )}
                  {!wasQuestionMCQ && rubric.length > 0 && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.18rem 0.55rem',
                      borderRadius: '20px',
                      background: 'var(--surface-2)',
                      color: 'var(--accent)',
                      border: '1px solid var(--border)',
                    }}>
                      {checkedSet.size}/{rubric.length} covered
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
                          <span style={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem', marginRight: 6 }}>Why</span>
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
                      <p style={{ color: 'var(--text-secondary, var(--text-muted))', fontSize: '0.87rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        {getCaseModelAnswer(roomCase)}
                      </p>
                    </div>

                    {/* Coverage checklist recap (cases with a rubric) */}
                    {rubric.length > 0 ? (
                      <div style={{ marginBottom: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Coverage
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
                            {checkedSet.size} / {rubric.length}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {rubric.map((point, pi) => {
                            const checked = checkedSet.has(pi);
                            return (
                              <button
                                key={pi}
                                onClick={() => toggleCoveragePoint(i, pi)}
                                style={{
                                  display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                                  width: '100%', textAlign: 'left',
                                  background: checked ? 'var(--green-bg, rgba(34,197,94,0.1))' : 'var(--surface-2)',
                                  border: `1px solid ${checked ? 'var(--green-border, var(--green))' : 'var(--border)'}`,
                                  borderRadius: '8px',
                                  padding: '0.55rem 0.7rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.12s',
                                }}
                              >
                                <span style={{
                                  minWidth: 18, height: 18, marginTop: '1px',
                                  borderRadius: '5px',
                                  background: checked ? 'var(--green)' : 'transparent',
                                  border: `1.5px solid ${checked ? 'var(--green)' : 'var(--border)'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: '#fff', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                                }}>
                                  {checked ? <Icon name='check' size={11} color='currentColor' /> : ''}
                                </span>
                                <span style={{ fontSize: '0.83rem', lineHeight: 1.5, color: checked ? 'var(--text)' : 'var(--text-muted)' }}>
                                  {point}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Self-rating fallback (cases without a rubric array) */
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
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Shareable score summary card — monochrome; the score is the one accent */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '2rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
                Session score
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {overallPct !== null ? `${Math.round(overallPct * 100)}%` : 'Complete'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                {sessionLengthLabel} · {roleLabel} · {formatTime(elapsed)}
              </div>
            </div>
            <button
              onClick={() => {
                const overall = overallPct !== null ? `${Math.round(overallPct * 100)}%` : 'complete';
                const parts = [`PAL Sim: ${overall}`, roleLabel, `${session.length} rounds`, formatTime(elapsed)];
                if (hasMCQResults && mcqScores.total > 0) parts.push(`MCQ ${mcqScores.correct}/${mcqScores.total}`);
                if (coveragePct !== null) parts.push(`Coverage ${covCheckedTotal}/${covPointsTotal}`);
                navigator.clipboard.writeText(parts.join(' · '));
                alert('Score copied to clipboard!');
              }}
              className="pal-card-hover"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                color: 'var(--text)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              <Icon name='clipboard' size={14} color='currentColor' /> Copy score
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
