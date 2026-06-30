import { useState, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';

const W = 600;
const H = 260;
const PAD_L = 48;
const PAD_R = 20;
const PAD_T = 18;
const PAD_B = 32;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

function normalPDF(x, mu = 0, sigma = 1) {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

function logNormalPDF(x, mu = 0, sigma = 1) {
  if (x <= 0) return 0;
  return Math.exp(-Math.pow(Math.log(x) - mu, 2) / (2 * sigma * sigma)) / (x * sigma * Math.sqrt(2 * Math.PI));
}

// Build SVG path from array of {x, y} where x,y are in data coords
function buildPath(pts, xMin, xMax, yMax) {
  return pts.map((p, i) => {
    const svgX = PAD_L + ((p.x - xMin) / (xMax - xMin)) * PLOT_W;
    const svgY = PAD_T + PLOT_H - (p.y / yMax) * PLOT_H;
    return `${i === 0 ? 'M' : 'L'} ${svgX.toFixed(2)},${svgY.toFixed(2)}`;
  }).join(' ');
}

function buildFill(pts, xMin, xMax, yMax) {
  if (pts.length < 2) return '';
  const line = buildPath(pts, xMin, xMax, yMax);
  const firstX = PAD_L + ((pts[0].x - xMin) / (xMax - xMin)) * PLOT_W;
  const lastX = PAD_L + ((pts[pts.length - 1].x - xMin) / (xMax - xMin)) * PLOT_W;
  const baseY = PAD_T + PLOT_H;
  return `${line} L ${lastX.toFixed(2)},${baseY} L ${firstX.toFixed(2)},${baseY} Z`;
}

const N_PTS = 200;

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module16_Skewness({ module, onNext }) {
  const [distType, setDistType] = useState('lognormal');
  // topContrib: what fraction of total "revenue" the top 10% contribute
  const [topContrib, setTopContrib] = useState(50);

  const isNormal = distType === 'normal';

  const { pts, xMin, xMax, yMax, meanVal, medianVal, modeVal } = useMemo(() => {
    if (isNormal) {
      const mu = 3, sigma = 0.7;
      const xMin = mu - 4 * sigma, xMax = mu + 4 * sigma;
      const pts = Array.from({ length: N_PTS }, (_, i) => {
        const x = xMin + (i / (N_PTS - 1)) * (xMax - xMin);
        return { x, y: normalPDF(x, mu, sigma) };
      });
      const yMax = Math.max(...pts.map(p => p.y)) * 1.15;
      return { pts, xMin, xMax, yMax, meanVal: mu, medianVal: mu, modeVal: mu };
    } else {
      // Log-normal: mu_ln, sigma_ln — tune sigma based on topContrib slider
      // Higher topContrib => more skewed => bigger sigma
      const sigma = 0.4 + (topContrib / 100) * 1.4; // 0.4 to 1.8
      const mu_ln = 1.0;
      const xMin = 0.01, xMax = 12;
      const pts = Array.from({ length: N_PTS }, (_, i) => {
        const x = xMin + (i / (N_PTS - 1)) * (xMax - xMin);
        return { x, y: logNormalPDF(x, mu_ln, sigma) };
      });
      const yMax = Math.max(...pts.map(p => p.y)) * 1.15;
      // Log-normal stats: mean = exp(mu + sigma²/2), median = exp(mu), mode = exp(mu - sigma²)
      const meanVal = Math.exp(mu_ln + (sigma * sigma) / 2);
      const medianVal = Math.exp(mu_ln);
      const modeVal = Math.exp(mu_ln - sigma * sigma);
      return { pts, xMin, xMax, yMax, meanVal, medianVal, modeVal };
    }
  }, [isNormal, topContrib]);

  const curvePath = buildPath(pts, xMin, xMax, yMax);
  const fillPath = buildFill(pts, xMin, xMax, yMax);

  // Convert data x to SVG x
  const toSvgX = (v) => PAD_L + ((v - xMin) / (xMax - xMin)) * PLOT_W;
  const toSvgY = (y) => PAD_T + PLOT_H - (y / yMax) * PLOT_H;

  const meanPDF = isNormal ? normalPDF(meanVal, meanVal, 0.7) : logNormalPDF(meanVal, 1.0, 0.4 + (topContrib / 100) * 1.4);
  const medPDF  = isNormal ? normalPDF(medianVal, meanVal, 0.7) : logNormalPDF(medianVal, 1.0, 0.4 + (topContrib / 100) * 1.4);
  const modePDF = isNormal ? normalPDF(modeVal, meanVal, 0.7) : logNormalPDF(modeVal, 1.0, 0.4 + (topContrib / 100) * 1.4);

  const meanRatio = isNormal ? 1.0 : (meanVal / medianVal).toFixed(2);

  const btnBase = {
    padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.15s',
  };
  const activeBtn = { ...btnBase, background: 'var(--accent)', border: '1.5px solid var(--accent)', color: '#fff', fontWeight: 800 };
  const inactiveBtn = { ...btnBase, background: 'var(--surface)', color: 'var(--text-muted)' };

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          Throughout these modules, the normal distribution has been our baseline: symmetric, bell-shaped, defined by mean and SD. But almost every product metric you'll encounter is not symmetric. Revenue per user, session length, time to convert, LTV, number of sessions per month — they're all right-skewed. The distribution leans hard to the left with a long tail extending to the right.
        </p>
        <p style={prose}>
          This isn't a data quality problem to fix. It's the true shape of the data. <strong style={{ color: 'var(--text)' }}>Skewness</strong> is the asymmetry of a distribution. A right-skewed distribution has most values clustered toward the low end, with a long tail of large values pulling the mean upward. The characteristic pattern: median revenue per user is £12. Mean revenue per user is £47. The difference isn't measurement error — it's a small number of high-spending users dragging the mean far above the typical experience.
        </p>
        <p style={prose}>
          Why is product data almost always right-skewed? Because many product quantities are multiplicative rather than additive. User lifetime value is roughly (sessions per week) × (revenue per session) × (weeks retained). Quantities built from multiplying other quantities naturally produce right-skewed distributions. The normal distribution emerges from sums of many small effects. <strong style={{ color: 'var(--text)' }}>Log-normal distributions emerge from products of many small effects.</strong>
        </p>
        <p style={prose}>
          A variable is log-normally distributed if taking its logarithm produces a normal distribution. The log transform compresses the right tail and spreads the left — what was a skewed distribution becomes approximately bell-shaped. This matters practically because normal statistical tools work on the transformed variable. Instead of running a t-test on revenue directly — where the distribution violates the tool's assumptions — you run it on log(revenue). The result is a comparison of log-means, which is a comparison of geometric means on the original scale.
        </p>
        <p style={prose}>
          The <strong style={{ color: 'var(--text)' }}>geometric mean</strong> is the natural center for log-normal data: it's the exponential of the mean log. For right-skewed data it sits between the median and the mean, representing the "typical multiplicative value." The log transformation is not a trick — it's matching your analysis tool to the generating process of your data.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You have revenue per user data with median £8 and mean £31. If you add one enterprise user who spent £10,000, what happens to the mean? What happens to the median? What happens to the geometric mean?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Compare Normal vs. Log-Normal</div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Toggle between Normal and Log-Normal, then drag the "top 10% contribution" slider for the log-normal case. Watch the mean pull further from the median as skewness increases. Notice the mean/median ratio — when that ratio is high, the mean is not a good description of the typical user.
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button style={distType === 'normal' ? activeBtn : inactiveBtn} onClick={() => setDistType('normal')}>
          Normal
        </button>
        <button style={distType === 'lognormal' ? activeBtn : inactiveBtn} onClick={() => setDistType('lognormal')}>
          Log-Normal (Product Reality)
        </button>
      </div>

      {/* Top-user slider — only shown for lognormal */}
      {!isNormal && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
              Top 10% user revenue contribution
            </label>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
              {topContrib}%
            </span>
          </div>
          <input
            type="range" min={10} max={80} step={5}
            value={topContrib}
            onChange={e => setTopContrib(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--red)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>10% (mild skew)</span><span>45% (moderate)</span><span>80% (extreme)</span>
          </div>
        </div>
      )}

      {/* Stats readout */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 120, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '0.8rem 1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>Mean</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{meanVal.toFixed(2)}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Dragged by outliers</div>
        </div>
        <div style={{ flex: 1, minWidth: 120, background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '0.8rem 1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', marginBottom: 4 }}>Median</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>{medianVal.toFixed(2)}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Robust to outliers</div>
        </div>
        <div style={{ flex: 1, minWidth: 120, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.8rem 1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Mode</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{modeVal.toFixed(2)}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Peak of distribution</div>
        </div>
        {!isNormal && (
          <div style={{ flex: 1, minWidth: 140, background: 'var(--red-bg)', border: '1.5px solid var(--red-border)', borderRadius: 'var(--radius)', padding: '0.8rem 1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', marginBottom: 4 }}>Mean / Median</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{meanRatio}×</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Skew gap (should be 1.0)</div>
          </div>
        )}
      </div>

      {/* SVG distribution */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          {isNormal ? 'Normal Distribution — Symmetric' : `Log-Normal Distribution — Right-Skewed (top 10% = ${topContrib}% of revenue)`}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible' }}>
          {/* Fill */}
          <path d={fillPath} fill={isNormal ? 'var(--accent)' : 'var(--red)'} opacity={0.13} />
          {/* Curve */}
          <path d={curvePath} fill="none" stroke={isNormal ? 'var(--accent)' : 'var(--red)'} strokeWidth={2.5} />

          {/* Mean line */}
          {meanVal >= xMin && meanVal <= xMax && (
            <g>
              <line
                x1={toSvgX(meanVal)} y1={PAD_T}
                x2={toSvgX(meanVal)} y2={PAD_T + PLOT_H}
                stroke="var(--accent)" strokeWidth={2} strokeDasharray="6,4"
              />
              <text x={toSvgX(meanVal) + 4} y={PAD_T + 14} fontSize={10} fill="var(--accent)" fontWeight={700}>
                Mean {meanVal.toFixed(1)}
              </text>
            </g>
          )}

          {/* Median line (only meaningful when separate from mean) */}
          {!isNormal && medianVal >= xMin && medianVal <= xMax && (
            <g>
              <line
                x1={toSvgX(medianVal)} y1={PAD_T}
                x2={toSvgX(medianVal)} y2={PAD_T + PLOT_H}
                stroke="var(--green)" strokeWidth={2} strokeDasharray="4,4"
              />
              <text x={toSvgX(medianVal) + 4} y={PAD_T + 28} fontSize={10} fill="var(--green)" fontWeight={700}>
                Median {medianVal.toFixed(1)}
              </text>
            </g>
          )}

          {/* Mode line (lognormal only, when different) */}
          {!isNormal && modeVal >= xMin && modeVal <= xMax && (
            <g>
              <line
                x1={toSvgX(modeVal)} y1={PAD_T}
                x2={toSvgX(modeVal)} y2={PAD_T + PLOT_H}
                stroke="var(--text-muted)" strokeWidth={1.5} strokeDasharray="3,5"
              />
              <text x={toSvgX(modeVal) + 4} y={PAD_T + 42} fontSize={10} fill="var(--text-muted)" fontWeight={600}>
                Mode {modeVal.toFixed(1)}
              </text>
            </g>
          )}

          {/* For normal dist — single mean=median=mode label */}
          {isNormal && (
            <text x={toSvgX(meanVal)} y={PAD_T + PLOT_H + 18} textAnchor="middle" fontSize={10} fill="var(--accent)" fontWeight={700}>
              Mean = Median = Mode = {meanVal.toFixed(1)}
            </text>
          )}

          {/* Axes */}
          <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={W - PAD_R} y2={PAD_T + PLOT_H} stroke="var(--border)" strokeWidth={1.5} />
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="var(--border)" strokeWidth={1} />

          {/* X axis label */}
          <text x={PAD_L + PLOT_W / 2} y={H - 2} textAnchor="middle" fontSize={10} fill="var(--text-muted)">
            {isNormal ? 'Value' : 'Revenue / session length / LTV per user →'}
          </text>

          {/* Right-tail annotation for lognormal */}
          {!isNormal && (
            <text x={W - PAD_R - 8} y={PAD_T + 24} textAnchor="end" fontSize={10} fill="var(--red)" fontWeight={700} opacity={0.8}>
              Long right tail →
            </text>
          )}
        </svg>
      </div>

      {/* Product context panel */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          Product Reality: Log-Normal Metrics
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}><Icon name='music' size={19} color='currentColor' /></span>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <strong>Spotify revenue per user:</strong> top 1% of users contribute ~35% of streams.
              Mean listening time: 28 min. Median: 12 min. The mean flatters the average user.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}><Icon name='shopping-cart' size={19} color='currentColor' /></span>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <strong>E-commerce order value:</strong> most orders are $20–60. A handful of B2B orders are $2,000+.
              Mean = $85. Median = $38. An A/B test comparing means could be swung by 3 whale orders.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}><Icon name='smartphone' size={19} color='currentColor' /></span>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <strong>Mobile session length:</strong> most sessions are 30–90 seconds. Power users browse for 20+ minutes.
              Log-transform before A/B testing to normalize the distribution.
            </div>
          </div>
        </div>
      </div>

      {/* What to do about it */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>What to do about skewed metrics</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            ['Use median', 'More robust than mean for skewed metrics — not dragged by top-1% users.'],
            ['Log-transform before testing', 'log(revenue) is roughly normal. Run the t-test on the log-transformed values.'],
            ['Quantile regression', 'Test effects at specific percentiles (p50, p90) not just the mean.'],
            ['Cap/winsorize outliers', 'Replace values above the 99th percentile with the 99th percentile value. Reduces variance without removing data.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--green)', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0, marginTop: '0.05rem' }}><Icon name='check' size={15} color='var(--green)' /></span>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                <strong style={{ color: 'var(--text)' }}>{title}:</strong> {desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── What you should have confirmed ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          The mean moves dramatically with a single extreme outlier. The median barely moves. The geometric mean moves modestly — it's more resistant than the mean because log(10,000) is only about 4× larger than log(100), even though 10,000 is 100× larger. For multiplicative data, the geometric mean is the most stable and representative central tendency. The toggle shows that what looked like a skewed mess is actually a well-behaved distribution in log-space.
        </p>
      </div>

      {/* ── Analyst Move ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> For any revenue, LTV, or engagement-intensity metric, check whether log-transformation improves normality before running statistical tests. The quick check: does log(metric + 1) look approximately normal in a histogram? If yes, run your analysis on the transformed variable and back-transform results. Report the multiplicative effect on the original scale.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Report median and geometric mean alongside the arithmetic mean for right-skewed product metrics. "Revenue per user: mean £47, median £12, geometric mean £18" tells a stakeholder that the typical user generates £12–18, while the mean is elevated by a power-user tail. Each number tells a different true story. None is wrong — they answer different questions.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> When an A/B test on a revenue metric comes back non-significant despite a visible lift in the mean, check whether the high-variance right tail is killing your power. Winsorize outliers (cap extreme values at the 95th or 99th percentile), or analyze log-transformed revenue. Either reduces variance, increases effective signal-to-noise, and often reveals a significant lift that was buried in tail noise.</p>
        </div>
      </div>

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'This directly affects how you run and interpret A/B tests on revenue metrics. A significant mean lift might be driven by 3 whale users. A non-significant result might mask a real median lift. Always specify in advance whether you\'re testing the mean or the median — and use the right transformation for each.'}
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
