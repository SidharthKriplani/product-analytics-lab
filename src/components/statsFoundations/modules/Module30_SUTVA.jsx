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

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

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

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          Every causal inference method we've covered — A/B tests, DiD, RD, IV — rests on a shared assumption so fundamental that it's often stated once and then forgotten: the potential outcome for any unit depends only on that unit's treatment assignment, not on the treatment assigned to other units.
        </p>
        <p style={prose}>
          This is the <strong style={{ color: 'var(--text)' }}>Stable Unit Treatment Value Assumption (SUTVA)</strong>. For a button color change or a font size test, this assumption seems trivially true. For referral programs, social feeds, marketplaces, recommendation engines, and shared inventory — this assumption is violated, often severely.
        </p>
        <p style={prose}>
          Consider a referral program experiment. Treatment users refer their friends. Some referred friends are randomly assigned to the control group. But their presence in the product — their behavior, their word-of-mouth — is entirely a product of the treatment group's referral behavior. The control group's outcomes have been changed by the treatment group's treatment. Your comparison no longer measures "treatment vs. no treatment." It measures "treatment vs. treatment spillovers."
        </p>
        <p style={prose}>
          Three product contexts where SUTVA violations are nearly guaranteed: <strong style={{ color: 'var(--text)' }}>marketplace experiments</strong> (treatment sellers attract buyers from control sellers), <strong style={{ color: 'var(--text)' }}>social and feed experiments</strong> (treatment users' content reaches control users through the shared platform), and <strong style={{ color: 'var(--text)' }}>communication experiments</strong> (users mention offers to friends in the control group through physical word-of-mouth).
        </p>
        <p style={prose}>
          The fix requires raising the randomization unit above the level where interactions occur. For referrals and social networks: <strong style={{ color: 'var(--text)' }}>cluster randomization</strong> — assign whole friend groups or geographic areas. For marketplaces: <strong style={{ color: 'var(--text)' }}>two-sided randomization</strong> or holdout markets. For time-based interference: <strong style={{ color: 'var(--text)' }}>switchback designs</strong> with washout periods.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You're running an A/B test on a referral feature. Treatment users can invite friends; control users can't. A referred friend of a treatment user gets randomly assigned to the control group. In what specific way does this contaminate your control group's metric?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Interference Visualizer</div>

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
          SUTVA has two conditions: (1) no interference between units — one user's treatment does not affect another user's outcome, and (2) no hidden versions of treatment — every treated user receives the same treatment. When either breaks, the standard A/B test estimator is biased. Fixes include cluster randomization (randomize cities, not users), geo holdouts (treat entire regions), and switchback experiments (alternate treatment over time periods).
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
            <strong>{picked === MCQ_ANSWER ? 'Correct!' : 'Not quite.'}</strong> In a ride-hailing marketplace, treatment users taking rides affects the supply available to control users. This is direct interference — one user's treatment changes another user's outcome. Games, emails, and font changes have no cross-user interaction, so user-level randomization works fine. The fix for the ride-hailing case is cluster randomization by city or a geo holdout design.
          </div>
        )}
      </div>

      {/* What you should have confirmed */}
      {revealed && (
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Referred friends of treatment users who land in the control group have unusually high conversion rates — they were referred, so they're warm leads with social trust. The control group's conversion rate goes up, but only because some control users were indirectly influenced by the treatment. The treatment effect estimate shrinks, because the gap between treatment and contaminated control is smaller than the true gap between treatment and a clean no-referral world. The slider makes the contamination path legible: you can see exactly how increasing interference erodes the measured effect.
        </p>
      </div>
      )}

      {/* ── Analyst Move ── */}
      {revealed && (
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Before designing any experiment on a social, marketplace, or referral feature, explicitly ask: "can treatment users affect control users?" If yes, user-level randomization is invalid. Identify the unit at which interactions occur and randomize above that level. For geographically segmented products, this often means market-level holdouts.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> When you see an experiment where control group metrics improved unexpectedly during the test — not because you changed anything for them — investigate spillover first. Treatment group improvements contaminating the control are the most common explanation for mysteriously rising control baselines.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> SUTVA violations don't always invalidate the experiment — they change what you can claim. If spillovers help the control, your experiment underestimates the full effect. If spillovers hurt the control, it overestimates. Knowing the direction of the violation lets you bound the true effect. An A/B test with known positive spillovers gives you a lower bound on the true treatment effect — still useful information, with the right framing.</p>
        </div>
      </div>
      )}

      {/* ── Connection ── */}
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
          style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
        >
          Next concept →
        </button>
      </div>
    </div>
  );
}
