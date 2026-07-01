import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const MF06_ITEMS_DEFAULT = [
  { id: 'rev',      label: 'Monthly revenue',                    correct: 'lagging',  reason: 'Confirms past performance. No signal about what drove it or what\'s coming.' },
  { id: 'd7ret',    label: 'D7 retention rate',                  correct: 'leading',  reason: 'Predicts LTV and long-term DAU trajectory. Fast-moving and sensitive.' },
  { id: 'sub',      label: 'Total subscriber count',             correct: 'lagging',  reason: 'Accumulates over time. Slow to reflect product changes.' },
  { id: 'onboard',  label: 'Onboarding completion rate',         correct: 'leading',  reason: 'Predicts new user activation and early retention. Moves in days.' },
  { id: 'nps',      label: 'Net Promoter Score (quarterly)',      correct: 'lagging',  reason: 'Survey-based, infrequent, and reflects cumulative experience — not current product state.' },
  { id: 'act',      label: 'Actions taken in first session',     correct: 'leading',  reason: 'Strong early signal of engagement depth and eventual retention.' },
];

export function Module_MF06({ module, onNext }) {
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

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>A lagging indicator confirms what already happened. Revenue last quarter confirms whether your product created economic value. Annual churn rate confirms whether customers stayed. Both are real, consequential, and nearly impossible to act on in time to change the outcome they describe.</p>
        <p style={prose}>A leading indicator moves ahead of the lagging outcome you care about. D7 retention moves before 90-day LTV is observable. Feature adoption in week one moves before long-term engagement settles. Leading indicators give you a signal about future health before the future has arrived.</p>
        <p style={prose}>The distinction matters because the business operates on a timeline mismatch: decisions need to be made now, but the most meaningful outcomes take months to observe. Experiments can&apos;t wait 90 days for LTV results. Quarterly planning can&apos;t wait for full-year revenue. The only way to make current decisions about future outcomes is to find signals that move earlier and track them instead.</p>
        <p style={prose}>The instinct when you need fast feedback is to pick the metric that moves soonest after your intervention &mdash; DAU, onboarding completion, revenue from a feature change. These are all technically faster than LTV. But here&apos;s where it breaks.</p>
        <p style={prose}>The leap from &quot;this metric moves fast&quot; to &quot;this metric predicts the outcome I care about&quot; is an assumption, not a finding. A product team that uses D7 retention as their leading indicator for LTV is betting that the historical relationship between D7 retention and LTV &mdash; measured on past cohorts &mdash; holds for new cohorts experiencing a different product. That link might be solid. It might not. If the new onboarding flow attracts a different user profile, the D7-to-LTV relationship on old cohorts may not apply.</p>
        <p style={prose}>What you actually need is a leading indicator whose predictive link to the lagging outcome has been empirically validated on historical data &mdash; not one that feels predictive. The validation is specific: run a cohort analysis on past users. Did users with high D7 retention also achieve high LTV? By how much? How tight is the relationship? If D7 retention explains 70% of LTV variance across historical cohorts, it&apos;s a strong proxy. If it explains 12%, it&apos;s a weak proxy that may mislead you.</p>
        <p style={prose}>Let&apos;s take an example. A subscription product wants to know whether a new onboarding flow will improve 12-month subscriber retention. They can&apos;t wait 12 months. They propose &quot;profile completion rate at day 1&quot; as the leading indicator. Before accepting it, they run a cohort analysis: full completers retained at 34%, partial completers at 31%, non-completers at 28%. A 6pp gap &mdash; modest, and the relationship weakens significantly for paid acquisition users. They check D7 app opens: r&sup2; = 0.58 vs 0.19 for profile completion. D7 opens is the stronger leading indicator.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>Two metrics both respond quickly after a product change &mdash; DAU and D7 retention. One is more useful as a leading indicator for long-term subscriber revenue. Which one, and why?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive ── */}
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
              {checked && (placements[item.id] === item.correct ? <Icon name='check' size={12} color='currentColor' /> : <Icon name='x' size={12} color='currentColor' />)}{checked ? ' ' : ''}
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

      {/* ── What you should have confirmed ── */}
      {checked && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>D7 retention is typically the stronger leading indicator for long-term subscriber revenue because it measures whether users returned &mdash; a behavioral signal of value found. DAU counts daily presence but can be inflated by users who open and immediately close the app. D7 retention&apos;s relationship with 90-day LTV is tighter and more consistent across segments than DAU&apos;s, making it a more reliable proxy for the experiment decision.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {checked && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Before using any metric as a leading indicator in an experiment, run the validation query: how strongly does this early metric predict the lagging outcome you care about, on historical cohort data? Report the relationship explicitly &mdash; &quot;D7 retention explains 58% of variance in 90-day LTV on cohorts from the last 18 months&quot; &mdash; so stakeholders understand the confidence level of the proxy.</p>
            <p style={prose}><strong>Two.</strong> When a product change targets a new user type (different acquisition channel, different feature set, different market), the historical proxy relationship may not transfer. Re-validate the leading-to-lagging link on the population the experiment will reach, not the historical population it was validated on.</p>
            <p style={prose}><strong>Three.</strong> The common mistake is accepting a leading indicator because it moves quickly, without checking whether it moves in the same direction as the lagging outcome you care about. Speed without accuracy is worse than waiting for the lagging metric &mdash; it&apos;s false confidence that accelerates decisions in the wrong direction.</p>
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
