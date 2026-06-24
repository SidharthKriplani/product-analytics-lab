import { useState, useEffect } from 'react';
import { codeModules } from '../../data/codeModules.js';
import { saveCodeAttempt } from '../../utils/codeProgress.js';
import { track } from '../../utils/analytics.js';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { ShareLinkButton } from '../shared/ShareLinkButton.jsx';
import { Icon } from '../shared/Icon.jsx';

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

const RATING_OPTIONS = [
  { id: 'strong',  label: 'Nailed it',         color: 'var(--teal)',       bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  { id: 'partial', label: 'Got the idea',       color: 'var(--yellow)',     bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  { id: 'miss',    label: 'Needs more practice', color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border)' },
];

const TRACK_COLOR = {
  sql:    'var(--teal)',
  python: 'var(--purple)',
};

export function CodeRunner({ caseId, savedProgress, onBack, onNext, onNavigate }) {
  const module = codeModules.find(m => m.id === caseId);
  const [view, setView]           = useState(savedProgress ? 'reveal' : 'writing');
  const [response, setResponse]   = useState(savedProgress?.response || '');
  const [revealed, setRevealed]   = useState(!!savedProgress);
  const [rating, setRating]       = useState(savedProgress?.rating || null);
  const [showHints, setShowHints] = useState(false);
  const [note, setNote] = useState(() => getNotes('code', module.id));
  useEffect(() => { setNote(getNotes('code', module.id)); }, [module.id]);

  const canReveal  = response.trim().length >= 30;
  const trackColor = TRACK_COLOR[module.track] || 'var(--teal)';

  function handleReveal() {
    setRevealed(true);
    setView('reveal');
  }

  function handleRate(r) {
    setRating(r);
    saveCodeAttempt(module.id, response, r);
    track('case_completed', { room: 'code', id: module.id, rating: r });
  }

  function handleRetry() {
    setView('writing');
    setResponse('');
    setRevealed(false);
    setRating(null);
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* Back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600,
            padding: '0', display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--yellow)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ← Code Room
        </button>
        <ShareLinkButton room="code" />
      </div>

      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: trackColor, marginBottom: '0.3rem' }}>
          {module.subtitle}
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
          {module.title}
        </h2>
      </div>

      {/* Scenario panel */}
      <div style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius)',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
          Scenario — {module.scenario.company}
        </div>
        <p style={{ margin: '0 0 1rem', fontSize: '0.87rem', color: 'var(--text)', lineHeight: 1.65 }}>
          {module.scenario.context}
        </p>

        {/* Schema */}
        {module.scenario.schema && module.scenario.schema.filter(s => s.table !== '—').length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Schema
            </div>
            {module.scenario.schema.map((s, i) => (
              <div key={i} style={{
                fontFamily: '"SF Mono", "Fira Code", monospace',
                fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                marginBottom: '0.15rem',
              }}>
                {s.table !== '—' && (
                  <><span style={{ color: trackColor, fontWeight: 700 }}>{s.table}</span>
                  {s.columns.length > 0 && ` (${s.columns.join(', ')})`}
                  {s.description && ` — ${s.description}`}</>
                )}
                {s.table === '—' && (
                  <span style={{ color: 'var(--text-muted)' }}>{s.description}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Task */}
        <div style={{
          background: 'var(--yellow-bg)',
          border: '1px solid var(--yellow-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.6rem 0.85rem',
          fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.5,
        }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--yellow)', marginRight: '0.5rem' }}>Task</span>
          {module.scenario.task}
        </div>
      </div>

      {/* Hints toggle */}
      {module.hints && module.hints.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setShowHints(h => !h)}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.8rem', fontSize: '0.78rem', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {showHints ? '▲ Hide hints' : '▼ Show hints'}
          </button>
          {showHints && (
            <ul style={{ margin: '0.6rem 0 0', paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {module.hints.map((h, i) => (
                <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{h}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Writing area */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            Starter code — complete the blanks
          </div>
          {!revealed && (
            <div style={{ fontSize: '0.7rem', color: response.trim().length >= 30 ? 'var(--teal)' : 'var(--text-muted)' }}>
              {response.trim().length < 30 ? `${30 - response.trim().length} chars to unlock reveal` : <><Icon name='check' size={12} color='currentColor' /> Ready</>}
            </div>
          )}
        </div>
        <textarea
          value={response}
          onChange={e => setResponse(e.target.value)}
          disabled={revealed}
          placeholder="Complete the partial code above..."
          style={{
            width: '100%',
            minHeight: '260px',
            padding: '0.85rem',
            background: revealed ? 'var(--surface-2)' : 'var(--bg)',
            border: `1.5px solid ${revealed ? 'var(--border-subtle)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text)',
            fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
            fontSize: '0.78rem',
            lineHeight: 1.65,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            opacity: revealed ? 0.65 : 1,
          }}
        />
      </div>

      {/* Partial code reference (collapsible) */}
      {module.partialCode && (
        <PartialCodePanel code={module.partialCode} trackColor={trackColor} />
      )}

      {/* Reveal button + Python hint */}
      {!revealed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleReveal}
            disabled={!canReveal}
            style={{
              background: canReveal ? 'var(--yellow-bg)' : 'var(--surface-2)',
              border: `1.5px solid ${canReveal ? 'var(--yellow-border)' : 'var(--border)'}`,
              color: canReveal ? 'var(--yellow)' : 'var(--text-muted)',
              borderRadius: 'var(--radius)',
              padding: '0.65rem 1.4rem',
              fontSize: '0.85rem', fontWeight: 700,
              cursor: canReveal ? 'pointer' : 'not-allowed',
            }}
          >
            Reveal model answer
          </button>
          {module.track === 'python' && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              ▶ Run Code appears after reveal
            </span>
          )}
        </div>
      )}

      {/* Model answer */}
      {revealed && (
        <ModelAnswerPanel
          module={module}
          trackColor={trackColor}
          rating={rating}
          onRate={handleRate}
          onRetry={handleRetry}
          onNext={onNext}
          note={note}
          onNoteChange={text => { setNote(text); saveNote('code', module.id, text); }}
        />
      )}
      {revealed && (
        <ForwardPointerCard room='code' onNavigate={onNavigate} onNext={onNext} />
      )}
    </div>
  );
}

// ─── Partial Code Panel ───────────────────────────────────────────────────────
function PartialCodePanel({ code, trackColor }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'transparent', border: '1px solid var(--border)',
          color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)',
          padding: '0.35rem 0.8rem', fontSize: '0.78rem', fontWeight: 600,
          cursor: 'pointer', marginBottom: '0.5rem',
        }}
      >
        {open ? '▲ Hide starter code' : '▼ Show starter code'}
      </button>
      {open && (
        <pre style={{
          margin: 0,
          padding: '0.85rem 1rem',
          background: 'var(--surface-2)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
          fontSize: '0.75rem',
          lineHeight: 1.65,
          color: 'var(--text-secondary)',
          overflowX: 'auto',
          whiteSpace: 'pre',
        }}>
          {code}
        </pre>
      )}
    </div>
  );
}

// ─── Model Answer Panel ───────────────────────────────────────────────────────
function ModelAnswerPanel({ module, trackColor, rating, onRate, onRetry, onNext, note, onNoteChange }) {
  const [pyOutput, setPyOutput]     = useState('');
  const [pyError, setPyError]       = useState('');
  const [pyLoading, setPyLoading]   = useState('idle');
  const [pyodideRef, setPyodideRef] = useState(null);

  async function loadPyodideInstance() {
    if (pyodideRef) return pyodideRef;
    setPyLoading('loading-pyodide');
    if (!window.loadPyodide) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    const py = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
    });
    await py.loadPackagesFromImports('import numpy as np\nimport pandas as pd');
    setPyodideRef(py);
    return py;
  }

  async function handleRunCode() {
    setPyOutput('');
    setPyError('');
    const codeToRun = module.solution || module.modelAnswer || '';
    if (!codeToRun) {
      setPyError('No executable code found in this module.');
      return;
    }
    try {
      const py = await loadPyodideInstance();
      setPyLoading('running');
      py.runPython(`import sys\nimport io\n_stdout_capture = io.StringIO()\nsys.stdout = _stdout_capture\n`);
      try {
        py.runPython(codeToRun);
      } catch (err) {
        setPyError(String(err));
        setPyLoading('done');
        return;
      }
      const output = py.runPython('_stdout_capture.getvalue()');
      py.runPython('sys.stdout = sys.__stdout__');
      setPyOutput(output || '(no output)');
      setPyLoading('done');
    } catch (err) {
      setPyError(String(err));
      setPyLoading('done');
    }
  }

  return (
    <div className="pal-reveal-in" style={{
      background: 'var(--surface-2)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1.25rem',
      display: 'flex', flexDirection: 'column', gap: '1.25rem',
      marginBottom: '1.5rem',
    }}>
      {/* Model answer header */}
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: trackColor }}>
        Model Answer
      </div>

      {/* Code block */}
      <pre style={{
        margin: 0,
        padding: '1rem',
        background: 'var(--bg)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
        fontSize: '0.75rem',
        lineHeight: 1.65,
        color: 'var(--text)',
        overflowX: 'auto',
        whiteSpace: 'pre',
      }}>
        {module.modelAnswer}
      </pre>

      {/* Run Code (Python only) */}
      {module.track === 'python' && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <button
              onClick={handleRunCode}
              disabled={pyLoading === 'loading-pyodide' || pyLoading === 'running'}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--purple)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: pyLoading === 'loading-pyodide' || pyLoading === 'running' ? 'not-allowed' : 'pointer',
                opacity: pyLoading === 'loading-pyodide' || pyLoading === 'running' ? 0.7 : 1,
              }}
            >
              {pyLoading === 'loading-pyodide' ? <><Icon name='hourglass' size={14} color='currentColor' /> Loading Python…</>
               : pyLoading === 'running' ? <><Icon name='hourglass' size={14} color='currentColor' /> Running…</>
               : '▶ Run Code'}
            </button>
            {pyLoading === 'loading-pyodide' && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                First run loads Python runtime (~10s)
              </span>
            )}
          </div>

          {(pyOutput || pyError) && (
            <div style={{
              background: '#0d1117',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              padding: '0.875rem 1rem',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              maxHeight: '300px',
              overflowY: 'auto',
            }}>
              {pyError ? (
                <span style={{ color: '#ff6b6b' }}>{pyError}</span>
              ) : (
                <span style={{ color: '#e6edf3', whiteSpace: 'pre-wrap' }}>{pyOutput}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Key insights */}
      {module.keyInsights && module.keyInsights.length > 0 && (
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Key Insights
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {module.keyInsights.map((insight, i) => (
              <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          My Notes
        </div>
        <textarea
          value={note || ''}
          onChange={e => onNoteChange && onNoteChange(e.target.value)}
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
      <div>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
          How did you do?
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {RATING_OPTIONS.map(r => (
            <button
              key={r.id}
              onClick={() => onRate(r.id)}
              style={{
                background: rating === r.id ? r.bg : 'transparent',
                border: `1.5px solid ${rating === r.id ? r.border : 'var(--border)'}`,
                color: rating === r.id ? r.color : 'var(--text-muted)',
                borderRadius: 'var(--radius)',
                padding: '0.45rem 1rem',
                fontSize: '0.8rem', fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Retry + Next */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={onRetry}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius)',
            padding: '0.4rem 0.9rem',
            fontSize: '0.78rem', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try again from scratch
        </button>
        {onNext && (
          <button
            onClick={onNext}
            className="pal-glow-pulse"
            style={{
              background: trackColor, color: '#fff', border: 'none',
              borderRadius: 'var(--radius)', padding: '0.45rem 1.1rem',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            Next module →
          </button>
        )}
      </div>
    </div>
  );
}
