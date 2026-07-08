import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

export function Module_MF15({ module, onNext }) {
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
    { label: 'A. DAU growth proves the product is getting durably healthier overall — there is no reason for concern here.', correct: false },
    { label: 'B. DAU is rising from new user acquisition, not deeper engagement — the growth may not be durable.', correct: true },
    { label: 'C. DAU/MAU is just a vanity metric that leadership likes — only total DAU actually matters for the business.', correct: false },
    { label: 'D. The MAU denominator is probably miscalculated somewhere; go recheck the underlying tracking implementation.', correct: false },
  ];

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>Engagement depth measures how much of your potential user engagement is actually being realized. Not just whether users are present, but how often and how intensively. A product with 2 million daily active users could have 2 million people who open it every single day &mdash; or it could have 10 million people who open it once or twice a month, each contributing occasionally to the DAU count. The number 2 million DAU is the same in both cases. The product health is radically different.</p>
        <p style={prose}>Depth metrics reveal which of those worlds you&apos;re in. They measure the distribution of engagement intensity across the user base &mdash; not just the count of active users, but how active those users are.</p>
        <p style={prose}>The natural first instinct is to track DAU as the primary engagement signal. When DAU grows, the product is reaching more people. When it falls, fewer people are engaging. This is sufficient to answer &quot;are we growing?&quot; But here&apos;s where it breaks.</p>
        <p style={prose}>DAU tells you nothing about habit strength. A DAU of 2 million could be composed of 2 million different people each using the product once per month &mdash; in which case your 30-day active user base is 60 million, each engaging rarely. Or it could be 2 million people who use it every single day. The first profile is a mass-market product with low retention and high churn risk. The second is a habit product with strong long-term retention. Same DAU. Opposite health profiles.</p>
        <p style={prose}>What you actually need is a measure of how concentrated engagement is &mdash; are the same users accounting for DAU every day, or is it a rotating pool of occasional visitors?</p>
        <p style={prose}>The most common depth measure is DAU/MAU, often called stickiness. If DAU is 2 million and MAU is 10 million, DAU/MAU = 0.20. This means the average monthly active user was active on 20% of days in the last 30 days &mdash; about 6 days per month. A stickiness of 0.20 is typical of casual utilities. A stickiness of 0.50+ indicates daily-use habit products.</p>
        <p style={prose}>The Lness curve extends this. For every MAU, you ask: how many days out of the last 28 was this user active? Plot the distribution. L1 users were active exactly 1 day. L28 users were active all 28 days. The shape of this distribution tells you the structure of your user base: how much comes from daily-use habits, how much from weekly check-ins, how much from rare visitors who barely qualify as MAU.</p>
        <p style={prose}>Let&apos;s take an example. A productivity tool has 2 million MAU. DAU/MAU = 0.12 &mdash; users are active about 3.5 days per month. Lness distribution: L1&ndash;3 (1&ndash;3 days active): 40% of MAU. L4&ndash;7: 30%. L8&ndash;14: 18%. L15&ndash;21: 8%. L22&ndash;28: 4%. Most of the MAU base is using the product very rarely. The 4% who use it 22+ days per month are likely power users generating the majority of value. A DAU-based review would report the aggregate and miss that the core engaged base is 80,000 users &mdash; 4% of 2 million &mdash; not 2 million. Leadership&apos;s &quot;2 million MAU&quot; is not wrong. But the engagement depth picture reveals you have a large casual audience and a small power-user core.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>If a product intervention increases DAU by 15% but MAU stays flat, what does that tell you about the type of engagement that was added? Is that better or worse than a 15% increase in both DAU and MAU?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive ── */}
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

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem', overflowX: 'auto' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textAlign: 'center' }}>Lness distribution — days active per month</div>
          <svg viewBox={'0 0 ' + W15 + ' ' + H15} width='100%' style={{ maxWidth: W15, display: 'block', margin: '0 auto' }}>
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
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {revealed15 && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>A 15% DAU increase with flat MAU means the same users are becoming more active &mdash; existing users returning more often. Stickiness increased. This is depth growth. A 15% increase in both DAU and MAU could mean new occasional users were added (breadth), with the existing base unchanged. Whether depth growth or breadth growth is better depends on your product and business model &mdash; but they are different phenomena, with different retention and monetization implications.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {revealed15 && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Add DAU/MAU to every engagement dashboard alongside DAU and MAU as individual numbers. The ratio is the signal that DAU and MAU separately cannot provide. A rising DAU with flat MAU is healthy stickiness growth. A rising MAU with flat DAU is breadth growth with no depth improvement.</p>
            <p style={prose}><strong>Two.</strong> When an experiment lifts DAU, decompose the lift: did it come from new users (breadth), from existing users returning more often (depth), or from resurrected inactive users (resurrection)? Each type of DAU lift has a different prognosis for long-term retention. Depth lifts tend to be the most durable.</p>
            <p style={prose}><strong>Three.</strong> The common mistake is optimizing for DAU or MAU without monitoring stickiness, and then discovering that the growth was breadth-only with poor long-term retention. A product that grows MAU through acquisition but doesn&apos;t improve stickiness is adding users to a leaky bucket &mdash; each new user contributes briefly to MAU and then churns.</p>
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
