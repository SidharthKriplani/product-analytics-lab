import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

export function Module_MF08({ module, onNext }) {
  var saved08 = useMemo(function() { return loadMFState('mf08'); }, []);
  var [cv, setCv] = useState(function() { return saved08 && saved08.cv !== undefined ? saved08.cv : 200; });
  var [mde, setMde] = useState(function() { return saved08 && saved08.mde !== undefined ? saved08.mde : 2; });
  var [selected, setSelected] = useState(function() { return saved08 ? saved08.selected : null; });
  var [answered, setAnswered] = useState(function() { return saved08 ? saved08.answered : false; });
  var [triedPreset, setTriedPreset] = useState(function() { return saved08 ? saved08.triedPreset : false; });

  useEffect(function() {
    saveMFState('mf08', { cv: cv, mde: mde, selected: selected, answered: answered, triedPreset: triedPreset });
  }, [cv, mde, selected, answered, triedPreset]);

  // n per arm = (16 * CV^2) / MDE^2  where CV and MDE are in percentage points
  var cvDecimal = cv / 100;
  var mdeDecimal = mde / 100;
  var nPerArm = Math.ceil((16 * cvDecimal * cvDecimal) / (mdeDecimal * mdeDecimal));

  // Format large numbers
  function formatN(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return String(n);
  }

  // SVG bar chart showing sample size
  var maxN = 5000000;
  var barFill = Math.min(nPerArm / maxN, 1);
  var barWidth = 240;
  var barHeight = 32;

  // Duration estimate (assuming 50K users/day)
  var dailyTraffic = 50000;
  var totalNeeded = nPerArm * 2;
  var daysNeeded = Math.ceil(totalNeeded / dailyTraffic);
  var weeksNeeded = (daysNeeded / 7).toFixed(1);

  var Q = {
    question: 'You have two candidate primary metrics for a checkout A/B test: "revenue per user" (CV = 375%) and "add-to-cart rate" (CV = 85%). Your MDE is 2% relative lift. Which metric should be the primary, and why?',
    options: [
      { id: 'a', text: 'Revenue per user — it directly measures what matters. The higher variance just means you need a longer test.' },
      { id: 'b', text: 'Add-to-cart rate — it has 20x lower required sample size at the same MDE. Use it as the primary to detect effects quickly, then validate the revenue link via a longer holdout.' },
      { id: 'c', text: 'Both — run the test with dual primaries and apply a Bonferroni correction.' },
      { id: 'd', text: 'Neither — use a composite metric that blends revenue and conversion into one score.' },
    ],
    correct: 'b',
    explanation: 'At CV=375% and MDE=2%, revenue per user needs roughly 560,000 users per arm. At CV=85% and MDE=2%, add-to-cart rate needs about 29,000 per arm — nearly a 20x reduction. The practical move: use the sensitive metric (add-to-cart rate) as the primary to ship decisions quickly, and track revenue per user as a secondary or validate via a longer holdout. Option C wastes power on correction. Option D creates an uninterpretable metric. The key insight is that sensitivity is a practical constraint, not just a statistical one — it determines whether you ship in 2 weeks or 6 months.',
  };

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>Metric sensitivity is the signal-to-noise ratio of a metric in an experimental context. A highly sensitive metric produces a clear, detectable signal from a small real effect. A low-sensitivity metric produces so much noise that detecting a real effect requires an enormous sample &mdash; and if you don&apos;t have that sample, the experiment concludes &quot;no effect&quot; regardless of what the treatment actually did.</p>
        <p style={prose}>Sensitivity is determined by two things: how large the real effect is relative to the metric&apos;s natural variability. A metric that swings wildly from user to user requires a much larger sample to establish that a 1% lift is real rather than noise. A metric that&apos;s tight and consistent &mdash; small standard deviation &mdash; can detect the same 1% lift with far fewer users.</p>
        <p style={prose}>The natural approach when designing an experiment is to pick the metric most directly connected to the outcome you care about. If you&apos;re testing a checkout redesign and you care about revenue, measure revenue per user. This feels right. But here&apos;s where it breaks.</p>
        <p style={prose}>Revenue per user is a high-variance metric. Most users generate zero revenue. A small fraction generate significant revenue. The distribution is heavily right-skewed with a large standard deviation. The coefficient of variation &mdash; standard deviation divided by mean &mdash; can easily exceed 3 or 4 for revenue metrics. Detecting a 1% lift in revenue per user at that variance level requires millions of users. Most product teams don&apos;t have that many to allocate to a single experiment. The experiment runs for four weeks, comes back &quot;not significant,&quot; and the team declares the checkout redesign had no effect. The truth might be that the redesign increased revenue per user by 2% &mdash; a real, meaningful effect &mdash; and the experiment simply wasn&apos;t large enough to detect it through the noise.</p>
        <p style={prose}>Given this, metric selection is a power decision, not just a business relevance decision. Choosing a high-variance metric you can&apos;t power adequately is not rigorous &mdash; it&apos;s a way to systematically miss real effects.</p>
        <p style={prose}>The path forward requires a tradeoff. Low-variance proxy metrics &mdash; binary conversion rates, step-completion indicators, add-to-cart events &mdash; have tight distributions that make effects detectable at far smaller sample sizes. But they&apos;re only useful if you&apos;ve validated that they predict the high-variance outcome you actually care about. An add-to-cart rate is a low-variance proxy for revenue &mdash; a good experimental primary metric only if you&apos;ve confirmed that add-to-cart rate and revenue per user move together reliably on historical data.</p>
        <p style={prose}>Let&apos;s take an example. A checkout team has 200,000 sessions per week. Debate: Revenue per session (mean $4.20, SD $18.40, CV = 4.4) &mdash; detecting a 5% lift requires ~18 million sessions per arm, 18 weeks of traffic. Not feasible. Checkout initiation rate (binary, baseline 12%) &mdash; detecting a 1pp lift requires ~14,000 sessions per arm, less than one week of traffic. If historical data shows checkout initiation rate and revenue per session correlate at r = 0.71 (strong), using initiation rate as the primary metric is the right call.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>If you switch your primary metric from revenue per user (SD = 18) to checkout completion rate (SD &asymp; 0.32 for a 10% baseline), how does the required sample size change for detecting the same proportional lift? Think through what&apos;s driving the difference.</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive: Sensitivity Playground ── */}
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Sensitivity Playground</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 1rem' }}>
          Drag the two sliders to see how metric variance and desired effect size trade off against required sample size. Try the e-commerce preset to see why revenue-per-user experiments need millions of users.
        </p>

        {/* CV slider */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
            Metric CV (coefficient of variation): <strong style={{ color: cv > 300 ? 'var(--red)' : cv > 150 ? 'var(--yellow)' : 'var(--green)' }}>{cv}%</strong>
          </label>
          <input type='range' min={50} max={500} step={10} value={cv} onChange={function(e) { setCv(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--green)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <span>50% (binary metric)</span>
            <span>500% (revenue)</span>
          </div>
        </div>

        {/* MDE slider */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
            Desired MDE (minimum detectable effect): <strong style={{ color: mde < 1 ? 'var(--red)' : mde < 2 ? 'var(--yellow)' : 'var(--green)' }}>{mde}%</strong>
          </label>
          <input type='range' min={0.5} max={5} step={0.1} value={mde} onChange={function(e) { setMde(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--green)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <span>0.5% (tiny effect)</span>
            <span>5% (large effect)</span>
          </div>
        </div>

        {/* Preset button */}
        <button onClick={function() { setCv(375); setMde(2); setTriedPreset(true); }} style={{ marginBottom: '1rem', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
          Preset: Typical e-commerce RPU (CV=375%, MDE=2%)
        </button>

        {/* Result display */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Required sample size per arm (80% power)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: nPerArm > 1000000 ? 'var(--red)' : nPerArm > 100000 ? 'var(--yellow)' : 'var(--green)', marginBottom: '0.4rem' }}>
            {formatN(nPerArm)} users
          </div>

          {/* SVG progress bar */}
          <svg viewBox={'0 0 ' + (barWidth + 20) + ' ' + (barHeight + 8)} width='100%' style={{ maxWidth: '300px', display: 'block' }}>
            <rect x={0} y={4} width={barWidth} height={barHeight} rx={6} fill='var(--surface)' stroke='var(--border)' strokeWidth={1} />
            <rect x={0} y={4} width={Math.max(barFill * barWidth, 4)} height={barHeight} rx={6} fill={nPerArm > 1000000 ? 'var(--red)' : nPerArm > 100000 ? 'var(--yellow)' : 'var(--green)'} opacity={0.7} />
            <text x={barWidth + 8} y={barHeight / 2 + 8} fill='var(--text-muted)' fontSize={9} textAnchor='start'>5M cap</text>
          </svg>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Total needed (both arms): <strong>{formatN(totalNeeded)}</strong> | At 50K users/day: <strong>{weeksNeeded} weeks</strong>
          </div>
        </div>

        {/* Discovery nudge */}
        {triedPreset && (
          <div className='pal-reveal-in' style={{ background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--yellow)', lineHeight: 1.55 }}>
            At CV=375% and MDE=2%, you need {formatN(Math.ceil((16 * 3.75 * 3.75) / (0.02 * 0.02)))} users per arm. For a site with 50K daily users, that is {(Math.ceil((16 * 3.75 * 3.75) / (0.02 * 0.02)) * 2 / 50000 / 7).toFixed(0)} weeks. Now try switching to a conversion metric (CV~100%, MDE=2%) and see the difference.
          </div>
        )}
      </div>

      {/* ── Quick Check ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Check</div>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>{Q.question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {Q.options.map(function(opt) {
            return (
              <MCQOption key={opt.id} label={opt.text} selected={selected === opt.id} correct={opt.id === Q.correct} revealed={answered} onClick={function() { if (!answered) setSelected(opt.id); }} />
            );
          })}
        </div>
        {selected && !answered && (
          <button onClick={function() { setAnswered(true); }} style={{ marginTop: '0.75rem', padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--green)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Check</button>
        )}
        {answered && (
          <div className='pal-reveal-in' style={{ marginTop: '0.75rem', background: selected === Q.correct ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (selected === Q.correct ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <strong>{selected === Q.correct ? <><Icon name='check' size={13} color='var(--green)' /> Correct. </> : <><Icon name='x' size={13} color='var(--red)' /> Not quite. </>}</strong>{Q.explanation}
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {answered && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>The required sample size falls dramatically &mdash; often by 100x or more. The standard deviation of a binary metric at a 10% baseline is about 0.30, which is tiny compared to a revenue metric&apos;s SD of 15&ndash;25. Detectability scales with variance: lower variance means the same lift produces a more distinguishable signal against the noise.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {answered && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Before finalizing a primary experiment metric, run a sensitivity check: what sample size does this metric require to detect the minimum effect you&apos;d act on? If the answer exceeds your available traffic within a reasonable run time, the metric is not a viable primary &mdash; find a lower-variance proxy with a validated predictive relationship.</p>
            <p style={prose}><strong>Two.</strong> Build and maintain a proxy validation library for your product: which L2 metrics predict which L1 outcomes, and how strongly? This is a one-time analysis per product area that pays off in every subsequent experiment design. Without it, every metric choice is a guess about predictive validity.</p>
            <p style={prose}><strong>Three.</strong> The common mistake is conflating &quot;this is the metric we care about&quot; with &quot;this is the right primary metric for this experiment.&quot; The metric you care about is often the right thing to validate in a long-run holdout or cohort analysis. The right primary metric for a short experiment is the most sensitive proxy that reliably predicts what you care about.</p>
          </div>
        </div>
      )}

      {/* ── Key Insight + Connection ── */}
      <InsightBox label='Key Takeaway' color='var(--green)' bg='var(--green-bg)' border='var(--green-border)'>{module.keyInsight}</InsightBox>
      <InsightBox label='Connects to Experiments' color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)'>{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}
