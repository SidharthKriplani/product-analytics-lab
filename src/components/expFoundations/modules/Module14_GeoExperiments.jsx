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

export function Module_EF14({ onComplete }) {
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
    { label: 'A. Geo experiments require a fundamentally different statistical test that has inherently less power to begin with', correct: false },
    { label: 'B. There are far fewer geographic units (cities, DMAs) than users — fewer randomization units means lower statistical power.', correct: true },
    { label: 'C. Geographic units simply have much higher outcome variance than individual users do, regardless of sample size', correct: false },
    { label: 'D. Geo experiments cannot randomize at all — they are always run against a fixed set of pre-selected markets', correct: false },
  ];

  return (
    <div>
      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Your growth team wants to test whether a TV advertising campaign drives incremental app downloads. They've bought media in four cities. The first problem: you cannot randomly assign which users see a TV ad. A user watching the local news either sees the ad or doesn't, based on whether the ad was purchased for that channel in that city. You can't assign individual users to treatment and control the way you would for an in-app feature test.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The naive response: compare downloads in cities where the campaign ran to cities where it didn't, using historical data. But cities where you chose to run the campaign are not random. You ran it in cities where you expected the campaign to work — larger markets, higher brand awareness, better targeting opportunities. Those cities were different before the campaign started. Their higher downloads during the campaign period might reflect pre-existing differences, not the campaign's effect.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          What you need is a comparison group comparable to the treatment cities before the campaign, so that any post-campaign difference can be attributed to the campaign. And you need the assignment of cities to treatment to be random. This is a geo experiment: randomize cities (or DMAs, or countries) to treatment and control, measure the outcome metric in each, and compare. SUTVA is approximately satisfied because users in Chicago are mostly not affected by the advertising status of users in Denver.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The fundamental cost: you go from millions of user-level randomization units to perhaps 30–50 city-level units. Power drops dramatically. The fix is matched markets: before randomization, pair each potential treatment market with a comparable control market based on historical metric trajectories, size, and demographic composition. Then randomize within matched pairs. The difference-in-differences estimator — change in treatment markets minus change in control markets — removes any baseline differences that remain after matching.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginTop: '1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>If you have 30 cities and want to run a geo experiment, what is the maximum number of degrees of freedom available for your hypothesis test? Why does this create a power problem that doesn't exist in user-level experiments?</p>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: '1rem 0' }}>
        Geo experiments randomize at the geographic unit — city, DMA, or country — rather than the user.
        They solve the problem of network spillover and enable testing of channels where individual
        assignment is impossible, like TV advertising or marketplace pricing. The tradeoff is power:
        100 cities gives you far fewer randomization units than 1 million users.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Classify each scenario to the right experiment design level</div>

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

              {/* What you should have confirmed */}
              <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>With 30 markets and a 50/50 split, you have 28 degrees of freedom — regardless of how many users are in those markets. Power depends on the number of randomization units, not the number of users within them. This is why matching is so important: it reduces market-level variance and partially compensates for the low degree-of-freedom problem. Even with perfect matching, geo experiments are substantially underpowered relative to user-level experiments for the same total population.</p>
              </div>

              {/* Analyst Move */}
              <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> When asked to measure the impact of an offline channel (TV, radio, OOH, direct mail), the default answer is a geo experiment, not correlation analysis ("cities with higher ad spend had more downloads"). Correlation analysis conflates the ad spend with the prior reasons the team chose to spend more there. Randomization at the market level is the only way to get a causal estimate.</p>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Match markets on historical metric trajectories, not just current levels. Two cities with the same current download rate but different growth trajectories will diverge post-experiment even without any treatment. The last eight to twelve weeks of the outcome metric, measured at the market level, is the most important covariate for matching.</p>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Difference-in-differences is the correct estimator for geo experiments, not a simple post-experiment comparison. Subtract the control markets' change from the treatment markets' change to isolate the causal effect from any time trends (seasonal patterns, macroeconomic shifts) that affect all markets simultaneously.</p>
                </div>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <InsightBox>
                  Geo experiments solve the spillover problem that makes user-level testing invalid for marketplace pricing, TV advertising, and social graph interventions. The power limitation is real but manageable with matched-market design, synthetic control methods, and longer measurement windows.
                </InsightBox>
              </div>
              <NextBtn onClick={onComplete} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
