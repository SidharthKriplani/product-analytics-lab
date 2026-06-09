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
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        The <strong>chi-square test</strong> checks whether two categorical variables are independent. It compares what you observed to what you would expect if there were no relationship. The bigger the gap between observed and expected counts, the stronger the evidence that the variables are related.
      </p>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        In product analytics, the most common use is <strong>Sample Ratio Mismatch (SRM) detection</strong>. If you designed a 50/50 A/B test but observed 5,100 vs 4,900, is that random noise or a bug in randomization? Chi-square gives you the answer. Every major experimentation platform runs this check automatically.
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Enter observed counts in the 2x2 table (e.g., clicked/didn\'t click by variant A/B). Watch the expected values, chi-square statistic, and p-value update live. Try entering counts that are clearly imbalanced (like 150/50/50/150) vs balanced (100/100/100/100) to see the difference.
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

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'Chi-square tests whether categorical variables are independent by comparing observed vs expected counts. In experimentation, this is the test behind SRM detection — the first check you run before trusting any A/B test result.'}
        </div>
      </div>

      {/* Connection */}
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
          style={{ padding: '0.7rem 1.75rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
        >
          Next concept →
        </button>
      </div>
    </div>
  );
}
