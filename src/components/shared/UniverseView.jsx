// UniverseView.jsx
// The Analyst Universe — a workflow LOOP map of a product analyst's job.
// 7 stages around ONE ring, in order:
//   Monitor → Diagnose → Understand → Communicate → Design → Analyze → Build → (back to Monitor)
// Each stage node fills with progress in its rooms; the ring itself illuminates
// with overall progress, and clockwise chevrons make it read as one continuous
// loop (not separate subjects). Clicking a stage jumps to its room. Mobile falls
// back to an ordered list.

import { useState } from 'react';

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
    color: 'var(--accent)',
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
const R_RING = 150;   // node ring radius (the loop itself)
const NODE_R = 9;     // stage node radius
const CENTER_R = 34;  // center hub radius

function toRad(deg) { return (deg * Math.PI) / 180; }

// Stage 0 sits at top (-90°); stages run clockwise around the ring.
function stageAngle(idx) { return -90 + (idx * 360) / ARM_COUNT; }

function ringPt(idx, r = R_RING) {
  const a = toRad(stageAngle(idx));
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
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

export function UniverseView({ allRoomProgress, onArmClick }) {
  const [hoveredArm, setHoveredArm] = useState(null);
  const [isMobile] = useState(window.innerWidth < 600);

  const arms = ARM_DEFS.map((arm, idx) => ({
    ...arm,
    idx,
    progress: computeArmProgress(arm, allRoomProgress),
  }));

  const totalProgress = arms.reduce((s, a) => s + a.progress, 0) / arms.length;

  const handleArmClick = (armId) => {
    const roomMap = {
      monitor: 'metrics',
      diagnose: 'rca',
      understand: 'cases',
      communicate: 'behavioral',
      design: 'design',
      analyze: 'review',
      build: 'sql-lab',
    };
    if (onArmClick) onArmClick(roomMap[armId]);
  };

  // ─── Mobile fallback — ordered list ───────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
            Analyst Universe
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', maxWidth: '460px', lineHeight: 1.55 }}>
            Seven stages of the analyst's job, in order — one continuous loop, not separate subjects.
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {arms.map((arm, i) => (
            <div
              key={arm.id}
              onClick={() => handleArmClick(arm.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                cursor: 'pointer', transition: 'all var(--transition)',
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', width: '16px', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: arm.progress > 0 ? arm.color : 'var(--border)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>{arm.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{arm.sublabel}</div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {Math.round(arm.progress * 100)}%
              </div>
            </div>
          ))}
        </div>

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
            {totalProgress === 0 && ' New here? Start with Monitor — it\'s the foundation everything else builds on.'}
          </div>
        </div>
      </div>
    );
  }

  // ─── Desktop — the loop ────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
          Analyst Universe
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', maxWidth: '460px', lineHeight: 1.55 }}>
          The seven stages of the analyst's job, arranged as one loop. Your progress lights up the ring — these are not separate subjects.
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '440px' }}>
        <svg viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          <defs>
            <filter id="nodeGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* faint spokes from hub to each stage */}
          {arms.map(arm => {
            const n = ringPt(arm.idx);
            return <line key={'spoke-' + arm.id} x1={CX} y1={CY} x2={n.x} y2={n.y} stroke="var(--border)" strokeWidth="1" opacity="0.3" />;
          })}

          {/* the loop track */}
          <circle cx={CX} cy={CY} r={R_RING} fill="none" stroke="var(--border)" strokeWidth="2" opacity="0.55" />

          {/* overall progress illuminated around the loop (starts at top, clockwise) */}
          {totalProgress > 0 && (() => {
            const C = 2 * Math.PI * R_RING;
            return (
              <circle
                cx={CX} cy={CY} r={R_RING} fill="none"
                stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={(C * totalProgress) + ' ' + C}
                transform={'rotate(-90 ' + CX + ' ' + CY + ')'}
                opacity="0.7"
              />
            );
          })()}

          {/* clockwise flow chevrons between stages */}
          {arms.map(arm => {
            const mid = stageAngle(arm.idx) + (360 / ARM_COUNT) / 2;
            const p = { x: CX + R_RING * Math.cos(toRad(mid)), y: CY + R_RING * Math.sin(toRad(mid)) };
            return (
              <path
                key={'chev-' + arm.id}
                d="M -3 -4 L 3 0 L -3 4" fill="none"
                stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                opacity="0.5"
                transform={'translate(' + p.x + ' ' + p.y + ') rotate(' + (mid + 90) + ')'}
              />
            );
          })}

          {/* stage nodes */}
          {arms.map(arm => {
            const n = ringPt(arm.idx);
            const started = arm.progress > 0;
            const delay = (arm.idx * 70) + 'ms';
            return (
              <g
                key={'node-' + arm.id}
                onClick={() => handleArmClick(arm.id)}
                onMouseEnter={() => setHoveredArm(arm.id)}
                onMouseLeave={() => setHoveredArm(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={n.x} cy={n.y} r={NODE_R}
                  fill={started ? arm.color : 'var(--surface)'}
                  fillOpacity={started ? (0.3 + arm.progress * 0.7) : 1}
                  stroke={arm.color}
                  strokeWidth={hoveredArm === arm.id ? 2.5 : 2}
                  opacity={started ? 1 : 0.45}
                  filter={hoveredArm === arm.id ? 'url(#nodeGlow)' : undefined}
                  style={{ animation: 'palNodeAppear 0.35s ease-out both', animationDelay: delay, transition: 'stroke-width var(--transition), opacity var(--transition)' }}
                />
                <title>
                  {arm.label}: {Math.round(arm.progress * 100)}%
                  {'\n' + arm.rooms.map(r => {
                    const rp = allRoomProgress.find(x => x.label === r);
                    return rp ? (r + ': ' + rp.completed + '/' + rp.total) : r;
                  }).join('\n')}
                </title>
              </g>
            );
          })}

          {/* stage names — radial, anchored by quadrant (no collisions at 7 evenly-spaced nodes) */}
          {arms.map(arm => {
            const a = stageAngle(arm.idx);
            const c = Math.cos(toRad(a));
            const lx = CX + (R_RING + 26) * c;
            const ly = CY + (R_RING + 26) * Math.sin(toRad(a));
            const anchor = c > 0.25 ? 'start' : c < -0.25 ? 'end' : 'middle';
            const started = arm.progress > 0;
            return (
              <text
                key={'label-' + arm.id}
                x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
                style={{ fontSize: '12px', fontWeight: 700, fill: started ? arm.color : 'var(--text-dim)', fontFamily: 'inherit', opacity: started ? 1 : 0.65, pointerEvents: 'none' }}
              >
                {arm.label}
              </text>
            );
          })}

          {/* center hub — overall % */}
          <circle cx={CX} cy={CY} r={CENTER_R} fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
          <text x={CX} y={CY - 5} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '17px', fontWeight: 800, fill: 'var(--text)', fontFamily: 'inherit' }}>
            {Math.round(totalProgress * 100)}%
          </text>
          <text x={CX} y={CY + 12} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '7px', fontWeight: 700, fill: 'var(--text-muted)', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
            The loop
          </text>
        </svg>
      </div>

      {/* Stage list — carries the room mapping the map keeps clean */}
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {arms.map((arm, i) => (
          <div key={arm.id} onClick={() => handleArmClick(arm.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', width: '14px', flexShrink: 0 }}>{i + 1}</div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: arm.progress > 0 ? arm.color : 'var(--border)', flexShrink: 0 }} />
            <div style={{ width: '170px', flexShrink: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>{arm.label}</div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{arm.sublabel}</div>
            </div>
            <div style={{ flex: 1, height: '4px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: Math.round(arm.progress * 100) + '%', background: arm.color, borderRadius: '999px', transition: 'width 0.4s ease' }} />
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
          {totalProgress === 0 && ' New here? Start with Monitor — it\'s the foundation everything else builds on.'}
        </div>
      </div>
    </div>
  );
}
