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

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

export function Module19_SelectionBias({ module, onNext }) {
  const [showAll, setShowAll] = useState(true);

  const allAvgEngagement = 3.2;
  const activeAvgEngagement = 7.8;

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          Every dataset is a filtered view of reality. Not all observations make it into your data. Some users opt out of tracking. Some sessions do not complete. Some churned users stop generating events entirely. The question is never whether your data is filtered — it always is. The question is whether that filter is correlated with what you are trying to measure.
        </p>
        <p style={prose}>
          When it is, your conclusions are systematically wrong in a predictable direction. This is <strong style={{ color: 'var(--text)' }}>selection bias</strong>.
        </p>
        <p style={prose}>
          <strong style={{ color: 'var(--text)' }}>Survivorship bias</strong> is the most dramatic form: you can only observe outcomes for units that survived some filtering process, and the filter is correlated with success. The most famous case is from World War II. Engineers analyzed bullet damage on aircraft returning from missions and proposed reinforcing the most-damaged areas. Statistician Abraham Wald stopped them: you are only seeing planes that came back. The damaged areas on returning planes are areas where planes can be hit and still return. The areas with no damage are where planes were hit and did not return — because hits there were fatal. Reinforce the undamaged areas. The engineers had access only to survivors and were missing everything the dead planes could tell them.
        </p>
        <p style={prose}>
          This structure appears constantly in product analytics. You analyze the behavior of your active users to understand what drives retention. You study their session frequency, feature adoption, support interaction. The problem: you are studying survivors. Users who churned stopped generating data before you analyzed them. Their early behavior — the signals that preceded their departure — is systematically underrepresented in your dataset.
        </p>
        <p style={prose}>
          You survey users about product satisfaction. You get a 12% response rate. You report the satisfaction score from respondents. The problem: users who are very unhappy are disproportionately likely to either respond angrily or disengage completely (including not responding to surveys). Your 12% may be both the loudest advocates and the most vocal critics — not the silent majority.
        </p>
        <p style={prose}>
          In every case, the filter (completing the experiment, responding to the survey, completing checkout) is correlated with the outcome. The missing observations are not missing randomly — they are missing because they are on the wrong side of a process related to your question.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You are studying what predicts long-term customer value (LTV) by analyzing your top 20% of customers. What are you systematically missing, and how does it bias your conclusions?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Toggle the Survivorship Filter</div>

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
        <svg viewBox="0 0 500 285" width="100%" style={{ maxWidth: 500, display: 'block', margin: '0 auto' }}>
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

      {/* ── What you should have confirmed ── */}
      {!showAll && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            By studying only the top 20%, you have already filtered for the outcome you are trying to predict. Any feature that appears in the top 20% at a high rate might be equally common in churned users — but you cannot see that. When the churned cohort is revealed, features you thought were "predictors of LTV" turn out to be present in churned users too. They are not predictors of success; they are predictors of engagement level generally. The real predictors emerge only when you can compare successful vs. unsuccessful users.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      {!showAll && (
        <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> In every cohort or funnel analysis, your starting population is the denominator — not the survivors. Users who entered the funnel but did not convert belong in your analysis. Cohort members who churned in month 1 belong in your retention analysis. The moment you drop them from the analysis, you are studying a biased subset.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> When someone proposes "studying our power users to understand what drives success" — reframe: study what distinguishes future power users from future churners, using behavior from their first week when both groups looked similar. You need a comparison group. Without one, you are doing survivorship analysis.</p>
            <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Whenever data is missing, ask: is this missing randomly or for a reason? Missing at random means your analysis on the observed data is still valid. Missing for a reason correlated with your outcome means your analysis is biased. "I don't know why it's missing" is not the same as "it's missing randomly." Default to skepticism, not assumption.</p>
          </div>
        </div>
      )}

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'Experiments avoid survivorship bias by randomizing before any filtering occurs — every user assigned to a variant is counted in the denominator, whether they converted or not. When you analyze only converters, you re-introduce selection bias into an otherwise valid experiment. Intent-to-treat analysis is the fix: analyze by assignment, not by completion.'}
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
