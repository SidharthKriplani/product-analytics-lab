import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox as SharedInsightBox, NextBtn as SharedNextBtn, MCQOption, CheckBtn as SharedCheckBtn, InstructionBox as SharedInstructionBox } from '../../shared/FoundationPrimitives.jsx';

function InsightBox(props) { return <SharedInsightBox color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)' {...props} />; }
function NextBtn(props) { return <SharedNextBtn color='var(--accent)' {...props} />; }
function CheckBtn(props) { return <SharedCheckBtn color='var(--accent)' {...props} />; }
function InstructionBox(props) { return <SharedInstructionBox color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)' {...props} />; }

function saveEFState(id, state) { try { localStorage.setItem('pal-ef-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadEFState(id) { try { var raw = localStorage.getItem('pal-ef-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleEF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

var EF01_CLAIMS = [
  { id: 'c1', text: 'Users who complete onboarding have 3x higher retention', answer: 'correlation', explanation: 'Users who complete onboarding may be more motivated to begin with. The onboarding didn\'t necessarily cause retention — motivated users both finish onboarding and stick around.' },
  { id: 'c2', text: 'Countries that eat more chocolate win more Nobel prizes', answer: 'correlation', explanation: 'A famous spurious correlation. Wealth drives both chocolate consumption and research funding. There is no causal mechanism from chocolate to Nobel prizes.' },
  { id: 'c3', text: 'Adding a progress bar increased signup completion by 12% in our A/B test', answer: 'causal', explanation: 'This came from a controlled A/B test with random assignment. The only systematic difference between groups was the progress bar, so the 12% lift is a causal estimate.' },
  { id: 'c4', text: 'Power users who enable notifications churn 40% less', answer: 'correlation', explanation: 'Power users are already more engaged — they enable notifications because they care, and they churn less because they\'re invested. The notification setting is a symptom of engagement, not a cause of retention.' },
  { id: 'c5', text: 'We randomly assigned 50% of new users to a simplified pricing page and saw 8% higher plan upgrades', answer: 'causal', explanation: 'Random assignment ensures the groups are comparable. The simplified pricing page is the only systematic difference, so the 8% lift is causal.' },
  { id: 'c6', text: 'Customers who contact support within their first week have 2x higher lifetime value', answer: 'correlation', explanation: 'Customers who contact support early may be more invested in the product. The support interaction correlates with engagement, but didn\'t cause the higher LTV.' },
];

export function Module_EF01({ onComplete }) {
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
    { label: 'A. A strong correlation, even with r above 0.9, still cannot rule out a third variable driving both, so it never substitutes for random assignment', correct: false },
    { label: 'B. Only controlled experiments with random assignment can establish causality — observational data shows correlation regardless of effect size', correct: true },
    { label: 'C. Causation requires a sample of at least a few thousand users; below that, any relationship you see is correlation, not causation, by definition', correct: false },
    { label: 'D. If you control for every confounder you can name in a regression, the remaining association is automatically the true causal effect of X on Y', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Your product team has a finding: users who completed the new onboarding flow have 3x higher 30-day retention than users who skipped it. The PM wants to force every new user through the flow. It looks airtight. The numbers are clear. Retention is three times higher.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Before you act on this: who completed the onboarding? The motivated users. The ones who were curious enough to click through every step, who had enough intent to invest ten minutes before seeing the product's value. Those users would have retained well regardless of the onboarding — their motivation caused both behaviors. The onboarding didn't produce their retention. Their underlying engagement produced both.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          This is the central problem of observational data: you're watching two groups of people — completers and skippers — who were already different before they ever saw your product. The data tells you what happened. It cannot tell you why.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The naive fix is to control for differences. If completers are more experienced users, hold experience constant. If they came from a different acquisition channel, hold channel constant. You regress out every confounder you can think of. But for every confounder you can measure and control for, there are ten you can't. Motivation. Intent. Patience. Curiosity. These aren't in your database. Regression can reduce confounding; it cannot eliminate it. A confounder you didn't think to measure is still warping your estimate.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          What you actually need is a mechanism that makes the two groups comparable before the experiment begins — comparable on every dimension, measured and unmeasured. That mechanism is random assignment. When you randomly split users into treatment and control, the groups are comparable on everything: the same average motivation, the same average intent, the same device mix — because any difference is now random noise, not systematic bias. The randomization breaks the link between who the users are and which treatment they receive.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          This is the only mechanism that creates this property. Observational analysis, no matter how sophisticated, cannot reproduce it. Only random assignment makes the groups genuinely comparable — which is the only basis for a causal claim.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Of the following claims, which can support a causal conclusion and which cannot — and what specifically makes the difference? Work through each before checking.
        </p>
      </div>

      {/* ── Causality Classifier ── */}
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
                      padding: '0.55rem 0.9rem', minHeight: '40px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 600, cursor: revealed ? 'default' : 'pointer',
                      border: '1.5px solid ' + (userChoice === 'causal' ? 'var(--accent)' : 'var(--border)'),
                      background: userChoice === 'causal' ? 'var(--accent-bg)' : 'var(--surface)',
                      color: userChoice === 'causal' ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                  >Causal</button>
                  <button
                    onClick={function() { handleClassify(claim.id, 'correlation'); }}
                    style={{
                      padding: '0.55rem 0.9rem', minHeight: '40px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 600, cursor: revealed ? 'default' : 'pointer',
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
          When someone presents a data finding, ask one question: <strong>was there random assignment?</strong> If users were randomly split into treatment and control, the comparison is causal. If users self-selected into groups (completed onboarding vs didn't, enabled notifications vs didn't, purchased vs didn't), the comparison is correlational — no matter how large the effect size, how many users are in the sample, or how many confounders you control for in a regression.
        </p>
      </div>

      {/* ── What you should have confirmed ── */}
      {revealed && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The only claims that support causal conclusions are those from controlled A/B tests with random assignment. Every other claim — no matter how large the effect, how many users are in the sample, or how many confounders have been adjusted for — is correlational. The pattern is not about the size of the effect. It's about the assignment mechanism.
          </p>
        </div>
      )}

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
              Regression can reduce confounding but never eliminates it — there are always unmeasured confounders. Large samples increase statistical power but don't fix selection bias. Only random assignment guarantees that the groups are comparable on every dimension, measured and unmeasured.
            </div>
          )}
        </div>
      )}

      {/* ── Analyst Move ── */}
      {mcqRevealed && (
        <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> When someone presents an observational finding and recommends a product change, ask one question before anything else: was there random assignment? If no, the finding is correlational. State that clearly and redirect toward an experiment design before anyone allocates roadmap space to it.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> "We controlled for X, Y, and Z in the regression" does not make a finding causal. Regression reduces confounding from measured variables; it cannot touch unmeasured ones. This is the most common analytical error in practice — treating a well-specified regression as equivalent to a randomized experiment. It is not.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> When you design an experiment, document why you're running it rather than relying on existing data. This forces the team to acknowledge the causality requirement up front and prevents the post-hoc rationalization of observational findings as causal evidence.</p>
          </div>
        </div>
      )}

      {mcqRevealed && (
        <NextBtn onClick={onComplete} />
      )}
    </div>
  );
}
