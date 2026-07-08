import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

var TRIAGE_SIGNALS = [
  { id: 's1', text: 'Sessions dropped only on Android — iOS is completely flat', answer: 'data', explanation: 'Platform-isolated drops are the strongest data quality signal. Real product issues rarely affect exactly one platform while leaving the other untouched. This pattern points to an SDK update, a broken event listener, or a platform-specific pipeline filter.' },
  { id: 's2', text: 'The drop coincides with an app release pushed yesterday at 3pm', answer: 'product', explanation: 'A metric change that aligns precisely with a deployment is a strong product signal. The release may have broken a flow, removed a feature, or changed navigation. Check the diff.' },
  { id: 's3', text: 'Event timestamps show a 3-hour gap with zero events across all platforms', answer: 'data', explanation: 'A clean gap with literally zero events is almost never a real user behaviour pattern. Users don\'t all stop using an app simultaneously for exactly 3 hours. This is a pipeline outage, ingestion failure, or scheduled maintenance that dropped events.' },
  { id: 's4', text: 'The drop is exactly the same percentage (30.0%) across every Android device model, OS version, and country', answer: 'data', explanation: 'Uniform magnitude across every segment is a telltale data quality signal. Real product issues create heterogeneous impact — some segments are hit harder than others. A perfectly uniform drop means a systematic data problem: a sampling rate change, a filter applied upstream, or a logging SDK version that stopped firing.' },
  { id: 's5', text: 'User complaints about crashes are spiking on social media and app store reviews', answer: 'product', explanation: 'External user reports confirm that real users are experiencing real problems. Data pipeline issues are invisible to end users — they don\'t know their events aren\'t being logged. If users are complaining, something changed in the product experience.' },
  { id: 's6', text: 'The drop started at exactly midnight UTC, not at any local timezone boundary', answer: 'data', explanation: 'Midnight UTC is when batch jobs run, partitions rotate, and pipeline schedules execute. Real user behaviour follows local timezones — people in Tokyo don\'t change behaviour at midnight UTC (9am JST). A sharp break at midnight UTC screams pipeline or cron job failure.' },
  { id: 's7', text: 'Revenue per user is unchanged despite the session drop', answer: 'data', explanation: 'If sessions dropped 30% but revenue per user is stable, the users who are still being counted are behaving identically. This suggests the "missing" sessions never represented real engagement — they were duplicate events, bot traffic being filtered, or a logging artifact that inflated session counts before.' },
  { id: 's8', text: 'Total events dropped but unique user count stayed flat', answer: 'data', explanation: 'Same number of users, fewer events per user. This pattern usually means an event-level logging change — a tracking call was removed, a fire-rate was throttled, or an SDK update collapsed multiple events into one. If it were a real product issue, you\'d expect some users to churn entirely, reducing unique counts.' },
];

export function Module_RF03({ onComplete }) {
  var _saved03 = useMemo(function() { return loadRFState('rf03'); }, []);
  var _initSignals = useMemo(function() { return _saved03 && _saved03.signals ? _saved03.signals : shuffleArr(TRIAGE_SIGNALS); }, []);
  var _initClass = _saved03 && _saved03.classifications ? _saved03.classifications : {};
  var _initTriageRevealed = _saved03 ? !!_saved03.triageRevealed : false;
  var _initMcqSel = _saved03 ? _saved03.mcqSelected || null : null;
  var _initMcqAns = _saved03 ? !!_saved03.mcqAnswered : false;

  var _signals = useState(_initSignals);
  var signals = _signals[0];
  var _classState = useState(_initClass);
  var classifications = _classState[0];
  var setClassifications = _classState[1];
  var _triState = useState(_initTriageRevealed);
  var triageRevealed = _triState[0];
  var setTriageRevealed = _triState[1];
  var _mcqSelState = useState(_initMcqSel);
  var mcqSelected = _mcqSelState[0];
  var setMcqSelected = _mcqSelState[1];
  var _mcqAnsState = useState(_initMcqAns);
  var mcqAnswered = _mcqAnsState[0];
  var setMcqAnswered = _mcqAnsState[1];

  useEffect(function() {
    saveRFState('rf03', {
      signals: signals,
      classifications: classifications,
      triageRevealed: triageRevealed,
      mcqSelected: mcqSelected,
      mcqAnswered: mcqAnswered,
    });
  }, [signals, classifications, triageRevealed, mcqSelected, mcqAnswered]);

  function classify(signalId, answer) {
    if (triageRevealed) return;
    setClassifications(function(prev) {
      var next = {};
      Object.keys(prev).forEach(function(k) { next[k] = prev[k]; });
      next[signalId] = answer;
      return next;
    });
  }

  var allClassified = signals.every(function(s) { return classifications[s.id]; });

  function handleTriageCheck() {
    setTriageRevealed(true);
  }

  var triageScore = null;
  if (triageRevealed) {
    var correctCount = signals.filter(function(s) { return classifications[s.id] === s.answer; }).length;
    triageScore = { correct: correctCount, total: signals.length };
  }

  var MCQ = {
    question: 'Your team\'s daily revenue dashboard shows a 15% spike overnight. Order volume is flat. Average order value is flat. Customer support tickets are at normal levels. What should you investigate first?',
    options: [
      { id: 'a', text: 'A. A viral marketing campaign drove high-value customers to the site overnight, boosting revenue' },
      { id: 'b', text: 'B. A currency conversion or tax calculation bug in the pipeline inflated revenue figures' },
      { id: 'c', text: 'C. A competitor went down overnight, redirecting all of their customers to your platform' },
      { id: 'd', text: 'D. A pricing algorithm update silently increased prices across the entire catalog overnight' },
    ],
    correct: 'b',
    explanation: 'When revenue spikes but order count AND average order value are both flat, the arithmetic does not add up for any real business explanation. More customers (A, C) would show in order volume. Higher prices (D) would show in AOV. The only explanation that fits flat volume + flat AOV + higher revenue is a data layer issue — currency conversion rates, tax inclusion logic, or a pipeline double-count. Data quality first, always.',
  };

  function handleMcqSelect(optId) {
    if (mcqAnswered) return;
    setMcqSelected(optId);
  }

  function handleMcqCheck() {
    setMcqAnswered(true);
  }

  var allDone = triageRevealed && mcqAnswered;

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>
          It&apos;s Monday morning. You open the dashboard and checkout events are down 40%. Your first thought is product regression — what shipped over the weekend? You start pulling the deploy log. An engineer joins the channel. A PM is already drafting a post-mortem template.
        </p>
        <p style={prose}>
          Slow down. Before you blame the product for anything, answer a simpler question: is the drop in your data real, or is something broken in how the data got there? A 40% drop in checkout events is consistent with two completely different situations. In the first, checkout genuinely declined. In the second, the events are happening but not being recorded — the tracking layer failed and you&apos;re looking at a measurement artifact.
        </p>
        <p style={prose}>
          Data quality failures are not rare. They cluster around the same events that cause metric drops: deploys, SDK updates, infrastructure changes. A deploy that ships on Friday night might include a code change that breaks event logging and a product change that degrades experience — simultaneously. If you jump to the product regression without ruling out the instrumentation failure first, you&apos;re investigating two simultaneous causes as one.
        </p>
        <p style={prose}>
          What you actually need is a four-question checklist. First: did tracking change? Look for any analytics SDK updates or event schema changes. Second: did a pipeline fail? Check ingestion for error rates or dropped batches. Third: is the drop platform-specific? An iOS-only drop is almost certainly a client-side SDK issue. Fourth: is only one event type affected? If checkout_complete is down 40% but checkout_initiated is flat, you have a logging bug — not a real behavior change.
        </p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>Purchase events are down 30%, but session events are flat. What does this pattern tell you — and what does it rule out?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* === INTERACTIVE JSX === */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Data Quality vs. Product Signal</div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
            Data quality issues and real product problems produce metric drops that look identical on a dashboard. The difference is in the <strong>symptom pattern</strong>. Data issues tend to be suspiciously clean — uniform across segments, aligned to pipeline schedules (midnight UTC), isolated to one platform with no user-facing impact. Product problems are messy — they hit some segments harder than others, correlate with deployments, and generate user complaints.
          </p>
        </div>

        {/* Interactive: Data Quality Triage Board */}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Data Quality Triage Board</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 1rem' }}>
            You are investigating the 30% Android session drop. Below are 8 signals your team has surfaced. For each one, classify it: does this point to a <strong>data issue</strong> (pipeline, SDK, logging) or a <strong>real product problem</strong> (broken feature, bad release, UX regression)?
          </p>

          {signals.map(function(signal) {
            var userAnswer = classifications[signal.id];
            var isCorrect = userAnswer === signal.answer;
            var rowBg = 'var(--surface-2)';
            var rowBorder = 'var(--border)';

            if (triageRevealed) {
              rowBg = isCorrect ? 'var(--teal-bg)' : 'var(--red-bg)';
              rowBorder = isCorrect ? 'var(--teal-border)' : 'var(--red-border)';
            }

            return (
              <div key={signal.id} style={{ background: rowBg, border: '1.5px solid ' + rowBorder, borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: triageRevealed ? '0.25rem' : '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.55, marginBottom: '0.5rem', fontWeight: 500 }}>
                  {signal.text}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={function() { classify(signal.id, 'data'); }} disabled={triageRevealed} style={{
                    padding: '0.3rem 0.85rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.78rem', fontWeight: 600,
                    borderRadius: 'var(--radius-sm)', cursor: triageRevealed ? 'default' : 'pointer',
                    background: userAnswer === 'data' ? 'var(--teal)' : 'var(--surface)',
                    color: userAnswer === 'data' ? '#fff' : 'var(--text-muted)',
                    border: '1.5px solid ' + (userAnswer === 'data' ? 'var(--teal)' : 'var(--border)'),
                    transition: 'all 0.15s',
                  }}>
                    Data Issue
                  </button>
                  <button onClick={function() { classify(signal.id, 'product'); }} disabled={triageRevealed} style={{
                    padding: '0.3rem 0.85rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.78rem', fontWeight: 600,
                    borderRadius: 'var(--radius-sm)', cursor: triageRevealed ? 'default' : 'pointer',
                    background: userAnswer === 'product' ? 'var(--purple)' : 'var(--surface)',
                    color: userAnswer === 'product' ? '#fff' : 'var(--text-muted)',
                    border: '1.5px solid ' + (userAnswer === 'product' ? 'var(--purple)' : 'var(--border)'),
                    transition: 'all 0.15s',
                  }}>
                    Product Signal
                  </button>
                </div>
                {triageRevealed && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {isCorrect ? <Icon name='check' size={13} color='var(--green)' /> : <Icon name='x' size={13} color='var(--red)' />} <strong style={{ color: signal.answer === 'data' ? 'var(--teal)' : 'var(--purple)' }}>{signal.answer === 'data' ? 'Data Issue' : 'Product Signal'}.</strong> {signal.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {allClassified && !triageRevealed && (
            <button onClick={handleTriageCheck} style={{
              marginTop: '0.75rem', padding: '0.5rem 1.2rem', minHeight: 40,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--teal)', color: '#fff', fontWeight: 600,
              fontSize: '0.85rem', cursor: 'pointer',
            }}>
              Check My Classifications
            </button>
          )}

          {triageRevealed && triageScore && (
            <div style={{ marginTop: '0.75rem', padding: '0.65rem 1rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: triageScore.correct >= 7 ? 'var(--teal)' : triageScore.correct >= 5 ? 'var(--yellow)' : 'var(--red)' }}>
                {triageScore.correct} / {triageScore.total} correct
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                {triageScore.correct === triageScore.total ? 'Perfect. You can distinguish data noise from real signal — this is the single most valuable triage skill an analyst can have.' : triageScore.correct >= 6 ? 'Strong. The signals you missed are subtle — review the explanations to sharpen your pattern recognition.' : 'Review the explanations carefully. The patterns here — uniform magnitude, UTC-aligned timing, platform isolation — are the fingerprints of data issues you will see over and over.'}
              </div>
            </div>
          )}
        </div>

        {/* Framework section */}
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The 3-Layer Data Quality Check</div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
            Before generating any product hypothesis, run the metric through three layers: <strong>(1) Is the data arriving?</strong> Check pipeline health dashboards, ingestion lag, and job completion logs — a failed Airflow DAG or a Kafka consumer lag spike explains most overnight drops in under 5 minutes. <strong>(2) Is the data correct?</strong> Look for schema changes, SDK version bumps, new event definitions, or field-type mismatches — a renamed event or a changed enum silently breaks downstream aggregations. <strong>(3) Is the data complete?</strong> Check for missing segments, time gaps, and coverage — a filter that excludes one country or one device type creates a partial drop that looks like a product problem but is just an incomplete picture. If all three layers pass, then — and only then — start investigating product changes.
          </p>
        </div>

        {/* Quick Check MCQ */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Check</div>
          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>{MCQ.question}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {MCQ.options.map(function(opt) {
              return (
                <MCQOption key={opt.id} label={opt.text} selected={mcqSelected === opt.id} correct={opt.id === MCQ.correct} revealed={mcqAnswered} onClick={function() { handleMcqSelect(opt.id); }} />
              );
            })}
          </div>
          {mcqSelected && !mcqAnswered && (
            <button onClick={handleMcqCheck} style={{ marginTop: '0.75rem', padding: '0.45rem 1.1rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Check</button>
          )}
          {mcqAnswered && (
            <div style={{ marginTop: '0.75rem', background: mcqSelected === MCQ.correct ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (mcqSelected === MCQ.correct ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <strong>{mcqSelected === MCQ.correct ? <><Icon name='check' size={13} color='var(--green)' /> Correct. </> : <><Icon name='x' size={13} color='var(--red)' /> Not quite. </>}</strong>{MCQ.explanation}
            </div>
          )}
        </div>
      </div>

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {allDone && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>Sessions flat, purchases down 30% means the users are arriving and using the product, but one specific event is not being recorded or not being triggered. A pipeline failure would take all events down. An SDK failure would likely affect all events on one platform. One event type down while others are flat is the fingerprint of a logging bug — a specific event fire condition broken by a code change. You&apos;ve eliminated pipeline failure and platform SDK as candidates with that one pattern observation.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {allDone && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Build a data quality checklist into your incident response playbook and run it before any other investigation step. The checklist is four questions: tracking change, pipeline failure, platform-specific, event-specific. Time-box it to ten minutes. If you clear all four, proceed to product investigation. If any flag, pursue that thread first.</p>
            <p style={prose}><strong>Two.</strong> When you observe a metric drop, always check a correlated metric before escalating. Checkout down 40% means nothing without knowing whether sessions are also down. The ratio between two related metrics tells you more than either absolute number.</p>
            <p style={prose}><strong>Three.</strong> The most expensive data quality mistake is not catching it at all — it&apos;s running a full RCA on broken data and presenting findings to leadership. If you&apos;re two hours into an investigation and something feels off about the numbers, stop and re-run the four-question checklist. It&apos;s worth the interruption.</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {allDone && <NextBtn onClick={onComplete} />}
    </div>
  );
}
