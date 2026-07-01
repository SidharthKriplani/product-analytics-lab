import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

export function Module_RF08({ onComplete }) {
  const STEPS = [
    {
      label: 'Query 1: Time-series event count by day',
      query: 'SELECT DATE(event_time) AS day, COUNT(*) AS events\nFROM events\nWHERE event_name = \'checkout_complete\'\n  AND event_time >= CURRENT_DATE - 21\nGROUP BY 1\nORDER BY 1;',
      headers: ['day', 'events'],
      rows: [
        ['2024-03-10', '4210'], ['2024-03-11', '4180'], ['2024-03-12', '4225'],
        ['2024-03-13', '4190'], ['2024-03-14', '4150'], ['2024-03-15', '2540'],
        ['2024-03-16', '2510'], ['2024-03-17', '2490'], ['2024-03-18', '2520'],
        ['2024-03-19', '2535'],
      ],
      highlight: [5, 6, 7, 8, 9],
      finding: 'Drop begins abruptly on day 15 (Mar 15). Event counts halve overnight — this is a step change, not a gradual trend.',
    },
    {
      label: 'Query 2: Platform split',
      query: 'SELECT platform, DATE(event_time) AS day, COUNT(*) AS events\nFROM events\nWHERE event_name = \'checkout_complete\'\n  AND event_time >= CURRENT_DATE - 7\nGROUP BY 1, 2\nORDER BY 2, 1;',
      headers: ['platform', 'day', 'events'],
      rows: [
        ['android', '2024-03-14', '1940'], ['ios', '2024-03-14', '2210'],
        ['android', '2024-03-15', '1920'], ['ios', '2024-03-15', '620'],
        ['android', '2024-03-16', '1910'], ['ios', '2024-03-16', '600'],
        ['android', '2024-03-17', '1935'], ['ios', '2024-03-17', '555'],
      ],
      highlight: [3, 5, 7],
      finding: 'iOS drops from ~2,200 to ~600 on Mar 15. Android is completely stable. This is a platform-specific signal — points toward SDK change or iOS app release.',
    },
    {
      label: 'Query 3: Year-over-year comparison',
      query: 'SELECT DATE(event_time) AS day,\n       COUNT(*) AS events_this_year,\n       LAG(COUNT(*), 365) OVER (ORDER BY DATE(event_time)) AS events_last_year\nFROM events\nWHERE event_name = \'checkout_complete\'\nGROUP BY 1\nORDER BY 1 DESC\nLIMIT 10;',
      headers: ['day', 'this year', 'last year'],
      rows: [
        ['2024-03-19', '2535', '2498'], ['2024-03-18', '2520', '2470'],
        ['2024-03-17', '2490', '4320'], ['2024-03-16', '2510', '4290'],
        ['2024-03-15', '2540', '4280'], ['2024-03-14', '4150', '4160'],
        ['2024-03-13', '4190', '4180'], ['2024-03-12', '4225', '4190'],
      ],
      highlight: [2, 3, 4],
      finding: 'Last year on Mar 15-17 the metric was healthy (~4,300). This drop is NOT seasonal — it is a new event starting on exactly Mar 15, 2024.',
    },
  ];

  const RF08_MCQ = {
    question: 'Which of these SQL patterns should you run FIRST in any RCA?',
    options: [
      'Join events to user profiles to identify affected user segments',
      'Time-series the raw event count by day to confirm the drop and identify when it started',
      'Segment the metric by new vs returning users to find which cohort is driving the change',
      'Pull funnel drop-off rates at each step for the affected event',
    ],
    correct: 1,
    explanation: 'Time-series the raw event count by day is always first. It confirms the drop is real (not a dashboard filter issue), shows when it started, and reveals whether it is a step change or a gradual drift — all before you touch more complex joins.',
  };

  const _saved08 = useMemo(function() { return loadRFState('rf08'); }, []);
  const [step, setStep] = useState(function() { return _saved08 && _saved08.step != null ? _saved08.step : 0; });
  const [ranSteps, setRanSteps] = useState(function() { return _saved08 && _saved08.ranSteps ? _saved08.ranSteps : {}; });
  const [mcqSel, setMcqSel] = useState(function() { return _saved08 && _saved08.mcqSel != null ? _saved08.mcqSel : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved08 ? !!_saved08.mcqRevealed : false; });

  useEffect(function() { saveRFState('rf08', { step: step, ranSteps: ranSteps, mcqSel: mcqSel, mcqRevealed: mcqRevealed }); }, [step, ranSteps, mcqSel, mcqRevealed]);

  const allStepsRan = STEPS.every((_, i) => ranSteps[i]);

  function runStep(i) {
    setRanSteps(prev => ({ ...prev, [i]: true }));
    if (i < STEPS.length - 1) setStep(i + 1);
  }

  const currentStep = STEPS[step];

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>
          An alert fires: purchases are down 22% in the last hour. You open your SQL editor. The clock is running. Most analysts freeze for ten seconds and then reach for something complex — a multi-table join, a funnel query, a cohort breakdown. These feel thorough. They are also slow to write, slow to run, and often answer the wrong question first.
        </p>
        <p style={prose}>
          There are three queries that take under ten minutes to write collectively, run in under two minutes, and answer the three questions that gate every subsequent step in the investigation. The naive approach is to start with the query that answers your hypothesis. But you don&apos;t have a valid hypothesis yet. You have an alert. Starting with a hypothesis-specific query is starting in the middle of the investigation — it skips the step that tells you whether your hypothesis is in the right zip code.
        </p>
        <p style={prose}>
          Query one: daily event counts for the affected metric over the past two weeks. This answers: is the drop a cliff (sudden, single-day) or a gradient (gradual decline)? A cliff points to an instrumentation failure or a deploy. A gradient points to an organic behavior shift. Query two: the same metric broken by platform and region. This answers: is the drop universal or isolated? Query three: the same metric compared to the same window in the prior year. This answers: is this drop anomalous, or does it match a known seasonal pattern?
        </p>
        <p style={prose}>
          These three queries are the diagnostic triage. The answers route you to the right branch of the investigation. Three queries, twelve minutes of work, and you&apos;ve scoped the investigation from &quot;purchases are down&quot; to a specific, actionable candidate.
        </p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>Query one shows a gradual 12-day decline. Query two shows the decline is uniform across all platforms and regions. What does query three (year-over-year comparison) tell you that queries one and two cannot?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* === INTERACTIVE JSX === */}
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          The first 30 minutes of any RCA follow the same SQL playbook: confirm the signal is real, narrow to a platform or segment, then check whether the pattern has historical precedent. Walk through each query below and read what the output tells you.
        </p>

        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Click Run query to execute each SQL step — read the highlighted rows in the result table and the finding before moving to the next query.
        </div>

        {/* Step tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{
                padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-sm)',
                border: '1.5px solid ' + (step === i ? 'var(--teal-border)' : (ranSteps[i] ? 'var(--teal-border)' : 'var(--border)')),
                background: step === i ? 'var(--teal-bg)' : (ranSteps[i] ? 'var(--teal-bg)' : 'var(--surface-2)'),
                color: step === i ? 'var(--teal)' : (ranSteps[i] ? 'var(--teal)' : 'var(--text-muted)'),
                fontSize: '0.8rem', fontWeight: step === i ? 700 : 400, cursor: 'pointer',
              }}
            >
              {ranSteps[i] ? 'Query ' + (i + 1) + ' done' : 'Query ' + (i + 1)}
            </button>
          ))}
        </div>

        {/* Query card */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginBottom: '0.85rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.55rem' }}>
            {currentStep.label}
          </div>
          <pre style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
            fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.65,
            overflowX: 'auto', margin: '0 0 0.85rem', whiteSpace: 'pre-wrap',
          }}>{currentStep.query}</pre>

          {ranSteps[step] ? (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>Result</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      {currentStep.headers.map((h, hi) => (
                        <th key={hi} style={{ textAlign: 'left', padding: '0.35rem 0.6rem', borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentStep.rows.map((row, ri) => {
                      const isHighlighted = currentStep.highlight.indexOf(ri) !== -1;
                      return (
                        <tr key={ri} style={{ background: isHighlighted ? 'var(--red-bg)' : 'transparent' }}>
                          {row.map((cell, ci) => (
                            <td key={ci} style={{ padding: '0.3rem 0.6rem', borderBottom: '1px solid var(--border)', color: isHighlighted ? 'var(--red)' : 'var(--text)', fontWeight: isHighlighted && ci === row.length - 1 ? 700 : 400 }}>{cell}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.9rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.55 }}>
                <strong>Finding:</strong> {currentStep.finding}
              </div>
            </div>
          ) : (
            <button
              onClick={() => runStep(step)}
              style={{
                padding: '0.5rem 1.1rem', borderRadius: 'var(--radius-sm)',
                border: 'none', background: 'var(--teal)', color: '#fff',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              {'Run query ' + (step + 1)}
            </button>
          )}
        </div>

        {/* MCQ after all steps done */}
        {allStepsRan && (
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
              <strong>What to do:</strong> Select the SQL pattern that should always run first in any RCA, then click Check.
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.65rem' }}>{RF08_MCQ.question}</div>
            {RF08_MCQ.options.map((opt, oi) => (
              <MCQOption
                key={oi}
                label={opt}
                selected={mcqSel === oi}
                correct={oi === RF08_MCQ.correct}
                revealed={mcqRevealed}
                onClick={() => !mcqRevealed && setMcqSel(oi)}
              />
            ))}
            {mcqSel !== null && !mcqRevealed && (
              <button
                onClick={() => setMcqRevealed(true)}
                style={{ marginTop: '0.4rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}
              >Check</button>
            )}
            {mcqRevealed && (
              <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>
                {RF08_MCQ.explanation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {mcqRevealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>Queries one and two together tell you the drop is real, gradual, and universal. What they cannot tell you is whether &quot;gradual and universal&quot; is normal — it might be a seasonal pattern you see every year. Query three answers that. If the same 12-day decline appears in the prior year&apos;s data, seasonality is back as a live hypothesis. If prior year was flat or rising over this same window, seasonality is ruled out and you proceed to product causes. The three queries form a logical chain: each answer gates the next interpretation.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {mcqRevealed && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Keep these three queries in a template document. When an alert fires, open the template, swap in the event name and date range, and run. Time to first insight under ten minutes. Analysts who rewrite these from scratch every time cost themselves twenty minutes at the worst possible moment.</p>
            <p style={prose}><strong>Two.</strong> The segmentation in query two should always include both platform and region simultaneously in a first pass — a cross-tab, not two separate queries. A drop that&apos;s iOS-only in Brazil has a different interpretation than a drop that&apos;s iOS-only globally. The interaction matters and costs nothing extra to compute.</p>
            <p style={prose}><strong>Three.</strong> Do not write query four before queries one through three are complete. The instinct to immediately query the checkout funnel or the cohort breakdown is the instinct to start in the middle. The three diagnostic queries are not preliminary — they contain the routing information that makes every subsequent query productive rather than speculative.</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {mcqRevealed && <NextBtn onClick={onComplete} />}
    </div>
  );
}
