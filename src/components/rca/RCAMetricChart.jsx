import { RCA_CHART_DATA } from '../../data/rcaChartData.js';

// ─── Pure SVG metric anomaly sparkline ────────────────────────────────────────
// No Recharts dependency — hand-coded SVG for precise control and tiny weight.
// Pre-anomaly segment = teal, post-anomaly = red, dashed vertical marker,
// light red shading over anomaly zone, y-axis reference values.

export function RCAMetricChart({ caseId }) {
  const cfg = RCA_CHART_DATA[caseId];
  if (!cfg) return null;

  const { metric, unit, direction, data, anomalyIndex } = cfg;
  const n = data.length;
  const values = data.map(d => d.v);

  // Y range with 18% padding so the anomaly looks dramatic
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const range  = rawMax - rawMin || rawMax * 0.1 || 1;
  const pad    = range * 0.18;
  const yMin   = rawMin - pad;
  const yMax   = rawMax + pad;

  // SVG coordinate system
  const VW = 480;  // viewBox width
  const VH = 90;   // viewBox height
  const L  = 38;   // left margin (y-axis values)
  const R  = 8;    // right margin
  const T  = 8;    // top margin
  const B  = 22;   // bottom margin (x labels)
  const PW = VW - L - R;   // plot width
  const PH = VH - T - B;   // plot height

  function xOf(i)  { return L + (i / (n - 1)) * PW; }
  function yOf(v)  { return T + PH - ((v - yMin) / (yMax - yMin)) * PH; }

  // Path helpers
  function pts(slice, offset = 0) {
    return slice.map((d, i) => `${i === 0 ? 'M' : 'L'}${xOf(offset + i).toFixed(1)} ${yOf(d.v).toFixed(1)}`).join(' ');
  }

  const preSlice  = data.slice(0, anomalyIndex + 1);
  const postSlice = data.slice(anomalyIndex);

  const anomalyX = xOf(anomalyIndex);
  const badColor  = "var(--red)";
  const goodColor = "var(--teal)";

  // Y-axis label formatting
  function fmt(v) {
    if (unit === '$') return '$' + v.toFixed(3).replace(/\.?0+$/, '');
    if (Math.abs(v) >= 100) return v.toFixed(0) + unit;
    if (Math.abs(v) < 1)   return v.toFixed(2) + unit;
    return v.toFixed(1) + unit;
  }

  const firstVal = values[0];
  const lastVal  = values[n - 1];
  // which is better/worse
  const goodVal  = direction === 'down' ? firstVal : lastVal;
  const badVal   = direction === 'down' ? lastVal  : firstVal;

  return (
    <div style={{ marginBottom: '0.8rem' }}>
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '0.2rem',
      }}>
        <span style={{
          fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.09em', color: 'var(--text-muted)',
        }}>
          {metric}
        </span>
        <span style={{
          fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.04em',
          color: 'var(--red)',
          background: 'var(--red-bg)',
          border: '1px solid var(--red-border)',
          borderRadius: '4px',
          padding: '0.1rem 0.45rem',
        }}>
          {direction === 'up' ? '↑ Spike detected' : '↓ Drop detected'}
        </span>
      </div>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ width: '100%', height: '88px', display: 'block', overflow: 'visible' }}
        aria-label={`${metric} anomaly chart`}
      >
        {/* Anomaly shaded zone */}
        <rect
          x={anomalyX}
          y={T}
          width={xOf(n - 1) - anomalyX}
          height={PH}
          fill={badColor}
          fillOpacity="0.07"
        />

        {/* Anomaly vertical marker */}
        <line
          x1={anomalyX} y1={T - 2}
          x2={anomalyX} y2={T + PH}
          stroke={badColor}
          strokeWidth="1.5"
          strokeDasharray="3 2.5"
          strokeLinecap="round"
          opacity="0.65"
        />

        {/* Pre-anomaly line (teal) */}
        {preSlice.length > 1 && (
          <path
            d={pts(preSlice, 0)}
            stroke={goodColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Post-anomaly line (red) */}
        {postSlice.length > 1 && (
          <path
            d={pts(postSlice, anomalyIndex)}
            stroke={badColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Dots */}
        {data.map((d, i) => {
          const isAnomaly = i >= anomalyIndex;
          const isKey     = i === 0 || i === anomalyIndex || i === n - 1;
          return (
            <circle
              key={i}
              cx={xOf(i)}
              cy={yOf(d.v)}
              r={isKey ? 3.5 : 2}
              fill={isAnomaly ? badColor : goodColor}
              fillOpacity={isKey ? 1 : 0.6}
            />
          );
        })}

        {/* X-axis labels — skip crowded ones */}
        {data.map((d, i) => {
          // always show first, anomaly, last; skip middle ones if n > 7
          const show = i === 0 || i === anomalyIndex || i === n - 1 ||
                       (n <= 8) ||
                       (n <= 10 && i % 2 === 0);
          if (!show) return null;
          return (
            <text
              key={i}
              x={xOf(i)}
              y={VH - 4}
              textAnchor="middle"
              fontSize="8.5"
              fill="var(--text-muted)"
              fillOpacity="0.75"
            >
              {d.label}
            </text>
          );
        })}

        {/* Y-axis: good value (first) in teal, bad value (last) in red */}
        <text
          x={L - 3}
          y={yOf(goodVal) + 3}
          textAnchor="end"
          fontSize="8.5"
          fill={goodColor}
          fillOpacity="0.9"
        >
          {fmt(goodVal)}
        </text>
        {/* Only render bad label if not too close to good label */}
        {Math.abs(yOf(badVal) - yOf(goodVal)) > 12 && (
          <text
            x={L - 3}
            y={yOf(badVal) + 3}
            textAnchor="end"
            fontSize="8.5"
            fill={badColor}
            fillOpacity="0.9"
          >
            {fmt(badVal)}
          </text>
        )}
      </svg>
    </div>
  );
}
