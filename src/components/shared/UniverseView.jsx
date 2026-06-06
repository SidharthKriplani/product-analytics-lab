// UniverseView.jsx
// The Analyst Universe — star map showing the interconnected workflow of a product analyst.
// 7 arms correspond to the real BA/PM job loop:
//   Monitor → Diagnose → Understand → Communicate → Design → Analyze → Build
// Arms illuminate based on progress in their rooms (from Progress.jsx allRoomProgress).
// V1: static, no animation. Toggle on Progress page.
// To soft-disable: set SHOW_UNIVERSE_TOGGLE = false in Progress.jsx without removing code.

const ARM_DEFS = [
  {
    id: 'monitor',
    label: 'Monitor',
    sublabel: 'Metrics · BI · Growth',
    rooms: ['Metrics', 'BI', 'Growth Analytics', 'Instrumentation', 'Metrics Foundations'],
    color: '#22c55e',
    cssColor: 'var(--green)',
  },
  {
    id: 'diagnose',
    label: 'Diagnose',
    sublabel: 'RCA · Spot the Flaw',
    rooms: ['RCA', 'Spot the Flaw', 'RCA Foundations'],
    color: '#a855f7',
    cssColor: 'var(--purple)',
  },
  {
    id: 'understand',
    label: 'Understand',
    sublabel: 'Cases · Product Design · Prioritization',
    rooms: ['Cases', 'Product Design', 'Prioritization'],
    color: '#ec4899',
    cssColor: 'var(--red)',
  },
  {
    id: 'communicate',
    label: 'Communicate',
    sublabel: 'Behavioral · Estimation',
    rooms: ['Behavioral', 'Estimation'],
    color: '#f59e0b',
    cssColor: 'var(--yellow)',
  },
  {
    id: 'design',
    label: 'Design',
    sublabel: 'A/B Design · Exp Foundations',
    rooms: ['Design', 'Exp Foundations'],
    color: '#6366f1',
    cssColor: 'var(--accent)',
  },
  {
    id: 'analyze',
    label: 'Analyze',
    sublabel: 'A/B Review · Stats · Challenges',
    rooms: ['Review', 'Stats', 'Stat Foundations', 'Challenges'],
    color: '#14b8a6',
    cssColor: 'var(--teal)',
  },
  {
    id: 'build',
    label: 'Build',
    sublabel: 'SQL Lab · Code',
    rooms: ['SQL Lab', 'Code'],
    color: '#3b82f6',
    cssColor: 'var(--accent)',
  },
];

const ARM_COUNT = ARM_DEFS.length;
const CX = 260;
const CY = 260;
const ARM_LENGTH = 155;
const INNER_NODE_R = 4;
const OUTER_NODE_R = 7;
const CENTER_R = 28;

function toRad(deg) { return (deg * Math.PI) / 180; }

function armAngle(idx) {
  // Start from -90deg (top), go clockwise
  return -90 + (idx * 360) / ARM_COUNT;
}

function armEndpoint(idx, fraction) {
  const a = toRad(armAngle(idx));
  return {
    x: CX + ARM_LENGTH * fraction * Math.cos(a),
    y: CY + ARM_LENGTH * fraction * Math.cos(a - Math.PI / 2) * -1,
  };
  // simplified:
}

function pt(idx, fraction) {
  const a = toRad(armAngle(idx));
  return {
    x: CX + ARM_LENGTH * fraction * Math.cos(a),
    y: CY + ARM_LENGTH * fraction * Math.sin(a),
  };
}

function labelPt(idx) {
  const a = toRad(armAngle(idx));
  const dist = ARM_LENGTH + 26;
  return {
    x: CX + dist * Math.cos(a),
    y: CY + dist * Math.sin(a),
  };
}

function sublabelPt(idx) {
  const a = toRad(armAngle(idx));
  const dist = ARM_LENGTH + 40;
  return {
    x: CX + dist * Math.cos(a),
    y: CY + dist * Math.sin(a),
  };
}

function computeArmProgress(arm, allRoomProgress) {
  const fractions = arm.rooms.map(roomLabel => {
    const r = allRoomProgress.find(x => x.label === roomLabel);
    if (!r || r.total === 0) return 0;
    return r.completed / r.total;
  }).filter(f => f >= 0);
  if (fractions.length === 0) return 0;
  return fractions.reduce((a, b) => a + b, 0) / fractions.length;
}

export function UniverseView({ allRoomProgress }) {
  const arms = ARM_DEFS.map((arm, idx) => ({
    ...arm,
    idx,
    progress: computeArmProgress(arm, allRoomProgress),
    angle: armAngle(idx),
  }));

  const totalProgress = arms.reduce((s, a) => s + a.progress, 0) / arms.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

      {/* Universe label */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
          Analyst Universe
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', maxWidth: '460px', lineHeight: 1.55 }}>
          Every arm is a step in the real analyst workflow — from monitoring your metrics to building the fix. They are not separate subjects. They are one loop.
        </div>
      </div>

      {/* SVG star map */}
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <svg
          viewBox="0 0 520 520"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        >
          {/* Background dim lines (full arm length) */}
          {arms.map(arm => {
            const outer = pt(arm.idx, 1);
            return (
              <line
                key={'bg-' + arm.id}
                x1={CX} y1={CY}
                x2={outer.x} y2={outer.y}
                stroke={arm.color}
                strokeWidth="1.5"
                opacity="0.12"
              />
            );
          })}

          {/* Progress lines (illuminated + animated draw) */}
          {arms.map(arm => {
            if (arm.progress === 0) return null;
            const lit = pt(arm.idx, Math.max(0.08, arm.progress));
            const delay = (arm.idx * 70) + 'ms';
            return (
              <line
                key={'lit-' + arm.id}
                x1={CX} y1={CY}
                x2={lit.x} y2={lit.y}
                stroke={arm.color}
                strokeWidth="2.5"
                opacity="0.85"
                strokeDasharray="160"
                strokeDashoffset="0"
                className="pal-arm-draw"
                style={{ animation: 'palArmDraw 0.55s ease-out both', animationDelay: delay }}
              />
            );
          })}

          {/* Inner foundation checkpoint nodes */}
          {arms.map(arm => {
            const inner = pt(arm.idx, 0.42);
            const done = arm.progress >= 0.2;
            const delay = (arm.idx * 70 + 300) + 'ms';
            return (
              <circle
                key={'inner-' + arm.id}
                cx={inner.x}
                cy={inner.y}
                r={INNER_NODE_R}
                fill={done ? arm.color : 'var(--bg)'}
                stroke={arm.color}
                strokeWidth="1.5"
                opacity={done ? 0.9 : 0.3}
                className="pal-node-appear"
                style={{ animation: 'palNodeAppear 0.3s ease-out both', animationDelay: delay }}
              >
                <title>{arm.label}: {Math.round(arm.progress * 100)}% complete — {arm.sublabel}</title>
              </circle>
            );
          })}

          {/* Outer endpoint nodes */}
          {arms.map(arm => {
            const outer = pt(arm.idx, 1);
            const done = arm.progress >= 0.75;
            const started = arm.progress > 0;
            const delay = (arm.idx * 70 + 400) + 'ms';
            return (
              <circle
                key={'outer-' + arm.id}
                cx={outer.x}
                cy={outer.y}
                r={OUTER_NODE_R}
                fill={done ? arm.color : 'var(--bg)'}
                stroke={arm.color}
                strokeWidth={started ? '2' : '1.5'}
                opacity={started ? 1 : 0.25}
                className="pal-node-appear"
                style={{ animation: 'palNodeAppear 0.3s ease-out both', animationDelay: delay }}
              >
                <title>{arm.label}: {Math.round(arm.progress * 100)}% complete</title>
              </circle>
            );
          })}

          {/* Arm labels */}
          {arms.map(arm => {
            const lp = labelPt(arm.idx);
            const sp = sublabelPt(arm.idx);
            const angle = arm.angle;
            // Text anchor based on which side of the diagram
            const anchor = angle > -45 && angle < 45 ? 'middle'
              : angle >= 45 && angle < 135 ? 'middle'
              : angle >= 135 || angle < -135 ? 'middle'
              : 'middle';
            const textAnchor = Math.cos(toRad(angle)) > 0.3 ? 'start'
              : Math.cos(toRad(angle)) < -0.3 ? 'end'
              : 'middle';

            return (
              <g key={'label-' + arm.id}>
                <text
                  x={lp.x}
                  y={lp.y}
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    fill: arm.progress > 0 ? arm.color : 'var(--text-dim)',
                    fontFamily: 'inherit',
                    opacity: arm.progress > 0 ? 1 : 0.5,
                  }}
                >
                  {arm.label}
                </text>
                <text
                  x={sp.x}
                  y={sp.y}
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  style={{
                    fontSize: '8.5px',
                    fill: 'var(--text-dim)',
                    fontFamily: 'inherit',
                    opacity: 0.65,
                  }}
                >
                  {arm.sublabel}
                </text>
              </g>
            );
          })}

          {/* Center circle */}
          <circle
            cx={CX} cy={CY} r={CENTER_R}
            fill="var(--surface)"
            stroke="var(--border)"
            strokeWidth="1.5"
          />
          {/* Center progress ring */}
          {totalProgress > 0 && (
            <circle
              cx={CX} cy={CY}
              r={CENTER_R}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeDasharray={`${totalProgress * 2 * Math.PI * CENTER_R} ${2 * Math.PI * CENTER_R}`}
              strokeDashoffset={2 * Math.PI * CENTER_R * 0.25}
              opacity="0.6"
            />
          )}
          <text
            x={CX} y={CY - 5}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: '9px', fontWeight: 700, fill: 'var(--text-muted)', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Product
          </text>
          <text
            x={CX} y={CY + 7}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: '9px', fontWeight: 700, fill: 'var(--text-muted)', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Analyst
          </text>
        </svg>
      </div>

      {/* Arm progress list */}
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {arms.map(arm => (
          <div key={arm.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: arm.progress > 0 ? arm.color : 'var(--border)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', width: '90px', flexShrink: 0 }}>
              {arm.label}
            </div>
            <div style={{ flex: 1, height: '4px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round(arm.progress * 100)}%`, background: arm.color, borderRadius: '999px', transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: '32px', textAlign: 'right', flexShrink: 0 }}>
              {Math.round(arm.progress * 100)}%
            </div>
          </div>
        ))}
      </div>

      {/* Workflow narrative */}
      <div style={{
        width: '100%', maxWidth: '480px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderLeft: '3px solid var(--accent)',
        borderRadius: 'var(--radius)', padding: '0.875rem 1rem',
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
          The loop
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
          Metric drops → RCA → understand product behavior → communicate impact → design the fix → run the experiment → analyze the result → monitor the metric again.
          Every room in PAL is one step in this loop.
        </div>
      </div>
    </div>
  );
}
