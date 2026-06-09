import { useState, useMemo } from 'react';

var MCQ_OPTIONS = [
  { id: 'a', text: 'Run 6 pairwise t-tests and report any significant result' },
  { id: 'b', text: 'Run one ANOVA test first, then post-hoc pairwise tests only if ANOVA rejects H0' },
  { id: 'c', text: 'Run 3 t-tests comparing each variant to control only' },
  { id: 'd', text: 'Pick the variant with the highest mean and declare it the winner' },
];
var MCQ_ANSWER = 'b';

var GROUP_LABELS = ['A (Control)', 'B', 'C', 'D'];
var GROUP_COLORS = ['var(--accent)', 'var(--green)', 'var(--red)', 'var(--purple)'];
var GROUP_N = 30;

function normalPDF(x, mean, sd) {
  var z = (x - mean) / sd;
  return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
}

function fPValue(f, df1, df2) {
  // Approximation using the regularized incomplete beta function approach
  if (f <= 0) return 1;
  var x = df2 / (df2 + df1 * f);
  // Simple numerical integration of F-distribution tail
  var steps = 500;
  var maxF = Math.max(f * 3, 20);
  var dx = (maxF - f) / steps;
  var area = 0;
  for (var i = 0; i < steps; i++) {
    var fVal = f + i * dx + dx / 2;
    // F-distribution PDF approximation
    var logPdf = ((df1 / 2) * Math.log(df1) + (df2 / 2) * Math.log(df2)
      + ((df1 / 2 - 1) * Math.log(fVal))
      - ((df1 + df2) / 2) * Math.log(df2 + df1 * fVal));
    // Subtract log Beta(df1/2, df2/2) approximation
    logPdf -= lnBeta(df1 / 2, df2 / 2);
    area += Math.exp(logPdf) * dx;
  }
  return Math.min(1, Math.max(0, area));
}

function lnBeta(a, b) {
  return lnGamma(a) + lnGamma(b) - lnGamma(a + b);
}

function lnGamma(z) {
  // Stirling approximation for ln(Gamma(z))
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  z -= 1;
  var coeffs = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  var x = 1.000000000190015;
  for (var i = 0; i < 6; i++) {
    x += coeffs[i] / (z + 1 + i);
  }
  var t = z + 5.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

export function Module31_ANOVA({ module, onNext }) {
  var [meanA, setMeanA] = useState(50);
  var [meanB, setMeanB] = useState(53);
  var [meanC, setMeanC] = useState(48);
  var [meanD, setMeanD] = useState(55);
  var [sd, setSd] = useState(10);
  var [picked, setPicked] = useState(null);
  var [revealed, setRevealed] = useState(false);

  var means = [meanA, meanB, meanC, meanD];
  var grandMean = (meanA + meanB + meanC + meanD) / 4;

  var ssb = useMemo(function () {
    var sum = 0;
    for (var i = 0; i < 4; i++) {
      sum += GROUP_N * Math.pow(means[i] - grandMean, 2);
    }
    return sum;
  }, [means, grandMean]);

  var ssw = useMemo(function () {
    return 4 * (GROUP_N - 1) * sd * sd;
  }, [sd]);

  var dfBetween = 3;
  var dfWithin = 4 * (GROUP_N - 1);
  var msb = ssb / dfBetween;
  var msw = ssw / dfWithin;
  var fStat = msw > 0 ? msb / msw : 0;
  var pValue = useMemo(function () { return fPValue(fStat, dfBetween, dfWithin); }, [fStat]);
  var significant = pValue < 0.05;

  // Generate bell curve points for SVG
  var curveData = useMemo(function () {
    var groups = [];
    var minX = Math.min.apply(null, means) - 3 * sd;
    var maxX = Math.max.apply(null, means) + 3 * sd;
    for (var g = 0; g < 4; g++) {
      var pts = [];
      for (var i = 0; i <= 80; i++) {
        var x = minX + (i / 80) * (maxX - minX);
        var y = normalPDF(x, means[g], sd);
        pts.push({ x: x, y: y });
      }
      groups.push(pts);
    }
    return { groups: groups, minX: minX, maxX: maxX };
  }, [means, sd]);

  var maxY = useMemo(function () {
    var m = 0;
    curveData.groups.forEach(function (pts) {
      pts.forEach(function (pt) { if (pt.y > m) m = pt.y; });
    });
    return m;
  }, [curveData]);

  function handleCheck() { setRevealed(true); }

  function meanSlider(label, value, setter, color) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: color, minWidth: 75 }}>{label}</span>
        <input
          type="range" min={30} max={70} step={1}
          value={value}
          onChange={function (e) { setter(parseInt(e.target.value)); }}
          style={{ flex: 1, accentColor: color }}
        />
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: color, minWidth: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        You\'re comparing 4 different onboarding flows (A, B, C, D) and want to know if any of them performs differently. Running all 6 pairwise t-tests inflates your false positive rate from 5% to roughly 26%. <strong>ANOVA</strong> (Analysis of Variance) solves this by testing all groups at once with a single F-test.
      </p>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        The key insight is that ANOVA decomposes total variance into <em>between-group</em> variance (do the group means differ?) and <em>within-group</em> variance (how noisy is each group?). If between-group variance is large relative to within-group variance, at least one group is genuinely different.
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Adjust the group means and shared standard deviation. Watch how the F-statistic and p-value change as you separate or overlap the distributions. When means are far apart or SD is small, the F-statistic grows and ANOVA detects a difference.
      </div>

      {/* Mean sliders */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Group means (n = {GROUP_N} per group)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {meanSlider('A (Control)', meanA, setMeanA, GROUP_COLORS[0])}
          {meanSlider('B', meanB, setMeanB, GROUP_COLORS[1])}
          {meanSlider('C', meanC, setMeanC, GROUP_COLORS[2])}
          {meanSlider('D', meanD, setMeanD, GROUP_COLORS[3])}
        </div>
        <div style={{ marginTop: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: 75 }}>Shared SD</span>
            <input
              type="range" min={3} max={25} step={1}
              value={sd}
              onChange={function (e) { setSd(parseInt(e.target.value)); }}
              style={{ flex: 1, accentColor: 'var(--yellow)' }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--yellow)', minWidth: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {sd}
            </span>
          </div>
        </div>
      </div>

      {/* Result banner */}
      <div style={{
        background: significant ? 'var(--green-bg)' : 'var(--red-bg)',
        border: '2px solid ' + (significant ? 'var(--green-border)' : 'var(--red-border)'),
        borderRadius: 'var(--radius)', padding: '0.85rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: significant ? 'var(--green)' : 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
            {significant ? 'At least one group differs (reject H0)' : 'No significant difference (fail to reject H0)'}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: significant ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            F = {fStat.toFixed(2)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            p = {pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            SSB = {ssb.toFixed(0)} | SSW = {ssw.toFixed(0)} | MSB/MSW = {fStat.toFixed(2)}
          </div>
        </div>
      </div>

      {/* SVG distributions */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Group distributions
        </div>
        <svg viewBox="0 0 500 200" width="100%" style={{ overflow: 'visible' }}>
          <line x1={40} y1={170} x2={460} y2={170} stroke="var(--border)" strokeWidth={1.5} />
          <line x1={40} y1={20} x2={40} y2={170} stroke="var(--border)" strokeWidth={1.5} />

          {curveData.groups.map(function (pts, g) {
            var pathStr = pts.map(function (pt, i) {
              var sx = 40 + ((pt.x - curveData.minX) / (curveData.maxX - curveData.minX)) * 420;
              var sy = 170 - (pt.y / (maxY * 1.15)) * 145;
              return (i === 0 ? 'M' : 'L') + sx.toFixed(1) + ',' + sy.toFixed(1);
            }).join(' ');
            return (
              <path key={g} d={pathStr} fill="none" stroke={GROUP_COLORS[g]} strokeWidth={2.5} opacity={0.75} />
            );
          })}

          {/* Grand mean line */}
          {(function () {
            var gmX = 40 + ((grandMean - curveData.minX) / (curveData.maxX - curveData.minX)) * 420;
            return (
              <g>
                <line x1={gmX} y1={20} x2={gmX} y2={170} stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
                <text x={gmX} y={188} textAnchor="middle" fontSize={9} fill="var(--text-muted)" fontWeight={600}>Grand mean: {grandMean.toFixed(1)}</text>
              </g>
            );
          })()}

          {/* Legend */}
          {GROUP_LABELS.map(function (label, i) {
            return (
              <g key={'leg' + i}>
                <line x1={50 + i * 110} y1={15} x2={65 + i * 110} y2={15} stroke={GROUP_COLORS[i]} strokeWidth={2.5} />
                <text x={70 + i * 110} y={18} fontSize={9} fill={GROUP_COLORS[i]} fontWeight={600}>{label}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Framework */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Framework</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7 }}>
          One-way ANOVA partitions total variance into SSB (between groups) and SSW (within groups). The F-statistic is the ratio of mean squares: F = MSB / MSW = (SSB / df_between) / (SSW / df_within). A large F means the group means are spread further apart than you would expect from random noise alone. If ANOVA rejects H0, use post-hoc tests (Tukey HSD or Bonferroni-corrected pairwise comparisons) to identify which specific pairs differ.
        </div>
      </div>

      {/* Quick Check MCQ */}
      <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          Quick Check
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
          You have 3 variants and 1 control in an A/B/C/D test. What is the correct analysis approach?
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
            <strong>{picked === MCQ_ANSWER ? 'Correct!' : 'Not quite.'}</strong> ANOVA first tests the omnibus null hypothesis that all group means are equal. Only if ANOVA rejects H0 do you proceed to post-hoc pairwise comparisons (like Tukey HSD). Running 6 t-tests directly inflates the family-wise error rate from 5% to about 26%. Option C (3 tests vs control) still inflates to roughly 14%.
          </div>
        )}
      </div>

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'ANOVA tests whether any group differs from the rest using a single F-test, avoiding the inflated false positive rate of multiple pairwise t-tests. Post-hoc tests then pinpoint which pairs differ — but only after ANOVA rejects the null.'}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Multi-variant A/B tests are common in product experimentation. ANOVA is the correct first step before declaring any variant a winner — it controls the family-wise error rate that pairwise comparisons inflate.'}
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
