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
      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          A user\'s session time is 47 minutes. Your average session is 20 minutes with a standard deviation of 9. Is this person a power user, a confused user stuck on a broken flow, or just slightly above normal? Without a z-score, you have no way to answer — 47 minutes means nothing until you know how far it is from the mean in standard-deviation units.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          Z-scores convert raw values to a universal scale so you can compare across different metrics. A z-score of +2 means the same degree of unusualness whether you\'re measuring session time, revenue, or page views. Set your population parameters below and move the value slider to see where it lands.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Locate a Value on the Curve</div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        It converts any normally distributed measurement to a universal scale — so you can compare values from different distributions.
      </p>

      {/* Instruction */}
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

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'Z-scores standardize values so you can compare across different metrics and populations. A conversion rate 1.5 SDs above average and a revenue value 1.5 SDs above average are equally "unusual" in their respective distributions.'}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'The z-score is the test statistic in a z-test. When you see "z = 2.0, p = 0.046", the z-score is exactly what you calculated here — how many standard errors the observed difference is from zero (the null hypothesis).'}
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
