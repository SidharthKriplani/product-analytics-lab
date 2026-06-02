import { useState, useEffect, useRef, useCallback } from 'react';
import { saveBehavioralAttempt, getBehavioralProgress } from '../../utils/behavioralProgress.js';
import { track } from '../../utils/analytics.js';
import { behavioralQuestions } from '../../data/behavioralQuestions.js';
import { Icon } from '../shared/Icon.jsx';
import { TimerButton } from '../shared/TimerButton.jsx';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';

const ROOM_KEY = 'behavioral';

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

const RATINGS = [
  { id: 'strong',  label: 'Nailed the structure + insight',        sub: 'Strong structure and hit the key principle' },
  { id: 'partial', label: 'Had the structure, missed a key principle', sub: 'Solid framework but missing a nuance or key move' },
  { id: 'miss',    label: 'Needs more practice',                   sub: 'Story was unclear or missing the most important part' },
];

const RATING_STYLE = {
  strong:  { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  partial: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  miss:    { color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)' },
};

// Covers both STAR keys (BEH01-20) and framework keys (BEH21-30)
const FRAME_LABEL_COLOR = {
  situation: 'var(--accent)',
  task:      'var(--purple)',
  action:    'var(--teal)',
  result:    'var(--green)',
  behavior:  'var(--teal)',
  outcome:   'var(--green)',
};
const FRAME_LABEL = {
  situation: 'Situation',
  task:      'Task',
  action:    'Action',
  result:    'Result',
  behavior:  'Behavior',
  outcome:   'Outcome',
};

export function BehavioralRunner({ caseId, onBack, onNext, onNavigate }) {
  const question = behavioralQuestions.find(q => q.id === caseId);

  // Guard: if question not found, bail out gracefully rather than crash
  if (!question) {
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <button onClick={onBack} className="pal-back-btn" style={{ marginBottom: '1.5rem' }}>
          <Icon name="arrow-left" size={14} color="currentColor" />Back to Behavioral
        </button>
        <p style={{ color: 'var(--text-muted)' }}>Question not found.</p>
      </div>
    );
  }

  const existing = getBehavioralProgress(question.id);
  const [response, setResponse] = useState(existing?.response || '');
  const [revealed, setRevealed] = useState(!!existing?.rating);
  const [rating, setRating] = useState(existing?.rating || null);
  const [frameOpen, setFrameOpen] = useState(false);
  const [userNote, setUserNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setElapsed(0);
    setPaused(false);
  }, [question.id]);

  useEffect(() => {
    if (paused) {
      clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [paused, question.id]);

  useEffect(() => {
    setUserNote(loadNote(ROOM_KEY, question.id));
    setNoteSaved(false);
  }, [question.id]);

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const canReveal = response.trim().length >= 60;
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const speechSupported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  function toggleSpeech() {
    if (!speechSupported) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = e => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join(' ');
      setResponse(prev => (prev ? prev + ' ' : '') + transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, [question.id]);

  function handleReveal() {
    if (!canReveal) return;
    setRevealed(true);
  }

  function handleRate(r) {
    setRating(r);
    saveBehavioralAttempt(question.id, response, r);
    track('case_completed', { room: 'behavioral', id: question.id, rating: r });
  }

  function handleRetry() {
    setResponse('');
    setRevealed(false);
    setRating(null);
    setFrameOpen(false);
  }

  // Keyboard shortcuts: 1=Needs Work, 2=Good, 3=Strong (only after reveal), Enter=next
  const RATING_IDS = ['strong', 'partial', 'miss'];
  const handleKey = useCallback((e) => {
    if (!revealed) return;
    if (['1', '2', '3'].includes(e.key) && !rating) {
      const id = RATING_IDS[parseInt(e.key, 10) - 1];
      if (id) handleRate(id);
    }
    if (e.key === 'Enter' && rating && onNext) {
      e.preventDefault();
      onNext();
    }
  }, [revealed, rating, onNext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Determine schema type
  const isStarSchema = !!question.starGuide;
  const frameData = isStarSchema ? question.starGuide : question.storyFramework;
  const guideLabel = isStarSchema ? 'STAR Guide' : 'Story Framework';
  const strongMarkers = question.strongAnswerMarkers || question.strongSignals;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Back */}
      <button
        onClick={onBack}
        className="pal-back-btn"
        style={{ marginBottom: '1.5rem' }}
      >
        <Icon name="arrow-left" size={14} color="currentColor" />Back to Behavioral
      </button>

      {/* Question header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {question.id}
          </span>
          {question.category && (
            <>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>·</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{question.category}</span>
            </>
          )}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>·</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{question.difficulty}</span>
          <TimerButton elapsed={elapsed} paused={paused} onToggle={() => setPaused(p => !p)} warning={elapsed > 600} />
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>
          {question.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{question.subtitle}</p>
      </div>

      {/* The interview prompt */}
      <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
          Interview Question
        </div>
        <p style={{ color: 'var(--text)', fontSize: '0.95rem', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
          {question.prompt}
        </p>
      </div>

      {/* What they're really asking — BEH21+ only */}
      {question.whatTheyreReallyAsking && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.9rem 1.1rem', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            What They're Really Asking
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.65, margin: 0 }}>
            {question.whatTheyreReallyAsking}
          </p>
        </div>
      )}

      {/* STAR / Story Framework guide — collapsible */}
      {frameData && (
        <>
          <button
            onClick={() => setFrameOpen(o => !o)}
            style={{
              width: '100%', textAlign: 'left', background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.75rem 1rem', cursor: 'pointer', marginBottom: '1rem',
              color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 500,
            }}
          >
            {frameOpen ? '▾' : '▸'} {guideLabel}
            {!frameOpen && <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>(try first, then check)</span>}
          </button>
          {frameOpen && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(frameData).map(([key, text]) => (
                  <div key={key} style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      color: FRAME_LABEL_COLOR[key] || 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      minWidth: '72px', flexShrink: 0, paddingTop: '0.1rem',
                    }}>
                      {FRAME_LABEL[key] || key}
                    </span>
                    <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Response area */}
      {!revealed && (
        <>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            placeholder="Walk through your answer — use the framework above as your guide. Be specific: name the actual decision, the data you used, the stakeholder involved, and what changed."
            rows={11}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.85rem 1rem',
              color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.65,
              resize: 'vertical', outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: response.trim().length < 60 ? 'var(--text-dim)' : 'var(--green)' }}>
              {response.trim().length < 60 ? `${response.trim().length}/60 characters to unlock` : '✓ Ready to reveal'}
            </span>
            {speechSupported && (
              <button
                onClick={toggleSpeech}
                title={listening ? 'Stop recording' : 'Speak your answer (Chrome)'}
                style={{
                  background: listening ? 'var(--red-bg)' : 'var(--surface-2)',
                  border: '1px solid ' + (listening ? 'var(--red-border)' : 'var(--border)'),
                  borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.7rem',
                  fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  color: listening ? 'var(--red)' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  transition: 'all 0.12s',
                }}
              >
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: listening ? 'var(--red)' : 'var(--text-muted)', animation: listening ? 'palGlowPulse 1.2s ease-in-out infinite' : 'none' }} />
                {listening ? 'Recording...' : 'Speak answer'}
              </button>
            )}
          </div>
          <div className="pal-textarea-wrap" style={{ marginBottom: 16 }}>
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
              onClick={() => { saveNote(ROOM_KEY, question.id, userNote); setNoteSaved(true); }}
              style={{
                marginTop: 8, padding: '5px 14px', background: noteSaved ? 'var(--green-bg)' : 'var(--surface)',
                border: `1px solid ${noteSaved ? 'var(--green-border)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem',
                color: noteSaved ? 'var(--green)' : 'var(--text-muted)',
              }}
            >
              {noteSaved ? '✓ Saved' : 'Save note'}
            </button>
          </div>
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

      {/* Revealed state */}
      {revealed && (
        <div className="pal-reveal-in">
          {/* Your answer */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Your Answer</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{response}</p>
          </div>

          {/* Model Answer — STAR blocks (BEH01-20 only) */}
          {question.modelAnswer && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1.25rem' }}>
                Model Answer
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {Object.entries(question.modelAnswer).map(([key, text]) => (
                  <div key={key} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{
                      fontSize: '0.7rem', fontWeight: 700,
                      color: FRAME_LABEL_COLOR[key] || 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      minWidth: '72px', flexShrink: 0, paddingTop: '0.15rem',
                    }}>
                      {FRAME_LABEL[key] || key}
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.72 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Story Framework — revealed for BEH21+ */}
          {!question.modelAnswer && question.storyFramework && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1.25rem' }}>
                Strong Story Structure
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {Object.entries(question.storyFramework).map(([key, text]) => (
                  <div key={key} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{
                      fontSize: '0.7rem', fontWeight: 700,
                      color: FRAME_LABEL_COLOR[key] || 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      minWidth: '72px', flexShrink: 0, paddingTop: '0.15rem',
                    }}>
                      {FRAME_LABEL[key] || key}
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.72 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strong markers (works for both schemas) */}
          {strongMarkers && strongMarkers.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                Strong Answer Signals
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
                {strongMarkers.map((marker, i) => <li key={i}>{marker}</li>)}
              </ul>
            </div>
          )}

          {/* Weak signals — BEH21+ only */}
          {question.weakSignals && question.weakSignals.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--yellow-border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                Weak Answer Signals
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
                {question.weakSignals.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {/* Key Principles */}
          {question.keyPrinciples && question.keyPrinciples.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                Key Principles
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
                {question.keyPrinciples.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}

          {/* What to Avoid */}
          {question.antiPatterns && question.antiPatterns.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--red-border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                What to Avoid
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
                {question.antiPatterns.map((ap, i) => <li key={i}>{ap}</li>)}
              </ul>
            </div>
          )}

          {/* Your notes */}
          {userNote && (
            <div style={{ marginTop: 16, marginBottom: 16, padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>Your notes</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{userNote}</div>
            </div>
          )}

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
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {r.label}
                    <div style={{ fontSize: '0.72rem', fontWeight: 400, opacity: 0.8, marginTop: '0.15rem' }}>{r.sub}</div>
                  </button>
                );
              })}
            </div>
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
                background: 'var(--accent)', border: 'none', borderRadius: '7px',
                padding: '0.5rem 1.2rem', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                marginLeft: 'auto',
              }}>
                Next question →
              </button>
            )}
          </div>
          <ForwardPointerCard room='behavioral' onNavigate={onNavigate} onNext={onNext} />
        </div>
      )}
    </div>
  );
}
