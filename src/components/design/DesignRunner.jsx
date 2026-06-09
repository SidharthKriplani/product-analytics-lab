import { useState, useCallback, useEffect } from 'react';
import { designScenarios } from '../../data/designScenarios.js';
import { DesignPhaseNav } from './DesignPhaseNav.jsx';
import { DesignFieldGroup } from './DesignFieldGroup.jsx';
import { DesignScoreReveal } from './DesignScoreReveal.jsx';
import { DesignDebriefPanel } from './DesignDebriefPanel.jsx';
import { ConceptDrawer } from '../concepts/ConceptDrawer.jsx';
import { track } from '../../utils/analytics.js';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { GateOverlay } from '../shared/GateOverlay.jsx';

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
import {
  saveDesignAnswers, saveCompletedPhases, saveDesignResult,
  clearDesignProgress, computeDesignScore,
} from '../../utils/designProgress.js';

// Three views: 'form' | 'reveal' | 'debrief'

export function DesignRunner({ caseId, savedProgress, onBack, onGoToReview, onNext, onNavigate, user, onShowAuth }) {
  const scenario = designScenarios.find(s => s.id === caseId);
  const _phases = scenario.designPhases;
  const _savedAnswers = savedProgress?.answers || {};
  const _savedCompleted = savedProgress?.completedPhaseIds || [];
  const _resumeIdx = Math.min(_savedCompleted.length, _phases.length - 1);
  const _hasResult = savedProgress?.lastScore != null;
  const _restoredResult = _hasResult ? computeDesignScore(scenario, _savedAnswers) : null;
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(_resumeIdx);
  const [answers, setAnswers] = useState(_savedAnswers);
  const [completedPhaseIds, setCompletedPhaseIds] = useState(_savedCompleted);
  const [view, setView] = useState(_hasResult ? 'debrief' : 'form');
  const [result, setResult] = useState(_restoredResult);
  const [openConceptId, setOpenConceptId] = useState(null);
  const [note, setNote] = useState(() => getNotes('design', scenario.id));
  useEffect(() => { setNote(getNotes('design', scenario.id)); }, [scenario.id]);

  const phases = scenario.designPhases;
  const currentPhase = phases[currentPhaseIndex];

  // All fields in current phase answered?
  function currentPhaseComplete() {
    return currentPhase.fields.every(f => {
      const val = answers[f.id];
      if (f.type === 'multi_select') return Array.isArray(val) && val.length > 0;
      return val !== undefined && val !== null && val !== '';
    });
  }

  function handleAnswerChange(fieldId, value) {
    const next = { ...answers, [fieldId]: value };
    setAnswers(next);
    saveDesignAnswers(scenario.id, next);
  }

  function handleNextPhase() {
    const phaseId = currentPhase.id;
    const nextCompleted = completedPhaseIds.includes(phaseId)
      ? completedPhaseIds
      : [...completedPhaseIds, phaseId];
    setCompletedPhaseIds(nextCompleted);
    saveCompletedPhases(scenario.id, nextCompleted);

    if (currentPhaseIndex < phases.length - 1) {
      setCurrentPhaseIndex(currentPhaseIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Last phase — submit
      handleSubmit(nextCompleted);
    }
  }

  function handleSubmit(finalCompleted) {
    const scored = computeDesignScore(scenario, answers);
    saveDesignResult(scenario.id, scored);
    track('case_completed', { room: 'design', id: scenario.id, rating: scored.level });
    setResult(scored);
    setView('reveal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRetry() {
    clearDesignProgress(scenario.id);
    setAnswers({});
    setCompletedPhaseIds([]);
    setCurrentPhaseIndex(0);
    setResult(null);
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleOpenConcept = useCallback(id => setOpenConceptId(id), []);
  const handleCloseConcept = useCallback(() => setOpenConceptId(null), []);

  const isLastPhase = currentPhaseIndex === phases.length - 1;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: '0.78rem', cursor: 'pointer', padding: '0', marginBottom: '0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >
          ← Design Room
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
              <DifficultyBadge difficulty={scenario.difficulty} />
              <IndustryBadge industry={scenario.industry} />
              {!scenario.isFree && (
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: 'var(--teal)', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
                  borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
                }}>Beta</span>
              )}
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.25rem', letterSpacing: '-0.01em' }}>
              {scenario.title}
            </h1>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {scenario.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Context card */}
      {view === 'form' && currentPhaseIndex === 0 && (
        <ContextCard context={scenario.context} />
      )}

      {/* Phase nav */}
      {view === 'form' && (
        <div style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <DesignPhaseNav
            phases={phases}
            currentPhaseIndex={currentPhaseIndex}
            completedPhaseIds={completedPhaseIds}
            onGoToPhase={setCurrentPhaseIndex}
          />

          {/* Phase content */}
          <div style={{ padding: '1.5rem', background: 'var(--surface)' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.2rem' }}>
                Phase {currentPhaseIndex + 1}: {currentPhase.label}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>{currentPhase.hint}</p>
            </div>

            <DesignFieldGroup
              fields={currentPhase.fields}
              answers={answers}
              onChange={handleAnswerChange}
              onOpenConcept={handleOpenConcept}
            />

            {/* Next / Submit */}
            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
              {currentPhaseIndex > 0 && (
                <button
                  onClick={() => setCurrentPhaseIndex(i => i - 1)}
                  style={{
                    background: 'none', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.9rem',
                    color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer',
                  }}
                >
                  ← Back
                </button>
              )}
              <button
                onClick={handleNextPhase}
                disabled={!currentPhaseComplete()}
                style={{
                  background: currentPhaseComplete() ? 'var(--accent)' : 'var(--surface-2)',
                  border: `1.5px solid ${currentPhaseComplete() ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)', padding: '0.55rem 1.1rem',
                  color: currentPhaseComplete() ? '#fff' : 'var(--text-dim)',
                  fontSize: '0.86rem', fontWeight: 700, cursor: currentPhaseComplete() ? 'pointer' : 'default',
                  transition: 'all 0.12s',
                }}
              >
                {isLastPhase ? 'Submit design →' : `Next: ${phases[currentPhaseIndex + 1]?.label} →`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Score reveal */}
      {view === 'reveal' && result && (
        <div className="pal-reveal-in" style={{
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          padding: '1.5rem', background: 'var(--surface)', marginBottom: '1.5rem',
        }}>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'var(--text-dim)', marginBottom: '1rem',
          }}>
            Design scored
          </div>
          <DesignScoreReveal
            result={result}
            onContinue={() => setView('debrief')}
            continueLabel="View full debrief"
          />
        </div>
      )}

      {/* Debrief */}
      {view === 'debrief' && result && (
        <div className="pal-reveal-in" style={{
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          padding: '1.5rem', background: 'var(--surface)',
        }}>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'var(--text-dim)', marginBottom: '1rem',
          }}>
            Design debrief
          </div>
          <DesignDebriefPanel
            scenario={scenario}
            answers={answers}
            result={result}
            onOpenConcept={handleOpenConcept}
            onGoToReview={scenario.pairedReviewScenarioId ? () => onGoToReview(scenario.pairedReviewScenarioId) : null}
            onRetry={handleRetry}
            onNext={onNext}
          />
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              My Notes
            </div>
            <textarea
              value={note}
              onChange={e => { setNote(e.target.value); saveNote('design', scenario.id, e.target.value); }}
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
          <ForwardPointerCard room='design' onNavigate={onNavigate} onNext={onNext} />
        </div>
      )}

      {/* Concept drawer */}
      <ConceptDrawer conceptId={openConceptId} onClose={handleCloseConcept} />

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

// ─── Subcomponents ───

function ContextCard({ context }) {
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
        Scenario brief
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <ContextRow label="Company" value={context.company} />
        <ContextRow label="Product" value={context.product} />
        <ContextRow label="Team" value={context.team} />
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Background</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{context.background}</p>
        </div>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Feature proposal</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{context.featureProposal}</p>
        </div>
        {context.businessPressure && (
          <div style={{
            background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
            borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.65rem',
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--yellow)', marginBottom: '0.2rem' }}>Business pressure</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{context.businessPressure}</p>
          </div>
        )}
        {context.constraints?.length > 0 && (
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>Constraints</div>
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              {context.constraints.map((c, i) => (
                <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '0.2rem' }}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ContextRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', minWidth: '70px', paddingTop: '0.05rem' }}>{label}</span>
      <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}

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

function IndustryBadge({ industry }) {
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
    }}>{industry}</span>
  );
}
