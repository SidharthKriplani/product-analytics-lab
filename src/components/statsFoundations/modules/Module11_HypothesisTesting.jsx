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

const W = 580;
const H = 200;
const X_MIN = -4.5;
const X_MAX = 4.5;
const X_RANGE = X_MAX - X_MIN;
const N_PTS = 320;

function toSvgX(x) {
  return ((x - X_MIN) / X_RANGE) * W;
}

function toSvgY(pdf, maxPDF) {
  return H - (pdf / maxPDF) * (H * 0.82) - 10;
}

const MAX_PDF = normalPDF(0);

function buildPath(pts) {
  return 'M ' + pts.map(p => `${p.sx.toFixed(2)},${p.sy.toFixed(2)}`).join(' L ');
}

const ALL_PTS = Array.from({ length: N_PTS }, (_, i) => {
  const x = X_MIN + (i / (N_PTS - 1)) * X_RANGE;
  const pdf = normalPDF(x);
  return { x, sx: toSvgX(x), sy: toSvgY(pdf, MAX_PDF) };
});

const CURVE_PATH = buildPath(ALL_PTS);

function shadedArea(lo, hi) {
  const pts = ALL_PTS.filter(p => p.x >= lo && p.x <= hi);
  if (pts.length < 2) return '';
  return 'M ' + pts.map(p => `${p.sx.toFixed(2)},${p.sy.toFixed(2)}`).join(' L ') +
    ` L ${toSvgX(hi).toFixed(2)},${H} L ${toSvgX(lo).toFixed(2)},${H} Z`;
}

export function Module11_HypothesisTesting({ module, onNext }) {
  const [zObs, setZObs] = useState(2.1);
  const [twoTailed, setTwoTailed] = useState(true);

  const absZ = Math.abs(zObs);

  // p-value
  const pValue = useMemo(() => {
    if (twoTailed) {
      return 2 * (1 - normalCDF(absZ));
    } else {
      return zObs >= 0 ? 1 - normalCDF(zObs) : normalCDF(zObs);
    }
  }, [zObs, twoTailed, absZ]);

  // Shaded paths
  const { shadePaths } = useMemo(() => {
    let paths = [];
    if (twoTailed) {
      paths.push({ path: shadedArea(absZ, X_MAX), fill: 'var(--red)' });
      paths.push({ path: shadedArea(X_MIN, -absZ), fill: 'var(--red)' });
    } else {
      if (zObs >= 0) {
        paths.push({ path: shadedArea(zObs, X_MAX), fill: 'var(--red)' });
      } else {
        paths.push({ path: shadedArea(X_MIN, zObs), fill: 'var(--red)' });
      }
    }
    return { shadePaths: paths };
  }, [zObs, twoTailed, absZ]);

  const rejected = pValue < 0.05;
  const pFormatted = pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4);

  const extremePct = (pValue * 100).toFixed(2);

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Engineering shipped a latency fix last week. Page load times dropped from 3.2s to 2.9s in your sample. But is that real improvement, or just random noise? If you shipped a celebration Slack message every time the metric wiggled downward, you\'d be celebrating noise half the time. Hypothesis testing gives you a framework for deciding.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          The p-value answers one specific question: if nothing actually changed (the null hypothesis), how surprising is the data you observed? A small p-value means your data would be very unlikely under "no effect" — which is evidence that something real happened. Drag the z-score below to see how the p-value shrinks as results become more extreme.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Move the Test Statistic</div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        The <strong>p-value</strong> is the probability of observing a test statistic as extreme as yours — or more extreme — if the null hypothesis were actually true.
        It's the red shaded area in the tail(s) of the null distribution. Smaller p = more surprising under H₀ = stronger evidence against it.
      </p>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Drag the z-score slider from 0 toward 4 and watch the red shaded area (the p-value) shrink. Toggle between two-tailed and one-tailed tests to see how the tails change. Notice where the decision flips from "fail to reject" to "reject" as you cross z = 1.96.
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 250, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Observed test statistic (z)</label>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{zObs.toFixed(2)}</span>
          </div>
          <input
            type="range" min={-4} max={4} step={0.05}
            value={zObs}
            onChange={e => setZObs(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>−4 (large negative)</span><span>0 (no effect)</span><span>+4 (large positive)</span>
          </div>
        </div>

        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>Test type</div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[{ label: 'Two-tailed', val: true }, { label: 'One-tailed', val: false }].map(opt => (
              <button key={String(opt.val)} onClick={() => setTwoTailed(opt.val)} style={{
                padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${twoTailed === opt.val ? 'var(--accent)' : 'var(--border)'}`,
                background: twoTailed === opt.val ? 'var(--accent-bg)' : 'var(--surface)',
                color: twoTailed === opt.val ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '0.85rem', fontWeight: twoTailed === opt.val ? 700 : 500, cursor: 'pointer',
              }}>{opt.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Main SVG */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Null Distribution H₀: N(0, 1) — red area = p-value
        </div>
        <svg viewBox={`0 0 ${W} ${H + 30}`} style={{ width: '100%', overflow: 'visible' }}>
          {/* p-value shading */}
          {shadePaths.map((sp, i) => (
            sp.path && <path key={i} d={sp.path} fill={sp.fill} opacity={0.25} />
          ))}

          {/* Alpha reference shading (±1.96, light background) */}
          {twoTailed && (
            <>
              <path d={shadedArea(1.96, X_MAX)} fill="var(--border-subtle)" opacity={0.4} />
              <path d={shadedArea(X_MIN, -1.96)} fill="var(--border-subtle)" opacity={0.4} />
            </>
          )}

          {/* Curve */}
          <path d={CURVE_PATH} fill="none" stroke="var(--accent)" strokeWidth={2.5} />

          {/* Axis */}
          <line x1={0} y1={H} x2={W} y2={H} stroke="var(--border)" strokeWidth={1.5} />

          {/* Tick marks */}
          {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map(k => (
            <g key={k}>
              <line x1={toSvgX(k)} y1={H} x2={toSvgX(k)} y2={H + 5} stroke="var(--border)" strokeWidth={1} />
              <text x={toSvgX(k)} y={H + 17} textAnchor="middle" fontSize={9.5} fill="var(--text-muted)">{k}</text>
            </g>
          ))}
          <text x={W / 2} y={H + 30} textAnchor="middle" fontSize={9} fill="var(--text-muted)">z-score</text>

          {/* Alpha reference lines at ±1.96 */}
          {twoTailed && (
            <>
              <line x1={toSvgX(1.96)} y1={0} x2={toSvgX(1.96)} y2={H} stroke="var(--purple)" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7} />
              <line x1={toSvgX(-1.96)} y1={0} x2={toSvgX(-1.96)} y2={H} stroke="var(--purple)" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7} />
              <text x={toSvgX(1.96) + 3} y={20} fontSize={9} fill="var(--purple)" fontWeight={600}>α/2=2.5%</text>
              <text x={toSvgX(-1.96) - 3} y={20} textAnchor="end" fontSize={9} fill="var(--purple)" fontWeight={600}>α/2=2.5%</text>
            </>
          )}

          {/* Observed z line */}
          <line
            x1={toSvgX(zObs)} y1={4}
            x2={toSvgX(zObs)} y2={H}
            stroke={rejected ? 'var(--red)' : 'var(--yellow)'}
            strokeWidth={2.5}
          />
          <text
            x={toSvgX(zObs)} y={3}
            textAnchor={zObs > 0 ? 'start' : 'end'}
            fontSize={10} fill={rejected ? 'var(--red)' : 'var(--yellow)'} fontWeight={700}
          >
            z={zObs.toFixed(2)}
          </text>

          {/* Two-tailed mirror line */}
          {twoTailed && Math.abs(zObs) > 0.1 && (
            <line
              x1={toSvgX(-zObs)} y1={4}
              x2={toSvgX(-zObs)} y2={H}
              stroke={rejected ? 'var(--red)' : 'var(--yellow)'}
              strokeWidth={1.5}
              strokeDasharray="4,3"
              opacity={0.7}
            />
          )}
        </svg>
      </div>

      {/* P-value and decision */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1.5, minWidth: 180, background: rejected ? 'var(--red-bg)' : 'var(--surface-2)', border: `1.5px solid ${rejected ? 'var(--red-border)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: rejected ? 'var(--red)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            {twoTailed ? 'Two-tailed' : 'One-tailed'} p-value
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: rejected ? 'var(--red)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
            p = {pFormatted}
          </div>
        </div>
        <div style={{ flex: 2, minWidth: 200, background: rejected ? 'var(--red-bg)' : 'var(--green-bg)', border: `1.5px solid ${rejected ? 'var(--red-border)' : 'var(--green-border)'}`, borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: rejected ? 'var(--red)' : 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Decision (α = 0.05)</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: rejected ? 'var(--red)' : 'var(--green)' }}>
            {rejected ? `p < 0.05 — Reject null hypothesis` : `p ≥ 0.05 — Fail to reject null`}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
            {rejected
              ? `If H₀ were true, there's only a ${extremePct}% chance of seeing an effect this extreme`
              : `If H₀ were true, a ${extremePct}% chance of seeing an effect this extreme is not surprising enough`}
          </div>
        </div>
      </div>

      {/* Calculation breakdown */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text)' }}>
        <strong style={{ fontFamily: 'sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calculation</strong>
        {twoTailed ? (
          <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            p = 2 × P(Z &gt; |{zObs.toFixed(2)}|) = 2 × (1 − Φ({absZ.toFixed(2)}))
            <br />
            = 2 × (1 − {normalCDF(absZ).toFixed(4)}) = 2 × {(1 - normalCDF(absZ)).toFixed(4)}
            {' '}= <strong style={{ color: rejected ? 'var(--red)' : 'var(--accent)' }}>{pFormatted}</strong>
          </div>
        ) : (
          <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            p = P(Z &gt; {zObs.toFixed(2)}) = 1 − Φ({zObs.toFixed(2)}) = 1 − {normalCDF(zObs).toFixed(4)}
            {' '}= <strong style={{ color: rejected ? 'var(--red)' : 'var(--accent)' }}>{pFormatted}</strong>
          </div>
        )}
      </div>

      {/* Type I error explanation */}
      <div style={{ background: 'var(--purple-bg)', border: '1.5px solid var(--purple-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Alpha & Type I Error</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          The dashed purple lines mark z = ±1.96 — the critical values for α=0.05 (two-tailed). Any observed z beyond these lines produces p &lt; 0.05.
          If H₀ is actually true, 5% of experiments will still produce z beyond these lines by random chance — that's the Type I error rate.
        </div>
      </div>

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'Drag the slider from z=0 to z=4 and watch the red p-value area shrink from 50% to nearly 0. The p-value doesn\'t tell you the probability that H₀ is true — it tells you how often you\'d see results this extreme if H₀ WERE true. A tiny p is surprising under the null.'}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'In an A/B test, H₀ is "the variants perform equally." Your t-statistic is converted to a z-score. If that z falls beyond ±1.96, you reject H₀ at α=0.05 and call the test significant. The p-value in your dashboard is the tail area shown here.'}
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
