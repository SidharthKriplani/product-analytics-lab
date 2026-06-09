import { useState, useMemo } from 'react';

var ORIGINAL_DATA = [12, 45, 23, 67, 34, 19, 88, 31, 42, 56];
var ORIGINAL_MEAN = ORIGINAL_DATA.reduce(function (a, b) { return a + b; }, 0) / ORIGINAL_DATA.length;

function resampleOnce(data) {
  var sample = [];
  for (var i = 0; i < data.length; i++) {
    var idx = Math.floor(Math.random() * data.length);
    sample.push(data[idx]);
  }
  return sample;
}

function sampleMean(arr) {
  return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
}

function percentile(sorted, p) {
  var idx = (p / 100) * (sorted.length - 1);
  var lo = Math.floor(idx);
  var hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
}

var MCQ_OPTIONS = [
  { id: 'a', text: 'When you need faster computation than a t-test' },
  { id: 'b', text: 'When the data is normally distributed and sample size is large' },
  { id: 'c', text: 'When the data is skewed or the distribution is unknown and you cannot assume normality' },
  { id: 'd', text: 'Bootstrap is always worse than parametric methods because it adds randomness' },
];
var MCQ_ANSWER = 'c';

export function Module28_Bootstrap({ module, onNext }) {
  var [resamples, setResamples] = useState([]);
  var [lastSample, setLastSample] = useState(null);
  var [picked, setPicked] = useState(null);
  var [revealed, setRevealed] = useState(false);

  function handleResample() {
    var newSample = resampleOnce(ORIGINAL_DATA);
    var mean = sampleMean(newSample);
    setLastSample({ values: newSample, mean: mean });
    setResamples(function (prev) { return prev.concat([mean]); });
  }

  function handleResample20() {
    var newMeans = [];
    for (var i = 0; i < 20; i++) {
      newMeans.push(sampleMean(resampleOnce(ORIGINAL_DATA)));
    }
    var lastBatch = resampleOnce(ORIGINAL_DATA);
    setLastSample({ values: lastBatch, mean: sampleMean(lastBatch) });
    setResamples(function (prev) { return prev.concat(newMeans).concat([sampleMean(lastBatch)]); });
  }

  function handleReset() {
    setResamples([]);
    setLastSample(null);
  }

  var sortedMeans = useMemo(function () {
    var arr = resamples.slice();
    arr.sort(function (a, b) { return a - b; });
    return arr;
  }, [resamples]);

  var ciLow = sortedMeans.length >= 20 ? percentile(sortedMeans, 2.5) : null;
  var ciHigh = sortedMeans.length >= 20 ? percentile(sortedMeans, 97.5) : null;

  // Histogram bins for SVG
  var histogram = useMemo(function () {
    if (resamples.length < 2) return [];
    var min = 10, max = 80;
    var binCount = 14;
    var binWidth = (max - min) / binCount;
    var bins = [];
    for (var i = 0; i < binCount; i++) {
      bins.push({ lo: min + i * binWidth, hi: min + (i + 1) * binWidth, count: 0 });
    }
    for (var j = 0; j < resamples.length; j++) {
      var idx = Math.floor((resamples[j] - min) / binWidth);
      if (idx < 0) idx = 0;
      if (idx >= binCount) idx = binCount - 1;
      bins[idx].count += 1;
    }
    return bins;
  }, [resamples]);

  var maxCount = useMemo(function () {
    var m = 0;
    for (var i = 0; i < histogram.length; i++) { if (histogram[i].count > m) m = histogram[i].count; }
    return Math.max(m, 1);
  }, [histogram]);

  function handleCheck() { setRevealed(true); }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        <strong>Bootstrap resampling</strong> builds a sampling distribution empirically. Instead of assuming your data follows a normal distribution, you repeatedly draw samples <em>with replacement</em> from your actual data and compute the statistic of interest each time. The distribution of those statistics gives you a confidence interval without normality assumptions.
      </p>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        This matters in product analytics because many metrics — revenue per user, session duration, LTV — are heavily right-skewed. A t-test assumes normality of the sampling distribution, which requires large N for skewed data. Bootstrap works with whatever distribution you actually have.
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Click "Resample" to draw a bootstrap sample (with replacement) from the 10 session durations below. Each resample gives a new mean. After 20+ resamples, the histogram fills in and you\'ll see the 95% confidence interval form from the 2.5th and 97.5th percentiles.
      </div>

      {/* Original data */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
          Original data — 10 session durations (minutes)
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {ORIGINAL_DATA.map(function (v, i) {
            return (
              <span key={i} style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
                {v}
              </span>
            );
          })}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          Original mean: <strong style={{ color: 'var(--accent)' }}>{ORIGINAL_MEAN.toFixed(1)}</strong>
        </div>
      </div>

      {/* Resample controls */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={handleResample} style={{ padding: '0.55rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          Resample x1
        </button>
        <button onClick={handleResample20} style={{ padding: '0.55rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          Resample x20
        </button>
        <button onClick={handleReset} style={{ padding: '0.55rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
          Reset
        </button>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {resamples.length} resample{resamples.length !== 1 ? 's' : ''} collected
        </span>
      </div>

      {/* Last resample */}
      {lastSample && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Latest bootstrap sample (with replacement)
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {lastSample.values.map(function (v, i) {
              return (
                <span key={i} style={{ background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--yellow-text)', fontVariantNumeric: 'tabular-nums' }}>
                  {v}
                </span>
              );
            })}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Sample mean: <strong style={{ color: 'var(--yellow)' }}>{lastSample.mean.toFixed(1)}</strong>
          </div>
        </div>
      )}

      {/* Histogram SVG */}
      {resamples.length >= 2 && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Distribution of bootstrap means ({resamples.length} resamples)
          </div>
          <svg viewBox="0 0 500 220" width="100%" style={{ overflow: 'visible' }}>
            <line x1={50} y1={180} x2={450} y2={180} stroke="var(--border)" strokeWidth={1.5} />
            <line x1={50} y1={20} x2={50} y2={180} stroke="var(--border)" strokeWidth={1.5} />

            {histogram.map(function (bin, i) {
              var barH = (bin.count / maxCount) * 150;
              var barW = 400 / histogram.length - 2;
              var x = 50 + i * (400 / histogram.length) + 1;
              return (
                <rect key={i} x={x} y={180 - barH} width={barW} height={barH}
                  fill="var(--yellow)" opacity={0.7} rx={2} />
              );
            })}

            {/* Original mean line */}
            <line x1={50 + ((ORIGINAL_MEAN - 10) / 70) * 400} y1={15} x2={50 + ((ORIGINAL_MEAN - 10) / 70) * 400} y2={180}
              stroke="var(--accent)" strokeWidth={2} strokeDasharray="4,3" />
            <text x={50 + ((ORIGINAL_MEAN - 10) / 70) * 400} y={12} textAnchor="middle" fontSize={9} fill="var(--accent)" fontWeight={600}>
              Original mean ({ORIGINAL_MEAN.toFixed(1)})
            </text>

            {/* CI lines */}
            {ciLow !== null && (
              <g>
                <line x1={50 + ((ciLow - 10) / 70) * 400} y1={15} x2={50 + ((ciLow - 10) / 70) * 400} y2={180}
                  stroke="var(--green)" strokeWidth={2} strokeDasharray="6,3" />
                <line x1={50 + ((ciHigh - 10) / 70) * 400} y1={15} x2={50 + ((ciHigh - 10) / 70) * 400} y2={180}
                  stroke="var(--green)" strokeWidth={2} strokeDasharray="6,3" />
                <text x={50 + ((ciLow - 10) / 70) * 400} y={198} textAnchor="middle" fontSize={8} fill="var(--green)" fontWeight={600}>
                  2.5% ({ciLow.toFixed(1)})
                </text>
                <text x={50 + ((ciHigh - 10) / 70) * 400} y={198} textAnchor="middle" fontSize={8} fill="var(--green)" fontWeight={600}>
                  97.5% ({ciHigh.toFixed(1)})
                </text>
              </g>
            )}

            <text x={250} y={215} textAnchor="middle" fontSize={10} fill="var(--text-muted)" fontWeight={600}>Bootstrap sample mean</text>
          </svg>
        </div>
      )}

      {/* CI readout */}
      {ciLow !== null && (
        <div className="pal-reveal-in" style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
            95% Bootstrap confidence interval
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
            [{ciLow.toFixed(1)}, {ciHigh.toFixed(1)}]
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            The 2.5th and 97.5th percentiles of your {resamples.length} bootstrap means. No normality assumption required.
          </div>
        </div>
      )}

      {/* Framework */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Framework</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7 }}>
          Bootstrap works by treating your sample as a stand-in for the population. You resample with replacement thousands of times, compute your statistic each time, and use the distribution of those statistics for inference. It does not eliminate the need for adequate sample size — it only relaxes the normality assumption. Use bootstrap when your metric is skewed (revenue, LTV, session duration) and the CLT may not have kicked in for your sample size.
        </div>
      </div>

      {/* Quick Check MCQ */}
      <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          Quick Check
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
          When is bootstrap resampling better than a parametric confidence interval?
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
            <strong>{picked === MCQ_ANSWER ? 'Correct!' : 'Not quite.'}</strong> Bootstrap shines when your data is skewed or you cannot assume normality. Revenue per user, for example, is almost always right-skewed with heavy tails. Bootstrap builds the sampling distribution empirically from your actual data, so it works regardless of the shape. It still needs reasonable sample sizes — it just removes the normality requirement.
          </div>
        )}
      </div>

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'Bootstrap builds a sampling distribution from your actual data — no normality assumption needed. Use it for skewed metrics like revenue and LTV where the CLT may not hold for your sample size.'}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Many experimentation platforms use bootstrap or delta method for revenue metrics instead of the standard t-test, precisely because revenue distributions violate normality assumptions.'}
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
