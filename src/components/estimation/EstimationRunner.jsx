import { useState, useEffect, useRef } from 'react';
import { saveEstimationAttempt, getEstimationProgress, saveEstimationDraft, loadEstimationDraft, clearEstimationDraft } from '../../utils/estimationProgress.js';
import { track } from '../../utils/analytics.js';
import { estimationProblems } from '../../data/estimationProblems.js';
import { Icon } from '../shared/Icon.jsx';
import { NotesBox } from '../shared/NotesBox.jsx';
import { TimerButton } from '../shared/TimerButton.jsx';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { ShareLinkButton } from '../shared/ShareLinkButton.jsx';
import { DescribePanel } from '../shared/DescribePanel.jsx';
import { AnswerModeToggle, loadAnswerMode, saveAnswerMode } from '../shared/AnswerModeToggle.jsx';

const ROOM_KEY = 'estimation';

const RATINGS = [
  {
    id: 'strong',
    label: 'Nailed it',
    sub: 'Right order of magnitude + clean structured reasoning',
  },
  {
    id: 'partial',
    label: 'Close',
    sub: 'Had the structure but off on a key assumption or number',
  },
  {
    id: 'miss',
    label: 'Needs more practice',
    sub: 'Approach was incomplete or estimate was way off',
  },
];

const RATING_STYLE = {
  strong:  { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  partial: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  miss:    { color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)' },
};

const APPROACH_COLOR = {
  'bottom-up': { color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  'top-down':  { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  'hybrid':    { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)' },
};

const CATEGORY_LABEL = {
  'market-sizing':   'Market Sizing',
  'product-metrics': 'Product Metrics',
  'cost-estimation': 'Cost Estimation',
  'capacity':        'Capacity',
};

// ─── Describe-mode derivation ───
// Key points = the model estimate's key assumptions + the final estimate, plus
// the strong-answer markers. Keywords come from each assumption / marker.
function deriveEstSalientKeywords(text) {
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
function deriveEstKeyPoints(problem) {
  const points = [];
  const ma = problem.modelAnswer || {};
  if (ma.finalEstimate) {
    points.push({
      id: 'final', text: 'Lands near the model estimate: ' + ma.finalEstimate, shortLabel: 'Final estimate',
      keywords: deriveEstSalientKeywords(ma.finalEstimate),
    });
  }
  (ma.keyAssumptions || []).forEach((a, i) => {
    points.push({
      id: 'assume' + i, text: 'Assumption: ' + a, shortLabel: 'Assumption ' + (i + 1),
      keywords: deriveEstSalientKeywords(a),
    });
  });
  // Cap at the most salient strong-answer markers so the checklist stays focused.
  (problem.strongAnswerMarkers || []).slice(0, 3).forEach((m, i) => {
    points.push({
      id: 'marker' + i, text: m, shortLabel: 'Strong move ' + (i + 1),
      keywords: deriveEstSalientKeywords(m),
    });
  });
  return points;
}
function EstModelAnswer({ problem }) {
  const ma = problem.modelAnswer || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {ma.finalEstimate && (
        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.55 }}>
          {ma.finalEstimate}
        </div>
      )}
      {ma.walkthrough && (
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
          {ma.walkthrough}
        </p>
      )}
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
        Key assumptions, sanity checks, and common mistakes appear in the debrief below.
      </p>
    </div>
  );
}

export function EstimationRunner({ caseId, onBack, onNext, onNavigate }) {
  const problem = estimationProblems.find(p => p.id === caseId);
  const existing = getEstimationProgress(problem.id);
  const [response, setResponse] = useState(() => {
    if (existing?.response) return existing.response;
    return loadEstimationDraft(problem.id)?.response || '';
  });
  const [revealed, setRevealed] = useState(!!existing?.rating);
  const [rating, setRating] = useState(existing?.rating || null);
  const [answerMode, setAnswerMode] = useState(loadAnswerMode());
  function handleAnswerModeChange(mode) { setAnswerMode(mode); saveAnswerMode(mode); }
  function handleEstDescribeContinue() {
    track('case_completed', { room: 'estimation', id: problem.id, mode: 'describe' });
    setRevealed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const [frameworkOpen, setFrameworkOpen] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [liveNote, setLiveNote] = useState('');

  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setElapsed(0);
    setPaused(false);
  }, [problem.id]);

  useEffect(() => {
    if (!existing?.rating && !revealed) saveEstimationDraft(problem.id, { response });
  }, [response]); // eslint-disable-line

  useEffect(() => {
    if (paused) {
      clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [paused, problem.id]);

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const canReveal = response.trim().length >= 40;

  function handleReveal() {
    if (!canReveal) return;
    setRevealed(true);
  }

  function handleRate(r) {
    clearEstimationDraft(problem.id);
    setRating(r);
    saveEstimationAttempt(problem.id, response, r);
    track('case_completed', { room: 'estimation', id: problem.id, rating: r });
  }

  function handleRetry() {
    clearEstimationDraft(problem.id);
    setResponse('');
    setRevealed(false);
    setRating(null);
    setFrameworkOpen(false);
    setHintsOpen(false);
  }

  const ac = APPROACH_COLOR[problem.approach] || {};

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={onBack}
          className="pal-back-btn"
        >
          <Icon name="arrow-left" size={14} color="currentColor" />Estimation Room
        </button>
        <ShareLinkButton room="estimation" />
      </div>

      {/* Problem header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {problem.id}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>·</span>
          {/* Approach badge */}
          <span style={{
            fontSize: '0.72rem', fontWeight: 600,
            color: ac.color, background: ac.bg, border: `1px solid ${ac.border}`,
            borderRadius: '4px', padding: '0.1rem 0.4rem',
          }}>
            {problem.approach}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>·</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            {CATEGORY_LABEL[problem.category] || problem.category}
          </span>
          <TimerButton elapsed={elapsed} paused={paused} onToggle={() => setPaused(p => !p)} warning={elapsed > 600} />
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>
          {problem.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          {problem.subtitle}
        </p>
      </div>

      {/* Prompt — prominent */}
      <div style={{
        background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
        borderRadius: '10px', padding: '1.25rem 1.4rem', marginBottom: '1rem',
      }}>
        <div style={{
          fontWeight: 700, fontSize: '0.8rem', color: 'var(--teal)',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem',
        }}>
          The Problem
        </div>
        <p style={{ color: 'var(--text)', fontSize: '1rem', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
          {problem.prompt}
        </p>
      </div>

      {/* Framework steps — collapsible */}
      <button
        onClick={() => setFrameworkOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: '8px',
          padding: '0.75rem 1rem', cursor: 'pointer', marginBottom: '0.6rem',
          color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 500,
        }}
      >
        {frameworkOpen ? '▾' : '▸'} Framework steps
        {!frameworkOpen && (
          <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            (scaffolding — expand if you need a starting structure)
          </span>
        )}
      </button>
      {frameworkOpen && (
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '1rem 1.1rem', marginBottom: '0.6rem',
        }}>
          <ol style={{ margin: 0, paddingLeft: '1.3rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
            {problem.frameworkSteps.map((step, i) => (
              <li key={i} style={{ marginBottom: i < problem.frameworkSteps.length - 1 ? '0.3rem' : 0 }}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Hints — collapsible */}
      <button
        onClick={() => setHintsOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: '8px',
          padding: '0.75rem 1rem', cursor: 'pointer', marginBottom: '1rem',
          color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 500,
        }}
      >
        {hintsOpen ? '▾' : '▸'} Hints
        {!hintsOpen && (
          <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            (try first, then check)
          </span>
        )}
      </button>
      {hintsOpen && (
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '1rem 1.1rem', marginBottom: '1rem',
        }}>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
            {problem.hints.map((h, i) => (
              <li key={i} style={{ marginBottom: i < problem.hints.length - 1 ? '0.25rem' : 0 }}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Answer mode toggle — before revealing */}
      {!revealed && (
        <AnswerModeToggle value={answerMode} onChange={handleAnswerModeChange} accent="teal" />
      )}

      {/* Describe mode — type your estimate, then reveal the model answer + self-assess */}
      {!revealed && answerMode === 'describe' && (
        <>
          <DescribePanel
            keyPoints={deriveEstKeyPoints(problem)}
            modelAnswer={<EstModelAnswer problem={problem} />}
            onRevealed={() => track('describe_revealed', { room: 'estimation', id: problem.id })}
          />
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={handleEstDescribeContinue}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '0.55rem 1.1rem',
                fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.12s', width: '100%',
              }}
            >
              Continue to full debrief →
            </button>
          </div>
        </>
      )}

      {/* Response area — Options mode (existing scaffolded write-and-reveal flow, untouched) */}
      {!revealed && answerMode === 'options' && (
        <>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            placeholder="Walk through your estimate step by step. State your anchors, show your arithmetic, and end with a range. Sanity check at the end."
            rows={11}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.85rem 1rem',
              color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.65,
              resize: 'vertical', outline: 'none', fontFamily: 'inherit',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--teal-border)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: response.trim().length < 40 ? 'var(--text-dim)' : 'var(--teal)' }}>
              {response.trim().length < 40
                ? `${response.trim().length}/40 characters to unlock`
                : <><Icon name="check" size={13} color="var(--teal)" /> Ready to reveal</>}
            </span>
          </div>
          <NotesBox
            storageKey={`${ROOM_KEY}:${problem.id}`}
            label="Write your thinking first"
            onChange={setLiveNote}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleReveal}
              disabled={!canReveal}
              className="pal-cta"
            >
              See Model Answer →
            </button>
          </div>
        </>
      )}

      {/* Model Answer panel */}
      {revealed && (
        <div className="pal-reveal-in">
          {/* Your answer */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem',
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Your Estimate
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
              {response}
            </p>
          </div>

          {/* Model answer — walkthrough */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem',
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
              Model Answer — Step-by-Step
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.8, margin: '0 0 1.25rem', whiteSpace: 'pre-wrap' }}>
              {problem.modelAnswer.walkthrough}
            </p>

            {/* Key assumptions */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                Key Assumptions
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.75 }}>
                {problem.modelAnswer.keyAssumptions.map((a, i) => (
                  <li key={i} style={{ marginBottom: '0.2rem' }}>{a}</li>
                ))}
              </ul>
            </div>

            {/* Final estimate — highlighted */}
            <div style={{
              background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
              borderRadius: '8px', padding: '0.9rem 1.1rem', marginBottom: '1.25rem',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                Final Estimate
              </div>
              <div style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 600 }}>
                {problem.modelAnswer.finalEstimate}
              </div>
            </div>

            {/* Sanity checks */}
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                Sanity Checks
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.75 }}>
                {problem.modelAnswer.sanityChecks.map((s, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Strong answer markers */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem',
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
              What Strong Answers Do
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
              {problem.strongAnswerMarkers.map((m, i) => (
                <li key={i} style={{ marginBottom: '0.2rem' }}>{m}</li>
              ))}
            </ul>
          </div>

          {/* Common mistakes */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem',
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
              Common Mistakes
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
              {problem.commonMistakes.map((m, i) => (
                <li key={i} style={{ marginBottom: '0.2rem' }}>{m}</li>
              ))}
            </ul>
          </div>

          {/* Failure Mode */}
          {problem.failureMode && (
            <div style={{ background: 'var(--red-bg, #fff5f5)', border: '1px solid var(--border)', borderLeft: '3px solid var(--red, #e53e3e)', borderRadius: '0 8px 8px 0', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--red, #e53e3e)', marginBottom: '0.75rem' }}>Failure Mode</div>
              <div style={{ marginBottom: '0.6rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Weak answer pattern</div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{problem.failureMode.weakAnswer}</p>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Interviewer follow-up that exposes it</div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.65, fontStyle: 'italic' }}>{problem.failureMode.interviewerFollowUp}</p>
              </div>
            </div>
          )}

          {/* Your notes */}
          {liveNote && (
            <div style={{ marginBottom: '1rem', padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>Your notes</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{liveNote}</div>
            </div>
          )}

          {/* Self-rating */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem',
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
              How did you do?
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {RATINGS.map(r => {
                const s = RATING_STYLE[r.id];
                const selected = rating === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRate(r.id)}
                    style={{
                      background: selected ? s.bg : 'var(--surface-2)',
                      border: `1px solid ${selected ? s.border : 'var(--border)'}`,
                      borderRadius: '8px', padding: '0.55rem 1rem',
                      color: selected ? s.color : 'var(--text-muted)',
                      fontWeight: selected ? 700 : 500, fontSize: '0.86rem',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {r.label}
                    <div style={{ fontSize: '0.72rem', fontWeight: 400, opacity: 0.8, marginTop: '0.15rem' }}>
                      {r.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleRetry}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '7px', padding: '0.5rem 1rem',
                color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              <Icon name="rotate-ccw" size={14} color="currentColor" /> Try again
            </button>
            <button
              onClick={onBack}
              style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: '7px',
                padding: '0.5rem 1.1rem', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              ← Back to Room
            </button>
            {onNext && (
              <button
                onClick={onNext}
                className="pal-glow-pulse"
                style={{
                  background: 'var(--teal)', border: 'none', borderRadius: '7px',
                  padding: '0.5rem 1.2rem', color: '#fff', fontSize: '0.85rem',
                  fontWeight: 600, cursor: 'pointer', marginLeft: 'auto',
                }}
              >
                Next problem →
              </button>
            )}
          </div>
          <ForwardPointerCard room='estimation' onNavigate={onNavigate} onNext={onNext} />
        </div>
      )}
    </div>
  );
}
