import { useState, useEffect } from 'react';
import { saveTakehomeProgress, saveTakehomeDraft, loadTakehomeDraft, clearTakehomeDraft } from '../../utils/takehomeProgress.js';
import { track } from '../../utils/analytics.js';
import { takehomeCases } from '../../data/takehomeCases.js';
import { DebriefCopyButton } from '../shared/DebriefCopyButton.jsx';
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

const WEIGHT_COLOR = {
  high:   { color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)',    label: 'High' },
  medium: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)', label: 'Medium' },
  low:    { color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)',  label: 'Low' },
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function countWords(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function TakehomeRunner({ caseId, onBack, onNext, onNavigate, unlocked }) {
  const caseData = takehomeCases.find(c => c.id === caseId);
  const _thdraft = loadTakehomeDraft(caseData.id);
  const [phase, setPhase] = useState(_thdraft?.phase || 'brief');
  const [timeLeft, setTimeLeft] = useState(caseData.durationMin * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [writeup, setWriteup] = useState(_thdraft?.writeup || '');
  const [checkedRubric, setCheckedRubric] = useState(_thdraft?.checkedRubric || {});
  const [outlineExpanded, setOutlineExpanded] = useState(false);
  const [rating, setRating] = useState(null);
  const [saved, setSaved] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [note, setNote] = useState(() => getNotes('take-home', caseData.id));
  useEffect(() => { setNote(getNotes('take-home', caseData.id)); }, [caseData.id]);

  useEffect(() => {
    if (!rating) saveTakehomeDraft(caseData.id, { phase, writeup, checkedRubric });
  }, [phase, writeup, checkedRubric]); // eslint-disable-line

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const isLocked = !caseData.isFree && !unlocked;
  const wordCount = countWords(writeup);
  const isTimerRed = timeLeft < 300;

  function handleStart() {
    const now = new Date().toISOString();
    setStartTime(now);
    setTimerActive(true);
    setPhase('active');
  }

  function handleDone() {
    const elapsed = caseData.durationMin * 60 - timeLeft;
    setElapsedSeconds(elapsed);
    setTimerActive(false);
    setPhase('rubric');
  }

  function toggleRubric(id) {
    setCheckedRubric(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function handleRate(r) {
    clearTakehomeDraft(caseData.id);
    setRating(r);
    const completedAt = new Date().toISOString();
    saveTakehomeProgress(caseData.id, {
      startedAt: startTime,
      completedAt,
      wordCount,
      rating: r,
    });
    track('case_completed', { room: 'take-home', id: caseData.id, rating: r });
    setSaved(true);
  }

  const highRubric   = caseData.rubric.filter(r => r.weight === 'high');
  const medRubric    = caseData.rubric.filter(r => r.weight === 'medium');
  const lowRubric    = caseData.rubric.filter(r => r.weight === 'low');
  const totalPoints  = caseData.rubric.length;
  const checkedCount = Object.values(checkedRubric).filter(Boolean).length;

  const elapsedMin = Math.floor(elapsedSeconds / 60);
  const elapsedSec = elapsedSeconds % 60;
  const elapsedLabel = elapsedMin + ' min ' + (elapsedSec > 0 ? elapsedSec + ' sec' : '');

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.85rem',
            padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >
          ← Back to Take-Home Challenges
        </button>
        <ShareLinkButton room="take-home" />
      </div>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dim)',
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            {caseData.id}
          </span>
          <span style={{
            fontSize: '0.7rem', fontWeight: 500,
            color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)',
            borderRadius: '4px', padding: '0.1rem 0.4rem',
          }}>
            {caseData.durationMin} min
          </span>
          <span style={{
            fontSize: '0.7rem', fontWeight: 500,
            color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
            borderRadius: '4px', padding: '0.1rem 0.4rem',
          }}>
            {caseData.company}
          </span>
          {caseData.isFree && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 600,
              color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)',
              borderRadius: '4px', padding: '0.1rem 0.4rem',
            }}>
              Free
            </span>
          )}
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>
          {caseData.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          {caseData.subtitle}
        </p>
      </div>

      {/* ===================== BRIEF PHASE ===================== */}
      {phase === 'brief' && (
        <div>
          {/* Duration callout */}
          <div style={{
            background: 'var(--green-bg)', border: '1px solid var(--green-border)',
            borderRadius: '8px', padding: '0.9rem 1.1rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1.4rem' }}>⏱</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '1rem' }}>
                {caseData.durationMin}-Minute Take-Home
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                Once you start the timer, it counts down until you reveal the rubric. Work at interview pace.
              </div>
            </div>
          </div>

          {/* Warning */}
          <div style={{
            background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
            borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
            fontSize: '0.85rem', color: 'var(--text-muted)',
          }}>
            ⚠️ Once started, the timer runs until you reveal the rubric. You can submit your write-up at any time.
          </div>

          {/* Prompt */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              The Prompt
            </div>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '1.1rem 1.25rem',
              fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}>
              {caseData.prompt}
            </div>
          </div>

          {/* Data Context */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Data Available
            </div>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '1rem 1.25rem',
              fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6,
            }}>
              {caseData.dataContext}
            </div>
          </div>

          {/* Deliverable */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Your Deliverable
            </div>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '1rem 1.25rem',
              fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6,
            }}>
              {caseData.deliverable}
            </div>
          </div>

          {isLocked ? (
            <div style={{
              textAlign: 'center', padding: '1.5rem',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: '10px', color: 'var(--text-muted)', fontSize: '0.9rem',
            }}>
              🔒 Unlock PAL to attempt this take-home challenge
            </div>
          ) : (
            <button
              onClick={handleStart}
              style={{
                background: 'var(--green)', color: 'white',
                border: 'none', borderRadius: '8px',
                padding: '0.8rem 2rem', fontSize: '0.95rem', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              Start Timer →
            </button>
          )}
        </div>
      )}

      {/* ===================== ACTIVE PHASE ===================== */}
      {phase === 'active' && (
        <div>
          {/* Timer bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: isTimerRed ? 'var(--red-bg)' : 'var(--surface)',
            border: '1px solid ' + (isTimerRed ? 'var(--red-border)' : 'var(--border)'),
            borderRadius: '8px', padding: '0.7rem 1rem',
            marginBottom: '1.25rem', transition: 'all 0.3s',
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Time remaining
            </span>
            <span style={{
              fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: 700,
              color: isTimerRed ? 'var(--red)' : 'var(--green)',
              letterSpacing: '0.05em',
            }}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Write-up area */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
              Your Analysis
            </div>
            <textarea
              value={writeup}
              onChange={e => setWriteup(e.target.value)}
              placeholder={'Write your analysis here. Cover your key hypotheses, segmentation approach, and proposed experiment...'}
              style={{
                width: '100%', minHeight: '300px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '1rem',
                fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.7,
                fontFamily: 'inherit', resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Word count */}
          <div style={{
            fontSize: '0.8rem', color: wordCount > 50 ? 'var(--green)' : 'var(--text-dim)',
            marginBottom: '1.5rem',
          }}>
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </div>

          {/* Done button */}
          <button
            onClick={handleDone}
            style={{
              background: 'var(--green)', color: 'white',
              border: 'none', borderRadius: '8px',
              padding: '0.8rem 2rem', fontSize: '0.95rem', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            I'm done — Show Rubric →
          </button>
        </div>
      )}

      {/* ===================== RUBRIC PHASE ===================== */}
      {phase === 'rubric' && (
        <div className="pal-reveal-in">
          {/* Elapsed time */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '0.7rem 1rem',
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1rem' }}>⏱</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              You completed this in{' '}
              <strong style={{ color: 'var(--text)' }}>{elapsedLabel}</strong>
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
              {wordCount} words written
            </span>
          </div>

          {/* Rubric checklist */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                Self-Grade Rubric
              </div>
              <div style={{
                fontWeight: 700, fontSize: '0.85rem',
                color: checkedCount === totalPoints ? 'var(--green)' : 'var(--text-muted)',
              }}>
                {checkedCount} / {totalPoints} points
              </div>
            </div>

            {[
              { weight: 'high', items: highRubric },
              { weight: 'medium', items: medRubric },
              { weight: 'low', items: lowRubric },
            ].map(({ weight, items }) => items.length > 0 && (
              <div key={weight} style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  color: WEIGHT_COLOR[weight].color,
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                  marginBottom: '0.4rem',
                }}>
                  {WEIGHT_COLOR[weight].label} Weight
                </div>
                {items.map(item => (
                  <label
                    key={item.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                      padding: '0.65rem 0.85rem', marginBottom: '0.4rem',
                      background: checkedRubric[item.id] ? 'var(--green-bg)' : 'var(--surface)',
                      border: '1px solid ' + (checkedRubric[item.id] ? 'var(--green-border)' : 'var(--border)'),
                      borderRadius: '7px', cursor: 'pointer', transition: 'all 0.12s',
                    }}
                  >
                    <input
                      type='checkbox'
                      checked={!!checkedRubric[item.id]}
                      onChange={() => toggleRubric(item.id)}
                      style={{ marginTop: '2px', flexShrink: 0, accentColor: 'var(--green)' }}
                    />
                    <span style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.5 }}>
                      {item.point}
                    </span>
                    <span style={{
                      marginLeft: 'auto', flexShrink: 0,
                      fontSize: '0.7rem', fontWeight: 600,
                      color: WEIGHT_COLOR[weight].color,
                      background: WEIGHT_COLOR[weight].bg,
                      border: '1px solid ' + WEIGHT_COLOR[weight].border,
                      borderRadius: '4px', padding: '0.1rem 0.4rem',
                    }}>
                      {WEIGHT_COLOR[weight].label}
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>

          {/* Sample outline (collapsed) */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '8px', marginBottom: '1.5rem', overflow: 'hidden',
          }}>
            <button
              onClick={() => setOutlineExpanded(v => !v)}
              style={{
                width: '100%', background: 'none', border: 'none',
                padding: '0.85rem 1.1rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)',
              }}
            >
              <span>Strong Answer Structure</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {outlineExpanded ? 'Hide ↑' : 'See strong answer structure ↓'}
              </span>
            </button>
            {outlineExpanded && (
              <div style={{ padding: '0 1.1rem 1rem', borderTop: '1px solid var(--border)' }}>
                <ol style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem' }}>
                  {caseData.sampleOutline.map((point, i) => (
                    <li key={i} style={{
                      fontSize: '0.88rem', color: 'var(--text-muted)',
                      lineHeight: 1.6, marginBottom: '0.5rem',
                    }}>
                      {point}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Model Answer */}
          {caseData.modelAnswer && (
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Model Answer
                </div>
                <DebriefCopyButton
                  title={caseData.title}
                  notes={note}
                  modelAnswer={caseData.modelAnswer}
                  tags={caseData.tags}
                  difficulty={caseData.difficulty}
                  room={'Take-Home'}
                />
              </div>
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderLeft: '3px solid var(--yellow)',
                borderRadius: '8px', padding: '1.1rem 1.25rem',
                fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.75,
                whiteSpace: 'pre-wrap',
              }}>
                {caseData.modelAnswer}
              </div>
            </div>
          )}

          {/* Key Takeaways */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Key Takeaways
            </div>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '1rem 1.25rem',
            }}>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {caseData.keyTakeaways.map((t, i) => (
                  <li key={i} style={{
                    fontSize: '0.88rem', color: 'var(--text-muted)',
                    lineHeight: 1.6, marginBottom: '0.45rem',
                  }}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              My Notes
            </div>
            <textarea
              value={note}
              onChange={e => { setNote(e.target.value); saveNote('take-home', caseData.id, e.target.value); }}
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

          {/* Self-rating */}
          {!saved ? (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '1.1rem 1.25rem',
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
                How did you do overall?
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'strong',       label: 'Strong',       color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)' },
                  { id: 'partial',      label: 'Partial',      color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
                  { id: 'needs-work',   label: 'Needs Work',   color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleRate(opt.id)}
                    style={{
                      background: opt.bg, border: '1px solid ' + opt.border,
                      borderRadius: '7px', padding: '0.55rem 1.2rem',
                      fontSize: '0.88rem', fontWeight: 600, color: opt.color,
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--green-bg)', border: '1px solid var(--green-border)',
              borderRadius: '8px', padding: '1rem 1.25rem',
              fontSize: '0.9rem', color: 'var(--green)', fontWeight: 600,
            }}>
              ✓ Progress saved
            </div>
          )}

          {/* Next case */}
          {onNext && (
            <button
              onClick={onNext}
              className="pal-glow-pulse"
              style={{
                marginTop: '1rem', background: 'var(--surface)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: '8px',
                padding: '0.7rem 1.5rem', fontSize: '0.88rem', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Next Challenge →
            </button>
          )}
          <ForwardPointerCard room='take-home' onNavigate={onNavigate} onNext={onNext} />
        </div>
      )}
    </div>
  );
}
