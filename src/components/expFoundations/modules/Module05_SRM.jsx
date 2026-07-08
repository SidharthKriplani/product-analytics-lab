import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox as SharedInsightBox, NextBtn as SharedNextBtn, MCQOption, CheckBtn as SharedCheckBtn, InstructionBox as SharedInstructionBox } from '../../shared/FoundationPrimitives.jsx';

function InsightBox(props) { return <SharedInsightBox color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)' {...props} />; }
function NextBtn(props) { return <SharedNextBtn color='var(--accent)' {...props} />; }
function CheckBtn(props) { return <SharedCheckBtn color='var(--accent)' {...props} />; }
function InstructionBox(props) { return <SharedInstructionBox color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)' {...props} />; }

function saveEFState(id, state) { try { localStorage.setItem('pal-ef-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadEFState(id) { try { var raw = localStorage.getItem('pal-ef-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleEF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

export function Module_EF05({ onComplete }) {
  var saved05 = useMemo(function() { return loadEFState('ef05'); }, []);
  var [controlN, setControlN] = useState(function() { return saved05 && saved05.controlN !== undefined ? saved05.controlN : 50213; });
  var [treatmentN, setTreatmentN] = useState(function() { return saved05 && saved05.treatmentN !== undefined ? saved05.treatmentN : 48891; });
  var [mcqAnswer, setMcqAnswer] = useState(function() { return saved05 ? saved05.mcqAnswer : null; });
  var [mcqRevealed, setMcqRevealed] = useState(function() { return saved05 ? saved05.mcqRevealed : false; });

  useEffect(function() {
    saveEFState('ef05', { controlN: controlN, treatmentN: treatmentN, mcqAnswer: mcqAnswer, mcqRevealed: mcqRevealed });
  }, [controlN, treatmentN, mcqAnswer, mcqRevealed]);

  // SRM calculation
  var total = controlN + treatmentN;
  var expectedEach = total / 2;
  var chiSq = total > 0 ? (Math.pow(controlN - expectedEach, 2) / expectedEach + Math.pow(treatmentN - expectedEach, 2) / expectedEach) : 0;
  var observedRatio = total > 0 ? (controlN / total * 100).toFixed(1) : '50.0';
  var treatmentRatio = total > 0 ? (treatmentN / total * 100).toFixed(1) : '50.0';

  // Approximate p-value from chi-squared (1 df) using rough thresholds
  var pValue = 'p > 0.05';
  var srmStatus = 'green';
  if (chiSq > 10.83) { pValue = 'p < 0.001'; srmStatus = 'red'; }
  else if (chiSq > 6.63) { pValue = 'p < 0.01'; srmStatus = 'red'; }
  else if (chiSq > 3.84) { pValue = 'p < 0.05'; srmStatus = 'red'; }
  else if (chiSq > 2.71) { pValue = 'p < 0.10'; srmStatus = 'yellow'; }

  var statusColor = srmStatus === 'red' ? 'var(--red)' : srmStatus === 'yellow' ? 'var(--yellow)' : 'var(--teal)';
  var statusLabel = srmStatus === 'red' ? 'SRM DETECTED' : srmStatus === 'yellow' ? 'BORDERLINE' : 'NO SRM';
  var statusBg = srmStatus === 'red' ? 'var(--red-bg)' : srmStatus === 'yellow' ? 'var(--yellow-bg)' : 'var(--teal-bg)';
  var statusBorder = srmStatus === 'red' ? 'var(--red-border)' : srmStatus === 'yellow' ? 'var(--yellow-border)' : 'var(--teal-border)';

  var mcqOptions = [
    { label: 'A. Proceed with the analysis anyway — a split this close to 50/50 is well within normal sampling noise for practical purposes', correct: false },
    { label: 'B. Re-weight the metric results by the expected 50/50 ratio, mathematically compensating for the imbalance before comparing arms', correct: false },
    { label: 'C. Flag the SRM, halt the analysis, and investigate the assignment and logging pipeline before trusting any of the results', correct: true },
    { label: 'D. Extend the experiment runtime and assume the ratios will naturally balance out on their own over more time', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          You run a 50/50 A/B test for a week. The dashboard shows 52% of sessions in control, 48% in treatment. The gap is small — maybe four percentage points. The experiment otherwise looks clean: good traffic, stable metrics, no obvious data pipeline issues. The PM wants to move on to interpreting the results.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Stop. The split you observe tells you something critical about the integrity of the assignment process. "Approximately 50/50" is quantifiable. You can calculate exactly how likely a given deviation is under a working randomization system. The naive response: it's just noise, carry on. But if the assignment system is working correctly, a 52/48 deviation across a large experiment is extremely improbable. A chi-square test on your assignment counts answers this precisely: given the expected 50/50 split, how likely is this deviation by chance? If the answer is p &lt; 0.01, you're not looking at noise. You're looking at a broken randomization process.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          What could break it? Bot filters that fire differently by variant. Assignment logic that hashes user IDs incorrectly at a particular hash boundary. A caching layer that serves the same variant to users who should have been re-assigned. A logging bug that drops events more in one arm than the other. Any of these produce a split that looks like 52/48 — and any of them mean your treatment and control groups are no longer comparable in the way you assumed.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          This is a Sample Ratio Mismatch (SRM). The ratio of samples you observed does not match the ratio you intended. If the groups aren't formed correctly, every metric comparison between them is potentially biased. You cannot trust any of the outcome data — not conversion rate, not session length, not revenue — because the people in each arm are systematically different from what randomization was supposed to ensure. The only correct response to a confirmed SRM is to pause the experiment, diagnose the root cause, fix it, and relaunch.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          At what point does a split deviation become a SRM rather than random noise? Is it determined by the size of the deviation (e.g., 52/48 vs 50.1/49.9) or by something else? Work through the logic from the prose before checking.
        </p>
      </div>

      {/* ── SRM Detector ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>SRM Detector</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
          Adjust the user counts below to see when Sample Ratio Mismatch appears. The chi-squared test compares observed counts against the expected 50/50 split. Try making the counts equal to see the green light, then skew them to watch SRM emerge.
        </p>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          {/* Input controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Control users
              </label>
              <input type='number' min={1000} max={200000} step={100} value={controlN} onChange={function(e) { setControlN(Math.max(1000, Number(e.target.value))); }} style={{
                width: '100%', padding: '0.45rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                background: 'var(--surface-2)', color: 'var(--text)', fontSize: '1rem', fontWeight: 700,
              }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Treatment users
              </label>
              <input type='number' min={1000} max={200000} step={100} value={treatmentN} onChange={function(e) { setTreatmentN(Math.max(1000, Number(e.target.value))); }} style={{
                width: '100%', padding: '0.45rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                background: 'var(--surface-2)', color: 'var(--text)', fontSize: '1rem', fontWeight: 700,
              }} />
            </div>
          </div>

          {/* Traffic light */}
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: statusBg, border: '1.5px solid ' + statusBorder,
            textAlign: 'center', marginBottom: '1rem',
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: statusColor }}>{statusLabel}</div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(150px, 100%), 1fr))', gap: '0.5rem' }}>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Expected</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>50.0% / 50.0%</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Observed</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: srmStatus !== 'green' ? statusColor : 'var(--text)' }}>{observedRatio}% / {treatmentRatio}%</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Chi-squared</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>{chiSq.toFixed(2)}</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>p-value</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: statusColor }}>{pValue}</div>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            SRM threshold: chi-squared &gt; 3.84 (p &lt; 0.05). Common root causes: bot filtering applied asymmetrically, redirect latency in treatment, logging bugs on one code path, or assignment before eligibility check.
          </div>
        </div>
      </div>

      {/* ── The Framework ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Framework</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Before reading any experiment results, run the SRM check first. Compare observed user counts per arm to the expected split using a chi-squared test. If p &lt; 0.05, stop. Do not proceed to metric analysis. Do not re-weight. Do not extend the experiment. Investigate why the split is wrong, fix the root cause, and re-run. SRM means your groups are no longer the random samples you intended, and no statistical adjustment can recover valid causal inference from broken randomization.
        </p>
      </div>

      {/* ── Quick Check ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Check</div>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          You detect SRM in your experiment (control: 50,213, treatment: 48,891, expected 50/50). Your PM argues: "It's only a 1.3% imbalance — let's just re-weight and proceed." What is the correct response?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {mcqOptions.map(function(opt, i) {
            return (
              <MCQOption key={i} label={opt.label} selected={mcqAnswer === i} correct={opt.correct} revealed={mcqRevealed} onClick={function() { if (!mcqRevealed) setMcqAnswer(i); }} />
            );
          })}
        </div>
        {mcqAnswer !== null && !mcqRevealed && (
          <CheckBtn onClick={function() { setMcqRevealed(true); }} />
        )}
        {mcqRevealed && (
          <div className='pal-reveal-in' style={{
            marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', lineHeight: 1.55,
            background: mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            color: 'var(--text)',
          }}>
            <strong>{mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'Correct. ' : 'Not quite. '}</strong>
            Re-weighting doesn't fix SRM because you don't know which users were systematically excluded or over-included. Extending the experiment cannot correct a broken assignment pipeline. The only valid path: pause, investigate the root cause (bot filtering, redirect latency, logging bugs), fix it, and re-run from scratch.
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {mcqRevealed && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            What matters is not the percentage deviation alone, but the deviation relative to the expected count. With 1 million sessions, a 52/48 split produces an enormous chi-square statistic — it's almost certainly a SRM. With 100 sessions, the same 52/48 split is easily explained by chance. This is why the chi-square test, not a threshold on the percentage, is the right tool.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {mcqRevealed && (
        <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Run the SRM check before looking at any outcome metric. Always. It takes 30 seconds — compare observed counts to expected counts with a chi-square test. If the p-value is below 0.01, you stop there. Interpreting outcome metrics from an SRM-compromised experiment and then discovering the SRM later is a waste of everyone's time and a source of confidently wrong conclusions.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> If you find an SRM, don't guess at the root cause — systematically go through the pipeline. Assignment logic → logging → filtering → data joins. Each is a potential failure point. The most common culprits are bot filtering (bots removed from one arm but not the other), caching (assignment overridden by a cached response), and logging drops (one variant's events are less reliably captured). Document the investigation regardless of outcome.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> A small, non-significant SRM in a large experiment doesn't mean the randomization is perfect — it means it cleared a threshold. Don't treat SRM checks as binary. Track the chi-square statistic over time during the experiment; a trend toward a higher statistic as data accumulates is an early warning sign of a systematic problem, even before it crosses significance.</p>
          </div>
        </div>
      )}

      {mcqRevealed && (
        <NextBtn onClick={onComplete} />
      )}
    </div>
  );
}
