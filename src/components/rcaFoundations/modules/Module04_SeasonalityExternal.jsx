import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const FACTORS_RF04 = [
  { text: 'Monday — lower engagement vs Friday on a consumer social app', type: 'seasonal', label: 'Day-of-week' },
  { text: 'Thanksgiving week — US DAU spikes for recipe apps', type: 'seasonal', label: 'Holiday' },
  { text: 'Major competitor launches a free tier matching our core features', type: 'external', label: 'Competitor' },
  { text: 'Apple changes App Store search ranking algorithm', type: 'external', label: 'Platform' },
  { text: 'Marketing budget cut 60% in Q4 vs Q3', type: 'external', label: 'Marketing' },
  { text: 'January — fitness app signups spike after New Year resolutions', type: 'seasonal', label: 'Seasonal trend' },
];

export function Module_RF04({ onComplete }) {
  const _saved04 = useMemo(function() { return loadRFState('rf04'); }, []);
  const [factors04] = useState(function() { return _saved04 && _saved04.factors ? _saved04.factors : shuffleArr(FACTORS_RF04); });
  const [selected, setSelected] = useState(function() { return _saved04 && _saved04.selected ? _saved04.selected : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved04 ? !!_saved04.revealed : false; });

  useEffect(function() { saveRFState('rf04', { factors: factors04, selected: selected, revealed: revealed }); }, [factors04, selected, revealed]);

  function assign(i, type) {
    if (revealed) return;
    setSelected(prev => ({ ...prev, [i]: type }));
  }

  const allAssigned = factors04.every((_, i) => selected[i]);

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>
          It&apos;s the first Tuesday after a long weekend. Weekly active users are down 12%. The product team is nervous. Someone pulls the deploy log. Another person is querying cohort retention. A third is drafting an escalation email.
        </p>
        <p style={prose}>
          Before any of that: what day was it yesterday? Monday traffic is structurally lower than the rest of the week for most consumer products. A long weekend compounds this — the Monday following a three-day holiday carries suppressed traffic for both the holiday and the Monday itself. A weekly active user count that includes that Monday will be lower than a week without a holiday, not because anything changed in the product, but because your measurement window included fewer high-traffic days.
        </p>
        <p style={prose}>
          The discipline is treating external and seasonal factors as the null hypothesis. Your default position is: the product didn&apos;t cause this, something outside the product did. Your investigation must rule that out before attributing anything to product changes or user behavior shifts. The checklist is short: calendar check, year-over-year comparison, competitor activity, platform changes, marketing activity.
        </p>
        <p style={prose}>
          If external factors can explain the drop, the investigation is complete. If they can&apos;t — if the pattern doesn&apos;t match seasonality, if there are no external events, if the drop is in an unexpected direction compared to prior years — then you&apos;ve ruled out the null hypothesis and the investigation proceeds to product causes.
        </p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>DAU is down 8% this week compared to last week. You compare to the same week last year and it was also down 8%. Does this confirm that seasonality explains the drop, or does it raise the hypothesis without proving it?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* === INTERACTIVE JSX === */}
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          Not every metric movement is caused by the product. Seasonal patterns repeat on a calendar schedule and are detectable with year-over-year comparisons. External factors are one-off market or platform events that require a different kind of awareness. Distinguishing them quickly stops you from filing a bug for a holiday.
        </p>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
          Before diagnosing a product problem, you must rule out time-based and external causes.
          Classify each factor as <strong>Seasonal</strong> (time-based, predictable) or <strong>External</strong> (market/platform, unpredictable):
        </p>

        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> For each factor, click Seasonal or External — ask yourself whether a calendar alone could predict this event, or whether it required something outside your control to happen.
        </div>

        {factors04.map((f, i) => {
          const sel = selected[i];
          const correct = f.type;
          let rowBg = 'var(--surface-2)';
          if (revealed) {
            rowBg = sel === correct ? 'var(--teal-bg)' : 'var(--red-bg)';
          }
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 0.9rem', marginBottom: '0.5rem',
              background: rowBg, border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text)', minWidth: 160 }}>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 3, padding: '0.1rem 0.35rem', marginRight: '0.5rem',
                }}>
                  {f.label}
                </span>
                {f.text}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                {['seasonal', 'external'].map(type => (
                  <button key={type} onClick={() => assign(i, type)} disabled={revealed} style={{
                    padding: '0.3rem 0.65rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 600,
                    borderRadius: 'var(--radius-sm)', cursor: revealed ? 'default' : 'pointer',
                    background: sel === type ? (revealed ? (sel === correct ? 'var(--teal)' : 'var(--red)') : 'var(--teal)') : 'var(--surface)',
                    color: sel === type ? '#fff' : 'var(--text-muted)',
                    border: '1px solid ' + (sel === type ? (revealed ? (sel === correct ? 'var(--teal-border)' : 'var(--red-border)') : 'var(--teal-border)') : 'var(--border)'),
                  }}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {!revealed && allAssigned && (
          <button onClick={() => setRevealed(true)} style={{
            marginTop: '0.75rem', padding: '0.55rem 1.2rem', minHeight: 40,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--teal)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
          }}>
            Check
          </button>
        )}
      </div>

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {revealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>One matching year raises the seasonality hypothesis but doesn&apos;t confirm it. The same-week comparison from last year might itself have been anomalous. You need at least two prior years showing the same pattern before calling the drop seasonal with confidence. One coincident year could be noise. Three consistent years is a pattern. When year two diverges, confidence in the seasonal explanation should drop accordingly.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {revealed && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Make the calendar check a reflex. Before you write your first SQL query in an investigation, open a calendar and look at the date range of the drop. Holiday? Post-holiday? Fiscal month-end? These take seconds and will save hours.</p>
            <p style={prose}><strong>Two.</strong> When presenting a metric drop to leadership, the first slide should answer: is this seasonal or not? If it&apos;s seasonal, show the prior-year comparison and close the case. If it&apos;s not, show the prior-year comparison specifically to demonstrate you&apos;ve ruled out the null hypothesis. Leadership doesn&apos;t want a product investigation — they want the cause. Start with the cheapest candidates.</p>
            <p style={prose}><strong>Three.</strong> Build a calendar of known seasonality events for your product: major holidays, industry-specific events, annual price adjustment periods, back-to-school windows. When a drop hits, you check against this calendar first rather than reconstructing the context from scratch every time.</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {revealed && <NextBtn onClick={onComplete} />}
    </div>
  );
}
