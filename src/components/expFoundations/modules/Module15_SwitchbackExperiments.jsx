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

export function Module_EF15({ onComplete }) {
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
      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          You work at a ride-sharing company. The product team wants to test a new surge pricing algorithm that balances driver earnings and rider wait times. You can't use a standard A/B test. In a given city at a given moment, all drivers compete for all riders. If you put half the drivers in treatment (new surge algorithm) and half in control (old algorithm), a rider who requests a trip gets matched to whichever driver is closest — treatment or control. A treatment driver who repositions aggressively captures a pickup that would have gone to a control driver. SUTVA is violated at the most fundamental level — the market is a shared system.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The naive fix — randomize by city — breaks on scale. A platform with a small number of cities doesn't have enough clusters for adequate power. Dense marketplaces with complex geographic demand patterns may have too much within-city heterogeneity for city-level randomization to isolate cleanly. And operational interventions sometimes need to be tested within a single market over time, not across markets simultaneously.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The structural solution: randomize over time instead of users. In the treatment time window, the new algorithm applies to all drivers and riders. In the control time window, the old algorithm applies. Treatment hour, control hour, treatment hour — alternating within the same market. This is a switchback experiment. By alternating over time within a single market, you eliminate within-market interference: at any given moment, the market is running entirely one algorithm or the other.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The cost is that adjacent time windows are correlated. Rush hour on a Tuesday looks like rush hour on a Wednesday. Driver supply and rider demand have temporal autocorrelation. If you ignore this and treat each time window as independent, your variance estimate is too small — you have less information than your sample size suggests, because consecutive windows carry redundant information. The variance estimate must model the autocorrelation explicitly, or your confidence intervals and p-values will systematically overstate significance.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginTop: '1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>In a switchback experiment with one-hour time windows, why are consecutive windows correlated, and why does ignoring that correlation lead to overconfident results (too-narrow confidence intervals)?</p>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: '1rem 0' }}>
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
          {/* What you should have confirmed */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Consecutive time windows share demand patterns — the 5pm rush in the treatment window is followed by a 6pm rush in the control window, and both are high-demand periods that look similar regardless of treatment. Each window does not contain fully independent information. The effective sample size after accounting for autocorrelation is smaller than the raw number of windows, producing wider confidence intervals. Ignoring autocorrelation treats each window as fully independent and produces artificially narrow intervals that overstate certainty.</p>
          </div>

          {/* Analyst Move */}
          <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> When designing a marketplace experiment — pricing, dispatch, routing, inventory allocation — start by asking whether treatment and control units will interact within the same market at the same time. If yes, a standard A/B test is invalid. The choice is then between geo experiments (if enough geographic markets exist) and switchback experiments (for single-market or dense multi-market contexts where time-based alternation is feasible).</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Switchback experiments require careful window design. Windows too short: carry-over effects from the previous window haven't dissipated. Windows too long: you have too few time blocks for adequate degrees of freedom. A common heuristic: window length should exceed the typical system recovery time — the time it takes for supply and demand to equilibrate after a regime change.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Always model autocorrelation when analyzing switchback results. Do not report naive standard errors or p-values from a model that treats time windows as independent observations. Use cluster-robust standard errors, time-series-aware bootstrap methods, or mixed models with autocorrelation structure. The point estimate is usually unaffected; the standard error almost always widens. Results that look significant under naive analysis should be re-examined before reporting.</p>
            </div>
          </div>

          <InsightBox>
            Switchback experiments are the canonical design for ride-sharing, food delivery, and logistics platforms where supply and demand interact at the market level. The key concepts interviewers probe: SUTVA violation in two-sided marketplaces, temporal autocorrelation modeling, and why neither user-level nor geo splits solve the problem.
          </InsightBox>
        </div>
      )}
    </div>
  );
}
