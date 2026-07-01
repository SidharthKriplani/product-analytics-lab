import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

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
    'The primary cause has been identified and a fix deployed — monitoring the metric for recovery confirms the RCA was correct',
    'The largest single cause has been found and explains the majority of the drop — diminishing returns make further investigation inefficient',
    'You can account for 100% of the metric delta with attributable causes — and removing each cause would restore the metric to baseline',
    'All plausible hypotheses from the fault tree have been investigated and either confirmed or ruled out, regardless of whether they close the full delta',
  ],
  correct: 2,
  explanation: 'An RCA is complete when every percentage point of the delta is attributed — and when you can logically demonstrate that removing each cause would restore the metric. Option A confuses deploying a fix with completing the analysis — monitoring recovery is verification, not RCA completion. Option B is the most common mistake: stopping at the "majority" cause feels efficient but leaves hidden regressions in production. Option D sounds thorough but is process-oriented rather than outcome-oriented — you could investigate every hypothesis and still not close the delta if your fault tree was incomplete.',
};

export function Module_RF12({ onComplete }) {
  const _saved12 = useMemo(function() { return loadRFState('rf12'); }, []);
  const [active, setActive] = useState(function() { return _saved12 && _saved12.active ? _saved12.active : { pipeline: true, seasonal: true, regression: true }; });
  const [mcqSel, setMcqSel] = useState(function() { return _saved12 && _saved12.mcqSel != null ? _saved12.mcqSel : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved12 ? !!_saved12.mcqRevealed : false; });

  useEffect(function() { saveRFState('rf12', { active: active, mcqSel: mcqSel, mcqRevealed: mcqRevealed }); }, [active, mcqSel, mcqRevealed]);

  function toggle(id) {
    setActive(function(prev) { return Object.assign({}, prev, { [id]: !prev[id] }); });
  }

  const explainedDrop = CAUSES.reduce(function(sum, c) {
    return sum + (active[c.id] ? c.contribution : 0);
  }, 0);
  const unexplained = Math.max(0, TOTAL_DROP - explainedDrop);

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>You find a logging bug that explains 40% of a metric drop. The engineering team ships a fix. The metric recovers — partially. It recovers 40%. The other 60% remains. The meeting reconvenes. Everyone is confused. The fix was correct, the root cause was real — but the investigation is not complete.</p>
        <p style={prose}>This is the most dangerous moment in a multi-cause investigation: the first plausible cause confirmed, the first fix deployed, the recovery partial. The failure mode is stopping here, attributing the partial recovery to the fix propagating slowly, and closing the incident. In six weeks, the metric is still 60% below its pre-incident level, and the second investigation starts from scratch with the wrong starting assumption.</p>
        <p style={prose}>Real incidents have multiple causes more often than they have single causes. Causes can mask each other. A logging bug that removes 40% of your event volume will make a product regression look 40% smaller than it is. Fix the logging bug, and suddenly the product regression appears — not because something new broke, but because the measurement layer is now accurate enough to see what was always there. This interaction between causes is the defining feature of multi-level RCA.</p>
        <p style={prose}>The test is rigorous and should be applied to every confirmed cause before the investigation closes: if only this cause were removed — if nothing else changed — would the full drop still exist? If the answer is yes, the investigation is not complete. There is at least one other contributing cause. After each candidate cause is confirmed, recompute what the metric would look like with only that cause removed, and compare it to the observed data. If the residual is larger than noise, more causes exist.</p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>You confirm a logging bug that explains 40% of a 30-point DAU drop. You deploy the fix and the metric recovers to -18%. What are the two things you must determine before closing the investigation?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
        A total metric drop of -22% is explained by three overlapping causes across different diagnostic layers. Toggle each cause on or off to see how the unexplained gap changes — and to understand why stopping at the first plausible cause produces an incomplete RCA.
      </p>

      {/* Total drop banner */}
      <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--red)', fontWeight: 700 }}>Observed metric drop: -22%</span>
        <span style={{ fontSize: '0.82rem', color: unexplained === 0 ? 'var(--teal)' : 'var(--red)', fontWeight: 700 }}>
          {unexplained === 0 ? 'Fully explained' : 'Unexplained: -' + unexplained + '%'}
        </span>
      </div>

      {/* Contribution bar */}
      <div>
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
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Click Remove on each cause to see how the unexplained gap grows — then add them all back to confirm all 22 percentage points are accounted for.
      </div>
      {CAUSES.map(function(c) {
        const isOn = active[c.id];
        return (
          <div key={c.id} style={{
            background: isOn ? c.bg : 'var(--surface-2)',
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
        <div style={{ padding: '0.65rem 0.9rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.55 }}>
          All 22 percentage points are attributed. The RCA is complete. Note that only Cause 3 (product regression) requires a code fix — the other two are informational and close without action.
        </div>
      )}

      {/* MCQ */}
      <div>
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
          <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>
            {RF12_MCQ.explanation}
          </div>
        )}
      </div>

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {mcqRevealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>You must determine (1) whether the remaining -18% is above the noise floor of the metric — if the metric has 3-point day-to-day variance, an 18-point residual is clearly real and requires further investigation; and (2) whether the second cause was masked by the first — the logging bug may have made a real behavioral problem invisible, and the current -18% may be the true behavioral decline that was always there but hidden. Closing at -18% without investigating both would be an incomplete RCA.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {mcqRevealed && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> After every confirmed cause and fix, re-examine the metric and ask: does the remaining gap exceed the metric&apos;s normal variance? If the remaining gap is 3 points and your metric varies by 2–4 points day-to-day, that&apos;s noise. If it&apos;s 15 points, it&apos;s a second cause. Don&apos;t close the investigation based on confirmation of the first cause alone.</p>
            <p style={prose}><strong>Two.</strong> When you present a multi-cause RCA, present the causes in the order they were discovered and the order they need to be fixed, separately. These orders are often different. Cause A might have been discovered first, but cause B needs to be fixed first because cause A&apos;s fix only makes sense after B is resolved.</p>
            <p style={prose}><strong>Three.</strong> The most common senior analyst error is the satisficing stop: finding an explanation that&apos;s plausible, internally consistent, and relieves the pressure — and stopping. Always apply the residual test. If the full drop is not explained by the confirmed causes, the investigation is not done. Write this explicitly into your post-mortem template as a mandatory section.</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {mcqRevealed && <NextBtn onClick={onComplete} />}
    </div>
  );
}
