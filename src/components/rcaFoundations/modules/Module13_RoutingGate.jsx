import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const SCENARIOS_RF13 = [
  {
    id: 0,
    signal: 'Last 1–6 hours',
    scenario: 'All platforms, all event types drop simultaneously at 3:14 AM. Raw event table row counts are near zero from 3:14 AM onward. Every downstream dashboard shows a flatline.',
    correct: 'sanity',
    explanation: 'A vertical cliff across all platforms and all event types simultaneously is the signature of a data pipeline or infrastructure failure — not a product change. Sanity check first: check ingestion job logs and raw table row counts by hour. A product change cannot produce this pattern.',
  },
  {
    id: 1,
    signal: 'Weeks of gradual decline',
    scenario: 'DAU has declined 2–3% every single week for 11 consecutive weeks. No specific event, deploy, or campaign correlates with the start date.',
    correct: 'behaviour',
    explanation: 'Gradual decline with no correlation event points to product erosion, cohort quality degradation, or competitor creep — not a single bug or deploy. Start with product and behaviour: cohort retention trends, new user quality, segment-level breakdowns. A/B tests and deploys cannot produce a smooth 11-week slope.',
  },
  {
    id: 2,
    signal: 'Last 1–6 hours, one platform only',
    scenario: 'Checkout conversion dropped 9% starting this morning. Android is affected. iOS and web are completely flat. The drop started around the time of a routine Android SDK update.',
    correct: 'tech',
    explanation: 'Platform-specific + very recent + a known change in the window = Internal Tech. The Android SDK update is the prime suspect. Start with the deploy: check the SDK changelog, verify tracking library version, and confirm whether the drop correlates exactly with the update rollout. This is not a data quality issue — the signal is real but isolated to one platform.',
  },
  {
    id: 3,
    signal: 'Cyclical pattern',
    scenario: 'A B2B SaaS platform shows revenue dropping every last week of the month, consistently for 8 consecutive months. The pattern is stable — same week, same magnitude.',
    correct: 'external',
    explanation: 'Stable, repeating, calendar-aligned patterns are external/seasonal. This is a billing or renewal cycle effect — B2B contracts often close or renew at month-end, creating a predictable revenue dip in the days before. No product investigation required. The correct response is to flag it as expected seasonality and adjust forecasts accordingly.',
  },
  {
    id: 4,
    signal: 'One segment only',
    scenario: 'Feature engagement dropped 18% but only affects users who signed up before Q1. Users who signed up after Q1 are completely unaffected. The feature itself has not changed.',
    correct: 'segment',
    explanation: 'When only one cohort is affected and the product has not changed, the cause lives inside that cohort\'s subtree — not in the global product tree. Start by isolating: what changed for pre-Q1 users specifically? Did a notification, email, or entitlement change affect only that cohort? The segment boundary is itself a diagnostic clue.',
  },
  {
    id: 5,
    signal: '2–7 days',
    scenario: 'DAU dropped 14% starting 3 days ago. The drop correlates with a new onboarding A/B test that shipped 4 days ago. Both treatment and control groups show lower DAU than the pre-experiment baseline.',
    correct: 'tech',
    explanation: 'A drop that begins shortly after a specific change and affects both treatment and control is a feature regression or misconfiguration — not the experiment effect itself. Start with Internal Tech: check whether the onboarding change broke something for all users, not just the treatment group. Both arms being affected rules out a treatment-specific effect.',
  },
];

const ROUTES_RF13 = [
  { id: 'sanity',    label: 'Sanity / Data pipeline first',                color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)' },
  { id: 'external',  label: 'External / Market signals first',             color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  { id: 'tech',      label: 'Internal Tech first — deploy / A/B / SDK',   color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  { id: 'behaviour', label: 'Product erosion / Behaviour — gradual shift', color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
  { id: 'segment',   label: 'Isolate the affected segment first',          color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
];

export function Module_RF13({ onComplete }) {
  const _saved13 = useMemo(function() { return loadRFState('rf13'); }, []);
  const [scenarios13] = useState(function() { return _saved13 && _saved13.scenarios ? _saved13.scenarios : shuffleArr(SCENARIOS_RF13); });
  const [selections, setSelections] = useState(function() { return _saved13 && _saved13.selections ? _saved13.selections : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved13 ? !!_saved13.revealed : false; });

  useEffect(function() { saveRFState('rf13', { scenarios: scenarios13, selections: selections, revealed: revealed }); }, [scenarios13, selections, revealed]);

  var allSelected = scenarios13.every(function(s) { return selections[s.id] != null; });
  var correctCount = revealed ? scenarios13.filter(function(s) { return selections[s.id] === s.correct; }).length : 0;

  function select(scenarioId, routeId) {
    if (revealed) return;
    setSelections(function(prev) { var n = Object.assign({}, prev); n[scenarioId] = routeId; return n; });
  }

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>DAU is down. The alert is in the channel. Everyone is ready to investigate. Before you run a single query, look at the chart. Not the current value — the shape. How did it get to this value? Is it a cliff — a sudden drop that happened at a specific timestamp? Or is it a gradient — a slow, steady decline over days or weeks? Or is it a sawtooth — a cyclical pattern that dips and recovers on a predictable schedule?</p>
        <p style={prose}>These three shapes point to three completely different categories of cause, and the first query you run should depend on which shape you&apos;re looking at. Running the wrong first query sends the entire investigation down a branch that won&apos;t lead to the answer. A cliff points to a discrete event: a deploy, an SDK update, a pipeline failure. The investigation becomes a timestamp correlation. A gradient points to an organic process: retention declining within a cohort, user composition shifting, a feature gradually losing engagement. The investigation becomes a cohort analysis. A sawtooth almost always points to seasonality. The investigation becomes a prior-period comparison.</p>
        <p style={prose}>The routing gate is not a framework for closing the investigation — it&apos;s a framework for opening the right branch. The goal is to select the cheapest-to-run first query that is most likely to be relevant given the time signature. Starting with the deploy log when you have a gradient means you&apos;ll spend an hour reviewing deploys that predate the decline, establishing a timeline of changes that don&apos;t correlate with when the metric started moving.</p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>A metric shows a 15% drop that began four days ago, declining approximately 3–4% per day. What does this time signature tell you the cause is NOT — and why?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
        Before building a fault tree, read the time signature. The pattern of a drop — when it started, how fast it moved, and which segments it hit — routes the entire investigation. Jumping to hypotheses before reading the signal means you start in the wrong branch.
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> For each scenario, select where you would start the investigation — then check all six at once.
      </div>

      {/* Route legend */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {ROUTES_RF13.map(function(r) {
          return (
            <span key={r.id} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 4, background: r.bg, border: '1px solid ' + r.border, color: r.color }}>
              {r.label}
            </span>
          );
        })}
      </div>

      {/* Scenarios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {scenarios13.map(function(s) {
          var sel = selections[s.id];
          var selectedRoute = sel != null ? ROUTES_RF13.find(function(r) { return r.id === sel; }) : null;
          var correctRoute = ROUTES_RF13.find(function(r) { return r.id === s.correct; });
          var isCorrect = revealed && sel === s.correct;
          var isWrong = revealed && sel != null && sel !== s.correct;
          return (
            <div key={s.id} style={{
              background: isCorrect ? 'var(--teal-bg)' : isWrong ? 'var(--red-bg)' : 'var(--surface-2)',
              border: '1.5px solid ' + (isCorrect ? 'var(--teal-border)' : isWrong ? 'var(--red-border)' : 'var(--border)'),
              borderRadius: 'var(--radius)', padding: '0.9rem 1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 3, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {s.signal}
                </span>
                {revealed && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isCorrect ? 'var(--teal)' : 'var(--red)' }}>
                    {isCorrect ? 'Correct' : 'Start with: ' + correctRoute.label}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: sel != null || revealed ? '0.65rem' : 0 }}>
                {s.scenario}
              </div>
              {!revealed && (
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {ROUTES_RF13.map(function(r) {
                    var isSelected = sel === r.id;
                    return (
                      <button key={r.id} onClick={function() { select(s.id, r.id); }} style={{
                        fontSize: '0.73rem', padding: '0.25rem 0.6rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: isSelected ? r.color : 'var(--surface)',
                        border: '1px solid ' + (isSelected ? r.color : 'var(--border)'),
                        borderRadius: 3, color: isSelected ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer', fontWeight: isSelected ? 700 : 400, transition: 'all 0.1s',
                      }}>
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              )}
              {revealed && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55, fontStyle: 'italic' }}>
                  {s.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!revealed && allSelected && (
        <button onClick={function() { setRevealed(true); }} style={{
          padding: '0.55rem 1.2rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--teal)', color: '#fff',
          border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700,
          fontSize: '0.88rem', cursor: 'pointer',
        }}>
          Check answers
        </button>
      )}

      {revealed && (
        <div style={sectionGap}>
          <div style={{
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
            background: correctCount === scenarios13.length ? 'var(--teal-bg)' : 'var(--yellow-bg)',
            border: '1px solid ' + (correctCount === scenarios13.length ? 'var(--teal-border)' : 'var(--yellow-border)'),
            color: correctCount === scenarios13.length ? 'var(--teal)' : 'var(--yellow)',
            fontWeight: 700, fontSize: '0.88rem',
          }}>
            {correctCount}/{scenarios13.length} correct{correctCount < scenarios13.length ? ' — review the highlighted scenarios' : ' — perfect routing'}
          </div>

          {/* Routing Gate reference table */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.7rem' }}>
              Routing gate — signal to starting branch
            </div>
            {[
              { signal: 'Cliff in last 1–6 hours, all events/platforms', route: 'Sanity / Data pipeline', color: 'var(--red)' },
              { signal: 'Cliff in last 1–6 hours, one platform only', route: 'Internal Tech (deploy / SDK)', color: 'var(--accent)' },
              { signal: '2–7 days, correlates with a known change', route: 'Internal Tech (A/B test / feature regression)', color: 'var(--accent)' },
              { signal: 'Weeks of gradual decline, no event correlation', route: 'Product erosion / Behaviour', color: 'var(--purple)' },
              { signal: 'Stable cyclical pattern (day/week/month)', route: 'External / Seasonal', color: 'var(--yellow)' },
              { signal: 'One segment affected, others flat', route: 'Isolate the segment first', color: 'var(--teal)' },
            ].map(function(row, i) {
              return (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.45rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0, marginTop: '0.35rem' }} />
                  <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{row.signal}</span>
                    <span style={{ color: 'var(--text-muted)', margin: '0 0.3rem' }}>→</span>
                    <span style={{ color: row.color, fontWeight: 700 }}>{row.route}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {revealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>A 3–4% per day gradual decline over four days is not consistent with a deploy-triggered cliff or a pipeline failure — those produce vertical drops at precise timestamps, not smooth gradual declines. The time signature rules out instrumentation failure almost entirely and any single discrete event as the primary cause. A gradual decline is produced by continuous processes: retention compounding, composition shift, a behavior change propagating through a cohort day by day. Starting with the deploy log is wasted effort; starting with cohort retention curves is the right move.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {revealed && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Make looking at the chart&apos;s shape the literal first step before any other action. Not the current value, not the WoW change — the shape. Cliff or gradient or sawtooth? This observation takes thirty seconds and selects the opening move of the entire investigation.</p>
            <p style={prose}><strong>Two.</strong> When handing off an investigation, communicate the time signature explicitly. &quot;It&apos;s a cliff at 3 AM Tuesday&quot; is a complete handoff context — the receiving analyst knows to start with the deploy log. &quot;DAU is down 28%&quot; is not — the receiving analyst has to re-derive the time signature before they can start. The shape is information.</p>
            <p style={prose}><strong>Three.</strong> The routing gate can be wrong. A gradient that suddenly steepens might have started with a cliff that you missed because the alert threshold was crossed only after several days of accumulated decline. Always look at a longer time window than the alert period — a two-week chart sometimes reveals that the &quot;gradual&quot; decline had a subtle cliff origin that the seven-day view obscured.</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {revealed && <NextBtn onClick={onComplete} />}
    </div>
  );
}
