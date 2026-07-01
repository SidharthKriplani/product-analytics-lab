import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

export function Module_MF16({ module, onNext }) {
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

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>Unit economics measures whether the business is profitable at the level of a single customer. Not the aggregate P&amp;L &mdash; that can look positive while individual customer economics are negative if the company is growing fast and the LTV horizon hasn&apos;t arrived yet. Unit economics asks a narrower, more foundational question: for one additional customer acquired today, does the value that customer generates over their lifetime exceed the cost of acquiring and serving them?</p>
        <p style={prose}>If the answer is yes for the typical customer, the business can grow. If the answer is no, growth makes the business larger and less solvent at the same time. More customers means more loss, not more value. This is the failure mode that rapid user growth can hide &mdash; the company grows its user base while destroying economic value with each new acquisition.</p>
        <p style={prose}>The natural approach when growth is the stated priority is to track user acquisition volume and active user counts. Growth means more users, and more users means more eventual revenue. But here&apos;s where it breaks.</p>
        <p style={prose}>CAC is $18. LTV is $11. The company is spending $7 to acquire each user who will generate $11 in lifetime value before churning. Every acquired user is a net loss of $7 to the business. At 10,000 new users per month, that&apos;s $70,000 in losses per month from new acquisition alone. Growing faster accelerates the loss. The company can run this model for months while revenue climbs and only notice the problem when the cash burn forces a reckoning.</p>
        <p style={prose}>What you actually need is a framework that relates what a customer costs to acquire and serve against what that customer generates &mdash; expressed in the same unit and measured over a comparable time horizon.</p>
        <p style={prose}>The three core unit economic metrics work together. CAC (Customer Acquisition Cost) is total acquisition cost divided by customers acquired. LTV (Lifetime Value) is total revenue generated over the customer relationship, minus cost to serve. Payback period is CAC divided by monthly contribution margin &mdash; how long to recover the acquisition cost.</p>
        <p style={prose}>The relationship LTV &gt; CAC is the basic viability test. The ratio matters: LTV = 3&times; CAC is a common rule of thumb for sustainable SaaS. Payback period connects viability to liquidity: a 36-month payback requires financing 36 months of customer costs before recovering CAC. LTV alone doesn&apos;t tell you the timing; payback does.</p>
        <p style={prose}>Let&apos;s take an example. A B2C subscription product: average CAC $22 (blended), monthly subscription $12, gross margin 75% &rarr; $9 contribution margin/month, average lifetime 18 months. LTV = $9 &times; 18 = $162. LTV/CAC = 7.4 &rarr; healthy. Payback = $22/$9 = 2.4 months &rarr; excellent. But for the paid acquisition channel alone: CAC $45, average lifetime 11 months &rarr; LTV = $99. LTV/CAC = 2.2 &rarr; borderline. Payback = 5 months. The blended unit economics look healthy. The paid channel economics are marginal. Growing paid acquisition while the blended CAC stays low (because organic subsidizes it) masks that the paid channel is barely sustainable.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>A company reports strong LTV/CAC ratios overall. Then you find that their best organic acquisition channel (low CAC) is plateauing while their paid channel (high CAC) is scaling. What happens to blended unit economics over time, even if the organic channel never worsens?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive ── */}
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
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {revealed16 && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>As the paid channel grows relative to organic, it takes up a larger fraction of total acquisitions. The blended CAC rises toward the paid CAC even if the organic channel remains just as efficient. LTV may not change if paid-channel cohorts behave similarly to organic cohorts &mdash; but the blended ratio deteriorates purely from mix shift. The company&apos;s unit economics worsen not because anything breaks, but because the composition of growth changed.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {revealed16 && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Calculate LTV and CAC at the channel level, not just blended. Blended unit economics can look healthy while specific channels &mdash; particularly paid acquisition &mdash; are barely viable. The channels that are scaling fastest are the ones where you need channel-level verification.</p>
            <p style={prose}><strong>Two.</strong> When evaluating an experiment that lifts a conversion or engagement metric, ask what it does to LTV. An experiment that increases short-term revenue but attracts users with shorter average lifetimes or higher support costs can improve the primary metric while worsening unit economics.</p>
            <p style={prose}><strong>Three.</strong> The common mistake is using revenue per user or ARPU as a proxy for unit economics without accounting for CAC or contribution margin. A product that raises ARPU by raising prices may also increase churn, which shortens lifetime and may leave LTV unchanged or lower. Unit economics requires both sides of the equation.</p>
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
