import { useState, useEffect } from 'react';
import { saveSTFProgress, getSTFProgress, saveSTFDraft, loadSTFDraft, clearSTFDraft } from '../../utils/spotTheFlawProgress.js';
import { track } from '../../utils/analytics.js';
import { spotTheFlawCases } from '../../data/spotTheFlawCases.js';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';

const ROOM_KEY = 'spot-the-flaw';
function loadNote(id) { try { const d = JSON.parse(localStorage.getItem('pal-notes-v1') || '{}'); return d[ROOM_KEY + ':' + id] || ''; } catch { return ''; } }
function saveNote(id, text) { try { const d = JSON.parse(localStorage.getItem('pal-notes-v1') || '{}'); d[ROOM_KEY + ':' + id] = text; localStorage.setItem('pal-notes-v1', JSON.stringify(d)); } catch {} }

const DIFF_CFG = {
  analyst: { label: 'Analyst', color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
  senior:  { label: 'Senior',  color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  staff:   { label: 'Staff',   color: 'var(--red)',       bg: 'var(--red-bg)',    border: 'var(--red-border)' },
};

const RATINGS = [
  { id: 'caught it', label: 'Caught it',  sub: 'Identified the flaw and knew how to fix it' },
  { id: 'partial',   label: 'Partial',    sub: 'Right direction but missed a key detail' },
  { id: 'missed it', label: 'Missed it',  sub: 'Did not identify the core flaw' },
];

const RATING_STYLE = {
  'caught it': { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  'partial':   { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  'missed it': { color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)' },
};

// Step constants
const STEP_SETUP  = 'setup';
const STEP_WORK   = 'work';
const STEP_REVEAL = 'reveal';

export function SpotTheFlawRunner({ caseId, onBack, onNext, unlocked, onNavigate }) {
  const caseData = spotTheFlawCases.find(c => c.id === caseId);
  const existing = getSTFProgress(caseData.id);

  const [step, setStep]           = useState(existing?.rating ? STEP_REVEAL : STEP_SETUP);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [answer, setAnswer]       = useState(() => loadSTFDraft(caseData.id)?.answer || '');
  const [rating, setRating]       = useState(existing?.rating || null);
  const [userNote, setUserNote]   = useState(() => loadNote(caseData.id));
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => { setUserNote(loadNote(caseData.id)); setNoteSaved(false); }, [caseData.id]);

  useEffect(() => {
    if (step === STEP_SETUP) saveSTFDraft(caseData.id, { answer });
  }, [answer]); // eslint-disable-line

  const diffCfg = DIFF_CFG[caseData.difficulty] || DIFF_CFG.analyst;

  // Split setup into paragraphs
  const setupParagraphs = caseData.setup.split('\n\n').filter(Boolean);

  function handleRate(r) {
    clearSTFDraft(caseData.id);
    setRating(r);
    saveSTFProgress(caseData.id, r);
    track('case_completed', { room: 'spot-the-flaw', id: caseData.id, rating: r });
  }

  function handleRetry() {
    clearSTFDraft(caseData.id);
    setStep(STEP_SETUP);
    setHintsOpen(false);
    setAnswer('');
    setRating(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── SETUP SCREEN ─────────────────────────────────────────────────────────────
  if (step === STEP_SETUP) {
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Back nav */}
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.5rem',
            padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >
          ← Spot the Flaw
        </button>

        {/* Case header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)',
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              {caseData.id}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>·</span>
            <span style={{
              fontSize: '0.72rem', fontWeight: 600,
              color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
              borderRadius: '4px', padding: '0.1rem 0.4rem',
            }}>
              {diffCfg.label}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>·</span>
            <span style={{
              fontSize: '0.72rem', fontWeight: 600,
              color: 'var(--red)', background: 'var(--red-bg)', border: '1px solid var(--red-border)',
              borderRadius: '4px', padding: '0.1rem 0.4rem',
            }}>
              {caseData.flawLabel}
            </span>
            <span style={{
              fontSize: '0.72rem', fontWeight: 500,
              color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
              borderRadius: '4px', padding: '0.1rem 0.4rem',
            }}>
              {caseData.company}
            </span>
          </div>

          <h1 style={{
            fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)',
            margin: '0 0 0.3rem', letterSpacing: '-0.02em',
          }}>
            {caseData.title}
          </h1>
        </div>

        {/* Flawed Analysis block — styled as a team report */}
        <div style={{
          borderLeft: '3px solid var(--red)',
          background: 'var(--surface-2)',
          borderRadius: '0 10px 10px 0',
          padding: '1.25rem 1.5rem',
          marginBottom: '1rem',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '0.9rem',
          }}>
            <span style={{ fontSize: '0.95rem' }}>⚠️</span>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--red)',
            }}>
              Flawed Analysis — Can You Spot It?
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {setupParagraphs.map((para, i) => (
              <p key={i} style={{
                color: 'var(--text-secondary)', fontSize: '0.9rem',
                lineHeight: 1.75, margin: 0,
                fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
                whiteSpace: 'pre-wrap',
              }}>
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Hints accordion */}
        <button
          onClick={() => setHintsOpen(o => !o)}
          style={{
            width: '100%', textAlign: 'left', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: '8px',
            padding: '0.75rem 1rem', cursor: 'pointer', marginBottom: '0.6rem',
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
            borderRadius: '8px', padding: '1rem 1.1rem', marginBottom: '0.6rem',
          }}>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
              {caseData.hints.map((h, i) => (
                <li key={i} style={{ marginBottom: i < caseData.hints.length - 1 ? '0.3rem' : 0 }}>{h}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Question callout */}
        <div style={{
          background: 'var(--red-bg)', border: '1px solid var(--red-border)',
          borderRadius: '10px', padding: '1.1rem 1.25rem', marginBottom: '1.5rem',
          marginTop: '0.6rem',
        }}>
          <p style={{
            color: 'var(--text)', fontSize: '0.95rem', lineHeight: 1.65,
            margin: 0, fontWeight: 500,
          }}>
            {caseData.question}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => { setStep(STEP_WORK); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{
            width: '100%',
            background: 'var(--red)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.85rem 1.5rem',
            fontSize: '0.95rem', fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            transition: 'opacity 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          Analyze This →
        </button>
      </div>
    );
  }

  // ── WORK SCREEN ──────────────────────────────────────────────────────────────
  if (step === STEP_WORK) {
    const canReveal = answer.trim().length >= 30;
    return (
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        <button
          onClick={() => setStep(STEP_SETUP)}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.5rem',
            padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >
          ← Back to Report
        </button>

        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.25rem' }}>
            {caseData.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            {caseData.id} · {caseData.company}
          </p>
        </div>

        {/* The question */}
        <div style={{
          background: 'var(--red-bg)', border: '1px solid var(--red-border)',
          borderRadius: '10px', padding: '1.1rem 1.25rem', marginBottom: '1.25rem',
        }}>
          <p style={{
            color: 'var(--text)', fontSize: '0.95rem', lineHeight: 1.65,
            margin: 0, fontWeight: 500,
          }}>
            {caseData.question}
          </p>
        </div>

        {/* Answer textarea */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block', fontSize: '0.82rem', fontWeight: 600,
            color: 'var(--text-muted)', marginBottom: '0.5rem',
          }}>
            What is wrong here? What decision does it lead to, and how do you fix it?
          </label>
          <textarea
            rows={6}
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Write your analysis here..."
            style={{
              width: '100%', boxSizing: 'border-box', minHeight: '80px',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.75rem 0.9rem',
              color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.65,
              resize: 'vertical', fontFamily: 'inherit',
              outline: 'none', transition: 'border-color 0.12s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--red-border)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
            {answer.trim().length < 30
              ? `${30 - answer.trim().length} more characters to unlock reveal`
              : 'Ready to reveal the flaw'}
          </div>
        </div>

        <button
          onClick={() => {
            if (canReveal) {
              setStep(STEP_REVEAL);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          disabled={!canReveal}
          style={{
            width: '100%',
            background: canReveal ? 'var(--red)' : 'var(--surface-2)',
            border: canReveal ? 'none' : '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.85rem 1.5rem',
            fontSize: '0.95rem', fontWeight: 700,
            color: canReveal ? '#fff' : 'var(--text-dim)',
            cursor: canReveal ? 'pointer' : 'not-allowed',
            transition: 'opacity 0.1s, background 0.12s',
          }}
          onMouseEnter={e => { if (canReveal) e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          Reveal the Flaw →
        </button>
      </div>
    );
  }

  // ── REVEAL SCREEN ────────────────────────────────────────────────────────────
  return (
    <div className="pal-reveal-in" style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.5rem',
          padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}
      >
        ← Spot the Flaw
      </button>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)',
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            {caseData.id}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>·</span>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600,
            color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
            borderRadius: '4px', padding: '0.1rem 0.4rem',
          }}>
            {diffCfg.label}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>·</span>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600,
            color: 'var(--red)', background: 'var(--red-bg)', border: '1px solid var(--red-border)',
            borderRadius: '4px', padding: '0.1rem 0.4rem',
          }}>
            {caseData.flawLabel}
          </span>
          <span style={{
            fontSize: '0.72rem', fontWeight: 500,
            color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
            borderRadius: '4px', padding: '0.1rem 0.4rem',
          }}>
            {caseData.company}
          </span>
        </div>

        <h1 style={{
          fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)',
          margin: '0 0 0.3rem', letterSpacing: '-0.02em',
        }}>
          {caseData.title}
        </h1>
      </div>

      {/* The Flaw */}
      <div style={{
        borderLeft: '3px solid var(--red)',
        background: 'var(--red-bg)',
        borderRadius: '0 10px 10px 0',
        padding: '1.1rem 1.4rem',
        marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--red)', marginBottom: '0.5rem',
        }}>
          🐛 The Flaw
        </div>
        <p style={{ color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
          {caseData.flaw}
        </p>
      </div>

      {/* If Uncorrected */}
      <div style={{
        borderLeft: '3px solid var(--yellow)',
        background: 'var(--yellow-bg)',
        borderRadius: '0 10px 10px 0',
        padding: '1.1rem 1.4rem',
        marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: '0.5rem',
        }}>
          💥 If Uncorrected
        </div>
        <p style={{ color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
          {caseData.impact}
        </p>
      </div>

      {/* The Fix */}
      <div style={{
        borderLeft: '3px solid var(--green)',
        background: 'var(--green-bg)',
        borderRadius: '0 10px 10px 0',
        padding: '1.1rem 1.4rem',
        marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--green)', marginBottom: '0.5rem',
        }}>
          ✅ The Fix
        </div>
        <p style={{ color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
          {caseData.fix}
        </p>
      </div>

      {/* Key Takeaways */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '1.1rem 1.25rem', marginBottom: '1.25rem',
      }}>
        <div style={{
          fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-dim)',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem',
        }}>
          Key Takeaways
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.8 }}>
          {caseData.keyTakeaways.map((t, i) => (
            <li key={i} style={{ marginBottom: i < caseData.keyTakeaways.length - 1 ? '0.4rem' : 0 }}>{t}</li>
          ))}
        </ul>
      </div>

      {/* Personal notes */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '1.1rem 1.25rem', marginBottom: '1.25rem',
      }}>
        <div style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
          Your notes
        </div>
        <textarea
          value={userNote}
          onChange={e => { setUserNote(e.target.value); setNoteSaved(false); }}
          placeholder="What tripped you up? What's the key heuristic to remember?"
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box', resize: 'vertical',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '7px', padding: '0.6rem 0.75rem',
            color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.6,
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => { saveNote(caseData.id, userNote); setNoteSaved(true); }}
          style={{
            marginTop: '0.5rem', background: 'none',
            border: '1px solid var(--border)', borderRadius: '6px',
            padding: '0.3rem 0.8rem', color: noteSaved ? 'var(--green)' : 'var(--text-muted)',
            fontSize: '0.78rem', cursor: 'pointer',
          }}
        >
          {noteSaved ? '✓ Saved' : 'Save note'}
        </button>
      </div>

      {/* Self-rating */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem',
      }}>
        <div style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
          Did you catch it?
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
          ↺ Try again
        </button>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: '7px',
            padding: '0.5rem 1.1rem', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer',
          }}
        >
          ← Back to Spot the Flaw
        </button>
        {onNext && rating && (
          <button
            onClick={onNext}
            className="pal-glow-pulse"
            style={{
              background: 'var(--red)', border: 'none', borderRadius: '7px',
              padding: '0.5rem 1.2rem', color: '#fff', fontSize: '0.85rem',
              fontWeight: 600, cursor: 'pointer', marginLeft: 'auto',
            }}
          >
            Next Case →
          </button>
        )}
      </div>
      <ForwardPointerCard room='spot-the-flaw' onNavigate={onNavigate} onNext={onNext} />
    </div>
  );
}
