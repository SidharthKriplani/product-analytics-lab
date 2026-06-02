import { useState, useEffect } from 'react';
import { metricCases } from '../../data/metricCases.js';
import { MetricChoicePanel } from './MetricChoicePanel.jsx';
import { MetricScoreReveal } from './MetricScoreReveal.jsx';
import { MetricDebriefPanel } from './MetricDebriefPanel.jsx';
import { DebriefCopyButton } from '../shared/DebriefCopyButton.jsx';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { LeadershipLens } from '../shared/LeadershipLens.jsx';
import { Icon } from '../shared/Icon.jsx';
import { saveMetricsAttempt, clearMetricsProgress } from '../../utils/metricsProgress.js';
import { track } from '../../utils/analytics.js';

const ROOM_KEY = 'metrics';
const NOTES_KEY = 'pal-notes-v1';
function loadNote(room, id) {
  try { const n = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); return n[room + ':' + id] || ''; } catch { return ''; }
}
function saveNote(room, id, text) {
  try { const n = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); n[room + ':' + id] = text; localStorage.setItem(NOTES_KEY, JSON.stringify(n)); } catch {}
}

function computeScore(metricCase, fieldChoices) {
  let score = 0;
  let maxScore = 0;
  for (const field of metricCase.fields) {
    maxScore += 2;
    const chosenId = fieldChoices[field.id];
    if (chosenId) {
      const opt = field.options.find(o => o.id === chosenId);
      if (opt) score += opt.scoreValue;
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

export function MetricsRunner({ caseId, savedProgress, onBack, onGoToDesign, onGoToReview, onNext, onNavigate }) {
  const metricCase = metricCases.find(m => m.id === caseId);
  const hasExisting = !!(savedProgress && savedProgress.fieldChoices);

  const [fieldChoices, setFieldChoices] = useState(
    hasExisting ? savedProgress.fieldChoices : {}
  );
  const [view, setView] = useState(hasExisting ? 'debrief' : 'question');
  const [submitted, setSubmitted] = useState(hasExisting);
  const [scoreResult, setScoreResult] = useState(
    hasExisting
      ? computeScore(metricCase, savedProgress.fieldChoices)
      : null
  );
  const [userNote, setUserNote] = useState(() => loadNote(ROOM_KEY, metricCase.id));
  const [noteSaved, setNoteSaved] = useState(false);
  useEffect(() => { setUserNote(loadNote(ROOM_KEY, metricCase.id)); setNoteSaved(false); }, [metricCase.id]);

  const allAnswered = metricCase.fields.every(f => fieldChoices[f.id]);

  function handleSelect(fieldId, optionId) {
    setFieldChoices(prev => ({ ...prev, [fieldId]: optionId }));
  }

  function handleSubmit() {
    const result = computeScore(metricCase, fieldChoices);
    setScoreResult(result);
    setSubmitted(true);
    saveMetricsAttempt(metricCase.id, fieldChoices, result.score, result.level);
    track('case_completed', { room: 'metrics', id: metricCase.id, rating: result.level });
    setView('reveal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRetry() {
    clearMetricsProgress(metricCase.id);
    setFieldChoices({});
    setSubmitted(false);
    setScoreResult(null);
    setView('question');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Back nav */}
      <button
        onClick={onBack}
        className="pal-back-btn"
        style={{ marginBottom: '1.25rem' }}
      >
        <Icon name="arrow-left" size={14} color="currentColor" />Metrics Room
      </button>

      {/* Case header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.09em', color: 'var(--green)', marginBottom: '0.35rem',
        }}>
          {metricCase.id} · {metricCase.domain}
        </div>
        <h1 style={{
          fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)',
          margin: '0 0 0.25rem', letterSpacing: '-0.02em', lineHeight: 1.3,
        }}>
          {metricCase.title}
        </h1>
        <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>
          {metricCase.subtitle}
        </p>
      </div>

      {/* Context panel — always shown in question/reveal views */}
      {(view === 'question' || (view === 'reveal' && submitted)) && (
        <ContextPanel context={metricCase.context} />
      )}

      {/* Question view */}
      {view === 'question' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
          {metricCase.fields.map(field => (
            <MetricChoicePanel
              key={field.id}
              field={field}
              selectedId={fieldChoices[field.id] || null}
              onSelect={optId => handleSelect(field.id, optId)}
              submitted={submitted}
            />
          ))}

          {!submitted && (
            <div style={{ paddingTop: '0.5rem' }}>
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                style={{
                  background: allAnswered ? 'var(--green)' : 'var(--surface-2)',
                  border: `1.5px solid ${allAnswered ? 'var(--green-border)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem', fontWeight: 700,
                  color: allAnswered ? '#fff' : 'var(--text-dim)',
                  cursor: allAnswered ? 'pointer' : 'not-allowed',
                  transition: 'all 0.1s',
                  width: '100%',
                }}
              >
                {allAnswered
                  ? 'Submit metric design →'
                  : `Answer all ${metricCase.fields.length} fields to submit (${Object.keys(fieldChoices).length}/${metricCase.fields.length} done)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reveal view */}
      {view === 'reveal' && scoreResult && (
        <div className="pal-reveal-in" style={{ marginTop: '1.25rem' }}>
          <MetricScoreReveal
            score={scoreResult.score}
            maxScore={scoreResult.maxScore}
            level={scoreResult.level}
            fieldChoices={fieldChoices}
            metricCase={metricCase}
            onContinue={() => { setView('debrief'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </div>
      )}

      {/* Debrief view */}
      {view === 'debrief' && (
        <div className="pal-reveal-in" style={{ marginTop: '1.25rem' }}>
          <div className="pal-textarea-wrap" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Icon name="pen-line" size={12} color="currentColor" />Your notes <span style={{ fontWeight: 400, opacity: 0.6 }}>(saved locally)</span>
              </div>
              <DebriefCopyButton
                title={metricCase.title}
                notes={userNote}
                modelAnswer={metricCase.seniorMetricDesign ? metricCase.seniorMetricDesign.summary : ''}
                tags={metricCase.tags || []}
                difficulty={metricCase.difficulty}
                room={'Metrics Room'}
              />
            </div>
            <textarea
              value={userNote}
              onChange={e => { setUserNote(e.target.value); setNoteSaved(false); }}
              placeholder="Jot your thinking — what stood out, what you missed, what to remember..."
              style={{
                width: '100%', minHeight: 72, padding: '10px 12px', background: 'var(--bg)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                fontSize: '0.88rem', lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => { saveNote(ROOM_KEY, metricCase.id, userNote); setNoteSaved(true); }}
              style={{
                marginTop: 8, padding: '5px 14px', background: noteSaved ? 'var(--green-bg)' : 'var(--surface)',
                border: '1px solid ' + (noteSaved ? 'var(--green-border)' : 'var(--border)'),
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem',
                color: noteSaved ? 'var(--green)' : 'var(--text-muted)',
              }}
            >{noteSaved ? '✓ Saved' : 'Save note'}</button>
          </div>
          <LeadershipLens note={metricCase.leadershipNote} />
          <MetricDebriefPanel
            metricCase={metricCase}
            onRetry={handleRetry}
            onBack={onBack}
            onNext={onNext}
            onGoToDesign={onGoToDesign}
            onGoToReview={onGoToReview}
          />
          <ForwardPointerCard room='metrics' onNavigate={onNavigate} onNext={onNext} />
        </div>
      )}
    </div>
  );
}

function ContextPanel({ context }) {
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius)', padding: '1.1rem 1.2rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      <CtxLabel>The situation</CtxLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <CtxRow label="Company" value={context.company} />
        <CtxRow label="Product" value={context.product} />
        <CtxRow label="Goal" value={context.businessGoal} />
      </div>

      {/* Pressure callout */}
      <div style={{
        marginTop: '0.25rem',
        background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
        borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.7rem',
      }}>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: '0.25rem',
        }}>Business pressure</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {context.pressure}
        </p>
      </div>

      {/* Trap callout */}
      <div style={{
        background: 'var(--red-bg)', border: '1px solid var(--red-border)',
        borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.7rem',
      }}>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--red)', marginBottom: '0.25rem',
        }}>The common trap</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {context.trap}
        </p>
      </div>
    </div>
  );
}

function CtxLabel({ children }) {
  return (
    <div style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.09em', color: 'var(--text-dim)',
    }}>{children}</div>
  );
}

function CtxRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
      <span style={{
        fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)',
        minWidth: '58px', paddingTop: '0.05rem', flexShrink: 0,
      }}>{label}</span>
      <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{value}</span>
    </div>
  );
}
