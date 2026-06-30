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

const W = 560;
const H = 160;
const N_POINTS = 200;

const ANCHORS = [
  { z: 0, label: 'z = 0', desc: 'Exactly average', color: 'var(--text-muted)' },
  { z: 1, label: 'z = +1', desc: 'Top ~16% — one SD above mean', color: 'var(--accent)' },
  { z: 2, label: 'z = +2', desc: 'Top ~2.3% — two SDs above mean', color: 'var(--teal)' },
  { z: -1, label: 'z = −1', desc: 'Bottom ~16% — one SD below mean', color: 'var(--yellow)' },
];

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module05_ZScores({ module, onNext }) {
  const [popMu, setPopMu] = useState(50);
  const [popSigma, setPopSigma] = useState(10);
  const [xVal, setXVal] = useState(65);

  const z = (xVal - popMu) / popSigma;
  const clampedZ = Math.max(-4, Math.min(4, z));
  const pctAbove = ((1 - normalCDF(z)) * 100).toFixed(1);
  const pctBelow = (normalCDF(z) * 100).toFixed(1);

  const { curvePath, fillPath, toSvgX, toSvgY, maxPDF } = useMemo(() => {
    const xMin = -4.5;
    const xMax = 4.5;
    const xRange = xMax - xMin;
    const maxPDF = normalPDF(0);

    const toSvgX = (x) => ((x - xMin) / xRange) * W;
    const toSvgY = (pdf) => H - (pdf / maxPDF) * (H * 0.82) - 10;

    const pts = Array.from({ length: N_POINTS }, (_, i) => {
      const x = xMin + (i / (N_POINTS - 1)) * xRange;
      return { x, y: toSvgY(normalPDF(x)) };
    });

    const curvePath = 'M ' + pts.map(p => `${toSvgX(p.x).toFixed(2)},${p.y.toFixed(2)}`).join(' L ');
    const fillPath = curvePath + ` L ${toSvgX(xMax).toFixed(2)},${H} L ${toSvgX(xMin).toFixed(2)},${H} Z`;

    return { curvePath, fillPath, toSvgX, toSvgY, maxPDF };
  }, []);

  // Dot position on curve
  const dotX = toSvgX(clampedZ);
  const dotY = toSvgY(normalPDF(clampedZ));
  const axisY = H;

  function zLocation() {
    if (Math.abs(z) < 0.3) return 'Right at the center — this is a typical value.';
    if (z > 3) return `Extreme high tail — very unusual value (top ${pctAbove}%).`;
    if (z < -3) return `Extreme low tail — very unusual value (bottom ${pctBelow}%).`;
    if (z > 0) return `Above average by ${z.toFixed(2)} standard deviations. Top ${pctAbove}% of the population.`;
    return `Below average by ${Math.abs(z).toFixed(2)} standard deviations. Bottom ${pctBelow}% of the population.`;
  }

  function dotColor() {
    if (Math.abs(z) > 2.5) return 'var(--red)';
    if (Math.abs(z) > 1.5) return 'var(--yellow)';
    if (Math.abs(z) > 0.5) return 'var(--teal)';
    return 'var(--green)';
  }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          You're looking at two users. One has a session duration of 8 minutes. The other spent £85 in a single order. Your typical user sessions are around 5 minutes; your typical order is around £30. Which of these two observations is more unusual?
        </p>
        <p style={prose}>
          You can't compare them directly. They're measured in different units, from distributions with different means and different spreads. 8 minutes might be mildly above average if session duration has wide variance. £85 might be extremely unusual if orders are tightly clustered near £30. Or vice versa. The raw number tells you nothing about how unusual it is relative to typical behavior.
        </p>
        <p style={prose}>
          What you need is a common scale — a way to express any observation, in any metric, in terms of one thing: how far it sits from its own mean, measured in units of its own spread.
        </p>
        <p style={prose}>
          That one thing is the <strong style={{ color: 'var(--text)' }}>Z-score</strong>. The calculation is two steps. First, subtract the mean — this centers the distribution so the mean becomes zero. Second, divide by the standard deviation — this scales the distribution so one unit of SD becomes one unit on the new scale. Z = (x − μ) / σ. A Z-score of 0 means the observation is exactly at the mean. A Z-score of 1 means it's one SD above. A Z-score of −2 means it's two SDs below. The scale is the same regardless of what metric you started with.
        </p>
        <p style={prose}>
          Let's take the example. Session duration: mean 5 min, SD 2 min. The user with 8 minutes has Z = (8 − 5) / 2 = 1.5. Order value: mean £30, SD 8. The user with £85 has Z = (85 − 30) / 8 = 6.9. Now you can compare: 8 minutes is mildly elevated. £85 is an extreme outlier — nearly 7 SDs from the center. That's not a high spender; that needs investigation.
        </p>
        <p style={prose}>
          Because Z-scores are on the standard normal scale (mean 0, SD 1), every Z-score maps directly to a percentile. Z = 1.0 is roughly the 84th percentile. Z = 1.96 is the 97.5th percentile. Z = 3.0 is the 99.87th percentile — often used as an anomaly threshold. One constraint: Z-scores only make interpretive sense for data that is approximately normally distributed. For skewed metrics, transform first or use percentile rank instead.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Two users both have a Z-score of 2.0 — one in session duration, one in revenue. What can you say with confidence about their relative unusualness? What can't you say?
        </p>
      </div>

      {/* ── Interactive label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Locate a Value on the Curve</div>

      {/* ── Instructions box ── */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Adjust the three sliders to set your population mean, standard deviation, and the specific value you want to locate. Watch where the dot lands on the standard normal curve and read the z-score formula. Try pushing x well above or below the mean to see extreme tail positions.
      </div>

      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Population Mean μ', val: popMu, set: setPopMu, min: 0, max: 100, step: 1, color: 'var(--accent)' },
          { label: 'Population SD σ', val: popSigma, set: setPopSigma, min: 1, max: 30, step: 0.5, color: 'var(--teal)' },
          { label: 'Value x', val: xVal, set: setXVal, min: popMu - 4 * popSigma, max: popMu + 4 * popSigma, step: 0.5, color: dotColor() },
        ].map(({ label, val, set, min, max, step, color }) => (
          <div key={label} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</label>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{val}</span>
            </div>
            <input
              type="range" min={min} max={max} step={step}
              value={val}
              onChange={e => set(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: color }}
            />
          </div>
        ))}
      </div>

      {/* Z-score result */}
      <div style={{
        background: 'var(--surface-2)', border: `2px solid ${dotColor()}`, borderRadius: 'var(--radius)',
        padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Z-Score</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: dotColor(), lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {z.toFixed(2)}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 500, marginBottom: '0.35rem' }}>{zLocation()}</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', display: 'inline-block' }}>
            z = (x − μ) / σ = ({xVal} − {popMu}) / {popSigma} = <strong style={{ color: dotColor() }}>{z.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* SVG Curve with dot */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', overflowX: 'auto' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Standard Normal (z-scale) — dot shows where x={xVal} lands</div>
        <svg viewBox={`0 0 ${W} ${H + 22}`} style={{ width: '100%', overflow: 'visible' }}>
          {/* Fill */}
          <path d={fillPath} fill="var(--accent-bg)" opacity={0.5} />

          {/* Curve */}
          <path d={curvePath} fill="none" stroke="var(--accent)" strokeWidth={2} />

          {/* Axis */}
          <line x1={0} y1={axisY} x2={W} y2={axisY} stroke="var(--border)" strokeWidth={1.5} />

          {/* Sigma ticks */}
          {[-3, -2, -1, 0, 1, 2, 3].map(k => {
            const x = toSvgX(k);
            return (
              <g key={k}>
                <line x1={x} y1={axisY} x2={x} y2={axisY + 5} stroke="var(--border)" strokeWidth={1} />
                <text x={x} y={axisY + 16} textAnchor="middle" fontSize={9.5} fill="var(--text-muted)">{k}</text>
              </g>
            );
          })}

          {/* Axis label */}
          <text x={W / 2} y={axisY + 28} textAnchor="middle" fontSize={9} fill="var(--text-muted)">z-score</text>

          {/* Dot on curve */}
          <line x1={dotX} y1={dotY} x2={dotX} y2={axisY} stroke={dotColor()} strokeWidth={1.5} strokeDasharray="3,3" opacity={0.8} />
          <circle cx={dotX} cy={dotY} r={8} fill={dotColor()} opacity={0.9} />
          <text x={dotX} y={dotY - 12} textAnchor="middle" fontSize={10} fill={dotColor()} fontWeight={700}>
            z={z.toFixed(2)}
          </text>
          <circle cx={dotX} cy={axisY} r={4} fill={dotColor()} opacity={0.7} />
        </svg>
      </div>

      {/* Anchor reference cards */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Reference Anchors</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.5rem' }}>
          {ANCHORS.map(({ z: az, label, desc, color }) => (
            <div key={az} style={{
              padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${Math.abs(clampedZ - az) < 0.3 ? color : 'var(--border-subtle)'}`,
              background: Math.abs(clampedZ - az) < 0.3 ? 'var(--accent-bg)' : 'var(--surface)',
              transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color, marginBottom: '0.2rem' }}>{label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── What you should have confirmed ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Z-scores make the two users' unusualness directly comparable — Z = 2.0 in both means both are at the same percentile (~97.7th) in their respective distributions. What you can't say: which metric matters more to the business, or whether the distributions were actually normal. Comparability in Z-score space is a mathematical statement, not a business one. You still have to interpret what the Z means in context.
        </p>
      </div>

      {/* ── Analyst Move ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Use Z-scores for anomaly flagging in monitoring dashboards. Set a threshold — typically |Z| greater than 3 — and flag automatically. This is far more reliable than percentage-change thresholds, which are sensitive to baseline level. A 10% change on a metric with 5% natural daily variance is noise; on a metric with 1% variance it's a fire.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> When comparing performance across teams, cohorts, or markets that measure different underlying distributions, standardize first. Revenue per user in the UK versus India are not directly comparable in raw currency — they operate in different distributions. Z-scores let you ask "which market is performing above its own normal?" — a meaningful question the raw number can't answer.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> When a stakeholder says "that's a big number," ask "big relative to what?" The Z-score forces that question to be answered precisely. An outlier is only an outlier relative to a distribution — and defining that distribution is always the analyst's job, not the metric's.</p>
        </div>
      </div>

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'The z-score is the test statistic in a z-test. When you see "z = 2.0, p = 0.046", the z-score is exactly what you calculated here — how many standard errors the observed difference is from zero (the null hypothesis). The p-value is the area in the tails beyond that z.'}
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
