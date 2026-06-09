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
const H = 165;
const N_POINTS = 260;
const X_MIN = -4.5;
const X_MAX = 4.5;
const X_RANGE = X_MAX - X_MIN;

const PRESETS = [
  { label: '±1σ → 68.27%', z1: -1, z2: 1 },
  { label: '±2σ → 95.45%', z1: -2, z2: 2 },
  { label: '±3σ → 99.73%', z1: -3, z2: 3 },
  { label: 'Left tail z=−1.96', z1: -4, z2: -1.96 },
  { label: 'Right tail z=1.96', z1: 1.96, z2: 4 },
];

export function Module06_Areas({ module, onNext }) {
  const [z1, setZ1] = useState(-1);
  const [z2, setZ2] = useState(1);

  // Ensure z1 <= z2
  const lo = Math.min(z1, z2);
  const hi = Math.max(z1, z2);

  const prob = normalCDF(hi) - normalCDF(lo);
  const leftTail = normalCDF(lo);
  const rightTail = 1 - normalCDF(hi);

  function toSvgX(x) {
    return ((x - X_MIN) / X_RANGE) * W;
  }

  function toSvgY(pdf) {
    const maxPDF = normalPDF(0);
    return H - (pdf / maxPDF) * (H * 0.83) - 10;
  }

  const { curvePath, shadedPath, leftShadePath, rightShadePath } = useMemo(() => {
    const allPts = Array.from({ length: N_POINTS }, (_, i) => {
      const x = X_MIN + (i / (N_POINTS - 1)) * X_RANGE;
      return { x, svgX: toSvgX(x), svgY: toSvgY(normalPDF(x)) };
    });

    const curvePath = 'M ' + allPts.map(p => `${p.svgX.toFixed(2)},${p.svgY.toFixed(2)}`).join(' L ');

    // Shaded region between lo and hi
    const shadePts = allPts.filter(p => p.x >= lo && p.x <= hi);
    const shadedPath = shadePts.length >= 2
      ? 'M ' + shadePts.map(p => `${p.svgX.toFixed(2)},${p.svgY.toFixed(2)}`).join(' L ') +
        ` L ${toSvgX(hi).toFixed(2)},${H} L ${toSvgX(lo).toFixed(2)},${H} Z`
      : '';

    // Left tail
    const leftPts = allPts.filter(p => p.x <= lo);
    const leftShadePath = leftPts.length >= 2
      ? 'M ' + leftPts.map(p => `${p.svgX.toFixed(2)},${p.svgY.toFixed(2)}`).join(' L ') +
        ` L ${toSvgX(lo).toFixed(2)},${H} L ${toSvgX(X_MIN).toFixed(2)},${H} Z`
      : '';

    // Right tail
    const rightPts = allPts.filter(p => p.x >= hi);
    const rightShadePath = rightPts.length >= 2
      ? 'M ' + rightPts.map(p => `${p.svgX.toFixed(2)},${p.svgY.toFixed(2)}`).join(' L ') +
        ` L ${toSvgX(X_MAX).toFixed(2)},${H} L ${toSvgX(hi).toFixed(2)},${H} Z`
      : '';

    return { curvePath, shadedPath, leftShadePath, rightShadePath };
  }, [lo, hi]);

  function handlePreset(preset) {
    setZ1(preset.z1);
    setZ2(preset.z2);
  }

  const pctLabel = (v) => `${(v * 100).toFixed(2)}%`;

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your PM asks: what percentage of users complete onboarding in under 5 minutes? The onboarding time is normally distributed with a known mean and standard deviation. The answer is literally the area under the curve to the left of 5 minutes — and once you convert to z-scores, you can read it straight off the standard normal.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          This is the same math behind every p-value and confidence interval you\'ll ever compute. The shaded area IS the probability. Drag the bounds below to shade different regions and watch the probability update in real time.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Shade Regions and Read Probabilities</div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        Drag the bounds to shade different regions. The shaded area is exactly P(z₁ &lt; Z &lt; z₂) — the probability that a randomly drawn value falls in that range.
      </p>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Click a preset or drag the z-bound sliders to shade different regions of the curve. Read the central probability and the tail probabilities — remember that the tails together are the two-sided p-value. Try "Left tail z=−1.96" and confirm both tails sum to 5%.
      </div>

      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${z1 === preset.z1 && z2 === preset.z2 ? 'var(--accent)' : 'var(--border)'}`,
              background: z1 === preset.z1 && z2 === preset.z2 ? 'var(--accent-bg)' : 'var(--surface)',
              color: z1 === preset.z1 && z2 === preset.z2 ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: z1 === preset.z1 && z2 === preset.z2 ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* SVG */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H + 22}`} style={{ width: '100%', overflow: 'visible' }}>
          {/* Left tail fill */}
          {leftShadePath && (
            <path d={leftShadePath} fill="var(--red)" opacity={0.12} />
          )}

          {/* Right tail fill */}
          {rightShadePath && (
            <path d={rightShadePath} fill="var(--red)" opacity={0.12} />
          )}

          {/* Central shaded area */}
          {shadedPath && (
            <path d={shadedPath} fill="var(--accent)" opacity={0.2} />
          )}

          {/* Curve */}
          <path d={curvePath} fill="none" stroke="var(--accent)" strokeWidth={2.5} />

          {/* Axis */}
          <line x1={0} y1={H} x2={W} y2={H} stroke="var(--border)" strokeWidth={1.5} />

          {/* Tick marks */}
          {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map(k => {
            const x = toSvgX(k);
            return (
              <g key={k}>
                <line x1={x} y1={H} x2={x} y2={H + 5} stroke="var(--border)" strokeWidth={1} />
                <text x={x} y={H + 16} textAnchor="middle" fontSize={9.5} fill="var(--text-muted)">{k}</text>
              </g>
            );
          })}

          {/* z1 bound line */}
          <line x1={toSvgX(lo)} y1={8} x2={toSvgX(lo)} y2={H} stroke="var(--red)" strokeWidth={2} strokeDasharray="4,3" opacity={0.8} />
          <text x={toSvgX(lo)} y={6} textAnchor="middle" fontSize={10} fill="var(--red)" fontWeight={700}>
            z₁={lo.toFixed(2)}
          </text>

          {/* z2 bound line */}
          <line x1={toSvgX(hi)} y1={18} x2={toSvgX(hi)} y2={H} stroke="var(--teal)" strokeWidth={2} strokeDasharray="4,3" opacity={0.8} />
          <text x={toSvgX(hi)} y={16} textAnchor="middle" fontSize={10} fill="var(--teal)" fontWeight={700}>
            z₂={hi.toFixed(2)}
          </text>

          {/* Center probability label */}
          {prob > 0.05 && (
            <text
              x={(toSvgX(lo) + toSvgX(hi)) / 2}
              y={toSvgY(normalPDF((lo + hi) / 2)) + 18}
              textAnchor="middle" fontSize={12} fill="var(--accent)" fontWeight={800}
            >
              {pctLabel(prob)}
            </text>
          )}

          {/* Axis label */}
          <text x={W / 2} y={H + 28} textAnchor="middle" fontSize={9} fill="var(--text-muted)">z-score</text>
        </svg>
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Left bound z₁</label>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{z1.toFixed(2)}</span>
          </div>
          <input
            type="range" min={-4} max={4} step={0.05}
            value={z1}
            onChange={e => setZ1(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--red)' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 200, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Right bound z₂</label>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--teal)', fontVariantNumeric: 'tabular-nums' }}>{z2.toFixed(2)}</span>
          </div>
          <input
            type="range" min={-4} max={4} step={0.05}
            value={z2}
            onChange={e => setZ2(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--teal)' }}
          />
        </div>
      </div>

      {/* Probability breakdown */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 130, background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius)', padding: '0.9rem 1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Left tail P(Z &lt; z₁)</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{pctLabel(leftTail)}</div>
        </div>
        <div style={{ flex: 1.5, minWidth: 160, background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '0.9rem 1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.25rem' }}>Central P(z₁ &lt; Z &lt; z₂)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{pctLabel(prob)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 130, background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius)', padding: '0.9rem 1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Right tail P(Z &gt; z₂)</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{pctLabel(rightTail)}</div>
        </div>
      </div>

      {/* Formula callout */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text)' }}>
        <strong style={{ fontFamily: 'sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calculation</strong>
        <div style={{ marginTop: '0.5rem' }}>
          P(z₁ &lt; Z &lt; z₂) = Φ(z₂) − Φ(z₁)
        </div>
        <div style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          = Φ({hi.toFixed(2)}) − Φ({lo.toFixed(2)}) = {normalCDF(hi).toFixed(4)} − {normalCDF(lo).toFixed(4)} = <strong style={{ color: 'var(--accent)' }}>{prob.toFixed(4)}</strong>
        </div>
      </div>

      {/* p-value connection */}
      <div style={{ background: 'var(--purple-bg)', border: '1.5px solid var(--purple-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>How This Becomes a p-value</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          In a two-sided hypothesis test, the p-value = left tail + right tail = the probability of getting a result as extreme as yours if the null were true.
          Try preset "Left tail z=−1.96" — the two tails together = 5%, which is the p=0.05 threshold.
        </div>
      </div>

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'Area = probability. The total area under the curve is exactly 1.0 (100%). A p-value is just the area in the tails beyond your test statistic — the probability of seeing your result (or more extreme) by chance alone.'}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'When your A/B test returns z=2.1, you look up the area in both tails beyond ±2.1. That area is your p-value (~3.6%). This is why the threshold z=±1.96 corresponds exactly to p=0.05.'}
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
