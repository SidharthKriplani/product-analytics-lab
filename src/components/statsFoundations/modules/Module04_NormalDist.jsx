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

export function Module04_NormalDist({ module, onNext }) {
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);

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
      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          You plot your experiment\'s primary metric — time-to-checkout in seconds — and it forms a clean bell shape. Your stats lead says that\'s good news: a normal distribution means you can use z-tests, build confidence intervals, and run power calculations with well-understood formulas.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          But what exactly defines that bell? Just two numbers: the mean (where the peak sits) and the standard deviation (how wide the bell spreads). Move the sliders below to see how these two parameters completely control the shape.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Shape the Bell Curve</div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        The normal distribution is a symmetric bell curve defined entirely by its mean μ and standard deviation σ.
        Use the sliders to shift and reshape the curve. Notice that changing σ widens the bell (more spread) while μ slides it left or right.
      </p>

      {/* SVG Curve */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H + 30}`} style={{ width: '100%', overflow: 'visible' }}>
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

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Drag both sliders and watch the curve reshape. Notice that changing the mean (mu) slides the whole curve left or right, while changing sigma widens or narrows it — but the 68-95-99.7 percentages stay constant.
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
            onChange={e => setMu(parseFloat(e.target.value))}
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
            onChange={e => setSigma(parseFloat(e.target.value))}
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

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'The 68-95-99.7 rule is constant for every normal distribution, regardless of μ and σ. This is why experiment results (which are approximately normal by the Central Limit Theorem) can always be compared to a standard scale.'}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'By the Central Limit Theorem, your A/B test sample means will be normally distributed even if individual user behavior is skewed. This is the mathematical foundation that makes p-values and confidence intervals valid.'}
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
