import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const THIS_YEAR = [820, 810, 790, 765, 720, 680, 600];
const LAST_YEAR = [815, 808, 785, 760, 718, 675, 596];

const RF09_MCQ = {
  question: 'A metric is down 13% WoW. The same metric was also down 13% in the same week last year. What does this most likely indicate?',
  options: [
    'Coincidence — a 13% WoW drop is within normal variance, and last year\'s match is spurious correlation without at least three years of data',
    'This is a seasonal pattern — investigate YoY, not a product regression',
    'The YoY match suggests a recurring data pipeline issue that triggers during this calendar week — check ETL job schedules and ingestion logs',
    'Both seasonal and product factors are likely contributing — decompose the drop into a seasonal baseline component and a residual to investigate separately',
  ],
  correct: 1,
  explanation: 'When the current drop matches last year\'s drop in the same week, the pattern is almost certainly seasonal. Two years of matching data is strong evidence — requiring three+ years is overly conservative and delays a clear conclusion. A recurring pipeline issue is creative but unlikely to produce the same magnitude drop on the same calendar week. Decomposing into seasonal + residual sounds rigorous but overcomplicates what is a straightforward seasonal pattern — the correct response is to confirm YoY alignment, set a seasonality-adjusted baseline, and close the investigation.',
};

export function Module_RF09({ onComplete }) {
  const _saved09 = useMemo(function() { return loadRFState('rf09'); }, []);
  const [showYoY, setShowYoY] = useState(function() { return _saved09 ? !!_saved09.showYoY : false; });
  const [mcqSel, setMcqSel] = useState(function() { return _saved09 && _saved09.mcqSel != null ? _saved09.mcqSel : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved09 ? !!_saved09.mcqRevealed : false; });

  useEffect(function() { saveRFState('rf09', { showYoY: showYoY, mcqSel: mcqSel, mcqRevealed: mcqRevealed }); }, [showYoY, mcqSel, mcqRevealed]);

  // SVG chart constants
  const W = 500;
  const H = 200;
  const PAD_L = 42;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const allVals = THIS_YEAR.concat(LAST_YEAR);
  const minV = Math.min.apply(null, allVals) - 30;
  const maxV = Math.max.apply(null, allVals) + 30;

  function xPos(i) {
    return PAD_L + (i / (DAYS.length - 1)) * chartW;
  }
  function yPos(v) {
    return PAD_T + chartH - ((v - minV) / (maxV - minV)) * chartH;
  }

  function makePath(vals) {
    return vals.map(function(v, i) {
      return (i === 0 ? 'M' : 'L') + xPos(i).toFixed(1) + ',' + yPos(v).toFixed(1);
    }).join(' ');
  }

  const yTicks = [600, 680, 760, 820];

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>You&apos;re reviewing the weekly metrics report. DAU is down 12% week-over-week. The PM is alarmed and asks for an investigation.</p>
        <p style={prose}>Before you start, you check the same week last year. Also down 12% week-over-week. Same magnitude, same direction. The PM relaxes: seasonal. Case closed.</p>
        <p style={prose}>Not so fast. One matching year is not a confirmed seasonal pattern. Last year&apos;s same-week decline might itself have been anomalous — a campaign pause, a competitor launch, a news event that happened to land in the same week twelve months ago. If you close the investigation on a single prior-year match, you may be calling a real product problem seasonal based on a coincidence.</p>
        <p style={prose}>What you actually need is a method for determining whether a metric movement is explained by a predictable seasonal pattern or whether it contains a residual signal — a deviation from what seasonality alone would predict. A seasonally adjusted baseline is constructed by measuring the seasonal pattern from multiple years of data, expressing it as a multiplier, and applying it to the current trend-adjusted level. After adjustment, a 12% drop might become a 4% residual — the part that seasonality doesn&apos;t explain. That 4% is what requires investigation.</p>
        <p style={prose}>For most analyst work, a workable approximation is: compare to the same week across three prior years and compute whether this year&apos;s deviation from those years&apos; average is materially larger than the variation between those years themselves. If prior years show this week ranging from -10% to -14% WoW, a current -12% WoW is well within the seasonal band. A current -22% WoW is outside it — there is a residual that requires explaining.</p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>DAU is down 15% WoW. Prior three years for this calendar week show: -14%, -16%, -13%. Is there a residual signal? What would the drop have to be to clearly exceed the seasonal band?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
        Not every week-over-week drop is a product regression. Before raising an alarm, overlay the same metric from the same week last year. If the shapes match, you are looking at a predictable seasonal cycle — not a broken feature.
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Click the Show YoY toggle to overlay last year&apos;s data on the chart — compare what changes between the two states and notice whether the shapes match.
      </div>

      {/* Chart */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Daily DAU — current week</div>
          <button
            onClick={() => setShowYoY(function(v) { return !v; })}
            style={{
              padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-sm)',
              border: '1.5px solid ' + (showYoY ? 'var(--accent-border)' : 'var(--border)'),
              background: showYoY ? 'var(--accent-bg)' : 'var(--surface)',
              color: showYoY ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            {showYoY ? 'Hide YoY' : 'Show YoY'}
          </button>
        </div>

        <svg viewBox={'0 0 ' + W + ' ' + H} style={{ width: '100%', maxWidth: W + 'px', display: 'block', overflow: 'visible' }}>
          {/* Y grid + labels */}
          {yTicks.map(function(tick) {
            const y = yPos(tick);
            return (
              <g key={tick}>
                <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke='var(--border)' strokeWidth='1' />
                <text x={PAD_L - 6} y={y + 4} textAnchor='end' fontSize='9' fill='var(--text-muted)'>{tick}</text>
              </g>
            );
          })}
          {/* X labels */}
          {DAYS.map(function(day, i) {
            return (
              <text key={day} x={xPos(i)} y={H - 6} textAnchor='middle' fontSize='9' fill='var(--text-muted)'>{day}</text>
            );
          })}
          {/* YoY line */}
          {showYoY && (
            <g>
              <path d={makePath(LAST_YEAR)} fill='none' stroke='var(--accent)' strokeWidth='2' strokeDasharray='5,3' />
              {LAST_YEAR.map(function(v, i) {
                return <circle key={i} cx={xPos(i)} cy={yPos(v)} r='3.5' fill='var(--accent)' />;
              })}
            </g>
          )}
          {/* Current week line */}
          <path d={makePath(THIS_YEAR)} fill='none' stroke='var(--teal)' strokeWidth='2.5' />
          {THIS_YEAR.map(function(v, i) {
            return <circle key={i} cx={xPos(i)} cy={yPos(v)} r='4' fill='var(--teal)' />;
          })}
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-block', width: 22, height: 3, background: 'var(--teal)', borderRadius: 2 }} />
            Current week
          </div>
          {showYoY && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-block', width: 22, height: 2, background: 'var(--accent)', borderRadius: 2, borderTop: '2px dashed var(--accent)' }} />
              Same week last year
            </div>
          )}
        </div>

        {showYoY && (
          <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.55 }}>
            The two lines are nearly identical. The current week&apos;s decline mirrors last year&apos;s pattern almost exactly — this drop is seasonal, not a regression.
          </div>
        )}
      </div>

      {/* MCQ — show after YoY toggled */}
      {showYoY && (
        <div>
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            <strong>What to do:</strong> Select the answer that correctly interprets what a matching YoY drop means, then click Check.
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.65rem' }}>{RF09_MCQ.question}</div>
          {RF09_MCQ.options.map(function(opt, oi) {
            return (
              <MCQOption
                key={oi}
                label={opt}
                selected={mcqSel === oi}
                correct={oi === RF09_MCQ.correct}
                revealed={mcqRevealed}
                onClick={function() { if (!mcqRevealed) setMcqSel(oi); }}
              />
            );
          })}
          {mcqSel !== null && !mcqRevealed && (
            <button
              onClick={function() { setMcqRevealed(true); }}
              style={{ marginTop: '0.4rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}
            >Check</button>
          )}
          {mcqRevealed && (
            <div>
              <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>
                {RF09_MCQ.explanation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {mcqRevealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>The current -15% falls within the band of -13% to -16% from prior years. No residual — the drop is explained by seasonality. The current value would need to reach approximately -20% or more before it clearly exceeds the band and requires a non-seasonal explanation. A drop is seasonal when it falls within the historical seasonal band for that calendar period. A drop that exceeds the band contains a non-seasonal component that requires a cause.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {mcqRevealed && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Never present a WoW comparison as evidence of a product problem without first checking it against the prior-year range for that calendar week. A WoW drop that matches the prior-year seasonal pattern is not a finding — it&apos;s expected behavior. Presenting it as a finding wastes leadership&apos;s attention and your investigation hours.</p>
            <p style={prose}><strong>Two.</strong> The phrase &quot;same week last year was also down&quot; is the beginning of a seasonality check, not the end. One year is a data point. Three years is a pattern. Always pull at least two prior years before calling something seasonal, and state explicitly: &quot;the current drop falls within the 3-year seasonal range of X% to Y%.&quot;</p>
            <p style={prose}><strong>Three.</strong> When you do find a residual — a drop that exceeds the seasonal band — that residual is the metric you investigate, not the raw drop. If the seasonal pattern explains 10 points and the observed drop is 15 points, you&apos;re investigating a 5-point residual, not a 15-point drop. Starting the investigation from the residual scopes it correctly.</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {mcqRevealed && <NextBtn onClick={onComplete} />}
    </div>
  );
}
