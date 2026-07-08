import { useState, useMemo } from 'react';

function normalPDF(x, mu = 0, sigma = 1) {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

function erf(z) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const t = 1 / (1 + p * Math.abs(z));
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  return sign * y;
}

function normalCDF(x, mu = 0, sigma = 1) {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));
}

const W = 580;
const H = 175;
const N_POINTS = 220;

// Fixed height reference: peak PDF at the minimum slider sigma (0.5).
// Using a constant reference means the curve HEIGHT changes visually as σ changes —
// narrow σ → tall bell, wide σ → short flat bell.
const REF_PDF = 1 / (0.5 * Math.sqrt(2 * Math.PI));

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module04_NormalDist({ module, onNext }) {
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [explored, setExplored] = useState(false);

  const { curvePath, fillPath, xMin, xMax, maxPDF, toSvgX, toSvgY, peakSvgY } = useMemo(() => {
    const xMin = mu - 4.5 * sigma;
    const xMax = mu + 4.5 * sigma;
    const xRange = xMax - xMin;
    const maxPDF = normalPDF(mu, mu, sigma);

    const toSvgX = (x) => ((x - xMin) / xRange) * W;
    // Use REF_PDF (fixed at σ=0.5) so the curve HEIGHT changes visually when σ changes.
    const toSvgY = (pdf) => Math.max(2, H - (pdf / REF_PDF) * (H * 0.85) - 8);

    const pts = Array.from({ length: N_POINTS }, (_, i) => {
      const x = xMin + (i / (N_POINTS - 1)) * xRange;
      return { x: toSvgX(x), y: toSvgY(normalPDF(x, mu, sigma)) };
    });

    const curvePath = 'M ' + pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' L ');

    const fillPath =
      curvePath +
      ` L ${pts[pts.length - 1].x.toFixed(2)},${H} L ${pts[0].x.toFixed(2)},${H} Z`;

    // SVG y of the current curve peak — used to position labels inside the chart.
    const peakSvgY = toSvgY(maxPDF);

    return { curvePath, fillPath, xMin, xMax, maxPDF, toSvgX, toSvgY, peakSvgY };
  }, [mu, sigma]);

  const sigmaLines = useMemo(() => {
    const lines = [];
    for (let k = -2; k <= 2; k++) {
      const val = mu + k * sigma;
      lines.push({ val, k, x: toSvgX(val) });
    }
    return lines;
  }, [mu, sigma, toSvgX]);

  const pct68 = ((normalCDF(mu + sigma, mu, sigma) - normalCDF(mu - sigma, mu, sigma)) * 100).toFixed(1);
  const pct95 = ((normalCDF(mu + 2 * sigma, mu, sigma) - normalCDF(mu - 2 * sigma, mu, sigma)) * 100).toFixed(1);

  function sigmaLabel(k) {
    if (k === 0) return 'μ';
    if (k === 1) return 'μ+σ';
    if (k === -1) return 'μ−σ';
    if (k === 2) return 'μ+2σ';
    if (k === -2) return 'μ−2σ';
    return '';
  }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          You now have two numbers that summarize a dataset: where it's centered (mean) and how spread out it is (standard deviation). But two numbers don't tell you everything. You still don't know the shape.
        </p>
        <p style={prose}>
          The shape matters because shape determines what's possible. A skewed distribution means extreme values on one side are far more common than the mean suggests. A bimodal distribution means you probably have two distinct groups masquerading as one. Two datasets can share the same mean and SD and look completely different.
        </p>
        <p style={prose}>
          One shape appears so consistently — across so many different domains — that it has been studied for over two centuries. Heights of people. Measurement errors in physics experiments. Test scores in large populations. They all cluster around a center, thin out symmetrically toward the extremes, and produce a characteristic bell curve. Why? Because most of these quantities are the sum of many small, independent factors. When you sum many small independent influences, the result tends toward this bell shape regardless of what the individual factors look like.
        </p>
        <p style={prose}>
          This bell shape is the <strong style={{ color: 'var(--text)' }}>normal distribution</strong>. It is defined entirely by two parameters: the mean μ (where the center sits) and the standard deviation σ (how wide the bell is). Change the mean and the whole curve shifts left or right. Change the SD and it becomes taller and narrow, or flatter and wide. The shape is always the same bell — only position and width vary.
        </p>
        <p style={prose}>
          Because the shape is mathematically fixed, you can make precise probability statements from just these two numbers. Specifically: approximately 68% of data falls within 1 SD of the mean. Approximately 95% falls within 2 SD. Approximately 99.7% falls within 3 SD. This is the empirical rule — memorize it once and use it constantly.
        </p>
        <p style={prose}>
          Now the critical caveat. Not everything is normally distributed. Revenue per user is typically right-skewed. Session duration: same. If you assume normality where it doesn't hold and use the empirical rule, you'll systematically underestimate the probability of extreme values. The normal distribution is a model — useful, precise, powerful — but an assumption that has to be checked, not a default that's always safe.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          If you have a normally distributed metric with mean 50 and SD 10, what fraction of values would you expect to be above 70? Work through the empirical rule before checking.
        </p>
      </div>

      {/* ── Interactive label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Shape the Bell Curve</div>

      {/* ── Instructions box ── */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Drag both sliders and watch the curve reshape. Notice that changing the mean (mu) slides the whole curve left or right, while changing sigma widens or narrows it — but the 68-95-99.7 percentages stay constant.
      </div>

      {/* SVG Curve */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H + 30}`} width="100%" style={{ maxWidth: W, display: 'block', margin: '0 auto', overflow: 'visible' }}>
          {/* Filled area */}
          <path d={fillPath} fill="var(--accent-bg)" stroke="none" opacity={0.7} />

          {/* Sigma region labels */}
          {/* 68% band — uses same toSvgY normalization as the main curve */}
          <path
            d={(() => {
              const lo = mu - sigma, hi = mu + sigma;
              const pts68 = Array.from({ length: 80 }, (_, i) => {
                const x = lo + (i / 79) * (hi - lo);
                return { x: toSvgX(x), y: toSvgY(normalPDF(x, mu, sigma)) };
              });
              return (
                'M ' + pts68.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' L ') +
                ` L ${toSvgX(hi).toFixed(2)},${H} L ${toSvgX(lo).toFixed(2)},${H} Z`
              );
            })()}
            fill="var(--accent)" opacity={0.15}
          />

          {/* Curve stroke */}
          <path d={curvePath} fill="none" stroke="var(--accent)" strokeWidth={2.5} />

          {/* Sigma vertical lines */}
          {sigmaLines.map(({ val, k, x }) => (
            <g key={k}>
              <line
                x1={x} y1={10}
                x2={x} y2={H}
                stroke={k === 0 ? 'var(--accent)' : 'var(--text-muted)'}
                strokeWidth={k === 0 ? 2 : 1.2}
                strokeDasharray={k === 0 ? '5,3' : '3,3'}
                opacity={0.7}
              />
              <text
                x={x} y={H + 14}
                textAnchor="middle" fontSize={9.5}
                fill={k === 0 ? 'var(--accent)' : 'var(--text-muted)'}
                fontWeight={k === 0 ? 700 : 400}
              >
                {sigmaLabel(k)}
              </text>
              <text
                x={x} y={H + 24}
                textAnchor="middle" fontSize={8.5}
                fill="var(--text-muted)"
              >
                {val.toFixed(1)}
              </text>
            </g>
          ))}

          {/* 68% label — positioned relative to current curve peak */}
          <text x={toSvgX(mu)} y={Math.max(16, peakSvgY - 14)} textAnchor="middle" fontSize={11} fill="var(--accent)" fontWeight={700} opacity={0.85}>
            68%
          </text>
          <text x={toSvgX(mu)} y={Math.max(28, peakSvgY - 1)} textAnchor="middle" fontSize={9} fill="var(--accent)" opacity={0.7}>
            (±1σ)
          </text>

          {/* Axis line */}
          <line x1={0} y1={H} x2={W} y2={H} stroke="var(--border)" strokeWidth={1.5} />
        </svg>
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>Mean μ</label>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{mu.toFixed(1)}</span>
          </div>
          <input
            type="range" min={-3} max={3} step={0.1}
            value={mu}
            onChange={e => { setMu(parseFloat(e.target.value)); setExplored(true); }}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <span>−3</span><span>Shifts the curve</span><span>+3</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 220, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>Std Dev σ</label>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--teal)', fontVariantNumeric: 'tabular-nums' }}>{sigma.toFixed(2)}</span>
          </div>
          <input
            type="range" min={0.5} max={3} step={0.05}
            value={sigma}
            onChange={e => { setSigma(parseFloat(e.target.value)); setExplored(true); }}
            style={{ width: '100%', accentColor: 'var(--teal)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <span>0.5 (narrow)</span><span>Reshapes width</span><span>3.0 (wide)</span>
          </div>
        </div>
      </div>

      {/* Empirical rule display */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { range: '±1σ', pct: pct68, color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)', desc: `${mu.toFixed(1)} ± ${sigma.toFixed(2)}` },
          { range: '±2σ', pct: pct95, color: 'var(--teal)', bg: 'var(--teal-bg)', border: 'var(--teal-border)', desc: `${mu.toFixed(1)} ± ${(2 * sigma).toFixed(2)}` },
          { range: '±3σ', pct: '99.73', color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)', desc: 'Nearly all data' },
        ].map(({ range, pct, color, bg, border, desc }) => (
          <div key={range} style={{ flex: 1, minWidth: 130, background: bg, border: `1px solid ${border}`, borderRadius: 'var(--radius)', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{range}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{pct}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* ── What you should have confirmed ── */}
      {explored && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            70 is exactly 2 SD above the mean (50 + 2×10). The empirical rule says 95% falls within ±2σ, meaning 2.5% falls above the upper bound. So about 2.5% of values exceed 70. If you estimated "very few" but couldn't be precise — that's exactly the gap the normal distribution closes. With shape information, gut feel becomes a number.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {explored && (
        <div className="pal-reveal-in" style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Before applying any statistical test that assumes normality, plot your data. A histogram takes 30 seconds. If the distribution is clearly right-skewed — and most product metrics are — you've just saved yourself from a fundamentally wrong analysis. Use the median instead of the mean, and non-parametric tests when normality doesn't hold.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Use the empirical rule for fast back-of-envelope probability estimates. If a stakeholder asks "how often will this metric exceed X?" and you know the distribution is roughly normal, you can answer from mean and SD alone — in the meeting, without a spreadsheet. That speed has real value.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> When a colleague or vendor claims "this metric is normally distributed," ask to see the distribution. Many metrics that feel like they "should" be normal — conversion rates near 0% or 100%, any metric bounded at zero — aren't. Misapplied normality assumptions are one of the most common sources of wrong conclusions in product analytics.</p>
          </div>
        </div>
      )}

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'By the Central Limit Theorem, your A/B test sample means will be normally distributed even if individual user behavior is skewed. This is the mathematical foundation that makes p-values and confidence intervals valid — not the raw data being normal, but the sampling distribution of the mean.'}
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
