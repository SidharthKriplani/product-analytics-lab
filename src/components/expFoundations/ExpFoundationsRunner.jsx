import { useState, useEffect, useMemo } from 'react';
import { expFoundationModules } from '../../data/expFoundationModules.js';
import { saveExpFoundationProgress, getAllExpFoundationProgress } from '../../utils/expFoundationProgress.js';
import { track } from '../../utils/analytics.js';
import { HowTo } from '../shared/HowTo.jsx';

const NOTES_KEY = 'pal-notes-v1';

function getNotes(room, caseId) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    return all[room + ':' + caseId] || '';
  } catch { return ''; }
}

function saveNote(room, caseId, text) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    all[room + ':' + caseId] = text;
    localStorage.setItem(NOTES_KEY, JSON.stringify(all));
  } catch {}
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function InsightBox({ children }) {
  return (
    <div style={{
      background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
      borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginTop: '1.25rem',
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
        Key Insight
      </div>
      <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function NextBtn({ onClick, label }) {
  return (
    <button onClick={onClick} className="pal-glow-pulse" style={{
      marginTop: '1.5rem', padding: '0.65rem 1.6rem',
      background: 'var(--accent)', color: '#fff', border: 'none',
      borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.9rem',
      cursor: 'pointer',
    }}>
      {label || 'Next →'}
    </button>
  );
}

function MCQOption({ label, selected, correct, revealed, onClick }) {
  let bg = 'var(--surface-2)';
  let border = 'var(--border)';
  let color = 'var(--text)';
  if (revealed) {
    if (correct) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
    else if (selected && !correct) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
  } else if (selected) {
    border = 'var(--accent-border)';
  }
  return (
    <button onClick={onClick} disabled={revealed} style={{
      display: 'block', width: '100%', textAlign: 'left',
      padding: '0.7rem 1rem', marginBottom: '0.5rem',
      background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)',
      color, fontSize: '0.88rem', cursor: revealed ? 'default' : 'pointer',
      transition: 'all 0.15s',
    }}>
      {label}
    </button>
  );
}

function CheckBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      marginTop: '0.5rem', padding: '0.5rem 1.1rem',
      background: 'var(--accent)', color: '#fff', border: 'none',
      borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
    }}>
      Check
    </button>
  );
}

function InstructionBox({ children }) {
  return (
    <div style={{
      background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
      borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem',
      fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5,
    }}>
      <strong>What to do:</strong> {children}
    </div>
  );
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
function Module_EF01({ onComplete }) {
  const _saved01 = useMemo(function() { return loadEFState('ef01'); }, []);
  const [answer, setAnswer] = useState(_saved01 ? _saved01.answer : null);
  const [revealed, setRevealed] = useState(_saved01 ? _saved01.revealed : false);

  useEffect(function() { saveEFState('ef01', { answer: answer, revealed: revealed }); }, [answer, revealed]);

  const question = 'A PM notices checkout rate is 12% for users who see the new CTA, vs 9% for others. They conclude the CTA causes higher conversion. What\'s wrong?';

  const options = [
    { label: 'A. The comparison period is too short — seasonal effects could explain the 3pp difference', correct: false },
    { label: 'B. Correlation is not causation — users who see the CTA may differ systematically from those who don\'t', correct: true },
    { label: 'C. The 12% vs 9% gap may not be practically significant for the business even if it\'s statistically real', correct: false },
    { label: 'D. The sample needs to be stratified by user segment before any comparison is valid', correct: false },
  ];

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        This module covers why observational data is not enough to establish causality, and how A/B testing solves
        the fundamental problem of selection bias. Understanding this distinction is the foundation of every
        experimentation conversation in a PM or analyst interview.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        Observational data seems simple: compare the group that saw the feature with the group that did not.
        But this comparison has a fundamental flaw that A/B testing is designed to fix.
      </p>

      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem',
        fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6,
      }}>
        <strong>Question:</strong> {question}
      </div>

      <InstructionBox>
        Select the answer that best captures the flaw in the PM's reasoning. Focus on what is different
        about the two groups before any treatment was applied.
      </InstructionBox>

      {options.map((opt, i) => (
        <MCQOption
          key={i}
          label={opt.label}
          selected={answer === i}
          correct={opt.correct}
          revealed={revealed}
          onClick={() => !revealed && setAnswer(i)}
        />
      ))}

      {answer !== null && !revealed && <CheckBtn onClick={() => setRevealed(true)} />}

      {revealed && (
        <div>
          <div style={{
            marginTop: '0.5rem', padding: '0.65rem 0.85rem',
            background: options[answer] && options[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (options[answer] && options[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
          }}>
            Users who see the new CTA are not a random sample — they may be more engaged, further in the funnel, or on a specific device. The higher checkout rate may reflect who they are, not what the CTA did. This is selection bias, and it is why observational comparisons cannot establish causality. Option A (seasonality) and D (stratification) both identify real issues that matter in experiment design — but they are not the primary flaw in an observational comparison. Option C (practical significance) would be a relevant concern after confirming causality, not before.
          </div>
          <InsightBox>
            Observational comparisons confound treatment with selection bias. Only random assignment breaks
            the confound — it ensures the only systematic difference between groups is the treatment itself.
            That is why A/B tests beat intuition, analytics dashboards, and before/after comparisons.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
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
  const _saved03 = useMemo(function() { return loadEFState('ef03'); }, []);
  const [part1Answer, setPart1Answer] = useState(_saved03 ? _saved03.part1Answer : null);
  const [part1Revealed, setPart1Revealed] = useState(_saved03 ? _saved03.part1Revealed : false);
  const [part2Answer, setPart2Answer] = useState(_saved03 ? _saved03.part2Answer : null);
  const [part2Revealed, setPart2Revealed] = useState(_saved03 ? _saved03.part2Revealed : false);

  useEffect(function() { saveEFState('ef03', { part1Answer: part1Answer, part1Revealed: part1Revealed, part2Answer: part2Answer, part2Revealed: part2Revealed }); }, [part1Answer, part1Revealed, part2Answer, part2Revealed]);

  const part1Options = [
    { label: 'A. 2 days', correct: false },
    { label: 'B. 7 days', correct: false },
    { label: 'C. 30 days', correct: true },
    { label: 'D. 90+ days', correct: false },
  ];

  const part2Options = [
    { label: 'A. Doubles', correct: false },
    { label: 'B. Quadruples', correct: true },
    { label: 'C. Stays the same', correct: false },
    { label: 'D. Halves', correct: false },
  ];

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        This module covers how to size an experiment before running it. Power calculations and MDE are
        almost always tested in PM and analyst interviews — knowing the 1/MDE-squared relationship is
        the difference between a confident answer and a hand-wave.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        Sizing an experiment before you run it is non-negotiable. Running underpowered experiments wastes time
        and produces uninterpretable null results. Two key inputs: minimum detectable effect (MDE) and baseline rate.
      </p>

      {/* Part 1 */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1rem',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
          Part 1 of 2
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '1rem' }}>
          Your baseline CTR is 5%. You want to detect a 0.5pp lift (MDE = 0.5pp) with 80% power at
          alpha = 0.05. You get 10,000 users per day. Roughly how long will the experiment need to run?
        </div>

        <InstructionBox>
          Select the runtime estimate that best matches the given parameters. Think about how many total
          users are needed at 80% power before dividing by daily traffic.
        </InstructionBox>

        {part1Options.map((opt, i) => (
          <MCQOption
            key={i}
            label={opt.label}
            selected={part1Answer === i}
            correct={opt.correct}
            revealed={part1Revealed}
            onClick={() => !part1Revealed && setPart1Answer(i)}
          />
        ))}

        {part1Answer !== null && !part1Revealed && (
          <CheckBtn onClick={() => setPart1Revealed(true)} />
        )}

        {part1Revealed && (
          <div style={{
            marginTop: '0.5rem', padding: '0.65rem 0.85rem',
            background: part1Options[part1Answer] && part1Options[part1Answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (part1Options[part1Answer] && part1Options[part1Answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
          }}>
            At 5% baseline, detecting a 0.5pp lift (10% relative) at 80% power requires roughly 250,000–300,000
            users per variant, or 500,000–600,000 total. At 10,000 users/day that is 50–60 days.
            A commonly used rule of thumb for this baseline/MDE combo gives approximately 25–30 days per variant
            split — so around 30 days total is the closest answer.
          </div>
        )}
      </div>

      {/* Part 2 — show after Part 1 answered */}
      {part1Revealed && (
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1rem',
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Part 2 of 2
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '1rem' }}>
            You reduce your MDE from 0.5pp to 0.25pp (you want to detect a smaller effect).
            What happens to the required sample size?
          </div>

          <InstructionBox>
            Select what happens to required sample size when MDE is halved. Recall that sample size
            scales with 1/MDE squared and apply that relationship to the specific numbers here.
          </InstructionBox>

          {part2Options.map((opt, i) => (
            <MCQOption
              key={i}
              label={opt.label}
              selected={part2Answer === i}
              correct={opt.correct}
              revealed={part2Revealed}
              onClick={() => !part2Revealed && setPart2Answer(i)}
            />
          ))}

          {part2Answer !== null && !part2Revealed && (
            <CheckBtn onClick={() => setPart2Revealed(true)} />
          )}

          {part2Revealed && (
            <div style={{
              marginTop: '0.5rem', padding: '0.65rem 0.85rem',
              background: part2Options[part2Answer] && part2Options[part2Answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
              border: '1px solid ' + (part2Options[part2Answer] && part2Options[part2Answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
              borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
            }}>
              Sample size scales with 1/MDE squared. Halving the MDE from 0.5pp to 0.25pp means
              MDE ratio = 0.5/0.25 = 2, and 2 squared = 4. Required sample size quadruples.
              This is the most important formula in experiment design.
            </div>
          )}
        </div>
      )}

      {part2Revealed && (
        <div>
          <InsightBox>
            n proportional to 1/MDE squared. This is the central tradeoff: ambitious MDEs require
            exponentially more traffic. Most teams underpower experiments by setting overly optimistic MDE
            targets. Always run the power calculation first and check whether your traffic supports the
            runtime implied by your MDE.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
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
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        This module tests whether you can correctly interpret p-values and confidence intervals — the most
        commonly misquoted statistics in product experimentation. Interviewers routinely probe these
        definitions to separate candidates who understand the math from those who memorised a formula.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        p-values and confidence intervals are the most misquoted statistics in product experimentation.
        Mark each statement TRUE or FALSE, then check.
      </p>

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
  const _saved05 = useMemo(function() { return loadEFState('ef05'); }, []);
  const [answer, setAnswer] = useState(_saved05 ? _saved05.answer : null);
  const [revealed, setRevealed] = useState(_saved05 ? _saved05.revealed : false);

  useEffect(function() { saveEFState('ef05', { answer: answer, revealed: revealed }); }, [answer, revealed]);

  const options = [
    { label: 'A. Proceed — the split is close enough to 50/50', correct: false },
    { label: 'B. Flag as SRM; investigate the assignment pipeline before trusting any results', correct: true },
    { label: 'C. Re-weight the results by the expected 50/50 ratio and proceed', correct: false },
    { label: 'D. Extend the experiment until the ratios balance out naturally', correct: false },
  ];

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        This module covers Sample Ratio Mismatch (SRM) — a data quality check that must happen before
        reading any metric results. Interviewers testing experiment design will often introduce an SRM
        scenario to see if you know to pause the experiment rather than proceed.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        Sample Ratio Mismatch (SRM) is one of the most important data quality checks in experimentation.
        Before reading any metric results, always verify that the observed split matches the intended split.
      </p>

      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          Experiment report
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.88rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Intended split</div>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>50% / 50%</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Control visitors</div>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>48,200</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Treatment visitors</div>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>51,800</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Observed split</div>
            <div style={{ fontWeight: 700, color: 'var(--red)' }}>48.2% / 51.8%</div>
          </div>
        </div>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.85rem' }}>
        Your experiment was supposed to split 50/50. Control received 48,200 visitors, treatment received
        51,800. What do you do?
      </div>

      <InstructionBox>
        Select the correct action given the observed imbalance. Consider whether the imbalance can be
        corrected statistically, or whether it signals a deeper pipeline problem that invalidates the data.
      </InstructionBox>

      {options.map((opt, i) => (
        <MCQOption
          key={i}
          label={opt.label}
          selected={answer === i}
          correct={opt.correct}
          revealed={revealed}
          onClick={() => !revealed && setAnswer(i)}
        />
      ))}

      {answer !== null && !revealed && <CheckBtn onClick={() => setRevealed(true)} />}

      {revealed && (
        <div>
          <div style={{
            marginTop: '0.5rem', padding: '0.65rem 0.85rem',
            background: options[answer] && options[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (options[answer] && options[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
          }}>
            SRM means the groups are not the random samples you intended. Re-weighting (option C) does not
            fix this — you do not know which users were systematically excluded or over-included.
            Extending the experiment (option D) cannot correct a broken assignment pipeline.
            The only valid path is to pause, investigate, and re-run.
          </div>

          <div style={{
            marginTop: '0.85rem', padding: '0.75rem 1rem',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              Common SRM root causes
            </div>
            {[
              'Bot filtering applied to only one variant (bots flushed from control but not treatment)',
              'Redirect latency causing variant users to abandon before logging (treatment sees slower load)',
              'Logging bugs where events fire on only one code path',
              'Experiment assignment before eligibility check, but logging after — different users pass the check',
            ].map((c, i) => (
              <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '0.3rem' }}>
                {i + 1}. {c}
              </div>
            ))}
          </div>

          <InsightBox>
            SRM invalidates the experiment because the groups are no longer comparable. It is the experiment
            equivalent of a data quality check in RCA — always run it first, before reading any metric results.
            A chi-squared test on the observed vs expected counts gives a formal SRM p-value.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module EF06: Novelty Effects and Long-Run Validity ─────────────────────
function Module_EF06({ onComplete }) {
  const _saved06 = useMemo(function() { return loadEFState('ef06'); }, []);
  const [answer, setAnswer] = useState(_saved06 ? _saved06.answer : null);
  const [revealed, setRevealed] = useState(_saved06 ? _saved06.revealed : false);

  useEffect(function() { saveEFState('ef06', { answer: answer, revealed: revealed }); }, [answer, revealed]);

  const options = [
    { label: 'A. The algorithm degraded over time', correct: false },
    { label: 'B. Novelty effect followed by user adaptation — users explored the new recommendations initially, then settled into old patterns', correct: true },
    { label: 'C. Seasonality — traffic mix changed across the 8-week window', correct: false },
    { label: 'D. Sample ratio mismatch distorted early results', correct: false },
  ];

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        This module covers novelty effects and when experiment results can be trusted as a long-run signal.
        A candidate who ships based on week-one spikes without accounting for novelty decay is a red flag
        in any PM or analyst interview.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        Not all experiment results are stable. Initial measurements often reflect novelty behavior
        rather than the true long-run effect. Knowing when to trust week-one results is a key skill.
      </p>

      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          CTR over time — treatment vs control delta
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Week 1', delta: '+8%', color: 'var(--teal)' },
            { label: 'Week 4', delta: '+2%', color: 'var(--yellow)' },
            { label: 'Week 8', delta: '-1%', color: 'var(--red)' },
          ].map((d, i) => (
            <div key={i} style={{ minWidth: 90 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{d.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: d.color }}>{d.delta}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.85rem' }}>
        A new recommendation algorithm shows +8% CTR in week 1. By week 4 it is +2% and by week 8 it is -1%.
        What is the most likely explanation?
      </div>

      <InstructionBox>
        Select the explanation that best accounts for the decay pattern shown above. Rule out explanations
        that would not produce a smooth monotonic decline from a strong early positive.
      </InstructionBox>

      {options.map((opt, i) => (
        <MCQOption
          key={i}
          label={opt.label}
          selected={answer === i}
          correct={opt.correct}
          revealed={revealed}
          onClick={() => !revealed && setAnswer(i)}
        />
      ))}

      {answer !== null && !revealed && <CheckBtn onClick={() => setRevealed(true)} />}

      {revealed && (
        <div>
          <div style={{
            marginTop: '0.5rem', padding: '0.65rem 0.85rem',
            background: options[answer] && options[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (options[answer] && options[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
          }}>
            Users explore unfamiliar UI out of curiosity, generating clicks that are not sustainable.
            The initial +8% reflects novelty behavior. As users adapt, the lift decays to steady-state (+2%)
            and eventually the algorithm may perform worse (-1%) as users learn to ignore the recommendations.
            Seasonal variation (option C) would show a pattern correlated with time of year, not a smooth decay.
          </div>
          <InsightBox>
            Run experiments long enough to capture steady-state behavior — typically at least one full weekly
            cycle (to account for day-of-week effects), often 2-4 weeks for features with habitual use patterns.
            If you see a strong novelty decay, report the week-4+ average, not the week-1 peak, as your
            point estimate.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}

// ── Module EF07: Multiple Testing and Guardrails ────────────────────────────
function Module_EF07({ onComplete }) {
  const _saved07 = useMemo(function() { return loadEFState('ef07'); }, []);
  const [q1Answer, setQ1Answer] = useState(_saved07 ? _saved07.q1Answer : null);
  const [q1Revealed, setQ1Revealed] = useState(_saved07 ? _saved07.q1Revealed : false);
  const [q2Answer, setQ2Answer] = useState(_saved07 ? _saved07.q2Answer : null);
  const [q2Revealed, setQ2Revealed] = useState(_saved07 ? _saved07.q2Revealed : false);

  useEffect(function() { saveEFState('ef07', { q1Answer: q1Answer, q1Revealed: q1Revealed, q2Answer: q2Answer, q2Revealed: q2Revealed }); }, [q1Answer, q1Revealed, q2Answer, q2Revealed]);

  const q1Options = [
    { label: 'A. 0 — if there is truly no effect, you will never get a false positive', correct: false },
    { label: 'B. 1 — expected false positives = alpha x number of tests = 0.05 x 20 = 1', correct: true },
    { label: 'C. 5', correct: false },
    { label: 'D. 20', correct: false },
  ];

  const q2Options = [
    { label: 'A. Raises the significance threshold, making it easier to reject the null', correct: false },
    { label: 'B. Divides alpha by the number of tests — lowers the per-test threshold so the family-wise error rate stays at 5%', correct: true },
    { label: 'C. Removes metrics that were not significant, reducing the test count', correct: false },
    { label: 'D. Increases statistical power by pooling metrics together', correct: false },
  ];

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        This module covers how tracking multiple metrics simultaneously inflates false positive rates, and
        what the standard Bonferroni correction does about it. Interviewers will ask this any time you
        mention guardrail metrics or a multi-metric experiment dashboard.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        Most experiment dashboards track many metrics simultaneously. Each additional metric you test
        at alpha = 0.05 adds another 5% chance of a spurious significant result — even if nothing
        actually changed. This module covers the math and the standard correction.
      </p>

      {/* Q1 */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1rem',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
          Question 1 of 2
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '1rem' }}>
          You run one experiment and test 20 metrics simultaneously, each at alpha = 0.05.
          Assuming all null hypotheses are true, how many false positives do you expect by chance?
        </div>

        <InstructionBox>
          Select the expected number of false positives. Apply the definition of alpha as a per-test
          error rate and multiply across the number of independent tests.
        </InstructionBox>

        {q1Options.map((opt, i) => (
          <MCQOption
            key={i}
            label={opt.label}
            selected={q1Answer === i}
            correct={opt.correct}
            revealed={q1Revealed}
            onClick={() => !q1Revealed && setQ1Answer(i)}
          />
        ))}

        {q1Answer !== null && !q1Revealed && (
          <CheckBtn onClick={() => setQ1Revealed(true)} />
        )}

        {q1Revealed && (
          <div style={{
            marginTop: '0.5rem', padding: '0.65rem 0.85rem',
            background: q1Options[q1Answer] && q1Options[q1Answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (q1Options[q1Answer] && q1Options[q1Answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
          }}>
            Expected false positives = alpha × number of tests = 0.05 × 20 = 1. With 20 metrics you will
            on average find one "significant" result that is pure noise. This is why teams that track
            many metrics without correction find spurious wins regularly.
          </div>
        )}
      </div>

      {/* Q2 — show after Q1 answered */}
      {q1Revealed && (
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1rem',
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Question 2 of 2
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '1rem' }}>
            You apply Bonferroni correction to those 20 metrics. What does this correction do?
          </div>

          <InstructionBox>
            Select what Bonferroni correction does mechanically. Think about what it adjusts — the
            threshold, the sample, or the metric list — and in which direction.
          </InstructionBox>

          {q2Options.map((opt, i) => (
            <MCQOption
              key={i}
              label={opt.label}
              selected={q2Answer === i}
              correct={opt.correct}
              revealed={q2Revealed}
              onClick={() => !q2Revealed && setQ2Answer(i)}
            />
          ))}

          {q2Answer !== null && !q2Revealed && (
            <CheckBtn onClick={() => setQ2Revealed(true)} />
          )}

          {q2Revealed && (
            <div style={{
              marginTop: '0.5rem', padding: '0.65rem 0.85rem',
              background: q2Options[q2Answer] && q2Options[q2Answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
              border: '1px solid ' + (q2Options[q2Answer] && q2Options[q2Answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
              borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
            }}>
              Bonferroni sets the per-test alpha to alpha / number of tests = 0.05 / 20 = 0.0025.
              This keeps the family-wise error rate (the probability of any false positive across all tests)
              at 5%. It is conservative — it may miss real effects — but it is simple and widely understood.
              For guardrail metrics, where false positives are costly, this conservatism is appropriate.
            </div>
          )}
        </div>
      )}

      {q2Revealed && (
        <div>
          <InsightBox>
            The practical takeaway: pre-specify your primary metric before running the experiment.
            Use a Bonferroni-corrected threshold (or Benjamini-Hochberg for less conservatism) when
            evaluating secondary and guardrail metrics. Do not data-mine your metric list after seeing
            results — that is p-hacking, and interviewers know to probe for it.
          </InsightBox>
          <NextBtn onClick={onComplete} label="Complete module →" />
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
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        An A/A test runs your experiment infrastructure with identical treatment in both groups.
        It should never show a significant result — when it does, your platform has a systematic problem.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        The chart below simulates a 30-day A/A test. Watch how the p-value wanders — and notice
        what happens early in the run.
      </p>

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
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        CUPED (Controlled-experiment Using Pre-Experiment Data) reduces outcome variance by subtracting
        the portion of the metric that is predictable from pre-experiment behavior.
        Less noise means the same experiment detects smaller effects — or reaches significance faster.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        The scatter below shows each user's pre-experiment metric (x) vs their post-experiment metric (y).
        Toggle CUPED on to see what the technique removes.
      </p>

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
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Most teams peek at experiment results before the planned end date. Done naively, this inflates
        the true false positive rate far above the promised 5%. Sequential testing provides a principled
        solution — valid early stopping without breaking your error guarantees.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        The charts below show the same underlying p-value trajectory under two different stopping policies.
        Watch where each approach fires a significant signal.
      </p>

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
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Standard A/B tests assume each user's outcome depends only on their own treatment assignment.
        When users interact — through social feeds, shared supply pools, or referral chains — this
        assumption breaks and your effect estimates become biased.
      </p>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        SUTVA (Stable Unit Treatment Value Assumption) is the formal name for this requirement.
        For each scenario below, decide whether SUTVA holds and which design is appropriate.
      </p>

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
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Individual A/B tests answer one question: did this feature move the metric? But they cannot
        answer: are all our feature launches adding up to real business value? A holdout group answers
        the second question by keeping a small user slice permanently excluded from all new launches.
      </p>

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
        <div className="pal-reveal-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
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
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        A fixed A/B test splits traffic equally and waits — it optimizes for measurement. A multi-armed
        bandit shifts traffic toward better-performing variants in real time — it optimizes for reward
        during the experiment. The tradeoff is statistical precision vs. opportunity cost.
      </p>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
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
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Geo experiments randomize at the geographic unit — city, DMA, or country — rather than the user.
        They solve the problem of network spillover and enable testing of channels where individual
        assignment is impossible, like TV advertising or marketplace pricing. The tradeoff is power:
        100 cities gives you far fewer randomization units than 1 million users.
      </p>

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
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        Switchback experiments alternate between treatment and control windows within the same
        market — instead of splitting users or geographies, they split time. This solves the
        two-sided marketplace problem where demand and supply cannot be independently randomized.
      </p>

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
  const module = expFoundationModules.find(m => m.id === moduleId);
  const [completed, setCompleted] = useState(false);
  const [note, setNote] = useState(() => getNotes('exp-foundations', moduleId));
  useEffect(() => {
    setCompleted(false);
    setNote(getNotes('exp-foundations', moduleId));
  }, [moduleId]);

  if (!module) return null;

  const ModuleComponent = MODULE_COMPONENTS[moduleId];

  function handleComplete() {
    saveExpFoundationProgress(moduleId);
    track('case_completed', { room: 'exp-foundations', id: moduleId, title: module.title });
    setCompleted(true);
  }

  const completedMap = getAllExpFoundationProgress();

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '1.5rem 1rem', width: '100%', boxSizing: 'border-box', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

      {/* ── Right nav sidebar ── */}
      <div className="pal-foundation-nav" style={{
        width: '190px', flexShrink: 0, order: 2,
        position: 'sticky', top: '1rem',
        maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '0.75rem 0.5rem',
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 0.4rem', marginBottom: '0.5rem' }}>
          Exp Foundations
        </div>
        {expFoundationModules.map((m) => {
          const isCurrent = m.id === moduleId;
          const isDone = !!completedMap[m.id];
          const isStub = !!m.isStub;
          const isLocked = !m.isFree && !unlocked;
          const isBlocked = isStub || isLocked;
          return (
            <button
              key={m.id}
              onClick={() => !isBlocked && onSelectModule && onSelectModule(m.id)}
              style={{
                display: 'flex', alignItems: 'baseline', gap: '0.35rem',
                width: '100%', textAlign: 'left',
                padding: '0.28rem 0.4rem', borderRadius: '5px', border: 'none',
                background: isCurrent ? 'var(--accent-bg)' : 'transparent',
                color: isCurrent ? 'var(--accent)' : (isStub || isLocked) ? 'var(--text-muted)' : isDone ? 'var(--teal)' : 'var(--text)',
                fontSize: '0.75rem', lineHeight: 1.4,
                cursor: isBlocked ? 'default' : 'pointer',
                opacity: isStub ? 0.4 : isLocked ? 0.55 : 1,
                marginBottom: '0.1rem',
                fontWeight: isCurrent ? 700 : 400,
              }}
              title={isStub ? 'Coming soon' : isLocked ? 'Unlock to access' : m.title}
            >
              <span style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontSize: '0.68rem', color: isCurrent ? 'var(--accent)' : 'var(--text-muted)', minWidth: '1.4rem' }}>{m.index}.</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isStub ? '' : isLocked ? '🔒 ' : isDone && !isCurrent ? '✓ ' : ''}{m.title}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main content column ── */}
      <div style={{ flex: 1, minWidth: 0, order: 1 }}>
      {/* Nav bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.2rem 0',
        }}>
          ← All modules
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Module {module.index} of {expFoundationModules.length}
          </span>
          {completed && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
              background: 'var(--accent-bg)', color: 'var(--accent)',
              border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)',
            }}>
              ✓ Complete
            </span>
          )}
        </div>
      </div>

      {/* Module header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
            color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.45rem',
          }}>
            Experimentation Foundations
          </span>
        </div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>
          {module.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>{module.subtitle}</p>
      </div>

      {/* Module content */}
      <HowTo skill={module.subtitle} steps={['Read the situation — understand the real-world context this concept solves', 'Interact with the demo — adjust sliders, make selections, observe what changes', 'Answer the question — test your understanding before moving on']} color="var(--accent)" />
      {ModuleComponent && <ModuleComponent onComplete={handleComplete} />}

      {/* Post-completion: connection + next */}
      {completed && (
        <div className="pal-reveal-in" style={{ marginTop: '1.75rem' }}>
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

          <div style={{
            background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem',
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>
              Key insight
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6 }}>
              {module.keyInsight}
            </div>
          </div>

          <button onClick={onNext} className="pal-glow-pulse" style={{
            padding: '0.65rem 1.6rem', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700,
            fontSize: '0.9rem', cursor: 'pointer',
          }}>
            {module.index < expFoundationModules.length ? 'Next module →' : 'Back to all modules'}
          </button>

          {/* Notes */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              My Notes
            </div>
            <textarea
              value={note}
              onChange={e => { setNote(e.target.value); saveNote('exp-foundations', moduleId, e.target.value); }}
              placeholder="Add your own notes, reminders, or follow-up questions..."
              rows={4}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '0.65rem 0.85rem',
                color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.55,
                resize: 'vertical', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
      )}
      </div>{/* end main content column */}
    </div>
  );
}
