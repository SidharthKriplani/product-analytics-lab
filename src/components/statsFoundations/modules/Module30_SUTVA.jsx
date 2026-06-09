import { useState, useMemo } from 'react';

var MCQ_OPTIONS = [
  { id: 'a', text: 'A single-player mobile game tests a new tutorial flow with user-level randomization' },
  { id: 'b', text: 'A ride-hailing app tests lower surge pricing with user-level randomization in the same city' },
  { id: 'c', text: 'An email marketing tool tests subject lines by randomly assigning users to variants' },
  { id: 'd', text: 'A news app tests a new font size with a 50/50 user split' },
];
var MCQ_ANSWER = 'b';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function Module30_SUTVA({ module, onNext }) {
  var [interference, setInterference] = useState(0);
  var [picked, setPicked] = useState(null);
  var [revealed, setRevealed] = useState(false);

  var trueEffect = 12;
  var measuredEffect = useMemo(function () {
    var spillover = interference / 100;
    return Math.round((trueEffect * (1 - spillover * 0.85)) * 10) / 10;
  }, [interference]);

  var bias = trueEffect - measuredEffect;

  // Grid positions for 12 dots (3 cols x 4 rows)
  var dots = useMemo(function () {
    var arr = [];
    for (var i = 0; i < 12; i++) {
      var col = i % 3;
      var row = Math.floor(i / 3);
      arr.push({
        x: 80 + col * 120,
        y: 55 + row * 60,
        group: i < 6 ? 'control' : 'treatment',
      });
    }
    return arr;
  }, []);

  // Connection lines between treatment and control (interference)
  var connections = useMemo(function () {
    if (interference === 0) return [];
    var lines = [];
    var pairs = [
      [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11],
      [0, 7], [1, 8], [2, 9], [3, 10], [4, 11], [5, 6],
      [0, 8], [1, 9], [2, 10], [3, 11], [4, 6], [5, 7],
    ];
    var numVisible = Math.ceil((interference / 100) * pairs.length);
    for (var i = 0; i < numVisible; i++) {
      var pair = pairs[i];
      lines.push({
        x1: dots[pair[0]].x,
        y1: dots[pair[0]].y,
        x2: dots[pair[1]].x,
        y2: dots[pair[1]].y,
        opacity: lerp(0.15, 0.5, interference / 100),
      });
    }
    return lines;
  }, [interference, dots]);

  function handleCheck() { setRevealed(true); }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        <strong>SUTVA</strong> (Stable Unit Treatment Value Assumption) is the foundational assumption behind every A/B test: each user\'s outcome depends only on their own assignment, not on anyone else\'s. When treatment and control users interact — sharing rides, competing for inventory, influencing each other on social feeds — SUTVA breaks and your measured effect is biased.
      </p>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        Your ride-hailing company runs an A/B test on surge pricing. Treatment users get lower surges, so they request more rides. But those rides would have gone to control users — the groups are interfering with each other. The treatment is spilling over into control, making control look worse and treatment look less effective than it really is. The experiment result is uninterpretable.
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Drag the interference slider from 0% to 100%. Watch how spillover between treatment and control distorts the measured effect away from the true effect. At high interference, the experiment becomes meaningless.
      </div>

      {/* Interference slider */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
            Interference strength
          </label>
          <span style={{
            fontSize: '1.4rem', fontWeight: 900,
            color: interference > 50 ? 'var(--red)' : interference > 20 ? 'var(--yellow)' : 'var(--green)',
            fontVariantNumeric: 'tabular-nums', minWidth: 60, textAlign: 'right',
          }}>
            {interference}%
          </span>
        </div>
        <input
          type="range" min={0} max={100} step={5}
          value={interference}
          onChange={function (e) { setInterference(parseInt(e.target.value)); }}
          style={{ width: '100%', accentColor: interference > 50 ? 'var(--red)' : interference > 20 ? 'var(--yellow)' : 'var(--green)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          <span>0% (SUTVA holds)</span>
          <span>50% (moderate spillover)</span>
          <span>100% (heavy interference)</span>
        </div>
      </div>

      {/* Effect comparison banner */}
      <div style={{
        background: interference > 30 ? 'var(--red-bg)' : 'var(--green-bg)',
        border: '2px solid ' + (interference > 30 ? 'var(--red-border)' : 'var(--green-border)'),
        borderRadius: 'var(--radius)', padding: '0.85rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
            True effect
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--green)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            +{trueEffect}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
            Measured effect
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: interference > 30 ? 'var(--red)' : 'var(--green)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            +{measuredEffect}%
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
            Bias from spillover
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: bias > 2 ? 'var(--red)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {bias > 0 ? '-' : ''}{bias.toFixed(1)}pp
          </div>
        </div>
      </div>

      {/* SVG interference visualizer */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          User interference map
        </div>
        <svg viewBox="0 0 440 300" width="100%" style={{ overflow: 'visible' }}>
          {/* Labels */}
          <text x={200} y={22} textAnchor="middle" fontSize={11} fill="var(--accent)" fontWeight={700}>Control group</text>
          <text x={200} y={175} textAnchor="middle" fontSize={11} fill="var(--green)" fontWeight={700}>Treatment group</text>

          {/* Connection lines (interference) */}
          {connections.map(function (line, i) {
            return (
              <line key={'c' + i}
                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                stroke="var(--red)" strokeWidth={1.5} opacity={line.opacity}
                strokeDasharray="4,3"
              />
            );
          })}

          {/* User dots */}
          {dots.map(function (dot, i) {
            var isControl = dot.group === 'control';
            return (
              <g key={'d' + i}>
                <circle
                  cx={dot.x} cy={dot.y} r={14}
                  fill={isControl ? 'var(--accent)' : 'var(--green)'}
                  opacity={0.8}
                  stroke="var(--surface)" strokeWidth={2}
                />
                <text x={dot.x} y={dot.y + 4} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={700}>
                  {isControl ? 'C' : 'T'}{(i % 6) + 1}
                </text>
              </g>
            );
          })}

          {/* Legend */}
          <line x1={30} y1={275} x2={50} y2={275} stroke="var(--red)" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5} />
          <text x={55} y={279} fontSize={10} fill="var(--text-muted)">Interference (spillover between groups)</text>
        </svg>
      </div>

      {/* Framework */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Framework</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7 }}>
          SUTVA has two conditions: (1) no interference between units — one user\'s treatment does not affect another user\'s outcome, and (2) no hidden versions of treatment — every treated user receives the same treatment. When either breaks, the standard A/B test estimator is biased. Fixes include cluster randomization (randomize cities, not users), geo holdouts (treat entire regions), and switchback experiments (alternate treatment over time periods).
        </div>
      </div>

      {/* Quick Check MCQ */}
      <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          Quick Check
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
          Which experiment design is most likely to violate SUTVA?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {MCQ_OPTIONS.map(function (opt) {
            var isSelected = picked === opt.id;
            var isCorrect = opt.id === MCQ_ANSWER;
            var bg = !revealed ? (isSelected ? 'var(--yellow-bg)' : 'var(--surface)') : (isCorrect ? 'var(--green-bg)' : isSelected ? 'var(--red-bg)' : 'var(--surface)');
            var border = !revealed ? (isSelected ? 'var(--yellow-border)' : 'var(--border)') : (isCorrect ? 'var(--green-border)' : isSelected ? 'var(--red-border)' : 'var(--border)');
            return (
              <button
                key={opt.id}
                onClick={function () { if (!revealed) setPicked(opt.id); }}
                style={{ textAlign: 'left', background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', fontSize: '0.85rem', color: 'var(--text)', cursor: revealed ? 'default' : 'pointer', lineHeight: 1.5 }}
              >
                <strong>{opt.id.toUpperCase()}.</strong> {opt.text}
              </button>
            );
          })}
        </div>
        {picked && !revealed && (
          <button onClick={handleCheck} style={{ marginTop: '0.75rem', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Check answer
          </button>
        )}
        {revealed && (
          <div className="pal-reveal-in" style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: picked === MCQ_ANSWER ? 'var(--green-bg)' : 'var(--red-bg)', border: '1px solid ' + (picked === MCQ_ANSWER ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong>{picked === MCQ_ANSWER ? 'Correct!' : 'Not quite.'}</strong> In a ride-hailing marketplace, treatment users taking rides affects the supply available to control users. This is direct interference — one user\'s treatment changes another user\'s outcome. Games, emails, and font changes have no cross-user interaction, so user-level randomization works fine. The fix for the ride-hailing case is cluster randomization by city or a geo holdout design.
          </div>
        )}
      </div>

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || 'SUTVA requires that each unit\'s outcome depends only on its own treatment assignment. In marketplaces, social networks, and shared-resource systems, user-level randomization violates this — use cluster or geo-level randomization instead.'}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'SUTVA violations are the most common reason marketplace and social product experiments give misleading results. Recognizing interference is step one; choosing the right randomization unit is the fix.'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="pal-glow-pulse"
          onClick={onNext}
          style={{ padding: '0.7rem 1.75rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
        >
          Next concept →
        </button>
      </div>
    </div>
  );
}
