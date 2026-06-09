import { useState, useEffect } from 'react';
import { savePrioritizationAttempt, getPrioritizationProgress, savePrioritizationDraft, loadPrioritizationDraft, clearPrioritizationDraft } from '../../utils/prioritizationProgress.js';
import { track } from '../../utils/analytics.js';
import { prioritizationScenarios } from '../../data/prioritizationScenarios.js';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';

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

const RATINGS = [
  { id: 'strong',  label: 'Nailed it',       sub: 'Hit the framework, the tradeoffs, and the recommendation' },
  { id: 'partial', label: 'Mostly there',     sub: 'Got the structure but missed key nuance or a stakeholder angle' },
  { id: 'miss',    label: 'Needs more work',  sub: 'Framework incomplete or recommendation unsupported' },
];

const RATING_STYLE = {
  strong:  { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  partial: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  miss:    { color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)' },
};

export function PrioritizationRunner({ caseId, onBack, onNext, onNavigate }) {
  const scenario = prioritizationScenarios.find(s => s.id === caseId);
  const existing = getPrioritizationProgress(scenario.id);
  const [response, setResponse] = useState(() => {
    if (existing?.response) return existing.response;
    return loadPrioritizationDraft(scenario.id)?.response || '';
  });
  const [revealed, setRevealed] = useState(!!existing?.rating);
  const [rating, setRating] = useState(existing?.rating || null);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [frameworkOpen, setFrameworkOpen] = useState(false);
  const [note, setNote] = useState(() => getNotes('prioritization', scenario.id));
  useEffect(() => { setNote(getNotes('prioritization', scenario.id)); }, [scenario.id]);

  useEffect(() => {
    if (!existing?.rating && !revealed) savePrioritizationDraft(scenario.id, { response });
  }, [response]); // eslint-disable-line

  const canReveal = response.trim().length >= 40;

  function handleReveal() {
    if (!canReveal) return;
    setRevealed(true);
  }

  function handleRate(r) {
    clearPrioritizationDraft(scenario.id);
    setRating(r);
    savePrioritizationAttempt(scenario.id, response, r);
    track('case_completed', { room: 'prioritization', id: scenario.id, rating: r });
  }

  function handleRetry() {
    clearPrioritizationDraft(scenario.id);
    setResponse('');
    setRevealed(false);
    setRating(null);
    setHintsOpen(false);
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.5rem', padding: 0 }}
      >
        ← Back to Prioritization Room
      </button>

      {/* Scenario header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {scenario.company}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>·</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Prioritization</span>
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>
          {scenario.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{scenario.subtitle}</p>
      </div>

      {/* Context */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
          Scenario
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>
          {scenario.context}
        </p>
      </div>

      {/* Items table (if present) */}
      {scenario.items && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem', overflowX: 'auto' }}>
          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
            Items to Prioritize
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Name', 'Description', 'Details'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.4rem 0.6rem', color: 'var(--text-dim)', fontWeight: 600, fontSize: '0.78rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenario.items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: i < scenario.items.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td style={{ padding: '0.5rem 0.6rem', color: 'var(--accent)', fontWeight: 700 }}>{item.id}</td>
                  <td style={{ padding: '0.5rem 0.6rem', color: 'var(--text)', fontWeight: 500 }}>{item.name}</td>
                  <td style={{ padding: '0.5rem 0.6rem', color: 'var(--text-muted)' }}>{item.description}</td>
                  <td style={{ padding: '0.5rem 0.6rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    {/* render reach/impact/confidence/effort if RICE scenario */}
                    {item.reach && <div><strong>Reach:</strong> {item.reach}</div>}
                    {item.impact && <div><strong>Impact:</strong> {item.impact}</div>}
                    {item.confidence && <div><strong>Confidence:</strong> {item.confidence}</div>}
                    {item.effort && <div><strong>Effort:</strong> {item.effort}</div>}
                    {item.detail && <div>{item.detail}</div>}
                    {item.estimatedImpact && <div><strong>DAU impact:</strong> {item.estimatedImpact}</div>}
                    {item.learningImpact && <div><strong>Learning:</strong> {item.learningImpact}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Situation (pri03 style) */}
      {scenario.situation && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
            Situation Data
          </div>
          {Object.entries(scenario.situation).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.4rem', fontSize: '0.87rem' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: '160px', flexShrink: 0, textTransform: 'capitalize' }}>
                {k.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Requests (pri06 style) */}
      {scenario.requests && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
            Incoming Requests
          </div>
          {scenario.requests.map((req, i) => (
            <div key={i} style={{ marginBottom: i < scenario.requests.length - 1 ? '1rem' : 0, paddingBottom: i < scenario.requests.length - 1 ? '1rem' : 0, borderBottom: i < scenario.requests.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{req.requestor}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{req.request}</div>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                <span>Deadline: {req.deadline}</span>
                <span>Effort: {req.effort}</span>
                <span>Value: {req.strategicValue}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Framework collapsible */}
      {scenario.framework && (
        <button
          onClick={() => setFrameworkOpen(o => !o)}
          style={{
            width: '100%', textAlign: 'left', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '0.75rem 1rem', cursor: 'pointer', marginBottom: '1rem',
            color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 500,
          }}
        >
          {frameworkOpen ? '▾' : '▸'} Framework: {scenario.framework.name}
          {!frameworkOpen && <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>(click to expand)</span>}
        </button>
      )}
      {frameworkOpen && scenario.framework && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {scenario.framework.formula && (
            <div style={{ fontFamily: 'monospace', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.6rem 0.9rem', marginBottom: '0.75rem', color: 'var(--text)', fontWeight: 600 }}>
              {scenario.framework.formula}
            </div>
          )}
          {scenario.framework.steps && (
            <ol style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {scenario.framework.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          )}
          {scenario.framework.quadrants && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '0.5rem' }}>
              {Object.entries(scenario.framework.quadrants).map(([k, v]) => (
                <div key={k} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.6rem 0.8rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.82rem', marginBottom: '0.2rem' }}>{k}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prompt */}
      <div style={{ background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
          Your Task
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>
          {scenario.prompt}
        </p>
      </div>

      {/* Hints */}
      <button
        onClick={() => setHintsOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '0.75rem 1rem', cursor: 'pointer', marginBottom: '1rem',
          color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 500,
        }}
      >
        {hintsOpen ? '▾' : '▸'} Hints
        {!hintsOpen && <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>(try first, then check)</span>}
      </button>
      {hintsOpen && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.75 }}>
            {scenario.hints.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </div>
      )}

      {/* Response area */}
      {!revealed && (
        <>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            placeholder="Write your prioritization rationale here. Score each item, stack-rank with tradeoffs, and state your recommendation clearly..."
            rows={10}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.85rem 1rem',
              color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.65,
              resize: 'vertical', outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: response.trim().length < 40 ? 'var(--text-dim)' : 'var(--green)' }}>
              {response.trim().length < 40 ? `${response.trim().length}/40 characters to unlock` : '✓ Ready to reveal'}
            </span>
            <button
              onClick={handleReveal}
              disabled={!canReveal}
              style={{
                background: canReveal ? 'var(--accent)' : 'var(--surface-2)',
                color: canReveal ? '#fff' : 'var(--text-dim)',
                border: 'none', borderRadius: '7px', padding: '0.55rem 1.25rem',
                fontWeight: 600, fontSize: '0.88rem', cursor: canReveal ? 'pointer' : 'not-allowed',
              }}
            >
              See Model Answer →
            </button>
          </div>
        </>
      )}

      {/* Model Answer */}
      {revealed && (
        <div className="pal-reveal-in">
          {/* Show response */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Your Answer</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{response}</p>
          </div>

          {/* Model answer */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
              Model Answer
            </div>
            <ModelAnswerDisplay scenario={scenario} />
          </div>

          {/* Key takeaways */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
              Key Takeaways
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
              {scenario.keyTakeaways.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>

          {/* Self-rating */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
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
                      cursor: 'pointer',
                    }}
                  >
                    {r.label}
                    <div style={{ fontSize: '0.72rem', fontWeight: 400, opacity: 0.8, marginTop: '0.15rem' }}>{r.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              My Notes
            </div>
            <textarea
              value={note}
              onChange={e => { setNote(e.target.value); saveNote('prioritization', scenario.id, e.target.value); }}
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

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={handleRetry} style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '7px',
              padding: '0.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer',
            }}>
              ↺ Try again
            </button>
            <button onClick={onBack} style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: '7px',
              padding: '0.5rem 1.1rem', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer',
            }}>
              ← Back to Room
            </button>
            {onNext && (
              <button onClick={onNext} className="pal-glow-pulse" style={{
                background: 'var(--purple)', border: 'none', borderRadius: '7px',
                padding: '0.5rem 1.2rem', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                marginLeft: 'auto',
              }}>
                Next scenario →
              </button>
            )}
          </div>
          <ForwardPointerCard room='prioritization' onNavigate={onNavigate} onNext={onNext} />
        </div>
      )}
    </div>
  );
}

function ModelAnswerDisplay({ scenario }) {
  const m = scenario.modelAnswer;
  if (!m) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>

      {/* RICE table (pri01) */}
      {m.riceTable && (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>RICE Scores</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Item', 'Reach', 'Impact', 'Conf.', 'Effort', 'Score', 'Rationale'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.35rem 0.5rem', color: 'var(--text-dim)', fontWeight: 600, fontSize: '0.77rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.riceTable.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.45rem 0.5rem', fontWeight: 600, color: 'var(--accent)' }}>{row.id}</td>
                  <td style={{ padding: '0.45rem 0.5rem' }}>{row.reach}M</td>
                  <td style={{ padding: '0.45rem 0.5rem' }}>{row.impact}×</td>
                  <td style={{ padding: '0.45rem 0.5rem' }}>{Math.round(row.confidence * 100)}%</td>
                  <td style={{ padding: '0.45rem 0.5rem' }}>{row.effort} sp</td>
                  <td style={{ padding: '0.45rem 0.5rem', fontWeight: 700, color: 'var(--text)' }}>{row.score}</td>
                  <td style={{ padding: '0.45rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{row.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {m.committedItems && (
            <div style={{ marginTop: '0.75rem' }}>
              <strong style={{ color: 'var(--text)' }}>Committed:</strong> {m.committedItems.join(', ')} ({m.totalEffort})
            </div>
          )}
          {m.deprioritizedRationale && (
            <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text)' }}>Deprioritized:</strong> {m.deprioritizedRationale}
            </div>
          )}
          {m.stakeHolderNote && (
            <div style={{ marginTop: '0.5rem', background: 'var(--surface-2)', borderRadius: '6px', padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text)' }}>Stakeholder comms:</strong> {m.stakeHolderNote}
            </div>
          )}
        </div>
      )}

      {/* Effort-impact matrix (pri02) */}
      {m.matrix && (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>Effort–Impact Matrix</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '0.5rem' }}>
            {[
              { label: '✅ Quick Wins', key: 'quickWins', color: 'var(--green)' },
              { label: '🎯 Strategic Bets', key: 'strategicBets', color: 'var(--accent)' },
              { label: '📌 Fill-ins', key: 'fillIns', color: 'var(--text-muted)' },
              { label: '🚫 Time-sinks', key: 'timeSinks', color: 'var(--red)' },
            ].map(({ label, key, color }) => (
              <div key={key} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '7px', padding: '0.75rem' }}>
                <div style={{ fontWeight: 600, color, fontSize: '0.82rem', marginBottom: '0.3rem' }}>{label}</div>
                <ul style={{ margin: 0, paddingLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                  {(m.matrix[key] || []).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
          {m.sixtyDayCommit && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.3rem' }}>60-day commit:</div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.7 }}>
                {m.sixtyDayCommit.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
          {m.notes && <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{m.notes}</p>}
        </div>
      )}

      {/* Tech debt (pri03) */}
      {m.velocityTax && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { label: 'Velocity tax', val: m.velocityTax },
            { label: 'Opportunity cost', val: m.opportunityCost },
            { label: 'Risk of not doing it', val: m.riskOfNotDoing },
            { label: 'Recommendation', val: m.recommendation },
          ].map(({ label, val }) => (
            <div key={label}>
              <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.84rem', marginBottom: '0.15rem' }}>{label}</div>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>{val}</p>
            </div>
          ))}
          {m.execSummary && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '7px', padding: '0.75rem 1rem', marginTop: '0.25rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>Exec Summary (3 sentences)</div>
              <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)' }}>{m.execSummary}</p>
            </div>
          )}
        </div>
      )}

      {/* Stakeholder conflict (pri04) */}
      {m.interestMapping && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem' }}>Interest Mapping</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '0.5rem' }}>
              {Object.entries(m.interestMapping).map(([k, v]) => (
                <div key={k} style={{ background: 'var(--surface-2)', borderRadius: '6px', padding: '0.6rem 0.8rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text)', textTransform: 'capitalize', marginBottom: '0.2rem' }}>{k}</div>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
          {m.optionSpace && (
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.3rem' }}>Option Space</div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.7 }}>
                {m.optionSpace.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
          )}
          {m.recommendation && (
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem' }}>Recommendation</div>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>{m.recommendation}</p>
            </div>
          )}
          {m.alignmentMemo && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '7px', padding: '0.75rem 1rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>Alignment Memo Draft</div>
              <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.7 }}>{m.alignmentMemo}</p>
            </div>
          )}
        </div>
      )}

      {/* OKR scoring (pri05) */}
      {m.scoring && (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>Dual-Mandate Scoring</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {m.scoring.map(row => (
              <div key={row.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '7px', padding: '0.7rem 0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{row.id}: {row.name}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)' }}>{row.recommendation}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  DAU: {row.dau} · Learning: {row.learning}
                </div>
              </div>
            ))}
          </div>
          {m.ceoFramingImpact && (
            <div style={{ marginTop: '0.75rem', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: '7px', padding: '0.7rem 0.9rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--yellow)', fontSize: '0.82rem', marginBottom: '0.2rem' }}>If CEO mandate is real:</div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{m.ceoFramingImpact}</p>
            </div>
          )}
          {m.keyInsight && <p style={{ marginTop: '0.5rem' }}>{m.keyInsight}</p>}
        </div>
      )}

      {/* Platform vs. feature (pri06) */}
      {m.platformVsFeature && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem' }}>Platform vs. Feature Analysis</div>
            {Object.entries(m.platformVsFeature).map(([k, v]) => (
              <div key={k} style={{ marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{k}: </span>
                <span style={{ color: 'var(--text-muted)' }}>{v}</span>
              </div>
            ))}
          </div>
          {m.sequencing && (
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.3rem' }}>Sequencing</div>
              {Object.entries(m.sequencing).map(([k, v]) => (
                <div key={k} style={{ marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', fontSize: '0.8rem' }}>{k}: </span>
                  <span style={{ color: 'var(--text-muted)' }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          {m.tradeoffs && (
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem' }}>Tradeoffs</div>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>{m.tradeoffs}</p>
            </div>
          )}
          {m.communicationTemplate && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '7px', padding: '0.75rem 1rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>Communication Template</div>
              <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.7 }}>{m.communicationTemplate}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
