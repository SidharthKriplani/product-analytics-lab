import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

export function Module_MF03({ module, onNext }) {
  var saved03 = useMemo(function() { return loadMFState('mf03'); }, []);
  var [mobilePct, setMobilePct] = useState(function() { return saved03 && saved03.mobilePct !== undefined ? saved03.mobilePct : 40; });
  var [desktopCVR, setDesktopCVR] = useState(function() { return saved03 && saved03.desktopCVR !== undefined ? saved03.desktopCVR : 4.5; });
  var [mobileCVR, setMobileCVR] = useState(function() { return saved03 && saved03.mobileCVR !== undefined ? saved03.mobileCVR : 2.1; });
  var [selected, setSelected] = useState(function() { return saved03 ? saved03.selected : null; });
  var [answered, setAnswered] = useState(function() { return saved03 ? saved03.answered : false; });
  var [discoveredParadox, setDiscoveredParadox] = useState(function() { return saved03 ? saved03.discoveredParadox : false; });

  useEffect(function() {
    saveMFState('mf03', { mobilePct: mobilePct, desktopCVR: desktopCVR, mobileCVR: mobileCVR, selected: selected, answered: answered, discoveredParadox: discoveredParadox });
  }, [mobilePct, desktopCVR, mobileCVR, selected, answered, discoveredParadox]);

  var blendedCVR = ((100 - mobilePct) / 100) * desktopCVR + (mobilePct / 100) * mobileCVR;
  var baselineBlended = 0.6 * 4.5 + 0.4 * 2.1; // 3.54 at 40/60 split

  // SVG bar chart dimensions
  var barW = 60;
  var chartH = 160;
  var maxCVR = 6;

  var Q = {
    question: 'Your team redesigned the checkout page. Desktop CVR rose 4.1% to 4.5%. Mobile CVR rose 2.8% to 3.2%. But overall CVR fell 4.2% to 3.9%. A stakeholder asks: "Did the redesign help or hurt?" What do you say?',
    options: [
      { id: 'a', text: 'The redesign helped — both segments improved, so the overall must have improved too.' },
      { id: 'b', text: 'The redesign helped each segment, but a traffic mix shift toward mobile pulled the blended rate down. The redesign worked; the aggregate is misleading.' },
      { id: 'c', text: 'The data is inconsistent — if both segments improved, the overall cannot fall. There must be a logging error.' },
    ],
    correct: 'b',
    explanation: 'Both segment CVRs improved, confirming the redesign worked. But mobile traffic share grew (say 60% to 75%), and mobile converts at a lower rate. The blended average fell because the denominator mix shifted — not because the product got worse. This is Simpson\'s Paradox. The correct answer to the stakeholder: "The redesign improved conversion in every segment. The aggregate fell because mobile grew as a share of traffic. Both things are true at the same time."',
  };

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>A ratio metric divides one count by another: purchases divided by sessions, signups divided by visitors, completions divided by starts. The division does something useful &mdash; it controls for exposure. If your product got 10x more traffic this month, comparing raw purchase counts to last month would be misleading. Conversion rate removes that size effect and lets you ask: given a user showed up, how likely were they to convert?</p>
        <p style={prose}>This normalization is the reason ratios are everywhere in product analytics. But the normalization carries a trap that isn&apos;t obvious until it bites you.</p>
        <p style={prose}>The natural approach to reading a ratio is to focus on the number: conversion rate is 4.2% this month vs 3.9% last month. It&apos;s up. Something is working. But here&apos;s where it breaks.</p>
        <p style={prose}>You segment by traffic source &mdash; paid, organic, direct &mdash; and find that conversion in every single channel is flat or slightly down. Paid: down 0.1pp. Organic: flat. Direct: down 0.2pp. The aggregate rate is up 0.3pp, but no individual segment improved. How is that possible?</p>
        <p style={prose}>A new organic search campaign doubled traffic from high-intent users this month. That channel already had the highest conversion rate &mdash; 6.5% vs 3.0% for paid. Doubling its volume changed the mix: more of this month&apos;s sessions came from the best-converting source. The aggregate rate went up because the distribution of sessions shifted, not because any experience improved. The aggregate lied.</p>
        <p style={prose}>This is a composition effect &mdash; also called a mix shift. Any ratio&apos;s aggregate can move in a direction that contradicts every segment, if the population composition changes. The ratio combined two pieces of information &mdash; the within-segment rates and the segment proportions &mdash; and reported them as one number. When you read the aggregate, you can&apos;t tell whether you&apos;re seeing a rate change or a mix change.</p>
        <p style={prose}>Given this, a ratio movement requires decomposition before it means anything. You need to separate three questions: did the numerator change? Did the denominator change? Did the composition of the denominator change? Numerator change holding denominator fixed: the conversion process improved for a stable population. Denominator change (new traffic) holding rate fixed: more users arrived, converting at the same rate. Composition change: the mix of who&apos;s in the denominator shifted. Without this decomposition, you celebrate a mix shift as a product win, or panic about a rate drop that&apos;s actually an acquisition shift.</p>
        <p style={prose}>Let&apos;s take an example. Checkout conversion rate: 4.2% in January and 4.6% in February. You decompose by traffic source: Paid &mdash; Jan 3.1%, Feb 3.0%, sessions 60k&rarr;50k. Organic &mdash; Jan 6.5%, Feb 6.4%, sessions 20k&rarr;45k. Direct &mdash; Jan 5.0%, Feb 4.9%, sessions 20k&rarr;5k. Every channel flat or slightly down. But organic &mdash; highest CVR &mdash; went from 20% of sessions to 45%. The aggregate CVR went up 0.4pp while every channel was flat or declining. This is a pure mix shift. No product change, no checkout improvement.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>If paid traffic doubles next month (still converting at 3.1%) and organic stays flat (still converting at 6.5%), what direction does the aggregate conversion rate move? Why?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive: Mix-Shift Explorer ── */}
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Mix-Shift Explorer</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 1rem' }}>
          Drag the mobile traffic slider to see how mix shift changes the blended conversion rate — even when segment rates stay fixed. Try to make the blended rate drop below 3.0% without changing either segment&apos;s CVR.
        </p>

        {/* Sliders */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
            Mobile traffic share: <strong style={{ color: mobilePct > 60 ? 'var(--yellow)' : 'var(--text)' }}>{mobilePct}%</strong>
            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(desktop: {100 - mobilePct}%)</span>
          </label>
          <input type='range' min={5} max={95} step={1} value={mobilePct} onChange={function(e) { setMobilePct(Number(e.target.value)); if (Number(e.target.value) > 70 && !discoveredParadox) setDiscoveredParadox(true); }} style={{ width: '100%', accentColor: 'var(--green)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Desktop CVR: <strong style={{ color: 'var(--text)' }}>{desktopCVR.toFixed(1)}%</strong></label>
            <input type='range' min={1} max={6} step={0.1} value={desktopCVR} onChange={function(e) { setDesktopCVR(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Mobile CVR: <strong style={{ color: 'var(--text)' }}>{mobileCVR.toFixed(1)}%</strong></label>
            <input type='range' min={0.5} max={5} step={0.1} value={mobileCVR} onChange={function(e) { setMobileCVR(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
        </div>

        {/* SVG bar chart */}
        <svg viewBox={'0 0 280 ' + (chartH + 40)} width='100%' style={{ maxWidth: '320px', display: 'block', margin: '0 auto' }}>
          {/* Y-axis labels */}
          {[0, 2, 4, 6].map(function(v) {
            var y = chartH - (v / maxCVR) * chartH + 10;
            return (
              <g key={v}>
                <line x1={45} x2={260} y1={y} y2={y} stroke='var(--border)' strokeWidth={0.5} strokeDasharray={v > 0 ? '3,3' : 'none'} />
                <text x={40} y={y + 3} textAnchor='end' fill='var(--text-muted)' fontSize={10}>{v}%</text>
              </g>
            );
          })}

          {/* Desktop bar */}
          <rect x={70} y={chartH - (desktopCVR / maxCVR) * chartH + 10} width={barW} height={(desktopCVR / maxCVR) * chartH} rx={4} fill='var(--accent)' opacity={0.8} />
          <text x={100} y={chartH + 28} textAnchor='middle' fill='var(--text-muted)' fontSize={10} fontWeight={600}>Desktop</text>
          <text x={100} y={chartH - (desktopCVR / maxCVR) * chartH + 4} textAnchor='middle' fill='var(--accent)' fontSize={11} fontWeight={700}>{desktopCVR.toFixed(1)}%</text>

          {/* Mobile bar */}
          <rect x={150} y={chartH - (mobileCVR / maxCVR) * chartH + 10} width={barW} height={(mobileCVR / maxCVR) * chartH} rx={4} fill='var(--purple)' opacity={0.8} />
          <text x={180} y={chartH + 28} textAnchor='middle' fill='var(--text-muted)' fontSize={10} fontWeight={600}>Mobile</text>
          <text x={180} y={chartH - (mobileCVR / maxCVR) * chartH + 4} textAnchor='middle' fill='var(--purple)' fontSize={11} fontWeight={700}>{mobileCVR.toFixed(1)}%</text>

          {/* Blended line */}
          <line x1={55} x2={255} y1={chartH - (blendedCVR / maxCVR) * chartH + 10} y2={chartH - (blendedCVR / maxCVR) * chartH + 10} stroke={blendedCVR < baselineBlended ? 'var(--red)' : 'var(--green)'} strokeWidth={2} strokeDasharray='6,3' />
          <text x={258} y={chartH - (blendedCVR / maxCVR) * chartH + 14} fill={blendedCVR < baselineBlended ? 'var(--red)' : 'var(--green)'} fontSize={11} fontWeight={700}>{blendedCVR.toFixed(1)}%</text>
          <text x={258} y={chartH - (blendedCVR / maxCVR) * chartH + 2} fill='var(--text-muted)' fontSize={8}>Blended</text>
        </svg>

        {/* Discovery nudge */}
        {discoveredParadox && (
          <div className='pal-reveal-in' style={{ marginTop: '0.75rem', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--yellow)', lineHeight: 1.55 }}>
            Notice how the blended rate dropped below the baseline — even though neither segment&apos;s CVR changed? That&apos;s the mix shift in action. The product didn&apos;t get worse. The audience composition changed.
          </div>
        )}
      </div>

      {/* ── Quick Check ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Check</div>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>{Q.question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {Q.options.map(function(opt) {
            return (
              <MCQOption key={opt.id} label={opt.text} selected={selected === opt.id} correct={opt.id === Q.correct} revealed={answered} onClick={function() { if (!answered) setSelected(opt.id); }} />
            );
          })}
        </div>
        {selected && !answered && (
          <button onClick={function() { setAnswered(true); }} style={{ marginTop: '0.75rem', padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--green)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Check</button>
        )}
        {answered && (
          <div className='pal-reveal-in' style={{ marginTop: '0.75rem', background: selected === Q.correct ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (selected === Q.correct ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <strong>{selected === Q.correct ? <><Icon name='check' size={13} color='var(--green)' /> Correct. </> : <><Icon name='x' size={13} color='var(--red)' /> Not quite. </>}</strong>{Q.explanation}
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {answered && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>Aggregate CVR drops because you&apos;ve added more sessions from the lower-converting channel, pulling the weighted average down. No product change, no checkout regression. The decomposition tool shows the rate held constant in every segment &mdash; only the denominator composition moved.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {answered && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Whenever an aggregate ratio moves more than 0.5pp in either direction, decompose it by your highest-variance segmentation variable before drawing conclusions. Channel, device type, cohort vintage, and geography are the usual suspects. If segment rates held flat while the aggregate moved, you have a mix shift, not a product signal.</p>
            <p style={prose}><strong>Two.</strong> The common mistake is presenting an aggregate ratio movement in a review without this check. &quot;Conversion is up 0.4pp&quot; that&apos;s actually a mix shift will generate product hypotheses, sprint priorities, and celebration that all point in the wrong direction. The decomposition takes fifteen minutes. The misdirected quarter it prevents is worth far more.</p>
            <p style={prose}><strong>Three.</strong> In A/B tests, always check whether the treatment changed who entered the funnel &mdash; not just how they converted. If your treatment brought in a different traffic mix, comparing aggregate conversion rates between arms is comparing different populations. Check session volume and composition balance between arms before reading conversion rates.</p>
          </div>
        </div>
      )}

      {/* ── Key Insight + Connection ── */}
      <InsightBox label='Key Takeaway' color='var(--green)' bg='var(--green-bg)' border='var(--green-border)'>{module.keyInsight}</InsightBox>
      <InsightBox label='Connects to Experiments' color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)'>{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}
