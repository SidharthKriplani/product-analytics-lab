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

// ── Module EF06: Novelty Effects and Long-Run Validity ─────────────────────
export default function Module06_NoveltyEffects({ onComplete }) {
  var saved06 = useMemo(function() { return loadEFState('ef06'); }, []);
  var [obsWeek, setObsWeek] = useState(function() { return saved06 && saved06.obsWeek !== undefined ? saved06.obsWeek : 1; });
  var [mcqAnswer, setMcqAnswer] = useState(function() { return saved06 ? saved06.mcqAnswer : null; });
  var [mcqRevealed, setMcqRevealed] = useState(function() { return saved06 ? saved06.mcqRevealed : false; });

  useEffect(function() {
    saveEFState('ef06', { obsWeek: obsWeek, mcqAnswer: mcqAnswer, mcqRevealed: mcqRevealed });
  }, [obsWeek, mcqAnswer, mcqRevealed]);

  // Novelty decay curve: starts at +15%, decays to +3% steady state
  // lift(w) = 3 + 12 * e^(-0.5*(w-1))
  var weekData = [];
  for (var w = 1; w <= 8; w++) {
    var lift = 3 + 12 * Math.exp(-0.5 * (w - 1));
    weekData.push({ week: w, lift: Math.round(lift * 10) / 10 });
  }
  var trueEffect = 3;

  // SVG chart dimensions
  var svgW = 340;
  var svgH = 180;
  var padL = 42;
  var padR = 16;
  var padT = 20;
  var padB = 28;
  var chartW = svgW - padL - padR;
  var chartH = svgH - padT - padB;
  var maxLift = 18;

  function xFor(wk) { return padL + (wk - 1) / 7 * chartW; }
  function yFor(val) { return padT + (1 - val / maxLift) * chartH; }

  // Build path
  var pathD = '';
  weekData.forEach(function(d, i) {
    var prefix = i === 0 ? 'M' : 'L';
    pathD += prefix + xFor(d.week) + ',' + yFor(d.lift) + ' ';
  });

  // Current observation point
  var currentLift = weekData[obsWeek - 1].lift;

  var mcqOptions = [
    { label: 'A. Ship after week 1 — the +15% lift is strong enough to act on immediately', correct: false },
    { label: 'B. Run the experiment for at least 3-4 weeks to let novelty decay stabilize, then use the steady-state estimate as the true effect', correct: true },
    { label: 'C. Average weeks 1 through 8 for the most accurate estimate of the treatment effect', correct: false },
    { label: 'D. The declining curve means the feature is getting worse — do not ship', correct: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Three days into your experiment, the numbers look excellent. The new personalized feed is showing +8% engagement. The PM wants to call it early and ship. The data is clean, the SRM check passed, the effect is statistically significant.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          You pause. Three days is not a long time. When users encounter something new — a redesigned UI, a new feature, a different content algorithm — they interact with it differently than they will once it\'s familiar. Some click on everything out of curiosity. Some spend more time because they\'re trying to figure out what changed. The engagement spike you see in the first days of an experiment often reflects novelty, not value.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The effect is real — it\'s just not the right effect. You measured user behavior during a brief window when the novelty of the change was itself a driver of engagement. That novelty decays. Some users find the new feed annoying once the initial curiosity fades. Engagement returns to baseline — or worse, drops below it as users develop a negative habituation. You shipped a winner that was never going to hold.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          There is a symmetric failure: some changes require learning time. A new navigation pattern might perform worse in week one — users are confused, they can\'t find what they used to find quickly — but better in week three once they\'ve learned the new layout. Cutting an experiment short misses the genuine long-run benefit. Both failure modes — novelty inflation and learning delay — have the same root: you measured behavior during a window that doesn\'t represent stable usage.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The forced requirement: run experiments long enough to capture stable behavioral patterns. This means at minimum one full weekly cycle. For most product changes, two to four weeks is the appropriate window. To detect novelty decay specifically, segment results by cohort enrollment date. Users enrolled in day one will show the novelty spike. Users enrolled in day ten, after the initial buzz has settled, will show more stable behavior. If the effect size drops substantially between early-enrolled and late-enrolled cohorts, you\'re looking at novelty, not value.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>If you only have access to aggregate engagement data — not segmented by enrollment date — what patterns in the aggregate time series would suggest novelty decay rather than a genuine stable lift? Work through what novelty decay would look like in the data before exploring.</p>
      </div>

      {/* ── The Concept + Interactive Demo ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Novelty Decay Visualizer</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
          Drag the observation window slider to see what treatment effect you would report at each week. The blue curve shows the measured lift; the dashed green line shows the true long-run effect (+3%). Notice how reading results at week 1 massively overstates the real impact.
        </p>

        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          {/* Observation window slider */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Read results at: <strong style={{ color: 'var(--accent)' }}>Week {obsWeek}</strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(measured lift: <strong style={{ color: currentLift > trueEffect + 2 ? 'var(--yellow)' : 'var(--teal)' }}>+{currentLift}%</strong>)</span>
            </label>
            <input type='range' min={1} max={8} step={1} value={obsWeek} onChange={function(e) { setObsWeek(Number(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>

          {/* SVG chart */}
          <svg viewBox={'0 0 ' + svgW + ' ' + svgH} width='100%' style={{ maxWidth: '400px', display: 'block', margin: '0 auto' }}>
            {/* Y-axis gridlines */}
            {[0, 5, 10, 15].map(function(v) {
              return (
                <g key={v}>
                  <line x1={padL} x2={svgW - padR} y1={yFor(v)} y2={yFor(v)} stroke='var(--border)' strokeWidth={0.5} strokeDasharray={v > 0 ? '3,3' : 'none'} />
                  <text x={padL - 4} y={yFor(v) + 3} textAnchor='end' fill='var(--text-muted)' fontSize={9}>+{v}%</text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {weekData.map(function(d) {
              return (
                <text key={d.week} x={xFor(d.week)} y={svgH - 4} textAnchor='middle' fill='var(--text-muted)' fontSize={9}>W{d.week}</text>
              );
            })}

            {/* True effect line */}
            <line x1={padL} x2={svgW - padR} y1={yFor(trueEffect)} y2={yFor(trueEffect)} stroke='var(--teal)' strokeWidth={1.5} strokeDasharray='6,4' />
            <text x={svgW - padR + 2} y={yFor(trueEffect) + 3} fill='var(--teal)' fontSize={8} fontWeight={600}>True +3%</text>

            {/* Decay curve */}
            <path d={pathD} fill='none' stroke='var(--accent)' strokeWidth={2.5} strokeLinejoin='round' strokeLinecap='round' />

            {/* Data points */}
            {weekData.map(function(d) {
              return (
                <circle key={d.week} cx={xFor(d.week)} cy={yFor(d.lift)} r={d.week === obsWeek ? 5 : 3} fill={d.week === obsWeek ? 'var(--accent)' : 'var(--surface)'} stroke='var(--accent)' strokeWidth={d.week === obsWeek ? 2.5 : 1.5} />
              );
            })}

            {/* Observation marker */}
            <line x1={xFor(obsWeek)} x2={xFor(obsWeek)} y1={yFor(currentLift) + 8} y2={yFor(0)} stroke='var(--accent)' strokeWidth={1} strokeDasharray='4,3' opacity={0.5} />
          </svg>

          {/* Reading callout */}
          <div style={{
            marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', lineHeight: 1.55,
            background: currentLift > trueEffect + 2 ? 'var(--yellow-bg)' : 'var(--teal-bg)',
            border: '1px solid ' + (currentLift > trueEffect + 2 ? 'var(--yellow-border)' : 'var(--teal-border)'),
            color: currentLift > trueEffect + 2 ? 'var(--yellow)' : 'var(--teal)',
          }}>
            {currentLift > trueEffect + 5 ? 'Reading at week ' + obsWeek + ': you\'d report +' + currentLift + '% — but the true long-run effect is only +' + trueEffect + '%. You\'d overstate the impact by ' + Math.round((currentLift / trueEffect - 1) * 100) + '%.' :
             currentLift > trueEffect + 2 ? 'Week ' + obsWeek + ' still shows novelty inflation. The +' + currentLift + '% is closer to steady state but still above the true +' + trueEffect + '% long-run effect.' :
             'Week ' + obsWeek + ': the effect has stabilized near the true long-run value of +' + trueEffect + '%. This is a reliable estimate to ship on.'}
          </div>
        </div>
      </div>

      {/* ── The Framework ── */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Framework</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          When evaluating experiment results, always check the time series of the treatment effect, not just the aggregate. If the lift is highest in week 1 and declines, you are seeing novelty decay. Run the experiment long enough to capture steady-state behavior — typically 2-4 weeks for features with habitual use patterns. Report the stabilized estimate (usually week 4+), not the week-1 peak. If your PM pushes to ship based on early results, show them the decay curve.
        </p>
      </div>

      {/* ── Quick Check ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Quick Check</div>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          Your experiment shows +15% lift in week 1 that decays to +3% by week 8. What is the right approach?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {mcqOptions.map(function(opt, i) {
            return (
              <MCQOption key={i} label={opt.label} selected={mcqAnswer === i} correct={opt.correct} revealed={mcqRevealed} onClick={function() { if (!mcqRevealed) setMcqAnswer(i); }} />
            );
          })}
        </div>
        {mcqAnswer !== null && !mcqRevealed && (
          <CheckBtn onClick={function() { setMcqRevealed(true); }} />
        )}
        {mcqRevealed && (
          <div className='pal-reveal-in' style={{
            marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', lineHeight: 1.55,
            background: mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            color: 'var(--text)',
          }}>
            <strong>{mcqOptions[mcqAnswer] && mcqOptions[mcqAnswer].correct ? 'Correct. ' : 'Not quite. '}</strong>
            The declining curve doesn\'t mean the feature is getting worse — it means the novelty-inflated engagement is settling to the true effect. Averaging all 8 weeks would overweight the novelty period. The right approach: wait for stabilization (usually week 3-4), then use the steady-state estimate. The feature still has a real +3% lift, which may or may not be worth shipping depending on the cost.
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {mcqRevealed && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Novelty decay shows up as a widening then narrowing gap between treatment and control over time — the effect is larger in early weeks than late ones. A genuine lift produces a roughly stable gap from week two onward. In the aggregate time series, novelty looks like a trend in the treatment-control difference, not a level shift. The cohort view makes this cleaner: early cohorts show stronger effects than late cohorts if novelty is driving the result.</p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {mcqRevealed && (
        <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Do not report experiment results before reaching the minimum required runtime. "It\'s already significant after three days" is not a reason to stop. Pre-register your runtime in the experiment plan and hold to it. The significance threshold you set assumes a specific sample size — stopping early changes the statistical properties of the test.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> For any experiment that shows an unusually large initial effect, run the cohort enrollment date analysis before reporting. Break users into week-one enrollees and later enrollees. If the effect is substantially larger for week-one users, flag novelty as a likely explanation and extend the runtime rather than calling a winner.</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Major UX changes — new navigation, redesigned flows, reordered content — should be planned for longer runtimes than minor tweaks. The learning effect means performance in week one may be the worst week, not a representative week. A rule of thumb: any change that requires users to relearn a pattern should run for at least three weeks before results are interpreted.</p>
          </div>
        </div>
      )}

      {mcqRevealed && (
        <NextBtn onClick={onComplete} />
      )}
    </div>
  );
}
