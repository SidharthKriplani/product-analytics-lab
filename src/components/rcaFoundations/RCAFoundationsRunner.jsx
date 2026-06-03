import { useState, useEffect, useMemo } from 'react';
import { rcaFoundationModules } from '../../data/rcaFoundationModules.js';
import { saveRCAFoundationProgress, getAllRCAFoundationProgress } from '../../utils/rcaFoundationProgress.js';
import { track } from '../../utils/analytics.js';
import { HowTo } from '../shared/HowTo.jsx';

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

// ── Shared helpers ──────────────────────────────────────────────────────────

function InsightBox({ children }) {
  return (
    <div style={{
      background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
      borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginTop: '1.25rem',
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
        Key Insight
      </div>
      <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function NextBtn({ onClick, label }) {
  return (
    <button onClick={onClick} className="pal-glow-pulse" style={{
      marginTop: '1.5rem', padding: '0.65rem 1.6rem',
      background: 'var(--teal)', color: '#fff', border: 'none',
      borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.9rem',
      cursor: 'pointer',
    }}>
      {label || 'Next →'}
    </button>
  );
}

function MCQOption({ label, selected, correct, revealed, onClick }) {
  let bg = 'var(--surface-2)';
  let border = 'var(--border)';
  let color = 'var(--text)';
  if (revealed) {
    if (correct) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
    else if (selected && !correct) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
  } else if (selected) {
    border = 'var(--teal-border)';
  }
  return (
    <button onClick={onClick} disabled={revealed} style={{
      display: 'block', width: '100%', textAlign: 'left',
      padding: '0.7rem 1rem', marginBottom: '0.5rem',
      background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)',
      color, fontSize: '0.88rem', cursor: revealed ? 'default' : 'pointer',
      transition: 'all 0.15s',
    }}>
      {label}
    </button>
  );
}

// ── Persistence helpers ─────────────────────────────────────────────────────
function saveRCAState(id, state) {
  try { localStorage.setItem('pal-rca-' + id + '-v1', JSON.stringify(state)); } catch(e) {}
}
function loadRCAState(id) {
  try { var raw = localStorage.getItem('pal-rca-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; }
}
function shuffleArr(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

// ── Module rf01: The RCA Framework ─────────────────────────────────────────
const ITEMS_RF01 = [
  { text: 'Event logging stopped firing on iOS 17.2', layer: 'dq' },
  { text: 'Christmas week — all consumer apps see a traffic spike', layer: 'ext' },
  { text: 'Pushed a nav redesign that buried the share button', layer: 'prod' },
  { text: 'New paid-acquisition cohort has lower baseline engagement', layer: 'beh' },
  { text: 'Data warehouse pipeline had a 6-hour backfill delay', layer: 'dq' },
  { text: 'Competitor launched a free tier matching our core feature set', layer: 'ext' },
];

function Module_RF01({ onComplete }) {
  const LAYERS = [
    {
      id: 'dq', label: 'Data Quality', num: 1,
      desc: 'Did tracking or a pipeline change? Is this a real signal?',
      why: 'Cheapest to rule out — check pipeline logs, SDK version, event counts by platform. Takes 10 minutes. The most common false alarm.',
      time: '~10 min', color: 'var(--red)', timeBg: 'var(--red-bg)', timeBorder: 'var(--red-border)',
    },
    {
      id: 'ext', label: 'External / Seasonal', num: 2,
      desc: 'Holiday? Competitor launch? Platform outage? Day-of-week?',
      why: 'Free data — calendars, public announcements, app store changelogs. Rules out an entire class of causes without touching any internal system.',
      time: '~30 min', color: 'var(--yellow)', timeBg: 'var(--yellow-bg)', timeBorder: 'var(--yellow-border)',
    },
    {
      id: 'prod', label: 'Product Change', num: 3,
      desc: 'Did we ship something? A/B test? Infra change? Ranking algorithm?',
      why: 'Deployment logs and experiment records are internal — queryable but require cross-team coordination. More investigative.',
      time: '1–2 h', color: 'var(--accent)', timeBg: 'var(--accent-bg)', timeBorder: 'var(--accent-border)',
    },
    {
      id: 'beh', label: 'User Behaviour Shift', num: 4,
      desc: 'Cohort mix change? Organic behaviour evolution? Market saturation?',
      why: 'Hardest to confirm. Requires longitudinal cohort analysis and external benchmarks. Takes days to weeks to establish confidently.',
      time: 'Days–weeks', color: 'var(--purple)', timeBg: 'var(--purple-bg)', timeBorder: 'var(--purple-border)',
    },
  ];

  const _saved01 = useMemo(function() { return loadRCAState('rf01'); }, []);
  const [items01] = useState(function() { return _saved01 && _saved01.items ? _saved01.items : shuffleArr(ITEMS_RF01); });
  const [assignments, setAssignments] = useState(function() { return _saved01 && _saved01.assignments ? _saved01.assignments : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved01 ? !!_saved01.revealed : false; });
  const [expanded, setExpanded] = useState(null);

  useEffect(function() { saveRCAState('rf01', { items: items01, assignments: assignments, revealed: revealed }); }, [items01, assignments, revealed]);

  function assign(itemIdx, layerId) {
    if (revealed) return;
    setAssignments(prev => ({ ...prev, [itemIdx]: layerId }));
  }

  const allAssigned = items01.every((_, i) => assignments[i]);
  const correctCount = items01.filter((item, i) => assignments[i] === item.layer).length;

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        RCA — Root Cause Analysis — is how analysts answer the question: "Our key metric dropped. Why?" It is the most common ambiguity problem in product analytics interviews and one of the highest-leverage skills in a working analyst&apos;s toolkit. Every metric movement belongs to one of four diagnostic layers. The order is not arbitrary — it is sorted by investigation cost and frequency of false alarms. Data quality is the most common false alarm and takes 10 minutes to rule out. User behaviour shifts can take weeks. Work top-to-bottom, always.
      </p>

      {/* Visual ordered framework */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem' }}>
          The four-layer investigation sequence — click any layer to expand
        </div>
        {LAYERS.map((layer, i) => {
          const isOpen = expanded === layer.id;
          return (
            <div key={layer.id}>
              <div
                onClick={() => setExpanded(isOpen ? null : layer.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.7rem 1rem',
                  background: isOpen ? 'var(--surface-raised)' : 'var(--surface-2)',
                  border: '1.5px solid ' + (isOpen ? layer.color : 'var(--border)'),
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  userSelect: 'none',
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: layer.color, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#fff',
                }}>
                  {layer.num}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: layer.color }}>{layer.label}</span>
                    <span style={{
                      fontSize: '0.67rem', fontWeight: 700, padding: '0.1rem 0.4rem',
                      borderRadius: 3, background: layer.timeBg,
                      border: '1px solid ' + layer.timeBorder, color: layer.color,
                    }}>
                      {layer.time}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: '0.15rem' }}>
                    {layer.desc}
                  </div>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
              </div>
              {isOpen && (
                <div style={{
                  padding: '0.7rem 1rem 0.7rem 3.25rem',
                  background: 'var(--surface-2)',
                  borderLeft: '1.5px solid ' + layer.color,
                  borderRight: '1.5px solid ' + layer.color,
                  borderBottom: '1.5px solid ' + layer.color,
                  borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
                  marginTop: -2,
                  fontSize: '0.81rem', color: 'var(--text-secondary)', lineHeight: 1.55,
                  fontStyle: 'italic',
                }}>
                  {layer.why}
                </div>
              )}
              {i < LAYERS.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '1.15rem', padding: '0.15rem 0 0.15rem 1.15rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>↓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> For each signal below, pick the layer that best explains it. Assign all six, then check.
      </div>

      {/* Item list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {items01.map((item, i) => {
          const asgn = assignments[i];
          const aLayer = LAYERS.find(l => l.id === asgn);
          const isCorrect = revealed && asgn === item.layer;
          const isWrong = revealed && asgn && asgn !== item.layer;
          const correctLayer = LAYERS.find(l => l.id === item.layer);
          return (
            <div key={i} style={{
              padding: '0.65rem 0.9rem',
              background: isCorrect ? 'var(--teal-bg)' : isWrong ? 'var(--red-bg)' : asgn ? 'var(--surface-raised)' : 'var(--surface-2)',
              border: '1.5px solid ' + (isCorrect ? 'var(--teal-border)' : isWrong ? 'var(--red-border)' : asgn ? 'var(--border-strong)' : 'var(--border)'),
              borderRadius: 'var(--radius-sm)', transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: '0.85rem', color: isCorrect ? 'var(--teal)' : isWrong ? 'var(--red)' : 'var(--text)', lineHeight: 1.5, marginBottom: asgn || !revealed ? '0.4rem' : 0 }}>
                {item.text}
              </div>
              {!revealed && (
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {LAYERS.map(layer => (
                    <button key={layer.id} onClick={() => assign(i, layer.id)} style={{
                      fontSize: '0.72rem', padding: '0.2rem 0.55rem',
                      background: asgn === layer.id ? layer.color : 'var(--surface)',
                      border: '1px solid ' + (asgn === layer.id ? layer.color : 'var(--border)'),
                      borderRadius: 3, color: asgn === layer.id ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer', fontWeight: asgn === layer.id ? 700 : 400, transition: 'all 0.1s',
                    }}>
                      {layer.label}
                    </button>
                  ))}
                </div>
              )}
              {revealed && (
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isCorrect ? 'var(--teal)' : 'var(--red)' }}>
                  {isCorrect
                    ? aLayer.label + ' ✓'
                    : 'Correct: ' + correctLayer.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!revealed && allAssigned && (
        <button onClick={() => setRevealed(true)} style={{
          padding: '0.55rem 1.2rem', background: 'var(--teal)', color: '#fff',
          border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700,
          fontSize: '0.88rem', cursor: 'pointer',
        }}>
          Check answers
        </button>
      )}

      {revealed && (
        <div>
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem', marginBottom: '1.25rem',
            background: correctCount === items01.length ? 'var(--teal-bg)' : 'var(--yellow-bg)',
            border: '1px solid ' + (correctCount === items01.length ? 'var(--teal-border)' : 'var(--yellow-border)'),
            color: correctCount === items01.length ? 'var(--teal)' : 'var(--yellow)',
            fontWeight: 700, fontSize: '0.88rem',
          }}>
            {correctCount}/{items01.length} correct{correctCount < items01.length ? ' — review the highlighted items' : ' — perfect'}
          </div>

          {/* Why this order — compact cost table */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
              Why this order matters
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {LAYERS.map(layer => (
                <div key={layer.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: layer.color, flexShrink: 0, marginTop: '0.35rem' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: layer.color }}>{layer.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>({layer.time})</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>
                      — {layer.why.split('.')[0].toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <InsightBox>
            RCA works top-to-bottom: Data Quality → External → Product → Behaviour. This order exists because data quality is cheap to rule out and the most common false alarm. Never skip to product hypotheses before confirming the data is real.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module rf02: Decompose Before Diagnose ──────────────────────────────────
const DECOMPS_RF02 = [
  { id: 'new',   label: 'New user installs',        correct: true,  explanation: 'New user acquisition failure = marketing or app store change.' },
  { id: 'ret',   label: 'D1/D7/D30 retention rate', correct: true,  explanation: 'Retention collapse = product or notification change.' },
  { id: 'res',   label: 'Resurrected users',         correct: true,  explanation: 'Resurr drop = re-engagement campaign stopped or push notifications disabled.' },
  { id: 'rev',   label: 'Revenue per user',          correct: false, explanation: 'Revenue is a lagging output metric, not a DAU driver. This does not explain the drop.' },
  { id: 'churn', label: 'Churned user rate',          correct: true,  explanation: 'Churn spike = product problem or external pressure causing users to leave.' },
  { id: 'sess',  label: 'Session count per user',    correct: false, explanation: 'Sessions per user explains engagement depth, not DAU headcount. Useful after decomposing DAU.' },
];

function Module_RF02({ onComplete }) {
  const SCENARIO = 'WhatsApp DAU drops 18% week-over-week, from 42M to 34.4M. Your PM asks: "What happened?"';

  const _saved02 = useMemo(function() { return loadRCAState('rf02'); }, []);
  const [decomps02] = useState(function() { return _saved02 && _saved02.decomps ? _saved02.decomps : shuffleArr(DECOMPS_RF02); });
  const [selected, setSelected] = useState(function() { return new Set(_saved02 && _saved02.selected ? _saved02.selected : []); });
  const [revealed, setRevealed] = useState(function() { return _saved02 ? !!_saved02.revealed : false; });

  useEffect(function() { saveRCAState('rf02', { decomps: decomps02, selected: Array.from(selected), revealed: revealed }); }, [decomps02, selected, revealed]);

  function toggle(id) {
    if (revealed) return;
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const correctIds = new Set(decomps02.filter(d => d.correct).map(d => d.id));

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        Aggregate metrics like DAU are sums of components. Jumping to a root cause without decomposing first wastes investigation time and leads to wrong diagnoses. This module trains you to break a top-line metric into the sub-metrics that can actually point to a cause.
      </p>

      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem',
        fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6,
      }}>
        <strong>Scenario:</strong> {SCENARIO}
      </div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Select every metric that belongs in the DAU decomposition — think about which components actually add up to or subtract from DAU.
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
        Before diagnosing root cause, you must decompose DAU. Select all metrics that belong in the DAU decomposition:
      </p>

      {decomps02.map(d => {
        const sel = selected.has(d.id);
        let bg = sel ? 'var(--teal-bg)' : 'var(--surface-2)';
        let border = sel ? 'var(--teal-border)' : 'var(--border)';
        let color = sel ? 'var(--teal)' : 'var(--text)';
        if (revealed) {
          if (d.correct) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
          else if (sel && !d.correct) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
          else { bg = 'var(--surface-2)'; border = 'var(--border)'; color = 'var(--text-muted)'; }
        }
        return (
          <div key={d.id}>
            <button onClick={() => toggle(d.id)} disabled={revealed} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '0.65rem 1rem', marginBottom: revealed ? 0 : '0.45rem',
              background: bg, border: '1.5px solid ' + border,
              borderRadius: 'var(--radius-sm)', color, fontSize: '0.88rem',
              cursor: revealed ? 'default' : 'pointer', transition: 'all 0.15s',
              fontWeight: sel || (revealed && d.correct) ? 600 : 400,
            }}>
              {d.label}
            </button>
            {revealed && (
              <div style={{
                fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5,
                padding: '0.3rem 1rem 0.6rem', marginBottom: '0.1rem',
              }}>
                {d.correct ? '✓' : '✗'} {d.explanation}
              </div>
            )}
          </div>
        );
      })}

      {!revealed && selected.size > 0 && (
        <button onClick={() => setRevealed(true)} style={{
          marginTop: '0.75rem', padding: '0.55rem 1.2rem',
          background: 'var(--teal)', color: '#fff', border: 'none',
          borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
        }}>
          Check
        </button>
      )}

      {revealed && (
        <div>
          <InsightBox>
            DAU = New + Retained + Resurrected − Churned. This decomposition immediately tells you whether the drop is an acquisition problem, a retention problem, a resurrection problem, or a churn spike — four different diagnoses with four different fixes. Never say "DAU dropped" without this breakdown.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module rf03: Data Quality First ────────────────────────────────────────
function Module_RF03({ onComplete }) {
  const QUESTIONS = [
    {
      q: 'You notice a 40% drop in session_start events on Android. iOS is flat. What do you check first?',
      options: [
        { label: 'A. Check if we shipped a product change to Android last week', correct: false },
        { label: 'B. Check if the Android SDK version or tracking library changed', correct: true },
        { label: 'C. Check if the latest Android OS update restricted background event permissions', correct: false },
        { label: 'D. Check if a data pipeline partition filter accidentally excluded Android rows', correct: false },
      ],
      explanation: 'Platform-specific drops (Android only, iOS flat) almost always indicate an SDK or tracking change, not a product problem. Both C and D are plausible data quality hypotheses — but an OS permission change (C) affects multiple apps system-wide, and you\'d expect broader event degradation. A pipeline partition error (D) would not be Android-specific unless the schema change was tied to a device field. The SDK version or tracking library is the most targeted, most verifiable cause. Data quality is the first hypothesis — and it\'s cheap to rule out.',
    },
    {
      q: 'Revenue per user drops 25% but order count is flat and AOV is flat. What is most likely?',
      options: [
        { label: 'A. A new user acquisition campaign inflated the user count in the denominator without corresponding spend', correct: false },
        { label: 'B. A data pipeline aggregation bug is double-counting orders in the denominator', correct: true },
        { label: 'C. A new cohort of lower-value users joined last week', correct: false },
        { label: 'D. Refund volume increased, reducing net revenue in the numerator', correct: false },
      ],
      explanation: 'If RPU drops but both order count and AOV are flat, the ratio arithmetic is broken — there is no legitimate business explanation. Option A (new users without spend) would inflate the denominator but would also show as a user count spike in the data. Option C (lower-value cohort) would show in AOV or order count. Option D (refunds) would show in net revenue but would not leave order count and AOV simultaneously flat. The only explanation that fits is a pipeline bug double-counting the denominator. Data quality first.',
    },
  ];

  const _saved03 = useMemo(function() { return loadRCAState('rf03'); }, []);
  const [answers, setAnswers] = useState(function() { return _saved03 && _saved03.answers ? _saved03.answers : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved03 && _saved03.revealed ? _saved03.revealed : {}; });

  useEffect(function() { saveRCAState('rf03', { answers: answers, revealed: revealed }); }, [answers, revealed]);

  function select(qi, oi) {
    if (revealed[qi]) return;
    setAnswers(prev => ({ ...prev, [qi]: oi }));
  }

  function check(qi) {
    setRevealed(prev => ({ ...prev, [qi]: true }));
  }

  const allDone = QUESTIONS.every((_, i) => revealed[i]);

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        The first question in any RCA is not "what changed in the product?" — it is "is the data real?" SDK bugs, pipeline failures, and instrumentation gaps routinely produce false signals. This module trains you to spot those patterns before they send an investigation in the wrong direction.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        Data quality is the first layer of every RCA. These scenarios test whether you apply it correctly.
      </p>

      {QUESTIONS.map((q, qi) => (
        <div key={qi} style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem',
        }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.85rem', lineHeight: 1.5 }}>
            {q.q}
          </div>
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            <strong>What to do:</strong> Pick the single best first action — think about which hypothesis is cheapest to rule out and most likely given the symptom pattern.
          </div>
          {q.options.map((opt, oi) => (
            <MCQOption
              key={oi}
              label={opt.label}
              selected={answers[qi] === oi}
              correct={opt.correct}
              revealed={!!revealed[qi]}
              onClick={() => select(qi, oi)}
            />
          ))}
          {answers[qi] !== undefined && !revealed[qi] && (
            <button onClick={() => check(qi)} style={{
              marginTop: '0.3rem', padding: '0.45rem 1rem',
              background: 'var(--teal)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
            }}>
              Check
            </button>
          )}
          {revealed[qi] && (
            <div style={{
              marginTop: '0.5rem', padding: '0.65rem 0.85rem',
              background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
              borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5,
            }}>
              {q.explanation}
            </div>
          )}
        </div>
      ))}

      {allDone && (
        <div>
          <InsightBox>
            Data quality checks are cheap and fast — SDK version logs, pipeline run history, event count by platform. Always run these before generating product hypotheses. A false positive (treating a tracking bug as a product problem) wastes engineering sprint capacity on a non-issue.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module rf04: Seasonality and External Factors ───────────────────────────
const FACTORS_RF04 = [
  { text: 'Monday — lower engagement vs Friday on a consumer social app', type: 'seasonal', label: 'Day-of-week' },
  { text: 'Thanksgiving week — US DAU spikes for recipe apps', type: 'seasonal', label: 'Holiday' },
  { text: 'Major competitor launches a free tier matching our core features', type: 'external', label: 'Competitor' },
  { text: 'Apple changes App Store search ranking algorithm', type: 'external', label: 'Platform' },
  { text: 'Marketing budget cut 60% in Q4 vs Q3', type: 'external', label: 'Marketing' },
  { text: 'January — fitness app signups spike after New Year resolutions', type: 'seasonal', label: 'Seasonal trend' },
];

function Module_RF04({ onComplete }) {
  const _saved04 = useMemo(function() { return loadRCAState('rf04'); }, []);
  const [factors04] = useState(function() { return _saved04 && _saved04.factors ? _saved04.factors : shuffleArr(FACTORS_RF04); });
  const [selected, setSelected] = useState(function() { return _saved04 && _saved04.selected ? _saved04.selected : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved04 ? !!_saved04.revealed : false; });

  useEffect(function() { saveRCAState('rf04', { factors: factors04, selected: selected, revealed: revealed }); }, [factors04, selected, revealed]);

  function assign(i, type) {
    if (revealed) return;
    setSelected(prev => ({ ...prev, [i]: type }));
  }

  const allAssigned = factors04.every((_, i) => selected[i]);

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        Not every metric movement is caused by the product. Seasonal patterns repeat on a calendar schedule and are detectable with year-over-year comparisons. External factors are one-off market or platform events that require a different kind of awareness. Distinguishing them quickly stops you from filing a bug for a holiday.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
        Before diagnosing a product problem, you must rule out time-based and external causes.
        Classify each factor as <strong>Seasonal</strong> (time-based, predictable) or <strong>External</strong> (market/platform, unpredictable):
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> For each factor, click Seasonal or External — ask yourself whether a calendar alone could predict this event, or whether it required something outside your control to happen.
      </div>

      {factors04.map((f, i) => {
        const sel = selected[i];
        const correct = f.type;
        let rowBg = 'var(--surface-2)';
        if (revealed) {
          rowBg = sel === correct ? 'var(--teal-bg)' : 'var(--red-bg)';
        }
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.65rem 0.9rem', marginBottom: '0.5rem',
            background: rowBg, border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text)', minWidth: 160 }}>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 3, padding: '0.1rem 0.35rem', marginRight: '0.5rem',
              }}>
                {f.label}
              </span>
              {f.text}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
              {['seasonal', 'external'].map(type => (
                <button key={type} onClick={() => assign(i, type)} disabled={revealed} style={{
                  padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 600,
                  borderRadius: 'var(--radius-sm)', cursor: revealed ? 'default' : 'pointer',
                  background: sel === type ? (revealed ? (sel === correct ? 'var(--teal)' : 'var(--red)') : 'var(--teal)') : 'var(--surface)',
                  color: sel === type ? '#fff' : 'var(--text-muted)',
                  border: '1px solid ' + (sel === type ? (revealed ? (sel === correct ? 'var(--teal-border)' : 'var(--red-border)') : 'var(--teal-border)') : 'var(--border)'),
                }}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {!revealed && allAssigned && (
        <button onClick={() => setRevealed(true)} style={{
          marginTop: '0.75rem', padding: '0.55rem 1.2rem',
          background: 'var(--teal)', color: '#fff', border: 'none',
          borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
        }}>
          Check
        </button>
      )}

      {revealed && (
        <div>
          <InsightBox>
            Seasonal factors are predictable from the calendar — build YoY and WoW comparisons into your default dashboards so you never mistake a holiday spike for a product win. External factors are unpredictable — maintain a "competitor intelligence" log so recent launches are the first thing you check when a drop appears.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module rf05: When the Aggregate Lies ───────────────────────────────────
function Module_RF05({ onComplete }) {
  const EXISTING_RETENTION = 38;
  const CAMPAIGN_RETENTION = 14;
  const BASELINE_NEW_PCT = 18;

  const _saved05 = useMemo(function() { return loadRCAState('rf05'); }, []);
  const [newUserPct, setNewUserPct] = useState(function() { return _saved05 && _saved05.newUserPct != null ? _saved05.newUserPct : BASELINE_NEW_PCT; });
  const [mcqSel, setMcqSel] = useState(function() { return _saved05 && _saved05.mcqSel != null ? _saved05.mcqSel : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved05 ? !!_saved05.mcqRevealed : false; });

  const existingPct = 100 - newUserPct;
  const aggregate = Math.round((existingPct / 100) * EXISTING_RETENTION + (newUserPct / 100) * CAMPAIGN_RETENTION);
  const baselineAggregate = Math.round((82 / 100) * EXISTING_RETENTION + (18 / 100) * CAMPAIGN_RETENTION);

  const barWidth = 260;
  const retMax = 45;

  function retToX(r) { return (r / retMax) * barWidth; }

  const options = [
    { label: 'A. Retained users from the previous cohort are churning faster — investigate product quality in each market', correct: false },
    { label: 'B. The new acquisition cohort has lower baseline retention, pulling the aggregate down (mix shift)', correct: true },
    { label: 'C. A new geography was added to the aggregate with structurally lower retention, diluting the overall rate', correct: false },
    { label: 'D. D7 retention calculation is incorrect — check the pipeline', correct: false },
  ];

  useEffect(function() { saveRCAState('rf05', { newUserPct: newUserPct, mcqSel: mcqSel, mcqRevealed: mcqRevealed }); }, [newUserPct, mcqSel, mcqRevealed]);

  const sliderInteracted = newUserPct !== BASELINE_NEW_PCT;

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        Aggregate metrics can move in the wrong direction even when every individual segment is healthy. Move the slider below and watch what happens to overall D7 retention — without touching either segment.
      </p>

      {/* ── Interactive playground ── */}
      <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
          Mix-shift playground
        </div>

        {/* Slider */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Campaign users as % of DAU
            </label>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: newUserPct > 35 ? 'var(--red)' : 'var(--text)', minWidth: '3rem', textAlign: 'right' }}>
              {newUserPct}%
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={80}
            step={1}
            value={newUserPct}
            onChange={e => setNewUserPct(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--teal)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>5% (normal)</span>
            <span>80% (aggressive campaign)</span>
          </div>
        </div>

        {/* Retention bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
          {[
            { label: 'Existing user D7', value: EXISTING_RETENTION, color: 'var(--teal)', stable: true },
            { label: 'Campaign cohort D7', value: CAMPAIGN_RETENTION, color: 'var(--accent)', stable: true },
            { label: 'Overall D7 (aggregate)', value: aggregate, color: aggregate < baselineAggregate - 1 ? 'var(--red)' : 'var(--teal)', stable: false, highlight: true },
          ].map((row, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', minWidth: 170 }}>{row.label}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: row.highlight ? 800 : 600, color: row.color, minWidth: '2.5rem' }}>
                  {row.value}%
                </span>
                {row.stable && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>unchanged</span>}
                {row.highlight && aggregate !== baselineAggregate && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: aggregate < baselineAggregate ? 'var(--red)' : 'var(--teal)' }}>
                    {aggregate < baselineAggregate ? '↓ ' + (baselineAggregate - aggregate) + 'pp' : '↑ ' + (aggregate - baselineAggregate) + 'pp'}
                  </span>
                )}
              </div>
              <div style={{ height: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 5,
                  width: retToX(row.value) + 'px',
                  background: row.color,
                  transition: 'width 0.2s, background 0.2s',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Segments composition bar */}
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
            DAU composition
          </div>
          <div style={{ display: 'flex', height: 14, borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ width: existingPct + '%', background: 'var(--teal)', transition: 'width 0.2s' }} />
            <div style={{ width: newUserPct + '%', background: 'var(--accent)', transition: 'width 0.2s' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--teal)' }}>■ Existing {existingPct}%</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>■ Campaign {newUserPct}%</span>
          </div>
        </div>

        {sliderInteracted && (
          <div style={{ marginTop: '0.9rem', padding: '0.6rem 0.85rem', background: aggregate < baselineAggregate - 1 ? 'var(--red-bg)' : 'var(--teal-bg)', border: '1px solid ' + (aggregate < baselineAggregate - 1 ? 'var(--red-border)' : 'var(--teal-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: aggregate < baselineAggregate - 1 ? 'var(--red)' : 'var(--teal)', lineHeight: 1.5 }}>
            {aggregate < baselineAggregate - 1
              ? 'Aggregate fell to ' + aggregate + '% — but both segments are unchanged. The drop is caused entirely by the mix shift, not product quality.'
              : 'Aggregate is close to baseline — the mix is similar to normal.'}
          </div>
        )}
      </div>

      {/* Insight callout — revealed after slider interaction */}
      {sliderInteracted && (
        <div style={{
          borderLeft: '3px solid var(--discovery, #E8A033)',
          background: 'rgba(232,160,51,0.07)',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          padding: '0.75rem 1rem', marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: '0.3rem' }}>Key observation</div>
          <div style={{ fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>
            Neither segment retention changed. Existing users still retain at {EXISTING_RETENTION}%. Campaign users still retain at {CAMPAIGN_RETENTION}%. The aggregate fell purely because the user mix shifted — this is Simpson&apos;s Paradox in action.
          </div>
        </div>
      )}

      {/* MCQ — show after slider has been interacted with */}
      {sliderInteracted && (
        <div>
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            <strong>What to do:</strong> Based on what the playground showed you, pick the correct explanation for the aggregate D7 drop.
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.85rem' }}>
            A fitness app&apos;s overall D7 retention drops from 32% to 28% after a major acquisition campaign. What explains it?
          </div>
          {options.map((opt, i) => (
            <MCQOption
              key={i}
              label={opt.label}
              selected={mcqSel === i}
              correct={opt.correct}
              revealed={mcqRevealed}
              onClick={() => !mcqRevealed && setMcqSel(i)}
            />
          ))}
          {mcqSel !== null && !mcqRevealed && (
            <button onClick={() => setMcqRevealed(true)} style={{
              marginTop: '0.5rem', padding: '0.5rem 1.1rem',
              background: 'var(--teal)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            }}>Check</button>
          )}
          {mcqRevealed && (
            <div>
              <div style={{
                marginTop: '0.5rem', padding: '0.65rem 0.85rem',
                background: options[mcqSel]?.correct ? 'var(--teal-bg)' : 'var(--red-bg)',
                border: '1px solid ' + (options[mcqSel]?.correct ? 'var(--teal-border)' : 'var(--red-border)'),
                borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
              }}>
                When you run a large acquisition campaign, you add a wave of users who have not yet proven they will retain. The aggregate D7 retention drops not because existing users retained less, but because the mix shifted toward a lower-retaining cohort. Always segment by acquisition cohort before concluding there is a product problem.
              </div>
              <InsightBox>
                Mix shifts are the silent killer of aggregate metrics. When your user composition changes — more new users, more mobile users, more low-intent users — the aggregate moves even if every segment is healthy. The fix: always segment by cohort vintage, platform, and acquisition channel before raising an alarm.
              </InsightBox>
              <NextBtn onClick={onComplete} label="Complete module →" />
            </div>
          )}
        </div>
      )}

      {!sliderInteracted && (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.5rem' }}>
          Move the slider above to see what happens to the aggregate — then the follow-up question unlocks.
        </p>
      )}
    </div>
  );
}

/// ── Module rf06: From Diagnosis to Recommendation ──────────────────────────

const BLUF_FIELDS_RF06 = [
  {
    field: 'Primary cause is',
    options: [
      { label: 'iOS users are less engaged following our recent product changes — investigate all Nov release changes', correct: false },
      { label: 'The Nov 3rd push notification permission prompt change — opt-in rate dropped 27pp (61%→34%), confirmed by segment analysis showing 22pp lower D7 retention for non-opted-in users', correct: true },
      { label: 'An unidentified iOS release change caused a 6pp D7 retention drop across all users', correct: false },
    ],
    explanation: 'A BLUF cause statement names the specific mechanism, not just the symptom. The correct answer identifies the exact change, the exact metric impact on opt-in rate, and the confirmation method. "Something changed" is a symptom description, not a root cause.',
  },
  {
    field: 'Confidence level',
    options: [
      { label: 'Low — more investigation needed before conclusions can be drawn', correct: false },
      { label: 'High — segment analysis directly confirms the retention gap correlates with opt-in status, and the timing aligns exactly with the Nov 3rd deploy', correct: true },
      { label: 'Medium — correlation is clear but causation requires a prospective A/B test to confirm', correct: false },
    ],
    explanation: 'When direct segment evidence aligns with timing evidence, confidence is high. "Medium" is for circumstantial evidence. A/B testing is for measuring effects prospectively — not for confirming a past root cause that already has segment-level confirmation.',
  },
  {
    field: 'Business impact',
    options: [
      { label: 'Significant — a large number of users are experiencing degraded retention', correct: false },
      { label: 'Approximately 2.1M iOS users affected; non-opted-in users show 22pp lower D7 retention (10% vs 32%)', correct: true },
      { label: 'D7 retention dropped 6pp overall — from 38% to 32%', correct: false },
    ],
    explanation: 'Business impact must be quantified. "Significant" is not a number. Option C gives the aggregate drop but not the causal segment breakdown. The correct answer gives both the affected population size and the mechanism — the two pieces a decision-maker needs.',
  },
  {
    field: 'Recommended action',
    options: [
      { label: 'Investigate why iOS users are disabling push notifications and address the underlying cause', correct: false },
      { label: 'Revert notification prompt to control copy by Nov 7th (iOS team owner); design a softer permission request flow for Q1 A/B test', correct: true },
      { label: 'Pause all iOS feature releases until retention recovers to baseline', correct: false },
    ],
    explanation: 'A recommendation must be specific (what), time-bound (by when), and owned (by whom). "Investigate" is analysis, not a recommendation — the cause is already confirmed. Pausing all iOS releases is disproportionate to a single prompt copy change.',
  },
  {
    field: 'Open risk',
    options: [
      { label: 'None — the cause is confirmed and the fix is targeted', correct: false },
      { label: 'If the same prompt ships to Android in the upcoming release, the same opt-in drop may occur before the fix is validated', correct: true },
      { label: 'Users may permanently churn due to the retention degradation over the past week', correct: false },
    ],
    explanation: 'An open risk is something that could worsen the situation or invalidate your conclusion despite the fix. "None" is always overconfident. The Android risk is specific and immediately actionable — block the prompt from the Android release. Churn risk is real but not specific to the fix decision.',
  },
];

function Module_RF06({ onComplete }) {
  const STEPS = [
    { id: 'what',    label: '1. What dropped',        example: 'D7 retention dropped 6pp (38% → 32%) in the week of Nov 4th, affecting iOS users only.' },
    { id: 'why',     label: '2. Root cause + evidence', example: 'The Nov 3rd iOS push notification permission prompt change reduced opt-in rate from 61% to 34%. Users who disabled notifications have 22pp lower D7 retention (confirmed in segment analysis).' },
    { id: 'fix',     label: '3. Proposed fix + owner', example: 'Revert the prompt copy to the control version (ETA: 2 days, owner: iOS team). Test a softer permission request flow in Q1.' },
    { id: 'measure', label: '4. How we measure success', example: 'Push opt-in rate back to >55% within 2 weeks. D7 retention recovery to >36% within 30 days for the affected cohort.' },
    { id: 'monitor', label: '5. Ongoing monitoring',   example: 'Weekly alert if push opt-in rate drops >5pp from baseline. Add to the iOS release checklist: verify notification opt-in rate 48h post-release.' },
  ];

  const _saved06 = useMemo(function() { return loadRCAState('rf06'); }, []);
  const [current, setCurrent] = useState(function() { return _saved06 && _saved06.current != null ? _saved06.current : 0; });
  const [seen, setSeen] = useState(function() { return new Set(_saved06 && _saved06.seen ? _saved06.seen : []); });
  const [blufAnswers, setBlufAnswers] = useState(function() { return _saved06 && _saved06.blufAnswers ? _saved06.blufAnswers : {}; });
  const [blufRevealed, setBlufRevealed] = useState(function() { return _saved06 && _saved06.blufRevealed ? _saved06.blufRevealed : {}; });

  useEffect(function() { saveRCAState('rf06', { current: current, seen: Array.from(seen), blufAnswers: blufAnswers, blufRevealed: blufRevealed }); }, [current, seen, blufAnswers, blufRevealed]);

  function advance() {
    setSeen(prev => new Set([...prev, current]));
    if (current < STEPS.length - 1) {
      setCurrent(current + 1);
    }
  }

  const allSeen = seen.size >= STEPS.length - 1;

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        Finding the root cause is only half the job. A complete RCA output includes a precise description of what happened, the evidence-backed cause, a concrete fix with an owner, a pre-committed success metric, and an ongoing monitoring plan. Most analysts stop at step two — this module walks you through all five.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
        A complete RCA has 5 components. Walk through each one — many analysts stop at diagnosis and skip the recommendation structure.
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Read the example for the active step and think about how you would write this section for a real investigation — then click Next component to advance through all five steps.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {STEPS.map((step, i) => {
          const isActive = i === current;
          const isDone = seen.has(i);
          return (
            <div key={step.id} style={{
              border: '1.5px solid ' + (isActive ? 'var(--teal-border)' : isDone ? 'var(--border)' : 'var(--border)'),
              borderRadius: 'var(--radius-sm)',
              background: isActive ? 'var(--teal-bg)' : isDone ? 'var(--surface-2)' : 'var(--surface)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '0.7rem 1rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: isDone ? 'var(--teal)' : isActive ? 'var(--teal-bg)' : 'var(--surface-2)',
                  border: '2px solid ' + (isDone ? 'var(--teal)' : isActive ? 'var(--teal-border)' : 'var(--border)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800,
                  color: isDone ? '#fff' : isActive ? 'var(--teal)' : 'var(--text-muted)',
                }}>
                  {isDone ? '✓' : i + 1}
                </div>
                <span style={{
                  fontWeight: isActive ? 700 : 600, fontSize: '0.88rem',
                  color: isActive ? 'var(--teal)' : isDone ? 'var(--text-muted)' : 'var(--text)',
                }}>
                  {step.label}
                </span>
              </div>
              {isActive && (
                <div style={{ padding: '0 1rem 1rem' }}>
                  <div style={{
                    fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem',
                    marginBottom: '0.75rem', fontStyle: 'italic',
                  }}>
                    Example: {step.example}
                  </div>
                  <button onClick={advance} style={{
                    padding: '0.45rem 1rem',
                    background: 'var(--teal)', color: '#fff', border: 'none',
                    borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                  }}>
                    {i < STEPS.length - 1 ? 'Next component →' : 'Done'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allSeen && (
        <div>
          <InsightBox>
            Steps 4 and 5 are what separate junior analysts from senior ones. Anyone can find the root cause. The senior move is pre-committing to a success metric (step 4) — so you know if the fix worked — and adding monitoring (step 5) — so the problem cannot silently recur without being caught.
          </InsightBox>

          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              BLUF Practice — Write the conclusion
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.6rem' }}>
              BLUF (Bottom Line Up Front) is how senior analysts close an RCA — a single structured paragraph that gives a decision-maker everything they need. Using the iOS scenario above, select the correct phrasing for each of the five fields.
            </p>
            <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '1rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
              <strong>What to do:</strong> Click the option that a senior analyst would write for each field — wrong options represent common framing mistakes.
            </div>

            {BLUF_FIELDS_RF06.map(function(field, fi) {
              var ans = blufAnswers[fi];
              var isRevealed = !!blufRevealed[fi];
              return (
                <div key={fi} style={{ marginBottom: '1rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.55rem' }}>
                    {field.field}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {field.options.map(function(opt, oi) {
                      var isSelected = ans === oi;
                      var isCorrect = opt.correct;
                      var bg = 'var(--surface)';
                      var border = 'var(--border)';
                      var color = 'var(--text)';
                      if (isRevealed && isSelected && isCorrect) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
                      else if (isRevealed && isSelected && !isCorrect) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
                      else if (isRevealed && !isSelected && isCorrect) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
                      return (
                        <button
                          key={oi}
                          onClick={function() {
                            if (isRevealed) return;
                            setBlufAnswers(function(prev) { var n = Object.assign({}, prev); n[fi] = oi; return n; });
                            setBlufRevealed(function(prev) { var n = Object.assign({}, prev); n[fi] = true; return n; });
                          }}
                          style={{
                            textAlign: 'left', width: '100%', padding: '0.6rem 0.8rem',
                            background: bg, border: '1.5px solid ' + border,
                            borderRadius: 'var(--radius-sm)', color: color,
                            fontSize: '0.84rem', lineHeight: 1.5,
                            cursor: isRevealed ? 'default' : 'pointer',
                            transition: 'all 0.1s',
                            fontWeight: (isRevealed && isCorrect) ? 600 : 400,
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {isRevealed && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55, marginTop: '0.65rem', fontStyle: 'italic' }}>
                      {field.explanation}
                    </div>
                  )}
                </div>
              );
            })}

            {Object.keys(blufAnswers).length >= BLUF_FIELDS_RF06.length && (
              <div>
                <InsightBox>
                  The BLUF template — cause, confidence, impact, action, open risk — forces completeness. Most RCAs end at "we found the bug." BLUF adds the business translation and the forward commitment. That is what makes an RCA actionable rather than just documented.
                </InsightBox>
                <NextBtn onClick={onComplete} label="Complete module →" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── SVG Metric Tree component ───────────────────────────────────────────────
function MetricTree({ highlighted }) {
  const nodes = [
    { id: 'dau',   label: 'DAU', x: 200, y: 20,  w: 80,  color: 'var(--teal)',   desc: null },
    { id: 'new',   label: 'New users', x: 60,  y: 100, w: 100, color: 'var(--teal)',   desc: '= New installs × Activation rate' },
    { id: 'ret',   label: 'Retained', x: 190, y: 100, w: 100, color: 'var(--accent)', desc: '= Day-N users × Retention rate' },
    { id: 'res',   label: 'Resurrected', x: 320, y: 100, w: 110, color: 'var(--purple)', desc: '= Lapsed users × Re-engagement rate' },
    { id: 'inst',  label: 'Installs', x: 20,  y: 190, w: 80,  color: 'var(--teal)',   desc: 'App store + referral + paid' },
    { id: 'activ', label: 'Activation %', x: 110, y: 190, w: 95,  color: 'var(--teal)',   desc: 'Users who complete onboarding' },
    { id: 'dayn',  label: 'Day-N users', x: 175, y: 190, w: 95,  color: 'var(--accent)', desc: 'Cohort that reached Day-N' },
    { id: 'retpct',label: 'Retention %', x: 280, y: 190, w: 90,  color: 'var(--accent)', desc: 'Rate of returning after Day-N' },
  ];

  const edges = [
    ['dau', 'new'], ['dau', 'ret'], ['dau', 'res'],
    ['new', 'inst'], ['new', 'activ'],
    ['ret', 'dayn'], ['ret', 'retpct'],
  ];

  const H = 250;
  const nodeH = 28;

  function cx(n) { return n.x + n.w / 2; }
  function cy(n, row) { return n.y + nodeH / 2; }

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  return (
    <svg viewBox={'0 0 420 ' + H} style={{ width: '100%', display: 'block', overflow: 'visible' }}>
      {/* Edges */}
      {edges.map(([from, to]) => {
        const fn = nodeMap[from];
        const tn = nodeMap[to];
        const x1 = cx(fn); const y1 = fn.y + nodeH;
        const x2 = cx(tn); const y2 = tn.y;
        const my = (y1 + y2) / 2;
        return (
          <path
            key={from + '-' + to}
            d={'M ' + x1 + ' ' + y1 + ' C ' + x1 + ' ' + my + ' ' + x2 + ' ' + my + ' ' + x2 + ' ' + y2}
            fill="none"
            stroke={highlighted === tn.id ? tn.color : 'var(--border-strong)'}
            strokeWidth={highlighted === tn.id ? 2 : 1.5}
            strokeDasharray={highlighted === tn.id ? 'none' : '4,2'}
            opacity={highlighted && highlighted !== tn.id && highlighted !== fn.id ? 0.3 : 1}
          />
        );
      })}
      {/* Nodes */}
      {nodes.map(n => {
        const isHL = highlighted === n.id;
        const isDim = highlighted && !isHL && n.id !== 'dau';
        return (
          <g key={n.id} opacity={isDim ? 0.3 : 1}>
            <rect
              x={n.x} y={n.y} width={n.w} height={nodeH} rx={5}
              fill={isHL ? n.color : 'var(--surface-2)'}
              stroke={isHL ? n.color : 'var(--border)'}
              strokeWidth={isHL ? 2 : 1}
            />
            <text
              x={n.x + n.w / 2} y={n.y + nodeH / 2 + 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight={isHL ? '700' : '400'}
              fill={isHL ? '#fff' : 'var(--text-secondary)'}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Module rf07: Metric Tree Construction ──────────────────────────────────

const RF07_QUESTIONS = [
  {
    id: 'q1',
    prompt: 'DAU fell 15%. Your metric tree shows: New users -2%, Retained users -18%, Resurrected users -5%. Where do you focus first?',
    options: [
      'New users — a new-user drop compounds over time as each cohort feeds future retained users',
      'Retained users — the largest absolute contributor to the drop',
      'Resurrected users — re-engagement is cheapest to fix',
      'All three equally — you cannot prioritize without more data',
    ],
    correct: 'Retained users — the largest absolute contributor to the drop',
    explanation: 'Retained users make up the bulk of DAU at any mature product. An 18% drop in that branch dwarfs the 2% new-user fall in absolute terms. The tree tells you where the mass is — always start with the branch whose absolute contribution is largest.',
  },
  {
    id: 'q2',
    prompt: 'Retained users = Day-N users x Retention rate. Retention rate held completely flat. What does that tell you?',
    options: [
      'The product is fine — retention held, so the issue is external',
      'The issue is in the denominator — fewer users reached Day-N, meaning the new-user cohort from N days ago was smaller or lower quality',
      'The issue is in the numerator — active retained users dropped',
      'Retention rate and Day-N users both moved but offset each other',
    ],
    correct: 'The issue is in the denominator — fewer users reached Day-N, meaning the new-user cohort from N days ago was smaller or lower quality',
    explanation: 'If Retained users = Day-N users x Retention rate, and Retention rate is flat, then the only explanation is that Day-N users fell. That points backward in time — the new-user cohort that should have reached Day-N was smaller or churned before reaching it. The current product experience is not the problem; acquisition quality from N days ago is.',
  },
  {
    id: 'q3',
    prompt: 'Which of the following would NOT appear in a DAU metric tree?',
    options: [
      'Day-7 retention rate',
      'New installs converting to activated users',
      'Revenue per user',
      'Resurrected user count',
    ],
    correct: 'Revenue per user',
    explanation: 'Revenue per user belongs in a revenue tree, not a DAU tree. DAU = New users + Retained users + Resurrected users, decomposed further by activation, retention, and re-engagement rates. Revenue is a separate dimension. A common interview mistake is conflating engagement trees with monetization trees.',
  },
];

// Question-to-highlighted-node mapping
const RF07_HIGHLIGHT = { q1: 'ret', q2: 'dayn', q3: null };

function Module_RF07({ onComplete }) {
  const _saved07 = useMemo(function() { return loadRCAState('rf07'); }, []);
  const [qIdx, setQIdx] = useState(function() { return _saved07 && _saved07.qIdx != null ? _saved07.qIdx : 0; });
  const [selections, setSelections] = useState(function() { return _saved07 && _saved07.selections ? _saved07.selections : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved07 && _saved07.revealed ? _saved07.revealed : {}; });

  useEffect(function() { saveRCAState('rf07', { qIdx: qIdx, selections: selections, revealed: revealed }); }, [qIdx, selections, revealed]);

  const currentQ = RF07_QUESTIONS[qIdx];
  const currentSelected = selections[currentQ.id] || null;
  const currentRevealed = revealed[currentQ.id] || false;
  const allDone = qIdx >= RF07_QUESTIONS.length - 1 && currentRevealed;
  const highlightNode = RF07_HIGHLIGHT[currentQ.id] || null;

  function handleSelect(opt) {
    if (!currentRevealed) {
      setSelections(function(prev) {
        const next = Object.assign({}, prev);
        next[currentQ.id] = opt;
        return next;
      });
    }
  }

  function handleCheck() {
    if (currentSelected !== null) {
      setRevealed(function(prev) {
        const next = Object.assign({}, prev);
        next[currentQ.id] = true;
        return next;
      });
    }
  }

  function handleNext() {
    if (qIdx < RF07_QUESTIONS.length - 1) setQIdx(qIdx + 1);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
        A metric tree makes RCA exhaustive — every drop lives in exactly one branch. The tree below is live: the highlighted node shows which branch each question is about. Answer each question, then advance.
      </p>

      {/* Live SVG tree */}
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          DAU metric tree — highlighted node is the focus of the current question
        </div>
        <MetricTree highlighted={highlightNode} />
        {highlightNode && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {highlightNode === 'ret' && 'Current focus: Retained users branch'}
            {highlightNode === 'dayn' && 'Current focus: Day-N users (the denominator of the Retained branch)'}
          </div>
        )}
      </div>

      {/* Question card */}
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Read the tree, then select the best answer — advance through all three questions before completing.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Question {qIdx + 1} of {RF07_QUESTIONS.length}
          </div>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {RF07_QUESTIONS.map(function(_q, i) {
              return (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i < qIdx || (i === qIdx && currentRevealed) ? 'var(--teal)' : i === qIdx ? 'var(--teal-border)' : 'var(--border)',
                }} />
              );
            })}
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          {currentQ.prompt}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
          {currentQ.options.map(function(opt) {
            return (
              <MCQOption
                key={opt}
                label={opt}
                selected={currentSelected === opt}
                correct={opt === currentQ.correct}
                revealed={currentRevealed}
                onClick={function() { handleSelect(opt); }}
              />
            );
          })}
        </div>

        {!currentRevealed && (
          <button
            onClick={handleCheck}
            disabled={currentSelected === null}
            style={{
              padding: '0.5rem 1.1rem', borderRadius: 'var(--radius-sm)', border: 'none',
              background: currentSelected !== null ? 'var(--teal)' : 'var(--border)',
              color: currentSelected !== null ? '#fff' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.85rem',
              cursor: currentSelected !== null ? 'pointer' : 'default',
            }}
          >Check answer</button>
        )}

        {currentRevealed && (
          <div className="pal-reveal-in" style={{
            marginTop: '0.75rem',
            background: currentSelected === currentQ.correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (currentSelected === currentQ.correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
            fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55,
          }}>
            <strong>{currentSelected === currentQ.correct ? 'Correct. ' : 'Not quite. '}</strong>{currentQ.explanation}
          </div>
        )}

        {currentRevealed && qIdx < RF07_QUESTIONS.length - 1 && (
          <button
            onClick={handleNext}
            style={{
              marginTop: '0.85rem', padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--teal)', color: '#fff',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            }}
          >Next question →</button>
        )}
      </div>

      {allDone && (
        <div>
          <InsightBox>
            A metric tree forces you to be exhaustive: DAU = New + Retained + Resurrected. Every drop lives in exactly one branch. Without the tree, analysts chase symptoms — spending hours on a leaf node when the trunk is the problem. Drawing one live in an interview signals senior analytical thinking immediately.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module rf08: SQL Diagnosis Patterns ────────────────────────────────────
function Module_RF08({ onComplete }) {
  const STEPS = [
    {
      label: 'Query 1: Time-series event count by day',
      query: 'SELECT DATE(event_time) AS day, COUNT(*) AS events\nFROM events\nWHERE event_name = \'checkout_complete\'\n  AND event_time >= CURRENT_DATE - 21\nGROUP BY 1\nORDER BY 1;',
      headers: ['day', 'events'],
      rows: [
        ['2024-03-10', '4210'], ['2024-03-11', '4180'], ['2024-03-12', '4225'],
        ['2024-03-13', '4190'], ['2024-03-14', '4150'], ['2024-03-15', '2540'],
        ['2024-03-16', '2510'], ['2024-03-17', '2490'], ['2024-03-18', '2520'],
        ['2024-03-19', '2535'],
      ],
      highlight: [5, 6, 7, 8, 9],
      finding: 'Drop begins abruptly on day 15 (Mar 15). Event counts halve overnight — this is a step change, not a gradual trend.',
    },
    {
      label: 'Query 2: Platform split',
      query: 'SELECT platform, DATE(event_time) AS day, COUNT(*) AS events\nFROM events\nWHERE event_name = \'checkout_complete\'\n  AND event_time >= CURRENT_DATE - 7\nGROUP BY 1, 2\nORDER BY 2, 1;',
      headers: ['platform', 'day', 'events'],
      rows: [
        ['android', '2024-03-14', '1940'], ['ios', '2024-03-14', '2210'],
        ['android', '2024-03-15', '1920'], ['ios', '2024-03-15', '620'],
        ['android', '2024-03-16', '1910'], ['ios', '2024-03-16', '600'],
        ['android', '2024-03-17', '1935'], ['ios', '2024-03-17', '555'],
      ],
      highlight: [3, 5, 7],
      finding: 'iOS drops from ~2,200 to ~600 on Mar 15. Android is completely stable. This is a platform-specific signal — points toward SDK change or iOS app release.',
    },
    {
      label: 'Query 3: Year-over-year comparison',
      query: 'SELECT DATE(event_time) AS day,\n       COUNT(*) AS events_this_year,\n       LAG(COUNT(*), 365) OVER (ORDER BY DATE(event_time)) AS events_last_year\nFROM events\nWHERE event_name = \'checkout_complete\'\nGROUP BY 1\nORDER BY 1 DESC\nLIMIT 10;',
      headers: ['day', 'this year', 'last year'],
      rows: [
        ['2024-03-19', '2535', '2498'], ['2024-03-18', '2520', '2470'],
        ['2024-03-17', '2490', '4320'], ['2024-03-16', '2510', '4290'],
        ['2024-03-15', '2540', '4280'], ['2024-03-14', '4150', '4160'],
        ['2024-03-13', '4190', '4180'], ['2024-03-12', '4225', '4190'],
      ],
      highlight: [2, 3, 4],
      finding: 'Last year on Mar 15-17 the metric was healthy (~4,300). This drop is NOT seasonal — it is a new event starting on exactly Mar 15, 2024.',
    },
  ];

  const RF08_MCQ = {
    question: 'Which of these SQL patterns should you run FIRST in any RCA?',
    options: [
      'Join events to user profiles to identify affected user segments',
      'Time-series the raw event count by day to confirm the drop and identify when it started',
      'Segment the metric by new vs returning users to find which cohort is driving the change',
      'Pull funnel drop-off rates at each step for the affected event',
    ],
    correct: 1,
    explanation: 'Time-series the raw event count by day is always first. It confirms the drop is real (not a dashboard filter issue), shows when it started, and reveals whether it is a step change or a gradual drift — all before you touch more complex joins.',
  };

  const _saved08 = useMemo(function() { return loadRCAState('rf08'); }, []);
  const [step, setStep] = useState(function() { return _saved08 && _saved08.step != null ? _saved08.step : 0; });
  const [ranSteps, setRanSteps] = useState(function() { return _saved08 && _saved08.ranSteps ? _saved08.ranSteps : {}; });
  const [mcqSel, setMcqSel] = useState(function() { return _saved08 && _saved08.mcqSel != null ? _saved08.mcqSel : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved08 ? !!_saved08.mcqRevealed : false; });

  useEffect(function() { saveRCAState('rf08', { step: step, ranSteps: ranSteps, mcqSel: mcqSel, mcqRevealed: mcqRevealed }); }, [step, ranSteps, mcqSel, mcqRevealed]);

  const allStepsRan = STEPS.every((_, i) => ranSteps[i]);

  function runStep(i) {
    setRanSteps(prev => ({ ...prev, [i]: true }));
    if (i < STEPS.length - 1) setStep(i + 1);
  }

  const currentStep = STEPS[step];

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        The first 30 minutes of any RCA follow the same SQL playbook: confirm the signal is real, narrow to a platform or segment, then check whether the pattern has historical precedent. Walk through each query below and read what the output tells you.
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Click Run query to execute each SQL step — read the highlighted rows in the result table and the finding before moving to the next query.
      </div>

      {/* Step tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-sm)',
              border: '1.5px solid ' + (step === i ? 'var(--teal-border)' : (ranSteps[i] ? 'var(--teal-border)' : 'var(--border)')),
              background: step === i ? 'var(--teal-bg)' : (ranSteps[i] ? 'var(--teal-bg)' : 'var(--surface-2)'),
              color: step === i ? 'var(--teal)' : (ranSteps[i] ? 'var(--teal)' : 'var(--text-muted)'),
              fontSize: '0.8rem', fontWeight: step === i ? 700 : 400, cursor: 'pointer',
            }}
          >
            {ranSteps[i] ? 'Query ' + (i + 1) + ' done' : 'Query ' + (i + 1)}
          </button>
        ))}
      </div>

      {/* Query card */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginBottom: '0.85rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.55rem' }}>
          {currentStep.label}
        </div>
        <pre style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
          fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.65,
          overflowX: 'auto', margin: '0 0 0.85rem', whiteSpace: 'pre-wrap',
        }}>{currentStep.query}</pre>

        {ranSteps[step] ? (
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>Result</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    {currentStep.headers.map((h, hi) => (
                      <th key={hi} style={{ textAlign: 'left', padding: '0.35rem 0.6rem', borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentStep.rows.map((row, ri) => {
                    const isHighlighted = currentStep.highlight.indexOf(ri) !== -1;
                    return (
                      <tr key={ri} style={{ background: isHighlighted ? 'var(--red-bg)' : 'transparent' }}>
                        {row.map((cell, ci) => (
                          <td key={ci} style={{ padding: '0.3rem 0.6rem', borderBottom: '1px solid var(--border)', color: isHighlighted ? 'var(--red)' : 'var(--text)', fontWeight: isHighlighted && ci === row.length - 1 ? 700 : 400 }}>{cell}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.9rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.55 }}>
              <strong>Finding:</strong> {currentStep.finding}
            </div>
          </div>
        ) : (
          <button
            onClick={() => runStep(step)}
            style={{
              padding: '0.5rem 1.1rem', borderRadius: 'var(--radius-sm)',
              border: 'none', background: 'var(--teal)', color: '#fff',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            {'Run query ' + (step + 1)}
          </button>
        )}
      </div>

      {/* MCQ after all steps done */}
      {allStepsRan && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            <strong>What to do:</strong> Select the SQL pattern that should always run first in any RCA, then click Check.
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.65rem' }}>{RF08_MCQ.question}</div>
          {RF08_MCQ.options.map((opt, oi) => (
            <MCQOption
              key={oi}
              label={opt}
              selected={mcqSel === oi}
              correct={oi === RF08_MCQ.correct}
              revealed={mcqRevealed}
              onClick={() => !mcqRevealed && setMcqSel(oi)}
            />
          ))}
          {mcqSel !== null && !mcqRevealed && (
            <button
              onClick={() => setMcqRevealed(true)}
              style={{ marginTop: '0.4rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}
            >Check</button>
          )}
          {mcqRevealed && (
            <div>
              <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>
                {RF08_MCQ.explanation}
              </div>
              <InsightBox>
                The three SQL moves — time-series by day, platform split, YoY comparison — are not optional. They confirm the signal is real, narrow the scope, and rule out seasonality. Analysts who skip ahead to complex joins often spend hours diagnosing a logging bug as a product problem.
              </InsightBox>
              <NextBtn onClick={onComplete} label="Complete module →" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Module rf09: Seasonality and Trend Separation ──────────────────────────
function Module_RF09({ onComplete }) {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const THIS_YEAR = [820, 810, 790, 765, 720, 680, 600];
  const LAST_YEAR = [815, 808, 785, 760, 718, 675, 596];

  const RF09_MCQ = {
    question: 'A metric is down 13% WoW. The same metric was also down 13% in the same week last year. What does this most likely indicate?',
    options: [
      'A product regression introduced last week — file a bug immediately',
      'This is a seasonal pattern — investigate YoY, not a product regression',
      'A data pipeline failure — check ingestion logs before drawing any conclusion',
      'A competitor launch — check for external news from the past 7 days',
    ],
    correct: 1,
    explanation: 'When the current drop matches last year\'s drop in the same week, the pattern is almost certainly seasonal. The correct response is to confirm YoY alignment, set a seasonality-adjusted baseline, and close the investigation — not to open a bug or launch an engineering investigation.',
  };

  const _saved09 = useMemo(function() { return loadRCAState('rf09'); }, []);
  const [showYoY, setShowYoY] = useState(function() { return _saved09 ? !!_saved09.showYoY : false; });
  const [mcqSel, setMcqSel] = useState(function() { return _saved09 && _saved09.mcqSel != null ? _saved09.mcqSel : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved09 ? !!_saved09.mcqRevealed : false; });

  useEffect(function() { saveRCAState('rf09', { showYoY: showYoY, mcqSel: mcqSel, mcqRevealed: mcqRevealed }); }, [showYoY, mcqSel, mcqRevealed]);

  // SVG chart constants
  const W = 500;
  const H = 200;
  const PAD_L = 42;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const allVals = THIS_YEAR.concat(LAST_YEAR);
  const minV = Math.min.apply(null, allVals) - 30;
  const maxV = Math.max.apply(null, allVals) + 30;

  function xPos(i) {
    return PAD_L + (i / (DAYS.length - 1)) * chartW;
  }
  function yPos(v) {
    return PAD_T + chartH - ((v - minV) / (maxV - minV)) * chartH;
  }

  function makePath(vals) {
    return vals.map(function(v, i) {
      return (i === 0 ? 'M' : 'L') + xPos(i).toFixed(1) + ',' + yPos(v).toFixed(1);
    }).join(' ');
  }

  const yTicks = [600, 680, 760, 820];

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        Not every week-over-week drop is a product regression. Before raising an alarm, overlay the same metric from the same week last year. If the shapes match, you are looking at a predictable seasonal cycle — not a broken feature.
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Click the Show YoY toggle to overlay last year's data on the chart — compare what changes between the two states and notice whether the shapes match.
      </div>

      {/* Chart */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Daily DAU — current week</div>
          <button
            onClick={() => setShowYoY(function(v) { return !v; })}
            style={{
              padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-sm)',
              border: '1.5px solid ' + (showYoY ? 'var(--accent-border)' : 'var(--border)'),
              background: showYoY ? 'var(--accent-bg)' : 'var(--surface)',
              color: showYoY ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            {showYoY ? 'Hide YoY' : 'Show YoY'}
          </button>
        </div>

        <svg viewBox={'0 0 ' + W + ' ' + H} style={{ width: '100%', maxWidth: W + 'px', display: 'block', overflow: 'visible' }}>
          {/* Y grid + labels */}
          {yTicks.map(function(tick) {
            const y = yPos(tick);
            return (
              <g key={tick}>
                <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke='var(--border)' strokeWidth='1' />
                <text x={PAD_L - 6} y={y + 4} textAnchor='end' fontSize='9' fill='var(--text-muted)'>{tick}</text>
              </g>
            );
          })}
          {/* X labels */}
          {DAYS.map(function(day, i) {
            return (
              <text key={day} x={xPos(i)} y={H - 6} textAnchor='middle' fontSize='9' fill='var(--text-muted)'>{day}</text>
            );
          })}
          {/* YoY line */}
          {showYoY && (
            <g>
              <path d={makePath(LAST_YEAR)} fill='none' stroke='var(--accent)' strokeWidth='2' strokeDasharray='5,3' />
              {LAST_YEAR.map(function(v, i) {
                return <circle key={i} cx={xPos(i)} cy={yPos(v)} r='3.5' fill='var(--accent)' />;
              })}
            </g>
          )}
          {/* Current week line */}
          <path d={makePath(THIS_YEAR)} fill='none' stroke='var(--teal)' strokeWidth='2.5' />
          {THIS_YEAR.map(function(v, i) {
            return <circle key={i} cx={xPos(i)} cy={yPos(v)} r='4' fill='var(--teal)' />;
          })}
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-block', width: 22, height: 3, background: 'var(--teal)', borderRadius: 2 }} />
            Current week
          </div>
          {showYoY && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-block', width: 22, height: 2, background: 'var(--accent)', borderRadius: 2, borderTop: '2px dashed var(--accent)' }} />
              Same week last year
            </div>
          )}
        </div>

        {showYoY && (
          <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.55 }}>
            The two lines are nearly identical. The current week\'s decline mirrors last year\'s pattern almost exactly — this drop is seasonal, not a regression.
          </div>
        )}
      </div>

      {/* MCQ — show after YoY toggled */}
      {showYoY && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            <strong>What to do:</strong> Select the answer that correctly interprets what a matching YoY drop means, then click Check.
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.65rem' }}>{RF09_MCQ.question}</div>
          {RF09_MCQ.options.map(function(opt, oi) {
            return (
              <MCQOption
                key={oi}
                label={opt}
                selected={mcqSel === oi}
                correct={oi === RF09_MCQ.correct}
                revealed={mcqRevealed}
                onClick={function() { if (!mcqRevealed) setMcqSel(oi); }}
              />
            );
          })}
          {mcqSel !== null && !mcqRevealed && (
            <button
              onClick={function() { setMcqRevealed(true); }}
              style={{ marginTop: '0.4rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}
            >Check</button>
          )}
          {mcqRevealed && (
            <div>
              <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>
                {RF09_MCQ.explanation}
              </div>
              <InsightBox>
                WoW comparisons are noisy without a seasonal baseline. Every analyst should have a YoY overlay as a standing check before any RCA escalation. If current week and same week last year are down by the same amount, the product is fine — close the investigation.
              </InsightBox>
              <NextBtn onClick={onComplete} label="Complete module →" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Module rf10: Data Quality First (Advanced) ─────────────────────────────
const SYMPTOMS_RF10 = [
  {
    id: 'A',
    symptom: 'iOS event count drops -40% starting Monday. Android and Web are stable. All event types on iOS are affected equally — session_start, checkout, add_to_cart all down the same proportion.',
    correct: 'SDK change',
    explanation: 'When one platform is uniformly affected across all event types, the instrumentation layer is broken — not a specific feature. SDK updates, library version changes, or OS-level permission changes cause exactly this pattern.',
  },
  {
    id: 'B',
    symptom: 'All platforms show normal event volumes for every event type except checkout_complete, which dropped 90% on Wednesday. session_start, add_to_cart, product_view are all normal.',
    correct: 'Logging bug',
    explanation: 'When a single event type drops across all platforms while all others are healthy, someone broke the specific event\'s instrumentation — a parameter rename, a missing trigger condition, or a typo in the event name.',
  },
  {
    id: 'C',
    symptom: 'All platforms affected, all event types dropped simultaneously at 3:14 AM. Raw table row counts are near zero from 3:14 AM onward. Downstream dashboards show flatlines.',
    correct: 'Pipeline failure',
    explanation: 'A simultaneous drop across all platforms and all events, with near-zero raw table rows, is a data engineering failure — an ingestion job, ETL pipeline, or Kafka consumer stopped processing. No product or SDK change produces this pattern.',
  },
];

function Module_RF10({ onComplete }) {
  const DIAGNOSES = ['SDK change', 'Logging bug', 'Pipeline failure'];
  const DIAGNOSIS_COLORS = {
    'SDK change': { bg: 'var(--yellow-bg)', border: 'var(--yellow-border)', text: 'var(--yellow)' },
    'Logging bug': { bg: 'var(--accent-bg)', border: 'var(--accent-border)', text: 'var(--accent)' },
    'Pipeline failure': { bg: 'var(--red-bg)', border: 'var(--red-border)', text: 'var(--red)' },
  };

  const RF10_MCQ = {
    question: 'Why should data quality be checked before product hypotheses in an RCA?',
    options: [
      'Data quality issues are rare but catastrophic, so they should be ruled out early for safety',
      'Data quality issues are cheap to rule out and are the most common source of false alarms in RCA',
      'Product hypotheses require more data to test, so they naturally come later in the process',
      'Checking data quality first is a political move to protect engineering teams from blame',
    ],
    correct: 1,
    explanation: 'Data quality checks take minutes and are the most frequent cause of false RCA alarms. SDK check logs, pipeline run history, and event counts by platform are fast queries. If you skip to product hypotheses first, you risk pulling engineers into a multi-day investigation for a 5-minute logging fix.',
  };

  const _saved10 = useMemo(function() { return loadRCAState('rf10'); }, []);
  const [symptoms10] = useState(function() { return _saved10 && _saved10.symptoms ? _saved10.symptoms : shuffleArr(SYMPTOMS_RF10); });
  const [selections, setSelections] = useState(function() { return _saved10 && _saved10.selections ? _saved10.selections : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved10 && _saved10.revealed ? _saved10.revealed : {}; });
  const [mcqSel, setMcqSel] = useState(function() { return _saved10 && _saved10.mcqSel != null ? _saved10.mcqSel : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved10 ? !!_saved10.mcqRevealed : false; });

  useEffect(function() { saveRCAState('rf10', { symptoms: symptoms10, selections: selections, revealed: revealed, mcqSel: mcqSel, mcqRevealed: mcqRevealed }); }, [symptoms10, selections, revealed, mcqSel, mcqRevealed]);

  const allCorrect = symptoms10.every(function(s) { return revealed[s.id] && selections[s.id] === s.correct; });
  const allRevealed = symptoms10.every(function(s) { return revealed[s.id]; });

  function selectDiagnosis(symptomId, diagnosis) {
    if (revealed[symptomId]) return;
    setSelections(function(prev) { return Object.assign({}, prev, { [symptomId]: diagnosis }); });
  }

  function checkSymptom(symptomId) {
    setRevealed(function(prev) { return Object.assign({}, prev, { [symptomId]: true }); });
  }

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        Three data quality failure patterns account for the vast majority of false alarms in RCA. Each has a distinct signature. Match each symptom pattern to the correct diagnosis, then check your answer before moving to the next.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {DIAGNOSES.map(function(d) {
          const c = DIAGNOSIS_COLORS[d];
          return (
            <span key={d} style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', background: c.bg, border: '1px solid ' + c.border, color: c.text }}>
              {d}
            </span>
          );
        })}
      </div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> For each symptom pattern, click the diagnosis that fits — an explanation reveals after your selection.
      </div>

      {symptoms10.map(function(s) {
        const sel = selections[s.id];
        const isRevealed = !!revealed[s.id];
        const isCorrect = sel === s.correct;
        return (
          <div key={s.id} style={{
            marginBottom: '1.1rem', background: 'var(--surface-2)', border: '1px solid ' + (isRevealed ? (isCorrect ? 'var(--teal-border)' : 'var(--red-border)') : 'var(--border)'),
            borderRadius: 'var(--radius)', padding: '1rem 1.1rem',
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Symptom {s.id}</div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{s.symptom}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
              {DIAGNOSES.map(function(d) {
                const c = DIAGNOSIS_COLORS[d];
                const isSelected = sel === d;
                const isCorrDiag = d === s.correct;
                let bg = 'var(--surface)';
                let border = 'var(--border)';
                let color = 'var(--text-muted)';
                if (isRevealed) {
                  if (isCorrDiag) { bg = c.bg; border = c.border; color = c.text; }
                  else if (isSelected && !isCorrDiag) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
                } else if (isSelected) {
                  bg = c.bg; border = c.border; color = c.text;
                }
                return (
                  <button
                    key={d}
                    onClick={function() { selectDiagnosis(s.id, d); }}
                    disabled={isRevealed}
                    style={{
                      padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid ' + border, background: bg, color,
                      fontSize: '0.8rem', fontWeight: isSelected || (isRevealed && isCorrDiag) ? 700 : 400,
                      cursor: isRevealed ? 'default' : 'pointer', transition: 'all 0.15s',
                    }}
                  >{d}</button>
                );
              })}
            </div>
            {sel && !isRevealed && (
              <button
                onClick={function() { checkSymptom(s.id); }}
                style={{ padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >Check</button>
            )}
            {isRevealed && (
              <div style={{ marginTop: '0.45rem', padding: '0.55rem 0.8rem', background: isCorrect ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (isCorrect ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: isCorrect ? 'var(--teal)' : 'var(--red)', lineHeight: 1.55 }}>
                <strong>{isCorrect ? 'Correct. ' : 'Incorrect — the answer is ' + s.correct + '. '}</strong>{s.explanation}
              </div>
            )}
          </div>
        );
      })}

      {allRevealed && (
        <div style={{ marginTop: '1.1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.65rem' }}>{RF10_MCQ.question}</div>
          {RF10_MCQ.options.map(function(opt, oi) {
            return (
              <MCQOption
                key={oi}
                label={opt}
                selected={mcqSel === oi}
                correct={oi === RF10_MCQ.correct}
                revealed={mcqRevealed}
                onClick={function() { if (!mcqRevealed) setMcqSel(oi); }}
              />
            );
          })}
          {mcqSel !== null && !mcqRevealed && (
            <button
              onClick={function() { setMcqRevealed(true); }}
              style={{ marginTop: '0.4rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}
            >Check</button>
          )}
          {mcqRevealed && (
            <div>
              <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>
                {RF10_MCQ.explanation}
              </div>
              <InsightBox>
                Platform-specific drops point to SDK. Event-specific drops point to a logging bug. All-platforms, all-events drops point to pipeline failure. These three signatures are learnable in one session and save hours of investigation time in practice.
              </InsightBox>
              <NextBtn onClick={onComplete} label="Complete module →" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Module rf11: External Factor Identification ────────────────────────────
const EVENTS_RF11 = [
  {
    id: 0,
    text: 'DAU drops every Sunday vs Saturday consistently across 12 weeks',
    correct: 'Seasonal',
    explanation: 'Predictable, repeating calendar pattern — day-of-week seasonality. No external event required.',
  },
  {
    id: 1,
    text: 'A competitor launched a feature identical to your core product last Tuesday',
    correct: 'Competitor',
    explanation: 'A one-off market event outside your control. Check product news and app store reviews around the launch date.',
  },
  {
    id: 2,
    text: 'App Store rejected your update last week, reducing new install volume',
    correct: 'Platform',
    explanation: 'A platform policy or review decision — not a product regression, not seasonal. Check your App Store Connect dashboard.',
  },
  {
    id: 3,
    text: 'Central bank raised interest rates — users in your fintech app are reducing discretionary spend',
    correct: 'Macro',
    explanation: 'Macroeconomic shifts affect user behavior across the whole market. No product fix exists — this requires monitoring and potentially an adjusted forecast.',
  },
  {
    id: 4,
    text: 'Revenue drops every December 25-26 on your B2B productivity tool',
    correct: 'Seasonal',
    explanation: 'A predictable holiday pattern. B2B tools always see drops when businesses are closed. Expected and not actionable.',
  },
];

function Module_RF11({ onComplete }) {
  const CATEGORIES = ['Seasonal', 'Competitor', 'Platform', 'Macro'];
  const CAT_COLORS = {
    'Seasonal':   { bg: 'var(--green-bg)',  border: 'var(--green-border)',  text: 'var(--green)' },
    'Competitor': { bg: 'var(--yellow-bg)', border: 'var(--yellow-border)', text: 'var(--yellow)' },
    'Platform':   { bg: 'var(--accent-bg)', border: 'var(--accent-border)', text: 'var(--accent)' },
    'Macro':      { bg: 'var(--red-bg)',    border: 'var(--red-border)',    text: 'var(--red)' },
  };

  const RF11_MCQ = {
    question: 'A major competitor launched a clone of your core feature 3 days before your A/B test result read-out. What should you do?',
    options: [
      'Cancel the experiment — the result is invalid and cannot be trusted',
      'Ignore the competitor launch — A/B randomization protects against external events',
      'Note the confound in the experiment writeup, extend or rerun if the effect was borderline, and treat results with caution',
      'Immediately ship the winning variant before the competitive window closes',
    ],
    correct: 2,
    explanation: 'A competitor launch during an experiment window is a confound — it affects treatment and control differently if it changes user behavior directionally. The correct response is to document it, assess whether the effect size was borderline or decisive, and flag it in the experiment writeup. Do not simply cancel or ignore it.',
  };

  const _saved11 = useMemo(function() { return loadRCAState('rf11'); }, []);
  const [events11] = useState(function() { return _saved11 && _saved11.events ? _saved11.events : shuffleArr(EVENTS_RF11); });
  const [selections, setSelections] = useState(function() { return _saved11 && _saved11.selections ? _saved11.selections : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved11 && _saved11.revealed ? _saved11.revealed : {}; });
  const [mcqSel, setMcqSel] = useState(function() { return _saved11 && _saved11.mcqSel != null ? _saved11.mcqSel : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved11 ? !!_saved11.mcqRevealed : false; });

  useEffect(function() { saveRCAState('rf11', { events: events11, selections: selections, revealed: revealed, mcqSel: mcqSel, mcqRevealed: mcqRevealed }); }, [events11, selections, revealed, mcqSel, mcqRevealed]);

  const allRevealed = events11.every(function(e) { return !!revealed[e.id]; });

  function selectCat(id, cat) {
    if (revealed[id]) return;
    setSelections(function(prev) { return Object.assign({}, prev, { [id]: cat }); });
  }

  function checkEvent(id) {
    setRevealed(function(prev) { return Object.assign({}, prev, { [id]: true }); });
  }

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.1rem' }}>
        External factors explain a large share of metric movements that have no product fix. Classifying them correctly stops engineering teams from chasing non-existent regressions. Classify each event below into one of four categories.
      </p>

      {/* Category legend */}
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {CATEGORIES.map(function(cat) {
          const c = CAT_COLORS[cat];
          return (
            <span key={cat} style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '4px', background: c.bg, border: '1px solid ' + c.border, color: c.text }}>
              {cat}
            </span>
          );
        })}
      </div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> For each event below, select the category that best explains it — Seasonal, Competitor, Platform, or Macro — then click Check to confirm your classification.
      </div>

      {events11.map(function(ev) {
        const sel = selections[ev.id];
        const isRevealed = !!revealed[ev.id];
        const isCorrect = sel === ev.correct;
        return (
          <div key={ev.id} style={{
            marginBottom: '0.9rem', background: 'var(--surface-2)',
            border: '1px solid ' + (isRevealed ? (isCorrect ? 'var(--teal-border)' : 'var(--red-border)') : 'var(--border)'),
            borderRadius: 'var(--radius)', padding: '0.85rem 1rem',
          }}>
            <div style={{ fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '0.65rem' }}>{ev.text}</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {CATEGORIES.map(function(cat) {
                const c = CAT_COLORS[cat];
                const isSelected = sel === cat;
                const isCorrCat = cat === ev.correct;
                let bg = 'var(--surface)';
                let border = 'var(--border)';
                let color = 'var(--text-muted)';
                if (isRevealed) {
                  if (isCorrCat) { bg = c.bg; border = c.border; color = c.text; }
                  else if (isSelected && !isCorrCat) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
                } else if (isSelected) {
                  bg = c.bg; border = c.border; color = c.text;
                }
                return (
                  <button
                    key={cat}
                    onClick={function() { selectCat(ev.id, cat); }}
                    disabled={isRevealed}
                    style={{
                      padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid ' + border, background: bg, color,
                      fontSize: '0.78rem', fontWeight: isSelected || (isRevealed && isCorrCat) ? 700 : 400,
                      cursor: isRevealed ? 'default' : 'pointer', transition: 'all 0.15s',
                    }}
                  >{cat}</button>
                );
              })}
            </div>
            {sel && !isRevealed && (
              <button
                onClick={function() { checkEvent(ev.id); }}
                style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
              >Check</button>
            )}
            {isRevealed && (
              <div style={{ marginTop: '0.4rem', padding: '0.5rem 0.75rem', background: isCorrect ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (isCorrect ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.81rem', color: isCorrect ? 'var(--teal)' : 'var(--red)', lineHeight: 1.5 }}>
                <strong>{isCorrect ? 'Correct. ' : 'Not quite — the answer is ' + ev.correct + '. '}</strong>{ev.explanation}
              </div>
            )}
          </div>
        );
      })}

      {allRevealed && (
        <div style={{ marginTop: '1.1rem' }}>
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            <strong>What to do:</strong> Select the answer that correctly describes how to handle an external confound discovered during an A/B test window, then click Check.
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.65rem' }}>{RF11_MCQ.question}</div>
          {RF11_MCQ.options.map(function(opt, oi) {
            return (
              <MCQOption
                key={oi}
                label={opt}
                selected={mcqSel === oi}
                correct={oi === RF11_MCQ.correct}
                revealed={mcqRevealed}
                onClick={function() { if (!mcqRevealed) setMcqSel(oi); }}
              />
            );
          })}
          {mcqSel !== null && !mcqRevealed && (
            <button
              onClick={function() { setMcqRevealed(true); }}
              style={{ marginTop: '0.4rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}
            >Check</button>
          )}
          {mcqRevealed && (
            <div>
              <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>
                {RF11_MCQ.explanation}
              </div>
              <InsightBox>
                External factor classification is a fast mental check that belongs in the first 10 minutes of any investigation. Seasonal, Competitor, Platform, and Macro patterns all have distinct sources — and none of them have a product fix. Naming the category out loud in a review meeting signals analytical maturity immediately.
              </InsightBox>
              <NextBtn onClick={onComplete} label="Complete module →" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Module rf12: Multi-Level RCA ───────────────────────────────────────────
function Module_RF12({ onComplete }) {
  const TOTAL_DROP = 22;
  const CAUSES = [
    {
      id: 'pipeline',
      label: 'Cause 1: Data pipeline delay',
      contribution: 8,
      color: 'var(--yellow)',
      bg: 'var(--yellow-bg)',
      border: 'var(--yellow-border)',
      tag: 'Data Quality',
      tagBg: 'var(--yellow-bg)',
      tagBorder: 'var(--yellow-border)',
      tagColor: 'var(--yellow)',
      description: 'Platform migration delayed event ingestion by 6 hours — not a real user loss. Events arrived late, causing an apparent 8% drop in reported metrics.',
    },
    {
      id: 'seasonal',
      label: 'Cause 2: Seasonal baseline',
      contribution: 7,
      color: 'var(--green)',
      bg: 'var(--green-bg)',
      border: 'var(--green-border)',
      tag: 'External / Seasonal',
      tagBg: 'var(--green-bg)',
      tagBorder: 'var(--green-border)',
      tagColor: 'var(--green)',
      description: 'Post-holiday traffic normalization. Same week last year showed the same 7% dip — expected, not actionable.',
    },
    {
      id: 'regression',
      label: 'Cause 3: Product regression',
      contribution: 7,
      color: 'var(--red)',
      bg: 'var(--red-bg)',
      border: 'var(--red-border)',
      tag: 'Product Change',
      tagBg: 'var(--red-bg)',
      tagBorder: 'var(--red-border)',
      tagColor: 'var(--red)',
      description: 'Checkout flow bug introduced in v2.3.1 — confirmed by platform-specific funnel drop beginning exactly at release time. This is the true regression requiring a fix.',
    },
  ];

  const RF12_MCQ = {
    question: 'An RCA concludes when...',
    options: [
      'The engineering team has identified at least one plausible cause and a fix is in progress',
      'The first cause found is large enough to explain the majority of the drop',
      'You can account for 100% of the metric delta with attributable causes — and removing each cause would restore the metric to baseline',
      'The incident has been open for more than 48 hours and the team needs to move on',
    ],
    correct: 2,
    explanation: 'An RCA is complete when every percentage point of the delta is attributed — and when you can logically demonstrate that removing each cause would restore the metric. Stopping at the first large cause leaves hidden regressions in production and produces misleading post-mortems.',
  };

  const _saved12 = useMemo(function() { return loadRCAState('rf12'); }, []);
  const [active, setActive] = useState(function() { return _saved12 && _saved12.active ? _saved12.active : { pipeline: true, seasonal: true, regression: true }; });
  const [mcqSel, setMcqSel] = useState(function() { return _saved12 && _saved12.mcqSel != null ? _saved12.mcqSel : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved12 ? !!_saved12.mcqRevealed : false; });

  useEffect(function() { saveRCAState('rf12', { active: active, mcqSel: mcqSel, mcqRevealed: mcqRevealed }); }, [active, mcqSel, mcqRevealed]);

  function toggle(id) {
    setActive(function(prev) { return Object.assign({}, prev, { [id]: !prev[id] }); });
  }

  const explainedDrop = CAUSES.reduce(function(sum, c) {
    return sum + (active[c.id] ? c.contribution : 0);
  }, 0);
  const unexplained = Math.max(0, TOTAL_DROP - explainedDrop);
  const allToggledOn = CAUSES.every(function(c) { return active[c.id]; });

  const BAR_W = 400;

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.1rem' }}>
        A total metric drop of -22% is explained by three overlapping causes across different diagnostic layers. Toggle each cause on or off to see how the unexplained gap changes — and to understand why stopping at the first plausible cause produces an incomplete RCA.
      </p>

      {/* Total drop banner */}
      <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--red)', fontWeight: 700 }}>Observed metric drop: -22%</span>
        <span style={{ fontSize: '0.82rem', color: unexplained === 0 ? 'var(--teal)' : 'var(--red)', fontWeight: 700 }}>
          {unexplained === 0 ? 'Fully explained' : 'Unexplained: -' + unexplained + '%'}
        </span>
      </div>

      {/* Contribution bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Delta attribution</div>
        <div style={{ position: 'relative', height: 28, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          {(function() {
            let offset = 0;
            return CAUSES.map(function(c) {
              const pct = (c.contribution / TOTAL_DROP) * 100;
              const show = active[c.id];
              const left = (offset / TOTAL_DROP) * 100;
              if (show) offset += c.contribution;
              return (
                <div
                  key={c.id}
                  style={{
                    position: 'absolute', top: 0, left: left + '%',
                    width: show ? pct + '%' : '0%',
                    height: '100%', background: c.color,
                    transition: 'width 0.35s, left 0.35s',
                    opacity: 0.85,
                  }}
                />
              );
            });
          })()}
          {unexplained > 0 && (
            <div style={{
              position: 'absolute', top: 0,
              left: ((explainedDrop / TOTAL_DROP) * 100) + '%',
              width: ((unexplained / TOTAL_DROP) * 100) + '%',
              height: '100%', background: 'var(--border)', opacity: 0.5,
            }} />
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
          {CAUSES.map(function(c) {
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: active[c.id] ? c.color : 'var(--text-muted)', opacity: active[c.id] ? 1 : 0.5 }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: c.color }} />
                {'-' + c.contribution + '%'}
              </div>
            );
          })}
          {unexplained > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--border)' }} />
              {'unexplained: -' + unexplained + '%'}
            </div>
          )}
        </div>
      </div>

      {/* Cause cards */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Click Remove on each cause to see how the unexplained gap grows — then add them all back to confirm all 22 percentage points are accounted for.
      </div>
      {CAUSES.map(function(c) {
        const isOn = active[c.id];
        return (
          <div key={c.id} style={{
            marginBottom: '0.75rem', background: isOn ? c.bg : 'var(--surface-2)',
            border: '1px solid ' + (isOn ? c.border : 'var(--border)'),
            borderRadius: 'var(--radius)', padding: '0.85rem 1rem',
            transition: 'background 0.2s, border-color 0.2s', opacity: isOn ? 1 : 0.55,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '4px', background: c.tagBg, border: '1px solid ' + c.tagBorder, color: c.tagColor }}>{c.tag}</span>
                <span style={{ fontSize: '0.83rem', fontWeight: 700, color: isOn ? c.color : 'var(--text-muted)' }}>{c.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isOn ? c.color : 'var(--text-muted)' }}>{'-' + c.contribution + '%'}</span>
                <button
                  onClick={function() { toggle(c.id); }}
                  style={{
                    padding: '0.22rem 0.65rem', borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid ' + (isOn ? c.border : 'var(--border)'),
                    background: isOn ? c.color : 'var(--surface)',
                    color: isOn ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >{isOn ? 'Remove' : 'Add back'}</button>
              </div>
            </div>
            {isOn && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.55 }}>{c.description}</div>
            )}
          </div>
        );
      })}

      {/* Completion note when all accounted for */}
      {unexplained === 0 && (
        <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.9rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.55 }}>
          All 22 percentage points are attributed. The RCA is complete. Note that only Cause 3 (product regression) requires a code fix — the other two are informational and close without action.
        </div>
      )}

      {/* MCQ */}
      <div style={{ marginTop: '1.25rem' }}>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Select the answer that correctly defines when an RCA investigation is complete, then click Check.
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.65rem' }}>{RF12_MCQ.question}</div>
        {RF12_MCQ.options.map(function(opt, oi) {
          return (
            <MCQOption
              key={oi}
              label={opt}
              selected={mcqSel === oi}
              correct={oi === RF12_MCQ.correct}
              revealed={mcqRevealed}
              onClick={function() { if (!mcqRevealed) setMcqSel(oi); }}
            />
          );
        })}
        {mcqSel !== null && !mcqRevealed && (
          <button
            onClick={function() { setMcqRevealed(true); }}
            style={{ marginTop: '0.4rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}
          >Check</button>
        )}
        {mcqRevealed && (
          <div>
            <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>
              {RF12_MCQ.explanation}
            </div>
            <InsightBox>
              Multi-cause RCAs require you to account for 100% of the delta. The senior move is to decompose the drop into layers — data quality, seasonal, product — then confirm each attribution is removable independently. A single cause that gets 70% there is not a closed investigation.
            </InsightBox>
            <NextBtn onClick={onComplete} label="Complete module →" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Module rf13: The Routing Gate ──────────────────────────────────────────

const SCENARIOS_RF13 = [
  {
    id: 0,
    signal: 'Last 1–6 hours',
    scenario: 'All platforms, all event types drop simultaneously at 3:14 AM. Raw event table row counts are near zero from 3:14 AM onward. Every downstream dashboard shows a flatline.',
    correct: 'sanity',
    explanation: 'A vertical cliff across all platforms and all event types simultaneously is the signature of a data pipeline or infrastructure failure — not a product change. Sanity check first: check ingestion job logs and raw table row counts by hour. A product change cannot produce this pattern.',
  },
  {
    id: 1,
    signal: 'Weeks of gradual decline',
    scenario: 'DAU has declined 2–3% every single week for 11 consecutive weeks. No specific event, deploy, or campaign correlates with the start date.',
    correct: 'behaviour',
    explanation: 'Gradual decline with no correlation event points to product erosion, cohort quality degradation, or competitor creep — not a single bug or deploy. Start with product and behaviour: cohort retention trends, new user quality, segment-level breakdowns. A/B tests and deploys cannot produce a smooth 11-week slope.',
  },
  {
    id: 2,
    signal: 'Last 1–6 hours, one platform only',
    scenario: 'Checkout conversion dropped 9% starting this morning. Android is affected. iOS and web are completely flat. The drop started around the time of a routine Android SDK update.',
    correct: 'tech',
    explanation: 'Platform-specific + very recent + a known change in the window = Internal Tech. The Android SDK update is the prime suspect. Start with the deploy: check the SDK changelog, verify tracking library version, and confirm whether the drop correlates exactly with the update rollout. This is not a data quality issue — the signal is real but isolated to one platform.',
  },
  {
    id: 3,
    signal: 'Cyclical pattern',
    scenario: 'A B2B SaaS platform shows revenue dropping every last week of the month, consistently for 8 consecutive months. The pattern is stable — same week, same magnitude.',
    correct: 'external',
    explanation: 'Stable, repeating, calendar-aligned patterns are external/seasonal. This is a billing or renewal cycle effect — B2B contracts often close or renew at month-end, creating a predictable revenue dip in the days before. No product investigation required. The correct response is to flag it as expected seasonality and adjust forecasts accordingly.',
  },
  {
    id: 4,
    signal: 'One segment only',
    scenario: 'Feature engagement dropped 18% but only affects users who signed up before Q1. Users who signed up after Q1 are completely unaffected. The feature itself has not changed.',
    correct: 'segment',
    explanation: 'When only one cohort is affected and the product has not changed, the cause lives inside that cohort\'s subtree — not in the global product tree. Start by isolating: what changed for pre-Q1 users specifically? Did a notification, email, or entitlement change affect only that cohort? The segment boundary is itself a diagnostic clue.',
  },
  {
    id: 5,
    signal: '2–7 days',
    scenario: 'DAU dropped 14% starting 3 days ago. The drop correlates with a new onboarding A/B test that shipped 4 days ago. Both treatment and control groups show lower DAU than the pre-experiment baseline.',
    correct: 'tech',
    explanation: 'A drop that begins shortly after a specific change and affects both treatment and control is a feature regression or misconfiguration — not the experiment effect itself. Start with Internal Tech: check whether the onboarding change broke something for all users, not just the treatment group. Both arms being affected rules out a treatment-specific effect.',
  },
];

const ROUTES_RF13 = [
  { id: 'sanity',   label: 'Sanity / Data pipeline first',                color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)' },
  { id: 'external', label: 'External / Market signals first',             color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  { id: 'tech',     label: 'Internal Tech first — deploy / A/B / SDK',   color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  { id: 'behaviour',label: 'Product erosion / Behaviour — gradual shift', color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
  { id: 'segment',  label: 'Isolate the affected segment first',          color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
];

function Module_RF13({ onComplete }) {
  const _saved13 = useMemo(function() { return loadRCAState('rf13'); }, []);
  const [scenarios13] = useState(function() { return _saved13 && _saved13.scenarios ? _saved13.scenarios : shuffleArr(SCENARIOS_RF13); });
  const [selections, setSelections] = useState(function() { return _saved13 && _saved13.selections ? _saved13.selections : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved13 ? !!_saved13.revealed : false; });

  useEffect(function() { saveRCAState('rf13', { scenarios: scenarios13, selections: selections, revealed: revealed }); }, [scenarios13, selections, revealed]);

  var allSelected = scenarios13.every(function(s) { return selections[s.id] != null; });
  var correctCount = revealed ? scenarios13.filter(function(s) { return selections[s.id] === s.correct; }).length : 0;

  function select(scenarioId, routeId) {
    if (revealed) return;
    setSelections(function(prev) { var n = Object.assign({}, prev); n[scenarioId] = routeId; return n; });
  }

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Before building a fault tree, read the time signature. The pattern of a drop — when it started, how fast it moved, and which segments it hit — routes the entire investigation. Jumping to hypotheses before reading the signal means you start in the wrong branch.
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '1rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> For each scenario, select where you would start the investigation — then check all six at once.
      </div>

      {/* Route legend */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {ROUTES_RF13.map(function(r) {
          return (
            <span key={r.id} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 4, background: r.bg, border: '1px solid ' + r.border, color: r.color }}>
              {r.label}
            </span>
          );
        })}
      </div>

      {/* Scenarios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
        {scenarios13.map(function(s, idx) {
          var sel = selections[s.id];
          var selectedRoute = sel != null ? ROUTES_RF13.find(function(r) { return r.id === sel; }) : null;
          var correctRoute = ROUTES_RF13.find(function(r) { return r.id === s.correct; });
          var isCorrect = revealed && sel === s.correct;
          var isWrong = revealed && sel != null && sel !== s.correct;
          return (
            <div key={s.id} style={{
              background: isCorrect ? 'var(--teal-bg)' : isWrong ? 'var(--red-bg)' : 'var(--surface-2)',
              border: '1.5px solid ' + (isCorrect ? 'var(--teal-border)' : isWrong ? 'var(--red-border)' : 'var(--border)'),
              borderRadius: 'var(--radius)', padding: '0.9rem 1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 3, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {s.signal}
                </span>
                {revealed && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isCorrect ? 'var(--teal)' : 'var(--red)' }}>
                    {isCorrect ? 'Correct' : 'Start with: ' + correctRoute.label}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: sel != null || revealed ? '0.65rem' : 0 }}>
                {s.scenario}
              </div>
              {!revealed && (
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {ROUTES_RF13.map(function(r) {
                    var isSelected = sel === r.id;
                    return (
                      <button key={r.id} onClick={function() { select(s.id, r.id); }} style={{
                        fontSize: '0.73rem', padding: '0.25rem 0.6rem',
                        background: isSelected ? r.color : 'var(--surface)',
                        border: '1px solid ' + (isSelected ? r.color : 'var(--border)'),
                        borderRadius: 3, color: isSelected ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer', fontWeight: isSelected ? 700 : 400, transition: 'all 0.1s',
                      }}>
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              )}
              {revealed && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55, fontStyle: 'italic' }}>
                  {s.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!revealed && allSelected && (
        <button onClick={function() { setRevealed(true); }} style={{
          padding: '0.55rem 1.2rem', background: 'var(--teal)', color: '#fff',
          border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700,
          fontSize: '0.88rem', cursor: 'pointer',
        }}>
          Check answers
        </button>
      )}

      {revealed && (
        <div>
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem',
            background: correctCount === scenarios13.length ? 'var(--teal-bg)' : 'var(--yellow-bg)',
            border: '1px solid ' + (correctCount === scenarios13.length ? 'var(--teal-border)' : 'var(--yellow-border)'),
            color: correctCount === scenarios13.length ? 'var(--teal)' : 'var(--yellow)',
            fontWeight: 700, fontSize: '0.88rem',
          }}>
            {correctCount}/{scenarios13.length} correct{correctCount < scenarios13.length ? ' — review the highlighted scenarios' : ' — perfect routing'}
          </div>

          {/* Routing Gate reference table */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.7rem' }}>
              Routing gate — signal to starting branch
            </div>
            {[
              { signal: 'Cliff in last 1–6 hours, all events/platforms', route: 'Sanity / Data pipeline', color: 'var(--red)' },
              { signal: 'Cliff in last 1–6 hours, one platform only', route: 'Internal Tech (deploy / SDK)', color: 'var(--accent)' },
              { signal: '2–7 days, correlates with a known change', route: 'Internal Tech (A/B test / feature regression)', color: 'var(--accent)' },
              { signal: 'Weeks of gradual decline, no event correlation', route: 'Product erosion / Behaviour', color: 'var(--purple)' },
              { signal: 'Stable cyclical pattern (day/week/month)', route: 'External / Seasonal', color: 'var(--yellow)' },
              { signal: 'One segment affected, others flat', route: 'Isolate the segment first', color: 'var(--teal)' },
            ].map(function(row, i) {
              return (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.45rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0, marginTop: '0.35rem' }} />
                  <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{row.signal}</span>
                    <span style={{ color: 'var(--text-muted)', margin: '0 0.3rem' }}>→</span>
                    <span style={{ color: row.color, fontWeight: 700 }}>{row.route}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <InsightBox>
            The routing gate is not a shortcut — it is precision. Reading the time signature before building a hypothesis tree prevents the most common RCA failure: exploring the wrong branch for 2 hours before realising the drop happened at 3 AM and nothing shipped. Signal first, tree second.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module rf14: Dominant Lever and Pruning ─────────────────────────────────

const SCENARIOS_RF14 = [
  {
    id: 0,
    context: 'Revenue is down 15% WoW. It decomposes as: Revenue = Users \xd7 CVR \xd7 AOV.',
    components: [
      { id: 'users', label: 'Users',                       change: '-2%',   dominant: false },
      { id: 'cvr',   label: 'CVR (conversion rate)',       change: '-1%',   dominant: false },
      { id: 'aov',   label: 'AOV (average order value)',   change: '-13%',  dominant: true  },
    ],
    branches: [
      { id: 'pricing',  label: 'Pricing or discount policy changes',          relevant: true  },
      { id: 'mix',      label: 'Product mix shift toward lower-priced items', relevant: true  },
      { id: 'bundles',  label: 'Upsell and bundle promotion changes',         relevant: true  },
      { id: 'paid',     label: 'Paid acquisition campaign performance',       relevant: false },
      { id: 'checkout', label: 'Checkout flow UX changes',                    relevant: false },
    ],
    pruneNote: 'Users and CVR are nearly flat — acquisition funnels, onboarding, and checkout UX are off the table entirely. Every investigation hour goes to the AOV branch.',
  },
  {
    id: 1,
    context: 'DAU is down 20% WoW. It decomposes as: DAU = New + Retained + Resurrected.',
    components: [
      { id: 'new',   label: 'New users',         change: '-2%',  dominant: false },
      { id: 'ret',   label: 'Retained users',    change: '-19%', dominant: true  },
      { id: 'resur', label: 'Resurrected users', change: '-3%',  dominant: false },
    ],
    branches: [
      { id: 'product',  label: 'Product quality regressions or feature removals', relevant: true  },
      { id: 'notif',    label: 'Push notification opt-in or delivery changes',     relevant: true  },
      { id: 'cohort',   label: 'D7/D30 retention cohort analysis',                 relevant: true  },
      { id: 'acqui',    label: 'Paid acquisition spend and channel mix',            relevant: false },
      { id: 'reengag',  label: 'Re-engagement campaign for lapsed users',           relevant: false },
    ],
    pruneNote: 'New users (-2%) and resurrected users (-3%) are noise. Acquisition and re-engagement branches are off the table. Focus entirely on why existing users stopped returning.',
  },
  {
    id: 2,
    context: 'Checkout CVR dropped 12%. It decomposes as: CVR = Visit-to-cart \xd7 Cart-to-checkout \xd7 Checkout-to-purchase.',
    components: [
      { id: 'vtc', label: 'Visit-to-cart rate',        change: '-0.5%',  dominant: false },
      { id: 'ctc', label: 'Cart-to-checkout rate',     change: '-0.3%',  dominant: false },
      { id: 'ctp', label: 'Checkout-to-purchase rate', change: '-11.5%', dominant: true  },
    ],
    branches: [
      { id: 'payment', label: 'Payment gateway errors or declined transactions',   relevant: true  },
      { id: 'ux',      label: 'Checkout UI or form changes',                       relevant: true  },
      { id: 'trust',   label: 'Trust signals, security badges, or promo code bugs',relevant: true  },
      { id: 'search',  label: 'Product search ranking changes',                    relevant: false },
      { id: 'pdp',     label: 'Product detail page or image quality changes',      relevant: false },
    ],
    pruneNote: 'Visit-to-cart and cart-to-checkout are nearly flat — discovery, browsing, and product experience branches are irrelevant. The break is at the final payment step.',
  },
];

function Module_RF14({ onComplete }) {
  var _saved14 = useMemo(function() { return loadRCAState('rf14'); }, []);
  var [scenarioIdx, setScenarioIdx] = useState(function() { return _saved14 && _saved14.scenarioIdx != null ? _saved14.scenarioIdx : 0; });
  var [leverSel, setLeverSel] = useState(function() { return _saved14 ? _saved14.leverSel : null; });
  var [leverRevealed, setLeverRevealed] = useState(function() { return _saved14 ? !!_saved14.leverRevealed : false; });
  var [branchSels, setBranchSels] = useState(function() { return new Set(_saved14 && _saved14.branchSels ? _saved14.branchSels : []); });
  var [branchRevealed, setBranchRevealed] = useState(function() { return _saved14 ? !!_saved14.branchRevealed : false; });
  var [allDone, setAllDone] = useState(function() { return _saved14 ? !!_saved14.allDone : false; });

  useEffect(function() {
    saveRCAState('rf14', { scenarioIdx: scenarioIdx, leverSel: leverSel, leverRevealed: leverRevealed, branchSels: Array.from(branchSels), branchRevealed: branchRevealed, allDone: allDone });
  }, [scenarioIdx, leverSel, leverRevealed, branchSels, branchRevealed, allDone]);

  var scenario = SCENARIOS_RF14[scenarioIdx];

  function advanceScenario() {
    if (scenarioIdx < SCENARIOS_RF14.length - 1) {
      setScenarioIdx(scenarioIdx + 1);
      setLeverSel(null);
      setLeverRevealed(false);
      setBranchSels(new Set());
      setBranchRevealed(false);
    } else {
      setAllDone(true);
    }
  }

  function toggleBranch(id) {
    if (branchRevealed) return;
    setBranchSels(function(prev) {
      var n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Decomposing a metric tells you which component moved. The next step — the one most analysts skip — is to prune every investigation branch that is unrelated to that component. Scattered thinking is the primary failure mode of smart analysts.
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '1rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> For each scenario, first identify the dominant lever — the component that explains the drop. Then select only the investigation branches that are relevant to that lever.
      </div>

      {!allDone && (
        <div>
          {/* Progress indicator */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
            {SCENARIOS_RF14.map(function(s, i) {
              var isDone = i < scenarioIdx;
              var isCurrent = i === scenarioIdx;
              return (
                <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 2, background: isDone ? 'var(--teal)' : isCurrent ? 'var(--teal-border)' : 'var(--border)' }} />
              );
            })}
          </div>

          {/* Scenario card */}
          <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
              Scenario {scenarioIdx + 1} of {SCENARIOS_RF14.length}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '0.9rem' }}>
              {scenario.context}
            </div>

            {/* Component table */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                Component breakdown
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {scenario.components.map(function(c) {
                  var isSelected = leverSel === c.id;
                  var isCorrect = leverRevealed && c.dominant;
                  var isWrong = leverRevealed && isSelected && !c.dominant;
                  return (
                    <button
                      key={c.id}
                      onClick={function() { if (!leverRevealed) setLeverSel(c.id); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.55rem 0.85rem', textAlign: 'left', width: '100%',
                        background: isCorrect ? 'var(--teal-bg)' : isWrong ? 'var(--red-bg)' : isSelected ? 'var(--surface-raised)' : 'var(--surface)',
                        border: '1.5px solid ' + (isCorrect ? 'var(--teal-border)' : isWrong ? 'var(--red-border)' : isSelected ? 'var(--border-strong)' : 'var(--border)'),
                        borderRadius: 'var(--radius-sm)', cursor: leverRevealed ? 'default' : 'pointer', transition: 'all 0.1s',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.86rem', color: isCorrect ? 'var(--teal)' : isWrong ? 'var(--red)' : 'var(--text)', flex: 1 }}>{c.label}</span>
                      <span style={{
                        fontSize: '0.82rem', fontWeight: 700, minWidth: '3.5rem', textAlign: 'right',
                        color: isCorrect ? 'var(--teal)' : isWrong ? 'var(--red)' : 'var(--text-muted)',
                      }}>{c.change}</span>
                      {leverRevealed && c.dominant && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)' }}>DOMINANT</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {!leverRevealed && (
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Click the component that is the dominant lever — the one whose movement explains the drop.
                </div>
                {leverSel && (
                  <button onClick={function() { setLeverRevealed(true); }} style={{ padding: '0.45rem 1rem', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    Check lever
                  </button>
                )}
              </div>
            )}

            {leverRevealed && !branchRevealed && (
              <div>
                <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.8rem', marginBottom: '0.8rem', fontSize: '0.82rem', color: 'var(--teal)', lineHeight: 1.5 }}>
                  Correct. Now apply the pruning rule — select only the branches worth investigating given this dominant lever.
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  Which branches to investigate?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {scenario.branches.map(function(b) {
                    var isSel = branchSels.has(b.id);
                    return (
                      <button key={b.id} onClick={function() { toggleBranch(b.id); }} style={{
                        textAlign: 'left', padding: '0.55rem 0.8rem', width: '100%',
                        background: isSel ? 'var(--accent-bg)' : 'var(--surface)',
                        border: '1.5px solid ' + (isSel ? 'var(--accent-border)' : 'var(--border)'),
                        borderRadius: 'var(--radius-sm)', color: isSel ? 'var(--accent)' : 'var(--text)',
                        fontSize: '0.84rem', cursor: 'pointer', fontWeight: isSel ? 600 : 400, transition: 'all 0.1s',
                      }}>{b.label}</button>
                    );
                  })}
                </div>
                {branchSels.size > 0 && (
                  <button onClick={function() { setBranchRevealed(true); }} style={{ padding: '0.45rem 1rem', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    Check branches
                  </button>
                )}
              </div>
            )}

            {branchRevealed && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {scenario.branches.map(function(b) {
                    var isSel = branchSels.has(b.id);
                    var isCorrect = b.relevant;
                    var bg = isCorrect ? 'var(--teal-bg)' : (isSel ? 'var(--red-bg)' : 'var(--surface)');
                    var border = isCorrect ? 'var(--teal-border)' : (isSel ? 'var(--red-border)' : 'var(--border)');
                    var color = isCorrect ? 'var(--teal)' : (isSel ? 'var(--red)' : 'var(--text-muted)');
                    return (
                      <div key={b.id} style={{ padding: '0.55rem 0.8rem', background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: color, fontWeight: isCorrect ? 600 : 400, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{b.label}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{isCorrect ? 'Investigate' : 'Prune'}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55, fontStyle: 'italic', marginBottom: '0.85rem' }}>
                  {scenario.pruneNote}
                </div>
                <button onClick={advanceScenario} style={{ padding: '0.45rem 1.1rem', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}>
                  {scenarioIdx < SCENARIOS_RF14.length - 1 ? 'Next scenario →' : 'See summary →'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {allDone && (
        <div>
          {/* Pruning rule reference */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.65rem' }}>
              The pruning rule
            </div>
            {[
              { lever: 'AOV dropped', prune: 'Acquisition branches, onboarding branches, checkout friction' },
              { lever: 'CVR dropped', prune: 'Supply-side, pricing, product quality — focus on tech/UX/funnel' },
              { lever: 'New users dropped', prune: 'Retention branches, product quality, re-engagement' },
              { lever: 'Retained users dropped', prune: 'Acquisition, referral, re-engagement campaigns' },
              { lever: 'One funnel step failed', prune: 'All other funnel steps — investigate only the broken step' },
            ].map(function(row, i) {
              return (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.45rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--teal)', minWidth: '11rem', flexShrink: 0 }}>{row.lever}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Prune: {row.prune}</span>
                </div>
              );
            })}
          </div>

          <InsightBox>
            The pruning rule is not optional. Scattered thinking — listing all possible causes before checking which component moved — is how smart analysts waste three hours investigating acquisition funnels when the problem is in AOV. Decompose first, identify the dominant lever, then ignore everything else completely.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module rf15: Hypothesis Ranking ─────────────────────────────────────────

var SCENARIOS_RF15 = [
  {
    id: 0,
    context: 'DAU is down 18% WoW. Dominant lever identified: retained users (-17%). A product deploy shipped 36 hours ago. Push notification opt-in rate was stable. No marketing changes this week.',
    hypotheses: [
      {
        id: 'h1',
        label: 'Product regression in the 36-hour deploy broke session initialization for returning users',
        eImpact: 'high', eLikelihood: 'high', eEase: 'high',
        rank: 1,
        rationale: 'Temporal correlation + verifiable in minutes via crash and error rate logs. Deploys are the first thing to rule in or out — they are the cheapest hypothesis to validate when timing aligns.',
      },
      {
        id: 'h2',
        label: 'Push notification delivery failure reduced re-engagement for lapsed returning users',
        eImpact: 'medium', eLikelihood: 'medium', eEase: 'high',
        rank: 2,
        rationale: 'Delivery metrics are fast to check but impact is bounded — notifications affect a subset of retained users, not all of them.',
      },
      {
        id: 'h3',
        label: 'Content feed ranking algorithm degraded — users finding less relevant content on return visits',
        eImpact: 'high', eLikelihood: 'low', eEase: 'low',
        rank: 3,
        rationale: 'High impact if true, but no algorithm change is logged and validation requires cohort analysis (hours, not minutes). Investigate after faster hypotheses are ruled out.',
      },
      {
        id: 'h4',
        label: 'A competitor launched a major feature drawing retained users away',
        eImpact: 'medium', eLikelihood: 'low', eEase: 'low',
        rank: 4,
        rationale: 'Competitive migration is gradual — an 18% WoW drop is too fast for organic churn to a competitor. Low likelihood and slow to validate.',
      },
    ],
    keyInsight: 'The deploy hypothesis scores highest on all three dimensions simultaneously. When Impact, Likelihood, and Ease are all high, investigate immediately — do not even start the next hypothesis before checking deploy error rates.',
  },
  {
    id: 1,
    context: 'Revenue down 15% WoW. Dominant lever: AOV dropped 14%. No pricing changes logged. Weekend timing. Product category mix appears roughly stable at first glance.',
    hypotheses: [
      {
        id: 'h1',
        label: 'A coupon aggregator site published a leaked promo code, applying unexpected discounts at checkout',
        eImpact: 'high', eLikelihood: 'high', eEase: 'high',
        rank: 1,
        rationale: 'Discount usage data is queryable in minutes. Leaked promo codes produce an exact AOV signature: order volume stable, per-order value drops by the discount amount. Check discount_code field on orders immediately.',
      },
      {
        id: 'h2',
        label: 'Product mix within the dominant category shifted toward lower-priced SKUs this weekend',
        eImpact: 'high', eLikelihood: 'medium', eEase: 'medium',
        rank: 2,
        rationale: 'Mix shift can fully explain an AOV drop without any pricing change. Requires a category × revenue breakdown — takes 15-30 minutes.',
      },
      {
        id: 'h3',
        label: 'Dynamic pricing algorithm under-priced high-AOV items in a specific subcategory due to a bug',
        eImpact: 'high', eLikelihood: 'medium', eEase: 'low',
        rank: 3,
        rationale: 'High impact if true but requires a pricing audit across subcategories. Do not start here — rule out the faster hypotheses first.',
      },
      {
        id: 'h4',
        label: 'New user acquisition this week skewed toward lower-intent buyers who placed smaller first orders',
        eImpact: 'medium', eLikelihood: 'low', eEase: 'low',
        rank: 4,
        rationale: 'This hypothesis is almost prunable — the dominant lever is AOV, not acquisition volume. Acquisition mix would cause lower CVR, not lower AOV. Investigate last.',
      },
    ],
    keyInsight: 'The leaked promo code hypothesis is high on all three dimensions AND has a single queryable data point that confirms or eliminates it immediately. Prioritize hypotheses where a single query rules them in or out.',
  },
  {
    id: 2,
    context: 'Checkout CVR down 10% WoW. Dominant lever: checkout-to-purchase rate (-9.5%). Payment gateway monitoring shows error rate at 11% vs. normal 1.5%. New checkout UI shipped 48 hours ago.',
    hypotheses: [
      {
        id: 'h1',
        label: 'Payment gateway error rate spike is failing transactions at the final payment step',
        eImpact: 'high', eLikelihood: 'high', eEase: 'high',
        rank: 1,
        rationale: 'The payment gateway already shows 11% errors — this is not a hypothesis, it is a confirmed signal. Investigate root cause of the gateway errors immediately.',
      },
      {
        id: 'h2',
        label: 'New checkout UI introduced a form bug or UX friction specifically at the payment input step',
        eImpact: 'high', eLikelihood: 'high', eEase: 'high',
        rank: 2,
        rationale: 'The UI deploy is temporally correlated and could compound or cause the payment errors. Check the UI diff for payment form changes — 10 minutes.',
      },
      {
        id: 'h3',
        label: 'New mandatory email verification before purchase is causing abandonment at checkout',
        eImpact: 'medium', eLikelihood: 'medium', eEase: 'medium',
        rank: 3,
        rationale: 'A friction-adding change at checkout is plausible but impact is bounded and takes longer to diagnose via funnel analysis.',
      },
      {
        id: 'h4',
        label: 'Removal of comparison pricing from the checkout page reduced purchase confidence',
        eImpact: 'medium', eLikelihood: 'low', eEase: 'low',
        rank: 4,
        rationale: 'Behavioral/psychological effect. Plausible as a long-term driver but does not explain a sudden 10% WoW drop. Low likelihood and slow to validate.',
      },
    ],
    keyInsight: 'When monitoring data already shows a signal for one hypothesis (gateway error rate), investigate that one first — it is not really a hypothesis anymore. External confirming signals collapse the uncertainty and make ranking obvious.',
  },
];

var RANK_LABELS = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' };
var SCORE_MAP = { high: 3, medium: 2, low: 1 };

function RF15RankBadge(props) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '1.5rem', height: '1.5rem', borderRadius: '50%',
      background: props.active ? 'var(--teal)' : 'var(--surface-2)',
      border: '1.5px solid ' + (props.active ? 'var(--teal)' : 'var(--border)'),
      color: props.active ? '#fff' : 'var(--text-muted)',
      fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
      transition: 'all 0.1s',
    }} onClick={props.onClick}>{props.n}</span>
  );
}

function Module_RF15({ onComplete }) {
  var _saved15 = useMemo(function() { return loadRCAState('rf15'); }, []);
  var [scenarioIdx, setScenarioIdx] = useState(function() { return _saved15 && _saved15.scenarioIdx != null ? _saved15.scenarioIdx : 0; });
  var [userRanks, setUserRanks] = useState(function() { return _saved15 ? (_saved15.userRanks || {}) : {}; });
  var [revealed, setRevealed] = useState(function() { return _saved15 ? !!_saved15.revealed : false; });
  var [allDone, setAllDone] = useState(function() { return _saved15 ? !!_saved15.allDone : false; });

  useEffect(function() {
    saveRCAState('rf15', { scenarioIdx: scenarioIdx, userRanks: userRanks, revealed: revealed, allDone: allDone });
  }, [scenarioIdx, userRanks, revealed, allDone]);

  var scenario = SCENARIOS_RF15[scenarioIdx];
  var hyps = scenario.hypotheses;

  function assignRank(hypId, rank) {
    if (revealed) return;
    setUserRanks(function(prev) {
      var next = Object.assign({}, prev);
      // Remove this rank from any other hypothesis
      Object.keys(next).forEach(function(k) { if (next[k] === rank) delete next[k]; });
      // Toggle off if same
      if (prev[hypId] === rank) { delete next[hypId]; } else { next[hypId] = rank; }
      return next;
    });
  }

  var allRanked = hyps.every(function(h) { return userRanks[h.id] != null; });

  function advanceScenario() {
    if (scenarioIdx < SCENARIOS_RF15.length - 1) {
      setScenarioIdx(scenarioIdx + 1);
      setUserRanks({});
      setRevealed(false);
    } else {
      setAllDone(true);
    }
  }

  function scoreLabel(lvl) {
    if (lvl === 'high') return 'High (3)';
    if (lvl === 'medium') return 'Medium (2)';
    return 'Low (1)';
  }

  function dimColor(lvl) {
    if (lvl === 'high') return 'var(--teal)';
    if (lvl === 'medium') return 'var(--yellow)';
    return 'var(--text-muted)';
  }

  if (allDone) {
    return (
      <div>
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.65rem' }}>
            The ranking rubric
          </div>
          {[
            { dim: 'Impact', desc: 'How much of the metric drop would this hypothesis explain if true? High = could fully explain it. Low = explains a small fraction.' },
            { dim: 'Likelihood', desc: 'How probable is this cause given the symptoms, timing, and known facts? High = strong corroborating signals. Low = plausible but no supporting evidence.' },
            { dim: 'Ease', desc: 'How quickly can you rule this in or out? High = single query or log check, minutes. Low = cohort analysis, survey, or days of data collection.' },
          ].map(function(row) {
            return (
              <div key={row.dim} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--teal)', minWidth: '5.5rem', flexShrink: 0 }}>{row.dim}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{row.desc}</span>
              </div>
            );
          })}
          <div style={{ marginTop: '0.6rem', padding: '0.45rem 0.7rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            Tie-breaking rule: when two hypotheses score equally, investigate the one with higher Ease first. Cheap validation is always worth doing before expensive validation.
          </div>
        </div>
        <InsightBox>
          Hypothesis ranking is not about being right on the first try. It is about minimizing wasted investigation time. An analyst who investigates in Impact × Likelihood × Ease order will almost always reach the root cause faster than one who starts with the most interesting hypothesis.
        </InsightBox>
        <NextBtn onClick={onComplete} label="Complete module →" />
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        After pruning the fault tree, you still have competing hypotheses. Rank them by investigation priority using Impact (how much of the drop does this explain?), Likelihood (how probable given the symptoms?), and Ease (how fast can you validate it?).
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '1rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>Scenario {scenarioIdx + 1} of {SCENARIOS_RF15.length}:</strong> {scenario.context}
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
        Assign investigation order — click the rank buttons next to each hypothesis
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.85rem' }}>
        {hyps.map(function(h) {
          var userRank = userRanks[h.id];
          var expertScore = SCORE_MAP[h.eImpact] * SCORE_MAP[h.eLikelihood] * SCORE_MAP[h.eEase];
          var isTopExpert = h.rank === 1;
          var revealBg = revealed ? (h.rank <= 2 ? 'var(--teal-bg)' : 'var(--surface)') : 'var(--surface)';
          var revealBorder = revealed ? (h.rank <= 2 ? 'var(--teal-border)' : 'var(--border)') : (userRank ? 'var(--accent-border)' : 'var(--border)');
          return (
            <div key={h.id} style={{
              padding: '0.65rem 0.8rem', background: revealBg,
              border: '1.5px solid ' + revealBorder,
              borderRadius: 'var(--radius-sm)', transition: 'all 0.15s',
            }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, paddingTop: '0.1rem' }}>
                  {[1,2,3,4].map(function(n) {
                    return <RF15RankBadge key={n} n={n} active={userRank === n} onClick={function() { assignRank(h.id, n); }} />;
                  })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.5 }}>{h.label}</div>
                  {userRank && !revealed && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent)', marginTop: '0.2rem', fontWeight: 600 }}>
                      Assigned: {RANK_LABELS[userRank]}
                    </div>
                  )}
                  {revealed && (
                    <div style={{ marginTop: '0.4rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                        {[
                          { label: 'Impact', val: h.eImpact },
                          { label: 'Likelihood', val: h.eLikelihood },
                          { label: 'Ease', val: h.eEase },
                        ].map(function(d) {
                          return (
                            <span key={d.label} style={{ fontSize: '0.71rem', padding: '0.1rem 0.45rem', borderRadius: '20px', background: 'var(--surface-2)', color: dimColor(d.val), fontWeight: 600, border: '1px solid var(--border)' }}>
                              {d.label}: {d.val}
                            </span>
                          );
                        })}
                        <span style={{ fontSize: '0.71rem', padding: '0.1rem 0.45rem', borderRadius: '20px', background: 'var(--teal-bg)', color: 'var(--teal)', fontWeight: 700, border: '1px solid var(--teal-border)' }}>
                          Investigate {RANK_LABELS[h.rank]}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
                        {h.rationale}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!revealed && allRanked && (
        <button onClick={function() { setRevealed(true); }} style={{ padding: '0.45rem 1rem', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
          Reveal expert ranking
        </button>
      )}

      {revealed && (
        <div>
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            <strong>Key insight:</strong> {scenario.keyInsight}
          </div>
          <button onClick={advanceScenario} style={{ padding: '0.45rem 1.1rem', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}>
            {scenarioIdx < SCENARIOS_RF15.length - 1 ? 'Next scenario →' : 'See summary →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Module registry ─────────────────────────────────────────────────────────
const MODULE_COMPONENTS = {
  rf01: Module_RF01,
  rf02: Module_RF02,
  rf03: Module_RF03,
  rf04: Module_RF04,
  rf05: Module_RF05,
  rf06: Module_RF06,
  rf07: Module_RF07,
  rf08: Module_RF08,
  rf09: Module_RF09,
  rf10: Module_RF10,
  rf11: Module_RF11,
  rf12: Module_RF12,
  rf13: Module_RF13,
  rf14: Module_RF14,
  rf15: Module_RF15,
};

// ── Runner shell ────────────────────────────────────────────────────────────
export function RCAFoundationsRunner({ moduleId, onBack, onNext, unlocked, onSelectModule }) {
  const module = rcaFoundationModules.find(m => m.id === moduleId);
  const [completed, setCompleted] = useState(false);
  const [note, setNote] = useState(() => getNotes('rca-foundations', moduleId));
  useEffect(() => { setNote(getNotes('rca-foundations', moduleId)); }, [moduleId]);

  if (!module) return null;

  const ModuleComponent = MODULE_COMPONENTS[moduleId];

  function handleComplete() {
    saveRCAFoundationProgress(moduleId);
    track('case_completed', { room: 'rca-foundations', id: moduleId, title: module.title });
    setCompleted(true);
  }

  const completedMap = getAllRCAFoundationProgress();

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '1.5rem 1rem', width: '100%', boxSizing: 'border-box', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

      {/* ── Right nav sidebar ── */}
      <div className="pal-foundation-nav" style={{
        width: '190px', flexShrink: 0, order: 2,
        position: 'sticky', top: '1rem',
        maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '0.75rem 0.5rem',
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 0.4rem', marginBottom: '0.5rem' }}>
          RCA Foundations
        </div>
        {rcaFoundationModules.map((m) => {
          const isCurrent = m.id === moduleId;
          const isDone = !!completedMap[m.id];
          const isStub = !!m.isStub;
          const isLocked = !m.isFree && !unlocked;
          const isBlocked = isStub || isLocked;
          return (
            <button
              key={m.id}
              onClick={() => !isBlocked && onSelectModule && onSelectModule(m.id)}
              style={{
                display: 'flex', alignItems: 'baseline', gap: '0.35rem',
                width: '100%', textAlign: 'left',
                padding: '0.28rem 0.4rem', borderRadius: '5px', border: 'none',
                background: isCurrent ? 'var(--teal-bg)' : 'transparent',
                color: isCurrent ? 'var(--teal)' : (isStub || isLocked) ? 'var(--text-muted)' : isDone ? 'var(--teal)' : 'var(--text)',
                fontSize: '0.75rem', lineHeight: 1.4,
                cursor: isBlocked ? 'default' : 'pointer',
                opacity: isStub ? 0.4 : isLocked ? 0.55 : 1,
                marginBottom: '0.1rem',
                fontWeight: isCurrent ? 700 : 400,
              }}
              title={isStub ? 'Coming soon' : isLocked ? 'Unlock to access' : m.title}
            >
              <span style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontSize: '0.68rem', color: isCurrent ? 'var(--teal)' : 'var(--text-muted)', minWidth: '1.4rem' }}>{m.index}.</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isStub ? '' : isLocked ? '🔒 ' : isDone && !isCurrent ? '✓ ' : ''}{m.title}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main content column ── */}
      <div style={{ flex: 1, minWidth: 0, order: 1 }}>
      {/* Nav bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.2rem 0',
        }}>
          ← All modules
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Module {module.index} of {rcaFoundationModules.length}
          </span>
          {completed && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
              background: 'var(--teal-bg)', color: 'var(--teal)',
              border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)',
            }}>
              ✓ Complete
            </span>
          )}
        </div>
      </div>

      {/* Module header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>
          {module.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>{module.subtitle}</p>
      </div>

      {/* Module content */}
      <HowTo skill={module.subtitle} steps={['Read the situation — understand the real-world context this concept solves', 'Interact with the demo — adjust sliders, make selections, observe what changes', 'Answer the question — test your understanding before moving on']} color="var(--teal)" />
      {ModuleComponent && <ModuleComponent onComplete={handleComplete} />}

      {/* Post-completion: connection + playbook links + next */}
      {completed && (
        <div className="pal-reveal-in" style={{ marginTop: '1.75rem' }}>
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginBottom: '1rem',
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' }}>
              Why this matters for RCA practice
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}>
              {module.connection}
            </div>
          </div>

          {module.playbookLinks && module.playbookLinks.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                Playbook reading
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {module.playbookLinks.map(link => (
                  <span key={link.id} style={{
                    fontSize: '0.78rem', padding: '0.2rem 0.55rem',
                    background: 'var(--teal-bg)', color: 'var(--teal)',
                    border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontWeight: 500,
                  }}>
                    {link.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button onClick={onNext} className="pal-glow-pulse" style={{
            padding: '0.65rem 1.6rem', background: 'var(--teal)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700,
            fontSize: '0.9rem', cursor: 'pointer',
          }}>
            {module.index < rcaFoundationModules.length ? 'Next module →' : 'Back to all modules'}
          </button>

          {/* Notes */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              My Notes
            </div>
            <textarea
              value={note}
              onChange={e => { setNote(e.target.value); saveNote('rca-foundations', moduleId, e.target.value); }}
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
        </div>
      )}
      </div>{/* end main content column */}
    </div>
  );
}
