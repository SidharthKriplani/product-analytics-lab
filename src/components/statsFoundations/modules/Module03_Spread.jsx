import { useState, useMemo } from 'react';

const BASE_POINTS = [3, 5, 6, 7, 8, 9, 11, 13];

function computeStats(pts) {
  const mean = pts.reduce((s, v) => s + v, 0) / pts.length;
  const deviations = pts.map(v => Math.abs(v - mean));
  const variance = deviations.reduce((s, d) => s + d * d, 0) / pts.length;
  const sd = Math.sqrt(variance);
  return { mean, deviations, variance, sd };
}

function deviationColor(d, maxD) {
  const ratio = d / (maxD || 1);
  if (ratio < 0.33) return 'var(--green)';
  if (ratio < 0.67) return 'var(--yellow)';
  return 'var(--red)';
}

export function Module03_Spread({ module, onNext }) {
  const [multiplier, setMultiplier] = useState(1);

  const scaledPoints = useMemo(() => {
    const mean = BASE_POINTS.reduce((s, v) => s + v, 0) / BASE_POINTS.length;
    return BASE_POINTS.map(v => mean + (v - mean) * multiplier);
  }, [multiplier]);

  const { mean, deviations, variance, sd } = useMemo(() => computeStats(scaledPoints), [scaledPoints]);
  const maxDev = Math.max(...deviations);

  const W = 560;
  const H = 100;
  const AXIS_Y = 65;
  const DOT_R = 8;

  const xMin = Math.min(...scaledPoints);
  const xMax = Math.max(...scaledPoints);
  const range = xMax - xMin || 1;
  const pad = range * 0.18;
  const visMin = xMin - pad;
  const visMax = xMax + pad;
  const visRange = visMax - visMin;

  function toX(val) {
    return ((val - visMin) / visRange) * W;
  }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Two experiments both show a +5% mean lift in conversion. Your PM is ready to ship either one. But when you plot the distributions, Experiment A\'s users are tightly clustered around the mean while Experiment B\'s users are all over the map — some gained 40%, others lost 20%. Same average, wildly different risk profiles.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          Variance and standard deviation quantify that spread. Without them, you\'re flying blind — you know the center but not how much individual outcomes scatter around it. Drag the slider below to stretch or compress the data and see how variance responds.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Stretch the Spread</div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        Each deviation line below represents how far a single point sits from the mean. Variance averages the squared deviations — squaring penalizes large outliers more.
      </p>

      {/* Visualization */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ minWidth: 400 }}>
          <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: '100%', overflow: 'visible' }}>
            {/* Axis */}
            <line x1={0} y1={AXIS_Y} x2={W} y2={AXIS_Y} stroke="var(--border)" strokeWidth={2} />

            {/* Mean dashed vertical line */}
            <line
              x1={toX(mean)} y1={10} x2={toX(mean)} y2={AXIS_Y + 5}
              stroke="var(--accent)" strokeWidth={2} strokeDasharray="5,3"
            />
            <text x={toX(mean)} y={8} textAnchor="middle" fontSize={10} fill="var(--accent)" fontWeight={700}>
              x̄ = {mean.toFixed(1)}
            </text>

            {/* Tick marks */}
            {Array.from({ length: 9 }, (_, i) => {
              const val = visMin + (i / 8) * visRange;
              const x = toX(val);
              return (
                <g key={i}>
                  <line x1={x} y1={AXIS_Y} x2={x} y2={AXIS_Y + 5} stroke="var(--border-subtle)" strokeWidth={1} />
                  <text x={x} y={AXIS_Y + 16} textAnchor="middle" fontSize={9} fill="var(--text-muted)">
                    {Math.round(val * 10) / 10}
                  </text>
                </g>
              );
            })}

            {/* Deviation lines + dots */}
            {scaledPoints.map((pt, i) => {
              const cx = toX(pt);
              const mx = toX(mean);
              const cy = AXIS_Y - DOT_R - 2;
              const dev = deviations[i];
              const color = deviationColor(dev, maxDev);

              return (
                <g key={i}>
                  {/* Deviation line from dot down to mean height */}
                  <line
                    x1={cx} y1={cy}
                    x2={mx} y2={cy}
                    stroke={color} strokeWidth={1.5} strokeDasharray="3,2" opacity={0.7}
                  />
                  {/* Vertical drop to axis */}
                  <line
                    x1={cx} y1={cy}
                    x2={cx} y2={AXIS_Y}
                    stroke={color} strokeWidth={1.5} opacity={0.5}
                  />
                  <circle cx={cx} cy={cy} r={DOT_R} fill={color} opacity={0.85} />
                  <text x={cx} y={cy + 4} textAnchor="middle" fontSize={8} fill="#fff" fontWeight={700}>
                    {Math.round(pt * 10) / 10}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Drag the spread multiplier slider left and right. Watch how the deviation lines and the variance and standard deviation values change. Notice that squaring the deviations means outliers contribute disproportionately to variance.
      </div>

      {/* Spread multiplier slider */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>
            Spread multiplier
          </label>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
            {multiplier.toFixed(2)}×
          </span>
        </div>
        <input
          type="range" min={0.5} max={3} step={0.05}
          value={multiplier}
          onChange={e => setMultiplier(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          <span>0.5× (compressed)</span>
          <span>3× (stretched)</span>
        </div>
      </div>

      {/* Formula step-by-step */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', fontFamily: 'monospace' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem', fontFamily: 'sans-serif' }}>
          Live Calculation
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <div style={{ fontSize: '0.83rem', color: 'var(--text)' }}>
            <strong>Step 1 — Deviations |xᵢ − x̄|:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
              {deviations.map((d, i) => (
                <span key={i} style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  background: deviationColor(d, maxDev) === 'var(--green)' ? 'var(--green-bg)' : deviationColor(d, maxDev) === 'var(--yellow)' ? 'var(--yellow-bg)' : 'var(--red-bg)',
                  border: `1px solid ${deviationColor(d, maxDev) === 'var(--green)' ? 'var(--green-border)' : deviationColor(d, maxDev) === 'var(--yellow)' ? 'var(--yellow-border)' : 'var(--red-border)'}`,
                  color: deviationColor(d, maxDev) === 'var(--green)' ? 'var(--green-text)' : deviationColor(d, maxDev) === 'var(--yellow)' ? 'var(--yellow-text)' : 'var(--red-text)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}>
                  {d.toFixed(2)}
                </span>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border-subtle)' }} />

          <div style={{ fontSize: '0.83rem', color: 'var(--text)' }}>
            <strong>Step 2 — Variance = avg(deviations²):</strong>
            <span style={{ marginLeft: '0.5rem', color: 'var(--accent)', fontWeight: 700 }}>
              σ² = {variance.toFixed(3)}
            </span>
          </div>

          <div style={{ height: 1, background: 'var(--border-subtle)' }} />

          <div style={{ fontSize: '0.83rem', color: 'var(--text)' }}>
            <strong>Step 3 — Standard Deviation = √variance:</strong>
            <span style={{ marginLeft: '0.5rem', color: 'var(--teal)', fontWeight: 700 }}>
              σ = √{variance.toFixed(3)} = {sd.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Mean x̄', val: mean.toFixed(2), color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
          { label: 'Variance σ²', val: variance.toFixed(3), color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
          { label: 'Std Dev σ', val: sd.toFixed(3), color: 'var(--teal)', bg: 'var(--teal-bg)', border: 'var(--teal-border)' },
        ].map(({ label, val, color, bg, border }) => (
          <div key={label} style={{ flex: 1, minWidth: 120, background: bg, border: `1px solid ${border}`, borderRadius: 'var(--radius)', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.3rem' }}>{label}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Color legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { color: 'var(--green)', bg: 'var(--green-bg)', border: 'var(--green-border)', text: 'var(--green-text)', label: 'Small deviation (close to mean)' },
          { color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)', text: 'var(--yellow-text)', label: 'Medium deviation' },
          { color: 'var(--red)', bg: 'var(--red-bg)', border: 'var(--red-border)', text: 'var(--red-text)', label: 'Large deviation (far from mean)' },
        ].map(({ bg, border, text, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.7rem', background: bg, border: `1px solid ${border}`, borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.78rem', color: text, fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'Variance squares the deviations — so a point twice as far from the mean contributes four times as much to variance. Standard deviation brings it back to the original units. SD = 5 minutes means a typical user is ~5 minutes away from average session time.'}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Standard deviation is the input to sample size formulas. Higher variance in your metric requires a larger experiment to detect the same effect size. A noisy metric is expensive to test.'}
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
