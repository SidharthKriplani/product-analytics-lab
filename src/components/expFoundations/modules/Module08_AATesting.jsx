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

// ── Module EF08: A/A Testing ────────────────────────────────────────────────
export function Module_EF08({ onComplete }) {
  const _saved08 = useMemo(function() { return loadEFState('ef08'); }, []);
  const [answer, setAnswer] = useState(_saved08 ? _saved08.answer : null);
  const [revealed, setRevealed] = useState(_saved08 ? _saved08.revealed : false);

  useEffect(function() { saveEFState('ef08', { answer: answer, revealed: revealed }); }, [answer, revealed]);

  // Pre-generate 30 deterministic p-values — seeded formula, clamped 0.012–0.95.
  // Benign A/A: p sits comfortably above 0.05 nearly every day, dipping below
  // exactly once (~1 in 20) and only barely — random chance, not a real signal.
  const pValues = Array.from({ length: 30 }, function(_, i) {
    var raw = 0.45 + Math.sin(i * 0.9 + 0.7) * 0.28;
    if (i === 17) raw = 0.04; // the single shallow dip — just under threshold
    return Math.max(0.012, Math.min(0.95, raw));
  });

  // Day index where p first dips below 0.05 (the single benign crossing)
  var crossDay = pValues.findIndex(function(v) { return v < 0.05; });
  if (crossDay === -1) crossDay = 17;

  // SVG layout constants
  var svgW = 560;
  var svgH = 160;
  var padL = 38;
  var padR = 16;
  var padT = 12;
  var padB = 28;
  var chartW = svgW - padL - padR;
  var chartH = svgH - padT - padB;

  function xOf(i) { return padL + (i / 29) * chartW; }
  function yOf(v) { return padT + (1 - v) * chartH; }

  var polyPoints = pValues.map(function(v, i) { return xOf(i) + ',' + yOf(v); }).join(' ');
  var thresholdY = yOf(0.05);

  var options = [
    { label: 'A. Yes — p < 0.05 means the result is real. Stop and report it.', correct: false },
    { label: 'B. No — a single crossing in an A/A test is exactly what random chance produces. This is why you need a pre-specified stopping rule.', correct: true },
    { label: 'C. Yes, but only if the crossing lasts more than two consecutive days.', correct: false },
    { label: 'D. Maybe — it depends on whether the sample size was large enough.', correct: false },
  ];

  return (
    <div className="pal-page-enter">

      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          You\'re launching a new experimentation platform. You run your first A/B test. The result: p = 0.02, statistically significant, treatment wins. But you haven\'t changed anything — both arms see the exact same experience. You ran an A/A test, not an A/B test, and you got a significant result.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Don\'t panic yet. Under a correctly functioning experimentation platform, statistical tests should produce p-values that are uniformly distributed between 0 and 1 when there\'s no true effect. This is how p-values are defined. If the null hypothesis is true, p-values are uniform. One consequence: in any single A/A test, you expect to see p &lt; 0.05 roughly 5% of the time — by definition. A single significant A/A result is exactly what you expect to happen occasionally, not evidence of a bug.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The signal of a broken platform is not a single significant A/A test. It\'s a pattern across many A/A tests. A working platform produces p-values that are approximately uniform across [0, 1]. If you run fifty A/A tests and the p-values cluster near zero, the platform is inflating test statistics — almost certainly because variance is being underestimated. The false positive rate will be much higher than alpha in real experiments.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          What causes a broken p-value distribution? Randomization that isn\'t truly random. Variance underestimation from treating correlated observations as independent — the same problem as session-level randomization. Logging errors that affect one arm more than the other. Any of these produce inflated test statistics and a p-value distribution skewed toward zero.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>If a platform is correctly calibrated, what fraction of A/A tests should return p &lt; 0.05? If you run 100 A/A tests and observe 22 with p &lt; 0.05, is that evidence of a broken platform? Work through the reasoning before exploring.</p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Interpret the A/A test p-value trajectory</div>

      <InstructionBox>
        Study the chart below — it shows a 30-day A/A test where both groups receive identical treatment.
        Notice where the p-value line dips below the red 0.05 threshold and what happens afterward.
      </InstructionBox>

      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.25rem',
        overflowX: 'auto',
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          A/A Test — p-value over 30 days (both groups: identical treatment)
        </div>
        <svg viewBox={'0 0 ' + svgW + ' ' + svgH} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Axis lines */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="var(--border)" strokeWidth="1" />
          <line x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH} stroke="var(--border)" strokeWidth="1" />

          {/* Dashed threshold at p=0.05 */}
          <line
            x1={padL} y1={thresholdY}
            x2={padL + chartW} y2={thresholdY}
            stroke="var(--red)" strokeWidth="1.5" strokeDasharray="5,4"
          />
          <text x={padL + chartW + 2} y={thresholdY + 4} fontSize="9" fill="var(--red)" fontWeight="700">p=0.05</text>

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(function(v) {
            return (
              <text key={v} x={padL - 4} y={yOf(v) + 3} fontSize="8" fill="var(--text-muted)" textAnchor="end">
                {v.toFixed(2)}
              </text>
            );
          })}

          {/* X-axis labels */}
          <text x={xOf(0)} y={svgH - 6} fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 1</text>
          <text x={xOf(14)} y={svgH - 6} fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 15</text>
          <text x={xOf(29)} y={svgH - 6} fontSize="8" fill="var(--text-muted)" textAnchor="middle">Day 30</text>

          {/* P-value line */}
          <polyline
            points={polyPoints}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Circle marking first crossing below 0.05 */}
          {crossDay >= 0 && (
            <circle
              cx={xOf(crossDay)}
              cy={yOf(pValues[crossDay])}
              r="5"
              fill="var(--red)"
              stroke="var(--surface)"
              strokeWidth="1.5"
            />
          )}
          {crossDay >= 0 && (
            <text
              x={xOf(crossDay) + 7}
              y={yOf(pValues[crossDay]) - 6}
              fontSize="8"
              fill="var(--red)"
              fontWeight="700"
            >
              {'Day ' + (crossDay + 1) + ': p=' + pValues[crossDay].toFixed(3)}
            </text>
          )}
        </svg>
      </div>

      <InstructionBox>
        The experiment above is an A/A test — both groups see identical treatment. The p-value dipped below
        0.05 on day {crossDay + 1}. Should you stop and report a significant result?
      </InstructionBox>

      {options.map(function(opt, i) {
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
        <div className="pal-reveal-in">
          <div style={{
            marginTop: '0.5rem', padding: '0.65rem 0.85rem',
            background: options[answer] && options[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (options[answer] && options[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
          }}>
            Under the null hypothesis, p-values are uniformly distributed between 0 and 1. That means
            they cross 0.05 roughly once in every 20 observations just by chance — with no true effect.
            An A/A test that shows p &lt; 0.05 at some point during 30 days is expected, not alarming.
            Alarming is when the rate of crossings is far higher than chance predicts.
          </div>

          {/* ── What you should have confirmed ── */}
          <div className="pal-reveal-in" style={{ marginTop: '1rem', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>A working platform produces p &lt; 0.05 in about 5% of A/A tests. 22 out of 100 is 22% — four times the expected rate. That\'s strong evidence of a systematic problem, not noise. The histogram of p-values shows them clustered near zero for the broken platform and spread flat for the working one. One significant result is noise; a skewed distribution is a bug.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
            gap: '0.75rem',
            marginTop: '1.25rem',
          }}>
            <div style={{
              background: 'var(--red-bg)', border: '1px solid var(--red-border)',
              borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                Signs your A/A failed legitimately
              </div>
              {[
                'Crossing rate far exceeds 5% across many simulated runs',
                'One group is systematically larger than expected (SRM-like)',
                'p-values cluster near 0 rather than uniformly spread',
                'Different metrics all show the same directional bias',
              ].map(function(s, i) {
                return (
                  <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '0.3rem' }}>
                    {i + 1}. {s}
                  </div>
                );
              })}
            </div>
            <div style={{
              background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
              borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                Signs it is random chance
              </div>
              {[
                'One isolated crossing with p barely below 0.05',
                'p recovers above 0.05 quickly without intervention',
                'Group sizes match expected split within normal range',
                'Other metrics show no pattern — noise is unsystematic',
              ].map(function(s, i) {
                return (
                  <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '0.3rem' }}>
                    {i + 1}. {s}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Analyst Move ── */}
          <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginTop: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Before trusting any new experimentation platform — whether you built it or adopted it — run at least 20 A/A tests. Tally the false positive rate. Plot the p-value distribution. A platform you haven\'t validated is a platform whose results you cannot interpret. This is not optional diligence; it\'s the prerequisite for trusting every experiment that follows.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> If a significant A/A result appears, do not immediately conclude the platform is broken. Run more A/A tests and track the pattern. One significant result at alpha = 0.05 is expected roughly 5% of the time. A pattern of 20%+ false positives across many tests is the diagnostic, not a single data point.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> The most common root cause of inflated false positives in A/A tests is variance underestimation from correlated observations — specifically, treating session-level data as if it were user-level independent data. If your platform fails A/A calibration, check the randomization and variance estimation logic first before looking anywhere else.</p>
            </div>
          </div>

          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}
