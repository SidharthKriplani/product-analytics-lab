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

export function Module_EF11({ onComplete }) {
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
      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          You run a standard 50/50 A/B test on a new social feed ranking algorithm. Treatment users see more relevant content. The analysis shows significantly higher engagement in treatment — the new algorithm looks like a clear win. You ship.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          One of your senior analysts raises a concern: treatment users are posting more, and their posts are showing up in control users' feeds. You look at the data again. Control group engagement increased during the experiment period too — not as much as treatment, but substantially more than in historical baseline periods. The treatment effect bled into the control group through the social graph.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          This is the core failure mode. Standard A/B tests rest on an assumption called SUTVA: the Stable Unit Treatment Value Assumption. It says one user's outcome depends only on their own treatment assignment, not on anyone else's. In a social network, this assumption is false. When a treatment user posts more, their friends in the control group see more content and engage more. The control group's behavior was contaminated by the treatment.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Running longer doesn't fix structural contamination. As long as treatment users and control users can interact — through social connections, through shared marketplace supply and demand, through referral links — the contamination continues. The bias is systematic, not random. It doesn't average out.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          When SUTVA is violated, your treatment effect estimate is biased in a direction that's hard to predict. If treatment users become more active and that activity benefits control users, you underestimate the true treatment effect (control looks better than it would have in isolation). If treatment users' activity competes with control users' — as in a marketplace where treatment sellers capture more buyers — you overestimate the treatment effect. The direction of bias depends on whether spillover is complementary or competitive.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The structural fix is cluster randomization: assign entire social communities, geographic regions, or network subgraphs to treatment or control, rather than individual users. Users within a cluster interact primarily with each other; between-cluster interaction is limited by design. This eliminates the mechanism of contamination — at the cost of statistical power.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginTop: '1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>In a social network experiment, if treatment users become more active and their activity benefits control users (via more content in control feeds), does the naive A/B test over- or underestimate the true treatment effect? Work through what happens to the control group's outcome in this scenario.</p>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: '1rem 0' }}>
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
        <>
          <div style={{
            marginTop: '0.75rem', padding: '0.65rem 0.85rem',
            background: correctCount === scenarios11.length ? 'var(--teal-bg)' : 'var(--yellow-bg)',
            border: '1px solid ' + (correctCount === scenarios11.length ? 'var(--teal-border)' : 'var(--yellow-border)'),
            color: correctCount === scenarios11.length ? 'var(--teal)' : 'var(--yellow)',
            fontWeight: 700, fontSize: '0.88rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem',
          }}>
            {correctCount} / {scenarios11.length} correct
          </div>

          {/* What you should have confirmed */}
          <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>When treatment activity benefits control users, the control group's outcome is elevated above what it would be in isolation. The measured treatment-control gap is smaller than the true treatment effect — the experiment underestimates the benefit. For marketplace competition (where treatment captures share from control), the opposite holds: the experiment overestimates. SUTVA violations bias estimates in both directions depending on the spillover mechanism.</p>
          </div>

          {/* Analyst Move */}
          <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Before finalizing any experiment design for a social, marketplace, or referral product, ask explicitly: can a user in treatment affect the experience or outcomes of a user in control? If yes, standard A/B testing will produce biased estimates. Document whether SUTVA is plausibly satisfied as part of the experiment design review.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Cluster randomization is the structural fix, but it requires planning. You need to define clusters in advance (social communities, geographic markets, household IDs), ensure inter-cluster interaction is limited, and pre-match clusters on key covariates before randomization. This can't be retrofitted to an experiment already running with user-level randomization.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> If cluster randomization is not feasible (too few clusters, too much between-cluster interaction), consider ego-network experiments (randomize the seed user, hold friends constant) or graph-cluster designs. These are specialized methods, but knowing they exist means you don't default to a broken design just because cluster randomization is hard to operationalize.</p>
            </div>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
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
          </div>
        </>
      )}
    </div>
  );
}
