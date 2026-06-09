import { useState } from 'react';

// ── Math helpers ────────────────────────────────────────────────────
function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}

function normalCDF(z) {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

function zTest(n1, c1, n2, c2) {
  const p1 = c1 / n1;
  const p2 = c2 / n2;
  const pooled = (c1 + c2) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  if (se === 0) return { z: 0, p: 1, lift: 0, p1, p2 };
  const z = (p2 - p1) / se;
  const p = 2 * (1 - normalCDF(Math.abs(z)));
  const lift = p1 === 0 ? 0 : (p2 - p1) / p1;
  return { z, p, lift, p1, p2 };
}

function diffCI(n1, c1, n2, c2, zVal = 1.96) {
  const p1 = c1 / n1;
  const p2 = c2 / n2;
  const se = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2);
  return [(p2 - p1) - zVal * se, (p2 - p1) + zVal * se];
}

function srmCheck(n1, n2) {
  const total = n1 + n2;
  const expected = total / 2;
  const chi2 = Math.pow(n1 - expected, 2) / expected + Math.pow(n2 - expected, 2) / expected;
  return 1 - (1 - Math.exp(-chi2 / 2));
}

function zForAlpha(alpha) {
  // Two-tailed critical values
  if (alpha <= 0.01) return 2.576;
  if (alpha <= 0.05) return 1.96;
  if (alpha <= 0.10) return 1.645;
  return 1.96;
}

function fmt(n, decimals = 2) {
  return Number(n).toFixed(decimals);
}

function pctFmt(v, decimals = 2) {
  return (v * 100).toFixed(decimals) + '%';
}

// ── Component ───────────────────────────────────────────────────────
export function ABTestInterpreter({ onBack }) {
  const [form, setForm] = useState({
    n1: '',
    c1: '',
    n2: '',
    c2: '',
    alpha: 0.05,
    numMetrics: 1,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setResult(null);
    setError('');
  }

  function interpret() {
    const n1 = parseInt(form.n1, 10);
    const c1 = parseInt(form.c1, 10);
    const n2 = parseInt(form.n2, 10);
    const c2 = parseInt(form.c2, 10);
    const alpha = parseFloat(form.alpha);
    const numMetrics = Math.max(1, parseInt(form.numMetrics, 10) || 1);

    if (isNaN(n1) || isNaN(c1) || isNaN(n2) || isNaN(c2)) {
      setError('Please fill in all four visitor/conversion fields.');
      return;
    }
    if (c1 > n1 || c2 > n2) {
      setError('Conversions cannot exceed visitors.');
      return;
    }
    if (n1 < 1 || n2 < 1) {
      setError('Visitor counts must be at least 1.');
      return;
    }

    const zVal = zForAlpha(alpha);
    const stats = zTest(n1, c1, n2, c2);
    const ci = diffCI(n1, c1, n2, c2, zVal);
    const srmP = srmCheck(n1, n2);
    const hasSRM = srmP < 0.01;
    const isSignificant = stats.p < alpha;
    const positiveEffect = stats.lift > 0;
    const negativeEffect = stats.lift < 0;

    let verdict;
    if (hasSRM) {
      verdict = 'srm';
    } else if (!isSignificant) {
      verdict = 'inconclusive';
    } else if (positiveEffect) {
      verdict = 'ship';
    } else {
      verdict = 'nogo';
    }

    setResult({
      n1, c1, n2, c2, alpha, numMetrics,
      p1: stats.p1, p2: stats.p2,
      z: stats.z, p: stats.p, lift: stats.lift,
      ci, srmP, hasSRM, isSignificant,
      verdict, zVal,
      familyWiseError: 1 - Math.pow(1 - alpha, numMetrics),
      bonferroni: alpha / numMetrics,
    });
  }

  const verdictConfig = {
    ship: {
      icon: '✅',
      label: 'Ship',
      color: 'var(--green)',
      bg: 'var(--green-bg, rgba(34,197,94,0.08))',
      border: 'var(--green-border, rgba(34,197,94,0.25))',
      text: `The treatment shows a statistically significant positive lift at your chosen significance level. No SRM was detected, so the test infrastructure looks sound. You have evidence to ship.`,
    },
    nogo: {
      icon: '❌',
      label: 'Do Not Ship',
      color: 'var(--red, #ef4444)',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.25)',
      text: `The treatment shows a statistically significant negative effect — the treatment is actively hurting your metric. Do not ship; investigate what caused the regression.`,
    },
    inconclusive: {
      icon: '⚠️',
      label: 'Inconclusive',
      color: 'var(--accent)',
      bg: 'rgba(250,204,21,0.08)',
      border: 'rgba(250,204,21,0.25)',
      text: `The result is not statistically significant at your chosen α. You don't have enough evidence to confidently attribute the observed difference to the treatment. Consider running longer or with a larger sample.`,
    },
    srm: {
      icon: '🚨',
      label: 'Invalid — SRM Detected',
      color: 'var(--orange, #f97316)',
      bg: 'rgba(249,115,22,0.08)',
      border: 'rgba(249,115,22,0.25)',
      text: `Your control and treatment groups are not balanced (Sample Ratio Mismatch). This usually points to a bug in traffic splitting, logging, or experiment setup. The statistical results are unreliable until SRM is resolved.`,
    },
  };

  const inputStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '0.55rem 0.75rem',
    color: 'var(--text)',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '0.35rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  const cardStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '1.25rem 1.5rem',
    marginBottom: '1rem',
  };

  const sectionHeadingStyle = {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '0.75rem',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '0.5rem',
  };

  return (
    <div className="pal-page-enter" style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0 0 1.5rem 0',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
        A/B Test Interpreter
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
        An experiment ends and the numbers land in front of you. The gap between a confident ship decision and a fumbled stakeholder conversation is whether you can read them correctly — p-value, lift, SRM, and confidence interval together, not in isolation. Enter your results and get a plain-language verdict with the reasoning behind it, so you practice interpretation, not just arithmetic.
      </p>

      {/* ── Form ── */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <div style={sectionHeadingStyle}>Experiment Results</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Control Visitors</label>
            <input
              type="number"
              min="1"
              value={form.n1}
              onChange={e => setField('n1', e.target.value)}
              placeholder="e.g. 10000"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Control Conversions</label>
            <input
              type="number"
              min="0"
              value={form.c1}
              onChange={e => setField('c1', e.target.value)}
              placeholder="e.g. 500"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Treatment Visitors</label>
            <input
              type="number"
              min="1"
              value={form.n2}
              onChange={e => setField('n2', e.target.value)}
              placeholder="e.g. 10000"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Treatment Conversions</label>
            <input
              type="number"
              min="0"
              value={form.c2}
              onChange={e => setField('c2', e.target.value)}
              placeholder="e.g. 550"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Significance Level (α)</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[0.10, 0.05, 0.01].map(a => (
                <button
                  key={a}
                  onClick={() => setField('alpha', a)}
                  style={{
                    background: form.alpha === a ? 'var(--accent)' : 'var(--surface-2)',
                    border: form.alpha === a ? '2px solid var(--accent)' : '2px solid var(--border)',
                    borderRadius: '6px',
                    padding: '0.45rem 0.75rem',
                    color: form.alpha === a ? '#000' : 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: form.alpha === a ? 700 : 400,
                    cursor: 'pointer',
                    flex: 1,
                    transition: 'all 0.12s',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Number of Metrics Tested</label>
            <input
              type="number"
              min="1"
              value={form.numMetrics}
              onChange={e => setField('numMetrics', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          color: 'var(--red, #ef4444)',
          fontSize: '0.88rem',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      <button
        onClick={interpret}
        style={{
          background: 'var(--accent)',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 2rem',
          color: '#000',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: '2rem',
          width: '100%',
        }}
      >
        Interpret Results
      </button>

      {/* ── Results ── */}
      {result && (
        <div>
          {/* 1. Conversion Rates */}
          <div style={cardStyle}>
            <div style={sectionHeadingStyle}>1. Conversion Rates</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Control</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>{pctFmt(result.p1)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Treatment</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>{pctFmt(result.p2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Relative Lift</div>
                <div style={{
                  fontSize: '1.4rem', fontWeight: 700,
                  color: result.lift > 0 ? 'var(--green)' : result.lift < 0 ? 'var(--red, #ef4444)' : 'var(--text)',
                }}>
                  {result.lift >= 0 ? '+' : ''}{pctFmt(result.lift, 1)}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Statistical Significance */}
          <div style={cardStyle}>
            <div style={sectionHeadingStyle}>2. Statistical Significance</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '0.75rem 1.5rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Z-statistic</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>{fmt(result.z, 3)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>p-value</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>
                  {result.p < 0.0001 ? '< 0.0001' : fmt(result.p, 4)}
                </div>
              </div>
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              background: result.isSignificant ? 'var(--green-bg, rgba(34,197,94,0.1))' : 'var(--surface-2)',
              border: `1px solid ${result.isSignificant ? 'var(--green-border, rgba(34,197,94,0.25))' : 'var(--border)'}`,
              fontSize: '0.85rem',
              fontWeight: 600,
              color: result.isSignificant ? 'var(--green)' : 'var(--text-muted)',
              marginBottom: '0.75rem',
            }}>
              {result.isSignificant ? '✓' : '✗'} {result.isSignificant ? 'Significant' : 'Not significant'} at α={result.alpha}
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                {Math.round((1 - result.alpha) * 100)}% CI for lift (absolute difference)
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600 }}>
                [{result.ci[0] >= 0 ? '+' : ''}{pctFmt(result.ci[0], 2)}, {result.ci[1] >= 0 ? '+' : ''}{pctFmt(result.ci[1], 2)}]
              </div>
            </div>
          </div>

          {/* 3. SRM Check */}
          <div style={cardStyle}>
            <div style={sectionHeadingStyle}>3. SRM Check</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Expected split</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>50 / 50</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Control share</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                  {pctFmt(result.n1 / (result.n1 + result.n2), 1)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Treatment share</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                  {pctFmt(result.n2 / (result.n1 + result.n2), 1)}
                </div>
              </div>
            </div>
            {result.hasSRM ? (
              <div style={{
                background: 'rgba(249,115,22,0.08)',
                border: '1px solid rgba(249,115,22,0.25)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'var(--orange, #f97316)',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}>
                ⚠️ SRM detected — your groups are not equal size (p = {fmt(result.srmP, 4)}). Results may be invalid.
              </div>
            ) : (
              <div style={{
                background: 'var(--green-bg, rgba(34,197,94,0.08))',
                border: '1px solid var(--green-border, rgba(34,197,94,0.2))',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'var(--green)',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}>
                ✓ No SRM detected (p = {fmt(result.srmP, 4)})
              </div>
            )}
          </div>

          {/* 4. Multiple Testing Warning */}
          {result.numMetrics > 1 && (
            <div style={cardStyle}>
              <div style={sectionHeadingStyle}>4. Multiple Testing Warning</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: '0.5rem' }}>
                You tested <strong style={{ color: 'var(--text)' }}>{result.numMetrics} metrics</strong>. Family-wise error rate
                = 1 − (1 − α)^{result.numMetrics} = <strong style={{ color: 'var(--accent)' }}>{pctFmt(result.familyWiseError, 1)}</strong>.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65 }}>
                Consider Bonferroni correction: α per metric = {result.alpha}/{result.numMetrics} = <strong style={{ color: 'var(--text)' }}>{fmt(result.bonferroni, 4)}</strong>.
              </p>
            </div>
          )}

          {/* 5. Verdict */}
          {(() => {
            const vc = verdictConfig[result.verdict];
            return (
              <div style={{
                background: vc.bg,
                border: `2px solid ${vc.border}`,
                borderRadius: '12px',
                padding: '1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{vc.icon}</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: vc.color }}>{vc.label}</span>
                </div>
                <p style={{ color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                  {vc.text}
                </p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
