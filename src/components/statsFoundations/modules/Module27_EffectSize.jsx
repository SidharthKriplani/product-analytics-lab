import { useState, useMemo } from 'react';

function normalPDF(x, mu, sigma) {
  var z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

function dLabel(d) {
  var abs = Math.abs(d);
  if (abs < 0.2) return 'Negligible';
  if (abs < 0.5) return 'Small';
  if (abs < 0.8) return 'Medium';
  return 'Large';
}

function dColor(d) {
  var abs = Math.abs(d);
  if (abs < 0.2) return 'var(--text-muted)';
  if (abs < 0.5) return 'var(--yellow)';
  if (abs < 0.8) return 'var(--accent)';
  return 'var(--green)';
}

var MCQ_OPTIONS = [
  { id: 'a', text: 'Always report the p-value — it tells you everything you need' },
  { id: 'b', text: 'Effect size matters when deciding whether to ship; p-value only tells you the result is real, not whether it is worth acting on' },
  { id: 'c', text: 'Effect size is only relevant for academic research, not product decisions' },
  { id: 'd', text: 'If p < 0.001, the effect is guaranteed to be large enough to ship' },
];
var MCQ_ANSWER = 'b';

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module27_EffectSize({ module, onNext }) {
  var [diffMeans, setDiffMeans] = useState(5);
  var [pooledSD, setPooledSD] = useState(10);
  var [picked, setPicked] = useState(null);
  var [revealed, setRevealed] = useState(false);

  var cohensD = pooledSD > 0 ? diffMeans / pooledSD : 0;
  var label = dLabel(cohensD);
  var color = dColor(cohensD);

  var controlMu = 50;
  var treatmentMu = controlMu + diffMeans;

  var curvePoints = useMemo(function () {
    var controlPts = [];
    var treatmentPts = [];
    var xMin = controlMu - 4 * pooledSD;
    var xMax = treatmentMu + 4 * pooledSD;
    var range = xMax - xMin;
    if (range < 1) range = 1;
    var steps = 120;
    for (var i = 0; i <= steps; i++) {
      var x = xMin + (i / steps) * range;
      var svgX = 50 + (i / steps) * 400;
      controlPts.push(svgX + ',' + (220 - normalPDF(x, controlMu, pooledSD) * pooledSD * 500));
      treatmentPts.push(svgX + ',' + (220 - normalPDF(x, treatmentMu, pooledSD) * pooledSD * 500));
    }
    return { control: controlPts.join(' '), treatment: treatmentPts.join(' '), xMin: xMin, xMax: xMax };
  }, [controlMu, treatmentMu, pooledSD]);

  function handleCheck() { setRevealed(true); }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          A 1pp lift in conversion: is that large or small? It depends. If your baseline is 1%, a 1pp lift doubles your conversion rate — it's transformative. If your baseline is 50%, 1pp is noise. The same numerical difference carries completely different meaning depending on context.
        </p>
        <p style={prose}>
          Statistical significance tells you whether an effect is real. It says nothing about size. Effect size is the tool for measuring magnitude — in a way that allows comparison across metrics, studies, and contexts.
        </p>
        <p style={prose}>
          The fundamental problem: raw differences are incomparable. A 2-point difference in NPS and a 2pp difference in conversion and a 2-second difference in page load time are all different things. To compare magnitudes across these, you need a unit-free measure. The most widely used standardized effect size for comparing means is <strong style={{ color: 'var(--text)' }}>Cohen's d</strong>: d = (μ₁ − μ₂) / σ. Cohen's d expresses the difference in standard deviation units. Conventional interpretations: d = 0.2 is small, d = 0.5 is medium, d = 0.8 is large.
        </p>
        <p style={prose}>
          For proportions, two alternatives: <strong style={{ color: 'var(--text)' }}>relative risk</strong> (treatment rate / control rate, multiplicative comparison useful when baseline is low) and <strong style={{ color: 'var(--text)' }}>Number Needed to Treat (NNT)</strong> = 1 / absolute difference. NNT makes cost-benefit calculation direct: if NNT = 125 and one additional conversion is worth £80, the math is immediate.
        </p>
        <p style={prose}>
          The relationship between effect size, sample size, and significance: the t-statistic is approximately d × √(n/2). p-value decreases as either d increases or n increases. For a given p-value, you can't tell if the effect is large-and-small-n or small-and-large-n. This is why significance alone is insufficient — you always need to know the effect size too. Effect size is the content of the result. Statistical significance is just the confidence that the content exists.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Two studies both report d = 0.5 for the same type of intervention (a checkout flow change). One used n = 100 per arm, one used n = 5,000 per arm. Both came back statistically significant. What do the effect sizes tell you, and what does the sample size difference imply for how much you trust each estimate?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Cohen's d Explorer</div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Drag the mean difference and pooled SD sliders to see how Cohen's d changes. Notice: increasing the difference OR decreasing the SD both make the distributions separate. Try setting a tiny difference (1) with small SD (3) — the effect is large even though the raw difference is small.
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 250, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Difference in means</label>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{diffMeans}</span>
          </div>
          <input
            type="range" min={0} max={30} step={1}
            value={diffMeans}
            onChange={function (e) { setDiffMeans(parseInt(e.target.value)); }}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>0 (no difference)</span><span>30 (large gap)</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 250, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Pooled standard deviation</label>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{pooledSD}</span>
          </div>
          <input
            type="range" min={3} max={30} step={1}
            value={pooledSD}
            onChange={function (e) { setPooledSD(parseInt(e.target.value)); }}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>3 (tight)</span><span>30 (spread out)</span>
          </div>
        </div>
      </div>

      {/* Cohen's d readout */}
      <div style={{
        background: cohensD >= 0.5 ? 'var(--green-bg)' : cohensD >= 0.2 ? 'var(--yellow-bg)' : 'var(--surface-2)',
        border: '2px solid ' + color,
        borderRadius: 'var(--radius)', padding: '0.85rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
            {label} effect
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            d = {cohensD.toFixed(2)}
          </div>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 340 }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>d = {diffMeans} / {pooledSD} = {cohensD.toFixed(2)}</span>
          <span style={{ display: 'block', marginTop: '0.15rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Conventions: 0.2 = small, 0.5 = medium, 0.8 = large
          </span>
        </div>
      </div>

      {/* SVG: overlapping distributions */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          Control (blue) vs Treatment (green) — Cohen's d = {cohensD.toFixed(2)}
        </div>
        <svg viewBox="0 0 500 260" width="100%" style={{ overflow: 'visible' }}>
          <line x1={50} y1={220} x2={450} y2={220} stroke="var(--border)" strokeWidth={1.5} />

          <polyline points={curvePoints.control} fill="none" stroke="var(--accent)" strokeWidth={2.5} opacity={0.8} />
          <polyline points={curvePoints.treatment} fill="none" stroke="var(--green)" strokeWidth={2.5} opacity={0.8} />

          {/* Mean markers */}
          <line x1={250} y1={30} x2={250} y2={220} stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5} />
          <text x={250} y={240} textAnchor="middle" fontSize={9} fill="var(--accent)" fontWeight={600}>Control mean</text>

          {diffMeans > 0 && (function () {
            var treatX = 250 + (diffMeans / (curvePoints.xMax - curvePoints.xMin)) * 400;
            treatX = Math.min(445, Math.max(55, treatX));
            return (
              <g>
                <line x1={treatX} y1={30} x2={treatX} y2={220} stroke="var(--green)" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5} />
                <text x={treatX} y={240} textAnchor="middle" fontSize={9} fill="var(--green)" fontWeight={600}>Treatment mean</text>
              </g>
            );
          })()}

          <text x={450} y={45} textAnchor="end" fontSize={13} fontWeight={800} fill={color}>
            d = {cohensD.toFixed(2)}
          </text>
        </svg>
      </div>

      {/* Framework */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Framework</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7 }}>
          Always report effect size alongside your p-value. Cohen's d standardizes the difference so you can compare across metrics and experiments. A "statistically significant" result with d = 0.05 means the distributions are nearly identical — the test detected a real but meaningless difference. Set your minimum detectable effect (MDE) during experiment design to ensure you only detect effects worth shipping.
        </div>
      </div>

      {/* Quick Check MCQ */}
      <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          Quick Check
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
          When should you care about effect size vs p-value?
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
            <strong>{picked === MCQ_ANSWER ? 'Correct!' : 'Not quite.'}</strong> The p-value tells you the result is unlikely under the null hypothesis. Effect size tells you the magnitude. With large samples, trivially small effects become significant. The ship decision depends on whether the effect is large enough to justify the cost — that is what effect size measures.
          </div>
        )}
      </div>

      {/* What you should have confirmed */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Both studies report the same effect size magnitude (d = 0.5), but the n = 100 study has very wide confidence intervals around that estimate — the true effect could be anywhere from 0.1 to 0.9. The n = 5,000 study has tight confidence intervals — d ≈ 0.5 with high precision. The point estimate is the same; the certainty around it differs dramatically. Effect size tells you the magnitude; SE around the effect size tells you how reliably that magnitude was estimated.
        </p>
      </div>

      {/* ── Analyst Move ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Never report a statistically significant result without also reporting the effect size in business-relevant units. "p = 0.002" followed by "4 additional conversions per 10,000 visitors" gives decision-makers what they need. Without the effect size, "significant" is a content-free word that doesn't help anyone decide whether to ship.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> When comparing results across experiments, compare effect sizes — not p-values. An experiment with p = 0.04 and d = 0.3 is finding a larger effect than one with p = 0.001 and d = 0.05. P-values reflect both effect size and sample size. Effect size reflects only the former.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Report the confidence interval around your effect size estimate, not just the point estimate. "d = 0.5 [95% CI: 0.1–0.9]" is very different from "d = 0.5 [95% CI: 0.45–0.55]." The first is an uncertain estimate from a small study; the second is a precisely characterised effect from a large one. The CI around the effect size tells you how much to trust the magnitude you observed.</p>
        </div>
      </div>

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'When designing an experiment, you set the minimum detectable effect (MDE) based on what effect size would be worth shipping. This directly determines your required sample size through the power calculation.'}
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
