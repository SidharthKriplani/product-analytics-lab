import { useState, useEffect, useMemo } from 'react';
import { metricsFoundationModules } from '../../data/metricsFoundationModules.js';
import { saveMetricsFoundationProgress, getMetricsFoundationProgress, getAllMetricsFoundationProgress } from '../../utils/metricsFoundationProgress.js';
import { track } from '../../utils/analytics.js';
import { HowTo } from '../shared/HowTo.jsx';

// ── Persistence helpers ──────────────────────────────────────────────────────
function saveMFState(id, state) {
  try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {}
}
function loadMFState(id) {
  try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; }
}
function shuffleMF(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

const NOTES_KEY = 'pal-notes-v1';

function getNotes(room, caseId) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    return all[room + ':' + caseId] || '';
  } catch { return ''; }
}

function saveNote(room, caseId, text) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    all[room + ':' + caseId] = text;
    localStorage.setItem(NOTES_KEY, JSON.stringify(all));
  } catch {}
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function InsightBox({ label, color, bg, border, children }) {
  return (
    <div style={{ background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{label}</div>
      <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function NextBtn({ onClick, label }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
      <button onClick={onClick} className="pal-glow-pulse" style={{
        padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none',
        background: 'var(--green)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
      }}>{label || 'Next concept →'}</button>
    </div>
  );
}

function MCQOption({ label, selected, correct, revealed, onClick }) {
  let bg = 'var(--surface)', border = 'var(--border)', color = 'var(--text)';
  if (revealed) {
    if (correct) { bg = 'var(--green-bg)'; border = 'var(--green-border)'; color = 'var(--green)'; }
    else if (selected) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
  } else if (selected) { bg = 'var(--accent-bg)'; border = 'var(--accent)'; color = 'var(--accent)'; }
  return (
    <button onClick={onClick} disabled={revealed} style={{
      display: 'block', width: '100%', textAlign: 'left',
      padding: '0.7rem 1rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid ' + border,
      background: bg, color, fontSize: '0.88rem', cursor: revealed ? 'default' : 'pointer',
      fontWeight: selected || (revealed && correct) ? 600 : 400, transition: 'all 0.15s',
    }}>{label}</button>
  );
}

// ─── Module 1: Metrics Hierarchy ─────────────────────────────────────────────

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

function Module_MF01({ module, onNext }) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
        Metrics analytics is how analysts translate a product strategy into measurable signals — choosing the right numbers to track, understand why they move, and decide whether a change is an improvement. Picking the wrong metric is one of the most common and costly mistakes in product development: teams optimize hard for a number that doesn&apos;t actually represent user value. Every product has a <strong>metrics hierarchy</strong>: a single North Star that captures delivered value, L1 metrics that explain <em>why</em> it moves, L2 metrics that pinpoint <em>where</em>, and guardrails that protect what you must not break.
      </p>
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
            {checked && (placements[item.id] === item.correct ? '✓ ' : '✗ ')}
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
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}

// ─── Module 2: What Makes a Good Metric? ────────────────────────────────────

const METRIC_QUALITIES = [
  { id: 'csat',    label: 'Customer satisfaction score (survey, weekly)',     fails: ['movable'],       reason: 'Too slow, too noisy, and self-selection bias. Hard to move significantly in a 2-week test.' },
  { id: 'dau',     label: 'DAU',                                              fails: [],                reason: 'Strong North Star candidate — measurable, somewhat movable, predictive of long-term value, hard to game at scale.' },
  { id: 'installs', label: 'App install count',                               fails: ['predictive'],    reason: 'Easily gamed (incentivised installs). Install does not equal active user or value delivery.' },
  { id: 'ltv',     label: '12-month LTV',                                     fails: ['movable'],       reason: 'Excellent for strategy but too lagging for an A/B test primary metric — need 12 months to observe.' },
  { id: 'stories', label: 'Stories completion rate (% who finish a story)',   fails: [],                reason: 'Good proxy metric — measurable, sensitive, predictive of re-engagement, hard to game without degrading UX.' },
];

const QUALITY_CRITERIA = [
  { id: 'measurable',  label: 'Measurable',  desc: 'Can observe it reliably without noise' },
  { id: 'movable',     label: 'Movable',     desc: 'A product change can shift it in days/weeks' },
  { id: 'predictive',  label: 'Predictive',  desc: 'Moving it predicts actual user value' },
  { id: 'trustworthy', label: 'Trustworthy', desc: 'Hard to game without real improvement' },
];

function Module_MF02({ module, onNext }) {
  const saved02 = useMemo(function() { return loadMFState('mf02'); }, []);
  const [selected, setSelected] = useState(function() { return saved02 ? saved02.selected : null; });
  const [answered, setAnswered] = useState(function() { return saved02 ? saved02.answered : false; });

  useEffect(function() {
    saveMFState('mf02', { selected: selected, answered: answered });
  }, [selected, answered]);

  const Q = {
    question: 'A PM proposes using "App install count" as the primary metric for a feature that improves new-user onboarding. What is the strongest objection?',
    options: [
      { id: 'a', text: 'It is not measurable — install data is unreliable across platforms.' },
      { id: 'b', text: 'It is not predictive — an install does not mean a user received value. It can be inflated by incentivised campaigns without any real onboarding improvement.' },
      { id: 'c', text: 'It is not sensitive — install counts are too noisy (driven by seasonality, ads, and competition) to detect the small effects of onboarding improvements reliably.' },
      { id: 'd', text: 'It is not trustworthy — engineering teams will manipulate the data.' },
    ],
    correct: 'b',
    explanation: 'Installs are measurable and movable (run an ad campaign, installs spike). Option C is real — install counts are noisy — but noise affects sensitivity, not validity. The deeper failure is predictiveness: an install does not mean a user opened the app, completed onboarding, or derived any value. Any campaign that drives low-quality installs will move the metric without improving the underlying outcome.',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
        A metric is only useful if it has four properties: it must be <strong>measurable</strong> (observable, low noise),
        <strong> movable</strong> (a product change can shift it), <strong>predictive</strong> (moving it means users are better off),
        and <strong>trustworthy</strong> (hard to game without real improvement). Most bad metrics fail on predictiveness or trustworthiness.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.5rem' }}>
        {QUALITY_CRITERIA.map(c => (
          <div key={c.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text)' }}>{c.label}</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{c.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>{Q.question}</div>
        <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Select the answer that identifies which of the four quality criteria this metric fails, then click Submit to see the explanation.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {Q.options.map(opt => (
            <MCQOption key={opt.id} label={opt.text} selected={selected === opt.id} correct={opt.id === Q.correct} revealed={answered} onClick={() => !answered && setSelected(opt.id)} />
          ))}
        </div>
        {selected && !answered && (
          <button onClick={() => setAnswered(true)} style={{ marginTop: '0.75rem', padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Submit</button>
        )}
        {answered && (
          <div className="pal-reveal-in" style={{ marginTop: '0.75rem', background: selected === Q.correct ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (selected === Q.correct ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <strong>{selected === Q.correct ? '✓ Correct. ' : '✗ Not quite. '}</strong>{Q.explanation}
          </div>
        )}
      </div>
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}

// ─── Module 3: Ratio Metrics ─────────────────────────────────────────────────

function Module_MF03({ module, onNext }) {
  const saved03 = useMemo(function() { return loadMFState('mf03'); }, []);
  const [step, setStep] = useState(function() { return saved03 ? saved03.step : 0; });
  const [selected, setSelected] = useState(function() { return saved03 ? saved03.selected : null; });
  const [answered, setAnswered] = useState(function() { return saved03 ? saved03.answered : false; });

  useEffect(function() {
    saveMFState('mf03', { step: step, selected: selected, answered: answered });
  }, [step, selected, answered]);

  const Q = {
    question: 'Overall CVR fell from 4.2% to 3.9% after a redesign. But desktop CVR rose (4.1%→4.5%) and mobile CVR rose (2.8%→3.2%). How is this possible?',
    options: [
      { id: 'a', text: 'Data pipeline error — the numbers cannot all be correct simultaneously.' },
      { id: 'b', text: 'Simpson\'s Paradox: the mix shifted toward mobile (lower CVR channel), so blended CVR fell even though each segment improved.' },
      { id: 'c', text: 'The primary metric is calculated incorrectly — numerator and denominator are swapped.' },
      { id: 'd', text: 'The redesign only went live on a subset of users, creating sample contamination.' },
    ],
    correct: 'b',
    explanation: 'If desktop was 30% of traffic before and 20% after, and mobile was 70% before and 80% after, the blended CVR will fall — even with both segments improving. The denominator mix changed. This is why you always decompose a ratio change into: (a) did each segment improve? (b) did the mix shift? Both can happen simultaneously.',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {step === 0 && (
        <>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
            Ratio metrics — CVR, CTR, retention rate — are attractive because they normalise for volume. But they hide a trap:
            <strong> the denominator can change composition</strong> independently of any product change, making the ratio move in a misleading direction.
          </p>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', fontSize: '0.88rem' }}>The Anatomy of a Ratio Metric</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))', gap: '0.5rem', textAlign: 'center' }}>
              {[
                { label: 'Numerator', desc: 'The outcome (conversions, clicks)', color: 'var(--green)' },
                { label: 'Denominator', desc: 'The exposure (sessions, users)', color: 'var(--accent)' },
                { label: 'Mix', desc: 'Who makes up the denominator', color: 'var(--purple)' },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: item.color }}>{item.label}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{item.desc}</div>
                </div>
              ))}
            </div>
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              When diagnosing a ratio change: check numerator, check denominator absolute counts, then check <em>mix of denominator</em> across segments.
            </p>
          </div>
          <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
            <strong>What to do:</strong> Read the anatomy of ratio metrics above, then click to encounter a real-world paradox that trips up even experienced analysts.
          </div>
          <button onClick={() => setStep(1)} style={{ alignSelf: 'flex-start', padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>See the paradox →</button>
        </>
      )}
      {step >= 1 && (
        <>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
            Ratio metrics — CVR, CTR, retention rate — are attractive because they normalise for volume. But they hide a trap:
            <strong> the denominator can change composition</strong> independently of any product change, making the ratio move in a misleading direction.
          </p>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>{Q.question}</div>
            <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
              <strong>What to do:</strong> Identify the statistical phenomenon that explains how all three numbers can be simultaneously true, then click Submit.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {Q.options.map(opt => (
                <MCQOption key={opt.id} label={opt.text} selected={selected === opt.id} correct={opt.id === Q.correct} revealed={answered} onClick={() => !answered && setSelected(opt.id)} />
              ))}
            </div>
            {selected && !answered && (
              <button onClick={() => setAnswered(true)} style={{ marginTop: '0.75rem', padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Submit</button>
            )}
            {answered && (
              <div className="pal-reveal-in" style={{ marginTop: '0.75rem', background: selected === Q.correct ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (selected === Q.correct ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                <strong>{selected === Q.correct ? '✓ Correct. ' : '✗ Not quite. '}</strong>{Q.explanation}
              </div>
            )}
          </div>
          <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
          <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
          <NextBtn onClick={onNext} />
        </>
      )}
    </div>
  );
}

// ─── Module 4: Metric Decomposition ──────────────────────────────────────────

const MF04_OPTIONS_DEFAULT = ['New users', 'Retained users', 'Resurrected users', 'Churned users', 'Power users', 'Organic users'];
const DECOMP_CORRECT = ['New users', 'Retained users', 'Resurrected users'];

function Module_MF04({ module, onNext }) {
  const saved04 = useMemo(function() { return loadMFState('mf04'); }, []);
  const [options, setOptions] = useState(function() { return saved04 && saved04.options ? saved04.options : shuffleMF(MF04_OPTIONS_DEFAULT); });
  const [picked, setPicked] = useState(function() { return saved04 && saved04.picked ? saved04.picked : []; });
  const [checked, setChecked] = useState(function() { return saved04 ? saved04.checked : false; });

  useEffect(function() {
    saveMFState('mf04', { options: options, picked: picked, checked: checked });
  }, [options, picked, checked]);

  function toggle(opt) {
    if (checked) return;
    setPicked(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]);
  }

  const correct = picked.length === 3 && DECOMP_CORRECT.every(c => picked.includes(c));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
        Decomposition converts a single number into a set of drivers with different root causes and interventions.
        When a top-line metric moves, your first question is: <em>which component drove it?</em>
      </p>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
          DAU can be decomposed as the sum of three user segments. Select the three correct components:
        </div>
        <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Click exactly three user segment labels that together make up DAU on any given day, then click Check to verify your decomposition.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.5rem' }}>
          {options.map(opt => {
            const sel = picked.includes(opt);
            const isCorrect = DECOMP_CORRECT.includes(opt);
            let bg = sel ? 'var(--accent-bg)' : 'var(--surface)', border = sel ? 'var(--accent)' : 'var(--border)', color = sel ? 'var(--accent)' : 'var(--text-muted)';
            if (checked) {
              if (isCorrect) { bg = 'var(--green-bg)'; border = 'var(--green-border)'; color = 'var(--green)'; }
              else if (sel) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
            }
            return (
              <button key={opt} onClick={() => toggle(opt)} style={{ padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid ' + border, background: bg, color, fontSize: '0.83rem', fontWeight: sel ? 600 : 400, cursor: checked ? 'default' : 'pointer', transition: 'all 0.15s' }}>
                {checked && isCorrect ? '✓ ' : checked && sel ? '✗ ' : ''}{opt}
              </button>
            );
          })}
        </div>
        {picked.length === 3 && !checked && (
          <button onClick={() => setChecked(true)} style={{ marginTop: '0.75rem', padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Check</button>
        )}
        {checked && (
          <div className="pal-reveal-in" style={{ marginTop: '0.75rem', background: correct ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (correct ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            {correct
              ? '✓ Correct. DAU = New + Retained + Resurrected. A DAU drop is a very different problem depending on which component fell: acquisition issue vs retention problem vs re-engagement gap.'
              : '✗ The three components are New, Retained, and Resurrected users. "Churned" is the subtraction that gets you from yesterday\'s DAU to tomorrow\'s — it\'s a driver of change, not a component of today\'s DAU.'}
          </div>
        )}
      </div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>LTV Decomposition</div>
        <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          LTV = ARPU \xd7 Avg lifespan = (Revenue per transaction \xd7 Transactions per month) \xd7 (1 / Churn rate)<br />
          This decomposition tells you whether an LTV improvement requires raising price, increasing purchase frequency, or reducing churn — three different product and pricing strategies.
        </div>
      </div>
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}

// ─── Module 5: Counter Metrics ────────────────────────────────────────────────

const MF05_PAIRS_DEFAULT = [
  { primary: 'Push notification send volume', correct: 'notif-opt-out', options: ['notif-opt-out', 'dau', 'session-length'], labels: { 'notif-opt-out': 'Notification opt-out rate', 'dau': 'DAU', 'session-length': 'Session length' } },
  { primary: 'Ads shown per session', correct: 'ad-hide', options: ['ad-hide', 'page-load', 'revenue'], labels: { 'ad-hide': 'Ad hide / negative feedback rate', 'page-load': 'Page load time', 'revenue': 'Ad revenue' } },
  { primary: 'Search ranking aggressiveness (more results)', correct: 'zero-click', options: ['zero-click', 'query-count', 'ctr'], labels: { 'zero-click': 'Zero-click rate (query abandoned)', 'query-count': 'Total search queries', 'ctr': 'Result click-through rate' } },
];

function Module_MF05({ module, onNext }) {
  const saved05 = useMemo(function() { return loadMFState('mf05'); }, []);
  const [pairs, setPairs] = useState(function() { return saved05 && saved05.pairs ? saved05.pairs : shuffleMF(MF05_PAIRS_DEFAULT); });
  const [answers, setAnswers] = useState(function() { return saved05 && saved05.answers ? saved05.answers : {}; });
  const [checked, setChecked] = useState(function() { return saved05 ? saved05.checked : false; });

  useEffect(function() {
    saveMFState('mf05', { pairs: pairs, answers: answers, checked: checked });
  }, [pairs, answers, checked]);

  const allAnswered = pairs.every(function(_, i) { return answers[i] !== undefined; });
  const score = checked ? pairs.filter(function(p, i) { return answers[i] === p.correct; }).length : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
        Every metric you optimise creates pressure to sacrifice something else.
        <strong> Counter metrics</strong> make that tradeoff explicit before an experiment ships.
        For each primary metric below, select its most important counter metric:
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
                  {checked && isCorrect ? '✓ ' : checked && sel ? '✗ ' : ''}{pair.labels[opt]}
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
          {score === pairs.length ? '✓ All correct. Opt-out rate catches notification fatigue. Ad hide rate catches ad quality degradation. Zero-click rate catches search quality degradation.' : score + '/' + pairs.length + '. Counter metrics protect the quality of the user experience that isn\'t captured in the primary optimisation signal.'}
        </div>
      )}
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}

// ─── Module 6: Leading vs Lagging ────────────────────────────────────────────

const MF06_ITEMS_DEFAULT = [
  { id: 'rev',      label: 'Monthly revenue',                    correct: 'lagging',  reason: 'Confirms past performance. No signal about what drove it or what\'s coming.' },
  { id: 'd7ret',    label: 'D7 retention rate',                  correct: 'leading',  reason: 'Predicts LTV and long-term DAU trajectory. Fast-moving and sensitive.' },
  { id: 'sub',      label: 'Total subscriber count',             correct: 'lagging',  reason: 'Accumulates over time. Slow to reflect product changes.' },
  { id: 'onboard',  label: 'Onboarding completion rate',         correct: 'leading',  reason: 'Predicts new user activation and early retention. Moves in days.' },
  { id: 'nps',      label: 'Net Promoter Score (quarterly)',      correct: 'lagging',  reason: 'Survey-based, infrequent, and reflects cumulative experience — not current product state.' },
  { id: 'act',      label: 'Actions taken in first session',     correct: 'leading',  reason: 'Strong early signal of engagement depth and eventual retention.' },
];

function Module_MF06({ module, onNext }) {
  const saved06 = useMemo(function() { return loadMFState('mf06'); }, []);
  const [items06, setItems06] = useState(function() { return saved06 && saved06.items ? saved06.items : shuffleMF(MF06_ITEMS_DEFAULT); });
  const [placements, setPlacements] = useState(function() { return saved06 && saved06.placements ? saved06.placements : {}; });
  const [checked, setChecked] = useState(function() { return saved06 ? saved06.checked : false; });

  useEffect(function() {
    saveMFState('mf06', { items: items06, placements: placements, checked: checked });
  }, [items06, placements, checked]);

  const allPlaced = items06.every(function(i) { return placements[i.id]; });
  const score = checked ? items06.filter(function(i) { return placements[i.id] === i.correct; }).length : null;

  function cycle(id) {
    if (checked) return;
    setPlacements(prev => {
      const cur = prev[id];
      if (!cur) return { ...prev, [id]: 'leading' };
      if (cur === 'leading') return { ...prev, [id]: 'lagging' };
      const n = { ...prev }; delete n[id]; return n;
    });
  }

  function chipStyle(item) {
    const placed = placements[item.id];
    let bg = 'var(--surface-2)', border = 'var(--border)', color = 'var(--text-muted)';
    if (checked) {
      const ok = placed === item.correct;
      bg = ok ? 'var(--green-bg)' : 'var(--red-bg)'; border = ok ? 'var(--green-border)' : 'var(--red-border)'; color = ok ? 'var(--green)' : 'var(--red)';
    } else if (placed === 'leading') { bg = 'var(--accent-bg)'; border = 'var(--accent-border)'; color = 'var(--accent)'; }
    else if (placed === 'lagging') { bg = 'var(--purple-bg)'; border = 'var(--purple-border)'; color = 'var(--purple)'; }
    return { padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid ' + border, background: bg, color, fontSize: '0.82rem', fontWeight: placed || checked ? 600 : 400, cursor: checked ? 'default' : 'pointer', userSelect: 'none', transition: 'all 0.15s', display: 'inline-block' };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
        <strong>Leading indicators</strong> move before the outcome — they predict. <strong>Lagging indicators</strong> confirm after — they report.
        The best experiment primary metrics are leading: fast, sensitive, and predictive of the lagging outcome you ultimately care about.
      </p>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1.1rem' }}>
        <p style={{ margin: '0 0 0.6rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text)' }}>Exercise:</strong> Click each metric to label it <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Leading</span> or <span style={{ color: 'var(--purple)', fontWeight: 600 }}>Lagging</span>. Click again to toggle, or a third time to clear.
        </p>
        <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Click each metric chip once to mark it as Leading, again to mark it as Lagging, and a third time to clear it. Label all six before checking your answers.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {items06.map(item => (
            <span key={item.id} style={chipStyle(item)} onClick={() => cycle(item.id)}>
              {checked && (placements[item.id] === item.correct ? '✓ ' : '✗ ')}
              {item.label}
              {placements[item.id] && !checked && <span style={{ fontSize: '0.7rem', opacity: 0.75, marginLeft: '0.3rem' }}>[{placements[item.id]}]</span>}
            </span>
          ))}
        </div>
      </div>
      {checked && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1.1rem' }}>
          {items06.map(item => (
            <div key={item.id} style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', lineHeight: 1.5 }}>
              <strong style={{ color: placements[item.id] === item.correct ? 'var(--green)' : 'var(--red)' }}>
                {item.label}
              </strong>{' — '}{item.reason}
            </div>
          ))}
        </div>
      )}
      {allPlaced && !checked && (
        <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> All six metrics are labeled. Click Check answers to see detailed reasoning for each classification.
        </div>
      )}
      {allPlaced && !checked && (
        <button onClick={() => setChecked(true)} style={{ alignSelf: 'flex-start', padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Check answers</button>
      )}
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} />
    </div>
  );
}

// ─── Module 7: North Star Design ─────────────────────────────────────────────

function Module_MF07({ module, onNext }) {
  const saved07 = useMemo(function() { return loadMFState('mf07'); }, []);
  const [selected, setSelected] = useState(function() { return saved07 ? saved07.selected : null; });
  const [answered, setAnswered] = useState(function() { return saved07 ? saved07.answered : false; });

  useEffect(function() {
    saveMFState('mf07', { selected: selected, answered: answered });
  }, [selected, answered]);

  const Q = {
    question: 'Spotify is choosing its North Star metric. Which candidate best captures delivered value to users — not extracted value for the company?',
    options: [
      { id: 'a', text: 'Monthly revenue per user — directly measures business health.' },
      { id: 'b', text: 'MAU — captures scale of the engaged user base.' },
      { id: 'c', text: 'Time spent listening per DAU — captures how much music value users are actually receiving.' },
      { id: 'd', text: 'Subscriber conversion rate — measures the paywall efficiency.' },
    ],
    correct: 'c',
    explanation: 'Revenue and conversion rate measure what Spotify extracts, not what users receive. MAU captures presence but not depth — a user who opens the app once counts. "Time spent listening per DAU" is strong because it directly measures the core value delivered (music listening) per engaged user. It is hard to inflate without genuinely improving the listening experience, and it correlates with retention and subscription. The weakness: it could be gamed by autoplay without user intent — which is why guardrails on skip rate and session exit matter.',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
        A North Star metric should answer: <em>"Is the product delivering genuine value to users?"</em> — not "Is the company extracting revenue?"
        The best North Stars are behaviours that correlate with user value delivery, that are hard to inflate without real improvement, and that the whole company can reason about.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '0.5rem' }}>
        {[
          { label: 'Captures user value', desc: 'What users get, not what company takes', good: true },
          { label: 'Hard to game', desc: 'Moving it requires real product improvement', good: true },
          { label: 'Company-wide clarity', desc: 'Every team understands what moving it means', good: true },
          { label: 'Lagging or extracted value', desc: 'Revenue, subs — result of value, not value itself', good: false },
        ].map(c => (
          <div key={c.label} style={{ background: c.good ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (c.good ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: c.good ? 'var(--green)' : 'var(--red)' }}>{c.good ? '✓ ' : '✗ '}{c.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{c.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>{Q.question}</div>
        <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Apply the North Star criteria above — choose the candidate that measures value delivered to users rather than value extracted by the business, then click Submit.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {Q.options.map(opt => (
            <MCQOption key={opt.id} label={opt.text} selected={selected === opt.id} correct={opt.id === Q.correct} revealed={answered} onClick={() => !answered && setSelected(opt.id)} />
          ))}
        </div>
        {selected && !answered && (
          <button onClick={() => setAnswered(true)} style={{ marginTop: '0.75rem', padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Submit</button>
        )}
        {answered && (
          <div className="pal-reveal-in" style={{ marginTop: '0.75rem', background: selected === Q.correct ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (selected === Q.correct ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <strong>{selected === Q.correct ? '✓ Correct. ' : '✗ Not quite. '}</strong>{Q.explanation}
          </div>
        )}
      </div>
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} label="Complete module →" />
    </div>
  );
}

// ─── Module 8: Metric Sensitivity ────────────────────────────────────────────

function Module_MF08({ module, onNext }) {
  const saved08 = useMemo(function() { return loadMFState('mf08'); }, []);
  const [selected, setSelected] = useState(function() { return saved08 ? saved08.selected : null; });
  const [answered, setAnswered] = useState(function() { return saved08 ? saved08.answered : false; });

  useEffect(function() {
    saveMFState('mf08', { selected: selected, answered: answered });
  }, [selected, answered]);

  const Q = {
    question: 'A team is running an A/B test on checkout flow. Their primary metric is "revenue per user" (RPU), which has a standard deviation of $45 and a mean of $12. Their MDE is 5% lift ($0.60). After 4 weeks they have 50,000 users per arm and p=0.21. What is the most likely root cause?',
    options: [
      { id: 'a', text: 'The experiment was underpowered — 50K users per arm is too small for a metric with CV of 375% (SD/mean = $45/$12).' },
      { id: 'b', text: 'The treatment is ineffective — p=0.21 is decisive evidence of no effect.' },
      { id: 'c', text: 'Sample ratio mismatch — the unequal mean/SD ratio suggests allocation bias.' },
      { id: 'd', text: 'The wrong statistical test was used — RPU requires a non-parametric test.' },
    ],
    correct: 'a',
    explanation: 'A coefficient of variation (CV = SD/mean) of 375% means revenue is extremely noisy relative to its mean — most users spend $0, a few spend a lot. To detect a $0.60 lift (5%) with 80% power, you would need roughly (45 / 0.60)^2 \xd7 2 \xd7 7.85 ≈ 4.7 million users per arm, not 50K. p=0.21 is entirely consistent with the true effect existing but the test being massively underpowered. The fix: use a more sensitive metric (conversion rate, add-to-cart rate) as the primary, and validate against RPU in a longer holdout.',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>
        A metric's <strong>sensitivity</strong> determines how large a sample you need to detect a real effect.
        High-variance metrics (revenue, time on site) require enormous samples. Low-variance proxies (conversion rate, clicks) detect effects faster —
        but only if they are causally linked to the outcome you care about.
      </p>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.83rem', marginBottom: '0.5rem' }}>Factors affecting metric sensitivity</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.4rem' }}>
          {[
            { factor: 'Lower variance', effect: 'Fewer users needed', dir: 'good' },
            { factor: 'Larger MDE', effect: 'Fewer users needed', dir: 'good' },
            { factor: 'Higher baseline rate', effect: 'Fewer users needed', dir: 'good' },
            { factor: 'Longer experiment', effect: 'More power (diminishing returns)', dir: 'neutral' },
            { factor: 'High-value outliers', effect: 'Inflates variance enormously', dir: 'bad' },
            { factor: 'Zero-inflated distribution', effect: 'CV explodes, sample grows', dir: 'bad' },
          ].map(f => (
            <div key={f.factor} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.75rem', fontSize: '0.78rem' }}>
              <div style={{ fontWeight: 600, color: f.dir === 'good' ? 'var(--green)' : f.dir === 'bad' ? 'var(--red)' : 'var(--text)' }}>{f.factor}</div>
              <div style={{ color: 'var(--text-muted)', marginTop: '0.1rem' }}>{f.effect}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>{Q.question}</div>
        <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.84rem', color: 'var(--green)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Calculate the coefficient of variation from the numbers given, then identify which sensitivity factor explains the p=0.21 result before clicking Submit.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {Q.options.map(opt => (
            <MCQOption key={opt.id} label={opt.text} selected={selected === opt.id} correct={opt.id === Q.correct} revealed={answered} onClick={() => !answered && setSelected(opt.id)} />
          ))}
        </div>
        {selected && !answered && (
          <button onClick={() => setAnswered(true)} style={{ marginTop: '0.75rem', padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Submit</button>
        )}
        {answered && (
          <div className="pal-reveal-in" style={{ marginTop: '0.75rem', background: selected === Q.correct ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (selected === Q.correct ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <strong>{selected === Q.correct ? '✓ Correct. ' : '✗ Not quite. '}</strong>{Q.explanation}
          </div>
        )}
      </div>
      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} label="Complete module →" />
    </div>
  );
}

// ─── Module 9: Funnel Metrics ─────────────────────────────────────────────────

const FUNNEL_SCENARIOS = {
  baseline: [10000, 4200, 2100, 1600, 900],
  emailbug: [10000, 4200, 2100, 840, 900],
  trafficquality: [10000, 2100, 2100, 1600, 900],
};

const FUNNEL_STEP_NAMES = ['Visit', 'Signup click', 'Form complete', 'Email verify', 'Profile done'];

const MF09_MCQ = {
  question: 'In the baseline funnel, which step has the largest absolute user loss?',
  options: [
    'Visit → Signup click (5,800 users lost)',
    'Signup click → Form complete (2,100 users lost)',
    'Form complete → Email verify (500 users lost)',
    'Email verify → Profile done (700 users lost)',
  ],
  correct: 'Signup click → Form complete (2,100 users lost)',
  explanation: 'Visit to Signup click loses 5,800 users in absolute terms — that is the largest single-step drop. Signup click to Form complete loses 2,100. End-to-end conversion fixation misses this; the largest absolute loss is always the priority.',
};

function Module_MF09({ module, onNext }) {
  const saved09 = useMemo(function() { return loadMFState('mf09'); }, []);
  const [scenario, setScenario] = useState(function() { return saved09 && saved09.scenario ? saved09.scenario : 'baseline'; });
  const [selected, setSelected] = useState(function() { return saved09 ? saved09.selected : null; });
  const [revealed, setRevealed] = useState(function() { return saved09 ? saved09.revealed : false; });

  useEffect(function() {
    saveMFState('mf09', { scenario: scenario, selected: selected, revealed: revealed });
  }, [scenario, selected, revealed]);

  const counts = FUNNEL_SCENARIOS[scenario];
  const maxCount = counts[0];

  const biggestDropIdx = counts.reduce(function(bestIdx, _val, i) {
    if (i === 0) return bestIdx;
    const drop = counts[i - 1] - counts[i];
    const bestDrop = counts[bestIdx - 1] - counts[bestIdx];
    return drop > bestDrop ? i : bestIdx;
  }, 1);

  const biggestDropPct = Math.round(((counts[biggestDropIdx - 1] - counts[biggestDropIdx]) / counts[biggestDropIdx - 1]) * 100);

  function handleCheck() {
    if (selected !== null) setRevealed(true);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
        Funnel analysis is how analysts find where value is lost in a multi-step flow. The end-to-end conversion rate is almost never the right number to report — the step-to-step drop rate is. Switch between scenarios below and watch how the pattern of loss shifts.
      </p>

      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Click a scenario to load it into the funnel — observe which step shows the largest drop and how the highlighted step changes between scenarios.
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[
            { key: 'baseline', label: 'Baseline' },
            { key: 'emailbug', label: 'Email bug (verify drops 60%)' },
            { key: 'trafficquality', label: 'Traffic quality issue (click drops 50%)' },
          ].map(function(s) {
            return (
              <button
                key={s.key}
                onClick={function() { setScenario(s.key); }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid ' + (scenario === s.key ? 'var(--green)' : 'var(--border)'),
                  background: scenario === s.key ? 'var(--green-bg)' : 'var(--surface)',
                  color: scenario === s.key ? 'var(--green)' : 'var(--text-muted)',
                  fontWeight: scenario === s.key ? 700 : 400,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >{s.label}</button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {FUNNEL_STEP_NAMES.map(function(name, i) {
            const pct = Math.round((counts[i] / maxCount) * 100);
            const dropPct = i > 0 ? Math.round(((counts[i - 1] - counts[i]) / counts[i - 1]) * 100) : null;
            const isWorstDrop = i === biggestDropIdx;
            return (
              <div key={name}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', width: '100px', flexShrink: 0 }}>{name}</div>
                  <div style={{ flex: 1, background: 'var(--surface-2, var(--border))', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
                    <div style={{
                      width: pct + '%',
                      height: '100%',
                      background: isWorstDrop ? 'var(--red)' : 'var(--green)',
                      borderRadius: '4px',
                      transition: 'width 0.35s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600, width: '52px', flexShrink: 0, textAlign: 'right' }}>
                    {counts[i].toLocaleString()}
                  </div>
                  {dropPct !== null && (
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isWorstDrop ? 'var(--red)' : 'var(--text-muted)',
                      width: '56px',
                      flexShrink: 0,
                      textAlign: 'right',
                    }}>
                      -{dropPct}%
                    </div>
                  )}
                  {dropPct === null && <div style={{ width: '56px', flexShrink: 0 }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        background: 'var(--yellow-bg)',
        border: '1.5px solid var(--yellow-border)',
        borderRadius: 'var(--radius)',
        padding: '0.85rem 1.1rem',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.55,
      }}>
        <strong style={{ color: 'var(--yellow)' }}>Biggest drop: </strong>
        {FUNNEL_STEP_NAMES[biggestDropIdx - 1]} to {FUNNEL_STEP_NAMES[biggestDropIdx]} — {biggestDropPct}% falloff. This is where to focus first.
      </div>

      <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
        Switch between scenarios and notice how the pattern of drop changes. Traffic quality issues appear at step 1; product bugs appear mid-funnel.
      </div>

      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>{MF09_MCQ.question}</div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Select the answer that correctly identifies the step with the largest absolute user loss in the baseline funnel, then click Check answer.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
          {MF09_MCQ.options.map(function(opt) {
            return (
              <MCQOption
                key={opt}
                label={opt}
                selected={selected === opt}
                correct={opt === MF09_MCQ.correct}
                revealed={revealed}
                onClick={function() { if (!revealed) setSelected(opt); }}
              />
            );
          })}
        </div>
        {!revealed && (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selected !== null ? 'var(--green)' : 'var(--border)',
              color: selected !== null ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: selected !== null ? 'pointer' : 'default',
            }}
          >Check answer</button>
        )}
        {revealed && (
          <div className="pal-reveal-in" style={{
            marginTop: '0.75rem',
            background: selected === MF09_MCQ.correct ? 'var(--green-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (selected === MF09_MCQ.correct ? 'var(--green-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
          }}>
            <strong>{selected === MF09_MCQ.correct ? 'Correct. ' : 'Not quite. '}</strong>{MF09_MCQ.explanation}
          </div>
        )}
      </div>

      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} label="Complete module →" />
    </div>
  );
}

// ─── Module 10: Ratio Metrics in Depth ───────────────────────────────────────

const MF10_MCQ = {
  question: 'Overall conversion rate fell from 3.2% to 2.8%. Mobile conversion is 2.0% (unchanged). Desktop conversion is 5.0% (unchanged). What happened?',
  options: [
    'There is a measurement error — both segment rates are unchanged so overall cannot fall',
    'Mobile traffic share grew — mix shift pulled the overall rate down even though both segments are healthy',
    'Desktop conversion must have actually fallen; the data is inconsistent',
    'The denominator shrank, which mechanically reduced the overall rate',
  ],
  correct: 'Mobile traffic share grew — mix shift pulled the overall rate down even though both segments are healthy',
  explanation: 'This is a textbook mix shift (Simpson\'s Paradox). Mobile converts at 2% and desktop at 5%. If the share of mobile sessions grows, the weighted average falls — even with zero change inside either segment. Always check the denominator composition before diagnosing a conversion drop.',
};

function Module_MF10({ module, onNext }) {
  const saved10 = useMemo(function() { return loadMFState('mf10'); }, []);
  const [mobileSessions, setMobileSessions] = useState(function() { return saved10 && saved10.mobileSessions !== undefined ? saved10.mobileSessions : 6000; });
  const [mobileRPS, setMobileRPS] = useState(function() { return saved10 && saved10.mobileRPS !== undefined ? saved10.mobileRPS : 1.20; });
  const [desktopSessions, setDesktopSessions] = useState(function() { return saved10 && saved10.desktopSessions !== undefined ? saved10.desktopSessions : 4000; });
  const [desktopRPS, setDesktopRPS] = useState(function() { return saved10 && saved10.desktopRPS !== undefined ? saved10.desktopRPS : 3.50; });
  const [selected, setSelected] = useState(function() { return saved10 ? saved10.selected : null; });
  const [revealed, setRevealed] = useState(function() { return saved10 ? saved10.revealed : false; });

  useEffect(function() {
    saveMFState('mf10', { mobileSessions: mobileSessions, mobileRPS: mobileRPS, desktopSessions: desktopSessions, desktopRPS: desktopRPS, selected: selected, revealed: revealed });
  }, [mobileSessions, mobileRPS, desktopSessions, desktopRPS, selected, revealed]);

  const totalSessions = mobileSessions + desktopSessions;
  const totalRevenue = mobileSessions * mobileRPS + desktopSessions * desktopRPS;
  const overallRPS = totalSessions > 0 ? totalRevenue / totalSessions : 0;
  const mobilePct = totalSessions > 0 ? Math.round((mobileSessions / totalSessions) * 100) : 0;
  const isMixWarning = mobilePct > 70;

  function applyPreset() {
    setMobileSessions(8500);
    setDesktopSessions(4000);
    setMobileRPS(1.20);
    setDesktopRPS(3.50);
  }

  function handleCheck() {
    if (selected !== null) setRevealed(true);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
        Every ratio metric has three levers: numerator movement, denominator movement, and mix shift. A rate can fall even when every individual segment improves — if the mix shifts toward lower-converting segments. Use the explorer below to see this live.
      </p>

      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Revenue per Session decomposition</div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Drag the sliders to adjust session counts and revenue per session for each platform — watch the overall RPSession update in real time and notice when a mix shift drives it down.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Mobile sessions: <strong style={{ color: 'var(--text)' }}>{mobileSessions.toLocaleString()}</strong>
            </label>
            <input
              type="range"
              min="1000"
              max="9000"
              step="100"
              value={mobileSessions}
              onChange={function(e) { setMobileSessions(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: 'var(--green)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Mobile RPSession: <strong style={{ color: 'var(--text)' }}>${mobileRPS.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="0.50"
              max="3.00"
              step="0.05"
              value={mobileRPS}
              onChange={function(e) { setMobileRPS(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: 'var(--green)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Desktop sessions: <strong style={{ color: 'var(--text)' }}>{desktopSessions.toLocaleString()}</strong>
            </label>
            <input
              type="range"
              min="1000"
              max="9000"
              step="100"
              value={desktopSessions}
              onChange={function(e) { setDesktopSessions(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Desktop RPSession: <strong style={{ color: 'var(--text)' }}>${desktopRPS.toFixed(2)}</strong>
            </label>
            <input
              type="range"
              min="1.00"
              max="6.00"
              step="0.10"
              value={desktopRPS}
              onChange={function(e) { setDesktopRPS(Number(e.target.value)); }}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--surface-2, var(--surface))', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total sessions</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>{totalSessions.toLocaleString()}</div>
          </div>
          <div style={{ background: 'var(--surface-2, var(--surface))', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Overall RPSession</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--green)' }}>${overallRPS.toFixed(2)}</div>
          </div>
          <div style={{ background: isMixWarning ? 'var(--yellow-bg)' : 'var(--surface-2, var(--surface))', border: '1.5px solid ' + (isMixWarning ? 'var(--yellow-border)' : 'var(--border)'), borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: isMixWarning ? 'var(--yellow)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Mobile share</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isMixWarning ? 'var(--yellow)' : 'var(--text)' }}>{mobilePct}%</div>
          </div>
        </div>

        {isMixWarning && (
          <div className="pal-reveal-in" style={{ fontSize: '0.83rem', color: 'var(--yellow)', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.9rem', lineHeight: 1.55 }}>
            Mix shift — mobile is dominating; RPSession will fall even if both segments improve.
          </div>
        )}

        <div style={{ marginTop: '0.85rem' }}>
          <button
            onClick={applyPreset}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--accent-border)',
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >Add mobile users (preset)</button>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.6rem' }}>Sets mobile to 8,500; desktop stays. Watch overall RPSession fall.</span>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>{MF10_MCQ.question}</div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Select the answer that explains how overall conversion can fall even when both segment rates are unchanged, then click Check answer.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
          {MF10_MCQ.options.map(function(opt) {
            return (
              <MCQOption
                key={opt}
                label={opt}
                selected={selected === opt}
                correct={opt === MF10_MCQ.correct}
                revealed={revealed}
                onClick={function() { if (!revealed) setSelected(opt); }}
              />
            );
          })}
        </div>
        {!revealed && (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selected !== null ? 'var(--green)' : 'var(--border)',
              color: selected !== null ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: selected !== null ? 'pointer' : 'default',
            }}
          >Check answer</button>
        )}
        {revealed && (
          <div className="pal-reveal-in" style={{
            marginTop: '0.75rem',
            background: selected === MF10_MCQ.correct ? 'var(--green-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (selected === MF10_MCQ.correct ? 'var(--green-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
          }}>
            <strong>{selected === MF10_MCQ.correct ? 'Correct. ' : 'Not quite. '}</strong>{MF10_MCQ.explanation}
          </div>
        )}
      </div>

      <InsightBox label="Key Insight" color="var(--green)" bg="var(--green-bg)" border="var(--green-border)">{module.keyInsight}</InsightBox>
      <InsightBox label="Connects to Experiments" color="var(--accent)" bg="var(--accent-bg)" border="var(--accent-border)">{module.connection}</InsightBox>
      <NextBtn onClick={onNext} label="Complete module →" />
    </div>
  );
}

// ─── Module 11: Composite Metrics ────────────────────────────────────────────

function Module_MF11({ module, onNext }) {
  const saved11 = useMemo(function() { return loadMFState('mf11'); }, []);
  const [wA, setWA] = useState(function() { return saved11 && saved11.wA !== undefined ? saved11.wA : 40; });
  const [wB, setWB] = useState(function() { return saved11 && saved11.wB !== undefined ? saved11.wB : 35; });
  const [wC, setWC] = useState(function() { return saved11 && saved11.wC !== undefined ? saved11.wC : 25; });
  const [answer, setAnswer] = useState(function() { return saved11 && saved11.answer !== undefined ? saved11.answer : null; });
  const [revealed, setRevealed] = useState(function() { return saved11 ? saved11.revealed : false; });

  useEffect(function() {
    saveMFState('mf11', { wA: wA, wB: wB, wC: wC, answer: answer, revealed: revealed });
  }, [wA, wB, wC, answer, revealed]);

  // Three component metrics with fixed underlying values
  // A: Engagement (score 0-100, currently 72)
  // B: Retention (score 0-100, currently 58)
  // C: Revenue efficiency (score 0-100, currently 81)
  var valA = 72; var valB = 58; var valC = 81;

  // Composite = weighted average, normalized to 0-100
  var totalW = wA + wB + wC;
  var composite = totalW > 0 ? ((wA * valA + wB * valB + wC * valC) / (totalW * 100)) * 100 : 0;
  var compositeDisplay = Math.round(composite * 10) / 10;

  var mcqOptions = [
    { label: 'A. Composite metrics introduce double-counting — if components are correlated, the composite overstates their combined signal.', correct: false },
    { label: 'B. A component metric can quietly degrade while the composite stays flat — the composite masks individual signal.', correct: true },
    { label: 'C. Teams optimizing for the composite learn to move the highest-weight component and neglect the rest, gaming the OEC without real improvement.', correct: false },
    { label: 'D. They require more statistical samples than individual metrics.', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
        A composite metric (or Overall Evaluation Criterion, OEC) combines multiple signals into one
        number to simplify ship decisions when individual metrics conflict. Microsoft\'s experimentation
        team pioneered this for cases where no single metric tells the full story.
      </p>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
          Build your OEC — adjust component weights
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Drag each weight slider to redistribute how much each component contributes to the OEC score — watch what happens to the composite when you underweight retention.
        </div>

        {[
          { label: 'Engagement score', val: valA, w: wA, setter: setWA, color: 'var(--accent)' },
          { label: 'Retention score', val: valB, w: wB, setter: setWB, color: 'var(--teal)' },
          { label: 'Revenue efficiency', val: valC, w: wC, setter: setWC, color: 'var(--green)' },
        ].map(function(metric) {
          return (
            <div key={metric.label} style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>{metric.label}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Value: <strong style={{ color: metric.color }}>{metric.val}</strong> &nbsp;|&nbsp; Weight: <strong>{metric.w}%</strong></span>
              </div>
              <input
                type="range" min={0} max={80} step={5}
                value={metric.w}
                onChange={function(e) { metric.setter(parseInt(e.target.value, 10)); }}
                style={{ width: '100%', accentColor: metric.color }}
              />
            </div>
          );
        })}

        <div style={{ marginTop: '0.5rem', padding: '0.85rem 1rem', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>OEC Score</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>{compositeDisplay}</span>
        </div>

        {wB < 15 && (
          <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--red)', lineHeight: 1.45 }}>
            Warning: Retention weight is low. A feature that tanks retention could still show a positive OEC score — the OEC is now masking a critical signal.
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Use composites when', items: ['Multiple metrics conflict at ship decision', 'You need a single OKR to align teams', 'Component importance is stable and agreed-upon'] },
          { label: 'Avoid composites when', items: ['Individual metric health matters independently', 'Weights are politically negotiated post-hoc', 'A component could degrade catastrophically'] },
        ].map(function(card) {
          return (
            <div key={card.label} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>{card.label}</div>
              {card.items.map(function(item, i) {
                return <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '0.2rem' }}>{item}</div>;
              })}
            </div>
          );
        })}
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
          What is the primary risk of using a composite metric as your primary experiment decision criterion?
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Select the answer that best identifies the structural weakness of composite metrics, then click Check.
        </div>

        {mcqOptions.map(function(opt, i) {
          var sel = answer === i;
          var bg = 'var(--surface-2)';
          var border = 'var(--border)';
          var color = 'var(--text)';
          if (revealed) {
            if (opt.correct) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
            else if (sel) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
          } else if (sel) { border = 'var(--accent-border)'; }
          return (
            <button key={i} onClick={function() { if (!revealed) setAnswer(i); }} disabled={revealed}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', marginBottom: '0.5rem', background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)', color: color, fontSize: '0.88rem', cursor: revealed ? 'default' : 'pointer', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          );
        })}

        {answer !== null && !revealed && (
          <button onClick={function() { setRevealed(true); }} style={{ marginTop: '0.5rem', padding: '0.5rem 1.1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Check
          </button>
        )}

        {revealed && (
          <div className="pal-reveal-in">
            <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>
              Composite metrics can mask individual signal. If retention drops 20% but engagement and revenue surge, the OEC may stay flat or even improve — signaling a healthy product when one foundational metric is collapsing. Option A (double-counting) is a real concern when components are correlated, but it is a calibration problem — fixable by choosing orthogonal components or adjusting weights. Option C (gaming) is also real, but it is a secondary risk. The primary structural weakness is masking: a composite hides what its components are individually doing. This is why guardrail metrics exist: to catch what the OEC cannot.
            </div>
            <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>Key Insight</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6 }}>
                A composite metric is only as good as its weights and the independence of its components. Weights that are negotiated politically rather than derived empirically create a metric that can be gamed. And when a team optimizes for the OEC, they optimize away from the individual metrics you actually care about.
              </div>
            </div>
            <button onClick={onNext} className="pal-glow-pulse" style={{ marginTop: '1.5rem', padding: '0.65rem 1.6rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Module 12: Guardrail Metrics ─────────────────────────────────────────────

function Module_MF12({ module, onNext }) {
  const saved12 = useMemo(function() { return loadMFState('mf12'); }, []);
  const [decisions, setDecisions] = useState(function() { return saved12 && saved12.decisions ? saved12.decisions : {}; });
  const [explanations, setExplanations] = useState(function() { return saved12 && saved12.explanations ? saved12.explanations : {}; });
  const [answer, setAnswer] = useState(function() { return saved12 && saved12.answer !== undefined ? saved12.answer : null; });
  const [revealed, setRevealed] = useState(function() { return saved12 ? saved12.revealed : false; });
  var scenariosCount = 4;
  const [allDone, setAllDone] = useState(function() { return saved12 && saved12.decisions ? Object.keys(saved12.decisions).length >= scenariosCount : false; });

  useEffect(function() {
    saveMFState('mf12', { decisions: decisions, explanations: explanations, answer: answer, revealed: revealed });
  }, [decisions, explanations, answer, revealed]);

  var scenarios = [
    {
      id: 's1',
      primary: '+3.2% DAU',
      guardrail: 'Page load time +180ms (threshold: +100ms)',
      breached: true,
      ship: false,
      explanation: 'Guardrail breached — do not ship. A 180ms load time regression affects user experience for the entire user base. The DAU gain does not justify degrading performance beyond the pre-committed threshold.',
    },
    {
      id: 's2',
      primary: '+1.8% session length',
      guardrail: 'Crash rate unchanged',
      breached: false,
      ship: true,
      explanation: 'Ship. Primary metric positive, guardrail healthy. This is a clean win.',
    },
    {
      id: 's3',
      primary: '+5.1% revenue',
      guardrail: 'Support ticket volume +22% (threshold: +10%)',
      breached: true,
      ship: false,
      explanation: 'Do not ship. Revenue gain driven by user confusion generates downstream costs and erodes trust. The guardrail exists precisely to catch this pattern.',
    },
    {
      id: 's4',
      primary: 'Neutral (0.1%, not significant)',
      guardrail: 'All guardrails healthy',
      breached: false,
      ship: false,
      explanation: 'Do not ship — primary metric neutral. Shipping a neutral result consumes engineering maintenance overhead for no measured user benefit. Wait for a stronger signal or iterate.',
    },
  ];

  function decide(sid, shipDecision) {
    if (decisions[sid] !== undefined) return;
    var s = scenarios.find(function(sc) { return sc.id === sid; });
    var correct = shipDecision === s.ship;
    setDecisions(function(prev) { var n = Object.assign({}, prev); n[sid] = shipDecision; return n; });
    setExplanations(function(prev) { var n = Object.assign({}, prev); n[sid] = { correct: correct, text: s.explanation }; return n; });
    var allDecided = scenarios.every(function(sc) { return sc.id === sid || decisions[sc.id] !== undefined; });
    if (allDecided) { setAllDone(true); }
  }

  var mcqOptions = [
    { label: 'A. So the team has time to instrument the guardrail metric before running the experiment.', correct: false },
    { label: 'B. Because pre-commitment removes the ability to renegotiate the threshold after seeing results — preventing p-hacking the guardrail.', correct: true },
    { label: 'C. Legal compliance requires pre-registration of all experiment metrics.', correct: false },
    { label: 'D. Post-hoc guardrails are more accurate because they account for the actual experiment data.', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
        Guardrail metrics are the metrics a team commits to <em>not degrading</em> before an experiment launches.
        They act as a veto on the primary metric — if the primary wins but a guardrail is breached, the
        feature does not ship. Their power comes entirely from pre-commitment.
      </p>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
          Ship or no ship? Click your decision for each scenario.
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> For each scenario, decide whether to ship or hold — click your decision to see if it matches the correct call and why.
        </div>

        {scenarios.map(function(s) {
          var dec = decisions[s.id];
          var exp = explanations[s.id];
          return (
            <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid ' + (exp ? (exp.correct ? 'var(--teal-border)' : 'var(--red-border)') : 'var(--border)'), borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '0.65rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Primary metric</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 600 }}>{s.primary}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: s.breached ? 'var(--red)' : 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Guardrail</div>
                  <div style={{ fontSize: '0.85rem', color: s.breached ? 'var(--red)' : 'var(--text-muted)' }}>{s.guardrail}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[true, false].map(function(shipVal) {
                  var isSelected = dec === shipVal;
                  var label = shipVal ? 'Ship' : 'Do not ship';
                  var bg = 'var(--surface-2)';
                  var color = 'var(--text-muted)';
                  if (isSelected && !exp) { bg = 'var(--accent-bg)'; color = 'var(--accent)'; }
                  if (exp && isSelected) { bg = exp.correct ? 'var(--teal)' : 'var(--red)'; color = '#fff'; }
                  return (
                    <button key={String(shipVal)} onClick={function() { decide(s.id, shipVal); }}
                      disabled={dec !== undefined}
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem', fontWeight: 600, background: bg, color: color, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: dec !== undefined ? 'default' : 'pointer' }}>
                      {label}
                    </button>
                  );
                })}
              </div>
              {exp && (
                <div className="pal-reveal-in" style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {exp.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allDone && (
        <div className="pal-reveal-in">
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
            Why must guardrail thresholds be pre-committed before an experiment launches?
          </div>
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            <strong>What to do:</strong> Select the answer that explains why pre-commitment matters for guardrails, then click Check.
          </div>

          {mcqOptions.map(function(opt, i) {
            var sel = answer === i;
            var bg = 'var(--surface-2)'; var border = 'var(--border)'; var color = 'var(--text)';
            if (revealed) {
              if (opt.correct) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
              else if (sel) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
            } else if (sel) { border = 'var(--accent-border)'; }
            return (
              <button key={i} onClick={function() { if (!revealed) setAnswer(i); }} disabled={revealed}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', marginBottom: '0.5rem', background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)', color: color, fontSize: '0.88rem', cursor: revealed ? 'default' : 'pointer', transition: 'all 0.15s' }}>
                {opt.label}
              </button>
            );
          })}

          {answer !== null && !revealed && (
            <button onClick={function() { setRevealed(true); }} style={{ marginTop: '0.5rem', padding: '0.5rem 1.1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              Check
            </button>
          )}

          {revealed && (
            <div className="pal-reveal-in">
              <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>
                Post-hoc guardrail negotiation is the most common form of p-hacking in enterprise experimentation. If a team can adjust the threshold after seeing results, the guardrail provides no actual protection — it becomes a rubber stamp on whatever the team wanted to ship. Pre-commitment is the mechanism that gives guardrails their teeth.
              </div>
              <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>Key Insight</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6 }}>
                  Guardrail metrics are a governance mechanism, not just a technical one. A team that consistently renegotiates guardrails post-experiment is signaling that shipping velocity is prioritized over product health. Senior interviewers test whether you understand this distinction.
                </div>
              </div>
              <button onClick={onNext} className="pal-glow-pulse" style={{ marginTop: '1.5rem', padding: '0.65rem 1.6rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Module 13: Metric Sensitivity ───────────────────────────────────────────

function Module_MF13({ module, onNext }) {
  const saved13 = useMemo(function() { return loadMFState('mf13'); }, []);
  const [cv, setCv] = useState(function() { return saved13 && saved13.cv !== undefined ? saved13.cv : 1.2; });
  const [answer, setAnswer] = useState(function() { return saved13 && saved13.answer !== undefined ? saved13.answer : null; });
  const [revealed, setRevealed] = useState(function() { return saved13 ? saved13.revealed : false; });

  useEffect(function() {
    saveMFState('mf13', { cv: cv, answer: answer, revealed: revealed });
  }, [cv, answer, revealed]);

  // Sample size approximation: n ~ (z_alpha + z_beta)^2 * sigma^2 / delta^2
  // Simplified: n ~ CV^2 * constant (holding delta/mean fixed)
  // Base case: cv=0.5 gives n=250, cv=2.0 gives n=4000
  var baseN = 250;
  var sampN = Math.round(baseN * (cv / 0.5) * (cv / 0.5));

  // SVG for distribution visualization
  var W = 420; var H = 100;
  var padL = 10; var padR = 10; var padT = 10; var padB = 20;
  var innerW = W - padL - padR; var innerH = H - padT - padB;

  // Draw approximate normal distribution curve for given CV
  var pts = 60;
  function gauss(x, sigma) {
    return Math.exp(-0.5 * (x / sigma) * (x / sigma));
  }

  function makeCurvePath(sigma) {
    var result = [];
    for (var i = 0; i < pts; i++) {
      var t = i / (pts - 1);
      var x = -3 + t * 6;
      var y = gauss(x, sigma);
      var svgX = padL + t * innerW;
      var svgY = padT + innerH - y * innerH * 0.88;
      result.push((i === 0 ? 'M' : 'L') + ' ' + svgX + ' ' + svgY);
    }
    return result.join(' ');
  }

  var narrowPath = makeCurvePath(0.8);
  var widePath = makeCurvePath(cv);

  var mcqOptions = [
    { label: 'A. Revenue per user — because it is the most important business metric.', correct: false },
    { label: 'B. Click-through rate — it has lower variance relative to its mean, making small effects detectable with fewer users.', correct: true },
    { label: 'C. Revenue per user — because it directly measures monetization impact.', correct: false },
    { label: 'D. Session length — because it is correlated with engagement.', correct: false },
  ];

  var cvLabel = Math.round(cv * 10) / 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
        Metric sensitivity determines how quickly an experiment can detect a real effect. A metric
        with high variance relative to its mean (high CV = SD / mean) requires far more samples to
        detect the same lift. This is why revenue per user is notoriously expensive to experiment
        with — a small number of high spenders creates extreme variance.
      </p>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
          Adjust coefficient of variation (CV) — watch sample size requirements change
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Drag the CV slider to adjust the coefficient of variation — watch how the required sample size changes as the metric becomes noisier or more precise.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 600 }}>CV (SD / mean)</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)' }}>{cvLabel}</span>
            </div>
            <input type="range" min={0.3} max={3.0} step={0.1} value={cv}
              onChange={function(e) { setCv(parseFloat(e.target.value)); }}
              style={{ width: '100%', accentColor: 'var(--accent)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              <span>0.3 (low)</span><span>3.0 (high)</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '0.85rem', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Required sample size</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{sampN.toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per arm, to detect 5% lift</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textAlign: 'center' }}>Distribution width at CV = {cvLabel}</div>
          <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" style={{ display: 'block' }}>
            <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
            <path d={narrowPath} fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
            <path d={widePath} fill="none" stroke="var(--accent)" strokeWidth="2" />
            <text x={padL + 8} y={padT + 16} fontSize="9" fill="var(--teal)" opacity="0.8">Low CV (reference)</text>
            <text x={padL + 8} y={padT + 30} fontSize="9" fill="var(--accent)" fontWeight="700">CV = {cvLabel}</text>
            <line x1={W / 2} y1={padT} x2={W / 2} y2={padT + innerH} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="8" fill="var(--text-muted)">mean</text>
          </svg>
        </div>

        <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {[
            { metric: 'Click-through rate', cv: '~0.3-0.5', note: 'Most sensitive — binary outcomes' },
            { metric: 'Session length', cv: '~0.8-1.2', note: 'Moderate — right-skewed' },
            { metric: 'Revenue per user', cv: '~1.5-3.5', note: 'Least sensitive — zero-inflated' },
          ].map(function(row) {
            return (
              <div key={row.metric} style={{ padding: '0.5rem 0.7rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.15rem' }}>{row.metric}</div>
                <div>CV: {row.cv}</div>
                <div>{row.note}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
          You are testing a new feature and need to detect a 3% lift. Which metric should you choose as your primary outcome to minimize experiment runtime?
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Select the metric with the lowest coefficient of variation — the one that will detect a 3% lift with the fewest users — then click Check.
        </div>

        {mcqOptions.map(function(opt, i) {
          var sel = answer === i;
          var bg = 'var(--surface-2)'; var border = 'var(--border)'; var color = 'var(--text)';
          if (revealed) {
            if (opt.correct) { bg = 'var(--teal-bg)'; border = 'var(--teal-border)'; color = 'var(--teal)'; }
            else if (sel) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
          } else if (sel) { border = 'var(--accent-border)'; }
          return (
            <button key={i} onClick={function() { if (!revealed) setAnswer(i); }} disabled={revealed}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', marginBottom: '0.5rem', background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)', color: color, fontSize: '0.88rem', cursor: revealed ? 'default' : 'pointer', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          );
        })}

        {answer !== null && !revealed && (
          <button onClick={function() { setRevealed(true); }} style={{ marginTop: '0.5rem', padding: '0.5rem 1.1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Check
          </button>
        )}

        {revealed && (
          <div className="pal-reveal-in">
            <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>
              CTR is a binary metric (clicked vs. not clicked) — its variance is determined by p*(1-p), which is tightly bounded. Revenue per user has a long right tail driven by a small number of heavy spenders, making its SD several times its mean. To detect the same 3% lift, you might need 20x more users for revenue vs. CTR.
            </div>
            <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>Key Insight</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6 }}>
                When you cannot change the metric you care about, change what you measure in the experiment. If you must detect a revenue effect but revenue-per-user requires 6 months, find a proxy metric — a leading indicator with lower CV that predicts long-term revenue. CUPED can also reduce effective CV by 30-50%.
              </div>
            </div>
            <button onClick={onNext} className="pal-glow-pulse" style={{ marginTop: '1.5rem', padding: '0.65rem 1.6rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
              Complete module →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Module registry ──────────────────────────────────────────────────────────

const MODULE_COMPONENTS = {
  mf01: Module_MF01,
  mf02: Module_MF02,
  mf03: Module_MF03,
  mf04: Module_MF04,
  mf05: Module_MF05,
  mf06: Module_MF06,
  mf07: Module_MF07,
  mf08: Module_MF08,
  mf09: Module_MF09,
  mf10: Module_MF10,
  mf11: Module_MF11,
  mf12: Module_MF12,
  mf13: Module_MF13,
};

// ─── Runner shell ─────────────────────────────────────────────────────────────

export function MetricsFoundationsRunner({ moduleId, onBack, onNext, unlocked, onSelectModule }) {
  const module = metricsFoundationModules.find(m => m.id === moduleId);
  const [completed, setCompleted] = useState(() => !!getMetricsFoundationProgress(moduleId));
  const [note, setNote] = useState(() => getNotes('metrics-foundations', moduleId));

  useEffect(() => {
    setCompleted(!!getMetricsFoundationProgress(moduleId));
  }, [moduleId]);

  useEffect(() => { setNote(getNotes('metrics-foundations', moduleId)); }, [moduleId]);

  if (!module) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Module not found.</div>
  );

  const ModuleComponent = MODULE_COMPONENTS[moduleId];

  function handleNext() {
    saveMetricsFoundationProgress(moduleId);
    setCompleted(true);
    track('case_completed', { room: 'metrics-foundations', id: moduleId, title: module.title });
    if (onNext) onNext();
    else onBack();
  }

  const completedMap = getAllMetricsFoundationProgress();

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '1.5rem 1rem', width: '100%', boxSizing: 'border-box', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

      {/* ── Right nav sidebar ── */}
      <div className="pal-foundation-nav" style={{
        width: '190px', flexShrink: 0, order: 2,
        position: 'sticky', top: '1rem',
        maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '0.75rem 0.5rem',
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 0.4rem', marginBottom: '0.5rem' }}>
          Metrics Foundations
        </div>
        {metricsFoundationModules.map((m) => {
          const isCurrent = m.id === moduleId;
          const isDone = !!completedMap[m.id];
          const isStub = !!m.isStub;
          const isLocked = !m.isFree && !unlocked;
          const isBlocked = isStub || isLocked;
          return (
            <button
              key={m.id}
              onClick={() => !isBlocked && onSelectModule && onSelectModule(m.id)}
              style={{
                display: 'flex', alignItems: 'baseline', gap: '0.35rem',
                width: '100%', textAlign: 'left',
                padding: '0.28rem 0.4rem', borderRadius: '5px', border: 'none',
                background: isCurrent ? 'var(--green-bg)' : 'transparent',
                color: isCurrent ? 'var(--green)' : (isStub || isLocked) ? 'var(--text-muted)' : isDone ? 'var(--teal)' : 'var(--text)',
                fontSize: '0.75rem', lineHeight: 1.4,
                cursor: isBlocked ? 'default' : 'pointer',
                opacity: isStub ? 0.4 : isLocked ? 0.55 : 1,
                marginBottom: '0.1rem',
                fontWeight: isCurrent ? 700 : 400,
              }}
              title={isStub ? 'Coming soon' : isLocked ? 'Unlock to access' : m.title}
            >
              <span style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontSize: '0.68rem', color: isCurrent ? 'var(--green)' : 'var(--text-muted)', minWidth: '1.4rem' }}>{m.index}.</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isStub ? '' : isLocked ? '🔒 ' : isDone && !isCurrent ? '✓ ' : ''}{m.title}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main content column ── */}
      <div style={{ flex: 1, minWidth: 0, order: 1 }}>
      {/* Nav bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          ← All modules
        </button>
        <span style={{ color: 'var(--border)', fontSize: '0.8rem' }}>|</span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Module {module.index} of {metricsFoundationModules.length}</span>
        {completed && (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-border)' }}>✓ Complete</span>
        )}
      </div>

      {/* Module header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', margin: '0 0 0.3rem' }}>
          {module.index}. {module.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 0.75rem' }}>{module.subtitle}</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{module.estimatedMin} min</span>
          {module.tags.slice(0, 4).map(tag => (
            <span key={tag} style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Module content */}
      <HowTo skill={module.subtitle} steps={['Read the situation — understand the real-world context this concept solves', 'Interact with the demo — adjust sliders, make selections, observe what changes', 'Answer the question — test your understanding before moving on']} color="var(--green)" />
      {ModuleComponent ? (
        <ModuleComponent module={module} onNext={handleNext} />
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Module content coming soon.
        </div>
      )}

      {/* Playbook links */}
      {module.playbookLinks && module.playbookLinks.length > 0 && (
        <div style={{ marginTop: '1.5rem', padding: '0.9rem 1.1rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Further reading
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {module.playbookLinks.map(link => (
              <span key={link.id} style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'default' }}>
                {link.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          My Notes
        </div>
        <textarea
          value={note}
          onChange={e => { setNote(e.target.value); saveNote('metrics-foundations', moduleId, e.target.value); }}
          placeholder="Add your own notes, reminders, or follow-up questions..."
          rows={4}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '0.65rem 0.85rem',
            color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.55,
            resize: 'vertical', outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>
      </div>{/* end main content column */}
    </div>
  );
}
