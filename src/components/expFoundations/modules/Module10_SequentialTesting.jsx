import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox as SharedInsightBox, NextBtn as SharedNextBtn, MCQOption, CheckBtn as SharedCheckBtn, InstructionBox as SharedInstructionBox } from '../../shared/FoundationPrimitives.jsx';

function InsightBox(props) { return <SharedInsightBox color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)' {...props} />; }
function NextBtn(props) { return <SharedNextBtn color='var(--accent)' {...props} />; }
function CheckBtn(props) { return <SharedCheckBtn color='var(--accent)' {...props} />; }
function InstructionBox(props) { return <SharedInstructionBox color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)' {...props} />; }

function saveEFState(id, state) { try { localStorage.setItem('pal-ef-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadEFState(id) { try { var raw = localStorage.getItem('pal-ef-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleEF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

// ── Module EF10: Sequential Testing ─────────────────────────────────────────
export function Module_EF10({ onComplete }) {
  const _saved10 = useMemo(function() { return loadEFState('ef10'); }, []);
  const [answer, setAnswer] = useState(_saved10 ? _saved10.answer : null);
  const [revealed, setRevealed] = useState(_saved10 ? _saved10.revealed : false);

  useEffect(function() { saveEFState('ef10', { answer: answer, revealed: revealed }); }, [answer, revealed]);

  // Pre-computed p-value trajectory over 20 days:
  // dips below 0.05 on day 7 (index 6, p=0.031) and day 12 (index 11, p=0.042), ends at 0.09
  var naivePValues = [
    0.48, 0.39, 0.28, 0.21, 0.14, 0.08, 0.031, 0.062, 0.071, 0.058,
    0.049, 0.042, 0.055, 0.068, 0.074, 0.081, 0.085, 0.088, 0.091, 0.09,
  ];
  // Alpha-spending boundary: starts tight (~0.01), relaxes to 0.05 by day 20
  var seqBoundary = [
    0.008, 0.009, 0.011, 0.013, 0.016, 0.019, 0.022, 0.026, 0.029, 0.033,
    0.036, 0.039, 0.041, 0.043, 0.044, 0.045, 0.047, 0.048, 0.049, 0.05,
  ];

  var W = 280;
  var H = 140;
  var padL = 32; var padR = 14; var padT = 14; var padB = 28;
  var innerW = W - padL - padR;
  var innerH = H - padT - padB;
  var maxP = 0.6;

  function xOf(i) { return padL + (i / 19) * innerW; }
  function yOf(p) { return padT + innerH - (Math.min(p, maxP) / maxP) * innerH; }

  function makePath(vals) {
    return vals.map(function(v, i) { return (i === 0 ? 'M' : 'L') + ' ' + xOf(i) + ' ' + yOf(v); }).join(' ');
  }

  var naivePath = makePath(naivePValues);
  var seqBoundaryPath = makePath(seqBoundary);

  // First crossing below 0.05 for naive: day 7 = index 6
  var nc1x = xOf(6); var nc1y = yOf(naivePValues[6]);
  // Second crossing: day 12 = index 11
  var nc2x = xOf(11); var nc2y = yOf(naivePValues[11]);

  var mcqOptions = [
    { label: 'A. The p-value calculation itself becomes numerically less accurate as more data accumulates over the course of the test', correct: false },
    { label: 'B. Each look is a chance to find p < 0.05 by chance. Multiple looks compound this probability above the nominal alpha.', correct: true },
    { label: 'C. The null hypothesis effectively changes and gets redefined every single time an analyst peeks at the running data', correct: false },
    { label: "D. Alpha spending irreversibly reduces the statistical power available for the remainder of the experiment's runtime", correct: false },
  ];

  var METHODS = [
    { name: 'SPRT', desc: 'Sequential Probability Ratio Test — compares evidence for H1 vs H0 continuously; stops as soon as the evidence ratio crosses a pre-set threshold.' },
    { name: 'Group sequential', desc: 'Schedules a fixed number of interim looks up front and splits the alpha budget across them using O\'Brien-Fleming or Pocock boundaries.' },
    { name: 'Always-valid p-values', desc: 'Uses anytime-valid inference so the p-value is correct at any stopping point without inflating the false positive rate.' },
  ];

  return (
    <div>

      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Wednesday morning. Your experiment has been running for five days. You open the dashboard — p = 0.049. Statistically significant, just barely. The team wants to ship. Why wait until the planned two-week endpoint? You stop the experiment and ship.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          You\'ve just committed one of the most common statistical errors in experimentation. The issue starts with what alpha = 0.05 means. When you set that threshold before the experiment, you\'re making a commitment: if I look at the results exactly once, at exactly the planned endpoint, the false positive rate is 5%. That commitment has a hidden assumption: one look, at the predetermined time.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Every time you look at an experiment and ask "is it significant yet?" you\'re conducting an additional hypothesis test. If the answer is no, you continue. If the answer is yes, you stop and call it significant. But you\'ve created an implicit multiple testing problem. Each peek is an independent opportunity to see a spuriously significant result by chance. If you peek twenty times and stop when you first cross p = 0.05, the true false positive rate can exceed 20-30% — nowhere near 5%.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          This is the peeking problem. The threshold only controls error rates if the stopping rule is pre-specified. The moment you make the stopping decision contingent on observing a significant result, you\'ve broken the guarantee. Valid early stopping requires a method that accounts for the multiple looks explicitly — "spending" some of the total alpha budget at each interim analysis so that the total never exceeds alpha. The Pocock method uses the same stricter threshold at every look. The O\'Brien-Fleming method uses a very strict threshold early and relaxes it toward the end. Always-valid p-values go further: the test statistic is designed so that p &lt; 0.05 is valid regardless of when you stop, with no pre-specified stopping rule required.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>If you peek at an experiment every day for twenty days and stop as soon as p &lt; 0.05, what is the true false positive rate of this procedure? Is it 5%, higher, or lower — and why?</p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Compare naive peeking vs. sequential testing boundaries</div>

      {/* Side-by-side SVG charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem',
      }}>
        {/* Left: Naive peeking */}
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Naive peeking — stop whenever p &lt; 0.05
          </div>
          <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" style={{ display: 'block' }}>
            {/* Axes */}
            <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
            <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
            {/* Dashed p=0.05 threshold */}
            <line x1={padL} y1={yOf(0.05)} x2={W - padR} y2={yOf(0.05)}
              stroke="var(--red)" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
            {/* Axis labels */}
            <text x={padL - 3} y={yOf(0.05) + 4} textAnchor="end" fontSize="8" fill="var(--red)" opacity="0.9">0.05</text>
            <text x={padL - 3} y={yOf(0) + 4} textAnchor="end" fontSize="8" fill="var(--text-muted)">0</text>
            <text x={xOf(0)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">d1</text>
            <text x={xOf(9)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">d10</text>
            <text x={xOf(19)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">d20</text>
            {/* P-value trajectory */}
            <path d={naivePath} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
            {/* Crossing dots */}
            <circle cx={nc1x} cy={nc1y} r="4" fill="var(--red)" />
            <circle cx={nc2x} cy={nc2y} r="4" fill="var(--red)" opacity="0.6" />
            {/* Drop line + label at first crossing (day 7) */}
            <line x1={nc1x} y1={nc1y - 4} x2={nc1x} y2={padT + 4}
              stroke="var(--red)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
            <text x={nc1x + 3} y={padT + 12} fontSize="7" fill="var(--red)" fontWeight="700">Stops here</text>
            <text x={nc1x + 3} y={padT + 21} fontSize="7" fill="var(--red)">(false positive!)</text>
          </svg>
        </div>

        {/* Right: Sequential testing */}
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Sequential testing — alpha-spending boundary
          </div>
          <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" style={{ display: 'block' }}>
            {/* Axes */}
            <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
            <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
            {/* Dashed p=0.05 reference */}
            <line x1={padL} y1={yOf(0.05)} x2={W - padR} y2={yOf(0.05)}
              stroke="var(--red)" strokeWidth="1" strokeDasharray="4 3" opacity="0.45" />
            {/* Axis labels */}
            <text x={padL - 3} y={yOf(0.05) + 4} textAnchor="end" fontSize="8" fill="var(--red)" opacity="0.7">0.05</text>
            <text x={padL - 3} y={yOf(0) + 4} textAnchor="end" fontSize="8" fill="var(--text-muted)">0</text>
            <text x={xOf(0)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">d1</text>
            <text x={xOf(9)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">d10</text>
            <text x={xOf(19)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">d20</text>
            {/* Alpha-spending boundary (orange dashed curve) */}
            <path d={seqBoundaryPath} fill="none" stroke="var(--yellow)" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x={xOf(12)} y={yOf(seqBoundary[12]) - 5} fontSize="7" fill="var(--yellow)" textAnchor="middle">spending boundary</text>
            {/* P-value trajectory */}
            <path d={naivePath} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
            {/* Day 7: p crosses nominal 0.05 but NOT the tighter boundary — show held */}
            <circle cx={nc1x} cy={nc1y} r="4" fill="var(--teal)" />
            <text x={nc1x + 4} y={nc1y - 5} fontSize="7" fill="var(--teal)">boundary holds</text>
          </svg>
        </div>
      </div>

      {/* Stat comparison block */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(210px, 100%), 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem',
      }}>
        <div style={{
          background: 'var(--red-bg)', border: '1px solid var(--red-border)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
            Naive peeking
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--red)' }}>26%</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>true false positive rate</div>
        </div>
        <div style={{
          background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
            Sequential (Lan-DeMets)
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--teal)' }}>5%</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>true false positive rate</div>
        </div>
      </div>

      <InstructionBox>
        Study both charts. The left approach fires a false alarm at day 7 — the right stays within the
        promised alpha because the spending boundary is tight early and relaxes toward day 20.
      </InstructionBox>

      {/* MCQ */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1rem',
      }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.85rem' }}>
          Why does peeking inflate the false positive rate?
        </div>
        <InstructionBox>
          Select the answer that best explains the peeking problem, then click Check. Connect your answer
          to what you saw in the left chart — why did naive stopping fire a false alarm on day 7?
        </InstructionBox>
        {mcqOptions.map(function(opt, i) {
          return (
            <MCQOption
              key={i}
              label={opt.label}
              selected={answer === i}
              correct={opt.correct}
              revealed={revealed}
              onClick={function() { if (!revealed) setAnswer(i); }}
            />
          );
        })}
        {answer !== null && !revealed && <CheckBtn onClick={function() { setRevealed(true); }} />}
        {revealed && (
          <div style={{
            marginTop: '0.5rem', padding: '0.65rem 0.85rem',
            background: mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
          }}>
            Every time you check results you run another implicit test. Under 20 unplanned peeks the
            probability of ever seeing p &lt; 0.05 — even when the null is true — climbs to roughly 26%.
            The alpha budget is spent across many chances rather than saved for one pre-specified look.
          </div>
        )}
      </div>

      {revealed && (
        <div>
          {/* ── What you should have confirmed ── */}
          <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>The false positive rate rises dramatically with more peeks, even in a null experiment. Daily peeking over twenty days can produce false positive rates of 20-30% at a nominal alpha of 0.05. You will see p &lt; 0.05 on some intermediate day in many null experiments just by chance, and stopping there is indistinguishable from stopping at a genuine effect. The only fix is pre-committing to the stopping rule.</p>
          </div>

          {/* ── Analyst Move ── */}
          <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Never make a stop/continue decision based on checking whether the current result is significant, unless you\'re using a sequential testing method that was pre-specified in the experiment plan. If you\'re checking "is it significant yet?" and stopping when yes, you\'re peeking. The experiment plan should specify: endpoint date (or sample size) AND any interim analyses, including their thresholds.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> The correct response when a PM asks "can we check the results early?" is not "no" — it\'s "yes, if we pre-commit to the sequential testing method now." Interim analyses are valid; ad-hoc peeking is not. The difference is whether the stopping rule was specified before the data was observed.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> If you discover that past experiments at your organization were regularly stopped when they crossed p = 0.05 on a dashboard that updates daily, treat the historical results with significant skepticism. The effective false positive rate may be far above the stated alpha. High-stakes decisions based on those results should be re-evaluated or re-run with proper experiment design.</p>
            </div>
          </div>

          {/* 3 sequential methods card */}
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1rem',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
              3 Common Sequential Methods
            </div>
            {METHODS.map(function(m, i) {
              return (
                <div key={i} style={{
                  borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  paddingTop: i === 0 ? 0 : '0.55rem',
                  marginTop: i === 0 ? 0 : '0.55rem',
                  fontSize: '0.84rem', lineHeight: 1.55,
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{m.name}</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>{m.desc}</span>
                </div>
              );
            })}
          </div>

          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}
