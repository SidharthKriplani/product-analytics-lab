import { useState, useEffect, useCallback } from 'react';
import { fullLoopCasesById } from '../../data/fullLoopCases.js';
import { saveFullLoopProgress, getFullLoopProgress, clearFullLoopProgress } from '../../utils/fullLoopProgress.js';
import { ForwardPointerCard } from '../shared/ForwardPointerCard.jsx';
import { track } from '../../utils/analytics.js';

// ─── Phase icons ────────────────────────────────────────────────────────────
const PHASE_ICONS = {
  alert: '⚠️',
  data: '📊',
  rca: '🔍',
  sql: '💻',
  communicate: '✍️',
  experiment: '🧪',
  readout: '📋',
};

// ─── Draft persistence ──────────────────────────────────────────────────────
const DRAFT_KEY = 'pal-fullloop-draft-v1';

function saveDraft(caseId, draft) {
  try {
    var store = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
    store[caseId] = draft;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(store));
  } catch (e) { /* silent */ }
}

function loadDraft(caseId) {
  try {
    var store = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
    return store[caseId] || null;
  } catch (e) { return null; }
}

function clearDraft(caseId) {
  try {
    var store = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
    delete store[caseId];
    localStorage.setItem(DRAFT_KEY, JSON.stringify(store));
  } catch (e) { /* silent */ }
}

// ─── Phase Bar ──────────────────────────────────────────────────────────────
function PhaseBar({ phases, currentIndex, completedPhases, onSelect }) {
  return (
    <div className='pal-card-enter' style={{
      display: 'flex', alignItems: 'center', gap: '2px',
      overflowX: 'auto', padding: '12px 0', marginBottom: '24px',
    }}>
      {phases.map(function(phase, i) {
        var isCompleted = completedPhases[i];
        var isCurrent = i === currentIndex;
        var isClickable = isCompleted && !isCurrent;

        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: '1 1 0' }}>
            <button
              onClick={isClickable ? function() { onSelect(i); } : undefined}
              disabled={!isClickable && !isCurrent}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '4px', padding: '8px 4px', borderRadius: '8px',
                border: isCurrent ? '2px solid var(--accent)' : '2px solid transparent',
                background: isCurrent ? 'var(--surface)' : 'transparent',
                cursor: isClickable ? 'pointer' : 'default',
                opacity: (!isCompleted && !isCurrent) ? 0.4 : 1,
                transition: 'all 0.2s ease', width: '100%',
                minWidth: '60px',
              }}
            >
              <span style={{ fontSize: '18px' }}>
                {isCompleted ? '✅' : PHASE_ICONS[phase.type] || '○'}
              </span>
              <span style={{
                fontSize: '11px', fontWeight: isCurrent ? 600 : 400,
                color: isCurrent ? 'var(--accent)' : 'var(--text-muted)',
                textAlign: 'center', lineHeight: '1.2',
              }}>
                {phase.title}
              </span>
            </button>
            {i < phases.length - 1 && (
              <div style={{
                flex: '0 0 auto', width: '16px', height: '2px',
                background: isCompleted ? 'var(--accent)' : 'var(--border)',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Data Table renderer ────────────────────────────────────────────────────
function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        fontSize: '14px', background: 'var(--surface)',
        borderRadius: '8px', overflow: 'hidden',
      }}>
        <thead>
          <tr>
            {headers.map(function(h, i) {
              return (
                <th key={i} style={{
                  padding: '10px 12px', textAlign: 'left',
                  background: 'var(--accent)', color: '#fff',
                  fontWeight: 600, fontSize: '13px',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map(function(row, ri) {
            return (
              <tr key={ri} style={{
                background: ri % 2 === 0 ? 'var(--surface)' : 'rgba(0,0,0,0.02)',
              }}>
                {row.map(function(cell, ci) {
                  return (
                    <td key={ci} style={{
                      padding: '8px 12px', borderBottom: '1px solid var(--border)',
                      whiteSpace: 'nowrap',
                    }}>{cell}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Schema display for SQL phase ───────────────────────────────────────────
function SchemaDisplay({ schema }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '8px', padding: '12px 16px', marginBottom: '16px',
      fontSize: '13px',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
        Schema
      </div>
      {schema.tables.map(function(t, i) {
        return (
          <div key={i} style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--accent)' }}>
              {t.name}
            </span>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', marginLeft: '8px' }}>
              ({t.columns.join(', ')})
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Option Buttons (for alert, rca, readout) ───────────────────────────────
function OptionButtons({ options, selected, onSelect, disabled }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
      {options.map(function(opt) {
        var isSelected = selected === opt.id;
        var isCorrect = isSelected && opt.correct;
        var isWrong = isSelected && !opt.correct;

        return (
          <button
            key={opt.id}
            onClick={disabled ? undefined : function() { onSelect(opt.id); }}
            disabled={disabled}
            className={isWrong ? 'pal-shake' : (isCorrect ? 'pal-success-ring' : '')}
            style={{
              padding: '14px 18px', borderRadius: '10px', textAlign: 'left',
              fontSize: '14px', lineHeight: '1.5', cursor: disabled ? 'default' : 'pointer',
              border: isCorrect ? '2px solid var(--green)' : (isWrong ? '2px solid var(--red)' : '2px solid var(--border)'),
              background: isCorrect ? 'rgba(16,185,129,0.08)' : (isWrong ? 'rgba(239,68,68,0.08)' : 'var(--surface)'),
              color: 'var(--text)', transition: 'all 0.2s ease',
              opacity: (disabled && !isSelected) ? 0.5 : 1,
            }}
          >
            {opt.text}
          </button>
        );
      })}
    </div>
  );
}

// ─── Continue Button ────────────────────────────────────────────────────────
function ContinueButton({ label, onClick }) {
  return (
    <button
      className='pal-glow-pulse'
      onClick={onClick}
      style={{
        marginTop: '20px', padding: '12px 28px', borderRadius: '10px',
        background: 'var(--accent)', color: '#fff', fontWeight: 600,
        fontSize: '15px', border: 'none', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '6px',
      }}
    >
      {label || 'Continue →'}
    </button>
  );
}

// ─── Feedback Block ─────────────────────────────────────────────────────────
function FeedbackBlock({ text }) {
  return (
    <div className='pal-reveal-in' style={{
      marginTop: '16px', padding: '16px', borderRadius: '10px',
      background: 'var(--surface)', border: '1px solid var(--border)',
      fontSize: '14px', lineHeight: '1.6', color: 'var(--text)',
    }}>
      {text}
    </div>
  );
}

// ─── Teal callout ───────────────────────────────────────────────────────────
function TealCallout({ children }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: '10px',
      background: 'rgba(20,184,166,0.08)', border: '1px solid var(--teal)',
      fontSize: '14px', lineHeight: '1.5', color: 'var(--text)',
      marginBottom: '16px',
    }}>
      {children}
    </div>
  );
}

// ─── Collapsible hint ───────────────────────────────────────────────────────
function CollapsibleHint({ hint, index }) {
  var _open = useState(false);
  var open = _open[0];
  var setOpen = _open[1];

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: '8px',
      marginBottom: '6px', overflow: 'hidden',
    }}>
      <button
        onClick={function() { setOpen(!open); }}
        style={{
          width: '100%', padding: '10px 14px', background: 'var(--surface)',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        <span style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          {'▶'}
        </span>
        Hint {index + 1}
      </button>
      {open && (
        <div style={{
          padding: '10px 14px', fontSize: '13px', lineHeight: '1.5',
          color: 'var(--text)', borderTop: '1px solid var(--border)',
        }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ─── Code Block ─────────────────────────────────────────────────────────────
function CodeBlock({ code }) {
  return (
    <pre style={{
      background: '#1e1e2e', color: '#cdd6f4', padding: '16px',
      borderRadius: '8px', fontSize: '13px', lineHeight: '1.5',
      overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    }}>
      {code}
    </pre>
  );
}

// ─── Metric Card (for alert phase) ──────────────────────────────────────────
function MetricCard({ metricName, metricValue, metricChange }) {
  var isNegative = (metricChange || '').indexOf('-') >= 0;
  return (
    <div className='pal-card-enter' style={{
      background: 'var(--surface)', border: '2px solid var(--border)',
      borderRadius: '12px', padding: '24px', textAlign: 'center',
      marginBottom: '20px',
    }}>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}>
        {metricName}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
        {metricValue}
      </div>
      <div style={{
        fontSize: '15px', fontWeight: 600,
        color: isNegative ? 'var(--red)' : 'var(--green)',
      }}>
        {metricChange}
      </div>
    </div>
  );
}

// ─── Alert Phase ────────────────────────────────────────────────────────────
function AlertPhase({ phase, state, setState, onContinue }) {
  var selected = state.selected || null;
  var selectedOpt = selected ? phase.options.find(function(o) { return o.id === selected; }) : null;

  function handleSelect(id) {
    if (selected) return;
    setState({ selected: id, correct: phase.options.find(function(o) { return o.id === id; }).correct });
  }

  return (
    <div>
      <MetricCard
        metricName={phase.metricName}
        metricValue={phase.metricValue}
        metricChange={phase.metricChange}
      />
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '8px' }}>
        {phase.prompt}
      </p>
      <OptionButtons
        options={phase.options}
        selected={selected}
        onSelect={handleSelect}
        disabled={!!selected}
      />
      {selectedOpt && <FeedbackBlock text={selectedOpt.feedback} />}
      {selected && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

// ─── Data Phase ─────────────────────────────────────────────────────────────
function DataPhase({ phase, state, setState, onContinue }) {
  var observation = state.observation || '';
  var revealed = state.revealed || false;

  return (
    <div>
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '16px' }}>
        {phase.prompt}
      </p>
      <DataTable headers={phase.dataTable.headers} rows={phase.dataTable.rows} />
      <TealCallout>{phase.guideQuestion}</TealCallout>
      <textarea
        value={observation}
        onChange={function(e) { setState({ observation: e.target.value, revealed: revealed }); }}
        placeholder='Write your observation here...'
        rows={4}
        style={{
          width: '100%', padding: '12px', borderRadius: '8px',
          border: '1px solid var(--border)', background: 'var(--surface)',
          fontSize: '14px', lineHeight: '1.5', color: 'var(--text)',
          resize: 'vertical', fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
      {!revealed && (
        <button
          onClick={function() { setState({ observation: observation, revealed: true }); }}
          style={{
            marginTop: '12px', padding: '10px 20px', borderRadius: '8px',
            background: 'var(--teal)', color: '#fff', fontWeight: 600,
            fontSize: '14px', border: 'none', cursor: 'pointer',
          }}
        >
          Reveal Model Observation {'→'}
        </button>
      )}
      {revealed && (
        <div className='pal-reveal-in' style={{
          marginTop: '16px', padding: '16px', borderRadius: '10px',
          background: 'rgba(20,184,166,0.08)', border: '1px solid var(--teal)',
          fontSize: '14px', lineHeight: '1.6', color: 'var(--text)',
        }}>
          <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--teal)' }}>
            Model Observation
          </div>
          {phase.modelObservation}
        </div>
      )}
      {revealed && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

// ─── RCA Phase ──────────────────────────────────────────────────────────────
function RCAPhase({ phase, state, setState, onContinue }) {
  var selected = state.selected || null;
  var selectedOpt = selected ? phase.options.find(function(o) { return o.id === selected; }) : null;

  function handleSelect(id) {
    if (selected) return;
    setState({ selected: id, correct: phase.options.find(function(o) { return o.id === id; }).correct });
  }

  return (
    <div>
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '8px' }}>
        {phase.prompt}
      </p>
      <OptionButtons
        options={phase.options}
        selected={selected}
        onSelect={handleSelect}
        disabled={!!selected}
      />
      {selectedOpt && <FeedbackBlock text={selectedOpt.feedback} />}
      {selected && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

// ─── SQL Phase ──────────────────────────────────────────────────────────────
function SQLPhase({ phase, state, setState, onContinue }) {
  var userSql = state.userSql || '';
  var revealed = state.revealed || false;

  return (
    <div>
      <SchemaDisplay schema={phase.schema} />
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '12px' }}>
        {phase.task}
      </p>
      <textarea
        value={userSql}
        onChange={function(e) { setState({ userSql: e.target.value, revealed: revealed }); }}
        placeholder='-- Write your SQL here'
        rows={6}
        style={{
          width: '100%', padding: '12px', borderRadius: '8px',
          border: '1px solid var(--border)', background: 'var(--surface)',
          fontSize: '13px', lineHeight: '1.5', color: 'var(--text)',
          fontFamily: 'monospace', resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />
      {!revealed && (
        <button
          onClick={function() { setState({ userSql: userSql, revealed: true }); }}
          style={{
            marginTop: '12px', padding: '10px 20px', borderRadius: '8px',
            background: 'var(--accent)', color: '#fff', fontWeight: 600,
            fontSize: '14px', border: 'none', cursor: 'pointer',
          }}
        >
          Reveal Correct Query {'→'}
        </button>
      )}
      {revealed && (
        <div className='pal-reveal-in'>
          <div style={{ marginTop: '16px', marginBottom: '12px' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--accent)' }}>
              Correct Query
            </div>
            <CodeBlock code={phase.correctQuery} />
          </div>
          {phase.expectedOutput && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
                Expected Output
              </div>
              <DataTable headers={phase.expectedOutput.headers} rows={phase.expectedOutput.rows} />
            </div>
          )}
          {phase.hints && phase.hints.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              {phase.hints.map(function(hint, i) {
                return <CollapsibleHint key={i} hint={hint} index={i} />;
              })}
            </div>
          )}
        </div>
      )}
      {revealed && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

// ─── Communicate Phase ──────────────────────────────────────────────────────
function CommunicatePhase({ phase, state, setState, onContinue }) {
  var userText = state.userText || '';
  var revealed = state.revealed || false;
  var checked = state.checked || {};

  return (
    <div>
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '12px' }}>
        {phase.prompt}
      </p>
      <textarea
        value={userText}
        onChange={function(e) { setState({ userText: e.target.value, revealed: revealed, checked: checked }); }}
        placeholder='Write your brief here...'
        rows={5}
        style={{
          width: '100%', padding: '12px', borderRadius: '8px',
          border: '1px solid var(--border)', background: 'var(--surface)',
          fontSize: '14px', lineHeight: '1.5', color: 'var(--text)',
          resize: 'vertical', fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
      {!revealed && (
        <button
          onClick={function() { setState({ userText: userText, revealed: true, checked: checked }); }}
          style={{
            marginTop: '12px', padding: '10px 20px', borderRadius: '8px',
            background: 'var(--accent)', color: '#fff', fontWeight: 600,
            fontSize: '14px', border: 'none', cursor: 'pointer',
          }}
        >
          See Model Answer {'→'}
        </button>
      )}
      {revealed && (
        <div className='pal-reveal-in'>
          <div style={{
            marginTop: '16px', padding: '16px', borderRadius: '10px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            fontSize: '14px', lineHeight: '1.6', color: 'var(--text)',
          }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--accent)' }}>
              Model Answer
            </div>
            {phase.modelAnswer}
          </div>
          {phase.rubric && phase.rubric.length > 0 && (
            <div style={{
              marginTop: '16px', padding: '16px', borderRadius: '10px',
              background: 'var(--surface)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontWeight: 600, marginBottom: '10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Self-Assessment Rubric
              </div>
              {phase.rubric.map(function(item, i) {
                var isChecked = !!checked[i];
                return (
                  <label key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                    marginBottom: '8px', cursor: 'pointer', fontSize: '14px',
                    lineHeight: '1.5', color: 'var(--text)',
                  }}>
                    <input
                      type='checkbox'
                      checked={isChecked}
                      onChange={function() {
                        var next = Object.assign({}, checked);
                        next[i] = !isChecked;
                        setState({ userText: userText, revealed: true, checked: next });
                      }}
                      style={{ marginTop: '3px', accentColor: 'var(--green)' }}
                    />
                    {item}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
      {revealed && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

// ─── Experiment Phase ───────────────────────────────────────────────────────
function ExperimentPhase({ phase, state, setState, onContinue }) {
  var fieldValues = state.fieldValues || {};
  var revealed = state.revealed || false;

  function updateField(idx, val) {
    var next = Object.assign({}, fieldValues);
    next[idx] = val;
    setState({ fieldValues: next, revealed: revealed });
  }

  return (
    <div>
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '16px' }}>
        {phase.prompt}
      </p>
      {phase.fields.map(function(field, i) {
        return (
          <div key={i} style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontWeight: 600, fontSize: '14px',
              color: 'var(--text)', marginBottom: '6px',
            }}>
              {field.label}
            </label>
            <textarea
              value={fieldValues[i] || ''}
              onChange={function(e) { updateField(i, e.target.value); }}
              placeholder={'Enter your ' + field.label.toLowerCase() + '...'}
              rows={3}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: '14px', lineHeight: '1.5', color: 'var(--text)',
                resize: 'vertical', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {revealed && (
              <div className='pal-reveal-in' style={{
                marginTop: '8px', padding: '12px', borderRadius: '8px',
                background: 'rgba(16,185,129,0.08)', border: '1px solid var(--green)',
                fontSize: '13px', lineHeight: '1.5', color: 'var(--text)',
              }}>
                <span style={{ fontWeight: 600, color: 'var(--green)' }}>Model: </span>
                {field.correctAnswer}
              </div>
            )}
          </div>
        );
      })}
      {!revealed && (
        <button
          onClick={function() { setState({ fieldValues: fieldValues, revealed: true }); }}
          style={{
            padding: '10px 20px', borderRadius: '8px',
            background: 'var(--accent)', color: '#fff', fontWeight: 600,
            fontSize: '14px', border: 'none', cursor: 'pointer',
          }}
        >
          Reveal Answers {'→'}
        </button>
      )}
      {revealed && <ContinueButton onClick={onContinue} />}
    </div>
  );
}

// ─── Readout Phase ──────────────────────────────────────────────────────────
function ReadoutPhase({ phase, state, setState, onComplete }) {
  var selected = state.selected || null;
  var selectedOpt = selected ? phase.options.find(function(o) { return o.id === selected; }) : null;

  function handleSelect(id) {
    if (selected) return;
    setState({ selected: id, correct: phase.options.find(function(o) { return o.id === id; }).correct });
  }

  return (
    <div>
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', marginBottom: '16px' }}>
        {phase.prompt}
      </p>
      <DataTable headers={phase.resultsTable.headers} rows={phase.resultsTable.rows} />
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text)', fontWeight: 600, marginBottom: '8px' }}>
        {phase.question}
      </p>
      <OptionButtons
        options={phase.options}
        selected={selected}
        onSelect={handleSelect}
        disabled={!!selected}
      />
      {selectedOpt && <FeedbackBlock text={selectedOpt.feedback} />}
      {selected && phase.debrief && (
        <div className='pal-reveal-in' style={{
          marginTop: '20px', padding: '20px', borderRadius: '12px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          fontSize: '14px', lineHeight: '1.7', color: 'var(--text)',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '10px', color: 'var(--accent)', fontSize: '15px' }}>
            Full Debrief
          </div>
          {phase.debrief}
        </div>
      )}
      {selected && (
        <ContinueButton label='Complete Case →' onClick={onComplete} />
      )}
    </div>
  );
}

// ─── Completion Card ────────────────────────────────────────────────────────
function CompletionCard({ flCase, phaseStates, onBack, onNext }) {
  var correct = 0;
  var total = 0;

  flCase.phases.forEach(function(phase, i) {
    if (phase.type === 'alert' || phase.type === 'rca' || phase.type === 'readout') {
      total += 1;
      if (phaseStates[i] && phaseStates[i].correct) {
        correct += 1;
      }
    }
  });

  return (
    <div className='pal-page-enter' style={{
      maxWidth: '800px', margin: '0 auto', padding: '24px 16px',
    }}>
      <div style={{
        background: 'var(--surface)', border: '2px solid var(--green)',
        borderRadius: '16px', padding: '32px', textAlign: 'center',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>{'🎉'}</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>
          Case Complete
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: '0 0 20px' }}>
          You completed all 7 phases of this full-loop case.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: correct === total ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.1)',
          padding: '10px 20px', borderRadius: '10px',
        }}>
          <span style={{ fontSize: '24px', fontWeight: 700, color: correct === total ? 'var(--green)' : 'var(--accent)' }}>
            {correct}/{total}
          </span>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            decision phases correct on first attempt
          </span>
        </div>
      </div>

      <ForwardPointerCard room='fullLoop' />

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text)', fontSize: '14px',
            fontWeight: 500, cursor: 'pointer',
          }}
        >
          {'←'} Back to Cases
        </button>
        {onNext && (
          <button
            className='pal-glow-pulse'
            onClick={onNext}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Next Case {'→'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Runner ────────────────────────────────────────────────────────────
export function FullLoopRunner({ caseId, onBack, onNext, unlocked }) {
  var flCase = fullLoopCasesById[caseId];
  var phases = flCase ? flCase.phases : [];

  // Load saved progress or draft
  var savedProgress = getFullLoopProgress(caseId);
  var draft = !savedProgress ? loadDraft(caseId) : null;

  var _phaseIndex = useState(draft ? (draft.phaseIndex || 0) : 0);
  var phaseIndex = _phaseIndex[0];
  var setPhaseIndex = _phaseIndex[1];

  var _phaseStates = useState(draft ? (draft.phaseStates || {}) : {});
  var phaseStates = _phaseStates[0];
  var setPhaseStates = _phaseStates[1];

  var _completedPhases = useState(draft ? (draft.completedPhases || {}) : {});
  var completedPhases = _completedPhases[0];
  var setCompletedPhases = _completedPhases[1];

  var _completed = useState(!!savedProgress);
  var completed = _completed[0];
  var setCompleted = _completed[1];

  // Save draft on state changes
  useEffect(function() {
    if (!completed) {
      saveDraft(caseId, {
        phaseIndex: phaseIndex,
        phaseStates: phaseStates,
        completedPhases: completedPhases,
      });
    }
  }, [phaseIndex, phaseStates, completedPhases, completed, caseId]);

  // Track open
  useEffect(function() {
    track('fullloop_case_opened', { caseId: caseId });
  }, [caseId]);

  var setCurrentPhaseState = useCallback(function(newState) {
    setPhaseStates(function(prev) {
      var next = Object.assign({}, prev);
      next[phaseIndex] = newState;
      return next;
    });
  }, [phaseIndex]);

  function handleContinue() {
    var nextCompleted = Object.assign({}, completedPhases);
    nextCompleted[phaseIndex] = true;
    setCompletedPhases(nextCompleted);

    if (phaseIndex < phases.length - 1) {
      setPhaseIndex(phaseIndex + 1);
      window.scrollTo(0, 0);
    }
  }

  function handleComplete() {
    var nextCompleted = Object.assign({}, completedPhases);
    nextCompleted[phaseIndex] = true;
    setCompletedPhases(nextCompleted);

    // Calculate score
    var correct = 0;
    var total = 0;
    phases.forEach(function(phase, i) {
      if (phase.type === 'alert' || phase.type === 'rca' || phase.type === 'readout') {
        total += 1;
        var st = i === phaseIndex ? phaseStates[i] : phaseStates[i];
        if (st && st.correct) correct += 1;
      }
    });

    saveFullLoopProgress(caseId, {
      score: correct,
      maxScore: total,
      phaseStates: phaseStates,
    });

    clearDraft(caseId);
    setCompleted(true);
    window.scrollTo(0, 0);
    track('fullloop_case_completed', { caseId: caseId, score: correct, maxScore: total });
  }

  function handlePhaseSelect(i) {
    setPhaseIndex(i);
    window.scrollTo(0, 0);
  }

  // Guard
  if (!flCase) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Case not found.</p>
        <button onClick={onBack} style={{
          marginTop: '12px', padding: '10px 20px', borderRadius: '8px',
          border: '1px solid var(--border)', background: 'var(--surface)',
          color: 'var(--text)', cursor: 'pointer',
        }}>
          {'←'} Back
        </button>
      </div>
    );
  }

  // Completion view
  if (completed) {
    return (
      <CompletionCard
        flCase={flCase}
        phaseStates={phaseStates}
        onBack={onBack}
        onNext={onNext}
      />
    );
  }

  var currentPhase = phases[phaseIndex];
  var currentState = phaseStates[phaseIndex] || {};

  // Render phase content
  var phaseContent = null;

  if (currentPhase.type === 'alert') {
    phaseContent = (
      <AlertPhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onContinue={handleContinue}
      />
    );
  } else if (currentPhase.type === 'data') {
    phaseContent = (
      <DataPhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onContinue={handleContinue}
      />
    );
  } else if (currentPhase.type === 'rca') {
    phaseContent = (
      <RCAPhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onContinue={handleContinue}
      />
    );
  } else if (currentPhase.type === 'sql') {
    phaseContent = (
      <SQLPhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onContinue={handleContinue}
      />
    );
  } else if (currentPhase.type === 'communicate') {
    phaseContent = (
      <CommunicatePhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onContinue={handleContinue}
      />
    );
  } else if (currentPhase.type === 'experiment') {
    phaseContent = (
      <ExperimentPhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onContinue={handleContinue}
      />
    );
  } else if (currentPhase.type === 'readout') {
    phaseContent = (
      <ReadoutPhase
        phase={currentPhase}
        state={currentState}
        setState={setCurrentPhaseState}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <div className='pal-page-enter' style={{
      maxWidth: '800px', margin: '0 auto', padding: '24px 16px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text-muted)', fontSize: '13px',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          {'←'} Back
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            {flCase.title}
          </h1>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {flCase.domain} &middot; Phase {phaseIndex + 1} of {phases.length}
          </span>
        </div>
      </div>

      {/* Phase bar */}
      <PhaseBar
        phases={phases}
        currentIndex={phaseIndex}
        completedPhases={completedPhases}
        onSelect={handlePhaseSelect}
      />

      {/* Phase title */}
      <h2 style={{
        fontSize: '18px', fontWeight: 700, color: 'var(--accent)',
        margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span>{PHASE_ICONS[currentPhase.type] || ''}</span>
        {currentPhase.title}
      </h2>

      {/* Phase content */}
      <div className='pal-card-enter'>
        {phaseContent}
      </div>
    </div>
  );
}
