import { useState, useEffect } from 'react';
import { metricCases } from '../../data/metricCases.js';
import { MetricChoicePanel } from './MetricChoicePanel.jsx';
import { MetricScoreReveal } from './MetricScoreReveal.jsx';
import { MetricDebriefPanel } from './MetricDebriefPanel.jsx';
import { DebriefCopyButton } from '../shared/DebriefCopyButton.jsx';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { LeadershipLens } from '../shared/LeadershipLens.jsx';
import { Icon } from '../shared/Icon.jsx';
import { NotesBox } from '../shared/NotesBox.jsx';
import { GateOverlay } from '../shared/GateOverlay.jsx';
import { saveMetricsAttempt, clearMetricsProgress, saveMetricsDraft, loadMetricsDraft, clearMetricsDraft } from '../../utils/metricsProgress.js';
import { track } from '../../utils/analytics.js';
import { Breadcrumb } from '../shared/Breadcrumb.jsx';
import { ShareLinkButton } from '../shared/ShareLinkButton.jsx';
import { DescribePanel } from '../shared/DescribePanel.jsx';
import { AnswerModeToggle, loadAnswerMode, saveAnswerMode } from '../shared/AnswerModeToggle.jsx';

const ROOM_KEY = 'metrics';

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

// ─── Describe-mode derivation ────────────────────────────────────────────────
// Free-text fields mirror the metric design the user is asked to produce.
function deriveDescribeFields(metricCase) {
  return (metricCase.fields || []).map(f => ({
    id: f.id,
    label: f.label,
    placeholder: f.prompt || 'Name the metric and justify it...',
  }));
}
// Key points = the authoritative metric tree (name + role) from the senior design,
// plus a guardrail-discipline reminder. Keywords come from the metric name.
function deriveMetricKeyPoints(metricCase) {
  const smd = metricCase.seniorMetricDesign;
  if (!smd || !Array.isArray(smd.metricTree)) return [];
  return smd.metricTree.map((node, i) => ({
    id: 'mt' + i,
    text: (node.role ? node.role.charAt(0).toUpperCase() + node.role.slice(1) + ': ' : '') + node.name + ' — ' + node.rationale,
    shortLabel: node.name,
    keywords: deriveKeywordsFromName(node.name),
  }));
}
function deriveKeywordsFromName(name) {
  if (!name) return [];
  // Keep the distinctive multi-word phrase plus its salient tokens.
  const tokens = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);
  return [String(name).toLowerCase(), ...tokens].slice(0, 5);
}
// Model answer node = senior summary + interview phrase.
function MetricModelAnswer({ metricCase }) {
  const smd = metricCase.seniorMetricDesign || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
        {smd.summary}
      </p>
      {smd.interviewPhrase && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: 0, lineHeight: 1.65, fontStyle: 'italic' }}>
          &ldquo;{smd.interviewPhrase}&rdquo;
        </p>
      )}
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
        Full metric tree, common mistakes, and linked scenarios appear in the debrief below.
      </p>
    </div>
  );
}

export function MetricsRunner({ caseId, savedProgress, onBack, onGoToDesign, onGoToReview, onNext, onNavigate, user, onShowAuth }) {
  const metricCase = metricCases.find(m => m.id === caseId);
  const hasExisting = !!(savedProgress && savedProgress.fieldChoices);
  const _draft = !hasExisting ? loadMetricsDraft(metricCase.id) : null;

  const [fieldChoices, setFieldChoices] = useState(
    hasExisting ? savedProgress.fieldChoices : (_draft || {})
  );
  const [view, setView] = useState(hasExisting ? 'debrief' : 'question');
  const [answerMode, setAnswerMode] = useState(loadAnswerMode());
  function handleAnswerModeChange(mode) { setAnswerMode(mode); saveAnswerMode(mode); }

  useEffect(function() {
    if (!hasExisting) saveMetricsDraft(metricCase.id, fieldChoices);
  }, [fieldChoices, hasExisting, metricCase.id]);
  const [submitted, setSubmitted] = useState(hasExisting);
  const [scoreResult, setScoreResult] = useState(
    hasExisting
      ? computeScore(metricCase, savedProgress.fieldChoices)
      : null
  );
  const [liveNote, setLiveNote] = useState('');

  const allAnswered = metricCase.fields.every(f => fieldChoices[f.id]);

  function handleSelect(fieldId, optionId) {
    setFieldChoices(prev => ({ ...prev, [fieldId]: optionId }));
  }

  function handleSubmit() {
    const result = computeScore(metricCase, fieldChoices);
    setScoreResult(result);
    setSubmitted(true);
    clearMetricsDraft(metricCase.id);
    saveMetricsAttempt(metricCase.id, fieldChoices, result.score, result.level);
    track('case_completed', { room: 'metrics', id: metricCase.id, rating: result.level });
    setView('reveal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRetry() {
    clearMetricsProgress(metricCase.id);
    clearMetricsDraft(metricCase.id);
    setFieldChoices({});
    setSubmitted(false);
    setScoreResult(null);
    setView('question');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Describe mode: no MCQ score — the user self-assesses, then proceeds straight
  // to the full debrief (skipping the score-reveal screen).
  function handleDescribeContinue() {
    setSubmitted(true);
    track('case_completed', { room: 'metrics', id: metricCase.id, mode: 'describe' });
    setView('debrief');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Back nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          onClick={onBack}
          className="pal-back-btn"
        >
          <Icon name="arrow-left" size={14} color="currentColor" />Metrics Room
        </button>
        <ShareLinkButton room="metrics" />
      </div>

      <Breadcrumb crumbs={[
        { label: 'PAL', onClick: onBack },
        { label: 'Metrics Room', onClick: onBack },
        { label: caseId },
      ]} />

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
          {!submitted && (
            <AnswerModeToggle value={answerMode} onChange={handleAnswerModeChange} accent="green" />
          )}

          {/* Describe mode — type your own metric design first, then reveal + self-assess */}
          {answerMode === 'describe' && !submitted && (
            <DescribePanel
              fields={deriveDescribeFields(metricCase)}
              keyPoints={deriveMetricKeyPoints(metricCase)}
              modelAnswer={<MetricModelAnswer metricCase={metricCase} />}
              onRevealed={() => track('describe_revealed', { room: 'metrics', id: metricCase.id })}
            />
          )}

          {answerMode === 'describe' && !submitted && (
            <div style={{ paddingTop: '0.25rem' }}>
              <button
                onClick={handleDescribeContinue}
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
          )}

          {/* Options mode — existing scaffolded multiple-choice flow (untouched) */}
          {answerMode === 'options' && metricCase.fields.map(field => (
            <MetricChoicePanel
              key={field.id}
              field={field}
              selectedId={fieldChoices[field.id] || null}
              onSelect={optId => handleSelect(field.id, optId)}
              submitted={submitted}
            />
          ))}

          {answerMode === 'options' && !submitted && (
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
          <NotesBox
            storageKey={`${ROOM_KEY}:${metricCase.id}`}
            onChange={setLiveNote}
            right={
              <DebriefCopyButton
                title={metricCase.title}
                notes={liveNote}
                modelAnswer={metricCase.seniorMetricDesign ? metricCase.seniorMetricDesign.summary : ''}
                tags={metricCase.tags || []}
                difficulty={metricCase.difficulty}
                room={'Metrics Room'}
              />
            }
          />
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
