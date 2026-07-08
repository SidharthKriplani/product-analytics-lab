import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

var SCENARIOS_RF15 = [
  {
    id: 0,
    context: 'DAU is down 18% WoW. Dominant lever identified: retained users (-17%). A product deploy shipped 36 hours ago. Push notification opt-in rate was stable. No marketing changes this week.',
    hypotheses: [
      {
        id: 'h1',
        label: 'Product regression in the 36-hour deploy broke session initialization for returning users',
        eImpact: 'high', eLikelihood: 'high', eEase: 'high',
        rank: 1,
        rationale: 'Temporal correlation + verifiable in minutes via crash and error rate logs. Deploys are the first thing to rule in or out — they are the cheapest hypothesis to validate when timing aligns.',
      },
      {
        id: 'h2',
        label: 'Push notification delivery failure reduced re-engagement for lapsed returning users',
        eImpact: 'medium', eLikelihood: 'medium', eEase: 'high',
        rank: 2,
        rationale: 'Delivery metrics are fast to check but impact is bounded — notifications affect a subset of retained users, not all of them.',
      },
      {
        id: 'h3',
        label: 'Content feed ranking algorithm degraded — users finding less relevant content on return visits',
        eImpact: 'high', eLikelihood: 'low', eEase: 'low',
        rank: 3,
        rationale: 'High impact if true, but no algorithm change is logged and validation requires cohort analysis (hours, not minutes). Investigate after faster hypotheses are ruled out.',
      },
      {
        id: 'h4',
        label: 'A competitor launched a major feature drawing retained users away',
        eImpact: 'medium', eLikelihood: 'low', eEase: 'low',
        rank: 4,
        rationale: 'Competitive migration is gradual — an 18% WoW drop is too fast for organic churn to a competitor. Low likelihood and slow to validate.',
      },
    ],
    keyInsight: 'The deploy hypothesis scores highest on all three dimensions simultaneously. When Impact, Likelihood, and Ease are all high, investigate immediately — do not even start the next hypothesis before checking deploy error rates.',
  },
  {
    id: 1,
    context: 'Revenue down 15% WoW. Dominant lever: AOV dropped 14%. No pricing changes logged. Weekend timing. Product category mix appears roughly stable at first glance.',
    hypotheses: [
      {
        id: 'h1',
        label: 'A coupon aggregator site published a leaked promo code, applying unexpected discounts at checkout',
        eImpact: 'high', eLikelihood: 'high', eEase: 'high',
        rank: 1,
        rationale: 'Discount usage data is queryable in minutes. Leaked promo codes produce an exact AOV signature: order volume stable, per-order value drops by the discount amount. Check discount_code field on orders immediately.',
      },
      {
        id: 'h2',
        label: 'Product mix within the dominant category shifted toward lower-priced SKUs this weekend',
        eImpact: 'high', eLikelihood: 'medium', eEase: 'medium',
        rank: 2,
        rationale: 'Mix shift can fully explain an AOV drop without any pricing change. Requires a category x revenue breakdown — takes 15-30 minutes.',
      },
      {
        id: 'h3',
        label: 'Dynamic pricing algorithm under-priced high-AOV items in a specific subcategory due to a bug',
        eImpact: 'high', eLikelihood: 'medium', eEase: 'low',
        rank: 3,
        rationale: 'High impact if true but requires a pricing audit across subcategories. Do not start here — rule out the faster hypotheses first.',
      },
      {
        id: 'h4',
        label: 'New user acquisition this week skewed toward lower-intent buyers who placed smaller first orders',
        eImpact: 'medium', eLikelihood: 'low', eEase: 'low',
        rank: 4,
        rationale: 'This hypothesis is almost prunable — the dominant lever is AOV, not acquisition volume. Acquisition mix would cause lower CVR, not lower AOV. Investigate last.',
      },
    ],
    keyInsight: 'The leaked promo code hypothesis is high on all three dimensions AND has a single queryable data point that confirms or eliminates it immediately. Prioritize hypotheses where a single query rules them in or out.',
  },
  {
    id: 2,
    context: 'Checkout CVR down 10% WoW. Dominant lever: checkout-to-purchase rate (-9.5%). Payment gateway monitoring shows error rate at 11% vs. normal 1.5%. New checkout UI shipped 48 hours ago.',
    hypotheses: [
      {
        id: 'h1',
        label: 'Payment gateway error rate spike is failing transactions at the final payment step',
        eImpact: 'high', eLikelihood: 'high', eEase: 'high',
        rank: 1,
        rationale: 'The payment gateway already shows 11% errors — this is not a hypothesis, it is a confirmed signal. Investigate root cause of the gateway errors immediately.',
      },
      {
        id: 'h2',
        label: 'New checkout UI introduced a form bug or UX friction specifically at the payment input step',
        eImpact: 'high', eLikelihood: 'high', eEase: 'high',
        rank: 2,
        rationale: 'The UI deploy is temporally correlated and could compound or cause the payment errors. Check the UI diff for payment form changes — 10 minutes.',
      },
      {
        id: 'h3',
        label: 'New mandatory email verification before purchase is causing abandonment at checkout',
        eImpact: 'medium', eLikelihood: 'medium', eEase: 'medium',
        rank: 3,
        rationale: 'A friction-adding change at checkout is plausible but impact is bounded and takes longer to diagnose via funnel analysis.',
      },
      {
        id: 'h4',
        label: 'Removal of comparison pricing from the checkout page reduced purchase confidence',
        eImpact: 'medium', eLikelihood: 'low', eEase: 'low',
        rank: 4,
        rationale: 'Behavioral/psychological effect. Plausible as a long-term driver but does not explain a sudden 10% WoW drop. Low likelihood and slow to validate.',
      },
    ],
    keyInsight: 'When monitoring data already shows a signal for one hypothesis (gateway error rate), investigate that one first — it is not really a hypothesis anymore. External confirming signals collapse the uncertainty and make ranking obvious.',
  },
];

var RANK_LABELS = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' };
var SCORE_MAP = { high: 3, medium: 2, low: 1 };

function RF15RankBadge(props) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '2.5rem', height: '2.5rem', minWidth: 40, minHeight: 40, borderRadius: '50%',
      background: props.active ? 'var(--teal)' : 'var(--surface-2)',
      border: '1.5px solid ' + (props.active ? 'var(--teal)' : 'var(--border)'),
      color: props.active ? '#fff' : 'var(--text-muted)',
      fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
      transition: 'all 0.1s',
    }} onClick={props.onClick}>{props.n}</span>
  );
}

export function Module_RF15({ onComplete }) {
  var _saved15 = useMemo(function() { return loadRFState('rf15'); }, []);
  var [scenarioIdx, setScenarioIdx] = useState(function() { return _saved15 && _saved15.scenarioIdx != null ? _saved15.scenarioIdx : 0; });
  var [userRanks, setUserRanks] = useState(function() { return _saved15 ? (_saved15.userRanks || {}) : {}; });
  var [revealed, setRevealed] = useState(function() { return _saved15 ? !!_saved15.revealed : false; });
  var [allDone, setAllDone] = useState(function() { return _saved15 ? !!_saved15.allDone : false; });

  useEffect(function() {
    saveRFState('rf15', { scenarioIdx: scenarioIdx, userRanks: userRanks, revealed: revealed, allDone: allDone });
  }, [scenarioIdx, userRanks, revealed, allDone]);

  var scenario = SCENARIOS_RF15[scenarioIdx];
  var hyps = scenario.hypotheses;

  function assignRank(hypId, rank) {
    if (revealed) return;
    setUserRanks(function(prev) {
      var next = Object.assign({}, prev);
      // Remove this rank from any other hypothesis
      Object.keys(next).forEach(function(k) { if (next[k] === rank) delete next[k]; });
      // Toggle off if same
      if (prev[hypId] === rank) { delete next[hypId]; } else { next[hypId] = rank; }
      return next;
    });
  }

  var allRanked = hyps.every(function(h) { return userRanks[h.id] != null; });
  var correctRankCount = hyps.filter(function(h) { return userRanks[h.id] === h.rank; }).length;

  function advanceScenario() {
    if (scenarioIdx < SCENARIOS_RF15.length - 1) {
      setScenarioIdx(scenarioIdx + 1);
      setUserRanks({});
      setRevealed(false);
    } else {
      setAllDone(true);
    }
  }

  function dimColor(lvl) {
    if (lvl === 'high') return 'var(--teal)';
    if (lvl === 'medium') return 'var(--yellow)';
    return 'var(--text-muted)';
  }

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  if (allDone) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.65rem' }}>
            The ranking rubric
          </div>
          {[
            { dim: 'Impact', desc: 'How much of the metric drop would this hypothesis explain if true? High = could fully explain it. Low = explains a small fraction.' },
            { dim: 'Likelihood', desc: 'How probable is this cause given the symptoms, timing, and known facts? High = strong corroborating signals. Low = plausible but no supporting evidence.' },
            { dim: 'Ease', desc: 'How quickly can you rule this in or out? High = single query or log check, minutes. Low = cohort analysis, survey, or days of data collection.' },
          ].map(function(row) {
            return (
              <div key={row.dim} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--teal)', minWidth: '5.5rem', flexShrink: 0 }}>{row.dim}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{row.desc}</span>
              </div>
            );
          })}
          <div style={{ marginTop: '0.6rem', padding: '0.45rem 0.7rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            Tie-breaking rule: when two hypotheses score equally, investigate the one with higher Ease first. Cheap validation is always worth doing before expensive validation.
          </div>
        </div>

        {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>C should be first — three minutes and if confirmed it explains the most, regardless of low prior likelihood. Once you have three minutes to spare, the expected value of checking is high: small time cost, potentially large information gain. B is second — five minutes, eliminates a medium candidate. A is last — highest likelihood, but the two-hour cost means you want to rule out the fast options first. If C and B are both ruled out in eight minutes, you start the two-hour A analysis with confidence it&apos;s the remaining candidate rather than a guess. The sequence minimizes the expected time to finding the answer, not the expected number of investigations.</p>
        </div>

        {/* === THE ANALYST MOVE === */}
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Before starting the investigation, spend five minutes writing all plausible hypotheses and scoring each on Impact, Likelihood, and Ease. This is not a bureaucratic exercise — it prevents the team from splitting across hypotheses in an order driven by who spoke up first. The ranking is the coordination mechanism.</p>
            <p style={prose}><strong>Two.</strong> Ease is systematically underweighted in investigations because low-ease hypotheses often belong to high-status team members who champion them. The payment processor hypothesis (owned by infrastructure, easy to check) may get de-prioritized in favor of the product regression hypothesis (owned by the PM, harder to check) because the PM is louder. The ranking criterion makes this visible: if the easy hypothesis hasn&apos;t been checked yet, it should be checked before the hard one, regardless of who owns it.</p>
            <p style={prose}><strong>Three.</strong> After each hypothesis is confirmed or ruled out, update the ranking. New evidence from ruling out hypothesis A changes the likelihood estimate for hypotheses B and C. The ranking is not static — it&apos;s a living prioritization that updates as the investigation generates information. A hypothesis that was low-likelihood at the start may become the highest-likelihood candidate after two others are eliminated.</p>
          </div>
        </div>

        <NextBtn onClick={onComplete} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>You&apos;ve decomposed the metric, identified the dominant lever, and pruned the irrelevant branches. What remains is a set of competing hypotheses — plausible explanations for why the dominant lever moved. For a checkout conversion drop, the candidates might be: a UI bug breaking the CTA on mobile, a payment processor degradation, a price increase reducing willingness to complete, a tracking failure making the drop look larger than it is, or an iOS-specific rendering issue. All five are plausible. You can only investigate one at a time effectively.</p>
        <p style={prose}>The naive approach is to start with the hypothesis that feels most likely based on experience or instinct. Instinct is not useless — but it produces an investigation sequence that reflects past incidents, not the evidence available now. Investigations governed by instinct tend to become advocacy: you pursue the hypothesis you believe in, find evidence consistent with it, and close the investigation. The alternative that would have explained the drop better never gets checked.</p>
        <p style={prose}>The criterion is three-dimensional: Impact times Likelihood times Ease. Impact is how much of the observed drop this hypothesis would explain if confirmed. Likelihood is how well the hypothesis fits the existing diagnostic signals — not gut feel, but how much the time signature, segments affected, and recent changes support it. Ease is how quickly and cheaply this hypothesis can be confirmed or eliminated. The correct first hypothesis is not the most likely one. It&apos;s the one with the highest combined score on all three dimensions.</p>
        <p style={prose}>The ranking also has a strategic logic: you want the investigation to converge on the answer as quickly as possible regardless of which hypothesis turns out to be true. High-ease candidates cover the scenario where a simple cause is masking a complex situation. High-impact candidates cover the scenario where you need to confirm the dominant cause early. The combination gives you the fastest path to a confirmed cause in expectation.</p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>You have three hypotheses. Hypothesis A: high impact, high likelihood, but requires a two-hour analysis. Hypothesis B: medium impact, medium likelihood, confirmable in five minutes. Hypothesis C: very high impact, low likelihood, confirmable in three minutes. What is the correct investigation sequence?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
        After pruning the fault tree, you still have competing hypotheses. Rank them by investigation priority using Impact (how much of the drop does this explain?), Likelihood (how probable given the symptoms?), and Ease (how fast can you validate it?).
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>Scenario {scenarioIdx + 1} of {SCENARIOS_RF15.length}:</strong> {scenario.context}
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Assign investigation order — click the rank buttons next to each hypothesis
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {hyps.map(function(h) {
          var userRank = userRanks[h.id];
          var expertScore = SCORE_MAP[h.eImpact] * SCORE_MAP[h.eLikelihood] * SCORE_MAP[h.eEase];
          var isTopExpert = h.rank === 1;
          var revealBg = revealed ? (h.rank <= 2 ? 'var(--teal-bg)' : 'var(--surface)') : 'var(--surface)';
          var revealBorder = revealed ? (h.rank <= 2 ? 'var(--teal-border)' : 'var(--border)') : (userRank ? 'var(--accent-border)' : 'var(--border)');
          return (
            <div key={h.id} style={{
              padding: '0.65rem 0.8rem', background: revealBg,
              border: '1.5px solid ' + revealBorder,
              borderRadius: 'var(--radius-sm)', transition: 'all 0.15s',
            }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', width: '5.4rem', flexShrink: 0, paddingTop: '0.1rem' }}>
                  {[1,2,3,4].map(function(n) {
                    return <RF15RankBadge key={n} n={n} active={userRank === n} onClick={function() { assignRank(h.id, n); }} />;
                  })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.5 }}>{h.label}</div>
                  {userRank && !revealed && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent)', marginTop: '0.2rem', fontWeight: 600 }}>
                      Assigned: {RANK_LABELS[userRank]}
                    </div>
                  )}
                  {revealed && (
                    <div style={{ marginTop: '0.4rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                        {[
                          { label: 'Impact', val: h.eImpact },
                          { label: 'Likelihood', val: h.eLikelihood },
                          { label: 'Ease', val: h.eEase },
                        ].map(function(d) {
                          return (
                            <span key={d.label} style={{ fontSize: '0.71rem', padding: '0.1rem 0.45rem', borderRadius: '20px', background: 'var(--surface-2)', color: dimColor(d.val), fontWeight: 600, border: '1px solid var(--border)' }}>
                              {d.label}: {d.val}
                            </span>
                          );
                        })}
                        <span style={{ fontSize: '0.71rem', padding: '0.1rem 0.45rem', borderRadius: '20px', background: 'var(--teal-bg)', color: 'var(--teal)', fontWeight: 700, border: '1px solid var(--teal-border)' }}>
                          Investigate {RANK_LABELS[h.rank]}
                        </span>
                        {userRanks[h.id] === h.rank ? (
                          <span style={{ fontSize: '0.71rem', padding: '0.1rem 0.45rem', borderRadius: '20px', background: 'var(--teal-bg)', color: 'var(--teal)', fontWeight: 700, border: '1px solid var(--teal-border)' }}>
                            <Icon name='check' size={11} color='currentColor' /> Your rank matched
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.71rem', padding: '0.1rem 0.45rem', borderRadius: '20px', background: 'var(--yellow-bg)', color: 'var(--yellow)', fontWeight: 700, border: '1px solid var(--yellow-border)' }}>
                            You ranked {RANK_LABELS[userRanks[h.id]]} — off
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
                        {h.rationale}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!revealed && allRanked && (
        <button onClick={function() { setRevealed(true); }} style={{ padding: '0.45rem 1rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
          Reveal expert ranking
        </button>
      )}

      {revealed && (
        <div style={sectionGap}>
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
            background: correctRankCount === hyps.length ? 'var(--teal-bg)' : 'var(--yellow-bg)',
            border: '1px solid ' + (correctRankCount === hyps.length ? 'var(--teal-border)' : 'var(--yellow-border)'),
            color: correctRankCount === hyps.length ? 'var(--teal)' : 'var(--yellow)',
            fontWeight: 700, fontSize: '0.88rem',
          }}>
            {correctRankCount}/{hyps.length} correct{correctRankCount < hyps.length ? ' — review the ranks that did not match the expert order' : ' — perfect ranking'}
          </div>
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', fontSize: '0.82rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            <strong>Key insight:</strong> {scenario.keyInsight}
          </div>
          <button onClick={advanceScenario} style={{ padding: '0.45rem 1.1rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}>
            {scenarioIdx < SCENARIOS_RF15.length - 1 ? 'Next scenario →' : 'See summary →'}
          </button>
        </div>
      )}
    </div>
  );
}
