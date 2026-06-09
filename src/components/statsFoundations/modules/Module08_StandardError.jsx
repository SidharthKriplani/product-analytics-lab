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

export function Module08_StandardError({ module, onNext }) {
  const [n, setN] = useState(100);

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
      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          You pull the average session duration and it says 8.2 minutes. You refresh the query an hour later and it says 7.9. Tomorrow it says 8.5. Your PM asks why the number keeps bouncing. The answer is standard error — every sample mean has built-in wobble, and the SE tells you exactly how much wobble to expect.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          The critical insight: SE shrinks with the square root of sample size, not linearly. That means you need 4x the users to cut the wobble in half. Drag the slider below and watch the sampling distribution narrow as n grows — but notice the diminishing returns.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Watch Precision Scale with Sample Size</div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        The <strong>Standard Error (SE)</strong> measures how much your sample mean varies from sample to sample.
        It equals the population standard deviation divided by the square root of n — so larger samples produce smaller (more precise) SEs.
        Critically, you need <em>4× more users</em> to halve the standard error.
      </p>

      {/* Instruction */}
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
              onChange={e => setN(sliderToN(parseInt(e.target.value)))}
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
        <svg viewBox={`0 0 ${W} ${H + 25}`} style={{ width: '100%', maxHeight: '300px', overflow: 'hidden', display: 'block' }}>
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
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
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

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'SE shrinks with the square root of n — not linearly. Going from n=100 to n=400 (4× users) only halves the SE from 1.5 to 0.75. This square-root relationship is why collecting more data has diminishing returns on precision.'}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Your confidence interval width is 2 × 1.96 × SE. To get a CI half as wide — and detect effects half as large — you need 4× more users per variant. This is the core tradeoff in A/B test sample size planning.'}
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
