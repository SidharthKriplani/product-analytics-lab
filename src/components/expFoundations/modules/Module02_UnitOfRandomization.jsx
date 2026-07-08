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

export function Module_EF02({ onComplete }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          When you run an A/B test, something gets randomly assigned to treatment or control. That something — the entity receiving the assignment — is the randomization unit. Choosing it is one of the first and most consequential decisions in experiment design. Get it wrong and you get corrupted data, user experience inconsistencies, and statistical estimates that are systematically wrong in ways that aren't obvious until you look carefully.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The instinct is to randomize at the session level. More sessions than users, so more data points. More data means more power. But a user who visits on Monday in the treatment variant comes back on Wednesday in control. They see a completely different checkout flow. They're confused. They abandon. And statistically, those two sessions from the same user are not independent — the user's underlying intent makes them correlated. Treating correlated observations as independent inflates your effective sample size, deflates your variance estimate, and makes you think you have more power than you do. You end up shipping a "winner" that was never real.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The forced conclusion: the randomization unit must match the unit of analysis. If you're measuring user-level outcomes — conversion, retention, revenue per user — you must randomize at the user level. Users get a single stable assignment, see one variant consistently, and their outcomes are genuinely independent of each other.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          But user-level randomization isn't always the right answer. For a page load speed optimization, each request is genuinely independent — no user-state dependency, no consistency requirement. Page/request-level randomization is valid here. For a referral program, a user in control can receive an invite from a user in treatment — the treatment is leaking across user boundaries. You need cluster randomization: assign groups of users who interact socially to the same arm, preventing contamination at the cost of statistical power.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          For each of the following experiment types, what is the right randomization unit, and what goes wrong if you use the wrong one? Think through the independence and consistency requirements before classifying.
        </p>
      </div>

      {/* ── Try It ── */}
      <div>
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
                        padding: '0.55rem 0.9rem', minHeight: '40px', fontSize: '0.78rem', fontWeight: 600,
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
                    {isCorrect ? <Icon name="check" size={13} color="var(--green)" /> : <Icon name="x" size={13} color="var(--red)" />} {s.explanation}
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
              padding: '0.65rem 1.2rem', minHeight: '40px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
            }}>
              Check answers
            </button>
          </>
        )}

        {revealed && (
          <div style={{
            marginTop: '0.75rem', padding: '0.65rem 0.85rem',
            background: correctCount === scenarios02.length ? 'var(--teal-bg)' : 'var(--yellow-bg)',
            border: '1px solid ' + (correctCount === scenarios02.length ? 'var(--teal-border)' : 'var(--yellow-border)'),
            color: correctCount === scenarios02.length ? 'var(--teal)' : 'var(--yellow)',
            fontWeight: 700, fontSize: '0.88rem', borderRadius: 'var(--radius-sm)',
          }}>
            {correctCount}/{scenarios02.length} correct
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {revealed && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Consistency and independence are the two criteria. Any experiment where a user's experience must be consistent across visits requires user-level randomization. Any experiment where treatment can leak between users — through social ties, referrals, or marketplace supply/demand — requires cluster-level. Session/page-level is the right default only when each request is genuinely stateless and independent.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {revealed && (
        <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Before any experiment design review, write down: what is the randomization unit, and what is the unit of analysis? If they don't match, stop. The mismatch is the bug, and no amount of statistical sophistication downstream fixes it.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Session-level randomization for user-level outcomes is one of the most common experiment design mistakes in practice. When reviewing an existing experiment that shows an unexpectedly large effect, check whether the assignment unit matches the analysis unit. Inflated false positives from correlated observations are a real source of phantom winners.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Whenever you see a social, referral, or marketplace experiment, ask about spillover before anything else. Standard A/B tests assume one user's outcome is unaffected by another user's assignment. If that assumption is false, your estimates are biased in unpredictable directions. Cluster randomization is the structural fix.</p>
          </div>
        </div>
      )}

      {revealed && (
        <NextBtn onClick={onComplete} label="Complete module →" />
      )}
    </div>
  );
}
