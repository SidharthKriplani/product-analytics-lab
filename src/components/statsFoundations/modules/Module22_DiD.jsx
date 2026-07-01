import { useState, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';

const MCQ = {
  id: 'did_interpretation',
  question: 'City A received a new in-app engagement feature. City B did not. Both cities\' engagement grew after launch, but City A grew more. Which conclusion is valid?',
  options: [
    {
      id: 'a',
      label: 'City A grew faster, so the feature caused the additional growth above City B\'s trend',
      correct: true,
      feedback: 'Correct. DiD isolates the causal effect by subtracting City B\'s background growth trend from City A\'s total growth. The difference is attributable to the feature, assuming the parallel trends assumption holds.',
    },
    {
      id: 'b',
      label: 'City A\'s total growth after launch is the feature\'s causal effect',
      correct: false,
      feedback: 'The total post-launch growth in City A includes background trends that would have happened anyway. Without subtracting City B\'s change, you are overcounting the treatment effect.',
    },
    {
      id: 'c',
      label: 'City B grew too, which proves the feature had no real effect',
      correct: false,
      feedback: 'City B growing does not invalidate the feature\'s effect. DiD expects both groups to have background trends. The question is whether City A grew more than City B — and by how much.',
    },
  ],
};

const PRESETS = [
  { label: 'STAT17 example', tPre: 64, tPost: 71, cPre: 62, cPost: 66 },
  { label: 'No true effect', tPre: 50, tPost: 58, cPre: 50, cPost: 58 },
  { label: 'Strong effect', tPre: 45, tPost: 62, cPre: 45, cPost: 46 },
];

function clamp(v) { return Math.max(0, Math.min(100, Number(v) || 0)); }

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module22_DiD({ module, onNext }) {
  const [tPre, setTPre] = useState(64);
  const [tPost, setTPost] = useState(71);
  const [cPre, setCPre] = useState(62);
  const [cPost, setCPost] = useState(66);
  const [mcqAnswer, setMcqAnswer] = useState(null);
  const [mcqRevealed, setMcqRevealed] = useState(false);

  function handleMcq(optId) {
    if (mcqRevealed) return;
    setMcqAnswer(optId);
    setMcqRevealed(true);
  }

  const tDelta = tPost - tPre;
  const cDelta = cPost - cPre;
  const did = tDelta - cDelta;

  const didColor = did > 2 ? 'var(--green)' : did < -2 ? 'var(--red)' : 'var(--yellow-text)';
  const didBg   = did > 2 ? 'var(--green-bg)' : did < -2 ? 'var(--red-bg)' : 'var(--yellow-bg)';
  const didBorder = did > 2 ? 'var(--green-border)' : did < -2 ? 'var(--red-border)' : 'var(--yellow-border)';

  function applyPreset(p) {
    setTPre(p.tPre); setTPost(p.tPost); setCPre(p.cPre); setCPost(p.cPost);
  }

  const fieldStyle = {
    width: '100%', padding: '0.55rem 0.75rem', fontSize: '1.1rem', fontWeight: 700,
    background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
    color: 'var(--text)', boxSizing: 'border-box', textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  };
  const cellLabel = { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.35rem', textAlign: 'center' };
  const col = { flex: 1, minWidth: 110 };

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          You have launched a new feature in Germany. You did not randomize — the launch happened because of a business decision, not a coin flip. Six weeks later, retention in Germany has improved by 5pp. Was it the feature?
        </p>
        <p style={prose}>
          Maybe. But retention was probably already improving in Germany as the product matured. And retention might have improved across all markets due to a seasonal effect, or a global product update, or simply time. You cannot separate the feature's effect from everything else that was moving in the same direction.
        </p>
        <p style={prose}>
          The naive comparison — Germany before vs. Germany after — captures the feature's effect plus all those other trends. You need something that tells you how Germany would have changed over those six weeks if the feature had never launched. A counterfactual for Germany-over-time.
        </p>
        <p style={prose}>
          You have it: other markets that did not receive the feature. If Germany and France had similar retention trends before the launch, then France's post-launch retention trajectory is a credible proxy for what Germany's would have been without the feature. This is the logic of <strong style={{ color: 'var(--text)' }}>Difference-in-Differences</strong>.
        </p>
        <p style={prose}>
          The DiD estimator computes two differences and subtracts them: (Germany's post-launch retention − Germany's pre-launch retention) − (France's post-launch retention − France's pre-launch retention). The first difference removes Germany's starting level. The second difference removes France's starting level and captures its over-time change — your estimate of the trend that would have applied to Germany anyway. Subtracting the two strips the shared trend and leaves only the treatment effect.
        </p>
        <p style={prose}>
          The entire method stands or falls on one assumption: <strong style={{ color: 'var(--text)' }}>parallel trends</strong>. Germany and France would have followed the same retention trend in the absence of the feature. You cannot prove this is true after treatment — you can only check it in the pre-period. If Germany and France moved in parallel before launch (similar week-over-week changes, similar responsiveness to shared events), that is evidence — not proof — that parallel trends would have continued.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You want to use DiD to evaluate a feature launched in the UK. You are considering using the US as the control group. What would you check in the pre-period data before deciding the US is a valid control?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Compute the Double Difference</div>

      {/* Presets */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: 2 }}>Presets:</span>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => applyPreset(p)} style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Enter before and after values for both the treatment and control groups, then read the DiD estimate. Try the "No true effect" preset to see a DiD of 0 — both groups moved the same. Try "Strong effect" to see what a real causal signal looks like. Notice how the raw treatment delta is always misleading without subtracting the control trend.
      </div>

      {/* 2×2 input grid */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', gap: '0.6rem', minWidth: 320 }}>
          {/* Header row */}
          <div />
          <div style={{ ...cellLabel, textAlign: 'center', color: 'var(--accent)' }}>Before</div>
          <div style={{ ...cellLabel, textAlign: 'center', color: 'var(--accent)' }}>After</div>

          {/* Treatment row */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>Treatment group</span>
          </div>
          <div style={col}>
            <input type="number" min={0} max={100} value={tPre} onChange={e => setTPre(clamp(e.target.value))} style={fieldStyle} />
            <div style={{ ...cellLabel, marginTop: '0.2rem', marginBottom: 0 }}>T before (%)</div>
          </div>
          <div style={col}>
            <input type="number" min={0} max={100} value={tPost} onChange={e => setTPost(clamp(e.target.value))} style={fieldStyle} />
            <div style={{ ...cellLabel, marginTop: '0.2rem', marginBottom: 0 }}>T after (%)</div>
          </div>

          {/* Control row */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>Control group</span>
          </div>
          <div style={col}>
            <input type="number" min={0} max={100} value={cPre} onChange={e => setCPre(clamp(e.target.value))} style={fieldStyle} />
            <div style={{ ...cellLabel, marginTop: '0.2rem', marginBottom: 0 }}>C before (%)</div>
          </div>
          <div style={col}>
            <input type="number" min={0} max={100} value={cPost} onChange={e => setCPost(clamp(e.target.value))} style={fieldStyle} />
            <div style={{ ...cellLabel, marginTop: '0.2rem', marginBottom: 0 }}>C after (%)</div>
          </div>
        </div>
      </div>

      {/* Live calculation */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 120, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Treatment Δ</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: tDelta >= 0 ? 'var(--accent)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{tDelta >= 0 ? '+' : ''}{tDelta}pp</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.3rem' }}>−</div>
        <div style={{ flex: 1, minWidth: 120, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Control Δ <span style={{ fontWeight: 400, opacity: 0.7 }}>(would-have-happened trend)</span></div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{cDelta >= 0 ? '+' : ''}{cDelta}pp</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.3rem' }}>=</div>
        <div style={{ flex: 1, minWidth: 140, background: didBg, border: `1.5px solid ${didBorder}`, borderRadius: 'var(--radius)', padding: '0.9rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: didColor, marginBottom: '0.35rem' }}>DiD Estimate (causal effect)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: didColor, fontVariantNumeric: 'tabular-nums' }}>{did >= 0 ? '+' : ''}{did}pp</div>
        </div>
      </div>

      {/* Annotation */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text)' }}>Reading the result:</strong> Of the treatment group's {tDelta >= 0 ? '+' : ''}{tDelta}pp change, {cDelta >= 0 ? '+' : ''}{cDelta}pp would have happened anyway (the control group trend). The treatment's causal contribution is <strong style={{ color: didColor }}>{did >= 0 ? '+' : ''}{did}pp</strong>.
        {did !== tDelta && (
          <span style={{ color: 'var(--red)' }}> Reporting the raw {tDelta >= 0 ? '+' : ''}{tDelta}pp as the treatment effect would be {did !== 0 ? `${Math.abs(tDelta - did)}pp wrong` : 'correct — but only because the control trend was zero'}.</span>
        )}
      </div>

      {/* MCQ Exercise */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Quick check</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{MCQ.question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {MCQ.options.map(opt => {
            const isChosen = mcqAnswer === opt.id;
            const borderColor = !mcqRevealed
              ? 'var(--border)'
              : isChosen
                ? (opt.correct ? 'var(--green-border)' : 'var(--red-border)')
                : opt.correct ? 'var(--green-border)' : 'var(--border)';
            const bg = !mcqRevealed
              ? 'var(--surface)'
              : isChosen
                ? (opt.correct ? 'var(--green-bg)' : 'var(--red-bg)')
                : opt.correct ? 'var(--green-bg)' : 'var(--surface)';
            const color = !mcqRevealed
              ? 'var(--text-secondary)'
              : isChosen
                ? (opt.correct ? 'var(--green)' : 'var(--red)')
                : opt.correct ? 'var(--green)' : 'var(--text-muted)';
            return (
              <div key={opt.id}>
                <button
                  onClick={() => handleMcq(opt.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-sm)', border: `1.5px solid ${borderColor}`,
                    background: bg, color, fontSize: '0.85rem',
                    fontWeight: isChosen ? 700 : 500, cursor: mcqRevealed ? 'default' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </button>
                {mcqRevealed && isChosen && (
                  <div style={{ fontSize: '0.8rem', color: opt.correct ? 'var(--green)' : 'var(--red)', lineHeight: 1.55, marginTop: '0.3rem', paddingLeft: '0.25rem' }}>
                    {opt.correct ? <Icon name='check' size={13} color='currentColor' /> : <Icon name='x' size={13} color='currentColor' />} {opt.feedback}
                  </div>
                )}
                {mcqRevealed && !isChosen && opt.correct && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--green)', lineHeight: 1.55, marginTop: '0.3rem', paddingLeft: '0.25rem' }}>
                    <Icon name='check' size={13} color='currentColor' /> {opt.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── What you should have confirmed ── */}
      {mcqRevealed && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            You would check whether UK and US retention move in parallel before the UK launch — similar week-over-week patterns, similar responses to product updates that affected both. If the UK was already diverging from the US before treatment, you cannot use the US as a control — the divergence would continue post-treatment for reasons unrelated to the feature. Non-parallel pre-trends mean the DiD estimate is biased by exactly the pre-existing divergence.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {mcqRevealed && (
        <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Always plot the pre-period trends for treated and comparison groups before running DiD. If the trends are not parallel — similar direction, similar magnitude of changes — find a better comparison group or choose a different method. Showing the parallel pre-trends in your report is not optional: it is the primary evidence that the method is valid.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> The quality of the comparison group is the entire game in DiD. Other markets, other user segments, other time periods — whatever you use, it needs to be genuinely comparable. Similar acquisition channels, similar product usage patterns, similar response to external events. One good comparison group beats five bad ones.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> When presenting DiD results to stakeholders, show all four numbers explicitly: treated pre, treated post, control pre, control post. Then show the two first differences, then the DiD estimate. This transparency makes the method auditable — any PM or executive can follow the logic and spot if something looks off. "Our feature drove 3pp retention in Germany, controlling for a 2pp trend we observed in France over the same period" is a sentence anyone can evaluate.</p>
          </div>
        </div>
      )}

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'DiD is often used when a feature rolls out to one market before others — a staged launch creates a natural treatment/control structure. Unlike an A/B test, the groups are not randomly assigned, so the parallel trends assumption must be verified. DiD is the most common method for evaluating geo-experiments and policy rollouts where full randomization is not feasible.'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="pal-glow-pulse" onClick={onNext} style={{ padding: '0.7rem 1.75rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: 'var(--shadow)', letterSpacing: '0.02em' }}>
          Next concept →
        </button>
      </div>
    </div>
  );
}
