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

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

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

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          You're running a multivariate test with four checkout variants — A, B, C, and D. You want to know: do the four variants produce different conversion rates? The naive approach: run pairwise t-tests. A vs B. A vs C. A vs D. B vs C. B vs D. C vs D. Six tests. At α = 0.05, the probability of at least one false positive across six tests is 1 − 0.95^6 ≈ 26%.
        </p>
        <p style={prose}>
          What you need is a single test that asks: do any of these group means differ, as a global question, without running a separate test for every pair? That's <strong style={{ color: 'var(--text)' }}>Analysis of Variance — ANOVA</strong>.
        </p>
        <p style={prose}>
          ANOVA's logic: all variation in your metric data has two sources. <strong style={{ color: 'var(--text)' }}>Between-group variance</strong>: users in variant A behave differently from users in variant D because the variants differ — this is the signal you're trying to detect. <strong style={{ color: 'var(--text)' }}>Within-group variance</strong>: even users in the same variant differ from each other — this is the noise. The <strong style={{ color: 'var(--text)' }}>F-statistic</strong> puts these in proportion: F = between-group variance / within-group variance. If groups are genuinely different, F is large and the p-value is small.
        </p>
        <p style={prose}>
          What ANOVA doesn't tell you: which specific variants differ. This is a separate question requiring <strong style={{ color: 'var(--text)' }}>post-hoc tests</strong>. Tukey's Honest Significant Difference (HSD) runs pairwise comparisons with adjustment that controls the family-wise error rate. It tells you: D vs A significant, D vs C significant, others not significant. The post-hoc tests are the analysis; the ANOVA is the gate.
        </p>
        <p style={prose}>
          Three assumptions to check: independence (observations independent within and across groups), normality within groups (or large n — CLT applies with n ≥ 30 per group), and equal variances across groups. If group variances differ substantially, use <strong style={{ color: 'var(--text)' }}>Welch's ANOVA</strong>. Two-way ANOVA extends to two factors and their interaction — useful when you suspect the best variant differs by device type or market.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          ANOVA comes back significant (p = 0.03) for your four-variant test. Your PM immediately says "variant D has the highest conversion — it's the winner." What would you do before declaring D the winner?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: F-Statistic Explorer</div>

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
        <svg viewBox="0 0 500 200" width="100%" style={{ maxWidth: 500, display: 'block', margin: '0 auto', overflow: 'visible' }}>
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

      {/* What you should have confirmed */}
      {revealed && (
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          ANOVA significant means at least one pair differs — not that D is significantly better than all others. You'd run Tukey's HSD to determine which pairs actually differ. D might be significantly better than A and C, but not significantly better than B. Or D might be the best but not significantly better than any individual variant — just far from the average of all four combined. The post-hoc tests are the analysis; the ANOVA is the gate.
        </p>
      </div>
      )}

      {/* ── Analyst Move ── */}
      {revealed && (
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Whenever you're comparing more than two groups, use ANOVA rather than pairwise t-tests as the first step. ANOVA provides the omnibus test that controls the family-wise error rate for the "any difference" question. Post-hoc tests handle the "which specific pairs differ" question with appropriate correction. This is the correct two-step procedure, not optional.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Use two-way ANOVA when you have a hypothesis about interaction effects. "Does the checkout flow change work differently for mobile vs. desktop?" is an interaction hypothesis. If you only run separate ANOVAs for mobile and desktop, you can't formally test the interaction. Two-way ANOVA gives you the interaction term directly and with correct error rate control.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> When ANOVA comes back non-significant, report this as "no evidence that variants differ" — not "all variants are equal." Non-significance is not evidence of equivalence, especially in underpowered studies. Report the power of the ANOVA test alongside the result: what minimum mean difference would this study have detected at 80% power? If that minimum is 5pp but the variants differ by 2pp, the test was too weak to detect a real and meaningful difference.</p>
        </div>
      </div>
      )}

      {/* ── Connection ── */}
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
          style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
        >
          Next concept →
        </button>
      </div>
    </div>
  );
}
