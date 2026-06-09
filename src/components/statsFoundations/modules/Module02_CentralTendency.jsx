import { useState, useMemo } from 'react';

const INITIAL_DATA = [4, 5, 6, 7, 8, 9, 10];

function calcStats(data) {
  if (!data.length) return { mean: 0, median: 0, mode: [] };
  const sorted = [...data].sort((a, b) => a - b);
  const mean = data.reduce((s, v) => s + v, 0) / data.length;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const freq = {};
  data.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  const mode = maxFreq > 1 ? Object.keys(freq).filter(k => freq[k] === maxFreq).map(Number) : [];
  return { mean, median, mode };
}

const DOT_COLORS = [
  'var(--accent)', 'var(--teal)', 'var(--purple)', 'var(--green)',
  'var(--yellow)', 'var(--red)', 'var(--accent-light)',
];

export function Module02_CentralTendency({ module, onNext }) {
  const [data, setData] = useState(INITIAL_DATA);
  const [hovered, setHovered] = useState(null);

  const { mean, median, mode } = useMemo(() => calcStats(data), [data]);
  const hasOutlier = data.some(v => v > 50);

  const xMin = Math.min(...data);
  const xMax = Math.max(...data);
  const range = xMax - xMin || 1;
  const pad = range * 0.15;
  const visMin = Math.max(0, xMin - pad);
  const visMax = xMax + pad;
  const visRange = visMax - visMin || 1;

  const W = 560;
  const H = 90;
  const AXIS_Y = 60;
  const DOT_R = 9;

  function toX(val) {
    return ((val - visMin) / visRange) * W;
  }

  // Stack dots with same value
  const stacked = [];
  const countMap = {};
  [...data].sort((a, b) => a - b).forEach(v => {
    const key = Math.round(v * 10) / 10;
    countMap[key] = (countMap[key] || 0) + 1;
    stacked.push({ val: v, stack: countMap[key] - 1 });
  });

  function addPoint(val) {
    setData(prev => [...prev, val]);
  }

  function handleReset() {
    setData(INITIAL_DATA);
    setHovered(null);
  }

  const statRow = (label, value, color) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: 700, color }}>{value}</span>
    </div>
  );

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your PM shares a slide that says average revenue per user is $12 and the business is healthy. But when you pull the raw data, the median is only $3. Most users spend almost nothing — a handful of whales are dragging the average up. The PM\'s story is technically true but deeply misleading.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          This is the classic mean vs. median trap. Understanding when each measure tells the real story — and when it hides it — is the foundation of every metric you\'ll ever report. Add an outlier below and watch the mean chase it while the median barely moves.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Add Points and Watch the Measures Shift</div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        The mean weighs every value equally — so one extreme outlier can drag it far from the rest. The median only cares about rank order, making it robust to extremes.
      </p>

      {/* Visualization */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ minWidth: 400 }}>
          <svg viewBox={`0 0 ${W} ${H + 10}`} style={{ width: '100%', overflow: 'visible' }}>
            {/* Axis line */}
            <line x1={0} y1={AXIS_Y} x2={W} y2={AXIS_Y} stroke="var(--border)" strokeWidth={2} />

            {/* Tick marks */}
            {Array.from({ length: 11 }, (_, i) => {
              const val = visMin + (i / 10) * visRange;
              const x = toX(val);
              return (
                <g key={i}>
                  <line x1={x} y1={AXIS_Y} x2={x} y2={AXIS_Y + 5} stroke="var(--border)" strokeWidth={1} />
                  <text x={x} y={AXIS_Y + 16} textAnchor="middle" fontSize={9} fill="var(--text-muted)">
                    {Math.round(val)}
                  </text>
                </g>
              );
            })}

            {/* Mean line */}
            <line
              x1={toX(mean)} y1={8} x2={toX(mean)} y2={AXIS_Y}
              stroke="var(--accent)" strokeWidth={2} strokeDasharray="4,3"
            />
            <text x={toX(mean)} y={6} textAnchor="middle" fontSize={10} fill="var(--accent)" fontWeight={700}>
              μ={mean.toFixed(1)}
            </text>

            {/* Median line */}
            <line
              x1={toX(median)} y1={18} x2={toX(median)} y2={AXIS_Y}
              stroke="var(--green)" strokeWidth={2} strokeDasharray="4,3"
            />
            <text x={toX(median)} y={16} textAnchor="middle" fontSize={10} fill="var(--green)" fontWeight={700}>
              M={median.toFixed(1)}
            </text>

            {/* Data points */}
            {stacked.map((pt, i) => {
              const cx = toX(pt.val);
              const cy = AXIS_Y - DOT_R - pt.stack * (DOT_R * 2 + 2) - 2;
              const color = DOT_COLORS[i % DOT_COLORS.length];
              return (
                <g key={i} onMouseEnter={() => setHovered(pt.val)} onMouseLeave={() => setHovered(null)}>
                  <circle
                    cx={cx} cy={cy} r={DOT_R}
                    fill={color} opacity={0.85}
                    style={{ cursor: 'pointer', transition: 'r 0.1s' }}
                  />
                  {hovered === pt.val && (
                    <text x={cx} y={cy - DOT_R - 3} textAnchor="middle" fontSize={11} fill="var(--text)" fontWeight={700}>
                      {pt.val}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width={20} height={12}><line x1={2} y1={6} x2={18} y2={6} stroke="var(--accent)" strokeWidth={2} strokeDasharray="4,3" /></svg>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mean</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width={20} height={12}><line x1={2} y1={6} x2={18} y2={6} stroke="var(--green)" strokeWidth={2} strokeDasharray="4,3" /></svg>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Median</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats panel */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 140, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          {statRow('Mean', mean.toFixed(2), 'var(--accent)')}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            n = {data.length} values
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 140, background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          {statRow('Median', median.toFixed(2), 'var(--green)')}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Middle value (rank)
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 140, background: 'var(--purple-bg)', border: '1px solid var(--purple-border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          {statRow('Mode', mode.length ? mode.join(', ') : 'none', 'var(--purple)')}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Most frequent value
          </div>
        </div>
      </div>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.25rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Click the buttons to add data points to the distribution. Watch how the mean (blue dashed) and median (green dashed) lines move. Notice what happens when you add the outlier — which measure shifts more dramatically?
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => addPoint(12)}
          style={{ padding: '0.55rem 1.1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          + Normal point (12)
        </button>
        <button
          onClick={() => addPoint(80)}
          style={{ padding: '0.55rem 1.1rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--red-border)', background: 'var(--red-bg)', color: 'var(--red)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          + Outlier (80)
        </button>
        <button
          onClick={handleReset}
          style={{ padding: '0.55rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>

      {hasOutlier && (
        <div className="pal-reveal-in" style={{ background: 'var(--red-bg)', border: '1.5px solid var(--red-border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem', fontSize: '0.85rem', color: 'var(--red-text)', lineHeight: 1.55 }}>
          <strong>Outlier effect visible:</strong> The mean jumped to {mean.toFixed(1)} — far from the main cluster. The median ({median.toFixed(1)}) barely moved. This is exactly why median is used for skewed distributions like revenue or session time.
        </div>
      )}

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'One power user spending $10,000 inflates average revenue per user for everyone. The median user may only spend $20. Always ask which measure of center your experiment metric uses — and whether it can be gamed by extremes.'}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || "When you report A/B test results, choosing mean vs median changes what you're claiming improved. For revenue metrics with heavy tails, the median may better represent the typical user experience."}
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
