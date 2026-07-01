import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

export function Module_MF11({ module, onNext }) {
  const saved11 = useMemo(function() { return loadMFState('mf11'); }, []);
  const [wA, setWA] = useState(function() { return saved11 && saved11.wA !== undefined ? saved11.wA : 40; });
  const [wB, setWB] = useState(function() { return saved11 && saved11.wB !== undefined ? saved11.wB : 35; });
  const [wC, setWC] = useState(function() { return saved11 && saved11.wC !== undefined ? saved11.wC : 25; });
  const [answer, setAnswer] = useState(function() { return saved11 && saved11.answer !== undefined ? saved11.answer : null; });
  const [revealed, setRevealed] = useState(function() { return saved11 ? saved11.revealed : false; });

  useEffect(function() {
    saveMFState('mf11', { wA: wA, wB: wB, wC: wC, answer: answer, revealed: revealed });
  }, [wA, wB, wC, answer, revealed]);

  var valA = 72; var valB = 58; var valC = 81;

  var totalW = wA + wB + wC;
  var composite = totalW > 0 ? ((wA * valA + wB * valB + wC * valC) / (totalW * 100)) * 100 : 0;
  var compositeDisplay = Math.round(composite * 10) / 10;

  var mcqOptions = [
    { label: 'A. Composite metrics introduce double-counting — if components are correlated, the composite overstates their combined signal.', correct: false },
    { label: 'B. A component metric can quietly degrade while the composite stays flat — the composite masks individual signal.', correct: true },
    { label: 'C. Teams optimizing for the composite learn to move the highest-weight component and neglect the rest, gaming the OEC without real improvement.', correct: false },
    { label: 'D. They require more statistical samples than individual metrics.', correct: false },
  ];

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>A composite metric combines multiple individual signals into a single score using a weighting scheme. Instead of tracking session frequency, content depth, and social sharing separately &mdash; each of which might point in a different direction this week &mdash; you combine them into one engagement index. The index moves when the weighted combination moves, and you track one number instead of three.</p>
        <p style={prose}>The appeal is real. When teams track twenty individual metrics and two of them conflict, every review meeting becomes a debate about which metric to trust. A composite collapses the debate by encoding the tradeoff in advance: depth is worth 40% of the score, frequency is worth 40%, sharing is worth 20%. The weighting reflects the team&apos;s judgment about relative importance.</p>
        <p style={prose}>The natural instinct when leadership asks for &quot;one number to track this quarter&quot; is to find the most relevant individual metric and report that. But here&apos;s where it breaks.</p>
        <p style={prose}>The product simultaneously cares about multiple things that can point in opposite directions: engagement frequency, quality of engagement, social reach, content diversity. No single individual metric captures all of them. Every single metric is a one-dimensional view of a multi-dimensional product. Multi-dimensional products have tradeoffs that single metrics can&apos;t represent.</p>
        <p style={prose}>What you actually need is a structure that encodes the tradeoff &mdash; explicitly and upfront, before anyone sees the numbers. That structure is the composite. The weights encode the team&apos;s relative valuation of each component. And crucially, the weights are a statement about strategy: if depth is worth twice as much as frequency, the composite reflects that value judgment every time it moves.</p>
        <p style={prose}>But the composite creates its own trap. When a composite moves favorably, it can mask an unfavorable movement in one of its components &mdash; particularly if that component has a small weight. An engagement index weighted at frequency 40%, depth 40%, sharing 20% can rise if frequency and depth improve strongly while sharing collapses. The index reports progress. Sharing &mdash; the social growth mechanism &mdash; is quietly failing.</p>
        <p style={prose}>The defense against this trap is twofold. First: decompose every composite win before shipping the associated change. A composite rise built entirely on one component while another collapsed is a tradeoff, not a win &mdash; and the team should explicitly approve that tradeoff. Second: floor rules. A component that falls below a threshold violates the composite&apos;s validity regardless of the weighted sum.</p>
        <p style={prose}>Let&apos;s take an example. A content platform&apos;s engagement index rises 4% in Q3. Leadership celebrates. A PM digs into components: Session frequency: +8%. Depth score: +3%. Sharing rate: -18% (collapse). The math: 0.4 &times; 8 + 0.4 &times; 3 + 0.2 &times; (-18) = 3.2 + 1.2 - 3.6 = 0.8 &rarr; roughly +4% index. The celebration was premature. Sharing &mdash; a mechanism the company depends on for organic growth &mdash; fell by nearly a fifth. The composite reported a win that is actually a tradeoff that was never explicitly approved.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>If a composite metric rises 5% but one component falls 30%, under what weighting conditions is the composite rise still valid as a positive signal? Under what conditions is it misleading?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive ── */}
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
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {revealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>The composite rise is valid as a signal when the declining component was explicitly weighted low because the team judged it relatively unimportant &mdash; and the decline is within a range the team pre-committed to accepting. It becomes misleading when the declining component matters to the business outcome in ways the weighting didn&apos;t capture. The threshold flags force the question before the composite is read as a success.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {revealed && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Before using a composite metric in a ship decision, decompose it into components and verify that no single component collapsed. A composite rise built on the strong performance of two components masking the collapse of a third is a tradeoff that needs to be named and approved, not a clean win.</p>
            <p style={prose}><strong>Two.</strong> When weights are set for a composite, document the strategic rationale explicitly. That documentation makes it possible to revisit the weights when strategy changes &mdash; and it makes the tradeoff in any specific composite movement interpretable against the stated rationale.</p>
            <p style={prose}><strong>Three.</strong> The common mistake is using a composite as a substitute for monitoring individual components. The composite is an alert aggregator, not a signal replacer. Track components individually and use the composite as a summary. If the composite rises while a component you care about declines, the component reading overrides the composite&apos;s headline.</p>
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
