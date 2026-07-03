// src/pages/CheatSheet.jsx
// Last-minute interview prep reference. Two sections:
//   1. Prep Plans — time-boxed (Last Week / 3 Days / Last Day / Last Hours)
//   2. Quick Reference — collapsible cheat sheets per topic
// Casefile mode. No auth gate. Free for all.

import { useState } from 'react';
import { AddTrackBtn } from '../components/tracks/AddToTrackPopover.jsx';

// ─── Data ─────────────────────────────────────────────────────────────────

const PREP_PLANS = [
  {
    id: 'week',
    label: 'Last Week',
    sublabel: '7+ days out',
    color: '#2D9C6A',
    intent: 'Real learning time. Go deep, build reps, fix known gaps.',
    steps: [
      { label: 'Run 3 full cases per day', detail: 'Mix Metrics, RCA, and Scenarios. Don\'t repeat the same room two days in a row.', room: 'cases-runner' },
      { label: 'Complete any unfinished Foundation rooms', detail: 'Stats Foundations → Metrics Foundations → RCA Foundations → A/B Foundations. In that order if you haven\'t done them.', room: 'foundations' },
      { label: '10 SQL problems per day', detail: 'Start Easy, move to Medium by day 3. Do at least 2 Forensic problems per day — these train trap detection.', room: 'sql-lab' },
      { label: 'One Company Track end-to-end', detail: 'Pick the company you\'re targeting. Read the mental model, run all the cases, read the director pressure cards.', room: 'company-tracks' },
      { label: 'Run Full Loop once', detail: 'The 5-phase investigation (Problem → Decomp → Schema → SQL → Synthesis) is the closest PAL gets to a real take-home.', room: 'full-loop-runner' },
    ],
  },
  {
    id: 'days3',
    label: 'Last 3 Days',
    sublabel: '2–4 days out',
    color: '#2457D6',
    intent: 'Targeted reinforcement. No new material after day 2.',
    steps: [
      { label: 'Identify your 2 weakest rooms', detail: 'Check Progress page. Lowest completion % or most recent wrong answers. Focus only on those.', room: 'progress' },
      { label: '5 cases per day in weak rooms only', detail: 'Repetition on your actual gaps — not the rooms you\'re already comfortable in.', room: null },
      { label: 'Forensic SQL batch (f01–f25)', detail: 'All 25 forensic problems. These are short. The point is trap recognition — integer division, NULL in NOT IN, wrong GROUP BY dimension.', room: 'sql-lab' },
      { label: 'Ship/No-Ship decisions — 5 scenarios', detail: 'These are the highest-signal interview moment. Practice reading ambiguous readouts and making a call.', room: 'runner' },
      { label: 'No new material on day 3', detail: 'Day 3 is consolidation only. Review, don\'t learn. Trust what you\'ve built.', room: null },
    ],
  },
  {
    id: 'day1',
    label: 'Last Day',
    sublabel: 'Day before',
    color: '#C97706',
    intent: 'Judgment only. Nothing that requires deep recall.',
    steps: [
      { label: 'Run 3 Ship/No-Ship scenarios', detail: 'Scenario room. Focus on your reasoning out loud — not the answer, the path.', room: 'runner' },
      { label: 'One full RCA case', detail: 'Pick one you haven\'t seen. Go through all phases. Read the debrief carefully.', room: 'rca-runner' },
      { label: 'One metrics design case', detail: 'Focus on north star → guardrail → diagnostic decomposition. The framing matters more than the answer.', room: 'metrics-runner' },
      { label: 'Review Company Track mental model card', detail: 'If you have a target company — read their mental model card once slowly. The MECE drivers and non-negotiables.', room: 'company-tracks' },
      { label: 'Scan the cheat sheet once', detail: 'Go through Quick Reference below. Don\'t study it — just let it land.', room: null },
      { label: 'Stop by 9pm', detail: 'Nothing you do in the last 2 hours will help. Sleep is better prep.', room: null },
    ],
  },
  {
    id: 'hours',
    label: 'Last Few Hours',
    sublabel: 'Day of interview',
    color: '#D63860',
    intent: 'Scan only. No practice. Calm the nervous system.',
    steps: [
      { label: 'SQL date/time cheat sheet', detail: 'Interval syntax, DATE_TRUNC, EXTRACT. The stuff that blanks under pressure.', room: null },
      { label: 'Window functions quick reference', detail: 'ROW_NUMBER vs RANK, LAG/LEAD, running totals. Confirm the PARTITION BY reflex.', room: null },
      { label: 'RCA first-cut checklist', detail: 'Data issue → internal change → external → segment. The routing, not the analysis.', room: null },
      { label: 'Eat something. Stop studying 1 hour before.', detail: 'Seriously. Your recall is better when you\'re not in fight-or-flight.', room: null },
    ],
  },
];

export const CHEAT_SECTIONS = [
  {
    id: 'sql-datetime',
    label: 'SQL — Date & Time',
    color: '#5B4CF6',
    blocks: [
      {
        title: 'Current timestamps',
        code:
`SELECT
  current_date,                          -- date only: 2026-06-17
  current_time,                          -- time only: 14:32:00
  now(),                                 -- full timestamp with timezone
  current_timestamp                      -- same as now()`,
      },
      {
        title: 'Interval arithmetic',
        code:
`-- Adding intervals
now() + interval '3 days'
now() + interval '1 week'
now() + interval '10 minutes'
now() + interval '45 seconds'
current_date - interval '30 days'

-- Mixed units
now() + interval '1 day 3 hours 15 minutes'`,
      },
      {
        title: 'Truncate & extract',
        code:
`-- Truncate to period boundary
DATE_TRUNC('day',   created_at)   -- 2026-06-17 00:00:00
DATE_TRUNC('week',  created_at)   -- Monday of that week
DATE_TRUNC('month', created_at)   -- first of month
DATE_TRUNC('hour',  created_at)

-- Extract a part
EXTRACT(DOW   FROM created_at)    -- 0=Sun, 6=Sat
EXTRACT(HOUR  FROM created_at)
EXTRACT(MONTH FROM created_at)
EXTRACT(YEAR  FROM created_at)`,
      },
      {
        title: 'Date diff & casting',
        code:
`-- Days between two dates
event_date::date - signup_date::date      -- integer days (Postgres)
DATEDIFF('day', signup_date, event_date)  -- Snowflake/BigQuery

-- Cast to date to drop time part
created_at::date
CAST(created_at AS DATE)

-- Format a date/timestamp as text (Postgres)
to_char(created_at, 'YYYY-MM')     -- '2026-06'
EXTRACT(DOW FROM created_at)       -- day of week 0–6
to_char(created_at, 'YYYY-MM-DD')  -- date string`,
      },
    ],
  },
  {
    id: 'window-fns',
    label: 'SQL — Window Functions',
    color: '#2457D6',
    blocks: [
      {
        title: 'Ranking',
        code:
`-- ROW_NUMBER: unique rank, no ties
ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC)

-- RANK: ties get same rank, next rank skips (1,1,3)
RANK() OVER (PARTITION BY category ORDER BY revenue DESC)

-- DENSE_RANK: ties get same rank, no skip (1,1,2)
DENSE_RANK() OVER (ORDER BY score DESC)

-- Top-1 per group pattern
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
  FROM events
) t WHERE rn = 1`,
      },
      {
        title: 'LAG / LEAD',
        code:
`-- Previous row value
LAG(revenue, 1, 0) OVER (PARTITION BY user_id ORDER BY date)
--           ^  ^ offset  ^ default if null

-- Next row value
LEAD(event_type, 1) OVER (PARTITION BY session_id ORDER BY ts)

-- MoM change pattern
revenue - LAG(revenue, 1) OVER (PARTITION BY product ORDER BY month)`,
      },
      {
        title: 'Running totals & aggregates',
        code:
`-- Running sum
SUM(revenue) OVER (PARTITION BY user_id ORDER BY date
                   ROWS UNBOUNDED PRECEDING)

-- Rolling 7-day average
AVG(daily_active) OVER (ORDER BY date
                         ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)

-- Partition total (for % share)
SUM(revenue) OVER (PARTITION BY category)  -- no ORDER BY = full partition`,
      },
      {
        title: 'NTILE / PERCENT_RANK',
        code:
`-- Quartiles (1=top 25%, 4=bottom 25% if DESC)
NTILE(4) OVER (ORDER BY score DESC)

-- Percentile rank (0 to 1)
PERCENT_RANK() OVER (ORDER BY revenue)

-- Cumulative distribution
CUME_DIST() OVER (ORDER BY revenue)`,
      },
    ],
  },
  {
    id: 'sql-patterns',
    label: 'SQL — Analytics Patterns',
    color: '#007C89',
    blocks: [
      {
        title: 'Funnel (step sequence)',
        code:
`SELECT
  COUNT(DISTINCT user_id)                              AS step1_visit,
  COUNT(DISTINCT CASE WHEN did_add_to_cart THEN user_id END)  AS step2_atc,
  COUNT(DISTINCT CASE WHEN did_checkout    THEN user_id END)  AS step3_checkout,
  COUNT(DISTINCT CASE WHEN did_purchase    THEN user_id END)  AS step4_purchase
FROM user_events
WHERE date >= current_date - interval '7 days'`,
      },
      {
        title: 'Retention (Day-N cohort)',
        code:
`SELECT
  DATE_TRUNC('day', u.signup_date) AS cohort,
  e.day_offset,
  COUNT(DISTINCT e.user_id) AS retained,
  COUNT(DISTINCT u.user_id) AS cohort_size
FROM users u
LEFT JOIN (
  SELECT user_id,
    (event_date::date - signup_date::date) AS day_offset
  FROM events JOIN users USING (user_id)
) e ON u.user_id = e.user_id AND e.day_offset IN (1, 7, 14, 30)
GROUP BY 1, 2`,
      },
      {
        title: 'Deduplication (keep latest)',
        code:
`-- Keep one row per user (most recent)
SELECT * FROM (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) AS rn
  FROM records
) t WHERE rn = 1`,
      },
      {
        title: 'NULL traps to remember',
        code:
`-- NOT IN fails silently with NULLs in subquery
-- WRONG: returns 0 rows if subquery has any NULL
WHERE user_id NOT IN (SELECT user_id FROM banned_users)

-- RIGHT: use NOT EXISTS or filter NULLs
WHERE NOT EXISTS (
  SELECT 1 FROM banned_users b WHERE b.user_id = u.user_id
)

-- NULL in AVG is ignored (correct)
-- NULL in COUNT(*) is counted, COUNT(col) ignores NULLs
-- NULL in SUM is ignored — COALESCE if you need 0`,
      },
    ],
  },
  {
    id: 'stats',
    label: 'Stats — Key Thresholds',
    color: '#007C89',
    blocks: [
      {
        title: 'Standard thresholds',
        code:
`α (significance level)  = 0.05  (two-tailed)
Power (1 − β)           = 0.80  standard  |  0.90 high-stakes
p-value < α             → reject null (statistically significant)
p-value ≥ α             → fail to reject null (not significant)

Effect size matters independently of p-value.
A tiny p-value with no practical effect is noise at scale.`,
      },
      {
        title: 'MDE & sample size intuition',
        code:
`MDE = minimum effect size the test can reliably detect
    = function of: baseline rate, variance, α, power, n

Larger n     → can detect smaller effects
Higher power → larger n required
Two-sided    → larger n than one-sided (use two-sided by default)

Rule of thumb: to detect a 5% lift on a 20% baseline CVR
at 80% power → ~3,800 users per arm (rough)`,
      },
      {
        title: 'Multiple testing corrections',
        code:
`Bonferroni:  α_adjusted = α / m          (conservative, m = # tests)
BH (FDR):    controls false discovery rate (less conservative, preferred)

When to apply: testing multiple metrics, multiple segments,
               multiple variants simultaneously.

Never: "we'll correct if we find significance"
       That's p-hacking.`,
      },
      {
        title: 'CUPED one-liner',
        code:
`Y_cuped = Y - θ(X - X̄)
  Y = outcome metric
  X = pre-experiment covariate (same metric, pre-period)
  θ = Cov(Y,X) / Var(X)

Reduces variance → smaller required n for same power.
Works because pre-period behavior predicts post-period behavior.`,
      },
    ],
  },
  {
    id: 'metrics',
    label: 'Metrics — Decomposition Templates',
    color: '#C97706',
    blocks: [
      {
        title: 'Standard decompositions',
        code:
`Revenue     = Users × CVR × AOV
DAU         = New + Retained + Resurrected
Checkout CVR = Visitors → PDP → ATC → Checkout → Payment
Retention   = (End − New) / Start
Churn rate  = Lost / Start  (use START as denominator, not end)
ARPU        = Revenue / Users  (watch: avg of averages trap)`,
      },
      {
        title: 'North star vs guardrail',
        code:
`North star  — captures long-term value delivered to users
              (should move when product is healthy)
Guardrail   — floors you must not breach
              (latency, error rate, revenue, trust metrics)
Diagnostic  — explains WHY north star moved
              (leading indicators, segment breakdowns)

Goodhart's Law: when a measure becomes a target,
it ceases to be a good measure.`,
      },
      {
        title: 'Ratio metric trap',
        code:
`CVR = conversions / visitors

If visitors ↓ but conversions ↓ less → CVR looks great
But absolute conversions dropped. Both matter.

Always report numerator + denominator separately.
Never report a ratio without the components.`,
      },
      {
        title: 'Simpson\'s Paradox reminder',
        code:
`Aggregate trend ≠ trend within each group.
Classic: CVR up overall, but down in every segment.
Cause: mix shift — higher-CVR segment grew as % of traffic.

Always: segment before concluding.
        "Overall looks fine" is not an RCA.`,
      },
    ],
  },
  {
    id: 'rca',
    label: 'RCA — First-Cut Checklist',
    color: '#D63860',
    blocks: [
      {
        title: 'Routing gate (do this before analysis)',
        code:
`1. Data issue?
   → logging gap, pipeline delay, dashboard bug, definition change
   → check: is raw count consistent with source system?

2. Internal change?
   → recent deploy, config change, experiment, pricing change
   → check: timing correlation with release calendar

3. External?
   → seasonality, competitor action, market event, outage
   → check: does competitor/external metric move too?

4. Then: segment
   → platform (iOS/Android/Web), geo, user cohort, feature, channel`,
      },
      {
        title: 'Segmentation priority order',
        code:
`1. Platform / device       (often isolates quickly)
2. Geography               (regional outage, pricing)
3. User cohort             (new vs. returning, acquisition channel)
4. Feature / surface       (specific page, flow, or entry point)
5. Time of day / day of week  (if sudden onset)

Ask: "what went UP when this went DOWN?"
     That's your strongest diagnostic.`,
      },
      {
        title: 'Never say in an interview',
        code:
`❌ "I would look at the data"
   → Everyone would look at the data. Name WHAT data and WHY.

❌ "It could be many things"
   → Show a hypothesis tree. Prioritise by impact × likelihood.

❌ "We need more information"
   → State what you'd ask for, and what it would tell you.

✓ "My first hypothesis is X because Y.
   I'd test it by checking Z.
   If Z shows [expected pattern], it confirms X."`,
      },
    ],
  },
  {
    id: 'experimentation',
    label: 'Experimentation — Quick Reference',
    color: '#2457D6',
    blocks: [
      {
        title: 'Pre-experiment checklist',
        code:
`□ Hypothesis stated (directional + magnitude)
□ Primary metric defined (1 metric — not 3)
□ Guardrail metrics listed
□ MDE calculated (is it detectable?)
□ Sample size calculated
□ Assignment unit matches analysis unit (SUTVA)
□ Randomisation method (user-level vs session-level)
□ Duration accounts for novelty effect + weekly cycles`,
      },
      {
        title: 'SRM — Sample Ratio Mismatch',
        code:
`Expected split: 50/50
Observed:       52/48  → p < 0.01 on χ² test → SRM

Causes: client-side assignment with cookie deletion,
        bot traffic filtered asymmetrically,
        redirect errors, logging gaps.

Action: do NOT read results. Fix the plumbing first.`,
      },
      {
        title: 'Ship / No-Ship decision framework',
        code:
`Ship if:
  primary metric ↑ statistically significant
  AND guardrails not breached
  AND effect size is practically meaningful

No-ship if:
  primary metric flat/negative
  OR any guardrail breached (even if primary looks good)
  OR SRM detected

Dig deeper if:
  primary metric flat but positive signal in key segment
  OR experiment too underpowered (ran too short)
  OR novelty effect suspected (check cohort curves)`,
      },
      {
        title: 'SUTVA & interference',
        code:
`SUTVA: treatment of unit A must not affect unit B's outcome.

Violated when:
  → social features (user A sees content from user B)
  → marketplace (supply/demand effects)
  → shared resources (performance, inventory)

Fix: cluster-level randomisation, switchback experiments,
     or hold-out groups.`,
      },
    ],
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────

const S = {
  page: {
    padding: '1.5rem 1rem 4rem',
    maxWidth: 780,
    margin: '0 auto',
    fontFamily: 'var(--font-ui)',
  },
  header: {
    marginBottom: '1.75rem',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.01em',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  sectionToggle: {
    display: 'flex',
    gap: '0.25rem',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '0.2rem',
    marginBottom: '1.5rem',
    width: 'fit-content',
  },
  toggleBtn: (active) => ({
    padding: '0.45rem 1.1rem',
    border: 'none',
    borderRadius: 'calc(var(--radius-md) - 2px)',
    fontSize: '0.82rem',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)',
    transition: 'all 0.15s',
  }),
  // Prep plan tabs
  planTabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
    marginBottom: '1.25rem',
  },
  planTab: (active, color) => ({
    padding: '0.65rem 0.5rem',
    border: `1px solid ${active ? color : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)',
    background: active ? color + '12' : 'var(--surface)',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s',
  }),
  planTabLabel: (active, color) => ({
    fontSize: '0.82rem',
    fontWeight: active ? 700 : 500,
    color: active ? color : 'var(--text)',
    display: 'block',
    marginBottom: '0.1rem',
  }),
  planTabSub: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  },
  planCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  },
  planIntent: (color) => ({
    background: color + '10',
    borderBottom: `1px solid ${color}30`,
    padding: '0.75rem 1rem',
    fontSize: '0.82rem',
    color: 'var(--text)',
    fontStyle: 'italic',
  }),
  planStep: (isLast) => ({
    padding: '0.85rem 1rem',
    borderBottom: isLast ? 'none' : '1px solid var(--border)',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
  }),
  stepNum: (color) => ({
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: color + '15',
    color: color,
    fontSize: '0.7rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  }),
  stepLabel: {
    fontSize: '0.88rem',
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: '0.2rem',
  },
  stepDetail: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  // Cheat sheet
  cheatGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  cheatSection: (open, color) => ({
    background: 'var(--surface)',
    border: `1px solid ${open ? color + '50' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    transition: 'border-color 0.15s',
  }),
  cheatHeader: (color) => ({
    padding: '0.85rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none',
  }),
  cheatHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  cheatDot: (color) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  }),
  cheatLabel: {
    fontSize: '0.88rem',
    fontWeight: 600,
    color: 'var(--text)',
  },
  cheatChevron: (open) => ({
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s',
  }),
  cheatBody: {
    borderTop: '1px solid var(--border)',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  blockTitle: {
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
    marginBottom: '0.4rem',
  },
  codeBlock: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '0.75rem 0.85rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.78rem',
    color: 'var(--text)',
    lineHeight: 1.65,
    whiteSpace: 'pre',
    overflowX: 'auto',
    margin: 0,
  },
};

// ─── Components ────────────────────────────────────────────────────────────

function PrepPlans({ onNavigate }) {
  const [activePlan, setActivePlan] = useState('week');
  const plan = PREP_PLANS.find(p => p.id === activePlan);

  return (
    <>
      <div style={S.planTabs}>
        {PREP_PLANS.map(p => (
          <div
            key={p.id}
            style={S.planTab(activePlan === p.id, p.color)}
            onClick={() => setActivePlan(p.id)}
          >
            <span style={S.planTabLabel(activePlan === p.id, p.color)}>{p.label}</span>
            <span style={S.planTabSub}>{p.sublabel}</span>
          </div>
        ))}
      </div>

      <div style={S.planCard}>
        <div style={S.planIntent(plan.color)}>{plan.intent}</div>
        {plan.steps.map((step, i) => (
          <div key={i} style={S.planStep(i === plan.steps.length - 1)}>
            <div style={S.stepNum(plan.color)}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={S.stepLabel}>{step.label}</div>
                {step.room && onNavigate && (
                  <button
                    onClick={() => onNavigate(step.room)}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem',
                      border: `1px solid ${plan.color}40`,
                      borderRadius: 4,
                      background: plan.color + '10',
                      color: plan.color,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    Open →
                  </button>
                )}
              </div>
              <div style={S.stepDetail}>{step.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function QuickReference() {
  const [openSections, setOpenSections] = useState({ 'sql-datetime': true });

  const toggle = (id) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={S.cheatGrid}>
      {CHEAT_SECTIONS.map(section => {
        const open = !!openSections[section.id];
        return (
          <div key={section.id} style={S.cheatSection(open, section.color)}>
            <div style={S.cheatHeader(section.color)} onClick={() => toggle(section.id)}>
              <div style={S.cheatHeaderLeft}>
                <div style={S.cheatDot(section.color)} />
                <span style={S.cheatLabel}>{section.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                <AddTrackBtn itemType='cheatsheet' itemId={section.id} label={section.label} />
              </div>
              <span style={S.cheatChevron(open)}>▼</span>
            </div>
            {open && (
              <div style={S.cheatBody}>
                {section.blocks.map((block, i) => (
                  <div key={i}>
                    <div style={S.blockTitle}>{block.title}</div>
                    <pre style={S.codeBlock}>{block.code}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

export function CheatSheet({ onNavigate, initialSection, onOpenSection }) {
  const [section, setSection] = useState(initialSection || 'plans');
  // Switch section AND report it up so the URL hash is deep-linkable (#/cheatsheet/<section>).
  const selectSection = (s) => { setSection(s); if (onOpenSection) onOpenSection(s); };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={S.title}>Interview Prep</div>
        <div style={S.subtitle}>Time-boxed plans + last-minute quick reference</div>
      </div>

      <div style={S.sectionToggle}>
        <button style={S.toggleBtn(section === 'plans')}   onClick={() => selectSection('plans')}>Prep Plans</button>
        <button style={S.toggleBtn(section === 'ref')}     onClick={() => selectSection('ref')}>Quick Reference</button>
      </div>

      {section === 'plans' && <PrepPlans onNavigate={onNavigate} />}
      {section === 'ref'   && <QuickReference />}
    </div>
  );
}

export default CheatSheet;
