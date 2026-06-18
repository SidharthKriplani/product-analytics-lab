import { useState, useEffect, useMemo } from 'react';
import { businessCases } from '../../data/businessCases.js';
import { CaseStepPanel } from './CaseStepPanel.jsx';
import { CaseScoreReveal } from './CaseScoreReveal.jsx';
import { CaseDebriefPanel } from './CaseDebriefPanel.jsx';
import { saveCaseAttempt, clearCaseProgress, saveCaseDraft, loadCaseDraft, clearCaseDraft } from '../../utils/caseProgress.js';
import { track } from '../../utils/analytics.js';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { LeadershipLens } from '../shared/LeadershipLens.jsx';
import { Breadcrumb } from '../shared/Breadcrumb.jsx';
import { GateOverlay } from '../shared/GateOverlay.jsx';
import { ShareLinkButton } from '../shared/ShareLinkButton.jsx';

// ─── Seeded shuffle helpers ───
// Deterministic per caseId+phaseId so the same tester sees the same order
// but the strong option is not locked to position A
function hashStr(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}
function seededShuffle(arr, seed) {
  const result = [...arr];
  let s = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    s = ((s * 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

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

// Phase labels for display
const PHASE_LABELS = {
  clarify:    'Clarify the Decision',
  kpi:        'Choose the KPI',
  hypothesis: 'Frame the Hypothesis',
  data_cut:   'Identify the Data Cut',
  method:     'Choose the Method',
  recommend:  'Structure the Recommendation',
};

const LEVEL_DOT_CONFIG = {
  strong:  { color: 'var(--teal)',   label: 'Strong' },
  partial: { color: 'var(--yellow)', label: 'Partial' },
  wrong:   { color: 'var(--red)',    label: 'Needs work' },
};

// ─── Scoring ───

function scorePhase(level) {
  if (level === 'strong') return 2;
  if (level === 'partial') return 1;
  return 0;
}

function computeScore(businessCase, phaseChoices) {
  let score = 0;
  const maxScore = businessCase.phases.length * 2;
  for (const phase of businessCase.phases) {
    const chosenId = phaseChoices[phase.id];
    if (chosenId) {
      const opt = phase.options.find(o => o.id === chosenId);
      if (opt) score += scorePhase(opt.level);
    }
  }
  const pct = maxScore > 0 ? score / maxScore : 0;
  let level;
  if (pct >= 0.8) level = 'staff';
  else if (pct >= 0.6) level = 'senior';
  else if (pct >= 0.4) level = 'analyst';
  else level = 'junior';
  return { score, maxScore, level, pct };
}

// ─── Main Runner ───

export function CaseRunner({ caseId, savedProgress, unlocked, onBack, onNext, onNavigate, user, onShowAuth }) {
  const businessCase = businessCases.find(b => b.id === caseId);
  const _draft = !savedProgress ? loadCaseDraft(businessCase.id) : null;
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(_draft ? (_draft.currentPhaseIndex || 0) : 0);
  const [phaseChoices, setPhaseChoices] = useState({});          // phaseId → optionId (pending)
  const [submittedChoices, setSubmittedChoices] = useState(_draft ? (_draft.submittedChoices || {}) : {});  // phaseId → optionId (confirmed)
  const [view, setView] = useState(savedProgress ? 'debrief' : 'analysis');

  useEffect(function() {
    if (view === 'analysis') {
      saveCaseDraft(businessCase.id, { currentPhaseIndex: currentPhaseIndex, submittedChoices: submittedChoices });
    }
  }, [currentPhaseIndex, submittedChoices, view, businessCase.id]);
  const [result, setResult] = useState(null);
  const [note, setNote] = useState(() => getNotes('cases', businessCase.id));
  const [answerFeedback, setAnswerFeedback] = useState('');
  const [spokenOpen, setSpokenOpen] = useState(false);
  useEffect(() => { setNote(getNotes('cases', businessCase.id)); }, [businessCase.id]);

  // Shuffle answer options per phase — seeded so same user sees same order,
  // but the strong option is no longer pinned to position A
  const phases = useMemo(() => businessCase.phases.map((phase, idx) => {
    const seed = hashStr(caseId + phase.id + idx);
    return { ...phase, options: seededShuffle(phase.options, seed) };
  }), [caseId]);

  const currentPhase = phases[currentPhaseIndex];
  const isLastPhase = currentPhaseIndex === phases.length - 1;
  const isCurrentSubmitted = !!submittedChoices[currentPhase.id];
  const currentSelection = phaseChoices[currentPhase.id];
  const canSubmit = !!currentSelection && !isCurrentSubmitted;

  function handleSelect(optionId) {
    setPhaseChoices(prev => ({ ...prev, [currentPhase.id]: optionId }));
  }

  function handleSubmitPhase() {
    const optionId = phaseChoices[currentPhase.id];
    if (!optionId) return;
    const opt = currentPhase.options.find(o => o.id === optionId);
    const isCorrect = opt && opt.level === 'strong';
    setAnswerFeedback(isCorrect ? 'pal-success-ring' : 'pal-shake');
    setTimeout(() => setAnswerFeedback(''), isCorrect ? 700 : 420);
    setSubmittedChoices(prev => ({ ...prev, [currentPhase.id]: optionId }));
  }

  function handleNextPhase() {
    if (isLastPhase) {
      // Compute final score with all submitted choices + current
      const finalChoices = { ...submittedChoices, [currentPhase.id]: phaseChoices[currentPhase.id] };
      const scored = computeScore(businessCase, finalChoices);
      saveCaseAttempt(businessCase.id, finalChoices, scored, scored.level);
      clearCaseDraft(businessCase.id);
      track('case_completed', { room: 'cases', id: businessCase.id, rating: scored.level });
      setResult({ ...scored, phaseChoices: finalChoices });
      setView('reveal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentPhaseIndex(i => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleRetry() {
    clearCaseProgress(businessCase.id);
    clearCaseDraft(businessCase.id);
    setPhaseChoices({});
    setSubmittedChoices({});
    setCurrentPhaseIndex(0);
    setResult(null);
    setView('analysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* Back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: '0.78rem', cursor: 'pointer', padding: '0',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >
          ← Cases Room
        </button>
        <ShareLinkButton room="cases" />
      </div>

      <Breadcrumb crumbs={[
        { label: 'PAL', onClick: onBack },
        { label: 'Cases Room', onClick: onBack },
        { label: caseId },
      ]} />

      {/* Case header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
          <DifficultyBadge difficulty={businessCase.difficulty} />
          <DomainBadge domain={businessCase.domain} />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.2rem', letterSpacing: '-0.01em' }}>
          {businessCase.title}
        </h1>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {businessCase.subtitle}
        </p>
      </div>

      {/* ─── ANALYSIS VIEW ─── */}
      {view === 'analysis' && (
        <>
          {/* Context panel */}
          <CaseContextPanel context={businessCase.context} />

          {/* Completed phases — collapsed indicators */}
          {Object.keys(submittedChoices).length > 0 && (
            <CompletedPhasesBar
              phases={phases}
              submittedChoices={submittedChoices}
              currentPhaseIndex={currentPhaseIndex}
            />
          )}

          {/* Current phase */}
          <CaseStepPanel
            phase={currentPhase}
            selectedId={isCurrentSubmitted ? submittedChoices[currentPhase.id] : currentSelection}
            onSelect={handleSelect}
            submitted={isCurrentSubmitted}
            stepNumber={currentPhaseIndex + 1}
            totalSteps={phases.length}
            answerFeedback={answerFeedback}
            pendingSelectedId={currentSelection}
          />

          {/* Action buttons */}
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            {!isCurrentSubmitted && (
              <button
                onClick={handleSubmitPhase}
                disabled={!canSubmit}
                style={{
                  background: canSubmit ? 'var(--purple)' : 'var(--surface-2)',
                  border: `1.5px solid ${canSubmit ? 'var(--purple)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)', padding: '0.55rem 1.1rem',
                  color: canSubmit ? '#fff' : 'var(--text-dim)',
                  fontSize: '0.86rem', fontWeight: 700,
                  cursor: canSubmit ? 'pointer' : 'default',
                  transition: 'all 0.12s',
                }}
              >
                Submit this phase
              </button>
            )}
            {isCurrentSubmitted && (
              <button
                onClick={handleNextPhase}
                style={{
                  background: 'var(--purple)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  padding: '0.55rem 1.1rem',
                  fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'opacity 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {isLastPhase ? 'See results →' : `Next phase →`}
              </button>
            )}
          </div>
        </>
      )}

      {/* ─── REVEAL VIEW ─── */}
      {view === 'reveal' && result && (
        <div className="pal-reveal-in" style={{
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          padding: '1.5rem', background: 'var(--surface)', marginBottom: '1.5rem',
        }}>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'var(--text-dim)', marginBottom: '1rem',
          }}>
            Case scored
          </div>
          <CaseScoreReveal
            score={result.score}
            maxScore={result.maxScore}
            level={result.level}
            phaseChoices={result.phaseChoices}
            businessCase={businessCase}
            onContinue={() => { setView('debrief'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </div>
      )}

      {/* ─── DEBRIEF VIEW ─── */}
      {view === 'debrief' && (
        <>
          <div className="pal-reveal-in" style={{
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            padding: '1.5rem', background: 'var(--surface)',
            paddingBottom: '70px',
          }}>
            <LeadershipLens note={businessCase.leadershipNote} />
            <CaseDebriefPanel
              businessCase={businessCase}
              onRetry={handleRetry}
              onBack={onBack}
              onNext={onNext}
            />
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                My Notes
              </div>
              <textarea
                value={note}
                onChange={e => { setNote(e.target.value); saveNote('cases', businessCase.id, e.target.value); }}
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

            {/* 30-second spoken version */}
            {businessCase.spokenSummary && (
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => setSpokenOpen(o => !o)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: spokenOpen ? 'var(--teal-bg)' : 'var(--surface)',
                    border: spokenOpen ? '1px solid var(--teal-border)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '0.65rem 1rem',
                    cursor: 'pointer',
                    color: spokenOpen ? 'var(--teal)' : 'var(--text-muted)',
                    fontSize: '0.84rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'all 0.12s',
                  }}
                >
                  <span>{spokenOpen ? '▾' : '▸'}</span>
                  <span>🎙 30-Second Answer</span>
                </button>
                {spokenOpen && (
                  <div style={{
                    borderLeft: '3px solid var(--teal)',
                    background: 'var(--teal-bg)',
                    borderRadius: '0 var(--radius) var(--radius) 0',
                    padding: '0.9rem 1.1rem',
                    marginTop: '0.25rem',
                  }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', marginBottom: '0.45rem' }}>
                      How to say this in a 30-second spoken answer
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.7, fontStyle: 'italic' }}>
                      &quot;{businessCase.spokenSummary}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky bottom bar — always shown in debrief */}
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
                ← Back
              </button>
              {onNext && (
                <button
                  onClick={onNext}
                  className="pal-glow-pulse"
                  style={{
                    background: 'var(--accent)', color: '#fff',
                    border: 'none', borderRadius: '7px',
                    padding: '0.45rem 1.1rem',
                    fontSize: '0.83rem', fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Next →
                </button>
              )}
            </div>
            <ForwardPointerCard room="cases" onNavigate={onNavigate} onNext={onNext} />
          </div>
        </>
      )}

      {/* Guest demo gate — after debrief, prompt sign-in */}
      {view === 'debrief' && !user && onShowAuth && (
        <GateOverlay
          title="Sign in to save this and keep practicing"
          body="You just completed a free demo case. Sign in to save your progress, unlock more cases, and track your improvement."
          ctaLabel="Sign in"
          onCTA={onShowAuth}
          secondaryLabel="Back to rooms"
          onSecondary={onBack}
        />
      )}
    </div>
  );
}

// ─── Context panel ───

function CaseContextPanel({ context }) {
  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      background: 'var(--surface-2)', padding: '1.25rem',
      marginBottom: '1.25rem',
    }}>
      <div style={{
        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'var(--text-dim)', marginBottom: '0.75rem',
      }}>
        Case brief
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.9rem' }}>
        <ContextRow label="Company" value={context.company} />
        <ContextRow label="Product" value={context.product} />
      </div>

      {/* Executive ask — prominent blockquote style */}
      <div style={{
        borderLeft: '4px solid var(--purple)',
        background: 'var(--purple-bg)',
        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
        padding: '0.85rem 1rem',
        marginBottom: '0.75rem',
      }}>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--purple)', marginBottom: '0.35rem',
        }}>
          The Question
        </div>
        <p style={{
          fontSize: '1rem', fontWeight: 600, color: 'var(--text)',
          margin: 0, lineHeight: 1.55, fontStyle: 'italic',
        }}>
          {context.executiveAsk}
        </p>
      </div>

      {/* Pressure */}
      {context.pressure && (
        <div style={{
          background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
          borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.7rem',
          marginBottom: '0.6rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--yellow)', marginBottom: '0.15rem' }}>
            Pressure
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {context.pressure}
          </p>
        </div>
      )}

      {/* Ambiguity */}
      {context.ambiguity && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
          <span style={{ fontWeight: 600, color: 'var(--text-dim)' }}>Ambiguity: </span>
          {context.ambiguity}
        </p>
      )}
    </div>
  );
}

function ContextRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', minWidth: '60px', paddingTop: '0.05rem' }}>{label}</span>
      <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}

// ─── Completed phases bar ───

function CompletedPhasesBar({ phases, submittedChoices, currentPhaseIndex }) {
  const completedPhases = phases.slice(0, currentPhaseIndex).filter(p => submittedChoices[p.id]);
  if (completedPhases.length === 0) return null;

  return (
    <div style={{
      marginBottom: '1rem',
      padding: '0.6rem 0.75rem',
      background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)',
    }}>
      <div style={{
        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'var(--text-dim)', marginBottom: '0.45rem',
      }}>
        Completed phases
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {completedPhases.map(phase => {
          const chosenId = submittedChoices[phase.id];
          const opt = phase.options.find(o => o.id === chosenId);
          const levelCfg = opt ? LEVEL_DOT_CONFIG[opt.level] : null;
          const phaseLabel = PHASE_LABELS[phase.id] || phase.label || phase.id;

          return (
            <div key={phase.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.2rem 0.5rem',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem', color: 'var(--text-secondary)',
            }}>
              {levelCfg && (
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: levelCfg.color, flexShrink: 0, display: 'inline-block',
                }} />
              )}
              <span>{phaseLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Badge helpers ───

function DifficultyBadge({ difficulty }) {
  const cfg = {
    analyst: { label: 'Analyst', color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
    senior:  { label: 'Senior',  color: 'var(--accent)',    bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
    staff:   { label: 'Staff',   color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  }[difficulty] || { label: difficulty, color: 'var(--text-dim)', bg: 'var(--surface-2)', border: 'var(--border)' };

  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
    }}>{cfg.label}</span>
  );
}

function DomainBadge({ domain }) {
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
    }}>{domain}</span>
  );
}
