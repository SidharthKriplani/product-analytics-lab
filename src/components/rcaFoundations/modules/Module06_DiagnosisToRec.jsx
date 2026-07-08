import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const BLUF_FIELDS_RF06 = [
  {
    field: 'Primary cause is',
    options: [
      { label: 'iOS users are less engaged following our recent product changes — investigate all November release changes and deploys', correct: false },
      { label: 'The Nov 3rd push prompt change — opt-in dropped 27pp (61%→34%), confirmed by segment analysis showing lower D7 retention', correct: true },
      { label: 'An unidentified iOS release change caused a 6pp D7 retention drop across all users, but the root cause has not yet been fully isolated', correct: false },
    ],
    explanation: 'A BLUF cause statement names the specific mechanism, not just the symptom. The correct answer identifies the exact change, the exact metric impact on opt-in rate, and the confirmation method. "Something changed" is a symptom description, not a root cause.',
  },
  {
    field: 'Confidence level',
    options: [
      { label: 'Low — more investigation is needed across multiple data sources before firm conclusions can be drawn', correct: false },
      { label: 'High — segment analysis confirms the retention gap correlates with opt-in status and matches the Nov 3rd deploy', correct: true },
      { label: 'Medium — the correlation is clear but causation requires a prospective A/B test to confirm it fully across the board', correct: false },
    ],
    explanation: 'When direct segment evidence aligns with timing evidence, confidence is high. "Medium" is for circumstantial evidence. A/B testing is for measuring effects prospectively — not for confirming a past root cause that already has segment-level confirmation.',
  },
  {
    field: 'Business impact',
    options: [
      { label: 'Significant — a large number of users are experiencing meaningfully degraded retention across this cycle', correct: false },
      { label: 'Approximately 2.1M iOS users affected; non-opted-in users show 22pp lower D7 retention (10% vs 32%)', correct: true },
      { label: 'D7 retention dropped 6pp overall — from 38% down to 32%, across the entire iOS user base', correct: false },
    ],
    explanation: 'Business impact must be quantified. "Significant" is not a number. Option C gives the aggregate drop but not the causal segment breakdown. The correct answer gives both the affected population size and the mechanism — the two pieces a decision-maker needs.',
  },
  {
    field: 'Recommended action',
    options: [
      { label: 'Run a follow-up A/B test comparing the old and new prompt copy to quantify the exact retention impact before deciding whether to revert', correct: false },
      { label: 'Revert notification prompt to control copy by Nov 7th (iOS team owner); design a softer permission request flow for Q1 A/B test', correct: true },
      { label: 'Send a re-engagement push campaign to users who opted out, then monitor whether D7 retention recovers within 2 weeks', correct: false },
    ],
    explanation: 'A recommendation must be specific (what), time-bound (by when), and owned (by whom). Running a follow-up A/B test delays the fix when the cause is already confirmed — testing is for uncertain hypotheses, not confirmed regressions. Sending push campaigns to opted-out users addresses the symptom, not the cause (the prompt copy that drove opt-outs in the first place).',
  },
  {
    field: 'Open risk',
    options: [
      { label: 'Reverting the prompt may not fully recover opt-in rates if users who already declined cannot be re-prompted without an app update', correct: false },
      { label: 'If the same prompt ships to Android in the upcoming release, the same opt-in drop may occur before the fix is validated', correct: true },
      { label: 'The segment analysis may be confounded by a concurrent iOS update — users who updated iOS and saw the new prompt are not comparable to those who did not', correct: false },
    ],
    explanation: 'An open risk is something that could worsen the situation going forward. The revert recovery concern is real but it is a known limitation of the fix, not an open risk — it is already factored into the recommendation. The iOS update confound question is about the validity of past analysis, not a forward-looking risk. The Android risk is the only one that identifies a concrete future threat requiring immediate preventive action.',
  },
];

export function Module_RF06({ onComplete }) {
  const STEPS = [
    { id: 'what',    label: '1. What dropped',        example: 'D7 retention dropped 6pp (38% → 32%) in the week of Nov 4th, affecting iOS users only.' },
    { id: 'why',     label: '2. Root cause + evidence', example: 'The Nov 3rd iOS push notification permission prompt change reduced opt-in rate from 61% to 34%. Users who disabled notifications have 22pp lower D7 retention (confirmed in segment analysis).' },
    { id: 'fix',     label: '3. Proposed fix + owner', example: 'Revert the prompt copy to the control version (ETA: 2 days, owner: iOS team). Test a softer permission request flow in Q1.' },
    { id: 'measure', label: '4. How we measure success', example: 'Push opt-in rate back to >55% within 2 weeks. D7 retention recovery to >36% within 30 days for the affected cohort.' },
    { id: 'monitor', label: '5. Ongoing monitoring',   example: 'Weekly alert if push opt-in rate drops >5pp from baseline. Add to the iOS release checklist: verify notification opt-in rate 48h post-release.' },
  ];

  const _saved06 = useMemo(function() { return loadRFState('rf06'); }, []);
  const [current, setCurrent] = useState(function() { return _saved06 && _saved06.current != null ? _saved06.current : 0; });
  const [seen, setSeen] = useState(function() { return new Set(_saved06 && _saved06.seen ? _saved06.seen : []); });
  const [blufAnswers, setBlufAnswers] = useState(function() { return _saved06 && _saved06.blufAnswers ? _saved06.blufAnswers : {}; });
  const [blufRevealed, setBlufRevealed] = useState(function() { return _saved06 && _saved06.blufRevealed ? _saved06.blufRevealed : {}; });

  useEffect(function() { saveRFState('rf06', { current: current, seen: Array.from(seen), blufAnswers: blufAnswers, blufRevealed: blufRevealed }); }, [current, seen, blufAnswers, blufRevealed]);

  function advance() {
    setSeen(prev => new Set([...prev, current]));
    if (current < STEPS.length - 1) {
      setCurrent(current + 1);
    }
  }

  const allSeen = seen.size >= STEPS.length - 1;

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>
          You&apos;ve been in the investigation for three hours. You found it: a botched deploy broke deep link handling for Android users, causing them to land on the home screen instead of the checkout page. That&apos;s a 28% drop in Android checkout completion, which explains 80% of the aggregate checkout metric decline. Root cause confirmed, evidence clear.
        </p>
        <p style={prose}>
          You post to the channel: &quot;found it — Android deep link bug from Friday&apos;s deploy.&quot; Half the room goes quiet. The PM says &quot;okay, and?&quot; The engineering lead asks &quot;so what do we do?&quot; Someone from the growth team asks &quot;how do we know it won&apos;t happen again?&quot; You realize that finding the cause was only the halfway point.
        </p>
        <p style={prose}>
          The investigation is not complete until the finding is actionable. And actionable has a specific meaning: there must be a proposed fix, an owner, a way to measure whether the fix worked, and a plan to catch recurrence. Without these, the post-mortem is a description of what happened, not a resolution of why it happened and how to prevent it from happening again.
        </p>
        <p style={prose}>
          A complete RCA answers five questions in this order: what dropped and by how much; the confirmed cause with evidence; the proposed fix and owner; the validation metric and success threshold; and the monitoring and prevention plan. Missing the fourth and fifth questions means the incident will recur. Missing the third means the right work doesn&apos;t get done.
        </p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>You&apos;ve confirmed the root cause of a checkout drop. The cause is a third-party payment gateway degradation — outside your control. What changes in your five-part output, and what stays the same?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* === INTERACTIVE JSX === */}
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          Finding the root cause is only half the job. A complete RCA output includes a precise description of what happened, the evidence-backed cause, a concrete fix with an owner, a pre-committed success metric, and an ongoing monitoring plan. Most analysts stop at step two — this module walks you through all five.
        </p>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
          A complete RCA has 5 components. Walk through each one — many analysts stop at diagnosis and skip the recommendation structure.
        </p>

        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Read the example for the active step and think about how you would write this section for a real investigation — then click Next component to advance through all five steps.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {STEPS.map((step, i) => {
            const isActive = i === current;
            const isDone = seen.has(i);
            return (
              <div key={step.id} style={{
                border: '1.5px solid ' + (isActive ? 'var(--teal-border)' : isDone ? 'var(--border)' : 'var(--border)'),
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--teal-bg)' : isDone ? 'var(--surface-2)' : 'var(--surface)',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '0.7rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: isDone ? 'var(--teal)' : isActive ? 'var(--teal-bg)' : 'var(--surface-2)',
                    border: '2px solid ' + (isDone ? 'var(--teal)' : isActive ? 'var(--teal-border)' : 'var(--border)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 800,
                    color: isDone ? '#fff' : isActive ? 'var(--teal)' : 'var(--text-muted)',
                  }}>
                    {isDone ? <Icon name='check' size={13} color='currentColor' /> : i + 1}
                  </div>
                  <span style={{
                    fontWeight: isActive ? 700 : 600, fontSize: '0.88rem',
                    color: isActive ? 'var(--teal)' : isDone ? 'var(--text-muted)' : 'var(--text)',
                  }}>
                    {step.label}
                  </span>
                </div>
                {isActive && (
                  <div style={{ padding: '0 1rem 1rem' }}>
                    <div style={{
                      fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem',
                      marginBottom: '0.75rem', fontStyle: 'italic',
                    }}>
                      Example: {step.example}
                    </div>
                    <button onClick={advance} style={{
                      padding: '0.45rem 1rem',
                      background: 'var(--teal)', color: '#fff', border: 'none',
                      borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                    }}>
                      {i < STEPS.length - 1 ? 'Next component →' : 'Done'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {allSeen && (
          <div>
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                BLUF Practice — Write the conclusion
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.6rem' }}>
                BLUF (Bottom Line Up Front) is how senior analysts close an RCA — a single structured paragraph that gives a decision-maker everything they need. Using the iOS scenario above, select the correct phrasing for each of the five fields.
              </p>
              <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '1rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
                <strong>What to do:</strong> Click the option that a senior analyst would write for each field — wrong options represent common framing mistakes.
              </div>

              {BLUF_FIELDS_RF06.map(function(field, fi) {
                var ans = blufAnswers[fi];
                var isRevealed = !!blufRevealed[fi];
                return (
                  <div key={fi} style={{ marginBottom: '1rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.55rem' }}>
                      {field.field}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {field.options.map(function(opt, oi) {
                        var isSelected = ans === oi;
                        var isCorrect = opt.correct;
                        var bg = 'var(--surface)';
                        var border = 'var(--border)';
                        var color = 'var(--text)';
                        if (isRevealed && isSelected && isCorrect) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
                        else if (isRevealed && isSelected && !isCorrect) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
                        else if (isRevealed && !isSelected && isCorrect) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
                        return (
                          <button
                            key={oi}
                            onClick={function() {
                              if (isRevealed) return;
                              setBlufAnswers(function(prev) { var n = Object.assign({}, prev); n[fi] = oi; return n; });
                              setBlufRevealed(function(prev) { var n = Object.assign({}, prev); n[fi] = true; return n; });
                            }}
                            style={{
                              textAlign: 'left', width: '100%', padding: '0.6rem 0.8rem',
                              background: bg, border: '1.5px solid ' + border,
                              borderRadius: 'var(--radius-sm)', color: color,
                              fontSize: '0.84rem', lineHeight: 1.5,
                              cursor: isRevealed ? 'default' : 'pointer',
                              transition: 'all 0.1s',
                              fontWeight: (isRevealed && isCorrect) ? 600 : 400,
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    {isRevealed && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55, marginTop: '0.65rem', fontStyle: 'italic' }}>
                        {field.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {Object.keys(blufAnswers).length >= BLUF_FIELDS_RF06.length && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>When the cause is external, the proposed fix changes (contact the gateway vendor, implement a fallback payment provider, communicate to affected users), but the structure stays identical. You still need a proposed action and owner, a validation metric, and a prevention plan — even if prevention means &quot;add a circuit breaker that routes traffic to the backup gateway when primary degrades.&quot; The five-part structure is not dependent on the cause being internal. It&apos;s the translation of any diagnosis into action.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {Object.keys(blufAnswers).length >= BLUF_FIELDS_RF06.length && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> When you present an RCA finding, have all five sections written before the meeting. Not assembled in the meeting — written. The meeting is for review and ownership assignment, not for determining what the fix should be. Coming in with a half-formed diagnosis and finishing the recommendation in real time signals that the investigation is incomplete.</p>
            <p style={prose}><strong>Two.</strong> The validation metric is not optional. If you can&apos;t describe in advance how you&apos;ll know the fix worked, you don&apos;t have a complete fix — you have a guess. &quot;We&apos;ll monitor and see&quot; is not a validation plan. A specific metric, a specific threshold, and a specific time window: those are the minimum requirements.</p>
            <p style={prose}><strong>Three.</strong> The prevention plan is where most RCAs fail. The natural endpoint of the investigation feels like the fix. But the same incident recurring in six weeks means the RCA was incomplete. Before you close the investigation, ask: if nothing changes except the immediate fix, how long before this can happen again? That question forces the prevention plan.</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {Object.keys(blufAnswers).length >= BLUF_FIELDS_RF06.length && <NextBtn onClick={onComplete} />}
    </div>
  );
}
