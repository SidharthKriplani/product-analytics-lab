import { useState, useMemo } from 'react';

// ── Math helpers ──────────────────────────────────────────────────────────────
function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}
function normalCDF(z) {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}
function approxPValue(liftPct, baseRate = 0.10, n = 100000) {
  const p2 = baseRate + liftPct / 100;
  const pooled = (baseRate + p2) / 2;
  const se = Math.sqrt(2 * pooled * (1 - pooled) / n);
  const z = Math.abs(liftPct / 100) / se;
  return 2 * (1 - normalCDF(z));
}
function cohensH(p1, p2) {
  return 2 * Math.asin(Math.sqrt(p2)) - 2 * Math.asin(Math.sqrt(p1));
}

const SAMPLE_STEPS = [1000, 10000, 50000, 100000, 500000, 1000000, 5000000];
function stepToN(step) { return SAMPLE_STEPS[Math.round(step)]; }
function nToLabel(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

const BASE_RATE = 0.10;
const ARPU_PER_DAY = 0.50;
const TOTAL_USERS = 1_000_000;
const DAYS = 365;

// 2×2 matrix positions (SVG 300×200, padded)
const MAT_W = 300;
const MAT_H = 200;
const MAT_PAD = 30;
const MAT_INNER_W = MAT_W - 2 * MAT_PAD;
const MAT_INNER_H = MAT_H - 2 * MAT_PAD;

function getMatrixPosition(pValue, cohH) {
  // X: statistical significance — 0 = not significant (p high), 1 = significant (p low)
  // map p=1 → x=0, p=0.001 → x=1 (log scale)
  const logPMin = Math.log10(0.001);
  const logPMax = Math.log10(1.0);
  const logP = Math.log10(Math.max(0.001, Math.min(1, pValue)));
  const xNorm = (logP - logPMax) / (logPMin - logPMax); // 0 = not sig, 1 = significant
  // Y: practical significance — 0 = small, 1 = large
  const yNorm = Math.min(1, Math.abs(cohH) / 0.5); // 0 → small, 0.5+ → large

  const x = MAT_PAD + xNorm * MAT_INNER_W;
  const y = MAT_PAD + (1 - yNorm) * MAT_INNER_H; // invert Y so large is up
  return { x, y };
}

// Y axis: large effect is UP (y=0.25), small effect is DOWN (y=0.75).
// X axis: significant is RIGHT (x=0.75), not significant is LEFT (x=0.25).
//   top-right    = significant + large  → Ship it (green)
//   bottom-right = significant + small  → False alarm (red): real-but-trivial effect
//   top-left     = not sig  + large     → Game changer (purple): promising, needs more data
//   bottom-left  = not sig  + small     → Keep running (yellow)
const QUADRANTS = [
  { label: 'Ship it', x: MAT_PAD + MAT_INNER_W * 0.75, y: MAT_PAD + MAT_INNER_H * 0.25, anchor: 'middle', color: 'var(--green)' },
  { label: 'False alarm', x: MAT_PAD + MAT_INNER_W * 0.75, y: MAT_PAD + MAT_INNER_H * 0.75, anchor: 'middle', color: 'var(--red)' },
  { label: 'Game changer', x: MAT_PAD + MAT_INNER_W * 0.25, y: MAT_PAD + MAT_INNER_H * 0.25, anchor: 'middle', color: 'var(--purple)' },
  { label: 'Keep running', x: MAT_PAD + MAT_INNER_W * 0.25, y: MAT_PAD + MAT_INNER_H * 0.75, anchor: 'middle', color: 'var(--yellow-text)' },
];

export function Module20_PracticalSignificance({ module, onNext }) {
  const [liftPct, setLiftPct] = useState(0.5); // 0.1% to 5.0%
  const [nStep, setNStep] = useState(3);       // index into SAMPLE_STEPS, default=100k

  const n = stepToN(nStep);

  const pValue = useMemo(() => approxPValue(liftPct, BASE_RATE, n), [liftPct, n]);
  const p2 = BASE_RATE + liftPct / 100;
  const h = useMemo(() => Math.abs(cohensH(BASE_RATE, p2)), [p2]);

  const hLabel = h < 0.2 ? 'Small' : h < 0.5 ? 'Medium' : 'Large';
  const hColor = h < 0.2 ? 'var(--text-muted)' : h < 0.5 ? 'var(--yellow)' : 'var(--green)';
  const pSig = pValue < 0.05;
  const pLabel = pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4);

  const annualImpact = useMemo(() => {
    const extraConversions = TOTAL_USERS * (liftPct / 100);
    return extraConversions * ARPU_PER_DAY * DAYS;
  }, [liftPct]);

  const verdict = useMemo(() => {
    if (pSig && h < 0.2) return 'Significant but negligible';
    if (pSig && h >= 0.2) return 'Significant and meaningful';
    if (!pSig && h >= 0.2) return 'Large effect, need more data to confirm';
    return 'Not yet significant — need more data';
  }, [pSig, h]);

  const verdictColor = pSig && h >= 0.2 ? 'var(--green)' : pSig && h < 0.2 ? 'var(--yellow)' : !pSig && h >= 0.2 ? 'var(--purple)' : 'var(--red)';

  const matPos = useMemo(() => getMatrixPosition(pValue, h), [pValue, h]);

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your experiment returns p = 0.001. The PM is thrilled — highly significant! But the actual lift is 0.3% on a conversion rate of 4.2%. With 10 million monthly users, that translates to maybe $8,000 in annual revenue. The engineering cost to ship the feature is $50,000. Statistically significant does not mean worth building.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          Large sample sizes can make trivially small effects reach statistical significance. Conversely, a genuinely large effect might not reach significance if your sample is too small. You need both statistical and practical significance to make a ship decision. Explore the matrix below to build intuition for when each applies.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Navigate the Significance Matrix</div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        A result can be <strong>statistically significant but practically negligible</strong> (large N amplifies tiny effects),
        or <strong>practically large but not yet significant</strong> (small N can't confirm a real effect).
        Effect size and business impact calculation must accompany every p-value.
      </p>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Set the effect size to a tiny lift like 0.1% and then drag the sample size up to 5M — watch the result go statistically significant while the Cohen's h stays in the "small" zone and the annual revenue impact stays negligible. Then set a 2% lift with a small sample to see the reverse. Find the quadrant in the matrix where both are strong.
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Lift slider */}
        <div style={{ flex: 1, minWidth: 250, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Effect size (absolute lift)</label>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{liftPct.toFixed(1)}%</span>
          </div>
          <input
            type="range" min={0.1} max={5.0} step={0.1}
            value={liftPct}
            onChange={e => setLiftPct(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>0.1% (tiny)</span><span>5.0% (large)</span>
          </div>
        </div>

        {/* Sample size slider */}
        <div style={{ flex: 1, minWidth: 250, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Sample size (per variant)</label>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{nToLabel(n)}</span>
          </div>
          <input
            type="range" min={0} max={SAMPLE_STEPS.length - 1} step={1}
            value={nStep}
            onChange={e => setNStep(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>1k</span><span>100k</span><span>5M</span>
          </div>
        </div>
      </div>

      {/* Live metrics */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* p-value */}
        <div style={{ flex: 1, minWidth: 130, background: pSig ? 'var(--green-bg)' : 'var(--red-bg)', border: `1.5px solid ${pSig ? 'var(--green-border)' : 'var(--red-border)'}`, borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: pSig ? 'var(--green)' : 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>p-value</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: pSig ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>p = {pLabel}</div>
          <div style={{ fontSize: '0.75rem', color: pSig ? 'var(--green)' : 'var(--red)', marginTop: '0.3rem' }}>{pSig ? '✓ Significant (p < 0.05)' : '✗ Not significant'}</div>
        </div>

        {/* Cohen's h */}
        <div style={{ flex: 1, minWidth: 130, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Cohen's h (effect size)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: hColor, fontVariantNumeric: 'tabular-nums' }}>{h.toFixed(3)}</div>
          <div style={{ fontSize: '0.75rem', color: hColor, marginTop: '0.3rem' }}>{hLabel} (&lt;0.2 small, 0.2–0.5 medium, &gt;0.5 large)</div>
        </div>

        {/* Revenue impact */}
        <div style={{ flex: 1, minWidth: 130, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Annual revenue impact</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
            ${annualImpact >= 1_000_000 ? `${(annualImpact / 1_000_000).toFixed(1)}M` : annualImpact >= 1000 ? `${(annualImpact / 1000).toFixed(0)}k` : annualImpact.toFixed(0)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>1M users × $0.50 ARPU/day × 365d</div>
        </div>

        {/* Verdict */}
        <div style={{ flex: 2, minWidth: 200, background: 'var(--surface-2)', border: `1.5px solid ${verdictColor}`, borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Verdict</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: verdictColor }}>{verdict}</div>
        </div>
      </div>

      {/* 2×2 Matrix */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Significance × Practical impact matrix — yellow dot = your result
        </div>
        <svg viewBox={`0 0 ${MAT_W} ${MAT_H}`} width="100%" style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}>
          {/* Background quadrants — top-left: Game changer (purple), top-right: Ship it (green),
              bottom-left: Keep running (yellow), bottom-right: False alarm (red) */}
          <rect x={MAT_PAD} y={MAT_PAD} width={MAT_INNER_W / 2} height={MAT_INNER_H / 2} fill="var(--purple-bg)" opacity={0.4} />
          <rect x={MAT_PAD + MAT_INNER_W / 2} y={MAT_PAD} width={MAT_INNER_W / 2} height={MAT_INNER_H / 2} fill="var(--green-bg)" opacity={0.4} />
          <rect x={MAT_PAD} y={MAT_PAD + MAT_INNER_H / 2} width={MAT_INNER_W / 2} height={MAT_INNER_H / 2} fill="var(--yellow-bg)" opacity={0.4} />
          <rect x={MAT_PAD + MAT_INNER_W / 2} y={MAT_PAD + MAT_INNER_H / 2} width={MAT_INNER_W / 2} height={MAT_INNER_H / 2} fill="var(--red-bg)" opacity={0.4} />

          {/* Grid lines */}
          <line x1={MAT_PAD} y1={MAT_PAD + MAT_INNER_H / 2} x2={MAT_PAD + MAT_INNER_W} y2={MAT_PAD + MAT_INNER_H / 2} stroke="var(--border)" strokeWidth={1} strokeDasharray="4,3" />
          <line x1={MAT_PAD + MAT_INNER_W / 2} y1={MAT_PAD} x2={MAT_PAD + MAT_INNER_W / 2} y2={MAT_PAD + MAT_INNER_H} stroke="var(--border)" strokeWidth={1} strokeDasharray="4,3" />

          {/* Outer border */}
          <rect x={MAT_PAD} y={MAT_PAD} width={MAT_INNER_W} height={MAT_INNER_H} fill="none" stroke="var(--border)" strokeWidth={1.5} />

          {/* Quadrant labels */}
          {QUADRANTS.map((q, i) => (
            <text key={i} x={q.x} y={q.y} textAnchor={q.anchor} fontSize={10} fontWeight={700} fill={q.color} opacity={0.9}>
              {q.label}
            </text>
          ))}

          {/* Axis labels */}
          <text x={MAT_PAD + MAT_INNER_W / 2} y={MAT_H - 4} textAnchor="middle" fontSize={8} fill="var(--text-muted)">Statistical significance →</text>
          <text x={8} y={MAT_PAD + MAT_INNER_H / 2} textAnchor="middle" fontSize={8} fill="var(--text-muted)" transform={`rotate(-90, 8, ${MAT_PAD + MAT_INNER_H / 2})`}>Practical significance →</text>

          {/* Yellow dot (current result) */}
          <circle cx={matPos.x} cy={matPos.y} r={9} fill="var(--yellow)" stroke="var(--yellow-text)" strokeWidth={2} opacity={0.95} style={{ transition: 'cx 0.3s ease, cy 0.3s ease' }} />
        </svg>
      </div>

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="pal-glow-pulse"
          onClick={onNext}
          style={{ padding: '0.7rem 1.75rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: 'var(--shadow)', letterSpacing: '0.02em' }}
        >
          Next concept →
        </button>
      </div>
    </div>
  );
}
