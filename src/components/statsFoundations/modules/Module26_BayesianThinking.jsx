import { useState, useMemo } from 'react';

function betaPDF(x, a, b) {
  if (x <= 0 || x >= 1) return 0;
  var logB = lgamma(a) + lgamma(b) - lgamma(a + b);
  return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - logB);
}

function lgamma(x) {
  var c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.001208650973866179, -0.000005395239384953];
  var y = x, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  var ser = 1.000000000190015;
  for (var j = 0; j < 6; j++) { y += 1; ser += c[j] / y; }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function betaMean(a, b) { return a / (a + b); }

var MCQ_OPTIONS = [
  { id: 'a', text: 'When you have millions of data points and just need a p-value' },
  { id: 'b', text: 'When prior knowledge is strong and sample sizes are small' },
  { id: 'c', text: 'Only when running sequential experiments with early stopping' },
  { id: 'd', text: 'When you want to avoid computing confidence intervals entirely' },
];
var MCQ_ANSWER = 'b';

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module26_BayesianThinking({ module, onNext }) {
  var [prior, setPrior] = useState(50);
  var [picked, setPicked] = useState(null);
  var [revealed, setRevealed] = useState(false);

  var successes = 3;
  var trials = 5;

  var priorAlpha = (prior / 100) * 4 + 1;
  var priorBeta = ((100 - prior) / 100) * 4 + 1;
  var postAlpha = priorAlpha + successes;
  var postBeta = priorBeta + (trials - successes);

  var priorMu = betaMean(priorAlpha, priorBeta);
  var postMu = betaMean(postAlpha, postBeta);

  var priorPoints = useMemo(function () {
    var pts = [];
    for (var i = 0; i <= 100; i++) {
      var x = i / 100;
      pts.push({ x: x, y: betaPDF(x, priorAlpha, priorBeta) });
    }
    return pts;
  }, [priorAlpha, priorBeta]);

  var postPoints = useMemo(function () {
    var pts = [];
    for (var i = 0; i <= 100; i++) {
      var x = i / 100;
      pts.push({ x: x, y: betaPDF(x, postAlpha, postBeta) });
    }
    return pts;
  }, [postAlpha, postBeta]);

  var maxY = useMemo(function () {
    var m = 0;
    for (var i = 0; i < priorPoints.length; i++) { if (priorPoints[i].y > m) m = priorPoints[i].y; }
    for (var j = 0; j < postPoints.length; j++) { if (postPoints[j].y > m) m = postPoints[j].y; }
    return Math.max(m, 1) * 1.1;
  }, [priorPoints, postPoints]);

  function toSVG(pts) {
    return pts.map(function (p) {
      return (50 + p.x * 400) + ',' + (240 - (p.y / maxY) * 200);
    }).join(' ');
  }

  function handleCheck() { setRevealed(true); }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          Every statistical method we've covered so far operates within the frequentist framework: probabilities are long-run frequencies, parameters are fixed unknowns, and p-values measure how often you'd see your data in a world where H₀ is true. There's a different way to think about probability entirely.
        </p>
        <p style={prose}>
          In the Bayesian framework, probability is a degree of belief. A probability of 0.8 means "I'm 80% confident in this, given what I know." The Bayesian question is: given everything I've observed so far, what should I believe?
        </p>
        <p style={prose}>
          The mechanism for updating beliefs is Bayes' theorem: <strong style={{ color: 'var(--text)' }}>P(hypothesis | data) = P(data | hypothesis) × P(hypothesis) / P(data)</strong>. Your updated belief (posterior) is proportional to how well the data fits your hypothesis (likelihood) multiplied by your prior belief (prior).
        </p>
        <p style={prose}>
          The prior is what you believed before the data. If you've run 60 experiments on your checkout flow and the average lift has been between -0.2pp and +0.5pp, your prior reflects that history — you'd be surprised by a claimed 5pp lift. The likelihood is how consistent the data is with each possible hypothesis value. Multiplying prior by likelihood and normalizing gives the posterior — your updated belief distribution.
        </p>
        <p style={prose}>
          Two features change the workflow. <strong style={{ color: 'var(--text)' }}>Continuous updating</strong>: you can update your beliefs every day as new data arrives, without inflating false positive rates. <strong style={{ color: 'var(--text)' }}>Credible intervals</strong>: a Bayesian 95% credible interval [a, b] means "I'm 95% confident the parameter lies in this range" — the intuitive interpretation most people mistakenly apply to frequentist confidence intervals. In Bayesian analysis, it's actually true.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You've run 5 previous experiments on the same checkout button and the average lift has been +0.2pp. A new experiment shows a 2pp lift in early data. Should you be more or less confident in the 2pp claim than you would be without prior knowledge? What happens to the posterior estimate?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Prior vs Posterior</div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Drag the prior slider to set your initial belief about whether a feature improves retention. Evidence is fixed: 3 out of 5 small tests showed improvement. Watch how your posterior shifts — notice that with only 5 data points, your prior still matters a lot.
      </div>

      {/* Prior slider */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
            Prior belief: feature helps retention
          </label>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--yellow)', fontVariantNumeric: 'tabular-nums', minWidth: 50, textAlign: 'right' }}>
            {prior}%
          </span>
        </div>
        <input
          type="range" min={10} max={90} step={5}
          value={prior}
          onChange={function (e) { setPrior(parseInt(e.target.value)); }}
          style={{ width: '100%', accentColor: 'var(--yellow)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          <span>10% (skeptical)</span>
          <span>50% (neutral)</span>
          <span>90% (confident)</span>
        </div>
      </div>

      {/* Evidence banner */}
      <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
            Evidence observed
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
            3 out of 5 small tests showed improvement
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
            Update
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Prior mean: <strong style={{ color: 'var(--yellow)' }}>{(priorMu * 100).toFixed(0)}%</strong>
            {' → '}
            Posterior mean: <strong style={{ color: 'var(--green)' }}>{(postMu * 100).toFixed(0)}%</strong>
          </div>
        </div>
      </div>

      {/* SVG: prior vs posterior */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Prior (yellow) vs Posterior (green)
        </div>
        <svg viewBox="0 0 500 280" width="100%" style={{ overflow: 'visible' }}>
          <line x1={50} y1={240} x2={450} y2={240} stroke="var(--border)" strokeWidth={1.5} />
          <line x1={50} y1={40} x2={50} y2={240} stroke="var(--border)" strokeWidth={1.5} />

          <text x={250} y={270} textAnchor="middle" fontSize={11} fill="var(--text-muted)" fontWeight={600}>Probability feature helps</text>
          <text x={50} y={255} textAnchor="middle" fontSize={9} fill="var(--text-muted)">0%</text>
          <text x={250} y={255} textAnchor="middle" fontSize={9} fill="var(--text-muted)">50%</text>
          <text x={450} y={255} textAnchor="middle" fontSize={9} fill="var(--text-muted)">100%</text>

          {[0.25, 0.5, 0.75].map(function (v) {
            return (
              <line key={v} x1={50 + v * 400} y1={40} x2={50 + v * 400} y2={240} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="3,4" opacity={0.5} />
            );
          })}

          <polyline
            points={toSVG(priorPoints)}
            fill="none" stroke="var(--yellow)" strokeWidth={2.5} opacity={0.8}
          />
          <polyline
            points={toSVG(postPoints)}
            fill="none" stroke="var(--green)" strokeWidth={2.5} opacity={0.9}
          />

          {/* Prior mean marker */}
          <line x1={50 + priorMu * 400} y1={40} x2={50 + priorMu * 400} y2={240} stroke="var(--yellow)" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
          {/* Posterior mean marker */}
          <line x1={50 + postMu * 400} y1={40} x2={50 + postMu * 400} y2={240} stroke="var(--green)" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />

          <circle cx={50 + priorMu * 400} cy={45} r={4} fill="var(--yellow)" />
          <circle cx={50 + postMu * 400} cy={45} r={4} fill="var(--green)" />
        </svg>
      </div>

      {/* Insight callout */}
      <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
          Why the prior matters
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {prior < 30
            ? 'With a skeptical prior, even 3/5 positive tests only nudge your belief modestly upward. You\'d want more evidence before committing resources.'
            : prior > 70
            ? 'With a strong prior, the evidence confirms what you already believed. But be careful: strong priors can make you overconfident with weak evidence.'
            : 'With a neutral prior, the data has maximum influence. This is the "let the data speak" position that many Bayesian analysts start from.'}
        </div>
      </div>

      {/* Framework */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Framework</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7 }}>
          Bayesian updating follows three steps: (1) encode your prior belief as a distribution, (2) observe data and compute the likelihood, (3) multiply and normalize to get the posterior. With small samples, the prior dominates. With large samples (hundreds of observations), virtually any reasonable prior washes out and frequentist and Bayesian answers converge. In product analytics, Bayesian thinking is most valuable when you have domain expertise and limited data — exactly the situation in early-stage feature testing.
        </div>
      </div>

      {/* Quick Check MCQ */}
      <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          Quick Check
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
          When does Bayesian thinking matter most in product analytics?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {MCQ_OPTIONS.map(function (opt) {
            var isSelected = picked === opt.id;
            var isCorrect = opt.id === MCQ_ANSWER;
            var bg = !revealed ? (isSelected ? 'var(--yellow-bg)' : 'var(--surface)') : (isCorrect ? 'var(--green-bg)' : isSelected ? 'var(--red-bg)' : 'var(--surface)');
            var border = !revealed ? (isSelected ? 'var(--yellow-border)' : 'var(--border)') : (isCorrect ? 'var(--green-border)' : isSelected ? 'var(--red-border)' : 'var(--border)');
            return (
              <button
                key={opt.id}
                onClick={function () { if (!revealed) setPicked(opt.id); }}
                style={{ textAlign: 'left', background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', fontSize: '0.85rem', color: 'var(--text)', cursor: revealed ? 'default' : 'pointer', lineHeight: 1.5 }}
              >
                <strong>{opt.id.toUpperCase()}.</strong> {opt.text}
              </button>
            );
          })}
        </div>
        {picked && !revealed && (
          <button onClick={handleCheck} style={{ marginTop: '0.75rem', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Check answer
          </button>
        )}
        {revealed && (
          <div className="pal-reveal-in" style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: picked === MCQ_ANSWER ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (picked === MCQ_ANSWER ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong>{picked === MCQ_ANSWER ? 'Correct!' : 'Not quite.'}</strong> Bayesian thinking shines when you have strong prior knowledge and small samples. With millions of data points, the prior washes out and frequentist methods work just as well. The value of Bayesian reasoning is in early-stage decisions where domain expertise should inform your interpretation of limited evidence.
          </div>
        )}
      </div>

      {/* What you should have confirmed */}
      {revealed && (
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          With an informative prior centered at +0.2pp, the posterior estimate of the 2pp lift gets shrunk toward the prior — the posterior might land at +1pp. This is Bayesian shrinkage: extreme estimates get pulled toward prior expectations. With a large experiment, the data dominates and the posterior converges on the observed 2pp. With a small experiment, the prior matters substantially. The shrinkage is not a bug — it's a feature that prevents individual noisy experiments from producing wildly misleading estimates.
        </p>
      </div>
      )}

      {/* ── Analyst Move ── */}
      {revealed && (
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> When a stakeholder asks "what's the probability the new feature is better?" — Bayesian A/B testing answers that directly. Frequentist testing doesn't. If your team is making decisions based on probability-of-superiority estimates, Bayesian output is more natural than p-values. Several platforms (Optimizely, VWO, in-house) offer Bayesian experiment analysis. Know when to use it.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Use the prior as a mechanism for encoding historical knowledge, not as a way to force a conclusion. Before a high-stakes experiment, write down what your historical experiment results imply about the plausible range of effects. This prior is legitimate scientific knowledge. Using it reduces variance in your estimates and decreases the rate of improbable-but-statistically-significant false discoveries.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> The value of Bayesian thinking extends beyond formal inference. "What did we believe before? What does the new data imply? What should we believe now?" is the right structure for any evidence update. When a single experiment shows a surprising result, the Bayesian question — how likely is a result this extreme given our prior knowledge? — is exactly the right check on overreacting to noise.</p>
        </div>
      </div>
      )}

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Bayesian A/B testing uses this exact updating process to compute the probability that treatment beats control, enabling continuous monitoring without inflating false positive rates.'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="pal-glow-pulse"
          onClick={onNext}
          style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
        >
          Next concept →
        </button>
      </div>
    </div>
  );
}
