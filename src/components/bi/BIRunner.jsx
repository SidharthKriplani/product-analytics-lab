import { useState, useEffect } from 'react';
import { saveBIProgress, getBIProgress } from '../../utils/biProgress.js';
import { track } from '../../utils/analytics.js';
import { biCases } from '../../data/biCases.js';
import { ChartScenario } from './ChartScenario.jsx';

const ROOM_KEY = 'bi';
const NOTES_KEY = 'pal-notes-v1';
function loadNote(room, id) {
  try { const n = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); return n[room + ':' + id] || ''; } catch { return ''; }
}
function saveNote(room, id, text) {
  try { const n = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); n[room + ':' + id] = text; localStorage.setItem(NOTES_KEY, JSON.stringify(n)); } catch {}
}

const DIFF_CFG = {
  analyst: { label: 'Analyst', color: 'var(--blue-text)', bg: 'var(--blue-bg)',    border: 'var(--blue-border)' },
  senior:  { label: 'Senior',  color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  staff:   { label: 'Staff',   color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
};

const DOMAIN_LABEL = {
  'data-storytelling':   'Data Storytelling',
  'kpi-framework':       'KPI Framework',
  'attribution':         'Attribution',
  'dashboard-audit':     'Dashboard Audit',
  'data-quality':        'Data Quality',
  'executive-reporting': 'Executive Reporting',
};

const RATINGS = [
  { id: 'strong',  label: 'Strong',  sub: 'Covered the key frameworks and insights' },
  { id: 'partial', label: 'Partial', sub: 'Right direction but missed key pieces' },
  { id: 'miss',    label: 'Miss',    sub: 'Framework or diagnosis was off' },
];

const RATING_STYLE = {
  strong:  { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  partial: { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  miss:    { color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)' },
};

// Screen 1: Situation
function SituationScreen({ caseData, onBegin }) {
  const [hintsOpen, setHintsOpen] = useState(false);
  const diffCfg = DIFF_CFG[caseData.difficulty] || DIFF_CFG.analyst;

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
          color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
          borderRadius: '4px', padding: '0.1rem 0.4rem',
        }}>
          {diffCfg.label}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>·</span>
        <span style={{
          fontSize: '0.7rem', fontWeight: 500,
          color: 'var(--yellow)', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
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
          letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: '0.65rem',
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
        background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
        borderRadius: '10px', padding: '1.25rem 1.4rem', marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: '0.5rem',
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
          background: 'var(--yellow)', border: 'none', borderRadius: '8px',
          padding: '0.85rem 1.75rem', fontSize: '0.95rem', fontWeight: 700,
          color: '#1a1400', cursor: 'pointer', transition: 'opacity 0.1s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        Begin Analysis →
      </button>
    </div>
  );
}

// Screen 2: Work
function WorkScreen({ caseData, onReveal }) {
  const [text, setText] = useState('');
  const canReveal = text.trim().length >= 50;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: '0.3rem' }}>
          {caseData.id} · {caseData.title}
        </div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.25rem' }}>
          Your Analysis
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
          {caseData.question}
        </p>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Walk through your analysis..."
        style={{
          width: '100%', boxSizing: 'border-box',
          minHeight: '220px',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '0.9rem 1rem',
          color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.7,
          resize: 'vertical', fontFamily: 'inherit', outline: 'none',
          marginBottom: '0.5rem',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--yellow-border)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.78rem', color: canReveal ? 'var(--text-dim)' : 'var(--text-dim)', opacity: 0.7 }}>
          {canReveal ? 'Ready to compare with the model answer' : `${Math.max(0, 50 - text.trim().length)} more characters to unlock reveal`}
        </span>
      </div>

      <button
        onClick={() => canReveal && onReveal(text)}
        disabled={!canReveal}
        style={{
          background: canReveal ? 'var(--yellow)' : 'var(--surface-2)',
          border: canReveal ? 'none' : '1px solid var(--border)',
          borderRadius: '8px', padding: '0.85rem 1.75rem',
          fontSize: '0.95rem', fontWeight: 700,
          color: canReveal ? '#1a1400' : 'var(--text-dim)',
          cursor: canReveal ? 'pointer' : 'not-allowed',
          transition: 'opacity 0.1s',
        }}
        onMouseEnter={e => { if (canReveal) e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        Reveal Model Answer →
      </button>
    </div>
  );
}

// Screen 3: Reveal
function RevealScreen({ caseData, onBack, onNext, unlocked }) {
  const existing = getBIProgress(caseData.id);
  const [rating, setRating] = useState(existing?.rating || null);
  const [checked, setChecked] = useState([false, false, false]);
  const [userNote, setUserNote] = useState(() => loadNote(ROOM_KEY, caseData.id));
  const [noteSaved, setNoteSaved] = useState(false);

  function handleRate(r) {
    setRating(r);
    saveBIProgress(caseData.id, r);
    track('case_completed', { room: 'bi', id: caseData.id, rating: r });
  }

  function toggleCheck(i) {
    setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
  }

  const diffCfg = DIFF_CFG[caseData.difficulty] || DIFF_CFG.analyst;

  return (
    <div className="pal-reveal-in" style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.5rem', paddingBottom: rating ? '70px' : '2rem' }}>

      {/* Header */}
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
          color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
          borderRadius: '4px', padding: '0.1rem 0.4rem',
        }}>
          {diffCfg.label}
        </span>
        <span style={{
          fontSize: '0.7rem', fontWeight: 500,
          color: 'var(--yellow)', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
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
          letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: '0.45rem',
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
          letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: '0.65rem',
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

      {/* Key Insights — interactive checklist */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: '0.75rem',
        }}>
          Key Insights — check the ones you covered
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {caseData.modelAnswer.keyInsights.map((insight, i) => (
            <label
              key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                cursor: 'pointer',
                opacity: checked[i] ? 1 : 0.75,
              }}
            >
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggleCheck(i)}
                style={{
                  marginTop: '0.18rem', accentColor: 'var(--yellow)',
                  width: '15px', height: '15px', flexShrink: 0,
                  cursor: 'pointer',
                }}
              />
              <span style={{
                fontSize: '0.88rem', color: checked[i] ? 'var(--text)' : 'var(--text-muted)',
                lineHeight: 1.6,
                textDecoration: checked[i] ? 'none' : 'none',
              }}>
                {insight}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Leadership Lens */}
      <div style={{
        background: 'var(--surface)',
        borderLeft: '3px solid var(--purple, #9b59b6)',
        borderRadius: '0 10px 10px 0',
        padding: '1.1rem 1.25rem',
        marginBottom: '1rem',
        border: '1px solid var(--border)',
        borderLeftWidth: '3px',
        borderLeftColor: 'var(--purple, #9b59b6)',
      }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--purple, #9b59b6)', marginBottom: '0.45rem',
          display: 'flex', alignItems: 'center', gap: '0.35rem',
        }}>
          <span>💼</span>
          <span>Leadership Lens</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.75, margin: 0 }}>
          {caseData.leadershipNote}
        </p>
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
          {caseData.keyTakeaways.map((t, i) => (
            <li key={i} style={{ marginBottom: i < caseData.keyTakeaways.length - 1 ? '0.4rem' : 0 }}>
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Playbook link pills */}
      {caseData.playbookLinks && caseData.playbookLinks.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Playbook:</span>
          {caseData.playbookLinks.map(link => (
            <span
              key={link}
              style={{
                fontSize: '0.78rem', fontWeight: 500,
                color: 'var(--yellow)', background: 'var(--yellow-bg)',
                border: '1px solid var(--yellow-border)',
                borderRadius: '20px', padding: '0.2rem 0.7rem',
              }}
            >
              {link}
            </span>
          ))}
        </div>
      )}

      {/* Self-rate */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem',
      }}>
        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
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
                  transition: 'all 0.12s',
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

            <div style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
                ✏️ Your notes <span style={{ fontWeight: 400, opacity: 0.6 }}>(saved locally)</span>
              </div>
              <textarea
                value={userNote}
                onChange={e => { setUserNote(e.target.value); setNoteSaved(false); }}
                placeholder="Jot your thinking before revealing the answer..."
                style={{
                  width: '100%', minHeight: 72, padding: '10px 12px', background: 'var(--bg)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)',
                  fontSize: '0.88rem', lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={() => { saveNote(ROOM_KEY, caseData.id, userNote); setNoteSaved(true); }}
                style={{
                  marginTop: 8, padding: '5px 14px', background: noteSaved ? 'var(--green-bg)' : 'var(--surface)',
                  border: '1px solid ' + (noteSaved ? 'var(--green-border)' : 'var(--border)'),
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem',
                  color: noteSaved ? 'var(--green)' : 'var(--text-muted)',
                }}
              >{noteSaved ? '✓ Saved' : 'Save note'}</button>
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
          ← Back to BI Room
        </button>
        {onNext && rating && (
          <button
            onClick={onNext}
            style={{
              background: 'var(--yellow)', border: 'none', borderRadius: '7px',
              padding: '0.5rem 1.25rem', color: '#1a1400', fontSize: '0.85rem',
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

      {/* Sticky bottom bar — shown after rating is selected */}
      {rating && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          padding: '0.75rem 1.5rem',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Case complete
          </span>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={onBack}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '7px', padding: '0.45rem 1rem',
                color: 'var(--text-muted)', fontSize: '0.83rem', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            {onNext && (
              <button
                onClick={onNext}
                className="pal-glow-pulse"
                style={{
                  background: 'var(--yellow)', color: '#1a1400',
                  border: 'none', borderRadius: '7px',
                  padding: '0.45rem 1.1rem',
                  fontSize: '0.83rem', fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Main runner — manages screen state
export function BIRunner({ caseId, onBack, onNext, unlocked }) {
  const caseData = biCases.find(c => c.id === caseId);
  const isChartFormat = caseData?.format === 'chart';
  const [screen, setScreen] = useState(isChartFormat ? 'chart' : 'situation');

  function handleBegin() {
    setScreen(isChartFormat ? 'chart' : 'work');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleReveal() {
    setScreen('reveal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleChartRate(confidence) {
    saveBIProgress(caseData.id, confidence);
    track('case_completed', { room: 'bi', id: caseData.id, rating: confidence, format: 'chart' });
  }

  if (screen === 'situation') {
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
            ← BI &amp; Reporting Room
          </button>
        </div>
        <SituationScreen caseData={caseData} onBegin={handleBegin} />
      </div>
    );
  }

  if (screen === 'chart') {
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
            ← BI &amp; Reporting Room
          </button>
        </div>
        <ChartScenario caseData={caseData} onBack={onBack} onNext={onNext} onRate={handleChartRate} />
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
          ← BI &amp; Reporting Room
        </button>
      </div>
      <RevealScreen
        caseData={caseData}
        onBack={onBack}
        onNext={onNext}
        unlocked={unlocked}
      />
    </div>
  );
}
