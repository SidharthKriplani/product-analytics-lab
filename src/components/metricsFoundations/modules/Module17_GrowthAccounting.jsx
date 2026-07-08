import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

export function Module_MF17({ module, onNext }) {
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
    { label: 'A. Increase acquisition spend significantly — you just need more new users flowing in to offset the churn.', correct: false },
    { label: 'B. Prioritize retention and resurrection — fix the leaky bucket before pouring more water in at the top.', correct: true },
    { label: 'C. A quick ratio of 0.9 is basically fine as-is — it is close enough to the 1.0 breakeven mark to ignore.', correct: false },
    { label: 'D. Focus on raw MAU growth rate instead of this ratio — quick ratio is not really a standard, trusted metric.', correct: false },
  ];

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>Growth accounting is a framework that decomposes the change in active users into four mutually exclusive and exhaustive flows: new users (active this period for the first time ever), retained users (active both last period and this period), resurrected users (inactive last period but active again this period), and churned users (active last period but not this period). The net change in actives is the sum: New + Retained + Resurrected &minus; Churned = This Period&apos;s Actives.</p>
        <p style={prose}>The framework forces precision about what kind of growth you have. A product can show strong MAU growth while quietly failing on all the dimensions that determine long-term health &mdash; as long as acquisition is running fast enough to obscure the churn rate.</p>
        <p style={prose}>The natural first approach to monitoring user base health is to track MAU and watch its direction. If MAU is growing, the product is growing. This is how most executive dashboards work. But here&apos;s where it breaks.</p>
        <p style={prose}>MAU grew 5% last month. The team attributes it to the growth campaign. You decompose: new users are up 25% &mdash; the campaign worked. Retained users are down 8% &mdash; existing users are dropping off faster. Churned users are up 18%. The product is acquiring aggressively and leaking just as aggressively. MAU grew only because the acquisition number outran the churn number this month. But the churn rate is increasing. If acquisition slows, churn will exceed inflows and MAU will start contracting. Without growth accounting, this looks like a successful growth quarter. With growth accounting, it looks like an early warning signal.</p>
        <p style={prose}>The quick ratio formalizes this diagnostic. Quick Ratio = (New + Resurrected) / Churned. A quick ratio above 1 means inflows exceed churn &mdash; the bucket is filling faster than it leaks. Below 1 means the product is contracting net of new users. A quick ratio above 2 gives the business room to reduce acquisition spend without triggering contraction.</p>
        <p style={prose}>Growth accounting also tells you where the experimentation roadmap should point. If churn is the dominant signal, the highest-leverage experiments are retention and re-engagement interventions. If new user growth is the bottleneck while retained and resurrected are healthy, the roadmap should focus on acquisition and activation.</p>
        <p style={prose}>Let&apos;s take an example. Month-over-month for a mobile app: New users &mdash; last month 280,000, this month 350,000 (+25%). Retained users &mdash; 1,900,000 &rarr; 1,748,000 (-8%). Resurrected &mdash; 120,000 &rarr; 118,000 (-2%). Churned &mdash; 410,000 &rarr; 485,000 (+18%). Total MAU this month: 350,000 + 1,748,000 + 118,000 &minus; 485,000 = 1,731,000 (down 8.4%). Quick ratio: (350,000 + 118,000) / 485,000 = 0.96 &rarr; contracting. The growth campaign is working. The product is leaking faster than the campaign can fill it.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>A product has a quick ratio of 0.7 but is still growing MAU. How is that mathematically possible, and what does it say about the product&apos;s long-term health?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive ── */}
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
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {revealed17 && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>A quick ratio below 1 means inflows don&apos;t cover churn &mdash; but if the existing retained user base is large enough and retention is strong, the retained component can maintain MAU even when new + resurrected &lt; churned. It&apos;s possible because retained users aren&apos;t counted in the quick ratio numerator. But the gap in quick ratio means the product is relying on its existing base to sustain the number, and any deterioration in retention will accelerate the eventual MAU decline. It&apos;s a structurally fragile position.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {revealed17 && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Add growth accounting to your monthly active user report. The decomposition (New, Retained, Resurrected, Churned) takes one additional query and converts an aggregate number into a diagnostic. Every team reviewing MAU should see all four components alongside the total.</p>
            <p style={prose}><strong>Two.</strong> Use the quick ratio to set the framing for growth conversations. A quick ratio above 2 supports investment in acquisition. A quick ratio below 1 signals that acquisition investment is fighting a structural churn problem &mdash; before adding more to the top, the leak needs addressing. These are different strategic conversations.</p>
            <p style={prose}><strong>Three.</strong> The common mistake is attributing MAU growth to the most visible recent activity &mdash; a campaign, a product launch &mdash; without checking the growth accounting. A MAU increase driven entirely by a temporary acquisition spike with worsening churn looks like a success and is actually an early warning. The attribution question and the health question are different.</p>
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
