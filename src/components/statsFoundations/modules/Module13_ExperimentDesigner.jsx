import { useState, useMemo } from 'react';

// ── Math helpers ──────────────────────────────────────────────────────────────

const zAlphaMap = { 0.01: 2.576, 0.05: 1.96, 0.10: 1.645 };
const zBetaMap  = { 0.70: 0.524, 0.80: 0.842, 0.90: 1.282 };

function sampleSizePerVariant(p, relMDE, alpha, power) {
  const p2 = p * (1 + relMDE / 100);
  const za = zAlphaMap[alpha];
  const zb = zBetaMap[power];
  const pooled = (p + p2) / 2;
  return Math.ceil(2 * Math.pow(za + zb, 2) * pooled * (1 - pooled) / Math.pow(p2 - p, 2));
}

function normalPDF(x, mu, sigma) {
  return Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)) / (sigma * Math.sqrt(2 * Math.PI));
}

function svgPath(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
}

// ── SVG dimensions ────────────────────────────────────────────────────────────
const W = 600;
const H = 280;
const PAD_L = 10;
const PAD_R = 10;
const PAD_T = 30;
const PAD_B = 36;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const X_MIN = -4;
const X_MAX_BASE = 8; // will stretch with H1 center
const N_PTS = 400;

function buildCurve(mu, sigma, xMin, xMax, toSvgX, toSvgY) {
  return Array.from({ length: N_PTS }, (_, i) => {
    const x = xMin + (i / (N_PTS - 1)) * (xMax - xMin);
    return [toSvgX(x), toSvgY(normalPDF(x, mu, sigma))];
  });
}

// ── Toggle button component ───────────────────────────────────────────────────
function ToggleBtn({ value, active, label, color, onClick }) {
  return (
    <button
      onClick={() => onClick(value)}
      style={{
        padding: '0.35rem 0.75rem',
        borderRadius: '6px',
        border: `1.5px solid ${active ? color : 'var(--border)'}`,
        background: active ? 'var(--yellow-bg)' : 'var(--surface)',
        color: active ? 'var(--yellow-text)' : 'var(--text-muted)',
        fontSize: '0.82rem',
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function Module13_ExperimentDesigner({ module, onNext }) {
  const [baseline, setBaseline] = useState(10);      // % e.g. 10 = 10%
  const [relMDE, setRelMDE]     = useState(20);      // relative % e.g. 20 = 20%
  const [alpha, setAlpha]       = useState(0.05);
  const [power, setPower]       = useState(0.80);

  const p = baseline / 100;
  const n = useMemo(
    () => sampleSizePerVariant(p, relMDE, alpha, power),
    [p, relMDE, alpha, power]
  );
  const nHalf = useMemo(
    () => sampleSizePerVariant(p, relMDE / 2, alpha, power),
    [p, relMDE, alpha, power]
  );

  // ── Visual: illustrative normal distributions ──────────────────────────────
  // sigma=1 (fixed), H0 center=0, H1 center = relMDE/10 (scaled for visual clarity)
  const sigma = 1.0;
  const h1Center = relMDE / 10;
  const critVal = zAlphaMap[alpha]; // visual critical value on the sigma=1 scale

  const xMin = X_MIN;
  const xMax = Math.max(X_MAX_BASE, h1Center + 5);

  const toSvgX = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * PLOT_W;
  const maxPDF = normalPDF(0, 0, sigma);
  const toSvgY = (pdf) => PAD_T + PLOT_H - (pdf / maxPDF) * PLOT_H * 0.88;
  const baseY  = PAD_T + PLOT_H;

  const { h0Pts, h1Pts } = useMemo(() => {
    return {
      h0Pts: buildCurve(0,        sigma, xMin, xMax, toSvgX, toSvgY),
      h1Pts: buildCurve(h1Center, sigma, xMin, xMax, toSvgX, toSvgY),
    };
  }, [h1Center, xMin, xMax]);

  // Shaded region paths
  const { alphaPath, betaPath, powerPath } = useMemo(() => {
    // Alpha: H0 right tail beyond critVal
    const alphaPts = h0Pts.filter(([x]) => x >= toSvgX(critVal));
    const alphaFill = alphaPts.length >= 2
      ? svgPath(alphaPts)
        + ` L${toSvgX(xMax)},${baseY} L${toSvgX(critVal)},${baseY} Z`
      : '';

    // Beta: H1 left tail before critVal (Type II error region)
    const betaPts = h1Pts.filter(([x]) => x <= toSvgX(critVal));
    const betaFill = betaPts.length >= 2
      ? svgPath(betaPts)
        + ` L${toSvgX(critVal)},${baseY} L${toSvgX(xMin)},${baseY} Z`
      : '';

    // Power: H1 right tail beyond critVal
    const powerPts = h1Pts.filter(([x]) => x >= toSvgX(critVal));
    const powerFill = powerPts.length >= 2
      ? svgPath(powerPts)
        + ` L${toSvgX(xMax)},${baseY} L${toSvgX(critVal)},${baseY} Z`
      : '';

    return { alphaPath: alphaFill, betaPath: betaFill, powerPath: powerFill };
  }, [h0Pts, h1Pts, critVal, xMin, xMax, baseY]);

  const h0Path    = svgPath(h0Pts);
  const h1Path    = svgPath(h1Pts);
  const critSvgX  = toSvgX(critVal);
  const h1SvgX    = toSvgX(h1Center);
  const h0SvgX    = toSvgX(0);

  // ── Slider label helper ────────────────────────────────────────────────────
  const sliderStyle = { width: '100%', accentColor: 'var(--yellow)', cursor: 'pointer' };

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your PM wants to run an experiment on the checkout flow. She asks: how long should it run? The answer depends on four things locked together — your baseline rate, the minimum effect you care about, how much false-positive risk you\'ll tolerate, and how much power you want. Change any three and the fourth is determined.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          Most experiment failures happen before the experiment starts — teams don\'t size correctly, chase effects too small to detect, or stop early when they see a promising p-value. This calculator builds the intuition you need to push back on unrealistic experiment plans.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Size an Experiment</div>

      {/* Intro paragraph */}
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        Before running any A/B test you must answer: <em>can I actually detect the effect I care about?</em>{' '}
        Four parameters are locked together — adjust any three and the fourth is determined.
        Use this calculator to build the intuition.
      </p>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Set your baseline conversion rate, the minimum lift you care about (MDE), significance level, and desired power. Watch the required sample size update instantly. Then try halving the MDE and observe roughly how much more data you need — this builds intuition for the cost of chasing smaller effects.
      </div>

      {/* ── Control panel ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
        gap: '1rem',
      }}>

        {/* Slider 1: Baseline conversion rate */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'baseline' }}>
            <label style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>
              Baseline rate (p)
            </label>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--yellow)', fontVariantNumeric: 'tabular-nums' }}>
              {baseline}%
            </span>
          </div>
          <input
            type="range" min={1} max={30} step={0.5}
            value={baseline}
            onChange={e => setBaseline(parseFloat(e.target.value))}
            style={sliderStyle}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>1%</span><span>15%</span><span>30%</span>
          </div>
        </div>

        {/* Slider 2: Minimum Detectable Effect (relative) */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'baseline' }}>
            <label style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>
              MDE (relative)
            </label>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--yellow)', fontVariantNumeric: 'tabular-nums' }}>
              {relMDE}%
            </span>
          </div>
          <input
            type="range" min={5} max={50} step={1}
            value={relMDE}
            onChange={e => setRelMDE(parseInt(e.target.value))}
            style={sliderStyle}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>5%</span><span>27%</span><span>50%</span>
          </div>
          <div style={{ marginTop: '0.45rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Absolute: {(p * relMDE / 100 * 100).toFixed(2)} pp &nbsp;|&nbsp;
            Variant rate: {(p * (1 + relMDE / 100) * 100).toFixed(2)}%
          </div>
        </div>

        {/* Control 3: Significance level α */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '1rem',
        }}>
          <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.55rem' }}>
            Significance level (α)
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[0.01, 0.05, 0.10].map(a => (
              <ToggleBtn
                key={a}
                value={a}
                active={alpha === a}
                label={`α=${a}`}
                color="var(--yellow-border)"
                onClick={setAlpha}
              />
            ))}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            z_α = {zAlphaMap[alpha]}
          </div>
        </div>

        {/* Control 4: Power (1-β) */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '1rem',
        }}>
          <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.55rem' }}>
            Power (1−β)
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[0.70, 0.80, 0.90].map(pw => (
              <ToggleBtn
                key={pw}
                value={pw}
                active={power === pw}
                label={`${(pw * 100).toFixed(0)}%`}
                color="var(--yellow-border)"
                onClick={setPower}
              />
            ))}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            z_β = {zBetaMap[power]}
          </div>
        </div>
      </div>

      {/* ── Result panel ───────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--yellow-bg)',
        border: '2px solid var(--yellow-border)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
            Required sample size per variant
          </div>
          <div style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--yellow-text)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {n.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--yellow-text)', marginTop: '0.3rem', opacity: 0.8 }}>
            Total experiment size: {(n * 2).toLocaleString()} users
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--yellow-text)', lineHeight: 1.65, maxWidth: 340 }}>
          Detect a <strong>{relMDE}% relative lift</strong> on a {baseline}% baseline
          (from {(p * 100).toFixed(1)}% to {(p * (1 + relMDE / 100) * 100).toFixed(2)}%)
          at α={alpha} with {(power * 100).toFixed(0)}% power.
        </div>
      </div>

      {/* ── SVG Visualization ──────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.25rem',
      }}>
        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>── H₀ (null)</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--yellow)' }}>── H₁ (alternative)</span>
          <span style={{ fontSize: '0.78rem', color: '#e05252', fontWeight: 600 }}>▪ α (Type I)</span>
          <span style={{ fontSize: '0.78rem', color: '#888', fontWeight: 600 }}>▪ β (Type II)</span>
          <span style={{ fontSize: '0.78rem', color: '#4caf7d', fontWeight: 600 }}>▪ Power</span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ overflow: 'visible', display: 'block' }}
        >
          {/* Shaded: beta region (grey, between critVal and H1 center left tail) */}
          {betaPath && (
            <path d={betaPath} fill="#888888" opacity={0.20} />
          )}

          {/* Shaded: alpha region (red, H0 right tail) */}
          {alphaPath && (
            <path d={alphaPath} fill="#e05252" opacity={0.30} />
          )}

          {/* Shaded: power region (green, H1 right tail beyond crit) */}
          {powerPath && (
            <path d={powerPath} fill="#4caf7d" opacity={0.30} />
          )}

          {/* H0 curve — grey */}
          <path d={h0Path} fill="none" stroke="#aaaaaa" strokeWidth={2.5} />

          {/* H1 curve — yellow */}
          <path d={h1Path} fill="none" stroke="var(--yellow)" strokeWidth={2.5} />

          {/* Critical value dashed line */}
          <line
            x1={critSvgX} y1={PAD_T}
            x2={critSvgX} y2={baseY}
            stroke="#e05252" strokeWidth={1.8} strokeDasharray="6,4"
          />

          {/* Axis baseline */}
          <line x1={PAD_L} y1={baseY} x2={W - PAD_R} y2={baseY} stroke="var(--border)" strokeWidth={1.5} />

          {/* H0 center tick + label */}
          <line x1={h0SvgX} y1={baseY} x2={h0SvgX} y2={baseY + 6} stroke="#aaaaaa" strokeWidth={1.5} />
          <text x={h0SvgX} y={baseY + 18} textAnchor="middle" fontSize={10} fill="#aaaaaa" fontWeight={600}>
            H₀ (null)
          </text>

          {/* H1 center tick + label */}
          <line x1={h1SvgX} y1={baseY} x2={h1SvgX} y2={baseY + 6} stroke="var(--yellow)" strokeWidth={1.5} />
          <text x={h1SvgX} y={baseY + 18} textAnchor="middle" fontSize={10} fill="var(--yellow)" fontWeight={600}>
            H₁ (alternative)
          </text>

          {/* α label in red zone */}
          <text
            x={critSvgX + (toSvgX(xMax) - critSvgX) * 0.38}
            y={PAD_T + PLOT_H * 0.55}
            textAnchor="middle" fontSize={11} fill="#e05252" fontWeight={800}
          >
            α
          </text>

          {/* β label in beta region */}
          {h1Center > critVal && (
            <text
              x={(critSvgX + toSvgX(xMin)) / 2 + (critSvgX - toSvgX(xMin)) * 0.3}
              y={PAD_T + PLOT_H * 0.72}
              textAnchor="middle" fontSize={11} fill="#666666" fontWeight={700}
            >
              β
            </text>
          )}

          {/* Power label in green zone */}
          {h1Center > 0 && (
            <text
              x={critSvgX + (h1SvgX - critSvgX) * 0.55 + 18}
              y={PAD_T + PLOT_H * 0.45}
              textAnchor="middle" fontSize={11} fill="#4caf7d" fontWeight={800}
            >
              Power
            </text>
          )}
        </svg>
      </div>

      {/* ── Trade-off note ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.65,
      }}>
        <strong style={{ color: 'var(--text)' }}>Sample size trade-off:</strong>{' '}
        Halving the MDE from <strong>{relMDE}%</strong> to <strong>{(relMDE / 2).toFixed(0)}%</strong> requires{' '}
        <strong style={{ color: 'var(--yellow)' }}>{nHalf.toLocaleString()}</strong> users per variant
        — roughly <strong style={{ color: 'var(--yellow)' }}>
          {nHalf > 0 && n > 0 ? `${(nHalf / n).toFixed(1)}×` : '~4×'}
        </strong> more than the current {n.toLocaleString()}.
        Halving the MDE requires ~4× the sample size.
      </div>

      {/* ── Key insight callout ─────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--yellow-bg)',
        border: '1.5px solid var(--yellow-border)',
        borderRadius: '10px',
        padding: '1rem 1.25rem',
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
          Key Insight
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.65 }}>
          The 4 parameters are linked. Fix 3 and the 4th is determined. Most teams target 80% power at α=0.05.
          {module?.keyInsight && (
            <span> {module.keyInsight}</span>
          )}
        </div>
      </div>

      {/* Connects to Experiments */}
      {module?.connection && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
            Connects to Experiments
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            {module.connection}
          </div>
        </div>
      )}

      {/* Next button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="pal-glow-pulse"
          onClick={onNext}
          style={{
            padding: '0.7rem 1.75rem',
            borderRadius: '7px',
            border: 'none',
            background: 'var(--yellow)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          Next concept →
        </button>
      </div>
    </div>
  );
}
