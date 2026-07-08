import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const MF05_PAIRS_DEFAULT = [
  { primary: 'Push notification send volume', correct: 'notif-opt-out', options: ['notif-opt-out', 'dau', 'session-length'], labels: { 'notif-opt-out': 'Notification opt-out rate', 'dau': 'Overall daily active users', 'session-length': 'Average user session length' } },
  { primary: 'Ads shown per session', correct: 'ad-hide', options: ['ad-hide', 'page-load', 'revenue'], labels: { 'ad-hide': 'Ad hide / negative feedback rate', 'page-load': 'Page load time across all sessions', 'revenue': 'Total ad revenue generated per user' } },
  { primary: 'Search ranking aggressiveness (more results)', correct: 'zero-click', options: ['zero-click', 'query-count', 'ctr'], labels: { 'zero-click': 'Zero-click abandonment rate', 'query-count': 'Total search queries submitted', 'ctr': 'Result click-through rate' } },
];

export function Module_MF05({ module, onNext }) {
  const saved05 = useMemo(function() { return loadMFState('mf05'); }, []);
  const [pairs, setPairs] = useState(function() { return saved05 && saved05.pairs ? saved05.pairs : shuffleMF(MF05_PAIRS_DEFAULT); });
  const [answers, setAnswers] = useState(function() { return saved05 && saved05.answers ? saved05.answers : {}; });
  const [checked, setChecked] = useState(function() { return saved05 ? saved05.checked : false; });

  useEffect(function() {
    saveMFState('mf05', { pairs: pairs, answers: answers, checked: checked });
  }, [pairs, answers, checked]);

  const allAnswered = pairs.every(function(_, i) { return answers[i] !== undefined; });
  const score = checked ? pairs.filter(function(p, i) { return answers[i] === p.correct; }).length : null;

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>A counter metric is a metric that moves in the opposite direction when you game the primary. It names the thing your primary metric can be inflated at the expense of. If your primary metric is &quot;notifications clicked,&quot; the counter metric is &quot;notifications dismissed&quot; or &quot;notification opt-out rate.&quot; You can always get more clicks by sending more notifications &mdash; but that path eventually degrades the experience the clicks were supposed to represent.</p>
        <p style={prose}>Counter metrics make tradeoffs visible. Without one, a team can move the primary metric in the target direction and declare success. With one, that same movement is interrogated: did the counter metric hold?</p>
        <p style={prose}>The natural first instinct when designing an experiment is to pick a primary metric and ship when it moves. Additional metrics add complexity and can create ambiguity about what &quot;win&quot; means. But here&apos;s where it breaks.</p>
        <p style={prose}>Almost every primary metric in a product has an easy inflation path that doesn&apos;t require actually improving the product. Push notification click-through can be inflated by sending more notifications per day &mdash; volume does the work, not relevance. Session count can be inflated by adding friction that forces users to restart sessions. In each case, the primary metric went up, the product got worse, and nobody noticed until downstream signals caught it.</p>
        <p style={prose}>A counter metric closes this gap. It&apos;s not a metric you optimize for &mdash; it&apos;s a metric you commit to not breaking. The primary defines what you&apos;re chasing. The counter defines what you&apos;re not allowed to sacrifice to get there.</p>
        <p style={prose}>The relationship between counter and primary is structural: a counter metric is the natural consequence of gaming the primary. Push CTR &rarr; counter is opt-out rate. Session count &rarr; counter is rage-click rate or error rate. The counter is almost always derivable by asking: &quot;what&apos;s the cheapest way to inflate the primary without improving anything?&quot; &mdash; and then measuring that path directly.</p>
        <p style={prose}>A guardrail is a counter metric elevated to a hard constraint: a threshold that, if breached, blocks the ship decision regardless of primary metric performance. Counter metrics make tradeoffs visible; guardrails pre-commit the team to specific tradeoffs that are not acceptable.</p>
        <p style={prose}>Let&apos;s take an example. A notifications team proposes increasing push frequency from 2/day to 4/day. Primary metric: daily notification opens. They predict a 15% lift. You add counter metrics: notification opt-out rate and per-user opens-per-sent. The experiment now has a primary and two counters. The first-week lift in opens looks good. But by week two, opt-out rate is rising and opens-per-sent is declining. The experiment flags as a mixed result. The team redesigns for relevance instead of frequency. The counter metric caught the quality degradation before it compounded.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>If you were trying to increase &quot;content pieces viewed&quot; as your primary metric, what would be the easiest way to inflate it without improving the product? What counter metric would catch that path?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive ── */}
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
        Every metric you optimise creates pressure to sacrifice something else.
        <strong> Counter metrics</strong> make that tradeoff explicit before an experiment ships.
      </p>

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
                  {checked && isCorrect ? <Icon name='check' size={12} color='currentColor' /> : checked && sel ? <Icon name='x' size={12} color='currentColor' /> : null}{checked && (isCorrect || sel) ? ' ' : ''}{pair.labels[opt]}
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
          {score === pairs.length ? <><Icon name='check' size={13} color='var(--green)' /> All correct. Opt-out rate catches notification fatigue. Ad hide rate catches ad quality degradation. Zero-click rate catches search quality degradation.</> : score + '/' + pairs.length + '. Counter metrics protect the quality of the user experience that isn\'t captured in the primary optimisation signal.'}
        </div>
      )}

      {/* ── What you should have confirmed ── */}
      {checked && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>&quot;Content pieces viewed&quot; is easiest to inflate by making content extremely short or by auto-advancing to the next piece without user intent. The counter metrics are average content depth (time spent per piece) and voluntary continuation rate (did the user choose to go to the next piece or was it auto-advanced?). Without these counters, a team that fragments content into smaller pieces can double &quot;pieces viewed&quot; while delivering less total value per session.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {checked && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> For every proposed primary experiment metric, ask immediately: what&apos;s the cheapest way to move this without improving anything? That path is what your counter metric should measure. If you can&apos;t answer the gaming question in sixty seconds, the metric probably hasn&apos;t been thought through carefully enough to use.</p>
            <p style={prose}><strong>Two.</strong> Add at least one counter metric to every experiment before launch. Not after &mdash; the whole point of a counter is that it&apos;s checked at read-out, and it only has force if it was pre-specified. A counter metric added after you&apos;ve seen the primary results is a rationalization, not a constraint.</p>
            <p style={prose}><strong>Three.</strong> The common mistake is treating counter metrics as secondary metrics that &quot;we&apos;ll look at if something seems off.&quot; The distinction matters: a secondary metric is one you might learn from. A counter metric is one that can veto the ship decision. If you didn&apos;t elevate it to veto status before the experiment, it has no teeth at read-out.</p>
          </div>
        </div>
      )}

      {/* ── Key Insight + Connection ── */}
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}
