import { useState, useMemo, useEffect } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { loadSFState, saveSFState } from '../../../utils/statsFoundationsState.js';

const VARIABLES = [
  { id: 'purchases', label: 'Number of purchases', correct: 'numerical', subtype: 'discrete' },
  { id: 'country', label: "User's country", correct: 'categorical', subtype: null },
  { id: 'session', label: 'Session length (seconds)', correct: 'numerical', subtype: 'continuous' },
  { id: 'premium', label: 'Premium/free status', correct: 'categorical', subtype: null },
  { id: 'revenue', label: 'Revenue per order ($)', correct: 'numerical', subtype: 'continuous' },
  { id: 'appversion', label: 'App version (1.0, 2.0…)', correct: 'categorical', subtype: null },
  { id: 'friends', label: 'Number of friends', correct: 'numerical', subtype: 'discrete' },
  { id: 'gender', label: 'Gender', correct: 'categorical', subtype: null },
];

export function Module01_WhatIsData({ module, onNext }) {
  var _saved = loadSFState('sf01');
  const [placements, setPlacements] = useState(function() { return _saved ? (_saved.placements || {}) : {}; }); // id -> 'numerical' | 'categorical'
  const [checked, setChecked] = useState(function() { return _saved ? !!_saved.checked : false; });

  useEffect(function() {
    saveSFState('sf01', { placements: placements, checked: checked });
  }, [placements, checked]);

  const unplaced = VARIABLES.filter(v => !placements[v.id]);
  const numerical = VARIABLES.filter(v => placements[v.id] === 'numerical');
  const categorical = VARIABLES.filter(v => placements[v.id] === 'categorical');

  const allPlaced = unplaced.length === 0;

  const score = useMemo(() => {
    if (!checked) return null;
    return VARIABLES.filter(v => placements[v.id] === v.correct).length;
  }, [checked, placements]);

  const numericalAllCorrect = checked && numerical.every(v => v.correct === 'numerical');

  function place(varId, bucket) {
    if (checked) return;
    setPlacements(prev => ({ ...prev, [varId]: bucket }));
  }

  function unplace(varId) {
    if (checked) return;
    setPlacements(prev => {
      const next = { ...prev };
      delete next[varId];
      return next;
    });
  }

  function handleCheck() {
    if (allPlaced) setChecked(true);
  }

  function handleReset() {
    setPlacements({});
    setChecked(false);
  }

  const placedCardStyle = (varObj, bucket) => {
    const bg = bucket === 'numerical' ? 'var(--accent-bg)' : 'var(--purple-bg)';
    const border = bucket === 'numerical' ? 'var(--accent-border)' : 'var(--purple-border)';
    const color = bucket === 'numerical' ? 'var(--accent)' : 'var(--purple)';

    if (checked) {
      const correct = bucket === varObj.correct;
      return {
        bg: correct ? 'var(--green-bg)' : 'var(--red-bg)',
        border: correct ? 'var(--green-border)' : 'var(--red-border)',
        color: correct ? 'var(--green)' : 'var(--red)',
      };
    }
    return { bg, border, color };
  };

  const zoneStyle = (type) => ({
    flex: 1,
    minWidth: 'min(200px, 100%)',
    minHeight: 120,
    borderRadius: 'var(--radius)',
    border: `2px dashed ${type === 'numerical' ? 'var(--accent-border)' : 'var(--purple-border)'}`,
    background: type === 'numerical' ? 'var(--accent-bg)' : 'var(--purple-bg)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  });

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          You just joined a new product team and your first task is to make sense of an event log with 50 columns. Some columns hold numbers like session duration and purchase count. Others hold labels like country, device type, and subscription tier. Before you can compute a single metric, you need to know which columns are which — because the math you use on a number makes no sense on a label.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          Your lead asks you to sort the event schema into numerical vs. categorical fields so the team can set up the right aggregations in the dashboard. Get it wrong and you\'ll end up averaging country codes or counting medians of device names. Drag each variable into the correct bucket below.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Sort the Variables</div>

      {/* Explanation */}
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        Statistics is the toolkit that lets analysts draw reliable conclusions from noisy data — deciding whether an observed difference is real or random, how confident to be in a measurement, and how large a sample is needed to detect a true effect. Every A/B test, every experiment result, every metric significance call relies on these foundations. Every experiment metric is a numerical variable measured on each user — but knowing the type shapes how you summarize and test it.
      </p>

      {/* Instructions */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.25rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Use the N and C buttons to place each variable into the Numerical or Categorical bucket. Ask yourself: can you do arithmetic on this value — does "twice as much" make sense? Tap the × on a placed card to move it. Place all 8, then hit Check.
      </div>

      {/* Unplaced pool */}
      {unplaced.length > 0 && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Unplaced Variables
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {unplaced.map(v => (
              <div key={v.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
                background: 'var(--surface)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem',
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text)', flex: 1 }}>{v.label}</span>
                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                  <button
                    onClick={() => place(v.id, 'numerical')}
                    style={{
                      padding: '0.28rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--accent-border)',
                      background: 'var(--accent-bg)',
                      color: 'var(--accent)',
                      fontSize: '0.78rem', fontWeight: 700,
                      cursor: 'pointer',
                      minWidth: 36,
                    }}
                  >
                    N
                  </button>
                  <button
                    onClick={() => place(v.id, 'categorical')}
                    style={{
                      padding: '0.28rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--purple-border)',
                      background: 'var(--purple-bg)',
                      color: 'var(--purple)',
                      fontSize: '0.78rem', fontWeight: 700,
                      cursor: 'pointer',
                      minWidth: 36,
                    }}
                  >
                    C
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zones */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={zoneStyle('numerical')}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Numerical
          </div>
          {numerical.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>Press N on any variable to place it here</div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {numerical.map(v => {
              const cs = placedCardStyle(v, 'numerical');
              return (
                <span key={v.id} style={{
                  padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)',
                  border: `1.5px solid ${cs.border}`, background: cs.bg, color: cs.color,
                  fontSize: '0.82rem', fontWeight: 500,
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                }}>
                  {checked && v.correct === 'numerical' ? <Icon name='check' size={13} color='var(--green)' /> : checked ? <Icon name='x' size={13} color='var(--red)' /> : null}
                  {v.label}
                  {checked && numericalAllCorrect && v.correct === 'numerical' && v.subtype && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 400, opacity: 0.8 }}> ({v.subtype})</span>
                  )}
                  {!checked && (
                    <button
                      onClick={() => unplace(v.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 700,
                        padding: '0 0.1rem', lineHeight: 1,
                      }}
                      aria-label={'Remove ' + v.label}
                    >
                      ×
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        <div style={zoneStyle('categorical')}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Categorical
          </div>
          {categorical.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>Press C on any variable to place it here</div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categorical.map(v => {
              const cs = placedCardStyle(v, 'categorical');
              return (
                <span key={v.id} style={{
                  padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)',
                  border: `1.5px solid ${cs.border}`, background: cs.bg, color: cs.color,
                  fontSize: '0.82rem', fontWeight: 500,
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                }}>
                  {checked && v.correct === 'categorical' ? <Icon name='check' size={13} color='var(--green)' /> : checked ? <Icon name='x' size={13} color='var(--red)' /> : null}
                  {v.label}
                  {!checked && (
                    <button
                      onClick={() => unplace(v.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--purple)', fontSize: '0.85rem', fontWeight: 700,
                        padding: '0 0.1rem', lineHeight: 1,
                      }}
                      aria-label={'Remove ' + v.label}
                    >
                      ×
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Score feedback */}
      {checked && (
        <div className="pal-reveal-in" style={{
          background: score === 8 ? 'var(--green-bg)' : 'var(--yellow-bg)',
          border: `1.5px solid ${score === 8 ? 'var(--green-border)' : 'var(--yellow-border)'}`,
          borderRadius: 'var(--radius)',
          padding: '1rem 1.25rem',
          fontSize: '0.9rem',
          color: score === 8 ? 'var(--green)' : 'var(--yellow)',
          fontWeight: 500,
        }}>
          {score === 8
            ? 'Perfect! All 8 correct. Notice the numerical ones split into discrete (countable integers) and continuous (any real value).'
            : `${score}/8 correct. App version looks numerical but it labels categories with no true order. Use × to remove misplaced ones, then re-check.`}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          onClick={handleCheck}
          disabled={!allPlaced || checked}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: allPlaced && !checked ? 'var(--accent)' : 'var(--border)',
            color: allPlaced && !checked ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: allPlaced && !checked ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
          }}
        >
          Check answers
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '0.55rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-muted)',
            fontWeight: 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'Variable type determines everything downstream: what summary stats make sense, what test to run, and how to interpret results. App version looks like a number — but 2.0 is not "twice" 1.0. Always ask: does arithmetic make sense on this variable?'}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'When you pick a primary metric for an A/B test, you are choosing a numerical variable. The type (discrete vs continuous) affects your sample size calculation and which statistical test is appropriate.'}
        </div>
      </div>

      {/* Next */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="pal-glow-pulse"
          onClick={onNext}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'var(--yellow)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          Next concept →
        </button>
      </div>
    </div>
  );
}
