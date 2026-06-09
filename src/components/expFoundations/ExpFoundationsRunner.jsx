import { useState, useEffect, useMemo } from 'react';
import { expFoundationModules } from '../../data/expFoundationModules.js';
import { saveExpFoundationProgress, getAllExpFoundationProgress } from '../../utils/expFoundationProgress.js';
import { track } from '../../utils/analytics.js';
import { InsightBox as SharedInsightBox, NextBtn as SharedNextBtn, MCQOption, CheckBtn as SharedCheckBtn, InstructionBox as SharedInstructionBox } from '../shared/FoundationPrimitives.jsx';
import { FoundationRunnerShell } from '../shared/FoundationRunnerShell.jsx';

// ── Thin wrappers: shared primitives default to teal; ExpFoundations uses accent (blue) ──
function InsightBox(props) {
  return <SharedInsightBox color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)' {...props} />;
}
function NextBtn(props) {
  return <SharedNextBtn color='var(--accent)' {...props} />;
}
function CheckBtn(props) {
  return <SharedCheckBtn color='var(--accent)' {...props} />;
}
function InstructionBox(props) {
  return <SharedInstructionBox color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)' {...props} />;
}

// ── Persistence helpers ──────────────────────────────────────────────────────
function saveEFState(id, state) {
  try { localStorage.setItem('pal-ef-' + id + '-v1', JSON.stringify(state)); } catch(e) {}
}
function loadEFState(id) {
  try { var raw = localStorage.getItem('pal-ef-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; }
}
function shuffleEF(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

// ── Module EF01: Why We Experiment ─────────────────────────────────────────
var EF01_CLAIMS = [
  { id: 'c1', text: 'Users who complete onboarding have 3x higher retention', answer: 'correlation', explanation: 'Users who complete onboarding may be more motivated to begin with. The onboarding didn\'t necessarily cause retention — motivated users both finish onboarding and stick around.' },
  { id: 'c2', text: 'Countries that eat more chocolate win more Nobel prizes', answer: 'correlation', explanation: 'A famous spurious correlation. Wealth drives both chocolate consumption and research funding. There is no causal mechanism from chocolate to Nobel prizes.' },
  { id: 'c3', text: 'Adding a progress bar increased signup completion by 12% in our A/B test', answer: 'causal', explanation: 'This came from a controlled A/B test with random assignment. The only systematic difference between groups was the progress bar, so the 12% lift is a causal estimate.' },
  { id: 'c4', text: 'Power users who enable notifications churn 40% less', answer: 'correlation', explanation: 'Power users are already more engaged — they enable notifications because they care, and they churn less because they\'re invested. The notification setting is a symptom of engagement, not a cause of retention.' },
  { id: 'c5', text: 'We randomly assigned 50% of new users to a simplified pricing page and saw 8% higher plan upgrades', answer: 'causal', explanation: 'Random assignment ensures the groups are comparable. The simplified pricing page is the only systematic difference, so the 8% lift is causal.' },
  { id: 'c6', text: 'Customers who contact support within their first week have 2x higher lifetime value', answer: 'correlation', explanation: 'Customers who contact support early may be more invested in the product. The support interaction correlates with engagement, but didn\'t cause the higher LTV.' },
];

function Module_EF01({ onComplete }) {
  var saved01 = useMemo(function() { return loadEFState('ef01'); }, []);
  var [classifications, setClassifications] = useState(function() { return saved01 && saved01.classifications ? saved01.classifications : {}; });
  var [revealed, setRevealed] = useState(function() { return saved01 ? saved01.revealed : false; });
  var [mcqAnswer, setMcqAnswer] = useState(function() { return saved01 ? saved01.mcqAnswer : null; });
  var [mcqRevealed, setMcqRevealed] = useState(function() { return saved01 ? saved01.mcqRevealed : false; });

  useEffect(function() {
    saveEFState('ef01', { classifications: classifications, revealed: revealed, mcqAnswer: mcqAnswer, mcqRevealed: mcqRevealed });
  }, [classifications, revealed, mcqAnswer, mcqRevealed]);

  function handleClassify(id, value) {
    if (revealed) return;
    var next = Object.assign({}, classifications);
    next[id] = value;
    setClassifications(next);
  }

  var allClassified = Object.keys(classifications).length === EF01_CLAIMS.length;
  var correctCount = 0;
  if (revealed) {
    EF01_CLAIMS.forEach(function(c) {
      if (classifications[c.id] === c.answer) correctCount++;
    });
  }

  var mcqOptions = [
    { label: 'A. A strong relationship (r > 0.8) between two variables is sufficient evidence of causation', correct: false },
    { label: 'B. Only controlled experiments with random assignment can establish causality — observational data shows correlation regardless of effect size', correct: true },
    { label: 'C. Causation requires a large sample size; correlation is what you get with small samples', correct: false },
    { label: 'D. If you control for confounders in a regression, the remaining effect is causal', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your analytics team presents a finding: users who completed the new onboarding flow have 3x higher 30-day retention than those who skipped it. The product lead wants to invest the entire Q3 roadmap into forcing all users through the onboarding flow.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          But wait. The users who completed onboarding chose to do so. They were already more motivated, more curious, more likely to stick around. The onboarding didn\'t necessarily cause their retention — their motivation caused both behaviors. This is the fundamental problem: without random assignment, you cannot separate what the product did from who the users already were.
        </p>
      </div>

      {/* ── The Concept + Interactive Demo ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Causality Classifier</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
          Below are six real-world claims. For each one, decide: is this evidence of a <strong>causal</strong> relationship (from a controlled experiment), or merely a <strong>correlation</strong> (from observational data)? The distinction is everything.
        </p>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          {EF01_CLAIMS.map(function(claim, idx) {
            var userChoice = classifications[claim.id];
            var isCorrect = userChoice === claim.answer;
            return (
              <div key={claim.id} style={{ marginBottom: idx < EF01_CLAIMS.length - 1 ? '1rem' : 0 }}>
                <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '0.5rem', fontWeight: 600 }}>
                  {idx + 1}. {claim.text}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={function() { handleClassify(claim.id, 'causal'); }}
                    style={{
                      padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 600, cursor: revealed ? 'default' : 'pointer',
                      border: '1.5px solid ' + (userChoice === 'causal' ? 'var(--accent)' : 'var(--border)'),
                      background: userChoice === 'causal' ? 'var(--accent-bg)' : 'var(--surface)',
                      color: userChoice === 'causal' ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                  >Causal</button>
                  <button
                    onClick={function() { handleClassify(claim.id, 'correlation'); }}
                    style={{
                      padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 600, cursor: revealed ? 'default' : 'pointer',
                      border: '1.5px solid ' + (userChoice === 'correlation' ? 'var(--purple)' : 'var(--border)'),
                      background: userChoice === 'correlation' ? 'var(--purple-bg)' : 'var(--surface)',
                      color: userChoice === 'correlation' ? 'var(--purple)' : 'var(--text-muted)',
                    }}
                  >Correlational</button>
                </div>
                {revealed && (
                  <div className='pal-reveal-in' style={{
                    marginTop: '0.4rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', lineHeight: 1.5,
                    background: isCorrect ? 'var(--teal-bg)' : 'var(--red-bg)',
                    border: '1px solid ' + (isCorrect ? 'var(--teal-border)' : 'var(--red-border)'),
                    color: 'var(--text)',
                  }}>
                    <strong>{isCorrect ? 'Correct. ' : 'Not quite. '}</strong>{claim.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {allClassified && !revealed && (
            <div style={{ marginTop: '1rem' }}>
              <CheckBtn onClick={function() { setRevealed(true); }} />
            </div>
          )}
          {revealed && (
            <div className='pal-reveal-in' style={{ marginTop: '1rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text)' }}>
              You got <strong>{correctCount}</strong> out of <strong>{EF01_CLAIMS.length}</strong> correct. The pattern: the only claims that are causal are the ones from controlled A/B tests with random assignment. Everything else — no matter how strong the relationship looks — is correlation.
            </div>
          )}
        </div>
      </div>

      {/* ── The Framework ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Framework</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          When someone presents a data finding, ask one question: <strong>was there random assignment?</strong> If users were randomly split into treatment and control, the comparison is causal. If users self-selected into groups (completed onboarding vs didn\'t, enabled notifications vs didn\'t, purchased vs didn\'t), the comparison is correlational — no matter how large the effect size, how many users are in the sample, or how many confounders you control for in a regression.
        </p>
      </div>

      {/* ── Quick Check ── */}
      {revealed && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Check</div>
          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            Which statement best captures the relationship between correlation and causation?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {mcqOptions.map(function(opt, i) {
              return (
                <MCQOption key={i} label={opt.label} selected={mcqAnswer === i} correct={opt.correct} revealed={mcqRevealed} onClick={function() { if (!mcqRevealed) setMcqAnswer(i); }} />
              );
            })}
          </div>
          {mcqAnswer !== null && !mcqRevealed && (
            <CheckBtn onClick={function() { setMcqRevealed(true); }} />
          )}
          {mcqRevealed && (
            <div className='pal-reveal-in' style={{
              marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', lineHeight: 1.55,
              background: mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
              border: '1px solid ' + (mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
              color: 'var(--text)',
            }}>
              <strong>{mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'Correct. ' : 'Not quite. '}</strong>
              Regression can reduce confounding but never eliminates it — there are always unmeasured confounders. Large samples increase statistical power but don\'t fix selection bias. Only random assignment guarantees that the groups are comparable on every dimension, measured and unmeasured.
            </div>
          )}
        </div>
      )}

      {/* ── Key Takeaway ── */}
      {mcqRevealed && (
        <div>
          <InsightBox>
            Observational data tells you what happened. Only experiments tell you why. The difference is random assignment — it breaks the link between who the users are and what treatment they received. Every other method, no matter how sophisticated, leaves the door open to confounders you haven\'t measured.
          </InsightBox>
          <NextBtn onClick={onComplete} />
        </div>
      )}
    </div>
  );
}

var SCENARIOS_EF02 = [
  {
    text: 'Testing a new checkout flow',
    correct: 'user',
    explanation: 'User-level: a user should see the same checkout flow across all sessions, or the experience is inconsistent and you cannot attribute conversion changes to the variant.',
  },
  {
    text: 'Testing a sponsored post ranking algorithm on a social feed',
    correct: 'user',
    explanation: 'User-level: social network effects mean friends influence each other. Session-level randomization would cause the same user to see different ranking logic across sessions, contaminating the result.',
  },
  {
    text: 'Testing a page load speed optimization',
    correct: 'page',
    explanation: 'Page/request-level: load speed has no user-state dependency — each request is independent. This allows faster ramp-up and higher statistical power with no spillover risk.',
  },
  {
    text: 'Testing a referral program',
    correct: 'cluster',
    explanation: 'Cluster/household-level: referral programs have strong spillover — a user in control can receive an invite from a user in treatment. Randomizing at cluster level prevents this contamination.',
  },
];

// ── Module EF02: The Unit of Randomization ─────────────────────────────────
function Module_EF02({ onComplete }) {
  const UNITS = [
    { id: 'user',    label: 'User-level' },
    { id: 'session', label: 'Session-level' },
    { id: 'page',    label: 'Page/request-level' },
    { id: 'cluster', label: 'Cluster/household-level' },
  ];

  const _saved02 = useMemo(function() { return loadEFState('ef02'); }, []);
  const [scenarios02, setScenarios02] = useState(function() {
    return _saved02 && _saved02.scenarios ? _saved02.scenarios : shuffleEF(SCENARIOS_EF02);
  });
  const [assignments, setAssignments] = useState(_saved02 ? _saved02.assignments : {});
  const [revealed, setRevealed] = useState(_saved02 ? _saved02.revealed : false);

  useEffect(function() { saveEFState('ef02', { scenarios: scenarios02, assignments: assignments, revealed: revealed }); }, [scenarios02, assignments, revealed]);

  function assign(idx, unitId) {
    if (revealed) return;
    setAssignments(prev => ({ ...prev, [idx]: unitId }));
  }

  const allAssigned = scenarios02.every((_, i) => assignments[i]);
  const correctCount = scenarios02.filter((s, i) => assignments[i] === s.correct).length;

  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Your PM wants to A/B test a new one-click checkout flow. She proposes randomizing by session: each time a user visits, they\'re independently assigned to control or treatment. On paper this sounds fine — more sessions means more data. But a returning user might see the old checkout on Monday and the new one on Tuesday. They\'re confused, they abandon, and support tickets spike. Worse, if a user converts in treatment and then returns in control, their behavior is contaminated — you can\'t attribute the purchase cleanly. Session-level randomization is one of the most common design mistakes interviewers probe for, and it shows up in every checkout, subscription, and onboarding experiment.
      </p>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        This module covers how to choose the right randomization unit for different experiment types.
        Picking the wrong unit is one of the most common design mistakes interviewers probe for — it causes
        inconsistent experiences, spillover contamination, and invalid results.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        The randomization unit determines which entity gets assigned to control or treatment.
        Picking the wrong unit causes inconsistent user experiences, spillover, or inflated false positive rates.
        Classify each scenario to the correct randomization unit.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Classify each experiment to the correct randomization unit</div>

      <InstructionBox>
        Assign each scenario to the correct randomization unit by clicking one of the four buttons below
        it. Think about spillover risk and whether the same entity needs a consistent experience across
        multiple interactions before assigning.
      </InstructionBox>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
        {scenarios02.map((s, i) => {
          const picked = assignments[i];
          const isCorrect = picked === s.correct;
          return (
            <div key={i} style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '0.65rem' }}>
                {s.text}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {UNITS.map(u => {
                  let bg = 'var(--surface)';
                  let border = 'var(--border)';
                  let color = 'var(--text-muted)';
                  if (picked === u.id) {
                    if (!revealed) { bg = 'var(--accent-bg)'; border = 'var(--accent-border)'; color = 'var(--accent)'; }
                    else if (isCorrect) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
                    else { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
                  } else if (revealed && u.id === s.correct) {
                    bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)';
                  }
                  return (
                    <button key={u.id} onClick={() => assign(i, u.id)} disabled={revealed} style={{
                      padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 600,
                      background: bg, border: '1.5px solid ' + border, color,
                      borderRadius: 'var(--radius-sm)', cursor: revealed ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                    }}>
                      {u.label}
                    </button>
                  );
                })}
              </div>
              {revealed && (
                <div style={{
                  marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5,
                  borderTop: '1px solid var(--border)', paddingTop: '0.5rem',
                }}>
                  {isCorrect ? '✓' : '✗'} {s.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!revealed && allAssigned && (
        <>
          <InstructionBox>
            Click Check answers to see the correct grouping and learn why each randomization unit applies
            to that scenario.
          </InstructionBox>
          <button onClick={() => setRevealed(true)} style={{
            padding: '0.55rem 1.2rem', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
          }}>
            Check answers
          </button>
        </>
      )}

      {revealed && (
        <div>
          <div style={{
            marginTop: '0.75rem', padding: '0.65rem 0.85rem',
            background: correctCount === scenarios02.length ? 'var(--teal-bg)' : 'var(--yellow-bg)',
            border: '1px solid ' + (correctCount === scenarios02.length ? 'var(--teal-border)' : 'var(--yellow-border)'),
            color: correctCount === scenarios02.length ? 'var(--teal)' : 'var(--yellow)',
            fontWeight: 700, fontSize: '0.88rem', borderRadius: 'var(--radius-sm)',
          }}>
            {correctCount}/{scenarios02.length} correct
          </div>
          <InsightBox>
            The randomization unit must match the unit of analysis and eliminate spillover. Network effects
            (social, referral, marketplace) require cluster-level randomization. User-level is the default
            for most product experiments because it ensures consistent experience across sessions.
            Page-level is safe only when each request is truly independent.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module EF03: Statistical Power and MDE ─────────────────────────────────
function Module_EF03({ onComplete }) {
  var saved03 = useMemo(function() { return loadEFState('ef03'); }, []);
  var [baseline, setBaseline] = useState(function() { return saved03 && saved03.baseline !== undefined ? saved03.baseline : 15; });
  var [mdeRel, setMdeRel] = useState(function() { return saved03 && saved03.mdeRel !== undefined ? saved03.mdeRel : 5; });
  var [sigLevel, setSigLevel] = useState(function() { return saved03 && saved03.sigLevel !== undefined ? saved03.sigLevel : 5; });
  var [triedPreset, setTriedPreset] = useState(function() { return saved03 ? saved03.triedPreset : false; });
  var [mcqAnswer, setMcqAnswer] = useState(function() { return saved03 ? saved03.mcqAnswer : null; });
  var [mcqRevealed, setMcqRevealed] = useState(function() { return saved03 ? saved03.mcqRevealed : false; });

  useEffect(function() {
    saveEFState('ef03', { baseline: baseline, mdeRel: mdeRel, sigLevel: sigLevel, triedPreset: triedPreset, mcqAnswer: mcqAnswer, mcqRevealed: mcqRevealed });
  }, [baseline, mdeRel, sigLevel, triedPreset, mcqAnswer, mcqRevealed]);

  // Z-scores for common alpha levels (two-tailed)
  function getZAlpha(alpha) {
    if (alpha <= 1) return 2.576;
    if (alpha <= 2) return 2.326;
    if (alpha <= 3) return 2.17;
    if (alpha <= 5) return 1.96;
    if (alpha <= 7) return 1.81;
    return 1.645;
  }
  var zAlpha = getZAlpha(sigLevel);
  var zBeta = 0.84; // 80% power

  var p = baseline / 100;
  var delta = p * (mdeRel / 100);
  var nPerArm = delta > 0 ? Math.ceil(Math.pow(zAlpha + zBeta, 2) * 2 * p * (1 - p) / Math.pow(delta, 2)) : 999999999;
  var dailyTraffic = 10000;
  var weeks = Math.ceil((nPerArm * 2 / dailyTraffic) / 7 * 10) / 10;

  function handlePreset() {
    setBaseline(15);
    setMdeRel(5);
    setSigLevel(5);
    setTriedPreset(true);
  }

  var mcqOptions = [
    { label: 'A. It doubles — sample size scales linearly with 1/MDE', correct: false },
    { label: 'B. It quadruples — sample size scales with 1/MDE squared, so halving MDE means 4x the sample', correct: true },
    { label: 'C. It stays the same — MDE only affects the analysis, not the required sample', correct: false },
    { label: 'D. It depends entirely on the baseline rate, not the MDE', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your PM wants to test a new checkout flow. The current signup completion rate is 15%. She asks: "How long will this experiment take to run?" You need to answer with a number, not a shrug.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          The answer depends on three inputs: your baseline rate, how small an effect you need to detect (the MDE), and how much false-positive risk you\'re willing to tolerate (significance level). Getting these wrong means either running an experiment for months that should take weeks, or shipping a result that was never real.
        </p>
      </div>

      {/* ── The Concept + Interactive Demo ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Power Calculator Playground</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
          Drag the sliders to see how baseline rate, MDE, and significance level affect sample size. The formula: n per arm = (Z_alpha + Z_beta)^2 * 2p(1-p) / delta^2, where delta = baseline * relative MDE. Watch how small MDE changes cause massive sample size swings.
        </p>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          {/* Preset button */}
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={handlePreset} style={{
              padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid var(--accent)', background: triedPreset ? 'var(--accent-bg)' : 'var(--surface)', color: 'var(--accent)',
            }}>
              Preset: Typical signup flow (15% baseline, 5% relative MDE)
            </button>
          </div>

          {/* Baseline slider */}
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Baseline rate: <strong style={{ color: 'var(--text)' }}>{baseline}%</strong>
            </label>
            <input type='range' min={1} max={50} step={1} value={baseline} onChange={function(e) { setBaseline(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          {/* MDE slider */}
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              MDE (relative lift): <strong style={{ color: 'var(--text)' }}>{mdeRel}%</strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(absolute: {(p * mdeRel / 100 * 100).toFixed(2)}pp)</span>
            </label>
            <input type='range' min={1} max={20} step={1} value={mdeRel} onChange={function(e) { setMdeRel(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          {/* Significance slider */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Significance level (alpha): <strong style={{ color: 'var(--text)' }}>{sigLevel}%</strong>
            </label>
            <input type='range' min={1} max={10} step={1} value={sigLevel} onChange={function(e) { setSigLevel(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          {/* Results display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>Sample per arm</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{nPerArm > 9999999 ? '---' : nPerArm.toLocaleString()}</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>Total sample (2 arms)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{nPerArm > 9999999 ? '---' : (nPerArm * 2).toLocaleString()}</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>At 10K users/day</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: weeks > 8 ? 'var(--red)' : weeks > 4 ? 'var(--yellow)' : 'var(--teal)' }}>
                {nPerArm > 9999999 ? '---' : weeks + ' weeks'}
              </div>
            </div>
          </div>

          {weeks > 8 && nPerArm < 9999999 && (
            <div className='pal-reveal-in' style={{ padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', background: 'var(--red-bg)', border: '1px solid var(--red-border)', fontSize: '0.82rem', color: 'var(--red)', lineHeight: 1.5 }}>
              Over 8 weeks is a long experiment. Consider increasing MDE (accept detecting only larger effects) or narrowing your target population to boost the baseline rate.
            </div>
          )}
        </div>
      </div>

      {/* ── The Framework ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Framework</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Before running any experiment, answer three questions: <strong>(1)</strong> What is the baseline rate? <strong>(2)</strong> What is the smallest effect worth detecting (MDE)? <strong>(3)</strong> Does my traffic support the runtime the power calculation implies? If the answer to #3 is no, you have three options: accept a larger MDE, narrow the experiment to a higher-traffic segment, or don\'t run the experiment. Never run an underpowered test — a null result from an underpowered test is uninterpretable.
        </p>
      </div>

      {/* ── Quick Check ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Check</div>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          You halve your MDE from 2% relative to 1% relative. What happens to the required sample size?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {mcqOptions.map(function(opt, i) {
            return (
              <MCQOption key={i} label={opt.label} selected={mcqAnswer === i} correct={opt.correct} revealed={mcqRevealed} onClick={function() { if (!mcqRevealed) setMcqAnswer(i); }} />
            );
          })}
        </div>
        {mcqAnswer !== null && !mcqRevealed && (
          <CheckBtn onClick={function() { setMcqRevealed(true); }} />
        )}
        {mcqRevealed && (
          <div className='pal-reveal-in' style={{
            marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', lineHeight: 1.55,
            background: mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            color: 'var(--text)',
          }}>
            <strong>{mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'Correct. ' : 'Not quite. '}</strong>
            n is proportional to 1/MDE^2. Halving MDE means the ratio is 2, and 2^2 = 4. The sample quadruples. This is the single most important relationship in experiment sizing — small MDE ambitions create enormous sample requirements.
          </div>
        )}
      </div>

      {/* ── Key Takeaway ── */}
      {mcqRevealed && (
        <div>
          <InsightBox>
            Sample size scales with 1/MDE squared. This is the central tradeoff in experiment design: the smaller the effect you want to detect, the exponentially more traffic you need. Always run the power calculation before committing to an experiment, and be honest about whether your traffic can support the MDE your stakeholders want.
          </InsightBox>
          <NextBtn onClick={onComplete} />
        </div>
      )}
    </div>
  );
}

var STATEMENTS_EF04 = [
  {
    text: 'A p-value of 0.03 means there is a 3% chance the null hypothesis is true.',
    correct: false,
    explanation: 'FALSE. A p-value is the probability of observing data this extreme (or more) assuming the null is true — it is NOT the probability that the null is true. The probability of the null being true requires Bayesian reasoning and a prior.',
  },
  {
    text: 'A 95% CI that excludes zero means the result is practically significant.',
    correct: false,
    explanation: 'FALSE. Statistical significance (CI excludes zero) says the effect is distinguishable from zero with the given sample size. It says nothing about whether the effect is large enough to matter. A +0.001pp lift can be statistically significant with a large enough sample.',
  },
  {
    text: 'If p > 0.05, the experiment should be considered inconclusive — not proof of no effect.',
    correct: true,
    explanation: 'TRUE. Absence of evidence is not evidence of absence. A non-significant result may mean the effect is real but smaller than your MDE, or that you were underpowered. "We did not detect an effect" is very different from "there is no effect."',
  },
];

// ── Module EF04: p-values, CIs, and What They Actually Mean ───────────────
function Module_EF04({ onComplete }) {
  const _saved04 = useMemo(function() { return loadEFState('ef04'); }, []);
  const [statements04] = useState(function() {
    return _saved04 && _saved04.statements ? _saved04.statements : shuffleEF(STATEMENTS_EF04);
  });
  const [answers, setAnswers] = useState(_saved04 ? _saved04.answers : {});
  const [revealed, setRevealed] = useState(_saved04 ? _saved04.revealed : {});

  useEffect(function() { saveEFState('ef04', { statements: statements04, answers: answers, revealed: revealed }); }, [statements04, answers, revealed]);

  function answer(idx, val) {
    if (revealed[idx]) return;
    setAnswers(prev => ({ ...prev, [idx]: val }));
  }

  function check(idx) {
    setRevealed(prev => ({ ...prev, [idx]: true }));
  }

  const allRevealed = statements04.every((_, i) => revealed[i]);
  const correctCount = statements04.filter((s, i) => answers[i] === s.correct).length;

  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Your team just wrapped a two-week A/B test on the new search ranking algorithm. The PM pulls up the dashboard and announces to the room: "p-value is 0.04 — the result is significant, let\'s ship it." The VP of Product asks a follow-up: "So there\'s a 96% chance the new algorithm is better?" The data scientist on your team winces. Neither statement is quite right, and the distinction matters — because the team is about to make a launch decision based on a number most people in the room are misinterpreting. This is the single most common statistical misunderstanding in product experimentation, and interviewers test it relentlessly.
      </p>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        This module tests whether you can correctly interpret p-values and confidence intervals — the most
        commonly misquoted statistics in product experimentation. Interviewers routinely probe these
        definitions to separate candidates who understand the math from those who memorised a formula.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        p-values and confidence intervals are the most misquoted statistics in product experimentation.
        Mark each statement TRUE or FALSE, then check.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Identify which statistical claims are true and which are common misconceptions</div>

      <InstructionBox>
        Read each statement carefully and click TRUE or FALSE. Think about what the statistic actually
        measures before answering — do not rely on intuition about what "significant" sounds like.
      </InstructionBox>

      {statements04.map((s, i) => {
        const picked = answers[i];
        const isRevealed = revealed[i];
        const isCorrect = picked === s.correct;
        return (
          <div key={i} style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '0.85rem',
          }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              {i + 1}. {s.text}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: isRevealed ? '0.75rem' : 0 }}>
              {[true, false].map(val => {
                let bg = picked === val ? 'var(--accent-bg)' : 'var(--surface)';
                let border = picked === val ? 'var(--accent-border)' : 'var(--border)';
                let color = picked === val ? 'var(--accent)' : 'var(--text-muted)';
                if (isRevealed) {
                  if (val === s.correct) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
                  else if (picked === val) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
                  else { bg = 'var(--surface)'; border = 'var(--border)'; color = 'var(--text-muted)'; }
                }
                return (
                  <button key={String(val)} onClick={() => answer(i, val)} disabled={isRevealed} style={{
                    padding: '0.35rem 1rem', fontSize: '0.82rem', fontWeight: 700,
                    background: bg, border: '1.5px solid ' + border, color,
                    borderRadius: 'var(--radius-sm)', cursor: isRevealed ? 'default' : 'pointer',
                    transition: 'all 0.15s',
                  }}>
                    {val ? 'TRUE' : 'FALSE'}
                  </button>
                );
              })}
              {picked !== undefined && !isRevealed && (
                <button onClick={() => check(i)} style={{
                  padding: '0.35rem 0.85rem', fontSize: '0.82rem', fontWeight: 700,
                  background: 'var(--accent)', color: '#fff', border: 'none',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                }}>
                  Check
                </button>
              )}
            </div>
            {isRevealed && (
              <div style={{
                fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text)',
                padding: '0.5rem 0.75rem',
                background: isCorrect ? 'var(--teal-bg)' : 'var(--red-bg)',
                border: '1px solid ' + (isCorrect ? 'var(--teal-border)' : 'var(--red-border)'),
                borderRadius: 'var(--radius-sm)',
              }}>
                {s.explanation}
              </div>
            )}
          </div>
        );
      })}

      {allRevealed && (
        <div>
          <div style={{
            padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem',
            background: correctCount === statements04.length ? 'var(--teal-bg)' : 'var(--yellow-bg)',
            border: '1px solid ' + (correctCount === statements04.length ? 'var(--teal-border)' : 'var(--yellow-border)'),
            color: correctCount === statements04.length ? 'var(--teal)' : 'var(--yellow)',
            fontWeight: 700, fontSize: '0.88rem',
          }}>
            {correctCount}/{statements04.length} correct
          </div>
          <InsightBox>
            The three failure modes: (1) treating p-value as the probability the null is true (it is not —
            it assumes the null is true and asks how surprising the data is), (2) equating statistical and
            practical significance (significant just means detectable, not meaningful), (3) treating p &gt; 0.05
            as proof of no effect (it is inconclusive — you may have been underpowered).
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module EF05: Sample Ratio Mismatch ─────────────────────────────────────
function Module_EF05({ onComplete }) {
  var saved05 = useMemo(function() { return loadEFState('ef05'); }, []);
  var [controlN, setControlN] = useState(function() { return saved05 && saved05.controlN !== undefined ? saved05.controlN : 50213; });
  var [treatmentN, setTreatmentN] = useState(function() { return saved05 && saved05.treatmentN !== undefined ? saved05.treatmentN : 48891; });
  var [mcqAnswer, setMcqAnswer] = useState(function() { return saved05 ? saved05.mcqAnswer : null; });
  var [mcqRevealed, setMcqRevealed] = useState(function() { return saved05 ? saved05.mcqRevealed : false; });

  useEffect(function() {
    saveEFState('ef05', { controlN: controlN, treatmentN: treatmentN, mcqAnswer: mcqAnswer, mcqRevealed: mcqRevealed });
  }, [controlN, treatmentN, mcqAnswer, mcqRevealed]);

  // SRM calculation
  var total = controlN + treatmentN;
  var expectedEach = total / 2;
  var chiSq = total > 0 ? (Math.pow(controlN - expectedEach, 2) / expectedEach + Math.pow(treatmentN - expectedEach, 2) / expectedEach) : 0;
  var observedRatio = total > 0 ? (controlN / total * 100).toFixed(1) : '50.0';
  var treatmentRatio = total > 0 ? (treatmentN / total * 100).toFixed(1) : '50.0';

  // Approximate p-value from chi-squared (1 df) using rough thresholds
  var pValue = 'p > 0.05';
  var srmStatus = 'green';
  if (chiSq > 10.83) { pValue = 'p < 0.001'; srmStatus = 'red'; }
  else if (chiSq > 6.63) { pValue = 'p < 0.01'; srmStatus = 'red'; }
  else if (chiSq > 3.84) { pValue = 'p < 0.05'; srmStatus = 'red'; }
  else if (chiSq > 2.71) { pValue = 'p < 0.10'; srmStatus = 'yellow'; }

  var statusColor = srmStatus === 'red' ? 'var(--red)' : srmStatus === 'yellow' ? 'var(--yellow)' : 'var(--teal)';
  var statusLabel = srmStatus === 'red' ? 'SRM DETECTED' : srmStatus === 'yellow' ? 'BORDERLINE' : 'NO SRM';
  var statusBg = srmStatus === 'red' ? 'var(--red-bg)' : srmStatus === 'yellow' ? 'var(--yellow-bg)' : 'var(--teal-bg)';
  var statusBorder = srmStatus === 'red' ? 'var(--red-border)' : srmStatus === 'yellow' ? 'var(--yellow-border)' : 'var(--teal-border)';

  var mcqOptions = [
    { label: 'A. Proceed with analysis — the split is close enough to 50/50 for practical purposes', correct: false },
    { label: 'B. Re-weight the metric results by the expected 50/50 ratio to compensate for the imbalance', correct: false },
    { label: 'C. Flag SRM, halt analysis, and investigate the assignment pipeline before trusting any results', correct: true },
    { label: 'D. Extend the experiment until the ratios naturally balance out over time', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your experiment dashboard shows a statistically significant +5% lift in conversion rate for the treatment group. The PM is ready to ship. But before celebrating, you check the sample counts: control has 50,213 users, treatment has 48,891. The experiment was set to a 50/50 split.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          That 1,322-user gap might look small against 99,104 total users. But randomization at this scale should produce near-exact splits. When it doesn\'t, something in your pipeline — bot filtering, redirect latency, logging bugs — is systematically removing users from one arm. And if users are being removed non-randomly, your groups are no longer comparable, and your +5% lift might be entirely an artifact.
        </p>
      </div>

      {/* ── The Concept + Interactive Demo ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>SRM Detector</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
          Adjust the user counts below to see when Sample Ratio Mismatch appears. The chi-squared test compares observed counts against the expected 50/50 split. Try making the counts equal to see the green light, then skew them to watch SRM emerge.
        </p>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          {/* Input controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Control users
              </label>
              <input type='number' min={1000} max={200000} step={100} value={controlN} onChange={function(e) { setControlN(Math.max(1000, Number(e.target.value))); }} style={{
                width: '100%', padding: '0.45rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                background: 'var(--surface-2)', color: 'var(--text)', fontSize: '1rem', fontWeight: 700,
              }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Treatment users
              </label>
              <input type='number' min={1000} max={200000} step={100} value={treatmentN} onChange={function(e) { setTreatmentN(Math.max(1000, Number(e.target.value))); }} style={{
                width: '100%', padding: '0.45rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                background: 'var(--surface-2)', color: 'var(--text)', fontSize: '1rem', fontWeight: 700,
              }} />
            </div>
          </div>

          {/* Traffic light */}
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: statusBg, border: '1.5px solid ' + statusBorder,
            textAlign: 'center', marginBottom: '1rem',
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: statusColor }}>{statusLabel}</div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(150px, 100%), 1fr))', gap: '0.5rem' }}>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Expected</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>50.0% / 50.0%</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Observed</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: srmStatus !== 'green' ? statusColor : 'var(--text)' }}>{observedRatio}% / {treatmentRatio}%</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Chi-squared</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>{chiSq.toFixed(2)}</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>p-value</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: statusColor }}>{pValue}</div>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            SRM threshold: chi-squared &gt; 3.84 (p &lt; 0.05). Common root causes: bot filtering applied asymmetrically, redirect latency in treatment, logging bugs on one code path, or assignment before eligibility check.
          </div>
        </div>
      </div>

      {/* ── The Framework ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Framework</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Before reading any experiment results, run the SRM check first. Compare observed user counts per arm to the expected split using a chi-squared test. If p &lt; 0.05, stop. Do not proceed to metric analysis. Do not re-weight. Do not extend the experiment. Investigate why the split is wrong, fix the root cause, and re-run. SRM means your groups are no longer the random samples you intended, and no statistical adjustment can recover valid causal inference from broken randomization.
        </p>
      </div>

      {/* ── Quick Check ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Check</div>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          You detect SRM in your experiment (control: 50,213, treatment: 48,891, expected 50/50). Your PM argues: "It\'s only a 1.3% imbalance — let\'s just re-weight and proceed." What is the correct response?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {mcqOptions.map(function(opt, i) {
            return (
              <MCQOption key={i} label={opt.label} selected={mcqAnswer === i} correct={opt.correct} revealed={mcqRevealed} onClick={function() { if (!mcqRevealed) setMcqAnswer(i); }} />
            );
          })}
        </div>
        {mcqAnswer !== null && !mcqRevealed && (
          <CheckBtn onClick={function() { setMcqRevealed(true); }} />
        )}
        {mcqRevealed && (
          <div className='pal-reveal-in' style={{
            marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', lineHeight: 1.55,
            background: mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            color: 'var(--text)',
          }}>
            <strong>{mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'Correct. ' : 'Not quite. '}</strong>
            Re-weighting doesn\'t fix SRM because you don\'t know which users were systematically excluded or over-included. Extending the experiment cannot correct a broken assignment pipeline. The only valid path: pause, investigate the root cause (bot filtering, redirect latency, logging bugs), fix it, and re-run from scratch.
          </div>
        )}
      </div>

      {/* ── Key Takeaway ── */}
      {mcqRevealed && (
        <div>
          <InsightBox>
            SRM is the experiment equivalent of a data quality check in root cause analysis — always run it first, before reading any metric results. A chi-squared test on observed vs expected user counts takes 30 seconds and can save you from shipping a decision based on broken data.
          </InsightBox>
          <NextBtn onClick={onComplete} />
        </div>
      )}
    </div>
  );
}

// ── Module EF06: Novelty Effects and Long-Run Validity ─────────────────────
function Module_EF06({ onComplete }) {
  var saved06 = useMemo(function() { return loadEFState('ef06'); }, []);
  var [obsWeek, setObsWeek] = useState(function() { return saved06 && saved06.obsWeek !== undefined ? saved06.obsWeek : 1; });
  var [mcqAnswer, setMcqAnswer] = useState(function() { return saved06 ? saved06.mcqAnswer : null; });
  var [mcqRevealed, setMcqRevealed] = useState(function() { return saved06 ? saved06.mcqRevealed : false; });

  useEffect(function() {
    saveEFState('ef06', { obsWeek: obsWeek, mcqAnswer: mcqAnswer, mcqRevealed: mcqRevealed });
  }, [obsWeek, mcqAnswer, mcqRevealed]);

  // Novelty decay curve: starts at +15%, decays to +3% steady state
  // lift(w) = 3 + 12 * e^(-0.5*(w-1))
  var weekData = [];
  for (var w = 1; w <= 8; w++) {
    var lift = 3 + 12 * Math.exp(-0.5 * (w - 1));
    weekData.push({ week: w, lift: Math.round(lift * 10) / 10 });
  }
  var trueEffect = 3;

  // SVG chart dimensions
  var svgW = 340;
  var svgH = 180;
  var padL = 42;
  var padR = 16;
  var padT = 20;
  var padB = 28;
  var chartW = svgW - padL - padR;
  var chartH = svgH - padT - padB;
  var maxLift = 18;

  function xFor(wk) { return padL + (wk - 1) / 7 * chartW; }
  function yFor(val) { return padT + (1 - val / maxLift) * chartH; }

  // Build path
  var pathD = '';
  weekData.forEach(function(d, i) {
    var prefix = i === 0 ? 'M' : 'L';
    pathD += prefix + xFor(d.week) + ',' + yFor(d.lift) + ' ';
  });

  // Current observation point
  var currentLift = weekData[obsWeek - 1].lift;

  var mcqOptions = [
    { label: 'A. Ship after week 1 — the +15% lift is strong enough to act on immediately', correct: false },
    { label: 'B. Run the experiment for at least 3-4 weeks to let novelty decay stabilize, then use the steady-state estimate as the true effect', correct: true },
    { label: 'C. Average weeks 1 through 8 for the most accurate estimate of the treatment effect', correct: false },
    { label: 'D. The declining curve means the feature is getting worse — do not ship', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your team tested a redesigned recommendation carousel. After one week, the dashboard shows +15% CTR lift over control. The PM wants to ship immediately. But you\'ve seen this pattern before — a strong early signal that fades as users stop exploring the new UI out of curiosity and revert to their habitual behavior.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          If you ship based on week-one numbers, you\'re shipping based on a novelty-inflated estimate. The true long-run effect might be a fraction of what you measured. This is one of the most common reasons experiments overstate their impact — and one of the easiest to avoid if you know to look for it.
        </p>
      </div>

      {/* ── The Concept + Interactive Demo ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Novelty Decay Visualizer</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
          Drag the observation window slider to see what treatment effect you would report at each week. The blue curve shows the measured lift; the dashed green line shows the true long-run effect (+3%). Notice how reading results at week 1 massively overstates the real impact.
        </p>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          {/* Observation window slider */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Read results at: <strong style={{ color: 'var(--accent)' }}>Week {obsWeek}</strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(measured lift: <strong style={{ color: currentLift > trueEffect + 2 ? 'var(--yellow)' : 'var(--teal)' }}>+{currentLift}%</strong>)</span>
            </label>
            <input type='range' min={1} max={8} step={1} value={obsWeek} onChange={function(e) { setObsWeek(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          {/* SVG chart */}
          <svg viewBox={'0 0 ' + svgW + ' ' + svgH} width='100%' style={{ maxWidth: '400px', display: 'block', margin: '0 auto' }}>
            {/* Y-axis gridlines */}
            {[0, 5, 10, 15].map(function(v) {
              return (
                <g key={v}>
                  <line x1={padL} x2={svgW - padR} y1={yFor(v)} y2={yFor(v)} stroke='var(--border)' strokeWidth={0.5} strokeDasharray={v > 0 ? '3,3' : 'none'} />
                  <text x={padL - 4} y={yFor(v) + 3} textAnchor='end' fill='var(--text-muted)' fontSize={9}>+{v}%</text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {weekData.map(function(d) {
              return (
                <text key={d.week} x={xFor(d.week)} y={svgH - 4} textAnchor='middle' fill='var(--text-muted)' fontSize={9}>W{d.week}</text>
              );
            })}

            {/* True effect line */}
            <line x1={padL} x2={svgW - padR} y1={yFor(trueEffect)} y2={yFor(trueEffect)} stroke='var(--teal)' strokeWidth={1.5} strokeDasharray='6,4' />
            <text x={svgW - padR + 2} y={yFor(trueEffect) + 3} fill='var(--teal)' fontSize={8} fontWeight={600}>True +3%</text>

            {/* Decay curve */}
            <path d={pathD} fill='none' stroke='var(--accent)' strokeWidth={2.5} strokeLinejoin='round' strokeLinecap='round' />

            {/* Data points */}
            {weekData.map(function(d) {
              return (
                <circle key={d.week} cx={xFor(d.week)} cy={yFor(d.lift)} r={d.week === obsWeek ? 5 : 3} fill={d.week === obsWeek ? 'var(--accent)' : 'var(--surface)'} stroke='var(--accent)' strokeWidth={d.week === obsWeek ? 2.5 : 1.5} />
              );
            })}

            {/* Observation marker */}
            <line x1={xFor(obsWeek)} x2={xFor(obsWeek)} y1={yFor(currentLift) + 8} y2={yFor(0)} stroke='var(--accent)' strokeWidth={1} strokeDasharray='4,3' opacity={0.5} />
          </svg>

          {/* Reading callout */}
          <div style={{
            marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', lineHeight: 1.55,
            background: currentLift > trueEffect + 2 ? 'var(--yellow-bg)' : 'var(--teal-bg)',
            border: '1px solid ' + (currentLift > trueEffect + 2 ? 'var(--yellow-border)' : 'var(--teal-border)'),
            color: currentLift > trueEffect + 2 ? 'var(--yellow)' : 'var(--teal)',
          }}>
            {currentLift > trueEffect + 5 ? 'Reading at week ' + obsWeek + ': you\'d report +' + currentLift + '% — but the true long-run effect is only +' + trueEffect + '%. You\'d overstate the impact by ' + Math.round((currentLift / trueEffect - 1) * 100) + '%.' :
             currentLift > trueEffect + 2 ? 'Week ' + obsWeek + ' still shows novelty inflation. The +' + currentLift + '% is closer to steady state but still above the true +' + trueEffect + '% long-run effect.' :
             'Week ' + obsWeek + ': the effect has stabilized near the true long-run value of +' + trueEffect + '%. This is a reliable estimate to ship on.'}
          </div>
        </div>
      </div>

      {/* ── The Framework ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Framework</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          When evaluating experiment results, always check the time series of the treatment effect, not just the aggregate. If the lift is highest in week 1 and declines, you are seeing novelty decay. Run the experiment long enough to capture steady-state behavior — typically 2-4 weeks for features with habitual use patterns. Report the stabilized estimate (usually week 4+), not the week-1 peak. If your PM pushes to ship based on early results, show them the decay curve.
        </p>
      </div>

      {/* ── Quick Check ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Check</div>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          Your experiment shows +15% lift in week 1 that decays to +3% by week 8. What is the right approach?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {mcqOptions.map(function(opt, i) {
            return (
              <MCQOption key={i} label={opt.label} selected={mcqAnswer === i} correct={opt.correct} revealed={mcqRevealed} onClick={function() { if (!mcqRevealed) setMcqAnswer(i); }} />
            );
          })}
        </div>
        {mcqAnswer !== null && !mcqRevealed && (
          <CheckBtn onClick={function() { setMcqRevealed(true); }} />
        )}
        {mcqRevealed && (
          <div className='pal-reveal-in' style={{
            marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', lineHeight: 1.55,
            background: mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            color: 'var(--text)',
          }}>
            <strong>{mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'Correct. ' : 'Not quite. '}</strong>
            The declining curve doesn\'t mean the feature is getting worse — it means the novelty-inflated engagement is settling to the true effect. Averaging all 8 weeks would overweight the novelty period. The right approach: wait for stabilization (usually week 3-4), then use the steady-state estimate. The feature still has a real +3% lift, which may or may not be worth shipping depending on the cost.
          </div>
        )}
      </div>

      {/* ── Key Takeaway ── */}
      {mcqRevealed && (
        <div>
          <InsightBox>
            Week-one experiment results often reflect novelty behavior, not the true long-run effect. Always check the time series of the treatment effect. If it decays, wait for stabilization before making a ship decision. The steady-state estimate is what your users will actually experience — the week-1 peak is a mirage.
          </InsightBox>
          <NextBtn onClick={onComplete} />
        </div>
      )}
    </div>
  );
}

// ── Module EF07: Multiple Testing and Guardrails ────────────────────────────
function Module_EF07({ onComplete }) {
  var saved07 = useMemo(function() { return loadEFState('ef07'); }, []);
  var [numMetrics, setNumMetrics] = useState(function() { return saved07 && saved07.numMetrics !== undefined ? saved07.numMetrics : 1; });
  var [mcqAnswer, setMcqAnswer] = useState(function() { return saved07 ? saved07.mcqAnswer : null; });
  var [mcqRevealed, setMcqRevealed] = useState(function() { return saved07 ? saved07.mcqRevealed : false; });

  useEffect(function() {
    saveEFState('ef07', { numMetrics: numMetrics, mcqAnswer: mcqAnswer, mcqRevealed: mcqRevealed });
  }, [numMetrics, mcqAnswer, mcqRevealed]);

  // Calculations
  var pAtLeastOne = 1 - Math.pow(0.95, numMetrics);
  var pAtLeastOnePct = Math.round(pAtLeastOne * 1000) / 10;
  var expectedFP = Math.round(numMetrics * 0.05 * 100) / 100;
  var bonferroniAlpha = Math.round(0.05 / numMetrics * 10000) / 10000;

  // Grid of 20 squares — color expected FP count red
  var gridSquares = [];
  var fpCount = Math.round(numMetrics * 0.05 * 20 / numMetrics); // proportion in 20-square grid
  var fpInGrid = Math.min(20, Math.round(pAtLeastOne * 20));
  for (var sq = 0; sq < 20; sq++) {
    gridSquares.push(sq < fpInGrid ? 'fp' : 'ok');
  }

  var mcqOptions = [
    { label: 'A. Always test at alpha = 0.05 regardless of how many metrics — each test is independent', correct: false },
    { label: 'B. Apply Bonferroni correction: divide alpha by the number of metrics tested, keeping family-wise error at 5%', correct: true },
    { label: 'C. Only report the metric with the smallest p-value — it is the most likely to be real', correct: false },
    { label: 'D. Remove non-significant metrics from the report to reduce the multiple testing burden', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your experiment dashboard tracks 14 metrics: conversion rate, revenue per user, sessions per day, time on site, bounce rate, page views, add-to-cart rate, checkout starts, checkout completions, support tickets, app crashes, latency p50, latency p99, and DAU. The experiment ran clean — no SRM, full runtime. You open the results and see one metric is significant at p &lt; 0.05: checkout starts are up +4.2%.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          Should you celebrate? With 14 metrics tested at alpha = 0.05, there\'s a 51% chance of finding at least one false positive even if the treatment did absolutely nothing. That "significant" checkout starts result might be pure noise. This is the multiple testing problem, and it catches teams that don\'t know to correct for it.
        </p>
      </div>

      {/* ── The Concept + Interactive Demo ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>False Positive Simulator</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
          Drag the slider to increase the number of metrics tested. Watch the probability of at least one false positive climb — and the red squares multiply. At 14 metrics, it\'s a coin flip. At 20, it\'s almost two-thirds.
        </p>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          {/* Slider */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Number of metrics tested: <strong style={{ color: numMetrics >= 14 ? 'var(--red)' : numMetrics >= 5 ? 'var(--yellow)' : 'var(--text)' }}>{numMetrics}</strong>
            </label>
            <input type='range' min={1} max={20} step={1} value={numMetrics} onChange={function(e) { setNumMetrics(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          {/* Stats display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>P(at least 1 false positive)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: pAtLeastOnePct > 50 ? 'var(--red)' : pAtLeastOnePct > 20 ? 'var(--yellow)' : 'var(--teal)' }}>{pAtLeastOnePct}%</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>Expected false positives</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{expectedFP}</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>Bonferroni alpha</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{bonferroniAlpha}</div>
            </div>
          </div>

          {/* Visual grid — 20 squares */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Out of 20 experiments with no real effect, how many would show a "significant" result?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px', maxWidth: '280px' }}>
              {gridSquares.map(function(status, i) {
                return (
                  <div key={i} style={{
                    width: '100%', paddingBottom: '100%', borderRadius: '3px',
                    background: status === 'fp' ? 'var(--red)' : 'var(--surface-2)',
                    border: '1px solid ' + (status === 'fp' ? 'var(--red)' : 'var(--border)'),
                    opacity: status === 'fp' ? 0.85 : 1,
                  }} />
                );
              })}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Each red square = an experiment that would produce a false positive by chance alone
            </div>
          </div>

          {numMetrics >= 14 && (
            <div className='pal-reveal-in' style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--red-bg)', border: '1px solid var(--red-border)', fontSize: '0.84rem', color: 'var(--red)', lineHeight: 1.55 }}>
              At {numMetrics} metrics, there\'s a {pAtLeastOnePct}% chance of at least one false positive. Without correction, finding a "significant" result is more likely than not — even if the treatment did nothing.
            </div>
          )}
        </div>
      </div>

      {/* ── The Framework ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Framework</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Pre-specify your primary metric before running the experiment — this is the one metric you evaluate at alpha = 0.05 without correction. For all secondary and guardrail metrics, apply a Bonferroni correction (divide alpha by the number of tests) or Benjamini-Hochberg (less conservative, controls false discovery rate instead of family-wise error). Never data-mine your metric list after seeing results — picking the one that "happened to be significant" is p-hacking, and experienced interviewers will probe for it.
        </p>
      </div>

      {/* ── Quick Check ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Check</div>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          Your experiment tracks 20 metrics. What is the correct way to evaluate secondary and guardrail metrics?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {mcqOptions.map(function(opt, i) {
            return (
              <MCQOption key={i} label={opt.label} selected={mcqAnswer === i} correct={opt.correct} revealed={mcqRevealed} onClick={function() { if (!mcqRevealed) setMcqAnswer(i); }} />
            );
          })}
        </div>
        {mcqAnswer !== null && !mcqRevealed && (
          <CheckBtn onClick={function() { setMcqRevealed(true); }} />
        )}
        {mcqRevealed && (
          <div className='pal-reveal-in' style={{
            marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', lineHeight: 1.55,
            background: mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            color: 'var(--text)',
          }}>
            <strong>{mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'Correct. ' : 'Not quite. '}</strong>
            Bonferroni sets the per-test alpha to 0.05 / 20 = 0.0025. This keeps the family-wise error rate at 5% — the probability of any false positive across all 20 tests stays at 5%. It is conservative (may miss real effects), but simple and appropriate for guardrail metrics where false positives are costly. Options C and D are forms of p-hacking — cherry-picking results after seeing them.
          </div>
        )}
      </div>

      {/* ── Key Takeaway ── */}
      {mcqRevealed && (
        <div>
          <InsightBox>
            Every additional metric you test at alpha = 0.05 adds another 5% chance of a false positive. At 14 metrics, it\'s a coin flip. Pre-specify your primary metric, apply Bonferroni or BH correction to everything else, and never pick winners from a metric list after seeing results. The formula: P(at least 1 FP) = 1 - (1 - alpha)^n.
          </InsightBox>
          <NextBtn onClick={onComplete} />
        </div>
      )}
    </div>
  );
}

// ── Module EF08: A/A Testing ────────────────────────────────────────────────
function Module_EF08({ onComplete }) {
  const _saved08 = useMemo(function() { return loadEFState('ef08'); }, []);
  const [answer, setAnswer] = useState(_saved08 ? _saved08.answer : null);
  const [revealed, setRevealed] = useState(_saved08 ? _saved08.revealed : false);

  useEffect(function() { saveEFState('ef08', { answer: answer, revealed: revealed }); }, [answer, revealed]);

  // Pre-generate 30 deterministic p-values — seeded formula, clamped 0.01–0.95
  const pValues = Array.from({ length: 30 }, function(_, i) {
    var raw = Math.sin(i * 1.7 + 0.3) * 0.15 + 0.2 + (i < 15 ? -0.1 : 0.05);
    return Math.max(0.01, Math.min(0.95, raw));
  });

  // Day index where p first dips below 0.05 (expect around day 9–11)
  var crossDay = pValues.findIndex(function(v) { return v < 0.05; });
  if (crossDay === -1) crossDay = 9;

  // SVG layout constants
  var svgW = 560;
  var svgH = 160;
  var padL = 38;
  var padR = 16;
  var padT = 12;
  var padB = 28;
  var chartW = svgW - padL - padR;
  var chartH = svgH - padT - padB;

  function xOf(i) { return padL + (i / 29) * chartW; }
  function yOf(v) { return padT + (1 - v) * chartH; }

  var polyPoints = pValues.map(function(v, i) { return xOf(i) + ',' + yOf(v); }).join(' ');
  var thresholdY = yOf(0.05);

  var options = [
    { label: 'A. Yes — p < 0.05 means the result is real. Stop and report it.', correct: false },
    { label: 'B. No — a single crossing in an A/A test is exactly what random chance produces. This is why you need a pre-specified stopping rule.', correct: true },
    { label: 'C. Yes, but only if the crossing lasts more than two consecutive days.', correct: false },
    { label: 'D. Maybe — it depends on whether the sample size was large enough.', correct: false },
  ];

  return (
    <div className="pal-page-enter">
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        It\'s your first week on the experimentation platform team. Before launching any real tests, your lead asks you to run an A/A test — same experience in both groups, no actual change. Three days later, the dashboard shows p = 0.03. A junior analyst sees this and messages the team: "The platform is broken — we\'re getting a significant result with no treatment." Is it? An A/A test is designed to produce exactly this kind of false alarm at a known rate. If your significance threshold is 0.05, roughly 1 in 20 A/A tests will cross that line by pure chance. The real question isn\'t whether it crossed — it\'s whether it crosses more often than expected, which would indicate a genuine platform bug like broken randomization or logging skew.
      </p>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        An A/A test runs your experiment infrastructure with identical treatment in both groups.
        It should never show a significant result — when it does, your platform has a systematic problem.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        The chart below simulates a 30-day A/A test. Watch how the p-value wanders — and notice
        what happens early in the run.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Interpret the A/A test p-value trajectory</div>

      <InstructionBox>
        Study the chart below — it shows a 30-day A/A test where both groups receive identical treatment.
        Notice where the p-value line dips below the red 0.05 threshold and what happens afterward.
      </InstructionBox>

      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.25rem',
        overflowX: 'auto',
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          A/A Test — p-value over 30 days (both groups: identical treatment)
        </div>
        <svg viewBox={'0 0 ' + svgW + ' ' + svgH} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Axis lines */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="var(--border)" strokeWidth="1" />
          <line x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH} stroke="var(--border)" strokeWidth="1" />

          {/* Dashed threshold at p=0.05 */}
          <line
            x1={padL} y1={thresholdY}
            x2={padL + chartW} y2={thresholdY}
            stroke="var(--red)" strokeWidth="1.5" strokeDasharray="5,4"
          />
          <text x={padL + chartW + 2} y={thresholdY + 4} fontSize="9" fill="var(--red)" fontWeight="700">p=0.05</text>

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(function(v) {
            return (
              <text key={v} x={padL - 4} y={yOf(v) + 3} fontSize="8" fill="var(--text-muted)" textAnchor="end">
                {v.toFixed(2)}
              </text>
            );
          })}

          {/* X-axis labels */}
          <text x={xOf(0)} y={svgH - 6} fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 1</text>
          <text x={xOf(14)} y={svgH - 6} fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 15</text>
          <text x={xOf(29)} y={svgH - 6} fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 30</text>

          {/* P-value line */}
          <polyline
            points={polyPoints}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Circle marking first crossing below 0.05 */}
          {crossDay >= 0 && (
            <circle
              cx={xOf(crossDay)}
              cy={yOf(pValues[crossDay])}
              r="5"
              fill="var(--red)"
              stroke="var(--surface)"
              strokeWidth="1.5"
            />
          )}
          {crossDay >= 0 && (
            <text
              x={xOf(crossDay) + 7}
              y={yOf(pValues[crossDay]) - 6}
              fontSize="8"
              fill="var(--red)"
              fontWeight="700"
            >
              {'Day ' + (crossDay + 1) + ': p=' + pValues[crossDay].toFixed(3)}
            </text>
          )}
        </svg>
      </div>

      <InstructionBox>
        The experiment above is an A/A test — both groups see identical treatment. The p-value dipped below
        0.05 on day {crossDay + 1}. Should you stop and report a significant result?
      </InstructionBox>

      {options.map(function(opt, i) {
        return (
          <MCQOption
            key={i}
            label={opt.label}
            selected={answer === i}
            correct={opt.correct}
            revealed={revealed}
            onClick={function() { if (!revealed) setAnswer(i); }}
          />
        );
      })}

      {answer !== null && !revealed && <CheckBtn onClick={function() { setRevealed(true); }} />}

      {revealed && (
        <div className="pal-reveal-in">
          <div style={{
            marginTop: '0.5rem', padding: '0.65rem 0.85rem',
            background: options[answer] && options[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (options[answer] && options[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
          }}>
            Under the null hypothesis, p-values are uniformly distributed between 0 and 1. That means
            they cross 0.05 roughly once in every 20 observations just by chance — with no true effect.
            An A/A test that shows p &lt; 0.05 at some point during 30 days is expected, not alarming.
            Alarming is when the rate of crossings is far higher than chance predicts.
          </div>

          <InsightBox>
            P-values cross 0.05 even under the null about 5% of the time per check. Over 30 daily checks,
            the probability of at least one crossing is much higher than 5%. A/A tests calibrate your
            false positive rate — if crossings happen far more often than chance predicts, your variance
            estimation or randomization is broken.
          </InsightBox>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
            gap: '0.75rem',
            marginTop: '1.25rem',
          }}>
            <div style={{
              background: 'var(--red-bg)', border: '1px solid var(--red-border)',
              borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                Signs your A/A failed legitimately
              </div>
              {[
                'Crossing rate far exceeds 5% across many simulated runs',
                'One group is systematically larger than expected (SRM-like)',
                'p-values cluster near 0 rather than uniformly spread',
                'Different metrics all show the same directional bias',
              ].map(function(s, i) {
                return (
                  <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '0.3rem' }}>
                    {i + 1}. {s}
                  </div>
                );
              })}
            </div>
            <div style={{
              background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
              borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                Signs it is random chance
              </div>
              {[
                'One isolated crossing with p barely below 0.05',
                'p recovers above 0.05 quickly without intervention',
                'Group sizes match expected split within normal range',
                'Other metrics show no pattern — noise is unsystematic',
              ].map(function(s, i) {
                return (
                  <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '0.3rem' }}>
                    {i + 1}. {s}
                  </div>
                );
              })}
            </div>
          </div>

          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module EF09: CUPED / Variance Reduction ─────────────────────────────────
function Module_EF09({ onComplete }) {
  const _saved09 = useMemo(function() { return loadEFState('ef09'); }, []);
  const [cupedOn, setCupedOn] = useState(_saved09 ? _saved09.cupedOn : false);
  const [answer, setAnswer] = useState(_saved09 ? _saved09.answer : null);
  const [revealed, setRevealed] = useState(_saved09 ? _saved09.revealed : false);
  const [showExplainer, setShowExplainer] = useState(_saved09 ? _saved09.showExplainer : false);

  useEffect(function() { saveEFState('ef09', { cupedOn: cupedOn, answer: answer, revealed: revealed, showExplainer: showExplainer }); }, [cupedOn, answer, revealed, showExplainer]);

  // Deterministic scatter points: 30 users, pre vs post metric
  var N = 30;
  var points = Array.from({ length: N }, function(_, i) {
    var pre = 20 + i * 2 + Math.sin(i * 0.7) * 8;
    var post = 15 + pre * 0.6 + Math.cos(i * 1.1) * 12;
    return { pre: pre, post: post };
  });

  // Linear regression: slope ~0.6, intercept from means
  var meanPre = points.reduce(function(s, p) { return s + p.pre; }, 0) / N;
  var meanPost = points.reduce(function(s, p) { return s + p.post; }, 0) / N;
  var slope = 0.6;
  var intercept = meanPost - slope * meanPre;

  // SVG layout
  var svgW = 580;
  var svgH = 200;
  var padL = 44;
  var padR = 16;
  var padT = 12;
  var padB = 32;
  var chartW = svgW - padL - padR;
  var chartH = svgH - padT - padB;

  var preMin = 15;
  var preMax = 85;
  var postMin = 10;
  var postMax = 90;

  function xOf(pre) { return padL + ((pre - preMin) / (preMax - preMin)) * chartW; }
  function yOf(post) { return padT + (1 - (post - postMin) / (postMax - postMin)) * chartH; }

  var regX1 = preMin;
  var regY1 = slope * regX1 + intercept;
  var regX2 = preMax;
  var regY2 = slope * regX2 + intercept;

  var options = [
    { label: 'A. The treatment must have been applied before the experiment started', correct: false },
    { label: 'B. The pre-experiment metric must be correlated with the outcome metric', correct: true },
    { label: 'C. Users must have at least 30 days of pre-experiment history', correct: false },
    { label: 'D. The outcome metric must be normally distributed', correct: false },
  ];

  return (
    <div className="pal-page-enter">
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Your power analysis says the experiment needs 8 weeks to detect a 2% lift in revenue per user. The PM pushes back: "We can\'t hold a losing variant for two months — can we speed this up?" The answer is yes, but not by cutting the sample or lowering your significance bar. CUPED (Controlled-experiment Using Pre-Experiment Data) reduces the noise in your outcome metric by subtracting the part that\'s predictable from each user\'s pre-experiment behavior. If last week\'s revenue strongly predicts this week\'s, CUPED strips out that predictable component and leaves only the variation that your treatment could have caused. The result: the same experiment, same traffic, same alpha — but the confidence interval shrinks by 30-50%, and your 8-week test finishes in 4-5.
      </p>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        CUPED (Controlled-experiment Using Pre-Experiment Data) reduces outcome variance by subtracting
        the portion of the metric that is predictable from pre-experiment behavior.
        Less noise means the same experiment detects smaller effects — or reaches significance faster.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        The scatter below shows each user's pre-experiment metric (x) vs their post-experiment metric (y).
        Toggle CUPED on to see what the technique removes.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Toggle CUPED on and watch what happens to variance</div>

      <InstructionBox>
        Toggle CUPED on to see what the technique actually removes.
      </InstructionBox>

      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem',
        overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Pre-experiment metric (Day -7 to 0) vs Post-experiment metric (Day 1 to 14)
          </div>
          <button
            onClick={function() {
              setCupedOn(function(prev) { return !prev; });
              if (!cupedOn) setShowExplainer(true);
            }}
            style={{
              padding: '0.3rem 0.9rem',
              background: cupedOn ? 'var(--teal)' : 'var(--surface)',
              color: cupedOn ? '#fff' : 'var(--text)',
              border: '1.5px solid ' + (cupedOn ? 'var(--teal-border)' : 'var(--border)'),
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {cupedOn ? 'CUPED ON' : 'CUPED OFF'}
          </button>
        </div>

        <svg viewBox={'0 0 ' + svgW + ' ' + svgH} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Axis lines */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="var(--border)" strokeWidth="1" />
          <line x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH} stroke="var(--border)" strokeWidth="1" />

          {/* Y-axis label */}
          <text x="9" y={padT + chartH / 2} fontSize="8" fill="var(--text-muted)" textAnchor="middle"
            transform={'rotate(-90, 9, ' + (padT + chartH / 2) + ')'}>
            Post metric
          </text>

          {/* X-axis label */}
          <text x={padL + chartW / 2} y={svgH - 4} fontSize="8" fill="var(--text-muted)" textAnchor="middle">
            Pre metric
          </text>

          {/* Y-axis ticks */}
          {[20, 40, 60, 80].map(function(v) {
            return (
              <text key={v} x={padL - 4} y={yOf(v) + 3} fontSize="8" fill="var(--text-muted)" textAnchor="end">
                {v}
              </text>
            );
          })}

          {/* X-axis ticks */}
          {[20, 40, 60, 80].map(function(v) {
            return (
              <text key={v} x={xOf(v)} y={padT + chartH + 12} fontSize="8" fill="var(--text-muted)" textAnchor="middle">
                {v}
              </text>
            );
          })}

          {/* Regression line (when CUPED ON) */}
          {cupedOn && (
            <line
              x1={xOf(regX1)} y1={yOf(regY1)}
              x2={xOf(regX2)} y2={yOf(regY2)}
              stroke="var(--teal)" strokeWidth="2" strokeDasharray="6,3"
            />
          )}

          {/* Residual lines (when CUPED ON) */}
          {cupedOn && points.map(function(p, i) {
            var predicted = slope * p.pre + intercept;
            return (
              <line
                key={i}
                x1={xOf(p.pre)} y1={yOf(p.post)}
                x2={xOf(p.pre)} y2={yOf(predicted)}
                stroke="var(--yellow)" strokeWidth="1" opacity="0.7"
              />
            );
          })}

          {/* Scatter points */}
          {points.map(function(p, i) {
            return (
              <circle
                key={i}
                cx={xOf(p.pre)}
                cy={yOf(p.post)}
                r="4"
                fill={cupedOn ? 'var(--accent)' : 'var(--teal)'}
                opacity="0.75"
              />
            );
          })}

          {/* CUPED ON legend */}
          {cupedOn && (
            <g>
              <line x1={padL + chartW - 110} y1={padT + 8} x2={padL + chartW - 90} y2={padT + 8} stroke="var(--teal)" strokeWidth="2" strokeDasharray="6,3" />
              <text x={padL + chartW - 86} y={padT + 12} fontSize="8" fill="var(--teal)">regression line</text>
              <line x1={padL + chartW - 110} y1={padT + 22} x2={padL + chartW - 90} y2={padT + 22} stroke="var(--yellow)" strokeWidth="1" />
              <text x={padL + chartW - 86} y={padT + 26} fontSize="8" fill="var(--yellow)">residuals (what CUPED tests)</text>
            </g>
          )}
        </svg>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem',
      }}>
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Without CUPED
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.2rem' }}>Variance: 245</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Days to significance: 18 days</div>
        </div>
        <div style={{
          background: cupedOn ? 'var(--teal-bg)' : 'var(--surface-2)',
          border: '1px solid ' + (cupedOn ? 'var(--teal-border)' : 'var(--border)'),
          borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
          transition: 'all 0.25s',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: cupedOn ? 'var(--teal)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            With CUPED
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: cupedOn ? 'var(--teal)' : 'var(--text-muted)', marginBottom: '0.2rem' }}>Variance: 89</div>
          <div style={{ fontSize: '0.82rem', color: cupedOn ? 'var(--teal)' : 'var(--text-muted)' }}>
            {cupedOn ? 'Days to significance: 11 days' : 'Toggle CUPED ON to see'}
          </div>
        </div>
      </div>

      {showExplainer && cupedOn && (
        <div className="pal-reveal-in" style={{
          background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
          borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem',
          fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--teal)' }}>What CUPED just did:</strong> The yellow lines show each
          user's residual — the gap between their actual post-experiment metric and what the regression
          line predicted from their pre-experiment metric. CUPED runs the significance test on these
          residuals, not on the raw outcomes. Because residuals strip out predictable variation,
          they have lower variance — and lower variance means the same effect size is easier to detect.
        </div>
      )}

      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.85rem', marginTop: '0.5rem' }}>
        Which is the key requirement for CUPED to work?
      </div>

      <InstructionBox>
        Select the answer that identifies the core requirement CUPED depends on, then click Check to
        reveal the explanation. Think about what the regression line represents and what happens if it
        explains nothing.
      </InstructionBox>

      {options.map(function(opt, i) {
        return (
          <MCQOption
            key={i}
            label={opt.label}
            selected={answer === i}
            correct={opt.correct}
            revealed={revealed}
            onClick={function() { if (!revealed) setAnswer(i); }}
          />
        );
      })}

      {answer !== null && !revealed && <CheckBtn onClick={function() { setRevealed(true); }} />}

      {revealed && (
        <div className="pal-reveal-in">
          <div style={{
            marginTop: '0.5rem', padding: '0.65rem 0.85rem',
            background: options[answer] && options[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (options[answer] && options[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
          }}>
            CUPED works by regressing the outcome metric on the pre-experiment covariate and testing residuals.
            If the covariate has no correlation with the outcome, the regression explains nothing — residuals
            equal the raw outcomes — and variance is unchanged. Correlation is the entire mechanism.
            A covariate with r = 0.7 can reduce variance by up to 51%.
          </div>

          <InsightBox>
            CUPED subtracts the component of the outcome metric that is predictable from pre-experiment
            behavior. Removing this noise shrinks the confidence interval without collecting more data.
            The stronger the correlation between pre and post metrics, the greater the variance reduction
            — and the faster you reach significance. This is why companies can run experiments faster:
            same power, smaller sample.
          </InsightBox>

          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module EF10: Sequential Testing ─────────────────────────────────────────
function Module_EF10({ onComplete }) {
  const _saved10 = useMemo(function() { return loadEFState('ef10'); }, []);
  const [answer, setAnswer] = useState(_saved10 ? _saved10.answer : null);
  const [revealed, setRevealed] = useState(_saved10 ? _saved10.revealed : false);

  useEffect(function() { saveEFState('ef10', { answer: answer, revealed: revealed }); }, [answer, revealed]);

  // Pre-computed p-value trajectory over 20 days:
  // dips below 0.05 on day 7 (index 6, p=0.031) and day 12 (index 11, p=0.042), ends at 0.09
  var naivePValues = [
    0.48, 0.39, 0.28, 0.21, 0.14, 0.08, 0.031, 0.062, 0.071, 0.058,
    0.049, 0.042, 0.055, 0.068, 0.074, 0.081, 0.085, 0.088, 0.091, 0.09,
  ];
  // Alpha-spending boundary: starts tight (~0.01), relaxes to 0.05 by day 20
  var seqBoundary = [
    0.008, 0.009, 0.011, 0.013, 0.016, 0.019, 0.022, 0.026, 0.029, 0.033,
    0.036, 0.039, 0.041, 0.043, 0.044, 0.045, 0.047, 0.048, 0.049, 0.05,
  ];

  var W = 280;
  var H = 140;
  var padL = 32; var padR = 14; var padT = 14; var padB = 28;
  var innerW = W - padL - padR;
  var innerH = H - padT - padB;
  var maxP = 0.6;

  function xOf(i) { return padL + (i / 19) * innerW; }
  function yOf(p) { return padT + innerH - (Math.min(p, maxP) / maxP) * innerH; }

  function makePath(vals) {
    return vals.map(function(v, i) { return (i === 0 ? 'M' : 'L') + ' ' + xOf(i) + ' ' + yOf(v); }).join(' ');
  }

  var naivePath = makePath(naivePValues);
  var seqBoundaryPath = makePath(seqBoundary);

  // First crossing below 0.05 for naive: day 7 = index 6
  var nc1x = xOf(6); var nc1y = yOf(naivePValues[6]);
  // Second crossing: day 12 = index 11
  var nc2x = xOf(11); var nc2y = yOf(naivePValues[11]);

  var mcqOptions = [
    { label: 'A. The p-value calculation becomes less accurate with more data.', correct: false },
    { label: 'B. Each look is a chance to find p < 0.05 by chance. Multiple looks compound this probability above the nominal alpha.', correct: true },
    { label: 'C. The null hypothesis changes each time you peek.', correct: false },
    { label: 'D. Alpha spending reduces statistical power irreversibly.', correct: false },
  ];

  var METHODS = [
    { name: 'SPRT', desc: 'Sequential Probability Ratio Test — compares evidence for H1 vs H0 continuously; stops as soon as the evidence ratio crosses a pre-set threshold.' },
    { name: 'Group sequential', desc: 'Schedules a fixed number of interim looks up front and splits the alpha budget across them using O\'Brien-Fleming or Pocock boundaries.' },
    { name: 'Always-valid p-values', desc: 'Uses anytime-valid inference so the p-value is correct at any stopping point without inflating the false positive rate.' },
  ];

  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        It\'s day 3 of a 14-day experiment. Your PM checks the dashboard and sees p = 0.03. She messages you: "Great news — the new onboarding flow is significant. Let\'s ship it today and free up the traffic for the next test." You know this is wrong, but explaining why is harder than it sounds. The problem is multiple comparisons over time: every time you peek at the results, you\'re running another hypothesis test. If you peek 5 times during a 14-day experiment at alpha = 0.05, your actual false positive rate isn\'t 5% — it\'s closer to 14%. The p-value on day 3 isn\'t lying, but it wasn\'t computed under the assumption that you\'d stop the moment it crossed 0.05. Sequential testing methods like alpha spending, SPRT, and always-valid p-values solve this by adjusting the significance boundary at each look.
      </p>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Most teams peek at experiment results before the planned end date. Done naively, this inflates
        the true false positive rate far above the promised 5%. Sequential testing provides a principled
        solution — valid early stopping without breaking your error guarantees.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        The charts below show the same underlying p-value trajectory under two different stopping policies.
        Watch where each approach fires a significant signal.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Compare naive peeking vs. sequential testing boundaries</div>

      {/* Side-by-side SVG charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem',
      }}>
        {/* Left: Naive peeking */}
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Naive peeking — stop whenever p &lt; 0.05
          </div>
          <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" style={{ display: 'block' }}>
            {/* Axes */}
            <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
            <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
            {/* Dashed p=0.05 threshold */}
            <line x1={padL} y1={yOf(0.05)} x2={W - padR} y2={yOf(0.05)}
              stroke="var(--red)" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
            {/* Axis labels */}
            <text x={padL - 3} y={yOf(0.05) + 4} textAnchor="end" fontSize="8" fill="var(--red)" opacity="0.9">0.05</text>
            <text x={padL - 3} y={yOf(0) + 4} textAnchor="end" fontSize="8" fill="var(--text-muted)">0</text>
            <text x={xOf(0)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">d1</text>
            <text x={xOf(9)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">d10</text>
            <text x={xOf(19)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">d20</text>
            {/* P-value trajectory */}
            <path d={naivePath} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
            {/* Crossing dots */}
            <circle cx={nc1x} cy={nc1y} r="4" fill="var(--red)" />
            <circle cx={nc2x} cy={nc2y} r="4" fill="var(--red)" opacity="0.6" />
            {/* Drop line + label at first crossing (day 7) */}
            <line x1={nc1x} y1={nc1y - 4} x2={nc1x} y2={padT + 4}
              stroke="var(--red)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
            <text x={nc1x + 3} y={padT + 12} fontSize="7" fill="var(--red)" fontWeight="700">Stops here</text>
            <text x={nc1x + 3} y={padT + 21} fontSize="7" fill="var(--red)">(false positive!)</text>
          </svg>
        </div>

        {/* Right: Sequential testing */}
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Sequential testing — alpha-spending boundary
          </div>
          <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" style={{ display: 'block' }}>
            {/* Axes */}
            <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
            <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
            {/* Dashed p=0.05 reference */}
            <line x1={padL} y1={yOf(0.05)} x2={W - padR} y2={yOf(0.05)}
              stroke="var(--red)" strokeWidth="1" strokeDasharray="4 3" opacity="0.45" />
            {/* Axis labels */}
            <text x={padL - 3} y={yOf(0.05) + 4} textAnchor="end" fontSize="8" fill="var(--red)" opacity="0.7">0.05</text>
            <text x={padL - 3} y={yOf(0) + 4} textAnchor="end" fontSize="8" fill="var(--text-muted)">0</text>
            <text x={xOf(0)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">d1</text>
            <text x={xOf(9)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">d10</text>
            <text x={xOf(19)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">d20</text>
            {/* Alpha-spending boundary (orange dashed curve) */}
            <path d={seqBoundaryPath} fill="none" stroke="var(--yellow)" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x={xOf(12)} y={yOf(seqBoundary[12]) - 5} fontSize="7" fill="var(--yellow)" textAnchor="middle">spending boundary</text>
            {/* P-value trajectory */}
            <path d={naivePath} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
            {/* Day 7: p crosses nominal 0.05 but NOT the tighter boundary — show held */}
            <circle cx={nc1x} cy={nc1y} r="4" fill="var(--teal)" />
            <text x={nc1x + 4} y={nc1y - 5} fontSize="7" fill="var(--teal)">boundary holds</text>
          </svg>
        </div>
      </div>

      {/* Stat comparison block */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(210px, 100%), 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem',
      }}>
        <div style={{
          background: 'var(--red-bg)', border: '1px solid var(--red-border)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
            Naive peeking
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--red)' }}>26%</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>true false positive rate</div>
        </div>
        <div style={{
          background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
            Sequential (Lan-DeMets)
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--teal)' }}>5%</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>true false positive rate</div>
        </div>
      </div>

      <InstructionBox>
        Study both charts. The left approach fires a false alarm at day 7 — the right stays within the
        promised alpha because the spending boundary is tight early and relaxes toward day 20.
      </InstructionBox>

      {/* MCQ */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1rem',
      }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.85rem' }}>
          Why does peeking inflate the false positive rate?
        </div>
        <InstructionBox>
          Select the answer that best explains the peeking problem, then click Check. Connect your answer
          to what you saw in the left chart — why did naive stopping fire a false alarm on day 7?
        </InstructionBox>
        {mcqOptions.map(function(opt, i) {
          return (
            <MCQOption
              key={i}
              label={opt.label}
              selected={answer === i}
              correct={opt.correct}
              revealed={revealed}
              onClick={function() { if (!revealed) setAnswer(i); }}
            />
          );
        })}
        {answer !== null && !revealed && <CheckBtn onClick={function() { setRevealed(true); }} />}
        {revealed && (
          <div style={{
            marginTop: '0.5rem', padding: '0.65rem 0.85rem',
            background: mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
          }}>
            Every time you check results you run another implicit test. Under 20 unplanned peeks the
            probability of ever seeing p &lt; 0.05 — even when the null is true — climbs to roughly 26%.
            The alpha budget is spent across many chances rather than saved for one pre-specified look.
          </div>
        )}
      </div>

      {revealed && (
        <div>
          <InsightBox>
            Peeking at results and stopping early when p &lt; 0.05 inflates the true false positive rate
            well above 5%. Sequential testing methods (like always-valid p-values or group sequential
            designs) let you peek safely by spending the alpha budget across looks.
          </InsightBox>

          {/* 3 sequential methods card */}
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginTop: '1rem',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
              3 Common Sequential Methods
            </div>
            {METHODS.map(function(m, i) {
              return (
                <div key={i} style={{
                  borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  paddingTop: i === 0 ? 0 : '0.55rem',
                  marginTop: i === 0 ? 0 : '0.55rem',
                  fontSize: '0.84rem', lineHeight: 1.55,
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{m.name}</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>{m.desc}</span>
                </div>
              );
            })}
          </div>

          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

var SCENARIOS_EF11 = [
  {
    text: 'Testing a new search ranking algorithm on a B2B SaaS tool where users work independently.',
    options: ['SUTVA holds — standard A/B OK', 'SUTVA violated — use cluster randomization', 'SUTVA violated — use geo experiment'],
    correct: 0,
    explanation: 'B2B SaaS users querying independently have no mechanism to affect each other\'s search results. SUTVA holds — standard user-level A/B is appropriate.',
  },
  {
    text: 'Testing a referral bonus for a ride-sharing app where treated drivers may be dispatched to control riders.',
    options: ['SUTVA holds — standard A/B OK', 'SUTVA violated — use cluster randomization', 'SUTVA violated — use geo experiment'],
    correct: 2,
    explanation: 'Driver and rider pools are shared — a treated driver dispatched to a control rider creates direct spillover across arms. Geo experiment isolates markets so supply and demand stay within a single arm.',
  },
  {
    text: 'Testing a newsfeed ranking change on a social network where users see each other\'s activity.',
    options: ['SUTVA holds — standard A/B OK', 'SUTVA violated — use cluster randomization', 'SUTVA violated — use geo experiment'],
    correct: 1,
    explanation: 'Social activity (likes, comments, shares) crosses treatment arms — a control user\'s feed is affected by content their treated friends generate. Cluster randomization groups socially connected users into the same arm.',
  },
  {
    text: 'Testing a checkout flow change on an e-commerce site where users browse and purchase independently.',
    options: ['SUTVA holds — standard A/B OK', 'SUTVA violated — use cluster randomization', 'SUTVA violated — use geo experiment'],
    correct: 0,
    explanation: 'E-commerce checkout is a solo action with no cross-user interaction. Each user\'s outcome depends only on their own treatment assignment — SUTVA holds and standard A/B is valid.',
  },
];

// ── Module EF11: Network Effects in Experiments ──────────────────────────────
function Module_EF11({ onComplete }) {
  var _saved11 = useMemo(function() { return loadEFState('ef11'); }, []);
  var [scenarios11, setScenarios11] = useState(function() {
    return _saved11 && _saved11.scenarios ? _saved11.scenarios : shuffleEF(SCENARIOS_EF11);
  });
  var [answers, setAnswers] = useState(_saved11 ? _saved11.answers : {});
  var [revealed, setRevealed] = useState(_saved11 ? _saved11.revealed : false);

  useEffect(function() { saveEFState('ef11', { scenarios: scenarios11, answers: answers, revealed: revealed }); }, [scenarios11, answers, revealed]);

  function pick(idx, choice) {
    if (revealed) return;
    setAnswers(function(prev) { return Object.assign({}, prev, { [idx]: choice }); });
  }

  var allAnswered = scenarios11.every(function(_, i) { return answers[i] !== undefined; });
  var correctCount = scenarios11.filter(function(s, i) { return answers[i] === s.correct; }).length;

  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Your social product team is testing a new "share to story" feature. Users in the treatment group can post stories; control users cannot. Sounds like a clean split — until you realize that control users see the stories posted by their treated friends. The treatment is leaking across the boundary. A control user who sees five friends posting stories has a fundamentally different experience than a control user whose friends are all in control. Your measured treatment effect is diluted because control users are partially treated. This is network interference, and it violates the core assumption behind every standard A/B test: that one user\'s assignment doesn\'t affect another user\'s outcome. The formal name is SUTVA — Stable Unit Treatment Value Assumption — and when it breaks, your experiment isn\'t measuring what you think it\'s measuring.
      </p>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Standard A/B tests assume each user's outcome depends only on their own treatment assignment.
        When users interact — through social feeds, shared supply pools, or referral chains — this
        assumption breaks and your effect estimates become biased.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        SUTVA (Stable Unit Treatment Value Assumption) is the formal name for this requirement.
        For each scenario below, decide whether SUTVA holds and which design is appropriate.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Classify whether SUTVA holds and pick the right design</div>

      <InstructionBox>
        Read each scenario and click the classification that fits. Think about whether treated users
        can affect the outcomes of control users through any mechanism — shared supply, social graph,
        referrals, or pricing signals.
      </InstructionBox>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
        {scenarios11.map(function(s, i) {
          var picked = answers[i];
          var isCorrect = picked === s.correct;
          return (
            <div key={i} style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
            }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.7rem', lineHeight: 1.5 }}>
                {i + 1}. {s.text}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {s.options.map(function(opt, j) {
                  var bg = 'var(--surface)';
                  var border = 'var(--border)';
                  var color = 'var(--text-muted)';
                  if (picked === j) {
                    if (!revealed) { bg = 'var(--accent-bg)'; border = 'var(--accent-border)'; color = 'var(--accent)'; }
                    else if (isCorrect) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
                    else { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
                  } else if (revealed && j === s.correct) {
                    bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)';
                  }
                  return (
                    <button key={j} onClick={function() { pick(i, j); }} disabled={revealed} style={{
                      textAlign: 'left', padding: '0.45rem 0.85rem',
                      fontSize: '0.82rem', fontWeight: 500,
                      background: bg, border: '1.5px solid ' + border, color,
                      borderRadius: 'var(--radius-sm)', cursor: revealed ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                    }}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {revealed && (
                <div style={{
                  marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                  borderTop: '1px solid var(--border)', paddingTop: '0.5rem',
                }}>
                  {isCorrect ? '[correct]' : '[incorrect]'} {s.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!revealed && allAnswered && (
        <button onClick={function() { setRevealed(true); }} style={{
          padding: '0.55rem 1.2rem', background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
        }}>
          Check all
        </button>
      )}

      {revealed && (
        <div>
          <div style={{
            marginTop: '0.75rem', padding: '0.65rem 0.85rem',
            background: correctCount === scenarios11.length ? 'var(--teal-bg)' : 'var(--yellow-bg)',
            border: '1px solid ' + (correctCount === scenarios11.length ? 'var(--teal-border)' : 'var(--yellow-border)'),
            color: correctCount === scenarios11.length ? 'var(--teal)' : 'var(--yellow)',
            fontWeight: 700, fontSize: '0.88rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem',
          }}>
            {correctCount} / {scenarios11.length} correct
          </div>

          <InsightBox>
            SUTVA requires that each user's outcome depends only on their own treatment assignment.
            In social, marketplace, and two-sided platforms, treatment users affect control users —
            violating SUTVA and biasing effect estimates toward zero. Three mechanisms to know:
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', lineHeight: 1.7 }}>
              <li><strong>Direct spillover</strong> — treated user's content or actions reach control users (social feeds, referrals).</li>
              <li><strong>Equilibrium effects</strong> — market prices, wages, or supply availability shift for everyone (two-sided marketplaces).</li>
              <li><strong>Resource competition</strong> — treated and control users compete for a shared finite resource (driver supply, ad impressions).</li>
            </ul>
          </InsightBox>

          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module EF12: Holdout Groups ──────────────────────────────────────────────
function Module_EF12({ onComplete }) {
  const _saved12 = useMemo(function() { return loadEFState('ef12'); }, []);
  const [showLift, setShowLift] = useState(_saved12 ? _saved12.showLift : false);
  const [answer, setAnswer] = useState(_saved12 ? _saved12.answer : null);
  const [revealed, setRevealed] = useState(_saved12 ? _saved12.revealed : false);

  useEffect(function() { saveEFState('ef12', { showLift: showLift, answer: answer, revealed: revealed }); }, [showLift, answer, revealed]);

  // Deterministic 28-day trajectory (no Math.random)
  var days = 28;
  var W = 460; var H = 145;
  var padL = 32; var padR = 16; var padT = 12; var padB = 26;
  var innerW = W - padL - padR; var innerH = H - padT - padB;
  var yMin = 98; var yMax = 118;

  function xOf(i) { return padL + (i / (days - 1)) * innerW; }
  function yOf(v) { return padT + innerH - ((v - yMin) / (yMax - yMin)) * innerH; }

  // Holdout: slow linear growth + gentle sine noise
  function holdoutVal(i) { return 100 + i * 0.28 + Math.sin(i * 0.9) * 0.4; }
  // Treated: faster growth + compounding
  function treatedVal(i) { return 100 + i * 0.58 + Math.sin(i * 0.7) * 0.3; }

  var holdoutPts = Array.from({ length: days }, function(_, i) { return holdoutVal(i); });
  var treatedPts = Array.from({ length: days }, function(_, i) { return treatedVal(i); });

  var holdoutPath = holdoutPts.map(function(v, i) { return (i === 0 ? 'M' : 'L') + ' ' + xOf(i) + ' ' + yOf(v); }).join(' ');
  var treatedPath = treatedPts.map(function(v, i) { return (i === 0 ? 'M' : 'L') + ' ' + xOf(i) + ' ' + yOf(v); }).join(' ');

  var holdoutEnd = holdoutVal(days - 1);
  var treatedEnd = treatedVal(days - 1);

  var mcqOptions = [
    { label: 'A. To control for novelty effects in individual A/B tests.', correct: false },
    { label: 'B. To measure the cumulative causal impact of an entire feature launch program.', correct: true },
    { label: 'C. To replace individual A/B tests when experiment traffic is limited.', correct: false },
    { label: 'D. To detect Hawthorne effects by permanently excluding some users.', correct: false },
  ];

  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Six months ago your team shipped a redesigned recommendation engine. The A/B test showed a 3% lift in engagement, everyone celebrated, and the feature graduated to 100%. Now the VP of Product asks: "Is it still working? And across all the features we\'ve shipped this year, are we actually better off than we were in January?" Your A/B test can\'t answer either question — it ended months ago, and it only measured one feature in isolation. This is exactly what a holdout group solves. By keeping a small permanent slice of users (typically 1-5%) on the old experience across all launches, you get a running counterfactual: what would engagement look like if you\'d shipped nothing all year? The gap between the holdout and everyone else is the cumulative causal impact of your entire feature program.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Individual A/B tests answer one question: did this feature move the metric? But they cannot
        answer: are all our feature launches adding up to real business value? A holdout group answers
        the second question by keeping a small user slice permanently excluded from all new launches.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Study the holdout trajectory and spot the sum-of-parts paradox</div>

      <InstructionBox>
        Study the 28-day engagement trajectories below. Then click the button to see the sum-of-parts paradox.
      </InstructionBox>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
          28-day engagement: holdout vs. fully treated
        </div>
        <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" style={{ display: 'block' }}>
          <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
          <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
          {[100, 105, 110, 115].map(function(v) {
            return <line key={v} x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />;
          })}
          <path d={holdoutPath} fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="5 3" />
          <path d={treatedPath} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
          <line x1={xOf(days - 1)} y1={yOf(holdoutEnd)} x2={xOf(days - 1)} y2={yOf(treatedEnd)} stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="2 2" />
          <text x={xOf(days - 1) - 52} y={yOf(treatedEnd) - 5} fontSize="8" fill="var(--accent)" fontWeight="700">Treated</text>
          <text x={xOf(days - 1) - 52} y={yOf(holdoutEnd) + 13} fontSize="8" fill="var(--text-muted)">Holdout</text>
          <text x={padL - 3} y={yOf(100) + 4} textAnchor="end" fontSize="8" fill="var(--text-muted)">100</text>
          <text x={padL - 3} y={yOf(110) + 4} textAnchor="end" fontSize="8" fill="var(--text-muted)">110</text>
          <text x={xOf(0)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">Day 1</text>
          <text x={xOf(days - 1)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">Day 28</text>
        </svg>
      </div>

      <button
        onClick={function() { setShowLift(true); }}
        disabled={showLift}
        style={{
          padding: '0.5rem 1.1rem', marginBottom: '1rem',
          background: showLift ? 'var(--surface-2)' : 'var(--accent)',
          color: showLift ? 'var(--text-muted)' : '#fff',
          border: '1px solid ' + (showLift ? 'var(--border)' : 'var(--accent)'),
          borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem',
          cursor: showLift ? 'default' : 'pointer',
        }}
      >
        Show sum-of-parts paradox
      </button>

      {showLift && (
        <div className="pal-reveal-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Sum of individual lifts</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.2rem' }}>+4.0%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Feature A +1.5%, B +0.8%, C +1.7%</div>
          </div>
          <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Holdout gap (28 days)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.2rem' }}>+11.2%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>True compound effect measured</div>
          </div>
        </div>
      )}

      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.85rem', marginTop: '0.5rem' }}>
        What is the primary purpose of a holdout group?
      </div>

      <InstructionBox>
        Select the answer that best captures why a holdout group is kept separate from all launches,
        then click Check. Think about what question the holdout gap answers that individual A/B tests
        cannot.
      </InstructionBox>

      {mcqOptions.map(function(opt, i) {
        return (
          <MCQOption
            key={i}
            label={opt.label}
            selected={answer === i}
            correct={opt.correct}
            revealed={revealed}
            onClick={function() { if (!revealed) setAnswer(i); }}
          />
        );
      })}

      {answer !== null && !revealed && <CheckBtn onClick={function() { setRevealed(true); }} />}

      {revealed && (
        <div className="pal-reveal-in">
          <div style={{
            marginTop: '0.5rem', padding: '0.65rem 0.85rem',
            background: mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
          }}>
            Individual A/B tests measure the impact of one change at a time — but they run in a world where other features are also shipping. A holdout group removes this confound entirely: the holdout trajectory shows what would have happened with no new launches, and the gap to the treated group measures the true cumulative effect of everything shipped.
          </div>
          <InsightBox>
            The sum of individual experiment lifts (e.g. +4%) rarely equals the holdout gap (e.g. +11%) because features interact, compound, and change user behavior in ways individual tests cannot capture. Holdouts catch both positive compounding and negative interference between features.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module EF13: Multi-Armed Bandits ─────────────────────────────────────────
function Module_EF13({ onComplete }) {
  const _saved13 = useMemo(function() { return loadEFState('ef13'); }, []);
  const [round, setRound] = useState(_saved13 ? _saved13.round : 0);
  const [answer, setAnswer] = useState(_saved13 ? _saved13.answer : null);
  const [revealed, setRevealed] = useState(_saved13 ? _saved13.revealed : false);

  useEffect(function() { saveEFState('ef13', { round: round, answer: answer, revealed: revealed }); }, [round, answer, revealed]);

  // Pre-computed epsilon-greedy allocation after each round (deterministic)
  // 3 variants: A, B, C. B is the winner. Starts equal, converges toward B.
  var allRounds = [
    [33, 34, 33],   // round 0 (start)
    [30, 42, 28],   // round 1
    [25, 52, 23],   // round 2
    [20, 61, 19],   // round 3
    [16, 69, 15],   // round 4
    [13, 76, 11],   // round 5 (converged)
  ];

  var BAR_W = 420; var BAR_H = 110;

  var variantColors = ['var(--text-muted)', 'var(--accent)', 'var(--teal)'];
  var variantNames = ['Variant A', 'Variant B', 'Variant C'];
  var current = allRounds[round];
  var maxAlloc = 100;
  var barH = 28;
  var barGap = 10;
  var labelW = 78;

  var mcqOptions = [
    { label: 'A. When you need a statistically clean causal estimate of the treatment effect.', correct: false },
    { label: 'B. When you have unlimited experiment duration and traffic.', correct: false },
    { label: 'C. When the cost of showing users a losing variant during the experiment is high and you can tolerate less statistical precision.', correct: true },
    { label: 'D. When your metric has high variance and low coefficient of variation.', correct: false },
  ];

  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Your growth PM has four homepage hero variants ready to test. Instead of a standard A/B/C/D test, she proposes: "Let\'s just run a bandit — it\'ll automatically send more traffic to the winner and we won\'t waste impressions on losers." She\'s not wrong about the traffic efficiency, but she\'s glossing over what you give up. A multi-armed bandit optimizes for reward during the experiment: it minimizes the cost of showing users a losing variant. But it does this by shifting traffic away from underperformers before you\'ve collected enough data to be statistically confident they\'re actually worse. The result is a faster path to "probably the best variant" but a weaker causal estimate of exactly how much better it is. When the cost of a bad experience is high (e.g., pricing pages, checkout flows) and you can tolerate less precision, bandits shine. When you need a clean effect size for a launch decision, a fixed-split A/B test is still the right call.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        A fixed A/B test splits traffic equally and waits — it optimizes for measurement. A multi-armed
        bandit shifts traffic toward better-performing variants in real time — it optimizes for reward
        during the experiment. The tradeoff is statistical precision vs. opportunity cost.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Run the epsilon-greedy bandit and watch traffic allocation shift</div>

      <InstructionBox>
        Click &quot;Run round&quot; to advance the epsilon-greedy bandit. Watch how traffic allocation shifts toward Variant B as the algorithm learns it performs best.
      </InstructionBox>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
          Traffic allocation — Round {round} {round === allRounds.length - 1 ? '(converged)' : ''}
        </div>
        <svg viewBox={'0 0 ' + BAR_W + ' ' + BAR_H} width="100%" style={{ display: 'block' }}>
          {variantNames.map(function(name, vi) {
            var pct = current[vi];
            var y = vi * (barH + barGap);
            var bw = ((pct / maxAlloc) * (BAR_W - labelW - 60));
            return (
              <g key={vi}>
                <text x="0" y={y + barH / 2 + 5} fontSize="11" fill="var(--text-muted)" fontWeight="600">{name}</text>
                <rect x={labelW} y={y} width={bw} height={barH} rx="4" fill={variantColors[vi]} opacity={vi === 1 ? '1' : '0.5'} style={{ transition: 'width 0.4s ease' }} />
                <text x={labelW + bw + 6} y={y + barH / 2 + 5} fontSize="11" fill={variantColors[vi]} fontWeight="700">{pct}%</text>
              </g>
            );
          })}
        </svg>

        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={function() { if (round < allRounds.length - 1) setRound(function(r) { return r + 1; }); }}
            disabled={round >= allRounds.length - 1}
            style={{
              padding: '0.45rem 1rem',
              background: round >= allRounds.length - 1 ? 'var(--surface)' : 'var(--accent)',
              color: round >= allRounds.length - 1 ? 'var(--text-muted)' : '#fff',
              border: '1px solid ' + (round >= allRounds.length - 1 ? 'var(--border)' : 'var(--accent)'),
              borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem',
              cursor: round >= allRounds.length - 1 ? 'default' : 'pointer',
            }}
          >
            Run round
          </button>
          {round > 0 && (
            <button onClick={function() { setRound(0); }} style={{ padding: '0.45rem 0.9rem', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Reset
            </button>
          )}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {round === 0 ? 'Equal split — no learning yet' : round < allRounds.length - 1 ? 'Learning in progress...' : 'Converged — most traffic now goes to the winner'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { title: 'A/B test advantage', items: ['Clean causal estimate', 'Known false positive rate', 'Unbiased treatment effect'] },
          { title: 'Bandit advantage', items: ['Lower regret during experiment', 'Adapts as user behavior shifts', 'Good for short-lived promotions'] },
        ].map(function(card) {
          return (
            <div key={card.title} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{card.title}</div>
              {card.items.map(function(item, i) {
                return <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '0.2rem' }}>{item}</div>;
              })}
            </div>
          );
        })}
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.85rem' }}>
        When does a multi-armed bandit outperform a fixed A/B test?
      </div>

      <InstructionBox>
        Select the scenario where a bandit is the better choice, then click Check. Use the tradeoff
        table above — focus on when the cost of showing users a losing variant outweighs the need for
        a clean causal estimate.
      </InstructionBox>

      {mcqOptions.map(function(opt, i) {
        return (
          <MCQOption
            key={i}
            label={opt.label}
            selected={answer === i}
            correct={opt.correct}
            revealed={revealed}
            onClick={function() { if (!revealed) setAnswer(i); }}
          />
        );
      })}

      {answer !== null && !revealed && <CheckBtn onClick={function() { setRevealed(true); }} />}

      {revealed && (
        <div className="pal-reveal-in">
          <div style={{
            marginTop: '0.5rem', padding: '0.65rem 0.85rem',
            background: mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
          }}>
            Bandits shine when the regret of showing users a losing variant during the experiment is costly — short promotions, high-stakes UX, or volatile conditions. The price is that traffic imbalance makes causal inference noisy. If you need a clean statistical estimate for a product decision that compounds over time, a fixed A/B test is almost always the right choice.
          </div>
          <InsightBox>
            The explore-exploit tradeoff is the core concept: exploration (equal traffic) maximizes information quality; exploitation (shift to winner) minimizes opportunity cost. Bandits find the middle ground dynamically, but they never fully solve either goal — interviewers test this distinction at senior PM and DS levels.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

var SCENARIOS_EF14 = [
  {
    id: 'a',
    desc: 'Testing a new checkout flow on an e-commerce website. Users log in, are randomly assigned, and their sessions are independent.',
    correct: 'User',
    explanation: 'Users are independent and can be individually tracked. Standard user-level A/B test.',
  },
  {
    id: 'b',
    desc: 'Testing a dynamic pricing algorithm for a food delivery marketplace. Charging treated drivers higher base pay affects supply available to all users in the city.',
    correct: 'Geo',
    explanation: 'Supply and demand are city-level — treating individual users creates spillover. Geo experiment randomizes at the city level.',
  },
  {
    id: 'c',
    desc: 'Testing a new feature on a social platform where users interact with each other. Users who adopt the feature create social pressure on connected non-users.',
    correct: 'Cluster',
    explanation: 'Social graph creates within-cluster interference. Cluster randomization (e.g. by friend group or region) isolates units.',
  },
  {
    id: 'd',
    desc: 'Testing a TV advertising campaign in select markets. There is no way to measure which specific users saw the ad.',
    correct: 'Geo',
    explanation: 'TV advertising cannot be measured at the user level. Geo holdout compares treated markets to matched control markets.',
  },
];

// ── Module EF14: Geo Experiments ─────────────────────────────────────────────
function Module_EF14({ onComplete }) {
  const _saved14 = useMemo(function() { return loadEFState('ef14'); }, []);
  const [scenarios14] = useState(function() {
    return _saved14 && _saved14.scenarios ? _saved14.scenarios : shuffleEF(SCENARIOS_EF14);
  });
  const [selections, setSelections] = useState(_saved14 ? _saved14.selections : {});
  const [checked, setChecked] = useState(_saved14 ? _saved14.checked : false);
  const [answer, setAnswer] = useState(_saved14 ? _saved14.answer : null);
  const [revealed, setRevealed] = useState(_saved14 ? _saved14.revealed : false);

  useEffect(function() { saveEFState('ef14', { scenarios: scenarios14, selections: selections, checked: checked, answer: answer, revealed: revealed }); }, [scenarios14, selections, checked, answer, revealed]);

  var options = ['User', 'Cluster', 'Geo'];

  function select(sid, opt) {
    if (checked) return;
    setSelections(function(prev) {
      var next = Object.assign({}, prev);
      next[sid] = opt;
      return next;
    });
  }

  var allSelected = scenarios14.every(function(s) { return selections[s.id]; });

  var mcqOptions = [
    { label: 'A. Geo experiments require a different statistical test that is less powerful.', correct: false },
    { label: 'B. There are far fewer geographic units (cities, DMAs) than users — fewer randomization units means lower statistical power.', correct: true },
    { label: 'C. Geographic units have higher variance in their outcomes than individual users.', correct: false },
    { label: 'D. Geo experiments cannot randomize at all — they always use pre-selected markets.', correct: false },
  ];

  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Your marketplace team wants to test a 15% price increase on delivery fees. User-level randomization won\'t work — if two people in the same household see different prices, you\'ll get complaints, PR risk, and poisoned data. You also can\'t randomize by device or session for the same reason. The solution is geo experimentation: randomize entire cities or DMAs to treatment or control. Dallas gets the new price, Houston keeps the old one, and you compare outcomes at the market level. The approach is clean — no within-market contamination, no user confusion — but the tradeoff is brutal on statistical power. Instead of 2 million randomization units (users), you have 40 (cities). Your confidence intervals widen dramatically, and detecting a 2% lift that would be trivial in a user-level test becomes nearly impossible. This is why geo experiments are reserved for interventions that can\'t be randomized at the user level: pricing changes, TV ad campaigns, and policy shifts that apply to everyone in a market.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Geo experiments randomize at the geographic unit — city, DMA, or country — rather than the user.
        They solve the problem of network spillover and enable testing of channels where individual
        assignment is impossible, like TV advertising or marketplace pricing. The tradeoff is power:
        100 cities gives you far fewer randomization units than 1 million users.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Classify each scenario to the right experiment design level</div>

      <InstructionBox>
        For each scenario, classify the right experiment design: User-level A/B, Cluster randomization, or Geo experiment. Then click Check to see results.
      </InstructionBox>

      {scenarios14.map(function(s) {
        var sel = selections[s.id];
        var isCorrect = sel === s.correct;
        return (
          <div key={s.id} style={{ background: 'var(--surface-2)', border: '1px solid ' + (checked ? (isCorrect ? 'var(--teal-border)' : 'var(--red-border)') : 'var(--border)'), borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '0.6rem' }}>{s.desc}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {options.map(function(opt) {
                var isSelected = sel === opt;
                var btnBg = isSelected ? 'var(--accent)' : 'var(--surface)';
                if (checked) {
                  if (opt === s.correct) { btnBg = 'var(--teal)'; }
                  else if (isSelected && !isCorrect) { btnBg = 'var(--red)'; }
                  else { btnBg = 'var(--surface)'; }
                }
                return (
                  <button
                    key={opt}
                    onClick={function() { select(s.id, opt); }}
                    style={{
                      padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 600,
                      background: btnBg,
                      color: (isSelected || (checked && opt === s.correct)) ? '#fff' : 'var(--text-muted)',
                      border: '1px solid ' + (isSelected ? 'var(--accent)' : 'var(--border)'),
                      borderRadius: 'var(--radius-sm)', cursor: checked ? 'default' : 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {checked && (
              <div className="pal-reveal-in" style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {s.explanation}
              </div>
            )}
          </div>
        );
      })}

      {allSelected && !checked && (
        <button onClick={function() { setChecked(true); }} style={{ padding: '0.5rem 1.2rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1rem' }}>
          Check all
        </button>
      )}

      {checked && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.85rem' }}>
            Why do geo experiments have low statistical power compared to user-level tests?
          </div>

          <InstructionBox>
            Select the answer that best explains the power limitation of geo experiments, then click
            Check. Think about what determines sample size in a statistical test and how many
            randomization units a geo experiment actually has.
          </InstructionBox>

          {mcqOptions.map(function(opt, i) {
            return (
              <MCQOption
                key={i}
                label={opt.label}
                selected={answer === i}
                correct={opt.correct}
                revealed={revealed}
                onClick={function() { if (!revealed) setAnswer(i); }}
              />
            );
          })}

          {answer !== null && !revealed && <CheckBtn onClick={function() { setRevealed(true); }} />}

          {revealed && (
            <div className="pal-reveal-in">
              <div style={{
                marginTop: '0.5rem', padding: '0.65rem 0.85rem',
                background: mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
                border: '1px solid ' + (mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
                borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
              }}>
                Statistical power is determined by the number of independent randomization units. With 50 cities randomized to treatment and 50 to control, you have 50 observations per arm — versus millions with user randomization. This is why geo experiment designs rely on pre-period covariate matching (finding similar markets) to reduce variance: you cannot compensate by adding more units.
              </div>
              <InsightBox>
                Geo experiments solve the spillover problem that makes user-level testing invalid for marketplace pricing, TV advertising, and social graph interventions. The power limitation is real but manageable with matched-market design, synthetic control methods, and longer measurement windows.
              </InsightBox>
              <NextBtn onClick={onComplete} label="Complete module →" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Module EF15: Switchback Experiments ──────────────────────────────────────
function Module_EF15({ onComplete }) {
  const _saved15 = useMemo(function() { return loadEFState('ef15'); }, []);
  const [step, setStep] = useState(_saved15 ? _saved15.step : 0);
  const [answers, setAnswers] = useState(_saved15 ? _saved15.answers : {});
  const [revealed, setRevealed] = useState(_saved15 ? _saved15.revealed : {});

  useEffect(function() { saveEFState('ef15', { step: step, answers: answers, revealed: revealed }); }, [step, answers, revealed]);

  var questions = [
    {
      id: 'q1',
      q: 'Uber is testing a new driver incentive in San Francisco. Treating some drivers and not others in the same city would shift supply from control to treatment areas. What is the core problem this creates?',
      options: [
        { label: 'A. The experiment runs too slowly to collect enough data.', correct: false },
        { label: 'B. Supply spillover — a driver dispatched in the treatment arm affects wait time for control users, violating SUTVA.', correct: true },
        { label: 'C. Control group drivers cannot be identified because they use the same app.', correct: false },
        { label: 'D. Geo experiment power is too low for city-level randomization.', correct: false },
      ],
      explanation: 'SUTVA (Stable Unit Treatment Value Assumption) requires that one unit\'s treatment does not affect another\'s outcome. In a marketplace, supply and demand are city-level — splitting users creates within-city interference.',
    },
    {
      id: 'q2',
      q: 'A switchback design alternates treatment and control windows every 2 hours within the same market. What statistical complication does this introduce that a standard geo experiment avoids?',
      options: [
        { label: 'A. The sample size is smaller because there are fewer time periods than cities.', correct: false },
        { label: 'B. Temporal autocorrelation — outcomes in one time window are correlated with adjacent windows, violating the independence assumption.', correct: true },
        { label: 'C. Geographic confounds are impossible to control for in a time-based design.', correct: false },
        { label: 'D. Drivers remember the previous treatment window and change behavior in the control window.', correct: false },
      ],
      explanation: 'Adjacent time periods in a marketplace share supply, demand, and driver positioning from prior periods. This autocorrelation inflates variance estimates if not explicitly modeled — typically addressed with time-series models or clustered standard errors.',
    },
    {
      id: 'q3',
      q: 'For which product context is a switchback experiment the canonical solution?',
      options: [
        { label: 'A. Testing a new onboarding flow for a SaaS product where users are independent.', correct: false },
        { label: 'B. Testing a TV advertising campaign in select US markets.', correct: false },
        { label: 'C. Testing a surge pricing algorithm for a ride-sharing or food delivery platform operating in a single dense market.', correct: true },
        { label: 'D. Testing a recommendation algorithm on a social feed where users do not interact with each other.', correct: false },
      ],
      explanation: 'Switchback is specifically designed for two-sided marketplaces with within-market interference. The alternating windows keep supply and demand in a single market — neither geo splits (which split supply) nor user splits (which create within-city interference) work here.',
    },
  ];

  var W = 440; var H = 70;
  var windows = ['C', 'T', 'C', 'T', 'C', 'T', 'C', 'T'];
  var segW = (W - 20) / windows.length;

  function selectAnswer(qid, idx) {
    if (revealed[qid]) return;
    setAnswers(function(prev) { var n = Object.assign({}, prev); n[qid] = idx; return n; });
  }

  function revealAnswer(qid) {
    setRevealed(function(prev) { var n = Object.assign({}, prev); n[qid] = true; return n; });
    if (step < questions.length - 1) { setStep(function(s) { return s + 1; }); }
  }

  return (
    <div>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Your ride-sharing platform wants to test a new surge pricing algorithm in San Francisco. User-level randomization is out — if treated riders see lower surge prices, they\'ll request more rides, pulling drivers away from control riders and inflating control wait times. The treatment effect leaks across the boundary through the shared driver supply pool, violating SUTVA. Geo experiments won\'t help either — San Francisco is one market, and splitting it into sub-regions creates artificial boundaries where drivers cross freely. Switchback experiments solve this by splitting time instead of users or geographies. For two hours, everyone in SF gets the new algorithm; for the next two hours, everyone gets the old one. The city alternates between treatment and control windows throughout the day. The tradeoff is temporal autocorrelation: outcomes in one window are correlated with adjacent windows because driver positioning and demand momentum carry over. But with proper time-series modeling, switchback gives you a clean causal estimate in a context where no other design works.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Switchback experiments alternate between treatment and control windows within the same
        market — instead of splitting users or geographies, they split time. This solves the
        two-sided marketplace problem where demand and supply cannot be independently randomized.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Work through the switchback design questions</div>

      <InstructionBox>
        Study the switchback timeline below — it shows how treatment and control alternate every two
        hours within a single market. Notice that the same city is used for both arms; only time changes.
      </InstructionBox>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
          Switchback timeline — 2-hour windows, one market
        </div>
        <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" style={{ display: 'block' }}>
          {windows.map(function(w, i) {
            var x = 10 + i * segW;
            var isT = w === 'T';
            return (
              <g key={i}>
                <rect x={x} y={8} width={segW - 2} height={44} rx="3"
                  fill={isT ? 'var(--accent-bg)' : 'var(--surface)'}
                  stroke={isT ? 'var(--accent-border)' : 'var(--border)'} strokeWidth="1" />
                <text x={x + segW / 2 - 1} y={34} textAnchor="middle" fontSize="13" fontWeight="700"
                  fill={isT ? 'var(--accent)' : 'var(--text-muted)'}>
                  {w}
                </text>
                <text x={x + segW / 2 - 1} y={62} textAnchor="middle" fontSize="8" fill="var(--text-muted)">
                  {(i * 2) + 'h'}
                </text>
              </g>
            );
          })}
          <text x={10 + W / 2} y={H} textAnchor="middle" fontSize="8" fill="var(--text-muted)"></text>
        </svg>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          T = Treatment window, C = Control window. Same city, alternating every 2 hours.
        </div>
      </div>

      <InstructionBox>
        Answer each question in sequence — a new question unlocks after you check the previous one.
        Select the best answer and click Check to see the explanation and advance.
      </InstructionBox>

      {questions.map(function(q, qi) {
        if (qi > step) return null;
        var ans = answers[q.id];
        var rev = revealed[q.id];
        return (
          <div key={q.id} style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              {qi + 1}. {q.q}
            </div>
            {q.options.map(function(opt, i) {
              return (
                <MCQOption
                  key={i}
                  label={opt.label}
                  selected={ans === i}
                  correct={opt.correct}
                  revealed={rev}
                  onClick={function() { selectAnswer(q.id, i); }}
                />
              );
            })}
            {ans !== undefined && !rev && (
              <CheckBtn onClick={function() { revealAnswer(q.id); }} />
            )}
            {rev && (
              <div className="pal-reveal-in" style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      {step === questions.length - 1 && revealed['q3'] && (
        <div className="pal-reveal-in">
          <InsightBox>
            Switchback experiments are the canonical design for ride-sharing, food delivery, and logistics platforms where supply and demand interact at the market level. The key concepts interviewers probe: SUTVA violation in two-sided marketplaces, temporal autocorrelation modeling, and why neither user-level nor geo splits solve the problem.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module registry ─────────────────────────────────────────────────────────
const MODULE_COMPONENTS = {
  ef01: Module_EF01,
  ef02: Module_EF02,
  ef03: Module_EF03,
  ef04: Module_EF04,
  ef05: Module_EF05,
  ef06: Module_EF06,
  ef07: Module_EF07,
  ef08: Module_EF08,
  ef09: Module_EF09,
  ef10: Module_EF10,
  ef11: Module_EF11,
  ef12: Module_EF12,
  ef13: Module_EF13,
  ef14: Module_EF14,
  ef15: Module_EF15,
};

// ── Runner shell ────────────────────────────────────────────────────────────
export function ExpFoundationsRunner({ moduleId, onBack, onNext, unlocked, onSelectModule }) {
  var module = expFoundationModules.find(function(m) { return m.id === moduleId; });
  var [completed, setCompleted] = useState(false);
  var allProgress = getAllExpFoundationProgress();

  useEffect(function() {
    setCompleted(false);
  }, [moduleId]);

  if (!module) return null;

  var ModuleComponent = MODULE_COMPONENTS[moduleId];

  function handleComplete() {
    saveExpFoundationProgress(moduleId);
    track('case_completed', { room: 'exp-foundations', id: moduleId, title: module.title });
    setCompleted(true);
  }

  return (
    <FoundationRunnerShell
      module={module}
      totalModules={expFoundationModules.length}
      completed={completed}
      color='var(--accent)'
      roomLabel='A/B Foundations'
      onBack={onBack}
      playbookLinks={module.playbookLinks}
      modules={expFoundationModules}
      currentModuleId={moduleId}
      onSelectModule={onSelectModule}
      progress={allProgress}
    >
      {ModuleComponent ? (
        <>
          <ModuleComponent onComplete={handleComplete} />
          {completed && (
            <div className='pal-reveal-in' style={{ marginTop: '1.75rem' }}>
              <div style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginBottom: '1rem',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' }}>
                  Why this matters for experimentation practice
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}>
                  {module.connection}
                </div>
              </div>

              <InsightBox label='Key Insight'>{module.keyInsight}</InsightBox>

              <NextBtn onClick={onNext} label={module.index < expFoundationModules.length ? 'Next module →' : 'Back to all modules'} />
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Module content coming soon.</div>
      )}
    </FoundationRunnerShell>
  );
}
