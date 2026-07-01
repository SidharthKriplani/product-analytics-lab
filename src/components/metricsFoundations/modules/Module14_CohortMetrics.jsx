import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--green)'} />; }

function saveMFState(id, state) { try { localStorage.setItem('pal-mf-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadMFState(id) { try { var raw = localStorage.getItem('pal-mf-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleMF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

export function Module_MF14({ module, onNext }) {
  var saved14 = useMemo(function() { return loadMFState('mf14'); }, []);
  var [improvement, setImprovement] = useState(function() { return saved14 && saved14.improvement !== undefined ? saved14.improvement : 0; });
  var [seasonal, setSeasonal] = useState(function() { return saved14 && saved14.seasonal !== undefined ? saved14.seasonal : 0; });
  var [sizeWeight, setSizeWeight] = useState(function() { return saved14 && saved14.sizeWeight !== undefined ? saved14.sizeWeight : 50; });
  var [answer14, setAnswer14] = useState(function() { return saved14 && saved14.answer !== undefined ? saved14.answer : null; });
  var [revealed14, setRevealed14] = useState(function() { return saved14 ? saved14.revealed : false; });

  useEffect(function() {
    saveMFState('mf14', { improvement: improvement, seasonal: seasonal, sizeWeight: sizeWeight, answer: answer14, revealed: revealed14 });
  }, [improvement, seasonal, sizeWeight, answer14, revealed14]);

  var cohortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  var periods = ['Week 0', 'Week 1', 'Week 2', 'Week 3'];
  var baseSizes = [1000, 1200, 800, 1500, 900];

  function getRetention(cohortIdx, periodIdx) {
    if (periodIdx === 0) return 100;
    var base = [100, 45, 32, 28][periodIdx];
    var improvementBoost = improvement * cohortIdx * 1.2;
    var seasonalDip = (seasonal > 0 && cohortIdx === 1) ? -seasonal * 8 : 0;
    var val = base + improvementBoost + seasonalDip;
    return Math.max(2, Math.min(100, Math.round(val)));
  }

  function getAggRetention(periodIdx) {
    if (periodIdx === 0) return 100;
    var totalWeighted = 0;
    var totalSize = 0;
    for (var c = 0; c < 5; c++) {
      var size = baseSizes[c] * (1 + (sizeWeight - 50) * 0.02 * (c < 2 ? -1 : 1));
      size = Math.max(100, size);
      totalWeighted += getRetention(c, periodIdx) * size;
      totalSize += size;
    }
    return Math.round(totalWeighted / totalSize);
  }

  function cellColor(val) {
    var intensity = Math.min(1, val / 100);
    var r = Math.round(34 + (1 - intensity) * 180);
    var g = Math.round(139 + (1 - intensity) * 80);
    var b = Math.round(34 + (1 - intensity) * 180);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + (0.15 + intensity * 0.55) + ')';
  }

  var W14 = 400;
  var H14 = 180;
  var cellW = W14 / 5;
  var cellH = H14 / 6;

  var mcq14 = [
    { label: 'A. Aggregate retention is flat — everything is fine, no action needed.', correct: false },
    { label: 'B. The newest cohort\'s D7 is declining — investigate recent changes even though the aggregate looks stable.', correct: true },
    { label: 'C. Focus on the oldest cohort because it has the longest retention history.', correct: false },
    { label: 'D. Wait until aggregate retention actually drops before investigating.', correct: false },
  ];

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Prose: causal chain ── */}
      <div style={sectionGap}>
        <p style={prose}>A cohort is a group of users defined by a shared starting event &mdash; typically the date of first use. Cohort analysis tracks that group over time, measuring what fraction remains active at each interval. The retention curve plots that fraction against time: D1, D7, D14, D30, D60, D90 and beyond.</p>
        <p style={prose}>Cohort analysis exists because aggregate retention metrics are misleading in a specific way: they mix users at different stages of their lifecycle into a single number. When the product changes, the aggregate metric inherits a mixture of old behavior (from cohorts who experienced the old product) and new behavior (from recent cohorts experiencing the new product). The aggregate can stay flat while something is quietly getting better or worse for recent cohorts.</p>
        <p style={prose}>The natural approach when checking retention health is to pull the overall D7 or D30 retention rate for the past 30 days. This gives you one number. It moves up or down in response to product changes. If it&apos;s stable, you note that retention is holding. But here&apos;s where it breaks.</p>
        <p style={prose}>January cohort retained at 38% by D7. February cohort retained at 26%. Overall D7 retention for February: 32% &mdash; exactly where it was in January. The aggregate held flat because January&apos;s cohort is larger &mdash; the product had lower churn at acquisition, so there were more active users from January who hit their D7 milestone in February. The larger, better-performing January cohort masked the worse-performing February cohort entirely. If you&apos;re tracking only the aggregate, you see stability. If you&apos;re tracking by cohort, you see that every new user acquired in February retained 12pp worse than users acquired in January. That&apos;s a regression, invisible to the aggregate, that compounded for the entire month before showing up.</p>
        <p style={prose}>The fix is the cohort table: rows are acquisition cohorts (by week or month), columns are retention intervals (D1, D7, D30, D90...), and each cell is the retention rate for that cohort at that interval. The table separates lifecycle position from calendar time. You can now compare January users at D7 against February users at D7 &mdash; the same lifecycle stage, different calendar times.</p>
        <p style={prose}>Two patterns in the cohort table signal different things. A pattern where recent rows have worse values than older rows at the same column indicates a regression in product experience for new users. A pattern where early columns are healthy but later columns look progressively worse than older cohorts reached those intervals indicates long-term retention is degrading. Both patterns are invisible in aggregate retention rates.</p>
        <p style={prose}>Let&apos;s take an example. Cohort table for a subscription product: Nov &mdash; D1 72%, D7 48%, D14 38%, D30 32%. Dec &mdash; D1 73%, D7 47%, D14 37%, D30 31%. Jan &mdash; D1 71%, D7 46%, D14 36%, D30 30%. Feb &mdash; D1 70%, D7 33%, D14 &mdash;, D30 &mdash;. November, December, January: stable. February: D1 held flat (70%), D7 dropped sharply to 33% vs the 46&ndash;48% range. Something changed between D1 and D7 for February users. The investigation has a precise scope: what changed between late January and February that could affect the first-week experience for new users?</p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>If D7 retention is stable at 40% for three months, but you only have aggregate data, what types of underlying cohort changes would be invisible to you?</p>
      </div>

      {/* ── Try It label ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* ── Interactive ── */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Adjust the three sliders to see how product improvements, seasonal effects, and cohort size weighting change the retention table and aggregate numbers.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>Product improvement</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--green)' }}>{improvement}</span>
            </div>
            <input type='range' min={0} max={5} step={1} value={improvement} onChange={function(e) { setImprovement(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--green)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}><span>None</span><span>Strong</span></div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>Seasonal effect</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--yellow)' }}>{seasonal}</span>
            </div>
            <input type='range' min={0} max={3} step={1} value={seasonal} onChange={function(e) { setSeasonal(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--yellow)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}><span>None</span><span>Strong dip (Feb)</span></div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600 }}>Cohort size shift</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)' }}>{sizeWeight}</span>
            </div>
            <input type='range' min={0} max={100} step={5} value={sizeWeight} onChange={function(e) { setSizeWeight(parseInt(e.target.value)); }} style={{ width: '100%', accentColor: 'var(--accent)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}><span>Older heavier</span><span>Newer heavier</span></div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <svg viewBox={'0 0 ' + W14 + ' ' + H14} width='100%' style={{ display: 'block', minWidth: '320px' }}>
            {periods.map(function(p, pi) {
              return <text key={'ph' + pi} x={cellW * (pi + 1) + cellW * 0.5} y={cellH * 0.65} textAnchor='middle' fontSize='9' fontWeight='700' fill='var(--text-muted)'>{p}</text>;
            })}
            {cohortNames.map(function(c, ci) {
              return <text key={'cl' + ci} x={cellW * 0.5} y={cellH * (ci + 1) + cellH * 0.6} textAnchor='middle' fontSize='9' fontWeight='600' fill='var(--text)'>{c}</text>;
            })}
            {cohortNames.map(function(c, ci) {
              return periods.map(function(p, pi) {
                var val = getRetention(ci, pi);
                return (
                  <g key={'c' + ci + 'p' + pi}>
                    <rect x={cellW * (pi + 1) + 1} y={cellH * (ci + 1) + 1} width={cellW - 2} height={cellH - 2} rx='3' fill={cellColor(val)} />
                    <text x={cellW * (pi + 1) + cellW * 0.5} y={cellH * (ci + 1) + cellH * 0.62} textAnchor='middle' fontSize='10' fontWeight='700' fill='var(--text)'>{val + '%'}</text>
                  </g>
                );
              });
            })}
          </svg>
        </div>

        <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: '0.5rem' }}>
          {periods.map(function(p, pi) {
            var agg = getAggRetention(pi);
            return (
              <div key={'agg' + pi} style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Agg {p}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>{agg + '%'}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
          D7 aggregate retention has been flat at 32% for three months. Cohort-level data shows January at 38% and the most recent cohort at 26%. What should you do?
        </div>
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> Pick the action that best reflects how a cohort-level view should change your response to &quot;flat&quot; aggregate retention.
        </div>

        {mcq14.map(function(opt, i) {
          var sel14 = answer14 === i;
          var bg14 = 'var(--surface-2)'; var brd14 = 'var(--border)'; var col14 = 'var(--text)';
          if (revealed14) {
            if (opt.correct) { bg14 = 'var(--teal-bg)'; brd14 = 'var(--teal-border)'; col14 = 'var(--teal)'; }
            else if (sel14) { bg14 = 'var(--red-bg)'; brd14 = 'var(--red-border)'; col14 = 'var(--red)'; }
          } else if (sel14) { brd14 = 'var(--accent-border)'; }
          return (
            <button key={i} onClick={function() { if (!revealed14) setAnswer14(i); }} disabled={revealed14}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', marginBottom: '0.5rem', background: bg14, border: '1.5px solid ' + brd14, borderRadius: 'var(--radius-sm)', color: col14, fontSize: '0.88rem', cursor: revealed14 ? 'default' : 'pointer', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          );
        })}

        {answer14 !== null && !revealed14 && (
          <button onClick={function() { setRevealed14(true); }} style={{ marginTop: '0.5rem', padding: '0.5rem 1.1rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Check
          </button>
        )}

        {revealed14 && (
          <div className='pal-reveal-in'>
            <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: mcq14[answer14] && mcq14[answer14].correct ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (mcq14[answer14] && mcq14[answer14].correct ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5 }}>
              Aggregate retention is a weighted average across cohorts. When newer, larger cohorts have worse retention, they pull the aggregate down — masking improvements in older cohorts. Conversely, a flat aggregate can hide deteriorating new-cohort retention if older, better-retaining cohorts still dominate the denominator. Always look at cohort-level trends before concluding retention is &quot;fine.&quot;
            </div>
          </div>
        )}
      </div>

      {/* ── What you should have confirmed ── */}
      {revealed14 && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>If recent cohorts (which are smaller, because they haven&apos;t had time to accumulate) have lower D7 retention, and older cohorts (larger) maintained their historical rate, the aggregate stays flat because the older cohorts dominate the calculation. The decline in recent cohorts doesn&apos;t move the aggregate. Moving the recent cohort&apos;s D7 down while keeping older cohorts fixed shows the aggregate barely budges until you change the cohort sizes.</p>
        </div>
      )}

      {/* ── The Analyst Move ── */}
      {revealed14 && (
        <div style={{ background: 'var(--green-bg)', border: '1.5px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> For any retention-related analysis, the cohort table is the primary view &mdash; not aggregate retention. Use the aggregate only as the headline number; use the cohort table to verify that the headline isn&apos;t masking divergent cohort behavior. A retention dashboard without a cohort breakdown is missing the signal it most needs.</p>
            <p style={prose}><strong>Two.</strong> When setting retention targets for OKRs, specify the cohort vintage you&apos;re targeting. &quot;D7 retention above 40%&quot; is ambiguous &mdash; it could be met by the aggregate even if recent cohorts regress. &quot;D7 retention above 40% for all cohorts acquired in Q3&quot; is specific and catches regressions the aggregate misses.</p>
            <p style={prose}><strong>Three.</strong> The common mistake in A/B test design is measuring retention as a primary metric by looking at the aggregate D7 rate for the experiment period, rather than comparing D7 retention for the treatment cohort vs. the control cohort acquired during the same window. Mixing cohorts acquired at different times introduces cohort-vintage noise that blurs the treatment signal. Always compare same-vintage cohorts between arms.</p>
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
