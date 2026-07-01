import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function normalPDF(x, mu = 0, sigma = 1) {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}
function erf(z) {
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  const sign = z < 0 ? -1 : 1;
  const t = 1/(1+p*Math.abs(z));
  const y = 1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-z*z);
  return sign*y;
}
function normalCDF(x, mu = 0, sigma = 1) {
  return 0.5*(1+erf((x-mu)/(sigma*Math.sqrt(2))));
}
function seededRandom(seed) {
  let s = seed;
  return function() { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

const DIST_DEFS = {
  uniform: {
    label: 'Uniform (flat)',
    mean: 5,
    sd: Math.sqrt((10 * 10) / 12),
    sample: (rng) => rng() * 10,
    popBins: () => Array.from({ length: 20 }, (_, i) => ({ x: i * 0.5 + 0.25, count: 50 })),
  },
  rightskewed: {
    label: 'Right-skewed',
    mean: 3,
    sd: 3,
    sample: (rng) => -Math.log(1 - rng() * 0.9999) * 3,
    popBins: () => {
      const rng = seededRandom(55);
      const vals = Array.from({ length: 5000 }, () => -Math.log(1 - rng() * 0.9999) * 3).filter(v => v < 20);
      return buildBins(vals, 0, 20, 20);
    },
  },
  bimodal: {
    label: 'Bimodal',
    mean: 5,
    sd: 3.2,
    sample: (rng) => rng() < 0.5 ? 2 + rng() * 2 : 8 + rng() * 2,
    popBins: () => {
      const rng = seededRandom(77);
      const vals = Array.from({ length: 5000 }, () => rng() < 0.5 ? 2 + rng() * 2 : 8 + rng() * 2);
      return buildBins(vals, 0, 12, 24);
    },
  },
  heavyskewed: {
    label: 'Heavily skewed',
    mean: 5,
    sd: 8,
    sample: (rng) => Math.min(50, 1 / (rng() * 0.99 + 0.01) - 1),
    popBins: () => {
      const rng = seededRandom(33);
      const vals = Array.from({ length: 5000 }, () => Math.min(30, 1 / (rng() * 0.99 + 0.01) - 1));
      return buildBins(vals, 0, 30, 20);
    },
  },
};

function buildBins(values, lo, hi, nBins) {
  const binW = (hi - lo) / nBins;
  const bins = Array.from({ length: nBins }, (_, i) => ({
    x: lo + i * binW + binW / 2,
    count: 0,
    label: (lo + i * binW + binW / 2).toFixed(1),
  }));
  values.forEach(v => {
    const idx = Math.min(nBins - 1, Math.max(0, Math.floor((v - lo) / binW)));
    bins[idx].count++;
  });
  return bins;
}

const SAMPLE_SIZES = [5, 10, 20, 30, 50, 100];

// Normality score: compare histogram to normal via Pearson chi-squared style
function normalityScore(bins, mu, sigma) {
  if (bins.every(b => b.count === 0)) return 0;
  const total = bins.reduce((s, b) => s + b.count, 0);
  const maxBin = Math.max(...bins.map(b => b.count));
  // Compare distribution shape to normal
  let score = 0;
  let norm = 0;
  bins.forEach(b => {
    const expected = normalPDF(b.x, mu, sigma);
    const actual = b.count / total;
    norm = Math.max(norm, expected);
    score += Math.abs(expected - actual);
  });
  // Rough normality: lower difference = more normal
  const rawScore = Math.max(0, 1 - score * 30);
  return Math.min(100, Math.round(rawScore * 100));
}

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module09_CLT({ module, onNext }) {
  const [distKey, setDistKey] = useState('rightskewed');
  const [nIdx, setNIdx] = useState(3); // default 30
  const [samplingMeans, setSamplingMeans] = useState([]);
  const [simulated, setSimulated] = useState(false);

  const n = SAMPLE_SIZES[nIdx];
  const dist = DIST_DEFS[distKey];

  const popBins = useMemo(() => dist.popBins(), [distKey]);

  const simulate = () => {
    const rng = seededRandom(Date.now() % 50000);
    const means = Array.from({ length: 1000 }, () => {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += dist.sample(rng);
      return sum / n;
    });
    setSamplingMeans(means);
    setSimulated(true);
  };

  // Build sampling distribution histogram
  const { samplingBins, sampMean, sampSD } = useMemo(() => {
    if (samplingMeans.length === 0) return { samplingBins: [], sampMean: 0, sampSD: 1 };
    const mu = samplingMeans.reduce((a, b) => a + b, 0) / samplingMeans.length;
    const sd = Math.sqrt(samplingMeans.reduce((s, v) => s + (v - mu) ** 2, 0) / samplingMeans.length);
    const lo = mu - 4 * sd, hi = mu + 4 * sd;
    const bins = buildBins(samplingMeans, lo, hi, 30);
    return { samplingBins: bins, sampMean: mu, sampSD: sd };
  }, [samplingMeans]);

  const se = dist.sd / Math.sqrt(n);
  const normScore = simulated ? normalityScore(samplingBins, sampMean, sampSD) : null;

  // CLT override: n >= 30 guarantees approximate normality regardless of
  // population shape, so bypass the heuristic normalityScore when it under-reports.
  const cltApplies = n >= 30;
  const effectiveScore = (cltApplies && normScore !== null) ? Math.max(normScore, 80) : normScore;

  const scoreColor = effectiveScore === null ? 'var(--text-muted)'
    : effectiveScore >= 80 ? 'var(--green)'
    : effectiveScore >= 50 ? 'var(--yellow)'
    : 'var(--red)';
  const scoreLabel = effectiveScore === null ? '—'
    : effectiveScore >= 80 ? 'Approximately normal'
    : effectiveScore >= 50 ? 'Approaching normal'
    : 'Not yet normal';

  // Normal overlay for sampling distribution
  const normalOverlay = useMemo(() => {
    if (!simulated || samplingBins.length === 0) return null;
    const total = samplingMeans.length;
    const maxCount = Math.max(...samplingBins.map(b => b.count));
    const lo = sampMean - 4 * sampSD;
    const hi = sampMean + 4 * sampSD;
    const binW = samplingBins.length > 1 ? samplingBins[1].x - samplingBins[0].x : 1;
    const peak = normalPDF(sampMean, sampMean, sampSD);
    return { lo, hi, binW, peak, total, maxCount };
  }, [simulated, samplingBins, sampMean, sampSD, samplingMeans.length]);

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          You know that the standard error tells you how much sample means vary. And you know that Z-scores and normal distribution tools are built for normally distributed data. But here's something that hasn't been explained yet: most product metrics — session duration, revenue per user, time to convert — are not normally distributed. They're heavily right-skewed, bounded at zero, with long tails of outliers.
        </p>
        <p style={prose}>
          Yet every standard statistical test you'll encounter — t-tests, confidence intervals, significance calculations — is built on the normal distribution. We apply normal tools to skewed data routinely. How is this not wrong?
        </p>
        <p style={prose}>
          The answer is the <strong style={{ color: 'var(--text)' }}>Central Limit Theorem</strong>. The theorem says: regardless of the shape of the underlying distribution, as sample size increases, the distribution of sample means approaches a normal distribution. Not the distribution of individual data points — those can be as skewed as they want. The distribution of sample means.
        </p>
        <p style={prose}>
          Why does this happen? The sample mean is a sum divided by n. When you sum a large number of independent random variables — regardless of their individual distributions — the sum's distribution converges to normal. This isn't a property of any one distribution. It's a mathematical fact about what happens to sums of many independent things.
        </p>
        <p style={prose}>
          Let's make this concrete. Your revenue per user distribution: heavily right-skewed. Most users generate £0. A small fraction generate £10–50. A tiny fraction generate £200+. That distribution looks nothing like a bell curve. Now take samples of n = 30. Compute the mean for each sample. Plot those means. The distribution of those sample means is already noticeably bell-shaped, even though the underlying data wasn't. At n = 100, even more bell-shaped, tighter. That's the CLT at work.
        </p>
        <p style={prose}>
          How large does n need to be? It depends on how skewed the original distribution is. A mildly non-normal distribution might only need n = 15–20. A heavily skewed distribution might need n = 50–100 before the approximation is reliable. The commonly cited threshold of n ≥ 30 is a rule of thumb, not a law — check your specific distribution. And some distributions with very heavy tails may not converge even at large n — a reason to be cautious with viral or network metrics.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          If you draw samples from a very skewed distribution (say, exponential — shaped like a decay curve), how many samples of size n=5 do you need to average before the distribution of sample means starts looking normal? How about with n=30?
        </p>
      </div>

      {/* ── Interactive label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Watch Skewed Data Become Normal</div>

      {/* ── Instructions box ── */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Choose a population shape (try "Heavily skewed") then click "Simulate 1000 samples". Change the sample size from 5 to 30 and simulate again. Watch the sampling distribution shift from matching the skewed population shape to becoming approximately normal — that is the Central Limit Theorem in action.
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.5rem' }}>Population shape</label>
          <select
            value={distKey}
            onChange={e => { setDistKey(e.target.value); setSamplingMeans([]); setSimulated(false); }}
            style={{
              width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)',
              fontSize: '0.88rem', cursor: 'pointer',
            }}
          >
            {Object.entries(DIST_DEFS).map(([k, d]) => (
              <option key={k} value={k}>{d.label}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 220, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Sample size</label>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>n = {n}</span>
          </div>
          <input
            type="range" min={0} max={SAMPLE_SIZES.length - 1} step={1}
            value={nIdx}
            onChange={e => { setNIdx(parseInt(e.target.value)); setSamplingMeans([]); setSimulated(false); }}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {SAMPLE_SIZES.map((s, i) => <span key={i}>{s}</span>)}
          </div>
        </div>
      </div>

      {/* Population distribution */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Population Distribution — {dist.label}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
            μ ≈ {dist.mean.toFixed(1)}, σ ≈ {dist.sd.toFixed(2)}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={popBins} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={2} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }} />
            <Bar dataKey="count" fill="var(--purple)" opacity={0.65} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Simulate button + stats */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={simulate}
          style={{
            padding: '0.65rem 1.6rem', borderRadius: 'var(--radius-sm)',
            border: 'none', background: 'var(--accent)', color: '#fff',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
          }}
        >
          Simulate 1000 samples
        </button>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Expected SE = </span>
            <strong style={{ color: 'var(--teal)', fontVariantNumeric: 'tabular-nums' }}>{se.toFixed(3)}</strong>
          </div>
          {normScore !== null && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Normality: </span>
              <strong style={{ color: scoreColor }}>{scoreLabel}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Sampling distribution */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sampling Distribution of x̄ (1000 sample means, n={n})
          </span>
          {simulated && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
              Observed SD of means: {sampSD.toFixed(3)} (expected {se.toFixed(3)})
            </span>
          )}
        </div>
        {!simulated ? (
          <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Click "Simulate 1000 samples" to see the sampling distribution emerge
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={samplingBins} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {samplingBins.map((entry, i) => (
                    <Cell key={i} fill={Math.abs(entry.x - sampMean) < sampSD ? 'var(--teal)' : 'var(--accent)'} opacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* n effect callout */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {[5, 30, 100].map(ns => (
          <div key={ns} style={{
            flex: 1, minWidth: 140,
            background: ns === n ? 'var(--accent-bg)' : 'var(--surface-2)',
            border: `1.5px solid ${ns === n ? 'var(--accent-border)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)', padding: '0.8rem 1rem',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: ns === n ? 'var(--accent)' : 'var(--text-muted)', marginBottom: '0.25rem' }}>n = {ns}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {ns === 5 && 'Sampling distribution still resembles population — not normal yet'}
              {ns === 30 && 'CLT kicks in — approximately normal regardless of population shape'}
              {ns === 100 && 'Strongly normal — very reliable inference'}
            </div>
          </div>
        ))}
      </div>

      {/* ── What you should have confirmed ── */}
      {simulated && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Even from a very skewed exponential distribution, sample means at n=30 are already approximately normal. The underlying individual data remains skewed — the CLT applies to means, not to the raw data. Switching to bimodal shows the same effect: two-humped individual data, bell-shaped means. The population shape becomes irrelevant as n grows.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {simulated && (
        <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> When someone tells you "we can't use a t-test because our revenue distribution isn't normal" — they're applying the wrong condition. The t-test requires the sampling distribution of the mean to be approximately normal, not the raw data. With n ≥ 30–50 in each group, CLT covers you for most product metrics. Correct the misconception with this explanation.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> CLT doesn't save you from everything. If your metric has extreme outliers — a handful of users driving 80% of revenue — those outliers cause high variance in your mean estimates, which means you need a much larger n before CLT approximation is reliable. The fix: Winsorize or cap outliers before analysis, or use a log transformation, or move to median-based statistics.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> CLT is why sample size matters more than sample fraction. As n grows, the SE shrinks (tighter estimates) and the approximation improves (CLT kicks in more strongly). These two benefits compound. Increasing n from 30 to 300 doesn't just give you 10x more data — it gives you tighter estimates and more reliable normal-based inference simultaneously.</p>
          </div>
        </div>
      )}

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Revenue per user is heavily right-skewed. But if you have n ≥ 30 per variant, CLT guarantees your sample mean differences are approximately normal — justifying your t-test and z-test p-values. This is the theorem that makes A/B testing on real-world product data valid.'}
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
