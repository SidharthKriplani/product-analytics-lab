import { useState, useMemo } from 'react';

var MCQ_OPTIONS = [
  { id: 'a', text: 'A two-sample t-test, because it is the standard for comparing two groups' },
  { id: 'b', text: 'A paired t-test, since each user has a before and after measurement' },
  { id: 'c', text: 'A Mann-Whitney U test, because the data is right-skewed and the t-test normality assumption may not hold' },
  { id: 'd', text: 'An ANOVA test, because you need to compare distributions not just means' },
];
var MCQ_ANSWER = 'c';

function generateDistribution(skewness, n) {
  // Generate deterministic pseudo-random points with controllable skew
  var points = [];
  for (var i = 0; i < n; i++) {
    var t = (i + 0.5) / n;
    // At skewness=1, normal-ish. At skewness=5, heavily right-skewed.
    var base = t * 3;
    var value = Math.exp(base * (0.3 + skewness * 0.15)) * (2 + Math.sin(i * 1.7) * 0.8);
    points.push(Math.round(value * 10) / 10);
  }
  points.sort(function (a, b) { return a - b; });
  return points;
}

function computeHistBins(data, numBins) {
  var min = data[0];
  var max = data[data.length - 1];
  var range = max - min || 1;
  var binWidth = range / numBins;
  var bins = [];
  for (var i = 0; i < numBins; i++) {
    bins.push({ lo: min + i * binWidth, hi: min + (i + 1) * binWidth, count: 0 });
  }
  data.forEach(function (v) {
    var idx = Math.min(Math.floor((v - min) / binWidth), numBins - 1);
    bins[idx].count++;
  });
  return bins;
}

function tTestPValue(skew) {
  // Simulated p-values: as skew increases, t-test becomes less reliable
  // At low skew both tests agree; at high skew t-test misses the effect
  if (skew <= 1.5) return 0.02;
  if (skew <= 2) return 0.04;
  if (skew <= 2.5) return 0.06;
  if (skew <= 3) return 0.08;
  if (skew <= 3.5) return 0.10;
  if (skew <= 4) return 0.12;
  return 0.15;
}

function mannWhitneyPValue(skew) {
  // Mann-Whitney is robust to skew — stays significant
  if (skew <= 1.5) return 0.02;
  if (skew <= 2) return 0.025;
  if (skew <= 2.5) return 0.028;
  if (skew <= 3) return 0.03;
  if (skew <= 3.5) return 0.032;
  if (skew <= 4) return 0.035;
  return 0.038;
}

export function Module32_NonParametric({ module, onNext }) {
  var [skewness, setSkewness] = useState(1);
  var [picked, setPicked] = useState(null);
  var [revealed, setRevealed] = useState(false);

  var data = useMemo(function () { return generateDistribution(skewness, 40); }, [skewness]);
  var bins = useMemo(function () { return computeHistBins(data, 12); }, [data]);
  var maxCount = useMemo(function () {
    var m = 0;
    bins.forEach(function (b) { if (b.count > m) m = b.count; });
    return m || 1;
  }, [bins]);

  var tP = tTestPValue(skewness);
  var mwP = mannWhitneyPValue(skewness);
  var tSig = tP < 0.05;
  var mwSig = mwP < 0.05;
  var disagree = tSig !== mwSig;

  var skewLabel = skewness <= 1.5 ? 'Normal' : skewness <= 3 ? 'Moderate skew' : 'Heavy skew';

  function handleCheck() { setRevealed(true); }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        Your A/B test measures <strong>time-to-purchase</strong>. Most users buy in 2-5 minutes, but some take 45+ minutes. The distribution is wildly right-skewed. The t-test assumes the sampling distribution of the mean is approximately normal — with heavy skew and moderate sample sizes, this assumption can fail, making the t-test unreliable.
      </p>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        <strong>Non-parametric tests</strong> like Mann-Whitney U solve this by ranking the data instead of using raw values. Ranks are immune to skew and outliers — the test asks whether one group\'s values tend to be larger than the other\'s, without assuming any particular distribution shape.
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Drag the skewness slider from normal (1) to heavily skewed (5). Watch how the distribution shape changes and how the t-test and Mann-Whitney U test diverge. With normal data, both agree. With skewed data, the t-test loses power while Mann-Whitney stays reliable.
      </div>

      {/* Skewness slider */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
            Distribution skewness
          </label>
          <span style={{
            fontSize: '1.1rem', fontWeight: 900,
            color: skewness <= 1.5 ? 'var(--green)' : skewness <= 3 ? 'var(--yellow)' : 'var(--red)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {skewness.toFixed(1)} — {skewLabel}
          </span>
        </div>
        <input
          type="range" min={1} max={5} step={0.5}
          value={skewness}
          onChange={function (e) { setSkewness(parseFloat(e.target.value)); }}
          style={{ width: '100%', accentColor: skewness <= 1.5 ? 'var(--green)' : skewness <= 3 ? 'var(--yellow)' : 'var(--red)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          <span>1.0 (normal)</span>
          <span>3.0 (moderate)</span>
          <span>5.0 (heavy skew)</span>
        </div>
      </div>

      {/* Distribution SVG */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Time-to-purchase distribution (n = 40)
        </div>
        <svg viewBox="0 0 500 200" width="100%" style={{ overflow: 'visible' }}>
          <line x1={40} y1={170} x2={460} y2={170} stroke="var(--border)" strokeWidth={1.5} />
          <line x1={40} y1={30} x2={40} y2={170} stroke="var(--border)" strokeWidth={1.5} />

          {bins.map(function (bin, i) {
            var barW = 420 / bins.length - 2;
            var barH = (bin.count / maxCount) * 130;
            var x = 41 + i * (420 / bins.length);
            var barColor = skewness <= 1.5 ? 'var(--green)' : skewness <= 3 ? 'var(--yellow)' : 'var(--red)';
            return (
              <g key={i}>
                <rect
                  x={x} y={170 - barH} width={barW} height={barH}
                  fill={barColor} opacity={0.65}
                  rx={2}
                />
                {bin.count > 0 && (
                  <text x={x + barW / 2} y={165 - barH} textAnchor="middle" fontSize={8} fill="var(--text-muted)" fontWeight={600}>
                    {bin.count}
                  </text>
                )}
              </g>
            );
          })}

          <text x={250} y={192} textAnchor="middle" fontSize={10} fill="var(--text-muted)" fontWeight={600}>Time to purchase (minutes)</text>
          <text x={15} y={100} textAnchor="middle" fontSize={10} fill="var(--text-muted)" fontWeight={600} transform="rotate(-90 15 100)">Count</text>
        </svg>
      </div>

      {/* Test comparison */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 200, background: tSig ? 'var(--green-bg)' : 'var(--red-bg)',
          border: '2px solid ' + (tSig ? 'var(--green-border)' : 'var(--red-border)'),
          borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
            T-test (assumes normality)
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: tSig ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            p = {tP.toFixed(3)}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            {tSig ? 'Significant (p < 0.05)' : 'Not significant (p >= 0.05)'}
          </div>
        </div>

        <div style={{
          flex: 1, minWidth: 200, background: mwSig ? 'var(--green-bg)' : 'var(--red-bg)',
          border: '2px solid ' + (mwSig ? 'var(--green-border)' : 'var(--red-border)'),
          borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
            Mann-Whitney U (rank-based)
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: mwSig ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            p = {mwP.toFixed(3)}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            {mwSig ? 'Significant (p < 0.05)' : 'Not significant (p >= 0.05)'}
          </div>
        </div>
      </div>

      {disagree && (
        <div style={{ background: 'var(--red-bg)', border: '1.5px solid var(--red-border)', borderRadius: 'var(--radius)', padding: '0.85rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Tests disagree
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The t-test says no effect (p = {tP.toFixed(3)}) while Mann-Whitney detects one (p = {mwP.toFixed(3)}). This happens because skewed outliers inflate the t-test\'s variance estimate, reducing its power. The rank-based test is immune to this because it only cares about relative ordering, not absolute values.
          </div>
        </div>
      )}

      {/* Framework */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Framework</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7 }}>
          Non-parametric tests replace raw values with ranks, making them distribution-free. Mann-Whitney U compares two independent groups by asking whether one group\'s ranks tend to be higher. Wilcoxon signed-rank handles paired data (pre/post on the same users). Kruskal-Wallis extends Mann-Whitney to 3+ groups (the non-parametric ANOVA). The trade-off: non-parametric tests have slightly less statistical power when the data really is normal — you pay a small power cost for the robustness.
        </div>
      </div>

      {/* Quick Check MCQ */}
      <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          Quick Check
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
          Your A/B test compares revenue per user. The revenue distribution is heavily right-skewed with a few very high spenders. Which test should you use to compare the two groups?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {MCQ_OPTIONS.map(function (opt) {
            var isSelected = picked === opt.id;
            var isCorrect = opt.id === MCQ_ANSWER;
            var bg = !revealed ? (isSelected ? 'var(--yellow-bg)' : 'var(--surface)') : (isCorrect ? 'var(--green-bg)' : isSelected ? 'var(--red-bg)' : 'var(--surface)');
            var border = !revealed ? (isSelected ? 'var(--yellow-border)' : 'var(--border)') : (isCorrect ? 'var(--green-border)' : isSelected ? 'var(--red-border)' : 'var(--border)');
            return (
              <button
                key={opt.id}
                onClick={function () { if (!revealed) setPicked(opt.id); }}
                style={{ textAlign: 'left', background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', fontSize: '0.85rem', color: 'var(--text)', cursor: revealed ? 'default' : 'pointer', lineHeight: 1.5 }}
              >
                <strong>{opt.id.toUpperCase()}.</strong> {opt.text}
              </button>
            );
          })}
        </div>
        {picked && !revealed && (
          <button onClick={handleCheck} style={{ marginTop: '0.75rem', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Check answer
          </button>
        )}
        {revealed && (
          <div className="pal-reveal-in" style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: picked === MCQ_ANSWER ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (picked === MCQ_ANSWER ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong>{picked === MCQ_ANSWER ? 'Correct!' : 'Not quite.'}</strong> Revenue data is almost always right-skewed with heavy outliers. A t-test\'s power degrades because the extreme values inflate the variance estimate. Mann-Whitney U ranks the values first, so a $10,000 outlier has no more influence than any other data point. It tests whether treatment users\' revenue tends to be higher than control\'s, which is exactly the question you care about.
          </div>
        )}
      </div>

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'When your data is skewed, ordinal, or has outliers, non-parametric tests (Mann-Whitney U, Wilcoxon, Kruskal-Wallis) use ranks instead of raw values. They trade a small amount of power for robustness — and on skewed product data, they often detect effects the t-test misses.'}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Revenue, session duration, and time-to-event metrics are almost always skewed. Knowing when to swap a t-test for Mann-Whitney U is a practical skill every analyst needs when running experiments on these metrics.'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="pal-glow-pulse"
          onClick={onNext}
          style={{ padding: '0.7rem 1.75rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
        >
          Next concept →
        </button>
      </div>
    </div>
  );
}
