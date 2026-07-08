import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

export function Module_RF05({ onComplete }) {
  const EXISTING_RETENTION = 36;
  const CAMPAIGN_RETENTION = 14;
  const BASELINE_NEW_PCT = 18;

  const _saved05 = useMemo(function() { return loadRFState('rf05'); }, []);
  const [newUserPct, setNewUserPct] = useState(function() { return _saved05 && _saved05.newUserPct != null ? _saved05.newUserPct : BASELINE_NEW_PCT; });
  const [mcqSel, setMcqSel] = useState(function() { return _saved05 && _saved05.mcqSel != null ? _saved05.mcqSel : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved05 ? !!_saved05.mcqRevealed : false; });

  const existingPct = 100 - newUserPct;
  const aggregate = Math.round((existingPct / 100) * EXISTING_RETENTION + (newUserPct / 100) * CAMPAIGN_RETENTION);
  const baselineAggregate = Math.round((82 / 100) * EXISTING_RETENTION + (18 / 100) * CAMPAIGN_RETENTION);

  const barWidth = 260;
  const retMax = 45;

  function retToX(r) { return (r / retMax) * barWidth; }

  const options = [
    { label: 'A. Retained users from the previous cohort are churning faster — investigate product quality in each market', correct: false },
    { label: 'B. The new acquisition cohort has lower baseline retention, pulling the aggregate down (mix shift)', correct: true },
    { label: 'C. A new geography was added to the aggregate with structurally lower retention, diluting the overall rate', correct: false },
    { label: 'D. D7 retention calculation is incorrect — check the pipeline', correct: false },
  ];

  useEffect(function() { saveRFState('rf05', { newUserPct: newUserPct, mcqSel: mcqSel, mcqRevealed: mcqRevealed }); }, [newUserPct, mcqSel, mcqRevealed]);

  const sliderInteracted = newUserPct !== BASELINE_NEW_PCT;

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>
          A VP pulls up the dashboard and says &quot;conversion rate dropped 3 points.&quot; You check the conversion rate for each major market: US is flat. UK is up slightly. Germany is up 2 points. Brazil is flat. India is up 1 point. Every single market is flat or improving. The aggregate dropped 3 points. How?
        </p>
        <p style={prose}>
          This is not a contradiction. It&apos;s a composition effect. The aggregate conversion rate is a weighted average of all markets, where the weights are the share of traffic each market contributes. If a low-converting market sent a surge of traffic this week — a marketing campaign in Brazil pushed a large new-user wave — it drags the aggregate down even though Brazil&apos;s own conversion rate is flat. The product did not get worse in any market. The mix of users changed.
        </p>
        <p style={prose}>
          Aggregate metrics are weighted sums. The weight of each segment is its traffic share. When traffic shares shift, the aggregate shifts with them — even if nothing about behavior changed within any segment. If you investigate a composition-driven drop as a product problem, you&apos;ll run A/B tests, audit the checkout flow, and query session data looking for friction — and find nothing. Because there&apos;s nothing to find.
        </p>
        <p style={prose}>
          The formal name for the extreme version of this effect is Simpson&apos;s Paradox: when a metric improves in every segment simultaneously but the aggregate moves in the opposite direction. The diagnostic is simple: break the aggregate by the dimension you suspect is shifting, and compute the metric within each segment. If each segment is flat or improving, you have a composition effect. If all segments are down, the product problem is real and pervasive.
        </p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>Conversion rate is down 2 points in aggregate. Mobile conversion is flat and desktop conversion is flat. Without looking at traffic mix data, what must be true about the traffic mix to explain the aggregate drop?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* === INTERACTIVE JSX === */}
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Aggregate metrics can move in the wrong direction even when every individual segment is healthy. Move the slider below and watch what happens to overall D7 retention — without touching either segment.
        </p>

        {/* Interactive playground */}
        <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
            Mix-shift playground
          </div>

          {/* Slider */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Campaign users as % of DAU
              </label>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: newUserPct > 35 ? 'var(--red)' : 'var(--text)', minWidth: '3rem', textAlign: 'right' }}>
                {newUserPct}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={80}
              step={1}
              value={newUserPct}
              onChange={e => setNewUserPct(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--teal)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              <span>5% (normal)</span>
              <span>80% (aggressive campaign)</span>
            </div>
          </div>

          {/* Retention bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
            {[
              { label: 'Existing user D7', value: EXISTING_RETENTION, color: 'var(--teal)', stable: true },
              { label: 'Campaign cohort D7', value: CAMPAIGN_RETENTION, color: 'var(--accent)', stable: true },
              { label: 'Overall D7 (aggregate)', value: aggregate, color: aggregate < baselineAggregate - 1 ? 'var(--red)' : 'var(--teal)', stable: false, highlight: true },
            ].map((row, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', minWidth: 170 }}>{row.label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: row.highlight ? 800 : 600, color: row.color, minWidth: '2.5rem' }}>
                    {row.value}%
                  </span>
                  {row.stable && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>unchanged</span>}
                  {row.highlight && aggregate !== baselineAggregate && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: aggregate < baselineAggregate ? 'var(--red)' : 'var(--teal)' }}>
                      {aggregate < baselineAggregate ? '↓ ' + (baselineAggregate - aggregate) + 'pp' : '↑ ' + (aggregate - baselineAggregate) + 'pp'}
                    </span>
                  )}
                </div>
                <div style={{ height: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 5,
                    width: retToX(row.value) + 'px',
                    background: row.color,
                    transition: 'width 0.2s, background 0.2s',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Segments composition bar */}
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
              DAU composition
            </div>
            <div style={{ display: 'flex', height: 14, borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ width: existingPct + '%', background: 'var(--teal)', transition: 'width 0.2s' }} />
              <div style={{ width: newUserPct + '%', background: 'var(--accent)', transition: 'width 0.2s' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--teal)' }}>■ Existing {existingPct}%</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>■ Campaign {newUserPct}%</span>
            </div>
          </div>

          {sliderInteracted && (
            <div style={{ marginTop: '0.9rem', padding: '0.6rem 0.85rem', background: aggregate < baselineAggregate - 1 ? 'var(--red-bg)' : 'var(--teal-bg)', border: '1px solid ' + (aggregate < baselineAggregate - 1 ? 'var(--red-border)' : 'var(--teal-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: aggregate < baselineAggregate - 1 ? 'var(--red)' : 'var(--teal)', lineHeight: 1.5 }}>
              {aggregate < baselineAggregate - 1
                ? 'Aggregate fell to ' + aggregate + '% — but both segments are unchanged. The drop is caused entirely by the mix shift, not product quality.'
                : 'Aggregate is close to baseline — the mix is similar to normal.'}
            </div>
          )}
        </div>

        {/* Insight callout after slider interaction */}
        {sliderInteracted && (
          <div style={{
            borderLeft: '3px solid var(--discovery, #E8A033)',
            background: 'rgba(232,160,51,0.07)',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            padding: '0.75rem 1rem', marginBottom: '1.25rem',
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: '0.3rem' }}>Key observation</div>
            <div style={{ fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>
              Neither segment retention changed. Existing users still retain at {EXISTING_RETENTION}%. Campaign users still retain at {CAMPAIGN_RETENTION}%. The aggregate fell purely because the user mix shifted — this is Simpson&apos;s Paradox in action.
            </div>
          </div>
        )}

        {/* MCQ after slider interaction */}
        {sliderInteracted && (
          <div>
            <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
              <strong>What to do:</strong> Based on what the playground showed you, pick the correct explanation for the aggregate D7 drop.
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.85rem' }}>
              A fitness app&apos;s overall D7 retention drops from 32% to 28% after a major acquisition campaign. What explains it?
            </div>
            {options.map((opt, i) => (
              <MCQOption
                key={i}
                label={opt.label}
                selected={mcqSel === i}
                correct={opt.correct}
                revealed={mcqRevealed}
                onClick={() => !mcqRevealed && setMcqSel(i)}
              />
            ))}
            {mcqSel !== null && !mcqRevealed && (
              <button onClick={() => setMcqRevealed(true)} style={{
                marginTop: '0.5rem', padding: '0.5rem 1.1rem', minHeight: 40,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--teal)', color: '#fff', border: 'none',
                borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              }}>Check</button>
            )}
            {mcqRevealed && (
              <div style={{
                marginTop: '0.5rem', padding: '0.65rem 0.85rem',
                background: options[mcqSel]?.correct ? 'var(--teal-bg)' : 'var(--red-bg)',
                border: '1px solid ' + (options[mcqSel]?.correct ? 'var(--teal-border)' : 'var(--red-border)'),
                borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
              }}>
                When you run a large acquisition campaign, you add a wave of users who have not yet proven they will retain. The aggregate D7 retention drops not because existing users retained less, but because the mix shifted toward a lower-retaining cohort. Always segment by acquisition cohort before concluding there is a product problem.
              </div>
            )}
          </div>
        )}

        {!sliderInteracted && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.5rem' }}>
            Move the slider above to see what happens to the aggregate — then the follow-up question unlocks.
          </p>
        )}
      </div>

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {mcqRevealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>For the aggregate to drop 2 points while mobile and desktop are both flat, mobile&apos;s traffic share must have increased — because mobile converts at a lower rate. The math forces this: if aggregate = (mobile rate × mobile share) + (desktop rate × desktop share), and rates are unchanged, only a change in shares can move the aggregate. Once you see it, the diagnosis becomes a search for the traffic shift rather than a search for product degradation.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {mcqRevealed && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> When an aggregate metric drops, always segment it before investigating product causes. The segmentation query takes five minutes. It either confirms the drop is pervasive across segments (real product problem) or shows it&apos;s concentrated in or driven by a composition shift. Starting with the product investigation before segmenting is the expensive version of this checklist.</p>
            <p style={prose}><strong>Two.</strong> The dimensions to segment by are not arbitrary — they&apos;re the ones that correlate with both traffic volume changes and the metric value. For conversion rate, the usual suspects are device type, acquisition channel, geography, and new-vs-returning user status. If any of these dimensions saw a traffic mix shift in the same window as the aggregate drop, composition is a live hypothesis.</p>
            <p style={prose}><strong>Three.</strong> When you present aggregate metrics to leadership, flag if the aggregate moved in the opposite direction from the key segments. &quot;Aggregate conversion is down 2 points, but mobile is flat and desktop improved slightly — this is a traffic mix effect, not a product quality issue&quot; is a complete and accurate statement that prevents a misdirected investigation from being commissioned in the meeting.</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {mcqRevealed && <NextBtn onClick={onComplete} />}
    </div>
  );
}
