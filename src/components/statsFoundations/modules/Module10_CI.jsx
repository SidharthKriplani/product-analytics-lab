import { useState, useMemo } from 'react';

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
function normalInverse(p) {
  // Beasley-Springer-Moro approximation
  const a = [0, -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [0, -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [0, -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [0, 7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
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

const TRUE_MU = 50;
const POP_SIGMA = 10;

const CONF_LEVELS = [
  { label: '80%', pct: 0.80, z: 1.28 },
  { label: '90%', pct: 0.90, z: 1.645 },
  { label: '95%', pct: 0.95, z: 1.96 },
  { label: '99%', pct: 0.99, z: 2.576 },
];

// Draw from N(mu, sigma) using Box-Muller
function drawNormal(rng, mu, sigma) {
  const u1 = rng(), u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mu + z * sigma;
}

const SVG_W = 560;
const SVG_H = 420;
const CI_ROW_H = 18;
const CI_GAP = 2;
const CI_AREA_TOP = 30;

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module10_CI({ module, onNext }) {
  const [confIdx, setConfIdx] = useState(2); // 95%
  const [n, setN] = useState(100);
  const [intervals, setIntervals] = useState([]);
  const [simCount, setSimCount] = useState(0);

  const conf = CONF_LEVELS[confIdx];
  const se = POP_SIGMA / Math.sqrt(n);
  const moe = conf.z * se;
  const ciLo = TRUE_MU - moe;
  const ciHi = TRUE_MU + moe;

  const simulate20 = () => {
    const seed = Date.now() % 100000;
    const rng = seededRandom(seed);
    const newIntervals = Array.from({ length: 20 }, () => {
      const xbar = drawNormal(rng, TRUE_MU, POP_SIGMA / Math.sqrt(n));
      const lo = xbar - moe;
      const hi = xbar + moe;
      const contains = lo <= TRUE_MU && TRUE_MU <= hi;
      return { xbar, lo, hi, contains };
    });
    setIntervals(newIntervals);
    setSimCount(prev => prev + 1);
  };

  const containsCount = intervals.filter(i => i.contains).length;

  // SVG scale: map CI values to SVG x coords
  const displayMin = 30, displayMax = 70;
  const toSvgX = (v) => 40 + ((v - displayMin) / (displayMax - displayMin)) * (SVG_W - 80);

  const svgHeight = intervals.length > 0
    ? CI_AREA_TOP + intervals.length * (CI_ROW_H + CI_GAP) + 50
    : 120;

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          You've computed a sample mean and a standard error. The mean is your point estimate — say, 4.8 minutes. But a point estimate is a single number presented with false precision. The true population mean could be 4.8, or 4.2, or 5.3. Your sample doesn't pin it down exactly. It restricts a range of plausible values.
        </p>
        <p style={prose}>
          What you need is a way to express not just your best guess, but how wide a range of guesses the data supports. You need a confidence interval.
        </p>
        <p style={prose}>
          We know from the CLT that the sample mean follows a normal distribution centered on the true population mean, with spread equal to SE. From the empirical rule: ±1.96 SE around the sample mean captures about 95% of where the true mean plausibly lives. This is the 95% confidence interval: <strong style={{ color: 'var(--text)' }}>CI = x̄ ± 1.96 × SE</strong>.
        </p>
        <p style={prose}>
          Now the interpretation — this is where most people go wrong. "95% confidence" does not mean "there is a 95% probability the true mean is in this interval." The true mean is a fixed, unknown number. It either is or isn't in your interval.
        </p>
        <p style={prose}>
          What 95% confidence means: if you repeated this process — sample users, compute the CI using this exact procedure — 95% of the intervals you'd produce would contain the true mean. The 5% that don't are the unlucky samples where the sample mean happened to land far from the truth. Your specific interval is either one of the 95% or one of the 5%. You can't know which. But you built it with a procedure that's right 95% of the time.
        </p>
        <p style={prose}>
          One more critical use: CI and hypothesis testing are duals. If your 95% CI is [4.51, 5.09] and you test H₀: mean = 5.5, then 5.5 is outside the CI — you'd reject H₀. If the null value falls inside your CI, you'd fail to reject it. The CI tells you the entire set of null values you'd fail to reject simultaneously.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          If you want a narrower confidence interval without lowering your confidence level, you have two options. What are they, and which is in your control as an analyst?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Simulate Confidence Intervals</div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Select a confidence level and set a sample size, then click "Simulate 20 samples" to generate 20 confidence intervals. Count how many green bars capture the true mean versus how many red bars miss it. The hit rate should match the confidence level you chose over repeated simulations.
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {/* Confidence level selector */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>Confidence level</div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {CONF_LEVELS.map((c, i) => (
              <button key={c.label} onClick={() => setConfIdx(i)} style={{
                padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${confIdx === i ? 'var(--accent)' : 'var(--border)'}`,
                background: confIdx === i ? 'var(--accent-bg)' : 'var(--surface)',
                color: confIdx === i ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '0.85rem', fontWeight: confIdx === i ? 700 : 500, cursor: 'pointer',
              }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Sample size slider */}
        <div style={{ flex: 1, minWidth: 200, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Sample size n</label>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{n}</span>
          </div>
          <input
            type="range" min={30} max={1000} step={10}
            value={n}
            onChange={e => setN(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>30</span><span>1,000</span>
          </div>
        </div>
      </div>

      {/* Live CI formula card */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { label: 'z* critical value', value: conf.z.toFixed(3), color: 'var(--purple)' },
          { label: 'SE = σ/√n', value: se.toFixed(3), color: 'var(--teal)' },
          { label: 'Margin of error', value: `±${moe.toFixed(2)}`, color: 'var(--accent)' },
          { label: `${conf.label} CI`, value: `[${ciLo.toFixed(1)}, ${ciHi.toFixed(1)}]`, color: 'var(--green)' },
        ].map(card => (
          <div key={card.label} style={{
            flex: 1, minWidth: 120,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '0.85rem 1rem',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: card.color, fontVariantNumeric: 'tabular-nums' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Single CI bar visualization */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Your confidence interval (centered at μ=50)
        </div>
        <svg viewBox={`0 0 ${SVG_W} 70`} style={{ width: '100%' }}>
          {/* axis */}
          <line x1={40} y1={55} x2={SVG_W - 40} y2={55} stroke="var(--border)" strokeWidth={1.5} />
          {[35, 40, 45, 50, 55, 60, 65].map(v => (
            <g key={v}>
              <line x1={toSvgX(v)} y1={52} x2={toSvgX(v)} y2={58} stroke="var(--border)" strokeWidth={1} />
              <text x={toSvgX(v)} y={68} textAnchor="middle" fontSize={9} fill="var(--text-muted)">{v}</text>
            </g>
          ))}
          {/* CI bar */}
          <rect
            x={toSvgX(ciLo)} y={30}
            width={toSvgX(ciHi) - toSvgX(ciLo)} height={18}
            fill="var(--accent)" opacity={0.2} rx={3}
          />
          <line x1={toSvgX(ciLo)} y1={27} x2={toSvgX(ciLo)} y2={52} stroke="var(--accent)" strokeWidth={2.5} />
          <line x1={toSvgX(ciHi)} y1={27} x2={toSvgX(ciHi)} y2={52} stroke="var(--accent)" strokeWidth={2.5} />
          <line x1={toSvgX(ciLo)} y1={39} x2={toSvgX(ciHi)} y2={39} stroke="var(--accent)" strokeWidth={2} />
          {/* true mean line */}
          <line x1={toSvgX(TRUE_MU)} y1={22} x2={toSvgX(TRUE_MU)} y2={58} stroke="var(--teal)" strokeWidth={2.5} strokeDasharray="5,3" />
          <text x={toSvgX(TRUE_MU)} y={18} textAnchor="middle" fontSize={10} fill="var(--teal)" fontWeight={700}>μ = {TRUE_MU}</text>
          {/* Labels */}
          <text x={toSvgX(ciLo) - 2} y={26} textAnchor="end" fontSize={10} fill="var(--accent)" fontWeight={600}>{ciLo.toFixed(1)}</text>
          <text x={toSvgX(ciHi) + 2} y={26} textAnchor="start" fontSize={10} fill="var(--accent)" fontWeight={600}>{ciHi.toFixed(1)}</text>
        </svg>
      </div>

      {/* Simulate 20 samples button */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={simulate20}
          style={{
            padding: '0.65rem 1.6rem', borderRadius: 'var(--radius-sm)',
            border: 'none', background: 'var(--accent)', color: '#fff',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
          }}
        >
          Simulate 20 samples
        </button>
        {intervals.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.9rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--green)' }}>
              {containsCount}/20 contain μ
            </div>
            <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.9rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--red)' }}>
              {20 - containsCount}/20 miss μ
            </div>
          </div>
        )}
      </div>

      {/* 20 CI bars */}
      {intervals.length > 0 && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', overflowX: 'auto' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            20 simulated {conf.label} CIs — green = contains μ, red = misses μ
          </div>
          <svg viewBox={`0 0 ${SVG_W} ${svgHeight}`} style={{ width: '100%' }}>
            {/* True mean vertical line */}
            <line
              x1={toSvgX(TRUE_MU)} y1={0}
              x2={toSvgX(TRUE_MU)} y2={svgHeight - 20}
              stroke="var(--teal)" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7}
            />
            <text x={toSvgX(TRUE_MU)} y={svgHeight - 5} textAnchor="middle" fontSize={9} fill="var(--teal)">μ = {TRUE_MU}</text>

            {intervals.map((ci, i) => {
              const y = CI_AREA_TOP + i * (CI_ROW_H + CI_GAP);
              const color = ci.contains ? 'var(--green)' : 'var(--red)';
              const bg = ci.contains ? 'var(--green)' : 'var(--red)';
              return (
                <g key={i}>
                  <rect
                    x={toSvgX(ci.lo)} y={y + 2}
                    width={Math.max(2, toSvgX(ci.hi) - toSvgX(ci.lo))} height={CI_ROW_H - 5}
                    fill={bg} opacity={0.18} rx={2}
                  />
                  <line x1={toSvgX(ci.lo)} y1={y + CI_ROW_H / 2} x2={toSvgX(ci.hi)} y2={y + CI_ROW_H / 2} stroke={color} strokeWidth={1.5} />
                  <line x1={toSvgX(ci.lo)} y1={y + 3} x2={toSvgX(ci.lo)} y2={y + CI_ROW_H - 3} stroke={color} strokeWidth={1.5} />
                  <line x1={toSvgX(ci.hi)} y1={y + 3} x2={toSvgX(ci.hi)} y2={y + CI_ROW_H - 3} stroke={color} strokeWidth={1.5} />
                  <circle cx={toSvgX(ci.xbar)} cy={y + CI_ROW_H / 2} r={2.5} fill={color} />
                </g>
              );
            })}

            {/* Axis at bottom */}
            <line x1={40} y1={svgHeight - 22} x2={SVG_W - 40} y2={svgHeight - 22} stroke="var(--border)" strokeWidth={1} />
            {[35, 40, 45, 50, 55, 60, 65].map(v => (
              <text key={v} x={toSvgX(v)} y={svgHeight - 8} textAnchor="middle" fontSize={8.5} fill="var(--text-muted)">{v}</text>
            ))}
          </svg>
        </div>
      )}

      {/* ── What you should have confirmed ── */}
      {intervals.length > 0 && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            To narrow the CI without lowering confidence level, you can either increase n (more data lowers SE, tightening the interval) or find a metric with less inherent variability (lower SD). Sample size is the lever you control. The simulation reveals that even with correct procedure, some intervals miss — those are the unlucky 5%. This makes the frequentist definition concrete: 95% is about the procedure across repetitions, not certainty about any single interval.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Report CIs, not just means. "Conversion rate: 4.2%" is a point estimate. "Conversion rate: 4.2% [95% CI: 3.8%–4.6%]" is an estimate with its uncertainty quantified. The first looks more precise. The second is more honest. Stakeholders who make decisions on point estimates without knowing the uncertainty are flying blind.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Use CI width to communicate study reliability. A CI of [4.51, 5.09] says you've pinned down the mean to within ±0.3 minutes — tight. A CI of [2.0, 7.6] says you have almost no information. When a study result is reported without a CI, ask for it — then judge whether the study was precise enough to support the conclusion being drawn.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Overlapping confidence intervals do not mean "no significant difference." Two 95% CIs can overlap and still produce a statistically significant difference in a two-sample test — because the test directly computes the distribution of the difference, which has its own SE. If you're comparing two estimates, compute the CI of the difference, not the overlap of the two individual CIs.</p>
        </div>
      </div>

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'When your A/B test dashboard shows "lift = +2.3% [+0.8%, +3.8%]", that bracketed range is your 95% CI. If it doesn\'t include 0, your test is statistically significant at α=0.05. Wider CIs mean less precision — run more users or accept a looser conclusion.'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="pal-glow-pulse" onClick={onNext} style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
          Next concept →
        </button>
      </div>
    </div>
  );
}
