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

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module01_WhatIsData({ module, onNext }) {
  var _saved = loadSFState('sf01');
  const [placements, setPlacements] = useState(function() { return _saved ? (_saved.placements || {}) : {}; });
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
    setPlacements(prev => { const next = { ...prev }; delete next[varId]; return next; });
  }

  function handleCheck() { if (allPlaced) setChecked(true); }
  function handleReset() { setPlacements({}); setChecked(false); }

  const placedCardStyle = (varObj, bucket) => {
    const bg = bucket === 'numerical' ? 'var(--accent-bg)' : 'var(--purple-bg)';
    const border = bucket === 'numerical' ? 'var(--accent-border)' : 'var(--purple-border)';
    const color = bucket === 'numerical' ? 'var(--accent)' : 'var(--purple)';
    if (checked) {
      const correct = bucket === varObj.correct;
      return { bg: correct ? 'var(--green-bg)' : 'var(--red-bg)', border: correct ? 'var(--green-border)' : 'var(--red-border)', color: correct ? 'var(--green)' : 'var(--red)' };
    }
    return { bg, border, color };
  };

  const zoneStyle = (type) => ({
    flex: 1, minWidth: 'min(200px, 100%)', minHeight: 120,
    borderRadius: 'var(--radius)',
    border: `2px dashed ${type === 'numerical' ? 'var(--accent-border)' : 'var(--purple-border)'}`,
    background: type === 'numerical' ? 'var(--accent-bg)' : 'var(--purple-bg)',
    padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
  });

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          Data is a recorded observation. Every time something happens — a user clicks a button, a purchase completes, a session ends — you can record it. That record is data. At its simplest: data is the world, written down.
        </p>
        <p style={prose}>
          We record things because we want to understand them. And understanding something means being able to describe it, compare it, and eventually predict it. You can't do any of that with memory and gut feel alone.
        </p>
        <p style={prose}>
          But not everything you can record about the world is the same kind of thing — and that difference determines everything about what you can do with it analytically.
        </p>
        <p style={prose}>
          <strong style={{ color: 'var(--text)' }}>Device type</strong> has no numerical meaning. "Mobile" is not greater than "desktop." You can count how many users used each device — you cannot average them. This is <strong style={{ color: 'var(--text)' }}>categorical data</strong>: observations that fall into distinct groups with no inherent numeric relationship.
        </p>
        <p style={prose}>
          <strong style={{ color: 'var(--text)' }}>Session duration</strong> is a measurement on a continuous scale. 47 seconds is less than 3 minutes in a precise, quantifiable way. You can average it, sum it, find the spread. This is <strong style={{ color: 'var(--text)' }}>continuous numerical data</strong>.
        </p>
        <p style={prose}>
          <strong style={{ color: 'var(--text)' }}>Number of purchases</strong> is numerical but can only be whole numbers. You can't have 1.7 purchases. This is <strong style={{ color: 'var(--text)' }}>discrete numerical data</strong>.
        </p>
        <p style={prose}>
          Why does this matter? Because the type of variable determines what operations are valid. You cannot take the mean of device type. You can take the mean of session duration. Running the wrong analysis on the wrong data type produces answers that are numerically possible but analytically meaningless.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You have a column called "rating" with values 1, 2, 3, 4, 5. Is this numerical or categorical? Think through the logic before sorting the variables below.
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Sort the Variables</div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Use the N and C buttons to place each variable into the Numerical or Categorical bucket. Ask yourself: does arithmetic make sense on this value? Place all 8, then hit Check.
      </div>

      {unplaced.length > 0 && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Unplaced Variables</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {unplaced.map(v => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text)', flex: 1 }}>{v.label}</span>
                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                  <button onClick={() => place(v.id, 'numerical')} style={{ padding: '0.28rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--accent-border)', background: 'var(--accent-bg)', color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', minWidth: 36 }}>N</button>
                  <button onClick={() => place(v.id, 'categorical')} style={{ padding: '0.28rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--purple-border)', background: 'var(--purple-bg)', color: 'var(--purple)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', minWidth: 36 }}>C</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={zoneStyle('numerical')}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Numerical</div>
          {numerical.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>Press N on any variable to place it here</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {numerical.map(v => {
              const cs = placedCardStyle(v, 'numerical');
              return (
                <span key={v.id} style={{ padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${cs.border}`, background: cs.bg, color: cs.color, fontSize: '0.82rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  {checked && v.correct === 'numerical' ? <Icon name='check' size={13} color='var(--green)' /> : checked ? <Icon name='x' size={13} color='var(--red)' /> : null}
                  {v.label}
                  {checked && numericalAllCorrect && v.correct === 'numerical' && v.subtype && <span style={{ fontSize: '0.72rem', fontWeight: 400, opacity: 0.8 }}> ({v.subtype})</span>}
                  {!checked && <button onClick={() => unplace(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 700, padding: '0 0.1rem', lineHeight: 1 }} aria-label={'Remove ' + v.label}>×</button>}
                </span>
              );
            })}
          </div>
        </div>
        <div style={zoneStyle('categorical')}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Categorical</div>
          {categorical.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>Press C on any variable to place it here</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categorical.map(v => {
              const cs = placedCardStyle(v, 'categorical');
              return (
                <span key={v.id} style={{ padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${cs.border}`, background: cs.bg, color: cs.color, fontSize: '0.82rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  {checked && v.correct === 'categorical' ? <Icon name='check' size={13} color='var(--green)' /> : checked ? <Icon name='x' size={13} color='var(--red)' /> : null}
                  {v.label}
                  {!checked && <button onClick={() => unplace(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--purple)', fontSize: '0.85rem', fontWeight: 700, padding: '0 0.1rem', lineHeight: 1 }} aria-label={'Remove ' + v.label}>×</button>}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {checked && (
        <div className="pal-reveal-in" style={{ background: score === 8 ? 'var(--green-bg)' : 'var(--yellow-bg)', border: `1.5px solid ${score === 8 ? 'var(--green-border)' : 'var(--yellow-border)'}`, borderRadius: 'var(--radius)', padding: '1rem 1.25rem', fontSize: '0.9rem', color: score === 8 ? 'var(--green)' : 'var(--yellow)', fontWeight: 500 }}>
          {score === 8
            ? 'All 8 correct. The numerical ones split further: discrete (countable integers) and continuous (any real value in a range). App version looks like a number but it labels categories with no true order — 2.0 is not "twice" 1.0.'
            : `${score}/8 correct. App version is the common trap — it looks numerical but it\'s a category label. Use × to move misplaced ones, then re-check.`}
        </div>
      )}

      {checked && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            "Rating" (1–5) is the ambiguous case: ordinal categorical when the gaps between values aren't guaranteed equal, numerical if you're willing to assume equal intervals. That's a modelling choice, not a given. Data type is not always obvious from the values alone — it depends on what those values represent.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button onClick={handleCheck} disabled={!allPlaced || checked} style={{ padding: '0.55rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', background: allPlaced && !checked ? 'var(--accent)' : 'var(--border)', color: allPlaced && !checked ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.88rem', cursor: allPlaced && !checked ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}>Check answers</button>
        <button onClick={handleReset} style={{ padding: '0.55rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer' }}>Reset</button>
      </div>

      {/* ── Analyst Move ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Before any analysis, classify every column. Categorical or numerical. Nominal/ordinal or discrete/continuous. Two minutes. Prevents you from computing a mean on a rating scale and reporting it as if the number means something precise.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> When a PM asks "what's the average satisfaction score?" — that question assumes ordinal data is continuous. Sometimes that's a fine approximation. Often it isn't. Know which situation you're in.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Data type determines your visualisation choice. Bar chart for categorical. Histogram for continuous numerical. If you're reaching for the wrong chart, it's usually because you haven't classified the variable first.</p>
        </div>
      </div>

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'When you define a metric in an experiment, you are choosing a variable type. Numerical metrics (revenue, session length) use t-tests. Categorical outcomes (converted/not) become proportions tested with z-tests or chi-square. The type you have decides which test is valid.'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="pal-glow-pulse" onClick={onNext} style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
          Next concept →
        </button>
      </div>
    </div>
  );
}
