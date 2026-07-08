import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

var NS_CANDIDATES = [
  {
    id: 'dau', label: 'DAU (daily active users)',
    correct: { valueDelivery: false, leadingIndicator: false, actionable: false },
    explanations: {
      valueDelivery: 'DAU measures presence, not value. A user who opens the app and immediately closes it counts as active.',
      leadingIndicator: 'DAU is a coincident indicator — it tells you what happened today, not what will happen next quarter. It moves after value is delivered, not before.',
      actionable: 'DAU is affected by marketing, seasonality, and competitor launches. No single team owns it, and a team building a messaging feature cannot reason about how their work moves DAU.',
    },
  },
  {
    id: 'messages', label: 'Messages sent per user per day',
    correct: { valueDelivery: true, leadingIndicator: true, actionable: true },
    explanations: {
      valueDelivery: 'Sending a message is the core action that delivers value in a workplace messaging tool — it means a user communicated with a colleague, which is the product\'s reason for existing.',
      leadingIndicator: 'Message volume today predicts retention and expansion next month. Teams that send more messages are more likely to upgrade and less likely to churn.',
      actionable: 'The onboarding team can improve first-message time. The notifications team can improve re-engagement. The channels team can improve group messaging. Every team has a lever.',
    },
  },
  {
    id: 'teams', label: 'Teams with 3+ weekly active members',
    correct: { valueDelivery: true, leadingIndicator: true, actionable: false },
    explanations: {
      valueDelivery: 'A team with 3+ active members is receiving collaborative value — the product is working as intended for a group.',
      leadingIndicator: 'Team-level activation predicts account expansion and contract renewal strongly.',
      actionable: 'This metric is hard for individual feature teams to move directly. The onboarding team can influence it, but the search team or the emoji-reactions team cannot reason about how their work moves "teams with 3+ members."',
    },
  },
  {
    id: 'revenue', label: 'Revenue per seat',
    correct: { valueDelivery: false, leadingIndicator: false, actionable: false },
    explanations: {
      valueDelivery: 'Revenue measures what the company extracts, not what users receive. A price increase raises revenue per seat without delivering any additional value.',
      leadingIndicator: 'Revenue is a lagging indicator — it reflects contract renewals from value delivered months ago. It cannot tell you if the product is getting better this quarter.',
      actionable: 'Product teams cannot directly move revenue per seat. Pricing, sales, and contract terms drive it. An engineer building better threading cannot reason about revenue impact.',
    },
  },
];

var NS_CRITERIA = [
  { id: 'valueDelivery', label: 'Reflects value delivery', desc: 'Measures what users get, not what the company extracts' },
  { id: 'leadingIndicator', label: 'Leading indicator', desc: 'Predicts future retention, growth, or revenue' },
  { id: 'actionable', label: 'Actionable by teams', desc: 'Individual teams can reason about how their work moves it' },
];

export function Module_MF07({ module, onNext }) {
  var saved07 = useMemo(function() { return loadMFState('mf07'); }, []);
  var [evals, setEvals] = useState(function() {
    if (saved07 && saved07.evals) return saved07.evals;
    var init = {};
    NS_CANDIDATES.forEach(function(c) {
      init[c.id] = { valueDelivery: null, leadingIndicator: null, actionable: null };
    });
    return init;
  });
  var [checked, setChecked] = useState(function() { return saved07 ? saved07.checked : false; });
  var [selected, setSelected] = useState(function() { return saved07 ? saved07.selected : null; });
  var [answered, setAnswered] = useState(function() { return saved07 ? saved07.answered : false; });

  useEffect(function() {
    saveMFState('mf07', { evals: evals, checked: checked, selected: selected, answered: answered });
  }, [evals, checked, selected, answered]);

  function handleToggle(candidateId, criterionId) {
    if (checked) return;
    var updated = JSON.parse(JSON.stringify(evals));
    var current = updated[candidateId][criterionId];
    if (current === null) updated[candidateId][criterionId] = true;
    else if (current === true) updated[candidateId][criterionId] = false;
    else updated[candidateId][criterionId] = null;
    setEvals(updated);
  }

  var allRated = NS_CANDIDATES.every(function(c) {
    return NS_CRITERIA.every(function(cr) {
      return evals[c.id][cr.id] !== null;
    });
  });

  var scoreResult = null;
  if (checked) {
    var total = 0;
    var correct = 0;
    NS_CANDIDATES.forEach(function(c) {
      NS_CRITERIA.forEach(function(cr) {
        total += 1;
        if (evals[c.id][cr.id] === c.correct[cr.id]) correct += 1;
      });
    });
    scoreResult = { correct: correct, total: total };
  }

  var Q = {
    question: 'A food delivery app is choosing its North Star. Which candidate best captures value delivered to users?',
    options: [
      { id: 'a', text: 'Gross merchandise value (GMV) — the total dollar value of all orders placed this week.' },
      { id: 'b', text: 'Orders delivered on time per active user per week — reliable delivery of core value.' },
      { id: 'c', text: 'Monthly active users — the total size of the engaged and returning user base.' },
      { id: 'd', text: 'Average order value — the average basket size and per-order pricing efficiency.' },
    ],
    correct: 'b',
    explanation: 'GMV and average order value measure what the company extracts. MAU measures presence but not depth. "Orders delivered on time per active user per week" captures the core value: the user wanted food delivered reliably, and they got it. The "on time" qualifier prevents gaming via delayed orders, and "per user" normalizes for growth. It is leading (predicts retention), actionable (logistics, restaurant ops, and product teams all have levers), and hard to inflate without genuinely improving the delivery experience.',
  };

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>A North Star metric is a single number that represents the core value your product delivers to users. Not revenue &mdash; revenue measures what the company extracts, not what users receive. Not DAU &mdash; activity measures presence, not value. The North Star must move when users genuinely get more out of the product, and must stay flat or fall when they don&apos;t, regardless of what the company is earning or how many people showed up.</p>
        <p style={prose}>This definition is more constrained than it sounds. Most things companies measure are either outputs (what we produced) or extractions (what we earned). The North Star must be a value signal &mdash; something that tells you whether users&apos; lives or workflows are genuinely better because of the product.</p>
        <p style={prose}>The instinct when someone asks &quot;what&apos;s your North Star?&quot; is to reach for the metric that leadership already tracks: revenue, DAU. Both move in response to product and business changes, and both feel important. But here&apos;s where it breaks.</p>
        <p style={prose}>Revenue is an extraction metric. A product that raises prices extracts more revenue from the same users providing the same value. A product that captures users who have no alternatives extracts revenue without delivering value proportional to that extraction. Optimizing for revenue as your North Star creates incentives that diverge from user value.</p>
        <p style={prose}>DAU has a different problem: it measures presence, not value. A user who opens your app every day and closes it in frustration counts the same as a user who opens it and accomplishes something meaningful. A product can grow DAU through compulsive mechanics &mdash; notifications, streaks, intermittent rewards &mdash; that make the number look healthy while the underlying experience degrades.</p>
        <p style={prose}>What you actually need is a metric that would be hard to inflate without actually delivering more value to users. The test has two parts. First: if users got more value from your product this week than last week, does this metric go up? Second: can this metric go up without users getting more value? The hardest part of North Star design is the second test. Almost every metric passes the first.</p>
        <p style={prose}>The practical approach: identify what specific user behavior indicates value received &mdash; not just engagement, but value. For a streaming product, &quot;hours of content completed&quot; indicates value more reliably than &quot;hours of content started&quot; &mdash; completion suggests the content was worth finishing. For a B2B product, &quot;projects completed&quot; indicates value more reliably than &quot;sessions.&quot; For a messaging product, &quot;messages sent&quot; correlates with value delivered because the product&apos;s purpose is communication.</p>
        <p style={prose}>Let&apos;s take an example. A financial planning product debates three candidates. &quot;Monthly active users&quot; &mdash; fails the inflation test; marketing spend inflates it without product improvement. &quot;Revenue per user&quot; &mdash; extraction metric; raising prices moves it without any product improvement. &quot;Financial decisions made per month&quot; &mdash; the product&apos;s purpose is to help users make better financial decisions; harder to inflate without users actually using the core product; responds to product improvements within weeks. The third option passes both tests more robustly.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>&quot;Messages sent per day&quot; is WhatsApp&apos;s commonly cited North Star. Run it through both tests: does it go up when users get more value from communication? Can it go up without users getting more value?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive: North Star Evaluator ── */}
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>North Star Evaluator — Slack</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 1rem' }}>
          Four candidate North Stars for Slack are listed below. For each, decide whether it passes or fails each of the three criteria. Click to toggle: green = yes, red = no. Evaluate all candidates, then check your analysis.
        </p>

        {/* Criteria headers + candidate rows — horizontally scrollable on narrow screens so the fixed-width toggle columns never clip */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '380px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, 70px)', gap: '0.25rem', marginBottom: '0.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>Candidate</div>
              {NS_CRITERIA.map(function(cr) {
                return <div key={cr.id} style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{cr.label}</div>;
              })}
            </div>

            {NS_CANDIDATES.map(function(cand) {
              return (
                <div key={cand.id} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, 70px)', gap: '0.25rem', marginBottom: '0.35rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{cand.label}</div>
                  {NS_CRITERIA.map(function(cr) {
                    var val = evals[cand.id][cr.id];
                    var bg = val === null ? 'var(--surface-2)' : val ? 'var(--green-bg)' : 'var(--red-bg)';
                    var borderColor = val === null ? 'var(--border)' : val ? 'var(--green-border)' : 'var(--red-border)';
                    var icon = val === null ? '–' : val ? <Icon name='check' size={14} color='currentColor' /> : <Icon name='x' size={14} color='currentColor' />;
                    var iconColor = val === null ? 'var(--text-muted)' : val ? 'var(--green)' : 'var(--red)';

                    if (checked) {
                      var isCorrect = val === cand.correct[cr.id];
                      borderColor = isCorrect ? 'var(--green-border)' : 'var(--red-border)';
                      bg = isCorrect ? 'var(--green-bg)' : 'var(--red-bg)';
                    }

                    return (
                      <button key={cr.id} onClick={function() { handleToggle(cand.id, cr.id); }} style={{ background: bg, border: '1.5px solid ' + borderColor, borderRadius: 'var(--radius-sm)', padding: '0.3rem', minHeight: '40px', minWidth: '40px', cursor: checked ? 'default' : 'pointer', fontSize: '0.85rem', fontWeight: 700, color: iconColor, textAlign: 'center', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Check button */}
        {allRated && !checked && (
          <button onClick={function() { setChecked(true); }} className='pal-glow-pulse' style={{ marginTop: '0.75rem', padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--green)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Check My Analysis</button>
        )}

        {/* Score + explanations */}
        {checked && scoreResult && (
          <div className='pal-reveal-in' style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: scoreResult.correct >= 10 ? 'var(--green)' : 'var(--yellow)', marginBottom: '0.75rem' }}>
              {scoreResult.correct} / {scoreResult.total} correct
            </div>
            {NS_CANDIDATES.map(function(cand) {
              var hasError = NS_CRITERIA.some(function(cr) { return evals[cand.id][cr.id] !== cand.correct[cr.id]; });
              if (!hasError) return null;
              return (
                <div key={cand.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', marginBottom: '0.4rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text)', marginBottom: '0.3rem' }}>{cand.label}</div>
                  {NS_CRITERIA.map(function(cr) {
                    if (evals[cand.id][cr.id] === cand.correct[cr.id]) return null;
                    return (
                      <div key={cr.id} style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.2rem' }}>
                        <strong style={{ color: cand.correct[cr.id] ? 'var(--green)' : 'var(--red)' }}>{cr.label}: {cand.correct[cr.id] ? 'Yes' : 'No'}</strong> — {cand.explanations[cr.id]}
                      </div>
                    );
                  })}
                </div>
              );
            })}
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
      {(checked || answered) && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>&quot;Messages sent per day&quot; passes the first test well &mdash; when users communicate more meaningfully, they send more messages. The second test is tighter: at the human-behavior level, it&apos;s hard to inflate without real communication happening, because sending a message requires a user to have something they want to say. The metric is more resistant to inflation than DAU or revenue. It also has a natural ceiling effect: users only send messages when they have something to communicate, not just when the app is open.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {(checked || answered) && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> When your team is choosing or revisiting a North Star, force the two-test sequence explicitly. Write down a candidate metric, then answer both questions in writing before evaluating others. The second test &mdash; can this go up without real value delivery? &mdash; is the one that gets skipped, and it&apos;s the one that matters most.</p>
            <p style={prose}><strong>Two.</strong> Push back when leadership proposes revenue or DAU as the North Star. The reframe isn&apos;t adversarial: &quot;Revenue is essential and belongs in the L1 layer &mdash; it tells us whether our value is translating into business outcomes. But what metric tells us whether users are getting more from the product independent of what we&apos;re extracting?&quot; That question, answered well, surfaces the real North Star.</p>
            <p style={prose}><strong>Three.</strong> North Stars fail in experiments because they&apos;re too stable week-over-week to detect short-term treatment effects. Don&apos;t try to use the North Star as a primary experiment metric &mdash; that&apos;s what L1 and L2 metrics are for. Use it in long-run holdouts or cohort validation: do cohorts with higher early L1 performance also show higher North Star movement at 6 months?</p>
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
