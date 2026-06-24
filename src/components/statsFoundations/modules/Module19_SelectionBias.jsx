import { useState } from 'react';
import { Icon } from '../../shared/Icon.jsx';

// Fixed dot data: 25 active (high engagement, high retention) + 15 churned (low engagement, low retention)
const ACTIVE_DOTS = [
  { id: 0,  x: 320, y: 60  }, { id: 1,  x: 355, y: 45  }, { id: 2,  x: 380, y: 75  },
  { id: 3,  x: 400, y: 55  }, { id: 4,  x: 340, y: 90  }, { id: 5,  x: 365, y: 110 },
  { id: 6,  x: 395, y: 95  }, { id: 7,  x: 415, y: 70  }, { id: 8,  x: 430, y: 50  },
  { id: 9,  x: 445, y: 85  }, { id: 10, x: 310, y: 125 }, { id: 11, x: 345, y: 140 },
  { id: 12, x: 375, y: 130 }, { id: 13, x: 405, y: 120 }, { id: 14, x: 430, y: 105 },
  { id: 15, x: 450, y: 65  }, { id: 16, x: 460, y: 95  }, { id: 17, x: 470, y: 115 },
  { id: 18, x: 325, y: 165 }, { id: 19, x: 355, y: 155 }, { id: 20, x: 385, y: 150 },
  { id: 21, x: 415, y: 145 }, { id: 22, x: 440, y: 135 }, { id: 23, x: 465, y: 140 },
  { id: 24, x: 480, y: 80  },
];

const CHURNED_DOTS = [
  { id: 25, x: 50,  y: 210 }, { id: 26, x: 80,  y: 195 }, { id: 27, x: 110, y: 220 },
  { id: 28, x: 65,  y: 235 }, { id: 29, x: 95,  y: 245 }, { id: 30, x: 130, y: 205 },
  { id: 31, x: 150, y: 230 }, { id: 32, x: 55,  y: 255 }, { id: 33, x: 170, y: 215 },
  { id: 34, x: 115, y: 255 }, { id: 35, x: 145, y: 260 }, { id: 36, x: 90,  y: 268 },
  { id: 37, x: 175, y: 250 }, { id: 38, x: 60,  y: 270  }, { id: 39, x: 130, y: 270 },
];

const EXAMPLES = [
  {
    icon: 'rocket',
    title: 'Onboarding analysis',
    desc: 'Users who completed setup look great. But 40% dropped before completing — they\'re missing from your analysis.',
  },
  {
    icon: 'clipboard',
    title: 'Feature satisfaction surveys',
    desc: 'Only engaged users respond. Churned users — who might have left because of the feature — never answer.',
  },
  {
    icon: 'bar-chart',
    title: 'Retention cohort',
    desc: 'Only users who stayed are in your "retained users" analysis. You\'re measuring the survivors\' behavior.',
  },
];

export function Module19_SelectionBias({ module, onNext }) {
  const [showAll, setShowAll] = useState(true);

  const allAvgEngagement = 3.2;
  const activeAvgEngagement = 7.8;

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          You\'re running a "power users" study to understand what makes users successful. You pull everyone who\'s been active for 6+ months and analyze their behavior. The engagement metrics look fantastic. But you\'re only looking at users who stayed — what about the ones who churned in month 2? They\'re invisible in your data, and they\'re systematically different.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          Selection bias means your sample is not representative of the population you care about. Every dashboard that only shows active users is biased. Every survey that only reaches respondents who bother to reply is biased. Toggle the filter below to see how excluding churned users inflates your metrics.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Toggle the Survivorship Filter</div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        <strong>Selection bias</strong> occurs when the data you analyze isn't a random sample of the population you care about.
        The missing data is not random — it's <em>systematically different</em>. In product analytics, churned users are
        almost always missing from dashboards, which inflates every quality metric you see.
      </p>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Start with "Show All Users" to see the full population including churned users. Then switch to "Show Only Active Users" to replicate what most dashboards show. Watch the engagement metric jump upward and notice the inflation factor — that is selection bias inflating every quality metric you report.
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>View:</span>
        {[
          { label: 'Show All Users', val: true },
          { label: 'Show Only Active Users (what your dashboard shows)', val: false },
        ].map(opt => (
          <button key={String(opt.val)} onClick={() => setShowAll(opt.val)} style={{
            padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-sm)',
            border: `1.5px solid ${showAll === opt.val ? 'var(--accent)' : 'var(--border)'}`,
            background: showAll === opt.val ? 'var(--accent-bg)' : 'var(--surface)',
            color: showAll === opt.val ? 'var(--accent)' : 'var(--text-muted)',
            fontSize: '0.82rem', fontWeight: showAll === opt.val ? 700 : 500, cursor: 'pointer',
          }}>{opt.label}</button>
        ))}
      </div>

      {/* Scatter plot */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Engagement vs Retention — {showAll ? 'all 40 users visible' : '15 churned users hidden'}
        </div>
        <svg viewBox="0 0 500 285" width="100%">
          <defs>
            <clipPath id="sb-plot-clip">
              <rect x={35} y={10} width={461} height={261} />
            </clipPath>
          </defs>

          {/* Axes */}
          <line x1={35} y1={10} x2={35} y2={270} stroke="var(--border)" strokeWidth={1.5} />
          <line x1={35} y1={270} x2={495} y2={270} stroke="var(--border)" strokeWidth={1.5} />

          {/* Axis labels */}
          <text x={265} y={283} textAnchor="middle" fontSize={9} fill="var(--text-muted)">Engagement (events/day) →</text>
          <text x={12} y={145} textAnchor="middle" fontSize={9} fill="var(--text-muted)" transform="rotate(-90, 12, 145)">Retention (days) →</text>

          {/* Quadrant hint labels */}
          <text x={430} y={35} textAnchor="middle" fontSize={9} fill="var(--text-muted)" opacity={0.6}>High retention</text>
          <text x={430} y={46} textAnchor="middle" fontSize={9} fill="var(--text-muted)" opacity={0.6}>High engagement</text>
          <text x={105} y={260} textAnchor="middle" fontSize={9} fill="var(--text-muted)" opacity={0.6}>Low engagement / churned</text>

          {/* All dots clipped to the plot area so none overflow the axes */}
          <g clipPath="url(#sb-plot-clip)">
            {/* Active dots (yellow, always visible) */}
            {ACTIVE_DOTS.map(d => (
              <circle key={d.id} cx={d.x} cy={d.y} r={7}
                fill="var(--yellow)" stroke="var(--yellow-text)" strokeWidth={1.5} opacity={0.85} />
            ))}

            {/* Churned dots (fade out when showAll=false) */}
            {CHURNED_DOTS.map(d => (
              <circle key={d.id} cx={d.x} cy={d.y} r={7}
                fill={showAll ? '#8888' : '#3333'}
                stroke={showAll ? 'var(--text-muted)' : 'transparent'}
                strokeWidth={1.5}
                style={{ transition: 'fill 0.4s ease, stroke 0.4s ease' }}
                opacity={showAll ? 0.7 : 0.15}
              />
            ))}
          </g>

          {/* Legend */}
          <circle cx={50} cy={18} r={6} fill="var(--yellow)" stroke="var(--yellow-text)" strokeWidth={1.5} />
          <text x={60} y={22} fontSize={9} fill="var(--text-muted)">Active users (visible)</text>
          <circle cx={170} cy={18} r={6} fill="#8888" stroke="var(--text-muted)" strokeWidth={1.5} opacity={showAll ? 0.7 : 0.3} />
          <text x={180} y={22} fontSize={9} fill="var(--text-muted)" opacity={showAll ? 1 : 0.4}>Churned users ({showAll ? 'visible' : 'hidden from dashboard'})</text>
        </svg>
      </div>

      {/* Metrics panel */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 160, borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
          background: showAll ? 'var(--surface-2)' : 'var(--surface-2)',
          border: '1px solid var(--border)',
          opacity: showAll ? 1 : 0.4,
          transition: 'opacity 0.4s ease',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            All users avg engagement
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
            {allAvgEngagement} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>events/day</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>n = 40</div>
        </div>
        <div style={{
          flex: 1, minWidth: 160, borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
          background: !showAll ? 'var(--red-bg)' : 'var(--surface-2)',
          border: `1px solid ${!showAll ? 'var(--red-border)' : 'var(--border)'}`,
          transition: 'background 0.4s ease, border-color 0.4s ease',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: !showAll ? 'var(--red)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Active users only avg engagement
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: !showAll ? 'var(--red)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
            {activeAvgEngagement} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>events/day</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>n = 25 {!showAll && '← inflated!'}</div>
        </div>
        {!showAll && (
          <div className="pal-reveal-in" style={{ flex: 1, minWidth: 160, background: 'var(--red-bg)', border: '1.5px solid var(--red-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Inflation factor</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
              +{((activeAvgEngagement / allAvgEngagement - 1) * 100).toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: '0.25rem' }}>vs true population</div>
          </div>
        )}
      </div>

      {/* Product examples */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Where this shows up in product analytics
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {EXAMPLES.map((ex, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ flexShrink: 0 }}><Icon name={ex.icon} size={18} color='var(--teal)' /></span>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>{ex.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ex.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection}
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
