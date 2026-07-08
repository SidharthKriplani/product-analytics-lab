import { useState, useMemo, useEffect } from 'react';
import { loadSFState, saveSFState } from '../../../utils/statsFoundationsState.js';
import { Icon } from '../../shared/Icon.jsx';

const MCQ_RD = {
  question: 'A loyalty program gives a bonus reward to customers who spend over $500 in a month. You want to estimate the causal effect of the reward on next-month retention. Why is regression discontinuity valid here?',
  options: [
    {
      id: 'a',
      label: 'Customers just above and just below $500 are similar to each other, so the comparison is nearly as clean as random assignment',
      correct: true,
      feedback: 'Correct. The key RD insight: near the threshold, assignment is essentially local random. A customer who spent $499 vs $501 likely differs only by chance, not by meaningful underlying differences. That near-randomness makes the comparison credible.',
    },
    {
      id: 'b',
      label: 'Customers who cross the $500 threshold are higher-value spenders overall, which structurally makes them a stronger control group',
      correct: false,
      feedback: 'This gets the logic backwards. Higher-value customers are precisely why you cannot compare them to all other customers. RD works because it compares very similar customers near the threshold, not because the treated group is better.',
    },
    {
      id: 'c',
      label: 'The $500 threshold was set randomly by the company policy team, so treatment assignment above and below it is fully random',
      correct: false,
      feedback: 'RD does not require that the threshold itself was set randomly. It requires that customers cannot precisely control whether they end up just above or just below the threshold. The threshold can be rule-based as long as sorting is imprecise.',
    },
  ],
};

const W = 460;
const H = 200;
const PAD = { left: 40, right: 20, top: 20, bottom: 30 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;
const CUTOFF_SCORE = 680;
const SCORE_MIN = 620;
const SCORE_MAX = 740;

function scoreToX(score) {
  return PAD.left + ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * INNER_W;
}

function rateToY(rate) {
  return PAD.top + (1 - rate) * INNER_H;
}

// Generates outcome points (default rate or GMV rate depending on context)
function genPoints(hasBunching) {
  const pts = [];
  for (let s = SCORE_MIN; s <= SCORE_MAX; s += 5) {
    const isAbove = s >= CUTOFF_SCORE;
    const baseRate = isAbove ? 0.62 : 0.45;
    const noise = (Math.sin(s * 0.3) * 0.04);
    // If bunching, add extra 'fake' dots just above cutoff
    if (hasBunching && s >= CUTOFF_SCORE && s <= CUTOFF_SCORE + 15) {
      pts.push({ score: s, rate: baseRate + noise + 0.05, fake: true });
    } else {
      pts.push({ score: s, rate: baseRate + noise, fake: false });
    }
  }
  return pts;
}

// Density bar heights (simulating a histogram of score counts near cutoff)
function genDensity(hasBunching) {
  const bars = [];
  for (let s = SCORE_MIN; s < SCORE_MAX; s += 10) {
    let height = 0.4 + Math.abs(Math.sin(s * 0.15)) * 0.3;
    if (hasBunching && s >= CUTOFF_SCORE && s < CUTOFF_SCORE + 20) {
      height += 0.45; // spike just above cutoff
    }
    if (hasBunching && s >= CUTOFF_SCORE - 20 && s < CUTOFF_SCORE) {
      height -= 0.2; // dip just below
    }
    bars.push({ score: s, height: Math.max(0.05, Math.min(1, height)) });
  }
  return bars;
}

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module23_RD({ module, onNext }) {
  var _saved = loadSFState('sf23');
  const [showManipulation, setShowManipulation] = useState(function() { return _saved ? !!_saved.showManipulation : false; });
  const [view, setView] = useState(function() { return _saved ? (_saved.view || 'outcome') : 'outcome'; }); // 'outcome' | 'density'
  const [mcqAnswer, setMcqAnswer] = useState(function() { return _saved ? (_saved.mcqAnswer || null) : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved ? !!_saved.mcqRevealed : false; });

  useEffect(function() {
    saveSFState('sf23', { showManipulation: showManipulation, view: view, mcqAnswer: mcqAnswer, mcqRevealed: mcqRevealed });
  }, [showManipulation, view, mcqAnswer, mcqRevealed]);

  function handleMcq(optId) {
    if (mcqRevealed) return;
    setMcqAnswer(optId);
    setMcqRevealed(true);
  }

  const outcomePoints = useMemo(() => genPoints(showManipulation), [showManipulation]);
  const densityBars = useMemo(() => genDensity(showManipulation), [showManipulation]);
  const cutoffX = scoreToX(CUTOFF_SCORE);

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          Your product approves a premium feature for anyone with a credit score of 680 or higher. You want to know something specific: does getting approved <em>cause</em> people to convert to a paid plan more often — or do approved people just convert more because they were already the kind of user who would?
        </p>
        <p style={prose}>
          Comparing everyone approved to everyone rejected won't answer that. Approved users have higher credit scores, and credit score correlates with income, financial stability, and general engagement — all things that independently predict conversion, with or without the approval. You can't run an experiment either; 680 is a risk policy, not a coin flip you get to control.
        </p>
        <p style={prose}>
          Pause here: is there any way to make this comparison fair, given you can't randomize and a direct comparison is contaminated?
        </p>
        <p style={prose}>
          There is — and it's hiding in the one part of this setup you'd normally treat as an obstacle: the cutoff itself. A user with a 679 and a user with a 681 are, in every way that matters, the same person. A two-point gap in a credit score is close to noise — nobody is meaningfully more "creditworthy" over two points. And yet one of them gets approved and the other doesn't. Right at that boundary, approval is <em>effectively</em> random, even though nothing about the setup was.
        </p>
        <p style={prose}>
          That's <strong style={{ color: 'var(--text)' }}>Regression Discontinuity</strong>: compare outcomes for people just below the cutoff to people just above it, where the "as-good-as-random" comparison you couldn't get any other way falls directly out of the policy's own sharp line. In the chart below, conversion sits around 45% just under 680 and jumps to about 62% right at the line — that roughly 17-point jump, occurring exactly at the threshold and nowhere else, is the causal estimate.
        </p>
        <p style={prose}>
          One assumption has to hold for that jump to mean what you think it means: <strong style={{ color: 'var(--text)' }}>nobody can manipulate which side of 680 they land on</strong>. If users know about the threshold and can nudge their score up two points to sneak over it, the people just above 680 stop being a random slice of "close to 680" — they become the subset who specifically tried, and trying is correlated with exactly the motivation that also predicts conversion. You check this the way you'd check a coin for a hidden weight: count how many people land at each score near the cutoff. A smooth, even spread is what random assignment looks like. A spike just above 680 and a matching dip just below means people are gaming the cutoff — and the moment you see that, the design is invalid, no matter how clean the jump looks.
        </p>
        <p style={prose}>
          The other catch: this estimate is <strong style={{ color: 'var(--text)' }}>local</strong>. It tells you what happens to people within a few points of 680 — not to someone at 550, not to someone at 800. Whatever the approval effect is at the boundary is a statement about the boundary, not about your whole user base.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You run an RD analysis on exam scores and scholarship assignment (cutoff: 70/100). You find a jump in long-term earnings at the cutoff. But someone suggests students who barely passed might have studied harder afterward due to relief. How would this confound your RD estimate?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Examine the Threshold Jump</div>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Look at the outcome view first — observe the sharp jump in conversion rate at the 680 credit score threshold. Switch to the density view to check the McCrary test (smooth density = valid RD). Then toggle "Show manipulation" to see what bunching looks like and why it invalidates the design.
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>View:</span>
        {['outcome', 'density'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', borderRadius: 'var(--radius-sm)', border: `1px solid ${view === v ? 'var(--accent-border)' : 'var(--border)'}`, background: view === v ? 'var(--accent-bg)' : 'var(--surface)', color: view === v ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: view === v ? 700 : 400 }}>
            {v === 'outcome' ? 'Outcome jump' : 'Score density (McCrary)'}
          </button>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <input type="checkbox" checked={showManipulation} onChange={e => setShowManipulation(e.target.checked)} style={{ accentColor: 'var(--red)', width: 14, height: 14 }} />
          Show manipulation
        </label>
      </div>

      {/* SVG visualisation */}
      <div style={{ background: 'var(--surface-2)', border: `1.5px solid ${showManipulation ? 'var(--red-border)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '0.75rem', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: 'block', margin: '0 auto' }}>
          {/* Background zones */}
          <rect x={PAD.left} y={PAD.top} width={cutoffX - PAD.left} height={INNER_H} fill="var(--surface)" opacity={0.6} />
          <rect x={cutoffX} y={PAD.top} width={PAD.left + INNER_W - (cutoffX - PAD.left)} height={INNER_H} fill="var(--accent-bg)" opacity={0.4} />

          {/* Threshold line */}
          <line x1={cutoffX} y1={PAD.top - 5} x2={cutoffX} y2={PAD.top + INNER_H} stroke={showManipulation ? 'var(--red)' : 'var(--accent)'} strokeWidth={2} strokeDasharray="5,3" />
          <text x={cutoffX + 4} y={PAD.top + 12} fontSize={9} fill={showManipulation ? 'var(--red)' : 'var(--accent)'} fontWeight={700}>{showManipulation ? '⚠ 680 cutoff' : '680 cutoff'}</text>

          {view === 'outcome' ? (
            <>
              {/* Outcome dots */}
              {outcomePoints.map((p, i) => (
                <circle key={i} cx={scoreToX(p.score)} cy={rateToY(p.rate)} r={4}
                  fill={p.fake ? 'var(--red)' : p.score >= CUTOFF_SCORE ? 'var(--accent)' : 'var(--text-muted)'}
                  opacity={p.fake ? 0.95 : 0.75}
                />
              ))}
              {/* Discontinuity bracket */}
              {!showManipulation && (
                <>
                  <line x1={cutoffX - 1} y1={rateToY(0.45)} x2={cutoffX - 1} y2={rateToY(0.62)} stroke="var(--green)" strokeWidth={2} />
                  <text x={cutoffX - 30} y={rateToY(0.535)} fontSize={9} fill="var(--green)" fontWeight={700} textAnchor="middle">Causal jump</text>
                </>
              )}
              {/* Axis labels */}
              <text x={PAD.left} y={H - 4} fontSize={8} fill="var(--text-muted)">620</text>
              <text x={W - PAD.right} y={H - 4} fontSize={8} fill="var(--text-muted)" textAnchor="end">740</text>
              <text x={cutoffX} y={H - 4} fontSize={8} fill="var(--text-muted)" textAnchor="middle">Credit score →</text>
              <text x={PAD.left - 8} y={PAD.top + INNER_H / 2} fontSize={8} fill="var(--text-muted)" textAnchor="middle" transform={`rotate(-90, ${PAD.left - 8}, ${PAD.top + INNER_H / 2})`}>Conversion rate</text>
              {/* Zone labels */}
              <text x={(PAD.left + cutoffX) / 2} y={PAD.top + 14} fontSize={9} fill="var(--text-muted)" textAnchor="middle">Below cutoff</text>
              <text x={(cutoffX + W - PAD.right) / 2} y={PAD.top + 14} fontSize={9} fill="var(--accent)" fontWeight={600} textAnchor="middle">Above cutoff</text>
            </>
          ) : (
            <>
              {/* Density bars (McCrary test visualization) */}
              {densityBars.map((b, i) => {
                const barW = INNER_W / densityBars.length - 1;
                const barH = b.height * (INNER_H * 0.8);
                const bx = scoreToX(b.score);
                const isBunched = showManipulation && b.score >= CUTOFF_SCORE && b.score < CUTOFF_SCORE + 20;
                const isDepleted = showManipulation && b.score >= CUTOFF_SCORE - 20 && b.score < CUTOFF_SCORE;
                const fillColor = isBunched ? 'var(--red)' : isDepleted ? 'var(--yellow)' : b.score >= CUTOFF_SCORE ? 'var(--accent)' : 'var(--teal)';
                return (
                  <rect key={i} x={bx} y={PAD.top + INNER_H - barH} width={barW} height={barH}
                    fill={fillColor} opacity={0.7} rx={1} />
                );
              })}
              {/* Axis labels */}
              <text x={cutoffX} y={H - 4} fontSize={8} fill="var(--text-muted)" textAnchor="middle">Credit score →</text>
              <text x={PAD.left - 8} y={PAD.top + INNER_H / 2} fontSize={8} fill="var(--text-muted)" textAnchor="middle" transform={`rotate(-90, ${PAD.left - 8}, ${PAD.top + INNER_H / 2})`}>Count</text>
              {showManipulation && (
                <>
                  <text x={(cutoffX + cutoffX + 30) / 2} y={PAD.top + 14} fontSize={9} fill="var(--red)" fontWeight={700} textAnchor="middle">Bunching ↑</text>
                  <text x={(cutoffX - 20 + cutoffX) / 2 - 15} y={PAD.top + 14} fontSize={9} fill="var(--yellow-text)" fontWeight={700} textAnchor="middle">Dip ↓</text>
                </>
              )}
              {!showManipulation && (
                <text x={cutoffX} y={PAD.top + 14} fontSize={9} fill="var(--green)" fontWeight={700} textAnchor="middle">Smooth ✓</text>
              )}
            </>
          )}
        </svg>
        <div style={{ fontSize: '0.75rem', color: showManipulation ? 'var(--red)' : 'var(--text-muted)', textAlign: 'center', marginTop: '0.35rem', fontWeight: showManipulation ? 700 : 400 }}>
          {view === 'outcome'
            ? (showManipulation ? 'Red dots = manipulators above threshold who are systematically different — RD comparison is contaminated.' : 'Sharp jump at 680 is the causal estimate (LATE). Units just below are the counterfactual for units just above.')
            : (showManipulation ? 'McCrary density test: statistically significant bunching above cutoff + dip below = manipulation detected. RD is not valid.' : 'Smooth density through threshold = no manipulation. Local randomization assumption is credible.')
          }
        </div>
      </div>

      {/* MCQ Exercise */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Quick check</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{MCQ_RD.question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {MCQ_RD.options.map(opt => {
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
            If students who barely passed (just above 70) respond to their success by studying harder — a behavioral response to crossing the threshold that is separate from the scholarship treatment — then the RD estimate conflates the scholarship effect with the study-harder effect. This violates the continuity assumption: there is a mechanism other than treatment that changes at exactly the threshold. In practice, you would look for evidence of this by checking whether other behaviors (study hours, tutoring use) also jump at the threshold. If they do, the estimate is suspect.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {mcqRevealed && (
        <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Before using RD, check the density plot of your running variable around the threshold. Spikes just above the cutoff signal manipulation — users gaming the system. If you see this, the design is invalid. A uniform distribution near the threshold is evidence (not proof) that no manipulation is occurring.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> When reporting RD results, show the scatter plot of the outcome vs. running variable across the full range, with the fitted curves on each side and the jump at the threshold visible. This makes the evidence legible: the audience can see whether there is a plausible discontinuity or whether you are fitting noise. A jump that looks visually obvious is far more convincing than a coefficient in a table.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Consider whether the estimate is local enough to generalize to your actual decision. If the business question is "should we keep the approval line at 680?" — the RD estimate, which describes behavior at exactly 680, is directly relevant. If the question is "should we relax underwriting across the board?" — the estimate for users right at 680 tells you little about what approval would do for someone at 550. Be precise about the population the estimate applies to.</p>
          </div>
        </div>
      )}

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'RD is the observational method that most closely mimics a randomized experiment — local randomization near the threshold produces identification that is nearly as credible as random assignment. Unlike DiD, it does not require a parallel-trends assumption. Unlike synthetic control, it does not require a long pre-treatment period. The cost is generalizability: the estimate applies only to units near the threshold.'}
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
