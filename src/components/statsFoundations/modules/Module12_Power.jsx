import { useState, useMemo } from 'react';

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

// z-value for given one-tailed probability
function zForPower(p) {
  // Approximation for normalCDF inverse (Beasley-Springer-Moro)
  if (p <= 0) return -8;
  if (p >= 1) return 8;
  const a = [0,-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00];
  const b = [0,-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01];
  const c = [0,-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00];
  const d = [0,7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00];
  const plo = 0.02425, phi = 1 - plo;
  let x;
  if (p < plo) {
    const q = Math.sqrt(-2 * Math.log(p));
    x = (((((c[1]*q+c[2])*q+c[3])*q+c[4])*q+c[5])*q+c[6]) / ((((d[1]*q+d[2])*q+d[3])*q+d[4])*q+1);
  } else if (p <= phi) {
    const q = p - 0.5, r = q*q;
    x = (((((a[1]*r+a[2])*r+a[3])*r+a[4])*r+a[5])*r+a[6])*q / (((((b[1]*r+b[2])*r+b[3])*r+b[4])*r+b[5])*r+1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x = -(((((c[1]*q+c[2])*q+c[3])*q+c[4])*q+c[5])*q+c[6]) / ((((d[1]*q+d[2])*q+d[3])*q+d[4])*q+1);
  }
  return x;
}

const ALPHA_OPTIONS = [0.01, 0.05, 0.10];
const ALPHA_Z = { 0.01: 2.576, 0.05: 1.96, 0.10: 1.645 };
const ALPHA_LABELS = { 0.01: 'α = 0.01', 0.05: 'α = 0.05', 0.10: 'α = 0.10' };

const W = 600;
const H = 240;
const X_RANGE_HALF = 5.5; // how many SEs to show each side of H0 center
const N_PTS = 400;

function buildDistPts(mu, sigma, xMin, xMax) {
  return Array.from({ length: N_PTS }, (_, i) => {
    const x = xMin + (i / (N_PTS - 1)) * (xMax - xMin);
    return { x, pdf: normalPDF(x, mu, sigma) };
  });
}

// Power color based on value
function powerColor(p) {
  if (p >= 0.8) return 'var(--green)';
  if (p >= 0.6) return 'var(--yellow)';
  return 'var(--red)';
}
function powerLabel(p) {
  if (p >= 0.8) return 'Good power';
  if (p >= 0.6) return 'Marginal';
  if (p >= 0.4) return 'Underpowered';
  return 'Very low';
}

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module12_Power({ module, onNext }) {
  const [effectSize, setEffectSize] = useState(0.5);
  const [n, setN] = useState(500);
  const [alpha, setAlpha] = useState(0.05);
  const [explored, setExplored] = useState(false);

  // SE of the difference between two means (two-sample), in SD units.
  // SE = sqrt(σ²/n + σ²/n) = sqrt(2/n) with σ=1 per group. This matches the
  // two-sample formulas used for requiredN and mde below, so power, MDE, and
  // required-n all share one model.
  const se = Math.sqrt(2 / n);
  const zAlpha = ALPHA_Z[alpha];

  // Critical value on the x-axis (effect size scale)
  const critVal = zAlpha * se;

  // Power = P(X > critVal | X ~ N(effectSize, se^2))
  const power = 1 - normalCDF(critVal, effectSize, se);
  const beta = 1 - power; // type II error

  // Required n for 80% power
  const zBeta80 = zForPower(0.8);
  const requiredN = Math.ceil(2 * Math.pow((zAlpha + zBeta80) / effectSize, 2));

  // MDE: at current n, what's the minimum detectable effect (80% power)?
  // se already = sqrt(2/n), the two-sample SE of the difference, so MDE = (zAlpha + zBeta80) * se.
  // This is the exact inverse of requiredN: at n = requiredN, mde === effectSize.
  const mde = (zAlpha + zBeta80) * se;

  // SVG scale
  const xMin = -X_RANGE_HALF * se;
  const xMax = effectSize + X_RANGE_HALF * se;
  const xTotal = xMax - xMin;
  const toSvgX = (v) => ((v - xMin) / xTotal) * W;

  // Peak PDF for normalization (max of either distribution)
  const maxPDF = Math.max(normalPDF(0, 0, se), normalPDF(effectSize, effectSize, se));
  const toSvgY = (pdf) => H - (pdf / maxPDF) * (H * 0.85) - 10;

  // Build paths
  const { h0Pts, h1Pts, h0Path, h1Path } = useMemo(() => {
    const xMinL = -X_RANGE_HALF * se;
    const xMaxR = effectSize + X_RANGE_HALF * se;
    const h0Pts = buildDistPts(0, se, xMinL, xMaxR);
    const h1Pts = buildDistPts(effectSize, se, xMinL, xMaxR);
    const h0Path = 'M ' + h0Pts.map(p => `${toSvgX(p.x).toFixed(2)},${toSvgY(p.pdf).toFixed(2)}`).join(' L ');
    const h1Path = 'M ' + h1Pts.map(p => `${toSvgX(p.x).toFixed(2)},${toSvgY(p.pdf).toFixed(2)}`).join(' L ');
    return { h0Pts, h1Pts, h0Path, h1Path };
  }, [effectSize, n, se]);

  // Shaded regions
  const { alphaPath, betaPath, powerPath } = useMemo(() => {
    const xMinL = -X_RANGE_HALF * se;
    const xMaxR = effectSize + X_RANGE_HALF * se;

    // Alpha: area under H0 beyond critVal
    const alphaPts = h0Pts.filter(p => p.x >= critVal);
    const alphaPath = alphaPts.length >= 2
      ? 'M ' + alphaPts.map(p => `${toSvgX(p.x).toFixed(2)},${toSvgY(p.pdf).toFixed(2)}`).join(' L ')
        + ` L ${toSvgX(xMaxR).toFixed(2)},${H} L ${toSvgX(critVal).toFixed(2)},${H} Z`
      : '';

    // Beta: area under H1 BEFORE critVal (fail to detect)
    const betaPts = h1Pts.filter(p => p.x <= critVal);
    const betaPath = betaPts.length >= 2
      ? 'M ' + betaPts.map(p => `${toSvgX(p.x).toFixed(2)},${toSvgY(p.pdf).toFixed(2)}`).join(' L ')
        + ` L ${toSvgX(critVal).toFixed(2)},${H} L ${toSvgX(xMinL).toFixed(2)},${H} Z`
      : '';

    // Power: area under H1 BEYOND critVal (correctly detect)
    const powerPts = h1Pts.filter(p => p.x >= critVal);
    const powerPath = powerPts.length >= 2
      ? 'M ' + powerPts.map(p => `${toSvgX(p.x).toFixed(2)},${toSvgY(p.pdf).toFixed(2)}`).join(' L ')
        + ` L ${toSvgX(xMaxR).toFixed(2)},${H} L ${toSvgX(critVal).toFixed(2)},${H} Z`
      : '';

    return { alphaPath, betaPath, powerPath };
  }, [h0Pts, h1Pts, critVal, effectSize, se]);

  const pct = (v) => `${(v * 100).toFixed(1)}%`;
  const pColor = powerColor(power);

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          Hypothesis testing has two ways to go wrong, and you've only been guarding against one of them.
        </p>
        <p style={prose}>
          The first error: you reject H₀ when it's actually true — a false positive, Type I error. You control it with α. Set α = 0.05 and you accept a 5% chance of this.
        </p>
        <p style={prose}>
          The second error: you fail to reject H₀ when it's actually false. A real effect exists — your treatment genuinely works — but your experiment doesn't detect it. You conclude "no significant result" and the feature gets killed. This is a false negative, a Type II error, and most people have never thought carefully about what controls it.
        </p>
        <p style={prose}>
          The probability of correctly detecting a true effect is called <strong style={{ color: 'var(--text)' }}>statistical power</strong>: Power = 1 − P(Type II error). A study with 80% power means: if the treatment truly has the effect you're testing for, you'll detect it 80% of the time. You'll miss it 20% of the time — not because your analysis is wrong, but because chance gave you a sample that didn't show the effect strongly enough.
        </p>
        <p style={prose}>
          Power is jointly determined by three things. <strong style={{ color: 'var(--text)' }}>Effect size</strong>: how large is the true difference? A 10pp lift is easier to detect than a 0.1pp lift. <strong style={{ color: 'var(--text)' }}>Sample size</strong>: larger samples reduce SE, making it easier to distinguish signal from noise. <strong style={{ color: 'var(--text)' }}>Alpha</strong>: stricter false positive control requires a higher bar to reject H₀, so you'll more often fail to reject even when the effect is real.
        </p>
        <p style={prose}>
          Before running an experiment, you specify the <strong style={{ color: 'var(--text)' }}>Minimum Detectable Effect (MDE)</strong> — the smallest effect size you'd actually act on — plus target power (typically 80%) and α (0.05). From these three, you compute required n. Running an underpowered study is a specific kind of waste: you spend the time and traffic, then can't interpret the result.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          If you run an experiment at 20% power (common when people don't calculate sample sizes), and your result is not significant, what can you actually conclude? Think through what "not significant" means when power is low.
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Tune the Power Dial</div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Adjust the effect size, sample size, and alpha threshold. Watch the green power region grow or shrink as you move each slider. Try setting effect size to 0.1 sigma to see how underpowered tiny-effect experiments are, then increase n until you hit 80% power. Read the required sample size formula at the bottom.
      </div>

      {/* Sliders & alpha controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Effect size */}
        <div style={{ flex: 1, minWidth: 200, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Effect size (δ, in SD units)</label>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--teal)', fontVariantNumeric: 'tabular-nums' }}>{effectSize.toFixed(2)}σ</span>
          </div>
          <input
            type="range" min={0.1} max={2.0} step={0.05}
            value={effectSize}
            onChange={e => { setEffectSize(parseFloat(e.target.value)); setExplored(true); }}
            style={{ width: '100%', accentColor: 'var(--teal)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>0.1σ (tiny)</span><span>1.0σ (large)</span><span>2.0σ (huge)</span>
          </div>
        </div>

        {/* Sample size */}
        <div style={{ flex: 1, minWidth: 200, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Sample size n (per variant)</label>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{n.toLocaleString()}</span>
          </div>
          <input
            type="range" min={50} max={5000} step={50}
            value={n}
            onChange={e => { setN(parseInt(e.target.value)); setExplored(true); }}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>50</span><span>1,000</span><span>5,000</span>
          </div>
        </div>

        {/* Alpha */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>Significance threshold α</div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {ALPHA_OPTIONS.map(a => (
              <button key={a} onClick={() => { setAlpha(a); setExplored(true); }} style={{
                padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${alpha === a ? 'var(--red)' : 'var(--border)'}`,
                background: alpha === a ? 'var(--red-bg)' : 'var(--surface)',
                color: alpha === a ? 'var(--red)' : 'var(--text-muted)',
                fontSize: '0.85rem', fontWeight: alpha === a ? 700 : 500, cursor: 'pointer',
              }}>{ALPHA_LABELS[a]}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Main two-distribution SVG */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>── H₀ (null, effect = 0)</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--teal)' }}>── H₁ (alternative, effect = {effectSize.toFixed(2)}σ)</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--red)', fontWeight: 600 }}>▪ α region (Type I)</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--yellow)', fontWeight: 600 }}>▪ β region (Type II / miss)</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>▪ Power (detect!)</span>
        </div>

        <svg viewBox={`0 0 ${W} ${H + 40}`} style={{ width: '100%', overflow: 'visible' }}>
          {/* === SHADED REGIONS === */}
          {/* Power region (green — H1 beyond crit) */}
          {powerPath && <path d={powerPath} fill="var(--green)" opacity={0.25} />}
          {/* Beta region (orange/yellow — H1 before crit, miss) */}
          {betaPath && <path d={betaPath} fill="var(--yellow)" opacity={0.22} />}
          {/* Alpha region (red — H0 beyond crit, false positive) */}
          {alphaPath && <path d={alphaPath} fill="var(--red)" opacity={0.28} />}

          {/* === CURVES === */}
          {/* H0 curve */}
          <path d={h0Path} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
          {/* H1 curve */}
          <path d={h1Path} fill="none" stroke="var(--teal)" strokeWidth={2.5} />

          {/* === CRITICAL VALUE LINE === */}
          <line
            x1={toSvgX(critVal)} y1={0}
            x2={toSvgX(critVal)} y2={H}
            stroke="var(--red)" strokeWidth={2} strokeDasharray="6,4"
          />
          <text
            x={toSvgX(critVal) + 4} y={14}
            fontSize={10} fill="var(--red)" fontWeight={700}
          >
            z_α = {zAlpha.toFixed(3)}
          </text>
          <text
            x={toSvgX(critVal) + 4} y={26}
            fontSize={9} fill="var(--text-muted)"
          >
            crit = {critVal.toFixed(4)}σ
          </text>

          {/* === LABELS INSIDE REGIONS === */}
          {/* Alpha label */}
          {alpha >= 0.05 && (
            <text
              x={toSvgX(critVal + se * 1.2)} y={toSvgY(normalPDF(critVal + se * 0.5, 0, se)) + 20}
              fontSize={10} fill="var(--red)" fontWeight={700} textAnchor="middle"
            >
              α={pct(alpha)}
            </text>
          )}

          {/* Beta label (inside H1 left of crit) */}
          {beta > 0.05 && effectSize > 0.15 && (
            <text
              x={toSvgX(Math.max(xMin + se * 2, critVal - se * 1.5))}
              y={toSvgY(normalPDF(effectSize - se * 0.8, effectSize, se)) + 22}
              fontSize={10} fill="var(--yellow-text)" fontWeight={700} textAnchor="middle"
            >
              β={pct(beta)}
            </text>
          )}

          {/* Power label (inside H1 right of crit) */}
          {power > 0.08 && (
            <text
              x={toSvgX(Math.min(xMax - se * 2, critVal + se * 1.5))}
              y={toSvgY(normalPDF(effectSize + se * 0.5, effectSize, se)) + 22}
              fontSize={11} fill="var(--green)" fontWeight={800} textAnchor="middle"
            >
              Power {pct(power)}
            </text>
          )}

          {/* H0 center label */}
          <text x={toSvgX(0)} y={H + 16} textAnchor="middle" fontSize={9.5} fill="var(--accent)" fontWeight={600}>H₀ (μ=0)</text>
          <line x1={toSvgX(0)} y1={H - 2} x2={toSvgX(0)} y2={H + 5} stroke="var(--accent)" strokeWidth={1.5} />

          {/* H1 center label */}
          <text x={toSvgX(effectSize)} y={H + 16} textAnchor="middle" fontSize={9.5} fill="var(--teal)" fontWeight={600}>H₁ (μ={effectSize.toFixed(2)}σ)</text>
          <line x1={toSvgX(effectSize)} y1={H - 2} x2={toSvgX(effectSize)} y2={H + 5} stroke="var(--teal)" strokeWidth={1.5} />

          {/* Axis */}
          <line x1={0} y1={H} x2={W} y2={H} stroke="var(--border)" strokeWidth={1.5} />

          {/* Axis label */}
          <text x={W / 2} y={H + 32} textAnchor="middle" fontSize={9} fill="var(--text-muted)">
            Effect size (SD units) — SE = 1/√{n} = {se.toFixed(4)}
          </text>
        </svg>
      </div>

      {/* Power readout banner */}
      <div style={{
        background: power >= 0.8 ? 'var(--green-bg)' : power >= 0.6 ? 'var(--yellow-bg)' : 'var(--red-bg)',
        border: `2px solid ${power >= 0.8 ? 'var(--green-border)' : power >= 0.6 ? 'var(--yellow-border)' : 'var(--red-border)'}`,
        borderRadius: 'var(--radius)', padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: pColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
            Statistical Power — {powerLabel(power)}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: pColor, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {pct(power)}
          </div>
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 380 }}>
          You have a <strong style={{ color: pColor }}>{pct(power)}</strong> chance of detecting an effect of{' '}
          <strong>{effectSize.toFixed(2)}σ</strong> with n={n.toLocaleString()} per variant at α={alpha}.
          {power < 0.8 && (
            <span style={{ display: 'block', marginTop: '0.2rem', color: 'var(--text-muted)' }}>
              You need <strong style={{ color: pColor }}>n ≥ {requiredN.toLocaleString()}</strong> per variant for 80% power at this effect size.
            </span>
          )}
        </div>
      </div>

      {/* Four metric cards */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 120, background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius)', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--red)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>α (Type I error)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{pct(alpha)}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>False positive rate</div>
        </div>
        <div style={{ flex: 1, minWidth: 120, background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--yellow-text)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>β (Type II error)</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--yellow-text)', fontVariantNumeric: 'tabular-nums' }}>{pct(beta)}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Miss rate (1−Power)</div>
        </div>
        <div style={{ flex: 1.5, minWidth: 150, background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Power (1−β)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: pColor, fontVariantNumeric: 'tabular-nums' }}>{pct(power)}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Probability of detecting real effect</div>
        </div>
        <div style={{ flex: 1.5, minWidth: 150, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>MDE at n={n.toLocaleString()}</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--purple)', fontVariantNumeric: 'tabular-nums' }}>{mde.toFixed(3)}σ</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Smallest detectable effect (80% power)</div>
        </div>
      </div>

      {/* Sample size formula card */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Required Sample Size Formula (for 80% power)</div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.92rem', color: 'var(--text)', lineHeight: 2 }}>
          n = (z_α + z_β)² × 2σ² / δ²
          <br />
          <span style={{ color: 'var(--text-muted)' }}>
            = ({zAlpha.toFixed(3)} + {zForPower(0.8).toFixed(3)})² × 2 × 1² / {effectSize.toFixed(2)}²
          </span>
          <br />
          = {Math.pow(zAlpha + zForPower(0.8), 2).toFixed(2)} × 2 / {(effectSize * effectSize).toFixed(4)}
          {' '}= <strong style={{ color: 'var(--accent)', fontSize: '1rem' }}>{requiredN.toLocaleString()} per variant</strong>
        </div>
        {n < requiredN && (
          <div style={{ marginTop: '0.75rem', background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.9rem', fontSize: '0.83rem', color: 'var(--red)', lineHeight: 1.5 }}>
            Your current n={n.toLocaleString()} is {Math.round((requiredN - n) / requiredN * 100)}% short of the required {requiredN.toLocaleString()}.
            Power is only {pct(power)} — you're likely to miss this effect.
          </div>
        )}
        {n >= requiredN && (
          <div style={{ marginTop: '0.75rem', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.9rem', fontSize: '0.83rem', color: 'var(--green)', lineHeight: 1.5 }}>
            n={n.toLocaleString()} meets or exceeds the required {requiredN.toLocaleString()} — you have adequate power ({pct(power)}).
          </div>
        )}
      </div>

      {/* Tradeoff explorer */}
      <div style={{ background: 'var(--purple-bg)', border: '1.5px solid var(--purple-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Power Triangle: Effect, Sample Size, Alpha</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <strong>Smaller effect size</strong> → H₀ and H₁ overlap more → curves almost merge → power drops.<br />
          <strong>Larger n</strong> → SE shrinks → both curves get narrower → overlap decreases → power rises.<br />
          <strong>Smaller α</strong> → critical line moves right → less of H₁ is beyond it → power drops.<br />
          <em>You can only have two of: small α, high power, small MDE. The third requires more data.</em>
        </div>
      </div>

      {/* ── What you should have confirmed ── */}
      {explored && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            At 20% power, a non-significant result tells you almost nothing. You had an 80% chance of missing a real effect, so "not significant" is the expected outcome even when the treatment works. An underpowered non-significant result doesn't say "no effect" — it says "we looked with the wrong instrument." The visualization shows the two distributions: power is the area of the alternative distribution to the right of the critical cutoff.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {explored && (
        <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Never run an experiment without calculating required sample size first. Use a power calculator with your real baseline metric, a realistic MDE, and 80% power. If the required n exceeds what you can collect in a reasonable time, the experiment is not feasible — that's an important finding too.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> When interpreting non-significant results, always report the minimum detectable effect of your study. "Not significant (MDE for this study was 1.2pp at 80% power)" is honest — it tells the reader that effects smaller than 1.2pp are not ruled out. "Not significant" alone implies no effect exists, which you cannot conclude from an underpowered study.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Effect size and statistical significance are independent. A tiny effect can be statistically significant with a massive sample. A large effect can be non-significant with a tiny sample. Always pair p-values with effect magnitude in business-relevant units — power and effect size together determine whether an experiment's conclusion is worth trusting.</p>
          </div>
        </div>
      )}

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Before shipping an A/B test, ask: "What\'s the smallest lift that would be worth acting on?" That\'s your MDE. Plug it into the formula with α=0.05 and target power=80% to get the minimum sample size per variant. Running underpowered tests is the #1 cause of "no signal" results that waste engineering and product cycles.'}
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
