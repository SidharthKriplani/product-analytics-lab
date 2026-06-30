import { useState, useEffect } from 'react';
import { loadSFState, saveSFState } from '../../../utils/statsFoundationsState.js';
import { Icon } from '../../shared/Icon.jsx';

const MCQ = {
  id: 'ad_counterfactual',
  question: 'Your company ran an ad campaign for one week. Signups were higher that week. Which approach gets closest to the true counterfactual?',
  options: [
    {
      id: 'a',
      label: 'Compare signup rates on days the ad ran versus days it did not run',
      correct: true,
      feedback: 'Correct. Days without the ad serve as a same-period control, removing seasonality and other time-varying confounds that would contaminate a before/after comparison.',
    },
    {
      id: 'b',
      label: 'Survey users who signed up and ask whether the ad influenced them',
      correct: false,
      feedback: 'Self-report is unreliable. Users cannot accurately recall or attribute their own decision drivers. This measures stated attribution, not causal effect.',
    },
    {
      id: 'c',
      label: 'Compare signup rates in the week before the campaign to the campaign week',
      correct: false,
      feedback: 'Before/after comparisons cannot separate the ad effect from time trends, weekday effects, or other simultaneous changes. The prior week is not the counterfactual for the same week under a different condition.',
    },
  ],
};

const SCENARIOS = [
  {
    id: 'obs',
    label: 'Observational comparison',
    description: 'Users who adopted the new recommendation feature have 2× higher 90-day retention than users who did not.',
    verdict: 'confounded',
    explanation: 'Power users and highly engaged users are more likely to adopt any new feature. They would have retained better regardless. The feature correlation is real, but the causal interpretation is not.',
  },
  {
    id: 'rct',
    label: 'Randomized experiment',
    description: 'In an A/B test, users randomly assigned to the recommendation feature have 2× higher 90-day retention than control users.',
    verdict: 'causal',
    explanation: 'Random assignment ensures that, on average, treatment and control groups are identical on all observed and unobserved characteristics. The only systematic difference is the feature. The comparison is valid.',
  },
  {
    id: 'before_after',
    label: 'Before / after comparison',
    description: 'After the recommendation feature launched company-wide, 90-day retention improved by 18% vs. the prior quarter.',
    verdict: 'confounded',
    explanation: 'Many things change quarter to quarter: seasonality, product improvements, marketing, macroeconomic conditions. Without a control group showing what retention would have been absent the feature, you cannot attribute the 18% to the feature itself.',
  },
];

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module21_Counterfactuals({ module, onNext }) {
  var _saved = loadSFState('sf21');
  const [answers, setAnswers] = useState(function() { return _saved ? (_saved.answers || {}) : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved ? (_saved.revealed || {}) : {}; });
  const [mcqAnswer, setMcqAnswer] = useState(function() { return _saved ? (_saved.mcqAnswer || null) : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved ? !!_saved.mcqRevealed : false; });

  useEffect(function() {
    saveSFState('sf21', { answers: answers, revealed: revealed, mcqAnswer: mcqAnswer, mcqRevealed: mcqRevealed });
  }, [answers, revealed, mcqAnswer, mcqRevealed]);

  function handleAnswer(id, verdict) {
    if (revealed[id]) return;
    setAnswers(prev => ({ ...prev, [id]: verdict }));
    setRevealed(prev => ({ ...prev, [id]: true }));
  }

  function handleMcq(optId) {
    if (mcqRevealed) return;
    setMcqAnswer(optId);
    setMcqRevealed(true);
  }

  const allDone = SCENARIOS.every(s => revealed[s.id]);
  const score = SCENARIOS.filter(s => answers[s.id] === s.verdict).length;

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          We have established that correlation is not causation. But that raises a harder question: what does causation require, and how do you establish it?
        </p>
        <p style={prose}>
          The causal question has a precise formulation. The effect of a treatment on a unit is: the outcome if the unit received the treatment, minus the outcome if the unit did not receive the treatment — both at the same time, in the same conditions.
        </p>
        <p style={prose}>
          The problem is immediate: you can never observe both. A user either gets your new feature or they do not. A market either receives your intervention or it does not. You can only observe one outcome per unit. The other — what would have happened without the treatment — is unobserved. That unobserved outcome is the <strong style={{ color: 'var(--text)' }}>counterfactual</strong>.
        </p>
        <p style={prose}>
          Causal inference is the discipline of constructing a credible counterfactual from available data. Every causal method — experiment, DiD, regression discontinuity, synthetic control, instrumental variables — is solving the same problem: finding a valid proxy for what would have happened in the world where the intervention did not occur.
        </p>
        <p style={prose}>
          The randomized experiment solves this directly. Random assignment makes the treatment and control groups identical in expectation — same average engagement, same average risk factors, same average everything. The control group's outcome after treatment becomes the proxy for what the treatment group would have experienced without treatment. The counterfactual is the control group. This is why A/B testing is the gold standard. The randomization is doing all the work.
        </p>
        <p style={prose}>
          In many situations, you cannot randomize. You observe the treatment happening in the world, without control over who receives it. This is the observational setting. Here, systematic differences between treated and untreated units — <strong style={{ color: 'var(--text)' }}>confounders</strong> — create spurious correlations between the treatment and the outcome that have nothing to do with the treatment's actual effect. A confounder is a variable that affects both who receives the treatment and what the outcome is.
        </p>
        <p style={prose}>
          The four causal inference methods in the following modules — Difference-in-Differences, Regression Discontinuity, Synthetic Control, and Instrumental Variables — each construct the counterfactual using a different mechanism, all trying to answer the same question: given that I cannot observe the counterfactual directly, what is the best proxy I can construct?
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Users who use your mobile app's "favourites" feature have 2x higher 90-day retention. You are considering making the feature more prominent to drive adoption. What is missing from the statement "favourites usage causes retention" before you can justify that product decision?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Classify Causal vs. Confounded</div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Read each scenario description and classify it as either "Causal" (a valid counterfactual comparison) or "Confounded" (a biased comparison). After each pick, you will see the explanation. Try to identify the confound before it is revealed.
      </div>

      {/* Scenario cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {SCENARIOS.map(s => {
          const isRevealed = revealed[s.id];
          const userAnswer = answers[s.id];
          const isCorrect = userAnswer === s.verdict;
          const borderColor = !isRevealed ? 'var(--border)' : isCorrect ? 'var(--green-border)' : 'var(--red-border)';
          const bgColor = !isRevealed ? 'var(--surface)' : isCorrect ? 'var(--green-bg)' : 'var(--red-bg)';

          return (
            <div key={s.id} style={{ border: `1.5px solid ${borderColor}`, borderRadius: 'var(--radius)', background: bgColor, padding: '1rem 1.25rem', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                {s.label}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
                {s.description}
              </p>

              {!isRevealed ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleAnswer(s.id, 'causal')}
                    style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--green-border)', background: 'var(--green-bg)', color: 'var(--green)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Causal <Icon name='check' size={13} color='currentColor' />
                  </button>
                  <button
                    onClick={() => handleAnswer(s.id, 'confounded')}
                    style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--red-border)', background: 'var(--red-bg)', color: 'var(--red)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Confounded <Icon name='x' size={13} color='currentColor' />
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 700, color: isCorrect ? 'var(--green)' : 'var(--red)', marginRight: 6 }}>
                    {isCorrect ? <><Icon name='check' size={15} color='currentColor' /> Correct —</> : <><Icon name='x' size={15} color='currentColor' /> Not quite —</>}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Score */}
      {allDone && (
        <div className="pal-reveal-in" style={{ background: score === 3 ? 'var(--green-bg)' : 'var(--yellow-bg)', border: `1px solid ${score === 3 ? 'var(--green-border)' : 'var(--yellow-border)'}`, borderRadius: 'var(--radius)', padding: '0.9rem 1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: score === 3 ? 'var(--green)' : 'var(--yellow-text)' }}>
            {score === 3 ? '3/3 — Perfect. You can spot a confound.' : score === 2 ? '2/3 — Good. The before/after trap is the most common.' : '1/3 — Revisit the explanations above.'}
          </div>
        </div>
      )}

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
      {allDone && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            "Favourites usage causes retention" conflates correlation with causation. Higher-intent users both adopt favourites and retain better — engagement is a confounder. Making favourites more visible might drive adoption by lower-intent users who would not retain regardless. To establish the causal claim, you would need to randomize: show some users a prominent favourites prompt and others the current experience, then measure retention. Without randomization, the favourites-retention correlation is evidence, not causation.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> When a metric correlation is presented as a product decision rationale, draw the causal diagram — even on a napkin. Who does this treatment? Who does not? Why the difference? What else affects the outcome? Any path that affects both treatment assignment and outcome is a confounder. Name it before accepting the causal claim.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Before proposing an observational analysis to measure a product change, ask: can this be an experiment? Even if you cannot randomize the primary treatment, you may be able to run a partial test, a holdout, or a regression discontinuity around a natural threshold. The gold standard is always available if the team is willing to design for it.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Be precise about the causal claim you are making. "Users who do X have higher LTV" is a correlation statement — valid to report as-is. "Driving X behavior will increase LTV" is a causal claim that requires a counterfactual argument. Do not let PMs or slide decks collapse the two. The gap between them is where bad product decisions live.</p>
        </div>
      </div>

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'A/B testing is the only method that directly observes the counterfactual. Random assignment means the control group is, on average, the treated group in a world without the treatment. Every observational method is an attempt to approximate what the experiment does directly. When an experiment is feasible, it is always preferable — the counterfactual is not approximated, it is constructed.'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="pal-glow-pulse"
          onClick={onNext}
          style={{ padding: '0.7rem 1.75rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: 'var(--shadow)', letterSpacing: '0.02em' }}
        >
          Next concept →
        </button>
      </div>
    </div>
  );
}
