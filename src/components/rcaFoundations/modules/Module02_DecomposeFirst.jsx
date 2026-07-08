import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const DECOMPS_RF02 = [
  { id: 'new',   label: 'New user installs',        correct: true,  explanation: 'New user acquisition failure = marketing or app store change.' },
  { id: 'ret',   label: 'D1/D7/D30 retention rate', correct: true,  explanation: 'Retention collapse = product or notification change.' },
  { id: 'res',   label: 'Resurrected users',         correct: true,  explanation: 'Resurr drop = re-engagement campaign stopped or push notifications disabled.' },
  { id: 'rev',   label: 'Revenue per user',          correct: false, explanation: 'Revenue is a lagging output metric, not a DAU driver. This does not explain the drop.' },
  { id: 'churn', label: 'Churned user rate',          correct: true,  explanation: 'Churn spike = product problem or external pressure causing users to leave.' },
  { id: 'sess',  label: 'Session count per user',    correct: false, explanation: 'Sessions per user explains engagement depth, not DAU headcount. Useful after decomposing DAU.' },
];

export function Module_RF02({ onComplete }) {
  const SCENARIO = 'WhatsApp DAU drops 18% week-over-week, from 42M to 34.4M. Your PM asks: "What happened?"';

  const _saved02 = useMemo(function() { return loadRFState('rf02'); }, []);
  const [decomps02] = useState(function() { return _saved02 && _saved02.decomps ? _saved02.decomps : shuffleArr(DECOMPS_RF02); });
  const [selected, setSelected] = useState(function() { return new Set(_saved02 && _saved02.selected ? _saved02.selected : []); });
  const [revealed, setRevealed] = useState(function() { return _saved02 ? !!_saved02.revealed : false; });

  useEffect(function() { saveRFState('rf02', { decomps: decomps02, selected: Array.from(selected), revealed: revealed }); }, [decomps02, selected, revealed]);

  function toggle(id) {
    if (revealed) return;
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const correctIds = new Set(decomps02.filter(d => d.correct).map(d => d.id));

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>
          The war-room call has been running for forty minutes. Someone says &quot;DAU is down 20%, it must be the onboarding change we shipped.&quot; The PM nods. An engineer starts reviewing the onboarding deploy. Another analyst is already querying first-session events.
        </p>
        <p style={prose}>
          Stop. A 20% drop in DAU is not a statement about onboarding. It&apos;s a statement about a number that aggregates three completely separate populations: new users who came in from acquisition, existing users who came back (retained), and churned users who returned (resurrected). A 20% drop could mean new user acquisition collapsed, retention cratered for an existing cohort, resurrected users stopped returning, or all three shifted simultaneously. These have completely different fixes.
        </p>
        <p style={prose}>
          Jumping to a cause before breaking the metric apart is the single most common RCA mistake. The fix is not a better hypothesis. It&apos;s a prior step that happens before any hypothesis: decompose the metric into the components that add up to it, measure the contribution of each, and locate where the drop lives before guessing why it happened.
        </p>
        <p style={prose}>
          For DAU, the decomposition is: DAU = New Users + Retained Users + Resurrected Users. Each term has a distinct owner, a distinct cause structure, and a distinct fix space. This isn&apos;t just helpful — it&apos;s mathematically forced. DAU is a sum. A sum can only drop if at least one addend drops. Finding which addend dropped is not an analytical judgment — it&apos;s arithmetic. There&apos;s no universe where the arithmetic is wrong.
        </p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>If DAU drops 20% but retained users drop only 5%, what does that tell you about the relative size of the new user or resurrected user buckets? Does a 5% drop in one bucket explain a 20% drop in the total?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* === INTERACTIVE JSX === */}
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
                display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left', minHeight: 40, boxSizing: 'border-box',
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
                  {d.correct ? <Icon name='check' size={13} color='var(--green)' /> : <Icon name='x' size={13} color='var(--red)' />} {d.explanation}
                </div>
              )}
            </div>
          );
        })}

        {!revealed && selected.size > 0 && (
          <button onClick={() => setRevealed(true)} style={{
            marginTop: '0.75rem', padding: '0.55rem 1.2rem', minHeight: 40,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--teal)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
          }}>
            Check
          </button>
        )}
      </div>

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {revealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>A 5% drop in retained users can only explain 20% of DAU if retained users represent 80% or more of total DAU — which is possible for a mature product. For a high-growth product where new users are 40% of DAU, a 5% drop in retained users explains only ~3% of the aggregate drop. The arithmetic forces you to look at the other buckets. Decomposition makes this obvious before you write a single query.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {revealed && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Before generating any hypothesis about cause, write the decomposition of the metric on a whiteboard or in a doc. Every person in the investigation should agree on which components add up to the total before anyone speculates about mechanism. This takes three minutes and prevents the team from splitting across incompatible hypotheses.</p>
            <p style={prose}><strong>Two.</strong> When someone says &quot;DAU is down, it must be X&quot; in a meeting, your response is always: &quot;which component of DAU is driving the drop?&quot; If they can&apos;t answer, the hypothesis is premature. X might be a valid hypothesis — but only after the component is identified.</p>
            <p style={prose}><strong>Three.</strong> The decomposition query should be the first SQL you run in any metric drop investigation. It&apos;s a simple GROUP BY on the user type dimension, compared across time periods. Five minutes of query time buys you a scoped investigation instead of a scattered one.</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {revealed && <NextBtn onClick={onComplete} />}
    </div>
  );
}
