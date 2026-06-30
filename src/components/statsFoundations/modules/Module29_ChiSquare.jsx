import { useState, useMemo } from 'react';

function chiSquarePDF(x, df) {
  if (x <= 0) return 0;
  var k = df / 2;
  return Math.pow(x, k - 1) * Math.exp(-x / 2) / (Math.pow(2, k) * gammaFn(k));
}

function gammaFn(n) {
  if (n === 1) return 1;
  if (n === 0.5) return Math.sqrt(Math.PI);
  return (n - 1) * gammaFn(n - 1);
}

function chiSquarePValue(x2, df) {
  if (x2 <= 0) return 1;
  var steps = 1000;
  var upper = Math.max(x2, 50);
  var dx = upper / steps;
  var area = 0;
  for (var i = 0; i < steps; i++) {
    var xVal = x2 + i * dx + dx / 2;
    area += chiSquarePDF(xVal, df) * dx;
  }
  return Math.min(1, Math.max(0, area));
}

var MCQ_OPTIONS = [
  { id: 'a', text: 'It tests whether the mean difference between two groups is significant' },
  { id: 'b', text: 'It tests whether the observed assignment ratio matches the expected ratio — a mismatch signals a bug in the randomization' },
  { id: 'c', text: 'It measures the effect size of the experiment' },
  { id: 'd', text: 'It calculates the required sample size for the experiment' },
];
var MCQ_ANSWER = 'b';

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module29_ChiSquare({ module, onNext }) {
  var [cellA, setCellA] = useState(120);
  var [cellB, setCellB] = useState(80);
  var [cellC, setCellC] = useState(90);
  var [cellD, setCellD] = useState(110);
  var [picked, setPicked] = useState(null);
  var [revealed, setRevealed] = useState(false);

  var total = cellA + cellB + cellC + cellD;
  var rowTotals = [cellA + cellB, cellC + cellD];
  var colTotals = [cellA + cellC, cellB + cellD];

  var expected = useMemo(function () {
    if (total === 0) return [[0, 0], [0, 0]];
    return [
      [rowTotals[0] * colTotals[0] / total, rowTotals[0] * colTotals[1] / total],
      [rowTotals[1] * colTotals[0] / total, rowTotals[1] * colTotals[1] / total],
    ];
  }, [cellA, cellB, cellC, cellD, total, rowTotals, colTotals]);

  var observed = [[cellA, cellB], [cellC, cellD]];

  var cellChi = useMemo(function () {
    var cells = [];
    for (var r = 0; r < 2; r++) {
      var row = [];
      for (var c = 0; c < 2; c++) {
        var e = expected[r][c];
        var o = observed[r][c];
        row.push(e > 0 ? Math.pow(o - e, 2) / e : 0);
      }
      cells.push(row);
    }
    return cells;
  }, [expected, observed]);

  var chiSq = cellChi[0][0] + cellChi[0][1] + cellChi[1][0] + cellChi[1][1];
  var df = 1;
  var pValue = useMemo(function () { return chiSquarePValue(chiSq, df); }, [chiSq]);
  var significant = pValue < 0.05;

  // SVG curve points for chi-square distribution
  var curvePoints = useMemo(function () {
    var pts = [];
    var maxX = 15;
    var steps = 100;
    for (var i = 0; i <= steps; i++) {
      var x = (i / steps) * maxX;
      var y = chiSquarePDF(x, df);
      pts.push((50 + (x / maxX) * 380) + ',' + (160 - Math.min(y, 2) * 70));
    }
    return pts.join(' ');
  }, []);

  var statX = 50 + (Math.min(chiSq, 15) / 15) * 380;

  function handleInput(setter) {
    return function (e) {
      var val = parseInt(e.target.value);
      if (!isNaN(val) && val >= 0 && val <= 9999) setter(val);
    };
  }

  function handleCheck() { setRevealed(true); }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          The statistical tools we've built — t-tests, confidence intervals, SE, the CLT — are built around comparing means: numerical outcomes where averages make sense. Many product outcomes are categorical. A user converts or doesn't. They choose free, basic, or pro. Their session ends in purchase, save-for-later, or abandonment. For these, you can't compute a mean. You can only count proportions in each category.
        </p>
        <p style={prose}>
          The question is: do those proportions differ between groups in a way that's unlikely to be chance? If your treatment and control groups show 32% mobile vs. 30% mobile — is that a real difference or sampling noise? If plan choice is (free: 60%, basic: 30%, pro: 10%) in control and (free: 52%, basic: 33%, pro: 15%) in treatment — is the entire distribution shifted?
        </p>
        <p style={prose}>
          The chi-square test answers this for categorical data. Under H₀ (no association), you can compute the expected counts in each cell if the two categorical variables were truly independent. The chi-square statistic measures how far the observed counts are from these expected counts: <strong style={{ color: 'var(--text)' }}>χ² = Σ (observed − expected)² / expected</strong>. If observed counts are close to expected, χ² is small. If they diverge substantially, χ² is large.
        </p>
        <p style={prose}>
          Two common uses: <strong style={{ color: 'var(--text)' }}>test of independence</strong> (does one categorical variable depend on another? — build a contingency table and compute χ²) and <strong style={{ color: 'var(--text)' }}>goodness of fit</strong> (does the observed distribution match a known expected distribution?). One assumption: expected cell counts should be ≥ 5 in most cells. If categories are sparse, use Fisher's exact test instead.
        </p>
        <p style={prose}>
          Chi-square tells you there's an association but not how strong. Report <strong style={{ color: 'var(--text)' }}>Cramér's V</strong> alongside: V = √(χ²/n × min(rows-1, cols-1)). V ranges 0–1. Small: V less than 0.1. Medium: 0.3. Large: 0.5+.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Your chi-square test comes back p = 0.02 for the association between device type and conversion. You know device type and conversion are associated. What three follow-up questions would you ask before reporting this as a finding?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Chi-Square Calculator</div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Enter observed counts in the 2x2 table (e.g., clicked/didn't click by variant A/B). Watch the expected values, chi-square statistic, and p-value update live. Try entering counts that are clearly imbalanced (like 150/50/50/150) vs balanced (100/100/100/100) to see the difference.
      </div>

      {/* 2x2 input table */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Observed counts (enter values)
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 420 }}>
            <thead>
              <tr>
                <th style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left' }}></th>
                <th style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, textAlign: 'center' }}>Clicked</th>
                <th style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, textAlign: 'center' }}>Did not click</th>
                <th style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0.5rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--yellow)' }}>Variant A</td>
                <td style={{ padding: '0.3rem', textAlign: 'center' }}>
                  <input type="number" value={cellA} onChange={handleInput(setCellA)} style={{ width: 70, padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 700, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }} />
                </td>
                <td style={{ padding: '0.3rem', textAlign: 'center' }}>
                  <input type="number" value={cellB} onChange={handleInput(setCellB)} style={{ width: 70, padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 700, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }} />
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{rowTotals[0]}</td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--green)' }}>Variant B</td>
                <td style={{ padding: '0.3rem', textAlign: 'center' }}>
                  <input type="number" value={cellC} onChange={handleInput(setCellC)} style={{ width: 70, padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 700, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }} />
                </td>
                <td style={{ padding: '0.3rem', textAlign: 'center' }}>
                  <input type="number" value={cellD} onChange={handleInput(setCellD)} style={{ width: 70, padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 700, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }} />
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{rowTotals[1]}</td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Total</td>
                <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{colTotals[0]}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{colTotals[1]}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>{total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Expected values + cell contributions */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Expected values (row total x col total / grand total)
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 2 }}>
            E(A, clicked) = {expected[0][0].toFixed(1)}<br />
            E(A, no click) = {expected[0][1].toFixed(1)}<br />
            E(B, clicked) = {expected[1][0].toFixed(1)}<br />
            E(B, no click) = {expected[1][1].toFixed(1)}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 200, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Cell contributions: (O - E)squared / E
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 2 }}>
            Cell A,clicked = {cellChi[0][0].toFixed(3)}<br />
            Cell A,no click = {cellChi[0][1].toFixed(3)}<br />
            Cell B,clicked = {cellChi[1][0].toFixed(3)}<br />
            Cell B,no click = {cellChi[1][1].toFixed(3)}
          </div>
        </div>
      </div>

      {/* Result banner */}
      <div style={{
        background: significant ? 'var(--red-bg)' : 'var(--green-bg)',
        border: '2px solid ' + (significant ? 'var(--red-border)' : 'var(--green-border)'),
        borderRadius: 'var(--radius)', padding: '0.85rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: significant ? 'var(--red)' : 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
            {significant ? 'Variables are dependent (reject H0)' : 'No evidence of dependence (fail to reject H0)'}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: significant ? 'var(--red)' : 'var(--green)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            X2 = {chiSq.toFixed(3)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            df = {df}, p = {pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Critical value at alpha = 0.05: 3.841
          </div>
        </div>
      </div>

      {/* Chi-square distribution SVG */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Chi-square distribution (df = 1)
        </div>
        <svg viewBox="0 0 470 190" width="100%" style={{ overflow: 'visible' }}>
          <line x1={50} y1={160} x2={430} y2={160} stroke="var(--border)" strokeWidth={1.5} />
          <line x1={50} y1={20} x2={50} y2={160} stroke="var(--border)" strokeWidth={1.5} />

          <polyline points={curvePoints} fill="none" stroke="var(--yellow)" strokeWidth={2.5} opacity={0.8} />

          {/* Critical value line at 3.841 */}
          <line x1={50 + (3.841 / 15) * 380} y1={20} x2={50 + (3.841 / 15) * 380} y2={160}
            stroke="var(--text-muted)" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
          <text x={50 + (3.841 / 15) * 380} y={175} textAnchor="middle" fontSize={8} fill="var(--text-muted)" fontWeight={600}>
            3.841 (critical)
          </text>

          {/* Test statistic marker */}
          {chiSq > 0 && (
            <g>
              <line x1={statX} y1={20} x2={statX} y2={160}
                stroke={significant ? 'var(--red)' : 'var(--green)'} strokeWidth={2} />
              <circle cx={statX} cy={25} r={5}
                fill={significant ? 'var(--red)' : 'var(--green)'} />
              <text x={statX} y={15} textAnchor="middle" fontSize={9}
                fill={significant ? 'var(--red)' : 'var(--green)'} fontWeight={700}>
                {chiSq.toFixed(2)}
              </text>
            </g>
          )}

          <text x={240} y={188} textAnchor="middle" fontSize={10} fill="var(--text-muted)" fontWeight={600}>Chi-square statistic</text>
        </svg>
      </div>

      {/* Framework */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Framework</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7 }}>
          The chi-square test of independence compares observed cell counts to what you would expect if rows and columns were independent. The formula is X2 = sum of (O - E)squared / E across all cells. With df = (rows - 1)(cols - 1), you compare X2 to the critical value. For a 2x2 table at alpha = 0.05, the threshold is 3.841. If X2 exceeds it, you conclude the variables are not independent.
        </div>
      </div>

      {/* Quick Check MCQ */}
      <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          Quick Check
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
          How does chi-square connect to SRM (Sample Ratio Mismatch) detection in A/B testing?
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
            <strong>{picked === MCQ_ANSWER ? 'Correct!' : 'Not quite.'}</strong> SRM uses a chi-square goodness-of-fit test to check whether the observed split (e.g., 5100 vs 4900) matches the expected split (5000 vs 5000). A significant chi-square means the randomization likely has a bug — the test results cannot be trusted until the root cause is found and fixed.
          </div>
        )}
      </div>

      {/* What you should have confirmed */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Three questions — (1) What's the effect size? (Cramér's V — is this a weak or strong association?) (2) Which cells drive it? (Standardized residuals — is it specifically mobile-non-conversion, or spread across all cells?) (3) Is this causal or confounded? (Device type might correlate with intent, market, or acquisition channel — all confounders. The association doesn't mean device type causes lower conversion.) Chi-square gives you statistical evidence; interpretation requires all three.
        </p>
      </div>

      {/* ── Analyst Move ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Use chi-square to test whether an experiment changed the distribution of a categorical outcome, not just a binary conversion. If you're testing a pricing page, look at the full plan choice distribution — not just "did free-to-paid conversion change?" The distribution shift might show the lift is coming from free→basic rather than free→pro, which is a different business story.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> When running chi-square on small samples, check expected cell counts. If any cell has an expected count below 5, report Fisher's exact test instead. This happens more often than you'd expect for multi-level categorical outcomes (5 device types × 3 plan choices = 15 cells; with n = 300, some cells will be sparse).</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Chi-square significance is not the same as marketing significance. A significant shift in device type distribution between two cohorts might tell you your ad targeting changed — not that your product changed. Always build the interpretation from the chi-square result, not just the p-value. What mechanism would cause this categorical pattern? Does that mechanism match the intervention you ran?</p>
        </div>
      </div>

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Every experimentation platform runs a chi-square SRM check before reporting results. If the assignment ratio is off, the entire experiment is compromised regardless of what the metric results show.'}
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
