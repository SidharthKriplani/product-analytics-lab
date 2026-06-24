import { useState, useEffect, useMemo } from 'react';
import { metricsFoundationModules } from '../../data/metricsFoundationModules.js';
import { saveMetricsFoundationProgress, getMetricsFoundationProgress, getAllMetricsFoundationProgress } from '../../utils/metricsFoundationProgress.js';
import { track } from '../../utils/analytics.js';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../shared/FoundationPrimitives.jsx';
import { FoundationRunnerShell } from '../shared/FoundationRunnerShell.jsx';

// Green-default wrapper so MF01-MF13 modules get the right color without passing it
function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

// ── Persistence helpers ──────────────────────────────────────────────────────
function saveMFState(id, state) {
  try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {}
}
function loadMFState(id) {
  try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; }
}
function shuffleMF(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}


// ─── Module 1: Metrics Hierarchy ─────────────────────────────────────────────

const MF01_ITEMS_DEFAULT = [
  { id: 'dau',        label: 'Daily Active Users (Facebook)',       correct: 'north-star' },
  { id: 'session',    label: 'Avg session depth per user',          correct: 'l1' },
  { id: 'feed-ctr',   label: 'Feed click-through rate',             correct: 'l2' },
  { id: 'latency',    label: 'p99 API latency',                     correct: 'guardrail' },
  { id: 'stories',    label: 'Stories completion rate',             correct: 'l2' },
  { id: 'support',    label: 'Support contact rate',                correct: 'guardrail' },
  { id: 'mau',        label: 'Monthly Active Users (Facebook)',     correct: 'l1' },
  { id: 'notif-ctr',  label: 'Push notification CTR',              correct: 'l2' },
];

const TIERS = [
  { id: 'north-star', label: 'North Star',  color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  { id: 'l1',         label: 'L1 Supporting', color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  { id: 'l2',         label: 'L2 Operational', color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
  { id: 'guardrail',  label: 'Guardrail',    color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
];

function Module_MF01({ module, onNext }) {
  const saved = useMemo(function() { return loadMFState('mf01'); }, []);
  const [items, setItems] = useState(function() { return saved && saved.items ? saved.items : shuffleMF(MF01_ITEMS_DEFAULT); });
  const [placements, setPlacements] = useState(function() { return saved && saved.placements ? saved.placements : {}; });
  const [checked, setChecked] = useState(function() { return saved && saved.checked ? saved.checked : false; });

  useEffect(function() {
    saveMFState('mf01', { items: items, placements: placements, checked: checked });
  }, [items, placements, checked]);

  const allPlaced = items.every(function(i) { return placements[i.id]; });
  const score = checked ? items.filter(function(i) { return placements[i.id] === i.correct; }).length : null;

  function cycle(id) {
    if (checked) return;
    const tiers = TIERS.map(t => t.id);
    const cur = placements[id];
    const idx = tiers.indexOf(cur);
    const next = tiers[(idx + 1) % tiers.length];
    setPlacements(prev => ({ ...prev, [id]: next }));
  }

  function itemStyle(item) {
    const tier = TIERS.find(t => t.id === placements[item.id]);
    let bg = 'var(--surface-2)', border = 'var(--border)', color = 'var(--text-muted)';
    if (checked) {
      const ok = placements[item.id] === item.correct;
      bg = ok ? 'var(--green-bg)' : 'var(--red-bg)';
      border = ok ? 'var(--green-border)' : 'var(--red-border)';
      color = ok ? 'var(--green)' : 'var(--red)';
    } else if (tier) {
      bg = tier.bg; border = tier.border; color = tier.color;
    }
    return { padding: '0.45rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid ' + border, background: bg, color, fontSize: '0.82rem', fontWeight: 500, cursor: checked ? 'default' : 'pointer', userSelect: 'none', transition: 'all 0.15s' };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your VP of Product just scheduled a meeting for Friday: &quot;I want a single dashboard that tells me whether the product is healthy.&quot; She doesn&apos;t want 40 charts. She wants a hierarchy — one North Star at the top, a handful of L1 drivers underneath, and the diagnostic L2 metrics below those. She wants to open this dashboard every Monday and know, within 30 seconds, whether something needs attention.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          You pull up the product&apos;s metric catalog and find 30+ metrics tracked across teams. Most of them are activity counters or vanity numbers. Your job before Friday is to classify each metric into the right tier — North Star, L1, L2, or Guardrail — so the dashboard tells a coherent story instead of just listing numbers.
        </p>
      </div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
        Metrics analytics is how analysts translate a product strategy into measurable signals — choosing the right numbers to track, understand why they move, and decide whether a change is an improvement. Picking the wrong metric is one of the most common and costly mistakes in product development: teams optimize hard for a number that doesn&apos;t actually represent user value. Every product has a <strong>metrics hierarchy</strong>: a single North Star that captures delivered value, L1 metrics that explain <em>why</em> it moves, L2 metrics that pinpoint <em>where</em>, and guardrails that protect what you must not break.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '-0.75rem' }}>Try It: Classify the Metrics</div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1.1rem' }}>
        <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text)' }}>Exercise:</strong> Click each metric to cycle it through the four tiers.
          Place all 8 correctly, then hit Check.
        </p>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
          {TIERS.map(t => (
            <span key={t.id} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', background: t.bg, color: t.color, border: '1px solid ' + t.border }}>
              {t.label}
            </span>
          ))}
        </div>
      </div>
      <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Click each metric chip to cycle through North Star, L1 Supporting, L2 Operational, and Guardrail. Assign all 8 metrics before hitting Check answers.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {items.map(item => (
          <span key={item.id} style={itemStyle(item)} onClick={() => cycle(item.id)}>
            {checked && (placements[item.id] === item.correct ? '✓ ' : '✗ ')}
            {item.label}
            {placements[item.id] && !checked && (
              <span style={{ fontSize: '0.7rem', opacity: 0.7, marginLeft: '0.3rem' }}>
                [{TIERS.find(t => t.id === placements[item.id])?.label}]
              </span>
            )}
          </span>
        ))}
      </div>
      {checked && (
        <div className="pal-reveal-in" style={{ background: score === 8 ? 'var(--green-bg)' : 'var(--yellow-bg)', border: '1.5px solid ' + (score === 8 ? 'var(--green-border)' : 'var(--yellow-border)'), borderRadius: 'var(--radius)', padding: '0.85rem 1.1rem', fontSize: '0.88rem', color: score === 8 ? 'var(--green)' : 'var(--yellow-text)', fontWeight: 500 }}>
          {score === 8 ? 'Perfect. L2 metrics (feed CTR, stories completion, push CTR) are experiment targets. L1s (session depth, MAU) are the explanatory layer. DAU is the North Star — too slow for experiments but the ultimate scorecard.' : score + '/8. Key: latency and support contacts are guardrails (protect, don\'t optimise). MAU is L1 — it explains DAU but doesn\'t replace it.'}
        </div>
      )}
      <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Once all 8 metrics are assigned, click Check answers to see your score and review which tier each metric belongs to.
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={() => allPlaced && !checked && setChecked(true)} disabled={!allPlaced || checked} style={{ padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)', border: 'none', background: allPlaced && !checked ? 'var(--accent)' : 'var(--border)', color: allPlaced && !checked ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', cursor: allPlaced && !checked ? 'pointer' : 'not-allowed' }}>Check answers</button>
        <button onClick={() => { setPlacements({}); setChecked(false); setItems(shuffleMF(MF01_ITEMS_DEFAULT)); }} style={{ padding: '0.5rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer' }}>Reset</button>
      </div>
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}

// ─── Module 2: What Makes a Good Metric? ────────────────────────────────────

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

function Module_MF02({ module, onNext }) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Section 1: The Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          It is metrics review week. The growth team is proposing three new metrics for the quarterly OKR cycle: daily signups, NPS, and total registered users. Each sounds reasonable in the meeting. But when you pressure-test them against the four properties every sound metric needs, cracks appear fast.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          The problem is that most teams pick metrics because they <em>sound</em> important, not because they pass the four-property test. A metric can be perfectly measurable but completely unpredictive. It can be movable but trivially gameable. You need all four.
        </p>
      </div>

      {/* Section 2: The Concept + Interactive Demo */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Four Properties of a Sound Metric</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
          A metric is only useful for decision-making if it is <strong>measurable</strong> (you can observe it reliably), <strong>movable</strong> (a product change can shift it in your experiment window), <strong>predictive</strong> (moving it means users are genuinely better off), and <strong>not gameable</strong> (you cannot inflate it without real improvement). Most bad metric choices fail on the last two.
        </p>
      </div>

      {/* Interactive: Metric Scorecard Exercise */}
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
                var icon = val === null ? '–' : val ? '✓' : '✗';
                var iconColor = val === null ? 'var(--text-muted)' : val ? 'var(--green)' : 'var(--red)';

                if (checked) {
                  var isCorrect = val === metric.correct[prop.id];
                  borderColor = isCorrect ? 'var(--green-border)' : 'var(--red-border)';
                  bg = isCorrect ? 'var(--green-bg)' : 'var(--red-bg)';
                }

                return (
                  <button key={prop.id} onClick={function() { handleToggle(metric.id, prop.id); }} style={{ background: bg, border: '1.5px solid ' + borderColor, borderRadius: 'var(--radius-sm)', padding: '0.3rem', cursor: checked ? 'default' : 'pointer', fontSize: '0.85rem', fontWeight: 700, color: iconColor, textAlign: 'center', lineHeight: 1 }}>
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

      {/* Section 3: Framework */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Four-Property Test</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Before committing to any metric for an OKR, experiment, or dashboard, run it through the four-property test: <strong>(1)</strong> Can you measure it reliably and automatically? <strong>(2)</strong> Can a product change move it within your decision window? <strong>(3)</strong> Does moving it mean users are actually better off? <strong>(4)</strong> Is it hard to inflate without genuine improvement? If any answer is no, you have a metric that will mislead decisions — find a better proxy or add guardrails.
        </p>
      </div>

      {/* Section 4: Quick Check */}
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
            <strong>{selected === Q.correct ? '✓ Correct. ' : '✗ Not quite. '}</strong>{Q.explanation}
          </div>
        )}
      </div>

      {/* Section 5: Key Takeaway */}
      <InsightBox label='Key Takeaway' color='var(--green)' bg='var(--green-bg)' border='var(--green-border)'>{module.keyInsight}</InsightBox>
      <InsightBox label='Connects to Experiments' color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)'>{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}

// ─── Module 3: Ratio Metrics ─────────────────────────────────────────────────
// REFERENCE MODULE — new foundation format:
// 1. Scenario (why this matters)  2. Concept + interactive demo  3. Quick check  4. Key takeaway

function Module_MF03({ module, onNext }) {
  var saved03 = useMemo(function() { return loadMFState('mf03'); }, []);
  var [mobilePct, setMobilePct] = useState(function() { return saved03 && saved03.mobilePct !== undefined ? saved03.mobilePct : 40; });
  var [desktopCVR, setDesktopCVR] = useState(function() { return saved03 && saved03.desktopCVR !== undefined ? saved03.desktopCVR : 4.5; });
  var [mobileCVR, setMobileCVR] = useState(function() { return saved03 && saved03.mobileCVR !== undefined ? saved03.mobileCVR : 2.1; });
  var [selected, setSelected] = useState(function() { return saved03 ? saved03.selected : null; });
  var [answered, setAnswered] = useState(function() { return saved03 ? saved03.answered : false; });
  var [discoveredParadox, setDiscoveredParadox] = useState(function() { return saved03 ? saved03.discoveredParadox : false; });

  useEffect(function() {
    saveMFState('mf03', { mobilePct: mobilePct, desktopCVR: desktopCVR, mobileCVR: mobileCVR, selected: selected, answered: answered, discoveredParadox: discoveredParadox });
  }, [mobilePct, desktopCVR, mobileCVR, selected, answered, discoveredParadox]);

  var blendedCVR = ((100 - mobilePct) / 100) * desktopCVR + (mobilePct / 100) * mobileCVR;
  var baselineBlended = 0.6 * 4.5 + 0.4 * 2.1; // 3.54 at 40/60 split

  // SVG bar chart dimensions
  var barW = 60;
  var chartH = 160;
  var maxCVR = 6;

  var Q = {
    question: 'Your team redesigned the checkout page. Desktop CVR rose 4.1% to 4.5%. Mobile CVR rose 2.8% to 3.2%. But overall CVR fell 4.2% to 3.9%. A stakeholder asks: "Did the redesign help or hurt?" What do you say?',
    options: [
      { id: 'a', text: 'The redesign helped — both segments improved, so the overall must have improved too.' },
      { id: 'b', text: 'The redesign helped each segment, but a traffic mix shift toward mobile pulled the blended rate down. The redesign worked; the aggregate is misleading.' },
      { id: 'c', text: 'The data is inconsistent — if both segments improved, the overall cannot fall. There must be a logging error.' },
    ],
    correct: 'b',
    explanation: 'Both segment CVRs improved, confirming the redesign worked. But mobile traffic share grew (say 60% to 75%), and mobile converts at a lower rate. The blended average fell because the denominator mix shifted — not because the product got worse. This is Simpson\'s Paradox. The correct answer to the stakeholder: "The redesign improved conversion in every segment. The aggregate fell because mobile grew as a share of traffic. Both things are true at the same time."',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Section 1: The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Monday morning. You open the weekly metrics dashboard and see checkout conversion rate dropped from 3.5% to 3.1%. The product lead pings you: <em>"What happened to checkout?"</em>
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          You segment by platform. Desktop CVR is 4.5% — same as last week. Mobile CVR is 2.1% — also flat. Neither segment moved. So where did the drop come from?
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          The answer is hiding in a place most analysts forget to check: <strong>the mix</strong>. Last week, 40% of traffic was mobile. This week, a push notification campaign drove it to 65%. Every segment performed identically — but the blended rate fell because more traffic came through the lower-converting channel.
        </p>
      </div>

      {/* ── Section 2: The Concept ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Three Levers of Any Ratio</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
          Every ratio metric — conversion rate, CTR, retention rate, revenue per session — is a fraction. When it moves, exactly three things could have changed:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {[
            { label: '1. Numerator', desc: 'Did the outcome count change? (more conversions, fewer clicks)', color: 'var(--green)' },
            { label: '2. Denominator', desc: 'Did the exposure count change? (more sessions, fewer users)', color: 'var(--accent)' },
            { label: '3. Mix', desc: 'Did the composition of the denominator shift? (more mobile, fewer power users)', color: 'var(--purple)' },
          ].map(function(item) {
            return (
              <div key={item.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.78rem', color: item.color }}>{item.label}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.45 }}>{item.desc}</div>
              </div>
            );
          })}
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          The third lever is the one people miss. A ratio can move in a direction that looks alarming (or encouraging) even when nothing about the product changed — because the <em>who</em> shifted. This is called <strong>Simpson\'s Paradox</strong>, and it shows up constantly in product analytics: A/B tests where treatment changes funnel composition, seasonality that shifts user mix, marketing campaigns that bring different cohorts.
        </p>
      </div>

      {/* ── Section 3: Interactive Demo ── */}
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Mix-Shift Explorer</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 1rem' }}>
          Drag the mobile traffic slider to see how mix shift changes the blended conversion rate — even when segment rates stay fixed. Try to make the blended rate drop below 3.0% without changing either segment\'s CVR.
        </p>

        {/* Sliders */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
            Mobile traffic share: <strong style={{ color: mobilePct > 60 ? 'var(--yellow)' : 'var(--text)' }}>{mobilePct}%</strong>
            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(desktop: {100 - mobilePct}%)</span>
          </label>
          <input type='range' min={5} max={95} step={1} value={mobilePct} onChange={function(e) { setMobilePct(Number(e.target.value)); if (Number(e.target.value) > 70 && !discoveredParadox) setDiscoveredParadox(true); }} style={{ width: '100%', accentColor: 'var(--green)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Desktop CVR: <strong style={{ color: 'var(--text)' }}>{desktopCVR.toFixed(1)}%</strong></label>
            <input type='range' min={1} max={6} step={0.1} value={desktopCVR} onChange={function(e) { setDesktopCVR(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Mobile CVR: <strong style={{ color: 'var(--text)' }}>{mobileCVR.toFixed(1)}%</strong></label>
            <input type='range' min={0.5} max={5} step={0.1} value={mobileCVR} onChange={function(e) { setMobileCVR(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
        </div>

        {/* SVG bar chart */}
        <svg viewBox={'0 0 280 ' + (chartH + 40)} width='100%' style={{ maxWidth: '320px', display: 'block', margin: '0 auto' }}>
          {/* Y-axis labels */}
          {[0, 2, 4, 6].map(function(v) {
            var y = chartH - (v / maxCVR) * chartH + 10;
            return (
              <g key={v}>
                <line x1={45} x2={260} y1={y} y2={y} stroke='var(--border)' strokeWidth={0.5} strokeDasharray={v > 0 ? '3,3' : 'none'} />
                <text x={40} y={y + 3} textAnchor='end' fill='var(--text-muted)' fontSize={10}>{v}%</text>
              </g>
            );
          })}

          {/* Desktop bar */}
          <rect x={70} y={chartH - (desktopCVR / maxCVR) * chartH + 10} width={barW} height={(desktopCVR / maxCVR) * chartH} rx={4} fill='var(--accent)' opacity={0.8} />
          <text x={100} y={chartH + 28} textAnchor='middle' fill='var(--text-muted)' fontSize={10} fontWeight={600}>Desktop</text>
          <text x={100} y={chartH - (desktopCVR / maxCVR) * chartH + 4} textAnchor='middle' fill='var(--accent)' fontSize={11} fontWeight={700}>{desktopCVR.toFixed(1)}%</text>

          {/* Mobile bar */}
          <rect x={150} y={chartH - (mobileCVR / maxCVR) * chartH + 10} width={barW} height={(mobileCVR / maxCVR) * chartH} rx={4} fill='var(--purple)' opacity={0.8} />
          <text x={180} y={chartH + 28} textAnchor='middle' fill='var(--text-muted)' fontSize={10} fontWeight={600}>Mobile</text>
          <text x={180} y={chartH - (mobileCVR / maxCVR) * chartH + 4} textAnchor='middle' fill='var(--purple)' fontSize={11} fontWeight={700}>{mobileCVR.toFixed(1)}%</text>

          {/* Blended line */}
          <line x1={55} x2={255} y1={chartH - (blendedCVR / maxCVR) * chartH + 10} y2={chartH - (blendedCVR / maxCVR) * chartH + 10} stroke={blendedCVR < baselineBlended ? 'var(--red)' : 'var(--green)'} strokeWidth={2} strokeDasharray='6,3' />
          <text x={258} y={chartH - (blendedCVR / maxCVR) * chartH + 14} fill={blendedCVR < baselineBlended ? 'var(--red)' : 'var(--green)'} fontSize={11} fontWeight={700}>{blendedCVR.toFixed(1)}%</text>
          <text x={258} y={chartH - (blendedCVR / maxCVR) * chartH + 2} fill='var(--text-muted)' fontSize={8}>Blended</text>
        </svg>

        {/* Discovery nudge */}
        {discoveredParadox && (
          <div className='pal-reveal-in' style={{ marginTop: '0.75rem', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--yellow)', lineHeight: 1.55 }}>
            Notice how the blended rate dropped below the baseline — even though neither segment\'s CVR changed? That\'s the mix shift in action. The product didn\'t get worse. The audience composition changed.
          </div>
        )}
      </div>

      {/* ── Section 4: The Framework ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Diagnostic Habit</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Every time a ratio metric moves, run this three-part check before concluding anything: <strong>(1)</strong> Did the numerator change? <strong>(2)</strong> Did the denominator change? <strong>(3)</strong> Did the mix of the denominator shift across segments? If you skip step 3, you will eventually present a metric movement to leadership that means the opposite of what you think it means.
        </p>
      </div>

      {/* ── Section 5: Quick Check ── */}
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
            <strong>{selected === Q.correct ? '✓ Correct. ' : '✗ Not quite. '}</strong>{Q.explanation}
          </div>
        )}
      </div>

      {/* ── Section 6: Key Takeaway ── */}
      <InsightBox label='Key Takeaway' color='var(--green)' bg='var(--green-bg)' border='var(--green-border)'>{module.keyInsight}</InsightBox>
      <InsightBox label='Connects to Experiments' color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)'>{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}

// ─── Module 4: Metric Decomposition ──────────────────────────────────────────

const MF04_OPTIONS_DEFAULT = ['New users', 'Retained users', 'Resurrected users', 'Churned users', 'Power users', 'Organic users'];
const DECOMP_CORRECT = ['New users', 'Retained users', 'Resurrected users'];

function Module_MF04({ module, onNext }) {
  const saved04 = useMemo(function() { return loadMFState('mf04'); }, []);
  const [options, setOptions] = useState(function() { return saved04 && saved04.options ? saved04.options : shuffleMF(MF04_OPTIONS_DEFAULT); });
  const [picked, setPicked] = useState(function() { return saved04 && saved04.picked ? saved04.picked : []; });
  const [checked, setChecked] = useState(function() { return saved04 ? saved04.checked : false; });

  useEffect(function() {
    saveMFState('mf04', { options: options, picked: picked, checked: checked });
  }, [options, picked, checked]);

  function toggle(opt) {
    if (checked) return;
    setPicked(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]);
  }

  const correct = picked.length === 3 && DECOMP_CORRECT.every(c => picked.includes(c));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Monday morning standup. The growth PM pulls up the weekly dashboard and announces: &quot;DAU dropped 8% week-over-week.&quot; The room goes quiet. The engineering lead asks if there was a release bug. Marketing wonders if the paid campaign ended. The designer asks if the new onboarding flow is broken. Everyone has a theory, but no one knows which lever actually moved.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          This is where decomposition becomes essential. DAU is not one number — it is the sum of distinct user segments, each driven by a different mechanism. Until you break DAU into its components, you cannot distinguish between an acquisition problem (fewer new users arriving), a retention problem (existing users leaving faster), and a reactivation gap (former users not coming back). Each diagnosis leads to a completely different intervention, and teams that skip the decomposition step waste weeks chasing the wrong root cause.
        </p>
      </div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
        Decomposition converts a single number into a set of drivers with different root causes and interventions.
        When a top-line metric moves, your first question is: <em>which component drove it?</em>
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '-0.75rem' }}>Try It: Decompose DAU</div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
          DAU can be decomposed as the sum of three user segments. Select the three correct components:
        </div>
        <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Click exactly three user segment labels that together make up DAU on any given day, then click Check to verify your decomposition.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.5rem' }}>
          {options.map(opt => {
            const sel = picked.includes(opt);
            const isCorrect = DECOMP_CORRECT.includes(opt);
            let bg = sel ? 'var(--accent-bg)' : 'var(--surface)', border = sel ? 'var(--accent)' : 'var(--border)', color = sel ? 'var(--accent)' : 'var(--text-muted)';
            if (checked) {
              if (isCorrect) { bg = 'var(--green-bg)'; border = 'var(--green-border)'; color = 'var(--green)'; }
              else if (sel) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
            }
            return (
              <button key={opt} onClick={() => toggle(opt)} style={{ padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid ' + border, background: bg, color, fontSize: '0.83rem', fontWeight: sel ? 600 : 400, cursor: checked ? 'default' : 'pointer', transition: 'all 0.15s' }}>
                {checked && isCorrect ? '✓ ' : checked && sel ? '✗ ' : ''}{opt}
              </button>
            );
          })}
        </div>
        {picked.length === 3 && !checked && (
          <button onClick={() => setChecked(true)} style={{ marginTop: '0.75rem', padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Check</button>
        )}
        {checked && (
          <div className="pal-reveal-in" style={{ marginTop: '0.75rem', background: correct ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (correct ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            {correct
              ? '✓ Correct. DAU = New + Retained + Resurrected. A DAU drop is a very different problem depending on which component fell: acquisition issue vs retention problem vs re-engagement gap.'
              : '✗ The three components are New, Retained, and Resurrected users. "Churned" is the subtraction that gets you from yesterday\'s DAU to tomorrow\'s — it\'s a driver of change, not a component of today\'s DAU.'}
          </div>
        )}
      </div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>LTV Decomposition</div>
        <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          LTV = ARPU \xd7 Avg lifespan = (Revenue per transaction \xd7 Transactions per month) \xd7 (1 / Churn rate)<br />
          This decomposition tells you whether an LTV improvement requires raising price, increasing purchase frequency, or reducing churn — three different product and pricing strategies.
        </div>
      </div>
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}

// ─── Module 5: Counter Metrics ────────────────────────────────────────────────

const MF05_PAIRS_DEFAULT = [
  { primary: 'Push notification send volume', correct: 'notif-opt-out', options: ['notif-opt-out', 'dau', 'session-length'], labels: { 'notif-opt-out': 'Notification opt-out rate', 'dau': 'DAU', 'session-length': 'Session length' } },
  { primary: 'Ads shown per session', correct: 'ad-hide', options: ['ad-hide', 'page-load', 'revenue'], labels: { 'ad-hide': 'Ad hide / negative feedback rate', 'page-load': 'Page load time', 'revenue': 'Ad revenue' } },
  { primary: 'Search ranking aggressiveness (more results)', correct: 'zero-click', options: ['zero-click', 'query-count', 'ctr'], labels: { 'zero-click': 'Zero-click rate (query abandoned)', 'query-count': 'Total search queries', 'ctr': 'Result click-through rate' } },
];

function Module_MF05({ module, onNext }) {
  const saved05 = useMemo(function() { return loadMFState('mf05'); }, []);
  const [pairs, setPairs] = useState(function() { return saved05 && saved05.pairs ? saved05.pairs : shuffleMF(MF05_PAIRS_DEFAULT); });
  const [answers, setAnswers] = useState(function() { return saved05 && saved05.answers ? saved05.answers : {}; });
  const [checked, setChecked] = useState(function() { return saved05 ? saved05.checked : false; });

  useEffect(function() {
    saveMFState('mf05', { pairs: pairs, answers: answers, checked: checked });
  }, [pairs, answers, checked]);

  const allAnswered = pairs.every(function(_, i) { return answers[i] !== undefined; });
  const score = checked ? pairs.filter(function(p, i) { return answers[i] === p.correct; }).length : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your team shipped a &quot;smart notifications&quot; feature three weeks ago. The results looked incredible: push notification open rates jumped 34%, and the daily active user count ticked up by 2.1%. The PM is already writing the launch post. Then someone on the data team pulls up the support dashboard. Ticket volume for &quot;too many notifications&quot; is up 45%. Notification opt-out rate has nearly doubled. The feature boosted engagement by annoying users into opening the app — and it is quietly destroying long-term permission to communicate with them.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          This is the scenario counter metrics are designed to prevent. Every primary metric you optimize creates a pressure gradient — a direction the product is being pulled toward. Without an explicit counter metric watching for the collateral damage, teams only learn about the tradeoff after the harm has already accumulated. The exercise below tests whether you can identify the right counter metric for a given primary signal.
        </p>
      </div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
        Every metric you optimise creates pressure to sacrifice something else.
        <strong> Counter metrics</strong> make that tradeoff explicit before an experiment ships.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '-0.75rem' }}>Try It: Match the Counter Metric</div>
      <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> For each primary metric, select the counter metric that would catch the most important unintended harm if the primary metric is blindly optimised.
      </div>
      {pairs.map((pair, i) => (
        <div key={i} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Primary metric</div>
          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.6rem' }}>{pair.primary}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {pair.options.map(opt => {
              const sel = answers[i] === opt;
              const isCorrect = opt === pair.correct;
              let bg = sel ? 'var(--accent-bg)' : 'var(--surface)', border = sel ? 'var(--accent)' : 'var(--border)', color = sel ? 'var(--accent)' : 'var(--text-muted)';
              if (checked) {
                if (isCorrect) { bg = 'var(--green-bg)'; border = 'var(--green-border)'; color = 'var(--green)'; }
                else if (sel) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
              }
              return (
                <button key={opt} onClick={() => !checked && setAnswers(prev => ({ ...prev, [i]: opt }))} style={{ padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid ' + border, background: bg, color, fontSize: '0.83rem', fontWeight: sel ? 600 : 400, cursor: checked ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  {checked && isCorrect ? '✓ ' : checked && sel ? '✗ ' : ''}{pair.labels[opt]}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {allAnswered && !checked && (
        <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> You have answered all three. Click Check answers to reveal whether each pairing is correct and why.
        </div>
      )}
      {allAnswered && !checked && (
        <button onClick={() => setChecked(true)} style={{ alignSelf: 'flex-start', padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Check answers</button>
      )}
      {checked && (
        <div className="pal-reveal-in" style={{ background: score === 3 ? 'var(--green-bg)' : 'var(--yellow-bg)', border: '1px solid ' + (score === 3 ? 'var(--green-border)' : 'var(--yellow-border)'), borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          {score === pairs.length ? '✓ All correct. Opt-out rate catches notification fatigue. Ad hide rate catches ad quality degradation. Zero-click rate catches search quality degradation.' : score + '/' + pairs.length + '. Counter metrics protect the quality of the user experience that isn\'t captured in the primary optimisation signal.'}
        </div>
      )}
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}

// ─── Module 6: Leading vs Lagging ────────────────────────────────────────────

const MF06_ITEMS_DEFAULT = [
  { id: 'rev',      label: 'Monthly revenue',                    correct: 'lagging',  reason: 'Confirms past performance. No signal about what drove it or what\'s coming.' },
  { id: 'd7ret',    label: 'D7 retention rate',                  correct: 'leading',  reason: 'Predicts LTV and long-term DAU trajectory. Fast-moving and sensitive.' },
  { id: 'sub',      label: 'Total subscriber count',             correct: 'lagging',  reason: 'Accumulates over time. Slow to reflect product changes.' },
  { id: 'onboard',  label: 'Onboarding completion rate',         correct: 'leading',  reason: 'Predicts new user activation and early retention. Moves in days.' },
  { id: 'nps',      label: 'Net Promoter Score (quarterly)',      correct: 'lagging',  reason: 'Survey-based, infrequent, and reflects cumulative experience — not current product state.' },
  { id: 'act',      label: 'Actions taken in first session',     correct: 'leading',  reason: 'Strong early signal of engagement depth and eventual retention.' },
];

function Module_MF06({ module, onNext }) {
  const saved06 = useMemo(function() { return loadMFState('mf06'); }, []);
  const [items06, setItems06] = useState(function() { return saved06 && saved06.items ? saved06.items : shuffleMF(MF06_ITEMS_DEFAULT); });
  const [placements, setPlacements] = useState(function() { return saved06 && saved06.placements ? saved06.placements : {}; });
  const [checked, setChecked] = useState(function() { return saved06 ? saved06.checked : false; });

  useEffect(function() {
    saveMFState('mf06', { items: items06, placements: placements, checked: checked });
  }, [items06, placements, checked]);

  const allPlaced = items06.every(function(i) { return placements[i.id]; });
  const score = checked ? items06.filter(function(i) { return placements[i.id] === i.correct; }).length : null;

  function cycle(id) {
    if (checked) return;
    setPlacements(prev => {
      const cur = prev[id];
      if (!cur) return { ...prev, [id]: 'leading' };
      if (cur === 'leading') return { ...prev, [id]: 'lagging' };
      const n = { ...prev }; delete n[id]; return n;
    });
  }

  function chipStyle(item) {
    const placed = placements[item.id];
    let bg = 'var(--surface-2)', border = 'var(--border)', color = 'var(--text-muted)';
    if (checked) {
      const ok = placed === item.correct;
      bg = ok ? 'var(--green-bg)' : 'var(--red-bg)'; border = ok ? 'var(--green-border)' : 'var(--red-border)'; color = ok ? 'var(--green)' : 'var(--red)';
    } else if (placed === 'leading') { bg = 'var(--accent-bg)'; border = 'var(--accent-border)'; color = 'var(--accent)'; }
    else if (placed === 'lagging') { bg = 'var(--purple-bg)'; border = 'var(--purple-border)'; color = 'var(--purple)'; }
    return { padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid ' + border, background: bg, color, fontSize: '0.82rem', fontWeight: placed || checked ? 600 : 400, cursor: checked ? 'default' : 'pointer', userSelect: 'none', transition: 'all 0.15s', display: 'inline-block' };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          It&apos;s launch day. Your team just shipped a redesigned onboarding flow and the PM turns to you: &quot;How will we know if this worked?&quot; Revenue won&apos;t move for months — it takes 60+ days for a new cohort to convert to paid. NPS is measured quarterly. Subscriber count is a stock metric that accumulates slowly. If you wait for those numbers, you&apos;ll be three sprints deep into the next project before you learn anything.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          The answer is to pick a leading indicator: a metric that moves within days and predicts the lagging outcome you ultimately care about. Onboarding completion rate, actions taken in the first session, D7 retention — these signals arrive fast enough to inform iteration. The skill is knowing which metrics lead and which lag, because choosing a lagging indicator as your experiment primary metric means running experiments for months instead of weeks.
        </p>
      </div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
        <strong>Leading indicators</strong> move before the outcome — they predict. <strong>Lagging indicators</strong> confirm after — they report.
        The best experiment primary metrics are leading: fast, sensitive, and predictive of the lagging outcome you ultimately care about.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '-0.75rem' }}>Try It: Classify Each Metric</div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1.1rem' }}>
        <p style={{ margin: '0 0 0.6rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text)' }}>Exercise:</strong> Click each metric to label it <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Leading</span> or <span style={{ color: 'var(--purple)', fontWeight: 600 }}>Lagging</span>. Click again to toggle, or a third time to clear.
        </p>
        <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Click each metric chip once to mark it as Leading, again to mark it as Lagging, and a third time to clear it. Label all six before checking your answers.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {items06.map(item => (
            <span key={item.id} style={chipStyle(item)} onClick={() => cycle(item.id)}>
              {checked && (placements[item.id] === item.correct ? '✓ ' : '✗ ')}
              {item.label}
              {placements[item.id] && !checked && <span style={{ fontSize: '0.7rem', opacity: 0.75, marginLeft: '0.3rem' }}>[{placements[item.id]}]</span>}
            </span>
          ))}
        </div>
      </div>
      {checked && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1.1rem' }}>
          {items06.map(item => (
            <div key={item.id} style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', lineHeight: 1.5 }}>
              <strong style={{ color: placements[item.id] === item.correct ? 'var(--green)' : 'var(--red)' }}>
                {item.label}
              </strong>{' — '}{item.reason}
            </div>
          ))}
        </div>
      )}
      {allPlaced && !checked && (
        <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> All six metrics are labeled. Click Check answers to see detailed reasoning for each classification.
        </div>
      )}
      {allPlaced && !checked && (
        <button onClick={() => setChecked(true)} style={{ alignSelf: 'flex-start', padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Check answers</button>
      )}
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}

// ─── Module 7: North Star Design ─────────────────────────────────────────────

var NS_CANDIDATES = [
  {
    id: 'dau', label: 'DAU (daily active users)',
    correct: { valueDelivery: false, leadingIndicator: false, actionable: false },
    explanations: {
      valueDelivery: 'DAU measures presence, not value. A user who opens the app and immediately closes it counts as active.',
      leadingIndicator: 'DAU is a coincident indicator — it tells you what happened today, not what will happen next quarter. It moves after value is delivered, not before.',
      actionable: 'DAU is affected by marketing, seasonality, and competitor launches. No single team owns it, and a team building a messaging feature cannot reason about how their work moves DAU.',
    },
  },
  {
    id: 'messages', label: 'Messages sent per user per day',
    correct: { valueDelivery: true, leadingIndicator: true, actionable: true },
    explanations: {
      valueDelivery: 'Sending a message is the core action that delivers value in a workplace messaging tool — it means a user communicated with a colleague, which is the product\'s reason for existing.',
      leadingIndicator: 'Message volume today predicts retention and expansion next month. Teams that send more messages are more likely to upgrade and less likely to churn.',
      actionable: 'The onboarding team can improve first-message time. The notifications team can improve re-engagement. The channels team can improve group messaging. Every team has a lever.',
    },
  },
  {
    id: 'teams', label: 'Teams with 3+ weekly active members',
    correct: { valueDelivery: true, leadingIndicator: true, actionable: false },
    explanations: {
      valueDelivery: 'A team with 3+ active members is receiving collaborative value — the product is working as intended for a group.',
      leadingIndicator: 'Team-level activation predicts account expansion and contract renewal strongly.',
      actionable: 'This metric is hard for individual feature teams to move directly. The onboarding team can influence it, but the search team or the emoji-reactions team cannot reason about how their work moves "teams with 3+ members."',
    },
  },
  {
    id: 'revenue', label: 'Revenue per seat',
    correct: { valueDelivery: false, leadingIndicator: false, actionable: false },
    explanations: {
      valueDelivery: 'Revenue measures what the company extracts, not what users receive. A price increase raises revenue per seat without delivering any additional value.',
      leadingIndicator: 'Revenue is a lagging indicator — it reflects contract renewals from value delivered months ago. It cannot tell you if the product is getting better this quarter.',
      actionable: 'Product teams cannot directly move revenue per seat. Pricing, sales, and contract terms drive it. An engineer building better threading cannot reason about revenue impact.',
    },
  },
];

var NS_CRITERIA = [
  { id: 'valueDelivery', label: 'Reflects value delivery', desc: 'Measures what users get, not what the company extracts' },
  { id: 'leadingIndicator', label: 'Leading indicator', desc: 'Predicts future retention, growth, or revenue' },
  { id: 'actionable', label: 'Actionable by teams', desc: 'Individual teams can reason about how their work moves it' },
];

function Module_MF07({ module, onNext }) {
  var saved07 = useMemo(function() { return loadMFState('mf07'); }, []);
  var [evals, setEvals] = useState(function() {
    if (saved07 && saved07.evals) return saved07.evals;
    var init = {};
    NS_CANDIDATES.forEach(function(c) {
      init[c.id] = { valueDelivery: null, leadingIndicator: null, actionable: null };
    });
    return init;
  });
  var [checked, setChecked] = useState(function() { return saved07 ? saved07.checked : false; });
  var [selected, setSelected] = useState(function() { return saved07 ? saved07.selected : null; });
  var [answered, setAnswered] = useState(function() { return saved07 ? saved07.answered : false; });

  useEffect(function() {
    saveMFState('mf07', { evals: evals, checked: checked, selected: selected, answered: answered });
  }, [evals, checked, selected, answered]);

  function handleToggle(candidateId, criterionId) {
    if (checked) return;
    var updated = JSON.parse(JSON.stringify(evals));
    var current = updated[candidateId][criterionId];
    if (current === null) updated[candidateId][criterionId] = true;
    else if (current === true) updated[candidateId][criterionId] = false;
    else updated[candidateId][criterionId] = null;
    setEvals(updated);
  }

  var allRated = NS_CANDIDATES.every(function(c) {
    return NS_CRITERIA.every(function(cr) {
      return evals[c.id][cr.id] !== null;
    });
  });

  var scoreResult = null;
  if (checked) {
    var total = 0;
    var correct = 0;
    NS_CANDIDATES.forEach(function(c) {
      NS_CRITERIA.forEach(function(cr) {
        total += 1;
        if (evals[c.id][cr.id] === c.correct[cr.id]) correct += 1;
      });
    });
    scoreResult = { correct: correct, total: total };
  }

  var Q = {
    question: 'A food delivery app is choosing its North Star. Which candidate best captures value delivered to users?',
    options: [
      { id: 'a', text: 'Gross merchandise value (GMV) — total dollar value of all orders.' },
      { id: 'b', text: 'Orders delivered on time per active user per week — captures reliable delivery of the core value proposition.' },
      { id: 'c', text: 'Monthly active users — captures the size of the engaged user base.' },
      { id: 'd', text: 'Average order value — measures basket size and pricing efficiency.' },
    ],
    correct: 'b',
    explanation: 'GMV and average order value measure what the company extracts. MAU measures presence but not depth. "Orders delivered on time per active user per week" captures the core value: the user wanted food delivered reliably, and they got it. The "on time" qualifier prevents gaming via delayed orders, and "per user" normalizes for growth. It is leading (predicts retention), actionable (logistics, restaurant ops, and product teams all have levers), and hard to inflate without genuinely improving the delivery experience.',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Section 1: The Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          You are on the analytics team at Slack. The new VP of Product walks in on her first week and asks: "What is our North Star metric?" The room goes quiet. Someone says "DAU." She pushes back: "That tells me how many people opened the app. It does not tell me whether any of them got value from it. A user who opens Slack, sees 200 unread messages, feels overwhelmed, and closes it counts as a DAU. Is that success?"
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          She is right. Most North Star candidates fail because they measure what the company extracts (revenue, conversions) or what users do at surface level (logins, opens), not whether users are actually receiving the value the product promises. The challenge is finding a metric that reflects genuine value delivery, leads future business outcomes, and gives every team a lever to pull.
        </p>
      </div>

      {/* Section 2: The Concept + Interactive Demo */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Three Criteria for a North Star</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
          A North Star must pass three tests. It must <strong>reflect value delivery</strong> (what users get, not what the company takes). It must be a <strong>leading indicator</strong> (predicts retention and growth, not just records them after the fact). And it must be <strong>actionable by teams</strong> (every product team can reason about how their work moves it). Fail any one, and the metric becomes a vanity number that aligns no one.
        </p>
      </div>

      {/* Interactive: North Star Evaluator */}
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>North Star Evaluator — Slack</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 1rem' }}>
          Four candidate North Stars for Slack are listed below. For each, decide whether it passes or fails each of the three criteria. Click to toggle: green = yes, red = no. Evaluate all candidates, then check your analysis.
        </p>

        {/* Criteria headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, 70px)', gap: '0.25rem', marginBottom: '0.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>Candidate</div>
          {NS_CRITERIA.map(function(cr) {
            return <div key={cr.id} style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{cr.label}</div>;
          })}
        </div>

        {/* Candidate rows */}
        {NS_CANDIDATES.map(function(cand) {
          return (
            <div key={cand.id} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, 70px)', gap: '0.25rem', marginBottom: '0.35rem', alignItems: 'center' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{cand.label}</div>
              {NS_CRITERIA.map(function(cr) {
                var val = evals[cand.id][cr.id];
                var bg = val === null ? 'var(--surface-2)' : val ? 'var(--green-bg)' : 'var(--red-bg)';
                var borderColor = val === null ? 'var(--border)' : val ? 'var(--green-border)' : 'var(--red-border)';
                var icon = val === null ? '–' : val ? '✓' : '✗';
                var iconColor = val === null ? 'var(--text-muted)' : val ? 'var(--green)' : 'var(--red)';

                if (checked) {
                  var isCorrect = val === cand.correct[cr.id];
                  borderColor = isCorrect ? 'var(--green-border)' : 'var(--red-border)';
                  bg = isCorrect ? 'var(--green-bg)' : 'var(--red-bg)';
                }

                return (
                  <button key={cr.id} onClick={function() { handleToggle(cand.id, cr.id); }} style={{ background: bg, border: '1.5px solid ' + borderColor, borderRadius: 'var(--radius-sm)', padding: '0.3rem', cursor: checked ? 'default' : 'pointer', fontSize: '0.85rem', fontWeight: 700, color: iconColor, textAlign: 'center', lineHeight: 1 }}>
                    {icon}
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Check button */}
        {allRated && !checked && (
          <button onClick={function() { setChecked(true); }} className='pal-glow-pulse' style={{ marginTop: '0.75rem', padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--green)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Check My Analysis</button>
        )}

        {/* Score + explanations */}
        {checked && scoreResult && (
          <div className='pal-reveal-in' style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: scoreResult.correct >= 10 ? 'var(--green)' : 'var(--yellow)', marginBottom: '0.75rem' }}>
              {scoreResult.correct} / {scoreResult.total} correct
            </div>
            {NS_CANDIDATES.map(function(cand) {
              var hasError = NS_CRITERIA.some(function(cr) { return evals[cand.id][cr.id] !== cand.correct[cr.id]; });
              if (!hasError) return null;
              return (
                <div key={cand.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', marginBottom: '0.4rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text)', marginBottom: '0.3rem' }}>{cand.label}</div>
                  {NS_CRITERIA.map(function(cr) {
                    if (evals[cand.id][cr.id] === cand.correct[cr.id]) return null;
                    return (
                      <div key={cr.id} style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.2rem' }}>
                        <strong style={{ color: cand.correct[cr.id] ? 'var(--green)' : 'var(--red)' }}>{cr.label}: {cand.correct[cr.id] ? 'Yes' : 'No'}</strong> — {cand.explanations[cr.id]}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Framework */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The North Star Litmus Test</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          When someone proposes a North Star, ask three questions in order: <strong>(1)</strong> If this metric doubles, are users genuinely better off — or did we just extract more? <strong>(2)</strong> Does this metric predict next quarter\'s retention and revenue, or does it just record what already happened? <strong>(3)</strong> Can every product team in the company explain how their roadmap moves this metric? If any answer is no, the candidate is not a North Star — it is a KPI, an OKR target, or a vanity metric dressed up in strategic language.
        </p>
      </div>

      {/* Section 4: Quick Check */}
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
            <strong>{selected === Q.correct ? '✓ Correct. ' : '✗ Not quite. '}</strong>{Q.explanation}
          </div>
        )}
      </div>

      {/* Section 5: Key Takeaway */}
      <InsightBox label='Key Takeaway' color='var(--green)' bg='var(--green-bg)' border='var(--green-border)'>{module.keyInsight}</InsightBox>
      <InsightBox label='Connects to Experiments' color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)'>{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}

// ─── Module 8: Metric Sensitivity ────────────────────────────────────────────

function Module_MF08({ module, onNext }) {
  var saved08 = useMemo(function() { return loadMFState('mf08'); }, []);
  var [cv, setCv] = useState(function() { return saved08 && saved08.cv !== undefined ? saved08.cv : 200; });
  var [mde, setMde] = useState(function() { return saved08 && saved08.mde !== undefined ? saved08.mde : 2; });
  var [selected, setSelected] = useState(function() { return saved08 ? saved08.selected : null; });
  var [answered, setAnswered] = useState(function() { return saved08 ? saved08.answered : false; });
  var [triedPreset, setTriedPreset] = useState(function() { return saved08 ? saved08.triedPreset : false; });

  useEffect(function() {
    saveMFState('mf08', { cv: cv, mde: mde, selected: selected, answered: answered, triedPreset: triedPreset });
  }, [cv, mde, selected, answered, triedPreset]);

  // n per arm = (16 * CV^2) / MDE^2  where CV and MDE are in percentage points
  var cvDecimal = cv / 100;
  var mdeDecimal = mde / 100;
  var nPerArm = Math.ceil((16 * cvDecimal * cvDecimal) / (mdeDecimal * mdeDecimal));

  // Format large numbers
  function formatN(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return String(n);
  }

  // SVG bar chart showing sample size
  var maxN = 5000000;
  var barFill = Math.min(nPerArm / maxN, 1);
  var barWidth = 240;
  var barHeight = 32;

  // Duration estimate (assuming 50K users/day)
  var dailyTraffic = 50000;
  var totalNeeded = nPerArm * 2;
  var daysNeeded = Math.ceil(totalNeeded / dailyTraffic);
  var weeksNeeded = (daysNeeded / 7).toFixed(1);

  var Q = {
    question: 'You have two candidate primary metrics for a checkout A/B test: "revenue per user" (CV = 375%) and "add-to-cart rate" (CV = 85%). Your MDE is 2% relative lift. Which metric should be the primary, and why?',
    options: [
      { id: 'a', text: 'Revenue per user — it directly measures what matters. The higher variance just means you need a longer test.' },
      { id: 'b', text: 'Add-to-cart rate — it has 20x lower required sample size at the same MDE. Use it as the primary to detect effects quickly, then validate the revenue link via a longer holdout.' },
      { id: 'c', text: 'Both — run the test with dual primaries and apply a Bonferroni correction.' },
      { id: 'd', text: 'Neither — use a composite metric that blends revenue and conversion into one score.' },
    ],
    correct: 'b',
    explanation: 'At CV=375% and MDE=2%, revenue per user needs roughly 560,000 users per arm. At CV=85% and MDE=2%, add-to-cart rate needs about 29,000 per arm — nearly a 20x reduction. The practical move: use the sensitive metric (add-to-cart rate) as the primary to ship decisions quickly, and track revenue per user as a secondary or validate via a longer holdout. Option C wastes power on correction. Option D creates an uninterpretable metric. The key insight is that sensitivity is a practical constraint, not just a statistical one — it determines whether you ship in 2 weeks or 6 months.',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Section 1: The Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your team just ran a 4-week A/B test on the checkout flow. The primary metric was revenue per user. After 50,000 users per arm, the result came back p=0.21 — inconclusive. The PM is frustrated: "Did the feature work or not?"
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          You pull the numbers. Revenue per user has a standard deviation of $45 and a mean of $12. That is a coefficient of variation (CV) of 375%. To detect a 5% lift with 80% power, you would have needed roughly 90,000 users per arm — and to detect a 2% lift, over 560,000 per arm, far beyond the 50K you ran. The test was never going to work with this metric. The feature might be great. You will never know, because the metric was too noisy to hear the signal.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          This is the sensitivity trade-off: high-variance metrics like revenue capture what you care about but are nearly impossible to move in a test. Low-variance proxies like conversion rate detect effects fast but only matter if they predict the outcome you care about.
        </p>
      </div>

      {/* Section 2: The Concept + Interactive Demo */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Sample Size Formula</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
          Required sample size per arm (at 80% power, 5% significance) follows a simple relationship: <strong>n = 16 * CV² / MDE²</strong>, where CV is the coefficient of variation (SD / mean) and MDE is the minimum detectable effect as a relative proportion. Double the CV and you need 4x the sample. Halve the MDE and you need 4x the sample. Both directions hurt, and they multiply.
        </p>
      </div>

      {/* Interactive: Sensitivity Playground */}
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Sensitivity Playground</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 1rem' }}>
          Drag the two sliders to see how metric variance and desired effect size trade off against required sample size. Try the e-commerce preset to see why revenue-per-user experiments need millions of users.
        </p>

        {/* CV slider */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
            Metric CV (coefficient of variation): <strong style={{ color: cv > 300 ? 'var(--red)' : cv > 150 ? 'var(--yellow)' : 'var(--green)' }}>{cv}%</strong>
          </label>
          <input type='range' min={50} max={500} step={10} value={cv} onChange={function(e) { setCv(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--green)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <span>50% (binary metric)</span>
            <span>500% (revenue)</span>
          </div>
        </div>

        {/* MDE slider */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
            Desired MDE (minimum detectable effect): <strong style={{ color: mde < 1 ? 'var(--red)' : mde < 2 ? 'var(--yellow)' : 'var(--green)' }}>{mde}%</strong>
          </label>
          <input type='range' min={0.5} max={5} step={0.1} value={mde} onChange={function(e) { setMde(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--green)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <span>0.5% (tiny effect)</span>
            <span>5% (large effect)</span>
          </div>
        </div>

        {/* Preset button */}
        <button onClick={function() { setCv(375); setMde(2); setTriedPreset(true); }} style={{ marginBottom: '1rem', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
          Preset: Typical e-commerce RPU (CV=375%, MDE=2%)
        </button>

        {/* Result display */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Required sample size per arm (80% power)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: nPerArm > 1000000 ? 'var(--red)' : nPerArm > 100000 ? 'var(--yellow)' : 'var(--green)', marginBottom: '0.4rem' }}>
            {formatN(nPerArm)} users
          </div>

          {/* SVG progress bar */}
          <svg viewBox={'0 0 ' + (barWidth + 20) + ' ' + (barHeight + 8)} width='100%' style={{ maxWidth: '300px', display: 'block' }}>
            <rect x={0} y={4} width={barWidth} height={barHeight} rx={6} fill='var(--surface)' stroke='var(--border)' strokeWidth={1} />
            <rect x={0} y={4} width={Math.max(barFill * barWidth, 4)} height={barHeight} rx={6} fill={nPerArm > 1000000 ? 'var(--red)' : nPerArm > 100000 ? 'var(--yellow)' : 'var(--green)'} opacity={0.7} />
            <text x={barWidth + 8} y={barHeight / 2 + 8} fill='var(--text-muted)' fontSize={9} textAnchor='start'>5M cap</text>
          </svg>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Total needed (both arms): <strong>{formatN(totalNeeded)}</strong> | At 50K users/day: <strong>{weeksNeeded} weeks</strong>
          </div>
        </div>

        {/* Discovery nudge */}
        {triedPreset && (
          <div className='pal-reveal-in' style={{ background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--yellow)', lineHeight: 1.55 }}>
            At CV=375% and MDE=2%, you need {formatN(Math.ceil((16 * 3.75 * 3.75) / (0.02 * 0.02)))} users per arm. For a site with 50K daily users, that is {(Math.ceil((16 * 3.75 * 3.75) / (0.02 * 0.02)) * 2 / 50000 / 7).toFixed(0)} weeks. Now try switching to a conversion metric (CV~100%, MDE=2%) and see the difference.
          </div>
        )}
      </div>

      {/* Section 3: Framework */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Sensitivity Ladder</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Before locking a primary metric for any experiment, run the sample size calculation. If the required sample exceeds what your product can generate in a reasonable window (typically 2-4 weeks), move down the sensitivity ladder: find a more proximal, lower-variance metric that you believe is causally linked to the high-variance outcome. Use the sensitive metric as the primary to make ship decisions fast, and validate the revenue or LTV link via a longer holdout or cohort analysis after shipping.
        </p>
      </div>

      {/* Section 4: Quick Check */}
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
            <strong>{selected === Q.correct ? '✓ Correct. ' : '✗ Not quite. '}</strong>{Q.explanation}
          </div>
        )}
      </div>

      {/* Section 5: Key Takeaway */}
      <InsightBox label='Key Takeaway' color='var(--green)' bg='var(--green-bg)' border='var(--green-border)'>{module.keyInsight}</InsightBox>
      <InsightBox label='Connects to Experiments' color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)'>{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}

// ─── Module 9: Funnel Metrics ─────────────────────────────────────────────────

const FUNNEL_SCENARIOS = {
  baseline: [10000, 4200, 2100, 1600, 900],
  emailbug: [10000, 4200, 2100, 840, 900],
  trafficquality: [10000, 2100, 2100, 1600, 900],
};

const FUNNEL_STEP_NAMES = ['Visit', 'Signup click', 'Form complete', 'Email verify', 'Profile done'];

const MF09_MCQ = {
  question: 'In the baseline funnel, which step has the largest absolute user loss?',
  options: [
    'Visit → Signup click (5,800 users lost)',
    'Signup click → Form complete (2,100 users lost)',
    'Form complete → Email verify (500 users lost)',
    'Email verify → Profile done (700 users lost)',
  ],
  correct: 'Visit → Signup click (5,800 users lost)',
  explanation: 'Visit to Signup click loses 5,800 users in absolute terms — that is the largest single-step drop. Signup click to Form complete loses 2,100. End-to-end conversion fixation misses this; the largest absolute loss is always the priority.',
};

function Module_MF09({ module, onNext }) {
  const saved09 = useMemo(function() { return loadMFState('mf09'); }, []);
  const [scenario, setScenario] = useState(function() { return saved09 && saved09.scenario ? saved09.scenario : 'baseline'; });
  const [selected, setSelected] = useState(function() { return saved09 ? saved09.selected : null; });
  const [revealed, setRevealed] = useState(function() { return saved09 ? saved09.revealed : false; });

  useEffect(function() {
    saveMFState('mf09', { scenario: scenario, selected: selected, revealed: revealed });
  }, [scenario, selected, revealed]);

  const counts = FUNNEL_SCENARIOS[scenario];
  const maxCount = counts[0];

  const biggestDropIdx = counts.reduce(function(bestIdx, _val, i) {
    if (i === 0) return bestIdx;
    const drop = counts[i - 1] - counts[i];
    const bestDrop = counts[bestIdx - 1] - counts[bestIdx];
    return drop > bestDrop ? i : bestIdx;
  }, 1);

  const biggestDropPct = Math.round(((counts[biggestDropIdx - 1] - counts[biggestDropIdx]) / counts[biggestDropIdx - 1]) * 100);

  function handleCheck() {
    if (selected !== null) setRevealed(true);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          The growth team is panicking. Signup completion rate dropped from 62% to 41% over the past two weeks, and the CEO mentioned it in the all-hands. The PM asks you to investigate. You pull the end-to-end number and confirm the drop — but the end-to-end rate is useless for diagnosis. It tells you that something broke, not where.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          Funnel analysis replaces one opaque number with a sequence of step-to-step conversion rates. A drop at step 1 (landing page to click) points to traffic quality or messaging. A drop at step 3 (email verification) points to a deliverability bug. A drop at step 5 (first action) points to a confusing empty state. Same symptom — &quot;signups are down&quot; — but three completely different root causes and fixes. The interactive funnel below lets you see how different failure patterns produce different shapes.
        </p>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
        Funnel analysis is how analysts find where value is lost in a multi-step flow. The end-to-end conversion rate is almost never the right number to report — the step-to-step drop rate is. Switch between scenarios below and watch how the pattern of loss shifts.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '-1rem' }}>Try It: Explore the Funnel</div>
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Click a scenario to load it into the funnel — observe which step shows the largest drop and how the highlighted step changes between scenarios.
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[
            { key: 'baseline', label: 'Baseline' },
            { key: 'emailbug', label: 'Email bug (verify drops 60%)' },
            { key: 'trafficquality', label: 'Traffic quality issue (click drops 50%)' },
          ].map(function(s) {
            return (
              <button
                key={s.key}
                onClick={function() { setScenario(s.key); }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid ' + (scenario === s.key ? 'var(--green)' : 'var(--border)'),
                  background: scenario === s.key ? 'var(--green-bg)' : 'var(--surface)',
                  color: scenario === s.key ? 'var(--green)' : 'var(--text-muted)',
                  fontWeight: scenario === s.key ? 700 : 400,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >{s.label}</button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {FUNNEL_STEP_NAMES.map(function(name, i) {
            const pct = Math.round((counts[i] / maxCount) * 100);
            const dropPct = i > 0 ? Math.round(((counts[i - 1] - counts[i]) / counts[i - 1]) * 100) : null;
            const isWorstDrop = i === biggestDropIdx;
            return (
              <div key={name}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', width: '100px', flexShrink: 0 }}>{name}</div>
                  <div style={{ flex: 1, background: 'var(--surface-2, var(--border))', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
                    <div style={{
                      width: pct + '%',
                      height: '100%',
                      background: isWorstDrop ? 'var(--red)' : 'var(--green)',
                      borderRadius: '4px',
                      transition: 'width 0.35s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600, width: '52px', flexShrink: 0, textAlign: 'right' }}>
                    {counts[i].toLocaleString()}
                  </div>
                  {dropPct !== null && (
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isWorstDrop ? 'var(--red)' : 'var(--text-muted)',
                      width: '56px',
                      flexShrink: 0,
                      textAlign: 'right',
                    }}>
                      -{dropPct}%
                    </div>
                  )}
                  {dropPct === null && <div style={{ width: '56px', flexShrink: 0 }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        background: 'var(--yellow-bg)',
        border: '1.5px solid var(--yellow-border)',
        borderRadius: 'var(--radius)',
        padding: '0.85rem 1.1rem',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.55,
      }}>
        <strong style={{ color: 'var(--yellow)' }}>Biggest drop: </strong>
        {FUNNEL_STEP_NAMES[biggestDropIdx - 1]} to {FUNNEL_STEP_NAMES[biggestDropIdx]} — {biggestDropPct}% falloff. This is where to focus first.
      </div>

      <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
        Switch between scenarios and notice how the pattern of drop changes. Traffic quality issues appear at step 1; product bugs appear mid-funnel.
      </div>

      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>{MF09_MCQ.question}</div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Select the answer that correctly identifies the step with the largest absolute user loss in the baseline funnel, then click Check answer.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
          {MF09_MCQ.options.map(function(opt) {
            return (
              <MCQOption
                key={opt}
                label={opt}
                selected={selected === opt}
                correct={opt === MF09_MCQ.correct}
                revealed={revealed}
                onClick={function() { if (!revealed) setSelected(opt); }}
              />
            );
          })}
        </div>
        {!revealed && (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selected !== null ? 'var(--green)' : 'var(--border)',
              color: selected !== null ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: selected !== null ? 'pointer' : 'default',
            }}
          >Check answer</button>
        )}
        {revealed && (
          <div className="pal-reveal-in" style={{
            marginTop: '0.75rem',
            background: selected === MF09_MCQ.correct ? 'var(--green-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (selected === MF09_MCQ.correct ? 'var(--green-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
          }}>
            <strong>{selected === MF09_MCQ.correct ? 'Correct. ' : 'Not quite. '}</strong>{MF09_MCQ.explanation}
          </div>
        )}
      </div>

      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} label="Complete module →" />
    </div>
  );
}

// ─── Module 10: Ratio Metrics in Depth ───────────────────────────────────────

const MF10_MCQ = {
  question: 'Overall conversion rate fell from 3.2% to 2.8%. Mobile conversion is 2.0% (unchanged). Desktop conversion is 5.0% (unchanged). What happened?',
  options: [
    'There is a measurement error — both segment rates are unchanged so overall cannot fall',
    'Mobile traffic share grew — mix shift pulled the overall rate down even though both segments are healthy',
    'Desktop conversion must have actually fallen; the data is inconsistent',
    'The denominator shrank, which mechanically reduced the overall rate',
  ],
  correct: 'Mobile traffic share grew — mix shift pulled the overall rate down even though both segments are healthy',
  explanation: 'This is a textbook mix shift (Simpson\'s Paradox). Mobile converts at 2% and desktop at 5%. If the share of mobile sessions grows, the weighted average falls — even with zero change inside either segment. Always check the denominator composition before diagnosing a conversion drop.',
};

function Module_MF10({ module, onNext }) {
  const saved10 = useMemo(function() { return loadMFState('mf10'); }, []);
  const [mobileSessions, setMobileSessions] = useState(function() { return saved10 && saved10.mobileSessions !== undefined ? saved10.mobileSessions : 6000; });
  const [mobileRPS, setMobileRPS] = useState(function() { return saved10 && saved10.mobileRPS !== undefined ? saved10.mobileRPS : 1.20; });
  const [desktopSessions, setDesktopSessions] = useState(function() { return saved10 && saved10.desktopSessions !== undefined ? saved10.desktopSessions : 4000; });
  const [desktopRPS, setDesktopRPS] = useState(function() { return saved10 && saved10.desktopRPS !== undefined ? saved10.desktopRPS : 3.50; });
  const [selected, setSelected] = useState(function() { return saved10 ? saved10.selected : null; });
  const [revealed, setRevealed] = useState(function() { return saved10 ? saved10.revealed : false; });

  useEffect(function() {
    saveMFState('mf10', { mobileSessions: mobileSessions, mobileRPS: mobileRPS, desktopSessions: desktopSessions, desktopRPS: desktopRPS, selected: selected, revealed: revealed });
  }, [mobileSessions, mobileRPS, desktopSessions, desktopRPS, selected, revealed]);

  const totalSessions = mobileSessions + desktopSessions;
  const totalRevenue = mobileSessions * mobileRPS + desktopSessions * desktopRPS;
  const overallRPS = totalSessions > 0 ? totalRevenue / totalSessions : 0;
  const mobilePct = totalSessions > 0 ? Math.round((mobileSessions / totalSessions) * 100) : 0;
  const isMixWarning = mobilePct > 70;

  function applyPreset() {
    setMobileSessions(8500);
    setDesktopSessions(4000);
    setMobileRPS(1.20);
    setDesktopRPS(3.50);
  }

  function handleCheck() {
    if (selected !== null) setRevealed(true);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Thursday afternoon revenue review. The CFO pulls up the weekly dashboard and points at a chart: &quot;Revenue per session is down 12% month-over-month. What happened?&quot; The room tenses. The product team shipped nothing that should have affected monetization. Ad pricing hasn&apos;t changed. The content team hasn&apos;t touched the paywall. So where did 12% go?
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          Revenue per session is a ratio. And ratios lie when the denominator composition shifts. If a viral social campaign brought in 3x more mobile users this month — users who browse but rarely purchase — the per-session revenue drops even though desktop monetization is unchanged. The numerator (total revenue) might even be up. The denominator (total sessions) just grew faster, and the new sessions came from a lower-monetizing segment. The explorer below lets you manipulate the mix and watch this happen in real time.
        </p>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
        Every ratio metric has three levers: numerator movement, denominator movement, and mix shift. A rate can fall even when every individual segment improves — if the mix shifts toward lower-converting segments. Use the explorer below to see this live.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '-1rem' }}>Try It: Decompose Revenue per Session</div>
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Revenue per Session decomposition</div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Drag the sliders to adjust session counts and revenue per session for each platform — watch the overall RPSession update in real time and notice when a mix shift drives it down.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Mobile sessions: <strong style={{ color: 'var(--text)' }}>{mobileSessions.toLocaleString()}</strong>
            </label>
            <input
              type="range"
              min="1000"
              max="9000"
              step="100"
              value={mobileSessions}
              onChange={function(e) { setMobileSessions(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: 'var(--green)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Mobile RPSession: <strong style={{ color: 'var(--text)' }}>${mobileRPS.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="0.50"
              max="3.00"
              step="0.05"
              value={mobileRPS}
              onChange={function(e) { setMobileRPS(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: 'var(--green)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Desktop sessions: <strong style={{ color: 'var(--text)' }}>{desktopSessions.toLocaleString()}</strong>
            </label>
            <input
              type="range"
              min="1000"
              max="9000"
              step="100"
              value={desktopSessions}
              onChange={function(e) { setDesktopSessions(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Desktop RPSession: <strong style={{ color: 'var(--text)' }}>${desktopRPS.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="1.00"
              max="6.00"
              step="0.10"
              value={desktopRPS}
              onChange={function(e) { setDesktopRPS(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--surface-2, var(--surface))', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total sessions</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>{totalSessions.toLocaleString()}</div>
          </div>
          <div style={{ background: 'var(--surface-2, var(--surface))', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Overall RPSession</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--green)' }}>${overallRPS.toFixed(2)}</div>
          </div>
          <div style={{ background: isMixWarning ? 'var(--yellow-bg)' : 'var(--surface-2, var(--surface))', border: '1.5px solid ' + (isMixWarning ? 'var(--yellow-border)' : 'var(--border)'), borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: isMixWarning ? 'var(--yellow)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Mobile share</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isMixWarning ? 'var(--yellow)' : 'var(--text)' }}>{mobilePct}%</div>
          </div>
        </div>

        {isMixWarning && (
          <div className="pal-reveal-in" style={{ fontSize: '0.83rem', color: 'var(--yellow)', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.9rem', lineHeight: 1.55 }}>
            Mix shift — mobile is dominating; RPSession will fall even if both segments improve.
          </div>
        )}

        <div style={{ marginTop: '0.85rem' }}>
          <button
            onClick={applyPreset}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--accent-border)',
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >Add mobile users (preset)</button>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.6rem' }}>Sets mobile to 8,500; desktop stays. Watch overall RPSession fall.</span>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>{MF10_MCQ.question}</div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Select the answer that explains how overall conversion can fall even when both segment rates are unchanged, then click Check answer.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
          {MF10_MCQ.options.map(function(opt) {
            return (
              <MCQOption
                key={opt}
                label={opt}
                selected={selected === opt}
                correct={opt === MF10_MCQ.correct}
                revealed={revealed}
                onClick={function() { if (!revealed) setSelected(opt); }}
              />
            );
          })}
        </div>
        {!revealed && (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selected !== null ? 'var(--green)' : 'var(--border)',
              color: selected !== null ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: selected !== null ? 'pointer' : 'default',
            }}
          >Check answer</button>
        )}
        {revealed && (
          <div className="pal-reveal-in" style={{
            marginTop: '0.75rem',
            background: selected === MF10_MCQ.correct ? 'var(--green-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (selected === MF10_MCQ.correct ? 'var(--green-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
          }}>
            <strong>{selected === MF10_MCQ.correct ? 'Correct. ' : 'Not quite. '}</strong>{MF10_MCQ.explanation}
          </div>
        )}
      </div>

      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} label="Complete module →" />
    </div>
  );
}

// ─── Module 11: Composite Metrics ────────────────────────────────────────────

function Module_MF11({ module, onNext }) {
  const saved11 = useMemo(function() { return loadMFState('mf11'); }, []);
  const [wA, setWA] = useState(function() { return saved11 && saved11.wA !== undefined ? saved11.wA : 40; });
  const [wB, setWB] = useState(function() { return saved11 && saved11.wB !== undefined ? saved11.wB : 35; });
  const [wC, setWC] = useState(function() { return saved11 && saved11.wC !== undefined ? saved11.wC : 25; });
  const [answer, setAnswer] = useState(function() { return saved11 && saved11.answer !== undefined ? saved11.answer : null; });
  const [revealed, setRevealed] = useState(function() { return saved11 ? saved11.revealed : false; });

  useEffect(function() {
    saveMFState('mf11', { wA: wA, wB: wB, wC: wC, answer: answer, revealed: revealed });
  }, [wA, wB, wC, answer, revealed]);

  // Three component metrics with fixed underlying values
  // A: Engagement (score 0-100, currently 72)
  // B: Retention (score 0-100, currently 58)
  // C: Revenue efficiency (score 0-100, currently 81)
  var valA = 72; var valB = 58; var valC = 81;

  // Composite = weighted average, normalized to 0-100
  var totalW = wA + wB + wC;
  var composite = totalW > 0 ? ((wA * valA + wB * valB + wC * valC) / (totalW * 100)) * 100 : 0;
  var compositeDisplay = Math.round(composite * 10) / 10;

  var mcqOptions = [
    { label: 'A. Composite metrics introduce double-counting — if components are correlated, the composite overstates their combined signal.', correct: false },
    { label: 'B. A component metric can quietly degrade while the composite stays flat — the composite masks individual signal.', correct: true },
    { label: 'C. Teams optimizing for the composite learn to move the highest-weight component and neglect the rest, gaming the OEC without real improvement.', correct: false },
    { label: 'D. They require more statistical samples than individual metrics.', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your experimentation team just wrapped an A/B test on a new homepage layout. The results are mixed: engagement (session depth, clicks) went up 4.2%. But D14 retention dipped 1.8%. Revenue per user is flat. The PM wants to ship because engagement moved. The retention lead wants to hold because retention is harder to recover. The debate has been going on for two days with no resolution.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          This is the exact situation where composite metrics earn their value. Instead of arguing about which single metric should win, the team pre-commits to an Overall Evaluation Criterion (OEC) that weights engagement, retention, and revenue into a single number. If the OEC is positive, ship. If not, hold. The debate shifts from subjective opinion to objective threshold. But composites come with a serious structural risk — and the exercise below will show you exactly what it is.
        </p>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
        A composite metric (or Overall Evaluation Criterion, OEC) combines multiple signals into one
        number to simplify ship decisions when individual metrics conflict. Microsoft\'s experimentation
        team pioneered this for cases where no single metric tells the full story.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '-1rem' }}>Try It: Build an OEC</div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
          Build your OEC — adjust component weights
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Drag each weight slider to redistribute how much each component contributes to the OEC score — watch what happens to the composite when you underweight retention.
        </div>

        {[
          { label: 'Engagement score', val: valA, w: wA, setter: setWA, color: 'var(--accent)' },
          { label: 'Retention score', val: valB, w: wB, setter: setWB, color: 'var(--teal)' },
          { label: 'Revenue efficiency', val: valC, w: wC, setter: setWC, color: 'var(--green)' },
        ].map(function(metric) {
          return (
            <div key={metric.label} style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>{metric.label}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Value: <strong style={{ color: metric.color }}>{metric.val}</strong> &nbsp;|&nbsp; Weight: <strong>{metric.w}%</strong></span>
              </div>
              <input
                type="range" min={0} max={80} step={5}
                value={metric.w}
                onChange={function(e) { metric.setter(parseInt(e.target.value, 10)); }}
                style={{ width: '100%', accentColor: metric.color }}
              />
            </div>
          );
        })}

        <div style={{ marginTop: '0.5rem', padding: '0.85rem 1rem', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>OEC Score</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>{compositeDisplay}</span>
        </div>

        {wB < 15 && (
          <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--red)', lineHeight: 1.45 }}>
            Warning: Retention weight is low. A feature that tanks retention could still show a positive OEC score — the OEC is now masking a critical signal.
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Use composites when', items: ['Multiple metrics conflict at ship decision', 'You need a single OKR to align teams', 'Component importance is stable and agreed-upon'] },
          { label: 'Avoid composites when', items: ['Individual metric health matters independently', 'Weights are politically negotiated post-hoc', 'A component could degrade catastrophically'] },
        ].map(function(card) {
          return (
            <div key={card.label} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>{card.label}</div>
              {card.items.map(function(item, i) {
                return <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '0.2rem' }}>{item}</div>;
              })}
            </div>
          );
        })}
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
          What is the primary risk of using a composite metric as your primary experiment decision criterion?
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Select the answer that best identifies the structural weakness of composite metrics, then click Check.
        </div>

        {mcqOptions.map(function(opt, i) {
          var sel = answer === i;
          var bg = 'var(--surface-2)';
          var border = 'var(--border)';
          var color = 'var(--text)';
          if (revealed) {
            if (opt.correct) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
            else if (sel) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
          } else if (sel) { border = 'var(--accent-border)'; }
          return (
            <button key={i} onClick={function() { if (!revealed) setAnswer(i); }} disabled={revealed}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', marginBottom: '0.5rem', background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)', color: color, fontSize: '0.88rem', cursor: revealed ? 'default' : 'pointer', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          );
        })}

        {answer !== null && !revealed && (
          <button onClick={function() { setRevealed(true); }} style={{ marginTop: '0.5rem', padding: '0.5rem 1.1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Check
          </button>
        )}

        {revealed && (
          <div className="pal-reveal-in">
            <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>
              Composite metrics can mask individual signal. If retention drops 20% but engagement and revenue surge, the OEC may stay flat or even improve — signaling a healthy product when one foundational metric is collapsing. Option A (double-counting) is a real concern when components are correlated, but it is a calibration problem — fixable by choosing orthogonal components or adjusting weights. Option C (gaming) is also real, but it is a secondary risk. The primary structural weakness is masking: a composite hides what its components are individually doing. This is why guardrail metrics exist: to catch what the OEC cannot.
            </div>
            <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>Key Insight</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6 }}>
                A composite metric is only as good as its weights and the independence of its components. Weights that are negotiated politically rather than derived empirically create a metric that can be gamed. And when a team optimizes for the OEC, they optimize away from the individual metrics you actually care about.
              </div>
            </div>
            <button onClick={onNext} className="pal-glow-pulse" style={{ marginTop: '1.5rem', padding: '0.65rem 1.6rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Module 12: Guardrail Metrics ─────────────────────────────────────────────

function Module_MF12({ module, onNext }) {
  const saved12 = useMemo(function() { return loadMFState('mf12'); }, []);
  const [decisions, setDecisions] = useState(function() { return saved12 && saved12.decisions ? saved12.decisions : {}; });
  const [explanations, setExplanations] = useState(function() { return saved12 && saved12.explanations ? saved12.explanations : {}; });
  const [answer, setAnswer] = useState(function() { return saved12 && saved12.answer !== undefined ? saved12.answer : null; });
  const [revealed, setRevealed] = useState(function() { return saved12 ? saved12.revealed : false; });
  var scenariosCount = 4;
  const [allDone, setAllDone] = useState(function() { return saved12 && saved12.decisions ? Object.keys(saved12.decisions).length >= scenariosCount : false; });

  useEffect(function() {
    saveMFState('mf12', { decisions: decisions, explanations: explanations, answer: answer, revealed: revealed });
  }, [decisions, explanations, answer, revealed]);

  var scenarios = [
    {
      id: 's1',
      primary: '+3.2% DAU',
      guardrail: 'Page load time +180ms (threshold: +100ms)',
      breached: true,
      ship: false,
      explanation: 'Guardrail breached — do not ship. A 180ms load time regression affects user experience for the entire user base. The DAU gain does not justify degrading performance beyond the pre-committed threshold.',
    },
    {
      id: 's2',
      primary: '+1.8% session length',
      guardrail: 'Crash rate unchanged',
      breached: false,
      ship: true,
      explanation: 'Ship. Primary metric positive, guardrail healthy. This is a clean win.',
    },
    {
      id: 's3',
      primary: '+5.1% revenue',
      guardrail: 'Support ticket volume +22% (threshold: +10%)',
      breached: true,
      ship: false,
      explanation: 'Do not ship. Revenue gain driven by user confusion generates downstream costs and erodes trust. The guardrail exists precisely to catch this pattern.',
    },
    {
      id: 's4',
      primary: 'Neutral (0.1%, not significant)',
      guardrail: 'All guardrails healthy',
      breached: false,
      ship: false,
      explanation: 'Do not ship — primary metric neutral. Shipping a neutral result consumes engineering maintenance overhead for no measured user benefit. Wait for a stronger signal or iterate.',
    },
  ];

  function decide(sid, shipDecision) {
    if (decisions[sid] !== undefined) return;
    var s = scenarios.find(function(sc) { return sc.id === sid; });
    var correct = shipDecision === s.ship;
    setDecisions(function(prev) { var n = Object.assign({}, prev); n[sid] = shipDecision; return n; });
    setExplanations(function(prev) { var n = Object.assign({}, prev); n[sid] = { correct: correct, text: s.explanation }; return n; });
    var allDecided = scenarios.every(function(sc) { return sc.id === sid || decisions[sc.id] !== undefined; });
    if (allDecided) { setAllDone(true); }
  }

  var mcqOptions = [
    { label: 'A. So the team has time to instrument the guardrail metric before running the experiment.', correct: false },
    { label: 'B. Because pre-commitment removes the ability to renegotiate the threshold after seeing results — preventing p-hacking the guardrail.', correct: true },
    { label: 'C. Legal compliance requires pre-registration of all experiment metrics.', correct: false },
    { label: 'D. Post-hoc guardrails are more accurate because they account for the actual experiment data.', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Ship decision meeting, Thursday 4pm. The experiment results are on the screen. The primary metric — DAU — is up 3.2%. The PM is ready to ship. Then the infrastructure lead speaks up: &quot;Page load time regressed 180ms. Our pre-committed threshold was 100ms.&quot; The room splits. Half the team argues the DAU gain justifies the latency hit. The other half says a guardrail breach means the feature does not ship, period, no matter how good the primary metric looks.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          This is the moment guardrail metrics are designed for. They are not informational — they are a veto. A team that renegotiates guardrails after seeing results has no guardrails at all. The scenarios below test whether you can make the right ship/hold call when the primary metric and guardrails tell different stories.
        </p>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
        Guardrail metrics are the metrics a team commits to <em>not degrading</em> before an experiment launches.
        They act as a veto on the primary metric — if the primary wins but a guardrail is breached, the
        feature does not ship. Their power comes entirely from pre-commitment.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '-1rem' }}>Try It: Ship or Hold?</div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
          Ship or no ship? Click your decision for each scenario.
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> For each scenario, decide whether to ship or hold — click your decision to see if it matches the correct call and why.
        </div>

        {scenarios.map(function(s) {
          var dec = decisions[s.id];
          var exp = explanations[s.id];
          return (
            <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid ' + (exp ? (exp.correct ? 'var(--teal-border)' : 'var(--red-border)') : 'var(--border)'), borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '0.65rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Primary metric</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 600 }}>{s.primary}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: s.breached ? 'var(--red)' : 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Guardrail</div>
                  <div style={{ fontSize: '0.85rem', color: s.breached ? 'var(--red)' : 'var(--text-muted)' }}>{s.guardrail}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[true, false].map(function(shipVal) {
                  var isSelected = dec === shipVal;
                  var label = shipVal ? 'Ship' : 'Do not ship';
                  var bg = 'var(--surface-2)';
                  var color = 'var(--text-muted)';
                  if (isSelected && !exp) { bg = 'var(--accent-bg)'; color = 'var(--accent)'; }
                  if (exp && isSelected) { bg = exp.correct ? 'var(--teal)' : 'var(--red)'; color = '#fff'; }
                  return (
                    <button key={String(shipVal)} onClick={function() { decide(s.id, shipVal); }}
                      disabled={dec !== undefined}
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem', fontWeight: 600, background: bg, color: color, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: dec !== undefined ? 'default' : 'pointer' }}>
                      {label}
                    </button>
                  );
                })}
              </div>
              {exp && (
                <div className="pal-reveal-in" style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {exp.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allDone && (
        <div className="pal-reveal-in">
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
            Why must guardrail thresholds be pre-committed before an experiment launches?
          </div>
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            <strong>What to do:</strong> Select the answer that explains why pre-commitment matters for guardrails, then click Check.
          </div>

          {mcqOptions.map(function(opt, i) {
            var sel = answer === i;
            var bg = 'var(--surface-2)'; var border = 'var(--border)'; var color = 'var(--text)';
            if (revealed) {
              if (opt.correct) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
              else if (sel) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
            } else if (sel) { border = 'var(--accent-border)'; }
            return (
              <button key={i} onClick={function() { if (!revealed) setAnswer(i); }} disabled={revealed}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', marginBottom: '0.5rem', background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)', color: color, fontSize: '0.88rem', cursor: revealed ? 'default' : 'pointer', transition: 'all 0.15s' }}>
                {opt.label}
              </button>
            );
          })}

          {answer !== null && !revealed && (
            <button onClick={function() { setRevealed(true); }} style={{ marginTop: '0.5rem', padding: '0.5rem 1.1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              Check
            </button>
          )}

          {revealed && (
            <div className="pal-reveal-in">
              <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>
                Post-hoc guardrail negotiation is the most common form of p-hacking in enterprise experimentation. If a team can adjust the threshold after seeing results, the guardrail provides no actual protection — it becomes a rubber stamp on whatever the team wanted to ship. Pre-commitment is the mechanism that gives guardrails their teeth.
              </div>
              <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>Key Insight</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6 }}>
                  Guardrail metrics are a governance mechanism, not just a technical one. A team that consistently renegotiates guardrails post-experiment is signaling that shipping velocity is prioritized over product health. Senior interviewers test whether you understand this distinction.
                </div>
              </div>
              <button onClick={onNext} className="pal-glow-pulse" style={{ marginTop: '1.5rem', padding: '0.65rem 1.6rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Module 13: Metric Sensitivity ───────────────────────────────────────────

function Module_MF13({ module, onNext }) {
  const saved13 = useMemo(function() { return loadMFState('mf13'); }, []);
  const [cv, setCv] = useState(function() { return saved13 && saved13.cv !== undefined ? saved13.cv : 1.2; });
  const [answer, setAnswer] = useState(function() { return saved13 && saved13.answer !== undefined ? saved13.answer : null; });
  const [revealed, setRevealed] = useState(function() { return saved13 ? saved13.revealed : false; });

  useEffect(function() {
    saveMFState('mf13', { cv: cv, answer: answer, revealed: revealed });
  }, [cv, answer, revealed]);

  // Sample size approximation: n ~ (z_alpha + z_beta)^2 * sigma^2 / delta^2
  // Simplified: n ~ CV^2 * constant (holding delta/mean fixed)
  // Base case: cv=0.5 gives n=250, cv=2.0 gives n=4000
  var baseN = 250;
  var sampN = Math.round(baseN * (cv / 0.5) * (cv / 0.5));

  // SVG for distribution visualization
  var W = 420; var H = 100;
  var padL = 10; var padR = 10; var padT = 10; var padB = 20;
  var innerW = W - padL - padR; var innerH = H - padT - padB;

  // Draw approximate normal distribution curve for given CV
  var pts = 60;
  function gauss(x, sigma) {
    return Math.exp(-0.5 * (x / sigma) * (x / sigma));
  }

  function makeCurvePath(sigma) {
    var result = [];
    for (var i = 0; i < pts; i++) {
      var t = i / (pts - 1);
      var x = -3 + t * 6;
      var y = gauss(x, sigma);
      var svgX = padL + t * innerW;
      var svgY = padT + innerH - y * innerH * 0.88;
      result.push((i === 0 ? 'M' : 'L') + ' ' + svgX + ' ' + svgY);
    }
    return result.join(' ');
  }

  var narrowPath = makeCurvePath(0.8);
  var widePath = makeCurvePath(cv);

  var mcqOptions = [
    { label: 'A. Revenue per user — because it is the most important business metric.', correct: false },
    { label: 'B. Click-through rate — it has lower variance relative to its mean, making small effects detectable with fewer users.', correct: true },
    { label: 'C. Revenue per user — because it directly measures monetization impact.', correct: false },
    { label: 'D. Session length — because it is correlated with engagement.', correct: false },
  ];

  var cvLabel = Math.round(cv * 10) / 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── The Scenario ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          You&apos;re designing the measurement plan for a new recommendation engine experiment. The PM wants to use revenue per user as the primary metric — &quot;it&apos;s the metric leadership cares about.&quot; You pull historical data and run a power analysis. At the expected 3% lift, revenue per user requires 480,000 users per arm. At current traffic, that is a 14-week experiment. The PM&apos;s face falls. &quot;We can&apos;t hold a test for 14 weeks. Is there another option?&quot;
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          There is — but it requires understanding why some metrics are cheap to experiment with and others are expensive. The answer is variance. Revenue per user has a massive coefficient of variation because a handful of whales generate 50x the revenue of a typical user. Click-through rate, by contrast, is binary (0 or 1) with variance bounded by p*(1-p). The same 3% lift can be detected with 50x fewer users on CTR than on revenue. The slider below lets you see this relationship directly.
        </p>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
        Metric sensitivity determines how quickly an experiment can detect a real effect. A metric
        with high variance relative to its mean (high CV = SD / mean) requires far more samples to
        detect the same lift. This is why revenue per user is notoriously expensive to experiment
        with — a small number of high spenders creates extreme variance.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '-1rem' }}>Try It: Adjust the Variance</div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
          Adjust coefficient of variation (CV) — watch sample size requirements change
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Drag the CV slider to adjust the coefficient of variation — watch how the required sample size changes as the metric becomes noisier or more precise.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 600 }}>CV (SD / mean)</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)' }}>{cvLabel}</span>
            </div>
            <input type="range" min={0.3} max={3.0} step={0.1} value={cv}
              onChange={function(e) { setCv(parseFloat(e.target.value)); }}
              style={{ width: '100%', accentColor: 'var(--accent)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              <span>0.3 (low)</span><span>3.0 (high)</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.85rem', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Required sample size</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{sampN.toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per arm, to detect 5% lift</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textAlign: 'center' }}>Distribution width at CV = {cvLabel}</div>
          <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" style={{ display: 'block' }}>
            <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
            <path d={narrowPath} fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
            <path d={widePath} fill="none" stroke="var(--accent)" strokeWidth="2" />
            <text x={padL + 8} y={padT + 16} fontSize="9" fill="var(--teal)" opacity="0.8">Low CV (reference)</text>
            <text x={padL + 8} y={padT + 30} fontSize="9" fill="var(--accent)" fontWeight="700">CV = {cvLabel}</text>
            <line x1={W / 2} y1={padT} x2={W / 2} y2={padT + innerH} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="8" fill="var(--text-muted)">mean</text>
          </svg>
        </div>

        <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {[
            { metric: 'Click-through rate', cv: '~0.3-0.5', note: 'Most sensitive — binary outcomes' },
            { metric: 'Session length', cv: '~0.8-1.2', note: 'Moderate — right-skewed' },
            { metric: 'Revenue per user', cv: '~1.5-3.5', note: 'Least sensitive — zero-inflated' },
          ].map(function(row) {
            return (
              <div key={row.metric} style={{ padding: '0.5rem 0.7rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.15rem' }}>{row.metric}</div>
                <div>CV: {row.cv}</div>
                <div>{row.note}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
          You are testing a new feature and need to detect a 3% lift. Which metric should you choose as your primary outcome to minimize experiment runtime?
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Select the metric with the lowest coefficient of variation — the one that will detect a 3% lift with the fewest users — then click Check.
        </div>

        {mcqOptions.map(function(opt, i) {
          var sel = answer === i;
          var bg = 'var(--surface-2)'; var border = 'var(--border)'; var color = 'var(--text)';
          if (revealed) {
            if (opt.correct) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
            else if (sel) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
          } else if (sel) { border = 'var(--accent-border)'; }
          return (
            <button key={i} onClick={function() { if (!revealed) setAnswer(i); }} disabled={revealed}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', marginBottom: '0.5rem', background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)', color: color, fontSize: '0.88rem', cursor: revealed ? 'default' : 'pointer', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          );
        })}

        {answer !== null && !revealed && (
          <button onClick={function() { setRevealed(true); }} style={{ marginTop: '0.5rem', padding: '0.5rem 1.1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Check
          </button>
        )}

        {revealed && (
          <div className="pal-reveal-in">
            <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>
              CTR is a binary metric (clicked vs. not clicked) — its variance is determined by p*(1-p), which is tightly bounded. Revenue per user has a long right tail driven by a small number of heavy spenders, making its SD several times its mean. To detect the same 3% lift, you might need 20x more users for revenue vs. CTR.
            </div>
            <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>Key Insight</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6 }}>
                When you cannot change the metric you care about, change what you measure in the experiment. If you must detect a revenue effect but revenue-per-user requires 6 months, find a proxy metric — a leading indicator with lower CV that predicts long-term revenue. CUPED can also reduce effective CV by 30-50%.
              </div>
            </div>
            <button onClick={onNext} className="pal-glow-pulse" style={{ marginTop: '1.5rem', padding: '0.65rem 1.6rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
              Complete module →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Module 14: Cohort Metrics and Retention Curves ─────────────────────────

function Module_MF14({ module, onNext }) {
  var saved14 = useMemo(function() { return loadMFState('mf14'); }, []);
  var [improvement, setImprovement] = useState(function() { return saved14 && saved14.improvement !== undefined ? saved14.improvement : 0; });
  var [seasonal, setSeasonal] = useState(function() { return saved14 && saved14.seasonal !== undefined ? saved14.seasonal : 0; });
  var [sizeWeight, setSizeWeight] = useState(function() { return saved14 && saved14.sizeWeight !== undefined ? saved14.sizeWeight : 50; });
  var [answer14, setAnswer14] = useState(function() { return saved14 && saved14.answer !== undefined ? saved14.answer : null; });
  var [revealed14, setRevealed14] = useState(function() { return saved14 ? saved14.revealed : false; });

  useEffect(function() {
    saveMFState('mf14', { improvement: improvement, seasonal: seasonal, sizeWeight: sizeWeight, answer: answer14, revealed: revealed14 });
  }, [improvement, seasonal, sizeWeight, answer14, revealed14]);

  var cohortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  var periods = ['Week 0', 'Week 1', 'Week 2', 'Week 3'];
  var baseSizes = [1000, 1200, 800, 1500, 900];

  function getRetention(cohortIdx, periodIdx) {
    if (periodIdx === 0) return 100;
    var base = [100, 45, 32, 28][periodIdx];
    var improvementBoost = improvement * cohortIdx * 1.2;
    var seasonalDip = (seasonal > 0 && cohortIdx === 1) ? -seasonal * 8 : 0;
    var val = base + improvementBoost + seasonalDip;
    return Math.max(2, Math.min(100, Math.round(val)));
  }

  function getAggRetention(periodIdx) {
    if (periodIdx === 0) return 100;
    var totalWeighted = 0;
    var totalSize = 0;
    for (var c = 0; c < 5; c++) {
      var size = baseSizes[c] * (1 + (sizeWeight - 50) * 0.02 * (c < 2 ? -1 : 1));
      size = Math.max(100, size);
      totalWeighted += getRetention(c, periodIdx) * size;
      totalSize += size;
    }
    return Math.round(totalWeighted / totalSize);
  }

  function cellColor(val) {
    var intensity = Math.min(1, val / 100);
    var r = Math.round(34 + (1 - intensity) * 180);
    var g = Math.round(139 + (1 - intensity) * 80);
    var b = Math.round(34 + (1 - intensity) * 180);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + (0.15 + intensity * 0.55) + ')';
  }

  var W14 = 400;
  var H14 = 180;
  var cellW = W14 / 5;
  var cellH = H14 / 6;

  var mcq14 = [
    { label: 'A. Aggregate retention is flat — everything is fine, no action needed.', correct: false },
    { label: 'B. The newest cohort\'s D7 is declining — investigate recent changes even though the aggregate looks stable.', correct: true },
    { label: 'C. Focus on the oldest cohort because it has the longest retention history.', correct: false },
    { label: 'D. Wait until aggregate retention actually drops before investigating.', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your product&apos;s D7 retention is reported at 32% and has been flat for three months. The PM says &quot;retention is stable — let&apos;s focus on acquisition.&quot; But when you pull the data by cohort, January users retained at 38% while February dropped to 26%. The aggregate number is hiding a critical trend because cohort sizes are shifting. Bigger recent cohorts with lower retention are diluting the gains from earlier improvements.
        </p>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
        Cohort analysis separates users by when they joined, revealing whether product changes are actually improving retention or whether shifting cohort sizes are masking deterioration. Aggregate retention is a weighted average — it can stay flat while individual cohorts trend in opposite directions.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '-1rem' }}>Try It: Retention Table Explorer</div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Adjust the three sliders to see how product improvements, seasonal effects, and cohort size weighting change the retention table and aggregate numbers.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>Product improvement</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--green)' }}>{improvement}</span>
            </div>
            <input type='range' min={0} max={5} step={1} value={improvement} onChange={function(e) { setImprovement(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--green)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}><span>None</span><span>Strong</span></div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>Seasonal effect</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--yellow)' }}>{seasonal}</span>
            </div>
            <input type='range' min={0} max={3} step={1} value={seasonal} onChange={function(e) { setSeasonal(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--yellow)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}><span>None</span><span>Strong dip (Feb)</span></div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>Cohort size shift</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)' }}>{sizeWeight}</span>
            </div>
            <input type='range' min={0} max={100} step={5} value={sizeWeight} onChange={function(e) { setSizeWeight(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}><span>Older heavier</span><span>Newer heavier</span></div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <svg viewBox={'0 0 ' + W14 + ' ' + H14} width='100%' style={{ display: 'block', minWidth: '320px' }}>
            {periods.map(function(p, pi) {
              return <text key={'ph' + pi} x={cellW * (pi + 1) + cellW * 0.5} y={cellH * 0.65} textAnchor='middle' fontSize='9' fontWeight='700' fill='var(--text-muted)'>{p}</text>;
            })}
            {cohortNames.map(function(c, ci) {
              return <text key={'cl' + ci} x={cellW * 0.5} y={cellH * (ci + 1) + cellH * 0.6} textAnchor='middle' fontSize='9' fontWeight='600' fill='var(--text)'>{c}</text>;
            })}
            {cohortNames.map(function(c, ci) {
              return periods.map(function(p, pi) {
                var val = getRetention(ci, pi);
                return (
                  <g key={'c' + ci + 'p' + pi}>
                    <rect x={cellW * (pi + 1) + 1} y={cellH * (ci + 1) + 1} width={cellW - 2} height={cellH - 2} rx='3' fill={cellColor(val)} />
                    <text x={cellW * (pi + 1) + cellW * 0.5} y={cellH * (ci + 1) + cellH * 0.62} textAnchor='middle' fontSize='10' fontWeight='700' fill='var(--text)'>{val + '%'}</text>
                  </g>
                );
              });
            })}
          </svg>
        </div>

        <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: '0.5rem' }}>
          {periods.map(function(p, pi) {
            var agg = getAggRetention(pi);
            return (
              <div key={'agg' + pi} style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Agg {p}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>{agg + '%'}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
          D7 aggregate retention has been flat at 32% for three months. Cohort-level data shows January at 38% and the most recent cohort at 26%. What should you do?
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Pick the action that best reflects how a cohort-level view should change your response to &quot;flat&quot; aggregate retention.
        </div>

        {mcq14.map(function(opt, i) {
          var sel14 = answer14 === i;
          var bg14 = 'var(--surface-2)'; var brd14 = 'var(--border)'; var col14 = 'var(--text)';
          if (revealed14) {
            if (opt.correct) { bg14 = 'var(--teal-bg)'; brd14 = 'var(--teal-border)'; col14 = 'var(--teal)'; }
            else if (sel14) { bg14 = 'var(--red-bg)'; brd14 = 'var(--red-border)'; col14 = 'var(--red)'; }
          } else if (sel14) { brd14 = 'var(--accent-border)'; }
          return (
            <button key={i} onClick={function() { if (!revealed14) setAnswer14(i); }} disabled={revealed14}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', marginBottom: '0.5rem', background: bg14, border: '1.5px solid ' + brd14, borderRadius: 'var(--radius-sm)', color: col14, fontSize: '0.88rem', cursor: revealed14 ? 'default' : 'pointer', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          );
        })}

        {answer14 !== null && !revealed14 && (
          <button onClick={function() { setRevealed14(true); }} style={{ marginTop: '0.5rem', padding: '0.5rem 1.1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Check
          </button>
        )}

        {revealed14 && (
          <div className='pal-reveal-in'>
            <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: mcq14[answer14] && mcq14[answer14].correct ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (mcq14[answer14] && mcq14[answer14].correct ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>
              Aggregate retention is a weighted average across cohorts. When newer, larger cohorts have worse retention, they pull the aggregate down — masking improvements in older cohorts. Conversely, a flat aggregate can hide deteriorating new-cohort retention if older, better-retaining cohorts still dominate the denominator. Always look at cohort-level trends before concluding retention is &quot;fine.&quot;
            </div>
            <InsightBox label='Key Takeaway' color='var(--green)' bg='var(--green-bg)' border='var(--green-border)'>
              Never trust aggregate retention alone. Decompose by cohort to see whether product changes are actually working. A flat aggregate often hides two opposing trends — improving product quality and deteriorating acquisition quality.
            </InsightBox>
            <NextBtn onClick={onNext}>Complete module &rarr;</NextBtn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Module 15: Engagement Depth ────────────────────────────────────────────

function Module_MF15({ module, onNext }) {
  var saved15 = useMemo(function() { return loadMFState('mf15'); }, []);
  var [dau, setDau] = useState(function() { return saved15 && saved15.dau !== undefined ? saved15.dau : 2000; });
  var [mau, setMau] = useState(function() { return saved15 && saved15.mau !== undefined ? saved15.mau : 8000; });
  var [powerShare, setPowerShare] = useState(function() { return saved15 && saved15.powerShare !== undefined ? saved15.powerShare : 15; });
  var [answer15, setAnswer15] = useState(function() { return saved15 && saved15.answer !== undefined ? saved15.answer : null; });
  var [revealed15, setRevealed15] = useState(function() { return saved15 ? saved15.revealed : false; });

  useEffect(function() {
    saveMFState('mf15', { dau: dau, mau: mau, powerShare: powerShare, answer: answer15, revealed: revealed15 });
  }, [dau, mau, powerShare, answer15, revealed15]);

  var stickiness = mau > 0 ? Math.round((dau / mau) * 1000) / 1000 : 0;
  var avgDaysActive = Math.round(stickiness * 28 * 10) / 10;

  function applyPreset(name) {
    if (name === 'social') { setDau(2500); setMau(5000); setPowerShare(30); }
    if (name === 'utility') { setDau(900); setMau(6000); setPowerShare(8); }
  }

  // Lness distribution: model as a rough exponential decay with a power-user bump
  var lnessBars = [];
  for (var d = 1; d <= 28; d++) {
    var base15 = Math.exp(-0.15 * d) * (1 - powerShare / 100);
    var powerBump = d >= 20 ? (powerShare / 100) * 0.3 * Math.exp(-0.1 * (28 - d)) : 0;
    var pct = (base15 + powerBump) * 100;
    pct = Math.max(0.5, Math.min(50, pct * (stickiness / 0.3)));
    lnessBars.push({ day: d, pct: Math.round(pct * 10) / 10 });
  }
  var maxPct = 0;
  for (var lb = 0; lb < lnessBars.length; lb++) {
    if (lnessBars[lb].pct > maxPct) maxPct = lnessBars[lb].pct;
  }

  var W15 = 420; var H15 = 120;
  var padL15 = 30; var padB15 = 18; var padT15 = 8; var padR15 = 5;
  var innerW15 = W15 - padL15 - padR15;
  var innerH15 = H15 - padT15 - padB15;
  var barW = innerW15 / 28 - 1;

  var mcq15 = [
    { label: 'A. DAU growth proves the product is getting healthier — no concern.', correct: false },
    { label: 'B. DAU is rising from new user acquisition, not deeper engagement — the growth may not be durable.', correct: true },
    { label: 'C. DAU/MAU is a vanity metric — only total DAU matters.', correct: false },
    { label: 'D. The MAU denominator is probably wrong — recheck the tracking.', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Your DAU just crossed 2M and the growth team is celebrating. But when you compute DAU/MAU, it&apos;s only 0.12 — meaning the average user opens the app fewer than 4 days a month. Despite headline DAU growth, the product isn&apos;t getting stickier. You&apos;re adding users faster than you&apos;re deepening engagement. The question: is this sustainable?
        </p>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
        Stickiness (DAU/MAU) measures how many of your monthly users come back on any given day. An app with DAU/MAU of 0.5 means users open it every other day. The Lness distribution shows what percentage of users are active 1, 2, ... 28 days per month — revealing whether engagement is broad and shallow or narrow and deep.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '-1rem' }}>Try It: Stickiness Dashboard</div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Adjust DAU, MAU, and power user share to explore how stickiness changes. Try the presets to compare a social app vs. a utility app.
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={function() { applyPreset('social'); }} style={{ padding: '0.35rem 0.8rem', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--green)', cursor: 'pointer' }}>Healthy social app</button>
          <button onClick={function() { applyPreset('utility'); }} style={{ padding: '0.35rem 0.8rem', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}>Utility app</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>DAU (K)</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)' }}>{dau + 'K'}</span>
            </div>
            <input type='range' min={500} max={3000} step={100} value={dau} onChange={function(e) { setDau(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>MAU (K)</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)' }}>{mau + 'K'}</span>
            </div>
            <input type='range' min={2000} max={10000} step={500} value={mau} onChange={function(e) { setMau(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>Power user share</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--purple)' }}>{powerShare + '%'}</span>
            </div>
            <input type='range' min={5} max={40} step={1} value={powerShare} onChange={function(e) { setPowerShare(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--purple)' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '0.65rem', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase' }}>DAU/MAU</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--green)' }}>{stickiness}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.65rem', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Avg days/month</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)' }}>{avgDaysActive}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.65rem', background: 'var(--purple-bg)', border: '1px solid var(--purple-border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase' }}>Power users</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--purple)' }}>{powerShare + '%'}</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textAlign: 'center' }}>Lness distribution — days active per month</div>
          <svg viewBox={'0 0 ' + W15 + ' ' + H15} width='100%' style={{ display: 'block' }}>
            <line x1={padL15} y1={padT15 + innerH15} x2={W15 - padR15} y2={padT15 + innerH15} stroke='var(--border)' strokeWidth='1' />
            <line x1={padL15} y1={padT15} x2={padL15} y2={padT15 + innerH15} stroke='var(--border)' strokeWidth='1' />
            {lnessBars.map(function(bar, idx) {
              var barH = maxPct > 0 ? (bar.pct / maxPct) * innerH15 : 0;
              var x = padL15 + idx * (innerW15 / 28);
              var y = padT15 + innerH15 - barH;
              var fill = idx >= 19 ? 'var(--purple)' : 'var(--accent)';
              return (
                <g key={'lb' + idx}>
                  <rect x={x + 0.5} y={y} width={barW} height={barH} rx='1' fill={fill} opacity='0.75' />
                  {idx % 7 === 0 ? <text x={x + barW / 2} y={padT15 + innerH15 + 12} textAnchor='middle' fontSize='7' fill='var(--text-muted)'>{bar.day}</text> : null}
                </g>
              );
            })}
            <text x={padL15 - 4} y={padT15 + 6} textAnchor='end' fontSize='7' fill='var(--text-muted)'>{Math.round(maxPct) + '%'}</text>
            <text x={padL15 - 4} y={padT15 + innerH15} textAnchor='end' fontSize='7' fill='var(--text-muted)'>0%</text>
          </svg>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            <span><span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '2px', marginRight: '3px' }}></span>Casual</span>
            <span><span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--purple)', borderRadius: '2px', marginRight: '3px' }}></span>Power users (20+ days)</span>
          </div>
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
          DAU is growing 15% month-over-month, but DAU/MAU has stayed flat at 0.12. What does this most likely indicate?
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Select the interpretation that explains why DAU growth and flat stickiness can coexist — and what it means for product health.
        </div>

        {mcq15.map(function(opt, i) {
          var sel15 = answer15 === i;
          var bg15 = 'var(--surface-2)'; var brd15 = 'var(--border)'; var col15 = 'var(--text)';
          if (revealed15) {
            if (opt.correct) { bg15 = 'var(--teal-bg)'; brd15 = 'var(--teal-border)'; col15 = 'var(--teal)'; }
            else if (sel15) { bg15 = 'var(--red-bg)'; brd15 = 'var(--red-border)'; col15 = 'var(--red)'; }
          } else if (sel15) { brd15 = 'var(--accent-border)'; }
          return (
            <button key={i} onClick={function() { if (!revealed15) setAnswer15(i); }} disabled={revealed15}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', marginBottom: '0.5rem', background: bg15, border: '1.5px solid ' + brd15, borderRadius: 'var(--radius-sm)', color: col15, fontSize: '0.88rem', cursor: revealed15 ? 'default' : 'pointer', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          );
        })}

        {answer15 !== null && !revealed15 && (
          <button onClick={function() { setRevealed15(true); }} style={{ marginTop: '0.5rem', padding: '0.5rem 1.1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Check
          </button>
        )}

        {revealed15 && (
          <div className='pal-reveal-in'>
            <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: mcq15[answer15] && mcq15[answer15].correct ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (mcq15[answer15] && mcq15[answer15].correct ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>
              DAU/MAU staying flat while DAU grows means MAU is growing proportionally — you&apos;re adding users at the top of the funnel but each user&apos;s engagement frequency isn&apos;t changing. The growth is acquisition-driven, not engagement-driven. If acquisition spending slows, DAU growth will stall because you haven&apos;t built a more compelling daily use case.
            </div>
            <InsightBox label='Key Takeaway' color='var(--green)' bg='var(--green-bg)' border='var(--green-border)'>
              DAU/MAU (stickiness) separates acquisition-driven growth from engagement-driven growth. Rising DAU with flat stickiness means you are buying users, not earning habit. The Lness distribution reveals whether your user base is broad-shallow or narrow-deep — both can produce the same DAU/MAU but have very different retention profiles.
            </InsightBox>
            <NextBtn onClick={onNext}>Complete module &rarr;</NextBtn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Module 16: Unit Economics ───────────────────────────────────────────────

function Module_MF16({ module, onNext }) {
  var saved16 = useMemo(function() { return loadMFState('mf16'); }, []);
  var [cac, setCac] = useState(function() { return saved16 && saved16.cac !== undefined ? saved16.cac : 25; });
  var [arpu, setArpu] = useState(function() { return saved16 && saved16.arpu !== undefined ? saved16.arpu : 8; });
  var [lifetime, setLifetime] = useState(function() { return saved16 && saved16.lifetime !== undefined ? saved16.lifetime : 12; });
  var [margin, setMargin] = useState(function() { return saved16 && saved16.margin !== undefined ? saved16.margin : 65; });
  var [answer16, setAnswer16] = useState(function() { return saved16 && saved16.answer !== undefined ? saved16.answer : null; });
  var [revealed16, setRevealed16] = useState(function() { return saved16 ? saved16.revealed : false; });

  useEffect(function() {
    saveMFState('mf16', { cac: cac, arpu: arpu, lifetime: lifetime, margin: margin, answer: answer16, revealed: revealed16 });
  }, [cac, arpu, lifetime, margin, answer16, revealed16]);

  var marginDec = margin / 100;
  var ltv = Math.round(arpu * lifetime * marginDec * 100) / 100;
  var ltvCac = cac > 0 ? Math.round((ltv / cac) * 100) / 100 : 0;
  var payback = marginDec * arpu > 0 ? Math.round((cac / (arpu * marginDec)) * 10) / 10 : 999;

  var healthColor = ltvCac >= 3 ? 'var(--green)' : ltvCac >= 1 ? 'var(--yellow)' : 'var(--red)';
  var healthBg = ltvCac >= 3 ? 'var(--green-bg)' : ltvCac >= 1 ? 'var(--yellow-bg)' : 'var(--red-bg)';
  var healthBorder = ltvCac >= 3 ? 'var(--green-border)' : ltvCac >= 1 ? 'var(--yellow-border)' : 'var(--red-border)';
  var healthLabel = ltvCac >= 3 ? 'Healthy' : ltvCac >= 1 ? 'Caution' : 'Danger';

  var W16 = 400; var H16 = 50;
  var timelineMax = Math.max(lifetime, payback, 24);
  var paybackPx = (payback / timelineMax) * (W16 - 20);
  var lifetimePx = (lifetime / timelineMax) * (W16 - 20);

  var mcq16 = [
    { label: 'A. LTV/CAC = 0.8 with accelerating acquisition spend — you are losing money faster on every new user.', correct: true },
    { label: 'B. LTV/CAC = 2.0 with a 6-month payback — decent but could be improved.', correct: false },
    { label: 'C. LTV/CAC = 5.0 with slow acquisition — you might be under-investing in growth.', correct: false },
    { label: 'D. LTV/CAC = 1.0 with flat acquisition — you are breaking even.', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          The growth team doubled signups last quarter. Everyone is celebrating — except finance. They&apos;re reporting that contribution margin went negative for the first time. The growth team spent aggressively on paid acquisition, pushing CAC from $12 to $35. Meanwhile, ARPU stayed flat at $8/month and the average user churns after 10 months. The math doesn&apos;t work: each user generates $80 in gross revenue over their lifetime ($8/month for 10 months), but after a 65% gross margin only $52 of lifetime value remains — and you&apos;re spending $35 to acquire them. You&apos;re losing money on every new user.
        </p>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
        Unit economics determines whether your business model works at the individual user level. LTV (lifetime value) = ARPU x lifetime x gross margin. If LTV/CAC is below 1, you lose money on every user acquired. The payback period tells you how long it takes to recoup acquisition cost — a critical cash flow constraint even when LTV/CAC is healthy.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '-1rem' }}>Try It: Unit Economics Calculator</div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Adjust CAC, ARPU, lifetime, and margin to explore how unit economics change. Watch the LTV/CAC ratio and payback period respond in real time.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>CAC</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--red)' }}>{'$' + cac}</span>
            </div>
            <input type='range' min={5} max={50} step={1} value={cac} onChange={function(e) { setCac(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--red)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}><span>$5</span><span>$50</span></div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>Monthly ARPU</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--green)' }}>{'$' + arpu}</span>
            </div>
            <input type='range' min={2} max={20} step={1} value={arpu} onChange={function(e) { setArpu(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--green)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}><span>$2</span><span>$20</span></div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>Avg lifetime (months)</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)' }}>{lifetime}</span>
            </div>
            <input type='range' min={2} max={24} step={1} value={lifetime} onChange={function(e) { setLifetime(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}><span>2 mo</span><span>24 mo</span></div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>Gross margin</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--purple)' }}>{margin + '%'}</span>
            </div>
            <input type='range' min={30} max={90} step={5} value={margin} onChange={function(e) { setMargin(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--purple)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}><span>30%</span><span>90%</span></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '0.65rem', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>LTV</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)' }}>{'$' + ltv}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.65rem', background: healthBg, border: '1px solid ' + healthBorder, borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: healthColor, textTransform: 'uppercase' }}>LTV/CAC</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: healthColor }}>{ltvCac}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: healthColor }}>{healthLabel}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.65rem', background: 'var(--purple-bg)', border: '1px solid var(--purple-border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase' }}>Payback</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--purple)' }}>{payback + ' mo'}</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textAlign: 'center' }}>Payback period vs. user lifetime</div>
          <svg viewBox={'0 0 ' + W16 + ' ' + H16} width='100%' style={{ display: 'block' }}>
            <rect x='10' y='10' width={lifetimePx} height='14' rx='3' fill='var(--accent)' opacity='0.3' />
            <text x={10 + lifetimePx / 2} y='20' textAnchor='middle' fontSize='8' fontWeight='600' fill='var(--accent)'>{'Lifetime: ' + lifetime + ' mo'}</text>
            <rect x='10' y='28' width={Math.min(paybackPx, lifetimePx + 40)} height='14' rx='3' fill={payback > lifetime ? 'var(--red)' : 'var(--green)'} opacity='0.4' />
            <text x={10 + Math.min(paybackPx, lifetimePx + 40) / 2} y='38' textAnchor='middle' fontSize='8' fontWeight='600' fill={payback > lifetime ? 'var(--red)' : 'var(--green)'}>{'Payback: ' + payback + ' mo'}</text>
          </svg>
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
          Which of these scenarios is the most dangerous for a business?
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Identify the scenario where unit economics are actively destroying value — not just suboptimal, but getting worse with scale.
        </div>

        {mcq16.map(function(opt, i) {
          var sel16 = answer16 === i;
          var bg16 = 'var(--surface-2)'; var brd16 = 'var(--border)'; var col16 = 'var(--text)';
          if (revealed16) {
            if (opt.correct) { bg16 = 'var(--teal-bg)'; brd16 = 'var(--teal-border)'; col16 = 'var(--teal)'; }
            else if (sel16) { bg16 = 'var(--red-bg)'; brd16 = 'var(--red-border)'; col16 = 'var(--red)'; }
          } else if (sel16) { brd16 = 'var(--accent-border)'; }
          return (
            <button key={i} onClick={function() { if (!revealed16) setAnswer16(i); }} disabled={revealed16}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', marginBottom: '0.5rem', background: bg16, border: '1.5px solid ' + brd16, borderRadius: 'var(--radius-sm)', color: col16, fontSize: '0.88rem', cursor: revealed16 ? 'default' : 'pointer', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          );
        })}

        {answer16 !== null && !revealed16 && (
          <button onClick={function() { setRevealed16(true); }} style={{ marginTop: '0.5rem', padding: '0.5rem 1.1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Check
          </button>
        )}

        {revealed16 && (
          <div className='pal-reveal-in'>
            <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: mcq16[answer16] && mcq16[answer16].correct ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (mcq16[answer16] && mcq16[answer16].correct ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>
              When LTV/CAC is below 1, every new user acquired destroys value. If acquisition spend is also accelerating, the company is burning cash at an increasing rate — the faster it grows, the faster it dies. LTV/CAC = 2 with a long payback is suboptimal but survivable. LTV/CAC = 5 with slow growth might mean under-investment. But LTV/CAC &lt; 1 with accelerating spend is the textbook definition of unsustainable growth.
            </div>
            <InsightBox label='Key Takeaway' color='var(--green)' bg='var(--green-bg)' border='var(--green-border)'>
              Unit economics is the ground truth of product health. A product can grow DAU, hit revenue targets, and still be destroying value if CAC exceeds LTV. Always check: LTV/CAC ratio (target 3x+), payback period (must be shorter than lifetime), and whether these metrics are improving or deteriorating with scale.
            </InsightBox>
            <NextBtn onClick={onNext}>Complete module &rarr;</NextBtn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Module 17: Growth Accounting ───────────────────────────────────────────

function Module_MF17({ module, onNext }) {
  var saved17 = useMemo(function() { return loadMFState('mf17'); }, []);
  var [newUsers, setNewUsers] = useState(function() { return saved17 && saved17.newUsers !== undefined ? saved17.newUsers : 5000; });
  var [retained, setRetained] = useState(function() { return saved17 && saved17.retained !== undefined ? saved17.retained : 40000; });
  var [resurrected, setResurrected] = useState(function() { return saved17 && saved17.resurrected !== undefined ? saved17.resurrected : 2000; });
  var [churned, setChurned] = useState(function() { return saved17 && saved17.churned !== undefined ? saved17.churned : 3000; });
  var [answer17, setAnswer17] = useState(function() { return saved17 && saved17.answer !== undefined ? saved17.answer : null; });
  var [revealed17, setRevealed17] = useState(function() { return saved17 ? saved17.revealed : false; });

  useEffect(function() {
    saveMFState('mf17', { newUsers: newUsers, retained: retained, resurrected: resurrected, churned: churned, answer: answer17, revealed: revealed17 });
  }, [newUsers, retained, resurrected, churned, answer17, revealed17]);

  var netGrowth = newUsers + resurrected - churned;
  var quickRatio = churned > 0 ? Math.round(((newUsers + resurrected) / churned) * 100) / 100 : 999;
  var prevActive = retained + churned;
  var currActive = retained + newUsers + resurrected;

  function applyPreset17(name) {
    if (name === 'leaky') { setNewUsers(8000); setRetained(30000); setResurrected(1000); setChurned(7500); }
    if (name === 'healthy') { setNewUsers(4000); setRetained(42000); setResurrected(2000); setChurned(1500); }
  }

  // Waterfall chart
  var W17 = 420; var H17 = 160;
  var padL17 = 50; var padR17 = 10; var padT17 = 15; var padB17 = 30;
  var innerW17 = W17 - padL17 - padR17;
  var innerH17 = H17 - padT17 - padB17;

  var maxVal = Math.max(prevActive, currActive, prevActive + newUsers + resurrected);
  var barWidth = innerW17 / 6;

  function yPos(val) { return padT17 + innerH17 - (val / maxVal) * innerH17; }

  var bars = [
    { label: 'Previous', value: prevActive, bottom: 0, color: 'var(--text-muted)', textColor: 'var(--text-muted)' },
    { label: '+ New', value: newUsers, bottom: prevActive - churned, color: 'var(--green)', textColor: 'var(--green)' },
    { label: '+ Resurrected', value: resurrected, bottom: prevActive - churned + newUsers, color: 'var(--purple)', textColor: 'var(--purple)' },
    { label: '- Churned', value: churned, bottom: prevActive - churned, color: 'var(--red)', textColor: 'var(--red)' },
    { label: 'Current', value: currActive, bottom: 0, color: 'var(--accent)', textColor: 'var(--accent)' },
  ];

  var mcq17 = [
    { label: 'A. Increase acquisition spend — you need more new users to offset churn.', correct: false },
    { label: 'B. Prioritize retention and resurrection — fix the leaky bucket before pouring more water in.', correct: true },
    { label: 'C. Quick ratio of 0.9 is fine — it is close enough to 1.0.', correct: false },
    { label: 'D. Focus on MAU growth rate instead — quick ratio is not a standard metric.', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          MAU grew 5% last month and the team is optimistic. But when you decompose the growth: 8,000 new users arrived, 1,000 resurrected, and 7,500 churned. The quick ratio is just 1.2 — for every user lost, only 1.2 are gained or resurrected. The product is a leaky bucket: high inflow masks equally high outflow. If acquisition costs rise or a campaign ends, MAU will plateau or decline immediately.
        </p>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
        Growth accounting decomposes MAU change into four components: new users (first-time), retained (active last period and this period), resurrected (inactive last period, returned this period), and churned (active last period, gone this period). The quick ratio = (new + resurrected) / churned — a ratio above 2 indicates healthy, self-sustaining growth; below 1 means the user base is shrinking.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '-1rem' }}>Try It: Growth Accounting Decomposer</div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Adjust the four user flow components and watch how net growth and quick ratio change. Try the presets to see a leaky bucket vs. healthy growth pattern.
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={function() { applyPreset17('leaky'); }} style={{ padding: '0.35rem 0.8rem', background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--red)', cursor: 'pointer' }}>Leaky bucket</button>
          <button onClick={function() { applyPreset17('healthy'); }} style={{ padding: '0.35rem 0.8rem', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--green)', cursor: 'pointer' }}>Healthy growth</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>New users</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--green)' }}>{newUsers.toLocaleString()}</span>
            </div>
            <input type='range' min={500} max={15000} step={500} value={newUsers} onChange={function(e) { setNewUsers(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--green)' }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>Retained users</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)' }}>{retained.toLocaleString()}</span>
            </div>
            <input type='range' min={10000} max={60000} step={1000} value={retained} onChange={function(e) { setRetained(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>Resurrected users</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--purple)' }}>{resurrected.toLocaleString()}</span>
            </div>
            <input type='range' min={0} max={8000} step={500} value={resurrected} onChange={function(e) { setResurrected(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--purple)' }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>Churned users</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--red)' }}>{churned.toLocaleString()}</span>
            </div>
            <input type='range' min={500} max={15000} step={500} value={churned} onChange={function(e) { setChurned(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--red)' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '0.65rem', background: netGrowth >= 0 ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (netGrowth >= 0 ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: netGrowth >= 0 ? 'var(--green)' : 'var(--red)', textTransform: 'uppercase' }}>Net growth</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: netGrowth >= 0 ? 'var(--green)' : 'var(--red)' }}>{(netGrowth >= 0 ? '+' : '') + netGrowth.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.65rem', background: quickRatio >= 2 ? 'var(--green-bg)' : quickRatio >= 1 ? 'var(--yellow-bg)' : 'var(--red-bg)', border: '1px solid ' + (quickRatio >= 2 ? 'var(--green-border)' : quickRatio >= 1 ? 'var(--yellow-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: quickRatio >= 2 ? 'var(--green)' : quickRatio >= 1 ? 'var(--yellow)' : 'var(--red)', textTransform: 'uppercase' }}>Quick ratio</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: quickRatio >= 2 ? 'var(--green)' : quickRatio >= 1 ? 'var(--yellow)' : 'var(--red)' }}>{quickRatio}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: quickRatio >= 2 ? 'var(--green)' : quickRatio >= 1 ? 'var(--yellow)' : 'var(--red)' }}>{quickRatio >= 2 ? 'Healthy' : quickRatio >= 1 ? 'Fragile' : 'Shrinking'}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.65rem', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Current MAU</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)' }}>{currActive.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textAlign: 'center' }}>Growth accounting waterfall</div>
          <svg viewBox={'0 0 ' + W17 + ' ' + H17} width='100%' style={{ display: 'block' }}>
            <line x1={padL17} y1={padT17 + innerH17} x2={W17 - padR17} y2={padT17 + innerH17} stroke='var(--border)' strokeWidth='1' />
            <line x1={padL17} y1={padT17} x2={padL17} y2={padT17 + innerH17} stroke='var(--border)' strokeWidth='1' />
            {bars.map(function(bar, idx) {
              var xOff = padL17 + idx * (innerW17 / 5) + (innerW17 / 5 - barWidth) / 2;
              var barTop = yPos(bar.bottom + bar.value);
              var barBot = yPos(bar.bottom);
              var barH17 = Math.max(1, barBot - barTop);
              return (
                <g key={'bar' + idx}>
                  <rect x={xOff} y={barTop} width={barWidth} height={barH17} rx='3' fill={bar.color} opacity='0.7' />
                  <text x={xOff + barWidth / 2} y={barTop - 4} textAnchor='middle' fontSize='8' fontWeight='700' fill={bar.textColor}>{bar.value >= 1000 ? Math.round(bar.value / 1000) + 'K' : bar.value}</text>
                  <text x={xOff + barWidth / 2} y={padT17 + innerH17 + 14} textAnchor='middle' fontSize='7' fill='var(--text-muted)'>{bar.label}</text>
                </g>
              );
            })}
            {/* Connector lines */}
            <line x1={padL17 + barWidth + (innerW17 / 5 - barWidth) / 2} y1={yPos(prevActive - churned)} x2={padL17 + innerW17 / 5 + (innerW17 / 5 - barWidth) / 2} y2={yPos(prevActive - churned)} stroke='var(--border)' strokeWidth='0.5' strokeDasharray='2 2' />
          </svg>
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
          Your product&apos;s quick ratio is 0.9. What should you prioritize?
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Choose the action that addresses the root cause of a sub-1.0 quick ratio — where the user base is actively shrinking.
        </div>

        {mcq17.map(function(opt, i) {
          var sel17 = answer17 === i;
          var bg17 = 'var(--surface-2)'; var brd17 = 'var(--border)'; var col17 = 'var(--text)';
          if (revealed17) {
            if (opt.correct) { bg17 = 'var(--teal-bg)'; brd17 = 'var(--teal-border)'; col17 = 'var(--teal)'; }
            else if (sel17) { bg17 = 'var(--red-bg)'; brd17 = 'var(--red-border)'; col17 = 'var(--red)'; }
          } else if (sel17) { brd17 = 'var(--accent-border)'; }
          return (
            <button key={i} onClick={function() { if (!revealed17) setAnswer17(i); }} disabled={revealed17}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', marginBottom: '0.5rem', background: bg17, border: '1.5px solid ' + brd17, borderRadius: 'var(--radius-sm)', color: col17, fontSize: '0.88rem', cursor: revealed17 ? 'default' : 'pointer', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          );
        })}

        {answer17 !== null && !revealed17 && (
          <button onClick={function() { setRevealed17(true); }} style={{ marginTop: '0.5rem', padding: '0.5rem 1.1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Check
          </button>
        )}

        {revealed17 && (
          <div className='pal-reveal-in'>
            <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: mcq17[answer17] && mcq17[answer17].correct ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (mcq17[answer17] && mcq17[answer17].correct ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>
              A quick ratio below 1 means the user base is net shrinking — you are losing users faster than you gain them. Increasing acquisition spend when churn is high is like filling a bucket with a hole in it. The highest-leverage fix is reducing churn: improving onboarding, activation, and core engagement so that users who arrive actually stay. Resurrection campaigns (win-back emails, re-engagement pushes) are a secondary lever.
            </div>
            <InsightBox label='Key Takeaway' color='var(--green)' bg='var(--green-bg)' border='var(--green-border)'>
              Growth accounting reveals whether MAU growth is healthy or fragile. A high quick ratio (2+) means growth is self-sustaining — retention is strong and churn is low. A low quick ratio (&lt;1.5) means you are on a treadmill — constantly acquiring just to replace churned users. Always decompose MAU before celebrating top-line growth.
            </InsightBox>
            <NextBtn onClick={onNext}>Complete module &rarr;</NextBtn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Module registry ──────────────────────────────────────────────────────────

const MODULE_COMPONENTS = {
  mf01: Module_MF01,
  mf02: Module_MF02,
  mf03: Module_MF03,
  mf04: Module_MF04,
  mf05: Module_MF05,
  mf06: Module_MF06,
  mf07: Module_MF07,
  mf08: Module_MF08,
  mf09: Module_MF09,
  mf10: Module_MF10,
  mf11: Module_MF11,
  mf12: Module_MF12,
  mf13: Module_MF13,
  mf14: Module_MF14,
  mf15: Module_MF15,
  mf16: Module_MF16,
  mf17: Module_MF17,
};

// ─── Runner shell ─────────────────────────────────────────────────────────────

export function MetricsFoundationsRunner({ moduleId, onBack, onNext, unlocked, onSelectModule }) {
  var module = metricsFoundationModules.find(function(m) { return m.id === moduleId; });
  var [completed, setCompleted] = useState(function() { return !!getMetricsFoundationProgress(moduleId); });
  var allProgress = getAllMetricsFoundationProgress();

  useEffect(function() {
    setCompleted(!!getMetricsFoundationProgress(moduleId));
  }, [moduleId]);

  if (!module) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Module not found.</div>
  );

  var ModuleComponent = MODULE_COMPONENTS[moduleId];

  function handleNext() {
    saveMetricsFoundationProgress(moduleId);
    setCompleted(true);
    track('case_completed', { room: 'metrics-foundations', id: moduleId, title: module.title });
    if (onNext) onNext();
    else onBack();
  }

  return (
    <FoundationRunnerShell
      module={module}
      totalModules={metricsFoundationModules.length}
      completed={completed}
      color='var(--green)'
      roomLabel='Metrics Foundations'
      onBack={onBack}
      playbookLinks={module.playbookLinks}
      modules={metricsFoundationModules}
      currentModuleId={moduleId}
      onSelectModule={onSelectModule}
      progress={allProgress}
    >
      {ModuleComponent ? (
        <ModuleComponent module={module} onNext={handleNext} />
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Module content coming soon.</div>
      )}
    </FoundationRunnerShell>
  );
}
