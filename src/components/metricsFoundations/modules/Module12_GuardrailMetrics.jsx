import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

export function Module_MF12({ module, onNext }) {
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
    { label: 'A. So the team has enough runway to properly instrument the guardrail metric before the experiment even begins running its course.', correct: false },
    { label: 'B. Pre-commitment removes the ability to renegotiate the threshold after seeing results — it prevents p-hacking the guardrail.', correct: true },
    { label: 'C. Legal and compliance policy requires every single experiment metric to be formally pre-registered before the launch date arrives.', correct: false },
    { label: 'D. Post-hoc guardrails are actually more accurate, since they account for the real experiment data instead of a rough advance guess.', correct: false },
  ];

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>A guardrail metric is a metric you commit, in writing, to not letting fall below a threshold &mdash; and that breach, if it occurs, blocks the ship decision regardless of what the primary metric did. Not &quot;we&apos;ll monitor it.&quot; Not &quot;we&apos;ll check if it seems off.&quot; A hard block, pre-committed before the experiment launches.</p>
        <p style={prose}>The distinction between a guardrail and a secondary metric is commitment. A secondary metric is something you&apos;ll examine after results are in. A guardrail is a constraint you&apos;ve bound yourself to in advance. The moment you set the threshold after seeing the results, it stops being a guardrail and becomes post-hoc rationalization wearing a guardrail&apos;s clothes.</p>
        <p style={prose}>The natural instinct when an experiment shows a strong primary metric result is to check the secondary metrics and see if anything looks wrong. This feels responsible &mdash; you&apos;re being thorough. But here&apos;s where it breaks.</p>
        <p style={prose}>&quot;Check secondary metrics after results&quot; gives the team full latitude to interpret whatever they find. Support contacts are up 9%. &quot;That&apos;s probably noise,&quot; the PM says, looking at a +4% lift on the primary. &quot;Let&apos;s ship and monitor.&quot; This is human and predictable &mdash; a team that ran a multi-week experiment and got a positive primary result will find ways to explain away secondary metric movements. Not through malice, but through motivated reasoning.</p>
        <p style={prose}>The value of a guardrail comes entirely from pre-commitment. Before you see any results, you define: which metrics must not degrade, and by how much? A 10% rise in support contacts is acceptable; 15% is a breach. You write it down and sign off on it with the PM. Then the experiment runs. If a guardrail breaches, the conversation is not &quot;let&apos;s discuss whether this is noise.&quot; It&apos;s &quot;a metric we pre-committed to protecting has crossed its threshold. What do we do about that?&quot; That conversation is fundamentally different from the post-hoc one, because the pre-commitment removes the interpretive latitude that produces &quot;probably noise.&quot;</p>
        <p style={prose}>Why does pre-commitment work? Because the threshold was set without knowing which direction the primary metric would move, or by how much. There&apos;s no motivated reasoning in the threshold-setting because there&apos;s no result to rationalize yet.</p>
        <p style={prose}>The practical choice of which metrics to guardrail comes from the counter metric exercise: for your primary metric, what can be gamed or degraded without the primary metric knowing? Latency, support contacts, opt-out rates &mdash; these are the natural guardrail candidates for their respective primary metrics.</p>
        <p style={prose}>Let&apos;s take an example. A checkout team tests a simplified payment form. Pre-committed guardrails: payment error rate must not exceed baseline + 1pp; support contacts per 1000 checkouts must not exceed baseline + 15%; p95 checkout page load time must not exceed 3.2 seconds. Experiment runs three weeks. Results: checkout completion up 0.7pp, payment error rate at 2.3% (within guardrail), support contacts at 5.1/1000 (breach &mdash; 21% above baseline), load time at 2.9s (within guardrail). Decision: do not ship until the support contact spike is investigated. The pre-commitment means this conversation takes five minutes. There&apos;s nothing to negotiate.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>A team sets support contacts as a guardrail with a 15% tolerance threshold &mdash; but only after seeing the experiment results showed a 12% rise. Why does the timing of that threshold decision matter?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive ── */}
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
            </div>
          )}
        </div>
      )}

      {/* ── What you should have confirmed ── */}
      {revealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>A threshold set after seeing the result of 12% is not a guardrail &mdash; it&apos;s a rationalization that chose a threshold that conveniently clears the observed result. If you had set the threshold before the experiment, you might have chosen 10% (a breach) or 20% (not a breach) &mdash; those choices would have been made without knowing the result would be 12%. The timing of the commitment is everything.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {revealed && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Add a guardrail section to your experiment design document, completed before launch. For each proposed guardrail metric, write the baseline value, the acceptable tolerance, and the breach threshold. Get PM sign-off. This document exists before any results are generated &mdash; that&apos;s what makes it a guardrail.</p>
            <p style={prose}><strong>Two.</strong> When a guardrail breaches, do not allow the conversation to become &quot;is this breach meaningful?&quot; That question was answered when the threshold was set. The question at breach time is: what is the underlying cause, and can it be fixed while preserving the primary metric lift?</p>
            <p style={prose}><strong>Three.</strong> The common mistake is treating guardrail selection as an afterthought &mdash; adding it to the doc after the experiment is already designed. If guardrail selection happens after you know which metrics your experiment will affect, the selected guardrails are shaped by which metrics you&apos;re confident won&apos;t breach. The guardrails should be selected before the experiment even tells you which metrics it&apos;s likely to move.</p>
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
