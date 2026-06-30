import { useState, useEffect } from 'react';
import { loadSFState, saveSFState } from '../../../utils/statsFoundationsState.js';
import { Icon } from '../../shared/Icon.jsx';

const MCQ_SC = {
  question: 'One state bans a product. You want to estimate the sales impact. No other state implemented the same ban. Which method is most appropriate?',
  options: [
    {
      id: 'a',
      label: 'DiD using all other states as a single control group',
      correct: false,
      feedback: 'Simple DiD pooling all other states assumes they all share a parallel trend with the treated state. If the treated state has a unique trajectory, pooling creates a noisy or biased counterfactual. Synthetic control is better when only one unit is treated.',
    },
    {
      id: 'b',
      label: 'Synthetic control — construct a weighted combination of donor states that best matched the treated state pre-ban',
      correct: true,
      feedback: 'Correct. With a single treated unit and multiple potential controls, synthetic control finds the weighted combination that best replicates the treated state\'s pre-period trend. The post-period divergence is the causal estimate.',
    },
    {
      id: 'c',
      label: 'Regression discontinuity using states near the ban threshold',
      correct: false,
      feedback: 'RD requires a continuous running variable with a sharp threshold. A policy ban is a binary treatment applied to one state, not a threshold on a continuous score. There is no running variable here.',
    },
  ],
};

const W = 460;
const H = 200;
const PAD = { left: 40, right: 20, top: 20, bottom: 30 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;
const INTERVENTION_T = 8; // time index of intervention (out of 0..14)
const T_POINTS = 15;

// Pre-defined synthetic control candidates
const DONORS = [
  {
    id: 'A',
    label: 'Donor A',
    description: 'Similar market, similar pre-period trend. Pre-period RMSE: 0.8pp.',
    prePeriodRMSE: 0.8,
    valid: true,
    color: 'var(--green)',
    borderColor: 'var(--green-border)',
    bgColor: 'var(--green-bg)',
    // pre-period tracks treated closely, post drifts naturally
    getY: (t) => {
      const base = 32 + t * 0.4;
      const noise = Math.sin(t * 1.1) * 0.8;
      return base + noise;
    },
  },
  {
    id: 'B',
    label: 'Donor B',
    description: 'Different trajectory pre-period. Pre-period RMSE: 6.1pp.',
    prePeriodRMSE: 6.1,
    valid: false,
    color: 'var(--red)',
    borderColor: 'var(--red-border)',
    bgColor: 'var(--red-bg)',
    // diverges badly pre-period
    getY: (t) => {
      const base = 38 - t * 0.3;
      const noise = Math.cos(t * 0.7) * 1.5;
      return base + noise;
    },
  },
  {
    id: 'C',
    label: 'Donor C',
    description: 'Tracks pre-period trend but received similar intervention at t=6.',
    prePeriodRMSE: 0.9,
    valid: false,
    color: 'var(--yellow-text)',
    borderColor: 'var(--yellow-border)',
    bgColor: 'var(--yellow-bg)',
    // close pre-period but already treated earlier — exclusion restriction violated
    getY: (t) => {
      const base = 32 + t * 0.4;
      const noise = Math.sin(t * 0.9) * 0.7;
      const earlyTreatment = t >= 6 ? (t - 6) * 0.8 : 0;
      return base + noise + earlyTreatment;
    },
  },
];

// Treated unit
function treatedY(t) {
  const base = 32 + t * 0.4;
  const noise = Math.sin(t * 1.1) * 0.8;
  const lift = t >= INTERVENTION_T ? (t - INTERVENTION_T + 1) * 1.8 : 0;
  return base + noise + lift;
}

function tToX(t) {
  return PAD.left + (t / (T_POINTS - 1)) * INNER_W;
}

function yToSvg(y, minY, maxY) {
  return PAD.top + (1 - (y - minY) / (maxY - minY)) * INNER_H;
}

function buildPath(pts, minY, maxY) {
  return pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${tToX(p.t).toFixed(1)} ${yToSvg(p.y, minY, maxY).toFixed(1)}`)
    .join(' ');
}

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module24_SyntheticControl({ module, onNext }) {
  var _saved = loadSFState('sf24');
  const [selected, setSelected] = useState(function() { return _saved ? (_saved.selected || null) : null; });
  const [revealed, setRevealed] = useState(function() { return _saved ? !!_saved.revealed : false; });
  const [mcqAnswer, setMcqAnswer] = useState(function() { return _saved ? (_saved.mcqAnswer || null) : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved ? !!_saved.mcqRevealed : false; });

  useEffect(function() {
    saveSFState('sf24', { selected: selected, revealed: revealed, mcqAnswer: mcqAnswer, mcqRevealed: mcqRevealed });
  }, [selected, revealed, mcqAnswer, mcqRevealed]);

  function handleSelect(id) {
    if (revealed) return;
    setSelected(id);
  }

  function handleReveal() {
    if (!selected) return;
    setRevealed(true);
  }

  function handleMcq(optId) {
    if (mcqRevealed) return;
    setMcqAnswer(optId);
    setMcqRevealed(true);
  }

  // Build all time-series data
  const allT = Array.from({ length: T_POINTS }, (_, i) => i);
  const treatedPts = allT.map(t => ({ t, y: treatedY(t) }));

  const donorPts = DONORS.map(d => ({
    id: d.id,
    pts: allT.map(t => ({ t, y: d.getY(t) })),
  }));

  // Compute y-range for SVG scaling
  const allYValues = [
    ...treatedPts.map(p => p.y),
    ...DONORS.flatMap(d => allT.map(t => d.getY(t))),
  ];
  const minY = Math.min(...allYValues) - 2;
  const maxY = Math.max(...allYValues) + 2;

  const selectedDonor = DONORS.find(d => d.id === selected);
  const interventionX = tToX(INTERVENTION_T);

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          DiD requires a comparison group whose pre-treatment trend matches the treated group. RD requires a threshold. But sometimes you have neither.
        </p>
        <p style={prose}>
          You want to evaluate the effect of launching your product in Japan — one market, treated at a specific point in time. No other market had a comparable trajectory to Japan's user growth before the launch. No DiD comparison is clean. There is no threshold to exploit. What do you do?
        </p>
        <p style={prose}>
          The naive answer is to pick the most similar market and run DiD anyway. But if no single market truly matches Japan's pre-launch trajectory, the DiD estimate is biased — the comparison group's post-launch trend diverges from Japan's counterfactual for reasons that have nothing to do with your product.
        </p>
        <p style={prose}>
          The key insight: even if no single market matches Japan, a weighted combination of markets might. Maybe 40% South Korea, 35% Taiwan, 25% Singapore, together, have a trajectory that closely tracks Japan's pre-launch user growth, engagement metrics, and product adoption curve. If so, that weighted combination is a better counterfactual than any single market. This is <strong style={{ color: 'var(--text)' }}>synthetic control</strong>.
        </p>
        <p style={prose}>
          You construct a "synthetic" version of the treated unit — a data-driven weighted composite of untreated units — optimised to match the treated unit's pre-treatment characteristics as closely as possible. Then, in the post-treatment period, you compare the actual treated unit's outcome to where the synthetic control goes. The treatment effect is: actual outcome minus synthetic control outcome, in every post-treatment period.
        </p>
        <p style={prose}>
          The plausibility of the method rests entirely on <strong style={{ color: 'var(--text)' }}>pre-treatment fit</strong>. If the synthetic control closely tracks the actual treated unit for the entire pre-treatment period, it is a credible proxy for what the treated unit would have done without treatment. If the pre-treatment fit is poor, the synthetic control is not a reliable counterfactual. Inference uses placebo tests: run the same synthetic control optimisation on every untreated market — if the Japanese gap is much larger than the distribution of placebo gaps, you have statistical evidence that the gap is not explained by noise.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You have 20 months of pre-treatment data and 5 candidate control units. The best synthetic control you can construct leaves a consistent 10% gap below the treated unit's pre-treatment trajectory. Is this counterfactual usable? What does that pre-treatment gap imply for your post-treatment estimate?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Choose the Right Donor</div>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Read the description of each donor candidate, then pick the one you think makes the best synthetic control. Pay attention to the pre-period RMSE and whether the donor itself received a treatment. Click "Check answer" to see why your pick is valid or invalid, and watch the chart show the effect gap on the correct donor.
      </div>

      {/* Donor selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Pick the valid synthetic control:
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {DONORS.map(d => {
            const isSelected = selected === d.id;
            const showResult = revealed && isSelected;
            const borderColor = showResult
              ? (d.valid ? 'var(--green-border)' : 'var(--red-border)')
              : isSelected ? 'var(--accent-border)' : 'var(--border)';
            const bg = showResult
              ? (d.valid ? 'var(--green-bg)' : 'var(--red-bg)')
              : isSelected ? 'var(--accent-bg)' : 'var(--surface-2)';

            return (
              <button
                key={d.id}
                onClick={() => handleSelect(d.id)}
                style={{
                  flex: 1, minWidth: 130, padding: '0.7rem 0.9rem', borderRadius: 'var(--radius)',
                  border: `1.5px solid ${borderColor}`, background: bg,
                  color: showResult ? (d.valid ? 'var(--green)' : 'var(--red)') : isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: revealed ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.2rem' }}>{d.label}</div>
                <div style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>{d.description}</div>
              </button>
            );
          })}
        </div>
        {!revealed && (
          <button
            onClick={handleReveal}
            disabled={!selected}
            style={{
              alignSelf: 'flex-start', padding: '0.4rem 1.1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem',
              fontWeight: 700, border: 'none',
              background: selected ? 'var(--accent)' : 'var(--border)',
              color: selected ? '#fff' : 'var(--text-muted)', cursor: selected ? 'pointer' : 'default',
            }}
          >
            Check answer
          </button>
        )}
        {revealed && (
          <div className="pal-reveal-in" style={{ fontSize: '0.85rem', color: selectedDonor?.valid ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
            {selectedDonor?.valid
              ? <><Icon name='check' size={15} color='currentColor' /> Correct — Donor A has the lowest pre-period RMSE and was not itself treated. Good synthetic control.</>
              : selected === 'B'
                ? <><Icon name='x' size={15} color='currentColor' /> Donor B diverges sharply pre-period — it doesn't track the treated unit, so post-period divergence is uninterpretable as a causal effect.</>
                : <><Icon name='x' size={15} color='currentColor' /> Donor C has good pre-period fit, but it received a similar intervention at t=6. Using it as a counterfactual contaminates the estimate — the "control" is itself treated.</>}
          </div>
        )}
      </div>

      {/* SVG chart */}
      <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: 'block', margin: '0 auto' }}>
          {/* Pre/post zones */}
          <rect x={PAD.left} y={PAD.top} width={interventionX - PAD.left} height={INNER_H} fill="var(--surface)" opacity={0.5} />
          <rect x={interventionX} y={PAD.top} width={W - PAD.right - interventionX} height={INNER_H} fill="var(--accent-bg)" opacity={0.35} />

          {/* Intervention line */}
          <line x1={interventionX} y1={PAD.top - 4} x2={interventionX} y2={PAD.top + INNER_H}
            stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="5,3" />
          <text x={interventionX + 3} y={PAD.top + 10} fontSize={8} fill="var(--accent)" fontWeight={700}>Intervention</text>

          {/* Donor lines */}
          {DONORS.map(d => {
            const pts = donorPts.find(dp => dp.id === d.id).pts;
            const isHighlighted = selected === d.id;
            return (
              <path
                key={d.id}
                d={buildPath(pts, minY, maxY)}
                fill="none"
                stroke={isHighlighted ? d.color : 'var(--border)'}
                strokeWidth={isHighlighted ? 2 : 1}
                opacity={isHighlighted ? 0.9 : 0.5}
                strokeDasharray={isHighlighted ? 'none' : '4,3'}
              />
            );
          })}

          {/* Treated unit line */}
          <path
            d={buildPath(treatedPts, minY, maxY)}
            fill="none"
            stroke="var(--text)"
            strokeWidth={2.5}
            opacity={0.9}
          />

          {/* Effect arrow (post-intervention, if valid donor selected and revealed) */}
          {revealed && selected === 'A' && (() => {
            const lastT = T_POINTS - 1;
            const donorY = DONORS[0].getY(lastT);
            const treatY = treatedY(lastT);
            const x = tToX(lastT) - 4;
            const y1 = yToSvg(donorY, minY, maxY);
            const y2 = yToSvg(treatY, minY, maxY);
            return (
              <>
                <line x1={x} y1={y1} x2={x} y2={y2} stroke="var(--green)" strokeWidth={2} />
                <text x={x - 24} y={(y1 + y2) / 2 + 4} fontSize={8} fill="var(--green)" fontWeight={700} textAnchor="middle">Effect</text>
              </>
            );
          })()}

          {/* Legend */}
          <line x1={PAD.left} y1={PAD.top + 8} x2={PAD.left + 18} y2={PAD.top + 8} stroke="var(--text)" strokeWidth={2.5} />
          <text x={PAD.left + 22} y={PAD.top + 12} fontSize={8} fill="var(--text)" fontWeight={700}>Treated unit</text>

          {/* Axis labels */}
          <text x={PAD.left} y={H - 4} fontSize={8} fill="var(--text-muted)">t=0</text>
          <text x={W - PAD.right} y={H - 4} fontSize={8} fill="var(--text-muted)" textAnchor="end">t=14</text>
          <text x={(PAD.left + W - PAD.right) / 2} y={H - 4} fontSize={8} fill="var(--text-muted)" textAnchor="middle">Time →</text>
          <text x={PAD.left - 8} y={PAD.top + INNER_H / 2} fontSize={8} fill="var(--text-muted)" textAnchor="middle"
            transform={`rotate(-90, ${PAD.left - 8}, ${PAD.top + INNER_H / 2})`}>Metric (%)</text>
          <text x={(PAD.left + interventionX) / 2} y={PAD.top + 18} fontSize={8} fill="var(--text-muted)" textAnchor="middle">Pre-period</text>
          <text x={(interventionX + W - PAD.right) / 2} y={PAD.top + 18} fontSize={8} fill="var(--accent)" fontWeight={600} textAnchor="middle">Post-period</text>
        </svg>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.3rem' }}>
          Hover / select a donor to highlight it. Causal effect = gap between treated and synthetic control post-intervention.
        </div>
      </div>

      {/* MCQ Exercise */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Quick check</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{MCQ_SC.question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {MCQ_SC.options.map(opt => {
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
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          A consistent 10% pre-treatment gap means your synthetic control is not tracking the treated unit's actual trajectory — it is systematically undershooting. Even if the 10% gap stays constant post-treatment, you cannot tell whether the constant gap reflects the treatment effect or just your imperfect fit. A reliable estimate requires close pre-treatment fit. With a persistent gap, any post-treatment comparison is contaminated. The right response: expand the donor pool, adjust predictor variables, or acknowledge that synthetic control may not be feasible here.
        </p>
      </div>

      {/* ── Analyst Move ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Always plot the pre-treatment fit prominently in any synthetic control analysis. The quality of the counterfactual lives or dies on this chart. A synthetic control that tracks the treated unit closely for 18 months before treatment is credible evidence of a valid counterfactual. A synthetic control that diverges in the pre-period is not, regardless of what happens post-treatment.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Use placebo tests and report them. Do not just show the Japan gap — show the distribution of gaps from all 15 placebo markets and where Japan's gap falls in that distribution. If Japan's post-treatment gap is larger than 95% of the placebo gaps, that is your significance statement. It is transparent and auditable in a way that a single p-value often is not.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Synthetic control is overkill for many product questions and essential for a few. Use it when: you have one treated entity (market, channel, user segment), the treatment is a discrete event, you have a long pre-period, and no single comparison unit is adequate. Do not use it when you can randomize, or when the pre-treatment period is too short to build a reliable synthetic composite.</p>
        </div>
      </div>

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Synthetic control is most useful when you are evaluating a major product change in a single geography, channel, or segment where a randomized experiment was not run. It is the highest-quality non-experimental method for single-unit treatment — but it is not a substitute for randomization when randomization was possible. If the team chose not to A/B test, synthetic control is what you reach for afterward to try to recover causal estimates.'}
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
