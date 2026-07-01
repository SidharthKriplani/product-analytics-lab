import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const MF10_MCQ = {
  question: 'Your conversion rate has sat at exactly 4.0% for three months, so the checkout flow gets declared "stable." Then someone pulls absolute counts: orders are down 30% and sessions are down 30% over the same period. What is actually happening?',
  options: [
    'Nothing — a flat conversion rate proves the funnel is healthy and stable',
    'The business is shrinking: orders and sessions both collapsed together, so the rate held flat while the numerator and denominator both cratered',
    'Conversion improved, because holding the rate steady through a downturn is a win',
    'There must be a tracking bug — the rate cannot stay flat if the counts are falling',
  ],
  correct: 'The business is shrinking: orders and sessions both collapsed together, so the rate held flat while the numerator and denominator both cratered',
  explanation: 'A ratio is two numbers in a trench coat. If orders (numerator) and sessions (denominator) fall by the same proportion, the rate does not move at all — 2,800 / 70,000 is still 4.0%, exactly like 4,000 / 100,000. The flat rate masked a 30% collapse in the business. A stable rate is never, on its own, evidence of a stable system. Always pull the raw numerator and denominator counts before concluding nothing is happening.',
};

export function Module_MF10({ module, onNext }) {
  const saved10 = useMemo(function() { return loadMFState('mf10'); }, []);
  const [collapse, setCollapse] = useState(function() { return saved10 && saved10.collapse !== undefined ? saved10.collapse : 0; });
  const [selected, setSelected] = useState(function() { return saved10 ? saved10.selected : null; });
  const [revealed, setRevealed] = useState(function() { return saved10 ? saved10.revealed : false; });

  useEffect(function() {
    saveMFState('mf10', { collapse: collapse, selected: selected, revealed: revealed });
  }, [collapse, selected, revealed]);

  const BASE_SESSIONS = 100000;
  const BASE_ORDERS = 4000;
  const factor = 1 - collapse / 100;
  const sessions = Math.round(BASE_SESSIONS * factor);
  const orders = Math.round(BASE_ORDERS * factor);
  const rate = sessions > 0 ? (orders / sessions) * 100 : 0;
  const isCollapseWarning = collapse >= 20;

  function applyPreset() {
    setCollapse(30);
  }

  function handleCheck() {
    if (selected !== null) setRevealed(true);
  }

  const W10 = 420; const H10 = 150;
  const padL10 = 8; const padR10 = 8; const padT10 = 14; const padB10 = 22;
  const innerW10 = W10 - padL10 - padR10;
  const innerH10 = H10 - padT10 - padB10;
  const groupW = innerW10 / 2;
  const sessFull = innerH10;
  const sessCur = innerH10 * factor;
  const ordFull = innerH10 * (BASE_ORDERS / BASE_SESSIONS) * 6;
  const ordCur = ordFull * factor;

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>A stable ratio is usually read as stability in the underlying system. Conversion rate held at 4.2% this month &mdash; so checkout is working. Flat metrics get less attention than moving ones. They&apos;re assigned to the &quot;no news&quot; category.</p>
        <p style={prose}>But a ratio is a quotient. It can stay numerically identical while both the numerator and the denominator change dramatically &mdash; as long as they change in the same proportion. A flat ratio does not prove a flat system. It proves that numerator and denominator moved together. Whether that proportional movement represents health or crisis depends entirely on what the numerator and denominator actually are.</p>
        <p style={prose}>The natural reading of a stable rate is relief. The metric is not fluctuating, so whatever you changed or didn&apos;t change isn&apos;t hurting that part of the business. But here&apos;s where it breaks.</p>
        <p style={prose}>Absolute purchases are down 20% over three months. The product team discovers this during a revenue review. They immediately check checkout conversion rate. It&apos;s flat &mdash; steady at 4.2% across all three months. How is this possible?</p>
        <p style={prose}>Sessions fell by exactly 20% as well. Fewer users came to the site, and the same fraction of those who arrived converted. The rate held because the numerator (purchases) and denominator (sessions) collapsed in the same proportion. The ratio masked what was actually happening: a demand collapse that reduced both the top and bottom of the fraction equally. Checkout wasn&apos;t broken. The product wasn&apos;t the problem. But the rate&apos;s stability had implicitly communicated &quot;no problem here&quot; for three months while total purchases fell by a fifth.</p>
        <p style={prose}>This is the mirror image of the mix-shift problem. Here, the rate is flat while both components are collapsing. In both cases, the ratio is telling you something true but incomplete &mdash; and that incompleteness leads to a missed diagnosis.</p>
        <p style={prose}>Given this, a stable ratio must be checked against its absolute components before you conclude anything. The three questions are always: did the numerator move? Did the denominator move? Is the ratio stable because both held flat, or because both moved proportionally? The last question is the critical one. Proportional movement in the same direction &mdash; both falling 20% &mdash; is a signal worth investigating even if the ratio holds. The business is smaller. The ratio is stable; the business is not.</p>
        <p style={prose}>Let&apos;s take an example. An e-commerce product over three months: Jan &mdash; sessions 500,000, purchases 21,000, CVR 4.2%. Feb &mdash; sessions 440,000, purchases 18,480, CVR 4.2%. Mar &mdash; sessions 400,000, purchases 16,800, CVR 4.2%. CVR: perfectly flat. Purchases: down 20%. Sessions: down 20%. If you&apos;re only monitoring CVR, you see three months of stability. If you&apos;re also monitoring session volume and purchase volume as absolute counts, you see a business that&apos;s been shrinking for three months. The team that checks only CVR misses a signal for a full quarter.</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>If sessions fall 30% and purchases fall 30%, CVR is flat. If sessions fall 30% and purchases fall 15%, CVR actually rises. In which scenario is the business in worse shape? What does each rate signal vs. what it hides?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive ── */}
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Conversion rate vs. absolute volumes</div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Drag the slider to drop both orders and sessions by the same proportion. Watch the conversion rate stay pinned at 4.0% while the absolute counts collapse.
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
            Drop both orders &amp; sessions by: <strong style={{ color: 'var(--text)' }}>{collapse}%</strong>
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={collapse}
            onChange={function(e) { setCollapse(Number(e.target.value)); }}
            style={{ width: '100%', accentColor: 'var(--green)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>0% (baseline)</span><span>50% collapse</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--surface-2, var(--surface))', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Sessions (denom.)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>{sessions.toLocaleString()}</div>
          </div>
          <div style={{ background: 'var(--surface-2, var(--surface))', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Orders (numer.)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--purple)' }}>{orders.toLocaleString()}</div>
          </div>
          <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Conversion rate</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--green)' }}>{rate.toFixed(1)}%</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textAlign: 'center' }}>Absolute volumes — faded bars are the baseline</div>
          <svg viewBox={'0 0 ' + W10 + ' ' + H10} width="100%" style={{ display: 'block' }}>
            <line x1={padL10} y1={padT10 + innerH10} x2={W10 - padR10} y2={padT10 + innerH10} stroke="var(--border)" strokeWidth="1" />
            <rect x={padL10 + groupW * 0.30} y={padT10 + innerH10 - sessFull} width={groupW * 0.18} height={sessFull} rx="2" fill="var(--accent)" opacity="0.2" />
            <rect x={padL10 + groupW * 0.52} y={padT10 + innerH10 - sessCur} width={groupW * 0.18} height={sessCur} rx="2" fill="var(--accent)" />
            <text x={padL10 + groupW * 0.5} y={padT10 + innerH10 + 14} textAnchor="middle" fontSize="9" fill="var(--text-muted)">Sessions</text>
            <rect x={padL10 + groupW + groupW * 0.30} y={padT10 + innerH10 - ordFull} width={groupW * 0.18} height={ordFull} rx="2" fill="var(--purple)" opacity="0.2" />
            <rect x={padL10 + groupW + groupW * 0.52} y={padT10 + innerH10 - ordCur} width={groupW * 0.18} height={ordCur} rx="2" fill="var(--purple)" />
            <text x={padL10 + groupW + groupW * 0.5} y={padT10 + innerH10 + 14} textAnchor="middle" fontSize="9" fill="var(--text-muted)">Orders</text>
          </svg>
          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: isCollapseWarning ? 'var(--yellow)' : 'var(--text-muted)', marginTop: '0.3rem', fontWeight: isCollapseWarning ? 700 : 500 }}>
            Both bars shrink, but the rate above stays {rate.toFixed(1)}%.
          </div>
        </div>

        {isCollapseWarning && (
          <div className="pal-reveal-in" style={{ marginTop: '0.85rem', fontSize: '0.83rem', color: 'var(--yellow)', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.9rem', lineHeight: 1.55 }}>
            The rate is flat at 4.0% — but sessions and orders are each down {collapse}%. A flat rate is hiding a {collapse}% collapse in the business.
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
          >Collapse both 30% (preset)</button>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.6rem' }}>Sessions 100k&rarr;70k, orders 4k&rarr;2.8k. Rate stays 4.0%.</span>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>{MF10_MCQ.question}</div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Select the answer that explains how a conversion rate can stay perfectly flat while the underlying business collapses, then click Check answer.
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

      {/* ── What you should have confirmed ── */}
      {revealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>In the first scenario (both fall 30%), the business is worse &mdash; fewer purchases despite a stable rate &mdash; but the rate gives no warning. In the second scenario (sessions fall 30%, purchases fall only 15%), CVR rises, which looks like a win &mdash; but you still have fewer purchases in absolute terms. The interactive makes visceral what the algebra proves: the ratio and the absolute counts tell different stories, and you need both to understand what&apos;s happening.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {revealed && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> For every ratio metric in your dashboard, maintain the absolute numerator and denominator as separate tracked metrics alongside it. Not buried in a decomposition view &mdash; present at the same level as the rate. A weekly review that shows CVR, sessions, and purchases together takes the same time to read and prevents an entire class of missed signals.</p>
            <p style={prose}><strong>Two.</strong> When a ratio has been flat for a sustained period (two or more weeks), explicitly check whether both components moved proportionally. Sustained flatness is more suspicious than short-term flatness, because real systems rarely stay perfectly proportional for long without something artificial holding the relationship in place.</p>
            <p style={prose}><strong>Three.</strong> The common mistake in experiment analysis is checking only the ratio (conversion rate) as the primary metric without verifying that session volume between treatment and control arms is balanced. If treatment changed who entered the funnel &mdash; reducing sessions in one arm &mdash; a stable CVR comparison is comparing different populations, not the same population at different conversion rates. Always check session volume between arms alongside every CVR comparison.</p>
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
