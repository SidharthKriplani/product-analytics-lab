import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const SYMPTOMS_RF10 = [
  {
    id: 'A',
    symptom: 'iOS event count drops -40% starting Monday. Android and Web are stable. All event types on iOS are affected equally — session_start, checkout, add_to_cart all down the same proportion.',
    correct: 'SDK change',
    explanation: 'When one platform is uniformly affected across all event types, the instrumentation layer is broken — not a specific feature. SDK updates, library version changes, or OS-level permission changes cause exactly this pattern.',
  },
  {
    id: 'B',
    symptom: 'All platforms show normal event volumes for every event type except checkout_complete, which dropped 90% on Wednesday. session_start, add_to_cart, product_view are all normal.',
    correct: 'Logging bug',
    explanation: 'When a single event type drops across all platforms while all others are healthy, someone broke the specific event\'s instrumentation — a parameter rename, a missing trigger condition, or a typo in the event name.',
  },
  {
    id: 'C',
    symptom: 'All platforms affected, all event types dropped simultaneously at 3:14 AM. Raw table row counts are near zero from 3:14 AM onward. Downstream dashboards show flatlines.',
    correct: 'Pipeline failure',
    explanation: 'A simultaneous drop across all platforms and all events, with near-zero raw table rows, is a data engineering failure — an ingestion job, ETL pipeline, or Kafka consumer stopped processing. No product or SDK change produces this pattern.',
  },
];

const DIAGNOSES = ['SDK change', 'Logging bug', 'Pipeline failure'];
const DIAGNOSIS_COLORS = {
  'SDK change': { bg: 'var(--yellow-bg)', border: 'var(--yellow-border)', text: 'var(--yellow)' },
  'Logging bug': { bg: 'var(--accent-bg)', border: 'var(--accent-border)', text: 'var(--accent)' },
  'Pipeline failure': { bg: 'var(--red-bg)', border: 'var(--red-border)', text: 'var(--red)' },
};

const RF10_MCQ = {
  question: 'Why should data quality be checked before product hypotheses in an RCA?',
  options: [
    'Data quality issues are rare but catastrophic, so they should be ruled out early as a precautionary measure even if it delays the investigation',
    'Data quality issues are cheap and fast to rule out, and empirically they are the single most common source of false alarms in RCA investigations',
    'Product hypotheses require stakeholder alignment before investigation can formally begin, so checking data quality fills the waiting time productively',
    'Data quality checks establish a validated baseline before segmentation — without them, any decomposition could be built on faulty numbers',
  ],
  correct: 1,
  explanation: 'Data quality checks take minutes and are the most frequent cause of false RCA alarms. Option A gets the reasoning backwards — data quality issues are common, not rare. Option C confuses sequencing with stakeholder coordination. Option D sounds rigorous ("validate before you segment") but describes a benefit of data quality checks, not the reason they come first — the real reason is cost-effectiveness: they are cheap to do and eliminate the most common false alarms before expensive product investigation begins.',
};

export function Module_RF10({ onComplete }) {
  const _saved10 = useMemo(function() { return loadRFState('rf10'); }, []);
  const [symptoms10] = useState(function() { return _saved10 && _saved10.symptoms ? _saved10.symptoms : shuffleArr(SYMPTOMS_RF10); });
  const [selections, setSelections] = useState(function() { return _saved10 && _saved10.selections ? _saved10.selections : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved10 && _saved10.revealed ? _saved10.revealed : {}; });
  const [mcqSel, setMcqSel] = useState(function() { return _saved10 && _saved10.mcqSel != null ? _saved10.mcqSel : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved10 ? !!_saved10.mcqRevealed : false; });

  useEffect(function() { saveRFState('rf10', { symptoms: symptoms10, selections: selections, revealed: revealed, mcqSel: mcqSel, mcqRevealed: mcqRevealed }); }, [symptoms10, selections, revealed, mcqSel, mcqRevealed]);

  const allCorrect = symptoms10.every(function(s) { return revealed[s.id] && selections[s.id] === s.correct; });
  const allRevealed = symptoms10.every(function(s) { return revealed[s.id]; });

  function selectDiagnosis(symptomId, diagnosis) {
    if (revealed[symptomId]) return;
    setSelections(function(prev) { return Object.assign({}, prev, { [symptomId]: diagnosis }); });
  }

  function checkSymptom(symptomId) {
    setRevealed(function(prev) { return Object.assign({}, prev, { [symptomId]: true }); });
  }

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>Session start events dropped 35% on iOS. Your on-call engineer is paging in. The PM is asking about the retention impact. Someone is drafting a communication to the growth team about the acquisition implications.</p>
        <p style={prose}>Before anyone does any of that: which failure pattern does this fit? An instrumentation failure has a fingerprint. The drop&apos;s scope — which metrics, which platforms, which time windows are affected — identifies which part of the measurement stack failed. These fingerprints are recognizable in under five minutes if you know what to look for. And you must look before doing anything else, because the three failure patterns have three completely different owners and three completely different fixes.</p>
        <p style={prose}>Pattern one is a platform-specific drop: one platform shows a significant decline while the others are flat. This almost always indicates a client-side SDK change or a platform-specific code path that broke. Pattern two is an event-level drop: one event type is down significantly while other event types that should track with it are flat. This is a logging bug — the event fire condition was broken by a code change. Pattern three is a pipeline failure: all event types, all platforms, all regions are down simultaneously at a specific timestamp. The events are happening; they&apos;re not being ingested.</p>
        <p style={prose}>The diagnostic is a cross-tab: events affected (one type vs. multiple) times platforms affected (one vs. multiple) times time scope (cliff vs. gradient). All events, all platforms, vertical cliff points to pipeline failure. All events, one platform, vertical cliff points to SDK or platform deploy. One event, one or all platforms, vertical cliff points to logging bug. Gradual decline across all events and platforms points to product or behavior — not instrumentation.</p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>add_to_cart events are down 40% globally (all platforms, all regions), but product_view events are flat globally. What pattern does this fit, and what does it rule out?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
        Three data quality failure patterns account for the vast majority of false alarms in RCA. Each has a distinct signature. Match each symptom pattern to the correct diagnosis, then check your answer before moving to the next.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {DIAGNOSES.map(function(d) {
          const c = DIAGNOSIS_COLORS[d];
          return (
            <span key={d} style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', background: c.bg, border: '1px solid ' + c.border, color: c.text }}>
              {d}
            </span>
          );
        })}
      </div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> For each symptom pattern, click the diagnosis that fits — an explanation reveals after your selection.
      </div>

      {symptoms10.map(function(s) {
        const sel = selections[s.id];
        const isRevealed = !!revealed[s.id];
        const isCorrect = sel === s.correct;
        return (
          <div key={s.id} style={{
            background: 'var(--surface-2)', border: '1px solid ' + (isRevealed ? (isCorrect ? 'var(--teal-border)' : 'var(--red-border)') : 'var(--border)'),
            borderRadius: 'var(--radius)', padding: '1rem 1.1rem',
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Symptom {s.id}</div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{s.symptom}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
              {DIAGNOSES.map(function(d) {
                const c = DIAGNOSIS_COLORS[d];
                const isSelected = sel === d;
                const isCorrDiag = d === s.correct;
                let bg = 'var(--surface)';
                let border = 'var(--border)';
                let color = 'var(--text-muted)';
                if (isRevealed) {
                  if (isCorrDiag) { bg = c.bg; border = c.border; color = c.text; }
                  else if (isSelected && !isCorrDiag) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
                } else if (isSelected) {
                  bg = c.bg; border = c.border; color = c.text;
                }
                return (
                  <button
                    key={d}
                    onClick={function() { selectDiagnosis(s.id, d); }}
                    disabled={isRevealed}
                    style={{
                      padding: '0.3rem 0.75rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid ' + border, background: bg, color,
                      fontSize: '0.8rem', fontWeight: isSelected || (isRevealed && isCorrDiag) ? 700 : 400,
                      cursor: isRevealed ? 'default' : 'pointer', transition: 'all 0.15s',
                    }}
                  >{d}</button>
                );
              })}
            </div>
            {sel && !isRevealed && (
              <button
                onClick={function() { checkSymptom(s.id); }}
                style={{ padding: '0.35rem 0.85rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >Check</button>
            )}
            {isRevealed && (
              <div style={{ marginTop: '0.45rem', padding: '0.55rem 0.8rem', background: isCorrect ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (isCorrect ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: isCorrect ? 'var(--teal)' : 'var(--red)', lineHeight: 1.55 }}>
                <strong>{isCorrect ? 'Correct. ' : 'Incorrect — the answer is ' + s.correct + '. '}</strong>{s.explanation}
              </div>
            )}
          </div>
        );
      })}

      {allRevealed && (
        <div>
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            <strong>What to do:</strong> Select the answer that correctly describes why data quality comes first, then click Check.
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.65rem' }}>{RF10_MCQ.question}</div>
          {RF10_MCQ.options.map(function(opt, oi) {
            return (
              <MCQOption
                key={oi}
                label={opt}
                selected={mcqSel === oi}
                correct={oi === RF10_MCQ.correct}
                revealed={mcqRevealed}
                onClick={function() { if (!mcqRevealed) setMcqSel(oi); }}
              />
            );
          })}
          {mcqSel !== null && !mcqRevealed && (
            <button
              onClick={function() { setMcqRevealed(true); }}
              style={{ marginTop: '0.4rem', padding: '0.45rem 1rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}
            >Check</button>
          )}
          {mcqRevealed && (
            <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>
              {RF10_MCQ.explanation}
            </div>
          )}
        </div>
      )}

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {mcqRevealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>One event type (add_to_cart) down globally while correlated events (product_view) are flat is an event-level pattern — a logging bug for that specific event. A pipeline failure would take all events down. A platform SDK failure would affect all events on one platform. The global scope rules out a platform-specific SDK issue. This is a logging bug in the add_to_cart event fire condition, likely introduced by a recent code change that touched the cart interaction code path.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {mcqRevealed && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> The first two queries in any instrumentation investigation are always the same: which other event types are affected, and which platforms are affected? These two questions together generate the pattern cross-tab and route the investigation to the right team. Run these before you look at anything else.</p>
            <p style={prose}><strong>Two.</strong> Keep a deploy log open in a second tab during any incident. The exact timestamp of the metric cliff is your primary anchor. The deploy that happened within thirty minutes before that timestamp is your primary candidate. When you have the pattern and the timestamp, the deploy log search is a five-minute confirmation, not a fishing expedition.</p>
            <p style={prose}><strong>Three.</strong> When the investigation resolves to a logging bug (event-level pattern), document what the working fire condition looks like and add a regression test. Logging bugs recur because they leave no trace in the product experience — users can still checkout, still add to cart, still browse — the only signal is the measurement layer. Without a test, the same code path will break again the next time someone touches that event.</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {mcqRevealed && <NextBtn onClick={onComplete} />}
    </div>
  );
}
