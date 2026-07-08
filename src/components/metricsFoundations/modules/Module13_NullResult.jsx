import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

export function Module_MF13({ module, onNext }) {
  const saved13 = useMemo(function() { return loadMFState('mf13'); }, []);
  const [n, setN] = useState(function() { return saved13 && saved13.n !== undefined ? saved13.n : 1000; });
  const [answer, setAnswer] = useState(function() { return saved13 && saved13.answer !== undefined ? saved13.answer : null; });
  const [revealed, setRevealed] = useState(function() { return saved13 ? saved13.revealed : false; });

  useEffect(function() {
    saveMFState('mf13', { n: n, answer: answer, revealed: revealed });
  }, [n, answer, revealed]);

  var OBSERVED = 2.5;
  var halfWidth = 3.5 * Math.sqrt(1000 / n);
  var ciLow = OBSERVED - halfWidth;
  var ciHigh = OBSERVED + halfWidth;
  var crossesZero = ciLow < 0 && ciHigh > 0;
  var isSignificant = !crossesZero;
  var provenNull = Math.abs(ciLow) < 0.5 && Math.abs(ciHigh) < 0.5;
  var verdict = isSignificant
    ? 'Significant — CI excludes 0; you have detected a real effect.'
    : (provenNull
      ? 'Proven ~no effect — the CI tightly hugs 0; even the largest plausible effect is tiny.'
      : 'Underpowered null — the CI straddles 0 and still includes meaningful wins. You cannot detect the effect, not prove it is absent.');

  var W = 420; var H = 92;
  var padL = 14; var padR = 14; var padT = 28; var padB = 24;
  var innerW = W - padL - padR;
  var axisY = padT + 18;
  var DMIN = -8; var DMAX = 10;
  function xOf(v) {
    var clamped = Math.max(DMIN, Math.min(DMAX, v));
    return padL + ((clamped - DMIN) / (DMAX - DMIN)) * innerW;
  }
  var zeroX = xOf(0);
  var ciColor = isSignificant ? 'var(--green)' : (provenNull ? 'var(--green)' : 'var(--yellow)');

  var mcqOptions = [
    { label: 'A. The feature does nothing at all — any non-significant p-value is proof the true underlying effect is exactly zero.', correct: false },
    { label: 'B. Underpowered: the wide CI (-1% to +6%) still contains a meaningful win, so "no effect" cannot be ruled out here.', correct: true },
    { label: 'C. The feature definitely helps users — the point estimate is positive, so the team should ship it immediately.', correct: false },
    { label: 'D. The metric itself must be broken somehow; keep rerunning the analysis until it finally reaches significance.', correct: false },
  ];

  function fmt(v) { return (v >= 0 ? '+' : '') + v.toFixed(1) + '%'; }

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>A null result means the experiment&apos;s data could not rule out zero effect at your chosen significance threshold. It does not mean the effect is zero. These are different statements, and conflating them produces a specific, systematic mistake: discarding real effects because the experiment couldn&apos;t see them.</p>
        <p style={prose}>The distinction matters because there&apos;s a mathematical reason an experiment might fail to detect a real effect: it was underpowered. Too few users, too noisy a metric, too small an effect to emerge above the noise floor. An underpowered experiment cannot distinguish a real-but-small effect from genuine flatness. When the result comes back non-significant, you don&apos;t know which of those two worlds you&apos;re in.</p>
        <p style={prose}>The natural response to a non-significant result is to interpret it as &quot;the feature didn&apos;t work.&quot; This is how it gets written in review decks: &quot;A/B test returned null &mdash; no detectable effect on checkout conversion.&quot; The feature gets killed or deprioritized. But here&apos;s where it breaks.</p>
        <p style={prose}>Your null result tells you exactly one thing: that your data did not produce a test statistic extreme enough to cross your significance threshold. That could mean the effect is zero. Or it could mean the effect is 2%, and your experiment &mdash; with 80,000 users per arm, measuring revenue per user &mdash; had a minimum detectable effect of 8%. You had no chance of seeing the 2% effect. The null result is a detection failure, not a verdict on the feature.</p>
        <p style={prose}>What you actually need, to interpret any null result, is the minimum detectable effect &mdash; the smallest effect your experiment was powered to find. The MDE is determined by your metric&apos;s variance, your sample size, your significance threshold, and your power target. Together these define the noise floor: anything below the MDE is invisible to this experiment. &quot;Not significant&quot; only means &quot;not above the noise floor&quot; &mdash; which is only the same as &quot;zero effect&quot; if the effect would have been above the noise floor if it existed.</p>
        <p style={prose}>The confidence interval makes this visible. A 95% CI that runs from -1% to +6% tells you: the data is consistent with any effect in that range. Zero is in that range &mdash; but so is a 5% positive effect. You haven&apos;t proven no effect; you&apos;ve proven you can&apos;t tell the difference between no effect and a 5% effect. By contrast, a 95% CI that runs from -0.2% to +0.3% tells you something much stronger: the data rules out effects larger than 0.3% in either direction. Now you have meaningful evidence that the effect is small. The first CI is a detection failure. The second is a bounded null.</p>
        <p style={prose}>Let&apos;s take an example. A product team tests a new onboarding tooltip sequence. After four weeks, non-significant result. Before killing the feature, you pull the MDE: metric is D7 retention, baseline 32%, 45,000 users per arm. At &alpha; = 0.05, 80% power: MDE &asymp; 1.8pp. The CI runs from -0.3pp to +3.1pp. The team was trying to detect a 1pp effect. The experiment could only have seen a 1.8pp effect or larger. A real 1pp improvement &mdash; worth shipping &mdash; was invisible to this experiment. The honest conclusion: &quot;We could not detect any effect above &plusmn;1.8pp. If we care about effects smaller than 1.8pp, we need a different approach &mdash; a lower-variance metric, a longer run, or more traffic.&quot; The feature is not dead. The experiment was under-powered.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>You ran an experiment with MDE of 3% and got a null result with a CI of [-0.5%, +2.8%]. Can you conclude the feature had no meaningful effect? What if the CI were [-0.3%, +0.4%]?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> The observed effect is fixed at +2.5%. Drag the sample-size slider and watch the 95% confidence interval tighten. Notice when it stops crossing zero — that is the moment you can finally tell a real effect from flat.
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 600 }}>Sample size per arm</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)' }}>{n.toLocaleString()}</span>
          </div>
          <input type="range" min={1000} max={40000} step={1000} value={n}
            onChange={function(e) { setN(parseInt(e.target.value)); }}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>1k (underpowered)</span><span>40k (well powered)</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(150px, 100%), 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '0.7rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Observed effect</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>{fmt(OBSERVED)}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.7rem', background: ciColor === 'var(--green)' ? 'var(--green-bg)' : 'var(--yellow-bg)', border: '1px solid ' + (ciColor === 'var(--green)' ? 'var(--green-border)' : 'var(--yellow-border)'), borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: ciColor, textTransform: 'uppercase' }}>95% CI</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: ciColor }}>{fmt(ciLow)} to {fmt(ciHigh)}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.7rem', background: crossesZero ? 'var(--yellow-bg)' : 'var(--green-bg)', border: '1px solid ' + (crossesZero ? 'var(--yellow-border)' : 'var(--green-border)'), borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: crossesZero ? 'var(--yellow)' : 'var(--green)', textTransform: 'uppercase' }}>Crosses zero?</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: crossesZero ? 'var(--yellow)' : 'var(--green)' }}>{crossesZero ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textAlign: 'center' }}>Effect on a number line (CI bar; dashed line is zero / &quot;no effect&quot;)</div>
          <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" style={{ display: 'block' }}>
            <line x1={padL} y1={axisY} x2={W - padR} y2={axisY} stroke="var(--border)" strokeWidth="1" />
            <line x1={zeroX} y1={padT - 8} x2={zeroX} y2={H - padB + 4} stroke="var(--red)" strokeWidth="1.2" strokeDasharray="3 3" />
            <text x={zeroX} y={padT - 12} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--red)">0 (no effect)</text>
            <line x1={xOf(ciLow)} y1={axisY} x2={xOf(ciHigh)} y2={axisY} stroke={ciColor} strokeWidth="6" strokeLinecap="round" opacity="0.85" />
            <line x1={xOf(ciLow)} y1={axisY - 7} x2={xOf(ciLow)} y2={axisY + 7} stroke={ciColor} strokeWidth="2" />
            <line x1={xOf(ciHigh)} y1={axisY - 7} x2={xOf(ciHigh)} y2={axisY + 7} stroke={ciColor} strokeWidth="2" />
            <circle cx={xOf(OBSERVED)} cy={axisY} r="4.5" fill="var(--text)" stroke="var(--surface)" strokeWidth="1.5" />
            {[-8, -4, 0, 4, 8].map(function(t) {
              return <text key={'tk' + t} x={xOf(t)} y={H - 6} textAnchor="middle" fontSize="8" fill="var(--text-muted)">{(t > 0 ? '+' : '') + t + '%'}</text>;
            })}
          </svg>
          <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: ciColor, marginTop: '0.3rem', lineHeight: 1.4 }}>
            {verdict}
          </div>
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
          A feature tests non-significant. The observed effect is +2.5% with a 95% CI of -1% to +6%. What is the correct read?
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Pick the read that distinguishes &quot;we couldn&apos;t detect an effect&quot; from &quot;we proved there is none,&quot; then click Check.
        </div>

        {mcqOptions.map(function(opt, i) {
          var sel = answer === i;
          var bg = 'var(--surface-2)'; var border = 'var(--border)'; var color = 'var(--text)';
          if (revealed) {
            if (opt.correct) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
            else if (sel) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
          } else if (sel) { border = 'var(--accent-border)'; }
          return (
            <button key={i} onClick={function() { if (!revealed) setAnswer(i); }} disabled={revealed}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', marginBottom: '0.5rem', background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)', color: color, fontSize: '0.88rem', cursor: revealed ? 'default' : 'pointer', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          );
        })}

        {answer !== null && !revealed && (
          <button onClick={function() { setRevealed(true); }} style={{ marginTop: '0.5rem', padding: '0.5rem 1.1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Check
          </button>
        )}

        {revealed && (
          <div className="pal-reveal-in">
            <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>
              A CI of -1% to +6% includes both zero and a substantial +5% win. The test simply was not powered to separate the two — so the only honest statement is &quot;we could not detect an effect this small.&quot; To actually conclude the feature does nothing, you would need a tight CI hugging zero (an equivalence test), not a p-value above 0.05. Killing the feature here risks discarding a real win.
            </div>
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {revealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>With a CI of [-0.5%, +2.8%], you cannot conclude no meaningful effect &mdash; the CI includes effects up to +2.8%, which may be meaningful. The null is a detection failure, not a verdict. With a CI of [-0.3%, +0.4%], the CI is tight around zero and excludes meaningful effects &mdash; now you have bounded evidence that the effect, if real, is small. The difference between these two nulls is the entire difference between &quot;we couldn&apos;t see it&quot; and &quot;it&apos;s probably not there.&quot;</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {revealed && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Every null result report should include the MDE and the confidence interval. &quot;Non-significant&quot; without these two numbers is an incomplete result. The MDE tells reviewers what the experiment was capable of detecting; the CI bounds tell them what the data actually rules in and rules out.</p>
            <p style={prose}><strong>Two.</strong> Before killing a feature based on a null result, check whether the MDE was smaller than the effect you would have cared about. If the MDE was 3% and you would have shipped at 1%, the experiment was not powered to answer your question. The appropriate action is not to kill the feature &mdash; it&apos;s to re-run with appropriate power or a more sensitive metric.</p>
            <p style={prose}><strong>Three.</strong> The common mistake is writing &quot;no effect detected&quot; as the conclusion when the CI is wide. That language implies evidence of no effect. The accurate language is &quot;no significant effect at this sample size.&quot; These are different claims. One is wrong. The other is honest about what the data can and cannot support.</p>
          </div>
        </div>
      )}

      {/* ── Key Insight + Connection ── */}
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}
