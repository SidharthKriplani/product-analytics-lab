import { useState, useEffect } from 'react';
import { productDesignScenarios } from '../../data/productDesignScenarios.js';
import { track } from '../../utils/analytics.js';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { ShareLinkButton } from '../shared/ShareLinkButton.jsx';

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
  savePhaseResponse,
  savePhaseRating,
  saveCompletedPhases,
  saveProductDesignResult,
  clearProductDesignProgress,
  computeProductDesignScore,
} from '../../utils/productDesignProgress.js';

// ─── Self-rating after each phase ────────────────────────────────────────────
const RATING_OPTIONS = [
  { id: 'strong',  label: 'Strong',   description: 'Covered the key points clearly', color: 'var(--teal)', bg: 'var(--teal-bg)', border: 'var(--teal-border)' },
  { id: 'partial', label: 'Partial',  description: 'Got the idea but missed some depth', color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  { id: 'miss',    label: 'Missed',   description: 'The model answer showed a gap', color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border)' },
];

const LEVEL_CONFIG = {
  excellent:     { label: 'Excellent', color: 'var(--teal)',       bg: 'var(--teal-bg)',   border: 'var(--teal-border)',   desc: 'You think like a senior PM. Strong across all phases.' },
  strong:        { label: 'Strong',    color: 'var(--green)',      bg: 'var(--green-bg)',  border: 'var(--green-border)',  desc: 'Solid PM thinking with a few areas to sharpen.' },
  developing:    { label: 'Developing', color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)', desc: 'Good foundation — keep practicing the framework phases.' },
  needs_practice:{ label: 'Keep Practicing', color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border)', desc: 'Review the model answers and try this scenario again.' },
};

// ─── Phase label nav ──────────────────────────────────────────────────────────
function PhaseNav({ phases, currentIndex, completedIds }) {
  return (
    <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      {phases.map((phase, i) => {
        const isActive = i === currentIndex;
        const isDone = completedIds.includes(phase.id);
        return (
          <div key={phase.id} style={{
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            background: isActive ? 'var(--purple-bg)' : isDone ? 'var(--surface-2)' : 'transparent',
            color: isActive ? 'var(--purple)' : isDone ? 'var(--text-muted)' : 'var(--border)',
            border: `1px solid ${isActive ? 'var(--purple-border)' : isDone ? 'var(--border)' : 'var(--border)'}`,
            transition: 'all 0.12s',
          }}>
            {isDone && !isActive ? '✓ ' : ''}{phase.label}
          </div>
        );
      })}
    </div>
  );
}

// ─── Model answer reveal panel ────────────────────────────────────────────────
function ModelAnswerPanel({ phase, onRate, currentRating }) {
  return (
    <div className="pal-reveal-in" style={{
      marginTop: '1.5rem',
      background: 'var(--surface-2)',
      border: '1.5px solid var(--purple-border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '0.65rem 1rem',
        background: 'var(--purple-bg)',
        borderBottom: '1px solid var(--purple-border)',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--purple)' }}>
          ◆ Model Answer
        </span>
      </div>

      {/* Model answer text */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
        {/* Criteria checklist */}
        {phase.criteria && phase.criteria.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Strong answers include:
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {phase.criteria.map((c, i) => (
                <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full model answer */}
        <div style={{
          fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75,
          whiteSpace: 'pre-wrap',
          borderTop: phase.criteria?.length ? '1px solid var(--border-subtle)' : 'none',
          paddingTop: phase.criteria?.length ? '0.9rem' : 0,
        }}>
          {phase.modelAnswer}
        </div>
      </div>

      {/* Self-rating */}
      <div style={{ padding: '0.85rem 1rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
          How did your answer compare?
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {RATING_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => onRate(opt.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${currentRating === opt.id ? opt.border : 'var(--border)'}`,
                background: currentRating === opt.id ? opt.bg : 'var(--surface)',
                color: currentRating === opt.id ? opt.color : 'var(--text-muted)',
                fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.12s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Debrief / final results ──────────────────────────────────────────────────
function DebriefView({ scenario, responses, ratings, result, onRetry, onBack, onNext }) {
  const levelCfg = LEVEL_CONFIG[result?.level] || LEVEL_CONFIG.needs_practice;
  const [expandedPhase, setExpandedPhase] = useState(null);

  return (
    <div className="pal-reveal-in">
      {/* Score card */}
      <div style={{
        background: levelCfg.bg,
        border: `1.5px solid ${levelCfg.border}`,
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: levelCfg.color, marginBottom: '0.4rem' }}>
          Overall Assessment
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: levelCfg.color, marginBottom: '0.25rem' }}>
          {levelCfg.label}
        </div>
        <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
          {levelCfg.desc}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {result?.score}/{result?.maxScore} phases rated strong or partial
        </div>
      </div>

      {/* Phase-by-phase breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
        {scenario.phases.map(phase => {
          const rating = ratings?.[phase.id];
          const ratingCfg = RATING_OPTIONS.find(r => r.id === rating);
          const isExpanded = expandedPhase === phase.id;

          return (
            <div key={phase.id} style={{
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'var(--surface)',
              overflow: 'hidden',
            }}>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>{phase.label}</span>
                  {ratingCfg && (
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700,
                      color: ratingCfg.color, background: ratingCfg.bg,
                      border: `1px solid ${ratingCfg.border}`,
                      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
                    }}>
                      {ratingCfg.label}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>

              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '0.9rem 1rem' }}>
                  {responses?.[phase.id] && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        Your answer
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                        {responses[phase.id]}
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--purple)', marginBottom: '0.4rem' }}>
                      Model answer
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {phase.modelAnswer}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={onRetry}
          style={{
            padding: '0.55rem 1.1rem',
            background: 'var(--purple-bg)', color: 'var(--purple)',
            border: '1.5px solid var(--purple-border)', borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Retry Scenario
        </button>
        <button
          onClick={onBack}
          style={{
            padding: '0.55rem 1.1rem',
            background: 'var(--surface)', color: 'var(--text-muted)',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          ← Back to Room
        </button>
        {onNext && (
          <button
            onClick={onNext}
            className="pal-glow-pulse"
            style={{
              padding: '0.55rem 1.2rem',
              background: 'var(--purple)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            Next scenario →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Runner ──────────────────────────────────────────────────────────────
export function ProductDesignRunner({ caseId, savedProgress, onBack, onNext, onNavigate }) {
  const scenario = productDesignScenarios.find(s => s.id === caseId);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [responses, setResponses] = useState(savedProgress?.responses || {});
  const [ratings, setRatings] = useState(savedProgress?.ratings || {});
  const [completedPhaseIds, setCompletedPhaseIds] = useState(savedProgress?.completedPhaseIds || []);
  const [view, setView] = useState(savedProgress?.result ? 'debrief' : 'writing'); // 'writing' | 'reveal' | 'debrief'
  const [result, setResult] = useState(savedProgress?.result || null);
  const [note, setNote] = useState(() => getNotes('product-design', scenario.id));
  useEffect(() => { setNote(getNotes('product-design', scenario.id)); }, [scenario.id]);

  const phases = scenario.phases;
  const currentPhase = phases[currentPhaseIndex];
  const isLastPhase = currentPhaseIndex === phases.length - 1;
  const currentResponse = responses[currentPhase?.id] || '';
  const currentRating = ratings[currentPhase?.id] || null;

  function handleResponseChange(value) {
    const next = { ...responses, [currentPhase.id]: value };
    setResponses(next);
    savePhaseResponse(scenario.id, currentPhase.id, value);
  }

  function handleReveal() {
    setView('reveal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRate(ratingId) {
    const next = { ...ratings, [currentPhase.id]: ratingId };
    setRatings(next);
    savePhaseRating(scenario.id, currentPhase.id, ratingId);
  }

  function handleNext() {
    const phaseId = currentPhase.id;
    const nextCompleted = completedPhaseIds.includes(phaseId)
      ? completedPhaseIds
      : [...completedPhaseIds, phaseId];
    setCompletedPhaseIds(nextCompleted);
    saveCompletedPhases(scenario.id, nextCompleted);

    if (!isLastPhase) {
      setCurrentPhaseIndex(currentPhaseIndex + 1);
      setView('writing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Last phase — finalize
      const finalCompleted = nextCompleted;
      const scored = computeProductDesignScore(scenario, ratings);
      saveProductDesignResult(scenario.id, scored);
      track('case_completed', { room: 'product-design', id: scenario.id, rating: scored.level });
      setResult(scored);
      setView('debrief');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleRetry() {
    clearProductDesignProgress(scenario.id);
    setResponses({});
    setRatings({});
    setCompletedPhaseIds([]);
    setCurrentPhaseIndex(0);
    setResult(null);
    setView('writing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>

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
          ← Product Design Room
        </button>
        <ShareLinkButton room="product-design" />
      </div>

      {/* Scenario header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700,
            color: scenario.companyColor || 'var(--purple)',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.45rem',
          }}>
            {scenario.company}
          </span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: 'var(--text-muted)',
          }}>
            {scenario.category}
          </span>
        </div>
        <h1 style={{
          fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)',
          margin: '0', lineHeight: 1.3, letterSpacing: '-0.015em',
        }}>
          {scenario.title}
        </h1>
      </div>

      {/* Prompt */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1rem',
        fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.75,
        marginBottom: '1.5rem', whiteSpace: 'pre-wrap',
      }}>
        {scenario.prompt}
      </div>

      {/* ── Debrief view ── */}
      {view === 'debrief' && (
        <>
          <DebriefView
            scenario={scenario}
            responses={responses}
            ratings={ratings}
            result={result}
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
              onChange={e => { setNote(e.target.value); saveNote('product-design', scenario.id, e.target.value); }}
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
          <ForwardPointerCard room='product-design' onNavigate={onNavigate} onNext={onNext} />
        </>
      )}

      {/* ── Writing / Reveal views ── */}
      {view !== 'debrief' && (
        <>
          <PhaseNav
            phases={phases}
            currentIndex={currentPhaseIndex}
            completedIds={completedPhaseIds}
          />

          {/* Phase header */}
          <div style={{ marginBottom: '0.85rem' }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.09em', color: 'var(--purple)', marginBottom: '0.25rem',
            }}>
              Phase {currentPhaseIndex + 1} of {phases.length}
            </div>
            <h2 style={{
              fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)',
              margin: '0 0 0.3rem', letterSpacing: '-0.01em',
            }}>
              {currentPhase.label}
            </h2>
            <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              {currentPhase.guidance}
            </div>
          </div>

          {/* Phase question */}
          <div style={{
            background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
            borderLeft: '3px solid var(--accent)',
            borderRadius: 'var(--radius)', padding: '0.8rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)',
            lineHeight: 1.55,
          }}>
            {currentPhase.prompt}
          </div>

          {/* Response textarea */}
          <textarea
            value={currentResponse}
            onChange={e => handleResponseChange(e.target.value)}
            disabled={view === 'reveal'}
            placeholder="Write your answer here — think out loud, structure your reasoning..."
            style={{
              width: '100%', minHeight: '180px',
              background: view === 'reveal' ? 'var(--surface-2)' : 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '0.9rem',
              fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.7,
              resize: 'vertical', outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              opacity: view === 'reveal' ? 0.7 : 1,
              transition: 'border-color 0.12s',
            }}
            onFocus={e => { if (view === 'writing') e.target.style.borderColor = 'var(--purple)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
          />

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {view === 'writing' && (
              <button
                onClick={handleReveal}
                disabled={currentResponse.trim().length < 20}
                style={{
                  padding: '0.55rem 1.15rem',
                  background: currentResponse.trim().length >= 20 ? 'var(--purple)' : 'var(--surface-2)',
                  color: currentResponse.trim().length >= 20 ? 'white' : 'var(--text-muted)',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem', fontWeight: 700,
                  cursor: currentResponse.trim().length >= 20 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.12s',
                }}
              >
                Reveal Model Answer →
              </button>
            )}

            {view === 'reveal' && (
              <button
                onClick={handleNext}
                disabled={!currentRating}
                style={{
                  padding: '0.55rem 1.15rem',
                  background: currentRating ? 'var(--purple)' : 'var(--surface-2)',
                  color: currentRating ? 'white' : 'var(--text-muted)',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem', fontWeight: 700,
                  cursor: currentRating ? 'pointer' : 'not-allowed',
                  transition: 'all 0.12s',
                }}
              >
                {isLastPhase ? 'See Results →' : `Next Phase: ${phases[currentPhaseIndex + 1]?.label} →`}
              </button>
            )}

            {view === 'writing' && (
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                {currentResponse.trim().length < 20 ? 'Write at least a few sentences to reveal the model answer' : ''}
              </span>
            )}

            {view === 'reveal' && !currentRating && (
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                Rate your answer to continue
              </span>
            )}
          </div>

          {/* Model answer panel (shown in reveal view) */}
          {view === 'reveal' && (
            <ModelAnswerPanel
              phase={currentPhase}
              onRate={handleRate}
              currentRating={currentRating}
            />
          )}
        </>
      )}
    </div>
  );
}
