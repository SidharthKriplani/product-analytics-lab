import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const MF01_ITEMS_DEFAULT = [
  { id: 'dau',        label: 'Daily Active Users (Facebook)',       correct: 'north-star' },
  { id: 'session',    label: 'Avg session depth per user',          correct: 'l1' },
  { id: 'feed-ctr',   label: 'Feed click-through rate',             correct: 'l2' },
  { id: 'latency',    label: 'p99 API latency',                     correct: 'guardrail' },
  { id: 'stories',    label: 'Stories completion rate',             correct: 'l2' },
  { id: 'support',    label: 'Support contact rate',                correct: 'guardrail' },
  { id: 'mau',        label: 'Monthly Active Users (Facebook)',     correct: 'l1' },
  { id: 'notif-ctr',  label: 'Push notification CTR',              correct: 'l2' },
];

const TIERS = [
  { id: 'north-star', label: 'North Star',  color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  { id: 'l1',         label: 'L1 Supporting', color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  { id: 'l2',         label: 'L2 Operational', color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
  { id: 'guardrail',  label: 'Guardrail',    color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
];

export function Module_MF01({ module, onNext }) {
  const saved = useMemo(function() { return loadMFState('mf01'); }, []);
  const [items, setItems] = useState(function() { return saved && saved.items ? saved.items : shuffleMF(MF01_ITEMS_DEFAULT); });
  const [placements, setPlacements] = useState(function() { return saved && saved.placements ? saved.placements : {}; });
  const [checked, setChecked] = useState(function() { return saved && saved.checked ? saved.checked : false; });

  useEffect(function() {
    saveMFState('mf01', { items: items, placements: placements, checked: checked });
  }, [items, placements, checked]);

  const allPlaced = items.every(function(i) { return placements[i.id]; });
  const score = checked ? items.filter(function(i) { return placements[i.id] === i.correct; }).length : null;

  function cycle(id) {
    if (checked) return;
    const tiers = TIERS.map(t => t.id);
    const cur = placements[id];
    const idx = tiers.indexOf(cur);
    const next = tiers[(idx + 1) % tiers.length];
    setPlacements(prev => ({ ...prev, [id]: next }));
  }

  function itemStyle(item) {
    const tier = TIERS.find(t => t.id === placements[item.id]);
    let bg = 'var(--surface-2)', border = 'var(--border)', color = 'var(--text-muted)';
    if (checked) {
      const ok = placements[item.id] === item.correct;
      bg = ok ? 'var(--green-bg)' : 'var(--red-bg)';
      border = ok ? 'var(--green-border)' : 'var(--red-border)';
      color = ok ? 'var(--green)' : 'var(--red)';
    } else if (tier) {
      bg = tier.bg; border = tier.border; color = tier.color;
    }
    return { padding: '0.45rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid ' + border, background: bg, color, fontSize: '0.82rem', fontWeight: 500, cursor: checked ? 'default' : 'pointer', userSelect: 'none', transition: 'all 0.15s' };
  }

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>A metrics hierarchy is an ordered structure that determines which metrics answer which questions. At the top sits a single metric &mdash; the North Star &mdash; that captures whether the product is winning on the dimension that matters most. Below it sit L1 metrics that explain why the North Star is moving. Below those sit L2 metrics that locate where the movement is happening. Surrounding the whole structure sit guardrails: metrics that must not degrade as you chase movement in the rest.</p>
        <p style={prose}>The hierarchy doesn&apos;t just organize metrics. It organizes decisions. Each layer is designed for a different question and a different decision-maker. The North Star is for leadership. L1s are for product teams. L2s are for individual squads. Guardrails are for everyone &mdash; they&apos;re what you commit to not breaking regardless of what else improves.</p>
        <p style={prose}>Without a hierarchy, every metric looks equally important. With forty metrics on a dashboard, every weekly review devolves into &quot;but this one is also down.&quot; Nothing gets prioritized because nothing has an assigned role.</p>
        <p style={prose}>The naive approach when someone asks for a metrics dashboard is to pull every metric you can measure and organize it by surface: acquisition metrics, engagement metrics, revenue metrics. This feels thorough. But here&apos;s where it breaks.</p>
        <p style={prose}>Forty metrics organized by product surface can&apos;t tell you where to act. If checkout conversion is down and DAU is up and revenue is flat, which of those three should drive the Monday sprint planning? The surface organization tells you what changed in each area. It doesn&apos;t tell you which change matters more, which other metrics might explain it, or what you&apos;re allowed to sacrifice to fix it. The dashboard is comprehensive and useless at the same time.</p>
        <p style={prose}>What you actually need is a structure that answers the question you&apos;re always really asking: is the product healthy, and if not, where exactly is the problem? That requires assigning each metric a role &mdash; not just a topic &mdash; before the review starts.</p>
        <p style={prose}>The North Star answers &quot;are we winning?&quot; It&apos;s a single metric chosen to represent the core value your product delivers to users. Not revenue &mdash; revenue measures what you extract, not what users get. Not DAU &mdash; that measures presence, not value. Given that you have a North Star, L1 metrics decompose it into its structural drivers. Given that an L1 moved, L2s are surface-specific signals that answer &quot;where exactly?&quot; Guardrails sit outside the vertical chain &mdash; metrics that must stay above a floor regardless of what else you&apos;re optimizing for.</p>
        <p style={prose}>Let&apos;s take an example. A streaming product&apos;s North Star is &quot;hours of content completed per monthly active user&quot; &mdash; completion indicates value delivered, not just content started. L1s: new user activation rate, returning-user frequency, content discovery rate. L2 under frequency: per-device breakdown, per-genre breakdown, per-day-of-week breakdown. Guardrails: buffering rate must stay below 0.5%, skip rate must not increase. When hours-per-user drops, the review starts at L1s, not at the full dashboard. The hierarchy just cut the diagnostic time in half before anyone ran a query.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>If the North Star drops but every L1 metric is flat, what does that tell you? Is it a data problem, a metric design problem, or a decomposition problem?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1.1rem' }}>
        <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text)' }}>Exercise:</strong> Click each metric to cycle it through the four tiers.
          Place all 8 correctly, then hit Check.
        </p>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
          {TIERS.map(t => (
            <span key={t.id} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', background: t.bg, color: t.color, border: '1px solid ' + t.border }}>
              {t.label}
            </span>
          ))}
        </div>
      </div>
      <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Click each metric chip to cycle through North Star, L1 Supporting, L2 Operational, and Guardrail. Assign all 8 metrics before hitting Check answers.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {items.map(item => (
          <span key={item.id} style={itemStyle(item)} onClick={() => cycle(item.id)}>
            {checked && (placements[item.id] === item.correct ? <Icon name='check' size={12} color='currentColor' /> : <Icon name='x' size={12} color='currentColor' />)}{checked ? ' ' : ''}
            {item.label}
            {placements[item.id] && !checked && (
              <span style={{ fontSize: '0.7rem', opacity: 0.7, marginLeft: '0.3rem' }}>
                [{TIERS.find(t => t.id === placements[item.id])?.label}]
              </span>
            )}
          </span>
        ))}
      </div>
      {checked && (
        <div className="pal-reveal-in" style={{ background: score === 8 ? 'var(--green-bg)' : 'var(--yellow-bg)', border: '1.5px solid ' + (score === 8 ? 'var(--green-border)' : 'var(--yellow-border)'), borderRadius: 'var(--radius)', padding: '0.85rem 1.1rem', fontSize: '0.88rem', color: score === 8 ? 'var(--green)' : 'var(--yellow-text)', fontWeight: 500 }}>
          {score === 8 ? 'Perfect. L2 metrics (feed CTR, stories completion, push CTR) are experiment targets. L1s (session depth, MAU) are the explanatory layer. DAU is the North Star — too slow for experiments but the ultimate scorecard.' : score + '/8. Key: latency and support contacts are guardrails (protect, don\'t optimise). MAU is L1 — it explains DAU but doesn\'t replace it.'}
        </div>
      )}
      <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Once all 8 metrics are assigned, click Check answers to see your score and review which tier each metric belongs to.
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={() => allPlaced && !checked && setChecked(true)} disabled={!allPlaced || checked} style={{ padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)', border: 'none', background: allPlaced && !checked ? 'var(--accent)' : 'var(--border)', color: allPlaced && !checked ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', cursor: allPlaced && !checked ? 'pointer' : 'not-allowed' }}>Check answers</button>
        <button onClick={() => { setPlacements({}); setChecked(false); setItems(shuffleMF(MF01_ITEMS_DEFAULT)); }} style={{ padding: '0.5rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer' }}>Reset</button>
      </div>

      {/* ── What you should have confirmed ── */}
      {checked && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>If every L1 is flat while the North Star fell, your L1s don&apos;t fully decompose the North Star &mdash; there&apos;s a structural driver you haven&apos;t named. The hierarchy revealed the gap. This is one of the most valuable things a hierarchy does: it turns vague discomfort into a specific diagnostic failure.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {checked && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> When a PM asks you to build a metrics dashboard, ask what role each metric plays before you add it. North Star, L1, L2, or guardrail. A metric with no assigned role is just visual noise. If the team can&apos;t answer the role question, that conversation is the most valuable thing you can do before touching the dashboard.</p>
            <p style={prose}><strong>Two.</strong> When a North Star drops and the first instinct is to check all forty metrics simultaneously, use the hierarchy to sequence the investigation: L1s first, then L2s only for the L1 that moved. Skipping this sequence is the most common cause of hour-long review meetings that end without a clear next action.</p>
            <p style={prose}><strong>Three.</strong> The common mistake is treating guardrails as secondary metrics to check at the end. They aren&apos;t. Guardrails are pre-commitments that constrain the ship decision. If a guardrail breaches, the investigation isn&apos;t &quot;is the primary metric also down?&quot; &mdash; it&apos;s &quot;what do we do about the breach?&quot; The breach is the answer, regardless of what else happened.</p>
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
