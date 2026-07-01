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

export function Module_EF04({ onComplete }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Your experiment readout shows p = 0.03. The PM asks: "So there's a 3% chance the feature doesn't work?" The data scientist across the table nods. You know something is wrong but aren't sure how to correct it.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The p-value is one of the most consistently misunderstood numbers in practice, and the misreading has a specific shape: people treat it as answering "how likely is the null hypothesis?" It answers a different question entirely.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Your metric varies naturally. Even with no changes, daily conversion fluctuates based on who visits, whether it's payday, whether a competitor had an outage. If that natural variance can produce a 0.4pp swing on an ordinary day, maybe your experiment's random assignment just happened to give one arm more high-intent users. To answer this rigorously, you ask: if the feature truly had no effect — if the null hypothesis were exactly true — how often would you observe a gap this large or larger, purely by chance? That question is what the p-value answers.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          p = 0.03 means: in a world where the feature has zero effect, you'd observe your observed gap or something more extreme only 3% of the time. The data is hard to explain with noise alone. p = 0.40 means: your result is completely consistent with randomness. What the p-value is not: it is not the probability that the feature doesn't work. It is specifically the probability of observing your data or something more extreme, given that the null is true.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The p-value also says nothing about the size of the effect. With enough users, a 0.01pp lift becomes p &lt; 0.001 — extremely significant, completely irrelevant. This is where the confidence interval completes the picture. A 95% CI gives you a range of plausible effect sizes. If your experiment shows +0.4pp with a 95% CI of [+0.1pp, +0.7pp], the data is consistent with lifts anywhere in that range. A CI that includes zero means the data is consistent with no effect. Statistical significance is just the entry ticket — effect size determines whether it's worth acting on.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Before checking each statement &mdash; which of these three common p-value interpretations do you believe are true? Form your initial read before the exercise forces you to commit.
        </p>
      </div>

      {/* ── Try It ── */}
      <div>
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
          <div style={{
            padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem',
            background: correctCount === statements04.length ? 'var(--teal-bg)' : 'var(--yellow-bg)',
            border: '1px solid ' + (correctCount === statements04.length ? 'var(--teal-border)' : 'var(--yellow-border)'),
            color: correctCount === statements04.length ? 'var(--teal)' : 'var(--yellow)',
            fontWeight: 700, fontSize: '0.88rem',
          }}>
            {correctCount}/{statements04.length} correct
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {allRevealed && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Only one of the three statements is true: &quot;p &gt; 0.05 means the experiment is inconclusive, not proof of no effect.&quot; The most common mistake is statement one &mdash; treating the p-value as the probability that the null hypothesis is true. It is not. The p-value is the probability of observing data this extreme or more extreme assuming the null is already true. These are different questions. Statement two is the second most common error: statistical significance (CI excludes zero) only means the effect is distinguishable from zero given the sample size &mdash; a +0.001pp lift can be statistically significant with millions of users. Practical significance requires looking at the effect size, not just the p-value.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {allRevealed && (
        <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Always report the confidence interval alongside the p-value. The p-value answers "is this real?" The CI answers "how large might it be?" Stakeholders making investment decisions need both. A p-value alone is an incomplete readout.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> When someone interprets p = 0.03 as "97% chance the feature works," correct it directly and immediately. The correct interpretation: "if this feature had no effect, we'd observe a gap this large only 3% of the time by chance." That's still impressive evidence — but it's evidence about the data given the null, not evidence about the null given the data.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Statistical significance with a tiny CI that stays near zero is a ship-or-not decision, not a win. Before calling an experiment a success, look at the lower bound of the CI. If even the optimistic end of the plausible effect range is too small to justify shipping costs, you have a technically significant but practically neutral result. Call it that.</p>
          </div>
        </div>
      )}

      {allRevealed && (
        <NextBtn onClick={onComplete} label="Complete module →" />
      )}
    </div>
  );
}
