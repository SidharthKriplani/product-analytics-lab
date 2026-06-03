import { useState, useEffect } from 'react';
import { loadSFState, saveSFState } from '../../../utils/statsFoundationsState.js';

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

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        The <strong>fundamental problem of causal inference</strong>: you can never observe what would have
        happened to the same unit in a different condition. A/B tests solve this by randomly assigning
        users to conditions — creating a group that IS the counterfactual. Below, classify each comparison.
      </p>

      {/* Instruction */}
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
                    Causal ✓
                  </button>
                  <button
                    onClick={() => handleAnswer(s.id, 'confounded')}
                    style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--red-border)', background: 'var(--red-bg)', color: 'var(--red)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Confounded ✗
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 700, color: isCorrect ? 'var(--green)' : 'var(--red)', marginRight: 6 }}>
                    {isCorrect ? '✓ Correct —' : '✗ Not quite —'}
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
                    {opt.correct ? '✓ ' : '✗ '}{opt.feedback}
                  </div>
                )}
                {mcqRevealed && !isChosen && opt.correct && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--green)', lineHeight: 1.55, marginTop: '0.3rem', paddingLeft: '0.25rem' }}>
                    ✓ {opt.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection}
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
