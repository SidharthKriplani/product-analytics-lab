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

// ── Module EF07: Multiple Testing and Guardrails ────────────────────────────
export function Module_EF07({ onComplete }) {
  var saved07 = useMemo(function() { return loadEFState('ef07'); }, []);
  var [numMetrics, setNumMetrics] = useState(function() { return saved07 && saved07.numMetrics !== undefined ? saved07.numMetrics : 1; });
  var [mcqAnswer, setMcqAnswer] = useState(function() { return saved07 ? saved07.mcqAnswer : null; });
  var [mcqRevealed, setMcqRevealed] = useState(function() { return saved07 ? saved07.mcqRevealed : false; });

  useEffect(function() {
    saveEFState('ef07', { numMetrics: numMetrics, mcqAnswer: mcqAnswer, mcqRevealed: mcqRevealed });
  }, [numMetrics, mcqAnswer, mcqRevealed]);

  // Calculations
  var pAtLeastOne = 1 - Math.pow(0.95, numMetrics);
  var pAtLeastOnePct = Math.round(pAtLeastOne * 1000) / 10;
  var expectedFP = Math.round(numMetrics * 0.05 * 100) / 100;
  var bonferroniAlpha = Math.round(0.05 / numMetrics * 10000) / 10000;

  // Grid of 20 squares — color expected FP count red
  var gridSquares = [];
  var fpInGrid = Math.min(20, Math.round(pAtLeastOne * 20));
  for (var sq = 0; sq < 20; sq++) {
    gridSquares.push(sq < fpInGrid ? 'fp' : 'ok');
  }

  var mcqOptions = [
    { label: 'A. Always test at alpha = 0.05 regardless of how many metrics — each test is independent', correct: false },
    { label: 'B. Apply Bonferroni correction: divide alpha by the number of metrics tested, keeping family-wise error at 5%', correct: true },
    { label: 'C. Only report the metric with the smallest p-value — it is the most likely to be real', correct: false },
    { label: 'D. Remove non-significant metrics from the report to reduce the multiple testing burden', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Your experiment readout has twenty metrics. Three of them show p &lt; 0.05 and a positive direction. The team is excited — three wins out of twenty metrics is a strong result. The PM wants to headline all three in the launch announcement.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Before you do: how many of those twenty tests would you expect to show p &lt; 0.05 if the treatment had absolutely zero effect on anything? At alpha = 0.05, you expect roughly one false positive per twenty tests just by chance. You\'re looking at three significant results out of twenty, and you should expect one to be noise by construction. At least one of your three wins is likely a false positive — you just don\'t know which one.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          A 5% false positive rate per test does not give you a 5% false positive rate per experiment. The rates compound. With twenty independent tests each at alpha = 0.05, the probability of at least one false positive in the experiment is 1 − (0.95)²⁰ ≈ 64%. You designed a procedure with a 5% false positive rate per metric and ended up with a 64% false positive rate per experiment readout.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The forced requirement: adjust the per-test threshold to control the error rate at the experiment level, not the metric level. The simplest correction is Bonferroni: divide alpha by the number of tests. Twenty tests at an experiment-level alpha of 0.05 means each individual test requires p &lt; 0.0025 to be called significant. This also explains guardrail metrics. You have a small number of primary metrics the experiment is designed to move, and a set of guardrail metrics you watch to catch regressions. Guardrails are tested at a stricter threshold because you\'re looking for problems, not wins.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>If you run 20 independent tests each at alpha = 0.05, and the treatment has zero effect on anything, how many significant results do you expect? What is the probability of at least one false positive? Work through the calculation before checking.</p>
      </div>

      {/* ── The Concept + Interactive Demo ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>False Positive Simulator</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
          Drag the slider to increase the number of metrics tested. Watch the probability of at least one false positive climb — and the red squares multiply. At 14 metrics, it\'s a coin flip. At 20, it\'s almost two-thirds.
        </p>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          {/* Slider */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Number of metrics tested: <strong style={{ color: numMetrics >= 14 ? 'var(--red)' : numMetrics >= 5 ? 'var(--yellow)' : 'var(--text)' }}>{numMetrics}</strong>
            </label>
            <input type='range' min={1} max={20} step={1} value={numMetrics} onChange={function(e) { setNumMetrics(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          {/* Stats display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>P(at least 1 false positive)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: pAtLeastOnePct > 50 ? 'var(--red)' : pAtLeastOnePct > 20 ? 'var(--yellow)' : 'var(--teal)' }}>{pAtLeastOnePct}%</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>Expected false positives</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{expectedFP}</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>Bonferroni alpha</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{bonferroniAlpha}</div>
            </div>
          </div>

          {/* Visual grid — 20 squares */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Out of 20 experiments with no real effect, how many would show a "significant" result?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px', maxWidth: '280px' }}>
              {gridSquares.map(function(status, i) {
                return (
                  <div key={i} style={{
                    width: '100%', paddingBottom: '100%', borderRadius: '3px',
                    background: status === 'fp' ? 'var(--red)' : 'var(--surface-2)',
                    border: '1px solid ' + (status === 'fp' ? 'var(--red)' : 'var(--border)'),
                    opacity: status === 'fp' ? 0.85 : 1,
                  }} />
                );
              })}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Each red square = an experiment that would produce a false positive by chance alone
            </div>
          </div>

          {numMetrics >= 14 && (
            <div className='pal-reveal-in' style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--red-bg)', border: '1px solid var(--red-border)', fontSize: '0.84rem', color: 'var(--red)', lineHeight: 1.55 }}>
              At {numMetrics} metrics, there\'s a {pAtLeastOnePct}% chance of at least one false positive. Without correction, finding a "significant" result is more likely than not — even if the treatment did nothing.
            </div>
          )}
        </div>
      </div>

      {/* ── The Framework ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Framework</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Pre-specify your primary metric before running the experiment — this is the one metric you evaluate at alpha = 0.05 without correction. For all secondary and guardrail metrics, apply a Bonferroni correction (divide alpha by the number of tests) or Benjamini-Hochberg (less conservative, controls false discovery rate instead of family-wise error). Never data-mine your metric list after seeing results — picking the one that "happened to be significant" is p-hacking, and experienced interviewers will probe for it.
        </p>
      </div>

      {/* ── Quick Check ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Check</div>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          Your experiment tracks 20 metrics. What is the correct way to evaluate secondary and guardrail metrics?
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
            Bonferroni sets the per-test alpha to 0.05 / 20 = 0.0025. This keeps the family-wise error rate at 5% — the probability of any false positive across all 20 tests stays at 5%. It is conservative (may miss real effects), but simple and appropriate for guardrail metrics where false positives are costly. Options C and D are forms of p-hacking — cherry-picking results after seeing them.
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {mcqRevealed && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Expected false positives = 0.05 × 20 = 1. Probability of at least one = 1 − (0.95)²⁰ ≈ 64%. If you run twenty-metric null experiments repeatedly, roughly two in three readouts will include at least one significant result. This is why celebrating "three wins out of twenty" requires knowing what you\'d expect from chance alone.</p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {mcqRevealed && (
        <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Before any experiment launches, declare the primary metric and the maximum number of tests that will be used to evaluate it. This is the decision boundary. Secondary metrics can be reported, but significance for secondary metrics is not the basis for calling the experiment a win or loss. The primary metric is.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> When someone presents an experiment with many significant secondary metrics and a non-significant primary metric, ask: what is the false positive rate across all the tests that were run? If twenty metrics were tested, at least one significant result is expected by chance. Non-significant primary + significant secondary is not a win — it\'s a null result with noise.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Distinguish between exploratory and confirmatory analyses at the start of the experiment. Exploratory: looking at many metrics to generate hypotheses for future experiments. Confirmatory: testing a pre-registered primary metric. Apply Bonferroni (or an equivalent correction) to confirmatory tests. Report exploratory findings with the caveat that they are hypothesis-generating, not conclusive.</p>
          </div>
        </div>
      )}

      {mcqRevealed && (
        <NextBtn onClick={onComplete} />
      )}
    </div>
  );
}
