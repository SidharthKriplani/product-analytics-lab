import { useState, useEffect, useRef } from 'react';
import { saveInstrumentationProgress, getInstrumentationProgress, saveInstrumentationDraft, loadInstrumentationDraft, clearInstrumentationDraft } from '../../utils/instrumentationProgress.js';
const IN_TEXT_KEY = 'pal-in-text-v1';
function loadINText(id) { try { return JSON.parse(localStorage.getItem(IN_TEXT_KEY) || '{}')[id] || ''; } catch { return ''; } }
function saveINText(id, text) { try { var d = JSON.parse(localStorage.getItem(IN_TEXT_KEY) || '{}'); d[id] = text; localStorage.setItem(IN_TEXT_KEY, JSON.stringify(d)); } catch {} }
function clearINText(id) { try { var d = JSON.parse(localStorage.getItem(IN_TEXT_KEY) || '{}'); delete d[id]; localStorage.setItem(IN_TEXT_KEY, JSON.stringify(d)); } catch {} }
import { track } from '../../utils/analytics.js';
import { instrumentationCases } from '../../data/instrumentationCases.js';
import { Icon } from '../shared/Icon.jsx';
import { NotesBox } from '../shared/NotesBox.jsx';
import { TimerButton } from '../shared/TimerButton.jsx';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { ShareLinkButton } from '../shared/ShareLinkButton.jsx';

const ROOM_KEY = 'instrumentation';
const DIFF_CFG = {
  junior: { label: 'Junior', color: 'var(--blue-text)', bg: 'var(--blue-bg)',    border: 'var(--blue-border)' },
  senior: { label: 'Senior', color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  staff:  { label: 'Staff',  color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
};

const DOMAIN_LABEL = {
  'measurement-plan':        'Measurement Plan',
  'event-taxonomy':          'Event Taxonomy',
  'data-quality':            'Data Quality',
  'ab-test-instrumentation': 'A/B Instrumentation',
  'privacy-consent':         'Privacy & Consent',
  'data-contracts':          'Data Contracts',
};

const STAR_LABELS = ['', 'Needs work', 'Getting there', 'Solid', 'Strong', 'Nailed it'];

// Screen 1: Situation
function SituationScreen({ caseData, onBegin }) {
  const [hintsOpen, setHintsOpen] = useState(false);
  const diffCfg = DIFF_CFG[caseData.difficulty] || DIFF_CFG.junior;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Case header badges */}
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{
          fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          {caseData.id}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>·</span>
        <span style={{
          fontSize: '0.7rem', fontWeight: 600,
          color: diffCfg.color, background: diffCfg.bg, border: '1px solid ' + diffCfg.border,
          borderRadius: '4px', padding: '0.1rem 0.4rem',
        }}>
          {diffCfg.label}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>·</span>
        <span style={{
          fontSize: '0.7rem', fontWeight: 500,
          color: 'var(--teal)', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
          borderRadius: '4px', padding: '0.1rem 0.4rem',
        }}>
          {DOMAIN_LABEL[caseData.domain] || caseData.domain}
        </span>
        <span style={{
          fontSize: '0.7rem', fontWeight: 500,
          color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderRadius: '4px', padding: '0.1rem 0.4rem',
        }}>
          {caseData.company}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>~{caseData.estimatedMin} min</span>
      </div>

      <h1 style={{
        fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)',
        margin: '0 0 0.3rem', letterSpacing: '-0.02em',
      }}>
        {caseData.title}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
        {caseData.subtitle}
      </p>

      {/* Situation */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
        borderRadius: '10px', padding: '1.25rem 1.4rem', marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--teal)', marginBottom: '0.65rem',
        }}>
          The Situation
        </div>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.92rem',
          lineHeight: 1.75, margin: 0,
        }}>
          {caseData.situation}
        </p>
      </div>

      {/* Question */}
      <div style={{
        background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
        borderRadius: '10px', padding: '1.25rem 1.4rem', marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--teal)', marginBottom: '0.5rem',
        }}>
          Your Question
        </div>
        <p style={{
          color: 'var(--text)', fontSize: '1rem', lineHeight: 1.65,
          margin: 0, fontWeight: 500,
        }}>
          {caseData.question}
        </p>
      </div>

      {/* Hints accordion */}
      <button
        onClick={() => setHintsOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: '8px',
          padding: '0.75rem 1rem', cursor: 'pointer', marginBottom: '1.5rem',
          color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}
      >
        <span>{hintsOpen ? '▾' : '▸'}</span>
        <span>Hints</span>
        {!hintsOpen && (
          <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            (try first, then check)
          </span>
        )}
      </button>
      {hintsOpen && (
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '1rem 1.1rem', marginBottom: '1.5rem',
          marginTop: '-1.1rem',
        }}>
          <ol style={{
            margin: 0, paddingLeft: '1.3rem',
            color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8,
          }}>
            {caseData.hints.map((h, i) => (
              <li key={i} style={{ marginBottom: i < caseData.hints.length - 1 ? '0.4rem' : 0 }}>
                {h}
              </li>
            ))}
          </ol>
        </div>
      )}

      <button
        onClick={onBegin}
        style={{
          background: 'var(--teal)', border: 'none', borderRadius: '8px',
          padding: '0.85rem 1.75rem', fontSize: '0.95rem', fontWeight: 700,
          color: '#001a1a', cursor: 'pointer', transition: 'opacity 0.1s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        Start Working →
      </button>
    </div>
  );
}

// Screen 2: Work
function WorkScreen({ caseData, onReveal }) {
  const [text, setText] = useState(() => loadINText(caseData.id));
  const [hintsOpen, setHintsOpen] = useState(false);

  useEffect(() => { saveINText(caseData.id, text); }, [text]); // eslint-disable-line

  function handleReveal() { clearINText(caseData.id); onReveal(); }
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused) {
      clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [paused]);

  const canReveal = text.trim().length >= 50;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--teal)', marginBottom: '0.3rem' }}>
            {caseData.id} · {caseData.title}
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.25rem' }}>
            Your Answer
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            {caseData.question}
          </p>
        </div>
        <div>
          <TimerButton elapsed={elapsed} paused={paused} onToggle={() => setPaused(p => !p)} warning={elapsed > 600} />
        </div>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Walk through your answer — define metrics, events, schemas, validation steps..."
        style={{
          width: '100%', boxSizing: 'border-box',
          minHeight: '240px',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '0.9rem 1rem',
          color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.7,
          resize: 'vertical', fontFamily: 'inherit', outline: 'none',
          marginBottom: '0.5rem',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--teal-border)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      />

      {/* Hints toggle */}
      <button
        onClick={() => setHintsOpen(o => !o)}
        style={{
          background: 'none', border: 'none', color: 'var(--text-dim)',
          fontSize: '0.8rem', cursor: 'pointer', padding: '0.25rem 0',
          display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.75rem',
        }}
      >
        <span>{hintsOpen ? '▾' : '▸'}</span>
        <span>Show hints</span>
      </button>
      {hintsOpen && (
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem',
        }}>
          <ol style={{
            margin: 0, paddingLeft: '1.3rem',
            color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.8,
          }}>
            {caseData.hints.map((h, i) => (
              <li key={i} style={{ marginBottom: i < caseData.hints.length - 1 ? '0.35rem' : 0 }}>
                {h}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', opacity: 0.8 }}>
          {canReveal
            ? 'Ready to compare with the model answer'
            : (50 - text.trim().length) + ' more characters to unlock reveal'}
        </span>
      </div>

      <button
        onClick={() => canReveal && handleReveal()}
        disabled={!canReveal}
        className="pal-cta"
      >
        Submit Answer →
      </button>
    </div>
  );
}

// Screen 3: Reveal
function RevealScreen({ caseData, onBack, onNext, onNavigate }) {
  const existing = getInstrumentationProgress(caseData.id);
  const [rating, setRating] = useState(existing?.rating || 0);
  const [leadershipOpen, setLeadershipOpen] = useState(false);
  const [checked, setChecked] = useState(
    (caseData.modelAnswer.keyInsights || []).map(() => false)
  );

  function handleRate(stars) {
    setRating(stars);
    saveInstrumentationProgress(caseData.id, { rating: stars });
    track('case_completed', { room: 'instrumentation', id: caseData.id, rating: stars });
  }

  function toggleCheck(i) {
    setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
  }

  const diffCfg = DIFF_CFG[caseData.difficulty] || DIFF_CFG.junior;

  return (
    <div className="pal-reveal-in" style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header badges */}
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{
          fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          {caseData.id}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>·</span>
        <span style={{
          fontSize: '0.7rem', fontWeight: 600,
          color: diffCfg.color, background: diffCfg.bg, border: '1px solid ' + diffCfg.border,
          borderRadius: '4px', padding: '0.1rem 0.4rem',
        }}>
          {diffCfg.label}
        </span>
        <span style={{
          fontSize: '0.7rem', fontWeight: 500,
          color: 'var(--teal)', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
          borderRadius: '4px', padding: '0.1rem 0.4rem',
        }}>
          {DOMAIN_LABEL[caseData.domain] || caseData.domain}
        </span>
        <span style={{
          fontSize: '0.7rem', fontWeight: 500,
          color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderRadius: '4px', padding: '0.1rem 0.4rem',
        }}>
          {caseData.company}
        </span>
      </div>

      <h1 style={{
        fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)',
        margin: '0 0 1.5rem', letterSpacing: '-0.02em',
      }}>
        {caseData.title} — Model Answer
      </h1>

      {/* Approach */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
        borderRadius: '10px', padding: '1.1rem 1.25rem', marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--teal)', marginBottom: '0.45rem',
        }}>
          How to Frame It
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
          {caseData.modelAnswer.approach}
        </p>
      </div>

      {/* Full answer */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--teal)', marginBottom: '0.65rem',
        }}>
          Model Answer
        </div>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.9rem',
          lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap',
        }}>
          {caseData.modelAnswer.answer}
        </p>
      </div>

      {/* Key Insights — teal border-left boxes */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '0.65rem',
        }}>
          Key Insights — check the ones you covered
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {(caseData.modelAnswer.keyInsights || []).map((insight, i) => (
            <label
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                cursor: 'pointer',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: checked[i] ? '3px solid var(--teal)' : '3px solid var(--border)',
                borderRadius: '0 8px 8px 0',
                padding: '0.75rem 1rem',
                transition: 'border-left-color 0.15s',
              }}
            >
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggleCheck(i)}
                style={{
                  marginTop: '0.18rem', accentColor: 'var(--teal)',
                  width: '15px', height: '15px', flexShrink: 0, cursor: 'pointer',
                }}
              />
              <span style={{
                fontSize: '0.88rem',
                color: checked[i] ? 'var(--text)' : 'var(--text-muted)',
                lineHeight: 1.6,
              }}>
                {insight}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Leadership Note — collapsible, purple */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setLeadershipOpen(o => !o)}
          style={{
            width: '100%', textAlign: 'left',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--purple, #9b59b6)',
            borderRadius: '0 8px 8px 0',
            padding: '0.85rem 1.1rem',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          <span style={{ display: 'inline-flex' }}><Icon name="briefcase" size={15} color="var(--purple, #9b59b6)" /></span>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'var(--purple, #9b59b6)',
            flex: 1,
          }}>
            Leadership Lens
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            {leadershipOpen ? '▾' : '▸'}
          </span>
        </button>
        {leadershipOpen && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderTop: 'none',
            borderLeft: '3px solid var(--purple, #9b59b6)',
            borderRadius: '0 0 8px 0',
            padding: '1rem 1.1rem',
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.75, margin: 0 }}>
              {caseData.leadershipNote}
            </p>
          </div>
        )}

        {/* Failure Mode */}
        {caseData.failureMode && (
          <div style={{ background: 'var(--red-bg, #fff5f5)', border: '1px solid var(--border)', borderLeft: '3px solid var(--red, #e53e3e)', borderRadius: '0 8px 8px 0', padding: '1rem 1.25rem', marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--red, #e53e3e)', marginBottom: '0.75rem' }}>Failure Mode</div>
            <div style={{ marginBottom: '0.6rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Weak answer pattern</div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{caseData.failureMode.weakAnswer}</p>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Interviewer follow-up that exposes it</div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.65, fontStyle: 'italic' }}>{caseData.failureMode.interviewerFollowUp}</p>
            </div>
          </div>
        )}
      </div>

      {/* Key Takeaways */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--text-dim)', marginBottom: '0.65rem',
        }}>
          Key Takeaways
        </div>
        <ul style={{
          margin: 0, paddingLeft: '1.2rem',
          color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8,
        }}>
          {(caseData.keyTakeaways || []).map((t, i) => (
            <li key={i} style={{ marginBottom: i < caseData.keyTakeaways.length - 1 ? '0.4rem' : 0 }}>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <NotesBox storageKey={`${ROOM_KEY}:${caseData.id}`} />

      {/* Star rating */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem',
      }}>
        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
          Rate this case
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.5rem', padding: '0.1rem',
                color: star <= rating ? 'var(--teal)' : 'var(--border)',
                transition: 'color 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--teal)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = star <= rating ? 'var(--teal)' : 'var(--border)'; }}
            >
              <Icon name="star-filled" size={24} color="currentColor" />
            </button>
          ))}
          {rating > 0 && (
            <span style={{ fontSize: '0.82rem', color: 'var(--teal)', marginLeft: '0.4rem' }}>
              {STAR_LABELS[rating]}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: '7px',
            padding: '0.5rem 1.1rem', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer',
          }}
        >
          ← Back to Instrumentation Room
        </button>
        {onNext && rating > 0 && (
          <button
            onClick={onNext}
            className="pal-glow-pulse"
            style={{
              background: 'var(--teal)', border: 'none', borderRadius: '7px',
              padding: '0.5rem 1.25rem', color: '#001a1a', fontSize: '0.85rem',
              fontWeight: 700, cursor: 'pointer', marginLeft: 'auto',
              transition: 'opacity 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Next Case →
          </button>
        )}
      </div>
      <ForwardPointerCard room='instrumentation' onNavigate={onNavigate} onNext={onNext} />
    </div>
  );
}

// Main runner
export function InstrumentationRunner({ caseId, onBack, onNext, unlocked, onNavigate }) {
  const caseData = instrumentationCases.find(c => c.id === caseId);
  const _inDraft = loadInstrumentationDraft(caseData.id);
  const [screen, setScreen] = useState(_inDraft?.screen || 'situation');

  useEffect(() => {
    if (screen !== 'reveal') saveInstrumentationDraft(caseData.id, { screen });
  }, [screen]); // eslint-disable-line

  function handleBegin() {
    setScreen('work');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleReveal() {
    clearInstrumentationDraft(caseData.id);
    setScreen('reveal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (screen === 'situation') {
    return (
      <div>
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '1rem 1.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={onBack}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.85rem', padding: 0,
                display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}
            >
              ← Analytics Instrumentation Room
            </button>
            <ShareLinkButton room="instrumentation" />
          </div>
        </div>
        <SituationScreen caseData={caseData} onBegin={handleBegin} />
      </div>
    );
  }

  if (screen === 'work') {
    return (
      <div>
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '1rem 1.5rem 0' }}>
          <button
            onClick={() => setScreen('situation')}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.85rem', padding: 0,
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}
          >
            ← Back to situation
          </button>
        </div>
        <WorkScreen caseData={caseData} onReveal={handleReveal} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '1rem 1.5rem 0' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.85rem', padding: 0,
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >
          ← Analytics Instrumentation Room
        </button>
      </div>
      <RevealScreen
        caseData={caseData}
        onBack={onBack}
        onNext={onNext}
        unlocked={unlocked}
        onNavigate={onNavigate}
      />
    </div>
  );
}
