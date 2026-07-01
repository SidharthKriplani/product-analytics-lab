import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

var SCORECARD_METRICS = [
  {
    id: 'signups', label: 'Daily signups',
    correct: { measurable: true, movable: true, predictive: false, notGameable: false },
    explanations: {
      measurable: 'Event fires on account creation — clean, reliable signal.',
      movable: 'Marketing spend, landing page changes, and referral programs all move it within days.',
      predictive: 'A signup does not mean the user activated or received value. Many sign up and never return.',
      notGameable: 'Easily inflated by bot signups, incentivised campaigns, or lowering signup friction without improving activation.',
    },
  },
  {
    id: 'nps', label: 'NPS score (quarterly survey)',
    correct: { measurable: false, movable: false, predictive: true, notGameable: true },
    explanations: {
      measurable: 'Survey-based, low response rates, self-selection bias. The sample is not representative of your user base.',
      movable: 'Quarterly cadence means you cannot detect the effect of a product change within an experiment window.',
      predictive: 'NPS does correlate with retention and word-of-mouth growth at the cohort level.',
      notGameable: 'Hard to inflate without genuinely improving user sentiment (though cherry-picking survey timing can bias it).',
    },
  },
  {
    id: 'loadtime', label: 'P50 page load time',
    correct: { measurable: true, movable: true, predictive: true, notGameable: true },
    explanations: {
      measurable: 'Instrumented via RUM (real user monitoring) — precise, continuous, automated.',
      movable: 'Engineering changes (CDN, code splitting, image compression) move it within a deploy cycle.',
      predictive: 'Faster load times correlate with higher conversion and lower bounce across nearly every product category.',
      notGameable: 'You cannot reduce load time without actually making the page faster. The metric is tied to the physics of delivery.',
    },
  },
  {
    id: 'registered', label: 'Total registered users',
    correct: { measurable: true, movable: false, predictive: false, notGameable: true },
    explanations: {
      measurable: 'Simple database count — always accurate.',
      movable: 'Cumulative counter that only goes up. A product change this week adds a tiny increment to a large base — the metric barely moves.',
      predictive: 'A user who registered 3 years ago and never returned still counts. Total registered users says nothing about current value delivery.',
      notGameable: 'Hard to inflate without real signups (though it includes churned users, which is the predictiveness problem).',
    },
  },
  {
    id: 'retained', label: '7-day retained users (% who return day 7)',
    correct: { measurable: true, movable: true, predictive: true, notGameable: true },
    explanations: {
      measurable: 'Defined as users who triggered any qualifying event on day 7 after signup — clean, automatable.',
      movable: 'Onboarding improvements, notification tuning, and feature discovery all shift D7 retention within weeks.',
      predictive: 'Returning on day 7 is a strong signal that the user found value. D7 retention correlates with LTV across most consumer products.',
      notGameable: 'Hard to inflate without genuinely bringing users back — spammy notifications might boost it short-term but degrade downstream metrics.',
    },
  },
];

var SCORECARD_PROPERTIES = [
  { id: 'measurable', label: 'Measurable', desc: 'Observable reliably and automatically' },
  { id: 'movable', label: 'Movable', desc: 'A product change can shift it in days or weeks' },
  { id: 'predictive', label: 'Predictive', desc: 'Moving it means users get more value' },
  { id: 'notGameable', label: 'Not Gameable', desc: 'Cannot be inflated without real improvement' },
];

export function Module_MF02({ module, onNext }) {
  var saved02 = useMemo(function() { return loadMFState('mf02'); }, []);
  var [ratings, setRatings] = useState(function() {
    if (saved02 && saved02.ratings) return saved02.ratings;
    var init = {};
    SCORECARD_METRICS.forEach(function(m) {
      init[m.id] = { measurable: null, movable: null, predictive: null, notGameable: null };
    });
    return init;
  });
  var [checked, setChecked] = useState(function() { return saved02 ? saved02.checked : false; });
  var [selected, setSelected] = useState(function() { return saved02 ? saved02.selected : null; });
  var [answered, setAnswered] = useState(function() { return saved02 ? saved02.answered : false; });

  useEffect(function() {
    saveMFState('mf02', { ratings: ratings, checked: checked, selected: selected, answered: answered });
  }, [ratings, checked, selected, answered]);

  function handleToggle(metricId, propId) {
    if (checked) return;
    var updated = JSON.parse(JSON.stringify(ratings));
    var current = updated[metricId][propId];
    if (current === null) updated[metricId][propId] = true;
    else if (current === true) updated[metricId][propId] = false;
    else updated[metricId][propId] = null;
    setRatings(updated);
  }

  var allRated = SCORECARD_METRICS.every(function(m) {
    return SCORECARD_PROPERTIES.every(function(p) {
      return ratings[m.id][p.id] !== null;
    });
  });

  var scoreResult = null;
  if (checked) {
    var total = 0;
    var correct = 0;
    SCORECARD_METRICS.forEach(function(m) {
      SCORECARD_PROPERTIES.forEach(function(p) {
        total += 1;
        if (ratings[m.id][p.id] === m.correct[p.id]) correct += 1;
      });
    });
    scoreResult = { correct: correct, total: total };
  }

  var Q = {
    question: 'Your team proposes "daily signups" as the primary metric for a new referral feature. Which failure is the most dangerous?',
    options: [
      { id: 'a', text: 'It is not measurable — signup events are unreliable across platforms.' },
      { id: 'b', text: 'It is not movable — referral changes cannot shift signup volume.' },
      { id: 'c', text: 'It is not predictive — a signup does not mean the user activated or received value. You can drive thousands of signups that never convert to active users.' },
      { id: 'd', text: 'It is not sensitive — daily signup counts are too noisy for A/B tests.' },
    ],
    correct: 'c',
    explanation: 'Signups are measurable and movable (run a campaign, signups spike). But predictiveness is the fatal flaw: a signup is not a signal of value delivery. A referral program that drives low-quality signups will move the metric while delivering zero user value. The deeper insight: most bad metrics fail on predictiveness or gameability, not measurability.',
  };

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>A metric is a number that represents something you care about. The representation is always imperfect &mdash; the number is a proxy for a reality it can never fully capture. The question isn&apos;t whether your metric is a perfect representation. It never is. The question is whether it&apos;s a reliable enough representation to make decisions from.</p>
        <p style={prose}>Four properties determine that reliability. A metric must be measurable &mdash; you can calculate it accurately from available data. It must be movable &mdash; a product change can actually shift it. It must be predictive &mdash; moving it means something you care about is improving. And it must be resistant to gaming &mdash; a team can&apos;t inflate it without actually improving the underlying thing it represents.</p>
        <p style={prose}>A metric can pass three of the four tests and still be dangerous. Understanding each test, and why it&apos;s necessary, is what separates a metric you can act on from one that gives you false confidence.</p>
        <p style={prose}>The natural first instinct when choosing a metric is to pick something that sounds meaningful and can be tracked in the dashboard &mdash; &quot;profile completion rate,&quot; &quot;content pieces viewed,&quot; &quot;support tickets opened.&quot; These feel concrete, they&apos;re easy to measure, and they respond to product changes. That seems like enough. But here&apos;s where it breaks.</p>
        <p style={prose}>A team that optimizes profile completion rate learns they can inflate it by making more fields optional and pre-filling defaults. The rate goes up. Users have &quot;completed&quot; profiles with auto-generated content that doesn&apos;t reflect real intent. The metric moved &mdash; but the underlying goal didn&apos;t. By the time leadership notices the divergence, the team has spent a quarter improving a number that doesn&apos;t represent what they thought it represented.</p>
        <p style={prose}>Each of the four properties closes a different failure mode. Measurability rules out metrics you can&apos;t compute accurately. Movability rules out metrics that don&apos;t respond to the changes teams can make. Predictiveness rules out metrics that move without corresponding improvements in user value &mdash; pure vanity metrics pass measurability and movability but fail here. Gaming resistance rules out metrics that can be inflated through the wrong behaviors.</p>
        <p style={prose}>The four tests are filters in sequence. A metric that fails measurability is dropped immediately. A metric that fails movability belongs at a different layer of the hierarchy. A metric that fails predictiveness is a vanity metric &mdash; real, but not connected to anything that matters. A metric that fails gaming resistance will be optimized in a direction you don&apos;t want, once teams find the shortcut.</p>
        <p style={prose}>Let&apos;s take an example. A new onboarding team debates between &quot;tutorial completion rate&quot; and &quot;first action taken within 3 days.&quot; Tutorial completion: measurable (yes), movable (yes &mdash; shorten it), predictive (weak &mdash; completing a tutorial doesn&apos;t mean taking real product actions), gameable (yes &mdash; make it trivially short). First action within 3 days: measurable (yes), movable (yes), predictive (stronger &mdash; real product actions correlate with retention), gameable (harder &mdash; requires actual product use). The second metric passes all four tests. The first fails on predictiveness and gaming resistance.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>Before working through the scorecard &mdash; of the five metrics below, which do you predict will fail the most tests? Specifically, which ones do you expect to fail the gaming resistance test? Hold your read before you check.</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive: Metric Scorecard Exercise ── */}
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Metric Scorecard Exercise</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 1rem' }}>
          For each metric below, rate whether it passes or fails each property. Click a cell to toggle: green = pass, red = fail, empty = not rated. Rate all 5 metrics, then check your answers.
        </p>

        {/* Property headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 60px)', gap: '0.25rem', marginBottom: '0.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>Metric</div>
          {SCORECARD_PROPERTIES.map(function(p) {
            return <div key={p.id} style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{p.label}</div>;
          })}
        </div>

        {/* Metric rows */}
        {SCORECARD_METRICS.map(function(metric) {
          return (
            <div key={metric.id} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 60px)', gap: '0.25rem', marginBottom: '0.35rem', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{metric.label}</div>
              {SCORECARD_PROPERTIES.map(function(prop) {
                var val = ratings[metric.id][prop.id];
                var bg = val === null ? 'var(--surface-2)' : val ? 'var(--green-bg)' : 'var(--red-bg)';
                var borderColor = val === null ? 'var(--border)' : val ? 'var(--green-border)' : 'var(--red-border)';
                var icon = val === null ? '–' : val ? <Icon name='check' size={14} color='currentColor' /> : <Icon name='x' size={14} color='currentColor' />;
                var iconColor = val === null ? 'var(--text-muted)' : val ? 'var(--green)' : 'var(--red)';

                if (checked) {
                  var isCorrect = val === metric.correct[prop.id];
                  borderColor = isCorrect ? 'var(--green-border)' : 'var(--red-border)';
                  bg = isCorrect ? 'var(--green-bg)' : 'var(--red-bg)';
                }

                return (
                  <button key={prop.id} onClick={function() { handleToggle(metric.id, prop.id); }} style={{ background: bg, border: '1.5px solid ' + borderColor, borderRadius: 'var(--radius-sm)', padding: '0.3rem', cursor: checked ? 'default' : 'pointer', fontSize: '0.85rem', fontWeight: 700, color: iconColor, textAlign: 'center', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Check button */}
        {allRated && !checked && (
          <button onClick={function() { setChecked(true); }} className='pal-glow-pulse' style={{ marginTop: '0.75rem', padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--green)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Check My Ratings</button>
        )}

        {/* Score + explanations */}
        {checked && scoreResult && (
          <div className='pal-reveal-in' style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: scoreResult.correct >= 16 ? 'var(--green)' : 'var(--yellow)', marginBottom: '0.75rem' }}>
              {scoreResult.correct} / {scoreResult.total} correct
            </div>
            {SCORECARD_METRICS.map(function(metric) {
              var hasError = SCORECARD_PROPERTIES.some(function(p) { return ratings[metric.id][p.id] !== metric.correct[p.id]; });
              if (!hasError) return null;
              return (
                <div key={metric.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', marginBottom: '0.4rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text)', marginBottom: '0.3rem' }}>{metric.label}</div>
                  {SCORECARD_PROPERTIES.map(function(prop) {
                    if (ratings[metric.id][prop.id] === metric.correct[prop.id]) return null;
                    return (
                      <div key={prop.id} style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.2rem' }}>
                        <strong style={{ color: metric.correct[prop.id] ? 'var(--green)' : 'var(--red)' }}>{prop.label}: {metric.correct[prop.id] ? 'Pass' : 'Fail'}</strong> — {metric.explanations[prop.id]}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Quick Check ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Check</div>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>{Q.question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {Q.options.map(function(opt) {
            return (
              <MCQOption key={opt.id} label={opt.text} selected={selected === opt.id} correct={opt.id === Q.correct} revealed={answered} onClick={function() { if (!answered) setSelected(opt.id); }} />
            );
          })}
        </div>
        {selected && !answered && (
          <button onClick={function() { setAnswered(true); }} style={{ marginTop: '0.75rem', padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--green)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Check</button>
        )}
        {answered && (
          <div className='pal-reveal-in' style={{ marginTop: '0.75rem', background: selected === Q.correct ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (selected === Q.correct ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <strong>{selected === Q.correct ? <><Icon name='check' size={13} color='var(--green)' /> Correct. </> : <><Icon name='x' size={13} color='var(--red)' /> Not quite. </>}</strong>{Q.explanation}
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {(checked || answered) && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>Of the five scorecard metrics, only <strong>Daily signups</strong> fails the gaming resistance test. It can be inflated by bot signups, incentivised campaigns, or lowering signup friction without improving activation &mdash; none of which require genuine product improvement. The remaining four either can&apos;t be gamed meaningfully (P50 page load time requires actually making the page faster; 7-day retained users requires bringing people back) or are structured in ways that limit gaming (Total registered users is a cumulative count that&apos;s hard to inflate, and NPS requires genuinely improving sentiment). The metric most likely to fail the most tests overall is <strong>Total registered users</strong>, which fails movability (cumulative counter that barely shifts with any single change) and predictiveness (includes churned users from years ago, telling you nothing about current value delivery).</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {(checked || answered) && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> When a PM proposes a metric for an OKR or experiment, run it through all four tests in sequence before agreeing. The conversation that catches a gameable metric before the quarter starts saves far more than the one that happens after three months of optimization in the wrong direction.</p>
            <p style={prose}><strong>Two.</strong> The most common failure mode in practice is metrics that pass measurability and movability but fail predictiveness. &quot;Notification open rate&quot; is measurable and movable &mdash; but opening notifications doesn&apos;t tell you users are getting value, only that the notification was compelling enough to trigger a click. Always ask: if this metric moved in the target direction, what does that mean users are experiencing?</p>
            <p style={prose}><strong>Three.</strong> Gaming resistance is the hardest test to apply before damage is done because gaming usually requires creativity. Ask yourself: if a team were incentivized only to move this metric, what&apos;s the cheapest way to do it without improving the actual product? If you can answer that question in sixty seconds, the metric is vulnerable. Add a counter metric that would break under the gaming approach.</p>
          </div>
        </div>
      )}

      {/* ── Key Insight + Connection ── */}
      <InsightBox label='Key Takeaway' color='var(--green)' bg='var(--green-bg)' border='var(--green-border)'>{module.keyInsight}</InsightBox>
      <InsightBox label='Connects to Experiments' color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)'>{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}
