import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const FUNNEL_SCENARIOS = {
  baseline: [10000, 4200, 2100, 1600, 900],
  emailbug: [10000, 4200, 2100, 840, 900],
  trafficquality: [10000, 2100, 2100, 1600, 900],
};

const FUNNEL_STEP_NAMES = ['Visit', 'Signup click', 'Form complete', 'Email verify', 'Profile done'];

const MF09_MCQ = {
  question: 'In the baseline funnel, which step has the largest absolute user loss?',
  options: [
    'Visit → Signup click (5,800 users lost)',
    'Signup click → Form complete (2,100 users lost)',
    'Form complete → Email verify (500 users lost)',
    'Email verify → Profile done (700 users lost)',
  ],
  correct: 'Visit → Signup click (5,800 users lost)',
  explanation: 'Visit to Signup click loses 5,800 users in absolute terms — that is the largest single-step drop. Signup click to Form complete loses 2,100. End-to-end conversion fixation misses this; the largest absolute loss is always the priority.',
};

export function Module_MF09({ module, onNext }) {
  const saved09 = useMemo(function() { return loadMFState('mf09'); }, []);
  const [scenario, setScenario] = useState(function() { return saved09 && saved09.scenario ? saved09.scenario : 'baseline'; });
  const [selected, setSelected] = useState(function() { return saved09 ? saved09.selected : null; });
  const [revealed, setRevealed] = useState(function() { return saved09 ? saved09.revealed : false; });

  useEffect(function() {
    saveMFState('mf09', { scenario: scenario, selected: selected, revealed: revealed });
  }, [scenario, selected, revealed]);

  const counts = FUNNEL_SCENARIOS[scenario];
  const maxCount = counts[0];

  const biggestDropIdx = counts.reduce(function(bestIdx, _val, i) {
    if (i === 0) return bestIdx;
    const drop = counts[i - 1] - counts[i];
    const bestDrop = counts[bestIdx - 1] - counts[bestIdx];
    return drop > bestDrop ? i : bestIdx;
  }, 1);

  const biggestDropPct = Math.round(((counts[biggestDropIdx - 1] - counts[biggestDropIdx]) / counts[biggestDropIdx - 1]) * 100);

  function handleCheck() {
    if (selected !== null) setRevealed(true);
  }

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>A funnel is a sequence of steps that a user must complete to reach a desired outcome. Every step is a filter: some users proceed, some drop off. Funnel metrics measure what fraction of users proceed through each step and, by subtraction, where the losses occur.</p>
        <p style={prose}>The funnel structure is useful because it localizes problems. A product change that &quot;improves checkout&quot; is a vague intervention. A product change that specifically addresses the drop between payment entry and order confirmation is targeted &mdash; and its success can be measured at exactly that step.</p>
        <p style={prose}>The natural first approach when something seems wrong with a conversion process is to look at the end-to-end rate. Checkout conversion is down from 3.8% to 3.2%. That&apos;s the headline number. It drives urgency. But here&apos;s where it breaks.</p>
        <p style={prose}>The end-to-end rate is the product of every step&apos;s conversion rate multiplied together. A drop from 3.8% to 3.2% could be caused by a 0.5pp drop at the landing page step, a 2pp drop at the cart step, a 0.3pp drop at payment entry, or any combination. The aggregate number is equally consistent with all of these causes. You can&apos;t determine what to fix from the end-to-end rate alone.</p>
        <p style={prose}>What you actually need is the step-level rate: for every user who reached step N, what fraction reached step N+1? This is not the end-to-end rate broken into pieces &mdash; it&apos;s a different question. The end-to-end rate asks &quot;how many users who entered the funnel completed it?&quot; The step rate asks &quot;given a user arrived at this step, did they proceed?&quot; The step rate isolates the performance of each individual gate.</p>
        <p style={prose}>Once you have step rates, a drop in end-to-end conversion becomes a diagnostic search. You start from the first step and compare this period&apos;s rate to the baseline. The step where the rate dropped meaningfully is where you look next. Steps upstream and downstream of it are ruled out as causes.</p>
        <p style={prose}>Absolute step volume matters alongside the rate. A step rate can hold flat while volume collapses if the upstream drop reduced the population entering that step. Tracking both &mdash; how many users reached this step and how many proceeded &mdash; tells you whether a problem is in the funnel itself or upstream of it.</p>
        <p style={prose}>Let&apos;s take an example. Checkout conversion fell from 3.8% to 3.2%. You pull the step-level funnel. Landing page &rarr; Cart: 42.0% &rarr; 41.5%. Cart &rarr; Payment entry: 18.0% &rarr; 14.8%. Payment entry &rarr; Confirmation: 85.5% &rarr; 85.8%. The step that broke is cart &rarr; payment entry: down 3.2pp. Every other step is flat. The problem is between &quot;items in cart&quot; and &quot;entering payment.&quot; Without the funnel, every team defends their surface and nothing gets prioritized. With the funnel, the investigation has a single destination.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>Before toggling through the scenarios &mdash; in a funnel, is the step with the worst conversion rate always the step with the biggest absolute user loss? Or can they be different steps?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive ── */}
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
        Funnel analysis is how analysts find where value is lost in a multi-step flow. The end-to-end conversion rate is almost never the right number to report — the step-to-step drop rate is. Switch between scenarios below and watch how the pattern of loss shifts.
      </p>

      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Click a scenario to load it into the funnel — observe which step shows the largest drop and how the highlighted step changes between scenarios.
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[
            { key: 'baseline', label: 'Baseline' },
            { key: 'emailbug', label: 'Email bug (verify drops 60%)' },
            { key: 'trafficquality', label: 'Traffic quality issue (click drops 50%)' },
          ].map(function(s) {
            return (
              <button
                key={s.key}
                onClick={function() { setScenario(s.key); }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid ' + (scenario === s.key ? 'var(--green)' : 'var(--border)'),
                  background: scenario === s.key ? 'var(--green-bg)' : 'var(--surface)',
                  color: scenario === s.key ? 'var(--green)' : 'var(--text-muted)',
                  fontWeight: scenario === s.key ? 700 : 400,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >{s.label}</button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {FUNNEL_STEP_NAMES.map(function(name, i) {
            const pct = Math.round((counts[i] / maxCount) * 100);
            const dropPct = i > 0 ? Math.round(((counts[i - 1] - counts[i]) / counts[i - 1]) * 100) : null;
            const isWorstDrop = i === biggestDropIdx;
            return (
              <div key={name}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', width: '100px', flexShrink: 0 }}>{name}</div>
                  <div style={{ flex: 1, background: 'var(--surface-2, var(--border))', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
                    <div style={{
                      width: pct + '%',
                      height: '100%',
                      background: isWorstDrop ? 'var(--red)' : 'var(--green)',
                      borderRadius: '4px',
                      transition: 'width 0.35s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600, width: '52px', flexShrink: 0, textAlign: 'right' }}>
                    {counts[i].toLocaleString()}
                  </div>
                  {dropPct !== null && (
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isWorstDrop ? 'var(--red)' : 'var(--text-muted)',
                      width: '56px',
                      flexShrink: 0,
                      textAlign: 'right',
                    }}>
                      -{dropPct}%
                    </div>
                  )}
                  {dropPct === null && <div style={{ width: '56px', flexShrink: 0 }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        background: 'var(--yellow-bg)',
        border: '1.5px solid var(--yellow-border)',
        borderRadius: 'var(--radius)',
        padding: '0.85rem 1.1rem',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.55,
      }}>
        <strong style={{ color: 'var(--yellow)' }}>Biggest drop: </strong>
        {FUNNEL_STEP_NAMES[biggestDropIdx - 1]} to {FUNNEL_STEP_NAMES[biggestDropIdx]} — {biggestDropPct}% falloff. This is where to focus first.
      </div>

      <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
        Switch between scenarios and notice how the pattern of drop changes. Traffic quality issues appear at step 1; product bugs appear mid-funnel.
      </div>

      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>{MF09_MCQ.question}</div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Select the answer that correctly identifies the step with the largest absolute user loss in the baseline funnel, then click Check answer.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
          {MF09_MCQ.options.map(function(opt) {
            return (
              <MCQOption
                key={opt}
                label={opt}
                selected={selected === opt}
                correct={opt === MF09_MCQ.correct}
                revealed={revealed}
                onClick={function() { if (!revealed) setSelected(opt); }}
              />
            );
          })}
        </div>
        {!revealed && (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selected !== null ? 'var(--green)' : 'var(--border)',
              color: selected !== null ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: selected !== null ? 'pointer' : 'default',
            }}
          >Check answer</button>
        )}
        {revealed && (
          <div className="pal-reveal-in" style={{
            marginTop: '0.75rem',
            background: selected === MF09_MCQ.correct ? 'var(--green-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (selected === MF09_MCQ.correct ? 'var(--green-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
          }}>
            <strong>{selected === MF09_MCQ.correct ? 'Correct. ' : 'Not quite. '}</strong>{MF09_MCQ.explanation}
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {revealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>They can be different. A step early in the funnel with a moderate rate drop can produce a larger absolute user loss than a later step with a worse rate, simply because more users are exposed to it. The interactive shows this directly &mdash; the highlighted &apos;biggest drop&apos; step is often not the step with the lowest conversion rate. This is why funnel analysis requires both views: step rates tell you where the experience is broken; absolute loss tells you where fixing it would have the most impact.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {revealed && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Any report on checkout conversion or onboarding completion should include the step-level funnel alongside the end-to-end rate. Never present the end-to-end rate alone &mdash; it localizes nothing. The funnel chart should be the first visualization in any funnel-related analysis, not an appendix.</p>
            <p style={prose}><strong>Two.</strong> When designing an experiment on a funnel step, measure the primary metric at that specific step &mdash; not the end-to-end rate. The end-to-end rate dilutes the signal of a step-level treatment with noise from all other steps. If your experiment changes the cart page, your primary metric is cart-to-payment-entry rate, not checkout completion rate.</p>
            <p style={prose}><strong>Three.</strong> The common mistake is diagnosing a drop in end-to-end conversion by investigating all steps simultaneously. This turns one diagnostic question into five parallel investigations that produce conflicting theories. Always use the funnel to identify the single step that moved before starting any investigation. Rule out steps before investigating them.</p>
          </div>
        </div>
      )}

      {/* ── Key Insight + Connection ── */}
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} label="Complete module →" />
    </div>
  );
}
