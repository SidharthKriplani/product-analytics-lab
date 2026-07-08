import { useState, useMemo } from 'react';

function normalPDF(x, mu = 0, sigma = 1) {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

const SIGMA = 15;
const W = 560;
const H = 170;
const X_MIN = -20;
const X_MAX = 20;
const X_RANGE = X_MAX - X_MIN;
const N_PTS = 300;

const REFERENCE_NS = [
  { n: 25, color: 'var(--purple)', label: 'n=25' },
  { n: 100, color: 'var(--teal)', label: 'n=100' },
  { n: 400, color: 'var(--green)', label: 'n=400' },
];

const TABLE_ROWS = [
  { n: 25, se: (SIGMA / Math.sqrt(25)).toFixed(2) },
  { n: 100, se: (SIGMA / Math.sqrt(100)).toFixed(2) },
  { n: 400, se: (SIGMA / Math.sqrt(400)).toFixed(2) },
  { n: 1600, se: (SIGMA / Math.sqrt(1600)).toFixed(3) },
];

function toSvgX(x) {
  return ((x - X_MIN) / X_RANGE) * W;
}

function buildCurvePath(sigma) {
  const maxPDF = normalPDF(0, 0, 1) / 1; // peak of standard normal
  const pts = Array.from({ length: N_PTS }, (_, i) => {
    const x = X_MIN + (i / (N_PTS - 1)) * X_RANGE;
    const pdf = normalPDF(x, 0, sigma);
    // normalize to max possible (n=1, SE=15): normalPDF(0,0,15)
    const norm = normalPDF(0, 0, SIGMA);
    const svgY = Math.max(2, H - (pdf / norm) * (H * 0.82) - 8);
    return `${toSvgX(x).toFixed(2)},${svgY.toFixed(2)}`;
  });
  return 'M ' + pts.join(' L ');
}

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module08_StandardError({ module, onNext }) {
  const [n, setN] = useState(100);
  const [explored, setExplored] = useState(false);

  const se = SIGMA / Math.sqrt(n);
  const ciWidth = (2 * 1.96 * se).toFixed(2);

  const currentPath = useMemo(() => buildCurvePath(se), [se]);
  const refPaths = useMemo(() =>
    REFERENCE_NS.map(ref => ({
      ...ref,
      se: SIGMA / Math.sqrt(ref.n),
      path: buildCurvePath(SIGMA / Math.sqrt(ref.n)),
    })),
    []
  );

  // Find closest reference n
  const closestRef = REFERENCE_NS.reduce((prev, cur) =>
    Math.abs(cur.n - n) < Math.abs(prev.n - n) ? cur : prev
  );

  // Log-scale mapping for slider (n from 10 to 2000)
  const logMin = Math.log10(10);
  const logMax = Math.log10(2000);
  const sliderToN = (v) => Math.round(Math.pow(10, logMin + (v / 100) * (logMax - logMin)));
  const nToSlider = (nn) => Math.round(((Math.log10(nn) - logMin) / (logMax - logMin)) * 100);

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          You sample 500 users and measure their session duration. The sample mean is 4.8 minutes. That's your estimate of the true population mean. But if you'd sampled a different 500 users — same product, same time period, just different people drawn by chance — the mean would be slightly different. Maybe 5.1 minutes. Maybe 4.5 minutes.
        </p>
        <p style={prose}>
          The sample mean varies from sample to sample, even when nothing about the product or population has changed. This is sampling variability — it's not error, it's an unavoidable property of working with samples. The question is: how much does the sample mean vary? Is 4.8 a tight estimate of the true mean, or could the true mean plausibly be 6.0 or 3.0? The mean itself doesn't tell you. You need a separate measure — a measure of the precision of your estimate.
        </p>
        <p style={prose}>
          Standard deviation tells you how individual data points spread around the mean. But individual spread is not what you need here. You need to know how much the mean estimate itself varies from one sample of n users to another. These are different things.
        </p>
        <p style={prose}>
          Imagine drawing thousands of different samples of size n from the population, computing the mean of each. Those sample means form their own distribution — a distribution of estimates. The standard deviation of that distribution of means is the <strong style={{ color: 'var(--text)' }}>standard error</strong>. The formula is: SE = σ / √n — where σ is the population standard deviation and n is your sample size.
        </p>
        <p style={prose}>
          Why √n? Because the variance of the mean of n independent observations is σ²/n — each observation's variance contributes equally, and they're independent, so variances add and you divide by n. Then take the square root to get standard deviation. The square root is fundamental — it means you need four times the data to halve the SE.
        </p>
        <p style={prose}>
          Standard deviation describes your data. Standard error describes your estimate's reliability. Conflating them — and it happens constantly in presentations — leads directly to overconfidence in noisy estimates and underconfidence in precise ones. A study reports "mean = 4.8, SD = 3.0." Another reports "mean = 5.2, SD = 3.2." Are these different? The answer depends entirely on the sample sizes — a fact the SD alone cannot tell you.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          If you double your sample size, by how much does your SE shrink? By half? By more? By less? Work through the formula before exploring.
        </p>
      </div>

      {/* ── Interactive label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Watch Precision Scale with Sample Size</div>

      {/* ── Instructions box ── */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Drag the sample size slider and watch the SE formula update in real time. Notice that you need to quadruple n to halve the SE — the square-root relationship. Compare how the current curve (solid blue) compares against the reference curves for n=25, 100, and 400.
      </div>

      {/* Formula card + slider */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1.2, minWidth: 220, background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Standard Error Formula</div>
          <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--text)', lineHeight: 1.8 }}>
            SE = σ / √n
            <br />
            <span style={{ color: 'var(--text-muted)' }}>= {SIGMA} / √{n}</span>
            <br />
            <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.3rem' }}>= {se.toFixed(3)}</span>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.8rem', lineHeight: 1.5 }}>
            σ = {SIGMA} (population SD, fixed)<br />
            n = {n} (your sample size)
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 200, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Sample size n</label>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{n.toLocaleString()}</span>
            </div>
            <input
              type="range" min={0} max={100} step={1}
              value={nToSlider(n)}
              onChange={e => { setN(sliderToN(parseInt(e.target.value))); setExplored(true); }}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              <span>10</span><span>100</span><span>2,000</span>
            </div>
          </div>

          {/* CI width */}
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>95% CI width ≈ 2 × 1.96 × SE</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal)', fontVariantNumeric: 'tabular-nums' }}>± {ciWidth}</div>
          </div>

          <div style={{ background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.8rem', fontSize: '0.8rem', color: 'var(--yellow-text)', lineHeight: 1.5 }}>
            To halve the SE, you need <strong>4× more users</strong>. Not 2×.
          </div>
        </div>
      </div>

      {/* SVG curve visualization */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Sampling Distribution Shape — narrower = more precise
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {refPaths.map(r => (
            <span key={r.n} style={{ fontSize: '0.77rem', color: r.color, fontWeight: 600 }}>
              ── {r.label} (SE={r.se.toFixed(2)})
            </span>
          ))}
          <span style={{ fontSize: '0.77rem', color: 'var(--accent)', fontWeight: 800 }}>
            ── Current n={n} (SE={se.toFixed(3)})
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H + 25}`} width="100%" style={{ maxWidth: W, maxHeight: '300px', overflow: 'hidden', display: 'block', margin: '0 auto' }}>
          {/* Reference curves (ghost) */}
          {refPaths.map(r => (
            <path key={r.n} d={r.path} fill="none" stroke={r.color} strokeWidth={1.5} opacity={0.35} strokeDasharray="5,3" />
          ))}
          {/* Current curve */}
          <path d={currentPath} fill="none" stroke="var(--accent)" strokeWidth={3} />
          {/* Fill under current curve */}
          <path
            d={currentPath + ` L ${toSvgX(X_MAX).toFixed(2)},${H} L ${toSvgX(X_MIN).toFixed(2)},${H} Z`}
            fill="var(--accent)" opacity={0.08}
          />
          {/* Axis */}
          <line x1={0} y1={H} x2={W} y2={H} stroke="var(--border)" strokeWidth={1.5} />
          {[-15, -10, -5, 0, 5, 10, 15].map(k => (
            <g key={k}>
              <line x1={toSvgX(k)} y1={H} x2={toSvgX(k)} y2={H + 5} stroke="var(--border)" strokeWidth={1} />
              <text x={toSvgX(k)} y={H + 17} textAnchor="middle" fontSize={9} fill="var(--text-muted)">{k}</text>
            </g>
          ))}
          <text x={W / 2} y={H + 28} textAnchor="middle" fontSize={9} fill="var(--text-muted)">Sample mean (centered at μ)</text>
          {/* Center line */}
          <line x1={toSvgX(0)} y1={8} x2={toSvgX(0)} y2={H} stroke="var(--teal)" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
          <text x={toSvgX(0)} y={6} textAnchor="middle" fontSize={9} fill="var(--teal)">μ</text>
        </svg>
      </div>

      {/* Reference table */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 440, borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sample size n</th>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SE = 15/√n</th>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>95% CI width</th>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>vs SE at n=25</th>
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map((row, i) => {
              const seVal = SIGMA / Math.sqrt(row.n);
              const ciW = (2 * 1.96 * seVal).toFixed(2);
              const ratio = (seVal / (SIGMA / Math.sqrt(25))).toFixed(2);
              const isActive = Math.abs(n - row.n) / row.n < 0.5 && Math.abs(n - row.n) < Math.abs(n - (TABLE_ROWS[i - 1]?.n || -999)) && Math.abs(n - row.n) < Math.abs(n - (TABLE_ROWS[i + 1]?.n || 99999));
              const highlight = TABLE_ROWS.reduce((best, r) => Math.abs(r.n - n) < Math.abs(best.n - n) ? r : best).n === row.n;
              return (
                <tr key={row.n} style={{
                  background: highlight ? 'var(--accent-bg)' : i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)',
                  borderLeft: highlight ? '3px solid var(--accent)' : '3px solid transparent',
                }}>
                  <td style={{ padding: '0.7rem 1rem', fontWeight: highlight ? 700 : 400, color: highlight ? 'var(--accent)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                    {row.n.toLocaleString()}{highlight && n !== row.n ? ` ← ~n=${n}` : ''}
                  </td>
                  <td style={{ padding: '0.7rem 1rem', textAlign: 'right', fontWeight: highlight ? 700 : 400, color: highlight ? 'var(--accent)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{seVal.toFixed(3)}</td>
                  <td style={{ padding: '0.7rem 1rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>±{ciW}</td>
                  <td style={{ padding: '0.7rem 1rem', textAlign: 'center', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{ratio}×</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── What you should have confirmed ── */}
      {explored && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Doubling n reduces SE by a factor of 1/√2 ≈ 0.71 — about 29% reduction, not 50%. To halve SE, you need 4x the sample size. This non-linearity is why collecting more data has steeply diminishing returns: the first 1,000 users dramatically reduce your SE; the next 4,000 give you the same improvement again.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {explored && (
        <div className="pal-reveal-in" style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Never present a mean estimate without its SE or confidence interval. A mean without precision information is not informative — it's a single point estimate that could be anywhere. "Session duration is 4.8 minutes (SE: 0.4)" is a statement with meaning. "Session duration is 4.8 minutes" is a number without context.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> When comparing two estimates ("team A's mean is 4.8, team B's is 5.2"), your first question is whether the difference-to-SE ratio is large enough to be meaningful. If each estimate has SE ≈ 0.5, a 0.4 difference is within one SE — almost certainly noise. If SE ≈ 0.05, a 0.4 difference is 8 SEs — not noise.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> When someone proposes cutting a study short to save time, you can calculate exactly what they're giving up. Halving the run time roughly halves n, which increases SE by √2 ≈ 41%. Ask them: are they comfortable with 41% wider confidence intervals? This makes the tradeoff concrete rather than abstract.</p>
          </div>
        </div>
      )}

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Your confidence interval width is 2 × 1.96 × SE. To get a CI half as wide — and detect effects half as large — you need 4× more users per variant. This is the core tradeoff in A/B test sample size planning. SE is what you\'re managing when you size an experiment.'}
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
