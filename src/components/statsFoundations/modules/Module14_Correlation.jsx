import { useState, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';

function generateCorrelatedPoints(r, n = 30) {
  const points = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 2 * Math.PI;
    const x = 0.5 + 0.35 * Math.cos(t * 1.3 + i * 0.7);
    const noise = (Math.sin(i * 2.1) * 0.5 + Math.sin(i * 3.7) * 0.3) * (1 - Math.abs(r));
    const y = 0.5 + 0.35 * r * (x - 0.5) / 0.35 + noise * 0.35;
    points.push({
      x: Math.max(0.05, Math.min(0.95, x)),
      y: Math.max(0.05, Math.min(0.95, y)),
    });
  }
  return points;
}

function rColor(r) {
  if (r > 0.1) return 'var(--green)';
  if (r < -0.1) return 'var(--red)';
  return 'var(--text-muted)';
}

function rLabel(r) {
  const abs = Math.abs(r);
  if (abs >= 0.9) return r > 0 ? 'Strong positive' : 'Strong negative';
  if (abs >= 0.6) return r > 0 ? 'Moderate positive' : 'Moderate negative';
  if (abs >= 0.3) return r > 0 ? 'Weak positive' : 'Weak negative';
  return 'No linear relationship';
}

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module14_Correlation({ module, onNext }) {
  const [r, setR] = useState(0.7);
  const [explored, setExplored] = useState(false);

  const points = useMemo(() => generateCorrelatedPoints(r), [r]);

  const dotColor = rColor(r);
  const rSq = (r * r).toFixed(2);

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          We've built tools for understanding a single variable. But product decisions rarely involve one variable in isolation. You want to know: do users who spend more time on the product retain better? Does page load time affect conversion? Does early feature adoption predict long-term value? These are questions about the relationship between two variables — whether they move together, in what direction, and how strongly.
        </p>
        <p style={prose}>
          The starting point is covariance. For each data point, take how far X is from its mean and multiply it by how far Y is from its mean. If X tends to be above its mean when Y is above its mean — both positive deviations at the same time — the product is positive. Average those products across all data points and you have the covariance. But covariance has a unit problem: if X is session duration in minutes and Y is revenue in pounds, covariance is in minute-pounds. That's not interpretable.
        </p>
        <p style={prose}>
          The fix: divide the covariance by the product of the two standard deviations. That's the <strong style={{ color: 'var(--text)' }}>Pearson correlation coefficient</strong>, r = Cov(X, Y) / (σ_X × σ_Y). The result is always between -1 and 1. r = 1 is perfect positive linear relationship. r = -1 is perfect negative. r = 0 means no linear relationship.
        </p>
        <p style={prose}>
          Three critical limitations. First: correlation captures linear relationships only. If X and Y have a U-shaped relationship, correlation can be near zero even though the relationship is strong and systematic — always look at the scatter plot. Second: correlation is not causation. A third variable may cause both. Before acting on a correlation, you need a causal argument. Third: with large samples, tiny correlations become statistically significant. Report r² — the fraction of variance in Y explained by X. r = 0.05 means r² = 0.0025. Statistically real, practically irrelevant.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You compute r = 0.3 between weekly active sessions and 90-day retention. Is this a strong relationship? How much of retention variance is this relationship explaining?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Reshape the Scatter Plot</div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Drag the correlation slider from -1.0 to +1.0 and watch the scatter plot reshape. Notice how the cloud tightens into a line at the extremes and scatters randomly at r=0. Check the r-squared value to understand what fraction of variance in Y is explained by X.
      </div>

      {/* Slider */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
            Correlation strength <em>r</em>
          </label>
          <span style={{
            fontSize: '1.4rem', fontWeight: 900, color: dotColor,
            fontVariantNumeric: 'tabular-nums', minWidth: 60, textAlign: 'right',
          }}>
            {r >= 0 ? '+' : ''}{r.toFixed(1)}
          </span>
        </div>
        <input
          type="range" min={-1.0} max={1.0} step={0.1}
          value={r}
          onChange={e => { setR(parseFloat(e.target.value)); setExplored(true); }}
          style={{ width: '100%', accentColor: r > 0.1 ? 'var(--green)' : r < -0.1 ? 'var(--red)' : 'var(--text-muted)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          <span>−1.0 (perfect neg.)</span>
          <span>0.0 (none)</span>
          <span>+1.0 (perfect pos.)</span>
        </div>
      </div>

      {/* r readout banner */}
      <div style={{
        background: r > 0.1 ? 'var(--green-bg)' : r < -0.1 ? 'var(--red-bg)' : 'var(--surface-2)',
        border: `2px solid ${r > 0.1 ? 'var(--green-border)' : r < -0.1 ? 'var(--red-border)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', padding: '0.85rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: dotColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
            {rLabel(r)}
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: dotColor, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            r = {r >= 0 ? '+' : ''}{r.toFixed(1)}
          </div>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 340 }}>
          r² = <strong style={{ color: dotColor }}>{rSq}</strong> — meaning{' '}
          <strong>{(parseFloat(rSq) * 100).toFixed(0)}%</strong> of the variance in Y is explained by X.
          <span style={{ display: 'block', marginTop: '0.15rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            {Math.abs(r) >= 0.7
              ? 'Drag r toward 0 to see the cloud scatter.'
              : Math.abs(r) < 0.3
              ? 'At r≈0, knowing X tells you almost nothing about Y.'
              : 'Keep dragging to see the relationship strengthen or weaken.'}
          </span>
        </div>
      </div>

      {/* Scatter plot SVG */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Scatter Plot — r = {r >= 0 ? '+' : ''}{r.toFixed(1)}
        </div>
        <svg viewBox="0 0 500 300" width="100%" style={{ overflow: 'visible' }}>
          {/* Axes */}
          <line x1={40} y1={260} x2={460} y2={260} stroke="var(--border)" strokeWidth={1.5} />
          <line x1={40} y1={40} x2={40} y2={260} stroke="var(--border)" strokeWidth={1.5} />

          {/* Axis labels */}
          <text x={250} y={290} textAnchor="middle" fontSize={11} fill="var(--text-muted)" fontWeight={600}>Variable X</text>
          <text x={14} y={155} textAnchor="middle" fontSize={11} fill="var(--text-muted)" fontWeight={600} transform="rotate(-90 14 155)">Variable Y</text>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(v => (
            <g key={v}>
              <line x1={40 + v * 420} y1={40} x2={40 + v * 420} y2={260} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="3,4" opacity={0.5} />
              <line x1={40} y1={260 - v * 220} x2={460} y2={260 - v * 220} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="3,4" opacity={0.5} />
            </g>
          ))}

          {/* Trend line hint when r != 0 */}
          {Math.abs(r) >= 0.3 && (() => {
            const x1 = 0.1, y1 = 0.5 + r * (x1 - 0.5);
            const x2 = 0.9, y2 = 0.5 + r * (x2 - 0.5);
            const sx1 = 40 + x1 * 420, sy1 = 260 - Math.max(0.05, Math.min(0.95, y1)) * 220;
            const sx2 = 40 + x2 * 420, sy2 = 260 - Math.max(0.05, Math.min(0.95, y2)) * 220;
            return (
              <line x1={sx1} y1={sy1} x2={sx2} y2={sy2}
                stroke={dotColor} strokeWidth={1.5} strokeDasharray="6,4" opacity={0.45} />
            );
          })()}

          {/* Data points */}
          {points.map((pt, i) => {
            const svgX = 40 + pt.x * 420;
            const svgY = 260 - pt.y * 220;
            return (
              <circle
                key={i}
                cx={svgX} cy={svgY} r={5}
                fill={dotColor} opacity={0.72}
                stroke="var(--surface)" strokeWidth={1.2}
              />
            );
          })}

          {/* r label in chart */}
          <text x={450} y={55} textAnchor="end" fontSize={13} fontWeight={800} fill={dotColor}>
            r = {r >= 0 ? '+' : ''}{r.toFixed(1)}
          </text>
          <text x={450} y={70} textAnchor="end" fontSize={10} fill="var(--text-muted)">
            r² = {rSq}
          </text>
        </svg>
      </div>

      {/* Correlation ≠ Causation callout */}
      <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--red-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          Correlation ≠ Causation
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}><Icon name='ice-cream' size={19} color='currentColor' /></span>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <strong>Ice cream sales and drowning rates</strong> are both high in summer — but ice cream doesn't cause drowning.
              Both are <em>confounded</em> by temperature: a hidden third variable drives both.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}><Icon name='smartphone' size={19} color='currentColor' /></span>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <strong>Users who see a feature more often also retain better</strong> — but heavy users self-select into using features more.
              Showing the feature more isn't causing retention; engagement is causing both.
            </div>
          </div>
        </div>
      </div>

      {/* Math note */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>How it's computed</div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: 'var(--text)', lineHeight: 2 }}>
          Cov(X,Y) = Σ (xᵢ − x̄)(yᵢ − ȳ) / (n−1)<br />
          <span style={{ color: 'var(--text-muted)' }}>r = Cov(X,Y) / (σ_X · σ_Y)</span><br />
          <span style={{ color: 'var(--text-muted)' }}>r² (coefficient of determination) = {rSq} at r={r.toFixed(1)}</span>
        </div>
      </div>

      {/* ── What you should have confirmed ── */}
      {explored && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            r = 0.3 means r² = 0.09 — the relationship with sessions explains 9% of retention variance. That's a real relationship (not noise, assuming reasonable n), but 91% of retention variation is explained by something else. The scatter plot at extreme r shows what a truly tight relationship looks like — and how much noise remains even at r = 0.7.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {explored && (
        <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Always plot the scatter before trusting r. A correlation of 0.5 from a clean linear relationship and a correlation of 0.5 from a noisy nonlinear one with outliers need completely different interpretations. The number alone doesn't tell you.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Report r² alongside r in any analysis that involves prediction or variance explanation. r = 0.4 sounds substantial. r² = 0.16 (16% of variance explained) sounds modest. Both are true. Use the one that communicates the explanatory power honestly.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> When a PM points to a correlation as justification for a feature decision ("users who do X have higher LTV, so we should drive more X behavior"), challenge the causal story explicitly. The correlation might be real. The mechanism they're assuming — that driving X will cause LTV to increase — requires a causal argument, not just correlation. This is the foundation of why experiments exist.</p>
          </div>
        </div>
      )}

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Before running experiments, you need correlation to identify candidate features. After experiments, correlation in residuals signals confounding. An experiment is the tool you use when correlation alone isn\'t enough to determine whether an effect is causal.'}
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
