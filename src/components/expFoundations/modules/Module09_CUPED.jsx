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

// ── Module EF09: CUPED / Variance Reduction ─────────────────────────────────
export function Module_EF09({ onComplete }) {
  const _saved09 = useMemo(function() { return loadEFState('ef09'); }, []);
  const [cupedOn, setCupedOn] = useState(_saved09 ? _saved09.cupedOn : false);
  const [answer, setAnswer] = useState(_saved09 ? _saved09.answer : null);
  const [revealed, setRevealed] = useState(_saved09 ? _saved09.revealed : false);
  const [showExplainer, setShowExplainer] = useState(_saved09 ? _saved09.showExplainer : false);

  useEffect(function() { saveEFState('ef09', { cupedOn: cupedOn, answer: answer, revealed: revealed, showExplainer: showExplainer }); }, [cupedOn, answer, revealed, showExplainer]);

  // Deterministic scatter points: 30 users, pre vs post metric
  var N = 30;
  var points = Array.from({ length: N }, function(_, i) {
    var pre = 20 + i * 2 + Math.sin(i * 0.7) * 8;
    var post = 15 + pre * 0.6 + Math.cos(i * 1.1) * 12;
    return { pre: pre, post: post };
  });

  // Linear regression: slope ~0.6, intercept from means
  var meanPre = points.reduce(function(s, p) { return s + p.pre; }, 0) / N;
  var meanPost = points.reduce(function(s, p) { return s + p.post; }, 0) / N;
  var slope = 0.6;
  var intercept = meanPost - slope * meanPre;

  // SVG layout
  var svgW = 580;
  var svgH = 200;
  var padL = 44;
  var padR = 16;
  var padT = 12;
  var padB = 32;
  var chartW = svgW - padL - padR;
  var chartH = svgH - padT - padB;

  var preMin = 15;
  var preMax = 85;
  var postMin = 10;
  var postMax = 90;

  function xOf(pre) { return padL + ((pre - preMin) / (preMax - preMin)) * chartW; }
  function yOf(post) { return padT + (1 - (post - postMin) / (postMax - postMin)) * chartH; }

  var regX1 = preMin;
  var regY1 = slope * regX1 + intercept;
  var regX2 = preMax;
  var regY2 = slope * regX2 + intercept;

  var options = [
    { label: 'A. The treatment must already have been applied to users before the experiment officially starts collecting data', correct: false },
    { label: 'B. The chosen pre-experiment covariate must be correlated with the outcome metric you plan to analyze at the end', correct: true },
    { label: 'C. Users must have at least 30 continuous days of pre-experiment history logged in the data warehouse', correct: false },
    { label: 'D. The outcome metric must follow a normal distribution across the whole treatment and control population', correct: false },
  ];

  return (
    <div className="pal-page-enter">

      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          You run the power calculation for your next experiment. Required sample: 800,000 users per arm. At your current traffic of 100,000 new users per week, that\'s eight weeks — sixteen total. The PM needs results in four. You can\'t increase traffic. You can\'t increase the MDE without changing what decisions the experiment can support. You\'re stuck — unless there\'s a way to make the same data more informative.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The problem with statistical power is specific: you can\'t detect a small effect when there\'s a lot of noise. Your metric — say, session duration — varies a lot naturally. Some users are high-engagement by habit; they\'ll have long sessions regardless of what you do to the product. Some users are casual; they\'ll have short sessions. This natural variance is not signal about your experiment. It\'s background noise, and it makes the treatment effect harder to see.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          What you know about each user before the experiment starts is highly predictive of what they\'ll do during the experiment. A user who averaged 8 minutes of session time last month will probably average somewhere near 8 minutes this month — with or without your treatment. Their pre-experiment behavior explains a large fraction of their within-experiment variance. That explainable variance is noise that doesn\'t tell you anything about the treatment effect.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          CUPED (Controlled-experiment Using Pre-Experiment Data) subtracts the predictable component of each user\'s outcome. For each user, you take their pre-experiment value of the metric and subtract a scaled version of it from their experiment-period value. What remains is the residual — the part of their outcome that isn\'t explained by their pre-experiment baseline. That residual has less variance, because you\'ve stripped out the predictable background. Less variance means the same sample size gives you more statistical power — equivalently, the same power requires a smaller sample size, so the experiment takes less time.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The scaling factor is the coefficient from regressing the experiment-period outcome on the pre-experiment covariate. If pre-experiment session duration explains 50% of the variance in experiment-period session duration, CUPED reduces the required sample by approximately 50% — cutting runtime from eight weeks to four.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Before toggling &mdash; predict: which distribution will be narrower, the raw metric or the CUPED residuals? And why would a narrower distribution help your experiment?</p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Toggle CUPED on and watch what happens to variance</div>

      <InstructionBox>
        Toggle CUPED on to see what the technique actually removes.
      </InstructionBox>

      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem',
        overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Pre-experiment metric (Day -7 to 0) vs Post-experiment metric (Day 1 to 14)
          </div>
          <button
            onClick={function() {
              setCupedOn(function(prev) { return !prev; });
              if (!cupedOn) setShowExplainer(true);
            }}
            style={{
              padding: '0.55rem 0.9rem',
              minHeight: '40px',
              background: cupedOn ? 'var(--teal)' : 'var(--surface)',
              color: cupedOn ? '#fff' : 'var(--text)',
              border: '1.5px solid ' + (cupedOn ? 'var(--teal-border)' : 'var(--border)'),
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {cupedOn ? 'CUPED ON' : 'CUPED OFF'}
          </button>
        </div>

        <svg viewBox={'0 0 ' + svgW + ' ' + svgH} width="100%" style={{ maxWidth: svgW, height: 'auto', display: 'block', margin: '0 auto' }}>
          {/* Axis lines */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="var(--border)" strokeWidth="1" />
          <line x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH} stroke="var(--border)" strokeWidth="1" />

          {/* Y-axis label */}
          <text x="9" y={padT + chartH / 2} fontSize="8" fill="var(--text-muted)" textAnchor="middle"
            transform={'rotate(-90, 9, ' + (padT + chartH / 2) + ')'}>
            Post metric
          </text>

          {/* X-axis label */}
          <text x={padL + chartW / 2} y={svgH - 4} fontSize="8" fill="var(--text-muted)" textAnchor="middle">
            Pre metric
          </text>

          {/* Y-axis ticks */}
          {[20, 40, 60, 80].map(function(v) {
            return (
              <text key={v} x={padL - 4} y={yOf(v) + 3} fontSize="8" fill="var(--text-muted)" textAnchor="end">
                {v}
              </text>
            );
          })}

          {/* X-axis ticks */}
          {[20, 40, 60, 80].map(function(v) {
            return (
              <text key={v} x={xOf(v)} y={padT + chartH + 12} fontSize="8" fill="var(--text-muted)" textAnchor="middle">
                {v}
              </text>
            );
          })}

          {/* Regression line (when CUPED ON) */}
          {cupedOn && (
            <line
              x1={xOf(regX1)} y1={yOf(regY1)}
              x2={xOf(regX2)} y2={yOf(regY2)}
              stroke="var(--teal)" strokeWidth="2" strokeDasharray="6,3"
            />
          )}

          {/* Residual lines (when CUPED ON) */}
          {cupedOn && points.map(function(p, i) {
            var predicted = slope * p.pre + intercept;
            return (
              <line
                key={i}
                x1={xOf(p.pre)} y1={yOf(p.post)}
                x2={xOf(p.pre)} y2={yOf(predicted)}
                stroke="var(--yellow)" strokeWidth="1" opacity="0.7"
              />
            );
          })}

          {/* Scatter points */}
          {points.map(function(p, i) {
            return (
              <circle
                key={i}
                cx={xOf(p.pre)}
                cy={yOf(p.post)}
                r="4"
                fill={cupedOn ? 'var(--accent)' : 'var(--teal)'}
                opacity="0.75"
              />
            );
          })}

          {/* CUPED ON legend */}
          {cupedOn && (
            <g>
              <line x1={padL + chartW - 110} y1={padT + 8} x2={padL + chartW - 90} y2={padT + 8} stroke="var(--teal)" strokeWidth="2" strokeDasharray="6,3" />
              <text x={padL + chartW - 86} y={padT + 12} fontSize="8" fill="var(--teal)">regression line</text>
              <line x1={padL + chartW - 110} y1={padT + 22} x2={padL + chartW - 90} y2={padT + 22} stroke="var(--yellow)" strokeWidth="1" />
              <text x={padL + chartW - 86} y={padT + 26} fontSize="8" fill="var(--yellow)">residuals (what CUPED tests)</text>
            </g>
          )}
        </svg>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem',
      }}>
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Without CUPED
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.2rem' }}>Variance: 245</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Days to significance: 18 days</div>
        </div>
        <div style={{
          background: cupedOn ? 'var(--teal-bg)' : 'var(--surface-2)',
          border: '1px solid ' + (cupedOn ? 'var(--teal-border)' : 'var(--border)'),
          borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
          transition: 'all 0.25s',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: cupedOn ? 'var(--teal)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            With CUPED
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: cupedOn ? 'var(--teal)' : 'var(--text-muted)', marginBottom: '0.2rem' }}>Variance: 89</div>
          <div style={{ fontSize: '0.82rem', color: cupedOn ? 'var(--teal)' : 'var(--text-muted)' }}>
            {cupedOn ? 'Days to significance: 11 days' : 'Toggle CUPED ON to see'}
          </div>
        </div>
      </div>

      {showExplainer && cupedOn && (
        <div className="pal-reveal-in" style={{
          background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
          borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem',
          fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--teal)' }}>What CUPED just did:</strong> The yellow lines show each
          user\'s residual — the gap between their actual post-experiment metric and what the regression
          line predicted from their pre-experiment metric. CUPED runs the significance test on these
          residuals, not on the raw outcomes. Because residuals strip out predictable variation,
          they have lower variance — and lower variance means the same effect size is easier to detect.
        </div>
      )}

      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.85rem', marginTop: '0.5rem' }}>
        Which is the key requirement for CUPED to work?
      </div>

      <InstructionBox>
        Select the answer that identifies the core requirement CUPED depends on, then click Check to
        reveal the explanation. Think about what the regression line represents and what happens if it
        explains nothing.
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
            CUPED works by regressing the outcome metric on the pre-experiment covariate and testing residuals.
            If the covariate has no correlation with the outcome, the regression explains nothing — residuals
            equal the raw outcomes — and variance is unchanged. Correlation is the entire mechanism.
            A covariate with r = 0.7 can reduce variance by up to 51%.
          </div>

          {/* ── What you should have confirmed ── */}
          <div className="pal-reveal-in" style={{ marginTop: '1rem', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>CUPED residuals are narrower. The pre-experiment metric explains some of the variance in the outcome metric &mdash; CUPED removes that explained portion, leaving only the unexplained variance. Less variance means less noise, which means the same treatment effect is easier to detect. The magnitude of the reduction follows R&sup2;: if the correlation between pre- and post-experiment metric is 0.7, R&sup2; = 0.49, so CUPED removes roughly half the variance. A correlation of 0.9 gives R&sup2; = 0.81 &mdash; an 81% reduction. The higher the pre-experiment predictability, the more CUPED helps.</p>
          </div>

          {/* ── Analyst Move ── */}
          <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginTop: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Any time an experiment has an inadequate runtime due to traffic constraints, CUPED is the first lever to pull — before accepting a larger MDE, before narrowing the target population, before abandoning the experiment. Ask: do we have pre-experiment data on this metric for the users in the experiment? If yes, CUPED is almost certainly worth applying.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> The most effective covariate is the same metric, measured in the pre-experiment period. If you\'re measuring session duration in the experiment, use session duration from the prior 28 days as the covariate. Same metric, prior period — this gives the highest correlation and the most variance reduction. Other covariates can help but are typically less effective than the metric itself.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> CUPED does not change the expected treatment effect — it only changes the variance of the estimate. This means it cannot be used to rescue an underpowered experiment that has already run and shown a null result. It must be applied in the analysis plan before the experiment starts. Applying it post-hoc to a null result in search of significance is p-hacking.</p>
            </div>
          </div>

          <NextBtn onClick={onComplete} label="Complete module →" />
        </div>
      )}
    </div>
  );
}
