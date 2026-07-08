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

export function Module_EF03({ onComplete }) {
  var saved03 = useMemo(function() { return loadEFState('ef03'); }, []);
  var [baseline, setBaseline] = useState(function() { return saved03 && saved03.baseline !== undefined ? saved03.baseline : 15; });
  var [mdeRel, setMdeRel] = useState(function() { return saved03 && saved03.mdeRel !== undefined ? saved03.mdeRel : 5; });
  var [sigLevel, setSigLevel] = useState(function() { return saved03 && saved03.sigLevel !== undefined ? saved03.sigLevel : 5; });
  var [triedPreset, setTriedPreset] = useState(function() { return saved03 ? saved03.triedPreset : false; });
  var [mcqAnswer, setMcqAnswer] = useState(function() { return saved03 ? saved03.mcqAnswer : null; });
  var [mcqRevealed, setMcqRevealed] = useState(function() { return saved03 ? saved03.mcqRevealed : false; });

  useEffect(function() {
    saveEFState('ef03', { baseline: baseline, mdeRel: mdeRel, sigLevel: sigLevel, triedPreset: triedPreset, mcqAnswer: mcqAnswer, mcqRevealed: mcqRevealed });
  }, [baseline, mdeRel, sigLevel, triedPreset, mcqAnswer, mcqRevealed]);

  // Z-scores for common alpha levels (two-tailed)
  function getZAlpha(alpha) {
    if (alpha <= 1) return 2.576;
    if (alpha <= 2) return 2.326;
    if (alpha <= 3) return 2.17;
    if (alpha <= 5) return 1.96;
    if (alpha <= 7) return 1.81;
    return 1.645;
  }
  var zAlpha = getZAlpha(sigLevel);
  var zBeta = 0.84; // 80% power

  var p = baseline / 100;
  var delta = p * (mdeRel / 100);
  var nPerArm = delta > 0 ? Math.ceil(Math.pow(zAlpha + zBeta, 2) * 2 * p * (1 - p) / Math.pow(delta, 2)) : 999999999;
  var dailyTraffic = 10000;
  var weeks = Math.ceil((nPerArm * 2 / dailyTraffic) / 7 * 10) / 10;

  function handlePreset() {
    setBaseline(15);
    setMdeRel(5);
    setSigLevel(5);
    setTriedPreset(true);
  }

  var mcqOptions = [
    { label: 'A. It doubles — required sample size scales linearly with the inverse of MDE, so halving MDE only doubles the sample', correct: false },
    { label: 'B. It quadruples — required sample size scales with 1 over MDE squared, so halving MDE means roughly 4x the needed sample', correct: true },
    { label: 'C. It stays about the same — MDE mainly shifts the analysis window, not the underlying required sample size', correct: false },
    { label: 'D. It depends entirely on the baseline conversion rate and traffic split, not on the MDE you choose to detect', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Your PM wants to test a new checkout flow. She asks: "How long will this take?" The honest answer is: it depends on how small an effect you're willing to miss. If the new checkout is genuinely 20% better, you'll see it quickly. If it's 1% better, you need an enormous amount of data. And if you don't calculate that number before you start, you'll run the experiment and interpret the result incorrectly regardless of what it shows.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The naive approach: run the experiment until you see something. Check the dashboard daily. When the results look meaningful, call it. But if the experiment was under-powered — not enough users, not enough time — then a null result is meaningless. You can't distinguish "the feature didn't work" from "the feature worked but we couldn't see it through the noise." And a significant result from stopping early inflates your false positive rate. Either way, the experiment was designed wrong before it started.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          What you need is a required sample size calculated before the experiment launches, based on three inputs you specify in advance. The first is the baseline metric — the current rate you're trying to move. The second is the minimum detectable effect (MDE): the smallest lift you actually care about detecting. Not the lift you expect — the smallest lift that would justify shipping. This is a business judgment. The MDE forces that conversation to happen before you run, not after.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The third is your acceptable error rates: alpha (false positive rate) and power (1 minus the false negative rate). The required sample size per arm follows from the formula n = (Z_α + Z_β)² × 2p(1−p) / δ², where δ is the absolute MDE. The critical behavior: sample size scales with 1/MDE². Halve the MDE and quadruple the required sample. Small changes to the MDE make massive differences to experiment runtime.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          If you halve the MDE (try to detect an effect half as large), what happens to the required sample size? Work through the 1/MDE² relationship from the formula above before touching the sliders.
        </p>
      </div>

      {/* ── Power Calculator ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Power Calculator Playground</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
          Drag the sliders to see how baseline rate, MDE, and significance level affect sample size. The formula: n per arm = (Z_alpha + Z_beta)^2 * 2p(1-p) / delta^2, where delta = baseline * relative MDE. Watch how small MDE changes cause massive sample size swings.
        </p>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          {/* Preset button */}
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={handlePreset} style={{
              padding: '0.55rem 0.9rem', minHeight: '40px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid var(--accent)', background: triedPreset ? 'var(--accent-bg)' : 'var(--surface)', color: 'var(--accent)',
            }}>
              Preset: Typical signup flow (15% baseline, 5% relative MDE)
            </button>
          </div>

          {/* Baseline slider */}
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Baseline rate: <strong style={{ color: 'var(--text)' }}>{baseline}%</strong>
            </label>
            <input type='range' min={1} max={50} step={1} value={baseline} onChange={function(e) { setBaseline(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          {/* MDE slider */}
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              MDE (relative lift): <strong style={{ color: 'var(--text)' }}>{mdeRel}%</strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(absolute: {(p * mdeRel / 100 * 100).toFixed(2)}pp)</span>
            </label>
            <input type='range' min={1} max={20} step={1} value={mdeRel} onChange={function(e) { setMdeRel(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          {/* Significance slider */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Significance level (alpha): <strong style={{ color: 'var(--text)' }}>{sigLevel}%</strong>
            </label>
            <input type='range' min={1} max={10} step={1} value={sigLevel} onChange={function(e) { setSigLevel(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          {/* Results display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>Sample per arm</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{nPerArm > 9999999 ? '---' : nPerArm.toLocaleString()}</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>Total sample (2 arms)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{nPerArm > 9999999 ? '---' : (nPerArm * 2).toLocaleString()}</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>At 10K users/day</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: weeks > 8 ? 'var(--red)' : weeks > 4 ? 'var(--yellow)' : 'var(--teal)' }}>
                {nPerArm > 9999999 ? '---' : weeks + ' weeks'}
              </div>
            </div>
          </div>

          {weeks > 8 && nPerArm < 9999999 && (
            <div className='pal-reveal-in' style={{ padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--red-bg)', border: '1px solid var(--red-border)', fontSize: '0.82rem', color: 'var(--red)', lineHeight: 1.5 }}>
              Over 8 weeks is a long experiment. Consider increasing MDE (accept detecting only larger effects) or narrowing your target population to boost the baseline rate.
            </div>
          )}
        </div>
      </div>

      {/* ── The Framework ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Framework</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Before running any experiment, answer three questions: <strong>(1)</strong> What is the baseline rate? <strong>(2)</strong> What is the smallest effect worth detecting (MDE)? <strong>(3)</strong> Does my traffic support the runtime the power calculation implies? If the answer to #3 is no, you have three options: accept a larger MDE, narrow the experiment to a higher-traffic segment, or don't run the experiment. Never run an underpowered test — a null result from an underpowered test is uninterpretable.
        </p>
      </div>

      {/* ── Quick Check ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Check</div>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          You halve your MDE from 2% relative to 1% relative. What happens to the required sample size?
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
            n is proportional to 1/MDE^2. Halving MDE means the ratio is 2, and 2^2 = 4. The sample quadruples. This is the single most important relationship in experiment sizing — small MDE ambitions create enormous sample requirements.
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {mcqRevealed && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Halving the MDE quadruples the sample size. This is not intuitive — most people expect halving the target to double the cost. The quadratic relationship is why "let's just detect smaller effects" is usually not a viable response to a slow experiment. The correct lever is the MDE, and it must be set based on business relevance, not ambition.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {mcqRevealed && (
        <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Run the power calculation before every experiment, not after. When the PM asks "how long will this take?" the answer is a number from a calculation, not a shrug and a guess. If the calculation returns eight weeks and you only have four, that's a conversation about the MDE — not a reason to wing it.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> The most common mistake: setting an optimistic MDE to get a short runtime, then interpreting a null result as confirmation the feature doesn't work. If you set MDE = 5% and the feature actually moved the metric by 2%, your experiment couldn't have detected it. A null result from an under-powered experiment is not evidence of no effect. Document the MDE assumption and what the null result does and doesn't mean.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> When reviewing someone else's experiment design, always check the MDE against the business context. Is the smallest detectable effect actually worth shipping? If the experiment can only detect a 20% relative lift and your product operates at 1% lift increments, the experiment design is misaligned with how decisions get made.</p>
          </div>
        </div>
      )}

      {mcqRevealed && (
        <NextBtn onClick={onComplete} />
      )}
    </div>
  );
}
