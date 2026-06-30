import { useState, useEffect, useRef, useCallback } from 'react';
import { rcaCases } from '../../data/rcaCases.js';
import { RCAStepPanel } from './RCAStepPanel.jsx';
import { RCAScoreReveal } from './RCAScoreReveal.jsx';
import { RCADebriefPanel } from './RCADebriefPanel.jsx';
import { DebriefCopyButton } from '../shared/DebriefCopyButton.jsx';
import { Icon } from '../shared/Icon.jsx';
import { TimerButton } from '../shared/TimerButton.jsx';
import { saveRCAAttempt, saveRCADraft, loadRCADraft, clearRCADraft, getAllRCAProgress } from '../../utils/rcaProgress.js';
import { track } from '../../utils/analytics.js';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { Breadcrumb } from '../shared/Breadcrumb.jsx';
import { GateOverlay } from '../shared/GateOverlay.jsx';
import { ShareLinkButton } from '../shared/ShareLinkButton.jsx';
import { DescribePanel } from '../shared/DescribePanel.jsx';
import { AnswerModeToggle, loadAnswerMode, saveAnswerMode } from '../shared/AnswerModeToggle.jsx';
import { RCAMetricChart } from './RCAMetricChart.jsx';
import { RCAProgressMap } from './RCAProgressMap.jsx';

const ROOM_KEY = 'rca';

// ─── Describe-mode derivation ────────────────────────────────────────────────
// Key points = the diagnosis steps the user should have reasoned through (the
// strong-option labels) plus the senior likely-cause. Keywords come from the
// step label and the strong option text.
function deriveRCAKeyPoints(rcaCase) {
  const points = [];
  const sd = rcaCase.seniorDiagnosis || {};
  if (sd.likelyCause) {
    points.push({
      id: 'cause',
      text: 'Root cause: ' + sd.likelyCause,
      shortLabel: 'Root cause',
      keywords: deriveSalientKeywords(sd.likelyCause),
    });
  }
  for (const step of (rcaCase.diagnosisSteps || [])) {
    const strong = (step.options || []).find(o => o.level === 'strong');
    if (!strong) continue;
    points.push({
      id: step.id,
      text: step.label + ': ' + strong.label,
      shortLabel: step.label,
      keywords: deriveSalientKeywords(strong.label + ' ' + step.label),
    });
  }
  return points;
}
function deriveSalientKeywords(text) {
  if (!text) return [];
  const tokens = String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4);
  const seen = new Set();
  const out = [];
  for (const t of tokens) { if (!seen.has(t)) { seen.add(t); out.push(t); } if (out.length >= 5) break; }
  return out;
}
function RCAModelAnswer({ rcaCase }) {
  const sd = rcaCase.seniorDiagnosis || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 }}>
        {sd.likelyCause}
      </div>
      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
        {sd.reasoning}
      </p>
      {sd.interviewPhrase && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: 0, lineHeight: 1.65, fontStyle: 'italic' }}>
          &ldquo;{sd.interviewPhrase}&rdquo;
        </p>
      )}
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
        Full validation plan, recommendation, and common mistakes appear in the debrief below.
      </p>
    </div>
  );
}

function loadNote(room, id) {
  try {
    const notes = JSON.parse(localStorage.getItem('pal-notes-v1') || '{}');
    return notes[`${room}:${id}`] || '';
  } catch { return ''; }
}
function saveNote(room, id, text) {
  try {
    const notes = JSON.parse(localStorage.getItem('pal-notes-v1') || '{}');
    notes[`${room}:${id}`] = text;
    localStorage.setItem('pal-notes-v1', JSON.stringify(notes));
  } catch {}
}

// ─── Scoring ────────────────────────────────────────────────────────────────
function scoreStep(level) {
  if (level === 'strong') return 2;
  if (level === 'partial') return 1;
  return 0;
}
function computeScore(rcaCase, stepChoices) {
  let score = 0;
  const maxScore = rcaCase.diagnosisSteps.length * 2;
  for (const step of rcaCase.diagnosisSteps) {
    const chosenId = stepChoices[step.id];
    if (chosenId) {
      const opt = step.options.find(o => o.id === chosenId);
      if (opt) score += scoreStep(opt.level);
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

// ─── Level indicator dot ─────────────────────────────────────────────────────
const LEVEL_DOT = {
  strong:  'var(--teal)',
  partial: 'var(--yellow)',
  wrong:   'var(--red)',
};

// ─── SQL Step Rating options ──────────────────────────────────────────────────
const SQL_RATINGS = [
  { id: 'strong',  label: 'Nailed it',       color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  { id: 'partial', label: 'Close enough',    color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  { id: 'miss',    label: 'Missed key parts', color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border)' },
];

// ─── Main Runner ─────────────────────────────────────────────────────────────
export function RCARunner({ caseId, savedProgress, unlocked, onBack, onNext, onNavigate, user, onShowAuth }) {
  const rcaCase = rcaCases.find(r => r.id === caseId);
  const _rcaDraft = !savedProgress ? loadRCADraft(caseId) : null;
  const startView = savedProgress ? 'debrief' : 'diagnosis';
  const [view, setView] = useState(startView);

  // Progressive mode unlock: first 3 completed cases → force Guided (options);
  // case 4+ → default to Interview (describe) if user has no saved preference.
  const _rcaCompletedCount = Object.keys(getAllRCAProgress()).length;
  const isModeLocked = _rcaCompletedCount < 3;
  const [answerMode, setAnswerMode] = useState(
    isModeLocked ? 'options' : loadAnswerMode('describe')
  );
  function handleAnswerModeChange(mode) { setAnswerMode(mode); saveAnswerMode(mode); }
  function handleRCADescribeContinue() {
    track('case_completed', { room: 'rca', id: rcaCase.id, mode: 'describe' });
    setView('debrief');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const [currentStepIndex, setCurrentStepIndex] = useState(_rcaDraft ? (_rcaDraft.currentStepIndex || 0) : 0);
  const [stepChoices, setStepChoices] = useState(_rcaDraft ? (_rcaDraft.stepChoices || {}) : (savedProgress?.stepChoices || {}));
  const [pendingChoice, setPendingChoice] = useState(null); // selected but not yet submitted
  const [submittedSteps, setSubmittedSteps] = useState(
    _rcaDraft ? (_rcaDraft.submittedSteps || {})
    : savedProgress
      ? Object.fromEntries(Object.keys(savedProgress.stepChoices || {}).map(k => [k, true]))
      : {}
  );

  useEffect(function() {
    if (view === 'diagnosis') {
      saveRCADraft(caseId, { currentStepIndex: currentStepIndex, stepChoices: stepChoices, submittedSteps: submittedSteps });
    }
  }, [currentStepIndex, stepChoices, submittedSteps, view, caseId]);
  const [scoreResult, setScoreResult] = useState(null);

  // SQL step state
  const [sqlResponse, setSqlResponse] = useState('');
  const [sqlRevealed, setSqlRevealed] = useState(false);
  const [sqlRating, setSqlRating] = useState(null);

  const [userNote, setUserNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setElapsed(0);
    setPaused(false);
  }, [rcaCase.id]);

  useEffect(() => {
    if (paused) {
      clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [paused, rcaCase.id]);

  useEffect(() => {
    setUserNote(loadNote(ROOM_KEY, rcaCase.id));
    setNoteSaved(false);
  }, [rcaCase.id]);

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const steps = rcaCase.diagnosisSteps;
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const currentStepSubmitted = submittedSteps[currentStep?.id];

  function handleRetry() {
    clearRCADraft(rcaCase.id);
    setView('diagnosis');
    setCurrentStepIndex(0);
    setStepChoices({});
    setPendingChoice(null);
    setSubmittedSteps({});
    setScoreResult(null);
  }

  function handleSelectOption(optionId) {
    if (currentStepSubmitted) return;
    setPendingChoice(optionId);
  }

  function handleSubmitStep() {
    if (!pendingChoice) return;
    const newChoices = { ...stepChoices, [currentStep.id]: pendingChoice };
    const newSubmitted = { ...submittedSteps, [currentStep.id]: true };
    setStepChoices(newChoices);
    setSubmittedSteps(newSubmitted);
    setPendingChoice(null);
  }

  function handleNextStep() {
    if (isLastStep) {
      const result = computeScore(rcaCase, stepChoices);
      setScoreResult(result);
      saveRCAAttempt(rcaCase.id, stepChoices, result.score, result.level);
      clearRCADraft(rcaCase.id);
      track('case_completed', { room: 'rca', id: rcaCase.id, rating: result.level });
      setView('reveal');
    } else {
      setCurrentStepIndex(i => i + 1);
    }
  }

  function handleShowDebrief() {
    setView('debrief');
  }

  const activeChoiceId = currentStepSubmitted
    ? stepChoices[currentStep?.id]
    : pendingChoice;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* Back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          onClick={onBack}
          className="pal-back-btn"
        >
          <Icon name="arrow-left" size={14} color="currentColor" />RCA Room
        </button>
        <ShareLinkButton room="rca" />
      </div>

      <Breadcrumb crumbs={[
        { label: 'PAL', onClick: onBack },
        { label: 'RCA Room', onClick: onBack },
        { label: caseId },
      ]} />

      {/* Case title */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.3rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--yellow)' }}>
            {rcaCase.subtitle}
          </div>
          <TimerButton elapsed={elapsed} paused={paused} onToggle={() => setPaused(p => !p)} warning={elapsed > 600} />
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
          {rcaCase.title}
        </h2>
        {savedProgress && view === 'debrief' && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem',
            fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)',
            background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
            borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.5rem',
          }}>
            Previously completed
          </div>
        )}
      </div>

      {/* Context panel (always visible in diagnosis) */}
      {(view === 'diagnosis') && (
        <ContextPanel context={rcaCase.context} caseId={rcaCase.id} />
      )}

      {/* ─── Diagnosis View ─────────────────────────────────────────── */}
      {view === 'diagnosis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          <AnswerModeToggle value={answerMode} onChange={handleAnswerModeChange} accent="yellow" locked={isModeLocked} />

          {/* Describe mode — write your full diagnosis first, then reveal + self-assess */}
          {answerMode === 'describe' && (
            <>
              <DescribePanel
                keyPoints={deriveRCAKeyPoints(rcaCase)}
                modelAnswer={<RCAModelAnswer rcaCase={rcaCase} />}
                onRevealed={() => track('describe_revealed', { room: 'rca', id: rcaCase.id })}
              />
              <div style={{ paddingTop: '0.25rem' }}>
                <button
                  onClick={handleRCADescribeContinue}
                  style={{
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '0.6rem 1.25rem',
                    fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.1s', width: '100%',
                  }}
                >
                  Continue to full debrief →
                </button>
              </div>
            </>
          )}

          {/* Options mode — existing scaffolded step-by-step flow */}
          {answerMode === 'options' && (
          <>
          {/* Investigation progress map */}
          <RCAProgressMap
            steps={steps}
            currentStepIndex={currentStepIndex}
            stepChoices={stepChoices}
            submittedSteps={submittedSteps}
          />

          {/* Completed steps (collapsed) */}
          {steps.slice(0, currentStepIndex).map((step, i) => {
            const chosenId = stepChoices[step.id];
            const chosenOpt = chosenId ? step.options.find(o => o.id === chosenId) : null;
            return (
              <CompletedStepCard
                key={step.id}
                step={step}
                stepNumber={i + 1}
                chosenOption={chosenOpt}
              />
            );
          })}

          {/* Active step */}
          <RCAStepPanel
            step={currentStep}
            selectedId={activeChoiceId}
            onSelect={handleSelectOption}
            submitted={!!currentStepSubmitted}
            stepNumber={currentStepIndex + 1}
            totalSteps={steps.length}
          />

          {/* Active recall note — shown before the final "See results" button */}
          {isLastStep && currentStepSubmitted && (
            <div className="pal-textarea-wrap" style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Icon name="pen-line" size={12} color="currentColor" />Write your thinking first <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
              </div>
              <textarea
                value={userNote}
                onChange={e => { setUserNote(e.target.value); setNoteSaved(false); }}
                placeholder="What's your read? Jot down your diagnosis before revealing the answer..."
                style={{
                  width: '100%', minHeight: 80, padding: '10px 12px', background: 'var(--bg)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                  fontSize: '0.88rem', lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={() => { saveNote(ROOM_KEY, rcaCase.id, userNote); setNoteSaved(true); }}
                style={{
                  marginTop: 8, padding: '5px 14px', background: noteSaved ? 'var(--green-bg)' : 'var(--surface)',
                  border: `1px solid ${noteSaved ? 'var(--green-border)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem',
                  color: noteSaved ? 'var(--green)' : 'var(--text-muted)',
                }}
              >
                {noteSaved ? <><Icon name="check" size={12} color="var(--green)" /> Saved</> : 'Save note'}
              </button>
            </div>
          )}

          {/* Submit / Next controls */}
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
            {!currentStepSubmitted && (
              <button
                onClick={handleSubmitStep}
                disabled={!pendingChoice}
                className="pal-cta"
              >
                Submit this step
              </button>
            )}
            {currentStepSubmitted && (
              <button
                onClick={handleNextStep}
                style={{
                  background: 'var(--yellow-bg)',
                  border: '1.5px solid var(--yellow-border)',
                  color: 'var(--yellow)',
                  borderRadius: 'var(--radius)',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem', fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--yellow)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--yellow-bg)'}
              >
                {isLastStep ? 'See results →' : 'Next step →'}
              </button>
            )}
          </div>
          </>
          )}
        </div>
      )}

      {/* ─── Score Reveal ───────────────────────────────────────────── */}
      {view === 'reveal' && scoreResult && (
        <RCAScoreReveal
          score={scoreResult.score}
          maxScore={scoreResult.maxScore}
          level={scoreResult.level}
          stepChoices={stepChoices}
          rcaCase={rcaCase}
          onContinue={handleShowDebrief}
        />
      )}

      {/* ─── Debrief ────────────────────────────────────────────────── */}
      {view === 'debrief' && (
        <>
          <div className="pal-reveal-in" style={{ paddingBottom: '70px' }}>
          <RCADebriefPanel
            rcaCase={rcaCase}
            onRetry={handleRetry}
            onBack={onBack}
            onNext={onNext}
          />
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Your notes</div>
              <DebriefCopyButton
                title={rcaCase.title}
                notes={userNote}
                modelAnswer={rcaCase.seniorDiagnosis ? rcaCase.seniorDiagnosis.reasoning : ''}
                tags={rcaCase.tags || []}
                difficulty={rcaCase.difficulty}
                room={'RCA Room'}
              />
            </div>
            {userNote && (
              <div style={{ fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{userNote}</div>
            )}
            {!userNote && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No notes added.</div>
            )}
          </div>

          {/* SQL Step CTA — only if the case has a sqlStep */}
          {rcaCase.sqlStep && (
            <div style={{
              marginTop: '1.5rem',
              background: 'var(--surface-2)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span><Icon name='wrench' size={16} color='var(--yellow)' /></span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--yellow)' }}>
                  Bonus: SQL Validation
                </span>
              </div>
              <p style={{ margin: '0 0 0.9rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                A senior analyst doesn't stop at "I hypothesize X." They write the query that proves it. Practice translating this diagnosis into SQL.
              </p>
              <button
                onClick={() => setView('sql')}
                style={{
                  background: 'var(--yellow-bg)',
                  border: '1.5px solid var(--yellow-border)',
                  color: 'var(--yellow)',
                  borderRadius: 'var(--radius)',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.85rem', fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--yellow)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--yellow-bg)'}
              >
                Write the validation query →
              </button>
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
                    background: 'var(--teal)', color: '#fff',
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
            <ForwardPointerCard room="rca" onNavigate={onNavigate} onNext={onNext} />
          </div>
        </>
      )}

      {/* ─── SQL Validation Step ────────────────────────────────────── */}
      {view === 'sql' && rcaCase.sqlStep && (
        <SQLValidationStep
          sqlStep={rcaCase.sqlStep}
          response={sqlResponse}
          onResponseChange={setSqlResponse}
          revealed={sqlRevealed}
          onReveal={() => setSqlRevealed(true)}
          rating={sqlRating}
          onRate={setSqlRating}
          onBack={() => setView('debrief')}
        />
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

// ─── Context Panel ────────────────────────────────────────────────────────────
function ContextPanel({ context, caseId }) {
  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius)',
      padding: '1rem 1.25rem',
      marginBottom: '1.25rem',
    }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Case Context
      </div>

      {/* Metric anomaly chart */}
      <RCAMetricChart caseId={caseId} />

      {/* Metric movement */}
      <div style={{
        background: 'var(--yellow-bg)',
        border: '1px solid var(--yellow-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.5rem 0.75rem',
        marginBottom: '0.75rem',
        fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.5,
      }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--yellow)', marginRight: '0.5rem' }}>
          Metric
        </span>
        {context.metricMovement}
      </div>

      {/* Business impact + time window */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <MetaItem label="Business Impact" value={context.businessImpact} />
        <MetaItem label="Time Window" value={context.timeWindow} />
      </div>

      {/* Known facts */}
      <div>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          Known Facts
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {context.knownFacts.map((fact, i) => (
            <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{label}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{value}</div>
    </div>
  );
}

// ─── Completed Step Card (collapsed) ─────────────────────────────────────────
const LEVEL_DOT_COLOR = {
  strong:  'var(--teal)',
  partial: 'var(--yellow)',
  wrong:   'var(--red)',
};
const LEVEL_LABEL_MAP = {
  strong:  'Strong',
  partial: 'Partial',
  wrong:   'Incorrect',
};

// ─── SQL Validation Step ──────────────────────────────────────────────────────
function SQLValidationStep({ sqlStep, response, onResponseChange, revealed, onReveal, rating, onRate, onBack }) {
  const canReveal = response.trim().length >= 20;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius)',
        padding: '1rem 1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--yellow)' }}>
            Step 6 · SQL Validation
          </span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
            color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
          }}>
            Optional
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
          {sqlStep.prompt}
        </p>
      </div>

      {/* Hints */}
      {sqlStep.hints && sqlStep.hints.length > 0 && (
        <div style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Schema hints
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {sqlStep.hints.map((hint, i) => (
              <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{hint}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Textarea */}
      <div>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          Your SQL query
        </div>
        <textarea
          value={response}
          onChange={e => onResponseChange(e.target.value)}
          disabled={revealed}
          placeholder={`SELECT\n  ...\nFROM ...\nWHERE ...`}
          style={{
            width: '100%',
            minHeight: '180px',
            padding: '0.75rem',
            background: revealed ? 'var(--surface-2)' : 'var(--bg)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text)',
            fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            opacity: revealed ? 0.7 : 1,
          }}
        />
        {!revealed && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            {response.trim().length < 20
              ? `Write at least ${20 - response.trim().length} more characters to reveal the model answer`
              : <><Icon name="check" size={12} color="var(--green)" /> Ready to reveal</>}
          </div>
        )}
      </div>

      {/* Reveal button */}
      {!revealed && (
        <button
          onClick={onReveal}
          disabled={!canReveal}
          style={{
            alignSelf: 'flex-start',
            background: canReveal ? 'var(--yellow-bg)' : 'var(--surface-2)',
            border: `1.5px solid ${canReveal ? 'var(--yellow-border)' : 'var(--border)'}`,
            color: canReveal ? 'var(--yellow)' : 'var(--text-muted)',
            borderRadius: 'var(--radius)',
            padding: '0.6rem 1.25rem',
            fontSize: '0.85rem', fontWeight: 700,
            cursor: canReveal ? 'pointer' : 'not-allowed',
          }}
        >
          Reveal model query
        </button>
      )}

      {/* Model answer panel */}
      {revealed && (
        <div style={{
          background: 'var(--surface-2)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)' }}>
            Model Query
          </div>

          {/* SQL code block */}
          <pre style={{
            margin: 0,
            padding: '1rem',
            background: 'var(--bg)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
            fontSize: '0.75rem',
            lineHeight: 1.65,
            color: 'var(--text)',
            overflowX: 'auto',
            whiteSpace: 'pre',
          }}>
            {sqlStep.modelQuery}
          </pre>

          {/* Annotation */}
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Annotation
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {sqlStep.annotation}
            </p>
          </div>

          {/* Self-rating */}
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
              How did you do?
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {SQL_RATINGS.map(r => (
                <button
                  key={r.id}
                  onClick={() => onRate(r.id)}
                  style={{
                    background: rating === r.id ? r.bg : 'transparent',
                    border: `1.5px solid ${rating === r.id ? r.border : 'var(--border)'}`,
                    color: rating === r.id ? r.color : 'var(--text-muted)',
                    borderRadius: 'var(--radius)',
                    padding: '0.45rem 1rem',
                    fontSize: '0.8rem', fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Back to debrief */}
      <button
        onClick={onBack}
        style={{
          alignSelf: 'flex-start',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600,
          padding: '0.25rem 0',
          display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--yellow)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        ← Back to debrief
      </button>
    </div>
  );
}

// ─── Completed Step Card (expandable) ────────────────────────────────────────
function CompletedStepCard({ step, stepNumber, chosenOption }) {
  const [expanded, setExpanded] = useState(false);
  const dotColor = chosenOption ? (LEVEL_DOT_COLOR[chosenOption.level] || 'var(--text-muted)') : 'var(--text-muted)';
  const levelLabel = chosenOption ? (LEVEL_LABEL_MAP[chosenOption.level] || '') : '';
  const bestOption = step.options.find(o => o.level === 'strong');

  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: `1px solid ${expanded ? 'var(--yellow-border)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        transition: 'border-color 0.15s',
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(e => !e)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpanded(v => !v); }}
    >
      {/* Collapsed row */}
      <div style={{
        padding: '0.6rem 0.9rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        opacity: expanded ? 1 : 0.8,
      }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: dotColor }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>
            Step {stepNumber} · {step.label}
          </span>
          {chosenOption && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.6rem' }}>
              — {chosenOption.label.length > 60 ? chosenOption.label.slice(0, 60) + '…' : chosenOption.label}
            </span>
          )}
        </div>
        {levelLabel && (
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: dotColor, flexShrink: 0 }}>
            {levelLabel}
          </span>
        )}
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '0.25rem' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded feedback */}
      {expanded && (
        <div style={{
          padding: '0 0.9rem 0.9rem',
          display: 'flex', flexDirection: 'column', gap: '0.6rem',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.75rem',
        }}
        onClick={e => e.stopPropagation()}
        >
          {/* Your choice */}
          {chosenOption && (
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: dotColor, marginBottom: '0.25rem' }}>
                Your answer
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5 }}>{chosenOption.label}</div>
              {chosenOption.feedback && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginTop: '0.3rem' }}>{chosenOption.feedback}</div>
              )}
            </div>
          )}
          {/* Best answer (if user didn't get strong) */}
          {bestOption && chosenOption?.level !== 'strong' && (
            <div style={{
              background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
              borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.7rem',
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', marginBottom: '0.2rem' }}>
                Strongest answer
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.5 }}>{bestOption.label}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
