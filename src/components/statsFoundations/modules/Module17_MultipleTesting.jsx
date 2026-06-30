import { useState, useMemo } from 'react';

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module17_MultipleTesting({ module, onNext }) {
  const [n, setN] = useState(5);
  const [bonferroni, setBonferroni] = useState(false);

  const alpha = 0.05;
  const familyWiseError = useMemo(() => 1 - Math.pow(1 - alpha, n), [n]);
  const adjustedAlpha = useMemo(() => alpha / n, [n]);

  const fwePercent = (familyWiseError * 100).toFixed(1);
  const barColor = familyWiseError < 0.2 ? 'var(--green)' : familyWiseError < 0.4 ? 'var(--yellow)' : 'var(--red)';

  // "Cost of Bonferroni" note — rough 4x scaling factor based on variance ratio
  const bonferroniDataMultiple = useMemo(() => {
    // to maintain same power with alpha/n instead of alpha,
    // roughly need (z_alpha/n + z_beta)^2 / (z_alpha + z_beta)^2 more data
    // Approximate: at n=10 alpha becomes 0.005, need ~4x more data
    // We'll show the ratio: z_{alpha/2} vs z_{alpha/(2n)}
    const zAlpha = 1.96; // z for alpha=0.05/2
    const zBeta = 0.84;  // z for 80% power
    const zAdj = (() => {
      // approx inverse normal CDF for small p using known values
      const p = adjustedAlpha / 2;
      if (p <= 0.0001) return 3.89;
      if (p <= 0.0005) return 3.48;
      if (p <= 0.001) return 3.29;
      if (p <= 0.002) return 3.09;
      if (p <= 0.005) return 2.81;
      if (p <= 0.01) return 2.58;
      if (p <= 0.025) return 1.96;
      return 1.65;
    })();
    const ratio = Math.pow((zAdj + zBeta) / (zAlpha + zBeta), 2);
    return ratio.toFixed(1);
  }, [adjustedAlpha]);

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          The significance threshold α = 0.05 means: if H₀ is true, there's a 5% chance of seeing a result this extreme by chance. That guarantee is per test. It only holds for a single hypothesis, tested once, with the decision threshold set before looking at the data.
        </p>
        <p style={prose}>
          What happens when you run 20 tests? If you test 20 independent hypotheses — 20 metrics, 20 subgroups, 20 product variants — and none of the true effects exist, the probability of at least one coming back p &lt; 0.05 by chance is 1 − 0.95^20 ≈ 64%. You're more likely than not to find a "significant" result that's actually noise.
        </p>
        <p style={prose}>
          In product analytics this pattern appears constantly, but quietly. An experiment dashboard shows 40 metrics. Three come back significant at p &lt; 0.05. The team highlights those three. But how many would have come back significant by chance if none of the effects were real? Roughly 40 × 0.05 = 2. At least two of those three "discoveries" could be noise.
        </p>
        <p style={prose}>
          Subgroup hunting is the same problem. After an experiment, someone looks at the result in 15 subgroups. One subgroup shows a significant positive effect — and gets presented as the target audience. But 15 comparisons at α = 0.05 expects at least one false positive. This is p-hacking — not necessarily with deliberate intent to deceive. The search for significance across many comparisons produces the same statistical failure as running a single test with a broken threshold.
        </p>
        <p style={prose}>
          Three solutions in order of application: <strong style={{ color: 'var(--text)' }}>Pre-specification</strong> — commit to your hypotheses before looking at data. One primary metric. Subgroup analyses planned in advance. <strong style={{ color: 'var(--text)' }}>Bonferroni correction</strong> — divide α by the number of tests. For 20 tests, each must clear α = 0.0025 instead of 0.05. Conservative and power-costly for large k. <strong style={{ color: 'var(--text)' }}>Benjamini-Hochberg (FDR control)</strong> — instead of controlling the probability of any false positive, controls the fraction of discoveries that are false. Better-suited for exploratory analysis where you expect many effects to be real.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You test 50 metrics in your experiment and find 4 with p &lt; 0.05. Under the null that none have real effects, how many would you expect to be significant by chance? Given that, how do you interpret the 4 findings?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Scale Up the Tests</div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Drag the slider to increase the number of metrics tested and watch the false positive bar fill up. Then toggle on the Bonferroni correction to see how it controls the error rate — and note the cost note showing how much more data you need to maintain power. Click the reference grid to jump to common n values.
      </div>

      {/* Slider */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Number of metrics tested (n)</label>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{n}</span>
        </div>
        <input
          type="range" min={1} max={20} step={1}
          value={n}
          onChange={e => setN(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          <span>1 metric</span><span>10</span><span>20 metrics</span>
        </div>
      </div>

      {/* Bonferroni toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Correction:</span>
        {[{ label: 'None (raw α = 0.05)', val: false }, { label: 'With Bonferroni correction', val: true }].map(opt => (
          <button key={String(opt.val)} onClick={() => setBonferroni(opt.val)} style={{
            padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-sm)',
            border: `1.5px solid ${bonferroni === opt.val ? 'var(--accent)' : 'var(--border)'}`,
            background: bonferroni === opt.val ? 'var(--accent-bg)' : 'var(--surface)',
            color: bonferroni === opt.val ? 'var(--accent)' : 'var(--text-muted)',
            fontSize: '0.85rem', fontWeight: bonferroni === opt.val ? 700 : 500, cursor: 'pointer',
          }}>{opt.label}</button>
        ))}
      </div>

      {/* Probability bar */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          {bonferroni
            ? 'With Bonferroni: FWER is controlled at 5%'
            : `P(at least one false positive) = 1 − (1 − α)ⁿ = 1 − (0.95)^${n}`}
        </div>

        {/* SVG probability bar */}
        <svg viewBox="0 0 500 60" width="100%" style={{ display: 'block', marginBottom: '0.5rem' }}>
          {/* Background track */}
          <rect x={0} y={15} width={500} height={30} rx={6} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} />
          {/* Fill */}
          <rect
            x={0} y={15}
            width={bonferroni ? 500 * 0.05 : 500 * familyWiseError}
            height={30} rx={6}
            fill={bonferroni ? 'var(--green)' : barColor}
            style={{ transition: 'width 0.3s ease, fill 0.3s ease' }}
          />
          {/* 50% mark */}
          <line x1={250} y1={10} x2={250} y2={50} stroke="var(--border)" strokeWidth={1} strokeDasharray="3,2" />
          <text x={250} y={7} textAnchor="middle" fontSize={9} fill="var(--text-muted)">50%</text>
          {/* Labels */}
          <text x={2} y={58} fontSize={9} fill="var(--text-muted)">0%</text>
          <text x={498} y={58} textAnchor="end" fontSize={9} fill="var(--text-muted)">100%</text>
        </svg>

        {/* Big number */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {bonferroni ? 'Controlled FWER' : 'False positive risk'}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: bonferroni ? 'var(--green)' : barColor, fontVariantNumeric: 'tabular-nums' }}>
              {bonferroni ? '≤ 5.0%' : `${fwePercent}%`}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {bonferroni ? 'Adjusted α per test' : 'α per test'}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
              {bonferroni ? adjustedAlpha.toFixed(4) : '0.0500'}
            </div>
          </div>
        </div>

        {/* Bonferroni cost note — always show when correction is on so layout stays stable */}
        {bonferroni && (
          <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--yellow-text)' }}>
            {n === 1
              ? <span><strong>Cost of Bonferroni at n=1:</strong> No correction needed — you are only testing 1 metric. α per test remains {adjustedAlpha.toFixed(4)}.</span>
              : <span><strong>Cost of Bonferroni at n={n}:</strong> α per test = {adjustedAlpha.toFixed(4)}. You need approximately <strong>{bonferroniDataMultiple}× more data</strong> to maintain the same statistical power.</span>
            }
          </div>
        )}
      </div>

      {/* Example table */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Accumulating false positive risk
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: '0.5rem' }}>
          {[1, 3, 5, 10, 14, 20].map(k => {
            const fwe = (1 - Math.pow(0.95, k)) * 100;
            const isActive = k === n;
            return (
              <div key={k} onClick={() => setN(k)} style={{
                padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                background: isActive ? 'var(--accent-bg)' : 'var(--surface)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>n = {k}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: fwe > 40 ? 'var(--red)' : fwe > 20 ? 'var(--yellow)' : 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
                  {fwe.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FDR note */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text)' }}>FDR Control (Benjamini-Hochberg)</strong> — a practical middle ground.
        Instead of controlling the probability of <em>any</em> false positive (FWER), FDR control targets the <em>expected proportion</em> of false positives among all rejections.
        Less conservative than Bonferroni: you lose less power while still limiting false discoveries.
        BH procedure: sort p-values, compare each to (i/n) × α threshold.
      </div>

      {/* ── What you should have confirmed ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          50 tests × 0.05 = 2.5 expected false positives under the null. Finding 4 significant doesn't necessarily mean 4 real effects — it might mean 2.5 noise discoveries plus 1.5 real effects. Bonferroni corrects α to 0.001, and probably 0 of the 4 survive. BH at 10% FDR might retain 2. The right tool depends on whether you're making a decision (Bonferroni, be conservative) or generating hypotheses to test further (BH, preserve power).
        </p>
      </div>

      {/* ── Analyst Move ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Distinguish primary from secondary metrics in every experiment before launch. The primary metric gets the full α = 0.05 guarantee — it was your pre-specified decision criterion. Secondary metrics are exploratory; report them with FDR correction or explicitly label them as hypothesis-generating, not decision-making.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> When presenting post-hoc subgroup analyses, always state: "these are exploratory and require replication." An exciting subgroup result that wasn't pre-specified is a hypothesis, not a finding. The subgroup that "showed the effect" was selected from many — it's the winner of a noisy lottery.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> When someone runs an experiment, looks at 30 metrics, finds 3 significant, and presents them as the results — ask which were pre-specified before the experiment ran. If none were pre-specified, the entire analysis has inflated false positive risk. The question isn't "which metrics moved" — it's "which metrics were we committed to testing before we looked at the data."</p>
        </div>
      </div>

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'In an experiment with one primary metric and 15 secondary exploratory metrics, the primary gets the full α = 0.05 guarantee. Secondary metrics get Benjamini-Hochberg at 10% FDR. Any "significant" secondary findings are flagged as exploratory hypotheses requiring dedicated experiments — not decisions in themselves.'}
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
