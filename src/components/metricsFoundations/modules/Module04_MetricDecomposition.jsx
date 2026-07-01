import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const MF04_OPTIONS_DEFAULT = ['New users', 'Retained users', 'Resurrected users', 'Churned users', 'Power users', 'Organic users'];
const DECOMP_CORRECT = ['New users', 'Retained users', 'Resurrected users'];

export function Module_MF04({ module, onNext }) {
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

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>Metric decomposition is the practice of expressing a top-line metric as a mathematical identity &mdash; an equation that&apos;s always true by construction &mdash; and then measuring each term separately. The identity doesn&apos;t explain causation. It maps out the structural arithmetic: if the top-line number changed, it must have changed because at least one of the terms changed. The decomposition turns one diagnostic question into several more specific ones, each with a different owner and a different fix.</p>
        <p style={prose}>The value of decomposition is that it eliminates hypotheses. Before you decompose, anything could have caused the drop. After you decompose, you know which lever moved &mdash; and usually which team owns that lever.</p>
        <p style={prose}>The natural first response to a metric drop is to hypothesize. DAU is down 15%? Could be a bug. Could be seasonality. Could be a competitor launch. Could be a product regression. The meeting fills up with theories, everyone defends their team&apos;s innocence, and an hour passes without narrowing anything down. But here&apos;s where it breaks.</p>
        <p style={prose}>The hypothesis session has no forcing function. It ends when the meeting ends, not when the question is answered. If you have twelve hypotheses and no framework for eliminating them, you either chase all twelve in parallel (expensive) or pick the most compelling-sounding one (arbitrary).</p>
        <p style={prose}>What you actually need is a tautological identity. DAU is the clearest example. Every user who appears in today&apos;s DAU is in exactly one of three states: they&apos;re new (first time ever active), retained (active yesterday and today), or resurrected (inactive for some period and active today). These three categories are mutually exclusive and exhaustive: DAU = New + Retained + Resurrected. If DAU fell 15%, one or more of those three components fell. Measure each one and the culprit is immediately visible.</p>
        <p style={prose}>The identity approach works at any level of your metric hierarchy. Revenue = sessions &times; revenue per session. Revenue per session = purchase rate &times; average order value. Average order value = units per order &times; price per unit. You can decompose as deep as you need to, and at each level, the decomposition tells you where the signal is coming from.</p>
        <p style={prose}>Let&apos;s take an example. An e-commerce app&apos;s DAU drops from 200,000 to 170,000. The growth team suspects acquisition slowdown. The product team suspects retention regression. You decompose: New users &mdash; 12,000 &rarr; 11,500 (down 4%). Retained users &mdash; 165,000 &rarr; 128,000 (down 22%). Resurrected users &mdash; 23,000 &rarr; 30,500 (up 33%). Acquisition is essentially flat. Resurrection is actually up. The entire drop is in retention. The investigation now goes to what changed in the product in the last few days that could affect same-day re-engagement. The decomposition took ten minutes. It would have taken a week to eliminate the acquisition hypothesis by analyzing campaign spend.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>If DAU fell but New, Retained, and Resurrected users all declined proportionally, what does that tell you vs. if only Retained declined while New and Resurrected held flat?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive ── */}
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
                {checked && isCorrect ? <Icon name='check' size={12} color='currentColor' /> : checked && sel ? <Icon name='x' size={12} color='currentColor' /> : null}{checked && (isCorrect || sel) ? ' ' : ''}{opt}
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
              ? <><Icon name='check' size={13} color='var(--green)' /> Correct. DAU = New + Retained + Resurrected. A DAU drop is a very different problem depending on which component fell: acquisition issue vs retention problem vs re-engagement gap.</>
              : <><Icon name='x' size={13} color='var(--red)' /> The three components are New, Retained, and Resurrected users. &quot;Churned&quot; is the subtraction that gets you from yesterday&apos;s DAU to tomorrow&apos;s &mdash; it&apos;s a driver of change, not a component of today&apos;s DAU.</>}
          </div>
        )}
      </div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>LTV Decomposition</div>
        <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          LTV = ARPU &times; Avg lifespan = (Revenue per transaction &times; Transactions per month) &times; (1 / Churn rate)<br />
          This decomposition tells you whether an LTV improvement requires raising price, increasing purchase frequency, or reducing churn &mdash; three different product and pricing strategies.
        </div>
      </div>

      {/* ── What you should have confirmed ── */}
      {checked && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>Proportional decline across all three components suggests a broad-reach event affecting the entire active population equally &mdash; a platform outage, a seasonal effect, a measurement failure. A selective drop in only Retained users, while New and Resurrected hold, points specifically at the product experience for existing engaged users &mdash; more likely a regression in a feature that returning users depend on.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {checked && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Before any diagnostic discussion of a metric drop, produce the decomposition. Put it in the first slide, not the last. The decomposition reframes every subsequent discussion: instead of &quot;what could have caused this?&quot; the question becomes &quot;which component moved, and why?&quot; The first question is open-ended; the second is specific and answerable.</p>
            <p style={prose}><strong>Two.</strong> Match the decomposition depth to the decision being made. For a Monday morning alert, the top-level identity (New + Retained + Resurrected) is enough to route the investigation to the right team. For a deep-dive, drill to the next level. Avoid over-decomposing in the initial review.</p>
            <p style={prose}><strong>Three.</strong> The common mistake is decomposing after the diagnosis is already committed. A team that spends three days building a hypothesis about acquisition before running the decomposition will often find the decomposition contradicts their hypothesis &mdash; and now they&apos;ve wasted three days and also have to reverse a narrative that leadership already heard. Always decompose first.</p>
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
