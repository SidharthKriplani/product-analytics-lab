import { useState, useMemo, useRef, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

function seededRandom(seed) {
  let s = seed;
  return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

// Right-skewed distribution using a seeded rng
function skewedValue(rng) {
  // Mixture: 85% from [1,30], 15% from [30,100]
  const u = rng();
  if (u < 0.85) {
    // exponential-like in [1,30]
    return 1 + Math.abs(-Math.log(1 - rng() * 0.95) * 8);
  } else {
    return 30 + rng() * 70;
  }
}

const N_POP = 300;

// Pre-compute population
const rngX = seededRandom(42);
const rngY = seededRandom(99);
const rngV = seededRandom(7);

const POPULATION = Array.from({ length: N_POP }, (_, i) => ({
  id: i,
  x: 20 + rngX() * 560,
  y: 15 + rngY() * 170,
  value: Math.min(100, Math.max(1, skewedValue(rngV))),
}));

const POP_MEAN = POPULATION.reduce((s, d) => s + d.value, 0) / N_POP;

function buildHistogram(means, binCount = 20) {
  if (means.length === 0) return [];
  const lo = POP_MEAN - 25, hi = POP_MEAN + 25;
  const binW = (hi - lo) / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    label: (lo + i * binW + binW / 2).toFixed(1),
    midpoint: lo + i * binW + binW / 2,
    count: 0,
  }));
  means.forEach(m => {
    const idx = Math.min(binCount - 1, Math.max(0, Math.floor((m - lo) / binW)));
    bins[idx].count++;
  });
  return bins;
}

const SPEED_MS = { slow: 600, medium: 250, fast: 80 };

export function Module07_Sampling({ module, onNext }) {
  const [sampleSize, setSampleSize] = useState(30);
  const [speed, setSpeed] = useState('medium');
  const [highlighted, setHighlighted] = useState(new Set());
  const [sampleMeans, setSampleMeans] = useState([]);
  const [lastMean, setLastMean] = useState(null);
  const [running, setRunning] = useState(false);
  const timeoutsRef = useRef([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const pickSample = useCallback(() => {
    const indices = [];
    const pool = [...Array(N_POP).keys()];
    const rng = seededRandom(Date.now() % 100000);
    for (let i = 0; i < sampleSize; i++) {
      const j = Math.floor(rng() * (pool.length - i));
      indices.push(pool[j]);
      [pool[j], pool[pool.length - 1 - i]] = [pool[pool.length - 1 - i], pool[j]];
    }
    const mean = indices.reduce((s, idx) => s + POPULATION[idx].value, 0) / sampleSize;
    return { indices, mean };
  }, [sampleSize]);

  const drawOne = useCallback(() => {
    if (running) return;
    const { indices, mean } = pickSample();
    setHighlighted(new Set(indices));
    setLastMean(mean);
    setSampleMeans(prev => [...prev, mean]);
  }, [running, pickSample]);

  const draw20 = useCallback(() => {
    if (running) return;
    setRunning(true);
    clearTimeouts();
    let count = 0;
    const step = () => {
      if (count >= 20) { setRunning(false); return; }
      const { indices, mean } = pickSample();
      setHighlighted(new Set(indices));
      setLastMean(mean);
      setSampleMeans(prev => [...prev, mean]);
      count++;
      const t = setTimeout(step, SPEED_MS[speed]);
      timeoutsRef.current.push(t);
    };
    step();
  }, [running, pickSample, speed]);

  const reset = () => {
    clearTimeouts();
    setRunning(false);
    setHighlighted(new Set());
    setSampleMeans([]);
    setLastMean(null);
  };

  const histData = useMemo(() => buildHistogram(sampleMeans), [sampleMeans]);
  const maxCount = Math.max(...histData.map(b => b.count), 1);

  const spread = useMemo(() => {
    if (sampleMeans.length < 2) return null;
    const mean = sampleMeans.reduce((a, b) => a + b, 0) / sampleMeans.length;
    const sd = Math.sqrt(sampleMeans.reduce((s, v) => s + (v - mean) ** 2, 0) / sampleMeans.length);
    return sd;
  }, [sampleMeans]);

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          You need to estimate the average daily active usage time for a product with 50 million users. You obviously can\'t query every single user\'s data in real time. So you take a sample — but how large does that sample need to be, and how much will your estimate jump around from sample to sample?
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          Every metric you report in a dashboard is a sample statistic, not the true population value. Understanding sampling variability is what separates analysts who say "the number is 7.3" from analysts who say "the number is 7.3 plus or minus 0.4." Draw repeated samples below to see how sample means scatter around the truth.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Draw Repeated Samples</div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        We can never measure an entire population, so we take a <strong>sample</strong> and compute a statistic like the mean.
        Each sample gives a slightly different mean — but those sample means cluster around the true population mean.
        The spread of those sample means is controlled by your sample size.
      </p>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Set a sample size, then click "Draw 20 Samples" to repeatedly sample from the population. Watch the histogram of sample means build up. Compare results at n=5 versus n=100 — notice how a larger sample size produces a tighter, more bell-shaped distribution of means.
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 200, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Sample size n</label>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{sampleSize}</span>
          </div>
          <input
            type="range" min={5} max={100} step={1}
            value={sampleSize}
            onChange={e => setSampleSize(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>n=5 (wide spread)</span><span>n=100 (tight)</span>
          </div>
        </div>
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>Animation speed</div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['slow', 'medium', 'fast'].map(s => (
              <button key={s} onClick={() => setSpeed(s)} style={{
                padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${speed === s ? 'var(--accent)' : 'var(--border)'}`,
                background: speed === s ? 'var(--accent-bg)' : 'var(--surface)',
                color: speed === s ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              }}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button onClick={drawOne} disabled={running} style={{
          padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-sm)',
          border: '1.5px solid var(--accent)', background: 'var(--accent-bg)',
          color: 'var(--accent)', fontWeight: 700, fontSize: '0.88rem', cursor: running ? 'not-allowed' : 'pointer',
          opacity: running ? 0.5 : 1,
        }}>Draw One Sample</button>
        <button onClick={draw20} disabled={running} style={{
          padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-sm)',
          border: 'none', background: 'var(--accent)', color: '#fff',
          fontWeight: 700, fontSize: '0.88rem', cursor: running ? 'not-allowed' : 'pointer',
          opacity: running ? 0.5 : 1, boxShadow: 'var(--shadow-sm)',
        }}>Draw 20 Samples</button>
        <button onClick={reset} style={{
          padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-sm)',
          border: '1.5px solid var(--border)', background: 'var(--surface)',
          color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
        }}>Reset</button>
        {lastMean !== null && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Last sample mean:</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--yellow)', fontVariantNumeric: 'tabular-nums' }}>x̄ = {lastMean.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Population SVG */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Population (N = 300)</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
            True population mean: μ = <span style={{ color: 'var(--teal)' }}>{POP_MEAN.toFixed(2)}</span>
          </span>
        </div>
        <svg viewBox="0 0 600 200" style={{ width: '100%', overflow: 'visible' }}>
          {POPULATION.map(dot => {
            const isSelected = highlighted.has(dot.id);
            return (
              <circle
                key={dot.id}
                cx={dot.x}
                cy={dot.y}
                r={isSelected ? 5.5 : 3.5}
                fill={isSelected ? 'var(--yellow)' : 'var(--accent)'}
                opacity={isSelected ? 1 : 0.35}
                stroke={isSelected ? '#fff' : 'none'}
                strokeWidth={isSelected ? 1.2 : 0}
                style={{ transition: 'all 0.15s' }}
              />
            );
          })}
        </svg>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
          Yellow dots = current sample (n = {sampleSize})
        </div>
      </div>

      {/* Histogram of sample means */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Distribution of Sample Means ({sampleMeans.length} samples)
          </span>
          {spread !== null && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              SD of sample means: <strong style={{ color: 'var(--purple)', fontVariantNumeric: 'tabular-nums' }}>{spread.toFixed(2)}</strong>
              {sampleSize >= 70 && <span style={{ color: 'var(--green)', marginLeft: '0.5rem' }}>← tightly clustered</span>}
              {sampleSize <= 15 && <span style={{ color: 'var(--red)', marginLeft: '0.5rem' }}>← widely spread</span>}
            </span>
          )}
        </div>
        {sampleMeans.length === 0 ? (
          <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', borderTop: '1px solid var(--border-subtle)' }}>
            Draw samples to see the distribution of means
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={histData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} allowDecimals={false} />
              <Tooltip
                formatter={(v) => [v, 'Count']}
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}
              />
              <ReferenceLine x={POP_MEAN.toFixed(1)} stroke="var(--teal)" strokeDasharray="4 3" strokeWidth={2} label={{ value: 'μ', fill: 'var(--teal)', fontSize: '0.72rem' }} />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {histData.map((entry, i) => (
                  <Cell key={i} fill={Math.abs(entry.midpoint - POP_MEAN) < 1 ? 'var(--teal)' : 'var(--accent)'} opacity={0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        {sampleMeans.length >= 5 && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
            Dashed line = true mean μ = {POP_MEAN.toFixed(2)}. Your sample means cluster around it.
          </div>
        )}
      </div>

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'With n=5, sample means are all over the place. With n=100, they cluster tightly around the true mean. The standard deviation of sample means — called the standard error — shrinks as n grows. This is why larger samples are more reliable.'}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Every A/B test measurement is a sample mean. The reliability of your treatment effect estimate depends on how many users you sampled. Larger n → sample mean closer to the truth → narrower confidence interval → more reliable results.'}
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
