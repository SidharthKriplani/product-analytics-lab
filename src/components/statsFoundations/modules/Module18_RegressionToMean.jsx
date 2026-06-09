import { useState, useMemo } from 'react';

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const N_USERS = 20;
const TOP_K = 5;
const SVG_W = 500;
const SVG_H = 200;
const PAD_L = 40;
const PAD_R = 20;
const PAD_T = 20;
const PAD_B = 30;

function buildUsers(seed) {
  const rng = seededRandom(seed);
  return Array.from({ length: N_USERS }, (_, i) => {
    const trueScore = 40 + rng() * 40; // 40–80
    const noise1 = (rng() - 0.5) * 30;
    const noise2 = (rng() - 0.5) * 30;
    const m1 = Math.max(0, Math.min(100, trueScore + noise1));
    const m2 = Math.max(0, Math.min(100, trueScore + noise2));
    return { id: i, trueScore, m1, m2 };
  });
}

function toSvgY(score) {
  // 0 at bottom, 100 at top
  return PAD_T + (SVG_H - PAD_T - PAD_B) * (1 - score / 100);
}

function toSvgX(rank, total) {
  return PAD_L + ((rank) / (total - 1)) * (SVG_W - PAD_L - PAD_R);
}

export function Module18_RegressionToMean({ module, onNext }) {
  const [seed, setSeed] = useState(42);
  const [step, setStep] = useState(0); // 0=initial, 1=measurement1, 2=measurement2

  const users = useMemo(() => buildUsers(seed), [seed]);

  // Sort by m1 descending to assign x positions
  const sortedByM1 = useMemo(() => {
    return [...users].sort((a, b) => b.m1 - a.m1);
  }, [users]);

  const top5Ids = useMemo(() => new Set(sortedByM1.slice(0, TOP_K).map(u => u.id)), [sortedByM1]);

  const top5Avg1 = useMemo(() => {
    const top5 = sortedByM1.slice(0, TOP_K);
    return top5.reduce((s, u) => s + u.m1, 0) / TOP_K;
  }, [sortedByM1]);

  const top5Avg2 = useMemo(() => {
    const top5 = sortedByM1.slice(0, TOP_K);
    return top5.reduce((s, u) => s + u.m2, 0) / TOP_K;
  }, [sortedByM1]);

  const dropPct = (((top5Avg1 - top5Avg2) / top5Avg1) * 100).toFixed(1);

  function handleReset() {
    setSeed(s => s + 100);
    setStep(0);
  }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your top 10 sales reps crushed it last quarter. This quarter, their numbers dropped. The VP blames the new compensation plan. But you pull the data and notice something: the bottom 10 reps from last quarter improved too — without any intervention. Both groups moved toward the average. That\'s regression to the mean, not a management failure.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          Any time you select a group based on an extreme measurement, their next measurement will tend to be less extreme — because the first measurement contained random noise that happened to push them up (or down). Without a control group, you cannot distinguish regression from a real effect. Watch it happen below.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Watch Extreme Performers Regress</div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        <strong>Regression to the mean</strong>: when you select extreme performers based on a noisy first measurement,
        their second measurement tends to be less extreme — not because anything changed, but because the first measurement
        contained random noise that pushed them to the top.
      </p>

      {/* Product framing */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text)' }}>Classic product trap:</strong> You run an onboarding intervention on your worst-performing sales reps.
        They improve next quarter. Was it the training — or regression to the mean? Without a control group, you can't tell.
      </div>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Click "Run simulation" to take a first measurement of 20 users. The top 5 scorers are highlighted in yellow. Then click "Take second measurement" and watch those highlighted users regress toward the group mean — their scores drop on average, not because they got worse, but because random noise inflated them the first time.
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {step === 0 && (
          <button onClick={() => setStep(1)} style={{
            padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)', border: 'none',
            background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
          }}>
            Run simulation — take measurement 1
          </button>
        )}
        {step === 1 && (
          <button onClick={() => setStep(2)} style={{
            padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)', border: 'none',
            background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
          }}>
            Take second measurement →
          </button>
        )}
        {step > 0 && (
          <button onClick={handleReset} style={{
            padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          }}>
            Reset (new noise)
          </button>
        )}
      </div>

      {/* SVG dot plot */}
      {step > 0 && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            {step === 1 ? 'Measurement 1 — top 5 highlighted in yellow' : 'Measurement 1 (circles) vs Measurement 2 (diamonds) — connecting lines show regression'}
          </div>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%">
            {/* Y axis */}
            <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={SVG_H - PAD_B} stroke="var(--border)" strokeWidth={1} />
            {[0, 25, 50, 75, 100].map(v => (
              <g key={v}>
                <line x1={PAD_L - 4} y1={toSvgY(v)} x2={PAD_L} y2={toSvgY(v)} stroke="var(--border)" strokeWidth={1} />
                <text x={PAD_L - 6} y={toSvgY(v) + 3} textAnchor="end" fontSize={8} fill="var(--text-muted)">{v}</text>
              </g>
            ))}
            <text x={10} y={SVG_H / 2} textAnchor="middle" fontSize={8} fill="var(--text-muted)" transform={`rotate(-90, 10, ${SVG_H / 2})`}>Score</text>
            {/* X axis */}
            <line x1={PAD_L} y1={SVG_H - PAD_B} x2={SVG_W - PAD_R} y2={SVG_H - PAD_B} stroke="var(--border)" strokeWidth={1} />
            <text x={(PAD_L + SVG_W - PAD_R) / 2} y={SVG_H - 2} textAnchor="middle" fontSize={8} fill="var(--text-muted)">Users (sorted by measurement 1)</text>

            {/* Connecting lines (step 2) — from m1 position (x-4) to m2 position (x+4) */}
            {step === 2 && sortedByM1.map((u, rank) => {
              const isTop = top5Ids.has(u.id);
              const x = toSvgX(rank, N_USERS);
              return (
                <line
                  key={`line-${u.id}`}
                  x1={x - 4} y1={toSvgY(u.m1)}
                  x2={x + 4} y2={toSvgY(u.m2)}
                  stroke={isTop ? 'var(--yellow)' : 'var(--border)'}
                  strokeWidth={isTop ? 2 : 1}
                  strokeDasharray="3,2"
                  opacity={0.7}
                />
              );
            })}

            {/* Measurement 1 dots — offset left to avoid overlap with m2 */}
            {sortedByM1.map((u, rank) => {
              const isTop = top5Ids.has(u.id);
              const x = toSvgX(rank, N_USERS) - (step === 2 ? 4 : 0);
              const y = toSvgY(u.m1);
              return (
                <circle
                  key={`m1-${u.id}`}
                  cx={x} cy={y} r={isTop ? 6 : 4}
                  fill={isTop ? 'var(--yellow)' : 'var(--surface)'}
                  stroke={isTop ? 'var(--yellow-text)' : 'var(--accent)'}
                  strokeWidth={1.5}
                />
              );
            })}

            {/* Measurement 2 diamonds (step 2) — offset right to separate from m1 */}
            {step === 2 && sortedByM1.map((u, rank) => {
              const isTop = top5Ids.has(u.id);
              const x = toSvgX(rank, N_USERS) + 4;
              const y = toSvgY(u.m2);
              const r = isTop ? 5 : 3;
              return (
                <polygon
                  key={`m2-${u.id}`}
                  points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`}
                  fill={isTop ? 'var(--accent)' : 'var(--surface)'}
                  stroke={isTop ? 'var(--accent)' : 'var(--border)'}
                  strokeWidth={1.5}
                />
              );
            })}

            {/* Legend */}
            <circle cx={PAD_L + 10} cy={PAD_T + 8} r={5} fill="var(--yellow)" stroke="var(--yellow-text)" strokeWidth={1.5} />
            <text x={PAD_L + 19} y={PAD_T + 12} fontSize={9} fill="var(--text-muted)">Meas. 1 (top 5 highlighted)</text>
            {step === 2 && (
              <>
                <polygon points={`${PAD_L + 10},${PAD_T + 22} ${PAD_L + 16},${PAD_T + 28} ${PAD_L + 10},${PAD_T + 34} ${PAD_L + 4},${PAD_T + 28}`}
                  fill="var(--accent)" stroke="var(--accent)" strokeWidth={1.5} />
                <text x={PAD_L + 19} y={PAD_T + 32} fontSize={9} fill="var(--text-muted)">Meas. 2</text>
              </>
            )}
          </svg>
        </div>
      )}

      {/* Stats panel */}
      {step === 2 && (
        <div className="pal-reveal-in" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140, background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Top 5 avg — Meas. 1</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--yellow-text)', fontVariantNumeric: 'tabular-nums' }}>{top5Avg1.toFixed(1)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 140, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Top 5 avg — Meas. 2</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{top5Avg2.toFixed(1)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 140, background: parseFloat(dropPct) > 0 ? 'var(--red-bg)' : 'var(--green-bg)', border: `1.5px solid ${parseFloat(dropPct) > 0 ? 'var(--red-border)' : 'var(--green-border)'}`, borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: parseFloat(dropPct) > 0 ? 'var(--red)' : 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              {parseFloat(dropPct) > 0 ? 'Dropped by' : 'Rose by'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: parseFloat(dropPct) > 0 ? 'var(--red)' : 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
              {Math.abs(parseFloat(dropPct))}%
            </div>
          </div>
        </div>
      )}

      {step === 0 && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Click "Run simulation" to generate 20 users with a true score plus random noise per measurement.
        </div>
      )}

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
          style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
        >
          Next concept →
        </button>
      </div>
    </div>
  );
}
